# Task f1576-1: decide a new guard's rooting IN THE MASTER, and let the audit be asked before the commit (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1576, from **F-1576-1**, which I found and cured at the f1574-1 drain in the same fire. I did not infer the mechanism from prose: I read `scripts/gate-caller-audit.mjs` and confirmed the subject set is `git ls-files` before writing a line of this task.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1576-1** — the whole row, it is the specification; `reviews/f1574-1-review-evidence-audit.md` — **the `## Drain (s1576…)` section at the end, which records the incident with its exact output**; `scripts/gate-caller-audit.mjs` — **the header comment block AND `tracked()` at `:83-87` and the subject assembly at `:236-246`; you are adding an opt-in path there and must not disturb the default**; `scripts/gate-caller-baseline.json` — the entry keyed `scripts/review-evidence-audit.mjs`, which is the worked example of the disposition you are teaching; `.claude/skills/author-task/SKILL.md` §0 and §6 — **the two sections your new step must fit between in voice and length**; `CLAUDE.md` §6 (quality bars) and §4.5 (firewalls are contracts).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** ✓ **MEASURED AT DISPATCH (s1576, `node scripts/lane-usable.mjs --all`): `lane-b lane/b ahead=0 behind=10 paths=0 tracked-dirt=0 untracked=0 → USABLE`.** The lane holds nothing main has not absorbed, so a reset to main is provably lossless — **but USABLE is not CURRENT, and this task depends on commits inside those 10.** Therefore: confirm `git -C worktrees/lane-b log main..lane/b --oneline` is **empty**; if it is, `git checkout -B lane/b main && git clean -fd` and PROCEED. **STOP-and-report if that log is NON-empty** (undrained work — resetting would DESTROY it, the w1-03/polish-02 casualty), or if the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH after the reset, before any edit).** Each key is a single line, verified by me to print `1` **on main** at dispatch (s1576), per F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from:

