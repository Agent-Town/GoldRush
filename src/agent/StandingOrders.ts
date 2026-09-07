import { Balance } from '../game/Balance';
import { isBuildableId, type BuildableId } from '../game/buildables';
import type { AgentAbility } from './AgentConsent';
import type { AgentPermissionLevel } from './PermissionLadder';
import type { AgentBuildingRef, AgentVec2, GoldRushToolSurface, ToolReceipt } from './ToolSurface';

export type BuildCondition = { goldGte: number } | { waveGte: number };

export type StandingOrder =
  | {
      verb: 'BUILD';
      what: BuildableId;
      where: AgentVec2;
      when: BuildCondition;
      rotationSteps?: 0 | 1 | 2 | 3;
    }
  | { verb: 'REPAIR_UNDER'; pct: number }
  // hero-move-verb (owner ruling 2026-09-06, verbatim: "yes! please! rider has to be able to move,
  // I did not know that was not possible before"). THE ONLY BODY-POSITIONING VERB IN THIS UNION,
  // and deliberately so since `rider-parity-grammar` stage 3 (ADR-005, owner 2026-09-07: "Humans
  // cannot control the positioning of the Prospector, just the rider"). `MOVE_TO`, `HOLD` and
  // `FALLBACK_IF` used to sit here and steered the PROSPECTOR (`src/agent/Embodiment.ts:131` fed
  // their target to `assignWork`) — a second freely-positioned body no human has. They are gone,
  // and an unknown verb refuses honestly at submission, which is the retirement ADR-004 wants.
  // Before hero-move-verb landed, nothing in this union reached the hero at all, which is why
  // `reviews/relay-valley-winnable.md` F-RVW-6 filed the asymmetry as structural and why the Ember
  // Shore prover's first ride died at 136 s with the vent kept
  // (`artifacts/e10s-4-door/prover.mjs:60-66`). A human kites; a rider could only build something
  // that shoots back.
  //
  // MOVE_HERO walks the hero to `pos` by the SAME path a human's keys take: each fixed step the
  // order publishes a steering target, the engine derives the unit `Intents.move` toward it, passes
  // it through the physics filter (`e8PhysicsIntents`) and hands it to `Hero.update`. No line of
  // `Hero.ts`'s movement math is touched, so a kited hero obeys terrain speed, slopes, walls,
  // depenetration and low-orbit drift exactly as a piloted one does.
  //
  // THERE IS NO `HOLD_HERO`, deliberately (Mistake #14, reject-don't-stretch), and stage 3's
  // removal of `HOLD` does not reopen the question — it closes it. `HOLD` existed for the
  // Prospector because an idle Prospector DRIFTS: `Embodiment.driftNearHero:287` walks it back
  // toward the hero every step it has no work, so "stay there" needed a verb that kept re-issuing
  // the point. That verb is gone with the rest of the positioning family, and drift is now the
  // WHOLE answer to where an unemployed Prospector stands — which is what a human gets. The hero
  // has no such drift: with no move intent `Hero.update` decelerates it to a stop and it stays
  // where it stopped, so "hold the hero here" is already MOVE_HERO plus silence. A HOLD_HERO would
  // add a verb whose only effect is to occupy the executor forever.
  | { verb: 'MOVE_HERO'; pos: AgentVec2 }
  | { verb: 'BLAST_AT'; pos: AgentVec2 }
  | { verb: 'SET_WEAPON'; weapon: 'rig' | 'blast' }
  | { verb: 'HARVEST'; seam: string }
  | { verb: 'HARVEST'; sluice: number }
  | { verb: 'PICK_UPGRADE'; id: string }
  | { verb: 'SECURE_CHOICE'; choice: 'bank' | 'rush' }
  | { verb: 'CONTEXT_ACTION'; action: 'upgrade' | 'demolish'; target: { id: BuildableId; index: number } }
  | { verb: 'CONTEXT_ACTION'; action: 'fund' }
  // A6: recover the crashed probe standing in a `probeRecoveryZones` crater. Targetless for
  // the same reason `fund` is — the WORLD names the target, so the body's position is the
  // whole argument and there is nothing for a rider to mis-index.
  | { verb: 'CONTEXT_ACTION'; action: 'recover' }
  // A8 (door-completion-sheet §A8): plant the seed vault at the ground the Prospector stands on.
  // A targetless context action like `fund`, for the same reason — the world, not a registry
  // index, decides which stake is in reach, and the view already names the grounds.
  | { verb: 'CONTEXT_ACTION'; action: 'plant' }
  // A10 (door-completion-sheet §A10): decide the canal segment the Prospector stands at.
  // `redig` is the sheet's RE-DIG and `backfill` is its DEMOLISH — renamed on the wire only,
  // because `demolish` above already means "tear down that work" and one word cannot mean two
  // things (Mistake #14). Targetless like `fund`/`recover`/`plant`, for the same reason: the
  // world names the stake, so the body's position is the whole argument.
  | { verb: 'CONTEXT_ACTION'; action: 'redig' }
  | { verb: 'CONTEXT_ACTION'; action: 'backfill' }
  // E10S-3 (`specs/agent-play/e10-ember-shore-preserve.md` §3 "The vent"): feed the last warm vent
  // the Prospector is standing at, spending the contract's authored gold cost for its authored
  // warmth. Targetless like `fund`/`recover`/`plant`/`redig` and for the same reason — the world
  // names the target, the body's position is the whole argument, and there is no index to
  // mis-quote. It is a CONTEXT_ACTION rather than its own verb because it carries no argument and
  // because both engines already route the whole family through one handler; `GRADE`/`HAUL` are
  // verbs only because the browser's `applyDeferredAction` destructures `order.target` for every
  // action it does not name, and `stoke` IS named there (`src/game/Game.ts`, the targetless list).
  | { verb: 'CONTEXT_ACTION'; action: 'stoke' }
  // ADR-005 stage 3 item 8 (owner 2026-09-07: "AI and human users have to have the same options and
  // tools"). THE LAST FOUR PLACES THE CONFIRM KEY WENT AND NO VERB DID. `Game.confirmAction` tries,
  // in this order, the drill yard's station, the assay office's bench, the E10 Static's kept
  // meanings and the Old Digger's deck — four world interactions a player reaches with the same
  // press that upgrades a work, and which a rider could not reach at all. They are actions of
  // CONTEXT_ACTION and targetless, like `fund`/`recover`/`plant`/`stoke`, for the same reason:
  // the WORLD names the target, so the acting body's position is the whole argument.
  //
  // Each is bound to the SAME call the confirm key makes and reaches from the acting body's own
  // position, so neither species can out-reach the other. Where an engine composes none of the
  // four consumers, they fail honestly ("unavailable in this engine") exactly as
  // `CAPTURE`/`GRADE`/`HAUL`/`PLAYBOOK_USE` do — today that is GR-SIM, which composes no drill
  // yard, no assay bench and neither E10 boss, and `now.contextPress` says so rather than
  // pretending. NO NEW MECHANIC IS ADDED for either species (ADR-005 amendment clause 5): every
  // one of these already existed on the human's key, and this is the rider's word for that key.
  | { verb: 'CONTEXT_ACTION'; action: 'drill' }
  | { verb: 'CONTEXT_ACTION'; action: 'assay' }
  | { verb: 'CONTEXT_ACTION'; action: 'preserve' }
  | { verb: 'CONTEXT_ACTION'; action: 'digger' }
  | { verb: 'CAPTURE' }
  | { verb: 'BOAT_BUILD'; padId: string; buildingId: string }
  | { verb: 'REANCHOR'; anchorId: string }
  // E4 Motor Frontier (`tasks/e4-roads-and-convoys.md`): two targetless verbs, the world naming the
  // target from the Prospector's ground exactly as `fund`/`recover`/`plant` do. `GRADE` grades the
  // ungraded corridor whose stake is within reach; `HAUL` drives the Hauler to where the Prospector
  // stands. They are VERBS rather than `CONTEXT_ACTION` actions because the browser's context-action
  // handler destructures `order.target` for every action it does not name (`src/game/Game.ts:3426`),
  // so a targetless action added to that union would break its type narrowing — and `Game.ts` is
  // outside this slice's firewall. Like `CAPTURE`, they execute through an optional handler and fail
  // honestly ("unavailable in this engine") wherever none is bound.
  | { verb: 'GRADE' }
  | { verb: 'HAUL' }
  // E7 Signal Era (`docs/audits/2026-09-02-era-mechanic-audit.md:79-82`): the one playbook verb the
  // four Signal maps were audited as missing. It carries a NAME and nothing else, deliberately:
  //  · a name is what the player's own loop produces (record -> name -> delegate,
  //    `Game.startNamedPlaybookReplay`), so the rider's verb is the same handle the player holds;
  //  · the grammar guard expands this union into `public/skill.md` and can only expand scalars,
  //    references and literal unions (`scripts/skillmd-guard.test.mjs:180`), so a tape-shaped
  //    argument could not be published at all; and
  //  · a verb that carried a program of orders would be a verb an order could carry, which is an
  //    unbounded nesting no bound in `PlaybookFormat` covers. Reject-don't-stretch (Mistake #14).
  // Like `CAPTURE`/`GRADE`/`HAUL` it executes through an optional handler and fails honestly
  // ("unavailable in this engine") wherever none is bound — the browser binds none today, which is
  // the human-parity gap this slice's guard pins rather than papers over.
  | { verb: 'PLAYBOOK_USE'; name: string };

