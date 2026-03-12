

# Folio — Living Context Document

Single-file HTML PWA (~3,339 lines). Audiobook/ebook reader with synced word-level highlighting.
Dark-theme mobile-first. Fonts: DM Sans (UI), Lora (body). Three themes: default dark, light, night.

---

## File Layout

| Zone | Contents |
|---|---|
| `<head>` | Meta, manifest, font preconnect/preload, JSZip preload (`<link rel="preload" as="script">`) |
| `<style>` | All CSS |
| `<body>` | Static HTML (4 screens + 5 modals) |
| `<script>` | All JS |

### CSS Sections

| Section | What it styles |
|---|---|
| `:root` | CSS custom properties (colors, fonts, spacing) |
| Themes | `.theme-light`, `.theme-night` variable overrides |
| Screens | `#pwaFirstRun`, `#pwaRegrant`, `#library`, `#player` |
| Library | `.lib-header`, `.lib-grid`, `.book-card`, `.add-card`, `.book-cover-*` |
| Modals | `.modal-overlay`, `.modal`, `.dropzone`, `.file-pill`, `.binfo-*` |
| Buttons | `.btn`, `.pill`, `.ipill`, `.toggle` |
| Top bar | `.top-bar`, `.back-btn`, `.bk-info`, `.ic-btn`, `.play-btn`, `.speed-badge` |
| Options panel | `.opt-panel`, `.op-tab`, `.op-row`, `.op-slider`, `.op-info-btn` (ⓘ icon), `.op-desc` (inline help text, hidden by default) |
| Seek strip | `.seek-strip`, `.seek-row`, `.seek-strip-bar`, `.seek-time`, `.rate-btn-inline`, `.speed-strip`, `.spd-btn`, `.vol-*` |
| TTS bar | `.tts-bar` |
| Transcript banner | `.tx-banner` (loading/syncing/ready/error), `.tx-spinner`, shimmer keyframes |
| Reading progress | `.ebook-area`, `.read-progress-wrap`, `.read-progress-bar` |
| Reader body | `.reader-body`, `.toc-sidebar`, `.toc-item`, `.ebook-scroll`, `.ebook-content`, `.sent`, `.word` (no CSS transitions — removed for 60fps highlight performance), `.sent-resume-pulse` + `@keyframes sent-pulse`; `.ebook-para` has `content-visibility:auto; contain-intrinsic-size:auto 80px` |
| Relink overlay | `.relink-overlay`, `.relink-sheet` |
| PWA screens | `.pwa-setup-card`, `.pwa-regrant-card` |
| Media queries | `@media(min-width:640px)` desktop, `@media(max-width:639px)` mobile |
| Misc | Theme transitions, button feedback, toasts, inline delete confirm, sleep badge, install banner, backdrop-filter |

### HTML Structure

| Element | Purpose |
|---|---|
| `#toastContainer` | Toast notification mount point |
| `#installBanner` | PWA install prompt banner |
| `#pwaFirstRun` | First-run screen: folder picker setup |
| `#pwaRegrant` | Re-grant permissions screen |
| `#library` | Library screen: header + `#libGrid` card grid |
| `#player` | **Main player screen** (see breakdown below) |
| `#modal` | Add Book modal (dropzone, file pills, folder assign) |
| `#txModal` | Transcript modal (add/replace transcript) |
| `#linkAudioModal` | Link Audio modal (add audio to ebook-only book) |
| `#bookInfoModal` | Book Info modal (view/reassign files) |
| `#relinkOverlay` | Relink audio overlay (handle expired audio URL) |

**Player screen breakdown (`#player`):**

| Element | Role |
|---|---|
| `<audio id="audio">` | Hidden audio element |
| `.top-bar` | Back button, title (`#pTitle`), progress text (`#pProg`), play button (`#playBtn`), speed badge (`#speedBadge`), option/TOC/transcript buttons |
| `#optPanel` | Flyout options: 3 tabs (Playback, Display, Advanced) with sliders/toggles, rate presets, auto-scroll, resync, stop, sync offset (`#offsetRow`). Settings with ⓘ icons show inline `.op-desc` help text on tap via `toggleOpInfo()` |
| `#seekStrip` | Single-row: time label, seek bar, time label, `.speed-strip` (−/rate/+ buttons), volume (vol hidden on mobile; all hidden in TTS mode). ~30px tall on mobile (4px 12px padding) |
| `#ttsBar` | TTS voice picker, rate slider (shown in TTS mode) |
| `#txBanner` | Transcript status banner (loading/syncing/ready/error) |
| `.read-progress-wrap` | Sentence-based reading progress bar (`#readProg`) |
| `.reader-body` | TOC sidebar (`#tocSidebar` + `#tocList`) and ebook scroll area (`#eScroll` > `#eContent`) |

