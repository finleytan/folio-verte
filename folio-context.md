

# Folio — Living Context Document

Single-file HTML PWA (~2,998 lines). Audiobook/ebook reader with synced word-level highlighting.
Dark-theme mobile-first. Fonts: DM Sans (UI), Lora (body). Three themes: default dark, light, night.

---

## File Layout

| Zone | Contents |
|---|---|
| `<head>` | Meta, manifest, font preconnect/preload |
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
| Options panel | `.opt-panel`, `.op-tab`, `.op-row`, `.op-slider` |
| Seek strip | `.seek-strip`, `.seek-row`, `.seek-strip-bar`, `.seek-time`, `.rate-btn-inline`, `.vol-*` |
| TTS bar | `.tts-bar` |
| Transcript banner | `.tx-banner` (loading/syncing/ready/error), `.tx-spinner`, shimmer keyframes |
| Reading progress | `.ebook-area`, `.read-progress-wrap`, `.read-progress-bar` |
| Reader body | `.reader-body`, `.toc-sidebar`, `.toc-item`, `.ebook-scroll`, `.ebook-content`, `.sent`, `.word`, `.sent-resume-pulse` + `@keyframes sent-pulse` |
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
| `#optPanel` | Flyout options: 3 tabs (Playback, Display, Advanced) with sliders/toggles, rate presets, auto-scroll, resync, stop, sync offset (`#offsetRow`) |
| `#seekStrip` | Single-row: time label, seek bar, time label, rate button, volume (vol hidden on mobile; all hidden in TTS mode). ~30px tall on mobile (4px 12px padding) |
| `#ttsBar` | TTS voice picker, rate slider (shown in TTS mode) |
| `#txBanner` | Transcript status banner (loading/syncing/ready/error) |
| `.read-progress-wrap` | Sentence-based reading progress bar (`#readProg`) |
| `.reader-body` | TOC sidebar (`#tocSidebar` + `#tocList`) and ebook scroll area (`#eScroll` > `#eContent`) |

### JavaScript Sections

| Section | Key functions |
|---|---|
| **STATE** | All global variable declarations and constants (incl. `_fontBody/_fontSize/_lineHeight/_maxWidth`) |
| **TOAST** | `showToast(msg, type, duration)` |
| **WAKE LOCK** | `acquireWakeLock()`, `releaseWakeLock()`, visibilitychange re-acquire |
| **MEDIA SESSION** | `setupMediaSession()`, `updateMediaSessionState(playing)` |
| **DEBOUNCED SAVE** | `saveBookProgressDebounced()` — 500ms timer |
| **PAGE TITLE** | `updatePageTitle()` |
| **SLEEP TIMER** | `cycleSleepTimer()`, `clearSleepTimer()`, `_updateSleepBadge()` |
| **KEYBOARD SHORTCUTS** | `keydown` listener: Space, arrows, `[`/`]`, `f`, `m` |
| **PWA INSTALL** | `installPWA()`, `dismissInstall()`, `beforeinstallprompt` handler |
| **MODAL HELPERS** | `_openModalEl(id)`, `_closeModalRestore()` — focus management + Escape/Tab trap for accessibility |
| **DOM CACHE & UTILS** | `$()`, `cacheDOM()`, `setPlayBtnIcon()`, `xh()`, `fmt()`, `uid()` |
| **INDEXEDDB** | `idbOpen()` (caches connection in `_idb`), `idbSet(key,val)`, `idbGet(key)` |
| **LIBRARY PERSISTENCE** | `saveLibrary()`, `loadLibrary()`, `saveBookProgress()`, `flushPositionSync()`, blob save/load helpers |
| **DISPLAY PREFERENCES** | `saveDisplayPrefs()` (reads `_fontBody/_fontSize/_lineHeight/_maxWidth`; no `getComputedStyle`), `loadDisplayPrefs()` |
| **LIBRARY UI** | `renderLib()`, `renameBook()`, `deleteBook()`, `configurePlayerForMode()` |
| **PLAYER CONFIG** | `configurePlayerForMode(b, audioSrc, rate)` — decides ttsMode, shows/hides seek strip vs TTS bar |
| **OPEN BOOK / GO LIB** | `openBook(i)` (now calls `pulseResumeSent()`), `goLib()` |
| **MEDIA CONTROLS** | `setMediaState()`, `togglePlay()`, `mediaPlay/Pause/Stop()`, `skip()`, `setRate()` (now calls `updateSpeedBadge()`), `setVol()`, `setVolBoth()`, `toggleMute()`, `seekAudioToSentence()` (uses `syncOffset`), seek handlers |
| **AUDIO EVENTS** | `_wordTick()` (rAF word highlight, uses `syncOffset`), `startWordTicker()`, `stopWordTicker()`, `wireAudioEvents()` (timeupdate/ended/play/pause, uses `syncOffset`) |
| **SCROLL ENGINE** | `startScrollEngine()`, `stopScrollEngine()`, `advanceSent()`, `nudge(n)`, `resync()` (uses `syncOffset`) |
| **SYNC OFFSET** | `adjustOffset(delta)`, `updateOffsetUI()` — manual transcript timing correction (±0.5s steps) |
| **TTS** | `getTtsVoices()`, `setTtsVoice()`, `setTtsRate()`, `ttsPlay()`, `ttsPause()`, `ttsStop()` |
| **HIGHLIGHTING & PROGRESS** | `updateHL()`, `updateProg()`, `scrollToSent()`, `toggleAS()`, `toggleWordHl()`, `pulseResumeSent()`, `updateSpeedBadge()` |
| **TOC** | `toggleToc()`, `buildToc()`, `updateTocActive()` |
| **OPTIONS PANEL** | `toggleOpts()`, `switchOptTab()`, `setTheme()`, `setFont()`, `setFS/LH/MW()`, `setAlign()`, WPM helpers, scroll-pause IIFE, click-outside handler |
| **TRANSCRIPT** | `loadTranscriptData()`, `setBannerState()`, `buildSentenceTimings()`, `buildTimingsFromPlainText()`, `similarity()`, `updateTranscriptUI()` |
| **EBOOK LOADING** | `yieldToMain()`, `loadEbook(book, onDone)` |
| **SENTENCE SPLITTER** | `splitSentences(text)` |
| **EBOOK PARSERS** | `parseTxt()`, `parseMd()`, `parseHtml()`, `extractFromDom()`, `parseEpub()`, `loadScript()`, `arrayBufferToBase64()` |
| **ADD BOOK MODAL** | `openModal()`, `closeModal()`, file/folder handlers, `addBook()` |
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
| `upData` | `{audio,ebook,transcript,cover}` | Staged files in add-book modal |

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
| `_idb` | Cached IndexedDB connection (`null` until first `idbOpen()`) |
| `_audio` | Cached `<audio>` element |
| `_playBtn` | Cached play button element |
| `_eContent` | Cached `#eContent` element |
| `_readProg` | Cached `#readProg` element |
| `_tCur` | Cached `#tCur` time display |
| `_seekBar` | Cached `#seekBar` element |
| `_rafId` | rAF ID for `_wordTick` |
| `_activeSentEl` | Currently highlighted sentence DOM element |
| `_activeWordEl` | Currently highlighted word DOM element |
| `_prevFocus` | Modal focus restoration target |
| `_modalIds` | Array of modal element IDs |
| `_modalClosers` | Object mapping modal IDs → close functions |
| `_pendingBlobSave` | IDB blob save tracking |

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
      builds DOM in chunks (DocumentFragment + yieldToMain) → populates sentences[] →
      buildToc() → buildSentenceTimings() (if transcript) → onDone()
      (onDone in openBook/pwaOpenBook restores curSent then calls seekAudioToSentence())

