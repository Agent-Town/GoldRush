import { Balance } from './Balance';

export type BuildableId =
  | 'sentry_beacon'
  | 'palisade'
  | 'sluice'
  | 'stockpile'
  | 'turret'
  | 'assay_office'
  | 'lantern_post';
export type BuildPlacement = 'bank' | 'river-adjacent' | 'any';
export type BuildablePowerDef = {
  produces?: number;
  consumes?: number;
  relay?: boolean;
};

export type BuildableDef = {
  id: BuildableId;
  displayName: string;
  blurb?: string;
  costCurve: (built: number) => number;
  footprint: { w: number; d: number };
  hpMax: number | null;
  placement: BuildPlacement;
  slotFamily: `building.${BuildableId}`;
  maxCount: number;
  iconSlot: `ui.build.icon.${BuildableId}`;
  portraitSlug?: string;
  rotatable?: boolean;
  power?: BuildablePowerDef;
};

export const buildableDefs: readonly BuildableDef[] = [
  {
    id: 'sentry_beacon',
    displayName: 'Sentry Beacon',
    costCurve: beaconCost,
    footprint: { w: 1, d: 1 },
    hpMax: Balance.wreck.hp.sentry_beacon,
    placement: 'bank',
    slotFamily: 'building.sentry_beacon',
    maxCount: Balance.beacon.maxCount,
    iconSlot: 'ui.build.icon.sentry_beacon',
    portraitSlug: 'sentry-beacon',
  },
  {
    id: 'palisade',
    displayName: 'Palisade',
    costCurve: () => Balance.palisade.cost,
    footprint: { w: 1, d: 3 },
    hpMax: Balance.wreck.hp.palisade,
    placement: 'bank',
    slotFamily: 'building.palisade',
    maxCount: Balance.palisade.maxCount,
    iconSlot: 'ui.build.icon.palisade',
    portraitSlug: 'palisade',
    rotatable: true,
  },
  {
    id: 'sluice',
    displayName: 'Sluice Works',
    costCurve: () => Balance.sluice.cost,
    footprint: { w: 2, d: 1 },
    hpMax: Balance.wreck.hp.sluice,
    placement: 'river-adjacent',
    slotFamily: 'building.sluice',
    maxCount: Balance.sluice.maxCount,
    iconSlot: 'ui.build.icon.sluice',
    portraitSlug: 'sluice-works',
  },
  {
    id: 'stockpile',
    displayName: 'Stockpile Yard',
    costCurve: () => Balance.stockpile.cost,
    footprint: { w: 1.5, d: 1.5 },
    hpMax: Balance.wreck.hp.stockpile,
    placement: 'bank',
    slotFamily: 'building.stockpile',
    maxCount: Balance.stockpile.maxCount,
    iconSlot: 'ui.build.icon.stockpile',
    portraitSlug: 'stockpile-yard',
  },
  {
    id: 'turret',
    displayName: 'Signal Turret',
    costCurve: turretCost,
    footprint: { w: 1, d: 1 },
    hpMax: Balance.wreck.hp.turret,
    placement: 'bank',
    slotFamily: 'building.turret',
    maxCount: Balance.turret.maxCount,
    iconSlot: 'ui.build.icon.turret',
    portraitSlug: 'signal-turret',
  },
  {
    id: 'lantern_post',
    displayName: 'Lantern Post',
    blurb: 'A cheap light-only post for holding the Night Shift.',
    costCurve: () => Balance.lanternPost.cost,
    footprint: { w: 0.8, d: 0.8 },
    hpMax: Balance.wreck.hp.lantern_post,
    placement: 'bank',
    slotFamily: 'building.lantern_post',
    maxCount: Balance.lanternPost.maxCount,
    iconSlot: 'ui.build.icon.lantern_post',
  },
  {
    id: 'assay_office',
    displayName: 'Assay Office',
    blurb: 'Write what you need; the Assayer fills orders between sessions.',
    costCurve: () => Balance.assayOffice.cost,
    footprint: { w: 2, d: 1.5 },
    hpMax: Balance.wreck.hp.assay_office,
    placement: 'river-adjacent',
    slotFamily: 'building.assay_office',
    maxCount: Balance.assayOffice.maxCount,
    iconSlot: 'ui.build.icon.assay_office',
  },
];

export function getBuildableDef(id: string): BuildableDef | undefined {
  return buildableDefs.find((def) => def.id === id);
}

export function beaconCost(index: number): number {
  return Math.ceil((Balance.beacon.costBase * Balance.beacon.costGrowth ** index) / 5) * 5;
}

export function turretCost(index: number): number {
  return Math.ceil((Balance.turret.costBase * Balance.turret.costGrowth ** index) / 5) * 5;
}
