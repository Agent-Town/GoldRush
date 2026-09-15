import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { BossStoryEmitter } from '../story/signals';
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
    /**
     * The story lifecycle hook (F-SS11-1). No `epoch-10-deepsky` contract carries a `twist.baron`.
     * HONESTY NOTE on the act numbering: this system tracks THREE transitions, and they are not the
     * storybook's four. Storybook Act 0 (the fading portrait, :610) is fiction with no state here,
     * and Act 1 (the squalls, :611) belongs to the unraveled-enemy scheduler, which does not exist
     * yet. What this system observes is the approach (:612) and the three preserves (:613), then
     * the receding (:613). The acts below are named for what happens, not for the book's numbers.
     */
    private readonly story: BossStoryEmitter,
  ) {
    this.group.name = 'TheQuiet.Static';
    // An un-inked absence: no lit surface, volume, or physical boss body.
    this.heart = new THREE.Mesh(
      new THREE.PlaneGeometry(Balance.e10Static.heartRadius * 5, Balance.e10Static.heartRadius * 5),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { strength: { value: 0 }, paper: { value: new THREE.Color(Balance.e10Static.heartColor) } },
        vertexShader: `varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv;
          uniform float strength;
          uniform vec3 paper;
          float noise(vec2 p) {
            vec2 cell = floor(p), f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            vec4 h = fract(sin(vec4(dot(cell, vec2(127.1, 311.7)),
              dot(cell + vec2(1, 0), vec2(127.1, 311.7)),
              dot(cell + vec2(0, 1), vec2(127.1, 311.7)),
              dot(cell + vec2(1, 1), vec2(127.1, 311.7)))) * 43758.5453);
            return mix(mix(h.x, h.y, f.x), mix(h.z, h.w, f.x), f.y);
          }
          void main() {
            vec2 p = (vUv - .5) * 2.2;
            p.y += .5;
            p.x = abs(p.x);
            float d;
            if (p.x + p.y > 1.0) {
              d = length(p - vec2(.25, .75)) - .353553;
            } else {
              vec2 a = p - vec2(0.0, 1.0);
              vec2 b = p - .5 * max(p.x + p.y, 0.0);
              d = sqrt(min(dot(a, a), dot(b, b))) * sign(p.x - p.y);
            }
            float grain = noise(vUv * 260.0) - .5;
            d += (noise(vUv * 47.0) - .5) * .045 + grain * .014;
            float core = 1.0 - smoothstep(-.08, .045, d);
            float veil = (1.0 - smoothstep(.0, .4, d)) * .24;
            float rings = pow(.5 + .5 * cos(d * 95.0 + noise(vUv * 36.0) * 3.0), 5.0)
              * smoothstep(.01, .035, d) * (1.0 - smoothstep(.06, .38, d)) * .28;
            float alpha = max(core * (.83 + noise(vUv * 31.0) * .1), veil + rings) * (.35 + strength * .65);
            if (alpha < .003) discard;
            gl_FragColor = vec4(paper * (1.0 - grain * .06), alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    );
    this.heart.onBeforeRender = (_renderer, _scene, camera) => {
      this.heart.quaternion.copy(camera.quaternion);
      this.heart.updateWorldMatrix(false, false);
    };
    this.auraRing = new THREE.Mesh(
      new THREE.PlaneGeometry(Balance.e10Static.auraRadius * 2, Balance.e10Static.auraRadius * 2),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: { strength: { value: 0 }, paper: { value: new THREE.Color(Balance.e10Static.auraColor) } },
        vertexShader: `varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv;
          uniform float strength;
          uniform vec3 paper;
          void main() {
            vec2 p = (vUv - .5) * 2.0;
            float angle = atan(p.y, p.x);
            float r = length(p) + sin(angle * 23.0) * .004 + sin(angle * 61.0) * .002;
            float rings = pow(.5 + .5 * cos(r * 62.0), 8.0);
            float fade = 1.0 - smoothstep(.65, .99, r);
            float alpha = (.1 + rings * .22) * fade * strength;
            if (alpha < .003) discard;
            gl_FragColor = vec4(paper, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
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
      this.story.act('three-preserves'); // lore/STORYBOOK.md:613 - the heart: the fight is three preserves.
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
    this.story.arrival();
    this.story.act('approach'); // lore/STORYBOOK.md:612 - the approach: the heart comes on in rings of desaturation.
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
    // It is out-lived, not killed: `defeat` is the end of the fight, and the copy holds the line.
    this.story.defeat(); // lore/STORYBOOK.md:613
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
    this.heart.position.set(0, this.visualY(0, 52, Balance.e10Static.heartHeight + Balance.e10Static.heartRadius * 2), 52);
    this.auraRing.position.set(0, this.visualY(0, 52, 0.05), 52);
    this.auraRing.scale.setScalar(0.4 + strength * 0.6);
    this.heart.scale.setScalar(0.65 + strength * 0.35);
    (this.heart.material as THREE.ShaderMaterial).uniforms.strength.value = strength;
    (this.auraRing.material as THREE.ShaderMaterial).uniforms.strength.value = strength;
    this.mote.position.set(0, this.visualY(0, 52, Balance.e10Static.moteHeight), 52);
    for (const state of this.states) {
      state.marker.scale.y = Math.max(0.18, state.meaning);
      state.marker.position.set(
        state.site.x,
        this.visualY(state.site.x, state.site.z, Balance.e10Static.siteMarkerHeight * state.marker.scale.y / 2),
        state.site.z,
      );
      const material = state.marker.material as THREE.MeshStandardMaterial;
      const held = this.held(state, this.now);
      material.color.set(held ? Balance.e10Static.siteHeldColor : Balance.e10Static.sitePressedColor);
      material.emissive.set(held ? Balance.e10Static.siteHeldColor : '#000000');
      material.emissiveIntensity = held ? 0.65 : 0;
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
