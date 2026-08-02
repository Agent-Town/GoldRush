import * as THREE from 'three';
import { createRng, normalizeSeed, type Rng } from '../core/Rng';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { activeContract, type ContractDetailClass } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import * as Terrain from './Terrain';

export type DetailClassId = ContractDetailClass;
export type DetailDensityTier = 'desktop' | 'mobile-reduced' | 'off';

export type DetailScatterClearPoint = {
  x: number;
  z: number;
  radius: number;
};

export type DetailScatterDiagnostics = {
  instanceClasses: number;
  /** Ground-contact ellipses drawn in one call for every standing scatter class. */
  contactShadows: number;
  totalInstances: number;
  seededInstances: number;
  densityTier: DetailDensityTier;
  seed: number;
  classes: Array<{ id: DetailClassId; instances: number; visibleInstances: number; drawCalls: 1 }>;
  exclusions: {
    buildPadRadius: number;
    routingLaneRadius: number;
    harvestAnchorRadius: number;
    buildingClearRadius: number;
  };
  probes: Record<'buildPad' | 'ford' | 'routingLane' | 'building', DetailScatterProbe>;
  signature: string;
};

type DetailScatterProbe = {
  x: number;
  z: number;
  clearRadius: number;
  nearest: number | null;
  clear: boolean;
};

type DetailProfile = {
  id: DetailClassId;
  baseCount: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  minScale: number;
  maxScale: number;
  baseY: number;
  groundRotationX?: number;
  /** Per-instance colour, drawn from a stream of its own so placement stays byte-identical. */
  instanceTint?: (rng: Rng) => THREE.Color;
  /** Radius of the ground contact patch under instances at or above `contactScale`. */
  contact?: { radius: number; minScale: number };
};

type DetailInstance = {
  x: number;
  z: number;
  y: number;
  rotation: number;
  scale: number;
  hidden: boolean;
  mesh: THREE.InstancedMesh;
  index: number;
  /** Slot in the shared contact-shadow mesh, or -1 for classes that lie flat on the ground. */
  shadowIndex: number;
};

