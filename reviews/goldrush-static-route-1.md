# Drain review: `goldrush-static-route-1`, the game's canonical path prepared to leave the Worker (nginx proxy block, verifier, runbook, guard); the cutover is the next act

**Branch** `art/portraits-e5-e10-generated` at `d8ecd3356` · **merge** `b3cb110c6` · engine hash unchanged (`378f9213`, no pin) · drained attended 2026-10-09 07:56Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `gsr1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `goldrush-static-route-1`, lane-d `art/portraits-e5-e10-generated` (the branch name is history; the commits are path-scoped), `c8b41b00b` (the conf, the verifier, the runbook, the guard) and `28417dd2f` (evidence whitespace), Astra gpt-6-astra, 78,867 tokens, 2026-10-09 04:28Z to 04:34Z, on the owner's word ("Option B - lets fix this once and for all in a proper way"). Attended landing, hash unchanged; nothing live changed.

**What it does.** The routing half of Option B. The droplet's nginx, which already owns `agenttown.app` and already proxies `/api/` to the Pages alias, is prepared to serve `/goldrush/` the same way, so the Cloudflare Worker `goldrush-path-proxy` leaves the static path and no asset request counts against the Workers free tier again. The `/goldrush` 302 fallback becomes a 301 to `/goldrush/` plus a proxy block on the `/api/` pattern: request-time resolver and variable upstream (so a DNS hiccup can never again take nginx down at load, F-2026-08-26), a `rewrite … break` that strips the prefix (a variable `proxy_pass` cannot carry a URI), SNI on, the Host header set to the Pages alias; upstream cache headers pass through untouched. A verification script runs on the droplet without credentials and prints a PASS/FAIL table (prerequisites, `nginx -t`, the canonical paths through 127.0.0.1 with the Host header, an immutable asset, `/api/stats`). The ops doc gains the five-step owner runbook: stage + `nginx -t` + reload; verify on the droplet while the Worker route still exists (the public sees nothing yet); remove only the Worker route; public verification including `cf-cache-status`; rollback by re-creating the route. A Node guard pins the conf's shape.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| `scripts/goldrush-route-conf.test.mjs` | 5 of 5 (re-run attended on the lane tree; also this landing's named guard) |
| `bash -n ops/droplet/verify-goldrush-route.sh` | ok (re-run attended) |
| The nginx block | matches the `/api/` block's resolver, variable upstream, SNI and Host header; prefix stripped by `rewrite`; every other block byte-identical (13 lines changed in the conf) |
| Real `nginx -t` | not available on the Mac, not claimed by the run; the runbook's first gate on the droplet |
| Runbook | five numbered sections in `docs/ops/agenttown-server.md` (+80 lines), with the rollback and the cost of each skipped step |
| tsc / build | exit 0 / exit 0 (nothing under `src/`) |
| Evidence budget | 0.8 MB added |
| Merge | `git merge-tree` clean against main (0 conflicts) |
| Second landing (06:00Z to 06:31Z) | guards 143/0, ledger battery 1,263 with 0 fail, e2e 24/24, Node battery 1,048 tests with ONE red: `scripts/agent-reels.test.mjs` (48.5 s; its gr-sim child did not finish inside the budget under the battery's load, the same leaf that reddened emd1's battery on 2026-09-29). CONTROL alone on the chain worktree right after the battery: 1/1 in seconds (`~/.goldrush/land/gsr1-control-agent-reels.log`): load-class, allowed by exact title (F-GSR1-2); resumed at the pin |
| First landing (04:35Z to 05:18Z) | named guards 142 pass / 1 fail and the ledger battery red on the same leaf, the gate-caller audit's positive control: `scripts/goldrush-route-conf.test.mjs` had NO CALLER (a new guard file must be rostered in `package.json` `test:node-guards`). Fixed attended on the lane (one roster entry); the audit and the conf guard green on the lane tree; the second landing is the verdict (F-GSR1-1) |

**Merge classification.** Base: main at the chain cut. Lane-touched: `ops/droplet/agenttown.app.nginx.conf` (the `/goldrush` location only), `docs/ops/agenttown-server.md` (appended section). New: `ops/droplet/verify-goldrush-route.sh`, `scripts/goldrush-route-conf.test.mjs`, `artifacts/goldrush-static-route-1/**`. No `src/**`, `public/**`, `site/**`.

**Findings.**
- **F-GSR1-1 (fixed on the lane):** a new `scripts/*.test.mjs` guard must be added to the `test:node-guards` roster in `package.json`, or the gate-caller audit reds every battery. Authoring note for masters that add guard files.
- **F-GSR1-2 (load-class, attributed by control):** the agent-reels guard's gr-sim child timing out under the battery; alone it passes.
- **The cutover is the next act, not this landing:** deploy the game (pin #75, the door page, the headers from `headers-asset-cache-1`), then the droplet write on the owner's explicit word (the attended session's ssh is read-only by standing rule), the verifier, the Worker route deletion (this Mac's Cloudflare session holds `workers_routes (write)`), public verification, and the owner's Cache Rule for `/goldrush/assets/*`.
- **Astra's note, correct:** at its inspected main the `public/_headers` catch-all still carried `no-cache` (my one-file fix had been reverted by the headers guard); the cache half lands separately from lane-b.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 143 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  06:06Z` |
| full npm run test:node-guards (before the pin) | `rc=0 ℹ tests 1 ℹ pass 0 ℹ fail 1 ℹ skipped 0 ℹ tests 1048 ℹ pass 1043 ℹ fail 0 ℹ skipped 5 ℹ tests 92 ℹ pass 92 ℹ fail 0 ℹ skipped 0  06:31Z` |
| engine hash | `merged: 378f9213f5a7d0f63e063262bd691f2eb0c64df30a9bb3e58061fb5a45f2a817 (pinned 378f9213f5a7d0f63e063262bd691f2eb0c64df30a9bb3e58061fb5a45f2a817)` |
