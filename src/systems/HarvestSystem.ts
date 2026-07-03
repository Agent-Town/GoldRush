import * as THREE from 'three';
import { createRng, type Rng } from '../core/Rng';
import { getDebugSeed } from '../core/DebugParams';
import { GoldNode, GoldNodeVisualBatch, type GoldNodeSnapshot } from '../entities/GoldNode';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import type { Vec2 } from '../world/Terrain';

export type HarvestSnapshot = {
  activeNodes: GoldNodeSnapshot[];
  channeling: boolean;
  channelNodeId: string | null;
  progress: number;
  lastGoldGain: number;
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

  constructor(
    private readonly economy: Economy,
    private readonly anchors: readonly Vec2[],
    rng: Rng = createRng(getDebugSeed()),
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
      new THREE.MeshBasicMaterial({ color: '#2e1b0e', transparent: true, opacity: 0.2, side: THREE.DoubleSide }),
    );
    progressBack.rotation.x = -Math.PI / 2;

    this.progressFill = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 0.92, 48),
      new THREE.MeshBasicMaterial({ color: '#ffe4a0', transparent: true, opacity: 0.86, side: THREE.DoubleSide }),
    );
    this.progressFill.rotation.x = -Math.PI / 2;
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

  update(delta: number, at: number, heroPosition: THREE.Vector3, heroSpeed: number): HarvestSnapshot {
    this.lastGoldGain = 0;

    for (const node of this.nodes) {
      if (node.isRespawnReady(at)) {
        const anchorIndex = this.pickOpenAnchor(node.currentAnchorIndex);
        this.placeNode(node, anchorIndex);
      }
      node.update(delta, at);
    }

    const target = this.findChannelTarget(heroPosition, heroSpeed);
    if (target) {
      this.channelNode = target;
      this.progress = Math.min(1, this.progress + delta / Balance.goldSeam.tickSeconds);
      this.collectReadyTicks(at, target);
    } else {
      this.progress = Math.max(
        0,
        this.progress - (delta / Balance.goldSeam.tickSeconds) * Balance.goldSeam.decayMultiplier,
      );
      if (this.progress === 0) this.channelNode = null;
    }

    this.updateProgressRing(at);
    return this.buildSnapshot(at);
  }

  dispose(): void {
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
    this.channelNode = null;
    this.progress = 0;
    this.lastGoldGain = 0;
    this.progressGroup.visible = false;
    this.progressFill.geometry.setDrawRange(0, 0);
    for (const node of this.nodes) {
      node.resetInactive();
    }
    this.activateInitialNodes();
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

  private collectReadyTicks(at: number, node: GoldNode): void {
    while (this.progress >= 1 && node.isActive) {
      this.progress -= 1;
      const gained = node.takeGold(Balance.goldSeam.tickGold);
      if (gained <= 0) break;

      const result = this.economy.apply({
        id: createEconomyEventId(),
        at,
        type: 'gold_panned',
        nodeId: node.id,
        amount: gained,
      });
      if (result.ok) this.lastGoldGain += gained;

      if (node.remainingGold <= 0) {
        node.deactivateUntil(at);
        this.channelNode = null;
        this.progress = 0;
      }
    }
  }

  private findChannelTarget(heroPosition: THREE.Vector3, heroSpeed: number): GoldNode | null {
    if (heroSpeed > Balance.goldSeam.slowSpeed) return null;

    let nearest: GoldNode | null = null;
    let nearestDistanceSq = Balance.goldSeam.channelRange * Balance.goldSeam.channelRange;
    for (const node of this.nodes) {
      if (!node.isActive) continue;
      const dx = node.group.position.x - heroPosition.x;
      const dz = node.group.position.z - heroPosition.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq <= nearestDistanceSq) {
        nearest = node;
        nearestDistanceSq = distanceSq;
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

    this.progressGroup.position.set(ringNode.group.position.x, 0.08, ringNode.group.position.z);
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
    };
  }
}

function createEconomyEventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const random = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${random()}${random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;
}
