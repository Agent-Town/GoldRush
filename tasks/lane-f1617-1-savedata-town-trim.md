# Task f1617-1: the prefetch wins, but not on a metered connection — saveData keeps the two bulk halls cold (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1617, from F-1617-4 in `reviews/f1615-1-prefetch-wins-mount-laziness.md`.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.

READ FIRST: AGENTS.md; `reviews/f1615-1-prefetch-wins-mount-laziness.md` (the whole finding — it contains the
measurement, the causal chain and the reason the failing assertion is NOT stale); `src/town/TownTavernPilot.ts`
(`townPrefetchUrls()` — the function f1615-1 edited); `src/assets/AdvanceStream.ts` (line 30 imports
`townPrefetchUrls`, and the saveData narrowing that lets the town target through); `e2e/advance-stream.spec.ts`
(the `saveData keeps tier one and skips bulk contract maps` test — read all four of its prefetch assertions and note
that three of them pass and must KEEP passing).

## ⚠️ PRE-FLIGHT — THIS ONE IS DIFFERENT. **DO NOT RESET THIS LANE.**

`lane/a` deliberately **HOLDS UNDRAINED WORK**: commit `914a7e93b` (f1615-1), gated by s1617 and held back only by
the finding this task cures. **It is not on main and resetting the lane would destroy it** (the w1-03 / polish-02
failure, CLAUDE.md Mistake #2). The standard safe-dupe pre-flight is therefore **WRONG here and must not be used.**

Instead, verify the tip is PRESENT and build on top of it:

1. `git -C worktrees/lane-a log -1 --format=%h` → **must contain `914a7e93b`** as HEAD or an ancestor
   (`git -C worktrees/lane-a merge-base --is-ancestor 914a7e93b HEAD`). If it is **absent**, **STOP and report** —
   the lane has been reset by someone else and the work must be recovered from reflog/`archive/*` before anything
   else happens. Do NOT proceed and do NOT re-implement it from memory.
2. Confirm f1615-1's change is actually in your tree:
   `grep -cF "export function townPrefetchUrls(): string[] {" src/town/TownTavernPilot.ts` → **1**, and
   `grep -c "id !== 'stamp-mill'" src/town/TownTavernPilot.ts` → **0** (the exclusion f1615-1 removed).
   If the second is `1`, f1615-1's change is missing — **STOP and report**.
3. Prove your other two anchors are present (all three were verified `=1` on both main and `lane/a` at authoring;
   use `grep -F`, because a literal `{` is a BSD `grep` syntax error — f1616-1's runner hit exactly this):
   - `grep -cF "if (saveDataEnabled()) targets = targets.filter(({ priority }) => priority === 1);" src/assets/AdvanceStream.ts` → **1**
   - `grep -cF "expect(prefetched.some((url) => /stamp-mill|dynamo-hall/.test(url))).toBe(false);" e2e/advance-stream.spec.ts` → **1**
   Any of these returning `0` means the tree drifted — **STOP and report the counts**, do not guess.
4. `npm install --no-audit --no-fund`; `npm run build` green before touching anything.
5. Cleanliness: `git -C worktrees/lane-a status --short` must be clean, with the FACTORY-CHURN EXCEPTION — always
   expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`
   and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`,
   `reviews/*.md`.

## Why (measured s1617, not inherited)

f1615-1 removes the `stamp-mill` / `dynamo_hall` exclusion from `townPrefetchUrls()` under the owner's branch-(a)
ruling, so the menu boot stops leaking. Correct — **except on a metered connection.**
`src/assets/AdvanceStream.ts` narrows prefetch to `priority === 1` targets when `saveDataEnabled()`, and **town is a
priority-1 target**, so the two newly-included bulk era-2 GLBs ride straight through the saveData filter.

Measured this fire, same shell, `--workers=1`, both arms:

| Arm | `e2e/advance-stream.spec.ts` |
|---|---|
| main without f1615-1 | **10/10 passed** |
| main with f1615-1 merged | **8 passed / 2 failed** — same test, both projects |

Deterministic, not bimodal. **The assertion is not stale**: its three sibling assertions still pass (no bulk contract
terrain/panorama; tier-one town still warmed; under 20 GLBs). `saveData` is the user's browser asking to conserve
data — usually a metered mobile connection. Deleting the line would spend a stranger's data to fix a desktop
prefetch leak.

**Both ratified constraints can hold at once, which is why this is a trim and not a design fork:** the owner's
ruling governs the normal path, and the saveData contract governs the metered one.

## Scope

1. **Exclude the two bulk halls from the prefetch set under saveData ONLY.** Keep f1615-1's behaviour exactly as it
   is on a normal connection. Implement it where it reads honestly — either `townPrefetchUrls()` taking an explicit
   option (e.g. `townPrefetchUrls({ saveData })`, defaulting to today's full set) with `AdvanceStream` passing
   `saveDataEnabled()`, or `AdvanceStream` trimming the town target when saveData is on. **Pick ONE and say which
   and why in your report.** Do not reintroduce a hardcoded id filter on the normal path.
2. **No new required behaviour anywhere else.** Non-saveData boots keep the full f1615-1 set, byte-for-byte in
   effect. Prove it (scope 4).
3. **The saveData test goes green unmodified.** `e2e/advance-stream.spec.ts` is the CONTRACT here — do NOT edit it,
   do NOT re-scope it, do NOT rename it. If you believe it cannot be satisfied without editing it, **STOP and report
   why** rather than changing the assertion (generator proposes, contract disposes — CLAUDE.md Mistake #14).
4. **A test that would have caught this.** Add one assertion (in the town/advance-stream surface you are already
   touching, not a new spec file if an existing one fits) proving the *positive* direction too: on a **normal**
   connection the two halls ARE prefetched. Today only the negative case is covered, which is how a change in this
   exact direction reached a gate — a one-directional guard is what let this through.

## Firewall

Touch ONLY: `src/town/TownTavernPilot.ts`, `src/assets/AdvanceStream.ts`, and ONE existing e2e spec for scope 4's
added assertion.
NO changes to: `e2e/advance-stream.spec.ts` (the contract — see scope 3); the ten `e2e/town-*-blender.spec.ts`
re-scopes f1615-1 already landed on this lane; `AdvanceStream`'s priority model or contract-map logic; anything
under `src/sim/`, `src/systems/`, `src/entities/`; other tasks' fresh work.
**Above all: do not revert, amend or rebase `914a7e93b`.** Your commit sits ON TOP of it; the drain lands both.
If you find yourself about to exit without changes, WRITE WHY into your report first.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` + `npm run build` green. Then, all at `--workers=1`:
- `e2e/advance-stream.spec.ts` **10/10, both projects, UNMODIFIED** — paste the list output. This is the gate.
- Your scope-4 assertion green, both projects.
- The ten `e2e/town-*-blender.spec.ts` still green, both projects — f1615-1's re-scopes must survive your change.
  Report the tally; if any of the six known bimodal p95 frame-time reds appear, say so and name them rather than
  re-running until green.
- Paste `git status --short` after the runs (F-1616-2 discipline: no tracked `reviews/*.md` may be rewritten).

End: READY-FOR-GATES + report: which implementation shape you chose and why · the saveData test's 10/10 · proof the
normal path still prefetches both halls · the blender tally · and confirmation that `914a7e93b` is still an ancestor
of your HEAD.
