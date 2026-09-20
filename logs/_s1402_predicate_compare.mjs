// s1402 / F-1402-1: compare candidate main-slot gate predicates against ground truth.
//
// The runner (scripts/lane-runner-v3.sh:48) asks: head -2 STATUS.md | grep -q "ACTIVE 2".
// A match means "a fire holds main" -> skip the main slot.
//
// GROUND TRUTH is taken from line-1 alone, which is the only line the lock protocol (§1.2 / §4)
// gives meaning to: a lock line means HELD, a "lock CLEARED" handoff line means FREE.
// Archive bullets on lines 2+ are history and must never influence the verdict.
//
// Two error classes, and they are NOT symmetric:
//   FALSE-BLOCK   -> main starved while nothing holds it (the live defect; costs throughput)
//   FALSE-RELEASE -> runner dispatches into main while a fire owns the tree (costs correctness:
//                    two writers on main at once, the thing §6/Mistake #12 exists to prevent)
// A cure that trades the first for the second is a regression, not a fix.
import { execFileSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const git = (a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 2e8 });

const commits = git(['log', '--format=%H%x09%cI%x09%s', '--', 'STATUS.md'])
  .trim().split('\n').slice(0, 120);

const predicates = {
  'runner NOW  head2 /ACTIVE 2/': (l1, l2) => /ACTIVE 2/.test(l1 + '\n' + l2),
  'cand A      head1 /ACTIVE 2/': (l1) => /ACTIVE 2/.test(l1),
  'cand B  head1 ACTIVE & !CLEARED': (l1) => /ACTIVE/.test(l1) && !/lock CLEARED/.test(l1),
  'cand C      head1 /^ACTIVE /': (l1) => /^ACTIVE /.test(l1),
};

const tally = {};
for (const k of Object.keys(predicates)) tally[k] = { falseBlock: [], falseRelease: [] };
let held = 0, free = 0, skipped = 0;

for (const row of commits) {
  const [sha, when, subj] = row.split('\t');
  let txt;
  try { txt = git(['show', sha + ':STATUS.md']); } catch { continue; }
  const rows = txt.split('\n');
  const l1 = rows[0] ?? '', l2 = rows[1] ?? '';

  // Ground truth from line-1 only.
  let truth;
  if (/lock CLEARED/.test(l1)) truth = 'free';
  else if (/ACTIVE/.test(l1)) truth = 'held';
  else { skipped++; continue; }
  truth === 'held' ? held++ : free++;

  for (const [name, fn] of Object.entries(predicates)) {
    const blocks = fn(l1, l2);
    if (blocks && truth === 'free') tally[name].falseBlock.push({ sha: sha.slice(0, 8), when, subj });
    if (!blocks && truth === 'held') tally[name].falseRelease.push({ sha: sha.slice(0, 8), when, subj });
  }
}

console.log(`ground truth over ${held + free} classifiable STATUS commits: ${held} HELD, ${free} FREE (${skipped} unclassifiable, skipped)\n`);
for (const [name, t] of Object.entries(tally)) {
  console.log(`${name}`);
  console.log(`   FALSE-BLOCK   (main starved for nothing): ${t.falseBlock.length}`);
  console.log(`   FALSE-RELEASE (runner enters a held tree): ${t.falseRelease.length}`);
  for (const r of t.falseRelease.slice(0, 4)) console.log(`      !! ${r.sha} ${r.when} ${r.subj.slice(0, 58)}`);
  for (const r of t.falseBlock.slice(0, 3)) console.log(`       ~ ${r.sha} ${r.when} ${r.subj.slice(0, 58)}`);
  console.log('');
}
