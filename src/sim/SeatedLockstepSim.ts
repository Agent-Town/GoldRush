import {
  LockstepClient,
  type LockstepAction,
  type LockstepSample,
  type LockstepTick,
  type MultiplayerPlayer,
  type MultiplayerSetup,
} from '../mp/LockstepClient';
import { HeadlessContractSim, SEAT_HASH_ENGINE, type GrSimOutcome, type GrSimTurn } from './HeadlessContractSim';
import { SeatOrdersDriver, type SeatOrdersVerdict, type SeatRunState } from './SeatOrders';

/**
 * THE AGENT SEAT — a headless rig rides in a live room.
 *
 * GR-SIM already runs the full deterministic sim; a lockstep room already carries only
 * inputs. So a seat is a TRANSPORT, not a second engine: the same sim, stepped one tick
 * per tick-bundle the room agrees on, hashing what it computes and resigning the moment
 * that hash stops matching the table's.
 *
 * It wires INTO `LockstepClient` — the same client the browser rider uses, unchanged.
 * Nothing here touches the relay: a seat takes its chair through the doors that already
 * exist (`/api/multiplayer/inspect` for the ride's setup, then the ordinary join).
 */

/** The room's tick rate — `LockstepClient.stepSeconds` is 1/30, and that is the clock. */
export const ROOM_TICK_RATE = 30;

/**
 * THE WALL-CLOCK THROTTLE, and why it is a law rather than politeness.
 *
 * A headless sim runs hundreds of times faster than realtime. A seated one must not:
 * the relay rate-limits each player to RATE_LIMIT_MESSAGES (600) per RATE_WINDOW_MS
 * (10_000) — 60 messages a second — and a seat spends one `input` message per tick plus
 * a `hash` every 30 ticks plus a heartbeat every 15 s. Run the loop at the sim's natural
 * speed and the room throws `rate_limited` and closes the socket; the rig is ejected for
 * riding too hard. 45 ticks/s is the ceiling this allows with a quarter of the budget
 * still spare (45 inputs + 1.5 hashes ≈ 46.5/s against 60/s).
 *
 * Lockstep itself would eventually pace the seat — no bundle flushes until every rider's
 * input arrives — but only AFTER the inputs have been sent, which is exactly the traffic
 * being limited. The throttle has to sit in front of the wire, not behind it.
 */
export const SEAT_TICK_RATE_CEILING = 45;
export const MIXED_ROOM_STRICT_MESSAGE = "a headless seat and a browser rider run different engines and would disagree at the first hash — full mixed play arrives with MP-07c, where the agent rides the browser's world";

/**
 * Acts that change WHICH RUN the table is in. `Game.applyMultiplayerActions` breaks out of
 * the bundle for each of these (Game.ts ~2855, via the boolean `applyMultiplayerAction`
 * returns) — they restart, end or suspend the run for everyone. A headless seat can honour
 * none of them, and shrugging one off is not a dropped detail, it is the seat and the table
 * ending up in different runs. Sorted by the criterion, not by the enum.
 */
const UNHONOURABLE_ON_A_SEAT = new Set<string>(['restart', 'death_action', 'secure_choice', 'set_pause']);

/** Beyond this much lag the seat walks back to the room's rate instead of bursting. */
const MAX_LAG_MS = 1_000;
const DEFAULT_START_TIMEOUT_MS = 60_000;
const DEFAULT_STALL_TIMEOUT_MS = 30_000;

const EMPTY_SAMPLE: LockstepSample = {
  mx: 0,
  my: 0,
  confirm: false,
  upgrade: false,
  rotateBuild: false,
  weaponToggle: false,
  build: false,
  cancel: false,
  buildSlot: null,
  restart: false,
  pause: false,
  pauseTarget: null,
  debugSpawn: false,
  debugXp: false,
  queuedActions: [],
};

export type SeatResignation = { reason: string; tick: number; detail?: string };

export type AgentSeatResult = {
  code: string;
  playerId: string | null;
  roster: string[];
  ticks: number;
  wallClockSeconds: number;
  ticksPerSecond: number;
  builds: { placed: number; refused: number };
  unhonouredActions: Record<string, number>;
  lastHash: { tick: number; hash: string } | null;
  resigned: SeatResignation | null;
  outcome: GrSimOutcome | null;
  advisory?: true;
};

