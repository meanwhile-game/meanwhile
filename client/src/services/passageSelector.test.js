import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectPassage,
  createSeededRandom,
  hashStringToSeed
} from './passageSelector.js';
import { PASSAGES } from '../data/passages.js';

test('selectPassage: returns valid passage structure from library', () => {
  const p = selectPassage({ skipRecentExclusion: true });
  assert.ok(p);
  assert.ok(p.id);
  assert.ok(p.title);
  assert.ok(p.text);
  assert.ok(p.text.length > 20);
});

test('createSeededRandom & hashStringToSeed: provides deterministic reproducible values', () => {
  const seed1 = hashStringToSeed('MW-7E92');
  const seed2 = hashStringToSeed('MW-7E92');
  assert.equal(seed1, seed2);

  const rand1 = createSeededRandom(seed1);
  const rand2 = createSeededRandom(seed2);

  const seq1 = [rand1(), rand1(), rand1()];
  const seq2 = [rand2(), rand2(), rand2()];

  assert.deepEqual(seq1, seq2);
});

test('selectPassage: deterministic seeded selection ensures all multiplayer players get identical passage', () => {
  const p1 = selectPassage({ seed: 'MW-9A4B', skipRecentExclusion: true });
  const p2 = selectPassage({ seed: 'MW-9A4B', skipRecentExclusion: true });
  const p3 = selectPassage({ seed: 'MW-9A4B', skipRecentExclusion: true });

  assert.equal(p1.id, p2.id);
  assert.equal(p2.id, p3.id);
  assert.equal(p1.text, p2.text);
});

test('selectPassage: avoids recently used passages in memory', () => {
  const recentIds = [];
  const pickedIds = new Set();

  // Pick 5 consecutive passages and record them into recentIds
  for (let i = 0; i < 5; i++) {
    const p = selectPassage({ inMemoryRecentIds: recentIds });
    assert.ok(!recentIds.includes(p.id), `Passage ${p.id} was picked despite being in recent history!`);
    recentIds.unshift(p.id);
    pickedIds.add(p.id);
  }

  assert.equal(pickedIds.size, 5);
});

test('selectPassage: handles library exhaustion gracefully without crashing', () => {
  // If recentIds contains ALL passages, engine falls back safely to full library
  const allIds = PASSAGES.map(p => p.id);
  const p = selectPassage({ inMemoryRecentIds: allIds });
  assert.ok(p);
  assert.ok(p.text);
});

test('selectPassage: respects category and difficulty filters', () => {
  const pEasy = selectPassage({ difficulty: 'easy', skipRecentExclusion: true });
  assert.equal(pEasy.difficulty, 'easy');

  const pTech = selectPassage({ category: 'TECH', skipRecentExclusion: true });
  assert.equal(pTech.category, 'TECH');
});

test('selectPassage: prioritizes track-specific affinity', () => {
  const pChennai = selectPassage({ trackId: 'chennai-circuit', skipRecentExclusion: true });
  assert.ok(
    pChennai.trackAffinity && 
    (Array.isArray(pChennai.trackAffinity) 
      ? pChennai.trackAffinity.some(t => t.includes('chennai'))
      : pChennai.trackAffinity.includes('chennai')),
    `Expected Chennai affinity, got ${pChennai.trackAffinity}`
  );
});
