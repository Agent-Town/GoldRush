// s1507 — the 3-vs-4 delta rests on ONE test seen once. Re-run the same commit before believing
// a number: two answers from one commit means noise, not signal. N=3 per arm, same worktree,
// same composition (this spec alone), --workers=1.
//
// It matters which way this lands: the cure RESTORES pre-culprit epoch selection for ordinary
// boots, so any spec calibrated while contract-derived epochs were live could legitimately move.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const SPEC = 'e2e/town-dynamo-hall-blender.spec.ts';
const MERGED = '75903bf48';
const PREMERGE = 'a4556dca5';
const N = 3;

const git = (...a) => {
  const r = spawnSync('git', a, { cwd: GATE, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function runOnce() {
  const r = spawnSync('npx', ['playwright', 'test', SPEC, '--workers=1', '--reporter=line'], {
    cwd: GATE, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024,
  });
  const out = `${r.stdout}${r.stderr}`;
  const tally = (out.match(/\d+ (?:passed|failed|flaky|skipped)/g) || []).join(', ');
  // capture the actual numbers so a threshold flake is visible as a distribution, not a verdict
  const nums = [...out.matchAll(/Expected: <= ([\d.]+)[\s\S]{0,80}?Received:\s+([\d.]+)/g)]
    .map((m) => `${m[2]} vs <=${m[1]}`);
  return { rc: r.status, tally, nums };
}

for (const [label, rev] of [['CONTROL pre-merge', PREMERGE], ['MERGED', MERGED]]) {
  git('checkout', '--quiet', rev);
  console.log(`\n=== ${label} @ ${git('rev-parse', '--short', 'HEAD')} — ${N} runs`);
  for (let i = 1; i <= N; i++) {
    const r = runOnce();
    console.log(`  run ${i}: rc=${r.rc}  ${r.tally}${r.nums.length ? '   ' + r.nums.join(' | ') : ''}`);
  }
}
git('checkout', '--quiet', MERGED);
console.log(`\nrestored to ${git('rev-parse', '--short', 'HEAD')}`);
