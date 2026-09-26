# localhost-cors-2: implementer report

**Branch** `fix/localhost-cors-2` in `/Users/robin/Claude/Projects/wt-lc2`, cut from main at `39f88d36f`. The amended master was read from main at `11e061e29` with `git show` (main not merged or rebased, as instructed).
**Implementer** Claude Opus 5.5 at maximum effort, attended-side scratch worktree, never Codex. **Date** 2026-09-26.
**Verdict: READY-FOR-GATES.** Every one of the eight doors now admits a localhost origin only when `ALLOW_LOCALHOST_ORIGINS` is exactly `'1'`, through one helper that reads that variable and nothing else (`functions/api/_cors.ts`); the mail key is off the CORS path. The in-process probe over all 22 CORS entry points: **134 of 782 rows broke the rule before, 0 of 782 after**, and two defects manufactured in the helper are caught (44 and 134 rows). Every harness that starts the functions passes the switch to its own dev run, so every gate below ran in this worktree with NO `.dev.vars`, `.env` or `.env.local` present, the way a fresh clone and the drain's detached worktree run them. `wrangler pages dev` was measured reading the root `.dev.vars` at runtime. `src/**`, `server/**` and `wrangler.toml` are byte-identical to the cut.

---

## 0. History of this run

1. **First pass, stopped (commits `027dc3a9f`, `4e97cb1b0`).** The master's scope 4 expected no e2e battery to need the variable. Measured instead: `e2e/tl-02-public-stats.spec.ts:197-199` asserted the behavior this slice removes; six multiplayer specs and `scripts/test-stats.mjs` pass only where a root `.dev.vars` exists; `assay-season-roll` was uncertain (F-LC2-1 to F-LC2-4). None was on the TOUCH-ONLY list, so the run stopped before any door changed, with the probe and its BEFORE counts banked.
2. **The amendment.** The coordinator amended the master on main (`11e061e29`): a named firewall lift for exactly those dependents, `.gitignore` (one line) and the standings 308 argument (F-LC2-8, F-LC2-9), and scope 4 rewritten from the measurements. This pass implements it. Pre-flight held: tracked tree clean, `npm run build` rc 0 before any edit (42 s, vite 2933 modules, host load 56 to 89); `git log main..HEAD` held only the first pass's two artifact commits.

---

## 1. What changed

| Commit | Concern | Paths |
| --- | --- | --- |
| `ec717cb76` | the eight doors key their localhost arm on one helper | `functions/api/_cors.ts` (new), `_bugs.ts`, `_accounts.ts`, `redeem.ts`, `standings.ts`, `refusals.ts`, `telemetry.ts`, `stats.ts`, `_multiplayer.ts` |
| `82f50c0c3` | the local runners opt in, each for its own dev run | `scripts/test-accounts.mjs`, `scripts/test-multiplayer.mjs`, `scripts/test-stats.mjs`, `e2e/mp-06-party-overview.spec.ts`, `e2e/mp-arsenal.spec.ts`, `e2e/agent-seat.spec.ts`, `e2e/second-rider.spec.ts`, `e2e/mp-reconnect.spec.ts`, `e2e/mp-02-lockstep.spec.ts`, `e2e/assay-season-roll.spec.ts` |
| `030b8e540` | the stats preflight rows assert the rule both ways | `e2e/tl-02-public-stats.spec.ts` |
| `b2d0c3992` | the switch documented | `.gitignore`, `.dev.vars.example`, `docs/ops/ops-evening-2026-09.md` |

