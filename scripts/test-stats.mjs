import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertWranglerVersion } from './wrangler-binary.mjs';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import rotationSeeds from '../assets/rotations/rotation-seeds.json' with { type: 'json' };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const STATE_ROOT = path.join(ROOT, 'test-results/stats-worker-state');
const SUMMARY_PATH = path.join(ROOT, 'test-results/stats-worker-summary.json');
const EMPTY_MESSAGE = 'the office opens with the first assay';
const IDENTIFIER_KEYS = new Set(['email', 'profile', 'profileid', 'profilename', 'wallet', 'ip', 'name', 'userid', 'user_id', 'nonce']);
const checks = [];

await main();

async function main() {
  assertWranglerVersion('test:stats');
  await rm(STATE_ROOT, { recursive: true, force: true });
  await mkdir(STATE_ROOT, { recursive: true });

  try {
    await checkEmptyState();
    await checkPopulatedAggregates();
    await checkTelemetryIngestHardening();
    await checkTelemetryRateLimit();
    await checkStandingsWeekBoard();
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
    assertEqual(stats.busiestContract.id, 'e1-dry-gulch', 'busiest contract uses highest known-contract counter');
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

async function checkTelemetryIngestHardening() {
  const server = await startPages('ingest');
  try {
    const known = await postJson(server.url, '/api/telemetry', telemetryPayload({ contract: 'e1-dry-gulch', nonce: '00000000000000000000000000000001' }));
    assertEqual(known.status, 200, 'known telemetry shape accepted');
    assertEqual(known.body.stored, true, 'known telemetry stored');

    const garbage = await postJson(server.url, '/api/telemetry', telemetryPayload({ contract: 'xxx-garbage', nonce: '00000000000000000000000000000002' }));
    assertEqual(garbage.status, 200, 'garbage contract telemetry accepted into internal bucket');
    assertEqual(garbage.body.stored, true, 'garbage contract telemetry stored');

    const statsResponse = await getJson(server.url, '/api/stats');
    assertEqual(statsResponse.status, 200, 'stats read after telemetry ingest succeeds');
    assertEqual(statsResponse.body.stats.runs.allTime, 2, 'unknown contract still counts as a run');
    assertEqual(statsResponse.body.stats.busiestContract.id, 'e1-dry-gulch', 'garbage contract never becomes busiest contract');
    assert(!JSON.stringify(statsResponse.body).includes('xxx-garbage'), 'stats response does not surface garbage contract key');
    assert(!JSON.stringify(statsResponse.body).includes('"other"'), 'stats response does not render internal other bucket');

    const badIdentifier = await postJson(
      server.url,
      '/api/telemetry',
      { ...telemetryPayload({ contract: 'the-claim', nonce: '00000000000000000000000000000003' }), email: 'robin@example.com' },
    );
    assertEqual(badIdentifier.status, 400, 'identifier-shaped telemetry field rejected');
  } finally {
    await server.stop();
  }
}

async function checkTelemetryRateLimit() {
  const server = await startPages('rate-limit');
  try {
    let limited = null;
    for (let index = 0; index < 31; index += 1) {
      const nonce = index.toString(16).padStart(32, '0');
      const response = await postJson(server.url, '/api/telemetry', telemetryPayload({ contract: 'the-claim', nonce }), undefined);
      if (response.status === 429) {
        limited = response;
        break;
      }
      assertEqual(response.status, 200, `telemetry request ${index + 1} before limit accepted`);
    }
    assert(limited, 'telemetry rate limit trips');
    assertEqual(limited.body.error, 'rate_limited', 'telemetry rate limit error code');
    assertEqual(limited.body.message, 'The wire is busy. Try again later.', 'telemetry rate limit friendly copy');
  } finally {
    await server.stop();
  }
}

// county-board-open-week-1 (F-LSR1-1; owner 2026-09-26, "3 - ok, lets do that"): the public board's
// `?rotation=` shape, read through the Pages runtime rather than in-process. The wall clock cannot be pinned
// inside wrangler, so the rows are seeded on the week the door itself calls open right now (the latest
// rotation already opened, `currentOrLatestRotation`), and the not-yet-opened check runs only while the
// registry holds a week that has not opened.
async function checkStandingsWeekBoard() {
  const now = Date.now();
  const opened = rotationSeeds.rotations.filter((rotation) => Date.parse(rotation.opensAt) <= now)
    .sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt));
  const week = opened[0];
  assert(week && typeof week.seeds['the-claim'] === 'string', 'the registry holds an opened week that carries the Claim');
  const unopened = rotationSeeds.rotations.find((rotation) => Date.parse(rotation.opensAt) > now);
  const persistPath = path.join(STATE_ROOT, 'standings-week');
  await seedKv(persistPath, [['standings:s2:epoch-1-frontier:the-claim', JSON.stringify([
    standingRow('All-Time Rider', '1', 40, 'gold-rush', now),
    standingRow('Week Rider', '2', 12, week.seeds['the-claim'], now, { rotationId: week.id }),
    standingRow('Week Posse', '3', 15, week.seeds['the-claim'], now, { rotationId: week.id, riders: ['Ada', 'Robin'] }),
  ])]]);
  const server = await startPages('standings-week');
  try {
    const claim = '/api/standings?contract=the-claim&epoch=epoch-1-frontier';
    const allTime = await getJson(server.url, claim);
    assertEqual(allTime.status, 200, 'all-time standings board returns 200');
    assertEqual(allTime.body.board?.map((row) => row.profileName).join(','), 'All-Time Rider', 'all-time board keeps only rows off the weekly seeds');
    assert(!('rotationId' in allTime.body), 'all-time board names no week');

    const named = await getJson(server.url, `${claim}&rotation=${week.id}`);
    assertEqual(named.status, 200, 'named week board returns 200');
    assertEqual(named.body.rotationId, week.id, 'named week board names its week');
    assertEqual(named.body.board?.map((row) => `${row.profileName}@${row.rotationId}`).join(','), `Week Rider@${week.id}`, 'named week board serves that week alone');

    const open = await getJson(server.url, `${claim}&rotation=open`);
    assertEqual(JSON.stringify(open.body), JSON.stringify(named.body), 'open alias reads the week the door calls open');

    const posse = await getJson(server.url, `${claim}&party=2&rotation=${week.id}`);
    assertEqual(posse.body.board?.map((row) => `${row.profileName}:${row.party?.riderCount}`).join(','), 'Week Posse:2', 'week posse ranks within its size');

    const unknown = await getJson(server.url, `${claim}&rotation=r1999w01`);
    assertEqual(unknown.status, 400, 'unknown week refused');
    assertEqual(unknown.body.error, 'bad_rotation', 'unknown week refusal code');
    if (unopened) {
      const early = await getJson(server.url, `${claim}&rotation=${unopened.id}`);
      assertEqual(early.body.error, 'bad_rotation', `week ${unopened.id} is refused before it opens`);
    }
  } finally {
    await server.stop();
  }
}

