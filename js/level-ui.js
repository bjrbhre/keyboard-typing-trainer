/**
 * LevelUI — renders the level navigation bar and info
 */

import { LEVEL_SPECS, THRESHOLDS, isLevelCompleted } from './levels.js';

export class LevelUI {
  constructor(app) {
    this.app = app;
    this.navEl = document.getElementById('level-nav');
    this.infoEl = document.getElementById('level-info');
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

    this._renderInfo();
  }

  _renderInfo() {
    const spec = LEVEL_SPECS.find(s => s.id === this.app.currentLevel);
    if (!spec) return;

    // Training mode: show level name + language, no thresholds
    if (this.app.mode === 'training') {
      const langLabel = this.app.language === 'fr' ? 'Français' : 'English';
      this.infoEl.innerHTML = `
        <span class="level-name">${spec.name}</span>
        <div class="level-thresholds">
          <span class="met">${langLabel}</span>
        </div>
      `;
      return;
    }

    // Learning mode: show thresholds
    const stats = this.app.engine.getStats();
    const totalChars = this.app.engine.position;
    const successRate = stats.successRate;
    const cpm = stats.cpm;

    const charsMet = totalChars >= THRESHOLDS.minChars;
    const successMet = successRate >= THRESHOLDS.minSuccessRate;
    const cpmMet = cpm >= THRESHOLDS.minCPM;

    this.infoEl.innerHTML = `
      <span class="level-name">${spec.name}</span>
      <div class="level-thresholds">
        <span class="${charsMet ? 'met' : 'unmet'}">${totalChars}/${THRESHOLDS.minChars} chars</span> ·
        <span class="${successMet ? 'met' : 'unmet'}">${successRate}%/${THRESHOLDS.minSuccessRate}%</span> ·
        <span class="${cpmMet ? 'met' : 'unmet'}">${cpm}/${THRESHOLDS.minCPM} CPM</span>
      </div>
    `;
  }

  updateThresholds() {
    this._renderInfo();
  }

  showLevelComplete() {
    const spec = LEVEL_SPECS.find(s => s.id === this.app.currentLevel);
    this.infoEl.innerHTML = `
      <span class="level-name" style="color: var(--green);">✓ ${spec.name} — Complete!</span>
    `;
  }
}
