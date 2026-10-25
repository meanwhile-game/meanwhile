# meanwhile — 3D Multiplayer Typing Racing Platform

> *a little escape, in your meantime.*

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**meanwhile** is a high-octane, minimalist 3D multiplayer typing racing game. Players accelerate high-performance sports cars through cinematic coastal boulevards, cyberpunk metropolises, misty mountain passes, and desert canyons—where every keystroke translates directly into engine RPM, asphalt velocity, and race position.

---

## Highlights

- 🏎️ **Typing-to-Velocity Engine:** Mathematical WPM calculation drives vehicle acceleration, transmission gear shifting (1st–6th), and dynamic speed FOV.
- 🛣️ **4 Curated 3D Circuits:** Coastal Drive (Sunset), Neon City (Night), Mountain Pass (Twilight), and Desert Run (Dusk).
- 👥 **Multiplayer Racing:** Private room creation (`MW-XXXX`), synchronized countdown starts, and live broadcast progress.
- 🎨 **3D Custom Garage:** Turntable showroom with reflective studio lighting, performance telemetry, and bespoke paint finishes.
- 🏆 **Global Leaderboard & Profiles:** Career records, WPM pacing analysis curves, win rates, and credit rewards.
- 📢 **Future-Proof Monetization:** Clean, zero-layout-shift `AdSlot` components placed exclusively outside active racing viewports.
- 🔒 **Enterprise-Grade Security:** Supabase PostgreSQL with Row Level Security (RLS) policies and persistent offline fallback.

---

## Quickstart Guide

### 1. Clone & Install
```bash
git clone https://github.com/rishirithesh/meanwhile.git
cd meanwhile/client
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Optional: provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to connect to your live Supabase project; the game runs with full offline persistence even without credentials).*

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## Documentation

- 📘 [**BLUEPRINT.md**](./BLUEPRINT.md): Comprehensive system architecture, game mathematical physics, schema specifications, and ad architecture.
- 🚀 [**DEPLOYMENT.md**](./DEPLOYMENT.md): Complete DevOps runbook covering Supabase migrations, Vercel configuration, smoke tests, and rollback procedures.
- 🗄️ [**supabase/migrations/20261025_init.sql**](./supabase/migrations/20261025_init.sql): Complete SQL database migration for profiles, race results, rooms, and RLS policies.

---

## License

MIT © meanwhile
