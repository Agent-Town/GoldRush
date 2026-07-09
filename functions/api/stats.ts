type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<KVListResult>;
};

type StatsEnv = {
  TELEMETRY?: KVNamespaceLike;
};

type StatsContext = {
  request: Request;
  env: StatsEnv;
};

const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const EMPTY_MESSAGE = 'the office opens with the first assay';
const PUBLIC_CACHE = 'public, max-age=60, s-maxage=60';

const DURATION_BUCKETS = ['lt1m', '1-3m', '3-5m', '5-10m', '10-20m', '20mplus'] as const;
const FRAME_BUCKETS = ['lt16', '16-25', '25-33', '33-50', '50plus'] as const;
const WAVE_BUCKETS = ['0-4', '5-9', '10-19', '20-29', '30-39', '40plus'] as const;
const TIER_KEYS = ['FULL', 'BALANCED', 'LITE'] as const;
const DEVICE_CLASSES = ['desktop', 'mobile', 'tablet'] as const;

type DurationBucket = (typeof DURATION_BUCKETS)[number];
type FrameBucket = (typeof FRAME_BUCKETS)[number];
type WaveBucket = (typeof WAVE_BUCKETS)[number];
type TierKey = (typeof TIER_KEYS)[number];
type DeviceClass = (typeof DEVICE_CLASSES)[number];
type CounterMap<Key extends string> = Record<Key, number>;

type Stats = {
  runs: { today: number; sevenDays: number; allTime: number };
  deepestWave: number;
  medianDurationBucket: DurationBucket | null;
  durationHistogram: CounterMap<DurationBucket>;
  busiestContract: { id: string; runs: number } | null;
  tierSplit: CounterMap<TierKey>;
  deviceSplit: CounterMap<DeviceClass>;
  frameP95ByDevice: Record<DeviceClass, CounterMap<FrameBucket>>;
  frameP95Global: CounterMap<FrameBucket>;
  wavesHistogram: CounterMap<WaveBucket>;
  updatedAt: string | null;
};

export async function onRequest(context: StatsContext): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET') return error(cors, 405, 'method_not_allowed', 'GET only');
  const publicCors = { ...cors, 'Cache-Control': PUBLIC_CACHE };
  if (!context.env.TELEMETRY) return json(publicCors, emptyPayload(), 200);

  try {
    const stats = await loadStats(context.env.TELEMETRY);
    if (stats.runs.allTime <= 0) return json(publicCors, emptyPayload(), 200);
    return json(publicCors, { ok: true, empty: false, stats });
  } catch {
    return json(publicCors, emptyPayload(), 200);
  }
}

async function loadStats(kv: KVNamespaceLike): Promise<Stats> {
  const days = lastUtcDays(7);
  const [
    allTime,
    dayCounts,
    deepestWave,
    durationHistogram,
    busiestContract,
    tierSplit,
    deviceSplit,
    frameP95Global,
    frameP95ByDevice,
    wavesHistogram,
    updatedAt,
  ] = await Promise.all([
    readCounter(kv, 'telemetry:runs:total'),
    Promise.all(days.map((day) => readCounter(kv, `telemetry:runs:day:${day}`))),
    readCounter(kv, 'telemetry:waves:max'),
    readCounterMap(kv, 'telemetry:duration:', DURATION_BUCKETS),
    readBusiestContract(kv),
    readCounterMap(kv, 'telemetry:tier:', TIER_KEYS),
    readCounterMap(kv, 'telemetry:device:', DEVICE_CLASSES),
    readCounterMap(kv, 'telemetry:frameP95:', FRAME_BUCKETS),
    readFrameP95ByDevice(kv),
    readCounterMap(kv, 'telemetry:waves:', WAVE_BUCKETS),
    kv.get('telemetry:updatedAt'),
  ]);

  return {
    runs: {
      today: dayCounts[0] ?? 0,
      sevenDays: dayCounts.reduce((sum, count) => sum + count, 0),
      allTime,
    },
    deepestWave,
    medianDurationBucket: medianBucket(durationHistogram),
    durationHistogram,
    busiestContract,
    tierSplit,
    deviceSplit,
    frameP95ByDevice,
    frameP95Global,
    wavesHistogram,
    updatedAt: updatedAt || null,
  };
}

