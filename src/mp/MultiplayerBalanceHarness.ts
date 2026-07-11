import { createRng } from '../core/Rng';
import { applyDifficultyPreset, Balance } from '../game/Balance';
import { stableHash as hashStableValue } from './LockstepClient';

const STEP_SECONDS = 1 / 30;
const TELEGRAPH_SECONDS = 2;
const DURATION_SECONDS = Balance.run.secureWave * Balance.waves.waveInterval;
const SEED_COUNT = 9;
const DEFAULT_SEED = 'mp-balance-v1';
const RIDER_COUNTS = [1, 2, 3, 4] as const;
// Mirrors Game.MULTIPLAYER_SPAWN_RADIUS; included in the report fingerprint so drift is visible.
const MULTIPLAYER_SPAWN_RADIUS = 1.2;

type RiderCount = (typeof RIDER_COUNTS)[number];

export type MultiplayerBalanceRow = {
  riderCount: RiderCount;
  survival: {
    medianSeconds: number;
    minSeconds: number;
    maxSeconds: number;
    censoredRuns: number;
    delta: number;
  };
  gold: {
    teamPerMinute: number;
    teamDelta: number;
    perRiderPerMinute: number;
    perRiderDelta: number;
  };
};

export type MultiplayerBalanceReport = {
  seed: string;
  stepSeconds: number;
  durationSeconds: number;
  seedCorpus: string[];
  assumptions: {
    difficultyPreset: 'trail';
    contract: 'The Claim';
    survivalEndsAt: 'first-rider-death';
    harvest: 'single-shared-progress-channel';
    harvestRiderEffect: 'rider-count-improves-uptime-not-progress-rate';
    harvestAvailability: 'seeded-58-to-72-percent-duty-cycles';
    aggregation: 'median-over-common-seed-corpus';
    combatResolution: 'stationary-instant-hit-base-spark-rig-at-range';
    riderFormation: 'solo-centered-multiplayer-1.2-radius';
    waveSpawns: 'seeded-distinct-edges-with-live-group-spread';
    enemyTargeting: 'nearest-stationary-rider-from-seeded-edge-spawn';
    goldAccounting: 'gross-panned-no-bank-cap';
    enemyRoster: 'base-claim-jumpers-no-variants-or-baron';
    excluded: readonly ['upgrades', 'buildings', 'prospector', 'candidate-rider-scaling'];
  };
  balanceFingerprint: string;
  rows: MultiplayerBalanceRow[];
  stableHash: string;
};

export type MultiplayerBalanceWindow =
  | { ok: true; result: MultiplayerBalanceReport }
  | { ok: false; error: string };

type Threat = {
  id: number;
  hp: number;
  rangeAt: number;
  contactAt: number;
  nextHitAt: number;
  target: number;
};

type SpawnEdge = (typeof Balance.waves.spawnEdges)[number];
type SpawnEvent = { at: number; wave: number; count: number; edge: SpawnEdge };
type Point = { x: number; z: number };

type MutableDifficultyBalance = {
  enemy: { hp: number };
  xp: { perKill: number };
  offers: { investBonus: number };
  steal: { maxConcurrent: number; maxConcurrentCap: number };
  wreck: { hp: { palisade: number } };
  upgrades: { doubleTapCoilMaxStacks: number };
};

export function runMultiplayerBalanceHarness(options: { seed?: string } = {}): MultiplayerBalanceReport {
  const previousDifficulty = captureDifficultyBalance();
  try {
    applyDifficultyPreset('trail');
    return buildReport(options.seed?.trim() || DEFAULT_SEED);
  } finally {
    restoreDifficultyBalance(previousDifficulty);
  }
}

