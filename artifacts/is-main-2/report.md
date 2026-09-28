# is-main-2: implementer report

**Branch** `fix/is-main-2` in `/Users/robin/Claude/Projects/wt-im2`, cut from main at `f99bb77f3` (main has moved on 21 commits since; not merged or rebased; two of main's own commits cherry-picked on the coordinator's order, section 4).
**Implementer** Claude Opus 5.5 at maximum effort, attended-side scratch worktree, never Codex. **Date** 2026-09-26.
**Verdict** READY-FOR-GATES. All twenty-three main-module checks now run their main through a symlinked path: nineteen import `isMain`, four carry the byte-identical copy, and which case each is was MEASURED before anything was committed (the plain import applied to all twenty-three, then every test that names or relocates them: exactly the four copy candidates redded, 14 reds, none traced to the nineteen). The two that threw on a `node -e` import now import. The census row is in `scripts/is-main.test.mjs` (arm 9) and passes, ADAPTED: the literal row cannot hold inside this firewall, because the list of twenty-three was not the whole population (F-IM2-1: five more tools carry the same defect, all on disk when the list was made). One consequence the master did not name: `assay-replay-agent.mjs` is its own engine-hash input, so its cure moves the engine hash (F-IM2-2); the drain pins it.

---

## 0. Pre-flight (as the master wrote it)

| Check | Result |
| --- | --- |
| predecessors on main | small-fixes-1 `70cf2362f` (merge) and `6251d955d` (sf1 LANDED); test-truth-2 `5209d4d03` and `6004e97f1`; live-seed-rotation-1 `da13ea750` and `10227e387` |
| `git status --short` | only `?? node_modules` (the symlink) |
| `git log main..HEAD` | empty |
| `npm run build` before any edit | rc 0, 47 s, 1-minute load 250.8 before and 267.3 after (`preflight-build.meta`) |

## 1. Scope 1, measured first: which case each of the twenty-three is

**Static census.** For every file: who names it (2,119 tracked code and test files searched), who imports it (a transitive closure over every `scripts/*.mjs`), and every copy site in 828 test files (`copyFileSync`, `cpSync`, `copyFile`, `cp`, `rsync`, variant writers), each variable copy resolved to the file it copies. Two whole-closure copiers carry `is-main.mjs` along by construction (`guard-source-snapshot.mjs:52-62` copies every `.mjs`; `desk-status-single-read-guard.test.mjs:295` and `gate-caller-audit.test.mjs:60-75` walk `from './x.mjs'`). The droplet deploy is a relocation too: `scripts/deploy.sh:371-478` ships `server/***` and `ops/***` whole but from `scripts/` only five named files (`:387-:391`), never `is-main.mjs`.

**Dynamic measurement** (the reliable measure small-fixes-1 named: swap, then run every test that names or relocates the file). The same 88-test family (`family-88.txt`: every node test naming one of the twenty-three, naming a module whose closure holds one, naming is-main, or copying scripts; `board-tape-gold.test.mjs` left to the locked battery because it starts vite and chromium):

| State | Tests | Pass | Fail | Time, load | Reds |
| --- | --- | --- | --- | --- | --- |
| C, clean main `f99bb77f3` | 903 | 900 | 1 | 616 s, 109 to 26 | `ledger-mirror-freshness-guard:249` (pre-existing, section 4) |
| X, the plain import on all 23 (`all-import-measurement.diff`, never committed) | 903 | 884 | 17 | 447 s, 28 to 10 | **14 relocation reds, all in the four relocators**: `withheld-evidence-audit-guard` 11 arms (`ERR_MODULE_NOT_FOUND`), `assay-worker.test.mjs:204`, `backlog-split-closed.test.mjs:240`, `deploy-mirror-allowlist.test.mjs:97` (`scripts/is-main.mjs` missing from the shipped closure); 2 engine-hash; the pre-existing one |
| Y, the cure (19 imports, 4 copies, the new test) | 908 | 903 | 3 | 452 s, 8 | 2 engine-hash (`bench-seeds:47`, `engine-era-guard:65`), the pre-existing one |

