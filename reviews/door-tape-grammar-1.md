# Drain review: `door-tape-grammar-1` HOTFIX, the county door accepts the recorder's reels again (Opus 5.5 implementer at max effort; F-LSR1-0, P0)

**Branch** `fix/door-tape-grammar-1` at `0cf8e12f5` · **merge** `c582dda25` · engine hash unchanged (`c63def1b`, no pin) · drained attended 2026-09-25 15:59Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `dtg1`).

**Verdict: LANDED.**

### What it does
HOTFIX, P0. Since `15dc51b89` (2026-09-05) the county door refused every browser standing that carried a reel: the recorder writes `playbookUses` into the input log unconditionally (`src/game/RunTape.ts:262`) and `motorActions` when recorded, `submittedRunTape` is a byte envelope only, and the door's `validTapeInput` admitted exactly twelve keys, so the thirteenth failed `hasOnlyKeys` and the door answered 400 `bad_payload` "Standing not accepted." (verified by the drain by reading; the droplet's refusal table showed two such rows, both 2026-09-06). This branch (Opus 5.5 implementer at max effort) teaches the door the two keys with the client's own validators, imported rather than re-typed: `playbookUses` is an array of at most `maxEntries` elements, each exactly `{ kind: 'playbook_use', atTick, playbook }` with `atTick` an integer in `[0, durationTicks]` non-decreasing and the playbook passing the client's `validatePlaybook` with the tape's contract, seed and difficulty; `motorActions` is an array of at most `maxEntries` elements, each exactly `{ t, kind, point: { x, z } }` with `t` an integer in `[0, durationTicks)` non-decreasing, `kind` one of `motor_grade` and `motor_haul`, and coordinates finite in `[-256, 256]`, checked by the client's `validateMotorActions` reached through the exported `validateRunTape` over a minimal tape plus the door's own `t >= 0`. Absent and empty arrays are accepted; `null` is refused; an unknown thirteenth key is still refused; each of nine loosened clauses turns a row red in a mutation check. RED first: on the base the recorder's reel got `[400, bad_payload]` twice; at the tip `[200, true]` twice, and the stored reel reads back through `?reel=` with both keys intact. `src/game/RunTape.ts` is byte-identical to the base, so the engine hash does not move and there is no pin. Where the player sees it: Return to Town after securing a run puts the standing on the county board instead of "Standing not accepted." Production reaches it through this deploy, which restarts `goldrush-ledger` (the droplet loads the same module).

### Measured
`scripts/test-standings.mjs` 372 per backend before, 412 after (40 new rows per backend, kv and sqlite; every existing row green); tsc and build green; test:accounts and test:mp (528) green; test:stats green (standings 412 of 412, ledger worker 26). The five worktree node-guard reds reproduce identically on the base in a separate checkout (a desk guard that refuses any scratch checkout, two backup-pull rows needing `.env.local`, contention, a browser boot timeout in the sweep's child) and touch no changed file. Dry-run merges clean against kv2, kv1 and main.

### Merge classification
LANE-TOUCHED: `functions/api/standings.ts` (+49 and minus 2, all inside the grammar), `scripts/test-standings.mjs` (+145 and minus 2), `artifacts/door-tape-grammar-1/**` (the report with the full RED and GREEN pastes). Nothing else; `kv-counters-to-ledger-2` edits the same file's entry points on its own branch and both merge clean.

### Findings
- **F-DTG1-1 (P0 continuation, `door-tape-grammar-2`, authored in this drain):** the door still refuses three verbs the client writes, `prospector_dispatch` (every solo dispatch, `Game.ts:8256-8262`), `context_action recover` (`:5727`) and multiplayer `agent_orders` (inferred), all 400 on base and tip while the client accepts them. A human reel with a dispatch is still refused after this deploy; the continuation closes it.
- **F-DTG1-2 (with the continuation):** `tapeGrammarRefusal` does not walk `playbookUses`, so a future verb retirement would drop such stored rows instead of retiring them; latent.
- **F-DTG1-3 (noted):** the client's validators accept a first action at tick minus 1; the door refuses it.
- **F-DTG1-4 (noted):** an embedded playbook's free text is stored as sent, bounded by `maxTapeBytes`.
- **F-DTG1-5 (noted, a later slice):** importing `RunTape` grows the standings function bundle from 387,604 to 508,008 bytes (+33.8 KB gzip); a validators-only module would trim it.
- **F-DTG1-6 (master pointer):** the ledger loads the handler at `serve.mjs:16`, not `:3`. **F-DTG1-7:** live-seed-rotation-1's e2e fallback that retried without the empty list stops running once this lands (harmless).

### Battery attribution (drain, 15:36Z)
Three reds in the chain battery at 15:34Z. (1) The `board-tape-gold` browser-door row: `page.waitForFunction: Timeout 120000ms exceeded` (TimeoutError) in the browser page at 1-minute load 111, the same shape and duration as the pp3 and rt40 landings today, neither of which touched the door; and because this branch DOES change the door, the attribution rests on the door's own gates: the ledger battery ran the production door's 1,263 rows with zero fails, `test-standings` 412 of 412 per backend, the functions gates green, and the grammar change only accepts more (nothing a browser tape carried before is refused now). (2) The fixture sweep: "node-guards-contention child failed" (the load shape, not survivors). (3) The contention row itself, advisory by name. All three allowed for this landing only.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 140 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the three functions gates | `accounts rc=0 / mp rc=0 / stats rc=0` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1018 ℹ pass 1010 ℹ fail 3 ℹ skipped 5  15:34Z` |
| engine hash | `merged: c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef (pinned c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef)` |
