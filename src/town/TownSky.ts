import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { PerformanceTier } from '../game/PerformanceTier';

// THE ATMOSPHERICS SHIFT — THREE SKIES, NONE OF THEM A DECISION.
//
// The town beauty shift built a sky dome plus a dune vista at r30-45, measured "+3 draw calls,
// zero pixels", and reverted the pair (reviews/beauty-town.md F-BT-2). Its arithmetic put the
// top edge of the frame 34.1 degrees below horizontal and concluded a horizon is unreachable.
//
// The top edge IS below horizontal — that part is right, and it is why none of these three is a
// sky *dome*: every ray the town camera casts points at the ground. But "zero pixels" was
// measured from the PLAZA, and it does not survive walking north. Measured on this branch with
// the void painted magenta (logs/session-scratch/atmos-town-cone.mjs), desktop 1280x800:
//
//   hero z   +2      -2      -6      -9     -11     -13   -14.5    NW corner
//   void %    0     0.0    5.75    9.73    24.9   27.01   32.58        32.97   (framing 0.85)
//   void %    0    0.08    8.56   12.73   27.69   29.68   34.69            —   (framing 1.10)
//
// The town plate GLB is 44x44 (accessor bounds +/-22), the frame's top edge reaches 31.0 world
// units at the default framing and 39.3 at the widest, and the difference between those two
// numbers is a third of the screen. It has always been there. It is invisible because
// scene.background, the fog colour and the dirt are all #e9c98d: the town has a horizon and
// paints it the same colour as the ground.
//
// So: three ways to answer that band, all behind ?townSky. The owner picked from the board
// (owner directive, 2026-08-04: "c") — ONLY AIR is now the default boot; a and b stay as
// ?townSky previews and ?townSky=off restores the pre-sky boot.
//
//   a  THE LAND GOES ON   sky ramp + a lit, fogged dune belt standing just past the plate rim.
//                         Real geometry in the world's own light. The rim stops being an edge.
//   b  THE PAINTED RING   sky ramp + one unlit fog-excluded painted backdrop pinned to the far
//                         plane — the exact grammar every run map's panorama uses, so the town
//                         and the contracts read as one book.
//   c  ONLY AIR           the sky ramp alone. No geometry at all, one background texture. The
//                         plate's own rim becomes the horizon.
//
// THE U6 PERF LESSON, KEPT: nothing here is allowed to cost a draw call for pixels it cannot
// put on screen. Every variant is measured by the same instrument that killed round one.

export type TownSkyVariant = 'off' | 'a' | 'b' | 'c';

export type TownSkyPalette = {
  zenith: string;
  band: string;
  horizon: string;
  ridge: string;
  dune: string;
};

export type TownSkyBuild = {
  variant: TownSkyVariant;
  /** Equirectangular ramp for scene.background; null keeps the flat colour the town shipped. */
  background: THREE.Texture | null;
  /** World objects the variant adds. Empty for 'c'. */
  objects: THREE.Object3D[];
  triangles: number;
  /** Variant 'b' rides the camera so its painted ridge lands in the same place from anywhere. */
  follow: (camera: THREE.Camera) => void;
  dispose: () => void;
};

const SKY_PARAM = 'townSky';

export function readTownSkyVariant(search: string = window.location.search): TownSkyVariant {
  const value = new URLSearchParams(search).get(SKY_PARAM);
  if (value === 'a' || value === 'b' || value === 'c') return value;
  if (value === 'off') return 'off';
  return 'c';
}

