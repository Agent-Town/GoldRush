# f1510-3-revision-metadata-esm — drain review (s1518)

**Slice:** `f1510-3-revision-metadata-esm` (master `tasks/lane-f1510-3-revision-metadata-esm.md`, authored s1517)
**Branch:** `lane/b` · **tip** `6e6465868` `runner(lane-b): lane-f1510-3-revision-metadata-esm.md`
**Merge:** `942afed2ce9ebe8a8598faf1c64c9a5cb6bf5ef9` (main, `--no-ff`)
**Gated in:** detached worktree `gate-s1518` (§3.0b custody), merged tree `6c90357f1`, Node **26.4.0** (`.nvmrc`), fire shell

## Verdict

**MERGED.** Every conjunct the master specified was re-measured by this fire in a third tree, not
inherited from the runner's report. F-1510-3 is marked **cured-pending-regeneration, NOT closed** —
the mechanism ships; the gate sentence closes only when the next genuine suite-inventory run writes a
captured revision into `logs/suite-red-inventory.md`.

## What it does

`playwright.config.ts` now records, at config-load time, the revision and tracked-only dirty state of
the worktree **being tested**, via `import.meta.dirname` (ESM — `__dirname` does not exist under
`"type": "module"`, which is what killed the predecessor `eb301c3a`). `scripts/suite-red-inventory.mjs`
copies those two values into the inventory's evidence header; it derives nothing and invokes no git.
Three rooted fixture arms cover clean / absent / dirty.

The point of the slice: a red inventory that does not name the commit it was taken against cannot be
audited later. It now names it, and names it for the **tested** tree rather than the caller's cwd.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, built in 1.03s |
| `npm run test:node-guards` | **354 tests / 351 pass / 0 fail / 3 skipped**, rc=0, 194.1s |
| — the 3 new reducer arms | ✔ captured revision · ✔ absent → unrecorded · ✔ dirty revision |
| — `law-pointer-guard` | PASS — "every law-surface pointer in this repo currently holds" |
| — `gate-caller-audit` | PASS (new test file rooted in the existing roster; no package change) |
| Boot probe `desktop-chrome`, `--workers=1` | rc=0, `expected:1 unexpected:0 flaky:0` |
| Boot probe `mobile-chrome` (390px), `--workers=1` | rc=0, `expected:1 unexpected:0 flaky:0` |
| Merge conflicts | none — 4 files, all LANE-TOUCHED, main moved only `STATUS.md` |

### The discriminating measurement

A fixture can only prove the reducer copies a value. The claim that actually needed earning is *whose*
revision gets captured. Real JSON capture from the gate worktree:

```
metadata = {"revision":"6c90357f16301b86d44dc2c6c4d4d9fa9f5bf132","dirty":false,"actualWorkers":1}
```

`6c90357f1` is the **gate worktree's** merge commit — **not** main's `4afb26bab`, which is what a
cwd-anchored implementation would have reported. This reproduces s1517's finding [2] independently, in
a third tree, from a different caller.

### Two results the runner did not claim, measured here

1. **`actualWorkers` survives.** Setting a `metadata` key on the config could have clobbered the
   runtime-injected `actualWorkers` that the inventory's existing *Harness* line already reports —
   a silent regression of shipped evidence. Playwright merges rather than replaces:
   `actualWorkers: 1` is present in both runs above. Hypothesis raised, measured, **false**.
2. **Both branches of `dirty` were exercised by the real instrument**, not only by fixtures. Desktop
   reported `dirty: false`; mobile, minutes later, reported `dirty: true` — because the desktop run had
   regenerated two tracked screenshots in between. Cause confirmed by reading the worktree's own
   `git status --porcelain --untracked-files=no` (2 modified PNGs). The flag tracked a real state
   change it was not told about.

### §3.1 compliance

Both Playwright runs passed `--workers=1` explicitly, and the JSON confirms `config.workers = 1` — the
`workers: isFireShell ? 1 : undefined` line still resolves correctly with the new `metadata` key beside
it. That line remains at `playwright.config.ts:50`; the new key was inserted **below** it at `:51`, so
the law pointers citing `:50` in `scripts/fire.md` and `.claude/skills/drain/SKILL.md` did **not** rot.
Verified by `law-pointer-guard`, not by eyeball.

## Findings

**F-1518-1 — the lane shell and the fire shell disagree about this battery, sixth consecutive
confirmation of F-1507-1.** The runner reported `test:node-guards` as **354 / 352 pass / 2 fail** on
Node **23.11.1**; the same battery on the same content under Node **26.4.0** is **354 / 351 pass /
0 fail / 3 skipped**, rc=0. The two lane reds are the known timeout-semantics split, and the extra skip
is version-gated. Non-blocking for this merge — the fire shell is the gating instrument and it is green
— but it is a fresh datum for the standing owner item **F-1507-1** (one line in `~/.zshrc`:
`nvm use 23` → `nvm use`). Every lane run until then gates against a knowingly different instrument.

**Non-blocking observation (no F-ID, no corrective owed).** The `import` and the `captureRevision`
declaration sit at the *bottom* of `playwright.config.ts`, below `export default defineConfig({...})`.
This is legal — ESM imports and function declarations both hoist, and the config demonstrably loads in
five real runs — but it reads oddly. Not worth a lane run on its own; fold it into the next task that
touches this file for another reason.

## Custody

Gated entirely inside `gate-s1518`, a detached worktree of this repository (§3.0b). Undecided content
never entered main's working tree. The two screenshots the probes regenerated were written **only**
there and died with it; main's `reviews/shots-prospector-presence/` is untouched. Worktree removed at
the end of the fire, `node_modules` symlink unlinked first.
