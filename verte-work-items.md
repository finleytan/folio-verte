# Verte — Work Items

## Active
| # | Type | Effort | Prompt | Title |
|---|---|---|---|---|

## Backlog
| # | Type | Effort | Prompt | Title |
|---|---|---|---|---|
| 46 | fix | low | yes | Focus trap audit for modals |
| 47 | feat | low | yes | ARIA live region for sentence advancement |
| 48 | feat | low | yes | Keyboard-accessible seek in TTS mode |
| 49 | fix | low | yes | Minimum touch target audit |
| 73 | feat | med | yes | Faster audiobook relinking (remember filepath) |
| 56 | feat | med | yes | Export / backup reading progress |
| 57 | feat | med | yes | Sleep timer — no custom duration or way to extend |
| 68 | perf | low | yes | pwaScanBookFolder has no early exit once all slots filled |
| 69 | perf | low | yes | Ebook data string held in memory after DOM is built (PWA only) |
| 70 | perf | low | yes | content-visibility intrinsic size hint may cause layout shifts |
| 59 | feat | low | yes | Freeform notes textarea per book |
| 60 | feat | med | yes | Jump-to-time input for audio mode |
| 74 | feat | med | yes | Multi-select books in library for bulk delete |
| 9 | feat | high | no | Configurable gesture controls |
| 45 | feat | high | yes | Auto-generate TOC from transcript silence gaps |
| 76 | feat | high | no | Per-book display settings |
| 93 | feat | high | no | Background playback — navigate library while audio plays |
| 94 | perf | med | no | Sentence/word highlighting smoothness at >1.5x playback speed |

## Deferred
| # | Type | Effort | Title | Reason |
|---|---|---|---|---|
| 42 | feat | high | Search within book | ~300–400 lines, pushes file past comfort threshold |
| 44 | feat | high | Bookmarks and annotations | ~400–600 lines, pushes file past comfort threshold |
| 58 | feat | med | Reading statistics — time remaining and session tracking | Scope TBD |
| 87 | fix | low | Cancel or leave folder select while open | showDirectoryPicker() is a browser-native OS picker — no JS API to cancel once opened |
| 88 | feat | low | Android back button navigates back in app | History API back gesture in PWA fullscreen exits the app — no reliable cross-device fix |
| 89 | feat | med | Custom chapter marks — user-defined TOC entries | Deferred from old #80 |
| 90 | perf | high | Windowed / lazy sentence rendering for very long books | ~300–400 lines, architecturally complex |
| 91 | perf | med | Revoke audio blob URL on book close in browser mode | Needs investigation — revoking may lose reference permanently |
| 92 | fix | high | Confidence-aware sync correction | Do not build until explicitly requested |

