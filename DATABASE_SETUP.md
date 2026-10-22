# Meanwhile — PostgreSQL Database Setup Guide

This guide explains how to initialize, configure, and verify the PostgreSQL database for **Meanwhile** (3D Multiplayer Typing Racing Game).

---

## 1. Overview & Architecture

Meanwhile utilizes a high-performance hybrid storage model:
- **Real-Time Live Race State:** Kept in-memory on the Go server (`internal/game/engine.go`) with sub-millisecond tick loops for zero input lag.
- **Persistent Data (PostgreSQL):** Registered pilots (`users`), aggregated career stats (`player_stats`), detailed telemetry history (`race_results`), circuit layouts (`circuits`), and vehicle specifications (`vehicles`).
- **Resilient Fallback:** If PostgreSQL is temporarily offline or unconfigured, the Go server automatically falls back to its thread-safe in-memory store so development and gameplay are never interrupted.

---

## 2. Running PostgreSQL

Choose either **Docker (Recommended)** or **Local Native Installation**.

### Option A: Using Docker (Fastest, 1 Command)
Run a dedicated PostgreSQL 16 container:

```bash
docker run --name meanwhile-postgres \
  -e POSTGRES_USER=meanwhile_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=meanwhile \
  -p 5432:5432 \
  -d postgres:16-alpine
```

To stop or restart the container:
```bash
docker stop meanwhile-postgres
docker start meanwhile-postgres
```

---

### Option B: Local Native PostgreSQL (Windows / macOS / Linux)

1. **Install PostgreSQL**:
   - **Windows:** Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) or via Chocolatey/Winget: `winget install PostgreSQL.PostgreSQL`
   - **macOS:** `brew install postgresql@16 && brew services start postgresql@16`
   - **Ubuntu/Debian:** `sudo apt-get install postgresql postgresql-contrib && sudo systemctl start postgresql`

2. **Create the Database and User via `psql`**:
   Open a terminal and connect as the default superuser:
   ```bash
   psql -U postgres
   ```

   Execute the following SQL commands:
   ```sql
   -- Create application database user
   CREATE USER meanwhile_user WITH ENCRYPTED PASSWORD 'your_secure_password';

   -- Create meanwhile database owned by meanwhile_user
   CREATE DATABASE meanwhile OWNER meanwhile_user;

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE meanwhile TO meanwhile_user;

   -- Exit psql
   \q
   ```

---

## 3. Environment Variables Configuration

In the `server-go/` directory (or root), create a `.env` file based on `.env.example`:

```bash
cp server-go/.env.example server-go/.env
```

Edit `server-go/.env` with your credentials:

```ini
PORT=4000

# PostgreSQL Connection String (Standard URL)
DATABASE_URL=postgres://meanwhile_user:your_secure_password@localhost:5432/meanwhile?sslmode=disable

# Or Individual Connection Parameters:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=meanwhile_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=meanwhile
POSTGRES_SSLMODE=disable
```

> **Security Note:** Never commit `.env` or production credentials to version control. The `.env` file is included in `.gitignore`.

---

## 4. Initializing the Database Schema

You can apply the schema using either `psql` or the Go server's auto-migration.

### Method A: Direct `psql` Schema Execution
Run the included `schema.sql` script against your database:

```bash
psql -h localhost -p 5432 -U meanwhile_user -d meanwhile -f server-go/schema.sql
```
*(Enter `your_secure_password` when prompted)*

### Method B: Automatic Migration via Go Server
The Go backend (`server-go/internal/db/postgres.go`) automatically checks for table existence upon startup and runs `CREATE TABLE IF NOT EXISTS` for all 5 core tables and indexes.

---

## 5. Database Schema Details

The database schema is structured into 5 clean, normalized tables:

| Table | Primary Key | Foreign Keys | Purpose |
|---|---|---|---|
| `users` | `id` (VARCHAR) | — | Pilot accounts, usernames, hashed passwords (`bcrypt`) |
| `player_stats` | `user_id` (VARCHAR) | `users(id)` ON DELETE CASCADE | Aggregated career stats: wins, best WPM, avg accuracy, total XP |
| `circuits` | `id` (VARCHAR) | — | Track layouts (Chennai, Hyderabad, Buddh, Tokyo, Monaco, etc.) |
| `vehicles` | `id` (VARCHAR) | — | Vehicle specs (Cyber GT-R, Apex Hyperion, Phantom Blade 1200, Ronin Spec-V) |
| `race_results` | `id` (VARCHAR) | `users(id)`, `circuits(id)`, `vehicles(id)` | Completed race telemetry: placement, race time ms, WPM, accuracy, errors |

### Indexes
- `idx_race_results_user` on `race_results(user_id)`
- `idx_race_results_circuit` on `race_results(circuit_id)`
- `idx_race_results_created` on `race_results(created_at DESC)`
- `idx_player_stats_wpm` on `player_stats(best_wpm DESC)`
- `idx_player_stats_wins` on `player_stats(wins DESC)`
- `idx_player_stats_xp` on `player_stats(total_xp DESC)`

---

## 6. Running the Application & Verifying Persistence

### Step 1: Start the Go Backend
```bash
cd server-go
go run ./cmd/server
```

You should see:
```log
2026/10/22 22:23:38 [DB] Successfully connected to PostgreSQL database!
2026/10/22 22:23:38 [DB] PostgreSQL schema verified (5 tables: users, circuits, vehicles, player_stats, race_results).
2026/10/22 22:23:38 ==================================================
2026/10/22 22:23:38 🏎️  MEANWHILE GO GAME SERVER
2026/10/22 22:23:38 ⚡  High-Performance Low-Latency Native WebSockets
2026/10/22 22:23:38 🌐  Listening on http://localhost:4000
2026/10/22 22:23:38 ==================================================
```

### Step 2: Start the Vite Frontend
In another terminal:
```bash
npm run dev
```

### Step 3: Verify Persistence
1. Open `http://localhost:5173/` in your browser.
2. Click **Race Now** or **Solo Practice**.
3. Complete a race by typing the full passage.
4. Inspect the database using `psql`:
   ```sql
   psql -h localhost -U meanwhile_user -d meanwhile -c "SELECT id, user_id, finish_position, wpm, accuracy, race_time_ms FROM race_results ORDER BY created_at DESC LIMIT 5;"
   ```
5. You will see your newly completed race recorded with accurate finish time, WPM, and accuracy!
