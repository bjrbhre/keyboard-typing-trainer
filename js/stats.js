/**
 * Stats — real-time display of CPM and success rate with color coding
 *
 * Colors reflect how current performance compares to level thresholds:
 * - Green: meeting or exceeding thresholds
 * - Peach (orange): close but not yet there
 * - Red: far from threshold
 */

import { THRESHOLDS } from './levels.js';

export class StatsDisplay {
  constructor(engine) {
    this.engine = engine;
    this.cpmEl = document.getElementById('stat-cpm');
    this.successEl = document.getElementById('stat-success');
    this.interval = null;

    engine.on((event) => {
      if (event.type === 'reset') this._update();
    });

    this._startLoop();
  }

  _startLoop() {
    this.interval = setInterval(() => this._update(), 200);
  }

  _update() {
    const { cpm, successRate } = this.engine.getStats();
    this.cpmEl.textContent = cpm;
    this.successEl.textContent = successRate;

    // Color code based on thresholds
    this.cpmEl.style.color = this._cpmColor(cpm);
    this.successEl.style.color = this._successColor(successRate);
  }

  _cpmColor(cpm) {
    if (cpm >= THRESHOLDS.minCPM) return 'var(--green)';        // ≥ 20 CPM
    if (cpm >= THRESHOLDS.minCPM * 0.5) return 'var(--peach)';  // ≥ 10 CPM
    if (cpm > 0) return 'var(--red)';                            // < 10 CPM
    return 'var(--green)';                                       // 0 (idle)
  }

  _successColor(rate) {
    if (rate >= THRESHOLDS.minSuccessRate) return 'var(--green)';        // ≥ 90%
    if (rate >= THRESHOLDS.minSuccessRate - 15) return 'var(--peach)';   // ≥ 75%
    return 'var(--red)';                                                  // < 75%
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
