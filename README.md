# Keyboard Typing Trainer

A standalone web app that teaches touch-typing through gradual progression — no account, no server, no dependencies. Open in a browser and type.

---

### 🗺️ How to read this codebase

Start with **`index.html`** → it's the skeleton. Everything else wires into it.

Then follow the **data flow**:

```
user keystroke
  → textarea capture (js/app.js)
  → Engine event (js/engine.js)
  → UI re-render (js/ui.js, js/keyboard-display.js, js/level-ui.js, js/stats.js)
```

**The engine is the heart.** `js/engine.js` is a state machine — it tracks cursor position, errors, backspace, and emits events (`correct`, `error`, `backspace`, `reset`, `finish`). UI components subscribe and render. **Never couple UI to engine internals.**

**`js/app.js`** is the orchestrator — it wires everything together, handles mode switching, and captures keyboard input via a hidden `<textarea>` (not `document.keydown`).

---

### 📂 File guide

| File | What it does | ✨ Key insight |
|------|-------------|---------------|
| `js/engine.js` | Typing state machine | Emits events — UI subscribes, never queries |
| `js/app.js` | Orchestration + input capture | Hidden textarea trick (WKWebView-safe focus) |
| `js/levels.js` | Level specs + drill generation | 8 cumulative levels; drills switch to real words when enough keys exist |
| `js/keyboard.js` | Layout data + finger→color | QWERTY and AZERTY as data, not DOM |
| `js/keyboard-display.js` | Visual keyboard rendering | Highlight follows the cursor in real time |
| `js/store.js` | localStorage abstraction | **All persistence goes here** — never touch `localStorage` directly |
| `js/ui.js` | Text display + scroll | Full DOM render + programmatic `scrollTop` (no manual line-counting) |
| `js/level-ui.js` | Level navigation bar | 3 states: default / attempted / completed |
| `js/stats.js` | CPM + success rate display | Only correct keystrokes count toward CPM |
| `js/words-en.js` | English word corpus | ~800 words, flat array, filtered at runtime |
| `js/words-fr.js` | French word corpus | ~400 words, accents available only on AZERTY |

---

### 🏗️ Architecture rules

- **🚫 No bundler, no dependencies** — native ES modules, served via HTTP
- **🚫 No direct `localStorage`** — always through `js/store.js`
- **🚫 No hardcoded colors** — always via `--var` from Catppuccin Mocha palette
- **🚫 No UI↔engine coupling** — engine emits, UI subscribes

---

### 🎹 Levels

8 cumulative levels, each adding fingers or rows to the previous set. All levels are accessible from the start.

| # | Name | New keys |
|---|------|----------|
| 1 | Home — Index + Thumb | f, j, h, space |
| 2 | Home — Middle fingers | d, k |
| 3 | Home — Ring fingers | s, l |
| 4 | Home — Left pinky | a |
| 5 | Home — Full row | g, ; |
| 6 | Top row | all top-row keys |
| 7 | Bottom row | all bottom-row keys |
| 8 | Full keyboard | all alphanumeric keys |

**Learning mode** — complete a level by meeting the thresholds: **≥ 50 characters**, **≥ 90% success rate**, **≥ 20 CPM**.

**Training mode** — no thresholds, just practice with real words filtered by available keys.

---

### 🌐 Layout & Language

- **Layout picker** (globe icon) — switches QWERTY / AZERTY; the visual keyboard and drills adapt
- **Language picker** (A↔à icon) — switches French / English word corpus (affects training mode only)

---

### 🎨 Visual identity

**Catppuccin Mocha** everywhere — all colors via CSS variables in `:root`. Characters show 3 states as you type: ✅ correct (full color), 🔜 upcoming (muted), ❌ error (red). The cursor blinks like a code editor.

---

### 🚀 Quick Start

```sh
make serve   # HTTP server on :8080 (CORS blocks file://)
make open    # opens in browser
make kill    # stop the server
```

Override the port: `make serve PORT=3000`

---

### 📖 Deep dive

- **`docs/PRD.md`** — product requirements and feature spec
- **`docs/IMPLEMENTATION.md`** — implementation decisions, bug fixes, per-step history
- **`docs/RFC-001.md`** — planned follow-ups

## License

MIT
