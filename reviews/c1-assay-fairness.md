# c1-assay-fairness — the county stops charging riders for its own crashes

- **Slice:** `c1-assay-fairness` (F-ASSAY-E2E-9 + F-ASSAY-E2E-10)
- **Branch / tip:** `lane/d` @ `eaff1ee97` (single runner commit)
- **Base:** `8a4cdb96fe80dee21e82bcd43a43715b8ad5fdc5 (archive: pruned by the A3 rewrite)`
- **Merge:** `72c73905c1acc7186431f0bf5d018920c45a39f1` (main)
- **Drained by:** s2166 fire, 2026-08-22
- **Verdict:** ✅ **MERGED** — gates green on the merged tree, including the full `test:node-guards` the runner could not make green.

## What it does

Two live defects from the round-2 public assay, both recorded with exhibits.

**⑨ The unassayable state.** The worker used to post `rejected` whenever anything threw — so an operator `SIGTERM` (`exited 143`), the droplet's ENOSPC crash, or a timeout charged the *rider* with a false claim for the county's own infrastructure failure. The worker now separates an INSTRUMENT failure (anything thrown before a valid hash was produced) from an honest MISMATCH (a replay that completed and disagreed). Instrument failures retry — `ASSAY_MAX_ATTEMPTS`, default 3, backoff `initialBackoffMs` doubling to `ASSAY_BACKOFF_MAX_MS` — and only on exhaustion post a reasoned `unassayable`. Completed mismatches stay `rejected`, unchanged. An `unassayable` row keeps its tape, leaves the pending queue, is **not** ranked, serves its reason honestly on the slip, and can be flipped back to `pending` for a clean re-assay with a fresh attempt budget. Shutdown mid-replay leaves the row `pending` rather than inventing a verdict.

**⑩ The id collision.** Tape ids derived from `(contract, seed, difficulty, eventLogHash)`, so two identical deterministic runs collided — both round-2 probe rows carry `agent-a7999390`, and `?verdict=` resolved first-match, making the older slip permanently unreachable. Ids now carry a recording-time `randomUUID()`; `inputLog.name` keeps the stable content hash, so **two identical runs remain byte-identical except the top-level `id` field**. The lookup at `functions/api/standings.ts:363` was already exact-match on the full id, so uniqueness alone closes the defect — and the new test proves a collision *prefix* does not resolve.

