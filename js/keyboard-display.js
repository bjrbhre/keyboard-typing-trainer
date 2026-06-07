/**
 * KeyboardDisplay — renders the visual keyboard with finger colors and highlight
 */

import { FINGER_COLORS } from './keyboard.js';

export class KeyboardDisplay {
  constructor(engine, layout) {
    this.engine = engine;
    this.layout = layout;
    this.container = document.getElementById('keyboard-display');
    this.highlightedKey = null;

    engine.on((event) => {
      if (['correct', 'error', 'backspace', 'reset', 'finish'].includes(event.type)) {
        this._updateHighlight();
      }
    });

    this.render();
  }

  setLayout(layout) {
    this.layout = layout;
    this.render();
    this._updateHighlight();
  }

  render() {
    const rows = this.layout.rows;
    const offsets = this.layout.offsets;
    let html = '';

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const offset = offsets[r] || 0;

      html += `<div class="kb-row" style="padding-left: ${offset * 3}rem;">`;

      for (const key of row) {
        const color = FINGER_COLORS[key.finger];
        const label = key.char === ' ' ? '' : key.char;
        const dataChar = key.char === ' ' ? ' ' : key.char;
        const widthClass = key.width > 1 ? `kb-key-wide` : '';

        html += `<div class="kb-key ${widthClass}" 
                      data-char="${this._escapeAttr(dataChar)}" 
                      style="--finger-color: ${color}; width: ${key.width * 3}rem;"
                      ${key.home ? 'data-home="true"' : ''}>
                    <span class="kb-key-label">${this._escapeHtml(label)}</span>
                    ${key.home ? '<span class="kb-home-dot"></span>' : ''}
                  </div>`;
      }

      html += '</div>';
    }

    this.container.innerHTML = html;
    this._updateHighlight();
  }

  _updateHighlight() {
    // Remove previous highlight
    const prev = this.container.querySelector('.kb-key-active');
    if (prev) prev.classList.remove('kb-key-active');

    // Find the key to highlight
    if (this.engine.position >= this.engine.text.length || this.engine.finished) return;

    const nextChar = this.engine.text[this.engine.position];
    const keyEl = this.container.querySelector(`[data-char="${CSS.escape(nextChar)}"]`);

    if (keyEl) {
      keyEl.classList.add('kb-key-active');
    }
  }

  _escapeHtml(ch) {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return ch;
    }
  }

  _escapeAttr(ch) {
    return ch.replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
  }
}
