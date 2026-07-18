import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import type { RunSuspendEnvelope } from '../src/game/RunSuspend';
import type { ScoreRecord } from '../src/game/Scoreboard';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type Player = { id: string; name: string; town: string };
type ActorSnapshot = { weapon?: 'rig' | 'blast' };
type MpSnapshot = RunSuspendEnvelope & { mpActors?: ActorSnapshot[] };

const ROOT = process.cwd();
const QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&seed=mp-arsenal';
const ALICE: Player = { id: 'alice', name: 'Alice', town: 'Dawn Claim' };
const BOB: Player = { id: 'bob', name: 'Bob', town: 'River Bend' };
let relay: RelayEnv;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, workerInfo) => {
  relay = await startRelayEnv(workerInfo.project.name);
});

test.afterAll(async () => {
  await relay?.stop();
});

test('riders fire different weapons under their stats, share credit, and keep equal hashes', async ({ browser }) => {
  test.setTimeout(90_000);
  const code = await createRoom();
  const run = await openPair(browser, code);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await Promise.all([waitForParty(alice), waitForParty(bob)]);

    await bob.keyboard.press('KeyQ');
    const canonicalWeapons = { Alice: 'rig', Bob: 'blast' } as const;
    await expect.poll(() => weaponViews(alice, bob), { timeout: 8_000 }).toEqual({
      alice: canonicalWeapons,
      bob: canonicalWeapons,
    });

    await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
      bob.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
    ]);
    const source = (await mpState(alice)).roster[0]?.name === ALICE.name ? alice : bob;
    const snapshot = await source.evaluate(() => {
      const test = window.__GR_TEST__!;
      test.clearEnemies();
      test.setUpgradeStacks({ heavy_spark: 1, powder_charge: 1 });
      test.spawnPack(1, 4, { speedScale: 0, hpScale: 4 });
      return test.captureSuspend() as MpSnapshot;
    });
    const schema = await source.evaluate((saved) => {
      const test = window.__GR_TEST__!;
      const canonical = structuredClone(saved) as MpSnapshot;
      const legacy = structuredClone(canonical);
      const mixed = structuredClone(canonical);
      legacy.counters.weapon = 'blast';
      for (const actor of legacy.mpActors ?? []) delete actor.weapon;
      if (mixed.mpActors?.[1]) delete mixed.mpActors[1].weapon;
      const legacyAccepted = test.restoreSuspend(legacy);
      const legacyWeapons = ((test.captureSuspend() as MpSnapshot).mpActors ?? []).map((actor) => actor.weapon);
      const mixedAccepted = test.restoreSuspend(mixed);
      const currentAccepted = test.restoreSuspend(canonical);
      return { legacyAccepted, legacyWeapons, mixedAccepted, currentAccepted };
    }, snapshot);
    expect(schema).toEqual({
      legacyAccepted: true,
      legacyWeapons: ['blast', 'blast'],
      mixedAccepted: false,
      currentAccepted: true,
    });
    expect((snapshot.mpActors ?? []).map((actor) => actor.weapon).sort()).toEqual(['blast', 'rig']);
    expect(await Promise.all([
      alice.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
      bob.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
    ])).toEqual([true, true]);

    const resumeAt = Math.max((await mpState(alice)).tick, (await mpState(bob)).tick) + 15;
    await Promise.all([
      alice.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
      bob.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
    ]);
    await expect.poll(async () => {
      const [aliceView, bobView] = await Promise.all([diagnostics(alice), diagnostics(bob)]);
      const active = (view: ThreeGameDiagnostics) => ({
        rig: (view.build.damageByOwner.hero ?? 0) > 0,
        blast: (view.build.damageByOwner.hero_blast ?? 0) > 0,
        kills: view.kills,
      });
      return { alice: active(aliceView), bob: active(bobView) };
    }, { timeout: 15_000 }).toEqual({
      alice: { rig: true, blast: true, kills: 1 },
      bob: { rig: true, blast: true, kills: 1 },
    });

    const evidence = await sharedHashEvidence(alice, bob, resumeAt + 90);
    expect(evidence.alice).toEqual(evidence.bob);
    expect(evidence.alice.weapons).toEqual(canonicalWeapons);
    expect(evidence.alice.damage.hero).toBeGreaterThan(0);
    expect(evidence.alice.damage.hero_blast).toBeGreaterThan(0);
    const live = await diagnostics(source);
    expect(live.progression.stats.damageMult).toBeCloseTo(1.3, 6);
    expect(live.arsenal.blastDamage).toBeCloseTo(Balance.blast.damage * 1.25, 6);

    const beforeResync = Math.max((await mpState(alice)).resyncs, (await mpState(bob)).resyncs);
    const divergent = source === alice ? bob : alice;
    const perturbation = await divergent.evaluate(() => {
      const test = window.__GR_TEST__!;
      const before = test.captureSuspend() as MpSnapshot;
      const local = window.__THREE_GAME_DIAGNOSTICS__!.actors.find((actor) => actor.local && actor.visible)!;
      const weapon = test.setLocalWeaponForTest(local.weapon === 'rig' ? 'blast' : 'rig');
      const after = test.captureSuspend() as MpSnapshot;
      return {
        weapon,
        countersUnchanged: JSON.stringify(before.counters) === JSON.stringify(after.counters),
        before: before.mpActors?.map((actor) => actor.weapon),
        after: after.mpActors?.map((actor) => actor.weapon),
      };
    });
    expect(perturbation.countersUnchanged).toBe(true);
    expect(perturbation.after).not.toEqual(perturbation.before);
    await Promise.all([
      alice.waitForFunction((before) => (window.__GR_MP__?.state()?.resyncs ?? 0) > before, beforeResync, { timeout: 20_000 }),
      bob.waitForFunction((before) => (window.__GR_MP__?.state()?.resyncs ?? 0) > before, beforeResync, { timeout: 20_000 }),
    ]);
    const restoredAt = (await mpState(alice)).lastResyncTick!;
    const restored = await sharedHashEvidence(alice, bob, restoredAt + 30);
    expect(restored.alice).toEqual(restored.bob);
    expect(restored.alice.weapons).toEqual(canonicalWeapons);

    await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.endRunForTest()),
      bob.evaluate(() => window.__GR_TEST__!.endRunForTest()),
    ]);
    const [aliceScores, bobScores] = await Promise.all([scoresFor(alice, ALICE.id), scoresFor(bob, BOB.id)]);
    expect(aliceScores[0]?.profileName).toBe(ALICE.name);
    expect(bobScores[0]?.profileName).toBe(BOB.name);
    expect(sharedScore(aliceScores[0])).toEqual(sharedScore(bobScores[0]));
    expect(aliceScores[0]?.kills).toBe(1);
    expect(aliceErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    expect(bobErrors).toEqual({ consoleErrors: [], pageErrors: [] });
  } finally {
    await run.close();
  }
});

