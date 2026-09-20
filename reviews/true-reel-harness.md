# Review — true-reel-harness (EH-2)

**Slice:** `true-reel-harness` (EH-2 of the EMBODIED HAND program, `specs/embodied-hand.md`)
**Branch:** `lane/d` · **lane tip:** `7715cefda` (`runner(lane-d): true-reel-harness.md`, 2026-08-30T15:02:52+07:00)
**Merge-base:** `f260fbbf8` · **Gated commit:** `4e71c4aaa` (parents `fba62e48f` = main head, `7715cefda` = lane tip)
**Merged as:** `c845e67245c3db20e695696999d9b3a47a2a81a6` (s2369) · **Gated by:** fire s2368, in a detached worktree (`gate-s2368`) per §3.0b — undecided content never entered main's working tree.

## VERDICT: MERGE — the slice answered its research question in the affirmative, and answered it again drain-side.

## What it does

The Lantern Show approximates agent reels through the interactive world, which is proven-divergent; the owner watched the era-3 crown reel and called it fake (F-SHOW-0830). EH-2 is the foundation of the cure: it makes the county's **own** replay — the one the assayer trusts — run in a browser and reproduce the tape's event-log hash there.

It extracts the replay boot+step logic that `scripts/assay-replay-agent.mjs` already used into a shared `src/replay/AgentTapeReplay.ts`, consumed by **both** the node assayer (via Vite SSR) and a debug-gated browser module worker. That is Law 2 of the spec — *one replay implementation, two hosts, never a second engine* — satisfied structurally rather than by assertion. Player-facing rendering is deliberately **not** here; it is EH-3's ground.

The research risk the master named was node-vs-browser float drift, with an honest STOP shape prescribed if the hash failed to reproduce. It reproduced.

