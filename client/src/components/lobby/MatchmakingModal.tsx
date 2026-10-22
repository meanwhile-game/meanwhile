import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

interface MatchmakingModalProps {
  queueLength: number;
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ queueLength, onCancel }) => {
  const { isLight } = useTheme();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div 
        className="w-full max-w-sm rounded-2xl border shadow-2xl p-6 flex flex-col items-center text-center gap-5"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }}
      >
        {/* Subtle, restrained pulsing indicator */}
        <div className="relative w-12 h-12 flex items-center justify-center mt-2">
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
          >
            V
          </div>
        </div>

        {/* Title & Status */}
        <div>
          <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Finding Contenders
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Connecting to lowest latency authoritative server...
          </p>
        </div>

        {/* Queue Metrics */}
        <div 
          className="w-full py-3 px-4 rounded-xl border flex items-center justify-between text-xs font-num"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>Elapsed Time</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{formatElapsed(elapsed)}</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px]" style={{ color: 'var(--text-muted)' }}>In Queue</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{queueLength || 1} Drivers</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          <span>Anti-cheat latency equalization active</span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
        >
          <X className="w-3.5 h-3.5" />
          Cancel Queue
        </button>
      </div>
    </div>
  );
};
