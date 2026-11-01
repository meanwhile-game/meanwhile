import React from 'react';

/**
 * Supercar Digital Instrument Cluster Speedometer Gauge
 * Inspired by luxury automotive cockpit telemetry (McLaren / Porsche / Aston Martin)
 */
export const SpeedometerGauge = ({ speed = 168, maxSpeed = 320, gear = 4 }) => {
  const percentage = Math.min(1, Math.max(0, speed / maxSpeed));

  // Gauge dimensions
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc sweep (0.75 of circumference)
  const strokeDashoffset = circumference - (percentage * 0.75 * circumference);

  return (
    <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center select-none pointer-events-none">
      {/* Outer Cockpit Instrument Bezel */}
      <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]" />

      {/* Subtle Inner Ring */}
      <div className="absolute inset-2.5 rounded-full border border-white/[0.06]" />

      {/* Radial Speed Dial Arc */}
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
        {/* Inactive Track Arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="stroke-white/[0.08]"
          strokeWidth="6.5"
          fill="none"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />

        {/* Active Speed Arc with Dynamic Gradient */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="transition-all duration-150 ease-out"
          stroke="url(#speedoGradient)"
          strokeWidth="6.5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="speedoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Readout */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-black font-mono-num tracking-tight text-[#f8fafc] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {Math.round(speed)}
        </span>
        <span className="text-[9px] sm:text-[10px] tracking-widest font-semibold text-[#94a3b8] uppercase mt-0.5">
          KM/H
        </span>
      </div>

      {/* Transmission Gear Indicator Badge */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] font-mono-num font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-md shadow-md">
        <span className="text-[8px] text-amber-400/70 uppercase">GEAR</span>
        <span>{gear}</span>
      </div>
    </div>
  );
};
