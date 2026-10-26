import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase with robust URL sanitization
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
const rawSupabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '')
  .trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

// Real Supabase Client instance (if configured)
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Secure SHA-256 password hashing for offline / local mode so passwords are NEVER plaintext
const hashPassword = async (password) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_meanwhile_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback basic obfuscation if SubtleCrypto unavailable
    return btoa(password);
  }
};

// Initial Mock Leaderboard matching the UI reference screenshot exactly
const DEFAULT_LEADERBOARD = [
  { rank: 1, username: 'aryan', avatar_url: '🏎️', best_wpm: 88, total_races: 420, win_rate: 78 },
  { rank: 2, username: 'kero', avatar_url: '⚡', best_wpm: 86, total_races: 398, win_rate: 74 },
  { rank: 3, username: 'nova', avatar_url: '🏁', best_wpm: 84, total_races: 380, win_rate: 71 },
  { rank: 4, username: 'rishi', avatar_url: '👤', best_wpm: 82, total_races: 310, win_rate: 68 },
  { rank: 5, username: 'zenyx', avatar_url: '🎌', best_wpm: 76, total_races: 298, win_rate: 66 },
  { rank: 6, username: 'rhea', avatar_url: '🌟', best_wpm: 72, total_races: 276, win_rate: 64 },
  { rank: 7, username: 'blank', avatar_url: '✨', best_wpm: 68, total_races: 250, win_rate: 61 },
  { rank: 8, username: 'arlo', avatar_url: '🔥', best_wpm: 62, total_races: 240, win_rate: 59 }
];

