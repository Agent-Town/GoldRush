# f1464-1 halo re-extraction — drain review (s1470)

- **Slice:** `lane-f1464-1-halo-reextraction` (authored s1469, executes the FIRST disjunct of F-1464-1's gate)
- **Branch/tip:** `lane/b` @ `d54077059` — a single work commit
- **Merge-base:** `89bfc10c`
- **Merged to main:** see the merge commit recorded in `tasks/goals.json` leaf `f1464-1-halo-reextraction`
- **Gated in:** detached worktree `gate-s1470/` on the MERGED tree (§3.0b custody), scratch port **5243** — lane-a was LIVE on `e3-canyon-environment` and 5188 is `strictPort`
- **Drain-block check:** ✅ CLEAR, leaf matched (`--strict`, read the WORD not the exit code)

## VERDICT: MERGED — a PARTIAL cure, and the partiality is the correct outcome

F-1464-1 stays **OPEN**. The runner deliberately did not banner it CURED, and that judgement is right: 774 of 1,075 suspects are cured under an asserted invariant, and the 301 held cells are held *because re-extracting them today would revert shipped mends*. Merging a proven cure for 774 files while recording an honest residue beats holding all 1,075 hostage to the hard 301.

## What it does

Re-extracts the safe haloed sprite classes through the cured extractor using the recipe ruled at `8e3c1491` (key-before-final-resample). Cures **774** shipped files including every provably-loaded surface the finding named — HUD Baron portrait **55.63% → 0.00%**, title emblem **99.17% → 0.00%** — while the four negative controls stay at **0.00%**. Adds `scripts/halo-reextraction-check.mjs`, which re-runs the sweep without leaving tracked probe dirt, asserts the exact 774/301 split, and byte-compares every cured file against pre-batch `89bfc10c`.

A touched-file-only lossless recompression cut the production-PNG growth from **+47.5 MiB to +14.9 MiB** with decoded pixels identical.

## Evidence

All gates run on the **merged** tree, all playwright at `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 4.8s |
| `npm run build` | **rc=0**, 16.7s (chunk-size notice is pre-existing) |
| `scripts/halo-reextraction-check.mjs` (slice acceptance) | **rc=0**, 45.3s — `774 cured, 301 held, 1314 scanned; alpha and opaque RGB unchanged` |
| `e2e/_s106-prospector-boot-probe.spec.ts`, desktop + 390px | **2 passed**, 8.2s, **zero console/page errors**, plain boot |
| `npm run test:node-guards` — **first run** | **rc=1**, 292 tests / 287 pass / **2 fail** → see F-1470-3 |
| `npm run test:node-guards` — after the F-1470-3 cure | **rc=0** (recorded in the drain commit) |

I re-ran the acceptance script myself rather than inheriting the runner's numbers; it reproduces `774 / 301 / 1314` on the merged tree independently.

## Merge classification

Base `89bfc10c`. Content is **1075 files / 99 insertions / 1 deletion** — 1054 `M`, 21 `A`; 774 `assets/processed`, 278 `assets/processed-full`, 20 new `reviews/shots-f1464-1-halo`, plus `scripts/halo-reextraction-check.mjs` (new), `tasks/BACKLOG.md`, `tasks/goals.json`. All asset paths **LANE-ONLY**; the two ledgers **BOTH-MOVED** and auto-merged clean.

⚠️ **THE TWO-DOT TRAP FIRED FOR THE FOURTH FIRE RUNNING.** `git diff main..lane/b` reads **1090 files / 554 deletions**; the true `main...lane/b` is **1075 files / 99 insertions / 1 deletion**, matching the lane commit's own `--stat` exactly. The phantom half is main's own six commits since the merge-base — s1469's drain plus this fire's authoring commit. Merged three-way with `merge --no-ff`. Four fires in a row is not a coincidence: **two-dot is structurally the wrong instrument for a lane that has fallen behind, which is every lane by drain time.**

## Findings

**F-1470-3 (CURED IN THIS DRAIN) — the merge reddened a guard it never touched, and the control run is what proved it.** `npm run test:node-guards` went **rc=1** on the merged tree. The named subject was `npm:verify:visual`, a long-standing *known* entry — exactly the shape that invites a "known-red, carry on" dismissal. It was not that. A control run settled it in seconds: **`gate-caller-audit.test.mjs` is rc=0 on clean main and rc=1 on the merged tree**, and the audit names the real cause — `NEW scripts/halo-reextraction-check.mjs  NO CALLER`. This is the s1301 gate-topology class: a new script must be **rooted or grandfathered with a reason**, and the slice did neither.

Cured by grandfathering it in `scripts/gate-caller-baseline.json` with a dated reason, re-verified rc=0. ⚖️ **Grandfathered, not dismissed — and I want the next reader to see the distinction.** Unlike `verify:visual`, this *is* a live coverage question: the guard's subject is 774 shipped sprite files that a later art batch could silently revert, which is precisely F-1464-1's own class (*a cure applied to a generator never reaches its past output*). Rooting it costs **45.3s on top of the battery's 162.6s (+28% on every src-touching drain)**, which is gate policy and not a fire's drive-by — the `npm:test:asset-diet` precedent (52.3s, measured green, sent to the desk) governs. **OWNER'S DESK, with a recommendation: root it.** A guard over 774 assets that nothing calls will not fire on the day it is needed.

**F-1470-2 (BOOKKEEPING, fixed in the drain commit) — an F-ID collision, because two writers minted s1470 IDs independently.** The runner filed its residue finding as **F-1470-1** while this fire's authoring row on main had already taken **F-1470-1** for the `e3-canyon-environment` dispatch. The merged `tasks/BACKLOG.md` therefore carried two different findings under one ID. The runner's is renumbered **F-1470-1 → F-1470-4**, with its reference in the goal leaf's `runnerReceipt` updated in the same commit. Neither writer was careless: a lane runner cannot see a main-side row committed after its own dispatch. **Any fire that both authors and drains in one cycle can mint this collision; check for it whenever a drained lane filed findings.**

**F-1470-5 (non-blocking) — 20 committed screenshots with no committed reproducer.** `reviews/shots-f1464-1-halo/` holds 20 PNGs cited as the visual QA, but no tracked spec produces them (`grep -rl shots-f1464-1-halo e2e/` is empty). The evidence is real but not re-runnable, so a future regression cannot be checked against it by re-execution. The machine-checkable half — `halo-reextraction-check.mjs` — *is* committed and is the stronger guarantee, which is why this is non-blocking.

**Observation for the next batch author, and the most useful number here: the master's priced fallback was optimistic by ~5×.** s1469 priced the hold-back at *"64 of 1,073 cells, so holding them back still cures 1,011 of 1,075"*. The actual residue is **301 cells across 15 sheets**. The gap is not runner conservatism — the strict alpha/opaque-RGB invariant caught **six older direct-output mend sheets (192 cells)** and **seven rounded-scale sheets (45 cells)** that `assets/master-divergent.json`, a 26-entry ledger, could not represent. ➡️ **The mend ledger under-records the shipped mends.** That is a finding about the *ledger*, not about the sprites, and any future re-extraction priced off `master-divergent.json` will be wrong in the same direction.

## Residue

**F-1470-4** (the renumbered runner finding) carries the 301 held cells across 15 named sheets with its own GATE: each held sheet must produce 0 sweep suspects while `halo-reextraction-check.mjs` still reports byte-identical alpha + opaque RGB and the original pocket detector reports 0 — or an attended eye accepts that sprite class under F-1464-1's existing second disjunct.
