import * as THREE from 'three';
import { createRng, type Rng, type RngState } from '../core/Rng';
import { getDebugSeed } from '../core/DebugParams';
import { RenderLayers } from '../core/RenderLayers';
import { GoldNode, GoldNodeVisualBatch, type GoldNodeFutureState, type GoldNodeSnapshot } from '../entities/GoldNode';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import { visualAnchorY, type Vec2 } from '../world/Terrain';

export type HarvestSnapshot = {
  activeNodes: GoldNodeSnapshot[];
  channeling: boolean;
  channelNodeId: string | null;
  progress: number;
  channels: Array<{ actorId: string; channelNodeId: string | null; progress: number; channeling: boolean }>;
  lastGoldGain: number;
  lastGoldPosition: { x: number; y: number; z: number } | null;
};

export type HarvestFutureState = {
  rng: RngState;
  nodes: GoldNodeFutureState[];
  channelNodeId: string | null;
  progress: number;
  panCapBlocked: boolean;
  channels?: HarvestChannelFutureState[];
};

export type HarvestChannelFutureState = {
  actorId: string;
  channelNodeId: string | null;
  progress: number;
  panCapBlocked: boolean;
  channeling: boolean;
};

export type HarvestTarget = {
  actorId?: string;
  position: THREE.Vector3;
  speed: number;
};

type ChannelTarget = {
  node: GoldNode;
  collector: HarvestTarget;
};

type ChannelState = {
  node: GoldNode | null;
  progress: number;
  panCapBlocked: boolean;
  channeling: boolean;
};

export class HarvestSystem {
  readonly group = new THREE.Group();

