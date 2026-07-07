import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import type { BuildableId } from '../src/game/buildables';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type HpEntry = { id: BuildableId; index: number; hp: number; maxHp: number; wrecked: boolean; position: Point };
type EconomyEvent = { type?: string; sink?: string; amount?: number; actor?: string };

test.setTimeout(60_000);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function setAgentLevel(page: Page, level: number): Promise<void> {
  await page.addInitScript(
    ({ key, agentLevel }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: 0, hero: 0, agent: agentLevel },
        }),
      );
    },
    { key: META_PROGRESS_KEY, agentLevel: level },
  );
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const gui = document.querySelector<HTMLElement>('.lil-gui');
    if (gui) gui.style.display = 'none';
  });
  return errors;
}

async function saveShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  mkdirSync('artifacts/m4-10', { recursive: true });
  const path = `artifacts/m4-10/${name}-${testInfo.project.name}.png`;
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

async function openPanel(page: Page): Promise<void> {
  await page.keyboard.press('KeyG');
  await expect(page.getByTestId('prospector-panel')).toBeVisible();
}

async function setBalance(page: Page, path: string, value: number | boolean | string): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before + amount);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<HpEntry> {
  await page.evaluate(([tx, tz]) => window.__GR_TEST__?.teleport(tx, tz + 2), [x, z] as const);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, id, 0)).not.toBeNull();
  return (await hpEntry(page, id, 0))!;
}

async function hpEntry(page: Page, id: BuildableId, index: number): Promise<HpEntry | null> {
  return page.evaluate(
    ([family, i]) =>
      (window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === family && entry.index === i) as HpEntry | undefined) ??
      null,
    [id, index] as const,
  );
}

async function companion(page: Page): Promise<{ moving: boolean; working: boolean; position: Point; target: Point }> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment);
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

test('panel only offers registered ToolSurface capabilities', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=m4-10-registry');

  await openPanel(page);
  await expect(page.getByTestId('prospector-ability-auto_collect')).toBeVisible();
  await expect(page.getByTestId('prospector-ability-auto_repair')).toBeVisible();
  await expect(page.getByTestId('prospector-ability-auto_pan')).toHaveCount(0);
  const capabilities = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.agent?.capabilities ?? []);
  expect(capabilities.map((entry) => entry.id)).toEqual(['auto_collect', 'auto_repair']);
  expect(capabilities[0]?.tools).toEqual(['et.goldrush.collect_xp', 'et.goldrush.collect_gold']);
  expect(capabilities[1]?.tools).toEqual(['et.goldrush.repair']);
  if (testInfo.project.name.includes('desktop')) await saveShot(page, testInfo, 'panel-real-functions');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('repair, dropped-gold, and XP actions work and freeze while paused', async ({ page }, testInfo) => {
  await setAgentLevel(page, 1);
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m4-10-effects');
  await setBalance(page, 'agent.xpMoteAgeS', 0.05);
  await grantGold(page, Balance.palisade.cost + 40);
  const built = await placeBuildableAt(page, 'palisade', 0, 9);
  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('palisade', 0))).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, 'palisade', built.index).then((entry) => entry?.wrecked ?? false)).toBe(true);

  await expect
    .poll(() => companion(page).then((snap) => snap.moving || snap.working), { timeout: 8_000 })
    .toBe(true);
  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? false)).toBe(true);
  const frozen = await page.evaluate(() => ({
    receiptCount: window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptCount ?? 0,
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    hp: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.index === 0)?.hp ?? -1,
    motesCollected: window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0,
    pickups: window.__THREE_GAME_DIAGNOSTICS__?.steal.pickups ?? 0,
    prospector: window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position,
  }));
  await expect(
    page.evaluate(([x, z]) => window.__GR_TEST__?.spawnGoldPickup(x + 0.4, z, 7), [
      frozen.prospector.x,
      frozen.prospector.z,
    ] as const),
  ).resolves.toBe(true);
  await expect(
    page.evaluate(([x, z]) => window.__GR_TEST__?.spawnXpMote(x - 4, z, 5), [frozen.prospector.x, frozen.prospector.z] as const),
  ).resolves.toBe(true);
  await page.waitForTimeout(700);
  const still = await page.evaluate(() => ({
    receiptCount: window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptCount ?? 0,
    gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0,
    hp: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.index === 0)?.hp ?? -1,
    motesCollected: window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0,
    pickups: window.__THREE_GAME_DIAGNOSTICS__?.steal.pickups ?? 0,
    prospector: window.__THREE_GAME_DIAGNOSTICS__!.agent.embodiment.position,
  }));
  expect(still.receiptCount).toBe(frozen.receiptCount);
  expect(still.gold).toBe(frozen.gold);
  expect(still.hp).toBe(frozen.hp);
  expect(still.motesCollected).toBe(frozen.motesCollected);
  expect(still.pickups).toBe(frozen.pickups + 1);
  expect(distance(still.prospector, frozen.prospector)).toBeLessThan(0.02);

  await page.keyboard.press('KeyP');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);
  await expect.poll(() => hpEntry(page, 'palisade', built.index).then((entry) => entry?.hp ?? 0), { timeout: 12_000 }).toBe(
    built.maxHp,
  );
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.lastActionAt['et.goldrush.repair'] ?? 0))
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.receiptFeed.some((line) => line.includes('Mended')) ?? false))
    .toBe(true);
  if (testInfo.project.name.includes('desktop')) await saveShot(page, testInfo, 'agent-repair-receipt');

  const repairLog = await economyLog(page);
  expect(repairLog.some((event) => event.type === 'gold_spent' && event.sink === 'repair_palisade' && (event.amount ?? 0) > 0)).toBe(
    true,
  );
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.summary.reclaimedByProspector ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.steal.pickups ?? 1), { timeout: 10_000 })
    .toBe(0);
  const goldLog = await economyLog(page);
  expect(goldLog.some((event) => event.type === 'gold_reclaimed' && event.actor === 'prospector' && (event.amount ?? 0) > 0)).toBe(
    true,
  );
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.motesCollected ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(frozen.motesCollected);
  const lastActionAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.agent.stub?.lastActionAt ?? {});
  expect(lastActionAt['et.goldrush.repair']).toBeGreaterThan(0);
  expect(lastActionAt['et.goldrush.collect_gold']).toBeGreaterThan(0);
  expect(lastActionAt['et.goldrush.collect_xp']).toBeGreaterThan(0);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