type DetailClass = {
  profile: DetailProfile;
  mesh: THREE.InstancedMesh;
  instances: DetailInstance[];
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const scratchObject = new THREE.Object3D();
const scratchColor = new THREE.Color();

/**
 * SCRUB THAT STANDS IN THE LIGHT (brief U3).
 *
 * Two defects, one cause. Every instance of a class shares one flat colour, and nothing any of them
 * casts touches the ground — so a few hundred props read as speckle printed on the terrain rather
 * than objects standing on it, and the field looks flatter in play than the atlas promises.
 *
 * Both fixes are per-instance data on the SAME material, so the draw-call count per class stays 1:
 * an instance-colour attribute for tint, and one shared contact-shadow mesh for the classes whose
 * silhouettes are tall enough to owe the ground a shadow.
 *
 * TINT IS HASHED FROM POSITION, NOT DRAWN FROM THE PLACEMENT RNG. Pulling extra numbers out of
 * `placeDetail`'s stream would shift every subsequent position and silently re-scatter all five
 * maps — a beauty change is not allowed to move where things are.
 */
const TINT_JITTER: Partial<Record<DetailClassId, { warm: number; value: number }>> = {
  rocks: { warm: 0.09, value: 0.16 },
  stumps: { warm: 0.07, value: 0.13 },
  dry_grass: { warm: 0.11, value: 0.22 },
  claim_posts: { warm: 0.06, value: 0.12 },
  cactus: { warm: 0.08, value: 0.18 },
  reeds: { warm: 0.07, value: 0.16 },
};

/** Classes whose bodies stand up off the ground and therefore owe it a contact shadow. */
const CONTACT_SHADOW_CLASSES: Partial<Record<DetailClassId, { radius: number; squash: number }>> = {
  rocks: { radius: 0.55, squash: 0.62 },
  cactus: { radius: 0.42, squash: 0.74 },
  stumps: { radius: 0.44, squash: 0.7 },
  dry_grass: { radius: 0.30, squash: 0.66 },
  claim_posts: { radius: 0.24, squash: 0.8 },
};
/**
 * The brief proposed ~0.14. Measured at the run camera that moved 0.2% of the frame — technically
 * present, invisible in play, because the scatter is small and far at the shipped zoom. 0.19 with
 * wider ellipses is the value that reads without turning the ground into a polka dot.
 */
const CONTACT_SHADOW_OPACITY = 0.19;
const CONTACT_SHADOW_LIFT = 0.016;
const BUILD_PAD_PROBE = { x: 0, z: 9 };
const FORD_PROBE = { x: 0, z: 0 };
const ROUTING_PROBE = { x: 0, z: -14 };
const SCATTER_DESCRIPTOR = activeContract().tileParams.scatter;

export class DetailScatter {
  readonly group = new THREE.Group();

  private readonly classes: DetailClass[];
  private readonly seededInstances: DetailInstance[] = [];
  private readonly seed = scatterSeed();
  private readonly densityTier: DetailDensityTier;
  private readonly contactShadows: THREE.InstancedMesh;
  private buildingClearings: readonly DetailScatterClearPoint[] = [];
  private clearingsSignature = '';

  constructor() {
    this.group.name = 'DetailScatter';
    this.densityTier = densityTier();
    const density = detailDensity(this.densityTier);
    this.classes = createProfiles().map((profile) => this.createClass(profile, density));
    this.contactShadows = createContactShadows(this.seededInstances);
    this.group.add(this.contactShadows);
    this.syncBuildingClearings([]);
  }

  syncBuildingClearings(clearings: readonly DetailScatterClearPoint[]): void {
    const signature = clearings
      .map((point) => `${point.x.toFixed(1)},${point.z.toFixed(1)},${point.radius.toFixed(1)}`)
      .join('|');
    if (signature === this.clearingsSignature) return;
    this.clearingsSignature = signature;
    this.buildingClearings = clearings;

    let shadowsChanged = false;
    for (const detail of this.seededInstances) {
      const hidden = isNearAny(detail, clearings);
      if (hidden === detail.hidden) continue;
      detail.hidden = hidden;
      writeInstance(detail.mesh, detail.index, detail, hidden);
      // A building clears the scrub under it; a shadow left behind would be a stain with nothing
      // casting it, which is worse than no shadow at all.
      if (detail.shadowIndex >= 0 && this.contactShadows) {
        writeContactShadow(this.contactShadows, detail.shadowIndex, detail, hidden);
        shadowsChanged = true;
      }
    }
    for (const entry of this.classes) entry.mesh.instanceMatrix.needsUpdate = true;
    if (shadowsChanged) this.contactShadows.instanceMatrix.needsUpdate = true;
  }

  diagnostics(): DetailScatterDiagnostics {
    const classes = this.classes.map((entry) => ({
      id: entry.profile.id,
      instances: entry.instances.length,
      visibleInstances: entry.instances.filter((detail) => !detail.hidden).length,
      drawCalls: 1 as const,
    }));
    const totalInstances = classes.reduce((total, entry) => total + entry.visibleInstances, 0);
    return {
      instanceClasses: classes.filter((entry) => entry.instances > 0).length,
      contactShadows: this.contactShadows.count,
      totalInstances,
      seededInstances: this.seededInstances.length,
      densityTier: this.densityTier,
      seed: this.seed,
      classes,
      exclusions: {
        buildPadRadius: Balance.world.detailBuildPadClearRadius,
        routingLaneRadius: Balance.world.detailRoutingLaneClearRadius,
        harvestAnchorRadius: Balance.world.detailHarvestAnchorClearRadius,
        buildingClearRadius: Balance.world.detailBuildingClearRadius,
      },
      probes: {
        buildPad: probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildPadClearRadius),
        ford: probeClear(this.seededInstances, FORD_PROBE.x, FORD_PROBE.z, Terrain.RIVER_MAX_Z + Terrain.SHALLOWS_WIDTH),
        routingLane: probeClear(this.seededInstances, ROUTING_PROBE.x, ROUTING_PROBE.z, Balance.world.detailRoutingLaneClearRadius),
        building: this.buildingClearings[0]
          ? probeClear(
              this.seededInstances,
              this.buildingClearings[0].x,
              this.buildingClearings[0].z,
              this.buildingClearings[0].radius,
            )
          : probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildingClearRadius),
      },
      signature: this.seededInstances
        .slice(0, 12)
        .map((detail) => `${detail.x.toFixed(2)},${detail.z.toFixed(2)}`)
        .join('|'),
    };
  }

  dispose(): void {
    disposeObject3D(this.group);
  }

  private createClass(profile: DetailProfile, density: number): DetailClass {
    const count = Math.max(0, Math.floor(profile.baseCount * density));
    const mesh = new THREE.InstancedMesh(profile.geometry, profile.material, Math.max(1, count));
    mesh.name = `DetailScatter.${profile.id}`;
    mesh.userData.detailProfile = profile;
    mesh.count = count;
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    if (profile.groundRotationX !== undefined) mesh.renderOrder = RenderLayers.groundDecals;
    if (count === 0) mesh.visible = false;
    this.group.add(mesh);

    const rng = createRng((this.seed ^ normalizeSeed(profile.id)) >>> 0);
    // Dressing draws from a stream of its own, so adding a tint cannot shift one placement:
    // the seeded scatter signature stays byte-identical to the run before this upgrade.
    const tintRng = createRng((this.seed ^ normalizeSeed(`${profile.id}:tint`)) >>> 0);
    const instances: DetailInstance[] = [];
    for (let index = 0; index < count; index += 1) {
      const placed = placeDetail(profile, rng, instances);
      if (profile.instanceTint) mesh.setColorAt(index, profile.instanceTint(tintRng));
      if (!placed) {
        mesh.setMatrixAt(index, hiddenMatrix);
        continue;
      }
      const detail: DetailInstance = {
        ...placed,
        hidden: false,
        mesh,
        index,
        shadowIndex: CONTACT_SHADOW_CLASSES[profile.id] ? this.seededInstances.length : -1,
      };
      writeInstance(mesh, index, detail, false);
      mesh.setColorAt(index, instanceTint(profile.id, placed.x, placed.z));
      instances.push(detail);
      this.seededInstances.push(detail);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    const contact = contactPatchMesh(instances, profile);
    if (contact) this.group.add(contact);
    const swayTime = (profile.material.userData.reedTime ?? null) as THREE.IUniform<number> | null;
    if (swayTime) {
      let lastFrame = -1;
      let last = 0;
      mesh.onBeforeRender = (renderer) => {
        if (renderer.info.render.frame === lastFrame) return;
        lastFrame = renderer.info.render.frame;
        const now = performance.now();
        swayTime.value += last === 0 ? 0 : Math.min(0.1, Math.max(0, (now - last) / 1000));
        last = now;
      };
    }
    return { profile, mesh, instances };
  }
}

