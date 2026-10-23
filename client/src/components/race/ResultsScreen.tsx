import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  RotateCcw, 
  Share2, 
  Check, 
  BookOpen, 
  Music, 
  Mic, 
  FileText, 
  Newspaper,
  Trophy,
  Crown,
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { AdBanner } from '../common/AdBanner.js';

interface ResultPodiumEntry {
  id: string;
  username: string;
  avatar: string;
  vehicleId: string;
  vehicleColor: string;
  isLocal: boolean;
  placement: number | null;
  wpm: number;
  accuracy: number;
  elapsedMs: number | null;
  xpEarned: number;
}

export interface PassageAttribution {
  id: string;
  title: string;
  sourceType?: 'book' | 'song' | 'article' | 'speech' | 'essay';
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  text: string;
  author: string;
  year?: number | string;
  context?: string;
  sourceUrl?: string;
}

interface ResultsScreenProps {
  podium: ResultPodiumEntry[];
  localPlayerId: string;
  trackName: string;
  passage?: PassageAttribution;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  podium,
  localPlayerId,
  trackName,
  passage,
  onRematch,
  onReturnToLobby
}) => {
  const [copied, setCopied] = React.useState(false);

  const localResult = podium.find(p => p.id === localPlayerId) || podium[0];
  const placement = localResult?.placement || 1;

  useEffect(() => {
    sound.playFinishSound();

    if (placement === 1) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00ff87', '#00e5ff', '#f59e0b', '#ffffff']
        });
      } catch (e) {}
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        sound.playCountdownTick(2);
        onRematch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placement, onRematch]);

  const formatTime = (ms: number | null) => {
    if (!ms) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${millis}`;
  };

  const handleShare = () => {
    sound.playKeystroke(60, true);
    const text = `🏁 Meanwhile — Finished P${placement} on ${trackName} with ${localResult.wpm} WPM and ${localResult.accuracy}% Accuracy! Typed: "${passage?.title || 'Race Passage'}" by ${passage?.author || 'Unknown'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl p-6 md:p-8 flex flex-col gap-6 text-slate-900 relative"
      >
        {/* 1. Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              OFFICIAL GRAND PRIX CLASSIFICATION • {trackName.toUpperCase()}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#16426a] mt-1">
              {placement === 1 ? '🏆 Grand Prix Victory!' : `🏁 P${placement} Grid Finish`}
            </h2>
          </div>

          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md font-mono ${
              placement === 1 
                ? 'bg-[#2ea44f] text-white shadow-[0_0_20px_rgba(46,164,79,0.35)]' 
                : placement === 2
                ? 'bg-slate-200 text-slate-700'
                : 'bg-amber-600 text-white'
            }`}
          >
            P{placement}
          </div>
        </div>

        {/* 2. Driver Telemetry Matrix */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Peak Pace</span>
            <div className="text-3xl font-black font-mono text-[#2ea44f] mt-0.5">
              {localResult.wpm}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">WPM</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Precision</span>
            <div className="text-3xl font-black font-mono text-[#16426a] mt-0.5">
              {localResult.accuracy}%
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">ACCURACY</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Course Time</span>
            <div className="text-3xl font-black font-mono text-slate-800 mt-0.5">
              {formatTime(localResult.elapsedMs)}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">MIN:SEC</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Racer Reward</span>
            <div className="text-3xl font-black font-mono text-amber-600 mt-0.5">
              +{localResult.xpEarned || 150}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">XP EARNED</span>
          </div>
        </div>

        {/* 3. Grid Competitors Standings */}
        <div>
          <div className="text-xs font-mono uppercase text-slate-500 font-bold mb-2">
            Final Grid Order
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <tbody className="divide-y divide-slate-200/80">
                {podium.map((racer, idx) => (
                  <tr
                    key={racer.id}
                    className={`transition-colors ${
                      racer.isLocal ? 'bg-emerald-50 text-[#16426a] font-bold' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <td className="py-3 px-4 w-12 font-black text-center text-slate-700">
                      #{racer.placement || idx + 1}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold">
                      <div className="flex items-center gap-2">
                        <span>{racer.avatar}</span>
                        <span className="text-slate-900">{racer.username}</span>
                        {racer.isLocal && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#2ea44f] text-white font-black">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {formatTime(racer.elapsedMs)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-[#2ea44f]">
                      {racer.wpm} <span className="font-normal text-[10px] text-slate-400">WPM</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {racer.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Text Provenance & Attribution Card */}
        {passage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                OFFICIAL RACE PASSAGE CITATION & ARCHIVE
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-100/80 text-amber-900 font-semibold">
                {passage.category}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono uppercase px-3 py-1 rounded-lg font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {passage.sourceType === 'book' && <BookOpen className="w-3.5 h-3.5" />}
                  {passage.sourceType === 'song' && <Music className="w-3.5 h-3.5" />}
                  {passage.sourceType === 'speech' && <Mic className="w-3.5 h-3.5" />}
                  {passage.sourceType === 'essay' && <FileText className="w-3.5 h-3.5" />}
                  {passage.sourceType === 'article' && <Newspaper className="w-3.5 h-3.5" />}
                  {passage.sourceType === 'book' ? 'BOOK EXCERPT' : passage.sourceType === 'song' ? 'SONG LYRICS' : passage.sourceType === 'speech' ? 'HISTORIC SPEECH' : 'ESSAY / ARTICLE'}
                </span>
                <h4 className="text-base font-black tracking-tight text-[#16426a] font-mono">
                  "{passage.title}" {passage.year ? `(${passage.year})` : ''}
                </h4>
              </div>

              <span className="text-xs font-mono text-slate-600">
                Author: <strong className="text-slate-900 font-bold">{passage.author}</strong>
              </span>
            </div>

            {/* Quoted passage excerpt */}
            <div className="text-xs italic leading-relaxed pl-4 border-l-2 border-amber-500 py-1.5 rounded-r bg-white/70 text-slate-800 font-serif">
              "{passage.text}"
            </div>

            {/* Context trivia note */}
            {passage.context && (
              <div className="text-[11px] leading-relaxed flex items-start gap-1.5 text-slate-600 font-mono bg-white/60 p-2.5 rounded-xl border border-amber-200/50">
                <span className="font-bold text-amber-700 shrink-0">Context:</span>
                <span>{passage.context}</span>
              </div>
            )}
          </div>
        )}

        {/* SPONSORED MONETIZATION BANNER (Prime post-race slot) */}
        <AdBanner
          slotId="ad-results-podium-banner"
          format="leaderboard"
          className="my-1 w-full"
        />

        {/* 5. Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#16426a]" />}
            {copied ? 'Copied to Clipboard!' : 'Share Telemetry'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playKeystroke(50, true);
                onReturnToLobby();
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Lobby
            </button>

            <button
              onClick={() => {
                sound.playCountdownTick(2);
                onRematch();
              }}
              className="px-7 py-3 rounded-xl bg-[#2ea44f] hover:bg-[#2c974b] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2.5 cursor-pointer shadow-lg active:translate-y-0.5 transition-all"
            >
              <span>Race Again</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono font-bold tracking-tight text-white">
                SPACE
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
