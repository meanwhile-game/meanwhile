import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { SpeedometerGauge } from './SpeedometerGauge.jsx';
import { TrackMinimap } from './TrackMinimap.jsx';
import { Flag, Trophy, ArrowLeft } from 'lucide-react';
import { soundEngine } from '../../sound/soundEngine.js';

export const RaceHud = () => {
  const {
    passage,
    typedText,
    wpm,
    accuracy,
    speedKmh,
    gear,
    progress,
    lap,
    totalLaps,
    elapsedSeconds,
    racers,
    finalRank,
    countdown,
    isCountdown,
    setView
  } = useGameStore();

  // Format elapsed time 00:42.18
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(2);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;
  const formattedTimeShort = `${String(mins).padStart(2, '0')}:${String(Math.floor(elapsedSeconds % 60)).padStart(2, '0')}`;

  const targetText = passage?.text || '';
  const typedLength = typedText.length;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-6 lg:p-10 z-20 overflow-hidden font-sans">
      {/* 1. TOP BAR SECTION */}
      <div className="w-full flex items-start justify-between gap-6">
        {/* Top Left: Position & Lap Card matching Reference UI */}
        <div className="flex flex-col items-start gap-3">
          <button
            onClick={() => {
              soundEngine.stopEngine();
              setView('tracks');
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-xs text-[#94a3b8] hover:text-[#f8fafc] flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Race</span>
          </button>

          <div className="px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-start">
            <div className="flex items-baseline gap-1 font-mono-num leading-none">
              <span className="text-4xl font-black text-[#f8fafc]">{finalRank}</span>
              <span className="text-sm font-bold text-[#64748b]">/ 8</span>
            </div>
            <span className="text-[10px] tracking-widest font-semibold text-[#94a3b8] uppercase mt-1">
              Position
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs font-mono-num space-y-0.5">
            <div className="text-[#94a3b8] font-medium text-[11px]">
              LAP <span className="text-[#f8fafc] font-bold">{lap} / {totalLaps}</span>
            </div>
            <div className="text-amber-400 font-bold tracking-tight text-sm">
              {formattedTime}
            </div>
          </div>
        </div>

        {/* Top Center: Progress Bar & Checkpoints */}
        <div className="flex-1 max-w-xl mx-4 flex flex-col items-center">
          <div className="w-full px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-3">
            {/* Start point */}
            <span className="w-2 h-2 rounded-full bg-white/40" />
            
            {/* Progress track */}
            <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-visible">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
              {/* Checkpoint Dots */}
              <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-white/30" />
              <div className="absolute top-1/2 -translate-y-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-white/30" />
              {/* Car thumb indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_10px_#f59e0b] -ml-1.5 transition-all duration-100 ease-out"
                style={{ left: `${Math.min(100, progress * 100)}%` }}
              />
            </div>

            {/* Finish Flag */}
            <Flag className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Top Right: Live 8-Racer Leaderboard matching Reference UI */}
        <div className="w-56 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-3.5 shadow-2xl flex flex-col gap-1.5">
          {racers.slice(0, 8).map((racer, index) => {
            const isPlayer = racer.isPlayer;
            return (
              <div
                key={racer.id || index}
                className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isPlayer
                    ? 'bg-[#f8fafc] text-slate-950 font-bold shadow-md scale-[1.02]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 font-mono-num text-[11px] ${isPlayer ? 'text-slate-950' : 'text-[#64748b]'}`}>
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[80px]">
                    {racer.name || racer.username}
                  </span>
                </div>
                <span className={`font-mono-num text-[11px] ${isPlayer ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {racer.wpm} WPM
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER TYPING PASSAGE OVERLAY */}
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto">
        <div className="w-full px-8 py-6 rounded-2xl bg-[#090d19]/80 backdrop-blur-xl border border-white/15 shadow-2xl relative overflow-hidden pointer-events-auto">
          {/* Subtle Ambient Top Border Glow */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          {/* Typing Text with Character Highlighting matching screenshot */}
          <p className="text-xl sm:text-2xl font-mono leading-relaxed tracking-wide select-none">
            {/* Correctly Typed Text */}
            <span className="text-[#f8fafc] font-medium">
              {targetText.slice(0, typedLength)}
            </span>

            {/* Current Character under cursor with animated blink */}
            {typedLength < targetText.length && (
              <span className="relative inline-block text-amber-400 bg-amber-400/25 px-0.5 rounded-sm font-bold border-b-2 border-amber-400 animate-cursor-blink">
                {targetText[typedLength] === ' ' ? '␣' : targetText[typedLength]}
              </span>
            )}

            {/* Untyped Remaining Text */}
            <span className="text-[#94a3b8]/60">
              {targetText.slice(typedLength + 1)}
            </span>
          </p>

          {/* Context / Author Subtitle */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#64748b]">
            <span>{passage?.title || 'Open Horizons'} · {passage?.author || 'meanwhile'}</span>
            <span className="text-amber-400/80 font-mono-num font-semibold">
              {typedLength} / {targetText.length} chars
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR SECTION */}
      <div className="w-full flex items-end justify-between gap-6">
        {/* Bottom Left: Track Minimap */}
        <TrackMinimap racers={racers} playerProgress={progress} />

        {/* Bottom Center: Stats KPI Row matching Reference UI */}
        <div className="px-8 py-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-8 sm:gap-12">
          {/* WPM */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">
              WPM
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono-num text-[#f8fafc] mt-0.5">
              {wpm}
            </span>
          </div>

          {/* ACCURACY */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">
              Accuracy
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono-num text-[#f8fafc] mt-0.5">
              {accuracy}%
            </span>
          </div>

          {/* TIME */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">
              Time
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono-num text-[#f8fafc] mt-0.5">
              {formattedTimeShort}
            </span>
          </div>

          {/* PROGRESS */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">
              Progress
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono-num text-[#f8fafc] mt-0.5">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Bottom Right: Circular Speedometer Gauge */}
        <SpeedometerGauge speed={speedKmh} maxSpeed={320} gear={gear} />
      </div>

      {/* 4. COUNTDOWN MODAL OVERLAY */}
      {isCountdown && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-8xl sm:text-9xl font-black font-mono-num text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-sm font-semibold tracking-widest text-[#94a3b8] uppercase mt-4">
              Type to Accelerate
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
