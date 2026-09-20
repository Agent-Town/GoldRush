target: .claude/skills/drain/SKILL.md
anchor: fire-runner.sh:86
why: `729f9963` (owner's auth fix, 2026-08-05 17:33) inserted 5 lines into scripts/fire-runner.sh and rotted three law pointers into it. s1456 re-based the two it could write (CLAUDE.md :88 -> :93, scripts/fire.md :81 -> :86, both re-verified by READING the file). This third one is under .claude/ and the fire shell is denied. Until it lands, `law-pointer-guard` is RED on exactly this one pointer — an honest red, not a broken guard.
opened: s1456 2026-08-05
kind: ACTION (one coordinate, two characters — needs no owner ruling, only an unrestricted shell)

---

## What to do — change one number

Open `.claude/skills/drain/SKILL.md`, line 36. Find:

```
keyed on `CLAUDE_CONFIG_DIR` being PRESENT (launchd and `fire-runner.sh:81` set it; lanes and attended sessions never do)
```

Change `fire-runner.sh:81` to `fire-runner.sh:86`. Optionally add the drift note, matching how
the sibling surfaces now record it:

```
(launchd and `fire-runner.sh:86` — was `:81`, rotted s1456 by the owner's `729f9963` auth fix — set it; lanes and attended sessions never do)
```

## The substance is INTACT — this is a coordinate repair, not a law change

Verified s1456 by reading `scripts/fire-runner.sh` lines 78–98. The alt-fire line the pointer is
*about* is present and unchanged, now at **:86**:

```
86:   CLAUDE_CONFIG_DIR="$HOME/.claude-alt" "$CLAUDE_BIN" -p "$(cat scripts/fire.md)" --model "$FIRE_MODEL" >> "$LOG" 2>&1
```

`:81` today is `RC=$?`, which supports no claim about `CLAUDE_CONFIG_DIR` at all. That is the
precise hazard CLAUDE.md §4.10b names: *a reader following the stale number lands on an unrelated
line and could infer a law violation that never happened.*

## Why the baseline was NOT simply re-based

`node scripts/law-pointer-guard.mjs --update` re-bases **every** pointer wholesale. Running it
would have recorded `RC=$?` as the correct excerpt for this pointer and turned the guard green
while the law still pointed at the wrong line — masking the defect instead of fixing it. So
s1456 surgically re-based only the two coordinates it had verified AND could write, and left this
entry at its old fingerprint deliberately, so the guard keeps naming it until it is really fixed.

## The general lesson this one carries (worth 30 seconds)

`e0b28fae` (s1402) edited this same file and **deliberately preserved its line count** so these
pointers would survive — its commit message says so. That protection was a *convention in one
author's head*, enforced by nothing, and the first commit from outside the factory loop (an ops
fix, by the owner) silently broke all three. This is the **fourth** distinct rot of the §4.10b
retention-epitaph coordinate, and the first from a non-factory commit.

## When you have pasted it

`node scripts/attended-owed-audit.mjs` will detect the anchor and print **LANDED-NOT-ARCHIVED**
with rc=1. Clear it by moving this file to `tasks/attended-owed/archive/` and committing — and
then `node scripts/law-pointer-guard.mjs --update` is finally safe to run for this pointer (or
edit `scripts/law-pointer-baseline.json` key `.claude/skills/drain/SKILL.md -> fire-runner.sh:81`
to `... -> fire-runner.sh:86` with fingerprint `c11d5b8cacd2`, which is the value it already
carries — the line's content never changed, only its number).
