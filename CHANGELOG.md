# Folio Reader — Changelog

---

## v1.10 — 2026-03-13

### Fixed
- **Audio-text sync broken on Samsung/Android PWA** — Android can steal audio focus briefly, firing a `pause` event then resuming without a `play` event; `mediaState` got stuck at `'paused'` while audio kept playing, causing the `timeupdate` handler to skip sentence tracking entirely. Added a self-heal in the `timeupdate` handler that detects `!audio.paused && mediaState!=='playing'` and runs the full state quad to recover.
- **Sentence tracking skips entries in sparse `sentenceTimings`** — the binary search used by `timeupdate` and `onSeekChange` treated undefined holes as "go left", causing it to miss all valid entries after a hole at the midpoint. Replaced with a reverse linear scan that handles sparse arrays correctly.
- **Race condition between `loadTranscriptData` and `loadEbook`** — both were async and neither was awaited; on mobile, `scheduler.postTask('background')` could defer `loadTranscriptData` past the ebook build, causing it to wipe already-built timings. Both `openBook` and `pwaOpenBook` now `await loadTranscriptData(b)` before proceeding to ebook loading.

### Added
- Playwright test suite for mobile sync fixes (14 tests in `tests/specs/08-mobile-sync.spec.js`)

---

## v1.9 — 2026-03-13

### Added
- App version number displayed on library screen below tagline (`v1.0.0`) and in Options > Advanced > About (`Version 1.0.0`), driven by a single `APP_VERSION` constant

---

## v1.8 — 2026-03-13

### Fixed
- **Audio stops when backgrounding PWA** — added `freeze`/`resume` Page Lifecycle listeners that cleanly pause before freeze and auto-resume on return (IS_PWA only)
- **TTS breaks after freeze/resume on Android** — TTS branch added to the same freeze/resume listeners; visibilitychange detects dead speechSynthesis engine and restarts from current sentence
- **Pause/resume leaves player in broken state** — `mediaPlay()` catch path now calls the full state quad; `wireAudioEvents` pause handler now releases wake lock on browser-initiated pauses
- **Playback hangs on random sentences** — separated `_scrollPauseTimer` from `scrollTimer` so user scrolling no longer kills the TTS advance chain; `_wordTick` now guards out-of-bounds `curSent`

### Added
- Playwright test suite for lifecycle and playback fixes (15 tests in `tests/specs/07-lifecycle-playback.spec.js`)
- "Session setup" card in `folio-workflow-prompts.html`

---

## v1.7 — 2026-03-12

### Fixed
- **syncOffset not persisted in PWA mode** — `savePwaProgress` and `flushPositionSync` now include `syncOffset` in the saved progress object; `adjustOffset` calls `savePwaProgress()` in PWA mode
- **Add Book card shown in PWA mode** — card is now gated by `!IS_PWA` since PWA books are managed via the filesystem folder
- **Renamed book title lost on PWA relaunch** — `renameBook` now writes the custom title to `PWA_PROG_KEY` so it survives folder re-scan
- **Generic delete toast in PWA mode** — `deleteBook` now shows a folder-specific message explaining the book folder still exists on disk
- **Bottom controls clipped on notched devices** — added `env(safe-area-inset-bottom)` padding to `.seek-strip` and `.tts-bar` in mobile CSS
- **Silent failure on missing PWA files** — `pwaOpenBook` now shows user-facing toasts when audio or ebook file handles fail; transcript handle failure nulls `transcriptData`/`transcriptType` instead of crashing
- **Single folder scan error breaks entire library** — `pwaScanAndRender` now wraps each `pwaScanBookFolder` call in try/catch, skipping broken folders
- **IS_PWA detection incomplete** — now checks `fullscreen` and `minimal-ui` display modes in addition to `standalone` and `navigator.standalone`

### Added
- Playwright test suite for all 9 PWA audit fixes + 9 regression tests (`tests/specs/06-pwa-audit.spec.js`, 29 tests total)

---

## v1.6 — 2026-03-12

### Removed
- **Debug panel** removed from `index.html` to reduce file size (~840 lines of CSS + JS stripped)
- Archived to `_archive/debug-panel/` with `debug-panel.css`, `debug-panel.js`, and a `README.md` explaining how to re-add all three pieces (CSS, JS, init hook)
- `tests/console-test.js` and Playwright suite remain in place; debug panel test files are also preserved in the archive

---

## v1.5 — 2026-03-12

### Added
- **Tests tab** in the debug panel: 47-assertion automated suite covering all four existing tabs; results stream into the panel as each test completes
- `?debug&test` URL flag — panel opens automatically on the Tests tab and runs the full suite 300ms after load
- `tests/console-test.js` — standalone DevTools console runner (paste-and-run, same 47 assertions)
- `tests/debug-panel.spec.js` + `tests/playwright.config.js` — Playwright test suite with dialog handling and headless CI support

### Fixed
- Audio (fake) fixture mode now correctly sets `ttsMode=false` and shows the seek strip — previous 800ms timeout raced against `loadEbook`'s async chunked DOM build; replaced with a 50ms poll that waits for `sentences.length > 0`

---

## v1.4 — 2026-03-12

