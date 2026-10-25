import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { AdSlot } from '../common/AdSlot.jsx';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Compass, Sparkles, CheckCircle2 } from 'lucide-react';

export const ResultsScreen = () => {
  const { results, initRace, setView } = useGameStore();

  useEffect(() => {
    // Trigger confetti on podium finish (1st, 2nd, 3rd)
    if (results && results.position <= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#38bdf8', '#f8fafc', '#a855f7']
        });
      } catch (e) {}
    }
  }, [results]);

  const handlePlayAgain = () => {
    soundEngine.playButtonClick();
    initRace();
  };

  const handleChooseTrack = () => {
    soundEngine.playButtonClick();
    setView('tracks');
  };

  const position = results?.position || 1;
  const isWinner = position === 1;
  const isPodium = position <= 3;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-10 flex flex-col items-center justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Results Banner Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-bold text-amber-300 uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Race Completed</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#f8fafc]">
            {isWinner ? 'Victory! 1st Place' : `${position}${position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} Place Finish`}
          </h1>

          <p className="text-sm text-[#94a3b8]">
            {results?.trackName || 'Coastal Drive'} · {results?.mode || 'Quick Race'}
          </p>
        </div>

        {/* 4 Performance KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Final Speed
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {results?.wpm || 105}
              <span className="text-sm font-medium text-amber-400 ml-1">WPM</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Accuracy
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-emerald-400 mt-1">
              {results?.accuracy || 97}%
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Finish Time
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-[#f8fafc] mt-1">
              {results?.timeFormatted || '01:42'}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-white/[0.08] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#94a3b8]">
              Credits Earned
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono-num text-amber-300 mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>+{isWinner ? 150 : isPodium ? 90 : 50}</span>
            </div>
          </div>
        </div>

        {/* WPM Velocity Graph SVG */}
        <div className="p-6 rounded-2xl bg-[#0c1222] border border-white/[0.08] shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-[#f8fafc] uppercase tracking-wider">
              Pacing Cadence Analysis
            </span>
            <span className="text-xs text-[#94a3b8] font-mono-num">
              Peak: {Math.round((results?.wpm || 105) * 1.15)} WPM
            </span>
          </div>

          {/* Clean SVG Line Graph */}
          <div className="w-full h-32 pt-4">
            <svg viewBox="0 0 500 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Area fill */}
              <path
                d="M 0 90 Q 60 70, 120 40 T 250 30 T 380 25 T 500 20 L 500 100 L 0 100 Z"
                fill="url(#chartGrad)"
              />

              {/* Smooth WPM curve line */}
              <path
                d="M 0 90 Q 60 70, 120 40 T 250 30 T 380 25 T 500 20"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Finish point dot */}
              <circle cx="500" cy="20" r="5" fill="#f8fafc" stroke="#f59e0b" strokeWidth="2.5" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={handlePlayAgain}
            className="px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Race Again</span>
          </button>

          <button
            onClick={handleChooseTrack}
            className="px-7 py-3.5 rounded-full glass-pill text-[#f8fafc] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Choose Track</span>
          </button>

          <button
            onClick={() => setView('home')}
            className="px-6 py-3.5 rounded-full text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            Return to Home
          </button>
        </div>

        {/* AdSlot below race results (never during race, hidden when disabled) */}
        <AdSlot slotId="results-bottom" format="horizontal-banner" className="mt-8" />
      </div>
    </div>
  );
};