type AgentSeatTurn = GrSimTurn & { view: GrSimTurn['view'] & { advisory?: true } };

export type AgentSeatOptions = {
  origin: string;
  code: string;
  player: { name: string; town: string };
  partySize?: number;
  /** Pre-fetched ride setup. Omit and the seat reads it off the relay itself. */
  setup?: MultiplayerSetup;
  /**
   * Corrupts this seat's own hash at one tick so the fail-loud path can be EXERCISED
   * rather than asserted. A desync that has never been made to happen is a claim.
   */
  desyncAtTick?: number | null;
  /** Ticks per wall-clock second. Defaults to the room's rate; capped at the ceiling. */
  tickRate?: number;
  /** Stops the ride after N ticks. Null rides to the run's own end. */
  maxTicks?: number | null;
  startTimeoutMs?: number;
  stallTimeoutMs?: number;
  strict?: boolean;
  onTurn?: (turn: AgentSeatTurn) => void;
  onNotice?: (line: string) => void;
};

export class AgentSeat {
  private readonly pending: LockstepAction[] = [];
  private readonly orders = new SeatOrdersDriver();
  private readonly unhonoured = new Map<string, number>();
  private readonly builds = { placed: 0, refused: 0 };
  private readonly tickRate: number;
  private readonly maxTicks: number | null;
  private readonly startTimeoutMs: number;
  private readonly stallTimeoutMs: number;
  private runState: SeatRunState = { wave: 0, gold: 0 };
  private lastHash: { tick: number; hash: string } | null = null;
  private resignation: SeatResignation | null = null;
  private advisory: boolean;
  private tick = 0;

  private constructor(
    private readonly options: AgentSeatOptions,
    readonly setup: MultiplayerSetup,
    readonly sim: HeadlessContractSim,
    private readonly client: LockstepClient,
    advisory: boolean,
  ) {
    this.tickRate = Math.min(SEAT_TICK_RATE_CEILING, Math.max(1, options.tickRate ?? ROOM_TICK_RATE));
    this.maxTicks = options.maxTicks ?? null;
    this.startTimeoutMs = options.startTimeoutMs ?? DEFAULT_START_TIMEOUT_MS;
    this.stallTimeoutMs = options.stallTimeoutMs ?? DEFAULT_STALL_TIMEOUT_MS;
    this.advisory = advisory;
  }

  /**
   * Takes the chair: reads the ride's setup off the relay, boots the SAME contract and
   * seed every other rider booted, and joins. The setup is fetched rather than declared
   * because the relay refuses a join whose setup differs from the host's — a joiner has
   * to arrive already agreeing, and `inspect` is where that agreement is published.
   */
  static async take(options: AgentSeatOptions): Promise<AgentSeat> {
    const room = await fetchRoomInfo(options.origin, options.code);
    const setup = options.setup ?? room.setup;
    const advisory = room.roster.some((player) => player.client === 'browser');
    if (advisory && options.strict) throw new Error(MIXED_ROOM_STRICT_MESSAGE);
    const sim = new HeadlessContractSim({ contractId: setup.contractId, seed: setup.seed });
    // The client needs a desync hook and the hook needs the seat, so the callback is
    // late-bound. Nothing can fire it before `connect()` below.
    let seated: AgentSeat | null = null;
    const client = new LockstepClient({
      relayBase: trimOrigin(options.origin),
      code: options.code,
      player: { ...options.player, name: advisory ? scoutName(options.player.name) : options.player.name },
      client: 'headless',
      partySize: options.partySize ?? 2,
      setup,
      desyncAtTick: options.desyncAtTick ?? null,
      onDesync: (tick) => seated?.noteDesync(tick),
      exchangeHashes: () => seated?.advisory !== true,
      // A headless seat holds no run-suspend snapshot, so it can neither heal a peer
      // nor be healed by one. Saying so plainly beats a silent restore that lies.
      onSnapshot: () => false,
    });
    const seat = new AgentSeat(options, setup, sim, client, advisory);
    seated = seat;
    await client.connect();
    if (advisory) seat.options.onNotice?.('scout mode: builds still travel, this seat\'s view is approximate, and determinism hashes are off');
    seat.emitTurn();
    return seat;
  }

