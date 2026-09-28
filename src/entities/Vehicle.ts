import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import type { FuelSystem } from '../systems/FuelSystem';
import { visualY } from '../world/Terrain';
import { createGltfLoader } from '../assets/AssetLoading';
import { disposeObject3D } from '../utils/dispose';

// THE E4 HAULER BODY IS NOT E1 CONTENT (F-SEF2-2, re-measured on this tree 2026-09-24).
// `specs/release-e1/README.md` ("THE FRONTIER IS PHYSICAL"): a later-era asset must be ABSENT from
// the E1 bundle, not merely unreachable inside it. The static `new URL(..., import.meta.url)` that
// used to stand here was the ONE path by which `motor-hauler.glb` reached every build, and it held
// the release door shut: `GR_RELEASE=e1 npm run build:release` exited 1 on exactly that file
// (scripts/assert-release-build.mjs:46).
//
// A define does not cure it. Measured here first: `__GR_RELEASE_E1__ ? '' : new URL(...)` STILL
// emitted `motor-hauler-*.glb` into the E1 dist, because Vite resolves and emits an asset in its
// transform hook, long before the dead branch is folded away. Tree-shaking cannot un-emit a file.
//
// So the URL now comes from the one pattern `releaseE1ContentPlugin` already narrows for every
// other landmark consumer (vite.config.ts:118 rewrites this exact glob string to the five E1 map
// directories), read the lazy `?url` way `src/world/Terrain3dClaimPilot.ts:222` reads it. In an E1
// build the key below is simply not in the map, `buildBody` keeps the placeholder chassis exactly
// as it already does on the lite tier, and no caller changes. The glob must stay character-for-
// character identical to the plugin's search string: it is a plain `replaceAll`, so one different
// space and the narrowing silently stops happening.
const HAULER_BODY_KEY = '../../assets/pilots/map-rebuild-spike/landmarks/motor-hauler/motor-hauler.glb';
const LANDMARK_BODY_URLS = import.meta.glob([
  '../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb',
], { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;

type VehiclePoint = Readonly<{ x: number; z: number }>;

export type VehicleDiagnostics = Readonly<{
  active: boolean;
  kind: 'hauler';
  state: 'idle' | 'moving' | 'dry' | 'arrived';
  x: number;
  z: number;
  target: VehiclePoint | null;
  speed: number;
  burnPerSecond: number;
  distanceTravelled: number;
}>;

export class Vehicle {
  readonly group = new THREE.Group();
  private readonly start: VehiclePoint;
  private readonly path: readonly VehiclePoint[];
  private readonly loop: boolean;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private target: VehiclePoint | null = null;
  private pathIndex = 0;
  private state: VehicleDiagnostics['state'] = 'idle';
  private distanceTravelled = 0;
  private bodyDisposed = false;

  constructor(private readonly fuel: FuelSystem, options: { start: VehiclePoint; path?: readonly VehiclePoint[]; loop?: boolean }) {
    this.start = { ...options.start };
    this.path = options.path?.map((point) => ({ ...point })) ?? [];
    this.loop = options.loop ?? false;
    this.group.name = 'Vehicle:Hauler';
    this.buildBody();
    this.reset();
  }

  driveTo(x: number, z: number): void {
    this.pathIndex = 0;
    this.target = { x, z };
    this.state = 'moving';
  }

  update(delta: number, movement = { speedMultiplier: 1, fuelMultiplier: 1 }): void {
    if (!this.target) {
      if (this.state !== 'arrived') this.state = 'idle';
      return;
    }
    const dx = this.target.x - this.group.position.x;
    const dz = this.target.z - this.group.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= Balance.e4Fuel.arriveRadius) {
      this.arrive();
      return;
    }
    const speedMultiplier = Math.max(0, movement.speedMultiplier);
    const fuelMultiplier = Math.max(0.001, movement.fuelMultiplier);
    const speed = Balance.e4Fuel.vehicleSpeed * speedMultiplier;
    const requestedSeconds = Math.min(Math.max(0, delta), speed > 0 ? distance / speed : 0);
    const requestedFuel = requestedSeconds * Balance.e4Fuel.burnPerSecond * fuelMultiplier;
    const suppliedFuel = this.fuel.draw(requestedFuel);
    if (suppliedFuel <= 0) {
      this.state = 'dry';
      return;
    }
    const step = Math.min(distance, (suppliedFuel / (Balance.e4Fuel.burnPerSecond * fuelMultiplier)) * speed);
    const previousX = this.group.position.x;
    const previousZ = this.group.position.z;
    this.group.position.x += (dx / distance) * step;
    this.group.position.z += (dz / distance) * step;
    this.group.rotation.y = Math.atan2(this.group.position.x - previousX, this.group.position.z - previousZ);
    this.group.position.y = visualY(this.group.position.x, this.group.position.z, 0.1);
    this.distanceTravelled += step;
    this.state = suppliedFuel + 1e-9 < requestedFuel ? 'dry' : 'moving';
    if (distance - step <= Balance.e4Fuel.arriveRadius) this.arrive();
  }

  reset(): void {
    this.pathIndex = 0;
    this.target = this.path[0] ?? null;
    this.state = this.target ? 'moving' : 'idle';
    this.distanceTravelled = 0;
    this.group.position.set(this.start.x, visualY(this.start.x, this.start.z, 0.1), this.start.z);
    this.group.rotation.set(0, 0, 0);
  }

  get diagnostics(): VehicleDiagnostics {
    return {
      active: true,
      kind: 'hauler',
      state: this.state,
      x: this.group.position.x,
      z: this.group.position.z,
      target: this.target ? { ...this.target } : null,
      speed: Balance.e4Fuel.vehicleSpeed,
      burnPerSecond: Balance.e4Fuel.burnPerSecond,
      distanceTravelled: this.distanceTravelled,
    };
  }

  dispose(): void {
    this.bodyDisposed = true;
    this.clearBody();
  }

  private clearBody(): void {
    this.group.traverse(part => {
      const instances = part as THREE.InstancedMesh;
      if (instances.isInstancedMesh) instances.dispose();
    });
    this.group.clear();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.geometries.length = this.materials.length = 0;
  }

  private arrive(): void {
    if (this.path.length > 0 && (this.pathIndex + 1 < this.path.length || this.loop)) {
      this.pathIndex = (this.pathIndex + 1) % this.path.length;
      this.target = this.path[this.pathIndex]!;
      this.state = 'moving';
      return;
    }
    this.target = null;
    this.state = 'arrived';
  }

  private buildBody(): void {
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.55, 3.1);
    const cabGeometry = new THREE.BoxGeometry(1.55, 0.8, 1.1);
    const wheelGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 12);
    const steel = new THREE.MeshStandardMaterial({ color: '#5f756f', roughness: 0.72, metalness: 0.25 });
    const brass = new THREE.MeshStandardMaterial({ color: '#c99a4b', emissive: '#235f67', emissiveIntensity: 0.15, roughness: 0.55, metalness: 0.35 });
    const rubber = new THREE.MeshStandardMaterial({ color: '#282522', roughness: 0.95 });
    this.geometries.push(bodyGeometry, cabGeometry, wheelGeometry);
    this.materials.push(steel, brass, rubber);
    const body = new THREE.Mesh(bodyGeometry, steel);
    body.position.y = 0.68;
    const cab = new THREE.Mesh(cabGeometry, brass);
    cab.position.set(0, 1.18, 0.82);
    const wheels = new THREE.InstancedMesh(wheelGeometry, rubber, 4);
    const wheel = new THREE.Object3D();
    [[-1, 0.45, -1], [1, 0.45, -1], [-1, 0.45, 1], [1, 0.45, 1]].forEach(([x, y, z], index) => {
      wheel.position.set(x!, y!, z!);
      wheel.rotation.z = Math.PI / 2;
      wheel.updateMatrix();
      wheels.setMatrixAt(index, wheel.matrix);
    });
    this.group.add(body, cab, wheels);
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
    this.group.userData.bodySource = 'placeholder';
    const search = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
    if (search.has('terrain2d') || search.get('tier') === 'lite' || performanceTierDiagnostics().tier === 'lite') return;
    // Absent in an E1 release build (see the glob above), where the placeholder chassis IS the
    // hauler. `bodySource` stays 'placeholder', which is already one of the three values this
    // method can leave behind, so nothing downstream learns a new state.
    const resolveHaulerBody = LANDMARK_BODY_URLS[HAULER_BODY_KEY];
    if (!resolveHaulerBody) return;
    void resolveHaulerBody().then((url) => createGltfLoader().loadAsync(url)).then(({ scene }) => {
      if (this.bodyDisposed) { disposeObject3D(scene); return; }
      this.clearBody();
      scene.traverse(part => {
        part.renderOrder = RenderLayers.gameplay;
        const mesh = part as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (!this.geometries.includes(mesh.geometry)) this.geometries.push(mesh.geometry);
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          if (this.materials.includes(material)) continue;
          const standard = material as THREE.MeshStandardMaterial;
          if (standard.isMeshStandardMaterial) {
            // glTF bakes sub-unit emission strength into RGB. Preserve its energy
            // while reporting the authored lamp strength rather than the default 1.
            const strength = standard.emissive.getHex() === 0 ? 0 : 0.18;
            if (strength > 0) standard.emissive.multiplyScalar(standard.emissiveIntensity / strength);
            standard.emissiveIntensity = strength;
          }
          this.materials.push(material);
        }
      });
      this.group.add(scene);
      this.group.userData.bodySource = 'glb';
    }).catch(() => {
      if (!this.bodyDisposed) this.group.userData.bodySource = 'fallback';
    });
  }
}
