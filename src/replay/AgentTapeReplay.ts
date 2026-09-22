import { applyDifficultyPreset, normalizeDifficultyPreset } from '../game/Balance';
import {
  agentOrdersEventLogHash,
  RUN_TAPE_SIM_VERSION,
  validateRunTape,
  type RunTape,
} from '../game/RunTape';
import { saveMetaProgress } from '../game/MetaProgress';
import { saveResearchState } from '../meta/ResearchTree';
import { stageReplayContract } from '../meta/ContractFamilies';
import { stableHash } from '../mp/LockstepClient';
import { isAgentOrdersAction } from '../playbook/PlaybookFormat';
import { FakeStorage } from '../sim/FakeStorage';
import { HeadlessContractSim } from '../sim/HeadlessContractSim';

const FROZEN_STEP_ALLOWANCE = 18_000;

export type AgentTapeReplayResult = {
  eventLogHash: string;
  outcome: { secured: boolean; waves: number; gold: number; timeAlive: number };
  securedSnapshot?: { waves: number; gold: number; timeAlive: number };
  // THE MECHANIC THE MAP IS ABOUT (F-HEAT15-4, owner ruling 2026-09-22 (a)). Absent on every
  // contract that declares no signature mechanic, which is every map but the Regatta today; the
  // declaration itself lives in ONE table, `HeadlessContractSim.MECHANIC_OUTCOMES`.
  mechanic?: { id: string; complete: boolean };
  ticks: number;
  engine: 'headless-contract-sim';
};

export type AgentTapeReplaySnapshot = {
  contract: { id: string; tileId: string; width: number; height: number };
  tick: number;
  wave: number;
  timeAlive: number;
  gold: number;
  hero: { x: number; z: number; hp: number; maxHp: number; alive: boolean };
  rider: { x: number; z: number } | null;
  enemies: Array<{ id: number; kind: string; x: number; z: number; hp: number; maxHp: number; alive: boolean }>;
  works: Array<{ id: string; index: number; x: number; z: number; hp: number; maxHp: number; wrecked: boolean }>;
  seams: Array<{ id: string; x: number; z: number; remaining: number }>;
  pickups: Array<{ index: number; x: number; z: number; amount: number }>;
};

export type AgentTapeReplayOptions = {
  traceEvery?: number;
  onTrace?: (trace: { step: number; tick: number; hash: string }) => void;
};

export async function replayAgentTape(rawTape: unknown, options: AgentTapeReplayOptions = {}): Promise<AgentTapeReplayResult> {
  const replay = new AgentTapeReplaySession(rawTape);
  let steps = 0;
  while (!replay.complete && steps < replay.durationTicks + FROZEN_STEP_ALLOWANCE) {
    if (options.traceEvery && steps % options.traceEvery === 0) {
      options.onTrace?.({ step: steps, tick: replay.tick, hash: replay.tickHash(steps) });
    }
    replay.advanceOneTick();
    steps += 1;
  }
  return replay.result();
}

export class AgentTapeReplaySession {
  readonly durationTicks: number;
  private readonly sim: HeadlessContractSim;
  private readonly orders: Map<number, unknown[]>;
  private readonly applied = new Set<number>();
  private readonly recentEnemies = new Map<number, AgentTapeReplaySnapshot['enemies'][number] & { lastSeen: number }>();
  private steps = 0;

  constructor(rawTape: unknown) {
    const tape = validateRunTape(withoutEngineHash(rawTape));
    if (!tape) throw new Error('malformed tape');
    if (tape.simVersion !== RUN_TAPE_SIM_VERSION) throw new Error('sim version mismatch');
    if (!tape.runStart) throw new Error('legacy tape v1 is unverifiable');
    if (tape.inputLog.streams.length > 0) throw new Error('an agent tape carries no additional streams');

    applyDifficultyPreset(normalizeDifficultyPreset(tape.difficulty));
    stageReplayContract(tape.contract);
    this.durationTicks = tape.inputLog.durationTicks;
    this.sim = bootDeclaredRun(tape);
    this.orders = ordersByTick(tape);
  }

  get tick(): number { return this.sim.replayTick; }
  get complete(): boolean { return this.sim.isTerminal; }
  tickHash(step = this.steps): string { return this.sim.tickHash(step); }

  advanceOneTick(): void {
    if (this.complete) return;
    const tick = this.tick;
    if (!this.applied.has(tick)) {
      for (const order of this.orders.get(tick) ?? []) this.sim.submitOrders(order);
      this.applied.add(tick);
    }
    this.sim.advanceOneTick();
    this.steps += 1;
  }

  advanceTo(targetTick: number, stopAfterWave?: number): AgentTapeReplaySnapshot {
    const ceiling = this.durationTicks + FROZEN_STEP_ALLOWANCE;
    while (!this.complete && this.tick < targetTick && this.steps < ceiling) {
      this.advanceOneTick();
      if (stopAfterWave !== undefined && this.snapshot().wave >= stopAfterWave) break;
    }
    return this.snapshot();
  }

  resumeAt(targetTick: number): HeadlessContractSim {
    if (!Number.isSafeInteger(targetTick) || targetTick < 0 || targetTick > this.durationTicks) {
      throw new Error(`resume tick must be an integer between 0 and ${this.durationTicks}`);
    }
    this.advanceTo(targetTick);
    if (this.tick !== targetTick) throw new Error(`tape ended at tick ${this.tick} before resume tick ${targetTick}`);
    return this.sim;
  }

