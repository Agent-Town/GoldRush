# sec-headers-and-data-hygiene-1 — implementer report

**Branch** `fix/sec-headers-and-data-hygiene-1` in `/Users/robin/Claude/Projects/wt-sec2`, cut from main at `1073245ae`.
**Implementer** Claude Opus 5 (attended-side scratch worktree, never Codex). **Date** 2026-09-24/25.
**Verdict** All six scope items done. Two of them were already half-landed on main and are recorded as such rather than re-done. One deliverable (enrolling the new gate in a battery) is REPORTED rather than done, because `package.json` is outside this task's firewall; it is REMAINING item 1 and it is one line.

---

## 0. Pre-flight (as written in the master)

| Check | Result |
| --- | --- |
| `git status --short`, modified tracked files outside the churn classes | none (only `?? node_modules` symlink) |
| `git log main..HEAD --oneline` | empty |
| `npm run build` before any edit | GREEN (tsc clean, vite 2930 modules, asset-diet 434 GLBs / 55 PNGs) |

---

## 1. Headers (scope item 1)

`public/_headers`, the `/*` rule, verbatim as served:

```
  Cache-Control: no-cache
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=2592000
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://agenttown.app wss://agenttown.app; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
```

Measured, not assumed: `GET http://127.0.0.1:5314/` against a server that applies this very file returned all five (full capture in `served-headers.txt`).

**HSTS is deliberately modest**: 30 days, no `includeSubDomains`, no `preload`. A first rollout should be reversible inside a month, and `includeSubDomains` would speak for every `agenttown.app` subdomain including any I have not been told about. Raise it once the owner is happy with a month of it.

**The CSP stays REPORT-ONLY.** Item 1 is explicit that the enforcing flip is the owner's decision after a week of production reports. The new node test asserts there is no enforcing `Content-Security-Policy:` header in the file, so a quiet flip reds a gate.

**There is no `report-uri` / `report-to`, deliberately.** A collector is a new endpoint and a new decision about where player data goes, i.e. an owner decision and outside this firewall. Today the reports are visible in the console of whoever is looking. Consequence the owner should know: "a week of report-only in production" means a week of *someone opening the console*, not a week of collected data.

### Every directive, and the evidence it is needed

