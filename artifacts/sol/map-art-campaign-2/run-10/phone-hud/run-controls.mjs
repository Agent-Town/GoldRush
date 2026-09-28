// Attribute existing browser failures without editing source or assertions.
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { cases } from './summarize-tests.mjs';
const out = 'artifacts/sol/map-art-campaign-2/run-10/phone-hud';
const projects = ['desktop-chrome', 'mobile-chrome'];
const failures = ['e2e-hud', 'e2e-campaign'].flatMap(name => cases(JSON.parse(readFileSync(`${out}/${name}.json`))).filter(c => c.status === 'unexpected'));
const key = c => `${c.project}|${c.file}|${c.line}`;
const initial = [...new Map(failures.map(c => [key(c), c])).values()];
function signature(c) {
  return c?.error.match(/^\s*>\s*\d+\s*\|.*$/gm)?.map(s => s.trim()).join('\n') ?? c?.error.split('\n').filter(s => /at .*e2e\//.test(s)).join('\n');
}
const exits = [];
async function execute(name, args, extraEnv = {}) {
  const log = createWriteStream(`${out}/${name}.log`);
  const child = spawn('npx', args, { env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5312', PLAYWRIGHT_JSON_OUTPUT_FILE: `${out}/${name}.json`, ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  log.end(); exits.push({ name, args, exitCode });
  writeFileSync(`${out}/control-exits.json`, JSON.stringify(exits, null, 2) + '\n');
  console.log(name, exitCode);
}
async function server(arm) {
  const log = createWriteStream(`${out}/vite-${arm}.log`);
  const child = spawn('node', ['node_modules/vite/bin/vite.js', '--config', `${out}/vite-control.config.ts`], { env: { ...process.env, HUD_CONTROL_ARM: arm }, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(log, { end: false }); child.stderr.pipe(log, { end: false });
  let ready = false;
  let servedCssHash;
  const expectedCss = arm === 'before' ? execFileSync('git', ['show', '0aaa67564:src/ui/theme.css']) : readFileSync('src/ui/theme.css');
  const hash = value => createHash('sha256').update(value).digest('hex');
  for (let i = 0; i < 200; i++) {
    if (child.exitCode !== null) throw new Error(`Vite ${arm} exited ${child.exitCode}`);
    try { const response = await fetch('http://127.0.0.1:5312/src/ui/theme.css'); if (response.ok) { const css = await response.text(); if (css.includes('Run-10 entry census') !== (arm === 'after')) throw new Error(`CSS arm mismatch: ${arm}`); const servedCss = JSON.parse(css.match(/^const __vite__css = (.*)$/m)?.[1] ?? 'null'); servedCssHash = hash(servedCss ?? ''); if (servedCssHash !== hash(expectedCss)) throw new Error(`CSS hash mismatch: ${arm}`); ready = true; break; } } catch (error) { if (String(error).includes('mismatch')) throw error; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) { child.kill('SIGTERM'); throw new Error(`Vite ${arm} was not ready`); }
  writeFileSync(`${out}/vite-${arm}-receipt.json`, JSON.stringify({ arm, readyAt: new Date().toISOString(), pid: child.pid, preCureCssCommit: '0aaa67564', includesRun10Css: arm === 'after', servedCssHash, expectedCssHash: hash(expectedCss), storeHead: execFileSync('git', ['-C', 'assets/pilots', 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), port: 5312 }, null, 2) + '\n');
  return async () => { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); log.end(); };
}
async function phase(name, selected) {
  const reports = [];
  for (const project of projects) {
    const subset = selected.filter(c => c.project === project);
    if (!subset.length) continue;
    const locations = [...new Set(subset.map(c => `e2e/${c.file.replace(/^e2e\//, '')}:${c.line}`))];
    const subname = `${name}-${project}`;
    await execute(subname, ['playwright', 'test', ...locations, `--project=${project}`, '--workers=1', '--reporter=line,json', `--output=${out}/failures/${subname}`]);
    reports.push(JSON.parse(readFileSync(`${out}/${subname}.json`)));
  }
  const aggregate = { suites: reports.flatMap(r => r.suites), stats: { expected: 0, skipped: 0, unexpected: 0, flaky: 0, duration: 0 } };
  for (const report of reports) for (const field of Object.keys(aggregate.stats)) aggregate.stats[field] += report.stats[field];
  writeFileSync(`${out}/${name}.json`, JSON.stringify(aggregate, null, 2) + '\n');
  return cases(aggregate);
}
let stop = await server('before');
let baseline;
try { baseline = await phase('e2e-baseline', initial); } finally { await stop(); }
const unresolved = initial.filter(c => !baseline.some(b => key(b) === key(c) && b.status === 'unexpected' && signature(b) && signature(b) === signature(c)));
writeFileSync(`${out}/candidate-recheck-selection.json`, JSON.stringify(unresolved, null, 2) + '\n');
let rechecks = [];
if (unresolved.length) {
  stop = await server('after');
  try { rechecks = await phase('e2e-recheck', unresolved); } finally { await stop(); }
}
const attribution = initial.map(c => {
  const control = baseline.find(b => key(b) === key(c));
  const recheck = rechecks.find(b => key(b) === key(c));
  const same = control?.status === 'unexpected' && signature(c) && signature(c) === signature(control);
  return { ...c, control, recheck, classification: same ? 'same assertion fails with pre-cure CSS' : recheck?.status === 'expected' ? 'candidate rerun passes; original failure not persistent' : 'unresolved browser hold; inspect saved assertions' };
});
writeFileSync(`${out}/failure-attribution.json`, JSON.stringify(attribution, null, 2) + '\n');
console.log('attribution', attribution.reduce((counts, c) => ({ ...counts, [c.classification]: (counts[c.classification] ?? 0) + 1 }), {}));
