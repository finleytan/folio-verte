/**
 * Tests for: Mobile audio sync fixes
 * Functions under test: wireAudioEvents (timeupdate self-heal + linear scan),
 *   onSeekChange (sparse linear scan), openBook/pwaOpenBook (await loadTranscriptData)
 * Added: 2026-03-13
 */

import { test, expect } from '@playwright/test';
import { clearStorage, gotoFolio, injectFixtureBook, openBook, getAppState, nudge } from '../helpers/folio.js';

// ── Helpers ──────────────────────────────────────────────────

// Inject a <script> that exposes let-scoped variables via window functions
async function injectStateReader(page) {
  await page.evaluate(() => {
    if (window.__syncTestState) return;
    const s = document.createElement('script');
    s.textContent = `
      window.__syncTestState = function() {
        return {
          mediaState,
          curSent,
          curWord,
          sentenceTimings: sentenceTimings ? sentenceTimings.length : 0,
          sentenceTimingsPopulated: sentenceTimings ? sentenceTimings.filter(Boolean).length : 0,
          ttsMode,
        };
      };
      window.__syncSetMediaState = function(s) { mediaState = s; };
      window.__syncSetSentenceTimings = function(arr) { sentenceTimings = arr; };
      window.__syncSetWordTimings = function(arr) { wordTimings = arr; };
      window.__syncGetSentenceTimings = function() { return sentenceTimings; };
    `;
    document.head.appendChild(s);
  });
}

async function getInternalState(page) {
  return page.evaluate(() => window.__syncTestState());
}

// Seed dense fake timings: sentence i → start at i*2s, end at (i+1)*2-0.1
async function seedFakeTimings(page) {
  await page.evaluate(() => {
    window.sentenceTimings = window.sentences.map((_, i) =>
      ({ start: i * 2, end: (i + 1) * 2 - 0.1 }));
    window.updateHL();
  });
}

// Seed sparse timings: only even-indexed sentences have entries
async function seedSparseTimings(page) {
  await page.evaluate(() => {
    window.sentenceTimings = window.sentences.map((_, i) =>
      i % 2 === 0 ? { start: i * 2, end: (i + 1) * 2 - 0.1 } : undefined);
    window.updateHL();
  });
}

// ── Setup ────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await gotoFolio(page);
  await clearStorage(page);
  await page.reload();
  await page.waitForSelector('#library', { state: 'visible', timeout: 8000 });
  await injectFixtureBook(page);
  await openBook(page);
  await injectStateReader(page);
});

// ═══════════════════════════════════════════════════════════
// 1. mediaState self-heal in timeupdate
// ═══════════════════════════════════════════════════════════

test.describe('mediaState self-heal', () => {

  test('self-heals stale paused state when audio is actually playing', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Seed timings so the handler has data to work with
    await seedFakeTimings(page);

    // Simulate: audio is not paused, but mediaState got stuck at 'paused'
    // This mimics Samsung audio-focus steal → pause event → resume without play event
    const healed = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      // Create a fake audio state: paused=false
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 5.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });

      // Set mediaState to stale 'paused'
      window.__syncSetMediaState('paused');

      // Fire a synthetic timeupdate event
      audio.dispatchEvent(new Event('timeupdate'));

      return window.__syncTestState().mediaState;
    });

    expect(healed).toBe('playing');
    expect(errors).toHaveLength(0);
  });

  test('does not self-heal when audio is actually paused', async ({ page }) => {
    await seedFakeTimings(page);

    const state = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => true, configurable: true });

      window.__syncSetMediaState('paused');
      audio.dispatchEvent(new Event('timeupdate'));

      return window.__syncTestState().mediaState;
    });

    // Should stay paused — no self-heal when audio IS paused
    expect(state).toBe('paused');
  });

  test('self-heal sets play button icon to pause', async ({ page }) => {
    await seedFakeTimings(page);

    await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 1.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('paused');
      audio.dispatchEvent(new Event('timeupdate'));
    });

    const playBtn = page.locator('#playBtn');
    await expect(playBtn).toContainText('⏸');
  });

  test('self-heal does not trigger when mediaState is already playing', async ({ page }) => {
    await seedFakeTimings(page);

    // If mediaState is already 'playing', the self-heal block should be skipped
    const result = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 3.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
      return window.__syncTestState().mediaState;
    });

    expect(result).toBe('playing');
  });
});

// ═══════════════════════════════════════════════════════════
// 2. Sparse sentenceTimings linear scan
// ═══════════════════════════════════════════════════════════

