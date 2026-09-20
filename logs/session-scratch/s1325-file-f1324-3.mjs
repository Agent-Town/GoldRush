import fs from 'node:fs';

// --- 1. BACKLOG row, inserted directly after F-1324-2's row ---
const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const i = lines.findIndex((l) => l.startsWith('✅ **F-1324-2'));
if (i < 0) { console.log('F-1324-2 row not found'); process.exit(1); }

const row = [
  '🟡 **F-1324-3 (s1324, OPEN, NON-BLOCKING, MASTER AUTHORED + QUEUED s1325 — THE TOTALITY GUARD ADDRESSES ITS ARMS BY HARDCODED INDEX, SO A MENU REORDER WOULD LEAVE IT PASSING WHILE ASSERTING NOTHING).**',
  ' ⚠️ **Filed as its own row by s1325 because it had none.** s1324 recorded it in `reviews/f1324-1-charter-fuzz-composition-totality.md:57` and inside F-1324-1’s (now ✅) row —',
  ' and **`scripts/findings-state-guard.mjs:10` counts only finding declarations at the START of a `tasks/BACKLOG.md` line** (`:99` reads that file and nothing else), so the census could see it in neither place.',
  ' A finding that lives only as a subclause of a CLOSED row is invisible to every future sweep: the row above it reads ✅, and nobody re-reads the prose under a closed finding.',
  ' ✓ **RE-VERIFIED AT SOURCE s1325, not inherited:** `e2e/charter-press-totality.spec.ts:26,31,32` do hold the literals `arms[3]`, `arms[9]`, `arms[3]`.',
  ' ✓ **Two limits, both quoted from the review:** ⑴ the 169-ordered-pair test derives `armCount` and is immune, but **the bidirectional assertion that proves the arm still FIRES is not** —',
  ' reorder the menu and those literals silently re-point, leaving a green test that asserts nothing about the composition it was written for;',
  ' ⑵ `fixedRng = () => 0` pins every internal selection to index 0 and uses only the first Frontier template, so the guard proves **structural** totality, not **value-space** totality.',
  ' ⓘ **Neither blocks, and the review said so** — both are strictly stronger than what existed before (nothing), and the defect class that took the whole suite down (one arm destroying state another reads) is fully covered.',
  ' GATE: none owed — the review said *fold into the next touch of this rig*, and s1325 did: `tasks/lane-c-f1324-3-charter-fuzz-label-addressing.md`, queued to lane-c after refreshing the lane and proving `04438027` present.',
  ' The master asks for a derived label→index map that goes **RED naming the label** if it ever becomes ambiguous or absent, keeps the bidirectional assertion at full strength,',
  ' widens the sweep over three rng draws × every Frontier template, and **pre-declares a STOP if the widening uncovers a real throw** — a discovered throw is that task’s success, not its failure.',
].join('');

lines.splice(i + 1, 0, row);
fs.writeFileSync(p, lines.join('\n'));

// --- 2. goal leaf under factory-infra, SAME commit (Goal Registration Law) ---
const gp = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(gp, 'utf8'));
const fi = g.goals.find((x) => x.id === 'factory-infra');
if (!fi) { console.log('factory-infra not found'); process.exit(1); }

fi.tasks = fi.tasks || [];
fi.tasks.push({
  id: 'f1324-3-charter-fuzz-label-addressing',
  status: 'queued',
  lane: 'lane-c',
  taskFile: 'lane-c-f1324-3-charter-fuzz-label-addressing.md',
  authoredBy: 's1325 fire',
  spec: 'reviews/f1324-1-charter-fuzz-composition-totality.md:57 (F-1324-3, filed by the s1324 drain as OPEN/NON-BLOCKING with GATE: fold into the next touch of this rig); subject e2e/charter-press-totality.spec.ts:26,31,32; rig e2e/charter-press.rig.ts:54-121',
  authorNotes:
    'FIRE-AUTHORED s1325. Premises re-derived at source, not inherited: the arms[3]/arms[9] literals were read in the file, and the rig was read to confirm 13 arms each returning a distinct label with four noop-guard paths (:63,:70,:77,:92) — which is precisely what makes a label->index map derivable without touching the rig. F-1324-3 also had NO BACKLOG row of its own until this fire filed one: findings-state-guard.mjs:10 counts only declarations at the start of a BACKLOG line, so it was invisible to the census while sitting inside F-1324-1 closed row and in a review file. Lane-c was ABSENT of 04438027 (the very commit that created the file under edit) and was refreshed directly before queueing — the F-1324-2 trap, which has now caught two fires in a row.',
});

fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n');
console.log('row inserted at line', i + 2, '| goal leaf added under factory-infra');
