type EventHandler = (...args: any[]) => void;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

class EventEmitterSocket {
  public id: string = '';
  public connected: boolean = false;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private ackCallbacks: Map<string, (res: any) => void> = new Map();
  private ackCounter: number = 0;
  private reconnectAttempts: number = 0;
  private reconnectTimer: any = null;
  private url: string;

  constructor() {
    // Convert http/https to ws/wss
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let base = SERVER_URL.replace(/^https?:/, wsProto);
    if (!base.endsWith('/ws')) {
      base = base.replace(/\/$/, '') + '/ws';
    }
    this.url = base;
  }

  public connect(): this {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return this;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        console.log('[Go WS] Connected to Meanwhile Go Server');
      };

      this.ws.onmessage = (event) => {
        // Can receive multiple messages separated by newlines
        const lines = event.data.split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            this.handleIncoming(parsed);
          } catch (e) {
            console.warn('[Go WS] Failed to parse message:', line, e);
          }
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.emitLocal('disconnect');
        console.log('[Go WS] Disconnected from server');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Go WS] Error:', err);
        this.emitLocal('connect_error', err);
      };
    } catch (err) {
      console.warn('[Go WS] Connection attempt failed:', err);
      this.scheduleReconnect();
    }

    return this;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 5000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log(`[Go WS] Attempting reconnection (#${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  private handleIncoming(msg: { event: string; data?: any; ackId?: string }) {
    if (msg.event === 'ack' && msg.ackId) {
      const cb = this.ackCallbacks.get(msg.ackId);
      if (cb) {
        this.ackCallbacks.delete(msg.ackId);
        cb(msg.data);
      }
      return;
    }

    if (msg.event === 'connected') {
      this.id = msg.data?.socketId || '';
      this.connected = true;
      this.emitLocal('connect');
      this.emitLocal('connected', msg.data);
      return;
    }

    this.emitLocal(msg.event, msg.data);
  }

  public on(event: string, handler: EventHandler): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return this;
  }

  public once(event: string, handler: EventHandler): this {
    const wrapped: EventHandler = (...args: any[]) => {
      this.off(event, wrapped);
      handler(...args);
    };
    return this.on(event, wrapped);
  }

  public off(event: string, handler?: EventHandler): this {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    }
    return this;
  }

  private emitLocal(event: string, ...args: any[]) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((fn) => {
        try {
          fn(...args);
        } catch (e) {
          console.error(`[Go WS] Handler error for ${event}:`, e);
        }
      });
    }
  }

  public emit(event: string, data?: any, callback?: (res: any) => void): this {
    let ackId = '';
    if (typeof callback === 'function') {
      ackId = `ack_${++this.ackCounter}_${Date.now()}`;
      this.ackCallbacks.set(ackId, callback);
      // Timeout callback if server doesn't respond in 10s
      setTimeout(() => {
        if (this.ackCallbacks.has(ackId)) {
          this.ackCallbacks.delete(ackId);
          callback({ success: false, error: 'Request timeout' });
        }
      }, 10000);
    }

    const payload = JSON.stringify({
      event,
      data,
      ackId,
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      // If not yet open, wait for open
      this.once('connect', () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(payload);
        }
      });
      this.connect();
    }

    return this;
  }
}

class SocketService {
  private socket: EventEmitterSocket | null = null;

  public connect(): EventEmitterSocket {
    if (!this.socket) {
      this.socket = new EventEmitterSocket();
      this.socket.connect();
    }
    return this.socket;
  }

  public getSocket(): EventEmitterSocket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public getSocketId(): string {
    return this.socket?.id || '';
  }

  public getConnected(): boolean {
    return this.socket?.connected || false;
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
