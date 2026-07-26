# Review — blocked-storage-boot-3 (rf-22): the exported guard, and the seven sites that did not need it

**Slice:** `lane-blocked-storage-boot-3` · goal leaf `rf-22-blocked-storage-boot-3`
**Branch/tip:** `lane/m3 be020fc7` (single commit, parent `93c494f3` = clean main at authoring)
**Drained by:** s1084 fire, 2026-07-26
**Merge base:** `93c494f3` · **Merged to main at:** see drain commit (registered in `tasks/goals.json`)

## VERDICT: MERGE — with the honest note that this round is far smaller than its master expected, and the reason is a *good* one.

## What it does

Round 3 of the blocked-storage thread. The master's premise (F-1083-1) was that `rawGet`/`rawSet` in `ProfileStorage.ts` are module-private, so the other 20 files touching storage *cannot reuse the guard* — forcing every round to add another local `try`/`catch`. The task ordered: export one guarded accessor, then re-point the **seven** enumerated boot-path sites at it.

Codex did the first half and then reported that the second half **was not needed**: all seven named sites were *already* self-guarded, so re-pointing them would have been churn. Scope item 2 explicitly authorised exactly this answer — *"if any is already guarded … leave it alone and say so in your report (a stale premise is a finding, not an obstacle)."* It also added the mandated scope-6 assertion to the existing oracle.

Net diff: **3 insertions / 2 deletions across 2 files.**

- `src/game/ProfileStorage.ts` — `rawGet` and `rawSet` gain `export`. Bodies untouched; `nativeStorage`/`isNativeStorage` behaviour preserved byte-for-byte. Purely additive to the module's surface.
- `e2e/task-024-blast-aim-presets.spec.ts:161` — one derived assertion on the existing storage-blocked oracle: `expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks)).toBeTruthy()`.

**No player-visible change.** No behaviour change in a working browser. Per the GZ-01 filter law, **no gazette item** is owed for this merge.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `src/game/ProfileStorage.ts` | **LANE-TOUCHED only** | straight graft |
| `e2e/task-024-blast-aim-presets.spec.ts` | **LANE-TOUCHED only** | straight graft |

