import * as THREE from 'three';
import { createRng, type Rng, type RngState } from '../core/Rng';
import { getDebugSeed } from '../core/DebugParams';
import { RenderLayers } from '../core/RenderLayers';
import { GoldNode, GoldNodeVisualBatch, type GoldNodeFutureState, type GoldNodeSnapshot } from '../entities/GoldNode';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import { visualY, type Vec2 } from '../world/Terrain';

export type HarvestSnapshot = {
  activeNodes: GoldNodeSnapshot[];
  channeling: boolean;
  channelNodeId: string | null;
  progress: number;
  lastGoldGain: number;
  lastGoldPosition: { x: number; y: number; z: number } | null;
};

export type HarvestFutureState = {
  rng: RngState;
  nodes: GoldNodeFutureState[];
  channelNodeId: string | null;
  progress: number;
  panCapBlocked: boolean;
};

type HarvestTarget = {
  position: THREE.Vector3;
  speed: number;
};

type ChannelTarget = {
  node: GoldNode;
  collector: HarvestTarget;
};

export class HarvestSystem {
  readonly group = new THREE.Group();

  private readonly nodes: GoldNode[];
  private readonly nodeVisuals: GoldNodeVisualBatch;
  private readonly rng: Rng;
  private readonly progressGroup = new THREE.Group();
  private readonly progressFill: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly progressFillIndexCount: number;
  private channelNode: GoldNode | null = null;
  private progress = 0;
  private lastGoldGain = 0;
  private lastGoldPosition: THREE.Vector3 | null = null;
  private panTickMult = 1;
  private panYieldMult = 1;
  private seamCapacityBonus = 0;
  private seamRespawnReduction = 0;
  private panCapBlocked = false;

  constructor(
    private readonly economy: Economy,
    private readonly anchors: readonly Vec2[],
    rng: Rng = createRng(getDebugSeed()),
    private readonly onGoldTick?: (amount: number) => void,
    private readonly onGoldBlocked?: (position: THREE.Vector3) => void,
  ) {
    this.rng = rng;
    this.group.name = 'HarvestSystem';
    this.nodeVisuals = new GoldNodeVisualBatch(anchors.length);
    this.nodes = anchors.map((_, index) => new GoldNode(`gold-seam-${index + 1}`, index, this.nodeVisuals));

    this.group.add(this.nodeVisuals.group);
    for (const node of this.nodes) {
      this.group.add(node.group);
    }

    const progressBack = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 0.92, 48),
      new THREE.MeshBasicMaterial({
        color: '#2e1b0e',
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    progressBack.rotation.x = -Math.PI / 2;
    progressBack.renderOrder = RenderLayers.groundDecals;

    this.progressFill = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 0.92, 48),
      new THREE.MeshBasicMaterial({
        color: '#ffe4a0',
        transparent: true,
        opacity: 0.86,
        side: THREE.DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    this.progressFill.rotation.x = -Math.PI / 2;
    this.progressFill.renderOrder = RenderLayers.groundDecals;
    this.progressFillIndexCount =
      this.progressFill.geometry.index?.count ?? this.progressFill.geometry.attributes.position.count;
    this.progressFill.geometry.setDrawRange(0, 0);

    this.progressGroup.name = 'GoldPanProgressRing';
    this.progressGroup.visible = false;
    this.progressGroup.add(progressBack, this.progressFill);
    this.group.add(this.progressGroup);

    this.activateInitialNodes();
  }

  get snapshot(): HarvestSnapshot {
    return this.buildSnapshot(0);
  }

  captureFutureState(at: number): HarvestFutureState {
    return {
      rng: this.rng.snapshot(),
      nodes: this.nodes.map((node) => node.snapshot(at)),
      channelNodeId: this.channelNode?.id ?? null,
      progress: this.progress,
      panCapBlocked: this.panCapBlocked,
    };
  }

  restoreFutureState(state: HarvestFutureState, at: number): boolean {
    if (!this.canRestoreFutureState(state)) return false;

    this.rng.restore(state.rng);
    const byId = new Map(state.nodes.map((node) => [node.id, node]));
    for (const node of this.nodes) node.restoreFutureState(byId.get(node.id)!, at);
    this.channelNode = state.channelNodeId === null ? null : (this.nodes.find((node) => node.id === state.channelNodeId) ?? null);
    this.progress = state.progress;
    this.panCapBlocked = state.panCapBlocked;
    this.lastGoldGain = 0;
    this.lastGoldPosition = null;
    this.updateProgressRing(at);
    return true;
  }

  canRestoreFutureState(state: HarvestFutureState): boolean {
    return this.validFutureState(state);
  }

  resetFromSeed(seed: string | number | null | undefined): void {
    this.rng.reset(seed);
    this.resetState();
  }

  update(
    delta: number,
    at: number,
    heroPosition: THREE.Vector3 | readonly HarvestTarget[],
    heroSpeed = 0,
  ): HarvestSnapshot {
    this.lastGoldGain = 0;
    this.lastGoldPosition = null;
    const collectors = Array.isArray(heroPosition) ? heroPosition : [{ position: heroPosition, speed: heroSpeed }];

    for (const node of this.nodes) {
      if (node.isRespawnReady(at)) {
        const anchorIndex = this.pickOpenAnchor(node.currentAnchorIndex);
        this.placeNode(node, anchorIndex);
      }
      node.update(delta, at);
    }

    const target = this.findChannelTarget(collectors);
    if (target) {
      if (target.node !== this.channelNode) this.panCapBlocked = false;
      this.channelNode = target.node;
      this.progress = Math.min(1, this.progress + delta / (Balance.goldSeam.tickSeconds * this.panTickMult));
      this.collectReadyTicks(at, target.node, target.collector.position);
    } else {
      this.progress = Math.max(
        0,
        this.progress -
          (delta / (Balance.goldSeam.tickSeconds * this.panTickMult)) * Balance.goldSeam.decayMultiplier,
      );
      if (this.progress === 0) this.channelNode = null;
      if (this.progress < 1) this.panCapBlocked = false;
    }

    this.updateProgressRing(at);
    return this.buildSnapshot(at);
  }

  dispose(): void {
    this.nodeVisuals.dispose();
    for (const child of this.progressGroup.children) {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const entry of material) entry.dispose();
      } else {
        material?.dispose();
      }
    }
  }

