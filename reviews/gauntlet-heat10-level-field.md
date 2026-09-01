# Review — gauntlet-heat10-level-field (heat 10, the controller-parity field)

- **Slice:** `gauntlet-heat10-level-field` · **branch:** `lane/b` · **tip:** `f2d8665e1`
- **Base:** `09a829079` (merge-base with main at drain time) · **merge:** `814b5a8b8`
- **Drained:** s2432, 2026-09-01

## Verdict

**MERGE — as an honest preflight DNF, not as a heat result.** No rig rode; the
leveling delta this heat exists to produce does not exist. The evidence is
merged because a documented stop with its cause is exactly what the master's
own `skew → STOP` law asks for, and because the run's central attribution —
*the deployed pin cure did not regress* — is independently confirmed below.

This is a Mistake #1 check that PASSES: the run changed nothing in the game and
wrote down why, at length, in `preflight.md` and `heat10-note.md`.

## What it does

Heat 10 was to give PI 0.73.1 and Prime Agent 0.8.0 the same rights as the
winning rigs (controller authorship, attempt budgets, the r22 lean line in the
charter) and re-measure the standings that heat 9-r2 showed were measuring
latency rather than strategy.

It never got there. The mandatory early skew probe minted an engine identity
that production refused as `reel_not_current`, and the master makes that an
unconditional terminal stop. The merged tree therefore contains the field
machinery (transport shims, charters, matrices, submission helpers), the probe
tape, and a delta table whose every row honestly reads `no ride — preflight stop`.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check` (§3.0, first command) | ✅ CLEAR — `status="queued"`, no block class |
| Firewall — paths outside `artifacts/gauntlet-heat10-20260901/` | **0** of 20 files |
| Run-surface impact | **NONE** — `artifacts` ∉ `RUN_SURFACE_BASE` (9) ∪ derived gate roots (6) |
| tsc / build / e2e | **Structurally unaffected** (see below) — not re-run, and why |
| Secret hygiene | clean — no key/token/bearer material in the 36,151 added lines |
| Engine-pin cure regression | **REFUTED by measurement** — cure INTACT (below) |
| `test:ledger-guards` (F-1300-4, after bookkeeping) | run as the fire's last act |

### On not re-running tsc/build/e2e — a measured claim, not a shortcut

The drain gate exists to catch a slice changing behaviour. This slice adds 20
files, all under `artifacts/gauntlet-heat10-20260901/`, verified by
`git diff --name-only <base> lane/b | grep -v '^artifacts/…'` returning empty.
`lane-usable.mjs` computes the run surface as `RUN_SURFACE_BASE` (`src e2e
functions scripts package.json package-lock.json playwright.config.ts
tsconfig.json vite.config.ts`) plus gate roots derived from `main:package.json`
(`foundry ops server` + three playwright configs). `artifacts` is in neither
set — by design, per that file's own comment that the list covers "only
surfaces that can change whether a task runs or how it is gated".

So the battery would have been measuring the base commit, not the slice.
Stated here rather than silently skipped.

## F-2432-1 — the DNF attribution, re-derived rather than inherited

**This is the finding that decided the verdict.** The master states that if the
early probe skews again, *"the cure regressed and that finding outranks the
heat"*. The runner's note attributes the skew instead to its own contaminated
arena. Those two readings owe completely different correctives — one is a
re-run, the other is a production era-pin emergency — so the drain measured it
rather than accepting the runner's account of its own failure.

**Method.** Detached worktree at `c13b4c24d` (the deployed build), clean tree,
`computeEngineHash()` imported from that build's own `scripts/assay-replay-agent.mjs`
so the input list is the build's own:

```
clean tree at c13b4c24d = 25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca
registered era-5 pin    = 25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca
probe (contaminated)    = 1934d6e52b9a93cc25ecf55451c3f74a3b595c6eaca45d73a92812e6b91f8cc1
```

**Byte-equal to the registered pin. The c13b4c24 pin-lineage cure is INTACT.**
`package-lock.json` is confirmed as member #1 of `ENGINE_SOURCE_INPUTS`
(`assay-replay-agent.mjs:36-48`), so an `npm install --prefix` that rewrites it
changes the engine identity exactly as the runner described. The skew was local
arena contamination; production was right to refuse the reel, and the heat-9
stop that this cure was written for has not returned.

**Declared limit, honestly:** this confirms the *positive* control — a clean
tree at that build hashes to the registered pin. It does not re-derive the
contaminated hash, because the mutated lockfile was never banked. The direction
of that gap is harmless: whatever altered the probe was local to the arena,
since the committed tree at that build hashes correctly.

## F-2432-2 — the master's BACKLOG row was not written (non-blocking)

The firewall permits `artifacts/gauntlet-heat10-*/** + BACKLOG row only`, and
the runner wrote no BACKLOG row. Correct behaviour under the one-writer law
rather than a defect — the drain owns the ledger — and the row lands in this
drain's bookkeeping commit. Recorded so the absence is not read as an omission.

## Merge classification

Base `09a829079`; all 20 files **LANE-TOUCHED, MAIN-UNTOUCHED** — every one a
new path under a date-stamped evidence directory that exists on no other
branch. `lane-usable` classified all 20 `HELD LANE-ONLY` before the merge and
`main..lane/b` is empty after it. **No conflicts, and none were possible.**

## What is owed

- **Heat 10 has not been run.** The delta table is empty by construction. A
  re-run needs a corrected preflight premise: install with the detached arena
  as cwd, and prove `git status --short` clean in the arena immediately before
  minting the probe. That is a heat-sized spend of the owner's subscription,
  so it goes to the desk as a decision, not to a queue as a refill.
