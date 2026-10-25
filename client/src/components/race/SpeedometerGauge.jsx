import React from 'react';

export const SpeedometerGauge = ({ speed = 168, maxSpeed = 320, gear = 4 }) => {
  const percentage = Math.min(1, Math.max(0, speed / maxSpeed));
  // Needle angle from -135deg to +135deg (total 270deg sweep)
  const angle = -135 + percentage * 270;

  // Arc calculation for SVG gauge
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage * 0.75 * circumference);

  return (
    <div className="relative w-40 h-40 flex items-center justify-center select-none">
      {/* Outer Glow Background */}
      <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl" />

      {/* SVG Radial Dial Gauge */}
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
        {/* Track Ring */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="stroke-white/[0.08]"
          strokeWidth="7"
          fill="none"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        {/* Active Speed Arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="transition-all duration-150 ease-out"
          stroke="url(#speedGradient)"
          strokeWidth="7"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Readout matching Reference UI */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black font-mono-num tracking-tight text-[#f8fafc] leading-none drop-shadow-md">
          {Math.round(speed)}
        </span>
        <span className="text-[10px] tracking-wider font-semibold text-[#94a3b8] mt-0.5">
          KM/H
        </span>
      </div>

      {/* Gear Indicator on Bottom-Right */}
      <div className="absolute bottom-2.5 right-3 text-xs font-mono-num font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
        {gear}
      </div>
    </div>
  );
};
