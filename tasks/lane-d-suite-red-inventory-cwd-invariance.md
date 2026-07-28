# Task lane-d-suite-red-inventory-cwd-invariance: make `scripts/suite-red-inventory.mjs` resolve spec files from the repo root instead of the cwd, and prove it with a test (LANE-D, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1197, 2026-07-29.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; `scripts/suite-red-inventory.mjs` (all ~240 lines — read `relative()` at :56-61, `testBody()` at :108-139, and the `masking` loop at :206-215, which is the call path that crashes); `scripts/run-guards.test.mjs` (**the house pattern you will copy: black-box `spawnSync` of the real script, `node:test` + `node:assert/strict`, fixtures under `os.tmpdir()`, one `test()` per claim**); `tasks/BACKLOG.md:118` (the finding — read it, then read the correction below, because **the finding is wrong about where the defect is**); `package.json` (the `test:node-guards` line — an EXPLICIT ENUMERATED LIST, currently **13** files, not a glob).

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main OR is preserved on another ref (verify via git log/diff/for-each-ref), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main and NOT on any other ref (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ⚠️ **READ THIS BEFORE YOUR PRE-FLIGHT STOPS YOU — `lane/perf` IS A DELIBERATE SPECIAL CASE AND A NAIVE CHECK WILL HALT ON IT.** `lane/perf` is **2 ahead of main** (`8f1264de` "lane-boss-detail-adoption", `e2838ce3` "lane-d-suite-red-inventory"), and that content is genuinely **NOT on main** — it includes `logs/suite-red-inventory-raw.json`, a **171,333,533-byte** file that cannot reach origin (>100 MB, F-1167-3, on the owner's desk). **A plain "is every ahead commit merged?" test answers NO and STOPs. Do not stop.** The reset is **loss-free, and the authoring fire re-verified it at source rather than inheriting the claim**: `git for-each-ref` shows `refs/heads/archive/suite-red-inventory-raw-171mb` and `refs/heads/lane/perf` **both resolving to the identical commit `8f1264deef4a43946576f731705e47c79c7509b3`**. Same commit ⇒ same tree ⇒ same blobs, and **a branch reset cannot gc an object another ref still pins.** The archive branch was created *after* the freeze that `BACKLOG:30` records, which is why that line was right when written and is stale now (F-1196-1, s1196). ✅ **Therefore: reset `lane/perf` to main and PROCEED.** Verify the archive ref yourself in one command before you do (`git rev-parse lane/perf archive/suite-red-inventory-raw-171mb` — the two hashes must match); if they do **not** match, STOP and report, because then the premise of this paragraph has changed.

## Why (F-1167-4, `tasks/BACKLOG.md:118`, raised s1167, unactioned since)

Verbatim from the ledger:

> 🔻 **F-1167-4 (minor) — `scripts/suite-red-inventory.mjs:57` resolves paths with `path.relative(process.cwd(), …)`, so the report is only byte-reproducible from `worktrees/lane-d`.** Harmless to the classification (only the displayed path prefix moves), but a future re-reduction expecting byte-identity must match the cwd, or the script should normalise to the repo root.

### 🔑 THE FINDING IS RIGHT THAT THERE IS A CWD DEPENDENCY AND WRONG ABOUT ALL THREE OF ITS SPECIFICS. THE AUTHORING FIRE MEASURED THIS; DO NOT RE-DERIVE IT, AND DO NOT FIX THE LINE THE FINDING NAMES.

If you patch `:57` you will have changed a line that **never executes for real input**, and the finding will look closed while the defect survives. All three corrections below were measured by running the real reducer, not by reading it:

1. **`:57` NEVER FIRES.** That branch is `if (path.isAbsolute(file))`. Playwright's JSON reporter stores `spec.file` **relative to `rootDir`** — the real 171 MB raw's first entry is `"file": "_s106-prospector-boot-probe.spec.ts"`, a bare filename. `path.isAbsolute()` is **false**, so the operative branch is the fallback at **`:59-60`** (`path.join('e2e', file)` + `fs.existsSync`), whose `existsSync` probes are cwd-relative. **The defect is in the `existsSync` fallbacks, not in the `path.relative` call.**

2. **"Only byte-reproducible from `worktrees/lane-d`" is FALSE.** Measured: the same fixture reduced from the **repo root** and from **`worktrees/lane-d`** produced **byte-identical** output (1737 bytes, both arms). Any cwd where `e2e/<file>` resolves reproduces the report. lane-d was never special.

3. **"Harmless … only the displayed path prefix moves" is FALSE, and this is the part that matters.** From a cwd with no `e2e/` directory, `relative()` falls through to the **bare filename**, and `testBody()` at **`:109`** then calls `fs.readFileSync(execution.file)` on it. **The file has zero `try`/`catch` anywhere**, so the process **dies**. Measured, from `cwd=/tmp`:

```
exit=1
Error: ENOENT: no such file or directory, open '058-device-tiers.spec.ts'
    at Object.readFileSync (node:fs:539:20)
    at testBody (.../scripts/suite-red-inventory.mjs:109:21)
    at .../scripts/suite-red-inventory.mjs:212:41    <- the `masking` loop
  path: '058-device-tiers.spec.ts'
```

**No output file is written at all.** So the real behaviour is not a cosmetic prefix shift — it is a **hard crash with no report**, and it is reached only when a `BOTH`-bucket pair exists (`:209` skips the loop otherwise), which is why it has gone unnoticed.

⇒ **The finding's recommendation ("the script should normalise to the repo root") is directionally correct. Its diagnosis is not.** Fix the resolution, at the sites that actually run.

## The mechanism, ALREADY MEASURED — reuse it, do not invent another

The authoring fire proved the whole test approach before writing this task, with a **~1 KB fixture** — **the 171 MB raw is NOT needed and must NOT be used.** A minimal Playwright-shaped JSON (`{config:{}, suites:[{title, file, specs:[{title, line, tests:[…]}]}]}`) with the **same** test failing under **both** `desktop-chrome` and `mobile-chrome` produces a `BOTH` bucket, which is what reaches the crashing `masking` loop. Spawn the real script with an explicit `cwd` and **absolute** input/output paths, and diff the two outputs.

Measured today on current main, three arms, same fixture:

| cwd | exit | output |
|---|---|---|
| repo root | 0 | 1737 bytes |
| `worktrees/lane-d` | 0 | 1737 bytes, **byte-identical to repo root** |
| `/tmp` | **1** | **not written** (ENOENT above) |

## Scope

1. **Derive the repo root from the script's own location, not the cwd.** At module scope in `scripts/suite-red-inventory.mjs`, compute e.g. `const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')` (add the `node:url` import). This is correct under worktrees: run from `worktrees/lane-d`, the script's own path is inside that tree, so `ROOT` is that tree and it keeps reading that tree's `e2e/` files — which is the behaviour the two identical arms above already exhibit, and which must not change.
2. **Fix `relative()` (`:56-61`) to resolve against `ROOT`.** The `isAbsolute` branch computes its path relative to `ROOT`; both `existsSync` probes test `path.join(ROOT, …)`; the returned string stays **repo-root-relative and `/`-separated exactly as today** (e.g. `e2e/058-device-tiers.spec.ts`). The return value's *shape* is the report's content — **do not change it.**
3. **Fix the read at `:109`** so `testBody` opens the spec file at `path.join(ROOT, execution.file)` rather than at a cwd-relative path. Keep `ts.createSourceFile`'s first argument as the **root-relative** name so nothing in the output text changes.
4. **Create `scripts/suite-red-inventory.test.mjs`** in the house style of `scripts/run-guards.test.mjs`: black-box `spawnSync` of the **real** script resolved via `fileURLToPath(new URL('./suite-red-inventory.mjs', import.meta.url))`; one fixture helper that `fs.mkdtempSync`es a temp dir and writes the small JSON; **every** spawn passes an explicit `cwd`, absolute input/output paths, and a `timeout`. Build the fixture's `file` value by **discovering a real spec at runtime** — `fs.readdirSync(path.join(ROOT,'e2e')).find(f => f.endsWith('.spec.ts'))` — so the test does not rot when any one spec is renamed.
5. **Test — the central claim: the reducer is cwd-invariant.** Reduce the same fixture from (a) the repo root and (b) `os.tmpdir()`. Assert **both exit 0** and the two output files are **byte-identical**. This single assertion is the whole point of the slice: on current main arm (b) exits 1 and writes nothing.
6. **Test — the output is still correct, not merely stable.** Assert the emitted failure row's file cell is the **root-relative** `e2e/<spec>` form (guard against a "fix" that makes both arms equally wrong by emitting bare filenames — identical-but-broken would satisfy scope 5 alone).
7. **Wire it into the gate, or it is an unread verdict.** Append `scripts/suite-red-inventory.test.mjs` to the enumerated file list in `package.json`'s `test:node-guards`. **Report the guard count before and after.** ⚠️ **The current healthy count is 65, NOT the 61 that older reviews and handoffs cite** — it moved in s1196 (`4499e696`); if you observe 61 you are on a stale tree, and if you expect 61 you will misread a green as drift.
8. **Prove the test catches the defect — mutate the SUBJECT, never the test.** After green, revert your `:109` change alone (restore the cwd-relative read), re-run the new test, and confirm it **FAILS**; then restore. Report which assertion failed and confirm the subject is byte-identical afterwards (`git diff --stat` clean for that hunk). A test that has never been seen to fail has not been shown to work.

## Firewall

**Touch ONLY:** `scripts/suite-red-inventory.mjs` (the three resolution sites in scopes 1–3 **and nothing else**) · `scripts/suite-red-inventory.test.mjs` (new) · `package.json` (the `test:node-guards` line **only** — one line, adding one filename).

**NO changes to:**
- ⛔ **The argv-supplied input/output paths (`:6-9`) — LEAVE THEM CWD-RELATIVE.** They are ordinary CLI arguments and a caller passing a relative output path expects it relative to *their* cwd. Normalising them to `ROOT` would be a silent CLI behaviour change, and it is **explicitly out of scope**. Only *spec-file resolution* is the defect.
- ⛔ **`logs/suite-red-inventory.md` and `logs/suite-red-inventory-raw.json` — ZERO bytes, do not regenerate, do not open the 171 MB raw.** The committed report is a **measurement artifact** of a specific run (s1180/s1194 treat it as such; s1196 appended to it rather than editing it). **The default output path is `logs/suite-red-inventory.md`, so any run of this script without an explicit output argument OVERWRITES it — always pass both paths explicitly, in the test and by hand.**
- ⛔ Any `src/**`, any `e2e/**` (including creating fixtures there), any other `scripts/*.mjs`, any other `package.json` script, `playwright.config.ts`, `tsconfig.json`.
- ⛔ **No fixture written inside the repo tree** — `os.tmpdir()` only, cleaned up in the test.
- ⛔ Do not "improve" the reducer's classification, buckets, table columns, or error handling. **Adding a `try`/`catch` around `testBody` is NOT the fix** — it would convert a crash into a silently degraded report, which is worse. Resolution is the fix.

## Self-check (evidence, not vibes)

- `node --test scripts/suite-red-inventory.test.mjs` → **exit 0**; report the test count and run it **twice** with both wall times.
- `npm run test:node-guards` → **exit 0**, and **print `echo $?` explicitly as a number** — this repo's own history (F-1125-1) is a counter that printed a green while the exit code was 1. Report the count **before (65) and after (66)**.
- **The cwd matrix, run by hand and reported as a table**: the reducer on your fixture from the repo root, from `worktrees/lane-d`, and from `os.tmpdir()` — exit code and output byte-count for each. **All three must be exit 0 and identical byte-counts.** State the byte count.
- **The mutation result** (scope 8): which assertion failed, and confirmation the subject was restored.
- `npx tsc --noEmit` → 0 errors. `npm run build` → green, report the seconds. (Note `scripts/**` is outside `tsconfig`'s `include`, so tsc does **not** cover your edit — the new test is the only gate on it. Say so.)
- **No playwright, and that is proportionate, not thinned** — this slice adds zero `src/` and zero `e2e/` bytes and renders nothing, so Mistake #10's "where does the PLAYER see this?" answers *nowhere, by construction*. Say so rather than leaving it implied.
- Show the **full `git diff --stat`** of your commit. It must be exactly three files.

## No-op guard

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report: the cwd matrix table with real numbers · the node-guards count **before and after**, each as a number · the exit code of every self-check command · the mutation outcome (scope 8) · whether the output text changed at all for a tree-root run (it must **not**) · the final `git diff --stat`.
