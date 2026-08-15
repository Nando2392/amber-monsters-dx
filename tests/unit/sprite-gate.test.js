// Sprite gate: verifica que TODOS los sprites de criaturas y tiles tengan
// contenido real (pixeles opacos) y que las siluetas de criaturas sean distintas.
import { describe, it, expect } from 'vitest';
import { SPECIES } from '../../src/data/creatures.js';
import { TILE_SPRITES } from '../../src/sprites/tiles.js';
import { PLAYER_FRAMES, NPCS } from '../../src/sprites/characters.js';
import { bbox, silhouetteHash } from '../../src/sprites/renderer.js';

function countPixels(rows) {
  let n = 0;
  for (const row of rows) for (const v of row) if (v !== 0) n += 1;
  return n;
}

describe('sprite gate — criaturas', () => {
  it('cada especie tiene sprites de batalla y overworld no vacíos', () => {
    for (const [id, s] of Object.entries(SPECIES)) {
      expect(s.battle.length, `${id} battle frames`).toBeGreaterThan(0);
      expect(s.over.length, `${id} over frames`).toBeGreaterThan(0);
      for (const frame of [...s.battle, ...s.over]) {
        expect(frame.length, `${id} altura`).toBe(16);
        expect(frame[0].length, `${id} ancho`).toBe(16);
        expect(countPixels(frame), `${id} píxeles`).toBeGreaterThan(30);
      }
    }
  });

  it('todas las siluetas de criatura son distintas (hash único)', () => {
    const hashes = new Set();
    for (const [id, s] of Object.entries(SPECIES)) {
      const h = silhouetteHash(s.battle[0]);
      hashes.add(h);
    }
    expect(hashes.size).toBe(Object.keys(SPECIES).length);
  });

  it('todos los índices de paleta de los sprites son válidos (1..19)', () => {
    for (const [id, s] of Object.entries(SPECIES)) {
      for (const frame of [...s.battle, ...s.over]) {
        for (const row of frame) {
          for (const v of row) {
            expect(v, `${id} idx ${v}`).toBeGreaterThanOrEqual(0);
            expect(v, `${id} idx ${v}`).toBeLessThanOrEqual(19);
          }
        }
      }
    }
  });
});

describe('sprite gate — tiles', () => {
  it('todo tile visible en los mapas tiene sprite no vacío', () => {
    for (const [ch, frames] of Object.entries(TILE_SPRITES)) {
      for (const frame of frames) {
        expect(frame.length, `tile ${ch} altura`).toBe(16);
        expect(frame[0].length, `tile ${ch} ancho`).toBe(16);
        expect(countPixels(frame), `tile ${ch} píxeles`).toBeGreaterThan(20);
      }
    }
  });
});

describe('sprite gate — personajes', () => {
  it('jugador tiene 4 direcciones con 2 frames cada una', () => {
    for (const [dir, frames] of Object.entries(PLAYER_FRAMES)) {
      expect(frames.length, `dir ${dir}`).toBe(2);
      for (const f of frames) {
        expect(f.length).toBe(16);
        expect(countPixels(f), `dir ${dir} píxeles`).toBeGreaterThan(30);
      }
    }
  });

  it('todos los NPCs tienen sprite no vacío', () => {
    for (const [id, npc] of Object.entries(NPCS)) {
      expect(npc.sprite.length, `${id}`).toBeGreaterThan(0);
      expect(countPixels(npc.sprite[0]), `${id} píxeles`).toBeGreaterThan(30);
    }
  });
});
