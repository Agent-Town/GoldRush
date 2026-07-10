import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { onRequest as telemetryRoute } from '../functions/api/telemetry';
import { PROFILE_KEY, TOWN_NAME_KEY, type ProfileState } from '../src/game/ProfileStorage';
import {
  TELEMETRY_DEV_SEND_STORAGE_KEY,
  TELEMETRY_OPT_IN_STORAGE_KEY,
  readTelemetryOptIn,
  saveTelemetryOptIn,
  type RunTelemetryPayload,
} from '../src/telemetry/payload';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/tl-01');
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'robin',
  profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
};
const IDENTIFIER_KEYS = new Set(['email', 'profile', 'wallet', 'ip', 'name', 'userid', 'user_id']);

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, telemetryOptIn?: boolean): Promise<void> {
  await page.addInitScript(
    ({ profileKey, profileState, telemetryKey, telemetryDevKey, telemetryOptIn, townKey }) => {
      if (sessionStorage.getItem('__gr_tl01_seeded__')) return;
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify(profileState));
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
      localStorage.setItem(telemetryDevKey, '1');
      if (typeof telemetryOptIn === 'boolean') localStorage.setItem(telemetryKey, telemetryOptIn ? '1' : '0');
      sessionStorage.setItem('__gr_tl01_seeded__', '1');
    },
    {
      profileKey: PROFILE_KEY,
      profileState: PROFILE_STATE,
      telemetryKey: TELEMETRY_OPT_IN_STORAGE_KEY,
      telemetryDevKey: TELEMETRY_DEV_SEND_STORAGE_KEY,
      telemetryOptIn,
      townKey: TOWN_NAME_KEY,
    },
  );
}

async function openDebugRun(page: Page, seed: string): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&nosteal&nowreck&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
}

async function forceOverrun(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    for (let pack = 0; pack < 6; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.3, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
}

async function openBoardAndLaunchPlain(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    const importViteModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    const mod = (await importViteModule('/src/game/Balance.ts')) as {
      Balance: {
        run: { secureWave: number };
        waves: { waveInterval: number; trickleInterval: number; pulseBase: number; pulsePerWave: number; pulsesPerWave: number };
        enemy: { contactDamage: number };
      };
    };
    mod.Balance.run.secureWave = 1;
    mod.Balance.waves.waveInterval = 0.25;
    mod.Balance.waves.trickleInterval = 9999;
    mod.Balance.waves.pulseBase = 0;
    mod.Balance.waves.pulsePerWave = 0;
    mod.Balance.waves.pulsesPerWave = 1;
    mod.Balance.enemy.contactDamage = 0;
  });
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await page.getByTestId('contract-launch-the-claim').click();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function captureSettings(page: Page, testInfo: TestInfo): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-settings.png`), fullPage: true });
}

function interceptTelemetry(page: Page, status = 200): RunTelemetryPayload[] {
  const posts: RunTelemetryPayload[] = [];
  void page.route('**/api/telemetry', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = JSON.parse(request.postData() ?? '{}') as RunTelemetryPayload;
    posts.push(body);
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status < 400 }) });
  });
  return posts;
}

function assertPayloadShape(payload: RunTelemetryPayload): void {
  expect(typeof payload.contract).toBe('string');
  expect(payload.contract.length).toBeGreaterThan(0);
  expect(Number.isInteger(payload.waves)).toBe(true);
  expect(Number.isInteger(payload.duration)).toBe(true);
  expect(Number.isInteger(payload.upgradesTaken)).toBe(true);
  expect(['FULL', 'BALANCED', 'LITE']).toContain(payload.tier);
  expect(typeof payload.frameP95).toBe('number');
  expect(['desktop', 'mobile', 'tablet']).toContain(payload.deviceClass);
  expect(payload.buildHash).toBe('dev');
  expect(payload.nonce).toMatch(/^[a-f0-9]{32}$/);
}

function assertAnonymous(payload: unknown): void {
  const entries = flatten(payload);
  expect(entries.some(({ key }) => IDENTIFIER_KEYS.has(key.toLowerCase()))).toBe(false);
  expect(entries.some(({ value }) => value === 'Robin')).toBe(false);
}

function flatten(value: unknown): Array<{ key: string; value: unknown }> {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => [{ key, value: nested }, ...flatten(nested)]);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('run end posts one anonymous telemetry payload', async ({ page }, testInfo) => {
  await seedProfile(page, true);
  const posts = interceptTelemetry(page);
  const errors = collectErrors(page);

  await openDebugRun(page, `tl01-post-${testInfo.project.name}`);
  await forceOverrun(page);
  await expect.poll(() => posts.length, { timeout: 8_000 }).toBe(1);

  const payload = posts[0]!;
  assertPayloadShape(payload);
  assertAnonymous(payload);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-beacon-payload.json`), `${JSON.stringify(payload, null, 2)}\n`);
  assertNoErrors(errors);
});