The validator **tightens** rather than loosens (the master's standing prohibition): `unassayable` is refused without a reason, refused with a `replayedHash`, and `validateStoredRow` rejects a stored `unassayable` row that carries an `assayHash` or lacks `assayedAt`/`assayReason`.

## Evidence — all on the MERGED tree, in a detached `gate-s2166` worktree (§3.0b)

Nothing undecided ever entered main's working tree or index; main's tree carried zero slice content until the merge, which was made and committed as one act (F-1589-5).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.11 s** |
| `assay-worker` + `agent-reels` + `assay-replay` (own suites) | **9 pass / 0 fail**, 30.8 s |
| `scripts/test-standings.mjs` | **78 checks passed** |
| `scripts/test-stats.mjs` | **87 checks passed** |
| `scripts/test-accounts.mjs` | **43 checks passed** |
| `worker-type-coverage` + `function-cors-allowlist` + `site-contract` | **10 pass / 0 fail** |
| `gr-sim.test.mjs` **run ALONE** | **20 tests · 18 pass · 0 fail · 2 skipped · 265.8 s** — determinism pins unmoved |
| **full `npm run test:node-guards`** | **rc=0 · 503 tests · 498 pass · 0 fail · 5 skipped · 529.8 s** |

**Boot probe deliberately not run, and why:** the diff touches **zero `src/` files** (7 files: `functions/api/standings.ts`, five `scripts/*.mjs`, one BACKLOG row). No client bundle behaviour changes, so a desktop/390px console probe would be vacuous rather than evidence. Mistake #10's question — *where does the PLAYER see this?* — answers honestly: they do not; this is the county's verdict pipeline, and its player-facing surface is the slip served by `?verdict=`, which `test-standings` exercises at the API level (78 checks, including the unassayable slip's reason, absent hash, and `ranked:false`).

## Merge classification

Main moved **none** of the six code files since the base — `git log 8a4cdb96f (archive: pruned by the A3 rewrite)..main -- <the six>` is empty — so all six are **LANE-TOUCHED**, no graft required. `tasks/BACKLOG.md` is **BOTH-MOVED** (main gained the s2165 F-2165-1 row and the lane-b `bbb9ff57c` merge; the lane prepended its own delivery row). Both sides prepend at line 1; git's `ort` auto-merged cleanly, keeping both, verified in the gate worktree before the real merge.

## Findings

**F-2166-1 — the runner's "node-guards not green" was contention, not the slice (NON-BLOCKING, closed by this drain).** The runner reported *"Node guards reached 492 passing tests but were not green: local Node is 23.11.1 while `.nvmrc` requires 26.4.0 … Full `gr-sim` had one 90s timeout; that exact test passed alone in 61.1s."* Re-run **alone** in the fire shell (node v26.4.0) on the merged tree, the full battery is **rc=0, 0 fail**, and `gr-sim` alone is **0 fail in 265.8 s**. This is exactly the F-2076-1 / F-2099-1 load class — the lane shell's per-file timeout bound, not a defect — and the drain's own re-run is the free control on the runner's headline. Nothing was re-pinned. *No action owed.*

**F-2166-2 — the battery's cost figures have drifted again, third time running (INFORMATIONAL, for whoever next cites them).** `scripts/fire.md` §3 carries F-2099-1's measurement of **472 tests / 404.7 s**. Measured here on the merged tree, fire shell, run alone: **503 tests / 529.8 s wall** (`duration_ms 529821`). The sequence is now **284 → 363 → 424 → 472 → 503 tests** and **55.6 → 181.3 → 280.9 → 404.7 → 529.8 s**. The clause predicts exactly this (*"expect it to be re-taken again, not treated as final"*) — it is ~9 minutes serial now, not seven. Restated, not deleted, per the Retention Law. *Recorded for the next fire that budgets this duty; no cure owed.*

**F-2166-3 — a legacy v1 tape's verdict moves `rejected` → `unassayable` on any RE-assay (NON-BLOCKING, latent, named for the record).** The master's classification rule is broad by construction — *"any exception before a hash was produced"* is INSTRUMENT — so a v1 or malformed tape, which throws `legacy tape v1 is unverifiable` before any hash, now retries three times and posts `unassayable` rather than `rejected`. The runner updated `test-standings.mjs:228` deliberately to match. This is **within spec and arguably more honest** (an unreadable legacy tape is not a rider's lie either), and ranking is unaffected — `isRankedRow` excludes `unassayable` exactly as it excluded `rejected`. ⚠️ The reason it is worth naming: the live BACKLOG record states *"The round-1 probe row REMAINS rejected on the season-2 board as the honest v1-legacy record."* Stored rows are **not** rewritten retroactively, so that record stands today; but if that row is ever flipped to `pending` for a re-assay, it will come back `unassayable`, and the public record will differ from the sentence describing it. Cost of the retry path on a permanently-malformed tape is one-time (the row leaves the queue on the terminal verdict), but with `ASSAY_BACKOFF_INITIAL_MS` defaulting to `pollMs` (15 s) it spends ~45 s before conceding. *No corrective queued — this is a judgement for whoever owns the season-2 board narrative, not a defect.*

## Firewall compliance

Touched exactly the permitted set: `scripts/assay-worker.mjs`, `scripts/gr-sim.mjs` (id minting only), `functions/api/standings.ts` (verdict vocabulary + slip resolution), their three tests, and the BACKLOG row. No sim semantics, no tape CONTENT change beyond the `id` field, no ranked-board change for verified rows. The master's honesty guard (*"if the verdict vocabulary change breaks a consumer you can't see, STOP and name it"*) was checked independently: `unassayable` appears only in the worker, the endpoint, and their tests, and **no client-side code narrows on the standings `assay` field** — the `src/` matches for "assay" are all the in-game crafting bench and its CSS, an unrelated surface.
