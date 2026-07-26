import { Balance } from '../game/Balance';

export const ACT1_IDS = ['vac', 'rack'] as const;
export const COMPONENT_IDS = [...ACT1_IDS, 'core'] as const;
export type ComponentId = typeof COMPONENT_IDS[number];

export type HomemakerBossSuspendSnapshot = {
  act: 0 | 1 | 2 | 3;
  seenBoss: boolean;
  tidiedMarkers: number;
  anchor: { x: number; z: number };
  destroyed: ComponentId[];
  nextUnbuildIn: number | null;
  unbuilds: number;
  unbuildOrder: string[];
  rackTarget: { x: number; z: number } | null;
  rackStrikeIn: number | null;
  nextRackIn: number | null;
  rackArcs: number;
  structureDamageEvents: number;
  chairPlaced: boolean;
  poweredDown: boolean;
  curated: string[];
  partsPickupIds: string[];
};

export function decodeHomemakerBossSuspend(value: unknown): HomemakerBossSuspendSnapshot | null | false {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return false;
  const act = value.act;
  const anchor = finitePoint(value.anchor);
  const rackTarget = value.rackTarget === null ? null : finitePoint(value.rackTarget);
  const destroyed = componentArray(value.destroyed);
  const unbuildOrder = stringArray(value.unbuildOrder, 64);
  const curated = stringArray(value.curated, Balance.steal.pickupCap);
  const partsPickupIds = stringArray(value.partsPickupIds, Balance.homemaker.partsStackCap);
  if (
    (act !== 0 && act !== 1 && act !== 2 && act !== 3)
    || typeof value.seenBoss !== 'boolean'
    || !integerBetween(value.tidiedMarkers, 0, 2)
    || !anchor
    || !destroyed
    || !timer(value.nextUnbuildIn)
    || !integerBetween(value.unbuilds, 0, 1_000_000)
    || !unbuildOrder
    || (value.rackTarget !== null && !rackTarget)
    || !timer(value.rackStrikeIn)
    || !timer(value.nextRackIn)
    || !integerBetween(value.rackArcs, 0, 1_000_000)
    || !integerBetween(value.structureDamageEvents, 0, 1_000_000)
    || typeof value.chairPlaced !== 'boolean'
    || typeof value.poweredDown !== 'boolean'
    || !curated
    || !partsPickupIds
  ) return false;
  return {
    act,
    seenBoss: value.seenBoss,
    tidiedMarkers: value.tidiedMarkers,
    anchor,
    destroyed,
    nextUnbuildIn: value.nextUnbuildIn,
    unbuilds: value.unbuilds,
    unbuildOrder,
    rackTarget,
    rackStrikeIn: value.rackStrikeIn,
    nextRackIn: value.nextRackIn,
    rackArcs: value.rackArcs,
    structureDamageEvents: value.structureDamageEvents,
    chairPlaced: value.chairPlaced,
    poweredDown: value.poweredDown,
    curated,
    partsPickupIds,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finitePoint(value: unknown): { x: number; z: number } | null {
  if (!isRecord(value) || typeof value.x !== 'number' || typeof value.z !== 'number') return null;
  return Number.isFinite(value.x) && Number.isFinite(value.z) ? { x: value.x, z: value.z } : null;
}

function integerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function timer(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function componentArray(value: unknown): ComponentId[] | null {
  if (!Array.isArray(value) || value.length > COMPONENT_IDS.length) return null;
  const output = value.filter((id): id is ComponentId => COMPONENT_IDS.includes(id as ComponentId));
  return output.length === value.length && new Set(output).size === output.length ? output : null;
}

function stringArray(value: unknown, max: number): string[] | null {
  if (!Array.isArray(value) || value.length > max || !value.every((entry) => typeof entry === 'string' && entry.length <= 128)) return null;
  return [...value];
}