  reset(): void {
    this.rng.reset();
    this.resetState();
  }

  private resetState(): void {
    this.panTickMult = 1;
    this.panYieldMult = 1;
    this.seamCapacityBonus = 0;
    this.seamRespawnReduction = 0;
    this.channelNode = null;
    this.progress = 0;
    this.lastGoldGain = 0;
    this.lastGoldPosition = null;
    this.panCapBlocked = false;
    this.progressGroup.visible = false;
    this.progressFill.geometry.setDrawRange(0, 0);
    for (const node of this.nodes) {
      node.resetInactive();
    }
    this.activateInitialNodes();
  }

  applyStats(panTickMult: number, seamCapacityBonus: number, seamRespawnReduction: number, panYieldMult = 1): void {
    this.panTickMult = Math.max(0.1, panTickMult);
    this.panYieldMult = Math.max(0.1, panYieldMult);
    this.seamCapacityBonus = seamCapacityBonus;
    this.seamRespawnReduction = seamRespawnReduction;
    // Existing and future seams share one run stat so panning rules stay consistent after a pick.
    const capacity = Balance.goldSeam.capacity + this.seamCapacityBonus;
    const respawnSeconds = Math.max(0, Balance.goldSeam.respawnSeconds - this.seamRespawnReduction);
    for (const node of this.nodes) node.applyStats(capacity, respawnSeconds);
  }

  private activateInitialNodes(): void {
    const activeCount = this.rng.int(Balance.goldSeam.activeMin, Balance.goldSeam.activeMax + 1);
    const anchorIndexes = this.shuffledAnchorIndexes();
    for (let index = 0; index < activeCount; index += 1) {
      this.placeNode(this.nodes[index], anchorIndexes[index]);
    }
  }

  private placeNode(node: GoldNode, anchorIndex: number): void {
    node.place(this.anchors[anchorIndex], anchorIndex);
  }

  private collectReadyTicks(at: number, node: GoldNode, collectorPosition: THREE.Vector3): void {
    while (this.progress >= 1 && node.isActive) {
      const gained = Math.min(Balance.goldSeam.tickGold * this.panYieldMult, node.remainingGold);
      if (gained <= 0) break;
      if (!this.economy.canReceiveIncome(gained)) {
        if (!this.panCapBlocked) {
          this.economy.apply({ id: createEconomyEventId(), at, type: 'gold_capped', amount: 0 });
          this.onGoldBlocked?.(node.group.position);
        }
        this.panCapBlocked = true;
        break;
      }

      const result = this.economy.apply({
        id: createEconomyEventId(),
        at,
        type: 'gold_panned',
        nodeId: node.id,
        amount: gained,
      });
      if (result.ok) {
        this.progress -= 1;
        node.takeGold(gained);
        this.panCapBlocked = false;
        this.lastGoldGain += gained;
        this.lastGoldPosition = collectorPosition.clone();
        this.onGoldTick?.(gained);
      } else {
        break;
      }

      if (node.remainingGold <= 0) {
        node.deactivateUntil(at);
        this.channelNode = null;
        this.progress = 0;
      }
    }
  }

