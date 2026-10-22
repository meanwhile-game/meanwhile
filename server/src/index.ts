import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameEngine } from './gameEngine.js';
import { db } from './db.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameEngine = new GameEngine(io);
const PORT = process.env.PORT || 4000;

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    title: 'Meanwhile Authoritative Game Server',
    online: gameEngine.getOnlineCount(),
    timestamp: Date.now()
  });
});

app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json(db.getLeaderboard(limit));
});

app.get('/api/profile/:id', (req, res) => {
  const profile = db.getProfile(
    req.params.id,
    req.query.username as string,
    req.query.avatar as string
  );
  res.json(profile);
});

app.post('/api/profile/:id', (req, res) => {
  const updated = db.updateProfileSettings(req.params.id, req.body);
  res.json(updated);
});

// Real-Time Socket.IO Handlers
io.on('connection', (socket) => {
  console.log(`[Meanwhile] Racer connected: ${socket.id}`);

  socket.emit('connected', {
    socketId: socket.id,
    serverTime: Date.now()
  });

  // Broadcast updated online count
  io.emit('online_count', gameEngine.getOnlineCount());

  socket.on('create_room', (data, callback) => {
    try {
      const room = gameEngine.createRoom(socket, data);
      callback?.({ success: true, room });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('join_room', (data, callback) => {
    try {
      const result = gameEngine.joinRoom(socket, data.roomIdOrCode, data);
      callback?.(result);
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('start_solo', (data, callback) => {
    try {
      const room = gameEngine.startSoloRace(socket, data);
      callback?.({ success: true, room });
    } catch (err: any) {
      callback?.({ success: false, error: err.message });
    }
  });

  socket.on('join_matchmaking', (data) => {
    gameEngine.addToMatchmaking(socket, data);
  });

  socket.on('leave_matchmaking', () => {
    gameEngine.removeFromMatchmaking(socket.id);
  });

  socket.on('set_ready', (data) => {
    gameEngine.setReady(socket, data.isReady);
  });

  socket.on('update_vehicle', (data) => {
    gameEngine.updateVehicle(socket, data.vehicleId, data.vehicleColor);
  });

  socket.on('update_track', (data) => {
    gameEngine.updateTrack(socket, data.trackId);
  });

  socket.on('start_race', (data) => {
    if (data?.roomId) {
      gameEngine.startCountdown(data.roomId);
    }
  });

  socket.on('keystroke', (data) => {
    gameEngine.handleKeystroke(socket, data);
  });

  socket.on('rematch', () => {
    gameEngine.rematch(socket);
  });

  socket.on('leave_room', () => {
    gameEngine.leaveRoom(socket);
  });

  socket.on('disconnect', () => {
    console.log(`[Meanwhile] Racer disconnected: ${socket.id}`);
    gameEngine.removeFromMatchmaking(socket.id);
    gameEngine.leaveRoom(socket);
    io.emit('online_count', gameEngine.getOnlineCount());
  });
});

server.listen(PORT, () => {
  console.log(`[Meanwhile Server] Running on http://localhost:${PORT}`);
});
