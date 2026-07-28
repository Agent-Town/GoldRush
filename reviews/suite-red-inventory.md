# suite-red-inventory — drain review (s1167)

- **Slice:** `lane-d-suite-red-inventory.md` (authored s1159 fire)
- **Branch / tip:** `lane/perf` @ `e2838ce3` (runner commit 2026-07-28T12:48:01+07:00)
- **Base:** merge-base `11c4d35c` — branch was **51 behind** main
- **Merged to main:** see drain commit
- **§3.0 `drain-block-check`:** ✅ **CLEAR** — `lane-d-suite-red-inventory.md [factory-suite-red-inventory] status="queued"`. Run as the first command of the drain, before I read the report or formed any opinion.

## Verdict: **ACCEPT — merged.**

The first machine-readable red list the factory has ever had. It is honest, it is reproducible, and the one place where my own instrument disagreed with it, **it was right and I was wrong**.

## What it does

Runs the full desktop+mobile e2e suite once, keeps the raw Playwright JSON, and reduces it with a committed script into a report that classifies every failing logical test as **BOTH / MOBILE-ONLY / DESKTOP-ONLY**, plus masking ratios (how early in a test body the first failure lands, i.e. how much of the test never runs), an incomplete-comparison list, and a crash/timeout table. Measurement only — it repairs nothing, which was its firewall.

## Merge classification

