// s1252 POSITIVE CONTROL for the fixture harness.
//
// If the harness in measure-inventory-rot.mjs is a faithful way to point the real
// guard at arbitrary text, then mirroring the WHOLE real tasks/ tree into a fixture
// root must reproduce the real guard's own numbers exactly (305 / 281 NUMBER-ONLY /
// 24 CARRIES-TITLE at this commit). If it does not, every number the harness
// produced about the inventory is suspect.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = process.cwd();
const fx = fs.mkdtempSync(path.join(os.tmpdir(), 's1252-ctrl-'));

const tasks = execFileSync('git', ['ls-files', 'tasks'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  .trim().split('\n').filter((f) => f.endsWith('.md'));
for (const f of tasks) {
  const dst = path.join(fx, f);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(REPO, f), dst);
}
fs.mkdirSync(path.join(fx, 'e2e'), { recursive: true });
for (const f of fs.readdirSync(path.join(REPO, 'e2e'))) {
  const src = path.join(REPO, 'e2e', f);
  if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(fx, 'e2e', f));
}

execFileSync('git', ['init', '-q'], { cwd: fx });
execFileSync('git', ['add', 'tasks'], { cwd: fx });

const r = spawnSync(
  'node',
  [path.join(REPO, 'scripts', 'citation-title-guard.mjs'), '--root', fx, '--report'],
  { encoding: 'utf8' },
);
console.log(`mirrored ${tasks.length} tracked tasks/*.md into ${fx}`);
console.log(r.stdout.trim());
console.log(`rc=${r.status}`);
console.log('\nEXPECT (real guard, same commit): citations 305 / NUMBER-ONLY 281 / CARRIES-TITLE 24');
