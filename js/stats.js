/**
 * Stats — real-time display of CPM and success rate
 */

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
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
  }
}