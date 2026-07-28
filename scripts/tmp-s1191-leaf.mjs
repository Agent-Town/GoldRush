import { readFileSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));

const leaf = {
  id: 'factory-m3-05d-run-ledger-earned-truth',
  title:
    "F-1190-2 + F-1190-1 from the m3-05c drain: the ledger blanks the meta row for a secure-then-rush-then-die run the player permanently earned, and the four track names have two authorities",
  taskFile: 'lane-a-m3-05d-run-ledger-earned-truth.md',
  status: 'queued',
  lane: 'lane-a',
  authoredBy: 's1191 fire (FIRE-AUTHORED, attended review welcome)',
  predecessor: 'factory-m3-05c-run-ledger-meta-earned (merged 91c22f2eb72b22f171fd8c3da07960004db95393)',
  spec:
    'reviews/m3-05c-run-ledger-meta-earned.md findings F-1190-1 and F-1190-2; subjects src/game/RunManager.ts:269 (the metaEarned append guard), :592 (module-private trackLabel), :91-92 (rush vs death reason), :157-170 (applySuspendRunState), :422-434 (awardSecuredClaim); src/ui/RunLedger.ts:145 (re-derived labels); src/game/MetaProgress.ts:2 META_TRACKS (the new home of the vocabulary); src/core/EventBus.ts:15 RunEndReason; test e2e/m3-05b-run-ledger.spec.ts',
  authorNotes:
    "AUTHORED FROM THE PREDECESSOR'S OWN TWO FINDINGS, BOTH RE-MEASURED AT THE CODE BEFORE THE MASTER WAS WRITTEN — AND ONE OF THE TWO RECOMMENDED CURES WAS FOUND UNDER-SPECIFIED, WHICH IS THE POINT OF THE SLICE. F-1190-2 VERIFIED PATH BY PATH: secureRun (:288) calls awardSecuredClaim at :293, which permanently banks the payout into gr.meta.v1 (:428-429); a player who then takes Stay for the Rush and dies ends with reason 'rush' rather than 'death' (:91-92 via stayedForRushRunId), and the append guard at :269 is `reason === 'secured'`, so the entry carries NO metaEarned key and the ledger shows a blank row for meta the player keeps forever. THE REVIEW RECOMMENDED WIDENING TO `reason !== 'death'`. That is behaviourally correct TODAY — RunEndReason is exactly three values (EventBus.ts:15) and every 'rush' run is reachable only via stayForRush (:219 requires securedRunId === runId) or secureRun's auto-rush branch (:307, three lines after the award), so every 'rush' run happens to have been paid — but it is correct through a three-step inference living in two other functions. THE MASTER THEREFORE SPECIFIES THE EXACT PREDICATE INSTEAD: `this.paidRunId === this.runId && this.lastPayout`, which is the row's own claim. awardSecuredClaim sets both together (:430-431); startRun increments runId every run (:231) so the pair self-expires; and applySuspendRunState maintains BOTH across suspend/resume (:160 paidRunId, :165 lastPayout) — verified, which is why the existing assertion at e2e/m3-05b-run-ledger.spec.ts:98 still holds. Stated honestly in the master: the two predicates are INDISTINGUISHABLE by any test the current three-value type permits, so the preference is structural and the runner is forbidden from inventing a fake test or adding a fourth RunEndReason to manufacture one. That is deliberate — it is the same disease as F-1190-1 one level down, a claim that is green because two spellings coincide. F-1190-1 CURE RESHAPED TOO: the review said 'export trackLabel and import it', which would create a NEW src/ui -> src/game/RunManager import edge (the predecessor's drain already had to re-run the node-only collection guards over a much smaller new edge). The master instead MOVES trackLabel into src/game/MetaProgress.ts, which already owns META_TRACKS and which BOTH files already import (RunLedger.ts:2 and RunManager.ts) — verified, so the move adds ZERO new import edges and puts the vocabulary in the module that names the thing. FIREWALLED WITH A STOP RATHER THAN AN EDIT: normalizeEntry/readRunHistory are explicitly out of scope because the predecessor's drain proved byte-for-byte that an entry lacking metaEarned is still RETURNED — adding the field to that closed gate would silently delete every banked run with no test failing; awardSecuredClaim's body, Balance.meta, summarizeRun, secureRun, stayForRush, startRun and RunSuspend.ts are untouched because this slice changes what the ledger REPORTS and never what a run PAYS; EventBus.ts is NO-listed specifically so the runner cannot add a reason to make a test possible; DeathOverlay.ts is NO-listed because F-1189-1 is owner-gated. TWO STOPS ARE PRE-DECLARED AS SUCCESSES: a path where paidRunId/lastPayout are unreliable (which would falsify the finding's premise and needs the owner), and a guard or layering rule broken by the MetaProgress move (report it, do not reroute the import through RunManager). LANE-SAFETY pre-proved by the unique-blob invariant, not the ahead-count: lane/m3 was 1 ahead at b70f4db1 whose content shipped as 91c22f2e, `git diff --name-only --diff-filter=A main lane/m3` was EMPTY, and the two-dot diff contains no src/ or e2e/ path at all, so the reset destroys nothing. Routed to lane-a because lane-c was LIVE on the eight-winds Rail Tough row-settle and lane/perf on lane-d uniquely holds logs/suite-red-inventory-raw.json.",
};

let inserted = false;
(function walk(n) {
  if (!n || typeof n !== 'object' || inserted) return;
  if (Array.isArray(n)) {
    const i = n.findIndex((x) => x && x.id === 'factory-m3-05c-run-ledger-meta-earned');
    if (i >= 0) {
      n.splice(i + 1, 0, leaf);
      inserted = true;
      return;
    }
    n.forEach(walk);
    return;
  }
  for (const k of ['subgoals', 'tasks', 'children']) if (n[k]) walk(n[k]);
})(g.goals);

if (!inserted) {
  console.error('FAILED: anchor leaf factory-m3-05c-run-ledger-meta-earned not found');
  process.exit(1);
}
writeFileSync('tasks/goals.json', `${JSON.stringify(g, null, 2)}\n`);
console.log('inserted leaf factory-m3-05d-run-ledger-earned-truth after the m3-05c leaf');
