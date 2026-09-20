// s1588 scratch: place lane/a's four slice paths into the detached gate worktree,
// so the battery runs on the MERGED tree (main + slice), never on the lane's stale base.
// Main was proved untouched on all four paths since merge-base ebc1cab1, so a checkout
// of lane/a's blobs IS the merge result.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const GATE = path.join(REPO, 'gate-s1588');

const PATHS = [
  'scripts/desk-carryforward-guard.mjs',
  'scripts/desk-carryforward-guard.test.mjs',
  'reviews/f1586-1-desk-count-refusal.md',
  'artifacts/s1586-desk-histogram/derive.mjs',
];

for (const p of PATHS) {
  const blob = execFileSync('git', ['-C', REPO, 'show', `lane/a:${p}`], { maxBuffer: 64 * 1024 * 1024 });
  const dest = path.join(GATE, p);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, blob);
  console.log(`placed ${p} (${blob.length} bytes)`);
}

// node_modules: reuse main's install rather than a fresh npm install in the gate tree.
const nm = path.join(GATE, 'node_modules');
if (!fs.existsSync(nm)) {
  fs.symlinkSync(path.join(REPO, 'node_modules'), nm, 'dir');
  console.log('symlinked node_modules -> main');
} else {
  console.log('node_modules already present');
}

// Confirm the placed tree matches lane/a byte-for-byte.
const status = execFileSync('git', ['-C', GATE, 'status', '--short'], { encoding: 'utf8' });
console.log('--- gate worktree status ---');
console.log(status || '(clean)');
