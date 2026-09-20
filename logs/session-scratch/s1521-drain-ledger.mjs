// s1521 — drain bookkeeping for lane-fd3-boards-pass: register the shipped leaf (Goal Registration
// Law, at drain time per the s1439 precedent — drain-block-check returned UNKNOWN, F-1521-3),
// register the corrective's leaf, and append the two BACKLOG rows.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';

const MERGE = '7abee977a3cbaae1a7e604580bcf0d4cfb573bf6';

// ---------- goals.json ----------
const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const nodes = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.id || n.taskFile) nodes.push(n);
  for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
})({ subgoals: goals.goals || [] });

// Park both FD leaves beside the goal that already holds the agent-play / front-desk work.
const host = nodes.find((n) => n.tasks && n.tasks.some((t) => /ap-0|agent-rung|ap-1/.test(t.id || '')));
if (!host) throw new Error('no host subgoal found for the FD leaves');

const existing = new Set(nodes.map((n) => n.id));
if (existing.has('fd3-boards-pass')) throw new Error('fd3-boards-pass already registered');

host.tasks.push({
  id: 'fd3-boards-pass',
  title: 'FD-3 (AP-14 THE FRONT DESK): the boards improvement pass — county rows read rank · name · result · when, a per-profile "YOUR CLAIMS" strip answers local-vs-global at the display layer, honest empty states, sparse Field Book column omission, 390px parity',
  taskFile: 'lane-fd3-boards-pass.md',
  lane: 'lane-b',
  status: 'merged',
  mergeHash: MERGE,
  review: 'reviews/lane-fd3-boards-pass.md',
  registeredBy: 's1521 fire — REGISTERED AT DRAIN TIME; the master shipped with no leaf and drain-block-check returned UNKNOWN --strict rc=2 (F-1521-3), which fire.md §3.0 calls a bookkeeping finding, not a clearance',
  drainNotes: 'Runner self-declared "Not READY-FOR-GATES" over F-FD3-1, an unmet ACCEPTANCE CRITERION rather than a correctness failure: FD-3 wants a live "when" column, the stored row has the value, but boardRow() does not project it and the master forbade API edits. Merged anyway because the UI degrades cleanly (submittedAt optional + validated + em-dash fallback with an aria-label). Gate: tsc rc=0, build rc=0, own specs 8 pass/3 fail both projects where the 3 are a PRE-EXISTING HTTP 429 proved by a pre-merge control worktree failing the same three titles; adjacent mobile 16/16; the 2 adjacent desktop timeouts and the power-budget p95 both re-measured green in isolation (m2-01 7/7 rc=0; power p95 5/5 pass 0.371-0.470ms vs 0.500 cap).',
});

host.tasks.push({
  id: 'fd3-1-submitted-at-projection',
  title: 'F-FD3-1: give the county board "when" column its data — project submittedAt additively from boardRow(), firewall lifted by exactly one file',
  taskFile: 'lane-b-fd3-1-submitted-at-projection.md',
  lane: 'lane-b',
  status: 'queued',
  authoredBy: 's1521 fire (FIRE-AUTHORED from the fd3 drain evidence, attended review welcome)',
  authorNotes: 'Cure for the finding the fd3 runner filed against its own firewall. Precedent for the shape: e1-seam-yield-single-source-orig STOPPED because its firewall forbade the one file the cure needed, and was re-authored as ...-lift.md with exactly one file added (merged 75b07024). Data already exists: StoredRow.submittedAt is required (:70), persisted at :363, projected by the sibling at :270; the client already treats it as optional and renders an em-dash fallback, so no client change is needed. Master carries a citation-check grep proved to return 1 on main before dispatch (F-1425-2) and a SAFE-DUPE that explicitly warns against the bare grep, which returns 1 from the OTHER projection.',
});

writeFileSync('tasks/goals.json', JSON.stringify(goals, null, 2) + '\n');
console.log('goal leaves added: fd3-boards-pass [merged], fd3-1-submitted-at-projection [queued]');

// ---------- BACKLOG ----------
const bp = 'tasks/BACKLOG.md';
const lines = readFileSync(bp, 'utf8').split('\n');
const anchor = lines.findIndex((l) => l.startsWith('- 🟠 **GOAL LEAF `fd3-boards-pass`'));
if (anchor < 0) throw new Error('fd3 runner row not found');

// Retire the runner's own in-flight row in the same commit as the event (Mistake #5: Ghost Line).
lines[anchor] = lines[anchor].replace('- 🟠 **GOAL LEAF `fd3-boards-pass`: UI + e2e IMPLEMENTED on `lane/b`; one task-contract blocker remains.**',
  `- ✅ **SHIPPED ${MERGE.slice(0, 8)} (s1521 drain) — GOAL LEAF \`fd3-boards-pass\`: UI + e2e MERGED; the one task-contract blocker is now a queued corrective, not a gap.**`);

