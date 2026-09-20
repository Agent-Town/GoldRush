// s1042: retire three ghost lines in BACKLOG's lane-a header (Mistake #5 — a ledger line must
// retire in the same commit as the event; these outlived their events by 5 days and 19 sessions).
// Corrections are MARKED, never deleted (Retention Law).
import fs from 'node:fs'
const p = 'tasks/BACKLOG.md'
let s = fs.readFileSync(p, 'utf8')

const edits = [
  [
    '= PENDING later slices',
    '= PENDING later slices **[❌ STALE — CORRECTED s1042: WINDOW 2 SHIPPED s753 (`d70453f1` → main, `reviews/lane-assay-ledger-page.md`), file-probed at `src/encyclopedia/liveStats.ts:4` (`STATS_ENDPOINT` live-read). ONLY WINDOW 3 (Ticker/Gazette quotes the same endpoint) IS PENDING — and per `specs/accounts/README.md:29` TL-03 is explicitly "fire-authorable", so this ghost line was hiding the ONE authorable rung lane-a has. Master now BANKED: `tasks/lane-a-tl-03-window-3-ticker-stats.md`.]**',
  ],
  [
    '**GO-LIVE BLOCKER (unchanged) = F-tl01-1',
    '**[❌ FLATLY STALE — CORRECTED s1042: F-tl01-1 WAS FIXED 5 DAYS AGO. `functions/api/telemetry.ts:74` AND `functions/api/stats.ts:60` both now read `context.env.TELEMETRY ?? context.env.ACCOUNTS` (landed `4c68cdca` + `acacbb39`, recorded at BACKLOG:697). This header contradicted a dated entry 670 lines below it, and the word "unchanged" made it read as re-verified. NOT a go-live blocker — the text that follows is kept for history only.]** **GO-LIVE BLOCKER (unchanged) = F-tl01-1',
  ],
  [
    'SCI-03-class meta still needs a spec/owner call',
    'SCI-03-class meta still needs a spec/owner call **[⚠️ AMBIGUOUS, flagged s1042 rather than resolved: the ledger says SCI-03 assay-branch ✅ SHIPPED s106 `db87f48`, while `specs/science-dimension/README.md:59` carries the slice UNMARKED with THREE parts ("contract tier, crafted-cards-into-pools, schooling offers") — whether parts 2 and 3 shipped with `db87f48` is UNVERIFIED (nobody has traced the diff). The nearby PIPELINE-DRY line in this section is itself a ghost that should have retired at s106. This needs an attended reconciliation of spec-vs-ledger, NOT a fire authoring against a half-shipped slice.]**',
  ],
]

for (const [find, repl] of edits) {
  if (s.split(find).length - 1 !== 1) throw new Error('anchor not unique, refusing: ' + find.slice(0, 50))
  s = s.replace(find, repl)
}
fs.writeFileSync(p, s)
console.log('three ghost lines marked in the lane-a header')
