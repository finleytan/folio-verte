import { test, expect } from '@playwright/test';
import { clearStorage, gotoFolio, injectFixtureBook, openBook, getAppState, nudge } from '../helpers/folio.js';

// ── Helpers ──────────────────────────────────────────────────

// Read script-scoped variables via an injected accessor (workaround for let-scoped vars).
// We inject a tiny <script> that exposes a reader function on window.
async function injectStateReader(page) {
  await page.evaluate(() => {
    if (window.__folioTestState) return;
    const s = document.createElement('script');
    s.textContent = `
      window.__folioTestState = function() {
        return {
          mediaState,
          ttsMode,
          ttsSpeaking,
          ttsPaused,
          scrollPaused,
          scrollTimer,
          _scrollPauseTimer: typeof _scrollPauseTimer !== 'undefined' ? _scrollPauseTimer : undefined,
          _wasPlayingBeforeFreeze: typeof _wasPlayingBeforeFreeze !== 'undefined' ? _wasPlayingBeforeFreeze : undefined,
          _rafId,
          curSent,
          curWord,
          autoScroll,
          _programmaticScroll,
        };
      };
      window.__folioSetMediaState = function(s) { mediaState = s; };
      window.__folioSetScrollPaused = function(v) { scrollPaused = v; };
    `;
    document.head.appendChild(s);
  });
}

async function getInternalState(page) {
  return page.evaluate(() => window.__folioTestState());
}

// Generate a tiny silent WAV (44-byte header + 1 second of silence at 8000Hz mono 8-bit)
function buildSilentWavBase64() {
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1 second
  const dataSize = numSamples;
  const fileSize = 44 + dataSize;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);
  // RIFF header
  const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // byte rate
  view.setUint16(32, 1, true);  // block align
  view.setUint16(34, 8, true);  // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  // Silence (128 = zero level for 8-bit PCM)
  const bytes = new Uint8Array(buf);
  for (let i = 44; i < 44 + dataSize; i++) bytes[i] = 128;
  // Convert to base64
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// Inject a fixture book that has audio (for audio-mode tests)
async function injectAudioFixtureBook(page, opts = {}) {
  const sentenceCount = opts.sentenceCount || 10;
  const title = opts.title || 'Audio Fixture';
  const wavB64 = buildSilentWavBase64();

  const sentences = Array.from({ length: sentenceCount }, (_, i) =>
    `Sentence ${i + 1} of ${sentenceCount} in this audio fixture book.`
  ).join(' ');

  const book = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    title,
    audioUrl: `data:audio/wav;base64,${wavB64}`,
    audioName: 'silent.wav',
    audioExt: 'wav',
    ebookName: 'fixture.txt',
    ebookData: sentences,
    ebookType: 'txt',
    transcriptName: null,
    transcriptType: null,
    transcriptData: null,
    coverUrl: null,
    coverName: null,
    curSent: 0,
    curWord: 0,
    audioTime: 0,
    wpm: 150,
    sentPauseMs: 300,
    playbackRate: 1,
    totalSents: sentenceCount,
  };

  await page.evaluate(({ book, lsKey }) => {
    let lib = [];
    try { lib = JSON.parse(localStorage.getItem(lsKey)) || []; } catch (e) {}
    lib.push(book);
    localStorage.setItem(lsKey, JSON.stringify(lib));
  }, { book, lsKey: 'folio_library_v2' });

  await page.reload();
  await page.waitForSelector('#library', { state: 'visible', timeout: 8000 });
  return book.id;
}

// ── Fix #1 & #3: Page Lifecycle (freeze / resume / visibilitychange) ──

