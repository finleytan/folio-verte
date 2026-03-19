# Verte — Fragile Areas (deep reference)

Load this file only when editing a ⚠️-flagged function. Each item corresponds to a ⚠️ flag in verte-context.md.

---

### 1. Stale DOM refs
`sentences[]` holds live DOM refs — any `#eContent` innerHTML wipe without clearing `sentences`, `_activeSentEl`, `_activeWordEl` causes stale-ref bugs. `goLib()` now clears `sentences=[]` and `tocEntries=[]`.

### 2. Fire-and-forget blobs
`saveLibrary()` blob write is async fire-and-forget; closing tab before IDB flush = data loss for new books.

### 3. Yield-to-main
Transcript state machine needs `await yieldToMain()` — missing `await` = banner states don't paint.

### 4. loadEbook cancellation via _ebookLoadGen
`loadEbook` uses a monotonic `_ebookLoadGen` counter. Each call increments it and captures the value; after every `await` (parseEpub, yieldToMain), it checks `gen !== _ebookLoadGen` and returns early if a newer load started. This prevents two concurrent loads from writing to the same `#eContent` and `sentences[]`. Do not remove the stale-checks after yields. The guard does NOT protect the initial `content.innerHTML` wipe or parsing — only post-yield DOM operations.

### 4b. Sync window cap
`buildSentenceTimings` search window is `sWords.length*30+200` — larger than before but still capped. Very long audio intros not in ebook can still desync cursor.

### 5. PWA folder hash
book.id = folder name hash — renaming folder loses all saved progress.

### 6. No audio persistence
blob URLs are runtime-only. Browser mode reload = must re-link audio.

### 7. scrollTimer / _scrollPauseTimer separation
`scrollTimer` is now used exclusively by `advanceSent()` / `stopScrollEngine()`. The scroll-pause IIFE uses `_scrollPauseTimer` for its 2s cooldown. These must remain separate — re-merging them reintroduces the hang bug where user scrolling kills the TTS advance chain.

### 8. togglePlay TTS check
`togglePlay()` checks `ttsSpeaking` to decide play vs pause. `ttsSpeaking` is exclusively owned by `ttsPlay`/`ttsPause`/`ttsStop` — `stopScrollEngine` must not set it. If `ttsPaused` is true and `ttsSpeaking` is false, `togglePlay` correctly calls `ttsPlay()` which hits the resume path.

### 9. extractFromDom bare-div text
`div` is not in BLOCK and is descended into (not consumed atomically). A `<div>` containing only raw text with no block children will have that text silently dropped, since the walker skips `nodeType===3` text nodes. Rare in real EPUBs/HTML, but possible in minimal hand-authored files.

### 10. PWA rename spread order
`pwaScanAndRender` merges saved progress via `{...scanned, ...saved}`, so `renameBook()` must write the custom title to `PWA_PROG_KEY` — otherwise the next folder scan overwrites it with the folder-derived title.

### 11. loadTranscriptData must be awaited before loadEbook
Both are async. If `loadTranscriptData` is fire-and-forget, `scheduler.postTask('background')` in `yieldToMain()` can defer it past the entire ebook build. When it finally resumes it wipes `sentenceTimings=[]` and re-parses — but by then `transcriptWords` may already have been consumed by the first `buildSentenceTimings`, leaving sentenceTimings permanently empty. `openBook` and `pwaOpenBook` now both `await loadTranscriptData(b)`.

### 12. timeupdate mediaState self-heal
Android (Samsung One UI especially) can steal audio focus briefly, firing a `pause` event → `mediaState='paused'`, then resuming audio without a `play` event. The `timeupdate` handler self-heals by checking `!audio.paused && mediaState!=='playing'` and running the full state quad. Do not remove this guard — it is the only recovery path for this Android-specific behaviour.

### 13. Sparse sentenceTimings and search algorithms
`sentenceTimings` is a sparse array (undefined holes for unmatched sentences). Binary search breaks on sparse arrays — a hole at the midpoint sends the search left, skipping all valid entries on the right. The `timeupdate` and `onSeekChange` handlers now use reverse linear scan. If you add new code that searches `sentenceTimings`, use linear scan or ensure the array is dense.

### 14. curWord = -1 sentinel
`timeupdate` and `setRate()` set `curWord = -1` on sentence transitions and rate changes to prevent a word-0 flash. `updateHL()` skips word highlight when `curWord < 0`. `_wordTick()` naturally handles the sentinel because its binary search always returns `w >= 0`, so `w !== curWord` is true and it recalculates. Do not change the `-1` to `0` — it reintroduces the flicker at sentence boundaries.