function buildReport(seed: string): MultiplayerBalanceReport {
  const seedCorpus = Array.from({ length: SEED_COUNT }, (_, index) => `${seed}:${index + 1}`);
  const samples = RIDER_COUNTS.map((riderCount) => ({
    riderCount,
    survival: seedCorpus.map((runSeed) => runSurvival(riderCount, runSeed)),
    gold: seedCorpus.map((runSeed) => runGold(riderCount, runSeed)),
  }));
  const soloSurvival = median(samples[0].survival);
  const soloTeamGold = median(samples[0].gold);
  const soloPerRiderGold = soloTeamGold;
  const rows = samples.map(({ riderCount, survival, gold }): MultiplayerBalanceRow => {
    const survivalMedian = median(survival);
    const teamGold = median(gold);
    const perRiderGold = teamGold / riderCount;
    return {
      riderCount,
      survival: {
        medianSeconds: round(survivalMedian, 3),
        minSeconds: round(Math.min(...survival), 3),
        maxSeconds: round(Math.max(...survival), 3),
        censoredRuns: survival.filter((seconds) => seconds >= DURATION_SECONDS).length,
        delta: relativeDelta(survivalMedian, soloSurvival),
      },
      gold: {
        teamPerMinute: round(teamGold, 6),
        teamDelta: relativeDelta(teamGold, soloTeamGold),
        perRiderPerMinute: round(perRiderGold, 6),
        perRiderDelta: relativeDelta(perRiderGold, soloPerRiderGold),
      },
    };
  });
  const report = {
    seed,
    stepSeconds: STEP_SECONDS,
    durationSeconds: DURATION_SECONDS,
    seedCorpus,
    assumptions: {
      difficultyPreset: 'trail' as const,
      contract: 'The Claim' as const,
      survivalEndsAt: 'first-rider-death' as const,
      harvest: 'single-shared-progress-channel' as const,
      harvestRiderEffect: 'rider-count-improves-uptime-not-progress-rate' as const,
      harvestAvailability: 'seeded-58-to-72-percent-duty-cycles' as const,
      aggregation: 'median-over-common-seed-corpus' as const,
      combatResolution: 'stationary-instant-hit-base-spark-rig-at-range' as const,
      riderFormation: 'solo-centered-multiplayer-1.2-radius' as const,
      waveSpawns: 'seeded-distinct-edges-with-live-group-spread' as const,
      enemyTargeting: 'nearest-stationary-rider-from-seeded-edge-spawn' as const,
      goldAccounting: 'gross-panned-no-bank-cap' as const,
      enemyRoster: 'base-claim-jumpers-no-variants-or-baron' as const,
      excluded: ['upgrades', 'buildings', 'prospector', 'candidate-rider-scaling'] as const,
    },
    balanceFingerprint: hashStableValue(balanceInputs()),
    rows,
  };

  return { ...report, stableHash: hashStableValue(report) };
}

