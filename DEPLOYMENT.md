# meanwhile — 100% Free Production Deployment Guide

Deploy **meanwhile** to production at **$0 / month** using free-tier cloud infrastructure:
- **Frontend Hosting:** Vercel (Hobby Tier — $0/mo) or Netlify (Starter Tier — $0/mo)
- **Database & Realtime:** Supabase (Free Tier — $0/mo for 500MB PostgreSQL + Realtime channels)
- **Code Repository:** GitHub (Free public/private repos with free GitHub Actions)

---

## 📋 Architecture & Cost Breakdown

| Component | Provider & Tier | Cost | Included Resources |
|---|---|---|---|
| **Frontend Web App** | [Vercel](https://vercel.com) (Hobby) | **$0.00** | 100GB bandwidth/mo, global CDN edge, free SSL, unlimited preview deployments |
| **Alternative Frontend** | [Netlify](https://netlify.com) (Starter) | **$0.00** | 100GB bandwidth/mo, continuous Git deployment, instant rollbacks |
| **PostgreSQL Database** | [Supabase](https://supabase.com) (Free) | **$0.00** | 500MB database, 50,000 monthly active users, 5GB bandwidth, 200 concurrent Realtime connections |
| **Offline / Peer Mode** | Browser LocalStorage + BroadcastChannel | **$0.00** | Zero cloud dependencies required; works offline and across local tabs/windows |

> [!NOTE]
> **meanwhile** has a built-in offline persistent fallback. Even if you do **not** configure Supabase, the game works seamlessly out of the box with career profiles, car paint customization, race history, and peer multiplayer!

---

## 🚀 Step 1: Set Up Free Supabase Backend (Optional but Recommended)

Supabase provides the free PostgreSQL database for global leaderboards, cloud career profiles, and cross-network multiplayer.

### 1.1 Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and click **Start your project** (log in with your GitHub account).
2. Click **New Project** and select your free organization.
3. Fill in the project details:
   - **Name:** `meanwhile-game`
   - **Database Password:** Enter a strong password (save this securely).
   - **Region:** Choose a region closest to you or your target players (e.g., `East US`, `Central EU`, or `South Asia - Mumbai`).
   - **Pricing Plan:** Select **Free ($0/month)**.
4. Click **Create new project** (takes ~1-2 minutes to provision).

### 1.2 Run the SQL Database Migration
1. In the Supabase project dashboard, click the **SQL Editor** icon in the left navigation sidebar (or press `Ctrl+K` and type `SQL Editor`).
2. Click **New query** (or `+`).
3. Open the migration file from this repo:
   [`supabase/migrations/20261025_init.sql`](./supabase/migrations/20261025_init.sql)
4. Copy the entire contents of that SQL file, paste it into the query editor, and click **Run** (green button).
5. You should see `Success. No rows returned`.
6. Verify in the **Table Editor** (table icon on the left) that the following tables exist:
   - `profiles`
   - `race_results`
   - `rooms`
   - `leaderboard_all_time` (view)

### 1.3 Enable Realtime Replication for Multiplayer
1. In the Supabase dashboard, navigate to **Database** -> **Replication** (under Database in left menu).
2. Under **Source**, click the **supabase_realtime** toggle to ensure replication is active for:
   - `race_results`
   - `rooms`

### 1.4 Copy Your Free API Keys
1. Navigate to **Project Settings** (gear icon at bottom left) -> **API**.
2. Copy the two values:
   - **Project URL:** `https://xxxxxxxxxxxxxxxx.supabase.co`
   - **Project API Keys (`anon` `public`):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   *(Keep these handy for Step 2).*

---

## 🌐 Step 2: Deploy Frontend for Free

Choose either **Method A (Vercel)** or **Method B (Netlify)**. Both are 100% free.

### Method A: Deploy on Vercel (Recommended — 2 Minutes)

1. Go to [vercel.com](https://vercel.com) and click **Sign Up** -> **Continue with GitHub**.
2. Click **Add New...** -> **Project**.
3. Under **Import Git Repository**, find `rishirithesh/meanwhile` and click **Import**.
4. In the **Configure Project** screen:
   - **Project Name:** `meanwhile` (or any custom name)
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** Click **Edit** and set it to `client` (or leave as `./` because root has `package.json` and `vercel.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Expand the **Environment Variables** section and add:
   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 1.4 |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key from Step 1.4 |
   | `VITE_ENABLE_ADS` | `false` |
6. Click **Deploy**.
7. In ~30–45 seconds, your game is live at a URL like `https://meanwhile-xxxx.vercel.app`!

> [!TIP]
> Whenever you push new code to your GitHub `main` branch (`git push origin main`), Vercel will automatically re-build and deploy your updates in under 30 seconds for free!

---

### Method B: Deploy on Netlify (Alternative Free Option)

1. Go to [netlify.com](https://netlify.com) and click **Sign Up** (with GitHub).
2. Click **Add new site** -> **Import an existing project** -> **GitHub**.
3. Select your repository `rishirithesh/meanwhile`.
4. Configure build settings:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add the environment variables:
   - `VITE_SUPABASE_URL`: `https://your-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
   - `VITE_ENABLE_ADS`: `false`
6. Click **Deploy meanwhile**. Your game will be live at `https://meanwhile-xxxx.netlify.app`.

---

### Method C: Zero-Config Offline Mode (No Accounts Needed)

If you just want to host the static game with **zero backend accounts**:
1. Run `cd client && npm run build`.
2. The folder `client/dist` is a completely standalone static web app!
3. You can drop `client/dist` into:
   - [Netlify Drop](https://app.netlify.com/drop) (drag & drop the folder without creating an account)
   - [Surge.sh](https://surge.sh) (`npx surge client/dist`)
   - [GitHub Pages](https://pages.github.com)
4. The game will automatically use local persistent storage and browser `BroadcastChannel` for multiplayer across tabs/windows.

---

## 🔒 Step 3: Configure Auth & Redirect URLs (In Supabase)

Once your frontend is deployed to Vercel or Netlify:
1. Return to your [Supabase Dashboard](https://app.supabase.com).
2. Go to **Authentication** -> **URL Configuration**.
3. Set **Site URL** to your live production URL:
   ```
   https://meanwhile.vercel.app
   ```
4. Under **Redirect URLs**, add:
   ```
   https://meanwhile.vercel.app/**
   http://localhost:5173/**
   ```
5. Click **Save**.

---

## ✅ Step 4: Verification & Smoke Test Checklist

Once your deployment finishes, open your live URL and verify:

- [ ] **Homepage & 3D WebGL:** Page loads smoothly with midnight automotive palette, refined typography, and 0 console errors.
- [ ] **Circuit Selection:** Click **Tracks**. Verify the 6 active circuits (Mountain, Coastal, Snow, City, Chennai Marina Drive, New Delhi Rajpath) and the locked Season 2 expansion circuits (Hyderabad, Bangalore, Mumbai) with development badges.
- [ ] **Garage 3D View:** Click **Garage**. Rotate the 3D car on the turntable showroom and select different paint lacquer finishes (White, Red, Blue, Purple).
- [ ] **Typing & Racing Simulation:** Click **Start Race**.
  - Check that the player begins in **4th position** (`4/8`) on the starting grid.
  - Type the passage text: confirm WPM updates from your first keystroke, speedometer needle revs, and gear shifts smoothly (1st–6th).
  - Overtake cars ahead when typing faster than their pace.
  - Finish the race and confirm the **Victory screen** renders with full text attribution (Book, Song, Speech, or Article).
- [ ] **Driver Profile:** Click **Profile**. Confirm all 5 metric cards render:
  - **Overall Avg WPM** (with All-Time badge and ending mean)
  - **Best WPM**
  - **Accuracy**
  - **Total Races**
  - **Global Rank**
- [ ] **Multiplayer Room Test:**
  - Open an Incognito window or a second browser tab.
  - Player 1: Click **Tracks** -> **Multiplayer** -> **Host a Custom Room**. Copy the room code (e.g. `MW-4820`).
  - Player 2: Enter the room code and click **Join Room**.
  - Confirm both players appear in the lobby grid with their names and ready states.
  - Click **Start Synchronized Race** and verify both screens launch into the race simultaneously!

---

## 🛠️ Free Maintenance & Troubleshooting

### Why is my deep-linked URL or refresh giving 404?
Single Page Applications (SPAs) require all route requests to fallback to `index.html`.
- For Vercel: The root [`vercel.json`](./vercel.json) already includes the rule:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- For Netlify: A `_redirects` file with `/* /index.html 200` ensures all URLs route to `index.html`.

### How do I add a free custom domain?
Both Vercel and Netlify allow you to add custom domains for free with automatic Let's Encrypt SSL certificates:
1. In Vercel, go to **Settings** -> **Domains**.
2. Enter your domain (e.g. `meanwhile.racing` or `meanwhile.yourname.com`).
3. Follow the DNS instructions to add a CNAME record pointing to `cname.vercel-dns.com`.
4. SSL certificates are provisioned automatically at zero cost.

---

## 📞 Support & Community

- **GitHub Repository:** [github.com/rishirithesh/meanwhile](https://github.com/rishirithesh/meanwhile)
- **Bug Reports & Feature Requests:** Open an Issue on GitHub.
- **License:** MIT License — free for personal and commercial deployment!