loadTranscriptData(b)
  └── setBannerState('loading') → parses JSON/TXT → setBannerState('ready') →
      buildSentenceTimings() (if sentences already loaded)

buildSentenceTimings()
  └── setBannerState('syncing') → greedy forward Jaccard match: ebook sentences →
      transcript word runs → populates sentenceTimings[] + wordTimings[] →
      setBannerState('ready')

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

scrollToSent(idx)
  └── early-returns if scrollPaused → checks if sentence is in safe zone (middle 40%) →
      scrollIntoView({smooth, center}) if outside

advanceSent()  (TTS scroll engine — WPM-based, not used during speechSynthesis)
  └── calculates ms from char count + wpm + sentPauseMs → setTimeout → curSent++ → recurse

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
  el: HTMLSpanElement,       // live DOM ref (.sent span) — STALE after innerHTML wipe
  words: [{el, text}, ...], // live DOM refs (.word spans)
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

1. **Stale DOM refs**: `sentences[]` holds live DOM refs — any `#eContent` innerHTML wipe without clearing `sentences`, `_activeSentEl`, `_activeWordEl` causes stale-ref bugs.
2. **Fire-and-forget blobs**: `saveLibrary()` blob write is async fire-and-forget; closing tab before IDB flush = data loss for new books.
3. **Yield-to-main**: Transcript state machine needs `await yieldToMain()` — missing `await` = banner states don't paint.
4. **Sync window cap**: `buildSentenceTimings` search window is capped — long audio intros not in ebook can desync cursor.
5. **PWA folder hash**: book.id = folder name hash — renaming folder loses all saved progress.
6. **No audio persistence**: blob URLs are runtime-only. Browser mode reload = must re-link audio.
7. **`scrollTimer` dual use**: `scrollTimer` is used both by the scroll-pause IIFE and by `advanceSent()` via `stopScrollEngine`. Clearing it in one context can affect the other.
8. **`togglePlay` TTS check**: `togglePlay()` checks `ttsSpeaking` to decide play vs pause, but if `ttsPaused` is true and `ttsSpeaking` is false, it correctly calls `ttsPlay()` which hits the resume path.
