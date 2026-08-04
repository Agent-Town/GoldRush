import * as THREE from 'three';

// THE ATMOSPHERICS SHIFT — THE BARON'S HORIZON, SECOND ATTEMPT.
//
// Attempt one painted `baron-panorama-atlas.png` and reverted it (reviews/beauty-baron.md,
// F-BEAUTY-BARON-3): the panorama's foot sits at radius ~160 and y -10, which is about 12 to 17
// degrees ABOVE the top edge of the run frame at every zoom. Its recommendation was to retarget
// the brief at the ring FOOT — the part the camera actually sees.
//
// Measured on this branch before writing a line of paint. `?horizonProbe` tinted the panorama
// magenta and the sculpt continuation cyan, and counted both at six hero positions on e1-baron,
// desktop 1280x800 / mobile 390x844 (logs/session-scratch/atmos-baron-horizon.mjs):
//
//   hero z          +20    +8.65      0      -10      -22      -30
//   panorama %     0.00     0.00   0.00     0.00     0.00     0.00     <- unreachable, everywhere
//   apron %        0.00     0.00   0.00     7.85    31.56    51.73     (desktop)
//   apron %        0.00     0.00   0.00     6.51    25.20    44.89     (mobile)
//
// (The raw probe reports a 1.3% floor at the first three poses; that is the HUD's own teal, and
// it starts at row 16.5% of the frame. The apron readings start at row 0.)
//
// So the finale DOES have a horizon and it is `Terrain3dSculptContinuation` — the apron that
// runs from the 64x64 playfield out to the panorama's foot. The moment the player crosses the
// river into the Baron's half, HALF THE FRAME is that surface, and today it is the terrain
// atlas mirrored outward and dimmed: a flat brown smear where the brief asked for smoky
// foothills and a bruised storm-amber sky.
//
// This paints that surface instead. Render-only, one contract, one material: no GLB, no atlas,
// no contract JSON, so the re-export traps that cost attempt one its afternoon
// (F-BEAUTY-BARON-2's landmark carry-forward, F-BEAUTY-BARON-4's county ground skirt) are not
// even in reach. `?baronHorizon=off` restores the shipped apron for an A/B.

export type HorizonApronProfile = {
  /** Where the playfield stops and the apron begins, in world units. */
  innerRadius: number;
  /** Where the apron has fully become air. */
  outerRadius: number;
  /** The haze the far apron dissolves into — the brief's "storm-amber, warm at the rim". */
  haze: string;
  /** The far ceiling the brief asks to fall toward. Never black: canon forbids pure black. */
  ceiling: string;
  /** Ridge band spacing in world units, and how deep the troughs cut. */
  ridgeWavelength: number;
  ridgeDepth: number;
  /** Azimuths (radians) of the company smoke columns, and their width. */
  smokeAzimuths: readonly number[];
  smokeWidth: number;
  smokeStrength: number;
};

