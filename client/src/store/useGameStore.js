import { create } from 'zustand';
import { TRACKS, getTrackById } from '../data/tracks.js';
import { VEHICLES, getVehicleById } from '../data/vehicles.js';
import { PASSAGES, getRandomPassage } from '../data/passages.js';
import { soundEngine } from '../sound/soundEngine.js';
import { api } from '../services/supabase.js';
import { multiplayer } from '../services/multiplayer.js';

// Believable AI Bot Drivers configured strictly within the 50–90 WPM range
export const BOT_DRIVERS = [
  { id: 'bot-1', name: 'kero', avatar: '⚡', targetWpm: 88, baseWpm: 88, lane: 1, consistency: 0.94 },
  { id: 'bot-2', name: 'aryan', avatar: '🏎️', targetWpm: 84, baseWpm: 84, lane: 0, consistency: 0.92 },
  { id: 'bot-3', name: 'nova', avatar: '🏁', targetWpm: 78, baseWpm: 78, lane: -1, consistency: 0.90 },
  { id: 'bot-4', name: 'zenyx', avatar: '🎌', targetWpm: 72, baseWpm: 72, lane: 0.5, consistency: 0.88 },
  { id: 'bot-5', name: 'rhea', avatar: '🌟', targetWpm: 66, baseWpm: 66, lane: -0.5, consistency: 0.85 },
  { id: 'bot-6', name: 'blank', avatar: '✨', targetWpm: 59, baseWpm: 59, lane: 1, consistency: 0.82 },
  { id: 'bot-7', name: 'arlo', avatar: '🔥', targetWpm: 52, baseWpm: 52, lane: -1, consistency: 0.80 }
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
    bestWpm: 84,
    averageWpm: 76,
    accuracy: 97,
    totalRaces: 310,
    globalRank: 4,
    isGuest: false
  },
  setProfile: (newProfile) => set((state) => ({ profile: { ...state.profile, ...newProfile } })),

  // Machine & Track Selection
  selectedTrackId: 'coastal-run',
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

  // Bot Difficulty Setting within 50–90 WPM range
  botDifficulty: 'standard', // 'casual' (50-65) | 'standard' (52-88) | 'pro' (70-90)
  setBotDifficulty: (diff) => set({ botDifficulty: diff }),

  // Active Race Simulation State
  isRacing: false,
  isCountdown: false,
  countdown: 3,
  passage: PASSAGES[0],
  typedText: '',
  errorText: '', // Mistyped characters currently blocking progression
  totalAttempted: 0,
  errorsCount: 0,
  rawWpm: 0,
  wpm: 0,
  rollingWpm: 0,
  accuracy: 100,
  speedKmh: 0,
  targetSpeedKmh: 0,
  gear: 1,
  progress: 0, // 0 to 1
  lap: 1,
  totalLaps: 2,
  elapsedSeconds: 0,
  startTime: null,
  firstKeystrokeTime: null,
  lastKeystrokeTime: null,
  keystrokeHistory: [], // Rolling window keystrokes: [{ time, chars }]
  isFinished: false,
  finalRank: 4,
  results: null,

  // Racers array (Player + 7 opponents)
  racers: [],

  // Live racing standings calculation
  computeRankings: (racersList) => {
    return [...racersList].sort((a, b) => {
      // 1. Finished racers rank ahead, ordered by finish time
      if (a.isFinished && !b.isFinished) return -1;
      if (!a.isFinished && b.isFinished) return 1;
      if (a.isFinished && b.isFinished) {
        return (a.finishTime || 0) - (b.finishTime || 0);
      }

      // 2. Active racers sorted by distance along the track with smooth starting grid bonus fading
      const aGridWeight = Math.max(0, 1 - (a.progress / 0.30));
      const bGridWeight = Math.max(0, 1 - (b.progress / 0.30));
      const aDist = (a.progress * 1000) + (8 - (a.gridPosition || 4)) * 14 * aGridWeight;
      const bDist = (b.progress * 1000) + (8 - (b.gridPosition || 4)) * 14 * bGridWeight;

      if (Math.abs(aDist - bDist) > 0.05) {
        return bDist - aDist;
      }
      return (a.gridPosition || 4) - (b.gridPosition || 4);
    }).map((r, idx) => ({ ...r, position: idx + 1 }));
  },

  // Start new race
  initRace: (customPassage = null, multiplayerPlayers = null) => {
    let passage = customPassage;
    if (!passage) {
      if (get().selectedTrackId === 'coastal-run' || get().selectedTrackId === 'coastal-circuit') {
        passage = PASSAGES[0];
      } else {
        passage = getRandomPassage();
      }
    }
    const track = getTrackById(get().selectedTrackId);
    const userProfile = get().profile;
    const diff = get().botDifficulty;

    // Apply difficulty scaling within 50–90 WPM range
    const botDrivers = BOT_DRIVERS.map(b => {
      let target = b.baseWpm;
      if (diff === 'casual') target = Math.max(50, Math.min(65, Math.round(b.baseWpm * 0.75)));
      if (diff === 'pro') target = Math.max(70, Math.min(90, Math.round(b.baseWpm * 1.05)));
      return { ...b, targetWpm: target };
    });

    let allRacers = [];

    if (multiplayerPlayers && multiplayerPlayers.length > 0) {
      // Multiplayer Grid Setup
      const localId = multiplayer.localPlayer?.id || userProfile.id;
      const otherPlayers = multiplayerPlayers.filter(p => p.id !== localId);
      
      const playerRacer = {
        id: localId || 'player',
        name: userProfile.username || 'You',
        username: userProfile.username || 'You',
        avatar: userProfile.avatar || '👤',
        isPlayer: true,
        isHuman: true,
        progress: 0,
        wpm: 0,
        gridPosition: 4,
        position: 4,
        lane: 0,
        speed: 0
      };

      const humanRacers = otherPlayers.slice(0, 7).map((p, idx) => ({
        id: p.id,
        name: p.name || p.username || `Racer ${idx + 1}`,
        username: p.name || p.username || `Racer ${idx + 1}`,
        avatar: p.avatar || '🏎️',
        isPlayer: false,
        isHuman: true,
        progress: 0,
        wpm: 0,
        gridPosition: idx < 3 ? idx + 1 : idx + 2,
        position: idx < 3 ? idx + 1 : idx + 2,
        lane: (idx % 2 === 0 ? 1 : -1),
        speed: 0
      }));

      const remainingCount = 8 - (1 + humanRacers.length);
      const fillerBots = botDrivers.slice(humanRacers.length, humanRacers.length + remainingCount).map((b, idx) => {
        const gridPos = humanRacers.length + idx + (humanRacers.length + idx >= 3 ? 2 : 1);
        return {
          ...b,
          username: b.name,
          isPlayer: false,
          isHuman: false,
          progress: 0,
          wpm: b.targetWpm,
          gridPosition: gridPos,
          position: gridPos,
          lane: b.lane,
          speed: 0
        };
      });

      const combined = [playerRacer, ...humanRacers, ...fillerBots];
      allRacers = combined.sort((a, b) => a.gridPosition - b.gridPosition);
    } else {
      // Single Player / Quick Race default 8-driver grid
      const playerRacer = {
        id: userProfile.id || 'player',
        name: 'You',
        username: userProfile.username || 'You',
        avatar: userProfile.avatar || '👤',
        isPlayer: true,
        isHuman: true,
        progress: 0,
        wpm: 0,
        gridPosition: 4,
        position: 4,
        lane: 0,
        speed: 0
      };

      const botRacers = botDrivers.map((b, idx) => {
        const gridPos = idx < 3 ? idx + 1 : idx + 2;
        return {
          ...b,
          username: b.name,
          isPlayer: false,
          isHuman: false,
          progress: 0,
          wpm: b.targetWpm,
          gridPosition: gridPos,
          position: gridPos,
          lane: b.lane,
          speed: 0
        };
      });

      allRacers = [
        botRacers[0], // 1 kero (88 WPM)
        botRacers[1], // 2 aryan (84 WPM)
        botRacers[2], // 3 nova (78 WPM)
        playerRacer,  // 4 You
        botRacers[3], // 5 zenyx (72 WPM)
        botRacers[4], // 6 rhea (66 WPM)
        botRacers[5], // 7 blank (59 WPM)
        botRacers[6]  // 8 arlo (52 WPM)
      ];
    }

    const isMultiplayerGame = Boolean(multiplayerPlayers && multiplayerPlayers.length > 1);

    set({
      view: 'racing',
      gameMode: isMultiplayerGame ? 'multiplayer' : get().gameMode,
      isRacing: false,
      isCountdown: true,
      countdown: 3,
      passage,
      typedText: '',
      errorText: '',
      totalAttempted: 0,
      errorsCount: 0,
      rawWpm: 0,
      wpm: 0,
      rollingWpm: 0,
      accuracy: 100,
      speedKmh: 0,
      targetSpeedKmh: 0,
      gear: 1,
      progress: 0,
      lap: 1,
      totalLaps: track.laps || 2,
      elapsedSeconds: 0,
      startTime: null,
      firstKeystrokeTime: null,
      lastKeystrokeTime: null,
      keystrokeHistory: [],
      isFinished: false,
      finalRank: 4,
      results: null,
      racers: allRacers
    });

    // Countdown timer & audio
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

  // Process typed character input with accurate typing cadence and rolling WPM
  handleKeyInput: (char) => {
    const state = get();
    if (!state.isRacing || state.isFinished) return;

    const targetText = state.passage.text;
    const currentTyped = state.typedText;
    const errorText = state.errorText;
    const nextIndex = currentTyped.length;

    if (nextIndex >= targetText.length) return;

    const now = Date.now();
    const firstKeyTime = state.firstKeystrokeTime || now;

    // If no existing typo, test expected character
    if (errorText.length === 0) {
      const expectedChar = targetText[nextIndex];
      const isCorrect = char === expectedChar;

      if (isCorrect) {
        soundEngine.playKeypress(char === ' ');
        const newTyped = currentTyped + char;
        const newProgress = Math.min(1, newTyped.length / targetText.length);
        const newAttempted = state.totalAttempted + 1;

        // Rolling 3.0-second keystroke window
        const updatedHistory = [...state.keystrokeHistory, { time: now, count: 1 }]
          .filter(k => now - k.time <= 3000);

        const charsInWindow = updatedHistory.length;
        // Rolling WPM: (charsInWindow / 5) / (3.0s / 60s) = (charsInWindow / 5) * 20
        const rollingWpm = Math.round((charsInWindow / 5) * 20);

        // Standard cumulative WPM: (totalChars / 5) / activeMinutes
        const activeMinutes = Math.max(0.033, (now - firstKeyTime) / 60000);
        const cumulativeWpm = Math.round((newTyped.length / 5) / activeMinutes);

        // Smooth live display WPM: 65% responsive rolling window, 35% cumulative anchor
        const liveWpm = Math.max(0, Math.min(240, Math.round(0.65 * rollingWpm + 0.35 * cumulativeWpm)));

        // Standard Accuracy convention
        const accuracy = Math.max(0, Math.min(100, Math.round(((newAttempted - state.errorsCount) / newAttempted) * 100)));

        // Frame-rate independent vehicle speed target based on pace and accuracy
        const targetSpeed = Math.min(320, Math.max(35, liveWpm * 1.95 * (accuracy / 100)));
        const gear = targetSpeed < 50 ? 1 : targetSpeed < 90 ? 2 : targetSpeed < 140 ? 3 : targetSpeed < 190 ? 4 : targetSpeed < 250 ? 5 : 6;

        soundEngine.updateEngineSpeed(targetSpeed);

        const isDone = newTyped.length === targetText.length;
        const updatedRacers = state.racers.map(r => {
          if (r.isPlayer) {
            return {
              ...r,
              progress: newProgress,
              wpm: liveWpm,
              speed: targetSpeed,
              isFinished: isDone,
              finishTime: isDone ? (now - state.startTime) / 1000 : null
            };
          }
          return r;
        });

        const rankedRacers = state.computeRankings(updatedRacers);
        const playerRank = rankedRacers.find(r => r.isPlayer)?.position || 4;

        set({
          typedText: newTyped,
          wpm: liveWpm,
          rollingWpm,
          accuracy,
          totalAttempted: newAttempted,
          speedKmh: Math.round(targetSpeed),
          targetSpeedKmh: targetSpeed,
          gear,
          progress: newProgress,
          firstKeystrokeTime: firstKeyTime,
          lastKeystrokeTime: now,
          keystrokeHistory: updatedHistory,
          racers: rankedRacers,
          finalRank: playerRank
        });

        if (isDone) {
          get().finishRace();
        }
      } else {
        // First typo on this character: append to errorText
        soundEngine.playError();
        const newAttempted = state.totalAttempted + 1;
        const newErrors = state.errorsCount + 1;
        const accuracy = Math.max(0, Math.min(100, Math.round(((newAttempted - newErrors) / newAttempted) * 100)));

        set(s => ({
          errorText: char,
          totalAttempted: newAttempted,
          errorsCount: newErrors,
          accuracy,
          lastKeystrokeTime: now,
          speedKmh: Math.max(25, s.speedKmh * 0.90) // Modest mistake penalty
        }));
      }
    } else {
      // Existing typo: append more error chars (up to 6)
      if (errorText.length < 6) {
        soundEngine.playError();
        set(s => ({
          errorText: s.errorText + char,
          totalAttempted: s.totalAttempted + 1,
          errorsCount: s.errorsCount + 1,
          lastKeystrokeTime: now,
          speedKmh: Math.max(25, s.speedKmh * 0.92)
        }));
      }
    }
  },

  // Backspace key support: removes error character first, then previous character
  handleBackspace: () => {
    const state = get();
    if (!state.isRacing || state.isFinished) return;

    if (state.errorText.length > 0) {
      set({
        errorText: state.errorText.slice(0, -1),
        lastKeystrokeTime: Date.now()
      });
      return;
    }

    if (state.typedText.length > 0) {
      const newTyped = state.typedText.slice(0, -1);
      const newProgress = Math.min(1, newTyped.length / state.passage.text.length);

      set({
        typedText: newTyped,
        progress: newProgress,
        lastKeystrokeTime: Date.now()
      });
    }
  },

  // Finish race & persist result with exact ending WPM & updated all-race average
  finishRace: () => {
    const state = get();
    if (state.isFinished) return;

    soundEngine.stopEngine();
    soundEngine.playFinishFanfare();

    const now = Date.now();
    const elapsed = state.startTime ? (now - state.startTime) / 1000 : 42;
    const mins = Math.floor(elapsed / 60);
    const secs = (elapsed % 60).toFixed(2);
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(5, '0')}`;

    // Compute mathematically exact ending WPM based on active typing time: (words / minutes)
    const activeStart = state.firstKeystrokeTime || state.startTime || now;
    const activeElapsedMin = Math.max(0.04, (now - activeStart) / 60000);
    const targetWords = (state.passage?.text?.length || 100) / 5;
    const finalEndingWpm = Math.max(1, Math.round(targetWords / activeElapsedMin));
    const finalAccuracy = state.totalAttempted > 0
      ? Math.max(0, Math.min(100, Math.round(((state.totalAttempted - state.errorsCount) / state.totalAttempted) * 100)))
      : 100;

    const track = getTrackById(state.selectedTrackId);

    const raceResults = {
      wpm: finalEndingWpm,
      accuracy: finalAccuracy,
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

    api.saveRaceResult(raceResults).then(({ profile }) => {
      if (profile) {
        set({
          profile: {
            ...get().profile,
            ...profile,
            averageWpm: profile.averageWpm || profile.average_wpm
          }
        });
      }
    });

    set({
      isRacing: false,
      isFinished: true,
      wpm: finalEndingWpm,
      results: raceResults,
      view: 'results'
    });
  },

  // Update remote multiplayer human racer
  updateRemoteRacer: ({ racerId, progress, wpm, speed, lane, isFinished, finishTime }) => {
    const state = get();
    if (!state.isRacing && !state.isCountdown) return;

    let racerFound = false;
    const updatedRacers = state.racers.map(r => {
      if (r.id === racerId) {
        racerFound = true;
        return {
          ...r,
          progress: progress !== undefined ? progress : r.progress,
          wpm: wpm !== undefined ? wpm : r.wpm,
          speed: speed !== undefined ? speed : r.speed,
          lane: lane !== undefined ? lane : r.lane,
          isFinished: isFinished !== undefined ? isFinished : r.isFinished,
          finishTime: finishTime !== undefined ? finishTime : r.finishTime
        };
      }
      return r;
    });

    if (!racerFound) return;

    const rankedRacers = state.computeRankings(updatedRacers);
    const playerRank = rankedRacers.find(r => r.isPlayer)?.position || state.finalRank;

    set({
      racers: rankedRacers,
      finalRank: playerRank
    });
  },

  // Opponent bot progress simulation tick strictly between 50–90 WPM & continuous smooth decay
  tickRaceBots: (deltaTime = 0.1) => {
    const state = get();
    if (!state.isRacing || state.isFinished) return;

    const now = Date.now();
    const currentElapsed = state.startTime ? (now - state.startTime) / 1000 : 0;
    const targetLength = state.passage?.text?.length || 100;

    // 1. Prune rolling keystroke window and decay player speed when pausing
    let playerLiveWpm = state.wpm;
    let playerLiveSpeed = state.speedKmh;
    let playerLiveGear = state.gear;

    // Prune keystrokes older than 3 seconds
    const activeKeystrokes = state.keystrokeHistory.filter(k => now - k.time <= 3000);

    if (state.firstKeystrokeTime && state.lastKeystrokeTime) {
      const idleMs = now - state.lastKeystrokeTime;
      if (idleMs > 400) {
        // Keystroke decay in rolling window
        const charsInWindow = activeKeystrokes.length;
        const currentRollingWpm = Math.round((charsInWindow / 5) * 20);

        const activeMinutes = (now - state.firstKeystrokeTime) / 60000;
        const cumulativeWpm = Math.round((state.typedText.length / 5) / activeMinutes);

        // Smoothly decay displayed WPM towards real-time pace
        playerLiveWpm = Math.max(0, Math.round(0.7 * currentRollingWpm + 0.3 * cumulativeWpm));
        playerLiveSpeed = Math.max(25, Math.round(state.speedKmh * 0.94));
        playerLiveGear = playerLiveSpeed < 50 ? 1 : playerLiveSpeed < 90 ? 2 : playerLiveSpeed < 140 ? 3 : playerLiveSpeed < 190 ? 4 : 5;

        soundEngine.updateEngineSpeed(playerLiveSpeed);
      }
    }

    // 2. Realistic 50–90 WPM Bot Racer Simulation
    const updatedRacers = state.racers.map(r => {
      if (r.isPlayer) {
        return {
          ...r,
          wpm: playerLiveWpm,
          speed: playerLiveSpeed
        };
      }

      if (r.isHuman || r.isFinished) return r;

      // Realistic speed oscillation within [50, 90] WPM range
      const baseTarget = r.targetWpm || 70;
      const cadenceOscillation = Math.sin(currentElapsed * 1.6 + (r.gridPosition || 1)) * 4.2;
      const microJitter = (Math.sin(currentElapsed * 5.3) * 1.5);
      
      // Simulated occasional typo / word-break pause
      const pauseCycle = Math.sin(currentElapsed * 0.4 + (r.gridPosition * 2));
      const isPausing = pauseCycle > 0.94;
      const pausePenalty = isPausing ? 0.65 : 1.0;

      const liveBotWpm = Math.max(50, Math.min(90, Math.round((baseTarget + cadenceOscillation + microJitter) * pausePenalty)));

      // Standard 5 characters/word progress increment: charsPerSec = (WPM * 5) / 60
      const charsPerSec = (liveBotWpm * 5) / 60;
      const progressDelta = (deltaTime * charsPerSec) / targetLength;
      const newProgress = Math.min(1, r.progress + progressDelta);
      const isDone = newProgress >= 1;

      return {
        ...r,
        progress: newProgress,
        wpm: liveBotWpm,
        speed: Math.round(liveBotWpm * 1.7),
        isFinished: isDone,
        finishTime: isDone ? currentElapsed : null
      };
    });

    const rankedRacers = state.computeRankings(updatedRacers);
    const playerRank = rankedRacers.find(r => r.isPlayer)?.position || state.finalRank;

    set({
      wpm: playerLiveWpm,
      speedKmh: playerLiveSpeed,
      gear: playerLiveGear,
      keystrokeHistory: activeKeystrokes,
      racers: rankedRacers,
      finalRank: playerRank,
      elapsedSeconds: currentElapsed
    });
  }
}));
