# 📖 Folio

**A single-file audiobook + ebook reader that runs entirely in your browser.**
No installation. No account. No server. Just open and read.

---

## What it does

Folio syncs your ebook text to your audiobook audio in real time. With a Whisper transcript, it highlights the exact word being spoken — word by word, driven by actual timestamps at 60 fps. Without one, it falls back to sentence-level sync or lets your browser read the book aloud via text-to-speech.

Everything — your library, reading positions, display settings, and sync anchors — is saved locally in your browser. Only the audio file needs to be re-selected each session (a browser security limitation).

---

## Features

- **Word-level highlight** driven by Whisper JSON timestamps at 60 fps
- **Sentence sync** — active sentence scrolls into view as audio plays
- **TTS fallback** — browser speech synthesis if you have no audio file
- **EPUB, TXT, HTML, MD** ebook support with auto-generated table of contents
- **Folder picker** — drop a book folder and Folio auto-assigns all files
- **Book Info modal** — hot-swap audio, ebook, or transcript without leaving the player
- **PWA mode** — install to home screen; scans your library folder automatically on launch
- **Rate presets** — 0.75× · 1× · 1.25× · 1.5× · 2× plus custom input
- **Themes** — Dark, Parchment, Night
- **Fully offline** — single HTML file, no build step, no dependencies (JSZip loaded on demand for EPUB only)

---

## Getting started

### In a browser (simplest)

1. Download [`audiobook-reader.html`](audiobook-reader.html)
2. Open it in Chrome, Edge, Firefox, or Safari
3. Click **+ Add Book** and add your files

Your library persists in `localStorage` between sessions.

### As a PWA on Android (recommended for mobile)

Host Folio on GitHub Pages (free, ~5 minutes):

1. Fork or upload this repo and rename `audiobook-reader.html` → `index.html`
2. Go to **Settings → Pages → Branch: main / root → Save**
3. Visit `https://yourusername.github.io/your-repo-name` in Chrome on your phone
4. Tap **⋮ → Add to Home Screen**

In PWA mode, Folio can scan a library folder on your device automatically — no re-selecting files each session.

---

## Adding a book

Click **+ Add Book** and either browse a folder or drop files into the individual slots:

| Slot | Formats |
|---|---|
| 🎧 Audio | MP3, M4A, M4B, OGG, WAV, AAC, FLAC, OPUS |
| 📄 Ebook | EPUB, TXT, HTML, HTM, XHTML, MD |
| 📝 Transcript *(optional)* | Whisper JSON, plain TXT |

**Folder picker:** click **📁 Browse Folder**, select your book folder, and Folio auto-assigns the files. The title defaults to the folder name.

### PWA library folder structure

```
Folio Library/
├── Dune/
│   ├── Dune.mp3
│   ├── Dune.epub
│   └── Dune.json        ← Whisper transcript
├── Project Hail Mary/
│   ├── ProjectHailMary.m4b
│   └── ProjectHailMary.epub
```

---

## Text sync

### 1. Whisper JSON — most accurate

Folio aligns each ebook sentence to the matching run in the Whisper transcript, then maps a real timestamp to every ebook word. The word highlight advances exactly when the narrator speaks each word.

Generate a transcript (requires Python and ffmpeg):

```bash
pip install openai-whisper
whisper "audiobook.mp3" --model medium --output_format json --word_timestamps True
```

Drop the `.json` file into the transcript slot.

| Model | Speed | Best for |
|---|---|---|
| `tiny` | Very fast | Quick tests |
| `base` | Fast | Clear narration |
| `medium` | Moderate | Most audiobooks *(recommended)* |
| `large-v3` | Slow | Accented speech, older recordings |

### 2. Plain text transcript

A `.txt` file of the narration. Folio aligns sentences by word overlap and estimates timing from the audio duration.

### 3. Manual sync anchors

No transcript? Use the **⚙ Sync** panel at the bottom of the player:

1. Play to where narration starts → **Set audio start**
2. Click the matching sentence in the ebook → **Set text start**
3. After seeking, tap **↺ Resync** to re-align

---

## Player controls

### Top bar

| | |
|---|---|
| ← | Return to library (saves progress) |
| ⏮ / ⏭ | Skip −15 / +15 seconds |
| ▶ / ⏸ | Play / Pause |
| ☰ | Table of contents |
| 📝 | Transcript manager |
| ℹ | Book Info — swap any file slot |
| ⚙ | Options (Playback / Display / Advanced) |

### Bottom bar

| | |
|---|---|
| ▶ ⏸ ⏹ | Play / Pause / Stop |
| −10 −5 −1 +1 +5 +10 | Jump by sentences |
| Auto-scroll | Keep active sentence in view |
| ↺ Resync | Snap text to audio position |
| ⚙ Sync | Manual sync anchor panel |

**Click any sentence** to jump playback there.
**Click any word** to jump to that word (Whisper transcript required).
**Swipe left/right** on the reading area to step one sentence (mobile).

---

## Options

| Tab | Settings |
|---|---|
| **Playback** | Volume, WPM, sentence pause, word highlight |
| **Display** | Theme, font, font size, line height, max width, alignment |
| **Advanced** | About |

Speed presets in the seek strip: **0.75× 1× 1.25× 1.5× 2×** plus a custom value input.

---

## What gets saved

| Data | How |
|---|---|
| Ebook content | ✅ localStorage |
| Transcript | ✅ localStorage |
| Reading position | ✅ localStorage |
| Audio position | ✅ localStorage |
| Speed, WPM, settings | ✅ localStorage |
| Sync anchors | ✅ localStorage |
| Library folder (PWA) | ✅ IndexedDB |
| Audio file | ❌ Re-select each session |

---

## Browser support

| Browser | Standard | PWA folder scan |
|---|---|---|
| Chrome / Edge | ✅ | ✅ |
| Firefox | ✅ | ❌ |
| Safari (macOS) | ✅ | ❌ |
| Chrome Android | ✅ | ✅ |
| Safari iOS | ✅ | ❌ |

PWA folder scanning uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API), currently only supported in Chromium-based browsers.

---

## Files

| File | Purpose |
|---|---|
| `audiobook-reader.html` | The entire app |
| `sw.js` | Service worker (offline caching) |
| `manifest.json` | PWA manifest (Add to Home Screen) |

---

## License

MIT
