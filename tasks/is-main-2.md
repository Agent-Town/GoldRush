# Task is-main-2: the twenty-three remaining main-module checks move onto scripts/is-main.mjs, so every tool runs its main under a symlinked path

⛔ GATE-SIDE HOLD: run by the attended session as an Opus 5.5 implementer at maximum effort; not for a Codex lane. Follows `small-fixes-1` (F-LS1-2, F-SF1-2), `test-truth-2` and `live-seed-rotation-1` (which edit scripts and tests).

You are the implementer for Gold Rush, working in a scratch worktree cut by the attended session (Claude Opus 5.5 on the owner's Anthropic subscription; never Codex): `/Users/robin/Claude/Projects/wt-im2`, branch `fix/is-main-2`, cut from main AFTER `small-fixes-1`, `test-truth-2` and `live-seed-rotation-1` landed (verify all three in `git log --oneline main`; else STOP and report).

READ FIRST: AGENTS.md; `scripts/is-main.mjs` and `scripts/is-main.test.mjs` (the cure and its symlink proof), `artifacts/small-fixes-1/report.md` (F-LS1-2: why two of the thirteen carry a byte-identical copy instead of the import: test fixtures relocate those files alone) and `artifacts/small-fixes-1/other-main-module-spellings.txt` (the twenty-three remaining checks with their spellings; the two marked THROWS also crash on a `node -e` import); each listed file.

Pre-flight: `git -C /Users/robin/Claude/Projects/wt-im2 status --short` must show no modified TRACKED file outside the two factory-churn classes: (a) `logs/**`, (b) `artifacts/**`, `reviews/shots-*` and any `.png` (F-1407-1, FACTORY-CHURN EXCEPTION: list them and proceed); `git log main..HEAD` empty. `npm run build` green before touching anything. Node 26 first on PATH (`export PATH=/opt/homebrew/bin:$PATH`).

## Why (F-SF1-2, measured 2026-09-25)
Twenty-three tools decide "am I the main module" by comparing an unresolved spelling of `process.argv[1]` with `import.meta.url`, which node has already realpath'd; under a symlinked path (every scratch worktree) each is false, `main()` never runs and the tool exits 0 silent. Eight were measured exiting 0 with no output. `server/ledger/serve.mjs` and `ruling-propagation-guard.mjs` are among them.

## Scope
1. **Measure first, per file:** does any test fixture copy or relocate the file ALONE (then it needs the byte-identical copy of `isMain`, pinned by the existing test) or can it import `./is-main.mjs` (files outside `scripts/` import by relative path). Write the table.
2. **Move each onto `isMain(import.meta.url)`**, `server/ledger/serve.mjs` and `ruling-propagation-guard.mjs` first; the two THROWS cases stop throwing on a `node -e` import.
3. **Prove it:** extend `scripts/is-main.test.mjs` with a census row (no main-module comparison of `process.argv[1]` remains outside `isMain` or a pinned copy) and a symlink run for at least the two named tools (same exit code and output through a symlinked path as through the real one; the old spelling exits 0 silent).
4. **Report** `artifacts/is-main-2/report.md`: the table, the before and after per tool, the census.

## Firewall
Touch ONLY: the listed tool files (the main-module check and its imports only), `scripts/is-main.test.mjs`, `artifacts/is-main-2/**`. NO changes to: `scripts/is-main.mjs` itself, `src/**`, behaviour of any tool beyond running its main, `package.json`, the ledgers.

## Self-check (evidence, not vibes)
tsc and build green; `node --test scripts/is-main.test.mjs`; every changed tool run once the way its callers run it (the report lists the command and the exit code); under the drain lock `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` and `npm run test:ledger-guards`; `npm run test:stats` because `server/ledger/serve.mjs` is in the set. Commits path-scoped, prefix `fix:`, one concern per commit, ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Take the drain lock (`bash "/Users/robin/Claude/Projects/Gold Rush/scripts/attended/dlock.sh" bash -c ...`) only for the full node-guards battery and the functions gates. No em or en dashes. No network call leaves the machine; nothing is deployed by you. If the Write tool refuses the report file, write it with a Bash heredoc. If you find yourself about to exit without changes, WRITE WHY into the report first.
End: READY-FOR-GATES + the table + the census + anything adapted.
