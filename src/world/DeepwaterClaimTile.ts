import { ClaimBoat, type ClaimBoatConfig } from '../entities/ClaimBoat';
import type { ContractManifest, ContractWeather } from '../meta/ContractFamilies';
import { StormWaveScheduler, type StormWaveEvent } from '../systems/StormWaveScheduler';
import { WaterRegionTile, type WaterTileParams, type WaterTravelClass } from './WaterRegion';

type DeepwaterWreck = Readonly<{
  id: string;
  era: string;
  x: number;
  z: number;
  depthClass: 'wreck';
}>;

type DeepwaterFields = Readonly<{
  waterTile: WaterTileParams;
  claimBoat: ClaimBoatConfig;
  stormTrack: { regionId: string; westX: number; eastX: number };
  corsairWaveSize: number;
  wrecks: readonly DeepwaterWreck[];
}>;

type CorsairRosterEntry = Readonly<{
  id: 'corsair_skiff';
  unitClass: 'vehicle';
  vehicleChassis: 'e4-hauler';
  travelClass: 'boat';
  waterRegions: readonly string[];
  art: 'placeholder';
}>;

type DeepwaterContract = Omit<ContractManifest, 'tileParams' | 'twist'> & {
  tileParams: ContractManifest['tileParams'] & { deepwater: DeepwaterFields };
  twist: Omit<ContractManifest['twist'], 'weather' | 'enemyRoster'> & {
    weather: ContractWeather;
    enemyRoster: readonly CorsairRosterEntry[];
  };
};

export type CorsairSkiff = Readonly<{
  id: string;
  unitClass: 'vehicle';
  vehicleChassis: 'e4-hauler';
  travelClass: 'boat';
  art: 'placeholder';
  waterRegionId: string;
  x: number;
  z: number;
}>;

export type CorsairSkiffWave = StormWaveEvent & Readonly<{ enemies: readonly CorsairSkiff[] }>;

export class DeepwaterClaimTile {
  readonly water: WaterRegionTile;
  boat: ClaimBoat;
  private readonly scheduler: StormWaveScheduler;
  private readonly corsairWaves: CorsairSkiffWave[] = [];
  private readonly deepwater: DeepwaterFields;
  private readonly corsair: CorsairRosterEntry;

  constructor(readonly contract: ContractManifest) {
    if (contract.id !== 'e5-deepwater-claim') throw new Error('The Deepwater Claim needs its authored contract.');
    const authored = contract as unknown as DeepwaterContract;
    this.deepwater = authored.tileParams.deepwater;
    this.corsair = authored.twist.enemyRoster.find((entry) => entry.id === 'corsair_skiff')!;
    if (!this.deepwater || !authored.twist.weather || !this.corsair) throw new Error('The Deepwater Claim data is incomplete.');
    this.water = new WaterRegionTile(this.deepwater.waterTile);
    this.boat = new ClaimBoat(this.deepwater.claimBoat);
    this.scheduler = new StormWaveScheduler(
      {
        weather: { era: 5, contractId: contract.id, ...authored.twist.weather },
        westX: this.deepwater.stormTrack.westX,
        eastX: this.deepwater.stormTrack.eastX,
      },
      (event) => this.corsairWaves.push({ ...event, enemies: this.corsairsFor(event) }),
    );
  }

  placeBoatBuilding(padId: string, buildingId: string): boolean {
    return this.boat.placeBuilding(padId, buildingId);
  }

  landPlacementAt(x: number, z: number) {
    const water = this.water.sample(x, z, 'boat');
    return {
      allowed: false,
      reason: water ? 'water' : 'outside-tile',
      depthClass: water?.depthClass ?? null,
    } as const;
  }

  reanchor(anchorId: string): boolean {
    return this.boat.reanchor(anchorId);
  }

  sample(x: number, z: number, travelClass: WaterTravelClass) {
    return this.water.sample(x, z, travelClass);
  }

  advance(simTime: number): ReturnType<DeepwaterClaimTile['snapshot']> {
    this.scheduler.advance(simTime);
    return this.snapshot();
  }

  reset(): ReturnType<DeepwaterClaimTile['snapshot']> {
    this.boat = new ClaimBoat(this.deepwater.claimBoat);
    this.scheduler.reset();
    this.corsairWaves.length = 0;
    return this.snapshot();
  }

  snapshot() {
    return {
      contractId: this.contract.id,
      tileId: this.deepwater.waterTile.id,
      size: this.deepwater.waterTile.size,
      boat: this.boat.snapshot(),
      storm: this.scheduler.snapshot(),
      corsairWaves: this.corsairWaves.map((wave) => ({ ...wave, enemies: [...wave.enemies] })),
      wrecks: [...this.deepwater.wrecks],
    } as const;
  }

  private corsairsFor(event: StormWaveEvent): CorsairSkiff[] {
    return Array.from({ length: this.deepwater.corsairWaveSize }, (_, index) => {
      const x = event.fromX + 2;
      const z = (index - (this.deepwater.corsairWaveSize - 1) / 2) * 6;
      const water = this.water.sample(x, z, this.corsair.travelClass);
      if (!water?.passable || !this.corsair.waterRegions.includes(water.regionId)) {
        throw new Error('Corsair skiff spawned outside its authored water regions.');
      }
      return {
        id: `corsair-skiff-${event.wave}-${index + 1}`,
        unitClass: this.corsair.unitClass,
        vehicleChassis: this.corsair.vehicleChassis,
        travelClass: this.corsair.travelClass,
        art: this.corsair.art,
        waterRegionId: water.regionId,
        x,
        z,
      };
    });
  }
}

export function createDeepwaterClaimTile(contract: ContractManifest): DeepwaterClaimTile | null {
  return contract.id === 'e5-deepwater-claim' ? new DeepwaterClaimTile(contract) : null;
}
