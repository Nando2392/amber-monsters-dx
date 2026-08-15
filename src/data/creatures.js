// ============================================================
// AMBER MONSTERS DX — criaturas originales
// 6 especies salvajes + 2 evoluciones (2 líneas evolutivas).
// Sprites: matrices 16x16 de índices de paleta (game-assets).
// Siluetas diseñadas para ser DISTINTAS entre sí:
//   zorro sentado / nutria redonda / ciervo esbelto /
//   polilla alada / escarabajo acorazado / espectro flotante
// ============================================================

// ---- Tipos (triada cíclica x2, balanceada) ----
// ember > thorn > aqua > ember ; glimmer > wisp > boulder > glimmer

export const TYPE_CHART = {
  ember:   { strong: ['thorn'],        weak: ['aqua'] },
  aqua:    { strong: ['ember'],        weak: ['thorn'] },
  thorn:   { strong: ['aqua'],         weak: ['ember'] },
  glimmer: { strong: ['wisp'],         weak: ['boulder'] },
  boulder: { strong: ['glimmer'],      weak: ['wisp'] },
  wisp:    { strong: ['boulder'],      weak: ['glimmer'] },
};

export const TYPE_LABEL = {
  ember: 'ÍGNEO', aqua: 'AQUA', thorn: 'ESPINA',
  glimmer: 'LUMEN', boulder: 'ROCA', wisp: 'ESPECTRO',
};

export const TYPE_COLOR = {
  ember: '#ff5a4e', aqua: '#3fd6c2', thorn: '#79d94a',
  glimmer: '#7fd6ff', boulder: '#9aa5b1', wisp: '#c084fc',
};

// ---- Movimientos ----
export const MOVES = {
  'ember-flick':    { name: 'Golpe Ígneo',  type: 'ember',   power: 40, acc: 100 },
  'flame-whirl':    { name: 'Remolino Fuego', type: 'ember', power: 60, acc: 90 },
  'cinder-dash':    { name: 'Brasa Veloz',  type: 'ember',   power: 35, acc: 100 },
  'solar-flare':    { name: 'Llamarada Solar', type: 'ember', power: 90, acc: 85 },
  'bubble-burst':   { name: 'Estallido Burbuja', type: 'aqua', power: 40, acc: 100 },
  'tidal-slam':     { name: 'Marejada',     type: 'aqua',    power: 65, acc: 90 },
  'torrent-crush':  { name: 'Embate Torrente', type: 'aqua', power: 90, acc: 85 },
  'aqua-shield':    { name: 'Escudo Acuoso', type: 'aqua',   power: 0, acc: 100, buff: 'def', buffStage: 1 },
  'thorn-tackle':   { name: 'Zarpa Espina',  type: 'thorn',  power: 40, acc: 100 },
  'leaf-blade':     { name: 'Hoja Cortante', type: 'thorn',  power: 60, acc: 95 },
  'petal-storm':    { name: 'Tormenta Pétala', type: 'thorn', power: 80, acc: 90 },
  'spark-dust':     { name: 'Polvo Lumen',   type: 'glimmer', power: 40, acc: 100 },
  'moon-ray':       { name: 'Rayo Lunar',    type: 'glimmer', power: 65, acc: 95 },
  'rock-smash':     { name: 'Roca Quebranta', type: 'boulder', power: 45, acc: 100 },
  'boulder-roll':   { name: 'Rueda Pétrea',  type: 'boulder', power: 60, acc: 90 },
  'stone-guard':    { name: 'Muro Roca',     type: 'boulder', power: 0, acc: 100, buff: 'def', buffStage: 1 },
  'ghost-shriek':   { name: 'Alarido Espectral', type: 'wisp', power: 40, acc: 100 },
  'shadow-veil':    { name: 'Velo Sombrío',  type: 'wisp',   power: 60, acc: 90, debuff: 'def', debuffStage: 1 },
};

// ---- Sprites ----
// Convención de índices de paleta (palette.js):
//   1 outline, 2 sombra, 3 rojo, 4 ámbar, 5 amarillo claro, 6 piel crema,
//   7 marrón, 8 blanco, 9 turquesa, 10 verde, 11 verde osc, 12 índigo,
//   13 púrpura, 14 gris, 15 gris osc, 16 marrón claro, 17 rosa, 18 celeste, 19 púrpura osc

