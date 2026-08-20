import type { ContractManifest } from '../meta/ContractFamilies';

/**
 * A4 — THE SIGNAL-SUPPRESSION CONSUMER (`specs/agent-play/door-completion-sheet.md:14`,
 * RATIFIED 2026-08-20). A contract-level OFF switch on three named systems, with no
 * parameters to choose: "nostalgia by subtraction, exactly as declared."
 *
 * WHY IT LIVES IN `src/systems/` AND NOT IN A SOCKET. The era-socket pattern
 * (`AtomicSocket`, `DeepwaterSocket`) exists to COMPOSE browser systems into the headless
 * engine. There is nothing here to compose: measured 2026-08-20, `src/sim/` imports no E7
 * system at all, `HeadlessContractSim` builds exactly one `Hero` (so it has no drone slot),
 * and `src/agent/` carries no playbook verb. A socket for this mechanic would have no
 * members. So the shape is the OTHER precedent the sheet allows — the `twist.powerGrid`
 * one, where `HeadlessContractSim` reads the manifest directly at the site the rule applies
 * (`HeadlessContractSim.ts:472`, `:1146`) — plus this shared module, which both engines
 * import so the READ is identical even though only one engine has systems to switch off.
 *
 * THE LITERAL-FALSE SCHEMA IS HONOURED LITERALLY. `twist.signalSuppression` names each
 * system with the literal `false` and nothing else (`ContractFamilies.ts:729`), and
 * `relayChains` is OPTIONAL: `e7-dead-band` declares all three, `e8-far-side` declares only
 * `drones` and `playbooks`. A key that is ABSENT is NOT suppressed — reject-don't-stretch
 * (Mistake #14). Only the literal `false` switches a system off.
 */

/** Machine-readable refusal code, in the same kebab house style as `multiplayer-active`. */
export const SIGNAL_SUPPRESSION_REASON = 'signal-suppressed';

/**
 * The county's voice for the refusal, ratified verbatim in the sheet: "playbook record/use
 * refuses with the county voice ('the Dead Band swallows it')". Written as a common noun so
 * A6's `e8-far-side` reuse reads true there too — a dead band is a stretch of the dial where
 * nothing propagates, which is precisely what both contracts declare.
 */
export const SIGNAL_SUPPRESSION_VOICE = 'The dead band swallows it.';

export type SuppressibleSystem = 'drones' | 'playbooks' | 'relayChains';

const SYSTEMS: readonly SuppressibleSystem[] = ['drones', 'playbooks', 'relayChains'];

export type SignalSuppressionDiagnostics = Readonly<{
  /** True when the active contract declares `twist.signalSuppression` at all. */
  declared: boolean;
  drones: boolean;
  playbooks: boolean;
  relayChains: boolean;
  /** How many times each system was actually refused this run. Presentation-stripped. */
  refusals: Readonly<Record<SuppressibleSystem, number>>;
}>;

export class SignalSuppression {
  private readonly refusals: Record<SuppressibleSystem, number> = { drones: 0, playbooks: 0, relayChains: 0 };

  private constructor(
    private readonly declared: boolean,
    private readonly suppressed: Readonly<Record<SuppressibleSystem, boolean>>,
  ) {}

  /**
   * Mirrors the browser gate and the headless gate with ONE read: the active contract's own
   * twist. Deliberately NOT epoch-gated — `E7SignalSystem.active()` is false outside
   * `epoch-7-signal`, and A6's reuse is an E8 contract, so an epoch test here would silently
   * un-suppress the Far Side.
   */
  static create(contract: Pick<ContractManifest, 'twist'>): SignalSuppression {
    const declared = contract.twist.signalSuppression;
    if (!declared) return SignalSuppression.none();
    // Read defensively: the field arrives from contract JSON, so `=== false` is the check,
    // not the TypeScript literal type.
    const twist = declared as Partial<Record<SuppressibleSystem, unknown>>;
    return new SignalSuppression(true, {
      drones: twist.drones === false,
      playbooks: twist.playbooks === false,
      relayChains: twist.relayChains === false,
    });
  }

  /** The undeclared case, reified so every caller can hold a consumer rather than a null. */
  static none(): SignalSuppression {
    return new SignalSuppression(false, { drones: false, playbooks: false, relayChains: false });
  }

  /** Pure predicate — no counter moves. Use it for rendering and manifests. */
  suppresses(system: SuppressibleSystem): boolean {
    return this.suppressed[system];
  }

  /**
   * The gate itself: true means REFUSE, and the refusal is counted. Call this exactly once
   * per attempted use so the counters stay evidence rather than decoration.
   */
  refuse(system: SuppressibleSystem): boolean {
    if (!this.suppressed[system]) return false;
    this.refusals[system] += 1;
    return true;
  }

  get diagnostics(): SignalSuppressionDiagnostics {
    return {
      declared: this.declared,
      drones: this.suppressed.drones,
      playbooks: this.suppressed.playbooks,
      relayChains: this.suppressed.relayChains,
      refusals: { ...this.refusals },
    };
  }

  /** The manifest's own row, sourced from this consumer rather than re-derived from JSON. */
  get suppressedSystems(): readonly SuppressibleSystem[] {
    return SYSTEMS.filter((system) => this.suppressed[system]);
  }
}
