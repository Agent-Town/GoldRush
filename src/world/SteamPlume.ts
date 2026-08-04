import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';

export type SteamPlume = {
  points: THREE.Points;
  advance: (delta: number) => void;
  dispose: () => void;
  count: number;
};

export type SteamEmitter = {
  /** World position of the vent mouth — measured off the landmark body, never guessed. */
  x: number;
  y: number;
  z: number;
  /** Metres the column climbs over one puff's life. */
  rise: number;
  /** Metres the column leans downwind over that same life. */
  spread: number;
  /** Point size in pixels at the run camera's ~34 m. */
  size: number;
  /** Seconds a puff takes to climb, widen and go. */
  life: number;
  /** How many puffs this emitter owns. THE CAP IS THE DESIGN. */
  puffs: number;
  /** How solid the puff reads at its fullest. */
  opacity: number;
};

/**
 * U4 — the era breathes: white steam on the steam anchors.
 *
 * Same shape as `SunMotes`: one draw call, one buffer, and every puff's whole life computed in the
 * vertex shader from its own seed, so the only per-frame CPU cost is one float. Each puff is a point
 * sprite, which is a camera-facing quad for free — the right convention here and NOT a violation of
 * the billboard ruling (Mistake #6), which is about world objects with a frame of their own. A puff
 * of steam has no frame; it has a direction of travel, and that comes from the emitter.
 *
 * White, never dark smoke: `specs/epoch-saga/e2-steamworks-bundle.md` §A1 warm law. Normal blending
 * rather than the motes' additive, because additive white over a sunlit ochre bank reads as a lens
 * flare — steam is opaque, it occludes what is behind it (the `BoilerHouse.ts` plume ships
 * `#fff8e8` at 0.68 on exactly that reasoning).
 */
export function createSteamPlume(config: {
  emitters: readonly SteamEmitter[];
  /** Unit-ish lean, normally the key light's shadow direction so the steam blows with the weather. */
  wind: THREE.Vector2;
  color: string;
  seed: number;
}): SteamPlume {
  const count = config.emitters.reduce((total, emitter) => total + emitter.puffs, 0);
  const positions = new Float32Array(count * 3);
  const params = new Float32Array(count * 4);
  const extra = new Float32Array(count * 2);
  const seeds = new Float32Array(count * 3);
  // Deterministic: the same map always gets the same air, so two captures of one framing are
  // comparable and a pixel diff means the change, not the weather.
  let state = config.seed >>> 0 || 1;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  let index = 0;
  for (const emitter of config.emitters) {
    for (let puff = 0; puff < emitter.puffs; puff += 1) {
      positions[index * 3] = emitter.x;
      positions[index * 3 + 1] = emitter.y;
      positions[index * 3 + 2] = emitter.z;
      params[index * 4] = emitter.rise;
      params[index * 4 + 1] = emitter.spread;
      params[index * 4 + 2] = emitter.size;
      params[index * 4 + 3] = emitter.life;
      extra[index * 2] = emitter.opacity;
      // Phase is dealt EVENLY across the emitter's own puffs rather than randomly: a random phase
      // clumps, and a clumped column reads as three balls of cotton instead of a plume.
      extra[index * 2 + 1] = puff / emitter.puffs;
      seeds[index * 3] = random();
      seeds[index * 3 + 1] = random();
      seeds[index * 3 + 2] = random();
      index += 1;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('plumeParams', new THREE.BufferAttribute(params, 4));
  geometry.setAttribute('plumeExtra', new THREE.BufferAttribute(extra, 2));
  geometry.setAttribute('plumeSeed', new THREE.BufferAttribute(seeds, 3));
  const bounds = new THREE.Box3();
  for (const emitter of config.emitters) {
    bounds.expandByPoint(new THREE.Vector3(emitter.x - emitter.spread - 2, emitter.y, emitter.z - emitter.spread - 2));
    bounds.expandByPoint(new THREE.Vector3(emitter.x + emitter.spread + 2, emitter.y + emitter.rise, emitter.z + emitter.spread + 2));
  }
  geometry.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());
  const uniforms = {
    plumeTime: { value: 0 },
    plumeWind: { value: config.wind.clone() },
    plumeColor: { value: new THREE.Color(config.color) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    vertexShader: `
      attribute vec4 plumeParams;
      attribute vec2 plumeExtra;
      attribute vec3 plumeSeed;
      uniform float plumeTime;
      uniform vec2 plumeWind;
      varying float vPuff;
      void main() {
        float life = max(0.5, plumeParams.w);
        float age = fract(plumeTime / life + plumeExtra.y + plumeSeed.x * 0.13);
        vec3 drifted = position;
        drifted.y += age * plumeParams.x * (0.82 + plumeSeed.y * 0.36);
        // A plume that only leans downwind reads as a flag. The wander is what makes it a column of
        // separate breaths — but it is squared in age, because scatter at the MOUTH is what turned
        // the first pass into falling snow instead of steam. Tight at the stack, loose in the sky.
        float loosen = age * age;
        float wander = sin(plumeTime * (0.5 + plumeSeed.z * 0.4) + plumeSeed.y * 6.283);
        drifted.x += plumeWind.x * plumeParams.y * age + (wander * 0.62 + (plumeSeed.z - 0.5) * 1.5) * loosen;
        drifted.z += plumeWind.y * plumeParams.y * age + cos(plumeTime * 0.42 + plumeSeed.z * 6.283) * 0.55 * loosen;
        vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float distance = -viewPosition.z;
        // Point size is clamped because gl_PointSize has a hardware ceiling and a puff that hits
        // it stops growing without saying so — the plume would silently flatten near the camera.
        gl_PointSize = clamp(plumeParams.z * mix(0.45, 1.35, age) * (34.0 / max(1.0, distance)), 1.0, 110.0);
        // A wide visible window on purpose: a narrow one leaves most of the cap invisible at any
        // instant, and a column with three puffs lit is a flurry, not a plume.
        vPuff = smoothstep(0.0, 0.09, age) * (1.0 - smoothstep(0.5, 1.0, age)) * plumeExtra.x;
        vPuff *= 1.0 - smoothstep(60.0, 84.0, distance);
      }
    `,
    fragmentShader: `
      uniform vec3 plumeColor;
      varying float vPuff;
      void main() {
        vec2 offset = gl_PointCoord - 0.5;
        // Broad soft body, not a dot: squaring this falloff shrank the readable core to a speck
        // and the whole column read as sleet.
        float soft = 1.0 - smoothstep(0.02, 0.5, length(offset));
        if (soft <= 0.002 || vPuff <= 0.002) discard;
        gl_FragColor = vec4(plumeColor, soft * vPuff);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'SteamPlume';
  points.userData.renderOnly = true;
  points.renderOrder = RenderLayers.impactVfx;
  points.frustumCulled = false;
  return {
    points,
    count,
    advance: (delta: number) => { uniforms.plumeTime.value += delta; },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
