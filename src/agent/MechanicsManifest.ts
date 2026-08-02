import { loadContract, type ContractManifest } from '../meta/ContractFamilies';

type MechanicValue = boolean | number | string | readonly string[];

export type MechanicsManifest = {
  schema: 'goldrush.mechanics.v1';
  contractId: string;
  interactables: readonly {
    id: string;
    count: number;
    operations: readonly string[];
    source: 'tileParams.prePlacedBuildables' | 'practice.stations' | 'practice.targets';
  }[];
  rules: readonly {
    id: string;
    source: string;
    data: Readonly<Record<string, MechanicValue>>;
  }[];
  posting: {
    waves: readonly { event: string; wave: number; source: string }[];
    spawnEdges: readonly string[];
    lossStakes: readonly { id: string; x: number; z: number; source: 'tileParams.stakeMarkers' }[];
  };
};

export function deriveMechanicsManifest(contractId: string): MechanicsManifest;
export function deriveMechanicsManifest(contract: ContractManifest): MechanicsManifest;
export function deriveMechanicsManifest(source: string | ContractManifest): MechanicsManifest {
  const contract = typeof source === 'string' ? loadContract(source) : source;
  const rules: MechanicsManifest['rules'][number][] = [];
  const tile = contract.tileParams;
  const twist = contract.twist;
  const practice = contract.practice;

  if (tile.river) rules.push(rule('river', 'tileParams.river'));
  if (tile.ford) {
    rules.push(rule('water_crossings', 'tileParams.ford', {
      count: tile.fords?.length ?? 1,
      ids: tile.fords?.map(({ id }) => id).sort() ?? [],
    }));
  }
  if (tile.waterSources.length > 0) {
    rules.push(rule('spring_cells', 'tileParams.waterSources', {
      count: tile.waterSources.length,
      kinds: [...new Set(tile.waterSources.map(({ kind }) => kind))].sort(),
    }));
  }
  if (tile.buildZones?.length) {
    rules.push(rule('build_zones', 'tileParams.buildZones', {
      count: tile.buildZones.length,
      banks: [...new Set(tile.buildZones.map(({ bank }) => bank))].sort(),
    }));
  }
  if (twist.seamYieldMult !== undefined) {
    rules.push(rule('seam_yield_multiplier', 'twist.seamYieldMult', { multiplier: twist.seamYieldMult }));
  }
  if (twist.lightRamp) {
    rules.push(rule('darkness_cycle', 'twist.lightRamp', {
      duskWave: twist.lightRamp.duskWave,
      darkWave: twist.lightRamp.darkWave,
      dawnWave: twist.lightRamp.dawnWave,
    }));
  }
  if (twist.enemyLanternClasses?.length) {
    rules.push(rule('enemy_lantern_classes', 'twist.enemyLanternClasses', { classes: [...twist.enemyLanternClasses].sort() }));
  }
  if (twist.waveCadenceMult !== undefined) {
    rules.push(rule('wave_cadence_multiplier', 'twist.waveCadenceMult', { multiplier: twist.waveCadenceMult }));
  }
  if (twist.baron) {
    rules.push(rule('baron', 'twist.baron', { escortCount: twist.baron.escortCount, hpScale: twist.baron.hpScale }));
    if (twist.baron.rocketVolley) {
      rules.push(rule('rocket_volley', 'twist.baron.rocketVolley', {
        count: twist.baron.rocketVolley.count,
        cadenceSeconds: twist.baron.rocketVolley.cadenceSeconds,
      }));
    }
  }
  if (practice) {
    const suppressed = Object.entries(practice)
      .filter(([, value]) => value === false)
      .map(([key]) => key)
      .sort();
    rules.push(rule('ledger_free_practice', 'practice', { suppressed }));
    rules.push(rule('practice_gold_grant', 'practice.goldGrant', { amount: practice.goldGrant }));
    rules.push(rule('drill_wave', 'practice.bellWaveSize', { size: practice.bellWaveSize }));
    rules.push(rule('practice_target_respawn', 'practice.dummyRespawnSeconds', { seconds: practice.dummyRespawnSeconds }));
    rules.push(rule('practice_buildables', 'practice.buildables', { ids: [...practice.buildables].sort() }));
  }

  const waves: MechanicsManifest['posting']['waves'][number][] = [];
  if (practice?.scheduledWaves !== false) {
    if (twist.secureWave !== undefined) waves.push({ event: 'secure', wave: twist.secureWave, source: 'twist.secureWave' });
    if (twist.baron) waves.push({ event: 'baron', wave: twist.baron.wave, source: 'twist.baron.wave' });
  }

  return {
    schema: 'goldrush.mechanics.v1',
    contractId: contract.id,
    interactables: interactables(contract),
    rules: rules.sort(byId),
    posting: {
      waves: waves.sort((left, right) => left.wave - right.wave || compare(left.event, right.event)),
      spawnEdges: [...tile.lanes.spawnEdges].sort(),
      lossStakes: (tile.stakeMarkers ?? [])
        .filter(({ heroStart }) => heroStart)
        .map(({ id, x, z }) => ({ id, x, z, source: 'tileParams.stakeMarkers' as const }))
        .sort(byId),
    },
  };
}