export function installMultiplayerBalanceHarnessFromSearch(search = window.location.search): void {
  const params = new URLSearchParams(search);
  if (!params.has('debug') || !params.has('mpbalance')) return;

  try {
    window.__GR_MP_BALANCE__ = {
      ok: true,
      result: runMultiplayerBalanceHarness({ seed: params.get('seed') ?? undefined }),
    };
  } catch (error) {
    window.__GR_MP_BALANCE__ = { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function runSurvival(riderCount: RiderCount, seed: string): number {
  const rng = createRng(`${seed}:combat:spawn`);
  const schedule = spawnSchedule(createRng(`${seed}:combat:schedule`));
  const hp = Array<number>(riderCount).fill(Balance.hero.maxHp);
  const iframes = Array<number>(riderCount).fill(0);
  const cooldowns = Array<number>(riderCount).fill(0);
  const riderPositions = riderFormation(riderCount);
  const threats: Threat[] = [];
  let spawnIndex = 0;
  let threatId = 0;

  for (let tick = 0; tick <= DURATION_SECONDS / STEP_SECONDS; tick += 1) {
    const at = tick * STEP_SECONDS;
    for (let rider = 0; rider < riderCount; rider += 1) {
      iframes[rider] = Math.max(0, iframes[rider] - STEP_SECONDS);
      cooldowns[rider] -= STEP_SECONDS;
    }

    while (spawnIndex < schedule.length && schedule[spawnIndex].at <= at + 1e-9) {
      const event = schedule[spawnIndex];
      for (let enemy = 0; enemy < event.count && threats.length < Balance.waves.aliveCap; enemy += 1) {
        const speedScale = Math.min(
          Balance.waves.speedScaleCap,
          Math.pow(Balance.waves.speedScalePerWave, event.wave) * rng.range(1 - Balance.enemy.speedVariance, 1 + Balance.enemy.speedVariance),
        );
        const speed = Balance.enemy.speed * speedScale;
        const spawn = seededEdgeSpawn(event.edge, enemy, event.count, rng);
        const target = nearestRider(riderPositions, spawn);
        const targetPosition = riderPositions[target];
        const distance = Math.hypot(spawn.x - targetPosition.x, spawn.z - targetPosition.z);
        const contactAt = event.at + distance / speed;
        threats.push({
          id: threatId,
          hp: Balance.enemy.hp * Math.pow(Balance.waves.hpScalePerWave, event.wave),
          rangeAt: event.at + Math.max(0, distance - Balance.sparkRig.range) / speed,
          contactAt,
          nextHitAt: contactAt,
          target,
        });
        threatId += 1;
      }
      spawnIndex += 1;
    }

    for (const threat of threats) {
      if (threat.hp <= 0 || threat.contactAt > at) continue;
      while (threat.nextHitAt <= at + 1e-9) {
        if (iframes[threat.target] <= 0) {
          hp[threat.target] = Math.max(0, hp[threat.target] - Balance.enemy.contactDamage);
          iframes[threat.target] = Balance.hero.iframes;
          if (hp[threat.target] <= 0) return round(at, 3);
        }
        threat.nextHitAt += Balance.enemy.contactCooldown;
      }
    }

    for (let rider = 0; rider < riderCount; rider += 1) {
      if (cooldowns[rider] > 0) continue;
      const target = threats
        .filter((threat) => threat.hp > 0 && threat.rangeAt <= at)
        .sort((left, right) => left.contactAt - right.contactAt || left.id - right.id)[0];
      if (!target) {
        cooldowns[rider] = 0;
        continue;
      }
      target.hp -= Balance.sparkRig.damage * Math.max(1, Balance.sparkRig.volley);
      cooldowns[rider] += 1 / Balance.sparkRig.fireRate;
    }

    for (let index = threats.length - 1; index >= 0; index -= 1) {
      if (threats[index].hp <= 0) threats.splice(index, 1);
    }
  }

  return DURATION_SECONDS;
}

function riderFormation(riderCount: RiderCount): Point[] {
  if (riderCount === 1) return [{ x: 0, z: 0 }];
  return Array.from({ length: riderCount }, (_, slot) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * slot) / riderCount;
    return {
      x: Math.cos(angle) * MULTIPLAYER_SPAWN_RADIUS,
      z: Math.sin(angle) * MULTIPLAYER_SPAWN_RADIUS,
    };
  });
}

function seededEdgeSpawn(
  edge: SpawnEdge,
  index: number,
  groupCount: number,
  rng: ReturnType<typeof createRng>,
): Point {
  const spread = (index - 0.5 * Math.max(0, groupCount - 1)) * 1.35;
  const lateral = spread + rng.range(-1.2, 1.2);
  const radius = Balance.waves.spawnRingRadius;
  if (edge === 'north') return { x: lateral, z: radius };
  if (edge === 'south') return { x: lateral, z: -radius };
  if (edge === 'east') return { x: radius, z: lateral };
  return { x: -radius, z: lateral };
}

function nearestRider(riders: readonly Point[], spawn: Point): number {
  let nearest = 0;
  let nearestDistanceSq = Number.POSITIVE_INFINITY;
  for (let rider = 0; rider < riders.length; rider += 1) {
    const dx = riders[rider].x - spawn.x;
    const dz = riders[rider].z - spawn.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq < nearestDistanceSq) {
      nearest = rider;
      nearestDistanceSq = distanceSq;
    }
  }
  return nearest;
}