async function weaponViews(alice: Page, bob: Page) {
  const weapons = (view: ThreeGameDiagnostics) =>
    Object.fromEntries(view.actors.filter((actor) => actor.visible).map((actor) => [actor.name, actor.weapon]));
  const [aliceView, bobView] = await Promise.all([diagnostics(alice), diagnostics(bob)]);
  return { alice: weapons(aliceView), bob: weapons(bobView) };
}

async function sharedHashEvidence(left: Page, right: Page, minTick: number) {
  const capture = (page: Page) => page.evaluate(() => {
    const latest = window.__GR_TEST__!.lastMultiplayerHashState();
    const mp = window.__GR_MP__!.state()!;
    const state = latest?.state as {
      actors?: Array<{ weapon?: 'rig' | 'blast' }>;
      run?: { combat?: { audit?: { ownerDamage?: Record<string, number> } } };
    } | undefined;
    return {
      tick: latest?.tick ?? -1,
      hash: mp.hashes.find((entry) => entry.tick === latest?.tick)?.hash ?? null,
      weapons: Object.fromEntries((state?.actors ?? []).map((actor, slot) => [mp.roster[slot]?.name, actor.weapon])),
      damage: state?.run?.combat?.audit?.ownerDamage ?? {},
    };
  });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const [alice, bob] = await Promise.all([capture(left), capture(right)]);
    if (alice.tick >= minTick && alice.tick === bob.tick && alice.hash !== null && alice.hash === bob.hash) return { alice, bob };
    await left.waitForTimeout(40);
  }
  throw new Error(`clients did not publish an equal arsenal hash at tick >= ${minTick}`);
}

