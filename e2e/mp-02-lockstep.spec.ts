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
const MP_QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&nokill&seed=mp-02-lockstep';
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
    await writeReport(testInfo, 'identity', { alice: aliceState, bob: bobState });

    expect(aliceState.tick).toBeGreaterThanOrEqual(520);
    expect(bobState.tick).toBeGreaterThanOrEqual(520);
    expect(aliceState.hashes.length).toBeGreaterThanOrEqual(16);
    expect(aliceState.hashes).toEqual(bobState.hashes);
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

    let movedPair: [ThreeGameDiagnostics, ThreeGameDiagnostics] | null = null;
    await alice.keyboard.down('KeyW');
    try {
      await waitForTick(alice, 240);
      await waitForTick(bob, 240);
      movedPair = await syncedGameDiagnostics(alice, bob, 240);
    } finally {
      await alice.keyboard.up('KeyW');
    }
    if (!movedPair) throw new Error('missing synced multiplayer diagnostics');
    const [aliceMoved, bobMoved] = movedPair;

    assertSameRosterSlots(aliceMoved.actors, bobMoved.actors);
    const movedAliceOnAlice = actorByName(aliceMoved.actors, ALICE.name);
    const movedAliceOnBob = actorByName(bobMoved.actors, ALICE.name);
    expect(distance2d(initialAliceActor.position, movedAliceOnAlice.position)).toBeGreaterThan(0.5);
    expect(distance2d(movedAliceOnAlice.position, movedAliceOnBob.position)).toBeLessThan(0.06);
    expect(distance2d(actorByName(aliceMoved.actors, BOB.name).position, actorByName(bobMoved.actors, BOB.name).position)).toBeLessThan(0.06);

    const aliceState = await mpState(alice);
    const bobState = await mpState(bob);
    await writeReport(testInfo, 'mp-03-second-hero', { alice: aliceMoved, bob: bobMoved, mp: { alice: aliceState, bob: bobState } }, MP03_ARTIFACT_DIR);
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

async function openPair(browser: Browser, code: string, bobExtra = ''): Promise<{
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
    openClient(alice, code, ALICE),
    openClient(bob, code, BOB, bobExtra),
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

async function openClient(page: Page, code: string, player: MpPlayerSeed, extra = ''): Promise<void> {
  await seedProfile(page, player);
  const query = `${MP_QUERY}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(player.name)}&mpTown=${encodeURIComponent(player.town)}${extra}`;
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
}

async function seedProfile(page: Page, player: MpPlayerSeed): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, scoreKey, player: seeded }) => {
      localStorage.clear();
      sessionStorage.clear();
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
      player,
    },
  );
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

async function mpState(page: Page): Promise<MpState> {
  return page.evaluate(() => window.__GR_MP__!.state()!);
}

async function gameDiagnostics(page: Page): Promise<ThreeGameDiagnostics> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function syncedGameDiagnostics(left: Page, right: Page, minTick: number): Promise<[ThreeGameDiagnostics, ThreeGameDiagnostics]> {
  const deadline = Date.now() + 10_000;
  let lastTicks = 'none';
  while (Date.now() < deadline) {
    const [leftDiagnostics, rightDiagnostics] = await Promise.all([gameDiagnostics(left), gameDiagnostics(right)]);
    const leftTick = leftDiagnostics.mp?.tick ?? 0;
    const rightTick = rightDiagnostics.mp?.tick ?? 0;
    lastTicks = `${leftTick}/${rightTick}`;
    if (leftTick >= minTick && leftTick === rightTick) return [leftDiagnostics, rightDiagnostics];
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
