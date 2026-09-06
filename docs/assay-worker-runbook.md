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

## Two replay engines, one worker

`scripts/assay-replay.mjs` chooses the engine that can reproduce the claim, so what you see in the log differs by row:

- **Browser reels** (a person played them) boot a headless Chromium against a Vite dev server and replay the recorded per-tick input. These are the slow rows; the first one on a cold box also pays for the whole game transforming.
- **Door reels** (an agent played them through `gr-sim`, so the input log carries `agent_orders`) replay through `HeadlessContractSim` in Node — no browser, no port, a few seconds each. Their log line carries `"engine":"headless-contract-sim"`.

The split is not a shortcut: the two engines do not agree on the world tick for tick, so replaying a door reel in the browser would reject honest runs. If a door reel ever reports a browser-shaped failure (a port bind, a Chromium launch), the routing is broken — that row was recorded by the other engine.

## What the board's gold means

**A standing's gold is the purse held at the secure tick, as the county replays it** (owner ruling 2026-09-06, "fix the board and tape gold issue"). That is the same quantity `gr-sim`'s outcome reports and the same one the worker's outcome comparison already verifies, and it is the only quantity that could be agreed: the outcome's gold sits inside the event-log hash, so no reel could be taught to declare anything else without moving every pinned hash.

Each verified verdict carries a `securedSnapshot` — the standing measured at the secure tick — and the county publishes it over the row. That is deliberate: a rider who banks and then rides on into overtime is ranked on the claim they won, not on the ledger they finished with. What it must never do is substitute a different *quantity* for the same instant. Until 2026-09-06 the snapshot reported the run's lifetime *panning* rather than the purse held, so a Mare Claim reel that banked 60 gold appeared on the board at 1180, Moth Season's 200 at 530, Relay Rush's 200 at 870 (F-HEAT12-5). Riders quoted the reel, the board quoted itself, and nobody could say which was the standing.

The verdict endpoint now reads score and snapshot as two measurements of one replay. The secure tick can never follow the terminal tick, and when the two ARE the same tick — the rider banked and stopped, which is most rows — their gold must agree. A disagreement is recorded as `assay: rejected` with `assayReason: score_mismatch`, the row leaves the ranked board, and the rider reads the reason on their own slip (`GET /api/standings?epoch=…&contract=…&verdict=<reel id>`). The endpoint still answers the worker `200`, but its body reports `assay: "rejected"` and `reason: "score_mismatch"` rather than the verdict the worker sent, so the divergence shows up in the operator log instead of only in the demoted row.

If `score_mismatch` appears in the log, nothing about it is a transport problem: the reel replayed and its hash matched. Either the instrument is reporting the snapshot at the wrong tick or in the wrong quantity, or the submitting door and the assaying engine disagree about what "gold" is. `scripts/board-tape-gold.test.mjs` replays the three heat-12 reels through the real seam and pins the invariant; run it before touching either side.

## Operate

Read the JSONL log with `sudo journalctl -u gold-rush-assay -f`. Each completed row records its locator, verdict, claimed and replayed hashes, and wall time. API failures record `api_backoff` with the next delay.

```sh
sudo systemctl stop gold-rush-assay
sudo systemctl start gold-rush-assay
sudo systemctl restart gold-rush-assay
```

To rotate the shared secret, stop the worker, replace the Cloudflare Pages secret `ASSAY_WORKER_SECRET`, update `/etc/gold-rush-assay.env`, then start the worker. Pending rows remain queued during the short stop. Confirm the first poll has no `unauthorized` backoff before retiring the old secret from any operator password store.

## Lineage re-assay: when a contract's composition changes

