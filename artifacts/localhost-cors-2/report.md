# localhost-cors-2: implementer report (STOPPED before any door changed)

**Branch** `fix/localhost-cors-2` in `/Users/robin/Claude/Projects/wt-lc2`, cut from main at `39f88d36f` (main has since moved one docs-only commit, `1d168c966`, five lines in `docs/HANDOVER-2026-09-06-attended.md`; not merged or rebased, as instructed).
**Implementer** Claude Opus 5.5 at maximum effort, attended-side scratch worktree, never Codex. **Date** 2026-09-26.
**Verdict: NOT READY-FOR-GATES. STOPPED on a false premise, with no door, test script, dotfile or doc changed.** The master's scope item 4 says the e2e batteries that exercise doors "set the variable where they need it (measure which do; the default e2e fixtures mock the API, so expect none)", and its firewall lists no e2e file. Measured: one default-gate e2e spec asserts the very behavior this task removes, six more default-gate e2e specs and one named functions gate (`test:stats`) only pass on a checkout that holds a gitignored `.dev.vars`, and none of those files is on the TOUCH-ONLY list. AGENTS.md: "if a fix lands outside the TOUCH-ONLY list, STOP and report"; the brief: "If a premise in the master is false on your branch, STOP and report exactly what you found." What this run did land is inside the firewall and useful either way: the probe the master asks for (scope 3), extended to every CORS entry point of the eight doors, with its BEFORE counts, and the measured inventory below.

---

## 0. Pre-flight (as written in the master)

| Check | Result |
| --- | --- |
| `git status --short`, modified tracked files outside the churn classes | none (only `?? node_modules`, the symlink) |
| `git log main..HEAD` | empty |
| both predecessors in `git log --oneline main` | `70cf2362f` (merge of `fix/small-fixes-1`), `2957a1b1b` (kv2 LANDED) |
| `npm run build` before touching anything | rc 0, 42 s, vite 2933 modules; no tracked file changed; host load 56 rising to 89 during the run |

---

## 1. The premise that is false: e2e and gate consumers of the localhost arm

Every consumer that could send a loopback Origin to one of the eight doors, found by reading (every e2e spec naming `wrangler`, `createLedgerServer`, `ssrLoadModule` or `functions/api`, 19 files; every `scripts/`, `ops/`, `server/`, `src/` file with a loopback Origin header or constant), then classified by reading each call site. `playwright.config.ts:39-47` removes only three specs from the default gate (release-build, release-base-path, accounts-sync), so every e2e spec below except those three is collected by the default gate.

**A. Certain red after the change, whatever the checkout holds (1 spec, 2 test instances):**
- `e2e/tl-02-public-stats.spec.ts:193-201`, test "GET /api/stats guards methods and CORS preflight": calls the real stats door in process with `env: {}` and a preflight from `http://localhost:5188` (`:197`), and asserts `204` (`:198`) and `access-control-allow-origin: http://localhost:5188` (`:199`). Scope 2 requires exactly that request to be refused ("an unconfigured setup (no variable) refuses localhost in every door"), so this assertion must change; it runs on both projects. AGENTS.md forbids touching an existing e2e assertion unless the task says so.

