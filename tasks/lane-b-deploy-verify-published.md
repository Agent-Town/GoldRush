# lane-b — deploy: prove it published (F-1049-1 + F-1049-3)

**FIRE-AUTHORED (attended review welcome)** — s1049, 2026-07-25.
**ROLE:** Codex implementer. **WORKDIR:** `worktrees/lane-b` (branch `lane/m4`).

> ⛔ **SEQUENCING — DO NOT QUEUE THIS UNTIL `tasks/lane-b-deploy-honest-and-serialized.md` HAS MERGED TO MAIN.**
> Both masters edit `scripts/deploy.sh`. Queued while its predecessor sits undrained, this task's
> SAFE-DUPE pre-flight STOPs and produces a zero-work done-move (the false-done trap, s672).
> The drain that lands the predecessor should `cp` this file into `tasks/queue/lane-b/` **after** its merge commit.

## READ FIRST (paths, not memory)
- `reviews/deploy-path-false-green.md` — the evidence for every number below. Read it fully before writing code.
- `scripts/deploy.sh` — **as it exists on main after the predecessor merged**, not as quoted here.
- `logs/deploy.log:194565-194591` — the captured false green, verbatim.

## WHY (quoted evidence, dated)
s1049 probed the live site: `https://gold-rush-3in.pages.dev/version.json` returns
`{"build":"49dbce7a","builtAt":"2026-07-24T17:20:23Z"}` while `logs/deploy.log` records
`2026-07-25 21:47:08 DEPLOYED ok`. **174 commits — including the entire Opus-5 3D night — never reached the players,
and the deploy path called it a success.** Root cause, captured in the log: wrangler 4.107.0 hit a fatal upload
error, then crashed in its own exit path (`process.exit('ENOENT')` →
`TypeError [ERR_INVALID_ARG_TYPE]: The "code" argument must be of type number`), so it **exited 0**.
`deploy.sh` believed the exit code.

Owner stake (CLAUDE.md §4.1, DEPLOY LAW): *"the family plays the latest gated build at the Pages URL."*
A deploy path that cannot tell publishing from not-publishing does not satisfy that law.

## SCOPE (numbered, each independently testable)

1. **Success requires a published URL, not just rc=0.**
   `deploy.sh` already greps `$CAPTURE` for `https://[a-z0-9.-]+\.pages\.dev`. Make that grep **decide** the outcome:
   success = `rc == 0` **AND** a non-empty URL was captured. An empty URL is `deploy_failed`, whatever wrangler exited.
   Remove the `${URL:-'(url in log)'}` fallback from the success path — it is the string that hid this for a day.
   The never-block law (`deploy.sh:3-4`) is unchanged: default mode still exits 0; only the recorded
   outcome and the log line change.

2. **Upload from an immutable snapshot of `dist/`.**
   After the asset-budget leg and before `wrangler pages deploy`, copy `dist/` to a fresh temp dir
   (`mktemp -d`, registered in the existing `trap … EXIT`) and deploy **that** directory.
   *Why a lock is not enough:* the 21:41:51 ENOENT happened with **no other deploy running** — a concurrent
   **gate build** (`npm run build`, which every fire runs) rewrote content-hashed filenames under the live upload.
   A deploy-only lock cannot see a gate build (F-1049-3).

3. **`deploy-result.json` records what was verified.**
   On success write the real `url`; on failure write `outcome":"deploy_failed"` with the URL field empty.
   Add `"publishedBuild"` = the build id that was in `dist/version.json` at upload time, so a later fire can
   diff intent against the live `/version.json` without reading any log.

4. **A post-deploy confirmation, on by default, never blocking.**
   After a reported-successful deploy, fetch `<url>/version.json` (node's `fetch`, ~20s timeout) and compare its
   `build` to `publishedBuild`. Match → `note "VERIFIED published <build>"`. Mismatch/unreachable →
   `note "UNVERIFIED: deploy reported success but <url>/version.json says <x>"` and record
   `outcome":"deploy_unverified"`. **Never exit non-zero for this in default mode** — it is a truth-teller,
   not a gate. (Fires are permission-denied on `curl`; use node, which is not gated — F-1048-3.)

5. **Keep the predecessor's diagnostics intact.** Do not revert the wrangler-log error extraction, the exit
   codes, or the lock that `lane-b-deploy-honest-and-serialized` landed. This task is additive to that work.

## FIREWALL
**TOUCH-ONLY:** `scripts/deploy.sh` · this task file's done-move.
**NO:** `e2e/asset-diet.spec.ts` · `playwright*.config.ts` · `package.json` · the `25000000` budget constant
(`a budget edited to fit its measurement is not a guard`) · any `src/` file · any other lane's files.

## SELF-CHECK (paste real output; a claim without output is not evidence)
- [ ] **Forced false-green reproduction — the point of the whole task.** Simulate wrangler exiting 0 with no URL
      (e.g. a stub on `PATH`, or a temporary `WRANGLER_BIN` override you remove afterwards) and show
      `deploy.sh` now records **`deploy_failed`**, not `DEPLOYED ok`. **Paste both the before-fix and after-fix
      log lines.** Restore any stub and show `git diff` is empty of it.
- [ ] **Snapshot proof:** show the wrangler invocation targets the temp dir, and that deleting a file from
      `dist/` mid-run does **not** ENOENT the upload. If a live 15-min upload is impractical, prove it
      structurally: print the snapshot path, `ls` it, and show the deploy command's directory argument.
- [ ] **Confirmation leg:** paste the `VERIFIED published <build>` line from a real run, **or**, if no real
      deploy is possible in-lane, paste the `UNVERIFIED:` line produced against a deliberately wrong URL —
      proving the leg runs and reports rather than silently passing.
- [ ] `npx tsc --noEmit` clean · `npm run build` green (deploy.sh is not TS, but the repo must stay green).
- [ ] `bash -n scripts/deploy.sh` clean, and one full default-mode run exits **0** (never-block law intact).
- [ ] `git diff` shows `deploy.sh` only.

**READY-FOR-GATES.** Report: the two forced-failure pastes (before/after), the snapshot path, the confirmation
line, and — if a real deploy ran — the live `/version.json` build id afterwards.
