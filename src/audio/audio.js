// Audio procedural con Web Audio API — cero dependencias (skill game-audio).
// BGM: secuenciador step con look-ahead. SFX: osciladores one-shot.
// Mute: GainNode maestro → gain 0.

import { GameState } from '../core/state.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.currentPattern = null;
    this.nextNoteTime = 0;
    this.enabled = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = GameState.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.enabled = true;
  }

  toggleMute() {
    GameState.muted = !GameState.muted;
    if (this.master) this.master.gain.value = GameState.muted ? 0 : 1;
    return GameState.muted;
  }

  // ---------- SFX ----------
  sfx(fn) {
    if (!this.enabled) return;
    try { fn(this.ctx, this.master); } catch (e) { /* noop */ }
  }

  blip(freq = 660, dur = 0.08, type = 'square', vol = 0.15) {
    this.sfx((ctx, out) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(out);
      o.start(); o.stop(ctx.currentTime + dur + 0.02);
    });
  }

  confirm() { this.blip(880, 0.09, 'square', 0.14); }
  cancel() { this.blip(330, 0.09, 'square', 0.12); }
  move() { this.blip(440, 0.04, 'square', 0.08); }
  hit() { this.sfx((ctx, out) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    o.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime + 0.2);
  }); }
  superHit() { this.hit(); this.blip(1320, 0.1, 'triangle', 0.12); }
  faint() { this.sfx((ctx, out) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.connect(g); g.connect(out); o.start(); o.stop(ctx.currentTime + 0.55);
  }); }
  capture() {
    this.blip(520, 0.1, 'square', 0.14);
    setTimeout(() => this.blip(660, 0.1, 'square', 0.14), 120);
    setTimeout(() => this.blip(880, 0.16, 'square', 0.16), 240);
  }
  evolve() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, 'triangle', 0.16), i * 130));
  }
  heal() {
    [660, 880].forEach((f, i) => setTimeout(() => this.blip(f, 0.12, 'triangle', 0.13), i * 90));
  }
  encounter() { this.blip(120, 0.3, 'sawtooth', 0.14); this.blip(90, 0.35, 'sawtooth', 0.14); }

  // ---------- BGM ----------
  playMusic(pattern) {
    this.stopMusic();
    if (!this.enabled) return;
    this.currentPattern = pattern;
    this.bgmStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.bgmTimer = setInterval(() => this._scheduler(), 25);
  }

  stopMusic() {
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
    this.currentPattern = null;
  }

  _scheduler() {
    if (!this.enabled || !this.currentPattern || !this.ctx) return;
    const spb = 60 / this.currentPattern.bpm / 2; // corchea
    const ahead = 0.1;
    while (this.nextNoteTime < this.ctx.currentTime + ahead) {
      this._scheduleStep(this.bgmStep, this.nextNoteTime);
      this.nextNoteTime += spb;
      this.bgmStep = (this.bgmStep + 1) % this.currentPattern.steps;
    }
  }

  _noteFreq(n) {
    const midi = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[n[0]];
    const oct = parseInt(n[1], 10);
    const m = midi + (oct + 1) * 12;
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  _scheduleStep(step, t) {
    const p = this.currentPattern;
    const row = p.rows[step % p.rows.length];
    if (!row) return;
    const ch = (name, vol) => {
      const n = row[name];
      if (!n || n === '-') return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = p.wave || 'square';
      o.frequency.value = this._noteFreq(n);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + p.spbNote || t + 0.18);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + 0.2);
    };
    ch('bass', 0.10);
    ch('mel', 0.06);
    ch('arp', 0.045);
  }
}

export const audio = new AudioManager();

// ---------- Patrones BGM ----------
const villagePattern = {
  bpm: 92,
  steps: 16,
  spbNote: 0.24,
  wave: 'triangle',
  rows: [
    { bass: 'C3', mel: 'E4', arp: 'C5' },
    { bass: '-', mel: 'G4', arp: 'E5' },
    { bass: 'A2', mel: 'A4', arp: 'C5' },
    { bass: '-', mel: 'E4', arp: 'G4' },
    { bass: 'F2', mel: 'F4', arp: 'A4' },
    { bass: '-', mel: 'C4', arp: 'F4' },
    { bass: 'G2', mel: 'D4', arp: 'B4' },
    { bass: '-', mel: 'B4', arp: 'D5' },
    { bass: 'C3', mel: 'E4', arp: 'C5' },
    { bass: '-', mel: 'G4', arp: 'E5' },
    { bass: 'A2', mel: 'A4', arp: 'C5' },
    { bass: '-', mel: 'E4', arp: 'G4' },
    { bass: 'F2', mel: 'F4', arp: 'A4' },
    { bass: '-', mel: 'C4', arp: 'F4' },
    { bass: 'G2', mel: 'D4', arp: 'B4' },
    { bass: 'G2', mel: 'G3', arp: 'D4' },
  ],
};