// e1-baron only. The finale is the map whose brief asked for this and the map whose review
// proved the panorama could not deliver it.
const PROFILES = new Map<string, HorizonApronProfile>([
  ['e1-baron', {
    innerRadius: 34,
    outerRadius: 68,
    // Warm at the rim, falling to a bruised iron-violet: the U5 sky band read onto the ground
    // the camera can actually reach.
    haze: '#c98a5c',
    ceiling: '#2a2130',
    ridgeWavelength: 15,
    ridgeDepth: 0.3,
    // Three columns, asymmetric (Echo law: never a mirror). Up-screen is -z, i.e. atan2 near
    // -PI/2, so all three sit in the wedge the run camera looks into.
    smokeAzimuths: [-1.92, -1.44, -0.98],
    smokeWidth: 0.26,
    smokeStrength: 0.4,
  }],
  // DRY GULCH — the same mechanism answering that shift's own honest line: "the run camera
  // pitches ~50 degrees down, so there is NO SKY AND NO HORIZON LINE in any shot — the effect
  // distorts distant ground instead of a skyline, which is the weaker version of the idea"
  // (reviews/beauty-dry-gulch.md section 7). The heat shimmer covers the top 45% of the frame.
  // This gives that 45% a horizon to be heat over: bleached noon distance, mesa banding instead
  // of foothills, and no company smoke — the gulch is empty, and its emptiness is the point.
  ['e1-dry-gulch', {
    innerRadius: 34,
    outerRadius: 68,
    haze: '#e8cfa4',
    // Never black, and at noon never dark: the gulch's far edge bleaches out, it does not bruise.
    ceiling: '#cbb489',
    ridgeWavelength: 19,
    ridgeDepth: 0.34,
    smokeAzimuths: [],
    smokeWidth: 0.2,
    smokeStrength: 0,
  }],
  // THE FAR GROUND SHIFT adds the two maps the atmospherics shift did not reach. Both were briefed
  // at the SKY (the-claim U4, twin-banks U5) and both are measured unreachable there: the ring's
  // foot stands 61.4 m (the-claim) and 64.9 m (twin-banks) above the top edge of the frame at its
  // own radius, on both viewports (reviews/beauty-far-ground.md section 1). The brief each of them
  // wrote for a horizon is answered on the only surface that carries one.
  //
  // THE CLAIM — "the first page of the ledger: sunlit parchment banks where the river writes the
  // only dark line". Its U4 asked for "downstream river valley ridges... density falling to quiet
  // parchment", and its DON'T list forbids scarring this map: no wreckage, no siege grammar, and
  // therefore NO COMPANY SMOKE. The calm is the identity; this adds distance to it, not incident.
  ['the-claim', {
    innerRadius: 34,
    outerRadius: 68,
    // Sunlit parchment, the map's own value, thinned by air.
    haze: '#dcb98c',
    // The calm first page never bruises: the far edge goes quiet and grey-warm, not dark.
    ceiling: '#b9a68b',
    // Long, soft shoulders: a river valley continuing downstream, not a gulch and not a fortress.
    ridgeWavelength: 22,
    ridgeDepth: 0.22,
    smokeAzimuths: [],
    smokeWidth: 0.2,
    smokeStrength: 0,
  }],
  // TWIN BANKS — "one river that chose two paths around a gravel plait... a single family holds both
  // banks". Its U5 asked for the braid to re-braid downstream with "a desaturated cottonwood line,
  // two distant smoke columns echoing the two-homestead motif (asymmetric placement — the Echo
  // law)". Two columns, not three, and weak: these are hearths, not the Baron's works.
  ['e1-twin-banks', {
    innerRadius: 34,
    outerRadius: 68,
    haze: '#dcc096',
    // The cottonwood line: desaturated green-grey, per the E1 canon rule that greens stay dusty.
    ceiling: '#8f9a86',
    ridgeWavelength: 26,
    ridgeDepth: 0.26,
    // Asymmetric by construction (Echo law) and both inside the -z wedge the run camera looks into.
    smokeAzimuths: [-1.75, -1.05],
    smokeWidth: 0.2,
    smokeStrength: 0.22,
  }],
]);

export function horizonApronProfile(contractId: string): HorizonApronProfile | undefined {
  const search = new URLSearchParams(window.location.search);
  // `baronHorizon` was the first name, kept because the baron board was shot with it.
  if (search.get('horizonApron') === 'off' || search.get('baronHorizon') === 'off') return undefined;
  // The probe below measures the SURFACE, not the paint on it: a ridged, hazed apron is not a
  // flat primary and cannot be counted by hue. Probing therefore implies apron=off.
  if (farGroundProbeEnabled()) return undefined;
  return PROFILES.get(contractId);
}

