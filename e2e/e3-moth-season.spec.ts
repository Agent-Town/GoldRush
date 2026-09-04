import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const QUERY = '?debug&contract=e3-moth-season&nowaves&nospawn&nolevel&seed=e3-moth-season';
const SEED = 'e3-moth-season-01';
// The both-engine harness the county already uses for agent reels (`e2e/e4-roads-and-convoys.spec.ts`):
// the SAME `HeadlessContractSim`, ridden in Node and in the browser runtime, one seed, one order
// stream, one event-log hash. The `Game.ts` world is not in hash agreement with the headless door on
// any map and is not claimed here.
const HARNESS = `/src/replay/harness.html?debug&contract=e3-moth-season&seed=${SEED}`;
const SIM_MODULE = '/src/sim/HeadlessContractSim.ts';
// The authored corridor circuit (`assets/contracts/epoch-3-voltage/contracts.json`): one dynamo,
// one relay span carried by a Sentry Beacon on the pylon site, and the gallery -> lamp pair the
// Canyon Works composes the same way. The pre-placed Lantern Post sits ON the lamp node.
const PYLON = { x: 0, z: -14 };
const LAMP = { x: 0, z: 6 };

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => localStorage.clear()));

async function open(page: Page, query = QUERY): Promise<{ console: string[]; page: string[] }> {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

test('locks the night, scales the moth wave with light, and pays the decoy tithe', async ({ page }, testInfo) => {
  const errors = await open(page);
  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  expect(contract).toMatchObject({
    id: 'e3-moth-season',
    twist: {
      secureWave: 12,
      dayNightCycle: { nightLocked: true, duskRampSeconds: 2, dawnRampSeconds: 2 },
      mothSeason: {
        radiusWeight: 1,
        decoyWeight: 2,
        mothsBaselinePerWave: 4,
        mothsPerLightPerWave: 1,
        nightSpeedOutsideLight: 1.12,
        litThreshold: 0.35,
        attachDamagePerSecond: 6,
      },
      // The era mechanic: the smallest sabotageable circuit, gating the secure through the same
      // one-way connect latch the Canyon Works uses.
      powerGrid: { maxSpanLength: 30, connect: { required: 1, byWave: 12 } },
    },
    boardRow: { unlock: 'secured:e3-blackout-ridge' },
    briefing: {
      goals: [
        'Hold through wave 12 while the decoy shed draws the migration.',
        'CONNECT the corridor gallery to the dynamo by wave 12.',
      ],
    },
  });

  for (const [time, phase, minDarkness] of [[0, 'dusk', 0.75], [3, 'dark', 1], [23, 'dawn', 0.75]] as const) {
    await page.evaluate((seconds) => window.__GR_TEST__!.setDayNightTime(seconds), time);
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight)).toMatchObject({ phase });
    expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.dayNight?.darkness ?? 0))).toBeGreaterThanOrEqual(minDarkness);
  }

  // The corridor opens DARK: nothing stands on the pylon site, so the span is cut and every
  // Lantern Post on the map — the pre-placed one included — is off the lamp node's current.
  expect(await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setDayNightTime(3);
    return [
      window.__GR_TEST__!.placeFree('lantern_post', -8, 12),
      window.__GR_TEST__!.placeFree('decoy_shed', 8, 12),
      window.__GR_TEST__!.placeFree('sentry_beacon', PYLON.x, PYLON.z),
    ];
  })).toEqual([true, true, true]);
  await page.evaluate(() => window.__GR_TEST__!.teleport(-30, -30));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.canyonWorks))
    .toMatchObject({ powered: 1, required: 1, byWave: 12, complete: true, failed: false });

  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(1);
    window.__GR_TEST__!.advanceSim(4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.alive)).toBeGreaterThanOrEqual(4);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.attachCounts), { timeout: 15_000 })
    .toContainEqual(expect.objectContaining({ sourceId: 'decoy:0', radius: 11, targetWeight: 2 }));

  await expect.poll(() => page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find((entry) => entry.id === 'decoy_shed')?.hp ?? 120,
  )).toBeLessThan(120);
  await page.evaluate(() => window.__GR_TEST__!.teleport(4, 12));
  await mkdir('artifacts/e3-moth-season', { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `artifacts/e3-moth-season/${testInfo.project.name}-decoy-tithe.png` });

  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});

