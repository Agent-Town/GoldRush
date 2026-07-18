import * as THREE from 'three';
import domeBasinMask from '../../assets/contracts/epoch-9-redfields/mask-tables/e9-dome-basin.json' with { type: 'json' };
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import { TILE_STATE_SCHEMA_VERSION, type TileStateStore } from '../game/TileStateStore';
import type { ContractManifest } from '../meta/ContractFamilies';
import { visualY } from '../world/Terrain';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { WeatherSystem, type WeatherPhase } from './WeatherSystem';

const CANAL_STAGE_ENTRY_ID = 'e9-canal-stage';
const STAGE_IDS = ['canal-stage-c1', 'canal-stage-c2', 'canal-stage-c3'] as const;
const STAGE_PAYOUT_ID_PREFIX = 'e9-canal-stage-payout-';
const QUARRY_PAYOUT_ID_PREFIX = 'e9-canal-quarry-payout-';

type Point = { x: number; z: number };
type Actor = { position: THREE.Vector3; speed: number };
type GateView = { id: string; position: Point; group: THREE.Group; material: THREE.MeshStandardMaterial };
type QuarryNode = { id: string; position: Point; mesh: THREE.Mesh; harvested: boolean };

export type E9CanalDiagnostics = {
  active: boolean;
  stage: number;
  activeGateId: string | null;
  stageProgress: number;
  contested: boolean;
  stagePayoutGold: number;
  gates: Array<{ id: string; x: number; z: number; complete: boolean; active: boolean }>;
  quarry: {
    bandId: string;
    channelNodeId: string | null;
    progress: number;
    harvested: number;
    total: number;
    payoutGold: number;
    nodes: Array<{ id: string; x: number; z: number; harvested: boolean }>;
  };
  canal: { wet: boolean; renderOnly: true; visualY: true; segments: number };
  dustDevil: {
    mode: 'wander-lane';
    targeting: 'none';
    phase: WeatherPhase;
    warning: boolean;
    laneId: string;
    laneProgress: number;
    position: Point | null;
    shoves: number;
    pushedDistance: number;
  };
};

export class E9CanalSystem {
  readonly group = new THREE.Group();

  private readonly gates: GateView[];
  private readonly route: Point[];
  private readonly devilLane: Point[];
  private readonly quarryNodes: QuarryNode[];
  private readonly canalWater = new THREE.Group();
  private readonly dustDevil = new THREE.Group();
  private readonly dustTelegraph: THREE.Mesh;
  private readonly weather = new WeatherSystem(Balance.e9Canal.dustDevil.weather);
  private stage: number;
  private stageProgress = 0;
  private contested = false;
  private stagePayoutGold = 0;
  private quarryNodeIndex: number | null = null;
  private quarryProgress = 0;
  private quarryPayoutGold = 0;
  private dustPhase: WeatherPhase = 'clear';
  private dustWarning = false;
  private dustProgress = 0;
  private dustPosition: Point | null = null;
  private shoves = 0;
  private pushedDistance = 0;
  private economyLogLength = -1;

  constructor(
    private readonly economy: Economy,
    private readonly tileState: TileStateStore,
    tileParams: ContractManifest['tileParams'],
    private readonly threats: () => readonly ClaimJumperEnemy[],
    private readonly enabled: () => boolean,
    private readonly onPayout?: (position: THREE.Vector3, amount: number, label: string) => void,
  ) {
    this.group.name = 'E9CanalSystem';
    const truth = domeBasinMask.maskTruth;
    const stakes = tileParams.stakeMarkers?.filter((stake) => STAGE_IDS.includes(stake.id as typeof STAGE_IDS[number]));
    const gatePoints = stakes?.length === STAGE_IDS.length ? stakes : truth.canalStageGates;
    this.route = tileParams.rails?.find((rail) => rail.style === 'feeder-canal')?.points ?? truth.canalRoute.points;
    const patrol = (tileParams.lanes as typeof tileParams.lanes & { patrolRoutes?: Array<{ id: string; points: Point[] }> } | undefined)
      ?.patrolRoutes?.find((lane) => lane.id === 'dust-devil-wander');
    this.devilLane = patrol?.points ?? truth.dustDevilLanes[0]!.points;
    this.gates = gatePoints.map((gate) => this.createGate(gate.id, gate));
    this.quarryNodes = quarryNodes(truth.quarryScarpBands[0]!).map((position, index) => this.createQuarryNode(position, index));
    this.createCanalWater();
    this.dustTelegraph = this.createDustDevil();
    this.group.add(...this.gates.map((gate) => gate.group), ...this.quarryNodes.map((node) => node.mesh), this.canalWater, this.dustTelegraph, this.dustDevil);
    this.stage = this.readStage();
    this.syncVisuals();
  }

