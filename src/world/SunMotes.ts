import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';

export type SunMotes = {
  points: THREE.Points;
  advance: (delta: number) => void;
  dispose: () => void;
  count: number;
};

/**
 * U5 — living air: additive dust motes drifting through the key light.
 *
 * One draw call, one buffer, zero per-frame CPU: each mote's drift is computed in
 * the vertex shader from its seed and wrapped inside the box, so the only thing
 * that changes per frame is a float. Distance-faded so they never fog the camera,
 * and capped by the caller — this is the first thing that should shed under the
 * auto-tiering watchdog.
 */
export function createSunMotes(config: {
  count: number;
  halfX: number;
  halfZ: number;
  centerZ: number;
  minY: number;
  maxY: number;
  drift: THREE.Vector2;
  color: string;
  size: number;
  seed: number;
  /** Metres per second the field rises, wrapping back to minY. 0 = drifting dust. */
  rise?: number;
}): SunMotes {
  const positions = new Float32Array(config.count * 3);
  const seeds = new Float32Array(config.count * 3);
  // Deterministic placement: the same map always gets the same air.
  let state = config.seed >>> 0 || 1;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = 0; index < config.count; index += 1) {
    positions[index * 3] = (random() * 2 - 1) * config.halfX;
    positions[index * 3 + 1] = THREE.MathUtils.lerp(config.minY, config.maxY, random());
    positions[index * 3 + 2] = config.centerZ + (random() * 2 - 1) * config.halfZ;
    seeds[index * 3] = random();
    seeds[index * 3 + 1] = random();
    seeds[index * 3 + 2] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('moteSeed', new THREE.BufferAttribute(seeds, 3));
  geometry.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(0, (config.minY + config.maxY) / 2, config.centerZ),
    Math.hypot(config.halfX, config.halfZ) + config.maxY,
  );
  const uniforms = {
    moteTime: { value: 0 },
    moteSize: { value: config.size },
    moteColor: { value: new THREE.Color(config.color) },
    moteDrift: { value: config.drift.clone() },
    moteHalf: { value: new THREE.Vector2(config.halfX, config.halfZ) },
    moteCenterZ: { value: config.centerZ },
    moteRise: { value: config.rise ?? 0 },
    moteYRange: { value: new THREE.Vector2(config.minY, config.maxY) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 moteSeed;
      uniform float moteTime;
      uniform float moteSize;
      uniform vec2 moteDrift;
      uniform vec2 moteHalf;
      uniform float moteCenterZ;
      uniform float moteRise;
      uniform vec2 moteYRange;
      varying float vMoteFade;
      void main() {
        vec3 drifted = position;
        float speed = 0.35 + moteSeed.x * 0.9;
        drifted.x += moteDrift.x * moteTime * speed + sin(moteTime * (0.3 + moteSeed.y * 0.5) + moteSeed.z * 6.283) * 0.6;
        drifted.z += moteDrift.y * moteTime * speed;
        drifted.y += sin(moteTime * (0.22 + moteSeed.z * 0.4) + moteSeed.x * 6.283) * 0.45;
        if (moteRise > 0.0) {
          float span = max(0.001, moteYRange.y - moteYRange.x);
          drifted.y = moteYRange.x + mod(drifted.y - moteYRange.x + moteRise * moteTime * (0.5 + moteSeed.y), span);
        }
        // Wrap inside the box so the field never empties or piles up downwind.
        drifted.x = mod(drifted.x + moteHalf.x, moteHalf.x * 2.0) - moteHalf.x;
        drifted.z = mod(drifted.z - moteCenterZ + moteHalf.y, moteHalf.y * 2.0) - moteHalf.y + moteCenterZ;
        vec4 viewPosition = modelViewMatrix * vec4(drifted, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        float distance = -viewPosition.z;
        gl_PointSize = moteSize * (34.0 / max(1.0, distance)) * (0.6 + moteSeed.y * 0.8);
        // The run camera sits ~35 m off the ground, so the readable band is set from
        // THAT distance: motes fade in past the near clip and out well beyond the tile.
        vMoteFade = smoothstep(6.0, 16.0, distance) * (1.0 - smoothstep(52.0, 74.0, distance)) * (0.35 + moteSeed.x * 0.65);
      }
    `,
    fragmentShader: `
      uniform vec3 moteColor;
      varying float vMoteFade;
      void main() {
        vec2 offset = gl_PointCoord - 0.5;
        float soft = 1.0 - smoothstep(0.12, 0.5, length(offset));
        if (soft <= 0.001 || vMoteFade <= 0.001) discard;
        gl_FragColor = vec4(moteColor, soft * vMoteFade);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'SunMotes';
  points.userData.renderOnly = true;
  points.renderOrder = RenderLayers.impactVfx;
  points.frustumCulled = false;
  return {
    points,
    count: config.count,
    advance: (delta: number) => { uniforms.moteTime.value += delta; },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
