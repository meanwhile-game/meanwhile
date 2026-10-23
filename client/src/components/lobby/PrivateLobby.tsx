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
      className="relative min-h-screen w-full flex flex-col justify-between bg-[#194269] text-slate-100 select-none overflow-x-hidden font-sans"
    >
      {/* 1. Top Navbar Matching Home Page */}
      <nav className="w-full bg-[#10304f] border-b border-[#1b4b7a] px-4 sm:px-8 py-2.5 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              onLeaveRoom();
            }}
            className="px-3.5 py-1.5 rounded-lg border border-[#1b4b7a] bg-[#0b2239] hover:bg-[#153a5e] text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer shadow transition-all hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            Leave Room
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onLeaveRoom()}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-base shadow">
              <Users className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-xl font-black tracking-tight text-white lowercase">
              meanwhile <span className="text-xs uppercase font-bold text-cyan-300 font-mono tracking-wider ml-1">Private Race</span>
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-300 bg-[#0b2239] px-3 py-1.5 rounded-lg border border-[#1b4b7a]">
          {playerList.length} / 6 RACERS
        </span>
      </nav>

      {/* 2. Main Grid Content */}
      <main className="w-full max-w-5xl mx-auto my-auto px-4 py-6 md:py-8 flex flex-col gap-6 z-10">
        
        {/* Room Header Banner Strip - Crisp White Card */}
        <div 
          className="p-6 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              PRIVATE ROOM CODE (SHARE TO INVITE FRIENDS)
            </span>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-[#16426a] mt-1 flex items-center gap-3">
              {roomCode}
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Anyone can enter this code in the Track ID box on the Meanwhile home screen to join your race.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-mono font-bold text-slate-900 flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#16426a]" />}
              {copiedCode ? 'COPIED!' : 'COPY CODE'}
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-mono font-bold text-slate-900 flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#16426a]" />}
              {copiedLink ? 'LINK COPIED!' : 'SHARE LINK'}
            </button>
          </div>
        </div>

        {/* 2-Column Command Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Circuit Details (5 Cols) - Crisp White Card */}
          <div 
            className="md:col-span-5 p-6 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase mb-2">
                <span className="font-bold">CIRCUIT VENUE</span>
                <span className="text-amber-600 font-bold">{currentTrack.difficulty}</span>
              </div>

              <h3 className="text-2xl font-black text-[#16426a] tracking-tight">
                {currentTrack.name}
              </h3>

              <div className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentTrack.location}</span>
                <span>•</span>
                <span>{currentTrack.lengthMeters}m</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed font-medium">
                {currentTrack.description}
              </p>

              {isHost && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] font-mono uppercase text-[#16426a] font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Host: Select Track
                    </label>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">{TRACKS.length} Tracks</span>
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
                              ? 'border-[#2ea44f] bg-emerald-50 text-[#16426a] ring-2 ring-emerald-500/20 font-bold shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-bold truncate text-[11px] text-slate-900 flex items-center justify-between">
                            <span className="truncate">{t.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-[#2ea44f] shrink-0 ml-1" />}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between mt-1">
                            <span className="truncate">{t.location.split(',')[0]}</span>
                            <span className="uppercase font-bold text-[9px] text-[#16426a]">
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

            <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
              LANES SYNCHRONIZED • AUTHORITATIVE PHYSICS
            </div>
          </div>

          {/* Racers Grid Roster (7 Cols) - Crisp White Card */}
          <div 
            className="md:col-span-7 p-6 rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="text-slate-600 uppercase font-bold">
                  Grid Formation ({playerList.length}/6 Racers)
                </span>
                <span className={`text-[11px] font-bold ${allPlayersReady ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {allPlayersReady ? '● ALL DRIVERS READY' : '○ AWAITING READY CONFIRMATION'}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {playerList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-200"
                        style={{ backgroundColor: `${player.vehicleColor || '#2ea44f'}15` }}
                      >
                        {player.avatar}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#16426a]">
                            {player.username}
                          </span>
                          {player.isHost && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300 flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5 text-amber-600" /> HOST
                            </span>
                          )}
                          {player.id === localSocketId && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 capitalize">
                          {player.vehicleId} • Livery {player.vehicleColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {player.isHost ? (
                        <span className="text-[11px] font-mono font-bold text-amber-600 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5" /> GRID HOST
                        </span>
                      ) : player.isReady ? (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> READY
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1">
                          <Circle className="w-3.5 h-3.5" /> STANDBY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              {!isHost && (
                <button
                  onClick={handleReadyClick}
                  className={`flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow ${
                    isLocalReady
                      ? 'bg-slate-100 border border-slate-300 text-slate-800'
                      : 'bg-[#2ea44f] hover:bg-[#2c974b] text-white shadow-emerald-900/20'
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
                      className="w-full sm:w-auto px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm whitespace-nowrap"
                    >
                      <Bot className="w-4 h-4 text-amber-600" />
                      Add AI Bots
                    </button>
                  )}
                  <button
                    onClick={handleStartClick}
                    disabled={!allPlayersReady}
                    className={`flex-1 w-full py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-lg ${
                      allPlayersReady
                        ? 'bg-[#2ea44f] hover:bg-[#2c974b] text-white shadow-emerald-900/20 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {allPlayersReady ? 'START RACE NOW' : 'WAITING FOR ALL RACERS TO READY'}
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
