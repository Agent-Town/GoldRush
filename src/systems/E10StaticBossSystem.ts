import * as THREE from 'three';
import { Balance } from '../game/Balance';
import { disposeObject3D } from '../utils/dispose';

export type E10PreserveKind = 'light' | 'song' | 'memory';

export type E10PreserveSite = Readonly<{
  id: string;
  kind: E10PreserveKind;
  x: number;
  z: number;
  radius: number;
}>;

type PreserveState = {
  site: E10PreserveSite;
  meaning: number;
  protectedUntil: number;
  interactions: number;
  marker: THREE.Mesh;
};

export type E10StaticBossDiagnostics = Readonly<{
  enabled: boolean;
  active: boolean;
  act: 0 | 1 | 2 | 3;
  appetite: 'meaning';
  arrivalCount: number;
  aura: number;
  musicGain: number;
  pressureSeconds: number;
  sites: ReadonlyArray<{
    id: string;
    kind: E10PreserveKind;
    verb: 'relight' | 'keep-playing' | 're-ink';
    meaning: number;
    held: boolean;
    protectedFor: number;
    interactions: number;
  }>;
  allPreserved: boolean;
  recessionProgress: number;
  victory: null | 'receded';
  jarredMote: boolean;
  damageAccepted: 0;
  killPath: false;
}>;

/**
 * STORYBOOK E10 Act 3: the Static has no body and no HP. Its only state is
 * pressure on three kept meanings; the player relights, keeps the song going,
 * and re-inks the portrait until the want recedes.
 */
export class E10StaticBossSystem {
  readonly group = new THREE.Group();
  private readonly heart: THREE.Mesh;
  private readonly auraRing: THREE.Mesh;
  private readonly mote: THREE.Mesh;
  private readonly states: PreserveState[];
  private act: 0 | 1 | 2 | 3 = 0;
  private arrivedAt = 0;
  private now = 0;
  private arrivalCount = 0;
  private pressureSeconds = 0;
  private recessionProgress = 0;
  private victory: null | 'receded' = null;
  private previousFilter = '';
  private previousTransition = '';

