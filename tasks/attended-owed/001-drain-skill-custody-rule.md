target: .claude/skills/drain/SKILL.md
anchor: CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT
why: F-1295-1's custody cure is law in scripts/fire.md §3.0b but absent from the surface a drainer actually reads. Fires cannot write .claude/ (F-1027-4).
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
s1342, `c92aa8b9`). This is purely a propagation to the sibling surface, and the only reason a
fire has not done it is the `.claude/` permission gate. Three fires in a row (s1295, s1342, s1343)
have now composed this same text and been unable to land it.

## Placement note

It belongs *after* the clean-main bullet specifically, because it is that bullet's **inverse** and
reads as a non-sequitur anywhere else: clean-main asks whether someone else's dirt contaminates
your gate; this asks whether your gate leaks.

## The exact text to paste

- [ ] **CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT *DECIDED* TO MERGE INTO MAIN'S WORKING TREE. GATE UNDECIDED CONTENT IN A DETACHED WORKTREE (F-1295-1 s1295; law at `scripts/fire.md` §3.0b s1342; this surface s1343, F-1343-1 — the cure sat in `fire.md` alone while THIS is the surface a drainer actually reads).** ⚠️ **This is the INVERSE of the clean-main bullet above, not a restatement of it:** that one asks whether *someone else's* dirt contaminates your gate; this asks whether **YOUR gate leaks**. `CLAUDE.md:50` Mistake #12's "detached worktrees" is about *contention* — a different question, and F-1295-1 explicitly distinguishes it. 🎯 s1294 checked four lane paths into main's tree to evaluate a slice, wrote **VERDICT: HOLD — NOT MERGED**, reverted with `git checkout HEAD -- <paths>`, confirmed `git status` clean, and was **wrong**: a concurrent attended session's broad `git add` had already committed all four at **`b37c1fc6`**, under a message about "rehearsal round 2" naming none of them, **thirteen minutes before the handoff denying it**. 🔑 **Every probe that fire had returns the SAME answer either way** — `git status` cannot detect a sweep because **a sweep's signature is the ABSENCE of dirt**, and `git checkout HEAD -- <paths>` restores *from* a HEAD that has itself moved, so the "revert" **re-installed** what it was undoing. The only discriminating probe is a **blob-hash compare against a PRE-sweep ref**. ⚖️ **A HOLD verdict has NO ENFORCEMENT SURFACE** — it lives in a review file and a goal leaf; **nothing in git defends it**, and the same window ships an owner-**BLOCKED** slice (§0 line 1) just as readily. Cost of the cure: one `git worktree add` + a `node_modules` symlink. ⓘ **Scope, stated so you don't over-correct:** F-1295-1 measured the **working-tree** case only. Gating by `git merge --no-ff` and planning to revert on a red (§3) puts undecided content on **HEAD** — structurally the same bet against concurrency, but **UNMEASURED**; treat as caution, not proven.

## When you have pasted it

`node scripts/attended-owed-audit.mjs` will detect the anchor in the target and print
**LANDED-NOT-ARCHIVED** with rc=1. Clear it by moving this file to `tasks/attended-owed/archive/`
and committing — that rc=1 is the guard asking for bookkeeping, not reporting a problem.
