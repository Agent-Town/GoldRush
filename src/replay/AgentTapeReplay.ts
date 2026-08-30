import { applyDifficultyPreset, normalizeDifficultyPreset } from '../game/Balance';
import {
  agentOrdersEventLogHash,
  RUN_TAPE_SIM_VERSION,
  validateRunTape,
  type RunTape,
} from '../game/RunTape';
import { saveMetaProgress } from '../game/MetaProgress';
import { saveResearchState } from '../meta/ResearchTree';
import { stableHash } from '../mp/LockstepClient';
import { isAgentOrdersAction } from '../playbook/PlaybookFormat';
import { FakeStorage } from '../sim/FakeStorage';
import { HeadlessContractSim } from '../sim/HeadlessContractSim';

const FROZEN_STEP_ALLOWANCE = 18_000;

export type AgentTapeReplayResult = {
  eventLogHash: string;
  outcome: { secured: boolean; waves: number; gold: number; timeAlive: number };
  ticks: number;
  engine: 'headless-contract-sim';
};

export type AgentTapeReplayOptions = {
  traceEvery?: number;
  onTrace?: (trace: { step: number; tick: number; hash: string }) => void;
};

export async function replayAgentTape(rawTape: unknown, options: AgentTapeReplayOptions = {}): Promise<AgentTapeReplayResult> {
  const tape = validateRunTape(withoutEngineHash(rawTape));
  if (!tape) throw new Error('malformed tape');
  if (tape.simVersion !== RUN_TAPE_SIM_VERSION) throw new Error('sim version mismatch');
  if (!tape.runStart) throw new Error('legacy tape v1 is unverifiable');
  if (tape.inputLog.streams.length > 0) throw new Error('an agent tape carries no additional streams');

  applyDifficultyPreset(normalizeDifficultyPreset(tape.difficulty));

  const sim = bootDeclaredRun(tape);
  const orders = ordersByTick(tape);
  const applied = new Set<number>();
  let steps = 0;
  while (!sim.isTerminal && steps < tape.inputLog.durationTicks + FROZEN_STEP_ALLOWANCE) {
    const tick = sim.replayTick;
    if (!applied.has(tick)) {
      for (const order of orders.get(tick) ?? []) sim.submitOrders(order);
      applied.add(tick);
    }
    if (options.traceEvery && steps % options.traceEvery === 0) {
      options.onTrace?.({ step: steps, tick, hash: sim.tickHash(steps) });
    }
    sim.advanceOneTick();
    steps += 1;
  }
  if (!sim.isTerminal) throw new Error(`tape ran out after ${steps} steps with the run still alive`);
  const unreached = [...orders.keys()].filter((tick) => !applied.has(tick));
  if (unreached.length) throw new Error(`the run ended before tick ${unreached[0]} of the order stream`);
  const outcome = sim.outcome();
  return {
    eventLogHash: agentOrdersEventLogHash(sim.standingOrdersSnapshot()),
    outcome: {
      secured: outcome.secured,
      waves: outcome.waves,
      gold: outcome.gold,
      timeAlive: outcome.timeMs / 1000,
    },
    ticks: steps,
    engine: 'headless-contract-sim',
  };
}

function withoutEngineHash(tape: unknown): unknown {
  if (!tape || typeof tape !== 'object' || Array.isArray(tape)) return tape;
  const meta = Reflect.get(tape, 'meta');
  const keys = meta && typeof meta === 'object' && !Array.isArray(meta)
    ? Object.keys(meta).sort().join(',')
    : '';
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)
    || (keys !== 'buildId,engineHash' && keys !== 'buildId,engineHash,era')
    || typeof Reflect.get(meta, 'engineHash') !== 'string'
    || !/^[a-f0-9]{64}$/.test(Reflect.get(meta, 'engineHash') as string)) return tape;
  return { ...tape, meta: { buildId: Reflect.get(meta, 'buildId') } };
}

function bootDeclaredRun(tape: RunTape): HeadlessContractSim {
  const boot = { contractId: tape.contract, seed: tape.seed };
  const declared = stableHash(tape.runStart);
  const virgin = new HeadlessContractSim(boot);
  if (stableHash(virgin.runStart) === declared) return virgin;

  const storage = new FakeStorage();
  saveMetaProgress(storage, tape.runStart!.meta);
  saveResearchState(storage, tape.runStart!.research);
  const progressed = new HeadlessContractSim(boot, { storage });
  if (stableHash(progressed.runStart) !== declared) {
    throw new Error('declared runStart is not installable by this door');
  }
  return progressed;
}

function ordersByTick(tape: RunTape): Map<number, unknown[]> {
  const byTick = new Map<number, unknown[]>();
  for (const entry of tape.inputLog.entries) {
    const orders = [];
    for (const action of entry.a) {
      if (!isAgentOrdersAction(action)) throw new Error(`agent tape carries a non-order action: ${'type' in action ? action.type : 'unknown'}`);
      orders.push(action.orders);
    }
    if (orders.length) byTick.set(entry.t, [...(byTick.get(entry.t) ?? []), ...orders]);
  }
  return byTick;
}
