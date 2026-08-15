// Tests de batalla: turnos, daño, captura, huida.
import { describe, it, expect, beforeEach } from 'vitest';
import { Battle } from '../../src/battle/battle.js';
import { createCreature } from '../../src/data/creatures.js';
import { catchChance } from '../../src/battle/capture.js';
import { GameState } from '../../src/core/state.js';

function makeBattle(playerSp = 60, enemySp = 40) {
  const p = createCreature('emberkit', 10);
  const e = createCreature('thistlehoof', 10);
  p.spd = playerSp; e.spd = enemySp;
  return new Battle(p, e);
}

describe('Battle', () => {
  beforeEach(() => {
    GameState.orbs = 5;
    GameState.party = [createCreature('emberkit', 5)];
  });

  it('el jugador con más velocidad actúa primero', () => {
    const b1 = makeBattle(100, 10);
    expect(b1.playerFirst()).toBe(true);
    const b2 = makeBattle(10, 100);
    expect(b2.playerFirst()).toBe(false);
  });

  it('un golpe reduce el HP del enemigo y puede ganar', () => {
    const b = makeBattle();
    b.phase = 'player_menu';
    // forzar daño alto
    b.player.level = 50;
    b.player.atk = 200;
    const res = b.useMove('ember-flick');
    expect(res.hit).toBe(true);
    expect(b.enemy.hp).toBeLessThan(b.enemy.maxHp);
  });

  it('useMove fuera de fase no hace nada', () => {
    const b = makeBattle();
    b.phase = 'intro';
    const res = b.useMove('ember-flick');
    expect(res).toBeNull();
  });

  it('flee puede terminar la batalla', () => {
    const b = makeBattle(500, 1); // muy rápido → casi seguro huye
    const fled = b.flee();
    if (fled) {
      expect(b.done).toBe(true);
      expect(b.result).toBe('fled');
    }
  });

  it('captura: probabilidad mayor con menos HP', () => {
    const e = createCreature('dewpup', 5);
    const full = catchChance(e);
    e.hp = 1;
    const weak = catchChance(e);
    expect(weak).toBeGreaterThan(full);
  });
});