### 15. PWA JSON transcript auto-assignment
`pwaScanBookFolder()` uses tiered matching: Tier 1 filename contains 'transcript'/'whisper', Tier 2 filename contains a folder-name word (3+ chars), Tier 3 lone JSON fallback. When multiple JSONs exist and none match Tiers 1–2, the book is flagged with `_unresolvedJsonCandidates` (transient field, never persisted). `_resolveAmbiguousTranscripts()` shows a picker sheet after scan completes. `loadTranscriptData()` validates the JSON structure (must have `.segments` or `.words` array) before proceeding — rejects config/metadata JSON with an error banner.

### 16. let-scoped variables inaccessible from page.evaluate
All state variables (`sentences`, `sentenceTimings`, `curSent`, `mediaState`, etc.) are declared with `let` inside the `<script>` block, so they are NOT on `window`. Playwright `page.evaluate()` runs in a separate scope and cannot access them. Tests must use `__testBridge(action, value)` (a `function` declaration, therefore on `window`) to get/set these variables. Do not use `window.sentences` or `window.sentenceTimings` in tests — it creates a new `window` property that the app code never reads.

### 17. renameBook inline edit lifecycle
`renameBook()` replaces the `.book-title` div with an `<input>`. The blur handler calls `finish()` which calls `renderLib()`. The Enter handler must `removeEventListener('blur', finish)` first to prevent double-fire (Enter → finish → renderLib rebuilds card → input is removed from DOM → browser fires blur on removed input → second finish). Escape also removes the blur listener before calling `renderLib()`.

### 18. pwaFolderChangeTap is pre-pick only
The warning sheet appears BEFORE `showDirectoryPicker()` — not after. `pwaPickFolder()` commits the handle immediately on pick with no post-pick confirmation. The pre-pick sheet is only shown when changing an existing folder (`#pwaFolderBadge` onclick), not on first-run or regrant screens which call `pwaPickFolder()` directly.

### 19. SW cache key must be bumped on code changes
`sw.js` uses a static cache key (`verte-v2`). The app shell strategy is stale-while-revalidate (serves from cache instantly, fetches update in background), so changes are picked up on the next launch — but only if the browser detects that `sw.js` itself has changed (byte-level comparison). If you change `index.html` without also changing `sw.js` (e.g. bumping the cache key), browsers that have already cached the SW may not re-fetch the app shell at all. Always bump the cache version string when shipping `index.html` changes. A `controllerchange` listener auto-reloads the page when a new SW takes over, so users get updates on the current session (no manual close/reopen needed). Do not remove this listener — without it, updates only appear on the next app launch.

### 20. PWA safe-area padding on .top-bar only
`padding-top:env(safe-area-inset-top)` must be applied to `.top-bar` only, not to both `.top-bar` and `#player`. Since `.top-bar` is a child of `#player`, applying to both doubles the notch inset on mobile devices.

### 21. 3-state highlight mode via setHighlightMode()
The UI presents three pills (Off / Sentence / Sentence + Word) mapped to `sentHlOn`/`wordHlOn` booleans. `setHighlightMode()` is the primary entry point; `toggleSentHl()`/`toggleWordHl()` are kept for test bridge backward compat but their HTML toggle elements are removed. When re-enabling from off, `_resyncAndHL()` must run a reverse linear scan on sparse `sentenceTimings` to find the correct `curSent` for the current audio time — without this, the highlight snaps to a stale position on low match % books. `updateTocActive()` still runs regardless of `sentHlOn`. `pulseResumeSent()` skips the pulse animation but still calls `scrollToSent()`.

### 22a. _applyHlColor must use document.body.style not document.documentElement.style
`_applyHlColor()` sets `--hl-bg`, `--hl-border`, and `--word-hl` via `document.body.style.setProperty()`. Using `document.documentElement.style` (html element) is wrong: `body.theme-xxx{}` CSS class rules are closer in the cascade than html inline styles, so the body-class value always wins and the picker has no effect on light themes. The fix is intentional — do not revert to `documentElement`.

### 22. setTheme() wipes body.className
`setTheme()` sets `document.body.className = t?'theme-'+t:''`, which removes ALL classes including `is-pwa`. The `is-pwa` class is re-added on next `init()` but is lost during the session after a theme change. CSS rules using `body.is-pwa` (e.g. safe-area padding) break until reload. Known pre-existing issue.