test('settings toggle defaults on, persists, and opt-out suppresses posts', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-telemetry-stats')).toBeChecked();
  await expect(page.getByTestId('start-menu-telemetry-stats-disclosure')).toContainText(
    'Anonymous gameplay statistics, no personal data, opt-out in Settings.',
  );
  await captureSettings(page, testInfo);

  await page.getByTestId('start-menu-telemetry-stats').uncheck();
  await page.reload();
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-telemetry-stats')).not.toBeChecked();

  const posts = interceptTelemetry(page);
  await openDebugRun(page, `tl01-optout-${testInfo.project.name}`);
  await forceOverrun(page);
  await page.waitForTimeout(750);
  expect(posts).toHaveLength(0);
  assertNoErrors(errors);
});

test('same run id is deduped before a second POST', async ({ page }, testInfo) => {
  await seedProfile(page, true);
  const posts = interceptTelemetry(page);
  const errors = collectErrors(page);

  await openDebugRun(page, `tl01-dedupe-${testInfo.project.name}`);
  await page.evaluate(() => {
    const event = {
      type: 'run_ended' as const,
      at: 12.25,
      runId: 777,
      reason: 'death' as const,
      summary: {
        wavesSurvived: 2,
        goldPanned: 0,
        goldPannedByProspector: 0,
        goldStolen: 0,
        goldReclaimed: 0,
        goldReclaimedByProspector: 0,
        buildingsBuilt: 0,
      },
    };
    window.__GR_TELEMETRY__?.recordRunEndedForTest(event);
    window.__GR_TELEMETRY__?.recordRunEndedForTest(event);
  });

  await expect.poll(() => posts.length, { timeout: 8_000 }).toBe(1);
  assertPayloadShape(posts[0]!);
  assertNoErrors(errors);
});

test('plain no-debug secure return keeps telemetry invisible to gameplay', async ({ page }) => {
  test.setTimeout(60_000);
  await seedProfile(page, true);
  interceptTelemetry(page);
  const errors = collectErrors(page);

  await openBoardAndLaunchPlain(page);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 18_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('death-overlay')).toBeVisible({ timeout: 8_000 });
  await page.getByTestId('stake-again').click();
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  assertNoErrors(errors);
});

test('server route rejects GET and identifier-shaped payloads', async () => {
  const get = await telemetryRoute({ request: new Request('http://127.0.0.1/api/telemetry', { method: 'GET' }), env: {} });
  expect(get.status).toBe(405);

  const bad = await telemetryRoute({
    request: new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contract: 'e1-river-claim',
        waves: 1,
        duration: 1000,
        upgradesTaken: 0,
        tier: 'FULL',
        frameP95: 16,
        deviceClass: 'desktop',
        buildHash: 'dev',
        nonce: '0123456789abcdef0123456789abcdef',
        email: 'nope@example.com',
      }),
    }),
    env: {},
  });
  expect(bad.status).toBe(400);

  const dev = await telemetryRoute({
    request: new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contract: 'e1-river-claim',
        waves: 1,
        duration: 1000,
        upgradesTaken: 0,
        tier: 'FULL',
        frameP95: 16,
        deviceClass: 'desktop',
        buildHash: 'dev',
        nonce: '0123456789abcdef0123456789abcdef',
      }),
    }),
    env: {},
  });
  expect(dev.status).toBe(200);
  await expect(dev.json()).resolves.toMatchObject({ ok: true, stored: false });

  const extraField = await telemetryRoute({
    request: new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contract: 'the-claim',
        waves: 1,
        duration: 1000,
        upgradesTaken: 0,
        tier: 'FULL',
        frameP95: 16,
        deviceClass: 'desktop',
        buildHash: 'dev',
        nonce: '0123456789abcdef0123456789abcdef',
        arbitrary: 'not allowed',
      }),
    }),
    env: {},
  });
  expect(extraField.status).toBe(400);
});

