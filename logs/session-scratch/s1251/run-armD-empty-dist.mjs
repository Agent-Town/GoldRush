// s1251 — ARM D. F-1126-1's standing remedy is "wire the guards into CI/the gate".
// The likely wiring is a bare `node scripts/assert-release-build.mjs` in a battery.
// Question: what does the guard report when dist/ is absent (no release build ran first)?
// Run it from a scratch cwd that has no dist/ — nothing in the repo is touched.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const guard = resolve('scripts/assert-release-build.mjs');
const scratch = mkdtempSync(join(tmpdir(), 's1251-nodist-'));
const r = spawnSync(process.execPath, [guard], {
  cwd: scratch, encoding: 'utf8', env: { ...process.env, GR_RELEASE: 'e1' },
});
const report =
  `guard   = ${guard}\nscratch cwd (no dist/) = ${scratch}\n` +
  `RC=${r.status}\n--- STDOUT ---\n${r.stdout ?? ''}\n--- STDERR ---\n${r.stderr ?? ''}\n`;
writeFileSync(process.argv[2], report);
console.log(report);
