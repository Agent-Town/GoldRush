import * as THREE from 'three';
import { OrbitSpawner } from '../systems/OrbitSpawner';
import { RoadNetwork } from '../systems/RoadSegment';
import { WeatherSystem } from '../systems/WeatherSystem';
import type { ContractManifest } from '../meta/ContractFamilies';

type Point = Readonly<{ x: number; z: number }>;
type OrbitMember = ReturnType<OrbitSpawner['snapshot']>['members'][number];

export type DustFlatsDiagnostics = Readonly<{
  enabled: true;
  ringRoad: { radius: number };
  tarSeams: readonly { id: string; x: number; z: number; radius: number }[];
  weather: ReturnType<WeatherSystem['sample']>;
  orbit: ReturnType<OrbitSpawner['snapshot']>;
  roads: ReturnType<RoadNetwork['diagnostics']> & { graded: readonly string[]; available: readonly string[] };
}>;

export class DustFlatsTile {
  readonly group = new THREE.Group();
  private readonly weather: WeatherSystem;
  private readonly orbit: OrbitSpawner;
  private roads = new RoadNetwork();
  private readonly graded = new Set<string>();
  private readonly ringGeometry: THREE.RingGeometry;
  private readonly ringMaterial = new THREE.MeshStandardMaterial({ color: '#9b6a36', roughness: 0.98 });
  private readonly seamGeometry = new THREE.CircleGeometry(1, 24);
  private readonly seamMaterial = new THREE.MeshStandardMaterial({ color: '#493326', roughness: 0.9 });
  private readonly surveyGeometry = new THREE.CylinderGeometry(0.28, 0.42, 0.18, 8);
  private readonly surveyMaterial = new THREE.MeshStandardMaterial({ color: '#c59a52', roughness: 0.78, metalness: 0.08 });
  private readonly washGeometry = new THREE.PlaneGeometry(1, 1);
  private readonly washMaterial = new THREE.MeshStandardMaterial({ color: '#8f6a45', roughness: 1 });
  private readonly surveyMarkers = new Map<string, THREE.Object3D>();
  private readonly hazeColor: THREE.Color;

  constructor(private readonly contract: ContractManifest) {
    const orbit = contract.tileParams.orbitSpawn;
    const weather = contract.twist.weather;
    if (!orbit || !weather) throw new Error('The Dust Flats needs authored ORBIT and weather data.');
    this.group.name = 'DustFlatsTile';
    this.weather = new WeatherSystem({ era: 4, contractId: contract.id, ...weather });
    this.orbit = new OrbitSpawner({ contractId: contract.id, enabled: true, ...orbit });
    this.hazeColor = new THREE.Color(weather.hazeColor);
    this.ringGeometry = new THREE.RingGeometry(orbit.radius - 1.5, orbit.radius + 1.5, 96);
    const ring = new THREE.Mesh(this.ringGeometry, this.ringMaterial);
    ring.name = 'DustFlatsOrbitRoad';
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.025;
    this.group.add(ring, this.roads.group);
    const wash = contract.tileParams.dryWash;
    if (wash) {
      const marker = new THREE.Mesh(this.washGeometry, this.washMaterial);
      marker.name = 'DustFlatsDryWash';
      marker.rotation.set(-Math.PI / 2, 0, wash.angle);
      marker.position.set(wash.x, 0.01, wash.z);
      marker.scale.set(wash.width, wash.length, 1);
      this.group.add(marker);
    }
    for (const seam of contract.tileParams.tarSeams ?? []) {
      const marker = new THREE.Mesh(this.seamGeometry, this.seamMaterial);
      marker.name = `DustFlatsTarSeam:${seam.id}`;
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(seam.x, 0.03, seam.z);
      marker.scale.setScalar(seam.radius);
      this.group.add(marker);
    }
    for (const corridor of contract.tileParams.roadCorridors ?? []) {
      const marker = new THREE.Mesh(this.surveyGeometry, this.surveyMaterial);
      marker.name = `DustFlatsRoadSurvey:${corridor.id}`;
      marker.position.set(corridor.start.x, 0.09, corridor.start.z);
      this.surveyMarkers.set(corridor.id, marker);
      this.group.add(marker);
    }
  }

