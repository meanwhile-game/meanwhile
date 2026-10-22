import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { Room, Player, RoomState, Passage } from './types.js';
import { getRandomPassage } from './passages.js';
import { db } from './db.js';

export class GameEngine {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private matchmakingQueue: {
    socketId: string;
    username: string;
    avatar: string;
    vehicleId: string;
    vehicleColor: string;
    joinedAt: number;
  }[] = [];
  private matchmakingTimer?: NodeJS.Timeout;
  private aiLoopTimer?: NodeJS.Timeout;

  constructor(io: Server) {
    this.io = io;
    this.startAiLoop();
  }

  // --- ROOM MANAGEMENT ---

  public createRoom(
    socket: Socket,
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
      isPrivate?: boolean;
      trackId?: string;
      passageDifficulty?: 'easy' | 'medium' | 'hard';
    }
  ): Room {
    this.leaveRoom(socket);

    const roomId = nanoid(8);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const passage = getRandomPassage(options.passageDifficulty || 'medium');

    const hostPlayer: Player = {
      id: socket.id,
      socketId: socket.id,
      username: options.username || 'Racer',
      avatar: options.avatar || '🏎️',
      vehicleId: options.vehicleId || 'cyber-gt',
      vehicleColor: options.vehicleColor || '#00ff87',
      isReady: true,
      isHost: true,
      isAi: false,
      progress: 0,
      currentTypedIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errorsCount: 0,
      totalKeystrokes: 0,
      startTime: null,
      finishTime: null,
      elapsedMs: null,
      placement: null,
      xpEarned: 0
    };

    const room: Room = {
      id: roomId,
      code,
      name: `${hostPlayer.username}'s Grid`,
      isPrivate: options.isPrivate ?? true,
      maxPlayers: 6,
      trackId: options.trackId || 'tokyo',
      state: 'LOBBY',
      hostId: socket.id,
      players: { [socket.id]: hostPlayer },
      passage,
      countdown: 3,
      raceStartTime: null,
      winnerId: null,
      finishedCount: 0,
      createdAt: Date.now()
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    return room;
  }

  public joinRoom(
    socket: Socket,
    roomIdOrCode: string,
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
    }
  ): { success: boolean; room?: Room; error?: string } {
    this.leaveRoom(socket);

    let room = this.rooms.get(roomIdOrCode);
    if (!room) {
      // Check if it's a room code
      for (const r of this.rooms.values()) {
        if (r.code.toUpperCase() === roomIdOrCode.toUpperCase().trim()) {
          room = r;
          break;
        }
      }
    }

    if (!room) {
      return { success: false, error: 'Room not found. Check your room code.' };
    }

    if (room.state !== 'LOBBY') {
      return { success: false, error: 'Race already in progress or completed.' };
    }

    if (Object.keys(room.players).length >= room.maxPlayers) {
      return { success: false, error: 'Lobby is full (maximum 6 players).' };
    }

    const newPlayer: Player = {
      id: socket.id,
      socketId: socket.id,
      username: options.username || `Racer_${socket.id.slice(0, 4)}`,
      avatar: options.avatar || '🏎️',
      vehicleId: options.vehicleId || 'cyber-gt',
      vehicleColor: options.vehicleColor || '#38bdf8',
      isReady: false,
      isHost: false,
      isAi: false,
      progress: 0,
      currentTypedIndex: 0,
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      errorsCount: 0,
      totalKeystrokes: 0,
      startTime: null,
      finishTime: null,
      elapsedMs: null,
      placement: null,
      xpEarned: 0
    };

    room.players[socket.id] = newPlayer;
    this.socketToRoom.set(socket.id, room.id);
    socket.join(room.id);

    this.io.to(room.id).emit('room_updated', this.sanitizeRoom(room));
    return { success: true, room };
  }

  public startSoloRace(
    socket: Socket,
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
      trackId: string;
      aiCount?: number;
      aiDifficulty?: 'easy' | 'medium' | 'hard';
    }
  ): Room {
    const room = this.createRoom(socket, {
      ...options,
      isPrivate: true,
      trackId: options.trackId
    });

    // Add transparently labeled AI opponents
    const count = options.aiCount ?? 3;
    const aiTemplates = [
      { name: 'Kuro Cyber [AI]', avatar: '🤖', vehicle: 'ronin-turbo', color: '#f43f5e', targetWpm: options.aiDifficulty === 'hard' ? 85 : options.aiDifficulty === 'easy' ? 45 : 62 },
      { name: 'Apex Bot [AI]', avatar: '⚡', vehicle: 'apex-hyper', color: '#eab308', targetWpm: options.aiDifficulty === 'hard' ? 95 : options.aiDifficulty === 'easy' ? 52 : 72 },
      { name: 'Alpine Stig [AI]', avatar: '🏔️', vehicle: 'phantom-bike', color: '#a855f7', targetWpm: options.aiDifficulty === 'hard' ? 105 : options.aiDifficulty === 'easy' ? 58 : 80 },
    ];

    for (let i = 0; i < Math.min(count, aiTemplates.length); i++) {
      const template = aiTemplates[i];
      const aiId = `ai_${nanoid(6)}`;
      room.players[aiId] = {
        id: aiId,
        socketId: aiId,
        username: template.name,
        avatar: template.avatar,
        vehicleId: template.vehicle,
        vehicleColor: template.color,
        isReady: true,
        isHost: false,
        isAi: true,
        targetWpm: template.targetWpm + Math.floor(Math.random() * 8 - 4),
        progress: 0,
        currentTypedIndex: 0,
        wpm: 0,
        rawWpm: 0,
        accuracy: 98,
        errorsCount: 1,
        totalKeystrokes: 0,
        startTime: null,
        finishTime: null,
        elapsedMs: null,
        placement: null,
        xpEarned: 0
      };
    }

    this.startCountdown(room.id);
    return room;
  }

  public leaveRoom(socket: Socket): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    this.socketToRoom.delete(socket.id);
    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (!room) return;

    delete room.players[socket.id];
    const remainingPlayers = Object.values(room.players).filter(p => !p.isAi);

    if (remainingPlayers.length === 0) {
      if (room.countdownTimer) clearInterval(room.countdownTimer);
      this.rooms.delete(roomId);
    } else {
      // Transfer host if host left
      if (room.hostId === socket.id) {
        room.hostId = remainingPlayers[0].socketId;
        room.players[room.hostId].isHost = true;
      }
      this.io.to(room.id).emit('room_updated', this.sanitizeRoom(room));
    }
  }

  public setReady(socket: Socket, isReady: boolean): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY') return;

    if (room.players[socket.id]) {
      room.players[socket.id].isReady = isReady;
      this.io.to(room.id).emit('room_updated', this.sanitizeRoom(room));
    }
  }

  public updateVehicle(socket: Socket, vehicleId: string, vehicleColor: string): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY') return;

    if (room.players[socket.id]) {
      room.players[socket.id].vehicleId = vehicleId;
      room.players[socket.id].vehicleColor = vehicleColor;
      this.io.to(room.id).emit('room_updated', this.sanitizeRoom(room));
    }
  }

  public updateTrack(socket: Socket, trackId: string): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY' || room.hostId !== socket.id) return;

    room.trackId = trackId;
    this.io.to(room.id).emit('room_updated', this.sanitizeRoom(room));
  }

  public startCountdown(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'LOBBY') return;

    room.state = 'STARTING';
    room.countdown = 3;
    this.io.to(room.id).emit('countdown_tick', { countdown: 3 });

    if (room.countdownTimer) clearInterval(room.countdownTimer);

    room.countdownTimer = setInterval(() => {
      room.countdown -= 1;
      if (room.countdown > 0) {
        this.io.to(room.id).emit('countdown_tick', { countdown: room.countdown });
      } else {
        if (room.countdownTimer) clearInterval(room.countdownTimer);
        this.startRace(room);
      }
    }, 1000);
  }

  private startRace(room: Room): void {
    room.state = 'RACING';
    room.raceStartTime = Date.now();
    room.finishedCount = 0;
    room.winnerId = null;

    Object.values(room.players).forEach(p => {
      p.startTime = room.raceStartTime;
      p.progress = 0;
      p.currentTypedIndex = 0;
      p.wpm = 0;
      p.rawWpm = 0;
      p.accuracy = 100;
      p.errorsCount = 0;
      p.totalKeystrokes = 0;
      p.finishTime = null;
      p.elapsedMs = null;
      p.placement = null;
    });

    this.io.to(room.id).emit('race_started', {
      raceStartTime: room.raceStartTime,
      passage: room.passage,
      room: this.sanitizeRoom(room)
    });
  }

  // --- KEYSTROKE & PROGRESS VALIDATION (AUTHORITATIVE) ---

  public handleKeystroke(
    socket: Socket,
    payload: {
      index: number;
      char: string;
      isError: boolean;
      clientTimestamp: number;
    }
  ): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'RACING' || !room.raceStartTime) return;

    const player = room.players[socket.id];
    if (!player || player.finishTime) return;

    const now = Date.now();
    const elapsedMinutes = (now - room.raceStartTime) / 60000;
    if (elapsedMinutes <= 0) return;

    player.totalKeystrokes += 1;

    if (payload.isError) {
      player.errorsCount += 1;
      player.accuracy = Math.max(0, Math.round(((player.totalKeystrokes - player.errorsCount) / player.totalKeystrokes) * 100));
      return;
    }

    // Authoritative check against passage
    const expectedChar = room.passage.text[payload.index];
    if (payload.char !== expectedChar) {
      player.errorsCount += 1;
      player.accuracy = Math.max(0, Math.round(((player.totalKeystrokes - player.errorsCount) / player.totalKeystrokes) * 100));
      return;
    }

    // Advance index
    player.currentTypedIndex = payload.index + 1;
    player.progress = player.currentTypedIndex / room.passage.text.length;

    // Calculate official server WPM: (characters / 5) / minutes
    const wordsTyped = player.currentTypedIndex / 5;
    player.wpm = Math.round(wordsTyped / elapsedMinutes);
    player.rawWpm = Math.round((player.totalKeystrokes / 5) / elapsedMinutes);
    player.accuracy = Math.max(0, Math.round(((player.totalKeystrokes - player.errorsCount) / player.totalKeystrokes) * 100));

    // Check finish
    if (player.currentTypedIndex >= room.passage.text.length) {
      this.finishPlayer(room, player, now);
    }

    // Broadcast compact progress update
    this.broadcastRaceProgress(room);
  }

  private finishPlayer(room: Room, player: Player, finishTime: number): void {
    player.finishTime = finishTime;
    player.elapsedMs = finishTime - (room.raceStartTime || finishTime);
    room.finishedCount += 1;
    player.placement = room.finishedCount;

    if (room.finishedCount === 1) {
      room.winnerId = player.id;
    }

    // Record stats and XP to database if real player
    if (!player.isAi) {
      const raceResult = db.recordRaceResult(player.socketId, {
        trackId: room.trackId,
        vehicleId: player.vehicleId,
        placement: player.placement,
        totalRacers: Object.keys(room.players).length,
        wpm: player.wpm,
        accuracy: player.accuracy,
        timeMs: player.elapsedMs
      });
      player.xpEarned = raceResult.xpEarned;
    } else {
      player.xpEarned = 100;
    }

    this.io.to(room.id).emit('player_finished', {
      playerId: player.id,
      placement: player.placement,
      wpm: player.wpm,
      accuracy: player.accuracy,
      elapsedMs: player.elapsedMs,
      xpEarned: player.xpEarned
    });

    // If all real players finished, complete the race
    const realPlayers = Object.values(room.players).filter(p => !p.isAi);
    const allRealFinished = realPlayers.every(p => p.finishTime !== null);

    if (allRealFinished) {
      room.state = 'FINISHED';
      this.io.to(room.id).emit('race_finished', {
        room: this.sanitizeRoom(room),
        podium: Object.values(room.players)
          .sort((a, b) => (a.placement || 99) - (b.placement || 99))
      });
    }
  }

  // --- AI RACER SIMULATION LOOP ---

  private startAiLoop(): void {
    this.aiLoopTimer = setInterval(() => {
      const now = Date.now();
      for (const room of this.rooms.values()) {
        if (room.state !== 'RACING' || !room.raceStartTime) continue;

        let anyAiUpdated = false;
        for (const player of Object.values(room.players)) {
          if (!player.isAi || player.finishTime) continue;

          const elapsedMinutes = (now - room.raceStartTime) / 60000;
          if (elapsedMinutes <= 0) continue;

          const targetWpm = player.targetWpm || 65;
          // Natural fluctuation
          const jitter = Math.sin(now / 1500) * 4;
          const currentExpectedWpm = Math.max(30, targetWpm + jitter);

          // Expected characters = wpm * 5 * minutes
          const expectedChars = Math.floor(currentExpectedWpm * 5 * elapsedMinutes);

          if (expectedChars > player.currentTypedIndex) {
            player.currentTypedIndex = Math.min(room.passage.text.length, expectedChars);
            player.progress = player.currentTypedIndex / room.passage.text.length;
            player.wpm = Math.round((player.currentTypedIndex / 5) / elapsedMinutes);
            player.totalKeystrokes = player.currentTypedIndex + player.errorsCount;
            anyAiUpdated = true;

            if (player.currentTypedIndex >= room.passage.text.length) {
              this.finishPlayer(room, player, now);
            }
          }
        }

        if (anyAiUpdated) {
          this.broadcastRaceProgress(room);
        }
      }
    }, 150); // 150ms smooth tick
  }

  private broadcastRaceProgress(room: Room): void {
    const progressData = Object.values(room.players).map(p => ({
      id: p.id,
      progress: p.progress,
      wpm: p.wpm,
      accuracy: p.accuracy,
      placement: p.placement,
      currentTypedIndex: p.currentTypedIndex
    }));

    this.io.to(room.id).emit('race_progress', progressData);
  }

  // --- MATCHMAKING SYSTEM ---

  public addToMatchmaking(
    socket: Socket,
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
    }
  ): void {
    this.removeFromMatchmaking(socket.id);
    this.leaveRoom(socket);

    this.matchmakingQueue.push({
      socketId: socket.id,
      username: options.username,
      avatar: options.avatar,
      vehicleId: options.vehicleId,
      vehicleColor: options.vehicleColor,
      joinedAt: Date.now()
    });

    socket.emit('matchmaking_status', {
      status: 'searching',
      queueLength: this.matchmakingQueue.length
    });

    this.processMatchmaking();
  }

  public removeFromMatchmaking(socketId: string): void {
    const index = this.matchmakingQueue.findIndex(q => q.socketId === socketId);
    if (index !== -1) {
      this.matchmakingQueue.splice(index, 1);
    }
  }

  private processMatchmaking(): void {
    if (this.matchmakingQueue.length >= 2) {
      // Create matched room with up to 4 players
      const matched = this.matchmakingQueue.splice(0, 4);
      const host = matched[0];
      const hostSocket = this.io.sockets.sockets.get(host.socketId);
      if (!hostSocket) return;

      const tracks = ['tokyo', 'swiss', 'dubai'];
      const trackId = tracks[Math.floor(Math.random() * tracks.length)];

      const room = this.createRoom(hostSocket, {
        username: host.username,
        avatar: host.avatar,
        vehicleId: host.vehicleId,
        vehicleColor: host.vehicleColor,
        isPrivate: false,
        trackId
      });

      for (let i = 1; i < matched.length; i++) {
        const entrant = matched[i];
        const s = this.io.sockets.sockets.get(entrant.socketId);
        if (s) {
          this.joinRoom(s, room.id, {
            username: entrant.username,
            avatar: entrant.avatar,
            vehicleId: entrant.vehicleId,
            vehicleColor: entrant.vehicleColor
          });
        }
      }

      this.io.to(room.id).emit('match_found', { room: this.sanitizeRoom(room) });

      // Automatically start countdown after 4 seconds of lobby ready
      setTimeout(() => {
        this.startCountdown(room.id);
      }, 4000);
    } else {
      // Check for queue timeout (> 8 seconds waiting alone) -> match with AI opponents so user doesn't wait indefinitely!
      if (!this.matchmakingTimer) {
        this.matchmakingTimer = setInterval(() => {
          const now = Date.now();
          for (let i = 0; i < this.matchmakingQueue.length; i++) {
            const entrant = this.matchmakingQueue[i];
            if (now - entrant.joinedAt > 6000) { // 6s wait threshold
              this.matchmakingQueue.splice(i, 1);
              const s = this.io.sockets.sockets.get(entrant.socketId);
              if (s) {
                const tracks = ['tokyo', 'swiss', 'dubai'];
                const trackId = tracks[Math.floor(Math.random() * tracks.length)];
                const room = this.startSoloRace(s, {
                  username: entrant.username,
                  avatar: entrant.avatar,
                  vehicleId: entrant.vehicleId,
                  vehicleColor: entrant.vehicleColor,
                  trackId,
                  aiCount: 3
                });
                s.emit('match_found', { room: this.sanitizeRoom(room), filledWithBots: true });
              }
              break;
            }
          }
          if (this.matchmakingQueue.length === 0 && this.matchmakingTimer) {
            clearInterval(this.matchmakingTimer);
            this.matchmakingTimer = undefined;
          }
        }, 2000);
      }
    }
  }

  // --- RESTART / REMATCH ---

  public rematch(socket: Socket): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== socket.id) return;

    room.state = 'LOBBY';
    room.countdown = 3;
    room.passage = getRandomPassage('medium');
    room.winnerId = null;
    room.finishedCount = 0;

    Object.values(room.players).forEach(p => {
      p.progress = 0;
      p.currentTypedIndex = 0;
      p.wpm = 0;
      p.rawWpm = 0;
      p.accuracy = 100;
      p.errorsCount = 0;
      p.totalKeystrokes = 0;
      p.startTime = null;
      p.finishTime = null;
      p.elapsedMs = null;
      p.placement = null;
      p.xpEarned = 0;
    });

    this.io.to(room.id).emit('rematch_initiated', this.sanitizeRoom(room));
    this.startCountdown(room.id);
  }

  private sanitizeRoom(room: Room): Partial<Room> {
    return {
      id: room.id,
      code: room.code,
      name: room.name,
      isPrivate: room.isPrivate,
      maxPlayers: room.maxPlayers,
      trackId: room.trackId,
      state: room.state,
      hostId: room.hostId,
      players: room.players,
      passage: room.passage,
      countdown: room.countdown,
      raceStartTime: room.raceStartTime,
      winnerId: room.winnerId,
      finishedCount: room.finishedCount
    };
  }

  public getOnlineCount(): number {
    return this.io.engine.clientsCount;
  }
}