export type StandingOrderStatus = 'pending' | 'active' | 'done' | 'failed';

export type StandingOrderRecord = {
  id: string;
  order: StandingOrder;
  status: StandingOrderStatus;
  reason?: string;
};

export type StandingOrderLogEvent = {
  seq: number;
  at: number;
  type: 'orders_replaced' | 'orders_rejected' | 'order_status' | 'surprise';
  orderId?: string;
  status?: StandingOrderStatus;
  reason?: string;
  surprise?: 'claim_damage' | 'order_failure' | 'hero_down' | 'wave_early';
  orders?: StandingOrderRecord[];
};

export type StandingOrdersView = {
  needsRider: boolean;
  orders: StandingOrderRecord[];
  log: StandingOrderLogEvent[];
};

export type StandingOrdersSubmission =
  | { ok: true; count: number }
  | {
      ok: false;
      reason: 'INVALID_ARGS' | 'PERMISSION_DENIED';
      message: string;
      requiredLevel?: AgentPermissionLevel;
    };

export type StandingOrderTickResult = {
  movement?: AgentVec2;
  /**
   * hero-move-verb: where an ACTIVE `MOVE_HERO` wants the hero this tick. A separate field from
   * `movement` because the two name different bodies in GR-SIM (`movement` is the Prospector's
   * work assignment, this is the hero's steering target) and the same body at a browser room seat,
   * where the rider's body IS a hero. Engines that steer the hero at a seam EARLIER in their step
   * than the executor's tick read `standingOrderHeroSteering()` instead, which holds this value.
   */
  heroMovement?: AgentVec2;
  receipt?: ToolReceipt;
  receiptPoint?: AgentVec2;
};

/**
 * hero-move-verb: the engine's answer to "whose hero is this, where is it, and will that ground
 * take it". Bound per engine so the ONE rule the owner set can be enforced in one place: a rider's
 * order never moves a human's hero.
 *
 *   · GR-SIM binds `riderPiloted: () => true`: the run has a single body and the rider is its only
 *     pilot, so the hero is the rider's to walk.
 *   · A browser ROOM binds one channel per headless seat (`src/mp/AgentRiderBody.ts`), and a seat
 *     exists only where the roster says `client === 'headless'` (`Game.syncMultiplayerActors`), so
 *     `riderPiloted` is true BY CONSTRUCTION for exactly the seats a rider owns.
 *   · The browser's SINGLETON executor (the door a rider reaches on a solo game) binds
 *     `riderPiloted: () => false`, because the hero there is the human at the keys. The order is
 *     refused with `HERO_NOT_YOURS` rather than applied over their input.
 *
 * An engine that binds no channel at all refuses honestly, exactly like `CAPTURE`/`GRADE`/`HAUL`.
 */
export type HeroChannel = {
  /** The live position of the hero this executor may steer. */
  position: () => AgentVec2;
  /** True only where the RIDER, not a human, pilots that hero. */
  riderPiloted: () => boolean;
  /** The engine's terrain answer for a candidate destination: refuse, never stall silently. */
  walkable: (pos: AgentVec2) => boolean;
};

/**
 * hero-move-verb: the hero has arrived when its own body covers the point. One body radius rather
 * than the Prospector's `Balance.agent.arriveRadius` (0.16) because the two bodies stop
 * differently: `Embodiment.stepTowardTarget` moves the Prospector geometrically by
 * `min(distance, speed * delta)` and lands exactly on the point, while `Hero.update` carries
 * momentum (`Balance.hero.accel`/`decel`) and coasts roughly 0.2 wu past a full-speed stop. Read
 * off `Balance.hero.radius` rather than added to `Balance`, so no balance number moves.
 */
export const HERO_ARRIVE_RADIUS = Balance.hero.radius;

/** hero-move-verb: the reasons a MOVE_HERO can refuse, published in the mechanics manifest. */
export const HERO_ORDER_REFUSALS = [
  'HERO_NOT_YOURS',
  'UNREACHABLE_TERRAIN',
  'UNREACHABLE_APPROACH',
  'HERO_UNAVAILABLE',
] as const;

/**
 * F-MCAP-1 (`reviews/mare-claim-air-prevalent.md:34`; owner ruling 2026-09-06, verbatim: "(5)
 * both"): the word a secure window refuses with.
 *
 * The window accepts exactly one `SECURE_CHOICE` and nothing else, which pulls against the
 * adjacent `PICK_UPGRADE` rule: order arrays REPLACE, so a rider that picks an upgrade must
 * re-send its whole plan behind the pick. A rider that carried that habit into the secure window
 * submitted `[SECURE_CHOICE, ...plan]` and got no answer at all — 8,783 identical turns in 35 s,
 * re-measured on this tree before the cure (`artifacts/secure-choice-refusal/before-until-end.json`,
 * matching the 14,467 the air-wall prover burned) — because the refusal reached only the
 * transport's stderr and `snapshot().orders`, the one channel a view-only rider reads, never
 * moved. The refusal now lands there in the `{ status: 'failed', reason }` shape every other
 * refusal uses (`HERO_NOT_YOURS`, `UNREACHABLE_TERRAIN`, `INVALID_TARGET`), so the rider is told
 * in the turn it happens.
 */
