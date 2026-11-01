import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { RaceCanvas } from './RaceCanvas.jsx';
import { RaceHud } from './RaceHud.jsx';
import { TacticalGpsMap } from './TacticalGpsMap.jsx';
import { multiplayer } from '../../services/multiplayer.js';
import { getTrackById } from '../../data/tracks.js';

export const RaceView = () => {
  const { 
    isRacing, 
    handleKeyInput, 
    handleBackspace, 
    tickRaceBots, 
    updateRemoteRacer,
    gameMode,
    progress,
    wpm,
    speedKmh,
    isFinished,
    elapsedSeconds,
    selectedTrackId,
    racers,
    gpsNavMode = 'compact',
    setGpsNavMode,
    startCountdownTimer
  } = useGameStore();

  const track = getTrackById(selectedTrackId);

  // Trigger crisp synchronized countdown once RaceView has loaded and mounted
  useEffect(() => {
    if (startCountdownTimer) {
      startCountdownTimer();
    }
  }, [startCountdownTimer]);


  const lastBroadcastRef = useRef(0);
  const isRacingRef = useRef(isRacing);
  isRacingRef.current = isRacing;

  // 1. Keyboard Typing Event Listener with Anti-Cheat & Anti-Exploit Protections
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore functional modifier shortcuts (e.g. Ctrl+R, Alt+Tab, F12, Ctrl+V)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Prevent key-repeat hold-down exploit on text input
      if (e.repeat && e.key !== 'Backspace') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        handleKeyInput(' ');
        return;
      }

      // Single character input
      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };

    const onPaste = (e) => {
      // Prevent clipboard pasting text into race
      e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('paste', onPaste);
    };
  }, [handleKeyInput, handleBackspace]);

  // 2. Multiplayer Remote Racer Events (Broadcast & Realtime Listeners)
  useEffect(() => {
    const unsubs = [
      multiplayer.on('remote_progress', (data) => {
        updateRemoteRacer({
          racerId: data.racerId,
          progress: data.progress,
          wpm: data.wpm,
          speed: data.speed,
          lane: data.lane
        });
      }),
      multiplayer.on('remote_finished', (data) => {
        updateRemoteRacer({
          racerId: data.playerId,
          wpm: data.finalWpm,
          isFinished: true,
          finishTime: data.finishTime
        });
      })
    ];

    return () => {
      unsubs.forEach(un => un());
    };
  }, [updateRemoteRacer]);

  // 3. Broadcast local player finish
  useEffect(() => {
    if (isFinished && (gameMode === 'multiplayer' || gameMode === 'private_room')) {
      multiplayer.sendFinished(wpm, elapsedSeconds);
    }
  }, [isFinished, gameMode, wpm, elapsedSeconds]);

  // 4. Stable 10Hz Opponent Simulation & Multiplayer Progress Broadcast
  useEffect(() => {
    if (!isRacing) return;

    const interval = setInterval(() => {
      // Advance AI bots smoothly
      tickRaceBots(0.1);

      // In multiplayer, broadcast progress at steady 10Hz
      const state = useGameStore.getState();
      if (state.gameMode === 'multiplayer' || state.gameMode === 'private_room') {
        const now = Date.now();
        if (now - lastBroadcastRef.current >= 95) {
          multiplayer.sendProgress(state.progress, state.wpm, state.speedKmh, 0);
          lastBroadcastRef.current = now;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRacing, tickRaceBots]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#070a13] flex">
      {/* 3D WebGL Canvas Layer (Adapts width smoothly in Split-Screen mode) */}
      <div className={`relative h-full transition-all duration-500 overflow-hidden ${
        gpsNavMode === 'split' ? 'w-1/2' : gpsNavMode === 'fullscreen' ? 'w-0 hidden' : 'w-full'
      }`}>
        <RaceCanvas />
      </div>

      {/* Split-Screen Real Satellite / Tactical Map View */}
      {gpsNavMode === 'split' && (
        <div className="relative w-1/2 h-full border-l border-white/20 bg-[#070a13] z-10 transition-all duration-500 shadow-2xl p-4 flex flex-col">
          <TacticalGpsMap
            track={track}
            progress={progress}
            speedKmh={speedKmh}
            racers={racers}
            mode="split"
            onModeChange={setGpsNavMode}
          />
        </div>
      )}

      {/* Fullscreen Real Map View */}
      {gpsNavMode === 'fullscreen' && (
        <div className="relative w-full h-full bg-[#070a13] z-10 p-4">
          <TacticalGpsMap
            track={track}
            progress={progress}
            speedKmh={speedKmh}
            racers={racers}
            mode="fullscreen"
            onModeChange={setGpsNavMode}
          />
        </div>
      )}

      {/* Floating Tactical Race HUD Layer */}
      <RaceHud />
    </div>
  );
};