### JavaScript Sections

| Section | Key functions |
|---|---|
| **STATE** | All global variable declarations and constants (incl. `_fontBody/_fontSize/_lineHeight/_maxWidth`) |
| **TOAST** | `showToast(msg, type, duration)`, `showSyncHintOnce()` (one-time Whisper sync hint; guarded by `SYNC_HINT_KEY` localStorage flag + `ttsMode` check) |
| **WAKE LOCK** | `acquireWakeLock()`, `releaseWakeLock()`, visibilitychange re-acquire |
| **MEDIA SESSION** | `setupMediaSession()`, `updateMediaSessionState(playing)` |
| **DEBOUNCED SAVE** | `saveBookProgressDebounced()` — 500ms timer |
| **PAGE TITLE** | `updatePageTitle()` |
| **SLEEP TIMER** | `cycleSleepTimer()`, `clearSleepTimer()`, `_updateSleepBadge()` |
| **MODAL HELPERS** | `_openModalEl(id)`, `_closeModalRestore()` — focus management + Escape/Tab trap for accessibility |
| **KEYBOARD SHORTCUTS** | `keydown` listener: Space, arrows, `[`/`]`, `f`, `m` |
| **PWA INSTALL** | `installPWA()`, `dismissInstall()`, `beforeinstallprompt` handler |
| **DOM CACHE & UTILS** | `$()`, `cacheDOM()` (caches `_audio`, `_playBtn`, `_eContent`, `_readProg`, `_tCur`, `_seekBar`, `_eScroll`, `_pProg`), `setPlayBtnIcon()`, `xh()`, `fmt()`, `uid()` |
| **INDEXEDDB** | `idbOpen()` (caches connection in `_idb`; `_idb.onclose` resets to `null` for auto-reconnect), `idbSet(key,val)`, `idbGet(key)` |
| **LIBRARY PERSISTENCE** | `saveLibrary()`, `loadLibrary()`, `saveBookProgress()`, `flushPositionSync()`, `_saveBlobs()`, `_saveBlobsFor(bookId)`, `_deleteBlobsFor(bookId)`, `_stripBlobs()` |
| **DISPLAY PREFERENCES** | `saveDisplayPrefs()` (reads `_fontBody/_fontSize/_lineHeight/_maxWidth`; no `getComputedStyle`), `loadDisplayPrefs()` |
| **LIBRARY UI** | `renderLib()`, `renameBook()`, `deleteBook()` (inline confirm, calls `_deleteBlobsFor`), `configurePlayerForMode()` |
| **PLAYER CONFIG** | `configurePlayerForMode(b, audioSrc, rate)` — decides ttsMode, shows/hides seek strip vs TTS bar; revokes previous `blob:` URL on `_audio.src` before assigning new src |
| **OPEN BOOK / GO LIB** | `openBook(i)` (calls `pulseResumeSent()`), `goLib()` (resets `transcriptWords`, `transcriptText`, `sentenceTimings`, `wordTimings`, `sentences`, `tocEntries`, `_tocItems`, `_prevTocActive`, `syncOffset`, `_pendingTimingBookIdx`; also cancels `_plainTextRetryListener` and `_timingWorkerTimeout`) |
| **MEDIA CONTROLS** | `setMediaState()`, `togglePlay()`, `mediaPlay/Pause/Stop()`, `skip()`, `setRate()` (calls `updateSpeedBadge()`), `changeSpeed(dir)` (steps ±1 through `RATE_STEPS` array), `setVol()`, `setVolBoth()`, `toggleMute()`, `seekAudioToSentence()` (uses `syncOffset`), `onSeekInput()`, `onSeekChange()` |
| **AUDIO EVENTS** | `_wordTick()` (rAF word highlight, uses `syncOffset`), `startWordTicker()`, `stopWordTicker()`, `wireAudioEvents()` (timeupdate throttled ~4fps + unsigned-right-shift binary search `>>> 1` for sentence with `bestSent=curSent` initial value, ended/play/pause; uses `syncOffset`) |
| **SCROLL ENGINE** | `startScrollEngine()`, `stopScrollEngine()`, `advanceSent()`, `nudge(n)`, `resync()` (uses `syncOffset`) |
| **SYNC OFFSET** | `adjustOffset(delta)`, `updateOffsetUI()` — manual transcript timing correction (±0.5s steps) |
| **TTS** | `getTtsVoices()`, `setTtsVoice()`, `setTtsRate()`, `ttsPlay()`, `ttsPause()`, `ttsStop()` |
| **HIGHLIGHTING & PROGRESS** | `updateHL()`, `updateProg()` (shows `Chapter · pct%` using `tocEntries`; falls back to `pct%` if no TOC), `_cacheScrollMetrics()` (caches `_scrollEl`/`_scrollElH`/`_scrollElTop` from `_eScroll` rect; called at init and on resize), `scrollToSent(idx, instant=false)` (instant=true skips `scrollPaused` guard and safe-zone check, uses `behavior:'instant'`), `toggleAS()`, `toggleWordHl()`, `pulseResumeSent(instant=false)` (calls `scrollToSent` with instant flag), `updateSpeedBadge()` |
| **TOC** | `toggleToc()`, `buildToc()` (populates `_tocItems[]`), `updateTocActive()` (uses cached `_tocItems`/`_prevTocActive` to skip redundant DOM work) |
| **OPTIONS PANEL** | `toggleOpts()`, `switchOptTab()`, `setTheme()`, `updateThemeColor()`, `setFont()`, `setFS/LH/MW()`, `setAlign()`, `setDefaultWpmFromSlider()`, `setDefaultWpmFromInput()`, `updateWpmLabel()`, `setSentPause()`, `toggleOpInfo(el)` (toggles `.op-desc` sibling of nearest `.op-ttl`/`.op-row` ancestor), scroll-pause IIFE (rAF-throttled), click-outside handler |
| **TRANSCRIPT** | `loadTranscriptData()` (handles segment-level Whisper JSON without word_timestamps), `setBannerState()`, `_timingWorkerFn()` (serialised into Blob Worker), `getTimingWorker()`, `buildSentenceTimings()` (worker dispatch), `buildTimingsFromPlainText()` (worker dispatch), `_buildSentenceTimingsSync()` (fallback), `_buildTimingsFromPlainTextSync()` (fallback), `similarity()`, `updateTranscriptUI()`; after timing is built, `transcriptWords` and `transcriptText` are nulled (both worker onmessage path and sync fallback); worker onmessage calls `showSyncHintOnce()` only on `type==='buildSentenceTimings'` (Whisper word-level), not plain-text path |
| **EBOOK LOADING** | `yieldToMain()` (prefers `scheduler.postTask` with `'background'` priority, falls back to `setTimeout`), `loadEbook(book, onDone)` (chunked DOM build with progress banner via `setBannerState`, delegated click handler via module-level `_contentClickHandler`; click handler is TTS-aware: playing→`ttsStop()+ttsPlay()`, paused→`ttsStop()` only, audio mode unchanged) |
| **SENTENCE SPLITTER** | `splitSentences(text)` |
| **EBOOK PARSERS** | `parseTxt()`, `parseMd()`, `parseHtml()`, `extractFromDom()`, `parseEpub()`, `loadScript()`, `arrayBufferToBase64()` |
| **ADD BOOK MODAL** | `openModal()`, `closeModal()`, file/folder handlers, `folderAssign()`, `addBook()` |
| **TRANSCRIPT MODAL** | `openTranscriptModal()`, `saveTranscript()`, `removeTranscript()` |
| **LINK AUDIO MODAL** | `openLinkAudioModal()`, `saveLinkAudio()` |
| **BOOK INFO MODAL** | `openBookInfoModal()`, `closeBookInfoModal()`, `biReassign()` |
| **RELINK** | `showRelink()`, `closeRelink()`, `rlLoad()` |
| **PWA FILE SYSTEM** | `pwaPickFolder()`, `pwaRegrantAccess()`, `pwaScanAndRender()`, `pwaScanBookFolder()`, `getPwaProgress()`, `savePwaProgress()`, `pwaOpenBook()` |
| **SCREEN ROUTER** | `showScreen(id)`, `pwaShowFirstRun()`, `pwaCheckOnLaunch()` |
| **SWIPE GESTURES** | Touchstart/move/end IIFE on `#eScroll` |
| **SERVICE WORKER** | `navigator.serviceWorker.register()` |
| **INIT** | `init()` — calls cacheDOM, wireAudioEvents, loadDisplayPrefs, setMediaState, getTtsVoices, routing |

