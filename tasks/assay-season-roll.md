# Task assay-season-roll: the county board rolls to a new, fully-assayed season; season one archives (MAIN slot, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; **`specs/agent-play/tape-contract.md` §"The legacy board — RULED: SEASON ROLL" (the owner ruling this implements, verbatim inside)**; `functions/api/standings.ts` (the board KV keys, `readBoard`, the assay lifecycle just landed by `assay-cf-lifecycle`); how the client reads boards (`src/encyclopedia/reader.ts` standings fetches, the standings POST in `src/game/Game.ts` — find it by CONTENT, `grep -n "api/standings" src/game/Game.ts`, since the s2056 re-measure found the previously-cited `:6515` had drifted to `:6545`); the SEA season-chronicle surfaces (grep `season` in `src/` + `specs/` — the story goal's season page machinery) for naming/display conventions.

Pre-flight: `git status --short` — no modified TRACKED file outside factory-churn or STOP. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png` — never a STOP; list and proceed. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm install --no-audit --no-fund`; `npm run build` green first.

## Why (owner ruling, 2026-08-15, verbatim)
*"I think this kind of calls for a next season? Because we have to test the taping anyways again."* — v1 tapes are structurally unverifiable (no `runStart`; see the ratified tape contract), so retro-assay of the 17 live rows is impossible honestly. The ruling: ARCHIVE the pre-assay board as the closed first season (read-only history — RETENTION LAW, nothing deleted), and open a NEW season whose board admits only v2-assayed rows. The new season's first submissions are the live shakedown of v2 taping.

## Scope
1. **Season-scoped boards**: the standings KV keys gain a season dimension (current season = a named constant, e.g. `s2`; the pre-roll keys become season 1). `readBoard`/`submitScore` operate on the CURRENT season. NO data migration that rewrites season-1 rows — they stay at their existing keys, read-only.
2. **The archive door**: `GET /api/standings?season=1` (or equivalent param) serves the archived season-1 board read-only — rows, reels, and their pre-assay reality plainly labeled in the payload (`season:1`, `assayEra:false`). POST to an archived season is refused (`season_closed`).
3. **The current season starts CLEAN**: fresh boards, and (already law via `assay-cf-lifecycle`) v2-tape-required-to-rank + pending→verified lifecycle. Verify the two compose: a v1-tape POST to the current season stores-but-never-ranks; a v2 POST lands `pending`.
4. **Client surfaces**: wherever the client shows the county board, it shows the CURRENT season by default and can reach the season-1 archive (a modest "first ledger" link/tab in the existing standings UI — follow the reader's existing view conventions; the season-chronicle story surfaces stay untouched, they already know how to tell a season's story).
5. **e2e + battery**: functions battery (`test:stats`/`test:accounts`/standings harness) green with season coverage added: current-season POST/GET round-trip; archive GET labeled + POST refused; season-1 fixture rows still served. Client e2e: board shows current season; archive reachable.

## Firewall
Touch ONLY: `functions/api/standings.ts` (+ its route files/tests), the client standings read/display surfaces (`src/encyclopedia/reader.ts` board views + wherever the board renders), new e2e/test coverage.
NO changes to: the assay lifecycle semantics just landed (build ON them); `validateTape`/the tape contract; ranking laws within a season; the SEA chronicle content; deleting or rewriting ANY season-1 row (RETENTION LAW); `wrangler.toml`; multiplayer.

## Self-check
tsc + build green. Functions battery green (report counts). Mutation proofs: (a) current-season board starts empty in a fresh fixture; (b) season-1 fixture rows serve read-only with `season:1` labeling and POST refused; (c) v2 POST → `pending` on current season; v1 POST → stored, never ranked. Client e2e green desktop+mobile at `--workers=1`; adjacent `task-025`/`m1-01`/`m2-01` unmodified-green; zero console/page errors. Screenshot of the board's current-season view + the archive view → `artifacts/assay-season-roll/`.
End: READY-FOR-GATES + report: the season key shape chosen, the four mutation proofs, and the client surface placement.

## No-op / honesty guard
If a season dimension already exists on the county board keys (grep first — the BENCH has era stamps, the county board may not), WRITE WHY and extend rather than duplicate. Do not invent season NAMES/lore — the constant is an id; the story belongs to the chronicle machinery and the owner.
