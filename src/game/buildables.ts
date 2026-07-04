import { Balance } from './Balance';

export type BuildableId = 'sentry_beacon' | 'palisade';
export type BuildPlacement = 'bank' | 'river-adjacent' | 'any';

export type BuildableDef = {
  id: BuildableId;
  displayName: string;
  costCurve: (built: number) => number;
  footprint: { w: number; d: number };
  hpMax: number | null;
  placement: BuildPlacement;
  slotFamily: `building.${BuildableId}`;
  maxCount: number;
  iconSlot: `ui.build.icon.${BuildableId}`;
};

export const buildableDefs: readonly BuildableDef[] = [
  {
    id: 'sentry_beacon',
    displayName: 'Sentry Beacon',
    costCurve: beaconCost,
    footprint: { w: 1, d: 1 },
    hpMax: null,
    placement: 'bank',
    slotFamily: 'building.sentry_beacon',
    maxCount: Balance.beacon.maxCount,
    iconSlot: 'ui.build.icon.sentry_beacon',
  },
  {
    id: 'palisade',
    displayName: 'Palisade',
    costCurve: () => Balance.palisade.cost,
    footprint: { w: 1, d: 3 },
    hpMax: null,
    placement: 'bank',
    slotFamily: 'building.palisade',
    maxCount: Balance.palisade.maxCount,
    iconSlot: 'ui.build.icon.palisade',
  },
];

export function getBuildableDef(id: string): BuildableDef | undefined {
  return buildableDefs.find((def) => def.id === id);
}

export function beaconCost(index: number): number {
  return Math.ceil((Balance.beacon.costBase * Balance.beacon.costGrowth ** index) / 5) * 5;
}
