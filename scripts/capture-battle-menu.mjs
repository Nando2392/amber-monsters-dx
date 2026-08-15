// One-off: screenshot del menú de batalla (evidencia del fix de battle menu).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 420, height: 320 } });
await page.goto('http://localhost:5173/');
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.evaluate(() => window.AMBER.startBattle('dewpup', 5));
await page.waitForTimeout(300);
await page.keyboard.press('Enter'); // intro → menú principal
await page.waitForTimeout(250);
await page.keyboard.press('ArrowDown'); // Luchar → Orbe
await page.waitForTimeout(150);
await page.screenshot({ path: 'docs/screenshots/battle-menu.png' });
console.log('battle menu screenshot ok');
await b.close();
