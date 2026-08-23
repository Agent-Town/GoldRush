# agenttown.app — server & edge runbook
STATUS: LIVE ARCHITECTURE 2026-08-22 (attended session, executed on three owner rulings 2026-08-21/22: "retire it" · "sure, lets do that" · "yes, lets use the droplet"). This file is the single source for what runs where; update it in the same commit as any change to the pieces it names.

## The map (request flow)

```
player/crawler
   │
   ▼ (Cloudflare DNS, orange-cloud proxied)
agenttown.app  A → <droplet> (DigitalOcean droplet "agenttown-landing")
   │
   ├─ /goldrush*  → CF WORKER ROUTE (zone route dfeb700a…, script `goldrush-path-proxy`)
   │                 proxies to https://gold-rush-3in.pages.dev (the LIVE production
   │                 Pages alias — E1-only builds; owner ruling 2026-08-20). The request
   │                 NEVER reaches the droplet. URL + players' saves stay on agenttown.app.
   │                 History: until 2026-08-22 this proxied a FROZEN branch alias
   │                 (goldrush-base.…, built Aug 9) — the "stale /goldrush" incident.
   │
   └─ everything else → the droplet:
        nginx (TLS via certbot) → root /opt/goldrush/site (the landing: index/news/
        leaderboard/llms.txt/robots.txt/sitemap.xml — the repo's site/ dir, rsync-deployed)
        + `location /goldrush { 302 → gold-rush-3in.pages.dev }` (unused fallback while
        the CF route exists; keep it — it makes the route removable without downtime)
```

