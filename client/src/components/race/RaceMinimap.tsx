import React, { useMemo } from 'react';
import { Navigation } from 'lucide-react';
import { RacerHudData } from './RaceHud.js';

interface RaceMinimapProps {
  trackId?: string;
  trackName?: string;
  localProgress: number;
  racers: RacerHudData[];
}

export const RaceMinimap: React.FC<RaceMinimapProps> = ({
  trackId = 'chennai',
  trackName = 'Chennai Marina Coast',
  localProgress,
  racers,
}) => {
  // Precompute track circuit loop points for 2D map projection (0..100 viewBox)
  const trackPathD = useMemo(() => {
    // Elegant sweeping circuit loop with a long coastal straight
    return 'M 25,75 C 25,85 45,90 70,88 C 82,85 86,70 85,50 C 84,30 82,15 65,12 C 45,10 20,20 18,38 C 16,55 22,65 25,75 Z';
  }, []);

  // Approximate position on the circuit path based on 0..1 progress
  const getPointOnTrack = (progress: number) => {
    const p = Math.max(0, Math.min(0.999, progress));
    // Sample along the loop (starts bottom-left, goes counter-clockwise)
    if (p < 0.25) {
      // Bottom straight to bottom right
      const sub = p / 0.25;
      const x = 25 + sub * (78 - 25);
      const y = 75 + Math.sin(sub * Math.PI) * 14;
      const angle = 10;
      return { x, y, angle };
    } else if (p < 0.55) {
      // Up along the right coastal highway
      const sub = (p - 0.25) / 0.30;
      const x = 78 + Math.sin(sub * Math.PI) * 8 - sub * 12;
      const y = 88 - sub * (88 - 14);
      const angle = -85;
      return { x, y, angle };
    } else if (p < 0.80) {
      // Top turn and sweep down-left
      const sub = (p - 0.55) / 0.25;
      const x = 66 - sub * (66 - 18);
      const y = 14 + Math.sin(sub * Math.PI) * 12 + sub * 24;
      const angle = -160;
      return { x, y, angle };
    } else {
      // Final sector back to start/finish
      const sub = (p - 0.80) / 0.20;
      const x = 18 + sub * (25 - 18);
      const y = 38 + sub * (75 - 38);
      const angle = 80;
      return { x, y, angle };
    }
  };

  const localPos = getPointOnTrack(localProgress);

  // Dynamic GPS coordinate computation based on progress (Chennai Marina Beach coordinates)
  const baseLat = 13.06470;
  const baseLon = 80.28933;
  const currentLat = (baseLat + Math.sin(localProgress * Math.PI * 2) * 0.0035).toFixed(5);
  const currentLon = (baseLon + Math.cos(localProgress * Math.PI * 2) * 0.0028).toFixed(5);

  return (
    <div className="relative w-44 h-36 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl select-none backdrop-blur-md bg-[#131b26]/95 pointer-events-auto transition-transform hover:scale-105">
      {/* Background Map Styling: Coastal water strip on right */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
          <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Land Base */}
        <rect width="100" height="100" fill="#151e2b" />
        <rect width="100" height="100" fill="url(#gridPattern)" />

        {/* Coastal Water Strip (Bay of Bengal / Marina Beach on the east) */}
        <path
          d="M 88,0 Q 94,50 86,100 L 100,100 L 100,0 Z"
          fill="url(#oceanGrad)"
        />

        {/* City Blocks (Soft architectural shapes) */}
        <rect x="28" y="24" width="12" height="10" rx="1.5" fill="#1e293b" opacity="0.6" />
        <rect x="44" y="22" width="16" height="12" rx="1.5" fill="#1e293b" opacity="0.6" />
        <rect x="30" y="42" width="14" height="18" rx="1.5" fill="#1e293b" opacity="0.6" />
        <rect x="48" y="40" width="18" height="22" rx="1.5" fill="#1e293b" opacity="0.6" />

        {/* Circuit Track Outer Glow */}
        <path
          d={trackPathD}
          fill="none"
          stroke="rgba(0, 245, 255, 0.25)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circuit Road Surface */}
        <path
          d={trackPathD}
          fill="none"
          stroke="#334155"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Circuit Center Line (Yellow) */}
        <path
          d={trackPathD}
          fill="none"
          stroke="#facc15"
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />

        {/* Start / Finish Checkered Gate Line */}
        <line x1="22" y1="73" x2="28" y2="77" stroke="#ffffff" strokeWidth="2.5" />

        {/* Landmark POI Markers */}
        <g transform="translate(85, 48)">
          <circle r="2.2" fill="#38bdf8" />
          <text x="3" y="1" fontSize="4.5" fill="#7dd3fc" fontWeight="bold">Marina</text>
        </g>
        <g transform="translate(32, 20)">
          <circle r="1.8" fill="#ef4444" />
          <text x="2.5" y="1" fontSize="3.5" fill="#fca5a5">Hospital</text>
        </g>
        <g transform="translate(48, 68)">
          <circle r="1.8" fill="#f59e0b" />
          <text x="2.5" y="1" fontSize="3.5" fill="#fcd34d">Central</text>
        </g>

        {/* Competitor Racer Dots */}
        {racers.filter(r => !r.isLocal).map((r) => {
          const pt = getPointOnTrack(r.progress);
          return (
            <g key={r.id} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle r="2.8" fill={r.vehicleColor || '#a855f7'} stroke="#ffffff" strokeWidth="0.8" />
            </g>
          );
        })}

        {/* Local Player Heading Arrow (Bright Orange/White Radar Triangle) */}
        <g transform={`translate(${localPos.x}, ${localPos.y}) rotate(${localPos.angle})`}>
          {/* Radar Pulse Ping */}
          <circle r="5" fill="none" stroke="#f97316" strokeWidth="0.8" opacity="0.6">
            <animate attributeName="r" values="3;7;3" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
          {/* Directional Triangle */}
          <polygon
            points="0,-4.5 3.5,3.5 0,1.8 -3.5,3.5"
            fill="#f97316"
            stroke="#ffffff"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* Top Banner Tag */}
      <div className="absolute top-1.5 left-2 right-2 flex items-center justify-between text-[8px] font-mono font-bold tracking-wider text-slate-300">
        <span className="flex items-center gap-1 text-sky-400">
          <Navigation className="w-2.5 h-2.5 rotate-45" /> {trackName.split(' ')[0].toUpperCase()} RADAR
        </span>
        <span className="text-amber-400">GPS LIVE</span>
      </div>

      {/* Bottom Coordinates Strip (matching screenshot: Lat: 13.06470 Lon: 80.28933) */}
      <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[7.5px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/60">
        <span>Lat: <strong className="text-white">{currentLat}</strong></span>
        <span>Lon: <strong className="text-white">{currentLon}</strong></span>
      </div>
    </div>
  );
};
