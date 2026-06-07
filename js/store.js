/**
 * Store — localStorage persistence for preferences and progress
 */

const STORAGE_KEY = 'keyboard-typing-trainer';

const DEFAULTS = {
  layout: 'QWERTY',
  language: 'en',
  currentLevel: 1,
  completedLevels: [],
  scores: {},
};

function _load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function _save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export const store = {
  get(key) {
    return _load()[key];
  },

  set(key, value) {
    const data = _load();
    data[key] = value;
    _save(data);
  },

  getAll() {
    return _load();
  },
};
