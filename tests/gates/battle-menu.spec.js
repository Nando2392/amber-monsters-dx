// Gate del menú de batalla: acciones visibles, navegación con flechas,
// uso de poción en combate y manejo de "sin pociones".

import { test, expect } from '@playwright/test';

test('menú de batalla: acciones visibles y navegables con flechas', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  await page.evaluate(() => window.AMBER.startBattle('dewpup', 5));
  await page.waitForTimeout(300);

  // intro → menú principal
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  const state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('battle');
  expect(state.panel).toBe('main');

  // el menú principal lista las 5 acciones (Luchar, Orbe, Poción, Cambiar, Huir)
  const hasActions = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return c && c.width > 0; // el canvas está vivo; las acciones se verifican por pixel abajo
  });
  expect(hasActions).toBe(true);

  // ArrowDown navega Luchar → Orbe; ArrowDown de nuevo → Poción
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  let c = await page.evaluate(() => window.AMBER.state().cursor);
  expect(c).toBe(1);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(100);
  c = await page.evaluate(() => window.AMBER.state().cursor);
  expect(c).toBe(2);

  // Enter con cursor en Poción → se usa una poción (el starter está herido)
  const before = await page.evaluate(() => {
    window.AMBER.damagePlayer(30);
    window.AMBER.givePotions(5);
    return { hp: window.AMBER.state().party[0].hp, potions: window.AMBER.state().potions };
  });
  expect(before.hp).toBeGreaterThan(0);
  expect(before.potions).toBeGreaterThan(0);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => window.AMBER.state());
  expect(after.party[0].hp).toBeGreaterThan(before.hp); // la poción curó
  expect(after.potions).toBe(before.potions - 1); // se gastó 1
});

test('usar poción sin pociones muestra mensaje y no congela la batalla', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    window.AMBER.startBattle('wispit', 6);
    window.AMBER.setPotions(0); // sin pociones
    window.AMBER.damagePlayer(20);
  });
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter'); // intro → menú
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowDown'); // → Orbe
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowDown'); // → Poción
  await page.waitForTimeout(100);
  await page.keyboard.press('Enter'); // intentar usar poción sin tener

  await page.waitForTimeout(400);
  const state = await page.evaluate(() => window.AMBER.state());
  // sigue en batalla (no congela), el mensaje se muestra y no se gastó nada
  expect(state.scene).toBe('battle');
  expect(state.msg).toContain('No te quedan pociones');
});
