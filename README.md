# MEANWHILE — 3D Multiplayer Typing Racing Game

**Meanwhile** is a competitive, real-time multiplayer 3D typing racing platform built with React, Three.js, and an authoritative Node.js/Socket.IO game server.

Players pilot high-performance supercars and motorcycles through immersive 3D circuits where validated keystroke velocity directly dictates engine acceleration, chassis tilt, and race progress.

---

## 🏎️ Core Systems

- **Authoritative Multiplayer**:
  - Server-authoritative race clock, countdown synchronization, and keystroke validation.
  - Public matchmaking queue (2-6 racers) with automatic bot fill fallback so you're never stuck waiting.
  - Private lobby creation with 6-character room codes and shareable invitation links.
  - Solo practice mode with configurable AI bot difficulties (Rookie 45-55 WPM, Veteran 65-75 WPM, Cyber Legend 85-105 WPM).
- **Curated Literature, Music, & Essays with Provenance**:
  - Real authentic excerpts from Books (*The Great Gatsby*, *Dune*, *The Art of Racing in the Rain*, *Neuromancer*, *1984*, *The Fellowship of the Ring*, *Fahrenheit 451*).
  - Legendary songs (*Bohemian Rhapsody*, *Space Oddity*, *Harder, Better, Faster, Stronger*, *Fast Car*, *Comfortably Numb*).
  - Notable speeches & essays (*Pale Blue Dot*, *Stay Hungry, Stay Foolish*, *The Pleasure of Finding Things Out*, *The Cathedral and the Bazaar*, *We Choose to Go to the Moon*).
  - Post-race **Text Provenance & Attribution Card** detailing work title, author, year, category, and historical context.
- **Photorealistic 3D Racing**:
  - Three.js procedural tracks with supersonic corner banking, physical 3D raised FIA rumble strips, and tire skid marks in heavy braking zones.
  - 3 Themed Global Circuits:
    - **Tokyo Night Run**: Elevated expressway viaduct with concrete piers, bilingual route direction signs (*C1 都心環状線 SHUTO EXP*, *銀座 GINZA*, *渋谷 SHIBUYA*), high-rises with window grids, and red aviation beacons.
    - **Swiss Alpine Pass**: Continuous 3D mountain terrain valley, dense Norwegian spruce and Swiss pine forests, traditional timber chalets, and distance braking boards (150m, 100m, 50m).
    - **Dubai Grand Circuit**: Yas Marina-style turquoise and white runoff friction zones, steel lattice floodlight towers, covered grandstands with fabric canopies, and desert date palms.
  - Dynamic vehicle forward projection headlights and speed-adaptive chase camera with FOV expansion and high-speed micro-vibrations.
- **Vehicles & 3D Garage**:
  - **Cyber GT-R**: Twin-turbo hybrid supercar with aggressive aero splitters, rear wing, and custom underglow.
  - **Apex Hyperion**: Le Mans prototype hypercar with dorsal shark fin, bubble canopy, and vertical blades.
  - **Phantom Blade 1200**: Electric superbike with custom motorcycle lean physics through corners.
  - **Ronin Spec-V**: Iconic Japanese tuner coupe with carbon hood, quad round tail lights, and tuner exhaust cannon.
  - Interactive 3D Turntable Showroom with 360° orbit inspection and 7 custom aero paint swatches.
- **Synthesized Web Audio Engine**:
  - Dynamic engine revving pitch scaling in real time with your live typing WPM.
  - Mechanical keystroke clicks and typo buzz feedback.
  - 3-2-1 countdown sequence beeps and checkered flag victory fanfare.
- **Progression & Esports**:
  - Global Leaderboard with rank tiers (Grandmaster, Master, Diamond, Platinum, Gold, Silver, Bronze).
  - XP progression, level-ups, win-rate tracking, and personal best WPM telemetry.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v10+

### Running Locally

1. **Install Dependencies**:
```bash
# In the root folder:
npm install
cd server && npm install
cd ../client && npm install
```

2. **Start Both Server & Client**:
```bash
# Start backend server (port 4000)
cd server
npm run dev

# In another terminal, start client (port 5173)
cd client
npm run dev
```

3. Open **`http://localhost:5173`** in your browser to enter the grid!

---

## 📖 Architecture & Deployment Guide
For complete cloud topology, PostgreSQL schemas, Redis adapter scaling, anti-cheat security, Docker orchestration, and CI/CD pipelines, read the **[System Architecture & Production Deployment Specification](DEPLOYMENT_AND_ARCHITECTURE.md)**.

