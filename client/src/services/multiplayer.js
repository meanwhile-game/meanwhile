import { supabase } from './supabase.js';

class MultiplayerService {
  constructor() {
    this.currentChannel = null;
    this.broadcastChannel = null;
    this.roomCode = null;
    this.listeners = new Map();
    this.isHost = false;
    this.localPlayer = null;
    this.players = new Map();
    this.clientInstanceId = 'cl_' + Math.random().toString(36).substring(2, 9);
    this.currentTrackId = 'coastal-run';
    this.currentLaps = 2;

    // Native Cross-Tab BroadcastChannel as zero-latency local/peer transport
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.broadcastChannel = new BroadcastChannel('meanwhile_multiplayer_bus');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      } catch (e) {
        console.warn('Native BroadcastChannel not available:', e);
      }
    }
  }

  // Generate unique shareable room code with sufficient randomness (e.g. MW-7E92)
  generateRoomCode(prefix = 'MW') {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  }

  // Subscribe to internal events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const list = this.listeners.get(event) || [];
      this.listeners.set(event, list.filter(cb => cb !== callback));
    };
  }

  emit(event, data) {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  // Create private room
  async createRoom(hostPlayer, trackId = 'coastal-run', laps = 2, isPublic = false) {
    this.leaveRoom();
    const prefix = isPublic ? 'PUB' : 'MW';
    const code = this.generateRoomCode(prefix);
    this.roomCode = code;
    this.isHost = true;
    this.currentTrackId = trackId;
    this.currentLaps = laps;
    const sessionPlayerId = `${hostPlayer.id || 'host'}_${this.clientInstanceId.slice(-4)}`;
    this.localPlayer = { ...hostPlayer, id: sessionPlayerId, baseUserId: hostPlayer.id, isHost: true, isReady: true };
    this.players.clear();
    this.players.set(sessionPlayerId, this.localPlayer);

    // Persist room in Supabase if configured
    if (supabase) {
      try {
        await supabase.from('rooms').insert({
          code,
          host_id: hostPlayer.id,
          host_name: hostPlayer.name || hostPlayer.username || 'Host',
          track_id: trackId,
          laps,
          status: 'waiting',
          max_players: 8
        });
      } catch (e) {
        console.warn('Supabase room creation fallback to local bus:', e);
      }
    }

    await this.connectChannel(code);

    this.broadcastEvent({
      type: 'ROOM_CREATED',
      roomCode: code,
      host: this.localPlayer,
      trackId,
      laps
    });

    this.emit('room_updated', {
      roomCode: code,
      isHost: true,
      trackId,
      laps,
      players: Array.from(this.players.values())
    });

    return { roomCode: code, isHost: true };
  }

  // Join room by code
  async joinRoom(code, player) {
    this.leaveRoom();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode.match(/^(MW|PUB)-[A-Z0-9]{3,6}$/i)) {
      throw new Error('Invalid room code format. Please check your code (e.g. MW-7E92).');
    }

    // Verify room status with Supabase if connected
    if (supabase) {
      try {
        const { data: roomData, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', cleanCode)
          .single();

        if (roomData) {
          if (roomData.status === 'racing') {
            throw new Error('This race has already started. Please join another room.');
          }
          if (roomData.status === 'finished') {
            throw new Error('This room has expired. Please create a new room.');
          }
          this.currentTrackId = roomData.track_id;
          this.currentLaps = roomData.laps;
        }
      } catch (err) {
        if (err.message && err.message.includes('race has already started')) {
          throw err;
        }
      }
    }

    this.roomCode = cleanCode;
    this.isHost = false;
    const sessionPlayerId = `${player.id || 'challenger'}_${this.clientInstanceId.slice(-4)}`;
    this.localPlayer = { ...player, id: sessionPlayerId, baseUserId: player.id, isHost: false, isReady: false };
    this.players.clear();
    this.players.set(sessionPlayerId, this.localPlayer);

    await this.connectChannel(cleanCode);

    // Announce join to host and peers
    this.broadcastEvent({
      type: 'PLAYER_JOINED',
      roomCode: cleanCode,
      player: this.localPlayer
    });

    this.emit('room_updated', {
      roomCode: cleanCode,
      isHost: false,
      trackId: this.currentTrackId,
      laps: this.currentLaps,
      players: Array.from(this.players.values())
    });

    return { roomCode: cleanCode, isHost: false };
  }

  // Public Matchmaking: Find open public room or create a new public grid
  async joinPublicMatch(player, trackId = 'coastal-run') {
    if (supabase) {
      try {
        const { data: openRooms } = await supabase
          .from('rooms')
          .select('*')
          .eq('status', 'waiting')
          .like('code', 'PUB-%')
          .order('created_at', { ascending: false })
          .limit(1);

        if (openRooms && openRooms.length > 0) {
          return await this.joinRoom(openRooms[0].code, player);
        }
      } catch (e) {
        console.warn('Public matchmaking query fallback:', e);
      }
    }

    // If no open room found, create a new public room
    return await this.createRoom(player, trackId, 2, true);
  }

  async connectChannel(code) {
    if (supabase) {
      try {
        this.currentChannel = supabase.channel(`meanwhile_room_${code}`, {
          config: { presence: { key: this.localPlayer?.id } }
        });

        this.currentChannel
          .on('broadcast', { event: 'game' }, ({ payload }) => {
            this.handleIncomingMessage(payload);
          })
          .on('presence', { event: 'sync' }, () => {
            const state = this.currentChannel.presenceState();
            this.handlePresenceSync(state);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED' && this.localPlayer) {
              await this.currentChannel.track(this.localPlayer);
            }
          });
      } catch (err) {
        console.warn('Supabase Realtime fallback to native transport:', err);
      }
    }
  }

  handlePresenceSync(state) {
    const active = [];
    Object.values(state).forEach(presences => {
      presences.forEach(p => {
        if (p && p.id) {
          this.players.set(p.id, p);
          active.push(p);
        }
      });
    });
    this.emit('players_changed', Array.from(this.players.values()));
  }

  handleIncomingMessage(msg) {
    if (!msg || msg.roomCode !== this.roomCode) return;
    if (msg.clientInstanceId && msg.clientInstanceId === this.clientInstanceId) return; // Prevent loopback to the same tab
    if (msg.senderId && msg.senderId === this.localPlayer?.id) return; // Prevent echo

    switch (msg.type) {
      case 'PLAYER_JOINED':
        if (msg.player) {
          this.players.set(msg.player.id, msg.player);
          this.emit('player_joined', msg.player);
          this.emit('players_changed', Array.from(this.players.values()));

          // If we are host, send current room state back to newly connected player
          if (this.isHost) {
            this.broadcastEvent({
              type: 'ROOM_SYNC',
              roomCode: this.roomCode,
              trackId: this.currentTrackId,
              laps: this.currentLaps,
              players: Array.from(this.players.values())
            });
          }
        }
        break;

      case 'ROOM_SYNC':
        if (Array.isArray(msg.players)) {
          msg.players.forEach(p => this.players.set(p.id, p));
          if (this.localPlayer) {
            this.players.set(this.localPlayer.id, this.localPlayer);
          }
          if (msg.trackId) this.currentTrackId = msg.trackId;
          if (msg.laps) this.currentLaps = msg.laps;
          this.emit('players_changed', Array.from(this.players.values()));
          this.emit('track_changed', { trackId: this.currentTrackId, laps: this.currentLaps });
        }
        break;

      case 'TRACK_CHANGED':
        this.currentTrackId = msg.trackId;
        this.currentLaps = msg.laps;
        this.emit('track_changed', { trackId: msg.trackId, laps: msg.laps });
        break;

      case 'PLAYER_READY':
        if (this.players.has(msg.playerId)) {
          const p = this.players.get(msg.playerId);
          p.isReady = msg.isReady;
          this.emit('players_changed', Array.from(this.players.values()));
        }
        break;

      case 'START_COUNTDOWN':
        this.emit('start_countdown', {
          trackId: msg.trackId,
          passage: msg.passage,
          startTime: msg.startTime
        });
        break;

      case 'PROGRESS_UPDATE':
        this.emit('remote_progress', {
          racerId: msg.playerId,
          progress: msg.progress,
          wpm: msg.wpm,
          speed: msg.speed,
          lane: msg.lane
        });
        break;

      case 'PLAYER_FINISHED':
        this.emit('remote_finished', {
          playerId: msg.playerId,
          finalWpm: msg.finalWpm,
          finishTime: msg.finishTime
        });
        break;

      case 'PLAYER_LEFT':
        if (msg.playerId) {
          this.players.delete(msg.playerId);
          this.emit('player_left', msg.playerId);
          this.emit('players_changed', Array.from(this.players.values()));
        }
        break;
    }
  }

  broadcastEvent(payload) {
    const fullPayload = {
      ...payload,
      clientInstanceId: this.clientInstanceId,
      senderId: this.localPlayer?.id,
      timestamp: Date.now()
    };

    // 1. Local cross-tab BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(fullPayload);
      } catch (e) {}
    }

    // 2. Supabase Realtime broadcast channel
    if (this.currentChannel) {
      try {
        this.currentChannel.send({
          type: 'broadcast',
          event: 'game',
          payload: fullPayload
        });
      } catch (e) {}
    }
  }

  // Host changes the track
  setTrack(trackId, laps = 2) {
    if (!this.isHost) return;
    this.currentTrackId = trackId;
    this.currentLaps = laps;

    if (supabase && this.roomCode) {
      try {
        supabase.from('rooms').update({ track_id: trackId, laps }).eq('code', this.roomCode);
      } catch (e) {}
    }

    this.broadcastEvent({
      type: 'TRACK_CHANGED',
      roomCode: this.roomCode,
      trackId,
      laps
    });

    this.emit('track_changed', { trackId, laps });
  }

  // Toggle ready status
  setReady(isReady) {
    if (!this.localPlayer) return;
    this.localPlayer.isReady = isReady;
    this.broadcastEvent({
      type: 'PLAYER_READY',
      roomCode: this.roomCode,
      playerId: this.localPlayer.id,
      isReady
    });
    this.emit('players_changed', Array.from(this.players.values()));
  }

  // Host starts the race with synchronized countdown
  startRace(trackId, passage) {
    if (!this.isHost) return;
    const startTime = Date.now() + 3500; // Exact 3.5s countdown

    // Update room status in Supabase if configured
    if (supabase && this.roomCode) {
      try {
        supabase.from('rooms').update({ status: 'racing' }).eq('code', this.roomCode);
      } catch (e) {}
    }

    this.broadcastEvent({
      type: 'START_COUNTDOWN',
      roomCode: this.roomCode,
      trackId: trackId || this.currentTrackId,
      passage,
      startTime
    });

    this.emit('start_countdown', { trackId: trackId || this.currentTrackId, passage, startTime });
  }

  // Throttled progress update (~10Hz)
  sendProgress(progress, wpm, speed, lane = 0) {
    if (!this.roomCode || !this.localPlayer) return;
    this.broadcastEvent({
      type: 'PROGRESS_UPDATE',
      roomCode: this.roomCode,
      playerId: this.localPlayer.id,
      progress,
      wpm,
      speed,
      lane
    });
  }

  sendFinished(finalWpm, finishTime) {
    if (!this.roomCode || !this.localPlayer) return;
    this.broadcastEvent({
      type: 'PLAYER_FINISHED',
      roomCode: this.roomCode,
      playerId: this.localPlayer.id,
      finalWpm,
      finishTime
    });

    // Mark room finished if host
    if (this.isHost && supabase) {
      try {
        supabase.from('rooms').update({ status: 'finished' }).eq('code', this.roomCode);
      } catch (e) {}
    }
  }

  leaveRoom() {
    if (this.roomCode && this.localPlayer) {
      this.broadcastEvent({
        type: 'PLAYER_LEFT',
        roomCode: this.roomCode,
        playerId: this.localPlayer.id
      });
    }

    if (this.currentChannel && supabase) {
      try {
        supabase.removeChannel(this.currentChannel);
      } catch (e) {}
      this.currentChannel = null;
    }

    this.roomCode = null;
    this.isHost = false;
    this.players.clear();
  }
}

export const multiplayer = new MultiplayerService();
