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
  const [view, setView] = useState<ViewMode>('landing');
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // User Profile
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem('veloce_user_id');
    if (!id) {
      id = `pilot_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('veloce_user_id', id);
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
    favoriteTrack: 'tokyo',
    recentRaces: []
  });

  // Selected Machine & Track
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return localStorage.getItem('veloce_vehicle_id') || 'cyber-gt';
  });
  const [selectedVehicleColor, setSelectedVehicleColor] = useState<string>(() => {
    return localStorage.getItem('veloce_vehicle_color') || '#00ff87';
  });
  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => {
    return localStorage.getItem('veloce_track_id') || 'tokyo';
  });
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>(() => {
    return (localStorage.getItem('veloce_quality') as any) || 'high';
  });

  // Server & Multiplayer States
  const [onlineCount, setOnlineCount] = useState<number>(14);
  const [queueLength, setQueueLength] = useState<number>(1);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [socketId, setSocketId] = useState<string>('');

  // Active Race States
  const [countdown, setCountdown] = useState<number>(-1);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [passage, setPassage] = useState<{ id: string; text: string; title: string; category: string }>({
    id: 'tokyo-shuto',
    title: 'Midnight Expressway',
    category: 'Cyberpunk Racing',
    text: 'Rain slicks the elevated highway as neon reflections streak across carbon fiber bodywork. At two hundred miles per hour through the heart of Tokyo, the blur of brake lights turns the night into a ribbon of crimson and electric cyan.'
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

  // 3D Scene Ref
  const raceCanvasContainerRef = useRef<HTMLDivElement>(null);
  const raceSceneRef = useRef<RaceSceneManager | null>(null);

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
        const racerList: RacerDisplayData[] = Object.values(currentRoom.players).map((p: any, idx) => ({
          id: p.id,
          vehicleId: p.vehicleId || 'cyber-gt',
          vehicleColor: p.vehicleColor || '#00ff87',
          isLocal: p.socketId === socketService.getSocketId() || p.id === socketService.getSocketId(),
          targetProgress: p.progress || 0,
          currentProgress: p.progress || 0,
          laneIndex: idx % 4,
          wpm: p.wpm || 0
        }));
        manager.setRacers(racerList, socketService.getSocketId());
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
      const racerList: RacerDisplayData[] = Object.values(currentRoom.players).map((p: any, idx) => {
        const live = racersProgress[p.id] || {};
        return {
          id: p.id,
          vehicleId: p.vehicleId || 'cyber-gt',
          vehicleColor: p.vehicleColor || '#00ff87',
          isLocal: p.socketId === socketService.getSocketId() || p.id === socketService.getSocketId(),
          targetProgress: live.progress !== undefined ? live.progress : (p.progress || 0),
          currentProgress: live.progress !== undefined ? live.progress : (p.progress || 0),
          laneIndex: idx % 4,
          wpm: live.wpm || p.wpm || 0
        };
      });
      raceSceneRef.current.setRacers(racerList, socketService.getSocketId());
    }
  }, [currentRoom?.players, view]);

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

  const handleStartSolo = (difficulty: 'easy' | 'medium' | 'hard') => {
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
          setView('racing');
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
    if (window.confirm('Are you sure you want to exit to the lobby?')) {
      socketService.leaveRoom();
      sound.stopEngine();
      setCurrentRoom(null);
      setIsRacing(false);
      setShowResults(false);
      setView('lobby');
    }
  };

  const handleKeystroke = (index: number, char: string, isError: boolean) => {
    socketService.sendKeystroke({
      index,
      char,
      isError,
      clientTimestamp: Date.now()
    });
  };

  const handleStatsUpdate = (stats: { wpm: number; accuracy: number; progress: number; currentTypedIndex: number }) => {
    setLocalStats(stats);
    raceSceneRef.current?.updateProgress(socketService.getSocketId(), stats.progress, stats.wpm);
  };

  const handleSelectVehicle = (vehicleId: string, color: string) => {
    setSelectedVehicleId(vehicleId);
    setSelectedVehicleColor(color);
    localStorage.setItem('veloce_vehicle_id', vehicleId);
    localStorage.setItem('veloce_vehicle_color', color);
    socketService.updateVehicle(vehicleId, color);
  };

  const handleSelectTrack = (trackId: string) => {
    setSelectedTrackId(trackId);
    localStorage.setItem('veloce_track_id', trackId);
    setView('lobby');
  };

  const handleUpdateQuality = (quality: 'low' | 'medium' | 'high') => {
    setGraphicsQuality(quality);
    localStorage.setItem('veloce_quality', quality);
    raceSceneRef.current?.setQuality(quality);
  };

  // Convert current room players for Race HUD
  const hudRacers: RacerHudData[] = currentRoom?.players
    ? Object.values(currentRoom.players).map((p: any) => {
        const live = racersProgress[p.id] || {};
        const isLocal = p.socketId === socketService.getSocketId() || p.id === socketService.getSocketId();

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
            isRacing={isRacing}
            countdown={countdown}
            racers={hudRacers}
            localStats={localStats}
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
              onRematch={() => socketService.rematch()}
              onReturnToLobby={() => {
                setShowResults(false);
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
          onCancel={handleCancelMatchmaking}
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
