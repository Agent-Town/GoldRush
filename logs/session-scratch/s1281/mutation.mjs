// s1281 — mutation-test the new agent-rung-conformance guard before trusting it.
// The master required the guard to RED before it is believed. Runs in a detached
// temp tree so the repo working copy is never mutated.
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const ROOT = '/tmp/s1281-mut';
const repo = process.cwd();

function build() {
  rmSync(ROOT, { recursive: true, force: true });
  mkdirSync(`${ROOT}/scripts`, { recursive: true });
  mkdirSync(`${ROOT}/src/agent`, { recursive: true });
  copyFileSync(`${repo}/scripts/agent-rung-conformance.test.mjs`, `${ROOT}/scripts/agent-rung-conformance.test.mjs`);
  copyFileSync(`${repo}/src/agent/AgentConsent.ts`, `${ROOT}/src/agent/AgentConsent.ts`);
  copyFileSync(`${repo}/src/agent/ToolSurface.ts`, `${ROOT}/src/agent/ToolSurface.ts`);
}

function run() {
  const r = spawnSync('node', ['--test', `${ROOT}/scripts/agent-rung-conformance.test.mjs`], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  return { rc: r.status, pass: /^# pass (\d+)/m.exec(out)?.[1], fail: /^# fail (\d+)/m.exec(out)?.[1] };
}

const arms = [
  ['CONTROL — unmutated tree', () => {}],
  ['MUT-A — AgentConsent auto_pan back to 3', () => {
    const f = `${ROOT}/src/agent/AgentConsent.ts`;
    writeFileSync(f, readFileSync(f, 'utf8').replace("{ id: 'auto_pan', level: 2,", "{ id: 'auto_pan', level: 3,"));
  }],
  ['MUT-B — ToolSurface auto_pan back to 3', () => {
    const f = `${ROOT}/src/agent/ToolSurface.ts`;
    const s = readFileSync(f, 'utf8');
    const i = s.indexOf("id: 'auto_pan',");
    writeFileSync(f, s.slice(0, i) + s.slice(i).replace('level: 2,', 'level: 3,'));
  }],
  ['MUT-C — auto_repair moved to 2 (the open F-1279-2 question)', () => {
    const f = `${ROOT}/src/agent/AgentConsent.ts`;
    writeFileSync(f, readFileSync(f, 'utf8').replace("{ id: 'auto_repair', level: 1,", "{ id: 'auto_repair', level: 2,"));
  }],
  ['MUT-D — auto_pan entry deleted entirely (regex-miss / NaN check)', () => {
    const f = `${ROOT}/src/agent/AgentConsent.ts`;
    writeFileSync(f, readFileSync(f, 'utf8').replace(/^\s*\{ id: 'auto_pan'.*$\n/m, ''));
  }],
];

for (const [name, mutate] of arms) {
  build();
  mutate();
  const { rc, pass, fail } = run();
  const expect = name.startsWith('CONTROL') ? 0 : 1;
  const verdict = rc === expect ? 'AS EXPECTED' : '*** UNEXPECTED ***';
  console.log(`${name}\n    rc=${rc} pass=${pass} fail=${fail}  (expected rc=${expect})  ${verdict}`);
}
rmSync(ROOT, { recursive: true, force: true });
