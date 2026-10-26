import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowRight, Play, Zap, Users, Compass, Car, Keyboard } from 'lucide-react';

// Scattered Floating Random Keyboard Keycaps with Transparent Light Opacity
const SCATTERED_KEYS = [
  { char: 'Q', top: '9%', left: '5%', size: 'w-14 h-14 text-xl', rotate: '-rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.07] text-white/[0.14]' },
  { char: 'W', top: '16%', left: '15%', size: 'w-16 h-16 text-2xl', rotate: 'rotate-6', anim: 'animate-float-reverse', baseStyle: 'border-amber-400/[0.16] text-amber-400/[0.24] bg-amber-400/[0.02]' },
  { char: 'E', top: '7%', right: '17%', size: 'w-14 h-14 text-xl', rotate: 'rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.07] text-white/[0.14]' },
  { char: 'R', top: '14%', right: '6%', size: 'w-18 h-18 text-3xl', rotate: '-rotate-8', anim: 'animate-float-reverse', baseStyle: 'border-sky-400/[0.16] text-sky-400/[0.24] bg-sky-400/[0.02]' },
  { char: 'T', top: '30%', left: '4%', size: 'w-13 h-13 text-lg', rotate: 'rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'Y', top: '44%', left: '12%', size: 'w-14 h-14 text-xl', rotate: '-rotate-6', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'U', top: '26%', right: '13%', size: 'w-14 h-14 text-xl', rotate: 'rotate-8', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'I', top: '38%', right: '4%', size: 'w-13 h-13 text-lg', rotate: '-rotate-15', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'O', top: '50%', right: '15%', size: 'w-14 h-14 text-xl', rotate: 'rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'P', top: '58%', right: '5%', size: 'w-15 h-15 text-2xl', rotate: '-rotate-10', anim: 'animate-float-reverse', baseStyle: 'border-amber-400/[0.16] text-amber-400/[0.22] bg-amber-400/[0.02]' },
  { char: 'A', top: '58%', left: '5%', size: 'w-16 h-16 text-2xl', rotate: '-rotate-12', anim: 'animate-float-reverse', baseStyle: 'border-amber-400/[0.16] text-amber-400/[0.22]' },
  { char: 'S', top: '70%', left: '14%', size: 'w-14 h-14 text-xl', rotate: 'rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.07] text-white/[0.14]' },
  { char: 'D', top: '68%', right: '16%', size: 'w-15 h-15 text-2xl', rotate: 'rotate-6', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.07] text-white/[0.14]' },
  { char: 'F', top: '78%', right: '6%', size: 'w-14 h-14 text-xl', rotate: '-rotate-10', anim: 'animate-float-slow', baseStyle: 'border-amber-400/[0.16] text-amber-400/[0.20]' },
  { char: 'G', top: '82%', left: '6%', size: 'w-14 h-14 text-xl', rotate: 'rotate-8', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'H', top: '86%', right: '14%', size: 'w-13 h-13 text-lg', rotate: '-rotate-12', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'J', top: '90%', left: '18%', size: 'w-13 h-13 text-lg', rotate: 'rotate-15', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'K', top: '34%', left: '22%', size: 'w-13 h-13 text-lg', rotate: '-rotate-8', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.05] text-white/[0.11]' },
  { char: 'L', top: '34%', right: '23%', size: 'w-13 h-13 text-lg', rotate: 'rotate-10', anim: 'animate-float-slow', baseStyle: 'border-white/[0.05] text-white/[0.11]' },
  { char: 'Z', top: '80%', left: '28%', size: 'w-12 h-12 text-base', rotate: '-rotate-10', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'X', top: '80%', right: '28%', size: 'w-12 h-12 text-base', rotate: 'rotate-12', anim: 'animate-float-slow', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'C', top: '22%', left: '28%', size: 'w-12 h-12 text-base', rotate: 'rotate-6', anim: 'animate-float-slow', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'V', top: '20%', right: '27%', size: 'w-12 h-12 text-base', rotate: '-rotate-8', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'B', top: '88%', left: '38%', size: 'w-12 h-12 text-base', rotate: 'rotate-4', anim: 'animate-float-slow', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'N', top: '88%', right: '38%', size: 'w-12 h-12 text-base', rotate: '-rotate-6', anim: 'animate-float-reverse', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'M', top: '72%', left: '22%', size: 'w-15 h-15 text-2xl', rotate: 'rotate-10', anim: 'animate-float-slow', baseStyle: 'border-amber-400/[0.16] text-amber-400/[0.24]' },
  { char: 'SPACE', top: '92%', left: '46%', size: 'w-32 h-10 text-xs', rotate: 'rotate-0', anim: 'animate-float-slow', baseStyle: 'border-white/[0.06] text-white/[0.12]' },
  { char: 'ESC', top: '5%', left: '36%', size: 'w-16 h-10 text-xs', rotate: 'rotate-4', anim: 'animate-float-slow', baseStyle: 'border-white/[0.05] text-white/[0.10]' },
  { char: 'ENTER', top: '50%', right: '26%', size: 'w-20 h-11 text-xs', rotate: '-rotate-6', anim: 'animate-float-reverse', baseStyle: 'border-amber-400/[0.12] text-amber-400/[0.18]' }
];

