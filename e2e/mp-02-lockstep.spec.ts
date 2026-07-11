import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import type { ScoreRecord } from '../src/game/Scoreboard';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type MpState = NonNullable<ThreeGameDiagnostics['mp']>;
type ActorDiagnostic = ThreeGameDiagnostics['actors'][number];
type MpPlayerSeed = { id: string; name: string; town: string };

const ROOT = process.cwd();
const SCRIPT_NAME = 'gold-rush-mp-room';
const STATE_ROOT = path.join(ROOT, 'test-results/mp-02-relay-state');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/mp-02');
const MP03_ARTIFACT_DIR = path.join(ROOT, 'artifacts/mp-03');
const MP04_ARTIFACT_DIR = path.join(ROOT, 'artifacts/mp-04');
const MP_QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&nokill&seed=mp-02-lockstep';
const MP_CONVERGENCE_QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&seed=mp-02-convergence';
const MP_ACTION_QUERY = 'debug&mp=dev&nowaves&nosteal&nowreck&nokill&seed=mp-05-actions';
const ALICE: MpPlayerSeed = { id: 'alice', name: 'Alice', town: 'Dawn Claim' };
const BOB: MpPlayerSeed = { id: 'bob', name: 'Bob', town: 'River Bend' };
let relay: RelayEnv;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  relay = await startRelayEnv();
});

test.afterAll(async () => {
  await relay?.stop();
});

test('consecutive action pulses survive the filled input-delay window exactly once', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one action FIFO proof is enough');
  await page.goto('/?debug&nospawn&nowaves&nolevel');
  const sent = await page.evaluate(async () => {
    const { LockstepClient } = await import('../src/mp/LockstepClient');
    const messages: Array<{ type?: string; tick?: number; input?: { actions?: Array<{ type?: string }> } }> = [];
    const client = new LockstepClient({
      relayBase: location.origin,
      code: '000000000000000000000000',
      player: { name: 'Pulse', town: 'Test Claim' },
    });
    const internals = client as unknown as {
      connected: boolean;
      nextSimTick: number;
      pendingActions: Array<{ type: string }>;
      roster: Array<{ playerId: string; name: string; town: string; slot: number }>;
      socket: { readyState: number; send: (value: string) => void };
      bundles: Map<number, { inputs: Array<{ input: { actions: Array<{ type: string }> } }> }>;
      handle: (message: Record<string, unknown>) => void;
    };
    internals.connected = true;
    internals.roster = [
      { playerId: 'p1', name: 'Pulse', town: 'Test Claim', slot: 0 },
      { playerId: 'p2', name: 'Peer', town: 'Other Claim', slot: 1 },
    ];
    internals.socket = {
      readyState: WebSocket.OPEN,
      send: (value) => messages.push(JSON.parse(value)),
    };
    const sample = (weaponToggle: boolean) => ({
      mx: 0,
      my: 0,
      confirm: false,
      upgrade: false,
      rotateBuild: false,
      weaponToggle,
      build: false,
      cancel: false,
      buildSlot: null,
      restart: false,
      pause: false,
      pauseTarget: null,
      debugSpawn: false,
      debugXp: false,
      queuedActions: [],
    });

    client.pump(sample(true));
    client.pump(sample(true));
    const pendingAfterSecondPulse = internals.pendingActions.map((action) => action.type);
    internals.nextSimTick = 1;
    client.pump(sample(false));
    internals.handle({
      type: 'tick-inputs',
      tick: 1,
      roster: internals.roster,
      inputs: [{
        playerId: 'p1',
        input: {
          mx: 0,
          my: 0,
          actions: [{ type: 'context_action', action: 'demolish', target: { id: 'bogus', index: 0 } }],
        },
      }],
    });
    return {
      pendingAfterSecondPulse,
      malformedActions: internals.bundles.get(1)?.inputs[0]?.input.actions ?? [],
      inputs: messages
        .filter((message) => message.type === 'input')
        .map((message) => ({ tick: message.tick, actions: message.input?.actions?.map((action) => action.type) ?? [] })),
    };
  });
  expect(sent.pendingAfterSecondPulse).toEqual(['weapon_toggle']);
  expect(sent.malformedActions).toEqual([]);
  expect(sent.inputs.filter((input) => input.actions.includes('weapon_toggle'))).toEqual([
    { tick: 0, actions: ['weapon_toggle'] },
    { tick: 4, actions: ['weapon_toggle'] },
  ]);
});

test('two clients advance 500 ticks with identical lockstep hashes', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab lockstep proof is enough');
  test.setTimeout(60_000);
  const code = await createRoom();
  const run = await openPair(browser, code);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await waitRoster(alice);
    await waitRoster(bob);
    await alice.keyboard.down('KeyW');
    await waitForTick(alice, 520);
    await waitForTick(bob, 520);
    await alice.keyboard.up('KeyW');

    const aliceState = await mpState(alice);
    const bobState = await mpState(bob);
    const [aliceHashState, bobHashState] = await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.lastMultiplayerHashState()),
      bob.evaluate(() => window.__GR_TEST__!.lastMultiplayerHashState()),
    ]);
    await writeReport(testInfo, 'identity', { alice: aliceState, bob: bobState });

    expect(aliceState.tick).toBeGreaterThanOrEqual(520);
    expect(bobState.tick).toBeGreaterThanOrEqual(520);
    expect(aliceState.hashes.length).toBeGreaterThanOrEqual(16);
    expect(aliceState.hashes).toEqual(bobState.hashes);
    expect(renderHeightPaths(aliceHashState?.state)).toEqual([]);
    expect(renderHeightPaths(bobHashState?.state)).toEqual([]);
    expect(aliceErrors.consoleErrors).toEqual([]);
    expect(aliceErrors.pageErrors).toEqual([]);
    expect(bobErrors.consoleErrors).toEqual([]);
    expect(bobErrors.pageErrors).toEqual([]);
  } finally {
    await run.close();
  }
});

