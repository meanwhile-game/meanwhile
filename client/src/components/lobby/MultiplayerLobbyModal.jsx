import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { multiplayer } from '../../services/multiplayer.js';
import { soundEngine } from '../../sound/soundEngine.js';
import { 
  Users, 
  Copy, 
  Check, 
  Play, 
  ArrowRight, 
  X, 
  Link2, 
  Globe, 
  Lock, 
  AlertCircle, 
  Compass, 
  Sparkles 
} from 'lucide-react';
import { TRACKS, getTrackById } from '../../data/tracks.js';
import { getRandomPassage } from '../../data/passages.js';

export const MultiplayerLobbyModal = () => {
  const { 
    multiplayerModalOpen, 
    setMultiplayerModalOpen, 
    profile, 
    selectedTrackId, 
    setSelectedTrackId,
    initRace 
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('private'); // 'private' | 'public'
  const [inLobby, setInLobby] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinInputCode, setJoinInputCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lobbyTrackId, setLobbyTrackId] = useState(selectedTrackId || 'coastal-run');

  const activeTracks = TRACKS.filter(t => !t.isLocked);

  // Check URL query param for deep link on open
  useEffect(() => {
    if (!multiplayerModalOpen) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && !inLobby) {
        setJoinInputCode(roomParam.toUpperCase());
      }
    } catch (e) {}
  }, [multiplayerModalOpen, inLobby]);

  // Subscribe to multiplayer service events
  useEffect(() => {
    if (!multiplayerModalOpen) return;

    const unsubs = [
      multiplayer.on('room_updated', (data) => {
        setRoomCode(data.roomCode);
        setIsHost(data.isHost);
        setPlayers(data.players || []);
        if (data.trackId) setLobbyTrackId(data.trackId);
        setInLobby(true);
        setIsSearching(false);
        setErrorMsg('');
      }),
      multiplayer.on('players_changed', (updatedPlayers) => {
        setPlayers(updatedPlayers);
      }),
      multiplayer.on('track_changed', (data) => {
        if (data.trackId) {
          setLobbyTrackId(data.trackId);
          setSelectedTrackId(data.trackId);
        }
      }),
      multiplayer.on('start_countdown', (raceConfig) => {
        // Synchronized race start received from host!
        soundEngine.playCountdownBeep(true);
        setMultiplayerModalOpen(false);
        if (raceConfig?.trackId) {
          setSelectedTrackId(raceConfig.trackId);
        }
        const currentPlayers = Array.from(multiplayer.players.values());
        initRace(raceConfig.passage, currentPlayers);
      })
    ];

    return () => {
      unsubs.forEach(un => un());
    };
  }, [multiplayerModalOpen, initRace, setMultiplayerModalOpen, setSelectedTrackId]);

  if (!multiplayerModalOpen) return null;

  const handleCreateRoom = async () => {
    soundEngine.playButtonClick();
    setErrorMsg('');
    try {
      const track = getTrackById(lobbyTrackId);
      const hostPlayer = {
        id: profile?.id || 'host_' + Math.random().toString(36).substring(2, 7),
        name: profile?.username || 'Host',
        username: profile?.username || 'Host',
        avatar: profile?.avatar || '🏎️'
      };
      await multiplayer.createRoom(hostPlayer, track.id, track.laps, false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinInputCode.trim()) {
      setErrorMsg('Please enter a room code.');
      return;
    }
    soundEngine.playButtonClick();
    setErrorMsg('');
    try {
      const guestPlayer = {
        id: profile?.id || 'player_' + Math.random().toString(36).substring(2, 7),
        name: profile?.username || 'Challenger',
        username: profile?.username || 'Challenger',
        avatar: profile?.avatar || '⚡'
      };
      await multiplayer.joinRoom(joinInputCode, guestPlayer);
    } catch (err) {
      setErrorMsg(err.message || 'Could not join room. Please check the code.');
    }
  };

  const handlePublicMatchmaking = async () => {
    soundEngine.playButtonClick();
    setErrorMsg('');
    setIsSearching(true);
    try {
      const player = {
        id: profile?.id || 'player_' + Math.random().toString(36).substring(2, 7),
        name: profile?.username || 'Racer',
        username: profile?.username || 'Racer',
        avatar: profile?.avatar || '🏁'
      };
      await multiplayer.joinPublicMatch(player, lobbyTrackId);
    } catch (err) {
      setIsSearching(false);
      setErrorMsg(err.message || 'Matchmaking timed out. Please try again.');
    }
  };

  const handleTrackChangeByHost = (trackId) => {
    if (!isHost) return;
    soundEngine.playButtonClick();
    setLobbyTrackId(trackId);
    setSelectedTrackId(trackId);
    const track = getTrackById(trackId);
    multiplayer.setTrack(trackId, track.laps);
  };

  const handleToggleReady = () => {
    soundEngine.playButtonClick();
    const nextReady = !isReady;
    setIsReady(nextReady);
    multiplayer.setReady(nextReady);
  };

  const handleHostStart = () => {
    soundEngine.playButtonClick();
    const track = getTrackById(lobbyTrackId);
    const passage = getRandomPassage();
    multiplayer.startRace(track.id, passage);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const inviteUrl = `${origin}${path}?room=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClose = () => {
    multiplayer.leaveRoom();
    setInLobby(false);
    setIsSearching(false);
    setMultiplayerModalOpen(false);
  };

  const currentTrack = getTrackById(lobbyTrackId);

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
                {inLobby ? 'Multiplayer Starting Grid' : 'Multiplayer & Private Rooms'}
              </h2>
              <p className="text-xs text-[#94a3b8]">
                {inLobby ? 'Live synchronized racing lobby' : 'Host a private race or join matchmaking'}
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

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content View: In-Lobby vs Room Selection */}
        {!inLobby ? (
          <div className="space-y-6">
            {/* Top Navigation: Private Room vs Public Matchmaking */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-black/40 border border-white/[0.06]">
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('private');
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'private'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Private Room by Code</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setActiveTab('public');
                }}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'public'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-[#94a3b8] hover:text-[#f8fafc]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Join Public Match</span>
              </button>
            </div>

            {activeTab === 'private' && (
              <div className="space-y-5">
                {/* 1. Host Private Room */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#f8fafc]">Create Private Race</h3>
                      <p className="text-xs text-[#94a3b8] mt-0.5">
                        Get a unique shareable code and invite friends.
                      </p>
                    </div>

                    <button
                      onClick={handleCreateRoom}
                      className="px-5 py-2.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
                    >
                      Create Room
                    </button>
                  </div>

                  {/* Circuit Pre-selector */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-2">
                      Selected Circuit
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeTracks.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLobbyTrackId(t.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                            lobbyTrackId === t.id
                              ? 'bg-amber-400/10 border-amber-400 text-[#f8fafc]'
                              : 'bg-black/30 border-white/[0.06] text-[#94a3b8] hover:text-white'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-xs font-semibold truncate">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <span className="w-full border-t border-white/[0.06]" />
                  <span className="absolute px-3 bg-[#0c1222] text-[10px] uppercase font-bold text-[#64748b]">
                    Or Enter Code
                  </span>
                </div>

                {/* 2. Join via Code */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-[#94a3b8] block">
                    Enter Room Code
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="e.g. MW-7E92"
                      value={joinInputCode}
                      onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-base font-mono uppercase tracking-widest text-[#f8fafc] focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="px-6 py-3 rounded-xl bg-[#f8fafc] hover:bg-white text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'public' && (
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">Online Public Matchmaking</h3>
                  <p className="text-xs text-[#94a3b8] mt-1 max-w-sm mx-auto">
                    Search for an active online grid or automatically open an open public room for others to join.
                  </p>
                </div>

                <button
                  onClick={handlePublicMatchmaking}
                  disabled={isSearching}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSearching ? 'Searching for Racers...' : 'Search for Public Race'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Live Synchronized Grid Lobby View */
          <div className="space-y-6">
            {/* Room Code & Share Card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748b] block tracking-wider">
                  Room Invite Code
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-amber-400">
                  {roomCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f8fafc] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Code'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#f8fafc] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied' : 'Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* Selected Circuit Stage */}
            <div className="p-4 rounded-xl bg-[#090d18] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={currentTrack.mainImage} alt={currentTrack.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
                    {currentTrack.circuitNumber} · {currentTrack.difficulty}
                  </span>
                  <span className="text-sm font-bold text-[#f8fafc]">
                    {currentTrack.name}
                  </span>
                </div>
              </div>

              {isHost && (
                <div className="flex items-center gap-1.5">
                  {activeTracks.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTrackChangeByHost(t.id)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        lobbyTrackId === t.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/10 text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {t.circuitNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drivers Grid List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#94a3b8] font-bold uppercase tracking-wider">
                <span>Drivers on Grid ({players.length} / 8)</span>
                <span className="text-[11px] text-emerald-400">Live Synced</span>
              </div>

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
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isReady
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md'
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
