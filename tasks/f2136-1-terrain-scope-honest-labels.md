# Task f2136-1: make the bench terrain scope report claim only what it measures (LANE-B, commit prefix "test:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.
READ FIRST: `AGENTS.md`; `scripts/terrain-contract-scope.mjs` (your own predecessor's work, on this lane); `src/world/Terrain.ts` lines 70–90 and 400–410.

⚠️ **THE REFUSAL THIS SLICE DISCHARGES IS NOT IN YOUR WORKTREE — READ IT FROM `main`, DO NOT GO LOOKING FOR THE FILE.** This lane deliberately sits behind main (its held WIP is your base and MUST NOT be reset — see the pre-flight), so `reviews/f2134-1-bench-terrain-contract-scope.md` and the amended `tasks/BACKLOG.md` rows exist only on `main`. Worktrees share one object database, so read them with:
`git show main:reviews/f2134-1-bench-terrain-contract-scope.md` and `git show main:tasks/BACKLOG.md`.
If the first command fails, STOP and report "s2136 review not reachable from lane-b" — do not proceed on the Why section alone.

**FIRE-AUTHORED (attended review welcome).**

LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: docs/bench/terrain-contract-scope.md
EXPECTED-HOLDS: package.json
EXPECTED-HOLDS: scripts/terrain-contract-scope.mjs
EXPECTED-HOLDS: scripts/terrain-contract-scope.test.mjs

**SEQUENCING LAW — THIS SLICE EXTENDS UNMERGED WORK, SO THE LANE'S CONTENT IS YOUR BASE.**
`lane/b` @ `6076a93b2` holds the four paths declared above; s2136 REFUSED that merge on the content
of two measurements, not on its structure, and this slice corrects those two measurements in place.
Verify the base before building: `grep -Fc "result: buildable ? 'AGREE' : 'DIVERGE' }];" scripts/terrain-contract-scope.mjs`
must return **1**, and `grep -Fc "return editorPreviewContract ?? ACTIVE_CONTRACT;" src/world/Terrain.ts`
must return **1**. If either returns 0, the base has moved — STOP and report "f2134-1 base not found
on lane/b"; do NOT reconstruct the script from scratch.

## Pre-flight (BUILD-ON-PREDECESSOR — the reset is FORBIDDEN here)

🚫 **DO NOT `git checkout -B lane/b main`, DO NOT `reset --hard`, DO NOT `git clean -fd` the four
declared paths.** The normal lane pre-flight's safe-dupe reset would destroy exactly the commit this
slice is authored to extend. The four paths above are held, expected, and are your base — the runner
has already checked them against your `EXPECTED-HOLDS` declaration and dispatched you over them.

Do this instead: confirm `git -C worktrees/lane-b log --oneline -1` names the runner's
`f2134-1-bench-terrain-contract-scope` commit, then `npm install --no-audit --no-fund` and
`npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must
be clean apart from the FACTORY-CHURN EXCEPTION, always expected and never a STOP (F-1407-1): (a)
`logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked
`src/**`, `scripts/**` other than the declared path, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2136-1 + F-2136-2, s2136, measured at source — re-verify, do not trust this paragraph)

The predecessor slice is honest work that **found both of its own defects and correctly refused to
fix them out of scope** (CLAUDE.md §4.5). Its report records: *"Independent review suggested
redefining DIVERGE as a comparison against separately loaded contract terrain and excluding the
declaration/fallback from the seam census. Those suggestions were not adopted because the queued
task explicitly defines the first-zone false-result instrument and expects the raw 21/7 census."*
**Both defects are in the f2134-1 MASTER's specification. This slice corrects the specification.**

**F-2136-1 — the label makes a two-sided claim from one-sided evidence.** `:33-34` calls
`Terrain.isBuildable` **once**, against the module-scoped `Terrain` that this very slice measures as
baked to `the-claim`, then labels the result `AGREE`/`DIVERGE`. "AGREE" asserts that the bench's
ground and the *contract's own* ground reach the same verdict — but the contract's own ground is
never evaluated, so the label is unsound in both directions and the direction of error is
**unprovable without a second module load**. ⚠️ **And a second load is the one cure you must NOT
attempt here:** module-scope baking is the defect under measurement, so evaluating each contract's
own ground in-process would need a fresh module graph per contract — ordering that would be ordering
you to defeat the thing being measured. **Report what the single call actually establishes.**

**F-2136-2 — the seam census counts two things that are not bypassing reads, so its floor is 2.**
`:42` counts `ACTIVE_CONTRACT` with no subtraction while the very next expression subtracts
`currentContract()`'s own declaration — an asymmetry that reads as oversight, not choice. Measured
by reading `src/world/Terrain.ts`: **21 matches, of which `:78` is the declaration
(`const ACTIVE_CONTRACT = activeContract();`) and `:407` is the SEAM'S OWN FALLBACK**
(`return editorPreviewContract ?? ACTIVE_CONTRACT;`, inside `currentContract()` at `:406`). **19
reads genuinely bypass the seam.** The metric was authored to track the rewire to zero and **can
never reach zero**: `currentContract()` cannot exist without reading `ACTIVE_CONTRACT` as its
fallback. The floor is 2 by construction, and saying so is the useful part.