// ---------------------------------------------------------------------------------------------
// THE FAR GROUND SHIFT — the instrument, COMMITTED this time.
//
// The comment at the top of this file cites `?horizonProbe` as the measurement that retargeted the
// baron brief. That flag was never committed: it lived in the atmospherics shift's working tree and
// died with it (`git log -S horizonProbe -- src/` finds exactly one commit, and it is this file's
// docstring). The load-bearing number of two reviews was therefore unreproducible. This is the same
// instrument, in the tree, under a name that says what it measures.
//
//   ?farGroundProbe   repaints the three candidate horizon surfaces in flat, tone-mapping-exempt
//                     primaries, so a screenshot can be COUNTED rather than argued about:
//
//                       panorama ring         magenta  #ff00ff   (the sky brief's target)
//                       sculpt continuation   cyan     #00ffff   (the apron: ring foot -> tile)
//                       the terrain tile      green    #00ff00   (the map the player stands on)
//
// `toneMapped = false` is the load-bearing flag: ACES washes an emissive primary toward pastel, and
// the atmospherics shift's first classifier scored a full-frame cyan apron as 0.00% because of it
// (logs/session-scratch/atmos-baron-horizon.mjs:23). Exempting the probe from tone mapping makes the
// three hues separable by a margin test that cannot drift.
//
// Colour only: no geometry, no draw calls, no material swaps (the panorama's material carries the
// `gl_Position.z = w * 0.999999` far-plane pin from preparePanorama, and replacing it would clip a
// 190 m ring against a 100 m far plane and report "not on camera" for the wrong reason).
// ---------------------------------------------------------------------------------------------

// THE POSITIVE CONTROL, and why this probe has one where its two predecessors did not.
//
// "0.00% of the frame is panorama" is the same reading whether the ring is off camera or the tint
// silently failed to reach it, and BOTH prior measurements of this fact rest on a bare zero. So:
//
//   ?farGroundProbe        paints all three surfaces and REPORTS HOW MANY MATERIALS IT PAINTED,
//                          published to the canvas — a nonzero panorama count is proof the ring
//                          really is flat magenta while the census reads zero.
//   ?farGroundProbe=solo   additionally hides the terrain and the apron, so nothing whatsoever can
//                          occlude the ring. If it is inside the frustum at all, it is the frame.
//
// A zero from `solo`, with `panorama=1` painted, is the only form of this claim that cannot be a
// broken instrument.
export type FarGroundSurface = 'panorama' | 'apron' | 'terrain';

const FAR_GROUND_PROBE_COLORS: Record<FarGroundSurface, number> = {
  panorama: 0xff00ff,
  apron: 0x00ffff,
  terrain: 0x00ff00,
};

export function farGroundProbeMode(): 'off' | 'on' | 'solo' {
  const value = new URLSearchParams(window.location.search).get('farGroundProbe');
  if (value === null) return 'off';
  return value === 'solo' ? 'solo' : 'on';
}

export function farGroundProbeEnabled(): boolean {
  return farGroundProbeMode() !== 'off';
}

/**
 * Flatten one mounted surface to its probe primary. No-op unless `?farGroundProbe` is set.
 * Returns the number of distinct materials repainted — the probe's own receipt.
 */
export function paintFarGroundProbe(object: THREE.Object3D | undefined, surface: FarGroundSurface): number {
  if (!object) return 0;
  const hex = FAR_GROUND_PROBE_COLORS[surface];
  const painted = new Set<THREE.Material>();
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (!material || painted.has(material)) continue;
      painted.add(material);
      const paint = material as THREE.Material & {
        color?: THREE.Color;
        map?: THREE.Texture | null;
        emissive?: THREE.Color;
        emissiveIntensity?: number;
        emissiveMap?: THREE.Texture | null;
      };
      // Drop the atlas: a textured primary is a textured primary, and the margin test wants flat.
      paint.map = null;
      paint.emissiveMap = null;
      paint.color?.setHex(hex);
      // Unlit materials (the panorama is KHR_materials_unlit) have no emissive; lit ones need it,
      // or a surface facing away from the low sun reads as near-black and counts as nothing.
      paint.emissive?.setHex(hex);
      if (paint.emissiveIntensity !== undefined) paint.emissiveIntensity = 1;
      material.toneMapped = false;
      material.needsUpdate = true;
    }
  });
  return painted.size;
}