test('the corridor span cuts the lamp dark and a repair lights it again', async ({ page }, testInfo) => {
  const errors = await open(page);
  const circuit = () => page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const nodes = diagnostics.power?.nodes ?? [];
    return {
      connect: diagnostics.canyonWorks,
      gallery: nodes.find((node: { id: string }) => node.id === 'corridor-gallery')?.state ?? null,
      lamp: nodes.find((node: { id: string }) => node.id === 'corridor-lamp')?.state ?? null,
      lanterns: diagnostics.lighting?.coverage?.sources ?? null,
      beacon: diagnostics.build.hp.find((entry: { id: string }) => entry.id === 'sentry_beacon') ?? null,
    };
  });

  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setDayNightTime(3);
    window.__GR_TEST__!.teleport(-30, -30);
    window.__GR_TEST__!.advanceSim(0.5);
  });

  // THE DARK — no relay, so the span carries nothing and the lamp node is out. The pre-placed
  // Lantern Post stands on the lamp node and still lights nothing: `powerConsumerAt` gates it.
  const dark = await circuit();
  expect({ gallery: dark.gallery, lamp: dark.lamp }).toEqual({ gallery: 'dark', lamp: 'dark' });
  expect(dark.connect).toMatchObject({ powered: 0, complete: false, failed: false });
  expect(await page.evaluate((lamp) => window.__THREE_GAME_DIAGNOSTICS__!.build.hp
    .some((entry: { id: string; position: { x: number; z: number } }) =>
      entry.id === 'lantern_post' && entry.position.x === lamp.x && entry.position.z === lamp.z), LAMP)).toBe(true);

  // THE LIGHT — one Sentry Beacon on the pylon site closes the span; both consumers come up and
  // the lamp joins the coverage field.
  expect(await page.evaluate((pylon) => window.__GR_TEST__!.placeFree('sentry_beacon', pylon.x, pylon.z), PYLON)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const lit = await circuit();
  expect({ gallery: lit.gallery, lamp: lit.lamp }).toEqual({ gallery: 'powered', lamp: 'powered' });
  expect(lit.connect).toMatchObject({ powered: 1, complete: true, failed: false });
  expect(lit.lanterns).toBeGreaterThan(dark.lanterns!);

  // THE CUT — wreck the beacon the way a Corridor Saboteur does and the corridor goes out.
  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 0))).toBeTruthy();
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const cut = await circuit();
  expect({ gallery: cut.gallery, lamp: cut.lamp }).toEqual({ gallery: 'dark', lamp: 'dark' });
  expect(cut.connect).toMatchObject({ powered: 0 });
  expect(cut.beacon).toMatchObject({ wrecked: true });
  await mkdir('artifacts/e3-moth-season', { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `artifacts/e3-moth-season/${testInfo.project.name}-corridor-cut.png` });

  // THE REPAIR — the same verb a rider spends through REPAIR_UNDER, and the corridor is lit again.
  await page.evaluate((pylon) => window.__GR_TEST__!.teleport(pylon.x, pylon.z), PYLON);
  expect(await page.evaluate(() => window.__GR_TEST__!.repair('sentry_beacon', 0))).toBeTruthy();
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const relit = await circuit();
  expect({ gallery: relit.gallery, lamp: relit.lamp }).toEqual({ gallery: 'powered', lamp: 'powered' });
  expect(relit.connect).toMatchObject({ powered: 1, complete: true, failed: false });
  await page.evaluate(() => window.__GR_TEST__!.teleport(0, 0));
  await page.locator('#game-canvas').screenshot({ path: `artifacts/e3-moth-season/${testInfo.project.name}-corridor-relit.png` });

  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});

test('HUMAN PARITY: a plain boot offers the relay the rider BUILDs, and no debug flag is needed', async ({ page }) => {
  const errors = await open(page, '?contract=e3-moth-season&seed=e3-moth-season');
  // The offer set both engines read from `mechanicsBuildableIds`: declaring `twist.powerGrid`
  // withdraws `turret` and buildable `lantern_post` (the map's lamps are grid fixtures now,
  // exactly as on `e3-blackout-ridge`) and leaves the Sentry Beacon that carries the span.
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  await expect(page.getByTestId('hud-build-tile-sentry_beacon')).toBeVisible();
  await expect(page.getByTestId('hud-build-tile-decoy_shed')).toBeVisible();
  await expect(page.getByTestId('hud-build-tile-turret')).toHaveCount(0);
  await expect(page.getByTestId('hud-build-tile-lantern_post')).toHaveCount(0);
  // The objective a rider reads off `now.canyonConnect` is published to a plain boot too.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.canyonWorks))
    .toMatchObject({ powered: 0, required: 1, byWave: 12, complete: false, failed: false });
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});

test('both engines ride the corridor floor to the same event-log hash', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));

  const fixture = JSON.parse(await readFile('scripts/fixtures/moth-season-orders.json', 'utf8')) as unknown[];
  const node = JSON.parse(execFileSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e3-moth-season', '--seed', SEED, '--policy=stdin'],
    { encoding: 'utf8', timeout: 180_000, input: `${fixture.map((entry) => JSON.stringify(entry)).join('\n')}\n` },
  ).trim().split('\n').at(-1)!) as { secured: boolean; waves: number; eventLogHash: string };

  await page.goto(HARNESS);
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const browser = await page.evaluate(async ({ orders, seed, module }) => {
    const { HeadlessContractSim } = await import(/* @vite-ignore */ module);
    const sim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed });
    let turn = sim.currentTurn();
    let index = 0;
    while (!turn.terminal && index < orders.length) {
      sim.submitOrders(orders[index]);
      index += 1;
      turn = sim.advanceToTurn();
    }
    while (!turn.terminal) turn = sim.advanceToTurn();
    return { outcome: sim.outcome(), connect: turn.view.now.canyonConnect };
  }, { orders: fixture, seed: SEED, module: SIM_MODULE });

  expect(browser.outcome.eventLogHash).toBe(node.eventLogHash);
  expect({ secured: browser.outcome.secured, waves: browser.outcome.waves }).toEqual({ secured: node.secured, waves: node.waves });
  expect(browser.connect).toMatchObject({ required: 1, byWave: 12, complete: true, failed: false });

  await mkdir('artifacts/e3-moth-season', { recursive: true });
  await writeFile(
    `artifacts/e3-moth-season/both-engines-${testInfo.project.name}.json`,
    `${JSON.stringify({
      contract: 'e3-moth-season',
      seed: SEED,
      orders: 'scripts/fixtures/moth-season-orders.json',
      node: { secured: node.secured, waves: node.waves, eventLogHash: node.eventLogHash },
      browser: { secured: browser.outcome.secured, waves: browser.outcome.waves, eventLogHash: browser.outcome.eventLogHash },
      agree: browser.outcome.eventLogHash === node.eventLogHash,
    }, null, 2)}\n`,
  );
  console.log(`[e3-moth-season-both-engines] node=${node.eventLogHash} browser=${browser.outcome.eventLogHash}`);
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});
