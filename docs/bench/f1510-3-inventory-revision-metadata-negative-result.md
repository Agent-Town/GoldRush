# F-1510-3 inventory revision metadata — negative result

Date: 2026-08-07  
Task: `lane-f1510-3-inventory-revision-metadata`  
Outcome: **STOP — the task's licensed negative condition fired.**

## Verdict

The requested `playwright.config.ts` mechanism cannot capture the tested revision as authored.
Playwright loads this repository's TypeScript config as an ES module, where `__dirname` is undefined.
The required safe fallback therefore serialises `revision: "unrecorded"` and `dirty: "unrecorded"`.
Shipping reducer and fixture guards around those values would harden an output already proved false.

No mechanism code or guard arms remain in the lane. This is a docs-only negative result.

## Pre-flight

The lane was current and clean before the probe:

```text
git merge-base --is-ancestor 17556e86f HEAD
rc=0

grep -c "configured workers \*\*" scripts/suite-red-inventory.mjs
1
grep -c "workers: isFireShell ? 1 : undefined," playwright.config.ts
1
grep -c "reducer reports configured and actual workers distinctly" scripts/suite-red-inventory.test.mjs
1
grep -n "workers: isFireShell ? 1 : undefined," playwright.config.ts
50:  workers: isFireShell ? 1 : undefined,

git status --porcelain
<empty>
```

## Manufactured reducer REDs

Before touching the reducer, three temporary fixture arms asserted the intended provenance line:

- recorded 40-hex revision with `dirty: false`;
- absent metadata degrading to `unrecorded`;
- `dirty: true` remaining visible.

Against the pre-change reducer they produced:

```text
tests 10
pass 7
fail 3
cancelled 0
skipped 0
todo 0
old_behavior_rc=1
```

Each failure was the expected missing-output assertion for its own arm. After temporarily adding the
copy-only reducer line, all three went green (`10 pass / 0 fail`). This established reducer behaviour
only; it did not establish that a real Playwright run could supply the metadata.

## End-to-end measurement

The temporary config implementation used the task-prescribed hoisted helper and
`cwd: __dirname`. A real JSON-reporter run completed successfully, loaded the config from this
worktree, and emitted only the fallback:

```text
{"revision":"unrecorded","dirty":"unrecorded","actualWorkers":1}
configFile=/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-b/playwright.config.ts
playwright_rc=0
```

Exposing the caught error during a subsequent `--list` probe identified the cause:

```text
Playwright revision metadata could not be recorded: ReferenceError: __dirname is not defined
    at captureRevision (.../worktrees/lane-b/playwright.config.ts:109:28)
    at .../worktrees/lane-b/playwright.config.ts:51:13
list_rc=0
```

This is the exact negative case licensed by the master: `__dirname` under the TypeScript config
loader does not provide the tested tree. The fallback kept Playwright operational, but the mechanism
did not name the tested revision.

## Preserved constraints

- `workers: isFireShell ? 1 : undefined,` remained on line 50 throughout.
- The reducer never called Git.
- `logs/suite-red-inventory.md` and `logs/suite-red-inventory-compact.json` were untouched.
- `node scripts/law-pointer-guard.mjs` passed during the temporary implementation: 26 pointers,
  23 checked, 2 illustrative, 1 known-rotten.
- `npx tsc --noEmit` completed with rc 0 during the temporary implementation.
- `npm run build` was not owed because no `src/` run surface was touched.

## Successor seam

A successor must price an ESM-safe directory source (for example `import.meta.dirname` on the pinned
Node runtime, or `fileURLToPath(import.meta.url)`) and re-run the same JSON-reporter proof before
landing reducer guards. This report does not claim either alternative is approved by the current
master.