  update(delta: number, at: number, actors: readonly Actor[]): boolean {
    const active = this.enabled();
    this.group.visible = active;
    if (!active) return false;
    this.syncPaidObjectives();
    this.updateStage(delta, at, actors);
    this.updateQuarry(delta, at, actors);
    return this.updateDustDevil(delta, at, actors);
  }

  resampleTerrain(): void {
    for (const gate of this.gates) gate.group.position.y = visualY(gate.position.x, gate.position.z, 0);
    for (const node of this.quarryNodes) node.mesh.position.y = visualY(node.position.x, node.position.z, Balance.e9Canal.quarry.packHeight * 0.5);
    for (const child of this.canalWater.children) {
      const { x, z } = child.userData.midpoint as Point;
      child.position.y = visualY(x, z, Balance.e9Canal.canal.waterDepth * 0.5);
    }
    if (this.dustPosition) this.placeDust(this.dustPosition);
  }

  reset(): void {
    this.stageProgress = 0;
    this.contested = false;
    this.stagePayoutGold = 0;
    this.quarryNodeIndex = null;
    this.quarryProgress = 0;
    this.quarryPayoutGold = 0;
    this.dustPhase = 'clear';
    this.dustWarning = false;
    this.dustProgress = 0;
    this.dustPosition = null;
    this.shoves = 0;
    this.pushedDistance = 0;
    for (const node of this.quarryNodes) node.harvested = false;
    this.syncVisuals();
  }

  dispose(): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((entry) => materials.add(entry));
      else if (material) materials.add(material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    this.group.clear();
  }

  get diagnostics(): E9CanalDiagnostics {
    const active = this.enabled();
    return {
      active,
      stage: this.stage,
      activeGateId: active && this.stage < this.gates.length ? this.gates[this.stage]!.id : null,
      stageProgress: round3(this.stageProgress),
      contested: this.contested,
      stagePayoutGold: this.stagePayoutGold,
      gates: this.gates.map((gate, index) => ({ id: gate.id, x: gate.position.x, z: gate.position.z, complete: index < this.stage, active: active && index === this.stage })),
      quarry: {
        bandId: domeBasinMask.maskTruth.quarryScarpBands[0]!.id,
        channelNodeId: this.quarryNodeIndex === null ? null : this.quarryNodes[this.quarryNodeIndex]!.id,
        progress: round3(this.quarryProgress),
        harvested: this.quarryNodes.filter((node) => node.harvested).length,
        total: this.quarryNodes.length,
        payoutGold: this.quarryPayoutGold,
        nodes: this.quarryNodes.map((node) => ({ id: node.id, x: node.position.x, z: node.position.z, harvested: node.harvested })),
      },
      canal: { wet: this.stage >= this.gates.length, renderOnly: true, visualY: true, segments: this.canalWater.children.length },
      dustDevil: {
        mode: 'wander-lane',
        targeting: 'none',
        phase: this.dustPhase,
        warning: this.dustWarning,
        laneId: 'dust-devil-wander',
        laneProgress: round3(this.dustProgress),
        position: this.dustPosition ? { ...this.dustPosition } : null,
        shoves: this.shoves,
        pushedDistance: round3(this.pushedDistance),
      },
    };
  }

