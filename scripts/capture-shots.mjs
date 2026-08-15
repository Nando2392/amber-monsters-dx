// Script one-off: captura screenshots de título y batalla para el README.
import { chromium } from '@playwright/test';

const shots = [
  { name: 'title-screen', setup: async (page) => { await page.waitForTimeout(500); } },
  {
    name: 'battle',
    setup: async (page) => {
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter'); // nueva partida
      await page.waitForTimeout(400);
      await page.evaluate(() => window.AMBER.startBattle('thistlehoof', 6));
      await page.waitForTimeout(600);
    },
  },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 720 } });
  await page.goto('http://localhost:5173/');
  await s.setup(page);
  await page.screenshot({ path: `docs/screenshots/${s.name}.png` });
  await page.close();
}
await browser.close();
console.log('screenshots ok');
