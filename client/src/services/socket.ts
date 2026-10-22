import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 8,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[Socket] Connected to Meanwhile Server, ID:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[Socket] Disconnected from server');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
      });
    }

    return this.socket;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public getSocketId(): string {
    return this.socket?.id || '';
  }

  public getConnected(): boolean {
    return this.isConnected;
  }

  // --- ACTIONS ---

  public createRoom(
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
      isPrivate?: boolean;
      trackId?: string;
    },
    callback: (res: { success: boolean; room?: any; error?: string }) => void
  ): void {
    this.getSocket().emit('create_room', options, callback);
  }

  public joinRoom(
    roomIdOrCode: string,
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
    },
    callback: (res: { success: boolean; room?: any; error?: string }) => void
  ): void {
    this.getSocket().emit('join_room', { roomIdOrCode, ...options }, callback);
  }

  public startSoloRace(
    options: {
      username: string;
      avatar: string;
      vehicleId: string;
      vehicleColor: string;
      trackId: string;
      aiCount?: number;
      aiDifficulty?: 'easy' | 'medium' | 'hard';
    },
    callback: (res: { success: boolean; room?: any; error?: string }) => void
  ): void {
    const s = this.getSocket();
    if (s.connected) {
      s.emit('start_solo', options, callback);
    } else {
      s.once('connect', () => {
        s.emit('start_solo', options, callback);
      });
      s.connect();
    }
  }

  public joinMatchmaking(options: {
    username: string;
    avatar: string;
    vehicleId: string;
    vehicleColor: string;
  }): void {
    this.getSocket().emit('join_matchmaking', options);
  }

  public leaveMatchmaking(): void {
    this.getSocket().emit('leave_matchmaking');
  }

  public setReady(isReady: boolean): void {
    this.getSocket().emit('set_ready', { isReady });
  }

  public updateVehicle(vehicleId: string, vehicleColor: string): void {
    this.getSocket().emit('update_vehicle', { vehicleId, vehicleColor });
  }

  public updateTrack(trackId: string): void {
    this.getSocket().emit('update_track', { trackId });
  }

  public startRace(roomId: string): void {
    this.getSocket().emit('start_race', { roomId });
  }

  public sendKeystroke(payload: {
    index: number;
    char: string;
    isError: boolean;
    clientTimestamp: number;
  }): void {
    this.getSocket().emit('keystroke', payload);
  }

  public rematch(): void {
    this.getSocket().emit('rematch');
  }

  public leaveRoom(): void {
    this.getSocket().emit('leave_room');
  }
}

export const socketService = new SocketService();
