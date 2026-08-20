import type { ContractManifest } from '../meta/ContractFamilies';
import { E7_WRONG_NUMBER_FRAGMENT } from './E7SignalSystem';

/**
 * A6 — THE PROBE AND THE PLAYBACK (`specs/agent-play/door-completion-sheet.md:18`,
 * RATIFIED 2026-08-20). "objective = reach the probe crater and RECOVER (a context action in
 * the zone), which fires the one-time playback — the E7 jack-board's banked 'wrong-number
 * hello' fragment (the cross-era payoff already written in E7SignalSystem) — then hold to
 * secure."
 *
 * SHAPE COPIED FROM `SignalSuppression` ON PURPOSE: private ctor + `create()` read off the
 * CONTRACT (never the epoch), refusal counters, presentation-stripped diagnostics. Both
 * engines construct one of these per run and read it at their own gate sites, so the browser
 * and `HeadlessContractSim` cannot disagree about whether the probe is out there.
 *
 * ARMED ONLY WHEN BOTH HALVES ARE DECLARED, AND THAT IS THE LOAD-BEARING RULE. The objective
 * latch below pins a run UNSECURABLE until the probe is recovered. F-1471-1 is the standing
 * casualty of getting this wrong: a `powerGrid` with no `connect` objective pinned
 * `objectiveAllowsSecure` false forever, so beating the Baron won the contract and SILENTLY
 * FAILED TO SECURE IT. So a `twist.probePlayback` with no `probeRecoveryZones` to stand in —
 * a trigger with no completion path — must NOT arm: there would be no legal ground on which
 * any rider could ever discharge it. Declared-but-unreachable is treated as undeclared, and
 * `e2e/e8-far-side-probe.spec.ts` pins exactly that case.
 */

/** Machine-readable refusal codes, in the same kebab house style as `signal-suppressed`. */
export const PROBE_OUT_OF_REACH_REASON = 'probe-out-of-reach';
export const PROBE_ALREADY_RECOVERED_REASON = 'probe-already-recovered';
export const PROBE_NOT_DECLARED_REASON = 'probe-not-declared';

/**
 * TWO NAMES, DELIBERATELY, BECAUSE THEY BELONG TO TWO VOCABULARIES.
 *
 * `PROBE_RECOVERED_TRIGGER` is CONTRACT vocabulary — the literal `twist.probePlayback.trigger`
 * as authored in `contracts.json`, kebab like its neighbour `signal-suppressed`.
 *
 * `PROBE_RECOVERED_EVENT` is REPLAY-LOG vocabulary, and the log is snake_case without
 * exception: measured 2026-08-20, all sixteen types this engine emits (`announcement`,
 * `baron_defeated`, `blast_at`, `context_action`, `gold_granted`, `hero_died`, `wave_started`,
 * …) are snake_case, and `scripts/gr-sim.test.mjs:744` reads them as bare strings. Spending the
 * contract's hyphen here would make this the only kebab type in the log, so it does not.
 */
export const PROBE_RECOVERED_TRIGGER = 'probe-recovered';
export const PROBE_RECOVERED_EVENT = 'probe_recovered';

/**
 * The payload. Sourced from `E7SignalSystem` rather than re-typed here, so the Far Side and
 * the jack-board below can never drift apart — the probe is playing back the town's OWN first
 * hello, not a copy of it. `e8-far-side`'s contract says so in as many words: "The recovered
 * probe plays the valley-to-lighthouse wrong-number call once at the map's end."
 */
export const PROBE_PLAYBACK_FRAGMENT = E7_WRONG_NUMBER_FRAGMENT;

/** How close the recovering body must be to the crater rectangle, in world units. */
const REACH = 2.2;

export type ProbeRecoveryZone = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;

export type ProbeRecoveryResult =
  | { ok: true; zoneId: string; fragment: string }
  | { ok: false; reason: string };

export type ProbeRecoveryDiagnostics = Readonly<{
  /** True when the contract declares BOTH the playback trigger and at least one crater. */
  declared: boolean;
  trigger: string | null;
  zones: readonly string[];
  recovered: boolean;
  /** The crater it came out of, once. Null until then. */
  recoveredZoneId: string | null;
  /** The banked line, present only after the playback has fired. Null until then. */
  playedFragment: string | null;
  /** One-time by construction: the playback can never fire twice in a run. */
  playbackCount: 0 | 1;
  /** Refused attempts, split by cause. Presentation-stripped evidence, not decoration. */
  refusals: Readonly<{ outOfReach: number; alreadyRecovered: number }>;
}>;