### 23. setFont() OpenDyslexic CDN injection
When `key==='dyslexic'`, `setFont()` injects `<link>` elements for jsdelivr `@fontsource/opendyslexic` (index.css for 400 weight + 700.css for bold), guarded by `getElementById('font-opendyslexic')` to prevent duplicates. `link.onload` re-sets `--font-body` to force a repaint after the stylesheet arrives (fixes slow-connection rendering). `loadDisplayPrefs()` also injects the CDN links on reload when `fontKey==='dyslexic'` (same guard + onload pattern), and migrates old saved font-family `'Open Dyslexic'` → `'OpenDyslexic'` (no space). The font-family string must be `'OpenDyslexic'` (no space, capital O and D) to match the @fontsource CDN's `@font-face` declaration.

### 24. Transcript matching tuning is duplicated
The Jaccard matching logic exists in two identical copies — inside `_timingWorkerFn()` (worker, uses `var`) and `_buildSentenceTimingsSync()` (main thread, uses `const`/`let`). All tuning parameters (window multiplier, maxRunLen cap, pass 1 threshold) must be changed in both copies simultaneously. The three tuning knobs are: search window (`sWords.length*30+200`), maxRunLen cap (`sWords.length+15` when `≤6` words), and pass 1 acceptance threshold (tiered: `≤4`→0.45, `≤7`→0.52, else 0.6).

### 25. PWA hide uses Object.assign preservation
`savePwaProgress()` and `flushPositionSync()` use `Object.assign(existing, prog)` which preserves `hidden:true` because `prog` never sets a `hidden` field. Do not add `hidden` to the `prog` object in those functions or it will overwrite the hidden state. `unhideBook()` explicitly `delete`s `all[id].hidden` rather than setting it to `false`, keeping the saved progress object clean.