// WHERE THE HORIZON IS ALLOWED TO SIT, and why it is not at v = 0.5.
//
// three.js maps an equirect background by v = asin(dir.y)/PI + 0.5, so the true horizon is
// v 0.5. The town's top-of-frame ray is pitched 29.5 degrees DOWN at the default framing
// (measured: -29.51) and 35.5 down at the widest, which is v 0.336 and v 0.29. Every pixel the
// town can show lives in v 0.26..0.35 — under the horizon, looking at ground that runs out
// past the plate and never ends.
//
// A physically-placed horizon would therefore never appear. These stops paint the horizon where
// the camera can see it — a painted horizon, which is what every run map's panorama also does
// (its ridge line sits at -11.8 degrees). Above v 0.40 the ramp is authored as a real sky
// anyway, so if the zoom clamps or the camera pitch are ever opened (F-BT-2's owner-desk item)
// the same texture stands up without a repaint.
// Measured band, so the ramp is authored inside it rather than across a sky nobody reaches:
// the frame's top edge is v 0.336 at framing 0.85, 0.314 at 0.36 and 0.303 at 1.10, and the
// plate's rim occludes everything below about v 0.28. Every stop between 0.27 and 0.35 is a
// stop a player can see; the ones above it are the real sky, kept correct and unseen.
const SKY_STOPS: readonly { v: number; key: keyof TownSkyPalette; mix?: number }[] = [
  { v: 0.0, key: 'dune' },
  { v: 0.2, key: 'ridge' },
  { v: 0.268, key: 'horizon' },
  { v: 0.296, key: 'band' },
  { v: 0.318, key: 'zenith', mix: 0.3 },
  { v: 0.345, key: 'zenith', mix: 0.72 },
  { v: 0.44, key: 'zenith' },
  { v: 1.0, key: 'zenith' },
];

const SKY_TEXTURE_HEIGHT = 512;
const SKY_TEXTURE_WIDTH = 16;

export function createTownSkyTexture(palette: TownSkyPalette): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SKY_TEXTURE_WIDTH;
  canvas.height = SKY_TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  // v = 0 is -Y (straight down) and v = 1 is +Y, so the canvas is painted bottom-up.
  const gradient = ctx.createLinearGradient(0, SKY_TEXTURE_HEIGHT, 0, 0);
  for (const stop of SKY_STOPS) gradient.addColorStop(stop.v, blendStop(palette, stop));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SKY_TEXTURE_WIDTH, SKY_TEXTURE_HEIGHT);
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'TownSkyRamp';
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function blendStop(palette: TownSkyPalette, stop: { key: keyof TownSkyPalette; mix?: number }): string {
  const colour = new THREE.Color(palette[stop.key]);
  if (stop.mix !== undefined) colour.lerp(new THREE.Color(palette.band), 1 - stop.mix);
  return `#${colour.getHexString()}`;
}

// --- a: THE LAND GOES ON -----------------------------------------------------------------
//
// The plate is a SQUARE (+/-22), so a circular belt would sit inside it at the edge midpoints
// and outside it at the corners. The mounds follow a superellipse instead — the plate's own
// rounded-square rim, pushed out by a jittered margin.
//
// The height ceiling is not taste, it is the cone. At the default framing the highest visible
// point at horizontal distance d from the camera is y = 17.53 - 0.5659*d; a mound at z -26 is
// cut off above y 3.3, and one at z -31 is cut off at y 0. So the belt is authored between the
// plate rim and 30 units out, and nothing in it stands taller than 3.
// The belt starts UNDER the plate rim so the hard 44x44 edge has nothing to be an edge against,
// and stops at 34 because at the default framing the top of the frame reaches ground at 31.0:
// past that the belt is behind the player's eye line and pays for pixels it cannot show.
// The plate's ACCESSOR bounds are +/-22, but its silhouette ends sooner: the first cut anchored
// the belt at 21.4 and rendered a floating ridge with a band of sky under it, because the plate
// GLB's outer margin falls away below y 0 (its min y is -1.74) and the ground the camera can
// actually see runs out around 18. The belt therefore starts at 15.5, under the plate, where a
// seam has nothing to be a seam against.
const DUNE_INNER = 19.5;
const DUNE_OUTER = 28;
const DUNE_RINGS = 7;
const DUNE_SEGMENTS = 132;

