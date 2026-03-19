# Verte — Prompts

### #81 — Sleep timer — show remaining time below icon instead of inline badge

*No prompt written yet.*

---

### #46 — Focus trap audit for modals

```
# Fix: Focus trap audit for modals in index.html

## Context
Read _openModalEl(id) and _closeModalRestore() in full. Read the keydown
listener that handles Escape/Tab inside open modals.

## Audit checklist
1. Does _openModalEl set initial focus to the first focusable element?
2. Does the Tab trap handle the case where there are zero focusable elements?
3. Does Shift+Tab wrap correctly from first to last element?
4. Is aria-modal="true" set on the modal element?
5. Is role="dialog" set on the modal element?
6. Is the background content marked aria-hidden="true" while modal is open?
7. Does the Escape handler work when focus is on a textarea or select?

## Fixes

### 1. Set aria attributes on modal open
In _openModalEl(id):
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  document.getElementById('player')?.setAttribute('aria-hidden', 'true');
  document.getElementById('library')?.setAttribute('aria-hidden', 'true');

In _closeModalRestore():
  document.getElementById('player')?.removeAttribute('aria-hidden');
  document.getElementById('library')?.removeAttribute('aria-hidden');

### 2. Auto-focus first focusable element
In _openModalEl(id):
  const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if(focusable.length) focusable[0].focus();

### 3. Guard empty modal Tab trap
  if(!focusable.length) { e.preventDefault(); return; }

## Constraints
- Do not change modal visual appearance or Escape close behaviour.
- All 5 modals must be covered (#modal, #txModal, #linkAudioModal, #bookInfoModal, #relinkOverlay).

## Verification
- Open each modal with keyboard: first element is focused.
- Tab cycles within modal, does not escape to background.
- Escape closes from any focused element.
- Run syntax check.
```

---

### #47 — ARIA live region for sentence advancement

```
# Feature: ARIA live region for sentence advancement in index.html

## Context
Read updateHL() — it runs every time curSent changes. The sentence text
is in sentences[curSent].text. Screen readers cannot follow the visual
highlight unless announced via ARIA.

## Implementation

### HTML
Add a visually hidden live region inside #player:
  <div id="ariaLive" class="sr-only" aria-live="polite" aria-atomic="true"></div>

### CSS
  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

### JS
In updateHL(), after updating the sentence highlight:
  const liveEl = document.getElementById('ariaLive');
  if(liveEl && sentences[curSent] && !ttsMode){
    const now = Date.now();
    if(!_lastAriaAnnounce || now - _lastAriaAnnounce > 500){
      liveEl.textContent = sentences[curSent].text;
      _lastAriaAnnounce = now;
    }
  }

Add module-level: let _lastAriaAnnounce = 0;

## Constraints
- aria-live="polite" — does not interrupt current speech.
- Throttle to 500ms minimum between announcements.
- Do not announce during TTS mode (guard: if(ttsMode) return;).

## Verification
- Enable TalkBack, play audiobook: sentences announced as they advance.
- TTS mode: no double-speaking (announcements suppressed).
- Rapid sentence changes: not every sentence announced (throttled).
- Run syntax check.
```

---

### #48 — Keyboard-accessible seek in TTS mode

```
# Feature: Keyboard-accessible seek in TTS mode in index.html

## Context
Read scrubToPosition() and the keyboard shortcut keydown listener in full.
In TTS mode, left/right arrows call nudge(±1) but there is no way to jump
to a specific position via keyboard.

## Implementation

### 1. Add Home/End key handlers
In the keydown listener:
  case 'Home':
    e.preventDefault();
    curSent = 0; curWord = 0;
    updateHL(); updateProg(); scrollToSent(curSent, true);
    if(ttsMode && mediaState === 'playing'){ ttsStop(); ttsPlay(); }
    break;
  case 'End':
    e.preventDefault();
    curSent = Math.max(0, sentences.length - 1); curWord = 0;
    updateHL(); updateProg(); scrollToSent(curSent, true);
    if(ttsMode && mediaState === 'playing'){ ttsStop(); ttsPlay(); }
    break;

### 2. Add Page Up/Down for chapter skip
  case 'PageUp':
    e.preventDefault();
    typeof skipChapter === 'function' ? skipChapter(-1) : nudge(-10);
    break;
  case 'PageDown':
    e.preventDefault();
    typeof skipChapter === 'function' ? skipChapter(1) : nudge(10);
    break;

## Constraints
- Home/End work in both audio and TTS modes.
- Do not conflict with browser default Home/End scroll — guard: curBookIdx >= 0.
- Do not change existing Space/arrow/[/] handlers.

## Verification
- TTS mode: Home → jumps to start, End → jumps to end.
- Page Down: skips to next chapter or 10 sentences.
- Run syntax check.
```

---

### #49 — Minimum touch target audit

