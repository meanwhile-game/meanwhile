import React, { useState } from 'react';
import { TRACKS } from '../../three/types.js';
import {
  Copy, Check, Crown, Play, CheckCircle2, Circle, ArrowLeft,
  Users, Share2
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext.js';

interface LobbyPlayer {
  id: string;
  socketId: string;
  username: string;
  avatar: string;
  vehicleId: string;
  vehicleColor: string;
  isReady: boolean;
  isHost: boolean;
  isAi: boolean;
}

interface PrivateLobbyProps {
  roomCode: string;
  trackId: string;
  hostId: string;
  localSocketId: string;
  players: Record<string, LobbyPlayer>;
  onStartRace: () => void;
  onToggleReady: (ready: boolean) => void;
  onChangeTrack: (trackId: string) => void;
  onLeaveRoom: () => void;
}

export const PrivateLobby: React.FC<PrivateLobbyProps> = ({
  roomCode,
  trackId,
  hostId,
  localSocketId,
  players,
  onStartRace,
  onToggleReady,
  onChangeTrack,
  onLeaveRoom
}) => {
  const { isLight } = useTheme();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const playerList = Object.values(players);
  const isHost = hostId === localSocketId;
  const localPlayer = players[localSocketId];
  const isLocalReady = localPlayer?.isReady || false;

  const currentTrack = TRACKS.find(t => t.id === trackId) || TRACKS[0];

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      const link = `${window.location.origin}?room=${roomCode}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const allPlayersReady = playerList.every(p => p.isReady || p.isHost);

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Leave Grid
        </button>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Private Lobby
          </span>
        </div>

        <span className="text-xs font-num" style={{ color: 'var(--text-muted)' }}>
          {playerList.length} / 6 Racers
        </span>
      </header>

      {/* Main Grid Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 flex flex-col gap-6">
        {/* Room Header Strip */}
        <div 
          className="p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span className="text-[11px] font-mono uppercase" style={{ color: 'var(--text-muted)' }}>
              PRIVATE ROOM CODE
            </span>
            <div className="text-3xl font-bold font-num tracking-wider mt-0.5" style={{ color: 'var(--accent)' }}>
              {roomCode}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied' : 'Copy Code'}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copied' : 'Share Link'}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Circuit Settings (5 Cols) */}
          <div 
            className="md:col-span-5 p-5 rounded-2xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <span className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
                Circuit Configuration
              </span>
              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {currentTrack.name}
              </h3>
              <p className="text-xs font-num mt-1" style={{ color: 'var(--text-muted)' }}>
                {currentTrack.location} • {currentTrack.lengthMeters} Meters
              </p>
              <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {currentTrack.description}
              </p>

              {isHost && (
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <label className="text-[11px] font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Host: Switch Circuit
                  </label>
                  <select
                    value={trackId}
                    onChange={(e) => onChangeTrack(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {TRACKS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.difficulty.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Racers Grid Roster (7 Cols) */}
          <div 
            className="md:col-span-7 p-5 rounded-2xl border flex flex-col justify-between"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3 font-medium">
                <span style={{ color: 'var(--text-secondary)' }}>Grid Roster ({playerList.length}/6)</span>
                <span className="font-num text-[11px]" style={{ color: 'var(--accent)' }}>
                  {allPlayersReady ? 'All Drivers Ready' : 'Awaiting confirmation...'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {playerList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{player.avatar}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            {player.username}
                          </span>
                          {player.isHost && (
                            <span 
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5"
                              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-text)' }}
                            >
                              <Crown className="w-2.5 h-2.5" /> HOST
                            </span>
                          )}
                          {player.id === localSocketId && (
                            <span className="text-[10px] font-num" style={{ color: 'var(--text-muted)' }}>
                              (You)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-num capitalize" style={{ color: 'var(--text-muted)' }}>
                          {player.vehicleId}
                        </span>
                      </div>
                    </div>

                    <div>
                      {player.isHost ? (
                        <span className="text-xs font-num flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Host Ready
                        </span>
                      ) : player.isReady ? (
                        <span className="text-xs font-num flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> READY
                        </span>
                      ) : (
                        <span className="text-xs font-num flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <Circle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch / Ready Action */}
            <div className="mt-6 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
              {isHost ? (
                <button
                  onClick={onStartRace}
                  disabled={!allPlayersReady}
                  className="v-btn-primary px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Launch Race
                </button>
              ) : (
                <button
                  onClick={() => onToggleReady(!isLocalReady)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
                    isLocalReady ? 'v-btn-secondary' : 'v-btn-primary'
                  }`}
                >
                  {isLocalReady ? 'Cancel Ready' : 'Ready Up'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-num" style={{ color: 'var(--text-muted)' }}>
        <span>PRIVATE SESSION</span>
        <span>SYNCHRONIZED AUTHORITATIVE CLOCK</span>
      </footer>
    </div>
  );
};