## Evidence — measured on the merged tree, in the gate worktree

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0, clean** (19.5s) |
| `npm run build` | **rc=0, green** (54.8s); asset-diet ceilings respected (herald 1,158,214 B of 1,500,000 B) |
| `e2e/true-reel-harness.spec.ts` `--workers=1` | **2/2 passed**, desktop + 390px mobile (18.2s) |
| — its central assertion | `claimed = node = browser = fnv1a32:a45ba9ac` on **both** projects |
| — browser replay wall time | desktop **1,783 ms**, mobile **1,704 ms** (EH-3's playback budget) |
| `e2e/task-025-bandits-dont-swim` + `e2e/m1-01-claim-jumpers-death` `--workers=1` | **18/18 passed**, both projects (101.9s) |
| `npm run test:node-guards` (sim-touching, §3) | see **Battery** below |

**The hash triple is the deliverable and it was re-derived here, not inherited.** The runner claimed `fnv1a32:a45ba9ac`; this gate reproduced it independently on the merged tree, on two projects, with the browser figure computed in a real worker.

**A correction to the runner's own headline, in the slice's favour.** The report read *"`task-025` + `m1-01`: 16/18 combined due two contention timeouts; both timed-out cases passed unchanged when rerun individually."* Re-run drain-side at `--workers=1` (§3.1 — a correctness requirement in the fire shell, not an optimisation), the same two specs are **18/18 in one run**. The runner's reds were its shell's, not the slice's. This is the drain's own re-run working as the free control on the runner's headline.

## Merge classification

Purely **additive**; no conflicts, no 3-way graft.

- **LANE-TOUCHED:** 10 files.
- **MAIN-MOVED since the merge-base:** 7 files.
- **Overlap: NONE.** Not one path this slice touches was moved by main since `f260fbbf8`, so every file is LANE-TOUCHED-ONLY and there was nothing to resolve.

| File | Class |
|---|---|
| `src/replay/AgentTapeReplay.ts` | new — the shared core (the seam) |
| `src/replay/BrowserAgentTapeHarness.ts`, `BrowserAgentTapeWorker.ts`, `harness.html` | new — the `?debug`-gated browser host |
| `e2e/true-reel-harness.spec.ts` | new — the gate |
| `artifacts/eh2-fixture/{tape.json,gr-sim.stdout.jsonl,gr-sim.stderr.txt}` | new — the minted fixture + its gr-sim stdout |
| `scripts/assay-replay-agent.mjs` | import-seam refactor (−124 lines), behaviour identical |
| `src/sim/HeadlessContractSim.ts` | +5 — one read-only `replayTick` getter |

Firewall honoured exactly: no `src/ui/**`, no `src/game/Game.ts`, no LanternShow (EH-3's ground), no `src/agent/StandingOrders.ts` (EH-1 owns it this window — the zero-overlap law between the two live slices held).

## Findings

### F-2368-2 — `engine-era-guard` is red on main, and this merge does not cause it, cure it, or worsen it. NOT a blocker; gated on a DIFFERENTIAL.

The runner reported honestly: *"`engine-era-guard` remains red because this engine-source change requires the EH-1-owned era rotation and its script-location pin update; left untouched under the zero-overlap firewall."* That is a **firewall success**, not a defect — a runner reporting an adjacent problem instead of fixing it is exactly the prescribed behaviour.

**Measured, not inherited.** The guard was run on **main itself, before any merge of mine**: it is **already RED** —
`engine hash changed from 8a0559cd93fe… to 57bf39f4c4fb…; bump era, name it, note what changed -- in the same commit`.

The cause is structural and pre-existing: `ENGINE_SOURCE_INPUTS` hashes the whole of `src`, plus `package.json`/`package-lock.json`/`tsconfig.json`/`vite.config.ts`/`scripts/assay-replay-agent.mjs`/several `assets/` trees. The era-3 hash was seeded on **2026-08-25** (`ef9038425`, *"re-seed the era-3 hash on the merged tree"*) and `src/` has moved many times since. So main has been red on this guard since well before this slice existed.

**It is a known, ledger-recorded, in-flight item.** `tasks/BACKLOG.md:1` (F-PARITY-0830) states that EH-1 carries *"era 4 'the Embodied Hand' via the era guard's own same-commit demand"*, and EH-1 was still executing on lane-b while this gate ran.

**Therefore the correct gate here is a differential, not an absolute** (the house rule for a battery that is already red): red before, red after, same single assertion, nothing new. This merge changes `src/`, so it moves the *actual* hash again — but it does not change the guard's verdict, and it cannot: only an era bump can, and that bump is EH-1's by declared ownership.

**Sequencing note for whoever lands EH-1 — this is the load-bearing part.** The house pattern (`ef9038425`) re-seeds the era hash **on the merged tree**. EH-1's era-4 seed must therefore be taken on a tree that **already contains EH-2**, or it will be stale the moment this merge lands. Landing EH-2 first, as done here, is what makes EH-1's seed correct. If EH-1 lands first, its era-4 hash must be re-seeded after this merge.

### F-2368-1 — the banked em-dash master's pre-flight judged lane safety by a two-dot tree diff (cured this fire, pre-dispatch)

Filed and fixed while preparing an unrelated dispatch; recorded here because it is the same class of defect this factory keeps paying for. See the em-dash master's pre-flight and the fire's handoff.

### Non-blocking observations

- **Contention during the battery is declared, not hidden.** EH-1 was executing on lane-b throughout this gate. Load moves timing margins (the documented mechanism), so any timing-sensitive red had to be attributed by measurement rather than argument. See Battery.
- **The worker-bundling defect the runner self-caught** (*"Independent review caught a production worker-bundling defect; fixed and verified as a compiled Vite worker chunk"*) is confirmed cured by the green production `npm run build` above — a dev-only worker would not survive it.

## Battery

`npm run test:node-guards` on the merged tree (`4e71c4aaa`, in the `gate-s2368` worktree, fire shell, file concurrency 1) — **rc=1, 696.7 s, FIVE failing assertions.**

⚠️ **s2368 wrote "result recorded below" and died before recording it (its `FIRE END rc=0` landed 15:17:16 with the lock still ACTIVE). s2369 ran the battery and completed this section. The result matters, because the differential this review argues for above was scoped to ONE assertion and the battery actually reds FIVE** — so merging on the stated premise would have shipped past four unexamined reds. Each is attributed below **by measurement on main, pre-merge**, not by argument.

| # | Red | Attribution | Evidence |
|---|---|---|---|
| 1 | `engine-era-guard` — *the landed registry names the live engine and stays outside its hash corpus* | **PRE-EXISTING on main.** Not caused, not cured, not worsened. | Run on main pre-merge: red, `8a0559cd93fe… → 57bf39f4c4fb…`. On the merged tree: red, `8a0559cd93fe… → 3671a90965 2c…`. Same test, same single assertion, same failure mode. The *actual* hash moves because this slice changes `src/` — as any `src/` change does — but the **verdict** does not, and only an era bump can change it. That bump is EH-1's by declared ownership (F-2368-2 above). |
| 2 | `fixture-teardown` — *all 103 `scripts/*.test.mjs` fixture owners remove their temp directories* | **PRE-EXISTING on main.** Structurally impossible for this slice to cause. | Failing subject is `scripts/edge-alarm-clock-guard.test.mjs` (*"calls mkdtemp but yielded 0 extractable literal prefixes"*), landed on main by `9f53794ae` (F-2356-1). **This slice adds zero `scripts/*.test.mjs` files** — its only `scripts/` touch is `assay-replay-agent.mjs`, not a test file — so the guard's corpus is identical either side of the merge. Confirmed by running the leg on main pre-merge: **rc=1, 123.2 s, same red, same subject, same 103-file corpus** — assertion text byte-identical. |
| 3–5 | `site-contract` ×3 — *every local `<script src>` … exists* · *each loaded script parses…* · *every local href/src resolves…* | **PRE-EXISTING on main.** Not caused. | All three fail on one cause: `index.html loads "assay-office.js?v=county-2" but site/assay-office.js?v=county-2 does not exist` — the guard does not strip the cache-busting query string added by `eb152d4a7`. **This slice touches nothing under `site/`.** Run on main pre-merge: the same three tests red with byte-identical assertion text and the same resolved path. |

**Conclusion: the battery is red on main and red on the merged tree, with the same five assertions and the same five causes. The differential is clean — this merge introduces no new red.** Reds 2–5 are pre-existing main debt, filed as **F-2369-1** (site-contract query-string blindness) and **F-2369-2** (fixture-teardown's prefix extractor vs `edge-alarm-clock-guard`); neither blocks this slice and neither is this slice's to fix under its firewall.
