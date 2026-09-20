import {
  CLAIM_BOAT_HULL_RADIUS,
  ClaimBoat,
  type BoatRiderPosition,
  type ClaimBoatConfig,
  type ClaimBoatWater,
} from '../entities/ClaimBoat';
import { heroMoveIntent } from '../agent/StandingOrders';
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
 * E5 REGATTA, SLICE 1 — THE HELM'S ONE PORT INTO ITS HOST.
 *
 * The steer step is owned HERE, by the tile both engines already compose, so `HeadlessContractSim`
 * and `Game` run the SAME rule rather than two implementations of it (the parity claim of this
 * slice). The only thing the tile cannot answer for itself is whether a body may stand on a point —
 * that is the engine's own walkability answer, the same predicate `HeroChannel.walkable` binds.
 */
export type BoatHelmPorts = Readonly<{ walkable: (x: number, z: number) => boolean }>;

/** The refusals a boat order publishes on the standing-order status channel. No view field, no verb. */
export type BoatOrderRefusal = 'NOT_ABOARD' | 'UNREACHABLE_WATER';

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
  /** The rectangle the hull centre may occupy; null where no region admits a boat at all. */
  private readonly boatWater: ClaimBoatWater | null;

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
    this.boatWater = boatWaterFor(this.deepwater.waterTile);
    this.boat = new ClaimBoat(this.deepwater.claimBoat, this.boatWater);
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

  /**
   * Slice 1 — ONE FIXED STEP OF THE HELM, for whichever engine is driving.
   *
   * Returns true when the boat carried the hero this step, which is the caller's signal to SKIP its
   * own hero movement: while aboard the body is the boat, and the hero rides the deck anchor.
   * Returns false for every boat with no authored physics and for every step the hero is not
   * aboard — so an idle run, and every other Deepwater map, walks exactly the object graph it
   * walked before this slice existed.
   *
   * `orderTarget` is a rider's live `MOVE_HERO` point (null for a human at the keys); `intent` is
   * the unit move vector BOTH species produce. A target within a plank of the rail that the hull
   * cannot float in is a step ashore; anything else is a course to steer.
   */
  helm(
    dt: number,
    hero: BoatRiderPosition,
    intent: { x: number; y: number } | null,
    orderTarget: BoatRiderPosition | null,
    ports: BoatHelmPorts,
  ): boolean {
    const boat = this.boat;
    if (!boat.steerable) return false;
    boat.board(hero.x, hero.z);
    if (boat.aboard === null) return false;
    const ashore = orderTarget ?? (intent ? boat.gangplankPoint(intent) : null);
    if (ashore && boat.stepAshore(ashore, ports.walkable)) {
      boat.disembark();
      hero.x = ashore.x;
      hero.z = ashore.z;
      return true;
    }
    // ONE BODY, ONE INTENT (ADR-005). A rider's steering POINT becomes the same unit vector a
    // human's keys produce, through `heroMoveIntent` — the function that exists so both engines
    // derive it from identical arithmetic — and it is derived HERE rather than by each engine, so
    // a browser door that has a point but no key press sails exactly as the headless door does.
    const steering = orderTarget ? heroMoveIntent(boat.position, orderTarget) : intent;
    boat.steer(steering, dt, this.fastWaterAt(boat.position.x, boat.position.z));
    hero.x = boat.position.x;
    hero.z = boat.position.z;
    return true;
  }

  /**
   * Slice 1 — the two refusals, decided where the geometry lives and published by the standing-order
   * status channel (`StandingOrders.BOAT_ORDER_REFUSALS`). Null everywhere the boat only moors.
   */
  boatOrderRefusal(hero: BoatRiderPosition, target: BoatRiderPosition, walkable: (x: number, z: number) => boolean): BoatOrderRefusal | null {
    const boat = this.boat;
    if (!boat.steerable) return null;
    if (boat.aboard !== null) {
      // Aboard: a point the hull cannot reach and that is not a step ashore is a course to nowhere.
      return boat.navigable(target.x, target.z) || boat.stepAshore(target, walkable) ? null : 'UNREACHABLE_WATER';
    }
    // Ashore (standing where the hull cannot float) and ordered out into the navigable water,
    // past the gangway: that order only makes sense aboard.
    return !boat.navigable(hero.x, hero.z)
      && boat.navigable(target.x, target.z)
      && !boat.withinGangplank(target.x, target.z)
      ? 'NOT_ABOARD'
      : null;
  }

  /** The contract's own fast-water zone, read where the HULL is. Race scoring stays slice 2's. */
  fastWaterAt(x: number, z: number): boolean {
    const zone = this.contract.tileParams.raceCourse?.fastWaterZone;
    return zone !== undefined && x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ;
  }

  reset(): ReturnType<DeepwaterClaimTile['snapshot']> {
    this.boat = new ClaimBoat(this.deepwater.claimBoat, this.boatWater);
    this.flotilla?.reset();
    this.scheduler.reset();
    this.corsairWaves.length = 0;
    this.lostHullPads.clear();
    return this.snapshot();
  }

  snapshot() {
    const boat = this.boat.snapshot();
    const hulls = this.flotilla?.diagnostics.hulls;
    // Slice 1: pads and deck buildings ride the HULL, not the mooring — identical numbers for every
    // boat that has not sailed (the hull sits on its anchor until something steers it).
    const pads = hulls ? boat.pads.flatMap((pad) => {
      if (this.lostHullPads.has(pad.id)) return [];
      const hull = hulls.find(({ id, lost }) => id === pad.id && !lost);
      return hull ? [{ ...pad, x: hull.x - boat.motion.x, z: hull.z - boat.motion.z }] : [];
    }) : boat.pads.filter(({ id }) => !this.lostHullPads.has(id));
    const buildings = boat.buildings.flatMap((building) => {
      const pad = pads.find(({ id }) => id === building.padId);
      return pad ? [{ ...building, x: boat.motion.x + pad.x, z: boat.motion.z + pad.z }] : [];
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

/**
 * Slice 1 — the water the HULL CENTRE may occupy: the union of every region a boat may travel,
 * inset by the hull's turning radius so the deck never leaves the water it was cleared for. Null
 * where no region admits a boat at all, which makes the boat unsteerable rather than unbounded.
 */
function boatWaterFor(tile: WaterTileParams): ClaimBoatWater | null {
  const sailable = tile.regions.filter((region) => region.travel.includes('boat'));
  if (sailable.length === 0) return null;
  const minX = Math.min(...sailable.map((region) => region.minX)) + CLAIM_BOAT_HULL_RADIUS;
  const maxX = Math.max(...sailable.map((region) => region.maxX)) - CLAIM_BOAT_HULL_RADIUS;
  const minZ = Math.min(...sailable.map((region) => region.minZ)) + CLAIM_BOAT_HULL_RADIUS;
  const maxZ = Math.max(...sailable.map((region) => region.maxZ)) - CLAIM_BOAT_HULL_RADIUS;
  return minX <= maxX && minZ <= maxZ ? { minX, maxX, minZ, maxZ } : null;
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
