import type { ContractManifest } from '../meta/ContractFamilies';
import type { SquallDiagnostics } from './E10SquallScheduler';
import { PICNIC_STAKE_PRESS_WEIGHT } from './PicnicHoldSystem';

/**
 * E10S-3 — THE VENT: WARMTH, STOKE, LOSS, AND THE LATCH THAT ANSWERS THE SQUALL
 * (`specs/agent-play/e10-ember-shore-preserve.md` §2 laws, §3 "The vent" and "Secure", §4 E10S-3).
 *
 * The Ember Shore's turn is "you are not here to take, you are here to keep something alight".
 * E10S-2 landed the CLOCK (`E10SquallScheduler`) and deliberately nothing else: the squall blew,
 * the browser desaturated, and the map's outcome did not move. THIS file is the CONSUMER that
 * makes the clock cost something — the `last-warm-vent` stake as structure-state with a WARMTH
 * meter, a STOKE verb that spends gold to answer the decay, the honest LOSS terminal when the
 * meter reaches zero, and the secure latch keyed on the preserve sub-field per F-1471-1.
 *
 * IT IS THE FOURTH FILE IN A HOUSE SHAPE, NOT A NEW ONE. Private ctor + `create()` off the
 * CONTRACT (never the epoch), refuse-to-arm when the declaration is not whole, `update()` on the
 * caller's fixed step, `objectiveAllowsSecure` in the canyon-connect shape, presentation-stripped
 * diagnostics, and zero render imports. `InterferenceFrontSystem`, `E8SuitAirSystem` and
 * `E10SquallScheduler` are the three that came before it and every one of those properties is
 * theirs. The render-free import list is a LAW here rather than a preference (F-A8-7, transcribed
 * from `InterferenceFrontSystem.ts:17`): a module both engines construct that drags `three` or the
 * DOM into the headless collection graph made the WHOLE suite uncollectable once. The two imports
 * above are a TYPE and one ratified constant.
 *
 * WHAT IT DOES NOT DO, AND WHY EACH REFUSAL IS DELIBERATE:
 *   · IT DOES NOT WRITE GOLD. Economy is the sole gold writer (`CLAUDE.md` §4.4), so `tryStoke`
 *     takes a `spend` callback and the two engines hand it their own `Economy.apply`. A consumer
 *     that debited a purse would be a second writer on that surface.
 *   · IT DOES NOT KEEP ITS OWN CLOCK. The squall is `E10SquallScheduler`'s and stays there; this
 *     class is handed that scheduler's published diagnostics each step. Two clocks for one weather
 *     front is exactly how two engines start disagreeing about whether a run was lost.
 *   · IT DOES NOT DAMAGE OR HEAL ANYTHING. Spec §3 is explicit: "The vent is not damageable by
 *     enemies — the SQUALL is the antagonist; enemies are the thing that keeps you too busy to
 *     stoke." No `BuildingTarget` is registered for the vent and no damage seam touches it, which
 *     is what distinguishes it from `twist.preserve`'s warm vent on `e10-last-claim` (a real
 *     structure with hp that outlaws can fell). Two warm vents, two mechanics, no shared code.
 *   · IT AUTHORS NO ANCHORS, NO SEEDS AND NO ADMISSION. Those are E10S-4's, and a consumer that
 *     reached for them would be shipping the door this slice is only the room behind.
 *
 * THE DOUBLED MOTE PRESSURE, APPLIED HERE AND NOWHERE ELSE. E10S-2 published
 * `motePressureMultiplier` and did not apply it, in as many words, so that this slice could wire
 * one already-derived number instead of picking a second one. It is applied through the ONE
 * pressure seam both engines already own — the per-enemy target function `EnemyPool.update` takes,
 * which `PicnicHoldSystem.pressureTarget` is the house model for — by DOUBLING the share of
 * outlaws that walk at the vent while the squall blows. The base share is the Picnic's own
 * ratified `PICNIC_STAKE_PRESS_WEIGHT` (0.25), imported rather than retyped so the "no new balance
 * number" rule (F-1741) is checkable rather than claimed, and the doubling is the contract's
 * `twist.emberShore.squall.motePressure.squallMultiplier`. One quarter of the field presses the
 * vent in the calm; one half presses it in the squall — which is the spec's sentence about being
 * "too busy to stoke" turned into arithmetic. Contact damage is NOT suppressed for a pressing
 * outlaw (the Picnic suppresses it; this map must not, or its squall would make the shore SAFER).
 */

