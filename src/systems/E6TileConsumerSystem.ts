import * as THREE from 'three';
import glowMesaMask from '../../assets/contracts/epoch-6-atomic/mask-tables/e6-glow-mesa.json' with { type: 'json' };
import { FIXED_SIM_STEP_SECONDS } from '../core/Loop';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import { TILE_STATE_SCHEMA_VERSION, type TileStateStore } from '../game/TileStateStore';
import type { ContractManifest } from '../meta/ContractFamilies';
import { visualY } from '../world/Terrain';
import type { DecayHandle, DecayScheduler } from './DecaySystem';

export const E6_TILE_STATE_ENTRY_ID = 'e6-decay-fields-and-night-veins';

type Actor = { position: THREE.Vector3 };
type Point = { x: number; z: number };
type Puddle = {
  id: string;
  index: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  x: number;
  z: number;
  safe: boolean;
  handle: DecayHandle;
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
};
type Vein = {
  id: string;
  position: Point;
  harvested: boolean;
  mesh: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>;
};

export type E6TileConsumerDiagnostics = {
  active: boolean;
  storyGate: 'puddles decay to safe on dials; harvest the six-vein ring after dark';
  puddles: Array<{
    id: string;
    safe: boolean;
    stage: number;
    remainingTicks: number;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    visualY: true;
  }>;
  night: { active: boolean; remainingTicks: number };
  veins: {
    active: boolean;
    channelId: string | null;
    progress: number;
    harvested: number;
    total: number;
    payoutGold: number;
    nodes: Array<{ id: string; x: number; z: number; harvested: boolean }>;
  };
};

/** E6 bundle §B: decay fields breathe on honest dials and starstone only opens at night. */
export class E6TileConsumerSystem {
  readonly group = new THREE.Group();

  private enabled: boolean;
  private readonly puddles: Puddle[];
  private readonly veins: Vein[];
  private nightHandle: DecayHandle = 0;
  private night = false;
  private channelId: string | null = null;
  private harvestProgress = 0;
  private payoutGold = 0;
  private economyLogLength = -1;

  constructor(
    private readonly active: boolean,
    private readonly contractId: string,
    private readonly decay: DecayScheduler,
    private readonly economy: Economy,
    private readonly tileState: TileStateStore,
    tileParams: ContractManifest['tileParams'],
    private readonly onHarvest?: (position: THREE.Vector3, amount: number) => void,
  ) {
    this.enabled = active;
    this.group.name = 'E6TileConsumerSystem';
    this.group.visible = active;
    const saved = this.readState();
    this.night = saved?.night ?? false;
    const safeFields = new Set(saved?.safeFields ?? []);
    const harvestedVeins = new Set(saved?.harvestedVeins ?? []);
    this.puddles = glowMesaMask.maskTruth.decayFields.map((field, index) =>
      this.createPuddle(field, index, safeFields.has(field.id)),
    );
    this.veins = (tileParams.harvestAnchors ?? []).map((position, index) =>
      this.createVein(position, index, harvestedVeins.has(`night-vein-${index + 1}`)),
    );
    this.group.add(...this.puddles.map((puddle) => puddle.mesh), ...this.veins.map((vein) => vein.mesh));
    if (active) this.armTimers();
    this.syncVisuals();
  }

  update(delta: number, at: number, actors: readonly Actor[]): void {
    if (!this.enabled) return;
    this.syncHarvestReceipts();
    this.puddles.forEach((puddle) => this.syncPuddle(puddle));
    if (!this.night) return this.clearChannel();

    const nearest = nearestVein(this.veins, actors);
    if (!nearest) return this.clearChannel();
    if (this.channelId !== nearest.id) this.harvestProgress = 0;
    this.channelId = nearest.id;
    this.harvestProgress = Math.min(1, this.harvestProgress + delta / Balance.e6Tiles.veins.harvestSeconds);
    if (this.harvestProgress < 1) return;

    const result = this.economy.apply({
      id: `e6-night-vein:${nearest.id}`,
      at,
      type: 'gold_panned',
      nodeId: nearest.id,
      amount: Balance.e6Tiles.veins.goldPerVein,
      actor: 'player',
    });
    if (!result.ok) return;
    nearest.harvested = true;
    this.payoutGold += Balance.e6Tiles.veins.goldPerVein;
    this.onHarvest?.(
      new THREE.Vector3(nearest.position.x, visualY(nearest.position.x, nearest.position.z, Balance.e6Tiles.veins.visualHeight), nearest.position.z),
      Balance.e6Tiles.veins.goldPerVein,
    );
    this.clearChannel();
    this.persist();
    this.syncVisuals();
  }

  reset(): void {
    this.clearChannel();
    this.payoutGold = 0;
    this.economyLogLength = -1;
    if (this.enabled) this.armTimers();
    this.syncVisuals();
  }

  setEnabled(enabled: boolean): void {
    const next = this.active && enabled;
    if (next === this.enabled) return;
    this.enabled = next;
    this.clearChannel();
    if (next) this.armTimers();
    else this.cancelTimers();
    this.syncVisuals();
  }