```
# Fix: Minimum touch target audit in index.html

## Context
Read the CSS for .ic-btn, the offset +/− buttons, .spd-btn, .rate-btn-inline,
and other interactive elements in the seek strip and options panel.
WCAG 2.5.8 recommends 44×44px minimum touch targets.

## Audit
Search the CSS for all interactive element sizes below 44×44px. Common culprits:
- Sync offset +/− buttons in #offsetRow
- Speed −/+ buttons (.spd-btn) on seek strip
- TTS bar controls
- Options panel toggles (.toggle)

## Fix
For each sub-44px target, increase the clickable area without changing visual size:
  .spd-btn {
    min-width: 44px; min-height: 44px;
    display: flex; align-items: center; justify-content: center;
  }

For elements where visual enlargement is unwanted, use a pseudo-element hit area:
  .offset-btn::before {
    content: ''; position: absolute;
    top: -8px; bottom: -8px; left: -8px; right: -8px;
  }

## Constraints
- Do not change visual appearance of buttons.
- CSS-only changes where possible.
- The seek bar (range input) is exempt.

## Verification
- All interactive elements in seek strip are at least 44×44px touch target.
- Offset +/− buttons are easier to tap during playback.
- Run syntax check.
```

---

---

### #9 — Configurable gesture controls

*No prompt written yet.*

---

### #10 — Bottom controls bar with auto-hide

*No prompt written yet.*

---

### #45 — Auto-generate TOC from transcript silence gaps

```
# Feature: TOC from transcript in index.html

## Context
Read buildToc(), tocEntries[], and loadTranscriptData() in full.
If the ebook has no headings, tocEntries stays empty and the TOC button is dead.

## Implementation

### 1. Detect missing TOC after ebook load
In loadEbook()'s onDone, after buildToc(), check if tocEntries is empty:
  if(!tocEntries.length && sentenceTimings.length){
    _buildTocFromTimings();
    buildToc();
  }

### 2. Build TOC from timing gaps
  function _buildTocFromTimings(){
    if(!sentenceTimings.length || !sentences.length) return;
    tocEntries = [];
    tocEntries.push({ text: 'Chapter 1', level: 1, sentIdx: 0 });
    let chapterNum = 2;
    for(let i = 1; i < sentenceTimings.length; i++){
      const prev = sentenceTimings[i - 1];
      const cur = sentenceTimings[i];
      if(!prev || !cur) continue;
      const gap = cur.start - prev.end;
      if(gap > 3.0){
        tocEntries.push({ text: 'Chapter ' + chapterNum, level: 1, sentIdx: i });
        chapterNum++;
      }
    }
    // Fallback: if fewer than 3 chapters detected, use even spacing
    if(tocEntries.length < 3){
      tocEntries = [];
      const interval = Math.max(1, Math.floor(sentences.length / 10));
      for(let i = 0; i < sentences.length; i += interval){
        tocEntries.push({ text: 'Section ' + (tocEntries.length + 1), level: 1, sentIdx: i });
      }
    }
  }

## Constraints
- Only generate TOC if tocEntries is empty after ebook parsing.
- If the ebook has real headings, never auto-generate.
- Generated entries use generic names — do not extract from sentence text.
- Store in memory only — not persisted.

## Verification
- Book with headings: TOC shows ebook headings (unchanged).
- Audiobook with no headings but Whisper transcript: auto-generated chapters appear.
- Book with no headings and no transcript: TOC stays empty.
- Run syntax check.
```

---

### #76 — Per-book display settings

*No prompt written yet.*

---

### #42 — Search within book

*No prompt written yet.*

---

### #44 — Bookmarks and annotations

*No prompt written yet.*

---

### #87 — Cancel or leave folder select while open

*No prompt written yet.*

---

### #88 — Android back button navigates back in app

*No prompt written yet.*

---

---

### #56 — Export / backup reading progress

```
# Feature: Export / backup reading progress in index.html

## Context
Read saveLibrary(), getPwaProgress(), saveBookProgress(). Progress is stored
in localStorage (verte_library_v2 for browser mode, verte_pwa_progress_v1
for PWA mode). There is no way to export this data.

## Implementation

### Export
Add a "Export Progress" button to the library screen header or to the
Advanced tab of the options panel:
  <button onclick="exportProgress()">Export progress</button>

  function exportProgress() {
    const data = {
      version: 1,
      exported: new Date().toISOString(),
      mode: IS_PWA ? 'pwa' : 'browser',
      progress: IS_PWA
        ? getPwaProgress()
        : library.map(b => ({
            id: b.id, title: b.title,
            curSent: b.curSent, curWord: b.curWord,
            audioTime: b.audioTime, totalSents: b.totalSents,
            syncOffset: b.syncOffset || 0
          }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'verte-progress-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported', 'success');
  }

### Import (basic)
Add a companion import that reads the JSON and merges progress:
  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if(data.version !== 1) { showToast('Unrecognised backup format', 'error'); return; }
        if(IS_PWA) {
          const all = getPwaProgress();
          Object.assign(all, data.progress);
          localStorage.setItem(PWA_PROG_KEY, JSON.stringify(all));
        } else {
          // Merge into library by id
          data.progress.forEach(p => {
            const b = library.find(b => b.id === p.id);
            if(b) Object.assign(b, {curSent:p.curSent, curWord:p.curWord,
              audioTime:p.audioTime, syncOffset:p.syncOffset});
          });
          saveLibrary();
        }
        showToast('Progress restored', 'success');
        renderLib();
      } catch(e) { showToast('Import failed: ' + e.message, 'error'); }
    };
    reader.readAsText(file);
  }

Add a hidden file input and a trigger button near the export button.

## Constraints
- Do NOT export ebook data, audio data, or cover images — progress only.
- The export file must be human-readable JSON.
- Import is a merge (not replace) — existing books not in the backup are unaffected.
- Do not add any UI for server sync — local file only.

## Verification
- Click export: JSON file downloaded with current positions.
- Import the file: positions restored.
- Run syntax check.
```

