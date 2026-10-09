# Gold Rush static route — prepared for owner cutover

READY-FOR-GATES. Implementation complete; no live configuration, Worker route, Pages deployment or cache rule was changed.

## Root cause and resulting change

F-2987-1 routes every canonical game asset through `goldrush-path-proxy`, consuming the daily Worker allowance. Replace the droplet's cross-origin 302 fallback with a same-origin Pages reverse proxy. Removing the Worker route after local acceptance lets static traffic reach nginx without invoking that Worker. Existing API locations and all other nginx bytes remain unchanged.

- [Full implementation diff](implementation.diff): two existing files changed, two new operational files.
- [Owner runbook](../../docs/ops/agenttown-server.md#static-game-route-cutover--f-2987-1-owner-runbook-2026-10-09): exact commands, cache rule, verification and rollback.
- [Configuration](../../ops/droplet/agenttown.app.nginx.conf), [droplet verifier](../../ops/droplet/verify-goldrush-route.sh), [Node guard](../../scripts/goldrush-route-conf.test.mjs).

## Pre-flight and adaptations

- Initial lane HEAD `cf56d87c8`; branch `art/portraits-e5-e10-generated`. `main..HEAD` and `git cherry main HEAD` were empty: no undrained ahead commits, so no reset/clean was needed. No evidence discarded.
- Only initial untracked entry was the explicitly expected shared `node_modules` symlink. Preserved it; did not run install/ci. The task's specific prohibition supersedes its contradictory generic install line.
- Pre-edit build exit 0 ([prebuild.log](prebuild.log)). Post-build status remained clean apart from that symlink.
- Lane owner desk lacked §9; read §9 from `git show main:docs/OWNER-DESK-2026-09-19.md` instead. The task is the slice specification; no matching static-route spec exists.
- A trailing slash on a variable `proxy_pass` would replace the entire upstream URI with `/`. Used `rewrite ^/goldrush/(.*)$ /$1 break` and a URI-less variable proxy_pass instead. Query arguments are preserved. [nginx reference](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).
- Port 80 is redirect-only outside the allowed edit surface. Verifier asserts its 301, then probes local TLS with `--resolve agenttown.app:443:127.0.0.1`, no redirect following and no insecure TLS. This proves nginx instead of following public DNS back into the still-active Worker.
- Task says F-2987-2 already fixed public/_headers. At inspected main `0ba4a9b5e`, that file matched the lane and still had catch-all no-cache; its latest main commit was `3d35ae5c8`. No out-of-scope header fix attempted. Runbook requires observed deployed immutable headers without a cache veto before cutover.
- Cloudflare's current extension table includes BIN, contrary to the task rationale. The requested assets Cache Rule is still necessary for GLB and atlas JSON and covers BIN consistently. [Cloudflare reference](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/#default-cached-file-extensions).
- Vault MOC and incident notes were read. Durable handoff is this report: no vault write was made because the task's TOUCH-ONLY firewall excludes it.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| `node --test scripts/goldrush-route-conf.test.mjs` | 5 passed, 0 failed | [guard.log](guard.log) |
| `bash -n ops/droplet/verify-goldrush-route.sh` | exit 0 | checked locally |
| Offline verifier scenarios | 10 passed; healthy exit 0, all 9 failures exit 1 | [verifier-checks.log](verifier-checks.log), [reproducible harness](check-verifier.py), fixtures/ |
| `npx tsc --noEmit` | exit 0 | [tsc.log](tsc.log), empty on success |
| `npm run build` after edits | exit 0 | [build.log](build.log) |
| Non-game nginx bytes | identical to pre-task HEAD | [scope-check.log](scope-check.log) |
| All 318 tracked src files | content hashes equal pre-task HEAD | [scope-check.log](scope-check.log) |
| Landing `site/index.html` | SHA256 unchanged | [scope-check.log](scope-check.log) |
| `git diff --check` | exit 0 | checked locally |
| Real nginx parse | unavailable on Mac, not claimed | owner `nginx -t` required |

Verifier scenarios: healthy, nginx rejection, network failure, conflicting immutable/no-cache, asset HTML fallback, differing build IDs, invalid version JSON, skill HTML fallback, API error JSON, missing hashed asset. Mocks enforce local TLS resolution and forbid redirect following/insecure TLS. They test verifier behavior, not actual nginx/Pages/CDN behavior. Pre/post builds retain existing Vite config-loader and large-chunk warnings; no game browser suites were run for this ops-only slice.

Source content SHA256: `7e6eab5592d4489c0e47cde20723f1a10346f0cb345a3683680cd7ca60a8dad7`.
Landing SHA256: `d1c07cf55cb2382945ca9c2cf08dd257587ee85e754b967e3d687932da6ac399`.

## Five-step owner runbook

1. Transfer reviewed conf and verifier; compare live drift, preserve backup, copy conf, run `nginx -t`, reload only on success.
2. Run the local verifier while the Worker route still exists; require every row PASS, including Pages build equality and immutable headers without no-cache.
3. Record/delete only `agenttown.app/goldrush*` → `goldrush-path-proxy`; retain script for rollback. Add the assets-only Cache Rule (eligible, respect origin TTL, bypass absent cache-control) before cache acceptance.
4. Verify public game/version/skill 200, healthy stats, correct build, second identical asset GET HIT; corroborate outer CDN caching, test GLB/atlas JSON and desktop/mobile saved-game/account behavior.
5. On failure re-create the recorded Worker route, re-verify; restore nginx backup only if needed. Rollback also restores Worker quota exposure.

## Remaining list in order

1. Integrator/owner resolves or verifies the separate deployed F-2987-2 header prerequisite; no header mutation is authorized in this slice.
2. Owner applies conf and runs the real droplet nginx/local gates.
3. Owner removes Worker route, creates Cache Rule and records public/CDN/browser gates and next-UTC-reset health. No SSH, Cloudflare API, deploy or credentials used here.

Implementation commit: `c8b41b00b3d39c3a0255927098a4aea4bbd3d8a4`. A following evidence-only commit normalizes two Vite trailing-whitespace lines in build logs so the full committed diff passes whitespace validation; it changes no implementation. The final handoff includes both hashes.