const routePattern = {
  bpm: 112,
  steps: 16,
  spbNote: 0.2,
  wave: 'square',
  rows: [
    { bass: 'A2', mel: 'A4', arp: 'E5' },
    { bass: 'A2', mel: 'C5', arp: 'A5' },
    { bass: 'G2', mel: 'B4', arp: 'G5' },
    { bass: 'G2', mel: 'D5', arp: 'B5' },
    { bass: 'F2', mel: 'C5', arp: 'A5' },
    { bass: 'F2', mel: 'A4', arp: 'F5' },
    { bass: 'E2', mel: 'G4', arp: 'E5' },
    { bass: 'E2', mel: 'B4', arp: 'G5' },
    { bass: 'A2', mel: 'A4', arp: 'E5' },
    { bass: 'A2', mel: 'C5', arp: 'A5' },
    { bass: 'G2', mel: 'B4', arp: 'G5' },
    { bass: 'G2', mel: 'D5', arp: 'B5' },
    { bass: 'F2', mel: 'C5', arp: 'A5' },
    { bass: 'F2', mel: 'A4', arp: 'F5' },
    { bass: 'E2', mel: 'G4', arp: 'E5' },
    { bass: 'E2', mel: 'E4', arp: 'B4' },
  ],
};

const cavePattern = {
  bpm: 72,
  steps: 16,
  spbNote: 0.3,
  wave: 'sine',
  rows: [
    { bass: 'D2', mel: 'D4', arp: '-' },
    { bass: '-', mel: 'F4', arp: '-' },
    { bass: 'C2', mel: 'E4', arp: '-' },
    { bass: '-', mel: 'G4', arp: '-' },
    { bass: 'A1', mel: 'A4', arp: '-' },
    { bass: '-', mel: 'C5', arp: '-' },
    { bass: 'G1', mel: 'B4', arp: '-' },
    { bass: '-', mel: 'G4', arp: '-' },
    { bass: 'D2', mel: 'D4', arp: '-' },
    { bass: '-', mel: 'F4', arp: '-' },
    { bass: 'C2', mel: 'E4', arp: '-' },
    { bass: '-', mel: 'G4', arp: '-' },
    { bass: 'A1', mel: 'A4', arp: '-' },
    { bass: '-', mel: 'C5', arp: '-' },
    { bass: 'G1', mel: 'B4', arp: '-' },
    { bass: 'G1', mel: 'D4', arp: '-' },
  ],
};

const battlePattern = {
  bpm: 128,
  steps: 16,
  spbNote: 0.18,
  wave: 'sawtooth',
  rows: [
    { bass: 'A1', mel: 'A4', arp: 'E5' },
    { bass: 'A1', mel: 'C5', arp: 'A5' },
    { bass: 'G1', mel: 'B4', arp: 'G5' },
    { bass: 'G1', mel: 'D5', arp: 'B5' },
    { bass: 'F1', mel: 'A4', arp: 'F5' },
    { bass: 'F1', mel: 'C5', arp: 'A5' },
    { bass: 'E1', mel: 'G4', arp: 'E5' },
    { bass: 'E1', mel: 'B4', arp: 'G5' },
    { bass: 'A1', mel: 'A4', arp: 'E5' },
    { bass: 'A1', mel: 'C5', arp: 'A5' },
    { bass: 'G1', mel: 'B4', arp: 'G5' },
    { bass: 'G1', mel: 'D5', arp: 'B5' },
    { bass: 'F1', mel: 'A4', arp: 'F5' },
    { bass: 'F1', mel: 'C5', arp: 'A5' },
    { bass: 'E1', mel: 'G4', arp: 'E5' },
    { bass: 'E1', mel: 'E4', arp: 'B4' },
  ],
};

export const BGM = {
  village: villagePattern,
  route: routePattern,
  cave: cavePattern,
  battle: battlePattern,
};
