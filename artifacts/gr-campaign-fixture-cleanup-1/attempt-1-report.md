# Campaign fixture cleanup — pre-flight blocked

WHY NO IMPLEMENTATION: the required lane-c clean-worktree check found an existing tracked `package-lock.json` modification (0 additions, 30 deletions). This is not generated evidence or logs. The task says lane-c “must be clean”; its factory-churn exception does not exempt lockfiles. No other lane's work was changed or discarded. Implementation and gates stop at this prerequisite.

**READY-FOR-GATES: NO — pre-flight blocked; report-only commit.**

## Verified pre-flight

- Lane-a branch: `sol/open-findings-astra`.
- Lane-a starting HEAD: `6974a5cc7900bf11e499d087a2bd463c59d0a4b9`.
- Observed main: `59733b98d6d98e6bfc8713240c470e2e12e11ce8`.
- `git status --short`: empty before work and after install/build.
- `git log --oneline main..HEAD`: empty; no ahead commits, reset or clean required.
- Discarded evidence: none.
- Runtime command: `export PATH=/opt/homebrew/bin:$PATH`; `/opt/homebrew/bin/node --version` returned `v26.4.0`; `/opt/homebrew/bin/node -p process.execPath` returned `/opt/homebrew/Cellar/node/26.4.0/bin/node`.
- `npm install --no-audit --no-fund && npm run build`: exit 0. Build includes `tsc && vite build && node scripts/asset-diet.mjs`; TypeScript and build passed. Existing install-script, Vite config/chunk-size and asset quantization warnings were printed. Lockfile stayed unchanged in lane-a.
- Required lane-c check used its absolute path because the lane-a working directory does not contain `worktrees/lane-c`: `git -C '/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-c' status --short` returned ` M package-lock.json` (exit 0). See `lane-c-status.txt`, `lane-c-diff-numstat.txt`, and `lane-c-lockfile.diff` for the read-only receipt.

## Findings and limits

The historical `artifacts/s2717/report.md`, `artifacts/s2717/fixture-failure.txt`, and `reviews/sol-play-proofs-9.md` are absent from this older lane checkout and were located in the primary checkout. Its report identifies one `gr-campaign-resume-TH7ZuT` survivor among 162 fixture owners; the exact nested assertion remains UNVERIFIED because the old sweep did not retain that output.

Read-only inspection confirms the described cleanup gaps: the resume test removes its directory only at the successful end; `runCampaign()` can fail before returning directory ownership; the first of two campaign fixtures is outside a cleanup guarantee while the second is allocated. The fixture sweep currently keeps only failing child names. Neither script was edited.

No clean-base control, failure injection, campaign run, full fixture sweep, full Node battery, browser gates, or plain boot probes were started. No new gate counts, survivor counts or reproduction result are claimed. No timeout, semantic assertion, campaign runtime, dependency, or art changes were made. No server was started and no process was killed.

The task's TOUCH-ONLY firewall limits writes to its two scripts and evidence directory, so the session handoff is retained here rather than adding an out-of-scope vault note.

## Remaining list in order

1. Lane-c owner resolves or preserves its lockfile edit and restores the required clean pre-flight state; rerun pre-flight without discarding another implementer's work.
2. Run the unchanged fixture sweep on detached clean pre-landing `1d34e71fcc33c3a83cd02b2f9bee41cd749a9482` with Node 26.4.0, `npm ci`, and the task's art-symlink correction; retain command, output, exit and survivor evidence.
3. Implement local guaranteed cleanup in the campaign tests and retained nested failure diagnostics in the sweep, preserving commands, hashes, assertions and timeouts.
4. Run controlled failure on a scratch copy, prove nonzero exit and zero survivors, and verify byte-for-byte restoration. Run unchanged campaign tests and all fixture owners.
5. Complete tsc/build, full `npm run test:node-guards`, named adjacent suites on both projects through the permanent battery with `--workers=1`, and desktop/390px error-free plain boots under the drain lock on port 5317.
6. Record results and commit the implementation with path-scoped `test:` commits. This report's commit is identified by `git log -1 --format=%H -- artifacts/gr-campaign-fixture-cleanup-1/report.md` and in the final handoff.