  /** The desync hook. A hash that stopped matching the table ends the ride, loudly. */
  noteDesync(tick: number): void {
    this.resign(
      'desync',
      `a peer's determinism hash disagreed with this seat's at tick ${tick} `
        + `(this engine is ${SEAT_HASH_ENGINE}; a browser rider hashes a run-suspend snapshot instead, `
        + 'so engine-crossed rooms disagree by construction)',
    );
  }

  /** The rider's door. Rejections are the driver's, verbatim — see `SeatOrders`. */
  submitOrders(value: unknown): SeatOrdersVerdict {
    const verdict = this.orders.submit(value);
    if (verdict.ok) this.pending.push(...this.orders.fire(this.runState));
    return verdict;
  }

  async ride(): Promise<AgentSeatResult> {
    const stepMs = 1000 / this.tickRate;
    const startedAt = performance.now();
    let dueAt = performance.now();
    let lastBundleAt = performance.now();
    let ticks = 0;

    try {
      while (this.resignation === null) {
        const now = performance.now();
        if (now < dueAt) await sleep(dueAt - now);
        dueAt += stepMs;
        if (performance.now() - dueAt > MAX_LAG_MS) dueAt = performance.now();

        this.updateRoomMode();
        const error = this.client.state().error;
        if (error) {
          this.resign('relay_error', error);
          break;
        }

        // OUR socket dropped, not a slow peer. `beginReconnect` clears `error` and pauses,
        // so the stall timer below would otherwise wait out 30s and then blame the room.
        // A headless seat cannot rejoin anyway — it holds no run-suspend snapshot, so both
        // of LockstepClient's restore branches end in failSession — which makes waiting
        // dead time AND the reason wrong. Say the true thing immediately.
        if (this.client.state().reconnecting) {
          this.resign('connection_lost', 'this seat holds no run-suspend snapshot, so it cannot rejoin the ride it dropped out of');
          break;
        }

        const bundle = this.client.pump({ ...EMPTY_SAMPLE, queuedActions: this.pending.splice(0) });
        if (!bundle) {
          const idleMs = performance.now() - lastBundleAt;
          const budget = ticks === 0 ? this.startTimeoutMs : this.stallTimeoutMs;
          if (idleMs > budget) {
            this.resign(ticks === 0 ? 'room_never_started' : 'peer_stalled', `${Math.round(idleMs)}ms without a tick bundle`);
          }
          continue;
        }

        lastBundleAt = performance.now();
        this.tick = bundle.tick;
        this.consume(bundle);
        this.sim.advanceOneTick();
        ticks += 1;
        if (this.client.shouldExchangeHash(bundle.tick)) {
          // `lastHash` is what this seat COMPUTED. Under --desync-at the client transmits
          // `${hash}:injected` instead, so the two deliberately differ there — and that is
          // the useful reading: it shows the sims still agreed and only the wire lied.
          const hash = this.sim.tickHash(bundle.tick);
          this.lastHash = { tick: bundle.tick, hash };
          this.client.afterSimTick(bundle.tick, hash, null);
        }
        if (this.sim.turnDue()) this.emitTurn();
        if (this.sim.isTerminal) break;
        if (this.maxTicks !== null && ticks >= this.maxTicks) break;
      }
    } finally {
      this.client.dispose();
    }

    const wallClockSeconds = (performance.now() - startedAt) / 1000;
    const state = this.client.state();
    return {
      code: state.code,
      playerId: state.playerId,
      roster: state.roster.map((player) => `${player.name} of ${player.town}`),
      ticks,
      wallClockSeconds: round(wallClockSeconds, 3),
      ticksPerSecond: round(ticks / Math.max(0.001, wallClockSeconds), 2),
      builds: { ...this.builds },
      unhonouredActions: Object.fromEntries([...this.unhonoured.entries()].sort()),
      lastHash: this.lastHash,
      resigned: this.resignation,
      // Only a run that actually ended, at a seat that never resigned, has an outcome.
      // BOTH clauses are load-bearing: a desync detected on the very tick that ends the
      // run resigns and breaks in the same iteration, so a terminality-only test would
      // hand back a real-looking verdict alongside exit 3. A seat stopped by --max-ticks
      // reports its last determinism hash instead of inventing one.
      outcome: this.resignation === null && this.sim.isTerminal ? this.sim.outcome() : null,
      ...(this.advisory ? { advisory: true as const } : {}),
    };
  }

  dispose(): void {
    this.client.dispose();
  }

