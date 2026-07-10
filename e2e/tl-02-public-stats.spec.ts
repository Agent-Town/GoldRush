import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type TestInfo } from '@playwright/test';
import { onRequest as statsRoute } from '../functions/api/stats';

type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<KVListResult>;
};

const ARTIFACT_DIR = path.resolve('artifacts/tl-02');
const EMPTY_MESSAGE = 'the office opens with the first assay';
const IDENTIFIER_KEYS = new Set(['nonce', 'email', 'profile', 'profileid', 'profilename', 'wallet', 'ip', 'name', 'userid', 'user_id']);

function makeKv(seed: Record<string, string> = {}): MockKV {
  const store = new Map(Object.entries(seed));
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => {
      store.set(key, value);
    },
    list: async (options) => ({
      keys: [...store.keys()]
        .filter((key) => !options?.prefix || key.startsWith(options.prefix))
        .sort()
        .map((name) => ({ name })),
      list_complete: true,
    }),
  };
}

function failingKv(): MockKV {
  return {
    get: async () => {
      throw new Error('kv unavailable');
    },
    put: async () => {},
    list: async () => {
      throw new Error('kv unavailable');
    },
  };
}

function request(method = 'GET', origin?: string): Request {
  return new Request('http://127.0.0.1/api/stats', {
    method,
    headers: origin ? { Origin: origin } : undefined,
  });
}

async function routeJson(env: { TELEMETRY?: MockKV }, method = 'GET'): Promise<{ response: Response; body: Record<string, unknown> }> {
  const response = await statsRoute({ request: request(method), env });
  return { response, body: (await response.json()) as Record<string, unknown> };
}

async function writeJsonArtifact(testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

function lastUtcDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) => new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
}

function populatedSeed(): Record<string, string> {
  const [today, yesterday, twoDaysAgo, , , , sixDaysAgo, sevenDaysAgo] = lastUtcDays(8);
  return {
    'telemetry:runs:total': '42',
    [`telemetry:runs:day:${today}`]: '5',
    [`telemetry:runs:day:${yesterday}`]: '4',
    [`telemetry:runs:day:${twoDaysAgo}`]: '3',
    [`telemetry:runs:day:${sixDaysAgo}`]: '2',
    [`telemetry:runs:day:${sevenDaysAgo}`]: '99',
    'telemetry:contract:e1-baron': '12',
    'telemetry:contract:e1-dry-gulch': '30',
    'telemetry:contract:other': '1000',
    'telemetry:contract:xxx-garbage': '999',
    'telemetry:tier:FULL': '10',
    'telemetry:tier:BALANCED': '20',
    'telemetry:tier:LITE': '12',
    'telemetry:device:desktop': '20',
    'telemetry:device:mobile': '15',
    'telemetry:device:tablet': '7',
    'telemetry:frameP95:lt16': '3',
    'telemetry:frameP95:16-25': '10',
    'telemetry:frameP95:25-33': '20',
    'telemetry:frameP95:33-50': '8',
    'telemetry:frameP95:50plus': '1',
    'telemetry:device:desktop:frameP95:lt16': '2',
    'telemetry:device:desktop:frameP95:16-25': '8',
    'telemetry:device:desktop:frameP95:25-33': '9',
    'telemetry:device:desktop:frameP95:33-50': '1',
    'telemetry:device:mobile:frameP95:16-25': '2',
    'telemetry:device:mobile:frameP95:25-33': '8',
    'telemetry:device:mobile:frameP95:33-50': '4',
    'telemetry:device:mobile:frameP95:50plus': '1',
    'telemetry:device:tablet:frameP95:lt16': '1',
    'telemetry:device:tablet:frameP95:25-33': '3',
    'telemetry:device:tablet:frameP95:33-50': '3',
    'telemetry:duration:lt1m': '1',
    'telemetry:duration:1-3m': '9',
    'telemetry:duration:3-5m': '15',
    'telemetry:duration:5-10m': '12',
    'telemetry:duration:10-20m': '5',
    'telemetry:waves:0-4': '1',
    'telemetry:waves:5-9': '4',
    'telemetry:waves:10-19': '9',
    'telemetry:waves:20-29': '12',
    'telemetry:waves:30-39': '10',
    'telemetry:waves:40plus': '6',
    'telemetry:waves:max': '37',
    'telemetry:updatedAt': '2026-07-09T09:00:00.000Z',
    'telemetry:dedup:2026-07:abcdef': '1',
  };
}