  private updateStage(delta: number, at: number, actors: readonly Actor[]): void {
    const gate = this.gates[this.stage];
    if (!gate) {
      this.contested = false;
      return;
    }
    const nearby = actors.some((actor) => distanceSq(actor.position, gate.position) <= Balance.e9Canal.stage.holdRadius ** 2);
    this.contested = this.threats().some((enemy) => enemy.isAlive && distanceSq(enemy.position, gate.position) <= Balance.e9Canal.stage.contestRadius ** 2);
    if (!nearby || this.contested) {
      this.stageProgress = Math.max(0, this.stageProgress - delta * Balance.e9Canal.stage.progressDecayPerSecond);
      return;
    }
    this.stageProgress = Math.min(1, this.stageProgress + delta / Balance.e9Canal.stage.holdSeconds);
    if (this.stageProgress < 1) return;
    const payout = Balance.e9Canal.stage.payouts[this.stage] ?? 0;
    this.economy.apply({ id: `${STAGE_PAYOUT_ID_PREFIX}${this.stage + 1}`, at, type: 'gold_granted', source: 'escort', amount: payout });
    this.stage += 1;
    this.stageProgress = 0;
    this.stagePayoutGold += payout;
    this.tileState.stageWrite(Balance.e9Canal.dustDevil.weather.contractId, {
      kind: 'sim',
      id: CANAL_STAGE_ENTRY_ID,
      payload: { stage: this.stage },
      schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
    this.onPayout?.(new THREE.Vector3(gate.position.x, visualY(gate.position.x, gate.position.z, 0.8), gate.position.z), payout, `C${this.stage} HOLDS`);
    this.syncVisuals();
  }

  private updateQuarry(delta: number, at: number, actors: readonly Actor[]): void {
    const target = nearestQuarryNode(this.quarryNodes, actors);
    if (target === null) {
      this.quarryProgress = Math.max(0, this.quarryProgress - delta * Balance.e9Canal.quarry.progressDecayPerSecond);
      if (this.quarryProgress === 0) this.quarryNodeIndex = null;
      return;
    }
    if (this.quarryNodeIndex !== target) this.quarryProgress = 0;
    this.quarryNodeIndex = target;
    this.quarryProgress = Math.min(1, this.quarryProgress + delta / Balance.e9Canal.quarry.harvestSeconds);
    if (this.quarryProgress < 1) return;
    const node = this.quarryNodes[target]!;
    const payout = Balance.e9Canal.quarry.payout;
    this.economy.apply({ id: `${QUARRY_PAYOUT_ID_PREFIX}${node.id}`, at, type: 'gold_granted', source: 'escort', amount: payout });
    node.harvested = true;
    node.mesh.visible = false;
    this.quarryNodeIndex = null;
    this.quarryProgress = 0;
    this.quarryPayoutGold += payout;
    this.onPayout?.(new THREE.Vector3(node.position.x, visualY(node.position.x, node.position.z, 0.7), node.position.z), payout, 'ICE PACK');
  }

  private updateDustDevil(delta: number, at: number, actors: readonly Actor[]): boolean {
    const weather = this.weather.sample(at);
    this.dustPhase = weather.phase;
    this.dustWarning = weather.warning;
    this.dustProgress = weather.phase === 'storm' ? weather.phaseProgress : 0;
    const visible = weather.phase === 'telegraph' || weather.phase === 'storm';
    this.dustTelegraph.visible = weather.phase === 'telegraph';
    this.dustDevil.visible = weather.phase === 'storm';
    if (!visible) {
      this.dustPosition = null;
      return false;
    }
    const sample = samplePolyline(this.devilLane, this.dustProgress);
    this.dustPosition = { x: sample.x, z: sample.z };
    this.placeDust(this.dustPosition);
    if (weather.phase !== 'storm') return false;
    let shoved = false;
    for (const actor of actors) {
      if (distanceSq(actor.position, sample) > Balance.e9Canal.dustDevil.radius ** 2) continue;
      const distance = Balance.e9Canal.dustDevil.pushPerSecond * delta;
      actor.position.x += sample.tx * distance;
      actor.position.z += sample.tz * distance;
      shoved = true;
      this.shoves += 1;
      this.pushedDistance += distance;
    }
    return shoved;
  }

  private placeDust(position: Point): void {
    const y = visualY(position.x, position.z, 0.02);
    this.dustDevil.position.set(position.x, y, position.z);
    this.dustTelegraph.position.set(position.x, y, position.z);
  }

  private readStage(): number {
    const entry = this.tileState.readSnapshot(Balance.e9Canal.dustDevil.weather.contractId).entries
      .find((candidate) => candidate.kind === 'sim' && candidate.id === CANAL_STAGE_ENTRY_ID);
    const stage = (entry?.payload as { stage?: unknown } | undefined)?.stage;
    return typeof stage === 'number' && Number.isInteger(stage) ? THREE.MathUtils.clamp(stage, 0, STAGE_IDS.length) : 0;
  }

  /** Economy is already part of RunSuspend, so its stable receipt IDs are the
   * restore seam for these run-local objectives. Tile state still lands only at
   * the existing run-end commit boundary. */
  private syncPaidObjectives(): void {
    const log = this.economy.log;
    if (log.length === this.economyLogLength) return;
    this.economyLogLength = log.length;
    let resetIndex = -1;
    for (let index = log.length - 1; index >= 0; index -= 1) {
      if (log[index]!.type === 'run_reset') {
        resetIndex = index;
        break;
      }
    }
    const runEvents = log.slice(resetIndex + 1);
    let changed = false;
    let paidStage = this.stage;
    for (const event of runEvents) {
      if (!event.id.startsWith(STAGE_PAYOUT_ID_PREFIX)) continue;
      const candidate = Number.parseInt(event.id.slice(STAGE_PAYOUT_ID_PREFIX.length), 10);
      if (Number.isInteger(candidate)) paidStage = Math.max(paidStage, THREE.MathUtils.clamp(candidate, 0, STAGE_IDS.length));
    }
    if (paidStage > this.stage) {
      this.stage = paidStage;
      this.stageProgress = 0;
      changed = true;
      this.tileState.stageWrite(Balance.e9Canal.dustDevil.weather.contractId, {
        kind: 'sim',
        id: CANAL_STAGE_ENTRY_ID,
        payload: { stage: this.stage },
        schemaVersion: TILE_STATE_SCHEMA_VERSION,
      });
    }
    this.stagePayoutGold = runEvents.reduce(
      (sum, event) => sum + (event.type === 'gold_granted' && event.id.startsWith(STAGE_PAYOUT_ID_PREFIX) ? event.amount : 0),
      0,
    );
    this.quarryPayoutGold = runEvents.reduce(
      (sum, event) => sum + (event.type === 'gold_granted' && event.id.startsWith(QUARRY_PAYOUT_ID_PREFIX) ? event.amount : 0),
      0,
    );
    for (const node of this.quarryNodes) {
      const harvested = runEvents.some((event) => event.id === `${QUARRY_PAYOUT_ID_PREFIX}${node.id}`);
      if (harvested !== node.harvested) changed = true;
      node.harvested = harvested;
    }
    if (changed) this.syncVisuals();
  }

  private syncVisuals(): void {
    const active = this.enabled();
    this.group.visible = active;
    this.gates.forEach((gate, index) => {
      const color = index < this.stage ? Balance.e9Canal.stage.completeColor : index === this.stage ? Balance.e9Canal.stage.activeColor : Balance.e9Canal.stage.dryColor;
      gate.material.color.set(color);
      gate.material.emissive.set(index === this.stage ? color : '#000000');
      gate.material.emissiveIntensity = index === this.stage ? 0.18 : 0;
      gate.material.opacity = index <= this.stage ? 1 : 0.45;
    });
    this.quarryNodes.forEach((node) => node.mesh.visible = active && !node.harvested);
    this.canalWater.visible = active && this.stage >= this.gates.length;
    this.dustDevil.visible = false;
    this.dustTelegraph.visible = false;
    this.resampleTerrain();
  }

  private createGate(id: string, position: Point): GateView {
    const group = new THREE.Group();
    group.name = id;
    group.position.set(position.x, 0, position.z);
    const material = new THREE.MeshStandardMaterial({ color: Balance.e9Canal.stage.dryColor, roughness: 0.72, metalness: 0.2, transparent: true });
    const postGeometry = new THREE.BoxGeometry(0.16, Balance.e9Canal.stage.postHeight, 0.16);
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeometry, material);
      post.position.set(side * Balance.e9Canal.stage.postSpacing * 0.5, Balance.e9Canal.stage.postHeight * 0.5, 0);
      group.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(Balance.e9Canal.stage.postSpacing + 0.22, 0.14, 0.18), material);
    beam.position.y = Balance.e9Canal.stage.postHeight;
    group.add(beam);
    return { id, position: { x: position.x, z: position.z }, group, material };
  }

