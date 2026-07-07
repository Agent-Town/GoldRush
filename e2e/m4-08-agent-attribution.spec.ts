import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import type { EconomyEvent } from '../src/game/Economy';
import { initialEconomyState, reduce, summarizeLog } from '../src/game/Economy';
import { summarizeRun } from '../src/game/RunManager';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type CardSeed = {
  goldPanned: number;
  pannedByProspector: number;
  stolen: number;
  reclaimed: number;
  reclaimedByProspector: number;
  sluiced?: number;
  sluicedByProspector?: number;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openPlainGame(page: Page, seed: string): Promise<ErrorBucket> {
  const query = `?nowaves&nospawn&nolevel&seed=${seed}`;
  expect(query).not.toContain('debug');
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function renderSeededCard(page: Page, seed: CardSeed): Promise<void> {
  await page.evaluate(async (card) => {
    document.querySelectorAll('[data-testid="death-overlay"]').forEach((node) => node.remove());
    const modulePath = '/src/ui/DeathOverlay.ts';
    const { DeathOverlay } = (await import(modulePath)) as any;
    const parent = document.querySelector<HTMLElement>('#app') ?? document.body;
    const overlay = new DeathOverlay(parent, () => undefined);
    overlay.show(
      {
        timeAlive: 84,
        kills: 0,
        goldPanned: card.goldPanned,
        spent: 0,
        beaconsBuilt: 0,
        wavesSurvived: 3,
        weaponToggles: 0,
        blastTime: 0,
      },
      [],
      Date.now(),
      {
        runStats: {
          sluiced: card.sluiced ?? 0,
          stolen: card.stolen,
          reclaimed: card.reclaimed,
          pannedByProspector: card.pannedByProspector,
          sluicedByProspector: card.sluicedByProspector ?? 0,
          reclaimedByProspector: card.reclaimedByProspector,
          buildingsBuilt: 0,
          buildingsLost: 0,
          buildingsRepaired: 0,
          damageByOwner: {},
          upgradeStacks: {},
        },
      },
    );
  }, seed);
}

async function saveShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-08-attribution', { recursive: true });
  await page.screenshot({ path: `artifacts/m4-08-attribution/${name}.png`, fullPage: true });
  await testInfo.attach(name, { path: `artifacts/m4-08-attribution/${name}.png`, contentType: 'image/png' });
}

test('actor tags add attribution without changing economy replay totals', () => {
  const tagged: EconomyEvent[] = [
    { id: uuid(1), at: 1, type: 'gold_panned', nodeId: 'player-seam', amount: 140 },
    { id: uuid(2), at: 2, type: 'gold_panned', nodeId: 'prospector-seam', amount: 95, actor: 'prospector' },
    { id: uuid(3), at: 3, type: 'gold_reclaimed', amount: 7 },
    { id: uuid(4), at: 4, type: 'gold_reclaimed', amount: 5, actor: 'prospector' },
    { id: uuid(5), at: 5, type: 'gold_spent', sink: 'build_stockpile', amount: 60 },
  ];
  const untagged: EconomyEvent[] = [
    { id: uuid(1), at: 1, type: 'gold_panned', nodeId: 'player-seam', amount: 140 },
    { id: uuid(2), at: 2, type: 'gold_panned', nodeId: 'prospector-seam', amount: 95 },
    { id: uuid(3), at: 3, type: 'gold_reclaimed', amount: 7 },
    { id: uuid(4), at: 4, type: 'gold_reclaimed', amount: 5 },
    { id: uuid(5), at: 5, type: 'gold_spent', sink: 'build_stockpile', amount: 60 },
  ];

  expect(tagged.reduce(reduce, initialEconomyState)).toEqual(untagged.reduce(reduce, initialEconomyState));
  expect(summarizeLog(tagged)).toMatchObject({
    panned: 235,
    reclaimed: 12,
    pannedByProspector: 95,
    reclaimedByProspector: 5,
    buildingsBuilt: 1,
  });
  expect(summarizeRun(tagged, 3)).toEqual({
    wavesSurvived: 3,
    goldPanned: 235,
    goldPannedByProspector: 95,
    goldStolen: 0,
    goldReclaimed: 12,
    goldReclaimedByProspector: 5,
    buildingsBuilt: 1,
  });
});

test('death card shows seeded player and Prospector panned split on plain boot', async ({ page }, testInfo) => {
  const errors = await openPlainGame(page, `m4-08-split-${testInfo.project.name}`);
  await renderSeededCard(page, {
    goldPanned: 235,
    pannedByProspector: 95,
    stolen: 20,
    reclaimed: 12,
    reclaimedByProspector: 5,
  });

  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('summary-gold-panned-split')).toHaveText('you 140 / the Prospector 95');
  await expect(page.getByTestId('summary-gold-reclaimed-split')).toHaveText('you 7 / the Prospector 5');
  await expect(page.locator('[data-death-gold]')).not.toHaveText('235');

  await saveShot(
    page,
    testInfo,
    testInfo.project.name.includes('mobile') ? 'card-with-split-mobile' : 'card-with-split-desktop',
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('player-only death card keeps the single panned number on plain boot', async ({ page }, testInfo) => {
  const errors = await openPlainGame(page, `m4-08-player-only-${testInfo.project.name}`);
  await renderSeededCard(page, {
    goldPanned: 140,
    pannedByProspector: 0,
    stolen: 0,
    reclaimed: 0,
    reclaimedByProspector: 0,
  });

  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.locator('[data-death-gold]')).toHaveText('140');
  await expect(page.getByTestId('summary-gold-panned-split')).toHaveCount(0);

  if (!testInfo.project.name.includes('mobile')) await saveShot(page, testInfo, 'player-only-no-split');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
