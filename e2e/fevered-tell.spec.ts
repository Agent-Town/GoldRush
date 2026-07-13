import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/fevered-tell');
const QUERY = '?debug&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&seed=fevered-tell';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EnemySnapshot = ReturnType<NonNullable<Window['__GR_TEST__']>['enemyPositions']>[number];

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function accentState(page: Page, enemy: EnemySnapshot, stealState?: string, wreckState?: string, visible = true) {
  return page.evaluate(
    async ({ snapshot, steal, wreck, rendered }) => {
      const modulePath = '/src/entities/pools.ts';
      const { feverAccentState } = await import(/* @vite-ignore */ modulePath);
      return feverAccentState({
        alive: true,
        eliteKind: snapshot.eliteKind,
        variantId: snapshot.variantId,
        stealState: steal ?? snapshot.state,
        wreckState: wreck ?? snapshot.wreckState,
        visible: rendered,
      });
    },
    { snapshot: enemy, steal: stealState, wreck: wreckState, rendered: visible },
  );
}

async function closeUp(page: Page, enemy: EnemySnapshot, testInfo: TestInfo, label: string): Promise<void> {
  const point = await page.evaluate(({ x, z }) => window.__GR_TEST__?.screenPoint(x, z, 0.9), enemy);
  if (!point) throw new Error(`missing screen point for ${label}`);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('missing viewport');
  const width = Math.min(320, viewport.width);
  const height = Math.min(300, viewport.height);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${label}.png`),
    clip: {
      x: Math.max(0, Math.min(viewport.width - width, point.x - width / 2)),
      y: Math.max(0, Math.min(viewport.height - height, point.y - height / 2)),
      width,
      height,
    },
  });
}

async function captureFixture(
  page: Page,
  testInfo: TestInfo,
  label: string,
  options: Parameters<NonNullable<Window['__GR_TEST__']>['spawnPack']>[2],
): Promise<void> {
  await page.evaluate((opts) => {
    const test = window.__GR_TEST__;
    test?.clearEnemies();
    test?.teleport(0, 2);
    test?.spawnPack(1, 0, opts);
    test?.teleport(0, -4);
  }, options);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(1);
  await page.waitForTimeout(180);
  const enemy = await page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]);
  if (!enemy) throw new Error(`missing ${label} capture fixture`);
  await closeUp(page, enemy, testInfo, label);
}

test('Fevered humans and machines gleam while the Baron stays pristine', async ({ page }, testInfo) => {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  await page.evaluate(() => {
    const test = window.__GR_TEST__;
    test?.teleport(-5, 2);
    test?.spawnPack(1, 0, { speedScale: 0 });
    test?.teleport(0, 2);
    test?.spawnPack(1, 0, { speedScale: 0, variantId: 'steam_wrecker', variantLabel: 'Steam Wrecker', wrecker: true });
    test?.teleport(5, 2);
    test?.spawnPack(1, 0, { speedScale: 0, eliteKind: 'baron', visualScale: 1.5 });
    test?.teleport(0, -4);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(3);
  await page.waitForTimeout(250);

  const enemies = await page.evaluate(() => window.__GR_TEST__?.enemyPositions() ?? []);
  const human = enemies.find((enemy) => !enemy.variantId && !enemy.eliteKind);
  const machine = enemies.find((enemy) => enemy.variantId === 'steam_wrecker');
  const baron = enemies.find((enemy) => enemy.eliteKind === 'baron');
  if (!human || !machine || !baron) throw new Error('missing Fevered presentation fixture');

  const [humanAccent, machineAccent, baronAccent, grabbingAccent, swingingAccent, darkAccent] = await Promise.all([
    accentState(page, human),
    accentState(page, machine),
    accentState(page, baron),
    accentState(page, human, 'grabbing'),
    accentState(page, machine, undefined, 'swinging'),
    accentState(page, human, undefined, undefined, false),
  ]);
  expect(humanAccent).toMatchObject({ active: true, kind: 'human', surged: false, channel: 'watch-paint-instanced' });
  expect(machineAccent).toMatchObject({ active: true, kind: 'machine', surged: false, channel: 'watch-paint-instanced' });
  expect(baronAccent).toEqual({ active: false, kind: 'none', strength: 0, surged: false, channel: 'none' });
  expect(grabbingAccent.strength).toBeGreaterThan(humanAccent.strength);
  expect(swingingAccent.strength).toBeGreaterThan(machineAccent.strength);
  expect(darkAccent).toEqual({ active: false, kind: 'none', strength: 0, surged: false, channel: 'none' });

  await captureFixture(page, testInfo, 'fevered-human', { speedScale: 0 });
  await captureFixture(page, testInfo, 'fevered-machine', {
    speedScale: 0,
    variantId: 'steam_wrecker',
    variantLabel: 'Steam Wrecker',
    wrecker: true,
  });
  await captureFixture(page, testInfo, 'baron-pristine', { speedScale: 0, eliteKind: 'baron', visualScale: 1.5 });

  const evidence = {
    human: humanAccent,
    machine: machineAccent,
    baron: baronAccent,
    grabbing: grabbingAccent,
    swinging: swingingAccent,
    outsideLight: darkAccent,
    renderer: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer),
    errors,
  };
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-report.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(evidence.renderer?.calls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(220);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