/** RATIFIABLE BY SILENCE — spec §3, "WARMTH meter 100". Fallback only; the contract's value wins. */
export const PRESERVE_INITIAL_WARMTH = 100;

/** RATIFIABLE BY SILENCE — spec §3, "decays only during squalls (−4/s default)"; §6 point 2. */
export const PRESERVE_SQUALL_DECAY_PER_SECOND = 4;

/** RATIFIABLE BY SILENCE — spec §3, "spends 15 gold to restore +40 warmth"; §6 point 2. */
export const PRESERVE_STOKE_GOLD_COST = 15;
export const PRESERVE_STOKE_WARMTH_RESTORE = 40;

/** RATIFIABLE BY SILENCE — spec §3, "a STOKE context action inside the vent disc (radius 4)". */
export const PRESERVE_STOKE_RADIUS = 4;

/** RATIFIABLE BY SILENCE — spec §3 Secure, "at least one full squall survived". */
export const PRESERVE_SQUALLS_REQUIRED = 1;

/**
 * INHERITED, NEVER INVENTED (F-1741, "no balance buffs to force greens"). The share of the field
 * that presses a stake is the Picnic's ratified weight, imported from the system that owns it so a
 * retune there moves both maps and a reader can see there is no second number. The squall doubles
 * THIS, using the multiplier the contract already declares.
 */
export const PRESERVE_MOTE_PRESS_WEIGHT = PICNIC_STAKE_PRESS_WEIGHT;

/** The gold sink this consumer spends through, named once so both engines say the same string. */
export const PRESERVE_STOKE_SINK = 'stoke_last_warm_vent' as const;

/** Every way a stoke can be refused, counted rather than swallowed. */
export type PreserveStokeRefusal =
  | 'undeclared'
  | 'guttered'
  | 'out-of-reach'
  | 'insufficient-gold'
  | 'already-warm';

export type PreserveStokeResult =
  | Readonly<{ ok: true; warmth: number; cost: number }>
  | Readonly<{ ok: false; reason: PreserveStokeRefusal; message: string }>;

export type E10PreserveDiagnostics = Readonly<{
  /** True only where the contract declares `twist.emberShore.preserve` against a real stake. */
  declared: boolean;
  stakeId: string | null;
  position: Readonly<{ x: number; z: number }> | null;
  warmth: number;
  maxWarmth: number;
  /** The one boolean the latch and the loss terminal both read. */
  alight: boolean;
  /** Latched: the vent reached zero and the run is over. */
  guttered: boolean;
  gutteredAtSeconds: number | null;
  decayPerSecond: number;
  /** True only while a squall is blowing AND the vent still has warmth to lose. */
  decaying: boolean;
  warmthLost: number;
  warmthRestored: number;
  stoke: Readonly<{
    action: 'STOKE';
    goldCost: number;
    warmthRestore: number;
    radius: number;
    uses: number;
    refusals: Readonly<Record<PreserveStokeRefusal, number>>;
    lastRefusal: PreserveStokeRefusal | null;
  }>;
  squallsSurvived: number;
  squallsRequired: number;
  /** The E10S-2 number, now APPLIED. `active` is true only while the squall blows. */
  motePressure: Readonly<{
    multiplier: number;
    active: boolean;
    /** The share of the field walking at the vent RIGHT NOW, base 0.25, doubled in a squall. */
    pressShare: number;
  }>;
  /** The secure latch, in the canyon-connect shape. */
  objectiveMet: boolean;
}>;

type PreserveConfig = Readonly<{
  stakeId: string;
  position: Readonly<{ x: number; z: number }>;
  initialWarmth: number;
  decayPerSecond: number;
  goldCost: number;
  warmthRestore: number;
  radius: number;
  squallsRequired: number;
}>;

const NO_REFUSALS: Readonly<Record<PreserveStokeRefusal, number>> = Object.freeze({
  undeclared: 0,
  guttered: 0,
  'out-of-reach': 0,
  'insufficient-gold': 0,
  'already-warm': 0,
});