  private findChannelTarget(collectors: readonly HarvestTarget[]): ChannelTarget | null {
    let nearest: ChannelTarget | null = null;
    let nearestDistanceSq = Balance.goldSeam.channelRange * Balance.goldSeam.channelRange;
    for (const collector of collectors) {
      if (collector.speed > Balance.goldSeam.slowSpeed) continue;
      for (const node of this.nodes) {
        if (!node.isActive) continue;
        const dx = node.group.position.x - collector.position.x;
        const dz = node.group.position.z - collector.position.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq <= nearestDistanceSq) {
          nearest = { node, collector };
          nearestDistanceSq = distanceSq;
        }
      }
    }
    return nearest;
  }

  private pickOpenAnchor(excludedAnchorIndex: number): number {
    const activeAnchorIndexes = new Set(
      this.nodes.filter((node) => node.isActive).map((node) => node.currentAnchorIndex),
    );
    const candidates = this.anchors
      .map((_, index) => index)
      .filter((index) => index !== excludedAnchorIndex && !activeAnchorIndexes.has(index));
    const pool = candidates.length > 0 ? candidates : this.anchors.map((_, index) => index);
    return pool[this.rng.int(0, pool.length)];
  }

  private updateProgressRing(at: number): void {
    const ringNode = this.channelNode;
    this.progressGroup.visible = ringNode !== null && this.progress > 0;
    if (!ringNode) return;

    this.progressGroup.position.set(ringNode.group.position.x, visualY(ringNode.group.position.x, ringNode.group.position.z, 0.08), ringNode.group.position.z);
    const wobble = Math.sin(at * 8.5 + ringNode.currentAnchorIndex) * 0.06;
    this.progressGroup.rotation.y = at * 0.8;
    this.progressGroup.scale.setScalar(1 + wobble);
    this.progressFill.geometry.setDrawRange(0, Math.floor(this.progressFillIndexCount * this.progress));
  }

  private shuffledAnchorIndexes(): number[] {
    const indexes = this.anchors.map((_, index) => index);
    for (let index = indexes.length - 1; index > 0; index -= 1) {
      const swapIndex = this.rng.int(0, index + 1);
      [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
    }
    return indexes;
  }

  private buildSnapshot(at: number): HarvestSnapshot {
    return {
      activeNodes: this.nodes.map((node) => node.snapshot(at)),
      channeling: this.channelNode !== null,
      channelNodeId: this.channelNode?.id ?? null,
      progress: this.progress,
      lastGoldGain: this.lastGoldGain,
      lastGoldPosition: this.lastGoldPosition
        ? { x: this.lastGoldPosition.x, y: this.lastGoldPosition.y, z: this.lastGoldPosition.z }
        : null,
    };
  }

  private validFutureState(state: HarvestFutureState): boolean {
    if (
      !state ||
      !Number.isInteger(state.rng?.seed) ||
      state.rng.seed < 0 ||
      state.rng.seed > 0xffffffff ||
      !Number.isInteger(state.rng.calls) ||
      state.rng.calls < 0 ||
      state.rng.calls > 1_000_000 ||
      !Number.isFinite(state.progress) ||
      state.progress < 0 ||
      state.progress > 1 ||
      typeof state.panCapBlocked !== 'boolean' ||
      !Array.isArray(state.nodes) ||
      state.nodes.length !== this.nodes.length
    ) {
      return false;
    }

    const expectedIds = new Set(this.nodes.map((node) => node.id));
    const seenIds = new Set<string>();
    for (const node of state.nodes) {
      if (
        !node ||
        !expectedIds.has(node.id) ||
        seenIds.has(node.id) ||
        typeof node.active !== 'boolean' ||
        !Number.isInteger(node.anchorIndex) ||
        node.anchorIndex < -1 ||
        node.anchorIndex >= this.anchors.length ||
        (node.active && node.anchorIndex < 0) ||
        !Number.isFinite(node.position?.x) ||
        Math.abs(node.position.x) > 10_000 ||
        !Number.isFinite(node.position?.z) ||
        Math.abs(node.position.z) > 10_000 ||
        !Number.isFinite(node.remaining) ||
        node.remaining < 0 ||
        node.remaining > 1_000_000 ||
        typeof node.respawnScheduled !== 'boolean' ||
        !Number.isFinite(node.respawnIn) ||
        node.respawnIn < 0 ||
        node.respawnIn > 1000 * 60 * 60 * 24 * 365 * 10 ||
        (node.active && (node.respawnScheduled || node.respawnIn !== 0)) ||
        (!node.respawnScheduled && node.respawnIn !== 0)
      ) {
        return false;
      }
      seenIds.add(node.id);
    }

    if (state.channelNodeId === null) return state.progress === 0;
    const channelNode = state.nodes.find((node) => node.id === state.channelNodeId);
    return channelNode?.active === true;
  }
}

function createEconomyEventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const random = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${random()}${random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;
}