- **The helper**, `functions/api/_cors.ts` (23 lines): `localhostOriginAllowed(origin, env)` returns `env?.ALLOW_LOCALHOST_ORIGINS === '1' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)`, with the type `LocalhostOriginsEnv`. The variable and nothing else decides it (not the mail key, not `DEV_AUTH`, never a header, origin or host); an undefined env refuses. The localhost pattern the eight doors repeated now lives only here (`grep -rln 'localhost|127' functions/api/` names only `_cors.ts`). Each door keeps its own `ALLOWED_ORIGINS = new Set(...)`, which `scripts/function-cors-allowlist.test.mjs` counts.
- **Each door:** its env type is intersected with `LocalhostOriginsEnv`, `corsHeaders` takes the env, and the localhost arm is `localhostOriginAllowed(origin, env)`. Call sites that changed only their argument: `redeem.ts:39`, `stats.ts:57`, `telemetry.ts:96`, `refusals.ts:70`, `standings.ts:259`, `:561`, `:1935`, `_multiplayer.ts:136`, `:155`, `:630` (the bug office and the accounts copy already passed the env). `refusals.ts` and `standings.ts` now take the env where they took `ALLOWED_CORS_ORIGINS` and read the droplet's extras from it. The bug office drops `RESEND_API_KEY` from `BugsEnv` (its only reader was the CORS arm); the accounts copy drops `devOrigins` and keeps `isDev` and the sender check (SEC-10, not the CORS path). `RESEND_API_KEY` is now read only by `_accounts.ts` `requestCode`, `sendEmail` and `isDev`.
- **`standings.ts`, the CORS arm only plus the 308 argument (F-LC2-8):** the two CORS call sites, `canonicalRedirect`'s one `corsHeaders` argument at `:1935` (the 308 carries the door's CORS answer, now under the same rule; the redirect's logic is untouched), the env type and `corsHeaders`. The import takes the blank line after the import block, so none of the file's 1993 lines moves: `docs/bench/same-game-audit.md` cites `standings.ts:1750..1776` 672 times, and its guards compare only the verb set and the citation format, so a shift would rot the report without redding anything.
- **Comments (F-LC2-10):** the bug office and accounts CORS blocks are rewritten, keeping the SEC-8 and F-SEC2-2 history, correcting the claim that Pages binds the sender (F-SF1-8), and dropping the old accounts block's em dashes. The accounts `isDev` block's "Both live doors bind the sender" is corrected (the droplet binds it; the Pages production environment binds neither the sender nor `DEV_AUTH`), and its pointer `server/ledger/serve.mjs:119`, which had rotted onto `async function requestBody`, now names `main()` (F-LC2-11).
- **The harnesses (`82f50c0c3`):** `test-accounts.mjs` adds `--binding ALLOW_LOCALHOST_ORIGINS=1` to every wrangler arm, the `--serve` browser fixture included (`:884-:887`), gives the ledger fixture the variable (`:978-:979`) and gives `callDoor`'s in-process door calls the variable (`:767-:769`). `test-multiplayer.mjs` binds it on both relay arms (`:296-:298`, the unconfigured one running from a temp dir no root `.dev.vars` reaches) and in `callRoomDoor` (`:475-:476`). `test-stats.mjs` binds it on its pages dev run (`:180-:183`). The six multiplayer specs bind it on the pages dev relay they start and never on the room worker (`mp-06-party-overview.spec.ts:295-296`, `mp-arsenal.spec.ts:324-325`, `agent-seat.spec.ts:253-254`, `second-rider.spec.ts:201-202`, `mp-reconnect.spec.ts:238-239`, `mp-02-lockstep.spec.ts:1445-1447`). `assay-season-roll.spec.ts:93-95` gives its in-process county door the variable. The in-process envs are spread (`{ ...env, ALLOW_LOCALHOST_ORIGINS: '1' }`), so every counting store the checks read stays the same object.
- **`tl-02-public-stats.spec.ts:197-206`:** the preflight rows now assert 403 with no allow-origin header without the variable, then 204, the allow-origin header and the methods with `ALLOW_LOCALHOST_ORIGINS: '1'`.
- **`.gitignore`:** one rule, `.dev.vars`, appended at the end after a blank separator, so none of the file's own line pointers move (it cites its `*.log` rule "at line 7" at `:59` and `:81`, and lines 60, 72 and 74 at `:87-:91`). Exact name, so `.dev.vars.example` stays tracked (`git check-ignore -v .dev.vars` names `.gitignore:187`; the example is not ignored). Blast radius measured: no path named `.dev.vars*` existed or was tracked. No wrangler spawn in the repo passes `--env`, so the `.dev.vars.<env>` variants that wrangler's own two-line convention also covers are unused here.
- **`.dev.vars.example` (tracked):** the one line `ALLOW_LOCALHOST_ORIGINS=1` under a header naming it development only, never on Pages or the droplet, which runner reads it, and that once `.dev.vars` exists wrangler loads it instead of `.env` and `.env.local` (F-LC2-6). **`.dev.vars` (gitignored)** was created in this worktree by the dev-vars probe's arm B as a copy of the example, and is not committed.
- **The runbook:** `docs/ops/ops-evening-2026-09.md` gains a short section: never set the variable on the Pages project (production or preview: no `wrangler pages secret put`, no dashboard variable, no `[vars]` entry in `wrangler.toml`) and never in `/etc/goldrush-ledger.env`; the variable-names read that measured F-SF1-8 is the check; a locally served game talking to the live county is refused by every door after this lands (F-LC2-5).

