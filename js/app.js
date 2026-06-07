/**
 * App — orchestration: wires engine, UI, stats, keyboard, levels, and input
 */

import { Engine } from './engine.js';
import { TextDisplay } from './ui.js';
import { StatsDisplay } from './stats.js';
import { LAYOUTS } from './keyboard.js';
import { KeyboardDisplay } from './keyboard-display.js';
import { store } from './store.js';
import { LEVEL_SPECS, generateDrill, generateTrainingText, isLevelCompleted, THRESHOLDS, MIN_WORDS } from './levels.js';
import { LevelUI } from './level-ui.js';

class App {
  constructor() {
    // Load preferences
    const savedLayout = store.get('layout');
    this.layout = LAYOUTS[savedLayout] || LAYOUTS.QWERTY;
    this.currentLevel = store.get('currentLevel') || 1;
    this.completedLevels = store.get('completedLevels') || [];
    this.attemptedLevels = store.get('attemptedLevels') || [];
    this.scores = store.get('scores') || {};
    this.levelCompleted = false;

    // Mode: 'learning' or 'training'
    this.mode = 'learning';

    // Language: 'en' or 'fr'
    this.language = store.get('language') || 'en';

    // Generate initial text and create engine
    const text = this._generateText();
    this.engine = new Engine(text);

    // Create UI components
    this.textDisplay = new TextDisplay(this.engine);
    this.keyboardDisplay = new KeyboardDisplay(this.engine, this.layout);
    this.statsDisplay = new StatsDisplay(this.engine);
    this.levelUI = new LevelUI(this);

    // Listen for engine events to check level completion
    this.engine.on((event) => {
      if (['correct', 'error', 'backspace'].includes(event.type)) {
        this._markAttempted();
        this._checkLevelCompletion();
        this.levelUI.updateThresholds();
      }
      if (event.type === 'finish') {
        this._checkLevelCompletion();
      }
    });

    // Layout picker
    this._initLayoutPicker();

    // Language picker
    this._initLanguagePicker();

    // Mode tabs
    this._initModeTabs();
  }

  _generateText() {
    if (this.mode === 'training') {
      const text = generateTrainingText(this.currentLevel, this.layout, this.language);
      if (text) return text;
      // Not enough words for this level → fall back to drill
    }
    return generateDrill(this.currentLevel, this.layout);
  }

  _initModeTabs() {
    const learningTab = document.getElementById('tab-learning');
    const trainingTab = document.getElementById('tab-training');

    learningTab.addEventListener('click', () => {
      this.mode = 'learning';
      this._updateModeTabs();
      this.selectLevel(this.currentLevel);
    });

    trainingTab.addEventListener('click', () => {
      this.mode = 'training';
      this._updateModeTabs();
      this.selectLevel(this.currentLevel);
    });

    this._updateModeTabs();
  }

  _updateModeTabs() {
    const learningTab = document.getElementById('tab-learning');
    const trainingTab = document.getElementById('tab-training');

    learningTab.classList.toggle('active', this.mode === 'learning');
    trainingTab.classList.toggle('active', this.mode === 'training');
  }

