import fs from 'node:fs'

const bp = 'tasks/BACKLOG.md'
let b = fs.readFileSync(bp, 'utf8')
const before = b

const anchor = 'No gazette item + no deploy, by the filter laws (drafting tooling, zero player-visible change, zero `src/`).'
if (!b.includes(anchor)) throw new Error('s1043 ship-line anchor not found')

const NEXT = ` 🔜 **NEXT lane-a RUNG — AUTHORED *AND* QUEUED s1043 (same fire as the drain that found it): \`tasks/lane-a-tl-03-window-3-quiet-wire-honesty.md\`, leaf \`tl-03-window-3-quiet-wire-honesty\` (status \`queued\`, attempts 0).** Closes **F-1043-2(a) + F-1043-1** on the tooling that shipped one fire earlier. **The authoring fire's defect, not the runner's** — s1042 scope 3 ordered *"or the graceful empty state → print the honest quiet-wire line"* and the runner obeyed it exactly, harness case included; the master was wrong and the run was right. Scope: split \`empty:true\` (→ **byte-match Window 2's shipped \`the office opens with the first assay.\`**, never a third variant — the spine's wording is ratified by two shipped windows) from unreachable/non-200/malformed/shape-invalid (→ unchanged \`the wire is quiet.\`), make \`validPayload\`'s ordering explicit so an unusable \`empty:false\` answer earns the quiet line rather than the office line, and give a broken endpoint-constant read a **stderr operator diagnostic** while stdout stays paste-safe at exit 0 (F-1043-1: a fire compiling a digest is never blocked, but it must not be told the wire is down when the TOOL is broken). Firewall: the two scripts ONLY — \`liveStats.ts\` is **read** for the wording, never edited; deny-list + 140-char cap untouched (headroom already measured, do not re-derive). **Acceptance evidence is observable TODAY and that is the point:** the live endpoint answers \`200 {ok:true, empty:true}\`, so a correct fix flips \`node scripts/ticker-stats.mjs\` from \`the wire is quiet.\` to \`the office opens with the first assay.\` — a real before/after, not just a test edit — plus a **mandatory scope-5d mutation control** (re-introduce the defect → the harness must go RED naming the empty case). LANE-SAFETY pre-proved s1043: \`git log main..lane/m3\` = exactly \`46146b0b\`, whose content I drained myself as \`a30661bf\` ⇒ safe dupe, nothing lost by the reset. **NOT in scope, deliberately: F-1043-2(b)** (the \`allTime:0\` zero-tallies question — crosses \`functions/\` + deploy state, owner's desk).`

b = b.replace(anchor, anchor + NEXT)
if (b === before) throw new Error('BACKLOG unchanged — refusing to write')
fs.writeFileSync(bp, b)
console.log('BACKLOG.md: lane-a NEXT-RUNG line appended after the s1043 ship line')
