// Party: XP, subida de nivel, evolución, curación, cura total, uso de pociones.

import { SPECIES, createCreature, xpToNext } from '../data/creatures.js';
import { GameState, firstAlive, registerDex } from '../core/state.js';

const LEVEL_CURVE = (lv) => Math.floor(Math.pow(lv, 1.6) * 18) + 20;

/** Suma XP a una criatura; devuelve la lista de subidas de nivel. */
export function gainXp(creature, amount) {
  const levels = [];
  creature.xp += amount;
  let guard = 0;
  while (creature.xp >= creature.xpNext && creature.level < 100 && guard < 50) {
    creature.level += 1;
    creature.xp -= creature.xpNext;
    creature.xpNext = xpToNext(creature.level);
    // subir stats
    const b = SPECIES[creature.species].base;
    const oldMax = creature.maxHp;
    const lvl = creature.level;
    creature.maxHp = Math.floor((b.hp * 2 * lvl) / 100) + lvl + 12;
    creature.hp += creature.maxHp - oldMax;
    creature.atk = Math.floor((b.atk * 2 * lvl) / 100) + 5;
    creature.def = Math.floor((b.def * 2 * lvl) / 100) + 5;
    creature.spd = Math.floor((b.spd * 2 * lvl) / 100) + 5;
    levels.push(creature.level);
    guard += 1;
  }
  return levels;
}

/** Aprende un movimiento nuevo si el nivel lo permite (máx 4). */
export function learnMoves(creature) {
  const s = SPECIES[creature.species];
  const learned = [];
  for (const entry of s.moves) {
    if (entry.lv <= creature.level && !creature.learnSet.includes(entry.move)) {
      creature.learnSet.push(entry.move);
      if (creature.moves.length < 4) {
        creature.moves.push(entry.move);
      } else {
        // reemplaza el primero (política simple)
        creature.moves.shift();
        creature.moves.push(entry.move);
      }
      learned.push(entry.move);
    }
  }
  return learned;
}

/** Comprueba evolución. Devuelve la nueva criatura si evoluciona. */
export function checkEvolution(creature) {
  const s = SPECIES[creature.species];
  if (!s.evo) return null;
  if (creature.level < s.evo.lv) return null;
  if (GameState.pendingEvolve && GameState.pendingEvolve.uid === creature.uid) return null;
  const evolved = createCreature(s.evo.to, creature.level);
  // preservar HP proporcional, XP y movimientos
  const hpRatio = creature.hp / creature.maxHp;
  evolved.maxHp = Math.floor((SPECIES[s.evo.to].base.hp * 2 * creature.level) / 100) + creature.level + 12;
  evolved.hp = Math.max(1, Math.round(evolved.maxHp * hpRatio));
  evolved.xp = creature.xp;
  evolved.xpNext = xpToNext(creature.level);
  evolved.learnSet = [...creature.learnSet];
  evolved.moves = [...creature.moves];
  return evolved;
}

/** Aplica la evolución (reemplaza en party/box). */
export function applyEvolution(oldCreature, newCreature) {
  const partyIdx = GameState.party.findIndex((c) => c.uid === oldCreature.uid);
  if (partyIdx >= 0) {
    GameState.party[partyIdx] = newCreature;
    registerDex(newCreature.species, true);
    return newCreature;
  }
  const boxIdx = GameState.box.findIndex((c) => c.uid === oldCreature.uid);
  if (boxIdx >= 0) {
    GameState.box[boxIdx] = newCreature;
    registerDex(newCreature.species, true);
    return newCreature;
  }
  return null;
}

/** Cura una criatura al máximo. */
export function heal(creature) {
  creature.hp = creature.maxHp;
  creature.defStage = 0;
  creature.atkStage = 0;
  return creature;
}

/** Cura toda la party. */
export function healParty() {
  GameState.party.forEach(heal);
}

/** Usa una poción sobre la primera criatura herida. Devuelve true si se usó. */
export function usePotion() {
  if (GameState.potions <= 0) return false;
  const target = GameState.party.find((c) => c.hp < c.maxHp);
  if (!target) return false;
  GameState.potions -= 1;
  target.hp = Math.min(target.maxHp, target.hp + 40);
  return true;
}