async function openPair(browser: Browser, code: string) {
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();
  const aliceErrors = collectErrors(alice);
  const bobErrors = collectErrors(bob);
  await Promise.all([openClient(alice, code, ALICE), openClient(bob, code, BOB)]);
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

async function openClient(page: Page, code: string, player: Player): Promise<void> {
  await seedProfile(page, player);
  const query = `${QUERY}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(player.name)}&mpTown=${encodeURIComponent(player.town)}`;
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
}

async function seedProfile(page: Page, player: Player): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, scoreKey, seeded }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: seeded.id,
      profiles: [{ ...seeded, createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, seeded.town);
    localStorage.setItem(scoreKey, '[]');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey(player.id, TOWN_NAME_KEY),
    scoreKey: profileDataKey(player.id, SCOREBOARD_KEY),
    seeded: player,
  });
}

async function waitForParty(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const actors = window.__THREE_GAME_DIAGNOSTICS__?.actors.filter((actor) => actor.visible) ?? [];
    return window.__GR_MP__?.state()?.roster.length === 2 && actors.length === 2;
  }, undefined, { timeout: 15_000 });
}

async function mpState(page: Page) {
  return page.evaluate(() => window.__GR_MP__!.state()!);
}

async function diagnostics(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
}

async function scoresFor(page: Page, profileId: string): Promise<ScoreRecord[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]') as ScoreRecord[], profileDataKey(profileId, SCOREBOARD_KEY));
}

function sharedScore(score: ScoreRecord | undefined) {
  expect(score).toBeTruthy();
  return { waves: score!.waves, kills: score!.kills, gold: score!.gold, secured: score!.secured, contractId: score!.contractId };
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function createRoom(): Promise<string> {
  const response = await fetch(`${relay.url}/api/multiplayer/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: 'http://127.0.0.1:5188' },
    body: '{}',
  });
  const body = await response.json() as { code?: string; error?: string };
  if (!response.ok || !body.code) throw new Error(body.error ?? 'room_create_failed');
  return body.code;
}

async function startRelayEnv(projectName: string): Promise<RelayEnv> {
  const slug = projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const stateRoot = path.join(ROOT, `test-results/mp-arsenal-relay-${slug}`);
  const scriptName = `gold-rush-mp-arsenal-${slug}`;
  await rm(stateRoot, { recursive: true, force: true });
  const worker = await startRoomWorker(stateRoot, scriptName);
  try {
    const pages = await startPages(stateRoot, scriptName, worker);
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

async function startRoomWorker(stateRoot: string, scriptName: string): Promise<RelayProcess> {
  const port = await freePort();
  const configPath = path.join(stateRoot, 'wrangler-mp-room.jsonc');
  await mkdir(stateRoot, { recursive: true });
  await writeFile(configPath, `${JSON.stringify({
    name: scriptName,
    main: path.relative(stateRoot, path.join(ROOT, 'functions/api/_multiplayer.ts')),
    compatibility_date: '2026-07-08',
    durable_objects: { bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }] },
    migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
  }, null, 2)}\n`);
  return spawnWrangler([
    'dev', '--config', configPath, '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(stateRoot, 'room-worker'), '--log-level', 'error', '--show-interactive-dev-session=false',
  ], port);
}

async function startPages(stateRoot: string, scriptName: string, worker: RelayProcess): Promise<RelayProcess> {
  const port = await freePort();
  const pages = await spawnWrangler([
    'pages', 'dev', 'public', '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(stateRoot, 'pages'), '--compatibility-date', '2026-07-08',
    '--log-level', 'error', '--show-interactive-dev-session=false', '--do',
    `MULTIPLAYER_ROOMS=MultiplayerRoom@${scriptName}`, '--kv', 'MULTIPLAYER_RATE_LIMITS',
  ], port);
  await waitForServer(worker.url, '/');
  return pages;
}

async function spawnWrangler(args: string[], port: number): Promise<RelayProcess> {
  const child = spawn('wrangler', args, { cwd: ROOT, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
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
        child.once('exit', () => { clearTimeout(timer); resolve(undefined); });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

async function waitForServer(url: string, route: string, check?: () => void): Promise<void> {
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
      server.close(() => address && typeof address === 'object' ? resolve(address.port) : reject(new Error('No free port')));
    });
    server.on('error', reject);
  });
}
