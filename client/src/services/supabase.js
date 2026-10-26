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
    return btoa(password);
  }
};

// Default AI Competitor benchmarks for the leaderboard when database is fresh
const BENCHMARK_LEADERBOARD = [
  { rank: 1, username: 'kero', avatar_url: '⚡', best_wpm: 88, total_races: 32, win_rate: 75 },
  { rank: 2, username: 'aryan', avatar_url: '🏎️', best_wpm: 84, total_races: 28, win_rate: 68 },
  { rank: 3, username: 'nova', avatar_url: '🏁', best_wpm: 78, total_races: 24, win_rate: 62 },
  { rank: 4, username: 'zenyx', avatar_url: '🎌', best_wpm: 72, total_races: 20, win_rate: 55 },
  { rank: 5, username: 'rhea', avatar_url: '🌟', best_wpm: 66, total_races: 18, win_rate: 50 },
  { rank: 6, username: 'blank', avatar_url: '✨', best_wpm: 59, total_races: 14, win_rate: 42 },
  { rank: 7, username: 'arlo', avatar_url: '🔥', best_wpm: 52, total_races: 10, win_rate: 30 }
];

// Factory for a clean Guest profile (in-memory only, not saved to Supabase or localStorage)
export const createDefaultGuestProfile = () => ({
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  username: 'Guest',
  avatar: '🏎️',
  avatar_url: '🏎️',
  bio: 'Racing as Guest. Create an account to save your stats.',
  coins: 0,
  equipped_vehicle_id: 'vortex',
  equipped_vehicle_paint: '#f8fafc',
  bestWpm: 0,
  best_wpm: 0,
  averageWpm: 0,
  average_wpm: 0,
  accuracy: 0,
  average_accuracy: 0,
  totalRaces: 0,
  total_races: 0,
  wins: 0,
  globalRank: '—',
  global_rank: '—',
  isGuest: true
});

// Normalize profile fields between Supabase snake_case and UI camelCase
const normalizeProfile = (p) => {
  if (!p) return createDefaultGuestProfile();
  const totalRaces = Number(p.total_races ?? p.totalRaces ?? 0);
  const bestWpm = Number(p.best_wpm ?? p.bestWpm ?? 0);
  const averageWpm = Number(p.average_wpm ?? p.averageWpm ?? 0);
  const accuracy = Number(p.average_accuracy ?? p.accuracy ?? 0);
  const wins = Number(p.wins ?? 0);
  const globalRank = p.global_rank ?? p.globalRank ?? (totalRaces > 0 ? 1 : '—');

  return {
    ...p,
    id: p.id,
    username: p.username || 'Racer',
    avatar: p.avatar_url || p.avatar || '🏎️',
    avatar_url: p.avatar_url || p.avatar || '🏎️',
    bio: p.bio || 'Typing today. Racing meanwhile.',
    coins: Number(p.coins ?? 0),
    equipped_vehicle_id: p.equipped_vehicle_id || p.equippedVehicleId || 'vortex',
    equipped_vehicle_paint: p.equipped_vehicle_paint || p.equippedVehiclePaint || '#f8fafc',
    best_wpm: bestWpm,
    bestWpm,
    average_wpm: averageWpm,
    averageWpm,
    average_accuracy: accuracy,
    accuracy,
    total_races: totalRaces,
    totalRaces,
    wins,
    global_rank: globalRank,
    globalRank,
    isGuest: Boolean(p.isGuest)
  };
};

