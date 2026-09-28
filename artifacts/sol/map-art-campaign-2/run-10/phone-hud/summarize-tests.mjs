import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const out = 'artifacts/sol/map-art-campaign-2/run-10/phone-hud';
export function cases(report) {
  const rows = [];
  function walk(suite) {
    for (const spec of suite.specs ?? []) for (const test of spec.tests) {
      const result = test.results.at(-1);
      rows.push({ file: spec.file, line: spec.line, title: spec.title, project: test.projectName,
        status: test.status, actual: result?.status, expected: test.expectedStatus,
        startTime: result?.startTime, durationMs: result?.duration,
        error: (result?.errors ?? []).map(e => (e.message ?? '').replace(/\x1b\[[0-9;]*m/g, '')).join('\n') });
    }
    for (const child of suite.suites ?? []) walk(child);
  }
  for (const suite of report.suites) walk(suite);
  return rows;
}
const names = ['e2e-hud', 'e2e-campaign', 'e2e-release', 'e2e-baseline', 'e2e-recheck', 'e2e-release-control', 'e2e-release-recheck'];
const suites = [];
for (const name of names) if (existsSync(`${out}/${name}.json`)) {
  const report = JSON.parse(readFileSync(`${out}/${name}.json`, 'utf8'));
  suites.push({ name, stats: report.stats, cases: cases(report) });
  console.log(name, JSON.stringify(report.stats));
}
writeFileSync(`${out}/test-summary.json`, JSON.stringify(suites, null, 2) + '\n');
const failures = suites.filter(s => ['e2e-hud', 'e2e-campaign'].includes(s.name)).flatMap(s => s.cases.filter(c => c.status === 'unexpected').map(c => ({ suite: s.name, ...c })));
writeFileSync(`${out}/failed-locations.json`, JSON.stringify([...new Set(failures.map(c => `e2e/${c.file.replace(/^e2e\//, '')}:${c.line}`))], null, 2) + '\n');