### Added
- Developer debug panel activated by `?debug` in the URL — completely absent from DOM and CSS when the flag is not present
- **Fixture tab**: injects a synthetic book (10/25/50/100 sentences, TTS or fake-audio mode) directly into the library without dragging files; fake audio mode seeds `sentenceTimings` with 2s/sentence spacing 800ms after open
- **Stepper tab**: jump to sentence, ±1/±10 step buttons, audio-time range slider (maps 0–100% to a 200s fake duration), TTS play/pause/stop controls (shown only when `ttsMode === true`), sync offset ±0.1/±0.5 buttons, and per-word highlight tester
- **State tab**: live monospace two-column readout of all key globals, auto-refreshing at 500ms while active; anomaly highlighting (amber) for empty `sentenceTimings` with an open book, `curSent ≥ sentences.length`, and playing-but-audio-paused state
- **Persist tab**: dump/clear/force-save `folio_library_v2`; dump `folio_pwa_progress_v1`; simulate `pagehide` event; list/clear IndexedDB blob store; dump/reset `folio_display_prefs_v1`

---

## v1.3 — 2026-03-12

### Added
- Reading progress bar is now a tap/click scrubber in TTS mode — tapping any point jumps to the corresponding sentence and restarts TTS if playing; bar expands to 12px in TTS mode to widen the hit target

### Fixed
- TOC chapter tap now scrolls to the correct position on first tap — sidebar closes before scroll fires, and scroll is deferred one rAF for layout to settle after the sidebar animates out
- Tapping a TOC chapter while TTS is playing no longer skips a sentence — stale utterance is cancelled and a clean chain starts from the selected position
- Tapping a TOC chapter while TTS is paused then pressing play now reads from the selected chapter, not the old paused position
- Linking an audio file via Book Files (⋮ → Book Files) now switches the player out of TTS mode immediately — seek strip appears, TTS bar hides, play controls the audio file

---

## v1.2 — 2026-03-12

### Fixed
- TTS play/pause no longer starts a second voice after the first `advanceSent` cycle fires
- TTS auto-scroll no longer stalls after TOC navigation or nudge — sentence advancement restarts correctly
- Programmatic scrolls no longer trigger the 2-second manual-scroll cooldown
- Table of contents now populates correctly for EPUB and HTML books
- Paragraphs containing bold, italic, or linked text now render as a single block instead of fragments
- Seek bar now updates the highlighted sentence immediately when dragged while paused

---

## v1.1 — 2026-03-11
Phase 1 core polish, performance architecture upgrades, and multiple
bug fixes. The app is now stable for large libraries and long books.

Full release notes → [_archive/v1.1/release-notes.md](_archive/v1.1/release-notes.md)

### Added
- Toast notifications replacing all alert() dialogs
- Keyboard shortcuts (Space, ←→, [/], F)
- Wake Lock API — screen stays on during playback
- Media Session API — lock screen and Bluetooth controls
- Page title reflects playback state (▶ Title — Folio)
- Nudge button press feedback animation
- Smooth theme switching (200ms transition)
- Stale file handle recovery modal (PWA)

### Performance
- IndexedDB migration — large content no longer stored in localStorage
- Async chunked ebook DOM building — eliminates UI freeze on large books
- Web Worker for transcript timing — never blocks main thread
- EPUB base64 encoding rewritten — eliminates multi-second stall
- TOC building deferred via requestIdleCallback
- Cover images resized to 400×600 JPEG before saving
- Progress saves debounced at 500ms

### Fixed
- Seek bar and skip buttons now sync ebook position when paused
- TTS play button state no longer gets stuck after pause
- TTS skip buttons now work and restart speech correctly
- Tapping a sentence while TTS is active now jumps immediately
- TTS word-by-word highlighting now works correctly
- Position now saves immediately when navigating to library
- Position and scroll correctly restored when reopening a book
- Refreshing the page reopens the last book instead of showing library
- Ebook resyncs to transcript-matched position after timings build

---

## v1.0 — 2026-03-01
Initial release. Single-file PWA audiobook and ebook reader.

Full release notes → [_archive/v1.0/release-notes.md](_archive/v1.0/release-notes.md)

### Features
- Single-file HTML PWA, no build step required
- Audio playback: MP3, M4A, M4B, OGG, WAV, AAC, FLAC, OPUS
- Ebook reading: EPUB, TXT, HTML, MD, XHTML
- Whisper JSON transcript sync with word-level highlighting
- Segment-level transcript fallback for Whisper without word timestamps
- Plain text transcript support with fuzzy sentence matching
- TTS mode via Web Speech API when no audio file is present
- Audio/text anchor sync for offset audio and ebook start points
- Cover image auto-detection from folder, preference for "cover" filename
- Transcript auto-selection preferring files named "transcript"
- Library with emoji covers and reading progress bars
- Three themes: Dark, Parchment, Night
- Three font options: Lora, System Serif, Sans-serif
- Font size, line height, column width, and text alignment controls
- Word-per-minute and sentence pause controls
- Table of contents sidebar with active chapter tracking
- PWA folder mode using File System Access API
- Offline support via service worker (app shell, fonts, JSZip cached)
- Book file management modal for reassigning files
- Stale PWA file handle recovery screen