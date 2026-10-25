import { create } from 'zustand';
import { TRACKS, getTrackById } from '../data/tracks.js';
import { VEHICLES, getVehicleById } from '../data/vehicles.js';
import { PASSAGES, getRandomPassage } from '../data/passages.js';
import { soundEngine } from '../sound/soundEngine.js';
import { api } from '../services/supabase.js';

// Default 7 AI bot racers matching the reference UI leaderboard!
const BOT_DRIVERS = [
  { id: 'bot-1', name: 'kero', avatar: '⚡', targetWpm: 128, lane: 1 },
  { id: 'bot-2', name: 'aryan', avatar: '🏎️', targetWpm: 116, lane: 0 },
  { id: 'bot-3', name: 'nova', avatar: '🏁', targetWpm: 112, lane: -1 },
  { id: 'bot-4', name: 'zenyx', avatar: '🎌', targetWpm: 98, lane: 0.5 },
  { id: 'bot-5', name: 'rhea', avatar: '🌟', targetWpm: 94, lane: -0.5 },
  { id: 'bot-6', name: 'blank', avatar: '✨', targetWpm: 91, lane: 1 },
  { id: 'bot-7', name: 'arlo', avatar: '🔥', targetWpm: 86, lane: -1 }
];

export const useGameStore = create((set, get) => ({
  // Navigation & Views
  view: 'home', // 'home' | 'tracks' | 'garage' | 'racing' | 'results' | 'leaderboard' | 'profile'
  setView: (newView) => {
    soundEngine.playButtonClick();
    set({ view: newView });
  },

  // Modals
  authModalOpen: false,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  multiplayerModalOpen: false,
  setMultiplayerModalOpen: (open) => set({ multiplayerModalOpen: open }),

  // Configuration & Monetization
  enableAds: import.meta.env.VITE_ENABLE_ADS === 'true',
  setEnableAds: (enabled) => set({ enableAds: enabled }),

  // User Profile
  profile: {
    id: 'user_rishi',
    username: 'rishi',
    avatar: '👤',
    bio: 'Typing today. Racing meanwhile.',
    coins: 2450,
    bestWpm: 134,
    averageWpm: 118,
    accuracy: 68,
    totalRaces: 310,
    globalRank: 4
  },
  setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),

  // Machine & Track Selection
  selectedTrackId: 'coastal-drive',
  setSelectedTrackId: (id) => {
    soundEngine.playButtonClick();
    set({ selectedTrackId: id });
  },

  selectedVehicleId: 'vortex',
  setSelectedVehicleId: (id) => {
    soundEngine.playButtonClick();
    set({ selectedVehicleId: id });
  },

  selectedPaint: '#f8fafc',
  setSelectedPaint: (hex) => {
    soundEngine.playButtonClick();
    set({ selectedPaint: hex });
  },

  gameMode: 'quick_race', // 'quick_race' | 'multiplayer' | 'private_room' | 'time_trial'
  setGameMode: (mode) => {
    soundEngine.playButtonClick();
    set({ gameMode: mode });
  },

  // Active Race Simulation State
  isRacing: false,
  isCountdown: false,
  countdown: 3,
  passage: PASSAGES[0],
  typedText: '',
  errorsCount: 0,
  rawWpm: 0,
  wpm: 0,
  accuracy: 100,
  speedKmh: 0,
  gear: 1,
  progress: 0, // 0 to 1
  lap: 1,
  totalLaps: 2,
  elapsedSeconds: 0,
  startTime: null,
  isFinished: false,
  finalRank: 4,
  results: null,

  // Racers array (Player + 7 opponents)
  racers: [],

  // Start new race
  initRace: (customPassage = null) => {
    let passage = customPassage;
    if (!passage) {
      if (get().selectedTrackId === 'coastal-drive') {
        passage = PASSAGES[0]; // Exact coastal run passage from reference screenshot
      } else {
        passage = getRandomPassage();
      }
    }
    const track = getTrackById(get().selectedTrackId);
    const userProfile = get().profile;

    // Build 8 racers
    const playerRacer = {
      id: userProfile.id || 'player',
      name: 'You',
      username: userProfile.username || 'You',
      avatar: userProfile.avatar || '👤',
      isPlayer: true,
      progress: 0,
      wpm: 0,
      position: 4,
      lane: 0,
      speed: 0
    };

    const botRacers = BOT_DRIVERS.map((b, idx) => ({
      ...b,
      username: b.name,
      isPlayer: false,
      progress: 0,
      wpm: b.targetWpm - Math.floor(Math.random() * 4),
      position: idx < 3 ? idx + 1 : idx + 2,
      lane: b.lane,
      speed: 0
    }));

    // Player in 4th position matching screenshot (kero 1, aryan 2, nova 3, You 4, zenyx 5...)
    const allRacers = [
      botRacers[0],
      botRacers[1],
      botRacers[2],
      playerRacer,
      ...botRacers.slice(3)
    ];

    set({
      view: 'racing',
      isRacing: false,
      isCountdown: true,
      countdown: 3,
      passage,
      typedText: '',
      errorsCount: 0,
      rawWpm: 0,
      wpm: 0,
      accuracy: 100,
      speedKmh: 0,
      gear: 1,
      progress: 0,
      lap: 1,
      totalLaps: track.laps || 2,
      elapsedSeconds: 0,
      startTime: null,
      isFinished: false,
      results: null,
      racers: allRacers
    });

    // Start countdown sound & timer
    soundEngine.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        soundEngine.playCountdownBeep(false);
        set({ countdown: count });
      } else if (count === 0) {
        soundEngine.playCountdownBeep(true);
        soundEngine.startEngine();
        set({
          countdown: 0,
          isCountdown: false,
          isRacing: true,
          startTime: Date.now()
        });
        clearInterval(interval);
      }
    }, 1000);
  },

  // Process typed character input
  handleKeyInput: (char) => {
    const state = get();
    if (!state.isRacing || state.isFinished) return;

    const targetText = state.passage.text;
    const currentTyped = state.typedText;
    const nextIndex = currentTyped.length;

    if (nextIndex >= targetText.length) return;

    const expectedChar = targetText[nextIndex];
    const isCorrect = char === expectedChar;

    if (isCorrect) {
      soundEngine.playKeypress(char === ' ');
      const newTyped = currentTyped + char;
      const newProgress = Math.min(1, newTyped.length / targetText.length);

      // Calculate WPM: (characters / 5) / minutes
      const now = Date.now();
      const elapsedMin = Math.max(0.01, (now - state.startTime) / 60000);
      const totalChars = newTyped.length;
      const calculatedWpm = Math.round((totalChars / 5) / elapsedMin);
      const accuracy = Math.max(0, Math.round(((totalChars - state.errorsCount) / totalChars) * 100));

      // Calculate speed and gear
      const targetSpeed = Math.min(310, Math.max(30, calculatedWpm * 1.85 * (accuracy / 100)));
      const gear = targetSpeed < 45 ? 1 : targetSpeed < 85 ? 2 : targetSpeed < 130 ? 3 : targetSpeed < 180 ? 4 : targetSpeed < 240 ? 5 : 6;

      soundEngine.updateEngineSpeed(targetSpeed);

      // Update player racer in racers list
      const updatedRacers = state.racers.map(r => {
        if (r.isPlayer) {
          return { ...r, progress: newProgress, wpm: calculatedWpm, speed: targetSpeed };
        }
        return r;
      });

      // Sort rankings by progress descending
      const sorted = [...updatedRacers].sort((a, b) => b.progress - a.progress);
      const rankedRacers = sorted.map((r, i) => ({ ...r, position: i + 1 }));
      const playerRank = rankedRacers.find(r => r.isPlayer)?.position || 3;

      set({
        typedText: newTyped,
        wpm: calculatedWpm,
        accuracy,
        speedKmh: Math.round(targetSpeed),
        gear,
        progress: newProgress,
        racers: rankedRacers,
        finalRank: playerRank
      });

      // Check race finish
      if (newTyped.length === targetText.length) {
        get().finishRace();
      }
    } else {
      // Mistyped character
      soundEngine.playError();
      set(s => ({
        errorsCount: s.errorsCount + 1,
        speedKmh: Math.max(25, s.speedKmh * 0.88)
      }));
    }
  },

  // Backspace key support
  handleBackspace: () => {
    const state = get();
    if (!state.isRacing || state.isFinished || state.typedText.length === 0) return;

    const newTyped = state.typedText.slice(0, -1);
    const newProgress = Math.min(1, newTyped.length / state.passage.text.length);

    set({
      typedText: newTyped,
      progress: newProgress
    });
  },

  // Finish race & persist result
  finishRace: () => {
    const state = get();
    if (state.isFinished) return;

    soundEngine.stopEngine();
    soundEngine.playFinishFanfare();

    const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 42;
    const mins = Math.floor(elapsed / 60);
    const secs = (elapsed % 60).toFixed(2);
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;

    const track = getTrackById(state.selectedTrackId);

    const raceResults = {
      wpm: state.wpm,
      accuracy: state.accuracy,
      timeSeconds: elapsed,
      timeFormatted: formattedTime,
      position: state.finalRank,
      totalRacers: 8,
      trackId: track.id,
      trackName: track.name,
      vehicleId: state.selectedVehicleId,
      mode: state.gameMode,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to Supabase & local storage
    api.saveRaceResult(raceResults).then(({ profile }) => {
      if (profile) {
        set({ profile });
      }
    });

    set({
      isRacing: false,
      isFinished: true,
      results: raceResults,
      view: 'results'
    });
  },

  // Opponent bot progress simulation tick
  tickRaceBots: (deltaTime = 0.1) => {
    const state = get();
    if (!state.isRacing || state.isFinished) return;

    const currentElapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : 0;

    const updatedRacers = state.racers.map(r => {
      if (r.isPlayer) return r;

      // Bot progress increases smoothly based on their target WPM
      // Target WPM 100 takes approx 45 seconds for typical passage
      const speedFactor = (r.targetWpm || 100) / 100;
      const progressDelta = (deltaTime / 40) * speedFactor * (0.95 + Math.random() * 0.1);
      const newProgress = Math.min(1, r.progress + progressDelta);

      // Micro variation in displayed WPM
      const displayWpm = Math.max(60, Math.round(r.targetWpm + Math.sin(currentElapsed * 2 + r.lane) * 4));

      return {
        ...r,
        progress: newProgress,
        wpm: displayWpm,
        speed: Math.round(displayWpm * 1.6)
      };
    });

    // Re-rank racers by progress
    const sorted = [...updatedRacers].sort((a, b) => b.progress - a.progress);
    const rankedRacers = sorted.map((r, i) => ({ ...r, position: i + 1 }));
    const playerRank = rankedRacers.find(r => r.isPlayer)?.position || 3;

    set({
      racers: rankedRacers,
      finalRank: playerRank,
      elapsedSeconds: currentElapsed
    });
  }
}));
