export type TownBuildingId = 'tavern' | 'claim_office' | 'schoolhouse' | 'assay_office' | 'general_store' | 'chapel';

export type TownBuilding = {
  id: TownBuildingId;
  name: string;
  position: { x: number; z: number };
  footprint: { w: number; d: number };
  color: string;
  roof: string;
  accent: string;
  requires?: { territory: number };
  barkSlot?: string;
};

export type TownPropKind =
  | 'covered_wagon'
  | 'fence'
  | 'cactus'
  | 'water_trough'
  | 'lantern_post'
  | 'pony_express_plot';

export type TownPropDescriptor = {
  id: string;
  kind: TownPropKind;
  position: { x: number; z: number };
  rotation: number;
  scale?: number;
};

export const townPlazaLayout = {
  center: { x: 0, z: 0 },
  clearRadius: 3.1,
  gate: { x: 0, z: 14.5 },
  slots: [
    { id: 'tavern', position: { x: -7.1, z: -7.1 }, approach: { x: -4.9, z: -4.9 } },
    { id: 'claim_office', position: { x: 7.1, z: -7.1 }, approach: { x: 4.9, z: -4.9 } },
    { id: 'general_store', position: { x: 0, z: -10.2 }, approach: { x: 0, z: -7.2 } },
    { id: 'schoolhouse', position: { x: -9.4, z: 3.4 }, approach: { x: -6.6, z: 2.4 } },
    { id: 'assay_office', position: { x: 9.4, z: 3.4 }, approach: { x: 6.6, z: 2.4 } },
    { id: 'chapel', position: { x: -4.8, z: 9 }, approach: { x: -3.35, z: 6.35 } },
    { id: 'stamp-mill', position: { x: 4.8, z: 9 }, approach: { x: 3.45, z: 6.5 } },
  ],
  actorOffsets: {
    tavernkeeper: { x: 0.6, z: 2.25 },
    storekeeper: { x: 1.15, z: 2 },
    elder: { x: 1.55, z: 1.95 },
    preacher: { x: -1.05, z: 1.75 },
    schoolteacher: { x: -2, z: 1.45 },
    assay_clerk: { x: -1.05, z: 2.1 },
    prospector: { x: 1.25, z: 2.05 },
  },
} as const;

export const townPropRing = {
  panMonument: {
    id: 'pan_monument',
    position: townPlazaLayout.center,
    radius: 0.82,
  },
  props: [
    { id: 'wagon-gate-west', kind: 'covered_wagon', position: { x: -3.35, z: 12.25 }, rotation: -0.42, scale: 1.05 },
    { id: 'wagon-gate-east', kind: 'covered_wagon', position: { x: 3.2, z: 12.35 }, rotation: 0.34, scale: 1 },
    { id: 'wagon-north-store', kind: 'covered_wagon', position: { x: -4.85, z: -12.05 }, rotation: 2.72, scale: 0.9 },
    { id: 'fence-west-low', kind: 'fence', position: { x: -12.15, z: -2.2 }, rotation: 0.22, scale: 1.25 },
    { id: 'fence-east-low', kind: 'fence', position: { x: 12.1, z: -2.1 }, rotation: -0.18, scale: 1.2 },
    { id: 'fence-west-ridge', kind: 'fence', position: { x: -10.75, z: 7.35 }, rotation: -0.74, scale: 1.05 },
    { id: 'fence-east-ridge', kind: 'fence', position: { x: 10.8, z: 7.2 }, rotation: 0.68, scale: 1.05 },
    { id: 'cactus-northwest', kind: 'cactus', position: { x: -12.55, z: -7.4 }, rotation: -0.18, scale: 0.95 },
    { id: 'cactus-northeast', kind: 'cactus', position: { x: 12.35, z: -7.15 }, rotation: 0.22, scale: 1.05 },
    { id: 'cactus-southwest', kind: 'cactus', position: { x: -12.7, z: 5.4 }, rotation: 0.08, scale: 0.8 },
    { id: 'water-trough-gate', kind: 'water_trough', position: { x: 0, z: 11.25 }, rotation: 0, scale: 1 },
    { id: 'lantern-gate-west', kind: 'lantern_post', position: { x: -5.8, z: 9.85 }, rotation: 0, scale: 1 },
    { id: 'lantern-gate-east', kind: 'lantern_post', position: { x: 5.8, z: 9.85 }, rotation: 0, scale: 1 },
    { id: 'lantern-tavern-trail', kind: 'lantern_post', position: { x: -6.25, z: -3.4 }, rotation: 0, scale: 0.92 },
    { id: 'lantern-claim-trail', kind: 'lantern_post', position: { x: 6.25, z: -3.4 }, rotation: 0, scale: 0.92 },
    { id: 'lantern-store-trail', kind: 'lantern_post', position: { x: 0, z: -8.2 }, rotation: 0, scale: 0.88 },
    { id: 'pony-express-station-plot', kind: 'pony_express_plot', position: { x: 10.55, z: 10.15 }, rotation: -0.28, scale: 1 },
  ] satisfies readonly TownPropDescriptor[],
} as const;

export function townPlazaSlot(id: (typeof townPlazaLayout.slots)[number]['id']) {
  const slot = townPlazaLayout.slots.find((entry) => entry.id === id);
  if (!slot) throw new Error(`Missing town plaza slot: ${id}`);
  return slot;
}

export const townBuildings: readonly TownBuilding[] = [
  {
    id: 'tavern',
    name: 'Tavern',
    position: townPlazaSlot('tavern').position,
    footprint: { w: 5.2, d: 3.4 },
    color: '#b9824c',
    roof: '#7a5132',
    accent: '#ffe4a0',
  },
  {
    id: 'claim_office',
    name: 'Claim Office',
    position: townPlazaSlot('claim_office').position,
    footprint: { w: 4.4, d: 3.2 },
    color: '#f5e6c8',
    roof: '#8b7d3c',
    accent: '#5b8a8a',
  },
  {
    id: 'schoolhouse',
    name: 'Schoolhouse',
    position: townPlazaSlot('schoolhouse').position,
    footprint: { w: 4.4, d: 3.4 },
    color: '#e8d5a8',
    roof: '#a0522d',
    accent: '#fff8e8',
  },
  {
    id: 'assay_office',
    name: 'Assay Office',
    position: townPlazaSlot('assay_office').position,
    footprint: { w: 4.6, d: 3.4 },
    color: '#d6b478',
    roof: '#5b8a8a',
    accent: '#c4883a',
  },
  {
    id: 'general_store',
    name: 'General Store',
    position: townPlazaSlot('general_store').position,
    footprint: { w: 4.8, d: 3.3 },
    color: '#d9a45f',
    roof: '#5f4930',
    accent: '#5b8a8a',
    requires: { territory: 2 },
    barkSlot: 'storekeeper-porch',
  },
  {
    id: 'chapel',
    name: 'Chapel',
    position: townPlazaSlot('chapel').position,
    footprint: { w: 4.2, d: 3.2 },
    color: '#f5e6c8',
    roof: '#8b7d3c',
    accent: '#a0522d',
    requires: { territory: 3 },
    barkSlot: 'preacher-porch',
  },
] as const;

export function earnedTownBuildings(territory: number): readonly TownBuilding[] {
  return townBuildings.filter((building) => !building.requires || territory >= building.requires.territory);
}