---

### #57 — Sleep timer — no custom duration or way to extend

```
# Feature: Sleep timer custom duration and extend in index.html

## Context
Read cycleSleepTimer(), clearSleepTimer(), _updateSleepBadge() in full.
SLEEP_OPTIONS array holds fixed presets. The timer badge shows remaining time.
There is no way to set a custom duration or extend the running timer.

## Fix — two improvements:

### 1. Extend button when timer is running
When the sleep badge is visible (timer running), allow tapping it to add 15 minutes:
  cycleSleepTimer() currently cycles through presets. Change its behaviour:
  - If NO timer is running: cycle to next preset and start it (existing behaviour).
  - If a timer IS RUNNING: add 15 minutes to the remaining time and show toast
    "Sleep timer extended +15 min".

  function cycleSleepTimer() {
    if(_sleepTimerId) {
      // Extend by 15 minutes
      const remaining = Math.max(0, _sleepEndTime - Date.now());
      const extended = remaining + 15 * 60 * 1000;
      clearSleepTimer();
      _startSleepTimer(extended);
      showToast('Sleep timer +15 min', '', 2000);
      return;
    }
    // ... existing cycle logic ...
  }

Extract the timer-start logic into a helper:
  function _startSleepTimer(ms) {
    _sleepEndTime = Date.now() + ms;
    _sleepTimerId = setTimeout(() => { mediaPause(); clearSleepTimer(); }, ms);
    _sleepTickId = setInterval(_updateSleepBadge, 1000);
    _updateSleepBadge();
  }

### 2. Add a "30 min" and "90 min" preset to SLEEP_OPTIONS
  const SLEEP_OPTIONS = [0, 15, 30, 45, 60, 90]; // minutes; 0 = off

This adds a 90-minute option for long listening sessions.

## Constraints
- _sleepTimerId, _sleepEndTime, _sleepTickId variable names must stay the same.
- clearSleepTimer() must still work (reset all three).
- The sleep badge UI must update correctly for extended timers.
- mediaPause() is called on timer expiry — this must remain.

## Verification
- Tap sleep badge with no timer: cycles through presets.
- Start a 15-min timer. Tap badge: +15 min, now shows 30 min.
- Timer reaches zero: playback pauses.
- Run syntax check.
```

---

### #58 — Reading statistics — time remaining and session tracking

```
# Feature: Reading statistics in index.html

## Context
Read updateProg(), sentences[], sentenceTimings[], curSent, and the book
object structure. All data needed for estimates is already in memory.

## Implementation

### 1. Time remaining estimate
Calculate based on available data:

  function getTimeRemaining(){
    const remaining = sentences.length - curSent;
    if(!ttsMode && sentenceTimings.length){
      // Audio mode: use actual audio duration
      const lastTiming = sentenceTimings.findLast(t => t);
      if(lastTiming && _audio.duration){
        const elapsed = _audio.currentTime;
        const rate = _audio.playbackRate || 1;
        return Math.max(0, (_audio.duration - elapsed) / rate);
      }
    }
    // TTS/fallback: estimate from WPM
    let totalWords = 0;
    for(let i = curSent; i < sentences.length; i++){
      totalWords += (sentences[i].words?.length || 0);
    }
    return (totalWords / (wpm || 150)) * 60; // seconds
  }

### 2. Display in options panel or top bar
Add to the About section of the Advanced tab or as a hoverable tooltip:
  <div class="op-row">
    <span class="op-ttl">Time remaining</span>
    <span id="statTimeRemaining">—</span>
  </div>
  <div class="op-row">
    <span class="op-ttl">Session time</span>
    <span id="statSessionTime">—</span>
  </div>

### 3. Session timer
  let _sessionStart = 0;
  // Set _sessionStart = Date.now() when playback starts (in mediaPlay/ttsPlay)
  // Clear on mediaStop/ttsStop

  function getSessionTime(){
    if(!_sessionStart) return 0;
    return (Date.now() - _sessionStart) / 1000;
  }

### 4. Update stats periodically
In the timeupdate handler (throttled to ~4fps), update the display:
  if(document.getElementById('statTimeRemaining')){
    const rem = getTimeRemaining();
    document.getElementById('statTimeRemaining').textContent = fmt(rem);
    document.getElementById('statSessionTime').textContent = fmt(getSessionTime());
  }

### 5. Lifetime accumulator (optional)
Add b.totalReadingTime (seconds) to book object:
  // In saveBookProgress, add elapsed session time
  if(_sessionStart) b.totalReadingTime = (b.totalReadingTime || 0) + getSessionTime();

## Constraints
- Do not add heavy computation to the rAF loop — stats update at timeupdate rate (~4Hz).
- fmt() already exists for time formatting.
- Session timer resets on each play, not on book open.
- Stats display is informational only — no new persistent state required
  except the optional totalReadingTime.

## Verification
- Open options during playback: time remaining and session time shown.
- Time remaining decreases as playback progresses.
- Session time increases.
- Run syntax check.
```

