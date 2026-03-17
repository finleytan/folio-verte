# Verte

Single-file HTML PWA (~4,936 lines). Audiobook/ebook reader with synced highlighting.

## CSS variable groups
- Core palette: `--bg`, `--surface`, `--border`, `--text`, `--accent`, etc.
- Amber palette (notx banner + relink badge): `--amber-bg`, `--amber-border`, `--amber-text`, `--amber-muted` — defined in `:root` and overridden per theme

## Before every edit

1. Look up the function in the Function Index ([verte-context.md](verte-context.md)) to get its exact line number
2. Read that line range in index.html before writing any code
3. Check any ⚠️ flags on that function in the index
4. Run the syntax check after every change:
   ```
   node -e "const fs=require('fs'),html=fs.readFileSync('index.html','utf8'),m=html.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('OK');}catch(e){console.error(e.message);}"
   ```

## Hard rules

- Single file only — no frameworks, no build step, no splitting index.html
- Playback state: always call all four together — setPlayBtnIcon, setMediaState, acquireWakeLock/releaseWakeLock, updatePageTitle (exception: `mediaPlay` delegates to the `play` event handler — see fragile #37)
- Never assign `_audio.src` outside `configurePlayerForMode`
- Always call `saveBookProgress()` not `saveLibrary()` from playback code
- `IS_PWA` branch is the dividing line — never fix a browser-mode bug in PWA code or vice versa
- Never use `alert()`, `confirm()`, or `prompt()` — use toasts and inline UI
- Never add `console.log` to production code
- Deliver changes as find/replace pairs only — never as diffs or patches
- After delivering changes, always include the syntax check command

**Read first every session**: [INSTRUCTIONS.md](INSTRUCTIONS.md)
Detailed context and function line numbers: [verte-context.md](verte-context.md)
Deep-reference fragile areas: [verte-fragile.md](verte-fragile.md)
