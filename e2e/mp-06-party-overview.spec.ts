import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RelayProcess = { url: string; stop: () => Promise<void> };
type RelayEnv = RelayProcess & { worker: RelayProcess; pages: RelayProcess };
type Player = { id: string; name: string; town: string };

const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, 'artifacts/party-pot-anchor');
const QUERY = 'debug&mp=dev&nowaves&nolevel&nopause&nosteal&nowreck&seed=mp-06-party-overview';
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

test('party roster shows live shared truth and local camera glance', async ({ browser }, testInfo) => {
  test.setTimeout(120_000);
  const code = await createRoom();
  const run = await openPair(browser, code, testInfo);
  const { alice, bob, errors } = run;
  try {
    await Promise.all([waitForParty(alice), waitForParty(bob)]);
    await Promise.all([expect(alice.getByTestId('party-overview')).toBeVisible(), expect(bob.getByTestId('party-overview')).toBeVisible()]);
    await Promise.all([dismissBriefing(alice), dismissBriefing(bob)]);

    await expectRiderOrder(alice, [ALICE.name, BOB.name]);
    await expectRiderOrder(bob, [BOB.name, ALICE.name]);
    await expect(alice.getByTestId('party-shared-gold')).toHaveCount(1);
    await expect(alice.getByTestId('party-shared-gold')).toHaveText('0');
    const potAnchor = await alice.evaluate(() => {
      const title = document.querySelector<HTMLElement>('.party-overview__header > span:first-child')?.getBoundingClientRect();
      const pot = document.querySelector<HTMLElement>('.party-overview__pot')?.getBoundingClientRect();
      const cards = [...document.querySelectorAll<HTMLElement>('[data-testid="party-rider-card"]')].map((card) => card.getBoundingClientRect());
      if (!title || !pot || cards.length !== 2) return null;
      return { titleGap: pot.left - title.right, potRight: pot.right, cardsRight: cards.at(-1)!.right };
    });
    expect(potAnchor).toBeTruthy();
    expect(potAnchor!.titleGap).toBeGreaterThanOrEqual(0);
    expect(potAnchor!.titleGap).toBeLessThanOrEqual(16);
    expect(potAnchor!.potRight).toBeLessThanOrEqual(potAnchor!.cardsRight);
    await shot(alice, testInfo, 'after');

    const aliceStart = await actorPosition(alice, ALICE.name);
    await bob.keyboard.down('KeyD');
    try {
      await alice.waitForFunction(({ name, start }) => {
        const actor = window.__THREE_GAME_DIAGNOSTICS__?.actors.find((entry) => entry.name === name && entry.visible);
        return actor ? Math.hypot(actor.position.x - start.x, actor.position.z - start.z) > 5 : false;
      }, { name: BOB.name, start: await actorPosition(alice, BOB.name) }, { timeout: 15_000 });
    } finally {
      await bob.keyboard.up('KeyD');
    }

    const remoteCard = alice.getByTestId('party-rider-card').filter({ hasText: BOB.name });
    await remoteCard.click();
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? false)).toBe(true);
    await expect.poll(() => bob.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? false)).toBe(false);
    await expect(remoteCard).toHaveAttribute('aria-pressed', 'true');
    await shot(alice, testInfo, 'roster-mid-glance');

    await alice.keyboard.press('Escape');
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? true)).toBe(false);
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused ?? true)).toBe(false);
    await remoteCard.click();
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? false)).toBe(true);
    await remoteCard.click();
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? true)).toBe(false);
    await remoteCard.click();
    await alice.keyboard.press('KeyW');
    await expect.poll(() => alice.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera.glanceActive ?? true)).toBe(false);

    await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.setBalance('enemy.hp', 999)),
      bob.evaluate(() => window.__GR_TEST__!.setBalance('enemy.hp', 999)),
    ]);
    const spawned = await Promise.all([
      alice.evaluate((position) => window.__GR_TEST__!.spawnEnemyAt(position.x, position.z), aliceStart),
      bob.evaluate((position) => window.__GR_TEST__!.spawnEnemyAt(position.x, position.z), aliceStart),
    ]);
    expect(spawned).toEqual([true, true]);
    const aliceCardOnBob = bob.getByTestId('party-rider-card').filter({ hasText: ALICE.name });
    await expect.poll(() => aliceCardOnBob.getAttribute('data-hp'), { timeout: 10_000 }).not.toBe('100');
    const hpViews = await Promise.all([riderHp(alice, ALICE.name), riderHp(bob, ALICE.name)]);
    expect(hpViews[0]).toBeLessThan(100);
    expect(hpViews[0]).toBe(hpViews[1]);
    await Promise.all([
      alice.evaluate(() => window.__GR_TEST__!.clearEnemies()),
      bob.evaluate(() => window.__GR_TEST__!.clearEnemies()),
    ]);

    if (testInfo.project.name === 'mobile-chrome') {
      const boxes = await alice.evaluate(() => {
        const roster = document.querySelector<HTMLElement>('[data-testid="party-overview"]')?.getBoundingClientRect();
        const controls = document.querySelector<HTMLElement>('#touch-controls')?.getBoundingClientRect();
        if (!roster || !controls) return null;
        const overlap = ['hud-vitals', 'hud-gold', 'hud-weapon', 'hud-wave'].filter((testId) => {
          const node = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
          if (!node || node.hidden || Number.parseFloat(getComputedStyle(node).opacity) < 0.05) return false;
          const box = node.getBoundingClientRect();
          return roster.left < box.right && roster.right > box.left && roster.top < box.bottom && roster.bottom > box.top;
        });
        return { rosterBottom: roster.bottom, controlsTop: controls.top, overlap };
      });
      expect(boxes).toBeTruthy();
      expect(boxes!.rosterBottom).toBeLessThanOrEqual(boxes!.controlsTop - 8);
      expect(boxes!.overlap).toEqual([]);
    }

    expect(errors.flatMap((bucket) => bucket.consoleErrors)).toEqual([]);
    expect(errors.flatMap((bucket) => bucket.pageErrors)).toEqual([]);
  } finally {
    await run.close();
  }
});

