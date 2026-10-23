# 💰 VELOCE // Game Monetization & Ad Network Integration Guide

This guide explains how to connect your ad network (Google AdSense, GameDistribution, NitroPay, Playwire, CrazyGames SDK) to the dedicated ad slots placed throughout the game.

---

## 📌 Configured Ad Slots & Standard IAB Dimensions

All slots are rendered with FTC/AdSense-compliant standard labels, zero cumulative layout shift (`CLS = 0`), and explicit IDs for automated targeting:

| Screen | Slot ID | IAB Format | Standard Dimensions | Placement |
| :--- | :--- | :--- | :--- | :--- |
| **Main Lobby** | `ad-lobby-mid-leaderboard` | Leaderboard | $728 \times 90$ | Between Tuning and Career Telemetry |
| **Post-Race Podium** | `ad-results-podium-banner` | Leaderboard / Responsive | $728 \times 90$ | Directly below race finish podium (highest eCPM) |
| **Garage Showroom** | `ad-garage-sidebar-rectangle` | Medium Rectangle | $300 \times 250$ | Right telemetry sidebar below aerodynamic specs |
| **Track Selection** | `ad-tracks-footer-leaderboard` | Leaderboard | $728 \times 90$ | Centered below the 6 international circuits |
| **Leaderboard** | `ad-leaderboard-mid-leaderboard` | Leaderboard | $728 \times 90$ | Between Top 3 Podium and Global Rankings table |
| **Private Lobby** | `ad-private-lobby-leaderboard` | Leaderboard | $728 \times 90$ | Below multiplayer driver waiting grid |
| **Landing Page** | `ad-landing-showcase-billboard` | Billboard | $970 \times 250$ | High-impact sponsorship section before main CTA |

---

## 🚀 How to Enable Google AdSense

### Step 1: Add the AdSense Header Script
In [`client/index.html`](file:///c:/5th%20Sem/Hackathon/Veloce/client/index.html), add your AdSense script tag inside the `<head>` tag:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

### Step 2: Replace the Placeholder in `AdBanner.tsx`
Open [`client/src/components/common/AdBanner.tsx`](file:///c:/5th%20Sem/Hackathon/Veloce/client/src/components/common/AdBanner.tsx).
Replace the placeholder content inside the `#slotId` container with your `<ins className="adsbygoogle">` tag:

```tsx
<div
  id={slotId}
  data-ad-slot={slotId}
  data-ad-format={format}
  className={...}
>
  <ins className="adsbygoogle"
       style={{ display: 'block' }}
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
</div>
```

---

## 🎮 GameDistribution / NitroPay / Playwire Alternative

If you publish on web gaming portals (e.g., CrazyGames, Poki, GameDistribution):
1. **Interstitial / Mid-Roll Ads**:
   Trigger `showInterstitial()` right when the race finishes in [`App.tsx`](file:///c:/5th%20Sem/Hackathon/Veloce/client/src/App.tsx) before showing `ResultsScreen`.
2. **Rewarded Ads (Double XP)**:
   In [`ResultsScreen.tsx`](file:///c:/5th%20Sem/Hackathon/Veloce/client/src/components/race/ResultsScreen.tsx), add a "Watch Ad for 2× XP" button that hooks into `showRewarded()`.
3. **Display Banners**:
   GameDistribution and NitroPay can auto-target `#ad-lobby-mid-leaderboard`, `#ad-results-podium-banner`, and `#ad-garage-sidebar-rectangle` directly by element ID.