function flatten(value: unknown): Array<{ key: string; value: unknown }> {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => [{ key, value: nested }, ...flatten(nested)]);
}

function expectAggregateOnly(body: unknown): void {
  const entries = flatten(body);
  expect(entries.some(({ key }) => IDENTIFIER_KEYS.has(key.toLowerCase()))).toBe(false);
  expect(JSON.stringify(body)).not.toContain('telemetry:dedup');
}

test('GET /api/stats returns populated aggregate counters', async ({}, testInfo) => {
  const { response, body } = await routeJson({ TELEMETRY: makeKv(populatedSeed()) });

  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toContain('s-maxage=60');
  expect(response.headers.get('vary')).toBe('Origin');
  expect(body.empty).toBe(false);
  expect(body.stats).toMatchObject({
    runs: { today: 5, sevenDays: 14, allTime: 42 },
    deepestWave: 37,
    medianDurationBucket: '3-5m',
    durationHistogram: { lt1m: 1, '1-3m': 9, '3-5m': 15, '5-10m': 12, '10-20m': 5, '20mplus': 0 },
    busiestContract: { id: 'e1-dry-gulch', runs: 30 },
    tierSplit: { FULL: 10, BALANCED: 20, LITE: 12 },
    deviceSplit: { desktop: 20, mobile: 15, tablet: 7 },
    frameP95Global: { lt16: 3, '16-25': 10, '25-33': 20, '33-50': 8, '50plus': 1 },
    frameP95ByDevice: {
      desktop: { lt16: 2, '16-25': 8, '25-33': 9, '33-50': 1, '50plus': 0 },
      mobile: { lt16: 0, '16-25': 2, '25-33': 8, '33-50': 4, '50plus': 1 },
      tablet: { lt16: 1, '16-25': 0, '25-33': 3, '33-50': 3, '50plus': 0 },
    },
    wavesHistogram: { '0-4': 1, '5-9': 4, '10-19': 9, '20-29': 12, '30-39': 10, '40plus': 6 },
    updatedAt: '2026-07-09T09:00:00.000Z',
  });
  expect(JSON.stringify(body)).not.toContain('xxx-garbage');
  expect(JSON.stringify(body)).not.toContain('"other"');
  expectAggregateOnly(body);
  await writeJsonArtifact(testInfo, 'populated-response', body);
});

test('GET /api/stats returns graceful empty states when bound with no runs or unbound', async ({}, testInfo) => {
  const bound = await routeJson({ TELEMETRY: makeKv() });
  expect(bound.response.status).toBe(200);
  expect(bound.body).toMatchObject({
    ok: true,
    empty: true,
    message: EMPTY_MESSAGE,
    stats: { runs: { today: 0, sevenDays: 0, allTime: 0 }, deepestWave: 0, medianDurationBucket: null, busiestContract: null },
  });
  expectAggregateOnly(bound.body);
  await writeJsonArtifact(testInfo, 'empty-response', bound.body);

  const unbound = await routeJson({});
  expect(unbound.response.status).toBe(200);
  expect(unbound.body).toMatchObject({ ok: true, empty: true, message: EMPTY_MESSAGE });
  expectAggregateOnly(unbound.body);

  const partial = await routeJson({ TELEMETRY: makeKv({ 'telemetry:duration:3-5m': '2', 'telemetry:waves:max': '12' }) });
  expect(partial.response.status).toBe(200);
  expect(partial.body).toMatchObject({
    ok: true,
    empty: true,
    message: EMPTY_MESSAGE,
    stats: { runs: { allTime: 0 }, deepestWave: 0, durationHistogram: { '3-5m': 0 } },
  });
});

test('GET /api/stats guards methods and CORS preflight', async () => {
  const post = await statsRoute({ request: request('POST'), env: {} });
  expect(post.status).toBe(405);

  const options = await statsRoute({ request: request('OPTIONS', 'http://localhost:5188'), env: {} });
  expect(options.status).toBe(204);
  expect(options.headers.get('access-control-allow-origin')).toBe('http://localhost:5188');
  expect(options.headers.get('access-control-allow-methods')).toBe('GET, OPTIONS');
});

test('GET /api/stats falls back to empty state on KV errors', async () => {
  const { response, body } = await routeJson({ TELEMETRY: failingKv() });
  expect(response.status).toBe(200);
  expect(body).toMatchObject({ ok: true, empty: true, message: EMPTY_MESSAGE });
  expectAggregateOnly(body);
});