test('solo boot renders no party roster', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=mp-06-solo');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('party-overview')).toBeHidden();
  await expect(page.getByTestId('party-rider-card')).toHaveCount(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function expectRiderOrder(page: Page, names: string[]): Promise<void> {
  await expect(page.getByTestId('party-rider-card')).toHaveCount(names.length);
  expect(await page.getByTestId('party-rider-card').locator('[data-rider-name]').allTextContents()).toEqual(names);
  await expect(page.getByTestId('party-rider-card').first()).toHaveAttribute('data-self', 'true');
}

async function dismissBriefing(page: Page): Promise<void> {
  const button = page.getByTestId('contract-briefing-dismiss');
  if (await button.isVisible()) await button.click();
}

async function actorPosition(page: Page, name: string): Promise<{ x: number; z: number }> {
  await page.waitForFunction(
    (riderName) => window.__THREE_GAME_DIAGNOSTICS__?.actors.some((entry) => entry.name === riderName && entry.visible),
    name,
  );
  return page.evaluate((riderName) => {
    const actor = window.__THREE_GAME_DIAGNOSTICS__!.actors.find((entry) => entry.name === riderName && entry.visible)!;
    return { x: actor.position.x, z: actor.position.z };
  }, name);
}

async function riderHp(page: Page, name: string): Promise<number> {
  return page.evaluate((riderName) => window.__THREE_GAME_DIAGNOSTICS__!.actors.find((entry) => entry.name === riderName && entry.visible)!.hp, name);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`) });
}

async function openPair(browser: Browser, code: string, testInfo: TestInfo) {
  const mobile = testInfo.project.name === 'mobile-chrome';
  const contextOptions = {
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    hasTouch: mobile,
    isMobile: mobile,
  };
  const aliceContext = await browser.newContext(contextOptions);
  const bobContext = await browser.newContext(contextOptions);
  const alice = await aliceContext.newPage();
  const bob = await bobContext.newPage();
  const errors = [collectErrors(alice), collectErrors(bob)];
  await Promise.all([openClient(alice, code, ALICE), openClient(bob, code, BOB)]);
  return {
    alice,
    bob,
    errors,
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
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 20_000 });
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
  }, undefined, { timeout: 20_000 });
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
  const stateRoot = path.join(ROOT, `test-results/mp-06-relay-${slug}`);
  const scriptName = `gold-rush-mp-06-${slug}`;
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
