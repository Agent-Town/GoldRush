---
status: STOP
task: F-1288-3
date: 2026-07-31
---

# F-1288-3 — STOP: lane base predates `place_building`

Scope 0 cannot be run on this checkout.

| Revision | Commit | `AgentAbility` contains `place_building` | `requiredAbility(BUILD)` |
|---|---|---:|---|
| checked-out `lane/m4` | `88db2677` | no | `null` |
| `origin/main` | `19cc608b` | yes | `'place_building'` |

The lane is 1 commit ahead and 85 commits behind `origin/main`. Its
`AgentConsentStore` registers only four abilities, so a typed state with
`place_building: true` cannot be created and the requested
capture → decode → restore four-cell control is not meaningful:

| Ability | Capture | Decode | Restore |
|---|---|---|---|
| `place_building` | unavailable | unavailable | unavailable |
| `light_duty: true` | supported | `true` | `true` |

`origin/main` does contain the exact defect described by the task:
`AgentConsent` captures and restores `place_building`, while `decodeAgent`
omits it and `normalizeLockstepAction` rejects it.

No source, test, spec, backlog, status, or git-history changes were made.
No gates were run because the mandatory preflight stopped the task before
implementation. Refresh lane-b losslessly to `origin/main`, then rerun this
task.

---

# s1288 TRIAGE — LAWFUL STOP, ACCEPTED (not a failure, and not a re-queue)

**Verdict: the runner was right and the master was wrong about one thing — it never checked that its subject existed on the lane.** Harvested to main by the authoring fire so the evidence is not stranded on a frozen branch (Retention Law).

✓ **The STOP is correct at source.** `worktrees/lane-b` is checked out at `lane/m4`, which this fire measured at **2 ahead / 87 behind main**. The report's own two-row table is the proof, and its independent re-derivation of the defect **on `origin/main`** (`:26-28`) corroborates F-1288-3 from a second vantage — the runner reached my conclusion from the opposite direction, on a checkout that could not see my code.

⚠️ **Scope 0 was an ABORT gate for the wrong state.** I wrote it to catch *"the defect is already fixed"*. It caught a third state I had not enumerated: **the subject is not present at all.** A `capture → decode → restore` control cannot be run against an `AgentConsentStore` that registers four abilities. **Naming files in READ-FIRST is not a guard; the guard has to assert the subject's presence.**

🔒 **Why the lane is stale is the real finding — see F-1288-4.** The freeze is self-perpetuating: `lane/m4` is *false*-ahead (its content is absorbed in main), the LANE-SAFETY pre-flight refuses to `reset --hard` anything ahead of main, so the worktree never advances — **and each refused task commits its own STOP report, adding another ahead-commit and deepening the freeze.** This run took it from 1 ahead to 2.

🚫 **Deliberately NOT re-queued.** §7.5 forbids an identical retry; the premise must change first, and the premise here is the lane's base. **The cure is a lossless refresh, not a re-dispatch** — and it is one command in a worktree this fire is permission-gated from entering. Tip archived at `archive/lane-b-s1288-preflight-tip` (`230dd49f`) so the refresh is provably lossless before anyone runs it.

**Loss check on the branch, at line resolution:** `src/game/Game.ts` **ABSORBED** (all added lines in main), `artifacts/county-standings/mobile-chrome.png` is regenerated screenshot evidence (never gate on byte-identity of a regenerated shot), and this review file — the only genuinely lane-only content — is now on main. **The branch holds nothing unique.**
