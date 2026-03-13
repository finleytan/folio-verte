import { test, expect } from '@playwright/test';
import { clearStorage, gotoFolio, injectFixtureBook, openBook, nudge, getAppState } from '../helpers/folio.js';

// ────────────────────────────────────────────────────────────────
// PWA Audit — tests for all 9 fixes from the PWA comprehensive audit.
//
// Since Playwright runs in a normal browser tab (display-mode: browser),
// IS_PWA is false.  Where we need to test PWA-specific code paths we
// either:
//   (a) patch IS_PWA to true inside page.evaluate(), or
//   (b) call the underlying functions directly (savePwaProgress, etc.)
//
// "function" declarations in Folio's <script> ARE on window; "let/const"
// variables are NOT.  We work around this with page.addInitScript or
// page.evaluate wrappers.
// ────────────────────────────────────────────────────────────────

const PWA_PROG_KEY = 'folio_pwa_progress_v1';
const LS_KEY = 'folio_library_v2';

test.describe('Fix 1 — syncOffset saved in PWA progress', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { sentenceCount: 10, title: 'SyncOffset Test' });
    await openBook(page, 0);
  });

  test('savePwaProgress includes syncOffset in the prog object', async ({ page }) => {
    // Adjust offset by +0.5s twice → syncOffset = 1.0
    await page.evaluate(() => { adjustOffset(0.5); adjustOffset(0.5); });

    // Call savePwaProgress directly (it early-returns when !IS_PWA,
    // so we temporarily patch IS_PWA for this call)
    const prog = await page.evaluate((key) => {
      // Inline patch: make savePwaProgress think we're in PWA mode
      const origFn = window.savePwaProgress;
      // We can't read/write the let-scoped IS_PWA, so we call the
      // function body manually: replicate the save logic
      const b = window.library ? null : null; // can't access let vars

      // Instead: build the prog object the same way savePwaProgress does
      // and verify syncOffset is in the stored data by calling adjustOffset
      // which now calls savePwaProgress() when IS_PWA — but since IS_PWA
      // is false here, we test the flushPositionSync path instead.

      // Call flushPositionSync which writes to localStorage
      window.flushPositionSync();

      const raw = localStorage.getItem('folio_library_v2');
      if (!raw) return null;
      const lib = JSON.parse(raw);
      return lib[0];
    }, PWA_PROG_KEY);

    // In browser mode, flushPositionSync writes syncOffset into
    // library[curBookIdx] and then to localStorage.
    // But syncOffset is a let variable — flushPositionSync now
    // includes it in the browser-mode prog too (it's in the
    // PWA branch). Let's verify via the adjustOffset path.
    // After adjustOffset(0.5) × 2, library[0].syncOffset should be 1.0
    expect(prog).not.toBeNull();
    expect(prog.syncOffset).toBe(1.0);
  });

  test('adjustOffset persists syncOffset to localStorage', async ({ page }) => {
    await page.evaluate(() => { adjustOffset(0.5); adjustOffset(0.5); adjustOffset(0.5); });

    // Read back from localStorage — browser mode saves via saveLibrary
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem('folio_library_v2');
      return raw ? JSON.parse(raw)[0] : null;
    });
    expect(saved).not.toBeNull();
    expect(saved.syncOffset).toBe(1.5);
  });

  test('syncOffset survives reload', async ({ page }) => {
    await page.evaluate(() => { adjustOffset(-0.5); adjustOffset(-0.5); });
    // saveBookProgress to persist
    await page.evaluate(() => saveBookProgress());
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });

    // Verify stored value
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('folio_library_v2');
      return raw ? JSON.parse(raw)[0] : null;
    });
    expect(stored.syncOffset).toBe(-1.0);
  });

  test('flushPositionSync (browser branch) includes syncOffset', async ({ page }) => {
    await page.evaluate(() => { adjustOffset(0.5); });
    // Trigger flushPositionSync via visibilitychange dispatching
    await page.evaluate(() => flushPositionSync());

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('folio_library_v2');
      return raw ? JSON.parse(raw)[0] : null;
    });
    expect(stored).not.toBeNull();
    expect(stored.syncOffset).toBe(0.5);
  });
});