test('hash mismatch pauses, shows the wire card, and restores from relay snapshot', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one injected-desync proof is enough');
  test.setTimeout(60_000);
  const code = await createRoom();
  const run = await openPair(browser, code, '&mpDesyncAt=60');
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await waitRoster(alice);
    await waitRoster(bob);
    await alice.keyboard.down('KeyW');
    await alice.waitForFunction(() => {
      const state = window.__GR_MP__?.state();
      return state && state.tick >= 110 && state.desyncs >= 1 && state.resyncs >= 1;
    }, undefined, { timeout: 20_000 });
    await bob.waitForFunction(() => {
      const state = window.__GR_MP__?.state();
      return state && state.tick >= 110 && state.desyncs >= 1 && state.resyncs >= 1;
    }, undefined, { timeout: 20_000 });
    await alice.keyboard.up('KeyW');

    await expect(alice.getByTestId('mp-desync-card')).toContainText('The wire crossed');
    const aliceState = await mpState(alice);
    const bobState = await mpState(bob);
    await writeReport(testInfo, 'desync-resync', { alice: aliceState, bob: bobState });

    expect(aliceState.paused).toBe(false);
    expect(bobState.paused).toBe(false);
    expect(aliceState.resyncs).toBeGreaterThanOrEqual(1);
    expect(bobState.resyncs).toBeGreaterThanOrEqual(1);
    expect(aliceErrors.consoleErrors).toEqual([]);
    expect(aliceErrors.pageErrors).toEqual([]);
    expect(bobErrors.consoleErrors).toEqual([]);
    expect(bobErrors.pageErrors).toEqual([]);
  } finally {
    await run.close();
  }
});

test('real elite and boss-group divergence restores exact future state for 120 ticks', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab convergence proof is enough');
  test.setTimeout(70_000);
  const code = await createRoom();
  const run = await openPair(browser, code, '', MP_CONVERGENCE_QUERY);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await waitRoster(alice);
    await waitRoster(bob);
    await waitForActors(alice);
    await waitForActors(bob);
    const resumeAt = await seedConvergenceScenario(alice, bob);

    const setupCheckpoint = Math.ceil((resumeAt + 15) / 30) * 30;
    await Promise.all([waitForTick(alice, setupCheckpoint + 2), waitForTick(bob, setupCheckpoint + 2)]);
    const [aliceSetup, bobSetup] = await Promise.all([mpState(alice), mpState(bob)]);
    const [aliceHashState, bobHashState] = await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.lastMultiplayerHashState()),
      bob.evaluate(() => window.__GR_TEST__!.lastMultiplayerHashState()),
    ]);
    expect(hashAt(aliceSetup, setupCheckpoint)).toBeTruthy();
    expect(
      hashAt(aliceSetup, setupCheckpoint),
      stateDifferences(aliceHashState?.state, bobHashState?.state).join('\n'),
    ).toBe(hashAt(bobSetup, setupCheckpoint));

    const hostName = aliceSetup.roster[0]?.name;
    const host = hostName === ALICE.name ? alice : bob;
    const divergent = host === alice ? bob : alice;
    const canonicalRoster = await suspendEnemyRoster(host);
    const baselineTimeAlive = (await gameDiagnostics(host)).timeAlive;
    expect(canonicalRoster).toHaveLength(4);
    expect(canonicalRoster.some((enemy) => enemy.eliteKind === 'baron')).toBe(true);
    expect(canonicalRoster.filter((enemy) => enemy.bossGroupId === 'railcar-alpha')).toHaveLength(3);

    await divergent.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(18, 18));
    await Promise.all([
      alice.waitForFunction(() => {
        const state = window.__GR_MP__?.state();
        return state && state.desyncs >= 1 && state.resyncs >= 1 && state.lastResyncTick !== null;
      }, undefined, { timeout: 20_000 }),
      bob.waitForFunction(() => {
        const state = window.__GR_MP__?.state();
        return state && state.desyncs >= 1 && state.resyncs >= 1 && state.lastResyncTick !== null;
      }, undefined, { timeout: 20_000 }),
    ]);

    const [aliceRestored, bobRestored] = await Promise.all([mpState(alice), mpState(bob)]);
    expect(aliceRestored.lastResyncTick).toBe(bobRestored.lastResyncTick);
    const restoredAt = aliceRestored.lastResyncTick!;
    const [aliceRestoredRoster, bobRestoredRoster] = await syncedHashedEnemyRosters(alice, bob, restoredAt + 1);
    expect(aliceRestoredRoster).toEqual(bobRestoredRoster);
    expect(aliceRestoredRoster).toHaveLength(canonicalRoster.length);
    expect(enemyRosterIdentity(aliceRestoredRoster)).toEqual(enemyRosterIdentity(canonicalRoster));
    await Promise.all([waitForTick(alice, restoredAt + 125), waitForTick(bob, restoredAt + 125)]);

    const [aliceRoster, bobRoster] = await syncedHashedEnemyRosters(alice, bob, restoredAt + 120);
    const [aliceFinal, bobFinal, aliceGame, bobGame] = await Promise.all([
      mpState(alice),
      mpState(bob),
      gameDiagnostics(alice),
      gameDiagnostics(bob),
    ]);
    expect(aliceRoster).toEqual(bobRoster);
    expect(aliceRoster).toHaveLength(canonicalRoster.length);
    expect(enemyRosterIdentity(aliceRoster)).toEqual(enemyRosterIdentity(canonicalRoster));
    expect(aliceGame.timeAlive).toBeGreaterThan(baselineTimeAlive + 3.5);
    expect(bobGame.timeAlive).toBeGreaterThan(baselineTimeAlive + 3.5);
    expect(aliceRoster.some((enemy, index) => enemy.hp < (canonicalRoster[index]?.hp ?? enemy.hp))).toBe(true);
    for (const offset of [30, 60, 90, 120]) {
      expect(hashAt(aliceFinal, restoredAt + offset), `Alice hash at +${offset}`).toBeTruthy();
      expect(hashAt(aliceFinal, restoredAt + offset)).toBe(hashAt(bobFinal, restoredAt + offset));
    }
    expect(aliceFinal).toMatchObject({ paused: false, desyncs: 1, resyncs: 1, error: null });
    expect(bobFinal).toMatchObject({ paused: false, desyncs: 1, resyncs: 1, error: null });
    expect(aliceErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    expect(bobErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    await writeReport(testInfo, 'real-divergence-convergence', {
      restoredAt,
      canonicalRoster,
      hashes: [30, 60, 90, 120].map((offset) => ({ tick: restoredAt + offset, hash: hashAt(aliceFinal, restoredAt + offset) })),
      alice: aliceFinal,
      bob: bobFinal,
    });
  } finally {
    await run.close();
  }
});

