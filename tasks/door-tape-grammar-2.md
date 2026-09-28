# Task door-tape-grammar-2 (HOTFIX continuation, P0): the county door accepts the three action verbs the client has written for weeks (prospector_dispatch, context_action recover, multiplayer agent_orders), so a reel with a dispatch is no longer refused

⛔ GATE-SIDE HOLD: run by the attended session as an Opus 5.5 implementer at maximum effort; not for a Codex lane. Continuation of `door-tape-grammar-1` (F-DTG1-1). Same worktree, a NEW branch stacked on the hotfix: `/Users/robin/Claude/Projects/wt-dtg1`, `git checkout -b fix/door-tape-grammar-2` from `fix/door-tape-grammar-1` at `0cf8e12f5` (the drain lands grammar-1 first; this branch merges clean on top).

READ FIRST: AGENTS.md; `artifacts/door-tape-grammar-1/report.md` (your own: the method, the RED-first rows with the real `RunTapeRecorder`, the mutation check, F-DTG1-1 to F-DTG1-8); `functions/api/standings.ts` `validTapeAction` and `tapeGrammarRefusal` (the verb allowlist and the retirement walk); `src/game/Game.ts:8256-8262` (`prospector_dispatch`, written on every solo dispatch), `:5727` (`context_action recover`), the multiplayer `agent_orders` writer (find it; the client accepts it in `RunTape.ts`'s action validator); `src/game/RunTape.ts` (the client's action grammar: the door must accept exactly what the client validates, no more).

Pre-flight: `git -C /Users/robin/Claude/Projects/wt-dtg1 status --short` clean apart from factory churn (`logs/**`, `artifacts/**`, any `.png`; F-1407-1: list and proceed); `git log fix/door-tape-grammar-1..HEAD` empty on the new branch.

## Why (F-DTG1-1, measured 2026-09-25 by the grammar-1 implementer)
With twelve keys or fourteen, the door answers 400 `bad_payload` to any reel whose input log carries `prospector_dispatch` (every solo dispatch of the Prospector), `context_action recover`, or multiplayer `agent_orders`, while the client's own validator accepts them. So after grammar-1 deploys, a human who dispatched the Prospector during the run is still refused at the door. The verbs are the client's; the door must know them.

## Scope
1. **RED first.** Rows in `scripts/test-standings.mjs` that build reels with the REAL recorder carrying each verb (a solo dispatch, a recover, and an `agent_orders` action shaped as the multiplayer client writes it), through the real handler to an in-memory store: refused on the base (paste), accepted and stored at the tip; the stored reel reads back through `?reel=` with the actions intact.
2. **The grammar.** `validTapeAction` accepts the three verbs with the exact shapes the client's validator accepts (import or mirror the client's checks; bound every free field: lengths, ranges, non-decreasing ticks); nothing else loosened; an unknown verb is still refused (a row).
3. **F-DTG1-2 while you are there:** `tapeGrammarRefusal` walks `playbookUses` too, so a future verb retirement retires such rows instead of dropping them (a row that manufactures the case).
4. **Nothing loosened:** every existing row green with counts before and after; a mutation check on each new clause.
5. **Report** `artifacts/door-tape-grammar-2/report.md` (Bash heredoc if the Write tool is refused): RED, GREEN, counts, the three accepted shapes, F-DTG2-<n>.

## Firewall
Touch ONLY: `functions/api/standings.ts` (inside `validTapeAction`, `tapeGrammarRefusal` and helpers they call, plus imports), `scripts/test-standings.mjs`, `artifacts/door-tape-grammar-2/**`. NO changes to: `src/**` (byte-identical, so the hash does not move), the handler's entry points and env types (`kv-counters-to-ledger-2` lands there), other doors, `server/**`, `specs/**`, `package.json`, the ledgers.

## Self-check (evidence, not vibes)
Node 26 first on PATH. tsc and build green; `node scripts/test-standings.mjs` green with counts; under the drain lock: `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, `npm run test:accounts`, `npm run test:mp`, `npm run test:stats`. No em or en dashes. Commits path-scoped, prefix `fix:`, one concern per commit, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. If you find yourself about to exit without changes, WRITE WHY into the report first.
End: READY-FOR-GATES + RED and GREEN + counts + the three shapes + anything adapted.
