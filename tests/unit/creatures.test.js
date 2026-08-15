// Tests de lógica de criaturas: stats, daño, efectividad de tipos, XP, evolución.
import { describe, it, expect } from 'vitest';
import {
  SPECIES, createCreature, calcDamage, typeEffectiveness,
  MOVES, xpToNext, ENCOUNTERS,
} from '../../src/data/creatures.js';

describe('creatures', () => {
  it('createCreature genera stats consistentes con el nivel', () => {
    const c = createCreature('emberkit', 5);
    expect(c.species).toBe('emberkit');
    expect(c.level).toBe(5);
    expect(c.hp).toBe(c.maxHp);
    expect(c.hp).toBeGreaterThan(0);
    expect(c.moves.length).toBeGreaterThan(0);
    expect(c.moves.length).toBeLessThanOrEqual(4);
  });

  it('los movimientos se aprenden según nivel', () => {
    const c = createCreature('emberkit', 20);
    // nivel 20 → aprende solar-flare (lv 18)
    expect(c.learnSet).toContain('solar-flare');
  });

  it('la evolución requiere nivel', () => {
    const baby = createCreature('emberkit', 5);
    expect(baby.evo).toBeTruthy();
    expect(baby.evo.lv).toBe(16);
  });

  it('efectividad de tipos: ember fuerte vs thorn, débil vs aqua', () => {
    expect(typeEffectiveness('ember', 'thorn')).toBe(2);
    expect(typeEffectiveness('ember', 'aqua')).toBe(0.5);
    expect(typeEffectiveness('ember', 'ember')).toBe(1);
  });

  it('calcDamage devuelve daño >= 1 y aplica efectividad', () => {
    const a = createCreature('emberkit', 10);
    const dThorn = createCreature('thistlehoof', 10);
    const dAqua = createCreature('dewpup', 10);
    const r1 = calcDamage(a, dThorn, 'ember-flick', () => 0.5);
    const r2 = calcDamage(a, dAqua, 'ember-flick', () => 0.5);
    expect(r1.dmg).toBeGreaterThanOrEqual(1);
    expect(r1.eff).toBe(2);
    expect(r2.eff).toBe(0.5);
    expect(r1.dmg).toBeGreaterThan(r2.dmg);
  });

  it('todas las tablas de encuentros referencian especies válidas', () => {
    for (const table of Object.values(ENCOUNTERS)) {
      for (const [id] of table) {
        expect(SPECIES[id], `especie ${id}`).toBeTruthy();
      }
    }
  });

  it('xpToNext crece con el nivel', () => {
    expect(xpToNext(2)).toBeGreaterThan(xpToNext(1));
    expect(xpToNext(10)).toBeGreaterThan(xpToNext(5));
  });
});
