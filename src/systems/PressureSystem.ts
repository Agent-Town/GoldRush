import * as THREE from 'three';
import { BoilerHousePool } from '../entities/BoilerHouse';
import { Balance } from '../game/Balance';
import type { Economy } from '../game/Economy';
import * as Terrain from '../world/Terrain';

type BoilerState = { fuel: number; tick: number; cooldown: number; hot: boolean; cooling: boolean };
type CoalSeam = { x: number; z: number; harvested: boolean; progress: number };

export type PressureDiagnostics = {
  enabled: boolean;
  multiplayerPosture: 'single-player-gated';
  coal: number;
  seams: Array<CoalSeam & { marked: boolean }>;
  boilers: ReturnType<BoilerHousePool['snapshots']>;
  vents: number;
  safeBand: { min: number; max: number } | null;
  objective: { active: boolean; failed: boolean; complete: boolean; hotBoilers: number; waves: string };
};

export type PressureBand = 'empty' | 'low' | 'working' | 'high';

const seamPositions = [
  { x: -12, z: 39 },
  { x: -5, z: 43 },
  { x: 3, z: 39 },
] as const;

export class PressureSystem {
  readonly group = new THREE.Group();
  private readonly seams: CoalSeam[] = seamPositions.map((position) => ({ ...position, harvested: false, progress: 0 }));
  private readonly seamMeshes = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(0.46, 0),
    new THREE.MeshStandardMaterial({ color: '#332d29', emissive: '#8b7d3c', emissiveIntensity: 0.06, roughness: 0.94 }),
    seamPositions.length,
  );
  private readonly markMeshes = new THREE.InstancedMesh(
    new THREE.RingGeometry(0.62, 0.78, 18),
    new THREE.MeshBasicMaterial({ color: '#c4883a', transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
    seamPositions.length,
  );
  private readonly object = new THREE.Object3D();
  private readonly states = Array.from({ length: Balance.boilerHouse.maxCount }, (): BoilerState => ({ fuel: 0, tick: 0, cooldown: 0, hot: false, cooling: false }));
  private coal = 0;
  private vents = 0;
  private objectiveStarted = false;
  private objectiveFailed = false;
  private objectiveComplete = false;
  private spendSerial = 0;

  constructor(
    private readonly economy: Economy,
    private readonly boilers: BoilerHousePool,
    private readonly enabled: () => boolean,
    private readonly isOperational: (index: number) => boolean,
    private readonly hasResearch: (id: string) => boolean,
    private readonly onFloatText: (position: THREE.Vector3, text: string, color: string) => void,
    private readonly onSound: (name: 'blast-charge-arm' | 'wind-gust') => void,
  ) {
    this.group.name = 'PressureSystem';
    this.group.visible = this.enabled();
    this.seamMeshes.name = 'CoalSeams';
    this.markMeshes.name = 'CoalSurveyMarks';
    this.group.add(this.seamMeshes, this.markMeshes);
    this.syncSeams();
  }

  update(delta: number, at: number, actors: readonly THREE.Vector3[], wave: number): void {
    this.group.visible = this.enabled();
    if (!this.enabled()) {
      return;
    }
    this.harvestCoal(delta, actors);
    for (let index = 0; index < this.boilers.capacity; index += 1) {
      const state = this.states[index]!;
      if (!this.isOperational(index)) {
        Object.assign(state, { fuel: 0, tick: 0, cooldown: 0, hot: false, cooling: false });
        continue;
      }
      state.cooldown = Math.max(0, state.cooldown - delta);
      state.cooling = state.cooldown > 0;
      if (state.cooling) {
        state.hot = false;
        continue;
      }
      if (state.fuel <= 0 && this.coal > 0) {
        this.coal -= 1;
        state.fuel = Balance.boilerHouse.coalSeconds;
      }
      state.hot = state.fuel > 0;
      if (!state.hot) continue;
      state.fuel = Math.max(0, state.fuel - delta);
      state.tick += delta;
      while (state.tick >= Balance.boilerHouse.tickSeconds) {
        state.tick -= Balance.boilerHouse.tickSeconds;
        const granted = this.economy.apply({
          id: crypto.randomUUID(),
          at,
          type: 'resource_granted',
          resource: 'pressure',
          source: 'exchange',
          amount: Balance.boilerHouse.pressurePerTick,
        });
        if (!granted.ok) break;
        this.onSound('blast-charge-arm');
      }
    }
    if (this.economy.resourceBalance('pressure').amount > Balance.boilerHouse.safeMax) this.vent(at);
    this.updateObjective(wave);
    this.boilers.update(this.states, at);
    this.syncSeams();
  }

  reset(): void {
    this.coal = 0;
    this.vents = 0;
    this.objectiveStarted = false;
    this.objectiveFailed = false;
    this.objectiveComplete = false;
    this.spendSerial = 0;
    for (const seam of this.seams) Object.assign(seam, { harvested: false, progress: 0 });
    for (const state of this.states) Object.assign(state, { fuel: 0, tick: 0, cooldown: 0, hot: false, cooling: false });
    this.syncSeams();
  }

  get stored(): number {
    return this.economy.resourceBalance('pressure').amount;
  }

  get band(): PressureBand {
    if (this.stored <= 0) return 'empty';
    if (this.stored < Balance.boilerHouse.safeMin) return 'low';
    if (this.stored <= Balance.boilerHouse.safeMax) return 'working';
    return 'high';
  }

  spend(amount: number, at: number, sink: string): boolean {
    if (amount <= 0) return true;
    return this.economy.apply({
      id: `pressure:${sink}:${this.spendSerial++}`,
      at,
      type: 'resource_spent',
      resource: 'pressure',
      sink,
      amount,
    }).ok;
  }

  get diagnostics(): PressureDiagnostics {
    const hotBoilers = this.states.filter((state, index) => this.isOperational(index) && state.hot).length;
    return {
      enabled: this.enabled(),
      multiplayerPosture: 'single-player-gated',
      coal: this.coal,
      seams: this.seams.map((seam) => ({ ...seam, marked: this.hasResearch('coal_survey') })),
      boilers: this.boilers.snapshots(this.states),
      vents: this.vents,
      safeBand: this.hasResearch('pressure_assay') ? { min: Balance.boilerHouse.safeMin, max: Balance.boilerHouse.safeMax } : null,
      objective: { active: this.objectiveStarted, failed: this.objectiveFailed, complete: this.objectiveComplete, hotBoilers, waves: '8-12' },
    };
  }

  dispose(): void {
    for (const mesh of [this.seamMeshes, this.markMeshes]) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  }

  private harvestCoal(delta: number, actors: readonly THREE.Vector3[]): void {
    for (const seam of this.seams) {
      if (seam.harvested) continue;
      const near = actors.some((actor) => Math.hypot(actor.x - seam.x, actor.z - seam.z) <= Balance.boilerHouse.coalHarvestRange);
      seam.progress = near ? Math.min(1, seam.progress + delta / Balance.boilerHouse.coalHarvestSeconds) : Math.max(0, seam.progress - delta);
      if (seam.progress < 1) continue;
      seam.harvested = true;
      this.coal += Balance.boilerHouse.coalPerSeam;
      this.onFloatText(new THREE.Vector3(seam.x, Terrain.visualY(seam.x, seam.z, 0.5), seam.z), `+${Balance.boilerHouse.coalPerSeam} coal`, '#c4883a');
    }
  }

  private vent(at: number): void {
    const index = this.states.findIndex((state, boilerIndex) => this.isOperational(boilerIndex) && state.hot);
    if (index < 0) return;
    const amount = Math.min(Balance.boilerHouse.ventLoss, this.economy.resourceBalance('pressure').amount);
    const result = this.economy.apply({ id: crypto.randomUUID(), at, type: 'resource_spent', resource: 'pressure', sink: 'boiler_vent', amount });
    if (!result.ok) return;
    const state = this.states[index]!;
    state.cooldown = Balance.boilerHouse.ventCooldownSeconds;
    state.cooling = true;
    state.hot = false;
    this.vents += 1;
    const position = this.boilers.allPositions[index]!;
    this.onFloatText(position, 'PFFFFT!', '#fff8e8');
    this.onSound('wind-gust');
  }

  private updateObjective(wave: number): void {
    if (this.objectiveComplete || this.objectiveFailed || wave < 8) return;
    this.objectiveStarted = true;
    const hot = this.states.filter((state, index) => this.isOperational(index) && state.hot).length;
    if (hot < 2) this.objectiveFailed = true;
    else if (wave >= 12) this.objectiveComplete = true;
  }

  private syncSeams(): void {
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
    const marked = this.enabled() && this.hasResearch('coal_survey');
    for (let index = 0; index < this.seams.length; index += 1) {
      const seam = this.seams[index]!;
      if (this.enabled() && !seam.harvested) {
        this.object.position.set(seam.x, Terrain.visualY(seam.x, seam.z, 0.32), seam.z);
        this.object.rotation.set(0, index * 0.7, 0);
        this.object.scale.setScalar(1);
        this.object.updateMatrix();
        this.seamMeshes.setMatrixAt(index, this.object.matrix);
      } else this.seamMeshes.setMatrixAt(index, hidden);
      if (marked && !seam.harvested) {
        this.object.position.set(seam.x, Terrain.visualY(seam.x, seam.z, 0.05), seam.z);
        this.object.rotation.set(-Math.PI / 2, 0, 0);
        this.object.scale.setScalar(1);
        this.object.updateMatrix();
        this.markMeshes.setMatrixAt(index, this.object.matrix);
      } else this.markMeshes.setMatrixAt(index, hidden);
    }
    this.seamMeshes.instanceMatrix.needsUpdate = true;
    this.markMeshes.instanceMatrix.needsUpdate = true;
  }
}
