# f1435-1 — ring hints for a ring that is gone

**Slice:** `f1435-1-ring-hints-for-a-ring-that-is-gone` (corrective for **F-1433-3**)
**Branch/tip:** `lane/e2-arsenal` @ `00eeb60e` (runner-committed 2026-08-03 ~16:49, done-move **un-prefixed** = clean run)
**Base:** `ea046813` · **Merge:** `08e317d7f405686d4657b968ebb38a2cec5ce51e`
**Drained by:** s1436 fire, 2026-08-03, in detached worktree `gate-s1436` (§3.0b — main's working tree never held undecided content)

## VERDICT: MERGED

## What it does

`restoreControls()` in `src/game/RunSuspend.ts` builds a **fallback** controls block when a suspend envelope
carries no `controls` key — the legacy (v1) save shape. That fallback derived the ring from meta progress:

```ts
territoryRingPresent: meta.tracks.territory >= Balance.meta.territoryTier1,
```

That rule was correct until `af463bd9`, where Territory I stopped spawning a palisade ring and became a
**placement kit** instead. After the kit merge, `Game.ts` only ever assigns the flag `false` — so the legacy
restore path was the one surviving writer that could set it `true`, resurrecting a ring that no longer exists
and, with it, the `territory_ring_gap` world-info hint that points at a gap in nothing.

The fix is two lines: the fallback writes `territoryRingPresent: false` with the merge hash as its reason, and
`meta` becomes `_meta` because nothing else in the function reads it.

## Evidence

All playwright runs `--workers=1` (§3.1). Gate worktree `gate-s1436` = lane tip + main merged in.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (rc=0) |
| `npm run build` | **green**, built in **966 ms** |
| `e2e/run-suspend.spec.ts` (own spec) | **10 passed / 0 failed**, both projects, 2.5 min |
| new test `legacy no-controls restore at Territory I…` (`:282`) | **2/2** both projects |
| console/page errors in the new test | `consoleErrors` and `pageErrors` both asserted `[]` — green |
| Adjacent battery (merged tree) | 41 passed / **9 failed** |
| Adjacent battery (**clean-main control**) | 42 passed / **8 failed** |

Adjacent suites were derived **by grep, not from the task's list**: `territoryRingPresent|territory_ring_gap`
matches exactly `src/game/Game.ts`, `src/game/RunSuspend.ts`, `src/ui/WorldInfoNotes.ts` and
`e2e/world-info-notes.spec.ts`; `e2e/restore-validation.spec.ts` carries 35 suspend-envelope references.
Both specs were run on both trees.

## The green was proven load-bearing by manufacturing the pre-fix defect

A passing test never executes its violation path, so its green says nothing about the red (s1299/s1300).
The pre-fix expression was restored on the merged tree (`_meta.tracks.territory >= Balance.meta.territoryTier1`):

```
Error: expect(received).toMatchObject(expected)
-   "fallbackRingPresent": false,
+   "fallbackRingPresent": true,
    "finalRingPresent": false,
> 316 |   expect(legacy).toMatchObject({ restored: true, fallbackRingPresent: false, finalRingPresent: false });
```

**2 failed, both projects.** Probe reverted and verified **byte-identical**: `sha256/12 902e115c4eb1` before
the probe, `07f0f3cae29a` broken, `902e115c4eb1` after the revert — and that is the same hash the runner
reported, so the merged source is the source it gated.

⚠️ **Read the received object, not just the verdict — it names the precise scope of the bug.**
`finalRingPresent` is `false` **even on the broken tree**, because `RunManager.restoreSuspend()` later resets
the flag through `applyMetaProgress`. The defect is therefore **transient within the restore sequence**: the
fallback hands a `true` to the game for the window before meta progress is re-applied. The new test probes
that window deliberately (it patches `RunManager.prototype.restoreSuspend` to sample the flag on entry).
So this is a **latent-correctness** fix, not a reproducible player complaint — an honest reading matters more
than a bigger-sounding one, and the corrective is right either way: the one remaining writer of a flag whose
meaning was removed should not be able to write `true`.

## Every red controlled to clean main — and counting would have got it wrong

Merged 9 vs main 8 is a **different total**, so the sets were differenced rather than compared by size.

| Red | Projects | Verdict |
|---|---|---|
| `restore-validation:656` *active megaproject wrecker references…* | desktop + mobile | **pre-existing** — identical on clean main |
| `world-info-notes:196` *building notes sit with existing assay…* | desktop + mobile | **pre-existing** — identical on clean main |
| `world-info-notes:293` *town shells use info notes…* | desktop + mobile | **pre-existing** — identical on clean main |
| `world-info-notes:322` *390px world note clears the touch stick zone* | desktop + mobile | **pre-existing** — identical on clean main |
| `restore-validation:186` *page-load restore materializes run-manager state…* | desktop (battery) | **load artifact, not attributable** — see below |

`restore-validation:186` was the only difference, and it is the interesting one because **its redness moves
between projects run to run on the same tree**: red on **desktop** in the merged battery, red on **mobile** in
the two-project isolation of the merged tree, red on **mobile** in the identical isolation of **clean main**,
and **green** when run truly alone on main (3.4 s). Same instrument, same hour, three different answers —
that is a load-sensitivity signature, and it reproduces on a tree that does not contain this slice at all.

⚠️ Note what did **not** decide it: the merged battery's red sat in `restore-validation`, the suite this slice's
own subject lives in — the most attributable-looking red available. It was refuted by the control, not by
re-running until convenient.

## Merge classification

Base `ea046813`. Two paths, and `git log ea046813..main -- <both paths>` is **EMPTY** — main never moved
either file since the base, so both are **LANE-TOUCHED only**; no graft, no 3-way, no invariant re-count
needed. Main's four commits since the base are all bookkeeping (`STATUS.md`, `tasks/**`, `tasks/goals.json`).
The merge is a real `--no-ff` merge commit, so shipped-ness is testable by **ancestry**, not by this file.

## Findings

**F-1436-1 (🟢, factory instrument — widens F-1435-1).** The asset-load flake that F-1435-1 named in
`run-suspend` is **not confined to the GLTF texture-blob message or to that spec**. The clean-main control run
printed `[gold-rush] render demotion {"reason":"pilot-load-failed:Failed to fetch", …}` from the dev server
during `restore-validation`, and `restore-validation:186` fails only under two-project load. One class — the
fire shell's dev server intermittently failing to serve pilot/terrain assets — is being caught by *several*
specs' console-error collectors and timing assertions, each of which then reads as a different, subject-less
regression. F-1435-1's prescribed cures (pin the loader / scope the collector) should be scoped to the
**class**, not to `run-suspend.spec.ts` alone (`cured-defect-survives-in-the-sibling-script`).

**F-1436-2 (🟢, ledger).** The always-red-on-main census keeps growing and is now spread across three
findings with no single home: F-1434-2 named `water-mask-engine:23`, `terrain3d-claim-pilot:166`,
`e1-twin-banks:103`/`:122`; F-1435-2 named `restore-validation:656`, `bt-01-tiers:205`/`:430`; this drain
re-confirms `restore-validation:656` and adds `world-info-notes:196`/`:293`/`:322` — **ten guards** that are
red on main in both projects. Every drain now pays to re-control them. A guard that is always red cannot warn
anyone; the set wants one inventory row and a fix-or-retire ruling, not a fourth finding next fire.

**F-1433-2 remains open and untouched**, exactly as the master's firewall required (`prebuiltPalisades` now has
zero consumers; it is owner-adjacent because it encodes his July gold-tax ruling).

## Notes

No screenshots: this slice renders nothing new. Its player-facing surface is the **absence** of a hint, which
the new test asserts as `toHaveCount(0)` on
`[data-testid="world-info-note"][data-object-class="territory_ring_gap"]` after teleporting the hero to the
computed gap position.