test('two clients promote both roster slots to real local-camera heroes and shared run credit', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab lockstep proof is enough');
  test.setTimeout(60_000);
  const code = await createRoom();
  const run = await openPair(browser, code);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await waitRoster(alice);
    await waitRoster(bob);
    await waitForActors(alice);
    await waitForActors(bob);

    const aliceInitial = await gameDiagnostics(alice);
    const bobInitial = await gameDiagnostics(bob);
    assertSameRosterSlots(aliceInitial.actors, bobInitial.actors);
    assertLocalHero(aliceInitial, ALICE.name);
    assertLocalHero(bobInitial, BOB.name);
    const initialAliceActor = actorByName(aliceInitial.actors, ALICE.name);
    const initialBobActor = actorByName(aliceInitial.actors, BOB.name);
    const spawnDistance = distance2d(initialAliceActor.position, initialBobActor.position);
    expect(spawnDistance).toBeGreaterThan(2);
    expect(spawnDistance).toBeLessThan(3.2);

    await expect(alice.getByTestId('mp-rider-chip')).toBeVisible();
    await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.name);
    await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.town);
    await expect(bob.getByTestId('mp-rider-chip')).toBeVisible();
    await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.name);
    await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.town);

    const aliceCamera = await localScreenDistance(alice);
    const bobCamera = await localScreenDistance(bob);
    expect(aliceCamera.inView).toBe(true);
    expect(aliceCamera.distance).toBeLessThan(260);
    expect(bobCamera.inView).toBe(true);
    expect(bobCamera.distance).toBeLessThan(260);

    await bob.keyboard.press('KeyQ');
    await expect
      .poll(async () => {
        const [aliceView, bobView] = await Promise.all([gameDiagnostics(alice), gameDiagnostics(bob)]);
        return { alice: aliceView.arsenal.active, bob: bobView.arsenal.active };
      }, { timeout: 5_000 })
      .toEqual({ alice: 'blast', bob: 'blast' });
    await bob.keyboard.press('KeyQ');
    await expect
      .poll(async () => {
        const [aliceView, bobView] = await Promise.all([gameDiagnostics(alice), gameDiagnostics(bob)]);
        return { alice: aliceView.arsenal.active, bob: bobView.arsenal.active };
      }, { timeout: 5_000 })
      .toEqual({ alice: 'rig', bob: 'rig' });

    let movedPair: [ActorDiagnostic[], ActorDiagnostic[]] | null = null;
    await alice.keyboard.down('KeyW');
    try {
      await waitForTick(alice, 240);
      await waitForTick(bob, 240);
      movedPair = await syncedHashedActorDiagnostics(alice, bob, 240);
    } finally {
      await alice.keyboard.up('KeyW');
    }
    if (!movedPair) throw new Error('missing synced multiplayer diagnostics');
    const [aliceMoved, bobMoved] = movedPair;

    assertSameRosterSlots(aliceMoved, bobMoved);
    const movedAliceOnAlice = actorByName(aliceMoved, ALICE.name);
    const movedAliceOnBob = actorByName(bobMoved, ALICE.name);
    const movedBobOnAlice = actorByName(aliceMoved, BOB.name);
    expect(distance2d(initialAliceActor.position, movedAliceOnAlice.position)).toBeGreaterThan(0.5);
    expect(distance2d(movedAliceOnAlice.position, movedAliceOnBob.position)).toBeLessThan(0.06);
    expect(distance2d(actorByName(aliceMoved, BOB.name).position, actorByName(bobMoved, BOB.name).position)).toBeLessThan(0.06);

    const independentStartTick = Math.max((await mpState(alice)).tick, (await mpState(bob)).tick);
    await Promise.all([alice.keyboard.down('KeyA'), bob.keyboard.down('KeyD')]);
    let independentPair: [ActorDiagnostic[], ActorDiagnostic[]] | null = null;
    try {
      await Promise.all([waitForTick(alice, independentStartTick + 75), waitForTick(bob, independentStartTick + 75)]);
      independentPair = await syncedHashedActorDiagnostics(alice, bob, independentStartTick + 75);
    } finally {
      await Promise.all([alice.keyboard.up('KeyA'), bob.keyboard.up('KeyD')]);
    }
    if (!independentPair) throw new Error('missing independently moved multiplayer diagnostics');
    const [aliceIndependent, bobIndependent] = independentPair;
    assertSameRosterSlots(aliceIndependent, bobIndependent);
    expect(distance2d(movedAliceOnAlice.position, actorByName(aliceIndependent, ALICE.name).position)).toBeGreaterThan(0.5);
    expect(distance2d(movedBobOnAlice.position, actorByName(aliceIndependent, BOB.name).position)).toBeGreaterThan(0.5);

    const aliceState = await mpState(alice);
    const bobState = await mpState(bob);
    await writeReport(testInfo, 'mp-03-second-hero', { alice: aliceIndependent, bob: bobIndependent, mp: { alice: aliceState, bob: bobState } }, MP03_ARTIFACT_DIR);
    expect(aliceState.tick).toBeGreaterThanOrEqual(240);
    expect(bobState.tick).toBeGreaterThanOrEqual(240);
    expect(aliceState.hashes.length).toBeGreaterThanOrEqual(6);
    expect(aliceState.hashes).toEqual(bobState.hashes);

    await shotMp03(alice, testInfo, 'alice-two-heroes');
    await shotMp03(bob, testInfo, 'bob-two-heroes');

    await Promise.all([alice.evaluate(() => window.__GR_TEST__?.endRunForTest()), bob.evaluate(() => window.__GR_TEST__?.endRunForTest())]);
    await expect(alice.getByTestId('mp-run-riders')).toContainText('Alice of Dawn Claim');
    await expect(alice.getByTestId('mp-run-riders')).toContainText('Bob of River Bend');
    await expect(bob.getByTestId('mp-run-riders')).toContainText('Alice of Dawn Claim');
    await expect(bob.getByTestId('mp-run-riders')).toContainText('Bob of River Bend');

    const aliceScores = await scoresFor(alice, ALICE.id);
    const bobScores = await scoresFor(bob, BOB.id);
    expect(aliceScores[0]?.profileName).toBe(ALICE.name);
    expect(bobScores[0]?.profileName).toBe(BOB.name);
    expect(sharedScoreShape(aliceScores[0])).toEqual(sharedScoreShape(bobScores[0]));
    expect(aliceErrors.consoleErrors).toEqual([]);
    expect(aliceErrors.pageErrors).toEqual([]);
    expect(bobErrors.consoleErrors).toEqual([]);
    expect(bobErrors.pageErrors).toEqual([]);
  } finally {
    await run.close();
  }
});

