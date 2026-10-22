package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"

	"meanwhile-server-go/internal/models"
)

type PostgresDB struct {
	db *sql.DB
}

// ConnectPostgres attempts to connect to PostgreSQL using DATABASE_URL or standard env vars.
// Returns nil if PostgreSQL is not configured or cannot be reached.
func ConnectPostgres() *PostgresDB {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		host := os.Getenv("POSTGRES_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("POSTGRES_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("POSTGRES_USER")
		if user == "" {
			user = "postgres"
		}
		password := os.Getenv("POSTGRES_PASSWORD")
		if password == "" {
			password = "postgres"
		}
		dbname := os.Getenv("POSTGRES_DB")
		if dbname == "" {
			dbname = "meanwhile"
		}
		sslmode := os.Getenv("POSTGRES_SSLMODE")
		if sslmode == "" {
			sslmode = "disable"
		}

		connStr = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s connect_timeout=3",
			host, port, user, password, dbname, sslmode)
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("[DB] PostgreSQL driver init failed: %v", err)
		return nil
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Quick ping check with 2-second timeout
	ctxTimeout := 2 * time.Second
	timer := time.NewTimer(ctxTimeout)
	defer timer.Stop()

	pingDone := make(chan error, 1)
	go func() {
		pingDone <- db.Ping()
	}()

	select {
	case err := <-pingDone:
		if err != nil {
			log.Printf("[DB] PostgreSQL ping unreachable: %v. Running in in-memory fallback mode.", err)
			_ = db.Close()
			return nil
		}
	case <-timer.C:
		log.Printf("[DB] PostgreSQL ping timed out. Running in in-memory fallback mode.")
		_ = db.Close()
		return nil
	}

	log.Printf("[DB] Successfully connected to PostgreSQL database!")
	pg := &PostgresDB{db: db}
	pg.ensureSchema()
	return pg
}

// ensureSchema creates the necessary tables if they don't already exist.
func (p *PostgresDB) ensureSchema() {
	schemaQueries := `
	CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(64) PRIMARY KEY,
		username VARCHAR(64) UNIQUE NOT NULL,
		email VARCHAR(128) UNIQUE,
		password_hash VARCHAR(255),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS circuits (
		id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		location VARCHAR(128) NOT NULL,
		circuit_type VARCHAR(64) NOT NULL,
		configuration JSONB NOT NULL DEFAULT '{}'
	);

	CREATE TABLE IF NOT EXISTS vehicles (
		id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(128) NOT NULL,
		vehicle_type VARCHAR(64) NOT NULL,
		metadata JSONB NOT NULL DEFAULT '{}'
	);

	CREATE TABLE IF NOT EXISTS player_stats (
		user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		total_races INT DEFAULT 0,
		wins INT DEFAULT 0,
		best_wpm INT DEFAULT 0,
		average_wpm INT DEFAULT 0,
		average_accuracy INT DEFAULT 100,
		total_xp INT DEFAULT 0,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS race_results (
		id VARCHAR(64) PRIMARY KEY,
		user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
		circuit_id VARCHAR(64) REFERENCES circuits(id) ON DELETE SET NULL,
		vehicle_id VARCHAR(64) REFERENCES vehicles(id) ON DELETE SET NULL,
		finish_position INT NOT NULL,
		race_time_ms BIGINT NOT NULL,
		wpm INT NOT NULL,
		accuracy INT NOT NULL,
		errors INT DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_race_results_user ON race_results(user_id);
	CREATE INDEX IF NOT EXISTS idx_race_results_circuit ON race_results(circuit_id);
	CREATE INDEX IF NOT EXISTS idx_race_results_created ON race_results(created_at DESC);
	CREATE INDEX IF NOT EXISTS idx_player_stats_wpm ON player_stats(best_wpm DESC);
	CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON player_stats(wins DESC);
	`

	if _, err := p.db.Exec(schemaQueries); err != nil {
		log.Printf("[DB] Warning: PostgreSQL schema verification error: %v", err)
	} else {
		log.Printf("[DB] PostgreSQL schema verified (5 tables: users, circuits, vehicles, player_stats, race_results).")
	}
}

// HashPassword hashes a raw password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash compares a raw password against a bcrypt hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// UpsertUser saves or updates a user in PostgreSQL
func (p *PostgresDB) UpsertUser(id, username, email, rawPassword string) error {
	var hashStr *string
	if rawPassword != "" {
		h, err := HashPassword(rawPassword)
		if err == nil {
			hashStr = &h
		}
	}

	query := `
	INSERT INTO users (id, username, email, password_hash)
	VALUES ($1, $2, $3, $4)
	ON CONFLICT (id) DO UPDATE SET
		username = EXCLUDED.username,
		email = COALESCE(EXCLUDED.email, users.email),
		password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash);
	`
	_, err := p.db.Exec(query, id, username, email, hashStr)
	return err
}