**B. Red in any checkout without a root `.dev.vars` (6 default-gate specs and 1 named functions gate):** each starts `wrangler pages dev public` with `cwd: ROOT` and no binding for the variable, then sends an explicit loopback Origin.
| Consumer | wrangler spawn | loopback Origin sent |
| --- | --- | --- |
| `e2e/mp-06-party-overview.spec.ts` | `:291`, cwd ROOT `:301` | `:240` (createRoom, which throws on a non-ok answer, `:244`), `:330`; the browser joins cross-origin through `?mpRelay=` `:197-:198` |
| `e2e/mp-arsenal.spec.ts` | `:320`, cwd ROOT `:330` | `:269`, `:359` |
| `e2e/agent-seat.spec.ts` | `:249`, cwd ROOT `:257` | `:272` |
| `e2e/second-rider.spec.ts` | `:197`, cwd ROOT `:207` | `:236` |
| `e2e/mp-reconnect.spec.ts` | `:234`, cwd ROOT `:244` | `:185`, `:273` |
| `e2e/mp-02-lockstep.spec.ts` | `:1426-:1445`, cwd ROOT `:1451-:1452` | `:1335`, `:1491` |
| `scripts/test-stats.mjs` (`npm run test:stats`, first leg) | `startPages` `:168-:195`, cwd ROOT `:198-:201` | `ORIGIN = 'http://localhost:5188'` `:9`, sent on every request (`:52`, `:55`, `:261`, `:271-:284`); first red would be `:40` "empty stats returns 200" |

A root `.dev.vars` rescues all seven because wrangler reads it from the repo root for these spawns (section 3). But `.dev.vars` is gitignored by design, so a fresh clone and the drain's detached chain worktree have none, and a gate that silently depends on it is the fragile shape this factory has been bitten by. The robust cure is one `--binding ALLOW_LOCALHOST_ORIGINS=1` per spawn, and every one of these files is outside the firewall.

**C. Uncertain (1 spec):** `e2e/assay-season-roll.spec.ts:87-99` forwards the browser's own `request.headers()` into the in-process standings door with `env: { TELEMETRY: kv }` (`:92-:93`). If Playwright's `headers()` carries the page's `origin` (a loopback origin), the board answers 403 after the change; if not, nothing changes. Not measured (it needs a browser run). The cure is harmless either way: the variable in that env at `:93`.

**D. Fixable inside the firewall (the two touchable scripts):**
- `scripts/test-accounts.mjs`: `waitForServer` (`:992-:1008`) accepts only a 204 to a preflight from `ORIGIN` (`:17`, localhost), so both wrangler arms and the `--serve` browser fixture (`:42-:62`) need the binding in `startWrangler` (`:867-:884`); `startLedger` builds its env explicitly (`:973`); `callDoor` sends `Origin: ORIGIN` into in-process doors whose envs never carry the variable (`:766-:772`). Unaffected: `callAccounts` (`:379-:389`) and the office checks (`:412-:442`) send no Origin.
- `scripts/test-multiplayer.mjs`: `startPages` (`:268-:307`) for both arms; the unconfigured arm runs wrangler with `--cwd <tmpdir>` (`:273`, `:295`), so no root `.dev.vars` can ever reach it; `callRoomDoor` sends `Origin: ORIGIN` in process (`:463-:469`). The relay WebSockets send no Origin (section 3), so they are unaffected.

**E. Unaffected (measured by reading, and by the Node origin probe for the fetch-based ones):**
- In-process e2e callers that build their Request with no Origin (7): `field-book.spec.ts:34-:39`, `mp-07c-4-reckoning.spec.ts:10-:16`, `milk-county-board.spec.ts:47-:53`, `lb-01-county-standings.spec.ts:60-:66`, `terrain3d-default.spec.ts:126-:131`, `tl-01-run-telemetry.spec.ts:245-:300` and `:354-:359`, `live-seed-rotation.spec.ts:247-:251`.
- e2e specs whose Node `fetch` names no Origin (3): `cosmetic-grants.spec.ts` (`:99-:135`, `:242-:262`), `bug-office-api.spec.ts` (`:102`, `:109-:113`, `:117`), `ratelimit-429-net.spec.ts` (`:122-:130`).
- `scripts/test-standings.mjs` (`directCall` `:163-:170`, `workerCall` `:2131-:2141`: no loopback Origin; its only Origin is the canonical one, `:132`) and `scripts/test-ledger-worker.mjs` (`https://county.example` through `ALLOWED_CORS_ORIGINS`, `:29`, `:47`).
- Live agent seats: `scripts/gr-sim.mjs --origin` passes a relay BASE URL (`:189`, `:428`), and the client adds no Origin header (`src/mp/LockstepClient.ts:240`, `:421-:425`; Node adds none), so production seats keep working.

