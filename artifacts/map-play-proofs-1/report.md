# map-play-proofs-1 — report

**Master:** `tasks/map-play-proofs-1.md` (owner 2026-09-25, verbatim: *"lets also do the play proofs. but don't use too much effort here?"*).
**Implementer:** Opus, scratch worktree `/Users/robin/Claude/Projects/wt-mpp1`, branch `test/map-play-proofs-1`, cut from main `cb484e124`. Node 26.4.0.
**State of this report:** items **1 and 2 only**. Items 3 to 6 (the eighteen maps in batches, the census, the eighteen status rows, the findings) are HELD by the master's own item 2 — the attended session resumes them once the Astra lane run on lane-c has finished, because a loaded host fakes a timing failure.

## Pre-flight (run before anything was touched)

| check | result |
|---|---|
| `git status --short` | one line, `?? node_modules` (the symlink). No modified tracked file, so no factory-churn exception was needed. |
| `git log main..HEAD --oneline` | empty |
| `npm run build` | **rc=0** (`tsc` + `vite build` + asset diet), log `scratchpad/preflight-build.log` |

## Item 1 — `GR_SECURE_CONTRACTS`, the one env override

`e2e/playability-secure.spec.ts` +15/-1 (one hunk, immediately under `SECURE_CONTRACTS`): the six-map list is
left exactly as written and a `SELECTED` list is resolved in front of it. `all` (case-insensitive) means every
board contract; a comma list means those ids; empty or unset means the six, unchanged. `GR_SECURE_ONLY` still
narrows whatever the list resolves to, and the `GR_PLAYABILITY_SECURE` skip above it was not touched.

| proof (`npx playwright test e2e/playability-secure.spec.ts --list`) | measured |
|---|---|
| env **unset** | **12 tests in 1 file** — identical to the pre-edit listing: same six ids in the same board order, same two projects, same titles. Normalising only the `spec.ts:LINE:COL` coordinate, `diff` of the before/after listings is **empty but for the node PID in the harmless `ExperimentalWarning` line**. The coordinate moved `644:5` → `658:5` (the hunk adds 14 lines above the test), and nothing in the repo cites it: the only line-numbered citation of this file anywhere is `artifacts/rulings-county-2026-09-19/report.md:79` quoting `:37`, in the header, which did not move. |
| `GR_SECURE_CONTRACTS=e1-baron` | **2 tests** — `e1-baron` on desktop-chrome and mobile-chrome, nothing else. |
| `GR_SECURE_CONTRACTS=all` | **84 tests** = 42 board contracts x 2 projects. |
| the eighteen pending ids, comma-separated | **36 tests** = 18 x 2, which also proves every one of the eighteen ids in the status doc resolves to a real board contract (a typo would silently drop a map, since the override filters rather than validates — see the note below). |

| self-check | result |
|---|---|
| `npx tsc` | rc=0 |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/citation-title-guard.test.mjs scripts/no-emdash-guard.test.mjs` | **19 pass / 0 fail** |

**Reported, not fixed (outside the firewall):** the override filters and does not validate, so an id that is
not on the board is dropped silently and would shrink a batch without saying so. Guarded operationally instead:
every batch's `--list` count is checked against the expected `maps x projects` before it is run, as above.
The `test.describe` title still says "the six open maps" while the list can now hold eighteen; renaming it is a
spec change item 1 forbids, so it stays. Checked rather than assumed: that title string appears in no tracked
task doc or guard corpus, only in two prior playwright JSON reports under `artifacts/sol/map-art-campaign-2/`,
so nothing gates on it.

## Item 2 — the smoke: `e1-baron`, desktop-chrome, one locked command

Run at **2026-09-25 01:33:22Z to 01:36:31Z, 3.1 min wall**, inside one
`scratchpad/dlock.sh` command that started the dev server, waited for it, ran playwright and stopped the
server by number (`npx vite --host 127.0.0.1 --port 5319 --strictPort`, F-1457-1's own prescribed fix; the
`external-server-guard` globalSetup classified it `dev` on `/@vite/client` = `text/javascript`, and the port
was verified released afterwards). Flags: `GR_CAPTURE_EXTERNAL_SERVER=1
GR_CAPTURE_BASE_URL=http://127.0.0.1:5319 GR_PLAYABILITY_SECURE=1 GR_SECURE_CONTRACTS=e1-baron`,
`--project=desktop-chrome --workers=1 --reporter=line`. Transcript: `scratchpad/smoke-baron.log`; the runner is
`scratchpad/smoke-baron.sh`. **The host was NOT quiet** — the Astra lane run on lane-c was live throughout, which
is exactly why the master holds the eighteen-map run for a quiet host.

