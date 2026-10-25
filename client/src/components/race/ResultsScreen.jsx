import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { AdSlot } from '../common/AdSlot.jsx';
import { getRandomPassage } from '../../data/passages.js';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Music, 
  Mic, 
  Newspaper, 
  ArrowRight, 
  Quote, 
  CheckCircle2,
  Share2
} from 'lucide-react';

export const ResultsScreen = () => {
  const { results, passage, racers, initRace, setView } = useGameStore();

  useEffect(() => {
    // Confetti on podium finish
    if (results && results.position <= 3) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#38bdf8', '#f8fafc', '#a855f7', '#10b981']
        });
      } catch (e) {}
    }
  }, [results]);

  const handlePlayAgain = () => {
    soundEngine.playButtonClick();
    initRace(passage); // Play again with same passage
  };

  const handleNextPassage = () => {
    soundEngine.playButtonClick();
    const nextP = getRandomPassage();
    initRace(nextP);
  };

  const handleChooseTrack = () => {
    soundEngine.playButtonClick();
    setView('tracks');
  };

  const position = results?.position || 1;
  const isWinner = position === 1;
  const isPodium = position <= 3;

  // Source Type Icon & Color Mapping
  const getSourceBadge = (type) => {
    switch (type) {
      case 'song':
        return {
          label: 'Famous Song / Lyrics',
          icon: Music,
          badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        };
      case 'speech':
        return {
          label: 'Historic Speech',
          icon: Mic,
          badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        };
      case 'book':
        return {
          label: 'Classic Literature / Book',
          icon: BookOpen,
          badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
        };
      case 'article':
      default:
        return {
          label: 'Editorial / Article / Essay',
          icon: Newspaper,
          badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        };
    }
  };

  const sourceMeta = getSourceBadge(passage?.sourceType);
  const SourceIcon = sourceMeta.icon;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-10 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* 1. VICTORY / FINISH BANNER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-bold text-amber-300 uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Grand Prix Finish</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#f8fafc]">
            {isWinner 
              ? 'Victory! 1st Place' 
              : `${position}${position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} Place Finish`}
          </h1>

          <p className="text-sm sm:text-base text-[#94a3b8]">
            {results?.trackName || 'Coastal Drive'} · {results?.mode || 'Quick Race'} · Completed in{' '}
            <span className="text-white font-mono-num font-bold">{results?.timeFormatted || '00:42.18'}</span>
          </p>
        </div>

        {/* 2. PROPER TEXT SHOWCASE & ATTRIBUTION (User Request) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1628] to-[#0a0f1d] border border-white/[0.12] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400" />

          {/* Source Attribution Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${sourceMeta.badgeClass}`}>
                <SourceIcon className="w-4 h-4" />
                <span>{sourceMeta.label}</span>
              </div>
              {passage?.year && (
                <span className="text-xs font-mono-num text-[#64748b]">
                  Published {passage.year}
                </span>
              )}
            </div>

            <span className="text-xs text-[#64748b] tracking-wider uppercase font-semibold">
              Text Attribution & Provenance
            </span>
          </div>

          {/* Work Details & Author */}
          <div className="pt-5 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-[#f8fafc] flex items-baseline gap-2">
                <span>{passage?.title || 'The Coastal Run'}</span>
                <span className="text-sm font-normal text-amber-400">
                  by {passage?.author || 'meanwhile journal'}
                </span>
              </h2>
              {passage?.sourceName && (
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Source: <span className="text-slate-300 font-medium">{passage.sourceName}</span>
                </p>
              )}
            </div>

            {/* Backstory / Context */}
            {passage?.context && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-[#94a3b8] leading-relaxed">
                <span className="font-bold text-slate-300 block mb-1">About This Text:</span>
                {passage.context}
              </div>
            )}

            {/* Complete Passage Quote */}
            <div className="pt-2 relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5 pointer-events-none" />
              <blockquote className="pl-4 border-l-2 border-amber-400/60 text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed">
                "{passage?.text}"
              </blockquote>
            </div>
          </div>
        </div>

        {/* 3. PERFORMANCE KPI CARDS */}
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
              {results?.timeFormatted || '00:42'}
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

        {/* 4. FULL FINAL 8-DRIVER STANDINGS GRID */}
        <div className="rounded-2xl bg-[#0c1222] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#f8fafc] uppercase tracking-wider">
              Final Race Standings
            </h3>
            <span className="text-xs text-[#64748b] font-mono-num">
              8 Competitors · Circuit Complete
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {racers.slice(0, 8).map((racer, index) => {
              const rank = index + 1;
              const isPlayer = racer.isPlayer;
              return (
                <div
                  key={racer.id || index}
                  className={`px-6 py-3.5 flex items-center justify-between text-xs sm:text-sm transition-all ${
                    isPlayer 
                      ? 'bg-amber-400/10 font-bold border-l-4 border-amber-400' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-mono-num font-bold ${rank <= 3 ? 'text-amber-400' : 'text-[#64748b]'}`}>
                      #{rank}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                      {racer.avatar || '🏎️'}
                    </span>
                    <span className={isPlayer ? 'text-amber-300 font-bold' : 'text-[#f8fafc]'}>
                      {racer.name || racer.username} {isPlayer && '(You)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 font-mono-num">
                    <span className={`font-semibold ${isPlayer ? 'text-amber-400' : 'text-slate-300'}`}>
                      {racer.wpm} WPM
                    </span>
                    <span className="text-[#64748b] text-xs">
                      {rank === 1 ? 'Leader' : `+${(rank * 1.8).toFixed(1)}s`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. ACTION BUTTON CONTROLS */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={handlePlayAgain}
            className="px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Race Again</span>
          </button>

          <button
            onClick={handleNextPassage}
            className="px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Next Passage →</span>
          </button>

          <button
            onClick={handleChooseTrack}
            className="px-7 py-3.5 rounded-full glass-pill text-[#f8fafc] font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Choose Track</span>
          </button>

          <button
            onClick={() => setView('leaderboard')}
            className="px-6 py-3.5 rounded-full text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>

        {/* Configurable AdSlot below race results */}
        <AdSlot slotId="results-bottom" format="horizontal-banner" className="mt-8" />
      </div>
    </div>
  );
};
