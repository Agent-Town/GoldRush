import { Balance } from '../game/Balance';
import type { ContractEnemyVariant, ContractManifest } from '../meta/ContractFamilies';
import type { PlaybookEntry } from '../playbook/PlaybookFormat';
import type { SpawnPackOptions } from './WaveSystem';

/**
 * A3 — THE BROADCAST MIRROR (`specs/agent-play/door-completion-sheet.md:12`, RATIFIED
 * 2026-08-20). "Every playbook the player/agent USES this run is recorded; the NEXT wave fields
 * one corrupted copy per use — a mirrored enemy squad (data_rustler variant, tinted) whose
 * composition echoes the playbook's own shape. No playbook use → no mirrors. DEFAULTS: cap 3
 * mirrored squads/wave; mirrors carry +10% hp per repeat of the SAME playbook (habit punished,
 * variety rewarded — the declared lesson)."
 *
 * WHAT IT SOCKETS, AND NOTHING MORE. `e7-echo-canyon` declares exactly three things this file is
 * allowed to read: `twist.broadcastMirror {description, delay:"next-wave"}`, the map-wide
 * `tileParams.broadcastMirrorZones` field, and the teaching intent. There is no `secureWave`
 * clause and no objective latch in its data, so THE MIRROR IS PRESSURE, NOT AN OBJECTIVE — this
 * consumer never touches `autoSecureWaveForRun` in either engine. Inventing a latch the contract
 * does not declare would be Mistake #14 in its purest form.
 *
 * WHY IT IS A SYSTEM AND NOT A `src/sim/` SOCKET. Same measurement A4 recorded
 * (`SignalSuppression.ts:8`): the era-socket pattern exists to COMPOSE browser systems into the
 * headless engine, and there is nothing here to compose — the mechanic is one recorder plus one
 * spawn rule, and both engines run the same `WaveSystem`. So the shape is the shared-module one:
 * ONE class, constructed identically off the contract by `Game.ts` and `HeadlessContractSim.ts`,
 * seated into the same `WaveSystem` constructor slot by both, with the private ctor + `create()`
 * gate + refusal counters + presentation-stripped snapshot the socket pattern asks for.
 *
 * ⚠️ F-A8-7 (`SeedCaravanSystem.ts:137`): a consumer both engines construct must not import render
 * code. `MechanicsManifest` reaches this class, and `MechanicsManifest` is reached by every spec —
 * so one convenience import of `../world/Terrain` (or of `./WaveSystem` as a VALUE, which imports
 * Terrain itself) would make the whole Playwright suite uncollectable. Both imports above are
 * `import type` and therefore erased; `Balance` is render-free (it declares its own spawn edges
 * rather than importing `WaveSystem`, `Balance.ts:3`), checked 2026-08-20.
 *
 * WHERE THE RECORD COMES FROM, HONESTLY. The browser has playbooks and this class is fed by the
 * one funnel every replay entry point passes through (`Game.startPlaybookReplay`). The headless
 * engine has NO playbook verb — `src/agent/StandingOrders.ts` declares none, the same measurement
 * A4 recorded and re-verified here 2026-08-20 — so GR-SIM records nothing, fields nothing, and
 * says so through the same diagnostics rather than pretending. That is not a gap in this consumer:
 * "no playbook use → no mirrors" is the ratified rule, and a rider with no playbook verb is a
 * rider that never used one. The seam is seated in BOTH engines' `WaveSystem`, so the day a
 * playbook verb reaches the door the mirrors field there with no further edit.
 */

/** The sheet's ratified default: at most three mirrored squads field on any one wave. */
export const BROADCAST_MIRROR_SQUAD_CAP = 3;
/** The sheet's ratified default: +10% hp per REPEAT of the same playbook. Variety is the cure. */
export const BROADCAST_MIRROR_HP_PER_REPEAT = 0.1;
/** A corrupted copy is a squad, never a single body: the shape sets the size inside these bounds. */
export const BROADCAST_MIRROR_MIN_SQUAD = 2;
export const BROADCAST_MIRROR_MAX_SQUAD = 4;
/** One extra body per this many action-bearing ticks on the tape. */
export const BROADCAST_MIRROR_TICKS_PER_BODY = 4;
/** A tape that spends at least this share of its change-points moving reads as a ROVING habit. */
export const BROADCAST_MIRROR_ROVING_SHARE = 0.5;
/** What a roving habit returns as: a copy that moves like the tape did. */
export const BROADCAST_MIRROR_ROVING_SPEED_MULT = 1.15;
/**
 * What a VOLLEY habit returns as. The sheet's own example — "a turret-volley playbook returns as
 * a ranged squad" — is NOT expressible in this vocabulary and is deliberately not stretched into
 * one (Mistake #14): no enemy in this engine carries a projectile, `SpawnPackOptions` has no
 * ranged field, and `boltDamageMult` is bolt damage TAKEN (`CombatSystem.ts:891`), not dealt.
 * The nearest thing the contract's vocabulary CAN say is the hunt: a habit of striking at range
 * returns as a copy that comes for the rider from farther out. Named for what it is.
 */
