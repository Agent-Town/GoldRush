import { chromium, devices } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const mobile of [false, true]) {
    const name = mobile ? 'mobile-390' : 'desktop';
    const context = await browser.newContext(mobile ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    console.log(name, 'started');
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => localStorage.setItem('gr.profile.v2', JSON.stringify({ version: 2, activeId: 'field-book', profiles: [{ id: 'field-book', name: 'Field Book', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }] })));
    await page.route('**/api/standings**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, view: 'byStack', epochId: 'epoch-1-frontier', contracts: ['the-claim', 'e1-dry-gulch'], byStack: [{ model: 'other', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 1, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: Date.now() }, contracts: [{ contractId: 'e1-dry-gulch', score: { secured: true, waves: 1, timeAlive: 60, gold: 1, baseValue: 1 }, difficulty: 'trail', submittedAt: Date.now() }] }, { model: 'pi-v4', aggregate: { standings: 1, contracts: 1, crowns: 0, bestWaves: 20, declaredCells: 0, undeclaredCells: 1, latestSubmittedAt: Date.now() }, contracts: [{ contractId: 'the-claim', score: { secured: true, waves: 20, timeAlive: 700, gold: 260, baseValue: 420 }, difficulty: 'trail', harness: 'pi', submittedAt: Date.now() }] }] }) }));
    await page.goto('http://127.0.0.1:5198/');
    await page.getByTestId('start-menu-claim-ledger').click();
    await page.getByTestId('claim-ledger-field-book').click();
    await page.getByTestId('field-book-row-pi-v4').click();
    const blank = page.getByTestId('field-book-contracts-pi-v4').locator('.field-book__blank').first();
    await blank.waitFor({ state: 'visible' });
    assert.equal(await blank.textContent(), '·');
    assert.equal(await blank.getAttribute('aria-label'), 'No showing');
    await blank.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/emdash-entities-1/field-book-${name}.png` });
    const plainBootErrors = [...errors];
    await page.goto('http://127.0.0.1:5198/?nowaves&nolevel&seed=emdash-entities-1');
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    await page.getByRole('button', { name: 'Begin', exact: true }).click();
    await page.getByTestId('hud-agent').click();
    const rung = page.getByTestId('prospector-rung-1');
    await rung.waitFor({ state: 'visible' });
    assert.match(await rung.textContent(), /acts with your approval: repairs, pickups/);
    await page.screenshot({ path: `artifacts/emdash-entities-1/prospector-${name}.png` });
    results.push({ name, plainBootErrors, allErrors: errors, rung: await rung.textContent(), blank: '·' });
    await context.close();
  }
} finally {
  await browser.close();
  fs.writeFileSync('artifacts/emdash-entities-1/capture-results.json', JSON.stringify(results, null, 2));
}
assert.ok(results.length === 2 && results.every(r => r.allErrors.length === 0));
