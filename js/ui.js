/**
 * UI — renders the text display with cursor, colors, and errors
 *
 * Renders all text but the container clips to 2 lines with overflow hidden.
 * We track which line the cursor is on and only render from the start of
 * the previous line, giving a natural scrolling feel.
 */

const CHARS_PER_LINE = 50;

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
    const pos = this.engine.position;

    // Figure out which "line" the cursor is on
    const cursorLine = Math.floor(pos / CHARS_PER_LINE);

    // Start rendering from one line before the cursor line
    const startLine = Math.max(0, cursorLine - 1);
    const renderStart = startLine * CHARS_PER_LINE;

    // Render 3 lines worth (previous, current, next)
    const renderEnd = Math.min(text.length, renderStart + CHARS_PER_LINE * 3);

    let html = '';
    for (let i = renderStart; i < renderEnd; i++) {
      const status = this.engine.getStatus(i);
      const isCursor = this.engine.isCursor(i);

      let cls = 'char ' + status;
      if (isCursor) cls += ' cursor';

      let ch = text[i];
      if (ch === ' ') ch = '\u00A0';

      html += `<span class="${cls}">${this._escape(ch)}</span>`;
    }

    this.container.innerHTML = html;
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