function runGold(riderCount: RiderCount, seed: string): number {
  const nodeRng = createRng(`${seed}:harvest:nodes`);
  const activeNodes = nodeRng.int(Balance.goldSeam.activeMin, Balance.goldSeam.activeMax + 1);
  const nodes = Array.from({ length: activeNodes }, () => ({ remaining: Balance.goldSeam.capacity, respawnAt: 0 }));
  const riders = Array.from({ length: riderCount }, (_, rider) => {
    const rng = createRng(`${seed}:harvest:rider:${rider}`);
    const cycle = rng.range(7.2, 8.8);
    return { cycle, activeSeconds: cycle * rng.range(0.58, 0.72), phase: rng.range(0, cycle) };
  });
  let channelNode = -1;
  let progress = 0;
  let gold = 0;

  for (let tick = 0; tick < DURATION_SECONDS / STEP_SECONDS; tick += 1) {
    const at = tick * STEP_SECONDS;
    for (const node of nodes) {
      if (node.remaining <= 0 && node.respawnAt <= at) node.remaining = Balance.goldSeam.capacity;
    }
    const channeling = riders.some((rider) => (at + rider.phase) % rider.cycle < rider.activeSeconds);
    if (!channeling) {
      progress = Math.max(
        0,
        progress - (STEP_SECONDS / Balance.goldSeam.tickSeconds) * Balance.goldSeam.decayMultiplier,
      );
      if (progress === 0) channelNode = -1;
      continue;
    }

    if (channelNode < 0 || nodes[channelNode].remaining <= 0) channelNode = nodes.findIndex((node) => node.remaining > 0);
    if (channelNode < 0) continue;
    progress = Math.min(1, progress + STEP_SECONDS / Balance.goldSeam.tickSeconds);
    while (progress >= 1 && channelNode >= 0) {
      const node = nodes[channelNode];
      const gained = Math.min(Balance.goldSeam.tickGold, node.remaining);
      gold += gained;
      node.remaining -= gained;
      progress -= 1;
      if (node.remaining <= 0) {
        node.respawnAt = at + Balance.goldSeam.respawnSeconds;
        channelNode = -1;
        progress = 0;
      }
    }
  }

  return (gold / DURATION_SECONDS) * 60;
}

function spawnSchedule(rng: ReturnType<typeof createRng>): SpawnEvent[] {
  const events: SpawnEvent[] = [];
  for (let wave = 1; wave * Balance.waves.waveInterval < DURATION_SECONDS; wave += 1) {
    const lullSeconds = lullSecondsFor(wave);
    const pulses = effectivePulsesPerWave(wave);
    const edges = Math.max(1, Math.min(Balance.waves.spawnEdges.length, Math.floor(Balance.waves.edgesPerPulse)));
    const budget = Math.max(pulses * edges, waveBudget(wave));
    const baseCount = Math.floor(budget / (pulses * edges));
    let extra = budget % (pulses * edges);
    for (let pulse = 0; pulse < pulses; pulse += 1) {
      for (const edge of pickEdges(rng, edges)) {
        const count = baseCount + (extra > 0 ? 1 : 0);
        extra = Math.max(0, extra - 1);
        events.push({ at: wave * Balance.waves.waveInterval + pulse * lullSeconds, wave, count, edge });
      }
    }
  }

  let nextTrickle = Balance.waves.graceSeconds + Balance.waves.trickleInterval;
  while (nextTrickle < DURATION_SECONDS) {
    const wave = Math.floor(nextTrickle / Balance.waves.waveInterval);
    const waveStartedAt = wave * Balance.waves.waveInterval;
    const lullSeconds = lullSecondsFor(wave);
    if (wave > 0 && nextTrickle >= waveStartedAt && nextTrickle <= waveStartedAt + lullSeconds) {
      nextTrickle = waveStartedAt + lullSeconds + trickleInterval(nextTrickle);
      continue;
    }
    events.push({ at: nextTrickle, wave, count: 1, edge: pickEdge(rng) });
    nextTrickle += trickleInterval(nextTrickle);
  }

  return events.sort((left, right) => left.at - right.at || right.count - left.count);
}

function pickEdge(rng: ReturnType<typeof createRng>): SpawnEdge {
  return Balance.waves.spawnEdges[rng.int(0, Balance.waves.spawnEdges.length)] ?? 'west';
}

function pickEdges(rng: ReturnType<typeof createRng>, count: number): SpawnEdge[] {
  const available = [...Balance.waves.spawnEdges];
  const edges: SpawnEdge[] = [];
  for (let index = 0; index < count && available.length > 0; index += 1) {
    const edge = available.splice(rng.int(0, available.length), 1)[0];
    if (edge) edges.push(edge);
  }
  return edges;
}