// SaveCompletedRace persists a completed race result and atomically updates player_stats.
func (p *PostgresDB) SaveCompletedRace(raceID, userID, circuitID, vehicleID string, position int, timeMs int64, wpm int, accuracy int, errors int, xpGained int) error {
	tx, err := p.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Ensure user exists in users table
	userCheckQuery := `
	INSERT INTO users (id, username)
	VALUES ($1, $2)
	ON CONFLICT (id) DO NOTHING;
	`
	if _, err := tx.Exec(userCheckQuery, userID, fmt.Sprintf("Racer_%s", userID[:min(len(userID), 6)])); err != nil {
		log.Printf("[DB] Error ensuring user: %v", err)
	}

	// 2. Insert into race_results
	raceInsertQuery := `
	INSERT INTO race_results (id, user_id, circuit_id, vehicle_id, finish_position, race_time_ms, wpm, accuracy, errors)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
	`
	if _, err := tx.Exec(raceInsertQuery, raceID, userID, circuitID, vehicleID, position, timeMs, wpm, accuracy, errors); err != nil {
		return fmt.Errorf("failed to insert race_result: %w", err)
	}

	// 3. Upsert into player_stats
	isWin := 0
	if position == 1 {
		isWin = 1
	}

	statsUpsertQuery := `
	INSERT INTO player_stats (user_id, total_races, wins, best_wpm, average_wpm, average_accuracy, total_xp, updated_at)
	VALUES ($1, 1, $2, $3, $3, $4, $5, CURRENT_TIMESTAMP)
	ON CONFLICT (user_id) DO UPDATE SET
		total_races = player_stats.total_races + 1,
		wins = player_stats.wins + $2,
		best_wpm = GREATEST(player_stats.best_wpm, $3),
		average_wpm = (player_stats.average_wpm * player_stats.total_races + $3) / (player_stats.total_races + 1),
		average_accuracy = (player_stats.average_accuracy * player_stats.total_races + $4) / (player_stats.total_races + 1),
		total_xp = player_stats.total_xp + $5,
		updated_at = CURRENT_TIMESTAMP;
	`
	if _, err := tx.Exec(statsUpsertQuery, userID, isWin, wpm, accuracy, xpGained); err != nil {
		return fmt.Errorf("failed to upsert player_stats: %w", err)
	}

	return tx.Commit()
}

// GetLeaderboard retrieves the top ranked players from PostgreSQL player_stats
func (p *PostgresDB) GetLeaderboard(limit int) ([]models.LeaderboardEntry, error) {
	if limit <= 0 {
		limit = 50
	}

	query := `
	SELECT 
		u.id, 
		u.username, 
		ps.best_wpm, 
		ps.average_wpm, 
		ps.wins, 
		ps.total_races, 
		ps.total_xp
	FROM player_stats ps
	JOIN users u ON ps.user_id = u.id
	ORDER BY ps.best_wpm DESC, ps.wins DESC
	LIMIT $1;
	`

	rows, err := p.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := make([]models.LeaderboardEntry, 0)
	rank := 1

	for rows.Next() {
		var id, username string
		var bestWpm, avgWpm, wins, totalRaces, totalXp int

		if err := rows.Scan(&id, &username, &bestWpm, &avgWpm, &wins, &totalRaces, &totalXp); err != nil {
			continue
		}

		level := int(totalXp/500) + 1
		tier := "Bronze"
		if bestWpm >= 140 {
			tier = "Grandmaster"
		} else if bestWpm >= 120 {
			tier = "Master"
		} else if bestWpm >= 100 {
			tier = "Diamond"
		} else if bestWpm >= 80 {
			tier = "Platinum"
		} else if bestWpm >= 60 {
			tier = "Gold"
		} else if bestWpm >= 40 {
			tier = "Silver"
		}

		entries = append(entries, models.LeaderboardEntry{
			Rank:       rank,
			ID:         id,
			Username:   username,
			Avatar:     "🏎️",
			BestWPM:    bestWpm,
			AverageWPM: avgWpm,
			Wins:       wins,
			Races:      totalRaces,
			Level:      level,
			RankTier:   tier,
		})
		rank++
	}

	return entries, nil
}

// Close closes the underlying postgres connection
func (p *PostgresDB) Close() error {
	if p.db != nil {
		return p.db.Close()
	}
	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
