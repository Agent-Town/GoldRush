# Task f2082-1: the node-guards contention probe counts OBSERVERS as batteries — make it count batteries (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s2082, from F-E6HS-3 in `reviews/e6-homemaker-headless-socket.md:8` (2026-08-20), third sighting of the class (F-1606-1 → F-2080-1 → F-E6HS-3).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.
READ FIRST: `AGENTS.md`; `scripts/run-node-guards.mjs` lines 37–82 (the whole `contentionStamp()` plus both call sites at `:76`/`:81`); `scripts/node-guards-contention.test.mjs` in full (it is the guard you must keep honest — note `waitForQuietBoard()` at `:35–:48` and the sibling spawn at `:129–:137`); `scripts/node-guards-concurrency.mjs` in full (27 lines, pure, no side effects — verified by the authoring fire; this is where the shared predicate goes).

CONTENT KEY (each proved by the authoring fire to return **1** on main at `58b61d11f`, and each sits on ONE line so `grep` can see it):
- `grep -Fc "const siblings = processes.filter" scripts/run-node-guards.mjs` → **1**
- `grep -Fc "concurrent batteries" scripts/run-node-guards.mjs` → **1**
- `grep -Fc "node-guards board did not stay quiet" scripts/node-guards-contention.test.mjs` → **1**

If any returns 0, the file has moved under you — STOP and report "citation key absent — master stale". Do NOT hunt for a lookalike line.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/lane-a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

⚠️ **RETARGETED s2082: this master was authored for lane-c, which went BUSY (the attended B1 master claimed it) between authoring and dispatch — it now runs in lane-a.** The lane is ~97 commits behind main, but the three files this task touches are BYTE-IDENTICAL between `lane/lane-a` and main (measured by the authoring fire: `git diff --stat lane/lane-a main -- scripts/run-node-guards.mjs scripts/node-guards-contention.test.mjs scripts/node-guards-concurrency.mjs` → empty). The pre-flight reset to main makes the lane current regardless; this note exists so you do not mistake the staleness warning for a blocker on THIS task.

## Why (F-E6HS-3, `reviews/e6-homemaker-headless-socket.md:8`, dated 2026-08-20)

The finding, verbatim: *"F-E6HS-3 `run-node-guards.mjs:39` self-match class (the pgrep-prose trap, third sighting)"*.

`contentionStamp()` asks "is another copy of this battery running?" with `pgrep -f 'run-node-guards'` (`:39`) — a pattern that matches **any process whose command line merely mentions the battery**, then counts process-forest ROOTS and reports `siblings + 1` (`:59–:60`). Both halves are wrong, and the authoring fire measured them live rather than reasoning about them.

**MEASUREMENT A — 2026-08-20 ~11:38 local, full attribution of every match (`ps -o pid=,ppid=,command=`):**

| pid | ppid | root? | actually runs the battery? | what it is |
|---|---|---|---|---|
| 77520 | 77508 | yes | **yes** | `sh -c node scripts/run-node-guards.mjs scripts/same-game-audit.test.mjs …` |
| 77521 | 77520 | no | yes | the `node` child of the above (same forest) |
| 92086 | 40448 | yes | **NO** | `/bin/zsh -c … until ! pgrep -f "run-node-g…` — **a loop WAITING for the battery to finish** |

`contentionStamp()` counted **2 roots** and reported **"CONTENDED — 3 concurrent batteries"**. True battery count: **1**.

