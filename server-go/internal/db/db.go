package db

import (
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"meanwhile-server-go/internal/models"
)

var initialLeaderboard = []models.LeaderboardEntry{
	{Rank: 1, ID: "u_apex", Username: "ApexPredator", Avatar: "🏎️", BestWPM: 154, AverageWPM: 142, Wins: 289, Races: 340, Level: 52, RankTier: "Grandmaster"},
	{Rank: 2, ID: "u_valkyrie", Username: "Valkyrie_99", Avatar: "⚡", BestWPM: 148, AverageWPM: 136, Wins: 245, Races: 310, Level: 48, RankTier: "Master"},
	{Rank: 3, ID: "u_nitro", Username: "NitroShift", Avatar: "🔥", BestWPM: 142, AverageWPM: 131, Wins: 210, Races: 280, Level: 44, RankTier: "Master"},
	{Rank: 4, ID: "u_cipher", Username: "CipherDrift", Avatar: "🏍️", BestWPM: 135, AverageWPM: 125, Wins: 185, Races: 250, Level: 39, RankTier: "Diamond"},
	{Rank: 5, ID: "u_ghost", Username: "GhostRacer", Avatar: "👻", BestWPM: 128, AverageWPM: 119, Wins: 150, Races: 215, Level: 35, RankTier: "Diamond"},
	{Rank: 6, ID: "u_zenith", Username: "ZenithTurbo", Avatar: "🌌", BestWPM: 122, AverageWPM: 114, Wins: 130, Races: 190, Level: 31, RankTier: "Platinum"},
	{Rank: 7, ID: "u_pulse", Username: "PulseRider", Avatar: "🎯", BestWPM: 118, AverageWPM: 108, Wins: 95, Races: 160, Level: 27, RankTier: "Platinum"},
	{Rank: 8, ID: "u_ronin", Username: "RoninSpeed", Avatar: "⚔️", BestWPM: 112, AverageWPM: 102, Wins: 78, Races: 140, Level: 24, RankTier: "Gold"},
	{Rank: 9, ID: "u_torque", Username: "TorqueVector", Avatar: "⚙️", BestWPM: 105, AverageWPM: 97, Wins: 62, Races: 120, Level: 20, RankTier: "Gold"},
	{Rank: 10, ID: "u_monaco", Username: "MonacoAce", Avatar: "👑", BestWPM: 98, AverageWPM: 91, Wins: 45, Races: 95, Level: 16, RankTier: "Silver"},
}

type Database struct {
	mu              sync.RWMutex
	dataDir         string
	profilesFile    string
	leaderboardFile string
	profiles        map[string]*models.UserProfile
	leaderboard     []models.LeaderboardEntry
	pg              *PostgresDB
}

func NewDatabase(dataDir string) *Database {
	if dataDir == "" {
		dataDir = "data"
	}
	_ = os.MkdirAll(dataDir, 0755)

	pg := ConnectPostgres()

	db := &Database{
		dataDir:         dataDir,
		profilesFile:    filepath.Join(dataDir, "profiles.json"),
		leaderboardFile: filepath.Join(dataDir, "leaderboard.json"),
		profiles:        make(map[string]*models.UserProfile),
		leaderboard:     make([]models.LeaderboardEntry, 0),
		pg:              pg,
	}

	db.load()
	return db
}

func (d *Database) load() {
	d.mu.Lock()
	defer d.mu.Unlock()

	// Load profiles
	if data, err := os.ReadFile(d.profilesFile); err == nil {
		var profs map[string]*models.UserProfile
		if err := json.Unmarshal(data, &profs); err == nil {
			d.profiles = profs
		}
	}

	// Load leaderboard
	if data, err := os.ReadFile(d.leaderboardFile); err == nil {
		var board []models.LeaderboardEntry
		if err := json.Unmarshal(data, &board); err == nil && len(board) > 0 {
			d.leaderboard = board
			return
		}
	}

	// Default fallback leaderboard
	d.leaderboard = make([]models.LeaderboardEntry, len(initialLeaderboard))
	copy(d.leaderboard, initialLeaderboard)
	d.saveLeaderboardLocked()
}

func (d *Database) saveProfilesLocked() {
	data, err := json.MarshalIndent(d.profiles, "", "  ")
	if err == nil {
		_ = os.WriteFile(d.profilesFile, data, 0644)
	}
}

func (d *Database) saveLeaderboardLocked() {
	data, err := json.MarshalIndent(d.leaderboard, "", "  ")
	if err == nil {
		_ = os.WriteFile(d.leaderboardFile, data, 0644)
	}
}

