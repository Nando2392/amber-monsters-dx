// Persistencia: guardado en localStorage (save slot).

import { GameState } from './state.js';

const KEY = 'amber-dx-save-v1';

export function saveGame() {
  const data = {
    mapId: GameState.map ? GameState.map.id : 'village',
    player: GameState.player ? { x: GameState.player.x, y: GameState.player.y, dir: GameState.player.dir } : null,
    party: GameState.party.map((c) => ({
      species: c.species, level: c.level, xp: c.xp, hp: c.hp, maxHp: c.maxHp,
      atk: c.atk, def: c.def, spd: c.spd, moves: c.moves, learnSet: c.learnSet,
    })),
    box: GameState.box.map((c) => ({
      species: c.species, level: c.level, xp: c.xp, hp: c.hp, maxHp: c.maxHp,
      atk: c.atk, def: c.def, spd: c.spd, moves: c.moves, learnSet: c.learnSet,
    })),
    orbs: GameState.orbs,
    potions: GameState.potions,
    badges: GameState.badges,
    dexSeen: GameState.dexSeen,
    steps: GameState.steps,
    battles: GameState.battles,
    captures: GameState.captures,
    muted: GameState.muted,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('[save]', e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    GameState.mapId = d.mapId;
    GameState.player = d.player ? { ...d.player } : null;
    GameState.party = d.party.map((c) => ({ uid: Math.random().toString(36).slice(2, 8), ...c }));
    GameState.box = (d.box || []).map((c) => ({ uid: Math.random().toString(36).slice(2, 8), ...c }));
    GameState.orbs = d.orbs ?? 5;
    GameState.potions = d.potions ?? 3;
    GameState.badges = d.badges ?? 0;
    GameState.dexSeen = d.dexSeen || {};
    GameState.steps = d.steps ?? 0;
    GameState.battles = d.battles ?? 0;
    GameState.captures = d.captures ?? 0;
    GameState.muted = d.muted ?? false;
    return true;
  } catch (e) {
    console.warn('[load]', e);
    return false;
  }
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
