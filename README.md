# MEANWHILE — 3D Multiplayer Typing Racing Game

**Meanwhile** is a competitive, real-time multiplayer 3D typing racing platform built with React 19, Three.js, and a high-performance authoritative **Go (Golang)** game server communicating over low-latency native WebSockets.

Players pilot high-performance supercars and motorcycles through immersive 3D circuits where validated keystroke velocity directly dictates engine acceleration, chassis tilt, and race progress.

---

## 🏎️ Core Systems

- **High-Performance Go Authoritative Engine**:
  - Goroutine-backed 15 Hz tick loop and concurrent room manager with sub-millisecond execution latency.
  - Server-authoritative race clock, countdown synchronization, and real-time keystroke verification.
  - Public matchmaking queue (2-6 racers) with automatic bot fill fallback so you're never stuck waiting.
  - Solo practice mode with configurable AI bot difficulties (Rookie 45-55 WPM, Veteran 65-75 WPM, Cyber Legend 85-105 WPM).
- **Curated Literature, Music, & Essays with Provenance**:
  - Real authentic excerpts from Books (*The Great Gatsby*, *Dune*, *The Art of Racing in the Rain*, *Neuromancer*, *1984*, *The Fellowship of the Ring*, *Fahrenheit 451*).
  - Legendary songs (*Bohemian Rhapsody*, *Space Oddity*, *Harder, Better, Faster, Stronger*, *Fast Car*, *Comfortably Numb*).
  - Notable speeches & essays (*Pale Blue Dot*, *Stay Hungry, Stay Foolish*, *The Pleasure of Finding Things Out*, *The Cathedral and the Bazaar*, *We Choose to Go to the Moon*).
  - Post-race **Text Provenance & Attribution Card** detailing work title, author, year, category, and historical context.
- **Photorealistic 3D Racing & Grand Prix Circuits**:
  - Three.js procedural tracks with supersonic corner banking, physical 3D raised FIA rumble strips, and tire skid marks in heavy braking zones.
  - **🇮🇳 Indian Motorsport Initiative (3 Authentic Circuits)**:
    - **Chennai Marina Coast GP**: Coastal night track along the Bay of Bengal, rotating 3D Marina lighthouse beacon, illuminated Napier Bridge architectural arches, coastal palm trees, and bilingual Tamil/English expressway signage.
    - **Hyderabad Cyber Corridor GP**: Hyper-modern city circuit featuring the Durgam Cheruvu cable-stayed suspension bridge, glowing HITEC City skyscrapers, Charminar ceremonial monumental arches, and Telugu/English highway signage.
    - **Buddh International Circuit (BIC - Greater Noida)**: India's premier FIA Grade 1 venue, Tilke 1.06km parabolic back straight, banked Turn 10-11 bowl, covered stadium grandstands with tensile fabric canopies, F1 team pit garages, and DRS marker boards.
  - **🌍 World Grand Prix Destinations (5 Circuits)**:
    - **Tokyo Night Run**: Elevated expressway viaduct with concrete piers, bilingual route direction signs (*C1 都心環状線 SHUTO EXP*, *銀座 GINZA*, *渋谷 SHIBUYA*), high-rises with window grids, and red aviation beacons.
    - **Circuit de Monaco**: Glamorous Riviera street circuit along Port Hercules harbor, luxury yachts, Mediterranean palm trees, and famous armco barriers.
    - **Silverstone Arena GP**: Fast and flowing British GP circuit with Copse, Maggotts & Becketts S-curves, asphalt runoffs, and modern pit straight grandstands.
    - **Swiss Alpine Pass**: Continuous 3D mountain terrain valley, dense Norwegian spruce and Swiss pine forests, traditional timber chalets, and distance braking boards.
    - **Dubai Grand Circuit**: Yas Marina-style turquoise and white runoff friction zones, steel lattice floodlight towers, covered grandstands with fabric canopies, and desert dunes.
  - Dynamic vehicle forward projection headlights and speed-adaptive chase camera with dynamic FOV expansion (60° → 74°) and speed micro-vibrations.
- **Vehicles & 3D Garage**:
  - **Cyber GT-R**: Twin-turbo hybrid supercar with aggressive aero splitters, rear wing, and custom underglow.
  - **Apex Hyperion**: Le Mans prototype hypercar with dorsal shark fin, bubble canopy, and vertical blades.
  - **Phantom Blade 1200**: Electric superbike with custom 42° progressive cornering lean physics and counter-steering.
  - **Ronin Spec-V**: Iconic Japanese tuner coupe with carbon hood, quad round tail lights, and tuner exhaust cannon.
  - Interactive 3D Turntable Showroom with 360° orbit inspection, 7 custom aero paint swatches, and live telemetry spec bars.
- **Synthesized Web Audio Engine**:
  - Dynamic engine revving pitch scaling in real time with your live typing WPM.
  - Mechanical keystroke clicks and typo buzz feedback.
  - 3-2-1 countdown sequence beeps and checkered flag victory fanfare.
- **PostgreSQL Database & Progression**:
  - Clean 5-table normalized schema (`users`, `player_stats`, `race_results`, `circuits`, `vehicles`) with foreign keys, indexes, and bcrypt password hashing.
  - In-memory live race state on the Go server with asynchronous persistence to PostgreSQL for zero tick latency.
  - Seamless automatic fallback to in-memory/JSON store when PostgreSQL is unconfigured or offline.
  - Global Leaderboard with rank tiers (Grandmaster, Master, Diamond, Platinum, Gold, Silver, Bronze).
  - XP progression, level-ups, win-rate tracking, and personal best WPM telemetry.

---

## 🚀 Quick Start Guide

### Prerequisites
- Go v1.22+ (v1.27 installed)
- Node.js v18+ (tested on Node v22)
- npm v10+

### Running Locally

1. **Install Client Dependencies**:
```bash
# In the root folder:
npm install
cd client && npm install
```

2. **Start Both Server & Client**:
```bash
# Starts Go server and Vite client concurrently:
npm run dev
```

*Or start in separate terminals:*
```bash
# Terminal 1 - Start Go Backend (port 4000)
cd server-go
go run ./cmd/server

# Terminal 2 - Start Frontend Client (port 5173)
cd client
npm run dev
```

3. Open **`http://localhost:5173`** in your browser to enter the grid!

---

## 📖 Architecture & Database Guides
- **Database Setup & PostgreSQL Configuration**: Read **[DATABASE_SETUP.md](DATABASE_SETUP.md)** for local PostgreSQL, Docker run commands, schema initialization, and persistence verification.
- **Production Architecture & Deployment**: Read **[DEPLOYMENT_AND_ARCHITECTURE.md](DEPLOYMENT_AND_ARCHITECTURE.md)** for complete cloud topology, Go WebSockets, horizontal scaling, security, and CI/CD pipelines.

