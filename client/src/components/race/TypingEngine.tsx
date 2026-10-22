import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../sound/soundEngine.js';

interface TypingEngineProps {
  passageText: string;
  isRacing: boolean;
  onKeystroke: (index: number, char: string, isError: boolean) => void;
  onStatsUpdate: (stats: { wpm: number; accuracy: number; progress: number; currentTypedIndex: number }) => void;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  passageText,
  isRacing,
  onKeystroke,
  onStatsUpdate
}) => {
  const [typedIndex, setTypedIndex] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [incorrectChar, setIncorrectChar] = useState<string>('');

  const startTimeRef = useRef<number | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRacing && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [isRacing]);

  const handleContainerClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  useEffect(() => {
    setTypedIndex(0);
    setErrorsCount(0);
    setTotalKeystrokes(0);
    setHasError(false);
    setIncorrectChar('');
    startTimeRef.current = null;
  }, [passageText]);

  useEffect(() => {
    if (isRacing && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, [isRacing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRacing || typedIndex >= passageText.length) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (hasError) {
        setHasError(false);
        setIncorrectChar('');
        sound.playKeyClick(false);
      }
      return;
    }

    if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    e.preventDefault();

    const expectedChar = passageText[typedIndex];
    const key = e.key;

    setTotalKeystrokes(prev => prev + 1);

    if (hasError) {
      sound.playKeyError();
      return;
    }

    if (key === expectedChar) {
      sound.playKeyClick(key === ' ');
      const newIndex = typedIndex + 1;
      setTypedIndex(newIndex);
      onKeystroke(typedIndex, key, false);

      const elapsedMin = (Date.now() - (startTimeRef.current || Date.now())) / 60000;
      const wpm = elapsedMin > 0 ? Math.round((newIndex / 5) / elapsedMin) : 0;
      const acc = totalKeystrokes + 1 > 0
        ? Math.max(0, Math.round(((totalKeystrokes + 1 - errorsCount) / (totalKeystrokes + 1)) * 100))
        : 100;
      const progress = newIndex / passageText.length;

      sound.updateEnginePitch(wpm);
      onStatsUpdate({ wpm, accuracy: acc, progress, currentTypedIndex: newIndex });
    } else {
      sound.playKeyError();
      setHasError(true);
      setIncorrectChar(key);
      setErrorsCount(prev => prev + 1);
      onKeystroke(typedIndex, key, true);

      const elapsedMin = (Date.now() - (startTimeRef.current || Date.now())) / 60000;
      const wpm = elapsedMin > 0 ? Math.round((typedIndex / 5) / elapsedMin) : 0;
      const acc = Math.max(0, Math.round(((totalKeystrokes + 1 - (errorsCount + 1)) / (totalKeystrokes + 1)) * 100));
      const progress = typedIndex / passageText.length;

      onStatsUpdate({ wpm, accuracy: acc, progress, currentTypedIndex: typedIndex });
    }
  }, [isRacing, typedIndex, passageText, hasError, totalKeystrokes, errorsCount, onKeystroke, onStatsUpdate]);

  const correctText = passageText.slice(0, typedIndex);
  const currentChar = typedIndex < passageText.length ? passageText[typedIndex] : '';
  const remainingText = typedIndex + 1 < passageText.length ? passageText.slice(typedIndex + 1) : '';

  return (
    <div
      className="relative w-full cursor-text select-none focus:outline-none"
      onClick={handleContainerClick}
    >
      <input
        ref={hiddenInputRef}
        type="text"
        autoFocus
        tabIndex={0}
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        aria-label="Race Typing Input"
      />

      <div className="font-mono text-base sm:text-lg md:text-xl leading-relaxed tracking-wide">
        {/* Correct text */}
        <span style={{ color: 'var(--accent)' }} className="font-medium">
          {correctText}
        </span>

        {/* Current Active Character / Caret */}
        {typedIndex < passageText.length && (
          <span className="relative inline-block">
            {hasError ? (
              <span className="bg-red-500/80 text-white px-0.5 rounded font-bold">
                {incorrectChar === ' ' ? '␣' : incorrectChar}
              </span>
            ) : (
              <span 
                className="relative px-0.5 font-bold rounded-sm border-b-2"
                style={{ 
                  backgroundColor: 'var(--accent-subtle)', 
                  borderColor: 'var(--accent)',
                  color: 'var(--text-primary)'
                }}
              >
                {currentChar === ' ' ? '␣' : currentChar}
              </span>
            )}
          </span>
        )}

        {/* Remaining text */}
        <span style={{ color: 'var(--text-muted)' }} className="opacity-75">
          {remainingText}
        </span>
      </div>

      {hasError && (
        <div className="mt-2 text-xs font-mono text-red-400 flex items-center gap-1.5 animate-pulse">
          <span>Correction required: Press Backspace to resume acceleration</span>
        </div>
      )}
    </div>
  );
};