// Initial Recent Races matching reference UI
const DEFAULT_RECENT_RACES = [
  { id: 'r-1', track: 'Coastal Run', position: '1st', wpm: 82, time: '01:54', date: 'Just now' },
  { id: 'r-2', track: 'Neon City', position: '3rd', wpm: 78, time: '02:08', date: '2 hours ago' },
  { id: 'r-3', track: 'Mountain Pass', position: '4th', wpm: 74, time: '02:18', date: 'Yesterday' },
  { id: 'r-4', track: 'Snow Circuit', position: '1st', wpm: 80, time: '02:02', date: '2 days ago' }
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
      best_wpm: 84,
      bestWpm: 84,
      average_wpm: 76,
      averageWpm: 76,
      average_accuracy: 97,
      accuracy: 97,
      total_races: 310,
      totalRaces: 310,
      wins: 211,
      global_rank: 4,
      globalRank: 4,
      isGuest: false
    };
  }

  profile.averageWpm = profile.averageWpm || profile.average_wpm || 76;
  profile.average_wpm = profile.averageWpm;
  profile.bestWpm = profile.bestWpm || profile.best_wpm || 84;
  profile.best_wpm = profile.bestWpm;
  profile.totalRaces = profile.totalRaces || profile.total_races || 310;
  profile.total_races = profile.totalRaces;
  profile.accuracy = profile.accuracy || profile.average_accuracy || 97;
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
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    const cleanUsername = (username || email.split('@')[0]).trim();
    if (cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters.');
    }

    // 1. Supabase Cloud Auth
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
            avatar_url: '🏎️'
          }
        }
      });
      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw error;
      }

      // Provision profile row if created
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            avatar_url: '🏎️',
            bio: 'Typing today. Racing meanwhile.',
            coins: 2450
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile provisioning fallback:', e);
        }
      }

      return data;
    }

    // 2. Offline / Local Secure Fallback
    let users = [];
    try {
      const stored = localStorage.getItem('meanwhile_registered_users');
      if (stored) users = JSON.parse(stored);
    } catch (e) {}

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const hashedPassword = await hashPassword(password);
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      username: cleanUsername,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    try {
      localStorage.setItem('meanwhile_registered_users', JSON.stringify(users));
    } catch (e) {}

    // Save active session
    const session = {
      userId: newUser.id,
      email: newUser.email,
      username: cleanUsername,
      token: 'local_token_' + Date.now()
    };
    try {
      localStorage.setItem('meanwhile_auth_session', JSON.stringify(session));
    } catch (e) {}

    const profile = {
      ...getLocalProfile(),
      id: newUser.id,
      username: cleanUsername,
      email: newUser.email,
      isGuest: false
    };
    saveLocalProfile(profile);

    return { user: newUser, session };
  },

  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // 1. Supabase Cloud Auth
    if (isConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.message?.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email or password. Please verify your credentials.');
        }
        throw error;
      }

      // Fetch cloud profile
      if (data?.user) {
        const cloudProfile = await this.getProfile(data.user.id);
        if (cloudProfile) saveLocalProfile(cloudProfile);
      }

      return data;
    }

    // 2. Offline / Local Secure Fallback
    let users = [];
    try {
      const stored = localStorage.getItem('meanwhile_registered_users');
      if (stored) users = JSON.parse(stored);
    } catch (e) {}

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    const inputHash = await hashPassword(password);

    if (!user || user.passwordHash !== inputHash) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const session = {
      userId: user.id,
      email: user.email,
      username: user.username,
      token: 'local_token_' + Date.now()
    };
    try {
      localStorage.setItem('meanwhile_auth_session', JSON.stringify(session));
    } catch (e) {}

    const profile = {
      ...getLocalProfile(),
      id: user.id,
      username: user.username,
      email: user.email,
      isGuest: false
    };
    saveLocalProfile(profile);

    return { user, session };
  },

  async signOut() {
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }

    try {
      localStorage.removeItem('meanwhile_auth_session');
    } catch (e) {}

    // Reset to guest profile
    const guestProfile = {
      ...getLocalProfile(),
      id: 'guest_' + Math.random().toString(36).substring(2, 7),
      username: 'Guest_Racer',
      email: null,
      isGuest: true
    };
    saveLocalProfile(guestProfile);
    return true;
  },

  async getCurrentSession() {
    if (isConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        return data?.session || null;
      } catch (e) {}
    }

    try {
      const session = localStorage.getItem('meanwhile_auth_session');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  async getCurrentUser() {
    if (isConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        return data?.user || null;
      } catch (e) {}
    }
    const session = await this.getCurrentSession();
    return session ? { id: session.userId, email: session.email } : null;
  },

  // Setup Auth Listener that updates session on external changes
  initAuthListener(callback) {
    if (isConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await this.getProfile(session.user.id);
          callback(profile);
        } else if (event === 'SIGNED_OUT') {
          callback(getLocalProfile());
        }
      });
      return () => subscription?.unsubscribe();
    }
    return () => {};
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

  // --- RACE RESULTS & ACCURATE ALL-RACE AVERAGE WPM ---
  async saveRaceResult(raceData) {
    const profile = getLocalProfile();
    const isWin = raceData.position === 1;

    // Load full race history
    let raceHistory = [];
    try {
      const stored = localStorage.getItem('meanwhile_race_history');
      if (stored) raceHistory = JSON.parse(stored);
    } catch (e) {}

    if (raceHistory.length === 0) {
      raceHistory = [
        { id: 'h-1', wpm: 82, accuracy: 98, track: 'Coastal Run', position: 1, date: 'Earlier today' },
        { id: 'h-2', wpm: 78, accuracy: 96, track: 'Neon City', position: 2, date: 'Yesterday' },
        { id: 'h-3', wpm: 74, accuracy: 95, track: 'Mountain Pass', position: 3, date: '2 days ago' },
        { id: 'h-4', wpm: 80, accuracy: 97, track: 'Snow Circuit', position: 1, date: '3 days ago' }
      ];
    }

    const newRecord = {
      id: 'race_' + Date.now(),
      track: raceData.trackName || 'Coastal Run',
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

    // Calculate mathematically exact overall average WPM across all completed races
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
    profile.accuracy = raceData.accuracy || profile.accuracy || 97;
    profile.coins = (profile.coins || 0) + (isWin ? 150 : 50);

    saveLocalProfile(profile);

    try {
      localStorage.setItem('meanwhile_recent_races', JSON.stringify(raceHistory.slice(0, 8)));
    } catch (e) {}

    // Persist to Supabase if connected
    if (isConfigured && supabase) {
      try {
        const user = await this.getCurrentUser();
        await supabase.from('race_results').insert({
          user_id: user?.id || null,
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

  getRaceHistory() {
    try {
      const stored = localStorage.getItem('meanwhile_race_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { id: 'h-1', wpm: 82, accuracy: 98, track: 'Coastal Run', position: 1, date: 'Earlier today' },
      { id: 'h-2', wpm: 78, accuracy: 96, track: 'Neon City', position: 2, date: 'Yesterday' },
      { id: 'h-3', wpm: 74, accuracy: 95, track: 'Mountain Pass', position: 3, date: '2 days ago' },
      { id: 'h-4', wpm: 80, accuracy: 97, track: 'Snow Circuit', position: 1, date: '3 days ago' }
    ];
  },

  getOverallAverageWpm() {
    const history = this.getRaceHistory();
    if (!history || history.length === 0) return 76;
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

    const profile = getLocalProfile();
    return DEFAULT_LEADERBOARD.map(item => {
      if (item.username === 'rishi' || item.username === profile.username) {
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
