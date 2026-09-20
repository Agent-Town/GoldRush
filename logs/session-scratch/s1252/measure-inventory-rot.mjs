// s1252 — run the REAL citation-title-guard over logs/suite-red-inventory.md.
//
// The guard's denominator is `git ls-files tasks`. To point the real instrument at the
// inventory without editing it, build a throwaway fixture root outside the repo:
//   <fx>/.git          (git init, so `git ls-files tasks` answers)
//   <fx>/e2e/*.spec.ts (the REAL specs, so titles resolve AS THEY STAND TODAY)
//   <fx>/tasks/<f>.md  (the file under test, copied verbatim)
// then `node scripts/citation-title-guard.mjs --root <fx> --report`.
//
// "Run their instrument, not your model of it."
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = process.cwd();
const SUBJECTS = process.argv.slice(2);
if (!SUBJECTS.length) throw new Error('usage: node measure-inventory-rot.mjs <tracked .md> [...]');

const fx = fs.mkdtempSync(path.join(os.tmpdir(), 's1252-cite-'));
fs.mkdirSync(path.join(fx, 'tasks'), { recursive: true });
fs.mkdirSync(path.join(fx, 'e2e'), { recursive: true });

// real specs, verbatim
for (const f of fs.readdirSync(path.join(REPO, 'e2e'))) {
  const src = path.join(REPO, 'e2e', f);
  if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(fx, 'e2e', f));
}
for (const s of SUBJECTS) {
  fs.copyFileSync(path.join(REPO, s), path.join(fx, 'tasks', path.basename(s)));
}

execFileSync('git', ['init', '-q'], { cwd: fx });
execFileSync('git', ['add', 'tasks'], { cwd: fx });

const r = spawnSync(
  'node',
  [path.join(REPO, 'scripts', 'citation-title-guard.mjs'), '--root', fx, '--report'],
  { encoding: 'utf8' },
);
console.log(`--- subjects: ${SUBJECTS.join(', ')}`);
console.log(`--- fixture: ${fx}`);
console.log(r.stdout.trim());
if (r.stderr.trim()) console.log('STDERR: ' + r.stderr.trim());
console.log(`--- rc=${r.status}`);
