// s1516: drain bookkeeping — flip the f1515-1 leaf to merged with the FULL 40-char hash
// (goal-tracker.test.mjs:80 asserts /^[0-9a-f]{40}$/). Separate commit per F-1384-1.
import fs from 'node:fs';

const P = 'tasks/goals.json';
const MERGE = '25b3214277e47070bb41c8881cf6f111fa284a2b';
if (!/^[0-9a-f]{40}$/.test(MERGE)) { console.error('hash is not 40 hex'); process.exit(2); }

const g = JSON.parse(fs.readFileSync(P, 'utf8'));
function find(n, id) {
  if (Array.isArray(n)) { for (const x of n) { const r = find(x, id); if (r) return r; } return null; }
  if (n && typeof n === 'object') {
    if (n.id === id) return n;
    for (const k of ['subgoals', 'tasks', 'goals']) if (n[k]) { const r = find(n[k], id); if (r) return r; }
  }
  return null;
}

const leaf = find(g.goals, 'f1515-1-citation-scan-nondestructive');
if (!leaf) { console.error('leaf not found'); process.exit(2); }
console.log('before:', leaf.status, leaf.mergeHash ?? '(no hash)', 'attempts', leaf.attempts);

leaf.status = 'merged';
leaf.mergeHash = MERGE;
leaf.attempts = 2;
leaf.drainNotes =
  "DRAINED s1516 (25b32142). Attempt 2; attempt 1 correctly STOPPED on the unsatisfiable absolute bar (F-1515-3) and the master was re-authored relative. Gated in detached worktree gate-s1516 (§3.0b): tsc rc=0 · test:node-guards rc=0, 351 tests / 348 pass / 0 fail / 3 skipped at Node 26.4.0 · --report 515/259/212/44 against main's 515/262/210/43, scope 3's relative bar met (scanned equal, CARRIES-TITLE +2, NUMBER-ONLY -3, both tables summing to 515). Baseline was RE-TAKEN on main rather than inherited, because this fire committed twice into tasks/** before the drain and F-1515-3 is exactly the moved-denominator hazard — main measured identical to the runner's baseline, a verified non-event. Scope 2's 'moves NOTHING' prediction CONFIRMED by the runner independently (allowlist alone + old scanner restored = byte-for-byte 515/262/210/43), so the movement is scope 1's non-destructive scan, not a regression. Manufactured-defect arms RE-PROVED, not inherited: reverting only the guard to main's blob reds both named arms (18 tests / 16 pass / 2 fail), restored byte-identically (sha256/16 470662bff3655b3f). The third added arm (chained describe.serial.only/parallel.only) does NOT red against the old permissive regex and is stated in the review as a narrowness regression guard, not a defect arm. build + browser NOT owed (no src/**); F-1460-1 sim-pin paths checked, not assumed. F-1507-1 takes a FIFTH consecutive datum: runner rc=1/2 reds on Node 23.11.1, discharged rc=0 on the .nvmrc pin. Review: reviews/f1515-1-citation-scan-nondestructive.md.";

fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('after :', leaf.status, leaf.mergeHash, 'attempts', leaf.attempts);
