import fs from 'fs';
import path from 'path';
import { UserProfile, LeaderboardEntry, RaceResultHistory } from './types.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const PROFILES_FILE = path.join(DB_DIR, 'profiles.json');
const LEADERBOARD_FILE = path.join(DB_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Champions for the esports leaderboard
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, id: 'u_apex', username: 'ApexPredator', avatar: '🏎️', bestWpm: 154, averageWpm: 142, wins: 289, races: 340, level: 52, rankTier: 'Grandmaster' },
  { rank: 2, id: 'u_valkyrie', username: 'Valkyrie_99', avatar: '⚡', bestWpm: 148, averageWpm: 136, wins: 245, races: 310, level: 48, rankTier: 'Master' },
  { rank: 3, id: 'u_nitro', username: 'NitroShift', avatar: '🔥', bestWpm: 142, averageWpm: 131, wins: 210, races: 280, level: 44, rankTier: 'Master' },
  { rank: 4, id: 'u_cipher', username: 'CipherDrift', avatar: '🏍️', bestWpm: 135, averageWpm: 125, wins: 185, races: 250, level: 39, rankTier: 'Diamond' },
  { rank: 5, id: 'u_ghost', username: 'GhostRacer', avatar: '👻', bestWpm: 128, averageWpm: 119, wins: 150, races: 215, level: 35, rankTier: 'Diamond' },
  { rank: 6, id: 'u_zenith', username: 'ZenithTurbo', avatar: '🌌', bestWpm: 122, averageWpm: 114, wins: 130, races: 190, level: 31, rankTier: 'Platinum' },
  { rank: 7, id: 'u_pulse', username: 'PulseRider', avatar: '🎯', bestWpm: 118, averageWpm: 108, wins: 95, races: 160, level: 27, rankTier: 'Platinum' },
  { rank: 8, id: 'u_ronin', username: 'RoninSpeed', avatar: '⚔️', bestWpm: 112, averageWpm: 102, wins: 78, races: 140, level: 24, rankTier: 'Gold' },
  { rank: 9, id: 'u_torque', username: 'TorqueVector', avatar: '⚙️', bestWpm: 105, averageWpm: 97, wins: 62, races: 120, level: 20, rankTier: 'Gold' },
  { rank: 10, id: 'u_monaco', username: 'MonacoAce', avatar: '👑', bestWpm: 98, averageWpm: 91, wins: 45, races: 95, level: 16, rankTier: 'Silver' },
];

class Database {
  private profiles: Map<string, UserProfile> = new Map();
  private leaderboard: LeaderboardEntry[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(PROFILES_FILE)) {
        const data = JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
        Object.entries(data).forEach(([id, profile]) => {
          this.profiles.set(id, profile as UserProfile);
        });
      }

