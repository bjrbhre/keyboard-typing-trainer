/**
 * Engine — core typing state machine
 *
 * Tracks position, errors, typed characters.
 * Emits events that UI and stats consume.
 */

export class Engine {
  constructor(text) {
    this.text = text;
    this.position = 0;
    this.errors = new Set();
    this.typed = new Array(text.length).fill(null);
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.startTime = null;
    this.finished = false;
    this.listeners = [];
  }

  on(fn) {
    this.listeners.push(fn);
  }

  _emit(event) {
    for (const fn of this.listeners) fn(event);
  }

  handleKey(key) {
    if (this.finished) return;

    // Start timer on first keystroke
    if (this.startTime === null) {
      this.startTime = Date.now();
    }

    if (key === 'Backspace') {
      if (this.position > 0) {
        this.position--;
        this.typed[this.position] = null;
        this.errors.delete(this.position);
        this._emit({ type: 'backspace', position: this.position });
      }
      return;
    }

    // Ignore non-character keys (shift, ctrl, alt, meta, etc.)
    if (key.length !== 1) return;

    const expected = this.text[this.position];
    const correct = key === expected;

    this.totalKeystrokes++;
    this.typed[this.position] = key;

    if (correct) {
      this.correctKeystrokes++;
      this.errors.delete(this.position);
      this.typed[this.position] = key;
      this.position++;
      this._emit({ type: 'correct', position: this.position - 1, char: key });
    } else {
      this.errors.add(this.position);
      this.typed[this.position] = key;
      this.position++;
      this._emit({ type: 'error', position: this.position - 1, expected, typed: key });
    }

    // Check if finished
    if (this.position >= this.text.length) {
      this.finished = true;
      this.finishTime = Date.now();
      this._emit({ type: 'finish' });
    }
  }

  getStatus(i) {
    if (i >= this.position) return 'upcoming';
    if (this.errors.has(i)) return 'error';
    if (this.typed[i] !== null) return 'correct';
    return 'upcoming';
  }

  isCursor(i) {
    return i === this.position && !this.finished;
  }

  getStats() {
    // Freeze elapsed time once finished so CPM doesn't decay
    const endTime = this.finished ? this.finishTime : Date.now();
    const elapsed = this.startTime
      ? (endTime - this.startTime) / 1000 / 60
      : 0;

    const cpm = elapsed > 0
      ? Math.round(this.correctKeystrokes / elapsed)
      : 0;

    const successRate = this.totalKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;

    return { cpm, successRate };
  }

  reset(text) {
    if (text !== undefined) this.text = text;
    this.position = 0;
    this.errors.clear();
    this.typed = new Array(this.text.length).fill(null);
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.startTime = null;
    this.finished = false;
    this.finishTime = null;
    this._emit({ type: 'reset' });
  }
}