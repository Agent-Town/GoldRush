# rulings-county-2026-09-19 — implementer report

**Branch** `fix/rulings-county-2026-09-19`, cut from main `797052233` in a scratch worktree.
**Implementer** Claude Opus 5 on the owner's Anthropic subscription (never Codex). Node 26.4.0, `/opt/homebrew/bin` first.
**Owner ruling covering every item below, verbatim (2026-09-19):** "I agree with all your recommendations on the decisions - good work" — on `docs/OWNER-DESK-2026-09-19.md`.

**Verdicts: 5 LANDED, 1 PARKED.**

| # | Item | Verdict |
|---|---|---|
| 1 | F-HEAT14-7 — a real hour and a cap of 60 | **LANDED** `20d8e12dc` |
| 2 | F-2568-2 — derive the rotation id | **LANDED** `bbf1ac22e` |
| 3 | F-2270-3 — the copy says five | **LANDED** `62fce8d1f` |
| 4 | F-2272-1 — split the codex-shim gate | **LANDED** `fe169dc15` |
| 5 | F-E8LO-3 — re-key M8-5 | **LANDED** `704b497a7` |
| 6 | F-HYG-10 — banner the never-ran masters | **PARKED** — the premise is a mis-transcription; measured, see §6 |

---

## 1. F-HEAT14-7 — a real hour and a cap of 60 — LANDED

**Ruling quoted.** The register: *"(b) and (a) together: a real hour and a cap of 60. The cap is against floods, not against a rider that plays every board once."*

**Diff.** `functions/api/_ratelimit.ts` — `bumpCounter` now stores the window START beside the count (`"<count>:<startedAtMs>"`) and arms `expirationTtl` with the REMAINDER of the window measured from that start, instead of re-arming a full TTL on every accepted write. `functions/api/standings.ts` — `MAX_REQUESTS_PER_ANON` 30 → 60.

**Blast radius, stated rather than assumed.** The shared limiter serves six doors — `standings`, `_accounts`, `telemetry`, `redeem`, `_bugs`, `refusals` (`_multiplayer.ts` has its own private `bumpCounter` at `:687` and is untouched). Signature, return type, refuse-before-write order and every door's own limit are byte-identical, so no caller changes shape. The one behaviour all six inherit is the fixed window — which is the ruling, not a side effect. The direction is **more permissive**: the account-code limiter's 10 minutes becomes a real 10 minutes instead of 10 minutes since the last accepted request. A value written before this change is a bare count; it keeps its count and starts its window once, so the deploy cannot hand a flood a free window.

**Tests — manufactured, and measured on both trees.** `scripts/ratelimit-window.test.mjs`, six arms, rooted in `test:node-guards`.

| arm | base `797052233` | this branch |
|---|---|---|
| the rider cap is 60 and the 61st inside one hour is refused | FAIL | pass |
| an hour is an hour: the limit refills once the window passes | FAIL | pass |
| a refusal never bumps and never re-arms the window | pass | pass |
| the stored ttl is the remainder, never a fresh hour | FAIL | pass |
| a pre-cure bare count keeps its count | FAIL | pass |
| every door that shares the limiter still passes its own ttl | pass | pass |

**4 of 6 red on the base, 6 of 6 green here.** Two arms are base-invariant by design and say so: the refusal arm pins a property the old code also had, and the last is a census. The "hour is an hour" arm additionally runs the **pre-cure body as a control on the same fixture** and asserts it still refuses — so the arm proves the cure rather than the current behaviour.

**Adjacent suites, after:** `test:accounts` 43+43 checks pass · `test:mp` 466 pass · `test:stats` (stats 87, standings 320 kv + 320 sqlite) pass · tsc clean · `npm run build` rc=0.

---

## 2. F-2568-2 — derive the rotation id — LANDED

**Ruling quoted.** The register: *"The door derives the current rotation from shipped data; only the landing page restates it by hand. Recommendation — RULED 2026-09-19. Derive it and abolish the weekly edit."*

**Diff.** `site/assay-office.js` — `const CURRENT_ROTATION_ID = 'r2026w38'` DELETED. In its place a fenced derivation block (`rotation-derivation:start/end`): `isoWeekRotationId()` computes `r<isoYear>w<isoWeek>` for an instant, and `fetchOpenRotation()` asks the door for this week's id, stepping back one week per 400 (`bad_rotation` = that week was never minted) up to twelve. A non-400 refusal stops the walk, so a resting door is asked once, not twelve times.