**F. No gate calls them (2):** `playwright.accounts.config.ts:22` (no caller: `scripts/claimed-spec-harness-guard.mjs:201`) and `scripts/agent-seat-room.mjs` (spawn `:722-:733` with cwd ROOT, Origin `:776`, `:790`; named only in comments by `scripts/agent-seat.test.mjs:7` and `e2e/agent-seat.spec.ts:11`). Whoever runs either next needs the variable.

---

## 2. The probe (scope 3): BEFORE counts; AFTER not run because no door changed

`artifacts/localhost-cors-2/cors-probe.mjs`, in the style of `artifacts/small-fixes-1/bugs-cors-probe.mjs` (vite middleware mode, handlers called in process, no port, no server, stub strings only). It covers **every CORS entry point of the eight doors, 22 in all** (the bug office's 3, the accounts copy's 8, redeem 1, standings 4, refusals 1, telemetry 1, stats 1, multiplayer 3) under five env shapes and seven origins, plus the standings door's canonical 308 (which carries the door's CORS headers) under two more. A preflight is answered by the CORS decision before any handler logic, so nothing is written.

The target rule it encodes: a loopback origin is admitted only when `env.ALLOW_LOCALHOST_ORIGINS === '1'` (admitted = `Access-Control-Allow-Origin` equal to the origin; refused = the door's refusal status, 403, or 404 on the bug office's two read doors, or the 308 with no CORS answer, AND no allow-origin header); the site's origins (agenttown.app, www, the pages.dev project and a preview) are admitted everywhere; a stranger is refused everywhere.

**BEFORE, on the untouched tree `39f88d36f` (`cors-probe-before.txt`, rc 1, 2 s, host load 25.4): 782 rows, 134 do not match the rule.**

| Env shape | Rows | Mismatches | What the mismatches are |
| --- | --- | --- | --- |
| pages production (the one measured variable, `ASSAY_WORKER_SECRET`, plus the KV bindings) | 154 | 44 | all 22 entry points admit both loopback origins: six doors unconditionally, the bug office and the accounts copy because the sender is unbound on Pages (F-SF1-8) |
| droplet production (the env `server/ledger/serve.mjs:152-161` builds; sender bound) | 154 | 22 | the 11 entry points of the six ungated doors admit localhost; the bug office and accounts refuse |
| development (`ALLOW_LOCALHOST_ORIGINS=1`) | 154 | 0 | every door already admits localhost |
| misspelled development (`=true`) | 154 | 44 | the value is ignored today, so every door admits |
| development with the sender bound (`=1` and `RESEND_API_KEY`) | 154 | 22 | the bug office and accounts refuse localhost because they key on the mail key (8 + 3 entry points, 2 origins) |
| pages production, canonical origin bound (the 308) | 6 | 2 | the 308 carries `allow-origin: http://localhost:5188` |
| development, canonical origin bound (the 308) | 6 | 0 | |

By door (localhost admitted where the rule refuses / localhost refused where the rule admits / site or stranger rows): `_bugs.ts` 105 rows, 18 (12/6/0); `_accounts.ts` 280, 48 (32/16/0); `redeem.ts` 35, 6 (6/0/0); `standings.ts` 152, 26 (26/0/0); `refusals.ts` 35, 6 (6/0/0); `telemetry.ts` 35, 6 (6/0/0); `stats.ts` 35, 6 (6/0/0); `_multiplayer.ts` 105, 18 (18/0/0). **Site and stranger rows: 0 mismatches in every env**, so the rule's other two halves already hold and the change is confined to the localhost arm. Re-run: `node artifacts/localhost-cors-2/cors-probe.mjs --label after` (expected 0 of 782 once implemented).

---

## 3. Measured facts the continuation needs

