# Drain review: `is-main-2`, twenty-three tools know their own name under a symlink (Opus 5.5 implementer at max effort; F-SF1-2)

**Branch** `fix/is-main-2` at `70bba488e` · **merge** `20dc211ea` · engine hash #66 `642edcf6` · drained attended 2026-09-26 05:21Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `im2`).

**Verdict: LANDED.**

### What it does
Twenty-three more tools decided "am I the main module" by comparing an unresolved spelling of `process.argv[1]` with `import.meta.url`, which node has already realpath'd; through a symlinked path (every scratch worktree) each was false, so the tool exited 0 silent, and two threw on a plain import (F-SF1-2). The implementer (Opus 5.5 at max effort) measured fixture relocation per file before moving anything: applying the plain import to all 23 turned 14 arms red in the relocators of four files, so those four carry the byte-identical pinned copy of `isMain` (`server/ledger/serve.mjs`, because the droplet deploy ships `server/` but not `scripts/is-main.mjs`; `scripts/assay-replay-agent.mjs`, copied by the assay-worker test and shipped by name; `withheld-evidence-audit.mjs`, 11 arms; `findings-state-guard.mjs`, 1 arm) and the other 19 import it (`ruling-propagation-guard.mjs` among them). No line moved in any file; the pointer guards pass. After: 22 tools give identical exit code and output through a symlink and through the real path (one differs only by a process id in node's own warning line); the droplet's ledger server starts and serves by both paths (`/api/stats` 200, unknown route 404, clean exit) where before it exited 0 silently through the link; the ruling guard now prints its 1,601 bytes both ways. The census row (`is-main.test.mjs` arm 9) names every one of the 23 tool files that read `process.argv[1]` and fails on any new reader: 7 through `isMain`, 7 with a correct hand-rolled realpath check, 4 by file-name match, 5 owed (F-IM2-1). The engine hash moves because `scripts/assay-replay-agent.mjs` is part of the hash corpus (F-IM2-2); the sim is untouched; the drain pins. Where the player sees it: nowhere; where the factory sees it: a tool run from a worktree does what it says.

### Measured
tsc and build rc 0; `is-main.test.mjs` 12 of 12 (4 of 12 fail on the pre-cure bytes); the 88-test family that names or relocates the files 908 tests with 3 fails, and the locked run `test:node-guards` 1,037 tests with 7 fails, `test:ledger-guards` 1,263 with 13, `test:stats` rc 0: every fail attributed on clean-main bytes in `red-controls.txt` (the two engine-hash rows from the agent's bytes alone, cured by the pin; 15 ledger-backup rows needing the droplet host; the desk guards refusing a worktree once main has moved; contention; the sweep's single leftover from one of those backup rows). The two roster fixes cherry-picked (`6c00b820e`, `63fec6e81`) before the locked run; the roster check prints 168.

### Merge classification
Stacked on nothing; LANE-TOUCHED: 23 tool files (the main-module check and its import only), `scripts/is-main.mjs` untouched, `scripts/is-main.test.mjs` (arms 9 to 12), `package.json` (the two cherry-picked roster fixes, identical to main), `artifacts/is-main-2/**`. Merges clean into main. The drain pins the hash and runs the ledger battery because `server/ledger/serve.mjs` changed.

### Findings
- **F-IM2-1 (`is-main-3`, a slice):** five more files carry the defect and existed when the list was made: `ops/droplet/ledger-backup.mjs:83` (the nightly backup; systemd starts it by its real path, so the bug bites only through a symlink), `server/codex-shim/serve.mjs:282`, `glb-contract-guard:561`, `modified-tracked-evidence-census:515`, `untracked-evidence-durability:470`; the backup and the shim need the pinned copy.
- **F-IM2-2 (noted):** the agent's own bytes are part of the engine hash, so curing it moves the pin. **F-IM2-3:** four tools decide by file name. **F-IM2-4:** the `is-main.mjs` header says two copies; there are six. **F-IM2-5:** `_accounts.ts:773` cites `serve.mjs:119` where the setting is at `:156` (wrong at the base). **F-IM2-7:** `stream-director.mjs:138` loads `.env.local` from the current directory at import. **F-IM2-8:** the ledger-backup tests fail in every scratch worktree (no droplet host).

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1127 files, 97716404 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34352207 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (333.8s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 163 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=0   24 passed (1.9m)  05:02Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1037 ℹ pass 1030 ℹ fail 2 ℹ skipped 5  05:21Z` |
| engine hash | `merged: 642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a (pinned ca12dc2a4cb327689084adbe0664bc2c680b6a8e8fa452fc806790e84a9cdda1)` |
