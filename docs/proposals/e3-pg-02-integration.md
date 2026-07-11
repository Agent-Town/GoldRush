# E3 PG-02 integration bridge — Economy, brown-outs, and light

**Status:** PROPOSAL — FABLE RATIFICATION REQUIRED

**Implementation gate:** no code until this document is ratified **and** `sol/e3-power-prototype@b7ee05e7` is an ancestor of `origin/main`

**Scope:** downstream policy for the B7 power read model; this branch is documentation only

## Numbering and canonical home

This is the follow-up wave's **PG-02 design document**, not permission to implement the older proposal's PG-02 code slice. The ratified architecture and implementation ladder remain in [`e3-power-integration.md`](./e3-power-integration.md), where canonical endpoint identity is PG-02, Economy binding is PG-07c, day/night and light are PG-08b–e, the ledger is PG-11, and the tram adapter is PG-12. This document refines the Economy and light policies without renumbering or widening those slices.

The B7 implementation contract lives in [`e3-power-prototype.md`](./e3-power-prototype.md) and `src/systems/PowerGraph.ts`. B7 is the allocation owner and read model; this document does not move machine, Economy, lighting, or spawn behavior into it.

## Proposed rulings

1. **Watts are graph capacity, not currency.** They never become an `EconomyResourceId`, banked balance, pickup, or reward event.
2. **Consumers use integer allocation.** Gameplay derives from `allocatedWatts` and `demandWatts`; the snapshot's ratio is for display and convenience, not rounded gameplay arithmetic.
3. **Effect policy belongs to content.** PowerGraph decides allocation only. A building or contract definition declares whether its effect is binary, scaled, or a scaled bonus over an unpowered baseline.
4. **One machine cycle produces one Economy event.** Base yield and powered bonus are calculated before the call and commit or fail together.
5. **Day/night and illumination are simulation read models.** `DayNightCycle` owns phase; `LightField` owns spatial light. `LightRig` and enemy rendering are projections only.
6. **E3's cycle is exact.** Wave 0 and waves 1–3 are day; waves 4–6 are night; the six-wave pattern repeats. A boundary wave changes gameplay phase before its spawns execute.
7. **The first brown-out ledger is read-only.** It explains allocation and effect, but cannot reorder priorities or mutate the graph.

## What B7 does and does not provide

B7 provides a bounded, canonical graph definition; deterministic priority-then-ID allocation; fixed-tick commands; deeply frozen node/component/wire snapshots; allocation and topology revisions; and a signature. Its node read model already exposes the integer supply facts downstream systems need.

B7 does **not** reconcile placed endpoints or add/remove nodes and wires. Its constructor owns one exact definition, and its runtime commands only cut or repair a known wire, take a known node online or offline, or change a known consumer priority. Real construction therefore still waits on the stable endpoint identity, topology reconciliation, persistence, hash, and lockstep seams in the canonical integration proposal. Rebuilding `PowerGraphSystem` when a building changes is not an acceptable shortcut: it would reset revisions, events, and graph identity.

Power transition events are diagnostic receipts. Initial solve and restore can both produce state transitions, and event history is bounded. No reward, objective, light source, or machine cadence may be driven from those events; every consumer reads the current post-step snapshot.

## Ownership

| Concern | Sole owner | Binding rule |
| --- | --- | --- |
| Connectivity, supply, priority, allocation | `PowerGraphSystem` | Publishes the immutable B7 read model; knows no machine semantics |
| Stable placed identity and lifecycle | `BuildSystem` | Publishes sorted endpoint projections after the identity slice; pool indexes remain private |
| Machine cadence and base output | The machine's existing owner | Converts one allocation sample into one effective cycle/rate/amount |
| Gold balances, cap checks, and event log | `Economy` | Receives one final ordinary event; never sees watts or a power-bonus side event |
| Day/night phase | `DayNightCycle` | Derives an immutable phase snapshot from the contract schedule and authoritative wave clock |
| Gameplay illumination | `LightField` | Combines sorted source projections and answers pure point/zone queries |
| Wave planning, RNG, and spawning | `WaveSystem` | Filters declared ambush gates through a supplied light snapshot; remains the spawn owner |
| Palette, real lights, halos, enemy dimming | `LightRig` and presentation views | Consume snapshots and never answer simulation queries |

