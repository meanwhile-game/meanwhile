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
    gameMode,
    progress,
    wpm,
    speedKmh 
  } = useGameStore();

  const lastBroadcastRef = useRef(0);

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

  // 2. Opponent Simulation & Multiplayer Tick Loop
  useEffect(() => {
    if (!isRacing) return;

    const interval = setInterval(() => {
      // Advance AI bots
      tickRaceBots(0.1);

      // In multiplayer, broadcast throttled progress (~10Hz)
      if (gameMode === 'multiplayer' || gameMode === 'private_room') {
        const now = Date.now();
        if (now - lastBroadcastRef.current > 100) {
          multiplayer.sendProgress(progress, wpm, speedKmh, 0);
          lastBroadcastRef.current = now;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRacing, tickRaceBots, gameMode, progress, wpm, speedKmh]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#070a13]">
      {/* 3D WebGL Canvas Layer */}
      <RaceCanvas />

      {/* Floating Tactical Race HUD Layer */}
      <RaceHud />
    </div>
  );
};
