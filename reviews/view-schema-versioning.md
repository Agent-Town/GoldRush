# view-schema-versioning — GATED GREEN, MERGE DEFERRED (a live main-slot runner holds the tree)

- **Slice:** `view-schema-versioning` (lane-b)
- **Branch / tip:** `lane/b` @ `3eacc81c3` (runner auto-commit)
- **Base:** `6e592ca13` (merge-base with main); lane was 13 behind main at gate time
- **Gated commit:** `cf1e10a21` — preserved as branch **`save/view-schema-gated-s2458`**
- **Gate worktree:** detached, `gate-s2458` (§3.0b), removed after this review
- **Drained by:** s2458

## VERDICT

**GREEN on evidence — NOT MERGED THIS FIRE.** Every gate passes on the merged tree. The merge is
blocked by tree contention, not by the slice: the **main slot is held by a live runner**
(`main--20260902-223733-watchdog-self-check.md`, pid 71704 confirmed ALIVE via `process.kill(pid,0)`)
whose uncommitted `package.json` edit touches **the same `test:node-guards` line** this slice edits.
Merging would have stomped a running task's work (Mistake #2 / #3). The next fire merges
`save/view-schema-gated-s2458` once main frees — see **Merge instructions** below.

## What it does

`buildView` now emits a numeric `viewVersion`, and `assets/engine-era.json` gains a `viewSchema`
block holding the version plus a sorted **75-path** field baseline. A new guard
(`scripts/view-schema-guard.test.mjs`) makes the view **additive-only**: a removed or renamed field
reds unconditionally; an added field passes only if the version was bumped in the same change.
Tapes carry `viewVersion` in their meta, and every validator on the path — `RunTape.ts`,
`AgentTapeReplay.ts`, `LanternShow.ts`, `functions/api/standings.ts` — accepts it as **optional**,
so legacy tapes without the field remain valid as version 1.

This is **observation surface only**. Nothing in `src/sim/`, `src/systems/`, `src/entities/` or
`Balance` is touched; no ranking, scoring or simulation path changes.

## Evidence (measured on the merged tree, in a detached worktree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 20.3 s |
| `npm run build` | **rc=0**, 153.0 s (asset-diet ceiling respected: herald 1,158,214 / 1,500,000 B) |
| `scripts/view-schema-guard.test.mjs` | **3 tests / 3 pass / 0 fail** |
| `scripts/engine-era-guard.test.mjs` | **5 tests / 5 pass / 0 fail** (after the pin append — see below) |
| `scripts/assay-replay.test.mjs` | 5 / 5 pass, 269.4 s |
| `scripts/assay-worker.test.mjs` | 10 / 10 pass, 5.8 s |
| `scripts/agent-reels.test.mjs` | 1 / 1 pass, 17.3 s |
| `scripts/agent-seat.test.mjs` | 6 / 6 pass, 17.7 s |
| `scripts/skillmd-guard.test.mjs` | 7 / 7 pass, 14.7 s |
| `scripts/site-contract.test.mjs` | 7 / 7 pass, 0.9 s |
| `scripts/worker-type-coverage.test.mjs` | 1 / 1 pass, 30.1 s |
| `scripts/deploy-mirror-allowlist.test.mjs` | 1 / 1 pass, 4.2 s |
| **Adjacent total** | **46 tests, 46 pass, 0 fail** |
| Console / page errors | **N/A** — no rendered surface changes; the UI edit is a type widening in `LanternShow.ts` |

`test:node-guards` is **not path-mandated** here and I say why rather than implying it (F-1460-1):
the diff touches no `src/sim`, `src/systems` or `src/entities`. The one guard the change genuinely
implicates — `engine-era-guard` — was run directly, both before and after the cure.

### The master's three demanded proofs — reproduced, not inherited

The guard carries all three by name (`view-schema-guard.test.mjs:102`), and I re-measured the
hash-independence proof myself on the merged tree rather than trusting the run log:

```
hash before viewSchema edit : 4082ebe41a9c70652edcb84946417c879a16be404087891a2961e86c009a4cbf
hash WITH  viewSchema edit  : 4082ebe41a9c70652edcb84946417c879a16be404087891a2961e86c009a4cbf
hash after revert           : 4082ebe41a9c70652edcb84946417c879a16be404087891a2961e86c009a4cbf
```

`viewSchema` is outside the engine-hash corpus, exactly as the master required — confirmed
structurally too: `ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36`) never names
`assets/engine-era.json`, and `View.ts` importing that file does not add it to the corpus, because
`computeEngineHash` walks a **file list**, not an import graph.

## The runner's blocker — correct refusal, wrong subject

The runner ended **"NOT READY-FOR-GATES"**, reporting that its `src/**` edits rotate the engine
hash while its firewall forbade touching pins. **That refusal was right** (F-2214-1 shape: a runner
that reports a defect instead of reaching outside its firewall is a firewall success) — but the
premise it inferred was incomplete, and the drain's own re-run is the free control on the runner's
headline.

