import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { TRACKS } from '../../data/tracks.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowLeft, ArrowRight, Zap, Users, Lock, Clock, Gauge, Compass } from 'lucide-react';

export const TrackSelectionScreen = () => {
  const { 
    setView, 
    selectedTrackId, 
    setSelectedTrackId, 
    gameMode, 
    setGameMode, 
    initRace,
    setMultiplayerModalOpen
  } = useGameStore();

  const handleStartRace = () => {
    soundEngine.playButtonClick();
    if (gameMode === 'private_room' || gameMode === 'multiplayer') {
      setMultiplayerModalOpen(true);
    } else {
      initRace();
    }
  };

  const modes = [
    { id: 'quick_race', label: 'Quick Race', icon: Zap },
    { id: 'multiplayer', label: 'Multiplayer', icon: Users },
    { id: 'private_room', label: 'Private Room', icon: Lock },
    { id: 'time_trial', label: 'Time Trial', icon: Clock }
  ];

  // Cinematic preview images for the 4 tracks
  const trackImages = {
    'coastal-drive': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80',
    'neon-city': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    'mountain-pass': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'desert-run': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
  };

  // SVG circuit paths for each track minimap icon
  const trackSvgPaths = {
    'coastal-drive': 'M 10 35 C 10 15, 30 10, 50 15 C 70 20, 85 10, 90 25 C 95 40, 75 55, 55 50 C 35 45, 10 55, 10 35 Z',
    'neon-city': 'M 15 15 L 75 15 C 85 15, 85 30, 75 30 L 45 30 L 45 50 L 75 50 C 85 50, 85 65, 75 65 L 15 65 C 5 65, 5 15, 15 15 Z',
    'mountain-pass': 'M 15 50 C 25 20, 35 60, 45 25 C 55 60, 65 15, 75 40 C 85 20, 90 60, 80 65 C 50 70, 20 65, 15 50 Z',
    'desert-run': 'M 10 40 C 15 15, 70 10, 85 30 C 95 45, 80 65, 50 60 C 20 55, 5 60, 10 40 Z'
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-8 flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-[#f8fafc]">meanwhile</span>
          </button>
          <div className="text-xs text-[#64748b] tracking-wider uppercase">
            Select Track & Mode
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="pt-8 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f8fafc]">
            Choose Your Track
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] mt-1.5">
            Different roads for different moods.
          </p>
        </div>

        {/* 4 Track Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRACKS.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'border-amber-400/80 shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] scale-[1.02]'
                    : 'border-white/[0.08] hover:border-white/[0.2] bg-[#0c1222]/80 hover:bg-[#0e162a]'
                }`}
              >
                {/* Visual Image Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${trackImages[track.id]}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-[#0c1222]/30 to-black/20" />

                  {/* Track Minimap Spline Icon */}
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-black/50 backdrop-blur-md p-1.5 border border-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 100 80" className="w-full h-full fill-none stroke-amber-400 stroke-[3]">
                      <path d={trackSvgPaths[track.id] || ''} />
                    </svg>
                  </div>

                  {/* Difficulty Tag */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-amber-300">
                    {track.difficulty}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-[#0c1222]">
                  <div>
                    <h3 className="text-lg font-bold text-[#f8fafc] group-hover:text-amber-400 transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2 leading-relaxed">
                      {track.subtitle}
                    </p>
                  </div>

                  {/* Track Meta Details */}
                  <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>{track.distanceKm} KM · {track.laps} {track.laps === 1 ? 'Lap' : 'Laps'}</span>
                    <span className="text-slate-400">{track.turns}</span>
                  </div>
                </div>

                {/* Active Indicator Ring */}
                {isSelected && (
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] tracking-wider uppercase">
                    Active
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Control Bar matching Reference Image */}
      <div className="max-w-7xl mx-auto w-full pt-10 pb-4 border-t border-white/[0.06] mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Start Race Button */}
        <button
          onClick={handleStartRace}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
        >
          <span>Start Race</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Right: Game Mode Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = gameMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setGameMode(m.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.12] text-[#f8fafc] border border-white/30 shadow-sm'
                    : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