export const SECURE_WINDOW_REFUSAL = 'SECURE_CHOICE_ONLY';

/**
 * The id the published refusal carries. Deliberately outside the `orders-<submission>-<index>`
 * namespace: this record is NOT a standing order (it never executes, it is never ticked) but a
 * receipt for one the door would not take.
 */
export const SECURE_WINDOW_REFUSAL_ID = 'refused-secure-window';

/** F-MCAP-1: the whole refusal, so the door, the guard and the transport quote ONE string. */
export const SECURE_WINDOW_REFUSAL_MESSAGE =
  `${SECURE_WINDOW_REFUSAL}: while the secure window is open, the only accepted submission is a single `
  + 'SECURE_CHOICE; answer the choice, then re-send the rest of the plan.';

type RuntimeState = {
  timeAlive: number;
  runState: string;
  hp: number;
  maxHp: number;
  enemiesAlive: number;
  wave: number;
  nextWaveInSim: number;
  gold: number;
  claimHits: number;
  actorMoving: boolean;
  consent: null | {
    rungs: Record<string, { earned: boolean; granted: boolean }>;
    abilities: Record<string, { allowed: boolean }>;
  };
  buildings: Array<AgentBuildingRef & { hp: number; maxHp: number; wrecked: boolean; position: AgentVec2 }>;
  seams: Array<{ id: string; active: boolean; position: AgentVec2 }>;
  sluices: AgentVec2[];
  pendingOffer: string[];
  pendingSecure: boolean;
  /**
   * F-MCAP-1 cure B: whether the pending choice's own CLOCK still has time on it. Split from
   * `pendingSecure` because the two can now come apart: a refused submission spends the window
   * (`HeadlessContractSim.spendSecureWindowOnRefusal`) without answering the choice, so a rider
   * that will not stop concatenating eventually finds the window shut while the choice is still
   * pending. Only the "exactly one SECURE_CHOICE" rule reads this; the tick-skip and the
   * "requires a live secure window" rule stay on `pendingSecure`, so a LATE lone choice is still
   * served rather than thrown away.
   */
  secureWindowOpen: boolean;
};

type ValidationResult = { ok: true; orders: StandingOrder[] } | { ok: false; message: string };
type BlastOrderResult = { ok: true } | { ok: false; reason: string };
export type ActionOrderResult = { ok: true } | { ok: false; reason: string };

export type FinalVerbHandlers = {
  setWeapon: (weapon: 'rig' | 'blast') => ActionOrderResult;
  secureChoice: (choice: 'bank' | 'rush') => ActionOrderResult;
  contextAction: (order: Extract<StandingOrder, { verb: 'CONTEXT_ACTION' }>) => ActionOrderResult;
  capture?: () => ActionOrderResult;
  boatBuild?: (padId: string, buildingId: string) => ActionOrderResult;
  reanchor?: (anchorId: string) => ActionOrderResult;
  motor?: (verb: 'GRADE' | 'HAUL') => ActionOrderResult;
  /** E7: hand the named playbook to the engine's signal systems. Unbound engines refuse honestly. */
  playbookUse?: (name: string) => ActionOrderResult;
};

let installedExecutor: StandingOrdersExecutor | null = null;

export class StandingOrdersExecutor {
  private records: StandingOrderRecord[] = [];
  private readonly history: StandingOrderLogEvent[] = [];
  private needsRiderValue = false;
  private submission = 0;
  private sequence = 0;
  private previousState: RuntimeState | null = null;
  private expectedWaveAt: number | null = null;
  private readonly failureReasons = new Map<string, string>();
  private blastAt: ((pos: AgentVec2) => BlastOrderResult) | null = null;
  private pickUpgrade: ((id: string) => boolean) | null = null;
  private setWeapon: ((weapon: 'rig' | 'blast') => ActionOrderResult) | null = null;
  private secureChoice: ((choice: 'bank' | 'rush') => ActionOrderResult) | null = null;
  private contextAction: ((order: Extract<StandingOrder, { verb: 'CONTEXT_ACTION' }>) => ActionOrderResult) | null = null;
  private capture: (() => ActionOrderResult) | null = null;
  private boatBuild: ((padId: string, buildingId: string) => ActionOrderResult) | null = null;
  private reanchor: ((anchorId: string) => ActionOrderResult) | null = null;
  private motor: ((verb: 'GRADE' | 'HAUL') => ActionOrderResult) | null = null;
  private playbookUse: ((name: string) => ActionOrderResult) | null = null;
  private buildProgress: { orderId: string; distance: number; at: number } | null = null;
  private heroChannel: HeroChannel | null = null;
  private heroSteer: AgentVec2 | null = null;
  private heroProgress: { orderId: string; distance: number; at: number } | null = null;
  /**
   * F-MCAP-1 cure A: the live secure-window refusal, published on the END of `snapshot().orders`
   * and held OUTSIDE `this.records` so a refused submission cannot delete the plan the rider
   * already had accepted (the loop's own view showed submission 36 still standing) and cannot be
   * ticked, replaced or executed. One record at a time, refreshed rather than appended, so a
   * rider that repeats itself six hundred times grows neither the order list nor the log.
   */
  private secureWindowRefusal: StandingOrderRecord | null = null;

  constructor(
    private readonly surface: GoldRushToolSurface,
    private readonly readState: () => unknown,
    private readonly readEconomyLog: () => readonly unknown[] = () => [],
  ) {}

  submit(input: unknown, at?: number): StandingOrdersSubmission {
    const state = this.state(at);
    const eventAt = at ?? state.timeAlive;
    const validated = validateStandingOrders(input);
    if (!validated.ok) {
      this.append({ at: eventAt, type: 'orders_rejected', reason: validated.message });
      return { ok: false, reason: 'INVALID_ARGS', message: validated.message };
    }

    const invalidPick = validated.orders.find(
      (order) => order.verb === 'PICK_UPGRADE' && !state.pendingOffer.includes(order.id),
    );
    if (invalidPick?.verb === 'PICK_UPGRADE') {
      const message = `PICK_UPGRADE requires a live offered id; "${invalidPick.id}" is not available.`;
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      return { ok: false, reason: 'INVALID_ARGS', message };
    }
    // F-MCAP-1: keyed on the WINDOW rather than on the choice, so a rider that spent the whole
    // clock refusing is finally let through (its plan, or its late choice, both land) instead of
    // being refused forever. `HeadlessContractSim` closes the window one refusal at a time; every
    // other engine leaves the two equal, so this is the old rule wherever the clock is not spent.
    if (state.secureWindowOpen && (validated.orders.length !== 1 || validated.orders[0]?.verb !== 'SECURE_CHOICE')) {
      const message = SECURE_WINDOW_REFUSAL_MESSAGE;
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      this.refuseSecureWindow(validated.orders, message, eventAt);
      return { ok: false, reason: 'INVALID_ARGS', message };
    }
    if (validated.orders.some((order) => order.verb === 'SECURE_CHOICE') && !state.pendingSecure) {
      const message = 'SECURE_CHOICE requires a live secure window.';
      this.append({ at: eventAt, type: 'orders_rejected', reason: message });
      return { ok: false, reason: 'INVALID_ARGS', message };
    }

    const level = this.surface.permissionLevel();
    const blocked = validated.orders
      .map((order) => ({ order, denial: permissionDenial(order, state, level) }))
      .find((entry) => entry.denial);
    if (blocked) {
      this.append({ at: eventAt, type: 'orders_rejected', reason: blocked.denial! });
      return {
        ok: false,
        reason: 'PERMISSION_DENIED',
        message: blocked.denial!,
        requiredLevel: requiredLevel(blocked.order),
      };
    }

    this.submission += 1;
    this.records = validated.orders.map((order, index) => ({
      id: `orders-${this.submission}-${index + 1}`,
      order,
      status: 'pending',
    }));
    // F-MCAP-1: an accepted submission retires the refusal receipt; the rider has moved on.
    this.secureWindowRefusal = null;
    this.needsRiderValue = false;
    this.append({ at: eventAt, type: 'orders_replaced', orders: copyRecords(this.records) });
    return { ok: true, count: this.records.length };
  }

