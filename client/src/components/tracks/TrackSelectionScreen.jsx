import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { TRACKS } from '../../data/tracks.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Users, 
  Lock, 
  Clock, 
  Compass, 
  Sparkles, 
  AlertCircle,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'upcoming'
  const [lockedNotification, setLockedNotification] = useState(null);

  const activeTracks = TRACKS.filter(t => !t.isLocked);
  const lockedTracks = TRACKS.filter(t => t.isLocked);

  const handleSelectTrack = (track) => {
    soundEngine.playButtonClick();
    if (track.isLocked) {
      setLockedNotification(`${track.name} is currently under development for Season 2! Please choose one of the ${activeTracks.length} active circuits.`);
      setTimeout(() => setLockedNotification(null), 3500);
      return;
    }
    setLockedNotification(null);
    setSelectedTrackId(track.id);
  };

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

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-8 flex flex-col justify-between select-none">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-[#f8fafc]">meanwhile</span>
          </button>

          {/* Tab Filter: Active Circuits vs Upcoming Circuits */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0c1222] border border-white/[0.08]">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('active');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              Active Circuits ({activeTracks.length})
            </button>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                setActiveTab('upcoming');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upcoming'
                  ? 'bg-white/15 text-[#f8fafc] shadow-sm'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Upcoming & Locked ({lockedTracks.length})</span>
            </button>
          </div>
        </div>

        {/* Title & Notification */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#f8fafc]">
              {activeTab === 'active' ? 'Grand Prix Circuits' : 'Expansion Circuits (Under Development)'}
            </h1>
            <p className="text-sm sm:text-base text-[#94a3b8] mt-1.5">
              {activeTab === 'active' 
                ? `${activeTracks.length} curated circuits for different driving moods. Select your asphalt.`
                : 'Upcoming expansion circuits scheduled for Season 2: Hyderabad, Bangalore, Mumbai.'}
            </p>
          </div>

          {lockedNotification && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{lockedNotification}</span>
            </div>
          )}
        </div>

        {/* --- ACTIVE CIRCUITS GRID (Matching Reference Image Layout) --- */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {activeTracks.map((track) => {
              const isSelected = selectedTrackId === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                    isSelected
                      ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-[0_0_35px_-5px_rgba(56,189,248,0.35)] scale-[1.01]'
                      : 'border-white/[0.08] hover:border-white/[0.22] bg-[#0c1222] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
                  }`}
                >
                  {/* Hero Image Stage */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <img
                      src={track.mainImage}
                      alt={track.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/tracks/circuits-reference.jpg';
                      }}
                    />
                    {/* Aesthetic gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                    {/* Top Bar: Circuit Badge & Selection Indicator */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-sky-400 shadow-md">
                          CIRCUIT {track.circuitNumber}
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="px-3.5 py-1 rounded-full bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-400/30 flex items-center gap-1.5 animate-pulse">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-300 group-hover:border-sky-400/40 group-hover:text-white transition-all shadow-md">
                          Select
                        </span>
                      )}
                    </div>

                    {/* Bottom-Left Track Title & Subtitle matching Reference Artwork */}
                    <div className="absolute bottom-4 left-4 max-w-[62%] pointer-events-none z-10">
                      <h2 className="text-xl sm:text-2xl font-black text-[#f8fafc] tracking-tight uppercase drop-shadow-lg">
                        {track.name}
                      </h2>
                      <p className="text-xs text-[#cbd5e1] font-medium drop-shadow-md line-clamp-1 mt-0.5">
                        {track.subtitle}
                      </p>
                    </div>

                    {/* Minimap Contour Floating Card on the Right */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-2 rounded-xl shadow-2xl pointer-events-none z-10">
                      <div className="w-11 h-13 flex items-center justify-center">
                        <svg viewBox="0 0 100 120" className="w-full h-full fill-none stroke-sky-400 stroke-[3.5]">
                          <path d={track.svgPath} />
                        </svg>
                      </div>
                      <div className="text-xs font-mono-num space-y-0.5 text-white">
                        <div className="font-bold text-sm tracking-tight">{track.distanceKm} KM</div>
                        <div className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase">{track.laps} LAPS</div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Gallery Thumbnails Strip matching Reference Image Bottom */}
                  <div className="p-4 bg-[#0a0f1d] border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      {track.thumbnails?.map((thumb, idx) => (
                        <div
                          key={idx}
                          className="w-16 sm:w-20 h-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative group/thumb hover:border-sky-400/80 transition-all duration-200 shadow-sm"
                        >
                          <img 
                            src={thumb} 
                            alt={`${track.name} detail ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-115"
                            onError={(e) => {
                              e.currentTarget.src = track.mainImage;
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0 pl-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Pace</span>
                      <span className="text-xs text-sky-400 font-semibold">
                        {track.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- LOCKED UPCOMING EXPANSION CIRCUITS (Under Development) --- */}
        {activeTab === 'upcoming' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {lockedTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0c1222]/60 cursor-not-allowed group opacity-85 hover:opacity-100 transition-opacity"
              >
                {/* Image Background */}
                <div className="relative aspect-[16/9] w-full overflow-hidden filter grayscale-[35%]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${track.mainImage}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-[#0c1222]/80 to-black/70" />

                  {/* Header */}
                  <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono-num font-bold text-amber-400 border-b border-amber-400">
                          {track.circuitNumber}
                        </span>
                        <h2 className="text-xl font-black text-[#f8fafc] tracking-tight">
                          {track.name}
                        </h2>
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-1">
                        {track.subtitle}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{track.statusBadge}</span>
                    </span>
                  </div>

                  {/* Centered Lock Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 mb-2 shadow-2xl">
                      <Lock className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                      Under Development
                    </span>
                    <p className="text-xs text-[#94a3b8] max-w-sm mt-1">
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="p-4 bg-[#0a0f1d] border-t border-white/[0.06] flex items-center justify-between text-xs text-[#64748b]">
                  <span>{track.distanceKm} KM · {track.laps} Laps</span>
                  <span className="text-amber-400/80 font-semibold">{track.releaseSeason}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Control Bar matching Reference Image */}
      <div className="max-w-7xl mx-auto w-full pt-10 pb-4 border-t border-white/[0.06] mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Start Race Button */}
        <button
          onClick={handleStartRace}
          className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
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
                    ? 'bg-white/[0.14] text-[#f8fafc] border border-white/30 shadow-sm'
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