---

### #59 — Freeform notes textarea per book

```
# Feature: Freeform notes per book in index.html

## Context
Read the book object structure and openBookInfoModal() in full.
The book info modal shows file details — it's the natural place to
add a notes section.

## Data model
Add to book object:
  b.notes = '';  // freeform text, persisted

## Implementation

### HTML — add to book info modal
After the existing file info sections in #bookInfoModal, add:
  <div class="binfo-sec">
    <div class="binfo-label">Notes</div>
    <textarea id="biNotes" class="bi-notes" rows="4"
      placeholder="Add notes about this book…"
      oninput="saveBookNotes(this.value)"></textarea>
  </div>

### CSS
  .bi-notes {
    width: 100%; background: var(--surface); color: var(--text);
    border: 1px solid var(--border); border-radius: 6px;
    padding: 10px; font: inherit; font-size: 13px; line-height: 1.5;
    resize: vertical; min-height: 80px;
  }

### JS
  function saveBookNotes(val){
    if(curBookIdx < 0) return;
    library[curBookIdx].notes = val;
    saveBookProgressDebounced();
  }

In openBookInfoModal(), populate the textarea:
  document.getElementById('biNotes').value = library[curBookIdx].notes || '';

## Constraints
- Notes persisted via saveBookProgress (both browser and PWA modes).
- No character limit enforced in code (textarea handles overflow).
- Do not add rich text editing — plain text only.
- oninput with debounced save is sufficient.

## Verification
- Open book info: notes textarea visible with placeholder.
- Type notes, close modal, reopen: notes preserved.
- Different books have independent notes.
- Run syntax check.
```

---

### #60 — Jump-to-time input for audio mode

```
# Feature: Jump-to-time input for audio mode in index.html

## Context
Read onSeekChange() and the #seekStrip HTML. The seek bar is a range input
that maps percentage to audio duration. For a 10-hour audiobook, each pixel
of the seek bar represents ~2 minutes — fine scrubbing is impossible.

## Implementation

### UI — tappable time display
Make the current time label (#tCur) tappable to open an inline time input:

  function openTimeJump(){
    if(ttsMode || !_audio.duration) return;
    const cur = document.getElementById('tCur');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'time-jump-input';
    input.value = fmt(_audio.currentTime);
    input.placeholder = 'h:mm:ss';
    cur.style.display = 'none';
    cur.parentElement.insertBefore(input, cur);
    input.focus();
    input.select();

    function commit(){
      const secs = parseTimeInput(input.value);
      if(secs !== null && secs >= 0 && secs <= _audio.duration){
        _audio.currentTime = secs;
        // Trigger sentence update
        if(sentenceTimings.length){
          const t = secs + syncOffset;
          let best = curSent;
          for(let i = sentenceTimings.length - 1; i >= 0; i--){
            if(sentenceTimings[i] && t >= sentenceTimings[i].start){ best = i; break; }
          }
          if(best !== curSent){
            curSent = best; curWord = 0;
            updateHL(); updateProg();
            scrollToSent(curSent, true);
          }
        }
      }
      input.remove();
      cur.style.display = '';
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter') { e.preventDefault(); commit(); }
      if(e.key === 'Escape') { input.remove(); cur.style.display = ''; }
    });
  }

  function parseTimeInput(str){
    const parts = str.trim().split(':').map(Number);
    if(parts.some(isNaN)) return null;
    if(parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    if(parts.length === 2) return parts[0]*60 + parts[1];
    if(parts.length === 1) return parts[0];
    return null;
  }

### Wire the tap
In the seek strip HTML, add onclick to #tCur:
  <span id="tCur" class="seek-time" onclick="openTimeJump()">0:00</span>

Or wire in init() to avoid changing HTML.

### CSS
  .time-jump-input {
    width: 64px; background: var(--surface); color: var(--text);
    border: 1px solid var(--accent); border-radius: 4px;
    padding: 2px 6px; font: inherit; font-size: 12px;
    text-align: center; outline: none;
  }

## Constraints
- Only available in audio mode (not TTS).
- Accept h:mm:ss, mm:ss, or plain seconds.
- Clamp to [0, duration].
- Do not change fmt() or the normal time display.
- The sentence update uses reverse linear scan (not binary search)
  for sparse sentenceTimings safety.

## Verification
- Tap time display: input appears with current time.
- Type '1:30:00', press Enter: audio jumps to 1h30m, ebook scrolls to match.
- Type invalid value: input closes, no change.
- Press Escape: input closes, no change.
- TTS mode: tap does nothing.
- Run syntax check.
```

---

---

---

### #68 — pwaScanBookFolder has no early exit once all slots filled

