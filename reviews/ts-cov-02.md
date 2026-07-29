# ts-cov-02-worker-suppression-directives — review (s1241 drain)

**Slice:** `ts-cov-02-worker-suppression-directives` · **Branch:** `lane/m3` (slot lane-a) · **Tip:** `e0f92a48` · **Base:** `2820da95` · **Merge:** path-scoped checkout onto clean main
**Task master:** `tasks/ts-cov-02-worker-suppression-directives.md` — **FIRE-AUTHORED (s1240), one fire before this drain. Declared, per the guard-fx-03 precedent: I am gating a master my predecessor wrote, so every premise below was re-derived on my own tree rather than read.**
**Run log:** `tasks/runs/20260730-042604-lane-a-ts-cov-02-worker-suppression-directives.md.log` (8,018 lines, 169,349 tokens)
**§3.0 block-check:** `node scripts/drain-block-check.mjs 20260730-042604-ts-cov-02-worker-suppression-directives.md` → **✅ CLEAR** `[factory-worker-suppression-directives] status="queued"` — run **before** classification, per F-1104-7.

## VERDICT: MERGE. Gates green, firewall exact, and every claim in the runner's report reproduced on main — **but its branch tally understated itself and I proved two more of its "unprovable" branches with the technique it had already used three times.**

## What it does

`scripts/worker-type-coverage.test.mjs` makes one promise — *"every `functions/**/*.ts` is type-checked"* — and before this slice it checked only for `.d.ts` files and `@ts-nocheck` (`:17`), plus `tsc --listFiles` membership (`:29`). A **per-line** suppression was invisible to it. This slice widens that one assertion to also reject `@ts-ignore` and `@ts-expect-error`, and re-shapes the message so each offending file is reported **with the directive it carries** (`path (@ts-ignore)`), so an operator never has to grep to learn which of the four conditions tripped.

+6/−3 in one file. **Sixth rung** of the class F-1232-1 → F-1235-1 → guard-fx-01 → F-1237-1 → guard-fx-03 → this: rungs 1–4 were *"a branch nothing executes"*, rung 5 *"a resource nothing releases"*, this one **"a promise nothing enforces"**.

## Merge classification

`main..lane/m3` two-dot numstat shows **7 files**, of which **exactly one is lane content**:

