import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { api } from '../../services/supabase.js';
import { AdSlot } from '../common/AdSlot.jsx';
import { soundEngine } from '../../sound/soundEngine.js';
import { ArrowLeft, Crown, Trophy, Sparkles } from 'lucide-react';

export const LeaderboardScreen = () => {
  const { setView, profile } = useGameStore();
  const [period, setPeriod] = useState('all_time');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getLeaderboard(period).then((data) => {
      if (isMounted) {
        setLeaderboard(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [period]);

  const tabs = [
    { id: 'all_time', label: 'All Time' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a13] px-6 lg:px-14 py-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06]">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-[#f8fafc]">meanwhile</span>
          </button>
          <div className="text-xs text-[#64748b] tracking-wider uppercase">
            Global Standings
          </div>
        </div>

        {/* Heading & Period Filter Tabs */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f8fafc]">
              Global Leaderboard
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Top typing drivers across all circuits.
            </p>
          </div>

          {/* Filter Pills matching Reference UI */}
          <div className="flex items-center gap-2 p-1 rounded-full bg-[#0c1222] border border-white/[0.08]">
            {tabs.map((tab) => {
              const isActive = period === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setPeriod(tab.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.14] text-[#f8fafc] shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table matching Reference UI */}
        <div className="w-full rounded-2xl bg-[#0c1222] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#64748b] border-b border-white/[0.06]">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-right">Best WPM</div>
            <div className="col-span-2 text-right">Races</div>
            <div className="col-span-2 text-right">Win Rate</div>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {leaderboard.map((racer, index) => {
              const isCurrentUser = racer.username === (profile?.username || 'rishi');
              const rank = racer.rank || index + 1;
              const isPodium = rank <= 3;

              return (
                <div
                  key={racer.user_id || index}
                  className={`grid grid-cols-12 px-6 py-4 items-center text-sm transition-all ${
                    isCurrentUser
                      ? 'bg-amber-400/10 border-y border-amber-400/30 font-semibold'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank Column with Crown */}
                  <div className="col-span-1 flex items-center gap-1.5 font-mono-num font-bold">
                    {rank === 1 ? (
                      <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ) : rank === 2 ? (
                      <Crown className="w-4 h-4 text-slate-300 fill-slate-300" />
                    ) : rank === 3 ? (
                      <Crown className="w-4 h-4 text-amber-600 fill-amber-600" />
                    ) : (
                      <span className="text-[#64748b] pl-1">{rank}</span>
                    )}
                  </div>

                  {/* Player Avatar & Username */}
                  <div className="col-span-5 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-white/10">
                      {racer.avatar_url || '🏎️'}
                    </span>
                    <span className={`font-semibold ${isCurrentUser ? 'text-amber-300' : 'text-[#f8fafc]'}`}>
                      {racer.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                        You
                      </span>
                    )}
                  </div>

                  {/* Best WPM */}
                  <div className="col-span-2 text-right font-mono-num font-bold text-[#f8fafc]">
                    {racer.best_wpm}
                  </div>

                  {/* Races Count */}
                  <div className="col-span-2 text-right font-mono-num text-[#94a3b8]">
                    {racer.total_races}
                  </div>

                  {/* Win Rate % */}
                  <div className="col-span-2 text-right font-mono-num text-emerald-400 font-medium">
                    {racer.win_rate}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AdSlot Placement on Leaderboard Page */}
        <AdSlot slotId="leaderboard-bottom" format="leaderboard-banner" className="mt-8" />
      </div>
    </div>
  );
};