  isWalkable(x: number, z: number): boolean {
    return !this.enabled || !this.puddles.some((puddle) =>
      !puddle.safe &&
      x >= puddle.bounds.minX && x <= puddle.bounds.maxX &&
      z >= puddle.bounds.minZ && z <= puddle.bounds.maxZ,
    );
  }

  get blockers(): Array<{ x: number; z: number; halfX: number; halfZ: number }> {
    if (!this.enabled) return [];
    return this.puddles.filter((puddle) => !puddle.safe).map((puddle) => ({
      x: puddle.x,
      z: puddle.z,
      halfX: (puddle.bounds.maxX - puddle.bounds.minX) * 0.5,
      halfZ: (puddle.bounds.maxZ - puddle.bounds.minZ) * 0.5,
    }));
  }

  resampleTerrain(): void {
    for (const puddle of this.puddles) {
      puddle.mesh.position.y = visualY(puddle.x, puddle.z, Balance.e6Tiles.puddles.height * 0.5);
    }
    for (const vein of this.veins) {
      vein.mesh.position.y = visualY(vein.position.x, vein.position.z, Balance.e6Tiles.veins.visualHeight);
    }
  }

  dispose(): void {
    this.cancelTimers();
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

  get diagnostics(): E6TileConsumerDiagnostics {
    return {
      active: this.enabled,
      storyGate: 'puddles decay to safe on dials; harvest the six-vein ring after dark',
      puddles: this.puddles.map((puddle) => {
        const remainingTicks = this.decay.remaining(puddle.handle) ?? 0;
        const fraction = this.decay.fraction(puddle.handle) ?? 0;
        return {
          id: puddle.id,
          safe: puddle.safe,
          stage: puddle.safe ? 0 : Math.max(1, Math.ceil(fraction * Balance.e6Tiles.puddles.stages)),
          remainingTicks,
          ...puddle.bounds,
          visualY: true,
        };
      }),
      night: { active: this.night, remainingTicks: this.decay.remaining(this.nightHandle) ?? 0 },
      veins: {
        active: this.night,
        channelId: this.channelId,
        progress: round3(this.harvestProgress),
        harvested: this.veins.filter((vein) => vein.harvested).length,
        total: this.veins.length,
        payoutGold: this.payoutGold,
        nodes: this.veins.map((vein) => ({ id: vein.id, ...vein.position, harvested: vein.harvested })),
      },
    };
  }

  private armTimers(): void {
    for (const puddle of this.puddles) this.armPuddle(puddle);
    this.armNight();
  }

  private cancelTimers(): void {
    for (const puddle of this.puddles) {
      this.decay.cancel(puddle.handle);
      puddle.handle = 0;
    }
    this.decay.cancel(this.nightHandle);
    this.nightHandle = 0;
  }

  private armPuddle(puddle: Puddle): void {
    const seconds = puddle.safe
      ? Balance.e6Tiles.puddles.safeSeconds
      : Balance.e6Tiles.puddles.unsafeSeconds + puddle.index * Balance.e6Tiles.puddles.staggerSeconds;
    puddle.handle = this.decay.register({
      id: `e6-puddle:${puddle.id}:${puddle.safe ? 'safe' : 'fading'}`,
      durationTicks: secondsToTicks(seconds),
      onExpire: () => {
        puddle.safe = !puddle.safe;
        this.persist();
        this.syncPuddle(puddle);
        this.armPuddle(puddle);
      },
    });
  }

  private armNight(): void {
    this.nightHandle = this.decay.register({
      id: `e6-night:${this.night ? 'open' : 'waiting'}`,
      durationTicks: secondsToTicks(this.night ? Balance.e6Tiles.night.nightSeconds : Balance.e6Tiles.night.daySeconds),
      onExpire: () => {
        this.night = !this.night;
        this.clearChannel();
        this.persist();
        this.syncVisuals();
        this.armNight();
      },
    });
  }

  private createPuddle(
    field: (typeof glowMesaMask.maskTruth.decayFields)[number],
    index: number,
    safe: boolean,
  ): Puddle {
    const width = field.maxX - field.minX;
    const depth = field.maxZ - field.minZ;
    const material = new THREE.MeshStandardMaterial({
      color: Balance.e6Tiles.puddles.activeColor,
      emissive: Balance.e6Tiles.puddles.activeColor,
      emissiveIntensity: Balance.e6Tiles.puddles.emissiveIntensity,
      transparent: true,
      opacity: Balance.e6Tiles.puddles.activeOpacity,
      roughness: 0.34,
      metalness: 0.04,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, Balance.e6Tiles.puddles.height, depth), material);
    const x = (field.minX + field.maxX) * 0.5;
    const z = (field.minZ + field.maxZ) * 0.5;
    mesh.name = field.id;
    mesh.position.set(x, 0, z);
    mesh.receiveShadow = true;
    return { id: field.id, index, bounds: { ...field }, x, z, safe, handle: 0, mesh };
  }

  private createVein(position: Point, index: number, harvested: boolean): Vein {
    const material = new THREE.MeshStandardMaterial({
      color: Balance.e6Tiles.veins.dormantColor,
      emissive: Balance.e6Tiles.veins.dormantColor,
      emissiveIntensity: Balance.e6Tiles.veins.dormantEmissiveIntensity,
      roughness: 0.38,
      metalness: 0.12,
    });
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(Balance.e6Tiles.veins.radius, 0), material);
    const id = `night-vein-${index + 1}`;
    mesh.name = id;
    mesh.position.set(position.x, 0, position.z);
    mesh.castShadow = true;
    return { id, position: { ...position }, harvested, mesh };
  }

