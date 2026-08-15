// One-off: screenshot del diálogo de Orme (evidencia del fix de renderTalk).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1000, height: 720 } });
await page.goto('http://localhost:5173/');
await page.waitForTimeout(300);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
for (let i = 0; i < 11; i++) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(250); }
for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(250); }
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
await page.screenshot({ path: 'docs/screenshots/dialog-orme.png' });
await b.close();
console.log('dialog screenshot ok');