ADR-004 (owner ruling 2026-09-06, verbatim: *"my initial idea was to have seasons and change things
from season to season to stay fair to the participants, we are now in the early release phase, we can
act freely"*). Until the first season boundary, the boards carry only standings that replay under the
current engine. When a contract's composition moves after riders verified rows on it, those rows are
put back through the assay: the ones that replay stay verified with their original first-secure date,
the ones that do not are **retired** with a lineage reason and kept in the almanac. Nothing is deleted.

### The verb

```
POST /api/standings/reassay
x-assay-key: <ASSAY_WORKER_SECRET>
content-type: application/json

{ "epochId": "<epochId>", "contractId": "<contractId>", "reason": "<why, <=256 chars>" }
```

| | |
| --- | --- |
| Auth | the assayer's own shared secret, exactly as `/api/standings/assay-verdict`. No secret configured answers 503; a wrong key answers 401. |
| Rate limit | none. The submission limiter lives in the POST-a-standing path only. |
| Effect | every `verified` row of that contract with a reel flips to `pending`, gains a `lineage` mark carrying the reason, and re-enters the assay index. Scores, party, stack and `submittedAt` are untouched. |
| Response | `{ ok, epochId, contractId, requeued, requeuedAt }` — `requeued` is how many rows were flipped. |
| Idempotent | a second call while the assay is outstanding finds no `verified` rows, answers `requeued: 0` and writes nothing. A call *after* the assayer has re-verified rows will legitimately re-queue them again; that is the verb working, not a loop. |
| Refusals | `bad_reassay` (400) for an unknown contract, a missing or over-long reason, or any extra key. |

### What the assayer then does

The worker's vocabulary is unchanged — it still posts only `verified`, `rejected` and `unassayable`,
so the door and the droplet need no lockstep deploy. The county decides what a verdict *means* for a
re-queued row:

| Worker posts | Row was marked | County records |
| --- | --- | --- |
| `verified` | lineage | `verified`, same `submittedAt`, new `assayedAt`, mark cleared |
| `rejected` | lineage | `retired`, reason `lineage: recorded under <tape engine hash>, no longer replays under <current engine hash>`, mark kept |
| `unassayable` | lineage | `unassayable`, mark kept — an instrument failure proves nothing about replayability, so a later sweep can ask again |
| anything | not marked | unchanged behaviour |

A `retired` row leaves the ranked board and the rank mint, is counted in the board response's
`retiredCount`, stays in storage, and keeps answering `?reel=<id>` (WATCH) and
`?verdict=<id>` (the assay slip, which also serves the `lineage` cause). First-secure receipts in
`assets/rotations/winnability-receipts.json` are history and never move (F-RECEIPTS-1).

Retirement runs alongside the era-5 replayable-board law: `retiredCount` counts both a row retired by
this rule and a row whose reel sits outside the current era's pins.

### Finding the contracts that need it

```sh
node scripts/assay-lineage-sweep.mjs                    # dry: prints the plan, writes nothing
node scripts/assay-lineage-sweep.mjs --contract e3-moth-season
ASSAY_WORKER_SECRET=... node scripts/assay-lineage-sweep.mjs --commit   # calls the verb
```

The sweep reads `assets/engine-era.json`, finds each pin whose `cause` text names a contract, and asks
the door for that contract's verified rows and their reels' recorded engine pins. A contract with any
verified row recorded *before* its naming pin is a candidate. It is dry unless `--commit` is passed,
and `--commit` requires `ASSAY_WORKER_SECRET`.

The trigger is deliberately over-inclusive: a pin whose cause names a contract for an innocent reason
costs one extra replay per row and nothing else, because the retirement is decided by the replay and
never by the pattern match. A row that still replays is verified again with the date it earned.

The sweep is **not** wired into `scripts/deploy.sh`. It is an operator step, run from the deployed
checkout after `ASSAYER SYNCED` appears in the deploy log.

## Smoke production without writing verdicts

Run from the deployed checkout. This reads the current production queue once, replays its returned rows, prints dry verdicts, and never calls the verdict endpoint:

```sh
sudo systemctl stop gold-rush-assay
sudo sh -c 'set -a; . /etc/gold-rush-assay.env; set +a; exec /usr/bin/nice -n 15 /usr/bin/node scripts/assay-worker.mjs --once --dry-run'
sudo systemctl start gold-rush-assay
```