- **Which local runner reads the variable.** `wrangler pages dev` (and `wrangler dev`) read `.dev.vars` from the directory of the config they resolve (`cli.js:184480-:184491` of the installed wrangler 4.107.0, `/opt/homebrew/Cellar/cloudflare-wrangler/4.107.0/libexec/lib/node_modules/wrangler/wrangler-dist/cli.js`). In this repo `wrangler.toml` sits at the root (`pages_build_output_dir = "dist"`, `wrangler.toml:2`), so every `wrangler pages dev public` started with cwd ROOT reads the ROOT `.dev.vars`; a runner started with `--cwd <dir>` or `--config <dir>/...` reads `<dir>/.dev.vars` instead (the multiplayer unconfigured arm, the room and registry workers). **The vite dev server reads nothing and runs no function**: its only middlewares are a deps URL rewrite (`vite.config.ts:313`) and the crafting-queue endpoints (`:329`, `:342`). **The droplet ledger never forwards the variable**: `serve.mjs:152-161` names its env keys explicitly; tests reach it through `createLedgerServer({ env })`, which merges a caller's env (`:96`).
- **`.dev.vars` displaces `.env` and `.env.local`.** With no `.dev.vars`, wrangler loads `.env` then `.env.local` from that same directory as local bindings (`cli.js:184417-:184418`, `:184493-:184503`; `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV` defaults to true, `:39497-:39499`; process env is NOT included by default, `:39501-:39503`). Creating `.dev.vars` in a checkout silently stops `.env.local` reaching its local functions (F-LC2-6).
- **No deploy path reads `.dev.vars`.** Its loader has two callers, local dev bindings (`getBindings2`, `cli.js:184676-:184694`) and `wrangler types` key names (`:207260-:207266`); the droplet mirror is a positive allowlist closed by `--filter=-s *` (`scripts/deploy.sh:371-:478`), so a root `.dev.vars` is never mirrored.
- **Gitignore convention.** Wrangler's own is `.dev.vars*` plus `!.dev.vars.example` (`cli.js:238109-:238110`). The repo's `.gitignore` has neither (`.env.local` at `:3` only), and `.gitignore` is not on the master's TOUCH-ONLY list although scope 1 and the brief ask for "the gitignored file".
- **Node sends no Origin.** Node v26.4.0's `fetch` (GET and POST) and `WebSocket` put no Origin header on the wire (`node-origin-probe.mjs` / `.txt`, one loopback server in process). A caller built on them takes every door's no-origin path.
- **The guard that parses these files.** `scripts/function-cors-allowlist.test.mjs` counts files declaring `ALLOWED_ORIGINS = new Set(` (floor 7, `:94`, `:98-:103`), so the shared helper must NOT absorb the per-door allowlists; `scripts/worker-type-coverage.test.mjs` requires every `functions/**/*.ts` in `tsc --listFiles` (`tsconfig.json` includes `functions`, so a new `functions/api/_cors.ts` is covered). `scripts/test-accounts.mjs:457-:463` requires five doors to import `./_compare` and never compare an operator secret with `===`; the new predicate compares a flag, not a secret, and matches neither pattern.

---

## 4. Findings

