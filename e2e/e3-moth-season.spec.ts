import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { PROFILE_KEY, SCOREBOARD_KEY, profileDataKey } from '../src/game/ProfileStorage';

const QUERY = '?debug&contract=e3-moth-season&nowaves&nospawn&nolevel&seed=e3-moth-season';
const SEED = 'e3-moth-season-01';
// The both-engine harness the county already uses for agent reels (`e2e/e4-roads-and-convoys.spec.ts`):
// the SAME `HeadlessContractSim`, replayed in a second Node process and in the browser runtime, one
// reel, one event-log hash. The `Game.ts` world is not in hash agreement with the headless door on
// any map and is not claimed here.
const HARNESS = `/src/replay/harness.html?debug&contract=e3-moth-season&seed=${SEED}`;
const TAPE = 'artifacts/e3-moth-season/e3-moth-season-floor.tape.json';
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
  // `__GR_TEST__` is `?debug`-gated (`Game.ts:2085`), so a PLAIN boot waits on the published
  // diagnostics alone — which is the point of the parity test below.
  const debug = query.includes('debug');
  await page.waitForFunction((wantsHarness) => (!wantsHarness || Boolean(window.__GR_TEST__))
    && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, debug);
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

  // The corridor opens DARK: nothing stands on the pylon site, so the span is cut and the
  // pre-placed Lantern Post on the lamp node is off the current. A free `lantern_post` is refused
  // now — declaring `twist.powerGrid` withdraws it from the offer, so the map's only lamp is the
  // grid fixture; the Sentry Beacon on the pylon site is what a rider raises to light it.
  expect(await page.evaluate((pylon) => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setDayNightTime(3);
    return [
      window.__GR_TEST__!.placeFree('lantern_post', -8, 12),
      window.__GR_TEST__!.placeFree('decoy_shed', 8, 12),
      window.__GR_TEST__!.placeFree('sentry_beacon', pylon.x, pylon.z),
    ];
  }, PYLON)).toEqual([false, true, true]);
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
  // A repair is bought, not free (`BuildSystem.repairBuilding` spends `repairCost`), so the purse
  // is topped up first; this is the mend a rider funds out of panned gold on a real ride.
  await page.evaluate((pylon) => window.__GR_TEST__!.teleport(pylon.x, pylon.z), PYLON);
  await page.evaluate(() => window.__GR_TEST__!.grantGold(200));
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
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  // The Moth Season is board-locked behind `secured:e3-blackout-ridge`, so a bare `?contract=`
  // falls back to the Claim. Seeded exactly as `e4-roads-and-convoys.spec.ts` seeds its Motor
  // parity boot: a profile, the era, and the launch handoff — no `?debug`.
  await page.addInitScript(({ epochKey, profileEpochKey, profileKey, scoresKey }) => {
    localStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(epochKey, 'epoch-3-voltage');
    localStorage.setItem(profileEpochKey, 'epoch-3-voltage');
    // The board gate this map actually carries: `unlock: secured:e3-blackout-ridge`.
    localStorage.setItem(scoresKey, JSON.stringify([{
      waves: 12, kills: 1, gold: 1, timeAlive: 360, at: 1, secured: true, secureWave: 12,
      profileName: 'Robin', contractId: 'e3-blackout-ridge',
    }]));
    sessionStorage.setItem('gr.contract.launch.v1', 'e3-moth-season');
  }, {
    epochKey: ACTIVE_EPOCH_KEY,
    profileEpochKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
    profileKey: PROFILE_KEY,
    scoresKey: profileDataKey('robin', SCOREBOARD_KEY),
  });
  await page.goto(`/?contract=e3-moth-season&seed=${SEED}`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e3-moth-season'
    && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await page.getByTestId('contract-briefing-dismiss').isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  expect(await page.evaluate(() => typeof window.__GR_TEST__)).toBe('undefined');

  // The offer set both engines read from `mechanicsBuildableIds`: declaring `twist.powerGrid`
  // withdraws `turret` and buildable `lantern_post` (the map's lamps are grid fixtures now,
  // exactly as on `e3-blackout-ridge`) and leaves the Sentry Beacon that carries the span, plus
  // the Decoy Shed the migration is paid with. The human sees the SAME list the rider is handed.
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  expect(await page.evaluate(() => [...document.querySelectorAll('[data-buildable-id]')]
    .map((tile) => tile.getAttribute('data-buildable-id'))))
    .toEqual(['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'decoy_shed', 'assay_office']);
  // The pre-placed corridor lamp is standing, dark, in a boot with no debug seam at all, and the
  // objective a rider reads off `now.canyonConnect` is published to that same plain boot.
  expect(await page.evaluate((lamp) => window.__THREE_GAME_DIAGNOSTICS__!.build.hp
    .some((entry: { id: string; position: { x: number; z: number } }) =>
      entry.id === 'lantern_post' && entry.position.x === lamp.x && entry.position.z === lamp.z), LAMP)).toBe(true);
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

  // The reel this slice recorded: the frozen floor fixture ridden through `scripts/gr-sim.mjs`.
  const tape = JSON.parse(await readFile(TAPE, 'utf8')) as { contract: string; seed: string; eventLogHash: string };
  expect({ contract: tape.contract, seed: tape.seed }).toEqual({ contract: 'e3-moth-season', seed: SEED });

  // ENGINE 1 — a second Node process and a separate module graph.
  const node = JSON.parse(execFileSync(
    process.execPath,
    ['scripts/assay-replay-agent.mjs', TAPE],
    { encoding: 'utf8', timeout: 300_000 },
  ).trim().split('\n').at(-1)!) as { eventLogHash: string; outcome: { secured: boolean; waves: number }; ticks: number };
  expect(node.eventLogHash).toBe(tape.eventLogHash);

  // ENGINE 2 — the same sim inside the browser runtime, driven by the harness the county uses.
  await page.goto(HARNESS);
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const browser = await page.evaluate(async (reel) => window.__GR_AGENT_TAPE_REPLAY__!.replay(reel), tape) as
    { eventLogHash?: string; outcome?: { secured: boolean; waves: number }; ticks?: number; error?: string };

  expect(browser.error).toBeUndefined();
  expect(browser.eventLogHash).toBe(node.eventLogHash);
  expect(browser.ticks).toBe(node.ticks);
  expect(JSON.stringify(browser.outcome)).toBe(JSON.stringify(node.outcome));
  expect(node.outcome).toMatchObject({ secured: true, waves: 12 });

  await mkdir('artifacts/e3-moth-season', { recursive: true });
  await writeFile(
    `artifacts/e3-moth-season/both-engines-${testInfo.project.name}.json`,
    `${JSON.stringify({
      contract: 'e3-moth-season',
      seed: SEED,
      orders: 'scripts/fixtures/moth-season-orders.json',
      tape: TAPE,
      claimedHash: tape.eventLogHash,
      nodeReplayHash: node.eventLogHash,
      browserReplayHash: browser.eventLogHash,
      nodeTicks: node.ticks,
      browserTicks: browser.ticks,
      outcome: node.outcome,
      agree: browser.eventLogHash === node.eventLogHash && node.eventLogHash === tape.eventLogHash,
    }, null, 2)}\n`,
  );
  console.log(`[e3-moth-season-both-engines] claimed=${tape.eventLogHash} node=${node.eventLogHash}/${node.ticks} browser=${browser.eventLogHash}/${browser.ticks}`);
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});
