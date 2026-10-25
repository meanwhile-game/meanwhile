import React from 'react';
import { ChevronRight } from 'lucide-react';

export const TrackMinimap = ({ racers = [], playerProgress = 0 }) => {
  // Coastal Mountain Pass Spline Contour matching the reference screenshot
  // A vertical winding mountain-ocean circuit loop
  const getPointAtProgress = (progress) => {
    const t = (progress % 1) * Math.PI * 2;
    // Parametric contour matching the vertical winding coastal loop in the screenshot
    const x = 50 + 26 * Math.sin(t) - 10 * Math.sin(2 * t);
    const y = 60 - 38 * Math.cos(t) + 8 * Math.cos(2 * t);
    return { x, y };
  };

  const playerPos = getPointAtProgress(playerProgress);

  return (
    <div className="relative flex items-center gap-3 select-none">
      {/* Vertical Track Outline Card */}
      <div className="relative w-28 h-40 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-2 shadow-2xl flex items-center justify-center">
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Track Spline Base */}
          <path
            d="M 50 22 C 72 20, 80 40, 75 60 C 70 80, 75 100, 50 102 C 25 100, 30 80, 25 60 C 20 40, 28 24, 50 22 Z"
            className="fill-none stroke-white/20 stroke-[3.5]"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start/Finish Gantry Line */}
          <line x1="45" y1="22" x2="55" y2="22" className="stroke-white/80 stroke-[2]" />

          {/* Opponent Driver Dots */}
          {racers.filter(r => !r.isPlayer).map((bot, idx) => {
            const pos = getPointAtProgress(bot.progress || 0);
            const dotColors = ['#f59e0b', '#38bdf8', '#a855f7', '#fb7185', '#34d399', '#f97316', '#cbd5e1'];
            return (
              <circle
                key={bot.id || idx}
                cx={pos.x}
                cy={pos.y}
                r="3"
                className="stroke-black stroke-[0.5]"
                fill={dotColors[idx % dotColors.length]}
              />
            );
          })}

          {/* Player Driver Dot (Glowing blue/white pulse) */}
          <circle
            cx={playerPos.x}
            cy={playerPos.y}
            r="4.5"
            className="fill-white stroke-sky-400 stroke-[2] drop-shadow-[0_0_10px_#38bdf8]"
          />
        </svg>
      </div>

      {/* Dynamic Road Curve Warning Arrow (Yellow Chevron matching screenshot) */}
      <div className="flex items-center justify-center w-8 h-12 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
        <ChevronRight className="w-6 h-6 text-amber-400 animate-pulse stroke-[3]" />
      </div>
    </div>
  );
};
