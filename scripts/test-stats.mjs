import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const STATE_ROOT = path.join(ROOT, 'test-results/stats-worker-state');
const SUMMARY_PATH = path.join(ROOT, 'test-results/stats-worker-summary.json');
const EMPTY_MESSAGE = 'the office opens with the first assay';
const IDENTIFIER_KEYS = new Set(['email', 'profile', 'profileid', 'profilename', 'wallet', 'ip', 'name', 'userid', 'user_id', 'nonce']);
const checks = [];

await main();

async function main() {
  await rm(STATE_ROOT, { recursive: true, force: true });
  await mkdir(STATE_ROOT, { recursive: true });

  try {
    await checkEmptyState();
    await checkPopulatedAggregates();
    await writeSummary('passed');
    console.log(`stats worker checks passed (${checks.length})`);
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  }
}

async function checkEmptyState() {
  const server = await startPages('empty');
  try {
    const response = await getJson(server.url, '/api/stats');
    assertEqual(response.status, 200, 'empty stats returns 200');
    assertEqual(response.body.ok, true, 'empty stats ok');
    assertEqual(response.body.empty, true, 'empty stats flag');
    assertEqual(response.body.message, EMPTY_MESSAGE, 'empty stats message');
    assertEqual(response.body.stats?.runs?.allTime, 0, 'empty stats zero all-time runs');
    assertCache(response, 'empty stats cache');
    assertAggregateOnly(response.body, 'empty stats response');

    const badCors = await getJson(server.url, '/api/stats', 'https://evil.example');
    assertEqual(badCors.status, 403, 'bad CORS origin rejected');
    assertAggregateOnly(badCors.body, 'bad CORS response');

    const post = await fetch(`${server.url}/api/stats`, { method: 'POST', headers: { Origin: ORIGIN } });
    assertEqual(post.status, 405, 'non-GET method rejected');

    const options = await fetch(`${server.url}/api/stats`, { method: 'OPTIONS', headers: { Origin: ORIGIN } });
    assertEqual(options.status, 204, 'CORS preflight succeeds');
    assertEqual(options.headers.get('access-control-allow-methods'), 'GET, OPTIONS', 'CORS preflight methods');
  } finally {
    await server.stop();
  }
}

async function checkPopulatedAggregates() {
  const persistPath = path.join(STATE_ROOT, 'populated');
  await seedKv(persistPath, populatedSeed());
  const server = await startPages('populated');
  try {
    const response = await getJson(server.url, '/api/stats');
    assertEqual(response.status, 200, 'populated stats returns 200');
    assertEqual(response.body.ok, true, 'populated stats ok');
    assertEqual(response.body.empty, false, 'populated stats not empty');
    assertCache(response, 'populated stats cache');

    const stats = response.body.stats;
    assertEqual(stats.runs.today, 5, 'runs today comes from current UTC day key');
    assertEqual(stats.runs.sevenDays, 14, 'runs sevenDays excludes the eighth day');
    assertEqual(stats.runs.allTime, 42, 'runs allTime reads total counter');
    assertEqual(stats.deepestWave, 37, 'deepest wave reads max counter');
    assertEqual(stats.medianDurationBucket, '3-5m', 'median duration bucket crosses target count');
    assertEqual(stats.busiestContract.id, 'steady-hands', 'busiest contract uses highest counter');
    assertEqual(stats.busiestContract.runs, 30, 'busiest contract run count');
    assertEqual(stats.tierSplit.FULL, 10, 'tier FULL count');
    assertEqual(stats.tierSplit.BALANCED, 20, 'tier BALANCED count');
    assertEqual(stats.tierSplit.LITE, 12, 'tier LITE count');
    assertEqual(stats.deviceSplit.desktop, 20, 'desktop device count');
    assertEqual(stats.deviceSplit.mobile, 15, 'mobile device count');
    assertEqual(stats.deviceSplit.tablet, 7, 'tablet device count');
    assertEqual(stats.frameP95ByDevice.desktop['25-33'], 9, 'desktop frame p95 bucket');
    assertEqual(stats.frameP95ByDevice.mobile['50plus'], 1, 'mobile frame p95 bucket');
    assertEqual(stats.frameP95ByDevice.tablet['16-25'], 0, 'missing tablet bucket is zero-filled');
    assertEqual(stats.frameP95Global['25-33'], 20, 'global frame p95 bucket');
    assertEqual(stats.durationHistogram['20mplus'], 0, 'missing duration bucket is zero-filled');
    assertEqual(stats.wavesHistogram['40plus'], 6, 'wave histogram bucket');
    assertEqual(stats.updatedAt, '2026-07-09T09:00:00.000Z', 'updatedAt passes through aggregate timestamp');
    assertAggregateOnly(response.body, 'populated stats response');
  } finally {
    await server.stop();
  }
}

async function seedKv(persistPath, rows) {
  await mkdir(persistPath, { recursive: true });
  const seedPath = path.join(persistPath, 'stats-seed.json');
  await writeFile(seedPath, `${JSON.stringify(rows.map(([key, value]) => ({ key, value })), null, 2)}\n`);
  await runWrangler([
    'kv',
    'bulk',
    'put',
    seedPath,
    '--namespace-id',
    'TELEMETRY',
    '--local',
    '--persist-to',
    persistPath,
  ]);
}

async function startPages(name) {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, name);
  const child = spawnWrangler(
    [
      'pages',
      'dev',
      'public',
      '--compatibility-date',
      '2026-07-08',
      '--kv',
      'TELEMETRY',
      '--port',
      String(port),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      persistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    `pages ${name}`,
  );
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, child);
  return { url, stop: child.stop };
}