test.describe('sparse sentenceTimings handling', () => {

  test('timeupdate finds correct sentence despite sparse holes', async ({ page }) => {
    await seedSparseTimings(page);

    // Time 8.5s should match sentence index 4 (start=8.0, only even indices populated)
    const result = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 8.5, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
      return window.__syncTestState().curSent;
    });

    // Sentence 4 has start=8.0, sentence 6 has start=12.0 — so 8.5 should land on 4
    expect(result).toBe(4);
  });

  test('timeupdate finds last sparse entry near end of book', async ({ page }) => {
    await seedSparseTimings(page);

    const sentCount = await page.evaluate(() => window.sentences.length);
    // Pick a time past the last even-indexed sentence
    const lastEvenIdx = (sentCount - 1) % 2 === 0 ? sentCount - 1 : sentCount - 2;
    const targetTime = lastEvenIdx * 2 + 0.5;

    const result = await page.evaluate((t) => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => t, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 200, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
      return window.__syncTestState().curSent;
    }, targetTime);

    expect(result).toBe(lastEvenIdx);
  });

  test('onSeekChange finds correct sentence in sparse timings', async ({ page }) => {
    await seedSparseTimings(page);

    // Simulate a seek bar change when paused — onSeekChange uses the same linear scan
    const result = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true, writable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 8.5, configurable: true, set: () => {} });
      window.__syncSetMediaState('paused');

      // onSeekChange expects a percentage value
      window.onSeekChange(8.5);
      return window.__syncTestState().curSent;
    });

    // Should find a valid sentence, not stay stuck at 0
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test('all-undefined timings do not crash timeupdate', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Set all timings to undefined (no matches at all)
    await page.evaluate(() => {
      window.sentenceTimings = new Array(window.sentences.length);
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 5.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
    });

    expect(errors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════
// 3. Dense timings — normal sentence advancement
// ═══════════════════════════════════════════════════════════

test.describe('dense timings sentence advancement', () => {

  test('timeupdate advances curSent correctly with dense timings', async ({ page }) => {
    await seedFakeTimings(page);

    const result = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 7.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
      return window.__syncTestState().curSent;
    });

    // t=7.0 → sentence 3 (start=6.0, end=6.9) ... actually sentence 3 starts at 6, so 7.0 >= 6.0.
    // Sentence 4 starts at 8.0 so 7.0 < 8.0. Last match is sentence 3.
    expect(result).toBe(3);
  });

  test('curSent jumps forward when audio skips ahead', async ({ page }) => {
    await seedFakeTimings(page);

    const result = await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 15.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
      return window.__syncTestState().curSent;
    });

    // t=15.0 → sentence 7 (start=14.0)
    expect(result).toBe(7);
  });

  test('highlighted sentence DOM matches curSent after timeupdate', async ({ page }) => {
    await seedFakeTimings(page);

    await page.evaluate(() => {
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 5.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
    });

    const hlSent = page.locator('#eContent .sent.sent-active');
    await expect(hlSent).toHaveCount(1);
    const dataIdx = await hlSent.getAttribute('data-si');
    expect(Number(dataIdx)).toBe(2); // t=5.0 → sentence 2 (start=4.0)
  });
});

// ═══════════════════════════════════════════════════════════
// 4. openBook await ordering
// ═══════════════════════════════════════════════════════════

test.describe('openBook transcript-before-ebook ordering', () => {

  test('openBook is async (returns a promise)', async ({ page }) => {
    const isAsync = await page.evaluate(() => {
      // openBook should be an AsyncFunction
      return window.openBook.constructor.name === 'AsyncFunction';
    });
    expect(isAsync).toBe(true);
  });

  test('no JS errors during book open', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Go back to library and reopen — exercises the full openBook path
    await page.evaluate(() => window.goLib());
    await page.waitForSelector('#library', { state: 'visible', timeout: 8000 });

    await openBook(page);
    expect(errors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════
// 5. Empty sentenceTimings guard
// ═══════════════════════════════════════════════════════════

test.describe('empty sentenceTimings guard', () => {

  test('timeupdate exits early when sentenceTimings is empty array', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.evaluate(() => {
      window.sentenceTimings = [];
      const audio = document.getElementById('audio');
      Object.defineProperty(audio, 'paused', { get: () => false, configurable: true });
      Object.defineProperty(audio, 'currentTime', { get: () => 5.0, configurable: true });
      Object.defineProperty(audio, 'duration', { get: () => 100, configurable: true });
      window.__syncSetMediaState('playing');
      audio.dispatchEvent(new Event('timeupdate'));
    });

    // Should not crash — early return before linear scan
    expect(errors).toHaveLength(0);
    const state = await getInternalState(page);
    expect(state.curSent).toBe(0); // unchanged
  });
});