Pages projects (account ec3f15bf…): `gold-rush` = the game (production = E1-only via GR_RELEASE=e1 in scripts/deploy.sh; previews full-content via `--branch=preview-e9`) · `agenttown` = a Pages copy of the landing (kept in sync, not yet the domain's origin).

## The droplet (root@<droplet>, "agenttown-landing", 1GB + 2G swapfile)

RUNS:
- **nginx** — the landing + TLS (`/etc/nginx/sites-available/agenttown.app.conf`, copy in `ops/droplet/agenttown.app.nginx.conf`).
- **goldrush-assay.service** — the assay verification worker (systemd; unit copy in `ops/droplet/goldrush-assay.service`). Polls `/api/standings/assay-queue` on production every 15s, replays submitted tapes in headless chromium via the repo at `/opt/goldrush`, posts verdicts. Env at `/etc/goldrush-assay.env` (mode 600 — holds `ASSAY_WORKER_SECRET`, shared with the Pages project's secret of the same name; NEVER echo or commit values; rotate by generating a new value into both places and redeploying production so the Pages binding refreshes).
  - Ops: `systemctl {status,restart} goldrush-assay` · logs: `journalctl -u goldrush-assay -f` · manual test: `node scripts/assay-worker.mjs --once --dry-run` (with the env file sourced).
  - Slow-box budgets (in the env): `ASSAY_BOOT_TIMEOUT_MS=300000`, `ASSAY_PLAYBACK_TIMEOUT_MS=300000` — the first replay cold-transforms the whole game in vite on 1 vCPU.
  - ⚠️ **`ASSAY_BUILD_ID` IS REQUIRED ON THIS BOX AND THE WORKER WILL NOT BOOT WITHOUT IT (F-2238-1, from the c6-tape-build-id drain, merge `3a2ebfd0c`).** Since c6 the worker declares which build it assays, so it can post an honest `unassayable — build-skew (tape <id>, assayer <id>)` instead of charging a rider for the county's own patch. It resolves that id as `ASSAY_BUILD_ID` **or else** `git rev-parse --short HEAD` — at module top level, uncaught. The fallback is correct everywhere a checkout exists (dev, CI, every test) and **cannot work here**: this box is rsync-deployed with `--exclude .git` (see the KV note below — *"no git on the box"*), so with the variable unset the worker throws before serving and systemd restart-loops, which reads as silence rather than as an error. **Set it in `/etc/goldrush-assay.env` to the 7–16 char lowercase git id of the tree you rsynced (`git rev-parse --short HEAD` on the MAC, before the rsync), and update it every time you push a new engine copy** — a stale value is worse than none, because it makes the assayer declare skew against tapes recorded by the build it is actually running.
- RETIRED 2026-08-22 (owner: "retire it"): the February Portal experiment (`/root/code/Portal-main`, the pony-inbox/canvas/wallet landing) — processes stopped, errored PM2 entry deleted, **code left on disk untouched**.

DEPLOY/UPDATE the worker's engine copy: rsync the lean tree (`package*.json vite.config.ts index.html tsconfig* src/ scripts/ assets/ public/ site/`) to `/opt/goldrush/`, then `npm ci` if the lock moved, **then set `ASSAY_BUILD_ID` in `/etc/goldrush-assay.env` to the short id of the tree you just sent (see the ⚠️ note above — the worker will not boot without it and a stale value mis-declares skew)**, then `systemctl restart goldrush-assay`. The landing alone: rsync `site/` and nothing else (nginx serves it directly; no restart needed).

## Cloudflare token (id c903a069…, in .env.local — value never committed)
Permissions as of 2026-08-22: Pages:Edit · Workers Scripts:Edit · **Workers KV Storage:Edit** · **Zone.Workers Routes:Edit (agenttown.app)** · **Zone.DNS:Edit (agenttown.app)** (the last three added by the owner 2026-08-22 to unblock the KV tape restore, the /goldrush retarget, and a future DNS→Pages flip).

## KV (namespace `goldrush-telemetry` f2221555… — the TELEMETRY binding of the gold-rush Pages project)
Standings boards live at `standings:s<season>:<epochId>:<contractId>` (season 1 keys have no `s<n>`). Rows carry `assay: pending|verified|rejected` + the submitted tape. ⚠️ `wrangler kv key list/get/put` needs `--remote` — without it wrangler answers from empty local storage (measured 2026-08-22: 0 keys local vs 189 remote). Any surgical edit: `get --remote` → back up the value into `artifacts/ops/` (retention law) → modify → `put --remote`.

## Incidents recorded (all resolved)
1. **The false rejection**: the worker's first live cycle picked up the owner's e9-seed-run tape; an operator `systemctl stop` killed the replay mid-run and the worker posted `rejected (instrument exited 143)`. Restored by KV surgery (row flipped back to pending; original value backed up at `artifacts/ops/seedrun-board-backup-20260822.json`).
2. **Version skew (F-ASSAY-SKEW, the finding that matters for launch)**: the restored tape then replayed to a full-budget timeout — it was recorded on the previous morning's engine, and the day's sim changes (pool recycling among them) made its event stream unreproducible on the current build. Honest terminal: the row rests `rejected` as unverifiable-by-skew. **Successor slice: tapes record their build-id; the worker replays against the matching build or declares `skew` explicitly.** Players will submit across patch windows; a generic rejection is the wrong answer.
3. **File-watcher exhaustion (F-ASSAY-E2E-8, round-2 probe)**: the agent replayer’s embedded vite dev server file-watched the whole asset tree; on the 1GB droplet the replay crashed `ENOSPC: System limit for number of file watchers reached` and the worker posted it as a rejection. Cure: `watch: null` in `scripts/assay-replay-agent.mjs` (the replayer never edits files) **and** `fs.inotify.max_user_watches=524288` persisted in `/etc/sysctl.conf` on the droplet (`max_user_instances` left at 128). The instrument-failure-as-rejection class itself is F-ASSAY-E2E-9, dispatched to codex (`c1-assay-fairness`).

## AEO surfaces (owner request 2026-08-22, live + committed with this file)
`site/llms.txt` (the benchmark thesis, for answer engines) · `site/robots.txt` (AI crawlers welcomed by name + Sitemap) · `site/sitemap.xml` · JSON-LD in `site/index.html` (WebSite + VideoGame + the gauntlet as SoftwareApplication) · `public/llms.txt` + `public/robots.txt` (the game origin, pointing at /skill.md). Deployed to: production Pages (deploy.sh), the droplet (rsync site/), and the agenttown Pages project. Edge note: a pre-deploy 404-fallback of /robots.txt was cache-HIT for up to 4h after first ship.

## KV budget (free tier) — incident 2026-08-22
Free tier: **100k reads / 1k writes / 1k deletes / 1k lists per day**, resets 00:00 UTC. The 50%-cap notification traced to the assay worker: `onRequestAssayQueue` read every board (41 contracts) per poll at the 15s default = ~236k reads/day idle. **Knob**: `ASSAY_POLL_MS` in `/etc/goldrush-assay.env` (set 180000 on 2026-08-22 → ~20k/day; latency ≤3 min). **Durable cure**: the `assay-queue-index` slice (c4) makes polls O(pending). **Launch note**: the sharper cliff is the WRITE cap — every submission + verdict is a KV write, so a launch day with a few hundred riders exceeds 1k/day; the $5/mo Workers Paid plan (10M reads / 1M writes monthly) is the recommended pre-announcement upgrade (owner decision, OWNER-DECISIONS §F). Worker code updates reach the droplet by rsync (no git on the box): `rsync -az --delete --exclude .git --exclude node_modules --exclude worktrees --exclude artifacts --exclude logs --exclude tasks --exclude .claude --exclude .wrangler --exclude dist ./ root@<droplet>:/opt/goldrush/` — **then update `ASSAY_BUILD_ID` in `/etc/goldrush-assay.env` to the source commit the tree was synced from** (since c6, the worker refuses to boot without a build id: no `.git` on the box means the `git rev-parse` fallback dies — learned 2026-08-23 as a crash-loop; the env knob is the cure) — then `systemctl restart goldrush-assay`. The service ExecStart pins `/root/.nvm/versions/node/v26.4.0/bin/node` (nvm; the apt node is v18 and is NOT what the service runs) — the ledger cutover's node-26 prerequisite is therefore already satisfied.

## The ledger service (L3 cutover, 2026-08-23 — owner "go")
`goldrush-ledger.service`: nvm node 26 (`/root/.nvm/versions/node/v26.4.0/bin/node`), `WorkingDirectory=/opt/goldrush`, `server/ledger/serve.mjs`, `EnvironmentFile=/etc/goldrush-ledger.env` (600: PORT=8791, LEDGER_DB_PATH=/opt/goldrush-ledger/ledger.db, ASSAY_WORKER_SECRET shared with the assay env, ALLOWED_CORS_ORIGINS), `MemoryMax=320M`, binds 127.0.0.1 only. nginx routes `/api/standings*` to it (ledger down = honest `503 ledger_resting`); ALL other `/api/*` forwards to `gold-rush-3in.pages.dev` (accounts until the owner supplies RESEND_API_KEY + AUTH_CODE_PEPPER; multiplayer permanently). The client hits ONE origin (`GAME_API_ORIGIN = https://agenttown.app`, `src/app/GameApi.ts`); rollback = revert that line. First boot takes ~60s (runtime transform of the TS handlers — vite must be installed WITH dev deps: `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install`, and rolldown needs its platform binding at rolldown's EXACT version: `npm install "@rolldown/binding-linux-x64-gnu@$(node -p "require('rolldown/package.json').version")" --no-save` — a mismatched-latest binding crashes with a BindingBuiltinPluginName enum error; learned at cutover). The assay worker polls the ledger at `ASSAY_API_BASE=http://127.0.0.1:8791` (localhost, no edge round-trip). KV keeps the pre-cutover data untouched (retention + rollback); the sqlite ledger started EMPTY per the owner amendment.

### Ledger backups

The nightly job uses Node 26's `VACUUM INTO`, which is safe against the live WAL database and needs no `sqlite3` package. It refuses to overwrite a same-day file and retains 14 days of explicitly named `ledger-YYYY-MM-DD.db` copies. Install and prove the timer on the droplet after `/opt/goldrush` has the drained revision:

```bash
sudo install -m 0644 ops/droplet/goldrush-ledger-backup.service ops/droplet/goldrush-ledger-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now goldrush-ledger-backup.timer
sudo systemctl start goldrush-ledger-backup.service
sudo systemctl status goldrush-ledger-backup.timer --no-pager
sudo journalctl -u goldrush-ledger-backup.service -n 30 --no-pager
```

The offsite mirror is pulled by the Mac, where the SSH key and git origin already live. It adds no credential to the droplet:

```bash
node scripts/ledger-backup-pull.mjs --dry-run
node scripts/ledger-backup-pull.mjs
git add artifacts/ledger-backups/
git commit -m "ops: mirror ledger backup"
git push origin main
```

The pull is idempotent and bounded: today's local file skips all network work, SSH gets a five-second connect timeout, and rsync gets a ten-second I/O timeout. Attended still must add this command as a standing fire duty; the repository script does not schedule itself.

This raw private-git mirror is valid only while accounts remain on Cloudflare. Before routing accounts to the droplet, attended must replace it with an encrypted artifact: the account ledger contains email addresses and active session tokens, which must never enter Git history in plaintext.

### Restore drill

The executable local drill creates a ledger through the production storage adapter, writes known rows, invokes the nightly script's own `VACUUM INTO` function, opens the backup through a fresh adapter, and byte-compares every stored row:

```bash
node --test ops/droplet/ledger-backup.test.mjs
```

To restore a real nightly copy on the droplet, first choose the dated file explicitly, verify it, stop both ledger writers, preserve every current SQLite file, install the copy, and restart:

```bash
BACKUP=/opt/goldrush-ledger/backups/ledger-YYYY-MM-DD.db
sudo test -f "$BACKUP"
sudo /root/.nvm/versions/node/v26.4.0/bin/node --input-type=module -e 'import { DatabaseSync } from "node:sqlite"; const db = new DatabaseSync(process.argv[1], { readOnly: true }); const result = db.prepare("PRAGMA integrity_check").get(); db.close(); if (result.integrity_check !== "ok") throw new Error(JSON.stringify(result)); console.log("integrity_check: ok")' "$BACKUP"
sudo systemctl stop goldrush-assay.service goldrush-ledger.service
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
PRESERVE=/opt/goldrush-ledger/pre-restore-$STAMP
sudo install -d -m 0700 "$PRESERVE"
for NAME in ledger.db ledger.db-wal ledger.db-shm; do sudo test ! -e "/opt/goldrush-ledger/$NAME" || sudo mv "/opt/goldrush-ledger/$NAME" "$PRESERVE/"; done
sudo install -m 0600 "$BACKUP" /opt/goldrush-ledger/ledger.db
sudo systemctl start goldrush-ledger.service goldrush-assay.service
curl -fsS 'https://agenttown.app/api/standings?contract=the-claim&epoch=epoch-1-frontier'
sudo journalctl -u goldrush-ledger.service -n 30 --no-pager
```
