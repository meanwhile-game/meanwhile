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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/95 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 md:p-8 flex flex-col gap-6 text-white relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: placement === 1 ? 'rgba(0,255,135,0.15)' : 'rgba(0,229,255,0.15)' }}
        />

        {/* 1. Header Banner */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              OFFICIAL GRAND PRIX CLASSIFICATION • {trackName.toUpperCase()}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              {placement === 1 ? '🏆 Grand Prix Victory!' : `🏁 P${placement} Grid Finish`}
            </h2>
          </div>

          <div 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg font-mono ${
              placement === 1 
                ? 'bg-emerald-400 text-black shadow-[0_0_25px_rgba(0,255,135,0.5)]' 
                : placement === 2
                ? 'bg-slate-300 text-black shadow-md'
                : 'bg-amber-700 text-white shadow-md'
            }`}
          >
            P{placement}
          </div>
        </div>

        {/* 2. Driver Telemetry Matrix */}
        <div className="relative z-10 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Peak Pace</span>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
              {localResult.wpm}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">WPM</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Precision</span>
            <div className="text-3xl font-black font-mono text-cyan-400 mt-0.5">
              {localResult.accuracy}%
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">ACCURACY</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Course Time</span>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {formatTime(localResult.elapsedMs)}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">MIN:SEC</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Racer Reward</span>
            <div className="text-3xl font-black font-mono text-amber-400 mt-0.5">
              +{localResult.xpEarned || 150}
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">XP EARNED</span>
          </div>
        </div>

        {/* 3. Grid Competitors Standings */}
        <div className="relative z-10">
          <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
            Final Grid Order
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <tbody className="divide-y divide-slate-800/80">
                {podium.map((racer, idx) => (
                  <tr
                    key={racer.id}
                    className={`transition-colors ${
                      racer.isLocal ? 'bg-emerald-500/15 font-bold' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 px-4 w-12 font-black text-center">
                      #{racer.placement || idx + 1}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold">
                      <div className="flex items-center gap-2">
                        <span>{racer.avatar}</span>
                        <span className="text-white">{racer.username}</span>
                        {racer.isLocal && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-400 text-black font-black">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {formatTime(racer.elapsedMs)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-400">
                      {racer.wpm} <span className="font-normal text-[10px] text-slate-500">WPM</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
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
          <div className="relative z-10 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col gap-3 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {passage.sourceType === 'book' && <BookOpen className="w-3 h-3" />}
                  {passage.sourceType === 'song' && <Music className="w-3 h-3" />}
                  {passage.sourceType === 'speech' && <Mic className="w-3 h-3" />}
                  {passage.sourceType === 'essay' && <FileText className="w-3 h-3" />}
                  {passage.sourceType === 'article' && <Newspaper className="w-3 h-3" />}
                  {passage.sourceType ? `From the ${passage.sourceType}` : 'Literature Source'}
                </span>
                <h4 className="text-sm font-black tracking-tight text-white">
                  "{passage.title}"
                </h4>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
                {passage.category}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              Written / Composed by <strong className="text-white">{passage.author}</strong> {passage.year ? `(${passage.year})` : ''}
            </div>

            {/* Quoted passage excerpt */}
            <div className="text-xs italic leading-relaxed pl-3.5 border-l-2 border-emerald-400 py-1 rounded-r bg-slate-950/80 text-slate-300 font-serif">
              "{passage.text}"
            </div>

            {/* Context trivia note */}
            {passage.context && (
              <div className="text-[11px] leading-normal flex items-start gap-1.5 text-slate-400 font-mono">
                <span className="font-bold text-emerald-400">Provenance:</span>
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
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleShare}
            className="btn-arcade-pill px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer shadow-md"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
            {copied ? 'Copied to Clipboard!' : 'Share Telemetry'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playKeystroke(50, true);
                onReturnToLobby();
              }}
              className="btn-arcade-pill px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Lobby
            </button>

            <button
              onClick={() => {
                sound.playCountdownTick(2);
                onRematch();
              }}
              className="btn-arcade-green px-7 py-3 rounded-xl text-black text-xs font-black uppercase tracking-wider flex items-center gap-2.5 cursor-pointer shadow-xl active:translate-y-1"
            >
              <span>Race Again</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-mono font-bold tracking-tight">
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
