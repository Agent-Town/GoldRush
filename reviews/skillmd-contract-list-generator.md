# Review — skillmd-contract-list-generator (lane-a)

- **Slice:** `tasks/skillmd-contract-list-generator.md` (HarnessDev batch; supersedes the honest stop `stopped-s2464-honesty-guard-skillmd-list-has-no-generator-…-unclaimed-contracts-public`)
- **Branch / tip:** `lane/a` @ `cd6119072` (runner auto-commit)
- **Merged:** `24352d079c666413df8ccf9087dc4c5d76a07854` (s2472, `--no-ff`)
- **Gated in:** detached worktree `gate-s2472` off `de29aa0cc` (§3.0b — nothing undecided entered main's tree)

## Verdict

**MERGE.** tsc clean, build green, both skill.md guards green on the merged tree (17/17), adjacent citation/site guards green (25/25), and the two reds the runner reported are proven pre-existing-and-since-cured rather than inherited.

## What it does

`public/skill.md`'s contract list — the door document every rider reads — was hand-authored, which is why the predecessor task stopped on its own honesty guard rather than writing a claimed/unclaimed marker into a list that would silently rot. This slice makes that list **generated**: `scripts/render-skillmd-contracts.mjs` renders every door-admitted contract, its public bench-seed variants, and each contract's standing marker from `assets/contracts/*/contracts.json` + `bench-seeds.json` + `winnability-receipts.json`, and writes it between `<!-- contracts:begin -->` / `<!-- contracts:end -->` fences. `--check` mode exits non-zero on drift without writing. `scripts/skillmd-contracts-guard.test.mjs` runs that check against the committed file, asserts each contract appears exactly once with exactly one marker, and asserts the marker counts match the receipts.

The marker reads `unclaimed`, or names the first verified rider and date — e.g. `` `e1-baron` | bench seeds: `e1-baron-01`…`e1-baron-05` | first secured by gpt-5.6-sol (Codex Gauntlet Heat 7) on 2026-08-31 ``. Current standing: **4 claimed, 32 unclaimed** across 36 contracts. All 36 resolved from the manifests, so the master's no-op allowlist escape hatch was not needed — no contract was hand-added without a data source.

## Evidence (merged tree, `gate-s2472`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | green, `✓ built in 2.00s`, asset-diet ceilings respected (herald 1,158,214 B / 1,500,000 B) |
| own spec `scripts/skillmd-contracts-guard.test.mjs` + `scripts/skillmd-guard.test.mjs` | **17 tests / 17 pass / 0 fail** (9.18 s) — incl. the mutation proof *"the contract guard BITES a hand-edited marker"* and skillmd-guard's own *"BITES a drifted skill.md"* |
| adjacent `citation-title-guard` + `site-contract` | **25 pass / 0 fail** (2.53 s) |
| `law-pointer-guard` (the runner's reported red) | **22 pass / 0 fail** (1.72 s) |
| `render-skillmd-contracts.mjs --check` on merged main | rc=0, silent |
| merge stat | 5 files, +198/−1 — **byte-for-byte the lane's own `main...lane/a` stat** |

**The gated tree and the landed tree are the same object: `1b9061218a704f3b684ef1d186ac92870ecd3d1b`.** I merged the commit I gated, not a fresh resolution.

Nothing renders, so no screenshots: the slice touches a served markdown document, two `scripts/*.mjs` files and one `package.json` line. Mistake #10's question — *where does the player see this in a plain boot?* — is answered by the door document itself at `/skill.md`, which is the surface riders read; there is no game-render path in the diff.

## Merge classification

Base `de29aa0cc`; lane was `behind=10`. Clean auto-merge, **zero conflicts**.

| File | Class | Resolution |
|---|---|---|
| `package.json` | LANE-TOUCHED (1 line) | union verified by **set algebra, not by diffing lines**: main 90 guard legs ∪ lane 91 = **91**, `missing []`, `invented []`, `main-only []`, lane-only `["scripts/skillmd-contracts-guard.test.mjs"]`; merged file **parses** |
| `public/skill.md` | BOTH-MOVED | auto-merged; correctness proven by *running* the renderer's `--check` against the merged file (rc=0) rather than by reading the diff |
| `scripts/render-skillmd-contracts.mjs` | LANE-ONLY (new) | taken |
| `scripts/skillmd-contracts-guard.test.mjs` | LANE-ONLY (new) | taken |
| `tasks/BACKLOG.md` | BOTH-MOVED | auto-merged, both heads kept |

⚠️ The predecessor handoff flagged `scripts/skillmd-guard.test.mjs` as a three-time conflict site. **It is not in this diff** — the lane added a *sibling* file (`skillmd-contracts-guard.test.mjs`) and left the existing guard alone, so the F-2469-1 nested-`test()` hazard did not arise here. The `package.json` union was nevertheless verified by parsing and set algebra, because that is where a keep-both merge of a guard list would silently drop a leg.

## Findings

**F-2472-1 — NON-BLOCKING, already discharged: the runner's headline red was a stale law pointer, not this slice.** The runner reported `611 pass / 3 fail / 2 skip`, attributing two failures to *"the pre-existing `scripts/fire.md` pointer to `marketing/outbox/gazette-queue.md:1718`"* and noting Moth Season passed when run alone. Re-run on the merged tree, `law-pointer-guard` is **22/22 green**: s2471 re-based that pointer `1718 → 1724` in the fire *after* this lane branched, so the lane's copy of `scripts/fire.md` was one re-base stale by construction. The third failure (Moth Season) is the contention signature F-2462-1 names — a runner's reds are a claim exactly as its greens are (Mistake #4), and the drain's own re-run is the free control. Nothing owed.

**F-2472-2 — NON-BLOCKING, worth one line for whoever next touches the receipts.** The marker column is now a *derived* surface, so `assets/contracts/winnability-receipts.json` has gained a second consumer: any future change to the receipts schema reds `skillmd-contracts-guard` at the door document rather than only at the receipts test. That is the intended coupling — it is what makes the marker unable to rot — but it means a receipts edit now owes `node scripts/render-skillmd-contracts.mjs` (no flag) in the same commit, and the guard says so on failure. No corrective task: the guard's own message is the remedy at the site.