  tick(at: number, actor: AgentVec2): StandingOrderTickResult {
    const state = this.state(at, this.records.some((record) => record.status === 'pending' || record.status === 'active'));
    // F-MCAP-1: the receipt lives exactly as long as the choice it answered for. Cleared here so
    // a run that carries on past its secure (a `rush`) does not carry a stale refusal with it.
    if (!state.pendingSecure) this.secureWindowRefusal = null;
    this.detectSurprises(state, at);
    // hero-move-verb: the steering target is re-derived from scratch every tick and survives no
    // longer than the order that set it. Cleared HERE rather than in the MOVE_HERO branch so every
    // exit from the loop below (an earlier order owning the tick, a permission denial, a secure
    // window, an empty order list) stops the hero rather than leaving it walking on a stale point.
    this.heroSteer = null;

    for (const record of this.records) {
      if (record.status === 'done' || record.status === 'failed') continue;
      if (state.pendingSecure && record.order.verb !== 'SECURE_CHOICE') continue;
      const level = this.surface.permissionLevel();
      const denial = permissionDenial(record.order, state, level);
      if (denial) {
        this.fail(record, `PERMISSION_DENIED: ${denial}`, at);
        return {};
      }

      const result = this.execute(record, state, actor, at);
      if (result) return result;
    }
    return {};
  }

  observe(): void {
    const raw = this.readState();
    if (!isRecord(raw) || raw.runState !== 'dead' || this.previousState?.runState === 'dead') return;
    const state = runtimeState(raw);
    this.detectSurprises(state, state.timeAlive);
  }

  reset(): void {
    this.records = [];
    this.secureWindowRefusal = null;
    this.history.length = 0;
    this.needsRiderValue = false;
    this.submission = 0;
    this.sequence = 0;
    this.buildProgress = null;
    this.heroSteer = null;
    this.heroProgress = null;
    this.previousState = null;
    this.expectedWaveAt = null;
    this.failureReasons.clear();
  }

  setBlastAt(handler: (pos: AgentVec2) => BlastOrderResult): void {
    this.blastAt = handler;
  }

  bindUpgradePicker(pick: (id: string) => boolean): void {
    this.pickUpgrade = pick;
  }

  /** hero-move-verb: install (or, with null, revoke) this executor's hero. */
  bindHeroChannel(channel: HeroChannel | null): void {
    this.heroChannel = channel;
    this.heroSteer = null;
    this.heroProgress = null;
  }

  /**
   * hero-move-verb: where an active MOVE_HERO wants the hero, or null. Both engines steer the hero
   * EARLIER in their fixed step than they tick this executor (`HeadlessContractSim.step` runs
   * `hero.update` at :1785 and `prospector.updateSimulation` at :1942; `Game.updateActors` runs
   * before `Game.ts:3141`), so the target a tick publishes is consumed on the NEXT step. That one
   * step of latency is identical in both engines and a function of sim state alone, which is what
   * determinism and cross-engine parity require; it is not a race.
   */
  heroSteering(): AgentVec2 | null {
    return this.heroSteer;
  }

  bindFinalVerbs(handlers: FinalVerbHandlers): void {
    this.setWeapon = handlers.setWeapon;
    this.secureChoice = handlers.secureChoice;
    this.contextAction = handlers.contextAction;
    this.capture = handlers.capture ?? null;
    this.boatBuild = handlers.boatBuild ?? null;
    this.reanchor = handlers.reanchor ?? null;
    this.motor = handlers.motor ?? null;
    this.playbookUse = handlers.playbookUse ?? null;
  }

  snapshot(): StandingOrdersView {
    return {
      needsRider: this.needsRiderValue,
      // F-MCAP-1 cure A: the refusal rides the END of the same array every other refusal rides,
      // so `now.orders[]` answers a rider that reads nothing but THE VIEW.
      orders: copyRecords(this.secureWindowRefusal ? [...this.records, this.secureWindowRefusal] : this.records),
      log: this.history.map((event) => ({
        ...event,
        ...(event.orders ? { orders: copyRecords(event.orders) } : {}),
      })),
    };
  }

