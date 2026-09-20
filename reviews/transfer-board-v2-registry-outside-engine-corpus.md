# transfer-board-v2-registry-outside-engine-corpus — s2473 drain

**Slice:** `tasks/transfer-board-v2-registry-outside-engine-corpus.md` (FIRE-AUTHORED s2472)
**Branch/tip:** `lane/b` @ `b7a1d13a6` (built on its predecessor `19c2e9f12`, BUILD-ON-PREDECESSOR opt-in honoured)
**Merged:** `e1753192fc561fb98a14456d7cf97eebd54d79e8` (code) + `5d9d5c5dd119a2f9baed27de7f30fc8557cd2da1` (F-2472-5 allowlist)
**Gated in:** detached `gate-s2473` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGED

Both the v2 corrective and the predecessor implementation it extends. The gate-side hold F-2472-3 on
`transfer-board` is **satisfied and lifted in the drain's own bookkeeping commit**, per §3.0's rule that a
`gate-side` leaf and its merge move together.

## What it does

The county gains a **transfer board**: a weekly rotation seed — a fresh instance of an existing contract,
published when its window opens — shown on the landing beside a generalization cell. The door accepts that
seed only from `opensAt` through the instant before `closesAt` and otherwise returns HTTP 403
`rotation_closed`. The ratio is shown and never ranked. Registry minted deterministically by
`scripts/rotation-mint.mjs --week <w> --salt-file <path outside the repo>`; the salt is never committed.

The v2 corrective is the part that makes this **lawful**: it relocates the registry from
`assets/contracts/rotation-seeds.json` to `assets/rotations/rotation-seeds.json` and repoints its five
readers, because `assets/contracts` is a **whole-directory entry** in `ENGINE_SOURCE_INPUTS`
(`scripts/assay-replay-agent.mjs:38`) and `collectEngineFiles` recurses it collecting every `.json`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (rc=0, no output) |
| `npm run build` | green, `built in 1.88s`, asset-diet ceilings respected |
| `e2e/transfer-board.spec.ts` | **2/2**, desktop-chrome + mobile-chrome, `--workers=1` (§3.1), 50.0s |
| console/page errors | **zero** — the spec collects `console[type=error]` + `pageerror` and asserts `[]` (`:38`) |
| `scripts/bench-seeds.test.mjs` | **4/4**, incl. the new corpus guard |
| skillmd + skillmd-contracts + engine-era + site-contract + assay-replay | **35/35, 0 fail** (122.4 s) |
| `node scripts/test-standings.mjs` | green — **223 KV + 223 SQLite** assay checks |
| screenshots (merged, tracked) | `reviews/shots-transfer-board/desktop-chrome-transfer-board.png` · `reviews/shots-transfer-board/mobile-chrome-transfer-board.png` |
| `scripts/deploy-mirror-allowlist.test.mjs` | RED 0/1 → **GREEN 1/1** after the F-2472-5 entry |

### The engine hash — the claim the whole corrective rests on, measured here, not inherited

| Tree | `computeEngineHash()` | `assets/engine-era.json` (era 5) | equal |
|---|---|---|---|
| `main` (control) | `2a06eb514e3037ef…a5aecd47` | `2a06eb514e3037ef…a5aecd47` | ✅ |
| merged (`gate-s2473`) | `2a06eb514e3037ef…a5aecd47` | `2a06eb514e3037ef…a5aecd47` | ✅ |

**Byte-identical to base.** No existing verified reel is refused `reel_not_current`, no era bump, no re-pin,
no owner ruling about what "the engine" is — which is exactly what spec law **L1 ADDITIVE** requires
(*"existing tapes, seeds, eras and ranking are untouched"*).

⚠️ **The runner's absolute hashes are its lane's, not main's.** Its report quotes `826b8227…` before and
`8ccbfe16…` after/declared. Those are honest **for `worktrees/lane-b`**, which sits ~13 commits behind; its
*relative* claim (relocation restores the hash to the declaration) is what transfers, and it reproduces on
main. An inherited absolute hash is a fact about the tree that produced it — re-measure it where you intend
to merge.

### The new guard derives its corpus rather than transcribing it

