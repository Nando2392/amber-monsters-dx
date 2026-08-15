// Palette global de Amber Monsters DX.
// Indice 0 = transparente. Todos los sprites referencian esta paleta (regla de game-assets).

export const PAL = [
  null,            // 0 transparente
  '#1a1226',       // 1 outline oscuro universal
  '#2e2240',       // 2 sombra
  '#ff5a4e',       // 3 rojo (fuego / daño)
  '#ffb02e',       // 4 ámbar / dorado (acento del juego)
  '#ffe9a8',       // 5 amarillo claro (highlight)
  '#ffd9b0',       // 6 piel cálida
  '#7a5a3a',       // 7 marrón (madera / pelo castaño)
  '#ffffff',       // 8 blanco (ojos, brillos)
  '#3fd6c2',       // 9 turquesa (agua / esmeralda)
  '#79d94a',       // 10 verde hierba
  '#3a8f3f',       // 11 verde oscuro (bosque)
  '#5b6ee1',       // 12 azul índigo (noche)
  '#c084fc',       // 13 púrpura (wisp / mística)
  '#9aa5b1',       // 14 gris piedra
  '#6b7280',       // 15 gris oscuro
  '#e0b48a',       // 16 marrón claro (piel 2 / tronco claro)
  '#f25c8d',       // 17 rosa (flor)
  '#7fd6ff',       // 18 celeste (brillo agua / hielo)
  '#4a3b68',       // 19 púrpura oscuro (cueva)
];

export const PAL_OBJ = Object.fromEntries(
  PAL.map((c, i) => [i, c]).filter(([, c]) => c)
);
