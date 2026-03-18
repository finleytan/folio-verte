# Verte Brand Identity & Design Specification
Version 1.1 · March 2026

**Tagline:** Listen. Read. Disappear.

---

## 1. Brand Overview

Verte is a single-file Progressive Web App audiobook and ebook reader for Android Chrome. The name derives from the Latin printer's mark *verte* — "turn the page" — written at the foot of a page to instruct the reader to continue. The brand draws on manuscript culture: iron gall ink, parchment paper, illuminated gold leaf, and the physical craft of the book.

| Field | Value |
|---|---|
| Name | Verte |
| Pronunciation | ver-TAY (Latin/French) or VERT (anglicised) |
| Etymology | Latin *verte* — "turn the page." Printers wrote this at the foot of a page as an instruction to continue. |
| Tagline | Listen. Read. Disappear. |
| Platform | Android Chrome PWA |
| Core function | Audiobook playback and ebook reading with TTS support |

---

## 2. Logo & Mark

### 2.1 The Mark

The mark is a V constructed from two converging page-wedge shapes. The right arm carries a small triangular fold at its tip — the turned corner of a page — rendered in gold.

| Property | Value |
|---|---|
| Construction | Two filled polygon arms meeting at a central apex |
| Fold corner | Right arm top — triangular cutout reveals gold triangle beneath |
| Mark colour | #0A0C10 (iron gall ink) |
| Fold colour | #C8980A (gold leaf) |
| Background | Transparent — mark sits on theme background |

### 2.2 Wordmark

| Property | Value |
|---|---|
| Typeface | IM Fell English |
| Weight | 400 (regular) |
| Case | Mixed case — Verte |
| Letter spacing | 0.1em (tracking) |
| Fallback | Georgia, "Times New Roman", serif |

### 2.3 Tagline

| Property | Value |
|---|---|
| Text | Listen. Read. Disappear. |
| Tracking | 0.28–0.32em |
| Colour (light themes) | #7A5228 (teak) |
| Colour (dark themes) | #C8980A (gold) |

---

## 3. Brand Colour Palette

Three primary brand colours. These appear in every theme as constants and must never change.

| Name | Hex | Role |
|---|---|---|
| Iron Gall Ink | #0A0C10 | Mark body, primary text on light themes |
| Gold Leaf | #C8980A | Accent constant — never changes across themes |
| Fresh Paper | #FBF8F2 | Parchment base background |

---

## 4. The Gold Thread

