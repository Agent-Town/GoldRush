// s1252 — the F-1251-2 question, aimed at citation-title-guard:
// what does it say when its subject is EMPTY?
//
// Three arms, each running the REAL script against a fixture root:
//   A. tasks/ exists but holds no tracked .md   -> denominator 0 docs
//   B. tasks/ holds docs but none carry citations -> denominator 0 citations
//   C. tasks/ absent entirely                    -> `git ls-files tasks` returns nothing
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = process.cwd();
const GUARD = path.join(REPO, 'scripts', 'citation-title-guard.mjs');

function arm(name, build) {
  const fx = fs.mkdtempSync(path.join(os.tmpdir(), 's1252-vac-'));
  fs.mkdirSync(path.join(fx, 'e2e'), { recursive: true });
  for (const f of fs.readdirSync(path.join(REPO, 'e2e'))) {
    const src = path.join(REPO, 'e2e', f);
    if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(fx, 'e2e', f));
  }
  execFileSync('git', ['init', '-q'], { cwd: fx });
  build(fx);
  try { execFileSync('git', ['add', '-A'], { cwd: fx }); } catch {}
  const r = spawnSync('node', [GUARD, '--root', fx], { encoding: 'utf8' });
  console.log(`\n===== ARM ${name} =====`);
  console.log(r.stdout.trim() || '(no stdout)');
  if (r.stderr.trim()) console.log('STDERR: ' + r.stderr.trim());
  console.log(`rc=${r.status}`);
}

arm('A — tasks/ exists, no tracked .md', (fx) => {
  fs.mkdirSync(path.join(fx, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(fx, 'tasks', 'keep.txt'), 'not markdown\n');
});

arm('B — tasks/ has docs, zero citations', (fx) => {
  fs.mkdirSync(path.join(fx, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(fx, 'tasks', 'a.md'), '# a master with no citations at all\n');
});

arm('C — no tasks/ dir at all', () => {});
