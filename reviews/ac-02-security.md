# Security Review — ac-02 account sign-in + save-sync (client layer)

- **Slice:** ac-02-signin-sync (the CLIENT layer atop the already-merged AC-01 Worker)
- **Branch / tip:** `lane/m4` @ `1fc481f` (save-guarded `save/ac-02-signin-sync`), base `e6bb873`
- **Reviewer:** s207 fire, security-reviewer agent (read-only, via `git show lane/m4:<path>` — code NOT on main)
- **Date:** 2026-07-08
- **Purpose:** gate (ii) of ac-02's two drain-gates. This pass decides whether the session/token/auth/external-service handling is safe to merge. It does NOT decide gate (i) — the owner surface-decision (§7.3 external-services/soft-publish) remains Robin's.

## VERDICT: PASS-WITH-NOTES
Safe to drain **once the owner clears the surface decision**. No blocking vulnerability. Five non-blocking notes logged below; F1 materially informs the owner's surface call.

## What it does
Adds a client-side account sign-in + cloud save-sync UI on top of the AC-01 Cloudflare Pages Functions backend (`functions/api/_accounts.ts`, **already on main** `219d8e50`). Flow: email → server-mailed 6-digit code → server-minted 256-bit bearer session (KV-stored, 30-day TTL, revocable) → debounced profile push/pull. Default/failure state degrades to "sign-in is not enabled yet; your ledger stays safe here." Surfaces a StartMenu account chip + Hud sync status + a compare/burn ledger card.

## Evidence — files read in full (via `git show lane/m4:`)
`src/game/AccountSync.ts` (432L core: session/token/sync/auth-code) · `src/game/ProfileManager.ts` (sign-in card UI + bindings) · `ProfileStorage.ts` · `ProfileTransfer.ts` · `src/ui/menu/StartMenu.ts` · `src/ui/Hud.ts` · `src/main.ts` (boot wiring) · `playwright.accounts.config.ts` · `functions/api/_accounts.ts` (server contract — token gen, DEV_AUTH gating, CORS, validation) · `docs/api-accounts.md` · `artifacts/accounts-worker/test-accounts.json` (secret scan: clean) · `src/game/MetaProgress.ts` (load-time sanitization). CSS/e2e/thin route-wrappers grep-checked only (no logic surface).

## Positive controls (verified correct — file:line)
- **No hardcoded client secret.** Grepped `src/**/*.ts` + vite config + `.env*` for `sk-`/`api[_-]?key`/`secret`/`password`/`token=`/`resend`/`bearer` — only the legit runtime `Authorization: Bearer ${token}` (`AccountSync.ts:296`). Resend key is server-only (`_accounts.ts:475-479`), never referenced from `src/`.
- **Server code not bundled to browser.** `git grep functions/api` over `src/**` = nothing.
- **No client-forgeable session / no shippable dev bypass.** Tokens minted server-side `randomHex(32)`=256-bit (`_accounts.ts:141`); every route re-validates via `requireSession` with constant-time compare + pepper. The only "dev" branch (`AccountSync.ts:114`) is driven by the server's `dev:true` reply, which requires `env.DEV_AUTH==='1'` (`_accounts.ts:398-400`) — client cannot self-enable.
- **No token logging** (`console.` grep in AccountSync/ProfileManager = 0). **No token in URLs** — all POST, token in header/body (`AccountSync.ts:294-303`); `profileId` never interpolated into a route (no referrer leak, no SSRF).
- **XSS clean** — every server/user-derived `innerHTML` value passes an escaper: `ProfileManager.renderAccountCard` `escapeHtml` (`:198,201,211,214,221,222,224`, escaper `:418-426`), `StartMenu.ts:99`, `Hud.ts:429` via `this.escape` (`:487`); email `value="..."` attribute-injection safe (`:200-202`).
- **Dual input validation** — client email `trim().toLowerCase()` (`:105`) + code `/^\d{6}$/` (`:120`); server re-validates email/code/profileId/envelope + 200KB body cap + per-email/IP rate limits + 5-try lockout.
- **apiBase not runtime-attacker-influenceable** — `import.meta.env.VITE_ACCOUNTS_API_URL` inlined at build (`:403`); no query/DOM/postMessage mutation path.
- **Fail-safe local save** — a failed request only sets `message` (`run()` `:274-289`); local overwrite happens ONLY via explicit "Use cloud" button (`useCloud` `:176`) or boot-restore of a prior session; `signOut`/`deleteAccount` keep the local ledger.
- **Boot privacy** — `install()` (`:60-68`) fires a network call ONLY when `this.session` is truthy (a prior deliberate sign-in) AND no local profile exists; a fresh/never-signed-in visitor makes ZERO boot network calls. Complies with the "nothing sends on boot without a player action" law.

