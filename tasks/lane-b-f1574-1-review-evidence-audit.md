# Task f1574-1: a review that cites evidence the repo does not contain says so out loud (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1574, from the **open residue of F-1573-1**. I did not inherit the shape of this check: I ran the predicate over the live review corpus before writing a line of this task, and the first version of it was wrong in a way that matters (see WHY).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1573-1** — **the whole row, and in particular its closing paragraph beginning "RESIDUE, STILL OPEN", which is the thing you are building**; `reviews/f1572-1-lane-arm-uncensored-drift.md` — **the slice whose evidence was being silently dropped, and the review whose citation was true of the disk and false of the repo**; `scripts/desk-state-audit.mjs` — **the whole file; it is the ADVISORY-TOOL PRECEDENT you are copying (exit 0 always, `--strict` opt-in) and you should match its verdict-printing style**; `scripts/citation-title-guard.mjs` — **the header comment ONLY, ~30 lines, because it is the nearest neighbour and you must not duplicate it: it checks test TITLES in `tasks/**`, you are checking evidence-file EXISTENCE cited in `reviews/**`**; `CLAUDE.md` §4.10b (the RETENTION LAW) and §4.1 (evidence, not vibes).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** ✓ **MEASURED AT DISPATCH (s1574, `node scripts/lane-usable.mjs --all`): `lane-b lane/b ahead=0 behind=11 paths=0 tracked-dirt=0 untracked=0 → USABLE`.** The lane holds nothing main has not absorbed, so a reset to main is provably lossless — **but USABLE is not CURRENT, and this task depends on commits from the last 11.** Therefore: confirm `git -C worktrees/lane-b log main..lane/b --oneline` is **empty**; if it is, `git checkout -B lane/b main && git clean -fd` and PROCEED. **STOP-and-report if that log is NON-empty** (undrained work — resetting would DESTROY it, the w1-03/polish-02 casualty), or if the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH after the reset, before any edit).** Each key is a single line, verified by me to print `1` **on main** at dispatch (s1574), per F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from:

