# Verte — Function Index & Context

## File Layout

| Zone | Lines | Contents |
|------|-------|----------|
| CSS | 18–656 | All styles — wrapped in `#region CSS` with sub-regions: Theme Variables, Layout & Components, Responsive & Animation |
| HTML | 657–1221 | 4 screens + unified settings panel + 4 modals — wrapped in `#region HTML Templates` with sub-regions: Install Banner, PWA Screens, Library Screen, Settings Panel, Player Screen, Modals |
| JS | 1222–5090 | All logic — wrapped in `#region JavaScript` with sub-regions: State & Constants, Core Utilities, Keyboard & Modal Navigation, PWA Install & DOM Cache, Persistence, Library UI, Playback, Reader UI, Transcript & Timing, Modals, PWA File System & Screen Router, Init |

### HTML Structure

| Element | Purpose |
|---------|---------|
| `#toastContainer` | Toast mount point |
| `#installBanner` | PWA install prompt |
| `#pwaFirstRun` | First-run folder picker screen |
| `#pwaRegrant` | Re-grant permissions screen |
| `#library` | Library screen: header (with view toggle + settings gear) + `#libToolbar` (search + sort + filter) + `#libGrid` card grid |
| `#settingsPanel` | Unified settings panel (full-screen overlay, 4 tabs: Appearance, Playback, Library, Advanced). Accessible from both library and player gear buttons. All IDs use `s*` prefix (e.g. `sTheme-*`, `sHlMode-*`, `sFontSize`) |
| `#player` | Player screen (audio, top bar, transcript banner, reader body, bottom controls). Receives `bars-hidden` class for PWA auto-hide |
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
| `showSyncHintOnce` | 1299 | Toast | One-time hint after first transcript sync |
| `showToast` | 1305 | Toast | |
| `acquireWakeLock` | 1322 | Wake Lock | |
| `setupMediaSession` | 1378 | Media Session | |
| `saveBookProgressDebounced` | 1406 | Save | |
| `updatePageTitle` | 1414 | Page Title | |
| `cycleSleepTimer` | 1430 | Sleep Timer | |
| `_openModalEl` / `_closeModalRestore` | 1473 | Modal Helpers | |
| `cacheDOM` | 1595 | DOM Cache | |
| `setPlayBtnIcon` | 1609 | DOM Cache | |
| `xh` / `fmt` / `uid` | 1614 | Utility | `fmt` formats seconds as M:SS or H:MM:SS for durations ≥1 hour |
| `idbOpen` / `idbSet` / `idbGet` | 1623 | IndexedDB | |
| `saveLibrary` | 1663 | Library Persistence | |
| `loadLibrary` | 1708 | Library Persistence | |
| `saveBookProgress` | 1744 | Library Persistence | ⚠️ Call this not saveLibrary() from playback code. Auto-updates status to 'finished' at ≥95% progress |
| `flushPositionSync` | 1760 | Library Persistence | |
| `saveDisplayPrefs` | 1802 | Display Prefs | Saves all prefs including autoScroll, defaultPlaybackRate, hlColor, defaultHlMode, suppressNotxBanner, suppressSpeedToast, confirmDelete, ttsVoiceIdx |
| `loadDisplayPrefs` | 1826 | Display Prefs | Restores all prefs. Syncs `sTheme-*` pills. Restores `_defaultHlMode`. Defers TTS voice via `_pendingTtsVoiceIdx` |
| `openSettings` | 1893 | Settings Panel | Opens/toggles unified `#settingsPanel` overlay; accepts default tab name |
| `closeSettings` | 1899 | Settings Panel | Closes `#settingsPanel` |
| `switchSettingsTab` | 1902 | Settings Panel | Switches between Appearance/Playback/Library/Advanced tabs |
| `toggleLibSettings` | 1910 | Settings Panel | Wrapper — calls `openSettings('appearance')` |
| `toggleLibView` | 1911 | Library UI | Toggles grid/list view; persists to `verte_lib_view_v1` localStorage |
| `_applyLibView` | 1916 | Library UI | Applies view mode class to grid + swaps toggle icon + active state |
| `cycleLibSort` | 1927 | Library UI | Cycles A–Z / Recent / Progress; persists to `verte_lib_sort_v1` |
| `cycleLibFilter` | 1936 | Library UI | Cycles All / Not Started / Reading / Finished; persists to `verte_lib_filter_v1` |
| `_sortedLibIndices` | 1945 | Library UI | Returns library indices sorted by current `_libSort` order |
| `renderLib` | 1956 | Library UI | Shows onboarding card when library is empty (browser mode); applies search/sort/filter using `effectiveStatus` (manual `b.status` or auto-detected from progress); pencil icon opens Edit Book modal; ◐ icon opens status menu. Continue Reading section renders full book card with all actions (status/edit/delete); continue-reading book excluded from main grid to avoid duplication |
| `unhideBook` | 2118 | Library UI | ⚠️ Shows resume/start-over prompt if book has saved progress |
| `_doUnhide` | 2144 | Library UI | Executes unhide with optional progress reset |
| `renameBook` | 2158 | Library UI | ⚠️ Remove blur listener before Enter/Escape to prevent double-fire |
| `_execDelete` | 2192 | Library UI | Shared delete/hide logic used by both confirm and skip-confirm paths |
| `deleteBook` | 2213 | Library UI | ⚠️ Skips confirm card when `confirmDelete` is false |
| `markBook` | 2241 | Library UI | Shows inline status menu overlay on book card (Not Started / Reading / Finished). Uses `.status-menu` CSS |
| `setBookStatus` | 2270 | Library UI | Sets `b.status`; resets progress when set to 'new'. Persists to localStorage (browser) or PWA_PROG_KEY (PWA) |
| `configurePlayerForMode` | 2291 | Player Config | ⚠️ Owns _audio.src — do not assign src before calling this. Applies `_defaultHlMode` for audio books; sets 'off' for TTS books (restored on TTS toggle). Calls `_updateSkipBtns()`. Shows/hides ebook scrub bar and ctrl-row based on mode. `loadedmetadata` handler seeks to `b.audioTime` or falls back to `b.curSent` position |
| `toggleTtsMode` | 2325 | Player Config | Toggles TTS on/off for ebook-only books; restores `_defaultHlMode` on TTS enable (falls back to 'sentence' if default is 'off'), disables HL on off. Shows/hides ctrl-row + scrub-sole class. Calls `_updateSkipBtns()` |
| `openBook` | 2345 | Open/Close | ⚠️ Auto-shows relink overlay if `audioName` set but `audioUrl` lost (unless dismissed). Sets `b.lastOpened`. Auto-updates status from 'new' to 'reading'. Uses `defaultPlaybackRate` as fallback |
| `pulseResumeSent` | 2365 | Open/Close | |
| `goLib` | 2374 | Open/Close | ⚠️ Must clear sentences[], tocEntries[], sentenceTimings[] — already does. Calls `clearBarTimer()`, `_showEbookScrub(false)`. Closes `#settingsPanel` |
| `seekAudioToSentence` | 2403 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search. Defers seek via `loadedmetadata` listener if audio not ready (`readyState < 1`) |
| `setMediaState` | 2413 | Media Controls | |
| `togglePlay` | 2416 | Media Controls | ⚠️ Shows toast if no audio and TTS off |
| `mediaPlay` / `mediaPause` / `mediaStop` | 2422 | Media Controls | ⚠️ `mediaPlay` only acquires wake lock in `.then()` — all playback state (icon, mediaState, ticker) is set by the `play` event handler in `wireAudioEvents`, not here |
| `_updateSkipBtns` | 2472 | Media Controls | Swaps skip button icons/labels: circular-arrow+15 for audio, chevrons for TTS; also handles big-skip (1m / 5 sentences). Shows/hides chapter skip buttons based on `tocEntries` availability |
| `skip` | 2487 | Media Controls | In TTS mode: ±1 sentence (15s) or ±5 sentences (60s). In audio mode: seeks by seconds |
| `skipChapter` | 2502 | Media Controls | Jumps to next/prev chapter via `tocEntries`. Back: if >3 sentences into chapter jumps to its start, else previous chapter. Audio seek uses end-time of last matched sentence before chapter boundary. Handles TTS restart |
| `changeSpeed` | 2474 | Media Controls | |
| `cycleSpeed` | 2480 | Media Controls | Tap-to-cycle through RATE_STEPS; reads from `sRateCustom` in TTS mode |
| `setRate` | 2487 | Media Controls | Also syncs `sSpeed` slider and `sSpeedLbl` in settings panel |
| `setVol` / `setVolBoth` / `toggleMute` | 2528 | Media Controls | |
| `toggleVolPop` | 2546 | Media Controls | Opens/closes volume popover; closes on outside tap |
| `onSeekInput` | 2560 | Media Controls | |
| `onSeekChange` | 2561 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_wordTick` | 2584 | Audio Events | ⚠️ curWord=-1 sentinel prevents word-0 flash — do not change to 0 |
| `startWordTicker` / `stopWordTicker` | 2608 | Audio Events | |
| `wireAudioEvents` | 2612 | Audio Events | ⚠️ timeupdate self-heal for Samsung audio-focus steal — do not remove. `play` event is the single source of truth for playback state (icon, mediaState, ticker, wake lock). `play` handler calls `resetBarTimer()` **after** the state quad; `pause`/`ended` handlers call `clearBarTimer()` |
| `startScrollEngine` | 2674 | Scroll Engine | ⚠️ scrollTimer separate from _scrollPauseTimer — do not merge |
| `stopScrollEngine` | 2679 | Scroll Engine | |
| `advanceSent` | 2682 | Scroll Engine | |
| `nudge` | 2696 | Scroll Engine | In TTS mode while playing: calls `ttsStop(); ttsPlay()` to restart from new sentence |
| `resync` | 2703 | Scroll Engine | |
| `adjustOffset` / `updateOffsetUI` | 2713 | Sync Offset | |
| `getTtsVoices` | 2727 | TTS | ⚠️ Deferred voice restore via `_pendingTtsVoiceIdx` after voiceschanged. Uses `sTtsVoice` select element |
| `setTtsVoice` / `setTtsRate` | 2748 | TTS | |
| `ttsPlay` | 2758 | TTS | ⚠️ ttsSpeaking owned here — stopScrollEngine must never set it. Reads rate from `sRateCustom` input. Calls `resetBarTimer()` **after** the state quad (see fragile #41) |
| `ttsPause` / `ttsStop` | 2810 | TTS | Call `clearBarTimer()` |
| `scrubToPosition` | 2823 | TTS | |
| `_resolveChapterAtIdx` | 2841 | Ebook Scrub | Returns chapter name at given sentence index; caches result via `_cachedChIdx`/`_cachedChLabel`/`_cachedChNext` to skip redundant `tocEntries` walks. Cache reset on book close/switch |
| `_updateEbookScrub` | 2854 | Ebook Scrub | Syncs scrub bar fill/thumb to `curSent`; called from `updateProg()` |
| `_showEbookScrub` | 2860 | Ebook Scrub | Shows/hides scrub bar; also ensures `#bottomControls` is visible when scrub bar is shown |
| `_wireEbookScrub` | 2866 | Ebook Scrub | ⚠️ Pointer event handling for ebook scrub bar. Uses `setPointerCapture` for drag. Pauses TTS during scrub, restarts on release. Sets `curWord=-1` on commit (fragile #14). Called from `init()` |
| `updateHL` | 2939 | Highlighting | ⚠️ sentences[] holds live DOM refs — stale after any #eContent innerHTML wipe |
| `updateProg` | 2951 | Highlighting | Uses `_resolveChapterAtIdx` for chapter label. Shows chapter counter (`Ch N/M`) filtered by chapter-like headings (Chapter, Prologue, Epilogue, Part, bare numbers). Calls `_updateEbookScrub()` |
| `_cacheScrollMetrics` | 2960 | Highlighting | |
| `scrollToSent` | 2967 | Highlighting | |
| `toggleAS` | 2980 | Highlighting | Now calls `saveDisplayPrefs()` |
| `toggleSuppressNotxBanner` | 2985 | Highlighting | Flips `suppressNotxBanner`, syncs `sSuppressNotx` toggle, saves |
| `toggleSuppressSpeedToast` | 2990 | Highlighting | Flips `suppressSpeedToast`, syncs `sSuppressSpeed` toggle, saves |
| `toggleConfirmDelete` | 2995 | Highlighting | Flips `confirmDelete`, syncs `sConfirmDelete` toggle, saves |
| `setDefaultSpeed` | 3000 | Highlighting | Sets `defaultPlaybackRate`, updates `sDefSpeedLbl`, saves |
| `_syncDefHlPills` | 3005 | Highlighting | Syncs `[id^=sDefHl-]` pills to `_defaultHlMode` |
| `setDefaultHlMode` | 3009 | Highlighting | Sets `_defaultHlMode`, syncs pills, saves prefs. Called from Library tab default HL pills |
| `toggleWordHl` / `toggleSentHl` | 3014 | Highlighting | Dead functions — defined but no UI calls them |
| `_resyncAndHL` | 3033 | Highlighting | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_syncHlPills` | 3048 | Highlighting | Syncs `[id^=sHlMode-]` pills to current HL mode |
| `setHighlightMode` | 3054 | Highlighting | ⚠️ Updates notx banner reactively — shows/hides based on sentHlOn + ttsMode + transcript state |
| `toggleToc` | 3084 | TOC | |
| `buildToc` | 3090 | TOC | |
| `updateTocActive` | 3139 | TOC | |
| `toggleOpts` | 3151 | Settings Panel | Wrapper — calls `openSettings('playback')` |
| `setTheme` | 3152 | Settings | ⚠️ Wipes body.className — loses is-pwa class until reload (known issue #22). Syncs `sTheme-*` pills. Calls `_applyHlColor()` after theme change to reapply light/dark opacity variants |
| `_applyHlColor` | 3160 | Settings | Sets `--hl-bg`, `--hl-border`, `--word-hl`, `--word-hl-text` CSS vars. Detects light vs dark theme from `body.className` and applies `hlBg`/`hlBgDark` variants accordingly. Four colours: yellow, blue, pink, green. Yellow uses `wordText:#000000` (black text on highlight); others use `#ffffff`. Syncs `sHlColor-*` swatches. Does not save |
| `setHlColor` | 3179 | Settings | Sets `hlColor`, calls `_applyHlColor`, saves |
| `updateThemeColor` | 3184 | Settings | |
| `setFont` | 3188 | Settings | |
| `setFS` / `setLH` / `setMW` | 3205 | Settings | |
| `setAlign` | 3208 | Settings | |
| `setOrientation` | 3214 | Settings | ⚠️ PWA only — enters fullscreen via `requestFullscreen()` then locks via `screen.orientation.lock()`. Auto mode unlocks + exits fullscreen. `.catch()` silences errors on unsupported platforms (see fragile #42) |
| `setDefaultWpmFromSlider` / `setDefaultWpmFromInput` | 3231 | Settings | Syncs single `sWpmSlider`/`sWpmInput` pair |
| `updateWpmLabel` | 3233 | Settings | Updates single `sWpmLbl` label |
| `setSentPause` / `toggleOpInfo` | 3237 | Settings | `toggleOpInfo` uses `.s-label`/`.s-row` + `.s-desc` selectors |
| `_shouldAutoHide` | 3259 | Auto-Hide Bars | PWA only — returns true when bars can auto-hide (playing, no panels/modals open, on player screen). Checks `settingsPanel` for open state |
| `showBars` / `hideBars` | 3269 | Auto-Hide Bars | PWA only — add/remove `bars-hidden` class on `#player`. Bars collapse (height:0) so reading area expands |
| `resetBarTimer` | 3280 | Auto-Hide Bars | ⚠️ PWA only — show bars + restart 6-second idle timer. Must be called **after** `setMediaState('playing')` in playback start paths (see fragile #41) |
| `clearBarTimer` | 3286 | Auto-Hide Bars | PWA only — cancel timer + show bars. Called on pause/stop/ended/goLib |
| `setBannerState` | 3362 | Transcript | ⚠️ Manages two banner elements. `notx` branch returns early if `suppressNotxBanner` is true |
| `_timingWorkerFn` | 3398 | Transcript | ⚠️ Two copies of splitSentences + matching logic — worker copy must stay in sync (~3398). `doPlainTextTimings` now creates synthetic per-word timings and delegates to `doSentenceTimings` |
| `getTimingWorker` | 3565 | Transcript | ⚠️ Revokes blob URL immediately after Worker construction. Worker `onmessage` calls `seekAudioToSentence()` (if audio at 0 + curSent > 0) or `_resyncAndHL()` after timings built |
| `buildSentenceTimings` | 3608 | Transcript | ⚠️ Sparse sentenceTimings — linear scan only, not binary search. Posts to worker and returns before timings exist — resync happens in worker onmessage |
| `buildTimingsFromPlainText` | 3642 | Transcript | Worker message now includes `wordTimings` alongside `sentenceTimings` |
| `_buildSentenceTimingsSync` | 3675 | Transcript | Calls `seekAudioToSentence()` or `_resyncAndHL()` after timings built |
| `_buildTimingsFromPlainTextSync` | 3805 | Transcript | Creates synthetic per-word timings from plain text, then delegates to `_buildSentenceTimingsSync` |
| `similarity` / `updateTranscriptUI` | 3815 | Transcript | |
| `yieldToMain` | 3830 | Ebook | |
| `loadEbook` | 3836 | Ebook | ⚠️ Uses `_ebookLoadGen` cancellation guard — stale loads abort after yields. Sets `totalSents` on book object after DOM build. Applies `item.cls` and `item.wordFmts` for inline formatting |
| `splitSentences` | 3947 | Ebook | ⚠️ Two copies must stay in sync — worker copy inside _timingWorkerFn (~3398) |
| `parseTxt` / `parseMd` / `parseHtml` | 3966 | Ebook | `parseMd` uses two-pass regex: first strips paired markers (`**bold**`), then sweeps isolated `*_\`~` chars |
| `extractFromDom` | 3988 | Ebook | ⚠️ Preserves inline formatting (italic, smallcaps) via `wordFmts`. Recognizes div classes (extract, num, right, center) as `cls`. Strips noise spans (pagebreak, spacec, gray, space, border). Maps `<p class="x-sg-chapter-heading">` to level-1 headings |
| `parseEpub` | 4073 | Ebook | |
| `extractEpubMeta` | 4110 | Ebook | Extracts `dc:title` and `dc:creator` from EPUB OPF metadata via regex. Loads JSZip if needed. Returns `{title, author}` or nulls on failure |
| `arrayBufferToBase64` | 4133 | Ebook | |
| `openModal` / `closeModal` | 4149 | Add Book Modal | |
| `resetModal` | 4152 | Add Book Modal | |
| `pillClick` | 4159 | Add Book Modal | Opens file picker for the clicked pill; skips if clear button was clicked |
| `folderChosen` | 4184 | Add Book Modal | |
| `folderAssign` | 4246 | Add Book Modal | |
| `addBook` | 4255 | Add Book Modal | ⚠️ Async — extracts EPUB metadata after reading ebook data. Uses extracted title only if current title matches auto-generated filename/folder name. Stores extracted author on book object. Sets `status:'new'` on new books |
| `openTranscriptModal` | 4317 | Transcript Modal | |
| `saveTranscript` / `removeTranscript` | 4346 | Transcript Modal | |
| `openLinkAudioModal` | 4369 | Link Audio Modal | |
| `saveLinkAudio` | 4390 | Link Audio Modal | ⚠️ Shows notx banner if no transcript after linking audio |
| `openEditBookModal` | 4411 | Edit Book Modal | Opens from library pencil icon; populates title, author, and file slots |
| `_renderEditBookSlots` | 4424 | Edit Book Modal | Builds binfo-slot rows; shows amber "needs relink" badge on audio slot when URL lost |
| `closeEditBookModal` | 4453 | Edit Book Modal | |
| `saveEditBook` | 4458 | Edit Book Modal | Saves title and author; persists to localStorage (browser) or PWA_PROG_KEY (PWA) |
| `editBookReassign` | 4481 | Edit Book Modal | Handles file replacement for audio/ebook/transcript/cover from library |
| `showRelink` / `closeRelink` | 4534 | Relink | ⚠️ `showRelink` checks dismiss flags before showing. `closeRelink` no longer resets `curBookIdx` |
| `rlDontRemind` / `rlDismissBook` / `rlDismissAll` / `rlDismissCancel` | 4545 | Relink | "Don't remind me" flow: per-book (`relinkDismissed`) or global (`verte_relink_dismissed_all` localStorage) |
| `rlLoad` | 4568 | Relink | |
| `pwaFolderChangeTap` | 4585 | PWA | ⚠️ Pre-pick warning only — pwaPickFolder commits immediately (see fragile #18) |
| `pwaPickFolder` | 4601 | PWA | |
| `pwaRegrantAccess` | 4610 | PWA | |
| `pwaScanAndRender` | 4623 | PWA | ⚠️ Revokes stale cover + audio blob URLs before rescanning. Shows rescan button in settings panel via `sRescanBtn` |
| `pwaScanBookFolder` | 4698 | PWA | |
| `getPwaProgress` / `savePwaProgress` | 4752 | PWA | `savePwaProgress` persists `lastOpened` timestamp. Auto-updates status to 'finished' at ≥95% progress |
| `pwaOpenBook` | 4764 | PWA | Sets `b.lastOpened`. Auto-updates status from 'new' to 'reading'. Uses `defaultPlaybackRate` as fallback. Extracts EPUB metadata on first open if `b.author` is null |
| `showScreen` | 4836 | Screen Router | |
| `pwaCheckOnLaunch` | 4845 | Screen Router | |
| `__testBridge` | 4886 | Test Bridge | Supports: getSentences, getSentenceTimings, getMediaState, getCurSent, getCurWord, getBarsVisible, getBook, getHlState, getMatchStats, getWordTimings |
| `migrateFromFolio` | 4909 | Migration | ⚠️ Migrates localStorage keys (`folio_*` → `verte_*`) and IndexedDB (`folio_pwa` → `verte_pwa`). Must run before any storage reads. Uses `indexedDB.databases()` (not available in Safari — OK, targets web + Android only). Idempotent |
| `init` | 4969 | Init | Calls `await migrateFromFolio()` before `cacheDOM()`. Loads `_libView`, `_libSort`, `_libFilter` from localStorage. Validates filter value against new options. Calls `_wireEbookScrub()` |

---

## IIFEs & Standalone Event Listeners

| Location | Line | Purpose |
|----------|------|---------|
| Scroll-pause detection | 3240 | Passive scroll listener on `#eScroll`, throttled via rAF. Sets `scrollPaused=true` for 2s |
| Auto-hide tap | 3291 | PWA only — `click` on `#eScroll` shows bars when hidden (single tap to reveal) |
| Swipe gestures | 4869 | Touch-swipe left/right on `#eScroll` for skip. ⚠️ Aborts when text is selected (`getSelection()` guard) |
| SW registration + auto-reload | 4879 | Registers `sw.js`; `controllerchange` listener reloads page when new SW activates |

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
  status,                                  // 'new' | 'reading' | 'finished' — manual or auto-updated. Auto: 'new' on add, → 'reading' on open, → 'finished' at ≥95%. Setting to 'new' resets progress
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
- **Display prefs**: `verte_display_prefs_v1` (both modes) — includes `orientation`, `autoScroll`, `defaultPlaybackRate`, `hlColor`, `defaultHlMode`, `suppressNotxBanner`, `suppressSpeedToast`, `confirmDelete`, `ttsVoiceIdx`
- **Library view**: `verte_lib_view_v1` (`grid`|`list`), `verte_lib_sort_v1` (`alpha`|`recent`|`progress`), `verte_lib_filter_v1` (`all`|`new`|`reading`|`finished`) — old format-based values auto-migrate to `all`
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

### Unified Settings Panel (`#settingsPanel`)
- Full-screen overlay accessible from both library (gear → Appearance tab) and player (gear → Playback tab)
- 4 tabs: **Appearance** (theme, HL colour, font, reading settings, orientation lock), **Playback** (HL mode, auto-scroll, resync/offset, speed slider + presets, sentence pause, TTS voice), **Library** (default HL mode for new books, default speed, confirm delete, suppress toggles, rescan), **Advanced** (TTS scroll WPM, about)
- All IDs use `s*` prefix: `sTheme-*`, `sHlColor-*`, `sFont-*`, `sFontSize`, `sLineHeight`, `sMaxWidth`, `sAlign-*`, `sOrient-*`, `sHlMode-*`, `sAutoScroll`, `sSpeed`, `sSpeedLbl`, `sRateCustom`, `sSentPause`, `sSentPauseLbl`, `sTtsVoice`, `sTtsVoiceSec`, `sDefHl-*`, `sDefSpeed`, `sDefSpeedLbl`, `sConfirmDelete`, `sSuppressNotx`, `sSuppressSpeed`, `sRescanBtn`, `sWpmSlider`, `sWpmInput`, `sWpmLbl`, `sVersion`, `sResyncBtn`, `sOffsetRow`, `sOffsetVal`, `sOffsetDescRow`, `sOrientSec`
- `openSettings(tab)` toggles panel; `closeSettings()` closes it; `switchSettingsTab(name)` switches tabs
- **Orientation lock** (`#sOrientSec`): Auto / Portrait / Landscape pills — PWA only, hidden in browser mode
- **Rescan button** (`#sRescanBtn`): PWA only — in Library tab. Hidden in browser mode. Shown after first successful PWA scan
- **Default HL mode** (`_defaultHlMode`): Separate from current session HL state. Set via Library tab pills (`setDefaultHlMode`). Applied by `configurePlayerForMode` (audio books) and `toggleTtsMode` (TTS books). Persisted as `defaultHlMode` in display prefs

### Library Toolbar
- Search input, sort button (A–Z / Recent / Progress), filter button (All / Not Started / Reading / Finished)
- Located between header and grid; preferences persisted to localStorage
- `renderLib()` applies search query, sort order, and filter before rendering cards
- View toggle button (top-left of header) switches between grid and list view
- List view uses `list-view` class on `#libGrid` — cards render as horizontal rows with 64px cover thumbnails and inline progress bars

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
