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
  Newspaper 
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { useTheme } from '../../theme/ThemeContext.js';

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
  const { isLight } = useTheme();
  const [copied, setCopied] = React.useState(false);

  const localResult = podium.find(p => p.id === localPlayerId) || podium[0];
  const placement = localResult?.placement || 1;

  useEffect(() => {
    sound.playFinishSound();

    if (placement === 1) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#ffffff']
        });
      } catch (e) {}
    }
  }, [placement]);

  const formatTime = (ms: number | null) => {
    if (!ms) return '--:--';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${millis}`;
  };

  const handleShare = () => {
    const text = `🏁 Meanwhile — Finished P${placement} on ${trackName} with ${localResult.wpm} WPM and ${localResult.accuracy}% Accuracy! Typed: "${passage?.title || 'Race Passage'}" by ${passage?.author || 'Unknown'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div 
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 md:p-8 flex flex-col gap-5"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <span className="text-[11px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              OFFICIAL RACE TELEMETRY • {trackName}
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {placement === 1 ? 'First Place Victory' : `P${placement} Grid Finish`}
            </h2>
          </div>

          <span 
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base"
            style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
          >
            P{placement}
          </span>
        </div>

        {/* Telemetry Numbers Grid */}
        <div 
          className="p-4 rounded-xl border grid grid-cols-4 gap-4 text-center"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Average Pace</span>
            <div className="text-2xl font-bold font-num mt-0.5" style={{ color: 'var(--accent)' }}>
              {localResult.wpm}
            </div>
            <span className="text-[10px] font-num" style={{ color: 'var(--text-secondary)' }}>WPM</span>
          </div>

          <div>
            <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Precision</span>
            <div className="text-2xl font-bold font-num mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {localResult.accuracy}%
            </div>
            <span className="text-[10px] font-num" style={{ color: 'var(--text-secondary)' }}>ACC</span>
          </div>

          <div>
            <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Total Time</span>
            <div className="text-2xl font-bold font-num mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {formatTime(localResult.elapsedMs)}
            </div>
            <span className="text-[10px] font-num" style={{ color: 'var(--text-secondary)' }}>MIN:SEC</span>
          </div>

          <div>
            <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Rewards</span>
            <div className="text-2xl font-bold font-num mt-0.5" style={{ color: 'var(--text-primary)' }}>
              +{localResult.xpEarned || 150}
            </div>
            <span className="text-[10px] font-num" style={{ color: 'var(--text-secondary)' }}>XP EARNED</span>
          </div>
        </div>

        {/* Competitor Standings Table */}
        <div>
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Grid Final Standings
          </div>
          <div 
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <table className="w-full text-left border-collapse text-xs font-num">
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {podium.map((racer, idx) => (
                  <tr
                    key={racer.id}
                    className="transition-colors"
                    style={racer.isLocal ? { backgroundColor: 'var(--accent-subtle)' } : {}}
                  >
                    <td className="py-2.5 px-4 w-12 font-semibold">
                      #{racer.placement || idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-medium">
                      <div className="flex items-center gap-2">
                        <span>{racer.avatar}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{racer.username}</span>
                        {racer.isLocal && (
                          <span 
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {formatTime(racer.elapsedMs)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold" style={{ color: 'var(--accent)' }}>
                      {racer.wpm} <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>WPM</span>
                    </td>
                    <td className="py-2.5 px-4 text-right" style={{ color: 'var(--text-muted)' }}>
                      {racer.accuracy}% Acc
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Text Provenance & Source Attribution Card */}
        {passage && (
          <div 
            className="rounded-xl border p-4 flex flex-col gap-2.5 transition-all"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  {passage.sourceType === 'book' && <BookOpen className="w-3 h-3" />}
                  {passage.sourceType === 'song' && <Music className="w-3 h-3" />}
                  {passage.sourceType === 'speech' && <Mic className="w-3 h-3" />}
                  {passage.sourceType === 'essay' && <FileText className="w-3 h-3" />}
                  {passage.sourceType === 'article' && <Newspaper className="w-3 h-3" />}
                  {passage.sourceType ? `From the ${passage.sourceType}` : 'Literature Source'}
                </span>
                <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  "{passage.title}"
                </h4>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                {passage.category}
              </span>
            </div>

            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Written / Composed by <strong style={{ color: 'var(--text-primary)' }}>{passage.author}</strong> {passage.year ? `(${passage.year})` : ''}
            </div>

            {/* Quoted passage excerpt */}
            <div 
              className="text-xs italic leading-relaxed pl-3 border-l-2 py-0.5 rounded-r"
              style={{ borderColor: 'var(--accent)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
            >
              "{passage.text}"
            </div>

            {/* Context trivia note */}
            {passage.context && (
              <div className="text-[11px] leading-normal flex items-start gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>Provenance:</span>
                <span>{passage.context}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Share Telemetry'}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onReturnToLobby}
              className="px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Lobby
            </button>

            <button
              onClick={onRematch}
              className="v-btn-primary px-6 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Race Again
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
