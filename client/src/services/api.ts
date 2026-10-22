const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

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
  recentRaces: {
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
  }[];
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

export async function fetchProfile(id: string, defaultUsername?: string, defaultAvatar?: string): Promise<UserProfile> {
  try {
    const query = new URLSearchParams();
    if (defaultUsername) query.set('username', defaultUsername);
    if (defaultAvatar) query.set('avatar', defaultAvatar);

    const res = await fetch(`${SERVER_URL}/api/profile/${id}?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  } catch (err) {
    // Fallback local profile if server temporarily unreachable
    return {
      id,
      username: defaultUsername || 'ApexRacer',
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
  }
}

export async function updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${SERVER_URL}/api/profile/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return await res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${SERVER_URL}/api/leaderboard?limit=25`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return await res.json();
  } catch (err) {
    return [];
  }
}
