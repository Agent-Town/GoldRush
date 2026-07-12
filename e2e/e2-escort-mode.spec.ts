import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ARTIFACT_DIR = path.resolve('artifacts/e2-escort-mode');
const QUERY = '?debug&contract=e2-hill-mine&mode=escort&nowaves&nolevel&nopause&nosteal&seed=e2-escort';

async function openEscort(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__?.escort().enabled === true);
  await page.evaluate(() => (document.querySelector('[data-testid="contract-briefing-dismiss"]') as HTMLButtonElement | null)?.click());
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('ore cart follows the authored rail and pays at the east railhead', async ({ page }, testInfo) => {
  const errors = await openEscort(page);
  const startGold = await page.evaluate(() => window.__GR_TEST__?.state().economy.banked ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(40));
  const result = await page.evaluate(() => ({
    cart: window.__GR_TEST__?.escort(),
    gold: window.__GR_TEST__?.state().economy.banked,
    event: window.__GR_TEST__?.economyLog().at(-1),
  }));
  expect(result.cart).toMatchObject({ state: 'arrived', arrived: 1, required: 1, objectiveLost: false, x: 46, z: -2 });
  expect(result.gold).toBe(startGold + 40);
  expect(result.event).toMatchObject({ type: 'gold_granted', source: 'escort', amount: 40 });
  await page.evaluate(() => window.__GR_TEST__?.teleport(46, -2));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'arrival');
  expect(errors).toEqual([]);
});

test('nearby wreckers engage the cart and a nearby hero repairs its stopped state', async ({ page }, testInfo) => {
  const errors = await openEscort(page);
  const cart = await page.evaluate(() => window.__GR_TEST__?.escort());
  expect(cart?.enabled).toBe(true);
  if (!cart?.enabled) return;
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__?.damageEscort(100);
    window.__GR_TEST__?.teleport(x, z + 1.2);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('wreck.damage', 20);
    window.__GR_TEST__?.spawnPack(1, 0.8, { wrecker: true, speedScale: 1, buildingDamageScale: 1 });
    window.__GR_TEST__?.teleport(42, 42);
    window.__GR_TEST__?.advanceSim(1.2);
  }, cart);
  const attacked = await page.evaluate(() => ({
    cart: window.__GR_TEST__?.escort(),
    enemy: window.__GR_TEST__?.enemyPositions().find((entry) => entry.wrecker),
  }));
  expect(attacked).toMatchObject({ cart: { state: 'stopped', hp: 60 }, enemy: { wreckState: 'swinging' } });
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), attacked.cart as { x: number; z: number });
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'under-attack');

  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    const cart = window.__GR_TEST__?.escort();
    if (cart?.enabled) window.__GR_TEST__?.teleport(cart.x, cart.z);
    window.__GR_TEST__?.advanceSim(2.1);
  });
  expect(await page.evaluate(() => window.__GR_TEST__?.escort())).toMatchObject({ state: 'moving', hp: 180, repairProgress: 0 });
  expect(errors).toEqual([]);
});

test('cart destruction loses only the escort objective', async ({ page }) => {
  const errors = await openEscort(page);
  expect(await page.evaluate(() => window.__GR_TEST__?.damageEscort(999))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(0.1));
  const result = await page.evaluate(() => ({ cart: window.__GR_TEST__?.escort(), state: window.__THREE_GAME_DIAGNOSTICS__?.state }));
  expect(result.cart).toMatchObject({ state: 'destroyed', hp: 0, objectiveLost: true, arrived: 0 });
  expect(result.state).toBe('playing');
  expect(errors).toEqual([]);
});
