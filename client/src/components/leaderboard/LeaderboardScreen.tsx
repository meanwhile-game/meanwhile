import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, fetchLeaderboard } from '../../services/api.js';
import { ArrowLeft, Search, Trophy, Crown, Medal, Sparkles, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { AdBanner } from '../common/AdBanner.js';

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
      className="relative min-h-screen w-full flex flex-col justify-between bg-[#194269] text-slate-100 select-none overflow-x-hidden font-sans"
    >
      {/* 1. Top Navbar Matching Home Page */}
      <nav className="w-full bg-[#10304f] border-b border-[#1b4b7a] px-4 sm:px-8 py-2.5 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#1b4b7a] bg-[#0b2239] hover:bg-[#153a5e] text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow transition-all hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Return to Grid
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onBack()}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow">
              <Trophy className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-xl font-black tracking-tight text-white lowercase">
              meanwhile <span className="text-xs uppercase font-bold text-amber-300 font-mono tracking-wider ml-1">Standings</span>
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-300 bg-[#0b2239] px-3 py-1.5 rounded-lg border border-[#1b4b7a] hidden sm:inline">
          SEASON 1 APEX LADDER
        </span>
      </nav>

      {/* 2. Main Content */}
      <main className="w-full max-w-5xl mx-auto my-auto px-4 py-6 md:py-8 z-10 flex flex-col gap-6">
        
        {/* Banner Card */}
        <div className="w-full rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>SERVER-VERIFIED AUTHORITATIVE TELEMETRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16426a]">
              Global Apex Standings
            </h1>
            <p className="mt-1 text-sm text-slate-600 font-medium">
              World championship ladder ranked by keystroke velocity, consistency, and race victories.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search driver call-sign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#16426a] focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* 3. Top 3 Podium Showcase Cards */}
        {topThree.length >= 3 && tierFilter === 'ALL' && !search && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rank 2 - Silver */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl flex flex-col justify-between order-2 md:order-1 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center font-mono border border-slate-300">
                  #2
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">SILVER RUNNER-UP</span>
              </div>
              <div className="my-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                  {topThree[1].avatar}
                </div>
                <h3 className="text-lg font-extrabold text-[#16426a] mt-2">{topThree[1].username}</h3>
                <span className="text-xs font-mono text-slate-500 font-bold">{topThree[1].rankTier}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-500 font-bold">Peak Pace</span>
                <span className="text-xl font-black text-[#16426a]">{topThree[1].bestWpm} WPM</span>
              </div>
            </div>

            {/* Rank 1 - Champion Gold */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-50 to-white text-slate-900 border-2 border-amber-400 shadow-2xl flex flex-col justify-between order-1 md:order-2 transform md:-translate-y-2 hover:-translate-y-3 transition-all relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono shadow">
                  #1
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" /> WORLD CHAMPION
                </span>
              </div>

              <div className="my-4 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-md">
                  {topThree[0].avatar}
                </div>
                <h3 className="text-xl font-black text-[#16426a] mt-2">{topThree[0].username}</h3>
                <span className="text-xs font-mono text-amber-800 font-bold">{topThree[0].rankTier} • Level {topThree[0].level}</span>
              </div>

              <div className="pt-3 border-t border-amber-200 flex justify-between items-baseline font-mono">
                <span className="text-xs text-amber-800 font-bold">Peak Pace</span>
                <span className="text-2xl font-black text-[#2ea44f]">{topThree[0].bestWpm} WPM</span>
              </div>
            </div>

            {/* Rank 3 - Bronze */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl flex flex-col justify-between order-3 hover:-translate-y-1 transition-all">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center font-mono border border-amber-300">
                  #3
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">BRONZE PODIUM</span>
              </div>
              <div className="my-4 text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
                  {topThree[2].avatar}
                </div>
                <h3 className="text-lg font-extrabold text-[#16426a] mt-2">{topThree[2].username}</h3>
                <span className="text-xs font-mono text-slate-500 font-bold">{topThree[2].rankTier}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-mono">
                <span className="text-xs text-slate-500 font-bold">Peak Pace</span>
                <span className="text-xl font-black text-[#16426a]">{topThree[2].bestWpm} WPM</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm ${
              tierFilter === 'ALL'
                ? 'bg-[#2ea44f] text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ALL RACERS ({entries.length})
          </button>
          <button
            onClick={() => handleFilterChange('GRANDMASTER')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm ${
              tierFilter === 'GRANDMASTER'
                ? 'bg-[#f6c344] text-slate-950 shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            GRANDMASTER (100+ WPM)
          </button>
          <button
            onClick={() => handleFilterChange('DIAMOND')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm ${
              tierFilter === 'DIAMOND'
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            DIAMOND (75-99 WPM)
          </button>
        </div>

        {/* 4. Telemetry Roster Table in Crisp White Card */}
        <div className="rounded-2xl border border-slate-200 bg-white text-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">POS</th>
                  <th className="py-3.5 px-4">DRIVER CALL-SIGN</th>
                  <th className="py-3.5 px-4">TIER</th>
                  <th className="py-3.5 px-4 text-right">TOP PACE</th>
                  <th className="py-3.5 px-4 text-right">AVERAGE</th>
                  <th className="py-3.5 px-4 text-right">WINS / RACES</th>
                  <th className="py-3.5 px-4 text-right">LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredEntries.map((entry, idx) => {
                  const isUser = entry.id === currentUserId;
                  const rank = entry.rank || idx + 1;

                  return (
                    <tr
                      key={entry.id}
                      className={`transition-colors ${
                        isUser 
                          ? 'bg-emerald-50 border-l-4 border-l-[#2ea44f]' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Rank Position */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {rank === 1 ? (
                          <span className="w-6 h-6 rounded-md bg-amber-400 text-slate-950 inline-flex items-center justify-center font-black">1</span>
                        ) : rank === 2 ? (
                          <span className="w-6 h-6 rounded-md bg-slate-300 text-slate-950 inline-flex items-center justify-center font-black">2</span>
                        ) : rank === 3 ? (
                          <span className="w-6 h-6 rounded-md bg-amber-200 text-amber-950 inline-flex items-center justify-center font-black">3</span>
                        ) : (
                          <span className="text-slate-400 font-medium">#{rank}</span>
                        )}
                      </td>

                      {/* Pilot Identity */}
                      <td className="py-3.5 px-4 font-sans font-bold">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{entry.avatar}</span>
                          <span className="text-[#16426a] font-extrabold">{entry.username}</span>
                          {isUser && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rank Tier */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {entry.rankTier}
                        </span>
                      </td>

                      {/* Best Pace */}
                      <td className="py-3.5 px-4 text-right font-black text-sm text-[#2ea44f]">
                        {entry.bestWpm} <span className="font-normal text-[10px] text-slate-400">WPM</span>
                      </td>

                      {/* Average Pace */}
                      <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                        {entry.averageWpm}
                      </td>

                      {/* Victories */}
                      <td className="py-3.5 px-4 text-right text-slate-800">
                        <span className="font-extrabold text-amber-600">{entry.wins}</span>
                        <span className="text-slate-400"> / {entry.races}</span>
                      </td>

                      {/* Level */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-500">
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