`git diff 93c494f3 main -- <both files>` is **EMPTY** — main never moved either file since the base (main moved only `STATUS.md`, `logs/*`, `tasks/BACKLOG.md`). No MAIN-MOVED side, no 3-way. Graft verified **byte-identical to `be020fc7`** *after* application, and re-verified again after the mutation control below (F-1080-B discipline: the tree measured is the tree that merged).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **exit 0** (3.36s) |
| `npm run build` | **exit 0** (14.20s wall; `✓ built in 1.08s`) |
| Six-suite battery, both projects, `--workers=1` | **52 passed / 0 failed, exit 0, summary line PRESENT** (F-1081-6 check) — 3.3m |
| Storage-blocked oracle `task-024:130` (the slice's own test) | ✓ desktop **3.8s** · ✓ mobile **3.3s** |
| Plain-boot console probe, no `?debug` | **0 errors · 0 warnings · 0 pageErrors · 0 "Tile state read failed" warns**, desktop 1280×800 **and** 390×844 — `PROBE CLEAN` |
| Server provenance (F-1077-3) | scratch vite :5253, listener **pid 71696 cwd proven** `= /Users/robin/Claude/Projects/Gold Rush` via `lsof -d cwd` before any number was trusted |

Battery = `task-024-blast-aim-presets` + `profile-first-boot` + `m3-06-demo-profiles` + `board-gating-and-profiles` + `tp00-tile-persistence` + `e6-tile-consumers`. 52/0 matches the master's stated `2cd221d1` baseline exactly.

## F-1084-1 — THE 52/0 BASELINE IS ONLY TRUE AT `--workers=1`. THREE MORE TESTS ARE LOAD-SENSITIVE.

My first battery run (default parallel workers) came back **49 passed / 3 failed**, against a master that named 52/0 as the baseline and said *"any red is yours until you prove otherwise with a cp-revert control."* I ran that control.

| Tree | Command | Result |
|---|---|---|
| Grafted | full battery, default workers | **49 passed / 3 failed** |
| **Clean main** (both files reverted, load held constant) | *identical* command | **49 passed / 3 failed — SAME THREE identities, same lines, same durations** |
| Grafted | the 3 suites, desktop, `--workers=1` | **17 passed, exit 0** |
| Grafted | full battery, both projects, `--workers=1` | **52 passed, exit 0** |

The three: `m3-06-demo-profiles.spec.ts:14` (`toContainText` → *element(s) not found*), `task-024-blast-aim-presets.spec.ts:88` (30s timeout, plus a spurious *"End of central directory record signature not found. Either not a zip file, or file is truncated"*), `tp00-tile-persistence.spec.ts:171` (30s timeout). All three **desktop-chrome only**, all three in *different* suites.

Code varied with load held constant ⇒ **not the lane's**. Load varied with code held constant ⇒ **green**. These are load-sensitive, not broken.

⚠️ **This is the F-1083-2 class spreading into three new suites.** F-1083-2 named `tile-identity-pass`; this adds three more, and unlike that one these sit *inside the standard drain battery* — the six suites every storage-adjacent drain is required to run. **Two prior measurements (s1083's own, and Codex's) recorded 52/0 on the same source, so a fire that trusts a single parallel run will read a green slice as red and stop an honest lane** — which is exactly what cost round 2 a full re-verification cycle. **Recommendation for the next fire: run this battery at `--workers=1`, or treat a parallel red as unproven until a `--workers=1` re-run confirms it.** Not fire-authorable as a repair (renderer/test determinism); **ATTENDED/OWNER: this belongs with F-1083-2 and F-1081-2 as one job, not three.**

## F-1084-2 — CODEX'S CENTRAL CLAIM IS TRUE. I VERIFIED ALL SEVEN SITES BY READING THEM.

Codex reported *"All seven named sites were already guarded; no redundant repointing."* That claim is the entire justification for a 3-line diff, so it was verified site-by-site against the source rather than accepted (project claim-verification rule; grep is not evidence).

| # | Site | Location | Verdict |
|---|---|---|---|
| 1 | `readSession` | `AccountSync.ts:568` | GUARDED — `try` L570 … `catch { return null }` L580-582 covers both `getItem` and `removeItem` |
| 2a | `hasLegacyProfileData` | `ProfileManager.ts:502` | GUARDED — per-key `try { … } catch {}` L504-506 |
| 2b | `migrateLegacySuspendResources` | **`src/ui/menu/StartMenu.ts:438`** | GUARDED — `try` L440 … `catch {}` L447 |
| 3 | `readSaveSlots` | `SaveSlots.ts:55` | GUARDED — `catch { return emptyEnvelope() }` L58-62; delegate `preserveCorruptSaveSlots` independently guarded |
| 4 | `reconcileActiveEpoch` | **`src/meta/ResearchTree.ts:337`** (Codex's location CONFIRMED) | GUARDED — `try` L339 … `catch {}` L346 covers all three accesses |
| 5 | `loadMetaProgress` | `MetaProgress.ts:36` | GUARDED — `catch { return migrateMetaProgress(null) }` L38-42 |
| 6 | `readMilestones` | `E7SignalSystem.ts:267` | GUARDED — `catch { return [] }` L268-275 |
| 7 | `readTownName` | `TownNaming.ts:12` | GUARDED — `catch { return null }` L14-21, also covering `activeProfile()` |

**Verdict: TRUE — all seven self-guarded; not one needed an outer catch.** Two corrections to the *master's* enumeration (authoring errors, not lane errors): `migrateLegacySuspendResources` lives in `StartMenu.ts`, **not** `ProfileManager.ts`; and there are **two different `hasLegacyProfileData` functions** — the `ProfileManager.ts:502` one is self-guarded, while a separate copy at `StartMenu.ts:431` has **no internal try/catch** and is protected only by the enclosing `setupProfileStorage()` catch at `StartMenu.ts:426`. Safe on the boot path, but safe *by its caller*, which is the fragile kind. Codex independently flagged this same site.

➡️ **The thread's real conclusion: F-1083-1's premise was half right.** The helper *was* private and that *is* a structural defect worth fixing — but it had **not** in fact manufactured duplicate work at the seven boot-path sites, because each had independently grown its own guard. The export is still correct (it makes the guard reusable for the ~26 non-boot sites, a later rung) — it is just not the cure the master billed it as. **The whack-a-mole ended one round earlier than anyone noticed: rounds 1+2 had already closed the boot path.**

## F-1084-3 — THE SCOPE-6 ASSERTION IS NON-VACUOUS, BUT ITS *MARGINAL* VALUE IS UNPROVEN.

Scope 5 mandated a mutation control and Codex reported the **negative** result honestly: reverting its chosen site's guard still yielded `2 passed (8.6s)` — *"the oracle does not exercise that site."* Per F-1080-B that leaves the fix unproven, so I ran my own control against a site that provably feeds the new assertion.

Un-guarded `loadMetaProgress` (`MetaProgress.ts:38-42`, the source of the very `meta.tracks` the assertion reads), then ran the oracle:

```
MUTATION EXIT=1 — 2 failed
✘ [desktop-chrome] task-024:130 › difficulty preset falls back to default when profile storage is blocked (30.1s)
✘ [mobile-chrome]  task-024:130 › … (30.2s)
   Test timeout of 30000ms exceeded.
   Error: page.waitForFunction: Test ended.
[WebServer] [vite] (client) [Unhandled rejection] Error: blocked storage
```

Guard restored, verified byte-identical to main; graft re-verified byte-identical to `be020fc7`.

**So the oracle DOES catch an unguarded boot read — but it catches it at the pre-existing `openGame` wait (line 18), not at the new assertion.** The boot simply never completes, so the new `run.meta.tracks` check is never reached. The assertion is *not* vacuous (it reads live diagnostics, and `?.run.meta` is un-chained at `.run` so a missing `run` throws) — but it demonstrably adds nothing for the failure mode the master was worried about, which the oracle already caught. Its marginal value is confined to a narrower class: a storage read that throws *without* hanging the boot. **No corrective queued** — the assertion is harmless and cheap, and this is a note for whoever writes the next storage rung, not a defect.

## Findings summary

| ID | Severity | Disposition |
|---|---|---|
| F-1084-1 | ⚠️ blocking-adjacent (method) | 3 in-battery suites are load-sensitive; run `--workers=1`. **OWNER/ATTENDED** — bundle with F-1083-2 + F-1081-2. No corrective queued (not fire-authorable). |
| F-1084-2 | 🟢 non-blocking (finding) | Seven-site claim verified TRUE. Two master-authoring errors recorded. `StartMenu.ts:431 hasLegacyProfileData` is guarded only by its caller — candidate for the next rung. |
| F-1084-3 | 🟡 non-blocking (note) | Scope-6 assertion non-vacuous but marginally redundant; recorded for the next storage rung. |

None blocks the merge. The diff is additive, typechecked, built, 52/0 green, and silent in a plain boot.
