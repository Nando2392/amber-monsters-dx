// Estado global del juego (singleton por módulo). Nada de esto se toca desde fuera
// sin pasar por los módulos que lo gestionan (state, battle, party, world).

import { SPECIES, createCreature } from '../data/creatures.js';

export const GameState = {
  // Mundo
  map: null,            // Tilemap instanciado
  player: null,         // { x, y, dir, moving, animT }
  npcs: [],             // [{ id, x, y, dir, sprite, ... }]
  overlays: {},         // { route, cave } datos de hierba/agua
  // Inventario
  orbs: 5,              // Esferas de captura
  orbsMax: 15,
  potions: 3,           // Pociones curativas
  potionsMax: 10,
  // Party
  party: [],            // [creature, ...] hasta 6
  box: [],              // criaturas guardadas
  // Progreso
  dexSeen: {},          // speciesId -> { seen, caught }
  badges: 0,
  // Métricas de sesión
  steps: 0,
  battles: 0,
  captures: 0,
  // Flujo
  scene: 'title',       // title | overworld | battle | party | shop | talk | evolve | save
  sceneData: null,
  pendingEvolve: null,  // criatura que evoluciona tras batalla
  lastPos: null,        // guardado al entrar en batalla
  // Flags
  muted: false,
  running: true,
  saveSlot: 'amber-dx-save',
  // Timers
  encounterTicks: 0,
};

export function resetGame() {
  GameState.map = null;
  GameState.player = null;
  GameState.npcs = [];
  GameState.overlays = {};
  GameState.orbs = 5;
  GameState.orbsMax = 15;
  GameState.potions = 3;
  GameState.potionsMax = 10;
  GameState.party = [createCreature('emberkit', 5)];
  GameState.box = [];
  GameState.dexSeen = {};
  GameState.badges = 0;
  GameState.steps = 0;
  GameState.battles = 0;
  GameState.captures = 0;
  GameState.scene = 'overworld';
  GameState.sceneData = null;
  GameState.pendingEvolve = null;
  GameState.lastPos = null;
  GameState.encounterTicks = 0;
  GameState.running = true;
}

/** Devuelve la primera criatura viva de la party, o null. */
export function firstAlive() {
  return GameState.party.find((c) => c.hp > 0) || null;
}

export function partyAliveCount() {
  return GameState.party.filter((c) => c.hp > 0).length;
}

export function isPartyFull() {
  return GameState.party.length >= 6;
}

/** Marca especie como vista/capturada en la dex. */
export function registerDex(speciesId, caught = false) {
  if (!GameState.dexSeen[speciesId]) GameState.dexSeen[speciesId] = { seen: 0, caught: 0 };
  GameState.dexSeen[speciesId].seen += 1;
  if (caught) GameState.dexSeen[speciesId].caught += 1;
}