test('both riders place buildings and pick upgrades with equal hashes for 300 ticks', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab action-stream proof is enough');
  test.setTimeout(75_000);
  const code = await createRoom();
  const run = await openPair(browser, code, '', MP_ACTION_QUERY);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await Promise.all([waitRoster(alice), waitRoster(bob), waitForActors(alice), waitForActors(bob)]);
    const isolationStartTick = Math.max((await mpState(alice)).tick, (await mpState(bob)).tick);
    const aliceBeforeLedger = actorByName((await gameDiagnostics(alice)).actors, ALICE.name).position;
    await alice.evaluate(async () => {
      const { requestOpenClaimLedger } = await import('../src/encyclopedia/events');
      requestOpenClaimLedger();
    });
    await expect(alice.getByTestId('claim-ledger')).toBeVisible();
    await alice.keyboard.down('KeyW');
    try {
      await Promise.all([waitForTick(alice, isolationStartTick + 45), waitForTick(bob, isolationStartTick + 45)]);
    } finally {
      await alice.keyboard.up('KeyW');
    }
    const aliceAfterLedger = actorByName((await gameDiagnostics(alice)).actors, ALICE.name).position;
    expect(distance2d(aliceBeforeLedger, aliceAfterLedger)).toBeLessThan(0.06);
    expect((await gameDiagnostics(alice)).paused).toBe(false);
    expect((await gameDiagnostics(bob)).paused).toBe(false);
    await alice.keyboard.press('Escape');
    await expect(alice.getByTestId('claim-ledger')).toHaveCount(0);
    await alice.getByTestId('hud-build').click();
    await expect(alice.getByTestId('hud-build-menu')).toBeVisible();
    await alice.keyboard.press('Escape');
    await expect(alice.getByTestId('hud-build-menu')).toBeHidden();
    await expect.poll(async () => ({
      alice: (await gameDiagnostics(alice)).paused,
      bob: (await gameDiagnostics(bob)).paused,
    })).toEqual({ alice: false, bob: false });
    await seedActionScenario(alice, bob);

    await expect(alice.getByTestId('upgrade-overlay')).toHaveAttribute('aria-hidden', 'false');
    await expect(bob.getByTestId('upgrade-overlay')).toHaveAttribute('aria-hidden', 'false');
    await alice.getByTestId('upgrade-card-0').click();
    await expect.poll(() => totalUpgradeStacks(alice)).toBe(1);
    await expect.poll(() => totalUpgradeStacks(bob)).toBe(1);
    await bob.getByTestId('upgrade-card-0').click();
    await expect.poll(() => totalUpgradeStacks(alice)).toBe(2);
    await expect.poll(() => totalUpgradeStacks(bob)).toBe(2);

    const bobPresentationBeforeRemoteBuild = await bob.evaluate(() => ({
      mode: window.__THREE_GAME_DIAGNOSTICS__!.build.mode,
      selected: window.__THREE_GAME_DIAGNOSTICS__!.build.selectedBuildable,
    }));
    const alicePlacement = await placeBuildFromRider(alice, 'sentry_beacon', { x: -2, z: -2 });
    await expect.poll(async () => (await gameDiagnostics(bob)).build.beacons).toBe(1);
    await expect.poll(() => bob.evaluate(() => ({
      mode: window.__THREE_GAME_DIAGNOSTICS__!.build.mode,
      selected: window.__THREE_GAME_DIAGNOSTICS__!.build.selectedBuildable,
    }))).toEqual(bobPresentationBeforeRemoteBuild);
    const bobPlacement = await placeBuildFromRider(bob, 'palisade', { x: 2, z: 2 });
    await expect.poll(async () => (await gameDiagnostics(alice)).build.palisades).toBe(1);
    expect(alicePlacement).not.toEqual(bobPlacement);

    const actionTick = Math.max((await mpState(alice)).tick, (await mpState(bob)).tick);
    await Promise.all([waitForTick(alice, actionTick + 330), waitForTick(bob, actionTick + 330)]);
    const [aliceGame, bobGame, aliceState, bobState] = await Promise.all([
      gameDiagnostics(alice),
      gameDiagnostics(bob),
      mpState(alice),
      mpState(bob),
    ]);
    expect(aliceGame.build.beaconPositions).toEqual(bobGame.build.beaconPositions);
    expect(aliceGame.build.palisadePositions).toEqual(bobGame.build.palisadePositions);
    expect(aliceGame.build.beaconPositions).toEqual([alicePlacement]);
    expect(aliceGame.build.palisadePositions).toEqual([bobPlacement]);
    expect(aliceGame.progression.stacks).toEqual(bobGame.progression.stacks);
    expect(aliceGame.economy.state).toEqual(bobGame.economy.state);
    expect(aliceState.hashes).toEqual(bobState.hashes);
    const postActionHashes = aliceState.hashes.filter(({ tick }) => tick >= actionTick);
    expect(postActionHashes.length).toBeGreaterThanOrEqual(10);
    expect(postActionHashes.at(-1)?.tick).toBeGreaterThanOrEqual(actionTick + 300);
    expect(aliceState.desyncs).toBe(0);
    expect(bobState.desyncs).toBe(0);
    expect(aliceErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    expect(bobErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    await writeReport(testInfo, 'lockstep-actions', {
      actionTick,
      finalTick: Math.min(aliceState.tick, bobState.tick),
      buildings: {
        beacons: aliceGame.build.beaconPositions,
        palisades: aliceGame.build.palisadePositions,
      },
      upgrades: aliceGame.progression.stacks,
      hashes: aliceState.hashes,
    });
  } finally {
    await run.close();
  }
});

