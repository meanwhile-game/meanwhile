import React, { useState } from 'react';
import { UserProfile } from '../../services/api.js';
import { VEHICLES, TRACKS } from '../../three/types.js';
import {
  Play, Users, Bot, Wrench, Trophy, MapPin, Volume2, VolumeX,
  Settings, ArrowRight, ShieldCheck, Gauge, Zap,
  Compass, Plus, CheckCircle2, ChevronRight, Flame,
  Share2, Sparkles, MessageCircle, Globe, HelpCircle, Star, ExternalLink
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [instantDeath, setInstantDeath] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const currentVehicle = VEHICLES.find(v => v.id === selectedVehicleId) || VEHICLES[0];
  const currentTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0];

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleJoinTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      sound.playClick();
      onJoinPrivate(trackIdInput.trim().toUpperCase());
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#194269] text-slate-100 select-none overflow-x-hidden font-sans">
      
      {/* 1. TypeRacer Style Classic Top Navigation Bar */}
      <nav className="w-full bg-[#10304f] border-b border-[#1b4b7a] px-4 sm:px-8 py-2.5 flex items-center justify-between z-30 shadow-md">
        {/* Brand & Left Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => sound.playClick()}>
            {/* Typewriter / Racing Logo Icon */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-slate-950" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-white lowercase">
              meanwhile
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-200">
            <button 
              onClick={() => { sound.playClick(); onOpenGarage(); }}
              className="hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            >
              Pit Stop / Garage
            </button>
            <button 
              onClick={() => { sound.playClick(); onOpenTracks(); }}
              className="hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            >
              Circuits ({TRACKS.length})
            </button>
            <button 
              onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
              className="hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            >
              Standings
            </button>
            <a 
              href="https://discord.gg" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-white hover:underline cursor-pointer flex items-center gap-1"
            >
              Discord
            </a>
            <button 
              onClick={() => { sound.playClick(); onOpenSettings(); }}
              className="hover:text-white hover:underline cursor-pointer"
            >
              About
            </button>
          </div>
        </div>

        {/* Right User Bar (Exact TypeRacer user pill) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { sound.playClick(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f6c344] hover:bg-[#ffcf55] text-slate-950 font-bold text-xs uppercase cursor-pointer shadow transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            ★ Subscribe
          </button>

          {/* User Pill */}
          <div className="flex items-center rounded-md bg-[#0b2239] border border-[#1b4b7a] overflow-hidden text-xs">
            <div className="px-2.5 py-1.5 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
                {profile.username ? profile.username[0].toUpperCase() : 'P'}
              </div>
              <span className="font-bold text-white truncate max-w-[120px]">
                {profile.username || 'nicefingers'}
              </span>
            </div>

            <div className="px-2 py-1.5 bg-[#00a8cc] text-slate-950 font-black text-[10px] uppercase">
              PRO
            </div>

            <div className="px-2.5 py-1.5 bg-[#081a2c] text-cyan-300 font-mono font-bold">
              {profile.bestWpm || 78} WPM
            </div>

            <div className="px-2.5 py-1.5 bg-[#061422] text-slate-400 font-mono hidden md:inline">
              {profile.totalRaces || 12} Races
            </div>
          </div>

          {/* Settings & Audio Controls */}
          <button
            onClick={() => { sound.playClick(); onOpenSettings(); }}
            className="w-8 h-8 rounded-md bg-[#0b2239] hover:bg-[#153a5e] border border-[#1b4b7a] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            className="w-8 h-8 rounded-md bg-[#0b2239] hover:bg-[#153a5e] border border-[#1b4b7a] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </nav>

      {/* 2. Main Content Container (TypeRacer Layout) */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 flex-1 flex flex-col gap-5 z-10">
        
        {/* CARD 1: PRIMARY HERO CARD - "Enter a Typing Race" */}
        <div className="w-full rounded-2xl bg-white text-slate-900 p-6 md:p-8 shadow-xl border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16426a]">
                Meanwhile - The Global Typing Competition
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Increase your typing speed while racing in 3D against drivers worldwide!
              </p>

              {/* Big Green Action Button */}
              <div className="mt-2">
                <button
                  onClick={() => {
                    sound.playCountdownTick(2);
                    onRaceNow();
                  }}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2ea44f] hover:bg-[#2c974b] active:scale-95 text-white font-extrabold text-lg flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-green-900/20 transition-all uppercase tracking-wide"
                >
                  <Play className="w-5 h-5 fill-white text-white" />
                  Enter a Typing Race
                </button>
              </div>

              {/* Sub-bar options */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Language:</span>
                  <span className="font-bold text-slate-800">English</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Instant Death Mode:</span>
                  <button
                    type="button"
                    onClick={() => setInstantDeath(!instantDeath)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${instantDeath ? 'bg-rose-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${instantDeath ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900" onClick={onOpenTracks}>
                  <span className="text-slate-500">Circuit:</span>
                  <span className="font-bold text-[#16426a] underline">{currentTrack.name}</span>
                </div>
              </div>
            </div>

            {/* Right Illustration: Classic High-Speed Racing Truck / Machine (Matching Photo 1) */}
            <div className="md:col-span-5 flex items-center justify-center relative">
              <svg viewBox="0 0 380 200" className="w-full max-w-[340px] drop-shadow-md">
                {/* Checkered flag backdrop */}
                <g opacity="0.12">
                  <rect x="220" y="20" width="30" height="30" fill="#000" />
                  <rect x="250" y="20" width="30" height="30" fill="#fff" />
                  <rect x="280" y="20" width="30" height="30" fill="#000" />
                  <rect x="220" y="50" width="30" height="30" fill="#fff" />
                  <rect x="250" y="50" width="30" height="30" fill="#000" />
                  <rect x="280" y="50" width="30" height="30" fill="#fff" />
                </g>

                {/* Road surface */}
                <rect x="10" y="150" width="360" height="12" rx="4" fill="#334155" />
                <rect x="30" y="154" width="40" height="4" fill="#fff" />
                <rect x="90" y="154" width="40" height="4" fill="#fff" />
                <rect x="150" y="154" width="40" height="4" fill="#fff" />
                <rect x="210" y="154" width="40" height="4" fill="#fff" />
                <rect x="270" y="154" width="40" height="4" fill="#fff" />

                {/* Classic Red Racing Truck Body (matching reference image) */}
                <g>
                  {/* Bed cargo (Golden Hay/Engine Block) */}
                  <ellipse cx="270" cy="95" rx="50" ry="38" fill="#eab308" />
                  <ellipse cx="270" cy="95" rx="35" ry="25" fill="#ca8a04" />
                  {/* Wood slats */}
                  <rect x="210" y="105" width="115" height="8" rx="2" fill="#78350f" />
                  <rect x="210" y="120" width="115" height="8" rx="2" fill="#78350f" />
                  <rect x="210" y="95" width="8" height="35" rx="1" fill="#451a03" />
                  <rect x="260" y="95" width="8" height="35" rx="1" fill="#451a03" />
                  <rect x="315" y="95" width="8" height="35" rx="1" fill="#451a03" />

                  {/* Cab */}
                  <path d="M120 145 L215 145 L215 85 L165 85 L135 115 L120 120 Z" fill="#dc2626" />
                  {/* Cab roof highlight */}
                  <path d="M165 85 L215 85 L215 90 L163 90 Z" fill="#ef4444" />
                  {/* Window */}
                  <path d="M168 92 L205 92 L205 118 L148 118 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                  {/* Hood */}
                  <path d="M80 145 L120 145 L120 120 L75 125 Z" fill="#b91c1c" />
                  {/* Chrome bumper */}
                  <rect x="70" y="138" width="14" height="8" rx="3" fill="#cbd5e1" stroke="#64748b" />
                  {/* Chrome grill */}
                  <rect x="74" y="125" width="6" height="15" rx="1" fill="#e2e8f0" />
                  {/* Headlight */}
                  <circle cx="82" cy="126" r="4" fill="#fef08a" stroke="#ca8a04" />

                  {/* Wide Wheels (matching Photo 1 & Photo 2) */}
                  {/* Front Wheel */}
                  <circle cx="115" cy="148" r="24" fill="#1e293b" />
                  <circle cx="115" cy="148" r="16" fill="#94a3b8" />
                  <circle cx="115" cy="148" r="8" fill="#475569" />

                  {/* Rear Wheel */}
                  <circle cx="280" cy="148" r="26" fill="#1e293b" />
                  <circle cx="280" cy="148" r="18" fill="#94a3b8" />
                  <circle cx="280" cy="148" r="9" fill="#475569" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* CARD 2: "Quote of the Day" (Matching Photo 1 Card 2) */}
        <div className="w-full rounded-2xl bg-white text-slate-900 p-6 md:p-7 shadow-xl border border-slate-200 relative overflow-hidden flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="md:col-span-7 flex flex-col gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#16426a]">
                Quote of the Day
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                The daily typing speed race from classic books and iconic songs!
              </p>

              <div className="mt-2">
                <button
                  onClick={() => {
                    sound.playCountdownTick(2);
                    onStartSolo('medium');
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2ea44f] hover:bg-[#2c974b] active:scale-95 text-white font-extrabold text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-green-900/20 transition-all uppercase tracking-wide"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  Play the Quote of the Day
                </button>
              </div>
            </div>

            {/* Right Illustration: Yellow Sports Coupe (Matching Photo 1) */}
            <div className="md:col-span-5 flex items-center justify-center">
              <svg viewBox="0 0 360 160" className="w-full max-w-[320px] drop-shadow-md">
                {/* Road */}
                <rect x="10" y="130" width="340" height="10" rx="3" fill="#334155" />
                <rect x="40" y="133" width="50" height="4" fill="#fff" />
                <rect x="130" y="133" width="50" height="4" fill="#fff" />
                <rect x="220" y="133" width="50" height="4" fill="#fff" />

                {/* Yellow Sports Car (Matching reference image) */}
                <g>
                  {/* Car body */}
                  <path d="M50 120 L75 88 L140 68 L240 68 L290 92 L320 100 L320 120 Z" fill="#eab308" />
                  {/* Roof & Pillars */}
                  <path d="M125 70 L160 52 L225 52 L255 70 Z" fill="#ca8a04" />
                  {/* Windows */}
                  <path d="M135 68 L163 56 L220 56 L245 68 Z" fill="#38bdf8" opacity="0.8" />
                  {/* Window divider */}
                  <line x1="185" y1="56" x2="185" y2="68" stroke="#1e293b" strokeWidth="2" />
                  {/* Side black stripe */}
                  <rect x="60" y="105" width="250" height="6" fill="#1e293b" />
                  {/* Wheels */}
                  <circle cx="105" cy="125" r="22" fill="#0f172a" />
                  <circle cx="105" cy="125" r="14" fill="#cbd5e1" />
                  <circle cx="105" cy="125" r="6" fill="#475569" />

                  <circle cx="270" cy="125" r="22" fill="#0f172a" />
                  <circle cx="270" cy="125" r="14" fill="#cbd5e1" />
                  <circle cx="270" cy="125" r="6" fill="#475569" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: 2 SPLIT CARDS (Side-by-Side 50/50 Grid - Matching Photo 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card Left: "Typing Test / Practice Yourself" */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#16426a]">
                Typing Test
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Improve your typing skills on your own vs pacing bots
              </p>

              {/* Difficulty Dropdown / Selector */}
              <div className="mt-4 flex items-center gap-2">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:border-[#16426a]"
                >
                  <option value="medium">Default (Pro ~70 WPM)</option>
                  <option value="easy">Rookie (~45 WPM)</option>
                  <option value="hard">Legend (~95 WPM)</option>
                </select>
                <div 
                  className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 cursor-pointer"
                  title="Select AI Bot target pacing"
                >
                  ?
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  sound.playCountdownTick(2);
                  onStartSolo(selectedDifficulty);
                }}
                className="px-6 py-3 rounded-xl bg-[#0969da] hover:bg-[#085ac2] active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-blue-900/20 transition-all uppercase"
              >
                Practice Yourself
              </button>

              {/* Red Car Graphic */}
              <svg viewBox="0 0 160 80" className="w-24 drop-shadow-sm">
                <path d="M20 60 L35 45 L65 35 L115 35 L140 50 L150 60 Z" fill="#ef4444" />
                <path d="M60 36 L75 25 L105 25 L118 36 Z" fill="#b91c1c" />
                <circle cx="45" cy="62" r="12" fill="#1e293b" />
                <circle cx="45" cy="62" r="6" fill="#cbd5e1" />
                <circle cx="125" cy="62" r="12" fill="#1e293b" />
                <circle cx="125" cy="62" r="6" fill="#cbd5e1" />
              </svg>
            </div>
          </div>

          {/* Card Right: "Race your friends" */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#16426a]">
                Race your friends
              </h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Create your own racetrack and play with friends
              </p>

              {/* Track Code Input */}
              <form onSubmit={handleJoinTrack} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="CODE (e.g. CHN-882)"
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 uppercase"
                  maxLength={16}
                />
                <button
                  type="submit"
                  disabled={!trackIdInput.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-xs uppercase cursor-pointer whitespace-nowrap"
                >
                  Join
                </button>
              </form>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onCreatePrivate();
                }}
                className="px-6 py-3 rounded-xl bg-[#e36209] hover:bg-[#cc5507] active:scale-95 text-white font-extrabold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-orange-900/20 transition-all uppercase"
              >
                Create Racetrack
              </button>

              {/* Dual Racing Cars Graphic */}
              <svg viewBox="0 0 160 80" className="w-24 drop-shadow-sm">
                {/* Back car */}
                <path d="M10 50 L25 38 L55 30 L95 30 L115 42 L125 50 Z" fill="#3b82f6" opacity="0.75" />
                <circle cx="35" cy="52" r="10" fill="#1e293b" />
                <circle cx="100" cy="52" r="10" fill="#1e293b" />
                {/* Front car */}
                <path d="M30 65 L45 50 L75 42 L125 42 L145 55 L155 65 Z" fill="#f97316" />
                <circle cx="55" cy="67" r="11" fill="#0f172a" />
                <circle cx="55" cy="67" r="5" fill="#cbd5e1" />
                <circle cx="130" cy="67" r="11" fill="#0f172a" />
                <circle cx="130" cy="67" r="5" fill="#cbd5e1" />
              </svg>
            </div>
          </div>
        </div>

        {/* SPONSORED MONETIZATION BANNER (728x90 Leaderboard) */}
        <AdBanner 
          slotId="ad-lobby-mid-leaderboard" 
          format="leaderboard" 
          className="my-1"
        />

        {/* Active Circuit & Machine Telemetry Strip */}
        <div className="w-full rounded-xl bg-[#10304f] border border-[#1b4b7a] p-3 sm:p-4 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Active Circuit: {currentTrack.name}
            </span>
            <span className="text-slate-400 hidden sm:inline">({currentTrack.location})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTracks}
              className="px-3 py-1 rounded bg-[#153a5e] hover:bg-[#1c4b78] text-white font-medium cursor-pointer"
            >
              Switch Circuit
            </button>
            <button
              onClick={onOpenGarage}
              className="px-3 py-1 rounded bg-[#153a5e] hover:bg-[#1c4b78] text-white font-medium cursor-pointer"
            >
              Tuning & Livery
            </button>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full bg-[#10304f] border-t border-[#1b4b7a] px-4 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-400">
        <span>© 2026 MEANWHILE • THE 3D MULTIPLAYER TYPING COMPETITION</span>
        <span className="hidden sm:inline">AUTHORITATIVE 60FPS TICK PROTOCOL</span>
      </footer>
    </div>
  );
};