test('opt-out remains honored when localStorage writes fail', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage blocked');
      },
    } as unknown as Storage,
  });

  try {
    saveTelemetryOptIn(false);
    expect(readTelemetryOptIn()).toBe(false);
  } finally {
    saveTelemetryOptIn(true);
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete (globalThis as { localStorage?: Storage }).localStorage;
  }
});

test('server route stores aggregate-only counters when KV is bound', async () => {
  const store = new Map<string, string>();
  const kv = {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string, _options?: { expirationTtl?: number }) => {
      store.set(key, value);
    },
    list: async () => ({ keys: [], list_complete: true }),
  };
  const body = {
    contract: 'e1-dry-gulch',
    waves: 21,
    duration: 240_000,
    upgradesTaken: 3,
    tier: 'LITE',
    frameP95: 26.2,
    deviceClass: 'mobile',
    buildHash: 'dev',
    nonce: 'abcdefabcdefabcdefabcdefabcdefab',
  };
  const request = () =>
    new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  const first = await telemetryRoute({ request: request(), env: { TELEMETRY: kv } });
  expect(first.status).toBe(200);
  await expect(first.json()).resolves.toMatchObject({ ok: true, stored: true, duplicate: false });
  expect(store.get('telemetry:runs:total')).toBe('1');
  expect(store.get('telemetry:waves:max')).toBe('21');
  expect(store.get('telemetry:waves:20-29')).toBe('1');
  expect(store.get('telemetry:duration:3-5m')).toBe('1');
  expect(store.get('telemetry:contract:e1-dry-gulch')).toBe('1');
  expect(store.get('telemetry:device:mobile:frameP95:25-33')).toBe('1');
  expect([...store.keys()].some((key) => key.includes(':raw:') || key.includes(':row:'))).toBe(false);

  const duplicate = await telemetryRoute({ request: request(), env: { TELEMETRY: kv } });
  expect(duplicate.status).toBe(200);
  await expect(duplicate.json()).resolves.toMatchObject({ ok: true, stored: true, duplicate: true });
  expect(store.get('telemetry:runs:total')).toBe('1');

  const garbage = await telemetryRoute({
    request: new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...body, contract: 'xxx-garbage', nonce: '00000000000000000000000000000002' }),
    }),
    env: { TELEMETRY: kv },
  });
  expect(garbage.status).toBe(200);
  expect(store.get('telemetry:runs:total')).toBe('2');
  expect(store.get('telemetry:contract:xxx-garbage')).toBeUndefined();
  expect(store.get('telemetry:contract:other')).toBe('1');
});

test('server route rate-limits bound telemetry by client IP', async () => {
  const store = new Map<string, string>();
  const kv = {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string, _options?: { expirationTtl?: number }) => {
      store.set(key, value);
    },
    list: async () => ({ keys: [], list_complete: true }),
  };

  let limited: Response | null = null;
  for (let index = 0; index < 31; index += 1) {
    const response = await telemetryRoute({
      request: new Request('http://127.0.0.1/api/telemetry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contract: 'the-claim',
          waves: 1,
          duration: 1000,
          upgradesTaken: 0,
          tier: 'FULL',
          frameP95: 16,
          deviceClass: 'desktop',
          buildHash: 'dev',
          nonce: index.toString(16).padStart(32, '0'),
        }),
      }),
      env: { TELEMETRY: kv },
    });
    if (response.status === 429) {
      limited = response;
      break;
    }
    expect(response.status).toBe(200);
  }

  expect(limited?.status).toBe(429);
  await expect(limited!.json()).resolves.toMatchObject({ ok: false, error: 'rate_limited', message: 'The wire is busy. Try again later.' });
});