test('town Ride Together card creates a claim word and joins two named riders', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab town flow proof is enough');
  test.setTimeout(70_000);
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();
  const aliceErrors = collectErrors(alice);
  const bobErrors = collectErrors(bob);
  try {
    await openTownBoard(alice, ALICE);
    await expect(alice.getByTestId('ride-together-card')).toBeVisible();
    await shotMp04(alice, testInfo, 'card');
    await alice.getByTestId('ride-open-claim').click();
    await expect(alice.getByTestId('ride-code-word')).not.toHaveText('No claim open', { timeout: 15_000 });
    const phrase = ((await alice.getByTestId('ride-code-word').textContent()) ?? '').trim();
    expect(phrase).toMatch(/^[A-Z]+-[A-Z]+-[0-9A-V]{20}$/);
    await alice.getByTestId('ride-start').click();
    await alice.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });

    await openTownBoard(bob, BOB);
    await bob.getByTestId('ride-join-input').fill(phrase);
    await shotMp04(bob, testInfo, 'join');
    await bob.getByTestId('ride-join-submit').click();
    await waitRoster(alice);
    await waitRoster(bob);
    await waitForActors(alice);
    await waitForActors(bob);

    await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.name);
    await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.town);
    await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.name);
    await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.town);
    await shotMp04(alice, testInfo, 'two-named-riders');

    const [aliceDiagnostics, bobDiagnostics] = await syncedGameDiagnostics(alice, bob, 120, 3);
    assertSameRosterSlots(aliceDiagnostics.actors, bobDiagnostics.actors);
    assertLocalHero(aliceDiagnostics, ALICE.name);
    assertLocalHero(bobDiagnostics, BOB.name);
    expect(aliceErrors.consoleErrors).toEqual([]);
    expect(aliceErrors.pageErrors).toEqual([]);
    expect(bobErrors.consoleErrors).toEqual([]);
    expect(bobErrors.pageErrors).toEqual([]);
  } finally {
    await aliceContext.close();
    await bobContext.close();
  }
});

