// Renderer pixel-grid: convierte matrices 2D de indices de paleta en canvases offscreen.
// UNICA operacion de dibujo permitida: fillRect de 1x1 por pixel (regla visual dura #2).
import { PAL } from './palette.js';

const cache = new Map();

function colorCache(idx) {
  let c = cache.get(idx);
  if (c === undefined) {
    c = PAL[idx] || null;
    if (c) cache.set(idx, c);
  }
  return c;
}

/**
 * Renderiza una matriz de pixeles a un canvas offscreen.
 * @param {number[][]} rows matriz [fila][col] de indices de paleta (0 = transparente)
 * @param {number} scale px por pixel de la matriz
 * @returns {HTMLCanvasElement}
 */
export function renderMatrix(rows, scale = 1) {
  const h = rows.length;
  const w = rows[0] ? rows[0].length : 0;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const c = colorCache(row[x]);
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return canvas;
}

/**
 * Renderiza N frames (matrices) como una spritesheet horizontal.
 * @param {number[][][]} frames
 * @param {number} scale
 * @returns {HTMLCanvasElement} spritesheet con frames lado a lado
 */
export function renderFrames(frames, scale = 1) {
  const h = frames[0].length;
  const w = frames[0][0].length;
  const canvas = document.createElement('canvas');
  canvas.width = w * scale * frames.length;
  canvas.height = h * scale;
  const ctx = canvas.getContext('2d');
  frames.forEach((rows, fi) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = colorCache(rows[y][x]);
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect((fi * w + x) * scale, y * scale, scale, scale);
      }
    }
  });
  return canvas;
}

/** Bounding box de los pixeles opacos (para centrar/recortar). */
export function bbox(rows) {
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  rows.forEach((row, y) => {
    row.forEach((v, x) => {
      if (v !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });
  });
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/** Firma de silueta: bounding box normalizado a 16x16 binario + hash. */
export function silhouetteHash(rows) {
  const b = bbox(rows);
  if (!b) return 'empty';
  const cells = [];
  for (let gy = 0; gy < 16; gy++) {
    for (let gx = 0; gx < 16; gx++) {
      const px = b.x + Math.floor((gx / 16) * b.w);
      const py = b.y + Math.floor((gy / 16) * b.h);
      cells.push(rows[py] && rows[py][px] ? '1' : '0');
    }
  }
  // hash simple no criptográfico sobre la silueta binaria
  let h = 2166136261;
  for (const bit of cells) {
    h ^= bit.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