---

## Architecture

One HTML file: `<style>` → static HTML (4 screens + 5 modals) → `<script>` (all JS).
Screens: `pwaFirstRun`, `pwaRegrant`, `library` (card grid), `player` (reader + controls).
Routed by `showScreen(id)` toggling `display:flex/none`.

### Two Playback Modes (decided at book open by `configurePlayerForMode`)

**Audio mode** (`ttsMode === false`):
- `<audio>` element drives playback.
- `timeupdate` event advances `curSent` via `sentenceTimings[]`.
- Word-level highlight via `_wordTick()` at rAF using `wordTimings[]` + `_audio.currentTime` + `syncOffset`.
- Seek strip visible; TTS bar hidden.
- State updates: audio `play`/`pause`/`ended` events call `setPlayBtnIcon`, `setMediaState`, `startWordTicker`/`stopWordTicker`, wake lock, media session, page title.

**TTS mode** (`ttsMode === true`):
- No audio file. `speechSynthesis` speaks sentences sequentially.
- `ttsPlay()` creates `SpeechSynthesisUtterance` per sentence; `onend` advances to next.
- Word-level highlight via `utt.onboundary` mapping `charIndex` → word span index.
- Seek strip hidden; TTS bar visible (voice picker, rate slider).
- Scroll engine (`startScrollEngine`/`advanceSent`) is WPM-based timer fallback (not used during speechSynthesis playback).
- State updates: `ttsPlay`/`ttsPause`/`ttsStop` each call `setPlayBtnIcon`, `setMediaState`, `stopScrollEngine`, wake lock, media session, page title.

