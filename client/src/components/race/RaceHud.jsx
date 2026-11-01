import React, { useMemo, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore.js';
import { getTrackById } from '../../data/tracks.js';
import { SpeedometerGauge } from './SpeedometerGauge.jsx';
import { TrackMinimap } from './TrackMinimap.jsx';
import { TacticalGpsMap } from './TacticalGpsMap.jsx';
import { ArrowLeft, Wifi, Activity, CheckCircle, AlertTriangle, Map, Navigation, Columns, Eye } from 'lucide-react';
import { soundEngine } from '../../sound/soundEngine.js';

// Real-time 60 FPS performance monitor
const FpsMonitor = () => {
  const [fps, setFps] = React.useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());

  useEffect(() => {
    let animId;
    const loop = (now) => {
      frameCount.current++;
      if (now - lastTime.current >= 500) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastTime.current)));
        frameCount.current = 0;
        lastTime.current = now;
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono-num text-emerald-400 font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>{fps} FPS</span>
    </div>
  );
};

export const RaceHud = () => {
  const {
    passage,
    typedText,
    errorText = '',
    cursorIndex = 0,
    wpm,
    grossWpm,
    netWpm,
    accuracy,
    speedKmh,
    gear,
    progress,
    lap,
    totalLaps,
    elapsedSeconds,
    racers,
    finalRank,
    countdown,
    isCountdown,
    selectedTrackId,
    setView,
    gpsNavMode = 'compact',
    setGpsNavMode,
    graphicsQuality = 'high',
    setGraphicsQuality
  } = useGameStore();

  const [mapType, setMapType] = React.useState('schematic'); // 'schematic' (instant 0ms) | 'gps' (satellite)


  const track = getTrackById(selectedTrackId);

  // Format elapsed time 00:42.18
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(2);
  const [secWhole, secDec] = secs.split('.');
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secWhole).padStart(2, '0')}.${secDec || '00'}`;

  const targetText = passage?.text || "The sun dipped behind the hills as the coastal road unfolded ahead, a perfect stretch for one more run.";
  const typedLength = typedText.length;
  const remainingChars = Math.max(0, targetText.length - typedLength);

  // Word-level tokenization for accurate word-box highlighting & active line scrolling
  const { completedText, currentWord, upcomingText, currentWordTypedPart, currentWordRemainingPart } = useMemo(() => {
    let wordStart = targetText.lastIndexOf(' ', Math.max(0, typedLength - 1));
    wordStart = wordStart === -1 ? 0 : wordStart + 1;

    let wordEnd = targetText.indexOf(' ', typedLength);
    if (wordEnd === -1) wordEnd = targetText.length;

    const completed = targetText.slice(0, wordStart);
    const currWord = targetText.slice(wordStart, wordEnd);
    const upcoming = targetText.slice(wordEnd);

    const typedInWord = Math.max(0, typedLength - wordStart);
    const currTyped = currWord.slice(0, typedInWord);
    const currRemaining = currWord.slice(typedInWord);

    return {
      completedText: completed,
      currentWord: currWord,
      upcomingText: upcoming,
      currentWordTypedPart: currTyped,
      currentWordRemainingPart: currRemaining
    };
  }, [targetText, typedLength]);

  // Container ref for smooth auto-scrolling on longer passages
  const textContainerRef = useRef(null);
  const activeWordRef = useRef(null);

  useEffect(() => {
    if (activeWordRef.current && textContainerRef.current) {
      const container = textContainerRef.current;
      const element = activeWordRef.current;
      const elementOffset = element.offsetTop - container.offsetTop;
      // Keep active line vertically centered within the typing view
      container.scrollTo({
        top: Math.max(0, elementOffset - 24),
        behavior: 'smooth'
      });
    }
  }, [typedLength]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6 lg:p-7 z-20 overflow-hidden font-sans">
      {/* =========================================================================
          1. MINIMAL TACTICAL TOP HUD BAR
          ========================================================================= */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left: Exit, Position, Lap, Monotonic Timer & Minimap */}
        <div className="flex flex-col items-start gap-2.5">
          {/* Top Actions: Exit Button & Graphics Settings / Live FPS */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                soundEngine.stopEngine();
                setView('tracks');
              }}
              className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-[11px] text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Exit Race</span>
            </button>

            {/* Graphics Quality Preset Switcher & FPS Monitor */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-lg">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#64748b] ml-1 mr-0.5">
                GFX
              </span>
              {['low', 'medium', 'high'].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setGraphicsQuality(q);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    graphicsQuality === q
                      ? 'bg-amber-400 text-black shadow-sm font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {q === 'medium' ? 'MED' : q.toUpperCase()}
                </button>
              ))}
              <div className="h-3 w-px bg-white/20 mx-0.5" />
              <FpsMonitor />
            </div>
          </div>

          {/* Position & Time Instrument Cluster */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl">
            {/* Position Display */}
            <div className="flex flex-col items-center border-r border-white/10 pr-3">
              <span className="text-[9px] tracking-widest font-bold text-[#64748b] uppercase">
                POS
              </span>
              <div className="flex items-baseline gap-0.5 font-mono-num leading-none mt-0.5">
                <span className="text-2xl font-black text-[#f8fafc]">{finalRank}</span>
                <span className="text-xs font-bold text-[#64748b]">/8</span>
              </div>
            </div>

            {/* Lap & Time */}
            <div className="flex flex-col items-start space-y-0.5 font-mono-num">
              <div className="text-[10px] text-[#94a3b8] font-bold tracking-wider">
                LAP <span className="text-amber-400 font-extrabold">{lap}/{totalLaps}</span>
              </div>
              <div className="text-sm font-black text-[#f8fafc] tracking-tight">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Tactical Map Display Mode Switcher & Map Render */}
          <div className="mt-1 flex flex-col gap-1.5 pointer-events-auto">
            {/* Map Mode Selector Bar */}
            <div className="flex items-center justify-between gap-1 px-1.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 shadow-lg max-w-[320px]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setMapType('gps');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapType === 'gps'
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>Real GPS Map</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setMapType('schematic');
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    mapType === 'schematic'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  <span>Circuit</span>
                </button>
              </div>

              {/* Split Screen Telemetry Toggle */}
              {setGpsNavMode && (
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setGpsNavMode(gpsNavMode === 'split' ? 'compact' : 'split');
                  }}
                  title={gpsNavMode === 'split' ? "Single Screen View" : "Split-Screen Real Map Cockpit"}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    gpsNavMode === 'split'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>{gpsNavMode === 'split' ? 'Close Split' : 'Split Nav'}</span>
                </button>
              )}
            </div>

            {/* Render Selected Map: Real GPS Satellite/Street Map vs Schematic */}
            {gpsNavMode !== 'split' && (
              <div>
                {mapType === 'gps' ? (
                  <TacticalGpsMap 
                    track={track} 
                    progress={progress} 
                    speedKmh={speedKmh} 
                    racers={racers} 
                    mode="compact"
                    onModeChange={setGpsNavMode}
                  />
                ) : (
                  <TrackMinimap racers={racers} playerProgress={progress} track={track} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top-Right: Ping Badge & Compact Live Standings */}
        <div className="flex flex-col items-end gap-2">
          {/* Latency Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono-num text-emerald-400 shadow-md">
            <Wifi className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
            <span className="font-bold">28 ms</span>
          </div>

          {/* Compact Standings Board */}
          <div className="w-52 sm:w-56 rounded-xl bg-black/65 backdrop-blur-xl border border-white/10 p-2 shadow-2xl flex flex-col gap-1 text-[11px]">
            {racers.slice(0, 8).map((racer, index) => {
              const isPlayer = racer.isPlayer;
              return (
                <div
                  key={racer.id || index}
                  className={`flex items-center justify-between px-2 py-1 rounded-md font-medium transition-all ${
                    isPlayer
                      ? 'bg-gradient-to-r from-amber-500/25 to-indigo-600/35 text-white font-bold border border-amber-400/40 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 font-mono-num text-[10px] ${isPlayer ? 'text-amber-300 font-bold' : 'text-[#64748b]'}`}>
                      #{index + 1}
                    </span>
                    <span className="truncate max-w-[85px] tracking-wide">
                      {racer.name || racer.username}
                    </span>
                  </div>
                  <span className={`font-mono-num text-[10px] ${isPlayer ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                    {racer.wpm} WPM
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. BOTTOM COCKPIT TYPING CONSOLE & TELEMETRY POD (Occupies ~20% of screen)
             Leaving 75-80% of upper screen completely open for the 3D car and track!
          ========================================================================= */}
      <div className="w-full flex items-end justify-between gap-4 mt-auto">
        {/* Left Telemetry Cluster (WPM, Net WPM, Accuracy) */}
        <div className="hidden md:flex flex-col gap-2 p-3.5 rounded-2xl bg-[#090e1c]/90 backdrop-blur-xl border border-white/10 shadow-2xl min-w-[130px] select-none pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400">
              NET WPM
            </span>
            <span className="text-2xl font-black font-mono-num text-[#f8fafc] leading-none">
              {netWpm || wpm}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#64748b]">
              RAW WPM
            </span>
            <span className="text-xs font-bold font-mono-num text-slate-300">
              {grossWpm || wpm}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#64748b]">
              ACCURACY
            </span>
            <span className="text-xs font-bold font-mono-num text-emerald-400">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Center Main Typing Console with Monospace Readout & Line Scrolling */}
        <div className="flex-1 max-w-4xl mx-auto rounded-2xl bg-[#090e1c]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)] p-4 sm:p-5 pointer-events-auto select-none flex flex-col justify-between">
          {/* Scrollable Text Viewport */}
          <div
            ref={textContainerRef}
            className="max-h-20 sm:max-h-24 overflow-y-hidden overflow-x-hidden font-mono text-lg sm:text-xl lg:text-2xl leading-relaxed tracking-wide scroll-smooth transition-all"
          >
            {/* Completed Characters in Emerald Green */}
            <span className="text-emerald-400 font-semibold drop-shadow-sm">
              {completedText}
            </span>

            {/* Active Word with Pill Badge, Glowing Outline, Caret & Typo Handling */}
            {currentWord && (
              <span
                ref={activeWordRef}
                className={`inline-flex items-center px-1.5 py-0.5 rounded-lg text-white font-medium shadow-inner mx-0.5 transition-colors ${
                  errorText.length > 0
                    ? 'bg-rose-950/90 border border-rose-500/70 shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                    : 'bg-indigo-950/70 border border-indigo-400/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                }`}
              >
                {/* Correctly Typed Letters in Current Word */}
                <span className="text-emerald-300 font-semibold">{currentWordTypedPart}</span>

                {/* Error Characters Blocking Progression */}
                {errorText.length > 0 ? (
                  <>
                    <span className="bg-rose-500/50 text-rose-100 border border-rose-400/80 rounded px-1 line-through mx-0.5 text-base font-bold animate-pulse">
                      {errorText}
                    </span>
                    <span className="w-0.5 h-6 bg-rose-400 animate-cursor-blink mx-[1px]" />
                  </>
                ) : (
                  /* Smooth Active Caret Indicator */
                  <span className="w-0.5 h-6 bg-white animate-cursor-blink mx-[1px] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}

                {/* Untyped Remainder of Active Word */}
                <span className="text-slate-200">{currentWordRemainingPart}</span>
              </span>
            )}

            {/* Upcoming Untyped Words in Muted Grey */}
            <span className="text-[#8492a6]/70">
              {upcomingText}
            </span>
          </div>

          {/* Bottom Telemetry Strip inside Console */}
          <div className="mt-3.5 pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs font-mono-num">
            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 rounded-full transition-all duration-100 ease-out shadow-sm"
                  style={{ width: `${Math.min(100, progress * 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#94a3b8] whitespace-nowrap">
                {Math.round(progress * 100)}%
              </span>
            </div>

            {/* Keystrokes & Character Counters */}
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-[#64748b] tracking-wider">
              <span>
                Typed: <strong className="text-slate-300">{typedLength}</strong>/{targetText.length}
              </span>
              <span>
                Left: <strong className="text-slate-300">{remainingChars}</strong>
              </span>
              {/* Mobile WPM fallback */}
              <span className="md:hidden text-amber-400 font-bold">
                {wpm} WPM
              </span>
            </div>
          </div>
        </div>

        {/* Right Telemetry: Digital Instrument Cluster Speedometer */}
        <div className="flex-shrink-0">
          <SpeedometerGauge speed={speedKmh} maxSpeed={320} gear={gear} />
        </div>
      </div>

      {/* =========================================================================
          3. MOTORSPORT GRAND PRIX COUNTDOWN OVERLAY
          ========================================================================= */}
      {isCountdown && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all pointer-events-none">
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            {/* Grand Prix Starting Lights Gantry */}
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-neutral-950/90 border border-white/20 shadow-2xl mb-8">
              {[1, 2, 3, 4, 5].map((lightIdx) => {
                const isActive = countdown === 0 ? false : (4 - countdown) >= Math.ceil(lightIdx * 0.6);
                const isGo = countdown === 0;
                return (
                  <div key={lightIdx} className="flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-black/80 border border-white/10">
                    <div className={`w-5 h-5 rounded-full transition-all duration-150 ${
                      isGo 
                        ? 'bg-emerald-400 shadow-[0_0_20px_#10b981]' 
                        : isActive 
                          ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' 
                          : 'bg-neutral-800'
                    }`} />
                  </div>
                );
              })}
            </div>

            {/* Huge Dynamic Countdown Counter */}
            <div className={`text-9xl sm:text-[11rem] font-black font-mono-num tracking-tighter transition-all duration-150 select-none ${
              countdown === 3 
                ? 'text-red-500 drop-shadow-[0_0_60px_rgba(239,68,68,0.9)] scale-100'
                : countdown === 2
                  ? 'text-amber-400 drop-shadow-[0_0_60px_rgba(245,158,11,0.9)] scale-105'
                  : countdown === 1
                    ? 'text-cyan-400 drop-shadow-[0_0_60px_rgba(6,182,212,0.9)] scale-110'
                    : 'text-emerald-400 drop-shadow-[0_0_80px_rgba(16,185,129,1.0)] scale-125 animate-pulse'
            }`}>
              {countdown > 0 ? countdown : 'GO!'}
            </div>

            {/* High-Octane Subtitle Prompt */}
            <div className="mt-6 flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className={`w-2 h-2 rounded-full animate-ping ${countdown === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-white">
                {countdown === 0 ? 'FULL THROTTLE — TYPE PASSAGE TO WIN!' : 'READY ENGINES — FOCUS ON FIRST WORD'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
