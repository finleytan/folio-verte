// Folio — Shared Playwright test helpers
//
// Key constraint: Folio's variables (library, curSent, curWord, etc.) are
// declared with `let` in a classic <script>, so they are NOT on `window`.
// Only `function` declarations (saveLibrary, renderLib, openBook, nudge, etc.)
// are accessible via window.* from page.evaluate().
//
// Strategy: write to localStorage directly for data injection, use the app's
// own functions where available, and read DOM attributes for state inspection.

const LS_KEY = 'folio_library_v2';

const STORAGE_KEYS = [
  'folio_library_v2',
  'folio_pwa_progress_v1',
  'folio_display_prefs_v1',
  'folio_sync_hint_v1',
  'folio_install_dismissed',
];

// Clear all Folio localStorage keys before each test
async function clearStorage(page) {
  await page.evaluate((keys) => {
    keys.forEach(k => localStorage.removeItem(k));
  }, STORAGE_KEYS);
}

// Navigate to Folio and wait for the library screen to be visible
async function gotoFolio(page) {
  await page.goto('/');
  await page.waitForSelector('#library', { state: 'visible', timeout: 8000 });
}

// Build a fixture book object (pure data, no DOM interaction)
function buildFixtureBook({ sentenceCount = 20, title = 'Fixture Book' } = {}) {
  const sentences = Array.from({ length: sentenceCount }, (_, i) =>
    `Sentence ${i + 1} of ${sentenceCount} in this fixture book for regression testing.`
  ).join(' ');
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    title,
    audioUrl: null,
    audioName: null,
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
}

// Inject a synthetic book into the library via localStorage, then reload
// so the app's own loadLibrary() hydrates it into the script-scoped `library` array.
// Returns the injected book's id.
async function injectFixtureBook(page, opts = {}) {
  const book = buildFixtureBook(opts);

  // Read existing library from localStorage, append the new book, write back
  await page.evaluate(({ book, lsKey }) => {
    let lib = [];
    try { lib = JSON.parse(localStorage.getItem(lsKey)) || []; } catch (e) {}
    lib.push(book);
    localStorage.setItem(lsKey, JSON.stringify(lib));
  }, { book, lsKey: LS_KEY });

  // Reload so init() → loadLibrary() picks up the new data
  await page.reload();
  await page.waitForSelector('#library', { state: 'visible', timeout: 8000 });

  return book.id;
}

// Open the book at index i by calling the app's own openBook()
// (openBook is a function declaration, so it IS on window)
async function openBook(page, index = 0) {
  await page.evaluate((i) => openBook(i), index);
  await page.waitForSelector('#player', { state: 'visible', timeout: 8000 });
  // Wait for ebook to finish loading (sentences rendered)
  await page.waitForFunction(() => {
    const sents = document.querySelectorAll('#eContent .sent');
    return sents.length > 0;
  }, { timeout: 8000 });
}

// Read current app state by inspecting the DOM and using available window functions.
// We can't access `let`-scoped variables directly, so we read what we can from the DOM
// and from functions that return values.
async function getAppState(page) {
  return await page.evaluate(() => {
    const sentEls = document.querySelectorAll('#eContent .sent');
    const hlEl = document.querySelector('#eContent .sent.sent-active');
    const hlIndex = hlEl ? Number(hlEl.getAttribute('data-si')) : -1;

    // The active word within the highlighted sentence
    const wordEl = hlEl ? hlEl.querySelector('.word.word-active') : null;
    const wordIndex = wordEl ? Number(wordEl.getAttribute('data-wi')) : 0;

    // Detect TTS mode from UI visibility
    const ttsBar = document.getElementById('ttsBar');
    const seekStrip = document.getElementById('seekStrip');
    const isTtsMode = ttsBar && getComputedStyle(ttsBar).display !== 'none';

    // Detect media state from play button icon
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn ? playBtn.textContent.trim() : '';
    // ▶ = stopped/paused, ⏸ = playing (but exact char varies)

    // Read library from localStorage as a fallback
    let libLength = 0;
    try {
      const raw = localStorage.getItem('folio_library_v2');
      if (raw) libLength = JSON.parse(raw).length;
    } catch (e) {}

    // Player screen visible = a book is open
    const playerVisible = document.getElementById('player') &&
      getComputedStyle(document.getElementById('player')).display !== 'none';

    return {
      curSent: hlIndex,
      curWord: wordIndex,
      ttsMode: isTtsMode,
      sentenceCount: sentEls.length,
      libraryLength: libLength,
      playerVisible,
    };
  });
}

// Call nudge(n) inside the app (nudge is a function declaration → on window)
async function nudge(page, n) {
  await page.evaluate((n) => nudge(n), n);
  // Small wait for highlight to update
  await page.waitForTimeout(100);
}

export { clearStorage, gotoFolio, injectFixtureBook, openBook, getAppState, nudge };
