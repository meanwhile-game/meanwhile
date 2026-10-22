export interface Passage {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  author?: string;
}

export type RoomState = 'LOBBY' | 'STARTING' | 'RACING' | 'FINISHED';

export interface Player {
  id: string;
  socketId: string;
  username: string;
  avatar: string;
  vehicleId: string;
  vehicleColor: string;
  isReady: boolean;
  isHost: boolean;
  isAi: boolean;
  targetWpm?: number;
  progress: number; // 0.0 to 1.0
  currentTypedIndex: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorsCount: number;
  totalKeystrokes: number;
  startTime: number | null;
  finishTime: number | null;
  elapsedMs: number | null;
  placement: number | null;
  xpEarned: number;
  lastKeystrokeTime?: number;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  isPrivate: boolean;
  maxPlayers: number;
  trackId: string;
  state: RoomState;
  hostId: string;
  players: Record<string, Player>;
  passage: Passage;
  countdown: number;
  countdownTimer?: NodeJS.Timeout;
  raceStartTime: number | null;
  winnerId: string | null;
  finishedCount: number;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  rankTier: string;
  totalRaces: number;
  wins: number;
  podiums: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  favoriteVehicle: string;
  favoriteTrack: string;
  recentRaces: RaceResultHistory[];
}

export interface RaceResultHistory {
  id: string;
  date: string;
  trackId: string;
  vehicleId: string;
  placement: number;
  totalRacers: number;
  wpm: number;
  accuracy: number;
  timeMs: number;
  xpGained: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  bestWpm: number;
  averageWpm: number;
  wins: number;
  races: number;
  level: number;
  rankTier: string;
}