export const BROADCAST_MIRROR_HUNT_RANGE = 18;

/** Identity of the corrupted copy — a `data_rustler` VARIANT, so a rider can see it in the view. */
export const BROADCAST_MIRROR_VARIANT_ID = 'data_rustler_mirror';
/** The roster entry a mirror is a copy OF. Declared by the contract; never invented here. */
export const BROADCAST_MIRROR_SOURCE_VARIANT_ID = 'data_rustler';
/** Presentation only: the echo reads off-register, a cold copy of the rustler's warm ochre. */
export const BROADCAST_MIRROR_TINT = '#8f7bb8';
/** Presentation only. */
export const BROADCAST_MIRROR_LABEL = 'Mirrored Data-Rustler';

/**
 * THE SHAPE A TAPE RETURNS AS. Four facts, each read off the tape itself and each mapped to one
 * bounded knob the contract's own vocabulary already carries. Presentation-free: a rider can poll
 * this and plan against it without reading a colour or a name.
 */
export type MirrorShape = Readonly<{
  /** How many bodies field. Grows with how much the tape DID, bounded either side. */
  count: number;
  /** The tape placed works, so the copy answers works instead of gold. */
  wrecker: boolean;
  /**
   * The copy comes for the gold — the roster's own default, kept unless the tape built.
   *
   * THERE IS DELIBERATELY NO "the tape PANNED" facet. `data_rustler` is already declared
   * `thief: true` (`Balance.ts` e7Roster), so a pan-habit rule would produce a copy identical to
   * the default one and would state nothing a rider could plan against. A facet that cannot be
   * observed is not a mechanic, so it is left unbuilt rather than written for symmetry.
   */
  thief: boolean;
  /** The tape kept moving, so the copy runs. */
  roving: boolean;
  /** The tape struck at range, so the copy hunts the rider from farther out. */
  hunts: boolean;
  /** hp multiplier on the copy: the roster's own hp times +10% per repeat of THIS playbook. */
  hpScale: number;
  /** How many times this playbook had already been used when this mirror was recorded. */
  repeat: number;
}>;

/** One mirrored squad, in the exact currency `WaveSystem.spawnAt` already speaks. */
export type MirrorSquad = Readonly<{ count: number; options: SpawnPackOptions }>;

export type BroadcastMirrorDiagnostics = Readonly<{
  /** True when the active contract declares `twist.broadcastMirror` AND a copyable roster entry. */
  declared: boolean;
  /** The declared delay, verbatim from the contract. Only `next-wave` is honoured. */
  delay: string | null;
  /** How many playbook uses were recorded this run. */
  recordedUses: number;
  /** How many DISTINCT playbooks were used — the number variety actually rewards. */
  distinctPlaybooks: number;
  /** The heaviest repeat count of any one playbook this run. */
  maxRepeat: number;
  /** The squads waiting to field on the next wave, shape by shape. Empty means no shadow coming. */
  pending: readonly MirrorShape[];
  /** Lifetime counters: what actually fielded, so a claim can be checked against the run. */
  squadsFielded: number;
  bodiesFielded: number;
  lastFieldedWave: number | null;
  /** The ratified constants, restated so a rider never has to guess them. */
  capPerWave: number;
  hpPerRepeat: number;
  /** Refusals, in the socket house style: mirrors this run dropped by the per-wave cap. */
  refusals: Readonly<{ cappedSquads: number }>;
}>;

/** What `noteUse` needs: a stable identity for the tape plus the tape's own change-points. */
export type MirrorPlaybookUse = Readonly<{
  /** Stable per-tape identity — the canonical playbook hash, so a rename is not a new habit. */
  id: string;
  entries: readonly PlaybookEntry[];
}>;

type PendingMirror = { id: string; shape: MirrorShape };

/**
 * The balanced roster table for the epoch that declares this twist. `twist.broadcastMirror` is
 * declared by exactly ONE contract in the ten bundles (`e7-echo-canyon`, measured 2026-08-20 by
 * grep over `assets/contracts/`), so the Signal table is the right table. A roster id this table
 * does not carry contributes NO stats — the contract's own entry stands alone rather than
 * borrowing another era's numbers.
 */