/**
 * Paint a sculpt continuation as a receding horizon. Call BEFORE the material is first
 * compiled; it chains onto whatever `onBeforeCompile` the caller already installed.
 */
export function paintHorizonApron(material: THREE.Material, profile: HorizonApronProfile): void {
  const previous = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader, renderer) => {
    previous(shader, renderer);
    // Color.set already lands in the renderer's working space — converting again here is the
    // double-conversion bug that turned every crate in the town black (beauty-town.md section 2).
    shader.uniforms.apronInner = { value: profile.innerRadius };
    shader.uniforms.apronOuter = { value: profile.outerRadius };
    shader.uniforms.apronHaze = { value: new THREE.Color(profile.haze) };
    shader.uniforms.apronCeiling = { value: new THREE.Color(profile.ceiling) };
    shader.uniforms.apronRidge = { value: new THREE.Vector2(profile.ridgeWavelength, profile.ridgeDepth) };
    shader.uniforms.apronSmoke = { value: new THREE.Vector3(profile.smokeWidth, profile.smokeStrength, 0) };
    // Always exactly three: `uniform float apronSmokeAt[3]` is a fixed-length declaration, and a
    // map with no smoke (Dry Gulch is empty on purpose) still has to fill it.
    const smokeAt = [0, 1, 2].map((index) => profile.smokeAzimuths[index] ?? 0);
    shader.uniforms.apronSmokeAt = { value: smokeAt };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vApronPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vApronPos = position;');

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vApronPos;
uniform float apronInner;
uniform float apronOuter;
uniform vec3 apronHaze;
uniform vec3 apronCeiling;
uniform vec2 apronRidge;
uniform vec3 apronSmoke;
uniform float apronSmokeAt[3];`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
{
  float apronR = length(vApronPos.xz);
  float apronT = clamp((apronR - apronInner) / max(1.0, apronOuter - apronInner), 0.0, 1.0);
  float apronAz = atan(vApronPos.z, vApronPos.x);

  // SMOKY FOOTHILLS. Ridge bands in radius, pushed around by azimuth so the crests never line
  // up into a bullseye, fading out as the ground becomes air.
  float ridgePhase = apronR / max(1.0, apronRidge.x) + sin(apronAz * 3.0 + 0.7) * 0.55 + sin(apronAz * 7.0 - 1.3) * 0.22;
  float ridge = sin(ridgePhase * 6.2831853);
  float ridgeFade = smoothstep(0.02, 0.28, apronT) * (1.0 - smoothstep(0.55, 1.0, apronT));
  diffuseColor.rgb *= 1.0 + ridge * apronRidge.y * ridgeFade;

  // THE COMPANY'S SMOKE. Three soft columns, no geometry: broad darkenings in azimuth that
  // only exist far out, so they read as standing smoke rather than as marks on the ground.
  float smoke = 0.0;
  for (int i = 0; i < 3; i += 1) {
    float d = abs(atan(sin(apronAz - apronSmokeAt[i]), cos(apronAz - apronSmokeAt[i])));
    smoke += exp(-(d * d) / (2.0 * apronSmoke.x * apronSmoke.x));
  }
  diffuseColor.rgb = mix(diffuseColor.rgb, apronCeiling, clamp(smoke, 0.0, 1.0) * apronSmoke.y * smoothstep(0.18, 0.62, apronT));

  // AERIAL RECESSION. Warm at the rim, bruised iron at the far edge. The continuation opts out
  // of scene fog by design (it is pinned to the far plane), so distance has to be painted.
  diffuseColor.rgb = mix(diffuseColor.rgb, apronHaze, smoothstep(0.0, 0.52, apronT) * 0.72);
  diffuseColor.rgb = mix(diffuseColor.rgb, apronCeiling, smoothstep(0.58, 1.0, apronT) * 0.78);
}`,
      );
  };
  material.needsUpdate = true;
}
