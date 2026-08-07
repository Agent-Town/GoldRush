# F-1510-3 revision metadata under ESM — run report

Date: 2026-08-07  
Task: `lane-f1510-3-revision-metadata-esm`  
Outcome: **READY-FOR-GATES — mechanism cured, pending the next real inventory regeneration**

## What landed

`playwright.config.ts` captures the tested worktree's revision and tracked-only dirty state while
Playwright is loading the config. The reducer copies those values from `report.config.metadata`; it
does not derive them. Three rooted fixture arms cover a recorded clean revision, absent metadata,
and a dirty revision.

The config arrangement keeps the load-bearing worker line at line 50:

```text
    45 export default defineConfig({
    46   testDir: './e2e',
    47   testIgnore: captureRun ? [] : ['**/*.rig.ts', ...claimedByAnotherConfig],
    48   testMatch: captureRun ? ['**/*.rig.ts'] : undefined,
    49   timeout: 30_000,
    50   workers: isFireShell ? 1 : undefined,
    51   metadata: captureRevision(),
```

The import and hoisted function declaration are at the bottom of the file:

```ts
import { execFileSync } from 'node:child_process';

function captureRevision(): { revision: string; dirty: string | boolean } {
  try {
    const cwd = import.meta.dirname;
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd, encoding: 'utf8' }).trim().length > 0;
    return { revision, dirty };
  } catch (error) {
    console.error('revision metadata could not be recorded: ' + String(error));
    return { revision: 'unrecorded', dirty: 'unrecorded' };
  }
}
```

## Pre-flight

All stop conditions passed before editing:

```text
ANCESTOR_RC=0
GENERATOR_COUNT=1
CONFIG_COUNT=1
TEST_COUNT=1
50:  workers: isFireShell ? 1 : undefined,
5:  "type": "module",
---STATUS---
<empty>
```

The five pre-flight probes therefore established the required evidence ancestor, three unmoved
subject regions, line 50, ESM mode, and a clean tracked worktree.

## Manufactured reducer RED, then GREEN

I added the three fixture arms before changing the reducer, then ran:

```text
node --test scripts/suite-red-inventory.test.mjs
```

Against the old reducer, all three arms failed on their missing-output assertion:

```text
✖ reducer reports the captured revision
  assert.ok(...includes(`- Revision: **${revision}**; dirty **false**`))

✖ reducer reports an absent revision as unrecorded
  assert.ok(...includes('- Revision: **unrecorded**; dirty **unrecorded**'))

✖ reducer reports a dirty captured revision
  assert.ok(...includes(`- Revision: **${revision}**; dirty **true**`))

tests 10
pass 7
fail 3
cancelled 0
skipped 0
todo 0
old_behavior_rc=1
```

After adding the one copy-only reducer line, the same battery produced:

```text
tests 10
pass 10
fail 0
cancelled 0
skipped 0
todo 0
rc=0
```

The actual fixture output, read from the reducer's generated markdown rather than from source, was:

```text
- Revision: **0123456789abcdef0123456789abcdef01234567**; dirty **true**
```

The existing `package.json` `test:node-guards` roster explicitly names
`scripts/suite-red-inventory.test.mjs`, so the three arms are rooted without a package change.

## Copy-only proof

The reducer line is:

```js
`- Revision: **${report.config?.metadata?.revision ?? 'unrecorded'}**; dirty **${report.config?.metadata?.dirty ?? 'unrecorded'}**`,
```

The required search is empty:

```text
$ grep -n "git" scripts/suite-red-inventory.mjs
<no output>
```

Therefore the reducer invokes no Git command and can only copy values recorded by the Playwright
run. Old reports without metadata degrade to `unrecorded`.

## Line and law-pointer proofs

After the implementation:

```text
$ grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts
50:  workers: isFireShell ? 1 : undefined,

$ node scripts/law-pointer-guard.mjs
law-pointer-guard — do the law surfaces still point at what they claim?
  surfaces      : 7
  pointers      : 26  (checked 23, illustrative 2, known-rotten 1)
PASS — every law-surface pointer still lands on the line it was written for.
```

## Real Playwright capture with tracked-only dirt

Command:

```text
npx playwright test _s106-prospector-boot-probe.spec.ts --project=desktop-chrome --workers=1 --reporter=json
```

Captured from the JSON report:

```text
config.metadata = {"revision":"e3e9fa40d9297628ca7eec2e13e2dc4085909798","dirty":true,"actualWorkers":1}
stats = {"expected":1,"skipped":0,"unexpected":0,"flaky":0}
playwright_rc=0
```

The revision is a real 40-hex commit. `dirty: true` is correct because the three tracked task files
were modified when the config evaluated. The dirty probe in the landed helper includes
`--untracked-files=no`, closing the one end-to-end conjunct s1517 left unmeasured.

The probe regenerated `reviews/shots-prospector-presence/desktop-chrome-plain-boot.png`; pre-flight
proved it clean, so I restored that test artifact. It is absent from the final diff.

## Gates

TypeScript:

```text
$ npx tsc --noEmit
<no output>
rc=0
```

Full rooted Node guard battery on the lane shell:

```text
$ node --version
v23.11.1

$ npm run test:node-guards
tests 354
pass 352
fail 2
cancelled 0
skipped 0
todo 0
rc=1
```

Both failures are the standing F-1507-1 Node 23.11.1 timeout-semantics split named by the task:

```text
✖ all 23 scripts/*.test.mjs fixture owners remove their temp directories
✖ a per-test timeout still overrides the default, so declared budgets are untouched
DIAGNOSIS: this node (v23.11.1) bounds --test-timeout at FILE granularity ...
Cure the NODE, not the test: .nvmrc pins 26.4.0.
```

The full output visibly ran and passed all three new arms:

```text
✔ reducer reports the captured revision
✔ reducer reports an absent revision as unrecorded
✔ reducer reports a dirty captured revision
```

`npm run build` is not owed: the task changes config/reducer/test/report surfaces and no `src/` run
surface.

## Snapshot and scope custody

```text
$ git status --porcelain logs/
<no output>
```

Neither tracked inventory snapshot changed. The final repository diff is limited to the three
implementation files and this report. No dependencies, package scripts, sidecars, or alternate
revision derivation paths were added.

The mechanism is now present and measured. F-1510-3 remains **cured-pending-regeneration** until the
next genuine suite inventory run writes this captured revision into `logs/suite-red-inventory.md`.