**Why this is the door's own answer and not a parallel rule.** `scripts/rotation-mint.mjs` mints exactly one rotation per ISO week, `id = r<year>w<week>`, `opensAt` = that week's Monday 00:00 UTC. `currentOrLatestRotation` takes the latest rotation with `opensAt <= now`. Walking back from this week's id until the door recognises one therefore lands on precisely that rotation. The guard asserts this over the whole shipped registry rather than in prose. The door itself was NOT touched (the firewall allows only the cap and the limiter call there), so no endpoint changed.

**Guard.** `scripts/landing-rotation-derivation.test.mjs`, six arms, rooted in `test:node-guards`. **0/6 on the base, 6/6 here.** It (1) refuses any `r\d{4}w\d{2}` literal in any tracked `site/` source, (2) refuses a `CURRENT_ROTATION_ID =` declaration there, (3) evaluates the page's fenced block against `assets/rotations/rotation-seeds.json` at open, mid-window and the last millisecond before close, (4) compares it to `currentOrLatestRotation`'s own rule at three instants per rotation, (5) drives the week-not-minted walk-back with a stubbed door and asserts one ask per week, (6) asserts a 503 is asked once.

**Consequential edits, both required by the deletion.**
* `scripts/skillmd-guard.test.mjs` — the assertion `assert.match(landingSource, /const CURRENT_ROTATION_ID = '…'/)` is retired with an epitaph at `:100–:106`. That pin is what FORCED the weekly hand-edit and it was the gate half of F-2568-1's unsatisfiable pair. The whole-registry fence assertion beside it is untouched; the file is 16 pass / 0 fail, including both of its own manufactured-defect controls.
* `scripts/fire.md` — the RT-01 duty's third step, retired in place, one line, no restructuring. **The line changed, verbatim as it stood:**
  > then move `CURRENT_ROTATION_ID` in `site/assay-office.js` to the rotation that is OPEN (not the one just minted), commit path-scoped with prefix `rt:`, push, and note it in the handoff.

  It now reads as a RETIRED step naming this ruling, records that the F-2568-1 pair is dissolved at its gate half, and states that a mint touches **two** content files (`assets/rotations/rotation-seeds.json`, `public/skill.md`), not three. The commit/push instruction is preserved.

**Law pointers.** My own edits rotted five pointers in `scripts/fire.md`; all were re-based BY MEASUREMENT (each cited line read back by eye) before any `--update`: `skillmd-guard.test.mjs:102 -> :109` (two spellings), `:103` retired to prose plus a live pointer at `:100`, `functions/api/standings.ts:534 -> :541`, `:1230 -> :1237`. The commit-message quote that carried `:102-103` is rendered as prose ("lines 102-103") rather than re-written, which is the guard's own prescription for historical coordinates. `law-pointer-guard.mjs --update` was run only once **no DRIFT remained** — every residual entry was a NEW POINTER I had eye-verified — and the baseline was diffed afterwards: exactly those five entries moved, nothing else was blessed. `law-pointer-guard` now PASSES (94 pointers, 92 checked, 90 instruments resolved).

**e2e.** `e2e/transfer-board.spec.ts` reaches its final assertion on both projects: 6 rotation rows, `r2026w37 closes …`, the registry seed for `the-claim`, and the generalization cell all pass. Its last line (`expect(errors).toEqual([])`) fails on a console error — **attributed to the base**: with `site/assay-office.js` restored to `797052233` the identical error appears (`Failed to resolve module specifier './standing-rule.js'. The base URL is about:blank because import() is called from a CORS-cross-origin script.`). Pre-existing, not mine. Run through a scratch config on port 5308 because 5188 was held by another agent's battery.

---

## 3. F-2270-3 — the copy says five — LANDED

**Ruling quoted.** The register: *"(a). Truth over the roster; one line in the copy and the thread."*

**Every line changed (2):**

