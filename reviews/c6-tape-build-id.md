# c6-tape-build-id — tapes carry their build, the assayer names skew honestly

**Slice**: `c6-tape-build-id` · **branch**: `lane/d` · **lane tip**: `9b4a4f8c2` · **merge**: `eec0399c486a62ff87cf399547464ce61cc3c6f2` (main)
**Drained by**: s2238 (fire) · **Gated**: detached worktree `gate-s2238` off `821db56fe` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGE

## What it does

The assay worker's only vocabulary for "this tape was recorded on a different engine" was a hash-mismatch
`rejected` or a full-budget timeout — so the county charged the rider for its own patch (F-ASSAY-SKEW, born
from the owner's own restored seed-run tape on 2026-08-22). This slice gives the skew a name.

v2 run tapes now carry `meta.buildId`, stamped at RECORD time by both recorders: the browser from the baked
`__APP_BUILD__` (`vite.config.ts:31` — `CF_PAGES_COMMIT_SHA` sliced to 8, else `'dev'`), gr-sim from
`git rev-parse --short HEAD` of its own checkout. The assayer compares the tape's id against its own BEFORE
replaying; on mismatch it posts verdict `unassayable`, reason `build-skew (tape <id>, assayer <id>)`, with no
retries — skew is deterministic, so retrying it only burns budget. Tapes without the field replay exactly as
before, so nothing already recorded is retroactively invalidated.

The comparison is deliberately **prefix-tolerant in both directions**
(`!tape.startsWith(assayer) && !assayer.startsWith(tape)`), which is the load-bearing detail: the three id
sources abbreviate to three different widths — browser 8, `git rev-parse --short` 9 here, `ASSAY_BUILD_ID`
whatever the deployer sets. A strict equality test would have declared skew between a tape and the very
checkout that recorded it. This is F-1633-1's lesson (an abbreviation width is someone else's convention)
applied at the right place.

## Evidence (merged tree, fire shell, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, built in 1.40s; asset-diet ceilings respected |
| `scripts/assay-worker.test.mjs` + `scripts/assay-replay.test.mjs` | **10 pass / 0 fail / 0 skipped** (35.7 s) |
| `scripts/test-standings.mjs` | **113 KV + 113 SQLite** |
| `scripts/test-stats.mjs` | **87** |
| `scripts/test-ledger-worker.mjs` | **15** |
| `scripts/gr-sim.test.mjs` (modified recorder) | **20 tests — 18 pass / 0 fail / 2 skipped** (312.5 s) |
| Boot probe `_s2080-f1742-1` desktop + mobile-390 | **6 passed** (17.1 s), zero console/page errors |

Every figure reproduces the runner's own report to the digit (its `10/10`, `87`, `113+113`, `15`,
`18 passed 2 skipped`) — the drain's re-run is a free control on the runner's headline, and here it agrees.

**Determinism proved, not assumed.** The stamp lives in `meta`, outside the hashed event log. Two independent
witnesses: the new pin `the round-2 corpus hash remains byte-for-byte pinned` asserts
`artifacts/assay-e2e-20260822/round2/tape-secure-verb.json` is still `fnv1a32:ba8fdc3e`, and `gr-sim.test.mjs`'s
determinism suite is unmoved at 18/0/2.

**Merge classification.** Base `821db56fe`. Nine files, all LANE-TOUCHED; `src/game/Game.ts` and
`tasks/BACKLOG.md` were also MAIN-MOVED and auto-merged by ort with no conflict. Proof the merge on main IS
the tree that was gated: all nine blob hashes are byte-identical between the detached gate worktree and main
after the merge (`functions/api/standings.ts cbe2495a3` · `scripts/assay-replay.test.mjs cbf1cbb31` ·
`scripts/assay-worker.mjs 4c5998245` · `scripts/assay-worker.test.mjs 1ce70d43b` · `scripts/gr-sim.mjs 32ca8f2f8` ·
`scripts/test-standings.mjs 50436e484` · `src/game/Game.ts dc994b0fa` · `src/game/RunTape.ts 4a03799e5` ·
`tasks/BACKLOG.md 2f0e965e4`). Merged and committed as ONE act (F-1589-5) — no window where a concurrent
sweep could commit an undecided merge.

Firewall honoured exactly: the master's NO list named `server/ledger/**` and the runner reported the port as a
follow-up rather than editing it — a correct out-of-scope refusal, recorded below as owed work rather than a
closed item.

## Findings

**F-2238-1 — the worker now dies at boot on the production box unless `ASSAY_BUILD_ID` is set, and the
requirement lived only in a run log. NON-BLOCKING for the merge; CURED IN THE DRAIN COMMIT.**

`scripts/assay-worker.mjs` resolves its own id as
`process.env.ASSAY_BUILD_ID?.trim() || execFileSync('git', ['rev-parse','--short','HEAD'], …)`, at module top
level, uncaught. `||` short-circuits, so the git call never runs when the env var is set — but when it is
unset the call throws on any box without a git checkout, and the process exits before serving.

That box exists and is live. `docs/ops/agenttown-server.md:54` states the deploy recipe verbatim: *"Worker code
updates reach the droplet by rsync (no git on the box)"*, with `--exclude .git` in the rsync line, and
`goldrush-assay.service` is systemd — so the failure mode is a restart loop on the next worker update, not a
visible error. The runner found this in its own review and supplied `ASSAY_BUILD_ID` as the cure, then wrote
*"Production must set it when rsyncing the worker"* into `tasks/runs/…c6-tape-build-id.md.log` — a surface
nobody reads at deploy time.

This is §1.1's own reusable half (*a cure parked outside the tracked law is a cure the factory does not have*)
in its operational form. The code is correct and the escape hatch is the right design; what was missing is that
the precondition was not written where a deployer stands. Cured by adding it to the runbook's worker env list
and its DEPLOY/UPDATE recipe in the drain commit — deliberately in the runbook rather than as a code change,
because the git fallback is genuinely correct everywhere a checkout exists (dev, CI, all tests).

**F-2238-2 — the L1 ledger port is owed. NON-BLOCKING, recorded not closed.**
`server/ledger/**` carries a second copy of tape validation and will need the same `meta.buildId` acceptance
and skew handling when L1 lands. The master firewalled it and the runner correctly reported instead of
reaching in. Owed to the L1 slice; noted in BACKLOG.

**Non-finding, checked and cleared.** A tape recorded by a local dev build carries `buildId: 'dev'`, which
`validateTape` accepts but the worker's own id regex (`/^[a-f0-9]{7,16}$/`) forbids for the assayer. Traced:
such a tape reaches the skew branch and is posted `unassayable — build-skew (tape dev, assayer <id>)`. That is
the honest and intended terminal, not a hole.
