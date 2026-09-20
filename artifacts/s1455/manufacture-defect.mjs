// s1455 — PROVE THE GUARD BY MANUFACTURING THE DEFECT (the s1299/s1300 standard).
// A passing guard never executes its violation path, so its green is not evidence about its red.
// This builds a full-size copy of the reviews corpus in /tmp (NOT in main's working tree, §3.0b),
// strips the supersede banner from ONE review, and runs the guard against it.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const TMP = '/tmp/s1455-manufactured-reviews';
const target = process.argv[2] || 'gg-03-gazette-panel-swap.md';

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

let stripped = false;
const files = readdirSync('reviews').filter((f) => f.endsWith('.md'));
for (const f of files) {
  let text = readFileSync('reviews/' + f, 'utf8');
  if (f === target) {
    const before = text;
    // remove the blockquote banner lines directly under the VERDICT line
    text = text.replace(/\n(> .*\n)+/, '\n');
    stripped = before !== text;
  }
  writeFileSync(TMP + '/' + f, text);
}

console.log('corpus copied:', files.length, 'files -> ' + TMP);
console.log('banner stripped from ' + target + ':', stripped);
if (!stripped) { console.error('FAILED to strip — probe is invalid'); process.exit(2); }

const r = spawnSync('node', ['--test', 'scripts/stale-hold-verdict-guard.test.mjs'], {
  env: { ...process.env, GR_HOLD_GUARD_REVIEWS: TMP },
  encoding: 'utf8',
});
const out = (r.stdout || '') + (r.stderr || '');
console.log('---- guard rc =', r.status, '----');
for (const line of out.split('\n')) {
  if (/^.?[✔✖]|^ℹ (tests|pass|fail)|verdict "|Offenders|Mistake #8/.test(line)) console.log(line);
}
rmSync(TMP, { recursive: true, force: true });
console.log('---- manufactured corpus removed ----');
process.exit(r.status === 0 ? 1 : 0); // we EXPECT a red; rc 0 here would mean the guard is blind
