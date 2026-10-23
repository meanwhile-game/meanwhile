import React, { useState, useEffect } from 'react';
import { TypingEngine } from './TypingEngine.js';
import { RaceMinimap } from './RaceMinimap.js';
import { LogOut, CheckCircle2, Camera } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

export interface RacerHudData {
  id: string;
  username: string;
  avatar: string;
  vehicleId: string;
  vehicleColor: string;
  isAi: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  placement: number | null;
  finishTime: number | null;
  isLocal: boolean;
}

interface RaceHudProps {
  passageText: string;
  passageTitle: string;
  passageCategory: string;
  passageAuthor?: string;
  passageSourceType?: string;
  passageYear?: number | string;
  trackId?: string;
  trackName?: string;
  isRacing: boolean;
  countdown: number;
  racers: RacerHudData[];
  localStats: {
    wpm: number;
    accuracy: number;
    progress: number;
    currentTypedIndex: number;
  };
  cameraMode?: 'chase' | 'broadcast';
  onToggleCamera?: () => void;
  onKeystroke: (index: number, char: string, isError: boolean) => void;
  onStatsUpdate: (stats: { wpm: number; accuracy: number; progress: number; currentTypedIndex: number }) => void;
  onExitRace: () => void;
}

export const RaceHud: React.FC<RaceHudProps> = ({
  passageText,
  passageTitle,
  passageCategory,
  passageAuthor,
  passageSourceType,
  passageYear,
  trackId,
  trackName,
  isRacing,
  countdown,
  racers,
  localStats,
  cameraMode = 'chase',
  onToggleCamera,
  onKeystroke,
  onStatsUpdate,
  onExitRace,
}) => {
  const { isLight } = useTheme();
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setShowGo(true);
      const t = setTimeout(() => setShowGo(false), 1200);
      return () => clearTimeout(t);
    } else {
      setShowGo(false);
    }
  }, [countdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.ctrlKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        onToggleCamera?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCamera]);

  const sortedRacers = [...racers].sort((a, b) => {
    if (a.placement && b.placement) return a.placement - b.placement;
    if (a.placement) return -1;
    if (b.placement) return 1;
    return b.progress - a.progress;
  });

  const localRank = sortedRacers.findIndex(r => r.isLocal) + 1;
  const speedKmh = Math.round(localStats.wpm * 2.8);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10 select-none">
      {/* Bottom Cinematic Cockpit Vignette to blend road naturally into telemetry */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent pointer-events-none" />

      {/* --- TOP BAR: POSITION, TYPERACER LIVE RACETRACK, & EXIT --- */}
      <div className="w-full flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
        {/* Placement Pill */}
        <div 
          className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md text-xs font-mono flex items-center gap-2 shadow-lg"
        >
          <span className="px-2 py-0.5 rounded font-black text-center text-xs bg-amber-500 text-black shadow-sm">
            P{localRank || 1}
          </span>
          <span className="text-slate-300 font-bold hidden sm:inline">
            of {racers.length} Drivers
          </span>
        </div>

        {/* TypeRacer-Style Live Racing Track Lanes */}
        <div className="flex-1 max-w-2xl mx-1 md:mx-4 p-2 md:p-2.5 rounded-xl border border-slate-800 bg-slate-950/85 backdrop-blur-md shadow-2xl flex flex-col gap-1 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GRAND PRIX SPRINT ({racers.length} CARS)
            </span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              🏁 FINISH
            </span>
          </div>

          {/* Racetrack Lanes */}
          <div className="flex flex-col gap-1">
            {racers.map((racer) => {
              const progPercent = Math.min(100, Math.max(0, racer.progress * 100));
              return (
                <div 
                  key={racer.id}
                  className={`relative h-6 rounded-md flex items-center px-2 transition-colors ${
                    racer.isLocal 
                      ? 'bg-slate-800/90 border border-cyan-500/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]' 
                      : 'bg-slate-900/60 border border-slate-800/70'
                  }`}
                >
                  {/* Dashed center lane guide */}
                  <div className="absolute inset-x-14 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700/50 pointer-events-none" />

                  {/* Left Pilot Name Tag */}
                  <div className="w-24 shrink-0 flex items-center gap-1.5 text-[10px] font-mono truncate z-10">
                    <span className="text-xs">{racer.avatar || '🏎️'}</span>
                    <span className={`truncate font-bold ${racer.isLocal ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {racer.isLocal ? 'YOU' : racer.username}
                    </span>
                  </div>

                  {/* Lane Race Track Field */}
                  <div className="relative flex-1 h-full mx-1">
                    {/* Goalpost checkered line */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 opacity-50 bg-repeating-checkered border-l border-white/40" />

                    {/* Animated Car Node */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center transition-all duration-150 ease-out z-20"
                      style={{ left: `${Math.min(94, Math.max(4, progPercent))}%` }}
                    >
                      {/* Live Floating WPM Badge */}
                      <div 
                        className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded text-[8px] font-mono font-black whitespace-nowrap shadow-md ${
                          racer.isLocal 
                            ? 'bg-cyan-400 text-black border border-cyan-200' 
                            : 'bg-slate-800 text-amber-300 border border-slate-700'
                        }`}
                      >
                        {racer.wpm} WPM
                      </div>

                      {/* 2D Car Sprite Indicator */}
                      <div 
                        className="w-5 h-3 rounded-sm flex items-center justify-center text-[10px] shadow-lg border relative"
                        style={{ 
                          backgroundColor: racer.vehicleColor || '#38bdf8',
                          borderColor: racer.isLocal ? '#ffffff' : '#475569'
                        }}
                      >
                        {racer.wpm > 10 && (
                          <div className="absolute -left-1.5 w-1.5 h-1 rounded-l bg-amber-400 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage / Status */}
                  <div className="w-10 shrink-0 text-right text-[10px] font-mono font-bold">
                    {racer.finishTime || progPercent >= 100 ? (
                      <span className="text-emerald-400 font-extrabold">FINISH</span>
                    ) : (
                      <span className={racer.isLocal ? 'text-cyan-400' : 'text-slate-400'}>
                        {Math.round(progPercent)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Camera Toggle & Exit */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              title="Toggle Camera Mode: 3D Chase vs 2.5D Speedway (Alt+V)"
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-800 hover:border-cyan-500/60 hover:text-cyan-300 shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                {cameraMode === 'broadcast' ? '2.5D Speedway' : '3D Chase'}
              </span>
            </button>
          )}

          {/* Exit Button */}
          <button
            type="button"
            onClick={onExitRace}
            className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer transition-all hover:bg-slate-800 hover:border-slate-500 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Exit Grid</span>
          </button>
        </div>
      </div>

      {/* --- RESTRAINED COUNTDOWN OVERLAY --- */}
      {countdown > 0 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50 pointer-events-none">
          <div 
            className="px-8 py-6 rounded-2xl border flex flex-col items-center gap-4 shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
          >
            <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              STARTING GRID SEQUENCE
            </div>

            {/* 5 Clean F1 Lights */}
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((lightIdx) => {
                const isLit = (4 - countdown) >= lightIdx;
                return (
                  <div
                    key={lightIdx}
                    className="w-5 h-5 rounded-full border transition-all duration-150"
                    style={{
                      backgroundColor: isLit ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                      borderColor: isLit ? '#f87171' : 'rgba(239, 68, 68, 0.3)'
                    }}
                  />
                );
              })}
            </div>

            <div className="font-num font-bold text-6xl" style={{ color: 'var(--text-primary)' }}>
              {countdown}
            </div>
          </div>
        </div>
      )}

      {/* GO Indicator (Subtle, disappears after 1.2s) */}
      {showGo && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div 
            className="font-black text-7xl font-sans tracking-tight"
            style={{ color: 'var(--accent)' }}
          >
            GO
          </div>
        </div>
      )}

      {/* --- RADAR MINIMAP & STANDINGS SIDEBAR (Top Right) --- */}
      <div className="hidden sm:flex absolute right-4 md:right-6 top-16 md:top-20 pointer-events-auto flex-col items-end gap-2.5">
        {/* Real-time Track Radar Minimap (matches tnonline.world reference) */}
        <RaceMinimap
          trackId={trackId}
          trackName={trackName}
          localProgress={localStats.progress}
          racers={racers}
        />

        {/* Live Grid Standings Panel */}
        <div 
          className="w-44 p-2.5 rounded-xl border shadow-lg flex flex-col gap-1.5 backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Live Grid</span>
            <span style={{ color: 'var(--accent)' }}>● RACE</span>
          </div>

          <div className="flex flex-col gap-1">
            {sortedRacers.slice(0, 4).map((racer, idx) => (
              <div
                key={racer.id}
                className="flex items-center justify-between px-1.5 py-0.5 rounded text-xs font-num transition-colors"
                style={racer.isLocal ? { backgroundColor: 'var(--accent-subtle)' } : {}}
              >
                <div className="flex items-center gap-1 truncate">
                  <span className="font-medium text-[10px] w-3" style={{ color: 'var(--text-muted)' }}>
                    {racer.placement ? `#${racer.placement}` : `${idx + 1}`}
                  </span>
                  <span className="text-xs">{racer.avatar}</span>
                  <span className="truncate max-w-[75px] font-sans text-[11px]" style={{ color: 'var(--text-primary)' }}>
                    {racer.username}
                  </span>
                </div>
                <div className="font-semibold text-[11px]" style={{ color: 'var(--accent)' }}>
                  {racer.wpm} <span className="text-[9px] font-normal" style={{ color: 'var(--text-muted)' }}>WPM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- COCKPIT TYPING HUD (Center Bottom) --- */}
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-1.5 pointer-events-auto mb-1">
        {/* Telemetry Numbers Strip */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Pace</span>
              <span className="text-xl font-black font-mono text-cyan-400">
                {localStats.wpm} <span className="text-[10px] font-normal text-slate-400">WPM</span>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Velocity</span>
              <span className="text-xl font-black font-mono text-white">
                {speedKmh} <span className="text-[10px] font-normal text-slate-400">KM/H</span>
              </span>
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-baseline gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Precision</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                {localStats.accuracy}%
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-right text-xs">
            <div className="flex items-center justify-end gap-1.5">
              {passageSourceType && (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-bold">
                  {passageSourceType === 'book' ? '📖 Book' : passageSourceType === 'song' ? '🎵 Song' : passageSourceType === 'speech' ? '🎙️ Speech' : '📰 Article'}
                </span>
              )}
              <span className="font-bold text-white text-xs truncate max-w-[200px]">{passageTitle}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {passageAuthor ? `${passageAuthor}${passageYear ? ` (${passageYear})` : ''} • ` : ''}{passageCategory}
            </span>
          </div>
        </div>

        {/* Passage Typing Card */}
        <div 
          className="p-2.5 sm:p-3 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-slate-700/60 bg-slate-950/70 backdrop-blur-md"
        >
          <TypingEngine
            passageText={passageText}
            isRacing={isRacing}
            onKeystroke={onKeystroke}
            onStatsUpdate={onStatsUpdate}
          />
        </div>
      </div>
    </div>
  );
};
