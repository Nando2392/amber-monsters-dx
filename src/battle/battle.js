// Combate por turnos: turnos por velocidad, movimientos, tipos, buffs, estado.
// Puro (sin DOM) — los tests unitarios lo cubren.

import { MOVES, TYPE_CHART, calcDamage, typeEffectiveness, createCreature, SPECIES } from '../data/creatures.js';

export const BATTLE_PHASES = {
  INTRO: 'intro',
  PLAYER_MENU: 'player_menu',
  ANIMATING: 'animating',
  ENEMY_TURN: 'enemy_turn',
  OVER: 'over',
};

export class Battle {
  constructor(playerCreature, enemyCreature, onEvent = () => {}) {
    this.player = playerCreature;
    this.enemy = enemyCreature;
    this.onEvent = onEvent;
    this.phase = BATTLE_PHASES.INTRO;
    this.turn = 0;
    this.log = [];
    this.done = false;
    this.result = null; // 'win' | 'lose' | 'fled'
    this.playerSwitching = false;
    this.enemyActed = false;
  }

  emit(type, data = {}) {
    const ev = { type, ...data };
    this.log.push(ev);
    this.onEvent(ev);
    return ev;
  }

  speedOf(c) { return c.spd; }

  /** True si el jugador actúa primero este turno. */
  playerFirst() {
    const p = this.speedOf(this.player);
    const e = this.speedOf(this.enemy);
    if (p === e) return Math.random() < 0.5;
    return p > e;
  }

  /** Ejecuta un movimiento del jugador. Devuelve el evento. */
  useMove(moveId) {
    if (this.done || this.phase !== BATTLE_PHASES.PLAYER_MENU) return null;
    const mv = MOVES[moveId];
    if (!mv) return null;
    this.turn += 1;
    this.phase = BATTLE_PHASES.ANIMATING;
    // Precisión
    if (Math.random() * 100 > mv.acc) {
      this.emit('miss', { side: 'player', move: moveId });
      this._afterPlayerAction();
      return { ev: this.log[this.log.length - 1], hit: false };
    }
    // Movimiento de buff (sin daño)
    if (mv.power === 0) {
      if (mv.buff) {
        this.player[mv.buff + 'Stage'] = Math.min(6, (this.player[mv.buff + 'Stage'] || 0) + mv.buffStage);
        this.emit('buff', { side: 'player', stat: mv.buff, stage: this.player[mv.buff + 'Stage'] });
      }
      this._afterPlayerAction();
      return { ev: this.log[this.log.length - 1], hit: true };
    }
    const { dmg, eff } = calcDamage(this.player, this.enemy, moveId);
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.emit('hit', { side: 'player', move: moveId, dmg, eff, targetHp: this.enemy.hp });
    if (this.enemy.hp <= 0) {
      this._finish('win');
    } else {
      this._afterPlayerAction();
    }
    return { ev: this.log[this.log.length - 1], hit: true, dmg, eff };
  }

  _afterPlayerAction() {
    // Turno del enemigo (si sigue vivo)
    if (this.done || this.enemy.hp <= 0) return;
    if (this.playerFirst() ? this.turn % 2 === 0 : this.turn % 2 === 1) {
      // El enemigo actúa después del jugador
      this._enemyTurn();
    } else {
      this.phase = BATTLE_PHASES.ENEMY_TURN;
    }
  }

  /** El enemigo elige y ejecuta su movimiento. */
  enemyAct() {
    if (this.done || this.phase !== BATTLE_PHASES.ENEMY_TURN) return null;
    this._enemyTurn();
    return this.log[this.log.length - 1];
  }

  _enemyTurn() {
    this.phase = BATTLE_PHASES.ANIMATING;
    const mvId = this.enemy.moves[Math.floor(Math.random() * this.enemy.moves.length)] || 'ember-flick';
    const mv = MOVES[mvId];
    if (Math.random() * 100 > mv.acc) {
      this.emit('miss', { side: 'enemy', move: mvId });
    } else if (mv.power === 0) {
      if (mv.buff) {
        this.enemy[mv.buff + 'Stage'] = Math.min(6, (this.enemy[mv.buff + 'Stage'] || 0) + mv.buffStage);
        this.emit('buff', { side: 'enemy', stat: mv.buff, stage: this.enemy[mv.buff + 'Stage'] });
      }
    } else {
      const { dmg, eff } = calcDamage(this.enemy, this.player, mvId);
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.emit('hit', { side: 'enemy', move: mvId, dmg, eff, targetHp: this.player.hp });
      if (this.player.hp <= 0) {
        this._finish('lose');
        return;
      }
    }
    // Vuelve al menú del jugador (a menos que el jugador ya haya actuado en este turno)
    if (this.playerFirst() ? this.turn % 2 === 0 : this.turn % 2 === 1) {
      this.phase = BATTLE_PHASES.PLAYER_MENU;
    }
  }

  /** Intenta huir. */
  flee() {
    if (this.done) return false;
    const chance = 0.35 + (this.player.spd - this.enemy.spd) / 200;
    if (Math.random() < Math.max(0.15, Math.min(0.9, chance))) {
      this._finish('fled');
      return true;
    }
    this.emit('flee-fail', {});
    return false;
  }

  /** Cambia de criatura del jugador. */
  switchTo(creature) {
    if (this.done || this.player.hp <= 0) return false;
    this.player = creature;
    this.emit('switch', { side: 'player', creature: creature.species });
    return true;
  }

  _finish(result) {
    this.done = true;
    this.result = result;
    this.phase = BATTLE_PHASES.OVER;
    this.emit('end', { result });
  }
}

export { typeEffectiveness, TYPE_CHART };
