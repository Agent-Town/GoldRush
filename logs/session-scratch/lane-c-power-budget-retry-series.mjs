import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { loadavg } from 'node:os';

const CAP_MS = 0.5;
const DEFAULT_RUNS = Number(process.argv[2] ?? 40);
const BACKGROUND_PAIRS = Number(process.argv[3] ?? 6);
const OUTPUT = process.argv[4] === '-'
  ? null
  : new URL(process.argv[4] ?? 'lane-c-power-budget-retry-series.json', import.meta.url);

function runOnce(background = false) {
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const command = background ? 'taskpolicy' : 'npm';
  const args = background
    ? ['-b', 'npm', 'run', '--silent', 'test:power-budget']
    : ['run', '--silent', 'test:power-budget'];
  const run = spawnSync(command, args, { encoding: 'utf8', timeout: 5 * 60 * 1000 });
  const text = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const match = text.match(/p95[= ]([0-9.]+)ms/);
  return {
    startedAt,
    endedAt: new Date().toISOString(),
    wallMs: Math.round(performance.now() - started),
    rc: run.status === null ? `signal:${run.signal ?? 'unknown'}` : run.status,
    p95: match ? Number(match[1]) : null,
    ...(match ? {} : { parseFailure: text.slice(-1_000) }),
  };
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function lag1(values) {
  const left = values.slice(0, -1);
  const right = values.slice(1);
  const leftMean = left.reduce((sum, value) => sum + value, 0) / left.length;
  const rightMean = right.reduce((sum, value) => sum + value, 0) / right.length;
  const covariance = left.reduce(
    (sum, value, index) => sum + (value - leftMean) * (right[index] - rightMean),
    0,
  );
  const varianceLeft = left.reduce((sum, value) => sum + (value - leftMean) ** 2, 0);
  const varianceRight = right.reduce((sum, value) => sum + (value - rightMean) ** 2, 0);
  return covariance / Math.sqrt(varianceLeft * varianceRight);
}

function summarize(rows) {
  const values = rows.map((row) => row.p95).filter(Number.isFinite);
  return {
    n: values.length,
    lag1: lag1(values),
    median: median(values),
    min: Math.min(...values),
    max: Math.max(...values),
    overCap: rows.filter((row) => row.rc !== 0).length,
  };
}

const result = {
  generatedAt: new Date().toISOString(),
  capMs: CAP_MS,
  default: { loadavgStart: loadavg(), startedAt: new Date().toISOString(), rows: [] },
  backgroundPairs: { loadavgStart: null, startedAt: null, rows: [] },
};

for (let index = 0; index < DEFAULT_RUNS; index += 1) {
  const row = runOnce();
  result.default.rows.push(row);
  console.log(
    `default ${String(index + 1).padStart(2)} ${row.startedAt} rc=${row.rc} ` +
      `p95=${row.p95 ?? 'PARSE-FAIL'}ms wall=${row.wallMs}ms`,
  );
}
result.default.endedAt = new Date().toISOString();
result.default.loadavgEnd = loadavg();
result.default.summary = summarize(result.default.rows);

result.backgroundPairs.loadavgStart = loadavg();
result.backgroundPairs.startedAt = new Date().toISOString();
for (let pair = 1; pair <= BACKGROUND_PAIRS; pair += 1) {
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const row = { pair, attempt, ...runOnce(true) };
    result.backgroundPairs.rows.push(row);
    console.log(
      `background pair=${pair} attempt=${attempt} ${row.startedAt} rc=${row.rc} ` +
        `p95=${row.p95 ?? 'PARSE-FAIL'}ms wall=${row.wallMs}ms`,
    );
  }
}
result.backgroundPairs.endedAt = new Date().toISOString();
result.backgroundPairs.loadavgEnd = loadavg();
result.backgroundPairs.bothFailed = Array.from({ length: BACKGROUND_PAIRS }, (_, index) =>
  result.backgroundPairs.rows
    .filter((row) => row.pair === index + 1)
    .every((row) => row.rc !== 0),
).filter(Boolean).length;

console.log('---');
console.log(JSON.stringify(result.default.summary));
console.log(
  `default loadavg start=${result.default.loadavgStart.join('/')} ` +
    `end=${result.default.loadavgEnd.join('/')}`,
);
console.log(`background both-failed=${result.backgroundPairs.bothFailed}/${BACKGROUND_PAIRS}`);
if (OUTPUT) {
  writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`wrote ${OUTPUT.pathname}`);
}
