# Task assay-cf-lifecycle: assay states + worker endpoints on the standings API (MAIN slot, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; **`specs/agent-play/assay-worker.md` (RATIFIED 2026-08-15 — implement its CF side per Laws + rulings Q1–Q4)**; `functions/api/standings.ts` (`submitScore` `:388`, instant rank `:434-456`, tape OPTIONAL `:408`, `readBoard`, `compareScores`, rate-limit + CORS patterns); `functions/api/_ratelimit.ts`; `scripts/` stats/accounts test harnesses (the F-1229-1 battery that gates `functions/`).

Pre-flight: `git status --short` — no modified TRACKED file outside factory-churn or STOP. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png` — never a STOP; list and proceed. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm install --no-audit --no-fund`; `npm run build` green first.

## Why (owner-ruled launch gate)
Owner 2026-08-15, verbatim: *"the gauntlet verification worker queue has to be done before launch - people will play and submit results."* Verified holes this closes: POST ranks instantly with no replay (`:434-456`); tape optional (`:408`) — the live the-claim board's #3 ranks tapeless. Rulings: Q1 no-tape-no-rank · Q2 pending rows SHOW badged · Q3 rejects removed from ranking + counted, no shaming · Q4 retro-assay existing rows.

## Scope
1. **Assay lifecycle on rows**: new fields `assay: 'pending'|'verified'|'rejected'`, `assayedAt?`, `assayHash?`, `assayReason?`. POST-with-valid-tape → `assay:'pending'`. **POST WITHOUT a tape → stored as unattested but EXCLUDED from rank minting** (Q1: it never enters the ranked slice/`rank:` numbering; keep the row data so a resubmission-with-tape can supersede). Rejected rows likewise excluded from ranking, retained + counted (Q3).
2. **Worker endpoints** (shared-secret header `x-assay-key` checked with a constant-time compare against env `ASSAY_WORKER_SECRET`; absent env → 503 fail-closed; wrong key → 401): `GET /api/standings/assay-queue` → oldest N pending rows across boards (row locator {epochId, contractId, tapeId} + the tape + score); `POST /api/standings/assay-verdict` → body {locator, verdict:'verified'|'rejected', replayedHash, reason?} → updates the row (Q3 semantics on reject). Both rate-limit-exempt for the worker but refuse non-secret callers.
3. **Board exposure (Q2)**: the GET board response carries each row's `assay` state so the client can badge ("pending assay" / verified). No ranking-order change beyond Q1/Q3 exclusions.
4. **Retro-assay (Q4)**: on read (lazy migration — the established pattern in this file), rows lacking `assay`: with a tape → `'pending'`; without → unattested (excluded from ranking per Q1). No data deleted.

## Firewall
Touch ONLY: `functions/api/standings.ts`, new route files under `functions/api/standings/` if the two endpoints need them (mirror `functions/api/multiplayer/*` one-liner pattern), the stats/accounts/standings test harnesses to ADD coverage.
NO changes to: ranking laws beyond the ruled exclusions (`compareScores` untouched); `_multiplayer.ts`; any client `src/**`; the tape schema (`validateTape` shape stays — the 64KB cap stands); CORS allowlists; `wrangler.toml`.

## Self-check (evidence, not vibes)
tsc + build green. The `functions/` battery green (`test:stats`, `test:accounts`, + the standings harness — report counts). MUTATION PROOFS reported: (a) a tapeless POST stores but never receives a rank number; (b) a taped POST lands `pending` and SHOWS with its badge state in GET; (c) a verdict POST with the right key flips it `verified` (and `rejected` drops it from ranking while the row survives); (d) wrong/absent key → 401/503. Zero console errors. No artifact left dirty (GR_GUARD_NO_ARTIFACT honored).
End: READY-FOR-GATES + report: the four mutation proofs, endpoint paths, and the lazy-migration behavior on the 17 live-shaped rows (fixture).

## No-op / honesty guard
If an assay field already exists (grep found none), WRITE WHY and extend. Do NOT weaken `validateTape` or the hash checks to make tests pass; a submission the schema refuses stays refused.
