# Review — f2141-1-canyon-census-run-3 (Canyon Works census, attempt 3)

**Slice:** `f2141-1-canyon-census-run-3` · **Branch:** `lane/d` · **Tip:** `34d2b5ee5` · **Merged:** `14e50ea3aa84cb1500dce5897543e04d992485e2`
**Fire:** s2141 · **Date:** 2026-08-21 · **Authored AND drained by the same fire** (see F-2141-2 below — that is not free)

## Verdict

**MERGE — accepted as a Law 2 STOP that produced a real, deterministic, independently reproduced result.**

The census still reports **no wave-6 deadline margin**, but for a materially different and sharper reason than either predecessor: **the leg never survives to the deadline.** Both sanctioned runs terminated at `e3-canyon-works ended unsecured at wave 2.` — four waves before the `byWave: 6` connect deadline could latch `failed`. The last observed state was `powered 0 / required 2` during wave 1.

This is the third attempt and the first to produce a number. Attempt 1 (s2086) could not select the contract; attempt 2 (s2135) could not read the trace. **Attempt 3 read the trace and the trace says the run dies early.**

## What it does

Re-runs the sanctioned Canyon Works census now that `f2138-1` (`cd59fb273`) publishes `canyonConnect` onto the agent view. It adds no product code: 8 files, 491 insertions, **all additive**, entirely under `artifacts/f2135-canyon-census/**` plus the two banked scripts that main had never seen.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc 0**, 9.8 s |
| `npm run build` (merged tree) | **rc 0**, 32.9 s, `✓ built in 2.64s` |
| Runner run-1 / run-2 traces | 10 rows each, `identical: true` |
| **Drain's own independent control run** | **10 rows, BYTE-IDENTICAL to both** |
| Control harness exception | `Error: e3-canyon-works ended unsecured at wave 2.` — verbatim match, at `gr-sim-campaign.mjs:113` |
| Waves observed | `0, 1` only |
| `powered/required` across all rows | `0/2`, `complete:false`, `failed:false` throughout |
| Firewall | run commit `34d2b5ee5` touches **only** `artifacts/f2135-canyon-census/**` (6 files); **both banked scripts byte-identical** to `91e8b5e23` |
| Contract byte-unchanged | `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` silent |

⭐ **The control is the load-bearing evidence here, not the runner's own determinism claim.** A run that reports "my two runs agree" is asserting determinism with itself as the only witness. This drain re-ran the census a **third** time, in a detached worktree, at a different output path, and got a byte-identical 10-row trace and the same verbatim exception. That is what makes the wave-2 termination a fact about the sim rather than a fact about one process.

## Merge classification

Base `e753f66f0`. All 8 paths **LANE-ONLY** — `git diff <base>..main` over each is empty, so main moved none of them and no graft was possible. `merge-tree` clean before merging; `main..lane/d` **empty** after. Merged `--no-ff` and committed as one act (never left staged — F-1589-5).

## Findings

**F-2141-1 (the slice's own, non-blocking, NOT a defect): the Canyon Works route terminates at wave 2, so the wave-6 connect deadline is not the binding constraint — and nobody had established that.** Every prior artifact in this thread, including both predecessor masters, framed the open question as *"can the six-beacon 330 g chain beat `byWave: 6`?"*. The measured answer is that the question does not arise on this seed under this player: the leg ends unsecured four waves earlier, at `0/2` powered. ⚠️ **This does NOT mean the deadline is meetable or unmeetable — it means the census still has not measured it**, and the honest next question is *why does the leg end at wave 2* (loss condition? the unproved route?), not *what is the margin*. ⓘ The player was **not** changed to survive longer, correctly: the firewall forbade inventing a routing policy to manufacture a number, and the report says so explicitly.

**F-2141-2 (fire-side, process, non-blocking — RENUMBERED FROM F-2141-1, see below): a pinned guard shipped WITH a cure may construct its subject at a parameterisation the consumer never uses.** `scripts/canyon-connect-view.test.mjs` builds with `admissionProbe: true`; the census, via `gr-sim-campaign.mjs`, builds **without** it. Measured before authoring at three parameterisations — present with the probe, without it, and on seed `-02` — so benign here, but the guard's green never said so. The mirror of the house's standing *refuted-at-one-parameterisation* hazard, and more dangerous because a green invites no further questions.

**F-2141-3 (process, filed against myself): authoring and draining in the same fire minted an F-ID collision, exactly as the ledger warns.** I filed the parameterisation finding as **F-2141-1** in `tasks/BACKLOG.md` at 21:04; the runner independently titled its report **`# F-2141-1 — Canyon Works route terminates before the connection deadline`** minutes later, having derived the id from the task name. Two different findings, one id, neither author aware of the other. **Resolved by renumbering MINE to F-2141-2 and leaving the merged artifact's id intact** — the report is landed evidence and renaming it would edit history to protect a younger claim. ⓘ The archived s2141 handoff line-1 still says `F-2141-1` for the parameterisation finding; that archive is **restated, not rewritten** (Retention Law), and this file is the reconciliation.

## What is NOT established (carried from the report, unchanged)

- No completion wave and **no powered-at-deadline margin** — the run ends before `wave > 6` can latch.
- **GATE C stands:** the harness always selects `benchSeeds[contract.id][0]`, so `e3-canyon-works-02` remains unmeasurable through the sanctioned instrument.
- No secured leg, no leg/event-log hash (GATE B throws before those are written).
- No reachability verdict and no balance recommendation — **the owner's fork remains reserved and untouched.**
