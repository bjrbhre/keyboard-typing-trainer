/**
 * UI — renders the text display with cursor, colors, errors, and line breaks
 *
 * Renders all characters into the DOM. Newline characters (\n) are shown
 * as ↵ when upcoming/error, or as <br> when correctly typed.
 * Scrolls so the cursor stays on the 2nd visible line.
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
    // In free input mode, don't overwrite the textarea
    if (this._freeInputMode) return;

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
      const ch = text[i];

      // Newline characters: ↵ or <br>
      if (ch === '\n') {
        if (status === 'correct') {
          // Correctly typed newline → actual line break
          html += '<br>';
        } else {
          // Upcoming or error → show ↵ symbol
          let cls = 'char newline-char ' + status;
          if (isCursor) cls += ' cursor';
          html += `<span class="${cls}">↵</span><br>`;
        }
        continue;
      }

      let cls = 'char ' + status;
      if (isCursor) cls += ' cursor';

      const display = ch === ' ' ? '\u00A0' : ch;
      html += `<span class="${cls}">${this._escape(display)}</span>`;
    }

    this.container.innerHTML = html;
    this._scrollToCursor();
  }

  _renderFinished() {
    const stats = this.engine.getStats();
    this.container.classList.add('drill-finished');
    this.container.innerHTML = `
      <div class="drill-done">
        <div class="drill-done-title">Terminé</div>
        <div class="drill-done-stats">${stats.cpm} CPM · ${stats.successRate}% succès</div>
        <div class="drill-done-hint">Appuie sur Entrée pour un nouveau drill</div>
      </div>
    `;
  }

  showFreeTextarea() {
    this._freeInputMode = true;
    this.container.classList.remove('drill-finished');
    this.container.innerHTML = '<textarea class="free-textarea" placeholder="Tape ou colle ton texte ici…"></textarea>';
    const textarea = this.container.querySelector('.free-textarea');
    textarea.focus();
    return textarea;
  }

  showDrill() {
    this._freeInputMode = false;
    this.render();
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
