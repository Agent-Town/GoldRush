import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Page, type WorkerInfo } from '@playwright/test';
// @ts-expect-error The production companion is intentionally a directly runnable Node module.
import { startSecondRider } from '../scripts/second-rider.mjs';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ROOT = process.cwd();
const QUERY = 'debug&nowaves&nolevel&nopause&nosteal&nowreck&preset=greenhorn&seed=second-rider';
let relay: RelayEnv;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({}, workerInfo) => {
  relay = await startRelayEnv(workerInfo);
});

test.afterAll(async () => {
  await relay?.stop();
});

test('the imported companion joins through town, moves, fights, and survives', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const hostErrors = collectErrors(page);
  await seedHost(page);
  const appUrl = new URL(`/?${QUERY}`, String(testInfo.project.use.baseURL)).href;
  const phrase = await openHostRide(page, appUrl);

  const rider = await startSecondRider({
    claimWord: phrase,
    url: appUrl,
    relayUrl: relay.url,
    name: 'The Second Rider',
  });
  try {
    await Promise.all([waitForParty(page), waitForParty(rider.page)]);
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible().catch(() => false)) await briefing.click();
    await expect(page.getByTestId('mp-rider-chip')).toContainText('The Second Rider');
    const screenshot = testInfo.outputPath('roster.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    await testInfo.attach('both-riders-roster', { path: screenshot, contentType: 'image/png' });

    const before = await riderPosition(page);
    const startTick = await mpTick(page);
    await page.waitForFunction(({ name, x, z, tick }) => {
      const state = window.__GR_MP__?.state();
      const actor = window.__THREE_GAME_DIAGNOSTICS__?.actors.find((entry) => entry.name === name && entry.visible);
      return !!state && state.tick >= tick + 120 && !!actor && Math.hypot(actor.position.x - x, actor.position.z - z) > 0.35;
    }, { name: 'The Second Rider', x: before.x, z: before.z, tick: startTick }, { timeout: 20_000 });

    await page.keyboard.press('KeyT');
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0) >= 4, undefined, { timeout: 10_000 });
    await page.waitForFunction((name) => {
      const actor = window.__THREE_GAME_DIAGNOSTICS__?.actors.find((entry) => entry.name === name && entry.visible);
      return actor?.weapon === 'blast';
    }, 'The Second Rider', { timeout: 10_000 });
    const waveTick = await mpTick(page);
    await page.waitForFunction(({ name, tick }) => {
      const state = window.__GR_MP__?.state();
      const actor = window.__THREE_GAME_DIAGNOSTICS__?.actors.find((entry) => entry.name === name && entry.visible);
      return !!state && state.tick >= tick + 90 && !!actor && actor.hp > 0;
    }, { name: 'The Second Rider', tick: waveTick }, { timeout: 20_000 });

    expect(hostErrors).toEqual({ consoleErrors: [], pageErrors: [] });
    expect(rider.errors).toEqual({ consoleErrors: [], pageErrors: [] });
  } finally {
    await rider.stop();
  }
});

async function openHostRide(page: Page, url: string): Promise<string> {
  const destination = new URL(url);
  await page.goto(`${destination.origin}${destination.pathname}`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 20_000 });
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await page.waitForFunction(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt === 'tavern', undefined, { timeout: 10_000 });
  await page.getByTestId('town-open-board').click();
  await page.evaluate((href) => history.replaceState(null, '', href), destination.href);
  const card = page.getByTestId('ride-together-card');
  if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();
  await page.getByTestId('ride-open-claim').click();
  const word = page.getByTestId('ride-code-word');
  await expect(word).not.toHaveText('No claim open', { timeout: 15_000 });
  const phrase = ((await word.textContent()) ?? '').trim();
  expect(phrase).toMatch(/^[A-Z]+-[A-Z]+-[0-9A-V]{20}$/);
  await page.getByTestId('ride-start').click();
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 20_000 });
  return phrase;
}

async function seedHost(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey, scoreKey, relayUrl }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('gr.mp.relayBase.v1', relayUrl);
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'host',
      profiles: [{ id: 'host', name: 'Host Rider', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Dawn Claim');
    localStorage.setItem(scoreKey, '[]');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('host', TOWN_NAME_KEY),
    scoreKey: profileDataKey('host', SCOREBOARD_KEY),
    relayUrl: relay.url,
  });
}

async function waitForParty(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const state = window.__GR_MP__?.state();
    const actors = window.__THREE_GAME_DIAGNOSTICS__?.actors.filter((actor) => actor.visible) ?? [];
    return state?.roster.length === 2 && actors.length === 2 && state.tick > 0;
  }, undefined, { timeout: 25_000 });
}

async function riderPosition(page: Page): Promise<{ x: number; z: number }> {
  return page.evaluate(() => {
    const actor = window.__THREE_GAME_DIAGNOSTICS__!.actors.find((entry) => entry.name === 'The Second Rider' && entry.visible)!;
    return { x: actor.position.x, z: actor.position.z };
  });
}

async function mpTick(page: Page): Promise<number> {
  return page.evaluate(() => window.__GR_MP__?.state()?.tick ?? 0);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function startRelayEnv(workerInfo: WorkerInfo): Promise<RelayEnv> {
  const suffix = workerInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const stateRoot = path.join(ROOT, `test-results/second-rider-relay-${suffix}-${process.pid}`);
  const scriptName = `gold-rush-second-rider-${suffix}-${process.pid}`;
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
  await mkdir(stateRoot, { recursive: true });
  const configPath = path.join(stateRoot, 'wrangler-mp-room.jsonc');
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
    '--log-level', 'error', '--show-interactive-dev-session=false',
    '--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${scriptName}`, '--kv', 'MULTIPLAYER_RATE_LIMITS',
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
