# Keyboard Typing Trainer — Project Guidelines

## Workflow

1. Read `docs/PRD.md` and `docs/IMPLEMENTATION.md` before starting work.
2. Think before coding — describe the approach first.
3. Test in the browser after every change.
4. Update `docs/IMPLEMENTATION.md` before committing.

## Architecture

- ES modules natifs — no bundler, no dependencies. Serve via HTTP (CORS blocks `file://`).
- All colors via Catppuccin Mocha CSS variables. Never hardcode colors.
- All persistence through `js/store.js`. Never access `localStorage` directly.
- Engine emits events; UI subscribes. Never couple UI to engine internals.

## Commands

Use `make` for all project commands (`make serve`, `make open`, `make kill`).

## Commit Messages

```
type: short description

- Detail 1
- Detail 2
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`. Lowercase, imperative mood, no period.

## Full Guide

For detailed patterns, file map, and testing tips, read `.agents/skills/ktt-impl/SKILL.md`.
