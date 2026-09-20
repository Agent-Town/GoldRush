// s1042 drain bookkeeping: goal leaf -> merged (hash stamped post-commit by _s1042_hash.mjs),
// plus the BACKLOG ledger line for the merge. Both must land IN the drain commit (GOAL REGISTRATION LAW).
import fs from 'node:fs'

// --- goal leaf ---
const gp = 'tasks/goals.json'
const g = JSON.parse(fs.readFileSync(gp, 'utf8'))
let leaf = null
const walk = (n) => {
  if (!n || typeof n !== 'object') return
  if (n.id === 'm2-05-repair-dwell-observable') leaf = n
  for (const k of ['subgoals', 'tasks', 'children']) (n[k] || []).forEach(walk)
}
g.goals.forEach(walk)
if (!leaf) throw new Error('goal leaf m2-05-repair-dwell-observable not found — refusing to guess')
leaf.status = 'merged'
leaf.mergeHash = 'PENDING-STAMP'
leaf.note =
  'Drained s1042. Test-only (+5/-1, one spec). Window widened 123-126ms -> ~1000ms real via wreck.repairSeconds=8; both mutation controls red-on-removal; 3x desktop 7/7 + mobile 7/7 on merged main; runner 42/42 six invocations both projects. Review reviews/m2-05-repair-dwell-observable.md.'
fs.writeFileSync(gp, JSON.stringify(g, null, 2) + '\n')
console.log('goal leaf -> merged')

// --- BACKLOG line ---
const bp = 'tasks/BACKLOG.md'
const lines = fs.readFileSync(bp, 'utf8').split('\n')
const idx = lines.findIndex((l) => l.startsWith('- **s1042 PIPELINE VERIFICATION'))
if (idx < 0) throw new Error('s1042 anchor bullet missing — refusing')
const bullet = `- ✅ **m2-05 REPAIR-DWELL OBSERVABLE — MERGED s1042 (\`PENDING-STAMP\`), and the four-fire timing chain in m2-05 is CLOSED.** Drained \`lane/e2-arsenal\` tip \`7d951b76\` (base \`be912cbc\` = the merge-base; main had never moved the file ⇒ byte-exact path-scoped land, no 3-way). **Test-only, +5/−1, one file.** THE DEFECT, finally MEASURED rather than inferred: the mid-repair \`expect.poll\` watched a progress window that rAF telemetry puts at **~123–126 ms** against a **~100 ms** poll interval — a coin flip that failed **~1 in 3** desktop full-file invocations **at two different sites** (\`:233\` and \`:260\`, site varying with scheduling), which is exactly why three prior fires each saw a different symptom and one saw none. THE FIX: override \`wreck.repairSeconds\` to **8 simulated seconds** in both affected tests (~1,000 ms real at \`timescale=8\`, ~8× wider) — **the window was widened; no assertion was weakened**, which was the whole point of the chain. **ACCEPTANCE EVIDENCE (both can-it-still-fail proofs, as the master demanded):** hero kept out of repair radius → the unchanged progress poll goes red \`Received: 0\`; interrupt removed so the repair completes → the sink assertion goes red \`Expected false, Received true\` after the shared 8.3 s wait. **BOTH DRAIN RIDERS DISCHARGED BY READING THE DIFF, NOT THE REPORT:** (1) no left-in mutation control — all three hunks legitimate, no \`page.route\`, no removed interrupt, no loosened assertion (scope 4 *ordered* controls, and F-1036-2 once shipped one by accident); (2) **F-1041-1 held** — the node-side \`Balance.wreck.repairSeconds\` read is gone, the wait is fed by the same local const as the page-side \`setBalance\`, so the vacuous guard s1041 caught pre-flight never opened. **GATES on merged main:** tsc clean · build green (1.23s) · m2-05 desktop **7/7 three separate invocations** (52.5s/53.1s/52.7s — three, because pre-fix a single green proved nothing) · mobile-390 **7/7** · m1-01 boot **4/4** zero-console; runner's own lane evidence 12/12 isolated + **42/42** full-file both projects + adjacent **38/38**. Review \`reviews/m2-05-repair-dwell-observable.md\`. **F-1042-1 (non-blocking, no task owed) — the pattern, so the scar is not re-earned:** *an \`expect.poll\` on a value that is non-zero only for a bounded window must first make the window wider than the poll interval by overriding the balance that bounds it — never by shortening the assertion.* **No gazette item and no deploy, by the filter laws, not by omission:** test-only ⇒ no player-visible surface, zero \`src/\`.`
lines.splice(idx, 0, bullet)
fs.writeFileSync(bp, lines.join('\n'))
console.log('BACKLOG merge line inserted at', idx + 1)
