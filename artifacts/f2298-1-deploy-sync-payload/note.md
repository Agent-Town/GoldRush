# F-2298-1 — the freshly-landed assayer deploy leg pushes 7.7 GB and a live secret to the droplet

**Measured s2298, 2026-08-25, on a dry board. READ-ONLY: nothing was deployed, no ssh was
opened to the box, `scripts/deploy.sh` was NOT edited.**

## 0. Why this fire looked here at all

`1325cda49` (attended, 12:21:18, **five minutes before this fire started**) landed a 14-line
assayer leg in `scripts/deploy.sh` — the F-2297-1(b) cure, "automate the worker deploy so
staleness self-heals". It is **one commit old and has never been executed by anything**.
DEPLOY LAW makes it run automatically after the next gameplay-affecting merge, and two
heat-6 r2 runs were live on lanes b/c while this was written — so its first execution is
imminent, not hypothetical.

s2297 flagged two concerns at its exit without measuring them ("it hardcodes a droplet IP,
and it runs `rsync -az --delete` over `/opt/goldrush/`"). This note measures them.

## 1. What the leg does

```sh
rsync -az --delete --timeout=60 \
  --exclude .git --exclude node_modules --exclude worktrees --exclude artifacts \
  --exclude logs --exclude tasks --exclude .claude --exclude .wrangler --exclude dist \
  ./ root@<droplet>:/opt/goldrush/
```

`deploy.sh:6–7` does `ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"`,
and the only other `cd` (`:65`, `$BUDGET_CWD`) is **inside a subshell**, so at the rsync the
cwd is the repo root and `./` is the whole repo. Verified by reading, not assumed.

## 2. The divergence: the runbook prescribes an ALLOWLIST, this is a DENYLIST

`docs/ops/agenttown-server.md:40` states the prescribed sync in the box's own runbook:

> DEPLOY/UPDATE the worker's engine copy: rsync the lean tree (`package*.json vite.config.ts
> index.html tsconfig* src/ scripts/ assets/ public/ site/`) to `/opt/goldrush/`

Nine named paths. The new leg instead sends **everything except nine names**. Measured at the
repo root:

| | |
|---|---|
| top-level entries the rsync WOULD send | **165** |
| of those, outside the runbook allowlist | **155** |
| extra payload beyond the lean tree | **7,729.9 MB (7.73 GB)** |

Largest extras:

| size | entry | tracked? |
|---|---|---|
| 3,281.6 MB | `e1-review-video` | **gitignored local debris** |
| 1,576.6 MB | `gate-s1662` | **gitignored local debris** (a stale gate worktree; its `.git` is a *file*, so `--exclude .git` removes the gitlink and sends the 1.58 GB tree anyway) |
| 1,449.8 MB | `reviews` | tracked (3,130 files) |
| 656.3 MB | `env` | tracked (5) + the gitignored `.venv` |
| 378.5 MB | `marketing` | tracked (146) — includes `marketing/outbox`, unpublished owner-facing drafts |
| 337.6 MB | `bench` | tracked (239) |
| 12.4 MB | `STATUS.md` | tracked |

**4.86 GB of the payload is gitignored local scratch that exists only on Robin's disk.**

## 3. The secret

`.env.local` — **428 B, mode 600, gitignored, untracked** — is **not** in the exclude list, and
`rsync -a` sends dotfiles. It would land at `/opt/goldrush/.env.local` on the production box.

This is the file `docs/ops/agenttown-server.md:42` names:

> Cloudflare token (id c903a069…, in .env.local — **value never committed**)

and it contradicts the stated design principle of the ledger box, recorded in the LB-01 duty
in `scripts/fire.md`: *"origin IS the offsite copy (the l4 design: **no new secrets on the
box**)"*.

The box does not need it: per the runbook the services take their environment from
`/etc/goldrush-assay.env` and `/etc/goldrush-*` (`:37`, `:60`), which is outside the synced
tree — the leg's own `sed -i` targets `/etc/goldrush-assay.env`, not anything under
`/opt/goldrush/`.

## 4. Severity, stated honestly and deliberately not inflated

- **The ledger is NOT at risk.** The most severe reading of s2297's `--delete` flag is
  **refuted**: `scripts/ledger-backup-pull.mjs:7` puts the county ledger at
  `/opt/goldrush-ledger/backups`, and the restore runbook (`:100`–`:108`) confirms the live DB
  is `/opt/goldrush-ledger/ledger.db` — a **sibling** of the synced directory, not inside it.
  No rsync under `/opt/goldrush/` can touch it. Banked so the next fire does not re-take it.
- **`node_modules` is NOT at risk.** rsync protects excluded names from `--delete` by default
  (no `--delete-excluded` is passed), so the box's git-less dependency tree survives.
- **The leg gets one real thing RIGHT, and it should not be lost in a rewrite:** `server/` is
  tracked, is what `goldrush-ledger.service` runs (`WorkingDirectory=/opt/goldrush`,
  `server/ledger/serve.mjs`, runbook `:60`) — and is **missing from the runbook's own
  line-40 allowlist**. The denylist form syncs it. Any allowlist cure must keep it.
- **What is genuinely wrong:** (a) a live API token is copied to a public-facing box;
  (b) 7.73 GB per deploy, 4.86 GB of it local debris, against a `--timeout=60` rsync — if the
  droplet's disk cannot hold it the transfer dies partway and the leg's own message applies:
  *"droplet may be mixed-state — run the runbook sync by hand before trusting fresh verdicts"*.
- **Fail-open is correctly implemented and is not the defect.** All three arms `note` which
  path they took (SYNCED / FAILED mid-step / NOT SYNCED). That is the declaration discipline
  this streak has been landing everywhere else, and it is right.

## 5. NOT VERIFIED — stated as such

The box's actual tree under `/opt/goldrush/` was **not enumerated**: that needs ssh to
production, which is an outward-facing act this fire has no authorization for. So the full
`--delete` blast radius — anything hand-placed on the box, not in the repo, and not
exclude-protected — **remains UNVERIFIED**. It cannot be closed from this disk.

## 6. Why no cure was authored

1. **§7.3 routes any deployment act to the OWNER** — F-2297-1's own restraint note says
   exactly this, and this leg *is* F-2297-1 option (b).
2. **Attended landed it five minutes before this fire started** and may still be iterating;
   two writers on one surface is Mistake #6 (*"when unsure whether something is live, wait one
   fire cycle — it is never worth the untangle"*).
3. **The obvious cure is subtly wrong, which is itself the argument for restraint.** Switching
   to the runbook's allowlist while keeping `--delete` would delete `/opt/goldrush/node_modules`
   on a git-less box — because with an explicit source list `node_modules` is neither in the
   source nor exclude-protected. A fire that "fixed" this without noticing would break the
   assayer that the attended session just built to unblock launch week.

## 7. Recommended shapes (for the owner / attended, not executed here)

- **Minimum, and it cannot break the sync:** add `--exclude .env.local`. Strictly subtractive,
  removes the secret, changes nothing the box needs.
- **Full:** the runbook allowlist **plus `server/`**, retaining `--exclude node_modules
  --exclude dist --exclude .git` so `--delete` cannot strip the box's dependency tree:

```sh
rsync -az --delete --timeout=60 --exclude node_modules --exclude dist --exclude .git \
  package.json package-lock.json vite.config.ts index.html tsconfig*.json \
  src scripts assets public site server root@<droplet>:/opt/goldrush/
```

- **Also worth a word:** the second `ssh` (the `sed`+`systemctl restart`) carries `BatchMode`
  but **no `ConnectTimeout`**, where the probe ssh has `ConnectTimeout=8`. A box that accepts
  the TCP connection and then stalls hangs the deploy with no bound, inside a fire's budget.
- **Structural:** a denylist over a repo root rots by construction — every new top-level
  directory silently joins the payload. That is F-2204-1's class on a deploy path: the
  corpus is defined by what it excludes, and nothing declares what it actually sent.

## 8. Reproduce

Local, read-only, ~3 s. Scripts were written to `/tmp` per F-1665-1:

```sh
node /tmp/s2298-payload.mjs     # tracked/ignored status of the payload
# the size table: du -sk each top-level entry not in the runbook allowlist,
# with the exclude set taken verbatim from `git show 1325cda49 -- scripts/deploy.sh`
```
