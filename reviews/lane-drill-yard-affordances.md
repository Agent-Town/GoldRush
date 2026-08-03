# lane-drill-yard-affordances — the yard says what it lends, its bell what it calls, and the straw men answer every time

**Slice:** `lane-drill-yard-affordances` (F-BW-8, owner mystery-slab finding)
**Branch:** `lane/e2-arsenal` · **Lane tip:** `b73b8894` · **Base:** `00eeb60e`
**Merged to main:** `a04ea81070f7b5bc3bcfeb5e2506b3fc5c795786` (real `git merge --no-ff`, so shipped-ness is testable by ancestry)
**Drained by:** s1437 fire, 2026-08-03
**Verdict: ACCEPT — MERGED.**

## What it does

The Drill Yard's two interactable stations were labelled like debug affordances — `"Assay tent practice lever"` / `"Top up practice gold"` and `"Drill Bell"` / `"Ring one drill wave"`. They now say what they *do* in the game's own voice: **"The county desk lends practice gold." / "Draw practice gold"** and **"The drill bell calls one practice wave." / "Ring for a practice wave"**.

The straw targets — the "mystery slab" the owner walked into and could not name — now register a world-info note (`drill_straw_man`, *"Straw men — they don't mind."*). Because a practice dummy is a thing you return to deliberately, the note carries a new **`persistent?: false`** flag: it shows in full every approach instead of softening after two, unlike every other world note.

Also landed: a parchment-crate fallback for the station props, and **dormant** processed-sprite wiring (`import.meta.glob` over three `assets/processed/prop-*.png`) awaiting the art batch that generated its raws in the same campaign.

## Merge classification

**Pure LANE-TOUCHED — no graft.** `git merge-base main lane/e2-arsenal` = `00eeb60e`, which is exactly this commit's parent, so the lane held exactly one commit.

`git diff --name-only ea046813 main -- src e2e` reports `e2e/run-suspend.spec.ts` + `src/game/RunSuspend.ts` as also-moved-on-main, which reads like BOTH-MOVED. It is not a collision: that is **main absorbing this lane's own merged predecessor** (`00eeb60e` → merged at `08e317d7` by s1436). The merge itself brought neither file. `BOTH-MOVED is a triage bucket, not a loss verdict` (F-1081-9) — asked and answered rather than assumed.

Merge produced **zero conflicts**.

| file | classification |
|---|---|
| `src/game/DrillYard.ts` | LANE-TOUCHED (copy) |
| `src/game/Game.ts` | LANE-TOUCHED (copy) — one 2-line hunk |
| `src/ui/WorldInfoNotes.ts` | LANE-TOUCHED (copy) |
| `e2e/drill-yard.spec.ts` | LANE-TOUCHED (copy) |
| `artifacts/drill-yard-affordances/*.png` (14) | LANE-TOUCHED (new) |

## Evidence