// Full Keyboard Matrix Rows for Base Grid Texture
const KEYBOARD_GRID_ROWS = [
  ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'PRT', 'SCR', 'PAU', 'DEL', 'ESC', 'F1', 'F2', 'F3', 'F4'],
  ['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACK', 'INS', 'HOME', 'PGUP', '1', '2', '3', '4', '5'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\', 'DEL', 'END', 'PGDN', 'Q', 'W', 'E', 'R', 'T'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER', '7', '8', '9', 'A', 'S', 'D', 'F', 'G'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT', '▲', '4', '5', '6', 'Z', 'X', 'C', 'V', 'B'],
  ['CTRL', 'WIN', 'ALT', 'SPACE', 'ALT', 'FN', 'CTRL', '◄', '▼', '►', '0', '.', 'ENT', 'CTRL', 'ALT', 'SPACE', 'WIN']
];

export const HeroSection = () => {
  const { setView, initRace, setGameMode, setMultiplayerModalOpen } = useGameStore();
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [activeKey, setActiveKey] = useState(null);

  // Global physical keystroke listener — makes the entire background come alive as you type!
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (showTrailerModal) return;

      let key = e.key.toUpperCase();
      if (e.code === 'Space') key = 'SPACE';
      if (e.key === 'Backspace') key = 'BACK';
      if (e.key === 'Escape') key = 'ESC';
      if (e.key === 'Control') key = 'CTRL';
      if (e.key === 'Shift') key = 'SHIFT';

      setActiveKey(key);
      soundEngine.playKeypress(key === 'SPACE' || key === 'ENTER');

      const timer = setTimeout(() => {
        setActiveKey((curr) => (curr === key ? null : curr));
      }, 260);

      return () => clearTimeout(timer);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrailerModal]);

  const handlePlayNow = () => {
    soundEngine.playButtonClick();
    setView('tracks');
  };

  const handleQuickLaunch = () => {
    soundEngine.playButtonClick();
    setGameMode('quick_race');
    initRace();
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-65px)] flex flex-col justify-between px-6 lg:px-14 py-10 lg:py-16 overflow-hidden bg-[#070a13]">
      {/* --- LAYER 1: Deep Ambient Color Glows --- */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[760px] h-[480px] bg-amber-500/[0.08] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[620px] h-[420px] bg-sky-500/[0.06] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[400px] bg-purple-600/[0.05] rounded-full blur-[140px] pointer-events-none" />

      {/* --- LAYER 2: Ultra-Subtle Background Keyboard Keycap Matrix Texture --- */}
      <div className="absolute inset-0 flex flex-col justify-around py-3 opacity-40 overflow-hidden pointer-events-none select-none z-0">
        {KEYBOARD_GRID_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden transform -translate-x-3 sm:translate-x-0">
            {row.map((k, kIdx) => {
              const isMatch = activeKey === k;
              return (
                <div
                  key={kIdx}
                  className={`h-9 sm:h-11 rounded-lg border border-white/[0.035] bg-white/[0.008] text-white/[0.06] flex items-center justify-center font-mono text-xs px-2.5 min-w-[38px] transition-all duration-150 ${
                    isMatch ? 'border-amber-400 bg-amber-400/20 text-amber-300 scale-95' : ''
                  }`}
                >
                  {k}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* --- LAYER 3: Scattered Transparent Light-Opacity Keyboard Random Letters --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {SCATTERED_KEYS.map((item, idx) => {
          const isActive = activeKey === item.char;
          return (
            <div
              key={idx}
              style={{ top: item.top, left: item.left, right: item.right }}
              className={`absolute rounded-xl sm:rounded-2xl border backdrop-blur-[2px] flex items-center justify-center font-mono font-bold tracking-wider shadow-sm transition-all duration-200 ${item.size} ${item.rotate} ${item.anim} ${
                isActive
                  ? 'border-amber-400 bg-amber-400/30 text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.7)] scale-110 z-20'
                  : item.baseStyle
              }`}
            >
              {item.char}
            </div>
          );
        })}
      </div>

      {/* --- LAYER 4: Ambient Radial Vignette (Ensures Center Typography is 100% Crisp & Legible) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_rgba(7,10,19,0.72)_52%,_#070a13_94%)] pointer-events-none z-[1]" />

      {/* --- LAYER 5: Centered Hero Typography & Action Controls --- */}
      <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center space-y-7 z-10 my-auto py-8">
        {/* Handwritten aesthetic accent */}
        <div className="inline-flex items-center gap-2 text-amber-400 font-script text-2xl sm:text-3xl tracking-wide select-none">
          <span>type</span>
          <span className="text-white/40">·</span>
          <span>drive</span>
          <span className="text-white/40">·</span>
          <span>escape</span>
          <svg className="w-8 h-4 text-amber-400/80 stroke-current -rotate-6 ml-1" viewBox="0 0 40 20" fill="none">
            <path d="M2 15 C 15 5, 25 18, 38 4" strokeWidth="2" strokeLinecap="round" />
            <path d="M34 2 L38 4 L36 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Main Huge Headline — Perfectly Centered */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[0.96] text-[#f8fafc]">
          Race your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8] drop-shadow-sm">
            thoughts.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-2xl text-[#94a3b8] font-normal max-w-xl mx-auto leading-relaxed">
          A typing game for your <span className="text-amber-400 font-semibold">meanwhile</span>.
        </p>

        {/* Interactive Tactile Mechanical Switch Bar with Live Keystroke Feedback */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md shadow-xl select-none">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">Tactile Switches:</span>
          <div className="flex items-center gap-1.5">
            {['W', 'P', 'M', 'SPACE', '⚡'].map((k) => {
              const isThisActive = activeKey === k;
              return (
                <button
                  key={k}
                  onClick={() => {
                    setActiveKey(k);
                    soundEngine.playKeypress(k === 'SPACE' || k === '⚡');
                    setTimeout(() => setActiveKey(null), 250);
                  }}
                  title="Click or press key on physical keyboard"
                  className={`h-7 px-2.5 rounded-md border text-[11px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isThisActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 scale-95 shadow-[0_0_15px_rgba(251,191,36,0.7)]'
                      : 'bg-black/50 border-white/20 text-white hover:border-amber-400 hover:text-amber-300 active:scale-95'
                  }`}
                >
                  {k === 'SPACE' ? '␣' : k}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden md:inline pl-1">
            {activeKey ? `Key: ${activeKey}` : 'press any key to test sound'}
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
          <button
            onClick={handlePlayNow}
            className="px-8 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-white/10 hover:shadow-white/25 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
          >
            <span>Play Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setShowTrailerModal(true)}
            className="px-6 py-3.5 rounded-full glass-pill text-[#f8fafc] font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-current text-[#f8fafc] ml-0.5" />
            </div>
            <span>Watch Trailer</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setMultiplayerModalOpen(true);
            }}
            className="px-6 py-3.5 rounded-full glass-pill border border-amber-400/25 text-amber-300 font-medium text-sm hover:bg-amber-400/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Multiplayer Rooms</span>
          </button>
        </div>

        {/* Quick Launch Subtext */}
        <div>
          <button
            onClick={handleQuickLaunch}
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-amber-400 transition-colors cursor-pointer group"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Instant Quick Race · Jump straight to asphalt</span>
          </button>
        </div>
      </div>

      {/* --- LAYER 6: Bottom Feature Badges --- */}
      <div className="max-w-7xl mx-auto w-full pt-10 pb-2 z-10 border-t border-white/[0.06] mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Typing Driven</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Your speed is your typing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-purple-400/10 border border-purple-400/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Multiplayer</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Race real players worldwide.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-400 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Beautiful Tracks</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Cities, mountains, coasts.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Custom Garage</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Unlock and customise.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Video Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#0e1526] border border-white/10 p-6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#f8fafc]">meanwhile · cinematic experience</span>
              </div>
              <button 
                onClick={() => setShowTrailerModal(false)}
                className="text-xs text-[#94a3b8] hover:text-white px-2.5 py-1 rounded-md bg-white/5 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black relative flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="relative text-center px-6 z-10">
                <div 
                  className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform"
                  onClick={handleQuickLaunch}
                >
                  <Play className="w-6 h-6 fill-current text-amber-400 ml-1" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Race Your Thoughts</h4>
                <p className="text-sm text-[#94a3b8] max-w-md mx-auto mb-6">
                  Every keystroke drives acceleration. Every word sharpens focus. Enter the 3D track now.
                </p>
                <button
                  onClick={() => {
                    setShowTrailerModal(false);
                    handleQuickLaunch();
                  }}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Start Instant Race Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
