---
name: ktt-impl
description: Implementation guidelines for the Keyboard Typing Trainer project. Use when coding features, fixing bugs, or making changes to the app. Covers workflow, architecture patterns, testing, and commit conventions.
---

# Keyboard Typing Trainer — Implementation Guidelines

## Workflow

1. **Read the PRD** (`docs/PRD.md`) and the implementation notes (`docs/IMPLEMENTATION.md`) before starting any work.
2. **Think before coding** — describe the approach and alternatives before implementing. Discuss when uncertain.
3. **Implement the change** — make minimal, focused edits.
4. **Test in the browser** — use cmux browser to reload the page and verify the change. For typing input, space `press` commands with `sleep 0.2` between each (WKWebView needs delay for DOM re-render).
5. **Update `docs/IMPLEMENTATION.md`** — add decisions, bug fixes, file changes before committing.
6. **Commit** — follow commit message conventions below.

## Commands

All commands via `make`:

| Target | Description |
|---|---|
| `make serve` | Start dev server (uv, port 8080) |
| `make open` | Open app in browser |
| `make kill` | Free port 8080 |

Override port: `make serve PORT=3000`

## Architecture

- **ES modules natifs** — no bundler, no dependencies. Open in browser via HTTP server (CORS blocks `file://`).
- **Catppuccin Mocha** — all colors via CSS variables in `:root`. Never use hardcoded colors.
- **Modular files** — `ui.js` is split into `ui.js` + `keyboard-display.js` + `level-ui.js` + `stats.js`. Keep modules focused.
- **localStorage** — all persistence through `js/store.js` (abstraction over `localStorage`). Keys: `layout`, `language`, `currentLevel`, `completedLevels`, `scores`.
- **Engine event system** — `Engine` emits events (`correct`, `error`, `backspace`, `reset`, `finish`). UI components subscribe and re-render.

## Key Patterns

### Keyboard capture — hidden textarea

Input is captured via `<textarea id="input-capture">`, not `document.keydown`. Reasons:
- WKWebView (cmux browser) requires a focusable element as first responder.
- Prevents focus loss if user clicks outside the typing area.
- Auto-focus on load, re-focus on any click.
- Clear `textarea.value` after each keystroke to prevent accumulation.
- Map `CODE_TO_KEY` for WKWebView synthetic events (e.g. `KeyF` → `f`).

### Text scroll — scrollTop (approach C)

- Render all characters into the DOM (150 `<span>` max).
- `_scrollToCursor()` positions `scrollTop` so the cursor stays on the 2nd visible line.
- CSS: `height: 7.5rem`, `overflow-y: auto`, `word-break: break-all`, scrollbar hidden via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`.
- No `CHARS_PER_LINE` calculation — the browser handles line-wrapping.

### Drill completion

- `Engine.finishTime` freezes the timer when `finished = true`. `getStats()` uses `finishTime` instead of `Date.now()` so CPM doesn't decay.
- Text-display shows completion screen: title, frozen stats, "Press Enter" hint. Green border on container.
- `App.replayDrill()` generates a new drill and resets the engine. Triggered by Enter key.

## File Map

| File | Role |
|---|---|
| `index.html` | Entry point, layout structure |
| `style.css` | Catppuccin Mocha theme, all styles |
| `js/app.js` | Orchestration, keyboard capture, layout picker |
| `js/engine.js` | Typing state machine (position, errors, events, stats) |
| `js/keyboard.js` | Layout data (QWERTY/AZERTY), finger→color mapping |
| `js/keyboard-display.js` | Visual keyboard rendering + highlight |
| `js/levels.js` | Level specs, drill generation, validation thresholds |
| `js/level-ui.js` | Level navigation bar + threshold display |
| `js/store.js` | localStorage abstraction |
| `js/ui.js` | Text display rendering + scroll |
| `js/stats.js` | CPM + success rate display |
| `docs/PRD.md` | Product requirements |
| `docs/IMPLEMENTATION.md` | Implementation decisions and status |

## Commit Messages

Format:
```
type: short description

- Detail 1
- Detail 2
```

Types:
- `feat:` — new feature or behavior
- `fix:` — bug fix
- `refactor:` — code restructuring, no behavior change
- `style:` — visual/CSS changes
- `docs:` — documentation only

Rules:
- Lowercase description, no period.
- Imperative mood ("add", "fix", "remove" — not "added", "fixing").
- Bullet points in body explain what changed and why.
- Always update `docs/IMPLEMENTATION.md` in the same commit as code changes.

## Testing with cmux browser

The app runs in a WKWebView surface. Key constraints:
- `press` commands need `sleep 0.2` between each for reliable input (DOM re-render time).
- `snapshot --interactive` may return `js_error` on complex pages. Fall back to `get text body` or `get html body`.
- Synthetic keyboard events put `KeyboardEvent.code` in `e.key` — the `CODE_TO_KEY` map in `app.js` handles this.
- `eval` runs JS in the page context — useful for reading DOM state, but not for simulating fast typing (use `press` with delays instead).