```
# Perf: pwaScanBookFolder has no early exit in index.html

## Context
Read pwaScanBookFolder(folderName, entry) in full. It iterates all files
in a directory entry. After the loop, it checks if audioFile && ebookFile
are filled. But the loop continues even after all four slots are filled.

## Fix
Add an early-exit check at the bottom of the for-await loop body. After
each file is assigned to a slot, check if all slots are filled:

  // After the if/else chain that assigns to audioFile, ebookFile, etc.:
  if(audioFile && ebookFile && transcriptFile && coverFile) break;

This exits the loop as soon as all four slots are populated, skipping
any remaining files in the folder.

## Where to place it
At the very end of the for-await loop body, after all the if/else
assignment conditions. The break exits the for-await loop.

## Constraints
- The break must come after ALL assignment conditions in the loop body,
  not inside any of them.
- The logic that chooses preferred JSON/image files (prefer "transcript"
  in name, prefer "cover" in name) happens in a second pass AFTER the loop
  — this is NOT changed. The break only applies to the main loop.
- Verify: if audioFile is filled on file 1 but ebookFile is not yet filled
  on file 2, the loop must continue until ebookFile is also found or exhausted.

## Verification
- A folder with 50 files where the book files are first: scan time reduced.
- A folder where book files are last: scan result unchanged (all files checked).
- Run syntax check.
```

---

### #69 — Ebook data string held in memory after DOM is built (PWA only)

```
# Perf: Ebook data string held in memory after DOM is built (PWA only) in index.html

## Context
Read pwaOpenBook(i) — it sets b.ebookData from the file handle.
Read loadEbook(book, onDone) — it reads book.ebookData to build the DOM.
After loadEbook() completes (onDone fires), ebookData is no longer needed
because the DOM is already built and sentences[] is populated.
In PWA mode, ebookData can be several MB for large books.

## Fix
At the end of the onDone callback in pwaOpenBook() — after curSent, updateHL,
updateProg, seekAudioToSentence, pulseResumeSent — add:
  b.ebookData = null; // free memory — DOM is already built

Similarly, null it in the browser-mode openBook() onDone callback as well,
since in browser mode the data is in IndexedDB and can be reloaded from there
if needed (though reloading the page is the only scenario where it would be
needed again):
  b.ebookData = null; // DOM built, data no longer needed in memory

## Constraints
- Only null it INSIDE the onDone callback (after DOM is fully built).
- Do not null it before onDone — loadEbook() reads ebookData throughout
  the async build process.
- biReassign() (ebook reassign) reloads the ebook from the new file and
  calls loadEbook() again — this is fine because it reassigns b.ebookData
  from the new FileReader result before calling loadEbook().
- In PWA mode, the handle (b.ebookHandle) is still valid for future reloads.

## Verification
- Open a large EPUB. After onDone fires, b.ebookData is null in console.
- Go back to library and reopen: pwaOpenBook re-reads from handle, works normally.
- Run syntax check.
```

---

### #70 — content-visibility intrinsic size hint may cause layout shifts

```
# Perf: content-visibility intrinsic size hint layout shifts in index.html

## Context
Read the CSS for .ebook-para. It uses:
  content-visibility: auto;
  contain-intrinsic-size: auto 80px;
The 80px estimate is wrong for most paragraphs and causes layout jumps
as the browser corrects its size estimate when paragraphs scroll into view.

## Fix
Change the contain-intrinsic-size to use the 'auto' keyword which caches
the last measured size instead of using a fixed estimate:

  .ebook-para {
    content-visibility: auto;
    contain-intrinsic-size: auto 120px;  /* 120px is a better starting estimate */
  }

The 'auto' prefix before the size value (already present) means the browser
remembers the actual rendered size after first paint — subsequent scrolling
back to a paragraph uses the cached size instead of the estimate. The 80px
hint is only used on first render before measurement; 120px is closer to
an average paragraph height at default font size.

Additionally, check if contain-intrinsic-block-size would be more
appropriate (only constrains block/vertical axis) — use it if supported:
  contain-intrinsic-block-size: auto 120px;

## Constraints
- CSS-only change. Do not remove content-visibility: auto — it is a
  significant performance win for long books.
- Do not change any other .ebook-para properties (margins, font, etc).
- If contain-intrinsic-block-size is used, keep the auto prefix.

## Verification
- Open a long book. Scroll quickly through it. No visible layout jumps.
- Run syntax check (JS unchanged).
```

---

### #73 — Faster audiobook relinking (remember filepath)

```
# Feature: Faster audiobook relinking (remember filepath) in index.html

## Context
Read showRelink() and rlLoad() in full. When a browser-mode blob URL expires
(page reload), the user must re-select the audio file from scratch. The filename
(b.audioName) is already saved. In PWA mode, file handles are persistent and
this issue doesn't apply.

## Fix for browser mode
Store the audio file itself in a module-level variable when first loaded,
so relinking only requires confirmation rather than re-picking the file.

Since browser storage can't hold File objects across sessions, the best
approach is: remember the last-used File objects in a module-level Map
during the current session:
  const _sessionFiles = new Map(); // bookId → { audio: File | null }

In addBook() (after reading the audio File from upData.audio), store it:
  _sessionFiles.set(book.id, { audio: upData.audio });

In rlLoad(), after successfully linking the audio:
  _sessionFiles.set(b.id, { audio: f });

In showRelink(), check if a session File is cached for this book:
  const cached = _sessionFiles.get(library[i]?.id);
  if(cached?.audio) {
    // Show a "Reuse [filename]" button in addition to the file picker
    // so the user can re-link with one tap
  }

Add a "Reuse [filename]" button to the relink overlay HTML (conditionally
shown from showRelink() when a cached file exists):
  <button id="relinkReuseBtn" style="display:none"
    onclick="rlReuseSession()">Reuse [filename]</button>

  function rlReuseSession() {
    const cached = _sessionFiles.get(library[curBookIdx]?.id);
    if(cached?.audio) rlLoad(cached.audio);
  }

## Constraints
- Session cache is memory-only — not persisted to localStorage/IDB.
- Works within a single page session only.
- In PWA mode, showRelink() is never called (handles are persistent) — no change needed.
- Do not change the file picker path — it must still work when no cached file exists.

## Verification
- Add a book with audio. Reload page (blob URL expires). Tap book → relink overlay.
  If session is still alive: "Reuse" button shown, one tap re-links.
- Fresh session: no "Reuse" button, file picker works normally.
- Run syntax check.
```