  private syncVisuals(): void {
    this.group.visible = this.enabled;
    this.puddles.forEach((puddle) => this.syncPuddle(puddle));
    for (const vein of this.veins) {
      vein.mesh.visible = this.enabled && !vein.harvested;
      vein.mesh.material.color.set(this.night ? Balance.e6Tiles.veins.activeColor : Balance.e6Tiles.veins.dormantColor);
      vein.mesh.material.emissive.set(this.night ? Balance.e6Tiles.veins.activeColor : Balance.e6Tiles.veins.dormantColor);
      vein.mesh.material.emissiveIntensity = this.night
        ? Balance.e6Tiles.veins.activeEmissiveIntensity
        : Balance.e6Tiles.veins.dormantEmissiveIntensity;
    }
    this.resampleTerrain();
  }

  private syncPuddle(puddle: Puddle): void {
    const stage = Math.max(1, Math.ceil((this.decay.fraction(puddle.handle) ?? 0) * Balance.e6Tiles.puddles.stages));
    const glow = stage / Balance.e6Tiles.puddles.stages;
    puddle.mesh.material.color.set(puddle.safe ? Balance.e6Tiles.puddles.safeColor : Balance.e6Tiles.puddles.activeColor);
    puddle.mesh.material.emissive.set(puddle.safe ? Balance.e6Tiles.puddles.safeColor : Balance.e6Tiles.puddles.activeColor);
    puddle.mesh.material.emissiveIntensity = puddle.safe ? 0 : Balance.e6Tiles.puddles.emissiveIntensity * glow;
    puddle.mesh.material.opacity = puddle.safe ? Balance.e6Tiles.puddles.safeOpacity : Balance.e6Tiles.puddles.activeOpacity * glow;
  }

  private clearChannel(): void {
    this.channelId = null;
    this.harvestProgress = 0;
  }

  /** Economy receipts survive RunSuspend; fold them back into the run-local
   * vein flags before another channel can begin. */
  private syncHarvestReceipts(): void {
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
    this.payoutGold = 0;
    for (const event of runEvents) {
      if (event.type !== 'gold_panned' || !event.id.startsWith('e6-night-vein:')) continue;
      this.payoutGold += event.amount;
      const vein = this.veins.find((candidate) => candidate.id === event.nodeId);
      if (vein && !vein.harvested) {
        vein.harvested = true;
        changed = true;
      }
    }
    if (changed) {
      this.persist();
      this.syncVisuals();
    }
  }

  private persist(): void {
    this.tileState.stageWrite(this.contractId, {
      kind: 'sim',
      id: E6_TILE_STATE_ENTRY_ID,
      payload: {
        safeFields: this.puddles.filter((puddle) => puddle.safe).map((puddle) => puddle.id),
        harvestedVeins: this.veins.filter((vein) => vein.harvested).map((vein) => vein.id),
        night: this.night,
      },
      schemaVersion: TILE_STATE_SCHEMA_VERSION,
    });
  }

  private readState(): { safeFields: string[]; harvestedVeins: string[]; night: boolean } | null {
    const payload = this.tileState.readSnapshot(this.contractId).entries
      .find((entry) => entry.kind === 'sim' && entry.id === E6_TILE_STATE_ENTRY_ID)?.payload;
    if (!isRecord(payload)) return null;
    const fieldIds = new Set(glowMesaMask.maskTruth.decayFields.map((field) => field.id));
    const veinIds = new Set(Array.from({ length: 6 }, (_, index) => `night-vein-${index + 1}`));
    return {
      safeFields: stringArray(payload.safeFields).filter((id) => fieldIds.has(id)),
      harvestedVeins: stringArray(payload.harvestedVeins).filter((id) => veinIds.has(id)),
      night: payload.night === true,
    };
  }
}

function nearestVein(veins: readonly Vein[], actors: readonly Actor[]): Vein | null {
  let closest: Vein | null = null;
  let closestSq = Balance.e6Tiles.veins.harvestRange ** 2;
  for (const vein of veins) {
    if (vein.harvested) continue;
    for (const actor of actors) {
      const dx = actor.position.x - vein.position.x;
      const dz = actor.position.z - vein.position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > closestSq) continue;
      closest = vein;
      closestSq = distanceSq;
    }
  }
  return closest;
}

function secondsToTicks(seconds: number): number {
  return Math.max(1, Math.round(seconds / FIXED_SIM_STEP_SECONDS));
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
