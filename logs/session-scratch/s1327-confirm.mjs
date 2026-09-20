import { readFileSync, writeFileSync } from 'node:fs'

// 1. Re-take the lock (both runs landed one minute after I cleared it).
const S = 'STATUS.md'
const L = readFileSync(S, 'utf8').split('\n')
const prev = L[0]
if (!prev.startsWith('Last updated: 2026-08-01T11:46Z s1327 handoff')) {
  throw new Error('line-1 is not my handoff — refusing: ' + prev.slice(0, 90))
}
L[0] =
  'ACTIVE 2026-08-01T11:52Z (s1327 fire) — re-took my own lock: BOTH lane runs done-moved at 11:47, one minute after I cleared it. Confirming F-1327-2 against the real diff before handing the drains on.'
L.splice(1, 0, '- **s1327 handoff (line-1 archive, superseded by the re-take below):** ' + prev)
writeFileSync(S, L.join('\n'))

// 2. Upgrade F-1327-2 from prediction to measurement.
const B = 'tasks/BACKLOG.md'
const R = readFileSync(B, 'utf8').split('\n')
const i = R.findIndex((l) => l.startsWith('🟡 **F-1327-2'))
if (i === -1) throw new Error('F-1327-2 row not found')

R[i] +=
  ' ⏱️ **CONFIRMED AGAINST THE REAL DIFF 40 MINUTES AFTER THIS WAS FILED — THE RUN TOOK THE LITERAL READING, EXACTLY AS PREDICTED.** `lane/perf` came back at `9eaa1ed5` touching **70 files**, against the **41** that are genuinely live. The 29-file excess is not sloppiness — it is the self-check being obeyed: **4 recorded-evidence JSONs under `artifacts/`** (`e5-deepwater-claim` desktop+mobile tile-state, `terrain3d-registry` desktop+mobile fingerprints) and **23 files under `assets/pilots/map-rebuild-spike/`** (22 terrain-contract JSONs + the `verify_e3_contract_terrains.py` script). ✅ **Two of the four predicted hazards it avoided on its own: `STATUS.md` and the `.scratch-*` / `.s*-probe-bak/` backups are untouched.** ⚠️ **The `artifacts/` four are the serious ones: those JSONs are *measurements of past runs* cited by shipped reviews — rewriting their bytes falsifies the record (RETENTION LAW), and no gate in the drain battery would have flagged it, because the diff is textually correct and every suite still passes.** ➡️ **MERGE RECIPE (path-scoped, the law already permits it): take `src/**` (7), `assets/contracts/**` (32), `e2e/**` (3) and `specs/e10-static-mechanic-DRAFT.md` (1) = **43 files**; DROP the 27 under `artifacts/` and `assets/pilots/`. Then re-run the rename’s own zero-survivors grep and expect it to REPORT survivors — that is the correct end state, not incomplete work.** 💡 *The finding was filed while the run was still executing, from reading the master rather than the output. That is the whole value: a self-check that cannot be satisfied is visible in the task text long before the diff exists, and by the time the diff exists it looks like a clean sweep.*'

writeFileSync(B, R.join('\n'))
console.log('lock re-taken; F-1327-2 upgraded to CONFIRMED at row ' + (i + 1))
