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
- RETIRED 2026-08-22 (owner: "retire it"): the February Portal experiment (`/root/code/Portal-main`, the pony-inbox/canvas/wallet landing) — processes stopped, errored PM2 entry deleted, **code left on disk untouched**.

DEPLOY/UPDATE the worker's engine copy: rsync the lean tree (`package*.json vite.config.ts index.html tsconfig* src/ scripts/ assets/ public/ site/`) to `/opt/goldrush/`, then `npm ci` if the lock moved, then `systemctl restart goldrush-assay`. The landing alone: rsync `site/` and nothing else (nginx serves it directly; no restart needed).

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