  private execute(
    record: StandingOrderRecord,
    state: RuntimeState,
    actor: AgentVec2,
    at: number,
  ): StandingOrderTickResult | null {
    const order = record.order;
    if (order.verb === 'BUILD') {
      if (!conditionMet(order.when, state)) return null;
      this.status(record, 'active', at);
      const target = snapBuildTarget(order.where);
      if (!this.surface.buildTargetReachable(target)) {
        this.fail(record, 'UNREACHABLE: BUILD target is outside buildable terrain.', at);
        return {};
      }
      const remaining = distance(actor, target);
      if (remaining > this.surface.buildPlacementRadius(order.what)) {
        if (this.buildProgress?.orderId !== record.id || remaining < this.buildProgress.distance - 0.05) {
          this.buildProgress = { orderId: record.id, distance: remaining, at };
        } else if (at - this.buildProgress.at >= 4) {
          this.fail(record, 'UNREACHABLE: BUILD target has no traversable approach.', at);
          return {};
        }
        return { movement: target };
      }
      this.buildProgress = null;
      const receipt = this.surface.tools.place_building(order.what, order.where, order.rotationSteps ?? 0);
      return this.finishAction(record, receipt, target, at);
    }

    if (order.verb === 'REPAIR_UNDER') {
      // ADR-005 stage 2 (`docs/bench/rider-parity-audit.md` §3a change 3). The policy NAME was
      // already 1:1 — a human sets "repair under N% HP" in the Prospector panel — but the REACH was
      // not. This search used to be `state.buildings.find(...)` with no distance term at all, so it
      // took the FIRST work anywhere on the map below the threshold and its travel clause carried
      // the Prospector to it. The human's sweep considers only works within `Balance.sparkRig.range`
      // of the Prospector, which drifts to the hero and is therefore bounded by where the human
      // walked, and it takes the NEAREST (`Game.nearestProspectorRepairTarget`, whose
      // `bestDistanceSq` starts at that same range squared). Both halves are copied here.
      //
      // `Balance.sparkRig.range` is READ, never re-typed: the browser reads the same field, so the
      // two engines cannot fork the next time the number moves. The reach that follows stays
      // `Balance.wreck.repairRadius` — that is the repair's own reach, unchanged, and this radius
      // is the SEARCH's.
      //
      // Measured from the ACTOR, which is the Prospector in GR-SIM and the seat's own body at a
      // browser room seat — the same body the travel clause below walks, so a target this search
      // accepts is always one the order can actually reach.
      const searchRange = Balance.sparkRig.range;
      const target = state.buildings.reduce<(typeof state.buildings)[number] | null>((best, building) => {
        if (building.maxHp <= 0) return best;
        if (!building.wrecked && (building.hp / building.maxHp) * 100 >= order.pct) return best;
        if (distance(actor, building.position) > searchRange) return best;
        return best === null || distance(actor, building.position) < distance(actor, best.position) ? building : best;
      }, null);
      if (!target) return null;
      this.status(record, 'active', at);
      if (distance(actor, target.position) > Balance.wreck.repairRadius) return { movement: target.position };
      const receipt = this.surface.tools.repair({ id: target.id, index: target.index });
      return this.finishAction(record, receipt, target.position, at);
    }

    // hero-move-verb. Shaped on BUILD's travel clause above rather than on the retired MOVE_TO's,
    // because the
    // hero can be BLOCKED in ways the Prospector cannot: it has no pathfinder, it collides with
    // terrain, and a target behind a wall would otherwise pin the executor forever on an order that
    // looks active and never arrives. So progress is watched the way BUILD watches its approach and
    // the same four-second no-progress rule refuses. Every exit either completes, refuses with a
    // reason, or returns a live steering target: no silent stall.
    if (order.verb === 'MOVE_HERO') {
      const channel = this.heroChannel;
      if (!channel) {
        this.fail(record, 'HERO_UNAVAILABLE: MOVE_HERO is unavailable in this engine.', at);
        return {};
      }
      // The owner's law, enforced before anything else can read a position: a rider's order never
      // moves a human's hero. Checked EVERY tick rather than once at submission, because a seat can
      // change hands mid-run and a stale answer would be exactly the failure this guards.
      if (!channel.riderPiloted()) {
        this.fail(record, 'HERO_NOT_YOURS: a human pilots this hero; the order is refused, never applied over their input.', at);
        return {};
      }
      if (!channel.walkable(order.pos)) {
        this.fail(record, 'UNREACHABLE_TERRAIN: MOVE_HERO target is outside walkable terrain.', at);
        return {};
      }
      const hero = channel.position();
      const remaining = distance(hero, order.pos);
      if (remaining <= HERO_ARRIVE_RADIUS) {
        this.heroProgress = null;
        this.status(record, 'done', at);
        return {};
      }
      this.status(record, 'active', at);
      if (this.heroProgress?.orderId !== record.id || remaining < this.heroProgress.distance - 0.05) {
        this.heroProgress = { orderId: record.id, distance: remaining, at };
      } else if (at - this.heroProgress.at >= 4) {
        this.heroProgress = null;
        this.fail(record, 'UNREACHABLE_APPROACH: MOVE_HERO target has no traversable approach.', at);
        return {};
      }
      this.heroSteer = order.pos;
      return { heroMovement: order.pos };
    }

    if (order.verb === 'BLAST_AT') {
      this.status(record, 'active', at);
      const result = this.blastAt?.(order.pos) ?? { ok: false as const, reason: 'BLAST_AT is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'SET_WEAPON') {
      this.status(record, 'active', at);
      const result = this.setWeapon?.(order.weapon) ?? { ok: false as const, reason: 'SET_WEAPON is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'HARVEST') {
      const point =
        'seam' in order
          ? state.seams.find((seam) => seam.id === order.seam && seam.active)?.position
          : state.sluices[order.sluice];
      if (!point) {
        this.fail(record, `INVALID_TARGET: ${'seam' in order ? order.seam : `sluice ${order.sluice}`} is unavailable.`, at);
        return {};
      }
      this.status(record, 'active', at);
      if (distance(actor, point) > Balance.agent.arriveRadius || state.actorMoving) return { movement: point };
      const receipt = this.surface.tools.pan_at('seam' in order ? order.seam : `sluice-${order.sluice + 1}`);
      return this.finishAction(record, receipt, point, at);
    }

    if (order.verb === 'PICK_UPGRADE') {
      this.status(record, 'active', at);
      if (!this.pickUpgrade?.(order.id)) this.fail(record, `INVALID_TARGET: ${order.id} is no longer offered.`, at);
      else this.status(record, 'done', at);
      return {};
    }

    if (order.verb === 'SECURE_CHOICE') {
      this.status(record, 'active', at);
      const result = this.secureChoice?.(order.choice) ?? { ok: false as const, reason: 'SECURE_CHOICE is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'CONTEXT_ACTION') {
      this.status(record, 'active', at);
      const result = this.contextAction?.(order) ?? { ok: false as const, reason: 'CONTEXT_ACTION is unavailable.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'CAPTURE' || order.verb === 'BOAT_BUILD' || order.verb === 'REANCHOR') {
      this.status(record, 'active', at);
      const result = order.verb === 'CAPTURE'
        ? this.capture?.()
        : order.verb === 'BOAT_BUILD'
          ? this.boatBuild?.(order.padId, order.buildingId)
          : this.reanchor?.(order.anchorId);
      if (result?.ok) this.status(record, 'done', at);
      else this.fail(record, result?.reason ?? `${order.verb} is unavailable.`, at);
      return {};
    }

    if (order.verb === 'GRADE' || order.verb === 'HAUL') {
      this.status(record, 'active', at);
      const result = this.motor?.(order.verb) ?? { ok: false as const, reason: `${order.verb} is unavailable in this engine.` };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    if (order.verb === 'PLAYBOOK_USE') {
      this.status(record, 'active', at);
      const result = this.playbookUse?.(order.name)
        ?? { ok: false as const, reason: 'PLAYBOOK_USE is unavailable in this engine.' };
      if (result.ok) this.status(record, 'done', at);
      else this.fail(record, result.reason, at);
      return {};
    }

    return null;
  }

  private finishAction(
    record: StandingOrderRecord,
    receipt: ToolReceipt,
    point: AgentVec2,
    at: number,
  ): StandingOrderTickResult {
    if (receipt.outcome.ok) this.status(record, 'done', at);
    else {
      const detail = record.order.verb === 'BUILD' ? receipt.outcome.detail : undefined;
      this.fail(record, `${receipt.outcome.reason}${detail ? ` (${detail})` : ''}: ${record.order.verb} action was rejected.`, at);
    }
    return { receipt, receiptPoint: point };
  }

  /**
   * F-MCAP-1 cure A: publish the secure-window refusal where a rider can see it.
   *
   * The record names the order that CAUSED the refusal — the first one that is not the choice —
   * because that is the single fact the rider is missing: not "something was wrong" but "this
   * order is why the whole submission bounced". A submission of nothing but choices names its own
   * head instead; an EMPTY submission names nothing at all, so it publishes no record and rides
   * the log line and `needsRider` alone (there is no order to point at, and inventing one would
   * be worse than saying less).
   *
   * Refreshed rather than appended: an identical repeat is already published, so it re-emits
   * neither an `order_status` event nor a surprise. That is `fail`'s own `failureReasons` rule,
   * applied one level up, and it is what keeps a six-hundred-refusal ride O(1) in the log.
   */
  private refuseSecureWindow(orders: StandingOrder[], message: string, at: number): void {
    const offending = orders.find((order) => order.verb !== 'SECURE_CHOICE') ?? orders[0];
    if (!offending) return;
    const published = this.secureWindowRefusal;
    if (
      published
      && published.reason === message
      && standingOrderIdentity(published.order) === standingOrderIdentity(offending)
    ) return;
    const record: StandingOrderRecord = {
      id: SECURE_WINDOW_REFUSAL_ID,
      order: structuredClone(offending),
      status: 'pending',
    };
    this.secureWindowRefusal = record;
    this.fail(record, message, at);
  }

  private fail(record: StandingOrderRecord, reason: string, at: number): void {
    this.status(record, 'failed', at, reason);
    const order = standingOrderIdentity(record.order);
    if (this.failureReasons.get(order) === reason) return;
    this.failureReasons.set(order, reason);
    this.surprise('order_failure', at, record.id, reason);
  }

  private status(record: StandingOrderRecord, status: StandingOrderStatus, at: number, reason?: string): void {
    if (record.status === status && record.reason === reason) return;
    record.status = status;
    if (status === 'done') this.failureReasons.delete(standingOrderIdentity(record.order));
    if (reason) record.reason = reason;
    this.append({ at, type: 'order_status', orderId: record.id, status, ...(reason ? { reason } : {}) });
  }

  private detectSurprises(state: RuntimeState, at: number): void {
    const previous = this.previousState;
    if (previous) {
      if (state.claimHits > previous.claimHits) this.surprise('claim_damage', at);
      if ((state.hp <= 0 || state.runState === 'dead') && previous.hp > 0 && previous.runState !== 'dead') {
        this.surprise('hero_down', at);
      }
      if (state.wave > previous.wave && this.expectedWaveAt !== null && at + 0.2 < this.expectedWaveAt) {
        this.surprise('wave_early', at, undefined, `Wave ${state.wave} arrived before ${round2(this.expectedWaveAt)}s.`);
      }
    }
    if (!previous || state.wave !== previous.wave) this.expectedWaveAt = at + state.nextWaveInSim;
    this.previousState = state;
  }

  private surprise(
    surprise: StandingOrderLogEvent['surprise'],
    at: number,
    orderId?: string,
    reason?: string,
  ): void {
    this.needsRiderValue = true;
    this.append({
      at,
      type: 'surprise',
      surprise,
      ...(orderId ? { orderId } : {}),
      ...(reason ? { reason } : {}),
    });
  }

  private append(event: Omit<StandingOrderLogEvent, 'seq'>): void {
    this.history.push({ seq: ++this.sequence, ...event });
  }

  private state(at?: number, includeActions = false): RuntimeState {
    return runtimeState(this.readState(), at, includeActions, this.readEconomyLog());
  }
}

export function bindStandingOrders(executor: StandingOrdersExecutor): void {
  installedExecutor = executor;
}

export function bindStandingOrderBlast(handler: (pos: AgentVec2) => BlastOrderResult): void {
  installedExecutor?.setBlastAt(handler);
}

export function bindStandingUpgradePicker(pick: (id: string) => boolean): void {
  installedExecutor?.bindUpgradePicker(pick);
}

export function bindStandingOrderFinalVerbs(handlers: Parameters<StandingOrdersExecutor['bindFinalVerbs']>[0]): void {
  installedExecutor?.bindFinalVerbs(handlers);
}

/** hero-move-verb: hand the installed executor the hero it may steer, or null to revoke it. */
export function bindStandingOrderHero(channel: HeroChannel | null): void {
  installedExecutor?.bindHeroChannel(channel);
}

/** hero-move-verb: the installed executor's live hero steering target, or null. */
export function standingOrderHeroSteering(): AgentVec2 | null {
  return installedExecutor?.heroSteering() ?? null;
}

/**
 * hero-move-verb: the unit `Intents.move` a human's keys would produce walking from `from` to `to`,
 * or null once the two are the same point. Lives here rather than in either engine so both derive
 * the identical vector from the identical arithmetic. `y` is the WORLD Z axis, matching
 * `Hero.update`'s `targetVelocity.set(moveX, 0, moveY)` and `AgentRiderBody.movement`.
 */
export function heroMoveIntent(from: AgentVec2, to: AgentVec2): { x: number; y: number } | null {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  return length > 0 ? { x: dx / length, y: dz / length } : null;
}

export function tickStandingOrders(at: number, actor: AgentVec2): StandingOrderTickResult {
  return installedExecutor?.tick(at, actor) ?? {};
}

export function observeStandingOrders(): void {
  installedExecutor?.observe();
}

export function snapshotStandingOrders(): StandingOrdersView {
  return installedExecutor?.snapshot() ?? { needsRider: false, orders: [], log: [] };
}

export function resetStandingOrders(): void {
  installedExecutor?.reset();
}

export function validateStandingOrders(input: unknown): ValidationResult {
  if (!Array.isArray(input)) return { ok: false, message: 'orders must be an array.' };
  if (input.length > 32) return { ok: false, message: 'orders may contain at most 32 entries.' };

  const orders: StandingOrder[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    if (!isRecord(value) || typeof value.verb !== 'string') {
      return { ok: false, message: `orders[${index}] requires a verb.` };
    }
    const parsed = validateOrder(value, index);
    if (typeof parsed === 'string') return { ok: false, message: parsed };
    orders.push(parsed);
  }
  return { ok: true, orders };
}

export function requiredLevel(order: StandingOrder): AgentPermissionLevel {
  if (order.verb === 'BUILD') return 3;
  if (order.verb === 'CONTEXT_ACTION') return 3;
  if (order.verb === 'HARVEST') return 2;
  // E7: stated rather than inherited from the default below, because the browser gates the same
  // act on `Balance.e7Playbook.requiredPermissionLevel` (= 2, `Game.playbookConsentGranted`).
  // One rung, written down in both engines, so a parity claim about it can be checked.
  if (order.verb === 'PLAYBOOK_USE') return 2;
  return 2;
}

function validateOrder(value: Record<string, unknown>, index: number): StandingOrder | string {
  if (value.verb === 'BUILD') {
    const hasRotation = 'rotationSteps' in value;
    if (!exactKeys(value, hasRotation ? ['verb', 'what', 'where', 'when', 'rotationSteps'] : ['verb', 'what', 'where', 'when'])) {
      return schemaError(index, 'BUILD');
    }
    if (!isBuildableId(value.what) || !validPos(value.where)) return schemaError(index, 'BUILD');
    const rotationSteps = value.rotationSteps;
    if (hasRotation && (typeof rotationSteps !== 'number' || !Number.isInteger(rotationSteps) || rotationSteps < 0 || rotationSteps > 3)) {
      return schemaError(index, 'BUILD');
    }
    const when = validCondition(value.when);
    return when
      ? { verb: 'BUILD', what: value.what, where: value.where, when, ...(hasRotation ? { rotationSteps: rotationSteps as 0 | 1 | 2 | 3 } : {}) }
      : schemaError(index, 'BUILD');
  }
  if (value.verb === 'REPAIR_UNDER') {
    if (!exactKeys(value, ['verb', 'pct']) || !finiteInRange(value.pct, 0, 100)) return schemaError(index, 'REPAIR_UNDER');
    return { verb: 'REPAIR_UNDER', pct: value.pct };
  }
  if (value.verb === 'MOVE_HERO') {
    // hero-move-verb rides the same two-key shape the retired MOVE_TO did, on purpose: a point is
    // a point, and a rider that knew the old grammar writes the new one without learning a second
    // shape. One body now, and the schema is the one it always was.
    if (!exactKeys(value, ['verb', 'pos']) || !validPos(value.pos)) return schemaError(index, value.verb);
    return { verb: value.verb, pos: value.pos };
  }
  if (value.verb === 'BLAST_AT') {
    if (!exactKeys(value, ['verb', 'pos']) || !validPos(value.pos)) return schemaError(index, 'BLAST_AT');
    return { verb: 'BLAST_AT', pos: value.pos };
  }
  if (value.verb === 'SET_WEAPON') {
    // SET is deliberately idempotent: standing-order replacement may re-apply a whole tape.
    if (!exactKeys(value, ['verb', 'weapon']) || (value.weapon !== 'rig' && value.weapon !== 'blast')) return schemaError(index, 'SET_WEAPON');
    return { verb: 'SET_WEAPON', weapon: value.weapon };
  }
  if (value.verb === 'HARVEST') {
    if (exactKeys(value, ['verb', 'seam']) && typeof value.seam === 'string' && value.seam.length > 0 && value.seam.length <= 80) {
      return { verb: 'HARVEST', seam: value.seam };
    }
    if (exactKeys(value, ['verb', 'sluice']) && Number.isInteger(value.sluice) && finiteInRange(value.sluice, 0, 31)) {
      return { verb: 'HARVEST', sluice: value.sluice };
    }
    return schemaError(index, 'HARVEST');
  }
  if (value.verb === 'PICK_UPGRADE') {
    if (!exactKeys(value, ['verb', 'id']) || typeof value.id !== 'string' || value.id.length === 0 || value.id.length > 80) {
      return schemaError(index, 'PICK_UPGRADE');
    }
    return { verb: 'PICK_UPGRADE', id: value.id };
  }
  if (value.verb === 'SECURE_CHOICE') {
    if (!exactKeys(value, ['verb', 'choice']) || (value.choice !== 'bank' && value.choice !== 'rush')) return schemaError(index, 'SECURE_CHOICE');
    return { verb: 'SECURE_CHOICE', choice: value.choice };
  }
  if (value.verb === 'CONTEXT_ACTION') {
    if (value.action === 'fund' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'fund' };
    if (value.action === 'recover' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'recover' };
    if (value.action === 'plant' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'plant' };
    if (value.action === 'redig' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'redig' };
    if (value.action === 'backfill' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'backfill' };
    if (value.action === 'stoke' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'stoke' };
    // ADR-005 stage 3 item 8: the confirm key's last four world interactions, targetless like the rest.
    if (value.action === 'drill' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'drill' };
    if (value.action === 'assay' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'assay' };
    if (value.action === 'preserve' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'preserve' };
    if (value.action === 'digger' && exactKeys(value, ['verb', 'action'])) return { verb: 'CONTEXT_ACTION', action: 'digger' };
    if ((value.action !== 'upgrade' && value.action !== 'demolish') || !exactKeys(value, ['verb', 'action', 'target']) || !isRecord(value.target)) {
      return schemaError(index, 'CONTEXT_ACTION');
    }
    if (!exactKeys(value.target, ['id', 'index']) || !isBuildableId(value.target.id)
      || !Number.isInteger(value.target.index) || !finiteInRange(value.target.index, 0, 10_000)) {
      return schemaError(index, 'CONTEXT_ACTION');
    }
    return { verb: 'CONTEXT_ACTION', action: value.action, target: { id: value.target.id, index: value.target.index } };
  }
  if (value.verb === 'CAPTURE') {
    if (!exactKeys(value, ['verb'])) return schemaError(index, 'CAPTURE');
    return { verb: 'CAPTURE' };
  }
  if (value.verb === 'BOAT_BUILD') {
    if (!exactKeys(value, ['verb', 'padId', 'buildingId']) || !validId(value.padId) || !validId(value.buildingId)) {
      return schemaError(index, 'BOAT_BUILD');
    }
    return { verb: 'BOAT_BUILD', padId: value.padId, buildingId: value.buildingId };
  }
  if (value.verb === 'REANCHOR') {
    if (!exactKeys(value, ['verb', 'anchorId']) || !validId(value.anchorId)) return schemaError(index, 'REANCHOR');
    return { verb: 'REANCHOR', anchorId: value.anchorId };
  }
  if (value.verb === 'GRADE' || value.verb === 'HAUL') {
    if (!exactKeys(value, ['verb'])) return schemaError(index, value.verb);
    return { verb: value.verb };
  }
  if (value.verb === 'PLAYBOOK_USE') {
    // Same 1..80 char handle `BOAT_BUILD`/`REANCHOR` accept: a playbook name is a shelf label,
    // not a path, and the engine that resolves it decides what an unknown name means.
    if (!exactKeys(value, ['verb', 'name']) || !validId(value.name)) return schemaError(index, 'PLAYBOOK_USE');
    return { verb: 'PLAYBOOK_USE', name: value.name };
  }
  return `orders[${index}].verb "${value.verb}" is unknown.`;
}

function validCondition(value: unknown): BuildCondition | null {
  if (!isRecord(value)) return null;
  if (exactKeys(value, ['goldGte']) && finiteInRange(value.goldGte, 0, 1_000_000)) return { goldGte: value.goldGte };
  if (exactKeys(value, ['waveGte']) && finiteInRange(value.waveGte, 0, 10_000)) return { waveGte: value.waveGte };
  return null;
}

function conditionMet(condition: BuildCondition, state: RuntimeState): boolean {
  return 'goldGte' in condition ? state.gold >= condition.goldGte : state.wave >= condition.waveGte;
}

function permissionDenial(
  order: StandingOrder,
  state: RuntimeState,
  level: AgentPermissionLevel,
): string | null {
  const required = requiredLevel(order);
  if (required > level) return `${order.verb} requires permission rung ${required}; current rung is ${level}.`;

  const rung = state.consent?.rungs[String(required)];
  if (rung && (!rung.earned || !rung.granted)) return `${order.verb} requires granted permission rung ${required}.`;

  const ability = requiredAbility(order);
  if (ability && state.consent?.abilities[ability]?.allowed === false) {
    return `${order.verb} requires the granted ${ability} ability.`;
  }
  return null;
}

function requiredAbility(order: StandingOrder): AgentAbility | null {
  if (order.verb === 'BUILD') return 'place_building';
  if (order.verb === 'REPAIR_UNDER') return 'auto_repair';
  if (order.verb === 'HARVEST') return 'auto_pan';
  return null;
}

function runtimeState(
  value: unknown,
  at?: number,
  includeActions = false,
  economyLog: readonly unknown[] = [],
): RuntimeState {
  const state = isRecord(value) ? value : {};
  const economy = isRecord(state.economy) ? state.economy : {};
  const wreck = isRecord(state.wreck) ? state.wreck : {};
  const build = isRecord(state.build) ? state.build : {};
  const harvest = isRecord(state.harvest) ? state.harvest : {};
  const agent = isRecord(state.agent) ? state.agent : {};
  const embodiment = isRecord(agent.embodiment) ? agent.embodiment : {};
  const observedAt = finite(state.timeAlive, at ?? 0);
  const wave = predictedWave(state, at, observedAt);
  return {
    timeAlive: at ?? observedAt,
    runState: typeof state.runState === 'string' ? state.runState : '',
    hp: finite(state.hp, 0),
    maxHp: finite(state.maxHp, 0),
    enemiesAlive: finite(state.enemiesAlive, 0),
    wave: wave.value,
    nextWaveInSim: wave.nextIn,
    gold: currentGold(finite(economy.gold, 0), observedAt, economyLog),
    claimHits: finite(wreck.hitsResolved, 0),
    actorMoving: embodiment.moving === true || embodiment.drifting === true,
    consent: consentState(state),
    buildings: includeActions ? buildingStates(build.hp) : [],
    seams: includeActions ? seamStates(harvest.activeNodes) : [],
    sluices: includeActions ? pointArray(build.sluicePositions) : [],
    pendingOffer: isRecord(state.progression) && Array.isArray(state.progression.offer)
      ? state.progression.offer.filter((id): id is string => typeof id === 'string')
      : [],
    pendingSecure: isRecord(state.run) && state.run.pendingSecure === true,
    // F-MCAP-1 cure B: engines that do not publish the window's own clock fall back to the
    // choice itself, which is exactly the rule that stood before this slice. The browser
    // (`Game.ts`) publishes no `secureWindowOpen`, so its door does not move.
    secureWindowOpen: isRecord(state.run) && typeof state.run.secureWindowOpen === 'boolean'
      ? state.run.secureWindowOpen
      : isRecord(state.run) && state.run.pendingSecure === true,
  };
}

function predictedWave(
  state: Record<string, unknown>,
  at: number | undefined,
  observedAt: number,
): { value: number; nextIn: number } {
  const observedWave = finite(state.wave, 0);
  const observedNext = Math.max(0, finite(state.nextWaveInSim, 0));
  if (at === undefined || state.spawnDisabled === true || scheduledWavesDisabled() || at < observedAt + observedNext) {
    return { value: observedWave, nextIn: observedNext };
  }

  const contract = isRecord(state.contract) ? state.contract : {};
  const cadence = Math.max(0.1, finite(contract.waveCadenceMult, 1));
  const interval = Math.max(0.1, Balance.waves.waveInterval / cadence);
  return {
    value: observedWave + 1,
    nextIn: Math.max(0, interval - (at - observedAt - observedNext)),
  };
}

function scheduledWavesDisabled(): boolean {
  return typeof location !== 'undefined' && new URLSearchParams(location.search).has('nowaves');
}

function currentGold(observedGold: number, observedAt: number, log: readonly unknown[]): number {
  let gold = observedGold;
  for (const value of log) {
    if (!isRecord(value) || finite(value.at, Number.NEGATIVE_INFINITY) <= observedAt) continue;
    const amount = Math.max(0, finite(value.amount, 0));
    if (
      value.type === 'gold_panned' ||
      value.type === 'gold_sluiced' ||
      value.type === 'gold_granted' ||
      value.type === 'gold_reclaimed'
    ) {
      gold += amount;
    } else if (value.type === 'gold_stolen' || value.type === 'gold_spent') {
      gold -= amount;
    } else if (value.type === 'run_reset') {
      gold = 0;
    }
  }
  return Math.max(0, gold);
}

function consentState(state: Record<string, unknown>): RuntimeState['consent'] {
  const ui = isRecord(state.ui) ? state.ui : {};
  const agent = isRecord(ui.agent) ? ui.agent : {};
  const consent = isRecord(agent.consent) ? agent.consent : null;
  if (!consent || !isRecord(consent.rungs) || !isRecord(consent.abilities)) return null;

  const rungs: Record<string, { earned: boolean; granted: boolean }> = {};
  const abilities: Record<string, { allowed: boolean }> = {};
  for (const [key, value] of Object.entries(consent.rungs)) {
    if (isRecord(value) && typeof value.earned === 'boolean' && typeof value.granted === 'boolean') {
      rungs[key] = { earned: value.earned, granted: value.granted };
    }
  }
  for (const [key, value] of Object.entries(consent.abilities)) {
    if (isRecord(value) && typeof value.allowed === 'boolean') abilities[key] = { allowed: value.allowed };
  }
  return { rungs, abilities };
}

function buildingStates(value: unknown): RuntimeState['buildings'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !validPos(entry.position)) return [];
    return [{
      id: entry.id,
      ...(Number.isInteger(entry.index) ? { index: entry.index as number } : {}),
      hp: finite(entry.hp, 0),
      maxHp: finite(entry.maxHp, 0),
      wrecked: entry.wrecked === true,
      position: entry.position,
    }];
  });
}

function seamStates(value: unknown): RuntimeState['seams'] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !validPos(entry.position)) return [];
    return [{ id: entry.id, active: entry.active === true, position: entry.position }];
  });
}