// ---- EMBERKIT: cachorro zorro ígneo (cuadrúpedo sentado, orejas puntiagudas, cola rizada) ----
const EMBERKIT_A = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,1,1,4,4,4,4,4,4,1,1,0,0,0],
  [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
  [0,0,0,1,4,4,5,5,5,5,4,4,1,0,0,0],
  [0,0,0,0,1,4,5,1,6,1,5,1,0,0,0,0],
  [0,0,0,0,1,4,6,6,6,6,4,1,0,0,0,0],
  [0,0,0,0,0,1,4,4,1,4,4,1,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,4,1,0,0,0,0],
  [0,0,0,0,1,4,6,4,4,4,6,4,1,0,0,0],
  [0,0,0,0,1,4,6,4,4,4,6,4,1,0,0,0],
  [0,0,0,1,4,4,4,4,4,4,4,4,4,1,0,0],
  [0,0,1,4,4,4,4,4,4,4,4,4,4,4,1,0],
  [0,0,1,4,4,4,2,4,4,2,4,4,2,4,1,0],
  [0,0,0,1,1,1,0,1,1,0,1,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
// frame 2: pata delantera adelantada + cola levantada
const EMBERKIT_B = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
  [0,0,0,1,1,4,4,4,4,4,4,1,1,0,0,0],
  [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
  [0,0,0,1,4,4,5,5,5,5,4,4,1,0,0,0],
  [0,0,0,0,1,4,5,1,6,1,5,1,0,0,0,0],
  [0,0,0,0,1,4,6,6,6,6,4,1,0,0,0,0],
  [0,0,0,0,0,1,4,4,1,4,4,1,0,0,0,0],
  [0,0,0,0,0,1,4,4,4,4,4,1,0,0,0,0],
  [0,0,0,0,1,4,6,4,4,4,6,4,1,0,0,0],
  [0,0,0,0,1,4,6,4,4,4,6,4,1,0,0,0],
  [0,0,0,1,4,4,4,4,4,4,4,4,4,1,0,0],
  [0,0,1,4,4,4,4,4,4,4,4,4,4,4,1,0],
  [0,1,1,4,4,2,1,1,4,4,2,4,4,2,4,1],
  [0,0,1,1,0,0,0,0,1,1,0,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ---- DEWPUP: cría de nutria acuática (cuerpo redondo, aletas, vientre crema) ----
const DEWPUP_A = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,9,9,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,0,1,2,9,8,1,9,1,8,9,2,1,0,0],
  [0,0,0,1,9,9,9,9,9,9,9,9,1,0,0,0],
  [0,0,0,1,9,6,6,6,6,6,6,9,1,0,0,0],
  [0,0,0,1,9,6,6,6,6,6,6,9,1,0,0,0],
  [0,0,1,2,9,6,1,1,1,1,6,9,2,1,0,0],
  [0,0,1,9,9,9,6,6,6,6,9,9,9,1,0,0],
  [0,0,1,2,9,9,9,9,9,9,9,9,2,1,0,0],
  [0,0,0,1,2,9,9,9,9,9,9,2,1,0,0,0],
  [0,0,0,0,1,9,9,2,2,9,9,1,0,0,0,0],
  [0,0,0,0,1,9,1,9,9,1,9,1,0,0,0,0],
  [0,0,0,0,1,1,0,9,9,0,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];
const DEWPUP_B = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,2,9,9,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,0,1,2,9,8,1,9,1,8,9,2,1,0,0],
  [0,0,0,1,9,9,9,9,9,9,9,9,1,0,0,0],
  [0,0,0,1,9,6,6,6,6,6,6,9,1,0,0,0],
  [0,0,0,1,9,6,6,6,6,6,6,9,1,0,0,0],
  [0,0,1,2,9,6,1,1,1,1,6,9,2,1,0,0],
  [0,0,1,9,9,9,6,6,6,6,9,9,9,1,0,0],
  [0,0,1,2,9,9,9,9,9,9,9,9,2,1,0,0],
  [0,0,0,1,2,9,9,9,9,9,9,2,1,0,0,0],
  [0,0,0,0,1,9,9,2,2,9,9,1,0,0,0,0],
  [0,0,0,0,0,1,9,1,9,1,9,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,9,0,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
];

// ---- THISTLEHOOF: cervatillo de espinas (cuello largo, cornamenta con hojas, patas finas) ----
const THISTLEHOOF_A = [
  [0,0,0,0,1,7,1,1,7,1,0,0,0,0,0,0],
  [0,0,0,1,11,1,1,1,11,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,16,16,16,1,0,0,0,0,0,0],
  [0,0,0,0,1,16,1,16,1,16,1,0,0,0,0,0],
  [0,0,0,0,0,1,16,6,16,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,6,6,6,1,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,1,0,0,0,0,0],
  [0,0,0,0,1,1,6,6,6,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,16,6,16,1,0,0,0,0,0,0],
  [0,0,0,1,1,16,16,16,16,16,1,1,0,0,0,0],
  [0,0,1,16,16,16,16,16,16,16,16,16,1,0,0,0],
  [0,0,1,16,10,16,16,16,16,10,16,16,1,0,0,0],
  [0,0,0,1,7,7,1,1,7,7,1,0,0,0,0,0],
  [0,0,0,1,7,7,1,1,7,7,1,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],
];
const THISTLEHOOF_B = [
  [0,0,0,0,1,7,1,1,7,1,0,0,0,0,0,0],
  [0,0,0,1,11,1,1,1,11,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,16,16,16,1,0,0,0,0,0,0],
  [0,0,0,0,1,16,1,16,1,16,1,0,0,0,0,0],
  [0,0,0,0,0,1,16,6,16,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,6,6,6,1,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,1,0,0,0,0,0],
  [0,0,0,0,1,1,6,6,6,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,16,6,16,1,0,0,0,0,0,0],
  [0,0,0,1,1,16,16,16,16,16,1,1,0,0,0,0],
  [0,0,1,16,16,16,16,16,16,16,16,16,1,0,0,0],
  [0,1,1,16,10,16,16,16,16,10,16,16,1,0,0,0],
  [0,1,1,7,7,1,0,0,1,7,7,1,0,0,0,0],
  [0,0,1,7,7,1,0,0,1,7,7,1,0,0,0,0],
  [0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0],
];

// ---- GLIMMERWING: polilla luminosa (alas anchas, cuerpo esbelto, antenas) ----
const GLIMMERWING_A = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,18,1,1,18,1,0,0,0,0,0],
  [0,1,1,1,0,1,13,13,13,13,1,0,1,1,1,0],
  [1,13,13,13,1,13,13,13,13,13,13,1,13,13,13,1],
  [1,13,13,13,13,13,13,13,13,13,13,13,13,13,13,1],
  [1,13,9,13,13,13,13,13,13,13,13,13,13,9,13,1],
  [0,1,13,13,13,13,8,1,1,8,13,13,13,13,1,0],
  [0,0,1,13,13,13,6,6,6,6,13,13,13,1,0,0],
  [0,0,0,1,13,13,6,6,6,6,13,13,1,0,0,0],
  [0,0,0,0,1,13,6,6,6,6,13,1,0,0,0,0],
  [0,0,0,0,1,13,13,6,6,13,13,1,0,0,0,0],
  [0,0,0,0,0,1,13,13,13,13,1,0,0,0,0,0],
  [0,0,0,0,0,1,13,1,1,13,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,13,13,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
const GLIMMERWING_B = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,18,1,1,18,1,0,0,0,0,0],
  [0,0,0,1,1,1,13,13,13,13,1,1,1,0,0,0],
  [0,0,1,13,13,13,13,13,13,13,13,13,13,1,0,0],
  [0,1,13,13,13,13,13,13,13,13,13,13,13,13,1,0],
  [0,1,13,9,13,13,13,13,13,13,13,13,9,13,1,0],
  [0,0,1,13,13,13,8,1,1,8,13,13,13,1,0,0],
  [0,0,0,1,13,13,6,6,6,6,13,13,1,0,0,0],
  [0,0,0,0,1,13,6,6,6,6,13,1,0,0,0,0],
  [0,0,0,0,1,13,13,6,6,13,13,1,0,0,0,0],
  [0,0,0,0,0,1,13,13,13,13,1,0,0,0,0,0],
  [0,0,0,0,0,1,13,1,1,13,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,13,13,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ---- BOULDERK: escarabajo acorazado (cúpula ancha y baja, placas de roca, cabeza pequeña) ----
const BOULDERK_A = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,14,14,14,14,1,0,0,0,0,0],
  [0,0,0,0,1,14,14,15,15,14,14,1,0,0,0,0],
  [0,0,0,1,14,14,15,8,8,15,14,14,1,0,0,0],
  [0,0,1,14,14,15,15,14,14,15,15,14,14,1,0,0],
  [0,0,1,14,15,14,14,14,14,14,14,15,14,1,0,0],
  [0,0,1,15,14,14,14,14,14,14,14,14,15,1,0,0],
  [0,0,1,14,15,14,14,2,2,14,14,15,14,1,0,0],
  [0,1,14,14,15,15,15,15,15,15,15,15,14,14,1,0],
  [1,2,14,14,14,14,14,14,14,14,14,14,14,14,2,1],
  [1,15,15,15,15,15,15,15,15,15,15,15,15,15,15,1],
  [0,1,14,1,1,14,14,1,1,14,14,1,1,14,1,0],
  [0,0,1,15,15,1,1,15,15,1,1,15,15,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
const BOULDERK_B = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,14,14,14,14,1,0,0,0,0,0],
  [0,0,0,0,1,14,14,15,15,14,14,1,0,0,0,0],
  [0,0,0,1,14,14,15,8,8,15,14,14,1,0,0,0],
  [0,0,1,14,14,15,15,14,14,15,15,14,14,1,0,0],
  [0,0,1,14,15,14,14,14,14,14,14,15,14,1,0,0],
  [0,0,1,15,14,14,14,14,14,14,14,14,15,1,0,0],
  [0,0,1,14,15,14,14,2,2,14,14,15,14,1,0,0],
  [0,1,14,14,15,15,15,15,15,15,15,15,14,14,1,0],
  [1,2,14,14,14,14,14,14,14,14,14,14,14,14,2,1],
  [1,15,15,15,15,15,15,15,15,15,15,15,15,15,15,1],
  [0,1,14,1,1,14,14,1,1,14,14,1,1,14,1,0],
  [0,0,1,15,15,0,1,15,15,1,0,15,15,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ---- WISPIT: espectro flotante (lágrima, base ondeante, sin patas) ----
const WISPIT_A = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,13,13,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,13,18,18,13,1,0,0,0,0,0],
  [0,0,0,0,0,1,13,13,13,13,1,0,0,0,0,0],
  [0,0,0,0,1,13,13,13,13,13,13,1,0,0,0,0],
  [0,0,0,1,13,13,13,13,13,13,13,13,1,0,0,0],
  [0,0,0,1,13,8,13,1,1,13,8,13,1,0,0,0],
  [0,0,1,13,13,13,13,13,13,13,13,13,13,1,0,0],
  [0,0,1,13,19,13,13,13,13,13,13,13,13,1,0,0],
  [0,0,1,13,13,19,13,13,13,13,19,13,13,1,0,0],
  [0,0,0,1,13,13,19,13,13,13,13,13,1,0,0,0],
  [0,0,0,1,13,13,13,19,19,13,13,13,1,0,0,0],
  [0,0,0,0,1,13,13,13,13,13,13,1,0,0,0,0],
  [0,0,0,0,1,13,1,13,13,1,13,1,0,0,0,0],
  [0,0,0,0,0,1,13,1,1,13,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];
const WISPIT_B = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,13,18,18,13,1,0,0,0,0,0],
  [0,0,0,0,0,1,13,13,13,13,1,0,0,0,0,0],
  [0,0,0,0,1,13,13,13,13,13,13,1,0,0,0,0],
  [0,0,0,1,13,13,13,13,13,13,13,13,1,0,0,0],
  [0,0,0,1,13,8,13,1,1,13,8,13,1,0,0,0],
  [0,0,1,13,13,13,13,13,13,13,13,13,13,1,0,0],
  [0,0,1,13,19,13,13,13,13,13,13,13,13,1,0,0],
  [0,0,1,13,13,19,13,13,13,13,19,13,13,1,0,0],
  [0,0,0,1,13,13,19,13,13,13,13,13,1,0,0,0],
  [0,0,0,1,13,13,13,19,19,13,13,13,1,0,0,0],
  [0,0,0,0,1,13,13,13,13,13,13,1,0,0,0,0],
  [0,0,0,0,0,1,13,1,13,13,1,13,1,0,0,0],
  [0,0,0,0,0,1,1,13,1,1,13,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ---- PYRELASH: evolución de Emberkit (zorro ígneo, melena de llamas, tres colas) ----
const PYRELASH_A = [
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,3,4,3,1,0,0,0,0,0],
  [0,0,0,0,0,1,3,4,4,4,3,1,0,0,0,0],
  [0,0,1,1,1,1,4,4,4,4,4,1,1,1,1,0],
  [0,1,3,4,4,4,4,4,4,4,4,4,4,4,3,1],
  [0,1,4,4,5,5,5,5,5,5,4,4,4,4,1,0],
  [0,1,4,4,5,1,6,1,6,1,5,4,4,4,1,0],
  [0,0,1,4,4,6,6,6,6,6,4,4,4,1,0,0],
  [0,0,0,1,4,4,4,1,4,4,4,1,0,0,0,0],
  [0,0,1,3,1,4,4,4,4,4,4,1,3,1,0,0],
  [0,0,1,3,1,4,4,4,4,4,4,1,3,1,0,0],
  [0,0,1,1,4,4,4,4,4,4,4,4,4,1,0,0],
  [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
  [0,1,4,4,4,2,1,4,4,1,2,4,4,4,1,0],
  [0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,0],
  [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
];
const PYRELASH_B = [
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,3,4,3,1,0,0,0,0,0],
  [0,0,0,0,0,1,3,4,4,4,3,1,0,0,0,0],
  [0,0,1,1,1,1,4,4,4,4,4,1,1,1,1,0],
  [0,1,3,4,4,4,4,4,4,4,4,4,4,4,3,1],
  [0,1,4,4,5,5,5,5,5,5,4,4,4,4,1,0],
  [0,1,4,4,5,1,6,1,6,1,5,4,4,4,1,0],
  [0,0,1,4,4,6,6,6,6,6,4,4,4,1,0,0],
  [0,0,0,1,4,4,4,1,4,4,4,1,0,0,0,0],
  [0,0,1,3,1,4,4,4,4,4,4,1,3,1,0,0],
  [0,0,1,3,1,4,4,4,4,4,4,1,3,1,0,0],
  [0,0,1,1,4,4,4,4,4,4,4,4,4,1,0,0],
  [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
  [0,1,4,4,4,2,1,1,4,4,2,4,4,4,1,0],
  [0,1,1,1,1,0,0,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];

// ---- TORRENTUSK: evolución de Dewpup (morsa-otra masiva, colmillos, aletas) ----
const TORRENTUSK_A = [
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,9,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,9,9,9,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,1,1,2,9,8,1,9,1,8,9,2,1,1,0],
  [0,1,8,8,9,9,9,9,9,9,9,9,9,8,8,1],
  [0,1,2,9,9,9,6,6,6,6,9,9,9,9,2,1],
  [0,0,1,9,9,6,6,6,6,6,6,9,9,1,0,0],
  [0,0,1,2,9,6,6,6,6,6,6,9,2,1,0,0],
  [0,0,0,1,2,9,9,6,6,9,9,2,1,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,0,1,2,9,1,9,9,1,9,2,1,0,0,0],
  [0,0,0,1,2,9,1,1,1,1,9,2,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
];
const TORRENTUSK_B = [
  [0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,9,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,9,9,9,2,1,0,0,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,1,1,2,9,8,1,9,1,8,9,2,1,1,0],
  [0,1,8,8,9,9,9,9,9,9,9,9,9,8,8,1],
  [0,1,2,9,9,9,6,6,6,6,9,9,9,9,2,1],
  [0,0,1,9,9,6,6,6,6,6,6,9,9,1,0,0],
  [0,0,1,2,9,6,6,6,6,6,6,9,2,1,0,0],
  [0,0,0,1,2,9,9,6,6,9,9,2,1,0,0,0],
  [0,0,0,0,1,2,9,9,9,9,2,1,0,0,0,0],
  [0,0,0,0,1,9,9,9,9,9,9,1,0,0,0,0],
  [0,0,0,1,2,9,1,0,1,9,1,9,2,1,0,0],
  [0,0,0,1,2,9,1,1,0,1,9,2,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
];

// ---- Catálogo ----
export const SPECIES = {
  emberkit: {
    id: 'emberkit', dex: 1, name: 'Emberkit', type: 'ember',
    desc: 'Cachorro de zorro nacido entre brasas. Su cola rizada arde con luz ámbar.',
    base: { hp: 44, atk: 52, def: 38, spd: 60 },
    moves: [
      { move: 'ember-flick', lv: 1 },
      { move: 'cinder-dash', lv: 5 },
      { move: 'flame-whirl', lv: 10 },
      { move: 'solar-flare', lv: 18 },
    ],
    catchRate: 190, xpYield: 62, evo: { lv: 16, to: 'pyrelash' },
    battle: [EMBERKIT_A, EMBERKIT_B], over: [EMBERKIT_A, EMBERKIT_B],
  },
  dewpup: {
    id: 'dewpup', dex: 2, name: 'Dewpup', type: 'aqua',
    desc: 'Cría de nutria que juega en cascadas. Su barriga crema guarda un remolino.',
    base: { hp: 55, atk: 44, def: 46, spd: 44 },
    moves: [
      { move: 'bubble-burst', lv: 1 },
      { move: 'aqua-shield', lv: 6 },
      { move: 'tidal-slam', lv: 11 },
      { move: 'torrent-crush', lv: 19 },
    ],
    catchRate: 190, xpYield: 62, evo: { lv: 16, to: 'torrentusk' },
    battle: [DEWPUP_A, DEWPUP_B], over: [DEWPUP_A, DEWPUP_B],
  },
  thistlehoof: {
    id: 'thistlehoof', dex: 3, name: 'Thistlehoof', type: 'thorn',
    desc: 'Cervatillo veloz de los prados. Sus cuernos brotan hojas al amanecer.',
    base: { hp: 48, atk: 48, def: 42, spd: 62 },
    moves: [
      { move: 'thorn-tackle', lv: 1 },
      { move: 'leaf-blade', lv: 7 },
      { move: 'petal-storm', lv: 14 },
      { move: 'stone-guard', lv: 20 },
    ],
    catchRate: 160, xpYield: 58, evo: null,
    battle: [THISTLEHOOF_A, THISTLEHOOF_B], over: [THISTLEHOOF_A, THISTLEHOOF_B],
  },
  glimmerwing: {
    id: 'glimmerwing', dex: 4, name: 'Glimmerwing', type: 'glimmer',
    desc: 'Polilla que guía a los viajeros en la cueva. Sus alas reflejan la luz de la luna.',
    base: { hp: 40, atk: 56, def: 36, spd: 70 },
    moves: [
      { move: 'spark-dust', lv: 1 },
      { move: 'moon-ray', lv: 9 },
      { move: 'ghost-shriek', lv: 15 },
      { move: 'shadow-veil', lv: 21 },
    ],
    catchRate: 150, xpYield: 66, evo: null,
    battle: [GLIMMERWING_A, GLIMMERWING_B], over: [GLIMMERWING_A, GLIMMERWING_B],
  },
  boulderk: {
    id: 'boulderk', dex: 5, name: 'Boulderk', type: 'boulder',
    desc: 'Escarabajo con caparazón de roca. Se enrolla y rueda cuesta abajo.',
    base: { hp: 62, atk: 40, def: 72, spd: 22 },
    moves: [
      { move: 'rock-smash', lv: 1 },
      { move: 'stone-guard', lv: 6 },
      { move: 'boulder-roll', lv: 12 },
      { move: 'rock-smash', lv: 18 },
    ],
    catchRate: 140, xpYield: 70, evo: null,
    battle: [BOULDERK_A, BOULDERK_B], over: [BOULDERK_A, BOULDERK_B],
  },
  wispit: {
    id: 'wispit', dex: 6, name: 'Wispit', type: 'wisp',
    desc: 'Espíritu errante de las profundidades. Su cola ondea como humo lunar.',
    base: { hp: 42, atk: 58, def: 34, spd: 66 },
    moves: [
      { move: 'ghost-shriek', lv: 1 },
      { move: 'shadow-veil', lv: 8 },
      { move: 'spark-dust', lv: 13 },
      { move: 'moon-ray', lv: 19 },
    ],
    catchRate: 130, xpYield: 72, evo: null,
    battle: [WISPIT_A, WISPIT_B], over: [WISPIT_A, WISPIT_B],
  },
  pyrelash: {
    id: 'pyrelash', dex: 7, name: 'Pyrelash', type: 'ember',
    desc: 'Zorro de melena ardiente. Sus tres colas dejan estelas de chispas.',
    base: { hp: 62, atk: 78, def: 52, spd: 82 },
    moves: [
      { move: 'ember-flick', lv: 1 },
      { move: 'cinder-dash', lv: 1 },
      { move: 'flame-whirl', lv: 12 },
      { move: 'solar-flare', lv: 22 },
    ],
    catchRate: 60, xpYield: 165, evo: null,
    battle: [PYRELASH_A, PYRELASH_B], over: [PYRELASH_A, PYRELASH_B],
  },
  torrentusk: {
    id: 'torrentusk', dex: 8, name: 'Torrentusk', type: 'aqua',
    desc: 'Coloso de los rápidos. Sus colmillos rompen el hielo de los ríos helados.',
    base: { hp: 82, atk: 70, def: 68, spd: 56 },
    moves: [
      { move: 'bubble-burst', lv: 1 },
      { move: 'aqua-shield', lv: 1 },
      { move: 'tidal-slam', lv: 13 },
      { move: 'torrent-crush', lv: 23 },
    ],
    catchRate: 60, xpYield: 170, evo: null,
    battle: [TORRENTUSK_A, TORRENTUSK_B], over: [TORRENTUSK_A, TORRENTUSK_B],
  },
};

export const SPECIES_LIST = Object.values(SPECIES);

// Tablas de encuentros por zona: [especie, peso]
export const ENCOUNTERS = {
  route: [
    ['thistlehoof', 40],
    ['emberkit', 30],
    ['dewpup', 20],
    ['glimmerwing', 10],
  ],
  cave: [
    ['boulderk', 35],
    ['wispit', 30],
    ['glimmerwing', 20],
    ['emberkit', 15],
  ],
  town: [
    ['emberkit', 28],
    ['wispit', 26],
    ['boulderk', 22],
    ['glimmerwing', 16],
    ['dewpup', 8],
  ],
};

// ---- Instancia de criatura ----
export function createCreature(speciesId, level = 5) {
  const s = SPECIES[speciesId];
  const lvl = Math.max(1, Math.min(100, level));
  const b = s.base;
  const hp = Math.floor((b.hp * 2 * lvl) / 100) + lvl + 12;
  const stat = (v) => Math.floor((v * 2 * lvl) / 100) + 5;
  const moves = s.moves
    .filter((m) => m.lv <= lvl)
    .map((m) => m.move)
    .slice(-4);
  const learnSet = s.moves.filter((m) => m.lv <= lvl).map((m) => m.move);
  return {
    uid: speciesId + '-' + Math.random().toString(36).slice(2, 8),
    species: speciesId,
    name: s.name,
    type: s.type,
    level: lvl,
    xp: 0,
    xpNext: xpToNext(lvl),
    hp, maxHp: hp,
    atk: stat(b.atk), def: stat(b.def), spd: stat(b.spd),
    moves,
    learnSet,
    catchRate: s.catchRate,
    evo: s.evo ? { ...s.evo } : null,
  };
}

export function xpToNext(level) {
  return Math.floor(Math.pow(level, 1.6) * 18) + 20;
}

// Daño: nivel * poder * (atk/def) * efectividad * varianza
export function typeEffectiveness(attType, defType) {
  const chart = TYPE_CHART[attType];
  if (!chart) return 1;
  if (chart.strong.includes(defType)) return 2;
  if (chart.weak.includes(defType)) return 0.5;
  return 1;
}

export function calcDamage(attacker, defender, move, rng = Math.random) {
  const mv = MOVES[move];
  if (!mv || mv.power === 0) return 0;
  const eff = typeEffectiveness(mv.type, defender.type);
  const atk = attacker.atk, def = defender.def;
  const base = Math.floor(
    (Math.floor((2 * attacker.level) / 5 + 2) * mv.power * (atk / Math.max(1, def))) / 24
  );
  const variance = 0.85 + rng() * 0.3;
  const dmg = Math.max(1, Math.floor(base * variance * eff));
  return { dmg, eff };
}
