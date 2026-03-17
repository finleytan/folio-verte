# Verte Reader — Changelog

---

## v2.10.0 — 2026-03-17

### Changed
- **Highlight colour palette** replaced — amber and rose removed; yellow and pink added. New set: Yellow (#F5D800), Blue (#5B8DEF), Pink (#E8507A), Green (#4CAF50)
- `_applyHlColor` now applies separate light/dark opacity variants for `--hl-bg` and `--hl-border` based on active theme (light themes use `.13`/`.50`; dark themes use `.12`/`.45`)
- `setTheme` now calls `_applyHlColor()` after applying the new theme class, so highlight opacity is always correct for the active theme
- Yellow highlight uses `--word-hl-text:#000000` (black) for word-level text; all other colours use `#ffffff` — eliminates poor contrast on yellow word highlight

### Added
- `--word-hl-text` CSS variable in `:root` (default `#ffffff`); set dynamically by `_applyHlColor`
- `.word.word-active` now uses `color:var(--word-hl-text)` instead of hardcoded `color:white`

### Fixed
- Stored `amber` or `rose` highlight colour from previous sessions now falls back to `blue` on load

---

## v2.9.0 — 2026-03-17

### Added
- **HC Dark theme** — pure black background (#000), white text, gold accent; high-contrast dark-mode companion to HC Light
- **Tallow theme** — warm parchment light theme (#F5F0E2 base) replacing the old Parchment/Sepia themes
- **Quire theme** — cool blue-grey light theme (#F1F3F6 base) for a clean, neutral reading surface
- **Umber theme** — warm dark mid-tone (#2A1E14 base) replacing the old Sage theme
- **Iron theme** — cool blue-grey dark (#0E1014 base) replacing the old plain Dark theme; depth shadows on top/bottom bars and book cards
- `--accent-text` CSS variable — brand gold on dark themes, WCAG-AA-compliant darkened gold (#7A5800) on light themes; used by lib tagline, progress text, and TOC active item

### Changed
- Vesper theme (formerly Midnight) — display name only; class `theme-night` unchanged
- Sepia theme removed; Sage theme removed
- Speed-pill color scoped to Tallow theme only (`body.theme-light .speed-pill`)
- Depth shadows added to `.top-bar`, `.bottom-controls`, and `.book-card`

### Fixed
- `_applyHlColor` now sets `--hl-bg`/`--hl-border`/`--word-hl` on `document.body.style` instead of `document.documentElement.style` — light-theme highlight colour selection was broken because `body.theme-xxx{}` class rules override html-level inline styles

---

## v2.8.1 — 2026-03-17

### Added
- "Continue Reading" section pinned at top of library — shows last-opened book, unaffected by search/sort/filter

### Fixed
- PWA icon filenames mismatched manifest paths (extra dot in filename)

---

## v2.8 — 2026-03-17

### Added
- Now-playing indicator on library cards — accent border ring on last-opened book
- `x-sg-chapter-heading` paragraph class mapped to level-1 headings in EPUB parser
- Chapter index cache in `_resolveChapterAtIdx` — skips redundant TOC walks during playback

### Fixed
- `parseMd` leaving partial markdown symbols (stray `*`, `_`) in reader view — now uses two-pass regex
- Install banner dismiss flag never expired — now uses 30-day timestamp with legacy backward compat
- Relinking audio while Ebooks filter active caused book to disappear from library — filter auto-resets to All

### Changed
- Library list view gap increased from 6px to 10px

---

## v2.7 — 2026-03-16

### Added
- Brand identity overhaul — IM Fell English wordmark font, V-mark SVG logo with gold fold corner, gold diamond divider, "Listen. Read. Disappear." tagline
- Five-theme system — Parchment, Dark, Sepia, Sage, Midnight (all with gold #C8980A accent). Removed old Hi-C Dark theme
- Theme color swatches — compact colored circles replace text pills in both player and library settings
- Highlight colour picker — Blue, Amber, Green, Rose swatches in both player options and library settings, with double-ring active state
- Library settings panel — full-screen overlay with close button, sections for Appearance, Playback defaults, Notifications, Library, Advanced, and About
- Persisted preferences — auto-scroll, default playback rate, highlight colour, TTS voice, suppress-notx-banner, suppress-speed-toast, confirm-delete all saved to localStorage
- Default playback rate — slider in library settings (0.5–3×), used as fallback when opening new books
- TTS voice persistence — saved voice index restored when voices load asynchronously
- Confirm delete toggle — skip inline confirmation when disabled
- Suppress notifications — toggles for "no transcript" banner and speed change toasts

### Fixed
- Auto-scroll preference never persisted (always reset to true on launch)
- updateWpmLabel crash on startup when #wpmSpeedLbl element missing
- Speed change toasts shown even when user doesn't want them
- "No transcript" banner shown even when user dismissed it
- Theme selection in library settings not synced with player options panel

---

## v2.6 — 2026-03-16

### Added
- Library view modes — toggle between grid and list view with a button in the library header. List view shows compact horizontal cards with inline progress bars. Preference persisted to localStorage
- Library search — real-time search input filters books by title or author
- Library sort — cycle through A–Z, Recent (last opened), and Progress sort orders. Persisted to localStorage
- Library filter — cycle through All, Audiobooks, and Ebooks filters. Persisted to localStorage
- Unhide book resume/start-over prompt — when restoring a hidden PWA book with saved progress, an inline overlay asks whether to resume or start fresh. Books with no progress restore immediately
- EPUB inline formatting preservation — `extractFromDom` now preserves italic (`<em>`/`<i>`), small-caps (`<span class="smallcaps">`), section breaks (`extract`/`extract1` divs), text alignment classes, and numbered list items from EPUB source. Noise spans (pagebreak, spacec, gray, etc.) are silently stripped
- Native text selection fix — removed horizontal padding from `.word` spans and added `box-decoration-break:clone` to `.word` and `.sent` to eliminate selection highlight seams on Android Chrome

---

## v2.5 — 2026-03-16

### Added
- Ebook scrub bar — Kindle-style draggable progress bar at the bottom of the reader for fast position jumping. Shows chapter name and percentage in a floating tooltip while dragging. Works in all ebook modes (plain reading, TTS, audio+ebook). Visible as the sole bottom element for ebook-only books without TTS enabled

---

## v2.4 — 2026-03-16

### Added
- Manual library rescan button in PWA settings panel — rescans folder for new/changed books without restarting the app

### Fixed
- Horizontal swipe conflicts with text selection — swipe gestures now abort when text is selected
- loadEbook race condition — rapid book switching no longer causes two books to write to the same DOM
- Cover and audio blob URLs leaked on PWA rescan — old URLs now revoked before each scan
- Timing worker blob URL never revoked — URL freed immediately after worker construction

---

## v2.3 — 2026-03-16

### Added
- Screen orientation lock setting in Display options (PWA only) — Auto, Portrait, or Landscape pills with info text explaining fullscreen requirement
- Orientation preference persisted in display prefs and restored on app load

### Changed
- Transcript banner split into two elements — syncing/loading/ready/warn banners stay below top bar; "no transcript" warning moved above bottom media controls
- Auto-hide bars: manual scroll no longer shows bars; single tap on reading area shows bars when hidden
- Bars fully collapse (height:0) so reading area expands to fill the screen
- Orientation lock enters fullscreen mode (Android requirement); reverts to auto on fullscreen exit
- Manifest orientation set to `any` (runtime API handles locking)
- App version bumped to 2.3.0

### Fixed
- Auto-hide CSS broken after theme change — removed redundant `body.is-pwa` scoping
- Auto-hide timer never starts — `resetBarTimer()` was called before `setMediaState('playing')`
- Orientation lock requires fullscreen on Android — now enters fullscreen before locking
- PWA does not pick up updates until manually closed — added `controllerchange` auto-reload

---

## v2.1 — 2026-03-16

### Added
- Auto-hide player bars in PWA mode — top bar and bottom controls collapse after 6 seconds of inactivity during active playback; reading area expands to fill the freed space
- Single tap on reading area restores bars when hidden
- Bars automatically reappear on any control interaction (play, skip, seek, volume, speed, options, TOC), manual scroll, or keyboard shortcut
- Bars remain visible when media is paused, stopped, or ended, and when any panel or modal is open

### Fixed
- PWA does not pick up updates until manually closed and reopened — added `controllerchange` listener that auto-reloads the page when a new service worker activates
- Auto-hide timer never starts on playback — `resetBarTimer()` was called before `setMediaState('playing')`, so the guard always saw stale state
- Auto-hide CSS rule broken after theme change — `setTheme()` wipes `body.className` removing `is-pwa`; removed redundant `body.is-pwa` scoping from CSS since JS is already gated by `IS_PWA`

### Changed
- Service worker cache key bumped from `verte-v1` to `verte-v2`
- App version bumped to 2.1.2

---

## v2.0 — 2026-03-16

### Changed
- App rebranded from "Folio" to "Verte" — all user-visible strings, page title, manifest name, MediaSession artist, install banner, onboarding, PWA setup text, and console message prefixes updated
- All localStorage keys renamed from `folio_*` to `verte_*` (library, PWA progress, display prefs, sync hint, install dismissed, relink dismissed)
- IndexedDB database renamed from `folio_pwa` to `verte_pwa`
- Service worker cache key reset from `folio-v3` to `verte-v1`
- Documentation files renamed (`folio-context.md` → `verte-context.md`, `folio-fragile.md` → `verte-fragile.md`, etc.)
- Test helper renamed from `folio.js` to `verte.js`; `gotoFolio` → `gotoVerte` across all spec files
- App version bumped to 2.0.0

### Added
- `migrateFromFolio()` — one-time migration function that copies all `folio_*` localStorage keys to `verte_*` and clones `folio_pwa` IndexedDB to `verte_pwa` on first load, preserving existing user data

### Fixed
- `console.log` in blob migration path changed to `console.warn` to comply with production code rules

---

## v1.19 — 2026-03-16

### Added
- EPUB metadata auto-extraction — title and author are automatically populated from the OPF `dc:title` and `dc:creator` fields when adding an EPUB (browser mode) or first opening one (PWA mode)
- File type hints on Add Book modal pills — each slot shows accepted formats (e.g. "mp3, m4a, m4b, ogg, wav, aac, flac, opus")
- Amber warning banner when transcript match quality is below 75% — replaces the green "Transcript synced" banner with "Low transcript match — audio sync may be unreliable"

### Changed
- Time display uses H:MM:SS format for audiobooks longer than 1 hour (was raw minutes, e.g. 125:30 → 2:05:30)
- App version bumped to 1.19.0

### Fixed
- Highlight starts moving before audio begins playing — playback state is now set exclusively by the `play` event handler, not the `_audio.play()` promise
- Stale `totalSents` from a previous session poisons progress percentage on re-added books — `loadEbook` now updates `totalSents` immediately after building the DOM
- Linking audio + transcript to an ebook-only book starts audio at 0:00 instead of the saved reading position — timing build completion now seeks audio to the saved `curSent` position when audio is at the start

---

## v1.18 — 2026-03-15

### Added
- Edit Book Details modal — pencil icon on library cards opens a modal to edit title, author name, and reassign files (audio, ebook, transcript, cover)
- Author field — optional per-book author name displayed on library cards and in the player top bar
- Library settings button — gear icon in library header toggles a placeholder settings panel
- Four skip buttons in media controls — big skip (1m / 5 sentences) and small skip (15s / 1 sentence) on each side of play
- Skip button icons swap dynamically between audio mode (circular arrow + "15") and TTS mode (chevrons)
- "Don't remind me" option on relink overlay — dismiss per-book or globally
- File pills in Add Book modal are now clickable to open the file picker for that slot
- Amber "needs relink" badge on audio slot in Edit Book Details when blob URL is lost

### Changed
- Top bar restructured: flat flex layout with `justify-content:space-between` — Back, TOC, Title/Author/Progress, Sleep, TTS, Settings
- Title, author, and progress text use `clamp()` for responsive sizing across screen widths
- "Browse Folder" renamed to "Select Folder" in Add Book modal
- Skip buttons in TTS mode now skip sentences (was silent no-op)
- Keyboard shortcuts: Arrow = 15s/1 sentence, Shift+Arrow = 1m/5 sentences
- App version bumped to 1.18.0

### Removed
- Book Info modal and top bar folder icon — file management moved to Edit Book Details on library screen
- Top bar divider element

---

## v1.17 — 2026-03-14

### Added
- SVG icon system for top bar — emoji icons replaced with inline SVGs via `.ic-svg` class with `.top-bar-divider` separator
- TTS toggle button in top bar (mic icon) for ebook-only books — defaults off; auto-enables sentence highlighting when toggled on
- Volume popover — tap speaker icon to open vertical slider above button, tap outside to close; visible in both audio and TTS modes
- Speed pill button — single tap-to-cycle button replaces three-button ±/rate speed strip
- Audio needs-relink indicator — amber dot on book files icon when audio blob URL is lost on refresh
- Relink overlay auto-shown on book open when stale audio is detected

### Changed
- Top bar height increased to 60px on mobile; icon buttons increased to 44px
- Play button enlarged to 56px on mobile with stronger accent glow
- Bottom bar layout changed to five-slot: vol · skip · play · skip · speed
- Bottom bar hidden for ebook-only books until TTS is toggled on
- Audiobook mode defaults highlighting to Sentence + Word
- TTS voice selector moved from bottom TTS bar to options panel Playback tab
- Volume, playback rate, and stop controls removed from options panel (accessible from bottom bar)
- Reading progress bar removed from below top bar
- App version bumped to 1.17.0

### Fixed
- Sleep timer badge shifting adjacent buttons — badge now absolutely positioned with `pointer-events:none`
- `closeRelink()` resetting `curBookIdx` prevented Book Info modal from opening after dismissing relink overlay
- `ttsPlay()` crash on null `ttsRateSlider` reference after TTS bar removal — now reads rate from `rateCustom`
- `cycleSpeed()` failing in TTS mode — reads current rate from `rateCustom` instead of `_audio.playbackRate`

---

## v1.16 — 2026-03-14

### Fixed
- Transcript sync crashes on restricted origins (file://, strict CSP) — worker creation now fails gracefully with automatic sync fallback
- Linking audio to a TTS-only book leaves speed strip hidden and progress bar in scrubbing mode — `saveLinkAudio()` now fully mirrors audio-mode setup
- Worker timeout fires error toast instead of continuing gracefully — now shows syncing banner with fallback status
- Worker `onerror` handler did not clear watchdog timeout, risking double fallback execution

### Changed
- Timing worker watchdog timeout increased from 8 seconds to 20 seconds for large books
- `_pendingTimingBookIdx` set before first `await` in both `buildSentenceTimings` and `buildTimingsFromPlainText` to prevent stale-result acceptance during rapid book switches

---

## v1.15 — 2026-03-14

### Added
- PWA "Hide" replaces "Delete" on library cards — hidden books persist across scans in a collapsible section with "Show" to restore
- Pre-pick warning sheet before Android folder picker warns about back-button behaviour
- 3-option highlight pill selector (Off / Sentence / Sentence + Word) replaces two separate toggles
- Transcript file pill restored to Add Book modal (Audio, Ebook, Transcript, Cover)
- Browser folder picker now uses same tiered JSON transcript auto-assignment as PWA (keyword → title-word → lone-file)

### Changed
- OpenDyslexic font CDN switched from cdnfonts.com to jsdelivr @fontsource/opendyslexic (400 + 700 weights)
- OpenDyslexic font-family corrected from `'Open Dyslexic'` to `'OpenDyslexic'` to match new CDN
- Post-pick folder confirmation sheet removed — OS picker confirmation is sufficient

### Fixed
- OpenDyslexic font fails to load — old CDN (cdnfonts.com) returns 403 Forbidden
- Add Book modal crashes on open — `resetModal()` referenced removed `#transcriptName` element
- Highlight snaps to wrong sentence when re-enabled on low transcript match % books — `_resyncAndHL()` now resyncs `curSent` via reverse linear scan before highlighting
- Saved display prefs with old font-family name `'Open Dyslexic'` auto-migrated on load

---

## v1.14 — 2026-03-14

### Fixed
- Transcript matching skips short sentences (3–5 words) — widened search window, capped run length for short sentences, and tiered acceptance threshold so short sentences are no longer systematically missed
- OpenDyslexic font doesn't render on Android — font name corrected to match CDN `@font-face` declaration (`'Open Dyslexic'` with space)
- OpenDyslexic font lost on app reload — `loadDisplayPrefs()` now injects the CDN stylesheet when Dyslexic is the saved font
- OpenDyslexic stays in fallback font on slow connections — `link.onload` callback forces repaint after stylesheet arrives

---

## v1.13 — 2026-03-14

### Added
- Sentence highlight toggle in Display settings — disables visual tracking while keeping auto-scroll and position advancement working
- High-contrast dark theme (black/white/yellow accent) and high-contrast light theme (white/black/blue accent)
- OpenDyslexic font option — loads from CDN on demand, no impact on initial page load
- "Keep current folder" cancel option when changing PWA library folder
- Tiered JSON transcript auto-assignment in PWA folder scan: keyword match → folder-name match → lone-file fallback
- Picker sheet for ambiguous multi-JSON transcript folders after PWA scan

### Changed
- Transcript banner auto-hide delay increased from 5 seconds to 12 seconds
- Transcript button removed from player top bar (still accessible via Book Info modal)
- `scrollToSent()` respects `prefers-reduced-motion: reduce` — uses instant scroll when enabled
- JSZip CDN error message rewritten to suggest checking internet connection

### Fixed
- EPUB loading fails silently when primary CDN is unreachable — now falls back to unpkg before showing error
- Reduced-motion JS support added to complement existing CSS media query

### Performance
- `arrayBufferToBase64()` rewritten with chunked `String.fromCharCode.apply` + single `btoa()` call — eliminates main-thread stall on large EPUBs

### Removed
- Dead `lastAdvanceTime` state variable (declared but never read or written)

---

## v1.12 — 2026-03-14

### Performance
- **Service worker switched from cache-first to stale-while-revalidate for app shell** — cached `index.html` was never refreshed (static `folio-v2` cache key), so code changes never reached installed PWAs; now serves from cache immediately and updates in the background for next launch

### Fixed
- **Double safe-area inset on PWA mobile** — `padding-top:env(safe-area-inset-top)` was applied to both `#player` and its child `.top-bar`, doubling the notch padding; removed from `#player`
- Service worker cache bumped from `folio-v2` → `folio-v3` to flush stale entries

---

## v1.11 — 2026-03-14

### Fixed
- **Toast notifications hidden behind Android gesture nav bar** — `#toastContainer` now uses `env(safe-area-inset-bottom)` to clear the system UI
- **PWA player top bar clipped under status bar** — added `is-pwa` body class with `env(safe-area-inset-top)` padding on `.top-bar` in mobile query (not `#player` — applying to both doubled the inset)
- **No visual feedback when adjusting sync offset** — `adjustOffset()` now shows a brief toast with the current offset value (e.g. "Sync offset: +1.5s")
- **Top bar icons shift position between books** — `.speed-badge` pinned with `flex-shrink:0` and `min-width`; desktop `.bk-info` changed to `flex:1` so title absorbs variable space
- **Book rename used `window.prompt()`** — replaced with an inline edit field on the library card; Enter saves, Escape cancels, blur saves if changed

### Changed
- **Transcript pill removed from add-book modal** — transcript management is now exclusively through the Book Info panel
- **WPM slider removed from options panel** — internal WPM logic retained for TTS scroll timing; UI control removed to reduce clutter

### Added
- **Folder selection confirmation sheet** — after picking a PWA library folder, a bottom sheet asks "Use this folder?" before committing; "Choose another" returns to the picker without saving
- Playwright regression tests for UI cleanup batch (tests/specs/11-ui-cleanup.spec.js)

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