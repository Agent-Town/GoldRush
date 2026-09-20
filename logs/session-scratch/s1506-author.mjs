import fs from 'node:fs';

// ---- goal leaf, same commit as the master (Goal Registration Law) ----
const GP = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(GP, 'utf8'));
let sibling = null, parentArr = null;
const walk = (n) => {
  if (Array.isArray(n)) {
    for (const c of n) { if (c && c.id === 'f1501-4-manifest-plural') { sibling = c; parentArr = n; } }
    return n.forEach(walk);
  }
  if (n && typeof n === 'object') Object.values(n).forEach(walk);
};
walk(g);
if (!parentArr) throw new Error('anchor leaf not found');
if (JSON.stringify(g).includes('"f1506-2-e9-roster-bisect"')) throw new Error('leaf already exists');

parentArr.splice(parentArr.indexOf(sibling) + 1, 0, {
  id: 'f1506-2-e9-roster-bisect',
  title: 'F-1506-2: e9-roster is a REGRESSION in eb3a8a012..main, not a ledger gap. Bisect the window, name the culprit, write docs/bench/e9-roster-regression.md; cure only if provably small.',
  taskFile: 'lane-f1506-2-e9-roster-bisect.md',
  lane: 'lane-a',
  status: 'queued',
  attempts: 0,
  authoredBy: 's1506 fire (FIRE-AUTHORED)',
  authorNotes: 'Authored after REFUTING the inherited F-1503-3 recommendation rather than adopting it. Both bisect endpoints were MEASURED this fire in one worktree/shell at --workers=1: 6 passed at eb3a8a012 (the commit the suite-red-inventory run measured), 4 failed / 2 passed at current main. red-inventory-lookup returns CLEAN-IN-INVENTORY and that verdict is CORRECT - the two inventory halves are the SAME run (compact stats.expected 2006 == markdown "Total passed: 2006", as logs/suite-red-inventory.md:581 claims), so CLEAN means "ran and passed", which the re-run independently confirms. F-1503-3 diagnosed a stale ledger and REC-d refreshing it; two later fires transcribed the verdict as NOT-IN-INVENTORY (opposite meaning). Refreshing would have written a live regression into the exoneration ledger as an accepted known-red. The master therefore FORBIDS refreshing the inventory and FORBIDS editing e2e/e9-roster.spec.ts, validates the predicate on both known outcomes before bisecting (a predicate not shown to distinguish the endpoints is not a predicate), and lets the runner STOP at a named culprit rather than guess a cure.',
});
fs.writeFileSync(GP, JSON.stringify(g, null, 2) + '\n');
console.log('leaf f1506-2-e9-roster-bisect added');

// ---- BACKLOG: file F-1506-2 and correct the F-1503-3 row ----
const BP = 'tasks/BACKLOG.md';
let b = fs.readFileSync(BP, 'utf8');

