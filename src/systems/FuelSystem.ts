import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

type FuelNode = { x: number; z: number; harvested: boolean; progress: number };

export type FuelDiagnostics = Readonly<{
  active: boolean;
  tar: number;
  stored: number;
  capacity: number;
  harvestedNodes: number;
  refinedTar: number;
  drawn: number;
  nodes: readonly Readonly<FuelNode>[];
}>;

export class FuelSystem {
  readonly group = new THREE.Group();
  private readonly nodes: FuelNode[] = Balance.e4Fuel.nodePositions.map((position) => ({ ...position, harvested: false, progress: 0 }));
  private readonly nodeMeshes = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.42, 0.58, 0.5, 10),
    new THREE.MeshStandardMaterial({ color: '#49382b', emissive: '#b9772f', emissiveIntensity: 0.12, roughness: 0.9 }),
    this.nodes.length,
  );
  private readonly object = new THREE.Object3D();
  private tar = 0;
  private fuel = 0;
  private refineProgress = 0;
  private refinedTar = 0;
  private drawn = 0;

  constructor(private readonly enabled: () => boolean) {
    this.group.name = 'FuelSystem';
    this.nodeMeshes.name = 'TarHarvestNodes';
    this.group.add(this.nodeMeshes);
    this.syncNodes();
  }

  update(delta: number, actors: readonly THREE.Vector3[]): void {
    this.group.visible = this.enabled();
    if (!this.enabled()) return;
    this.harvest(delta, actors);
    if (this.tar > 0 && this.fuel + Balance.e4Fuel.fuelPerTar <= Balance.e4Fuel.capacity) {
      this.refineProgress += delta;
      while (this.refineProgress >= Balance.e4Fuel.refineSeconds && this.tar > 0 && this.fuel + Balance.e4Fuel.fuelPerTar <= Balance.e4Fuel.capacity) {
        this.refineProgress -= Balance.e4Fuel.refineSeconds;
        this.tar -= 1;
        this.refinedTar += 1;
        this.fuel = Math.min(Balance.e4Fuel.capacity, this.fuel + Balance.e4Fuel.fuelPerTar);
      }
    }
    this.syncNodes();
  }

  draw(amount: number): number {
    const taken = Math.min(Math.max(0, amount), this.fuel);
    this.fuel -= taken;
    this.drawn += taken;
    return taken;
  }

  reset(): void {
    this.tar = 0;
    this.fuel = 0;
    this.refineProgress = 0;
    this.refinedTar = 0;
    this.drawn = 0;
    for (const node of this.nodes) Object.assign(node, { harvested: false, progress: 0 });
    this.syncNodes();
  }

  get diagnostics(): FuelDiagnostics {
    return {
      active: this.enabled(),
      tar: this.tar,
      stored: this.fuel,
      capacity: Balance.e4Fuel.capacity,
      harvestedNodes: this.nodes.filter((node) => node.harvested).length,
      refinedTar: this.refinedTar,
      drawn: this.drawn,
      nodes: this.nodes.map((node) => ({ ...node })),
    };
  }

  dispose(): void {
    this.nodeMeshes.geometry.dispose();
    (this.nodeMeshes.material as THREE.Material).dispose();
  }

  private harvest(delta: number, actors: readonly THREE.Vector3[]): void {
    for (const node of this.nodes) {
      if (node.harvested) continue;
      const near = actors.some((actor) => Math.hypot(actor.x - node.x, actor.z - node.z) <= Balance.e4Fuel.harvestRange);
      node.progress = near ? Math.min(1, node.progress + delta / Balance.e4Fuel.harvestSeconds) : Math.max(0, node.progress - delta);
      if (node.progress < 1) continue;
      node.harvested = true;
      this.tar += Balance.e4Fuel.tarPerNode;
    }
  }

  private syncNodes(): void {
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let index = 0; index < this.nodes.length; index += 1) {
      const node = this.nodes[index]!;
      if (this.enabled() && !node.harvested) {
        this.object.position.set(node.x, Terrain.visualY(node.x, node.z, 0.25), node.z);
        this.object.rotation.set(0, index * 0.7, 0);
        this.object.scale.setScalar(1);
        this.object.updateMatrix();
        this.nodeMeshes.setMatrixAt(index, this.object.matrix);
      } else this.nodeMeshes.setMatrixAt(index, hidden);
    }
    this.nodeMeshes.instanceMatrix.needsUpdate = true;
  }
}