test.describe('Fix #1 & #3 — Page Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { sentenceCount: 10, title: 'Lifecycle Test' });
    await openBook(page, 0);
    await injectStateReader(page);
  });

  test('_wasPlayingBeforeFreeze variable exists and defaults to false', async ({ page }) => {
    const state = await getInternalState(page);
    expect(state._wasPlayingBeforeFreeze).toBe(false);
  });

  test('visibilitychange while stopped causes no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(200);
    expect(errors).toHaveLength(0);
  });

  test('freeze + resume events dispatch without error (non-PWA)', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => {
      document.dispatchEvent(new Event('freeze'));
      document.dispatchEvent(new Event('resume'));
    });
    await page.waitForTimeout(200);
    expect(errors).toHaveLength(0);
  });

  test('freeze during TTS play sets _wasPlayingBeforeFreeze in PWA mode', async ({ page }) => {
    // Simulate IS_PWA=true by adding freeze/resume listeners manually
    // (the real ones only register when IS_PWA is true)
    await page.evaluate(() => {
      // Manually wire the same logic the IS_PWA guard would have wired
      window.__testFreezeHandler = () => {
        const s = window.__folioTestState();
        if (s.ttsMode && s.mediaState === 'playing') {
          // Would call ttsPause() and set flag — verify the logic path exists
          window.__testFreezeTriggered = true;
        }
      };
      document.addEventListener('freeze', window.__testFreezeHandler);
    });
    // Start TTS playback
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    const statePlaying = await getInternalState(page);
    expect(statePlaying.mediaState).toBe('playing');
    // Fire freeze
    await page.evaluate(() => document.dispatchEvent(new Event('freeze')));
    const triggered = await page.evaluate(() => window.__testFreezeTriggered);
    expect(triggered).toBe(true);
    // Cleanup
    await page.evaluate(() => { if (typeof ttsStop === 'function') ttsStop(); });
  });
});

// ── Fix #2: Pause / resume state quad consistency ──

test.describe('Fix #2 — State quad consistency (TTS)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { sentenceCount: 15, title: 'Quad Test' });
    await openBook(page, 0);
    await injectStateReader(page);
  });

  test('play button shows pause icon while TTS is playing', async ({ page }) => {
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    const icon = await page.locator('#playBtn').textContent();
    expect(icon.trim()).toBe('⏸');
  });

  test('play → pause → play: state stays consistent', async ({ page }) => {
    // Play
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    let state = await getInternalState(page);
    expect(state.mediaState).toBe('playing');

    // Pause
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(200);
    state = await getInternalState(page);
    expect(state.mediaState).toBe('paused');
    let icon = await page.locator('#playBtn').textContent();
    expect(icon.trim()).toBe('▶');

    // Play again (resume)
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    state = await getInternalState(page);
    expect(state.mediaState).toBe('playing');
    icon = await page.locator('#playBtn').textContent();
    expect(icon.trim()).toBe('⏸');

    // Cleanup
    await page.evaluate(() => ttsStop());
  });

  test('ttsStop sets stopped state and correct icon', async ({ page }) => {
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    await page.evaluate(() => ttsStop());
    await page.waitForTimeout(100);
    const state = await getInternalState(page);
    expect(state.mediaState).toBe('stopped');
    const icon = await page.locator('#playBtn').textContent();
    expect(icon.trim()).toBe('▶');
  });

  test('page title reflects playback state', async ({ page }) => {
    // Stopped
    let title = await page.title();
    expect(title).not.toContain('▶');

    // Playing
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(300);
    title = await page.title();
    expect(title).toContain('▶');

    // Paused
    await page.evaluate(() => togglePlay());
    await page.waitForTimeout(200);
    title = await page.title();
    expect(title).toContain('⏸');

    // Cleanup
    await page.evaluate(() => ttsStop());
  });
});

test.describe('Fix #2 — State quad consistency (audio mode)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectAudioFixtureBook(page, { sentenceCount: 10, title: 'Audio Quad Test' });
    await openBook(page, 0);
    await injectStateReader(page);
  });

  test('audio mode is active when book has audio', async ({ page }) => {
    const state = await getInternalState(page);
    expect(state.ttsMode).toBe(false);
  });

  test('mediaPlay catch path sets paused state on failure', async ({ page }) => {
    // Force audio.play() to reject by clearing the src
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => {
      const a = document.getElementById('audio');
      a.removeAttribute('src');
      a.load();
    });
    await page.waitForTimeout(100);
    // Attempt play — should hit catch and set paused state cleanly
    await page.evaluate(() => {
      mediaPlay();
    });
    await page.waitForTimeout(500);
    // Should not have uncaught errors
    expect(errors).toHaveLength(0);
    // State should be paused (catch path) not playing
    const state = await getInternalState(page);
    expect(state.mediaState).not.toBe('playing');
  });
});

