# Rider parity reach guard — stage 3

- Task: `lane-a-rider-parity-reach-stage3`
- Lane base after authorised fast-forward: `3cf0b8f8a2c972c8b0ae1b3bcab568cf9a250a74`
- Defect base named by the task: `0eb139bdc7f1612da449a816038520b72153d456`
- `HeadlessContractSim.ts` and `Game.ts` are byte-identical between those bases.
- Runtime: Node `v26.4.0`, npm `11.17.0`; `npm ci` completed without changing package files.

## Base reproduction

```text
PATH=/opt/homebrew/bin:$PATH node --test --test-reporter=spec scripts/rider-parity-reach.test.mjs
tests 5; pass 4; fail 1; skipped 0; exit 1
Assertion: HeadlessContractSim.ts carries 10 `this.prospector.position` code reads, not 12.
```

This reproduces `artifacts/s2550-fire/base-reach-control.txt` on the refreshed lane. No other genuine full Node battery was running when the focused checks began.

## Exact stage-3 census

The guard excludes comment lines exactly as before. The ten remaining code reads are a fixed expected census, not a source-derived bound:

| Line | Role |
| ---: | --- |
| 630 | deepwater shooter's position supplier |
| 1127 | `BuildSystem` construction anchor |
| 1320 | deepwater actor selection |
| 1917 | `build.update` Prospector position |
| 1928 | pressure-system visible-body list |
| 1937 | motor-system visible-body list |
| 2049 | Prospector movement multiplier |
| 2847 | deliberate `repairBuilding` chore |
| 2856 | deliberate `panAt` reach test |
| 2917 | deliberate `harvestTargets` body |

Stage 3 removed the former E8 hollow-crossing and `syncProgramSuspension` Prospector reads. The guard now pins the hollow crossing to `this.hero.group.position` and pins the suspension read within the `syncProgramSuspension` method, while retaining all prior hero, browser, harvest, repair, and recoverProbe assertions.

## Mutation evidence

Each scratch child stripped `NODE_TEST_CONTEXT`, ended naturally, exited nonzero, and matched the intended assertion:

```text
recoverProbe: exit=1; assertion=the recoverProbe reach test must read the hero exactly once
hollow-crossing: exit=1; assertion=the E8 hollow crossing reach test must read the hero exactly once
program-suspension: exit=1; assertion=syncProgramSuspension must read the hero exactly once
unexpected-prospector-read: exit=1; assertion=carries 11 `this.prospector.position` code reads, not 10
```

All scratch directories were removed by `finally`; repository source bytes were never changed.

## Focused verification

```text
PATH=/opt/homebrew/bin:$PATH node --test --test-reporter=spec \
  scripts/rider-parity-reach.test.mjs \
  scripts/rider-parity-retirement.test.mjs \
  scripts/rider-parity-context-press.test.mjs
tests 16; pass 16; fail 0; skipped 0; exit 0

PATH=/opt/homebrew/bin:$PATH npx tsc --noEmit
exit 0

PATH=/opt/homebrew/bin:$PATH npm run build
exit 0
```

The build retained its existing missing raw-art URL, ineffective dynamic import, and large-chunk warnings. Per the task, no full Node battery was run; focused green is not full integration acceptance.