| file:line | before | after |
|---|---|---|
| `site/index.html:182` | `<li>Six frontier contracts in Epoch One, each its own map and twist; …` | `<li>Five frontier contracts in Epoch One, each its own map and twist; …` |
| `marketing/outbox/launch-facts-vE1.md:3` | `Epoch One: Frontier. Six contracts, each its own map and twist.` | `Epoch One: Frontier. Five contracts, each its own map and twist.` |

**Left alone, each with a reason rather than an oversight.** `marketing/outbox/announcement-thread/THREAD.md:66` already reads *"five complete maps"*. `THREAD-v2.md:9` says *"the landing lists six boards"* — true of the ROSTER, which the ruling explicitly permits to keep the Hill Mine as an E2 preview, and not a claim about E1. `public/skill.md`, `public/llms.txt`, `site/llms.txt` and `site/news.html` carry no contract-count claim (censused, not assumed). The dated `gazette-queue.md` / `ticker-digest-*.md` entries are the record of announcements already made, which the retention law keeps as written. `e2e/playability-secure.spec.ts:37` says "Six contracts x 2 projects" about its own test matrix, not about the board.

---

## 4. F-2272-1 — split the codex-shim gate — LANDED

**Ruling quoted.** The register: *"About 16.7k Codex tokens per drain. Recommendation: split the file, root the two pure arms in the battery, owner-gate the live arms."*

**The split.** `server/codex-shim/serve.test.mjs` keeps **five pure arms** — the stream shape, the client abort, the mid-stream disconnect, the developer/tool-call boundary, and `browser-origin requests cannot spend subscription quota` (the security arm that protects the very allowance). No auth, no network, no model. **Rooted in `npm:test:ledger-guards`.** Measured 5 pass / 0 fail / 0.39 s.

`server/codex-shim/serve.live.test.mjs` is new and holds the **three subscription arms** behind two independent conditions: `GR_CODEX_LIVE=1` (nobody asked to spend) on top of the existing `hasCodexAuth()` skip (no subscription in this shell). Measured on this tree with neither set: **rc=0, 3 tests, 0 pass, 3 skipped with the reason printed on each line, 0.08 s, zero tokens** — so a battery that collects the file costs nothing. `npm run test:codex-shim` is rewritten as the single caller that sets the flag.

**No live arm was executed here.** Spending the owner's allowance is an owner decision (CLAUDE.md 7.3) and this master does not authorise it; the cost figures quoted are the s2272 drain's measurement, carried forward in the baseline entry.

**Baseline, updated the way its own header prescribes.** `--update-baseline` first, then BOTH entries written by hand — the F-GCU-1 class is that the update writes `TODO` over real reasons. Afterwards: 0 occurrences of `TODO: say why` in the file. `server/codex-shim/serve.test.mjs` moved to `superseded` (it has a caller now); `server/codex-shim/serve.live.test.mjs` gained a money-not-wall-time reason with the skip-path measurement; `npm:test:codex-shim`'s entry is rewritten to say it is the live gate only, and to close the PARTIAL COVERAGE HOLE the s2272 text conceded. `npm run test:gate-callers` **PASS** (369 subjects, 19 orphans, all with reasons). `gate-caller-audit.test.mjs` + `lane-usable-gate-leaf-surface-guard.test.mjs`: 55 pass / 0 fail.

**One disclosure.** The pure file's `client abort terminates the codex child process` arm shells out to `pgrep -f <marker>` internally; my instructions forbid me that verb and my `--test-name-pattern` exclusion did not take, so the arm ran. It is read-only and its marker is `fake-codex-<pid>-<timestamp>`, unique to that run, so it could not have matched another agent's process. The arm is unchanged code, moved verbatim.

---

## 5. F-E8LO-3 — re-key M8-5 — LANDED

**Ruling quoted.** The register: *"(b). Low Orbit's fiction is a return home, not a boss. Data only, no engine work."*

**Diff.** `src/town/worldDispatches.ts` — `'M8-5': { kind: 'boss', id: 'e8-low-orbit' }` -> `{ kind: 'contract', id: 'e8-low-orbit' }`, the shape every other secure-keyed dispatch uses. Data only.

