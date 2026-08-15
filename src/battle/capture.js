// Captura: lanzar orbe, probabilidad según PS restantes y catchRate.

import { SPECIES } from '../data/creatures.js';
import { GameState, registerDex, isPartyFull } from '../core/state.js';
import { createCreature } from '../data/creatures.js';

/** Probabilidad base de captura (0..1). */
export function catchChance(enemy) {
  const s = SPECIES[enemy.species];
  const rate = s ? s.catchRate : 150;
  const hpFactor = Math.max(0.1, 1 - enemy.hp / enemy.maxHp);
  const levelFactor = 1 + (5 / Math.max(1, enemy.level)) * 0.5;
  return Math.min(0.95, (rate / 255) * (0.5 + hpFactor) * levelFactor);
}

/** Intenta capturar. Devuelve { success, creature?, boxed?, message }. */
export function tryCapture(enemy) {
  if (GameState.orbs <= 0) {
    return { success: false, message: 'No te quedan orbes ámbar.' };
  }
  GameState.orbs -= 1;
  const chance = catchChance(enemy);
  if (Math.random() >= chance) {
    return { success: false, message: '¡La criatura se liberó del orbe!' };
  }
  // Capturada
  GameState.captures += 1;
  registerDex(enemy.species, true);
  const fresh = createCreature(enemy.species, enemy.level);
  if (isPartyFull()) {
    GameState.box.push(fresh);
    return { success: true, creature: fresh, boxed: true, message: '¡Capturada! Enviada al depósito (party llena).' };
  }
  GameState.party.push(fresh);
  return { success: true, creature: fresh, boxed: false, message: '¡Capturada! Se unió a tu party.' };
}