  snapshot(): AgentTapeReplaySnapshot {
    const internal = this.sim as unknown as {
      hero: { group: { position: { x: number; z: number } }; hp: number; maxHp: number };
      prospector: { snapshot: { position: { x: number; z: number } } };
      enemies: { all: Array<{
        id: number; isAlive: boolean; currentHp: number; maxHp: number; position: { x: number; z: number };
        variantId: string | null; variantLabel: string | null; eliteKind: string | null; isThief: boolean; isWrecker: boolean;
      }> };
      build: { diagnostics: { hp: AgentTapeReplaySnapshot['works'] extends Array<infer T> ? Array<T & { position: { x: number; z: number } }> : never } };
      harvest: { snapshot: { activeNodes: Array<{ id: string; active: boolean; position: { x: number; z: number }; remaining: number }> } };
      goldPickups: { snapshot(): Array<{ active: boolean; amount: number; position: { x: number; z: number } }> } | null;
      economy: { gold: number };
      waves: { diagnostics: { wave: number } };
      timeAlive: number;
    };
    const aliveIds = new Set<number>();
    for (const enemy of internal.enemies.all) {
      if (!enemy.isAlive) continue;
      aliveIds.add(enemy.id);
      this.recentEnemies.set(enemy.id, {
        id: enemy.id,
        kind: enemy.variantLabel ?? enemy.variantId ?? enemy.eliteKind ?? (enemy.isWrecker ? 'wrecker' : enemy.isThief ? 'thief' : 'claim_jumper'),
        x: enemy.position.x,
        z: enemy.position.z,
        hp: enemy.currentHp,
        maxHp: enemy.maxHp,
        alive: true,
        lastSeen: this.tick,
      });
    }
    for (const [id, enemy] of this.recentEnemies) {
      if (!aliveIds.has(id) && enemy.alive) this.recentEnemies.set(id, { ...enemy, hp: 0, alive: false });
      if (!aliveIds.has(id) && this.tick - enemy.lastSeen > 15) this.recentEnemies.delete(id);
    }
    return {
      contract: {
        id: this.sim.manifest.id,
        tileId: this.sim.manifest.tileParams.tileId,
        width: this.sim.manifest.tileParams.dimensions?.width ?? this.sim.manifest.tileParams.size ?? 64,
        height: this.sim.manifest.tileParams.dimensions?.height ?? this.sim.manifest.tileParams.size ?? 64,
      },
      tick: this.tick,
      wave: internal.waves.diagnostics.wave,
      timeAlive: internal.timeAlive,
      gold: internal.economy.gold,
      hero: {
        x: internal.hero.group.position.x,
        z: internal.hero.group.position.z,
        hp: internal.hero.hp,
        maxHp: internal.hero.maxHp,
        alive: internal.hero.hp > 0,
      },
      rider: internal.prospector?.snapshot?.position
        ? { x: internal.prospector.snapshot.position.x, z: internal.prospector.snapshot.position.z }
        : null,
      enemies: [...this.recentEnemies.values()].map(({ lastSeen: _lastSeen, ...enemy }) => enemy),
      works: internal.build.diagnostics.hp.map((work) => ({
        id: work.id,
        index: work.index,
        x: work.position.x,
        z: work.position.z,
        hp: work.hp,
        maxHp: work.maxHp,
        wrecked: work.wrecked,
      })),
      seams: internal.harvest.snapshot.activeNodes
        .filter((node) => node.active)
        .map((node) => ({ id: node.id, x: node.position.x, z: node.position.z, remaining: node.remaining })),
      pickups: (internal.goldPickups?.snapshot() ?? []).flatMap((pickup, index) => pickup.active
        ? [{ index, x: pickup.position.x, z: pickup.position.z, amount: pickup.amount }]
        : []),
    };
  }

  result(): AgentTapeReplayResult {
    if (!this.complete) throw new Error(`tape ran out after ${this.steps} steps with the run still alive`);
    const unreached = [...this.orders.keys()].filter((tick) => !this.applied.has(tick));
    if (unreached.length) throw new Error(`the run ended before tick ${unreached[0]} of the order stream`);
    const outcome = this.sim.outcome();
    const securedSnapshot = this.sim.bankedSecuredSnapshot;
    // Read at the END of the replay, off the sim's own terminal state — no clock, no randomness,
    // no second source — so two replays of one reel report the same mechanic or the reel was
    // never deterministic to begin with (F-HEAT15-4).
    const mechanic = this.sim.mechanicOutcome();
    return {
      eventLogHash: agentOrdersEventLogHash(this.sim.standingOrdersSnapshot()),
      outcome: {
        secured: outcome.secured,
        waves: outcome.waves,
        gold: outcome.gold,
        timeAlive: outcome.timeMs / 1000,
      },
      ...(securedSnapshot ? { securedSnapshot } : {}),
      ...(mechanic ? { mechanic } : {}),
      ticks: this.steps,
      engine: 'headless-contract-sim',
    };
  }
}

function withoutEngineHash(tape: unknown): unknown {
  if (!tape || typeof tape !== 'object' || Array.isArray(tape)) return tape;
  const meta = Reflect.get(tape, 'meta');
  const keys = meta && typeof meta === 'object' && !Array.isArray(meta)
    ? Object.keys(meta).sort().join(',')
    : '';
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)
    || (keys !== 'buildId,engineHash' && keys !== 'buildId,engineHash,era' && keys !== 'buildId,engineHash,era,viewVersion')
    || typeof Reflect.get(meta, 'engineHash') !== 'string'
    || !/^[a-f0-9]{64}$/.test(Reflect.get(meta, 'engineHash') as string)) return tape;
  return { ...tape, meta: {
    buildId: Reflect.get(meta, 'buildId'),
    ...(Reflect.has(meta, 'viewVersion') ? { viewVersion: Reflect.get(meta, 'viewVersion') } : {}),
  } };
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
