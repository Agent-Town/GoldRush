target: .claude/skills/drain/SKILL.md
anchor: CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT
why: F-1295-1's custody cure is law in scripts/fire.md §3.0b but absent from the surface a drainer actually reads. RE-TESTED s1349 (F-1349-1): still denied, and NO settings change can lift it — .claude/settings.json already grants bare Edit+Write. Do NOT shell around it.
opened: s1343 2026-08-01
kind: ACTION (mechanical paste — needs no owner ruling, only an unrestricted shell)

---

## What to do — one paste, ~60 seconds

Open `.claude/skills/drain/SKILL.md`. In **§0 Preconditions**, find the clean-main bullet:

```
- [ ] `git status --short | grep -v '^??'` on main is EMPTY (clean-main window). If a live main-slot task is running: WAIT — never gate over a dirty tree (Mistake #12: Gate Contamination).
```

Insert the block below **immediately after** it, as the next `- [ ]` bullet.

## Why this is an ACTION, not a RULING

Nothing here needs Robin. The rule is already ratified law at `scripts/fire.md` §3.0b (landed
s1342, `c01a7ee0`). This is purely a propagation to the sibling surface, and the only reason a
fire has not done it is the `.claude/` permission gate. Three fires in a row (s1295, s1342, s1343)
have now composed this same text and been unable to land it.

## Placement note

It belongs *after* the clean-main bullet specifically, because it is that bullet's **inverse** and
reads as a non-sequitur anywhere else: clean-main asks whether someone else's dirt contaminates
your gate; this asks whether your gate leaks.

## The exact text to paste

- [ ] **CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT *DECIDED* TO MERGE INTO MAIN'S WORKING TREE. GATE UNDECIDED CONTENT IN A DETACHED WORKTREE (F-1295-1 s1295; law at `scripts/fire.md` §3.0b s1342; this surface s1343, F-1343-1 — the cure sat in `fire.md` alone while THIS is the surface a drainer actually reads).** ⚠️ **This is the INVERSE of the clean-main bullet above, not a restatement of it:** that one asks whether *someone else's* dirt contaminates your gate; this asks whether **YOUR gate leaks**. `CLAUDE.md:50` Mistake #12's "detached worktrees" is about *contention* — a different question, and F-1295-1 explicitly distinguishes it. 🎯 s1294 checked four lane paths into main's tree to evaluate a slice, wrote **VERDICT: HOLD — NOT MERGED**, reverted with `git checkout HEAD -- <paths>`, confirmed `git status` clean, and was **wrong**: a concurrent attended session's broad `git add` had already committed all four at **`3058fca5`**, under a message about "rehearsal round 2" naming none of them, **thirteen minutes before the handoff denying it**. 🔑 **Every probe that fire had returns the SAME answer either way** — `git status` cannot detect a sweep because **a sweep's signature is the ABSENCE of dirt**, and `git checkout HEAD -- <paths>` restores *from* a HEAD that has itself moved, so the "revert" **re-installed** what it was undoing. The only discriminating probe is a **blob-hash compare against a PRE-sweep ref**. ⚖️ **A HOLD verdict has NO ENFORCEMENT SURFACE** — it lives in a review file and a goal leaf; **nothing in git defends it**, and the same window ships an owner-**BLOCKED** slice (§0 line 1) just as readily. Cost of the cure: one `git worktree add` + a `node_modules` symlink. ⓘ **Scope, stated so you don't over-correct:** F-1295-1 measured the **working-tree** case only. Gating by `git merge --no-ff` and planning to revert on a red (§3) puts undecided content on **HEAD** — structurally the same bet against concurrency, but **UNMEASURED**; treat as caution, not proven.

## When you have pasted it

`node scripts/attended-owed-audit.mjs` will detect the anchor in the target and print
**LANDED-NOT-ARCHIVED** with rc=1. Clear it by moving this file to `tasks/attended-owed/archive/`
and committing — that rc=1 is the guard asking for bookkeeping, not reporting a problem.

## RE-TEST, s1349 (F-1349-1) — the denial is real, and it is NOT a settings gap

Six fires carried this item on an inherited reason. s1349 ran the command instead (Mistake #4).

| probe | result |
|---|---|
| `Edit` on `.claude/skills/drain/SKILL.md` | **DENIED** — "requested permissions to write … but you haven't granted it yet" |
| **CONTROL:** same `Edit` tool, same session, on `logs/session-scratch/s1349-lock.txt` | **SUCCEEDED** |
| `.claude/settings.json` → `permissions.allow` | contains bare **`"Edit"`** and **`"Write"`**, unqualified |
| `~/.claude-alt/settings.json` (this fire's config dir) | `{theme, model}` — **no `permissions` key at all** |
| `deny` rules mentioning `.claude` | **none**, in either config |
| `scripts/fire-runner.sh:72-74` | invokes `claude -p … --model` only — no `--allowedTools`, no `--permission-mode` |

➡️ **The tool works; the PATH is the discriminator.** And because the project already grants the
broadest possible form of the permission — bare `Edit` — **there is no allow-entry left to add.**
The `.claude/` boundary is enforced above the settings layer. **So the standing recommendation
"ask Robin to allowlist it" is measured WORTHLESS, and no future fire should spend a line on it.**
This item is permanently attended-owed, exactly as designed. ⓘ Scope: measured in the
`~/.claude-alt` fire shell; the primary fire shell was not separately probed.

## 🚫 DO NOT LAND THIS BY SHELLING AROUND THE DENIAL (F-1349-2)

`Bash(node:*)`, `Bash(cat:*)`, `Bash(cp:*)` and `Bash(mv:*)` are all on the fire allowlist, so a
fire almost certainly *could* write this file from a shell. **That is forbidden, and the fact that
it would work is the reason to say so out loud.** A permission boundary on `.claude/` exists
precisely to stop an autonomous agent from editing its own instruction surface; an agent that
routes around it with a second tool has defeated the control while satisfying the letter of every
other law in this repo. **The denial is the answer, not an obstacle between you and the answer.**
⚠️ This warning is aimed at a specific, predictable moment: the item is cheap, decided, composed,
and has now failed to land seven times. **Frustration is the exploit.** If you are reading this
and thinking "but it's only a doc paste" — that is the thought the boundary is for.
