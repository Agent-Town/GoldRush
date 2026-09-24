# Drain review: `sec-headers-and-data-hygiene-1`, security headers with a report-only CSP, the ledger mirror and bug reports out of the repo by rule, bug reports that expire, a privacy notice (Opus implementer; the outside review of 2026-09-24, SEC-8, SEC-5, SEC-7)

**Branch** `fix/sec-headers-and-data-hygiene-1` at `402c3159e` (ten path-scoped commits, prefix fix:) · **merge** `0bfb168ea` · same-era pin #60 `91dd025e` · drained attended 2026-09-24 19:07Z in a detached chain worktree with the scratch store at `5793a96`; deployed after the owner read the notice.

**Verdict: LANDED.** All seven scope items delivered; the drain cured F-SEC2-3 (the new guard's caller).

### What it does
`public/_headers` gains five headers on every path: nosniff, a strict-origin referrer policy, frame denial, a modest 30-day HSTS (no subdomains, no preload) and a Content-Security-Policy in REPORT-ONLY mode naming exactly what the game uses (self; wasm-unsafe-eval for meshopt; inline styles; data: images for the portrait fallback and the complaint JPEG; connect to the county origin over https and wss; blob workers; no framing, no objects). Because vite preview cannot serve `_headers`, the implementer built a static server over dist that applies it and booted the town, the Claim and Dry Gulch at 1280 and 390 through it: zero CSP console lines over six boots, with a positive control (a disallowed origin produced the report-only violation, the county origin did not). CORS in the accounts handler admits localhost only while the production mail sender is unbound (measured on the handler: production plus localhost 403 with no allow-origin; the county origin allowed; the unconfigured arm keeps its honest 503). Bug reports carry a 90-day expiry on the KV put and the fetch script prints each report's age; `bug-reports/` is gitignored and the fetch writes to `~/.goldrush/bug-reports/`; the runbook's lines telling a reader to git add the ledger mirror are retired with a dated note (the mirror's own ignore rule and re-home had already landed through the fires' LB-01 work, so `scripts/fire.md` was not touched). `public/privacy.html` says in plain words what is kept, for how long and how to be forgotten, linked one line each from the account card and the complaints desk; the owner read it before this deploy. Where the player sees it: the two links, and nothing else changes on screen; the headers and the CSP report are for the browser.

### The drain's own cure
**F-SEC2-3.** `scripts/site-security-headers.test.mjs` parses `_headers` and asserts the five headers, and had no caller (package.json is outside the run's firewall), which reds gate-caller-audit on a single orphan; the drain adds it to `test:node-guards`.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34346281 bytes` |
| strict release build (the assertion) | `rc=0 [release-build] E1-only: 1127 files, 97671352 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| engine hash | `91dd025ed5e01410…`; same-era pin #60 `91dd025e`, era guards in the chain `ℹ pass 9 ℹ fail 0 ` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (303.6s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards (incl. the mirror-exposure and headers guards, gate callers) | `ℹ pass 141 ℹ fail 0 ` |
| the three functions gates (the merge touches functions/) | `accounts rc=0 | mp rc=0 | stats rc=0` |
| the CSP boot probe on the merged tree (violation lines per boot; the implementer's pass 2 covered Dry Gulch with the launch key) | `(violation lines per boot): 1280-e1-dry-gulch=0 1280-the-claim=0 1280-town=0 390-e1-dry-gulch=0 390-the-claim=0 390-town=0 | control: {"controlCsp":["info: Connecting to 'https://not-an-allowed-origin.invalid/probe' violates the following Content Securit` |
| e2e both projects, `--workers=1` (the bug office desk, profile-first-boot, m2-01, task-025, the agent view) | `rc=0   56 passed (3.0m)  18:59Z`; the warm-up line records the cold-compile flake F-ENV-1 |
| full `npm run test:node-guards` (before the pin) | `rc=1 ℹ tests 959 ℹ pass 950 ℹ fail 4 ℹ skipped 5  19:07Z` (the registry rows are the pre-pin hash class; the fixture sweep the load class) |

The implementer's own gates: build and tsc green, its new test 4/4, 116 rows over ten ledger and text guards, test:accounts, test:stats and test:mp green, the named e2e specs on the production preview 26 passed on both projects.

### Merge classification
`public/_headers`, `public/privacy.html` (new), `functions/api/_accounts.ts` (the CORS condition), `functions/api/_bugs.ts` (the TTL), `scripts/fetch-bugs.mjs`, `.gitignore` (unioned with main's mirror rule where both moved), `docs/ops/agenttown-server.md`, `scripts/site-security-headers.test.mjs` (new), `src/game/ProfileManager.ts` and `src/ui/ComplaintDesk.ts` (the link lines), `package.json` (the drain's roster line), `artifacts/sec-headers-and-data-hygiene-1/**` (the report, the header-serving probe, six boot captures, the handler probe, the served headers). No contract, sim rule, collision, floor or store change.

### Findings
- **F-SEC2-3 (cured here):** the orphan guard above.
- **F-SEC2-1 (open, the ops evening):** the droplet's nginx serves `agenttown.app/` itself with no security headers; the game gets them only because `/goldrush*` is a header-passing Worker proxy; the four add_header lines are in the report, and HSTS travels through that proxy and pins the whole domain for 30 days.
- **F-SEC2-2 (open, fire-authorable):** `functions/api/_bugs.ts` still admits localhost unconditionally in its own CORS (the firewall allowed the TTL only); the same two-condition rule as the accounts handler.
- **F-SEC2-4 (open, small):** the signed-in account card has no privacy link (the sign-in form and the complaints desk do).
- **F-SEC2-5 (owner's, noted):** report-only with no collector means violations are seen only in a console; the master defers the enforcing decision to the owner after a week in production.
- **F-SEC2-6 (noted):** the master's READ-FIRST list had drifted in nine places (the sign-in form lives in `ProfileManager.renderAccountCard`, not `StartMenu.ts`); all located.
