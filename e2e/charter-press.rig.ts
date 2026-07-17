import type { ContractManifest } from '../src/meta/ContractFamilies';
import { importContract, type Charter } from '../src/charter/CharterSchema';

// Seeded fuzz rig shared by the CP-02 stamp spec and boot spec. Everything is
// deterministic from CHARTER_FUZZ_SEED — no Math.random anywhere — so both
// specs regenerate the identical mutant stream.
export const CHARTER_FUZZ_SEED = 0x60_1d_0c_05;
export const CHARTER_FUZZ_CLOCK = () => '2026-07-17T00:00:00.000Z';

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CharterMutant = {
  index: number;
  templateId: string;
  labels: string[];
  charter: Charter;
};

type JsonRecord = Record<string, unknown>;
type NumericLeaf = { owner: JsonRecord | unknown[]; key: string | number; path: string; value: number };

const AUTHOR = 'Fuzz Press';

export function charterMutants(templates: readonly ContractManifest[], count: number): CharterMutant[] {
  const rng = mulberry32(CHARTER_FUZZ_SEED);
  const mutants: CharterMutant[] = [];
  for (let index = 0; index < count; index += 1) {
    const template = templates[Math.floor(rng() * templates.length)]!;
    const charter = importContract(template, { author: AUTHOR, clock: CHARTER_FUZZ_CLOCK });
    const labels: string[] = [];
    const mutations = 1 + Math.floor(rng() * 2);
    for (let step = 0; step < mutations; step += 1) labels.push(applyMutation(charter, rng));
    mutants.push({ index, templateId: template.id, labels, charter });
  }
  return mutants;
}

function applyMutation(charter: Charter, rng: Rng): string {
  const contract = charter.contract;
  const menu: Array<() => string> = [
    () => {
      contract.name = `${contract.name} (pressed ${1 + Math.floor(rng() * 99)})`;
      return 'legal:rename';
    },
    () => {
      const leaf = pickNumericLeaf(contract, rng);
      if (!leaf) return 'noop';
      const scaled = roundish(leaf.value * (0.6 + rng() * 0.8), leaf.value);
      setLeaf(leaf, scaled);
      return `perturb:${leaf.path}`;
    },
    () => {
      const leaf = pickNumericLeaf(contract, rng);
      if (!leaf) return 'noop';
      setLeaf(leaf, (Math.abs(leaf.value) + 10) * 100_000);
      return `overrange:${leaf.path}`;
    },
    () => {
      contract.briefing.goals[Math.floor(rng() * contract.briefing.goals.length)] = '   ';
      return 'blank:briefing.goal';
    },
    () => {
      contract.tileParams.lanes.spawnEdges = [];
      return 'illegal:spawn-edges-empty';
    },
    () => {
      const edges = contract.tileParams.lanes.spawnEdges;
      if (edges.length > 0) contract.tileParams.lanes.spawnEdges = [...edges, edges[0]!];
      return 'illegal:spawn-edge-duplicate';
    },
    () => {
      const zones = contract.tileParams.buildZones;
      if (!zones || zones.length === 0) return 'noop';
      const zone = zones[Math.floor(rng() * zones.length)]!;
      zone.minX += 500;
      zone.maxX += 500;
      return 'illegal:zone-outside-claim';
    },
    () => {
      (contract as unknown as JsonRecord).pressMark = 'unknown';
      return 'illegal:unknown-field';
    },
    () => {
      (contract as unknown as { id: string }).id = `${contract.id}-forked`;
      return 'illegal:forked-id';
    },
    () => {
      delete (contract as unknown as JsonRecord).briefing;
      return 'illegal:missing-briefing';
    },
    () => {
      charter.envelope.provenance = { ...charter.envelope.provenance, author: '  ' };
      return 'illegal:blank-author';
    },
    () => {
      charter.envelope.paletteId = 'epoch-9-redfields';
      return 'illegal:unopened-palette';
    },
    () => {
      charter.envelope.provenance = { ...charter.envelope.provenance, createdAt: 'not a date' };
      return 'illegal:torn-date';
    },
  ];
  return menu[Math.floor(rng() * menu.length)]!();
}

function pickNumericLeaf(contract: ContractManifest, rng: Rng): NumericLeaf | null {
  const leaves: NumericLeaf[] = [];
  collectNumericLeaves(contract as unknown as JsonRecord, '', leaves);
  if (leaves.length === 0) return null;
  return leaves[Math.floor(rng() * leaves.length)]!;
}

function collectNumericLeaves(value: unknown, path: string, leaves: NumericLeaf[]): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      if (typeof entry === 'number') leaves.push({ owner: value, key: index, path: `${path}[${index}]`, value: entry });
      else collectNumericLeaves(entry, `${path}[${index}]`, leaves);
    });
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (typeof child === 'number') leaves.push({ owner: value as JsonRecord, key, path: childPath, value: child });
    else collectNumericLeaves(child, childPath, leaves);
  }
}

function setLeaf(leaf: NumericLeaf, value: number): void {
  if (Array.isArray(leaf.owner)) leaf.owner[leaf.key as number] = value;
  else leaf.owner[leaf.key as string] = value;
}

function roundish(value: number, reference: number): number {
  return Number.isInteger(reference) ? Math.round(value) : Math.round(value * 100) / 100;
}
