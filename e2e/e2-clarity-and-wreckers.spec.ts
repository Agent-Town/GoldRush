import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { ledgerEntries } from '../src/encyclopedia/registry';

const QUERY = '?debug&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&seed=e2-clarity';
const ARTIFACT_DIR = 'artifacts/e2-clarity-and-wreckers';

async function shot(page: Page, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${ARTIFACT_DIR}/${name}.png` });
}

async function openRun(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await page.getByTestId('story-beat-layer').waitFor();
  await page.evaluate(() => {
    localStorage.setItem('gr.story.tales.v1', '1');
    (document.querySelector('[data-testid="contract-briefing-dismiss"]') as HTMLButtonElement | null)?.click();
  });
  await page.waitForFunction(() => !document.querySelector('#hud.hud--announcement-visible'));
  return errors;
}

test('Boiler House teaches once per profile', async ({ page }) => {
  const errors = await openRun(page);
  expect(await page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 8, 8))).toBe(true);
  const card = page.getByTestId('story-beat-card');
  await expect(card).toHaveAttribute('data-beat-id', 'e2-boiler-house-teaching');
  await expect(card).toContainText('The boiler feeds pressure; pressure feeds the new machines.');
  await shot(page, 'boiler-card');
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await page.getByTestId('story-beat-layer').waitFor();
  await page.evaluate(() => {
    (document.querySelector('[data-testid="contract-briefing-dismiss"]') as HTMLButtonElement | null)?.click();
    window.__GR_TEST__?.placeFree('boiler_house', 8, 8);
  });
  await expect(page.locator('[data-beat-id="e2-boiler-house-teaching"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('E2 opponents have tactical ledger pages and first-encounter name plates', async ({ page }) => {
  const entries = Object.fromEntries(ledgerEntries.map((entry) => [entry.id, entry]));
  for (const id of ['rail_tough', 'steam_wrecker', 'coal_thief'] as const) {
    expect(entries[id].factLines()).toHaveLength(2);
    expect(entries[id].factLines()[1]).toMatch(/^Tactics:/);
  }

  const errors = await openRun(page);
  await page.evaluate(() => window.__GR_TEST__?.spawnPack(1, 0.8, { variantId: 'steam_wrecker', variantLabel: 'Steam Wrecker' }));
  await expect(page.getByTestId('story-beat-card')).toContainText('Steam Wrecker');
  await shot(page, 'enemy-name-plate');
  expect(errors).toEqual([]);
});

test('E2 trio separates on shared pathing and the tuned Wrecker damages a segment', async ({ page }) => {
  const errors = await openRun(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.teleport(8, 8);
    window.__GR_TEST__?.placeFree('palisade', 8, 8);
    window.__GR_TEST__?.spawnPack(3, 0.2, { variantId: 'steam_wrecker', variantLabel: 'Steam Wrecker', wrecker: true, buildingDamageScale: 2.5 });
    window.__GR_TEST__?.teleport(-20, -20);
    window.__GR_TEST__?.advanceSim(5);
  });
  const result = await page.evaluate(() => {
    const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
    let closest = Infinity;
    for (let a = 0; a < enemies.length; a += 1) for (let b = a + 1; b < enemies.length; b += 1) {
      closest = Math.min(closest, Math.hypot(enemies[a]!.x - enemies[b]!.x, enemies[a]!.z - enemies[b]!.z));
    }
    return { closest, wreck: window.__THREE_GAME_DIAGNOSTICS__?.wreck };
  });
  expect(result.closest).toBeGreaterThanOrEqual(0.4);
  expect(result.wreck?.hitsResolved).toBeGreaterThan(0);
  await shot(page, 'separated-wreckers');
  expect(errors).toEqual([]);
});
