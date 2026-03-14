# Folio

Single-file HTML PWA (~3.71k lines, sw.js for caching): audiobook/ebook reader with synced highlighting.
File: index.html — <style>, static HTML (4 screens + 5 modals), <script>.

## File structure
- CSS: lines 16–511
- HTML: lines 513–897
- JS: lines 898–3706

## Two playback modes (set by configurePlayerForMode)
- Audio mode: <audio> drives playback, _wordTick() at rAF for word highlights
- TTS mode: speechSynthesis, utt.onboundary for word highlights

## Key state
sentences[] holds LIVE DOM refs — stale after innerHTML wipe.
curSent/curWord = reading position. mediaState = 'stopped'|'playing'|'paused'.

## Constraints
- Do not refactor or restructure unless asked
- Read each target function in full before editing
- Run `node -e "const fs=require('fs'),html=fs.readFileSync('index.html','utf8'),m=html.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('OK');}catch(e){console.error(e.message);}"` to verify syntax after changes
- State updates must always include: setPlayBtnIcon, setMediaState,
  acquireWakeLock/releaseWakeLock, updatePageTitle

## Detailed context
See folio-context.md for full function map, data structures, and line ranges.