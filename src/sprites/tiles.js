// Sprites de tiles 16x16 — generación procedural determinista (misma salida siempre).
// Produces real pixel-art tiles: hierba, árbol, agua animada, hierba alta, flor, roca, banco, puerta, grava.
// Colores: 1 outline, 2 sombra, 7 marrón, 9 turquesa (agua), 10 hierba, 11 verde oscuro,
// 14 gris (roca/grava), 15 gris osc, 17 rosa (flor), 18 celeste (brillo agua).

function blank(w = 16, h = 16) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function fillCircle(mat, cx, cy, r, color) {
  for (let y = 0; y < mat.length; y++) {
    for (let x = 0; x < mat[0].length; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) mat[y][x] = color;
    }
  }
}

function fillRect(mat, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (y >= 0 && y < mat.length && x >= 0 && x < mat[0].length) mat[y][x] = color;
    }
  }
}

function sprinkle(mat, color, points, seed = 7) {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < points; i++) {
    const x = Math.floor(rnd() * mat[0].length);
    const y = Math.floor(rnd() * mat.length);
    mat[y][x] = color;
  }
}

// ---- Hierba: base + puntitos ----
function makeGrass(seed = 1) {
  const m = blank();
  fillRect(m, 0, 0, 16, 16, 10);
  sprinkle(m, 11, 14, seed);
  return m;
}

// ---- Hierba alta: mechones oscuros verticales ----
function makeHighGrass(seed = 3) {
  const m = makeGrass(seed);
  for (let x = 1; x < 16; x += 3) {
    m[2][x] = 11; m[3][x] = 11; m[5][x] = 11; m[7][x] = 11;
    m[9][x] = 11; m[11][x] = 11; m[13][x] = 11;
  }
  for (let x = 3; x < 16; x += 4) {
    m[4][x] = 11; m[6][x] = 11; m[8][x] = 11; m[10][x] = 11; m[12][x] = 11;
  }
  return m;
}

// ---- Árbol: copa redonda + tronco ----
function makeTree() {
  const m = blank();
  fillCircle(m, 8, 5, 5, 11);      // copa base
  fillCircle(m, 8, 5, 3, 10);      // brillo copa
  fillRect(m, 7, 9, 2, 7, 7);      // tronco
  m[14][7] = 1; m[14][8] = 1;      // outline tronco
  m[12][7] = 2; m[12][8] = 2;
  return m;
}

// ---- Agua: ondas celestes en base turquesa (2 frames) ----
function makeWater(seedA = 5, seedB = 6) {
  const a = blank(); fillRect(a, 0, 0, 16, 16, 9); sprinkle(a, 18, 10, seedA);
  const b = blank(); fillRect(b, 0, 0, 16, 16, 9); sprinkle(b, 18, 10, seedB);
  return [a, b];
}

// ---- Flor: tallo + pétalos rosas ----
function makeFlower() {
  const m = makeGrass(9);
  fillRect(m, 7, 8, 1, 6, 10);      // tallo
  fillRect(m, 7, 8, 2, 1, 11);
  m[5][7] = 17; m[5][9] = 17;       // pétalos
  m[4][8] = 17; m[6][8] = 17;
  m[5][8] = 5;                      // centro
  return m;
}

// ---- Roca: montículo con sombra ----
function makeRock() {
  const m = blank();
  fillCircle(m, 8, 9, 5, 14);
  fillCircle(m, 8, 9, 4, 14);
  fillRect(m, 4, 11, 9, 3, 14);
  m[4][10] = 14; m[11][10] = 14;
  // sombra interior
  m[10][11] = 15; m[11][12] = 15; m[12][11] = 15; m[13][12] = 15;
  // outline
  for (let x = 3; x <= 12; x++) { m[7][x] = 15; }
  m[8][7] = 15; m[9][7] = 15;
  return m;
}

// ---- Banco: dos tablones + patas ----
function makeBench() {
  const m = blank();
  fillRect(m, 2, 5, 12, 2, 7);   // asiento
  fillRect(m, 3, 4, 10, 1, 16);  // respaldo
  fillRect(m, 2, 7, 2, 5, 7);    // pata izq
  fillRect(m, 12, 7, 2, 5, 7);   // pata der
  m[2][7] = 15; m[12][7] = 15;
  m[3][4] = 15; m[12][4] = 15;
  return m;
}

// ---- Puerta: madera con bisagras ----
function makeDoor() {
  const m = blank();
  fillRect(m, 0, 0, 16, 16, 7);
  fillRect(m, 2, 1, 12, 14, 16);  // panel interior
  fillRect(m, 4, 2, 8, 12, 7);    // marco central
  m[7][2] = 4; m[7][13] = 4;      // tirador ámbar
  return m;
}

// ---- Grava: gris con motas oscuras ----
function makeGravel(seed = 11) {
  const m = blank();
  fillRect(m, 0, 0, 16, 16, 14);
  sprinkle(m, 15, 16, seed);
  return m;
}

// ---- Casa (decoración 2x2, no colisiona con render de estructura) ----
function makeHouse() {
  const m = blank();
  fillRect(m, 0, 3, 16, 13, 16);   // paredes
  fillRect(m, 0, 3, 16, 4, 7);     // tejado
  fillRect(m, 6, 8, 4, 8, 15);     // puerta
  fillRect(m, 3, 6, 3, 3, 18);     // ventana
  return m;
}

export const TILE_SPRITES = {
  '.': [makeGrass(1)],
  '^': [makeHighGrass(3)],
  'F': [makeFlower()],
  'f': [makeFlower()],
  'R': [makeRock()],
  'B': [makeBench()],
  'D': [makeDoor()],
  'g': [makeGravel(11)],
  '#': [makeTree()],
  'T': [makeTree()],
  '=': makeWater(5, 6),
  'H': [makeHouse()],
  'S': [makeHouse()],
};