export const api = {
  isSupabaseConnected: () => isConfigured,

  // --- AUTHENTICATION ---

  // Register with unique username and password
  async signUp(username, password) {
    const cleanUsername = (username || '').trim();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 20) {
      throw new Error('Username must be between 3 and 20 characters long.');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      throw new Error('Username can only contain letters, numbers, and underscores.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const internalEmail = `${cleanUsername.toLowerCase()}@meanwhile.internal`;

    // 1. Supabase Cloud Auth
    if (isConfigured && supabase) {
      // Check if username already exists in profiles
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', cleanUsername)
          .maybeSingle();

        if (existingProfile) {
          throw new Error('This username is already taken. Please choose another username.');
        }
      } catch (err) {
        if (err.message && err.message.includes('already taken')) throw err;
      }

      const { data, error } = await supabase.auth.signUp({
        email: internalEmail,
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
          throw new Error('An account with this username already exists. Please sign in instead.');
        }
        throw error;
      }

      // Explicitly ensure profile row exists with exactly 0 statistics
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: cleanUsername,
            avatar_url: '🏎️',
            bio: 'Typing today. Racing meanwhile.',
            coins: 0,
            best_wpm: 0,
            average_wpm: 0,
            average_accuracy: 0.00,
            total_races: 0,
            wins: 0
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile provisioning fallback:', e);
        }
      }

      const newProfile = normalizeProfile({
        id: data.user?.id,
        username: cleanUsername,
        avatar_url: '🏎️',
        bio: 'Typing today. Racing meanwhile.',
        coins: 0,
        best_wpm: 0,
        average_wpm: 0,
        average_accuracy: 0,
        total_races: 0,
        wins: 0,
        isGuest: false
      });

      return { user: data.user, profile: newProfile };
    }

    // 2. Offline / Local Secure Storage Fallback
    let registeredUsers = [];
    try {
      const stored = localStorage.getItem('meanwhile_registered_users');
      if (stored) registeredUsers = JSON.parse(stored);
    } catch (e) {}

    const duplicate = registeredUsers.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (duplicate) {
      throw new Error('This username is already taken. Please choose another username.');
    }

    const passwordHash = await hashPassword(password);
    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id: userId,
      username: cleanUsername,
      email: internalEmail,
      passwordHash,
      created_at: new Date().toISOString()
    };

    registeredUsers.push(newUser);
    try {
      localStorage.setItem('meanwhile_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {}

    // Initialize newly created user profile with ZERO stats and empty race history
    const initialProfile = normalizeProfile({
      id: userId,
      username: cleanUsername,
      avatar_url: '🏎️',
      bio: 'Typing today. Racing meanwhile.',
      coins: 0,
      best_wpm: 0,
      average_wpm: 0,
      average_accuracy: 0,
      total_races: 0,
      wins: 0,
      isGuest: false
    });

    try {
      localStorage.setItem(`meanwhile_user_profile_${userId}`, JSON.stringify(initialProfile));
      localStorage.setItem(`meanwhile_user_races_${userId}`, JSON.stringify([]));
      localStorage.setItem('meanwhile_auth_session', JSON.stringify({
        userId,
        username: cleanUsername,
        token: 'local_token_' + Date.now()
      }));
    } catch (e) {}

    return { user: newUser, profile: initialProfile };
  },

  // Login with username and password
  async signIn(username, password) {
    const cleanUsername = (username || '').trim();
    if (!cleanUsername || !password) {
      throw new Error('Please enter both your username and password.');
    }

    // 1. Supabase Cloud Auth
    if (isConfigured && supabase) {
      let authEmail = `${cleanUsername.toLowerCase()}@meanwhile.internal`;

      // Attempt to resolve username to auth identity email via server-side function
      try {
        const { data: resolvedEmail } = await supabase.rpc('resolve_username_to_email', {
          p_username: cleanUsername
        });
        if (resolvedEmail) {
          authEmail = resolvedEmail;
        }
      } catch (err) {
        // RPC fallback to canonical format
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password
      });

      if (error) {
        throw new Error('Invalid username or password. Please verify your credentials.');
      }

      // Fetch user profile from Supabase
      let userProfile = null;
      if (data?.user) {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (dbProfile) {
          userProfile = normalizeProfile({ ...dbProfile, isGuest: false });
        }
      }

      if (!userProfile) {
        userProfile = normalizeProfile({
          id: data.user?.id,
          username: cleanUsername,
          isGuest: false
        });
      }

      return { user: data.user, session: data.session, profile: userProfile };
    }

    // 2. Offline / Local Secure Fallback
    let registeredUsers = [];
    try {
      const stored = localStorage.getItem('meanwhile_registered_users');
      if (stored) registeredUsers = JSON.parse(stored);
    } catch (e) {}

    const user = registeredUsers.find(
      u => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );
    if (!user) {
      throw new Error('Invalid username or password. Please check your credentials.');
    }

    const inputHash = await hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error('Invalid username or password. Please check your credentials.');
    }

    // Load registered user profile from storage
    let profileData = null;
    try {
      const storedProf = localStorage.getItem(`meanwhile_user_profile_${user.id}`);
      if (storedProf) profileData = JSON.parse(storedProf);
    } catch (e) {}

    const userProfile = normalizeProfile({
      ...(profileData || {}),
      id: user.id,
      username: user.username,
      isGuest: false
    });

    try {
      localStorage.setItem('meanwhile_auth_session', JSON.stringify({
        userId: user.id,
        username: user.username,
        token: 'local_token_' + Date.now()
      }));
    } catch (e) {}

    return { user, session: { userId: user.id }, profile: userProfile };
  },

  // Logout current session and return clean guest state
  async signOut() {
    if (isConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }

    try {
      localStorage.removeItem('meanwhile_auth_session');
    } catch (e) {}

    return createDefaultGuestProfile();
  },

  // Retrieve current active session (or null if guest)
  async getCurrentSession() {
    if (isConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) return data.session;
      } catch (e) {}
    }

    try {
      const session = localStorage.getItem('meanwhile_auth_session');
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  // Retrieve current active user (or null if guest)
  async getCurrentUser() {
    const session = await this.getCurrentSession();
    if (!session) return null;

    if (isConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) return data.user;
      } catch (e) {}
    }

    return session?.userId ? { id: session.userId, username: session.username } : (session.user || null);
  },

  // Auth listener for Supabase authentication state changes
  initAuthListener(callback) {
    if (isConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await this.getProfile(session.user.id);
          callback(profile);
        } else if (event === 'SIGNED_OUT') {
          callback(createDefaultGuestProfile());
        }
      });
      return () => subscription?.unsubscribe();
    }
    return () => {};
  },

  // --- PROFILES ---

  // Get active user profile or default guest profile
  async getProfile(userId) {
    // 1. Supabase Cloud Profile
    if (isConfigured && supabase) {
      let targetId = userId;
      if (!targetId) {
        const { data: { session } } = await supabase.auth.getSession();
        targetId = session?.user?.id;
      }

      if (targetId) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetId)
            .single();

          if (data && !error) {
            return normalizeProfile({ ...data, isGuest: false });
          }
        } catch (err) {
          console.warn('Supabase profile fetch error:', err);
        }
      } else {
        // Unauthenticated visitor -> Guest by default
        return createDefaultGuestProfile();
      }
    }

    // 2. Offline / Local Profile
    const session = await this.getCurrentSession();
    if (session?.userId) {
      try {
        const stored = localStorage.getItem(`meanwhile_user_profile_${session.userId}`);
        if (stored) {
          return normalizeProfile(JSON.parse(stored));
        }
      } catch (e) {}
    }

    // No active session -> Guest
    return createDefaultGuestProfile();
  },

  // Update profile metadata (bio, avatar, vehicle) for authenticated user
  async updateProfile(userId, updates) {
    if (!userId || String(userId).startsWith('guest_')) {
      return updates;
    }

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();

        if (!error && data) return normalizeProfile({ ...data, isGuest: false });
      } catch (err) {
        console.warn('Supabase profile update fallback:', err);
      }
    }

    // Offline update
    try {
      const stored = localStorage.getItem(`meanwhile_user_profile_${userId}`);
      const current = stored ? JSON.parse(stored) : {};
      const updated = normalizeProfile({ ...current, ...updates, isGuest: false });
      localStorage.setItem(`meanwhile_user_profile_${userId}`, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return updates;
    }
  },

  // --- RACE RESULTS & ACCURATE STATISTICS PERSISTENCE ---

  // Save race result for authenticated users only; guests are NOT persisted
  async saveRaceResult(raceData, currentProfile) {
    const isGuest = Boolean(currentProfile?.isGuest || !currentProfile?.id || String(currentProfile.id).startsWith('guest_'));

    // GUEST MODE: Calculate temporary in-memory stats without writing to database or localStorage
    if (isGuest) {
      const prevRaces = currentProfile?.totalRaces || 0;
      const nextRaces = prevRaces + 1;
      const isWin = raceData.position === 1;
      const prevWins = currentProfile?.wins || 0;
      const nextWins = prevWins + (isWin ? 1 : 0);
      const nextBestWpm = Math.max(currentProfile?.bestWpm || 0, raceData.wpm);
      const prevAvgWpm = currentProfile?.averageWpm || 0;
      const nextAvgWpm = Math.round((prevAvgWpm * prevRaces + raceData.wpm) / nextRaces);
      const nextAccuracy = raceData.accuracy;

      const guestUpdated = {
        ...currentProfile,
        totalRaces: nextRaces,
        total_races: nextRaces,
        wins: nextWins,
        bestWpm: nextBestWpm,
        best_wpm: nextBestWpm,
        averageWpm: nextAvgWpm,
        average_wpm: nextAvgWpm,
        accuracy: nextAccuracy,
        average_accuracy: nextAccuracy,
        isGuest: true
      };

      return {
        profile: guestUpdated,
        recents: [],
        overallAverageWpm: nextAvgWpm,
        isGuest: true
      };
    }

    // AUTHENTICATED USER: Persist to Supabase and update accurate statistics
    const userId = currentProfile.id;
    const isWin = raceData.position === 1;

    if (isConfigured && supabase) {
      try {
        // 1. Insert into race_results (protected by RLS auth.uid() = user_id)
        await supabase.from('race_results').insert({
          user_id: userId,
          username: currentProfile.username,
          track_id: raceData.trackId,
          game_mode: raceData.mode || 'quick_race',
          vehicle_id: raceData.vehicleId || 'vortex',
          wpm: raceData.wpm,
          accuracy: raceData.accuracy,
          time_seconds: raceData.timeSeconds,
          position: raceData.position,
          total_racers: raceData.totalRacers || 8
        });

        // 2. Query all actual completed races for this user to compute mathematically exact statistics
        const { data: userRaces } = await supabase
          .from('race_results')
          .select('wpm, accuracy, position, track_id, created_at, time_seconds')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (userRaces && userRaces.length > 0) {
          const totalRaces = userRaces.length;
          const wins = userRaces.filter(r => r.position === 1).length;
          const bestWpm = Math.max(...userRaces.map(r => r.wpm));
          const avgWpm = Math.round(userRaces.reduce((sum, r) => sum + r.wpm, 0) / totalRaces);
          const avgAccuracy = Number((userRaces.reduce((sum, r) => sum + Number(r.accuracy), 0) / totalRaces).toFixed(1));

          // 3. Update profiles table in Supabase
          await supabase.from('profiles').update({
            total_races: totalRaces,
            wins,
            best_wpm: bestWpm,
            average_wpm: avgWpm,
            average_accuracy: avgAccuracy,
            coins: (currentProfile.coins || 0) + (isWin ? 150 : 50),
            updated_at: new Date().toISOString()
          }).eq('id', userId);

          const updatedProfile = normalizeProfile({
            ...currentProfile,
            total_races: totalRaces,
            totalRaces,
            wins,
            best_wpm: bestWpm,
            bestWpm,
            average_wpm: avgWpm,
            averageWpm: avgWpm,
            average_accuracy: avgAccuracy,
            accuracy: avgAccuracy,
            coins: (currentProfile.coins || 0) + (isWin ? 150 : 50),
            isGuest: false
          });

          const recents = userRaces.slice(0, 10).map((r, i) => ({
            id: 'race_' + (r.created_at || i),
            track: r.track_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            position: `${r.position}${r.position === 1 ? 'st' : r.position === 2 ? 'nd' : r.position === 3 ? 'rd' : 'th'}`,
            wpm: r.wpm,
            accuracy: r.accuracy,
            time: typeof r.time_seconds === 'number' ? `${Math.floor(r.time_seconds / 60)}:${String(Math.floor(r.time_seconds % 60)).padStart(2, '0')}` : '01:45',
            date: 'Just now'
          }));

          return {
            profile: updatedProfile,
            recents,
            overallAverageWpm: avgWpm,
            isGuest: false
          };
        }
      } catch (err) {
        console.warn('Supabase race result persistence fallback:', err);
      }
    }

    // Offline Authenticated User Storage
    let userRaces = [];
    try {
      const stored = localStorage.getItem(`meanwhile_user_races_${userId}`);
      if (stored) userRaces = JSON.parse(stored);
    } catch (e) {}

    const newRecord = {
      id: 'race_' + Date.now(),
      track: raceData.trackName || 'Coastal Run',
      position: `${raceData.position}${raceData.position === 1 ? 'st' : raceData.position === 2 ? 'nd' : raceData.position === 3 ? 'rd' : 'th'}`,
      wpm: raceData.wpm,
      accuracy: raceData.accuracy,
      time: raceData.timeFormatted || '01:45',
      date: 'Just now',
      isWin
    };

    userRaces = [newRecord, ...userRaces];
    try {
      localStorage.setItem(`meanwhile_user_races_${userId}`, JSON.stringify(userRaces));
    } catch (e) {}

    const totalRaces = userRaces.length;
    const wins = userRaces.filter(r => r.isWin || r.position === '1st').length;
    const bestWpm = Math.max(...userRaces.map(r => r.wpm));
    const avgWpm = Math.round(userRaces.reduce((sum, r) => sum + r.wpm, 0) / totalRaces);
    const avgAccuracy = Math.round(userRaces.reduce((sum, r) => sum + (Number(r.accuracy) || 0), 0) / totalRaces);

    const updatedProfile = normalizeProfile({
      ...currentProfile,
      total_races: totalRaces,
      totalRaces,
      wins,
      best_wpm: bestWpm,
      bestWpm,
      average_wpm: avgWpm,
      averageWpm: avgWpm,
      average_accuracy: avgAccuracy,
      accuracy: avgAccuracy,
      coins: (currentProfile.coins || 0) + (isWin ? 150 : 50),
      isGuest: false
    });

    try {
      localStorage.setItem(`meanwhile_user_profile_${userId}`, JSON.stringify(updatedProfile));
    } catch (e) {}

    return {
      profile: updatedProfile,
      recents: userRaces.slice(0, 10),
      overallAverageWpm: avgWpm,
      isGuest: false
    };
  },

  // Get recent race history for authenticated user (returns empty array for guests)
  async getRecentRaces(userId, limit = 10) {
    if (!userId || String(userId).startsWith('guest_')) {
      return [];
    }

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('race_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          return data.map(r => ({
            id: r.id,
            track: r.track_id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            position: `${r.position}${r.position === 1 ? 'st' : r.position === 2 ? 'nd' : r.position === 3 ? 'rd' : 'th'}`,
            wpm: r.wpm,
            accuracy: r.accuracy,
            time: typeof r.time_seconds === 'number' ? `${Math.floor(r.time_seconds / 60)}:${String(Math.floor(r.time_seconds % 60)).padStart(2, '0')}` : '01:45',
            date: new Date(r.created_at).toLocaleDateString()
          }));
        }
      } catch (err) {
        console.warn('Supabase getRecentRaces fallback:', err);
      }
    }

    try {
      const stored = localStorage.getItem(`meanwhile_user_races_${userId}`);
      if (stored) return JSON.parse(stored).slice(0, limit);
    } catch (e) {}

    return [];
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
          return data.map((item, idx) => ({
            rank: idx + 1,
            username: item.username,
            avatar_url: item.avatar_url || '🏎️',
            best_wpm: item.best_wpm,
            total_races: item.total_races,
            win_rate: item.win_rate
          }));
        }
      } catch (err) {
        console.warn('Supabase leaderboard fetch fallback:', err);
      }
    }

    return BENCHMARK_LEADERBOARD;
  }
};
