import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

// Real Supabase Client instance (if configured)
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Mock Leaderboard matching the UI reference screenshot exactly!
const DEFAULT_LEADERBOARD = [
  { rank: 1, username: 'aryan', avatar_url: '🏎️', best_wpm: 168, total_races: 420, win_rate: 78 },
  { rank: 2, username: 'kero', avatar_url: '⚡', best_wpm: 152, total_races: 398, win_rate: 74 },
  { rank: 3, username: 'nova', avatar_url: '🏁', best_wpm: 158, total_races: 380, win_rate: 71 },
  { rank: 4, username: 'rishi', avatar_url: '👤', best_wpm: 134, total_races: 310, win_rate: 68 },
  { rank: 5, username: 'zen', avatar_url: '🎌', best_wpm: 132, total_races: 298, win_rate: 66 },
  { rank: 6, username: 'rhea', avatar_url: '🌟', best_wpm: 128, total_races: 276, win_rate: 64 },
  { rank: 7, username: 'arlo', avatar_url: '🔥', best_wpm: 126, total_races: 250, win_rate: 61 },
  { rank: 8, username: 'blank', avatar_url: '✨', best_wpm: 122, total_races: 240, win_rate: 59 }
];

// Initial Recent Races matching the UI reference screenshot
const DEFAULT_RECENT_RACES = [
  { id: 'r-1', track: 'Coastal Drive', position: '1st', wpm: 128, time: '02:14', date: 'Just now' },
  { id: 'r-2', track: 'Neon City', position: '3rd', wpm: 112, time: '02:32', date: '2 hours ago' },
  { id: 'r-3', track: 'Mountain Pass', position: '5th', wpm: 104, time: '02:48', date: 'Yesterday' },
  { id: 'r-4', track: 'Desert Run', position: '1st', wpm: 138, time: '02:10', date: '2 days ago' }
];

// Helper to get local storage profile
const getLocalProfile = () => {
  try {
    const data = localStorage.getItem('meanwhile_profile');
    if (data) return JSON.parse(data);
  } catch (e) {}

  return {
    id: 'guest_' + Math.random().toString(36).substring(2, 9),
    username: 'rishi',
    avatar_url: '👤',
    bio: 'Typing today. Racing meanwhile.',
    coins: 2450,
    equipped_vehicle_id: 'vortex',
    equipped_vehicle_paint: '#f8fafc',
    best_wpm: 134,
    average_wpm: 118,
    average_accuracy: 96,
    total_races: 310,
    wins: 211,
    global_rank: 4
  };
};

const saveLocalProfile = (profile) => {
  try {
    localStorage.setItem('meanwhile_profile', JSON.stringify(profile));
  } catch (e) {}
};

// API Surface with Supabase backend and smooth local persistent fallback
export const api = {
  isSupabaseConnected: () => isConfigured,

  // --- AUTHENTICATION ---
  async signUp(email, password, username) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) throw error;
      return data;
    }

    // Mock sign up
    const profile = getLocalProfile();
    profile.username = username || email.split('@')[0];
    saveLocalProfile(profile);
    return { user: { id: profile.id, email } };
  },

  async signIn(email, password) {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    }

    const profile = getLocalProfile();
    return { user: { id: profile.id, email } };
  },

  async signOut() {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser() {
    if (isConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    }
    return null;
  },

  // --- PROFILES ---
  async getProfile(userId) {
    if (isConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error) return data;
      } catch (err) {
        console.warn('Supabase profile fetch fallback:', err);
      }
    }

    return getLocalProfile();
  },

  async updateProfile(userId, updates) {
    if (isConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase profile update fallback:', err);
      }
    }

    const current = getLocalProfile();
    const updated = { ...current, ...updates };
    saveLocalProfile(updated);
    return updated;
  },

  // --- RACE RESULTS ---
  async saveRaceResult(raceData) {
    const profile = getLocalProfile();
    const isWin = raceData.position === 1;

    // Update local profile stats
    profile.total_races += 1;
    if (isWin) profile.wins += 1;
    profile.best_wpm = Math.max(profile.best_wpm || 0, raceData.wpm);
    profile.average_wpm = Math.round(((profile.average_wpm || 100) * (profile.total_races - 1) + raceData.wpm) / profile.total_races);
    profile.coins += isWin ? 150 : 50;

    // Save recent race item
    let recents = DEFAULT_RECENT_RACES;
    try {
      const stored = localStorage.getItem('meanwhile_recent_races');
      if (stored) recents = JSON.parse(stored);
    } catch (e) {}

    const newRecord = {
      id: 'race_' + Date.now(),
      track: raceData.trackName || 'Coastal Drive',
      position: `${raceData.position}${raceData.position === 1 ? 'st' : raceData.position === 2 ? 'nd' : raceData.position === 3 ? 'rd' : 'th'}`,
      wpm: raceData.wpm,
      time: raceData.timeFormatted || '01:45',
      date: 'Just now'
    };

    recents = [newRecord, ...recents.slice(0, 7)];
    try {
      localStorage.setItem('meanwhile_recent_races', JSON.stringify(recents));
    } catch (e) {}

    saveLocalProfile(profile);

    if (isConfigured && supabase) {
      try {
        await supabase.from('race_results').insert({
          user_id: raceData.userId || null,
          username: profile.username,
          track_id: raceData.trackId,
          game_mode: raceData.mode || 'quick_race',
          vehicle_id: raceData.vehicleId,
          wpm: raceData.wpm,
          accuracy: raceData.accuracy,
          time_seconds: raceData.timeSeconds,
          position: raceData.position,
          total_racers: raceData.totalRacers || 8
        });
      } catch (err) {
        console.warn('Supabase race_results insert fallback:', err);
      }
    }

    return { profile, recents };
  },

  // --- LEADERBOARDS ---
  async getLeaderboard(period = 'all_time') {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('leaderboard_all_time')
          .select('*')
          .limit(20);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase leaderboard fetch fallback:', err);
      }
    }

    // Return reference design leaderboard
    const profile = getLocalProfile();
    return DEFAULT_LEADERBOARD.map(item => {
      if (item.username === 'rishi') {
        return {
          ...item,
          best_wpm: Math.max(item.best_wpm, profile.best_wpm),
          total_races: profile.total_races,
          win_rate: profile.total_races > 0 ? Math.round((profile.wins / profile.total_races) * 100) : item.win_rate
        };
      }
      return item;
    });
  },

  // --- RECENT RACES ---
  async getRecentRaces(userId, limit = 5) {
    try {
      const stored = localStorage.getItem('meanwhile_recent_races');
      if (stored) return JSON.parse(stored).slice(0, limit);
    } catch (e) {}
    return DEFAULT_RECENT_RACES.slice(0, limit);
  }
};
