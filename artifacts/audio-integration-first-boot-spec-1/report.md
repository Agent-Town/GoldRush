# Audio persistence follows the returning-player Settings route

READY-FOR-GATES. Integration **10/10** and unchanged adjacency **32/32** pass. Eight plain surfaces across desktop and mobile have zero console and page errors.

## Root cause and repair

The actual red row is `settings volume and mute persist across reload` (original line 80). The task's quoted audio-lock/panning title names the preceding test, which passed unchanged. Clearing storage brought up the first-boot profile card, which has a music toggle but no Settings entry. Both baseline projects reproduced the timeout at `start-menu-settings`.

The test now seeds one returning-player profile with the conditional init-script pattern from `audio-music-toggle.spec.ts`. It opens Settings, sets volume to 25% and mute on, asserts the stored values, reloads, reopens Settings, and asserts both controls retained their values. It then boots a run and checks the live SoundSystem diagnostics for `volume: 0.25` and `muted: true`. Every original persistence assertion remains. Conditional seeding does not reset preferences on reload. Settings screenshots now go to this task's evidence directory.

The first implementation tried the menu's global audio diagnostic snapshot after reload; both projects passed the restored controls but failed that new check because the muted menu did not publish a snapshot. The final check uses the existing live run diagnostic surface. These intermediate failures are retained in `after-*.log`; final receipts are `final-*.log`.

No sixth integration test was added: the adjacent toggle suite already proves first-boot music control. The separate plain-boot check also asserts that the first-boot music toggle is visible and the Settings entry is absent, then follows actual profile creation into town and back to the returning-player menu.

## Verification

| Run | Desktop | Mobile |
| --- | --- | --- |
| Original integration (`before-*.log`) | exit 1; 4 passed / 1 failed | exit 1; 4 passed / 1 failed |
| Intermediate menu snapshot check (`after-*.log`) | exit 1; 4 passed / 1 failed | exit 1; 4 passed / 1 failed |
| Final integration (`final-*.log`) | exit 0; 5/5 | exit 0; 5/5 |
| Adjacent battery (`adjacent-*.log`) | exit 0; 16/16 | exit 0; 16/16 |

Adjacent counts per project: `050-audio-mix-and-access` **4/4**, `audio-music-toggle` **5/5**, `m2-01-build-menu` **7/7**. All three files are unchanged. There were no retries or skipped tests. Integration and adjacent tests assert empty console/page error collections.

- Pre-flight: no ahead commits, no uncommitted authored work. Existing untracked `logs/guard-stats.jsonl` was left alone. No lane reset or clean was needed.
- `npm install --no-audit --no-fund`: exit 0. It removed 30 lockfile lines locally; that generated change was restored before the clean pre-flight check.
- Pre-edit `npm run build`: exit 0, including TypeScript, Vite and asset diet. Existing config-loader, chunk-size, GLB UV and unrecognised texture-tier warnings remained.
- Final `npx tsc --noEmit`: exit 0 (`tsc.log`, `tsc.exit`).
- `node artifacts/audio-integration-first-boot-spec-1/plain-boots.mjs`: exit 0. First-boot, town, returning menu and run on each device, no debug flag; zero console/page errors (`plain-boots.json`). Its dedicated dev server was stopped afterward. The screenshot path was corrected to decode the workspace URL with `fileURLToPath`; the two initial screenshots were moved into this directory and the resulting empty task directory removed. Existing unrelated encoded-path content was left alone.
- `git diff --check`: exit 0. Eleven regenerated adjacent screenshots were restored; exact paths are in `restored-artifacts.txt`.
- Source tree before and after: `2919de18adcba0acaad94a780ef91b1f9fcf8ebf`. No `src/**` change; no adjacent e2e change.

Commands, run individually for each project (`desktop-chrome`, `mobile-chrome`):

```sh
npx playwright test e2e/audio-integration.spec.ts --project="$project" --workers=1 --reporter=line --output="artifacts/audio-integration-first-boot-spec-1/final-$project-results"
npx playwright test e2e/050-audio-mix-and-access.spec.ts e2e/audio-music-toggle.spec.ts e2e/m2-01-build-menu.spec.ts --project="$project" --workers=1 --reporter=line --output="artifacts/audio-integration-first-boot-spec-1/adjacent-$project-results"
```

Before and intermediate integration runs used the same command with `before-` and `after-` output prefixes. Each command's exit was captured immediately without a pipeline into the corresponding `.exit` file. Plain checks use `npm run dev` on the repository's configured port 5188, then the retained `plain-boots.mjs` script.

## Commits and scope

Base: `26eefc2421f06450860f8226a4638dc0f4b7305e`. Implementation: `52860648a0d05cbcb82f6ff31b737165a63ef694` (`test: boot audio persistence with a returning-player profile`), **11 insertions / 6 deletions** in the single allowed spec. This report and its evidence are committed separately with the same `test:` prefix.

Only `e2e/audio-integration.spec.ts` and this artifact directory are included. Raw failure traces remain local and are ignored by this directory's `.gitignore`; logs, failure context and screenshots are retained in git (trailing whitespace stripped from generated text). The task's touch-only boundary also excludes vault writes.

## Remaining list in order

1. Orchestrator integration gates. No implementation or requested verification remains.
