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
]);

export function horizonApronProfile(contractId: string): HorizonApronProfile | undefined {
  if (new URLSearchParams(window.location.search).get('baronHorizon') === 'off') return undefined;
  return PROFILES.get(contractId);
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
    shader.uniforms.apronSmokeAt = { value: profile.smokeAzimuths.slice(0, 3) };

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