**The instrument did its job: 1 test selected, 1 row appended.** `artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl`
did not exist in this worktree (the live append path has never been committed; earlier passes were mirrored into
`secure-rows-v0/v1/-BEFORE/-AFTER-desktop.jsonl`), so the spec created it and it now holds **exactly one line, 1,906 B**.

| map | project | secure wave | boots | secures | banks | board | reload | clean | peak wave |
|---|---|---|---|---|---|---|---|---|---|
| The Claim-Jumper Baron (`e1-baron`) | desktop-chrome | 20 | **PASS** `activeId=e1-baron secureWave=20` | **FAIL** `runState=dead at wave 21 / 550.4s sim, 434 kills, 10 gold` | FAIL skipped: never secured | FAIL skipped: never banked | FAIL skipped: never banked | **PASS** 0 console, 0 page | **21** |

End state: `runState=dead`, 0 HP, 10 gold, 434 kills, 550.4 s sim, **1 building placed**, 19 upgrades taken,
3 diagnostics samples. playwright exit code **1** (the red is the row, not the harness: the spec appends the row in
a `finally` and only then asserts the cells).

**Notes the row carries, verbatim** — and they are the reason this map's verdict is not obvious:
`kit=turret+sentry_beacon+turret+turret`, `home=0.0,12.0`, `could not stand at 0.0,10.0 for turret; building from
11.1,-9.4`, `seam gold-seam-2 (7.5,6.5) unreachable on foot`, `seam gold-seam-1 (25.0,6.9) unreachable on foot`,
`could not fund sentry_beacon (cost 25, purse 0)`, `could not fund turret (cost 70, purse 10)`, plus six fords
crossed at `x=0`.

**Observation, held for the full run rather than filed now (item 5 is a resume item).** The Baron played to
**wave 21, past its secure wave of 20**, killed 434 outlaws and still never showed the Claim Secured overlay,
having funded **one** building because BOTH declared gold seams read as unreachable on foot for the generic
kit. The 2026-09-17 pass recorded the same shape (`dead at wave 20 / 522.7 s`, 622 kills, 2 buildings, the same
two unreachable seams), so this is reproducible and one map's worth of evidence already points at the
instrument's economy on this geometry rather than at a terminal/persistence defect. Whether that makes the row
`FAIL` or `instrument limit` is item 5's call, on the full run's evidence, not on a smoke.

## Commits

| commit | what |
|---|---|
| `f0c01a42f` | `test:` the `GR_SECURE_CONTRACTS` override plus its listing proofs (`e2e/playability-secure.spec.ts` +15/-1) |
| this commit | `test:` the Baron smoke row (`artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl`) and this report |

## REMAINING LIST IN ORDER (items 3 to 6, held for the attended resume)

1. **The eighteen on both projects**, `--workers=1`, default timescale and budget, in batches of six maps per
   locked command, server started and stopped inside each; a failing map re-run ONCE alone on a warm server
   before it is called a failure. The ids, verified to resolve (36 listed tests): `e1-baron, e2-pressure-garden,
   e2-incline, e3-blackout-ridge, e3-canyon-works, e3-fairground, e4-dust-flats, e4-gusher-county, e4-boneyard,
   e8-far-side, e8-low-orbit, e8-eclipse, e9-dome-basin, e9-seed-run, e9-devils-alley, e9-old-canal,
   e10-last-claim, e10-river`. Batch budget to expect: the 2026-09-17 desktop pass did six maps in 10.7 min when
   they died early; a map that plays to wave 20+ costs about 3 min per project, so a six-map batch on both
   projects is roughly 30 to 70 min, inside the master's 60-120 min estimate.
2. **The census** `docs/bench/playability-secure-census-2026-09-25.md`, one row per map and project, six cells,
   peak wave, secure wave, end state, one-line note, plus the run conditions.
3. **The eighteen status rows** in `reviews/sol-map-art-current-status-20260909.md`: the playability column only,
   `play proof 2026-09-25: PASS (desktop N / mobile N)` or `FAIL: <first failing cell and why>` or
   `instrument limit`, nothing else in those rows, Astra's art column untouched.
4. **Findings** `F-MPP1-<n>` per failing map or cell, with the row evidence.