  private createQuarryNode(position: Point, index: number): QuarryNode {
    const geometry = new THREE.BoxGeometry(Balance.e9Canal.quarry.packWidth, Balance.e9Canal.quarry.packHeight, Balance.e9Canal.quarry.packDepth);
    const material = new THREE.MeshStandardMaterial({ color: Balance.e9Canal.quarry.color, emissive: Balance.e9Canal.quarry.emissive, emissiveIntensity: 0.16, roughness: 0.42 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `IcePack-${index + 1}`;
    mesh.position.set(position.x, 0, position.z);
    mesh.rotation.set(index % 2 ? 0.08 : -0.06, index * 0.43, index % 2 ? -0.12 : 0.1);
    mesh.castShadow = true;
    return { id: `ice-pack-${index + 1}`, position, mesh, harvested: false };
  }

  private createCanalWater(): void {
    const material = new THREE.MeshStandardMaterial({ color: Balance.e9Canal.canal.color, transparent: true, opacity: Balance.e9Canal.canal.opacity, roughness: 0.28, metalness: 0.02 });
    for (let index = 1; index < this.route.length; index += 1) {
      const start = this.route[index - 1]!;
      const end = this.route[index]!;
      const dx = end.x - start.x;
      const dz = end.z - start.z;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(dx, dz), Balance.e9Canal.canal.waterDepth, Balance.e9Canal.canal.waterWidth), material);
      const midpoint = { x: (start.x + end.x) * 0.5, z: (start.z + end.z) * 0.5 };
      mesh.name = `CanalWetSegment-${index}`;
      mesh.position.set(midpoint.x, 0, midpoint.z);
      mesh.rotation.y = -Math.atan2(dz, dx);
      mesh.userData.midpoint = midpoint;
      this.canalWater.add(mesh);
    }
    this.canalWater.name = 'C3CanalWaterRenderOnly';
  }

