import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { chromiumPath } from '../scripts/browser-utils.mjs';
import { makeServer } from '../server/index.js';

const server = makeServer({}, () => assert.fail('Local setup must not contact a provider'));
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ executablePath: await chromiumPath(), headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [], outgoing = [], analyses = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = route.request().url();
    if (!url.startsWith(base + '/')) { outgoing.push(url); return route.abort(); }
    if (url.includes('/api/analyze')) analyses.push(url);
    return route.continue();
  });
  await page.goto(base);
  assert.match(await page.title(), /Verifeed/);
  await page.locator('#ai-status').filter({ hasText: 'Local checks are ready' }).waitFor();
  await page.locator('#content').fill('You won a prize. Pay a processing fee to claim your reward.');
  await page.getByRole('button', { name: 'Quick local check' }).click();
  await page.locator('.risk-high').waitFor();
  assert.match(await page.locator('.risk-source').textContent(), /Local check/);
  await page.getByRole('button', { name: 'Flag for my review' }).click();
  await page.locator('[data-view="saved"]').click();
  assert.equal(await page.locator('.saved-card').count(), 1);
  await page.reload();
  await page.locator('[data-view="saved"]').click();
  assert.equal(await page.locator('.saved-card').count(), 1);
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  assert.equal(await page.locator('.saved-card').count(), 0);
  await page.locator('[data-view="studio"]').click();
  await page.getByRole('button', { name: 'An everyday post' }).click();
  await page.getByRole('button', { name: 'Quick local check' }).click();
  await page.locator('.risk-low').waitFor();
  assert.deepEqual(analyses, []);
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/local-studio-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#language').selectOption('ur');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: 'artifacts/local-studio-urdu-mobile.png', fullPage: true });
  assert.deepEqual(outgoing, []);
  assert.deepEqual(errors, []);
  console.log('PASS Account-free local checks, saved results, English/Urdu and mobile layout; no external requests or AI submissions');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