### 26. _resyncAndHL() uses reverse linear scan on sparse sentenceTimings
Consistent with `timeupdate` and `onSeekChange` handlers (see #13). Uses `isFinite(_audio.currentTime)` guard for edge cases where audio is not yet loaded. Sets `curWord=-1` sentinel after resync to prevent word-0 flash (see #14). Only resyncs in audio mode — TTS mode's `curSent` is always accurate since `ttsPlay` advances it directly.

### 27. _hiddenBooks is repopulated on every pwaScanAndRender()
Not persisted — derived from `PWA_PROG_KEY` on each scan. `deleteBook()` in PWA mode pushes to `_hiddenBooks` for immediate UI update without requiring a rescan. `unhideBook()` splices from `_hiddenBooks` and pushes back to `library` with re-sort.

### 28. resetModal() must match Add Book modal HTML pill IDs
`resetModal()` iterates `['audioName','ebookName','transcriptName','coverName']` and sets `.textContent` on each. If a pill is removed from or added to the modal HTML, this array must be updated in sync — a missing element causes `null.textContent` TypeError that kills `openModal()`.

### 29. Transcript JSON auto-assignment is duplicated
Tiered matching logic (Tier 1 'transcript'/'whisper', Tier 2 folder-name word 3+ chars, Tier 3 lone JSON) exists in both `folderChosen()` (browser mode) and `pwaScanBookFolder()` (PWA mode). Changes to the tiering heuristics must be made in both places. The browser version uses `File` objects with `.name`; the PWA version uses `{name, handle, ext}` objects — the `.name` property is compatible but the structures differ.

### 30. getTimingWorker() can return null
Worker creation is wrapped in try/catch — `file://` origins, CSP restrictions, or browser bugs can prevent Blob Worker instantiation. All callers (`buildSentenceTimings`, `buildTimingsFromPlainText`) must null-check the return value and fall back to `_buildSentenceTimingsSync()` / `_buildTimingsFromPlainTextSync()`. The `onerror` handler also nulls `_timingWorker` and clears `_timingWorkerTimeout` before falling back.

### 31. saveLinkAudio() must mirror configurePlayerForMode audio-mode setup
When linking audio to a TTS-only book, `saveLinkAudio()` shows the seek strip, hides the TTS bar, removes `tts-active` class from `#bottomControls` (which CSS-unhides `.speed-strip` and `.vol-wrap`), and removes the `.scrubbing` class from `.read-progress-wrap`. Missing any of these leaves TTS-mode UI artifacts visible in audio mode.

### 32. _pendingTimingBookIdx must be set before yieldToMain()
Both `buildSentenceTimings()` and `buildTimingsFromPlainText()` set `_pendingTimingBookIdx=curBookIdx` before the first `await`. If set after `yieldToMain()`, a rapid book switch during the yield can cause the stale-result guard to accept results for the wrong book.

### 33. nudge() must ttsStop/ttsPlay when TTS is playing
`nudge()` adjusts `curSent` and restarts playback. In TTS mode it must call `ttsStop(); ttsPlay()` — not `clearTimeout(scrollTimer); advanceSent()`. `advanceSent()` is the non-TTS scroll engine timer; calling it while `speechSynthesis` is speaking leaves the old utterance running while the UI jumps to a different sentence. `skip()` delegates to `nudge()` in TTS mode (±1 or ±5 sentences).

### 34. _editBookIdx is separate from curBookIdx
`_editBookIdx` tracks which book is being edited from the library screen. `curBookIdx` tracks the book open in the player. They are independent — editing a book's files from the library does not open it in the player. Do not use `curBookIdx` in `editBookReassign` or `saveEditBook`.

### 35. Relink dismiss flags checked in showRelink()
`showRelink()` returns early (no overlay) if `localStorage.getItem('verte_relink_dismissed_all')` or `library[i].relinkDismissed` is truthy. The per-book flag is persisted via `saveLibrary()`. Reset global flag with `localStorage.removeItem('verte_relink_dismissed_all')`. Reset per-book with `delete library[i].relinkDismissed; saveLibrary()`.

### 36. buildSentenceTimings returns before timings exist
`buildSentenceTimings()` posts to the web worker and returns immediately — the `await` only covers `yieldToMain()`. Timings are populated asynchronously via the worker's `onmessage` handler. Any code that needs timings after calling `buildSentenceTimings()` must not assume they exist on the next line. The `onmessage` handler and both sync fallbacks (`_buildSentenceTimingsSync`, `_buildTimingsFromPlainTextSync`) call either `seekAudioToSentence()` (if audio is at 0 and `curSent > 0`, meaning user had ebook progress before audio was linked) or `_resyncAndHL()` (for mid-playback resync).

### 37. mediaPlay only acquires wake lock — play event owns playback state
`mediaPlay()` calls `_audio.play().then()` but the `.then()` callback only acquires wake lock. All playback state changes (`setPlayBtnIcon`, `setMediaState`, `startWordTicker`, `updateMediaSessionState`, `updatePageTitle`) are handled exclusively by the `play` event handler in `wireAudioEvents`. This prevents highlighting from starting before audio actually begins playing (e.g. during buffering). Do not add state changes back into `mediaPlay().then()`.

### 38. seekAudioToSentence defers seek if audio not ready
`seekAudioToSentence()` checks `_audio.readyState >= 1` before setting `currentTime`. If audio metadata hasn't loaded yet, it registers a one-shot `loadedmetadata` listener to perform the seek later. This handles the race where `loadEbook`'s `onDone` callback runs before the audio element has loaded metadata for a newly-linked audio file.

### 39. extractEpubMeta loads JSZip independently
`extractEpubMeta()` loads JSZip via the same CDN fallback chain as `parseEpub()`. It is called from `addBook()` (browser mode) and `pwaOpenBook()` (PWA mode) before `parseEpub()` runs, so JSZip may not be loaded yet. The function must not assume JSZip is available — it loads it on demand and returns `{title:null, author:null}` on any failure.

### 40. _barIdleTimer is independent of _scrollPauseTimer
`_barIdleTimer` (6-second auto-hide countdown for PWA bars) and `_scrollPauseTimer` (2-second scroll-pause cooldown) are separate timers serving different purposes. `_barIdleTimer` controls top-bar/bottom-controls visibility; `_scrollPauseTimer` controls the auto-scroll pause after user scrolling. Do not merge them — merging reintroduces either the scroll hang bug (#7) or breaks bar auto-hide. `resetBarTimer()` is called inside the scroll rAF callback to show bars on manual scroll, but the two timers run independently.

### 41. resetBarTimer() must be called after setMediaState('playing')
`resetBarTimer()` internally calls `_shouldAutoHide()`, which checks `mediaState === 'playing'`. If `resetBarTimer()` is called before `setMediaState('playing')` in a playback-start path (e.g. `wireAudioEvents` `play` handler, `ttsPlay` resume path), `_shouldAutoHide()` sees the stale state and returns false — the 6-second auto-hide timer never starts. Always place `resetBarTimer()` after the full state quad in playback-start code paths.

### 42. screen.orientation.lock() requires fullscreen on Android
`screen.orientation.lock()` throws `SecurityError` unless the page is in fullscreen mode on Android Chrome (even in standalone PWA mode). `setOrientation()` calls `document.documentElement.requestFullscreen()` first, then locks orientation in the `.then()` callback. Auto mode calls `screen.orientation.unlock()` + `document.exitFullscreen()`. The lock is lost when the user exits fullscreen (e.g. swipe down on Android). Both `requestFullscreen` and `lock` are wrapped in `.catch()` to silently handle unsupported platforms (iOS). The `#orientSec` section is hidden by default and only shown in PWA mode via `loadDisplayPrefs()`. Manifest uses `"orientation": "any"` — runtime API handles locking. `loadDisplayPrefs` restores the pill state but does NOT call `lock()` on init (no user gesture = fullscreen request would fail).

### 43. setBannerState manages two separate banner elements
`#txBanner` (below top bar) handles syncing states (loading, syncing, ready, warn, error). `#notxBanner` (above bottom controls) handles the notx state (no transcript warning). `setBannerState('hidden')` clears both elements' class lists. When adding a new banner state, decide which element it belongs to and update the correct branch in `setBannerState()`. The notx children (`txBannerTop`, `txBannerActions`) live inside `#notxBanner`; the syncing children (`txBannerIcon`, `txBannerMsg`, `txBannerSpinner`, `txBannerDetail`) live inside `#txBanner`. Do not mix them up.

### 45. _defaultHlMode is separate from current session highlight state
`_defaultHlMode` stores the user's preferred default highlight mode for newly opened books ('off', 'sentence', or 'word'). It is set by `setDefaultHlMode()` (Library tab pills) and persisted as `defaultHlMode` in display prefs. `configurePlayerForMode` reads `_defaultHlMode` for audio books; `toggleTtsMode` reads it when TTS is toggled on (falling back to 'sentence' if default is 'off'). Do not confuse `_defaultHlMode` with the current session state (`sentHlOn`/`wordHlOn`) — `setHighlightMode()` changes the session state but does NOT update `_defaultHlMode`. Only `setDefaultHlMode()` and `loadDisplayPrefs()` update `_defaultHlMode`.

### 46. Unified settings panel IDs use s* prefix
All settings element IDs use the `s*` prefix (e.g. `sTheme-light`, `sHlMode-word`, `sFontSize`). JS functions that reference these IDs use `querySelectorAll('[id^=sTheme-]')` etc. Do not add new settings elements with old prefixes (`themePill-*`, `hlPill-*`, `fontPill-*`, `alignPill-*`, `orientPill-*`, `defHlPill-*`, `hlColorSwatch*`). The `#settingsPanel` is a sibling of `#library` and `#player`, not nested inside either. `_shouldAutoHide()` checks `settingsPanel.classList.contains('open')`.

### 47. skipChapter audio seek uses end-time of previous chapter
`skipChapter()` seeks audio to the **end time** of the last matched sentence before the chapter boundary, not the start time of the first sentence in the new chapter. Chapter headings don't exist in audiobook audio, so sentence timings at chapter boundaries are unreliable — using the previous chapter's end time gives the most accurate sync. Falls back to forward then backward start-time scan when no prior sentence exists (e.g. first chapter). Uses sparse sentenceTimings — linear scan only (see fragile #13).

### 48. Chapter counter filters by chapter-like headings
`updateProg()` counts only headings matching `/^(chapter|prologue|epilogue|part|book|act|section|interlude)\b|^\d+$/i` for the `Ch N/M` counter. This excludes frontmatter (Synopsis, Acknowledgments, etc.) from the count. If fewer than 2 headings match, falls back to showing chapter name without counter. If no headings match the pattern, falls back to counting all `tocEntries`.

### 44. Ebook scrub bar pointer-capture drag
`_wireEbookScrub()` uses `setPointerCapture` on the thumb element for reliable drag tracking. During scrub: (1) `.scrubbing` class disables CSS transitions for real-time tracking, (2) TTS is paused if playing and restarted on release via `ttsStop(); ttsPlay()`, (3) `curWord` is set to `-1` on commit (not `0`) to prevent the word-0 flash (see fragile #14). The scrub bar visibility is managed by `_showEbookScrub()` which also ensures `#bottomControls` is visible — this is important because `configurePlayerForMode` initially hides `bottomControls` for ebook-only books before sentences are loaded. The `loadEbook` callback calls `_showEbookScrub(true)` to reveal it after sentences are populated.
