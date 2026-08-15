// Gate de gameplay: flujo completo — título → nueva partida → mover →
// batalla → capturar (enemigo debilitado, determinista) → guardar/cargar → party.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.AMBER.clearSave());
  await page.waitForTimeout(200);
});

test('flujo: nueva partida → mover → batalla → capturar', async ({ page }) => {
  // nueva partida desde el título
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  let state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('overworld');

  // mover el jugador unas casillas a la derecha (fila del spawn tiene camino libre)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);
  }
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.steps).toBeGreaterThan(0);

  // forzar batalla con API de debug
  await page.evaluate(() => window.AMBER.startBattle('dewpup', 5));
  await page.waitForTimeout(300);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('battle');

  // debilitar al enemigo y darse orbes de sobra → captura casi garantizada
  await page.evaluate(() => {
    window.AMBER.weakenEnemy();
    window.AMBER.giveOrbs(50);
  });

  // confirmar (intro → menú principal), luego ↓ (Luchar → Orbe), luego Enter (lanzar orbe)
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('battle');

  await page.keyboard.press('ArrowDown'); // Luchar → Orbe
  await page.waitForTimeout(150);
  await page.keyboard.press('Enter');     // lanzar orbe
  await page.waitForTimeout(700);

  state = await page.evaluate(() => window.AMBER.state());
  // el enemigo debilitado al 8% → captura inmediata (o la criatura ataca y repetimos)
  if (state.scene !== 'overworld') {
    await page.keyboard.press('Enter');      // menú de nuevo
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');  // → Orbe
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');      // lanzar otro orbe
    await page.waitForTimeout(700);
    state = await page.evaluate(() => window.AMBER.state());
  }

  expect(state.scene).toBe('overworld');
  expect(state.captures).toBeGreaterThanOrEqual(1);
  expect(state.party.length).toBeGreaterThanOrEqual(2); // starter + capturada

  await page.screenshot({ path: 'docs/screenshots/gameplay-after-capture.png' });
});

test('guardar y cargar persiste la partida', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  // mover algo para tener estado
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);

  const before = await page.evaluate(() => window.AMBER.save());
  expect(before).toBe(true);
  const has = await page.evaluate(() => window.AMBER.hasSave());
  expect(has).toBe(true);

  // recargar la página y cargar la partida guardada → vuelve al overworld
  await page.reload();
  await page.waitForTimeout(300);
  const loaded = await page.evaluate(() => window.AMBER.load());
  expect(loaded).toBe(true);
  const state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('overworld');
  expect(state.party.length).toBeGreaterThan(0);
});

test('menú party se abre con P y se cierra con Escape', async ({ page }) => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  let state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('overworld');

  await page.keyboard.press('p');
  await page.waitForTimeout(200);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('party');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  state = await page.evaluate(() => window.AMBER.state());
  expect(state.scene).toBe('overworld');
});
