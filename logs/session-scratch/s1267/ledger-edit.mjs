import { readFileSync, writeFileSync } from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = readFileSync(p, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.startsWith('\u{1F6A8} **F-1266-1 (s1266'));
if (idx < 0) throw new Error('anchor not found');

const entry = [
  '✅ **F-1267-1 (s1267, MEASURED — THE RATE EXISTS AT LAST, BOTH SIDES OF IT, AND THE CONTROL FIVE FIRES SKIPPED IS RUN. F-1264-3 STANDS; ONE OF ITS "ELIMINATED" VARIABLES HAD NEVER BEEN MEASURED.)**',
  'v4 (`20260730-194426`) RAN — install, build, four concurrent runs, two serial controls, environment triple, all six self-check items — and the deliverable finally exists:',
  '**lane shell 0 drift reds / 24 concurrent instances, 0 / 12 serial**, node **v23.11.1**, 16 cores, **SwiftShader**. Scope-4 row named explicitly: **0–2 / 24 ⇒ the shells genuinely differ.**',
  '⭐ **BUT A ONE-SIDED RATE SETTLES NOTHING, SO THIS DRAIN MEASURED THE OTHER SIDE IN THE SAME HOUR — AND FOUND THAT A PREMISE THE WHOLE THREAD QUOTES WAS NEVER MEASURED AT ALL.**',
  '`tasks/goals.json` states "Tree, spec, worker count, **and working directory** are all ELIMINATED as the variable", and the master quotes it forward as "the identical command, in the identical worktree" —',
  'yet `logs/session-scratch/s1264/` holds only `RESULTS.md` + `handoff-line1.txt`, with **zero occurrences of `lane-b`, `cwd`, or `worktree`**, and s1265 says outright "I did not measure the lane shell."',
  '**Every fire-side reading was taken in the repo ROOT and every lane-side reading in `worktrees/lane-b`: for five fires SHELL and DIRECTORY moved together and were never separated.**',
  '✅ **THREE ARMS, SAME HOUR, SAME SUBJECT BYTES** (`git diff 9744f6b9 328b1bed` on the spec + `TownScene.ts` + `playwright.config.ts` + `package.json` = **empty**; same `@playwright/test` 1.61.1 and chromium **1228** in both `node_modules`):',
  '**L** lane shell / lane dir **0/24** · **F** fire shell / repo root **22/24** · **D** fire shell / **lane dir 21/24**.',
  '➡️ **DIRECTORY REFUTED BY MEASUREMENT** — the asserted claim turns out to be true, and is now evidence instead of assertion. **F-1264-3 stands at n=24 on both sides** and the lane-green half is no longer n=1 (F-1265-2 discharged).',
  'Also refuted this fire: the **SwiftShader** lead (the lane software-rasterises too, so it is not a discriminator), **fd/proc limits** (`ulimit -n` 1048576 / `-u` 10666 identical in both shells), and **memory pressure** (128 GiB, **80% free** during the arms).',
  'And **machine load again, harder**: arm F run 1 went **6/6 RED at loadavg 1.57** while every lane run went **green at loadavg 4–13** — the green arm was the busier box.',
  '⭐ **THE LEAD THIS EARNS, AND THE REFUTATION IT REVERSES: the fire shell runs 6 workers SLOWER THAN 1 (78–108 s vs ~49 s serial) while the lane runs them 3.5× FASTER (14–15 s vs 49–64 s).**',
  'Single-browser times agree across both shells, so this is not raw speed — it is **negative parallel scaling on concurrent chromium processes**.',
  '⚠️ **s1265 "REFUTED a CPU/QoS scheduling cap" WITH AN INSTRUMENT BLIND TO IT:** its `capacity.mjs` measured node **worker-thread arithmetic inside one already-running process** (5.04× speedup) — a workload that cannot see a policy binding on **spawned child processes**, which is exactly what six chromium instances are.',
  '**Scheduling policy is OPEN, not refuted.** The next experiment is bounded, needs no lane, and is written with its exact command in `logs/session-scratch/s1267/RESULTS.md` §4: sweep `--workers=1,2,3,6` in the fire shell recording wall time + drift rate per step, and read the chromium children policy (`ps -o pid,ni,pri`, `taskpolicy -p <pid>`) while an arm runs.',
  '⚖️ **THE RULE THIS EARNS:** *when two environments are compared, every property that differs between them moves together until someone deliberately crosses them — so a list of "eliminated variables" is a list of hypotheses unless each entry names the run that crossed it.*',
  'ⓘ Adjacent, reported and untouched (**F-1267-2**): `e2e/gazette-welcome.spec.ts:42` (`approachNewsie`) is a **second** latency-sensitive assertion in the same spec, **2/24** in arm F (`Expected: "newsie" / Received: "tavernkeeper"`, 8 s predicate timeout). The lane never saw it; fold it into whatever cure lands for `:88` rather than spawning its own task.',
  'ⓘ Not a finding: the **four-vs-six screenshot** discrepancy is a red/green signature, not a stale inventory — `shot(page, testInfo, \'retrigger-prompt\')` sits at `:109`, **after** the assertion at `:88`, so red runs write four and green runs write six (this fire own red arms wrote exactly four).',
  'Review: `reviews/newsie-drift-shell-divergence-rate.md`. Merged `0f9c19c2`..; evidence `logs/session-scratch/s1267/RESULTS.md`.',
].join(' ');

const retention = [
  '\u{1F6A8} **F-1267-3 (s1267, MEASURED — THE RETENTION LAW MIRRORS RUN LOGS INTO A DIRECTORY THAT DISCARDS THEM. OWNER CALL, NOT A DRIVE-BY.)**',
  'CLAUDE.md §10b names `logs/runs-archive/` as the mirror target that makes run logs survive the disk. Measured:',
  '`git ls-files logs/runs-archive/` ⇒ **1 tracked file out of 247**; `git check-ignore -v` on this fire own drained run log ⇒ **`.gitignore:7:*.log`**; `git status --ignored` ⇒ **246 ignored entries, 635 MB**, with `tasks/runs/` adding a further **381 MB**.',
  'So the law says these are in git and the repo-wide `*.log` rule silently discards every one of them — including the evidence for the drain in this very ledger line.',
  'ⓘ The file documents the hazard three lines below the live rule: `.gitignore:46` reads "a wildcard here is how F-1027-2 turned `logs/runs-archive/` into a black hole", and `.gitignore:37` already carries a `!reviews/eight-winds/gen/*.codex.log` negation for exactly this reason. `logs/runs-archive/` never got one.',
  '⚠️ **DELIBERATELY NOT FIXED:** a ~1 GB add changes repo weight for every clone — §7.3/§7.7 territory.',
  '**RECOMMENDATION (cheapest first): gzip-and-track** — negate the rule for `logs/runs-archive/**.log.gz`, compress on mirror (these logs compress ~10–20×, so ~635 MB → ~40 MB), leave the plain `.log` ignored.',
  '**Alternative:** track only each run READY-FOR-GATES report tail (the durable knowledge) and leave the transcript bulk on disk. Either is a one-script change to the mirror step. **GATE: owner picks the shape; then one fire lands it.**',
].join(' ');

lines.splice(idx + 1, 0, '', entry, '', retention);
writeFileSync(p, lines.join('\n'));
console.log('inserted 2 entries after line ' + (idx + 1));
