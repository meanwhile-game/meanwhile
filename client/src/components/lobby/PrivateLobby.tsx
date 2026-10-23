import React, { useState } from 'react';
import { TRACKS } from '../../three/types.js';
import {
  Copy, Check, Crown, Play, CheckCircle2, Circle, ArrowLeft,
  Users, Share2, Sparkles, MapPin, Compass, Bot, Zap
} from 'lucide-react';
import { sound } from '../../sound/soundEngine.js';
import { socketService } from '../../services/socket.js';
import { AdBanner } from '../common/AdBanner.js';
import heroBg from '../../assets/hero-bg.jpg';
import swissTrackImg from '../../assets/swiss-track.jpg';

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
  onFillBots?: () => void;
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
  onLeaveRoom,
  onFillBots,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const playerList = Object.values(players);
  const isHost = hostId === localSocketId;
  const localPlayer = players[localSocketId];
  const isLocalReady = localPlayer?.isReady || false;

  const currentTrack = TRACKS.find(t => t.id === trackId) || TRACKS[0];

  const handleCopyCode = () => {
    sound.playKeystroke(60, true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    sound.playKeystroke(60, true);
    if (navigator.clipboard) {
      const link = `${window.location.origin}?room=${roomCode}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReadyClick = () => {
    sound.playCountdownTick(1);
    onToggleReady(!isLocalReady);
  };

  const handleStartClick = () => {
    sound.playCountdownTick(2);
    onStartRace();
  };

  const allPlayersReady = playerList.every(p => p.isReady || p.isHost);

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between p-6 md:p-12 transition-colors duration-200 select-none bg-slate-950 text-white bg-cyber-grid"
    >
      {/* 1. Top Navbar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <button
          onClick={() => {
            sound.playKeystroke(50, true);
            onLeaveRoom();
          }}
          className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md transition-all hover:border-slate-500"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Leave Grid
        </button>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-extrabold text-sm tracking-tight text-white">
            PRIVATE MULTIPLAYER GRID
          </span>
        </div>

        <span className="text-xs font-mono text-slate-400">
          {playerList.length} / 6 PILOTS
        </span>
      </header>

      {/* 2. Main Grid Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8 flex flex-col gap-6 z-10">
        
        {/* Room Header Banner Strip */}
        <div 
          className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              PRIVATE TRACK ID (SHARE TO JOIN)
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-cyan-400 mt-1 flex items-center gap-3">
              {roomCode}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Anyone can enter this Track ID on the home screen or lobby to join this private circuit.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs font-mono font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-md hover:border-cyan-400"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              {copiedCode ? 'COPIED!' : 'COPY CODE'}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs font-mono font-bold text-white flex items-center gap-2 cursor-pointer transition-all shadow-md hover:border-cyan-400"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
              {copiedLink ? 'LINK COPIED!' : 'INVITE LINK'}
            </button>
          </div>
        </div>

        {/* 2-Column Command Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Circuit Details (5 Cols) */}
          <div 
            className="md:col-span-5 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase mb-2">
                <span>VENUE PROFILE</span>
                <span className="text-amber-400 font-bold">{currentTrack.difficulty}</span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">
                {currentTrack.name}
              </h3>

              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentTrack.location}</span>
                <span>•</span>
                <span>{currentTrack.lengthMeters}m Course</span>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {currentTrack.description}
              </p>

              {isHost && (
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] font-mono uppercase text-slate-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Host Control: Select Circuit
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{TRACKS.length} Tracks</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {TRACKS.map(t => {
                      const isSelected = t.id === trackId;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            sound.playKeystroke(60, true);
                            onChangeTrack(t.id);
                          }}
                          className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/60 text-white ring-1 ring-cyan-400/50 shadow-md'
                              : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="font-bold truncate text-[11px] text-white flex items-center justify-between">
                            <span className="truncate">{t.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-1 shadow-[0_0_6px_#38bdf8]" />}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between mt-1">
                            <span className="truncate">{t.location}</span>
                            <span className={`uppercase font-bold text-[9px] ${
                              t.difficulty === 'hard' ? 'text-rose-400' : t.difficulty === 'medium' ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                              {t.difficulty}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500">
              LANES SYNCHRONIZED • AUTHORITATIVE PHYSICS
            </div>
          </div>

          {/* Racers Grid Roster (7 Cols) */}
          <div 
            className="md:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="text-slate-400 uppercase font-bold">
                  Grid Formation ({playerList.length}/6 Racers)
                </span>
                <span className={`text-[11px] font-bold ${allPlayersReady ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                  {allPlayersReady ? '● ALL DRIVERS READY' : '○ AWAITING READY CONFIRMATION'}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {playerList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md"
                        style={{ backgroundColor: `${player.vehicleColor || '#00ff87'}25`, border: `1px solid ${player.vehicleColor || '#00ff87'}50` }}
                      >
                        {player.avatar}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {player.username}
                          </span>
                          {player.isHost && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> HOST
                            </span>
                          )}
                          {player.id === localSocketId && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 capitalize">
                          {player.vehicleId} • Livery {player.vehicleColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.isHost ? (
                        <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> GRID HOST
                        </span>
                      ) : player.isReady ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> READY
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                          <Circle className="w-3.5 h-3.5" /> STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3">
              {!isHost && (
                <button
                  onClick={handleReadyClick}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isLocalReady
                      ? 'bg-slate-900 border border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(0,255,135,0.25)]'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-[0_0_25px_rgba(0,255,135,0.4)]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {isLocalReady ? 'Ready for Race' : 'Toggle Ready'}
                </button>
              )}

              {isHost && (
                <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                  {playerList.length < 6 && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (onFillBots) onFillBots();
                        else socketService.fillRoomWithBots();
                      }}
                      className="w-full sm:w-auto px-4 py-4 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      <Bot className="w-4 h-4 text-amber-400" />
                      Fill Vacant with AI Bots
                    </button>
                  )}
                  <button
                    onClick={handleStartClick}
                    disabled={!allPlayersReady}
                    className={`flex-1 w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                      allPlayersReady
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-[0_0_35px_rgba(0,255,135,0.5)] transform hover:-translate-y-0.5'
                        : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {allPlayersReady ? 'LAUNCH GRAND PRIX NOW' : 'WAITING FOR ALL RACERS TO READY'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* SPONSORED BANNER (Private Lobby Grid Waiting Slot) */}
      <AdBanner
        slotId="ad-private-lobby-leaderboard"
        format="leaderboard"
        className="max-w-4xl mx-auto my-3 z-10"
      />

      {/* 3. Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800/80 pt-4 z-10">
        <span>MEANWHILE PRIVATE MATCH TERMINAL</span>
        <span>PEER SYNCED DISPATCH</span>
      </footer>
    </div>
  );
};
