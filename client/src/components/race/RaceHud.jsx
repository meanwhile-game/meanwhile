import React, { useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';
import { SpeedometerGauge } from './SpeedometerGauge.jsx';
import { TrackMinimap } from './TrackMinimap.jsx';
import { ArrowLeft, Wifi } from 'lucide-react';
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
    selectedTrackId,
    setView
  } = useGameStore();

  const track = getTrackById(selectedTrackId);

  // Format elapsed time 00:42.18
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(2);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;

  const targetText = passage?.text || "The sun dipped behind the hills as the coastal road unfolded ahead, a perfect stretch for one more run.";
  const typedLength = typedText.length;

  // Word-level tokenization for accurate word-box highlighting matching reference screenshot
  const { completedText, currentWord, upcomingText, currentWordTypedPart, currentWordRemainingPart } = useMemo(() => {
    // Find boundaries of current word
    let wordStart = targetText.lastIndexOf(' ', Math.max(0, typedLength - 1));
    wordStart = wordStart === -1 ? 0 : wordStart + 1;

    let wordEnd = targetText.indexOf(' ', typedLength);
    if (wordEnd === -1) wordEnd = targetText.length;

    const completed = targetText.slice(0, wordStart);
    const currWord = targetText.slice(wordStart, wordEnd);
    const upcoming = targetText.slice(wordEnd);

    const typedInWord = Math.max(0, typedLength - wordStart);
    const currTyped = currWord.slice(0, typedInWord);
    const currRemaining = currWord.slice(typedInWord);

    return {
      completedText: completed,
      currentWord: currWord,
      upcomingText: upcoming,
      currentWordTypedPart: currTyped,
      currentWordRemainingPart: currRemaining
    };
  }, [targetText, typedLength]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-6 lg:p-8 z-20 overflow-hidden font-sans">
      {/* 1. TOP BAR & SIDES */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Position, Lap, Time & Minimap matching Screenshot */}
        <div className="flex flex-col items-start gap-3">
          {/* Exit Button */}
          <button
            onClick={() => {
              soundEngine.stopEngine();
              setView('tracks');
            }}
            className="pointer-events-auto px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-[11px] text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Exit</span>
          </button>

          {/* Position & Lap Box */}
          <div className="flex flex-col items-start leading-none">
            <div className="flex items-baseline gap-1 font-mono-num drop-shadow-md">
              <span className="text-5xl font-black text-[#f8fafc]">{finalRank}</span>
              <span className="text-xl font-bold text-[#64748b]">/8</span>
            </div>
            <span className="text-[10px] tracking-widest font-semibold text-[#94a3b8] uppercase mt-1">
              Position
            </span>

            <div className="mt-2 text-xs font-mono-num space-y-0.5">
              <div className="text-[#94a3b8] font-medium text-[11px]">
                LAP <span className="text-[#f8fafc] font-bold">{lap}/{totalLaps}</span>
              </div>
              <div className="text-[#f8fafc] font-mono-num font-bold tracking-tight text-sm drop-shadow-sm">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Track Minimap with Curve Warning Arrow */}
          <div className="mt-2">
            <TrackMinimap racers={racers} playerProgress={progress} track={track} />
          </div>
        </div>

        {/* Top-Right: Ping & Live Standings Board matching Screenshot */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Latency Indicator Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-mono-num text-emerald-400 shadow-md">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
            <span className="font-semibold">32 ms</span>
          </div>

          {/* Standings Table matching Screenshot */}
          <div className="w-60 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 p-2.5 shadow-2xl flex flex-col gap-1 text-xs">
            {racers.slice(0, 8).map((racer, index) => {
              const isPlayer = racer.isPlayer;
              return (
                <div
                  key={racer.id || index}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    isPlayer
                      ? 'bg-[#5b5091] text-white font-bold shadow-md scale-[1.02]'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 font-mono-num text-[11px] ${isPlayer ? 'text-white' : 'text-[#64748b]'}`}>
                      {index + 1}
                    </span>
                    <span className="truncate max-w-[85px] tracking-wide">
                      {racer.name || racer.username}
                    </span>
                  </div>
                  <span className={`font-mono-num text-[11px] ${isPlayer ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {racer.wpm} WPM
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM CENTER TYPING CONSOLE CARD & SPEEDOMETER */}
      <div className="w-full flex items-end justify-between gap-6 mt-auto">
        {/* Spacer for Left alignment */}
        <div className="w-28 hidden lg:block" />

        {/* Main Typing Console matching Reference Screenshot */}
        <div className="flex-1 max-w-4xl mx-auto rounded-2xl bg-[#090e1c]/90 backdrop-blur-xl border border-white/10 shadow-2xl p-6 pointer-events-auto select-none flex flex-col justify-between">
          {/* Text and Right Metrics Row */}
          <div className="flex items-center justify-between gap-6">
            {/* Passage Text Container */}
            <div className="flex-1 font-mono text-xl sm:text-2xl leading-relaxed tracking-wide">
              {/* Correctly Typed Words in Emerald Green */}
              <span className="text-emerald-400 font-medium">
                {completedText}
              </span>

              {/* Current Word Highlighted in Lavender/Indigo Pill Badge with Cursor */}
              {currentWord && (
                <span className="inline-flex items-center bg-[#2d3756] border border-indigo-400/40 px-1.5 py-0.5 rounded-md text-white font-medium shadow-inner mx-0.5">
                  <span className="text-emerald-300">{currentWordTypedPart}</span>
                  <span className="w-0.5 h-6 bg-white animate-cursor-blink mx-[1px]" />
                  <span className="text-slate-200">{currentWordRemainingPart}</span>
                </span>
              )}

              {/* Upcoming Untyped Words in Muted Grey */}
              <span className="text-[#8492a6]/70">
                {upcomingText}
              </span>
            </div>

            {/* Right Divider & Telemetry Numbers */}
            <div className="pl-6 border-l border-white/10 flex flex-col items-center justify-center space-y-3 min-w-[100px]">
              {/* WPM */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#64748b]">
                  WPM
                </span>
                <span className="text-3xl font-black font-mono-num text-[#f8fafc] leading-none mt-0.5">
                  {wpm}
                </span>
              </div>

              {/* ACCURACY */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#64748b]">
                  Accuracy
                </span>
                <span className="text-xl font-bold font-mono-num text-[#f8fafc] leading-none mt-0.5">
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar & Character Counter */}
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono-num text-[#64748b] tracking-wider whitespace-nowrap">
              {typedLength} / {targetText.length}
            </span>
          </div>
        </div>

        {/* Bottom Right: Circular Speedometer Gauge */}
        <div className="flex-shrink-0">
          <SpeedometerGauge speed={speedKmh} maxSpeed={320} gear={gear} />
        </div>
      </div>

      {/* 3. COUNTDOWN OVERLAY */}
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
