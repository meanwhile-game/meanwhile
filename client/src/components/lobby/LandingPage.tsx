import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

interface LandingPageProps {
  onEnterGrid: () => void;
  onlineCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterGrid, onlineCount }) => {
  const { isLight } = useTheme();

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter"
            style={{ backgroundColor: 'var(--accent)', color: '#050608' }}
          >
            V
          </div>
          <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Veloce
          </span>
          <span 
            className="text-[11px] font-num px-2 py-0.5 rounded"
            style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-num" style={{ color: 'var(--text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <span>{onlineCount || 1} online</span>
          </div>

          <button
            onClick={onEnterGrid}
            className="v-btn-primary px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            Launch Grid
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="w-full max-w-4xl mx-auto py-16 flex flex-col items-start text-left">
        <div 
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono mb-6"
          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>REAL-TIME 3D MULTIPLAYER TYPING SIMULATOR</span>
        </div>

        <h1 
          className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Competitive racing driven by keystroke velocity.
        </h1>

        <p 
          className="mt-6 text-base sm:text-lg max-w-2xl leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Pilot engineered supercars and motorcycles across authentic global circuits. 
          Your real-time typing speed, consistency, and precision directly govern vehicle acceleration on an authoritative multiplayer grid.
        </p>

        {/* Action Button */}
        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={onEnterGrid}
            className="v-btn-primary px-7 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            Enter the Grid
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* System Attributes Row */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t w-full" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Authoritative Grid
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Server-validated character validation, anti-cheat latency thresholds, and synchronized countdowns.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              <Compass className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Global Circuits
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              4-lane Catmull-Rom tracks across Tokyo, Furka Pass in the Swiss Alps, and the Dubai coastal desert.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              Telemetry Engine
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Synthesized audio revs matching live WPM, chase camera dynamics, and detailed lap telemetry.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>VELOCE SOFTWARE</span>
        <span className="font-num">60 FPS AUTHORITATIVE ENGINE</span>
      </footer>
    </div>
  );
};