### Two Storage Modes (decided at startup)

**Browser mode** (`!IS_PWA`): file data in `library[]`, persisted via localStorage (metadata) + IndexedDB (blobs: ebookData, transcriptData, coverUrl).

**PWA mode** (`IS_PWA && CAN_FS`): files read from disk via File System Access handles stored in IDB. Library rebuilt by folder scan each launch. Progress saved to localStorage via `savePwaProgress()` and also written back to the in-memory `library[curBookIdx]` so reopening without a re-scan sees current values.

---

## Global State Variables

### Core reading state
| Variable | Type | Description |
|---|---|---|
| `library` | `Array<Object>` | All books (in-memory working copy) |
| `curBookIdx` | `number` | Index into `library`; -1 = on library screen |
| `sentences` | `Array<{el, words[], text}>` | **Live DOM refs** for current book. Stale after `#eContent` innerHTML wipe |
| `tocEntries` | `Array<{text, level, sentIdx}>` | Heading entries for TOC sidebar |
| `curSent` | `number` | Current sentence index |
| `curWord` | `number` | Current word index within current sentence |

### Scroll & timing
| Variable | Type | Description |
|---|---|---|
| `autoScroll` | `boolean` | Auto-scroll to active sentence |
| `scrollPaused` | `boolean` | Temporarily true (2s) after user manual scroll |
| `scrollTimer` | `timeout ID` | Used by both scroll-pause and advanceSent |
| `lastAdvanceTime` | `number` | Timestamp — unused legacy? |
| `wpm` | `number` | Words per minute for TTS scroll engine |
| `sentPauseMs` | `number` | Pause between sentences (TTS scroll engine) |

### Playback state
| Variable | Type | Description |
|---|---|---|
| `mediaState` | `string` | `'stopped'` / `'playing'` / `'paused'` |
| `isSeeking` | `boolean` | True while user drags seek bar |
| `ttsMode` | `boolean` | `false` = audio, `true` = TTS |
| `ttsSpeaking` | `boolean` | True while speechSynthesis is actively speaking |
| `ttsUtterance` | `SpeechSynthesisUtterance\|null` | Current utterance (for resume) |
| `ttsVoice` | `SpeechSynthesisVoice\|null` | Selected TTS voice |
| `ttsPaused` | `boolean` | True when TTS is paused (for resume path) |

### Transcript & sync
| Variable | Type | Description |
|---|---|---|
| `sentenceTimings` | `Array<{start,end}\|undefined>` | Per-sentence audio timestamps (sparse) |
| `wordTimings` | `Array<{starts,count}\|undefined>` | Per-sentence word-level timestamps (sparse) |
| `transcriptWords` | `Array<{word,start,end}>\|null` | Raw Whisper word entries |
| `transcriptText` | `string\|null` | Plain-text transcript (no timestamps) |
| `syncOffset` | `number` | Manual transcript sync offset in seconds (persisted per-book) |

### UI state
| Variable | Type | Description |
|---|---|---|
| `tocOpen` | `boolean` | TOC sidebar expanded |
| `wordHlOn` | `boolean` | Word-level highlighting enabled |
| `_fontBody` | `string` | Cached `--font-body` value; kept in sync by `setFont` / `loadDisplayPrefs` |
| `_fontSize` | `number` | Cached `--font-size` (px integer); kept in sync by `setFS` / `loadDisplayPrefs` |
| `_lineHeight` | `number` | Cached `--line-height` float; kept in sync by `setLH` / `loadDisplayPrefs` |
| `_maxWidth` | `number` | Cached `--max-width` (px integer); kept in sync by `setMW` / `loadDisplayPrefs` |