export function mechanicsManifestLine(manifest: MechanicsManifest): string {
  const terms = [
    ...manifest.interactables.map(({ id, count }) => `${humanize(id)}${count === 1 ? '' : 's'}`),
    ...manifest.rules.map(({ id }) => id === 'river' ? 'the river' : humanize(id)),
    ...(manifest.posting.lossStakes.length > 0 ? ['loss stakes'] : []),
  ];
  return `This claim speaks: ${terms.join(', ')}.`;
}

function interactables(contract: ContractManifest): MechanicsManifest['interactables'] {
  const grouped = new Map<string, { count: number; operations: Set<string> }>();
  for (const fixture of contract.tileParams.prePlacedBuildables ?? []) {
    const entry = grouped.get(fixture.id) ?? { count: 0, operations: new Set<string>() };
    entry.count += 1;
    for (const key of Object.keys(fixture)) {
      if (key.endsWith('Cost')) entry.operations.add(toSnakeCase(key.slice(0, -4)));
    }
    if (fixture.wrecked && entry.operations.size === 0) entry.operations.add('repair');
    grouped.set(fixture.id, entry);
  }
  const result: MechanicsManifest['interactables'][number][] = [...grouped]
    .map(([id, { count, operations }]) => ({
      id,
      count,
      operations: [...operations].sort(),
      source: 'tileParams.prePlacedBuildables' as const,
    }));
  if (contract.practice) {
    const stations = new Map<string, { count: number; operations: Set<string> }>();
    for (const station of contract.practice.stations) {
      const entry = stations.get(station.id) ?? { count: 0, operations: new Set<string>() };
      entry.count += 1;
      entry.operations.add(station.op);
      stations.set(station.id, entry);
    }
    result.push(...[...stations].map(([id, { count, operations }]) => ({
      id,
      count,
      operations: [...operations].sort(),
      source: 'practice.stations' as const,
    })));

    const targets = new Map<string, number>();
    for (const target of contract.practice.targets) targets.set(target.kind, (targets.get(target.kind) ?? 0) + 1);
    result.push(...[...targets].map(([kind, count]) => ({
      id: toSnakeCase(kind),
      count,
      operations: ['strike'],
      source: 'practice.targets' as const,
    })));
  }
  return result.sort(byId);
}

function rule(id: string, source: string, data: Readonly<Record<string, MechanicValue>> = {}): MechanicsManifest['rules'][number] {
  return { id, source, data };
}

function humanize(id: string): string {
  return id.replaceAll('_', ' ');
}

function toSnakeCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replaceAll('-', '_').toLowerCase();
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return compare(left.id, right.id);
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