---

### #74 — Multi-select books in library for bulk delete

```
# Feature: Multi-select books for bulk delete in index.html

## Context
Read renderLib() and deleteBook() in full. Each book card has an individual
delete action with inline confirmation. There is no batch selection mode.

## Implementation

### State
  let _libSelectMode = false;
  const _libSelected = new Set(); // indices of selected books

### Toggle selection mode
Add to the library header:
  <button id="libSelectBtn" class="ic-btn" title="Select books"
    onclick="toggleLibSelectMode()">☑</button>

  function toggleLibSelectMode() {
    _libSelectMode = !_libSelectMode;
    _libSelected.clear();
    document.getElementById('libSelectBtn').classList.toggle('active', _libSelectMode);
    document.getElementById('libBulkDeleteBtn').style.display = _libSelectMode ? '' : 'none';
    renderLib();
  }

### Select cards
In renderLib(), if _libSelectMode: add a checkbox overlay to each card:
  if(_libSelectMode) {
    const cb = document.createElement('div');
    cb.className = 'lib-checkbox' + (_libSelected.has(i) ? ' checked' : '');
    cb.onclick = (e) => { e.stopPropagation(); toggleLibSelect(i); };
    card.appendChild(cb);
    if(_libSelected.has(i)) card.classList.add('lib-selected');
  }

Also, in selection mode, card click selects rather than opens:
  card.addEventListener('click', (e) => {
    if(e.target.closest('.book-card-actions')) return;
    if(_libSelectMode) { toggleLibSelect(i); return; }
    openBook(i);
  });

  function toggleLibSelect(i) {
    if(_libSelected.has(i)) _libSelected.delete(i); else _libSelected.add(i);
    renderLib();
  }

### Bulk delete button
Add a "Delete selected" button near the lib header (hidden by default):
  <button id="libBulkDeleteBtn" class="btn btn-danger" style="display:none"
    onclick="bulkDeleteSelected()">Delete selected</button>

  function bulkDeleteSelected() {
    if(_libSelected.size === 0) return;
    const indices = [..._libSelected].sort((a,b)=>b-a); // descending
    indices.forEach(i => {
      const b = library[i];
      if(b.audioUrl) URL.revokeObjectURL(b.audioUrl);
      _deleteBlobsFor(b.id);
      library.splice(i, 1);
    });
    if(!IS_PWA) saveLibrary();
    else {
      const all = getPwaProgress();
      indices.forEach(i => delete all[library[i]?.id]);
      localStorage.setItem(PWA_PROG_KEY, JSON.stringify(all));
    }
    toggleLibSelectMode(); // exits select mode and re-renders
    showToast(indices.length + ' book(s) deleted');
  }

### CSS
  .lib-checkbox { position:absolute; top:8px; left:8px; width:20px; height:20px;
    border:2px solid var(--border); border-radius:4px; background:var(--surface2);
    cursor:pointer; z-index:2; }
  .lib-checkbox.checked { background:var(--accent); border-color:var(--accent); }
  .lib-checkbox.checked::after { content:'✓'; color:#fff; font-size:13px;
    display:flex; align-items:center; justify-content:center; height:100%; }
  .lib-selected { border-color:var(--accent) !important; }

## Constraints
- Normal (non-select) mode: no UI change on cards.
- bulkDeleteSelected() must delete in descending index order to avoid
  index shifting during splice.
- Do not remove the individual deleteBook() inline confirm.

## Verification
- Tap select button: checkboxes appear on cards.
- Select 3 cards, tap Delete: confirmation? (add if desired) → all 3 removed.
- Exit select mode: cards return to normal.
- Run syntax check.
```

---

### #89 — Custom chapter marks — user-defined TOC entries