| Directive | Why, with the thing in the tree that needs it |
| --- | --- |
| `default-src 'self'` | Every chunk, texture, GLB, atlas and `.mp3` is same-origin under `/assets/` (`dist/index.html` loads `./assets/index-*.js` plus one stylesheet and nothing else). It also covers `font-src`, `media-src`, `frame-src` and `manifest-src`, which is why none of those are spelled out: the tree has no `@font-face` (grep: 0 hits), no `<audio>`/`<video>` element (sounds are fetched and decoded through AudioContext, `src/audio/SoundSystem.ts:506`), no iframe and no web manifest. |
| `script-src 'self'` | `dist/index.html` carries no inline `<script>`; the entry is an external module (verified in the built file). |
| `script-src 'wasm-unsafe-eval'` | `src/assets/AssetLoading.ts:10` wires `MeshoptDecoder` into every `GLTFLoader`, and `node_modules/meshoptimizer/meshopt_decoder.mjs` calls `WebAssembly.instantiate` (2 sites) / `WebAssembly.validate`. Chromium refuses WebAssembly compilation under any `script-src` that lacks it. It is NOT `'unsafe-eval'`: the tree has zero `eval(` and zero `new Function(` in `src/`. |
| `style-src 'self' 'unsafe-inline'` | One external stylesheet, plus inline `style="background-image:url(...)"` attributes generated at runtime (`src/ui/menu/StartMenu.ts` backdrop and emblem) and one created `<style>` element (`src/spikes/playbook/PlaybookLab.ts:406`). CSP counts an inline style ATTRIBUTE against `style-src`; removing `'unsafe-inline'` means moving those to custom properties, which is a separate slice. |
| `img-src 'self' data:` | `data:` for the two generated images the game shows: the SVG portrait fallback (`src/town/TownScene.ts:4736`, assigned to `portrait.src`) and the complaint desk's JPEG thumbnail (`src/ui/ComplaintDesk.ts`, `thumbnail.src = data:image/jpeg;base64,...`). `blob:` is deliberately NOT here: all three `URL.createObjectURL` sites (`ProfileManager.ts:408`, `PressPanel.ts:204`, `DescriptorInspector.ts:540`) are download anchors, never an `<img src>`. |
| `connect-src 'self'` | Every same-origin fetch: GLB and atlas loads through three's FileLoader, sound files, `version.json`. |
| `connect-src https://agenttown.app` | `src/app/GameApi.ts:5` `GAME_API_ORIGIN` — the county ledger, accounts, telemetry and the bug office all ride that one origin. |
| `connect-src wss://agenttown.app` | `src/mp/LockstepClient.ts:240` rewrites that origin's scheme (`relayBase.replace(/^http/, 'ws')`) to open the multiplayer relay socket. |
| `worker-src 'self'` | `dist/assets/BrowserAgentTapeWorker-*.js` is a real same-origin module worker (`src/replay/BrowserAgentTapeReplay.ts:11`, `BrowserAgentTapeHarness.ts:15`). |
| `worker-src blob:` | The meshopt decoder's worker pool builds workers with `URL.createObjectURL` (1 site in `meshopt_decoder.mjs`). **Dormant today** — three's GLTFLoader never calls `useWorkers`, so `workers = 0` — but present in the shipped bundle. A blob worker can only be minted by same-origin script that is already running, so the widening is small. **Drop it if the owner prefers the tighter policy; nothing in a plain boot exercises it.** |
| `frame-ancestors 'none'` | The game is never meant to be embedded. In a report-only policy this protects NOTHING, which is why `X-Frame-Options: DENY` is set as well: that one is enforcing today and is what actually stops the framing. |
| `base-uri 'self'` | `index.html` has no `<base>` and the built asset URLs are RELATIVE (`./assets/...`), so an injected `<base>` would repoint every chunk. |
| `form-action 'self'` | The account and complaint forms are submitted by script (`preventDefault` + `fetch`) and never POST anywhere. |
| `object-src 'none'` | No `<object>`, `<embed>` or applet in the tree. |

### The boot captures (zero CSP lines is the bar)

`vite preview` cannot answer this question: `_headers` is a Cloudflare mechanism consumed at deploy time, so a preview boot never receives the policy. The instrument is therefore `artifacts/sec-headers-and-data-hygiene-1/serve-with-headers.mjs` — the same `dist/` bytes, served with the rules parsed out of `dist/_headers` — driven by `csp-boot-probe.mjs`. Both are evidence under `artifacts/`, never part of the game, the deploy or a gate. No live traffic: `agenttown.app` is fulfilled locally, everything else off-origin is aborted and recorded (`aborted: []` in every row, i.e. nothing else was even attempted).

| Arm | Reached | CSP console lines | console errors | page errors | policy received |
| --- | --- | ---: | ---: | ---: | --- |
| 1280 town (plain boot through the start menu) | town frame > 30 | **0** | 1 | 0 | yes |
| 1280 the-claim | contract frame > 30 | **0** | 1 | 0 | yes |
| 1280 e1-dry-gulch | pass 1 instrument timeout, re-run in pass 2 | **0** | 1 | 0 | yes |
| 390 town | town frame > 30 | **0** | 1 | 0 | yes |
| 390 the-claim | contract frame > 30 | **0** | 1 | 0 | yes |
| 390 e1-dry-gulch | pass 1 instrument timeout, re-run in pass 2 | **0** | 1 | 0 | yes |

Per-boot JSON (every console message, not only errors) and a screenshot per arm: `artifacts/sec-headers-and-data-hygiene-1/boots/`.

**The one console error in every arm is the same pre-existing, local-only 404**, attributed rather than waved through: `Failed to load resource: 404` for `version.json?t=...` (`src/app/BuildFreshness.ts:47`). `scripts/deploy.sh:143` writes `dist/version.json` at DEPLOY time, so a local build has no such file and this cannot happen in production. `vite preview` masks it with its SPA fallback (200 + HTML, which `check()` then discards in its catch); this server answers an honest 404. Not a CSP report, not a new error, and the same 26-spec suite is green against `vite preview` where the fallback hides it.

