---
name: author-task
description: Write a Gold Rush task master that cannot fail the known ways — correct pre-flight for its slot, evidence-quoted WHY, testable scope, firewall, exact gates. Use whenever work needs a new task file (correctives, spec slices, re-lands, re-runs), whether fire-authored or attended.
---

# /author-task — write a master that survives contact with the factory

## 0. Before writing ANYTHING, verify three facts (two minutes, saves a wasted run)
1. **Not already shipped**: run `node scripts/drain-block-check.mjs <master> --queue` — exit 1 means STOP (`ALREADY SHIPPED — DO NOT QUEUE` or a block); corroborate with a grep of `tasks/BACKLOG.md` for the work (Mistake #8: the 824k Flail). Partially shipped → scope ONLY the delta and cite the shipping commit.
2. **The premise is true on current main**: grep/read the actual code lines your task will claim ("the bench is ?debug-gated at AssayBench.ts:189" — go LOOK). A task with a false premise no-ops or flails. Quote file:line in the task.
3. **The right slot**: main = repo-root serial (fixes/balance/cross-cutting) · lane-a meta/science · lane-b agent · lane-c world/visual/polish · lane-d perf/foundation · art = generation only. Sequencing law needed? (e.g., "after X MERGES") — write it as a verifiable git check, with the SEARCH WINDOW WARNING below.

## 1. The skeleton (every section mandatory)
```markdown
# Task <id>: <imperative title> (<SLOT>, commit prefix "<type>:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in <workdir>.
READ FIRST: AGENTS.md; <the spec slice / review / playtest doc that authorizes this — real paths>.
<SEQUENCING LAW if any — see §2 wording>
<PRE-FLIGHT — copy the exact template for the slot, §3>

## Why (<evidence source, dated>)
<Owner words verbatim in quotes, or the F-ID finding with its evidence. Include verified file:line facts.>

## Scope
1..N. <Each item independently testable. If an item can't fail a check, it isn't scope, it's prose.>

## Firewall
Touch ONLY: <explicit list>. NO changes to: <explicit list — always include: sim semantics unless that IS the task, existing e2e assertions, other tasks' fresh work>.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. <New/updated spec> green desktop+mobile. <Adjacent suites by name> unmodified-green both projects. Zero console/page errors. <Screenshots/artifacts to exact paths.> <Perf line if anything renders.>
End: READY-FOR-GATES + <the specific things to report: root cause found / numbers measured / what was adapted>.
```

## 2. Sequencing-law wording (prevents three real failures)
- Gate on a merge: `verify <commit-ish or a grep of git log --oneline | grep -q '<slice-name>'> — do NOT gate on git log -N with a small N` (a prior task no-op'd because its dependency was 20 commits back — search the WHOLE log or by pattern).
- If the dependency is missing: `STOP and report "<dep> not landed"` — never improvise the dependency.
- **A conditional scope item needs a NAMED lift (F-1082-1, landed s1278).** If any scope item says *"and fix it if you find it"*, the firewall must either name the files it pre-authorizes or carry an explicit `🔓 FIREWALL LIFT: <file>` line. A blanket `NO: any other file under src/` **silently outranks every conditional above it** — the two are mutually exclusive the moment the thing you told Codex to fix lands outside the allowed list, and Codex will correctly resolve it in favour of the firewall and STOP. That is the behaviour CLAUDE.md §4.5 asks for, but it costs a whole run (~120k tokens, `lane-blocked-storage-boot`). Model to copy: `tasks/lane-blocked-storage-boot-2.md:44`.

## 3. Pre-flight templates (copy VERBATIM — every word earned by an incident)
**LANE slots (a/b/c/d):**
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**MAIN slot:**
> Pre-flight: `git status --short` must show ZERO staged/modified TRACKED files (lines not starting `??`) — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.

**ART slot:** no git pre-flight; instead: the style-anchor sentence verbatim in every prompt, exact absolute filenames, grid/cells explicit, NO mirrors, #ff00ff for sheets, measured self-QA, LEDGER entry, NO processing and NO src/ edits, no commits.

## 4. The no-op guard (write it into every corrective/re-run)
> If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## 5. Queue discipline (after writing)
- **GATE THE MASTER *BEFORE* THE QUEUE COPY, NOT AFTER (F-1311-2, mechanism shipped s1312 `98272a1b`).** Run `node scripts/drain-block-check.mjs --strict --queue <master>` as the LAST act before the `cp`. Exit ≠ 0 = **STOP and repair the master**; only then copy. ⚠️ **This ordering is the whole finding, and it is not a style preference.** s1306 did everything right and still dispatched a defective master: this skill told it to copy as soon as the master was written, while the s1301 law runs the battery that JUDGES that master **last** — so `citation-title-guard` reddened against s1306’s own master **~3.5 minutes after the runner had already picked it up**. The corrected master was then re-copied, and the runner lawfully executed **two different VERSIONS** of it (F-1307-1); run 2 stopped only because its pre-flight was the safe-dupe template reading `HOLDS` — **a bare `reset --hard` pre-flight would have destroyed run 1, which is Mistake #2.** The class is data-loss, not token-waste. ⚡ **A guard placed after the act it judges is not a guard, it is a post-mortem.** ⓘ Pass **`--strict`**, not bare `--queue`: the citation check runs only after a goal leaf matches, so an unregistered master exits `? UNKNOWN` at **rc=0** and is never citation-checked (F-1312-1, measured s1312); `--strict` turns UNKNOWN into rc=2 and stops. ✅ The gate calls `citation-title-guard` itself and honours the grandfathered baseline, so legacy re-queues still pass — and it requires the quoted title to be **actually recoverable at the cited line**, so a plausible-looking invented title is refused too. 🔒 **AND THE ORDER IS NOW ENFORCED, NOT MERELY PRESCRIBED (F-1322-1, mechanism shipped s1322 `97e7b1a2`) — because this bullet, exactly as written above, was obeyed and the class recurred anyway.** s1321 copied the pc-01b master, hit the citation red *against the master already running*, repaired it, and re-copied: **two dispatches, two versions, 08:39:26 and 08:57:30**, five sessions after s1312’s cure. The prose could be obeyed but not enforced, and the fire that broke it was following every other law correctly. `--queue` now **refuses at rc=1 (`⛔ ALREADY DISPATCHED`) when a runner already holds this master**, matching the runner’s exact `$slot--$stamp-$name` shape. ⚠️ **Do not read a safe-dupe pre-flight as covering this** — it stopped s1307’s run 2 by side effect, and a **build-on-predecessor** pre-flight (correct whenever a lane is intentionally ahead, as `lane/m4` was) cannot stop anything. ⓘ If you repaired a master *after* copying it, the repair belongs to the NEXT run: let the live run finish, drain it, and judge the repaired master on its own evidence — do not re-copy. An **un-prefixed done-move** only WARNS (`⚠️ UNDRAINED OUTPUT EXISTS`), deliberately: s1320’s §7.5 re-dispatch on a changed premise was lawful with exactly that file present, and a guard that fires on the lawful case gets flagged past.
- Master lives in `tasks/<name>.md`; the queue gets a COPY (`cp`, not `mv`) — **after the gate above passes.**
- Respect THROTTLE (main ≤1 queued while ≥3 drains wait) and LANE-SAFETY (never queue into a lane with undrained content). During bursts: one task per lane per drain cycle (Mistake #9).
- Same-commit ledger: add the BACKLOG ladder line WHEN you write the master (Completeness Law).
- **GOAL REGISTRATION LAW (owner ruling 2026-07-16): every authored master adds its leaf to `tasks/goals.json` IN THE SAME COMMIT** — with `taskFile` set to the master’s filename, which is how `scripts/drain-block-check.mjs` (the §0.1 first-command-of-every-drain guard) finds it. A master with NO leaf is invisible to that guard: it returns "? UNKNOWN" with **rc=0** instead of STOP, and its own output calls that "a bookkeeping finding, not a clearance." Not hypothetical — three consecutive fires (s1163/s1164/s1165) each reached for the same owner-gated master carrying it as "still absent, still authorable", precisely because it had no leaf; a fourth is now stopped. Missing goal-tree bookkeeping means the authoring duty is UNFINISHED.
- **CITATION LAW (F-1223-1 → F-1224-1, guard shipped s1227): a `spec:line` citation must carry its TEST TITLE.** Line numbers drift — 39 of 303 citations in tracked `tasks/**` no longer name the test they were written for, and a rotted citation in a known-reds block either excuses a real red or points at nothing. Write ``e2e/foo.spec.ts:123`` **("the exact title, or an … elided form")**. `npm run test:node-guards` runs `scripts/citation-title-guard.mjs`, which fails on any NEW bare coordinate; the pre-existing debt is grandfathered in `scripts/citation-title-baseline.json` — pay it down by DELETING entries, never by regenerating the baseline to hide a new one. ➡️ **And you no longer have to remember this at review time: §5’s pre-queue gate now refuses a new bare citation in the named master before it can be dispatched.**

## 6. Self-review before saving (the checklist from CLAUDE.md §6)
Role line ✓ paths real (you opened them) ✓ premise verified with file:line ✓ pre-flight verbatim for the slot ✓ every scope item testable ✓ firewall two-sided ✓ suites named not implied ✓ evidence paths exact ✓ no-op guard present ✓ BACKLOG line written ✓. Goal leaf in `tasks/goals.json`, same commit ✓.