test('town Ride Together invalid word stays friendly at 390px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 740 });
  const errors = collectErrors(page);
  await openTownBoard(page, ALICE);
  await page.getByTestId('ride-join-input').fill('QUIET-CLAIM');
  await page.getByTestId('ride-join-submit').click();
  await expect(page.getByTestId('ride-status')).toContainText("That claim's gone quiet.");
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await shotMp04(page, testInfo, 'mobile-390-invalid-word');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function openPair(browser: Browser, code: string, bobExtra = '', query = MP_QUERY): Promise<{
  alice: Page;
  bob: Page;
  aliceErrors: ErrorBucket;
  bobErrors: ErrorBucket;
  close: () => Promise<void>;
}> {
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();
  const aliceErrors = collectErrors(alice);
  const bobErrors = collectErrors(bob);
  await Promise.all([
    openClient(alice, code, ALICE, '', query),
    openClient(bob, code, BOB, bobExtra, query),
  ]);
  return {
    alice,
    bob,
    aliceErrors,
    bobErrors,
    close: async () => {
      await aliceContext.close();
      await bobContext.close();
    },
  };
}

async function openClient(page: Page, code: string, player: MpPlayerSeed, extra = '', query = MP_QUERY): Promise<void> {
  await seedProfile(page, player);
  const fullQuery = `${query}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(player.name)}&mpTown=${encodeURIComponent(player.town)}${extra}`;
  await page.goto(`/?${fullQuery}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
}

async function seedProfile(page: Page, player: MpPlayerSeed): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, scoreKey, relayKey, relayUrl, player: seeded }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(relayKey, relayUrl);
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: seeded.id,
          profiles: [
            {
              id: seeded.id,
              name: seeded.name,
              createdAt: 1,
              updatedAt: 1,
              difficultyPreset: 'trail',
              hintsSeen: [],
            },
          ],
        }),
      );
      localStorage.setItem(townKey, seeded.town);
      localStorage.setItem(scoreKey, '[]');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(player.id, TOWN_NAME_KEY),
      scoreKey: profileDataKey(player.id, SCOREBOARD_KEY),
      relayKey: 'gr.mp.relayBase.v1',
      relayUrl: relay.url,
      player,
    },
  );
}

async function openTownBoard(page: Page, player: MpPlayerSeed): Promise<void> {
  await seedProfile(page, player);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 15_000 });
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function waitRoster(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_MP__?.state()?.roster.length ?? 0) === 2, undefined, { timeout: 10_000 });
}

async function waitForTick(page: Page, tick: number): Promise<void> {
  await page.waitForFunction((target) => (window.__GR_MP__?.state()?.tick ?? 0) >= target, tick, { timeout: 30_000 });
}

async function waitForActors(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const actors = window.__THREE_GAME_DIAGNOSTICS__?.actors?.filter((actor) => actor.visible) ?? [];
    return actors.length === 2 && actors.some((actor) => actor.local) && actors.some((actor) => !actor.local);
  }, undefined, { timeout: 15_000 });
}

async function seedConvergenceScenario(source: Page, peer: Page): Promise<number> {
  await Promise.all([
    source.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
    peer.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  ]);
  await source.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.setWave(7);
    test.spawnPack(1, 4, {
      speedScale: 0,
      hpScale: 25,
      eliteKind: 'baron',
      visualScale: 2.6,
      banner: true,
      contactDamageScale: 1.7,
      buildingDamageScale: 2.1,
      supportBuildingDamageScale: 1.4,
      heroPursuitRange: 34,
      variantId: 'baron-convergence',
      variantLabel: 'Ledger Baron',
      tint: '#a0522d',
      boltDamageMult: 0.7,
    });
    for (let component = 0; component < 3; component += 1) {
      test.spawnPack(1, 6 + component, {
        speedScale: 0,
        hpScale: 25 + component,
        eliteKind: 'railcar',
        visualScale: 1.5 + component * 0.1,
        contactDamageScale: 1.2,
        buildingDamageScale: 1.6,
        supportBuildingDamageScale: 1.3,
        heroPursuitRange: 26,
        variantId: `railcar-${component + 1}`,
        variantLabel: `Railcar ${component + 1}`,
        tint: '#5b8a8a',
        boltDamageMult: 0.85,
        bossGroupId: 'railcar-alpha',
        bossGroupSize: 3,
        bossGroupTotalHp: 420,
        bossComponentId: `component-${component + 1}`,
        bossComponentLabel: `Car ${component + 1}`,
        bossDegradeSpeedMult: 0.82,
      });
    }
  });
  const snapshot = await source.evaluate(() => window.__GR_TEST__!.captureSuspend());
  const restored = await Promise.all([
    source.evaluate(async (saved) => {
      const ok = window.__GR_TEST__!.restoreSuspend(saved);
      const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
      return { ok, failure: suspend.runSuspendRestoreFailure() };
    }, snapshot),
    peer.evaluate(async (saved) => {
      const ok = window.__GR_TEST__!.restoreSuspend(saved);
      const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
      return { ok, failure: suspend.runSuspendRestoreFailure() };
    }, snapshot),
  ]);
  expect(restored).toEqual([{ ok: true, failure: null }, { ok: true, failure: null }]);
  const currentTick = Math.max((await mpState(source)).tick, (await mpState(peer)).tick);
  const resumeAt = currentTick + 15;
  await Promise.all([
    source.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
    peer.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  ]);
  return resumeAt;
}

async function seedActionScenario(source: Page, peer: Page): Promise<void> {
  await Promise.all([
    source.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
    peer.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  ]);
  await source.evaluate(() => {
    window.__GR_TEST__!.grantGold(500);
    window.__GR_TEST__!.grantXp(40);
  });
  const snapshot = await source.evaluate(() => window.__GR_TEST__!.captureSuspend());
  const restored = await Promise.all([
    source.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
    peer.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
  ]);
  expect(restored).toEqual([true, true]);
  const resumeAt = Math.max((await mpState(source)).tick, (await mpState(peer)).tick) + 15;
  await Promise.all([
    source.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
    peer.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  ]);
  await Promise.all([waitForTick(source, resumeAt + 1), waitForTick(peer, resumeAt + 1)]);
}

async function totalUpgradeStacks(page: Page): Promise<number> {
  return page.evaluate(() => Object.values(window.__THREE_GAME_DIAGNOSTICS__!.progression.stacks).reduce((sum, count) => sum + count, 0));
}

async function placeBuildFromRider(
  page: Page,
  id: 'sentry_beacon' | 'palisade',
  offset: { x: number; z: number },
): Promise<{ x: number; z: number }> {
  const menu = page.getByTestId('hud-build-menu');
  for (let attempt = 0; attempt < 3 && !(await menu.isVisible()); attempt += 1) {
    await page.getByTestId('hud-build').click();
    await page.waitForTimeout(120);
  }
  await expect(menu).toBeVisible();
  await page.getByTestId(`hud-build-tile-${id}`).click();
  await expect.poll(async () => (await gameDiagnostics(page)).build.selectedBuildable).toBe(id);
  const point = await page.evaluate(({ dx, dz }) => {
    const local = window.__THREE_GAME_DIAGNOSTICS__!.actors.find((actor) => actor.local && actor.visible)!;
    const x = local.position.x + dx;
    const z = local.position.z + dz;
    return {
      ...window.__GR_TEST__!.screenPoint(x, z, 0.1),
      expected: { x: Math.round(x), z: Math.round(z) },
    };
  }, { dx: offset.x, dz: offset.z });
  expect(point.inView).toBe(true);
  await page.locator('#game-canvas').click({ position: { x: point.x, y: point.y } });
  const countKey = id === 'sentry_beacon' ? 'beacons' : 'palisades';
  await expect.poll(async () => (await gameDiagnostics(page)).build[countKey]).toBe(1);
  return point.expected;
}

async function suspendEnemyRoster(page: Page): Promise<ReturnType<typeof sortEnemyRoster>> {
  const roster = await page.evaluate(() => window.__GR_TEST__!.captureSuspend().enemies.active);
  return sortEnemyRoster(roster);
}

async function syncedHashedEnemyRosters(
  left: Page,
  right: Page,
  minTick: number,
): Promise<[ReturnType<typeof sortEnemyRoster>, ReturnType<typeof sortEnemyRoster>]> {
  const capture = (page: Page) =>
    page.evaluate(() => {
      const latest = window.__GR_TEST__!.lastMultiplayerHashState();
      const run = latest?.state && typeof latest.state === 'object'
        ? (latest.state as { run?: { enemies?: { active?: unknown } } }).run
        : undefined;
      return {
        tick: latest?.tick ?? 0,
        roster: Array.isArray(run?.enemies?.active) ? run.enemies.active : [],
      };
    });
  const deadline = Date.now() + 10_000;
  let lastTicks = 'none';
  while (Date.now() < deadline) {
    const [leftState, rightState] = await Promise.all([capture(left), capture(right)]);
    lastTicks = `${leftState.tick}/${rightState.tick}`;
    if (leftState.tick >= minTick && leftState.tick === rightState.tick) {
      return [
        sortEnemyRoster(leftState.roster as Array<import('../src/entities/Enemy').EnemySuspendSnapshot>),
        sortEnemyRoster(rightState.roster as Array<import('../src/entities/Enemy').EnemySuspendSnapshot>),
      ];
    }
    await left.waitForTimeout(40);
  }
  throw new Error(`clients did not publish a shared roster hash at tick >= ${minTick}; last hash ticks ${lastTicks}`);
}

async function syncedHashedActorDiagnostics(
  left: Page,
  right: Page,
  minTick: number,
): Promise<[ActorDiagnostic[], ActorDiagnostic[]]> {
  const capture = (page: Page) =>
    page.evaluate(() => {
      const latest = window.__GR_TEST__!.lastMultiplayerHashState();
      const actorSnapshots = latest?.state && typeof latest.state === 'object'
        ? (latest.state as {
            actors?: Array<{
              hp: number;
              position: { x: number; z: number };
              velocity: { x: number; z: number };
              visible: boolean;
            }>;
          }).actors
        : undefined;
      const liveActors = (window.__THREE_GAME_DIAGNOSTICS__?.actors ?? []).filter((actor) => actor.visible);
      const hash = window.__GR_MP__?.state()?.hashes.find((entry) => entry.tick === latest?.tick)?.hash ?? null;
      const actors: ActorDiagnostic[] = [];
      if (Array.isArray(actorSnapshots)) {
        for (let slot = 0; slot < actorSnapshots.length; slot += 1) {
          const saved = actorSnapshots[slot];
          const live = liveActors[slot];
          if (!saved || !live) continue;
          actors.push({
            ...live,
            hp: saved.hp,
            position: { ...live.position, x: saved.position.x, z: saved.position.z },
            speed: Math.hypot(saved.velocity.x, saved.velocity.z),
            visible: saved.visible,
          });
        }
      }
      return { tick: latest?.tick ?? 0, hash, actors };
    });
  const deadline = Date.now() + 10_000;
  let lastTicks = 'none';
  while (Date.now() < deadline) {
    const [leftState, rightState] = await Promise.all([capture(left), capture(right)]);
    lastTicks = `${leftState.tick}/${rightState.tick}`;
    if (
      leftState.tick >= minTick &&
      leftState.tick === rightState.tick &&
      leftState.hash !== null &&
      leftState.hash === rightState.hash &&
      leftState.actors.length > 0 &&
      leftState.actors.length === rightState.actors.length
    ) {
      return [leftState.actors, rightState.actors];
    }
    await left.waitForTimeout(40);
  }
  throw new Error(`clients did not publish shared actor diagnostics at tick >= ${minTick}; last hash ticks ${lastTicks}`);
}

function sortEnemyRoster(roster: Array<import('../src/entities/Enemy').EnemySuspendSnapshot>) {
  return [...roster].sort((left, right) => left.slot - right.slot);
}

function enemyRosterIdentity(roster: ReturnType<typeof sortEnemyRoster>) {
  return roster.map((enemy) => ({
    slot: enemy.slot,
    maxHp: enemy.maxHp,
    speed: enemy.speed,
    eliteKind: enemy.eliteKind,
    visualScale: enemy.visualScale,
    banner: enemy.banner,
    contactDamageScale: enemy.contactDamageScale,
    buildingDamageScale: enemy.buildingDamageScale,
    supportBuildingDamageScale: enemy.supportBuildingDamageScale,
    heroPursuitRange: enemy.heroPursuitRange,
    variantId: enemy.variantId,
    variantLabel: enemy.variantLabel,
    variantTint: enemy.variantTint,
    boltDamageMult: enemy.boltDamageMult,
    bossGroupId: enemy.bossGroupId,
    bossGroupSize: enemy.bossGroupSize,
    bossGroupTotalHp: enemy.bossGroupTotalHp,
    bossComponentId: enemy.bossComponentId,
    bossComponentLabel: enemy.bossComponentLabel,
    bossDegradeSpeedMult: enemy.bossDegradeSpeedMult,
    thief: enemy.thief,
    wrecker: enemy.wrecker,
  }));
}

function stateDifferences(left: unknown, right: unknown, path = 'state', output: string[] = []): string[] {
  if (output.length >= 24 || Object.is(left, right)) return output;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
    output.push(`${path}: ${JSON.stringify(left)} != ${JSON.stringify(right)}`);
    return output;
  }
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)]);
  for (const key of keys) stateDifferences(leftRecord[key], rightRecord[key], `${path}.${key}`, output);
  return output;
}

function hashAt(state: MpState, tick: number): string | undefined {
  return state.hashes.find((entry) => entry.tick === tick)?.hash;
}

function renderHeightPaths(value: unknown, path = '$', output: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => renderHeightPaths(entry, `${path}[${index}]`, output));
    return output;
  }
  if (!value || typeof value !== 'object') return output;
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'y') output.push(`${path}.y`);
    else renderHeightPaths(nested, `${path}.${key}`, output);
  }
  return output;
}

async function mpState(page: Page): Promise<MpState> {
  return page.evaluate(() => window.__GR_MP__!.state()!);
}

async function gameDiagnostics(page: Page): Promise<ThreeGameDiagnostics> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function syncedGameDiagnostics(
  left: Page,
  right: Page,
  minTick: number,
  maxTickDelta = 0,
): Promise<[ThreeGameDiagnostics, ThreeGameDiagnostics]> {
  const deadline = Date.now() + 10_000;
  let lastTicks = 'none';
  while (Date.now() < deadline) {
    const [leftDiagnostics, rightDiagnostics] = await Promise.all([gameDiagnostics(left), gameDiagnostics(right)]);
    const leftTick = leftDiagnostics.mp?.tick ?? 0;
    const rightTick = rightDiagnostics.mp?.tick ?? 0;
    lastTicks = `${leftTick}/${rightTick}`;
    if (leftTick >= minTick && rightTick >= minTick && Math.abs(leftTick - rightTick) <= maxTickDelta) {
      return [leftDiagnostics, rightDiagnostics];
    }
    await left.waitForTimeout(40);
  }
  throw new Error(`clients did not align on a shared tick >= ${minTick}; last ticks ${lastTicks}`);
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function writeReport(testInfo: TestInfo, name: string, body: unknown, artifactDir = ARTIFACT_DIR): Promise<void> {
  const text = `${JSON.stringify(body, null, 2)}\n`;
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, `${name}.json`), text);
  await testInfo.attach(name, { body: text, contentType: 'application/json' });
}

async function shotMp03(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(MP03_ARTIFACT_DIR, { recursive: true });
  const file = path.join(MP03_ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(name, { path: file, contentType: 'image/png' });
}

async function shotMp04(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(MP04_ARTIFACT_DIR, { recursive: true });
  const file = path.join(MP04_ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  await testInfo.attach(name, { path: file, contentType: 'image/png' });
}

async function localScreenDistance(page: Page): Promise<{ distance: number; inView: boolean }> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    const local = diagnostics.actors.find((actor) => actor.local && actor.visible)!;
    const screen = window.__GR_TEST__!.screenPoint(local.position.x, local.position.z, 1);
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return { distance: Math.hypot(screen.x - center.x, screen.y - center.y), inView: screen.inView };
  });
}

async function scoresFor(page: Page, profileId: string): Promise<ScoreRecord[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]') as ScoreRecord[], profileDataKey(profileId, SCOREBOARD_KEY));
}

function assertSameRosterSlots(left: ActorDiagnostic[], right: ActorDiagnostic[], positionTolerance = 0.06): void {
  const visibleLeft = left.filter((actor) => actor.visible).sort((a, b) => a.slot - b.slot);
  const visibleRight = right.filter((actor) => actor.visible).sort((a, b) => a.slot - b.slot);
  expect(visibleLeft.map((actor) => [actor.slot, actor.name, actor.town])).toEqual(visibleRight.map((actor) => [actor.slot, actor.name, actor.town]));
  for (const actor of visibleLeft) {
    const peer = visibleRight.find((candidate) => candidate.slot === actor.slot);
    expect(peer).toBeTruthy();
    expect(distance2d(actor.position, peer!.position)).toBeLessThan(positionTolerance);
  }
}

function assertLocalHero(diagnostics: ThreeGameDiagnostics, name: string): void {
  const local = diagnostics.actors.find((actor) => actor.local && actor.visible);
  expect(local?.name).toBe(name);
  expect(distance2d(diagnostics.heroPos, local!.position)).toBeLessThan(0.06);
}

function actorByName(actors: ActorDiagnostic[], name: string): ActorDiagnostic {
  const actor = actors.find((entry) => entry.visible && entry.name === name);
  expect(actor, `missing actor ${name}`).toBeTruthy();
  return actor!;
}

function distance2d(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function sharedScoreShape(score: ScoreRecord | undefined): Pick<ScoreRecord, 'waves' | 'kills' | 'gold' | 'secured' | 'contractId'> {
  expect(score).toBeTruthy();
  return {
    waves: score!.waves,
    kills: score!.kills,
    gold: score!.gold,
    secured: score!.secured,
    contractId: score!.contractId,
  };
}

async function createRoom(): Promise<string> {
  const response = await fetch(`${relay.url}/api/multiplayer/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: 'http://127.0.0.1:5188' },
    body: '{}',
  });
  const body = (await response.json()) as { code?: string; error?: string };
  if (!response.ok || !body.code) throw new Error(body.error ?? 'room_create_failed');
  return body.code;
}

