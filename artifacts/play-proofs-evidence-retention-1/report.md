# Run 11 retention-safe packaging

Status: preparation and local verification complete; READY-FOR-GATES. No real archive write or push is authorized here.
Source `0c43f9524443fc86272a530eced87515347aa3d4`; source base `1ddb5f4537cf2765cfc384605e106bf40679c952`.

The source adds 86,013,547 bytes in 231 evidence files, above the 40,000,000-byte landing ceiling.
The reader policy correctly protects the live `artifacts/sol/play-proofs` subtree. Separate its frozen record,
without changing that policy: 230 files move byte-identically to `artifacts/sol-play-proofs-7-record/`;
`board-entry.ts` stays at its original import path. The original run note is sealed verbatim, with a new readable
summary at its original path. All six specs are imported unchanged. Source history remains untouched.

## Input/output inventory

The six specs import only the run-local `board-entry.ts`, whose only import is Playwright. It reads browser state,
not disk evidence. Five specs call `nativeProof(id, 11)` and then read `row-${project}.json` in `afterEach`, only
when `info.status === 'passed'`. The shared driver creates the output directory at lines 913 onward and awaits
`writeFile(row…)` in its `finally` at line 1418, before its terminal assertions and before these after-hooks.
Thus each read consumes the just-produced row; a missing/failed write fails the test and the after-hook returns.
The Drill Yard spec creates its output directory and writes its own row in `finally`; it reads no saved rows.
The archived default/restore-ground/initial directories are retained snapshots made by the run-local Python
recording utilities, not imports or fixtures. Those utilities are frozen provenance, not relocated runnable tools.
No saved evidence file is a prerequisite for collecting or running the six specs.

`manifest.json` records all 231 original paths, relative paths, source commit, byte lengths, SHA-256s and retained
paths. `source-checks.json` records hashes of the six specs and source-identical shared driver. No game, policy,
dependency, existing assertion, other run, or source-lane file changes are part of this candidate.

Source verdicts stay: Drill Yard PASS, the other five HELD. There is no missing bank evidence to invent.

## Verification and retention

- Clean lane preflight: no ahead commits, no tracked dirt. Only untracked `node_modules` existed; npm replaced
  that symlink with a local install. No evidence was discarded. Lane C was clean. Lane reset to fresh main
  `6044a45fe80a765a28974daaa749283bcb62245e`; source diff contains exactly 231 evidence files and six new specs.
- `npm install --no-audit --no-fund` and baseline build passed. Its generated lockfile delta is saved separately
  as `install-generated.patch`; the tracked lockfile was restored before `npm ci --no-audit --no-fund`, which
  passed, followed by another passing preflight build. No dependency change is in the candidate.
- `npx tsc --noEmit` passed. The four existing reader/offload/budget/archive-bucket suites passed unchanged:
  **57 tests, 57 passes, zero failures**, via `scripts/gate-battery.mjs` (`checks.log`).
- The real scanner still pins the whole live proof root. It does **not** pin the sealed record. The real offload
  plan offers **230 files / 86,011,222 bytes**, no keep files and no oversized files (`offload-plan.json`).
  Explicit must-stay assertions protect the helper and retained report (`must-stay-check.log`).
- Local fixture uses an independent Git repository sharing read-only source object storage, the real tracked
  scan-space code and a local bare archive. It moves **only** the sealed record with the unmodified offload tool.
  All **231 original SHA-256s and byte lengths** verify: 230 recovered from archive commit blobs, one live helper.
  The helper is **2,325 bytes**. The six specs and driver also verify unchanged (`verify-archive.py`).
- Fixture preview is 320px on its longest side (`preview-check.json`); the mover emits its pointer and index.
  The manifest and report remain present. A fixture review citation changes to **ARCHIVED=1**, with no
  ON-DISK-UNTRACKED entries (`fixture-audit.log`). Other pre-existing absent citations are outside this task.
- The first fixture attempt failed before offload because the fixture copier omitted the six untracked specs.
  The corrected copier includes them; the successful second log and all source evidence are retained. This
  was a local fixture setup error, not a source or archive-policy failure. No source bytes were removed.
- `fixture.py` is re-runnable from this lane, never fetches or pushes, and retains its temporary repositories.
  Its initial budget snapshot was **653,852 added evidence bytes**, before the later check logs/screenshots.
  The final full-artifact measurement is recorded separately in `final-fixture-budget.json`.

