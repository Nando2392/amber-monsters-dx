// Gate de diálogo y movimiento continuo:
// 1) Hablar con un NPC muestra un recuadro de diálogo real en el canvas y avanza/cierra.
// 2) Mantener pulsada una dirección mueve al jugador de forma continua (auto-repeat).
import { test, expect } from '@playwright/test';

async function newGame(page) {
  await page.goto('/');
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // título → nueva partida
  await page.waitForTimeout(400);
}

async function pressDir(page, key, times) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(250); // > animación de tile (180ms)
  }
}

// Cuenta píxeles de color ámbar (#ffb02e) en la zona del recuadro de diálogo (canvas 960x640, caja en y≈488-640).
async function countAmberInDialogZone(page) {
  return page.evaluate(() => {
    const c = document.getElementById('game');
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 488, 960, 152).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] > 200 && d[i + 1] > 140 && d[i + 1] < 200 && d[i + 2] < 90) n++;
    }
    return n;
  });
}

test('hablar con Orme muestra el diálogo en pantalla y se cierra con Enter', async ({ page }) => {
  await newGame(page);
  const st = await page.evaluate(() => window.AMBER.state());
  const { x, y } = st.player;
  expect(st.scene).toBe('overworld');

  // Subir por la columna del spawn hasta la fila 2 (camino libre: '.' y hierba '^'),
  // luego izquierda hasta x=4 para quedar adyacente a Orme (4,3) mirando hacia abajo.
  await pressDir(page, 'ArrowUp', y - 2);
  await pressDir(page, 'ArrowLeft', x - 4);
  await page.keyboard.press('ArrowDown'); // girar hacia Orme (bloqueado → solo mira)
  await page.waitForTimeout(200);

  // Interactuar: debe entrar en escena talk y DIBUJAR el recuadro (píxeles ámbar > umbral).
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const st2 = await page.evaluate(() => window.AMBER.state());
  expect(st2.scene).toBe('talk');
  const amber = await countAmberInDialogZone(page);
  expect(amber).toBeGreaterThan(80); // borde ámbar + nombre del NPC visibles

  // Avanzar las 4 líneas de Orme; la última pulsación cierra el diálogo y devuelve al overworld.
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
  }
  const st3 = await page.evaluate(() => window.AMBER.state());
  expect(st3.scene).toBe('overworld');
});

test('mantener pulsada una dirección mueve de forma continua (auto-repeat)', async ({ page }) => {
  await newGame(page);
  const before = await page.evaluate(() => window.AMBER.state());
  expect(before.scene).toBe('overworld');

  // Mantener ArrowRight ~1.2s: tras el delay inicial (380ms) debe repetir y caminar varios tiles.
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(1200);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(300);

  const after = await page.evaluate(() => window.AMBER.state());
  expect(after.steps - before.steps).toBeGreaterThanOrEqual(3);
});