| file | numstat | classification |
|---|---|---|
| `scripts/worker-type-coverage.test.mjs` | **+6 / −3** | **LANE-TOUCHED** — the slice, and the whole of it |
| `STATUS.md` | 1/4 | MAIN-MOVED-ONLY (base `2820da95` predates s1240's handoff) |
| `logs/.goal-tree.html`, `logs/dashboard.html`, `logs/task-stats.jsonl` | 1/1, 17/17, 0/1 | MAIN-MOVED-ONLY (generated churn) |
| `logs/session-scratch/s1240-fix.mjs`, `…/s1240-line1.txt` | 0/25, 0/1 | MAIN-MOVED-ONLY — **main has them, lane does not; the "deletions" are main's newer content** |

`git show --numstat e0f92a48` = **one file**, confirming the commit itself is clean. Merged by `git checkout lane/m3 -- scripts/worker-type-coverage.test.mjs` onto clean main; **no conflicts, nothing 3-way**. Post-checkout blob **`c8467622`** — byte-identical to the hash in the runner's own diff header.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (3.6 s) |
| `npm run build` | **rc=0** (15.4 s; pre-existing >900 kB chunk advisory only) |
| `node --test scripts/worker-type-coverage.test.mjs` | **rc=0**, `ok 1 - every functions/**/*.ts is type-checked`, `tests 1 · pass 1 · fail 0 · skipped 0` (3.8 s) |
| `npm run test:node-guards` | **rc=0**, **`tests 111 · pass 111 · fail 0 · skipped 0 · cancelled 0 · todo 0`**, ×2 runs, **no failure text anywhere** (30.4 s / 31.5 s) — identical to main's s1240 baseline |
| `node scripts/run-guards.mjs` | **rc=0**, **`guards: 8/8 passed`** (123.7 s) — `test:node-guards` 31 s · `test:deploy-contract` 82 s · **`test:mp` PASS** |
| adjacent, **GREP-DERIVED** (`grep -rl subject-tree.mjs scripts package.json`) | `scripts/subject-tree.test.mjs` **7/7** and `scripts/script-tree-parse.test.mjs` — the **only** two other importers of the shared walker; both inside `test:node-guards`, both green. Four subject-tree cases observed passing by name (existence / floor / at-floor / empty-subject). |
| `scripts/fixture-teardown.test.mjs` | green inside the battery — it runs this guard as a child, so **no temp-dir leak was introduced** (`dc3aecc8`'s tripwire doing its job on the very next slice) |
| player-visible bytes | **0 files under `src/ e2e/ assets/ public/`** → **no boot probe and no screenshots owed; none fabricated** |
| registration | the guard was **already** in `test:node-guards` — `package.json` correctly absent from the diff, as the master predicted |

**Reds read by case TEXT, never by `rc`.** `test:node-guards` runs `node --test` with the **default spec reporter**, so my first parse for `# tests`/`not ok` returned *nothing at all* beside a green run — F-1238-3 reproducing live, in this drain. Counters above come from the spec-format `ℹ tests N` lines; the isolated runs used `--test-reporter=tap`.

## Denominator (scope 5)

Independent walk of `functions/`, not the guard's own report: **22** `.ts` files, **0** `.d.ts`, **0** carrying any of the three directives. `floor: 22` **unchanged** at `:11`; `SUBJECTS` **unchanged** (`functions/` only); **`scripts/lib/subject-tree.mjs` is absent from the diff.** Floor semantics re-read at source: `assertSubjectFloor` asserts `files.length >= subject.floor`. So the guard is **green on day one over its exact floor** — a regression tripwire, not a migration. Note the walker matches `ext: '.ts'` and `.d.ts` *ends with* `.ts`, which is what makes arm D below possible.

## Mutation table — re-derived on main, SEVEN arms (the runner ran four)

Every arm transient; `functions/api/stats.ts` restored byte-identically to **`c74245955f89dfcc91184112cac2c6193d37408b`** after each, verified by `git hash-object`, and `git status functions` **clean** at the end. Branch attribution is by **message text**, not rc: `:22` owns *"worker files disabling semantic checks"*, `:28` emits tsc's own output, `:32` owns *"worker files missing from tsc --listFiles"*.

| arm | injected | project `tsc` | guard | which branch fired | verdict |
|---|---|---|---|---|---|
| **0** control | nothing | rc=0 | **rc=0** | — | baseline green |
| **F** *(new)* real error, **no directive** | `export const x: number = 'not a number'` | **rc=2 · TS2322 `Type 'string' is not assignable to type 'number'`** | rc=1 | **`:28` pre-existing tsc** | **proves the injected error is REAL** — the control the runner's table lacked |
| **A** real error + `@ts-ignore` | same + `// @ts-ignore` | **rc=0 GREEN** | rc=1 | **`:22` THE NEW CHECK** | names `functions/api/stats.ts (@ts-ignore)` — **the hole, closed** |
| **B** real error + **used** `@ts-expect-error` | same + `// @ts-expect-error …` | **rc=0 GREEN** | rc=1 | **`:22` THE NEW CHECK** | names `… (@ts-expect-error)` — **second hole, closed** |
| **C** `@ts-nocheck` control | `// @ts-nocheck` at line 1 | rc=0 | rc=1 | **`:22`** | names `… (@ts-nocheck)` — filter **extended, not replaced** |
| **D** *(new)* transient `functions/api/__s1241probe.d.ts`, **no directives** | `export type S1241Probe = string;` | rc=0 | rc=1 | **`:22`** | names `functions/api/__s1241probe.d.ts (.d.ts)` — **the branch this diff RESTRUCTURED** |
| **E** negative control: **bare unused** `@ts-expect-error`, no real error | — | **rc=2 · TS2578 `Unused '@ts-expect-error' directive`** | rc=1 | `:22` **and** `:28` both qualify | **CONFOUNDED — not valid proof** |

**Arms A and B are the finding, and they are red for MY reason, not for `:24–28`:** project-wide `npx tsc --noEmit` returns **rc=0 with a genuine TS2322 present in a Cloudflare worker file** (arm F proves it is genuine). Since `tsc` gates every drain in this factory, that hole passed **tsc, the guard, and the whole battery** simultaneously — premise 6 reproduces exactly.

**Arm E sharpens premise 5 rather than repeating it.** The master forbade bare-directive arms because, against the *live* (pre-diff) guard, such an arm reds through `:25`/`:28` and certifies a line that already existed. Measured post-diff, the prohibition still holds but **for a different reason**: `:22` now fires *first*, while `tsc` independently reds with TS2578, so **both branches qualify and the guard's output alone cannot tell you which one you proved.** A future fire mutating this guard with a bare directive gets a satisfying red that is genuinely un-attributable. Pair the directive with a real error, always.

## Matcher trade-off (scope 2) — verified, and re-framed

The slice keeps the existing house shape, `source.includes(directive)`. The runner named its misjudged input as `const example = "@ts-ignore";` — **CONFIRMED on my tree:** injected as a plain string literal with no suppression anywhere, the guard reds naming `functions/api/stats.ts (@ts-ignore)`. A false positive.

**But the report stopped one probe short of the more important half.** I checked the five spellings TypeScript actually accepts — `//@ts-ignore`, `//    @ts-ignore`, `/* @ts-ignore */`, `/** @ts-ignore */`, and the trailing-explanation form — and **every one of them contains the literal directive text.** There is therefore **no false-NEGATIVE class** for these three directives: the matcher's only error direction is toward **false REDS**. For a guard that is the correct bias — fail-loud, never fail-open — and it is what makes the substring choice *defensible* rather than merely *acceptable*. That sentence is worth more than the false-positive caveat, and it was missing.

## Assertion-branch tally (scope 6) — 5 of 6, not 3 of 6

| # | branch | proved? |
|---|---|---|
| 1 | `:22` suppression filter — `@ts-nocheck` | **PROVED** (arm C) |
| 2 | `:22` — `@ts-ignore` | **PROVED** (arm A) |
| 3 | `:22` — `@ts-expect-error` | **PROVED** (arm B) |
| 4 | `:22` — `.d.ts` | **PROVED (arm D — mine; the runner called this unprovable)** |
| 5 | `:28` `tsc` status non-zero | **PROVED (arm F — mine; free by-product of the realness control)** |
| 6 | `:32` `--listFiles` membership | **UNPROVED** — genuinely out of reach: it needs a `tsconfig.json` `include` edit, which the firewall forbids and which would be a config mutation, not a transient one. Named, not glossed. |

Upstream, `assertSubjectExists` and `assertSubjectFloor` are proved by `subject-tree.test.mjs` (4 cases observed green by name) — not by this slice, and correctly so.

## Findings

- **F-1241-1 (method, non-blocking — the fire's contribution).** The runner reported *"Unproved here: `.d.ts` branch, `tsc` nonzero branch, and missing-from-`--listFiles` branch; exercising them would require prohibited structural/config mutations."* **Two of those three are provable by the exact transient technique it had already used three times.** Arm D creates one `functions/api/*.d.ts` and removes it — the walker matches `.ts`, so `.d.ts` is in-subject, and the guard reds naming `(.d.ts)`. Arm F is the *same* injected line minus the directive and reds `:28`. Neither is structural; neither touches config. **This matters specifically because branch 4 is the one this diff RESTRUCTURED** — `.d.ts` moved from a `.filter` predicate to `reasons.unshift('.d.ts')` — making it the branch most at risk from the change and the one left unexercised. Same shape as s1240's contribution to `guard-fx-03`: *the slice's own new/moved branches are the ones its author is least likely to aim at.* No corrective owed — the branches are now proved and the code is correct.
- **F-1241-2 (method, non-blocking).** The runner's four-arm table contains **no control proving the injected type error is real.** Without arm F, arms A and B establish only that a substring fires — not that a *genuine* error is being hidden, which is the entire claim of premise 6. The claim survives re-measurement (TS2322, `tsc` rc=2 → rc=0 once suppressed), but **the table did not carry its own control.** For a guard whose value proposition is "this defeats `tsc`", the arm that shows `tsc` *catching* the unsuppressed case is not optional.
- **F-1241-3 (observation, non-blocking).** The matcher trade-off was reported as a false-positive risk only. The stronger, verified statement — **no false-negative class exists across the five spellings TypeScript accepts, so the error direction is fail-loud** — belongs in the record. See "Matcher trade-off" above.
- **F-1241-4 (observation, latent — for whoever implements the widening ruling).** `scripts/worker-type-coverage.test.mjs:18` now contains all three directive literals in its own source. It is shielded **twice** today: `SUBJECTS` is `functions/` only, and the walker's ext is `.ts` while the guard is `.mjs`. **But if the owner answers the scope-3 question by adding `scripts/` to `SUBJECTS`, this guard reds on itself.** One line in that master avoids a confusing first run. (Adding `src/`/`e2e/` alone does not trigger it.)
- **F-1241-5 (method, corroborating F-1238-1).** This fire's `run-guards` battery was **8/8 with `test:mp` PASS** — a sixth full-battery datum. Running rate: **1 red in 6 full-battery runs vs 0 red in 5 isolated.** Still load-shaped, still under-sampled, **no corrective authored.**

## Scope-3 recommendation, carried as a recommendation only

The runner recommends **retaining worker-only scope pending an owner decision**, because widening to `e2e/` would reject the documented, legitimate suppression at `e2e/second-rider.spec.ts:6`. **Re-verified:** that file's `@ts-expect-error` covers importing an untyped `.mjs` production companion; it is the codebase's *only* live suppression, and `functions/` genuinely carries **0**. The slice correctly did **not** widen `SUBJECTS`. This stays on the OWNER'S DESK as *"should `src/` and `e2e/` be held to the workers' no-suppression standard?"* — and F-1241-4 is the rider on it.
