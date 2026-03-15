# Folio — Function Index & Context

## File Layout

| Zone | Lines | Contents |
|------|-------|----------|
| CSS | 16–550 | All styles |
| HTML | 552–950 | 4 screens + 4 modals |
| JS | 952–4078 | All logic |

### HTML Structure

| Element | Purpose |
|---------|---------|
| `#toastContainer` | Toast mount point |
| `#installBanner` | PWA install prompt |
| `#pwaFirstRun` | First-run folder picker screen |
| `#pwaRegrant` | Re-grant permissions screen |
| `#library` | Library screen: header (with settings gear) + `#libSettingsPanel` + `#libGrid` card grid |
| `#player` | Player screen (audio, top bar, options, transcript banner, reader body, bottom controls) |
| `#bottomControls` | Bottom controls bar: seek strip + play/skip/vol/speed ctrl-row (hidden when ebook-only and TTS off) |
| `#modal` | Add Book modal (Audio, Ebook, Transcript, Cover pills — clickable to pick individual files) |
| `#txModal` | Transcript modal (add/replace transcript) |
| `#linkAudioModal` | Link Audio modal (add audio to ebook-only book) |
| `#editBookModal` | Edit Book Details modal (title, author, file slots — opened from library pencil icon) |
| `#relinkOverlay` | Relink audio overlay (expired audio URL); auto-shown on book open unless dismissed |

---

## Function Index

