// Gate de audio: el mute alterna vía estado y la batalla cambia de escena sin errores
// (la música procedural se valida funcionalmente: no crashea y el AudioContext existe).
import { test, expect } from '@playwright/test';

test('audio: mute alterna con M', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(300);

  let state = await page.evaluate(() => window.AMBER.state());
  expect(state.muted).toBe(false);

  await page.keyboard.press('m');
  await page.waitForTimeout(100);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.muted).toBe(true);

  await page.keyboard.press('m');
  await page.waitForTimeout(100);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.muted).toBe(false);
});

test('audio: AudioContext disponible y batalla cambia a la escena de combate sin errores', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(200);

  const audioOk = await page.evaluate(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    return typeof AC === 'function';
  });
  expect(audioOk).toBe(true);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  // entrar en batalla: la música cambia de patrón; el juego debe seguir respondiendo
  await page.evaluate(() => window.AMBER.startBattle('wispit', 6));
  await page.waitForTimeout(400);
  const state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('battle');

  // volver al overworld vía victoria forzada + procesar turno (Enter)
  await page.evaluate(() => window.AMBER.winBattle());
  await page.keyboard.press('Enter');  // intro → menú
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');  // atacar → enemigo a 0 → victoria → overworld
  await page.waitForTimeout(900);

  const after = await page.evaluate(() => window.AMBER.state());
  expect(after.scene).toBe('overworld');
});
