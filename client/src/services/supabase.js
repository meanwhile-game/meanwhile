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
  let profile = null;
  try {
    const data = localStorage.getItem('meanwhile_profile');
    if (data) profile = JSON.parse(data);
  } catch (e) {}

  if (!profile) {
    profile = {
      id: 'user_rishi',
      username: 'rishi',
      avatar_url: '👤',
      avatar: '👤',
      bio: 'Typing today. Racing meanwhile.',
      coins: 2450,
      equipped_vehicle_id: 'vortex',
      equipped_vehicle_paint: '#f8fafc',
      best_wpm: 134,
      bestWpm: 134,
      average_wpm: 118,
      averageWpm: 118,
      average_accuracy: 96,
      accuracy: 96,
      total_races: 310,
      totalRaces: 310,
      wins: 211,
      global_rank: 4,
      globalRank: 4
    };
  }

  // Ensure both camelCase and snake_case are present
  profile.averageWpm = profile.averageWpm || profile.average_wpm || 118;
  profile.average_wpm = profile.averageWpm;
  profile.bestWpm = profile.bestWpm || profile.best_wpm || 134;
  profile.best_wpm = profile.bestWpm;
  profile.totalRaces = profile.totalRaces || profile.total_races || 310;
  profile.total_races = profile.totalRaces;
  profile.accuracy = profile.accuracy || profile.average_accuracy || 96;
  profile.globalRank = profile.globalRank || profile.global_rank || 4;

  return profile;
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

  // --- RACE RESULTS & OVERALL AVERAGE WPM ---
  async saveRaceResult(raceData) {
    const profile = getLocalProfile();
    const isWin = raceData.position === 1;

    // Load full race history to compute true all-race ending average WPM
    let raceHistory = [];
    try {
      const stored = localStorage.getItem('meanwhile_race_history');
      if (stored) raceHistory = JSON.parse(stored);
    } catch (e) {}

    if (raceHistory.length === 0) {
      raceHistory = [
        { id: 'h-1', wpm: 128, accuracy: 98, track: 'Coastal Circuit', position: 1, date: 'Earlier today' },
        { id: 'h-2', wpm: 112, accuracy: 96, track: 'City Circuit', position: 2, date: 'Yesterday' },
        { id: 'h-3', wpm: 118, accuracy: 95, track: 'Mountain Circuit', position: 3, date: '2 days ago' },
        { id: 'h-4', wpm: 114, accuracy: 97, track: 'Snow Circuit', position: 1, date: '3 days ago' }
      ];
    }

    const newRecord = {
      id: 'race_' + Date.now(),
      track: raceData.trackName || 'Coastal Circuit',
      position: `${raceData.position}${raceData.position === 1 ? 'st' : raceData.position === 2 ? 'nd' : raceData.position === 3 ? 'rd' : 'th'}`,
      wpm: raceData.wpm,
      accuracy: raceData.accuracy,
      time: raceData.timeFormatted || '01:45',
      date: 'Just now'
    };

    raceHistory = [newRecord, ...raceHistory];
    try {
      localStorage.setItem('meanwhile_race_history', JSON.stringify(raceHistory));
    } catch (e) {}

    // Calculate mathematically exact overall average WPM across all race finishes
    const totalWpmSum = raceHistory.reduce((acc, r) => acc + (Number(r.wpm) || 0), 0);
    const overallAverageWpm = Math.round(totalWpmSum / raceHistory.length);

    // Update profile
    profile.total_races = (profile.total_races || 0) + 1;
    profile.totalRaces = profile.total_races;
    if (isWin) profile.wins = (profile.wins || 0) + 1;
    profile.best_wpm = Math.max(profile.best_wpm || 0, raceData.wpm);
    profile.bestWpm = profile.best_wpm;
    profile.average_wpm = overallAverageWpm;
    profile.averageWpm = overallAverageWpm;
    profile.accuracy = raceData.accuracy || profile.accuracy || 96;
    profile.coins = (profile.coins || 0) + (isWin ? 150 : 50);

    saveLocalProfile(profile);

    // Update recent races for UI
    try {
      localStorage.setItem('meanwhile_recent_races', JSON.stringify(raceHistory.slice(0, 8)));
    } catch (e) {}

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

    return { profile, recents: raceHistory.slice(0, 8), overallAverageWpm };
  },

  // Get all race history
  getRaceHistory() {
    try {
      const stored = localStorage.getItem('meanwhile_race_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'h-1', wpm: 128, accuracy: 98, track: 'Coastal Circuit', position: 1, date: 'Earlier today' },
      { id: 'h-2', wpm: 112, accuracy: 96, track: 'City Circuit', position: 2, date: 'Yesterday' },
      { id: 'h-3', wpm: 118, accuracy: 95, track: 'Mountain Circuit', position: 3, date: '2 days ago' },
      { id: 'h-4', wpm: 114, accuracy: 97, track: 'Snow Circuit', position: 1, date: '3 days ago' }
    ];
  },

  // Get overall average WPM across all recorded race endings
  getOverallAverageWpm() {
    const history = this.getRaceHistory();
    if (!history || history.length === 0) return 118;
    const sum = history.reduce((acc, r) => acc + (Number(r.wpm) || 0), 0);
    return Math.round(sum / history.length);
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