  constructor(
    private readonly scene: THREE.Scene,
    private readonly canvas: HTMLCanvasElement,
    sites: readonly E10PreserveSite[],
    private readonly enabled: boolean,
    private readonly visualY: (x: number, z: number, base: number) => number,
    private readonly announce: (text: string, title: string) => void,
    private readonly onReceded: () => void,
  ) {
    this.group.name = 'TheQuiet.Static';
    this.heart = new THREE.Mesh(
      new THREE.SphereGeometry(Balance.e10Static.heartRadius, 24, 16),
      new THREE.MeshBasicMaterial({
        color: Balance.e10Static.heartColor,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      }),
    );
    this.auraRing = new THREE.Mesh(
      new THREE.RingGeometry(
        Balance.e10Static.auraRadius - Balance.e10Static.auraRingWidth,
        Balance.e10Static.auraRadius,
        48,
      ),
      new THREE.MeshBasicMaterial({
        color: Balance.e10Static.auraColor,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.mote = new THREE.Mesh(
      new THREE.SphereGeometry(Balance.e10Static.moteRadius, 12, 8),
      new THREE.MeshStandardMaterial({
        color: Balance.e10Static.heartColor,
        emissive: Balance.e10Static.heartColor,
        emissiveIntensity: 1.6,
      }),
    );
    this.states = sites.map((site) => ({
      site,
      meaning: 1,
      protectedUntil: 0,
      interactions: 0,
      marker: new THREE.Mesh(
        new THREE.CylinderGeometry(Balance.e10Static.siteMarkerRadius, Balance.e10Static.siteMarkerRadius, Balance.e10Static.siteMarkerHeight, 12),
        new THREE.MeshStandardMaterial({ color: Balance.e10Static.sitePressedColor, emissive: '#000000' }),
      ),
    }));
    this.heart.name = 'TheQuiet.Heart';
    this.auraRing.name = 'TheQuiet.Aura';
    this.auraRing.rotation.x = -Math.PI / 2;
    this.mote.name = 'TheQuiet.RememberMote';
    this.group.add(this.heart, this.auraRing, this.mote, ...this.states.map((state) => state.marker));
    if (enabled) this.scene.add(this.group);
    this.syncPresentation();
  }

  update(deltaSeconds: number, at: number, actors: readonly { x: number; z: number }[]): void {
    if (!this.enabled || this.act === 3) return;
    this.now = at;
    if (this.act === 0 && actors.some((actor) => actor.z >= Balance.e10Static.arrivalZ)) this.arrive(at);
    if (this.act === 1 && at - this.arrivedAt >= Balance.e10Static.approachSeconds) {
      this.act = 2;
      this.announce('Keep one lantern lit. Keep one song playing. Keep one portrait untouched.', 'THREE PRESERVES');
    }
    if (this.act === 2) this.applyPressure(Math.max(0, deltaSeconds), at);
    this.syncPresentation();
  }

  tryPreserve(position: { x: number; z: number }, at: number): boolean {
    if (!this.enabled || this.act !== 2) return false;
    const target = this.states
      .map((state) => ({ state, distance: Math.hypot(position.x - state.site.x, position.z - state.site.z) }))
      .filter(({ state, distance }) => distance <= state.site.radius)
      .sort((left, right) => left.distance - right.distance)[0]?.state;
    if (!target) return false;
    target.meaning = Math.min(1, target.meaning + Balance.e10Static.restorePerInteraction);
    target.protectedUntil = at + Balance.e10Static.preserveWindowSeconds;
    target.interactions += 1;
    const copy = preserveCopy(target.site.kind);
    this.announce(copy.text, copy.title);
    this.syncPresentation();
    return true;
  }

  diagnostics(): E10StaticBossDiagnostics {
    const sites = this.states.map((state) => ({
      id: state.site.id,
      kind: state.site.kind,
      verb: preserveVerb(state.site.kind),
      meaning: round3(state.meaning),
      held: this.held(state, this.now),
      protectedFor: round3(Math.max(0, state.protectedUntil - this.now)),
      interactions: state.interactions,
    }));
    return {
      enabled: this.enabled,
      active: this.act > 0 && this.act < 3,
      act: this.act,
      appetite: 'meaning',
      arrivalCount: this.arrivalCount,
      aura: round3(this.auraStrength()),
      musicGain: round3(this.musicGain),
      pressureSeconds: round3(this.pressureSeconds),
      sites,
      allPreserved: sites.length === 3 && sites.every((site) => site.held),
      recessionProgress: round3(this.recessionProgress),
      victory: this.victory,
      jarredMote: this.act === 3,
      damageAccepted: 0,
      killPath: false,
    };
  }

  get musicGain(): number {
    const strength = this.auraStrength();
    return THREE.MathUtils.lerp(1, Balance.e10Static.minMusicGain, strength);
  }

  get receded(): boolean {
    return this.act === 3;
  }

  reset(): void {
    // A receded Static hands the canvas to the E10 finale before RunManager
    // resets the claim. Do not overwrite that re-inking transition here.
    if (this.act !== 3) this.restoreCanvas();
    this.act = 0;
    this.arrivedAt = 0;
    this.now = 0;
    this.arrivalCount = 0;
    this.pressureSeconds = 0;
    this.recessionProgress = 0;
    this.victory = null;
    for (const state of this.states) {
      state.meaning = 1;
      state.protectedUntil = 0;
      state.interactions = 0;
    }
    this.syncPresentation();
  }

  dispose(): void {
    if (this.act !== 3) this.restoreCanvas();
    this.scene.remove(this.group);
    disposeObject3D(this.group);
  }

  private arrive(at: number): void {
    this.act = 1;
    this.arrivedAt = at;
    this.arrivalCount += 1;
    this.previousFilter = this.canvas.style.filter;
    this.previousTransition = this.canvas.style.transition;
    this.canvas.style.transition = 'filter 120ms linear';
    this.announce('A want with no object reaches for the Ark\'s kept things.', 'THE STATIC');
  }

  private applyPressure(deltaSeconds: number, at: number): void {
    let pressured = false;
    for (const state of this.states) {
      if (this.held(state, at)) continue;
      state.meaning = Math.max(0, state.meaning - Balance.e10Static.meaningDrainPerSecond * deltaSeconds);
      pressured = true;
    }
    if (pressured) this.pressureSeconds += deltaSeconds;
    const allHeld = this.states.length === 3 && this.states.every((state) => this.held(state, at));
    if (allHeld) {
      this.recessionProgress = Math.min(1, this.recessionProgress + deltaSeconds / Math.max(0.001, Balance.e10Static.recessionHoldSeconds));
    } else {
      this.recessionProgress = Math.max(0, this.recessionProgress - Balance.e10Static.recessionDecayPerSecond * deltaSeconds);
    }
    if (this.recessionProgress >= 1) this.recede();
  }

  private recede(): void {
    this.act = 3;
    this.victory = 'receded';
    this.canvas.style.filter = 'grayscale(0)';
    this.announce('The Quiet does not die. It recedes. One mote remains: remember.', 'THE RECEDING');
    this.syncPresentation();
    this.onReceded();
  }

  private held(state: PreserveState, at: number): boolean {
    return state.meaning > 0 && state.protectedUntil > at;
  }

  private auraStrength(): number {
    if (this.act === 0 || this.act === 3) return 0;
    if (this.act === 1) {
      return THREE.MathUtils.clamp((this.now - this.arrivedAt) / Math.max(0.001, Balance.e10Static.approachSeconds), 0, 1);
    }
    return 1 - this.recessionProgress;
  }

  private syncPresentation(): void {
    const visible = this.enabled && this.act > 0;
    const strength = this.auraStrength();
    this.heart.visible = visible && this.act < 3;
    this.auraRing.visible = visible && this.act < 3;
    this.mote.visible = this.enabled && this.act === 3;
    this.heart.position.set(0, this.visualY(0, 52, Balance.e10Static.heartHeight), 52);
    this.auraRing.position.set(0, this.visualY(0, 52, 0.05), 52);
    this.auraRing.scale.setScalar(0.4 + strength * 0.6);
    this.heart.scale.setScalar(0.65 + strength * 0.35);
    (this.heart.material as THREE.MeshBasicMaterial).opacity = 0.3 + strength * 0.42;
    this.mote.position.set(0, this.visualY(0, 52, Balance.e10Static.moteHeight), 52);
    for (const state of this.states) {
      state.marker.position.set(
        state.site.x,
        this.visualY(state.site.x, state.site.z, Balance.e10Static.siteMarkerHeight / 2),
        state.site.z,
      );
      const material = state.marker.material as THREE.MeshStandardMaterial;
      const held = this.held(state, this.now);
      material.color.set(held ? Balance.e10Static.siteHeldColor : Balance.e10Static.sitePressedColor);
      material.emissive.set(held ? Balance.e10Static.siteHeldColor : '#000000');
      material.emissiveIntensity = held ? 0.65 : 0;
      state.marker.scale.y = Math.max(0.18, state.meaning);
    }
    if (this.act > 0 && this.act < 3) this.canvas.style.filter = `grayscale(${round3(strength * Balance.e10Static.maxGrayscale)})`;
  }

  private restoreCanvas(): void {
    this.canvas.style.filter = this.previousFilter;
    this.canvas.style.transition = this.previousTransition;
  }
}

function preserveVerb(kind: E10PreserveKind): 'relight' | 'keep-playing' | 're-ink' {
  if (kind === 'light') return 'relight';
  if (kind === 'song') return 'keep-playing';
  return 're-ink';
}

function preserveCopy(kind: E10PreserveKind): { title: string; text: string } {
  if (kind === 'light') return { title: 'THE LANTERN', text: 'Relit. Keep the light.' };
  if (kind === 'song') return { title: 'THE SONG', text: 'The Pan Theme carries. Keep it playing.' };
  return { title: 'THE PORTRAIT', text: 'The name returns in ink. Keep it untouched.' };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
