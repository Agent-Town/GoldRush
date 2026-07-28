# Review — suite-red-inventory-cwd-invariance (F-1167-4)

**Slice:** `lane-d-suite-red-inventory-cwd-invariance`
**Branch/tip:** `lane/perf` @ `3f377d83` (runner auto-commit)
**Base:** `d8f02e51` · **Merged to main:** `ea0cabc4a96b03d1238a80f38ed5d3036a9c9525`
**Drained:** s1197 fire, 2026-07-29 (authored *and* drained in the same fire)

## Verdict

**ACCEPTED.** F-1167-4 is discharged — **and the finding itself is corrected, not merely answered.** The reducer is now cwd-invariant, proven on an instrument written before the run existed, and the new test demonstrably fails when the defect is put back.

§3.0 `drain-block-check` ran **FIRST**, before classification and before I formed an opinion: ✅ CLEAR (`factory-suite-red-inventory-cwd-invariance`, 2 leaves matched, longest wins).

## What it does

`scripts/suite-red-inventory.mjs` resolved spec-file paths against `process.cwd()`. It now derives `ROOT` from its own location (`import.meta.url`) and resolves against that, at the three sites that actually execute: `relative()`'s `isAbsolute` branch and **both** its `fs.existsSync` probes, plus the `fs.readFileSync` at `:109`. A new black-box guard, `scripts/suite-red-inventory.test.mjs`, reduces one fixture from two different cwds and asserts the outputs are byte-identical *and* still carry the correct `e2e/<spec>` form. Wired into `test:node-guards`.

The argv-supplied input/output paths were deliberately left cwd-relative — they are ordinary CLI arguments, and normalising them would have been a silent CLI behaviour change.

## 🔑 The finding was wrong in all three of its specifics, and I measured that before authoring

`BACKLOG:118` read: *"`suite-red-inventory.mjs:57` resolves paths with `path.relative(process.cwd(), …)`, so the report is only byte-reproducible from `worktrees/lane-d`. Harmless to the classification (only the displayed path prefix moves)."* Measured by running the reducer, not by reading it:

| Claim as published | Measured |
|---|---|
| the defect is at `:57` | **`:57` never fires.** It is the `path.isAbsolute(file)` branch; Playwright's JSON reporter stores `spec.file` **relative** to `rootDir` (real 171 MB raw, first entry: `"file": "_s106-prospector-boot-probe.spec.ts"`). The live branch was the `:59-60` `existsSync` fallback. |
| only reproducible from `worktrees/lane-d` | **False.** Repo root and `worktrees/lane-d` produced **identical** output. lane-d was never special — any cwd resolving `e2e/<file>` reproduces it. |
| harmless, only the prefix moves | **False, by a category.** From a cwd with no `e2e/`, the fallback returns the **bare filename**, `testBody:109` `readFileSync`s it, and the file has **zero `try`/`catch` anywhere** — so the process **dies**. |

Measured crash, `cwd=/tmp`, on the pre-fix subject:

```
exit=1
Error: ENOENT: no such file or directory, open '058-device-tiers.spec.ts'
    at Object.readFileSync (node:fs:539:20)
    at testBody (.../scripts/suite-red-inventory.mjs:109:21)
    at .../scripts/suite-red-inventory.mjs:212:41     <- the `masking` loop
```

**No output file written at all.** It went unnoticed only because `:209` skips that loop unless a `BOTH`-bucket pair exists. ⇒ **the recommendation ("normalise to the repo root") was right; the diagnosis was not.** Patching `:57` as published would have been a **no-op that closed the finding on paper while the crash survived** — which is why the master carried the correction in a dedicated section rather than quoting the finding and trusting it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** (note: `scripts/**` is outside `tsconfig`'s `include`, so tsc does **not** cover the subject — the new guard is the only gate on it) |
| `npm run build` | green, **vite 1.17 s**, asset-diet green |
| node guards (14 files) | **66/66, EXIT 0** — captured as an exit code, not a printed counter (F-1125-1) |
| `test-ticker-stats` | **EXIT 0** |
| new spec, twice | **EXIT 0 / EXIT 0** (324 ms, 328 ms) |
| guard count | **65 → 66**, as the master predicted |

### My own cwd matrix — same instrument, before and after the merge

`logs/session-scratch/s1197-cwd-probe.mjs`, written *before* the run existed, spawning the real script with three cwds on a ~1 KB fixture:

| cwd | before (pre-fix) | after (merged) |
|---|---|---|
| repo root | exit 0, 1743 B | exit 0, 1743 B |
| `worktrees/lane-d` | exit 0, 1743 B | exit 0, 1743 B |
| `/tmp` | **exit 1, no output file** | **exit 0, 1743 B** |
| all three identical? | **no** | **yes** |

### Behaviour preserved, proven against the actual pre-fix blob

Running the `d8f02e51` version of the subject and the merged version on the same fixture from the repo root: **both exit 0, both 1743 B, `TREE-ROOT OUTPUT UNCHANGED: true`.** The fix removes the crash without moving a byte of a normal run's report — which matters because `logs/suite-red-inventory.md` is a measurement artifact.

### The test was refuted, not trusted

Mutating the **subject** (never the test) — `:109` back to a cwd-relative read — drove the new guard to **EXIT 1, `fail 1`**, failing on the `/tmp` arm's ENOENT. Subject restored **byte-identical**, blob `d4245bcf`.

## Merge classification

Base `d8f02e51`. `git diff --name-only d8f02e51 main` = **`STATUS.md` alone** ⇒ **collisions NONE**, no 3-way graft. Firewall held **exactly**: 3 paths, precisely the TOUCH-ONLY list — `package.json` (one filename inserted in alphabetical position, trailing `&& node scripts/test-ticker-stats.mjs` intact), the subject, the new test. **Zero `src/`, zero `e2e/`, zero `logs/`.** The banned changes were all respected: argv paths untouched, no `try`/`catch` added, returned string shape unchanged.

**No playwright, and that is proportionate rather than thinned** — the merge carries zero `src/` and zero `e2e/` bytes and renders nothing, so Mistake #10's *"where does the PLAYER see this, in a plain boot?"* answers **nowhere, by construction**.

## Findings

**F-1197-1 (ⓘ informational, self-correction — my own instrument mislabelled its units).** My first probe printed `readFileSync(path,'utf8').length` — a **JS character count** — and I reported it as *"1737 bytes"*, a number that reached the master, the BACKLOG line and the goal leaf before I caught it. The file is **1743 bytes / 1737 chars**; the delta is three em-dashes (3 bytes each in UTF-8). **The comparison was never invalid** — both arms used the same units, and the identity checks used string `===` and `Buffer.equals` — but the *label* was wrong. Corrected to 1743 B here and in the ledger. ➡️ *A byte-count claim should come from `statSync().size` or a `Buffer`, never from a decoded string's `.length`.*

**F-1197-2 (🔻 low, adjacent, not fixed here).** `testBody` is still the only unguarded file read in the reducer; it now cannot fail for a cwd reason, but a genuinely missing spec file (a report reduced against a tree where that spec was since deleted) would still crash the whole reduction with no partial report. Deliberately **not** cured: the master banned `try`/`catch` here because it would convert a crash into a silently degraded report, which is worse. Recording it so the next fire does not read the cwd fix as full coverage.

**F-1197-3 (ⓘ informational).** `F-1173-5` (`BACKLOG:85` — the inventory does not record its own harness worker count) has the **same subject file** as this slice. Serialize; do not run the two concurrently.