async function readBusiestContract(kv: KVNamespaceLike): Promise<Stats['busiestContract']> {
  const prefix = 'telemetry:contract:';
  const keys = await listKeys(kv, prefix);
  const rows = await Promise.all(
    keys.map(async (key) => ({
      id: key.slice(prefix.length),
      runs: await readCounter(kv, key),
    })),
  );
  let best: Stats['busiestContract'] = null;
  for (const row of rows) {
    if (!row.id || row.runs <= 0) continue;
    if (!best || row.runs > best.runs || (row.runs === best.runs && row.id < best.id)) best = row;
  }
  return best;
}

async function readFrameP95ByDevice(kv: KVNamespaceLike): Promise<Record<DeviceClass, CounterMap<FrameBucket>>> {
  const entries = await Promise.all(
    DEVICE_CLASSES.map(async (device) => [device, await readCounterMap(kv, `telemetry:device:${device}:frameP95:`, FRAME_BUCKETS)] as const),
  );
  return Object.fromEntries(entries) as Record<DeviceClass, CounterMap<FrameBucket>>;
}

async function readCounterMap<Key extends readonly string[]>(
  kv: KVNamespaceLike,
  prefix: string,
  keys: Key,
): Promise<Record<Key[number], number>> {
  const entries = await Promise.all(keys.map(async (key) => [key, await readCounter(kv, `${prefix}${key}`)] as const));
  return Object.fromEntries(entries) as Record<Key[number], number>;
}

async function readCounter(kv: KVNamespaceLike, key: string): Promise<number> {
  const value = Number(await kv.get(key));
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;
}

async function listKeys(kv: KVNamespaceLike, prefix: string): Promise<string[]> {
  const names: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list(cursor ? { prefix, cursor } : { prefix });
    names.push(...page.keys.map((key) => key.name).filter((name) => name.startsWith(prefix)));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}

function medianBucket(histogram: CounterMap<DurationBucket>): DurationBucket | null {
  const total = DURATION_BUCKETS.reduce((sum, bucket) => sum + histogram[bucket], 0);
  if (total <= 0) return null;
  const target = Math.ceil(total / 2);
  let cumulative = 0;
  for (const bucket of DURATION_BUCKETS) {
    cumulative += histogram[bucket];
    if (cumulative >= target) return bucket;
  }
  return '20mplus';
}

function emptyPayload(stats = zeroStats()): { ok: true; empty: true; message: string; stats: Stats } {
  return { ok: true, empty: true, message: EMPTY_MESSAGE, stats };
}

function zeroStats(): Stats {
  return {
    runs: { today: 0, sevenDays: 0, allTime: 0 },
    deepestWave: 0,
    medianDurationBucket: null,
    durationHistogram: zeroCounterMap(DURATION_BUCKETS),
    busiestContract: null,
    tierSplit: zeroCounterMap(TIER_KEYS),
    deviceSplit: zeroCounterMap(DEVICE_CLASSES),
    frameP95ByDevice: Object.fromEntries(DEVICE_CLASSES.map((device) => [device, zeroCounterMap(FRAME_BUCKETS)])) as Record<
      DeviceClass,
      CounterMap<FrameBucket>
    >,
    frameP95Global: zeroCounterMap(FRAME_BUCKETS),
    wavesHistogram: zeroCounterMap(WAVE_BUCKETS),
    updatedAt: null,
  };
}

function zeroCounterMap<Key extends readonly string[]>(keys: Key): Record<Key[number], number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<Key[number], number>;
}

function lastUtcDays(count: number): string[] {
  return Array.from({ length: count }, (_, index) => new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
}

function corsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin };
  }
  return null;
}

function json(cors: Record<string, string>, value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
  });
}

function error(cors: Record<string, string>, status: number, code: string, message: string): Response {
  return json(cors, { ok: false, error: code, message }, status);
}
