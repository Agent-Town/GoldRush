# Assay worker runbook

The assay worker polls the county queue, replays one tape at a time, and posts an exact-match verdict. It runs as a single systemd service; the script does not daemonize itself.

## Install

Install Node.js 20 or newer. Create the `gold-rush` system user, check out the same Gold Rush revision deployed to production at `/srv/gold-rush`, then run from that checkout:

```sh
npm install --no-audit --no-fund
npm run build
sudo install -m 600 /dev/null /etc/gold-rush-assay.env
```

Put only these values in `/etc/gold-rush-assay.env`:

```dotenv
ASSAY_API_BASE=https://gold-rush-3in.pages.dev
ASSAY_WORKER_SECRET=replace-with-the-cloudflare-secret
```

Do not commit that file or print its contents.

## systemd

Create `/etc/systemd/system/gold-rush-assay.service`:

```ini
[Unit]
Description=Gold Rush assay worker
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=gold-rush
WorkingDirectory=/srv/gold-rush
EnvironmentFile=/etc/gold-rush-assay.env
ExecStart=/usr/bin/nice -n 15 /usr/bin/node scripts/assay-worker.mjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable it:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now gold-rush-assay
sudo systemctl status gold-rush-assay
```

## Operate

Read the JSONL log with `sudo journalctl -u gold-rush-assay -f`. Each completed row records its locator, verdict, claimed and replayed hashes, and wall time. API failures record `api_backoff` with the next delay.

```sh
sudo systemctl stop gold-rush-assay
sudo systemctl start gold-rush-assay
sudo systemctl restart gold-rush-assay
```

To rotate the shared secret, stop the worker, replace the Cloudflare Pages secret `ASSAY_WORKER_SECRET`, update `/etc/gold-rush-assay.env`, then start the worker. Pending rows remain queued during the short stop. Confirm the first poll has no `unauthorized` backoff before retiring the old secret from any operator password store.

## Smoke production without writing verdicts

Run from the deployed checkout. This reads the current production queue once, replays its returned rows, prints dry verdicts, and never calls the verdict endpoint:

```sh
sudo systemctl stop gold-rush-assay
sudo sh -c 'set -a; . /etc/gold-rush-assay.env; set +a; exec /usr/bin/nice -n 15 /usr/bin/node scripts/assay-worker.mjs --once --dry-run'
sudo systemctl start gold-rush-assay
```