| Function | Line | Area | Notes |
|----------|------|------|-------|
| `showSyncHintOnce` | 1030 | Toast | One-time hint after first transcript sync |
| `showToast` | 1036 | Toast | |
| `acquireWakeLock` | 1053 | Wake Lock | |
| `setupMediaSession` | 1109 | Media Session | |
| `saveBookProgressDebounced` | 1137 | Save | |
| `updatePageTitle` | 1145 | Page Title | |
| `cycleSleepTimer` | 1161 | Sleep Timer | |
| `_openModalEl` / `_closeModalRestore` | 1201 | Modal Helpers | |
| `cacheDOM` | 1317 | DOM Cache | |
| `setPlayBtnIcon` | 1331 | DOM Cache | |
| `idbOpen` / `idbSet` / `idbGet` | 1343 | IndexedDB | |
| `saveLibrary` | 1383 | Library Persistence | |
| `loadLibrary` | 1428 | Library Persistence | |
| `saveBookProgress` | 1464 | Library Persistence | ⚠️ Call this not saveLibrary() from playback code |
| `flushPositionSync` | 1478 | Library Persistence | |
| `saveDisplayPrefs` | 1520 | Display Prefs | |
| `loadDisplayPrefs` | 1535 | Display Prefs | |
| `toggleLibSettings` | 1584 | Library UI | Toggles `#libSettingsPanel` visibility |
| `renderLib` | 1588 | Library UI | Shows onboarding card when library is empty (browser mode); pencil icon opens Edit Book modal |
| `unhideBook` | 1691 | Library UI | |
| `renameBook` | 1704 | Library UI | ⚠️ Remove blur listener before Enter/Escape to prevent double-fire |
| `deleteBook` | 1738 | Library UI | |
| `configurePlayerForMode` | 1786 | Player Config | ⚠️ Owns _audio.src — do not assign src before calling this. Defaults highlighting (off for TTS, word for audio). Calls `_updateSkipBtns()` |
| `toggleTtsMode` | 1814 | Player Config | Toggles TTS on/off for ebook-only books; auto-enables sentence HL on, disables HL on off. Calls `_updateSkipBtns()` |
| `openBook` | 1830 | Open/Close | ⚠️ Auto-shows relink overlay if `audioName` set but `audioUrl` lost (unless dismissed). Sets `#pAuthor` from `b.author` |
| `pulseResumeSent` | 1848 | Open/Close | |
| `goLib` | 1857 | Open/Close | ⚠️ Must clear sentences[], tocEntries[], sentenceTimings[] — already does |
| `seekAudioToSentence` | 1882 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `setMediaState` | 1889 | Media Controls | |
| `togglePlay` | 1892 | Media Controls | ⚠️ Shows toast if no audio and TTS off |
| `mediaPlay` / `mediaPause` / `mediaStop` | 1897 | Media Controls | |
| `_updateSkipBtns` | 1932 | Media Controls | Swaps skip button icons/labels: circular-arrow+15 for audio, chevrons for TTS; also handles big-skip (1m / 5 sentences) |
| `skip` | 1947 | Media Controls | In TTS mode: ±1 sentence (15s) or ±5 sentences (60s). In audio mode: seeks by seconds |
| `changeSpeed` | 1952 | Media Controls | |
| `cycleSpeed` | 1958 | Media Controls | Tap-to-cycle through RATE_STEPS; reads from `rateCustom` in TTS mode |
| `setRate` | 1964 | Media Controls | |
| `setVol` / `setVolBoth` / `toggleMute` | 2001 | Media Controls | |
| `toggleVolPop` | 2017 | Media Controls | Opens/closes volume popover; closes on outside tap |
| `onSeekInput` | 2030 | Media Controls | |
| `onSeekChange` | 2031 | Media Controls | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_wordTick` | 2053 | Audio Events | ⚠️ curWord=-1 sentinel prevents word-0 flash — do not change to 0 |
| `startWordTicker` / `stopWordTicker` | 2077 | Audio Events | |
| `wireAudioEvents` | 2081 | Audio Events | ⚠️ timeupdate self-heal for Samsung audio-focus steal — do not remove |
| `startScrollEngine` | 2144 | Scroll Engine | ⚠️ scrollTimer separate from _scrollPauseTimer — do not merge |
| `stopScrollEngine` | 2149 | Scroll Engine | |
| `advanceSent` | 2152 | Scroll Engine | |
| `nudge` | 2166 | Scroll Engine | In TTS mode while playing: calls `ttsStop(); ttsPlay()` to restart from new sentence |
| `resync` | 2173 | Scroll Engine | |
| `adjustOffset` / `updateOffsetUI` | 2183 | Sync Offset | |
| `getTtsVoices` | 2197 | TTS | |
| `setTtsVoice` / `setTtsRate` | 2212 | TTS | |
| `ttsPlay` | 2222 | TTS | ⚠️ ttsSpeaking owned here — stopScrollEngine must never set it. Reads rate from `rateCustom` input |
| `ttsPause` / `ttsStop` | 2272 | TTS | |
| `scrubToPosition` | 2283 | TTS | |
| `updateHL` | 2304 | Highlighting | ⚠️ sentences[] holds live DOM refs — stale after any #eContent innerHTML wipe |
| `updateProg` | 2316 | Highlighting | Guards null `_readProg` (progress bar removed from DOM) |
| `_cacheScrollMetrics` | 2328 | Highlighting | |
| `scrollToSent` | 2335 | Highlighting | |
| `toggleAS` | 2348 | Highlighting | |
| `toggleWordHl` / `toggleSentHl` | 2352 | Highlighting | |
| `_resyncAndHL` | 2371 | Highlighting | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `_syncHlPills` | 2386 | Highlighting | |
| `setHighlightMode` | 2392 | Highlighting | ⚠️ Updates notx banner reactively — shows/hides based on sentHlOn + ttsMode + transcript state |
| `toggleToc` | 2422 | TOC | |
| `buildToc` | 2427 | TOC | |
| `updateTocActive` | 2476 | TOC | |
| `toggleOpts` / `switchOptTab` | 2488 | Options | |
| `setTheme` | 2497 | Options | ⚠️ Wipes body.className — loses is-pwa class until reload (known issue #22) |
| `updateThemeColor` | 2504 | Options | |
| `setFont` | 2508 | Options | |
| `setFS` / `setLH` / `setMW` | 2525 | Options | |
| `setAlign` | 2528 | Options | |
| `setSentPause` / `toggleOpInfo` | 2540 | Options | |
| `loadTranscriptData` | 2573 | Transcript | ⚠️ Shows notx banner if no transcript + audio + sentHlOn + !ttsMode |
| `setBannerState` | 2627 | Transcript | ⚠️ notx state has separate HTML elements (txBannerTop/txBannerActions) from other states |
| `_timingWorkerFn` | 2669 | Transcript | ⚠️ Two copies of splitSentences + matching logic — worker copy must stay in sync (~2669) |
| `getTimingWorker` | 2847 | Transcript | |
| `buildSentenceTimings` | 2885 | Transcript | ⚠️ Sparse sentenceTimings — linear scan only, not binary search |
| `buildTimingsFromPlainText` | 2919 | Transcript | |
| `_buildSentenceTimingsSync` | 2952 | Transcript | |
| `_buildTimingsFromPlainTextSync` | 3078 | Transcript | |
| `similarity` / `updateTranscriptUI` | 3106 | Transcript | |
| `yieldToMain` | 3121 | Ebook | |
| `loadEbook` | 3127 | Ebook | ⚠️ No cancellation guard — race possible on rapid book switch (see folio-fragile.md #4) |
| `splitSentences` | 3230 | Ebook | ⚠️ Two copies must stay in sync — worker copy inside _timingWorkerFn (~2669) |
| `parseTxt` / `parseMd` / `parseHtml` | 3249 | Ebook | |
| `extractFromDom` | 3271 | Ebook | ⚠️ Skips bare text nodes in divs — text with no block children silently dropped |
| `parseEpub` | 3293 | Ebook | |
| `arrayBufferToBase64` | 3331 | Ebook | |
| `openModal` / `closeModal` | 3345 | Add Book Modal | |
| `resetModal` | 3348 | Add Book Modal | |
| `pillClick` | 3355 | Add Book Modal | Opens file picker for the clicked pill; skips if clear button was clicked |
| `folderChosen` | 3380 | Add Book Modal | |
| `folderAssign` | 3442 | Add Book Modal | |
| `addBook` | 3451 | Add Book Modal | |
| `openTranscriptModal` | 3498 | Transcript Modal | |
| `saveTranscript` / `removeTranscript` | 3527 | Transcript Modal | |
| `openLinkAudioModal` | 3550 | Link Audio Modal | |
| `saveLinkAudio` | 3571 | Link Audio Modal | ⚠️ Shows notx banner if no transcript after linking audio |
| `openEditBookModal` | 3592 | Edit Book Modal | Opens from library pencil icon; populates title, author, and file slots |
| `_renderEditBookSlots` | 3605 | Edit Book Modal | Builds binfo-slot rows; shows amber "needs relink" badge on audio slot when URL lost |
| `closeEditBookModal` | 3634 | Edit Book Modal | |
| `saveEditBook` | 3639 | Edit Book Modal | Saves title and author; persists to localStorage (browser) or PWA_PROG_KEY (PWA) |
| `editBookReassign` | 3662 | Edit Book Modal | Handles file replacement for audio/ebook/transcript/cover from library |
| `showRelink` / `closeRelink` | 3714 | Relink | ⚠️ `showRelink` checks dismiss flags before showing. `closeRelink` no longer resets `curBookIdx` |
| `rlDontRemind` / `rlDismissBook` / `rlDismissAll` / `rlDismissCancel` | 3725 | Relink | "Don't remind me" flow: per-book (`relinkDismissed`) or global (`folio_relink_dismissed_all` localStorage) |
| `rlLoad` | 3748 | Relink | |
| `pwaFolderChangeTap` | 3762 | PWA | ⚠️ Pre-pick warning only — pwaPickFolder commits immediately (see fragile #18) |
| `pwaPickFolder` | 3778 | PWA | |
| `pwaRegrantAccess` | 3787 | PWA | |
| `pwaScanAndRender` | 3800 | PWA | |
| `pwaScanBookFolder` | 3862 | PWA | |
| `getPwaProgress` / `savePwaProgress` | 3916 | PWA | |
| `pwaOpenBook` | 3926 | PWA | Sets `#pAuthor` from `b.author` |
| `showScreen` | 3984 | Screen Router | |
| `pwaCheckOnLaunch` | 3993 | Screen Router | |
| `__testBridge` | 4033 | Test Bridge | |
| `init` | 4050 | Init | |

