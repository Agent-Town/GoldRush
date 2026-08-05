import * as THREE from 'three';
import { Balance } from '../game/Balance';
import { RenderLayers } from '../core/RenderLayers';

/** Render-only steam vent configuration for the Incline haul lines. */
export type HaulVent = {
  id: string;
  x: number;
  z: number;
  y: number;
  rides?: boolean;
  interval: number;
  phase: number;
  life: number;
  rise: number;
  radius: number;
  grow: number;
  drift: [number, number];
  slots: number;
};

export type HaulSteam = {
  group: THREE.Group;
  advance: (delta: number, cart: { x: number; z: number; moving: boolean } | undefined) => void;
  setDetailBudget: (verdict: number) => void;
  diagnostics: () => { capacity: number; active: number; spawned: number; detail: number };
  dispose: () => void;
};

const STEAM_COLOUR = new THREE.Color('#f2ece1');
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

function createPuffTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create haul steam texture context.');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
  gradient.addColorStop(0.42, 'rgba(255,255,255,0.36)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** One capped instanced pool for the cart stack and the two winch-end wisps. */
export function createHaulSteam(vents: readonly HaulVent[], heightAt: (x: number, z: number) => number): HaulSteam {
  const capacity = vents.reduce((total, vent) => total + vent.slots, 0);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const texture = createPuffTexture();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.78,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, capacity));
  mesh.name = 'InclineHaulSteam';
  mesh.frustumCulled = false;
  mesh.renderOrder = RenderLayers.impactVfx;
  mesh.userData.renderOnly = true;
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, capacity) * 3), 3);
  mesh.visible = false;
  const group = new THREE.Group();
  group.name = 'InclineHaulSteamGroup';
  group.userData.renderOnly = true;
  group.add(mesh);

  const cameraPitch = Math.atan2(Balance.camera.offset.y, Balance.camera.offset.z + Balance.camera.downScreenLookOffset);
  const anchor = new THREE.Object3D();
  const colour = new THREE.Color();
  type Puff = { life: number; x: number; y: number; z: number; vent: HaulVent };
  const puffs: Array<Puff | null> = Array.from({ length: Math.max(1, capacity) }, () => null);
  const timers = new Map<string, number>(vents.map((vent) => [vent.id, vent.phase]));
  const slotStart = new Map<string, number>();
  let cursor = 0;
  for (const vent of vents) {
    slotStart.set(vent.id, cursor);
    cursor += vent.slots;
  }
  let detail = 0;
  let spawned = 0;

  const emit = (vent: HaulVent, x: number, z: number): void => {
    const start = slotStart.get(vent.id) ?? 0;
    for (let offset = 0; offset < vent.slots; offset += 1) {
      const slot = start + offset;
      if (puffs[slot]) continue;
      puffs[slot] = { life: 0, x, y: heightAt(x, z) + vent.y, z, vent };
      spawned += 1;
      return;
    }
  };

  const hideAll = (): void => {
    for (let slot = 0; slot < puffs.length; slot += 1) {
      puffs[slot] = null;
      mesh.setMatrixAt(slot, HIDDEN);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = false;
  };

  const advance = (delta: number, cart: { x: number; z: number; moving: boolean } | undefined): void => {
    if (detail >= 2) {
      if (mesh.visible) hideAll();
      return;
    }
    for (const vent of vents) {
      if (detail >= 1 && !vent.rides) continue;
      const source = vent.rides ? cart : { x: vent.x, z: vent.z, moving: true };
      if (!source || (vent.rides && !cart?.moving)) continue;
      const next = (timers.get(vent.id) ?? 0) + delta;
      if (next >= vent.interval) {
        timers.set(vent.id, next - vent.interval);
        emit(vent, source.x, source.z);
      } else {
        timers.set(vent.id, next);
      }
    }
    let active = 0;
    for (let slot = 0; slot < puffs.length; slot += 1) {
      const puff = puffs[slot];
      if (!puff) {
        mesh.setMatrixAt(slot, HIDDEN);
        continue;
      }
      puff.life += delta / puff.vent.life;
      if (puff.life >= 1) {
        puffs[slot] = null;
        mesh.setMatrixAt(slot, HIDDEN);
        continue;
      }
      const t = puff.life;
      anchor.position.set(
        puff.x + puff.vent.drift[0] * t * puff.vent.life,
        puff.y + puff.vent.rise * t * puff.vent.life,
        puff.z + puff.vent.drift[1] * t * puff.vent.life,
      );
      anchor.rotation.set(cameraPitch - Math.PI / 2, 0, 0);
      const spread = puff.vent.radius * (1 + puff.vent.grow * t);
      anchor.scale.set(spread, spread, 1);
      anchor.updateMatrix();
      mesh.setMatrixAt(slot, anchor.matrix);
      const fade = Math.min(1, t * 4.5) * (1 - t) ** 0.85;
      colour.copy(STEAM_COLOUR).multiplyScalar(fade);
      mesh.setColorAt(slot, colour);
      active += 1;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.visible = active > 0;
  };

  return {
    group,
    advance,
    setDetailBudget: (verdict: number) => {
      detail = verdict;
      if (verdict >= 2) hideAll();
    },
    diagnostics: () => ({ capacity, active: puffs.filter(Boolean).length, spawned, detail }),
    dispose: () => {
      geometry.dispose();
      texture.dispose();
      material.dispose();
    },
  };
}
