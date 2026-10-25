import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { TRACKS } from '../../data/tracks.js';

export const TrackMinimap = ({ racers = [], playerProgress = 0, track = null }) => {
  const currentTrack = track || TRACKS[1];
  const pathRef = useRef(null);
  const [totalLength, setTotalLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setTotalLength(len);
      } catch (e) {
        console.warn('SVG getTotalLength error:', e);
      }
    }
  }, [currentTrack.id, currentTrack.svgPath]);

  // Compute exact coordinate on circuit path for any 0..1 progress
  const getPointAtProgress = (progress) => {
    const normProg = Math.max(0, Math.min(1, progress % 1));
    if (pathRef.current && totalLength > 0) {
      try {
        const pt = pathRef.current.getPointAtLength(normProg * totalLength);
        return { x: pt.x, y: pt.y };
      } catch (e) {
        // Fallback below
      }
    }

    // Mathematical parametric fallback tailored to circuit
    const t = normProg * Math.PI * 2;
    if (currentTrack.id === 'city-circuit') {
      const x = 50 + 32 * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 0.6);
      const y = 60 - 36 * Math.sign(Math.cos(t)) * Math.pow(Math.abs(Math.cos(t)), 0.6);
      return { x, y };
    } else if (currentTrack.id === 'mountain-circuit') {
      const x = 50 + 26 * Math.sin(t) + 8 * Math.sin(2 * t);
      const y = 60 - 40 * Math.cos(t) + 6 * Math.cos(2 * t);
      return { x, y };
    } else if (currentTrack.id === 'snow-circuit') {
      const x = 50 + 24 * Math.sin(t) - 10 * Math.sin(3 * t);
      const y = 60 - 38 * Math.cos(t) + 8 * Math.cos(2 * t);
      return { x, y };
    }
    // Default coastal
    const x = 50 + 26 * Math.sin(t) - 10 * Math.sin(2 * t);
    const y = 60 - 38 * Math.cos(t) + 8 * Math.cos(2 * t);
    return { x, y };
  };

  const playerPos = getPointAtProgress(playerProgress);
  const accent = currentTrack.accentColor || '#38bdf8';

  return (
    <div className="relative flex items-center gap-3 select-none">
      {/* Circuit Minimap Outline Card */}
      <div className="relative w-32 h-44 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 p-2.5 shadow-2xl flex flex-col justify-between">
        {/* Header: Circuit Number & KM */}
        <div className="flex items-center justify-between text-[10px] font-mono-num font-bold text-white/90 border-b border-white/[0.08] pb-1 px-1">
          <span style={{ color: accent }} className="tracking-wide">
            {currentTrack.circuitNumber || '02'}
          </span>
          <span className="text-white/70 text-[9px]">
            {currentTrack.distanceKm || 6.1} KM
          </span>
        </div>

        {/* SVG Route Outline */}
        <div className="relative flex-1 flex items-center justify-center my-0.5">
          <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
            {/* Base circuit route path */}
            <path
              ref={pathRef}
              d={currentTrack.svgPath}
              className="fill-none stroke-white/20 stroke-[3.5]"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing accent track contour */}
            <path
              d={currentTrack.svgPath}
              className="fill-none stroke-[1.5] opacity-50"
              stroke={accent}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Start / Finish Gantry Marker */}
            <circle cx="50" cy="18" r="2.5" fill="#f8fafc" />

            {/* Opponent Driver Dots */}
            {racers.filter(r => !r.isPlayer).map((bot, idx) => {
              const pos = getPointAtProgress(bot.progress || 0);
              const dotColors = ['#f59e0b', '#38bdf8', '#a855f7', '#fb7185', '#34d399', '#f97316', '#cbd5e1'];
              return (
                <circle
                  key={bot.id || idx}
                  cx={pos.x}
                  cy={pos.y}
                  r="2.8"
                  className="stroke-black stroke-[0.5]"
                  fill={dotColors[idx % dotColors.length]}
                />
              );
            })}

            {/* Player Driver Dot (Glowing pulsing dot) */}
            <circle
              cx={playerPos.x}
              cy={playerPos.y}
              r="4.2"
              fill="#ffffff"
              stroke={accent}
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />
          </svg>
        </div>

        {/* Track Name Footer */}
        <div className="text-[9px] uppercase font-mono tracking-wider text-center text-slate-300 font-semibold truncate px-1">
          {currentTrack.name.replace(' CIRCUIT', '')}
        </div>
      </div>

      {/* Dynamic Road Curve Warning Arrow */}
      <div className="flex items-center justify-center w-8 h-12 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
        <ChevronRight className="w-6 h-6 text-amber-400 animate-pulse stroke-[3]" />
      </div>
    </div>
  );
};