function createProfiles(): DetailProfile[] {
  return [
    {
      id: 'rocks',
      baseCount: profileCount('rocks', 44),
      geometry: rockGeometry(),
      material: standardMaterial('#8c7f6d', 0.9),
      minScale: 0.55,
      maxScale: 1.25,
      baseY: 0,
    },
    {
      id: 'stumps',
      baseCount: profileCount('stumps', 18),
      geometry: stumpGeometry(),
      material: standardMaterial('#4f331f', 0.86),
      minScale: 0.72,
      maxScale: 1.15,
      baseY: 0,
    },
    {
      id: 'dry_grass',
      baseCount: profileCount('dry_grass', 92),
      geometry: grassGeometry(),
      material: new THREE.MeshStandardMaterial({
        color: '#7b8050',
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      minScale: 0.58,
      maxScale: 1.35,
      baseY: 0.01,
    },
    {
      id: 'wagon_ruts',
      baseCount: profileCount('wagon_ruts', 24),
      geometry: new THREE.PlaneGeometry(1.9, 0.46),
      material: rutMaterial(),
      minScale: 0.72,
      maxScale: 1.4,
      baseY: 0.018,
      groundRotationX: -Math.PI / 2,
    },
    {
      id: 'claim_posts',
      baseCount: profileCount('claim_posts', 12),
      geometry: claimPostGeometry(),
      material: standardMaterial('#6f5732', 0.78),
      minScale: 0.82,
      maxScale: 1.1,
      baseY: 0,
    },
    {
      id: 'cactus',
      baseCount: profileCount('cactus', 0),
      geometry: cactusGeometry(),
      material: standardMaterial('#4f6f4a', 0.92),
      minScale: 0.74,
      maxScale: 1.25,
      baseY: 0,
    },
    {
      id: 'reeds',
      baseCount: profileCount('reeds', 0),
      geometry: reedGeometry(),
      material: reedMaterial(),
      minScale: 0.72,
      maxScale: 1.42,
      baseY: 0.01,
      instanceTint: reedTint,
      // Scatter never casts a shadow (castShadow is off for every class, by budget), so a tuft
      // with no contact patch floats. Only the bigger half get one; a patch under every sprig
      // reads as mould.
      contact: { radius: 0.38, minScale: 0.98 },
    },
  ];
}

function profileCount(id: DetailClassId, fallback: number): number {
  return Math.max(0, Math.floor(SCATTER_DESCRIPTOR?.classCounts?.[id] ?? fallback));
}

function placeDetail(
  profile: DetailProfile,
  rng: Rng,
  placedInClass: readonly DetailInstance[],
): Omit<DetailInstance, 'hidden' | 'mesh' | 'index' | 'shadowIndex'> | null {
  const attempts = Math.max(40, profile.baseCount * 80);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const x = rng.range(Terrain.bounds.minX + 1, Terrain.bounds.maxX - 1);
    const z = rng.range(Terrain.bounds.minZ + 1, Terrain.bounds.maxZ - 1);
    if (Terrain.sample(x, z).zone !== 'bank') continue;
    if (staticExcluded(x, z)) continue;
    if (rng.next() > detailAcceptance(profile, x, z)) continue;
    if (tooCloseToClass(x, z, placedInClass)) continue;

    const scale = rng.range(profile.minScale, profile.maxScale);
    return {
      x,
      z,
      y: Terrain.visualY(x, z, profile.baseY, 0.35),
      rotation: rng.range(0, Math.PI * 2),
      scale,
    };
  }
  return null;
}

function staticExcluded(x: number, z: number): boolean {
  if (Terrain.routingLaneDistance(x, z) < Balance.world.detailRoutingLaneClearRadius) return true;
  if (distanceSq(x, z, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z) < Balance.world.detailBuildPadClearRadius ** 2) return true;
  for (const anchor of Terrain.nodeAnchors) {
    if (distanceSq(x, z, anchor.x, anchor.z) < Balance.world.detailHarvestAnchorClearRadius ** 2) return true;
  }
  return false;
}

function routingLaneDistance(x: number, z: number): number {
  return Terrain.routingLaneDistance(x, z);
}

function detailAcceptance(profile: DetailProfile, x: number, z: number): number {
  const feature = Terrain.terrainFeatureSample(x, z);
  const edge = Math.max(Math.abs(x) / Terrain.CLAIM_HALF, Math.abs(z) / Terrain.CLAIM_HALF);
  const lane = Math.min(1, routingLaneDistance(x, z) / 10);
  const base = 0.16 + edge * 0.74 + lane * 0.12;
  if (profile.id === 'cactus') {
    const dryEdge = smoothstep(7, 20, Math.abs(z)) * (1 - nearWaterMask(x, z));
    return THREE.MathUtils.clamp(base * dryEdge * (0.7 + feature.shelf * 1.2 + feature.bluff * 0.4), 0.04, 0.88);
  }
  if (profile.id === 'reeds') {
    const water = nearWaterMask(x, z);
    const bias = SCATTER_DESCRIPTOR?.nearWaterBias ?? 1;
    return THREE.MathUtils.clamp((0.14 + water * 1.6 * bias) * (0.7 + lane * 0.35), 0.02, 0.96);
  }
  const bias =
    profile.id === 'rocks'
      ? 0.42 + feature.shelf * 1.45 + feature.bluff * 0.55
      : profile.id === 'dry_grass'
        ? 0.58 + feature.pocket * 1.15 - feature.gully * 0.18
        : 0.76 + feature.pocket * 0.18;
  return THREE.MathUtils.clamp(base * bias, 0.08, 0.98);
}

function nearWaterMask(x: number, z: number): number {
  let mask = Terrain.hasRiverWater() ? 1 - smoothstep(0.8, 6.5, Math.max(0, Math.abs(z) - Terrain.RIVER_MAX_Z)) : 0;
  for (const source of Terrain.waterSources()) {
    mask = Math.max(mask, 1 - smoothstep(source.radius + 0.35, source.radius + 5.5, Math.hypot(x - source.x, z - source.z)));
  }
  return THREE.MathUtils.clamp(mask, 0, 1);
}

function tooCloseToClass(x: number, z: number, placed: readonly DetailInstance[]): boolean {
  for (const detail of placed) {
    if (distanceSq(x, z, detail.x, detail.z) < 0.7 * 0.7) return true;
  }
  return false;
}

function writeInstance(mesh: THREE.InstancedMesh, index: number, detail: DetailInstance | Omit<DetailInstance, 'mesh' | 'index'>, hidden: boolean): void {
  if (hidden) {
    mesh.setMatrixAt(index, hiddenMatrix);
    return;
  }
  const profile = profileForMesh(mesh);
  scratchObject.position.set(detail.x, detail.y, detail.z);
  if (profile?.groundRotationX !== undefined) {
    scratchObject.rotation.set(profile.groundRotationX, 0, detail.rotation);
  } else {
    scratchObject.rotation.set(0, detail.rotation, 0);
  }
  scratchObject.scale.setScalar(detail.scale);
  scratchObject.updateMatrix();
  mesh.setMatrixAt(index, scratchObject.matrix);
}

/**
 * One mesh, one material, one draw call for every contact shadow on the map. Sized to the exact
 * number of standing instances rather than a guessed ceiling.
 */
function createContactShadows(details: readonly DetailInstance[]): THREE.InstancedMesh {
  const shadowed = details.filter((detail) => detail.shadowIndex >= 0);
  const mesh = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 14),
    new THREE.MeshBasicMaterial({
      color: '#2e1b0e',
      transparent: true,
      opacity: CONTACT_SHADOW_OPACITY,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    Math.max(1, shadowed.length),
  );
  mesh.name = 'DetailScatter.contactShadows';
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = RenderLayers.groundShadows;
  mesh.count = shadowed.length;
  if (shadowed.length === 0) mesh.visible = false;
  // shadowIndex is an index into `details`, so compact it down to the shadow mesh's own slots.
  shadowed.forEach((detail, slot) => {
    detail.shadowIndex = slot;
    writeContactShadow(mesh, slot, detail, detail.hidden);
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function writeContactShadow(
  mesh: THREE.InstancedMesh,
  slot: number,
  detail: DetailInstance,
  hidden: boolean,
): void {
  if (hidden) {
    mesh.setMatrixAt(slot, hiddenMatrix);
    return;
  }
  const profile = profileForMesh(detail.mesh);
  const shape = profile ? CONTACT_SHADOW_CLASSES[profile.id] : undefined;
  if (!shape) {
    mesh.setMatrixAt(slot, hiddenMatrix);
    return;
  }
  scratchObject.position.set(detail.x, Terrain.visualY(detail.x, detail.z, 0, 0.35) + CONTACT_SHADOW_LIFT, detail.z);
  scratchObject.rotation.set(-Math.PI / 2, 0, detail.rotation);
  scratchObject.scale.set(shape.radius * detail.scale, shape.radius * shape.squash * detail.scale, 1);
  scratchObject.updateMatrix();
  mesh.setMatrixAt(slot, scratchObject.matrix);
}

/**
 * A warm/cool and light/dark nudge per instance, hashed from world position so it is stable across
 * boots and independent of the placement stream. Multiplied onto the class colour by three's
 * instance-colour attribute — same material, same single draw call.
 */
function instanceTint(id: DetailClassId, x: number, z: number): THREE.Color {
  const jitter = TINT_JITTER[id];
  if (!jitter) return scratchColor.setRGB(1, 1, 1);
  const warm = hash01(x * 12.9898 + z * 78.233) - 0.5;
  const value = hash01(x * 39.3468 - z * 11.135 + 7.31) - 0.5;
  const scale = 1 + value * jitter.value * 2;
  return scratchColor.setRGB(
    scale * (1 + warm * jitter.warm),
    scale,
    scale * (1 - warm * jitter.warm),
  );
}

function hash01(value: number): number {
  const scaled = Math.sin(value) * 43758.5453;
  return scaled - Math.floor(scaled);
}

function profileForMesh(mesh: THREE.InstancedMesh): DetailProfile | undefined {
  return mesh.userData.detailProfile as DetailProfile | undefined;
}

function isNearAny(detail: DetailInstance, clearings: readonly DetailScatterClearPoint[]): boolean {
  for (const clearing of clearings) {
    if (distanceSq(detail.x, detail.z, clearing.x, clearing.z) < clearing.radius * clearing.radius) return true;
  }
  return false;
}

function probeClear(
  details: readonly DetailInstance[],
  x: number,
  z: number,
  clearRadius: number,
): DetailScatterProbe {
  let nearestSq = Number.POSITIVE_INFINITY;
  for (const detail of details) {
    if (detail.hidden) continue;
    nearestSq = Math.min(nearestSq, distanceSq(x, z, detail.x, detail.z));
  }
  const nearest = Number.isFinite(nearestSq) ? Math.sqrt(nearestSq) : null;
  return {
    x,
    z,
    clearRadius,
    nearest,
    clear: nearest === null || nearest >= clearRadius,
  };
}

function detailDensity(tier: DetailDensityTier): number {
  if (tier === 'off') return 0;
  const raw = tier === 'mobile-reduced' ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
  return THREE.MathUtils.clamp(raw * (SCATTER_DESCRIPTOR?.density ?? 1), 0, 1.5);
}

function densityTier(): DetailDensityTier {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const density = mobile ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
  if (density <= 0) return 'off';
  return mobile ? 'mobile-reduced' : 'desktop';
}

function scatterSeed(): number {
  const raw = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('seed');
  return (normalizeSeed(raw) ^ 0x51f15eed) >>> 0;
}

function distanceSq(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function standardMaterial(color: string, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  });
}

function rockGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.DodecahedronGeometry(0.34, 0);
  geometry.scale(1.25, 0.55, 0.9);
  geometry.translate(0, 0.2, 0);
  return geometry;
}

function stumpGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.2, 0.28, 0.44, 7);
  geometry.translate(0, 0.22, 0);
  return geometry;
}

function claimPostGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(0.16, 1.08, 0.16);
  geometry.translate(0, 0.54, 0);
  return geometry;
}

function cactusGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.13, 0.18, 0.88, 7);
  geometry.translate(0, 0.44, 0);
  return geometry;
}

// A REED IS NOT A BLADE OF GRASS (docs/beauty/e1-twin-banks-brief.md U3). The reeds class used
// to be grassGeometry scaled thinner: two crossed quads of equal height, which at the run camera
// read as four identical bright matchsticks stuck in dry dirt — on a map whose briefing card
// promises "damp reeds". Three unequal tapered blades, leaning off-axis, give a tuft a silhouette
// that survives 390px; the sway, the per-instance tint and the contact patch do the rest.
const REED_BLADES = [
  { angle: 0, height: 0.88, lean: 0.12, width: 0.085 },
  { angle: 1.09, height: 0.7, lean: -0.16, width: 0.072 },
  { angle: 2.24, height: 1.02, lean: 0.06, width: 0.078 },
] as const;
// The class it replaces, in the renderer's working (linear) space. Anything derived from a
// contract tint has to be MODULATED against this, never used as an albedo: dampTint is a
// splat multiplier around 0.5, which as a linear albedo is five times the value this
// silhouette was authored at, and the first cut of U3 bleached every reed to dead straw.
const REED_BASE = { r: 0.095, g: 0.15, b: 0.052 } as const;
const REED_DRY = { r: 0.155, g: 0.125, b: 0.055 } as const;

function reedGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (const blade of REED_BLADES) {
    const along = { x: Math.cos(blade.angle), z: Math.sin(blade.angle) };
    const base = positions.length / 3;
    // Tapered quad: a wide root, a tip pulled sideways so no two blades stand parallel.
    positions.push(
      -along.x * blade.width, 0, -along.z * blade.width,
      along.x * blade.width, 0, along.z * blade.width,
      -along.x * blade.width * 0.22 + along.x * blade.lean, blade.height, -along.z * blade.width * 0.22 + along.z * blade.lean,
      along.x * blade.width * 0.22 + along.x * blade.lean, blade.height, along.z * blade.width * 0.22 + along.z * blade.lean,
    );
    indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function reedMaterial(): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff', // the tile's own dampTint arrives per instance; white keeps it honest
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });
  const time = { value: 0 };
  material.userData.reedTime = time;
  material.customProgramCacheKey = () => 'reed-sway';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReedTime = time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uReedTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        // Phase from the instance's own world position: neighbouring tufts never bend in step,
        // and the whole field costs one uniform and no CPU work per frame.
        float reedPhase = instanceMatrix[3].x * 0.71 + instanceMatrix[3].z * 0.93;
        float reedSway = sin(uReedTime * 1.25 + reedPhase) * 0.06 + sin(uReedTime * 2.6 + reedPhase * 1.7) * 0.022;
        transformed.x += reedSway * transformed.y;
        transformed.z += reedSway * 0.42 * transformed.y;`,
      );
  };
  return material;
}

/** Damp green-grey pulled toward the tile's own dampTint HUE, jittered per instance. */
function reedTint(rng: Rng): THREE.Color {
  const damp = activeContract().tileParams.palette?.dampTint ?? [0.45, 0.53, 0.4];
  const mean = Math.max(0.001, (damp[0]! + damp[1]! + damp[2]!) / 3);
  const value = rng.range(0.78, 1.26);
  // A minority of every reed bed is last season's dry stalk; squared so it stays a minority.
  const dry = rng.range(0, 1) ** 2 * 0.55;
  const channel = (base: number, dried: number, tint: number): number =>
    THREE.MathUtils.lerp(base * (tint / mean), dried, dry) * value;
  return new THREE.Color().setRGB(
    channel(REED_BASE.r, REED_DRY.r, damp[0]!),
    channel(REED_BASE.g, REED_DRY.g, damp[1]!),
    channel(REED_BASE.b, REED_DRY.b, damp[2]!),
    THREE.LinearSRGBColorSpace,
  );
}

function contactPatchMesh(details: readonly DetailInstance[], profile: DetailProfile): THREE.InstancedMesh | null {
  const contact = profile.contact;
  const tufts = contact ? details.filter((detail) => detail.scale >= contact.minScale) : [];
  if (!contact || tufts.length === 0) return null;
  const mesh = new THREE.InstancedMesh(new THREE.CircleGeometry(contact.radius, 12), contactMaterial(), tufts.length);
  mesh.name = `DetailScatter.${profile.id}.contact`;
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  const object = new THREE.Object3D();
  for (const [index, detail] of tufts.entries()) {
    object.position.set(detail.x, detail.y + 0.012, detail.z);
    object.rotation.set(-Math.PI / 2, 0, detail.rotation);
    object.scale.set(detail.scale, detail.scale * 0.72, 1);
    object.updateMatrix();
    mesh.setMatrixAt(index, object.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function contactMaterial(): THREE.MeshBasicMaterial {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(28, 22, 12, 0.62)');
    gradient.addColorStop(0.55, 'rgba(28, 22, 12, 0.28)');
    gradient.addColorStop(1, 'rgba(28, 22, 12, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

function grassGeometry(): THREE.BufferGeometry {
  const width = 0.32;
  const height = 0.58;
  const positions = [
    -width, 0, 0, width, 0, 0, -width, height, 0, width, height * 0.82, 0,
    0, 0, -width, 0, 0, width, 0, height * 0.88, -width, 0, height, width,
  ];
  const indices = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function rutMaterial(): THREE.MeshBasicMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(82, 54, 31, 0.34)';
    context.lineWidth = 8;
    for (const y of [22, 42]) {
      context.beginPath();
      for (let x = 0; x <= canvas.width; x += 16) {
        const wobble = Math.sin(x * 0.055 + y) * 2;
        if (x === 0) context.moveTo(x, y + wobble);
        else context.lineTo(x, y + wobble);
      }
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