### Modal pending state
| Variable | Type | Description |
|---|---|---|
| `txPending` | `File\|null` | Pending file in transcript modal |
| `laPending` | `File\|null` | Pending file in link-audio modal |
| `folderFiles` | `Array` | Files from folder picker in add-book modal |
| `upData` | `const {audio,ebook,transcript,cover}` | Staged files in add-book modal (const object, fields mutated) |

### PWA
| Variable | Type | Description |
|---|---|---|
| `pwaRootHandle` | `FileSystemDirectoryHandle\|null` | Root folder handle |

### Private module-level variables
| Variable | Description |
|---|---|
| `_wakeLock` | Screen wake lock sentinel |
| `_saveTimer` | Debounce timer for `saveBookProgressDebounced` |
| `_sleepTimerIdx` | Index into `SLEEP_OPTIONS` array |
| `_sleepTimerId` | setTimeout ID for sleep timer |
| `_sleepEndTime` | Epoch ms when sleep timer expires |
| `_sleepTickId` | setInterval ID for badge countdown |
| `_installPromptEvent` | Deferred `beforeinstallprompt` event |
| `_idb` | Cached IndexedDB connection (`null` until first `idbOpen()`; reset to `null` by `onclose` handler if browser closes the connection) |
| `_audio` | Cached `<audio>` element |
| `_playBtn` | Cached play button element |
| `_eContent` | Cached `#eContent` element |
| `_readProg` | Cached `#readProg` element |
| `_tCur` | Cached `#tCur` time display |
| `_seekBar` | Cached `#seekBar` element |
| `_eScroll` | Cached `#eScroll` element (used by `_cacheScrollMetrics`) |
| `_scrollEl` | Alias for `_eScroll` set by `_cacheScrollMetrics`; `scrollToSent` guards on this |
| `_scrollElH` | Cached `_eScroll` client height (px); refreshed on resize |
| `_scrollElTop` | Cached `_eScroll` viewport top (px); refreshed on resize |
| `_pProg` | Cached `#pProg` progress text element (used by `updateProg`) |
| `_rafId` | rAF ID for `_wordTick` |
| `_activeSentEl` | Currently highlighted sentence DOM element |
| `_activeWordEl` | Currently highlighted word DOM element |
| `_prevFocus` | Modal focus restoration target |
| `_modalIds` | Array of modal element IDs |
| `_modalClosers` | Object mapping modal IDs → close functions |
| `_pendingBlobSave` | IDB blob save tracking |
| `_timingWorker` | Cached inline Web Worker for transcript timing (lazy, reused) |
| `_timingWorkerBlobUrl` | Blob URL backing `_timingWorker` |
| `_pendingTimingBookIdx` | Book index for the in-flight worker job; stale-result guard. Reset to -1 in `goLib()` |
| `_timingWorkerTimeout` | setTimeout ID for 8-second worker watchdog in `buildSentenceTimings`; cleared on worker response or `goLib()` |
| `_plainTextRetryListener` | One-shot `loadedmetadata` listener registered by `buildTimingsFromPlainText` when `_audio.duration` is 0; cleared on retry or `goLib()` |
| `_contentClickHandler` | Module-level delegated click handler for `_eContent`; cleaned up via `removeEventListener` on each `loadEbook` call |
| `_tocItems` | Cached array of TOC `<button>` elements; populated by `buildToc()` |
| `_prevTocActive` | Index of previously active TOC entry; used by `updateTocActive()` to skip redundant DOM work |

### Constants
| Name | Value/Purpose |
|---|---|
| `IS_PWA` | `true` if running as installed PWA |
| `CAN_FS` | `true` if File System Access API available |
| `AUDIO_EXTS` | Set of recognized audio extensions |
| `EBOOK_EXTS` | Set of recognized ebook extensions |
| `IMAGE_EXTS` | Set of recognized image extensions |
| `LS_KEY` | `'folio_library_v2'` — localStorage key for library metadata |
| `PWA_PROG_KEY` | `'folio_pwa_progress_v1'` — localStorage key for PWA progress |
| `DISPLAY_PREFS_KEY` | `'folio_display_prefs_v1'` — localStorage key for display settings |
| `IDB_NAME` | `'folio_pwa'` — IndexedDB database name |
| `IDB_STORE` | `'handles'` — IDB object store for file handles |
| `IDB_BLOB_STORE` | `'blobs'` — IDB object store for book data blobs |
| `BLOB_FIELDS` | `['ebookData','transcriptData','coverUrl']` — fields saved to IDB |
| `SLEEP_OPTIONS` | `[0, 15, 30, 45, 60]` — minutes |
| `SYNC_HINT_KEY` | `'folio_sync_hint_v1'` — localStorage flag; prevents repeat sync-offset hint toast |
| `RATE_STEPS` | `[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5]` — speed steps for `changeSpeed(dir)` |

