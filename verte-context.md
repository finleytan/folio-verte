# Verte — Function Index & Context

## File Layout

| Zone | Lines | Contents |
|------|-------|----------|
| CSS | 18–657 | All styles |
| HTML | 658–1209 | 4 screens + 4 modals |
| JS | 1210–4934 | All logic |

### HTML Structure

| Element | Purpose |
|---------|---------|
| `#toastContainer` | Toast mount point |
| `#installBanner` | PWA install prompt |
| `#pwaFirstRun` | First-run folder picker screen |
| `#pwaRegrant` | Re-grant permissions screen |
| `#library` | Library screen: header (with view toggle + settings gear) + `#libSettingsPanel` + `#libToolbar` (search + sort + filter) + `#libGrid` card grid |
| `#player` | Player screen (audio, top bar, options, transcript banner, reader body, bottom controls). Receives `bars-hidden` class for PWA auto-hide |
| `#txBanner` | Transcript syncing banner (loading/syncing/ready/warn/error states) — below top bar |
| `#notxBanner` | "No transcript" warning banner (notx state) — above bottom controls |
| `#bottomControls` | Bottom controls bar: ebook scrub bar + seek strip + play/skip/vol/speed ctrl-row. Always visible when ebook loaded (scrub bar is sole occupant when ebook-only, TTS off) |
| `#modal` | Add Book modal (Audio, Ebook, Transcript, Cover pills — clickable to pick individual files; each pill shows accepted file types) |
| `#txModal` | Transcript modal (add/replace transcript) |
| `#linkAudioModal` | Link Audio modal (add audio to ebook-only book) |
| `#editBookModal` | Edit Book Details modal (title, author, file slots — opened from library pencil icon) |
| `#relinkOverlay` | Relink audio overlay (expired audio URL); auto-shown on book open unless dismissed |
| `#orientSec` | Orientation lock setting section in Display options (PWA only, hidden by default via `display:none`) |

---

## Function Index

