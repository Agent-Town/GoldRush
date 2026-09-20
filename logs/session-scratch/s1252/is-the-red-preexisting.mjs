// s1252 — my fixed guard exits 1 on the real tree. Is that MY red or a pre-existing one?
// Run the UNMODIFIED HEAD version against the same tree, pointed by --root.
// (Never conclude "my change caused it" or "it didn't" from reading a diff.)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = process.cwd();
const orig = execFileSync('git', ['show', 'HEAD:scripts/citation-title-guard.mjs'], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
});
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1252-head-'));
const p = path.join(dir, 'head-citation-title-guard.mjs');
fs.writeFileSync(p, orig);

for (const args of [[], ['--report']]) {
  const r = spawnSync('node', [p, '--root', REPO, ...args], { encoding: 'utf8' });
  console.log(`\n===== HEAD version, args=${JSON.stringify(args)} =====`);
  console.log(r.stdout.trim());
  if (r.stderr.trim()) console.log('STDERR: ' + r.stderr.trim());
  console.log(`rc=${r.status}`);
}