---

## Key Function Reference

### Playback Control Chain

```
togglePlay()
  ├── ttsMode=true  → ttsSpeaking ? ttsPause() : ttsPlay()
  └── ttsMode=false → _audio.paused ? mediaPlay() : mediaPause()

mediaPlay()       → ttsMode redirects to ttsPlay()
  └── _audio.play() → then: setPlayBtnIcon(true), setMediaState('playing'),
      startScrollEngine(), startWordTicker(), acquireWakeLock(), updatePageTitle()

mediaPause()      → ttsMode redirects to ttsPause()
  └── _audio.pause(), stopWordTicker(), setPlayBtnIcon(false), setMediaState('paused'),
      releaseWakeLock(), updatePageTitle()

mediaStop()       → ttsMode redirects to ttsStop()
  └── _audio.pause(), currentTime=0, stopWordTicker(), setPlayBtnIcon(false),
      setMediaState('stopped'), stopScrollEngine(), releaseWakeLock(), updatePageTitle()

ttsPlay()
  ├── resume path (ttsPaused && ttsUtterance): speechSynthesis.resume(),
  │   setPlayBtnIcon(true), setMediaState('playing'), acquireWakeLock(), updatePageTitle()
  └── fresh path: setPlayBtnIcon(true), setMediaState('playing'), ttsSpeaking=true,
      acquireWakeLock(), updatePageTitle()
      └── speak() loop: creates SpeechSynthesisUtterance per sentence
          ├── utt.onboundary → maps charIndex to word span, updates curWord + word-active class
          ├── utt.onend → curSent++, curWord=0, speak() again
          └── exit: setPlayBtnIcon(false), setMediaState(), stopScrollEngine(), releaseWakeLock()

ttsPause()  → speechSynthesis.pause(), setPlayBtnIcon(false), stopScrollEngine(),
               releaseWakeLock(), updatePageTitle()
ttsStop()   → speechSynthesis.cancel(), setPlayBtnIcon(false), stopScrollEngine(),
               releaseWakeLock(), updatePageTitle()
```

### State Update Functions (these should ALWAYS be called together)

Playing: `setPlayBtnIcon(true)`, `setMediaState('playing')`, `acquireWakeLock()`, `updatePageTitle()`
Paused:  `setPlayBtnIcon(false)`, `setMediaState('paused')`, `releaseWakeLock()`, `updatePageTitle()`
Stopped: `setPlayBtnIcon(false)`, `setMediaState('stopped')`, `stopScrollEngine()`, `releaseWakeLock()`, `updatePageTitle()`

### Book Open Flow

```
openBook(i)
  ├── IS_PWA && CAN_FS → pwaOpenBook(i)
  │   └── resolves file handles → configurePlayerForMode() → loadTranscriptData()
  │       → loadEbook() → setupMediaSession() → updatePageTitle() → pulseResumeSent()
  └── browser mode:
      └── configurePlayerForMode() → loadTranscriptData() → loadEbook(onDone) →
          setupMediaSession() → updatePageTitle() → pulseResumeSent()

configurePlayerForMode(b, audioSrc, rate)
  └── sets ttsMode, shows/hides seekStrip vs ttsBar, loads audio if present

loadEbook(book, onDone)
  └── clears _activeSentEl/_activeWordEl → wipes #eContent → parses ebook format →
      builds DOM in chunks (DocumentFragment + yieldToMain, CHUNK=20 mobile/80 desktop) →
      shows progress via setBannerState('loading','Building ebook…',pct) after each flush →
      populates sentences[] (data-si/data-wi attributes on .sent/.word spans) →
      setBannerState('hidden') → attaches delegated _contentClickHandler on content →
      buildToc() → buildSentenceTimings() (if transcript) → onDone()
      (onDone in openBook/pwaOpenBook restores curSent then calls seekAudioToSentence() + pulseResumeSent(true))

loadTranscriptData(b)
  └── setBannerState('loading') → parses JSON/TXT → setBannerState('ready') →
      buildSentenceTimings() (if sentences already loaded)
      Whisper JSON handling: tries word-level first (segments[].words or top-level .words),
      falls back to segment-level (splits segment text into pseudo-words with evenly distributed times)

buildSentenceTimings()
  └── setBannerState('syncing') → posts {sentTexts, sentWordCounts, transcriptWords, bookIdx}
      to inline Blob Worker via getTimingWorker().
      After postMessage, starts an 8-second watchdog (_timingWorkerTimeout): if the worker
      doesn't respond in time, terminates it, shows toast, falls back to _buildSentenceTimingsSync().
      Worker runs two-pass greedy Jaccard match off main thread:
        Pass 1 (anchor): greedy forward search, window = sWords.length*20+200
        Pass 2 (fill): searches between anchors, same window formula
        findMatch() outer wi-loop breaks early when bestScore>0.7 (confident match found);
        inner wj-loop breaks at earlyStop=0.85. Object.create(null) for GC efficiency.
      onmessage handler: clears _timingWorkerTimeout, stale-guard (bookIdx===_pendingTimingBookIdx —
      mismatch shows toast + console.warn instead of silent discard),
      length-guard (sentences still match), then applies sentenceTimings[] +
      wordTimings[] → nulls transcriptWords + transcriptText → setBannerState('ready') →
      showSyncHintOnce() (Whisper word-level path only; not called for plain-text).
      try/catch falls back to _buildSentenceTimingsSync() (file:// or worker error);
      sync fallback uses same window formula (sWords.length*20+200), YIELD_EVERY=30.
      buildTimingsFromPlainText() dispatches plain-text timing to the same worker with
      type='buildTimingsFromPlainText'; if _audio.duration is 0 at call time, registers a
      one-shot loadedmetadata listener (_plainTextRetryListener) and retries automatically.

seekAudioToSentence()
  └── if audio mode && curSent > 0 && sentenceTimings exists:
      seek _audio.currentTime to sentenceTimings[curSent].start - syncOffset
      (sparse fallback: scans backward for nearest matched sentence)
```

