import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../../sound/soundEngine.js';

interface TypingEngineProps {
  passageText: string;
  isRacing: boolean;
  onKeystroke: (index: number, char: string, isError: boolean) => void;
  onBackspace?: () => void;
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
  onBackspace,
  onStatsUpdate
}) => {
  const [typedIndex, setTypedIndex] = useState<number>(0);
  const [errorsCount, setErrorsCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);
  const [incorrectChar, setIncorrectChar] = useState<string>('');

  const startTimeRef = useRef<number | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

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

  // Smooth auto-scroll to keep active typed position perfectly in view without page jumps
  useEffect(() => {
    if (caretRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const caret = caretRef.current;
      const containerRect = container.getBoundingClientRect();
      const caretRect = caret.getBoundingClientRect();

      if (caretRect.bottom > containerRect.bottom - 12) {
        container.scrollTo({
          top: container.scrollTop + (caretRect.bottom - containerRect.bottom) + 28,
          behavior: 'smooth'
        });
      } else if (caretRect.top < containerRect.top + 12) {
        container.scrollTo({
          top: Math.max(0, container.scrollTop - (containerRect.top - caretRect.top) - 28),
          behavior: 'smooth'
        });
      }
    }
  }, [typedIndex, hasError]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRacing || typedIndex >= passageText.length) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    // Handle Backspace: Clears error or steps back one character (moves car slightly behind)
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (hasError) {
        setHasError(false);
        setIncorrectChar('');
        sound.playKeyClick(false);
        onBackspace?.();
      } else if (typedIndex > 0) {
        const newIndex = typedIndex - 1;
        setTypedIndex(newIndex);
        sound.playKeyClick(false);

        const elapsedMin = Math.max(0.015, (Date.now() - (startTimeRef.current || Date.now())) / 60000);
        const wpm = Math.min(240, Math.round((newIndex / 5) / elapsedMin));
        const acc = totalKeystrokes > 0
          ? Math.max(0, Math.round(((totalKeystrokes - errorsCount) / totalKeystrokes) * 100))
          : 100;
        const progress = newIndex / passageText.length;

        onStatsUpdate({ wpm, accuracy: acc, progress, currentTypedIndex: newIndex });
        onBackspace?.();
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
      // Wrong typing: Car slams on the brakes with screeching sound!
      sound.playKeyError();
      sound.playBrakeScreech();
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
  }, [isRacing, typedIndex, passageText, hasError, totalKeystrokes, errorsCount, onKeystroke, onBackspace, onStatsUpdate]);

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

      <div 
        ref={textContainerRef}
        className="font-mono text-base sm:text-lg leading-relaxed tracking-wide max-h-24 sm:max-h-28 overflow-y-auto scroll-smooth py-0.5 select-none"
      >
        {/* Correct text */}
        <span style={{ color: 'var(--accent)' }} className="font-semibold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
          {correctText}
        </span>

        {/* Current Active Character / Caret */}
        {typedIndex < passageText.length && (
          <span ref={caretRef} className="relative inline-block mx-0.5">
            {hasError ? (
              <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded font-black shadow-lg animate-pulse">
                {incorrectChar === ' ' ? '␣' : incorrectChar}
              </span>
            ) : (
              <span 
                className="relative px-1 py-0.5 font-bold rounded-sm border-b-2 shadow-sm bg-cyan-400/20 border-cyan-400 text-white"
              >
                {currentChar === ' ' ? '␣' : currentChar}
              </span>
            )}
          </span>
        )}

        {/* Remaining text */}
        <span style={{ color: 'var(--text-muted)' }} className="text-slate-400 opacity-80">
          {remainingText}
        </span>
      </div>

      {hasError && (
        <div className="mt-2 text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5 animate-pulse">
          <span>⚠️ Brake engaged! Press [Backspace] to clear error and resume throttle</span>
        </div>
      )}
    </div>
  );
};