function spawnWrangler(args, label) {
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
  return {
    get exitCode() {
      return child.exitCode;
    },
    logs: () => output,
    label,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

async function runWrangler(args) {
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
  await new Promise((resolve) => child.once('exit', resolve));
  if (child.exitCode !== 0) throw new Error(`wrangler ${args.join(' ')} failed:\n${output}`);
}

function cleanEnv() {
  const env = { ...process.env };
  delete env.DEV_AUTH;
  delete env.RESEND_API_KEY;
  delete env.AUTH_CODE_PEPPER;
  return env;
}

async function waitForServer(url, child) {
  const started = Date.now();
  while (Date.now() - started < 25_000) {
    if (child.exitCode !== null) throw new Error(`${child.label} exited early:\n${child.logs()}`);
    try {
      const response = await fetch(`${url}/api/stats`, { headers: { Origin: ORIGIN } });
      if (response.status < 500) return;
    } catch {
      // server still starting
    }
    await sleep(250);
  }
  throw new Error(`${child.label} did not become ready:\n${child.logs()}`);
}

async function getJson(baseUrl, route, origin = ORIGIN) {
  const response = await fetch(`${baseUrl}${route}`, { headers: { Origin: origin } });
  return { status: response.status, headers: response.headers, body: await response.json().catch(() => ({})) };
}

function populatedSeed() {
  const [today, yesterday, twoDaysAgo, , , , sixDaysAgo, sevenDaysAgo] = lastUtcDays(8);
  return [
    ['telemetry:runs:total', '42'],
    [`telemetry:runs:day:${today}`, '5'],
    [`telemetry:runs:day:${yesterday}`, '4'],
    [`telemetry:runs:day:${twoDaysAgo}`, '3'],
    [`telemetry:runs:day:${sixDaysAgo}`, '2'],
    [`telemetry:runs:day:${sevenDaysAgo}`, '99'],
    ['telemetry:contract:deep-vein', '12'],
    ['telemetry:contract:steady-hands', '30'],
    ['telemetry:tier:FULL', '10'],
    ['telemetry:tier:BALANCED', '20'],
    ['telemetry:tier:LITE', '12'],
    ['telemetry:device:desktop', '20'],
    ['telemetry:device:mobile', '15'],
    ['telemetry:device:tablet', '7'],
    ['telemetry:frameP95:lt16', '3'],
    ['telemetry:frameP95:16-25', '10'],
    ['telemetry:frameP95:25-33', '20'],
    ['telemetry:frameP95:33-50', '8'],
    ['telemetry:frameP95:50plus', '1'],
    ['telemetry:device:desktop:frameP95:lt16', '2'],
    ['telemetry:device:desktop:frameP95:16-25', '8'],
    ['telemetry:device:desktop:frameP95:25-33', '9'],
    ['telemetry:device:desktop:frameP95:33-50', '1'],
    ['telemetry:device:mobile:frameP95:16-25', '2'],
    ['telemetry:device:mobile:frameP95:25-33', '8'],
    ['telemetry:device:mobile:frameP95:33-50', '4'],
    ['telemetry:device:mobile:frameP95:50plus', '1'],
    ['telemetry:device:tablet:frameP95:lt16', '1'],
    ['telemetry:device:tablet:frameP95:25-33', '3'],
    ['telemetry:device:tablet:frameP95:33-50', '3'],
    ['telemetry:duration:lt1m', '1'],
    ['telemetry:duration:1-3m', '9'],
    ['telemetry:duration:3-5m', '15'],
    ['telemetry:duration:5-10m', '12'],
    ['telemetry:duration:10-20m', '5'],
    ['telemetry:waves:0-4', '1'],
    ['telemetry:waves:5-9', '4'],
    ['telemetry:waves:10-19', '9'],
    ['telemetry:waves:20-29', '12'],
    ['telemetry:waves:30-39', '10'],
    ['telemetry:waves:40plus', '6'],
    ['telemetry:waves:max', '37'],
    ['telemetry:updatedAt', '2026-07-09T09:00:00.000Z'],
    ['telemetry:dedup:2026-07:abcdef', '1'],
  ];
}

function lastUtcDays(count) {
  return Array.from({ length: count }, (_, index) => new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
}

function assertCache(response, label) {
  const header = response.headers.get('cache-control') ?? '';
  assert(header.includes('public'), `${label}: public cache`);
  assert(header.includes('max-age=60'), `${label}: browser max-age`);
  assert(header.includes('s-maxage=60'), `${label}: edge s-maxage`);
}

function assertAggregateOnly(body, label) {
  const entries = flatten(body);
  assert(!entries.some(({ key }) => IDENTIFIER_KEYS.has(key.toLowerCase())), `${label}: no identifier-shaped keys`);
  assert(!JSON.stringify(body).includes('telemetry:dedup'), `${label}: no dedup keys`);
}

function flatten(value) {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(flatten);
  return Object.entries(value).flatMap(([key, nested]) => [{ key, value: nested }, ...flatten(nested)]);
}

function assert(value, label) {
  if (!value) throw new Error(label);
  checks.push(label);
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
}

async function writeSummary(status, err) {
  await mkdir(path.dirname(SUMMARY_PATH), { recursive: true });
  await writeFile(
    SUMMARY_PATH,
    `${JSON.stringify(
      {
        status,
        checks,
        error: err instanceof Error ? err.message : undefined,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

async function freePort() {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
