// UI: lógica de escenas y menús (no dibuja — render.js lo hace).
// Conecta input → acciones de juego.

import { GameState } from '../core/state.js';
import { tryMove, initWorld, talkTo, advanceTalk, facingNpc, facingDoor } from '../world/world.js';
import { Battle } from '../battle/battle.js';
import { tryCapture } from '../battle/capture.js';
import { gainXp, learnMoves, checkEvolution, applyEvolution, healParty, usePotion } from '../core/party.js';
import { saveGame } from '../core/save.js';
import { audio, BGM } from '../audio/audio.js';
import { SPECIES, MOVES } from '../data/creatures.js';
import { resetGame } from '../core/state.js';

export class UI {
  constructor(input) {
    this.input = input;
    this.cursor = 0;
    this.battleMenu = 'fight'; // fight | capture | party | flee
    this.battleCursor = 0;
    this._wire();
  }

  _wire() {
    const i = this.input;
    i.on('up', () => this._dir('up'));
    i.on('down', () => this._dir('down'));
    i.on('left', () => this._dir('left'));
    i.on('right', () => this._dir('right'));
    i.on('confirm', () => this._confirm());
    i.on('cancel', () => this._cancel());
    i.on('party', () => this._party());
    i.on('save', () => this._save());
    i.on('mute', () => audio.toggleMute());
  }

  _dir(dir) {
    const scene = GameState.scene;
    if (scene === 'overworld') { tryMove(dir); return; }
    if (scene === 'talk') return;
    if (scene === 'party' || scene === 'shop') {
      const n = scene === 'party' ? GameState.party.length : 3;
      if (dir === 'up') this.cursor = (this.cursor + n - 1) % n;
      if (dir === 'down') this.cursor = (this.cursor + 1) % n;
      audio.move();
      return;
    }
    if (scene === 'battle') {
      const b = GameState.sceneData?.battle;
      if (!b || b.phase !== 'player_menu') return;
      if (this.battleMenu === 'fight') {
        const n = b.player.moves.length;
        if (dir === 'left') this.battleCursor = Math.max(0, this.battleCursor - 1);
        if (dir === 'right') this.battleCursor = Math.min(n - 1, this.battleCursor + 1);
        if (dir === 'up') this.battleCursor = Math.max(0, this.battleCursor - 2);
        if (dir === 'down') this.battleCursor = Math.min(n - 1, this.battleCursor + 2);
        if (GameState.sceneData) GameState.sceneData.cursor = this.battleCursor;
        audio.move();
      }
    }
  }

  _confirm() {
    const scene = GameState.scene;
    if (scene === 'title') { this.startNewGame(); return; }
    if (scene === 'overworld') {
      const npc = facingNpc();
      if (npc) { talkTo(npc); audio.confirm(); return; }
      const door = facingDoor();
      if (door) {
        initWorld(door.to, { x: door.tx ?? 3, y: door.ty ?? 12 });
        audio.confirm();
        return;
      }
      return;
    }
    if (scene === 'talk') {
      if (advanceTalk()) audio.cancel();
      else audio.move();
      return;
    }
    if (scene === 'party') {
      const c = GameState.party[this.cursor];
      if (c && c.hp < c.maxHp && usePotion()) audio.heal();
      return;
    }
    if (scene === 'shop') {
      const items = ['orb', 'potion', 'exit'];
      const sel = items[this.cursor];
      if (sel === 'orb') {
        if (GameState.orbs < GameState.orbsMax) { GameState.orbs += 1; audio.confirm(); }
      } else if (sel === 'potion') {
        if (GameState.potions < GameState.potionsMax) { GameState.potions += 1; audio.confirm(); }
      } else {
        GameState.scene = 'overworld';
        GameState.sceneData = null;
        audio.cancel();
      }
      return;
    }
    if (scene === 'save') {
      if (saveGame()) audio.confirm();
      GameState.scene = 'overworld';
      GameState.sceneData = null;
      return;
    }
    if (scene === 'evolve') {
      GameState.scene = 'overworld';
      GameState.sceneData = null;
      audio.confirm();
      return;
    }
    if (scene === 'battle') this._battleConfirm();
  }