const row = `✍️ **F-1506-2 AUTHORED s1506 (FIRE-AUTHORED — attended review welcome) — \`tasks/lane-f1506-2-e9-roster-bisect.md\` → lane-a, goal leaf \`f1506-2-e9-roster-bisect\`. THE INHERITED RECOMMENDATION WAS WRONG, AND ADOPTING IT WOULD HAVE LAUNDERED A LIVE REGRESSION INTO THE EXONERATION LEDGER.** F-1503-3 has been called *"the cheapest fire-authorable corrective"* by two consecutive fires. Its REC — *"refresh the red inventory FIRST so it stops under-reporting"* — was re-priced before adoption (F-1310-1 shape) and **does not survive measurement**. 📐 **THREE FACTS, ALL MEASURED THIS FIRE, none inherited.** ⑴ \`e2e/e9-roster.spec.ts\` at \`eb3a8a01200b57cbbfce73ddc44898361669b391\` — the commit the suite-red-inventory run measured — is **6 passed**; at current main it is **4 failed / 2 passed** (titles \`:113\` *"E9 placeholders preserve siege/thief flags and cure-arms exits"* and \`:167\` *"plain Red Fields boot stays error-free without the debug harness"*, both projects). **Same worktree, same shell, same \`--workers=1\`, 22.4 s vs 32.4 s** — a clean control pair, so this is a **REGRESSION in a bounded window**, not a ledger gap. ⑵ \`red-inventory-lookup\` returns **\`CLEAN-IN-INVENTORY\`**, and that verdict is **CORRECT**: \`scripts/red-inventory-lookup.mjs:141\` distinguishes three states, and CLEAN means *ran and did not fail* — which ⑴ independently confirms by re-execution. ⑶ The instrument is **not** split-brained, which I had hypothesised from the two files' six-day-apart git dates and then **refuted**: \`logs/suite-red-inventory-compact.json\` \`stats.expected: 2006\` matches the markdown headline \`Total passed: 2006\`, exactly as \`logs/suite-red-inventory.md:581\` asserts. The \`.md\` is simply a *later annotation* of the same run (\`c48861116\` added the worker-arms note). ⚠️ **SO THE LEDGER WAS RIGHT AND THE DIAGNOSIS WAS WRONG — and the cure was pointed at the instrument instead of the bug.** A refresh would have added an \`e9-roster\` row to \`logs/suite-red-inventory.md\`, after which every future drain's \`red-inventory-lookup\` would answer **KNOWN-RED** and wave it through. **That converts a findable, bisectable regression into an excused one**, which is strictly worse than the status quo it was meant to improve. 🔤 **A ONE-WORD TRANSCRIPTION DRIFT CARRIED IT:** s1503 recorded \`CLEAN-IN-INVENTORY\` (correct, and it matches today's measurement), while **s1504 and s1505 both recorded \`NOT-IN-INVENTORY\`** — the opposite verdict, meaning *never ran*, i.e. a **coverage gap** rather than a **contradicted pass**. Those two words license opposite cures: "never ran" argues for a refresh, "ran and passed" argues for a bisect. ⓘ **I cannot verify what command those fires ran and do not assert they mistyped** — the compact file has not changed since 2026-07-28, so today's verdict should have been stable; the discrepancy is recorded as a discrepancy. 🎯 **THE MASTER THEREFORE FORBIDS BOTH TEMPTATIONS:** never refresh the inventory, and **never edit \`e2e/e9-roster.spec.ts\`** — making the test agree with the regression is the failure the task exists to prevent. It validates the predicate on **both** known outcomes before bisecting (a predicate not shown to distinguish the endpoints is not a predicate), and it lets the runner **STOP at a named culprit** rather than guess a cure, since an unclear fix is a separate slice with its own design question. **GATE: closes when the culprit commit in \`eb3a8a012..main\` is named with its \`--stat\`, \`docs/bench/e9-roster-regression.md\` carries the bisect table and per-title expected/received values, and either \`e9-roster\` is 6/6 green or the report states plainly why the cure was deferred.** Related: [F-1503-3], [F-1504-2], [F-1436-2], [F-1444-2], [F-ER01-E9-1].`;

b = row + '\n\n' + b;

const oldRec = '**Fire-authorable, non-blocking. REC: refresh the red inventory FIRST so it stops under-reporting, then file the arsenal-era red on its own evidence.**';
const newRec = '**Fire-authorable, non-blocking. ~~REC: refresh the red inventory FIRST so it stops under-reporting~~ — ⛔ **THIS REC IS WITHDRAWN s1506, SEE F-1506-2 AT THE TOP OF THIS FILE.** The ledger is not stale and is not under-reporting: its two halves are the SAME run, and `CLEAN-IN-INVENTORY` correctly means *ran and passed* — re-measured this fire as **6 passed at `eb3a8a012`** against **4 failed on main**. `e9-roster` is a REGRESSION in a bounded window, and refreshing the inventory would have recorded it as an accepted known-red, laundering it. The surviving half of the REC — *"then file the arsenal-era red on its own evidence"* — is exactly right and is now `tasks/lane-f1506-2-e9-roster-bisect.md`.**';
if (!b.includes(oldRec)) throw new Error('F-1503-3 REC text not found');
b = b.replace(oldRec, newRec);

fs.writeFileSync(BP, b);
console.log('BACKLOG: F-1506-2 filed; F-1503-3 REC withdrawn in place');
