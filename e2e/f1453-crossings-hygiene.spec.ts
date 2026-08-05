import { expect, test } from '@playwright/test';

const SPEEDS = {
  'the-claim': 0.85,
  'e1-drill-yard': 0.85,
  'e1-dry-gulch': 1,
  'e1-night-shift': 0.85,
  'e1-twin-banks': 0.85,
  'e1-baron': 0.85,
} as const;

test('crossing data rebuilds after reset without changing E1 speeds', async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.route('**/__f1453-crossings', (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));

  for (const [contract, expectedSpeed] of Object.entries(SPEEDS)) {
    await page.goto(`/__f1453-crossings?debug&contract=${contract}`);
    const result = await page.evaluate(async () => {
      const enemy = (await Function('return import("/src/entities/Enemy.ts")')()) as typeof import('../src/entities/Enemy');
      const first = enemy.crossingData();
      const cached = enemy.crossingData();
      enemy.resetCrossingData();
      const rebuilt = enemy.crossingData();
      return { cached: first === cached, rebuilt: first !== rebuilt, first, after: rebuilt };
    });

    expect(result.cached, contract).toBe(true);
    expect(result.rebuilt, contract).toBe(true);
    expect(result.after, contract).toEqual(result.first);
    expect(result.after.speed, contract).toBe(expectedSpeed);
  }

  await page.goto('/__f1453-crossings?debug&contract=e1-twin-banks&zero-speed');
  const fallbackSpeed = await page.evaluate(async () => {
    const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const contract = contracts.activeContract();
    const water = contract.tileParams.water!;
    contract.tileParams.water = { ...water, speedMul: { ...water.speedMul, ford: 0 } };
    const enemy = (await Function('return import("/src/entities/Enemy.ts")')()) as typeof import('../src/entities/Enemy');
    return enemy.crossingData().speed;
  });
  expect(fallbackSpeed).toBe(1);

  expect(errors).toEqual([]);
});

test('plain boot has no debug query or browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  expect(new URL(page.url()).search).toBe('');
  expect(errors).toEqual([]);
});