## Scope (numbered, each testable)

1. **`scripts/terrain-contract-scope.mjs` — replace the two-sided label with the one-sided fact.**
   Drop `result: buildable ? 'AGREE' : 'DIVERGE'` and the `agree`/`diverge` tallies. Report the raw
   `Terrain.isBuildable` boolean per contract and two totals named for what was measured — accepted
   by the bench's ground vs **rejected** by it. Do NOT invent a comparison against the contract's own
   ground. The `22 of 36` rejection count MUST be unchanged by this slice; if it moves, that is a
   finding, not a number to overwrite.
2. **`scripts/terrain-contract-scope.mjs` — make the seam census symmetric and state its floor.**
   Subtract BOTH non-bypassing occurrences from the `ACTIVE_CONTRACT` count: the declaration and the
   `currentContract()` fallback. Derive both by parsing the source at runtime — **never hardcode 2**,
   and never hardcode 19. Report the bypassing-read count, and report the structural floor alongside
   it so a future reader knows zero is unreachable.
3. **`docs/bench/terrain-contract-scope.md` — regenerate via `--write-report`.** The table column and
   both totals change names; the "what this means" paragraph is already correct and should keep its
   browser-fact-vs-bench-fact wording. Add one sentence stating that the report measures **only** the
   bench's ground and does not compare against each contract's own — the F-2136-1 boundary, in plain
   words, so nobody re-reads a one-sided number as a two-sided one.
4. **`scripts/terrain-contract-scope.test.mjs` — update the assertions to the new field names**, and
   add one asserting the seam census subtracts the declaration and the fallback (i.e. that a source
   fixture containing only those two occurrences reports **0** bypassing reads). That test is the
   whole point of the slice — it pins the floor.
5. **`--check` behaviour is unchanged and must stay green-on-current, red-on-drift.**

## Firewall

**TOUCH-ONLY:** `scripts/terrain-contract-scope.mjs` · `scripts/terrain-contract-scope.test.mjs` ·
`docs/bench/terrain-contract-scope.md`.

**NO:**
- **`src/**` — ANY file.** This slice changes zero behaviour. Routing the 19 reads through the seam
  is the successor slice and moves every bench number on the board.
- **`package.json`** — already rooted correctly by the predecessor commit; leave it exactly as it is.
- **`scripts/gr-sim.test.mjs`.** Widening its `:630` assertion would red 22 contracts; that widening
  is lawful only AFTER the rewire.
- **`scripts/same-game-audit.mjs`, `scripts/same-game-audit.test.mjs`, `docs/bench/same-game-audit.md`.**
- **Any attempt to load a second contract's Terrain** — see F-2136-1. If you believe you have found a
  cheap way to do it, REPORT it as a finding for the successor; do not build it here.

## Self-check (name the exact commands and quote the outputs)

- `npx tsc --noEmit` → rc 0 · `npm run build` → rc 0.
- `node --test scripts/terrain-contract-scope.test.mjs` → all pass.
- `node scripts/terrain-contract-scope.mjs --write-report` then `--check` → green. **Report the
  rejected-by-bench-ground count and whether it still matches 22**, and the bypassing-read count and
  whether it matches **19**. If either differs, say which contracts or which lines moved and why.
- **Prove the guard by manufacturing the defect (the s1299/s1300 standard — a passing guard never
  executes its violation path, so its green says nothing about the red it claims to own):** hand-edit
  one row of the committed report, confirm `--check` exits **1** and names the differing line, then
  restore byte-identically and confirm green again. Quote both outputs.
- `npm run test:node-guards` → report the full tally with load average. ⏱️ It is ~405 s and it is the
  dominant cost of this slice; **run it ALONE**, never overlapped with another battery (F-1537-1/F-2099-1).

End: **READY-FOR-GATES** + report: the rejected count and whether it matched 22 · the bypassing-read
count and whether it matched 19 · the manufactured-defect red and its restore · the full-battery
tally with load average · anything in the F-2136-1/F-2136-2 premise that had moved.

**SUCCESSOR (do NOT build here):** *route Terrain's **19** legality reads through the existing
`currentContract()` seam and have `HeadlessContractSim` call `previewEditorContract(this.manifest)`
before sampling.* That slice re-baselines every bench floor, pin and admission exemption in the repo,
so it wants this report's before/after, a full re-pin with named causes (F-1441-3 — never a re-pin
reflex), and almost certainly an attended session to sequence it against the live admission program.
