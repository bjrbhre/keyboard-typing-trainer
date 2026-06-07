# Keyboard Typing Trainer

A standalone web app that teaches touch-typing through gradual progression, with a visual keyboard that keeps your eyes on the screen — not on your fingers.

No account, no server, no dependencies. Open in a browser and type.

## Features

- **Learning mode** — 8 cumulative levels that introduce fingers and rows one at a time, with drills and validation thresholds
- **Training mode** — real words filtered by available keys, in French or English
- **Visual keyboard** — color-coded by finger, highlights the next key to press in real time
- **QWERTY / AZERTY** — toggle between layouts; preference is saved
- **Live stats** — speed (CPM) and success rate updated as you type
- **Persistent progress** — levels completed, best scores, and preferences saved between sessions

## Quick Start

```sh
make serve   # start dev server on port 8080
make open    # open in browser
make kill    # stop the server
```

Override the port: `make serve PORT=3000`

> The app uses ES modules and must be served over HTTP (`file://` is blocked by CORS).

## Architecture

Zero dependencies, zero build step. Native ES modules served directly by an HTTP server.

```
index.html              # entry point, layout structure
style.css               # Catppuccin Mocha theme, all styles
js/
  app.js                # orchestration, keyboard capture, mode switching
  engine.js             # typing state machine (position, errors, events, stats)
  keyboard.js           # layout data (QWERTY/AZERTY), finger→color mapping
  keyboard-display.js   # visual keyboard rendering + highlight
  levels.js             # level specs, drill generation, validation thresholds
  level-ui.js           # level navigation bar + threshold display
  stats.js              # CPM + success rate display
  store.js              # localStorage abstraction (all persistence goes here)
  ui.js                 # text display rendering + scroll
  words-en.js           # English word corpus (~800 words)
  words-fr.js           # French word corpus (~400 words)
```

### Key patterns

- **Event-driven** — `Engine` emits events (`correct`, `error`, `backspace`, `reset`, `finish`); UI components subscribe and re-render. UI never queries engine internals.
- **Catppuccin Mocha** — all colors via CSS variables in `:root`. No hardcoded colors.
- **localStorage through `store.js`** — keys: `layout`, `language`, `currentLevel`, `completedLevels`, `attemptedLevels`, `scores`. Never access `localStorage` directly.
- **Hidden textarea for input capture** — `<textarea id="input-capture">` captures keystrokes (required for WKWebView compatibility and robust focus handling), cleared after each keystroke.

## Levels

8 cumulative levels, each adding fingers or rows to the previous set:

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

All levels are accessible from the start. In **learning mode**, completing a level (meeting thresholds) marks it as completed. In **training mode**, there are no thresholds — just practice.

### Validation thresholds (learning mode)

To complete a level: **≥ 50 characters typed**, **≥ 90% success rate**, **≥ 20 CPM**.

## Layout & Language

- **Layout picker** (globe icon below the keyboard) — switches QWERTY / AZERTY; the visual keyboard and drills adapt
- **Language picker** (A↔à icon) — switches French / English word corpus (affects training mode only)

## Design

Built with the [Catppuccin Mocha](https://catppuccin.com/) palette. Dark, warm, modern. Characters show three states as you type: correct (full color), upcoming (muted), error (red). The cursor blinks like a code editor.

## License

MIT
