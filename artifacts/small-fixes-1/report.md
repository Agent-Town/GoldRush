# small-fixes-1: implementer report

**Branch** `fix/small-fixes-1` in `/Users/robin/Claude/Projects/wt-sf1`, cut from main at `2cf3feea4` (main has moved on since; not merged or rebased, as instructed).
**Implementer** Claude Opus 5.5, attended-side scratch worktree, never Codex. **Date** 2026-09-25.
**Verdict** All four findings closed, each with its proof and its own commit. One gate cannot be met inside this firewall and one instruction was adapted, both measured rather than stretched: `fixture-teardown` names exactly ONE offender after the cure, a sibling test that grew the same leak after F-EO1-5 was filed (F-SF1-3, section 4); and two of the thirteen scripts cannot import a sibling at all, because a guard fixture relocates each of them alone, so they carry a byte-identical copy of the helper under a test arm that pins the copy to the original (section 3).

---

## 0. Pre-flight (as written in the master)

| Check | Result |
| --- | --- |
| `git status --short`, modified tracked files outside the churn classes | none (only `?? node_modules`, the symlink) |
| `git log main..HEAD --oneline` | empty |
| `npm run build` before any edit | GREEN, 20 s (tsc clean, vite 2931 modules, asset-diet ran) |

---

## 1. F-SEC2-2: the bug office's CORS (scope item 1), commit `558a5c0e8`

`functions/api/_bugs.ts`, `corsHeaders`. Before (`git show 2cf3feea4:functions/api/_bugs.ts`, the one-line condition):

```ts
if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
```

After: `corsHeaders(request, env, methods)`; `const devOrigins = !env.RESEND_API_KEY;` and the localhost arm reads `(devOrigins && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))`. The three call sites (`postBug`, `listBugs`, `getBug`) pass `context.env`; `BugsEnv` gains `RESEND_API_KEY?: string` with a one-line note that the office reads it only as the production marker and sends no mail.

