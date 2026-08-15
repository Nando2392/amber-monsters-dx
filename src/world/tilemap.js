// Tilemap: mapas 2D de tiles, colisiones, zonas de hierba/agua, NPCs y puntos de transición.

// Convenciones de tiles (char):
//   '.' suelo, '#' pared/árbol, '=' agua, '^' hierba alta, 'T' tienda (puerta), 'S' casa sabio,
//   'H' casa (genérica), 'B' banco, 'F' flor, 'R' roca, 'D' puerta cerrada,
//   '@' spawn jugador, 'N' NPC (mapa guarda posición en npcs), 'G' grama decorativa, 'E' entrada cueva
export const TILE = {
  GRASS: '.', WALL: '#', WATER: '=', HIGHGRASS: '^', FLOWER: 'F', ROCK: 'R',
  TREE: 'T', BENCH: 'B', DOOR: 'D', FLOWER2: 'f', GRAVEL: 'g', WATEREDGE: '~',
};

// Un tile mide 16px en el canvas (escala 1px por pixel de matriz, sprite 16x16)
export const TILE_SIZE = 16;

export const MAPS = {
  village: {
    name: 'Aldea Ámbar',
    w: 20, h: 15,
    music: 'village',
    encounter: null,
    data: [
      '####################',
      '#...........TT.....#',
      '#....^^.....#......#',
      '#....^^.....TT.....#',
      '#....^^.....#......#',
      '#...........T......#',
      '#..SS..............#',
      '#..SS..............#',
      '#...........HH.....#',
      '#....^^.....HH.....#',
      '#....^^............#',
      '#....^^............#',
      '#...........B......#',
      '#....@@@@@@........#',
      '####################',
    ],
    npcs: [
      { id: 'orme', name: 'Orme', x: 4, y: 3, dir: 'down', talk: 'sage' },
      { id: 'nia', name: 'Nia', x: 12, y: 8, dir: 'left', talk: 'shop' },
      { id: 'brok', name: 'Brok', x: 7, y: 11, dir: 'right', talk: 'brok' },
      { id: 'pip', name: 'Pip', x: 15, y: 12, dir: 'up', talk: 'pip' },
    ],
    doors: { 8: { x: 12, y: 7, w: 2, h: 2, to: 'cave' } },  // casa con puerta a cueva
    exits: [
      { x: 10, y: 13, w: 2, h: 2, to: 'route', tx: 9, ty: 2 },
    ],
  },
  route: {
    name: 'Ruta 1',
    w: 30, h: 19,
    music: 'route',
    encounter: 'route',
    data: [
      '##############################',
      '##############################',
      '#.....^^..........^^.........#',
      '#....^^^^........^^^^........#',
      '#...^^^^^^......^^^^^^.......#',
      '#..^^^^^^^^....^^^^^^^^......#',
      '#..^^^^^^^......^^^^^^^......#',
      '#..^^^^^..........^^^^^......#',
      '#..^^^..............^^^......#',
      '#..^..................^......#',
      '#............................#',
      '#.....RR...........RR........#',
      '#....R..R..........R..R......#',
      '#....RRR...........RRR.......#',
      '#............................#',
      '#..^^^.............^^^.......#',
      '#..^^^^...........^^^^.......#',
      '#..^^^^^....@@@@....^^^^^....#',
      '##############################',
    ],
    npcs: [
      { id: 'ranger', name: 'Guardabosques Vela', x: 15, y: 10, dir: 'down', talk: 'ranger' },
    ],
    exits: [
      { x: 9, y: 2, w: 2, h: 1, to: 'village', tx: 10, ty: 12 },
      { x: 19, y: 2, w: 2, h: 1, to: 'cave', tx: 4, ty: 12 },
    ],
  },
  cave: {
    name: 'Cueva Ópalo',
    w: 24, h: 18,
    music: 'cave',
    encounter: 'cave',
    data: [
      '########################',
      '#......................#',
      '#..RR....RR....RR......#',
      '#..RR....RR....RR......#',
      '#......................#',
      '#..^^....^^....^^......#',
      '#..^^....^^....^^......#',
      '#......................#',
      '#..RR....RR....RR......#',
      '#..RR....RR....RR......#',
      '#......................#',
      '#..^^....^^....^^......#',
      '#..^^....^^....^^......#',
      '#......................#',
      '#..RR....RR....RR......#',
      '#......................#',
      '#......@@@@@...........#',
      '########################',
    ],
    npcs: [],
    exits: [
      { x: 3, y: 2, w: 2, h: 1, to: 'route', tx: 20, ty: 3 },
      { x: 15, y: 14, w: 2, h: 1, to: 'route', tx: 20, ty: 3 },
    ],
  },
};

// Cache de mapas instanciados
const _maps = new Map();

export function getMap(id) {
  if (_maps.has(id)) return _maps.get(id);
  const def = MAPS[id];
  const map = {
    id,
    name: def.name,
    w: def.w,
    h: def.h,
    music: def.music,
    encounter: def.encounter,
    tiles: def.data.map((row) => row.split('')),
    npcs: def.npcs.map((n) => ({ ...n })),
    doors: def.doors || {},
    exits: def.exits || [],
    spawn: null,
  };
  // detectar spawn '@'
  map.tiles.forEach((row, y) => row.forEach((t, x) => {
    if (t === '@') {
      map.spawn = { x, y };
      map.tiles[y][x] = '.';
    }
  }));
  _maps.set(id, map);
  return map;
}

/** ¿Es un tile sólido (no caminable)? */
export function isSolid(ch) {
  return ch === TILE.WALL || ch === TILE.WATER || ch === TILE.TREE ||
    ch === TILE.BENCH || ch === TILE.ROCK || ch === TILE.DOOR;
}

/** ¿Es hierba alta (dispara encuentros)? */
export function isHighGrass(ch) {
  return ch === TILE.HIGHGRASS;
}

export function inBounds(map, x, y) {
  return x >= 0 && y >= 0 && x < map.w && y < map.h;
}

export function tileAt(map, x, y) {
  if (!inBounds(map, x, y)) return TILE.WALL;
  return map.tiles[y][x];
}

export function isWalkable(map, x, y) {
  if (!inBounds(map, x, y)) return false;
  const t = map.tiles[y][x];
  return !isSolid(t);
}
