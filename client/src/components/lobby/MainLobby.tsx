import React, { useState } from 'react';
import { UserProfile } from '../../services/api.js';
import { VEHICLES, TRACKS } from '../../three/types.js';
import {
  Play, Users, Bot, Wrench, Trophy, MapPin, Volume2, VolumeX,
  Settings, ArrowRight, ShieldCheck, Gauge, Zap,
  Compass, Sparkles, Activity, Plus, CheckCircle2, ChevronRight
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { AdBanner } from '../common/AdBanner.js';

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
  onSelectVehicle?: (vehicleId: string) => void;
  onSelectTrack?: (trackId: string) => void;
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
  onUpdateColor,
  onSelectVehicle,
  onSelectTrack
}) => {
  const [trackIdInput, setTrackIdInput] = useState('');
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const currentVehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];
  const currentTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playCountdownTick(0);
  };

  const handleJoinTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      sound.playCountdownTick(1);
      onJoinPrivate(trackIdInput.trim().toUpperCase());
    }
  };

  const handleColorSelect = (c: string) => {
    sound.playKeystroke(70, true);
    if (onUpdateColor) {
      onUpdateColor(c);
    }
  };

  const handleTrackSwitch = (tId: string) => {
    sound.playKeystroke(60, true);
    if (onSelectTrack) {
      onSelectTrack(tId);
    }
  };

  const winRate = profile.totalRaces > 0
    ? Math.round((profile.wins / profile.totalRaces) * 100)
    : 0;

  // XP progress
  const currentLevelXp = profile.xp % 200;
  const xpPercent = Math.min(100, Math.round((currentLevelXp / 200) * 100));

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between select-none bg-gradient-to-b from-[#0b0f17] via-[#101726] to-[#0d121c] text-slate-100">
      
      {/* 1. Global Status Bar */}
      <div className="w-full px-4 sm:px-8 py-2 flex items-center justify-between text-[11px] font-mono border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE MULTIPLAYER ENGINE
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            60 FPS AUTHORITATIVE
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <strong className="text-white font-num">{onlineCount || 14}</strong> Racers Online
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
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl z-20">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-tr from-orange-500 to-amber-400 text-black shadow-lg shadow-orange-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white uppercase">
                  Meanwhile
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  GP MOTORSPORT
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 block -mt-0.5 uppercase">
                3D Typing Racing
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={onOpenTracks}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              Circuits ({TRACKS.length})
            </button>
            <button
              onClick={onOpenGarage}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Garage
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Standings
            </button>
          </nav>
        </div>

        {/* Right Pilot Identity & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-xl border border-slate-700/80 bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
            title="Settings & Audio"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Pilot Badge */}
          <div 
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 cursor-pointer hover:border-slate-500 hover:bg-slate-700/70 transition-all shadow-md group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-sm border border-slate-700">
              {profile.avatar}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-white group-hover:text-orange-300 transition-colors">
                {profile.username}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  LVL {profile.level}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  {profile.rankTier}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Command Dashboard */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 md:py-8 flex-1 flex flex-col justify-center gap-6 z-10">
        
        {/* TOP ROW: 3 DEDICATED GAME MODES (Interesting, Easy, 1-Click Launch!) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Card 1: ONLINE GRAND PRIX MATCHMAKING (5 Cols) */}
          <div className="md:col-span-5 p-6 rounded-3xl border border-orange-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-orange-500/50 transition-all">
            <div className="absolute top-0 right-0 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-orange-400 uppercase font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> COMPETITIVE MULTIPLAYER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-[10px] text-orange-300 border border-orange-500/30">
                  RANKED
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Global Grand Prix
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Match with live drivers worldwide. If no rivals are found within 5 seconds, AI bots backfill automatically.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  sound.playCountdownTick(2);
                  onRaceNow();
                }}
                className="w-full py-4 rounded-xl btn-arcade-play text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Find Contenders (Race Now)
              </button>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>⚡ 4 RACERS PER GRID</span>
                <span>⏱️ 5S FAST RADAR</span>
              </div>
            </div>
          </div>

          {/* Card 2: INSTANT SOLO TIME TRIAL (4 Cols) */}
          <div className="md:col-span-4 p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-sky-500/50 transition-all">
            <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-xs font-mono text-sky-400 uppercase font-bold mb-2">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> INSTANT SOLO PRACTICE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-[10px] text-sky-300 border border-sky-500/30 font-bold">
                  0ms START
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                Time Trial vs AI
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Instant singleplayer test against calibrated pacing bots. 1-click to launch immediately!
              </p>
            </div>

            {/* Direct 3-Button Difficulty Matrix (No dropdowns!) */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                onClick={() => onStartSolo('easy')}
                className="py-3 px-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-600/50 btn-arcade-pill text-white transition-all flex flex-col items-center justify-center cursor-pointer group shadow-md"
              >
                <span className="text-[11px] font-mono font-black text-emerald-400">ROOKIE</span>
                <span className="text-[9px] font-mono text-emerald-300/80 mt-0.5 font-bold">~45 WPM</span>
              </button>

              <button
                onClick={() => onStartSolo('medium')}
                className="py-3 px-2 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/60 btn-arcade-pill text-white transition-all flex flex-col items-center justify-center cursor-pointer group shadow-md ring-1 ring-sky-400/40"
              >
                <span className="text-[11px] font-mono font-black text-sky-300">PRO</span>
                <span className="text-[9px] font-mono text-sky-200 mt-0.5 font-bold">~70 WPM</span>
              </button>

              <button
                onClick={() => onStartSolo('hard')}
                className="py-3 px-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-600/50 btn-arcade-pill text-white transition-all flex flex-col items-center justify-center cursor-pointer group shadow-md"
              >
                <span className="text-[11px] font-mono font-black text-rose-400">LEGEND</span>
                <span className="text-[9px] font-mono text-rose-300/80 mt-0.5 font-bold">~95 WPM</span>
              </button>
            </div>
          </div>

          {/* Card 3: PRIVATE TRACK BY ID (3 Cols) */}
          <div className="md:col-span-3 p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="text-xs font-mono text-purple-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> PRIVATE TRACK
              </div>

              <h2 className="text-lg font-black text-white tracking-tight uppercase">
                Custom Grid ID
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Join a friend's private track or generate a custom Track ID.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <form onSubmit={handleJoinTrack} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="TRACK ID (e.g. CHN-882)"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white font-mono font-bold text-center tracking-wider text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  maxLength={16}
                />
                <button
                  type="submit"
                  disabled={!trackIdInput.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-black font-extrabold text-xs font-mono uppercase cursor-pointer transition-all whitespace-nowrap active:scale-95"
                >
                  Join
                </button>
              </form>

              <button
                onClick={() => {
                  sound.playClick();
                  onCreatePrivate();
                }}
                className="w-full py-2 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold text-[11px] font-mono uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Create Track ID
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: CIRCUIT SELECTOR & MACHINE GARAGE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Selected Circuit Card & Quick Switcher (7 Cols) */}
          <div className="md:col-span-7 p-6 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Compass className="w-3.5 h-3.5" /> ACTIVE CIRCUIT
                </span>
                <span className="text-slate-400">{currentTrack.difficulty.toUpperCase()} // HIGH GRIP</span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    {currentTrack.name}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>{currentTrack.location}</span>
                    <span>•</span>
                    <span className="text-white font-bold">{currentTrack.lengthMeters}m Course</span>
                  </div>
                </div>

                <button
                  onClick={onOpenTracks}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer transition-colors whitespace-nowrap"
                >
                  View All Venues →
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed max-w-2xl">
                {currentTrack.description}
              </p>
            </div>

            {/* Quick 1-Click Track Switcher Tabs (No dropdowns!) */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-2 font-bold">
                Quick Switch Circuit:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TRACKS.slice(0, 5).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTrackSwitch(t.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      selectedTrackId === t.id
                        ? 'border-orange-500 bg-orange-500/15 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-bold truncate max-w-full">{t.name.split(' ')[0]}</span>
                    <span className="text-[8.5px] font-mono uppercase text-slate-400 mt-0.5">{t.difficulty}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Tuning & Livery (5 Cols) */}
          <div className="md:col-span-5 p-6 rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Gauge className="w-3.5 h-3.5" /> RACING MACHINE
                </span>
                <span className="text-slate-400">{currentVehicle.type.toUpperCase()} CLASS</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {currentVehicle.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">Custom Tuned Aerodynamics</span>
                </div>

                <button
                  onClick={onOpenGarage}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  Garage 360° →
                </button>
              </div>

              {/* Specs bars */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">TOP SPEED</span>
                  <span className="font-bold text-white font-num">{currentVehicle.topSpeedKmh} KM/H</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">ACCELERATION</span>
                  <span className="font-bold text-white font-num">{currentVehicle.accelerationRating} / 10</span>
                </div>
              </div>
            </div>

            {/* Livery Paint Swatches */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-400 uppercase font-bold">
                <span>LIVERY PAINT</span>
                <span className="text-white">{selectedVehicleColor}</span>
              </div>
              <div className="flex items-center gap-2">
                {currentVehicle.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-7 h-7 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      selectedVehicleColor === color ? 'scale-115 ring-2 ring-white shadow-lg' : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SPONSORED MONETIZATION BANNER (728x90 Leaderboard) */}
        <AdBanner 
          slotId="ad-lobby-mid-leaderboard" 
          format="leaderboard" 
          className="my-3"
        />

        {/* BOTTOM ROW: DRIVER CAREER TELEMETRY */}
        <div className="p-5 rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Peak Pace</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
              {profile.bestWpm || 0} <span className="text-xs font-normal text-slate-400">WPM</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Precision</span>
            <div className="text-2xl font-black font-mono text-sky-400 mt-0.5">
              {profile.averageAccuracy || 100}%
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Victories</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
              {profile.wins || 0} <span className="text-xs font-normal text-slate-400">/ {profile.totalRaces || 0}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Win Rate</span>
            <div className="text-2xl font-black font-mono text-purple-400 mt-0.5">
              {winRate}%
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="w-full px-4 sm:px-8 py-3 flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 bg-slate-950/60 z-10">
        <span>MEANWHILE GP ENGINE • AUTHORITATIVE WEBSOCKETS</span>
        <span>LOW LATENCY TICK PROTOCOL</span>
      </footer>
    </div>
  );
};
