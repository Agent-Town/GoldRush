# Review — F-1701-1 actual runner PID discriminator

**Slice:** `lane/d` at `71069881f0904e00adab1b485985a70852e965f9`
**Base:** `a587598ede6b0c9853105c4c3f1e8d68d7f887cb`
**Merge:** `85ce8f22054fa51bb1e81cbb8eee28b2c45f8d8c`
**Fire:** s1704, 2026-08-12
**Verdict:** PASS — merged atomically.

## What it does

The restart helper, lane runner, and health watcher now share one nine-line process discriminator. It identifies Bash processes by the script open on file descriptor 255, so protocol prose containing `lane-runner-v3.sh` is not process identity. Relative and absolute real runner launches still match; corpse self-healing, live-runner refusal, the lock, and restart environment remain unchanged.

This is factory-only shell plumbing. It changes no player runtime, page, simulation, asset, or browser surface, so no Playwright or visual gate applies.

## Evidence

- Detached custody at `/tmp/gold-rush-gate-s1704.t6EsAf`; merge preview had zero conflicts and `git diff --check` passed.
- `npx tsc --noEmit`: rc 0 in 5.5 s.
- `npm run build`: rc 0 in 36.2 s; Vite build phase 3.47 s, with only the existing chunk-size warning.
- Restart recipe: 15 checks, 0 failures. Manufactured control proves broad `pgrep -f` falsely matches the prompt carrier; the shared discriminator rejects it, finds absolute and relative real runners once, and leaves zero after self-exclusion.
- Adjacent factory guards: main-lock 11 fixtures each direction-set; dispatch safety 8/8 arms; commit boundary 10/10 checks; gate-caller audit rc 0.
- Node 23 control reproduced the repository's explicit file-timeout diagnostic and a power-budget red on clean main (0.520 ms). Under `.nvmrc` Node 26.4.0, clean-main power controls were 0.309–0.313 ms and merged controls 0.309–0.330 ms; final merged gate was 0.367 ms against the 0.500 ms cap.
- Full pinned node battery collected 458 tests: 451 pass, 2 fail, 5 intentional skips. Both failures had one merge-side cause: the inserted runner source line shifted five law citations. After reading the target lines and rebasing them, the two failing subjects passed directly: law-pointer 11/11 and fixture teardown 1/1 across all 32 fixture owners.
- Durable transcript: `artifacts/f1701-1-gate-s1704.txt`.
- Independent `codex review --uncommitted` found the inherited-subshell/duplicate-candidate edge; the runner fixed it before the final tip and triaged the review in the run log.

## Merge classification

All five task paths were lane-touched only since the base; main had moved none of them. The ort preview and atomic main merge were conflict-free.

| Path | Class | Resolution |
|---|---|---|
| `scripts/runner-processes.sh` | NEW | Accepted shared FD-255 discriminator. |
| `scripts/start-lane-runner.sh` | LANE-TOUCHED | Replaced broad liveness checks; preserved restart/refusal behavior. |
| `scripts/lane-runner-v3.sh` | LANE-TOUCHED | Reused discriminator for stale-lock self-healing with self-exclusion. |
| `scripts/health-watch.sh` | LANE-TOUCHED | Reused the same truth for status and restart decisions. |
| `scripts/runner-restart-recipe.test.sh` | LANE-TOUCHED | Added prompt-carrier and real-runner manufactured arms to the existing guard. |

Drain-side pointer maintenance updated `CLAUDE.md`, `scripts/fire.md`, `scripts/law-pointer-baseline.json`, plus stale coordinate comments in the two touched caller scripts. Those changes only re-point verified claims after the one-line insertion; they change no policy.

## Findings

No blocking findings. The active detached runner must be restarted once through `bash scripts/start-lane-runner.sh` so its loaded shell code uses the new discriminator; no lock directory is cleared by hand.