The mirror red was split one tool at a time (`mirror-attribution.txt`): only `serve.mjs` on the import, rc 1, missing `'scripts/is-main.mjs'`; only the agent on the import, rc 1, the same; both on the copy, rc 0.

| # | Tool | Old spelling, line | Who relocates it (file:line) | Case |
| --- | --- | --- | --- | --- |
| 1 | `server/ledger/serve.mjs` | metaFirstUrl `:170` | the deploy mirror (above); `deploy-mirror-allowlist.test.mjs:98` walks its closure; red with the import | **copy** |
| 2 | `scripts/ruling-propagation-guard.mjs` | resolvedArgv `:223` | none: imported in place (`ruling-propagation-guard.test.mjs:11`), spawned in place (`refusal-reason-corpus-guard.test.mjs:79,95`) | import |
| 3 | `scripts/assay-replay-agent.mjs` | resolvedArgv `:122` | `assay-worker.test.mjs:228-230` (a fixed list beside `assay-worker.mjs`), and the deploy mirror by name (`deploy.sh:389`); both red with the import | **copy** |
| 4 | `scripts/blocker-panel-closed-guard.mjs` | resolvedArgv `:237` | none; its closure already reaches `is-main.mjs` | import |
| 5 | `scripts/desk-state-audit.mjs` | resolvedArgv `:264` | none; spawned in place (`desk-unrecorded-mention-guard.test.mjs:60,154`); closure already reaches `is-main.mjs` | import |
| 6 | `scripts/e4-motor-ride.mjs` | resolvedArgv `:87` | none (named only in comments) | import |
| 7 | `scripts/e7-playbook-digest.mjs` | resolvedArgvReversed `:116` | none; spawned in place (`e2e/e7-playbook-rows.spec.ts:169`) | import |
| 8 | `scripts/evidence-budget.mjs` | namedResolve `:199` | none; `--root` in place (`evidence-budget.test.mjs:23,27`) | import |
| 9 | `scripts/evidence-offload.mjs` | namedResolve `:469` | none; `--root` in place (`evidence-offload.test.mjs:21,75`) | import |
| 10 | `scripts/evidence-readers.mjs` | namedResolve `:518` | none; `modified-tracked-evidence-census-guard.test.mjs:103` writes its variant INTO `scripts/` | import |
| 11 | `scripts/findings-state-guard.mjs` | resolvedArgv `:214` | `backlog-split-closed.test.mjs:24,232`: a fixed `DEPS` list (ledger-corpus.mjs and this file) beside a variant; red with the import | **copy** |
| 12 | `scripts/gate-battery.mjs` | resolvedArgv `:240` | none | import |
| 13 | `scripts/frontier-registry.mjs` | rawArgv `:122` | none; spawned in place (`frontier-registry.test.mjs:58`) | import |
| 14 | `scripts/gazette-backfill-sweep.mjs` | namedResolve `:323` | none; spawned in place (`gazette-scan-space-guard.test.mjs:37,40`) | import |
| 15 | `scripts/review-evidence-audit.mjs` | resolvedArgv `:214` | none | import |
| 16 | `scripts/spawn-bound-census.mjs` | resolvedOrEmpty `:351` | none; spawned in place (`spawn-census-mask-regex-guard.test.mjs:119,128`) | import |
| 17 | `scripts/row-quote-currency.mjs` | resolvedArgv `:452` | none | import |
| 18 | `scripts/stream-showcase.mjs` | unguardedUrl `:74` (THREW on import) | none; imported in place by `stream-director.mjs` | import |
| 19 | `scripts/terrain-contract-scope.mjs` | resolvedArgv `:124` | none; spawned in place (`terrain-contract-scope.test.mjs:12`) | import |
| 20 | `scripts/second-rider.mjs` | resolvedUrl `:315` | none; imported in place (`e2e/second-rider.spec.ts:7`) | import |
| 21 | `scripts/stream-director.mjs` | unguardedUrl `:139` (THREW on import) | none; imported in place (`stream-director.test.mjs:3`) | import |
| 22 | `scripts/ticker-stats.mjs` | guardedUrl `:193` | none; imported in place (`test-ticker-stats.mjs:7`) | import |
| 23 | `scripts/withheld-evidence-audit.mjs` | resolvedOrNullish `:319` | `withheld-evidence-audit-guard.test.mjs:58,144,167,233,294` copies it ALONE; `:98-99` writes a variant alone; red with the import | **copy** |

