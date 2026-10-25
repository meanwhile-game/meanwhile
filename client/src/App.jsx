import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore.js';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { HeroSection } from './components/home/HeroSection.jsx';
import { HomeShowcase } from './components/home/HomeShowcase.jsx';
import { TrackSelectionScreen } from './components/tracks/TrackSelectionScreen.jsx';
import { GarageScreen } from './components/garage/GarageScreen.jsx';
import { RaceView } from './components/race/RaceView.jsx';
import { ResultsScreen } from './components/race/ResultsScreen.jsx';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen.jsx';
import { ProfileScreen } from './components/profile/ProfileScreen.jsx';
import { AuthModal } from './components/auth/AuthModal.jsx';
import { MultiplayerLobbyModal } from './components/lobby/MultiplayerLobbyModal.jsx';
import { api } from './services/supabase.js';

export function App() {
  const { view, setProfile } = useGameStore();

  // Load saved profile on initial boot
  useEffect(() => {
    api.getProfile().then((loadedProfile) => {
      if (loadedProfile) {
        setProfile(loadedProfile);
      }
    });
  }, [setProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-[#f8fafc] font-sans antialiased selection:bg-amber-400/30 selection:text-[#f8fafc]">
      {/* Top Navbar (Hidden during active 3D racing for full cinematic immersion) */}
      {view !== 'racing' && <Navbar />}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
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
