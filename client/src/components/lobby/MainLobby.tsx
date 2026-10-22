import React, { useState } from 'react';
import { UserProfile } from '../../services/api.js';
import { VEHICLES, TRACKS } from '../../three/types.js';
import {
  Play, Users, Bot, Wrench, Trophy, MapPin, Volume2, VolumeX,
  Settings, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { useTheme } from '../../theme/ThemeContext.js';

interface MainLobbyProps {
  profile: UserProfile;
  selectedVehicleId: string;
  selectedVehicleColor: string;
  selectedTrackId: string;
  onlineCount: number;
  onRaceNow: () => void;
  onStartSolo: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onCreatePrivate: () => void;
  onJoinPrivate: (code: string) => void;
  onOpenGarage: () => void;
  onOpenTracks: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({
  profile,
  selectedVehicleId,
  selectedVehicleColor,
  selectedTrackId,
  onlineCount,
  onRaceNow,
  onStartSolo,
  onCreatePrivate,
  onJoinPrivate,
  onOpenGarage,
  onOpenTracks,
  onOpenLeaderboard,
  onOpenSettings
}) => {
  const { isLight } = useTheme();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [showSoloSelector, setShowSoloSelector] = useState(false);
  const [showPrivateJoin, setShowPrivateJoin] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const currentVehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];
  const currentTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      onJoinPrivate(roomCodeInput.trim().toUpperCase());
    }
  };

  const winRate = profile.totalRaces > 0
    ? Math.round((profile.wins / profile.totalRaces) * 100)
    : 0;

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between transition-colors duration-200 select-none"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Navbar */}
      <header 
        className="w-full px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Brand & Primary Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
            >
              M
            </div>
            <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Meanwhile
            </span>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            <button
              className="px-3 py-1.5 rounded-md font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
            >
              Grid Lobby
            </button>
            <button
              onClick={onOpenGarage}
              className="px-3 py-1.5 rounded-md font-medium hover:text-white transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              Garage
            </button>
            <button
              onClick={onOpenTracks}
              className="px-3 py-1.5 rounded-md font-medium hover:text-white transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              Circuits
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="px-3 py-1.5 rounded-md font-medium hover:text-white transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              Standings
            </button>
          </nav>
        </div>

        {/* Right Status & Driver Controls */}
        <div className="flex items-center gap-3">
          <div 
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-num border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <span>{onlineCount || 1} Drivers Online</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            title="Settings & Themes"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Pilot Identity Pill */}
          <div 
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg border cursor-pointer hover:border-white/20 transition-colors"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <span className="text-base">{profile.avatar}</span>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium leading-none" style={{ color: 'var(--text-primary)' }}>
                {profile.username}
              </span>
              <span className="text-[10px] font-num leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Lvl {profile.level} • {profile.rankTier}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Primary Race Dispatcher (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Header info */}
            <div>
              <div 
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono mb-3"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SEASON 1 ACTIVE</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Grid Dispatch
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Compete against drivers in real time. Validate your keystroke rate through synchronized 3D racing on global tarmac.
              </p>
            </div>

            {/* Main Primary Action: Race Now */}
            <div 
              className="p-6 rounded-2xl border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Selected Grid
                  </div>
                  <div className="text-base font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {currentTrack.name}
                  </div>
                  <div className="text-xs font-num mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {currentVehicle.name} • 4 Lanes • {currentTrack.difficulty.toUpperCase()}
                  </div>
                </div>

                <button
                  onClick={onRaceNow}
                  className="v-btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Race Now
                </button>
              </div>

              {/* Mode Selectors Row */}
              <div className="mt-6 pt-5 border-t grid grid-cols-2 gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                {/* Solo Practice Option */}
                <div className="relative">
                  <button
                    onClick={() => { setShowSoloSelector(!showSoloSelector); setShowPrivateJoin(false); }}
                    className="w-full py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: showSoloSelector ? 'var(--bg-muted)' : 'var(--bg-elevated)', 
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Solo Practice
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSoloSelector ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Inline Solo Difficulty Selector */}
                  {showSoloSelector && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 p-2 rounded-xl border shadow-lg z-20 flex flex-col gap-1"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                    >
                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('easy'); }}
                        className="p-2 rounded-lg text-left text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex justify-between cursor-pointer"
                      >
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Rookie Bot</span>
                        <span className="font-num text-[11px]" style={{ color: 'var(--text-muted)' }}>~45 WPM</span>
                      </button>
                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('medium'); }}
                        className="p-2 rounded-lg text-left text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex justify-between cursor-pointer"
                      >
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Veteran Bot</span>
                        <span className="font-num text-[11px]" style={{ color: 'var(--text-muted)' }}>~70 WPM</span>
                      </button>
                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('hard'); }}
                        className="p-2 rounded-lg text-left text-xs hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex justify-between cursor-pointer"
                      >
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Cyber Legend</span>
                        <span className="font-num text-[11px]" style={{ color: 'var(--text-muted)' }}>~95 WPM</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Private Room Option */}
                <div className="relative">
                  <button
                    onClick={() => { setShowPrivateJoin(!showPrivateJoin); setShowSoloSelector(false); }}
                    className="w-full py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: showPrivateJoin ? 'var(--bg-muted)' : 'var(--bg-elevated)', 
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      Private Grid
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showPrivateJoin ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Inline Private Room Menu */}
                  {showPrivateJoin && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-1 p-2.5 rounded-xl border shadow-lg z-20 flex flex-col gap-2"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
                    >
                      <button
                        onClick={() => { setShowPrivateJoin(false); onCreatePrivate(); }}
                        className="w-full py-2 rounded-lg text-xs font-medium cursor-pointer"
                        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                      >
                        Create Private Room
                      </button>
                      
                      <form onSubmit={handleJoinByCode} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="ROOM CODE"
                          value={roomCodeInput}
                          onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                          className="w-full px-2.5 py-1.5 rounded-md border text-xs font-num text-center uppercase tracking-wider focus:outline-none"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)', 
                            borderColor: 'var(--border-default)',
                            color: 'var(--text-primary)'
                          }}
                          maxLength={8}
                        />
                        <button
                          type="submit"
                          disabled={!roomCodeInput.trim()}
                          className="px-3 py-1.5 rounded-md text-xs font-medium disabled:opacity-40 cursor-pointer"
                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                          Join
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Understated Driver Telemetry Row */}
            <div 
              className="p-4 rounded-xl border flex items-center justify-between text-xs"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Career Personal Best</span>
                <span className="font-num text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.bestWpm || 0} <span className="text-[11px] font-normal" style={{ color: 'var(--text-secondary)' }}>WPM</span>
                </span>
              </div>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
              <div>
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Precision Rating</span>
                <span className="font-num text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.averageAccuracy || 100}%
                </span>
              </div>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
              <div>
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Career Victories</span>
                <span className="font-num text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {profile.wins || 0} <span className="text-[11px] font-normal" style={{ color: 'var(--text-secondary)' }}>/{profile.totalRaces || 0}</span>
                </span>
              </div>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
              <div>
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>Win Rate</span>
                <span className="font-num text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  {winRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Vehicle & Track Quick Access (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Active Machine Preview Card */}
            <div 
              onClick={onOpenGarage}
              className="p-5 rounded-2xl border transition-all cursor-pointer hover:border-white/20 group"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Active Machine</span>
                <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--accent)' }}>
                  Showroom <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {currentVehicle.name}
                  </h3>
                  <p className="text-xs font-num mt-1 capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {currentVehicle.type} Class • {currentVehicle.topSpeedKmh} KM/H Top
                  </p>
                </div>
                <div 
                  className="w-5 h-5 rounded-full border shadow-sm"
                  style={{ backgroundColor: selectedVehicleColor, borderColor: 'var(--border-default)' }}
                />
              </div>

              {/* Progress bar specs */}
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-3 text-xs font-num" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Top Speed Index</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentVehicle.topSpeedKmh} KM/H</span>
                </div>
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Acceleration</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentVehicle.accelerationRating} / 10</span>
                </div>
              </div>
            </div>

            {/* Active Track Preview Card */}
            <div 
              onClick={onOpenTracks}
              className="p-5 rounded-2xl border transition-all cursor-pointer hover:border-white/20 group"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Circuit Rotation</span>
                <span className="flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform" style={{ color: 'var(--accent)' }}>
                  Change Circuit <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {currentTrack.name}
                  </h3>
                  <p className="text-xs font-num mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {currentTrack.location}
                  </p>
                </div>
                <span 
                  className="text-[10px] font-mono px-2 py-0.5 rounded capitalize"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  {currentTrack.difficulty}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs font-num" style={{ borderColor: 'var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course Distance</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentTrack.lengthMeters} Meters</span>
              </div>
            </div>

            {/* Leaderboard Card Quick Link */}
            <div 
              onClick={onOpenLeaderboard}
              className="p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer hover:border-white/20"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Global Driver Leaderboard</span>
              </div>
              <span className="text-xs font-num" style={{ color: 'var(--text-muted)' }}>Top 25 Standings →</span>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer 
        className="w-full px-6 py-4 border-t flex items-center justify-between text-xs font-num"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        <span>MEANWHILE RACING SOFTWARE</span>
        <span>LATENCY OPTIMIZED • AUTHORITATIVE MULTIPLAYER</span>
      </footer>
    </div>
  );
};