`Game` orders these owners in the fixed tick; it does not become a second power, light, or Economy system.

## Power-to-Economy contract

### Stable binding

A powered machine binds to a stable namespaced endpoint ID from the endpoint projection ratified in the canonical proposal. A pool index, position, display label, or array order is never a power address or Economy provenance ID. Wrecked machines keep their identity but project offline; demolition removes the endpoint and its incident topology through the graph owner.

The dormant optional `produces` / `consumes` / `relay` shape in `src/game/buildables.ts` should be replaced, not wrapped. The graph-facing role is discriminated producer, relay, or consumer data. The effect-facing policy remains beside the machine or contract content that understands what “powered” means.

### Exact consumer semantics

For a consumer with integer allocation `A` and demand `D`:

- **binary:** the effect is enabled only when `A === D`;
- **scaled required output:** `mulDivFloor(baseOutput, A, D)`;
- **scaled bonus:** `baseOutput + mulDivFloor(fullPowerBonus, A, D)`.

The content boundary accepts only non-negative safe integers, requires positive `D`, and bounds the final amount to the canonical Economy decoder limit. `mulDivFloor` uses an overflow-safe integer implementation (BigInt intermediate is acceptable) and converts back to `number` only after the result passes that bound; it never evaluates the potentially unsafe `number` product first. These formulas make dark, brown-out, and full-power outcomes exact without depending on a display-rounded ratio. A binary load that receives partial watts remains disabled and still consumes that allocation; the ledger must say so plainly rather than calling it powered.

This proposal chooses amount scaling for discrete Economy cycles. If a scaled-required amount rounds to zero, the owner emits no zero-value receipt and leaves the cycle pending. Rate/progress scaling is a separate content policy; it cannot ship until its owner defines a versioned integer work-unit and remainder surface plus deterministic migration from any older timer representation. PowerGraph never owns that accumulator.

### Tram ruling

The Canyon Works tram retains its normal haul with no power and gains a proportional bonus from brown-out power. If its base and full-power bonus are equal, darkness pays one haul and full power pays two. A full-only binary bonus is the rejected alternative unless Fable explicitly chooses the sharper cliff.

The real adapter waits for the real fixed-tick tram entity. PG-12 adds a typed `gold_hauled` event carrying the stable tram ID and one integer amount, with matching reducer, summary, bank-cap, 069 decoder, suspend migration, and semantic-hash coverage. Its owner samples allocation at its authoritative cargo-completion tick and submits that one event. It does not masquerade as a sluice, and PowerGraph does not move the tram or award its cargo.

### Atomicity and cap behavior

Base and powered bonus are never separate events. The machine computes the final amount, performs the ordinary bank-cap check, then calls `Economy.apply()` once. A cap rejection commits neither portion and leaves the machine's cargo/progress in its normal retry state. Powered income cannot bypass the cap.

This follows the existing Sluice ownership pattern in `src/entities/Sluice.ts`: the source owns cadence and provenance; Economy owns acceptance and balance mutation. Power-dependent bank-cap bonuses are outside this proposal because they add a second persistence problem without advancing the E3 teaching loop.

Restore solves the graph before machine effects resume and suppresses no legitimate future cycle, but it never pays merely because a node changed from unknown to powered. `Economy.apply()` does not deduplicate receipt IDs. Exactly-once payout comes from advancing persisted machine cargo/cycle state in the same fixed-tick transaction as the one accepted Economy event; the log remains audit and replay state, not an idempotency gate.

## Brown-out ledger contract

The ledger reads the graph snapshot and the content-owned effect policy. It may explain component supply/demand, the consumer's priority and integer allocation, its powered/browned-out/dark state, and the resulting machine or lamp effect. It does not infer allocation from Economy history and does not poll presentation objects.

The ledger refreshes on graph allocation/topology revisions and source lifecycle changes. Machine simulation still reads the post-step snapshot every fixed tick; a UI revision optimization cannot become gameplay timing.

Player priority controls, breakers, automatic load shedding, storage, transmission loss, and power trading remain deferred. The first ledger teaches the deterministic order that already exists.

## Day/night contract

### Schedule