function waveBudget(wave: number): number {
  const linear = Balance.waves.pulseBase + Balance.waves.pulsePerWave * wave;
  const kneeWave = Math.max(0, Balance.waves.kneeWave);
  if (wave <= kneeWave) return Math.max(1, Math.round(linear));
  const kneeBudget = Balance.waves.pulseBase + Balance.waves.pulsePerWave * kneeWave;
  const ceiling = Math.max(kneeBudget, Balance.waves.budgetCeiling);
  const excess = Math.max(0, linear - kneeBudget);
  const sharpness = Math.max(0.01, Balance.waves.kneeSharpness);
  const eased = ceiling - (ceiling - kneeBudget) * Math.exp(-excess / sharpness);
  return Math.max(1, Math.round(Math.min(ceiling, eased)));
}

function lullSecondsFor(wave: number): number {
  const base = Math.max(0.1, Balance.waves.lullSeconds);
  return wave >= 12 ? Math.max(base, Balance.waves.lullFloor12) : base;
}

function effectivePulsesPerWave(wave: number): number {
  const requested = Math.max(1, Math.floor(Balance.waves.pulsesPerWave));
  const maxByInterval = Math.max(
    1,
    Math.floor((Balance.waves.waveInterval - TELEGRAPH_SECONDS) / lullSecondsFor(wave)) + 1,
  );
  return Math.min(requested, maxByInterval);
}

function trickleInterval(at: number): number {
  const decaySteps = Math.floor(Math.max(0, at - Balance.waves.graceSeconds) / Balance.waves.trickleDecayEvery);
  return Math.max(Balance.waves.trickleFloor, Balance.waves.trickleInterval * Math.pow(Balance.waves.trickleDecay, decaySteps));
}

function balanceInputs(): unknown {
  return {
    model: {
      multiplayerSpawnRadius: MULTIPLAYER_SPAWN_RADIUS,
      waveSpawns: 'seeded-distinct-edges-with-live-group-spread',
      enemyTargeting: 'nearest-stationary-rider-from-seeded-edge-spawn',
    },
    hero: { maxHp: Balance.hero.maxHp, iframes: Balance.hero.iframes },
    enemy: {
      hp: Balance.enemy.hp,
      speed: Balance.enemy.speed,
      speedVariance: Balance.enemy.speedVariance,
      contactDamage: Balance.enemy.contactDamage,
      contactCooldown: Balance.enemy.contactCooldown,
    },
    sparkRig: {
      damage: Balance.sparkRig.damage,
      fireRate: Balance.sparkRig.fireRate,
      range: Balance.sparkRig.range,
      volley: Balance.sparkRig.volley,
    },
    waves: {
      ...Balance.waves,
      spawnEdges: [...Balance.waves.spawnEdges],
    },
    goldSeam: { ...Balance.goldSeam },
    run: { secureWave: Balance.run.secureWave },
  };
}

function captureDifficultyBalance(): MutableDifficultyBalance {
  const balance = Balance as unknown as MutableDifficultyBalance;
  return {
    enemy: { hp: balance.enemy.hp },
    xp: { perKill: balance.xp.perKill },
    offers: { investBonus: balance.offers.investBonus },
    steal: {
      maxConcurrent: balance.steal.maxConcurrent,
      maxConcurrentCap: balance.steal.maxConcurrentCap,
    },
    wreck: { hp: { palisade: balance.wreck.hp.palisade } },
    upgrades: { doubleTapCoilMaxStacks: balance.upgrades.doubleTapCoilMaxStacks },
  };
}

function restoreDifficultyBalance(previous: MutableDifficultyBalance): void {
  const balance = Balance as unknown as MutableDifficultyBalance;
  balance.enemy.hp = previous.enemy.hp;
  balance.xp.perKill = previous.xp.perKill;
  balance.offers.investBonus = previous.offers.investBonus;
  balance.steal.maxConcurrent = previous.steal.maxConcurrent;
  balance.steal.maxConcurrentCap = previous.steal.maxConcurrentCap;
  balance.wreck.hp.palisade = previous.wreck.hp.palisade;
  balance.upgrades.doubleTapCoilMaxStacks = previous.upgrades.doubleTapCoilMaxStacks;
}

function relativeDelta(value: number, baseline: number): number {
  return baseline === 0 ? 0 : round(value / baseline - 1, 6);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2 : (sorted[middle] ?? 0);
}

function round(value: number, places: number): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
