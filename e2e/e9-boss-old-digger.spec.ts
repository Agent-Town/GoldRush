import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?debug&epoch=epoch-9-redfields&contract=e9-dome-basin&nolevel&nopause&seed=old-digger';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(90_000);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && bucket.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

async function open(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
  await dismissBriefing(page);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('oldDigger.surveySpeed', 12);
    test.setBalance('oldDigger.unmakeIntervalSeconds', 0.05);
    test.setBalance('oldDigger.deckClimbSeconds', 0.2);
    test.setBalance('oldDigger.hazardIntervalSeconds', 0.05);
    test.setBalance('oldDigger.hazardDamage', 2);
    test.setBalance('oldDigger.readSeconds', 0.1);
    test.setBalance('oldDigger.reDigSpeed', 80);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
  });
  return errors;
}

async function digger(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.oldDiggerBoss!);
}

async function startDigger(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(2));
  await expect.poll(() => digger(page)).toMatchObject({ active: true, act: 1, surveying: true });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
}

async function board(page: Page): Promise<void> {
  const position = (await digger(page)).position;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), position);
  await expect(page.evaluate(() => window.__GR_TEST__!.oldDigger.interact())).resolves.toBe(true);
  await expect.poll(() => digger(page)).toMatchObject({ boarded: true, dronesAboard: 2, dronesSpawned: 2 });
}

async function recordCanalWork(page: Page): Promise<void> {
  const started = await page.evaluate(() => window.__GR_TEST__!.playbook.startRecording({
    script: [{ t: 0, mx: 0, my: 0, a: [] }],
  }));
  expect(started.ok).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  const stopped = await page.evaluate(() => window.__GR_TEST__!.playbook.stopRecording('basin-canals'));
  expect(stopped).toMatchObject({ ok: true, saved: true, truncated: null });
}

async function placeOnSurvey(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('palisade', -38, 48))).resolves.toBe(true);
}

test('surveys, legally unmakes its path, never attacks, and cannot be killed', async ({ page }) => {
  const errors = await open(page);
  await placeOnSurvey(page);
  const hpBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);

  await startDigger(page);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(12));
  const renovation = await digger(page);
  expect(renovation.surveyLeg).toBeGreaterThan(0);
  expect(renovation.structuresUnmade).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter((entry) => entry.id === 'palisade'))).toEqual([]);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBe(hpBefore);
  expect(renovation.playerDamageEvents).toBe(0);
  expect((await page.evaluate(() => window.__GR_TEST__!.enemyPositions().find((enemy) => enemy.variantId === 'old_digger')))?.contactDamage).toBe(0);

  await page.evaluate(() => window.__GR_TEST__!.setBalance('blast.damage', 1_000_000));
  for (let hit = 0; hit < 12; hit += 1) {
    const position = (await digger(page)).position;
    await expect(page.evaluate(({ x, z }) => window.__GR_TEST__!.launchBlastAt(x, z, 0.01), position)).resolves.toBe(true);
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  }
  const afterDamage = await digger(page);
  expect(afterDamage).toMatchObject({ active: true, act: 1, gentle: false });
  expect(afterDamage.killAttemptsAbsorbed).toBeGreaterThan(0);
  expect(afterDamage.hullHp).toBeGreaterThanOrEqual(afterDamage.hullFloorHp);
  expect((await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'old_digger')))).toHaveLength(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('boards the live machine, spawns drones, takes hazard ticks, and dismounts safely', async ({ page }) => {
  const errors = await open(page);
  await startDigger(page);
  await board(page);

  const hpBeforeHazards = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.12));
  expect(await digger(page)).toMatchObject({ boarded: true, hazardTicks: 2 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBeLessThan(hpBeforeHazards);

  const hpBeforeDismount = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);
  await expect(page.evaluate(() => window.__GR_TEST__!.oldDigger.interact())).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  expect(await digger(page)).toMatchObject({ boarded: false, dismounts: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBe(hpBeforeDismount);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

for (const priorRecording of [true, false]) {
  test(`THE SWAP uses the ${priorRecording ? 'prior recording' : 'no-recording survey fallback'} and persists gentle`, async ({ page }) => {
    const errors = await open(page);
    if (priorRecording) await recordCanalWork(page);
    else expect(await page.evaluate(() => window.__GR_TEST__!.playbook.list())).toEqual([]);

    await startDigger(page);
    await board(page);
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.25));
    await expect.poll(() => digger(page)).toMatchObject({ atTapeDeck: true });
    await expect(page.evaluate(() => window.__GR_TEST__!.oldDigger.interact())).resolves.toBe(true);
    await expect.poll(() => digger(page)).toMatchObject({ act: 2, swapPhase: 'reading' });
    for (let step = 0; step < 40 && !(await digger(page)).gentle; step += 1) {
      await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.05));
    }
    await expect.poll(() => digger(page)).toMatchObject({ act: 3, swapPhase: 'done', joinedFleet: true, gentle: true });

    const swapped = await digger(page);
    expect(swapped.tape).toMatchObject(priorRecording
      ? { source: 'recording', name: 'basin-canals' }
      : { source: 'survey', name: 'survey-of-the-base-as-built' });
    expect(swapped.archivedTape).toEqual(swapped.tape);
    expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => ['old_digger', 'maintenance_drone'].includes(enemy.variantId ?? '')))).toEqual([]);
    await expect(page.getByTestId('hud-wave')).toContainText('IT JOINS THE FLEET');
    await expect(page.getByTestId('hud-wave')).toContainText('The old tape goes to the archive.');
    await expect(page.locator('#game-canvas')).toHaveAttribute('data-old-digger3d-presentation', 'gentle');

    const restingPosition = swapped.position;
    await page.reload();
    await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
    await dismissBriefing(page);
    await expect.poll(() => digger(page)).toMatchObject({
      active: false,
      act: 3,
      position: restingPosition,
      joinedFleet: true,
      gentle: true,
      persistentGentle: true,
    });
    expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'old_digger'))).toEqual([]);
    await expect(page.locator('#game-canvas')).toHaveAttribute('data-old-digger3d-presentation', 'gentle');
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  });
}
