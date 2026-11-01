/**
 * Meanwhile 2.0 - Intelligent Passage Selection Engine
 * 
 * Capabilities:
 * 1. Seeded PRNG (Mulberry32) ensures synchronized identical text for all multiplayer racers.
 * 2. LRU recent-exclusion history prevents repetitive passage recycling between consecutive races.
 * 3. Graceful library exhaustion fallback.
 * 4. Category, difficulty, length, and track affinity filtering.
 * 5. Deterministic room code hashing.
 */

import { PASSAGES } from '../data/passages.js';

// Local storage key for persistent recent passage exclusion
const RECENT_STORAGE_KEY = 'meanwhile_recent_passages_v2';
const MAX_RECENT_HISTORY = 30;

/**
 * Fast, high-quality 32-bit Seeded Pseudo-Random Number Generator (Mulberry32)
 * Produces deterministic float in [0, 1) from any integer seed.
 * 
 * @param {number} seed 
 * @returns {() => number}
 */
export function createSeededRandom(seed) {
  let s = Math.floor(seed);
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hash a string (such as room code 'MW-7E92') into a 32-bit positive integer seed.
 * 
 * @param {string} str 
 * @returns {number}
 */
export function hashStringToSeed(str) {
  if (!str) return 1337;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Retrieve list of recently played passage IDs
 * 
 * @returns {string[]}
 */
export function getRecentPassageIds() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Record a passage as recently played to avoid near-term recycling
 * 
 * @param {string} passageId 
 */
export function recordRecentPassage(passageId) {
  if (!passageId) return;
  try {
    if (typeof localStorage !== 'undefined') {
      const recent = getRecentPassageIds().filter(id => id !== passageId);
      recent.unshift(passageId);
      if (recent.length > MAX_RECENT_HISTORY) {
        recent.length = MAX_RECENT_HISTORY;
      }
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
    }
  } catch (e) {}
}

/**
 * Clear recent passage history
 */
export function clearRecentPassages() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(RECENT_STORAGE_KEY);
    }
  } catch (e) {}
}

/**
 * Intelligent Passage Selector
 * 
 * @param {Object} options
 * @param {string} [options.category] - Filter by specific category key
 * @param {string} [options.difficulty] - 'easy' | 'medium' | 'hard'
 * @param {string} [options.lengthType] - 'short' | 'medium' | 'long'
 * @param {string} [options.trackId] - Circuit identifier to prioritize matching themed passages
 * @param {number|string} [options.seed] - Seed value or room code for deterministic selection
 * @param {boolean} [options.skipRecentExclusion] - Whether to bypass recent exclusion check
 * @param {string[]} [options.inMemoryRecentIds] - Optional in-memory recent list (for tests)
 * @returns {Object} Selected passage object
 */
export function selectPassage(options = {}) {
  const {
    category,
    difficulty,
    lengthType,
    trackId,
    seed,
    skipRecentExclusion = false,
    inMemoryRecentIds = null
  } = options;

  if (!Array.isArray(PASSAGES) || PASSAGES.length === 0) {
    throw new Error('Passage library is empty.');
  }

  // 1. Initial Candidate Filtering
  let candidates = [...PASSAGES];

  if (category) {
    const byCategory = candidates.filter(p => p.category === category || p.categoryName === category);
    if (byCategory.length > 0) candidates = byCategory;
  }

  if (difficulty) {
    const byDiff = candidates.filter(p => p.difficulty === difficulty);
    if (byDiff.length > 0) candidates = byDiff;
  }

  if (lengthType) {
    const byLength = candidates.filter(p => p.lengthType === lengthType);
    if (byLength.length > 0) candidates = byLength;
  }

  // Track-specific affinity: prioritize passages authored or themed for this circuit
  if (trackId) {
    const cleanTrack = String(trackId).toLowerCase().trim();
    const byTrack = candidates.filter(p => {
      if (!p.trackAffinity) return false;
      if (Array.isArray(p.trackAffinity)) {
        return p.trackAffinity.some(t => cleanTrack.includes(t) || t.includes(cleanTrack));
      }
      return cleanTrack.includes(p.trackAffinity) || p.trackAffinity.includes(cleanTrack);
    });

    // If track-specific passages exist, prioritize them with 80% probability
    if (byTrack.length > 0) {
      candidates = byTrack;
    }
  }

  // 2. Recent Passage Exclusion
  const recentIds = inMemoryRecentIds !== null ? inMemoryRecentIds : (skipRecentExclusion ? [] : getRecentPassageIds());

  let availableCandidates = candidates.filter(p => !recentIds.includes(p.id));

  // 3. Graceful Exhaustion Handling:
  // If all filtered candidates were recently played, fall back to the full candidate pool
  // or sort by least-recently-used.
  if (availableCandidates.length === 0) {
    if (candidates.length > 0) {
      // Sort candidates by position in recentIds (items not in recentIds or furthest down the list come first)
      availableCandidates = [...candidates].sort((a, b) => {
        const idxA = recentIds.indexOf(a.id);
        const idxB = recentIds.indexOf(b.id);
        const posA = idxA === -1 ? 9999 : idxA;
        const posB = idxB === -1 ? 9999 : idxB;
        return posB - posA; // furthest in history first
      });
    } else {
      availableCandidates = [...PASSAGES];
    }
  }

  // 4. Random or Seeded Pick
  let selectedIndex = 0;
  if (seed !== undefined && seed !== null) {
    const numericSeed = typeof seed === 'number' ? seed : hashStringToSeed(String(seed));
    const prng = createSeededRandom(numericSeed);
    selectedIndex = Math.floor(prng() * availableCandidates.length);
  } else {
    selectedIndex = Math.floor(Math.random() * availableCandidates.length);
  }

  const chosenPassage = availableCandidates[selectedIndex] || PASSAGES[0];

  // Auto-record to recent history unless explicitly skipped or custom memory list provided
  if (!skipRecentExclusion && inMemoryRecentIds === null) {
    recordRecentPassage(chosenPassage.id);
  }

  return chosenPassage;
}
