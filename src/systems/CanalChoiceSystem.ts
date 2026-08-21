import {
  canalChoiceEntryId,
  isCanalChoiceEntry,
  parseCanalChoicePayload,
  TILE_STATE_SCHEMA_VERSION,
  type TileStateStore,
} from '../game/TileStateStore';
import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A10 — THE OLD CANAL, and the inheritance you edit one segment at a time.
 * (`specs/agent-play/door-completion-sheet.md:26`, RATIFIED 2026-08-20, owner verbatim:
 * "Group 1: approved (with any tweaks)".)
 *
 * THE DESIGN, as ratified: "each segment offers a one-time persistent CHOICE at its stake
 * (context action): RE-DIG → the segment permanently carries water on all future runs (a wet
 * canal band: water source + the canal system's benefits) · DEMOLISH → permanently open build
 * ground. The final flow renders from the combined persisted choices. Objective: decide all
 * three + survive to secure."
 *
 * EVERYTHING BELOW IS READ FROM WHAT THE CONTRACT ALREADY DECLARES (reject-don't-stretch,
 * Mistake #14). The segments are the authored `buildZones` that CONTAIN an authored
 * `stakeMarkers` entry — on `e9-old-canal` that is exactly the three `old-canal-segment-*` boxes
 * and their three `decide-segment-*` stakes; the two yards hold no stake and are therefore not
 * segments and are never affected by a choice. Nothing about the geometry is a constant in this
 * file. The only data the slice adds to the contract is `harvestAnchors`, which the door needs.
 *
 * WHAT A CHOICE ACTUALLY DOES, IN BOTH ENGINES, WITH NO INVENTED VOCABULARY:
 *
 *   UNDECIDED — the derelict ditch the Diggers left. No works may stand in it. This is the state
 *   the sheet's word "open" implies a choice moves you OUT of ("DEMOLISH → permanently *open*
 *   build ground"): ground that is already open cannot be opened, and a DEMOLISH that changed
 *   nothing would be half the ratified mechanic missing.
 *
 *   RE-DIG — the band carries water forever. Two teeth, both on substrates the epoch already
 *   owns: (1) works may never stand in the water, for this run and every run after it, and
 *   (2) the wet band is written to the profile as a no-spawn zone, so from the NEXT tile birth
 *   onward outlaws do not wade up a live canal (`TileStateStore.applyAtBirth`, the same birth
 *   seam TP-02 and A8 use — one new sim kind, no new mechanism).
 *
 *   DEMOLISH — the band is filled in and the ground is yours forever: works may stand there from
 *   the moment the choice lands, on this run and every run after it.
 *
 * So the trade is the sheet's own, priced in the only two currencies this map has: a re-dug
 * segment buys permanent denial with permanent ground, and a demolished one buys ground by
 * giving up the water. There is no gold in it and no timer on it — neither is declared.
 *
 * WHY IT IS A SYSTEM AND NOT AN `src/sim` SOCKET, verbatim from `SeedCaravanSystem`'s reasoning
 * one map over: the era-socket family (`AtomicSocket`, `DeepwaterSocket`, `E9CanalSocket`)
 * composes browser systems into census probes that `HeadlessContractSim` never ticks. This
 * consumer gates the secure, and an objective only a census can see is not an objective.
 *
 * NO RENDER IMPORT, AND THAT IS LOAD-BEARING (F-A8-7, paid for once already). `MechanicsManifest`
 * sources this consumer's rule from the consumer, and specs import `MechanicsManifest` — so a
 * single convenience import of `world/Terrain` here would drag `assets/layer-contracts/*.json?raw`
 * into every spec's collection graph and collapse `npx playwright test --list` to zero tests.
 * The browser paints the flow from `diagnostics` in `CanalFlowPresentation`; this file paints
 * nothing and imports nothing that does.
 *
 * DETERMINISM. No RNG, no wall clock, no tick: a choice is a pure function of the position it is
 * taken from and the choices already held. The profile is read exactly once, at birth.
 */

/** Machine-readable refusal codes, in the same kebab house style as `probe-out-of-reach`. */
export const CANAL_OUT_OF_REACH_REASON = 'canal-out-of-reach';
export const CANAL_ALREADY_DECIDED_REASON = 'canal-already-decided';
export const CANAL_NOT_DECLARED_REASON = 'canal-not-declared';

/**
 * THE TWO WIRE WORDS, and why one of them is not the sheet's word.
 *
 * `CONTEXT_ACTION action='redig'` is the sheet's RE-DIG exactly. `CONTEXT_ACTION
 * action='backfill'` is the sheet's DEMOLISH: the wire word had to change because
 * `CONTEXT_ACTION action='demolish'` is ALREADY the works verb (`StandingOrders.ts:36`, with a
 * `{id,index}` target), and one wire word that means both "tear down that turret" and "fill in
 * that canal" is the Vocabulary Stretch this house has a mistake number for (#14). `backfill` is
 * the civil term for exactly what the sheet describes — spoil pushed back into the cut until the
 * ground is ground again — so the rename is a translation, not a new mechanic. Every player-facing
 * string still says DEMOLISH.
 */
export const CANAL_REDIG_ACTION = 'redig';
export const CANAL_BACKFILL_ACTION = 'backfill';

/**
 * How close the deciding body must be to the stake. The plant verb's reach, taken deliberately:
 * A8 measured 3.2 as the distance at which a headless rider standing "on" a stake actually
 * registers as being there (`SEED_CARAVAN_PLANT_REACH`), and a second number for the same gesture
 * would only be a second thing to get wrong.
 */
export const CANAL_DECISION_REACH = 3.2;

export type CanalChoice = 'undecided' | 'redig' | 'demolish';

export type CanalSegment = {
  /** The authored stake id, e.g. `decide-segment-a`. */
  id: string;
  /** The authored buildZone that contains the stake, e.g. `old-canal-segment-a`. */
  zoneId: string;
  /** The stake itself — where the choice is taken. */
  x: number;
  z: number;
  /** The band the choice governs: the authored zone rectangle, unedited. */
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type CanalDecisionResult =
  | { ok: true; segmentId: string; choice: 'redig' | 'demolish' }
  | { ok: false; reason: string };

export type CanalChoiceDiagnostics = Readonly<{
  /** True when the active contract declares `twist.persistentCanalChoices` AND has segments. */
  declared: boolean;
  /** Every segment's standing choice, keyed by the authored stake id. Ordered as authored. */
  choices: readonly { id: string; zoneId: string; choice: CanalChoice }[];
  decided: number;
  total: number;
  /** THE OBJECTIVE LATCH the secure reads. Never un-latches. */
  allDecided: boolean;
  /** The final flow: the re-dug segments, in authored order. This IS the water route. */
  flow: readonly string[];
  /** The demolished segments, in authored order — the ground the profile has opened. */
  openGround: readonly string[];
  /** Decided THIS run (staged, committed at run end). */
  decidedThisRun: readonly string[];
  /** Decided on an earlier run by this profile, read once at birth. */
  decidedBefore: readonly string[];
  /** Refused attempts, split by cause. Presentation-stripped evidence, not decoration. */
  refusals: Readonly<{ outOfReach: number; alreadyDecided: number }>;
  /** The static declaration a rider walks to. Stripped from the simulation snapshot. */
  segments: readonly CanalSegment[];
}>;

const CHOICE_PREFIX_LENGTH = canalChoiceEntryId('').length;

export class CanalChoiceSystem {
  private readonly choices = new Map<string, CanalChoice>();
  private readonly decidedThisRun = new Set<string>();
  private readonly decidedBefore: ReadonlySet<string>;
  private readonly refusals = { outOfReach: 0, alreadyDecided: 0 };

  private constructor(
    private readonly contractId: string,
    private readonly segments: readonly CanalSegment[],
    private readonly tileState: TileStateStore,
    private readonly onVoice?: (position: { x: number; z: number }, text: string) => void,
  ) {
    const held = new Set<string>();
    for (const entry of this.tileState.readSnapshot(contractId).entries) {
      if (!isCanalChoiceEntry(entry)) continue;
      const segmentId = entry.id.slice(CHOICE_PREFIX_LENGTH);
      const payload = parseCanalChoicePayload(entry.payload);
      // A snapshot that names a segment this contract no longer authors is IGNORED, not honoured:
      // the loader contract's forward-compat rule cuts both ways, and a choice about ground that
      // does not exist must never decide an objective about ground that does.
      if (!payload || !segmentId || !this.segments.some((segment) => segment.id === segmentId)) continue;
      this.choices.set(segmentId, payload.choice);
      held.add(segmentId);
    }
    this.decidedBefore = held;
  }

  /**
   * Mirrors both engines with ONE read: the active contract's own twist plus its own zones and
   * stakes. Deliberately NOT epoch-gated and NOT id-gated — a contract that declares
   * `twist.persistentCanalChoices` and authors stakes inside build zones is the whole test, so
   * the three Red Fields siblings get a null from this same call and a later map that declares
   * the same pair needs no edit here.
   */
  static create(
    contract: ContractManifest,
    tileState: TileStateStore,
    onVoice?: (position: { x: number; z: number }, text: string) => void,
  ): CanalChoiceSystem | null {
    if (!contract.twist.persistentCanalChoices) return null;
    const zones = contract.tileParams.buildZones ?? [];
    const stakes = contract.tileParams.stakeMarkers ?? [];
    if (zones.length === 0 || stakes.length === 0) return null;

    const segments = stakes.flatMap((stake) => {
      const zone = zones.find((candidate) =>
        stake.x >= candidate.minX && stake.x <= candidate.maxX
        && stake.z >= candidate.minZ && stake.z <= candidate.maxZ);
      return zone
        ? [{
          id: stake.id,
          zoneId: zone.id,
          x: stake.x,
          z: stake.z,
          minX: zone.minX,
          maxX: zone.maxX,
          minZ: zone.minZ,
          maxZ: zone.maxZ,
        }]
        : [];
    });
    // A canal with no decidable segment is not this mechanic; refuse rather than stretch.
    if (segments.length === 0) return null;
    return new CanalChoiceSystem(contract.id, segments, tileState, onVoice);
  }

  /**
   * THE CHOICE — a context action at the stake, one per segment, for the whole life of the
   * profile.
   *
   * PERSISTENCE LAW (TP-02's, unchanged): the write is STAGED here and lands at the run-end
   * commit; the no-spawn half of a re-dig takes effect at the NEXT tile birth through
   * `applyAtBirth`. What DOES change immediately is the ground: `worksAllowed` below answers
   * from `this.choices` on the very next placement, so a player who re-digs watches the water
   * arrive and a player who demolishes can build in the cut a second later. That is the ratified
   * "the final flow renders from the combined persisted choices" seen from inside the run that
   * makes the choice.
   */
  decide(from: { x: number; z: number }, choice: 'redig' | 'demolish'): CanalDecisionResult {
    const segment = this.nearestSegmentWithinReach(from);
    if (!segment) {
      this.refusals.outOfReach += 1;
      return { ok: false, reason: CANAL_OUT_OF_REACH_REASON };
    }
    if (this.choiceFor(segment.id) !== 'undecided') {
      this.refusals.alreadyDecided += 1;
      this.onVoice?.(segment, 'This ground is already spoken for');
      return { ok: false, reason: CANAL_ALREADY_DECIDED_REASON };
    }

    this.tileState.stageWrite(this.contractId, {
      kind: 'sim',
      id: canalChoiceEntryId(segment.id),
      payload: {
        choice,
        minX: segment.minX,
        maxX: segment.maxX,
        minZ: segment.minZ,
        maxZ: segment.maxZ,
      },
      schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
    this.choices.set(segment.id, choice);
    this.decidedThisRun.add(segment.id);
    this.onVoice?.(
      segment,
      choice === 'redig' ? 'The water comes back — this cut is a canal again' : 'The cut is filled — this ground is yours',
    );
    return { ok: true, segmentId: segment.id, choice };
  }

  /** True when this contract actually fields decidable canal segments. */
  get declared(): boolean {
    return this.segments.length > 0;
  }

  /**
   * THE OBJECTIVE LATCH, in the canyon-connect shape (`Game.ts:5550`,
   * `HeadlessContractSim.ts:962`): a contract that declares canal choices cannot secure until
   * every segment has been decided one way or the other. A contract that declares none is
   * unaffected — which is why every caller holds `objectiveAllowsSecure` and not `allDecided`.
   *
   * It never un-latches because a choice is one-time: `decide` refuses a segment that already
   * holds one, and nothing in this class ever writes `'undecided'` back.
   */
  get objectiveAllowsSecure(): boolean {
    return !this.declared || this.allDecided;
  }

  get allDecided(): boolean {
    return this.segments.every((segment) => this.choiceFor(segment.id) !== 'undecided');
  }

  /** The standing choice for one segment. Pure — no counter moves. */
  choiceFor(segmentId: string): CanalChoice {
    return this.choices.get(segmentId) ?? 'undecided';
  }

  /**
   * THE BUILDABILITY SEAM, injected into `BuildSystem` by BOTH engines so the two cannot
   * disagree about where a work may stand. It answers ONLY about this contract's own segment
   * rectangles: every point on the rest of the tile gets `true` and is decided by the ordinary
   * `Terrain.isBuildable` test exactly as it always was.
   *
   * A demolished band is open ground. An undecided one is a rubble-choked ditch and a re-dug one
   * is water; neither takes a foundation.
   */
  worksAllowed(x: number, z: number): boolean {
    for (const segment of this.segments) {
      if (x < segment.minX || x > segment.maxX || z < segment.minZ || z > segment.maxZ) continue;
      return this.choiceFor(segment.id) === 'demolish';
    }
    return true;
  }

  /** True inside a band that carries water today. The presentation paints exactly these. */
  isWet(x: number, z: number): boolean {
    for (const segment of this.segments) {
      if (x < segment.minX || x > segment.maxX || z < segment.minZ || z > segment.maxZ) continue;
      return this.choiceFor(segment.id) === 'redig';
    }
    return false;
  }

  /** The nearest decidable stake in reach, or null. Pure — no counter moves. */
  nearestSegmentWithinReach(from: { x: number; z: number }): CanalSegment | null {
    let best: CanalSegment | null = null;
    let bestDistance = CANAL_DECISION_REACH;
    for (const segment of this.segments) {
      const distance = Math.hypot(from.x - segment.x, from.z - segment.z);
      if (distance <= bestDistance) {
        best = segment;
        bestDistance = distance;
      }
    }
    return best;
  }

  get diagnostics(): CanalChoiceDiagnostics {
    const choices = this.segments.map((segment) => ({
      id: segment.id,
      zoneId: segment.zoneId,
      choice: this.choiceFor(segment.id),
    }));
    return {
      declared: this.declared,
      choices,
      decided: choices.filter(({ choice }) => choice !== 'undecided').length,
      total: this.segments.length,
      allDecided: this.allDecided,
      flow: choices.filter(({ choice }) => choice === 'redig').map(({ id }) => id),
      openGround: choices.filter(({ choice }) => choice === 'demolish').map(({ id }) => id),
      decidedThisRun: [...this.decidedThisRun],
      decidedBefore: [...this.decidedBefore],
      refusals: { ...this.refusals },
      segments: this.segments,
    };
  }

  /** Stable event-log slice: the static declaration and the derived counts stay out. */
  get simulationSnapshot(): unknown {
    const { segments: _segments, declared: _declared, ...simulation } = this.diagnostics;
    return simulation;
  }

  /**
   * A run reset re-reads NOTHING from storage (the loader contract forbids a mid-life re-read)
   * and un-decides NOTHING, and the second half is the ratified design rather than an oversight:
   * the choice is "one-time persistent". A segment settled on the last run is settled — that is
   * what "inheritance is edited, not erased" means from the second run onward, and it is why a
   * profile that has already edited the whole canal only has to SURVIVE to secure it again.
   *
   * The floors stay honest anyway, by construction rather than by promise: both engines' bench
   * runs hand this class a fresh EMPTY `TileStateStore`, so every measured run starts with three
   * undecided segments and an idle rider decides none of them.
   */
  reset(): void {
    // Intentionally empty: nothing in this consumer belongs to a single run.
  }
}
