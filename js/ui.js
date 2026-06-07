/**
 * UI — renders the text display with cursor, colors, and errors
 *
 * Renders all characters into the DOM, then scrolls the container
 * so the cursor stays on the 2nd visible line — the browser handles
 * line-wrapping, so no CHARS_PER_LINE guesswork needed.
 */

export class TextDisplay {
  constructor(engine) {
    this.engine = engine;
    this.container = document.getElementById('text-display');

    engine.on((event) => {
      if (['correct', 'error', 'backspace', 'reset', 'finish'].includes(event.type)) {
        this.render();
      }
    });

    this.render();
  }

  render() {
    const text = this.engine.text;

    if (this.engine.finished) {
      this._renderFinished();
      return;
    }

    this.container.classList.remove('drill-finished');

    let html = '';
    for (let i = 0; i < text.length; i++) {
      const status = this.engine.getStatus(i);
      const isCursor = this.engine.isCursor(i);

      let cls = 'char ' + status;
      if (isCursor) cls += ' cursor';

      let ch = text[i];
      if (ch === ' ') ch = '\u00A0';

      html += `<span class="${cls}">${this._escape(ch)}</span>`;
    }

    this.container.innerHTML = html;
    this._scrollToCursor();
  }

  _renderFinished() {
    const stats = this.engine.getStats();
    this.container.classList.add('drill-finished');
    this.container.innerHTML = `
      <div class="drill-done">
        <div class="drill-done-title">Drill terminé</div>
        <div class="drill-done-stats">${stats.cpm} CPM · ${stats.successRate}% succès</div>
        <div class="drill-done-hint">Appuie sur Entrée pour un nouveau drill</div>
      </div>
    `;
  }

  _scrollToCursor() {
    const cursorEl = this.container.querySelector('.cursor');
    if (!cursorEl) return;

    const containerRect = this.container.getBoundingClientRect();
    const cursorRect = cursorEl.getBoundingClientRect();

    // Cursor position relative to the scrollable content
    const cursorRelTop = cursorRect.top - containerRect.top + this.container.scrollTop;

    // Line height in pixels (computed from CSS line-height)
    const lineHeight = parseFloat(getComputedStyle(this.container).lineHeight);

    // Keep cursor on the 2nd visible line (1 line of context above)
    this.container.scrollTop = Math.max(0, cursorRelTop - lineHeight);
  }

  _escape(ch) {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return ch;
    }
  }
}