  spawnWave(wave: number, at: number): readonly OrbitMember[] {
    this.orbit.spawnWave(wave, 3, at);
    return this.orbit.snapshot(at).members.filter((member) => member.wave === wave);
  }

  gradeRoad(id: string): boolean {
    if (this.graded.has(id)) return false;
    const corridor = this.contract.tileParams.roadCorridors?.find((entry) => entry.id === id);
    if (!corridor) return false;
    this.roads.build(corridor.id, corridor.start, corridor.end);
    this.graded.add(id);
    const marker = this.surveyMarkers.get(id);
    if (marker) marker.visible = false;
    return true;
  }

  gradeRoadAt(point: Point, range = 2.5): string | null {
    const corridor = (this.contract.tileParams.roadCorridors ?? [])
      .filter((entry) => !this.graded.has(entry.id))
      .map((entry) => ({ entry, distance: Math.hypot(point.x - entry.start.x, point.z - entry.start.z) }))
      .filter(({ distance }) => distance <= range)
      .sort((a, b) => a.distance - b.distance)[0]?.entry;
    return corridor && this.gradeRoad(corridor.id) ? corridor.id : null;
  }

  roadEnd(id: string): Point | null {
    return this.contract.tileParams.roadCorridors?.find((entry) => entry.id === id)?.end ?? null;
  }

  roadMovementAt(point: Point, at: number): Readonly<{ speedMultiplier: number; fuelMultiplier: number }> {
    const road = this.roads.movementAt(point);
    return { speedMultiplier: road.speedMultiplier * this.weather.sample(at).movementMultiplier, fuelMultiplier: road.fuelMultiplier };
  }

  enemyMovementMultiplier(at: number): number {
    return this.weather.sample(at).movementMultiplier;
  }

  orbitSnapshot(at: number): ReturnType<OrbitSpawner['snapshot']> {
    return this.orbit.snapshot(at);
  }

  orbitSpeed(member: OrbitMember): number {
    const orbit = this.contract.tileParams.orbitSpawn!;
    return member.state === 'orbiting' ? orbit.radius * orbit.angularSpeed : orbit.peelSpeed;
  }

  applyWeather(scene: THREE.Scene, at: number): void {
    const snapshot = this.weather.sample(at);
    if (!(scene.fog instanceof THREE.Fog) || snapshot.hazeStrength <= 0) return;
    scene.fog.near *= snapshot.visibilityMultiplier;
    scene.fog.far *= snapshot.visibilityMultiplier;
    scene.fog.color.lerp(this.hazeColor, snapshot.hazeStrength);
  }

  diagnostics(at: number): DustFlatsDiagnostics {
    return {
      enabled: true,
      ringRoad: { radius: this.contract.tileParams.orbitSpawn!.radius },
      tarSeams: this.contract.tileParams.tarSeams ?? [],
      weather: this.weather.sample(at),
      orbit: this.orbit.snapshot(at),
      roads: {
        ...this.roads.diagnostics(),
        graded: [...this.graded],
        available: (this.contract.tileParams.roadCorridors ?? []).map((entry) => entry.id),
      },
    };
  }

  reset(): void {
    this.orbit.reset();
    this.roads.dispose();
    this.group.remove(this.roads.group);
    this.roads = new RoadNetwork();
    this.group.add(this.roads.group);
    this.graded.clear();
    for (const marker of this.surveyMarkers.values()) marker.visible = true;
  }

  dispose(): void {
    this.roads.dispose();
    this.ringGeometry.dispose();
    this.ringMaterial.dispose();
    this.seamGeometry.dispose();
    this.seamMaterial.dispose();
    this.surveyGeometry.dispose();
    this.surveyMaterial.dispose();
    this.washGeometry.dispose();
    this.washMaterial.dispose();
    this.group.clear();
  }
}

export function createDustFlatsTile(contract: ContractManifest): DustFlatsTile | null {
  return contract.id === 'e4-dust-flats' ? new DustFlatsTile(contract) : null;
}