// A stored standing the door validates and ranks: a current-era reel on the row's own seed.
function standingRow(name, digit, waves, seed, now, { rotationId, riders } = {}) {
  const id = `stats-week-${digit}`;
  const outcome = { waves, timeAlive: 120, gold: 40 };
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    secured: true, ...outcome, baseValue: 60, profileName: name, anonId: digit.repeat(32), difficulty: 'trail',
    seed, seedMode: 'live', seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64), submittedAt: now - 60_000,
    ...(riders ? { party: { riderCount: riders.length, riders: riders.map((rider) => ({ name: rider })) } } : {}),
    tape: {
      version: 2, id, createdAt: 1, kept: true, contract: 'the-claim', seed, difficulty: 'trail', simVersion: 1,
      meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
      runStart: { meta: progress, research: { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null } },
      inputLog: {
        version: 1, name: id, contractId: 'the-claim', seed, difficultyPreset: 'trail', stepSeconds: 1 / 30,
        start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
      },
      eventLogHash: 'fnv1a32:1234abcd',
      outcome: { reason: 'secured', secured: true, ...outcome },
    },
    assay: 'pending',
    ...(rotationId ? { rotationId } : {}),
  };
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

async function postJson(baseUrl, route, body, origin = ORIGIN) {
  const headers = { 'content-type': 'application/json' };
  if (origin) headers.Origin = origin;
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: response.status, headers: response.headers, body: await response.json().catch(() => ({})) };
}

function telemetryPayload(overrides = {}) {
  return {
    contract: 'the-claim',
    waves: 12,
    duration: 240_000,
    upgradesTaken: 4,
    tier: 'BALANCED',
    frameP95: 24.5,
    deviceClass: 'desktop',
    buildHash: 'dev',
    nonce: 'abcdefabcdefabcdefabcdefabcdefab',
    ...overrides,
  };
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
    ['telemetry:contract:e1-baron', '12'],
    ['telemetry:contract:e1-dry-gulch', '30'],
    ['telemetry:contract:xxx-garbage', '999'],
    ['telemetry:contract:other', '1000'],
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
