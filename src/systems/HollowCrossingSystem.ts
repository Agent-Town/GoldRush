import type { ContractManifest } from '../meta/ContractFamilies';

export const HOLLOW_GLOW_DAMAGE_PER_SECOND = 1;
export const HOLLOW_EXTRACTION_RADIUS = 6;

type Point = Readonly<{ x: number; z: number }>;
type Rect = Readonly<{ id: string; minX: number; maxX: number; minZ: number; maxZ: number }>;

export type HollowCrossingDiagnostics = Readonly<{
  declared: boolean;
  stage: 'launch' | 'crossing' | 'extraction' | 'complete';
  routeId: string | null;
  onGlowBridge: boolean;
  radiationDamageDealt: number;
}>;

export class HollowCrossingSystem {
  private stage: HollowCrossingDiagnostics['stage'] = 'launch';
  private routeId: string | null = null;
  private readonly onGlowBridgeByActor = new Map<string | number, boolean>();
  private readonly radiationCarryByActor = new Map<string | number, number>();
  private radiationDamageDealt = 0;

  private constructor(
    private readonly declared: boolean,
    private readonly launch: Rect | null,
    private readonly routes: readonly Rect[],
    private readonly glowBridges: readonly Rect[],
    private readonly extraction: Point | null,
  ) {}

  static create(contract: ContractManifest): HollowCrossingSystem {
    const crossing = contract.tileParams.hollowCrossing;
    if (contract.id !== 'e6-half-life-hollow' || !crossing) return HollowCrossingSystem.none();
    const zones = contract.tileParams.buildZones ?? [];
    const shelves = crossing.shelfIds.map((shelfId) => zones.find(({ id }) => id === shelfId));
    const extraction = contract.tileParams.stakeMarkers?.find(({ id }) => id === crossing.extractionStakeId) ?? null;
    if (shelves.length !== 4 || shelves.some((shelf) => !shelf) || crossing.glowBridges.length !== 2 || !extraction) {
      throw new Error('Half-Life Hollow crossing data is incomplete.');
    }
    return new HollowCrossingSystem(true, shelves[0]!, [crossing.causeway, ...crossing.glowBridges], crossing.glowBridges, extraction);
  }

  static none(): HollowCrossingSystem {
    return new HollowCrossingSystem(false, null, [], [], null);
  }

  get isDeclared(): boolean {
    return this.declared;
  }

  get objectiveAllowsSecure(): boolean {
    return !this.declared || this.stage === 'complete';
  }

  update(delta: number, position: Point, actorId: string | number = 0): number {
    if (!this.declared) return 0;
    const onGlowBridge = this.glowBridges.some((zone) => inside(zone, position));
    this.onGlowBridgeByActor.set(actorId, onGlowBridge);
    const carry = (this.radiationCarryByActor.get(actorId) ?? 0)
      + (onGlowBridge ? delta * HOLLOW_GLOW_DAMAGE_PER_SECOND : 0);
    const damage = Math.floor(carry);
    this.radiationCarryByActor.set(actorId, carry - damage);
    if (damage > 0) {
      this.radiationDamageDealt += damage;
    }

    if (this.stage === 'launch' && inside(this.launch!, position)) this.stage = 'crossing';
    if (this.stage === 'crossing') {
      const route = this.routes.find((zone) => inside(zone, position));
      if (route) {
        this.routeId = route.id;
        this.stage = 'extraction';
      }
    }
    if (this.stage === 'extraction' && distance(position, this.extraction!) <= HOLLOW_EXTRACTION_RADIUS) this.stage = 'complete';
    return damage;
  }

  reset(): void {
    this.stage = 'launch';
    this.routeId = null;
    this.onGlowBridgeByActor.clear();
    this.radiationCarryByActor.clear();
    this.radiationDamageDealt = 0;
  }

  get diagnostics(): HollowCrossingDiagnostics {
    return {
      declared: this.declared,
      stage: this.stage,
      routeId: this.routeId,
      onGlowBridge: [...this.onGlowBridgeByActor.values()].some(Boolean),
      radiationDamageDealt: this.radiationDamageDealt,
    };
  }
}

function inside(zone: Rect, point: Point): boolean {
  return point.x >= zone.minX && point.x <= zone.maxX && point.z >= zone.minZ && point.z <= zone.maxZ;
}

function distance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.z - right.z);
}