```
# Feature: Custom chapter marks in index.html

## Context
Read buildToc() and tocEntries[]. Read the book object structure.
tocEntries is currently populated only from ebook headings (and optionally
from transcript gaps per prompt #65). Users cannot manually add TOC entries.

## Data model
Add to book object:
  b.customToc = [];  // Array of { text: string, sentIdx: number }

## Implementation

### 1. Add custom mark
  function addChapterMark(sentIdx, text){
    if(curBookIdx < 0) return;
    const b = library[curBookIdx];
    if(!b.customToc) b.customToc = [];
    const label = text || 'Mark at ' + Math.round(sentIdx / (sentences.length - 1) * 100) + '%';
    b.customToc.push({ text: label, sentIdx });
    b.customToc.sort((a, c) => a.sentIdx - c.sentIdx);
    saveBookProgressDebounced();
    buildToc(); // rebuild to include new mark
    showToast('Chapter mark added', '', 1500);
  }

  function removeChapterMark(sentIdx){
    if(curBookIdx < 0) return;
    const b = library[curBookIdx];
    if(!b.customToc) return;
    b.customToc = b.customToc.filter(m => m.sentIdx !== sentIdx);
    saveBookProgressDebounced();
    buildToc();
  }

### 2. Merge into buildToc()
In buildToc(), after populating from tocEntries, merge custom marks:
  const b = library[curBookIdx];
  if(b.customToc && b.customToc.length){
    b.customToc.forEach(m => {
      tocEntries.push({ text: m.text, level: 1, sentIdx: m.sentIdx, custom: true });
    });
    tocEntries.sort((a, c) => a.sentIdx - c.sentIdx);
  }

Style custom entries:
  if(entry.custom) btn.classList.add('toc-custom');
  .toc-custom { border-left: 2px solid var(--accent); }

### 3. UI — add mark from current position
Option A: button in options panel Advanced tab.
Option B: long-press on reading progress bar.
Option C: context action in gesture config (#60).

Simplest: add a button in the TOC sidebar footer:
  <button class="toc-add-mark" onclick="addChapterMark(curSent)">+ Add mark here</button>

## Constraints
- customToc is persisted via saveBookProgress (both modes).
- Custom marks survive book close/reopen.
- Custom marks are cleared if ebook is replaced (sentIdx invalidated).
- Do not mix custom marks into the auto-generated TOC from #65 — they
  are separate sources merged at buildToc() time.

## Verification
- Add a mark at current position: appears in TOC sidebar.
- Tap mark: scrolls to position.
- Reopen book: marks preserved.
- Run syntax check.
```

---

### #90 — Windowed / lazy sentence rendering for very long books

```
# Perf: Windowed / lazy sentence rendering in index.html

## Context
Read loadEbook() in full — it builds ALL sentence spans into the DOM in
chunks. sentences[] holds live DOM refs. updateHL(), scrollToSent(),
_wordTick() all reference sentences[i].el directly.

For a 10,000-sentence book, the DOM contains ~30,000+ elements (sentence
spans + word spans). This causes:
- Slow initial render (2-5s on mobile)
- High memory usage
- Sluggish scrolling due to layout recalculation

## Approach: content-visibility windowing
Rather than a full virtual scroll (which would break live DOM refs),
use content-visibility: auto on paragraph-level containers. This is
already partially implemented (.ebook-para has content-visibility: auto).

### Enhancement: lazy sentence span creation
Instead of creating all word spans upfront, defer word span creation
until a paragraph scrolls into view:

1. In loadEbook(), create sentence spans with only textContent (no word spans).
2. Use IntersectionObserver on .ebook-para elements.
3. When a paragraph enters the viewport, split its sentences into word spans.
4. Update sentences[i].words with the new DOM refs.
5. When a paragraph leaves the viewport (optional), collapse word spans
   back to textContent to reduce DOM nodes.

### Word span creation on demand
  const _paraObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const para = entry.target;
        // Find sentence indices in this paragraph
        const sentEls = para.querySelectorAll('.sent:not(.words-built)');
        sentEls.forEach(el => {
          const si = parseInt(el.dataset.si);
          if(isNaN(si) || !sentences[si]) return;
          // Build word spans
          const text = sentences[si].text;
          const words = text.split(/\s+/);
          el.innerHTML = words.map((w, wi) =>
            '<span class="word" data-wi="' + wi + '">' + w + '</span>'
          ).join(' ');
          sentences[si].words = Array.from(el.querySelectorAll('.word')).map((we, wi) => ({
            el: we, text: words[wi]
          }));
          el.classList.add('words-built');
        });
      }
    });
  }, { rootMargin: '200px' }); // pre-build 200px ahead of viewport

### Risks
- _wordTick() accesses sentences[curSent].words — if words aren't built
  yet, it will fail. Guard: if(!wt || !sentences[curSent].words) return;
  (already partially guarded).
- scrollToSent() accesses sentences[i].el — sentence elements always
  exist, only word spans are lazy. No change needed.
- updateHL() accesses sentences[curSent].words[curWord] — guard with
  optional chaining.
- buildSentenceTimings() accesses sentences[i].text — text is always
  available (stored separately from DOM). No change needed.

## Constraints
- sentences[i].el MUST always be a live DOM ref (never virtualized).
- sentences[i].text MUST always be available.
- Only word spans (.word) are lazy — sentence spans (.sent) are always in DOM.
- IntersectionObserver rootMargin: 200px provides pre-build buffer.
- Fallback for browsers without IntersectionObserver: build all words
  immediately (current behaviour).
- This is a significant refactor — test thoroughly with:
  - Short books (<100 sentences)
  - Long books (>5000 sentences)
  - Books with word-level highlighting
  - Books without word-level highlighting
  - Rapid scrolling
  - Seek bar jumps to distant positions

## Verification
- 10,000-sentence book loads in under 1s (vs 3-5s currently).
- Word highlighting works when scrolling to a new paragraph.
- Seek bar jump to distant position: words build on scroll.
- Memory usage is lower for long books.
- Run syntax check.
```