---

## 2. The probe: 134 of 782 before, 0 of 782 after

`artifacts/localhost-cors-2/cors-probe.mjs` calls all 22 CORS entry points of the eight doors in process (vite middleware mode, no port, stub strings only) under five env shapes and seven origins, plus the standings 308 under two more; a preflight is answered by the CORS decision before any handler logic, so nothing is written.

| Env shape | Rows | Before (`39f88d36f`) | After (`b2d0c3992`) |
| --- | --- | --- | --- |
| pages production (the one measured variable plus the KV bindings) | 154 | 44 | **0** |
| droplet production (the env `server/ledger/serve.mjs` builds; sender bound) | 154 | 22 | **0** |
| development (`ALLOW_LOCALHOST_ORIGINS=1`) | 154 | 0 | **0** |
| misspelled development (`=true`) | 154 | 44 | **0** |
| development with the sender bound (`=1` and `RESEND_API_KEY`) | 154 | 22 | **0** |
| pages production, canonical origin bound (the 308) | 6 | 2 | **0** |
| development, canonical origin bound (the 308) | 6 | 0 | **0** |
| **total** | **782** | **134** (rc 1) | **0** (rc 0) |

By door, after: `_bugs.ts` 105 rows, `_accounts.ts` 280, `redeem.ts` 35, `standings.ts` 152, `refusals.ts` 35, `telemetry.ts` 35, `stats.ts` 35, `_multiplayer.ts` 105, zero mismatches each. Sample rows: `stats.ts onRequest | pages production | http://localhost:5188 | 403 cors_forbidden | (none)`; the same with the switch: `204 | http://localhost:5188`; the 308 under pages production from localhost: `308 | (none)`.

**The detector is proven by manufacturing the defect, not only by its green** (each mutant written into `_cors.ts`, the probe run, the original restored byte for byte, sha256 checked):
- M1, any non-empty value accepted (`Boolean(env?.ALLOW_LOCALHOST_ORIGINS)`): **44 of 782**, exactly the misspelled-value rows (`cors-probe-mutation-m1-any-value.txt`);
- M2, the switch removed (the pattern alone): **134 of 782**: pages 44, droplet 44, misspelled 44, the 308 path 2 (`cors-probe-mutation-m2-no-switch.txt`).

Files: `cors-probe-before.txt`, `cors-probe-after.txt`, the two mutation files, beside this report. Re-run: `node artifacts/localhost-cors-2/cors-probe.mjs --label after`.

---

## 3. Which local runner reads the switch

- **`wrangler pages dev` and `wrangler dev`**, from `.dev.vars` in the directory of the config they resolve (installed wrangler 4.107.0, `cli.js:184480-:184491`). This repo's `wrangler.toml` sits at the root, so every `wrangler pages dev public` started there reads the root `.dev.vars`; a run started with `--cwd <dir>` or `--config <dir>/...` reads that directory's instead. **Measured at runtime under the lock** (`dev-vars-probe.mjs` / `gates/dev-vars-probe.txt`): arm A, no `.dev.vars` in the root: a localhost preflight to `/api/stats` answered **403 with no allow-origin**, the county origin 204 with its allow-origin, and wrangler read no variables file; arm B, `.dev.vars` copied from `.dev.vars.example`: the localhost preflight answered **204 with `http://localhost:5188`**, the county origin 204, and wrangler's own log said `Using secrets defined in .dev.vars` (both wrangler pids, 69856 and 69916, stopped by number).
- **Not the vite dev server:** it runs no function; its only middlewares are a deps URL rewrite and the crafting-queue endpoints (`vite.config.ts:313`, `:329`, `:342`).
- **Not the droplet ledger:** `server/ledger/serve.mjs` `main()` forwards an explicit key list without this one, so even a line in `/etc/goldrush-ledger.env` could not reach a door; tests hand it over through `createLedgerServer({ env })`.
- **No deploy path reads `.dev.vars`:** its loader's only callers are local dev bindings and `wrangler types` (`cli.js:184676-:184694`, `:207260-:207266`), and the droplet mirror is a positive allowlist closed by `--filter=-s *` (`scripts/deploy.sh:371-:478`).
- **F-LC2-6, as the master asks:** creating `.dev.vars` in a checkout switches off wrangler's fallback of loading `.env` and `.env.local` into that checkout's local functions (`cli.js:184417-:184418`, `:184493-:184503`; the fallback defaults on, `:39497-:39499`). In the primary checkout, which keeps its credentials in `.env.local`, that ends those values reaching local wrangler servers, and it also stops any local flow that relied on them. This run never read `.env.local`.

