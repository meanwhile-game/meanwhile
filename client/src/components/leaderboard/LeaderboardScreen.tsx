import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, fetchLeaderboard } from '../../services/api.js';
import { ArrowLeft, Search, Trophy } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

interface LeaderboardScreenProps {
  currentUserId: string;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ currentUserId, onBack }) => {
  const { isLight } = useTheme();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeaderboard()
      .then(data => setEntries(data))
      .catch(console.warn);
  }, []);

  const filteredEntries = entries.filter(e =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Grid
        </button>

        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Global Standings
          </span>
        </div>

        <span className="text-xs font-num" style={{ color: 'var(--text-muted)' }}>
          Authoritative Ranked Data
        </span>
      </header>

      {/* Main Table Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Driver Leaderboard
            </h2>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              Top 25 global pilots ranked by server-verified words-per-minute and race win records.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search call-sign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Minimal Table */}
        <div 
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr 
                  className="border-b text-[11px] font-medium"
                  style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                >
                  <th className="py-3 px-4 w-14 text-center">#</th>
                  <th className="py-3 px-4">Pilot</th>
                  <th className="py-3 px-4">Rank Tier</th>
                  <th className="py-3 px-4 text-right">Best Pace</th>
                  <th className="py-3 px-4 text-right">Average</th>
                  <th className="py-3 px-4 text-right">Victories</th>
                  <th className="py-3 px-4 text-right">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-num" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredEntries.map((entry, idx) => {
                  const isUser = entry.id === currentUserId;
                  const rank = entry.rank || idx + 1;

                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={isUser ? { backgroundColor: 'var(--accent-subtle)' } : {}}
                    >
                      <td className="py-3 px-4 text-center font-medium">
                        <span 
                          className={`inline-block w-5 h-5 rounded-full text-center leading-5 text-[11px] ${
                            rank === 1 ? 'font-bold' : ''
                          }`}
                          style={
                            rank === 1 
                              ? { backgroundColor: 'var(--accent)', color: '#050608' } 
                              : { color: 'var(--text-muted)' }
                          }
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-sans font-medium">
                        <div className="flex items-center gap-2">
                          <span>{entry.avatar}</span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {entry.username}
                          </span>
                          {isUser && (
                            <span 
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded"
                              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                        >
                          {entry.rankTier}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-semibold" style={{ color: 'var(--accent)' }}>
                        {entry.bestWpm} <span className="font-normal text-[11px]" style={{ color: 'var(--text-muted)' }}>WPM</span>
                      </td>

                      <td className="py-3 px-4 text-right" style={{ color: 'var(--text-secondary)' }}>
                        {entry.averageWpm}
                      </td>

                      <td className="py-3 px-4 text-right" style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold">{entry.wins}</span>
                        <span style={{ color: 'var(--text-muted)' }}>/{entry.races}</span>
                      </td>

                      <td className="py-3 px-4 text-right" style={{ color: 'var(--text-muted)' }}>
                        Lvl {entry.level}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-num" style={{ color: 'var(--text-muted)' }}>
        <span>MEANWHILE ESPORTS FEDERATION</span>
        <span>VERIFIED SERVER TELEMETRY</span>
      </footer>
    </div>
  );
};
