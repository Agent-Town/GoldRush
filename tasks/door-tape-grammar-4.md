# Task door-tape-grammar-4: the last two ids the door judges looser than the client (research_pick, context_action targets) join the client-judged set, and the stale comment above validateTape is corrected

⛔ GATE-SIDE HOLD: run by the attended session as an Opus 5.5 implementer at maximum effort (the grammar-3 agent continued); not for a Codex lane. Follows `door-tape-grammar-3` (F-DTG3-1, F-DTG3-5). Same worktree `/Users/robin/Claude/Projects/wt-dtg3`, a NEW branch stacked on grammar-3: `git checkout -b fix/door-tape-grammar-4` from `fix/door-tape-grammar-3` at `0515f4b0d`.

READ FIRST: AGENTS.md; `artifacts/door-tape-grammar-3/report.md` (your own: `CLIENT_JUDGED_ACTIONS`, `clientRefusesAction` at `standings.ts:1786-1795`, the 79-row door-versus-client probe with its 6 remaining door-looser rows); `functions/api/standings.ts` `validateTape` and the comment above it (`:1573-1577`, stale); `src/game/RunTape.ts` (the client's normalizer for `research_pick` and `context_action` targets).

Pre-flight: the worktree clean apart from factory churn (`logs/**`, `artifacts/**`, any `.png`; F-1407-1: list and proceed); `git log fix/door-tape-grammar-3..HEAD` empty on the new branch. Node 26 first on PATH.

## Why (F-DTG3-1 and F-DTG3-5, measured 2026-09-25)
Six rows of the door-versus-client probe remain door-looser: `research_pick` ids and `context_action` target ids that trim to nothing or name no building are accepted by the door and refused by the client, so such a reel is ranked but cannot be loaded. The cure is one line in `CLIENT_JUDGED_ACTIONS` plus the rows that prove it. The comment above `validateTape` still describes the pre-grammar door.

## Scope
1. **RED first:** rows in `scripts/test-standings.mjs` posting the six shapes through the real handler: accepted on the base (paste), refused `400 bad_payload` at the tip; controls (a valid research id, a valid target) still accepted; a stored row of each shape retired at read, not dropped (manufactured, as in grammar-3).
2. **The set:** the two verbs join `CLIENT_JUDGED_ACTIONS`; nothing else moves; a mutation check per shape; the probe re-run shows door-looser rows 6 to 0 and door-tighter unchanged.
3. **The comment** above `validateTape` describes the door as it is now (the client-judged set and the retirement rule).
4. **Report** `artifacts/door-tape-grammar-4/report.md`: RED, GREEN, counts, the probe before and after.

## Firewall
Touch ONLY: `functions/api/standings.ts` (`CLIENT_JUDGED_ACTIONS`, the comment above `validateTape`), `scripts/test-standings.mjs`, `artifacts/door-tape-grammar-4/**`. NO changes to: `src/**`, the handler's entry points and env types, other doors, `server/**`, the ledgers.

## Self-check (evidence, not vibes)
tsc and build green; `node scripts/test-standings.mjs` green with counts; under the drain lock the node-guards battery and the three functions gates; the same-game audit unchanged. Path-scoped `fix:` commits ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; no em or en dashes; no network; Bash heredoc for the report if the Write tool refuses. If you find yourself about to exit without changes, WRITE WHY into the report first.
End: READY-FOR-GATES + RED and GREEN + counts + the probe before and after.