### Highlighting & Scroll

```
updateHL()
  └── removes previous sent-active/word-active → applies to sentences[curSent] →
      applies word-active to words[curWord] if wordHlOn → updateTocActive()

scrollToSent(idx, instant=false)
  └── if instant: skips scrollPaused guard + safe-zone check → scrollIntoView({behavior:'instant', block:'center'})
      if !instant: early-returns if scrollPaused or !_eScroll → checks safe zone (middle 40%) →
      scrollIntoView({behavior:'smooth', block:'center'}) if outside

pulseResumeSent(instant=false)
  └── adds sent-resume-pulse animation to sentences[curSent].el → calls scrollToSent(curSent, instant)
      Called with instant=true from onDone callbacks in openBook/pwaOpenBook

advanceSent()  (TTS scroll engine — WPM-based, not used during speechSynthesis)
  └── calculates ms from char count + wpm + sentPauseMs → setTimeout → curSent++ → recurse

wireAudioEvents()
  └── timeupdate: throttled to ~4fps via `_lastTimeUpdate` timestamp, unsigned-right-shift binary
      search (`>>> 1`, `bestSent` initialized to `curSent`) for current sentence in sentenceTimings[];
      sparse entries (undefined) treated as "go left" (hi = mid-1); ended/play/pause update state.

_wordTick()  (audio mode only)
  └── reads _audio.currentTime + syncOffset → binary search in wordTimings[curSent].starts →
      updates curWord + word-active class → requestAnimationFrame(self)
```

### Save/Load Chain

```
saveBookProgress()
  └── PWA: savePwaProgress()
      Browser: updates library[curBookIdx] fields → saveLibrary()

savePwaProgress()
  └── builds prog object → Object.assign(library[curBookIdx], prog) →
      writes to localStorage[PWA_PROG_KEY] keyed by book.id

saveLibrary()
  └── _stripBlobs() all books → JSON.stringify → localStorage.setItem(LS_KEY) →
      fire-and-forget _saveBlobs()

_saveBlobs()
  └── for each book with blob fields → idbSet to IDB_BLOB_STORE

loadLibrary()
  └── JSON.parse from localStorage → hydrate blobs from IDB → auto-migrate old format

flushPositionSync()
  └── sync-only emergency save on visibilitychange/pagehide (critical for iOS)
      PWA: Object.assign(library[curBookIdx], prog) + direct localStorage write
      Browser: updates library[curBookIdx] + synchronous localStorage only (no IDB)
```

### Modal Functions

| Modal | Open | Close | Save |
|---|---|---|---|
| Add Book | `openModal()` | `closeModal()` | `addBook()` |
| Transcript | `openTranscriptModal()` | `closeTxModal()` | `saveTranscript()` / `removeTranscript()` |
| Link Audio | `openLinkAudioModal()` | `closeLinkAudioModal()` | `saveLinkAudio()` |
| Book Info | `openBookInfoModal()` | `closeBookInfoModal()` | `biReassign()` |
| Relink | `showRelink(i)` | `closeRelink()` | `rlLoad()` |

