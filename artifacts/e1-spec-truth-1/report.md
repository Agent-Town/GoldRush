# e1-spec-truth-1 — the six test-side E1 map reds, re-pinned to what the game truthfully does

Implementer: Claude Opus 5 (attended-spawned agent, owner's Anthropic subscription), scratch worktree
`/Users/robin/Claude/Projects/wt-e1truth`, branch `test/e1-spec-truth-1`, cut from main `97c369971`.
Date 2026-09-24. Master: `tasks/e1-spec-truth-1.md`. Finding: F-SEF2-5 (the 2026-09-24 read-only
investigation), plus F-TB-2 (the east-arm spawn) and F-TB-1 (the owner's fork, NOT this task).

## 0. Pre-flight, and where the tree stood

| Check | Result |
|---|---|
| `git status --short` at start | one untracked entry, `node_modules` (the symlink the attended session made). No modified tracked file. |
| `git log main..HEAD` at start | empty (fresh cut at `97c369971`). |
| `npx tsc --noEmit` before any edit | rc 0, zero output. |
| `npm run build` before any edit | rc 0 (`artifacts/e1-spec-truth-1/build-preflight.log`), asset-diet table printed. |
| Node | v26.4.0 via `/opt/homebrew/bin` first on PATH. |
| Ports | 5309 (branch tree), 5310 (control tree). Every vite + playwright batch ran inside one `dlock.sh` locked command; the server was started and killed inside it, and only PIDs this task started were killed, by number. |

**The branch is 17 commits behind main.** Main advanced from `97c369971` to `65e7947cb` while this task
ran, and the `sol-entry-framing-2` drain landed in that window. It did NOT touch any of the four specs
(`git diff 97c369971..main -- <the four>` is empty), but it did change `src/systems/CameraRig.ts`: a
bounded entry GLANCE (2.5 s, now up to two landmarks) on `e1-night-shift`, `e1-twin-banks`, `e1-baron`
and `e2-trestle`. The control arm below was therefore cut at **main's tip**, not at this branch's base,
precisely so the camera question gets answered: if the control's fog and luminance failures report the
same numbers this branch pins, the glance does not move them.

## 1. Per item: before, after, and how it was measured

### Item 1 — Twin Banks stockpile targets (`e2e/e1-twin-banks.spec.ts`, *builds sluices and stockpiles on both banks against one gold pool*)

BEFORE: `placeBuildableAt(page, 'stockpile', -16, 10)` and `(16, -10)`.
AFTER: `(-16, 13)` and `(16, -15)`.

Measured on both projects with `artifacts/e1-spec-truth-1/probe.mjs` (boots the spec's own debug query
and drives the same harness calls); raw numbers in `artifacts/e1-spec-truth-1/probe.json`:

| Point | zone | walkable | blocked by | ghostValid | ghost landed |
|---|---|---|---|---|---|
| (-16, 10) old | bank | **false** | north_bank_winch | **false** after 2 s | — |
| (16, -10) old | bank | **false** | south_bank_winch | **false** after 2 s | — |
| (-16, 13) new | bank | true | none | true in 84 ms | (-16, 13) exactly |
| (16, -13) | bank | true | none | true in 84 ms | **(16, -14)** — see below |
| (16, -15) new | bank | true | none | (note below) | (16, -15) exactly |

Cause: `5e527a28b` (2026-07-19, the landmark-collision landing the owner ordered as F-N4, "walk-through
landmarks: solidity by data"). The two winch mounts in
`assets/pilots/map-rebuild-spike/landmark-collision-contract.json` are `north_bank_winch` (-16, 10.7),
3.096 by 1.728 m, and `south_bank_winch` (16, -10.7), 3.096 by 1.767 m; `Terrain.sample` pads every
blocker by `Balance.hero.radius + 0.08` = 0.58, giving z 9.256..12.144 and z -12.164..-9.237. Both old
targets are inside. The pad arithmetic confirms itself: teleported to (-16, 12) the hero settles at
z **12.15**, one hundredth of a metre outside the padded edge.

**Why -15 and not the master's suggested -13 on the south bank.** `placeBuildableAt` stands the hero at
`z + 2` and the keyboard-fallback ghost is `hero.z - 2` (`BuildSystem.updateGhostPosition`), so the hero
stand point has to be clear as well. North of the river the offset walks AWAY from the winch; south of
it, it walks INTO it. Measured: teleported to (16, -11) the hero is inside the padded footprint,
collision pushes it to z **-12.2**, and the ghost lands at **(16, -14)** while the line says -13 — a
pin that reads false even though the test passes. At (16, -15) the hero stands clear at (16, -13) and
the ghost lands exactly on the target. Both numbers are bit-identical on desktop and mobile. (The
probe's own (16, -15) attempt reported ghostValid false because it ran as a THIRD stockpile and
`Balance.stockpile.maxCount` is 2; as the second one it is green — see the proof section.)

### Item 2 — Twin Banks east ford spawn (`assertFordRoute`, *routes enemies through both west and east fords*)

BEFORE: `assertFordRoute(page, 16)` spawning at `(fordX, 14)` = (16, 14).
AFTER: `assertFordRoute(page, 16, 17)` — the spawn is a separate argument; the +-3.2 ford window stays
centred on the ford at x 16, so the assertion still measures the crossing and not the spawn.

Measured, the same 15 s window the test keeps, both projects:

| Spawn | blocked by | samples | ford samples | deep samples | reached | time |
|---|---|---|---|---|---|---|
| (16, 14) old | north_bank_homestead | 1740 desktop / 1741 mobile | **0** | 0 | **false** | — |
| (17, 14) new | none | 214 / 216 | **72** | 0 | true | 887 ms / 901 ms |
| (-16, 14) west, untouched | none | 105 / 107 | 40 | 0 | true | 871 ms / 886 ms |

The old spawn's final position is bit-identical to the spawn point: the body never moved a millimetre
in 15 s. `north_bank_homestead` is at (13.5, 14.2), 5.184 by 4.018 m rotated -0.1 rad, i.e. x
10.72..16.28 and z 11.94..16.46 — (16, 14) is inside it, and a body that starts inside a solid
footprint probes only 0.4 and 0.6 m for an escape while the nearest walkable ground is 0.86 m east.

NOT CHANGED, and reported instead: the same test's screenshot spawn at `spawnEnemyAt(16, 14)` (the
`north-plot-skirmish` shot) still starts a body inside that homestead, where it freezes. It asserts
nothing, so it is outside this task's six named lines; a future one-line slice could move it to (17, 14)
for the same reason.

### Item 3 — Night Shift ramp pins (*loads Night Shift contract data and ramps full, dusk, dark, dawn lighting*)

BEFORE: `fogNear: 18, fogFar: 42`; `expect(darkTint).toBe('#34405a')`; `tintLuminance` from
0x34/0x40/0x5a.
AFTER: `fogNear: 34, fogFar: 58`; `'#44516b'`; `tintLuminance` from 0x44/0x51/0x6b.

The old fog numbers were never measurements — they were the lerp TARGETS. `git show 7c2744e5a --
src/world/LightRig.ts` replaced

    fogNear = lerp(baseFogNear, 18, darkness)
    fogFar  = max(fogNear + 8, lerp(baseFogFar, 42, darkness))

with

    fogNear = baseFogNear + fogOffset
    fogFar  = max(fogNear + 8, lerp(baseFogFar, 58, darkness) + fogOffset)

and with Night Shift enabled `baseFogNear` is 34 and `baseFogFar` 72 (`LightRig.ts:333-337`), so
darkness 1 reads 34 / 58 when `fogOffset` is 0.

The tint: `git show 67e7d0af4 -- assets/contracts/epoch-1-frontier/contracts.json` moved the dark
keyframe's `spriteTint` from `#34405a` to `#44516b` on 2026-08-03, and `git log -S` confirms it is the
only commit ever to touch that value. The derived hero-brightness band moves with it:
tintLuminance 0.0526 -> **0.0819**, so the +-0.04 band moves from 0.0126..0.0926 to **0.0419..0.1219**.

### Item 4 — Night Shift suspend race (*cold lantern relight costs survive run suspend and continue*)

BEFORE: nothing froze the waves; `restoredWave === 1` was only true inside a ~750 ms window.
AFTER, inserted the moment `waitForSavedNightWave(page, 1)` resolves:

    await setBalance(page, 'waves.waveInterval', 9999);
    await setWave(page, 1);

**Which of the master's two options, and why.** The master offered `setBalance('waves.waveInterval',
9999)` or a re-open with `nowaves`. I took the balance route, but the balance change ALONE provably
cannot work, and that is worth writing down: `WaveSystem.planDueWaves` plans the next wave one telegraph
lead ahead and writes its `spawnAt` into `plannedPulses`; `spawnDuePulses` then starts a wave from that
fixed number. Raising the interval after wave 2 has started therefore moves wave 4, not wave 3. What
retracts an already-planned pulse is the harness's own `setWaveForTest`, which clears `plannedPulses`
and re-derives `nextWaveAt` from the interval it reads at that moment — so the interval is raised FIRST
and the reset applied SECOND. The `nowaves` re-open was not needed: it costs a third boot and a restore
on the first page, where this freeze costs one round trip.

Why the window is so narrow: `RunManager` calls `RunSuspendController.captureBoundary(event.wave)` on
every `wave_started`, and that stores `wave - 1` (returning null at 0), so storage reads 1 only between
the start of wave 2 and the start of wave 3 — at timescale 40 with waveInterval 30, about 750 ms of wall
time, inside which four page round trips, a `page.close()` and a fresh boot all had to fit. Nothing else
writes the record: the `setWave` harness handle emits no `wave_started` (Game.ts:2426 calls
`waveSystem.setWaveForTest` only), and the page-hide hook `flushLast`s the LAST snapshot rather than
capturing a new one, so closing the first page cannot bump the wave either.

### Item 5 — Baron prefetch (`e2e/e1-baron.spec.ts`, *Baron manifest loads and taunts fire at waves 5, 12, and 18*)

BEFORE: `baronAnimationLoaded: true`, read from `spriteAnimations['char.baron']?.loaded ?? false`.
AFTER: `baronAnimatorPresent: false`, read from `'char.baron' in spriteAnimations`.

Measured with the Baron contract booted, both projects, after 4 s:

| Published | Value |
|---|---|
| `assets['char.baron']` | `loaded` |
| `assets['prop.baron_banner']` | `loaded` |
| `assetSprites['char.baron']` / `['prop.baron_banner']` | 0 / 0 |
| `spriteAnimations` keys | char.hero, char.bandit_base, char.bandit_thief, char.e2.rail_tough, char.e2.steam_wrecker, char.e2.coal_thief, char.prospector_agent — **no char.baron** |
| `spriteStats` | activeAnimators 1, textureSwapsPerFrame 0, fadeOverlaysActive 0 |
| `canvas.dataset.spriteClipGroups` | `claim town` (global, not per slot) |
| wave portrait src | null |

Cause: `033f69c61` (2026-09-15) deleted the shared `baronSpriteAnimator` (10 references removed,
including the field and its `??= new SpriteAnimator(` construction), so with no Baron body there is no
animator and the key is absent; the helper's `?? false` read absence as a failed load, and ten seconds
of polling could never change it.

The absence is now asserted rather than dropped, which is the stronger pin: a prefetch warms sheets and
grows no animator, while the sibling `expectBaronArtLoaded` (used once the Baron is on the map) still
requires `baronAnimationLoaded: true`. The pair pins both halves of the seam.

**THE MASTER'S STOP CLAUSE, ANSWERED — nothing published proves the runtime slot is warm.**
`prefetchBaronPresentation` (`src/entities/pools.ts:687`) does four things: `ensureLoaded()` on the
baron sprites, fades and banner sprites, and `void loadRuntimeSlot(assetSlots.charBaron)`. The first
three surface as `assets['char.baron'] === 'loaded'` (written by `loadGeneratedTexture`,
`src/assets/generated.ts:169`). The fourth surfaces NOWHERE: `spriteAnimations` needs a live animator
(`SpriteAnimator.ts:419/669`), `spriteStats` counts active animators, and `spriteClipGroups` is a global
set. **One field would close it**: await that promise in `prefetchBaronPresentation` and publish the
warmed slot id — say `runtimeSlotsWarm: ['char.baron']` on the pool diagnostics, or a
`baronPresentation: { sheets, runtimeSlot }` pair. That is a `src/**` change and outside this task's
firewall, so it is reported here rather than taken.

### Item 6 — Mobile luminance headroom (*lantern post is Night Shift gated and relights a true-dark light ring*)

BEFORE: `expect(await spriteLuminance(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT)` with
`DARK_LIGHT = 0.06` on both projects.
AFTER: the same line reads `DARK_SPRITE_LIGHT()` — mobile 0.065, desktop unchanged at `DARK_LIGHT`.
`DARK_LIGHT` itself is untouched, and so is every enemy-light assertion in the spec, including the two
functional ones the master fenced.

The measurement recorded beside the constant: mobile p95 0.0605..0.0607 across three boots against
0.0437 on desktop, over a 0.06 ceiling. It is not a sprite measurement at all — out of every lantern
radius `spriteLuminance` samples night GROUND and FOG, and zeroing the sprite fill leaves the number
bit-identical. Palette cause `67e7d0af4`, whose dark keyframe lifted background #000000 -> #080a0f,
fog #000000 -> #14141a, fill #28324a -> #384862 and ground #000000 -> #17120f, all on purpose.

### Item 7 — The red inventory (`logs/suite-red-inventory.md`)

Three rows corrected in place with dated notes, nothing deleted; the wrong clauses are left visible and
struck through, so the original observation is still readable.

1. `beauty-twin-banks` braid row: cause `451daa5b9` -> **`7c2744e5a`**. Verified by reading both diffs:
   `451daa5b9`'s entire change to the E1 contract file is four lines, `lanes.spawnEdges`
   ["north","south","east","west"] -> ["north","south"]; `7c2744e5a` ADDED the
   `twin-banks-true-braid-dev` `waterMask`, two `polyline_band` channels of halfWidth 1.5 either side
   of the axis, so at x = 0 the north channel covers z 0.5..3.5, the south z -3.5..-0.5, and the map
   centre is the dry plait between them. Marked STAYS RED — owner fork F-TB-1.
2. `e1-night-shift` fog row: cause `451daa5b9` -> **`7c2744e5a`**, with the before/after lerp quoted,
   and marked CURED with the 34 / 58 and `#44516b` re-pins.
3. `e1-night-shift` lantern-post row: its recorded cause and its `Error:` tail were **carried across**
   from the two rows above it — that test never samples the map centre (the only
   `terrainSample(0, 0)` in the spec is in its determinism case, which compares two boots against each
   other and is green either way). Corrected to the sprite-luminance ceiling with both measurements and
   the `67e7d0af4` palette cause, and marked CURED.

One row ADDED for `e2e/e1-twin-banks.spec.ts` *loads Twin Banks contract with two fords, two build
zones, and one loss stake*: red on main on both projects, cause `7c2744e5a`, stays red until the owner
rules F-TB-1. **It was filed in the parsed "Corrections since the snapshot" table rather than beside its
F-CORR1-7 siblings, on purpose** — and that is a finding in itself:

> **F-SEF2-5a (this task, new).** `scripts/red-inventory-lookup.mjs` reads corrections from the FIRST
> `| Spec file | Test title | Measured | Finding | Correction |` header only (`table()` stops at the
> first non-`|` line). The F-CORR1-7 and F-MAC2-1 rows at lines 1109-1121 were appended to the tail of
> the six-column **Crashes and timeouts** table instead, where they sit as five-column rows in a
> six-column table: invisible to the instrument a drainer actually runs, and malformed for any future
> consumer that parses that table by width. Nothing reads it today, so nothing is red — but the rows
> are doing none of the work they were written to do. Moving them is a ledger restructuring, not this
> task's call; it is written down here so the next drain can decide. Verified after the edit:
> `node scripts/red-inventory-lookup.mjs e2e/e1-twin-banks.spec.ts` prints the new correction above the
> snapshot rows, and the file still parses (756 rows, header totals matching).

## Guards and type-check

| Gate | Result |
|---|---|
| `npx tsc --noEmit` after every edit | rc 0, zero output |
| `GR_GUARD_NO_ARTIFACT=1 node --test scripts/citation-title-guard.test.mjs scripts/no-emdash-guard.test.mjs` | rc 0 |
| `scripts/red-inventory-guard.test.mjs` | **DOES NOT EXIST** on this tree (nor on main). Ran the two real guards over this file instead: `scripts/suite-red-inventory.test.mjs` and `scripts/red-inventory-lookup.test.mjs`. |
| the four together | **52 tests, 52 pass, 0 fail, rc 0** |

## Commits

| Hash | Subject |
|---|---|
| `e3dc60a67` | test: e1-twin-banks re-pinned off the twin-banks solid mounts (F-SEF2-5, F-TB-2) |
| `b849cd4bf` | test: e1-night-shift re-pinned to the night the game renders (F-SEF2-5) |
| `a0da6da39` | test: the Baron prefetch asserts the per-body architecture, not the deleted shared animator (F-SEF2-5) |
| `46d8210b3` | test: the three E1 correction rows get their true cause, and F-TB-1 gets a row (F-SEF2-5) |

One commit per file rather than one per item: items 1+2 share a cause (the mounts became solid) and
items 3+4+6 are three re-pins in one spec under one finding, and a path-scoped `git add -- <file>`
cannot split a file without an interactive index. Each message enumerates its items with the numbers.

## The two reds that must stay red — both F-TB-1

Neither is this task's, and neither may be made green here: both pin the ratified single river band that
`7c2744e5a` replaced with the braid mask in production data, so passing them would ratify the mask BY
TEST.

1. `e2e/e1-twin-banks.spec.ts` *loads Twin Banks contract with two fords, two build zones, and one loss
   stake* — its centre-zone assertion, `expect(snapshot.samples.center?.zone).toBe('river')`, receives
   `bank`.
2. `e2e/beauty-twin-banks.spec.ts` *the braid renders living water without touching the sculpt contract
   or the frame budget* — its sim-truth samples, under the comment "the legacy band still classifies".

## Proof, part 1 — each fixed test, repeat-each, both projects, port 5309

Branch tree at `089883a05`, own dev server on 5309, `--workers=1`, `--project=desktop-chrome
--project=mobile-chrome`, one locked command. Transcript: `batch-b-repeat-each.log`.

| Step | Command | Result |
|---|---|---|
| items 1+2 | `e1-twin-banks.spec.ts -g "builds sluices and stockpiles…|routes enemies through both west and east fords" --repeat-each=3` | **12 passed (57.0 s), rc 0** |
| items 3+6 | `e1-night-shift.spec.ts -g "loads Night Shift contract data and ramps…|lantern post is Night Shift gated…" --repeat-each=3` | **9 failed / 3 passed, rc 1** — see the finding below |
| item 4 | `e1-night-shift.spec.ts -g "cold lantern relight costs survive run suspend and continue" --repeat-each=5` | **10 passed (1.1 m), rc 0** |
| item 5 | `e1-baron.spec.ts -g "Baron manifest loads and taunts fire at waves 5, 12, and 18" --repeat-each=3` | **6 passed (1.4 m), rc 0** |

So items 1, 2, 4 and 5 are green at three and five repeats on both projects. Item 4's de-race is the
strongest single result here: the same test was 5-of-5 green alone and red under load before, and it is
now 10-of-10 across two projects with the waves frozen.

**The whole batch produced exactly TWO distinct failing lines**, and neither is a pin this task set:

    > 389 |   expect(heroRatio, ...).toBeLessThan(tintLuminance + 0.04);
    > 436 |   expect(await spriteLuminance(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);

That is itself the proof that items 3 and 6 landed. The ramp test now runs PAST the fog assertion (34 /
58 accepted on both projects) and PAST `expect(darkTint).toBe('#44516b')`, failing only at the band
below them; the lantern test now runs PAST the re-ceilinged sprite read at `:435` and fails at `:436`.
Both were masked before by the reds this task cured.

### F-SEF2-5b (NEW, this task) — `spriteLuminance` is a desktop-shaped instrument, and one of its two callers is not measuring what it is named for

Two leftovers, one root. Reported rather than cured, because curing either one requires a design
decision about what the test should measure, and both would mean weakening or re-aiming an assertion the
master did not name. Measured numbers, bit-identical across all three repeats:

| Assertion | Project | day | dark | ratio / value | threshold |
|---|---|---|---|---|---|
| `:389` band | desktop-chrome | 0.22820 | 0.05964 | ratio **0.26136** | 0.04175..0.12175 |
| `:389` band | mobile-chrome | 0.93262 | **0.93262** | ratio **1.0** | 0.04175..0.12175 |
| `:436` in-radius | mobile-chrome | — | — | **0.23454** | >= 0.35 |
| `:436` in-radius | desktop-chrome | — | — | passes | >= 0.35 |

Four things are true of that instrument, each verified by reading:

1. **The band's sample point holds no hero.** `contractHeroStart` (Game.ts:10769) returns
   `(lossStake?.x ?? 0, 0.06, lossStake?.z ?? 12)`, and `e1-night-shift` authors no `stakeMarkers`, so
   the Night Shift hero starts at **(0, 12)**. The assertion samples world **(0, 0)** — twelve metres
   south, in the river band — and calls the reading `dayHero` / `darkHero`. What darkens there is the
   ground and water under the light rig, not a sprite under `spriteTint`.
2. **The comparison mixes colour spaces.** `tintLuminance` is built with the spec's own `linear()`
   helper, i.e. a LINEAR-space luminance, while `spriteLuminance` returns a p95 of sRGB-ENCODED channel
   values. A ratio of two sRGB values is not comparable to a linear luminance. (For the record:
   linearising the desktop pair gives 0.1139, which WOULD fall inside the band — but at a point with no
   sprite that would be a coincidence, not a derivation, so it was not taken.)
3. **On mobile the sample is lighting-invariant.** dayHero and darkHero are bit-identical at 0.93262
   (about 238/255) in both phases and across repeats, so the patch is measuring something the night
   ramp does not touch. A playwright element screenshot is a page screenshot clipped to the element box,
   so an overlay above the canvas is included in the read.
4. **The patch is not DPR-normalised.** `spriteLuminance` samples a fixed +-6 by +-8 PNG-pixel patch.
   Desktop runs at DPR 1, so that is +-6 by +-8 CSS px; Pixel 5 runs at DPR 2.625, so the same patch is
   +-2.3 by +-3 CSS px — a roughly 3x tighter sample of a different world area, reduced by a p95. That
   is the same root as the 0.0605-vs-0.0437 gap item 6 had to give headroom for, and the likeliest cause
   of the 0.23454-vs-0.35 gap at `:436`.

**Cure direction for whoever takes it (one slice, test-side, no `src/**`):** aim the band at the hero's
actual position (or rename it to what it measures), linearise both readings before the ratio, and make
the patch DPR-aware (scale the +-6/+-8 by `png.width / box.width`) so the two projects sample the same
world area — then re-measure both thresholds. Every one of those four changes alters what a green means,
which is why this task reports them instead of taking them.
