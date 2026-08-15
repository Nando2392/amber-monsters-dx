// Input: teclado → cola de eventos. El juego consume eventos por frame.
// Mapeo de teclas estilo GB: flechas / WASD, Z/Enter=confirmar, X/Esc=cancelar.

const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
  z: 'confirm', Z: 'confirm', Enter: 'confirm', ' ': 'confirm',
  x: 'cancel', X: 'cancel', Escape: 'cancel',
  p: 'party', P: 'party',
  s: 'save', S: 'save',
  m: 'mute', M: 'mute',
};

export class Input {
  constructor(target = window) {
    this.pressed = {};   // nombre -> true (fue presionado este frame)
    this.held = {};      // nombre -> true (sigue presionado)
    this.listeners = new Set();
    target.addEventListener('keydown', (e) => this._down(e));
    target.addEventListener('keyup', (e) => this._up(e));
    window.addEventListener('blur', () => this._clear());
  }

  _down(e) {
    const name = KEYMAP[e.key];
    if (!name) return;
    e.preventDefault();
    if (!this.held[name]) this.pressed[name] = true;
    this.held[name] = true;
  }

  _up(e) {
    const name = KEYMAP[e.key];
    if (!name) return;
    this.held[name] = false;
  }

  _clear() {
    this.pressed = {};
    this.held = {};
  }

  /** Llama cb cuando ocurre el evento este frame. */
  on(name, cb) {
    this.listeners.add({ name, cb });
  }

  consume() {
    // notifica listeners por evento presionado este frame
    for (const { name, cb } of this.listeners) {
      if (this.pressed[name]) {
        try { cb(name); } catch (e) { console.error('[input]', e); }
      }
    }
    this.pressed = {};
  }
}
