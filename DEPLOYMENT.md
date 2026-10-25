# Meanwhile — Production Deployment & DevOps Guide

This guide details the step-by-step procedure to deploy **meanwhile** to production using **GitHub**, **Supabase**, and **Vercel**.

---

## 1. Prerequisites Checklist

- A GitHub Account (repository: `https://github.com/rishirithesh/meanwhile.git`)
- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (Free Tier or Pro)
- Node.js 18+ and npm installed locally

---

## 2. Supabase Infrastructure Setup

### 2.1. Create Project
1. Log in to [Supabase Dashboard](https://app.supabase.com) and click **New Project**.
2. Project Name: `meanwhile-production`
3. Database Password: Generate a strong, secure password and store it safely.
4. Select the region closest to your primary player audience.

### 2.2. Execute Database Migrations
1. In the Supabase project dashboard, navigate to the **SQL Editor** tab (left sidebar).
2. Click **New query**.
3. Open the file `supabase/migrations/20261025_init.sql` from this repository.
4. Paste the entire SQL script and click **Run**.
5. Verify that the following tables and views are created in the **Table Editor**:
   - `public.profiles`
   - `public.race_results`
   - `public.rooms`
   - `public.leaderboard_all_time`

### 2.3. Enable Realtime Channels
1. Navigate to **Database** -> **Replication**.
2. Ensure that replication is active for:
   - `public.race_results`
   - `public.rooms`

### 2.4. Configure Authentication & URL Redirects
1. Navigate to **Authentication** -> **URL Configuration**.
2. **Site URL:** Set to your production Vercel domain (e.g. `https://meanwhile.vercel.app`).
3. **Redirect URLs:** Add:
   - `https://meanwhile.vercel.app/**`
   - `http://localhost:5173/**` (for local development testing)

### 2.5. Retrieve API Keys
Navigate to **Project Settings** -> **API**:
- **Project URL:** Copy the `URL` (e.g. `https://xyzproject.supabase.co`).
- **Anon Key:** Copy the `anon` `public` key.
*(Note: Never expose the `service_role` secret key in the frontend client).*

---

## 3. Vercel Frontend Deployment

The repository includes a root `vercel.json` and a Vite configuration pre-configured for single-click deployment.

### Method A: Deploy via Vercel Web Dashboard (Recommended)
1. Go to [Vercel New Project](https://vercel.com/new).
2. Select **Import Git Repository** and choose `rishirithesh/meanwhile`.
3. In the **Configure Project** dialog:
   - **Framework Preset:** Vite
   - **Root Directory:** `./client` (or `./` with the root `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public key
   - `VITE_ENABLE_ADS`: `false` (or `true` if activating Google AdSense / sponsors)
5. Click **Deploy**.

### Method B: Deploy via Vercel CLI
Run the following commands in the project root:
```bash
# Link project to Vercel
npx -y vercel link

# Add environment variables
npx -y vercel env add VITE_SUPABASE_URL
npx -y vercel env add VITE_SUPABASE_ANON_KEY
npx -y vercel env add VITE_ENABLE_ADS

# Deploy directly to production
npx -y vercel --prod
```

---

## 4. Environment Variables Reference

| Variable Name | Required | Default | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Yes (for online mode) | `""` | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (for online mode) | `""` | Public anon key for database & auth |
| `VITE_ENABLE_ADS` | No | `false` | When `false`, ad slots collapse with 0 layout shift |
| `VITE_AD_CLIENT_ID` | No | `ca-pub-000000` | Optional Google AdSense client ID |

---

## 5. Post-Deployment Verification & Smoke Tests

Execute these verification checks once deployed to your production URL:

1. **Homepage & 3D WebGL Initialization:**
   - Verify that the homepage loads with dark automotive palette, refined typography, and zero WebGL shader errors in the browser console.
2. **Tracks Selection:**
   - Click **Tracks** and cycle through Coastal Drive, Neon City, Mountain Pass, and Desert Run. Confirm track cards highlight correctly.
3. **Garage Turntable:**
   - Click **Garage** and rotate the 3D car in the studio showroom. Toggle paint swatches (White, Red, Blue, Purple) and confirm the vehicle lacquer updates in real-time.
4. **Typing-to-Driving Physics Smoke Test:**
   - Click **Quick Race**. Verify the 3-2-1 countdown revs.
   - Type the passage. Confirm WPM, speedometer needle, gear shifts, and roadside scenery move at speeds corresponding to your typing rhythm.
5. **Race Completion & Results:**
   - Finish typing the passage. Confirm victory confetti triggers, the WPM curve renders, and recent race results update.
6. **Multiplayer Cross-Session Test:**
   - Open two distinct browser sessions (e.g. Chrome and Firefox, or Normal and Incognito).
   - In Session 1, click **Tracks** -> **Private Room** -> **Create Room**. Copy the 6-digit code (`MW-XXXX`).
   - In Session 2, click **Private Room** -> enter the code -> click **Join**.
   - Verify both players appear in the lobby. Press **Ready** in Session 2, and click **Start Race** in Session 1.
   - Verify both browsers launch the synchronized countdown and track each other's progress along the 3D road.

---

## 6. Troubleshooting & Rollbacks

- **White screen or 404 on deep refresh:**
  The included `vercel.json` configures a rewrite rule `{"source": "/(.*)", "destination": "/index.html"}` to ensure client-side routing works smoothly.
- **Offline Mode fallback:**
  If Supabase credentials are missing or network connectivity is interrupted, Meanwhile automatically switches to local persistent mock storage without throwing uncaught exceptions.
- **Instant Rollback:**
  In the Vercel dashboard, navigate to **Deployments**, locate the last healthy build, click the three dots (`...`), and select **Promote to Production** for instantaneous rollback.
