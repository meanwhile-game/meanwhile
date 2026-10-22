import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, fetchLeaderboard } from '../../services/api.js';
import { ArrowLeft, Search, Trophy, Crown, Medal, Sparkles, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';

interface LeaderboardScreenProps {
  currentUserId: string;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ currentUserId, onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'GRANDMASTER' | 'DIAMOND'>('ALL');

  useEffect(() => {
    fetchLeaderboard()
      .then(data => setEntries(data))
      .catch(console.warn);
  }, []);

  const handleFilterChange = (filter: 'ALL' | 'GRANDMASTER' | 'DIAMOND') => {
    sound.playKeystroke(70, true);
    setTierFilter(filter);
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.username.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (tierFilter === 'GRANDMASTER') return (e.bestWpm || 0) >= 100;
    if (tierFilter === 'DIAMOND') return (e.bestWpm || 0) >= 75 && (e.bestWpm || 0) < 100;
    return true;
  });

  const topThree = entries.slice(0, 3);

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none bg-slate-950 text-white bg-cyber-grid"
    >
      {/* 1. Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => {
            sound.playKeystroke(50, true);
            onBack();
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:border-slate-500"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Return to Grid
        </button>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold text-sm tracking-tight text-white">
            GLOBAL HALL OF FAME
          </span>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          SEASON 1 RANKINGS
        </span>
      </header>

      {/* 2. Main Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 z-10">
        
        {/* Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-2 bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>SERVER-VERIFIED AUTHORITATIVE TELEMETRY</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Apex Standings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              World championship ladder ranked by keystroke velocity, consistency, and race victories.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by pilot call-sign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* 3. Top 3 Podium Showcase Cards */}
        {topThree.length >= 3 && tierFilter === 'ALL' && !search && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Rank 2 - Silver */}
            <div className="p-5 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-xl flex flex-col justify-between order-2 md:order-1 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center font-mono border border-slate-500">
                  #2
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">SILVER RUNNER-UP</span>
              </div>
              <div className="my-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-3xl shadow-md">
                  {topThree[1].avatar}
                </div>
                <h3 className="text-lg font-black text-white mt-2">{topThree[1].username}</h3>
                <span className="text-xs font-mono text-slate-400">{topThree[1].rankTier}</span>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-400">Peak Velocity</span>
                <span className="text-xl font-black text-cyan-400">{topThree[1].bestWpm} WPM</span>
              </div>
            </div>

            {/* Rank 1 - Champion Gold */}
            <div className="p-6 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-500/15 via-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between order-1 md:order-2 transform md:-translate-y-2 hover:-translate-y-3 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-sm flex items-center justify-center font-mono shadow-md">
                  #1
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/40 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> WORLD CHAMPION
                </span>
              </div>

              <div className="relative z-10 my-4 text-center">
                <div className="w-18 h-18 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                  {topThree[0].avatar}
                </div>
                <h3 className="text-xl font-black text-white mt-2">{topThree[0].username}</h3>
                <span className="text-xs font-mono text-amber-300 font-bold">{topThree[0].rankTier} • Level {topThree[0].level}</span>
              </div>

              <div className="relative z-10 pt-3 border-t border-amber-500/30 flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-300">Peak Velocity</span>
                <span className="text-2xl font-black text-amber-300">{topThree[0].bestWpm} WPM</span>
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="p-5 rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-xl flex flex-col justify-between order-3 transform hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-800 text-amber-200 font-black text-xs flex items-center justify-center font-mono border border-amber-700">
                  #3
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">BRONZE PODIUM</span>
              </div>
              <div className="my-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-3xl shadow-md">
                  {topThree[2].avatar}
                </div>
                <h3 className="text-lg font-black text-white mt-2">{topThree[2].username}</h3>
                <span className="text-xs font-mono text-slate-400">{topThree[2].rankTier}</span>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-400">Peak Velocity</span>
                <span className="text-xl font-black text-rose-400">{topThree[2].bestWpm} WPM</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              tierFilter === 'ALL'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ALL RACERS ({entries.length})
          </button>
          <button
            onClick={() => handleFilterChange('GRANDMASTER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              tierFilter === 'GRANDMASTER'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            GRANDMASTER (100+ WPM)
          </button>
          <button
            onClick={() => handleFilterChange('DIAMOND')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
              tierFilter === 'DIAMOND'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            DIAMOND (75-99 WPM)
          </button>
        </div>

        {/* 4. Telemetry Roster Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">POS</th>
                  <th className="py-3.5 px-4">PILOT CALL-SIGN</th>
                  <th className="py-3.5 px-4">RANK TIER</th>
                  <th className="py-3.5 px-4 text-right">TOP VELOCITY</th>
                  <th className="py-3.5 px-4 text-right">AVERAGE</th>
                  <th className="py-3.5 px-4 text-right">VICTORIES</th>
                  <th className="py-3.5 px-4 text-right">XP LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                {filteredEntries.map((entry, idx) => {
                  const isUser = entry.id === currentUserId;
                  const rank = entry.rank || idx + 1;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isUser 
                          ? 'bg-emerald-500/15 border-l-4 border-l-emerald-400' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3 px-4 text-center font-bold">
                        {rank === 1 ? (
                          <span className="w-6 h-6 rounded-md bg-amber-400 text-black inline-flex items-center justify-center font-black">1</span>
                        ) : rank === 2 ? (
                          <span className="w-6 h-6 rounded-md bg-slate-400 text-black inline-flex items-center justify-center font-black">2</span>
                        ) : rank === 3 ? (
                          <span className="w-6 h-6 rounded-md bg-amber-700 text-white inline-flex items-center justify-center font-black">3</span>
                        ) : (
                          <span className="text-slate-500">#{rank}</span>
                        )}
                      </td>

                      {/* Pilot Identity */}
                      <td className="py-3 px-4 font-sans font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{entry.avatar}</span>
                          <span className="text-white">{entry.username}</span>
                          {isUser && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rank Tier */}
                      <td className="py-3 px-4 font-sans">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {entry.rankTier}
                        </span>
                      </td>

                      {/* Best Pace */}
                      <td className="py-3 px-4 text-right font-black text-sm text-emerald-400">
                        {entry.bestWpm} <span className="font-normal text-[10px] text-slate-500">WPM</span>
                      </td>

                      {/* Average Pace */}
                      <td className="py-3 px-4 text-right text-slate-300">
                        {entry.averageWpm}
                      </td>

                      {/* Victories */}
                      <td className="py-3 px-4 text-right text-white">
                        <span className="font-bold text-amber-400">{entry.wins}</span>
                        <span className="text-slate-500"> / {entry.races}</span>
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4 text-right font-bold text-slate-400">
                        LVL {entry.level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4 z-10">
        <span>MEANWHILE GLOBAL LEADERBOARD // LIVE TELEMETRY</span>
        <span>ANTI-CHEAT ENGINE VALIDATED</span>
      </footer>
    </div>
  );
};
