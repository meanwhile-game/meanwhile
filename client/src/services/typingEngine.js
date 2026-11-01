/**
 * Meanwhile 2.0 - Accurate Typing Metrics & Calculation Engine
 * 
 * Implements international typing standards:
 * - Five-character word standard: 1 Word = 5 keystrokes/characters.
 * - Monotonic high-resolution timing via performance.now() with fallback to Date.now().
 * - Clearly distinguished Gross WPM, Net WPM, Rolling WPM, and Accuracy.
 * - Safe division bounds (t_min = 0.01 min = 0.6s) to eliminate early spike anomalies.
 */

/**
 * Gross Words Per Minute (GWPM):
 * Measures raw typing speed without error deductions.
 * Formula: (Total Characters Typed / 5) / (Elapsed Time in Minutes)
 * 
 * @param {number} totalCharsTyped - Total characters entered by player (including spaces & corrected typos)
 * @param {number} elapsedSeconds - Monotonic elapsed race time in seconds
 * @returns {number} Integer Gross WPM clamped to [0, 400]
 */
export function calculateGrossWpm(totalCharsTyped, elapsedSeconds) {
  if (!totalCharsTyped || totalCharsTyped <= 0 || !elapsedSeconds || elapsedSeconds <= 0) {
    return 0;
  }
  // Enforce baseline minimum elapsed time (0.6s = 0.01 min) to prevent divide-by-zero or infinite spikes
  const elapsedMinutes = Math.max(0.01, elapsedSeconds / 60);
  const wordsTyped = totalCharsTyped / 5;
  const rawWpm = wordsTyped / elapsedMinutes;
  return Math.max(0, Math.min(400, Math.round(rawWpm)));
}

/**
 * Net Words Per Minute (NWPM):
 * The universal competitive typing standard that penalizes uncorrected or unaddressed errors.
 * Formula: ((Total Characters Typed / 5) - Uncorrected Errors) / Elapsed Time in Minutes
 * Or equivalently: Gross WPM - (Uncorrected Errors / Elapsed Time in Minutes)
 * 
 * @param {number} totalCharsTyped - Total characters entered
 * @param {number} uncorrectedErrors - Number of errors currently uncorrected in text
 * @param {number} elapsedSeconds - Monotonic elapsed race time in seconds
 * @returns {number} Integer Net WPM clamped to >= 0
 */
export function calculateNetWpm(totalCharsTyped, uncorrectedErrors = 0, elapsedSeconds) {
  if (!totalCharsTyped || totalCharsTyped <= 0 || !elapsedSeconds || elapsedSeconds <= 0) {
    return 0;
  }
  const elapsedMinutes = Math.max(0.01, elapsedSeconds / 60);
  const grossWords = totalCharsTyped / 5;
  const netWords = Math.max(0, grossWords - uncorrectedErrors);
  const netWpm = netWords / elapsedMinutes;
  return Math.max(0, Math.min(400, Math.round(netWpm)));
}

/**
 * Correct-Only WPM:
 * Formula: (Correct Characters Typed / 5) / (Elapsed Time in Minutes)
 * 
 * @param {number} correctCharsTyped - Characters strictly matched with target passage
 * @param {number} elapsedSeconds - Monotonic elapsed race time in seconds
 * @returns {number} Integer WPM
 */
export function calculateCorrectCharsWpm(correctCharsTyped, elapsedSeconds) {
  if (!correctCharsTyped || correctCharsTyped <= 0 || !elapsedSeconds || elapsedSeconds <= 0) {
    return 0;
  }
  const elapsedMinutes = Math.max(0.01, elapsedSeconds / 60);
  const wordsTyped = correctCharsTyped / 5;
  return Math.max(0, Math.min(400, Math.round(wordsTyped / elapsedMinutes)));
}

/**
 * Typing Accuracy Percentage:
 * Measures keystroke fidelity.
 * Formula: ((Total Attempted Keystrokes - Total Error Keystrokes) / Total Attempted Keystrokes) * 100
 * 
 * @param {number} totalAttempted - Cumulative keystrokes attempted
 * @param {number} errorCount - Total keystroke errors recorded
 * @returns {number} Integer percentage clamped to [0, 100]
 */
