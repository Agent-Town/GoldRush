# Task door-epic-envelope-v2: the whole envelope, at the width the stops measured — duration + bytes + entries + THE LEDGER'S OWN READER (lane-c, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; **tasks/door-epic-envelope.md (the v1 master — its ENTIRE scope, laws, derivations, gate and honesty guard are INHERITED VERBATIM; this v2 exists only to widen the firewall per its own stop)**; the s2308 stop (the third wall, named precisely: `server/ledger/serve.mjs:64-71` `requestBody()` retains chunks only up to 256 KiB, so the SQLite arm answers HTTP 400 `bad_json` to the 463,569-byte compact Baron tape BEFORE `functions/api/standings.ts` validation ever runs; the KV arm passed 171 provisional checks); the s2302 stop (the entry wall: `MAX_PLAYBOOK_INTENTS` 2,000 vs 3,294, four sites); artifacts/gauntlet-heat6-20260825/ (the banked ×2 Baron secures — still the gate).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (two honest stops enumerated the walls; the third wall was the ledger's own front door)
The Baron's ×2 proof remains banked. v1's stop found the last constraint outside its own firewall: the L1 service's HTTP reader caps bodies at a hardcoded 256 KiB. The county wants ONE maximum-lawful-request-size law that every layer derives from — never another independent number.

## Scope (v1's scope items 1-7 inherited verbatim, plus:)
8. **The ledger reader derives, never invents**: `server/ledger/serve.mjs` `requestBody()` cap = the SAME maximum-lawful-request derivation as the outer standings body cap (export the constant/function from the validation module; the reader imports it — one law, two consumers). The focused ledger-server suite (`server/ledger/serve.test.mjs` or its sibling) gains the arm: a body at the largest lawful reel + overhead is READ; beyond it refused with an honest JSON error (not a connection drop).
9. **The nginx statement** (inherited from v1 item 2) now includes the measured largest lawful request so attended can set `client_max_body_size` in one line if needed — state it either way.

## Firewall (v1's, WIDENED exactly as the stop prescribed)
Touch ONLY: functions/api/standings.ts, src/game/RunTape.ts (door sites only), src/playbook/PlaybookFormat.ts (the constant split only), **server/ledger/serve.mjs (the requestBody cap derivation only) + its focused suite**, public/skill.md if it names any number (+ guards re-pinned), the suites, BACKLOG row. NO sim mechanics, no ranking, no worker logic, no nginx edits.

## Self-check (v1's verbatim, plus)
The ledger-server suite green including the new reader arm; **THE GATE: both banked Baron tapes SUBMIT through the LOCAL full flow (service + worker) and poll `verified` — quote both slips.** End: READY-FOR-GATES + report: v1's report items + the one-law derivation as shipped + the nginx line verdict.

## No-op / honesty guard
v1's verbatim: if a FIFTH wall emerges, STOP and enumerate it with numbers in the same report — the county wants the complete envelope, and three stops' worth of walls says the enumeration is nearly done.
