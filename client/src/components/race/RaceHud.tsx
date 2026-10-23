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
  onBackspace?: () => void;
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
  onBackspace,
  onStatsUpdate,
  onExitRace,
}) => {
  const { isLight } = useTheme();
  const [showGo, setShowGo] = useState(false);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState('0:00:000');

  useEffect(() => {
    if (isRacing && !raceStartTime) {
      setRaceStartTime(Date.now());
    } else if (!isRacing && countdown > 0) {
      setRaceStartTime(null);
      setElapsedTime('0:00:000');
    }
  }, [isRacing, countdown, raceStartTime]);

  useEffect(() => {
    if (!isRacing || !raceStartTime) return;
    const interval = setInterval(() => {
      const ms = Date.now() - raceStartTime;
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      const millis = Math.floor(ms % 1000);
      setElapsedTime(`${mins}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(3, '0')}`);
    }, 40);
    return () => clearInterval(interval);
  }, [isRacing, raceStartTime]);

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

  // Dynamic F1 Cockpit Gear & RPM (Matching Photo 2)
  const currentGear = speedKmh < 30 ? 1 : speedKmh < 75 ? 2 : speedKmh < 130 ? 3 : speedKmh < 190 ? 4 : speedKmh < 250 ? 5 : 6;
  const gearBases = [0, 0, 30, 75, 130, 190, 250];
  const gearRanges = [30, 30, 45, 55, 60, 60, 80];
  const speedInGear = Math.max(0, speedKmh - gearBases[currentGear]);
  const fractionInGear = Math.min(1.0, speedInGear / gearRanges[currentGear]);
  const baseRpm = 4500 + Math.round(fractionInGear * 4800);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10 select-none">
      {/* Bottom Cinematic Cockpit Vignette to blend road naturally into telemetry */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent pointer-events-none" />

      {/* --- TOP BAR: PHOTO 2 LAP, TIMER, RACETRACK, & EXIT --- */}
      <div className="w-full flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
        {/* Lap Indicator (Photo 2 Top Left) */}
        <div className="flex flex-col items-center px-3.5 py-1.5 rounded-xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md shadow-lg shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Lap</span>
          <div className="w-12 h-0.5 bg-white/60 my-0.5" />
          <span className="text-sm font-black font-mono text-white tracking-widest">1 / 1</span>
        </div>

        {/* TypeRacer-Style Live Racing Track Lanes */}
        <div className="flex-1 max-w-xl mx-1 md:mx-4 p-2 rounded-xl border border-slate-800 bg-slate-950/85 backdrop-blur-md shadow-2xl flex flex-col gap-1 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MEANWHILE GRAND PRIX ({racers.length} CARS)
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
                  className={`relative h-5 rounded-md flex items-center px-2 transition-colors ${
                    racer.isLocal 
                      ? 'bg-slate-800/90 border border-cyan-500/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]' 
                      : 'bg-slate-900/60 border border-slate-800/70'
                  }`}
                >
                  {/* Dashed center lane guide */}
                  <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-700/50 pointer-events-none" />

                  {/* Left Pilot Name Tag */}
                  <div className="w-20 shrink-0 flex items-center gap-1 text-[10px] font-mono truncate z-10">
                    <span className="text-[10px]">{racer.avatar || '🏎️'}</span>
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
                        className="w-4 h-2.5 rounded-xs flex items-center justify-center text-[8px] shadow-lg border relative"
                        style={{ 
                          backgroundColor: racer.vehicleColor || '#38bdf8',
                          borderColor: racer.isLocal ? '#ffffff' : '#475569'
                        }}
                      />
                    </div>
                  </div>

                  {/* Percentage / Status */}
                  <div className="w-8 shrink-0 text-right text-[9px] font-mono font-bold">
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

        {/* Race Timer & Controls (Photo 2 Top Right) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-950/75 border border-slate-800/80 backdrop-blur-md shadow-lg font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">- / -</span>
              <span className="text-xs font-black text-cyan-300 tracking-wider">{elapsedTime}</span>
            </div>
            <div className="w-20 h-0.5 bg-cyan-400/80 my-0.5" />
            <div className="text-[9px] text-slate-400">BEST <span className="text-white font-bold ml-1.5">-</span></div>
          </div>

          {onToggleCamera && (
            <button
              type="button"
              onClick={onToggleCamera}
              title="Camera Mode (Alt+V)"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 shadow-md transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onExitRace}
            title="Exit Grid"
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-rose-400 hover:border-rose-500 shadow-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- 3 HUGE CIRCULAR F1 STARTING LIGHTS (Matching Photo 2 Top Center) --- */}
      {(countdown > 0 || showGo) && (
        <div className="fixed top-8 sm:top-14 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 sm:gap-10 z-50 pointer-events-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
          {[1, 2, 3].map((bulbIdx) => {
            const isRedLit = countdown > 0 && (4 - countdown) >= bulbIdx;
            const isGreenLit = showGo;

            return (
              <div
                key={bulbIdx}
                className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-150"
                style={{
                  background: isGreenLit
                    ? 'radial-gradient(circle at 35% 35%, #a7f3d0 0%, #10b981 50%, #047857 100%)'
                    : isRedLit
                    ? 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #ef4444 50%, #991b1b 100%)'
                    : 'radial-gradient(circle at 35% 35%, #450a0a 0%, #250505 70%, #100202 100%)',
                  boxShadow: isGreenLit
                    ? '0 0 40px #10b981, 0 0 80px #059669, inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -4px 8px rgba(0,0,0,0.6)'
                    : isRedLit
                    ? '0 0 40px #ef4444, 0 0 80px #b91c1c, inset 0 3px 6px rgba(255,255,255,0.7), inset 0 -4px 8px rgba(0,0,0,0.6)'
                    : '0 4px 12px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -4px 8px rgba(0,0,0,0.9)',
                  border: isGreenLit
                    ? '5px solid #34d399'
                    : isRedLit
                    ? '5px solid #f87171'
                    : '5px solid #1a0505'
                }}
              >
                {/* 3D Glass Specular Reflection Highlight */}
                <div className="absolute top-2.5 left-3.5 w-6 h-3 rounded-full bg-white/40 blur-[1px] transform -rotate-12 pointer-events-none" />
              </div>
            );
          })}
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
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-1.5 pointer-events-auto mb-1.5">
        {/* Photo 2 Cockpit Telemetry: [G] Mode, Big White Gear [1], RPM, Digital [Kph 0] */}
        <div className="flex items-end justify-center gap-6 mb-1">
          {/* Gear Shift Mode Box [G] */}
          <div className="w-9 h-9 rounded-lg bg-black/70 border border-slate-700/80 flex items-center justify-center text-sm font-black text-white/90 shadow-lg">
            G
          </div>

          {/* Big White Gear Indicator (Photo 2) */}
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl font-black text-white font-sans drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none">
              {currentGear}
            </span>
            {/* RPM Curved Arc / Text */}
            <span className="text-[11px] font-mono font-bold text-rose-500 mt-1 uppercase tracking-wider">
              Rpm {baseRpm}
            </span>
          </div>

          {/* Digital Speedometer Box (Photo 2) */}
          <div className="px-3 py-1.5 rounded-lg bg-black/80 border border-slate-700/90 flex flex-col items-center min-w-[72px] shadow-lg">
            <span className="text-[10px] font-mono font-bold text-slate-200 uppercase">
              Kph {speedKmh}
            </span>
            <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-100"
                style={{ width: `${Math.min(100, (speedKmh / 280) * 100)}%` }}
              />
            </div>
          </div>
        </div>

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
          className="p-3 sm:p-3.5 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] border border-slate-700/80 bg-slate-950/85 backdrop-blur-xl ring-1 ring-white/10"
        >
          <TypingEngine
            passageText={passageText}
            isRacing={isRacing}
            onKeystroke={onKeystroke}
            onBackspace={onBackspace}
            onStatsUpdate={onStatsUpdate}
          />
        </div>
      </div>
    </div>
  );
};
