// s1542 — Goal Registration Law: both direct correctives get a leaf carrying the
// FULL 40-char hash of their own code commit (goal-tracker.test.mjs:80 asserts
// /^[0-9a-f]{40}$/ — the F-1300-4 defect was a truncated one).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { serialize } from './goals-serialize-control.mjs';

const full = (sha) => execFileSync('git', ['rev-parse', sha], { encoding: 'utf8' }).trim();
const P = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(P, 'utf8'));

const leaves = [
  {
    id: 'f1542-1-desk-header-backtick-spelling',
    title:
      'F-1542-1: a GRAVE ACCENT (U+0060) where the apostrophe goes made BOTH desk guards blind to a well-formed desk at once, in opposite directions — desk-declaration-guard rc=2 "no desk header" (there was one, of 8 items) and desk-carryforward-guard rc=1 "this desk: 0 items, dropped: 7" (the drop guard accusing a fire of dropping its entire desk). Real instance: s1529 aab5dfb3. Widen the spelling set from four to five at all three sites, including gate-caller-audit.mjs OWNER_ROUTE where the same miss fails OPEN.',
    status: 'merged',
    mergeHash: full('a4ba9b0e'),
    attempts: 1,
    authoredBy: 's1542 fire (FIRE-AUTHORED, direct corrective — no lane master)',
    drainNotes:
      's1542. Not a drain: the board was drain-dry on arrival (six queues empty, newest done-move already drained-51b0bc35c, CODEX-WALL active until 11:00, nothing ahead of main but archive/save/sol refs). Found while pricing F-1541-2, not by searching for it. UNFINDABLE BY GREP: s1530 normalised the character while archiving s1529 line-1, so the live STATUS.md holds zero backtick variants and exonerates itself; recovered only by replaying handoff commits. Both symptoms fail SAFE in direction — nothing greened over, no owner item lost — but each names the WRONG CAUSE, which is the false-first-blocker class. Proved by manufacturing the defect: reverting both regexes reds exactly 3 arms (two new GROUND-TRUTH replays of the real s1529 line + the widened spelling loop), files restored byte-identical. Cured: 39/39 desk-guard arms, 19/19 gate-caller arms, gate-caller-audit rc=0 on the live tree. gate-caller-audit.mjs widening measured against the live baseline first: 0 new entries matched, so it is preventive and changes no verdict today. Pre-existing and NOT mine, recorded so the next fire does not chase it: the audit advises "1 baselined orphan now has a caller — npm:test:release", present at rc=0 PASS on the committed package.json before any edit of mine.',
  },
  {
    id: 'f1541-2-desk-birth-guard',
    title:
      'F-1541-2 / F-1542-2: an owner fork filed by an ATTENDED session has no path onto a desk except the next fire noticing it, and desk-carryforward-guard is blind to that population by construction (it compares desk N to desk N+1, so an item that never reached a FIRST desk is missing from both sides forever). Price the proposed predicate over the live corpus, then build desk-birth-guard only if false positives are 0.',
    status: 'merged',
    mergeHash: full('b59aad1d'),
    attempts: 1,
    authoredBy: 's1542 fire (FIRE-AUTHORED, direct corrective — no lane master)',
    drainNotes:
      "s1542. Not a drain. F-1541-2's GATE demanded pricing before building; discharged over 25 handoff windows (s1517..s1541, 96 rows added to tasks/BACKLOG.md). Hit list: 2 — F-AH-1 (s1538) and F-BAL-1 (s1540) — exactly the two items s1541 had found BY HAND and desked; an independent instrument reproducing a hand count on the nose. False positives 0. The pricing did not stop at yes: it measured the 2x2 the design left unstated, because sloppy membership hides a loose selector. loose/forgiving 20 qualifying 2 hits 0 FP; loose/STRICT 20 4 hits 2 FP (F-FD3-1, F-ER02-11 — gates turning on a DRAIN whose prose merely contains the word owner); tight/forgiving 15 2 0; TIGHT/STRICT 15 2 0 <- built. The strict column only became usable because of F-1542-1 the same fire: before that cure the backtick made s1529 desk unreadable and produced a third, phantom hit — a membership test is worth exactly what the desk parser under it is worth, so the right response was to teach the parser the header rather than loosen the test. s1533's refutation MET not ignored: it measured 23% false positives from KEY DRIFT re-keying OLD items across desks, over FIRE-AUTHORED rows; this guard looks only at rows BORN in the window (no prior key to drift from) and the leaking population is ATTENDED sessions, who file rows and never compose a desk. Teeth proven end-to-end on a real git tree (rc=1 naming the row, rc=0 once desked) plus 14 arms; the end-to-end GREEN arm was vacuous (window moved, 0 qualifying) and the non-vacuous green is the unit arm — stated rather than glossed. Rooted as npm run test:desk-birth in test:ledger-guards (gate) and test:node-guards (arms); grandfathered in gate-caller-baseline.json with the F-1300-4 timing reason its three siblings carry.",
  },
];

const ft = g.goals.find((x) => x.id === 'factory-infra').subgoals.find((x) => x.id === 'factory-truth');
const known = new Set(ft.tasks.map((x) => x.id));
for (const leaf of leaves) {
  if (known.has(leaf.id)) throw new Error('leaf already exists: ' + leaf.id);
  ft.tasks.push(leaf);
}
fs.writeFileSync(P, serialize(g));
for (const leaf of leaves) console.log(leaf.id + '  ' + leaf.mergeHash + '  len=' + leaf.mergeHash.length);
console.log('factory-truth tasks: ' + ft.tasks.length);
