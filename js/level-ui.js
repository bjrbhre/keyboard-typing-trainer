/**
 * LevelUI — renders the level navigation bar
 */

import { LEVEL_SPECS } from './levels.js';

export class LevelUI {
  constructor(app) {
    this.app = app;
    this.navEl = document.getElementById('level-nav');
    this.render();
  }

  render() {
    const currentLevel = this.app.currentLevel;
    const completedLevels = this.app.completedLevels;
    const attemptedLevels = this.app.attemptedLevels;

    let navHtml = '';
    for (const spec of LEVEL_SPECS) {
      const isCompleted = completedLevels.includes(spec.id);
      const isAttempted = attemptedLevels.includes(spec.id);
      const isCurrent = spec.id === currentLevel;

      let cls = 'level-btn';
      if (isCurrent) cls += ' current';
      if (isCompleted) cls += ' completed';
      else if (isAttempted) cls += ' attempted';

      navHtml += `<button class="${cls}" data-level="${spec.id}">${spec.id}</button>`;
    }
    this.navEl.innerHTML = navHtml;

    // Bind click events on all level buttons
    this.navEl.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const levelId = parseInt(btn.dataset.level);
        this.app.selectLevel(levelId);
      });
    });
  }

  updateThresholds() {
    // No-op — thresholds now shown via stats coloring
  }

  showLevelComplete() {
    // No-op — completion shown via stats coloring + drill-done screen
  }
}
