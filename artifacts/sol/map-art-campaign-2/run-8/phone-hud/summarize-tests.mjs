import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const out = 'artifacts/sol/map-art-campaign-2/run-8/phone-hud';
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
const names = ['e2e-hud', 'e2e-campaign', 'e2e-additional', 'e2e-mp-hud', 'e2e-baseline', 'e2e-recheck', 'e2e-baseline-recheck', 'e2e-release', 'e2e-release-control'];
const suites = [];
for (const name of names) if (existsSync(`${out}/${name}.json`)) {
  const report = JSON.parse(readFileSync(`${out}/${name}.json`, 'utf8'));
  const rows = cases(report);
  suites.push({ name, stats: report.stats, cases: rows });
  console.log(name, JSON.stringify(report.stats));
}
writeFileSync(`${out}/test-summary.json`, JSON.stringify(suites, null, 2) + '\n');
const live = suites.filter(s => ['e2e-hud', 'e2e-campaign', 'e2e-additional', 'e2e-mp-hud'].includes(s.name));
const failures = live.flatMap(s => s.cases.filter(c => c.status === 'unexpected').map(c => ({ suite: s.name, ...c })));
const locations = [...new Set(failures.map(c => `e2e/${c.file.replace(/^e2e\//, '')}:${c.line}`))];
writeFileSync(`${out}/failed-locations.json`, JSON.stringify(locations, null, 2) + '\n');
const controls = suites.filter(s => ['e2e-baseline', 'e2e-baseline-recheck'].includes(s.name)).flatMap(s => s.cases);
const rechecks = suites.find(s => s.name === 'e2e-recheck')?.cases ?? [];
writeFileSync(`${out}/failure-attribution.json`, JSON.stringify(failures.map(f => {
  const matches = c => c.file === f.file && c.line === f.line && c.project === f.project;
  const control = controls.filter(matches);
  const recheck = rechecks.find(matches);
  const reproduced = control.some(c => c.status === 'unexpected');
  const fixed = ['locked-win.spec.ts', 'm4-06-embodiment.spec.ts'].includes(f.file) && recheck?.actual === 'passed';
  const classification = fixed ? 'HUD regression corrected; original assertion passes on final CSS'
    : reproduced ? 'fails with pre-cure CSS too; retained as baseline hold'
    : recheck?.actual === 'passed' ? 'passes on final CSS; initial failure not reproduced'
    : 'unresolved: final CSS fails and original-CSS controls pass or skip';
  return { ...f, controls: control, recheck: recheck ?? null, classification };
}), null, 2) + '\n');