```sh
grep -c '!artifacts/\*\*/\*.log' .gitignore
grep -c '^\*\*Slice:\*\* `f1572-1-lane-arm-uncensored-drift`' reviews/f1572-1-lane-arm-uncensored-drift.md
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the s1573 `.gitignore` cure (`76ba6b970`) is present, and because it is the newest of the three relevant commits it also proves the f1572-1 merge (`d4380c4aa`) and its drain (`87b538276`) are in the lane. The second proves the review file you must read is actually here.

## Why (F-1573-1 residue, and a predicate I ran before specifying it)

F-1573-1 found the f1572-1 runner's **24 `run-NN.log` files** — the raw per-test detail its review cites by path — being silently swallowed by the repo-wide `*.log` rule at `.gitignore:7`. The logs were rescued by hand at the drain (`git add -f`), and `76ba6b970` narrowed the ignore rule going forward. **Neither of those is the durable fix, and the finding says so:**

> "the DURABLE fix is not the ignore line, it is the DRAIN DUTY. This cost nothing only because the drain happened to open the artifact directory by hand; nothing yet makes a drain *notice* that a review cites evidence the repo does not contain."

**The failure mode is SILENCE.** `git status` shows an ignored file as nothing at all, and a path-scoped `git add` drops it without a word. A review then goes on citing that path in perfect good faith. The citation is **true of the disk and false of the repo** — and the repo is the only copy that survives the disk.

✓ **MEASURED s1574 on main, before this task was written** — the predicate is constructible and, correctly built, it is quiet:

| | count |
|---|---|
| tracked review files scanned (`git ls-files reviews`, `*.md`) | **796** |
| backticked citations matching `artifacts/…` or `reviews/shots-…` | **1043** |
| …of which glob/placeholder shapes (`{}<>*?\|`, `..`) | **306** |
| …literal paths | **735** |
| literal paths resolving to tracked content | **722** |
| **UNRESOLVED** | **13** |
| of those, on disk but untracked (**the F-1573-1 shape**) | **0** |
| of those, absent entirely | **13** |

⚠️ **AND THE FIRST VERSION OF THAT PREDICATE REPORTED 274, WHICH IS THE MOST IMPORTANT THING IN THIS TASK.** My naive pass asked `git ls-files` whether each cited path was tracked. **`git ls-files` never lists directories**, and the overwhelming majority of evidence citations in this corpus are directories — `artifacts/043/`, `reviews/shots-023/`, `artifacts/map-census/`. So 261 perfectly healthy citations read as violations. **A guard shipped in that state would have fired on ~37% of all citations on day one and been excused into uselessness inside a week** — precisely the `cross-engine` fate F-1460-1 records. Directory-awareness is therefore **load-bearing, not polish**, and it is scope item 2c.

⚖️ **This is why the check is WARN-level and must stay that way.** "Cited path" is a judgement — prose says `` `reviews/shots-…` `` and `artifacts/057|060|ss-02` and means neither as a literal path. A hard red on a judgement gets excused; an advisory list gets read.

## Scope

1. **Ship `scripts/review-evidence-audit.mjs`.** Default invocation takes one or more review file paths and audits them — **that is the drain's use, and it is the default because it is the common case.** `--all` sweeps `git ls-files reviews` (`*.md`). **ADVISORY: exit 0 on every input including its own error path**, exactly like `scripts/desk-state-audit.mjs`; `--strict` is the only path that may return non-zero, and it does so only when the **ON-DISK-UNTRACKED** bucket is non-empty (see 3).

2. **Extraction rules — implement these exactly, they are the measured ones:**
   a. Consider backticked spans (`` `…` ``) whose content matches `^(artifacts|reviews/shots-)\S*$`.
   b. **SKIP as a placeholder**, counting it separately, any span containing `{`, `}`, `<`, `>`, `*`, `?`, `|`, `..`, or the ellipsis character `…`. ⓘ **The ellipsis is NOT in my measured skip class above** — I left it in and it accounts for 2 of the 13 unresolved (`` `reviews/shots-…` ``, `` `reviews/shots-beauty-town/u1…u8/` ``). **You are adding it, so expect ~11 unresolved rather than 13, and say which you got.**
   c. **Resolve directory-aware:** strip any trailing `/`, then strip a trailing `:<digits>` line-suffix (3 of the 13 carry one, e.g. `artifacts/gr-sim/ap-07/report.md:14`). A citation RESOLVES if it is a tracked file **or** a prefix of any tracked path — build the directory set once from `git ls-files`, do not shell out per citation.

3. **Four buckets, and ON-DISK-UNTRACKED must be named distinctly from ABSENT.** `TRACKED` · `ON-DISK-UNTRACKED` (exists on disk, not in git — **this is the F-1573-1 disease: bytes that die with the disk**) · `ABSENT` (neither; usually old evidence long since cleaned, a much weaker signal) · `SKIPPED`. **Do not merge the last three into one "problem" number** — they carry different owed acts (`git add -f` vs. nothing vs. nothing), and collapsing them is the mistake `art-staging-audit` had to be fixed for twice (F-1054-1, F-1055-1).

4. **Print the denominator you actually looked at**, in the house style of `lane-freeze-classify` (`paths=N`): files scanned, citations found, skipped, and the bucket split. A verdict whose denominator is invisible cannot be audited.

5. **Tests in `scripts/review-evidence-audit.test.mjs`, built in a temp tree** (never pinned to the live corpus — it changes under you; follow the fixture style of `scripts/master-shipped-classifier.test.mjs`): (a) a review citing a tracked file → `TRACKED`; (b) a review citing a **tracked directory** → `TRACKED` — **this is the 274-vs-13 regression test, label it as such in the test name**; (c) a review citing an on-disk-but-ignored `.log` → `ON-DISK-UNTRACKED` and `--strict` exits non-zero; (d) a review citing `artifacts/x/run-{01..12}.log` → `SKIPPED`, not a violation; (e) a citation with a `:14` line-suffix resolves against the file without it; (f) default mode exits 0 even when bucket (c) is non-empty.

6. **MANUFACTURE THE RED and report its exact output** (F-1299/F-1300 standard — a passing test never executes its violation path, so a green is not evidence about the red). With the cure in place, disable the directory-prefix resolution and show test (b) failing, naming the assertion and the actual-vs-expected values. Restore, and confirm the restore.

7. **Run it over the LIVE corpus** (`--all`) and report the headline, banking the output at `artifacts/f1574-1-review-evidence/live-corpus.txt`. ⚠️ **Expect ~796 files / 1043 citations / 735 literal / ~11 unresolved / `ON-DISK-UNTRACKED` = 0.** The zero is the load-bearing prediction and it has a **known cause**: s1573 rescued f1572-1's 24 logs by hand, so the one live instance of the disease was cured days before you built the detector. **If ON-DISK-UNTRACKED is non-zero, that is a genuine find — report it with the paths, do NOT `git add` them** (that is a drain's call, not a runner's). **Do not tune toward my numbers**; if the counts differ materially under the rules in item 2, that is a finding.

8. **Wire the duty so the cure is not inert** (memory: a shipped cure is inert until a law cites it). Add **one** step to `.claude/skills/drain/SKILL.md`, in the review-file section, instructing the drain to run this tool on the review it is about to commit and to `git add -f` any `ON-DISK-UNTRACKED` evidence that falls inside the task's declared TOUCH-ONLY scope. **Keep it to a few lines.** ⚠️ **Inserting lines into a law surface ROTS the coordinates below them** — `scripts/law-pointer-guard.test.mjs` exists for exactly this. Run `npm run test:ledger-guards`; **if `law-pointer-guard` reds, re-base the coordinate it names and say so in your report.** If it reds in a way you cannot cure inside this firewall, **STOP and report — do not edit files outside TOUCH-ONLY to silence a guard.**

9. **Root the new test** so `gate-caller-audit` stays green: add `scripts/review-evidence-audit.test.mjs` to the `test:node-guards` list in `package.json`. **Do NOT add it to `test:ledger-guards`** — that battery is the cheap last-act one and this tool reads the whole review corpus.

## Firewall

**Touch ONLY:** `scripts/review-evidence-audit.mjs` (new) · `scripts/review-evidence-audit.test.mjs` (new) · `package.json` — **the `test:node-guards` line ONLY, adding exactly one filename; no dependency changes, no version bump, no other script** · `.claude/skills/drain/SKILL.md` — **the single duty step of item 8, plus any coordinate re-base item 8 forces** · `artifacts/f1574-1-review-evidence/live-corpus.txt` (new) · `reviews/f1574-1-review-evidence-audit.md` (new, your report).

**NO changes to:** `.gitignore` — ⛔ **the s1573 cure `76ba6b970` is deliberately narrow; widening it is not yours and a blanket `!**/*.log` is the F-1027-2 black-hole shape** · `scripts/citation-title-guard.mjs` and its baseline — the nearest neighbour, read-only; **do not merge your check into it** · `scripts/desk-state-audit.mjs` — the precedent you copy, not edit · `scripts/art-staging-audit.mjs` · any existing `reviews/*.md` — ⛔ **especially `reviews/f1572-1-lane-arm-uncensored-drift.md`: it is the EVIDENCE for F-1573-1 and must stay byte-identical; your tool READS reviews and never writes them** · `artifacts/f1572-1-lane-arm/**` — the 24 rescued logs, leave byte-identical · `tasks/**` · `tasks/goals.json` · `tasks/BACKLOG.md` · `STATUS.md` · `CLAUDE.md` · `scripts/fire.md` · any `src/**`, `e2e/**`, `specs/**`.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. `node --test scripts/review-evidence-audit.test.mjs` — all tests pass, quote the counts. `npm run test:ledger-guards` green — quote files/tests/pass/fail and name which chained leaves ran, **and state explicitly whether `law-pointer-guard` reddened and what you re-based**. `npm run test:node-guards` green — **this is the ~181 s battery and it must be run ALONE, not overlapped with another battery** (s1536 hung ~19 min doing exactly that on shared fixtures); quote the tests/pass/fail/skip line. Live CLI: single-file mode and `--all`, default rc=0, `--strict` rc as designed; quote the summary line verbatim.

**No Playwright is owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`; **say so explicitly rather than silently skipping.**

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1).

**READY-FOR-GATES** + report: the live-corpus split with its denominator, and whether it matched the predicted ~735 literal / ~11 unresolved / **0 ON-DISK-UNTRACKED** · the manufactured RED's exact assertion output and the confirmed restore · whether `law-pointer-guard` reddened on the SKILL.md edit and what you re-based · the exact `.claude/skills/drain/SKILL.md` text you added · anything adjacent you found and deliberately did not fix.
