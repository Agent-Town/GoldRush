import assert from 'node:assert/strict';

import {
  draftTickerStats,
  statsEndpoint,
  UnsafeTickerCopyError,
} from './ticker-stats.mjs';

const QUIET_LINE = 'the wire is quiet.';
const EMPTY_LINE = 'the office opens with the first assay.';

const fixture = {
  ok: true,
  empty: false,
  stats: {
    runs: { today: 5, sevenDays: 14, allTime: 42 },
    deepestWave: 37,
    medianDurationBucket: '3-5m',
    durationHistogram: { lt1m: 1, '1-3m': 2, '3-5m': 20, '5-10m': 10, '10-20m': 7, '20mplus': 2 },
    busiestContract: { id: 'e1-dry-gulch', runs: 30 },
    tierSplit: { FULL: 10, BALANCED: 20, LITE: 12 },
    deviceSplit: { desktop: 20, mobile: 15, tablet: 7 },
    frameP95ByDevice: {
      desktop: { lt16: 1, '16-25': 8, '25-33': 9, '33-50': 2, '50plus': 0 },
      mobile: { lt16: 0, '16-25': 2, '25-33': 5, '33-50': 7, '50plus': 1 },
      tablet: { lt16: 0, '16-25': 0, '25-33': 3, '33-50': 4, '50plus': 0 },
    },
    frameP95Global: { lt16: 1, '16-25': 10, '25-33': 17, '33-50': 13, '50plus': 1 },
    wavesHistogram: { '0-4': 2, '5-9': 4, '10-19': 10, '20-29': 12, '30-39': 8, '40plus': 6 },
    updatedAt: '2026-07-09T09:00:00.000Z',
  },
};

const expected = [
  'Assay Office: 5 runs today · 14 in seven days · 42 all told.',
  'Deepest holdout: wave 37 · Typical run: 3–5 min.',
  'Busiest trail: E1 Dry Gulch · 30 assays.',
  'Trail rigs: Full 10 · Balanced 20 · Lite 12.',
  'Devices: Desktop 20 · Mobile 15 · Tablet 7.',
  'Run lengths: under 1 min 1 · 1–3 min 2 · 3–5 min 20 · 5–10 min 10 · 10–20 min 7 · 20 min+ 2.',
  'Frame p95: under 16 ms 1 · 16–25 ms 10 · 25–33 ms 17 · 33–50 ms 13 · 50 ms+ 1.',
  'Desktop frame p95: under 16 ms 1 · 16–25 ms 8 · 25–33 ms 9 · 33–50 ms 2 · 50 ms+ 0.',
  'Mobile frame p95: under 16 ms 0 · 16–25 ms 2 · 25–33 ms 5 · 33–50 ms 7 · 50 ms+ 1.',
  'Tablet frame p95: under 16 ms 0 · 16–25 ms 0 · 25–33 ms 3 · 33–50 ms 4 · 50 ms+ 0.',
  'Waves reached: 0–4 2 · 5–9 4 · 10–19 10 · 20–29 12 · 30–39 8 · 40+ 6.',
  'Ledger tally: 2026-07-09T09:00:00.000Z.',
];

const output = await draftTickerStats({ url: 'fixture:', fetchImpl: reply(fixture) });
assert.deepEqual(output.split('\n'), expected, 'populated fixture renders only its supplied fields');
assert(expected.every((line) => line.length <= 140), 'every populated line stays within the Ticker cap');

const empty = structuredClone(fixture);
empty.empty = true;
assert.equal(await draftTickerStats({ url: 'fixture:', fetchImpl: reply(empty) }), EMPTY_LINE, 'empty office is not a quiet wire');

for (const fetchImpl of [
  async () => { throw new Error('unreachable'); },
  reply({}, 500),
  async () => ({ ok: true, json: async () => { throw new SyntaxError('garbage JSON'); } }),
]) {
  assert.equal(await draftTickerStats({ url: 'fixture:', fetchImpl }), QUIET_LINE);
}

const invalid = structuredClone(fixture);
delete invalid.stats.runs.today;
assert.equal(
  await draftTickerStats({ url: 'fixture:', fetchImpl: reply(invalid) }),
  QUIET_LINE,
  'a non-empty shape violation is an unusable answer',
);

const diagnostics = [];
assert.equal(
  await draftTickerStats({
    endpointImpl: () => statsEndpoint(async () => 'const RENAMED_ENDPOINT = "https://example.test/api/stats";'),
    stderr: (line) => diagnostics.push(line),
  }),
  QUIET_LINE,
  'a broken endpoint read keeps stdout paste-safe',
);
assert.deepEqual(
  diagnostics,
  ['ticker-stats: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts'],
  'a broken endpoint read names the file and constant on stderr',
);

const poisoned = structuredClone(fixture);
poisoned.stats.busiestContract.id = 'token-ridge';
await assert.rejects(
  draftTickerStats({ url: 'fixture:', fetchImpl: reply(poisoned) }),
  (error) => error instanceof UnsafeTickerCopyError && /banned word: token/.test(error.message),
  'poisoned contract copy trips the deny-list guard',
);
await assert.rejects(
  draftTickerStats({ url: 'fixture:', json: true, fetchImpl: reply(poisoned) }),
  UnsafeTickerCopyError,
  'raw output cannot bypass the deny-list guard',
);

assert.match(await statsEndpoint(), /^https:\/\/.+\/api\/stats$/, 'default URL is read from the shipped live-stats owner');
assert.deepEqual(
  JSON.parse(await draftTickerStats({ url: 'fixture:', json: true, fetchImpl: reply(fixture) })),
  fixture,
  '--json passes the raw payload through',
);

console.log('ticker stats checks passed (populated, empty, failures, invalid shape, endpoint diagnostic, poison control, shared URL, JSON)');

function reply(body, status = 200) {
  return async () => ({ ok: status >= 200 && status < 300, status, json: async () => structuredClone(body) });
}