---

## 4. Gates (tip `b2d0c3992`; worktree with no `.dev.vars`, `.env` or `.env.local`)

| Check | Result |
| --- | --- |
| tsc | rc 0, 6 s |
| `npm run build` | rc 0, 20 s, vite 2933 modules; no tracked file changed |
| the guards that parse these files: `function-cors-allowlist`, `worker-type-coverage`, `site-security-headers`, `ratelimit-window`, `citation-title-guard`, `no-emdash-guard`, `gate-caller-audit` | 81 of 81 |
| `source-pointer-guard` / `law-pointer-guard` | PASS / PASS (34 instruments, 0 dead) |
| engine hash | `2cf26ba49f0e...` on the tip, equal to the pin (`assets/engine-era.json:4`); `functions/`, `e2e/` and the test scripts are not engine inputs (`scripts/assay-replay-agent.mjs:36-44`) |
| `test:accounts` (lock) | rc 0, 9 s, load 49.5: 43 kv, 43 sqlite, 27 sign-in hardening, 26 office credential, 86 ledger road, 16 migration checks |
| `test:mp` (lock) | rc 0, 12 s, load 45.4: 528 relay checks |
| `test:stats` (lock) | rc 0, 17 s, load 45.8: stats worker 87, standings assay 617 (kv) and 617 (sqlite), ledger worker 26 |
| `test:node-guards`, every `&&` leg run on its own (lock, `battery-legs.mjs`) | combined rc 1, 1244 s. Leg 1: 1032 tests, 1022 pass, **5 fail**, 5 skipped; legs 2 to 5, 7 and 8 rc 0 (ticker stats, findings-state, blocker-panel, ruling-propagation, nul-audit CLEAN, review-fixes 86 of 86); leg 6 `test:desk-declaration` rc 2. Every red is attributed in 4.1: identical on the cut, none reads a changed file. |
| e2e, 18 specs, both projects, `--workers=1`, vite on 5351 after a warm boot (lock) | rc 1, 754 s, load 9.4: **132 passed, 21 failed**, 12 skipped, 9 did not run. All 21 reds reproduce on the cut (4.2). The slice's own specs: `tl-02` 8 of 8 passed, `mp-06-party-overview` 4 of 4, `mp-arsenal` 2 of 2, `agent-seat` and `mp-reconnect` 1 of 1 each (their mobile arms skip by the specs' own `test.skip`), `mp-02-lockstep` 15 passed, 10 skipped by its own `test.skip`, 1 failed (`:687`, red on the cut identically); `assay-season-roll` 4 and `second-rider` 2 red on the cut identically. The adjacent door specs passed every test they started: `terrain3d-default` 6, `live-seed-rotation` 20, `bug-office-api` 8, `ratelimit-429-net` 6. The 12 skips are exactly those mobile arms (1, 1, 10). |
| the dev-vars probe (lock) | rc 0, 3 s: section 3 |
| control on the cut (lock, `control-run.sh`, `control-run-2.sh`) | a detached worktree of `39f88d36f` in the scratchpad, wired like this one (node_modules linked, art links resolving, no env files), removed afterwards: section 4 |