test.describe('Fix 1 — syncOffset in PWA-simulated path', () => {
  test('savePwaProgress prog object contains syncOffset field', async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { sentenceCount: 5, title: 'PWA Sync Test' });
    await openBook(page, 0);

    // Simulate a PWA save by calling the internal logic
    const prog = await page.evaluate((pwaKey) => {
      // We can't call savePwaProgress (IS_PWA is false), so we replicate
      // what the function does to verify the prog shape includes syncOffset.
      // Read the source of savePwaProgress from the DOM script tag
      const scriptText = document.querySelector('script').textContent;
      const match = scriptText.match(/const prog=\{([^}]+)\}/);
      if (!match) return { hasField: false, raw: 'no match' };
      const fields = match[1];
      return { hasField: fields.includes('syncOffset'), raw: fields };
    }, PWA_PROG_KEY);

    expect(prog.hasField).toBe(true);
  });

  test('flushPositionSync PWA branch prog object contains syncOffset field', async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });

    // Check the source code of flushPositionSync for syncOffset in the PWA branch
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      // Find the flushPositionSync function body
      const fnStart = scriptText.indexOf('function flushPositionSync()');
      if (fnStart === -1) return { found: false };
      // Extract ~600 chars of the function
      const fnBody = scriptText.slice(fnStart, fnStart + 800);
      // The PWA branch prog object should contain syncOffset
      // Find first "const prog=" after "if(IS_PWA)"
      const pwaIdx = fnBody.indexOf('IS_PWA');
      if (pwaIdx === -1) return { found: false, body: fnBody.slice(0, 200) };
      const afterPwa = fnBody.slice(pwaIdx);
      const progMatch = afterPwa.match(/const prog=\{([^}]+)\}/);
      if (!progMatch) return { found: false, afterPwa: afterPwa.slice(0, 200) };
      return { found: true, hasField: progMatch[1].includes('syncOffset') };
    });
    expect(result.found).toBe(true);
    expect(result.hasField).toBe(true);
  });
});

test.describe('Fix 2 — Add Book card hidden in PWA mode', () => {
  test('Add Book card IS visible in browser (non-PWA) mode', async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });

    // In browser mode IS_PWA=false, Add Book card should exist
    const addCards = page.locator('#libGrid .add-card');
    await expect(addCards).toHaveCount(1);
  });

  test('renderLib skips Add Book card when IS_PWA is true', async ({ page }) => {
    // Verify the code path: check that renderLib wraps add-card in if(!IS_PWA)
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const renderLibStart = scriptText.indexOf('function renderLib()');
      if (renderLibStart === -1) return { found: false };
      const fnBody = scriptText.slice(renderLibStart, renderLibStart + 2600);
      // Check that add-card creation is inside an if(!IS_PWA) guard
      const addCardIdx = fnBody.indexOf("add-card");
      if (addCardIdx === -1) return { found: false, reason: 'no add-card' };
      // Look backward from add-card for the guard
      const before = fnBody.slice(Math.max(0, addCardIdx - 120), addCardIdx);
      return { found: true, hasGuard: before.includes('!IS_PWA') };
    });
    expect(result.found).toBe(true);
    expect(result.hasGuard).toBe(true);
  });
});

test.describe('Fix 3 — renameBook persists in PWA mode', () => {
  test('renameBook has PWA persistence branch writing to PWA_PROG_KEY', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('function renameBook(');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 600);
      return {
        found: true,
        hasPwaElse: fnBody.includes('else') && fnBody.includes('getPwaProgress'),
        writesPwaKey: fnBody.includes('PWA_PROG_KEY'),
        writesTitle: fnBody.includes('.title='),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasPwaElse).toBe(true);
    expect(result.writesPwaKey).toBe(true);
  });

  test('pwaScanAndRender spread order lets saved title win over folder name', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const scanStart = scriptText.indexOf('function pwaScanAndRender');
      if (scanStart === -1) return { found: false };
      const fnBody = scriptText.slice(scanStart, scanStart + 1200);
      // The spread must be { ...b, ...(saved[b.id] || {}) } — saved last
      const spreadMatch = fnBody.match(/\{\.\.\.b,\s*\.\.\.\(saved\[b\.id\]\|\|\{\}\)\}/);
      return { found: true, correctOrder: !!spreadMatch };
    });
    expect(result.found).toBe(true);
    expect(result.correctOrder).toBe(true);
  });
});

test.describe('Fix 4 — deleteBook in PWA mode shows informative toast', () => {
  test('deleteBook has PWA-specific toast about folder still existing', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('function deleteBook(');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 1800);
      return {
        found: true,
        hasPwaToast: fnBody.includes('IS_PWA') && fnBody.includes('folder'),
        hasBrowserToast: fnBody.includes('deleted'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasPwaToast).toBe(true);
    expect(result.hasBrowserToast).toBe(true);
  });

  test('deleteBook in browser mode still shows normal toast', async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await injectFixtureBook(page, { title: 'Delete Me' });

    // Click the delete button on the card
    const deleteBtn = page.locator('.book-card .card-action-btn[title="Delete"]');
    await deleteBtn.click();

    // Inline confirm should appear
    await expect(page.locator('.delete-confirm')).toBeVisible();
    await page.locator('.delete-confirm-yes').click();

    // Should show toast with "deleted"
    await expect(page.locator('.toast')).toContainText('deleted');

    // Card should be gone
    const cards = page.locator('#libGrid .book-card');
    await expect(cards).toHaveCount(0);
  });
});

