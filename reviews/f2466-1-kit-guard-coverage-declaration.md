# Review — f2466-1-kit-guard-coverage-declaration

**Slice:** `f2466-1-kit-guard-coverage-declaration` (lane-a, fire-authored s2466 from its own drain review of `kit-guard-generic-damage`)
**Branch:** `lane/a` — runner commit `bdbb55b1e`
**Gated tip:** `8d4447816686849c78d39d5f843e81ae52e60b21` (merge commit; parent1 `69764079e` = main at gate time)
**Merged to main:** `8d4447816686849c78d39d5f843e81ae52e60b21` — fast-forward, so **what shipped is byte-identical to what was gated**
**Drained by:** s2470

## Verdict

**PASS — MERGED.** The slice does exactly its three scoped things, adds one new refusal and no others, and its refusal was proven to bite by manufacturing the defect. Nothing player-visible; this is instrument work on a `test:node-guards` leaf.

## What it does

`scripts/kit-guard.test.mjs` could not tell you what it had *not* checked. Two separate holes, both measured at s2466 and neither inferred:

1. **An empty door list passed green.** `readDoorIds()` asserted the `public/skill.md` `skillmd-guard:door-contracts` block *existed* but never that it was *non-empty* — so replacing that JSON with `[]` gave 1 test / 1 pass / rc=0, a green run having checked zero contracts.
2. **Five of 36 door-contract tests assert nothing and pass**, because `for (const kind of fieldedKinds(contract))` never enters for a contract fielding zero kinds — while the footer printed `36 door contracts`, implying 36 subjects.

The slice adds a non-empty assertion in `readDoorIds()` (hole 1, a **refusal**) and extends the `test.after` footer with a coverage line naming the asserting/zero split and the zero contracts by name (hole 2, a **declaration**). It deliberately does **not** make a zero-kind contract red: five door contracts are lawfully in that state today, so a hard assertion would fire on ordinary correct operation and be excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). Declare, do not refuse.

## Evidence

Gated on the **merged tree** in a **detached worktree** (`gate-s2470`, §3.0b) — undecided content never entered main's working tree or index.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 40.6 s, 0 B output |
| `npm run build` | **rc=0**, 80.0 s, `✓ built in 28.69s` |
| Slice's own spec — `node --test scripts/kit-guard.test.mjs` | **rc=0**, 1.2 s, **36 tests / 36 pass / 0 fail / 0 skipped** |
| Declaration line, verbatim, on a **fully green** run | `kit-guard coverage: 31 asserting / 5 zero; zero: e1-drill-yard, e1-dry-gulch, e1-night-shift, e1-twin-banks, the-claim` |
| Existing footer, unchanged | `kit-guard: 36 door contracts, 84 fielded contract-kind paths, 46 distinct damage rows` |
| Adjacent — `battery-manifest` + `gate-caller-audit` + `skillmd-guard` | **rc=0**, 6.3 s, **60 tests / 60 pass / 0 fail** |
| Merge conflicts | none — clean `ort` merge, 1 file, `git status --short` empty |

### Teeth — proven by manufacturing the defect, not by reading a green

A passing guard never executes its violation path, so its green says nothing about its red. The scope-1 refusal was exercised directly, with the **control asserting its own validity first** (F-2215-1 — a control whose failure mode is silence cannot be told from the silence it measures):

```
control valid: block found, 36 ids present before mutation
mutation applied: block now []
--- MUTATED ARM rc=1 ---
  AssertionError [ERR_ASSERTION]: public/skill.md skillmd-guard:door-contracts block is empty
  ℹ tests 1
  ℹ pass 0
  ℹ fail 1
--- after revert, git status --short: "?? node_modules\n"
```

Pre-cure this same mutation gave **1 test / 1 pass / 0 fail, rc=0** (s2466's measurement). Post-cure it is **1 / 0 / 1, rc=1**, naming the file and the marker. The defect is caught, the message points at the corpus that went empty, and the revert is clean (the only residue is the `node_modules` symlink I added to the gate worktree, untracked and mine).

The scope-2 declaration is verified on the **happy path**, which is the half that matters: a declaration appearing only on failure re-creates the ambiguity it removes (F-2208-1).

## Merge classification

Base `94d3fd2333f3f9a6f7f255ac8d02e1adf8f5dc08`; lane 1 commit ahead, 32 behind.

| File | Class | Resolution |
|---|---|---|
| `scripts/kit-guard.test.mjs` | **LANE-TOUCHED** (main never moved it) | clean auto-merge, no conflict |

Main did not move during the gate: the gated commit's parent1 was still `HEAD` of main at land time, verified by a refusal-guarded lander that would have stopped had it moved. The landing was therefore a **fast-forward of the gated commit itself**, not a fresh resolution — so no re-merge could have introduced content the battery never saw.

## Adjacent-suite scope — stated honestly, including what I did NOT run

**I did not re-run the full `test:node-guards` battery.** That is a deliberate, reasoned scoping and not an oversight, so here is the reasoning to argue against:

- The diff is **3 added lines and 1 changed line inside a single `scripts/*.test.mjs` leaf**. `grep` over `package.json` and every `scripts/*.mjs` finds **no consumer of `kit-guard.test.mjs` other than its own registration as the first leaf of `test:node-guards`** — nothing imports it, so it cannot move another leaf's verdict.
- Its package.json wiring is **untouched** by this diff, so the topology guards (`battery-manifest`, `gate-caller-audit`) cannot move — and both were run anyway, green.
- Its only *executional* adjacency is `fixture-teardown.test.mjs`, which spawns every `scripts/*.test.mjs` and asserts each removes its temp directories. `kit-guard.test.mjs` contains **no `mkdtemp`, no `tmpdir`, no write of any kind** (verified by grep, not assumed) — it only reads files — so fixture-teardown's verdict about this subject is structurally unchanged. That leg is ~15 min of wall (F-2465-2 measures its children summing to 869.9 s) and would have consumed the fire's remaining drain budget for a question that cannot come back differently.
- `skillmd-guard.test.mjs`, which **owns the `door-contracts` block** this diff now asserts non-empty on, was run and is green — that is the meaningful semantic adjacency, and it is the one that could have moved.
- The runner reports the full battery at **607 tests / 605 pass / 0 fail / 2 skipped** on this exact tree. That is a *claim* (Mistake #4), not evidence I gathered, and it is recorded here as the runner's number rather than as mine.

If a later fire wants the belt-and-braces, the leg to run is `npm run test:node-guards` at ~28 min (F-2469-2 restates the cost).

## Findings

**None blocking.** No corrective task spawned.

- **Non-blocking observation (no F-ID, recorded not filed):** the runner also wrote a session digest into the shared Obsidian vault at `~/Obsidian/Brain/Sessions/codex/2026-09-03-Kit-guard-declares-asserting-contract-coverage.md`. That is outside the repo and outside the task's firewall, which governs repo paths; it is the vault contract's prescribed behaviour, not a violation. Noted so the next reader is not surprised by it in the run log's diff section.
- The runner's own report notes that default-concurrency battery attempts reproduced known load-sensitive simulation failures and it fell back to concurrency-1. That matches **F-2462-1/F-2462-3** exactly — a contended battery manufactures reds on both sides of a handoff — and is the correct behaviour, not a defect.