## Findings (all NON-BLOCKING; none stop the merge)
- **F-ac02sec-1 — MEDIUM (owner-relevant) — "graceful degradation" is same-origin, not no-op.** `AccountSync.ts:402-405` `apiBase()` returns `''` when the env var is unset → `fetch('/api/request-code')` is a **same-origin relative** request (`:299`). On the deployed Pages site `/api/*` are the real (already-merged) Functions, so unsetting the env var does NOT disable the network — it hits the co-deployed Worker, which returns `503 sign_in_not_enabled` until `ACCOUNTS` KV + `RESEND_API_KEY`/`DEV_AUTH` are configured. The client maps that cleanly to the friendly message (`friendlyError` `:390-393`). **Not a vuln**, but the owner's surface decision must be made knowing the sign-in card will reach the live 503-guarded backend the moment the branch is on the Pages domain. Optional stricter isolation: early-return in `request()` when `apiBase()===''`.
- **F-ac02sec-2 — LOW — dev sign-in code rendered into the DOM** (`AccountSync.ts:114`/`:96` → `ProfileManager.ts:211`, escaped). Only populated when the server replies `{dev:true,code}` (requires `DEV_AUTH==='1'`). Production Pages must never set `DEV_AUTH`. Conscious-choice log.
- **F-ac02sec-3 — LOW — untrusted cloud envelope written to local ledger without value-level validation** (`AccountSync.ts:180,243` → `ProfileTransfer.ts:82-102`). Calibrated LOW: structural validation exists (`isEnvelope`/`normalizeCloudProfile` `:104-129`) AND load-time re-sanitization clamps values (`MetaProgress.ts:36,79` — non-finite→0, negatives→0). Same trust path as the already-shipped "Unpack a ledger" file import → adds no new trust surface; only matters under an authenticated MITM (defended by HTTPS + server CORS allow-list).
- **F-ac02sec-4 — LOW — no client-side HTTPS enforcement on apiBase** (`:402-405` accepts any string). Build-time config value, not attacker-influenceable → operational hygiene. Optional: assert `https://`-or-localhost in `apiBase()`.
- **F-ac02sec-5 — INFO — session token in `localStorage`, XSS-reachable** (`SESSION_KEY='gr.account.v1'` `:37,335,354`). Accepted: no XSS sink found, static game with no server-rendered user content, token server-expiring (30d) + revocable; `httpOnly` cookies aren't available to a pure static client. Accepted-risk log.

## Merge guidance
- **Gate (ii) = CLEARED** by this pass. ac-02 becomes drain-ready the instant Robin clears **gate (i)** the surface-decision (whether/when to show the sign-in card given F1's same-origin fact).
- No corrective task authored — no blocking finding. F4 (assert https apiBase) + the F1 optional early-return are small hardenings best folded in by whoever drains, WITH the owner's surface intent known (they interact with the surface behavior). Do not add them blind.
- Drain recipe unchanged from s206: LANE-TOUCHED graft from `lane/m4 1fc481f` base `e6bb873`, take ONLY the 10 real files, drift-check `main.ts`/`Hud.ts`/`StartMenu.ts` vs base first, ignore the stale-base MAIN-MOVED deletions.
