// main.js — bootstrap, game loop y API de debug (para gates de Playwright).
import { GameState, resetGame, firstAlive } from './core/state.js';
import { Input } from './core/input.js';
import { Renderer } from './ui/renderer.js';
import { UI } from './ui/ui.js';
import { initWorld, startWildEncounter } from './world/world.js';
import { audio, BGM } from './audio/audio.js';
import { createCreature } from './data/creatures.js';
import { Battle } from './battle/battle.js';
import { saveGame, loadGame, hasSave, clearSave } from './core/save.js';

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const input = new Input(window);
const ui = new UI(input);

let lastTime = 0;

function loop(t) {
  const dt = t - lastTime;
  lastTime = t;
  // animación de entidades en overworld
  if (GameState.scene === 'overworld' && GameState.player) {
    if (GameState.player.moving) {
      GameState.player.animT += dt;
      if (GameState.player.animT >= 180) {
        GameState.player.moving = false;
        GameState.player.animT = 0;
      }
    }
    GameState.npcs.forEach((n) => {
      n.animT += dt;
      n.spriteIdx = Math.floor(n.animT / 400) % 2;
    });
  }
  input.consume();
  renderer.frame(t);
  requestAnimationFrame(loop);
}

// --- Arranque ---
function boot() {
  GameState.scene = 'title';
  // si hay partida guardada, mostrar "continuar" en el título
  audio.init(); // AudioContext en espera (se resume con gesto)
  requestAnimationFrame(loop);
}

boot();

// --- API de debug (expuesta en window para gates e2e) ---
window.AMBER = {
  state: () => ({
    scene: GameState.scene,
    map: GameState.map?.id,
    player: GameState.player ? { x: GameState.player.x, y: GameState.player.y, dir: GameState.player.dir } : null,
    party: GameState.party.map((c) => ({ species: c.species, level: c.level, hp: c.hp, maxHp: c.maxHp })),
    box: GameState.box.map((c) => ({ species: c.species, level: c.level })),
    orbs: GameState.orbs,
    potions: GameState.potions,
    steps: GameState.steps,
    battles: GameState.battles,
    captures: GameState.captures,
    badges: GameState.badges,
    dexSeen: GameState.dexSeen,
    muted: GameState.muted,
    panel: GameState.sceneData?.panel ?? null,
    cursor: GameState.sceneData?.cursor ?? null,
    msg: GameState.sceneData?.msg ?? null,
  }),
  newGame: () => {
    resetGame();
    initWorld('village');
    GameState.scene = 'overworld';
    audio.init();
    audio.playMusic(BGM[GameState.map.music] || BGM.village);
  },
  startBattle: (species = 'thistlehoof', level = 5) => {
    if (GameState.scene !== 'overworld') return;
    const enemy = createCreature(species, level);
    const playerCreature = firstAlive();
    if (!playerCreature) return;
    const battle = new Battle(playerCreature, enemy);
    GameState.lastPos = { mapId: GameState.map.id, x: GameState.player.x, y: GameState.player.y };
    GameState.battles += 1;
    GameState.scene = 'battle';
    GameState.sceneData = { enemy, wild: true, battle };
    audio.playMusic(BGM.battle);
  },
  toRoute: () => initWorld('route'),
  toCave: () => initWorld('cave'),
  save: () => saveGame(),
  load: () => {
    const ok = loadGame();
    if (ok) initWorld(GameState.mapId || 'village');
    return ok;
  },
  hasSave: () => hasSave(),
  clearSave: () => clearSave(),
  healParty: () => {
    GameState.party.forEach((c) => { c.hp = c.maxHp; });
  },
  giveOrbs: (n = 5) => { GameState.orbs = Math.min(GameState.orbsMax, GameState.orbs + n); },
  givePotions: (n = 3) => { GameState.potions = Math.min(GameState.potionsMax, GameState.potions + n); },
  setPotions: (n = 0) => { GameState.potions = Math.max(0, Math.min(GameState.potionsMax, n)); },
  setSpecies: (idx, species, level) => {
    if (idx >= 0 && idx < GameState.party.length) {
      GameState.party[idx] = createCreature(species, level);
    }
  },
  winBattle: () => {
    const sd = GameState.sceneData;
    if (sd?.battle) sd.battle.enemy.hp = 0;
  },
  weakenEnemy: () => {
    const sd = GameState.sceneData;
    if (sd?.battle) sd.battle.enemy.hp = Math.max(1, Math.floor(sd.battle.enemy.maxHp * 0.08));
  },
  damagePlayer: (n = 20) => {
    const sd = GameState.sceneData;
    if (sd?.battle) sd.battle.player.hp = Math.max(1, sd.battle.player.hp - n);
  },
  loseBattle: () => {
    const sd = GameState.sceneData;
    if (sd?.battle) sd.battle.player.hp = 0;
  },
};
