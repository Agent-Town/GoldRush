# The Assay Worker — server-side replay verification for the public board
### Status: DRAFT 2026-08-15 · attended · OWNER-RULED LAUNCH-GATING (verbatim, 2026-08-15: "the gauntlet verification worker queue has to be done before launch - people will play and submit results")

## Why (owner rulings + verified holes)
Launch means strangers posting results. Verified today (`functions/api/standings.ts`): POST ranks a row IMMEDIATELY into the KV top-100 (`:434-456`); the submitted tape is shape-checked (`validateTape`, inputLog-hash match `:415`, `tapeMatchesScore` `:418`) and STORED (`:448`, served via `?reel=`) but **never replayed**; a row may omit the tape entirely (`:408-409` — only the hash is required) and still rank. Prior owner rulings bank the design: replay-truth ("a claimed secure is not a county secure until it reproduces byte-identically"), and the DigitalOcean agenttown box as the worker's home ("I am running a server for agenttown.app on DigitalOcean already, we can use that box"). The county's voice: submissions await **assay**; the worker is the county assayer.

## Laws
1. **Replay-truth**: a row is VERIFIED only when its tape replays headless to the same outcome — same `eventLogHash`, same secured/waves/gold — through the real sim door. No shortcut heuristics.
2. **The tape is the claim**: to be assayable a row must carry its tape. (Q1 below: whether tapeless rows may rank at all.)
3. **Ranking stays outcome-based and species-blind** (AP-06/AP-15 untouched); assay adds a TRUST state, never a new ranking axis.
4. **Secrets never land in the repo**: the worker↔API shared secret lives in CF env + the box's env file only.
5. **Fail-honest**: a replay that cannot run (sim version drift, malformed tape) REJECTS with a recorded reason — never silently passes, never hangs the queue.

## Architecture (three parts, smallest that satisfies the law)
- **CF side (Pages Functions, factory-buildable):** rows gain `assay: 'pending' | 'verified' | 'rejected'` (+ `assayedAt`, `assayHash`). Two authenticated endpoints (worker secret via header): `GET /api/standings/assay-queue` → oldest pending rows (epoch/contract/row key + tape); `POST /api/standings/assay-verdict` → sets verified/rejected (+ reason, replayed hash). Board GET exposes the state so the client can badge rows ("pending assay" / verified check). Gated by `test:stats`/`test:accounts` (the F-1229-1 battery).
- **Worker side (in-repo script, factory-buildable):** `scripts/assay-worker.mjs` — poll loop (~15s, niced): fetch queue → for each row, replay the tape's `inputLog` through the headless door (the crosswire pattern from the heat-3 examiner: sim views out / recorded orders in, `--contract/--seed/--difficulty` from the row) → compare `eventLogHash` + outcome → POST verdict. Structured JSONL log, exponential backoff on API failure, one row at a time (launch scale is tens, not thousands — the "thousands" scaling was designed and stays banked for later).
- **The box (owner + attended, with the offered SSH access):** node ≥20, a checkout of the repo (git pull from origin, or rsync from the Mac if the box can't reach it), `.env` with the secret, a systemd unit (`nice -n 15`, restart=always). A one-page runbook lands in `docs/` (install, rotate secret, read the log, stop/start).

## Slices (each ends in a checkpoint + gate)
0. **Prove the replay door (the load-bearing unknown):** take a REAL submitted tape off the live board (`?reel=`) — rob's the-claim row exists — and replay it headless to its recorded outcome. Gate: hash + outcome match, twice. If the browser-tape→headless-replay path needs an adapter, THIS slice builds it; nothing else proceeds until this gate is green.
1. **CF assay lifecycle + endpoints** (factory master; functions/ battery green; existing rows default to `pending` — see Q2).
2. **The worker script + tests** (factory master; replay fixture + verdict client mocked; `npm run test:node-guards` green).
3. **Deploy to the box** (owner session: SSH user/key, node, checkout, secret both sides, systemd; runbook committed).
4. **End-to-end on production:** a fresh real submission goes pending → verified by the live worker within minutes; a deliberately corrupted tape goes rejected. Gate: both observed + screenshotted; board badges render. THEN the launch box is ticked.

## Ratification questions (owner — batched, each with a recommendation)
- **Q1 — tapeless rows:** may a row without a tape rank at all post-launch? *(Recommend NO — no tape, no assay, no rank; the tape cap is 64KB and every legit client already sends one.)*
- **Q2 — pending visibility:** do pending rows show on the board (badged "pending assay") or hold off-board until verified? *(Recommend SHOW badged — submitters see themselves instantly, trust arrives minutes later; matches the county's "posted, then assayed" fiction.)*
- **Q3 — rejects:** silently removed, or kept as a tombstone ("failed assay") for transparency? *(Recommend remove from ranking + a count in the office stats; no public shaming wall.)*
- **Q4 — existing 17 rows:** grandfather as verified (they predate the law) or assay them retroactively? *(Recommend retro-assay — they all have tapes or die honestly; the board should launch 100% assayed.)*

## Integration map
Touches: `functions/api/standings.ts` (+ its tests), new `scripts/assay-worker.mjs` (+ test), board badge in the client standings UI, `docs/` runbook. Untouched: ranking laws, the sim, gr-sim's contracts, skill.md's door, multiplayer, all gameplay.
