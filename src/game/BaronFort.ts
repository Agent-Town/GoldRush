import baronTerrainContractText from '../../assets/pilots/map-rebuild-spike/baron-terrain-contract.json?raw';
import type { CompassEdge } from '../entities/Enemy';
import type { ContractManifest } from '../meta/ContractFamilies';

type LandmarkMount = { id: string; position: [number, number, number] };

const fort = (JSON.parse(baronTerrainContractText) as { landmarkMounts: LandmarkMount[] }).landmarkMounts
  .find(({ id }) => id === 'fortified_far_bank');

if (!fort) throw new Error('Baron terrain contract is missing fortified_far_bank');

export const BARON_FORT_POSITION = { x: fort.position[0], z: fort.position[2] } as const;

export function baronArrivalEdge(contract: ContractManifest): CompassEdge | undefined {
  if (contract.id !== 'e1-baron') return contract.twist.baron?.spawnEdge;
  const { x, z } = BARON_FORT_POSITION;
  return Math.abs(x) > Math.abs(z) ? (x >= 0 ? 'east' : 'west') : z >= 0 ? 'north' : 'south';
}