## Done
| # | Type | Date | Title |
|---|---|---|---|
| 32 | feat | 2026-03-18 | Chapter skip buttons |
| 34 | feat | 2026-03-18 | Per-chapter counter in top bar (Ch 3/18) |
| 72 | feat | 2026-03-17 | Settings accessible from library screen — unified settings panel |
| 54 | fix | 2026-03-17 | parseMd leaves partial markdown symbols |
| 52 | fix | 2026-03-17 | Shift+Arrow skip silent no-op in TTS mode (already fixed in code) |
| 65 | fix | 2026-03-17 | verte_install_dismissed flag never expires |
| 53 | feat | 2026-03-17 | Now-playing indicator on library cards |
| 62 | perf | 2026-03-17 | Chapter index cache in _resolveChapterAtIdx (partial — cache only) |
| 33 | feat | 2026-03-17 | Resume position CTA on cold start — scrapped (not useful enough) |
| 2 | fix | 2026-03-14 | Auto-link audiobook on mobile — already implemented, closed |
| 4✓ | fix | 2026-03-14 | PWA JSON transcript auto-assignment (tiered matching + validation) |
| 8✓ | fix | 2026-03-14 | Progress % not visible in PWA book view |
| 9✓ | fix | 2026-03-14 | Ignore metadata files in PWA folder scan |
| 11 | fix | 2026-03-14 | Toast container obscured by Android gesture nav bar |
| 12 | fix | 2026-03-14 | Sizing and padding in PWA player screen |
| 13 | fix | 2026-03-14 | No visual feedback when sync offset adjusted |
| 14 | fix | 2026-03-14 | UI element drift — icons shift between books |
| 16 | fix | 2026-03-14 | Book rename uses window.prompt() — replaced with inline edit |
| 19 | fix | 2026-03-14 | No way to cancel folder selection on mobile |
| 39 | fix | 2026-03-14 | Remove transcript pill from add-book modal + remove WPM UI |
| ✓ | fix | 2026-03-14 | Added unpkg CDN fallback for JSZip |
| ✓ | perf | 2026-03-14 | Replaced arrayBufferToBase64 with chunked btoa |
| ✓ | feat | 2026-03-14 | Sentence highlighting toggle (Off / Sentence / Sentence+Word) |
| ✓ | feat | 2026-03-14 | High-contrast dark and light themes |
| ✓ | feat | 2026-03-14 | OpenDyslexic font with on-demand CDN loading |
| ✓ | fix | 2026-03-14 | Reduced-motion JS support in scrollToSent |
| ✓ | fix | 2026-03-14 | Removed dead lastAdvanceTime state variable |
| 6✓ | fix | — | Audio-text sync highlighting jumps at sentence boundaries |
| 7✓ | fix | — | Word highlighting drifts when changing playback speed |
| 10✓ | feat | — | Auto-hide transcript banner after sync is ready |
| 31 | fix | — | TOC sidebar does not scroll to active chapter on open |
| 40 | fix | — | Remove playback rate display from play button |
| 61 | feat | — | Service worker for offline app shell caching |
| ✓ | fix | — | PWA: transcript not followed during audio playback |
| ✓ | fix | — | Seeking audio progress bar does not navigate ebook position |
| ✓ | fix | — | syncOffset not saved in PWA mode — lost on every session |
| ✓ | fix | — | TOC double-click required to navigate |
| ✓ | fix | — | Seek bar does not jump ebook to correct position immediately |
| ✓ | fix | — | PWA: playback hangs on random sentences mid-book |
| ✓ | fix | — | No freeze/resume page lifecycle handling — TTS breaks on Android |
| ✓ | fix | — | PWA: pause and resume breaks playback state |
| ✓ | fix | — | PWA: audio stops when leaving and returning to app |
| ✓ | fix | — | TOC navigation bugs fixed in TTS mode |
| ✓ | fix | — | Linking audio via Book Files now switches out of TTS mode |
| ✓ | feat | — | Reading progress bar as TTS scrubber |
| ✓ | fix | — | Seek bar updates ebook position while paused |
| ✓ | fix | — | EPUB paragraph fragmentation fix |
| ✓ | fix | — | TTS auto-scroll stops working after navigation |
| ✓ | fix | — | TTS play/pause unresponsive after pausing |
| ✓ | fix | — | Two speed controls visible in TTS mode + TTS rate not synced |
| ✓ | fix | — | TTS sentence highlight off by one after click |
| ✓ | fix | — | TTS sentence skip on click |
| ✓ | fix | — | TTS play button unresponsive after returning to app |
| ✓ | fix | — | TTS → audiobook position lost on mode switch |
| ✓ | fix | — | TTS click navigation |
| ✓ | fix | — | Instant scroll to resume position on book open |
| ✓ | feat | — | Inline speed controls on seek strip |
| ✓ | feat | — | Progress percentage in top bar |
| ✓ | feat | — | Sync offset hint toast |
| 1 | fix | 2026-03-15 | Audiobook + ebook with no transcript — undefined UX |
| 3 | feat | 2026-03-15 | Empty library onboarding |
| 5 | fix | 2026-03-15 | Text alignment resets on book reopen |
| 6 | fix | 2026-03-15 | Sentence splitter breaks on abbreviations |
| 63 | fix | 2026-03-15 | configurePlayerForMode called before all handles resolved |
| 64 | fix | 2026-03-15 | rateBtnInline opens options panel using fragile querySelector |
| 80 | feat | 2026-03-15 | Move media controls to bottom, details and options to top |
| 71 | fix | 2026-03-15 | Can't assign file types individually (folder-only) |
| 75 | feat | 2026-03-15 | Manage files from library screen |
| 35 | feat | 2026-03-15 | Tap rate display to cycle speed presets |
| 82 | fix | 2026-03-15 | Increase button and icon size across player UI |
| 84 | fix | 2026-03-16 | Highlight starts moving before audio begins playing |
| 79 | fix | 2026-03-16 | Audiobook time display — show hours and minutes not raw minutes |
| 83 | fix | 2026-03-16 | Transcript match % warning when sync quality is likely poor |
| 51 | fix | 2026-03-16 | Stale totalSents poisons progress % on re-added books |
| 86 | fix | 2026-03-16 | Linking audio + transcript to TTS book does not resync ebook position |
| ✓ | feat | 2026-03-16 | EPUB metadata auto-extraction for title and author |
| ✓ | feat | 2026-03-16 | File type hints on Add Book modal pills |
| 43 | feat | 2026-03-16 | PWA: auto-hide navigation/controls |
| 10 | feat | 2026-03-16 | Bottom controls bar with auto-hide |
| 4 | fix | 2026-03-16 | loadEbook race — cancellation guard via _ebookLoadGen |
| 50 | fix | 2026-03-16 | Horizontal swipe conflicts with text selection |
| 66 | perf | 2026-03-16 | Cover + audio blob URLs leaked on PWA rescan |
| 67 | perf | 2026-03-16 | Timing worker blob URL never revoked |
| 8 | feat | 2026-03-16 | Manual library rescan button (PWA) |
| 7 | fix | 2026-03-16 | Ebook formatting polish |
| 85 | feat | 2026-03-16 | Unhiding a book — ask user whether to resume or start over |
| 77 | feat | 2026-03-16 | Library view modes (list / grid) |
| 78 | feat | 2026-03-16 | Search, sort, and filter in library |
| 81 | fix | 2026-03-16 | Sleep timer — inline badge is sufficient, no change needed |