(`serve.mjs`'s check had moved from the listed `:130` to `:170` since small-fixes-1 measured it; every other line matched the list.)

## 2. Scope 2, the cure

- Each check is now `if (isMain(import.meta.url)) ...` on the SAME line as before, in all twenty-three. **No line moved anywhere**: the import takes the place of an import only the check used, or the blank line after the imports; each pinned copy sits after the check at the foot (hoisted), with a JSDoc naming what relocates the file. Line counts above every check are unchanged (the apply step asserted it per file). Pointers that cite these files (`.gitignore:77`, `assets/engine-era.json:730`, `desk-lock-predicate-guard.test.mjs:72`, `triage-instrument-spawn-bound-guard.test.mjs:20`, `gate-battery.mjs:291`) still land. `source-pointer-guard` PASS (686 files, 5 same-file citations), `law-pointer-guard` PASS (34 instruments, 0 dead).
- Imports that only the check used are gone (`pathToFileURL` from `serve.mjs`, `second-rider.mjs`, `stream-director.mjs`, `ticker-stats.mjs`; `fileURLToPath` from `desk-state-audit.mjs`; `path` and `fileURLToPath` from `e7-playbook-digest.mjs`, `resolve` and `fileURLToPath` from `gazette-backfill-sweep.mjs`, whose second line became a one-line comment on the check). The two comments above checks that taught the old idiom (`ruling-propagation-guard.mjs:218-222`, `e7-playbook-digest.mjs:113-115`) are rewritten in place, same line count.
- `server/ledger/serve.mjs`: only the check and its imports changed (`pathToFileURL` dropped, `import fs from 'node:fs'` on the blank line), plus the pinned copy at the foot.

## 3. Scope 3, the proof

**`scripts/is-main.test.mjs`**, arms 1 to 7 unchanged, four new arms (12 tests, about 1 s):
- **8 THE TWENTY-THREE**: nineteen import `isMain` once and call it once, read no `process.argv[1]`, keep no old spelling; four carry the copy, byte-identical to `scripts/is-main.mjs`, and import nothing; `stream-showcase` and `stream-director` import under `node -e` without running main (from a scratch cwd: `stream-director.mjs:138` loads a cwd-relative `.env.local` at import, F-IM2-7).
- **9 CENSUS, the row**: every tracked tool file under `scripts/`, `server/`, `ops/` (387 files, `git ls-files`, tests excluded) that reads `process.argv[1]` is the helper, a pinned copy (6), or a NAMED entry: 7 realpath on both sides, 4 name matches, 5 OWED (F-IM2-1). A new reader reds with instructions; a named reader that stops reading reds until it leaves its table; each class is re-checked (realpath entries still call `realpathSync`, name matches still match a name, owed entries still carry their exact spelling). **Result: `census: 387 tracked tool files; 23 read process.argv[1]: 7 isMain (the helper and 6 pinned copies), 7 realpath on both sides, 4 name matches, 5 owed (F-IM2-1)`**, declared on every run.
- **10 SPELLINGS**: all twelve spellings the twenty-three and the owed files carried, evaluated in process with `import.meta.url` the real URL (arm 1 proves node does that): true by the real path, false by a symlinked one; the unguarded one throws `ERR_INVALID_ARG_TYPE` with no argv.
- **11 THE NAMED TWO**: 11a `server/ledger/serve.mjs` with `LEDGER_DB_PATH` unset (main throws its first check before vite or any port): rc 1 and the same bytes by the real path and a symlink; its pre-cure line restored in a relocated copy (storage.mjs beside it, vite through a node_modules link) refuses by its real path and exits **0 with nothing printed** through a link. 11b `ruling-propagation-guard.mjs` in a fixture tree with one stale refusal: rc 1 and identical output by both spellings; its pre-cure line restored: rc 1 by the real path, **rc 0 and silent** through a link.
- **Control first**: the new test on the PRE-CURE bytes (only the test differing from HEAD) reds 4 of 12 with the defect itself: arm 8 (`blocker-panel-closed-guard.mjs imports isMain exactly once`), arm 9 (names the nineteen readers with their old lines), 11a and 11b (silent through a link). On the cure: 12 of 12; inside the locked battery: 12 of 12 (`is-main-test-control-precure.log`, `is-main-test-final.log`, `node-guards-battery.log`).

**The symlink runs, all twenty-three** (`symlink-run-table.mjs`, each by its real path and by a file symlink, plus a `node -e` import probe; every invocation read first and chosen local and read-only):

| | BEFORE (load 157 to 129) | AFTER (load 9) |
| --- | --- | --- |
| through a symlink | **23 of 23 SILENT**: rc 0 and 0 B, while the real path printed (27 B to 51,895 B) | **22 SAME** (rc and bytes identical); `e7-playbook-digest` DIFFERENT only by the PID inside node's own warning line (`e7-different-is-the-pid.txt`) |
| `node -e` import | 21 IMPORTS, **2 THROW** `ERR_INVALID_ARG_TYPE` (stream-showcase, stream-director) | **23 IMPORTS** |

The named two by the table: `serve.mjs` 1, 27 B to 0, 0 B (SILENT) before; 1, 27 B both ways after. `ruling-propagation-guard.mjs` 0, 1601 B to 0, 0 B before; 0, 1601 B both ways after.

**The ledger door starts and serves** (`serve-start-proof.txt`, inside the lock beside `test:stats`, a minimal environment with no inherited secret, 127.0.0.1 only): by the real path and through a symlink, each listening in 687 and 510 ms, `GET /api/stats` 200 JSON, `GET /no-such-route` 404 `not_found`, exit 0 on SIGTERM to its own PID, empty stderr.

## 4. Self-check

| Check | Result |
| --- | --- |
| tsc and build (`npm run build`, HEAD `78eb160e6`) | rc 0, 19 s, load 7 to 12 |
| `node --test scripts/is-main.test.mjs` | 12 of 12, about 1 s |
| every changed tool, the way its callers run it (`callers-way.txt`, HEAD `78eb160e6`) | `test:ruling-propagation` 0, `test:findings-state` 0, `test:blocker-panel` 0 (package legs); `desk-state-audit` 0; `evidence-budget f99bb77f3 HEAD` 0 PASS (drain skill); `evidence-offload --plan` 0; `gate-battery` one job, OVERALL rc 0 (drain skill); `terrain-contract-scope --check` 0; `e7-playbook-digest --all --sub-wave` 0 (the e2e call); `e4-motor-ride --contract e4-dust-flats` 0; `test-ticker-stats` 0; `assay-replay-agent` on a reel minted by that ride: rc 0, identical 145 B by both paths (`assay-agent-tape-run.txt`; the committed v1 reel is refused as legacy, its documented verdict). The rest were run as callers do by the AFTER table. `second-rider` and `stream-showcase` only to their argument refusal: the first defaults to the live Pages URL, the second opens a headed browser |
| **locked**, one call of `dlock.sh`, held 02:39:24Z to 03:07:45Z | `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` rc 1, 1204 s, load 75 to 13: leg 1 `1037 tests, 1025 pass, 7 fail, 5 skipped`; legs 2 to 8 run alone: rc 0 except leg 6 `test:desk-declaration` rc 2. `npm run test:ledger-guards` rc 1, 106 s: leg 1 `1263, 1247 pass, 13 fail, 3 skipped`; legs 2 to 16 rc 0 except `test:desk-declaration`, `test:desk-birth`, `desk-carryforward-guard` rc 2. `npm run test:stats` rc 0 (576 standings assay checks, 26 ledger-worker checks). Door proof rc 0 |
| the reds, attributed | **2 engine-hash** (`bench-seeds:47`, `engine-era-guard:65`): this branch, commit `78fd113f5` alone (`engine-hash-attribution.txt`: every other cure applied and the agent at HEAD bytes gives exactly the pin `2cf26ba4` and 9 of 9; the cured agent gives `540b9d70`, 7 of 9); the drain's same-era pin cures them. **Every other red is identical on clean-main bytes** (`red-controls.txt`: the 25 files the branch changed outside artifacts swapped back to `f99bb77f3`, then restored, 0 differing): the droplet-host class, 15 tests (`ledger-backup-pull.test` 2, `ledger-backup-fill-gaps-guard` 7, `ledger-pull-supply-window-guard` 5, `ledger-mirror-freshness-guard:249` 1; `ledger-backup-pull.mjs:8-9` wants `GR_DROPLET_HOST` or a cwd-relative `.env.local`, which a scratch worktree lacks); the linked-worktree refusal (the three desk guards and `desk-declaration-guard.test.mjs:163`: main's STATUS line 1 is not this branch's, main is 21 commits ahead); `node-guards-contention:124` (the shared host: "CONTENDED, 3 concurrent batteries"); and `fixture-teardown:34`, whose only survivor is `ledger-mirror-freshness-guard.test.mjs: 1 [s2672-dest-...]` (its arm 23 asserts at `:266` before its `rmSync` at `:267`), with `is-main.test.mjs: 0` |
| the engine hash | moved by `78fd113f5` only, `2cf26ba4...405b` to `540b9d70888447473ef5ed8ee702094928f201d62ff8c8b51f99bc82fd98d530`; `assets/engine-era.json` untouched |
| em and en dashes | 0 in the 487 added lines and in every file written here |

**What happened on the way, stated plainly.** (1) The first locked batch ran on the base's broken `test:node-guards` roster (every test file, the fix is main's `d2fafe4dd` and `06b31d3df`); on the coordinator's message I stopped my own batch by PID (9 processes frozen, re-snapshotted, TERM, one KILL; `dlock.sh` released the lock through its EXIT trap), cherry-picked both commits (`6c00b820e`, `63fec6e81`, `package.json` only; the roster check prints 168, no test added), and relaunched. The stopped run is kept as `aborted-wrong-roster-*` (1071 results, 5 wrong-context reds in 11 min). (2) My batch script re-ran a failed chain's FIRST leg on its own, duplicating the 20-minute battery; I stopped that duplicate by PID after 98 s (leg 1 rc 143 in `locked-batch.out`), and the later legs ran. (3) The ledger-guards chain's first leg was likewise re-run once (119 s); its result matches the chain's.

