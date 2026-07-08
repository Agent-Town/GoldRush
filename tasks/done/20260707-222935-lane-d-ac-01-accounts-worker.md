# Task ac-01: the accounts worker — email-code auth + save-sync API (LANE-D, branch lane/perf, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/accounts/README.md (BINDING — the model, the security musts, dev-mode rules)**; scripts/deploy.sh + wrangler setup (.env.local token — the worker deploys as Pages Functions with the existing pipeline); the export-bundle envelope from tasks/lane-a-profile-first-boot.md (design the API around that shape; if it hasn't merged yet, define the contract and note it — AC-02 reconciles). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after gt-03 in this lane's queue.

## Scope (spec slice AC-01)
1. **`functions/api/` Pages Functions**: `request-code` (email in → hashed code to KV w/ 10-min TTL → Resend send; DEV MODE per spec: `env.DEV_AUTH=1` returns the code in-response and skips Resend) · `verify` (email+code → constant-time compare, attempt counter, session token out) · `session` (validate) · `save/push` (auth'd; validate envelope, 200KB cap, write blob + rotate last-5 versions) · `save/pull` (+ `save/versions`) · `delete-account` ("burn the ledger": blobs, versions, sessions, the email key — everything).
2. **KV design** (single namespace, documented key scheme): `code:<emailHash>`, `attempts:<emailHash>`, `ratelimit:<ip>`, `session:<token>`, `save:<accountId>:<profileId>` + `:v1..v5`. Email addresses stored hashed for keys; the plaintext only inside the account record (needed for sending codes).
3. **Security musts implemented exactly per spec** (rate limits per-email + per-IP, no enumeration, CORS locked to gold-rush-3in.pages.dev + agenttown.app origins + localhost dev, size caps). Web-crypto only, NO new npm deps.
4. **API contract doc**: `docs/api-accounts.md` — every endpoint, shapes, error codes (AC-02 builds against this).
5. **Tests**: wrangler-dev-based integration script (node, no new deps) covering the full flow in DEV_AUTH mode: request→verify→session→push→pull→versions→delete + rate-limit trips + oversize rejection + bad-envelope rejection. Wire as `npm run test:accounts` (script only — NOT into the playwright suites).
6. NO production deploy in this task (the site pipeline picks functions/ up on the next deploy anyway — dev-mode-safe: without DEV_AUTH or a Resend key, request-code returns a clean 503 "sign-in not yet enabled" and the game is unaffected).

## Firewall
Touch ONLY: functions/**, docs/api-accounts.md, the test script + package.json script entry, artifacts. NO game src/ changes (AC-02's job), NO wrangler.toml changes beyond KV binding docs (note required bindings for the owner/fire to create: `wrangler kv namespace create ACCOUNTS`), NO secrets anywhere in the repo.

## Self-check
tsc/build green (game untouched — canary m1-01 both projects); `npm run test:accounts` full-flow green under wrangler dev with DEV_AUTH=1; the 503-when-unconfigured path proven; contract doc complete; zero secrets in diff (grep the diff for key-like strings, state it). Commit on lane/perf. End: READY-FOR-GATES + the KV binding one-liner for the desk + contract doc pointer.
