# Task assay-worker-loop: the assayer himself — poll, replay, verdict (lane-d, prefix "feat:", QUEUE ONLY AFTER assay-replay-fidelity MERGES)

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; **`specs/agent-play/assay-worker.md` (RATIFIED — this is slice 2, the worker loop)** + `specs/agent-play/tape-contract.md` (v2, what verified means); the MERGED pieces this composes: `scripts/assay-replay.mjs` (the instrument — reel JSON in, `{eventLogHash, outcome}` out; v2-aware after assay-replay-fidelity), the assay endpoints from `assay-cf-lifecycle` (`GET /api/standings/assay-queue`, `POST /api/standings/assay-verdict`, `x-assay-key` header — read the landed code in `functions/api/standings.ts` for the EXACT request/response shapes, do not trust this summary); `scripts/gr-sim.test.mjs` (test conventions).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): ahead commits already on main = SAFE DUPE → `git checkout -B lane/lane-d main && git clean -fd`, PROCEED; STOP only on un-merged ahead content or foreign uncommitted edits. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1) + FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` never a STOP; modified tracked `src/**`/`scripts/**`/`e2e/**`/`tasks/**`/`specs/**`/`reviews/*.md` still STOP. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Why (the program's slice 2 — owner-ruled launch gate)
The instrument replays tapes faithfully (post-fidelity); the endpoints hold pending rows. The missing piece is the ASSAYER: a resident worker that pulls pending rows, replays each tape, and posts the verdict. Owner rulings bound it: Q2 pending rows show badged until verified; Q3 rejects removed from ranking + counted; season roll means it serves the CURRENT season. Launch scale is tens of submissions — one row at a time, niced; the thousands-scale design stays banked.

## Scope
1. **`scripts/assay-worker.mjs`** — a single-process poll loop: every ~15s, `GET assay-queue` (secret from env `ASSAY_WORKER_SECRET`; base URL from env `ASSAY_API_BASE`) → for each returned row (oldest first, ONE at a time): write the tape to a temp file → run the instrument (`scripts/assay-replay.mjs`) → compare `{eventLogHash, outcome}` to the row's claim → `POST assay-verdict` (`verified` on exact match; `rejected` with a precise reason on mismatch, instrument failure, or malformed/legacy tape — fail-honest, never skip silently). Structured JSONL log to stdout (one line per row: locator, verdict, hashes, wallMs). Exponential backoff on API failure (cap ~5 min), clean SIGTERM shutdown mid-row (finish or abandon-without-verdict, never a half-posted verdict).
2. **Ops shape**: no daemonization in-script (systemd owns that later); a `--once` flag draining the queue once then exiting (what tests and the DO-box smoke run use); `--dry-run` printing verdicts without POSTing.
3. **Tests** — `scripts/assay-worker.test.mjs` (singular convention, WIRED into `test:node-guards` — the F-1771-1 lesson): mock the two endpoints + stub the instrument; prove verified/rejected/mismatch/instrument-crash/backoff/`--once`/`--dry-run` paths. No live network in tests.
4. **The runbook** — `docs/assay-worker-runbook.md`: install on the box (node ≥20, checkout, `.env` with the two vars), the systemd unit text (`nice -n 15`, `Restart=always`), rotate-secret steps, read-the-log, stop/start, and the local smoke command (`--once --dry-run` against production).

## Firewall
Touch ONLY: new `scripts/assay-worker.mjs`, new `scripts/assay-worker.test.mjs`, `package.json` (ONLY wiring the test into `test:node-guards`), new `docs/assay-worker-runbook.md`.
NO changes to: `scripts/assay-replay.mjs` (consume as-is; if its interface is insufficient, STOP and report), `functions/api/**` (endpoints as landed; mismatches = STOP and report), the sim, any client code, secrets in any tracked file (env only — the repo never holds the key).

## Self-check
tsc + build green. `npm run test:node-guards` green INCLUDING the new test (report the caller-audit line). A local end-to-end smoke REPORTED (not faked): `--once --dry-run` against a locally-served functions dev (or a fully mocked pair if wrangler-dev is unavailable — say which) processing one pending fixture row to a `verified` dry verdict. Zero console errors. Adjacent `task-025`/`m1-01`/`m2-01` unmodified-green.
End: READY-FOR-GATES + report: the loop's verdict table from the smoke, the backoff proof, the runbook path.

## No-op / honesty guard
If a worker loop already exists (grep found none), extend it. The forbidden green: a verdict path that marks `verified` on anything but an EXACT hash+outcome match — when in doubt, `rejected` with the reason; the county can re-assay, but a false VERIFIED poisons the board.
