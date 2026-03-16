# Session Instructions

Read this file first at the start of every new session. These rules override default behavior.

---

## On session start

1. Read [CLAUDE.md](CLAUDE.md), [verte-context.md](verte-context.md), and [verte-fragile.md](verte-fragile.md)
2. Confirm you have read and understand the architecture, function index, hard rules, and fragile areas before doing any work

---

## After every code edit

1. Give a plain-English summary of what changed and which areas were affected (e.g., "Added X to the options panel HTML, new JS function at line Y, hooked into Z")

---

## Before every commit

Do all of the following before presenting the commit for approval:

1. **Update docs**
   - [CLAUDE.md](CLAUDE.md) — line count if it changed
   - [verte-context.md](verte-context.md) — line numbers, new functions, shifted functions, IIFEs table, data structures, UI architecture
   - [verte-fragile.md](verte-fragile.md) — new fragile areas or gotchas discovered during implementation
   - [CHANGELOG.md](CHANGELOG.md) — add entry under the current version. Treat small changes, bug fixes, and single small feature updates as **minor** version bumps (x.N+1.0), not patch

2. **Check work items**
   - Read [verte-work-items.md](verte-work-items.md) and check if any Active or Backlog items were completed by this session's changes
   - If so, move them to the Done section with today's date
   - Also remove the associated prompt from [verte-prompts.md](verte-prompts.md) if the item had `Prompt: yes`

3. **Update version number**
   - Set `APP_VERSION` in index.html to match the version in CHANGELOG.md

4. **Create commit message** and present it for approval — do NOT commit until approved

5. **If approved**, commit and push

---

## Commit message format

- First line: conventional commit type (`feat`/`fix`/`refactor`/`perf`/`chore`/`docs`) + short summary, max 72 chars
- Blank line
- Bullet list of what changed, one bullet per logical change
- If a bug was fixed, one line describing the root cause
- End with: `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
