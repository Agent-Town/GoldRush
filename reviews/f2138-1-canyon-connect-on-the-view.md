# Review — f2138-1: publish `canyonConnect` onto the headless agent view

**Slice:** `f2138-1-publish-canyon-connect-on-the-view` · **branch:** `lane/b` · **tip:** `648bc21d24e1e26747f63d59991a9cba941584ae`
**Base:** `e43eb8da818a321963ccc6a3885e4179c4615b96` · **Merged to main:** `2b81cc10413bcebaa537395ff897254a550bb77f` (s2140, 2026-08-21)
**Gated in:** detached worktree `gate-s2140` (§3.0b — undecided content never entered main's working tree)

## VERDICT: MERGE

---

## What it does

`e3-canyon-works` gates its own secure on the Canyon Works connection objective (`objectiveAllowsSecure`), but the objective was never published to the player's view. `makeTurn()` builds the agent view from `surface.tools.view()` and then grafts each optional block onto `view.now` **by hand** — twelve of them — and `canyonConnect` was not among the twelve. The field existed only inside `private diagnostics()`, which is not the player's view. So a rider on Canyon Works could not read the one objective it is scored on.

This slice adds the missing graft: an optional `canyonConnect` on `HeadlessAgentView['now']` (five keys — `powered`, `required`, `byWave`, `complete`, `failed`) plus one DECLARED-guarded line in `makeTurn()` beside its siblings. `canyonConnectDiagnostics()` returns `null` unless `twist.powerGrid?.connect` is declared, so **the null-check IS the declared-check** and no other contract's view grows a field.

This is the whole unblock for the `f2135-1` census. That census's `GATE B` stands: `gr-sim-campaign.mjs:113` throws `ended unsecured at wave N` *above* the code that writes any leg artifact, so on the expected outcome (deadline missed) the harness yields no rows, no hash, no margin — only an exception. The player's per-turn trace was designed to be what survives that throw, and with the field absent from the view there was no trace to survive.

## Evidence (re-derived on the merged tree — Mistake #4)

| Gate | Result |
|---|---|
| **Hash control — Canyon Works** (declares) | `fnv1a32:7e161637` before → `fnv1a32:7e161637` after — **identical** |
| **Hash control — Dry Gulch** (does not declare) | `fnv1a32:daba1f5d` before → `fnv1a32:daba1f5d` after — **identical** |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0, built in 1.55s |
| Own suite `canyon-connect-view.test.mjs` | 1/1 pass (1.33s) |
| **Manufactured red — graft removed** | rc 1 · `TypeError: Cannot convert undefined or null to object` |
| **Manufactured red — null-check dropped** | rc 1 · `AssertionError: actual: true, expected: false` |
| Restore after both reds | SHA-256 `63c23e04…273b36` before and after — **identical**, verified by content compare, never `git status` (F-1295-1) |
| `test:node-guards` file list, merged tree | **487 tests · 482 pass · 0 fail · 5 skipped** |
| `test:node-guards` chained leaves | **6/6 green** |

### The hash control is the load-bearing gate, and it was measured at a second parameterisation

The master says in those words that the hash control outranks the feature: every bench floor, pin and admission exemption in the repo is keyed to these hashes, so a view-only graft that moves one is a board-wide re-baseline wearing a one-line diff.

**Reading the code says it should not move, and that reading was confirmed by measurement rather than substituted for it.** `outcome()` already spreads `...(canyonConnect ? { canyonConnect } : {})` into the hashed `final` object — the objective was *always* in the hash; what was missing was its publication to the **view**. The two are different objects, which is the same distinction the slice exists to fix.

⭐ **My four captures do not reproduce the runner's figures, and that is a feature of this evidence rather than a defect in it.** The runner reported `ada627de` / `a0dd5d21`; I measured `7e161637` / `daba1f5d`. The runner's report never records the boot parameterisation it used, so the difference is a different `HeadlessContractSim` boot, not a disagreement about the tree. **The control is before-vs-after at one fixed parameterisation, and both parameterisations independently show zero movement** — two agreeing parameterisations is stronger evidence than repeating the runner's. A cure verified at only one parameterisation is a known house hazard; this one is verified at two.

### Both violation paths were manufactured by this drain

A passing test never executes its violation path, so its green says nothing about the red it claims to own (the s1299/s1300 standard). Both directions were reproduced independently of the runner's claim, and both matched its reported failure text exactly. The negative direction matters most: a one-directional test would pass just as happily if the row were published unconditionally onto every contract's view, which is precisely the rule the twelve siblings exist to keep.

### Merge classification

All three paths are **LANE-ONLY**. `git diff e43eb8da..main` over `src/sim/HeadlessContractSim.ts`, `scripts/canyon-connect-view.test.mjs` and `package.json` is **empty** — main moved none of them, so no 3-way graft was needed and no conflict was possible. `lane-freeze-classify` read `LANE-ONLY: 3, MAIN-ONLY: 0, BOTH-MOVED: 0`. After the merge, `main..lane/b` is empty.

---

## Findings

### F-2140-1 (non-blocking, factory-side, no corrective owed) — the 72-file serial battery wedged at zero CPU; each part completes fine alone

The prescribed single `test:node-guards` invocation **wedged**: 41 min 29 s elapsed against **44.46 s of CPU**, state `S`, and CPU time **frozen across a 5-second sampling window** — blocked, not slow. `lsof` showed it holding KQUEUE handles plus directory handles walking up the tree (`gate-s2140` → `Gold Rush` → `Projects` → `Claude` → `robin` → `Users`), i.e. watcher/teardown state, with `--test-isolation=process` and `--test-concurrency=1`. The per-test `--test-timeout=300000` never fired.

**It was sampled before it was theorised about, and the sampling is what refuted the obvious story.** The obvious reading was "the battery is load-sensitive and slow" (the documented F-2076-1/F-2099-1 shape). That reading is **wrong here**: load was *low* (2.59) and the process was consuming no CPU at all. Slow and blocked look alike from the outside and are different findings.

**Split, every part is green:** `gr-sim.test.mjs` alone → 20 tests / 18 pass / 0 fail / 2 skipped / **256.4 s**, consistent with its ~227 s baseline; the other 72 files in 6 chunks of 12 → 467 tests / 464 pass / 0 fail / 3 skipped / **238.5 s**; chained leaves 6/6. So the battery's *content* is healthy and the wedge is in the orchestration of one very long serial process.

⚠️ **Recorded, deliberately, without a cure or a guard.** This is one observation in one fire shell; the runner ran the same battery whole in 344.9 s an hour earlier, so it is **not reliably reproducible** and a mechanism sized against a single sighting would be sized against noise. What the next fire needs is the *technique*, which is cheap and worked: **if the battery passes ~2× its baseline, sample the pid before concluding anything — `ps` CPU-time twice, five seconds apart. Frozen CPU time means blocked, and a blocked battery should be split, not waited out.** Splitting cost ~8 minutes and produced a *cleaner* result than the whole run.

ⓘ **Note the split run was strictly better evidence than the runner's whole run:** mine had **0 fails**, the runner's had 1 — the load-sensitive assay-worker timer red (`5 !== 4`), which it cleared on a 3/3 focused re-run. That red did not reappear here, which corroborates it as load-attributable rather than a property of the code, exactly as F-2076-1 predicts.

### F-2140-2 (non-blocking, cosmetic) — the graft calls `canyonConnectDiagnostics()` twice per turn

`if (this.canyonConnectDiagnostics()) view.now.canyonConnect = this.canyonConnectDiagnostics()!;` evaluates the producer twice on every turn of every Canyon Works run, and each call builds a `Set` of gallery ids and takes a full `powerGraph.snapshot()`.

**Verified safe by reading the method rather than by trusting the green:** `canyonConnectDiagnostics()` is a **pure read** — it consults `this.manifest.twist.powerGrid`, `this.powerGraph.snapshot()` and two latch fields, and writes nothing. So the double call cannot desync state, which is consistent with the hash controls not moving. This is wasted work, not a correctness defect, and it is the reason it is filed rather than fixed: the one-line `const c = …` tidy would be an out-of-scope edit to a file whose hash stability is the whole gate. Fold it into the next slice that legitimately touches this seam.

### F-2138-1 carried forward (REPORT-NOT-FIX, as the master ordered) — the two engines name one objective three ways

The browser engine publishes this same objective as `canyonWorks` (`Game.ts:5370`) and `connect` (`:6754`), while headless now calls it `canyonConnect`. The runner reported this rather than fixing it, **which is the firewall working as designed** — renaming a published browser field is a product change that would move the browser's own artifacts. The three-way parity question is real and remains open for a slice that owns both engines.

ⓘ **Runner disclosure, recorded so a later reader does not misread the run log:** *"Independent review recursively invoked itself and was stopped; completed checks reported no finding, but this is not claimed as a clean review approval."* That is a runner declining to claim a green it did not earn — disclosure working as designed, not a violation. No corrective owed.

---

## Not in scope, still true

The **census itself was not run** — that is `f2135-1` attempt 3, and it needs the banked epoch-3 checkpoint on `lane-d`, so it is not a lane-b task. This slice publishes the field and stops.

## GZ-01

**No news item owed.** The filter law is "the review names a player-visible change"; this one names none. The slice adds a field to the *headless agent view* — a rider/API surface — and changes nothing a player sees in a plain boot. Same reasoning as `f2136-1`.