func (d *Database) GetProfile(id, defaultUsername, defaultAvatar string) *models.UserProfile {
	d.mu.Lock()
	defer d.mu.Unlock()

	if prof, exists := d.profiles[id]; exists {
		return prof
	}

	username := defaultUsername
	if username == "" {
		short := id
		if len(short) > 5 {
			short = short[:5]
		}
		username = fmt.Sprintf("Racer_%s", short)
	}
	avatar := defaultAvatar
	if avatar == "" {
		avatar = "🏎️"
	}

	newProf := &models.UserProfile{
		ID:              id,
		Username:        username,
		Avatar:          avatar,
		Level:           1,
		XP:              0,
		NextLevelXP:     500,
		RankTier:        "Bronze",
		TotalRaces:      0,
		Wins:            0,
		Podiums:         0,
		BestWPM:         0,
		AverageWPM:      0,
		AverageAccuracy: 100,
		FavoriteVehicle: "cyber-gt",
		FavoriteTrack:   "tokyo",
		RecentRaces:     make([]models.RaceResultHistory, 0),
	}

	d.profiles[id] = newProf
	d.saveProfilesLocked()
	return newProf
}

type RecordRaceParams struct {
	TrackID     string `json:"trackId"`
	VehicleID   string `json:"vehicleId"`
	Placement   int    `json:"placement"`
	TotalRacers int    `json:"totalRacers"`
	WPM         int    `json:"wpm"`
	Accuracy    int    `json:"accuracy"`
	TimeMs      int64  `json:"timeMs"`
}

type RecordRaceResult struct {
	Profile   *models.UserProfile `json:"profile"`
	XPEarned  int                 `json:"xpEarned"`
	LeveledUp bool                `json:"leveledUp"`
}

func (d *Database) RecordRaceResult(userId string, result RecordRaceParams) RecordRaceResult {
	d.mu.Lock()
	defer d.mu.Unlock()

	profile, exists := d.profiles[userId]
	if !exists {
		short := userId
		if len(short) > 5 {
			short = short[:5]
		}
		profile = &models.UserProfile{
			ID:              userId,
			Username:        fmt.Sprintf("Racer_%s", short),
			Avatar:          "🏎️",
			Level:           1,
			XP:              0,
			NextLevelXP:     500,
			RankTier:        "Bronze",
			FavoriteVehicle: "cyber-gt",
			FavoriteTrack:   "tokyo",
			RecentRaces:     make([]models.RaceResultHistory, 0),
		}
		d.profiles[userId] = profile
	}

	// Calculate XP
	xpEarned := int(math.Round(float64(result.WPM)*2.0 + float64(result.Accuracy)/2.0))
	switch result.Placement {
	case 1:
		xpEarned += 200
	case 2:
		xpEarned += 120
	case 3:
		xpEarned += 75
	default:
		xpEarned += 40
	}

	leveledUp := false
	profile.XP += xpEarned
	for profile.XP >= profile.NextLevelXP {
		profile.XP -= profile.NextLevelXP
		profile.Level += 1
		profile.NextLevelXP = int(math.Round(float64(profile.NextLevelXP) * 1.25))
		leveledUp = true
	}

	// Update Rank Tier
	if profile.BestWPM >= 140 {
		profile.RankTier = "Grandmaster"
	} else if profile.BestWPM >= 120 {
		profile.RankTier = "Master"
	} else if profile.BestWPM >= 100 {
		profile.RankTier = "Diamond"
	} else if profile.BestWPM >= 80 {
		profile.RankTier = "Platinum"
	} else if profile.BestWPM >= 60 {
		profile.RankTier = "Gold"
	} else if profile.BestWPM >= 40 {
		profile.RankTier = "Silver"
	} else {
		profile.RankTier = "Bronze"
	}

	// Update running stats
	profile.TotalRaces += 1
	if result.Placement == 1 {
		profile.Wins += 1
	}
	if result.Placement <= 3 {
		profile.Podiums += 1
	}
	if result.WPM > profile.BestWPM {
		profile.BestWPM = result.WPM
	}

	// Running averages
	profile.AverageWPM = int(math.Round(float64(profile.AverageWPM*(profile.TotalRaces-1)+result.WPM) / float64(profile.TotalRaces)))
	profile.AverageAccuracy = int(math.Round(float64(profile.AverageAccuracy*(profile.TotalRaces-1)+result.Accuracy) / float64(profile.TotalRaces)))

	historyItem := models.RaceResultHistory{
		ID:          fmt.Sprintf("race_%d_%s", time.Now().UnixMilli(), randomShortString(4)),
		Date:        time.Now().UTC().Format(time.RFC3339),
		TrackID:     result.TrackID,
		VehicleID:   result.VehicleID,
		Placement:   result.Placement,
		TotalRacers: result.TotalRacers,
		WPM:         result.WPM,
		Accuracy:    result.Accuracy,
		TimeMs:      result.TimeMs,
		XPGained:    xpEarned,
	}

	profile.RecentRaces = append([]models.RaceResultHistory{historyItem}, profile.RecentRaces...)
	if len(profile.RecentRaces) > 20 {
		profile.RecentRaces = profile.RecentRaces[:20]
	}

	d.saveProfilesLocked()
	d.updateLeaderboardEntryLocked(profile)

	// Persist to PostgreSQL if configured
	if d.pg != nil {
		go func(rID, uID, cID, vID string, pos int, tMs int64, wpm, acc, errs, xp int) {
			if err := d.pg.SaveCompletedRace(rID, uID, cID, vID, pos, tMs, wpm, acc, errs, xp); err != nil {
				fmt.Printf("[DB] Note: PostgreSQL race persistence error: %v\n", err)
			}
		}(historyItem.ID, userId, result.TrackID, result.VehicleID, result.Placement, result.TimeMs, result.WPM, result.Accuracy, 0, xpEarned)
	}

	return RecordRaceResult{
		Profile:   profile,
		XPEarned:  xpEarned,
		LeveledUp: leveledUp,
	}
}