---

### #91 — Revoke audio blob URL on book close in browser mode

```
# Perf: Revoke audio blob URL on book close (browser mode) in index.html

## Context
Read goLib() in full. In browser mode, audio blob URLs created by addBook()
or relinkOverlay persist for the page lifetime. Each blob URL holds the
entire audio file in memory.

Read configurePlayerForMode() — it already revokes the previous _audio.src
blob URL before assigning a new one. But goLib() does not revoke when
leaving the player.

## Fix

### 1. Revoke on goLib()
In goLib(), before resetting state:
  if(curBookIdx >= 0 && !IS_PWA){
    const b = library[curBookIdx];
    if(b && b.audioUrl){
      URL.revokeObjectURL(b.audioUrl);
      b.audioUrl = null;
    }
  }

### 2. Recreate on openBook()
In openBook(i), if b.audioUrl is null but audio data exists in IDB:
  if(!b.audioUrl && b.audioName){
    // Audio blob was revoked — recreate from IDB
    const blobs = await idbGet(b.id);
    if(blobs && blobs.audioData){
      b.audioUrl = URL.createObjectURL(new Blob([blobs.audioData]));
    }
  }

Wait — audio data is NOT stored in IDB in browser mode. The audio File
object from the file picker is converted to a blob URL immediately in
addBook(). The original File is not persisted.

This means revoking the blob URL permanently loses the audio reference
until the user re-links it via the relink overlay.

### Revised approach: store audio ArrayBuffer in IDB
In addBook(), after creating the blob URL, also store the audio data:
  const audioArrayBuffer = await upData.audio.arrayBuffer();
  // Store alongside other blobs in idbSet

Then on reopen, recreate from IDB.

This is a larger change — adds audio persistence to browser mode, which
also fixes the existing 'blob URL expires on reload' issue.

### Simpler alternative: just revoke _audio.src, keep b.audioUrl
Revoke only the src attribute's blob URL (which configurePlayerForMode
already does), not b.audioUrl itself. This frees the audio element's
buffer but keeps the reference for re-linking.

Actually, _audio.src IS b.audioUrl — they're the same blob URL.
Revoking either revokes both.

## Decision
The safest approach for now:
1. In goLib(), pause audio and clear _audio.src:
     _audio.pause();
     _audio.removeAttribute('src');
     _audio.load(); // releases internal buffer
2. Keep b.audioUrl — it may be revoked but we don't null it.
3. On reopen, if _audio.src is empty, reassign from b.audioUrl.
   If the blob URL was revoked, the load will fail and trigger showRelink().

This releases the audio element's internal buffer without permanently
losing the blob URL reference (it may still work if not revoked).

## Constraints
- Do not revoke b.audioUrl if it might be needed on reopen.
- _audio.removeAttribute('src') + load() releases the buffer.
- The relink flow already handles expired blob URLs.
- PWA mode is unaffected (handles are persistent).

## Verification
- Open a book, go back to library: audio buffer released.
- Reopen same book: audio plays (blob URL may still be valid).
- Reload page, reopen book: relink overlay appears (existing behaviour).
- Run syntax check.
```

---

### #92 — Confidence-aware sync correction

```
# DEFERRED FEATURE: Confidence-Aware Sync Correction
# Status: NOT implemented. Deliberately deferred.
# Do not build until explicitly requested.

## The Problem
buildSentenceTimings matches ebook sentences to transcript word runs via
Jaccard similarity in two passes. The fill pass accepts weak matches
(bestScore > 0.35). During playback, timeupdate blindly trusts these
timestamps, which can cause highlight drift at poorly-matched sections.

## The Approach (when ready to build)
Use Option B: keep transcriptWords alive conditionally, store confidence
scores alongside sentenceTimings, and add correctSyncDrift(audioTime)
that binary-searches transcriptWords by time, windows ~10 words, and
re-checks similarity against +-5 ebook sentences around curSent.

## Full spec

1. Store bestScore in a parallel sentenceConfidence[] array in
   buildSentenceTimings / _buildSentenceTimingsSync / worker
   doSentenceTimings. Include in worker postMessage payload.

2. Add: const SYNC_CONFIDENCE_THRESHOLD = 0.3;

3. Only null transcriptWords if all confidence scores are above
   threshold. If any are weak, keep transcriptWords alive.

4. Add correctSyncDrift(audioTime): binary search transcriptWords for
   word at audioTime, window ~10 words, run similarity() against
   sentences[curSent-5..curSent+5], return best index or curSent.

5. In timeupdate: if bestSent !== curSent AND confidence below
   threshold, call correctSyncDrift(t) and use result instead.
   High-confidence path must have zero additional overhead.

6. Toast "Sync corrected" debounced to 30s between toasts.

7. Update verte-context.md with sentenceConfidence,
   _lastCorrectionToast, correctSyncDrift.

8. Run node --check index.html when done.

## Known limitation
Only helps when original match was weak due to OCR noise or minor text
differences. Won't help with genuine ebook/transcript divergence.
```