  _initLanguagePicker() {
    const langBtn = document.getElementById('lang-toggle');
    const langMenu = document.getElementById('lang-menu');
    const langOptions = langMenu.querySelectorAll('.lang-option');

    this._updateLanguageMenu();

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('hidden');
    });

    langOptions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.language = btn.dataset.lang;
        store.set('language', this.language);
        this._updateLanguageMenu();
        langMenu.classList.add('hidden');
        if (this.mode === 'training') {
          this.selectLevel(this.currentLevel);
        }
      });
    });

    document.addEventListener('click', () => {
      langMenu.classList.add('hidden');
    });
  }

  _updateLanguageMenu() {
    const langMenu = document.getElementById('lang-menu');
    const langOptions = langMenu.querySelectorAll('.lang-option');
    langOptions.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.language);
    });
  }

  _initLayoutPicker() {
    const globeBtn = document.getElementById('layout-globe');
    const menu = document.getElementById('layout-menu');
    const options = menu.querySelectorAll('.layout-option');

    // Mark current as active
    this._updateLayoutMenu();

    // Toggle menu on globe click
    globeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });

    // Select layout
    options.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const layoutName = btn.dataset.layout;
        this.layout = LAYOUTS[layoutName];
        this.keyboardDisplay.setLayout(this.layout);
        store.set('layout', layoutName);
        this._updateLayoutMenu();
        menu.classList.add('hidden');
        this.selectLevel(this.currentLevel);
      });
    });

    // Close menu on outside click
    document.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  }

  _updateLayoutMenu() {
    const menu = document.getElementById('layout-menu');
    const options = menu.querySelectorAll('.layout-option');
    options.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layout === this.layout.name);
    });
  }

  selectLevel(levelId) {
    this.currentLevel = levelId;
    this.levelCompleted = false;
    store.set('currentLevel', levelId);

    const text = this._generateText();
    this.engine.reset(text);
    this.levelUI.render();
  }

  _markAttempted() {
    if (!this.attemptedLevels.includes(this.currentLevel) &&
        !this.completedLevels.includes(this.currentLevel)) {
      this.attemptedLevels.push(this.currentLevel);
      store.set('attemptedLevels', this.attemptedLevels);
      this.levelUI.render();
    }
  }

  replayDrill() {
    this.levelCompleted = false;
    const text = this._generateText();
    this.engine.reset(text);
    this.levelUI.render();
  }

  _checkLevelCompletion() {
    // Only check completion in learning mode
    if (this.mode !== 'learning') return;
    if (this.levelCompleted) return;

    const stats = this.engine.getStats();
    const totalChars = this.engine.position;
    const levelStats = {
      totalChars,
      successRate: stats.successRate,
      cpm: stats.cpm,
    };

    if (isLevelCompleted(levelStats)) {
      this.levelCompleted = true;

      if (!this.completedLevels.includes(this.currentLevel)) {
        this.completedLevels.push(this.currentLevel);
        store.set('completedLevels', this.completedLevels);
      }

      const key = `${this.layout.name}-${this.currentLevel}`;
      const prev = this.scores[key];
      if (!prev || stats.cpm > prev.cpm) {
        this.scores[key] = { cpm: stats.cpm, successRate: stats.successRate };
        store.set('scores', this.scores);
      }

      this.levelUI.render();
      this.levelUI.showLevelComplete();
    }
  }
}

// Boot
const app = new App();

// Capture keyboard input via hidden textarea
const inputCapture = document.getElementById('input-capture');
inputCapture.focus();

// Re-focus on any click so we never lose capture
document.addEventListener('click', () => {
  inputCapture.focus();
});

inputCapture.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' || e.key === ' ') {
    e.preventDefault();
  }

  // WKWebView synthetic events (e.g. cmux press) put the code name
  // in e.key ("KeyF" instead of "f"). Map them to real key values.
  let key = e.key;
  const CODE_TO_KEY = {
    KeyA:'a',KeyB:'b',KeyC:'c',KeyD:'d',KeyE:'e',KeyF:'f',KeyG:'g',
    KeyH:'h',KeyI:'i',KeyJ:'j',KeyK:'k',KeyL:'l',KeyM:'m',KeyN:'n',
    KeyO:'o',KeyP:'p',KeyQ:'q',KeyR:'r',KeyS:'s',KeyT:'t',KeyU:'u',
    KeyV:'v',KeyW:'w',KeyX:'x',KeyY:'y',KeyZ:'z',
    Digit0:'0',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',
    Digit5:'5',Digit6:'6',Digit7:'7',Digit8:'8',Digit9:'9',
    Space:' ',Backspace:'Backspace',
    Semicolon:';',Equal:'=',Comma:',',Minus:'-',Period:'.',
    Slash:'/',BracketLeft:'[',BracketRight:']',Backslash:'\\',
    Backquote:'`',Quote:"'",IntlBackslash:'\\',
  };
  if (CODE_TO_KEY[key]) key = CODE_TO_KEY[key];

  // Enter = replay drill when finished
  if (key === 'Enter' && app.engine.finished) {
    app.replayDrill();
    return;
  }

  app.engine.handleKey(key);
  // Clear textarea so it never accumulates text
  inputCapture.value = '';
});