Two-dot `main..e2838ce3` reports 66 files, but that is the **stale-base phantom-deletion** shape (Mistake #15 family): the branch is 51 commits behind, so everything main has landed since — the E7/E8 art, the reviews, the goals.json edits — reads as a deletion. The real diff is the runner's own commit, and it is **three files, pure add, zero deletions**:

| File | Class | On main before? |
|---|---|---|
| `logs/suite-red-inventory-raw.json` | LANE-TOUCHED (add, 171 MB) | absent (`git ls-files` empty) — **compacted before landing, see F-1167-3** |
| `logs/suite-red-inventory.md` | LANE-TOUCHED (add, 550 lines) | absent |
| `scripts/suite-red-inventory.mjs` | LANE-TOUCHED (add, 322 lines) | absent |

No file was touched by both sides ⇒ **no 3-way graft needed**; landed with a path-scoped `git checkout e2838ce3 -- <3 paths>` onto main. Zero `src/`, zero `e2e/`.

**What actually landed** (after F-1167-3): `logs/suite-red-inventory.md`, `scripts/suite-red-inventory.mjs`, `logs/suite-red-inventory-compact.json` (2,358,427 B in place of the 171 MB raw), `scripts/suite-red-inventory-compact.mjs`, this review, the `goals.json` leaf, and four `logs/session-scratch/s1167-*.mjs` probes.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green**, `✓ built in 2.03s`, asset-diet banner normal |
| `scripts/goal-tracker.test.mjs` | **2/2 pass**, run before the commit that edits `goals.json` |
| **Reducer reproducibility** | `node scripts/suite-red-inventory.mjs <raw.json> <fresh.md> --positive-control-passed` → **`diff` byte-IDENTICAL** to the committed report |
| Independent re-derivation | see table below — **every headline exact** |
| Playwright battery | **deliberately NOT run** — see below |

### Why no playwright battery

The merged diff contains **zero `src/` and zero `e2e/`** — one `.mjs` reducer and two data files. There is no runtime surface to drive, so a battery would gate nothing. Independently, the **ART slot was live for this fire's whole length** (attempt-2 `art-e9-town-icons`, run file `20260728-125817` status `running`), and F-1160-2 is explicit that measurement under load is invalid. Running 2,388 tests against a box mid-image-generation would have produced a number no one could trust. Same reasoning s1166 applied to the art STOP drain.

### Independent re-derivation (the instrument control)

The report is checked two ways, because checking it with its own reducer is tautological — the s1162 second-kernel lesson.

1. **Provenance:** re-running the committed reducer over the committed raw JSON reproduces the committed report **byte-for-byte**. The report is *derived*, not hand-written.
2. **Independence:** a from-scratch instrument (`logs/session-scratch/s1167-independent-count.mjs`) that shares **no code** with the reducer, written from the Playwright JSON shape alone:

| Statistic | Report | My instrument | |
|---|---:|---:|---|
| Total target executions | 2388 | 2388 | ✓ |
| Passed | 2006 | 2006 | ✓ |
| Failed | 303 | 303 | ✓ |
| BOTH | 135 | 135 | ✓ |
| MOBILE-ONLY | 17 | 17 | ✓ (**same 17 tests**) |
| DESKTOP-ONLY | 11 | 11 | ✓ |
| Incomplete | 5 | 5 | ✓ |
| Other-project failures | 1 | 1 | ✓ |
| Timeouts | 42 | 42 | ✓ |
| **Crashes** | **0** | **1** | ✗ → **report correct** |

**The one disagreement resolved in the report's favour, and that is worth recording.** My crash regex matched `m1-06-level-up-choices.spec.ts:137`, whose error text contains *"Target page, context or browser has been closed"*. Reading it: the result status is **`timedOut`**, and that line is the **teardown consequence** of the 30 s timeout, not a browser crash. Playwright's own histogram over all 2,396 executions is `{passed 2006, skipped 86, failed 262, timedOut 42}` — **no `crashed` or `interrupted` status exists in the run at all**. I built the mutation to refute the report; the report survived and my instrument was the flawed one.

## Findings

### F-1167-1 — **EIGHT specs share ONE broken contract, and the report's own masking table shows only four of them.** (non-blocking; merged; next-fire actionable)

The inventory lists faults but does not **group** them. Clustering the 303 failing executions by error signature (`logs/session-scratch/s1167-fault-classes.mjs`) gives 26 signatures, of which the top 14 cover **91.7%**. Inside that, one class stands out:

**All eight `town-*-blender.spec.ts` pilots fail the same assertion, at two sites each — 32 failing executions, ~10.6% of the entire red board.**

✓ **VERIFIED by reading the assertion sites, not by matching messages:** `town-chapel-blender.spec.ts:154` and `:207` are both `expect(modelRequests).toEqual([])`, and `town-plaza-props-blender.spec.ts:48` is `expect(requests).toEqual([])` — the **town lazy-GLB contract**: *no `.glb` is fetched while the pilot is `off`/`facade`*. Same for assay-office, claim-office, general-store, plate, schoolhouse, tavern.

⚠️ **The report's masking table surfaces only ranks 9–12** (chapel, assay-office, schoolhouse, claim-office) because it ranks by failing-line/body ratio, and the other four sit below its top-12 cut. **A fire reading only that table would repair four instances of a one-cause fault and believe it was done.**

? **INFERRED, not verified:** `asset-diet.spec.ts:101` (`townResponseBytes < 25_000_000`, BOTH) is plausibly the *same* mechanism measured in bytes rather than requests — that would make the class 34 executions — but I did not trace it to a shared cause and it must not be assumed.

**I then tested my own recommendation instead of shipping it, and it needed correcting twice.**

**(1) The data contains its own control.** There are **ten** `town-*-blender` specs, not eight. Two are **fully green** — `town-dynamo-hall-blender` (12/12) and `town-stamp-mill-blender` (10/10) — and they carry the **same** `expect(requests).toEqual([])` assertion. ✓ Verified they *ran and passed* rather than being skipped (the report has 86 skipped executions, so absence from the red list proves nothing on its own). The eight red ones fail **exactly 4 executions each** (2 sites × 2 projects). A natural A/B was sitting in the run.

**(2) The mechanism, found at source.** `src/town/TownTavernPilot.ts:43` `townPrefetchUrls()` builds a speculative prefetch list of every pilot GLB — filtered at **`:49`** by `.filter(([id]) => id !== 'stamp-mill' && id !== 'dynamo_hall')`. **The two excluded ids are exactly the two green specs.** Its only caller is `src/assets/AdvanceStream.ts:30`, the idle-time asset warmer. So the eight specs are not a mysterious regression: **a prefetcher fetches those GLBs before the pilot mounts, which is precisely what their assertion forbids.**

**(3) The dates settle authorship, and they are unambiguous.** All ten blender specs were added **2026-07-13**. The Advance Stream merged **2026-07-25T10:36 (`e109639f`)** — and `git log -S` proves **the exclusion filter was introduced in that same commit**. Whoever shipped the prefetch excluded two models so their specs stayed green, and left the other eight red.

⚠️ **THEREFORE THIS IS NOT A REPAIR TASK — IT IS AN OWNER FORK, AND I DID NOT AUTHOR IT (§2E hard limit).** The Advance Stream is a **ratified owner directive**, quoted verbatim at `tasks/BACKLOG.md:879`: *"Could we start downloading all the assets as soon as the player visits the start page? Basically streaming in advance?"* The eight assertions and that directive **cannot both be satisfied**:

- **(a) the prefetch is right** → the eight `toEqual([])` assertions are **obsolete**, and should be re-scoped to assert *mount* laziness rather than *any-fetch* laziness. **Then the two exclusions at `:49` are themselves the bug** — they quietly deny the owner's warm-town benefit to two models purely to keep two specs green. **Recommended.**
- **(b) pilot GLBs should not be prefetched** → extend the filter to all pilots; the eight reds are then a genuine regression.

⚠️ **One fact must not be folded into that fork:** `asset-diet.spec.ts:101` (`townResponseBytes < 25_000_000`) now fails **BOTH**, yet `BACKLOG.md:879` records that the Advance Stream's own drain gated asset-diet **4/4 against the production bundle, with the prefetch live**. So the 25 MB budget held on 07-25 and does not now. **That is a separate, real regression** and it is the one piece of evidence that could argue against (a). Do not merge the two questions.

🔑 **This is also the inventory paying for itself on its first day:** eight specs went red on 2026-07-25 and nobody noticed for three days, because until this merge the factory had no machine-readable red list.

### F-1167-2 — the timeout bucket is measured under contaminated load (carried from s1166, re-confirmed)

42 of 303 failures (13.9%) are timeouts, and s1166 flagged that this run took **nine hours on a box that also carried two ART generations**. The evidence in the data supports the warning: `066-walk8-engine` and `bt-01-tiers` show **41 s** durations against a **30 s** timeout, and `m1-06`/`m2-01`/`e5-arsenal` appear in the MOBILE-ONLY list *via timeout*. **Do not treat MOBILE-ONLY-by-timeout as a mobile-specific defect** without a quiet-box re-measure. Non-blocking for the merge — the inventory is still the best red map we have — but it bounds what may be concluded from it.

### F-1167-3 — **SELF-INFLICTED AND FIXED IN THE DRAIN COMMIT: merging this artifact verbatim made main permanently unpushable.**

The run's JSON is **171,333,533 bytes**. My first version of the drain commit merged it as-is; the backup push then came back:

```
! [remote rejected]   main -> main (pre-receive hook declined)
```

GitHub hard-limits a single file at **100 MB**, so that blob could never reach origin — and because git ships history, **no later commit could have fixed it**. My own drain had broken the Backup Law (Mistake #11, "The Missing Remote") for every subsequent fire, silently, while the review said ACCEPT.

✓ **Measured the cause rather than guessed it** (`logs/session-scratch/s1167-json-weight.mjs`): **97.7% of the file is `attachments`** — base64-inlined screenshots and traces — against 0.3% for `error` and 0.2% for `errors`. The reducer reads `status`/`duration`/`errors`/`error`/`errorLocation`; ✓ `grep` confirms it contains **no reference to `attachments`, `stdout`, `stderr` or `annotations`** at all.

**Fix:** `scripts/suite-red-inventory-compact.mjs` strips the 1,061 attachment payloads (keeping each entry's `name`/`contentType` plus a `stripped: true` marker, so the file is self-describing) → **2,358,427 B, a 98.6% cut**. This is **compaction of a tracked file, which CLAUDE.md §4.10b expressly permits**, not deletion of untracked history.

**Proven lossless, not assumed:** reducing the compacted file reproduces the committed report **byte-for-byte**. The drain commit was **amended rather than followed up** — it had never been pushed (the push is what failed), so this rewrote nothing shared. ✅ The retry then landed `a2141348..7a457025`.

**Retention:** the full 171 MB original is untouched — on disk at `worktrees/lane-d/logs/suite-red-inventory-raw.json` and committed on `lane/perf` @ `e2838ce3`. Only my own duplicate (created by my `git checkout` minutes earlier) was removed, and the removal script **asserted the original's existence and exact byte size first, aborting otherwise**.

🔺 **OWNER'S DESK, one line:** the full raw can *never* reach origin under the 100 MB limit. If a byte-exact Playwright raw is wanted durably off-disk, that needs **Git LFS or external storage** — an owner call (§7.3, external services). Until then the raw is F-1120-2 class: **at risk, dies with the disk**. The compacted file is a complete substitute for every known consumer.

### F-1167-4 — the reducer's output depends on the directory it is run from (minor)

`scripts/suite-red-inventory.mjs:57` resolves spec paths with `path.relative(process.cwd(), file)`. Run from the repo root it emits `worktrees/lane-d/e2e/...`; run from the lane worktree it emits `e2e/...`. **The committed report is therefore only reproducible from `worktrees/lane-d`** — which cost me one confusing diff before I read the function. Non-blocking (the classification is unaffected; only the displayed path prefix changes), but a future re-reduction that expects byte-identity must match the cwd, or the script should normalise against the repo root.

## Duties

- **ART AUDIT:** not owed — I neither drained, refilled, nor processed the ART slot (it was live throughout and I did not touch it).
- **ASSAYER:** `assets/crafting-queue/pending/` — listed, **empty**. No verdict owed.
- **GAZETTE:** **no item.** The filter law applies: nothing player-visible merged (two log files and a reducer script). Filter working as designed.
- **TK-01:** **not owed** — re-derived at the file's own header, not inherited: `ticker-digest-2026-07-27.md` states it covers 07-27; today is 07-28, so the next digest is owed after 06:00 on **07-29**.
- **DEPLOY:** **skipped** — zero `src/` merged.
- **Cleanup:** the reproduction artifact I generated in the lane worktree (`worktrees/lane-d/logs/s1167-reproduced.md`) was removed after the diff; the lane is left as the runner made it.
