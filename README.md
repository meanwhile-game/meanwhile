# VELOCE — 3D Multiplayer Typing Racing Game

**Veloce** is a competitive, real-time multiplayer 3D typing racing platform built with React, Three.js, and an authoritative Node.js/Socket.IO game server.

Players pilot high-performance supercars and motorcycles through immersive 3D circuits where validated keystroke velocity directly dictates engine acceleration, chassis tilt, and race progress.

---

## 🏎️ Core Systems

- **Authoritative Multiplayer**:
  - Server-authoritative race clock, countdown synchronization, and keystroke validation.
  - Public matchmaking queue (2-6 racers) with automatic bot fill fallback so you're never stuck waiting.
  - Private lobby creation with 6-character room codes and shareable invitation links.
  - Solo practice mode with configurable AI bot difficulties (Rookie 45-55 WPM, Veteran 65-75 WPM, Cyber Legend 85-105 WPM).
- **Real-Time 3D Racing**:
  - Three.js procedural tracks with 4 high-speed lanes, rumble strips, Armco barriers, overhead starting gantry with 5 F1 countdown lights, and finish arches.
  - 3 Themed Global Circuits:
    - **Tokyo Night Run**: Elevated neon expressway, skyscrapers with illuminated halos, cyber street lamps.
    - **Swiss Alpine Pass**: Mountain ascent with pine tree forests, granite peaks, and sharp chicanes.
    - **Dubai Grand Circuit**: Coastal desert sprint with golden dunes and illuminated architectural archways.
  - Chase camera with dynamic speed FOV expansion and subtle micro-vibration over 85 WPM.
- **Vehicles & 3D Garage**:
  - **Cyber GT-R**: Twin-turbo hybrid supercar with aggressive aero splitters, rear wing, and custom underglow.
  - **Apex Hyperion**: Le Mans prototype hypercar with dorsal shark fin, bubble canopy, and Le Mans vertical blades.
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