// One landform, not a field. The first cut scattered 96 instanced half-spheres out here and they
// read as boulders — separate silhouettes with dark seams where they overlapped, at a distance
// where the eye wants a single ridge. A continuous superelliptical apron with a noise-driven
// crest is the same draw call and reads as land.
function createDuneBelt(palette: TownSkyPalette, tier: PerformanceTier): THREE.Mesh {
  const rings = tier === 'lite' ? 4 : DUNE_RINGS;
  const segments = tier === 'full' ? DUNE_SEGMENTS : tier === 'balanced' ? 96 : 64;
  const positions: number[] = [];
  const normals: number[] = [];
  const colours: number[] = [];
  const indices: number[] = [];

  const dune = new THREE.Color(palette.dune);
  const ridge = new THREE.Color(palette.ridge);
  const haze = new THREE.Color(palette.horizon);
  const colour = new THREE.Color();

  // Superellipse (n = 4) rides the plate's SQUARE rim; a circle would sit inside the plate at the
  // edge midpoints and outside it at the corners, which are 31.1 out.
  const radiusAt = (angle: number, margin: number): [number, number] => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const norm = Math.pow(Math.pow(Math.abs(cos), 4) + Math.pow(Math.abs(sin), 4), -0.25);
    return [cos * norm * margin, sin * norm * margin];
  };

  // The crest profile: three sines of coprime-ish frequency so the ridge never repeats inside
  // one turn, plus a rise-and-fall across the apron's width so it is a dune and not a wall.
  const crest = (angle: number): number =>
    Math.max(0.34, 0.82 + 0.22 * Math.sin(angle * 3 + 0.6) + 0.15 * Math.sin(angle * 7 - 1.9) + 0.09 * Math.sin(angle * 13 + 2.7));

  for (let r = 0; r < rings; r += 1) {
    const t = r / (rings - 1);
    const margin = DUNE_INNER + t * (DUNE_OUTER - DUNE_INNER);
    for (let s = 0; s <= segments; s += 1) {
      const angle = (s / segments) * Math.PI * 2;
      const [x, z] = radiusAt(angle, margin);
      // Height: zero at the plate rim (no step to give the seam away), crest at t 0.34,
      // falling away behind. The ceiling matters — at the default framing the highest point
      // the camera can contain at 26 units is y 2.8, so a crest of 2.15 stands clear of the
      // plate's own 1.59 of relief and still never touches the top edge of the frame.
      // Zero at both ends and SUNK at the inner ring, so the plate always hides the belt's start.
      // Anything positive at t 0 draws over the town's own ground: the first cut lifted the inner
      // ring 0.46 above it and painted a brown apron across the upper half of the frame.
      const shape = Math.sin(Math.min(1, t / 0.82) * Math.PI) ** 1.15;
      const y = shape * crest(angle) * 1.15 - 0.55;
      positions.push(x, y, z);
      // Cheap analytic-ish normal: the apron is shallow, so up-weighted is honest and free.
      const slope = (crest(angle) * 1.15) / (DUNE_OUTER - DUNE_INNER);
      const nx = -x / Math.max(1e-3, margin) * slope * (t < 0.45 ? 1 : -1);
      const nz = -z / Math.max(1e-3, margin) * slope * (t < 0.45 ? 1 : -1);
      const normal = new THREE.Vector3(nx, 1, nz).normalize();
      normals.push(normal.x, normal.y, normal.z);
      // Aerial perspective by hand: the far edge dissolves into the sky ramp's own horizon stop.
      // The town's fog band is 34-76 and the belt lives at 21-34, so fog cannot do this without
      // moving the whole town's look.
      colour.copy(dune).lerp(ridge, 0.7).lerp(haze, 0.34 + t * 0.48);
      colours.push(colour.r, colour.g, colour.b);
    }
  }
  for (let r = 0; r < rings - 1; r += 1) {
    for (let s = 0; s < segments; s += 1) {
      const a = r * (segments + 1) + s;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  geometry.setIndex(indices);
  const material = new THREE.MeshStandardMaterial({
    // WHITE, because vertex colours MULTIPLY into material.color. The first cut left the dune
    // brown here as well and rendered a belt of near-black chocolate: #8b6c3f squared. Same
    // family as the town shift's own setColorAt bug, one step further along.
    color: '#ffffff',
    vertexColors: true,
    roughness: 0.97,
    metalness: 0,
    fog: true,
    // Distant land is never darker than the air in front of it. Without this the belt turned
    // into a black mass at dusk and night, when the low amber sun stops reaching its south
    // flank — the one face the camera ever sees.
    emissive: new THREE.Color(palette.horizon),
    emissiveIntensity: 0.26,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'TownSkyDuneBelt';
  mesh.castShadow = false;
  // No shadow either way: the belt sits outside the sun's +/-17 frustum, where a shadow-map
  // lookup samples the clamped border texel and can shade a whole apron for no reason.
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  mesh.renderOrder = RenderLayers.terrainBackdrop;
  return mesh;
}

// --- b: THE PAINTED RING -----------------------------------------------------------------
//
// Run-map grammar, verbatim (src/world/Terrain3dClaimPilot.ts preparePanorama): unlit, fog
// excluded, depthWrite off, frustum culling off, and gl_Position.z forced to the far plane so
// it can never occlude anything and can never be clipped by the camera's far = 100.
//
// THE RING RIDES THE CAMERA, and the numbers say why.
//
// A ring anchored to the town centre at r 34 was the first cut. Its painted ridge landed
// somewhere different from every hero position — the visible slice of its texture ran v
// 0.16..0.53 from the north gate and v 0.33..0.78 from the middle of the square — because the
// camera translates a third of the ring's own radius while walking across town. One paint
// cannot serve both, and the first render showed exactly that: a flat empty band with the
// ridge below the frame.
//
// Following the camera fixes the projection permanently, which is what a backdrop at infinity
// means. Then only ZOOM moves the band, through the fov compensation, and only a little:
// measured top-of-frame pitch is -29.51 deg at framing 0.85, -33.54 at 0.36 and -35.46 at 1.10.
// At radius 60 those pitches put the frame's top edge at y_rel -34.0 / -39.8 / -42.8 below the
// camera, so the ridge crest is authored at y_rel -45 (a pitch of 36.9 deg): just under the top
// edge at the default framing, and still above the plate's rim, which occludes from about
// -49.6 downward. Everything above the crest is sky nobody sees at 1.10 and everybody sees at
// 0.85 — which is the honest shape of a town that looks down.
const RING_RADIUS = 60;
const RING_TOP = -16;
const RING_BOTTOM = -84;
const RING_SEGMENTS = 96;
const RING_ROWS = 6;
/** Where the ridge crest sits in ring UV: y_rel -45 across a band running -16 to -84. */
const RING_CREST_V = (RING_TOP - -45) / (RING_TOP - RING_BOTTOM);

function createPaintedRing(palette: TownSkyPalette): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(
    RING_RADIUS,
    RING_RADIUS,
    RING_TOP - RING_BOTTOM,
    RING_SEGMENTS,
    RING_ROWS,
    true,
  );
  geometry.translate(0, (RING_TOP + RING_BOTTOM) * 0.5, 0);
  const material = new THREE.MeshBasicMaterial({
    map: createRingTexture(palette),
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
    depthTest: true,
    toneMapped: true,
  });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\n  gl_Position.z = gl_Position.w * 0.999999;',
    );
  };
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'TownSkyPaintedRing';
  mesh.frustumCulled = false;
  mesh.renderOrder = RenderLayers.backdrop;
  return mesh;
}