Gated in a **detached worktree `gate-s1437`** (§3.0b — main's tree never held undecided content). Every playwright command `--workers=1` (§3.1).

⚠️ **Harness note that mattered:** the default port **5188 was held by a live lane's dev server**, and `vite.config.ts:39` sets `strictPort: true`. Gating on the default config would have either died on the bind or — worse — measured **another tree**. Gates ran against a private vite on scratch port **5199** via `GR_CAPTURE_EXTERNAL_SERVER=1`.

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.12s** |
| `e2e/drill-yard.spec.ts` (own spec) | **4/4**, desktop + 390px |
| plain-boot probe | `drill-yard.spec.ts:72` asserts `searchParams.has('debug') === false` (Mistake #10 satisfied) |
| adjacent battery (26 tests) | 19 passed / 7 red — **all 7 accounted for below** |

**Adjacent suites derived BY GREP**, not from the task's list: `grep -rl -iE "drill|worldinfo|world-info|straw|nearestInfoTarget" e2e/` → `world-info-notes`, `drill-yard-manifest`, `run-suspend` (plus `release-build`, excluded by standing order F-1296-3).

### The 7 reds, each disposed of

**Six were already known — matched in `logs/suite-red-inventory.md` BY TEST TITLE.** This is F-1436-2's cure applied on its first opportunity, and it reproduced the finding exactly: **0 of 6 matched by coordinate, 6 of 6 by title** (`:335`→`:322`, `:111`→`:196`, `:301`→`:293`).

| title | projects | inventory says |
|---|---|---|
| `390px world note clears the touch stick zone` | both | BOTH trees, **89.5%** blast radius (row 106) |
| `building notes sit with existing assay and upgrade prompts` | both | BOTH trees, 13.9% (row 6) |
| `town shells use info notes beside opens-soon prompts` | both | BOTH trees, **51.7%** (row 47) |

These sit in the suite this slice edits, so they were not waved through on the inventory alone. **The logic change is provably inert for them:** `WorldInfoNotes.ts:200-201` became `note.persistent === false || seenCount(...)` and `if (this.visibleFull && note.persistent !== false)`. For any note without the flag, `undefined === false` is `false` and `undefined !== false` is `true` — byte-for-byte the old behaviour. `grep -n persistent` finds exactly **one** setter, line 128, the new `drill_straw_man` entry.

**The 7th — `run-suspend.spec.ts:194 wave-boundary suspend restores state` — was refuted by control, not by re-running until convenient.**

| run | tree | result |
|---|---|---|
| 3-suite battery | merged | red, desktop only |
| `run-suspend` isolation | merged | red **both** projects, + `ended runs clear suspend` (mobile) |
| `run-suspend` isolation | **clean-main control** | red — but a **different test** (`pause overlay explains the ledger`), and wave-boundary **green** |
| casualty alone | merged | **GREEN 2/2 both projects** |

The control was taken by reverting the four code paths to `1bc134a8` inside the same worktree, same server, same port; `git diff --name-only 1bc134a8 -- src e2e` returned **empty**, proving the control tree was main-equivalent over the run surface.

Four runs, **three different casualty sets, on two trees, from one byte-identical suite** — `run-suspend.spec.ts` is not touched by this merge. That is the F-1180-2 signature verbatim (*"a real defect does not move between suites; a load ceiling does"*), and the inventory's own prescription is met: *"a casualty that is green in isolation is a known red, not a regression — say so with the isolated re-run as evidence."*

The failure mode is named too: the received console error is `THREE.GLTFLoader: Couldn't load texture blob:` — the documented asset-load flake whose `suppressed[]` helper exists (`suite-red-inventory.md:728`, cured for `agent-view` at `babedc32`) but which `run-suspend`'s collector does not use. **That is F-1436-1's open class**, not this slice.

Causal disconnection was also checked at the code, not just statistically: `Game.ts`'s only hunk is guarded by `this.drillYard?.` (null outside the Drill Yard contract), and the three globbed PNGs **do not exist on disk**, so the eager glob resolves empty and the parchment-crate fallback runs. Neither can reach a seeded run-suspend boot.

Load context, stated because it cuts one way: **three Codex lane runners were executing throughout**. A green under that load is stronger than a green on an idle box; the reds are exactly what that load manufactures.

## Findings

**F-1437-1 (🟢 non-blocking, class-level, already open as F-1436-1).** `e2e/run-suspend.spec.ts`'s console collector does not route `THREE.GLTFLoader: Couldn't load texture blob:` into the `suppressed[]` array that `console-watch` already provides and that `drill-yard.spec.ts` visibly uses (it printed `watchErrors suppressed 0 known GLTFLoader blob error(s)` on all four runs). Cure the **class** — the helper exists; the specs that predate it do not call it. Do **not** cure it by deleting the console-error assertion.

**F-1437-2 (🟢 non-blocking, process).** This master shipped with **no goal leaf** — `drain-block-check` matched it to `pc-01-drill-yard` (`status:"shipped"`) by filename prefix and answered `✅ CLEAR` about a *different, already-shipped slice*. The check was structurally incapable of refusing, and a fire reading only the exit code would never know. Registered and drained in the same fire (s1432's precedent). The wider defect: the attended gate-walk campaign of 2026-08-03 17:13–17:17 authored **five** masters and registered leaves for none of them. `--strict` would have said `UNKNOWN` — but the default is advisory by deliberate design, so the prefix match is the more dangerous failure: it returns a **confident green about the wrong subject**.

**F-1437-3 (🟡 non-blocking, latent).** The dormant sprite wiring globs three `assets/processed/prop-*.png` that do not exist; the raws were generated by `art-drill-yard-stations` in the same campaign and are **unextracted**. Until that art drain runs, the stations render the parchment-crate fallback. Harmless — but the glob is `eager: true`, so if the extraction lands the files under a *different* name the wiring stays silently dormant with no test to notice. The art drain should assert the three filenames it produces against this glob list.

## GZ-01

Player-visible: yes — three pieces of copy the player reads, and a note on an object that previously had none. Gazette item appended.