function balancedVariant(id: string): Partial<ContractEnemyVariant> | undefined {
  return (Balance.e7Roster.variants as Record<string, Partial<ContractEnemyVariant>>)[id];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * A playbook records SIM TRUTH (`PlaybookFormat.ts:4`): per-tick movement plus semantic actions.
 * Everything below reads that and only that — no coordinates, no names, no wall-clock.
 */
function shapeOfTape(entries: readonly PlaybookEntry[], repeat: number, baseHpScale: number): MirrorShape {
  let acting = 0;
  let moving = 0;
  let builds = false;
  let volleys = false;
  for (const entry of entries) {
    if (entry.mx !== 0 || entry.my !== 0) moving += 1;
    if (entry.a.length === 0) continue;
    acting += 1;
    for (const action of entry.a) {
      if ('kind' in action && action.kind === 'agent_orders') {
        for (const order of action.orders) {
          if (order.verb === 'BUILD') {
            builds = true;
            if (order.what === 'turret') volleys = true;
          }
          if (order.verb === 'BLAST_AT') volleys = true;
          if (order.verb === 'SET_WEAPON' && order.weapon === 'blast') volleys = true;
        }
        continue;
      }
      if (!('type' in action)) continue;
      if (action.type === 'place_build') {
        builds = true;
        if (action.id === 'turret') volleys = true;
      }
      if (action.type === 'weapon_toggle') volleys = true;
      if (action.type === 'agent_orders') {
        for (const order of action.orders) {
          if (order.verb === 'BUILD') {
            builds = true;
            if (order.what === 'turret') volleys = true;
          }
          if (order.verb === 'BLAST_AT') volleys = true;
          if (order.verb === 'SET_WEAPON' && order.weapon === 'blast') volleys = true;
        }
      }
    }
  }
  const roving = entries.length > 0 && moving / entries.length >= BROADCAST_MIRROR_ROVING_SHARE;
  return {
    count: clamp(
      BROADCAST_MIRROR_MIN_SQUAD + Math.floor(acting / BROADCAST_MIRROR_TICKS_PER_BODY),
      BROADCAST_MIRROR_MIN_SQUAD,
      BROADCAST_MIRROR_MAX_SQUAD,
    ),
    // A tape that built works comes back as something that unbuilds them; the roster's own thief
    // flag stands otherwise. A body is one or the other, never both — `Enemy` resolves thief
    // before wrecker, so saying both would silently mean thief and the manifest would lie.
    wrecker: builds,
    thief: !builds,
    roving,
    hunts: volleys,
    hpScale: baseHpScale * (1 + BROADCAST_MIRROR_HP_PER_REPEAT * repeat),
    repeat,
  };
}

export class BroadcastMirror {
  private readonly pending: PendingMirror[] = [];
  private readonly uses = new Map<string, number>();
  private recordedUses = 0;
  private squadsFielded = 0;
  private bodiesFielded = 0;
  private lastFieldedWave: number | null = null;
  private cappedSquads = 0;

  private constructor(
    private readonly declared: boolean,
    private readonly delay: string | null,
    private readonly source: Partial<ContractEnemyVariant>,
  ) {}

  /**
   * Mirrors the browser gate and the headless gate with ONE read: the active contract's own twist
   * plus its own roster. Deliberately NOT epoch-gated and NOT id-gated — the declaration is the
   * gate, exactly as `SignalSuppression.create` is, so a second contract that declares the same
   * twist gets the same mechanic for free and no other contract can ever grow one.
   *
   * THREE WAYS TO REFUSE, all reject-don't-stretch:
   *  · no `twist.broadcastMirror`            -> nothing declared, nothing to mirror;
   *  · a `delay` this consumer cannot honour -> the contract asked for a mechanic that does not
   *    exist here (only `next-wave` is built), so it gets NOTHING rather than a near-miss;
   *  · no `data_rustler` roster entry        -> the sheet's copy is a data_rustler VARIANT; a
   *    contract with no such entry has nothing to be a corrupted copy OF.
   */
  static create(contract: Pick<ContractManifest, 'twist'>): BroadcastMirror {
    const declared = contract.twist.broadcastMirror;
    if (!declared) return BroadcastMirror.none();
    // Read defensively: the field arrives from contract JSON, so the runtime check is the check,
    // not the TypeScript literal type (the same care `SignalSuppression.create` takes).
    const delay = ((declared as { delay?: unknown }).delay ?? null) as string | null;
    if (delay !== 'next-wave') return BroadcastMirror.none();
    const roster = contract.twist.enemyRoster ?? [];
    const entry = roster.find(({ id }) => id === BROADCAST_MIRROR_SOURCE_VARIANT_ID);
    if (!entry) return BroadcastMirror.none();
    const balanced = balancedVariant(entry.id);
    return new BroadcastMirror(true, delay, {
      hpScale: entry.hpScale ?? balanced?.hpScale,
      speedMult: entry.speedMult ?? balanced?.speedMult,
      visualScale: entry.visualScale ?? balanced?.visualScale,
      contactDamageScale: entry.contactDamageScale ?? balanced?.contactDamageScale,
      buildingDamageScale: entry.buildingDamageScale ?? balanced?.buildingDamageScale,
      supportBuildingDamageScale: entry.supportBuildingDamageScale ?? balanced?.supportBuildingDamageScale,
    });
  }

  /** The undeclared case, reified so every caller holds a consumer rather than a null. */
  static none(): BroadcastMirror {
    return new BroadcastMirror(false, null, {});
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  /**
   * THE RECORD HALF. Call it exactly once per SUCCESSFUL playbook use, so the counters are the
   * run's real total. Returns whether a mirror was queued — false everywhere the twist is absent,
   * which is every contract but the canyon.
   */
  noteUse(use: MirrorPlaybookUse): boolean {
    if (!this.declared) return false;
    const repeat = this.uses.get(use.id) ?? 0;
    this.uses.set(use.id, repeat + 1);
    this.recordedUses += 1;
    this.pending.push({ id: use.id, shape: shapeOfTape(use.entries, repeat, this.source.hpScale ?? 1) });
    return true;
  }

  /**
   * THE MIRROR HALF, called by `WaveSystem` once at the start of each new wave in BOTH engines.
   * Draining is the point: a use fields exactly once, on the next wave, and never again — which
   * is what `delay: "next-wave"` says. Uses beyond the ratified cap of three are DROPPED and
   * counted as refusals rather than carried, so a habit can never bank an unbounded shadow.
   */
  fieldMirrors(wave: number): readonly MirrorSquad[] {
    if (!this.declared || this.pending.length === 0) return [];
    // Defensive: a double call for one wave must not field the same shadow twice.
    if (this.lastFieldedWave === wave) return [];
    const fielding = this.pending.splice(0, BROADCAST_MIRROR_SQUAD_CAP);
    this.cappedSquads += this.pending.length;
    this.pending.length = 0;
    this.lastFieldedWave = wave;
    this.squadsFielded += fielding.length;
    this.bodiesFielded += fielding.reduce((total, { shape }) => total + shape.count, 0);
    return fielding.map(({ shape }) => ({ count: shape.count, options: this.optionsFor(shape) }));
  }

  /** Run restart: the shadow belongs to the run that cast it. */
  reset(): void {
    this.pending.length = 0;
    this.uses.clear();
    this.recordedUses = 0;
    this.squadsFielded = 0;
    this.bodiesFielded = 0;
    this.lastFieldedWave = null;
    this.cappedSquads = 0;
  }

  get diagnostics(): BroadcastMirrorDiagnostics {
    return {
      declared: this.declared,
      delay: this.delay,
      recordedUses: this.recordedUses,
      distinctPlaybooks: this.uses.size,
      maxRepeat: [...this.uses.values()].reduce((most, count) => Math.max(most, count - 1), 0),
      pending: this.pending.map(({ shape }) => shape),
      squadsFielded: this.squadsFielded,
      bodiesFielded: this.bodiesFielded,
      lastFieldedWave: this.lastFieldedWave,
      capPerWave: BROADCAST_MIRROR_SQUAD_CAP,
      hpPerRepeat: BROADCAST_MIRROR_HP_PER_REPEAT,
      refusals: { cappedSquads: this.cappedSquads },
    };
  }

  /**
   * The copy itself, in `WaveSystem`'s own currency. Everything not named here is deliberately
   * left to the wave: hp still scales per wave, speed still scales per wave, and the alive cap
   * still refuses — a mirror is ordinary pressure that arrived for a reason, not a special enemy.
   */
  private optionsFor(shape: MirrorShape): SpawnPackOptions {
    return {
      variantId: BROADCAST_MIRROR_VARIANT_ID,
      variantLabel: BROADCAST_MIRROR_LABEL,
      tint: BROADCAST_MIRROR_TINT,
      hpScale: shape.hpScale,
      speedMult: (this.source.speedMult ?? 1) * (shape.roving ? BROADCAST_MIRROR_ROVING_SPEED_MULT : 1),
      visualScale: this.source.visualScale,
      contactDamageScale: this.source.contactDamageScale,
      buildingDamageScale: this.source.buildingDamageScale,
      supportBuildingDamageScale: this.source.supportBuildingDamageScale,
      thief: shape.thief,
      wrecker: shape.wrecker,
      ...(shape.hunts ? { heroPursuitRange: BROADCAST_MIRROR_HUNT_RANGE } : {}),
    };
  }
}
