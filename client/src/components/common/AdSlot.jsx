import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';

/**
 * AdSlot - Responsive, zero-layout-shift advertisement placeholder container.
 * 
 * Rules:
 * 1. NEVER shown during active gameplay or inside the 3D racing viewport.
 * 2. When enableAds is false (default in production), returns null with zero DOM footprint and zero margin/padding gap.
 * 3. In dev / demo mode (when enabled), renders a subtle, elegant, automotive-toned placeholder.
 * 4. Prepared for Google AdSense / header bidding script injection without altering the UI architecture.
 */
export const AdSlot = ({
  slotId = 'home-mid',
  format = 'horizontal-banner', // 'horizontal-banner' | 'leaderboard-banner' | 'inline-rectangle'
  className = ''
}) => {
  const enableAds = useGameStore((state) => state.enableAds);

  // If ads are disabled, render nothing (no wrapper, zero layout shift)
  if (!enableAds) {
    return null;
  }

  // Dimensions based on standard IAB responsive formats
  const formatStyles = {
    'horizontal-banner': 'min-h-[90px] max-w-4xl',
    'leaderboard-banner': 'min-h-[90px] max-w-5xl',
    'inline-rectangle': 'min-h-[120px] max-w-md'
  };

  return (
    <div 
      className={`w-full my-6 flex flex-col items-center justify-center transition-opacity duration-300 ${className}`}
      data-ad-slot-id={slotId}
      data-ad-format={format}
    >
      <div 
        className={`w-full ${formatStyles[format] || 'min-h-[90px]'} rounded-xl border border-white/5 bg-[#0a0f1d]/60 backdrop-blur-md p-4 flex flex-col items-center justify-center text-center relative overflow-hidden`}
      >
        <span className="text-[10px] uppercase tracking-widest text-[#64748b] font-medium mb-1">
          Advertisement
        </span>
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]/70">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></span>
          <span>Reserved Sponsor Placement · {slotId}</span>
        </div>
      </div>
    </div>
  );
};