**MEASUREMENT B — ~11:41 local, a different board, same shape.** Four matches from `.claude/worktrees/agent-a074ca5aabe748fbe`: one genuine battery forest (`96526` zsh → `96528` `node scripts/run-node-guards.mjs scripts/fixture-teardown.test.mjs`, plus sibling `96529`), and again a root at `97116` running `until ! pgrep -f "run-node-g…`. Roots counted **2**, reported **"CONTENDED — 3"**, true batteries **1**. A harness invocation made at that instant printed `CONTENDED — 3` twice while exactly **2** batteries existed (the agent's and its own) — over by exactly one, the waiter.

➡️ **The class in one sentence: a process whose only job is to WAIT for the battery is counted AS a battery.** That is the pgrep-prose trap — mention is not execution — and it is systemic, not a fluke: the wait-for-quiet loop is a standard idiom in this factory, and `waitForQuietBoard()` in the guard itself is another instance of the same predicate.

**THE SECOND HALF — an off-by-one that fires even on an empty board.** Read `:59–:60`: `siblings` counts forest roots, and **the calling harness's own root is one of them**; the code then reports `siblings + 1`, adding a self that is already counted. So one battery alone yields `siblings = 1` → **"CONTENDED — 2 concurrent batteries"**, and the probe can never be silent while it is itself running. ⚠️ **This half is INDICATED, NOT PROVEN, and you must prove it before curing it:** the authoring fire saw a provably quiet board (`pgrep` exit 1, zero matches) in one command and a lone harness run printing `CONTENDED — 2` twice in the immediately preceding command — adjacent commands, not the same instant, so a battery could have started and stopped between them. A control that tried to close that gap returned INCONCLUSIVE because the agent worktree kept launching batteries. **Prove it or disprove it on a controlled board and report which; if it turns out silent when truly alone, say so and cure only the observer half.**

✅ **INDEPENDENT CORROBORATION, found after the measurements above and pointing the same way:** the original F-E6HS-3 text in `tasks/BACKLOG.md:3981` records that *"a solo directly-launched battery printed \"CONTENDED — 2 concurrent batteries\" with no second battery alive"*. A count of **2** means exactly **one** forest root was found — which is what the harness's own process contributes. That is two independent sightings, by different sessions, of the same arithmetic. It still is not a controlled experiment (that report also had a watcher loop running at other times, and attributes the stamp to it), so scope 3 still owes a real control — but you should expect to CONFIRM, not refute.

**WHY THIS MATTERS MORE THAN A COSMETIC MISCOUNT — the red has been institutionalised as a standing excuse.** `tasks/f2081-1-e6-capture-truth-pass.md:52` instructs its runner, verbatim: *"⚠️ **KNOWN-RED, PRE-DECLARED:** `node-guards-contention` reds whenever another session holds a `run-node-guards` process (F-1606-1 / F-2080-1 — it counts observers as batteries). If that is your ONLY failure, proceed and say so."* `reviews/e6-homemaker-headless-socket.md:6` excuses a node-guards red the same way (*"contention = another battery measured live on the box"*). The mechanism is already named in the excuse — so this is not an unknown defect, it is a known one that every master now routes around. **`scripts/fire.md`'s own F-1460-1 clause: "A red nobody investigates is worse than no test."**

⚖️ **STATE BOTH TRUTHS AND DO NOT OVERCLAIM.** There IS genuine concurrent-battery pressure on this box — Measurement B's agent worktree really was running one. The defect is that the instrument inflates it, so a real signal and a false one are indistinguishable. That plausibility is precisely why the excuse survived three sightings. Your cure's success criterion is **"when it says CONTENDED, it is right"**, not "it stops saying CONTENDED".

## Scope

1. **Put ONE shared predicate in `scripts/node-guards-concurrency.mjs`** that answers *which pids are running the battery* — exported, pure where it can be, and imported by BOTH `run-node-guards.mjs` and `node-guards-contention.test.mjs`. The authoring fire verified that module is side-effect-free (27 lines, two constants and a pure function), so importing it is safe — unlike `run-node-guards.mjs`, which spawns the battery at import time (see its own comment at `:32–:34`). **One predicate, two callers, no second implementation**: a cure that fixes the harness and leaves `waitForQuietBoard()` on the raw pattern will keep the guard red for the original reason.
2. **Discriminate INVOCATION from MENTION.** A match counts only if its command line is a node invocation of the harness (the authoring fire's working shape was a regex of the form `node <optional path>run-node-guards.mjs`, which scored the table above correctly: `RUNS-BATTERY=true` for both real forest members, `false` for both waiter loops). Derive your own and say what you chose. It MUST reject: a `pgrep`/`until ! pgrep` waiter loop, a `grep` for the name, a shell whose argv merely contains the string, and this task file's own name.
3. **Report the true count, and be silent at one.** Collapse each process forest to its root (the existing root-collapse at `:55–:59` is sound and its comment explains why — keep that reasoning), then emit a stamp only when **two or more genuine batteries** exist, naming the true number. No `+1` for a self that is already in the set.
4. **Keep it advisory. This is not negotiable.** The stamp is printed to stderr at `:77` and `:81` and must never influence `process.exit` (`:82`). The guard's existing assertions that exit codes match between contended and uncontended runs (`:143–:146`) must keep passing untouched, as must the `PATH: ''` arm at `:125–:127` (no `pgrep` on PATH → silent, status unchanged).
5. **Re-examine the guard's sibling fixture before trusting it — the authoring fire believes its central comment may be false.** `:129–:130` claims the spawned `sh -c` wrapper matches the pattern and collapses with its node child, "matching the process shape produced by npm run". But `:131` spawns `/bin/sh -c '"$NODE_BIN" "$HARNESS_PATH" "$FIXTURE_PATH"'` — the shell's argv holds those variable names **unexpanded**, so it plausibly never contained "run-node-guards" and never matched at all, leaving only the node child. **Measure it** (`ps -o command=` on the spawned shell), report what you find, and if the fixture does not actually reproduce the npm shape, fix the fixture so it does — a guard whose fixture does not build the case it claims to build is the F-1460-1 disease one level down. Do not silently delete the comment.
6. **Add the red path this guard has never had: a WAITER.** Manufacture the exact contaminant measured above — a detached loop whose command line mentions the harness but never runs it (`until ! pgrep -f 'run-node-guards'; do sleep …; done` shape) — and assert the stamp does **NOT** count it. Prove it bites by confirming the new assertion FAILS against the pre-cure predicate and passes after (the house standard: a passing guard never executes its violation path, so its green is not evidence about the red). Reap the process in a `finally` exactly as `stopGroup()` already does at `:97–:104`; leaving a stray waiter behind would contaminate every later battery on the box.
7. **Update the guard's expectations to the corrected arithmetic.** `STAMP` at `:11` hardcodes `'CONTENDED — 2 concurrent batteries'` and `assertTwoStamps` at `:31–:33` asserts it twice; if scope 3 changes what one sibling produces, these move with it. Keep the two-stamps-per-run structure (before and after the child) — that is deliberate, so a stamp is visible even when the battery's own output is long.

**Deliberately NOT in scope, and do not add it:** any change that makes the stamp gate an exit code, any retry/backoff/serialisation of the battery itself, and any new script file. A new `scripts/*.mjs` would red `gate-caller-audit` under an innocent name and is unnecessary — scope 1 has a home that already exists.

## Firewall

Touch ONLY: `scripts/run-node-guards.mjs`, `scripts/node-guards-contention.test.mjs`, `scripts/node-guards-concurrency.mjs`.

NO changes to: `package.json` (do not re-root or rename the npm scripts) · any other `scripts/**` file, including every `*.test.mjs` in the battery · `playwright.config.ts` (the `workers: isFireShell` line is load-bearing law, §3.1) · `src/**` · `e2e/**` · `tasks/**` · `specs/**` · `reviews/**` · `artifacts/**` · `logs/**` · `STATUS.md` · `CLAUDE.md`. ⚠️ **`scripts/fire.md` and `CLAUDE.md` both cite `run-node-guards.mjs` behaviour in prose; you may NOT edit them — if your cure makes a law sentence stale, REPORT the exact sentence and let the drain re-base it.**

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/node-guards-contention.test.mjs` green — run it **ALONE**, and record `pgrep -f 'run-node-guards'` immediately before and after so your green is attributable rather than lucky.
- **The manufactured-red proof for scope 6**, pasted: the new waiter assertion failing against the old predicate, then passing against the new one.
- **A live attribution table** in the shape of Measurement A (pid, ppid, root, runs-battery, command) for whatever board you had, showing the cure's count matches the true battery count.
- Your scope-5 verdict on the sibling fixture, with the `ps -o command=` output you based it on.
- `npm run test:node-guards` green. **Run it ALONE** — ~181 s, and it contends with any concurrent battery (§3.1). ⚠️ Since this task's whole subject is that stamp, **do not excuse a `node-guards-contention` red as contention** — that is the circularity this task exists to break. If it reds, attribute it with the table above.
- No screenshots required: this task renders nothing. Do not regenerate `artifacts/**`.

**No-op guard:** if you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: READY-FOR-GATES + report (a) the predicate you wrote and what it rejects, verbatim; (b) whether the off-by-one half reproduced on a controlled board — PROVEN or DISPROVEN, with the control; (c) your scope-5 verdict on the sibling fixture; (d) any law sentence in `scripts/fire.md` / `CLAUDE.md` your cure makes stale, quoted exactly, unedited; (e) anything adjacent you noticed and did NOT touch.
