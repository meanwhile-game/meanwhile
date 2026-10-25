import React from 'react';

export const TrackMinimap = ({ racers = [], playerProgress = 0, trackId = 'coastal-drive' }) => {
  // Oval / Spline circuit points
  const getPointAtProgress = (progress) => {
    // Elliptical racetrack loop with natural curves
    const t = (progress % 1) * Math.PI * 2;
    // Circuit parametric equation
    const x = 55 + 38 * Math.cos(t) + 6 * Math.sin(2 * t);
    const y = 55 + 32 * Math.sin(t) - 8 * Math.cos(2 * t);
    return { x, y };
  };

  const playerPos = getPointAtProgress(playerProgress);

  return (
    <div className="relative w-36 h-36 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 p-2 flex items-center justify-center select-none shadow-2xl">
      <svg viewBox="0 0 110 110" className="w-full h-full">
        {/* Track Guideline Base */}
        <path
          d="M 93 55 C 93 85, 17 85, 17 55 C 17 25, 93 25, 93 55 Z"
          className="fill-none stroke-white/15 stroke-[4]"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Start / Finish Marker */}
        <line x1="55" y1="20" x2="55" y2="28" className="stroke-white/60 stroke-[2]" />

        {/* Opponent Bot Racer Dots */}
        {racers.filter(r => !r.isPlayer).map(bot => {
          const pos = getPointAtProgress(bot.progress || 0);
          return (
            <circle
              key={bot.id}
              cx={pos.x}
              cy={pos.y}
              r="3"
              className="fill-amber-400/80 stroke-black stroke-[0.5]"
            />
          );
        })}

        {/* Player Racer Dot (Glowing with pulse) */}
        <circle
          cx={playerPos.x}
          cy={playerPos.y}
          r="4.5"
          className="fill-white stroke-sky-400 stroke-[2] drop-shadow-[0_0_8px_#38bdf8]"
        />
      </svg>

      <span className="absolute bottom-1.5 text-[9px] uppercase tracking-wider font-semibold text-[#64748b]">
        Track Map
      </span>
    </div>
  );
};