**Why it could never have gone red, measured.** `triggerReached` resolves `{ kind: 'boss', id }` for any non-Baron id to `scores.some(s => s.secured === true && s.contractId === id)` — byte-identical to the `contract` branch. So the wrong kind behaved correctly and only misinformed the reader. Measured on the shipped registry: `bossKind` is declared by **seven** contracts (`e2-hill-mine`, `e2-trestle`, `e2-incline`, `e3-canyon-works`, `e4-dust-flats`, `e5-deepwater-claim`, `e6-glow-mesa`); `e8-low-orbit` is not among them, and M8-5 was the ONLY boss-kind trigger naming a map without one. The lore row agrees: M8-5 is *"the Claw turned back (the yard begun)"*, a departure.

**Guard.** `scripts/world-dispatch-boss-trigger-guard.test.mjs`, three arms, rooted in `test:node-guards`. **1/3 on the base, 3/3 here.** Both sides are derived — triggers parsed out of `MILESTONE_TRIGGERS`, boss-bearing contracts walked out of `assets/contracts/*/contracts.json` at any depth (`bossKind` lives under `tileParams`, so the scan is by depth, not by a path the guard would have to know). The third arm drives the predicate over a manufactured table so the red is proven rather than assumed; `e1-baron` is exempted by name, because it is the Baron medal and not a contract row. `e2e/wd02-barks.spec.ts` pins four boss triggers and M8-5 is not one of them, so no e2e edit was owed.

---

## 6. F-HYG-10 — banner the never-ran masters — PARKED

**Nothing was bannered. No task master was edited. The reason is a verified mis-transcription in the register, and the measurement that shows the item has no subject.**

### F-RUL-1 — the register's F-HYG-10 entry describes a different finding than the review it cites

The register (`docs/OWNER-DESK-2026-09-19.md:146–149`) reads: *"The hygiene review counted 227 task masters in `tasks/` that never ran or whose runs no longer reproduce on main. Recommendation: banner them as archive (kept on disk and in git, never queued), never delete."* This master's item 6 inherits that reading and points it at `npm run test:task-guards`.

**Read at the source, F-HYG-10 is not about task masters at all.** `reviews/hygiene-battery-lossless-triangles.md:15`: *"the guard is not green: **227 cells** in 19 families do not reproduce from their masters at all (F-HYG-10)"*. And `artifacts/hygiene-battery-lossless-triangles/report.md:209–212` and `:340–343`: *"227 shipped cells across 19 families (`char-baron-sheet-walkdiag8` 32, `char-hero-sheet-walk8` 23, prospector hover4 32, jumper 64, `ter-rail-elements` 4, …) do not reproduce from their masters at all. That is the F-1464-1 class"* — and *"The decision needed is whether the masters get refreshed (an art act) or the ledger records each as divergent by design."*

The 227 are **shipped ART CELLS**, and "masters" there means the source PNG a cell is downscaled from (`master-divergent.json`, `--verify-downscale`). The subject is `assets/**` — which this master's firewall forbids — and the banner shape `> ARCHIVE …` does not apply to an image cell. The ruling "banner them as archive, never delete" cannot be executed against the finding it names.

### The measurement, so the next reader inherits a fact and not a hunt

`npm run test:task-guards` SKIPS in a linked worktree by design (F-1151-1: `tasks/done|failed|running` are untracked and live only in the main checkout). So the audit's own predicate was re-run here with the masters and `tasks/goals.json` from this branch and the move-directories read (read-only) from the main checkout:

* **1,362** masters in `tasks/*.md` · **1,623** moves · **826** goal leaves
* **199** masters never ran · of those, **103** carry no guard header
* **all 103 of those carry a goal leaf** -> **the invisible set is 0**
* `tasks/guard-audit-baseline.json` holds `count: 0` -> `appeared` is empty -> **the audit is already green, rc=0**

**The audit names nobody, so "generate the list from the audit itself" generates an empty list.** There is nothing to banner.

**And bannering the wider "never ran" set would have been actively wrong**, which is the strongest evidence the premise is off. The master forbids editing a master whose goal leaf is `queued`/`building`/`blocked`; the leaf statuses of those 103 are `merged` 89, `building` 5, `shipped` 5, `planned` 3, `superseded` 1 — and the five `building` are:

```
battery-robustness-f-poc-8.md      [building]
e4-motor-reels-rerecord.md         [building]
needs-cells-codex-strips-land.md   [building]
rulings-county-2026-09-19.md       [building]   <- this very master
rulings-play-2026-09-19.md         [building]
```