async function startRelayEnv(): Promise<RelayEnv> {
  await rm(STATE_ROOT, { recursive: true, force: true });
  const worker = await startRoomWorker();
  try {
    const pages = await startPages(worker);
    return {
      url: pages.url,
      worker,
      pages,
      stop: async () => {
        await pages.stop();
        await worker.stop();
      },
    };
  } catch (error) {
    await worker.stop();
    throw error;
  }
}

async function startRoomWorker(): Promise<RelayProcess> {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, 'room-worker');
  const configPath = path.join(STATE_ROOT, 'wrangler-mp-room.jsonc');
  await mkdir(STATE_ROOT, { recursive: true });
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        name: SCRIPT_NAME,
        main: path.relative(STATE_ROOT, path.join(ROOT, 'functions/api/_multiplayer.ts')),
        compatibility_date: '2026-07-08',
        durable_objects: {
          bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }],
        },
        migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
      },
      null,
      2,
    )}\n`,
  );
  return spawnWrangler([
    'dev',
    '--config',
    configPath,
    '--port',
    String(port),
    '--ip',
    '127.0.0.1',
    '--persist-to',
    persistPath,
    '--log-level',
    'error',
    '--show-interactive-dev-session=false',
  ], port);
}

async function startPages(worker: RelayProcess): Promise<RelayProcess> {
  const port = await freePort();
  const child = await spawnWrangler([
    'pages',
    'dev',
    'public',
    '--port',
    String(port),
    '--ip',
    '127.0.0.1',
    '--persist-to',
    path.join(STATE_ROOT, 'pages'),
    '--compatibility-date',
    '2026-07-08',
    '--log-level',
    'error',
    '--show-interactive-dev-session=false',
    '--do',
    `MULTIPLAYER_ROOMS=MultiplayerRoom@${SCRIPT_NAME}`,
    '--kv',
    'MULTIPLAYER_RATE_LIMITS',
  ], port);
  await waitForServer(worker.url, '/');
  return child;
}

async function spawnWrangler(args: string[], port: number): Promise<RelayProcess> {
  const child = spawn('wrangler', args, {
    cwd: ROOT,
    env: cleanEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, args[0] === 'pages' ? '/api/multiplayer/create' : '/', () => {
    if (child.exitCode !== null) throw new Error(`wrangler exited early:\n${output}`);
  });
  return {
    url,
    stop: async () => {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve(undefined);
        });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

async function waitForServer(url: string, route = '/', check?: () => void): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < 25_000) {
    check?.();
    try {
      const response = await fetch(`${url}${route}`, {
        method: route === '/' ? 'GET' : 'OPTIONS',
        headers: { Origin: 'http://127.0.0.1:5188' },
      });
      if (response.status < 500 || response.status === 503) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`server did not become ready: ${url}${route}`);
}

function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.AUTH_CODE_PEPPER;
  return env;
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('No free port'));
      });
    });
    server.on('error', reject);
  });
}
