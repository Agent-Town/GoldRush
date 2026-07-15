export type WaterTravelClass = 'swim' | 'boat' | 'depth';
export type WaterDepthClass = 'surface' | 'shallows' | 'reef' | 'wreck' | 'trench';

export type WaterRegionParams = Readonly<{
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  depth: number;
  depthClass: WaterDepthClass;
  travel: readonly WaterTravelClass[];
}>;

export type WaterTileParams = Readonly<{
  id: string;
  size: number;
  regions: readonly WaterRegionParams[];
}>;

export type WaterRegionSample = Readonly<{
  regionId: string;
  depth: number;
  depthClass: WaterDepthClass;
  travelClass: WaterTravelClass;
  passable: boolean;
}>;

export class WaterRegionTile {
  constructor(readonly params: WaterTileParams) {
    if (!validWaterTileParams(params)) throw new Error('Invalid water tile params.');
  }

  sample(x: number, z: number, travelClass: WaterTravelClass): WaterRegionSample | null {
    for (let index = this.params.regions.length - 1; index >= 0; index -= 1) {
      const region = this.params.regions[index]!;
      if (x < region.minX || x > region.maxX || z < region.minZ || z > region.maxZ) continue;
      return {
        regionId: region.id,
        depth: region.depth,
        depthClass: region.depthClass,
        travelClass,
        passable: region.travel.includes(travelClass),
      };
    }
    return null;
  }
}

function validWaterTileParams(params: WaterTileParams): boolean {
  const half = params.size / 2;
  return params.id.length > 0
    && Number.isFinite(params.size)
    && params.size > 0
    && params.regions.length > 0
    && params.regions.every((region) =>
      region.id.length > 0
      && Number.isFinite(region.depth)
      && region.depth <= 0
      && region.minX >= -half
      && region.maxX <= half
      && region.minZ >= -half
      && region.maxZ <= half
      && region.minX < region.maxX
      && region.minZ < region.maxZ,
    );
}
