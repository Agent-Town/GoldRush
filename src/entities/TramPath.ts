import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { RailPathPoint } from '../meta/ContractFamilies';
import type { PowerGraphDefinition, PowerNodeInput, PowerNodeState } from '../systems/PowerGraph';
import { visualY } from '../world/Terrain';

export type TramCargoSlot = Readonly<{
  id: string;
  family: 'capacitor-crate';
  occupied: boolean;
}>;

export type TramDiagnostics = Readonly<{
  active: boolean;
  state: 'moving' | 'unpowered' | 'arrived';
  powered: boolean;
  progress: number;
  distanceTravelled: number;
  trips: number;
  x: number;
  z: number;
  consumerId: string;
  drawWatts: number;
  cargo: readonly TramCargoSlot[];
  delivery: null | Readonly<{ complete: boolean; delivered: number; required: number; payout: number }>;
}>;

type TramOptions = Readonly<{
  speed: number;
  loop?: boolean;
  consumer: Extract<PowerNodeInput, { kind: 'consumer' }>;
  cargo?: readonly TramCargoSlot[];
  delivery?: Readonly<{ required: number; payout: number; onComplete: (payout: number, position: THREE.Vector3) => void }>;
}>;

export const DEV_TRAM_POWER = Object.freeze({
  producerId: 'tram-generator',
  consumerId: 'tram-motor',
  outputWatts: 6,
  drawWatts: 4,
  priority: 20,
});

export const DEV_TRAM_CONSUMER: Extract<PowerNodeInput, { kind: 'consumer' }> = Object.freeze({
  id: DEV_TRAM_POWER.consumerId,
  labelKey: 'tram-motor',
  kind: 'consumer',
  x: -12,
  z: -17,
  online: true,
  drawWatts: DEV_TRAM_POWER.drawWatts,
  priority: DEV_TRAM_POWER.priority,
});

export function devTramPowerGraphDefinition(): PowerGraphDefinition {
  return {
    id: 'e3-dev-tram-grid',
    nodes: [
      { id: DEV_TRAM_POWER.producerId, labelKey: 'tram-generator', kind: 'producer' as const, x: -24, z: -17, online: true, outputWatts: DEV_TRAM_POWER.outputWatts },
      { id: 'tram-relay', labelKey: 'tram-relay', kind: 'relay' as const, x: -18, z: -17, online: true },
      DEV_TRAM_CONSUMER,
    ],
    wires: [
      { a: DEV_TRAM_POWER.producerId, b: 'tram-relay', state: 'intact' as const },
      { a: 'tram-relay', b: DEV_TRAM_POWER.consumerId, state: 'intact' as const },
    ],
  };
}

export class TramPath {
  readonly group = new THREE.Group();
  readonly consumer: Extract<PowerNodeInput, { kind: 'consumer' }>;

  private readonly path: THREE.Vector3[];
  private readonly cargo: readonly TramCargoSlot[];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly totalLength: number;
  private segment = 1;
  private direction: 1 | -1 = 1;
  private travelled = 0;
  private distanceTravelled = 0;
  private trips = 0;
  private state: TramDiagnostics['state'] = 'moving';
  private powered = true;

  constructor(points: readonly RailPathPoint[], private readonly options: TramOptions) {
    this.path = points.map((point) => new THREE.Vector3(point.x, 0, point.z));
    this.consumer = { ...options.consumer };
    this.cargo = options.cargo?.map((slot) => Object.freeze({ ...slot })) ?? [];
    this.totalLength = this.path.slice(1).reduce((sum, point, index) => sum + point.distanceTo(this.path[index]!), 0);
    this.group.name = 'TramPath';
    this.buildVisuals();
    this.reset();
  }

  get diagnostics(): TramDiagnostics {
    return {
      active: this.path.length > 1,
      state: this.state,
      powered: this.powered,
      progress: this.totalLength > 0 ? Math.min(1, this.travelled / this.totalLength) : 0,
      distanceTravelled: this.distanceTravelled,
      trips: this.trips,
      x: this.group.position.x,
      z: this.group.position.z,
      consumerId: this.consumer.id,
      drawWatts: this.consumer.drawWatts,
      cargo: this.cargo.map((slot) => ({ ...slot })),
      delivery: this.options.delivery
        ? {
            complete: this.state === 'arrived' && this.occupiedCargo >= this.options.delivery.required,
            delivered: this.state === 'arrived' ? this.occupiedCargo : 0,
            required: this.options.delivery.required,
            payout: this.options.delivery.payout,
          }
        : null,
    };
  }