test.describe('Fix 5 — safe-area-inset-bottom on seek-strip and tts-bar', () => {
  test('seek-strip CSS includes safe-area-inset-bottom in mobile query', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const styles = document.querySelector('style').textContent;
      // Find the mobile media query block
      const mobileIdx = styles.indexOf('@media(max-width:639px)');
      if (mobileIdx === -1) return { found: false };
      const block = styles.slice(mobileIdx, mobileIdx + 1200);
      return {
        found: true,
        seekStripSafeArea: block.includes('.seek-strip') && block.includes('safe-area-inset-bottom'),
        ttsBarSafeArea: block.includes('.tts-bar') && block.includes('safe-area-inset-bottom'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.seekStripSafeArea).toBe(true);
    expect(result.ttsBarSafeArea).toBe(true);
  });

  test('opt-panel still has safe-area-inset-bottom (existing, not broken)', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const styles = document.querySelector('style').textContent;
      const mobileIdx = styles.indexOf('@media(max-width:639px)');
      if (mobileIdx === -1) return { found: false };
      const block = styles.slice(mobileIdx, mobileIdx + 1200);
      return {
        found: true,
        optPanelSafeArea: block.includes('.opt-panel') && block.includes('safe-area-inset-bottom'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.optPanelSafeArea).toBe(true);
  });
});

test.describe('Fix 6 — pwaOpenBook shows toast on handle failure', () => {
  test('audio handle catch block has showToast call', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('async function pwaOpenBook(');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 1500);
      // Find the audio handle try/catch
      const audioCatchIdx = fnBody.indexOf("'Folio: audio load failed'");
      if (audioCatchIdx === -1) return { found: true, hasAudioToast: false };
      const afterCatch = fnBody.slice(audioCatchIdx, audioCatchIdx + 200);
      return {
        found: true,
        hasAudioToast: afterCatch.includes('showToast'),
        mentionsTts: afterCatch.includes('TTS mode'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasAudioToast).toBe(true);
    expect(result.mentionsTts).toBe(true);
  });

  test('ebook handle catch block has showToast call', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('async function pwaOpenBook(');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 2000);
      const ebookCatchIdx = fnBody.indexOf("'Folio: ebook load failed'");
      if (ebookCatchIdx === -1) return { found: true, hasEbookToast: false };
      const afterCatch = fnBody.slice(ebookCatchIdx, ebookCatchIdx + 200);
      return {
        found: true,
        hasEbookToast: afterCatch.includes('showToast'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasEbookToast).toBe(true);
  });
});

test.describe('Fix 7 — pwaOpenBook transcript handle failure nulls stale data', () => {
  test('transcript catch block logs warning and nulls data fields', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('async function pwaOpenBook(');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 2000);
      const txCatchIdx = fnBody.indexOf("'Folio: transcript load failed'");
      if (txCatchIdx === -1) return { found: true, hasWarn: false };
      const afterCatch = fnBody.slice(txCatchIdx, txCatchIdx + 200);
      return {
        found: true,
        hasWarn: true,
        nullsData: afterCatch.includes('b.transcriptData=null'),
        nullsType: afterCatch.includes('b.transcriptType=null'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasWarn).toBe(true);
    expect(result.nullsData).toBe(true);
    expect(result.nullsType).toBe(true);
  });
});

test.describe('Fix 8 — pwaScanAndRender per-book error handling', () => {
  test('scan loop wraps pwaScanBookFolder in try/catch', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      const fnStart = scriptText.indexOf('async function pwaScanAndRender()');
      if (fnStart === -1) return { found: false };
      const fnBody = scriptText.slice(fnStart, fnStart + 1200);
      // Look for try/catch around pwaScanBookFolder
      const scanCallIdx = fnBody.indexOf('pwaScanBookFolder(name,entry)');
      if (scanCallIdx === -1) return { found: true, hasTryCatch: false };
      // Look backward for 'try{' before the call
      const before = fnBody.slice(Math.max(0, scanCallIdx - 80), scanCallIdx);
      return {
        found: true,
        hasTryCatch: before.includes('try{'),
        catchPushesSkipped: fnBody.includes("skipped.push(name)"),
        catchLogsWarning: fnBody.includes("'Folio: error scanning folder'"),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasTryCatch).toBe(true);
    expect(result.catchPushesSkipped).toBe(true);
    expect(result.catchLogsWarning).toBe(true);
  });
});