## 5. Findings (outside this firewall; reported, not fixed)

- **F-IM2-1: the list of twenty-three was not the whole population; five more tools carry the same defect**, all on disk at small-fixes-1's cut `2cf3feea4`: `ops/droplet/ledger-backup.mjs:83` (the droplet's nightly backup; latent there because systemd starts it by its real path from `/opt/goldrush`, `goldrush-ledger-backup.service:7-8`), `server/codex-shim/serve.mjs:282`, `scripts/glb-contract-guard.mjs:561` (measured SILENT through a link: 1755 B by its real path, 0 B linked), `scripts/modified-tracked-evidence-census.mjs:515` (SILENT: 5445 B, 0 B), `scripts/untracked-evidence-durability.mjs:470` (through a link it exits 0 at once with nothing; by its real path it was still working at the table's 300 s bound). Three wrap both sides in `resolve()`, two sit outside `scripts/`. Censused as OWED (arm 9 reds when one is cured, until it leaves the table). Cure: an is-main-3 by the same method; `ledger-backup.mjs` and the codex shim ride the mirror (`ops/***`, `server/***`), so they need the pinned copy.
- **F-IM2-2: `assay-replay-agent.mjs` is its own engine-hash input** (`ENGINE_SOURCE_INPUTS[0]`, `:36-37`): any cure of its main-module check moves the hash. `78fd113f5` moves it to `540b9d70`; `bench-seeds:47` and `engine-era-guard:65` red until the drain appends the same-era pin. The commit is separable, but arms 8 and 9 count the agent among the four copies, so deferring it means deferring the test commit `78eb160e6` too, or moving the agent to `CENSUS_OWED` and the count to 22.
- **F-IM2-3: four tools decide main by FILE NAME** (`f-astra-6-census.mjs:165`, `lane-absorbed-lines.mjs:63`, `lane-usable.mjs:929`, `ledger-mirror-dest.mjs:91`): they survive a same-name link and go silent through a renamed one. Seven more hand-roll the realpath comparison correctly (`backlog-split-closed`, `first-town-payload`, `kv-to-ledger-migrate`, `ledger-mirror-exposure`, `ledger-mirror-freshness`, `status-rotate-month`, `worktree-registry-ledger`): consolidation candidates, not defects. Both censused.
- **F-IM2-4: `scripts/is-main.mjs`'s header** (`:27-31`) still says two scripts carry the copy; there are six. This firewall forbids touching that file; update it at its next touch.
- **F-IM2-5: a rotted pointer, not moved by this task**: `functions/api/_accounts.ts:773` cites `server/ledger/serve.mjs:119` for the droplet's `RESEND_API_KEY`; that line is `requestBody` and the binding sits at `:156` (was already so at `f99bb77f3`).
- **F-IM2-6: the census row as written cannot pass inside this firewall** (16 readers in files the master does not list, F-IM2-1 and F-IM2-3). Adapted as described in section 3: named tables with measured classes, so the row still reds on any new reader and on every cure that forgets the table.
- **F-IM2-7: two tools read `.env.local` relative to the cwd at load**: `stream-director.mjs:138` at IMPORT time, before its main-module check, so any import from the repo root loads the owner's secrets into that process; `ledger-backup-pull.mjs:8` too. Arm 8 imports `stream-director` from a scratch cwd for that reason.
- **F-IM2-8: fifteen ledger-backup tests red in every scratch worktree** (the droplet-host class above), and `fixture-teardown` inherits one survivor from them. A test-owned `GR_DROPLET_HOST` would make them worktree-independent.

## 6. Commits (branch `fix/is-main-2`, path-scoped, prefix `fix:`)

| Hash | Concern | Paths |
| --- | --- | --- |
| `5cd992fbc` | the ledger door (copy) | `server/ledger/serve.mjs` |
| `f36a06351` | ruling-propagation-guard (import) | `scripts/ruling-propagation-guard.mjs` |
| `d03703a64` | eighteen more (import) | the eighteen `scripts/*.mjs` |
| `0f4ecee78` | two relocated by fixtures (copy) | `scripts/findings-state-guard.mjs`, `scripts/withheld-evidence-audit.mjs` |
| `78fd113f5` | the agent (copy), moves the engine hash | `scripts/assay-replay-agent.mjs` |
| `78eb160e6` | the test: arms 8 to 11, the census row | `scripts/is-main.test.mjs` |
| `45d94b971` | evidence before the lock | `artifacts/is-main-2/**` |
| `6c00b820e`, `63fec6e81` | main's `d2fafe4dd`, `06b31d3df` cherry-picked on the coordinator's order | `package.json` |
| the commit carrying this file | report and locked-batch evidence | `artifacts/is-main-2/**` |

## 7. Remaining list in order

1. Drain: merge `fix/is-main-2` (the two cherry-picks carry main's own `package.json` bytes).
2. Drain: the same-era pin for `540b9d70888447473ef5ed8ee702094928f201d62ff8c8b51f99bc82fd98d530` (F-IM2-2), measured on the merged tree.
3. is-main-3 for F-IM2-1's five (the backup and the codex shim by pinned copy).
4. At next touch: F-IM2-4 (the helper header), F-IM2-3 (the four name matches onto `isMain`), F-IM2-5 (the pointer), F-IM2-7 and F-IM2-8.
