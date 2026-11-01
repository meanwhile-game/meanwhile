import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGrossWpm,
  calculateNetWpm,
  calculateCorrectCharsWpm,
  calculateAccuracy,
  calculateRollingWpm,
  calculateVehicleDynamics,
  formatRaceTime
} from './typingEngine.js';

test('calculateGrossWpm: computes standard 5-character word rate correctly', () => {
  // 500 characters in 60 seconds (1 minute) = 100 words = 100 WPM
  assert.equal(calculateGrossWpm(500, 60), 100);

  // 250 characters in 30 seconds = (50 words) / 0.5 min = 100 WPM
  assert.equal(calculateGrossWpm(250, 30), 100);

  // Fast typing: 750 characters in 60s = 150 WPM
  assert.equal(calculateGrossWpm(750, 60), 150);

  // Slow typing: 175 characters in 60s = 35 WPM
  assert.equal(calculateGrossWpm(175, 60), 35);
});

test('calculateGrossWpm: handles boundary zero elapsed time safely', () => {
  // 0 seconds elapsed or negative should return 0, not NaN or Infinity
  assert.equal(calculateGrossWpm(10, 0), 0);
  assert.equal(calculateGrossWpm(0, 10), 0);
  assert.equal(calculateGrossWpm(0, 0), 0);

  // Very short elapsed time (< 0.6s) is clamped to baseline to avoid division by microsecond spikes
  const veryEarlyWpm = calculateGrossWpm(5, 0.1);
  assert.ok(Number.isFinite(veryEarlyWpm));
  assert.ok(veryEarlyWpm <= 400);
});

test('calculateNetWpm: applies penalty for uncorrected errors', () => {
  // 500 chars (100 words) in 60s with 0 uncorrected errors = 100 Net WPM
  assert.equal(calculateNetWpm(500, 0, 60), 100);

  // 500 chars (100 words) in 60s with 5 uncorrected errors = 95 Net WPM
  assert.equal(calculateNetWpm(500, 5, 60), 95);

  // Extreme errors cannot produce negative WPM
  assert.equal(calculateNetWpm(50, 50, 60), 0);
});

test('calculateCorrectCharsWpm: measures exact correct character output', () => {
  assert.equal(calculateCorrectCharsWpm(300, 60), 60);
  assert.equal(calculateCorrectCharsWpm(0, 60), 0);
});

test('calculateAccuracy: calculates correct percentage of attempted keystrokes', () => {
  // Perfect 100%
  assert.equal(calculateAccuracy(100, 0), 100);
  assert.equal(calculateAccuracy(0, 0), 100);

  // 95% accuracy (5 errors in 100 attempts)
  assert.equal(calculateAccuracy(100, 5), 95);

  // 98% accuracy (2 errors in 100 attempts)
  assert.equal(calculateAccuracy(100, 2), 98);

  // Severe errors (clamped to 0 minimum)
  assert.equal(calculateAccuracy(50, 60), 0);
});

test('calculateRollingWpm: prunes old keystrokes and computes smoothed rolling window', () => {
  const now = 10000;
  // 25 keystrokes in last 2.5 seconds (25 chars / 5 = 5 words in 2.5s -> 120 WPM)
  const history = [
    { time: now - 3500, count: 10 }, // should be pruned
    { time: now - 2000, count: 10 },
    { time: now - 1000, count: 10 },
    { time: now - 100, count: 5 }
  ];

  const result = calculateRollingWpm(history, now, 2500);
  assert.equal(result.prunedHistory.length, 3);
  // (25 / 5) / (2.5 / 60) = 5 * 24 = 120 WPM
  assert.equal(result.rollingWpm, 120);

  // Test smoothing with prior rolling WPM
  const smoothed = calculateRollingWpm(history, now, 2500, 100, 0.5);
  // 0.5 * 120 + 0.5 * 100 = 110
  assert.equal(smoothed.rollingWpm, 110);
});

test('calculateVehicleDynamics: translates typing speed and accuracy into km/h and gear', () => {
  // Idle / slow (30 WPM, 100% acc) -> gear 2
  const slow = calculateVehicleDynamics(30, 100);
  assert.ok(slow.targetSpeedKmh >= 25);
  assert.equal(slow.gear, 2);

  // Mid-range (75 WPM, 100% acc) -> ~144 km/h -> gear 4
  const mid = calculateVehicleDynamics(75, 100);
  assert.ok(mid.targetSpeedKmh >= 135 && mid.targetSpeedKmh < 185);
  assert.equal(mid.gear, 4);

  // Pro high speed (120 WPM, 100% acc) -> ~230 km/h -> gear 5
  const fast = calculateVehicleDynamics(120, 100);
  assert.ok(fast.targetSpeedKmh >= 185);
  assert.equal(fast.gear, 5);

  // Supercar top speed (>135 WPM) -> gear 6
  const hyper = calculateVehicleDynamics(140, 100);
  assert.ok(hyper.targetSpeedKmh >= 240);
  assert.equal(hyper.gear, 6);

  // Low accuracy penalty slows down vehicle
  const penalized = calculateVehicleDynamics(100, 50);
  const unpenalized = calculateVehicleDynamics(100, 100);
  assert.ok(penalized.targetSpeedKmh < unpenalized.targetSpeedKmh);
});

test('formatRaceTime: formats elapsed seconds into mm:ss.SS correctly', () => {
  assert.equal(formatRaceTime(0), '00:00.00');
  assert.equal(formatRaceTime(42.18), '00:42.18');
  assert.equal(formatRaceTime(65.4), '01:05.40');
  assert.equal(formatRaceTime(125.05), '02:05.05');
});