const rows = [
`- ✅ **FD-3 DRAINED s1521 at \`${MERGE.slice(0, 8)}\` — THE BOARDS READ LIKE BOARDS, AND THE ONE THING THE RUNNER COULD NOT DO IS NOW A MASTER RATHER THAN A FOOTNOTE.** Review \`reviews/lane-fd3-boards-pass.md\`. County rows show **rank · name · result · when**; a separate **"YOUR CLAIMS"** strip renders the active profile's own scores from existing storage (FD-4's local/global answered at the display layer, no new board species); empty states speak the door's language; sparse Field Books drop wholly-empty contract columns and gain a 390px swipe cue. Ranking, API and storage untouched. ⚖️ **THE RUNNER ENDED ITS REPORT "Not \`READY-FOR-GATES\`" AND WAS RIGHT TO — AND IT STILL MERGED, WHICH IS THE JUDGEMENT WORTH RECORDING.** That declaration was about an unmet ACCEPTANCE CRITERION (F-FD3-1: FD-3 wants a live "when", \`boardRow()\` does not project \`submittedAt\`, and the master said *"NO: API/ranking/storage changes"*), not about correctness. It refused to stretch its firewall — Mistake #14, reject-don't-stretch — and the merged client degrades cleanly rather than breaking: the field is optional, validated, and falls back to an em-dash carrying \`aria-label="Submission time unavailable"\`. 🧪 **EVERY RED ATTRIBUTED AWAY FROM THE SLICE BY MEASUREMENT, NOT ARGUMENT.** The 3 own-spec failures are one string — HTTP **429** — and a **detached pre-merge control worktree on its own dev server failed the SAME three titles**, so control 5 pass/3 fail vs merged 8 pass/3 fail: **the merge adds three tests, all pass, and the failure count does not move.** \`test:power-budget\` (p95 0.582 vs 0.500 cap) re-measured **5/5 PASS at 0.371–0.470 ms**; the two adjacent desktop timeouts re-ran **7/7 rc=0** in isolation while the same specs were **16/16 on mobile**. Both were load: \`test:node-guards\` took **361 s** against a ~55 s baseline with lane-a running a live timing task. \`test:task-guards\` red is **inherited** — its one invisible master, \`lane-fd1-front-desk-card.md\`, entered main in this merge's own base \`bd6c228da\`.`,
`- 📮 **F-FD3-1 (runner-authored, CURED-PENDING-DISPATCH) → \`lane-b-fd3-1-submitted-at-projection\` AUTHORED s1521 (FIRE-AUTHORED, lane-b), leaf registered \`queued\` in this same commit.** The county board's new "when" column is **empty in production** — every real row renders the em-dash — because \`boardRow()\` omits \`submittedAt\` from the public projection. **The data was never missing:** \`StoredRow.submittedAt\` is a REQUIRED field (\`functions/api/standings.ts:70\`), persisted at submit (\`:363\`), and already projected by the sibling at \`:270\`; the client validates it as optional and needs **no change at all**. So the cure is a one-line additive spread in the style of the existing \`...(row.defaulted ? { defaulted: true } : {})\`. **GATE: none — this is fire-authorable**, being a firewall lift rather than a design fork; the shape has a precedent (\`e1-seam-yield-single-source-orig\` STOPPED on a too-narrow firewall and shipped as \`...-lift.md\`, \`75b07024\`). The master lifts **exactly one file**, carries a dispatch-time citation grep **proved to return 1 on main first** (F-1425-2), and its SAFE-DUPE explicitly warns against the bare \`grep -c 'submittedAt: row.submittedAt'\`, which returns **1** from the other projection and would false-STOP the runner. ⓘ If the owner would rather not touch the public projection, the alternative is to **amend FD-3's live-when criterion** — but the em-dash is player-visible today.`,
`- ⚠️ **F-1521-2 (s1521) — THREE \`lb-01-county-standings\` TESTS GO RED ON HTTP 429 UNDER REPEATED LOCAL RUNS, AND THE SPEC IS **NOT IN THE RED INVENTORY**.** \`node scripts/red-inventory-lookup.mjs e2e/lb-01-county-standings.spec.ts\` returns **NOT-IN-INVENTORY**, so this drain had to build a **whole control worktree** to learn that its 3 reds were pre-existing — and the next drain touching this spec will pay the same price for the same answer. The three are \`secure submits the county row…\`, \`secure skips county submission…\`, \`offline standings failure…\`; all hit the standings submission endpoint with no rate-limit-aware fixture, and a **150 s wait did not clear it**, so it is a standing local condition rather than a transient window. **OWED (fire-authorable):** add the rows to \`logs/suite-red-inventory.md\` with the 429 fingerprint, or give the three tests a rate-limit-tolerant harness. Prefer the second — an inventory row documents a red, a fixture removes it.`,
`- ⚠️ **F-1521-3 (s1521) — GOAL REGISTRATION GAP ON BOTH FD MASTERS, AND ONE HALF IS STILL OPEN.** \`drain-block-check.mjs --strict\` returned **UNKNOWN rc=2** for \`lane-fd3-boards-pass.md\` — no leaf matched. Per fire.md §3.0 that is a bookkeeping finding and **never a clearance**, so \`fd3-boards-pass\` is registered at drain time in this commit (the s1439 precedent). Its sibling \`tasks/lane-fd1-front-desk-card.md\` is **still unregistered**, and is precisely what reddens \`test:task-guards\` ("1 NEW invisible master", baseline 0). ⚠️ **It wants a LEAF, not a DO-NOT-QUEUE header** — it is live queued work sitting in lane-a behind \`f1424-4-worker-arm-rates\`, so the guard's suggested "⛔ SHIPPED — DO NOT QUEUE" cure would be the wrong one. Left for the FD-1 drain and named here so it is not re-derived a third time.`,
];
lines.splice(anchor + 1, 0, ...rows);
writeFileSync(bp, lines.join('\n'));
console.log('BACKLOG: runner row retired ✅ SHIPPED + 4 rows appended');

// ---------- done-move ----------
const from = 'tasks/done/20260807-113408-lane-fd3-boards-pass.md';
const to = `tasks/done/drained-${MERGE.slice(0, 8)}-20260807-113408-lane-fd3-boards-pass.md`;
renameSync(from, to);
console.log('done-move ->', to);