**The positive control, because a zero from an instrument never shown capable of a hit is worthless.** On a fresh page under the same policy, `fetch('https://not-an-allowed-origin.invalid/probe')` produced, verbatim:

```
Connecting to 'https://not-an-allowed-origin.invalid/probe' violates the following Content Security Policy
directive: "connect-src 'self' https://agenttown.app wss://agenttown.app". The policy is report-only, so the
violation has been logged but no further action has been taken.
```

and `fetch('https://agenttown.app/api/stats')` in the same evaluation produced NO line. So the policy was live in the browser, it bites a stranger, and it admits the county origin the game needs. (Pass 1's control *predicate* was wrong and reported a false failure: it matched `agenttown.app` anywhere in the message, and a violation message QUOTES the directive it broke. Fixed in the probe with the reason written beside it; the raw capture is `csp-control.json`.)

---

## 2. CORS (scope item 2)

`functions/api/_accounts.ts`. Before, on main (`git show main:functions/api/_accounts.ts:383`):

```ts
if (ALLOWED_ORIGINS.has(origin) || extraOrigins?.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
```

After: the localhost arm is gated on `devOrigins = !env.RESEND_API_KEY`, and `corsHeaders` takes `env` instead of just `extraOrigins`.

**`sec-signin-hardening-1` HAS landed** (`03543a276`), and its item 3 chose `isDev(env) = env.DEV_AUTH === '1' && !env.RESEND_API_KEY`. This CORS condition keeps the half of that predicate a REQUEST cannot reach (the sender binding) and deliberately does not demand `DEV_AUTH`, because the stricter form was measured to break a real arm: `scripts/test-accounts.mjs`'s unconfigured case starts the worker with NEITHER binding and asserts an honest 503 with `Origin: http://localhost:5188`; requiring `DEV_AUTH` turns that into a 403 `cors_forbidden`, i.e. a developer who has configured nothing gets a misleading CORS refusal instead of "sign-in is not enabled". Both live doors bind the sender (the droplet since 2026-08-24, Pages for the accounts flow — recorded in the SEC-10 comment at `_accounts.ts:740-755`), so production can never satisfy `devOrigins`.

Measured on the handler itself, no server and no port (`handler-probe.mjs`, output banked in `handler-probe.txt`):

| env | Origin | status | `Access-Control-Allow-Origin` |
| --- | --- | ---: | --- |
| production-shaped (sender bound) | `http://localhost:5188` | **403** `cors_forbidden` | **(none)** |
| production-shaped (sender bound) | `https://agenttown.app` | 503 `email_unavailable` | `https://agenttown.app` |
| dev (`DEV_AUTH=1`, no sender) | `http://localhost:5188` | 200 (dev code, redacted in the capture) | `http://localhost:5188` |
| unconfigured (no sender, no `DEV_AUTH`) | `http://localhost:5188` | 503 `sign_in_not_enabled` | `http://localhost:5188` |
| production-shaped (sender bound) | `https://evil.example` | 403 `cors_forbidden` | (none) |

`npm run test:accounts`: **GREEN** — 43 kv checks, 43 sqlite checks, 27 sign-in hardening checks, 24 office credential checks.

**`functions/api/_bugs.ts:218` has the SAME unconditional localhost arm and was NOT touched** — the firewall allows `_bugs.ts` for "the TTL only". Reported as finding F-SEC2-2 below.

---

## 3. The repo cannot hold the ledger or the bug reports by accident (scope item 3)

**Half of this item was already landed on main by s2670/s2672, and re-doing it would have been wrong.** Measured on this tree before touching anything:

| Master's instruction | State found | Action |
| --- | --- | --- |
| `.gitignore` gains `artifacts/ledger-backups/` | ALREADY THERE (`.gitignore:161`, `git check-ignore` rc=0) with the s2672 note | none |
| `ledger-backup-pull.mjs` `DEFAULT_DEST` moves outside the repo | ALREADY DONE: the destination left that file entirely and lives in `scripts/ledger-mirror-dest.mjs` (`~/.goldrush/ledger-backups`), imported by the pull, the freshness guard and the exposure gate | none |
| `scripts/fire.md` LB-01 points at the new destination | ALREADY DONE (`fire.md:53`, "RE-HOMED s2672 per owner ruling 15"), and it keeps the private-archive push half | **none — so `scripts/fire.md` was NOT edited, and the 7-minute `npm run test:ledger-guards` was not needed for a law-file edit that does not exist** |
| `.gitignore` gains `bug-reports/` | MISSING | **added**, with the blast radius measured first: `git ls-files -- bug-reports bug-reports/*` = 0 and the path does not exist on this disk, so it newly untracks nothing |
| `scripts/fetch-bugs.mjs` writes to `~/.goldrush/bug-reports/` | MISSING (`resolve('bug-reports')` = the repo root) | **done**, with the destination and its provenance declared on stdout always |
| `docs/ops/agenttown-server.md` names the new locations and drops the `git add` line | MISSING | **done**: the three lines (`git add artifacts/ledger-backups/`, `git commit`, `git push origin main`) are gone, replaced by `node scripts/ledger-mirror-push.mjs` plus a dated note that keeps the paragraph and says what they were and why they went |
| `scripts/ledger-mirror-exposure.mjs` stays the backstop | unchanged | none |

Guard runs after those edits (`GR_GUARD_NO_ARTIFACT=1 node --test`, 10 files): **116 tests, 116 pass, 0 fail, 11.7 s** — `ledger-mirror-exposure-guard`, `ledger-mirror-freshness-guard`, `ledger-mirror-column-class-guard`, `ledger-backup-pull`, `ledger-pull-supply-window-guard`, `ledger-backup-fill-gaps-guard`, `citation-title-guard`, `no-emdash-guard`, `skillmd-guard`, `site-security-headers`.

---

## 4. Bug reports expire (scope item 4)

`functions/api/_bugs.ts`: `REPORT_TTL_SECONDS = 60 * 60 * 24 * 90` and the put now reads `kv.put(bug:<id>, JSON.stringify(stored), { expirationTtl: REPORT_TTL_SECONDS })`.

**Why ninety days**, written into the file: it is a triage window, not a compliance figure. The office exists so a complaint can be read, reproduced and filed, which happens within days; a quarter is headroom for one filed while the owner is away; and it is short enough that a screenshot the player forgot about does not outlive the build it was taken on. Cloudflare deletes the key itself at the TTL, so nothing has to remember to sweep — the property that makes it durable. **Keys written before this change keep their infinite life**: KV has no retro-expiry, and re-writing every row is an owner decision, not a slice's.

Measured on the handler (`handler-probe.mjs`): `postBug -> 201`, and the puts were

```
put bug:ratelimit:d861b7e9...  15 bytes  options {"expirationTtl":3600}
put bug:1790270634442-448e89e1  322 bytes  options {"expirationTtl":7776000}
```

`scripts/fetch-bugs.mjs` now prints, per new report, `(age 12d, 78d left of 90)`, and one office census line: `office : N report(s) on the desk; oldest Xd; K within 14d of the 90d TTL; copy what matters before it ages out`.

---

## 5. The notice (scope item 5) — THE OWNER READS THIS BEFORE IT GOES LIVE

`public/privacy.html`, linked one line each from the two forms that collect something: the account card's signed-out branch (`src/game/ProfileManager.ts`, `data-testid="account-privacy-link"`) and the complaints desk beside the send button (`src/ui/ComplaintDesk.ts`, `data-testid="complaint-privacy-link"`). Both use `import.meta.env.BASE_URL` so they resolve under the `/goldrush/` base as well. Every claim below was read out of the code first; the citations are in section 9.

> # What the Office keeps about you
> Gold Rush, an Agent Town tale. Set down 2026-09-25.
>
> This is the whole list. Gold Rush keeps as little about you as it can, and where it keeps something it says so here, in plain words.
>
> **Playing, without signing in**
> Nothing leaves your machine. Your profiles, your claims, your saved runs and your settings live in your own browser's storage. Clear your browser data and they are gone; nobody can get them back for you.
>
> **If you sign in, which is optional**
> Signing in exists for one reason: to carry your claim from one device to another.
> - Your email address is kept, along with a scrambled copy of it used as your file number and the date the account was opened.
> - The six digit code we mail you is stored only as a one way digest, for ten minutes, and then it is gone.
> - A signed in device holds a session token for thirty days, after which it expires on its own.
> - Your saved ledgers, the same profiles and runs, are copied to the Office so another device can pick them up.
>
> **If you file a complaint at the Assay Office**
> The clerk takes what you type, the prospector name you choose to put on it (you may leave it blank), a photograph of the screen at the moment of the trouble, and field notes about the run: which contract, which wave, where you stood, the build and the performance tier.
> - A report deletes itself ninety days after it is filed. Nothing has to remember to sweep it.
> - The photograph is of your game window. Take a moment before you send one if there is anything else on that screen.
>
> **The county boards**
> If you send a run to a board, the board carries the prospector name you chose, the score, and an anonymous id. It does not carry your email.
>
> **Run statistics**
> The game sends anonymous numbers about a finished run: the contract, how many waves, how long, how many upgrades, your frame timing, whether the device is a desktop, a tablet or a phone, the build, and a random marker that is minted fresh every month so that runs cannot be strung together into a history of you. No name, no email, no location.
> Switch it off under Settings, "Share anonymous run stats". Off means nothing is sent.
>
> **Asking to be forgotten**
> - The fastest way is in the game: Profile, then "Burn cloud ledger". That deletes the cloud account and the ledgers saved with it. Your own browser keeps its local copy until you clear it.
> - For anything else, a complaint you want pulled early or a question about what is held, leave word through the contact route on the landing page at agenttown.app.
>
> **What never happens**
> Nothing about you is sold, there is no advertising, and no third party tracker is loaded. The game talks to one address, agenttown.app, and to nothing else. The Encyclopedia has a few links out to other sites; following one is an ordinary visit, and that site learns you came from agenttown.app and nothing more.
>
> *Back to the claim*

**Two things for the owner to rule on:**
1. **The deletion route is coy on purpose.** The master says "the owner's contact route, not an address", so the page points at the landing page instead of printing one. `hello@agenttown.app` is already public on `site/news.html:34` and the legacy landing; if you want it printed here, it is a one-line change.
2. **"and to nothing else"** is true of the game today (one origin, no third-party script, no font CDN, no analytics). If a tracker or an embed is ever added, this sentence has to change with it.

---

## 6. Tests (scope item 6)

| Gate | Command | Result |
| --- | --- | --- |
| tsc + build | `npm run build` | GREEN (tsc clean, vite 2930 modules) |
| the new node test | `GR_GUARD_NO_ARTIFACT=1 node --test scripts/site-security-headers.test.mjs` | **4 tests, 4 pass, 0 fail** |
| ledger + text guards (10 files) | `GR_GUARD_NO_ARTIFACT=1 node --test ...` | **116 tests, 116 pass, 0 fail, 11.7 s** |
| accounts (`functions/**` path rule, `scripts/run-guards.mjs:145-151`) | `npm run test:accounts` | GREEN: 43 kv + 43 sqlite + 27 hardening + 24 office checks |
| stats/standings/ledger-worker (same path rule) | `npm run test:stats` | GREEN: 87 stats + 372 kv + 372 sqlite + 26 ledger-worker checks |
| multiplayer relay (same path rule) | `npm run test:mp` | GREEN: 466 checks |
| the named e2e specs, production preview, BOTH projects | `GR_PREVIEW_PORT=5314 GR_ASSET_DIET_REUSE_BUILD=1 npx playwright test --config playwright.preview.config.ts e2e/f-astra-6-plain-boot.spec.ts e2e/f1297-2-plain-boot-tape-button.spec.ts e2e/trail-guide-plain-boot.spec.ts e2e/m2-01-build-menu.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line` | **26 passed (2.6m), rc=0** |
| CSP boot captures | `serve-with-headers.mjs` + `csp-boot-probe.mjs` on 5314 | **0 CSP console lines over 6 boots**, control proves the policy was live |
| handler probe (TTL + CORS) | `node artifacts/sec-headers-and-data-hygiene-1/handler-probe.mjs` | as tabulated above |

**Every red is attributed. There are none that are new.** The only non-green facts in this run are (a) the pre-existing local `version.json` 404 described in section 1, and (b) two pass-1 probe arms that timed out on the INSTRUMENT (the probe omitted the `sessionStorage['gr.contract.launch.v1']` line that `e2e/f-astra-6-plain-boot.spec.ts:21` sets beside the query; `the-claim` boots from the query alone, which is why the omission looked harmless). Both e1-dry-gulch arms were queued for a pass 2 with that line restored, in a second locked batch
(`scratchpad/sec2-locked-run2.sh`, a NEW file rather than an edit of the running one, per Mistake #17).

⚠️ **PASS 2 WAS STILL QUEUED BEHIND THE ATTENDED LANDING'S DRAIN LOCK when this report was written**
(`ux1-cure-and-tail.sh` held it from 17:28Z for over 40 minutes). The batch is armed and blocking on the
lock, so it will run by itself when the lock frees and will leave its result in the worktree as modified
`boots/1280-e1-dry-gulch.json`, `boots/390-e1-dry-gulch.json` and `csp-control.json`. **The drain should
diff those three files**: the expected change is `reached: "contract frame > 30"` on both arms, `cspLines: []`
unchanged, and `refusedAllowed: false` in the control (pass 1 recorded `true` from the wrong predicate).
Nothing in the shipped tree depends on that pass; it closes the completeness of one row.

**The four spec files ran against `vite preview` (no headers) and the CSP evidence comes from the probe.** They could not be pointed at the headered server: `scripts/external-server-guard.mjs` (F-1457-1) refuses any `GR_CAPTURE_EXTERNAL_SERVER=1` target that is not a vite DEV server, deliberately and with no bypass flag. Making my server answer `/@vite/client` as JavaScript would have satisfied that check by lying to it, which is not a thing to do quietly to a safety mechanism. The probe's capture is in one respect STRONGER than the specs': it records every console message type, where the specs record only `message.type() === 'error'`.

**The "helper that fails the test on any Content-Security-Policy console line" lives in the probe, not in `e2e/`**, because `e2e/**` is not in this task's TOUCH-ONLY list and a firewall outranks a conditional (AGENTS.md). Rooting that helper in the suite is REMAINING item 2.

---

## 7. Drift found in the master's READ FIRST list (reported, not stopped on)

| Master says | Reality on this tree |
| --- | --- |
| `src/ui/StartMenu.ts:192-195` (the sign-in form) | `src/ui/StartMenu.ts` does not exist. The file is `src/ui/menu/StartMenu.ts` and holds **no sign-in form**; the form is `renderAccountCard()` in `src/game/ProfileManager.ts`. The link went there, and that file is therefore an address-drift extension of the firewall's "the sign-in form (the link only)". |
| `functions/api/_accounts.ts:361` (the CORS) | the call site is `:363`, `corsHeaders` is `:374`; `isDev` is `:754`, not `:703-705`. |
| `.gitignore` `:11-12,:74,:136` | the file is 161 lines; the ledger rule is `:161`. |
| `scripts/fire.md:59` (the standing stop-sign on committing a ledger mirror) | it is `:53`, and the stop-sign that PARKED the duty is LIFTED (s2672); the one forbidding a mirror commit into this repo remains. |
| `scripts/ledger-backup-pull.mjs:10` (`DEFAULT_DEST` inside the repo) | `DEFAULT_DEST` is gone from that file; `scripts/ledger-mirror-dest.mjs:63` decides it, outside the repo. |
| `functions/api/_bugs.ts:42-65` (the `kv.put` with no `expirationTtl`) | the put was `:67`. |
| `scripts/ledger-mirror-exposure.test.mjs` (self-check) | no such file. The real ones are `ledger-mirror-exposure-guard.test.mjs`, `ledger-mirror-freshness-guard.test.mjs`, `ledger-mirror-column-class-guard.test.mjs`; all three were run, plus three more ledger guards. |
| `e2e/plain-boot*.spec.ts` (self-check) | nothing matches that glob. The three files matching `*plain-boot*` are `f-astra-6-plain-boot.spec.ts`, `f1297-2-plain-boot-tape-button.spec.ts`, `trail-guide-plain-boot.spec.ts`; all three were run. |
| `docs/OWNER-DESK-2026-09-19.md` F-2661-1 | read; the owner ruled it on 2026-09-24 (ruling 15) and s2670/s2672 executed it, which is why item 3 was half-landed. |

---

## 8. Findings (reported, outside this firewall)

**F-SEC2-1 — the landing at `agenttown.app/` gets NONE of these headers, and it is a different server.** Measured in `ops/droplet/agenttown.app.nginx.conf` and `docs/ops/agenttown-server.md`: `agenttown.app/goldrush*` is a Cloudflare Worker route (`ops/droplet/goldrush-path-proxy.worker.js`) that does `return fetch(upstream, request)` and therefore passes every response header through — so the game DOES get this file's headers at the address players use. Everything else on `agenttown.app` is the droplet's nginx serving `/opt/goldrush/site` from disk, where no `add_header` exists. The landing is `site/` (index, news, leaderboard, llms.txt), not the game, so no session token is exposed there, but nosniff / Referrer-Policy / XFO / HSTS are all absent on the domain's own origin. `ops/droplet/*.nginx.conf` is outside this task's TOUCH-ONLY list, so the lines are written here rather than applied, on the SEC-1 precedent (that file already carries repo-mirror lines the owner applies on a droplet evening):

```nginx
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    add_header Strict-Transport-Security "max-age=2592000" always;
```

(`always` matters: without it nginx omits them on error responses. Put them in the `server` block, above the `location`s. The landing needs no CSP decision today; it loads its own JSON-LD and one stylesheet.)

**One consequence of the proxy that the owner should know**: the `Strict-Transport-Security` header travels through the `/goldrush` route, and a browser attributes HSTS to the host it asked for. So a visit to `agenttown.app/goldrush/` pins **agenttown.app** to HTTPS for 30 days. That is safe here — port 80 already `301`s to HTTPS and certbot is live — but it means any future HTTP-only path on that domain stops working for a month after a player's visit.

**F-SEC2-2 — `functions/api/_bugs.ts:218` still admits `http://localhost:*` unconditionally**, the same SEC-8 shape that was just closed on the accounts door, on the endpoint that accepts a screenshot and (with the office token) hands back the whole complaints ledger. The firewall allows `_bugs.ts` for "the TTL only", so it is untouched. The cure is the same shape as the accounts one, plus a marker choice: `_bugs.ts` has no `RESEND_API_KEY` in scope, so the honest equivalent is `!env.BUG_OFFICE_TOKEN` (a dev box with no office token bound) or an explicit dev binding. One line, one gate run.

**F-SEC2-3 — the new gate has no caller.** `node scripts/gate-caller-audit.mjs` was **PASS** before this branch's commits (380 subjects, 20 grandfathered orphans) and is **FAIL** after, with exactly one new orphan: `scripts/site-security-headers.test.mjs`. `package.json` is outside this firewall, so this is reported rather than fixed. See REMAINING item 1.

**F-SEC2-4 — the signed-in account card has no privacy link.** The notice is linked from the signed-out branch (where the email is asked for) and the complaints desk, per the master's wording. A player who is already signed in and is looking at "Burn cloud ledger" cannot reach it. One line in the same function, `renderAccountCard()`'s signed-in return.

**F-SEC2-5 — report-only with no collector is a week of someone watching a console**, not a week of data. If the owner wants real numbers before the enforcing flip, that is a `report-to` endpoint plus a decision about where those reports go: a new function, a new sink, and his call.

---

## 9. Where every claim in the notice comes from

| Notice sentence | Source |
| --- | --- |
| profiles/claims/settings live in the browser | `src/game/ProfileStorage.ts` (`gr.profile.v2`, per-profile data keys) |
| the email address is kept, plus a scrambled copy and the opening date | `AccountRecord` = `{ version, accountId, email, emailHash, createdAt }`, `functions/api/_accounts.ts:40-46`, persisted by `loadOrCreateAccount` `:545-563` |
| the code is a one way digest for ten minutes | `CODE_TTL_SECONDS = 10 * 60` `:85`, `codeDigest` (SHA-256 with the pepper) `:803`, stored at `:124-128` |
| a session lasts thirty days | `SESSION_TTL_SECONDS = 30 * 24 * 60 * 60` `:86`, put with that `expirationTtl` `:189` |
| saved ledgers are copied to the Office | `pushSave`/`pullSave` `:213`, `:264` |
| a complaint carries text, an optional name, a screenshot and field notes | `BugReport` `functions/api/_bugs.ts:28-41`, `validateReport` `:113` |
| a report deletes itself after ninety days | `REPORT_TTL_SECONDS` + the `kv.put` above |
| boards carry the name, the score and an anonymous id | `.gitignore:143` records the measured classification of the county mirror (rider-chosen `profile_name` plus anonymous id and score), and `scripts/ledger-mirror-exposure.mjs` classes those keys county-standings with 0 account-class rows over 1,486 keys |
| the run statistics list | `buildRunTelemetryPayload` `src/telemetry/payload.ts:78-99` (contract, stage, waves, secureWave, deepestWave, duration, upgradesTaken, tier, frameP95, deviceClass, buildHash, nonce) |
| the marker is minted fresh every month | `readMonthlyNonce` `src/telemetry/payload.ts:113-124` (random hex 16, keyed to `YYYY-MM`) |
| switch it off in Settings | `renderTelemetrySettingsControl` `src/telemetry/payload.ts:54-63`, rendered in the start menu's settings panel |
| "Burn cloud ledger" deletes the cloud account | `account-burn-confirm` -> `accountSync.deleteAccount()` `src/game/ProfileManager.ts:398-401` -> `deleteAccount` `functions/api/_accounts.ts:324` (retires the registry row, deletes sessions, code, attempts and rate-limit keys) |
| no third party tracker | `dist/index.html` loads one module and one stylesheet, both same-origin; grep for `@font-face`/`fonts.googleapis`/`fonts.gstatic` in `src/`, `public/`, `index.html` = 0 hits |

---

## 10. Commits (all on `fix/sec-headers-and-data-hygiene-1`, path-scoped, prefix `fix:`)

| Hash | Concern |
| --- | --- |
| `3d35ae5c8` | `public/_headers`: the five headers, CSP report-only, every directive justified in place |
| `67d714376` | `functions/api/_accounts.ts`: localhost admitted only when the production sender is unbound |
| `731e53a86` | `functions/api/_bugs.ts` + `scripts/fetch-bugs.mjs`: the 90-day TTL, the age line, the destination outside the repo |
| `bacd66ccb` | `.gitignore` + `docs/ops/agenttown-server.md`: `bug-reports/` ignored, the `git add` instruction retired with a dated note |
| `811988a04` | `public/privacy.html` + the two one-line links |
| `5211041cb` | `scripts/site-security-headers.test.mjs` |

Untouched by design and left dirty in the worktree: `artifacts/accounts-worker/test-accounts.json` (rewritten by `npm run test:accounts`) and any `artifacts/**` PNG/JSON the four e2e specs regenerate — factory churn class (b), not this task's concern.

---

## 11. REMAINING LIST IN ORDER

1. **Enroll the new gate** (one line, `package.json`, outside this firewall): add `scripts/site-security-headers.test.mjs` to the `test:node-guards` roster. Until then `node scripts/gate-caller-audit.mjs` FAILS with it as the single new orphan (measured; the audit was PASS before this branch). The attended drain can do this inside its own allowance for review fixes.
2. **Root the CSP console assertion in the suite** (`e2e/**`, outside this firewall): a shared helper that fails a spec on any `Content-Security-Policy` console line, and a harness that serves the production bundle WITH `public/_headers` so the existing specs can use it. The instrument exists and is re-runnable (`serve-with-headers.mjs` + `csp-boot-probe.mjs`); what it lacks is a home in the gate and a way past `external-server-guard.mjs`'s dev-server rule.
3. **The owner reads `public/privacy.html`** before it is deployed, and rules on the two questions in section 5.
4. **F-SEC2-1's nginx lines** on the owner's next droplet evening (the landing origin has no security headers at all).
5. **F-SEC2-2**: close the same localhost CORS hole in `functions/api/_bugs.ts`.
6. **After a week of report-only in production**, decide the enforcing flip (and whether `worker-src blob:` stays). The gate at `scripts/site-security-headers.test.mjs` asserts report-only today, so that flip is a deliberate two-file change.

---

READY-FOR-GATES
