# F-1700-1 — lane commits own only the run-created delta

**Slice:** `f1700-1-runner-delta-autocommit` · **branch:** `lane/d` · **tip:** `4e0b97946f28790dee040c9dca77ca8efc96b14d` · **base:** `af8a7b9c9cd18f1606dc5028083e59cae10e4898`  
**Verdict:** **MERGED** at `835dfee0fe4d8b19502082f13a08974a7b5fb596` (s1701)

## What changed

Ordinary lane dispatch now snapshots the dirty-path set before Codex starts. Successful completion stages and commits only the later delta; any path already dirty stays outside the commit and is named in the run log. NUL-delimited literal pathspecs preserve spaces and glob characters, while inode/content identity follows baseline dirt moved to a new name.

Main-slot and art-slot ownership semantics are unchanged.

## Evidence

The candidate was gated in detached worktree `/tmp/gold-rush-s1701-gate.sG8ONl`; undecided content never entered main.

| gate | result |
|---|---|
| `node scripts/drain-block-check.mjs ... --strict` | **CLEAR**, leaf `f1700-1-runner-delta-autocommit` |
| `bash -n scripts/lane-runner-v3.sh` | **rc=0** |
| `bash scripts/runner-commit-decoupling-guard.test.sh` | **10/10 pass**; old compound-add and old broad-commit red arms both fire |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, Vite built in 1.82 s; asset diet green |
| first `npm run test:ledger-guards` node stage | **179 tests · 178 pass · 1 expected pointer-drift red** |
| pointer rebase + `law-pointer-guard.test.mjs` | **11/11 pass**; all 27 checked pointers current |
| adjacent runner/lock/dispatch guards | **all pass**; client-floor 13/13, restart recipe 9/9, commit boundary 10/10, lock 22 fixtures, dispatch 8 arms, NUL audit clean |
| `git diff --check` | **rc=0** |
| Playwright / screenshots | not applicable: factory runner only; no runtime or rendered surface changed |

The repeated full ledger run later hit the repository's known Node shutdown hang in `claimed-spec-harness-guard` after the first run had already passed that test. Only that fire-owned duplicate process was stopped. The pointer-specific and affected adjacent gates were then run directly; the mandatory final post-bookkeeping ledger battery remains the binding verdict.

## Merge classification

Main had not moved either task path after base. Both are LANE-TOUCHED-only:

- `scripts/lane-runner-v3.sh` adds the baseline capture and literal delta commit boundary.
- `scripts/runner-commit-decoupling-guard.test.sh` manufactures tracked, untracked, moved, spaced and literal-glob paths plus the historical broad-commit failure.

The merge used `ort`, with zero conflicts and no swept artifacts.

## Findings

The new helpers shifted five live law coordinates. The drain re-read each target, rebased `CLAUDE.md` and `scripts/fire.md`, and refreshed `scripts/law-pointer-baseline.json`; the focused guard is 11/11 green.

No blocking product or implementation finding remains.

## Player surface

Nowhere by construction. This is factory process code, so GZ-01 and deploy do not apply.

