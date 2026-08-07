# F-1508-2 — red inventory lookup verdicts

## Verdict

READY-FOR-GATES. The lookup now refuses off-disk spec queries with rc=2, derives a snapshot date for every verdict and JSON response, degrades to `snapshot date UNKNOWN`, and resolves the snapshot window to the contemporaneous `main` commit.

I chose refusal rather than silent bare-name resolution. A typo is misuse, and rc=2 keeps it distinct from the rc=1 returned by a real `NOT-IN-INVENTORY` verdict or strict known red.

## Manufactured evidence

Before, using the `HEAD` version of the script against the same inventory:

```text
rc=1
INVENTORY ../Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/logs/suite-red-inventory.md — rows parsed 438 (303 failure, 135 blast-radius) — Total tests run 2388 — Total failed 303
NOT-IN-INVENTORY — e2e/072-era-activation
```

After:

```text
rc=2
red-inventory-lookup: spec does not exist: e2e/072-era-activation; use an existing e2e/*.spec.ts path (bare names need the .spec.ts suffix)
```

The valid full-path query still answers clean, now with its expiry:

```text
rc=0
INVENTORY logs/suite-red-inventory.md — rows parsed 438 (303 failure, 135 blast-radius) — Total tests run 2388 — Total failed 303
CLEAN-IN-INVENTORY — e2e/072-era-activation.spec.ts — snapshot date 2026-07-28
```

`--json` returns the same derived value as `"snapshotDate":"2026-07-28"`. `rg -n '2026-07-28' scripts/red-inventory-lookup.mjs` returned no matches; the date comes from compact `stats.startTime`. The guard uses a deliberately different fixture date, `2031-12-25`, and asserts that exact derived result.

With `stats.startTime` deleted from a temporary compact copy:

```text
rc=0
INVENTORY logs/suite-red-inventory.md — rows parsed 438 (303 failure, 135 blast-radius) — Total tests run 2388 — Total failed 303
CLEAN-IN-INVENTORY — e2e/072-era-activation.spec.ts — snapshot date UNKNOWN
```

A second probe set `stats.startTime` to `null` and also produced `snapshot date UNKNOWN`. The temporary compact copy was removed; both tracked inventory files remain untouched.

## Snapshot plumbing

`node scripts/red-inventory-lookup.mjs --snapshot` shells out to the required Git plumbing and returned:

```text
SNAPSHOT 2026-07-28T02:26:03.534Z to 2026-07-28T05:26:38.054Z — duration 10834520.016999999 ms
SNAPSHOT main commit b66905c64c0f30cbb1b018128288c19ebca5fa79
```

The direct command `git rev-list -1 --before=2026-07-28T02:26:03.534Z main` returned the same commit. If Git cannot resolve it, the tool prints the exact copyable command instead of inventing a commit.

## Guard and gates

`scripts/red-inventory-lookup.test.mjs` was already tracked and explicitly named by `test:node-guards`; I extended that existing guard rather than adding another file. No rename or grandfathering is needed: `gate-caller-audit` excludes `*.test.mjs` from guard-subject discovery, while the npm roster directly roots this test. `package.json` therefore remains unchanged.

- Focused guard: **9 tests / 9 pass / 0 fail**, including `bare names are misuse and verdict dates track the compact snapshot`.
- `npm run test:node-guards` under the repo-pinned Node 26.4.0: **346 tests / 346 pass / 0 fail / 0 cancelled / 0 skipped**, rc=0. The named new arm appears in the raw output. An initial ambient Node 23.11.1 run correctly refused that unpinned runtime at **344 pass / 2 fail**; no test was weakened.
- `npm run test:ledger-guards`: **77 tests / 77 pass / 0 fail / 0 cancelled / 0 skipped**, rc=0. Findings, blocker-panel, ruling-propagation, citations, lock, janitor, and NUL audits also passed; desk declaration skipped because `STATUS.md` carried a live ACTIVE lock.
- `npx tsc --noEmit`: rc=0.
- `git diff --check`: clean.

`npm run build` and Playwright were not run and are not owed: this change touches no `src/`, browser, rendering, or simulation surface.

An independent `codex review --uncommitted` found two edge cases: null `startTime` becoming the Unix epoch and an absolute off-repo file bypassing repository membership. Both were fixed and directly re-probed; no review finding remains open.
