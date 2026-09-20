// s1042 BACKLOG edit: (1) retire slice ③ inline on the WP-E2 authoring-order line so no idle
// fire queues a superseded master; (2) add the s1042 verification bullet after that line.
import fs from 'node:fs'
const p = 'tasks/BACKLOG.md'
let s = fs.readFileSync(p, 'utf8')

const anchor = '③ E2 science tree data (epoch-2 manifest per SCI-04 socket; Sky-Rocket Battery in the arsenal branch §B2)'
if (s.split(anchor).length - 1 !== 1) throw new Error('anchor not unique — refusing')
s = s.replace(
  anchor,
  anchor +
    ' **✅ CONTENT LANDED (file-probed s1042) — master `tasks/lane-a-e2-science-tree.md` is SUPERSEDED; DO NOT QUEUE (Mistake #8). Evidence + the one unspecced residue in the s1042 bullet below.**',
)

const lines = s.split('\n')
const idx = lines.findIndex((l) => l.includes('OVERNIGHT AUTHORING ORDER for idle fires'))
if (idx < 0) throw new Error('order line not found — refusing')

const bullet = `- **s1042 PIPELINE VERIFICATION — the three idle lanes hold ZERO unmerged content, and the "authoring order" had a live stale-master trap in it.** ① **LANE-SAFETY RE-PROBED FRESH (s1041 flagged its own dry-lane claims as inherited; these are measured):** **lane-a/\`lane/m3\`** is 2 commits ahead (\`d1743150\` WIP-SALVAGE + \`cec50777\`) yet \`git diff lane/m3 main -- e2e/perf-05-startup.spec.ts\` is **EMPTY** (byte-identical), and main's \`artifacts/perf-05/*\` were last written by **s1039's drain \`c5dfbad7\`** (the gate RE-RUN) — the lane holds only the older pre-gate raws ⇒ nothing to salvage. **lane-b/\`lane/m4\`** is 1 commit ahead (\`edaf879f\`, runner output) whose content is fully in main: \`currentRunWave()\` at \`src/game/Game.ts:4777\` + both call sites \`:4786\`/\`:5268\`, and the \`WAVE_COUNTER\` block at \`e2e/e5-deepwater-claim.spec.ts:7,117\` — shipped **s1026 \`9a1454a4\`**. **lane-d/\`lane/perf\`**: \`git log main..lane/perf\` **EMPTY**. **All three SAFE to reset/refill.** **LAW CLARIFIED:** the LANE-SAFETY condition is **unmerged CONTENT**, not "branch ahead of main" — a commit-count read of it would have frozen lane-a and lane-b permanently, since a drained lane branch stays ahead until someone resets it. Probe content, not counts. ② **THE TRAP:** slice ③ above carried **no ✅**, so the next idle fire obeying this standing order would have queued \`tasks/lane-a-e2-science-tree.md\` (**Jul 8, 17 days old**) — straight into Mistake #8. Its scope-1 **is already in main**: \`assets/contracts/epoch-2-steamworks/manifest.json\` declares \`research.branches\` = **3 × 6 = 18 nodes** (Geology / Arsenal / Fabrication = the master's mining / arsenal / crafting-&-agent branches), above the 12–15 asked. The master's **Sky-Rocket Battery** node line shipped instead as an arsenal SYSTEM (\`src/systems/PressureArsenalSystem.ts\`, \`e2e/e2-arsenal.spec.ts\`), so the master is **SUPERSEDED, not merely duplicated** — re-queueing it would have ordered a runner to re-derive shipped data against a node sketch main no longer follows. ③ **PIPELINE-DRY: lane-a (needs attended/owner ruling) — the one residue is UNSPECCED.** The master's scope-2 wanted the locked successor era drawn as **greyed node silhouettes**; \`src/ui/ResearchChart.ts\` \`renderNextEpoch()\` (\`:521-536\`) emits only the successor's \`displayName\` + status ("awaits the town", asserted \`e2e/research-chart.spec.ts:173\`) — **no node shapes**, and \`grep -rn "silhouette" specs/\` plus \`specs/science-dimension/README.md\` contain **no next-epoch-silhouette law**. No spec slice ⇒ **not fire-authorable** (fire.md §2E hard limit). **OWNER/ATTENDED QUESTION:** should the Survey Chart silhouette the NEXT era's real nodes while locked (the master assumed yes), or is name + "awaits the town" the intended tease? A one-line ruling either retires scope-2 for good or becomes a spec slice.`

lines.splice(idx + 1, 0, bullet)
fs.writeFileSync(p, lines.join('\n'))
console.log('slice ③ retired inline; s1042 bullet inserted at line', idx + 2)
