# Folio — Regression Tests

Playwright test suite for Folio. Runs against a local static server.
Does not touch or modify index.html.

## First-time setup
```bash
cd tests
npm install
npx playwright install chromium
```

## Run tests
```bash
# Headless (default)
npm test

# Watch tests run in real browser
npm run test:headed

# Interactive Playwright UI
npm run test:ui
```

## Test structure

- `specs/01-library` — library screen, card rendering, persistence
- `specs/02-reader` — book open, DOM rendering, sentence count
- `specs/03-tts` — nudge, highlight tracking, boundary conditions
- `specs/04-progress` — save/restore position, display prefs, pagehide
- `specs/05-ui` — modals, options panel, TOC, theme switching

## Adding a new test

Add a `.spec.js` file to `specs/`. Import helpers from `../helpers/folio.js`.
Use `injectFixtureBook()` instead of loading real files.