- The runner measured **`d0b87a42…e15e`** on the **lane** tree, 13 commits behind main.
- The merged tree's real hash is **`4082ebe4…4cbf`**.
- **Main's own hash before my merge was `30ae0a3c…a926`, which `engineEraIncludes` already returned
  `false` for.** Measured with the guard's own function, not by eye.

**So `engine-era-guard` was already RED on main before this slice existed.** The slice did not
break the era pin; it inherited a break.

## F-2458-1 — main was already outside era 5; the previous drain owed a pin append and missed it

**Measured, not inferred.** The only corpus-touching commit since the last pin (`e62f30ae9`,
pin `91c43545`) is `280d95d7f` — s2457's `winnability-receipts` runner commit, which added
`assets/contracts/winnability-receipts.json` (207 lines). `assets/contracts` is inside
`ENGINE_SOURCE_INPUTS`, so the content re-hashed `91c43545 → 30ae0a3c`. Nothing else moved.

That file is a **receipts ledger nothing imports** (s2457's own handoff says so), so this is a
content re-hash with **no behaviour change** — but it left every era-5 tape born in that ~30-minute
window unassayable, and it is the third time this exact append has been missed by a drain (see the
`417ac150` pin's own cause: *"the s2411 drain owed this append and missed it"*).

**Cured in the gated commit**, append-only, two pins with measured causes:

| Pin | Cause |
|---|---|
| `30ae0a3c…` | s2457 winnability-receipts drain `b5850417a`; content re-hash, no behaviour change. **Repairs the missed append rather than pinning only my own state.** |
| `4082ebe4…` | this merge; observation surface only, simulation behaviour unchanged |

Top-level `engineHash` re-pointed to the latest pin, as `engine-era-guard` requires. The three
stored reel fixtures the guard protects stay playable — the append removes nothing.

⚠️ **This pin is only valid while main's corpus does not move.** If another corpus-touching slice
lands before `save/view-schema-gated-s2458` is merged, the next fire must **re-measure** the hash
after merging and correct the final pin. The measurement costs one command (see below).

## F-2458-2 — two pin `cause` strings assert a mechanism that is false today (MINOR, no action)

Pins `25040ad5` and `d47f32f6` both read *"package.json sits in ENGINE_SOURCE_INPUTS so factory
tooling tweaks rotate the engine identity"*. Measured today, `ENGINE_SOURCE_INPUTS`
(`scripts/assay-replay-agent.mjs:36–44`) is `scripts/assay-replay-agent.mjs`, `assets/contracts`,
`assets/crafting-queue/contract.v1.json`, `assets/crafting-queue/approved`, `assets/layer-contracts`,
`assets/pilots/map-rebuild-spike`, `src` — **`package.json` is not among them.**

**Deliberately not "fixed".** The pins themselves are correct by effect (the hash did rotate, and a
pin is only a claim that a hash belongs to the era); only the stated explanation is wrong, and the
registry is append-only under the Retention Law — we supersede, never rewrite. Recorded here so the
next reader does not inherit a false mechanism, per F-2182-1: *a hedge that names a mechanism invites
the next fire to trust the mechanism and stop measuring.* Most likely the corpus was narrowed by the
`eaadcc38` pin (*"engine identity narrowed to replay-bearing source and data"*) after those two pins
were written, which would make both causes true when written and stale now.

## Merge classification

Trial merge onto `main` @ `719105ec3` was **clean** — `Auto-merging tasks/BACKLOG.md`, no conflicts.

| File | Class |
|---|---|
| `assets/engine-era.json` | LANE-TOUCHED (+80 `viewSchema`) then DRAIN-TOUCHED (+2 pins) |
| `src/agent/View.ts`, `src/game/Game.ts`, `src/game/RunTape.ts`, `src/replay/AgentTapeReplay.ts`, `src/ui/LanternShow.ts` | LANE-TOUCHED only |
| `functions/api/standings.ts`, `scripts/gr-sim.mjs`, `public/skill.md`, `scripts/view-schema-guard.test.mjs` | LANE-TOUCHED only |
| `package.json` | LANE-TOUCHED — **and the contention point**: main holds an uncommitted live-runner edit to the same `test:node-guards` line |
| `tasks/BACKLOG.md` | BOTH-MOVED, auto-merged cleanly |

## Merge instructions for the next fire

1. Confirm the main slot is free: `ls tasks/running/` shows no `main.pid`, and `git status --short -- package.json` is clean.
2. `git merge --no-ff save/view-schema-gated-s2458 -m "..."` — merge **the gated commit**, not a fresh resolution.
3. **Re-measure** the engine hash on the merged tree and confirm it is `4082ebe4…4cbf`; if main's corpus moved, append a corrected pin:
   ```
   node -e "import('./scripts/assay-replay-agent.mjs').then(async m=>console.log(await m.computeEngineHash(process.cwd())))"
   ```
4. `node --test scripts/engine-era-guard.test.mjs` must be **rc=0** before the merge commit is considered done.
5. Flip the `view-schema-versioning` leaf to `merged` with the merge hash, in a following commit
   (a commit cannot contain its own hash), then run `npm run test:ledger-guards` as the last act.