  private createDustDevil(): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({ color: Balance.e9Canal.dustDevil.color, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide });
    const column = new THREE.Mesh(new THREE.ConeGeometry(Balance.e9Canal.dustDevil.columnRadius, Balance.e9Canal.dustDevil.columnHeight, 12, 1, true), material);
    column.position.y = Balance.e9Canal.dustDevil.columnHeight * 0.5;
    this.dustDevil.add(column);
    for (let index = 0; index < 3; index += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(Balance.e9Canal.dustDevil.columnRadius * (0.55 + index * 0.18), 0.055, 5, 24), material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.65 + index * 1.25;
      this.dustDevil.add(ring);
    }
    this.dustDevil.name = 'DustDevilWanderColumn';
    const telegraph = new THREE.Mesh(
      new THREE.RingGeometry(Balance.e9Canal.dustDevil.radius * 0.78, Balance.e9Canal.dustDevil.radius, 32),
      new THREE.MeshBasicMaterial({ color: Balance.e9Canal.dustDevil.telegraphColor, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
    );
    telegraph.name = 'DustDevilTelegraph';
    telegraph.rotation.x = -Math.PI / 2;
    return telegraph;
  }
}

function quarryNodes(band: { minX: number; maxX: number; minZ: number; maxZ: number }): Point[] {
  return Array.from({ length: Balance.e9Canal.quarry.nodeCount }, (_, index) => ({
    x: band.minX + ((index + 0.5) / Balance.e9Canal.quarry.nodeCount) * (band.maxX - band.minX),
    z: (band.minZ + band.maxZ) * 0.5 + (index % 2 ? 1 : -1),
  }));
}

function nearestQuarryNode(nodes: readonly QuarryNode[], actors: readonly Actor[]): number | null {
  let nearest: number | null = null;
  let nearestSq = Balance.e9Canal.quarry.harvestRange ** 2;
  for (const actor of actors) {
    if (actor.speed > Balance.e9Canal.quarry.slowSpeed) continue;
    nodes.forEach((node, index) => {
      if (node.harvested) return;
      const candidate = distanceSq(actor.position, node.position);
      if (candidate <= nearestSq) {
        nearest = index;
        nearestSq = candidate;
      }
    });
  }
  return nearest;
}

function samplePolyline(points: readonly Point[], progress: number): Point & { tx: number; tz: number } {
  if (points.length < 2) return { x: points[0]?.x ?? 0, z: points[0]?.z ?? 0, tx: 1, tz: 0 };
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index]!.x, point.z - points[index]!.z));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = THREE.MathUtils.clamp(progress, 0, 1) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining > length && index < lengths.length - 1) {
      remaining -= length;
      continue;
    }
    const start = points[index]!;
    const end = points[index + 1]!;
    const t = length > 0 ? Math.min(1, remaining / length) : 0;
    return { x: THREE.MathUtils.lerp(start.x, end.x, t), z: THREE.MathUtils.lerp(start.z, end.z, t), tx: length > 0 ? (end.x - start.x) / length : 1, tz: length > 0 ? (end.z - start.z) / length : 0 };
  }
  const end = points.at(-1)!;
  return { x: end.x, z: end.z, tx: 1, tz: 0 };
}

function distanceSq(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
