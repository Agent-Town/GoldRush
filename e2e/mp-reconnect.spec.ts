import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Rider = { id: string; name: string; town: string };
type MpState = NonNullable<ThreeGameDiagnostics['mp']>;

const ROOT = process.cwd();
const STATE_ROOT = path.join(ROOT, 'test-results/mp-reconnect-relay-state');
const SCRIPT_NAME = 'gold-rush-mp-reconnect-room';
const QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&nokill&seed=mp-reconnect';
const ALICE: Rider = { id: 'alice', name: 'Alice', town: 'Dawn Claim' };
const BOB: Rider = { id: 'bob', name: 'Bob', town: 'River Bend' };
let relay: RelayEnv;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  relay = await startRelayEnv();
});

test.afterAll(async () => {
  await relay?.stop();
});

test('a disconnected rider rejoins its held slot at the exact snapshot tick and keeps identical world hashes', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab reconnect proof is enough');
  test.setTimeout(75_000);
  const code = await createRoom();
  const run = await openPair(browser, code);
  const { alice, bob, aliceErrors, bobErrors } = run;
  try {
    await Promise.all([waitForParty(alice), waitForParty(bob), waitForTick(alice, 95), waitForTick(bob, 95)]);
    const before = await mpState(bob);
    expect(before.playerId).toBeTruthy();

    const droppedAt = await bob.evaluate(() => {
      const tick = window.__GR_MP__?.state()?.tick ?? 0;
      window.__GR_MP__?.dropConnectionForTest();
      return tick;
    });
    await alice.waitForFunction(
      (playerId) => window.__GR_MP__?.state()?.heldPlayerIds.includes(playerId) === true,
      before.playerId!,
      { timeout: 5_000 },
    );

    const disconnectedAt = Math.max(droppedAt, (await mpState(alice)).tick);
    await bob.reload();
    await bob.waitForFunction(() => {
      const state = window.__GR_MP__?.state();
      return state?.connected === true && state.reconnects === 1 && state.reconnecting === false;
    }, undefined, { timeout: 20_000 });

    const rejoined = await mpState(bob);
    expect(rejoined.playerId).toBe(before.playerId);
    expect(rejoined.lastReconnectTick).not.toBeNull();
    expect(rejoined.lastReconnectTick! % 30).toBe(0);
    expect(rejoined.lastReconnectTick!).toBeLessThan(disconnectedAt);
    expect(rejoined.lastReconnectReplayTicks).toBeGreaterThan(0);
    await expect(bob.getByTestId('mp-desync-card')).toContainText('Back on the trail');

    const convergenceTick = Math.ceil((Math.max((await mpState(alice)).tick, rejoined.tick) + 120) / 30) * 30;
    await Promise.all([waitForTick(alice, convergenceTick + 2), waitForTick(bob, convergenceTick + 2)]);
    const [aliceFinal, bobFinal] = await Promise.all([mpState(alice), mpState(bob)]);
    const bobHashes = bobFinal.hashes.filter((entry) => entry.tick > (rejoined.lastReconnectTick ?? -1));
    expect(bobHashes.length).toBeGreaterThanOrEqual(4);
    for (const entry of bobHashes) expect(hashAt(aliceFinal, entry.tick)).toBe(entry.hash);
    expect(aliceFinal.roster.map((player) => player.playerId)).toEqual(bobFinal.roster.map((player) => player.playerId));
    expect(aliceFinal).toMatchObject({ connected: true, reconnecting: false, paused: false, error: null });
    expect(bobFinal).toMatchObject({ connected: true, reconnecting: false, reconnects: 1, paused: false, error: null });
    expect(aliceErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    expect(bobErrors).toEqual({ consoleErrors: [], pageErrors: [] });
  } finally {
    await run.close();
  }
});

async function openPair(browser: Browser, code: string): Promise<{
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

async function openClient(page: Page, code: string, rider: Rider): Promise<void> {
  await seedProfile(page, rider);
  const query = `${QUERY}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(rider.name)}&mpTown=${encodeURIComponent(rider.town)}`;
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
}

async function seedProfile(page: Page, rider: Rider): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, scoreKey, relayUrl, seeded }) => {
      const marker = 'gr.e2e.mp-reconnect.profile-seeded';
      if (sessionStorage.getItem(marker) !== seeded.id) {
        localStorage.clear();
        sessionStorage.clear();
      }
      localStorage.setItem('gr.mp.relayBase.v1', relayUrl);
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: seeded.id,
        profiles: [{
          id: seeded.id,
          name: seeded.name,
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: [],
        }],
      }));
      localStorage.setItem(townKey, seeded.town);
      localStorage.setItem(scoreKey, '[]');
      sessionStorage.setItem(marker, seeded.id);
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(rider.id, TOWN_NAME_KEY),
      scoreKey: profileDataKey(rider.id, SCOREBOARD_KEY),
      relayUrl: relay.url,
      seeded: rider,
    },
  );
}

async function waitForParty(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const state = window.__GR_MP__?.state();
    const actors = window.__THREE_GAME_DIAGNOSTICS__?.actors.filter((actor) => actor.visible) ?? [];
    return state?.roster.length === 2 && actors.length === 2;
  }, undefined, { timeout: 15_000 });
}

async function waitForTick(page: Page, tick: number): Promise<void> {
  await page.waitForFunction((target) => (window.__GR_MP__?.state()?.tick ?? 0) >= target, tick, { timeout: 30_000 });
}

async function mpState(page: Page): Promise<MpState> {
  return page.evaluate(() => window.__GR_MP__!.state()!);
}

function hashAt(state: MpState, tick: number): string | undefined {
  return state.hashes.find((entry) => entry.tick === tick)?.hash;
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function createRoom(): Promise<string> {
  const response = await fetch(`${relay.url}/api/multiplayer/create`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: 'http://127.0.0.1:5189' },
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
  await mkdir(STATE_ROOT, { recursive: true });
  const configPath = path.join(STATE_ROOT, 'wrangler-mp-room.jsonc');
  await writeFile(configPath, `${JSON.stringify({
    name: SCRIPT_NAME,
    main: path.relative(STATE_ROOT, path.join(ROOT, 'functions/api/_multiplayer.ts')),
    compatibility_date: '2026-07-08',
    durable_objects: { bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }] },
    migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
  }, null, 2)}\n`);
  return spawnWrangler([
    'dev', '--config', configPath, '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(STATE_ROOT, 'room-worker'), '--log-level', 'error',
    '--show-interactive-dev-session=false',
  ], port);
}

async function startPages(worker: RelayProcess): Promise<RelayProcess> {
  const port = await freePort();
  const pages = await spawnWrangler([
    'pages', 'dev', 'public', '--port', String(port), '--ip', '127.0.0.1',
    '--persist-to', path.join(STATE_ROOT, 'pages'), '--compatibility-date', '2026-07-08',
    '--log-level', 'error', '--show-interactive-dev-session=false',
    '--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${SCRIPT_NAME}`, '--kv', 'MULTIPLAYER_RATE_LIMITS',
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
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => { clearTimeout(timer); resolve(); });
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
        headers: { Origin: 'http://127.0.0.1:5189' },
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
