# F-RB2-2 (a) — the Regatta boat disembarks only within the gangway's reach

**Task** `tasks/f-rb2-2-gangway-reach.md` · **branch** `fix/f-rb2-2-gangway-reach` cut from main at `823b06b1d` · scratch worktree, dev server on port **5305** · Claude Opus 5 implementer, 2026-09-22.

**Owner, verbatim (2026-09-22):** "F-CORR4-2: ok, lets do it, F-CORR4-18: ok, give the raw route its own small pack, **F-RB2-2: gangway-reach only**" — option (a) on the finding in `reviews/e5-regatta-boat-02.md`: "disembark fires on a key direction and the step-ashore probe reaches a boat-length (16.25 m) ahead, so a racer holding the wrong key near a rim goes over the side and, since slice 2, forfeits unwarned."

## The two probe numbers

| Intent | Slice 1 (measured from the deck rectangle) | Now (measured from the deck anchor) |
| --- | ---: | ---: |
| keel-ward, over the bow | **16.25 m** (14.25 + the 2 m plank) | **6.40 m** — inside her own deck, so nobody steps |
| beam-ward, over the rail | 6.40 m | **6.40 m** (unchanged) |
| diagonal (1,1) | 8.22 m (5.81 per axis) | 6.40 m (**4.53** per axis) |

`CLAIM_BOAT_GANGWAY_REACH = CLAIM_BOAT_DECK_BOUNDS.maxX + CLAIM_BOAT_GANGPLANK_REACH = 4.4 + 2 = 6.4`, the same in every direction, measured from the deck anchor the aboard body rides. Both the human's key probe (`gangplankPoint`) and the rider's point test (`withinGangplank`) use it, so ADR-005 keeps ONE predicate for both species.

