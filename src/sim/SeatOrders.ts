import { isBuildableId } from '../game/buildables';
import type { LockstepAction } from '../mp/LockstepClient';

/**
 * THE SEAT'S STANDING-ORDERS DRIVER.
 *
 * A rig at the table plays by the same standing-orders grammar a rig plays headless
 * with — but a seated rig cannot simply mutate its own sim, because every other rider
 * is running that sim too. Only INPUTS travel on a lockstep wire, so an order has to
 * become an ACT before it can leave this process.
 *
 * The lockstep vocabulary (`LockstepAction`) is a contract, not a suggestion. Of the
 * six standing-order verbs it has a word for exactly one — BUILD, which is
 * `place_build`. The other five are REJECTED here, loudly and by name.
 *
 * That is deliberate. The repo's own law: generator proposes, contract disposes —
 * reject-don't-stretch. Smuggling HARVEST through, say, `place_build.id` would buy a
 * working demo and cost the wire its meaning. The rejection text foreshadows the rung
 * that fixes it instead.
 *
 * WHY THE CONDITION CAN BE EVALUATED HERE: a BUILD order's `when` reads `gold` and
 * `wave` — two numbers every seat in the room already agrees on, because they come out
 * of the shared deterministic sim. So the seat evaluates the condition locally and
 * sends only the DECISION. Nothing is lost: the peers would have computed the same
 * answer from the same state. That is exactly how a human's client works — the human
 * decides, the click travels.
 */

export type SeatBuildCondition = { goldGte: number } | { waveGte: number };

export type SeatBuildOrder = {
  verb: 'BUILD';
  what: string;
  where: { x: number; z: number };
  when: SeatBuildCondition;
};

export type SeatOrdersVerdict =
  | { ok: true; accepted: number }
  | { ok: false; reason: 'INVALID_ARGS' | 'UNSPEAKABLE_ON_THE_WIRE'; message: string };

/** The two shared numbers a BUILD condition reads. Both come from THE VIEW's `now`. */
export type SeatRunState = { wave: number; gold: number };

const MAX_ORDERS = 32;
/** Mirrors `StandingOrders.validateOrder`'s BUILD arm, verb for verb. */
const BUILD_KEYS = ['verb', 'what', 'where', 'when'];

export class SeatOrdersDriver {
  private held: Array<{ order: SeatBuildOrder; fired: boolean }> = [];

  /**
   * Replaces the standing order set (the same replace-not-append semantics
   * `submit_orders` has). Rejects the whole submission if ANY entry cannot ride the
   * wire — a half-accepted order set is a rider believing something it does not have.
   */
  submit(value: unknown): SeatOrdersVerdict {
    if (!Array.isArray(value)) {
      return { ok: false, reason: 'INVALID_ARGS', message: 'orders must be an array.' };
    }
    if (value.length > MAX_ORDERS) {
      return { ok: false, reason: 'INVALID_ARGS', message: `orders may contain at most ${MAX_ORDERS} entries.` };
    }
    const parsed: SeatBuildOrder[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const outcome = parseSeatOrder(value[index], index);
      if (!outcome.ok) return outcome;
      parsed.push(outcome.order);
    }
    this.held = parsed.map((order) => ({ order, fired: false }));
    return { ok: true, accepted: parsed.length };
  }

  /**
   * Turns every held order whose condition the shared state now satisfies into a wire
   * act, exactly once. Called at wave boundaries and on submission — never per frame
   * (THE TWO CLOCKS: the rider commands at inference rate, the room ticks at tick rate,
   * and this seam is the rider's clock, not the room's).
   */
  fire(state: SeatRunState): LockstepAction[] {
    const actions: LockstepAction[] = [];
    for (const entry of this.held) {
      if (entry.fired || !conditionMet(entry.order.when, state)) continue;
      entry.fired = true;
      actions.push({
        type: 'place_build',
        id: entry.order.what,
        position: { x: entry.order.where.x, z: entry.order.where.z },
        rotationSteps: 0,
      });
    }
    return actions;
  }

  /** Orders still waiting on their condition. Reported in the seat's turn envelope. */
  get waiting(): number {
    return this.held.filter((entry) => !entry.fired).length;
  }
}

function conditionMet(condition: SeatBuildCondition, state: SeatRunState): boolean {
  return 'goldGte' in condition ? state.gold >= condition.goldGte : state.wave >= condition.waveGte;
}

/**
 * The two refusals are STRUCTURALLY distinct, not distinguished by reading the prose
 * back. An earlier draft decided the reason by substring-matching its own message —
 * a selector that fails OPEN the first time anyone rewords the copy, silently
 * reclassifying "the door is unbuilt" as "you made a typo". They are different things
 * to a rider: one is worth fixing, the other is worth waiting for.
 */
type ParsedSeatOrder =
  | { ok: true; order: SeatBuildOrder }
  | { ok: false; reason: 'INVALID_ARGS' | 'UNSPEAKABLE_ON_THE_WIRE'; message: string };

function parseSeatOrder(value: unknown, index: number): ParsedSeatOrder {
  if (!isRecord(value) || typeof value.verb !== 'string') return malformed(`orders[${index}] requires a verb.`);
  if (value.verb !== 'BUILD') return unspeakable(index, value.verb);
  const schemaError = malformed(`orders[${index}] does not match the BUILD schema.`);
  if (!exactKeys(value, BUILD_KEYS)) return schemaError;
  if (!isBuildableId(value.what) || !validPos(value.where)) return schemaError;
  const when = validCondition(value.when);
  if (!when) return schemaError;
  return { ok: true, order: { verb: 'BUILD', what: value.what, where: { x: value.where.x, z: value.where.z }, when } };
}

function malformed(message: string): ParsedSeatOrder {
  return { ok: false, reason: 'INVALID_ARGS', message };
}

/**
 * The foreshadowing rejection (§the sea asks for a different science). It names the
 * verb, names why, and names the rung that would fix it — so a rider reading this
 * knows the door is unbuilt rather than broken.
 */
function unspeakable(index: number, verb: string): ParsedSeatOrder {
  return {
    ok: false,
    reason: 'UNSPEAKABLE_ON_THE_WIRE',
    message: `orders[${index}].verb "${verb}" cannot ride the lockstep wire yet. `
      + 'A seated rig may only send acts the shared vocabulary already speaks, and today that is BUILD alone. '
      + 'Panning, repairing and the position verbs command a body the wire has no word for — '
      + 'they wait on a standing-orders act in the lockstep vocabulary itself.',
  };
}

function validCondition(value: unknown): SeatBuildCondition | null {
  if (!isRecord(value)) return null;
  if (exactKeys(value, ['goldGte']) && finiteInRange(value.goldGte, 0, 1_000_000)) return { goldGte: value.goldGte };
  if (exactKeys(value, ['waveGte']) && finiteInRange(value.waveGte, 0, 10_000)) return { waveGte: value.waveGte };
  return null;
}

function validPos(value: unknown): value is { x: number; z: number } {
  return isRecord(value) && exactKeys(value, ['x', 'z']) && Number.isFinite(value.x) && Number.isFinite(value.z);
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function finiteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
