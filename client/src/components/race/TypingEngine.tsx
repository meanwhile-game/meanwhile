import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../sound/soundEngine.js';

interface TypingEngineProps {
  passageText: string;
  isRacing: boolean;
  onKeystroke: (index: number, char: string, isError: boolean) => void;
  onStatsUpdate: (stats: { wpm: number; accuracy: number; progress: number; currentTypedIndex: number }) => void;
}

// Unicode character normalization for frictionless typing
export const normalizeChar = (c: string): string => {
  if (c === '“' || c === '”') return '"';
  if (c === '‘' || c === '’') return "'";
  if (c === '—' || c === '–') return '-';
  if (c === '\u00A0') return ' ';
  return c;
};

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

  // Focus retention
  const ensureFocus = useCallback(() => {
    if (hiddenInputRef.current && isRacing) {
      hiddenInputRef.current.focus();
    }
  }, [isRacing]);

  useEffect(() => {
    ensureFocus();
    const handleGlobalClick = () => ensureFocus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [ensureFocus]);

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

    // Compare with unicode normalization
    const isMatch = key === expectedChar || normalizeChar(key) === normalizeChar(expectedChar);

    if (isMatch) {
      sound.playKeyClick(key === ' ');
      const newIndex = typedIndex + 1;
      setTypedIndex(newIndex);
      onKeystroke(typedIndex, expectedChar, false);

      const elapsedMin = Math.max(0.015, (Date.now() - (startTimeRef.current || Date.now())) / 60000);
      const wpm = Math.min(240, Math.round((newIndex / 5) / elapsedMin));
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

      const elapsedMin = Math.max(0.015, (Date.now() - (startTimeRef.current || Date.now())) / 60000);
      const wpm = Math.min(240, Math.round((typedIndex / 5) / elapsedMin));
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
      onClick={ensureFocus}
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

      <div className="font-mono text-sm sm:text-base md:text-lg leading-relaxed tracking-wide max-h-24 sm:max-h-28 overflow-hidden">
        {/* Correct text */}
        <span style={{ color: 'var(--accent)' }} className="font-medium">
          {correctText}
        </span>

        {/* Current Active Character / Caret */}
        {typedIndex < passageText.length && (
          <span className="relative inline-block">
            {hasError ? (
              <span className="bg-red-500 text-white px-1 rounded font-bold animate-pulse">
                {incorrectChar === ' ' ? '␣' : incorrectChar}
              </span>
            ) : (
              <span 
                className="relative px-0.5 font-bold rounded-sm border-b-2 shadow-sm"
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
