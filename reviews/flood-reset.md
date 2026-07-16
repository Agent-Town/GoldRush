# reviews/flood-reset — THE FLOOD BREAK, runtime half

**Slice:** lane-c-flood-reset-era-props · **branch** lane/e2-arsenal · **tip** 5b9a641b · **base** 7d2d4f0c
**Merge commit:** 0a4bb6c2 (`--no-ff` into main) · **drained by** s672 fire, 2026-07-17

## Verdict
**MERGE — PASS.** The era-prop accretion chain now breaks at the first `floodReset:true` manifest ≤ active era. Own spec green desktop+mobile (14/14), tsc+build clean, zero console/page errors in the E4→E5 boot probes the spec drives. One pre-existing main-side red surfaced (m1-01:70 geometry-growth) — proven disjoint from this slice, non-blocking (F-672-1).

## What it does (one paragraph)
`installTownPlazaPropsPilot` (TownTavernPilot.ts) previously flat-mapped the props of every era manifest ≤ the active era, so at E5 the drowned harbour square would stack four eras of street furniture under the water. This slice adds an optional `floodReset?: boolean` to `EraPropManifest` and changes the composition to `manifests.slice(Math.max(0, manifests.map(m => m.floodReset).lastIndexOf(true)))` before flat-mapping — i.e. keep only the manifests from the latest flood-reset era onward. With no flag anywhere the `lastIndexOf` returns -1 → `slice(0)` → byte-identical accretion (the E4 regression guard proves this). At E5 (whose `era-props.e5.json` carries `floodReset:true`) chain-1 (E2–E4) is excluded and the harbour starts fresh. This is the runtime half of THE FLOOD BREAK factory gate recorded at the 3D-C E5 harbour delivery (owner 2026-07-16).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (1.76s, dist built) |
| `e2e/town-era-switch.spec.ts` (own spec, both projects) | **14/14 passed** (26.4s) — incl. new `E5 flood reset starts a fresh era-prop chain` desktop+mobile + the 12 pre-existing assertions unmodified-green |
| New assertions | E4: all 18 pre-flood prop ids present (`data-town3d-era-prop-ids`); E5: exactly the 5 `e5-*` prop ids, no E2/E3/E4 ids |
| Boot probe | spec asserts `{ console: [], page: [] }` at E4 and E5 town boots — zero errors |
| Screenshot | `reviews/shots-flood-reset/e5-town-no-chain1-props.png` (311 KB, in the merge) |
| Adjacent (task-025, m1-01, m2-01) | 28/32 first pass; **all m2-01 mobile reds cleared on isolated re-run** (contention flakes — run3d-stockpile.md:23, vp-02-retro-gate.md:13); m1-01:70 persists isolated → F-672-1 below |

## Merge classification (base 7d2d4f0c → main)
| File | Class | Resolution |
|------|-------|-----------|
| `src/town/TownTavernPilot.ts` | LANE-TOUCHED only | clean — main untouched since base (`git log 7d2d4f0c..main -- <file>` empty); 4-line diff (1 type field + 2-line composition swap) |
| `e2e/town-era-switch.spec.ts` | LANE-TOUCHED only, additive | clean — +47 lines, existing 12 assertions unchanged |
| `reviews/shots-flood-reset/e5-town-no-chain1-props.png` | NEW | free |

Base was fresh (7d2d4f0c = main's tip minus the s672 lock commit, STATUS-only). `git merge --no-ff` applied with no conflicts.

## Findings
**F-672-1 — m1-01-claim-jumpers-death.spec.ts:70 "double restart recycles enemies without geometry growth" RED on main (PRE-EXISTING, disjoint, non-blocking).** Fails on both projects, isolated and in-battery — not a load flake. **Proof it is not this slice:** the test boots `/?debug&timescale=4&nowaves&nolevel` and never sets `?town3dPilot`, so `installTownPlazaPropsPilot` — the only runtime function this slice touched — is never invoked; the assertion is a renderer geometry-count leak guard, orthogonal to town-plaza props. Likely lineage: `db7c618c runner(art): art-sprite-production-01-hero.md` (recent main commit touching m1-01) — a new hero sprite batch is exactly the geometry/texture-count regression class (cf. the `new-enemy-sprite-batch-needs-lazy-true` vp-02:382 pattern). Attended/art-lane owns; flagged to OWNER'S DESK. Non-blocking for this drain.

## Note (drain context)
Drained during a LIVE attended session that was concurrently authoring the E6/E7/playbook ladder on main (commits 7ad0ac16, f1a4b5a3 stacked on top of this merge). This merge landed at 00:12 before attended began at 00:20 and is a clean ancestor. Follow-up **lane-c-wire-fairground-terrain** never ran (its done-move at 00:08 was a correct pre-flight STOP behind the then-undrained flood-reset) — re-queued this fire now that flood-reset is merged (its SAFE-DUPE pre-flight will now reset the lane to main and proceed).
