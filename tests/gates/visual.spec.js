// Gate visual: el juego renderiza contenido real (canvas con píxeles de varios colores)
// y la escena de título es visible.
import { test, expect } from '@playwright/test';

test('título renderiza contenido visual real', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas#game');
  // esperar unos frames
  await page.waitForTimeout(400);

  const info = await page.evaluate(() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    let opaque = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) {
        opaque++;
        colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
      }
    }
    return {
      w: canvas.width, h: canvas.height,
      opaque,
      distinctColors: colors.size,
      scene: window.AMBER.state().scene,
    };
  });

  expect(info.w).toBe(960);
  expect(info.h).toBe(640);
  expect(info.scene).toBe('title');
  // título: texto ámbar + Emberkit → muchos colores distintos, no un lienzo vacío
  expect(info.distinctColors).toBeGreaterThan(5);
  expect(info.opaque).toBeGreaterThan(1000);
});

test('nueva partida muestra el overworld con sprites de tiles', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(300);

  // empezar nueva partida
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('overworld');
  expect(state.map).toBe('village');
  expect(state.player).toBeTruthy();
  expect(state.party.length).toBeGreaterThan(0);

  // el canvas no es negro: hierba/árboles dibujan color
  const info = await page.evaluate(() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
    }
    return { distinctColors: colors.size };
  });
  expect(info.distinctColors).toBeGreaterThan(10);

  // screenshot para el README
  await page.screenshot({ path: 'docs/screenshots/overworld-village.png' });
});