---

## Storage Architecture

**localStorage** (sync, ~5MB): metadata only (titles, positions, settings). Key: `folio_library_v2`.
Blobs stripped via `_stripBlobs()` before every write.

**IndexedDB** `folio_pwa` v2: store `handles` (PWA file system handles), store `blobs`
(per-book `ebookData`, `transcriptData`, `coverUrl` keyed by book.id).

`saveLibrary()` = sync localStorage + fire-and-forget async IDB blobs.
`loadLibrary()` = async: metadata from LS, then hydrate blobs from IDB. Auto-migrates old format.
`flushPositionSync()` = sync-only emergency save on visibilitychange/pagehide (critical for iOS). Both PWA and browser paths update `library[curBookIdx]` in-memory before writing to localStorage.

**Display prefs** saved separately to `folio_display_prefs_v1` (theme, fonts, font-size, line-height, width, alignment, wpm, sentPauseMs, wordHlOn).

---

## Data Structures

### `library[i]` (book object)
```
{
  id, title,
  audioUrl, audioName, audioExt,     // audio (null if TTS-only)
  ebookData, ebookName, ebookType,   // ebook content + format
  transcriptData, transcriptName, transcriptType,  // 'whisper' | 'txt' | null
  coverUrl, coverName,               // cover image data URL
  curSent, curWord, audioTime,       // saved progress
  wpm, sentPauseMs, playbackRate,    // per-book playback settings
  syncOffset,                        // manual transcript sync offset (seconds)
  totalSents,                        // for progress display on library card
  // PWA-only additional fields:
  audioHandle, ebookHandle, transcriptHandle, coverHandle  // File System Access handles
}
```

### `sentences[i]`
```
{
  el: HTMLSpanElement,       // live DOM ref (.sent span, data-si=index) — STALE after innerHTML wipe
  words: [{el, text}, ...], // live DOM refs (.word spans, data-wi=index)
  text: string              // original sentence text
}
```

### `sentenceTimings[i]`
```
{ start: number, end: number }   // audio seconds; sparse array (undefined for unmatched)
```

### `wordTimings[i]`
```
{ starts: Float64Array, count: number }  // per-word start times; sparse array
```

### `transcriptWords[i]`
```
{ word: string, start: number, end: number }  // raw Whisper output
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Space | `togglePlay()` |
| → | `nudge(1)` (next sentence) |
| Shift+→ | `skip(15)` (forward 15s audio) |
| ← | `nudge(-1)` (prev sentence) |
| Shift+← | `skip(-15)` (back 15s audio) |
| `[` or `-` | Decrease playback rate by 0.1 |
| `]` or `+` or `=` | Increase playback rate by 0.1 |
| `f` / `F` | Toggle fullscreen |
| `m` / `M` | Toggle mute |

---

## IIFEs and Inline Listeners

| What | Trigger |
|---|---|
| visibilitychange → re-acquire wake lock if playing | auto |
| scroll-pause detection on `#eScroll` | user scroll → sets `scrollPaused=true` for 2s |
| click-outside handler for options panel | any document click |
| swipe gesture detection on `#eScroll` | touch events → `nudge(±1)` |
| modal keyboard trap (Escape to close, Tab focus trap) | keydown on open modals |

---

## Fragile Areas

1. **Stale DOM refs**: `sentences[]` holds live DOM refs — any `#eContent` innerHTML wipe without clearing `sentences`, `_activeSentEl`, `_activeWordEl` causes stale-ref bugs. `goLib()` now clears `sentences=[]` and `tocEntries=[]`.
2. **Fire-and-forget blobs**: `saveLibrary()` blob write is async fire-and-forget; closing tab before IDB flush = data loss for new books.
3. **Yield-to-main**: Transcript state machine needs `await yieldToMain()` — missing `await` = banner states don't paint.
4. **Sync window cap**: `buildSentenceTimings` search window is capped — long audio intros not in ebook can desync cursor.
5. **PWA folder hash**: book.id = folder name hash — renaming folder loses all saved progress.
6. **No audio persistence**: blob URLs are runtime-only. Browser mode reload = must re-link audio.
7. **`scrollTimer` dual use**: `scrollTimer` is used both by the scroll-pause IIFE and by `advanceSent()` via `stopScrollEngine`. Clearing it in one context can affect the other.
8. **`togglePlay` TTS check**: `togglePlay()` checks `ttsSpeaking` to decide play vs pause, but if `ttsPaused` is true and `ttsSpeaking` is false, it correctly calls `ttsPlay()` which hits the resume path.
