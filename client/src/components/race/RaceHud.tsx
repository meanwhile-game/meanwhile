import React, { useState, useEffect } from 'react';
import { TypingEngine } from './TypingEngine.js';
import { LogOut, CheckCircle2 } from 'lucide-react';
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
  isRacing: boolean;
  countdown: number;
  racers: RacerHudData[];
  localStats: {
    wpm: number;
    accuracy: number;
    progress: number;
    currentTypedIndex: number;
  };
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
  isRacing,
  countdown,
  racers,
  localStats,
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
      {/* --- TOP BAR: POSITION, PROGRESS RAIL, & EXIT --- */}
      <div className="w-full flex items-center justify-between gap-4 pointer-events-auto">
        {/* Placement Pill */}
        <div 
          className="px-3.5 py-1.5 rounded-lg border text-xs font-num flex items-center gap-2.5 shadow-sm"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <span 
            className="w-5 h-5 rounded font-bold text-center leading-5 text-[11px]"
            style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
          >
            P{localRank || 1}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            of {racers.length} Drivers
          </span>
        </div>

        {/* Center: Slender Track Progress Rail */}
        <div 
          className="hidden md:flex flex-1 max-w-md mx-4 px-4 py-2 rounded-lg border flex-col gap-1 shadow-sm"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex justify-between items-center text-[10px] font-num" style={{ color: 'var(--text-muted)' }}>
            <span>START</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(localStats.progress * 100)}% COMPLETE
            </span>
            <span>FINISH</span>
          </div>

          <div 
            className="relative w-full h-1.5 rounded-full overflow-visible flex items-center"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            {/* Progress Fill */}
            <div 
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${Math.min(100, Math.max(2, localStats.progress * 100))}%`,
                backgroundColor: 'var(--accent)'
              }}
            />

            {/* Competitor Chips */}
            {racers.map((racer) => (
              <div
                key={racer.id}
                className="absolute transform -translate-x-1/2 transition-all duration-150"
                style={{ left: `${Math.min(97, Math.max(3, racer.progress * 100))}%` }}
                title={`${racer.username} (${racer.wpm} WPM)`}
              >
                <div 
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${
                    racer.isLocal ? 'ring-2 ring-white scale-125' : 'opacity-70'
                  }`}
                  style={{ backgroundColor: racer.vehicleColor, borderColor: '#ffffff' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitRace}
          className="px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exit Grid</span>
        </button>
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

      {/* --- STANDINGS SIDEBAR (Top Right) --- */}
      <div className="hidden lg:block absolute right-6 top-20 pointer-events-auto">
        <div 
          className="w-56 p-3 rounded-xl border shadow-lg flex flex-col gap-1.5"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
            <span>Live Standings</span>
            <span style={{ color: 'var(--accent)' }}>● LIVE</span>
          </div>

          <div className="flex flex-col gap-1">
            {sortedRacers.map((racer, idx) => (
              <div
                key={racer.id}
                className="flex items-center justify-between px-2 py-1 rounded text-xs font-num transition-colors"
                style={racer.isLocal ? { backgroundColor: 'var(--accent-subtle)' } : {}}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-medium text-[11px] w-3" style={{ color: 'var(--text-muted)' }}>
                    {racer.placement ? `#${racer.placement}` : `${idx + 1}`}
                  </span>
                  <span className="text-sm">{racer.avatar}</span>
                  <span className="truncate max-w-[85px] font-sans" style={{ color: 'var(--text-primary)' }}>
                    {racer.username}
                  </span>
                </div>
                <div className="font-semibold" style={{ color: 'var(--accent)' }}>
                  {racer.wpm} <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>WPM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- COCKPIT TYPING HUD (Center Bottom) --- */}
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2.5 pointer-events-auto mb-2">
        {/* Telemetry Numbers Strip */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-5 text-xs font-num">
            <div>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Pace</span>
              <span className="text-xl font-bold font-num" style={{ color: 'var(--accent)' }}>
                {localStats.wpm} <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>WPM</span>
              </span>
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

            <div>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Velocity</span>
              <span className="text-xl font-bold font-num" style={{ color: 'var(--text-primary)' }}>
                {speedKmh} <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>KM/H</span>
              </span>
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />

            <div>
              <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Precision</span>
              <span className="text-xl font-bold font-num" style={{ color: 'var(--text-primary)' }}>
                {localStats.accuracy}%
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-right text-xs">
            <div className="flex items-center justify-end gap-1.5">
              {passageSourceType && (
                <span 
                  className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border tracking-wider font-semibold"
                  style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--accent)' }}
                >
                  {passageSourceType === 'book' ? '📖 Book' : passageSourceType === 'song' ? '🎵 Song' : passageSourceType === 'speech' ? '🎙️ Speech' : '📰 Article'}
                </span>
              )}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{passageTitle}</span>
            </div>
            <span className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
              {passageAuthor ? `${passageAuthor}${passageYear ? ` (${passageYear})` : ''} • ` : ''}{passageCategory}
            </span>
          </div>
        </div>

        {/* Passage Typing Card */}
        <div 
          className="v-cockpit p-5 md:p-6 rounded-2xl shadow-xl transition-colors duration-200"
          style={{ borderColor: 'var(--border-default)' }}
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