- **F-LC2-1 (blocking, the false premise):** `e2e/tl-02-public-stats.spec.ts:197-:199` asserts that an unconfigured env admits a localhost preflight (204 and the allow-origin header), the behavior scope 2 removes. It is a default-gate spec on both projects. Cure, outside this firewall: keep the test's development arm by giving that call `env: { ALLOW_LOCALHOST_ORIGINS: '1' }`, and add the production arm (`env: {}`: 403, no allow-origin).
- **F-LC2-2 (blocking in any checkout without `.dev.vars`):** the six multiplayer e2e specs of section 1.B spawn `wrangler pages dev` at the root with no binding and send loopback Origins. Cure, outside this firewall: `--binding ALLOW_LOCALHOST_ORIGINS=1` in each spawn (six one-line edits). The alternative, a gate harness that copies `.dev.vars.example` to `.dev.vars` before gating, puts a gitignored file under a gate: not recommended.
- **F-LC2-3 (blocking in any checkout without `.dev.vars`):** `scripts/test-stats.mjs`, the first leg of the named `test:stats` gate, sends `Origin: http://localhost:5188` on every request to a `wrangler pages dev` it starts with no binding (`:9`, `:168-:201`). Cure, outside this firewall: `--binding ALLOW_LOCALHOST_ORIGINS=1` in `startPages`, the same line `test-accounts.mjs:883` already uses for `DEV_AUTH`.
- **F-LC2-4 (uncertain):** `e2e/assay-season-roll.spec.ts:92-:93` forwards the browser's headers into the in-process standings door; red after the change only if Playwright's `request.headers()` carries the page's Origin. Cure harmless either way: the variable in that env.
- **F-LC2-5 (owner-visible, intended by F-SEC2-2, worth a line on the desk before the deploy):** the game's API origin is the constant `GAME_API_ORIGIN = 'https://agenttown.app'` (`src/app/GameApi.ts:5`) and the vite dev server serves the game at `http://127.0.0.1:5188` (`vite.config.ts:64-:65`). After this slice deploys, a game served locally that talks to the live county is refused by every door: boards, standings posts, beacons, stats, complaints, prizes, co-op. The accounts door on the droplet already refuses it today (sender bound, `_accounts.ts:405`). No local variable can change a live door's answer. Local play against a local API is possible only where the game has an override (`?mpRelay=`, `src/mp/LockstepClient.ts:923`; `VITE_ACCOUNTS_API_URL`, `src/game/AccountSync.ts:664`); the standings, telemetry, stats, complaint and prize calls have none.
- **F-LC2-6 (latent, measured in wrangler; the file's keys NOT verified, this run never reads `.env.local`):** with no `.dev.vars`, every `wrangler pages dev` started in a checkout that holds `.env.local` hands that file's variables to the local functions as bindings. In the primary checkout that file holds the live credentials (`scripts/deploy.sh:362-:367`, `AGENTS.md:19`). If it ever carries `RESEND_API_KEY`, `test-accounts.mjs`'s unconfigured arm there would take the mail path and call api.resend.com (`_accounts.ts:108-:110`, `:139`, `:748-:763`). A `.dev.vars` in that checkout ends the loading as a side effect, and also stops any local flow that relied on it.
- **F-LC2-7 (no gate caller):** `playwright.accounts.config.ts:22` and `scripts/agent-seat-room.mjs:722-:733` start root wrangler servers and send loopback Origins; nothing reds, but whoever runs either next needs `.dev.vars` or a binding.
- **F-LC2-8 (firewall wording for the continuation):** `standings.ts` decides CORS in three places, `:259`, `:561` and `:1935`, and `:1935` is inside `canonicalRedirect`, so the 308 carries the door's CORS answer (the probe's 308 rows). Passing the env there is a one-argument change to the CORS arm with the redirect's logic untouched; the master's "not the redirect" should name it as allowed, or the 308 answers localhost differently from its door (always refused, even in development).
- **F-LC2-9 (firewall wording):** `.gitignore` needs the two wrangler-convention lines for `.dev.vars` to be gitignored; the brief authorizes it, the master's TOUCH-ONLY list does not name it.
- **F-LC2-10 (stale comments the continuation rewrites):** `_accounts.ts:394-:395` and `:778` say "Both live doors bind the sender (the droplet since 2026-08-24, Pages for the accounts flow)"; F-SF1-8 measured Pages without it. `_bugs.ts:338-:349` describes the `RESEND_API_KEY` predicate and "no shared helper exists". Both blocks move with the predicate.

---

## 5. Recommended amendment and the planned design (so the attended session can veto before a line lands)