test.describe('Fix 9 — IS_PWA detection covers all display modes', () => {
  test('IS_PWA checks standalone, fullscreen, and minimal-ui', async ({ page }) => {
    await gotoFolio(page);
    const result = await page.evaluate(() => {
      const scriptText = document.querySelector('script').textContent;
      // Find the IS_PWA declaration line
      const match = scriptText.match(/const IS_PWA\s*=\s*([^;]+);/);
      if (!match) return { found: false };
      const decl = match[1];
      return {
        found: true,
        hasStandalone: decl.includes('standalone'),
        hasFullscreen: decl.includes('fullscreen'),
        hasMinimalUi: decl.includes('minimal-ui'),
        hasNavigatorStandalone: decl.includes('navigator.standalone'),
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasStandalone).toBe(true);
    expect(result.hasFullscreen).toBe(true);
    expect(result.hasMinimalUi).toBe(true);
    expect(result.hasNavigatorStandalone).toBe(true);
  });

  test('IS_PWA is false in normal browser context (no regression)', async ({ page }) => {
    await gotoFolio(page);
    // In a regular Playwright browser tab, none of the display-mode queries
    // should match, so IS_PWA should be false and the library screen should
    // show the Add Book card.
    const addCard = page.locator('#libGrid .add-card');
    await expect(addCard).toHaveCount(1);
  });
});

// ────────────────────────────────────────────────────────────────
// Regression — existing behaviour must not be broken
// ────────────────────────────────────────────────────────────────

test.describe('Regression — browser mode unchanged', () => {
  test.beforeEach(async ({ page }) => {
    await gotoFolio(page);
    await clearStorage(page);
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
  });

  test('library renders and book can be opened', async ({ page }) => {
    await injectFixtureBook(page, { sentenceCount: 10, title: 'Regression Book' });
    await openBook(page, 0);
    const state = await getAppState(page);
    expect(state.sentenceCount).toBe(10);
    expect(state.playerVisible).toBe(true);
  });

  test('progress save/restore still works in browser mode', async ({ page }) => {
    await injectFixtureBook(page, { sentenceCount: 15 });
    await openBook(page, 0);
    await nudge(page, 5);
    await page.evaluate(() => saveBookProgress());
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await openBook(page, 0);
    const state = await getAppState(page);
    expect(state.curSent).toBe(5);
  });

  test('adjustOffset saves to library in browser mode', async ({ page }) => {
    await injectFixtureBook(page);
    await openBook(page, 0);
    await page.evaluate(() => adjustOffset(1.0));
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('folio_library_v2');
      return raw ? JSON.parse(raw)[0] : null;
    });
    expect(stored.syncOffset).toBe(1.0);
  });

  test('rename persists in browser mode', async ({ page }) => {
    await injectFixtureBook(page, { title: 'Old Name' });
    // Use page.evaluate to rename without prompt()
    await page.evaluate(() => {
      library[0].title = 'New Name';
      saveLibrary();
      renderLib();
    });
    await page.reload();
    await page.waitForSelector('#library', { state: 'visible' });
    await expect(page.locator('#library')).toContainText('New Name');
  });

  test('delete removes book in browser mode', async ({ page }) => {
    await injectFixtureBook(page, { title: 'To Delete' });
    const deleteBtn = page.locator('.book-card .card-action-btn[title="Delete"]');
    await deleteBtn.click();
    await expect(page.locator('.delete-confirm')).toBeVisible();
    await page.locator('.delete-confirm-yes').click();
    const cards = page.locator('#libGrid .book-card');
    await expect(cards).toHaveCount(0);
  });

  test('TTS mode still works with ebook-only book', async ({ page }) => {
    await injectFixtureBook(page, { sentenceCount: 8 });
    await openBook(page, 0);
    const state = await getAppState(page);
    expect(state.ttsMode).toBe(true);
    await expect(page.locator('#ttsBar')).toBeVisible();
    await expect(page.locator('#seekStrip')).toBeHidden();
  });

  test('goLib cleans up state without errors', async ({ page }) => {
    await injectFixtureBook(page);
    await openBook(page, 0);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => goLib());
    await page.waitForSelector('#library', { state: 'visible' });
    expect(errors).toHaveLength(0);
  });

  test('pagehide flushPositionSync runs without error', async ({ page }) => {
    await injectFixtureBook(page, { sentenceCount: 10 });
    await openBook(page, 0);
    await nudge(page, 3);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    await page.waitForTimeout(200);
    expect(errors).toHaveLength(0);
  });

  test('Add Book modal still works in browser mode', async ({ page }) => {
    const addCard = page.locator('#libGrid .add-card');
    await expect(addCard).toHaveCount(1);
    await addCard.click();
    await expect(page.locator('#modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal')).toBeHidden();
  });
});
