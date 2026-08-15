# The Assay Worker — server-side replay verification for the public board
### Status: RATIFIED 2026-08-15 (Q1–Q4 answered; build GO: owner verbatim "you can buld the five slices") · OWNER-RULED LAUNCH-GATING (verbatim, 2026-08-15: "the gauntlet verification worker queue has to be done before launch - people will play and submit results")

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
   **→ GATE RED 2026-08-15 (F-ASSAY-1): the instrument is built and DETERMINISTIC (two replays byte-identical: `fnv1a32:29454bf2`), but the live reel does NOT reproduce its recording (`f6390382` secured/w10/280g vs replayed unsecured/w4/30g; the tape contains 3 mid-run restart actions). Live tapes are not yet verifiable proofs. Successor: `tasks/assay-replay-fidelity.md` (measurement matrix → root cause → recorder-or-replay fix). The worker loop (slice 2) is BLOCKED on fidelity, not just the door. Slices 1 + 1b proceed unaffected.
1. **CF assay lifecycle + endpoints** (factory master; functions/ battery green; existing rows default to `pending` — see Q2).
2. **The worker script + tests** (factory master; replay fixture + verdict client mocked; `npm run test:node-guards` green).
3. **Deploy to the box** (owner session: SSH user/key, node, checkout, secret both sides, systemd; runbook committed).
4. **End-to-end on production:** a fresh real submission goes pending → verified by the live worker within minutes; a deliberately corrupted tape goes rejected. Gate: both observed + screenshotted; board badges render. THEN the launch box is ticked.

## Rulings — ANSWERED (owner, 2026-08-15, verbatim)
- **Q1 — tapeless rows: NO RANK, but the tape must save ITSELF.** Owner: *"well, the creation of a tape is still a button press at the end of the human play, so if someone forgets to press it, then they are out? I think we then will have to include logic to save the tape automatically if the run qualifies for the leaderboard."* → Ruling: tape-required-to-rank stands, AND a new slice (1b below) makes the client attach the tape AUTOMATICALLY whenever a run qualifies for the board — forgetting a button can never cost a legitimate rank. The manual button remains as the explicit/manual path.
- **Q2 — pending rows SHOW, badged "pending assay"** (owner: "yes, good idea").
- **Q3 — rejects: removed from ranking + counted, no shaming wall** (owner: "yes").
- **Q4 — the existing 17 rows: RETRO-ASSAY** so the board launches 100% assayed (owner: "yes"). Rows without tapes (e.g. today's tapeless #3) fall under Q1: they unrank until resubmitted with a tape.

## Slice 1b (added by the Q1 ruling) — AUTO-TAPE on qualifying runs
Client-side: when a finished run QUALIFIES for the county board (would enter the top-100 for its contract×party partition — the same `compareScores` the server applies), the standings submission carries the tape automatically — no button press required. Bounds: the existing 64KB tape cap and the existing schema (`validateTape`) are unchanged; a run that does not qualify keeps today's behavior (manual button only); the player-facing copy stays honest about what is sent (anonymous input-log, no personal data). Gate: an e2e where a qualifying run posts WITHOUT the button and its row carries a reel handle; a non-qualifying run posts nothing automatically.

## Integration map
Touches: `functions/api/standings.ts` (+ its tests), new `scripts/assay-worker.mjs` (+ test), board badge in the client standings UI, `docs/` runbook. Untouched: ranking laws, the sim, gr-sim's contracts, skill.md's door, multiplayer, all gameplay.
