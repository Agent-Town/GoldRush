// ═══════════════════════════════════════════════════════════════════════════════════════════
// E8 — THE AIR WINDOW, one definition for both consumers (owner ruling 2026-09-06, verbatim:
// "yes, same air for all space contracts - but I also never played the levels, so I dont know
// exactly"; `tasks/e8-air-wall-all-maps.md`).
//
// WHY THIS FILE EXISTS. `mare-claim-air-prevalent` put a per-window credit inside
// `E8AtmosphereSystem` (the Mare Claim) because that was the only consumer the ruling reached.
// This slice puts the SAME rule on the other three maps, whose consumer is `E8SuitAirSystem`, and
// on those maps it has to gate two different things — a regolith ground on the Eclipse, a vacuum
// crossing on the Far Side and Low Orbit. Three sites, one law: copying the seven lines three
// times is exactly how the number in the briefing and the number the latch enforces drift apart.
// So the window is a small object with one behaviour, and every consumer holds one.
//
// THE RULE, stated once. A window is `windowWaves x the contract's own wave interval` in SECONDS,
// accumulated on the consumer's own run clock a fixed tick at a time — never on the wave counter.
// That is a deliberate honesty rather than an approximation: the consumers are handed a fixed
// delta, and the Mare Claim's own measurement showed the two clocks agree everywhere except a
// single 1/30 s sliver at each boundary (`src/systems/E8PhysicsSystem.ts`, THE PREVALENCE RULE).
// At most ONE thing is credited per window; the index is published so a rider never has to guess
// which side of that sliver it stands on.
//
// A NULL `windowSeconds` MEANS NO WINDOW AT ALL — every credit counts whenever it is earned, which
// is the pre-ruling behaviour and the default a contract that authors nothing still gets.
// ═══════════════════════════════════════════════════════════════════════════════════════════

/**
 * A whole number above zero, or null — the one shape every authored air number takes
 * (`twist.atmosphere.regolithRequired`, `regolithWindowWaves`, `crossingRequired`,
 * `crossingWindowWaves`). The door already refuses malformed shapes
 * (`validateContractTwistAtmosphere`); this is the second belt, because a run can be booted from a
 * tape or a room whose manifest never passed the door, and the honest answer there is the RATIFIED
 * DEFAULT rather than a crash or a made-up number.
 */
export function positiveInteger(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

export class E8AirWindow {
  private elapsedSeconds = 0;
  private index = 0;
  private credited = 0;

  /** @param windowSeconds one window's length, or null where the contract authors no window. */
  constructor(private readonly windowSeconds: number | null) {}

  /** One fixed step of the consumer's own run clock. Rolls the credit over on the way past. */
  advance(delta: number): void {
    this.elapsedSeconds += delta;
    this.sync();
  }

  /**
   * Ask this window for its credit. True (and spends it) while the window still holds one, or
   * always true where no window is authored. Callers count a refusal on their own dial, because
   * what a refused credit is CALLED differs per consumer (a held pan, a held entry).
   */
  claim(): boolean {
    this.sync();
    if (this.windowSeconds !== null && this.credited >= 1) return false;
    this.credited += 1;
    return true;
  }

  /** Which window the run clock stands in, zero-based; always 0 while no window is authored. */
  get window(): number {
    return this.index;
  }

  /** Credits spent inside THIS window. At most one while a window is authored. */
  get creditedThisWindow(): number {
    return this.credited;
  }

  private sync(): void {
    const seconds = this.windowSeconds;
    const next = seconds === null ? 0 : Math.floor(this.elapsedSeconds / seconds);
    if (next === this.index) return;
    this.index = next;
    this.credited = 0;
  }
}
