// s1460 — bisect predicate for the Baron driver event-log divergence (F-1460-1).
//
// Subject: scripts/gr-sim.test.mjs "the Baron driver runs the declared fight..."
// The pinned expectation (kills 869 / fnv1a32:b9566c6d) was set at 1a4831df, BEFORE the
// bisect window, so the predicate is stable across every commit under test.
//
// ⚠️ THIS REPLACES A SHELL PROBE THAT WAS SILENTLY BROKEN, AND THE BUG IS THE LESSON.
// The first version tested `grep -E '^. pass 1'` against node:test output, which prints
// `ℹ pass 1`. `ℹ` is THREE BYTES in UTF-8, and under the fire shell's locale grep's `.`
// matches one BYTE — so the pattern never matched, EVERY commit reported BAD, and bisect
// "converged" on a7bc23c5: a commit touching only artifacts/ + tasks/ + goals.json, whose
// sole parent is the known-GREEN 7267f78e and whose src/ diff is EMPTY. An impossible
// answer is what exposed the broken instrument. Re-tested directly, a7bc23c5 passes 2/2.
// JS regexes operate on UTF-16 code units, so `.` matches `ℹ` — this probe uses the same
// instrument as the manual runs that were validated against known-green/known-red commits.
//
// exit 0   = good (assertion holds)
// exit 1   = bad  (assertion diverges)
// exit 125 = skip (tree could not be evaluated — not a verdict)

import { execFileSync } from 'node:child_process';

let out = '';
try {
  out = execFileSync(process.execPath,
    ['--test', '--test-name-pattern', 'Baron driver', 'scripts/gr-sim.test.mjs'],
    { encoding: 'utf8', timeout: 200_000, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) {
  out = (e.stdout || '') + '\n' + (e.stderr || '');
}

const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();

// An infrastructure failure is NOT a verdict — skip rather than blame the commit.
if (!/Baron driver runs the declared fight/.test(out)) {
  console.log(`SKIP ${head}: probe never reached the Baron test`);
  process.exit(125);
}

const passed = /^\D pass 1$/m.test(out) && /^\D fail 0$/m.test(out);
const kills = (out.match(/kills: \d+/g) || []).slice(0, 2).join(' vs ');
console.log(`${passed ? 'GOOD' : 'BAD '} ${head} ${kills}`);
process.exit(passed ? 0 : 1);
