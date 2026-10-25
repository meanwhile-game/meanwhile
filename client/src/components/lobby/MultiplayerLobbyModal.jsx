import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { multiplayer } from '../../services/multiplayer.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { Users, Copy, Check, Play, ArrowRight, X, Shield, Sparkles } from 'lucide-react';
import { getTrackById } from '../../data/tracks.js';
import { getRandomPassage } from '../../data/passages.js';

export const MultiplayerLobbyModal = () => {
  const { 
    multiplayerModalOpen, 
    setMultiplayerModalOpen, 
    profile, 
    selectedTrackId, 
    initRace 
  } = useGameStore();

  const [inLobby, setInLobby] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinInputCode, setJoinInputCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  // Subscribe to multiplayer service events
  useEffect(() => {
    if (!multiplayerModalOpen) return;

    const unsubs = [
      multiplayer.on('room_updated', (data) => {
        setRoomCode(data.roomCode);
        setIsHost(data.isHost);
        setPlayers(data.players || []);
        setInLobby(true);
      }),
      multiplayer.on('players_changed', (updatedPlayers) => {
        setPlayers(updatedPlayers);
      }),
      multiplayer.on('start_countdown', (raceConfig) => {
        // Synchronized race start received from host!
        soundEngine.playCountdownBeep(true);
        setMultiplayerModalOpen(false);
        initRace(raceConfig.passage);
      })
    ];

    return () => {
      unsubs.forEach(un => un());
    };
  }, [multiplayerModalOpen, initRace, setMultiplayerModalOpen]);

  if (!multiplayerModalOpen) return null;

  const handleCreateRoom = async () => {
    soundEngine.playButtonClick();
    const track = getTrackById(selectedTrackId);
    const hostPlayer = {
      id: profile?.id || 'host_' + Math.random().toString(36).substring(2, 7),
      name: profile?.username || 'Host',
      avatar: profile?.avatar || '🏎️'
    };
    await multiplayer.createRoom(hostPlayer, track.id, track.laps);
  };

  const handleJoinRoom = async () => {
    if (!joinInputCode.trim()) return;
    soundEngine.playButtonClick();
    const guestPlayer = {
      id: profile?.id || 'player_' + Math.random().toString(36).substring(2, 7),
      name: profile?.username || 'Challenger',
      avatar: profile?.avatar || '⚡'
    };
    await multiplayer.joinRoom(joinInputCode, guestPlayer);
  };

  const handleToggleReady = () => {
    soundEngine.playButtonClick();
    const nextReady = !isReady;
    setIsReady(nextReady);
    multiplayer.setReady(nextReady);
  };

  const handleHostStart = () => {
    soundEngine.playButtonClick();
    const track = getTrackById(selectedTrackId);
    const passage = getRandomPassage();
    multiplayer.startRace(track.id, passage);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    multiplayer.leaveRoom();
    setInLobby(false);
    setMultiplayerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0c1222] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f8fafc]">
                {inLobby ? 'Multiplayer Grid Lobby' : 'Private Race Room'}
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Synchronized real-time multiplayer racing.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content View: In-Lobby or Create/Join */}
        {!inLobby ? (
          <div className="space-y-6">
            {/* Create Room Option */}
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#f8fafc]">Host a Custom Room</h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Generate a room code and invite your friends.
                </p>
              </div>
              <button
                onClick={handleCreateRoom}
                className="px-5 py-2.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
              >
                Create Room
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-white/[0.06]" />
              <span className="absolute px-3 bg-[#0c1222] text-[10px] uppercase font-bold text-[#64748b]">
                Or Join Room
              </span>
            </div>

            {/* Join Room Input */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-[#94a3b8] block">
                Enter 6-Digit Room Code
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. MW-4921"
                  value={joinInputCode}
                  onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-base font-mono uppercase tracking-widest text-[#f8fafc] focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-6 py-3 rounded-xl bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Lobby Room View */
          <div className="space-y-6">
            {/* Room Code Badge */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#64748b] block">
                  Room Invite Code
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-400">
                  {roomCode}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-[#f8fafc] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Player Grid List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] block">
                Drivers in Room ({players.length} / 8)
              </span>

              <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto">
                {players.map((p, idx) => (
                  <div key={p.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                        {p.avatar || '🏎️'}
                      </span>
                      <span className="font-semibold text-[#f8fafc]">
                        {p.name || p.username}
                      </span>
                      {p.isHost && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                          HOST
                        </span>
                      )}
                    </div>

                    <span className={`font-semibold ${p.isReady ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {p.isReady ? 'READY ✓' : 'WAITING'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ready & Start Action Controls */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4">
              {!isHost && (
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isReady
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-white/10 text-[#f8fafc] hover:bg-white/20'
                  }`}
                >
                  {isReady ? 'Ready for Race ✓' : 'Press When Ready'}
                </button>
              )}

              {isHost && (
                <button
                  onClick={handleHostStart}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Synchronized Race</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