export function calculateAccuracy(totalAttempted, errorCount = 0) {
  if (!totalAttempted || totalAttempted <= 0) {
    return 100;
  }
  const correctKeystrokes = Math.max(0, totalAttempted - errorCount);
  const rawRatio = (correctKeystrokes / totalAttempted) * 100;
  return Math.max(0, Math.min(100, Math.round(rawRatio)));
}

/**
 * Responsive Rolling WPM with Exponential Moving Average (EMA) smoothing:
 * Reacts swiftly to player cadence changes over a short recent window (e.g. 2.5s)
 * without erratic one-keystroke spikes.
 * 
 * @param {Array<{time: number, count: number}>} keystrokeHistory - List of timestamped keystroke events (monotonic ms)
 * @param {number} currentTime - Current timestamp (monotonic ms)
 * @param {number} windowMs - Rolling window width in milliseconds (default 2500ms)
 * @param {number} previousRollingWpm - Previous rolling WPM for smoothing (default null)
 * @param {number} smoothingFactor - Alpha for EMA (0.0 to 1.0, default 0.45)
 * @returns {{ rollingWpm: number, prunedHistory: Array<{time: number, count: number}> }}
 */
export function calculateRollingWpm(
  keystrokeHistory,
  currentTime,
  windowMs = 2500,
  previousRollingWpm = null,
  smoothingFactor = 0.45
) {
  if (!keystrokeHistory || keystrokeHistory.length === 0) {
    return { rollingWpm: 0, prunedHistory: [] };
  }

  // Prune keystrokes outside window
  const cutoffTime = currentTime - windowMs;
  const prunedHistory = keystrokeHistory.filter(k => k.time >= cutoffTime);

  if (prunedHistory.length === 0) {
    const decayed = previousRollingWpm ? Math.max(0, Math.round(previousRollingWpm * 0.85)) : 0;
    return { rollingWpm: decayed, prunedHistory: [] };
  }

  // Total chars typed inside the rolling window
  const charsInWindow = prunedHistory.reduce((sum, k) => sum + (k.count || 1), 0);
  // (charsInWindow / 5) / (windowMs / 60000)
  const windowMinutes = windowMs / 60000;
  const instantWindowWpm = (charsInWindow / 5) / windowMinutes;

  if (previousRollingWpm === null || previousRollingWpm === undefined) {
    return { rollingWpm: Math.round(instantWindowWpm), prunedHistory };
  }

  // Exponential Moving Average (EMA) to eliminate wild fluctuations
  const smoothed = smoothingFactor * instantWindowWpm + (1 - smoothingFactor) * previousRollingWpm;
  return {
    rollingWpm: Math.max(0, Math.min(400, Math.round(smoothed))),
    prunedHistory
  };
}

/**
 * Vehicle Velocity & Transmission Curves:
 * Translates typing pace & accuracy into sports car speed (km/h) and gear (1 to 6).
 * 
 * @param {number} liveWpm - Current smoothed typing speed
 * @param {number} accuracy - Current typing accuracy (0-100)
 * @param {number} maxSpeedKmh - Vehicle top speed capability (default 320)
 * @returns {{ targetSpeedKmh: number, gear: number }}
 */
export function calculateVehicleDynamics(liveWpm, accuracy = 100, maxSpeedKmh = 320) {
  const accMultiplier = Math.max(0.4, (accuracy || 100) / 100);
  // Pace multiplier: 100 WPM equates to ~190 km/h cruising speed
  const baseSpeed = liveWpm * 1.92 * accMultiplier;
  const targetSpeedKmh = Math.max(25, Math.min(maxSpeedKmh, Math.round(baseSpeed)));

  let gear = 1;
  if (targetSpeedKmh >= 240) gear = 6;
  else if (targetSpeedKmh >= 185) gear = 5;
  else if (targetSpeedKmh >= 135) gear = 4;
  else if (targetSpeedKmh >= 85) gear = 3;
  else if (targetSpeedKmh >= 45) gear = 2;

  return { targetSpeedKmh, gear };
}

/**
 * Format elapsed seconds to clean racing digital clock string: "01:24.85"
 * 
 * @param {number} elapsedSeconds 
 * @returns {string} Formatted mm:ss.SS
 */
export function formatRaceTime(elapsedSeconds) {
  if (!elapsedSeconds || elapsedSeconds < 0) return '00:00.00';
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(2);
  const [secWhole, secDec] = secs.split('.');
  return `${String(mins).padStart(2, '0')}:${String(secWhole).padStart(2, '0')}.${secDec || '00'}`;
}
