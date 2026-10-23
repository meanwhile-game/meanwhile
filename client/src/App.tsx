import React, { useState, useEffect, useRef } from 'react';
import { socketService } from './services/socket.js';
import { fetchProfile, UserProfile } from './services/api.js';
import { VEHICLES, TRACKS } from './three/types.js';
import { RaceSceneManager, RacerDisplayData } from './three/RaceScene.js';
import { sound } from './sound/soundEngine.js';

// Screens & Modals
import { LandingPage } from './components/lobby/LandingPage.js';
import { MainLobby } from './components/lobby/MainLobby.js';
import { MatchmakingModal } from './components/lobby/MatchmakingModal.js';
import { PrivateLobby } from './components/lobby/PrivateLobby.js';
import { GarageScreen } from './components/garage/GarageScreen.js';
import { TrackSelectionScreen } from './components/tracks/TrackSelectionScreen.js';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen.js';
import { SettingsModal } from './components/settings/SettingsModal.js';
import { RaceHud, RacerHudData } from './components/race/RaceHud.js';
import { ResultsScreen } from './components/race/ResultsScreen.js';

type ViewMode = 'landing' | 'lobby' | 'private_lobby' | 'racing' | 'garage' | 'tracks' | 'leaderboard';

export const App: React.FC = () => {
  // Navigation & Modals
  const [view, setView] = useState<ViewMode>('lobby');
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // User Profile
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem('meanwhile_user_id') || localStorage.getItem('veloce_user_id');
    if (!id) {
      id = `pilot_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('meanwhile_user_id', id);
    }
    return id;
  });

  const [profile, setProfile] = useState<UserProfile>({
    id: userId,
    username: 'ApexRacer',
    avatar: '🏎️',
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
    favoriteTrack: 'chennai',
    recentRaces: []
  });

  // Selected Machine & Track
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return localStorage.getItem('meanwhile_vehicle_id') || localStorage.getItem('veloce_vehicle_id') || 'cyber-gt';
  });
  const [selectedVehicleColor, setSelectedVehicleColor] = useState<string>(() => {
    return localStorage.getItem('meanwhile_vehicle_color') || localStorage.getItem('veloce_vehicle_color') || '#00ff87';
  });
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    const saved = localStorage.getItem('meanwhile_track_id');
    if (saved && saved !== 'tokyo') return saved;
    return 'chennai';
  });
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>(() => {
    return (localStorage.getItem('meanwhile_quality') || localStorage.getItem('veloce_quality') as any) || 'high';
  });

  // Server & Multiplayer States
  const [onlineCount, setOnlineCount] = useState<number>(14);
  const [queueLength, setQueueLength] = useState<number>(1);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [socketId, setSocketId] = useState<string>('');

  // Active Race States
  const [countdown, setCountdown] = useState<number>(-1);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [passage, setPassage] = useState<{
    id: string;
    text: string;
    title: string;
    category: string;
    sourceType?: 'book' | 'song' | 'article' | 'speech' | 'essay';
    author: string;
    year?: number | string;
    context?: string;
  }>({
    id: 'book-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    sourceType: 'book',
    year: 1925,
    category: 'Classic Literature',
    context: 'From Chapter 9 of Fitzgerald’s 1925 masterpiece on ambition, memory, and the green light at the end of the dock.',
    text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—tomorrow we will run faster, stretch out our arms farther. And then one fine morning—so we beat on, boats against the current, borne back ceaselessly into the past."
  });

  const [localStats, setLocalStats] = useState<{
    wpm: number;
    accuracy: number;
    progress: number;
    currentTypedIndex: number;
  }>({
    wpm: 0,
    accuracy: 100,
    progress: 0,
    currentTypedIndex: 0
  });

  const [racersProgress, setRacersProgress] = useState<Record<string, { progress: number; wpm: number; accuracy: number; placement: number | null }>>({});
  const [finalPodium, setFinalPodium] = useState<any[]>([]);

  // 3D Scene Ref & Camera Mode
  const raceCanvasContainerRef = useRef<HTMLDivElement>(null);
  const raceSceneRef = useRef<RaceSceneManager | null>(null);
  const [cameraMode, setCameraMode] = useState<'chase' | 'broadcast'>('chase');

  const handleToggleCamera = () => {
    if (raceSceneRef.current) {
      const nextMode = raceSceneRef.current.toggleCameraMode();
      setCameraMode(nextMode);
    } else {
      setCameraMode(prev => (prev === 'chase' ? 'broadcast' : 'chase'));
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchProfile(userId)
      .then(p => {
        setProfile(p);
        if (p.favoriteVehicle) setSelectedVehicleId(p.favoriteVehicle);
        if (p.favoriteTrack) setSelectedTrackId(p.favoriteTrack);
      })
      .catch(console.warn);
  }, [userId]);

  // Connect Socket & Register Listeners
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setSocketId(socket.id || '');
    });

    socket.on('online_count', (count: number) => {
      setOnlineCount(count);
    });

    socket.on('matchmaking_status', (data: { status: string; queueLength: number }) => {
      setQueueLength(data.queueLength);
    });

    socket.on('match_found', (data: { room: any; filledWithBots?: boolean }) => {
      setShowMatchmaking(false);
      setCurrentRoom(data.room);
      setSelectedTrackId(data.room.trackId || 'tokyo');
      if (data.room.passage) setPassage(data.room.passage);
      setView('racing');
    });

    socket.on('room_updated', (room: any) => {
      setCurrentRoom(room);
      if (room.trackId) setSelectedTrackId(room.trackId);
      if (room.passage) setPassage(room.passage);
    });

    socket.on('countdown_tick', (data: { countdown: number }) => {
      setCountdown(data.countdown);
      sound.playCountdownTick(data.countdown);
      raceSceneRef.current?.setCountdown(data.countdown);

      if (data.countdown === 0) {
        setIsRacing(true);
        sound.startEngine();
      }
    });

    socket.on('race_started', (data: { raceStartTime: number; passage: any; room: any }) => {
      setCurrentRoom(data.room);
      setPassage(data.passage);
      setCountdown(0);
      setIsRacing(true);
      sound.startEngine();
      setShowResults(false);
      setLocalStats({ wpm: 0, accuracy: 100, progress: 0, currentTypedIndex: 0 });
    });

    socket.on('race_progress', (data: Array<{ id: string; progress: number; wpm: number; accuracy: number; placement: number | null }>) => {
      const map: Record<string, any> = {};
      data.forEach(item => {
        map[item.id] = item;
        raceSceneRef.current?.updateProgress(item.id, item.progress, item.wpm);
      });
      setRacersProgress(map);
    });

    socket.on('player_finished', (data: { playerId: string; placement: number; wpm: number; accuracy: number; elapsedMs: number }) => {
      if (data.playerId === socket.id) {
        sound.stopEngine();
      }
    });

    socket.on('race_finished', (data: { room: any; podium: any[] }) => {
      setCurrentRoom(data.room);
      setIsRacing(false);
      sound.stopEngine();

      const formattedPodium = data.podium.map(p => ({
        ...p,
        isLocal: p.socketId === socket.id || p.id === socket.id
      }));

      setFinalPodium(formattedPodium);
      setShowResults(true);

      // Refresh profile stats
      fetchProfile(userId).then(setProfile).catch(console.warn);
    });

    socket.on('rematch_initiated', (room: any) => {
      setCurrentRoom(room);
      setShowResults(false);
      setIsRacing(false);
      setLocalStats({ wpm: 0, accuracy: 100, progress: 0, currentTypedIndex: 0 });
      if (room.passage) setPassage(room.passage);
    });

    // Check URL parameters for direct room join
    const params = new URLSearchParams(window.location.search);
    const roomCodeParam = params.get('room');
    if (roomCodeParam) {
      handleJoinPrivateRoom(roomCodeParam);
    }

    return () => {
      socket.off('connect');
      socket.off('online_count');
      socket.off('matchmaking_status');
      socket.off('match_found');
      socket.off('room_updated');
      socket.off('countdown_tick');
      socket.off('race_started');
      socket.off('race_progress');
      socket.off('player_finished');
      socket.off('race_finished');
      socket.off('rematch_initiated');
    };
  }, [userId]);

  // Mount/Unmount 3D Race Scene Canvas
  useEffect(() => {
    if (view === 'racing' && raceCanvasContainerRef.current) {
      const activeTrack = currentRoom?.trackId || selectedTrackId;
      const manager = new RaceSceneManager(
        raceCanvasContainerRef.current,
        activeTrack,
        graphicsQuality
      );
      raceSceneRef.current = manager;

      // Populate racers
      if (currentRoom?.players) {
        const humanPlayer = Object.values(currentRoom.players).find((p: any) => !p.isAi) as any;
        const localId = humanPlayer?.id || socketService.getSocketId() || '';

        const racerList: RacerDisplayData[] = Object.values(currentRoom.players).map((p: any, idx) => ({
          id: p.id,
          vehicleId: p.vehicleId || 'cyber-gt',
          vehicleColor: p.vehicleColor || '#00ff87',
          isLocal: p.id === localId || p.socketId === localId || !p.isAi,
          targetProgress: p.progress || 0,
          currentProgress: p.progress || 0,
          laneIndex: idx % 4,
          wpm: p.wpm || 0
        }));
        manager.setRacers(racerList, localId);
      }

      return () => {
        manager.dispose();
        raceSceneRef.current = null;
        sound.stopEngine();
      };
    }
  }, [view, currentRoom?.id, graphicsQuality]);

  // Keep racers synchronized in 3D Scene
  useEffect(() => {
    if (view === 'racing' && raceSceneRef.current && currentRoom?.players) {
      const humanPlayer = Object.values(currentRoom.players).find((p: any) => !p.isAi) as any;
      const localId = humanPlayer?.id || socketService.getSocketId() || '';

      const racerList: RacerDisplayData[] = Object.values(currentRoom.players).map((p: any, idx) => {
        const live = racersProgress[p.id] || {};
        const isLocal = p.id === localId || p.socketId === localId || !p.isAi;
        return {
          id: p.id,
          vehicleId: p.vehicleId || 'cyber-gt',
          vehicleColor: p.vehicleColor || '#00ff87',
          isLocal,
          targetProgress: live.progress !== undefined ? live.progress : (p.progress || 0),
          currentProgress: live.progress !== undefined ? live.progress : (p.progress || 0),
          laneIndex: idx % 4,
          wpm: live.wpm || p.wpm || 0
        };
      });
      raceSceneRef.current.setRacers(racerList, localId);
    }
  }, [currentRoom?.players, view, racersProgress]);

  // Active AI Simulation for Solo Mode
  useEffect(() => {
    if (!isRacing || !currentRoom?.id?.startsWith('solo_') || !currentRoom?.players) return;

    const passageLength = Math.max(120, passage.text.length);
    const aiIds = ['ai_1', 'ai_2', 'ai_3'];

    const interval = setInterval(() => {
      setRacersProgress(prev => {
        const next = { ...prev };
        let anyUpdated = false;

        aiIds.forEach(id => {
          const aiPlayer = currentRoom.players[id];
          if (!aiPlayer) return;

          const currentProg = next[id]?.progress ?? 0;
          if (currentProg >= 1) return;

          anyUpdated = true;
          const targetWpm = aiPlayer.targetWpm || 60;
          const charsTyped = (targetWpm * 5) / 240;
          const addedProgress = charsTyped / passageLength;
          const newProgress = Math.min(1, currentProg + addedProgress);
          const dynamicWpm = Math.max(20, Math.round(targetWpm + Math.sin(Date.now() / 700 + id.charCodeAt(3)) * 4));

          next[id] = {
            progress: newProgress,
            wpm: dynamicWpm,
            accuracy: aiPlayer.accuracy || 98,
            placement: null
          };

          raceSceneRef.current?.updateProgress(id, newProgress, dynamicWpm);
        });

        return anyUpdated ? next : prev;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isRacing, currentRoom?.id, passage.text.length]);

  // --- ACTIONS ---

  const handleRaceNow = () => {
    setShowMatchmaking(true);
    socketService.joinMatchmaking({
      username: profile.username,
      avatar: profile.avatar,
      vehicleId: selectedVehicleId,
      vehicleColor: selectedVehicleColor
    });
  };

  const handleCancelMatchmaking = () => {
    setShowMatchmaking(false);
    socketService.leaveMatchmaking();
  };

  // Smooth local countdown timer fallback to guarantee 3 -> 2 -> 1 -> GO
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        const next = countdown - 1;
        setCountdown(next);
        sound.playCountdownTick(next);
        raceSceneRef.current?.setCountdown(next);
        if (next === 0) {
          setIsRacing(true);
          sound.startEngine();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleStartSolo = (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    sound.playCountdownTick(2);

    const targetWpm = difficulty === 'hard' ? 95 : difficulty === 'easy' ? 45 : 70;
    const localId = socketService.getSocketId() || `player_${Math.random().toString(36).substring(2, 7)}`;

    // Instant optimistic solo room so user enters the track in 0ms flat
    const instantRoom = {
      id: `solo_${Date.now()}`,
      code: 'SOLO',
      trackId: selectedTrackId,
      isPrivate: true,
      state: 'starting',
      countdown: 3,
      passage: passage,
      players: {
        [localId]: {
          id: localId,
          socketId: localId,
          username: profile.username || 'Driver',
          avatar: profile.avatar || '🏎️',
          vehicleId: selectedVehicleId,
          vehicleColor: selectedVehicleColor,
          isReady: true,
          isHost: true,
          isAi: false,
          progress: 0,
          wpm: 0,
          accuracy: 100
        },
        'ai_1': {
          id: 'ai_1',
          socketId: 'ai_1',
          username: 'Chennai Turbo [AI]',
          avatar: '🏎️',
          vehicleId: 'cyber-gt',
          vehicleColor: '#f97316',
          isReady: true,
          isHost: false,
          isAi: true,
          targetWpm: targetWpm + 3,
          progress: 0,
          wpm: 0,
          accuracy: 98
        },
        'ai_2': {
          id: 'ai_2',
          socketId: 'ai_2',
          username: 'Marina Racer [AI]',
          avatar: '🌊',
          vehicleId: 'phantom-blade',
          vehicleColor: '#38bdf8',
          isReady: true,
          isHost: false,
          isAi: true,
          targetWpm: targetWpm - 4,
          progress: 0,
          wpm: 0,
          accuracy: 97
        },
        'ai_3': {
          id: 'ai_3',
          socketId: 'ai_3',
          username: 'Deccan Drift [AI]',
          avatar: '🔥',
          vehicleId: 'ronin-specv',
          vehicleColor: '#eab308',
          isReady: true,
          isHost: false,
          isAi: true,
          targetWpm: targetWpm + 7,
          progress: 0,
          wpm: 0,
          accuracy: 99
        }
      }
    };

    setCurrentRoom(instantRoom);
    setCountdown(3);
    setShowResults(false);
    setIsRacing(false);
    setRacersProgress({});
    setLocalStats({ wpm: 0, accuracy: 100, progress: 0, currentTypedIndex: 0 });
    setView('racing');

    // Notify backend
    socketService.startSoloRace(
      {
        username: profile.username,
        avatar: profile.avatar,
        vehicleId: selectedVehicleId,
        vehicleColor: selectedVehicleColor,
        trackId: selectedTrackId,
        aiCount: 3,
        aiDifficulty: difficulty
      },
      (res) => {
        if (res.success && res.room) {
          setCurrentRoom(res.room);
          if (res.room.passage) setPassage(res.room.passage);
        }
      }
    );
  };

  const handleCreatePrivateRoom = () => {
    socketService.createRoom(
      {
        username: profile.username,
        avatar: profile.avatar,
        vehicleId: selectedVehicleId,
        vehicleColor: selectedVehicleColor,
        isPrivate: true,
        trackId: selectedTrackId
      },
      (res) => {
        if (res.success && res.room) {
          setCurrentRoom(res.room);
          setView('private_lobby');
        }
      }
    );
  };

  const handleJoinPrivateRoom = (code: string) => {
    socketService.joinRoom(
      code,
      {
        username: profile.username,
        avatar: profile.avatar,
        vehicleId: selectedVehicleId,
        vehicleColor: selectedVehicleColor
      },
      (res) => {
        if (res.success && res.room) {
          setCurrentRoom(res.room);
          setView('private_lobby');
        } else {
          alert(res.error || 'Could not join room');
        }
      }
    );
  };

  const handleLaunchPrivateRace = () => {
    if (currentRoom) {
      socketService.startRace(currentRoom.id);
      setView('racing');
    }
  };

  const handleToggleReady = (ready: boolean) => {
    socketService.setReady(ready);
  };

  const handleChangeTrack = (trackId: string) => {
    socketService.updateTrack(trackId);
    setSelectedTrackId(trackId);
  };

  const handleLeaveRoom = () => {
    socketService.leaveRoom();
    setCurrentRoom(null);
    setView('lobby');
  };

  const handleExitRace = () => {
    socketService.leaveRoom();
    sound.stopEngine();
    setCurrentRoom(null);
    setIsRacing(false);
    setShowResults(false);
    setView('lobby');
  };

  const handleKeystroke = (index: number, char: string, isError: boolean) => {
    socketService.sendKeystroke({
      index,
      char,
      isError,
      clientTimestamp: Date.now()
    });
    if (isError) {
      raceSceneRef.current?.triggerBrakeDive();
    } else {
      raceSceneRef.current?.triggerThrottleSurge();
    }
  };

  const handleStatsUpdate = (stats: { wpm: number; accuracy: number; progress: number; currentTypedIndex: number }) => {
    setLocalStats(stats);
    const humanPlayer = Object.values(currentRoom?.players || {}).find((p: any) => !p.isAi) as any;
    const localId = humanPlayer?.id || socketService.getSocketId() || '';
    raceSceneRef.current?.updateProgress(localId, stats.progress, stats.wpm);

    // Solo finish detection
    if (stats.progress >= 1 && currentRoom?.id?.startsWith('solo_') && isRacing) {
      setIsRacing(false);
      sound.stopEngine();

      const racersList = Object.values(currentRoom.players).map((p: any) => {
        const live = racersProgress[p.id] || {};
        const isMe = p.id === localId || p.socketId === localId || !p.isAi;
        return {
          id: p.id,
          username: p.username,
          avatar: p.avatar,
          wpm: isMe ? stats.wpm : (live.wpm || p.targetWpm || 60),
          accuracy: isMe ? stats.accuracy : (live.accuracy || 98),
          progress: isMe ? 1 : (live.progress || 0.8),
          isLocal: isMe
        };
      });

      racersList.sort((a, b) => {
        if (a.progress !== b.progress) return b.progress - a.progress;
        return b.wpm - a.wpm;
      });

      const podium = racersList.map((r, idx) => ({
        ...r,
        placement: idx + 1
      }));

      setFinalPodium(podium);
      setShowResults(true);
    }
  };

  const handleSelectVehicle = (vehicleId: string, color: string, customization?: any) => {
    setSelectedVehicleId(vehicleId);
    setSelectedVehicleColor(color);
    localStorage.setItem('meanwhile_vehicle_id', vehicleId);
    localStorage.setItem('meanwhile_vehicle_color', color);
    if (customization) {
      try {
        localStorage.setItem(`meanwhile_custom_${vehicleId}`, JSON.stringify(customization));
      } catch (e) {
        // ignore
      }
    }
    socketService.updateVehicle(vehicleId, color);
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    localStorage.setItem('meanwhile_track_id', trackId);
    setView('lobby');
  };

  const handleUpdateQuality = (quality: 'low' | 'medium' | 'high') => {
    setGraphicsQuality(quality);
    localStorage.setItem('meanwhile_quality', quality);
    raceSceneRef.current?.setQuality(quality);
  };

  // Convert current room players for Race HUD
  const hudRacers: RacerHudData[] = currentRoom?.players
    ? Object.values(currentRoom.players).map((p: any) => {
        const live = racersProgress[p.id] || {};
        const humanPlayer = Object.values(currentRoom.players).find((pl: any) => !pl.isAi) as any;
        const localId = humanPlayer?.id || socketService.getSocketId() || '';
        const isLocal = p.id === localId || p.socketId === localId || !p.isAi;

        return {
          id: p.id,
          username: p.username,
          avatar: p.avatar,
          vehicleId: p.vehicleId,
          vehicleColor: p.vehicleColor,
          isAi: p.isAi,
          progress: isLocal ? localStats.progress : (live.progress !== undefined ? live.progress : (p.progress || 0)),
          wpm: isLocal ? localStats.wpm : (live.wpm || p.wpm || 0),
          accuracy: isLocal ? localStats.accuracy : (live.accuracy || p.accuracy || 100),
          placement: live.placement || p.placement || null,
          finishTime: p.finishTime || null,
          isLocal
        };
      })
    : [];

  return (
    <div 
      className="w-full min-h-screen font-sans overflow-hidden relative transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* 1. Landing Page View */}
      {view === 'landing' && (
        <LandingPage
          onEnterGrid={() => setView('lobby')}
          onStartSolo={() => handleStartSolo('medium')}
          onOpenGarage={() => setView('garage')}
          onOpenTracks={() => setView('tracks')}
          onOpenLeaderboard={() => setView('leaderboard')}
          onJoinTrackId={handleJoinPrivateRoom}
          onCreatePrivate={handleCreatePrivateRoom}
          onlineCount={onlineCount}
        />
      )}

      {/* 2. Main Lobby View */}
      {view === 'lobby' && (
        <MainLobby
          profile={profile}
          selectedVehicleId={selectedVehicleId}
          selectedVehicleColor={selectedVehicleColor}
          selectedTrackId={selectedTrackId}
          onlineCount={onlineCount}
          onRaceNow={handleRaceNow}
          onStartSolo={handleStartSolo}
          onCreatePrivate={handleCreatePrivateRoom}
          onJoinPrivate={handleJoinPrivateRoom}
          onOpenGarage={() => setView('garage')}
          onOpenTracks={() => setView('tracks')}
          onOpenLeaderboard={() => setView('leaderboard')}
          onOpenSettings={() => setShowSettings(true)}
          onUpdateColor={(c) => {
            setSelectedVehicleColor(c);
            localStorage.setItem('meanwhile_vehicle_color', c);
            socketService.updateVehicle(selectedVehicleId, c);
          }}
          onSelectTrack={handleSelectTrack}
          onSelectVehicle={(vId) => handleSelectVehicle(vId, selectedVehicleColor)}
        />
      )}

      {/* 3. Private Lobby View */}
      {view === 'private_lobby' && currentRoom && (
        <PrivateLobby
          roomCode={currentRoom.code}
          trackId={currentRoom.trackId}
          hostId={currentRoom.hostId}
          localSocketId={socketService.getSocketId()}
          players={currentRoom.players}
          onStartRace={handleLaunchPrivateRace}
          onToggleReady={handleToggleReady}
          onChangeTrack={handleChangeTrack}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {/* 4. 3D Race Scene & Active HUD */}
      {view === 'racing' && (
        <div className="relative w-full h-screen overflow-hidden bg-charcoal-950">
          {/* Three.js Canvas Container */}
          <div ref={raceCanvasContainerRef} className="absolute inset-0 z-0" />

          {/* Active Race HUD Cockpit */}
          <RaceHud
            passageText={passage.text}
            passageTitle={passage.title}
            passageCategory={passage.category}
            passageAuthor={passage.author}
            passageSourceType={passage.sourceType}
            passageYear={passage.year}
            trackId={currentRoom?.trackId || selectedTrackId}
            trackName={TRACKS.find(t => t.id === (currentRoom?.trackId || selectedTrackId))?.name || 'Chennai Marina Coast'}
            isRacing={isRacing}
            countdown={countdown}
            racers={hudRacers}
            localStats={localStats}
            cameraMode={cameraMode}
            onToggleCamera={handleToggleCamera}
            onKeystroke={handleKeystroke}
            onStatsUpdate={handleStatsUpdate}
            onExitRace={handleExitRace}
          />

          {/* Results Screen Modal */}
          {showResults && (
            <ResultsScreen
              podium={finalPodium}
              localPlayerId={socketService.getSocketId()}
              trackName={TRACKS.find(t => t.id === (currentRoom?.trackId || selectedTrackId))?.name || 'Tokyo Night Run'}
              passage={passage}
              onRematch={() => socketService.rematch()}
              onReturnToLobby={() => {
                setShowResults(false);
                sound.stopEngine();
                setCurrentRoom(null);
                setIsRacing(false);
                setView('lobby');
                socketService.leaveRoom();
              }}
            />
          )}
        </div>
      )}

      {/* 5. 3D Garage Showroom */}
      {view === 'garage' && (
        <GarageScreen
          currentVehicleId={selectedVehicleId}
          currentColor={selectedVehicleColor}
          playerLevel={profile.level}
          onSelectVehicle={handleSelectVehicle}
          onBack={() => setView('lobby')}
        />
      )}

      {/* 6. Global Tracks Selection */}
      {view === 'tracks' && (
        <TrackSelectionScreen
          selectedTrackId={selectedTrackId}
          onSelectTrack={handleSelectTrack}
          onBack={() => setView('lobby')}
        />
      )}

      {/* 7. Global Leaderboard */}
      {view === 'leaderboard' && (
        <LeaderboardScreen
          currentUserId={profile.id}
          onBack={() => setView('lobby')}
        />
      )}

      {/* Matchmaking Queue Modal */}
      {showMatchmaking && (
        <MatchmakingModal
          queueLength={queueLength}
          selectedTrackId={selectedTrackId}
          username={profile.username}
          avatar={profile.avatar}
          onCancel={handleCancelMatchmaking}
          onInstantBotMatch={() => {
            sound.playClick();
            socketService.instantBotMatch(selectedTrackId);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          profile={profile}
          graphicsQuality={graphicsQuality}
          onUpdateQuality={handleUpdateQuality}
          onUpdateProfile={setProfile}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
