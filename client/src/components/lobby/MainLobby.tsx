import React, { useState } from 'react';
import { UserProfile } from '../../services/api.js';
import { VEHICLES, TRACKS } from '../../three/types.js';
import {
  Play, Users, Bot, Wrench, Trophy, MapPin, Volume2, VolumeX,
  Settings, ArrowRight, ShieldCheck, ChevronRight, Gauge, Zap,
  Flame, Award, Compass, Sparkles, Activity
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
  onUpdateColor?: (color: string) => void;
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
  onOpenSettings,
  onUpdateColor
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
    if (!muted) sound.playCountdownTick(0);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      sound.playCountdownTick(1);
      onJoinPrivate(roomCodeInput.trim().toUpperCase());
    }
  };

  const handleColorSelect = (c: string) => {
    sound.playKeystroke(70, true);
    if (onUpdateColor) {
      onUpdateColor(c);
    }
  };

  const winRate = profile.totalRaces > 0
    ? Math.round((profile.wins / profile.totalRaces) * 100)
    : 0;

  // XP progress to next level (each level requires ~200 XP)
  const currentLevelXp = profile.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / 200) * 100));

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between transition-colors duration-200 select-none bg-cyber-grid"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* 1. Global Telemetry Ticker Ribbon */}
      <div 
        className="w-full px-6 py-2 flex items-center justify-between text-[11px] font-mono border-b"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(5, 7, 12, 0.85)' }}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SERVER ONLINE // 60 FPS
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3 h-3 text-cyan-400" />
            TICK RATE: 15 HZ AUTHORITATIVE
          </span>
          <span className="hidden lg:inline text-slate-500">|</span>
          <span className="hidden lg:flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-3 h-3" />
            CIRCUIT RECORD: APEX 154 WPM
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="font-bold text-white">{onlineCount || 14}</span> Active Racers
          </span>
          <button
            onClick={handleToggleSound}
            className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer text-slate-400 hover:text-white"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. Top Header Navigation */}
      <header 
        className="w-full px-6 py-4 flex items-center justify-between border-b backdrop-blur-md"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(14, 18, 27, 0.75)' }}
      >
        {/* Brand & Primary Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br from-emerald-400 to-cyan-500 text-black shadow-[0_0_20px_rgba(0,255,135,0.4)]"
            >
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Meanwhile
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GRID
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 block -mt-1 uppercase">
                3D Typing Racing
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <button
              className="px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            >
              Grid Dispatch
            </button>
            <button
              onClick={onOpenGarage}
              className="px-3.5 py-2 rounded-lg font-medium hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Garage
            </button>
            <button
              onClick={onOpenTracks}
              className="px-3.5 py-2 rounded-lg font-medium hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Circuits
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2 rounded-lg font-medium hover:text-white hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              Standings
            </button>
          </nav>
        </div>

        {/* Right Status & Driver Profile */}
        <div className="flex items-center gap-3">
          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            title="Settings & Themes"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Pilot Identity Badge */}
          <div 
            onClick={onOpenSettings}
            className="flex items-center gap-3 pl-2.5 pr-4 py-1.5 rounded-xl border cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 transition-all group"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg border border-slate-700 group-hover:border-emerald-400 transition-colors">
              {profile.avatar}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-white group-hover:text-emerald-300 transition-colors">
                {profile.username}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  LVL {profile.level}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {profile.rankTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Command Center Grid */}
      <main className="w-full max-w-6xl mx-auto px-6 py-8 md:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: RACE DISPATCH CENTER (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5 justify-between">
            {/* Header info banner */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CHAMPIONSHIP CIRCUIT // SEASON 1 OPEN</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Apex Grid Dispatch
              </h1>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                Clash against drivers in real time. Validate your typing velocity through synchronized 3D racing on global tarmac.
              </p>
            </div>

            {/* Primary Action Card: Battle Matchmaking & Solo */}
            <div 
              className="p-6 rounded-2xl border relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-2xl animate-border-pulse"
              style={{ borderColor: 'rgba(0, 255, 135, 0.35)' }}
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 font-bold">
                    ACTIVE RACE CIRCUIT
                  </div>
                  <div className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {currentTrack.name}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-3">
                    <span>{currentTrack.location}</span>
                    <span>•</span>
                    <span>4 LANES</span>
                    <span>•</span>
                    <span className="text-amber-400 uppercase font-semibold">{currentTrack.difficulty}</span>
                  </div>
                </div>

                {/* Big Race Now Button */}
                <button
                  onClick={() => {
                    sound.playCountdownTick(2);
                    onRaceNow();
                  }}
                  className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(0,255,135,0.45)] hover:shadow-[0_0_45px_rgba(0,255,135,0.7)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Race Now
                </button>
              </div>

              {/* Race Modes Grid */}
              <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Solo AI Practice Button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowSoloSelector(!showSoloSelector); setShowPrivateJoin(false); }}
                    className="w-full py-3 px-4 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800/90 hover:border-amber-400/50 text-xs font-bold text-white flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Bot className="w-4 h-4 text-amber-400" />
                      Solo Practice vs AI
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showSoloSelector ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Inline Solo Difficulty Selector Popover */}
                  {showSoloSelector && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 p-2.5 rounded-xl border border-slate-700 bg-slate-950 shadow-2xl z-30 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="text-[10px] font-mono text-slate-400 uppercase px-2 py-0.5">
                        Select AI Challenger Tier:
                      </div>
                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('easy'); }}
                        className="p-2.5 rounded-lg text-left text-xs bg-slate-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-transparent transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤖</span>
                          <div>
                            <span className="font-bold text-white group-hover:text-emerald-300">Rookie Bot</span>
                            <span className="text-[10px] text-slate-400 block">Paced for beginners & warmups</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-400">~45 WPM</span>
                      </button>

                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('medium'); }}
                        className="p-2.5 rounded-lg text-left text-xs bg-slate-900/60 hover:bg-amber-500/10 hover:border-amber-500/40 border border-transparent transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">⚡</span>
                          <div>
                            <span className="font-bold text-white group-hover:text-amber-300">Veteran Bot</span>
                            <span className="text-[10px] text-slate-400 block">Competitive human average</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-400">~70 WPM</span>
                      </button>

                      <button
                        onClick={() => { setShowSoloSelector(false); onStartSolo('hard'); }}
                        className="p-2.5 rounded-lg text-left text-xs bg-slate-900/60 hover:bg-rose-500/10 hover:border-rose-500/40 border border-transparent transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏔️</span>
                          <div>
                            <span className="font-bold text-white group-hover:text-rose-300">Cyber Legend</span>
                            <span className="text-[10px] text-slate-400 block">World champion apex pace</span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-rose-400">~95 WPM</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Private Grid Lobby Button */}
                <div className="relative">
                  <button
                    onClick={() => { setShowPrivateJoin(!showPrivateJoin); setShowSoloSelector(false); }}
                    className="w-full py-3 px-4 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800/90 hover:border-cyan-400/50 text-xs font-bold text-white flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Private Match Room
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showPrivateJoin ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Inline Private Room Menu */}
                  {showPrivateJoin && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl border border-slate-700 bg-slate-950 shadow-2xl z-30 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <button
                        onClick={() => { setShowPrivateJoin(false); onCreatePrivate(); }}
                        className="w-full py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Create Private Grid Room
                      </button>
                      
                      <div className="text-[10px] font-mono text-slate-400 text-center uppercase">
                        - OR JOIN BY ROOM CODE -
                      </div>

                      <form onSubmit={handleJoinByCode} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="ENTER 6-DIGIT CODE"
                          value={roomCodeInput}
                          onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-center uppercase tracking-widest text-white focus:outline-none focus:border-cyan-400"
                          maxLength={8}
                        />
                        <button
                          type="submit"
                          disabled={!roomCodeInput.trim()}
                          className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs disabled:opacity-40 cursor-pointer transition-colors"
                        >
                          Join
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Driver Career Telemetry Deck */}
            <div 
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400">Peak Velocity</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-2xl font-black text-emerald-400">
                    {profile.bestWpm || 0}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">WPM</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400">Accuracy Precision</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-2xl font-black text-cyan-400">
                    {profile.averageAccuracy || 100}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400">Podium Victories</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-2xl font-black text-amber-400">
                    {profile.wins || 0}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">/ {profile.totalRaces || 0}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono uppercase text-slate-400">Win Rate</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-2xl font-black text-purple-400">
                    {winRate}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Level XP Progress Meter */}
            <div className="px-5 py-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-300 text-xs">
                  {profile.level}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>License Tier: {profile.rankTier}</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {currentLevelXp} / 200 XP to Level {profile.level + 1}
                  </span>
                </div>
              </div>

              <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE RACING RIG & CIRCUIT (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Active Machine Preview Card */}
            <div 
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md relative overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              {/* Top Rig Label */}
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedVehicleColor }} />
                  <span className="font-mono font-bold text-slate-300 uppercase">ACTIVE RACE RIG</span>
                </div>
                <button
                  onClick={onOpenGarage}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer group-hover:translate-x-0.5 transition-all"
                >
                  360° Showroom <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Machine Hero Visual Thumbnail */}
              <div 
                onClick={onOpenGarage}
                className="my-3 py-6 rounded-xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center relative cursor-pointer hover:border-slate-600 transition-colors"
              >
                {/* Holographic Platform Ring */}
                <div 
                  className="absolute bottom-4 w-44 h-12 rounded-[100%] border border-dashed opacity-40 animate-spin"
                  style={{ borderColor: selectedVehicleColor, animationDuration: '20s' }}
                />
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative z-10"
                  style={{ backgroundColor: `${selectedVehicleColor}20`, border: `1px solid ${selectedVehicleColor}50` }}
                >
                  🏎️
                </div>
                <span className="text-base font-black text-white mt-3 tracking-tight">
                  {currentVehicle.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400 capitalize">
                  {currentVehicle.type} Class Machine
                </span>
              </div>

              {/* Rig Telemetry Gauges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-emerald-400" /> TOP SPEED
                  </span>
                  <span className="font-bold text-white">{currentVehicle.topSpeedKmh} KM/H</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> ACCEL
                  </span>
                  <span className="font-bold text-white">{currentVehicle.accelerationRating} / 10</span>
                </div>
              </div>

              {/* Quick Swatch Palette */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Livery Finish</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{selectedVehicleColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentVehicle.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-7 h-7 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                        selectedVehicleColor === color ? 'scale-115 ring-2 ring-white shadow-lg' : 'hover:scale-105 opacity-80'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Circuit Quick Preview */}
            <div 
              onClick={onOpenTracks}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md cursor-pointer hover:border-slate-600 transition-all flex items-center justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">SELECTED CIRCUIT</span>
                </div>
                <div className="text-lg font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                  {currentTrack.name}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {currentTrack.location} • {currentTrack.lengthMeters}m Course
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 group-hover:text-white group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 4. Sleek Esports Footer */}
      <footer 
        className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t text-xs font-mono"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(5, 7, 12, 0.9)' }}
      >
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-bold text-white">Meanwhile // v1.2</span>
          <span>•</span>
          <span>Tokyo • Dubai • Alps</span>
          <span>•</span>
          <span>Keystroke Telemetry Engine</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <button onClick={onOpenGarage} className="hover:text-white transition-colors cursor-pointer">
            Vehicle Showroom
          </button>
          <button onClick={onOpenTracks} className="hover:text-white transition-colors cursor-pointer">
            Circuits
          </button>
          <button onClick={onOpenLeaderboard} className="hover:text-white transition-colors cursor-pointer">
            Hall of Fame
          </button>
          <button onClick={onOpenSettings} className="hover:text-white transition-colors cursor-pointer">
            Controls & Audio
          </button>
        </div>
      </footer>
    </div>
  );
};