  private readonly nodes: GoldNode[];
  private readonly nodeVisuals: GoldNodeVisualBatch;
  private readonly rng: Rng;
  private readonly progressGroup = new THREE.Group();
  private readonly progressFill: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly progressFillIndexCount: number;
  private readonly channels = new Map<string, ChannelState>();
  private lastGoldGain = 0;
  private lastGoldPosition: THREE.Vector3 | null = null;
  private panTickMult = 1;
  private panYieldMult = 1;
  private seamCapacityBonus = 0;
  private seamRespawnReduction = 0;

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
    const primary = this.primaryChannel();
    const channels = this.channelFutureStates();
    return {
      rng: this.rng.snapshot(),
      nodes: this.nodes.map((node) => node.snapshot(at)),
      channelNodeId: primary?.node?.id ?? null,
      progress: primary?.progress ?? 0,
      panCapBlocked: primary?.panCapBlocked ?? false,
      ...(channels.length > 1 ? { channels } : {}),
    };
  }

  restoreFutureState(state: HarvestFutureState, at: number): boolean {
    if (!this.canRestoreFutureState(state)) return false;

    this.rng.restore(state.rng);
    const byId = new Map(state.nodes.map((node) => [node.id, node]));
    for (const node of this.nodes) node.restoreFutureState(byId.get(node.id)!, at);
    this.channels.clear();
    if (state.channels) {
      for (const channel of state.channels) {
        this.channels.set(channel.actorId, {
          node: channel.channelNodeId === null ? null : (this.nodes.find((node) => node.id === channel.channelNodeId) ?? null),
          progress: channel.progress,
          panCapBlocked: channel.panCapBlocked,
          channeling: channel.channeling,
        });
      }
    } else if (state.channelNodeId !== null || state.progress > 0 || state.panCapBlocked) {
      this.channels.set('0', {
        node: state.channelNodeId === null ? null : (this.nodes.find((node) => node.id === state.channelNodeId) ?? null),
        progress: state.progress,
        panCapBlocked: state.panCapBlocked,
        channeling: state.channelNodeId !== null,
      });
    }
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
    const collectors = (Array.isArray(heroPosition) ? heroPosition : [{ position: heroPosition, speed: heroSpeed }])
      .map((collector, index) => ({ ...collector, actorId: collector.actorId ?? String(index) }));

    for (const node of this.nodes) {
      if (node.isRespawnReady(at)) {
        const anchorIndex = this.pickOpenAnchor(node.currentAnchorIndex);
        this.placeNode(node, anchorIndex);
      }
      node.update(delta, at);
    }

    const desired = new Map(collectors.map((collector) => [collector.actorId!, this.findChannelTarget(collector)]));
    const assignments = new Map<string, ChannelTarget>();
    const claimed = new Set<GoldNode>();

    // Existing owners keep a seam while it remains their nearest eligible target.
    for (const [actorId, state] of this.channels) {
      const target = desired.get(actorId);
      if (state.channeling && state.node && target?.node === state.node && !claimed.has(state.node)) {
        assignments.set(actorId, target);
        claimed.add(state.node);
      }
    }
    for (const collector of collectors) {
      const actorId = collector.actorId!;
      const target = desired.get(actorId);
      if (target && !assignments.has(actorId) && !claimed.has(target.node)) {
        assignments.set(actorId, target);
        claimed.add(target.node);
      }
    }

    const activeActorIds = new Set(collectors.map((collector) => collector.actorId!));
    for (const actorId of new Set([...this.channels.keys(), ...activeActorIds])) {
      const state = this.channel(actorId);
      const target = assignments.get(actorId);
      if (target) {
        state.channeling = true;
        if (target.node !== state.node) state.panCapBlocked = false;
        state.node = target.node;
        state.progress = Math.min(1, state.progress + delta / (Balance.goldSeam.tickSeconds * this.panTickMult));
        this.collectReadyTicks(at, state, target.node, target.collector.position);
      } else {
        state.channeling = false;
        state.progress = Math.max(
          0,
          state.progress -
            (delta / (Balance.goldSeam.tickSeconds * this.panTickMult)) * Balance.goldSeam.decayMultiplier,
        );
        if (state.progress === 0) state.node = null;
        if (state.progress < 1) state.panCapBlocked = false;
      }
      if (!activeActorIds.has(actorId) && state.node === null) this.channels.delete(actorId);
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
    this.channels.clear();
    this.lastGoldGain = 0;
    this.lastGoldPosition = null;
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
    const activeCount = Math.min(this.nodes.length, this.rng.int(Balance.goldSeam.activeMin, Balance.goldSeam.activeMax + 1));
    const anchorIndexes = this.shuffledAnchorIndexes();
    for (let index = 0; index < activeCount; index += 1) {
      this.placeNode(this.nodes[index], anchorIndexes[index]);
    }
  }

  private placeNode(node: GoldNode, anchorIndex: number): void {
    node.place(this.anchors[anchorIndex], anchorIndex);
  }

  private collectReadyTicks(at: number, state: ChannelState, node: GoldNode, collectorPosition: THREE.Vector3): void {
    while (state.progress >= 1 && node.isActive) {
      const gained = Math.min(Balance.goldSeam.tickGold * this.panYieldMult, node.remainingGold);
      if (gained <= 0) break;
      if (!this.economy.canReceiveIncome(gained)) {
        if (!state.panCapBlocked) {
          this.economy.apply({ id: createEconomyEventId(), at, type: 'gold_capped', amount: 0 });
          this.onGoldBlocked?.(node.group.position);
        }
        state.panCapBlocked = true;
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
        state.progress -= 1;
        node.takeGold(gained);
        state.panCapBlocked = false;
        this.lastGoldGain += gained;
        this.lastGoldPosition = collectorPosition.clone();
        this.onGoldTick?.(gained);
      } else {
        break;
      }

      if (node.remainingGold <= 0) {
        node.deactivateUntil(at);
        state.node = null;
        state.progress = 0;
      }
    }
  }

  private findChannelTarget(collector: HarvestTarget): ChannelTarget | null {
    let nearest: ChannelTarget | null = null;
    let nearestDistanceSq = Balance.goldSeam.channelRange * Balance.goldSeam.channelRange;
    if (collector.speed > Balance.goldSeam.slowSpeed) return null;
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
    const primary = this.primaryChannel();
    const ringNode = primary?.node ?? null;
    const progress = primary?.progress ?? 0;
    this.progressGroup.visible = ringNode !== null && progress > 0;
    if (!ringNode) return;

    this.progressGroup.position.set(ringNode.group.position.x, visualAnchorY(ringNode.group.position, 0.08), ringNode.group.position.z);
    const wobble = Math.sin(at * 8.5 + ringNode.currentAnchorIndex) * 0.06;
    this.progressGroup.rotation.y = at * 0.8;
    this.progressGroup.scale.setScalar(1 + wobble);
    this.progressFill.geometry.setDrawRange(0, Math.floor(this.progressFillIndexCount * progress));
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
    const primary = this.primaryChannel();
    return {
      activeNodes: this.nodes.map((node) => node.snapshot(at)),
      channeling: [...this.channels.values()].some((channel) => channel.node !== null),
      channelNodeId: primary?.node?.id ?? null,
      progress: primary?.progress ?? 0,
      channels: [...this.channels].map(([actorId, channel]) => ({
        actorId,
        channelNodeId: channel.node?.id ?? null,
        progress: channel.progress,
        channeling: channel.channeling,
      })),
      lastGoldGain: this.lastGoldGain,
      lastGoldPosition: this.lastGoldPosition
        ? { x: this.lastGoldPosition.x, y: this.lastGoldPosition.y, z: this.lastGoldPosition.z }
        : null,
    };
  }

  private channel(actorId: string): ChannelState {
    let state = this.channels.get(actorId);
    if (!state) {
      state = { node: null, progress: 0, panCapBlocked: false, channeling: false };
      this.channels.set(actorId, state);
    }
    return state;
  }

  private primaryChannel(): ChannelState | undefined {
    return this.channels.get('0');
  }

  private channelFutureStates(): HarvestChannelFutureState[] {
    return [...this.channels].map(([actorId, channel]) => ({
      actorId,
      channelNodeId: channel.node?.id ?? null,
      progress: channel.progress,
      panCapBlocked: channel.panCapBlocked,
      channeling: channel.channeling,
    }));
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

    if (state.channelNodeId === null ? state.progress !== 0 : state.nodes.find((node) => node.id === state.channelNodeId)?.active !== true) {
      return false;
    }
    if (state.channels === undefined) return true;
    if (!Array.isArray(state.channels) || state.channels.length < 2 || state.channels.length > 4) return false;
    const actorIds = new Set<string>();
    const activeNodeIds = new Set<string>();
    for (const channel of state.channels) {
      if (
        !channel ||
        typeof channel.actorId !== 'string' ||
        channel.actorId.length < 1 ||
        channel.actorId.length > 96 ||
        actorIds.has(channel.actorId) ||
        !Number.isFinite(channel.progress) ||
        channel.progress < 0 ||
        channel.progress > 1 ||
        typeof channel.panCapBlocked !== 'boolean' ||
        typeof channel.channeling !== 'boolean' ||
        (channel.channelNodeId === null && channel.progress !== 0)
      ) return false;
      const node = channel.channelNodeId === null ? null : state.nodes.find((entry) => entry.id === channel.channelNodeId);
      if (channel.channelNodeId !== null && node?.active !== true) return false;
      if (channel.channeling && (channel.channelNodeId === null || activeNodeIds.has(channel.channelNodeId))) return false;
      actorIds.add(channel.actorId);
      if (channel.channeling && channel.channelNodeId) activeNodeIds.add(channel.channelNodeId);
    }
    const primary = state.channels.find((channel) => channel.actorId === '0');
    return primary !== undefined &&
      primary.channelNodeId === state.channelNodeId &&
      primary.progress === state.progress &&
      primary.panCapBlocked === state.panCapBlocked;
  }
}

function createEconomyEventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const random = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${random()}${random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;
}
