import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowRight, Play, Zap, Users, Compass, Car, Sparkles, Volume2, Keyboard } from 'lucide-react';
import keyboardHeroImage from '../../assets/mechanical_keyboard_hero.jpg';

export const HeroSection = () => {
  const { setView, initRace, setGameMode } = useGameStore();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

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
    <section className="relative w-full min-h-[calc(100vh-65px)] flex flex-col justify-between px-6 lg:px-14 py-8 lg:py-12 overflow-hidden bg-gradient-to-b from-[#070a13] via-[#090e1c] to-[#070a13]">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 z-10">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-7">
          {/* Handwritten aesthetic accent */}
          <div className="flex items-center gap-2 text-amber-400 font-script text-2xl lg:text-3xl tracking-wide select-none">
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

          {/* Main Huge Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] text-[#f8fafc]">
            Race <br />
            your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8]">
              thoughts.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-[#94a3b8] font-normal max-w-lg">
            A typing game for your <span className="text-amber-400 font-medium">meanwhile</span>.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handlePlayNow}
              className="px-7 py-3.5 rounded-full bg-[#f8fafc] hover:bg-white text-slate-950 font-semibold text-sm tracking-wide shadow-lg shadow-white/5 hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Play Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
              onClick={handleQuickLaunch}
              className="px-4 py-3 rounded-full text-xs text-[#94a3b8] hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Quick Race</span>
            </button>
          </div>
        </div>

        {/* Right Column: High-Speed Mechanical Keyboard Visual */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          <div className="relative w-full aspect-[16/11] max-w-xl rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl shadow-black/90 group bg-[#0c1222]">
            {/* Cinematic High-Speed Mechanical Keyboard Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url(${keyboardHeroImage})`
              }}
            />
            {/* Subtle Gradient Overlays for Ambient Glow & Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a13] via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#070a13]/60 via-transparent to-amber-950/20" />

            {/* Top-Left: Live Mechanical Switch Status */}
            <div className="absolute top-4 left-4 glass-pill px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-[#f8fafc] shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Tactile Switches · 1.2ms</span>
            </div>

            {/* Top-Right: Velocity Telemetry */}
            <div className="absolute top-4 right-4 glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono-num font-bold text-amber-300 shadow-lg">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>142 WPM Cadence</span>
            </div>

            {/* Bottom Interactive Area */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
              {/* Interactive Keycaps Strip */}
              <div className="flex items-center gap-1.5">
                {['W', 'P', 'M', '⚡'].map((keyLabel, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playKeypress(keyLabel === '⚡');
                    }}
                    title="Click for mechanical keypress sound"
                    className="w-8 h-8 rounded-lg bg-black/70 hover:bg-amber-400/20 active:scale-90 border border-white/20 hover:border-amber-400 text-[11px] font-mono font-bold text-white hover:text-amber-300 shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
                  >
                    {keyLabel}
                  </button>
                ))}
                <span className="text-[10px] text-slate-300 font-medium pl-1 hidden sm:inline drop-shadow">
                  Click to test sound
                </span>
              </div>

              {/* Floating Launch Button */}
              <button
                onClick={handleQuickLaunch}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-[#f8fafc] backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              >
                <span>Launch Race</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Feature Badges matching the Reference Image */}
      <div className="max-w-7xl mx-auto w-full pt-12 pb-4 z-10 border-t border-white/[0.06] mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Badge 1 */}
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Typing Driven</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Your speed is your typing.</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-purple-400/10 border border-purple-400/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Multiplayer</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Race real players worldwide.</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-start gap-3.5 group">
            <div className="p-2.5 rounded-xl bg-sky-400/10 border border-sky-400/20 text-sky-400 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f8fafc]">Beautiful Tracks</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Cities, mountains, coasts.</p>
            </div>
          </div>

          {/* Badge 4 */}
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
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform"
                     onClick={handleQuickLaunch}>
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