The packaged lane itself still carries the sealed 86 MB: **it is not yet eligible to land without offload**.
The below-budget result is the post-offload local fixture, not a completed private publication. Do not drain
this preparation branch directly without the attended archive step in `drain-commands.md`.

## Remaining list in order

1. Attended coordination: choose window, hold fires, prepare and verify the existing PRIVATE archive destination.
2. Import only this packaging candidate and six unchanged specs on fresh main in an isolated drain tree;
   apply the existing mover to `artifacts/sol-play-proofs-7-record` only. Verify every archived SHA-256.
3. Run the full normal merged-tree gates and measure the complete landing below 40,000,000 added bytes.
4. Verify the destination remains PRIVATE; push only its verified evidence branch, verify its remote tip,
   and only then integrate/publish the main candidate and lift F-2704-1. Preserve the original six source commits.
5. Continue the campaign after run 7 lands: e4-long-road, e5-deepwater-claim, e5-flotilla, e5-regatta,
   e5-stillwater, e6-glow-mesa, e6-half-life-hollow, e6-picnic, e6-showroom, e7-dead-band, e7-echo-canyon,
   e7-relay-rush, e7-relay-valley, e8-mare-claim, e10-archive-world, e10-ember-shore.

The five HELD maps remain follow-up work; no ride allowance was renewed. Estate-wide offload is outside scope.
The task's path firewall keeps this report as the durable handoff; no vault or ledger edits are included.

## Commit provenance

Source six-commit tip: `0c43f9524443fc86272a530eced87515347aa3d4`.
Original commits: 5305db6ca312fc7d70ea93ea67e389737c21a7e9, 2e4f590348a9373ec408b70a5262ce55395fc686, 555f2f146ddae2809b467f039585d5305a3e413b, dfa57680adf1f3227df1cadb0a3c9bc983371842, 40554d9d7b9426a932d152be5faecbdf7c12c1f1, 0c43f9524443fc86272a530eced87515347aa3d4.
Local fixture packaging: `76f833d005b87d7cc3f3558cb8f5d5dd07d568af`; offload: `0650686fc9480bcfc2189fe4aa9890ccfb515bbe`; archive: `f0699d656e7cf16ba8eb7ac653ec6ad4a103e0e7`. These are local fixture commits, not published archive hashes.
Lane changes are left for the runner auto-commit; no source history or real remote was changed.

## Final checks

Final build passed (`final-build.log`, exit 0). Browser checks used the existing `dlock.sh`, an owned Vite dev
server on port **5303**, and `scripts/gate-battery.mjs` with one worker. The six imported specs collected and
**skipped all 12 rows** with `GR_NATIVE_PROOF` removed. Unmodified task-025, m1-01 and m2-01 suites:
**17/17 desktop and 17/17 mobile passed**. No new native-proof ride ran.

The initial plain-boot probe incorrectly waited for an existing-profile menu in an empty browser context;
it timed out at the correct first-time profile screen (both attempts retained in `browser-battery.log`).
The corrected probe follows profile creation through the normal UI, then waits for 60 town frames:
**1280x800 and 390x844 passed with zero console/page errors**, plain `/`, no debug or seed query.
`corrected-boots-summary.log`, `boots.json` and the two boot screenshots are the corrected evidence.
The source specs, shared driver and application were not changed to fix the probe. The initial browser battery
therefore remains honestly rc=1; its suites passed, and the separate corrected boot battery is rc=0.

The unmodified build-menu suite emitted three new screenshots under its fixed `artifacts/056` output directory.
These generated files were moved into `adjacent-screenshots/` after the suites; no pre-existing evidence was
modified or discarded. Final staged paths are limited to the task firewall. All 231 original evidence hashes
were rechecked locally after browser verification. Lane C remained clean at the original source tip.

**READY-FOR-GATES — packaging prepared; real archive and final attended drain still owed.**

## Final post-offload byte measurement

Original: **86,013,547 added evidence bytes / 231 files**. Complete local post-offload candidate, including
all packaging logs, scripts, manifest, screenshots, fixture index/pointer/preview copies and this report:
**6822605 added evidence bytes**, below **40,000,000** (`final-fixture-budget.json`).
The actual attended merged-tree budget must be remeasured; this is fixture evidence only.