A blind banner pass would have stamped "ARCHIVE — never ran" on the master being executed at the time.

### Recommendation (attended or owner, one line each)

1. **Correct the register entry** for F-HYG-10 to its real subject: 227 shipped art cells in 19 families that do not reproduce from their masters, the F-1464-1 class, families listed in `verify-downscale-before.log`.
2. **The decision that item actually needs** is the one the review asked for and the register did not carry: refresh the art masters (an art act, an ART-slot batch), or record each cell as divergent by design in `master-divergent.json`. "Banner, never delete" — the owner's disposition — maps onto the SECOND of those: record rather than regenerate or drop.
3. **No task-master hygiene work is owed.** `test:task-guards` is green with an empty invisible set on today's tree; if a hygiene pass is still wanted for `tasks/`, its subject is the 89 never-ran masters whose leaves read `merged` — a bookkeeping question about goal leaves, not an archive-banner question, and a different finding.

---

## ⛔ ONE ACT IS OWED BEFORE THIS BRANCH CAN GATE GREEN — F-RUL-2

**Item 5 rotates the engine hash, and the master's firewall forbids me the file that records it.**

`src/town/worldDispatches.ts` is inside `ENGINE_SOURCE_INPUTS`, so ANY edit there rotates `computeEngineHash`. Item 5's re-key is the smallest possible src edit and it rotates the hash all the same. The master's TOUCH-ONLY list names that file and its NO list names `assets/engine-era.json` — the two are jointly unsatisfiable, exactly the shape F-2568-1 named for a duty and a gate.

**Measured, attributed by revert-run-reapply** (with `worldDispatches.ts` restored to `797052233` both guards go green, so the red is mine and nothing else on this branch causes it):

| guard | verdict | message |
|---|---|---|
| `scripts/bench-seeds.test.mjs` :: rotation registry stays outside the engine identity corpus | RED | declared `cc3fd5d4…`, this tree `dcdc9188…` |
| `scripts/engine-era-guard.test.mjs` :: the landed registry names the live engine and stays outside its hash corpus | RED | *"engine hash dcdc9188… is absent from era 6; append a same-era pin with its cause, or bump the era with a fresh pins array"* |

**The owed act, exactly, so it costs the drain one edit:**

* file: `assets/engine-era.json`
* era: **unchanged, 6 "the Re-surveyed Claims"** — this is a same-era content re-hash, pin **#12** after the eleven already in `pins`. The door accepts a reel whose `meta.engineHash` is in `pins` (`engineEraIncludes`, `standings.ts:1190`) and refuses only on `meta.era !== engineEra.era` (`:1187`), so an APPEND keeps every stored reel playing. **Do not bump the era.**
* new hash: `dcdc9188f2c9d7345d9788e9299dde57d1c48814916ae80639d6e26c14d3d9f4`
* cause line to write: *"same era, pin #12: rulings-county-2026-09-19 (owner 2026-09-19 'I agree with all your recommendations on the decisions - good work') — F-E8LO-3 re-keys the M8-5 world dispatch from `{ kind: 'boss' }` to `{ kind: 'contract' }` for `e8-low-orbit`, a map that declares no boss. `triggerReached` resolves both kinds to the same predicate for a non-Baron id, so no sim semantics moved and no verdict changes."*
* ⚠️ **re-measure on the MERGED tree, last** (the era-pin habit): if anything else in `src/**` lands in the same merge the hash moves again.

Everything else on this branch is outside the engine corpus (`functions/`, `site/`, `scripts/`, `server/`, `marketing/`, `package.json`), so item 5 is the only cause.

---

## The full `npm run test:node-guards` battery — every red attributed

`GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, rc=1, **843 tests / 806 pass / 30 fail** plus file-level failures. Every red is accounted for; only two belong to this tree.

| class | count | attribution | evidence |
|---|---|---|---|
| **engine hash** — `bench-seeds.test.mjs :: rotation registry…`, `engine-era-guard.test.mjs :: the landed registry names the live engine` | 2 | **MINE — F-RUL-2**, item 5's src edit rotates the hash | revert-run-reapply: both green with `worldDispatches.ts` at `797052233` |
| `fixture-teardown.test.mjs :: all 151 fixture owners remove their temp directories` | 1 | **knock-on of the two above** — it runs every `scripts/*.test.mjs` as a child and reports `scripts/bench-seeds.test.mjs child failed` | re-run alone, 199 s: same single cause, no leaked directory |
| `ERR_MODULE_NOT_FOUND` on `vite`, `three`, `three/examples/jsm/math/ConvexHull.js`, `@rolldown/binding-*` | 22 | **ENVIRONMENT, another agent** — a concurrent `npm install` in the PRIMARY checkout rewrote `node_modules` mid-battery; this scratch worktree's `node_modules` is a symlink into it | `node_modules/{three,vite}/package.json` and `.package-lock.json` all stamped **22:20**, inside the run window; all three specifiers import cleanly now; a sample of six of the failed files re-run **32/32 green** |
| `assay-replay :: the hill-mine libm divergence tape`, `deepwater-rider-parity :: Regatta measures the rider`, `collection-guards-cwd-invariance :: town-spec-collection` + `whole-suite-collection` | 4 | **LOAD** | re-run together, single-worker: **15/15 green** |
| `gr-sim.test.mjs` :: `overtime banks the Claim secure…` (240 s timeout), `runtime rush and --overtime…` (90 s timeout) | 2 | **LOAD** | re-run alone: **2/2 green**, 120.4 s and 49.3 s — comfortably inside their own bounds |

The contention advisory guard itself passed (*"contention is advisory, correctly counted, and absent when alone"*), as did `no-emdash-guard`, `view-schema-guard`, `gate-caller-audit`, `law-pointer-guard`, `skillmd-guard`, `battery-manifest` and all three guards this branch adds.

## `run-guards --changed-since 797052233` — 7 of 8 gates PASS

`GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 797052233`, rc=1, 18 files changed, 8 gates selected (the `functions/**` edits correctly pull in the behaviour trio):

```
FAIL  rc=1  475s  test:node-guards
PASS  rc=0    0s  test:power-budget   p95=0.340ms
PASS  rc=0    8s  test:stats
PASS  rc=0    3s  test:accounts
PASS  rc=0    5s  test:mp
PASS  rc=0    0s  test:task-guards
PASS  rc=0    3s  test:citations
PASS  rc=0    0s  test:gate-callers
guards: 7/8 passed -- RED: test:node-guards
```

The single RED is `test:node-guards`, already run in full and attributed above; run-guards keeps only its last 20 lines, and the failure visible there is **`node-guards-contention.test.mjs :: contention is advisory, correctly counted, and absent when alone`** — *"node-guards board did not stay quiet for 300ms"* — with the harness printing `CONTENDED — 2 concurrent batteries` twice. That is the contention advisory reddening beside other batteries on a shared box: **attributed, not chased.** (It passed in the standalone battery run, when the board happened to be quiet.) The truncated line above it is an `AssertionError … strictEqual`, which on this tree is the F-RUL-2 engine-hash red.

⚠️ `test:task-guards` reads PASS rc=0 in 0 s because it **SKIPS** in a linked worktree by F-1151-1, not because it computed a verdict. Its real answer is the measurement in §6: invisible set 0.

## Gates (this branch)

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | rc=0 |
| `npm run test:accounts` | 43 kv + 43 sqlite checks pass |
| `npm run test:mp` | 466 checks pass |
| `npm run test:stats` (stats + standings + ledger worker) | 87 · 320 kv + 320 sqlite · pass |
| `npm run test:gate-callers` | PASS, 0 TODO placeholders |
| `node scripts/law-pointer-guard.mjs` | PASS, 94 pointers, 90 instruments |
| `scripts/ratelimit-window.test.mjs` | 6/6 (4/6 red on base) |
| `scripts/landing-rotation-derivation.test.mjs` | 6/6 (0/6 red on base) |
| `scripts/world-dispatch-boss-trigger-guard.test.mjs` | 3/3 (1/3 red on base) |
| `scripts/skillmd-guard.test.mjs` | 16/16 |
| `server/codex-shim/serve.test.mjs` (pure) | 5/5, 0.39 s |
| `server/codex-shim/serve.live.test.mjs` (no flag) | rc=0, 3 skipped, 0.08 s, zero tokens |
| `e2e/transfer-board.spec.ts` | rotation + generalization assertions pass both projects; the trailing console-error assertion is a BASE red, attributed by revert-run-reapply |
