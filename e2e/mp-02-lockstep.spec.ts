import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type MpState = NonNullable<ThreeGameDiagnostics['mp']>;

const ROOT = process.cwd();
const SCRIPT_NAME = 'gold-rush-mp-room';
const STATE_ROOT = path.join(ROOT, 'test-results/mp-02-relay-state');
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/mp-02');
const MP_QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&nokill&seed=mp-02-lockstep';
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
    openClient(alice, code, 'Alice', 'Dawn Claim'),
    openClient(bob, code, 'Bob', 'River Bend', bobExtra),
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

async function openClient(page: Page, code: string, name: string, town: string, extra = ''): Promise<void> {
  const query = `${MP_QUERY}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(name)}&mpTown=${encodeURIComponent(town)}${extra}`;
  await page.goto(`/?${query}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
}

async function waitRoster(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_MP__?.state()?.roster.length ?? 0) === 2, undefined, { timeout: 10_000 });
}

async function waitForTick(page: Page, tick: number): Promise<void> {
  await page.waitForFunction((target) => (window.__GR_MP__?.state()?.tick ?? 0) >= target, tick, { timeout: 30_000 });
}

async function mpState(page: Page): Promise<MpState> {
  return page.evaluate(() => window.__GR_MP__!.state()!);
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function writeReport(testInfo: TestInfo, name: string, body: unknown): Promise<void> {
  const text = `${JSON.stringify(body, null, 2)}\n`;
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${name}.json`), text);
  await testInfo.attach(name, { body: text, contentType: 'application/json' });
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