const RING_TEXTURE_WIDTH = 1024;
const RING_TEXTURE_HEIGHT = 256;

// The storybook ring the town already owns, read outward: a warm haze floor, a dust-soft mesa
// line, a second paler line behind it, and the trail leaving town through the gap. Engraved,
// dashed, never drafted (Grit Law) — and no letters anywhere.
function createRingTexture(palette: TownSkyPalette): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = RING_TEXTURE_WIDTH;
  canvas.height = RING_TEXTURE_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  const w = RING_TEXTURE_WIDTH;
  const h = RING_TEXTURE_HEIGHT;

  // v = 0 is the ring's top (RING_TOP) in three.js cylinder UVs.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, mix(palette.band, palette.zenith, 0.78));
  sky.addColorStop(Math.max(0, RING_CREST_V - 0.26), mix(palette.band, palette.zenith, 0.34));
  sky.addColorStop(Math.max(0.01, RING_CREST_V - 0.1), palette.band);
  sky.addColorStop(Math.max(0.02, RING_CREST_V - 0.03), palette.horizon);
  sky.addColorStop(1, palette.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  let seed = 0x9a17;
  const rng = (): number => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  // Two silhouette runs. The far one is pale and tall; the near one is the ridge tone and low,
  // and its crest is where the eye reads "horizon" — placed at the measured RING_CREST_V.
  const runs = [
    { base: RING_CREST_V - 0.055, amp: 0.045, colour: mix(palette.ridge, palette.horizon, 0.5), steps: 38 },
    { base: RING_CREST_V - 0.012, amp: 0.055, colour: mix(palette.ridge, palette.horizon, 0.18), steps: 30 },
    { base: RING_CREST_V + 0.045, amp: 0.08, colour: mix(palette.ridge, palette.dune, 0.66), steps: 24 },
  ];
  for (const run of runs) {
    ctx.fillStyle = run.colour;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i <= run.steps; i += 1) {
      const t = i / run.steps;
      const x = t * w;
      const wobble = Math.sin(t * Math.PI * 6.3 + run.base * 21) * 0.4 + Math.sin(t * Math.PI * 17 + 1.7) * 0.24 + (rng() - 0.5) * 0.5;
      const y = (run.base + wobble * run.amp) * h;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  // A dust haze standing on the near crest, so the ridge foot dissolves rather than cuts.
  const hazeTop = (RING_CREST_V + 0.05) * h;
  const haze = ctx.createLinearGradient(0, hazeTop, 0, h);
  haze.addColorStop(0, `${palette.horizon}00`);
  haze.addColorStop(0.4, `${palette.horizon}b4`);
  haze.addColorStop(1, palette.horizon);
  ctx.fillStyle = haze;
  ctx.fillRect(0, hazeTop, w, h - hazeTop);

  // Dashed scrub speckle along the near crest — engraved, never a drafted line.
  ctx.strokeStyle = mix(palette.ridge, '#2e1b0e', 0.22);
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 260; i += 1) {
    const x = rng() * w;
    const y = h * (RING_CREST_V + 0.06 + rng() * 0.1);
    const len = 1.5 + rng() * 3.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 1.6, y - len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'TownSkyRingPaint';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function mix(a: string, b: string, t: number): string {
  return `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;
}

export function createTownSky(
  variant: TownSkyVariant,
  palette: TownSkyPalette,
  tier: PerformanceTier,
): TownSkyBuild {
  if (variant === 'off') {
    return { variant, background: null, objects: [], triangles: 0, follow: () => {}, dispose: () => {} };
  }
  // b carries its own sky in the ring's paint and the ring brackets every pitch the town can
  // look along (its band spans 14.9 deg to 54.5 deg below the camera; the frame's top edge is
  // 29.5 to 35.5 and anything steeper than 45 has already hit the plate). Measured: the ring
  // differs from the ramp on 35.3% of the frame, i.e. everywhere the ramp would have shown.
  // Paying a second background draw for a texture nothing can see is the exact mistake U6 made.
  const background = variant === 'b' ? null : createTownSkyTexture(palette);
  const objects: THREE.Object3D[] = [];
  let triangles = 0;
  let ring: THREE.Mesh | null = null;
  if (variant === 'a') {
    const belt = createDuneBelt(palette, tier);
    objects.push(belt);
    triangles += (belt.geometry.index?.count ?? belt.geometry.attributes.position.count) / 3;
  } else if (variant === 'b') {
    ring = createPaintedRing(palette);
    objects.push(ring);
    triangles += (ring.geometry.index?.count ?? ring.geometry.attributes.position.count) / 3;
  }
  return {
    variant,
    background,
    objects,
    triangles: Math.round(triangles),
    follow: (camera) => {
      if (!ring) return;
      ring.position.copy(camera.position);
    },
    dispose: () => {
      background?.dispose();
      for (const object of objects) {
        object.traverse((child) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose?.();
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material?.dispose?.();
        });
      }
    },
  };
}