```sh
grep -c 's1576 F-1576-1: DELIBERATELY UNROOTED' scripts/gate-caller-baseline.json
grep -c 'review-evidence-audit' .claude/skills/drain/SKILL.md
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the s1576 drain commit (`4cfde97ea`) is present, and because it is the newest of the relevant commits it also proves the f1574-1 merge (`c44076267`). The second proves the drain-duty line from that slice is here.

## Why (F-1576-1, measured s1576 at the f1574-1 drain)

`test:node-guards` went **rc=1 on the merged tree** — `gate-caller-audit`: `NEW scripts/review-evidence-audit.mjs NO CALLER` — on a tree whose code was green and whose runner had honestly reported the **same battery 399/399 green**. Both reports were true.

✓ **VERIFIED by reading `scripts/gate-caller-audit.mjs:84`:** the subject set is **`git ls-files`** — tracked files only — and `GUARDISH_FILE` (`:71`) matches the word `audit`. **The lane runner auto-commits only at the END of its run**, so when the runner ran the battery its own new script was still untracked and the audit was *structurally incapable* of seeing it. The green was vacuous for the one file the slice existed to add.

**This is the third instance of one shape, and the baseline already says so twice in its own prose** — `desk-carryforward-guard.mjs` (s1533: *"this audit's own green was VACUOUS for this file until it was committed"*) and `desk-state-audit.mjs` (s1566: *"the red appeared only on the post-commit run"*). Three instances is a mechanism question, not three accidents. It is **F-1300-4 one axis further out**: that law ordered `test:ledger-guards` as a fire's last act, but `gate-caller-audit` lives in the **436 s `test:node-guards`**, so the cheap last-act battery cannot catch it.

The cost is concrete and repeats every time: a **436-second** battery re-run at the drain, plus a disposition decision made under drain pressure by someone who did not write the script.

⚖️ **Two things this task must NOT do.** It must not make the default audit read the working tree — the header's *"the subject is derived from git, not from readdir, so there is nothing to audit"* is a deliberate F-1252-1-family choice and scratch probes would red the board. And it must not turn the authoring step into a hard gate on `tasks/**` — "is this file guard-shaped" is a filename heuristic, and a red guard on a heuristic gets excused into uselessness inside a week (the `cross-engine` fate, F-1460-1).

## Scope

1. **Add an opt-in `--include-untracked` to `scripts/gate-caller-audit.mjs`.** When passed, the subject set is the union of `git ls-files` and `git ls-files --others --exclude-standard`; **the default is unchanged in every respect.** `SCRATCH_FILE` (`^scripts/tmp-s\d+-`) must still exclude scratch probes in the new path too. Print the flag's effect in the denominator line so a reader can tell which mode produced a verdict — e.g. append `(+N untracked)` to the existing `scripts/ files` count when the flag is on, and nothing at all when it is off.

2. **Do not let the flag weaken the ratchet.** An untracked orphan must report as `NEW` exactly like a tracked one, and `--update-baseline` combined with `--include-untracked` must **REFUSE** (exit 2, with a message): grandfathering a file that is not yet in git would bank a reason for a path that may never be committed. State that refusal in the header comment.

3. **Teach the disposition in `.claude/skills/author-task/SKILL.md`.** Add **one short numbered step to §0** ("Before writing ANYTHING, verify four facts") — it becomes five facts, so **renumber the section heading and any internal count wording to match**. The step: *if the master creates a file under `scripts/` whose name matches `(guard|assert|check|audit|contract|ratchet)`, decide its rooting IN THE MASTER — either name the battery that will call it, or write the grandfather reason the master will have its runner add to `scripts/gate-caller-baseline.json` — because `gate-caller-audit` reads tracked files only and the lane runner commits last, so the runner's own battery cannot see the file it just wrote (F-1576-1).* Keep it to **two or three sentences plus the one-line probe** `node scripts/gate-caller-audit.mjs --include-untracked`. ⚠️ **Inserting lines into a law surface ROTS the coordinates below them** — run `npm run test:ledger-guards`; **if `law-pointer-guard` reds, re-base the coordinate it names and say so in your report.** If it reds in a way you cannot cure inside this firewall, **STOP and report — do not edit files outside TOUCH-ONLY to silence a guard.**

4. **Tests in `scripts/gate-caller-audit.test.mjs`** (extend the existing file; match its fixture style, do not start a new one): (a) an **untracked** guard-shaped `scripts/x-audit.mjs` is INVISIBLE by default — the default verdict is byte-identical with and without the file present, **which is the regression test that the default did not move, so label it as such**; (b) the same file under `--include-untracked` reports `NEW … NO CALLER` and exits 1; (c) a tracked, baselined orphan still reports `known` under `--include-untracked`; (d) `scripts/tmp-s999-probe-audit.mjs`, untracked, is excluded by `SCRATCH_FILE` under the flag; (e) `--update-baseline --include-untracked` exits 2 and writes **nothing** — assert the baseline file's bytes are unchanged.

5. **MANUFACTURE THE RED and report its exact output** (F-1299/F-1300 standard — a passing test never executes its violation path, so a green is not evidence about the red). With the cure in place, make the union in item 1 ignore `--exclude-standard` (i.e. include ignored files too) and show which arm fails, naming the assertion and actual-vs-expected. Restore, and confirm the restore.

6. **Replay the real incident, not just a fixture** (the `replay-the-real-incident` standard). In a scratch copy or by `git stash`-style isolation that leaves the tree unchanged, demonstrate that `node scripts/gate-caller-audit.mjs --include-untracked` **would have named `scripts/review-evidence-audit.mjs` before its commit**. If you cannot construct that replay without mutating tracked files, **say so plainly and skip it** — an honest "not constructible" beats a fabricated demonstration.

## Firewall

**Touch ONLY:** `scripts/gate-caller-audit.mjs` — the flag, its header note, and the denominator line; **no change to `GATE_NAME`, `GUARDISH_FILE`, `ANCHORS`, `EDGE_SOURCES`, or any default-path behaviour** · `scripts/gate-caller-audit.test.mjs` — additions only, do not rewrite existing arms · `.claude/skills/author-task/SKILL.md` — **the single §0 step of item 3, its renumbering, plus any coordinate re-base item 3 forces** · `reviews/f1576-1-guard-rooting-at-authoring.md` (new, your report).

**NO changes to:** `scripts/gate-caller-baseline.json` — ⛔ **the s1576 entry is the worked EXAMPLE you cite; adding, removing or reworded entries is not yours, and item 2 exists precisely to keep this file out of an untracked-mode write** · `scripts/review-evidence-audit.mjs` and its test — the f1574-1 slice, read-only · `.claude/skills/drain/SKILL.md` — the sibling law surface, read-only · `scripts/run-node-guards.mjs` · `package.json` — **no new npm script; the flag is a human/runner probe, not a battery, and rooting it would contradict item 1's own reasoning** · `scripts/fire.md` · `CLAUDE.md` · `STATUS.md` · `tasks/**` · `tasks/goals.json` · `tasks/BACKLOG.md` · any `src/**`, `e2e/**`, `specs/**`.

🔓 **No firewall lift is granted.** If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time and the asset-diet line. `node --test scripts/gate-caller-audit.test.mjs` — quote tests/pass/fail and name each new arm. `npm run test:ledger-guards` green — quote the totals, name which chained leaves ran, **and state explicitly whether `law-pointer-guard` reddened and what you re-based**. `npm run test:node-guards` green — **this is the ~436 s battery and it must be run ALONE, not overlapped with another battery** (s1536 hung ~19 min doing exactly that on shared fixtures); quote the tests/pass/fail/skip line. **Then run `node scripts/gate-caller-audit.mjs` (default) and `--include-untracked` and quote BOTH summary lines verbatim** — the default's must be identical to main's.

⚠️ **RUN `gate-caller-audit` ONE MORE TIME AFTER YOUR FINAL `git add`, and quote it.** That is this task's own subject: your battery runs before your commit, so it is blind to files you have just created. **This is the first task in the factory required to check itself against its own finding — if it reds, that is a result, not a failure; report it.**

**No Playwright is owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`; **say so explicitly rather than silently skipping.**

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1).

**READY-FOR-GATES** + report: both `gate-caller-audit` summary lines (default and `--include-untracked`), and the post-`git add` re-run · the manufactured RED's exact assertion output and the confirmed restore · whether the item-6 replay was constructible and what it showed · whether `law-pointer-guard` reddened and what you re-based · the exact `.claude/skills/author-task/SKILL.md` text you added · anything adjacent you found and deliberately did not fix.
