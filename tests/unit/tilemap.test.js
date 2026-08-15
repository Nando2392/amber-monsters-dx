// Tests de mundo: mapas bien formados, colisiones, transiciones.
import { describe, it, expect } from 'vitest';
import { MAPS, getMap, isWalkable, isSolid, tileAt, inBounds, TILE } from '../../src/world/tilemap.js';

describe('tilemap', () => {
  it('todos los mapas tienen tamaño correcto y bordes sólidos', () => {
    for (const [id, def] of Object.entries(MAPS)) {
      const map = getMap(id);
      expect(map.tiles.length, `${id} alto`).toBe(def.h);
      for (const row of map.tiles) {
        expect(row.length, `${id} ancho`).toBe(def.w);
      }
      // bordes sólidos
      for (let x = 0; x < map.w; x++) {
        expect(isSolid(map.tiles[0][x]), `${id} borde sup`).toBe(true);
        expect(isSolid(map.tiles[map.h - 1][x]), `${id} borde inf`).toBe(true);
      }
      for (let y = 0; y < map.h; y++) {
        expect(isSolid(map.tiles[y][0]), `${id} borde izq`).toBe(true);
        expect(isSolid(map.tiles[y][map.w - 1]), `${id} borde der`).toBe(true);
      }
      // spawn presente
      expect(map.spawn, `${id} spawn`).toBeTruthy();
      expect(isWalkable(map, map.spawn.x, map.spawn.y), `${id} spawn caminable`).toBe(true);
    }
  });

  it('las salidas apuntan a mapas existentes y destinos válidos', () => {
    for (const [id, def] of Object.entries(MAPS)) {
      for (const exit of def.exits) {
        expect(MAPS[exit.to], `${id} → ${exit.to}`).toBeTruthy();
        const dest = getMap(exit.to);
        expect(inBounds(dest, exit.tx, exit.ty), `${id} destino bounds`).toBe(true);
        expect(isWalkable(dest, exit.tx, exit.ty), `${id} destino caminable`).toBe(true);
      }
    }
  });

  it('toda zona de hierba alta (^) está dentro del mapa', () => {
    const map = getMap('route');
    map.tiles.forEach((row, y) => row.forEach((t, x) => {
      if (t === TILE.HIGHGRASS) {
        expect(inBounds(map, x, y)).toBe(true);
      }
    }));
  });
});
