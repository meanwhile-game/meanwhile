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

    // Initialize native Cross-Tab BroadcastChannel as zero-latency local/peer transport
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

  // Generate 6-character room code like MW-4829
  generateRoomCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `MW-${num}`;
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

  // Create room
  async createRoom(hostPlayer, trackId = 'coastal-drive', laps = 2) {
    this.leaveRoom();
    const code = this.generateRoomCode();
    this.roomCode = code;
    this.isHost = true;
    this.localPlayer = { ...hostPlayer, isHost: true, isReady: true };
    this.players.clear();
    this.players.set(hostPlayer.id, this.localPlayer);

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

  // Join room
  async joinRoom(code, player) {
    this.leaveRoom();
    const cleanCode = code.trim().toUpperCase();
    this.roomCode = cleanCode;
    this.isHost = false;
    this.localPlayer = { ...player, isHost: false, isReady: false };
    this.players.clear();
    this.players.set(player.id, this.localPlayer);

    await this.connectChannel(cleanCode);

    // Announce join
    this.broadcastEvent({
      type: 'PLAYER_JOINED',
      roomCode: cleanCode,
      player: this.localPlayer
    });

    this.emit('room_updated', {
      roomCode: cleanCode,
      isHost: false,
      players: Array.from(this.players.values())
    });

    return { roomCode: cleanCode, isHost: false };
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
    if (msg.senderId === this.localPlayer?.id) return; // Ignore own echoes

    switch (msg.type) {
      case 'PLAYER_JOINED':
        if (msg.player) {
          this.players.set(msg.player.id, msg.player);
          this.emit('player_joined', msg.player);
          this.emit('players_changed', Array.from(this.players.values()));

          // If we are host, send state back to newly joined player
          if (this.isHost) {
            this.broadcastEvent({
              type: 'ROOM_SYNC',
              roomCode: this.roomCode,
              players: Array.from(this.players.values())
            });
          }
        }
        break;

      case 'ROOM_SYNC':
        if (Array.isArray(msg.players)) {
          msg.players.forEach(p => this.players.set(p.id, p));
          this.emit('players_changed', Array.from(this.players.values()));
        }
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
      senderId: this.localPlayer?.id,
      timestamp: Date.now()
    };

    // 1. Broadcast over local cross-tab bus
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(fullPayload);
      } catch (e) {}
    }

    // 2. Broadcast over Supabase Realtime channel
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

  // Host starts the game
  startRace(trackId, passage) {
    if (!this.isHost) return;
    const startTime = Date.now() + 3500; // 3.5s countdown

    this.broadcastEvent({
      type: 'START_COUNTDOWN',
      roomCode: this.roomCode,
      trackId,
      passage,
      startTime
    });

    this.emit('start_countdown', { trackId, passage, startTime });
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