function pointArray(value: unknown): AgentVec2[] {
  return Array.isArray(value) ? value.filter(validPos) : [];
}

function copyRecords(records: StandingOrderRecord[]): StandingOrderRecord[] {
  return records.map((record) => ({
    ...record,
    order: structuredClone(record.order),
  }));
}

export function standingOrderIdentity(order: StandingOrder): string {
  if (order.verb === 'BUILD') {
    const when = 'goldGte' in order.when ? ['goldGte', order.when.goldGte] : ['waveGte', order.when.waveGte];
    return JSON.stringify([order.verb, order.what, order.where.x, order.where.z, ...when,
      ...(order.rotationSteps ? ['rotationSteps', order.rotationSteps] : [])]);
  }
  if (order.verb === 'REPAIR_UNDER') return JSON.stringify([order.verb, order.pct]);
  if (order.verb === 'MOVE_HERO' || order.verb === 'BLAST_AT') {
    return JSON.stringify([order.verb, order.pos.x, order.pos.z]);
  }
  if (order.verb === 'HARVEST') return JSON.stringify([order.verb, 'seam' in order ? order.seam : order.sluice]);
  if (order.verb === 'PICK_UPGRADE') return JSON.stringify([order.verb, order.id]);
  if (order.verb === 'SET_WEAPON') return JSON.stringify([order.verb, order.weapon]);
  if (order.verb === 'SECURE_CHOICE') return JSON.stringify([order.verb, order.choice]);
  if (order.verb === 'CONTEXT_ACTION') return JSON.stringify([order.verb, order.action,
    ...('target' in order ? [order.target.id, order.target.index] : [])]);
  if (order.verb === 'CAPTURE') return JSON.stringify([order.verb]);
  if (order.verb === 'BOAT_BUILD') return JSON.stringify([order.verb, order.padId, order.buildingId]);
  if (order.verb === 'REANCHOR') return JSON.stringify([order.verb, order.anchorId]);
  if (order.verb === 'GRADE' || order.verb === 'HAUL') return JSON.stringify([order.verb]);
  return JSON.stringify([order.verb, order.name]);
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 80;
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function validPos(value: unknown): value is AgentVec2 {
  return isRecord(value) && exactKeys(value, ['x', 'z']) && Number.isFinite(value.x) && Number.isFinite(value.z);
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function schemaError(index: number, verb: StandingOrder['verb']): string {
  return `orders[${index}] does not match the ${verb} schema.`;
}

function snapBuildTarget(point: AgentVec2): AgentVec2 {
  const snap = Balance.beacon.gridSnap;
  return { x: Math.round(point.x / snap) * snap, z: Math.round(point.z / snap) * snap };
}

function distance(a: AgentVec2, b: AgentVec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
