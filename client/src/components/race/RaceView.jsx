import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { RaceCanvas } from './RaceCanvas.jsx';
import { RaceHud } from './RaceHud.jsx';
import { multiplayer } from '../../services/multiplayer.js';

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
    elapsedSeconds
  } = useGameStore();

  const lastBroadcastRef = useRef(0);
  const isRacingRef = useRef(isRacing);
  isRacingRef.current = isRacing;

  // 1. Keyboard Typing Event Listener
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore functional modifier shortcuts (e.g. Ctrl+R, Alt+Tab, F12)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

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

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
    <div className="relative w-full h-screen overflow-hidden bg-[#070a13]">
      {/* 3D WebGL Canvas Layer */}
      <RaceCanvas />

      {/* Floating Tactical Race HUD Layer */}
      <RaceHud />
    </div>
  );
};
