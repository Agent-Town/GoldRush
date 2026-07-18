import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

// Relay Valley still has zero harvest anchors and cannot boot until the adjacent
// E7 signal-systems slice lands. The explicit debug seam exercises the same
// production system on the stable Claim without broadening its live contract.
const QUERY = '/?debug&e7boss&epoch=epoch-7-signal&contract=the-claim&nowaves&nolevel&nopause&seed=e7-echo-boss';

test.setTimeout(60_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ epochKey }) => {
  if (!sessionStorage.getItem('e7-boss-test')) {
    localStorage.clear();
    sessionStorage.setItem('e7-boss-test', '1');
  }
  localStorage.setItem(epochKey, 'epoch-7-signal');
}, { epochKey: ACTIVE_EPOCH_KEY }));

async function open(page: Page, bossEnabled = true): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(bossEnabled ? QUERY : QUERY.replace('&e7boss', ''));
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.click();
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('e7Boss.adaptationSeconds', 0.2);
    test.setBalance('e7Boss.pressureIntervalSeconds', 0.1);
    test.setBalance('e7Boss.pressureDamageBase', 1);
    test.setBalance('e7Boss.pressureDamagePerTurret', 1);
    test.setBalance('e7Boss.pressureDamagePerPatrol', 1);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
    test.grantGold(2_000);
  });
  return errors;
}

async function echo(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.echoBoss!);
}

async function strike(page: Page, key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD'): Promise<void> {
  await page.keyboard.down(key);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.05));
  await page.keyboard.up(key);
}

test('mirrors the live base, grades novelty, and keeps the Echo in a jar without a kill', async ({ page }) => {
  const errors = await open(page);
  expect(await page.evaluate(() => window.__GR_TEST__!.placeFree('turret', -3, 8))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.placeFree('palisade', 3, 8))).toBe(true);

  const recorded = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const started = test.playbook.startRecording({
      script: [
        { t: 0, mx: 0, my: -1, a: [] },
        { t: 2, mx: 0, my: 0, a: [] },
      ],
    });
    test.advanceSim(0.15);
    return { started, stopped: test.playbook.stopRecording('north-wall-round') };
  });
  expect(recorded.started).toEqual({ ok: true });
  expect(recorded.stopped).toMatchObject({ ok: true, saved: true });

  await page.evaluate((wave) => window.__GR_TEST__!.startWaveForTest(wave), Balance.e7Boss.arriveWave - Balance.e7Boss.dreadWaves);
  expect(await echo(page)).toMatchObject({ act: 0, active: true, trafficLagTicks: 1, killPath: false });
  await strike(page, 'KeyW');
  expect((await echo(page)).echoedTraffic).toContain('move:n');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.55));
  expect((await echo(page)).stutters).toBeGreaterThan(0);

  const killsBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.kills);
  await page.evaluate((wave) => window.__GR_TEST__!.startWaveForTest(wave), Balance.e7Boss.arriveWave);
  expect(await echo(page)).toMatchObject({
    act: 1,
    active: true,
    copiedBuildings: 2,
    copiedTurrets: 1,
    copiedPatrols: 1,
    recordedPatterns: ['move:n'],
    patternConfidence: Balance.e7Boss.patternConfidence,
  });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.25));
  expect(await echo(page)).toMatchObject({
    act: 2,
    perimeterProgress: 1,
    lastReplayedPattern: 'move:n',
  });
  expect((await echo(page)).replayAttacks).toBeGreaterThan(0);

  await strike(page, 'KeyW');
  expect(await echo(page)).toMatchObject({
    familiarStrikes: 1,
    novelStrikes: 0,
    lastStrike: 'move:n',
    lastStrikeDamage: Balance.e7Boss.familiarConfidenceDamage,
  });
  await strike(page, 'KeyD');
  expect(await echo(page)).toMatchObject({
    familiarStrikes: 1,
    novelStrikes: 1,
    lastStrike: 'move:e',
    lastStrikeDamage: Balance.e7Boss.novelConfidenceDamage,
  });
  await strike(page, 'KeyA');
  await strike(page, 'KeyS');

  expect(await echo(page)).toMatchObject({
    act: 3,
    active: false,
    patternConfidence: 0,
    captured: true,
    jarVisible: true,
    persistentJar: true,
    killPath: false,
  });
  expect(await page.evaluate(() => ({
    kills: window.__THREE_GAME_DIAGNOSTICS__!.kills,
    echoEnemies: window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'the_echo').length,
  }))).toEqual({ kills: killsBefore, echoEnemies: 0 });

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  expect(await echo(page)).toMatchObject({ act: 3, captured: true, jarVisible: true, persistentJar: true, killPath: false });
  expect(errors).toEqual([]);
});

test('does not arm the debug harness without the explicit boss seam', async ({ page }) => {
  const errors = await open(page, false);
  await page.evaluate((wave) => window.__GR_TEST__!.startWaveForTest(wave), Balance.e7Boss.arriveWave);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.echoBoss)).toBeNull();
  expect(errors).toEqual([]);
});
