import React from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { AdSlot } from './AdSlot.jsx';

export const Footer = () => {
  const { setView } = useGameStore();

  return (
    <footer className="w-full bg-[#050811] border-t border-white/[0.06] pt-10 pb-8 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Ad slot near footer (hidden when ads disabled) */}
        <AdSlot slotId="footer-banner" format="horizontal-banner" className="mb-8" />

        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#64748b]">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-tight text-[#f8fafc]">meanwhile</span>
            <span>·</span>
            <span>a little escape, in your meantime.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setView('tracks')} className="hover:text-[#f8fafc] transition-colors cursor-pointer">Tracks</button>
            <button onClick={() => setView('garage')} className="hover:text-[#f8fafc] transition-colors cursor-pointer">Garage</button>
            <button onClick={() => setView('leaderboard')} className="hover:text-[#f8fafc] transition-colors cursor-pointer">Leaderboard</button>
          </div>

          <div className="text-right">
            <span>Designed for mindful speed & focus.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
