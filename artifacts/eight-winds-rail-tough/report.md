# READY-FOR-GATES — E2 Rail Tough only bind

## Scope 1 verdict: PASS

The repaired front rows are a lawful mirror pair after removing the right-hand
wrench confound:

| Pair | Direct | Mirrored | Delta (direct - mirrored) | Verdict |
|---|---:|---:|---:|---|
| `0v1`, wrench included | 0.613056 | 0.606572 | +0.006484 | noise |
| `0v1`, wrench excluded | 0.618545 | 0.737066 | **-0.118521** | **mirror pair** |
| `2v3` positive control, wrench excluded | 0.705447 | 0.832448 | **-0.127001** | **mirror pair** |

The gate uses the prior E2 subject-class noise ceiling of `|delta| <= 0.095`
from F-1188-2. The repaired `0v1` margin clears it, and all nine declared
shaft/jaw mask sizes remain mirror-dominant at `-0.114271` through
`-0.121988`. The positive control remains mirror-dominant in all nine cases at
`-0.117634` through `-0.127001`.

`wrench-locator-diagonal.png` is regenerated from the current raw. Its green
root and yellow jaw landmarks sit on the row-1 wrench in all four frames.

## Binding

Only `char.e2.rail_tough.walk4` changed:

| Heading | Row | Evidence |
|---|---:|---|
| `sw` | 0 | front-hemisphere body read plus the repaired `0v1` mirror-pair gate |
| `se` | 1 | front-hemisphere body read plus the repaired `0v1` mirror-pair gate |
| `nw` | 2 | back-facing head/boots read screen-left in all four source frames |
| `ne` | 3 | back-facing head/boots read screen-right in all four source frames |

The `nw`/`ne` labels do not come from the masked silhouette score: that
experiment deliberately removes the wrench information and settles only that
rows 2/3 are a pair. The surviving frame-by-frame body read fixes the labels,
and no opposing body cue appeared in the current raw or locator overlay.

All four diagonal directions explicitly name four processed cells and an
8-fps `walk` clip. The Rail Tough alias map is `{}` because this non-hero slot's
alias pass runs after explicit directions and would otherwise overwrite the
new binding. Steam Wrecker and Coal Thief are byte-untouched.

## Instrument repair and extraction

- Mirror-floor pin: `0.452` -> `0.459`, matching the measured
  `0.4585250692698196`. This is **art moved**, not instrument drift: the
  pre-batch control reproduces `0.45249519682907424`, today's result moves only
  with repaired row 1, and the other three row offsets remain unchanged.
- Row-1 landmarks changed from
  `[[102,166,68,231],[94,165,170,235],[140,163,209,235],[96,164,167,236]]`
  to
  `[[102,166,161,231],[95,168,165,237],[142,167,208,235],[97,165,170,235]]`.
  This is **art moved**: the old coordinates described pre-repair pixels; the
  regenerated locator overlay puts every refreshed root/jaw marker on the
  current wrench. Current signed root offsets are `-41.4`, `-51.2`, `-52.6`,
  and `-46.1`.
- Every existing control retained its prior strength. The new `0v1` assertion
  adds the `-0.095` gate; it does not relax a prior check.
- Exact extraction:
  `extract-alpha --key ff00ff --grid 4x4 --scale 1`.
  Result: 16/16 cells, declared/display cell 512, scale 1, no master, matching
  the base `walk4-a` convention in the dry re-extraction check.

## Guard mutation proof

`character-direction-assets.test.mjs` adds two tests across contract direction
blocks: every listed processed cell must exist, and aliases may not overwrite
explicit directions. Its file resolver covers explicit lists, `frames.grid`,
and walk-sheet row sources, with local fixtures exercising both implicit forms.
It mirrors the existing runtime's exact safe exception for hero aliases backed
by explicit `rotations.directions`; that legacy overlap cannot overwrite at
runtime.

Both mutations went red and were restored:

1. Moving `char-railtough-sheet-walkdiag4-a-r0c0.png` aside:
   `char.e2.rail_tough.walk4.sw references missing processed cell
   char-railtough-sheet-walkdiag4-a-r0c0.png`.
2. Adding `"sw": "w"` beside the explicit `sw` direction:
   `char.e2.rail_tough.walk4 aliases overwrite explicit directions`
   with actual overlap `["sw"]`.

Final node-guard result is **76 tests, 76 pass, 0 fail** (baseline 74 plus the
two new tests).

## Build and collection

- `npx tsc --noEmit`: clean.
- `npm run build`: green; asset diet green
  (`1099906 / 1500000` Herald dev-path bytes; terrain/landmark GLBs 84% cut,
  plate PNGs 87% cut).
- The 16 new cells add **1,195,101 emitted bytes**:
  1,193,069 bytes across 16 PNGs plus 2,032 bytes across 16 lazy-glob JS
  wrappers. No unreferenced diagonal cells landed.
- `node logs/s1190-rail-tough-wrench-probe.mjs`: rc 0.
- `npx playwright test --list`: **2462 tests in 345 files**, up from the
  measured baseline **2460 tests in 344 files** (one test in each of two
  projects).

## Plain-boot proof

The player sees this by entering Quartz Hill, opening the Tavern contract
board, selecting Steamworks, and launching **The Hill Mine**—no `?debug` query
or new debug door is used.

`e2-rail-tough-diagonal.spec.ts` launches that route, lets the real WaveSystem
spawn a Rail Tough from a test-tuned live roster gate, and atomically requires:

- active contract `e2-hill-mine`;
- a rendered Rail Tough sprite;
- one of `sw/se/nw/ne`;
- the matching
  `char-railtough-sheet-walkdiag4-a-r{mapped-row}c[0-3].png` cell;
- `mirrored !== true`;
- zero console and page errors.

The live contract's lane list is narrowed to west before `Begin`, so the
already-scheduled first trickle supplies Rail Tough at about 7.4 simulation
seconds instead of relying on the 30-second first-wave deadline. Literal final
run: **Running 2 tests using 2 workers; 2 passed** (desktop 12.3 s, mobile
13.2 s). The required desktop and 390px captures, plus zoom crops, are under
`reviews/shots-e2-rail-tough-only-bind/`.

Independent diff review found that initial deadline race and the guard's
missing implicit-grid coverage. Both were confirmed, fixed, and rerun; no
review finding remains open.

Independent screenshot critique found the human Rail Tough visibly present in
both full frames and identifiable in both crops. It also found pre-existing
readability debt outside this data-only firewall: the full-size enemy/wrench is
soft and low-contrast over the dark rail bed, grounding is weak, nearby marker
geometry competes with the silhouette, and the mobile HUD obscures much of the
world. No art, UI, lighting, or `src/` fix was attempted here.

## Adjacent regressions

- `eight-winds-hero.spec.ts`: **Running 4 tests using 2 workers; 4 passed**.
- `lane-c-activations-assay-office.spec.ts`:
  **Running 6 tests using 2 workers; 6 passed**.
- `wire-e2-enemy-walk4.spec.ts`: its E2 roster/motion half passes in both
  projects, then its unrelated E1 control times out waiting five seconds for
  `char.bandit_base.loaded`. A detached current-main control run reproduces the
  same failure on desktop **1/1**, at the same line and predicate, so this is a
  confirmed baseline red rather than a Rail Tough regression. The existing
  spec was not edited.

## Scope audit

No `src/`, raw art, Steam Wrecker, Coal Thief, contract manifest, existing e2e,
or other lane-owned path changed. Adjacent-test screenshot churn was restored
after the runs.
