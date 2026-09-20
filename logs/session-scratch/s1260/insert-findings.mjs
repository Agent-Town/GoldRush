#!/usr/bin/env node
// s1260 — insert the STOPPED line + F-1260-1/-2 + the refreshed QUEUED line into BACKLOG.md.
// Placement: immediately after the s1259 DRAINED line (the newest-findings region, L22),
// matching s1259's own insert placement one commit earlier.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const lines = readFileSync(path, 'utf8').split('\n');

const anchorIdx = lines.findIndex((l) =>
  l.startsWith('✅ **DRAINED (s1259) — `lane-b-findings-state-guard` MERGED'),
);
if (anchorIdx < 0) throw new Error('anchor line not found — refusing to guess placement');

const STOPPED =
  '⛔ **STOPPED (s1260) — `lane-b-findings-state-vocabulary-triage` (authored s1259 `a70934ea`) STOPPED AT ITS OWN SCOPE-1 GATE, LAWFULLY, WITH NO ARTIFACT AND A CLEAN LANE** ' +
  '(run log `tasks/runs/20260730-150612-lane-b-lane-b-findings-state-vocabulary-triage.md.log`, 85,129 tokens, ~3 min; `lane/m4` clean at `a70934ea`; done-move retired `stopped-s1260-*`). ' +
  "The gate demanded s1259's four numbers within ±2; the run measured **427 declarations / 🟡 22 / broad 34 / unmarked 23** against the master's **424 / 22 / 33 / 25** and stopped on the +3. " +
  "✓ **Re-derived s1260 with the run's own instrument at six revisions — the run's four numbers are exactly right and the STOP was correct.** " +
  'Superseded by the refreshed master in the QUEUED line below; **F-1260-1 is why the baseline was already wrong before the run ever started.**';

const F1 =
  '🔬 **F-1260-1 (s1260, MEASURED — WHEN ONE FIRE BOTH MUTATES A SUBJECT AND AUTHORS A MASTER THAT MEASURES THAT SUBJECT, THE BASELINE MUST BE DERIVED *AFTER* THE MUTATION).** ' +
  "s1259's triage master pinned scope 1 to **424 declarations / 🟡 22 / broad 33 / unmarked 25**, measured at `bd1889ff` (s1258's handoff — the **pre-strike** ledger). " +
  'It then struck three findings in **`7acdaf07`** and authored the master in **`a70934ea`** *four minutes later*, carrying the pre-strike numbers in as the post-strike expectation. ' +
  "✓ **All four drifts are `7acdaf07` itself, measured at six revisions with s1259's own probe** (`logs/session-scratch/s1260/baseline-drift.txt`): " +
  '**+3 declarations** = the three F-IDs s1259 wrote in that very commit (F-1259-1/-2/-3, enumerated); ' +
  '**−2 unmarked** = F-1148-1 + F-1152-1, the two struck findings that were double-state; ' +
  "**+1 broad** = F-1179-1, which s1259's own strike finally gave the closure declaration it had never had — F-1259-2's whole point. **Nothing external moved.** " +
  '**The run was right in direction and one commit short of the culprit:** it exonerated the later authoring commit and named the guard merge `82f0b394`, which merely post-dates the real cause. Cost: one lane slot, ~3 min, 85k tokens. ' +
  '➡️ **THE RULE: a baseline is a claim about the tree the RUN will see, not about the tree that motivated the master — derive it at the commit you author from, after your own edits land.** ' +
  'Discharged by the refreshed master below, which **names its population** so an unrelated ledger edit can no longer perturb it.';

const F2 =
  '🔬 **F-1260-2 (s1260, MEASURED — THE AUDITOR INHERITED THE DEFECT IT WAS BUILT TO EXPOSE; THIS IS F-1259-1 ONE LEVEL UP).** ' +
  "F-1259-1 proved the merged guard's *open*-state vocabulary is too narrow (`🟡` = 22 of 424 declarations, 5%). " +
  '✓ **Its accusing instrument has a too-narrow *closed*-state vocabulary, read directly at `logs/session-scratch/s1259/findings-double-state.mjs:29`:** ' +
  '`CLOSED_RE` admits `✅|⛔CLOSED|SHIPPED|CLOSED|RETIRED|ANSWERED|DISCHARGED|struck sNN` and **does not admit `DRAINED`** — one of the most common closure verbs in this ledger — nor the `🟢` glyph, nor "LAWFUL STOP". ' +
  '**Measured consequence: 5 of its 23 "unmarked candidates" (22%) are its own artefact, not ledger defects** — F-1032-1, F-1068-5, F-1104-1, F-1179-3, F-1252-1, each of whose open line states its own closure in words the regex cannot read (`F-1104-1` L1634: *"IS DRAINED (`5ec26bce`)"*). **The genuinely-unmarked residual is 18.** ' +
  '➡️ **THE RULE, which is F-1259-1 generalised: a POSITIVE count has a vocabulary too. A negative result’s hidden DENOMINATOR is the famous trap; a positive result’s trap is its COMPLEMENT — enumerate the closure words your instrument does not know before you believe its offender list.** ' +
  'Deliberately **not** fixed in place: the probe is s1259’s committed instrument, and "5 named candidates are artefacts" is a cheap, falsifiable prediction, so it is folded into the refreshed master as scope 1 for the run to confirm or refute.';

const QUEUED =
  "🔨 **QUEUED (s1260, FIRE-AUTHORED — refresh + re-land of s1259's STOPPED rung) — `lane-b-findings-state-vocabulary-triage` → `tasks/queue/lane-b/`: classify the **18** confirmed-unmarked double-state candidates by CODE OR LEAF PROBE, confirm or refute the **5** instrument artefacts F-1260-2 predicts, and measure what widening the guard's vocabulary would cost.** " +
  'Discharges F-1259-1’s rung plus F-1260-2. **The baseline is derived at THIS commit and the population is NAMED — all 23 F-IDs are listed in the master — so scope 1 now STOPs only if a named finding cannot be located, never on a global count that any unrelated ledger edit perturbs (F-1260-1).** ' +
  'Diagnosis-only: deliverable `artifacts/findings-state-vocabulary-triage.md`; firewall forbids `tasks/BACKLOG.md`, `tasks/goals.json`, `STATUS.md` and `scripts/findings-state-guard.mjs`. GATE: lane-b clean vs main (pre-proved s1260).';

lines.splice(anchorIdx + 1, 0, '', STOPPED, '', F1, '', F2, '', QUEUED);
writeFileSync(path, lines.join('\n'));
console.log(`inserted 4 entries after L${anchorIdx + 1}; file now ${lines.length} lines`);
