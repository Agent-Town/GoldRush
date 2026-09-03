# f-e4-1-suspend-snapshot-repro — drain review (s2493)

**Slice:** `f-e4-1-suspend-snapshot-repro` (F-E4-1 INVESTIGATE)
**Branch / tip:** `lane/a` @ `e7bfe08c7befa0ecb73e791bb01da982675a38e2`
**Merge:** `59e8d3a0a811a7c2fe4528003855c61c636c71eb`
**Drained by:** s2493 fire, 2026-09-04

## Verdict

**MERGED — evidence-only.** The run answered its investigative question and
changed no product code, which is exactly what its master asked for.

## What it does

It settles whether `captureSnapshot` crashes a plain browser ride at the first
completed-wave boundary, or only the replay harness. The answer is
**HARNESS-ONLY**: a plain `the-claim` ride crosses the wave-1→2 boundary and
writes a valid suspend snapshot on both desktop and 390px mobile, with no
console or page errors. The crash reproduces only when `HeadlessContractSim` is
constructed inside a browser document — its reduced `RunManager` host exposes no
`researchState`, while browser presence alone arms `RunSuspendController`, so
`deepClone(undefined)` reaches `JSON.parse(JSON.stringify(undefined))` and throws.

The audit names the trigger by file and line and proposes the smallest cure (one
explicit `RunManager` option that disables `RunSuspendController`, passed from
`HeadlessContractSim`) rather than filling the adapter with snapshot-only fields.
That cure is **not implemented here** and is not part of this merge.

## Evidence (measured on the merged tree, in a detached gate worktree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, built in 2.13s; asset-diet ceilings respected |
| `npx playwright test --list` | **3042 tests in 439 files** (control: a real collection, asserted before any zero was believed — F-2215-1) |
| collected from `artifacts/` | **0** |
| diff vs main | 10 files, **0 on gated surface** (no `src/` `e2e/` `functions/` `playwright.config.ts`) |
| runner's own evidence | `artifacts/f-e4-1/` — 4/4 passed, desktop 1280×800 + mobile 390×844, both conditions |

**Why the battery is scoped this way, stated rather than assumed.** The slice adds
only `artifacts/f-e4-1/**`, `docs/audits/**` and one `tasks/BACKLOG.md` line. Two
of the added files are TypeScript (`repro.config.ts`, `repro.spec.ts`), which is
the one thing that could have pulled this onto a gated surface, so both possible
routes were checked directly rather than reasoned about:

- `tsconfig.json:17` includes only `["src", "e2e", "functions", "playwright.config.ts"]` — `artifacts/` is outside tsc scope.
- `playwright.config.ts:46` sets `testDir: './e2e'` — and the merged-tree `--list` collects **zero** paths matching `artifacts/`.

So the adjacent-suite question has an empty subject set here **by construction,
and that emptiness was measured, not inferred.**

## Merge classification

Base `main` @ `874c60421`. Trial-merged in a detached worktree (`gate-s2493`),
per §3.0b — undecided content never entered main's working tree, and the merge
was committed as one act rather than left staged (F-1589-5).

| Path class | Files | Resolution |
|---|---|---|
| LANE-ONLY (new) | 9 (`artifacts/f-e4-1/*`, `docs/audits/2026-09-04-f-e4-1-suspend-snapshot.md`) | created, no main counterpart |
| BOTH-MOVED | 1 (`tasks/BACKLOG.md`) | auto-merged by `ort`, no conflict — main's attended edits and the lane's one appended evidence line are disjoint hunks |

No conflicts. `git log main..lane/a` is empty after the merge — fully absorbed.

## Findings

**F-2493-1 (non-blocking, informational — no corrective owed).**
`withheld-evidence-audit` was run at drain time, as F-2477-1 prescribes, rather
than only on a dry board. A naive substring grep of today's three run logs
scored `0 / 2 / 1` withheld paths; the **anchored** key
(`^\[lane-runner-v3\] withheld baseline-dirty path: `) scores **0 / 0 / 0**.
All non-zero hits were the run logs quoting F-2477-1's own BACKLOG text — the
narration confound that finding predicts, reproduced verbatim one day after it
was written. Nothing was withheld by any of today's runs, and nothing is owed.
Recorded because it is the first live confirmation that the anchored-needle
instruction is load-bearing and not decorative.

**No blocking findings.** The slice is an investigation that reported instead of
fixing, which is a firewall success, not a shortfall.

## What this leaves owed

The cure the audit proposes (a `RunManager` option disabling
`RunSuspendController`, passed from `HeadlessContractSim`) is **unimplemented and
unqueued**. It touches `src/game/RunManager.ts` and `src/sim/HeadlessContractSim.ts`,
so it is a real code slice with its own gates — not a drive-by. It is recorded in
`tasks/BACKLOG.md` as the follow-up this investigation earned.
