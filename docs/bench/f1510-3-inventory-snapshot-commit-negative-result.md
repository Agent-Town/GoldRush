# F-1510-3 inventory snapshot commit — negative result

Date: 2026-08-07  
Task: `lane-f1510-3-inventory-names-its-commit`  
Outcome: **STOP — `git rev-parse HEAD` at generation time does not identify the tree that produced the input report.**

## Pre-flight

The prerequisite commit is present:

```text
$ git merge-base --is-ancestor 2c49518192e338753482ec8188cd89bf1390cca9 HEAD
rc=0
```

The scoped subject is present exactly once:

```text
$ grep -c "resolved masking-row test bodies" scripts/suite-red-inventory.mjs
1
rc=0
```

`git status --porcelain` printed nothing before the investigation, so there was no tracked dirt outside the standing `logs/**` exception (or inside it).

## Measurement that requires the stop

The tracked compact report identifies a different test tree from the generator checkout:

```text
$ node -e 'const r=require("./logs/suite-red-inventory-compact.json"); console.log(JSON.stringify({rootDir:r.config?.rootDir,startTime:r.stats?.startTime},null,2))'
{
  "rootDir": "/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-d/e2e",
  "startTime": "2026-07-28T02:26:03.534Z"
}
```

The three relevant revisions disagree:

```text
generator tree (worktrees/lane-a) HEAD:
432587889f143cd866c40f886b4f207c0a8a5973

recorded test tree (worktrees/lane-d) current HEAD:
61892d1813f265fcad2133c9ab84d29db40de39f

main revision at report.stats.startTime:
b66905c64c0f30cbb1b018128288c19ebca5fa79
```

Therefore the requested implementation would emit:

```text
- Snapshot commit: **432587889f143cd866c40f886b4f207c0a8a5973**
```

That line would name the reporting checkout, not the tree whose Playwright results are being reduced. A clean/dirty suffix cannot repair the wrong revision identity. This is the exact negative-result condition licensed by the task: a raw JSON report produced on a different tree makes generation-time `HEAD` misleading.

## Header and manufactured-defect decision

Before:

```text
(no `Snapshot commit:` header line)
```

After:

```text
(unchanged; no `Snapshot commit:` header line)
```

No normal, degradation, or dirty-marker arm was manufactured because the task requires an immediate stop once `git rev-parse HEAD` is shown not to be meaningful. Adding tests for output known to be false would harden the defect instead of guarding a cure.

The eventual cure must bind provenance to the Playwright run itself (or thread an explicitly captured revision alongside the raw report), then have the reducer copy that recorded value. Deriving a fresh revision while reducing an old report is not sufficient.

## Verification

- `scripts/suite-red-inventory.test.mjs` is directly rooted in `package.json`'s `test:node-guards` roster. `package.json` is untouched.
- `npm run test:node-guards` on Node `v23.11.1`: `rc=1`; **346 tests / 341 pass / 2 fail / 0 cancelled / 3 skipped**. The two reds are the standing F-1507-1 file-timeout split: `all 23 scripts/*.test.mjs fixture owners remove their temp directories` and `a per-test timeout still overrides the default, so declared budgets are untouched`. There is no new F-1510-3 arm to claim as run because implementation stopped before one existed.
- `npx tsc --noEmit`: `rc=0`.
- `git status --porcelain logs/`: no output. `logs/suite-red-inventory.md` and `logs/suite-red-inventory-compact.json` are unchanged.
- `git diff -- package.json scripts/suite-red-inventory.mjs scripts/suite-red-inventory.test.mjs`: no output.
- `npm run build` and a browser battery were not run and are not owed: no `src/**` or browser run surface changed.

**READY-FOR-GATES — negative result.**