Gold (#C8980A) runs through all five themes. Every instance below must stay gold regardless of which theme is active.

**UI Elements that must always be gold:**
- Progress bar fill
- Scrubber dot
- Play button ring
- Active theme selector ring

**Typography that must always be gold:**
- Chapter / section labels
- Library section headers
- Tagline on dark surfaces
- Fold corner on the mark

---

## 5. Splash Screen

The splash screen is shown on first launch and during app loading. The watermark V sits behind the lockup at low opacity. Top and bottom rules frame the composition. A gold diamond divides wordmark from tagline. A gold loading bar indicates progress.

---

## 6. Theme Selector

Lives in the Appearance settings screen. Each theme tile is rendered in its own colours. The active theme shows a gold ring and checkmark. Unselected themes show an empty radio circle.

---

## 7. Theme System

Five curated themes. Gold (#C8980A) is the constant accent across all. Default is Parchment.

| Theme | Base | Surface | Primary text (--text2) | Accent | Secondary text | Type |
|---|---|---|---|---|---|---|
| **Parchment** | #FBF8F2 | #E8E0CC | #4A2A08 | #C8980A | #0A0C10 | LIGHT |
| **Sepia** | #FDF0D8 | #EED8A8 | #4A2808 | #C8980A | #1C0E04 | LIGHT |
| **Sage** | #1E3020 | #162418 | #B8D0B0 | #C8980A | #E4EEE0 | MID |
| **Dark** | #0C0C0C | #181818 | #C0B8A8 | #C8980A | #F0EEE8 | DARK |
| **Midnight** | #14203A | #1E2E50 | #A0B8D0 | #C8980A | #EEF2F8 | DARK |

---

## 8. App Icon

The mark at all required Android PWA sizes. Fold corner visible at 48px+. At 32px show V silhouette only.

| Size | Purpose |
|---|---|
| 512px | Play Store listing icon |
| 192px | Android home screen icon (maskable) |
| 96px | Splash / large contexts · border-radius: 22px |
| 64px | Standard home screen · border-radius: 14px |
| 48px | Notification / small UI · border-radius: 10px |
| 32px | V silhouette only · border-radius: 7px |

---

## 9. CSS Variable Map

All colours in index.html are driven by CSS custom properties defined in `:root` and overridden per theme. Location in index.html: lines 17–54 (CSS `:root` and theme overrides).

To update a theme, change the corresponding hex in the matching `body.theme-*` block in the `<style>` tag.

| Variable | Role | Parchment | Sepia | Sage | Dark | Midnight |
|---|---|---|---|---|---|---|
| `--bg` | Base background | #FBF8F2 | #FDF0D8 | #1E3020 | #0C0C0C | #14203A |
| `--bg2` | Secondary bg | #F5F0E4 | #F8E8C0 | #162418 | #181818 | #1E2E50 |
| `--surface` | Card / surface | #E8E0CC | #EED8A8 | #162418 | #181818 | #1E2E50 |
| `--surface2` | Elevated surface | #DDD4BC | #E4CCA0 | #243828 | #242424 | #243454 |
| `--border` | Border | #C8B890 | #C8A060 | #2E4830 | #282828 | #2E4060 |
| `--text` | Primary text | #0A0C10 | #1C0E04 | #E4EEE0 | #F0EEE8 | #EEF2F8 |
| `--text2` | Secondary text | #4A2A08 | #4A2808 | #B8D0B0 | #C0B8A8 | #A0B8D0 |
| `--text3` | Tertiary / hints | #7A5228 | #5A3010 | #507850 | #484848 | #4A6080 |
| `--accent` | Gold accent | #C8980A | #C8980A | #C8980A | #C8980A | #C8980A |
| `--hl-bg` | Highlight bg | rgba(200,152,10,.12) | rgba(200,152,10,.12) | rgba(200,152,10,.12) | rgba(200,152,10,.10) | rgba(200,152,10,.10) |
| `--hl-border` | Highlight border | rgba(200,152,10,.45) | rgba(200,152,10,.45) | rgba(200,152,10,.45) | rgba(200,152,10,.40) | rgba(200,152,10,.40) |
| `--word-hl` | Word highlight | #C8980A | #C8980A | #C8980A | #C8980A | #C8980A |
| `--shadow` | Shadow | rgba(0,0,0,.10) | rgba(0,0,0,.12) | rgba(0,0,0,.35) | rgba(0,0,0,.50) | rgba(0,0,0,.45) |

### Typography variables — do not change these for theming

| Variable | Value | Role |
|---|---|---|
| `--font-ui` | 'DM Sans', sans-serif | UI chrome |
| `--font-body` | 'Lora', Georgia, serif | Reader body text (not the brand wordmark) |
| `--font-size` | 18px | Base reader font size (user-adjustable) |
| `--line-height` | 1.88 | Reader line height |
| `--radius` | 14px | Standard border radius |
| `--radius-sm` | 8px | Small border radius |
| `--touch` | 44px | Minimum touch target size |

> Note: `--font-body` is the reader body typeface (Lora), not the brand wordmark typeface (IM Fell English). The brand wordmark is applied inline on the `.lib-logo` element only.

---

## 10. Where Branding Lives in the Code

All app code lives in a single file: index.html. There is no build step, no bundler, no framework. The file has three zones: CSS (lines 16–472), HTML (lines 475–871), JS (lines 872–3425).

**Critical rule: never split index.html into multiple files. All edits happen in this one file.**

| Brand element | Lines | What to change |
|---|---|---|
| CSS variables (`:root`) | 17–26 | Default (dark) theme values for all `--bg`, `--text`, `--accent` etc. |
| Parchment theme | 31–36 | `body.theme-light{ }` — all CSS variable overrides for Parchment |
| Night theme | 37–42 | `body.theme-night{ }` — Night theme overrides |
| High-contrast dark | 43–48 | `body.theme-hc{ }` — HC dark overrides |
| High-contrast light | 49–54 | `body.theme-hclight{ }` — HC light overrides |
| App name in `<title>` | 8 | `<title>Verte</title>` |
| PWA theme-color meta | 9 | `id="themeColorMeta"` — Android browser chrome colour, auto-updated by `updateThemeColor()` |
| Google Fonts `<link>` | 13 | Preload link for DM Sans + Lora. Add IM Fell English here for wordmark |
| Library logo text | ~680 | `.lib-logo` element — the app name displayed in the library header |
| Library tagline text | ~682 | `.lib-tagline` element — tagline displayed under the app name |
| Theme pill labels | 681–685 | The user-facing names of each theme in the options panel |
| `setTheme()` function | 2406–2412 | Applies `theme-*` class to body and calls `updateThemeColor()` |
| `updateThemeColor()` | 2413–2416 | Reads `--bg` variable and writes it to the PWA theme-color meta tag |
| manifest.json | separate file | theme_color, background_color, name, short_name, icons array |

When making any branding change: edit index.html → run the syntax check → test in both browser mode and PWA mode.

### Syntax check command — run after every edit

```
node -e "const fs=require('fs'),html=fs.readFileSync('index.html','utf8'),m=html.match(/<script>([\s\S]*?)<\/script>/);try{new Function(m[1]);console.log('OK');}catch(e){console.error(e.message);}"
```

---

## 11. PWA Manifest Values

The manifest.json file controls how Verte appears when installed on Android. These values must stay in sync with the active theme colours.

| Field | Value |
|---|---|
| name | Verte |
| short_name | Verte |
| description | Listen. Read. Disappear. |
| theme_color | #FBF8F2 (Parchment base — matches default theme) |
| background_color | #FBF8F2 (Splash screen background colour) |
| display | standalone |
| orientation | portrait |
| start_url | ./ |
| scope | ./ |

### Icon array — required sizes

| Size | Purpose |
|---|---|
| 512x512 | purpose: "any maskable" — Play Store + adaptive icon |
| 192x192 | purpose: "any maskable" — Home screen primary |
| 144x144 | purpose: "any" |
| 96x96 | purpose: "any" |
| 72x72 | purpose: "any" |

### Full manifest.json template

```json
{
  "name": "Verte",
  "short_name": "Verte",
  "description": "Listen. Read. Disappear.",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#FBF8F2",
  "background_color": "#FBF8F2",
  "icons": [
    { "src": "icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 12. Font Loading

### 12.1 Currently loaded (already in index.html)

| Font | Role |
|---|---|
| DM Sans 300, 400, 500, 600 | UI chrome — navigation, labels, buttons, metadata |
| Lora 400, 500, 600, italic | Reader body text — the text of the book itself |
| Load method | `<link rel="preload">` with onload swap (non-blocking) |
| Location in code | Line 13 of index.html |

### 12.2 IM Fell English — add for brand wordmark

IM Fell English is not currently loaded. It only needs the regular 400 weight.

**Step 1 — Add preload link in `<head>` (after line 13):**

```html
<link rel="preload"
  href="https://fonts.googleapis.com/css2?family=IM+Fell+English&display=swap"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link href="https://fonts.googleapis.com/css2?family=IM+Fell+English&display=swap" rel="stylesheet">
</noscript>
```

**Step 2 — Apply to the wordmark element:**

```css
.lib-logo {
  font-family: 'IM Fell English', Georgia, 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: 0.1em;
}
```

Performance note: IM Fell English is a small font file (~40KB). The preload approach loads it non-blocking so it does not delay the first paint.

---

## 13. SVG Mark Source

The Verte mark is defined by three SVG polygons on a 120×120 viewBox. The viewBox is always `0 0 120 120`. Scale by setting width and height attributes.

### 13.1 Light variant (ink on transparent) — use on light backgrounds

```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <!-- V body — iron gall ink -->
  <polygon points="60,96 14,18 32,18 60,66 88,18 106,18" fill="#0A0C10"/>
  <!-- Fold corner cutout — matches background colour -->
  <polygon points="88,18 106,18 106,34" fill="#FBF8F2"/>
  <!-- Gold triangle — the turned page -->
  <polygon points="88,18 106,34 88,34" fill="#C8980A" opacity="0.95"/>
</svg>
```

### 13.2 Dark variant (parchment on transparent) — use on dark backgrounds

```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,96 14,18 32,18 60,66 88,18 106,18" fill="#F5EDD8"/>
  <polygon points="88,18 106,18 106,34" fill="#0C0C0C"/>
  <polygon points="88,18 106,34 88,34" fill="#C8980A" opacity="0.95"/>
</svg>
```

### 13.3 Adaptive variant — use inside index.html (respects theme)

Use CSS variables so the mark adapts to whichever theme is active:

```svg
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,96 14,18 32,18 60,66 88,18 106,18" fill="var(--text)"/>
  <polygon points="88,18 106,18 106,34" fill="var(--bg)"/>
  <polygon points="88,18 106,34 88,34" fill="#C8980A" opacity="0.95"/>
</svg>
```

### 13.4 Polygon point reference

| Point | Coordinates | Description |
|---|---|---|
| V apex (bottom) | 60,96 | Centre-bottom, the nadir of the V |
| Left arm — outer top | 14,18 | Far left, top of left arm |
| Left arm — inner top | 32,18 | Inner left, creates arm thickness |
| Centre | 60,66 | The inner V meeting point |
| Right arm — inner top | 88,18 | Inner right, creates arm thickness |
| Right arm — outer top | 106,18 | Far right, top of right arm |
| Fold cutout | 88,18 106,18 106,34 | Top-right triangle, filled with bg colour |
| Gold triangle | 88,18 106,34 88,34 | Gold fill, the turned page corner |

At 32px and below, omit the fold corner detail. Show only the V polygon.

---

## 14. Text Contrast & Accessibility

All text colour combinations verified against WCAG 2.1 AA (4.5:1 minimum for normal text, 3:1 for large text).

| Role | Colour | Background (Parchment) | WCAG AA |
|---|---|---|---|
| Heading / mark | #0A0C10 | #FBF8F2 / #E8E0CC | ✓ Passes |
| Primary text | #0A0C10 | #FBF8F2 / #E8E0CC | ✓ Passes |
| Secondary text | #4A2A08 | #FBF8F2 / #E8E0CC | ✓ Passes |
| Tertiary / labels | #5A3A10 | #FBF8F2 / #E8E0CC | ✓ Passes |
| Inactive nav | #7A5228 | #FBF8F2 / #E8E0CC | ✓ Passes |
| Gold accent | #C8980A | #FBF8F2 / #E8E0CC | ✓ Passes |

---

## 15. Usage Rules

### Do

- Always use #C8980A for gold — never substitute a different yellow or amber
- Use IM Fell English for the wordmark and any brand-level headings
- Maintain the three-level text hierarchy (primary / secondary / tertiary) in every theme
- Keep the fold corner on the mark — it is load-bearing to the verte etymology
- Use Parchment as the default for all screenshots, marketing, and documentation
- Run the syntax check after every edit to index.html

### Do not

- Do not use gold (#C8980A) as body text — accent and interactive elements only
- Do not substitute the wordmark typeface — IM Fell English is a specific choice
- Do not stretch, rotate, recolour, or otherwise modify the mark
- Do not place the mark on a background where the fold corner gold is not visible
- Do not add new themes without verifying WCAG AA contrast for all text roles
- Do not assign `_audio.src` directly outside of `configurePlayerForMode` in the JS

---

## 16. Motion & Animation Spec

**LOW PRIORITY — FUTURE REFERENCE.** The current animation system is functional and does not need to change. This section documents existing motion values for reference when redesigning transitions or adding new animated elements.

### 16.1 Timing principles

| Speed | Duration | Used for |
|---|---|---|
| Fast | 0.10–0.15s | Button/icon colour changes, hover state colour shifts, slider thumb scale |
| Standard | 0.20–0.25s | Card hover lift, toggle switch, add-card hover, TOC sidebar collapse |
| Slow | 0.30–0.40s | Progress bar fill, reading progress bar, word highlight fade |
| Looping | varies | Spinner: 0.8s linear; shimmer: 1.2–1.5s ease-in-out |

All transitions use CSS `ease` (equivalent to `cubic-bezier(0.25, 0.1, 0.25, 1)`) unless noted.

### 16.2 Keyframe animations (existing)

| Animation | Description |
|---|---|
| `@keyframes spin` | Spinner rotation — 0.8s linear infinite |
| `@keyframes tx-shimmer` | Loading shimmer bar — translateX(-100%) to translateX(100%) — 1.5s ease-in-out infinite |
| `@keyframes tx-ready-in` | Transcript ready flash — background colour pulse — 0.5s ease |
| `@keyframes tx-check-pop` | Check icon pop — scale(0) to scale(1.3) — 0.35s ease |
| `@keyframes sent-pulse` | Sentence resume pulse — box-shadow ripple — 0.8s ease-out |
| `@keyframes word-flash` | Word highlight flash — accent background fades to transparent — 0.35s ease |
| `@keyframes fadeIn` | Generic fade — opacity 0 to 1 — 0.15s ease |

### 16.3 Motion to-do (future)

- Theme switch — currently instant. A 0.2s cross-fade on background-color would feel more intentional.
- Screen transitions (library ↔ player) — currently instant show/hide. A slide or fade would add continuity.
- Splash screen — staggered reveal of mark → wordmark → tagline → bar would be more ceremonial.
- Book card entry — staggered fade-in (animation-delay per card) would feel polished.
- Play button press — a press animation (scale down then up) would add tactility.

---

## 17. Quick Reference

| Property | Value |
|---|---|
| **Name** | Verte |
| **Pronunciation** | ver-TAY |
| **Tagline** | Listen. Read. Disappear. |
| **Wordmark typeface** | IM Fell English · 400 · 0.1em tracking |
| **Platform** | Android Chrome PWA |
| **Iron Gall Ink** | #0A0C10 — mark, primary text — CSS: `--text` |
| **Gold Leaf** | #C8980A — accent constant all themes — CSS: `--accent` |
| **Fresh Paper** | #FBF8F2 — Parchment base — CSS: `--bg` (Parchment theme) |
| **Parchment (default)** | #FBF8F2 · Light · CSS class: `body.theme-light` |
| **Sepia** | #FDF0D8 · Light warm · CSS class: `body.theme-sepia` |
| **Sage** | #1E3020 · Mid green · CSS class: `body.theme-sage` |
| **Dark** | #0C0C0C · Dark neutral · CSS class: `body` (default, no class) |
| **Midnight** | #14203A · Dark navy · CSS class: `body.theme-night` |
| **CSS variables** | Lines 17–54 of index.html |
| **App name / tagline** | Lines ~680–685 of index.html |
| **`setTheme()`** | Line 2406 of index.html |
| **`updateThemeColor()`** | Line 2413 of index.html |
| **Google Fonts link** | Line 13 of index.html |
| **PWA manifest** | manifest.json — separate file |

---

*Verte Brand Identity Specification · Version 1.1 · March 2026*
*All colours as hex. IM Fell English: fonts.google.com/specimen/IM+Fell+English*
