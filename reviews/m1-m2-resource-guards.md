# m1-m2-resource-guards — review (s1029 drain)

**Slice:** `tasks/lane-m1-m2-resource-guards.md` (corrective for F-1026-5)
**Branch:** `lane/m3` · **Tip:** `d93b1505` · **Base:** `aa6937a1` (ancestor of main, verified)
**Drained by:** s1029 fire, 2026-07-25

## VERDICT: MERGE — M1 guard fixed at the source; M2 guard diagnosed-only (authorized outcome), corrective owed

---

## What it does

The M1 red was **not a leak.** `m1-01:70` ("double restart recycles enemies without geometry
growth") measured its baseline *before the renderer had finished uploading asynchronously-loaded
geometry*, then attributed the late arrivals to the restart. Codex named the ten stragglers
precisely: two rails (replacing old rail geometries, hence net +8 not +10), terrain, panorama,
continuation and five landmark GLBs; plus `FreedWalkerVfx.freedAccentGeometry` and
`runDustGeometry` on the first freed-walker presentation (+2). 77→87 was **async upload timing,
not per-run allocation.**

The fix lives entirely inside the existing `?debug` `warmVfx` hook: it now awaits terrain
mounting, presents and recycles one pooled enemy plus an XP mote so the lazy sprite and the
freed-run delay render once, resets combat, and only then lets the test read its baseline.
Restart is now allocation-neutral, and **the guard's expected numbers were never touched** —
provable, since the only changed file is `src/game/Game.ts`.

Surface check: `warmVfx` is reachable only via `window.__GR_TEST__` and
`src/diagnostics/fullBaseBenchmark.ts`. It is a test/diagnostics bridge — **no normal-play code
path changes.**

## Classification

| | |
|---|---|
| Files changed by lane | `src/game/Game.ts` only (+47 / −3) |
| Files main moved since base | `.gitignore`, `STATUS.md`, `logs/*`, `scripts/dashboard-gen.sh`, `tasks/*` |
| Overlap | **ZERO** — main moved no `src/` or `e2e/` file since `aa6937a1` |
| Merge | Pure LANE-TOUCHED, path-scoped checkout, no 3-way graft needed |

## Evidence (gate battery on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, 1.15s; diet 235 GLBs 84% cut / 53 plates 87% cut |
| `m1-01-claim-jumpers-death` `--workers=1` | **8/8** desktop + mobile — **incl. `:70`, the F-1026-5 red, now GREEN both projects** |
| `m1-02` + `m1-05` + `m2-05` + `wire-railcar-3d` + `wire-crawler-3d` `--workers=1` | **45 passed / 1 failed** — the one failure fingerprint-matched pre-existing, see F-1029-1 |
| `m2-01-build-menu` `--workers=1` | **12 passed / 2 failed** — `:322` both projects, authorized diagnose-only, see F-1029-2 |
| `_s106-prospector-boot-probe` + `profile-first-boot` `--workers=1` | **12/12** desktop + 390px mobile, zero console/page errors |

Adjacent suites chosen by blast radius, not habit: all seven specs that call `warmVfx`
(`grep -n warmVfx -r src e2e`), since the hook's timing changed for every one of them.

## Findings

### F-1029-1 — `m2-05:319` geometry baseline drifts +1 across wreck/repair. PRE-EXISTING, not lane-caused. (non-blocking)
`e2e/m2-05-base-damage-repair.spec.ts:348` asserts post-cycle geometries equal baseline; it reads
one high. **Bisected rather than assumed** — reverted `Game.ts` to main, re-ran, and compared the
fingerprint:

| Tree | Assertion | Expected | Received | Delta |
|---|---|---:|---:|---:|
| clean main | `m2-05:348` geometries | 92 | 93 | **+1** |
| main + this lane | `m2-05:348` geometries | 94 | 95 | **+1** |

Same assertion, same line, same +1 delta. The lane raises **both** numbers by exactly 2 (it warms
two more geometries before baseline) and does not change the drift. So this is an older,
independent +1 in the wreck/repair cycle, outside this slice's scope (which was `m1-01` and
`m2-01`). Desktop only; mobile green. **Corrective owed, not blocking.**

### F-1029-2 — `m2-01:322` has never actually tested the 200-call ceiling. The fixture stands on a collision footprint. (non-blocking; corrective queued)
Codex reported a diagnose-only outcome, which the master explicitly authorized. **I verified the
diagnosis rather than accept it:** the test does not fail on the draw-call number — it times out
in the `placeSelected` helper at `e2e/m2-01-build-menu.spec.ts:84`, polling
`__THREE_GAME_DIAGNOSTICS__.build.ghostValid` for 5000ms and getting `false`. Its first palisade
target `(-6, 16)` sits inside the working-camp collision footprint, so placement is never valid
and **the assertion at line 322 is unreachable.** The guard has been vacuously red.

The reassuring half: Codex measured the real numbers with the fixture moved to valid terrain
(`z=20`) — **184 desktop / 131 mobile** for six beacons plus twelve palisades, comfortably under
the unchanged 200 ceiling. **The ceiling holds; only the fixture is wrong.** Codex correctly
refused to change it, as test-coordinate edits sat outside its firewall.

Corrective queued this fire: `tasks/lane-m2-01-fixture-coordinate.md`.

### F-1029-3 — Deepwater resource check red for an unrelated reason (recorded, not actioned)
Codex reports an existing Deepwater boot/resource test red on both projects because its resource
list is empty. Independent of this slice; recorded here so the next fire does not re-discover it
as new.

## Merge

Path-scoped: `git checkout lane/m3 -- src/game/Game.ts`, committed alone. `logs/*` working-tree
churn (the 60s dashboard regen) deliberately left out of this commit.