  /**
   * Every rider's input, in roster order — the relay sorts the roster by join time, so
   * that order is the same at every seat and the application order is deterministic.
   *
   * A browser rider speaks a wider vocabulary than a headless sim can honour, and the
   * whole point of tallying the difference is that a silently-dropped peer input desyncs
   * the room at the next hash with nobody able to say which one did it. So NOTHING leaves
   * here uncounted — including movement, which is the highest-frequency thing on the wire
   * and has no home in this sim (`HeadlessContractSim` walks its hero on IDLE_INTENTS).
   */
  private consume(bundle: LockstepTick): void {
    const byPlayer = new Map(bundle.inputs.map((entry) => [entry.playerId, entry.input]));
    for (const player of bundle.roster) {
      const input = byPlayer.get(player.playerId);
      if (input && (input.mx !== 0 || input.my !== 0)) this.tally('move');
      for (const action of input?.actions ?? []) {
        if (action.type === 'place_build') {
          if (this.sim.applyWireAction(action)) this.builds.placed += 1;
          else this.builds.refused += 1;
          continue;
        }
        this.tally(action.type);
        // A run-transition act is not merely unhonoured, it is UNHONOURABLE: `Game.ts`
        // cancels the rest of the bundle and changes what run everyone is in, so a seat
        // that shrugged and rode on would be simulating a run the table has left. That is
        // the zombie rider this whole slice exists to make impossible — resign instead.
        if (UNHONOURABLE_ON_A_SEAT.has(action.type)) {
          this.resign(
            'unhonourable_peer_act',
            `${player.name} sent "${action.type}" at tick ${bundle.tick}; it changes the run and a headless seat has no way to follow`,
          );
          return;
        }
      }
    }
  }

  private tally(key: string): void {
    this.unhonoured.set(key, (this.unhonoured.get(key) ?? 0) + 1);
  }

  private emitTurn(): void {
    const turn = this.sim.currentTurn();
    this.runState = { wave: turn.view.now.wave, gold: turn.view.now.gold };
    this.pending.push(...this.orders.fire(this.runState));
    this.options.onTurn?.(this.advisory ? { ...turn, view: { ...turn.view, advisory: true } } : turn);
  }

  private updateRoomMode(): void {
    if (this.advisory || !this.client.state().roster.some((player) => player.client === 'browser')) return;
    if (this.options.strict) return this.resign('mixed_room', MIXED_ROOM_STRICT_MESSAGE);
    this.advisory = true;
    this.options.onNotice?.('browser rider arrived; switching to scout mode (builds still travel, this view is approximate, determinism hashes are off)');
  }

  private resign(reason: string, detail?: string): void {
    if (this.resignation) return;
    this.resignation = { reason, tick: this.tick, detail };
    this.options.onNotice?.(`seat resigned at tick ${this.tick}: ${reason}${detail ? ` — ${detail}` : ''}`);
  }
}

/**
 * Reads the ride's canonical setup. `started` is checked here because the relay's own
 * refusal (`ride_started`) arrives over a websocket AFTER the join — a clear message
 * before the handshake beats a socket that closes for reasons the rider has to decode.
 */
export async function fetchRoomSetup(origin: string, code: string): Promise<MultiplayerSetup> {
  return (await fetchRoomInfo(origin, code)).setup;
}

async function fetchRoomInfo(origin: string, code: string): Promise<{ setup: MultiplayerSetup; roster: MultiplayerPlayer[] }> {
  const response = await fetch(`${trimOrigin(origin)}/api/multiplayer/inspect?code=${encodeURIComponent(code)}`);
  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    setup?: MultiplayerSetup | null;
    started?: boolean;
    error?: string;
    roster?: MultiplayerPlayer[];
  };
  if (!response.ok || !body.ok) throw new Error(`the relay would not open room ${code}: ${body.error ?? `http ${response.status}`}`);
  if (!body.setup) throw new Error(`room ${code} has no ride setup — the host has not picked a contract yet.`);
  if (body.started) throw new Error(`room ${code} already left the post; a seat has to be taken before tick 0.`);
  return { setup: body.setup, roster: body.roster ?? [] };
}

function scoutName(name: string): string {
  return name.endsWith(' (scout)') ? name : `${name.slice(0, 16).trimEnd()} (scout)`;
}

function trimOrigin(origin: string): string {
  return origin.replace(/\/$/, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
