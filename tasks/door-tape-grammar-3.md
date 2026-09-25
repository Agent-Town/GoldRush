# Task door-tape-grammar-3: the three places where the county door is looser than the client are tightened, so a stored reel can always be loaded by the Lantern and the assayer

⛔ GATE-SIDE HOLD: run by the attended session as an Opus 5.5 implementer at maximum effort; not for a Codex lane. Not P0. Follows `door-tape-grammar-2` (F-DTG2-2).

You are the implementer for Gold Rush, working in a scratch worktree cut by the attended session (Claude Opus 5.5 on the owner's Anthropic subscription; never Codex): `/Users/robin/Claude/Projects/wt-dtg3`, branch `fix/door-tape-grammar-3`, cut from main AFTER `door-tape-grammar-2` landed (verify: `git log --oneline main | grep -q door-tape-grammar-2`; else STOP and report).

READ FIRST: AGENTS.md; `artifacts/door-tape-grammar-2/report.md` (F-DTG2-2 and its table `looser-than-client.txt`: measured with the door's `validateTape` against the client's `validateRunTape`), `artifacts/door-tape-grammar-1/report.md` (the RED-first method with the real `RunTapeRecorder` and the mutation check); `functions/api/standings.ts` `validTapeAction` (the door's action grammar, now carrying the grammar-1 and grammar-2 shapes); `src/game/RunTape.ts` (the client's action normalizer: what it refuses, the door must refuse).

Pre-flight: `git -C /Users/robin/Claude/Projects/wt-dtg3 status --short` must show no modified TRACKED file outside the two factory-churn classes: (a) `logs/**`, (b) `artifacts/**`, `reviews/shots-*` and any `.png` (F-1407-1, FACTORY-CHURN EXCEPTION: list them and proceed); `git log main..HEAD` empty. `npm run build` green before touching anything. Node 26 first on PATH (`export PATH=/opt/homebrew/bin:$PATH`).

## Why (F-DTG2-2, measured by the grammar-2 implementer, 2026-09-25)
In three pre-existing places the door accepts what the client refuses: a whitespace-only `place_build` id, a whitespace-only `pick_upgrade` id, and a `set_agent_ability` naming an ability the client does not know (`fly`; the control `auto_pan` is accepted by both). A reel the door accepts but the client refuses stays on the shelf, ranked, yet the Lantern replay and the assayer cannot load it: a row nobody can verify. One grammar, the client's.

## Scope
1. **RED first.** Rows in `scripts/test-standings.mjs` that post each of the three shapes through the real handler (build them with the real recorder where it lets you, by hand where the recorder itself refuses, and say which): accepted on the base (paste), refused `bad_payload` at the tip; a control per shape (a valid id, a known ability) still accepted.
2. **The grammar.** `validTapeAction` refuses the three exactly as the client's normalizer does (import or mirror its checks: trimmed non-empty ids within the client's length caps; abilities from the client's own set). Nothing else loosened or tightened; a mutation check per new clause.
3. **Stored rows.** Say what happens to a row already stored with one of the three shapes on re-read (`tapeGrammarRefusal`): retired and counted, never dropped silently; a manufactured row proves it.
4. **Report** `artifacts/door-tape-grammar-3/report.md`: RED, GREEN, counts before and after, the three refused shapes, F-DTG3-<n>.

## Firewall
Touch ONLY: `functions/api/standings.ts` (inside `validTapeAction`, `tapeGrammarRefusal` and helpers they call, plus imports), `scripts/test-standings.mjs`, `artifacts/door-tape-grammar-3/**`. NO changes to: `src/**` (byte-identical), the handler's entry points and env types, other doors, `server/**`, `specs/**`, `package.json`, the ledgers.

## Self-check (evidence, not vibes)
tsc and build green; `node scripts/test-standings.mjs` green with counts; under the drain lock `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, `npm run test:accounts`, `npm run test:mp`, `npm run test:stats`; the same-game audit's pinned summary unchanged (this slice adds no verb). Commits path-scoped, prefix `fix:`, one concern per commit, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Take the drain lock (`bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c ...`) only for the full node-guards battery and the functions gates. No em or en dashes. No network call leaves the machine; nothing is deployed by you. If the Write tool refuses the report file, write it with a Bash heredoc. If you find yourself about to exit without changes, WRITE WHY into the report first.
End: READY-FOR-GATES + RED and GREEN + counts + the three shapes + anything adapted.