---

## Data Structures

```
library[i] = {
  id, title, author,                     // author is optional, null if unset
  audioUrl, audioName, audioExt,
  ebookData, ebookName, ebookType,
  transcriptData, transcriptName, transcriptType,  // 'whisper'|'txt'|null
  coverUrl, coverName,
  curSent, curWord, audioTime,
  wpm, sentPauseMs, playbackRate,
  syncOffset, totalSents,
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

---

## Storage Modes

- **Browser mode** (`!IS_PWA`): metadata in localStorage (`folio_library_v2`), blobs in IndexedDB
- **PWA mode** (`IS_PWA && CAN_FS`): files from disk via File System Access handles, progress in localStorage (`folio_pwa_progress_v1`)
- `saveBookProgress()` routes correctly for both — always use it, not `saveLibrary()` directly
- **Display prefs**: `folio_display_prefs_v1` (both modes)
- **Relink dismiss (all books)**: `folio_relink_dismissed_all` in localStorage

---

## Playback State Rules

- **Audio mode** (`ttsMode===false`): `<audio>` element drives playback, `sentenceTimings[]` drives highlighting, `_wordTick()` at rAF for word highlights
- **TTS mode** (`ttsMode===true`): `speechSynthesis` speaks sentences sequentially, no audio element involved
- TTS mode is toggled by the user via `toggleTtsMode()` (top bar mic button) — only available for ebook-only books (no audio linked)
- `ttsMode` defaults to `false` on book open; user must opt in
- When TTS is toggled on, sentence highlighting auto-enables; when toggled off, highlighting turns off
- When audiobook is linked, highlighting defaults to Sentence + Word mode

---

## UI Architecture

### Top Bar Layout (flat flex, space-between)
- Back chevron, TOC (hamburger), Title/Author/Progress (flex:1, centered), Sleep timer (moon, badge overlay), TTS toggle (mic, ebook-only, hidden by default), Settings (gear)
- Title/author/progress use `clamp()` for responsive font sizing

### Bottom Controls
- Volume popover (tap icon to open vertical slider, tap outside to close)
- 4 skip buttons: big-skip-back (1m/5 sentences), skip-back (15s/1 sentence), skip-forward, big-skip-forward
- Play/pause button centered between skip buttons
- Speed pill (tap to cycle RATE_STEPS)
- Skip button icons swap dynamically via `_updateSkipBtns()` — circular-arrow+15 for audio, chevrons for TTS
- Bottom bar hidden for ebook-only books until TTS is toggled on
- Seek strip shown only in audio mode

### Library Settings
- Gear icon in top-right of library header toggles `#libSettingsPanel`
- Placeholder panel — content TBD

### Edit Book Details
- Opened from library card pencil icon (replaces old inline rename)
- Title input, author input (optional), file slots (binfo-slot style)
- File slots clickable in browser mode, read-only in PWA mode
- Audio slot shows amber "needs relink" badge when blob URL lost

### Relink Dismiss
- "Don't remind me" button on relink overlay → choice of "This book" / "All books" / Cancel
- Per-book: `b.relinkDismissed = true` (persisted in library)
- Global: `folio_relink_dismissed_all` localStorage flag
- `showRelink()` checks both flags before displaying