func (d *Database) updateLeaderboardEntryLocked(profile *models.UserProfile) {
	existingIdx := -1
	for i, entry := range d.leaderboard {
		if entry.ID == profile.ID {
			existingIdx = i
			break
		}
	}

	entry := models.LeaderboardEntry{
		ID:         profile.ID,
		Username:   profile.Username,
		Avatar:     profile.Avatar,
		BestWPM:    profile.BestWPM,
		AverageWPM: profile.AverageWPM,
		Wins:       profile.Wins,
		Races:      profile.TotalRaces,
		Level:      profile.Level,
		RankTier:   profile.RankTier,
	}

	if existingIdx >= 0 {
		d.leaderboard[existingIdx] = entry
	} else {
		d.leaderboard = append(d.leaderboard, entry)
	}

	sort.Slice(d.leaderboard, func(i, j int) bool {
		if d.leaderboard[i].BestWPM == d.leaderboard[j].BestWPM {
			return d.leaderboard[i].Wins > d.leaderboard[j].Wins
		}
		return d.leaderboard[i].BestWPM > d.leaderboard[j].BestWPM
	})

	for i := range d.leaderboard {
		d.leaderboard[i].Rank = i + 1
	}

	d.saveLeaderboardLocked()
}

func (d *Database) GetLeaderboard(limit int) []models.LeaderboardEntry {
	// If PostgreSQL is active, prefer PostgreSQL leaderboard query
	if d.pg != nil {
		if pgEntries, err := d.pg.GetLeaderboard(limit); err == nil && len(pgEntries) > 0 {
			return pgEntries
		}
	}

	d.mu.RLock()
	defer d.mu.RUnlock()

	if limit <= 0 || limit > len(d.leaderboard) {
		limit = len(d.leaderboard)
	}
	res := make([]models.LeaderboardEntry, limit)
	copy(res, d.leaderboard[:limit])
	return res
}

func (d *Database) UpdateProfileSettings(id string, updates map[string]any) *models.UserProfile {
	d.mu.Lock()
	defer d.mu.Unlock()

	profile, exists := d.profiles[id]
	if !exists {
		return nil
	}

	if username, ok := updates["username"].(string); ok && username != "" {
		if len(username) > 24 {
			username = username[:24]
		}
		profile.Username = username
	}
	if avatar, ok := updates["avatar"].(string); ok && avatar != "" {
		profile.Avatar = avatar
	}
	if favVeh, ok := updates["favoriteVehicle"].(string); ok && favVeh != "" {
		profile.FavoriteVehicle = favVeh
	}
	if favTrack, ok := updates["favoriteTrack"].(string); ok && favTrack != "" {
		profile.FavoriteTrack = favTrack
	}

	d.saveProfilesLocked()
	d.updateLeaderboardEntryLocked(profile)
	return profile
}

func randomShortString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
