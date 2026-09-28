# s2725 — holds-1 drain stopped on an unmatched phone red

**READY-FOR-GATES — blocked handoff, no source landing.** WHY: F-2725-1 is a fresh candidate `secures` failure that the clean-main control does not reproduce. The control fails later, at the historical bank predicate. Calling those the same red would violate the drain gate.

## What this increment completed

Held the s2725 fire lock (claim commit `1ff7054fe`); verified launcher PID 13191 and agent 13239 own the fresh process directory. Previous s2724 handoff was clear, archived verbatim. The independent runner 25494 (PPID 1) is alive. The main-slot semaphore is the ACTIVE / not-lock-CLEARED predicate at `scripts/lane-runner-v3.sh:239`.

Read CODEX-WALL, ran `node scripts/lane-usable.mjs --all`, inspected the newest run log (holds-1, READY-FOR-GATES, 204,131 tokens, not a credit-wall stop) and the dry-board probe (one real drain, zero unknowns). The ledger explicitly left holds-1 for the fire drain; holds-2/-3 remain attended-owned dispatches. No queue, refill, re-queue, implementer call, deployment or publication occurred.

Strict policy was CLEAR before classification and the candidate merge. Nine source commits end at `67300360529086da32cf668e7fc41a9e22668d46`. Merge base `cabbffa32f64fcbcbca4d5233952a7a04d92cc3b`; cut main `1ff7054fe39b8f55b8e0c0a1cf372fde419f4496`. Classified 80 files: 75 new, five lane-touched, zero collisions with newer main, zero blobs over 50 MB. Candidate `cf9cd95c4` was created and committed in `~/.goldrush/fire-s2725/wt-holds1`, prepared with npm ci, verified clean, and linked to clean landed store main `5793a967da46e8f00c0ba16f92f17dc10d36558d`. Main never received the source merge. Candidate is retained at `save/sol-play-proofs-holds-1-s2725`; no destructive rollback or deletion.

## Evidence and new result

- TypeScript, normal build, E1 build, payload and evidence budget: rc 0. E1 **34,350,664 B**; source evidence **2,834,992 B** (run-15 alone 2,834,659 B).
- Eight source ride records independently match raw evidence; counters and screenshot presence checked. Source driver isolation passes, final SHA-256 `23a4975b439ba7fd7738968801477f59fb538d6c74fd85976ecc65a03f912aa4`. Source Flotilla/Regatta equivalence is verified retained evidence, not rerun this fire.
- Fresh adjacent/plain boots: **42/42**, plus one warmup. Desktop and 390px; eight plain boots have zero console/page errors. Candidate native: **3 pass / 3 fail**, 5.8 minutes; all six rides zero browser errors.
- **Deepwater final fix verified both screens:** three occupied pads, three moved buildings, reanchored hull and carried hero; secure wave 12 / 272.133 sim seconds / 100 HP / 40 purse; bank/Book/7,223-byte reload pass. The earlier untested panel-expansion qualification is closed. Direct wreck persistence/re-entry remains unproved: PARTIAL stays.
- **Long Road HELD:** candidate deaths wave 3 / 99.600 and 103.467 s. Clean-main same-spec control deaths waves 5/7 / 151.5 and 226.4 s. Same secure assertion fails, trajectories differ; this is a pre-existing proof hold, not a demonstrated map defect.
- **Glow Mesa:** candidate desktop banks its wave-8 ending (256.800 s, 108.2 HP, 36 purse); phone dies wave 4 / 142.800 s / 47 purse. Clean-main phone secures wave 9 / 273.3 s / 90 HP, then fails its old >=12 bank filter. **Different failure stages; root cause UNVERIFIED.** The earlier lane phone win is retained as historical evidence, not a substitute for this failed fresh gate.

The clean-main control uses a separately npm-ci-prepared clean arena at the same exact main cut, same warmed port 5317, serial servers and `--workers=1`. Every own server was stopped by its recorded PID using SIGTERM. Browser logs, raw-equivalent compact records, control comparison, and restored-file inventory are all in this directory. Regenerated tracked evidence was copied before path-scoped restoration. No assertion, timeout or source change was made by this fire.

## Gate disposition and correction

`reviews/sol-play-proofs-holds-1.md` records **F-2725-1, blocking**. The source goal is `blocked` / `gate-side` with no mergeHash. The original done-move and lane remain intact. `tasks/gr-glow-mesa-proof-attribution-1.md` is AUTHORED ONLY with its planned goal leaf and ledger row in the same checkpoint: a maximum of two paired phone trials, exact entry/runtime identity, immutable source/assertions, evidence only, attended-owned scratch dispatch. No owner decision or balance change was invented.

The drain stops at the unmatched browser red. Diff-selected guards and the full Node battery are **NOT RUN** on this rejected candidate; the prepared next-step script was never started. No engine pin was measured or minted. The landed registry is still era 6 pin 71; no engine/runtime input changed. No Gazette item or deploy is due from a rejected test-driver candidate.

The applicable `/drain` instruction is: “Any NEW red (not in the control) fails the drain”. The skill is `.claude/skills/drain/SKILL.md`; `/author-task` was used for the corrective. The user's no-delete retention rule takes precedence over removing new candidate evidence through a literal detached merge revert: content remains saved and outside main.

## Rechecked duties and inherited claims

Health: landing/game/API 200; runner alive; zero queued or in-flight tasks, zero pending crafting orders, no staged art. Lane-a/b/d absorbed; lane-c has the nine unmerged holds-1 commits. This is not a dry-board claim.

LB-01 **35/35 days**, August 24 through September 27, outside the public tree. Private archive heads still match the previous duty: ledger-backups `9e4c2a9d4e5840189ac9ba79366814adba2c57cc`; fire-memory `53d87470fb2670626fb4605d4dc0eb5bffd899fb`. Next coverage duty is September 28 after **02:10 UTC**, not yet due. September 27 ticker exists. Week 40 opens September 28 in the registry, and skill.md guard **19/19** passes. No new weekly mint due before Wednesday. No pending assayer order.

Previous s2724 source landing remains on main; its full Node result is inherited receipt evidence, not rerun. The pending holds-1 ready claim was rechecked and is now blocked by this fire's measured red. All three Owner's Desk items remain verbatim: account-registry deploy day, device verdict rows, token revocation. No new desk decision.

## Remaining list in order

1. Attended dispatch and review of `gr-glow-mesa-proof-attribution-1`; the queued source is not retried by a fire.
2. Lift/re-register holds-1 only with exact-stage attribution or a separately authorized correction; synchronize and re-run all required gates before source landing, then full main Node.
3. Holds-2/-3 remain attended-owned after their predecessor lands. Long Road native route and Deepwater direct wreck persistence remain honest open proof work.
4. LB-01/FM-01 next after 02:10 UTC; news publication remains owner-only.

Checkpoint, final ledger verdict and lock-clearing commit are recorded below after verification. No further source drain is attempted.
