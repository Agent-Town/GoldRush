#!/usr/bin/env node
/**
 * F-1152-1 confirmBuild branch probe.
 *
 * Runs the retained trajectory spec unchanged except for a temporary helper that
 * reports confirmBuildDiagnostics() in the same page evaluation as a false result.
 *
 * Usage: node scripts/probe-s1152b-confirmbuild-cause.mjs [invocations]
 * One invocation runs three fresh-page scenarios; the default seven gives 21.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const SOURCE = 'e2e/f1148-1-trajectory-probe.spec.ts';
const TEMP = 'e2e/tmp-s1152b-confirmbuild.spec.ts';
const ARTIFACT_DIR = process.env.GR_CONFIRM_PROBE_ARTIFACT_DIR ?? 'artifacts/f1152-1-confirmbuild';
const INVOCATIONS = Number(process.argv[2] ?? 7);
const SOURCE_ARTIFACT_DIR = `const artifactDir = path.resolve('artifacts/f1148-1-trajectory');`;

const ORIGINAL_HELPER = `async function placeBuildableAt(page: Page, id: 'stockpile' | 'palisade', x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}`;

const DIAGNOSTIC_HELPER = `async function placeBuildableAt(page: Page, id: 'stockpile' | 'palisade', x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  const attempt = await page.evaluate(() => {
    const api = window.__GR_TEST__;
    if (!api) throw new Error('__GR_TEST__ unavailable');
    const ok = api.confirmBuild();
    return { ok, diagnostics: api.confirmBuildDiagnostics() };
  });
  if (!attempt.ok) throw new Error(\`F1152_CONFIRM \${JSON.stringify({ id, x, z, ...attempt.diagnostics })}\`);
}`;

function build() {
  const source = readFileSync(SOURCE, 'utf8');
  if (!source.includes(ORIGINAL_HELPER)) throw new Error('placeBuildableAt helper changed shape — update this probe');
  if (!source.includes(SOURCE_ARTIFACT_DIR)) throw new Error('artifact directory changed shape — update this probe');
  writeFileSync(
    TEMP,
    source
      .replace(ORIGINAL_HELPER, DIAGNOSTIC_HELPER)
      .replace(SOURCE_ARTIFACT_DIR, `const artifactDir = path.resolve('${ARTIFACT_DIR}');`),
  );
  mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function cleanup() {
  if (existsSync(TEMP)) unlinkSync(TEMP);
}

function parseFailure(message) {
  const marker = 'F1152_CONFIRM ';
  const start = message.indexOf(marker);
  if (start < 0) return null;
  return JSON.parse(message.slice(start + marker.length).split('\n', 1)[0]);
}

function invoke(invocation) {
  let raw;
  try {
    raw = execFileSync(
      'npx',
      ['playwright', 'test', TEMP, '--project=desktop-chrome', '--workers=1', '--reporter=json'],
      {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, GR_F1148_PROBE: '1', GR_F1148_ARM: `s1152b-${invocation}` },
      },
    );
  } catch (error) {
    raw = error.stdout ?? '';
  }
  const start = raw.indexOf('{');
  if (start < 0) return [{ invocation, status: 'unparsed', error: 'no Playwright JSON' }];
  const report = JSON.parse(raw.slice(start));
  const rows = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const result = test.results?.[test.results.length - 1] ?? {};
        const message = (result.error?.message ?? '').replace(/\x1b\[[0-9;]*m/g, '');
        rows.push({
          invocation,
          title: spec.title,
          status: result.status ?? test.status ?? 'unknown',
          failure: parseFailure(message),
          line: result.error?.location?.line ?? null,
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites ?? []) walk(suite);
  return rows;
}

build();
const rows = [];
try {
  for (let invocation = 1; invocation <= INVOCATIONS; invocation += 1) {
    const measured = invoke(invocation);
    rows.push(...measured);
    writeFileSync(`${ARTIFACT_DIR}/invocation-${String(invocation).padStart(2, '0')}.json`, `${JSON.stringify(measured, null, 2)}\n`);
    for (const row of measured) {
      console.log(
        `${row.title}: ${row.status}` +
          (row.failure ? ` — x=${row.failure.x} reason=${row.failure.reason} state=${JSON.stringify(row.failure)}` : ''),
      );
    }
  }
} finally {
  cleanup();
}

const scenarioCount = rows.filter(({ status }) => status !== 'unparsed').length;
const placementFailures = rows.filter(({ failure }) => failure);
const totalPlacementAttempts = rows.reduce((total, row) => {
  if (row.status === 'unparsed') return total;
  if (!row.failure) return total + 6;
  if (row.failure.id === 'stockpile') return total + 6;
  return total + [-2, -1, 0, 1, 2].indexOf(row.failure.x) + 1;
}, 0);
const palisadeX = Object.fromEntries(
  [-2, -1, 0, 1, 2].map((x) => [x, placementFailures.filter(({ failure }) => failure.id === 'palisade' && failure.x === x).length]),
);
const summary = {
  invocations: INVOCATIONS,
  scenarios: scenarioCount,
  placementAttempts: totalPlacementAttempts,
  passedScenarios: rows.filter(({ status }) => status === 'passed').length,
  placementFailures: placementFailures.length,
  placementFailureRate: scenarioCount ? placementFailures.length / scenarioCount : null,
  palisadeX,
  failures: placementFailures.map(({ invocation, title, failure }) => ({ invocation, title, ...failure })),
};
writeFileSync(`${ARTIFACT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);

console.log(`\nSUMMARY ${JSON.stringify(summary)}`);
if (placementFailures.length === 0) {
  console.log('VERDICT: INCONCLUSIVE — zero placement failures. Raise the invocation count before concluding anything.');
}