The lock was held from 04:25:07Z to 04:59:33Z (`gates/summary.txt`); every server the batch started it stopped by pid (vite 51939; the dev-vars probe's two wrangler pids are in its output). The two control batches held it 05:00:39Z to 05:09:54Z and 05:11:31Z to 05:15:41Z (vites 76812, 60170, 19764, each stopped by number). The e2e specs rewrote 35 tracked evidence files of their own (`artifacts/live-seed-rotation-1` 11, `seam-anim-mp` 6, `mp-02` 4, `party-pot-anchor` 4, `mp-03` 3, `terrain3d-default` 2, `tl-01` 2, `agent-seat` 1, `mp-04` 1, and `reviews/shots-fd1/standings-mobile-chrome.png`) and left 10 untracked screenshots: factory churn class (b), left uncommitted.

### 4.1 The battery's reds, attributed

Five leg-1 reds and leg 6, four causes, none of them this slice's (no red file, and no script one of them drives, changed on this branch):
- **`desk-declaration-guard.test.mjs` "the live board is green" and leg 6 `test:desk-declaration` (rc 2):** "REFUSING: this is a linked worktree and its STATUS.md line-1 is NOT the one main carries". Main changed `STATUS.md` in 2 commits after the cut; this branch leaves it byte-identical to the cut. On the cut's worktree the leg answers rc 2 with the same refusal (`control-desk-declaration-base.log`).
- **`ledger-backup-pull.test.mjs` (2 reds):** "GR_DROPLET_HOST missing from the environment and .env.local". A scratch worktree holds no `.env.local` by design, and this run never reads or copies it.
- **`fixture-teardown.test.mjs` (1 red):** of 162 fixture owners, 161 left 0 temp directories; the one survivor is `s2672-dest-*` from `ledger-mirror-freshness-guard.test.mjs`, a child that failed on the same missing `GR_DROPLET_HOST`.
- **`node-guards-contention.test.mjs` (1 red):** "node-guards board did not stay quiet for 300ms" during the full battery; alone it passes on both the cut and the tip (2.8 s, 2.4 s): the contention class.
- **Control:** the six red files alone, on the cut and on the tip, each in an isolated TMPDIR: **identical**, 70 tests, 54 pass, 16 fail on each side; the 17 distinct failing lines diff empty; by message, 15 of the 16 trace to the missing `GR_DROPLET_HOST` (8 name it directly, 5 through a fixture that refused on it, and 2 are the pull that therefore never ran: "the pull must write to the destination in force" and an ENOENT on the file it never wrote), and 1 is the desk-declaration refusal; the same survivor classes on both sides (`control-battery-base.log`, `control-battery-tip.log`, `control-summary.txt`).

### 4.2 The e2e reds, attributed

- **20 of 21 reproduce test for test on the cut** (`control-run.sh`: the nine failing spec files on the cut's worktree, both projects, `--workers=1`, a warmed vite on 5352): same test, same error, same source line on each side, "common same 20, common different 0". Tip 21 failed, cut 21 failed.
- **The 21st, `mp-02-lockstep:687`** (the town Ride Together card): serial mode never ran it on the cut in the first control, because the cut's `:466` failed first and the rest of the file did not run. `control-run-2.sh` ran it alone, twice on each side: **cut 2 of 2 failed, tip 2 of 2 failed**, the same `window.__GR_MP__.state().connected` 15 s timeout. `second-rider` (the same connect step): cut 1 of 1 failed, tip 1 of 1 failed, the same 20 s timeout.
- **None is a CORS refusal:** `cors_forbidden` or "Origin not allowed" appears 0 times in the tip e2e log and in the three relay-spec traces; the `second-rider` trace shows its relay calls (`/api/multiplayer/create`, `/inspect`) answered 200.

---

## 5. Firewall accounting

Every path this branch changes against `39f88d36f` (23 outside `artifacts/localhost-cors-2/`, 46 inside it, this report among them) is on the amended TOUCH-ONLY list: the eight doors and the shared helper; `.dev.vars.example` (and `.dev.vars`, gitignored, not committed); `.gitignore` (the one rule); `docs/ops/ops-evening-2026-09.md`; `scripts/test-accounts.mjs`, `test-multiplayer.mjs`, `test-stats.mjs`; the eight named e2e specs, each only where it starts the functions or asserts the localhost arm; `artifacts/localhost-cors-2/**`. `git diff --stat 39f88d36f..HEAD -- src/ server/ wrangler.toml tasks/ STATUS.md` is empty. `standings.ts` and `_multiplayer.ts` change only their CORS arm (plus the named 308 argument); the grammar, the redirect logic and kv2's limiter are untouched.

---

## 6. Findings

- **F-LC2-1, F-LC2-2, F-LC2-3, F-LC2-4, F-LC2-8, F-LC2-9: resolved in this slice** under the named lift (`030b8e540`, `82f50c0c3`, `ec717cb76`, `b2d0c3992`).
- **F-LC2-10: resolved** (`ec717cb76`).
- **F-LC2-5 (the drain puts it on the owner's desk before any deploy):** after this deploys, a game served locally (the vite dev server at `127.0.0.1:5188`) that talks to the live county (`src/app/GameApi.ts:5`) is refused by every door; the accounts door on the droplet already refuses it today. Intended by F-SEC2-2; no local variable can change a live door's answer.
- **F-LC2-6 (the owner's call, stated in section 3 and in `.dev.vars.example`):** whether `.env.local` should keep reaching local wrangler servers in the primary checkout.
- **F-LC2-7 (still open, no caller):** `playwright.accounts.config.ts:22` and `scripts/agent-seat-room.mjs` start root wrangler servers and send loopback origins without the switch; nothing reds, but whoever runs either next needs `.dev.vars` or a binding. Outside this firewall.
- **F-LC2-11 (new, fixed in passing):** the `isDev` comment's pointer `server/ledger/serve.mjs:119` had rotted onto `async function requestBody` (the env block is `main()`); rewritten to name `main()`, since the block was being corrected anyway.
- **F-LC2-12 (new, a gap worth a slice):** only one door's rule is GATED. `tl-02-public-stats.spec.ts` asserts the stats door both ways; every other harness now carries the switch, so a door that regressed to admitting localhost unconditionally would still pass `test:accounts`, `test:mp`, `test:stats` and the e2e specs. The probe catches it for all eight (M2 above) but is evidence, not a gate. Cure, outside this firewall: promote `cors-probe.mjs` into a node guard on the `test:node-guards` roster (`scripts/` and the one `package.json` line).
- **F-LC2-13 (pre-existing reds on the cut, for the drain's inventory, not this slice's to cure):** 21 e2e tests in 9 spec files red on `39f88d36f` exactly as on this tip (section 4.2). By cause, as read: standings submissions answered 400 or `stored: true` where the specs expect 200 or `stored: false` (`field-book:129`, `mp-07c-4-reckoning:53`, `lb-01-county-standings:387`, and the empty boards of `assay-season-roll:105` and `:149`); the wardrobe option now reading "Claim-Day · at the tailor's" where `cosmetic-grants:65` expects "Claim-Day Neckerchief"; gameplay flows timing out (`lb-01-county-standings:654`, `milk-county-board:446`, `tl-01-run-telemetry:229`); and the town ride never reporting `connected` (`second-rider:28`, `mp-02-lockstep:687`). On the cut, `mp-02-lockstep:466` also failed once on a hash desync at tick 570 and passed on the tip: a flake on the cut, noted, not scored.

---

## 7. Commits (path-scoped, prefix `fix:`)

| Commit | What |
| --- | --- |
| `027dc3a9f` | first pass: the probe and its BEFORE counts; the Node origin probe |
| `4e97cb1b0` | first pass: the stop report |
| `ec717cb76` | the eight doors on one helper |
| `82f50c0c3` | the local runners opt in |
| `030b8e540` | the stats preflight rows assert the rule |
| `b2d0c3992` | `.gitignore`, `.dev.vars.example`, the runbook |
| `a033e60a6` | gate evidence: the AFTER probe, the mutations, the batch scripts and logs |
| the commit carrying this version | this report |

---

## 8. REMAINING LIST IN ORDER

1. **The drain:** F-LC2-5 on the owner's desk before any deploy.
2. **F-LC2-12:** a node guard over the eight doors (the probe, promoted).
3. **F-LC2-7:** the two uncalled harnesses gain the binding when someone next runs them.
4. **F-LC2-6:** the owner's word on `.env.local` reaching local wrangler servers in the primary checkout.

READY-FOR-GATES