type ProbeContract = Pick<ContractManifest, 'twist'> & {
  tileParams: { probeRecoveryZones?: readonly ProbeRecoveryZone[] };
};

export class ProbeRecovery {
  private recoveredZone: ProbeRecoveryZone | null = null;
  private readonly refusals = { outOfReach: 0, alreadyRecovered: 0 };

  private constructor(
    private readonly trigger: string | null,
    private readonly zones: readonly ProbeRecoveryZone[],
  ) {}

  /**
   * Mirrors the browser gate and the headless gate with ONE read. Deliberately NOT
   * epoch-gated: the Far Side is the only contract that declares this today, but the read is
   * of the CONTRACT, so a later era that declares the same pair gets the same mechanic free.
   */
  static create(contract: ProbeContract): ProbeRecovery {
    const playback = contract.twist.probePlayback;
    // Read defensively: this arrives from contract JSON, so compare the value rather than
    // trusting the TypeScript literal type.
    const trigger = playback?.trigger === PROBE_RECOVERED_TRIGGER ? PROBE_RECOVERED_TRIGGER : null;
    const zones = (contract.tileParams.probeRecoveryZones ?? []).filter(isZone);
    if (trigger === null || zones.length === 0) return ProbeRecovery.none();
    return new ProbeRecovery(trigger, zones);
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): ProbeRecovery {
    return new ProbeRecovery(null, []);
  }

  /** True when this contract actually fields a recoverable probe. */
  get declared(): boolean {
    return this.trigger !== null;
  }

  /** The one-way latch the objective reads. Never returns true on an undeclared contract. */
  get recovered(): boolean {
    return this.recoveredZone !== null;
  }

  /**
   * THE OBJECTIVE LATCH, in the canyon-connect shape (`Game.ts:5411`,
   * `HeadlessContractSim.ts:1178`): a contract that declares a probe cannot secure until the
   * probe is out of the ground. A contract that declares none is unaffected — which is why
   * this reads `!this.declared` first and not `this.recovered` alone.
   */
  get objectiveAllowsSecure(): boolean {
    return !this.declared || this.recovered;
  }

  /** Pure predicate — no counter moves. Use it for prompts and rendering. */
  inReach(position: { x: number; z: number }): boolean {
    return this.zoneAt(position) !== null;
  }

  /**
   * The action itself. Call it exactly once per attempted recovery so the counters stay
   * evidence. On success the latch closes for the whole run and the fragment comes back for
   * the caller to play — this module does no presentation of its own, because the two engines
   * surface it differently (announce + float text in the browser, a replay-log event and a
   * view row headless).
   */
  recover(position: { x: number; z: number }): ProbeRecoveryResult {
    if (!this.declared) return { ok: false, reason: PROBE_NOT_DECLARED_REASON };
    if (this.recovered) {
      this.refusals.alreadyRecovered += 1;
      return { ok: false, reason: PROBE_ALREADY_RECOVERED_REASON };
    }
    const zone = this.zoneAt(position);
    if (!zone) {
      this.refusals.outOfReach += 1;
      return { ok: false, reason: PROBE_OUT_OF_REACH_REASON };
    }
    this.recoveredZone = zone;
    return { ok: true, zoneId: zone.id, fragment: PROBE_PLAYBACK_FRAGMENT };
  }

  get diagnostics(): ProbeRecoveryDiagnostics {
    return {
      declared: this.declared,
      trigger: this.trigger,
      zones: this.zones.map(({ id }) => id),
      recovered: this.recovered,
      recoveredZoneId: this.recoveredZone?.id ?? null,
      playedFragment: this.recovered ? PROBE_PLAYBACK_FRAGMENT : null,
      playbackCount: this.recovered ? 1 : 0,
      refusals: { ...this.refusals },
    };
  }

  /** Rectangle test with the same `REACH` slack the megaproject's fund action uses (2.2). */
  private zoneAt(position: { x: number; z: number }): ProbeRecoveryZone | null {
    for (const zone of this.zones) {
      const dx = Math.max(zone.minX - position.x, position.x - zone.maxX, 0);
      const dz = Math.max(zone.minZ - position.z, position.z - zone.maxZ, 0);
      if (dx * dx + dz * dz <= REACH * REACH) return zone;
    }
    return null;
  }
}

function isZone(zone: ProbeRecoveryZone): boolean {
  return typeof zone?.id === 'string'
    && [zone.minX, zone.maxX, zone.minZ, zone.maxZ].every((value) => Number.isFinite(value));
}