`bench-seeds.test.mjs` imports `ENGINE_SOURCE_INPUTS` and `computeEngineHash` from
`scripts/assay-replay-agent.mjs`, walks every directory entry, and asserts (a) no `rotation-seeds.json`
lives beneath one and (b) the computed hash equals the declared one. So a future fire that moves the
registry back, or adds a second one anywhere in the corpus, reds — and a rename of the corpus list cannot
silently orphan the guard. **Mutation proof (runner, re-read in the log):** registry copied into
`assets/contracts/` → RED `rc=1` naming `assets/contracts/rotation-seeds.json`; removed → GREEN 1/1.

## Merge classification

Base `d6751b1fb`. 15 files. Auto-merged clean except **`tasks/BACKLOG.md`** (`UU`), a pure ledger-append
conflict — both sides prepended rows. Resolved as a **union verified by row count, not by a line diff**:
main 6 rows ∪ lane 2 rows = 8, and each of the 8 asserted present in the result before the resolution was
believed. Zero markers left.

The two known repeat-conflict sites auto-merged, and were checked by **parsing** (F-2469-1 / F-2472-4):

- `scripts/skillmd-guard.test.mjs` — top-level `test(` titles by set algebra: main 14 ∪ lane 14 = **15**,
  merged **15**, `missing []`, `invented []`, no duplicates.
- `public/skill.md` — the new `## ROTATION` section sits at `:345`, **outside** the generated fences at
  `:379–:461`, so `skillmd-contracts-guard` is unaffected (it is green above).

⚠️ *Method note, paid for in this fire:* my first fence probe reported `fences 3..3` and would have scored
the section "outside" for the wrong reason — line 3 is a **prose comment naming both markers**, not a fence.
A selector wider than its question can return the right verdict from the wrong evidence; the real fences
were found by reading. This is the same shape as every empty-corpus finding in this streak, wearing a
"correct answer" costume.

## Findings

### F-2472-5 — CLOSED IN THIS DRAIN (the runner's honest stop was right, and the cure is one line)

The runner returned **NOT READY-FOR-GATES** rather than merging: `functions/api/standings.ts` imports the
relocated registry, so the ledger service gained a runtime dependency that `scripts/deploy.sh`'s **positive**
mirror allowlist did not ship, and a normal deploy would restart `goldrush-ledger` without a required
import. **That is a firewall success, not a failure** — the fix lay outside its TOUCH-ONLY list, so it
measured, reported and stopped.

Verified here as a differential rather than inherited: `deploy-mirror-allowlist.test.mjs` is **GREEN on
main** (1/1, printing its `2348` file closure — so the control asserted its own validity, F-2215-1) and
**RED on the merged tree** (0/1), naming exactly `assets/rotations/rotation-seeds.json`. Single variable.

Cured by the act the **DEPLOY MIRROR LAW** names verbatim — *extend the allowlist, never add an exclude* —
as one entry in the `***` form of its `assets/contracts` sibling. The guard **derives** the runtime closure
from real import graphs, so it named the needed file itself and then verified the fix: closure
**2348 → 2349**, i.e. exactly one file, with the decoy assertions (`e9-review-video`, `gate-t99`,
`assets/raw/x.png`, `junk.bin`) still refusing. **The count is the control against an over-broad glob**, and
it is why this landed as its own commit rather than being folded into the merge.

### F-2473-1 — NON-BLOCKING, owner-facing: the first rotation window is unminted and its salt is owner-held

`assets/rotations/rotation-seeds.json` ships the `r2026w37` registry the lane minted for its own tests, and
`site/assay-office.js` pins `CURRENT_ROTATION_ID = 'r2026w37'`. Minting a *real* rotation needs
`--salt-file <path outside the repo>`, which by design no fire holds and nothing in the repo may carry. So
the board renders and the door windows correctly, but **the standing rotation is a test-minted one until an
owner (or an attended session with the salt) mints the live week**. Nothing is broken and nothing is
misreported to a player; this is a scheduling duty, not a defect. The fire mint duty lands in `fire.md`
attended, per the ratified spec — that step is still owed and is not mine to take.

## Retention

Lane `lane/b` archived at `archive/lane-b-s2473-transfer-board-v2-<sha>` before any refresh; the predecessor
done-move is renamed, not deleted, and its `held-…` fossil is superseded by the ledger (F-1669-1: the
filename is a snapshot of a claim, the leaf is the claim).