      if (fs.existsSync(LEADERBOARD_FILE)) {
        this.leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf-8'));
      } else {
        this.leaderboard = [...INITIAL_LEADERBOARD];
        this.saveLeaderboard();
      }
    } catch (err) {
      console.error('Error loading database:', err);
      this.leaderboard = [...INITIAL_LEADERBOARD];
    }
  }

  private saveProfiles() {
    try {
      const obj: Record<string, UserProfile> = {};
      this.profiles.forEach((profile, id) => {
        obj[id] = profile;
      });
      fs.writeFileSync(PROFILES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving profiles:', err);
    }
  }

  private saveLeaderboard() {
    try {
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(this.leaderboard, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving leaderboard:', err);
    }
  }

  getProfile(id: string, defaultUsername?: string, defaultAvatar?: string): UserProfile {
    if (!this.profiles.has(id)) {
      const newProfile: UserProfile = {
        id,
        username: defaultUsername || `Racer_${id.slice(0, 5)}`,
        avatar: defaultAvatar || '🏎️',
        level: 1,
        xp: 0,
        nextLevelXp: 500,
        rankTier: 'Bronze',
        totalRaces: 0,
        wins: 0,
        podiums: 0,
        bestWpm: 0,
        averageWpm: 0,
        averageAccuracy: 100,
        favoriteVehicle: 'cyber-gt',
        favoriteTrack: 'tokyo',
        recentRaces: []
      };
      this.profiles.set(id, newProfile);
      this.saveProfiles();
    }
    return this.profiles.get(id)!;
  }

  recordRaceResult(
    userId: string,
    result: {
      trackId: string;
      vehicleId: string;
      placement: number;
      totalRacers: number;
      wpm: number;
      accuracy: number;
      timeMs: number;
    }
  ): { profile: UserProfile; xpEarned: number; leveledUp: boolean } {
    const profile = this.getProfile(userId);

    // Calculate XP
    let xpEarned = Math.round(result.wpm * 2 + (result.accuracy / 2));
    if (result.placement === 1) xpEarned += 200;
    else if (result.placement === 2) xpEarned += 120;
    else if (result.placement === 3) xpEarned += 75;
    else xpEarned += 40;

    let leveledUp = false;
    profile.xp += xpEarned;
    while (profile.xp >= profile.nextLevelXp) {
      profile.xp -= profile.nextLevelXp;
      profile.level += 1;
      profile.nextLevelXp = Math.round(profile.nextLevelXp * 1.25);
      leveledUp = true;
    }

    // Update rank tier
    if (profile.bestWpm >= 140) profile.rankTier = 'Grandmaster';
    else if (profile.bestWpm >= 120) profile.rankTier = 'Master';
    else if (profile.bestWpm >= 100) profile.rankTier = 'Diamond';
    else if (profile.bestWpm >= 80) profile.rankTier = 'Platinum';
    else if (profile.bestWpm >= 60) profile.rankTier = 'Gold';
    else if (profile.bestWpm >= 40) profile.rankTier = 'Silver';
    else profile.rankTier = 'Bronze';

    // Update stats
    profile.totalRaces += 1;
    if (result.placement === 1) profile.wins += 1;
    if (result.placement <= 3) profile.podiums += 1;
    if (result.wpm > profile.bestWpm) profile.bestWpm = Math.round(result.wpm);

    // Running averages
    profile.averageWpm = Math.round(
      (profile.averageWpm * (profile.totalRaces - 1) + result.wpm) / profile.totalRaces
    );
    profile.averageAccuracy = Math.round(
      (profile.averageAccuracy * (profile.totalRaces - 1) + result.accuracy) / profile.totalRaces
    );

    const raceHistoryItem: RaceResultHistory = {
      id: `race_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      trackId: result.trackId,
      vehicleId: result.vehicleId,
      placement: result.placement,
      totalRacers: result.totalRacers,
      wpm: result.wpm,
      accuracy: result.accuracy,
      timeMs: result.timeMs,
      xpGained: xpEarned
    };

    profile.recentRaces.unshift(raceHistoryItem);
    if (profile.recentRaces.length > 20) {
      profile.recentRaces = profile.recentRaces.slice(0, 20);
    }

    this.profiles.set(userId, profile);
    this.saveProfiles();

    // Update leaderboard
    this.updateLeaderboardEntry(profile);

    return { profile, xpEarned, leveledUp };
  }

  private updateLeaderboardEntry(profile: UserProfile) {
    const existingIndex = this.leaderboard.findIndex(e => e.id === profile.id);
    const entry: LeaderboardEntry = {
      rank: 0,
      id: profile.id,
      username: profile.username,
      avatar: profile.avatar,
      bestWpm: profile.bestWpm,
      averageWpm: profile.averageWpm,
      wins: profile.wins,
      races: profile.totalRaces,
      level: profile.level,
      rankTier: profile.rankTier
    };

    if (existingIndex >= 0) {
      this.leaderboard[existingIndex] = entry;
    } else {
      this.leaderboard.push(entry);
    }

    // Sort by bestWpm descending, then wins
    this.leaderboard.sort((a, b) => b.bestWpm - a.bestWpm || b.wins - a.wins);

    // Assign rank numbers
    this.leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    this.saveLeaderboard();
  }

  getLeaderboard(limit = 20): LeaderboardEntry[] {
    return this.leaderboard.slice(0, limit);
  }

  updateProfileSettings(id: string, updates: Partial<UserProfile>): UserProfile {
    const profile = this.getProfile(id);
    if (updates.username) profile.username = updates.username.slice(0, 24);
    if (updates.avatar) profile.avatar = updates.avatar;
    if (updates.favoriteVehicle) profile.favoriteVehicle = updates.favoriteVehicle;
    if (updates.favoriteTrack) profile.favoriteTrack = updates.favoriteTrack;

    this.profiles.set(id, profile);
    this.saveProfiles();
    this.updateLeaderboardEntry(profile);
    return profile;
  }
}

export const db = new Database();
