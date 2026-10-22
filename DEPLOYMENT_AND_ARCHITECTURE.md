# MEANWHILE — System Architecture & Production Deployment Specification

This document provides a comprehensive technical reference for **Meanwhile**, detailing the current architecture, full technology stack, production cloud infrastructure, database schema and migration strategy, horizontal scalability roadmap, anti-cheat security, CI/CD automation, and cost projections.

---

## 📑 Table of Contents
1. [System Architecture & Data Flow](#1-system-architecture--data-flow)
2. [Technology Stack Breakdown](#2-technology-stack-breakdown)
3. [Production Cloud Infrastructure](#3-production-cloud-infrastructure)
4. [Database Strategy & Migration Guide](#4-database-strategy--migration-guide)
5. [Real-Time Networking & Scaling Sockets](#5-real-time-networking--scaling-sockets)
6. [Anti-Cheat & Security Model](#6-anti-cheat--security-model)
7. [Containerization & Docker Orchestration](#7-containerization--docker-orchestration)
8. [CI/CD Deployment Pipelines](#8-cicd-deployment-pipelines)
9. [Observability, Telemetry & SRE](#9-observability-telemetry--sre)
10. [Cost Analysis & Capacity Planning](#10-cost-analysis--capacity-planning)

---

## 1. System Architecture & Data Flow

Meanwhile operates on a **hybrid authoritative model**: client-side WebGL rendering and local input prediction combined with server-authoritative race clocks, room state management, and keystroke verification.

```mermaid
flowchart TB
    subgraph Client["Frontend Client (Browser)"]
        UI["React 19 SPA + Tailwind CSS v4"]
        Three["Three.js 3D Racing Engine (WebGL2)"]
        TypeEngine["Keystroke Capture & Velocity Engine"]
        Audio["Web Audio API (Procedural Synthesis)"]
        UI --- Three
        UI --- TypeEngine
        UI --- Audio
    end

    subgraph Edge["Global Edge / CDN Layer"]
        CF["Cloudflare Edge (DNS / SSL / DDoS Protection)"]
        StaticCDN["Cloudflare Pages / AWS CloudFront (Static Assets)"]
    end

    subgraph Backend["Stateful Game Server Layer"]
        LB["Network Load Balancer (WebSocket Sticky Sessions)"]
        Server1["Meanwhile Node.js Server Instance #1"]
        Server2["Meanwhile Node.js Server Instance #2"]
        ServerN["Meanwhile Node.js Server Instance #N"]
        
        GameLoop["Authoritative Room Loop & Clock Tick"]
        AntiCheat["Keystroke Velocity Validator"]
        AI["Synthetic Bot Simulation Engine"]
    end

    subgraph Data["Persistence & Caching Tier"]
        Redis[("Redis / Valkey Cluster\n- Socket.IO Redis Adapter\n- Matchmaking Queue\n- Real-Time Leaderboards (ZSET)")]
        DB[("PostgreSQL 16 Cluster\n- User Accounts & Auth\n- Persistent Driver Profiles\n- Historical Race Telemetry\n- Curated Literature Passages")]
    end

    Client -->|HTTPS Static Bundle| StaticCDN
    Client <-->|WSS Low-Latency WebSocket| CF
    CF <--> LB
    LB <--> Server1
    LB <--> Server2
    LB <--> ServerN

    Server1 <--> Redis
    Server2 <--> Redis
    ServerN <--> Redis

    Server1 --> DB
    Server2 --> DB
    ServerN --> DB

    Server1 --- GameLoop
    GameLoop --- AntiCheat
    GameLoop --- AI
```

### Race Lifecycle State Machine
1. **Queueing / Lobby**: Players join public matchmaking or enter a 6-character private room code. If matchmaking queue exceeds 4 seconds, synthetic AI drivers fill vacant slots.
2. **Synchronized Countdown**: Authoritative countdown starts (3 → 2 → 1 → 0). Keystrokes before `0` are rejected by the server clock.
3. **Racing Phase (Authoritative Tick)**:
   - Racer types characters.
   - Client emits `keystroke` events containing timestamp, character index, accuracy, and current WPM.
   - Server validates index continuity, updates authoritative position, and broadcasts progress at 15 Hz to all peers.
   - Three.js interpolates peer vehicles with Catmull-Rom spline projection and corner banking.
4. **Finish & Telemetry Aggregation**:
   - First across 100% triggers race completion timer.
   - Server computes official placements, calculates XP gains, records telemetry, and persists driver profile updates.
   - Client displays the **Text Provenance Card** displaying the literature/song attribution.

---

## 2. Technology Stack Breakdown

### Frontend Client
| Component | Technology | Rationale & Capabilities |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript 5.7+ | Concurrent rendering, compiler optimization, full static type safety |
| **Build Tooling** | Vite 8.3+ + Rollup | Instant Hot Module Replacement (HMR), sub-2-second production builds |
| **3D Rendering** | Three.js (r186) | Pure WebGL2 standard shader pipeline, dynamic chase camera, procedural Catmull-Rom tracks, 3D raised FIA kerbs, specular wet road shaders |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Zero-runtime CSS variable design tokens, multi-theme architecture (Obsidian, Porcelain, Midnight) |
| **Real-Time Client**| Socket.IO Client 4.8+ | Automatic reconnection with exponential backoff, WebSocket transport priority, event multiplexing |
| **Audio Engine** | Web Audio API | Procedural dual-oscillator pitch modulation dynamically coupled to live typing WPM; 0 external audio MP3 dependencies |
| **Typography** | Inter, Orbitron, JetBrains Mono | Legibility, digital speed aesthetic, fixed-width monospace alignment for text typing engine |

### Backend Game Server
| Component | Technology | Rationale & Capabilities |
| :--- | :--- | :--- |
| **Runtime & Language** | Go 1.22+ (v1.26/v1.27) | High-performance compiled binary, concurrent goroutine worker pools, zero-GC game loop ticks |
| **WebSocket Engine** | Native WebSockets (`github.com/gorilla/websocket`) | Low-latency binary/text frames, sub-millisecond roundtrips, custom ack callbacks |
| **HTTP Server** | Go `net/http` Standard Library | REST profile, leaderboard, and health endpoints (`/health`, `/api/profile`, `/api/leaderboard`) |
| **Database Tier** | PostgreSQL 16 (`github.com/lib/pq`) | 5 normalized tables (`users`, `player_stats`, `race_results`, `circuits`, `vehicles`) with bcrypt security |
| **In-Memory Store** | Thread-safe Go sync.RWMutex | Zero-lag active room management, live 15 Hz tick loop, seamless fallback if database is offline |
| **Password Security**| `golang.org/x/crypto/bcrypt` | Adaptive hashing cost factor 10, preventing credential leaks |

---

## 3. Production Cloud Infrastructure

### Target Deployment Topology (Option A: Modern Serverless / Managed PaaS)
Recommended for initial launch, low maintenance, and automatic scaling:

```
┌────────────────────────────────────────────────────────┐
│ Cloudflare (DNS, Edge SSL, DDoS Shield, WebSockets)    │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Cloudflare Pages / Vercel   │  │ Fly.io / Render / Railway   │
│ Client SPA (React 19 Build) │  │ Game Server Container       │
│ Global Edge CDN (HTTP/3)    │  │ Node.js 22 + Socket.IO      │
└─────────────────────────────┘  └──────────────┬──────────────┘
                                                │
               ┌────────────────────────────────┴──────────────┐
               ▼                                               ▼
┌─────────────────────────────┐                 ┌─────────────────────────────┐
│ Upstash Redis / Valkey      │                 │ Neon / Supabase Serverless  │
│ - Socket.IO Pub/Sub Adapter │                 │ PostgreSQL 16               │
│ - Ephemeral Matchmaking     │                 │ - Driver Profiles           │
│ - Live Leaderboards (ZSET)  │                 │ - Telemetry & Historical Race│
└─────────────────────────────┘                 └─────────────────────────────┘
```

### Target Deployment Topology (Option B: AWS Enterprise Kubernetes / ECS)
Recommended for scaling beyond 10,000+ concurrent drivers:
- **Client Hosting**: AWS S3 Bucket + CloudFront CDN distribution with edge cache policies.
- **Compute Layer**: AWS ECS Fargate or EKS (Elastic Kubernetes Service) running Dockerized Node.js server pods behind an AWS Network Load Balancer (NLB) with TLS termination and TCP WebSocket pass-through.
- **Cache & Socket Cluster**: AWS ElastiCache for Redis (Multi-AZ with auto-failover).
- **Persistent Database**: AWS Aurora Serverless v2 PostgreSQL (Multi-AZ with automatic read replicas).

---

## 4. Database Strategy & PostgreSQL Schema

Meanwhile utilizes a small, clean, high-performance PostgreSQL schema designed for high-concurrency esports telemetry. Full local and container setup instructions are available in **[DATABASE_SETUP.md](DATABASE_SETUP.md)**.

```sql
-- 1. Users Table (Bcrypt Hashed Security)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Circuits Table (Indian & Global Circuits)
CREATE TABLE IF NOT EXISTS circuits (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    circuit_type VARCHAR(64) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}'
);

-- 3. Vehicles Table (Machines & Physics Metadata)
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    vehicle_type VARCHAR(64) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- 4. Player Stats Table (Aggregated Career Telemetry)
CREATE TABLE IF NOT EXISTS player_stats (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_races INT DEFAULT 0,
    wins INT DEFAULT 0,
    best_wpm INT DEFAULT 0,
    average_wpm INT DEFAULT 0,
    average_accuracy INT DEFAULT 100,
    total_xp INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Race Results Table (Historical Race Logs)
CREATE TABLE IF NOT EXISTS race_results (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    circuit_id VARCHAR(64) REFERENCES circuits(id) ON DELETE SET NULL,
    vehicle_id VARCHAR(64) REFERENCES vehicles(id) ON DELETE SET NULL,
    finish_position INT NOT NULL,
    race_time_ms BIGINT NOT NULL,
    wpm INT NOT NULL,
    accuracy INT NOT NULL,
    errors INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_race_results_user ON race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_circuit ON race_results(circuit_id);
CREATE INDEX IF NOT EXISTS idx_race_results_created ON race_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_wpm ON player_stats(best_wpm DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON player_stats(wins DESC);
CREATE INDEX IF NOT EXISTS idx_player_stats_xp ON player_stats(total_xp DESC);
```

### Setup & Migrations
See **[DATABASE_SETUP.md](DATABASE_SETUP.md)** for one-command Docker launch, `.env` parameter configurations, and verification steps.

```typescript
import { readFileSync } from 'fs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Read existing JSON file
    const profilesRaw = readFileSync('./data/profiles.json', 'utf-8');
    const profiles = JSON.parse(profilesRaw);

    for (const [userId, p] of Object.entries<any>(profiles)) {
      // Upsert User
      await client.query(`
        INSERT INTO users (id, username, avatar)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET username = $2, avatar = $3
      `, [userId, p.username || 'Racer', p.avatar || '🏎️']);

      // Upsert Driver Profile
      await client.query(`
        INSERT INTO driver_profiles (
          user_id, level, xp, next_level_xp, rank_tier, total_races,
          wins, podiums, best_wpm, average_wpm, average_accuracy,
          favorite_vehicle, favorite_track
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id) DO UPDATE SET
          level = $2, xp = $3, wins = $7, best_wpm = $9, average_wpm = $10
      `, [
        userId, p.level || 1, p.xp || 0, p.nextLevelXp || 500, p.rankTier || 'Bronze',
        p.totalRaces || 0, p.wins || 0, p.podiums || 0, p.bestWpm || 0,
        p.averageWpm || 0, p.averageAccuracy || 100, p.favoriteVehicle || 'cyber-gt',
        p.favoriteTrack || 'tokyo'
      ]);
    }

    await client.query('COMMIT');
    console.log('Successfully migrated JSON data to PostgreSQL!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

---

## 5. Real-Time Networking & Scaling Sockets

### Horizontal Scaling with Redis Pub/Sub Adapter
When running multiple game server instances behind a load balancer, standard in-memory Socket.IO events cannot reach clients connected to different server instances.

1. **Install Redis Adapter**:
   ```bash
   npm install @socket.io/redis-adapter ioredis
   ```
2. **Configure Socket Server**:
   ```typescript
   import { createAdapter } from '@socket.io/redis-adapter';
   import Redis from 'ioredis';

   const pubClient = new Redis(process.env.REDIS_URL);
   const subClient = pubClient.duplicate();

   io.adapter(createAdapter(pubClient, subClient));
   ```

### High-Speed Leaderboards via Redis Sorted Sets (ZSET)
Instead of querying PostgreSQL with `SELECT ... ORDER BY best_wpm DESC LIMIT 50` on every lobby load, use Redis Sorted Sets:
- **Insert / Update WPM**:
  ```bash
  ZADD leaderboard:wpm:global 154 "u_apex"
  ```
- **Fetch Top 20 Grandmasters in 0.4ms**:
  ```bash
  ZREVRANGEBYSCORE leaderboard:wpm:global +inf -inf WITHSCORES LIMIT 0 20
  ```
- **Fetch Player's Live Global Rank**:
  ```bash
  ZREVRANK leaderboard:wpm:global "u_apex"
  ```

---

## 6. Anti-Cheat & Security Model

Typing games are susceptible to automated macro bots (e.g., auto-paste scripts, software key transmitters). Meanwhile implements a multi-layer authoritative protection model:

1. **Server Clock Authority**: Countdown is measured strictly against the server epoch timestamp. Any input received before `room.raceStartTime` is logged as a jump start or rejected.
2. **Sequential Keystroke Verification**:
   - The server maintains `player.currentTypedIndex`.
   - Each keystroke event must match `expectedChar = room.passage.text[currentTypedIndex]`.
   - Keystroke skips or jumping arbitrary blocks triggers instant desync correction.
3. **Biomechanical Human Limits**:
   - **Peak WPM Ceiling**: Sustained velocity exceeding **225 WPM** triggers an anti-cheat telemetry flag.
   - **Inter-Keystroke Interval (IKI)**: Standard human finger actuation requires at least **25ms - 40ms** between successive strikes. If variance is 0ms (instantaneous programmatic injection), the input is flagged as simulated.
4. **WebSocket Connection Protections**:
   - Origin header validation preventing unauthorized third-party embeds.
   - Rate limiting per socket (maximum 35 events per second).

---

## 7. Containerization & Docker Orchestration

### Production Server Dockerfile (`server/Dockerfile`)
```dockerfile
# Multi-stage production build for Meanwhile Game Server
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY data/ ./data/

# Security: Run as non-root node user
USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### Production Client Dockerfile (`client/Dockerfile`)
```dockerfile
# Build frontend static bundle
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve with lightweight NGINX Alpine
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Full-Stack Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  meanwhile-server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - CLIENT_URL=http://localhost:5173
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://meanwhile:secret@postgres:5432/meanwhile_db
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  meanwhile-client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - meanwhile-server
    restart: unless-stopped

  redis:
    image: redis:7.4-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=meanwhile
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=meanwhile_db
    volumes:
      - pg_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  pg_data:
```

---

## 8. CI/CD Deployment Pipelines

### Automated GitHub Actions Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Meanwhile CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install & Verify Root
        run: npm ci

      - name: Build Server
        working-directory: ./server
        run: |
          npm ci
          npm run build

      - name: Build Client SPA
        working-directory: ./client
        run: |
          npm ci
          npm run build

      - name: Lint Verification
        working-directory: ./client
        run: npx oxlint

  deploy-production:
    needs: validate-and-build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      # Deploy Client to Cloudflare Pages
      - name: Deploy Client to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: meanwhile-app
          directory: client/dist

      # Deploy Server to Fly.io or Cloud Container
      - name: Deploy Game Server to Fly.io
        uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 9. Observability, Telemetry & SRE

### Critical Service-Level Indicators (SLIs)
1. **WebSocket RTT Latency**: 95th percentile under **45ms** globally.
2. **Server Tick Rate Health**: Target 60 Hz event loop stability with loop lag < **10ms**.
3. **Keystroke Drop Rate**: Packet loss under **0.05%**.
4. **Room Allocation Latency**: Matchmaking pairing time < **250ms**.

### Health Check Endpoints
- **Liveness**: `GET /api/health` returns `{ "status": "online", "online": N, "timestamp": T }`.
- **Readiness**: Validates connection to Redis adapter and database pool before admitting inbound traffic from the load balancer.

---

## 10. Cost Analysis & Capacity Planning

| Tier | Monthly Estimate | Target Concurrency | Infrastructure Allocation |
| :--- | :--- | :--- | :--- |
| **Hobby / Launch** | **$0 – $15 / mo** | 100 concurrent racers | - Cloudflare Pages (Free)<br>- Fly.io 1x Shared CPU 512MB ($5)<br>- Neon Serverless Postgres (Free tier)<br>- Upstash Redis (Free tier) |
| **Growth Tier** | **$45 – $95 / mo** | 1,500 concurrent racers | - Cloudflare Pro ($20)<br>- 2x Dedicated Fly.io / Render nodes ($35)<br>- Managed PostgreSQL (Neon / Supabase Pro $25)<br>- Managed Redis ($15) |
| **Esports Scale** | **$250 – $450 / mo**| 15,000+ concurrent racers | - AWS ECS Fargate Cluster (4x 2 vCPU nodes)<br>- AWS ElastiCache Multi-AZ Redis<br>- AWS Aurora Serverless v2 PostgreSQL<br>- Cloudflare Enterprise Spectrum |

---

## 🏁 Summary Checklist for Future Deployment
1. **Create managed PostgreSQL database** (e.g. Supabase, Neon, or RDS) and execute the SQL schema.
2. **Set up Redis instance** (e.g. Upstash or ElastiCache) for WebSocket adapter.
3. **Configure environment variables**:
   - `PORT=4000`
   - `DATABASE_URL=postgresql://...`
   - `REDIS_URL=redis://...`
   - `CLIENT_URL=https://your-domain.com`
4. **Deploy Server** via Docker on Fly.io, Railway, or AWS ECS.
5. **Deploy Client** on Cloudflare Pages or Vercel pointing `VITE_API_URL` to your production server URL.
6. **Assign custom domain** and verify WebSockets over WSS.
