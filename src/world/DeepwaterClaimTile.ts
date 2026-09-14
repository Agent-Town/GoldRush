import { ClaimBoat, type ClaimBoatConfig, type BoatRiderPosition } from '../entities/ClaimBoat';
import { FlotillaHullSystem } from '../systems/FlotillaHullSystem';
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
  id: string;
  label?: string;
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

/**
 * Every contract this tile sockets. THIRD WIDENING (A2, 2026-08-20): the Regatta and the
 * Flotilla each joined the Deepwater Claim here, and `e5-stillwater` joins the same way — it
 * authors the same `tileParams.deepwater` block (water regions, the Claim-Boat, wrecks) and
 * differs only in what it schedules on top.
 */
const DEEPWATER_CONTRACTS = new Set(['e5-deepwater-claim', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']);

export class DeepwaterClaimTile {
  readonly water: WaterRegionTile;
  boat: ClaimBoat;
  readonly flotilla: FlotillaHullSystem | null;
  private readonly scheduler: StormWaveScheduler;
  private readonly corsairWaves: CorsairSkiffWave[] = [];
  private readonly lostHullPads = new Set<string>();
  private readonly deepwater: DeepwaterFields;
  private readonly corsair: CorsairRosterEntry | null;

  constructor(readonly contract: ContractManifest) {
    if (!DEEPWATER_CONTRACTS.has(contract.id)) {
      throw new Error('The deepwater tile needs an authored Deepwater contract.');
    }
    const authored = contract as unknown as DeepwaterContract;
    this.deepwater = authored.tileParams.deepwater;
    this.corsair = authored.twist.enemyRoster.find((entry) => entry.unitClass === 'vehicle' && entry.travelClass === 'boat') ?? null;
    if (!this.deepwater || !authored.twist.weather) throw new Error('The Deepwater Claim data is incomplete.');
    // A2: a corsair ARCHETYPE is required only where corsairs are DECLARED. `e5-stillwater`
    // authors `corsairWaveSize: 0` and a single depth-travelling `machine_leviathan`, so
    // demanding a boat-class roster entry would refuse the contract for lacking a thing it
    // deliberately declares none of. `corsairsFor` below still refuses a wave it cannot crew.
    if (this.deepwater.corsairWaveSize > 0 && !this.corsair) throw new Error('The Deepwater Claim data is incomplete.');
    this.water = new WaterRegionTile(this.deepwater.waterTile);
    this.boat = new ClaimBoat(this.deepwater.claimBoat);
    this.flotilla = FlotillaHullSystem.create(contract, (id) => this.loseHull(id));
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
    return !this.lostHullPads.has(padId) && this.boat.placeBuilding(padId, buildingId);
  }

  loseHull(id: string): void {
    this.lostHullPads.add(id);
  }

  landPlacementAt(x: number, z: number) {
    const water = this.water.sample(x, z, 'boat');
    return {
      allowed: false,
      reason: water ? 'water' : 'outside-tile',
      depthClass: water?.depthClass ?? null,
    } as const;
  }

  reanchor(anchorId: string, riders: readonly BoatRiderPosition[] = []): boolean {
    if (this.flotilla?.diagnostics.hulls.some(({ id }) => id === anchorId)) return this.flotilla.reanchor(anchorId, riders);
    const before = this.boat.snapshot().anchor;
    if (!this.boat.reanchor(anchorId, this.flotilla ? [] : riders)) return false;
    const after = this.boat.snapshot().anchor;
    this.flotilla?.moveAnchorage(after.x - before.x, after.z - before.z, riders);
    return true;
  }

  reanchorTargets() {
    return [
      ...this.deepwater.claimBoat.anchors,
      ...(this.flotilla?.diagnostics.hulls ?? []).filter(({ lost }) => !lost).map(({ id, x, z }) => ({ id, x, z })),
    ];
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
    this.flotilla?.reset();
    this.scheduler.reset();
    this.corsairWaves.length = 0;
    this.lostHullPads.clear();
    return this.snapshot();
  }

  snapshot() {
    const boat = this.boat.snapshot();
    const hulls = this.flotilla?.diagnostics.hulls;
    const pads = hulls ? boat.pads.flatMap((pad) => {
      if (this.lostHullPads.has(pad.id)) return [];
      const hull = hulls.find(({ id, lost }) => id === pad.id && !lost);
      return hull ? [{ ...pad, x: hull.x - boat.anchor.x, z: hull.z - boat.anchor.z }] : [];
    }) : boat.pads.filter(({ id }) => !this.lostHullPads.has(id));
    const buildings = boat.buildings.flatMap((building) => {
      const pad = pads.find(({ id }) => id === building.padId);
      return pad ? [{ ...building, x: boat.anchor.x + pad.x, z: boat.anchor.z + pad.z }] : [];
    });
    return {
      contractId: this.contract.id,
      tileId: this.deepwater.waterTile.id,
      size: this.deepwater.waterTile.size,
      boat: { ...boat, pads, buildings },
      storm: this.scheduler.snapshot(),
      corsairWaves: this.corsairWaves.map((wave) => ({ ...wave, enemies: [...wave.enemies] })),
      wrecks: [...this.deepwater.wrecks],
    } as const;
  }

  private corsairsFor(event: StormWaveEvent): CorsairSkiff[] {
    const corsair = this.corsair;
    return Array.from({ length: this.deepwater.corsairWaveSize }, (_, index) => {
      if (!corsair) throw new Error('Corsair skiff scheduled with no authored corsair archetype.');
      const x = event.fromX + 2;
      const z = (index - (this.deepwater.corsairWaveSize - 1) / 2) * 6;
      const water = this.water.sample(x, z, corsair.travelClass);
      if (!water?.passable || !corsair.waterRegions.includes(water.regionId)) {
        throw new Error('Corsair skiff spawned outside its authored water regions.');
      }
      return {
        id: `corsair-skiff-${event.wave}-${index + 1}`,
        unitClass: corsair.unitClass,
        vehicleChassis: corsair.vehicleChassis,
        travelClass: corsair.travelClass,
        art: corsair.art,
        waterRegionId: water.regionId,
        x,
        z,
      };
    });
  }
}

export function deepwaterStormCarriesCorsairs(contract: ContractManifest): boolean {
  return (contract.tileParams.deepwater?.corsairWaveSize ?? 0) > 0;
}

export function deepwaterStormDisablesScheduledWaves(contract: ContractManifest): boolean {
  return deepwaterStormCarriesCorsairs(contract) && !contract.tileParams.stillwater;
}

export function deepwaterFrontCarriesWave(wave: CorsairSkiffWave): boolean {
  return wave.enemies.length > 0;
}

// Compatibility for the public mechanics manifest, outside this slice's firewall.
export const deepwaterStormDrivesWaves = deepwaterStormDisablesScheduledWaves;

export function createDeepwaterClaimTile(contract: ContractManifest): DeepwaterClaimTile | null {
  return DEEPWATER_CONTRACTS.has(contract.id) ? new DeepwaterClaimTile(contract) : null;
}