**Add to TOUCH-ONLY:** `.gitignore` (two lines); `e2e/tl-02-public-stats.spec.ts` (F-LC2-1); `scripts/test-stats.mjs` (F-LC2-3); the six multiplayer specs (F-LC2-2); `e2e/assay-season-roll.spec.ts:93` (F-LC2-4); name `standings.ts:1935` as part of the CORS arm (F-LC2-8). Optional: `playwright.accounts.config.ts`, `scripts/agent-seat-room.mjs` (F-LC2-7). Owner line: F-LC2-5.

**Design, unchanged from the master except where the measurements force it:**
1. `functions/api/_cors.ts` (new) exports `LocalhostOriginsEnv = { ALLOW_LOCALHOST_ORIGINS?: string }` and `localhostOriginAllowed(origin, env)`, which is `env?.ALLOW_LOCALHOST_ORIGINS === '1' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)`: the variable and nothing else, and the pattern in one place. Every door keeps its own `ALLOWED_ORIGINS = new Set(...)` (the allowlist guard's floor).
2. The eight doors: each `corsHeaders` takes the env and its localhost arm becomes `localhostOriginAllowed(origin, env)`. Call sites that change only their argument: `redeem.ts:38`, `stats.ts:55`, `telemetry.ts:95`, `refusals.ts:69`, `standings.ts:259`, `:561`, `:1935`, `_multiplayer.ts:135`, `:154`, `:629` (the bug office and accounts already pass the env). `RESEND_API_KEY` leaves `BugsEnv` (its only reader is the CORS arm, `_bugs.ts:27-:28`, `:359`); in `_accounts.ts` only `devOrigins` goes, while `isDev` and the sender check stay (SEC-10, not the CORS path).
3. `.dev.vars.example` (tracked) with `ALLOW_LOCALHOST_ORIGINS=1` and a comment; `.dev.vars` (gitignored) created in the worktree; `docs/ops/ops-evening-2026-09.md` gains the rule: the variable is the development switch, never set on Pages and never in `/etc/goldrush-ledger.env` (which could not deliver it anyway, `serve.mjs:152-161`).
4. `test-accounts.mjs` and `test-multiplayer.mjs` as in section 1.D; the out-of-firewall consumers as in the amendment, each with an explicit binding rather than a dependence on `.dev.vars`.
5. Gates: tsc, build, the probe (0 of 782 expected), `function-cors-allowlist`, `worker-type-coverage`, `site-security-headers`, `ratelimit-window`; under the drain lock the three functions gates and the node-guards battery, plus the affected e2e specs of section 1 on both projects, with a control run on this tree for any red.

---

## 6. Commits (path-scoped, prefix `fix:`)

| Commit | Paths |
| --- | --- |
| `027dc3a9f`, evidence: the probes and their output | `artifacts/localhost-cors-2/cors-probe.mjs`, `cors-probe-before.txt`, `node-origin-probe.mjs`, `node-origin-probe.txt` |
| the commit carrying this version, the report | `artifacts/localhost-cors-2/report.md` |

Nothing else is changed on the branch: no door, no test script, no dotfile, no doc. No network call left the machine; nothing was deployed or bound; `.env.local` was never read.

---

## 7. REMAINING LIST IN ORDER

1. **Attended decision:** amend the master's firewall as in section 5 (or re-slice: the doors and the two touchable scripts in one slice, the e2e and `test-stats.mjs` consumers in the same drain), then continue this implementer; it holds the full measurement context.
2. **The owner line (F-LC2-5):** after the deploy, a locally served game is refused by every live door; intended, but it changes local play against the live county.
3. **The implementation** (section 5, items 1 to 4) and the AFTER probe run (expected 0 of 782).
4. **Gates** (section 5, item 5), with F-LC2-4 settled by the e2e run itself.
5. **F-LC2-6** at the owner's convenience: whether `.env.local` should keep reaching local wrangler servers in the primary checkout.

NOT READY-FOR-GATES (stopped on the false premise; see section 1).