export class E10PreserveSystem {
  private warmth: number;
  private guttered = false;
  private gutteredAt: number | null = null;
  private elapsed = 0;
  private blowing = false;
  private moteMultiplier = 1;
  private squallsSurvived = 0;
  private warmthLost = 0;
  private warmthRestored = 0;
  private stokes = 0;
  private lastRefusal: PreserveStokeRefusal | null = null;
  private readonly refusals: Record<PreserveStokeRefusal, number> = { ...NO_REFUSALS };

  private constructor(
    private readonly declared: boolean,
    private readonly config: PreserveConfig | null,
  ) {
    this.warmth = config?.initialWarmth ?? 0;
  }

  /**
   * ONE read of the CONTRACT, performed identically by both engines.
   *
   * REFUSE-TO-ARM is F-1471-1's own discipline and the reason this reads the STAKE as well as the
   * block: `twist.emberShore.preserve.stakeId` names a marker in `tileParams.stakeMarkers`, and a
   * preserve consumer armed against a stake that is not on the map would publish a warmth meter
   * for a place a player can never stand in — a mechanic declared and not consumable, which is the
   * exact shape of the casualty F-1471-1 is named for. A contract that omits the block, names no
   * stake, or names one the tile does not carry holds an INERT consumer that answers "true" to the
   * secure latch, publishes nothing, and can never gutter.
   *
   * Numbers are read where authored and fall back to the ratified defaults above where omitted —
   * the spec's numbers are the contract's meaning whether or not the JSON repeats them — but a
   * number that is PRESENT and unusable (zero, negative, non-finite) refuses the whole arm rather
   * than being silently corrected, for the same reason the scheduler refuses a zero-length phase.
   */
  static create(contract: Pick<ContractManifest, 'twist' | 'tileParams'>): E10PreserveSystem {
    const preserve = preserveBlock(contract);
    if (!preserve) return E10PreserveSystem.none();
    const stakeId = typeof preserve.stakeId === 'string' && preserve.stakeId.length > 0 ? preserve.stakeId : null;
    const marker = stakeId === null
      ? undefined
      : contract.tileParams.stakeMarkers?.find((entry) => entry.id === stakeId);
    if (stakeId === null || !marker || !Number.isFinite(marker.x) || !Number.isFinite(marker.z)) {
      return E10PreserveSystem.none();
    }
    const stoke = record(preserve.stoke) ?? {};
    const requires = record(preserve.secureRequires) ?? {};
    return new E10PreserveSystem(true, {
      stakeId,
      position: { x: marker.x, z: marker.z },
      initialWarmth: positive(preserve.initialWarmth, PRESERVE_INITIAL_WARMTH),
      decayPerSecond: positive(preserve.squallDecayPerSecond, PRESERVE_SQUALL_DECAY_PER_SECOND),
      goldCost: positive(stoke.goldCost, PRESERVE_STOKE_GOLD_COST),
      warmthRestore: positive(stoke.warmthRestore, PRESERVE_STOKE_WARMTH_RESTORE),
      radius: positive(stoke.radius, PRESERVE_STOKE_RADIUS),
      // `ventAlight` is not a tunable: the spec's latch is "vent alight AND one full squall", and
      // a contract that authored `ventAlight: false` would be asking for a preserve contract with
      // nothing to preserve. The count IS tunable, and 0 is a legal value there (a map that wants
      // the alight half alone), which is why it goes through `nonNegative` and not `positive`.
      squallsRequired: nonNegative(requires.fullSquallsSurvived, PRESERVE_SQUALLS_REQUIRED),
    });
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): E10PreserveSystem {
    return new E10PreserveSystem(false, null);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /** The vent still burns. False the instant it gutters, and on every undeclared contract. */
  get alight(): boolean {
    return this.declared && this.warmth > 0;
  }

  /** The LOSS terminal, read once per tick by each engine's run-over check. */
  get hasGuttered(): boolean {
    return this.guttered;
  }

  get stokeCost(): number {
    return this.config?.goldCost ?? PRESERVE_STOKE_GOLD_COST;
  }

  /**
   * THE LATCH, in the canyon-connect shape every other era consumer uses, keyed on the preserve
   * SUB-FIELD exactly as A5's latch keys on `interferenceFront`'s sub-fields (F-1471-1). Spec §3
   * Secure: "the objective latch = vent alight (warmth > 0) at the secure check AND at least one
   * full squall survived". True on every contract that declares no preserve, so no admitted
   * contract's terminal moves.
   */
  get objectiveAllowsSecure(): boolean {
    if (!this.declared) return true;
    return this.alight && this.squallsSurvived >= (this.config?.squallsRequired ?? PRESERVE_SQUALLS_REQUIRED);
  }

  /**
   * ONE fixed step, advanced from the squall's OWN published diagnostics rather than a second
   * clock. Both engines call this immediately after `E10SquallScheduler.update` and before the
   * enemy integration step, so the warmth lost on tick N and the pressure applied on tick N belong
   * to the same phase reading — which is what makes the two engines comparable rather than close.
   *
   * DECAY IS SQUALL-ONLY (spec §3), and that is the whole shape of the map: the calm is when you
   * pan and build, the squall is when the thing you came to keep starts dying. Nothing here rounds
   * the stored warmth: the value carries the engines' own accumulated float so the two agree bit
   * for bit, and only `diagnostics` rounds, exactly as the scheduler does with its seconds.
   */
  update(seconds: number, squall: SquallDiagnostics): void {
    if (!this.declared || this.guttered || !(seconds > 0)) return;
    this.elapsed += seconds;
    this.blowing = squall.declared && squall.blowing;
    this.moteMultiplier = usableMultiplier(squall.motePressureMultiplier);
    if (this.blowing && this.warmth > 0) {
      const before = this.warmth;
      this.warmth = Math.max(0, this.warmth - (this.config?.decayPerSecond ?? PRESERVE_SQUALL_DECAY_PER_SECOND) * seconds);
      this.warmthLost += before - this.warmth;
      if (this.warmth <= 0) {
        this.warmth = 0;
        this.guttered = true;
        this.gutteredAt = round(this.elapsed);
        return;
      }
    }
    // Credited only while the vent still burns: a squall the vent did not live through is not a
    // squall it survived. The scheduler counts a squall COMPLETED when it ends, so this reads its
    // count rather than keeping a second one.
    this.squallsSurvived = squall.declared ? squall.squallsCompleted : 0;
  }

  /**
   * THE STOKE, spending the run's own earned gold through the caller's Economy (F-1741: the prover
   * funds stoking with earned gold; nothing is minted here). Refusals are COUNTED rather than
   * swallowed so a rider that keeps stoking out of reach can see why nothing happened, and so the
   * guard can prove each refusal exists.
   *
   * `spend` returns whether the purse actually paid; a false answer is `insufficient-gold` and
   * costs the vent nothing. The order is deliberate — reach and warmth are checked BEFORE the
   * purse is touched, so a refused stoke never debits.
   */
  tryStoke(position: Readonly<{ x: number; z: number }>, spend: (amount: number) => boolean): PreserveStokeResult {
    if (!this.declared || !this.config) return this.refuse('undeclared', 'This claim has no vent to stoke.');
    if (this.guttered) return this.refuse('guttered', 'The last warm vent has gone out.');
    if (!this.inReach(position)) {
      return this.refuse('out-of-reach', `OUT_OF_REACH: stand within ${this.config.radius} of the ${this.config.stakeId}.`);
    }
    if (this.warmth >= this.config.initialWarmth) {
      return this.refuse('already-warm', 'The vent is already burning as hot as it will hold.');
    }
    if (!spend(this.config.goldCost)) {
      return this.refuse('insufficient-gold', `INSUFFICIENT_GOLD: a stoke costs ${this.config.goldCost} gold.`);
    }
    const before = this.warmth;
    this.warmth = Math.min(this.config.initialWarmth, this.warmth + this.config.warmthRestore);
    this.warmthRestored += this.warmth - before;
    this.stokes += 1;
    return { ok: true, warmth: round(this.warmth), cost: this.config.goldCost };
  }

  /** The stoke disc, published so the browser prompt and a rider ask the same question. */
  inReach(position: Readonly<{ x: number; z: number }>): boolean {
    if (!this.declared || !this.config) return false;
    return Math.hypot(position.x - this.config.position.x, position.z - this.config.position.z) <= this.config.radius;
  }

  /**
   * THE DOUBLED MOTE PRESSURE, APPLIED. `PicnicHoldSystem.pressureTarget`'s rule, verbatim in
   * shape: a deterministic share of the field selected by `enemy.id`, so the same run steers the
   * same outlaws in both engines and nothing here consults a random number. The share is the
   * Picnic's ratified quarter in the calm and the contract's multiplier times that in the squall.
   *
   * A guttered vent presses nobody — the run is over and steering a corpse's killers at a cold
   * vent would put a dead map's outlaws somewhere the two engines could disagree about.
   */
  pressureTarget(enemy: Readonly<{ id: number }>): Readonly<{ x: number; z: number }> | null {
    if (!this.declared || !this.config || this.guttered) return null;
    const divisor = Math.max(1, Math.round(1 / this.pressShare));
    return enemy.id % divisor === 0 ? { ...this.config.position } : null;
  }

  /** Base share in the calm, doubled while the squall blows. Never above 1. */
  private get pressShare(): number {
    return Math.min(1, PRESERVE_MOTE_PRESS_WEIGHT * (this.blowing ? this.moteMultiplier : 1));
  }

  /** Restores the run-start state; mirrors every other system's reset(). */
  reset(): void {
    this.warmth = this.config?.initialWarmth ?? 0;
    this.guttered = false;
    this.gutteredAt = null;
    this.elapsed = 0;
    this.blowing = false;
    this.moteMultiplier = 1;
    this.squallsSurvived = 0;
    this.warmthLost = 0;
    this.warmthRestored = 0;
    this.stokes = 0;
    this.lastRefusal = null;
    Object.assign(this.refusals, NO_REFUSALS);
  }

  get diagnostics(): E10PreserveDiagnostics {
    const config = this.config;
    return {
      declared: this.declared,
      stakeId: config?.stakeId ?? null,
      position: config ? { ...config.position } : null,
      warmth: round(this.warmth),
      maxWarmth: config?.initialWarmth ?? 0,
      alight: this.alight,
      guttered: this.guttered,
      gutteredAtSeconds: this.gutteredAt,
      decayPerSecond: config?.decayPerSecond ?? 0,
      decaying: this.declared && this.blowing && this.warmth > 0,
      warmthLost: round(this.warmthLost),
      warmthRestored: round(this.warmthRestored),
      stoke: {
        action: 'STOKE',
        goldCost: config?.goldCost ?? 0,
        warmthRestore: config?.warmthRestore ?? 0,
        radius: config?.radius ?? 0,
        uses: this.stokes,
        refusals: { ...this.refusals },
        lastRefusal: this.lastRefusal,
      },
      squallsSurvived: this.squallsSurvived,
      squallsRequired: config?.squallsRequired ?? 0,
      motePressure: {
        multiplier: this.moteMultiplier,
        // A guttered vent presses nobody, so the row must not claim it does — `pressureTarget`
        // returns null there and these two numbers say the same thing.
        active: this.declared && this.blowing && !this.guttered,
        pressShare: this.declared && !this.guttered ? this.pressShare : 0,
      },
      objectiveMet: this.declared && this.objectiveAllowsSecure,
    };
  }

  private refuse(reason: PreserveStokeRefusal, message: string): PreserveStokeResult {
    this.refusals[reason] += 1;
    this.lastRefusal = reason;
    return { ok: false, reason, message };
  }
}

/**
 * THE AUTHORED BLOCK, read through `unknown` rather than a cast, for `E10SquallScheduler`'s own
 * stated reason: `twist.emberShore` is declared in `AUTHORED_TWIST_KEYS` and `DECLARED_INERT_PATHS`
 * but carries no field in the `twist` TYPE, so `contract.twist.emberShore` does not type-check and
 * inventing an interface here would claim a contract shape the validator does not enforce.
 */
function preserveBlock(contract: Pick<ContractManifest, 'twist'>): Record<string, unknown> | null {
  const emberShore = record((contract.twist as unknown as Record<string, unknown>).emberShore);
  const preserve = emberShore ? record(emberShore.preserve) : null;
  if (!preserve) return null;
  const stoke = record(preserve.stoke) ?? {};
  for (const value of [preserve.initialWarmth, preserve.squallDecayPerSecond, stoke.goldCost, stoke.warmthRestore, stoke.radius]) {
    if (value !== undefined && !(typeof value === 'number' && Number.isFinite(value) && value > 0)) return null;
  }
  return preserve;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function positive(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function nonNegative(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function usableMultiplier(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1;
}

/** Keeps the view's numbers discrete instead of carrying float dust into a determinism hash. */
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
