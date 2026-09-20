// s1507 — attribution, second pass. The first pass's verdict was VACUOUS: its title regex matched
// nothing, so "no new reds" compared two EMPTY lists and would have printed the same words no
// matter what the arms did. A negative result from a probe that never fired is evidence about the
// probe. This pass writes RAW output for both arms and parses playwright's end-of-run failure
// block, which is the stable surface.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');
const SCRATCH = join(ROOT, 'logs/session-scratch');

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const SPECS = [
  'e2e/072-era-activation.spec.ts',
  'e2e/landmark-collision.spec.ts',
  'e2e/town-dynamo-hall-blender.spec.ts',
];
const MERGED = '75903bf48';
const PREMERGE = 'a4556dca5';

const git = (...a) => {
  const r = spawnSync('git', a, { cwd: GATE, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

// playwright's line reporter ends with numbered failure entries:
//   1) [desktop-chrome] › e2e/foo.spec.ts:12:1 › some title ───────
const parseFailures = (out) =>
  [...out.matchAll(/^\s*\d+\)\s*(\[[^\]]+\][^\n]*?)(?:\s*─|$)/gm)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim());

function arm(label, rev, file) {
  git('checkout', '--quiet', rev);
  const head = git('rev-parse', '--short', 'HEAD');
  const r = spawnSync('npx', ['playwright', 'test', ...SPECS, '--workers=1', '--reporter=line'], {
    cwd: GATE, encoding: 'utf8', env, maxBuffer: 128 * 1024 * 1024,
  });
  const out = `${r.stdout}${r.stderr}`;
  writeFileSync(join(SCRATCH, file), out);
  const tally = (out.match(/\d+ (?:passed|failed|flaky|skipped)/g) || []).join(', ');
  const fails = parseFailures(out);
  console.log(`\n=== ${label} @ ${head} — rc=${r.status}  ${tally}`);
  if (!fails.length) console.log('    (parser found no failure entries — CHECK THE RAW FILE)');
  for (const f of fails) console.log(`    ✘ ${f}`);
  return { tally, fails };
}

const control = arm('CONTROL pre-merge', PREMERGE, 's1507-control-arm.txt');
const merged = arm('MERGED', MERGED, 's1507-merged-arm.txt');
git('checkout', '--quiet', MERGED);

console.log('\n---- ATTRIBUTION ----');
// Guard against a repeat of the vacuous verdict: if neither arm parsed a failure while the
// tallies say failures happened, say so instead of concluding anything.
const claimed = /\d+ failed/.test(control.tally) || /\d+ failed/.test(merged.tally);
if (claimed && control.fails.length === 0 && merged.fails.length === 0) {
  console.log('PARSER FAILED — tallies report failures but no entries parsed. No verdict.');
} else {
  const newly = merged.fails.filter((f) => !control.fails.includes(f));
  const fixed = control.fails.filter((f) => !merged.fails.includes(f));
  console.log(newly.length ? `NEW REDS FROM THE MERGE (${newly.length}):\n  ${newly.join('\n  ')}`
                           : 'no new reds attributable to the merge');
  if (fixed.length) console.log(`reds the merge FIXED (${fixed.length}):\n  ${fixed.join('\n  ')}`);
}
