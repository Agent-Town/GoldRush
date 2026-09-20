import fs from 'node:fs';

const path = 'tasks/goals.json';
const j = JSON.parse(fs.readFileSync(path, 'utf8'));

let hit = null;

function walk(node) {
  if (hit) return;
  if (Array.isArray(node)) {
    for (const child of node) {
      walk(child);
      if (hit) return;
    }
    return;
  }
  if (node && typeof node === 'object') {
    if (node.id === 'eight-winds-e2-row-order-survey') {
      hit = node;
      return;
    }
    for (const key of Object.keys(node)) {
      walk(node[key]);
      if (hit) return;
    }
  }
}

walk(j);

if (!hit) {
  console.error('LEAF NOT FOUND — no write');
  process.exit(1);
}

console.log('before:', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash }));

hit.status = 'merged';
hit.mergeHash = 'dae48b8b2508d7956c661fb04987d01c82148c71';
hit.review = 'reviews/eight-winds-e2-row-order-survey.md';
hit.runReport = 'tasks/runs/20260729-010959-lane-c-eight-winds-e2-row-order-survey.md';
hit.drainedBy = 's1189 fire, 2026-07-29';
hit.note_s1189 =
  'ACCEPTED as evidence — the deliverable was a survey and the survey is sound. IT ANSWERED THE QUESTION THAT VOIDED ITS PREDECESSOR: F-1188-2 stalled on whether the Rail Tough carries a brass pauldron on one shoulder or both, and the report answers BOTH with frames cited (row 0 c0/c2, row 1 c1), declares the one-pauldron tell invalid, and replaces it with the wrench hand — validated by showing the wrench holds screen-left across front rows 0/1 and screen-right across back rows 2/3, i.e. a stable one-hand prop and not alternating decoration. It also built a BETTER instrument than the master asked for: for the Steam Wrecker, which s1188 measured as unmeasurable by silhouette, it used the SHIPPED CARDINAL sheet as a control, fixing the cyan tank body side from cardinal s (front, screen-right) and cardinal n (back, screen-left) without assuming any diagonal ordering. And it incriminated itself where the master told it to: four of five published Coal Thief controls reproduced exactly while 0v1 direct came back 0.856 against my 0.863 (-0.007), and it applied the master own binding rule to its own table — these numbers are evidence, not binding data. GATES: drain-block-check CLEAR run first; node-guards 61/61 + ticker BEFORE gating per s1187 standing order; tsc 0; build 1.85s asset-diet green; all three published SHA-256 evidence hashes MATCH the merged bytes (logs/s1189-verify-evidence.mjs); scripts/extract-alpha.mjs untouched and its --out DIR flag pre-exists at :20/:60, so it found the flag rather than adding one as the firewall required. No playwright: zero code, zero rendering surface, and lane-a was LIVE during the drain (Mistake #12). MERGE: diff-filter=A main..lane/e2-arsenal was exactly 4 pure adds, all inside TOUCH-ONLY (3 contact boards + the run report); every other file in the two-dot diff was this same fire earlier commits appearing as phantom D/M against the lane stale base. F-1189-2 FILED, AND IT IS THE F-1188-2 SHAPE RECURRING ONE LEVEL DOWN: the report names Steam Wrecker row 1 for regeneration because the cyan tank is wrongly screen-left in a front view, but measured at the raw pixels this drain, row 1 is the ONLY row in all 32 frames of BOTH Steam Wrecker sheets carrying TWO cyan clusters — cardinal sheet 16/16 frames single-cluster, diagonal rows 0/2/3 single-cluster in all 12 frames, row 1 two clusters in all 4 frames separated by a ~110px empty corridor and carrying 139-171px of cyan mass against 70-127px elsewhere. So the one-sided-tank discriminator is VOID for exactly the row the report applies it to; the report read the larger LEFT cluster as the tank and never mentions the 47-64px right-hand cluster, 36% of the row cyan mass. The VERDICT survives (row 1 must be regenerated, and the 2-row Steam Wrecker count holds) but the repair SPEC does not: an artist told to put the tank on the other side would deliver a row that still has two tanks. Row 2 verdict untouched. Probes committed as logs/s1189-tank-side-probe.mjs, logs/s1189-tank-cluster-probe.mjs, logs/s1189-cardinal-tank-probe.mjs so the next fire can re-run them. NET: the E2 diagonal art batch is now sized — Coal Thief 1 row (row 0 as sw), Steam Wrecker 2 rows (row 1 as lawful se with a SINGLE cyan tank, row 2 as lawful nw), Rail Tough indeterminate with a minimum of 1 (row 1 as one stable se row) — and there is still no honest all-sheet total until the Rail Tough 2v3 disagreement is settled by a non-silhouette measurement. The wiring slice stays blocked, correctly.';

fs.writeFileSync(path, `${JSON.stringify(j, null, 2)}\n`);
console.log('after: ', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash }));
