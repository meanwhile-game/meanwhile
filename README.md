# meanwhile — 3D Multiplayer Typing Racing Platform

> *a little escape, in your meantime.*

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Free%20Tier-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**meanwhile** is a high-octane, minimalist 3D multiplayer typing racing platform. Players pilot precision sports cars across scenic highways, alpine switchbacks, glacier summits, and neon-slicked metropolises—where typing accuracy and cadence translate directly into engine RPM, speedometer velocity, dynamic gear shifts, and track overtaking.

---

## 🏁 Key Features

### 1. Accurate Typing-to-Velocity Simulation Engine
- **Active Typing Timing:** Typing clock begins on your first keystroke (`firstKeystrokeTime`), preventing reading pauses from dragging down your initial speed.
- **Continuous Cadence & Idle Decay:** If you pause or hesitate (> 450ms), your car smoothly decelerates and live WPM coasts down naturally, eliminating abrupt cliff drops.
- **Dynamic 6-Speed Transmission:** Speeds scale up to 300+ KM/H with responsive gear shifting (1st–6th) and speed-adaptive camera FOV.

### 2. 4 Active Grand Prix Circuits (Matching UI Reference)
- ⛰️ **01 Mountain Circuit:** *5.2 KM · 2 Laps* — Alpine switchbacks, lush pine forests, and elevation hairpin turns.
- 🌊 **02 Coastal Circuit** *(Default):* *6.1 KM · 2 Laps* — Mediterranean cliffside causeway, tunnel bridge, and sunset ocean views.
- ❄️ **03 Snow Circuit:** *4.8 KM · 2 Laps* — Snowy mountain peaks, icy asphalt reflections, and frosty mist.
- 🌃 **04 City Circuit:** *5.6 KM · 2 Laps* — High-speed metropolitan grid beneath glowing cyber billboards and purple neon overpasses.

### 3. Expansion Circuits (Season 2 — Under Development)
- 🏎️ **05 Chennai Grand Prix:** Coastal speedway, Marina sea breeze, high-velocity straights.
- 🏙️ **06 Hyderabad Street Circuit:** Hussain Sagar lakefront loop, elevated flyovers, night lights.
- 🌿 **07 Bangalore Expressway:** Elevated tech corridor, rain-slicked flyovers, cool evening mist.
- 🌉 **08 Mumbai Sea Link:** 8-lane cable-stayed bridge slicing across the Arabian Sea.

### 4. Real-time Multiplayer & Private Rooms
- **Instant Room Generation:** Generate shareable 6-character room codes (`MW-XXXX`).
- **Synchronized Race Starts:** Host and challengers lock in with ready states and receive simultaneous countdowns (`3, 2, 1, GO`).
- **Hybrid Realtime Transport:** Zero-latency peer syncing across browser tabs via `BroadcastChannel`, and global networking via **Supabase Realtime Broadcast**.

### 5. Literature & Text Attribution Showcase
- Every race features curated passages categorized across:
  - 📚 **Classic Books:** *The Great Gatsby*, *Meditations*, etc.
  - 🎵 **Historic Songs:** *Bohemian Rhapsody*, *Fast Car*, etc.
  - 🎙️ **Iconic Speeches:** MLK Jr.'s *I Have a Dream*, Steve Jobs' *Stanford Commencement*, etc.
  - 📰 **Automotive Essays & Articles:** *The Coastal Run*, *The Midnight Highway*, etc.
- Post-race results screen showcases full attribution: title, author, year of publication, and contextual backstory.

### 6. Driver Profile & Ending Average Analytics
- **Overall All-Race Ending Average WPM:** The true mathematical average computed across all finished races in your career history.
- **Career KPIs:** Peak Record WPM, accuracy percentage, total race finishes, and global leaderboard ranking.
- **Persistent Race History:** Track recent finishes with placement, ending WPM, time, and track metadata.

### 7. Synthesized Web Audio Engine (+4 dB Boost)
- **100% Procedural Web Audio API:** Zero external MP3 downloads, zero 404s, and works offline.
- Tactile mechanical keypress clacks, harmonic engine rumble, error blips, countdown chimes, and victory arpeggios.

---

## ⚡ Quickstart Guide

### 1. Clone & Install
```bash
git clone https://github.com/rishirithesh/meanwhile.git
cd meanwhile/client
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(Note: Meanwhile runs with full offline persistence right out of the box even without environment variables!)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, compressed production bundle in `client/dist`.

---

## 🚀 Free Deployment Guide

Meanwhile is architected to run **100% free forever** on zero-cost tiers:
- **Frontend Hosting:** Vercel Hobby Tier ($0), Netlify Starter ($0), or GitHub Pages ($0).
- **Backend & Database:** Supabase Free Tier ($0 for 500MB database + Realtime).
- **Offline / Local Mode:** Built-in LocalStorage and `BroadcastChannel` support zero-cost peer multiplayer with no server needed.

👉 **Read the full step-by-step guide in [DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 📁 Project Structure

```
meanwhile/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication modal
│   │   │   ├── common/         # Navbar, Footer, AdSlot
│   │   │   ├── garage/         # 3D showroom turntable & paint customizer
│   │   │   ├── home/           # Hero section, feature showcase
│   │   │   ├── leaderboard/    # All-time and weekly global rankings
│   │   │   ├── lobby/          # Multiplayer room lobby modal
│   │   │   ├── profile/        # Career stats & Overall Average WPM
│   │   │   ├── race/           # 3D highway canvas, RaceHud, results screen
│   │   │   └── tracks/         # Circuit selection grid & locked cards
│   │   ├── data/
│   │   │   ├── passages.js     # Curated literary corpus with provenance
│   │   │   ├── tracks.js       # 4 active + 4 locked expansion circuits
│   │   │   └── vehicles.js     # Performance car specs & paint palettes
│   │   ├── services/
│   │   │   ├── multiplayer.js  # BroadcastChannel + Supabase Realtime sync
│   │   │   └── supabase.js     # Supabase client & offline fallback store
│   │   ├── sound/
│   │   │   └── soundEngine.js  # Synthesized Web Audio API (+4 dB boosted)
│   │   ├── store/
│   │   │   └── useGameStore.js # Zustand state store & racing physics
│   │   ├── App.jsx             # SPA router
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind CSS & design tokens
│   ├── package.json
│   └── vite.config.js
├── supabase/
│   └── migrations/
│       └── 20261025_init.sql   # Complete PostgreSQL schema & RLS policies
├── BLUEPRINT.md                # Mathematical specifications & architecture
├── DEPLOYMENT.md               # 100% Free Production Deployment Guide
├── README.md                   # Platform documentation
└── vercel.json                 # Vercel SPA routing rewrite rules
```

---

## 📄 License

MIT © [meanwhile](https://github.com/rishirithesh/meanwhile)
