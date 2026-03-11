# Folio Reader — Changelog

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