`DayNightCycle` consumes a contract-declared schedule and the authoritative WaveSystem clock. E3 anchors the repeating pattern as follows:

- wave 0 and waves 1–3: day;
- waves 4–6: night;
- waves 7–9: day, then repeat in six-wave blocks.

The E3 schedule declares its bounded night darkness; day gameplay darkness is exactly 0. `DayNightCycle` publishes gameplay phase/darkness plus a presentation target. Both targets change at the same fixed-tick boundary. LightField reads only the gameplay values, while LightRig may interpolate toward the presentation target without predicting the next phase.

At the start of wave 4, gameplay becomes night before any wave-4 spawn executes. At the start of wave 7, gameplay becomes day before any wave-7 spawn executes. Ahead-of-time pulse planning and telegraphing cannot advance phase: `DayNightCycle` consumes only the authoritative due-spawn wave promoted at the fixed-tick boundary. Presentation never predicts a future phase. The first rendered frame containing the new wave's enemies uses the new phase snapshot.

The current Night Shift wave ramp is migrated first as a schedule kind, preserving its existing phase, darkness, targeting, victory, and suspend behavior. E1 darkness remains a visibility treatment only; extracting the owner must not silently add dark ambushes or disable combat.

### LightField

`LightField` is pure simulation data with no THREE objects. It combines `gameplayDarkness` from `DayNightCycle` with canonically ID-sorted source projections. Source contributions combine by maximum coverage, not addition, so input order cannot change a sample. `LightRig` may interpolate toward the same snapshot's presentation target, but LightField never reads presentation darkness.

The contract boundary normalizes `minLight` and the required `litThreshold` from 0 through 1, plus finite positive `falloff` within the descriptor's coordinate cap. For `sample(x, z)`, day or zero gameplay darkness returns factor 1. Otherwise source light begins at `minLight`. A point at or inside a source radius contributes 1; beyond it, the contribution is `minLight + (1 - minLight) * (1 - clamp((distance - radius) / falloff, 0, 1))³`. The maximum source contribution becomes `sourceLight`, and the final factor is `clamp(1 - gameplayDarkness * (1 - sourceLight), 0, 1)`. A point is lit exactly when `factor >= litThreshold`. E1's adapter must reproduce its current normal-play samples at threshold boundaries.

Unpowered actor/legacy sources project as full sources through their own owners. A powered Arc Lamp uses the same B7 allocation facts as an Economy consumer:

- binary policy: full radius only at `A === D`;
- scaled policy: `fullRadius * (A / D)`.

The recommended Arc Lamp policy is scaled radius so a brown-out is visible and strategically legible. Arc Turrets remain a natural binary consumer. A moth attachment later multiplies the lamp source after allocation; it does not alter watts or teach PowerGraph an enemy rule.

All gameplay systems ask the same LightField snapshot. Enemy tint and halo rendering consume its samples as presentation. Combat and targeting do not become darkness-dependent unless a later contract explicitly declares that mechanic.

### Dark ambushes and RNG

WaveSystem retains all spawn planning and RNG ownership. The current spawn-gate shape has no ID, so PG-09 must add a required bounded gate ID and enforce uniqueness at the 069 contract boundary before dark ambushes ship. For a declared night-ambush slot, WaveSystem receives the immutable LightField, sorts those gate IDs, samples each gate's declared `(x, z)`, filters to factors below `litThreshold`, and makes one RNG choice only when at least one candidate remains. If every candidate is lit, only that ambush slot is skipped and no fallback RNG draw is consumed. Ordinary scheduled enemies continue under their normal policy.

The threshold defining “lit” belongs to the contract/light policy and is evaluated from authoritative allocation and source data, never the number of real lights the renderer can afford.

## Fixed-tick order

The present branch runs wave spawning and machine effects before the graph, while Night Shift light is assembled during presentation. Product binding requires this order:

1. Apply canonical player/enemy actions and building lifecycle mutations.
2. Canonicalize endpoint projections and queue graph inputs/commands without mutating graph state elsewhere.
3. Let `PowerGraphSystem` atomically reconcile, consume pending commands, solve for the current simulation tick, and freeze its allocation view.
4. Let WaveSystem promote the authoritative due-spawn wave and expose due spawn intents without spawning; future planning/telegraph state may continue but cannot change phase.
5. Step `DayNightCycle` and build the immutable LightField from the new phase and power allocation.
6. Execute due spawns through WaveSystem using that LightField.
7. Advance powered machine cadence, combat consumers, and objectives; submit ordinary Economy events.
8. Publish snapshots to presentation.