| Function | Line | Area | Notes |
|----------|------|------|-------|
| `showSyncHintOnce` | 1256 | Toast | One-time hint after first transcript sync |
| `showToast` | 1262 | Toast | |
| `acquireWakeLock` | 1279 | Wake Lock | |
| `setupMediaSession` | 1335 | Media Session | |
| `saveBookProgressDebounced` | 1363 | Save | |
| `updatePageTitle` | 1371 | Page Title | |
| `cycleSleepTimer` | 1387 | Sleep Timer | |
| `_openModalEl` / `_closeModalRestore` | 1428 | Modal Helpers | |
| `cacheDOM` | 1545 | DOM Cache | |
| `setPlayBtnIcon` | 1559 | DOM Cache | |
| `xh` / `fmt` / `uid` | 1564 | Utility | `fmt` formats seconds as M:SS or H:MM:SS for durations ≥1 hour |
| `idbOpen` / `idbSet` / `idbGet` | 1571 | IndexedDB | |
| `saveLibrary` | 1611 | Library Persistence | |
| `loadLibrary` | 1656 | Library Persistence | |
| `saveBookProgress` | 1692 | Library Persistence | ⚠️ Call this not saveLibrary() from playback code |
| `flushPositionSync` | 1706 | Library Persistence | |
| `saveDisplayPrefs` | 1748 | Display Prefs | Saves all prefs including autoScroll, defaultPlaybackRate, hlColor, suppressNotxBanner, suppressSpeedToast, confirmDelete, ttsVoiceIdx |
| `loadDisplayPrefs` | 1771 | Display Prefs | Restores all prefs. Syncs both `themePill-*` and `libThemePill-*`. Defers TTS voice via `_pendingTtsVoiceIdx` |
| `toggleLibSettings` | 1837 | Library UI | Toggles full-screen `#libSettingsPanel` overlay via `open` class |
| `toggleLibView` | 1841 | Library UI | Toggles grid/list view; persists to `verte_lib_view_v1` localStorage |
| `_applyLibView` | 1846 | Library UI | Applies view mode class to grid + swaps toggle icon + active state |
| `cycleLibSort` | 1857 | Library UI | Cycles A–Z / Recent / Progress; persists to `verte_lib_sort_v1` |
| `cycleLibFilter` | 1866 | Library UI | Cycles All / Audiobooks / Ebooks; persists to `verte_lib_filter_v1` |
| `_sortedLibIndices` | 1875 | Library UI | Returns library indices sorted by current `_libSort` order |
| `renderLib` | 1886 | Library UI | Shows onboarding card when library is empty (browser mode); applies search/sort/filter; pencil icon opens Edit Book modal; adds `now-playing` class to card matching `_lastOpenedBookIdx` |
| `unhideBook` | 2006 | Library UI | ⚠️ Shows resume/start-over prompt if book has saved progress |
| `_doUnhide` | 2032 | Library UI | Executes unhide with optional progress reset |
| `renameBook` | 2046 | Library UI | ⚠️ Remove blur listener before Enter/Escape to prevent double-fire |
| `_execDelete` | 2080 | Library UI | Shared delete/hide logic used by both confirm and skip-confirm paths |
| `deleteBook` | 2101 | Library UI | ⚠️ Skips confirm card when `confirmDelete` is false |
| `configurePlayerForMode` | 2131 | Player Config | ⚠️ Owns _audio.src — do not assign src before calling this. Defaults highlighting (off for TTS, word for audio). Calls `_updateSkipBtns()`. Shows/hides ebook scrub bar and ctrl-row based on mode. `loadedmetadata` handler seeks to `b.audioTime` or falls back to `b.curSent` position |
| `toggleTtsMode` | 2165 | Player Config | Toggles TTS on/off for ebook-only books; auto-enables sentence HL on, disables HL on off. Shows/hides ctrl-row + scrub-sole class. Calls `_updateSkipBtns()` |
| `openBook` | 2184 | Open/Close | ⚠️ Auto-shows relink overlay if `audioName` set but `audioUrl` lost (unless dismissed). Sets `b.lastOpened`. Uses `defaultPlaybackRate` as fallback |
| `pulseResumeSent` | 2203 | Open/Close | |
| `goLib` | 2212 | Open/Close | ⚠️ Must clear sentences[], tocEntries[], sentenceTimings[] — already does. Calls `clearBarTimer()`, `_showEbookScrub(false)` |
| `seekAudioToSentence` | 2239 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search. Defers seek via `loadedmetadata` listener if audio not ready (`readyState < 1`) |
| `setMediaState` | 2249 | Media Controls | |
| `togglePlay` | 2252 | Media Controls | ⚠️ Shows toast if no audio and TTS off |
| `mediaPlay` / `mediaPause` / `mediaStop` | 2258 | Media Controls | ⚠️ `mediaPlay` only acquires wake lock in `.then()` — all playback state (icon, mediaState, ticker) is set by the `play` event handler in `wireAudioEvents`, not here |
| `_updateSkipBtns` | 2289 | Media Controls | Swaps skip button icons/labels: circular-arrow+15 for audio, chevrons for TTS; also handles big-skip (1m / 5 sentences) |
| `skip` | 2304 | Media Controls | In TTS mode: ±1 sentence (15s) or ±5 sentences (60s). In audio mode: seeks by seconds |
| `changeSpeed` | 2310 | Media Controls | |
| `cycleSpeed` | 2316 | Media Controls | Tap-to-cycle through RATE_STEPS; reads from `rateCustom` in TTS mode |
| `setRate` | 2323 | Media Controls | |
| `setVol` / `setVolBoth` / `toggleMute` | 2360 | Media Controls | |
| `toggleVolPop` | 2378 | Media Controls | Opens/closes volume popover; closes on outside tap |
| `onSeekInput` | 2392 | Media Controls | |
| `onSeekChange` | 2393 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_wordTick` | 2416 | Audio Events | ⚠️ curWord=-1 sentinel prevents word-0 flash — do not change to 0 |
| `startWordTicker` / `stopWordTicker` | 2440 | Audio Events | |
| `wireAudioEvents` | 2444 | Audio Events | ⚠️ timeupdate self-heal for Samsung audio-focus steal — do not remove. `play` event is the single source of truth for playback state (icon, mediaState, ticker, wake lock). `play` handler calls `resetBarTimer()` **after** the state quad; `pause`/`ended` handlers call `clearBarTimer()` |
| `startScrollEngine` | 2510 | Scroll Engine | ⚠️ scrollTimer separate from _scrollPauseTimer — do not merge |
| `stopScrollEngine` | 2515 | Scroll Engine | |
| `advanceSent` | 2518 | Scroll Engine | |
| `nudge` | 2532 | Scroll Engine | In TTS mode while playing: calls `ttsStop(); ttsPlay()` to restart from new sentence |
| `resync` | 2539 | Scroll Engine | |
| `adjustOffset` / `updateOffsetUI` | 2549 | Sync Offset | |
| `getTtsVoices` | 2563 | TTS | ⚠️ Deferred voice restore via `_pendingTtsVoiceIdx` after voiceschanged |
| `setTtsVoice` / `setTtsRate` | 2584 | TTS | |
| `ttsPlay` | 2594 | TTS | ⚠️ ttsSpeaking owned here — stopScrollEngine must never set it. Reads rate from `rateCustom` input. Calls `resetBarTimer()` **after** the state quad (see fragile #41) |
| `ttsPause` / `ttsStop` | 2646 | TTS | Call `clearBarTimer()` |
| `scrubToPosition` | 2659 | TTS | |
| `_resolveChapterAtIdx` | 2677 | Ebook Scrub | Returns chapter name at given sentence index; caches result via `_cachedChIdx`/`_cachedChLabel`/`_cachedChNext` to skip redundant `tocEntries` walks. Cache reset on book close/switch |
| `_updateEbookScrub` | 2681 | Ebook Scrub | Syncs scrub bar fill/thumb to `curSent`; called from `updateProg()` |
| `_showEbookScrub` | 2687 | Ebook Scrub | Shows/hides scrub bar; also ensures `#bottomControls` is visible when scrub bar is shown |
| `_wireEbookScrub` | 2693 | Ebook Scrub | ⚠️ Pointer event handling for ebook scrub bar. Uses `setPointerCapture` for drag. Pauses TTS during scrub, restarts on release. Sets `curWord=-1` on commit (fragile #14). Called from `init()` |
| `updateHL` | 2764 | Highlighting | ⚠️ sentences[] holds live DOM refs — stale after any #eContent innerHTML wipe |
| `updateProg` | 2776 | Highlighting | Uses `_resolveChapterAtIdx` for chapter label. Calls `_updateEbookScrub()` |
| `_cacheScrollMetrics` | 2785 | Highlighting | |
| `scrollToSent` | 2792 | Highlighting | |
| `toggleAS` | 2805 | Highlighting | Now calls `saveDisplayPrefs()` |
| `toggleSuppressNotxBanner` | 2810 | Highlighting | Flips `suppressNotxBanner`, syncs toggle, saves |
| `toggleSuppressSpeedToast` | 2815 | Highlighting | Flips `suppressSpeedToast`, syncs toggle, saves |
| `toggleConfirmDelete` | 2820 | Highlighting | Flips `confirmDelete`, syncs toggle, saves |
| `setDefaultSpeed` | 2825 | Highlighting | Sets `defaultPlaybackRate`, updates label, saves |
| `_syncDefHlPills` | 2830 | Highlighting | Syncs `[id^=defHlPill]` pills to current HL mode |
| `toggleWordHl` / `toggleSentHl` | 2835 | Highlighting | |
| `_resyncAndHL` | 2854 | Highlighting | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_syncHlPills` | 2869 | Highlighting | |
| `setHighlightMode` | 2875 | Highlighting | ⚠️ Updates notx banner reactively — shows/hides based on sentHlOn + ttsMode + transcript state |
| `toggleToc` | 2905 | TOC | |
| `buildToc` | 2911 | TOC | |
| `updateTocActive` | 2960 | TOC | |
| `toggleOpts` / `switchOptTab` | 2972 | Options | |
| `setTheme` | 3047 | Options | ⚠️ Wipes body.className — loses is-pwa class until reload (known issue #22). Syncs both `themePill-*` and `libThemePill-*`. Calls `_applyHlColor()` after theme change to reapply light/dark opacity variants |
| `_applyHlColor` | 3058 | Options | Sets `--hl-bg`, `--hl-border`, `--word-hl`, `--word-hl-text` CSS vars. Detects light vs dark theme from `body.className` and applies `hlBg`/`hlBgDark` variants accordingly. Four colours: yellow, blue, pink, green. Yellow uses `wordText:#000000` (black text on highlight); others use `#ffffff`. Syncs both swatch sets. Does not save |
| `setHlColor` | 3078 | Options | Sets `hlColor`, calls `_applyHlColor`, saves |
| `updateThemeColor` | 3014 | Options | |
| `setFont` | 3018 | Options | |
| `setFS` / `setLH` / `setMW` | 3035 | Options | |
| `setAlign` | 3038 | Options | |
| `setOrientation` | 3044 | Options | ⚠️ PWA only — enters fullscreen via `requestFullscreen()` then locks via `screen.orientation.lock()`. Auto mode unlocks + exits fullscreen. `.catch()` silences errors on unsupported platforms (see fragile #42) |
| `setSentPause` / `toggleOpInfo` | 3068 | Options | |
| `updateWpmLabel` | 3063 | Options | ⚠️ Guards against missing `#wpmSpeedLbl` element. Syncs both player and library labels |
| `_shouldAutoHide` | 3090 | Auto-Hide Bars | PWA only — returns true when bars can auto-hide (playing, no panels/modals open, on player screen) |
| `showBars` / `hideBars` | 3100 | Auto-Hide Bars | PWA only — add/remove `bars-hidden` class on `#player`. Bars collapse (height:0) so reading area expands |
| `resetBarTimer` | 3111 | Auto-Hide Bars | ⚠️ PWA only — show bars + restart 6-second idle timer. Must be called **after** `setMediaState('playing')` in playback start paths (see fragile #41) |
| `clearBarTimer` | 3117 | Auto-Hide Bars | PWA only — cancel timer + show bars. Called on pause/stop/ended/goLib |
| `setBannerState` | 3198 | Transcript | ⚠️ Manages two banner elements. `notx` branch returns early if `suppressNotxBanner` is true |
| `_timingWorkerFn` | 3234 | Transcript | ⚠️ Two copies of splitSentences + matching logic — worker copy must stay in sync (~3234) |
| `getTimingWorker` | 3412 | Transcript | ⚠️ Revokes blob URL immediately after Worker construction. Worker `onmessage` calls `seekAudioToSentence()` (if audio at 0 + curSent > 0) or `_resyncAndHL()` after timings built |
| `buildSentenceTimings` | 3455 | Transcript | ⚠️ Sparse sentenceTimings — linear scan only, not binary search. Posts to worker and returns before timings exist — resync happens in worker onmessage |
| `buildTimingsFromPlainText` | 3489 | Transcript | |
| `_buildSentenceTimingsSync` | 3522 | Transcript | Calls `seekAudioToSentence()` or `_resyncAndHL()` after timings built |
| `_buildTimingsFromPlainTextSync` | 3652 | Transcript | Calls `seekAudioToSentence()` or `_resyncAndHL()` after timings built |
| `similarity` / `updateTranscriptUI` | 3691 | Transcript | |
| `yieldToMain` | 3699 | Ebook | |
| `loadEbook` | 3705 | Ebook | ⚠️ Uses `_ebookLoadGen` cancellation guard — stale loads abort after yields. Sets `totalSents` on book object after DOM build. Applies `item.cls` and `item.wordFmts` for inline formatting |
| `splitSentences` | 3816 | Ebook | ⚠️ Two copies must stay in sync — worker copy inside _timingWorkerFn (~3234) |
| `parseTxt` / `parseMd` / `parseHtml` | 3835 | Ebook | `parseMd` uses two-pass regex: first strips paired markers (`**bold**`), then sweeps isolated `*_\`~` chars |
| `extractFromDom` | 3857 | Ebook | ⚠️ Preserves inline formatting (italic, smallcaps) via `wordFmts`. Recognizes div classes (extract, num, right, center) as `cls`. Strips noise spans (pagebreak, spacec, gray, space, border). Maps `<p class="x-sg-chapter-heading">` to level-1 headings |
| `parseEpub` | 3937 | Ebook | |
| `extractEpubMeta` | 3974 | Ebook | Extracts `dc:title` and `dc:creator` from EPUB OPF metadata via regex. Loads JSZip if needed. Returns `{title, author}` or nulls on failure |
| `arrayBufferToBase64` | 3997 | Ebook | |
| `openModal` / `closeModal` | 4011 | Add Book Modal | |
| `resetModal` | 4014 | Add Book Modal | |
| `pillClick` | 4021 | Add Book Modal | Opens file picker for the clicked pill; skips if clear button was clicked |
| `folderChosen` | 4046 | Add Book Modal | |
| `folderAssign` | 4108 | Add Book Modal | |
| `addBook` | 4117 | Add Book Modal | ⚠️ Async — extracts EPUB metadata after reading ebook data. Uses extracted title only if current title matches auto-generated filename/folder name. Stores extracted author on book object |
| `openTranscriptModal` | 4179 | Transcript Modal | |
| `saveTranscript` / `removeTranscript` | 4208 | Transcript Modal | |
| `openLinkAudioModal` | 4231 | Link Audio Modal | |
| `saveLinkAudio` | 4252 | Link Audio Modal | ⚠️ Shows notx banner if no transcript after linking audio |
| `openEditBookModal` | 4273 | Edit Book Modal | Opens from library pencil icon; populates title, author, and file slots |
| `_renderEditBookSlots` | 4286 | Edit Book Modal | Builds binfo-slot rows; shows amber "needs relink" badge on audio slot when URL lost |
| `closeEditBookModal` | 4315 | Edit Book Modal | |
| `saveEditBook` | 4320 | Edit Book Modal | Saves title and author; persists to localStorage (browser) or PWA_PROG_KEY (PWA) |
| `editBookReassign` | 4343 | Edit Book Modal | Handles file replacement for audio/ebook/transcript/cover from library |
| `showRelink` / `closeRelink` | 4395 | Relink | ⚠️ `showRelink` checks dismiss flags before showing. `closeRelink` no longer resets `curBookIdx` |
| `rlDontRemind` / `rlDismissBook` / `rlDismissAll` / `rlDismissCancel` | 4406 | Relink | "Don't remind me" flow: per-book (`relinkDismissed`) or global (`verte_relink_dismissed_all` localStorage) |
| `rlLoad` | 4429 | Relink | |
| `pwaFolderChangeTap` | 4443 | PWA | ⚠️ Pre-pick warning only — pwaPickFolder commits immediately (see fragile #18) |
| `pwaPickFolder` | 4459 | PWA | |
| `pwaRegrantAccess` | 4468 | PWA | |
| `pwaScanAndRender` | 4481 | PWA | ⚠️ Revokes stale cover + audio blob URLs before rescanning. Shows rescan button in settings panel |
| `pwaScanBookFolder` | 4556 | PWA | |
| `getPwaProgress` / `savePwaProgress` | 4610 | PWA | `savePwaProgress` now persists `lastOpened` timestamp |
| `pwaOpenBook` | 4620 | PWA | Sets `b.lastOpened`. Uses `defaultPlaybackRate` as fallback. Extracts EPUB metadata on first open if `b.author` is null |
| `showScreen` | 4691 | Screen Router | |
| `pwaCheckOnLaunch` | 4700 | Screen Router | |
| `__testBridge` | 4741 | Test Bridge | |
| `migrateFromFolio` | 4760 | Migration | ⚠️ Migrates localStorage keys (`folio_*` → `verte_*`) and IndexedDB (`folio_pwa` → `verte_pwa`). Must run before any storage reads. Uses `indexedDB.databases()` (not available in Safari — OK, targets web + Android only). Idempotent |
| `init` | 4818 | Init | Calls `await migrateFromFolio()` before `cacheDOM()`. Loads `_libView`, `_libSort`, `_libFilter` from localStorage. Calls `_wireEbookScrub()` |

---

## IIFEs & Standalone Event Listeners

| Location | Line | Purpose |
|----------|------|---------|
| Scroll-pause detection | 3072 | Passive scroll listener on `#eScroll`, throttled via rAF. Sets `scrollPaused=true` for 2s |
| Auto-hide tap | 3122 | PWA only — `click` on `#eScroll` shows bars when hidden (single tap to reveal) |
| Close opts panel | 3132 | Click outside `#optPanel` closes it |
| Swipe gestures | 4718 | Touch-swipe left/right on `#eScroll` for skip. ⚠️ Aborts when text is selected (`getSelection()` guard) |
| SW registration + auto-reload | 4734 | Registers `sw.js`; `controllerchange` listener reloads page when new SW activates |

---

## Data Structures

```
library[i] = {
  id, title, author,                     // author auto-populated from EPUB metadata if available
  audioUrl, audioName, audioExt,
  ebookData, ebookName, ebookType,
  transcriptData, transcriptName, transcriptType,  // 'whisper'|'txt'|null
  coverUrl, coverName,
  curSent, curWord, audioTime,
  wpm, sentPauseMs, playbackRate,
  syncOffset, totalSents,
  lastOpened,                              // Date.now() timestamp, set on openBook/pwaOpenBook
  relinkDismissed,                        // true = don't show relink prompt for this book
  // PWA-only:
  audioHandle, ebookHandle, transcriptHandle, coverHandle,
  _unresolvedJsonCandidates,  // transient, never persisted
  hidden                      // PWA-only, stored in PWA_PROG_KEY
}

sentences[i] = {
  el: HTMLSpanElement,        // live DOM ref — STALE after innerHTML wipe
  words: [{el, text}, ...],
  text: string
}

sentenceTimings[i] = { start: number, end: number }  // sparse array (undefined for unmatched)
wordTimings[i] = { starts: Float64Array, count: number }  // sparse array
transcriptWords[i] = { word: string, start: number, end: number }
```

### Library State

| Variable | Type | Purpose |
|----------|------|---------|
| `_lastOpenedBookIdx` | `number` | Index of last opened book; persists after `goLib()` resets `curBookIdx` to -1. Used by `renderLib()` for `now-playing` card indicator |

### Chapter Cache

| Variable | Type | Purpose |
|----------|------|---------|
| `_cachedChIdx` | `number` | Index into `tocEntries` for currently cached chapter (-1 = no cache) |
| `_cachedChLabel` | `string` | Cached chapter label (truncated to 28 chars) |
| `_cachedChNext` | `number` | `sentIdx` of next chapter boundary (Infinity if last chapter). Used to skip `tocEntries` walk when `curSent` is within range |

### Auto-Hide State (PWA only)

| Variable | Type | Purpose |
|----------|------|---------|
| `_barsVisible` | `boolean` | Whether top bar and bottom controls are currently visible (default `true`) |
| `_barIdleTimer` | `number\|null` | setTimeout ID for the 6-second auto-hide countdown; `null` when inactive |

---

## Storage Modes

- **Browser mode** (`!IS_PWA`): metadata in localStorage (`verte_library_v2`), blobs in IndexedDB
- **PWA mode** (`IS_PWA && CAN_FS`): files from disk via File System Access handles, progress in localStorage (`verte_pwa_progress_v1`)
- `saveBookProgress()` routes correctly for both — always use it, not `saveLibrary()` directly
- **Display prefs**: `verte_display_prefs_v1` (both modes) — includes `orientation`, `autoScroll`, `defaultPlaybackRate`, `hlColor`, `suppressNotxBanner`, `suppressSpeedToast`, `confirmDelete`, `ttsVoiceIdx`
- **Library view**: `verte_lib_view_v1` (`grid`|`list`), `verte_lib_sort_v1` (`alpha`|`recent`|`progress`), `verte_lib_filter_v1` (`all`|`audio`|`ebook`)
- **Relink dismiss (all books)**: `verte_relink_dismissed_all` in localStorage
- **Migration**: `migrateFromFolio()` runs once on first load after rebrand — copies all `folio_*` localStorage keys to `verte_*` and clones `folio_pwa` IndexedDB to `verte_pwa`, then deletes old entries

---

## Playback State Rules

- **Audio mode** (`ttsMode===false`): `<audio>` element drives playback, `sentenceTimings[]` drives highlighting, `_wordTick()` at rAF for word highlights
- **TTS mode** (`ttsMode===true`): `speechSynthesis` speaks sentences sequentially, no audio element involved
- TTS mode is toggled by the user via `toggleTtsMode()` (top bar mic button) — only available for ebook-only books (no audio linked)
- `ttsMode` defaults to `false` on book open; user must opt in
- When TTS is toggled on, sentence highlighting auto-enables; when toggled off, highlighting turns off
- When audiobook is linked, highlighting defaults to Sentence + Word mode
- **Playback start**: `mediaPlay()` calls `_audio.play()` but only acquires wake lock in `.then()`. All other state (icon, mediaState, ticker, media session) is set exclusively by the `play` event handler in `wireAudioEvents` — this ensures highlighting only starts when audio actually begins playing
- **Auto-hide bars (PWA only)**: On playback start (`play` event / `ttsPlay`), `resetBarTimer()` starts a 6-second countdown. On pause/stop/ended, `clearBarTimer()` cancels the countdown and shows bars. Control interactions (skip, seek, volume, speed, options, TOC, keyboard) call `resetBarTimer()` to reset the countdown. Single tap on `#eScroll` shows bars when hidden. Bars fully collapse (height:0) so the reading area expands

---

## UI Architecture

### Top Bar Layout (flat flex, space-between)
- Back chevron, TOC (hamburger), Title/Author/Progress (flex:1, centered), Sleep timer (moon, badge overlay), TTS toggle (mic, ebook-only, hidden by default), Settings (gear)
- Title/author/progress use `clamp()` for responsive font sizing
- **PWA auto-hide**: Collapses via `height:0 + opacity:0 + pointer-events:none` when `#player` has `bars-hidden` class. Reading area expands to fill freed space

### Transcript Banners
- **`#txBanner`** (below top bar): Shows syncing states — loading, syncing, ready, warn, error. Uses `border-bottom` + shimmer `::after` at `bottom:0`
- **`#notxBanner`** (above bottom controls): Shows "No transcript — highlighting unavailable" with action buttons (Add transcript / Disable highlighting). Uses `border-top`
- `setBannerState()` manages both — `notx` state shows `#notxBanner`, all other states show `#txBanner`, `hidden` clears both

### Bottom Controls
- Volume popover (tap icon to open vertical slider, tap outside to close)
- 4 skip buttons: big-skip-back (1m/5 sentences), skip-back (15s/1 sentence), skip-forward, big-skip-forward
- Play/pause button centered between skip buttons
- Speed pill (tap to cycle RATE_STEPS)
- Skip button icons swap dynamically via `_updateSkipBtns()` — circular-arrow+15 for audio, chevrons for TTS
- Bottom bar hidden for ebook-only books until TTS is toggled on
- Seek strip shown only in audio mode
- Time display uses H:MM:SS format for audiobooks ≥1 hour
- **PWA auto-hide**: Same `bars-hidden` collapse mechanism as top bar

### Display Options
- Theme, Font, Reading (font size, line height, width, alignment) sections
- **Orientation lock** (`#orientSec`): Auto / Portrait / Landscape pills — PWA only, hidden in browser mode. Enters fullscreen then calls `screen.orientation.lock()`; reverts to auto on fullscreen exit. Info text explains the fullscreen requirement. Persisted in display prefs

### Library Toolbar
- Search input, sort button (A–Z / Recent / Progress), filter button (All / Audiobooks / Ebooks)
- Located between header and grid; preferences persisted to localStorage
- `renderLib()` applies search query, sort order, and filter before rendering cards
- View toggle button (top-left of header) switches between grid and list view
- List view uses `list-view` class on `#libGrid` — cards render as horizontal rows with 64px cover thumbnails and inline progress bars

### Library Settings
- Gear icon in top-right of library header toggles `#libSettingsPanel`
- **Rescan button** (`#rescanBtn`): PWA only — calls `pwaScanAndRender()` to refresh library from disk. Hidden in browser mode. Shown after first successful PWA scan

### Add Book Modal
- File pills show accepted file types below filename (`.fp-types` hint line)
- Audio: mp3, m4a, m4b, ogg, wav, aac, flac, opus
- Ebook: epub, txt, html, htm, md, xhtml
- Transcript: json, txt
- Cover: jpg, jpeg, png, webp, gif, avif

### Edit Book Details
- Opened from library card pencil icon (replaces old inline rename)
- Title input, author input (optional), file slots (binfo-slot style)
- File slots clickable in browser mode, read-only in PWA mode
- Audio slot shows amber "needs relink" badge when blob URL lost

### Relink Dismiss
- "Don't remind me" button on relink overlay → choice of "This book" / "All books" / Cancel
- Per-book: `b.relinkDismissed = true` (persisted in library)
- Global: `verte_relink_dismissed_all` localStorage flag
- `showRelink()` checks both flags before displaying