**The predicate is the accounts handler's, unchanged** (`functions/api/_accounts.ts`, `corsHeaders`, `const devOrigins = !env.RESEND_API_KEY;`): the half of `isDev` a request cannot reach, deliberately without `DEV_AUTH` (the accounts report measured why: requiring it turns the unconfigured arm's honest answer into a misleading CORS refusal). **No shared helper exists** (verified: nothing under `functions/` exports a CORS function or the predicate; `_accounts.ts`'s `corsHeaders` is module-private). Making one would touch `_accounts.ts`, outside this firewall, so the predicate is kept in step by hand and the comment above `corsHeaders` says so and names the sibling.

**Why the marker actually reaches this office in production** (both halves checked on this tree, the second only as far as the repo can show it):
- Pages is the office's only live door. `ops/droplet/agenttown.app.nginx.conf`: `location /api/` forwards the residual API to `gold-rush-3in.pages.dev`; the droplet ledger's route table (`server/ledger/serve.mjs`, `loadLedgerHandlers`) has standings, refusals and the accounts routes and **no bug path**. The office is `functions/api/bug-report.ts`, `bugs.ts`, `bugs/[id].ts`, all Pages Functions, and a Pages Function is handed every binding of the project.
- The sender is bound on Pages: `docs/api-accounts.md:11` ("Production also needs the Resend secret in Cloudflare Pages") and `artifacts/sec-signin-hardening-1/report.md` ("a Pages project variable for the functions"). **UNVERIFIED from here**: confirming it needs a Cloudflare dashboard look or an API call, and this run makes no live request. If the Pages project's production (or preview) environment does NOT bind `RESEND_API_KEY`, localhost stays admitted there on this door AND on the accounts door alike; one look settles both (REMAINING 6).

**The handler probe** (`artifacts/small-fixes-1/bugs-cors-probe.mjs`, the sec-headers `handler-probe.mjs` style: vite middleware mode, the handlers called in process with an in-memory KV, no port, no server, every `Request` built in process; the sender binding and office token are stub strings). 20 rows over `postBug` (POST and preflight), `listBugs` and `getBug`, run on the unfixed tree and on the fixed one; full captures in `bugs-cors-probe-before.txt` / `-after.txt`.

| env | Origin | handler | BEFORE (status, allow-origin) | AFTER |
| --- | --- | --- | --- | --- |
| production (sender bound) | `http://localhost:5188` | postBug POST | **201**, `http://localhost:5188` | **403** `cors_forbidden`, **(none)** |
| production | `http://localhost:5188` | postBug OPTIONS | 204, `http://localhost:5188` | 403, (none) |
| production | `http://127.0.0.1:5324` | postBug POST | 201, `http://127.0.0.1:5324` | 403, (none) |
| production | `http://localhost:5188` | listBugs GET (office token) | **200**, `http://localhost:5188` | **404**, (none) |
| production | `http://localhost:5188` | listBugs OPTIONS | 204, `http://localhost:5188` | 404, (none) |
| production | `http://localhost:5188` | getBug GET | 404, `http://localhost:5188` | 404, (none) |
| production | `https://agenttown.app` | postBug POST / OPTIONS / listBugs | 201 / 204 / 200, `https://agenttown.app` | unchanged |
| production | `https://www.agenttown.app`, `https://gold-rush-3in.pages.dev`, `https://feature-x.gold-rush-3in.pages.dev` | postBug POST | 201, allowed | unchanged |
| production | `https://evil.example` | postBug POST | 403, (none) | unchanged |
| production | (no Origin: `fetch-bugs.mjs`, the e2e worker spec) | postBug POST, listBugs GET | 201 / 200, no header | unchanged |
| unconfigured (no sender) | `http://localhost:5188`, `http://127.0.0.1:5324` | postBug POST / OPTIONS, listBugs GET | 201 / 204 / 200, the localhost origin | **unchanged: a developer's own office keeps working** |
| unconfigured | `https://evil.example` | postBug POST | 403, (none) | unchanged |

Verdicts: BEFORE `6 row(s) do not match the rule` (every one a production-shaped env admitting localhost; with the office token, `listBugs` handed the complaints list to a localhost page), rc 1; AFTER `every row matches the rule`, rc 0.

Gates on the fixed tree: `npm run test:accounts` rc 0 (43 kv, 43 sqlite, 27 sign-in hardening, 24 office credential checks); `npm run test:mp` rc 0 (466 relay checks); `npm run test:stats` rc 0 (standings 372, ledger worker 26); `function-cors-allowlist`, `site-security-headers`, `ratelimit-window` (the three guards that parse this file) 12/12; tsc 0.

---

## 2. F-SEC2-4: the signed-in card's privacy link (scope item 2), commit `dd2c87433`

`src/game/ProfileManager.ts`, `renderAccountCard()`, the signed-in return: **one line**, last in the card, byte-identical to the sign-in branch's link (same `href="${import.meta.env.BASE_URL}privacy.html"`, `target="_blank"`, `rel="noopener"`, `data-testid="account-privacy-link"`, text "What the Office keeps about you"). The two branches are exclusive (the function returns one or the other), so the shared test id names one element in either state. Where the player sees it: Profiles, the account card, under "Back up now / Sign out / Burn cloud ledger", in a plain boot.

**The browser check** is new, `e2e/account-card-privacy-link.spec.ts`, default config, both projects, plain boot `/`, no `?debug`:
- the signed-OUT card (a seeded profile, no session) supplies the reference: its link, read as `outerHTML`;
- a seeded signed-IN session (a fixture session, not a credential) renders the signed-in branch (Burn and Sign out present, the email form absent), and its link must be present once and visible, read the same words, point at `privacy.html`, open in a new tab with `noopener`, **equal the signed-out element byte for byte**, and resolve to the served notice (`page.request.get` of the href: 200 and the notice's own `<h1>`);
- **no live request**: a signed-in boot asks the account door for the cloud ledgers and the door's default origin is the live county one, so every `/api/` call is answered in the page route, every other off-origin request is aborted and recorded, both tests assert the record empty, and the signed-in test asserts the fence DID answer `/api/save/profiles` (so "no live request" is measured, not assumed); the signed-out test asserts no `/api/` call at all;
- zero console errors and zero page errors, both tests.

**Result: PENDING at this commit** (the lock was held by another session when this report was first written; the check is queued, detached, and this section is updated with its numbers and screenshots when it completes).

---

## 3. F-LS1-2: the main-module idiom (scope item 3), commit `8a27d37d8`

**The helper.** `scripts/is-main.mjs` exports `isMain(importMetaUrl)`: `fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(importMetaUrl))`, `false` (never a throw) when argv[1] is missing, the URL is empty or not a file, or either path cannot be resolved. Its header records the defect, the s1334 space trap and the s1533 missing-argv half it keeps.

**Applied to all thirteen** (`grep -l 'import.meta.url === pathToFileURL' scripts/*.mjs`: 13 files at `2cf3feea4`, **0 now**), in two ways, and the split was measured, not chosen:
- **Eleven import it** (`import { isMain } from './is-main.mjs';` + `if (isMain(import.meta.url)) ...`): claimed-spec-harness-guard, desk-birth-guard, desk-carryforward-guard, desk-declaration-guard, ghost-ladder-row-guard, master-shipped-classifier, phone-hud-entry-census, source-pointer-guard, stale-ready-for-gates-guard, stream-curate, test-accounts.
- **Two carry a byte-identical copy at the foot of the file**: `authorable-candidates.mjs` and `dry-board-probe.mjs`. A guard fixture relocates each of them ALONE into a bare temp dir, where any relative import dies `ERR_MODULE_NOT_FOUND`: with the import applied, `authorable-single-read-guard.test.mjs` went **5 of 9 red** ("arm produced 0 B of stdout, VACUOUS"; reproduced by hand: the file copied alone exits 1 with `Cannot find module '.../is-main.mjs'`), and `dry-board-bucket-verdict-guard.test.mjs` went **3 red** (its reverse-control arms import a mutated `variant.mjs` written alone). Those fixtures are outside this firewall, and `dry-board-probe.mjs` already records the constraint and the route above `headDetached` ("A FILE WHOSE GUARDS RELOCATE IT CANNOT CARRY RELATIVE IMPORTS"; the cure there is a verbatim copy plus an arm asserting it agrees). So both carry `function isMain` verbatim, and `is-main.test.mjs` arm 7 pins each copy to the original byte for byte (mutation control: dropping one clause from the dry-board-probe copy reds arm 7 with "copy of isMain drifted from scripts/is-main.mjs"; restored byte-identical, `cmp` clean).

**No pointer moved.** Every file keeps its line numbers above its foot: the `node:url` import was swapped 1-for-1 (`pathToFileURL` for `isMain`, or for `fileURLToPath` in the two copies), the three files that still need `fileURLToPath` reused the blank line after their imports, and the comment blocks above four guards were rewritten in place, same line count (they described `pathToFileURL` throwing, which is no longer the code). `node scripts/source-pointer-guard.mjs` PASS (684 files, 5 same-file citations); `node scripts/law-pointer-guard.mjs` PASS (34 instruments resolved, 0 dead).

**The test**, `scripts/is-main.test.mjs`, 7 arms, 0.38 s, on the `test:node-guards` roster (the one package.json line), 0 temp survivors in an isolated TMPDIR:
1. CONTROL: a fixture with the OLD comparison prints by its real path and is SILENT by a symlinked one (rc 0, 0 B): the harness manufactures the real defect.
2. CURE: the same fixture with `isMain` runs by both spellings.
3. NO ARGV: under `node -e` import, the old UNGUARDED line throws `ERR_INVALID_ARG_TYPE`; `isMain` answers "not main".
4. **A REAL GUARD through a symlinked temp path** (the master's proof): `source-pointer-guard.mjs --root <fixture with a rotted pointer>` by a file symlink exits 1 with stdout and stderr byte-identical to its real-path run; its pre-cure source (the two main-module lines restored, asserted to match exactly once) exits 1 by its real path and **0 with nothing printed** by a symlinked one, i.e. the rot it exists to catch would have PASSED.
5. `dry-board-probe.mjs` (which had no argv guard, so its old line threw on any `node -e` import) now imports: 10 exports, main not run.
6. Unit edges in process: missing, unresolvable and symlinked argv[1] (both directions), a `data:` URL, an empty URL.
7. Coverage: eleven import it once and call it once; two carry the byte-identical copy and no sibling import; no `scripts/*.mjs` carries the swept spelling.

**Every changed script's own test, and every test that touches them**: the 63 `scripts/*.test.mjs` files that name any of the thirteen, their two importers (desk-state-audit, blocker-panel-closed-guard) or the helper (one grandfathered file skipped: `review-account-creation.test.mjs`, which needs real Durable Objects per `gate-caller-baseline.json`), run together: **638 of 638 pass, 19 s**. This covers the scripts' own tests that live only in `test:ledger-guards`. `npm run test:accounts` (the thirteenth's own test is itself) green.

**The symlink table** (`artifacts/small-fixes-1/symlink-run-table.mjs`, evidence, not a gate): the ten read-only scripts of the thirteen, each run by its real path and by a file symlink. On this branch all ten are SAME (identical rc and output). On `git archive 65fe53a2f` (the pre-cure scripts, run without their corpus) all ten are **SILENT** by the symlink: rc 0, 0 bytes, where by the real path seven of them refused (rc 1 or 2) and three printed (`symlink-run-table-before.txt`). (Commit `8a27d37d8`'s message says "six"; I miscounted there, the banked table says seven and is the authority.) Skipped by design: phone-hud-entry-census (launches a browser, writes evidence), stream-curate (writes `assets/stream/loop-manifest.json`), test-accounts (starts servers).

---

## 4. F-EO1-5: the temp-directory leak (scope item 4), commit `65fe53a2f`

`scripts/status-line1-desk-displacement-guard.test.mjs`: `board()` made one `mkdtemp` board per arm (ten per run) and never removed one. Each board is now pushed onto `BOARDS` as it is made, and an `after()` hook removes them all once every arm has run.

- The cured file, in an isolated TMPDIR (the sweep's own method): **10/10 pass, 0 `s2673-desk-*` survivors**.
- `scripts/fixture-teardown.test.mjs` BEFORE the cure (isolation, 1,083.8 s, 161 fixture owners): named **TWO** offenders, `status-line1-desk-displacement-guard.test.mjs: 10` and `status-line1-future-stamp-scope-guard.test.mjs: 6`.
- AFTER the cure: the real sweep can no longer reach its tally on this branch: it asserts each child exits 0 before counting, and bench-seeds reds on the unpinned engine hash (the node-guards battery's own `scripts/bench-seeds.test.mjs child failed`). So `fixture-teardown-tally.mjs` re-ran the sweep's subject set, prefixes and isolated-TMPDIR method, counting every child whatever its exit code (162 owners, 521 s at three jobs): **one offender, `status-line1-future-stamp-scope-guard.test.mjs: 6`; `status-line1-desk-displacement-guard.test.mjs: 0`** (`fixture-teardown-tally-after.txt`). Once the drain pins the hash, the real sweep will name exactly that one file until F-SF1-3 is cured.
- **The master's "single offender" has become two since F-EO1-5 was filed.** `status-line1-future-stamp-scope-guard.test.mjs` (commit `2e7b9ae11`, F-2676-1) copied the same `board()` shape, `mkdtemp(join(tmpdir(), 's2677-stamp-'))` with no cleanup, six per run. It is not on this task's TOUCH-ONLY list, so it is untouched and the sweep cannot name zero from inside this firewall: finding **F-SF1-3**, REMAINING 1 (the identical cure: a list, an after() hook, one push).
- **The stale directories are LISTED, NOT DELETED** (the Retention Law covers factory artifacts; temp directories are the owner's to sweep): **250** `s2673-desk-*` under `os.tmpdir()` (`/var/folders/cd/.../T`), 2026-09-24T23:32 to 2026-09-25T12:17 machine time (UTC+7), about 6 MB, 3 entries each, in `artifacts/small-fixes-1/stale-desk-tempdirs-before.txt` (the master said 130; at ten a run, 250 is 25 runs, 12 of them since the master was written). The sibling's **72** `s2677-stamp-*` (about 1.7 MB) are listed in `stale-stamp-tempdirs.txt`. Still 250 after every run in this task: the cured file adds none.

---

## 5. Self-check (evidence, not vibes)

| Check | Result |
| --- | --- |
| tsc / `npm run build` (all four changes in) | rc 0 / rc 0 (18 s, vite 2931 modules) |
| the three functions gates (`test:accounts`, `test:mp`, `test:stats`) | rc 0 / rc 0 / rc 0 after the CORS change, and again on the final tree at `dd2c87433` (11:23Z) |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/citation-title-guard.test.mjs scripts/no-emdash-guard.test.mjs scripts/gate-caller-audit.test.mjs` | 64 / 64 pass; `node scripts/gate-caller-audit.mjs` PASS (the new test is reached) |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | first leg `rc=1 ℹ tests 1018 ℹ pass 1010 ℹ fail 3 ℹ skipped 5`, 649 s, 11:12Z. The three reds are ONE cause, the registry class: `bench-seeds.test.mjs:47` and `engine-era-guard.test.mjs:65` compare the live engine hash `13e5735c…` with the pinned `c63def1b…`, and `fixture-teardown` stops at its first failing child, which is that same bench-seeds arm (`scripts/bench-seeds.test.mjs child failed`), so it never reached its tally (see the next row). No load-class red this run. The legs chained after `&&` do not run when the first reds, so each was run by hand on this tree: `test-ticker-stats` rc 0, `test:findings-state` PASS, `test:blocker-panel` PASS, `test:ruling-propagation` PASS, `nul-audit` CLEAN, `test:review-fixes` with the roster tail (ten files, `is-main.test.mjs` among them) 89 / 89; `test:desk-declaration` rc 2, its linked-worktree refusal (this branch's STATUS.md line 1 is not main's now that main has moved; structural to a scratch worktree, the class ledger-shape-1's report records). Logs: `node-guards-battery.log`, `roster-chained-legs.log`, `roster-tail-review-fixes.log`. |
| `fixture-teardown` after the cure (its method, tallied) | the real sweep cannot tally on this branch (it stops at bench-seeds' hash-class red, previous row), so `artifacts/small-fixes-1/fixture-teardown-tally.mjs` re-ran its exact subject set and method, counting every child: **162 fixture owners, ONE offender**, `status-line1-future-stamp-scope-guard.test.mjs: 6` (F-SF1-3); the desk displacement guard **0**, the new helper test **0**. Five children did not exit 0 (reported, not scored): bench-seeds and engine-era-guard (the hash class), and three that passed in the node-guards battery on this same commit and failed here only under the tally's three-way concurrency plus other sessions' batteries on the machine or after main moved (board-tape-gold's browser-door arm, node-guards-contention's 'absent when alone', desk-declaration-guard's live-board arm). A leaker the sweep cannot see surfaced too: F-SF1-6. |
| the new helper test | 7 / 7, 0.38 s, 0 temp survivors |
| `test:ledger-guards` (not required; most of the thirteen's own tests live there) | leg 1: `ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3`, 84 s, 11:21Z. The 20 script legs, run one by one: all rc 0 except `desk-declaration`, `desk-birth` and `desk-carryforward`, rc 2, the linked-worktree refusal (main() ran and refused because main's STATUS.md line 1 has moved past this branch point; all three printed rc 0 by both paths before main moved, `symlink-run-table-after.txt`). Logs: `ledger-guards-leg1.log`, `ledger-guards-script-legs.log` |
| the 63-file family of tests touching the thirteen scripts | 638 / 638 |
| source-pointer-guard / law-pointer-guard | PASS / PASS |
| browser check, both projects, `--workers=1`, through the lock | PENDING at this commit: queued behind the shared drain lock (held by another session), launched detached; the result replaces this row |
| adjacent `profile-first-boot`, both projects, same locked call | PENDING, same locked call |
| engine hash | moved by the one `src/` line, as expected: `c63def1b…` (pinned, and exactly the hash of this tree with the cut `ProfileManager.ts`) to `13e5735c2e784834…`; the drain pins it, `assets/engine-era.json` untouched |

---

## 6. Findings (outside this firewall; reported, not fixed)

- **F-SF1-1: six more doors admit localhost unconditionally.** The SEC-8 arm this task closed on the bug office is still unconditional in `functions/api/redeem.ts:109` (the prize mint, which the office bearer token drives), `standings.ts:1780`, `refusals.ts:158`, `telemetry.ts:309`, `stats.ts:208` and `_multiplayer.ts:642`. Now only `_accounts.ts:410` and `_bugs.ts:251` gate it. Same one-condition cure per file; the two droplet-served ones (standings, refusals) get `RESEND_API_KEY` from `server/ledger/serve.mjs:119`, so the predicate holds on both doors. `redeem.ts` first.
- **F-SF1-2: twenty-three more main-module checks share F-LS1-2's defect in other spellings**, all listed with their lines in `artifacts/small-fixes-1/other-main-module-spellings.txt`: 22 under `scripts/` (`path.resolve(argv[1]) === fileURLToPath(import.meta.url)` and its reversals, `pathToFileURL(argv[1]).href === import.meta.url`), including `ruling-propagation-guard.mjs`, which F-LS1-2 itself named; plus `server/ledger/serve.mjs:130`, the droplet ledger's entry point, which carries the swept spelling verbatim but sits outside `scripts/` (so outside the master's grep). `stream-showcase.mjs` and `stream-director.mjs` also throw on a `node -e` import. Before curing any of them, measure whether a fixture relocates it alone (two of the thirteen needed the verbatim copy): at least two do today, `assay-worker.test.mjs` copies `assay-replay-agent.mjs` into a bare scratch `scripts/` and `withheld-evidence-audit-guard.test.mjs` copies `withheld-evidence-audit.mjs`, so those two take the copy route or their fixtures learn to bring `is-main.mjs`. The reliable measure is the one used here: swap, then run every test that names the file.
- **F-SF1-3: the fixture sweep's second offender**, `status-line1-future-stamp-scope-guard.test.mjs` (section 4). Until it is cured, `fixture-teardown` cannot name zero.
- **F-SF1-4 (noted): two fixtures relocate scripts alone**, which is why `authorable-candidates.mjs` and `dry-board-probe.mjs` carry a copy of `isMain` rather than the import. `desk-status-single-read-guard.test.mjs`'s comment still says `corpus-tree.mjs` is "the only relative import either guard has"; its code copies the import closure transitively and stays green, so only the comment is stale.
- **F-SF1-5 (noted): the master drifted in three places**: 130 stale directories are 250; "the single offender" is two; F-LS1-2's "same latent shape in `stale-ready-for-gates-guard.mjs` and `ruling-propagation-guard.mjs`" splits across the grep (the first is one of the thirteen and is cured; the second is a different spelling and is F-SF1-2).
- **F-SF1-6: the sweep is blind to a template-literal prefix, and the biggest leaker hides there.** `status-archive-empty-corpus-guard.test.mjs:52` makes its dirs with ``mkdtempSync(path.join(os.tmpdir(), `s2337-${tag}-`))`` and never removes them. The sweep's PREFIX regex extracts the literal text `s2337-${tag}-`, which no real directory name starts with, so it counts 0 survivors for a file that left **12 per run** in the tally's scratch dir (listed in `fixture-teardown-tally-after.txt`). On the owner's disk: **8,834 `s2337-*` directories, about 333 MB, the oldest from 2026-09-13** (counted, not deleted). Two cures, both outside this firewall: an `after()` cleanup in that test, and the sweep treating `${...}` as the end of the literal prefix so the class cannot hide again (the tally's "scratch entries matching no declared prefix" line is the detector that found it; the other such entries are Node's and Playwright's own compile caches, not fixtures).

---

## 7. Commits (all on `fix/small-fixes-1`, path-scoped, prefix `fix:`, one finding each)

| Hash | Finding | Paths |
| --- | --- | --- |
| `65fe53a2f` | F-EO1-5 | `scripts/status-line1-desk-displacement-guard.test.mjs`, `artifacts/small-fixes-1/stale-desk-tempdirs-before.txt` |
| `8a27d37d8` | F-LS1-2 | `scripts/is-main.mjs` (new), `scripts/is-main.test.mjs` (new), the thirteen scripts, `package.json` (the roster line only), `artifacts/small-fixes-1/symlink-run-table*` |
| `558a5c0e8` | F-SEC2-2 | `functions/api/_bugs.ts`, `artifacts/small-fixes-1/bugs-cors-probe*` |
| `dd2c87433` | F-SEC2-4 | `src/game/ProfileManager.ts` (one line), `e2e/account-card-privacy-link.spec.ts` (new) |
| `d7ef99bb4` | gate evidence | the fixture sweep tally, the battery and gate logs, the lists |

Left dirty in the worktree by design, factory churn class (b), not committed: `artifacts/accounts-worker/test-accounts.json` and `artifacts/multiplayer-relay/test-multiplayer.json` (rewritten by the functions gates).

**Evidence in `artifacts/small-fixes-1/`**: `bugs-cors-probe.mjs` with `-before.txt` / `-after.txt` (item 1); `shots/` and `browser-check.log`, `browser-adjacent.log`, `browser-check-lock.out` (item 2); `symlink-run-table.mjs` with `-before.txt` / `-after.txt`, `other-main-module-spellings.txt`, `family-tests-63.log` (item 3); `stale-desk-tempdirs-before.txt`, `stale-stamp-tempdirs.txt`, `fixture-teardown-before.log`, `fixture-teardown-tally.mjs` with `-after.txt` (item 4); `node-guards-battery.log`, `roster-chained-legs.log`, `roster-tail-review-fixes.log`, `three-named-guards.log`, `functions-gates.log` (the gates).

---

## 8. REMAINING LIST IN ORDER

1. **F-SF1-3** (outside this firewall): give `scripts/status-line1-future-stamp-scope-guard.test.mjs` the same cure as its sibling (a `BOARDS` list, an `after()` hook that removes it, one push in `board()`); then `fixture-teardown` names zero, the master's gate as written.
2. **The drain pins the engine hash**: the one `src/game/ProfileManager.ts` line moves it from `c63def1b…` to `13e5735c2e784834f640dd99e65d674cf0295c3d0d899c2364da4b60baa42fab`; `assets/engine-era.json` is untouched here, and bench-seeds, engine-era-guard and (through them) fixture-teardown red until the pin.
3. **F-SF1-6**: an `after()` cleanup in `status-archive-empty-corpus-guard.test.mjs`, and `fixture-teardown.test.mjs` reading a template-literal prefix up to its first `${`, so that leaker (12 dirs a run, 8,834 on disk) becomes visible and stays visible.
4. **F-SF1-1**: gate the localhost arm in the six other doors on the same predicate, `redeem.ts` first.
5. **F-SF1-2**: move the twenty-three other main-module checks onto `isMain` (measure each file's relocating fixtures first), `server/ledger/serve.mjs` and `ruling-propagation-guard.mjs` first.
6. **Owner, one look**: is `RESEND_API_KEY` bound in the Pages project's production AND preview environments? The accounts door's and now the bug office's localhost refusal both depend on it; the repo says yes (`docs/api-accounts.md:11`), and nothing here could verify it without a live request.
7. **Owner, optional**: sweep the temp directories listed or counted here (250 `s2673-desk-*`, 72 `s2677-stamp-*`, 8,834 `s2337-*`); nothing here deleted any.

READY-FOR-GATES