**The two guard-pinned bands the finding named:** north `33.50 -> 43.35`; east `43.35 -> 43.35` (unchanged, because the beam always WAS the gangway's reach).

## What changed

1. **`src/entities/ClaimBoat.ts`** — new exported `CLAIM_BOAT_GANGWAY_REACH`; `gangplankPoint(intent)` probes that reach along the unit intent from the hull centre (it was the deck exit along the intent plus a plank); `withinGangplank(x, z)` is the distance from the hull centre (it was `distanceToDeck`, the deck RECTANGLE, which is 28.5 m long). `stepAshore` keeps its five conditions; `board`/`contains` untouched. `distanceToDeck` is kept but annotated as no longer the gangway measure — nothing calls it now; removal is a candidate for the drain, left in place because it is outside the ruling.
2. **`src/world/DeepwaterClaimTile.ts`** — comments only, at the two call sites (`helm`, `boatOrderRefusal`). No code change was needed: the call shape is identical.
3. **`src/agent/MechanicsManifest.ts`** — `regatta_boat.disembark` now reads what the code does, and the rule publishes `gangwayReach` beside `gangplankReach`/`deckHalfWidth`/`deckHalfLength`/`hullRadius`, so a rider computes the predicate instead of inferring it. The census pin (`e2e/er01-e5-census.spec.ts:318`) is a `toMatchObject`, so the field is additive; census green.
4. **`src/agent/StandingOrders.ts`** — the refusal doc block names the ruling. The published refusal STRINGS and `BOAT_ORDER_REFUSALS` are byte-identical, so nothing pinned by `gr-sim` / `agent-view` moves.
5. **`public/skill.md`** (the Regatta paragraph) — "within a plank of the rail" becomes the gangway's reach off the deck anchor, names `gangwayReach`, and says plainly that a body leaves her over the SIDE while a bow-ward intent runs her aground. `skillmd-guard` + `skillmd-contracts-guard` green.
6. **`specs/agent-play/e5-regatta-steerable-boat.md`** — one dated line under law 2 quoting the ruling, so "within reach" has a definition inside the law.
7. **Tests** — the F-RB2-2 band test re-pinned with the ruling quoted, plus a new test driving all four cases at the hull position where the hazard actually lived.

## Behaviour, stated plainly

A body leaves her **over the side**. An intent within ~46.5 degrees of the keel lands inside the 8.8 m-wide deck, so `stepAshore`'s "off the deck" clause refuses it and the hull runs aground on its own clamp exactly as it does today. Slice 1's overboard band (z 33.5 .. 47.25 to the north; beyond 47.25 the old probe fell outside the terrain and stepped nobody either) is gone.

**Residual, not hidden:** the BEAM reach is unchanged, so the finish-beacon tightness slice 2 recorded survives — the finish scores at x = 43 against an east band of 43.35, i.e. 0.35 m of margin, and a racer crossing the line on a held east key can still leave her. Ruling (a) shortens the bow, not the gangway; curing that residual means moving a mark or a radius, which is data and not this task.

## The adaptation, declared

The master's scope 1 reads "the point `CLAIM_BOAT_GANGPLANK_REACH` along the unit intent from the deck anchor" — a 2 m radius. **That number cannot be implemented as written.** The deck is 8.8 m wide and 28.5 m long, so every point 2 m from the anchor is INSIDE the deck rectangle; `stepAshore`'s `!contains` clause would then refuse every direction, disembark would stop existing and spec law 2 would be dead letter. It also contradicts the master's own scope 4, which requires "a beam-ward key at standable ground 1.5 m off the rail DOES" disembark — and 1.5 m off the rail is 5.9 m from the anchor. The reach implemented is the shortest one that keeps law 2 alive and satisfies every case scope 4 names: **the beam half-width plus one plank, 6.4 m** — precisely the reach the beam already had. It is the bow's reach that shortens, which is what the owner's words ask for ("not a boat-length").

## Evidence

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | `rc=0` (the pre-flight `npm run build` was `rc=0` before any edit) |
| `npm run build` after the change | `rc=0` — `build-after.log` |
| self-check guards: `regatta-boat-steer`, `claim-boat-view`, `claim-boat-asset`, `same-game-audit`, `skillmd-guard` | `rc=0  tests 39  pass 39  fail 0` — `self-check-guards.log` |
| adjacent guards: `deepwater-rider-parity`, `hero-move-verb`, `rider-parity-reach`, `deck-movement`, `deck-menu`, `view-schema-guard`, `no-emdash-guard`, `skillmd-contracts-guard` | `rc=0  tests 28  pass 28  fail 0` — `adjacent-guards.log` |
| the tape | `[regatta-boat] tape hash fnv1a32:dd4116bf over 42 samples` — **unchanged**; the slice-3 view tape also unchanged (`fnv1a32:9e79d1e9`, won in 137.9 s) |
| `e2e/e5-regatta-boat.spec.ts`, both projects, `--workers=1` | `6 passed (1.8m)` — the browser tape replay at `:196` reaches the same pinned hash, the plain-boot ride at `:122` (with `:164-166` unmodified) and the keyed course win at `:364` are green — `e2e-regatta-boat.log` |
| `e2e/e5-regatta-race` + `er01-e5-census` + `agent-view` + `e5-sea-contact`, both projects | `36 passed (2.1m)` — `e2e-adjacent.log` |
| `e2e/board-gating-and-profiles` + `ss-06-e5-beats` + `release-frontier`, both projects | `18 passed (2.3m)` — `e2e-adjacent-2.log` |
| `e2e/terrain3d-registry.spec.ts` | `:196` and `:272` red on mobile-chrome — **pre-existing, fingerprint-matched** to `logs/suite-red-inventory.md:1705` (`(:196, :272, :345) | both | terrain triangle count 51,200 vs 32,768 | F-OMB-6, reproduced on the pristine tree after reverting the Blackout pack`). Nothing here touches terrain. |
| `node scripts/same-game-audit.mjs` | `rc=0`; **e5-regatta: 32 equal, 10 agent-lacks** — the ten are the global "no `<verb>` standing order" rows every contract carries (restart, debug_spawn, debug_xp, skip_ceremony, research_skip, research_pick, set_pause, death_action, set_agent_rung, set_agent_ability). The helm row reads EQUAL: `| e5-regatta | verb | the player walks the hero with the movement keys or the touch stick | MOVE_HERO walks the hero to a point through the same Intents.move seam | equal |` — `same-game-audit.txt` |
| console / page errors, plain boot at 1280 and 390 | zero in every case: each browser test ends in `expectNoConsoleErrors` |

## The two disembark cases, shot at 1280 and 390

Reproduce: `npx vite --port 5305 --strictPort --host 127.0.0.1`, then
`npx playwright test --config artifacts/f-rb2-2-gangway-reach/pw.config.ts --workers=1 --reporter=line`
(`disembark-shots.spec.ts` — plain boot, no `?debug`, no `__GR_TEST__`). Result: `4 passed (49.7s)`.

| Case | Shots | Measured |
| --- | --- | --- |
| **Keel-ward, NO disembark** | `keel-no-disembark-desktop-chrome.png`, `keel-no-disembark-mobile-chrome.png` | key held from the start line to the north rim: in-band sample at `z = 34.57` (desktop) / `34.69` (mobile) with `aboard: hero`. Slice 1's probe there was `z = 50.82 / 50.94` — past the hull clamp (49.75) and inside the terrain (63.5), i.e. standable ground it WOULD have stepped onto. The ruling's probe is `40.97 / 41.09`, inside her own deck edge (48.8 / 48.9). The drive ends **aground at the clamp, z = 49.75, still crewed**, the hero on the deck anchor. |
| **Beam-ward, DISEMBARK** | `beam-disembark-desktop-chrome.png`, `beam-disembark-mobile-chrome.png` | port key held: last sample aboard at `x = -47.863`, its port probe at `-54.263` (just past the clamp, onto the rim) and the body steps off. Boat speed `0`; hero at `x = -54.558`, off the port rail and beyond `-49.75`. The 6.695 m hero-to-hull gap is 0.295 m of walking after the step, because the key stays down and a body ashore keeps walking. |

A JSON of the numbers sits beside each shot. `probe.mjs` is the scratch instrument that measured the old and new reaches and the map's walkable rim (`node artifacts/f-rb2-2-gangway-reach/probe.mjs` from the worktree root).

## Tests re-pinned (file:line, old -> new)

| Where | Old | New |
| --- | --- | --- |
| `scripts/regatta-boat-steer.test.mjs:748` (title; was `:733`) | `SLICE 2 — the marks score before the bow-probe reaches the rim (the radius-6 reason)` | `SLICE 2 + F-RB2-2 (a) — the gangway bands, and the marks that score inside them`. No ledger cites the old title (checked `logs/suite-red-inventory.md` and the repo). |
| `scripts/regatta-boat-steer.test.mjs:761` (bow probe; was `:745`) | `16.25` | `6.40`, plus a new `contains(bowProbe) === true` assertion |
| `scripts/regatta-boat-steer.test.mjs:763` (diagonal probe; was `:746`) | `5.81` | `4.53` |
| `scripts/regatta-boat-steer.test.mjs:771` (north band; was `:750`) | `33.50` | `43.35` |
| `scripts/regatta-boat-steer.test.mjs:787` (east band; was `:764`) | `43.35` | `43.35`, re-affirmed with the ruling's reason in the message |
| `scripts/regatta-boat-steer.test.mjs:817` | — | NEW `F-RB2-2 (a) — the gangway reach: she is left over the SIDE, and a bow-ward intent steps nobody`: key and rider, bow and beam, driven at a hull position inside slice 1's overboard band; the rider's point a metre past the bow (accepted by slice 1) now answers `UNREACHABLE_WATER`, and the refusal WORD proves the ground was standable because `UNREACHABLE_TERRAIN` answers first for ground no body can stand on |
| `scripts/claim-boat-view.test.mjs` | — | untouched: it pins no gangway band (no `gangplank` / `ashore` reference in the file) |
| `e2e/e5-regatta-boat.spec.ts` | — | untouched: `:164-166` is the hero walking off the deck BEFORE boarding, and the helm is inert while nobody is aboard, so the ruling does not reach it. Green as-is on both projects. |

## Not done, and for the drain

- `assets/engine-era.json` is **not** re-pinned: outside the firewall, and the engine hash moves with any `src/` edit. The era pin and the era guard are the drain's, as in slice 2.
- Running the browser suites rewrites tracked evidence PNG/JSON files in OTHER `artifacts/` directories (`e5-regatta-boat`, `e5-regatta-boat-02`, `board-gating`, `terrain3d-registry`, `wire-landmark-mounts`, `reviews/shots-wire-campaign`). They were restored to `HEAD` rather than committed — outside this task's firewall.
- `ClaimBoat.distanceToDeck` is now dead (only its own definition remains). Kept and annotated; removing it is a one-line drain-side call.