A mutation that misses the graph phase is observed at the next graph phase. Therefore a cut, wreck, repair, or restored loop affects every downstream consumer no later than the next fixed tick, satisfying the Canyon Works cut-to-dark contract without render-rate dependence.

## Persistence, hash, and resync

Persist authoritative inputs only: stable endpoint identities plus the monotonic `nextInstanceSerial`, wires/cuts, priority overrides, content-owned machine progress, and a day/night anchor only when it cannot be derived from the restored WaveSystem clock. The 069 decoder requires the next serial to be greater than every decoded building serial; removed IDs are never silently reusable. Moth attachment or another temporary modifier is persisted by its owning system when that content exists.

Do not persist solved components, allocations, node state labels, LightField samples, palette state, real lights, catenary geometry, diagnostic timings, or transition events. Recompute them after the 069 boundary accepts the whole snapshot.

Restore order is endpoint owners, graph inputs, one graph solve, wave/day-night derivation, LightField derivation, then machine progress. The canonical hash/resync surface includes graph inputs and every non-derived light/effect input. The B7 graph signature and a future LightField signature are verification outputs, not replacement save authority.

## Ratifiable execution sequence

Implementation stays in the canonical proposal's existing slices:

1. stable endpoint identity, projection, topology reconciliation, persistence, and hash before any real effect;
2. a pure integer allocation-policy fixture proving binary, scaled-required, and scaled-bonus outcomes;
3. one scaled Economy consumer through its existing machine owner and one atomic event;
4. fixed-tick Night Shift extraction with E1 parity, then the E3 six-wave schedule;
5. pure LightField extraction with current source/falloff parity;
6. one scaled powered lamp, then deterministic dark-ambush gate filtering;
7. the read-only brown-out ledger and E3 ink-blue/lamp-gold presentation;
8. the tram adapter only after the tram entity exists.

Each step has one owner seam and a playable or diagnostic checkpoint. Wire purchasing, objectives, Canyon composition, priority controls, and later enemies stay in their already-ratified slices.

## Gates

- exact, overflow-safe Economy outcomes at allocation 0, partial, and full; one non-zero event per completed cycle;
- `gold_hauled` survives decoder, replay, summary, suspend, and semantic-hash round trips;
- bank-cap rejection remains atomic and machine progress survives it;
- graph transition events and restore never pay a bonus;
- cut/repair changes machine and lamp behavior by the next fixed tick;
- source permutation produces the same LightField samples and signature; radius and `litThreshold` equality are pinned;
- future pulse planning cannot advance phase before the due-spawn wave is promoted;
- wave 3→4 and 6→7 boundaries change phase before spawn execution;
- an all-lit ambush consumes no RNG draw and ordinary waves remain unchanged;
- Night Shift's existing wave, visibility, targeting, victory, and restore behavior remains identical;
- uninterrupted and suspend/resume runs match graph signature, phase, light signature, machine progress, semantic Economy events excluding receipt IDs, and totals;
- restored `nextInstanceSerial` is greater than every live building serial and demolished IDs are never reused;
- 30, 60, and 144 Hz render schedules end with identical authoritative state;
- B7's isolated 0.5 ms graph budget remains a solver gate; consumer and LightField costs are measured separately so they cannot hide graph regression.

## Ratification calls

1. Accept proportional, floored tram bonus: unpowered baseline, brown-out fraction, full power double.
2. Accept E3's exact 1–3 day / 4–6 night anchor and boundary-before-spawn rule.
3. Accept scaled Arc Lamp radius and binary Arc Turret behavior.
4. Keep the first brown-out ledger read-only.
5. Keep all-lit behavior as “skip only the ambush slot, consume no RNG.”
6. Add required unique E3 ambush-gate IDs and a required normalized `litThreshold`, with equality counted as lit.

Until these calls are ratified and B7 lands on main, this document authorizes no product code.
