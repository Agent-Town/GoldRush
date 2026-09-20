import { execFileSync } from 'node:child_process';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1e8 });
g('add',
  'reviews/f1660-1-door-readmission-repair.md',
  'tasks/goals.json',
  'tasks/BACKLOG.md',
  'marketing/outbox/gazette-queue.md');
const msg = [
  's1662: drain bookkeeping for f1660-1 — leaf merged, F-1660-1 SHIPPED, F-1608-2 un-VOIDed, GZ-01 filed',
  '',
  'Review: reviews/f1660-1-door-readmission-repair.md. Merge 25499e0a1, corrective f8a704249.',
  '',
  'The two gr-sim reds seen on the merged tree were PRICED WITH A CONTROL rather than',
  'excused: the same two tests re-run on unmerged main reproduce both at near-identical',
  'timings (240001ms vs 240025ms; 79709ms vs 88362ms), so they are pre-existing and not',
  "this slice's. Three further grounds agree: gr-sim.test.mjs never references",
  'supportedContractIds/SUPPORTED_CONTRACTS; the one gr-sim test that touches a railcar',
  '(escort admission) passed; and the slice\'s whole src diff is +12 lines in a const object.',
  'They are load casualties — 778s against ~80s nominal, one child flat-lining at 0.0% CPU',
  'for 8+ minutes at load average 280, progressing normally at load 50.',
  '',
  'Ledger corrections: F-1608-2\'s "both maps are door-de-listed" reassurance was VOID from',
  '48a0d41ab until now and is true again; the ap16-4 SHIPPED row (d4fcc354) gains a',
  'correction pointer naming its one omission, superseded rather than deleted.',
  '',
  'F-1662-2 and F-1662-3 filed non-blocking; neither is owed to the owner.',
].join('\n');
g('commit', '-m', msg);
console.log(g('log', '-1', '--format=%h %s'));