  _cancel() {
    const scene = GameState.scene;
    if (scene === 'party' || scene === 'shop' || scene === 'save' || scene === 'talk') {
      GameState.scene = 'overworld';
      GameState.sceneData = null;
      audio.cancel();
      return;
    }
    if (scene === 'battle') {
      const b = GameState.sceneData?.battle;
      if (b && b.phase === 'player_menu') {
        const menus = ['fight', 'capture', 'party', 'flee'];
        const cur = menus.indexOf(this.battleMenu);
        this.battleMenu = menus[(cur + 1) % menus.length];
        this.battleCursor = 0;
        audio.cancel();
      }
    }
  }

  _party() {
    if (GameState.scene !== 'overworld') return;
    GameState.scene = 'party';
    GameState.sceneData = { cursor: 0 };
    this.cursor = 0;
    audio.confirm();
  }

  _save() {
    if (GameState.scene !== 'overworld') return;
    GameState.scene = 'save';
    GameState.sceneData = {};
    audio.confirm();
  }

  startNewGame() {
    resetGame();
    initWorld('village');
    audio.init();
    audio.playMusic(BGM.village);
    audio.confirm();
  }

  _battleConfirm() {
    const sd = GameState.sceneData;
    if (!sd || !sd.battle) return;
    const b = sd.battle;
    if (b.phase === 'intro') {
      b.phase = 'player_menu';
      this.battleMenu = 'fight';
      this.battleCursor = 0;
      audio.confirm();
      return;
    }
    if (b.phase === 'player_menu') {
      if (this.battleMenu === 'fight') {
        const mv = b.player.moves[this.battleCursor];
        if (!mv) return;
        const res = b.useMove(mv);
        if (res?.hit) { audio.hit(); if (res.eff > 1) audio.superHit(); }
        else if (res && !res.hit) audio.cancel();
        this._afterBattleMove(b);
      } else if (this.battleMenu === 'capture') {
        this._doCapture(b);
      } else if (this.battleMenu === 'flee') {
        if (b.flee()) {
          this._endWildBattle(b);
          audio.cancel();
        } else {
          audio.cancel();
          this._enemyRespond(b);
        }
      } else if (this.battleMenu === 'party') {
        this._switchInBattle(b);
      }
    }
  }

  _doCapture(b) {
    const res = tryCapture(b.enemy);
    if (res.success) {
      audio.capture();
      this._endWildBattle(b);
    } else {
      if (GameState.sceneData) GameState.sceneData.msg = res.message;
      audio.cancel();
      this._enemyRespond(b);
    }
  }

  _switchInBattle(b) {
    const alt = GameState.party.find((c) => c.uid !== b.player.uid && c.hp > 0);
    if (!alt) {
      if (GameState.sceneData) GameState.sceneData.msg = 'No hay criaturas para cambiar.';
      return;
    }
    b.switchTo(alt);
    audio.confirm();
    this._enemyRespond(b);
  }

  _enemyRespond(b) {
    setTimeout(() => {
      if (!GameState.sceneData?.battle) return;
      b.enemyAct();
      this._afterEnemyMove(b);
    }, 450);
  }

  _afterBattleMove(b) {
    if (b.done) {
      if (b.result === 'win') this._onWin(b);
      else if (b.result === 'lose') this._onLose(b);
      return;
    }
    this._enemyRespond(b);
  }

  _afterEnemyMove(b) {
    if (b.done) {
      if (b.result === 'lose') this._onLose(b);
      return;
    }
    b.phase = 'player_menu';
    this.battleMenu = 'fight';
    this.battleCursor = 0;
  }

  _onWin(b) {
    const player = b.player;
    const enemy = b.enemy;
    const xpGain = (SPECIES[enemy.species]?.xpYield || 60) + Math.floor(enemy.level * 2);
    gainXp(player, xpGain);
    learnMoves(player);
    const evo = checkEvolution(player);
    if (evo) {
      const applied = applyEvolution(player, evo);
      if (applied) {
        GameState.scene = 'evolve';
        GameState.sceneData = { from: player.species, to: applied.species };
        audio.evolve();
        setTimeout(() => this._endWildBattle(b), 1500);
        return;
      }
    }
    this._endWildBattle(b);
  }

  _onLose(b) {
    audio.faint();
    setTimeout(() => {
      healParty();
      initWorld('village');
    }, 900);
  }

  _endWildBattle(b) {
    GameState.scene = 'overworld';
    GameState.sceneData = null;
    if (GameState.map) audio.playMusic(BGM[GameState.map.music] || BGM.village);
  }
}
