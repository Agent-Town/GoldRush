# The ops evening: the account-registry deploy and the droplet hardening (owner rulings 8 and 9, 2026-09-24)

Two jobs the owner ruled on 2026-09-24 ("(8) (a)", "(9) sure lets do it"), for one evening he names. The attended session sits beside him; every command that touches the live box or the live edge is his to run, in this order. Nothing here runs by itself and nothing here is a fire's.

## Before the evening (attended, no owner time)
- The three credential rotations (ruling 1): the edge token and the voice key were rotated at their providers on 2026-09-24 (verified dead by the providers' own endpoints); the new values must be in `.env.local` and the Claude Code token rotated and revoked before the evening (the F-2299-1 desk row at the top of `tasks/BACKLOG.md`); otherwise the registry secret and the edge token would be minted into a box that still holds the old ones.
- The sign-in hardening is live (`03543a276`, deployed 2026-09-24): the nginx `limit_req` lines below are the last piece of it.
- `ops/droplet/*.service` and `ops/droplet/agenttown.app.nginx.conf` in the repo are the mirror of what the box runs; the evening changes the repo copies first, then applies them by hand, so the mirror stays true.

## Part A: the droplet hardening (review SEC-4, BUILD-6; about 45 minutes)
1. **A service user.** `useradd --system --home /opt/goldrush --shell /usr/sbin/nologin goldrush`; `chown -R goldrush:goldrush /opt/goldrush /var/lib/goldrush` (the ledger's data dir; confirm the path from `/etc/goldrush-ledger.env` first); the env files stay `root:goldrush 640`.
2. **The units.** In each of `goldrush-assay.service`, `goldrush-ledger-backup.service`, `goldrush-edge-watch.service` (and the ledger unit the box runs but the repo does not mirror: copy it into `ops/droplet/goldrush-ledger.service` that evening, BUILD-3), under `[Service]`:
   `User=goldrush`, `Group=goldrush`, `NoNewPrivileges=yes`, `ProtectSystem=strict`, `ProtectHome=yes`, `PrivateTmp=yes`, `ReadWritePaths=/opt/goldrush /var/lib/goldrush` (add the assayer's scratch dir if it writes elsewhere; read `scripts/assay-worker.mjs` for its temp path). Node runs from `/root/.nvm/…` today: copy that Node into `/opt/goldrush/node` (or install it system-wide) and point `ExecStart` at it, because `ProtectHome` hides `/root`.
3. **Chromium for the assayer.** With the worker no longer root, `chromiumSandbox: true` becomes possible in `scripts/assay-replay.mjs` (playwright's default is off under root); flip it only after the worker runs green as `goldrush` for one replay.
4. **The real client IP behind the edge.** In the nginx server block: `set_real_ip_from` for each Cloudflare range (the published IPv4 and IPv6 lists) and `real_ip_header CF-Connecting-IP;`. Without this every per-IP limit keys on the edge's address.
5. **The verify rate limit.** The mirror already carries `limit_req_zone $binary_remote_addr zone=verify_guesses:10m rate=10r/m;` at the top level and `location = /api/verify { limit_req zone=verify_guesses burst=5 nodelay; limit_req_status 429; … }`; apply as in the mirror.
6. **Apply and prove.** `nginx -t`, `systemctl daemon-reload`, restart the four units, then: `systemctl status` all green; one sign-in code requested and verified from a phone; one reel assayed (`journalctl -u goldrush-assay -n 50` shows a verdict); the ledger backup timer fires (`systemctl list-timers`); `curl -I https://agenttown.app/api/verify` from a second machine twelve times in a minute returns 429 on the last ones.
7. **Rollback.** Keep the previous unit files as `*.bak` beside them for the evening; `systemctl revert` is not enough because the user change touches file ownership; the reverse is `chown -R root:root` and the old units.

## Part B: the account-registry deploy (F-2642-3; about 90 minutes, the owner's commands)
The five steps are written in full in `docs/ops/account-registry.md` §1 to §5 with their verification and rollback. In one line each: (1) stop every old identity writer (a maintenance rule blocking `/api/verify` and `/api/delete-account` on every deployment sharing the accounts namespace, verified with the probe loop); (2) export and independently reconcile every account; (3) deploy the worker with its gate closed and its secret; (4) import once and verify the receipt; (5) enable each Pages environment, smoke-test, then reopen. Part B comes after Part A so the new worker's secret is minted onto a hardened box.

## After the evening (attended)
- Commit the mirrored units and the nginx file from the box back into `ops/droplet/`; close F-2642-3 and the SEC-4/BUILD-6 rows with the date; note in the handover which step needed a deviation.
- Release any evidence the two jobs produced into `artifacts/ops-evening-2026-09/`.
