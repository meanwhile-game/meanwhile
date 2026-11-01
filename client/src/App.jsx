import React, { useEffect, Suspense, lazy } from 'react';
import { useGameStore } from './store/useGameStore.js';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { HeroSection } from './components/home/HeroSection.jsx';
import { HomeShowcase } from './components/home/HomeShowcase.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import { MultiplayerLobbyModal } from './components/lobby/MultiplayerLobbyModal.jsx';
import { api } from './services/supabase.js';

// Lazy-Loaded Views for High Performance Initial Page Load
const TrackSelectionScreen = lazy(() =>
  import('./components/tracks/TrackSelectionScreen.jsx').then((m) => ({ default: m.TrackSelectionScreen }))
);
const GarageScreen = lazy(() =>
  import('./components/garage/GarageScreen.jsx').then((m) => ({ default: m.GarageScreen }))
);
const RaceView = lazy(() =>
  import('./components/race/RaceView.jsx').then((m) => ({ default: m.RaceView }))
);
const ResultsScreen = lazy(() =>
  import('./components/race/ResultsScreen.jsx').then((m) => ({ default: m.ResultsScreen }))
);
const LeaderboardScreen = lazy(() =>
  import('./components/leaderboard/LeaderboardScreen.jsx').then((m) => ({ default: m.LeaderboardScreen }))
);
const ProfileScreen = lazy(() =>
  import('./components/profile/ProfileScreen.jsx').then((m) => ({ default: m.ProfileScreen }))
);

// Sleek dark motorsport view loader
const ViewLoader = () => (
  <div className="flex-1 w-full min-h-[60vh] flex items-center justify-center bg-[#070a13]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
      <span className="text-[11px] uppercase tracking-widest text-[#94a3b8] font-bold">
        Loading Circuit Assets...
      </span>
    </div>
  </div>
);

export function App() {
  const { view, setProfile, setMultiplayerModalOpen } = useGameStore();

  // Load saved profile on initial boot and subscribe to auth state changes
  useEffect(() => {
    api.getProfile().then((loadedProfile) => {
      if (loadedProfile) {
        setProfile(loadedProfile);
      }
    });

    const unsubAuth = api.initAuthListener((updatedProfile) => {
      if (updatedProfile) setProfile(updatedProfile);
    });

    // Handle deep-link private room join ?room=MW-XXXX
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setMultiplayerModalOpen(true);
      }
    } catch (e) {}

    return () => {
      if (typeof unsubAuth === 'function') unsubAuth();
    };
  }, [setProfile, setMultiplayerModalOpen]);

  // Background idle preloading of 3D racing chunk and vehicle model
  useEffect(() => {
    const idlePreload = () => {
      // Preload RaceView chunk
      import('./components/race/RaceView.jsx').catch(() => {});
      // Prefetch GLB car model
      try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = '/models/ferrari.glb';
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      } catch (e) {}
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(idlePreload, { timeout: 2000 });
    } else {
      setTimeout(idlePreload, 1500);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-[#f8fafc] font-sans antialiased selection:bg-amber-400/30 selection:text-[#f8fafc]">
      {/* Top Navbar (Hidden during active 3D racing for full cinematic immersion) */}
      {view !== 'racing' && <Navbar />}

      {/* Main View Router with Suspense */}
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<ViewLoader />}>
          {view === 'home' && (
            <>
              <HeroSection />
              <HomeShowcase />
            </>
          )}

          {view === 'tracks' && <TrackSelectionScreen />}

          {view === 'garage' && <GarageScreen />}

          {view === 'racing' && <RaceView />}

          {view === 'results' && <ResultsScreen />}

          {view === 'leaderboard' && <LeaderboardScreen />}

          {view === 'profile' && <ProfileScreen />}
        </Suspense>
      </main>

      {/* Footer (Rendered on all pages EXCEPT during active 3D racing viewport) */}
      {view !== 'racing' && <Footer />}

      {/* Global Modals */}
      <AuthModal />
      <MultiplayerLobbyModal />
    </div>
  );
}

export default App;