  update(delta: number, powerState: PowerNodeState): void {
    this.powered = powerState === 'powered';
    if (this.state === 'arrived') return;
    if (!this.powered || this.path.length < 2) {
      this.state = 'unpowered';
      return;
    }
    this.state = 'moving';
    let remaining = Math.max(0, delta * this.options.speed);
    while (remaining > 0) {
      const next = this.path[this.segment];
      if (!next) {
        this.trips += 1;
        if (!this.options.loop) {
          this.state = 'arrived';
          if (this.options.delivery && this.occupiedCargo >= this.options.delivery.required) {
            this.options.delivery.onComplete(this.options.delivery.payout, this.group.position.clone());
          }
          return;
        }
        this.direction = this.direction === 1 ? -1 : 1;
        this.segment = this.direction === 1 ? 1 : this.path.length - 2;
        this.travelled = 0;
        continue;
      }
      const dx = next.x - this.group.position.x;
      const dz = next.z - this.group.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= remaining + 0.0001) {
        remaining -= distance;
        this.travelled += distance;
        this.distanceTravelled += distance;
        this.setPosition(next);
        this.segment += this.direction;
      } else {
        const previous = this.group.position.clone();
        const ratio = remaining / distance;
        this.group.position.x += dx * ratio;
        this.group.position.z += dz * ratio;
        this.travelled += remaining;
        this.distanceTravelled += remaining;
        this.face(previous, this.group.position);
        this.syncY();
        remaining = 0;
      }
    }
  }

  reset(): void {
    this.segment = 1;
    this.direction = 1;
    this.travelled = 0;
    this.distanceTravelled = 0;
    this.trips = 0;
    this.state = 'moving';
    this.powered = true;
    if (this.path[0]) this.setPosition(this.path[0]);
  }

  dispose(): void {
    this.group.clear();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
  }

  private buildVisuals(): void {
    const bodyGeometry = new THREE.BoxGeometry(1.4, 0.8, 2.5);
    const roofGeometry = new THREE.BoxGeometry(1.25, 0.15, 2.1);
    const crateGeometry = new THREE.BoxGeometry(0.58, 0.58, 0.58);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#235f67', roughness: 0.62, metalness: 0.3 });
    const brassMaterial = new THREE.MeshStandardMaterial({ color: '#c99a4b', emissive: '#4b3512', emissiveIntensity: 0.22, roughness: 0.5, metalness: 0.46 });
    const crateMaterial = new THREE.MeshStandardMaterial({ color: '#81572f', roughness: 0.82, metalness: 0.05 });
    this.geometries.push(bodyGeometry, roofGeometry, crateGeometry);
    this.materials.push(bodyMaterial, brassMaterial, crateMaterial);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.62;
    const roof = new THREE.Mesh(roofGeometry, brassMaterial);
    roof.position.y = 1.1;
    this.group.add(body, roof);
    this.cargo.forEach((slot, index) => {
      if (!slot.occupied) return;
      const crate = new THREE.Mesh(crateGeometry, crateMaterial);
      crate.name = `TramCargo:${slot.id}`;
      crate.position.set(0, 1.46, (index - (this.cargo.length - 1) / 2) * 0.72);
      this.group.add(crate);
    });
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
  }

  private setPosition(position: THREE.Vector3): void {
    const previous = this.group.position.clone();
    this.group.position.set(position.x, 0, position.z);
    this.face(previous, this.group.position);
    this.syncY();
  }

  private face(from: THREE.Vector3, to: THREE.Vector3): void {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    if (Math.hypot(dx, dz) > 0.001) this.group.rotation.y = Math.atan2(dx, dz);
  }

  private syncY(): void {
    this.group.position.y = visualY(this.group.position.x, this.group.position.z, 0.1);
  }

  private get occupiedCargo(): number {
    return this.cargo.filter((slot) => slot.occupied).length;
  }
}