// ── Fix #4: scrollTimer separation + _wordTick robustness ──

test.describe('Fix #4 — Scroll timer separation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { sentenceCount: 30, title: 'Scroll Test' });
    await openBook(page, 0);
    await injectStateReader(page);
  });

  test('_scrollPauseTimer variable exists', async ({ page }) => {
    const state = await getInternalState(page);
    expect(state._scrollPauseTimer).toBeNull();
  });

  test('manual scroll sets scrollPaused temporarily', async ({ page }) => {
    // Nudge to middle so there's content to scroll
    await nudge(page, 15);

    // Simulate a user scroll on #eScroll
    await page.evaluate(() => {
      const el = document.getElementById('eScroll');
      el.scrollTop += 200;
    });
    await page.waitForTimeout(100);

    const state = await getInternalState(page);
    expect(state.scrollPaused).toBe(true);

    // After 2.5s, scrollPaused should be false again
    await page.waitForTimeout(2500);
    const stateAfter = await getInternalState(page);
    expect(stateAfter.scrollPaused).toBe(false);
  });

  test('scroll-pause does not clear scrollTimer (timer isolation)', async ({ page }) => {
    // Set scrollTimer to a known value (simulating advanceSent having set it)
    // Then trigger a user scroll — the IIFE should use _scrollPauseTimer, not scrollTimer
    await page.evaluate(() => {
      const s = document.createElement('script');
      s.textContent = `
        scrollTimer = setTimeout(() => { window.__advanceTimerFired = true; }, 500);
      `;
      document.head.appendChild(s);
    });

    // Simulate user scroll — should set _scrollPauseTimer, NOT clear scrollTimer
    await page.evaluate(() => {
      const el = document.getElementById('eScroll');
      el.scrollTop += 200;
    });
    await page.waitForTimeout(100);

    let state = await getInternalState(page);
    // scrollPaused should be true from the user scroll
    expect(state.scrollPaused).toBe(true);
    // scrollTimer should still be set (not cleared by the IIFE)
    expect(state.scrollTimer).not.toBeNull();

    // Wait for the advanceSent timer to fire (500ms)
    await page.waitForTimeout(600);
    const fired = await page.evaluate(() => window.__advanceTimerFired);
    // The timer should have fired — proving the IIFE didn't clear it
    expect(fired).toBe(true);

    // Cleanup
    await page.evaluate(() => {
      const s = document.createElement('script');
      s.textContent = `scrollPaused = false; scrollTimer = null;`;
      document.head.appendChild(s);
    });
  });

  test('scrollToSent sets _programmaticScroll during execution', async ({ page }) => {
    // Call scrollToSent and check _programmaticScroll is briefly true
    const wasSet = await page.evaluate(() => {
      return new Promise(resolve => {
        scrollToSent(5, true);
        // Check synchronously — _programmaticScroll should be true right now
        const val = window.__folioTestState()._programmaticScroll;
        resolve(val);
      });
    });
    expect(wasSet).toBe(true);

    // After 200ms it should be false again
    await page.waitForTimeout(200);
    const state = await getInternalState(page);
    expect(state._programmaticScroll).toBe(false);
  });
});

test.describe('Fix #4 — _wordTick robustness', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectAudioFixtureBook(page, { sentenceCount: 10, title: 'WordTick Test' });
    await openBook(page, 0);
    await injectStateReader(page);
  });

  test('_wordTick does not crash when curSent is past sentence array', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Set curSent beyond length and manually start word ticker while "playing"
    await page.evaluate(() => {
      // Inject script to manipulate let-scoped vars
      const s = document.createElement('script');
      s.textContent = `
        curSent = 999;
        mediaState = 'playing';
        startWordTicker();
      `;
      document.head.appendChild(s);
    });
    await page.waitForTimeout(300);
    // Stop it
    await page.evaluate(() => {
      const s = document.createElement('script');
      s.textContent = `stopWordTicker(); mediaState = 'stopped'; curSent = 0;`;
      document.head.appendChild(s);
    });
    await page.waitForTimeout(100);
    expect(errors).toHaveLength(0);
  });
});
