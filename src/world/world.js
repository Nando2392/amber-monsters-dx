// Mundo: movimiento, colisiones, encuentros, transiciones entre mapas.
// Lógica pura donde sea posible (testable); el render lo hace render.js.

import { GameState, registerDex, firstAlive } from '../core/state.js';
import { getMap, isWalkable, isHighGrass, tileAt, TILE_SIZE, inBounds } from './tilemap.js';
import { ENCOUNTERS, SPECIES, createCreature } from '../data/creatures.js';
import { audio, BGM } from '../audio/audio.js';
import { Battle } from '../battle/battle.js';

const DIRS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/** Inicializa el mundo: mapa, jugador, NPCs. */
export function initWorld(mapId = 'village', spawn = null) {
  const map = getMap(mapId);
  GameState.map = map;
  GameState.player = {
    x: spawn ? spawn.x : map.spawn.x,
    y: spawn ? spawn.y : map.spawn.y,
    dir: 'down',
    moving: false,
    animT: 0,
  };
  GameState.npcs = map.npcs.map((n) => ({
    ...n,
    x: n.x, y: n.y, dir: n.dir || 'down',
    spriteIdx: 0, animT: 0,
  }));
  GameState.scene = 'overworld';
  audio.playMusic(BGM[map.music] || BGM.village);
  return map;
}

/** Intenta mover al jugador 1 tile en la dirección actual. Devuelve true si se movió. */
export function tryMove(dir) {
  const p = GameState.player;
  if (!p || p.moving) return false;
  p.dir = dir;
  const d = DIRS[dir];
  const nx = p.x + d.dx;
  const ny = p.y + d.dy;
  const map = GameState.map;
  if (!isWalkable(map, nx, ny)) return false;
  // colisión con NPCs
  if (GameState.npcs.some((n) => n.x === nx && n.y === ny)) return false;
  p.x = nx; p.y = ny;
  p.moving = true;
  p.animT = 0;
  GameState.steps += 1;
  // zona de encuentro
  const tile = tileAt(map, nx, ny);
  if (isHighGrass(tile)) {
    GameState.encounterTicks += 1;
    if (GameState.encounterTicks >= 12 && Math.random() < 0.18) {
      GameState.encounterTicks = 0;
      startWildEncounter();
      return true;
    }
  } else {
    GameState.encounterTicks = 0;
  }
  // transición de mapa
  checkExit(nx, ny);
  return true;
}

/** Comprueba si el jugador está en un punto de salida y cambia de mapa. */
export function checkExit(x, y) {
  const map = GameState.map;
  const exit = map.exits.find((e) => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
  if (!exit) return false;
  initWorld(exit.to, { x: exit.tx, y: exit.ty });
  return true;
}

/** Comprueba si el jugador está frente a una puerta (NPC/house). */
export function facingDoor() {
  const p = GameState.player;
  const d = DIRS[p.dir];
  const tx = p.x + d.dx, ty = p.y + d.dy;
  const t = tileAt(GameState.map, tx, ty);
  if (t === 'D') {
    const door = GameState.map.doors;
    // busca puerta en el mapa actual
    for (const [id, def] of Object.entries(door)) {
      if (def && def.to && tx >= def.x && tx < def.x + def.w && ty >= def.y && ty < def.y + def.h) {
        return def;
      }
    }
  }
  return null;
}

/** Interactúa con un NPC adyacente (jugador mirando hacia él). */
export function facingNpc() {
  const p = GameState.player;
  const d = DIRS[p.dir];
  const tx = p.x + d.dx, ty = p.y + d.dy;
  return GameState.npcs.find((n) => n.x === tx && n.y === ty) || null;
}

/** Inicia un encuentro salvaje en hierba alta o cueva. */
export function startWildEncounter() {
  const map = GameState.map;
  if (!map.encounter) return;
  const table = ENCOUNTERS[map.encounter];
  const total = table.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  let speciesId = table[0][0];
  for (const [id, w] of table) {
    roll -= w;
    if (roll <= 0) { speciesId = id; break; }
  }
  const lvl = 3 + Math.floor(Math.random() * 5) + (map.encounter === 'cave' ? 3 : 0) + (map.encounter === 'town' ? 5 : 0);
  const enemy = createCreature(speciesId, lvl);
  registerDex(speciesId, false);
  GameState.lastPos = { mapId: GameState.map.id, x: GameState.player.x, y: GameState.player.y };
  GameState.battles += 1;
  const playerCreature = firstAlive();
  if (!playerCreature) { return; } // party vacía: no se puede luchar
  const battle = new Battle(playerCreature, enemy);
  GameState.scene = 'battle';
  GameState.sceneData = { enemy, wild: true, battle };
  audio.playMusic(BGM.battle);
  audio.encounter();
}

/** Interacción con un NPC (texto/diálogo). */
export function talkTo(npc) {
  const talks = {
    sage: [
      'Orme: Bienvenido, joven viajero de la Aldea Ámbar.',
      'Orme: Más allá de la Ruta 1 acechan criaturas salvajes.',
      'Orme: Lanza un orbe ámbar cuando estén débiles para capturarlas.',
      'Orme: El Centro de Cura al norte cura a tu party gratis. ¡Ve con el guardabosques Vela!',
    ],
    shop: [
      'Nia: ¡Hola! ¿Necesitas orbes ámbar o pociones?',
      'Nia: Entra por la puerta de la tienda (norte) y llévate lo que quieras. ¡Gratis!',
      'Nia: Pulsa P para ver tu party y usar pociones en cualquier momento.',
    ],
    brok: [
      'Brok: La Cueva Ópalo guarda criaturas raras.',
      'Brok: La puerta de esa casa (al este) lleva directo a la cueva.',
      'Brok: Pero ten cuidado con los espectros…',
    ],
    pip: [
      'Pip: ¡Mi Emberkit es el mejor!',
      'Pip: ¿Cuántas criaturas has capturado tú?',
      'Pip: ¡Hay un pueblo más allá de la Ruta 1! Se llama Pueblo Amatista.',
    ],
    ranger: [
      'Vela: Soy el guardabosques de la Ruta 1.',
      'Vela: Entrena a tu party combatiendo en la hierba alta.',
      'Vela: Si vences criaturas, ganan experiencia y evolucionan.',
      'Vela: Al norte de esta ruta está Pueblo Amatista, con criaturas de nivel alto.',
    ],
    mayor: [
      'Alcalde Loto: Bienvenido a Pueblo Amatista, el pueblo más allá de la Ruta 1.',
      'Alcalde Loto: Nuestras hierbas guardan criaturas raras y poderosas.',
      'Alcalde Loto: Descansa en mi casa o compra en la tienda del norte.',
    ],
    shop2: [
      'Vendedor: Bienvenido a la tienda de Pueblo Amatista.',
      'Vendedor: Orbes y pociones para los que se atreven con la hierba alta.',
      'Vendedor: La puerta de la tienda está al norte. ¡Todo gratis!',
    ],
  };
  const lines = talks[npc.talk] || ['…'];
  GameState.scene = 'talk';
  GameState.sceneData = { npc, lines, idx: 0 };
}

/** Avanza un diálogo; devuelve true si se cerró. */
export function advanceTalk() {
  const d = GameState.sceneData;
  if (!d || d.idx >= d.lines.length - 1) {
    GameState.scene = 'overworld';
    GameState.sceneData = null;
    return true;
  }
  d.idx += 1;
  return false;
}
