import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Economy, initialEconomyState, reduce, type EconomyEvent } from '../src/game/Economy';

const SHOT_DIR = 'artifacts/e2-pressure';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openDebugGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_CONTRACT_REGISTRY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('Economy keeps gold replay byte-identical while pressure is separate', () => {
  const economy = new Economy(16);
  const goldEvents: EconomyEvent[] = [
    { id: uuid(1), at: 1, type: 'gold_panned', nodeId: 'seam-a', amount: 10 },
    { id: uuid(2), at: 2, type: 'gold_spent', sink: 'build_sentry_beacon', amount: 5 },
  ];

  for (const event of goldEvents) expect(economy.apply(event).ok).toBe(true);

  expect(economy.log.map(hashEvent).join('|')).toBe('gold_panned:10|gold_spent:5:build_sentry_beacon');
  expect(economy.log.reduce(reduce, initialEconomyState).gold).toBe(5);
  expect(economy.state.resources.pressure).toEqual({ amount: 0, cap: 100 });
  expect(economy.apply({ id: uuid(3), at: 3, type: 'resource_spent', resource: 'pressure', sink: 'debug', amount: 1 })).toEqual({
    ok: false,
    reason: 'OUT_OF_RESOURCES',
  });

  expect(economy.apply({ id: uuid(4), at: 4, type: 'resource_granted', resource: 'pressure', source: 'debug', amount: 12, actor: 'prospector' }).ok).toBe(true);
  expect(economy.apply({ id: uuid(5), at: 5, type: 'resource_spent', resource: 'pressure', sink: 'debug', amount: 4, actor: 'player' }).ok).toBe(true);

  const replay = economy.log.reduce(reduce, initialEconomyState);
  expect(replay.gold).toBe(5);
  expect(replay.resources.pressure.amount).toBe(8);
  expect(economy.log.find((event) => event.type === 'resource_granted')).toMatchObject({
    type: 'resource_granted',
    resource: 'pressure',
    amount: 12,
    actor: 'prospector',
  });
});

test('epoch-1 boot hides pressure chip and leaves gold flow unchanged', async ({ page }, testInfo) => {
  const errors = await openDebugGame(page, '?debug&nowaves&nolevel&seed=e2-pressure-e1');

  await expect(page.getByTestId('hud-pressure')).toBeHidden();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.activeResources ?? [])).toEqual([]);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure)).toEqual({ amount: 0, cap: 100 });

  const flow = await page.evaluate(() => {
    window.__GR_TEST__?.grantGold(30);
    const placed = window.__GR_TEST__?.placeBeacon() === true;
    const log = [...(window.__GR_TEST__?.economyLog() ?? [])] as Array<{ type?: string; amount?: number; source?: string; sink?: string }>;
    return {
      placed,
      gold: window.__GR_TEST__?.state().economy.banked ?? -1,
      hash: log.map((event) => [event.type, event.amount, event.source ?? event.sink].filter(Boolean).join(':')).join('|'),
    };
  });

  expect(flow).toEqual({
    placed: true,
    gold: 5,
    hash: 'gold_granted:30:debug|gold_spent:25:build_sentry_beacon',
  });

  await shot(page, testInfo, 'clean-epoch-1-hud');
  assertNoErrors(errors);
});

test('debug Steamworks epoch override shows pressure chip and exchange rows', async ({ page }, testInfo) => {
  const errors = await openDebugGame(page, '?debug&era=2&contract=e2-hill-mine&nowaves&nolevel&seed=e2-pressure-e2');

  await expect(page.getByTestId('hud-pressure')).toBeVisible();
  await expect(page.getByTestId('hud-pressure')).toContainText('Pressure');
  await expect(page.getByTestId('hud-pressure')).toContainText('0/100');

  const epoch = await page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeEpoch());
  expect(epoch).toMatchObject({
    id: 'epoch-2-steamworks',
    resources: [{ id: 'pressure', name: 'Pressure', capDefault: 100, ledgerBlurb: 'the boilers breathe it' }],
    claimOffice: {
      exchange: [
        { id: 'gold-to-pressure', from: 'gold', to: 'pressure', fromAmount: 20, toAmount: 1 },
        { id: 'pressure-to-gold', from: 'pressure', to: 'gold', fromAmount: 1, toAmount: 12 },
      ],
    },
  });
  expect(epoch?.claimOffice?.metaCurrencySlot?.reserved).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.grantPressure(7, 'prospector'));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.resources.pressure.amount ?? -1)).toBe(7);
  await expect(page.getByTestId('hud-pressure')).toContainText('7/100');

  const pressureEvents = await page.evaluate(() =>
    [...(window.__GR_TEST__?.economyLog() ?? [])].filter((event) => (event as { type?: string }).type?.startsWith('resource_')),
  );
  expect(pressureEvents).toEqual([
    expect.objectContaining({ type: 'resource_granted', resource: 'pressure', amount: 7, actor: 'prospector' }),
  ]);

  await shot(page, testInfo, 'steamworks-pressure-chip');
  assertNoErrors(errors);
});

function hashEvent(event: EconomyEvent): string {
  if (event.type === 'gold_panned') return `${event.type}:${event.amount}`;
  if (event.type === 'gold_spent') return `${event.type}:${event.amount}:${event.sink}`;
  return `${event.type}`;
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
