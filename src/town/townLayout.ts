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

export const townBuildings: readonly TownBuilding[] = [
  {
    id: 'tavern',
    name: 'Tavern',
    position: { x: -6, z: -9 },
    footprint: { w: 5.2, d: 3.4 },
    color: '#b9824c',
    roof: '#7a5132',
    accent: '#ffe4a0',
  },
  {
    id: 'claim_office',
    name: 'Claim Office',
    position: { x: 7.2, z: -6.6 },
    footprint: { w: 4.4, d: 3.2 },
    color: '#f5e6c8',
    roof: '#8b7d3c',
    accent: '#5b8a8a',
  },
  {
    id: 'schoolhouse',
    name: 'Schoolhouse',
    position: { x: -8.2, z: 5.4 },
    footprint: { w: 4.4, d: 3.4 },
    color: '#e8d5a8',
    roof: '#a0522d',
    accent: '#fff8e8',
  },
  {
    id: 'assay_office',
    name: 'Assay Office',
    position: { x: 6.6, z: 7.2 },
    footprint: { w: 4.6, d: 3.4 },
    color: '#d6b478',
    roof: '#5b8a8a',
    accent: '#c4883a',
  },
  {
    id: 'general_store',
    name: 'General Store',
    position: { x: 0.4, z: -10.8 },
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
    position: { x: -0.5, z: 9.6 },
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
