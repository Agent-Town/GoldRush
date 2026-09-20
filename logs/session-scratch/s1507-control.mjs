// s1507 — ATTRIBUTION. Three specs came back red that the inventory records as CLEAN (= ran and
// passed), so they are regression candidates and must not be waved through on a KNOWN-RED nearby.
// The question is narrow: are they red because of THIS merge, or already red on main?
//
// Both arms run in the SAME worktree, same node_modules, same shell, same --workers=1, and the
// same 3-spec composition — a control that differs in composition is a different experiment
// (a 25-spec run shares one dev server and a different ordering/load profile).
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const SPECS = [
  'e2e/072-era-activation.spec.ts',
  'e2e/landmark-collision.spec.ts',
  'e2e/town-dynamo-hall-blender.spec.ts',
];

const MERGED = '75903bf48';   // gate-s1507: merge lane/a for gating
const PREMERGE = 'a4556dca5'; // main at the time of the merge — the merge's first parent

const git = (...args) => {
  const r = spawnSync('git', args, { cwd: GATE, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
};

function arm(label, rev) {
  git('checkout', '--quiet', rev);
  const head = git('rev-parse', '--short', 'HEAD');
  const t0 = Date.now();
  const r = spawnSync('npx', ['playwright', 'test', ...SPECS, '--workers=1', '--reporter=line'], {
    cwd: GATE, encoding: 'utf8', env, maxBuffer: 128 * 1024 * 1024,
  });
  const out = `${r.stdout}${r.stderr}`;
  const tally = (out.match(/\d+ (?:passed|failed|flaky|skipped)/g) || []).join(', ');
  const titles = [...out.matchAll(/✘.*?›\s*(.+?)(?:\s*\(\d|\s*$)/gm)].map((m) => m[1].trim());
  console.log(`\n=== ${label} @ ${head} — rc=${r.status} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  console.log(`    ${tally}`);
  for (const t of titles) console.log(`    ✘ ${t}`);
  return { head, rc: r.status, tally, titles };
}

// Control FIRST, so a dirty-cache advantage (if any) accrues to the arm that would HIDE a
// regression, not to the one that would manufacture one.
const control = arm('CONTROL  pre-merge main', PREMERGE);
const merged = arm('MERGED   lane/a merged', MERGED);

git('checkout', '--quiet', MERGED);
console.log(`\nrestored to ${git('rev-parse', '--short', 'HEAD')}`);

console.log('\n---- ATTRIBUTION ----');
console.log(`control: ${control.tally}`);
console.log(`merged : ${merged.tally}`);
const newlyRed = merged.titles.filter((t) => !control.titles.includes(t));
const fixed = control.titles.filter((t) => !merged.titles.includes(t));
console.log(newlyRed.length ? `NEW REDS CAUSED BY THE MERGE:\n  ${newlyRed.join('\n  ')}`
                            : 'no new reds attributable to the merge');
if (fixed.length) console.log(`reds the merge FIXED:\n  ${fixed.join('\n  ')}`);
