import * as THREE from 'three';
import baronContractText from '../../assets/pilots/map-rebuild-spike/baron-terrain-contract.json?raw';
import baronPanoramaContractText from '../../assets/pilots/map-rebuild-spike/baron-panorama-contract.json?raw';
import dryGulchContractText from '../../assets/pilots/map-rebuild-spike/dry-gulch-terrain-contract.json?raw';
import dryGulchPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dry-gulch-panorama-contract.json?raw';
import hillMineContractText from '../../assets/pilots/map-rebuild-spike/hill-mine-terrain-contract.json?raw';
import hillMinePanoramaContractText from '../../assets/pilots/map-rebuild-spike/hill-mine-panorama-contract.json?raw';
import nightShiftContractText from '../../assets/pilots/map-rebuild-spike/night-shift-terrain-contract.json?raw';
import nightShiftPanoramaContractText from '../../assets/pilots/map-rebuild-spike/night-shift-panorama-contract.json?raw';
import claimContractText from '../../assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json?raw';
import claimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/the-claim-panorama-contract.json?raw';
import twinBanksContractText from '../../assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json?raw';
import twinBanksPanoramaContractText from '../../assets/pilots/map-rebuild-spike/twin-banks-panorama-contract.json?raw';
import trestleContractText from '../../assets/pilots/map-rebuild-spike/trestle-terrain-contract.json?raw';
import trestlePanoramaContractText from '../../assets/pilots/map-rebuild-spike/trestle-panorama-contract.json?raw';
import blackoutRidgeContractText from '../../assets/pilots/map-rebuild-spike/blackout-ridge-terrain-contract.json?raw';
import blackoutRidgePanoramaContractText from '../../assets/pilots/map-rebuild-spike/blackout-ridge-panorama-contract.json?raw';
import fairgroundContractText from '../../assets/pilots/map-rebuild-spike/fairground-terrain-contract.json?raw';
import fairgroundPanoramaContractText from '../../assets/pilots/map-rebuild-spike/fairground-panorama-contract.json?raw';
import dustFlatsContractText from '../../assets/pilots/map-rebuild-spike/dust-flats-terrain-contract.json?raw';
import dustFlatsPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dust-flats-panorama-contract.json?raw';
import deepwaterClaimContractText from '../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json?raw';
import deepwaterClaimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama-contract.json?raw';
import glowMesaContractText from '../../assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json?raw';
import glowMesaPanoramaContractText from '../../assets/pilots/map-rebuild-spike/glow-mesa-panorama-contract.json?raw';
import relayValleyContractText from '../../assets/pilots/map-rebuild-spike/relay-valley-terrain-contract.json?raw';
import relayValleyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/relay-valley-panorama-contract.json?raw';
import mareClaimContractText from '../../assets/pilots/map-rebuild-spike/mare-claim-terrain-contract.json?raw';
import mareClaimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/mare-claim-panorama-contract.json?raw';
import domeBasinContractText from '../../assets/pilots/map-rebuild-spike/dome-basin-terrain-contract.json?raw';
import domeBasinPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dome-basin-panorama-contract.json?raw';
import emberShoreContractText from '../../assets/pilots/map-rebuild-spike/ember-shore-terrain-contract.json?raw';
import emberShorePanoramaContractText from '../../assets/pilots/map-rebuild-spike/ember-shore-panorama-contract.json?raw';
import archiveWorldContractText from '../../assets/pilots/map-rebuild-spike/archive-world-terrain-contract.json?raw';
import archiveWorldPanoramaContractText from '../../assets/pilots/map-rebuild-spike/archive-world-panorama-contract.json?raw';
import boneyardContractText from '../../assets/pilots/map-rebuild-spike/boneyard-terrain-contract.json?raw';
import boneyardPanoramaContractText from '../../assets/pilots/map-rebuild-spike/boneyard-panorama-contract.json?raw';
import canyonWorksContractText from '../../assets/pilots/map-rebuild-spike/canyon-works-terrain-contract.json?raw';
import canyonWorksPanoramaContractText from '../../assets/pilots/map-rebuild-spike/canyon-works-panorama-contract.json?raw';
import devilsAlleyContractText from '../../assets/pilots/map-rebuild-spike/devils-alley-terrain-contract.json?raw';
import devilsAlleyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/devils-alley-panorama-contract.json?raw';
import echoCanyonContractText from '../../assets/pilots/map-rebuild-spike/echo-canyon-terrain-contract.json?raw';
import echoCanyonPanoramaContractText from '../../assets/pilots/map-rebuild-spike/echo-canyon-panorama-contract.json?raw';
import gusherCountyContractText from '../../assets/pilots/map-rebuild-spike/gusher-county-terrain-contract.json?raw';
import gusherCountyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/gusher-county-panorama-contract.json?raw';
import halfLifeHollowContractText from '../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json?raw';
import halfLifeHollowPanoramaContractText from '../../assets/pilots/map-rebuild-spike/half-life-hollow-panorama-contract.json?raw';
import inclineContractText from '../../assets/pilots/map-rebuild-spike/incline-terrain-contract.json?raw';
import inclinePanoramaContractText from '../../assets/pilots/map-rebuild-spike/incline-panorama-contract.json?raw';
import longRoadContractText from '../../assets/pilots/map-rebuild-spike/long-road-terrain-contract.json?raw';
import longRoadPanoramaContractText from '../../assets/pilots/map-rebuild-spike/long-road-panorama-contract.json?raw';
import lowOrbitContractText from '../../assets/pilots/map-rebuild-spike/low-orbit-terrain-contract.json?raw';
import lowOrbitPanoramaContractText from '../../assets/pilots/map-rebuild-spike/low-orbit-panorama-contract.json?raw';
import mothSeasonContractText from '../../assets/pilots/map-rebuild-spike/moth-season-terrain-contract.json?raw';
import mothSeasonPanoramaContractText from '../../assets/pilots/map-rebuild-spike/moth-season-panorama-contract.json?raw';
import oldCanalContractText from '../../assets/pilots/map-rebuild-spike/old-canal-terrain-contract.json?raw';
import oldCanalPanoramaContractText from '../../assets/pilots/map-rebuild-spike/old-canal-panorama-contract.json?raw';
import pressureGardenContractText from '../../assets/pilots/map-rebuild-spike/pressure-garden-terrain-contract.json?raw';
import pressureGardenPanoramaContractText from '../../assets/pilots/map-rebuild-spike/pressure-garden-panorama-contract.json?raw';
import regattaContractText from '../../assets/pilots/map-rebuild-spike/regatta-terrain-contract.json?raw';
import regattaPanoramaContractText from '../../assets/pilots/map-rebuild-spike/regatta-panorama-contract.json?raw';
import seedRunContractText from '../../assets/pilots/map-rebuild-spike/seed-run-terrain-contract.json?raw';
import seedRunPanoramaContractText from '../../assets/pilots/map-rebuild-spike/seed-run-panorama-contract.json?raw';
import showroomContractText from '../../assets/pilots/map-rebuild-spike/showroom-terrain-contract.json?raw';
import showroomPanoramaContractText from '../../assets/pilots/map-rebuild-spike/showroom-panorama-contract.json?raw';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { reportRenderDemotion } from '../telemetry/runBeacon';
import { isMapBeautyDisabled, isPoolGradeDisabled } from '../core/DebugParams';
import { RenderLayers } from '../core/RenderLayers';
import { farGroundProbeMode, horizonApronProfile, paintFarGroundProbe, paintHorizonApron } from './HorizonApron';
import { ledgerSunShadowDirection } from './LightRig';
import { Balance } from '../game/Balance';
import type { LightFieldSnapshot, LightSource } from '../systems/LightField';
import { disposeObject3D } from '../utils/dispose';
import { trackedGltfLoader } from '../assets/AssetLoading';
import * as Terrain from './Terrain';
import { createSculptWater, type SculptWater } from './Water';
import { createSunMotes, type SunMotes } from './SunMotes';
import { createSteamPlume, type SteamPlume } from './SteamPlume';
import { createHaulSteam, type HaulSteam, type HaulVent } from './HaulSteam';
import { installVisualHeightSource, waterSources } from './Terrain';
import { createSpringPondSurface, type SpringPondSurface } from './Water';
import { createFordSheet, createWaterConfluence, createWaterRibbon, updateWaterMaterial } from './Water';

type Contract = {
  tileId: string;
  vertices: number;
  triangles: number;
  meshCount: number;
  materialCount: number;
  boundsMeters: { min: [number, number, number]; max: [number, number, number] };
  panoramaMount: Mount;
  landmarkMounts?: LandmarkMount[];
  maskTruth?: { waterMask?: { id: string; regions: MaskRegion[] } };
  maskAgreement?: { waterPlaneY?: number };
};
type MaskRegion = {
  id: string;
  kind: string;
  zone: string;
  halfWidth?: number;
  points?: Array<{ x: number; z: number }>;
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
};
type PanoramaContract = Pick<Contract, 'vertices' | 'triangles' | 'meshCount' | 'materialCount'> & { renderOnly: boolean };
type Mount = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  renderOnly: boolean;
};
type LandmarkMount = Omit<Mount, 'renderOnly'> & { asset?: string };
type Entry = { terrainUrl: string; panoramaUrl: string; contract: Contract; panoramaContract: PanoramaContract };
type Host = {
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  contractId: string;
  tileId: string;
  paintedGround?: THREE.Object3D;
  nightMode?: boolean;
  nightLighting?: () => LightFieldSnapshot;
  /** True while a post-secure "Stay for the Rush" run is live (RunManager owns it). */
  rushActive?: () => boolean;
  /** Published pressure diagnostic; render-only consumers never write it. */
  hotBoilers?: () => number;
  /**
   * The live MQ-4 runtime verdict (0 = healthy, rising as the p95 watchdog degrades). Read-only,
   * polled — the pilot's decorations register themselves in the shed order through this and drop
   * out first, before anything the player is aiming at.
   */
  detailBudget?: () => number;
  /** Read-only escorted-cart view for render-side haul steam. */
  haulCart?: () => { x: number; z: number; moving: boolean } | undefined;
  onVisualHeightSourceInstalled?: () => void;
};
type Metrics = { meshes: number; triangles: number; materials: number; vertices: number; bounds: THREE.Box3 };
type HiddenRelief = { object: THREE.Object3D; visible: boolean };

const entry = (terrainUrl: string, panoramaUrl: string, contractText: string, panoramaContractText: string): Entry => ({
  terrainUrl,
  panoramaUrl,
  contract: JSON.parse(contractText) as Contract,
  panoramaContract: JSON.parse(panoramaContractText) as PanoramaContract,
});
const REGISTRY: Record<string, Entry> = {
  'the-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/the-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/the-claim-panorama.glb', import.meta.url).href, claimContractText, claimPanoramaContractText),
  'e1-dry-gulch': entry(new URL('../../assets/pilots/map-rebuild-spike/dry-gulch-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dry-gulch-panorama.glb', import.meta.url).href, dryGulchContractText, dryGulchPanoramaContractText),
  'e1-twin-banks': entry(new URL('../../assets/pilots/map-rebuild-spike/twin-banks-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/twin-banks-panorama.glb', import.meta.url).href, twinBanksContractText, twinBanksPanoramaContractText),
  'e1-night-shift': entry(new URL('../../assets/pilots/map-rebuild-spike/night-shift-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/night-shift-panorama.glb', import.meta.url).href, nightShiftContractText, nightShiftPanoramaContractText),
  'e1-baron': entry(new URL('../../assets/pilots/map-rebuild-spike/baron-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/baron-panorama.glb', import.meta.url).href, baronContractText, baronPanoramaContractText),
  ...(__GR_RELEASE_E1__ ? {} : {
  'e2-hill-mine': entry(new URL('../../assets/pilots/map-rebuild-spike/hill-mine-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/hill-mine-panorama.glb', import.meta.url).href, hillMineContractText, hillMinePanoramaContractText),
  'e2-trestle': entry(new URL('../../assets/pilots/map-rebuild-spike/trestle-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/trestle-panorama.glb', import.meta.url).href, trestleContractText, trestlePanoramaContractText),
  'e3-blackout-ridge': entry(new URL('../../assets/pilots/map-rebuild-spike/blackout-ridge-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/blackout-ridge-panorama.glb', import.meta.url).href, blackoutRidgeContractText, blackoutRidgePanoramaContractText),
  'e3-fairground': entry(new URL('../../assets/pilots/map-rebuild-spike/fairground-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/fairground-panorama.glb', import.meta.url).href, fairgroundContractText, fairgroundPanoramaContractText),
  'e4-dust-flats': entry(new URL('../../assets/pilots/map-rebuild-spike/dust-flats-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dust-flats-panorama.glb', import.meta.url).href, dustFlatsContractText, dustFlatsPanoramaContractText),
  'e5-deepwater-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e6-glow-mesa': entry(new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb', import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
  'e7-relay-valley': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  'e8-mare-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e9-dome-basin': entry(new URL('../../assets/pilots/map-rebuild-spike/dome-basin-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dome-basin-panorama.glb', import.meta.url).href, domeBasinContractText, domeBasinPanoramaContractText),
  'e10-ember-shore': entry(new URL('../../assets/pilots/map-rebuild-spike/ember-shore-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/ember-shore-panorama.glb', import.meta.url).href, emberShoreContractText, emberShorePanoramaContractText),
  'e2-pressure-garden': entry(new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-panorama.glb', import.meta.url).href, pressureGardenContractText, pressureGardenPanoramaContractText),
  'e2-incline': entry(new URL('../../assets/pilots/map-rebuild-spike/incline-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/incline-panorama.glb', import.meta.url).href, inclineContractText, inclinePanoramaContractText),
  'e3-canyon-works': entry(new URL('../../assets/pilots/map-rebuild-spike/canyon-works-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/canyon-works-panorama.glb', import.meta.url).href, canyonWorksContractText, canyonWorksPanoramaContractText),
  'e3-moth-season': entry(new URL('../../assets/pilots/map-rebuild-spike/moth-season-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/moth-season-panorama.glb', import.meta.url).href, mothSeasonContractText, mothSeasonPanoramaContractText),
  'e4-long-road': entry(new URL('../../assets/pilots/map-rebuild-spike/long-road-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/long-road-panorama.glb', import.meta.url).href, longRoadContractText, longRoadPanoramaContractText),
  'e4-gusher-county': entry(new URL('../../assets/pilots/map-rebuild-spike/gusher-county-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/gusher-county-panorama.glb', import.meta.url).href, gusherCountyContractText, gusherCountyPanoramaContractText),
  'e4-boneyard': entry(new URL('../../assets/pilots/map-rebuild-spike/boneyard-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/boneyard-panorama.glb', import.meta.url).href, boneyardContractText, boneyardPanoramaContractText),
  'e5-regatta': entry(new URL('../../assets/pilots/map-rebuild-spike/regatta-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/regatta-panorama.glb', import.meta.url).href, regattaContractText, regattaPanoramaContractText),
  // Deepwater Claim aliases: these campaign variants intentionally reuse its terrain and panorama.
  'e5-stillwater': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e5-flotilla': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e6-showroom': entry(new URL('../../assets/pilots/map-rebuild-spike/showroom-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/showroom-panorama.glb', import.meta.url).href, showroomContractText, showroomPanoramaContractText),
  'e6-half-life-hollow': entry(new URL('../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/half-life-hollow-panorama.glb', import.meta.url).href, halfLifeHollowContractText, halfLifeHollowPanoramaContractText),
  // Glow Mesa alias: The Picnic keeps the caprock sculpt and changes campaign rules only.
  'e6-picnic': entry(new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb', import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
  'e7-echo-canyon': entry(new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-panorama.glb', import.meta.url).href, echoCanyonContractText, echoCanyonPanoramaContractText),
  // Relay Valley aliases: both signal variants reuse its terrain and panorama.
  'e7-dead-band': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  'e7-relay-rush': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  // Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt.
  'e8-far-side': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e8-low-orbit': entry(new URL('../../assets/pilots/map-rebuild-spike/low-orbit-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/low-orbit-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(lowOrbitContractText), boundsMeters: { min: [-64, -64, -5.869689], max: [64, 64, 1.08] } }), lowOrbitPanoramaContractText),
  'e8-eclipse': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e9-seed-run': entry(new URL('../../assets/pilots/map-rebuild-spike/seed-run-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/seed-run-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(seedRunContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 3.715142] } }), seedRunPanoramaContractText),
  'e9-devils-alley': entry(new URL('../../assets/pilots/map-rebuild-spike/devils-alley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/devils-alley-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(devilsAlleyContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 4.567115] } }), devilsAlleyPanoramaContractText),
  'e9-old-canal': entry(new URL('../../assets/pilots/map-rebuild-spike/old-canal-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/old-canal-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(oldCanalContractText), boundsMeters: { min: [-64, -64, -1.42], max: [64, 64, 2.906317] } }), oldCanalPanoramaContractText),
  'e10-archive-world': entry(new URL('../../assets/pilots/map-rebuild-spike/archive-world-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/archive-world-panorama.glb', import.meta.url).href, archiveWorldContractText, archiveWorldPanoramaContractText),
  }),
};
const LANDMARK_ASSETS = import.meta.glob('../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb', { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;

export async function contractPrefetchUrls(contractId: string): Promise<string[]> {
  const selected = REGISTRY[contractId];
  if (!selected) return [];
  const landmarks = await Promise.all(
    (selected.contract.landmarkMounts ?? [])
      .flatMap(({ asset }) => asset ? [LANDMARK_ASSETS[`../../assets/pilots/map-rebuild-spike/${asset}`]] : [])
      .filter((resolveUrl): resolveUrl is () => Promise<string> => !!resolveUrl)
      .map((resolveUrl) => resolveUrl().catch(() => '')),
  );
  return [...new Set([selected.terrainUrl, selected.panoramaUrl, ...landmarks.filter(Boolean)])];
}

// RENDER-ONLY LIVING WATER OVER A SCULPTED CHANNEL (docs/beauty/e1-twin-banks-brief.md U1).
//
// The braid's two channels are cut into the mounted sculpt but painted near-black, because the
// pilot hides every legacy living-water surface (LEGACY_GROUND_SLOTS below). This table names the
// contracts whose sculpt carries polyline channels worth dressing, and how each channel reads.
// The GEOMETRY is never authored here — it is read from the contract's own mask polylines, the
// same table `build_twin_banks_braid.py` cut the relief from, so the water can only ever sit where
// the sculpt is already below the water plane. Adopting that mask as SIM truth is a separate,
// owner-gated decision (F-OP5-1): nothing here touches band classification, fords or crossings.
type ChannelDressing = {
  depth: 'deep' | 'shallow';
  glints?: Array<{ x: number; z: number }>;
  headInset: number;
  tailInset: number;
  headFade: number;
  tailFade: number;
};
const CONTRACT_CHANNEL_WATER: Record<string, {
  surfaceLift: number;
  edgeBleed: number;
  bed: { deepMeters: number; shoreMeters: number };
  confluences: Array<{ points: Array<{ x: number; z: number; halfWidth: number; alpha: number }> }>;
  fordDepth?: number;
  channels: Record<string, ChannelDressing>;
}> = {
  'e1-twin-banks': {
    surfaceLift: 0.012,
    // Geometry-only overdraw: the spline can sit 0.21 m inside the piecewise-linear cut at a
    // corner. The sculpt's depth buffer still clips the visible shoreline to the 1.5 m mask.
    edgeBleed: 0.45,
    bed: { deepMeters: 0.52, shoreMeters: 0.035 },
    confluences: [
      { points: [
        { x: -34, z: 0, halfWidth: 1.9, alpha: 0 },
        { x: -32, z: 0, halfWidth: 1.75, alpha: 0.58 },
        { x: -30.5, z: 0, halfWidth: 1.6, alpha: 1 },
        { x: -28, z: 0, halfWidth: 1.5, alpha: 1 },
        { x: -26.5, z: 0, halfWidth: 1.85, alpha: 1 },
        { x: -25.2, z: 0, halfWidth: 2.25, alpha: 0.62 },
        { x: -23.8, z: 0, halfWidth: 2.5, alpha: 0 },
      ] },
      { points: [
        { x: 23.8, z: 0, halfWidth: 2.5, alpha: 0 },
        { x: 25.2, z: 0, halfWidth: 2.25, alpha: 0.62 },
        { x: 26.5, z: 0, halfWidth: 1.85, alpha: 1 },
        { x: 28, z: 0, halfWidth: 1.5, alpha: 1 },
        { x: 30.5, z: 0, halfWidth: 1.6, alpha: 1 },
        { x: 32, z: 0, halfWidth: 1.75, alpha: 0.58 },
        { x: 34, z: 0, halfWidth: 1.9, alpha: 0 },
      ] },
    ],
    // Ford depth as a fraction of the wade..deep ramp: a pan a hero walks through, not a channel.
    fordDepth: 0.06,
    channels: {
      // North runs deep and fast — the gold rides it, and only it: an asymmetric sparkle is how
      // a player learns which channel is the dangerous one without a line of UI. Anchors sit ON
      // the mask centreline (the shader draws each glint as a thin line at the anchor's z, so an
      // anchor off the centreline lights the bank instead of the current).
      'north-channel': {
        depth: 'deep',
        glints: [{ x: -19.5, z: 2.43 }, { x: -6.2, z: 2.89 }, { x: 8.1, z: 3.16 }, { x: 19.8, z: 2.34 }],
        headInset: 2.4,
        tailInset: 2.4,
        headFade: 2,
        tailFade: 2,
      },
      'south-channel': { depth: 'shallow', headInset: 2.4, tailInset: 2.4, headFade: 2, tailFade: 2 },
    },
  },
};

// TWO HOMESTEADS, TWO LIVES — RENDER SIDE (docs/beauty/e1-twin-banks-brief.md U4).
// The map's story is one family holding both banks, and the pair ships as the same body under a
// 0.09 rad rotation difference: at the run camera, and worse at 390px, nothing tells a player
// which bank they are standing on. The bodies themselves could not be re-authored tonight — the
// landmark pack no longer regenerates faithfully (see the review's U4 entry) — so the difference
// is hung on the MOUNT instead: the south roof (the stake side, the loss condition) is graded
// warm and carries a lamplit pane; the north outpost across the braid is graded cool and stays
// dark. Same ids, same bodies, same footprints — the sim never sees this.
type LandmarkDressing = { emissive: [number, number, number]; lamp?: { acrossX: number; upY: number; width: number; height: number } };
const CONTRACT_LANDMARK_DRESSING: Record<string, Record<string, LandmarkDressing>> = {
  'e1-twin-banks': {
    south_bank_homestead: { emissive: [1.14, 0.99, 0.74], lamp: { acrossX: 0.68, upY: 0.56, width: 0.82, height: 0.62 } },
    south_bank_winch: { emissive: [1.10, 0.97, 0.80] },
    north_bank_homestead: { emissive: [0.78, 0.88, 1.02] },
    north_bank_winch: { emissive: [0.80, 0.89, 1.02] },
  },
};
// Saturated on purpose: ACES tone mapping walks a bright unlit pane toward white, and a lamp
// that reads white reads as a hole in the wall.
const LAMP_COLOUR = '#ff9c38';

const BOUNDS_EPSILON = 0.03;
const CONTINUATION_SAMPLE_DEPTH = 8;
const LEGACY_GROUND_SLOTS = new Set(['terrain.bank', 'terrain.river', 'terrain.ford']);
const SKIRT_INSET = 2.5;
const NIGHT_POOL_SHADER_CAP = 32;

// U1, the-claim beauty shift (docs/beauty/the-claim-brief.md): the sculpt carves a
// channel and then hides every painted water surface, so the map's one event has
// been a static black slot. These contracts get a render-only living-water quad laid
// into that channel. Per contract because each sculpt's bed sits at its own depth.
//
// e2-hill-mine joins at the E2 beauty shift (docs/beauty/e2-hill-mine-brief.md U1): its flooded
// gallery is the same disease with a different bed. Everything below is DRESSING — the surface's
// height is still measured off the baked sculpt and the ford/river widths still come from the
// sim's own declarations, so a re-sculpt or a rules change moves the water and nothing here
// argues with it.
type SculptWaterDressing = {
  surface:
    | { kind: 'channel-fill'; fill: number }
    | { kind: 'below-gorge-floor'; quantile: number; drop: number };
  /**
   * Multiplies the shader's water palette (shallow/mid/deep/ford, foam and glints alike). White
   * keeps the shipped mint. The claim pulls it warm sepia; the hill mine pulls it toward wet slate
   * so the E2 family's "murky working water" reads as worked, not as a mountain stream.
   */
  color: string;
  opacity: number;
  /** How much water stands over the ford shelf: ankle deep, still obviously a crossing. */
  fordSkim: number;
  /** Metres of standing water that read as fully deep in the bed-depth bake. */
  deepMeters: number;
  /** Metres of the last, shallowest water — the damp margin the surface fades out across. */
  shoreMeters: number;
  /**
   * Half width of the water quad in Z. Defaults to the tile's declared visual water half width;
   * a map whose painted bed is narrower than that declaration overrides it, or the surface floods
   * ground the atlas paints dry.
   */
  visualHalfWidth?: number;
  /**
   * Where the sun catches the surface. `harvest` puts one on each harvest anchor's near bank (the
   * claim's sluice line); an explicit list is for maps whose anchors are nowhere near the water.
   */
  glints: 'harvest' | Array<{ x: number; z: number }>;
  rippleStrength?: number;
  /** Blend weight for the procedural canvas map. See the note on the hill mine's entry. */
  textureBlend?: number;
  /** Skip the baked bed map when the authored bed is a flat pan. */
  bed?: boolean;
  fordTint?: number;
  shoreFadeMeters?: number;
  surfaceLift?: boolean;
  overhangMeters?: number;
  emissive?: string;
  /** Foam collars where landmark piers meet the surface. */
  collars?: ReadonlyArray<{ mount: string; radius: number }>;
};
const SCULPT_WATER_DRESSING: Record<string, SculptWaterDressing> = {
  // Shipped values, unchanged: this map's water is signed off and must render byte for byte.
  // Style anchor: "the river writes the only dark line". The shipped shader is tuned over pale
  // painted sand and reads as mint over this sculpt's umber bed, so the palette is multiplied warm
  // and the surface let through enough for the bed's own darkness to carry the channel.
  'the-claim': {
    surface: { kind: 'channel-fill', fill: 0.42 },
    color: '#c9b892',
    opacity: 0.7,
    // The carved channel runs ~0.45m below the water line at its deepest; the last
    // ~15cm of depth is the damp margin where the surface fades into wet ground.
    fordSkim: 0.11,
    deepMeters: 0.5,
    shoreMeters: 0.15,
    glints: 'harvest',
  },
  // THE FLOODED GALLERY. Measured, not guessed (logs/session-scratch/e2-hill-mine-band-scan.mjs):
  // the atlas paints the bed near-black across EXACTLY the sim's declared river band — luma 16-26
  // for z in [-5.5, 5.5] against 49-77 on the ochre either side — over a floor that is dead flat at
  // y -0.18 with lips at |z| ~ 6 (-0.062 south, +0.057 north). Three consequences:
  //   * the fill/skim pair lands the surface at -0.070, i.e. UNDER both lips, so the water is
  //     contained by the cut instead of spilling onto the lower south bench (which is 0.4 m BELOW
  //     the gallery floor and painted dry — a flat quad would have flooded it invisibly);
  //   * the quad is narrowed to the painted band. The tile declares a visual half width of 10, and
  //     water out to |z| = 10 would sit on lit ochre ground;
  //   * the bed is flat, so DEPTH cannot come from the bake the way it does on the claim. It comes
  //     from the near-black paint reading through a surface that is deliberately not very opaque —
  //     which is what "murky working water" is, and why deepMeters is 0.12 (the real standing
  //     depth) rather than the claim's 0.5.
  'e2-hill-mine': { surface: { kind: 'channel-fill', fill: 0.42 }, color: '#8a8177', opacity: 0.72, fordSkim: 0.11, deepMeters: 0.12, shoreMeters: 0.05, visualHalfWidth: 5.9, glints: [{ x: -27, z: -5.1 }, { x: 13, z: 5.1 }, { x: 33, z: -5.1 }], rippleStrength: 1.15, textureBlend: 0, },
  'e2-trestle': { surface: { kind: 'below-gorge-floor', quantile: 0.8, drop: 0.006 }, color: '#7e8480', opacity: 0.86, fordSkim: 0.11, deepMeters: 0.42, shoreMeters: 0.16, glints: [{ x: -15.5, z: -4.3 }, { x: -4.5, z: -4.5 }], rippleStrength: 0.4, textureBlend: 0.05, },
  'e2-pressure-garden': { surface: { kind: 'channel-fill', fill: 0.11 }, color: '#d6f0ee', opacity: 0.8, fordSkim: 0.11, deepMeters: 0.5, shoreMeters: 0.15, bed: false, visualHalfWidth: 6.25, glints: [{ x: -30, z: 4.45 }, { x: -12, z: 4.45 }, { x: 12, z: 4.45 }, { x: 30, z: 4.45 }], rippleStrength: 0.75, textureBlend: 0.04, fordTint: 0.44, shoreFadeMeters: 2.2, surfaceLift: true, overhangMeters: 10, emissive: '#0d2a33', collars: [{ mount: 'garden-pressure-manifold', radius: 2.9 }, { mount: 'water-band-pump-station', radius: 2.6 }], },
  'e2-incline': { surface: { kind: 'channel-fill', fill: 0.42 }, color: '#bb9366', opacity: 0.62, fordSkim: 0.125, deepMeters: 0.145, shoreMeters: 0.07, visualHalfWidth: 6.25, glints: [{ x: -30, z: 4.45 }, { x: 30, z: -4.45 }], rippleStrength: 0.6, textureBlend: 0.2, },
};
/** Water fades out over the last stretch before the tile edge instead of cutting. */
const SCULPT_WATER_EDGE_FADE = 7;
/** U3: contracts whose mounted landmarks get soft contact ellipses. */
const LANDMARK_CONTACT_CONTRACTS = new Set(['the-claim', 'e2-hill-mine', 'e2-trestle', 'e2-pressure-garden', 'e2-incline']);
type SpanShadowDressing = { mountId: string; widthScale: number; lengthScale: number; throw: number; opacity: number; color: string };
const SPAN_SHADOW_CONTRACTS: Record<string, SpanShadowDressing> = {
  'e2-trestle': { mountId: 'trestle-crossing', widthScale: 0.38, lengthScale: 0.48, throw: 0.62, opacity: 0.42, color: '#1d1206' },
};
const SPAN_SHADOW_ROWS = 28;
const SPAN_SHADOW_END_TAPER = 0.16;
const SPAN_SHADOW_LIFT = 0.012;
/**
 * U5: contracts that get the drifting mote field, and its hard cap.
 *
 * TINT, DON'T COUNT-CUT. The claim's shift recorded that its own motes first read as snow over the
 * dark water, and that the fix was the colour rather than the number — a thinner field of the wrong
 * colour still reads as the wrong weather. So the hill mine keeps the claim's cap and takes its
 * air from the era instead: this is coal country, and what hangs in its low sun is umber soot, not
 * gold dust. The box is the map's own working ground (the gallery and the base bench), not a copy
 * of the claim's river box.
 */
type SunMoteDressing = { color: string; halfZ: number; centerZ: number; minY: number; maxY: number; size: number; seed: number; halfXScale?: number };
const SUN_MOTES: Record<string, SunMoteDressing> = {
  'the-claim': { color: '#ffd9a2', halfZ: 13, centerZ: 4, minY: 0.4, maxY: 5.0, size: 2.1, seed: 0x1c1a },
  'e2-hill-mine': { color: '#a8794a', halfZ: 17, centerZ: 7, minY: 0.3, maxY: 5.6, size: 2.3, seed: 0x2e57 },
  'e2-trestle': { color: '#c39a68', halfZ: 14, centerZ: 0, minY: 0.2, maxY: 5.6, size: 2.3, seed: 0x3b12 },
  'e2-pressure-garden': { color: '#c9a279', halfZ: 15, centerZ: 31, minY: 0.9, maxY: 6.4, size: 2.3, seed: 0x2e07 },
  'e2-incline': { color: '#e0a878', halfZ: 30, centerZ: 12, minY: 0.5, maxY: 6.4, size: 2.2, seed: 0x2e15, halfXScale: 0.72 },
};
/** U5b is the CLAIM's reward note, not every mote map's: the embers need a claim stake to sit on. */
const RUSH_EMBER_CONTRACTS = new Set(['the-claim']);
const SUN_MOTE_CAP = 200;

/**
 * U4 — THE ERA BREATHES. Steam anchored to the map's own named steam bodies.
 *
 * Placement is expressed as FRACTIONS of the mounted body's world bounding box, never as world
 * coordinates, so the emitter follows the body if a mount ever moves or a pack is re-scaled — the
 * `dressLandmark` lamp precedent, and the reason the dry-gulch spring's hard-coded pool numbers
 * needed a re-measure note. The fractions themselves are measured off the shipped GLBs
 * (`logs/session-scratch/hill-mine-landmark-boxes.mjs`): the boiler house's tallest column is its
 * stack, at local x -2.0 / z -1.25 of a body spanning ±4.09 x ±3.73, i.e. 0.255 / 0.332 across its
 * own box; the mine mouth vents at its foot, not its headframe top.
 */
type SteamAnchor = {
  mount: string;
  /** 0..1 across the body's own bounding box. */
  acrossX: number;
  acrossZ: number;
  upY: number;
  rise: number;
  spread: number;
  size: number;
  life: number;
  puffs: number;
  opacity: number;
};
const STEAM_ANCHORS: Record<string, readonly SteamAnchor[]> = {
  'e2-hill-mine': [ { mount: 'boiler-house-site', acrossX: 0.255, acrossZ: 0.332, upY: 1.0, rise: 8.0, spread: 3.0, size: 46, life: 5.4, puffs: 34, opacity: 0.5 }, { mount: 'mine-mouth-and-ruined-headframe', acrossX: 0.5, acrossZ: 0.62, upY: 0.1, rise: 3.2, spread: 1.7, size: 30, life: 8.2, puffs: 14, opacity: 0.3 }, ],
};
type CrossingBreathDressing = {
  wisps: { count: number; halfX: number; halfZ: number; lift: number; size: number; rise: number; color: string };
  plume: { count: number; radius: number; height: number; size: number; rise: number; color: string };
};
const CROSSING_BREATH_CONTRACTS: Record<string, CrossingBreathDressing> = {
  'e2-trestle': { wisps: { count: 7, halfX: 17, halfZ: 4, lift: 3.1, size: 46, rise: 0.34, color: '#575049' }, plume: { count: 12, radius: 0.7, height: 3.4, size: 26, rise: 1.15, color: '#efe9de' } },
};
const CROSSING_BREATH_POLL_FRAMES = 30;
type CrossingBreath = { dispose: () => void };
/** Warm white, the shipped `BoilerHouse.ts` plume colour. Steam is WHITE (bundle §A1). */
const STEAM_COLOUR = '#fff8e8';
/** Embers on the claim stake while the Rush is live. */
const RUSH_EMBER_COUNT = 26;
/** Ellipse radius as a fraction of the model's footprint — a pool, not a slab. */
const LANDMARK_CONTACT_SPREAD = 0.46;
/** How far the pool leans away from the body, as a fraction of the body's height. */
const LANDMARK_CONTACT_THROW = 0.30;
const SCULPT_WATER_MAX_DELTA = 0.1;

function publish(canvas: HTMLCanvasElement, state: 'loading' | 'ready' | 'lite' | 'failed', source: 'painted' | 'glb', metrics?: Metrics, panorama?: THREE.Object3D, panoramaMetrics?: Metrics, demotionReason?: string): void {
  canvas.dataset.terrain3dPilotState = state;
  canvas.dataset.terrain3dPilotRenderSource = source;
  canvas.dataset.terrain3dPilotHeightSource = source === 'glb' ? 'baked-grid' : 'painted';
  canvas.dataset.terrain3dPilotMeshes = String(metrics?.meshes ?? 0);
  canvas.dataset.terrain3dPilotTriangles = String(metrics?.triangles ?? 0);
  canvas.dataset.terrain3dPilotMaterials = String(metrics?.materials ?? 0);
  canvas.dataset.terrain3dPilotVertices = String(metrics?.vertices ?? 0);
  canvas.dataset.terrain3dPilotPanorama = panorama?.name ?? 'off';
  canvas.dataset.terrain3dPilotPanoramaMeshes = String(panoramaMetrics?.meshes ?? 0);
  canvas.dataset.terrain3dPilotPanoramaTriangles = String(panoramaMetrics?.triangles ?? 0);
  canvas.dataset.terrain3dPilotPanoramaMaterials = String(panoramaMetrics?.materials ?? 0);
  canvas.dataset.terrain3dPilotPanoramaVertices = String(panoramaMetrics?.vertices ?? 0);
  if (demotionReason) reportRenderDemotion(canvas, demotionReason);
}

function inspect(model: THREE.Object3D, receiveShadow: boolean): Metrics {
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    const position = mesh.geometry.getAttribute('position');
    const uniqueVertices = new Set<string>();
    for (let index = 0; index < (position?.count ?? 0); index += 1) {
      uniqueVertices.add(`${position!.getX(index)},${position!.getY(index)},${position!.getZ(index)}`);
    }
    vertices += uniqueVertices.size;
    triangles += Math.floor((mesh.geometry.index?.count ?? position?.count ?? 0) / 3);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    mesh.castShadow = false;
    mesh.receiveShadow = receiveShadow;
  });
  return { meshes, triangles, materials: materials.size, vertices, bounds: new THREE.Box3().setFromObject(model) };
}

function validTerrain(metrics: Metrics, contract: Contract): boolean {
  const { min, max } = metrics.bounds;
  const [minX, minZ, minY] = contract.boundsMeters.min;
  const [maxX, maxZ, maxY] = contract.boundsMeters.max;
  return metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles && metrics.materials === contract.materialCount &&
    metrics.vertices === contract.vertices && Math.abs(min.x - minX) <= BOUNDS_EPSILON && Math.abs(min.y - minY) <= BOUNDS_EPSILON &&
    Math.abs(min.z - minZ) <= BOUNDS_EPSILON && Math.abs(max.x - maxX) <= BOUNDS_EPSILON &&
    Math.abs(max.y - maxY) <= BOUNDS_EPSILON && Math.abs(max.z - maxZ) <= BOUNDS_EPSILON;
}

function validPanorama(metrics: Metrics, contract: PanoramaContract, mount: Mount): boolean {
  return contract.renderOnly && mount.renderOnly && metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles &&
    metrics.materials === contract.materialCount && metrics.vertices === contract.vertices;
}

function bakeHeightGrid(model: THREE.Object3D, metrics: Metrics): (x: number, z: number) => number {
  const mesh = model.getObjectByProperty('isMesh', true) as THREE.Mesh;
  const position = mesh.geometry.getAttribute('position');
  const segments = Math.round(Math.sqrt(position.count)) - 1;
  const width = segments + 1;
  const stepX = (metrics.bounds.max.x - metrics.bounds.min.x) / segments;
  const stepZ = (metrics.bounds.max.z - metrics.bounds.min.z) / segments;
  const heights = new Float32Array(width * width);
  const seen = new Uint8Array(heights.length);
  const point = new THREE.Vector3();
  model.updateMatrixWorld(true);
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position as THREE.BufferAttribute, index);
    mesh.localToWorld(point);
    const column = Math.round((point.x - metrics.bounds.min.x) / stepX);
    const row = Math.round((point.z - metrics.bounds.min.z) / stepZ);
    const cell = row * width + column;
    if (column < 0 || column > segments || row < 0 || row > segments || seen[cell]) throw new Error('invalid terrain grid');
    heights[cell] = point.y;
    seen[cell] = 1;
  }
  if (seen.some((value) => value !== 1)) throw new Error('incomplete terrain grid');
  return (x, z) => {
    const gx = THREE.MathUtils.clamp((x - metrics.bounds.min.x) / stepX, 0, segments);
    const gz = THREE.MathUtils.clamp((z - metrics.bounds.min.z) / stepZ, 0, segments);
    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);
    const x1 = Math.min(x0 + 1, segments);
    const z1 = Math.min(z0 + 1, segments);
    const north = THREE.MathUtils.lerp(heights[z0 * width + x0]!, heights[z0 * width + x1]!, gx - x0);
    const south = THREE.MathUtils.lerp(heights[z1 * width + x0]!, heights[z1 * width + x1]!, gx - x0);
    return THREE.MathUtils.lerp(north, south, gz - z0);
  };
}

function preparePanorama(model: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    mesh.renderOrder = -100;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  for (const material of materials) {
    const fogMaterial = material as THREE.Material & { fog?: boolean };
    const compile = material.onBeforeCompile.bind(material);
    fogMaterial.fog = false;
    material.transparent = false;
    material.depthWrite = false;
    material.depthTest = true;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;',
      );
    };
    material.needsUpdate = true;
  }
}

/**
 * Landmark paint would go dark without this, so it stays — but at intensity 3 the
 * colour map is its own light source and the bodies float in flat white while the
 * low sun models everything around them. U3 of the beauty shift makes the intensity
 * a per-contract tunable and drops the Claim's to where the sun does the modelling
 * and the emissive only keeps the paint off the floor.
 */
const LANDMARK_EMISSIVE_DEFAULT = 3;
const LANDMARK_EMISSIVE: Record<string, number> = { 'the-claim': 1.45, 'e2-hill-mine': 1.45, 'e2-trestle': 1.5, 'e2-pressure-garden': 1.45, 'e2-incline': 1.45 };

function dressLandmark(model: THREE.Object3D, contractId: string, mountId: string): void {
  const dressing = CONTRACT_LANDMARK_DRESSING[contractId]?.[mountId];
  if (!dressing) return;
  model.traverse((node) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    // keepLandmarkPaintReadable drives these bodies almost entirely off emissive (map + intensity
    // 3), so the emissive colour — not the diffuse — is the lever that actually grades them.
    mesh.material.emissive.setRGB(...dressing.emissive, THREE.LinearSRGBColorSpace);
    mesh.material.needsUpdate = true;
  });
  if (!dressing.lamp) return;
  const box = new THREE.Box3().setFromObject(model);
  const lamp = new THREE.Mesh(
    new THREE.PlaneGeometry(dressing.lamp.width, dressing.lamp.height),
    // Opaque and depth-writing on purpose: e2e/landmark-brightness.spec.ts and the census both
    // assert that no landmark material is transparent or skips depth write. A lit window does
    // not need to be either — it is unlit paint that outshines the wall it sits on.
    new THREE.MeshBasicMaterial({ color: LAMP_COLOUR }),
  );
  lamp.name = `${mountId}.Lamp`;
  lamp.position.set(
    THREE.MathUtils.lerp(box.min.x, box.max.x, dressing.lamp.acrossX) - model.position.x,
    THREE.MathUtils.lerp(box.min.y, box.max.y, dressing.lamp.upY) - model.position.y,
    box.max.z - model.position.z + 0.03,
  );
  lamp.userData.renderOnly = true;
  model.add(lamp);
}

/**
 * CALL THIS ONCE PER BODY. F-BHM-1 (found by this shift, 2026-08-04): between `10586b90` — the
 * baron drain, whose merge resolution kept both the new per-contract block and the old single-line
 * call it replaced — and this commit, the pilot called it TWICE, the second time with the default
 * paint. Every per-contract intensity on main was therefore silently reset to 3: the-claim's 1.45
 * (shipped `59655724`), the baron's 1.7/1.9/2.1/3.4 AND its emissive grade, and dry gulch's
 * isolated_spring 2.1. Three signed-off upgrades were defeated and every gate stayed green, because
 * the dataset published the TABLE's number rather than the material's. It now publishes the
 * material's (see terrain3dPilotLandmarkMaterials).
 */
function keepLandmarkPaintReadable(model: THREE.Object3D, paint: LandmarkPaint = DEFAULT_LANDMARK_PAINT): void {
  // An untinted body must not even round-trip its colour through getHex/setHex —
  // that quantises to 8 bits per channel, and every map except e1-baron is
  // supposed to come out of here byte-identical to before this seam existed.
  const tint = paint.tint === DEFAULT_LANDMARK_PAINT.tint ? null : new THREE.Color(paint.tint);
  model.traverse((node) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial || !mesh.material.map) return;
    const material = mesh.material;
    if (tint) {
      // GLB materials are shared instances that survive a re-install, so the
      // base colour is banked once — tinting a tinted material would compound.
      const banked = material.userData.landmarkBaseColor as number | undefined;
      const base = banked ?? material.color.getHex();
      material.userData.landmarkBaseColor = base;
      material.color.setHex(base).multiply(tint);
    }
    material.emissive.set(paint.tint);
    material.emissiveMap = material.map;
    material.emissiveIntensity = paint.intensity;
  });
}

/**
 * U3 — soft contact ellipses under the mounted landmarks.
 *
 * Landmarks are mounted with castShadow off, so a lit body has nothing tying it to
 * the ground. One instanced quad per mount, sized from the model's own footprint,
 * using the shipped blob-shadow recipe (LightRig SpriteBlobShadows: #2e1b0e at 0.17,
 * depthWrite off, polygon-offset, laid flat just above the terrain).
 *
 * Deliberately NOT a child of Terrain3dLandmarks: that group's children are counted
 * as landmarks and their materials are audited for transparency by the map census,
 * so a shadow parented there would read as a sixth landmark with an unlit material.
 */
function mountLandmarkContacts(
  host: Host,
  mounts: Array<{ id: string; model: THREE.Object3D }>,
  heightAt: (x: number, z: number) => number,
  waterY: number | undefined,
  bounds: THREE.Box3,
): THREE.InstancedMesh | undefined {
  if (isMapBeautyDisabled() || !LANDMARK_CONTACT_CONTRACTS.has(host.contractId) || !mounts.length) return undefined;
  const geometry = new THREE.CircleGeometry(1, 24);
  const material = new THREE.MeshBasicMaterial({
    color: '#2e1b0e',
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const contacts = new THREE.InstancedMesh(geometry, material, mounts.length);
  contacts.name = 'Terrain3dLandmarkContacts';
  contacts.userData.renderOnly = true;
  contacts.frustumCulled = false;
  contacts.renderOrder = RenderLayers.groundShadows;
  const box = new THREE.Box3();
  const size = new THREE.Vector3();
  const placer = new THREE.Object3D();
  // Lean the pool the way the key light throws it, or a shadow centred under a solid
  // building is simply covered by the building and never reads.
  const lean = ledgerSunShadowDirection();
  let written = 0;
  const collared = new Set((SCULPT_WATER_DRESSING[host.contractId]?.collars ?? []).map(({ mount }) => mount));
  for (const { id, model } of mounts) {
    box.setFromObject(model);
    box.getSize(size);
    if (
      model.position.x < bounds.min.x || model.position.x > bounds.max.x ||
      model.position.z < bounds.min.z || model.position.z > bounds.max.z ||
      collared.has(id)
    ) continue;
    const ground = heightAt(model.position.x, model.position.z);
    // No contact shadow on a body standing in water: the riparian pack sits in the
    // channel, and a hard ellipse under the surface reads as a hole, not a shadow.
    if (waterY !== undefined && ground < waterY) continue;
    const throwLength = size.y * LANDMARK_CONTACT_THROW;
    placer.position.set(
      model.position.x + lean.x * throwLength,
      ground + 0.022,
      model.position.z + lean.y * throwLength,
    );
    placer.rotation.set(-Math.PI / 2, 0, -0.38);
    placer.scale.set(
      Math.max(0.7, size.x * LANDMARK_CONTACT_SPREAD),
      Math.max(0.7, size.z * LANDMARK_CONTACT_SPREAD),
      1,
    );
    placer.updateMatrix();
    contacts.setMatrixAt(written, placer.matrix);
    written += 1;
  }
  contacts.count = written;
  contacts.instanceMatrix.needsUpdate = true;
  if (!written) {
    geometry.dispose();
    material.dispose();
    return undefined;
  }
  host.scene.add(contacts);
  host.canvas.dataset.terrain3dPilotContactShadows = String(written);
  return contacts;
}

/**
 * Where the water line sits in a baked channel.
 *
 * Two truths compete: the channel wants to be full, and the ford has to stay a
 * crossing. So the surface is the LOWER of "channel bed + fill" and "ford bed +
 * skim" — the channel reads deep, the ford reads like a wet shelf you can walk.
 * Both beds are read from the baked grid, so a re-sculpt moves the water with it.
 */
function sculptWaterSurfaceY(
  heightAt: (x: number, z: number) => number,
  halfX: number,
  centerZ: number,
  fords: ReadonlyArray<{ centerX: number; halfWidth: number }>,
  fill: number,
  fordSkim: number,
): number {
  const channel: number[] = [];
  const ford: number[] = [];
  for (let x = -halfX + 2; x <= halfX - 2; x += 1) {
    const crossing = fords.some((range) => Math.abs(x - range.centerX) <= range.halfWidth);
    for (const z of [-3.5, -2, -1, 0, 1, 2, 3.5]) {
      (crossing ? ford : channel).push(heightAt(x, centerZ + z));
    }
  }
  const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  const channelBed = channel.length ? median(channel) : 0;
  const fordBed = ford.length ? median(ford) : channelBed;
  return Math.min(channelBed + fill, fordBed + fordSkim);
}

/** Derive a flat-floored gorge's water line from its baked centreline. */
function sculptWaterFloorY(
  heightAt: (x: number, z: number) => number,
  halfX: number,
  centerZ: number,
  quantile: number,
  drop: number,
): number {
  const samples: number[] = [];
  for (let x = -halfX + 1; x <= halfX - 1; x += 0.5) samples.push(heightAt(x, centerZ));
  samples.sort((a, b) => a - b);
  return (samples[Math.min(samples.length - 1, Math.floor(samples.length * quantile))] ?? 0) - drop;
}

function createSpanShadowBand(halfWidth: number, halfLength: number, color: string, opacity: number): THREE.Mesh {
  const columns = [-1, -0.62, 0, 0.62, 1];
  const columnAlpha = [0, 1, 1, 1, 0];
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= SPAN_SHADOW_ROWS; row += 1) {
    const t = row / SPAN_SHADOW_ROWS;
    const taper = Math.min(
      THREE.MathUtils.smoothstep(t, 0, SPAN_SHADOW_END_TAPER),
      THREE.MathUtils.smoothstep(1 - t, 0, SPAN_SHADOW_END_TAPER),
    );
    for (let column = 0; column < columns.length; column += 1) {
      positions.push(columns[column]! * halfWidth, 0, THREE.MathUtils.lerp(-halfLength, halfLength, t));
      colors.push(1, 1, 1, columnAlpha[column]! * taper);
    }
  }
  for (let row = 0; row < SPAN_SHADOW_ROWS; row += 1) {
    for (let column = 0; column < columns.length - 1; column += 1) {
      const a = row * columns.length + column;
      const b = a + 1;
      const c = a + columns.length;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    color,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  }));
  mesh.name = 'Terrain3dSpanShadow';
  mesh.userData.renderOnly = true;
  mesh.frustumCulled = false;
  mesh.renderOrder = RenderLayers.groundDecals + 0.05;
  return mesh;
}

function mountSpanShadow(
  host: Host,
  mounts: Array<{ id: string; model: THREE.Object3D }>,
  waterY: number | undefined,
): THREE.Mesh | undefined {
  const dressing = SPAN_SHADOW_CONTRACTS[host.contractId];
  if (isMapBeautyDisabled() || !dressing || waterY === undefined) return undefined;
  const span = mounts.find(({ id }) => id === dressing.mountId)?.model;
  if (!span) return undefined;
  const box = new THREE.Box3().setFromObject(span);
  const size = box.getSize(new THREE.Vector3());
  if (size.x <= 0 || size.z <= 0) return undefined;
  const shadow = createSpanShadowBand(size.x * dressing.widthScale, size.z * dressing.lengthScale, dressing.color, dressing.opacity);
  const lean = ledgerSunShadowDirection();
  const drop = Math.max(0, box.max.y - waterY);
  shadow.position.set(
    (box.min.x + box.max.x) / 2 + lean.x * drop * dressing.throw,
    waterY + SPAN_SHADOW_LIFT,
    (box.min.z + box.max.z) / 2 + lean.y * drop * dressing.throw,
  );
  host.scene.add(shadow);
  host.canvas.dataset.terrain3dPilotSpanShadow = `${(size.z * dressing.lengthScale * 2).toFixed(2)}x${(size.x * dressing.widthScale * 2).toFixed(2)}@${drop.toFixed(2)}`;
  return shadow;
}

/**
 * U1 — mount the render-only living-water surface for a sculpted contract.
 * Sim-silent: every number below is read from the sim's own declarations or from
 * the baked height grid; nothing is written back.
 */
function mountSculptWater(host: Host, heightAt: (x: number, z: number) => number, bounds: THREE.Box3): SculptWater | undefined {
  const dressing = SCULPT_WATER_DRESSING[host.contractId];
  if (isMapBeautyDisabled() || !dressing || !Terrain.hasRiverWater()) return undefined;
  const river = Terrain.riverGeometry();
  const centerZ = (river.minZ + river.maxZ) / 2;
  const riverHalfWidth = (river.maxZ - river.minZ) / 2;
  const fords = Terrain.fordRanges();
  const fordHalfWidth = fords.length ? Math.max(...fords.map((range) => range.halfWidth)) : 3;
  const fordCenters = fords.length ? fords.map((range) => range.centerX) : [0];
  const halfX = Math.min(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const surfaceY = dressing.surface.kind === 'channel-fill'
    ? sculptWaterSurfaceY(heightAt, halfX, centerZ, fords, dressing.surface.fill, dressing.fordSkim)
    : sculptWaterFloorY(heightAt, halfX, centerZ, dressing.surface.quantile, dressing.surface.drop);
  const visualHalfWidth = dressing.visualHalfWidth ?? Terrain.visualWaterHalfWidth();
  const overhang = Math.max(0, dressing.overhangMeters ?? 0);
  const water = createSculptWater({
    ford: false,
    depthTest: true,
    heightAt,
    bed: dressing.bed,
    deepMeters: dressing.deepMeters,
    shoreMeters: dressing.shoreMeters,
    color: dressing.color,
    opacity: dressing.opacity,
    rippleStrength: dressing.rippleStrength,
    textureBlend: dressing.textureBlend,
    fordTint: dressing.fordTint,
    shoreFadeMeters: dressing.shoreFadeMeters,
    surfaceLift: dressing.surfaceLift,
    emissive: dressing.emissive,
    centerZ,
    surfaceY,
    halfLength: halfX + overhang,
    riverHalfWidth,
    visualHalfWidth,
    lengthHalf: halfX + overhang,
    fadeStart: overhang > 0 ? halfX : Math.max(1, halfX - SCULPT_WATER_EDGE_FADE),
    fordHalfWidth,
    fordCenters,
    riverDepth: Terrain.waterDepth('river'),
    fordDepth: Terrain.waterDepth('ford'),
    wadeDepth: Balance.terrainSim.wadeDepth,
    deepDepth: Balance.terrainSim.deepDepth,
    // The gold glints belong on the sluice line: each harvest anchor pushed to its
    // own bank lip, exactly as the painted river places them.
    anchors: dressing.glints === 'harvest'
      ? Terrain.nodeAnchors.map((anchor) => ({
        x: anchor.x,
        z: anchor.z < centerZ ? river.minZ + 0.55 : river.maxZ - 0.55,
      }))
      : dressing.glints,
  });
  let lastFrame = -1;
  let lastAt = 0;
  water.mesh.onBeforeRender = (renderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    water.advance(delta);
  };
  host.scene.add(water.mesh);
  host.canvas.dataset.terrain3dPilotSculptWater = 'living-water-quad';
  // The MOUNTED half width, not the tile's declaration — a map that narrows its quad has to say so,
  // and e2e/shore-truth.spec.ts's law is "never wider than the sim declares", which narrowing keeps.
  host.canvas.dataset.terrain3dPilotSculptWaterHalfWidth = visualHalfWidth.toFixed(3);
  host.canvas.dataset.terrain3dPilotSculptWaterSimHalfWidth = Terrain.visualWaterHalfWidth().toFixed(3);
  host.canvas.dataset.terrain3dPilotSculptWaterY = surfaceY.toFixed(4);
  host.canvas.dataset.terrain3dPilotSculptWaterGlints = String(water.mesh.material instanceof THREE.Material
    ? (water.mesh.material.userData.waterGlints ?? 0)
    : 0);
  host.canvas.dataset.terrain3dPilotSculptWaterDeepest = water.deepestMeters.toFixed(3);
  host.canvas.dataset.terrain3dPilotSculptWaterFords = fords.map((range) => `${range.id}@${range.centerX}`).join(',');
  return water;
}

/** Foam collars ground water-mounted landmarks without drawing a dark pool under the surface. */
function mountWaterCollars(
  host: Host,
  mounts: ReadonlyArray<{ id: string; model: THREE.Object3D }>,
  waterY: number | undefined,
): THREE.InstancedMesh | undefined {
  const collars = SCULPT_WATER_DRESSING[host.contractId]?.collars;
  if (isMapBeautyDisabled() || !collars?.length || waterY === undefined) return undefined;
  const geometry = new THREE.RingGeometry(0.4, 1, 32, 1);
  const material = new THREE.MeshBasicMaterial({
    color: '#efe6cd',
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.InstancedMesh(geometry, material, collars.length);
  ring.name = 'Terrain3dWaterCollars';
  ring.userData.renderOnly = true;
  ring.frustumCulled = false;
  ring.renderOrder = RenderLayers.groundDecals;
  const placer = new THREE.Object3D();
  let written = 0;
  for (const collar of collars) {
    const model = mounts.find(({ id }) => id === collar.mount)?.model;
    if (!model) continue;
    placer.position.set(model.position.x, waterY + 0.012, model.position.z);
    placer.rotation.set(-Math.PI / 2, 0, 0);
    placer.scale.set(collar.radius, collar.radius, 1);
    placer.updateMatrix();
    ring.setMatrixAt(written, placer.matrix);
    written += 1;
  }
  ring.count = written;
  ring.instanceMatrix.needsUpdate = true;
  if (!written) {
    geometry.dispose();
    material.dispose();
    return undefined;
  }
  host.scene.add(ring);
  host.canvas.dataset.terrain3dPilotWaterCollars = String(written);
  return ring;
}

/**
 * U5 — living air over the Claim, plus the Rush's one visible reward note.
 *
 * Motes: a capped additive point field drifting along the key light. One draw call,
 * one buffer, all motion in the vertex shader.
 * Ember: while a post-secure Rush run is live, the claim-stake mount gets a warm
 * lift — the map says out loud that the player chose to press their luck. It is
 * driven from RunManager's own rush flag through the host, never inferred.
 */
function mountSunMotes(host: Host, bounds: THREE.Box3): SunMotes | undefined {
  const dressing = SUN_MOTES[host.contractId];
  if (isMapBeautyDisabled() || !dressing) return undefined;
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const lean = ledgerSunShadowDirection();
  const motes = createSunMotes({
    count: mobile ? Math.round(SUN_MOTE_CAP * 0.45) : SUN_MOTE_CAP,
    halfX: Math.min(Math.abs(bounds.min.x), Math.abs(bounds.max.x)) * (dressing.halfXScale ?? 0.62),
    halfZ: dressing.halfZ,
    centerZ: dressing.centerZ,
    minY: dressing.minY,
    maxY: dressing.maxY,
    drift: new THREE.Vector2(lean.x * 0.55, lean.y * 0.55),
    color: dressing.color,
    size: dressing.size,
    seed: dressing.seed,
  });
  let lastFrame = -1;
  let lastAt = 0;
  motes.points.onBeforeRender = (renderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    motes.advance(delta);
  };
  host.scene.add(motes.points);
  host.canvas.dataset.terrain3dPilotMotes = String(motes.count);
  return motes;
}

/** Trestle gorge wisps plus cart-local steam, both shed before gameplay VFX. */
function mountCrossingBreath(host: Host, waterY: number | undefined): CrossingBreath | undefined {
  const dressing = CROSSING_BREATH_CONTRACTS[host.contractId];
  if (isMapBeautyDisabled() || !dressing || waterY === undefined || performanceTierDiagnostics().tier !== 'full') return undefined;
  const wisps = createSunMotes({
    count: dressing.wisps.count,
    halfX: dressing.wisps.halfX,
    halfZ: dressing.wisps.halfZ,
    centerZ: 0,
    minY: waterY + 0.04,
    maxY: waterY + dressing.wisps.lift,
    drift: new THREE.Vector2(0, 0),
    rise: dressing.wisps.rise,
    color: dressing.wisps.color,
    size: dressing.wisps.size,
    seed: 0x7e51,
  });
  wisps.points.name = 'TrestleGorgeWisps';
  let plume: SunMotes | undefined;
  let cart: THREE.Object3D | undefined;
  let lastFrame = -1;
  let lastAt = 0;
  const advance = (renderer: THREE.WebGLRenderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    wisps.advance(delta);
    plume?.advance(delta);
  };
  wisps.points.onBeforeRender = advance;
  host.scene.add(wisps.points);

  let ticks = 0;
  const poll = () => {
    if (!wisps.points.parent) return;
    if (ticks % CROSSING_BREATH_POLL_FRAMES === 0) {
      const verdict = host.detailBudget?.() ?? 0;
      wisps.points.visible = verdict < 1;
      if (!cart) {
        const found = host.scene.getObjectByName('OreCart');
        if (found) {
          cart = found;
          plume = createSunMotes({
            count: dressing.plume.count,
            halfX: dressing.plume.radius,
            halfZ: dressing.plume.radius,
            centerZ: 0,
            minY: 1.65,
            maxY: 1.65 + dressing.plume.height,
            drift: new THREE.Vector2(0, 0),
            rise: dressing.plume.rise,
            color: dressing.plume.color,
            size: dressing.plume.size,
            seed: 0x2c07,
          });
          plume.points.name = 'TrestleCartSteam';
          plume.points.onBeforeRender = advance;
          cart.add(plume.points);
        }
      }
      if (plume) plume.points.visible = verdict < 2;
      host.canvas.dataset.terrain3dPilotGorgeWisps = wisps.points.visible ? String(dressing.wisps.count) : '0';
      host.canvas.dataset.terrain3dPilotSteam = plume?.points.visible ? String(dressing.plume.count) : '0';
    }
    ticks += 1;
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
  host.canvas.dataset.terrain3dPilotGorgeWisps = String(dressing.wisps.count);
  host.canvas.dataset.terrain3dPilotSteam = '0';
  return {
    dispose: () => {
      host.scene.remove(wisps.points);
      wisps.dispose();
      plume?.points.removeFromParent();
      plume?.dispose();
      plume = undefined;
      cart = undefined;
    },
  };
}

const STEAM_WISP_JOINTS = ['garden-pressure-manifold', 'west-terrace-pipe-header', 'east-terrace-pipe-header'];
const STEAM_WISP_COUNT = 8;
const STEAM_WISP_HOT_BOILERS = 2;

/** Pressure Garden steam follows the same hot-boiler count published by its HUD. */
function mountSteamWisps(
  host: Host,
  mounts: ReadonlyArray<{ id: string; model: THREE.Object3D }>,
): SunMotes[] {
  if (isMapBeautyDisabled() || host.contractId !== 'e2-pressure-garden' || !host.hotBoilers) return [];
  const built: SunMotes[] = [];
  for (const id of STEAM_WISP_JOINTS) {
    const joint = mounts.find((mount) => mount.id === id)?.model;
    if (!joint) continue;
    const base = joint.position.y;
    const wisps = createSunMotes({
      count: STEAM_WISP_COUNT,
      halfX: 1.35,
      halfZ: 1,
      centerZ: joint.position.z,
      minY: base + 1.1,
      maxY: base + 4.2,
      drift: new THREE.Vector2(0.18, 0.05),
      rise: 0.42,
      color: '#f4f2ec',
      size: 3.4,
      seed: 0x71c0 + id.length,
    });
    wisps.points.name = `${id}.SteamWisps`;
    wisps.points.position.x = joint.position.x;
    wisps.points.visible = false;
    let lastFrame = -1;
    let lastAt = 0;
    wisps.points.onBeforeRender = (renderer) => {
      const frame = renderer.info.render.frame;
      if (frame === lastFrame) return;
      const now = performance.now() / 1000;
      const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
      lastFrame = frame;
      lastAt = now;
      wisps.advance(delta);
    };
    host.scene.add(wisps.points);
    built.push(wisps);
  }
  if (!built.length) return built;
  const poll = () => {
    if (!built[0]!.points.parent) return;
    const hot = (host.hotBoilers?.() ?? 0) >= STEAM_WISP_HOT_BOILERS;
    for (const wisps of built) wisps.points.visible = hot;
    host.canvas.dataset.terrain3dPilotSteamWisps = hot ? String(built.length * STEAM_WISP_COUNT) : '0';
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
  host.canvas.dataset.terrain3dPilotSteamWisps = '0';
  return built;
}

/**
 * U4 — mount the contract's steam column(s).
 *
 * FULL tier only, and registered in the MQ-4 shed order: the field goes invisible (and therefore
 * costs nothing at all, rather than fading) the moment the runtime p95 watchdog returns a verdict.
 * Decoration is the first thing that should go and the last thing that should argue about it.
 */
function mountSteamPlume(
  host: Host,
  mounts: Array<{ id: string; model: THREE.Object3D }>,
): SteamPlume | undefined {
  const anchors = STEAM_ANCHORS[host.contractId];
  if (isMapBeautyDisabled() || !anchors?.length) return undefined;
  if (performanceTierDiagnostics().tier !== 'full') {
    host.canvas.dataset.terrain3dPilotSteam = 'tier-withheld';
    return undefined;
  }
  const box = new THREE.Box3();
  const emitters = anchors.flatMap((anchor) => {
    const model = mounts.find(({ id }) => id === anchor.mount)?.model;
    if (!model) return [];
    box.setFromObject(model);
    return [{
      x: THREE.MathUtils.lerp(box.min.x, box.max.x, anchor.acrossX),
      y: THREE.MathUtils.lerp(box.min.y, box.max.y, anchor.upY),
      z: THREE.MathUtils.lerp(box.min.z, box.max.z, anchor.acrossZ),
      rise: anchor.rise,
      spread: anchor.spread,
      size: anchor.size,
      life: anchor.life,
      puffs: anchor.puffs,
      opacity: anchor.opacity,
    }];
  });
  if (!emitters.length) {
    host.canvas.dataset.terrain3dPilotSteam = 'no-anchor-body';
    return undefined;
  }
  const lean = ledgerSunShadowDirection();
  const plume = createSteamPlume({ emitters, wind: new THREE.Vector2(lean.x, lean.y), color: STEAM_COLOUR, seed: 0x57ea });
  let lastFrame = -1;
  let lastAt = 0;
  plume.points.onBeforeRender = (renderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    plume.advance(delta);
  };
  // Polled on the frame BEFORE the draw, exactly as the Rush embers are, so a shed field stops
  // costing anything rather than fading out over seconds.
  const poll = () => {
    if (!plume.points.parent) return;
    const shed = (host.detailBudget?.() ?? 0) >= 1;
    plume.points.visible = !shed;
    host.canvas.dataset.terrain3dPilotSteam = shed ? 'shed' : `${emitters.length}x${plume.count}`;
    requestAnimationFrame(poll);
  };
  host.scene.add(plume.points);
  requestAnimationFrame(poll);
  host.canvas.dataset.terrain3dPilotSteam = `${emitters.length}x${plume.count}`;
  host.canvas.dataset.terrain3dPilotSteamAnchors = JSON.stringify(emitters.map((emitter) => ({
    x: +emitter.x.toFixed(2),
    y: +emitter.y.toFixed(2),
    z: +emitter.z.toFixed(2),
  })));
  return plume;
}

/** Incline cart-stack and winch-end steam; capped and shed before gameplay VFX. */
function mountHaulSteam(
  host: Host,
  heightAt: (x: number, z: number) => number,
  mounts: Array<{ id: string; model: THREE.Object3D }>,
): HaulSteam | undefined {
  if (isMapBeautyDisabled() || host.contractId !== 'e2-incline') return undefined;
  const at = (id: string): THREE.Object3D | undefined => mounts.find((mount) => mount.id === id)?.model;
  const cableHouse = at('upper-ore-cable-house');
  const crane = at('lower-yard-engine-crane');
  const vents: HaulVent[] = [{
    id: 'escort-cart', x: 0, z: 0, y: 2.2, rides: true,
    interval: 0.62, phase: 0, life: 2.4, rise: 2.1, radius: 2.9, grow: 1.6,
    drift: [-0.35, -0.15], slots: 3,
  }];
  if (cableHouse) vents.push({
    id: 'cable-house', x: cableHouse.position.x - 0.6, z: cableHouse.position.z - 1.4, y: 5,
    interval: 1.5, phase: 0.4, life: 3.2, rise: 1.3, radius: 3.6, grow: 1.9,
    drift: [-0.4, -0.2], slots: 3,
  });
  if (crane) vents.push({
    id: 'engine-crane', x: crane.position.x + 0.4, z: crane.position.z - 1, y: 3.6,
    interval: 2.1, phase: 1.1, life: 2.8, rise: 1.05, radius: 2.7, grow: 1.7,
    drift: [-0.3, -0.12], slots: 2,
  });
  if (vents.length < 2) return undefined;

  const steam = createHaulSteam(vents, heightAt);
  let lastAt = 0;
  let shedChecked = 0;
  const poll = () => {
    if (!steam.group.parent) return;
    const now = performance.now() / 1000;
    const delta = lastAt === 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastAt = now;
    if (now - shedChecked > 0.5) {
      shedChecked = now;
      steam.setDetailBudget(host.detailBudget?.() ?? 0);
      const diagnostics = steam.diagnostics();
      host.canvas.dataset.terrain3dPilotHaulSteamActive = String(diagnostics.active);
      host.canvas.dataset.terrain3dPilotHaulSteamSpawned = String(diagnostics.spawned);
      host.canvas.dataset.terrain3dPilotHaulSteamDetail = String(diagnostics.detail);
    }
    steam.advance(delta, host.haulCart?.());
    requestAnimationFrame(poll);
  };
  host.scene.add(steam.group);
  requestAnimationFrame(poll);
  host.canvas.dataset.terrain3dPilotHaulSteam = String(vents.length);
  host.canvas.dataset.terrain3dPilotHaulSteamCapacity = String(vents.reduce((total, vent) => total + vent.slots, 0));
  return steam;
}

/**
 * U5b — the Rush's reward note: a warm ember lift off the claim-stake ring, live
 * only while the player has chosen to press their luck. Same point field as the
 * motes, one draw call, hidden (and therefore near-free) the rest of the time.
 */
function mountRushEmbers(
  host: Host,
  mounts: Array<{ id: string; model: THREE.Object3D }>,
  heightAt: (x: number, z: number) => number,
): SunMotes | undefined {
  if (isMapBeautyDisabled() || !RUSH_EMBER_CONTRACTS.has(host.contractId) || !host.rushActive) return undefined;
  const stake = mounts.find(({ id }) => id === 'claim_stake')?.model;
  if (!stake) return undefined;
  const embers = createSunMotes({
    count: RUSH_EMBER_COUNT,
    halfX: 1.15,
    halfZ: 1.15,
    centerZ: stake.position.z,
    minY: heightAt(stake.position.x, stake.position.z) + 0.15,
    maxY: heightAt(stake.position.x, stake.position.z) + 2.7,
    drift: new THREE.Vector2(0, 0),
    rise: 0.55,
    color: '#ff9a3c',
    size: 2.4,
    seed: 0x5715,
  });
  embers.points.name = 'ClaimStakeRushEmbers';
  embers.points.position.x = stake.position.x;
  embers.points.visible = false;
  let lastFrame = -1;
  let lastAt = 0;
  embers.points.onBeforeRender = (renderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    embers.advance(delta);
  };
  // visible is polled off the run state on the frame BEFORE the draw, so an ended
  // Rush stops costing anything at all rather than fading out over seconds.
  const poll = () => {
    if (!embers.points.parent) return;
    embers.points.visible = host.rushActive?.() === true;
    host.canvas.dataset.terrain3dPilotRushEmbers = embers.points.visible ? String(RUSH_EMBER_COUNT) : '0';
    requestAnimationFrame(poll);
  };
  host.scene.add(embers.points);
  requestAnimationFrame(poll);
  host.canvas.dataset.terrain3dPilotRushEmbers = '0';
  return embers;
}

/**
 * Dry Gulch mounts a LIVE pool over the isolated_spring, so that landmark's baked cyan water must
 * stop glowing at emissive 3 — a full-bright pool bed shines through the surface above it and the
 * map keeps its dead-paint smudge. The pack is one mesh on one material (pack law), so the pool
 * cannot be dimmed separately from its stones, and dropping the whole body far enough to kill the
 * cyan also killed the stone ring. 2.1 is where the two land together: measured, the live surface
 * already covers the flat cap at alpha 0.88-0.985, so the residual cyan has nowhere to show, while
 * the stones — which stand ABOVE the water plane and are never covered — keep their pale rim read.
 */
const DRY_GULCH_SPRING_EMISSIVE = 2.1;

/**
 * Where the live water goes, measured off the landmark body rather than guessed.
 * `isolated_spring.glb` draws its pool as a flat cap at local y 0.0875 (14 coplanar triangles,
 * vertices out to r 2.80) with the stone ring covering everything past r~2.0. So the live surface
 * sits a hair above 0.0875 and its water line is 2.35, with the damp margin reaching past 2.80 —
 * the whole baked cap has to be covered or its cyan rim survives as a halo around the new water.
 *
 * MEASURE, NEVER ASSUME: `build_landmark_packs.py -- dry-gulch` produces a DIFFERENT spring body
 * than the one shipped (cap at 0.13, r 2.67), so these numbers are pinned to the committed GLB.
 * Re-run the script above after any landmark rebuild — see reviews/beauty-dry-gulch.md, U4.
 * Re-measure with `scripts/beauty-spring-pool.mjs` if that body is ever replaced.
 */
type LiveSpringPool = { surfaceY: number; dampBaseRadius: number };
const LIVE_SPRING_POND_CONTRACTS = new Map<string, LiveSpringPool>([
  ['e1-dry-gulch', { surfaceY: 0.0875, dampBaseRadius: 2.35 }],
]);

/**
 * THE POOL GRADE (F-BEAUTY-2, reviews/beauty-pools.md) — a pre-tonemap grade + exposure shoulder
 * for the warm night pools, on the terrain fragment only, right before ACES sees it.
 *
 * Measured mechanism (transect rig, e2e/beauty-pools.spec.ts): the warm pool ground is already
 * amber in isolation (sat 0.52-0.63 at hue ~40 deg), and warm+warm overlap stays amber — but the
 * hero's/prospector's cool light standing in a pool collapses the same pixels to sat ~0.20 at
 * hue ~14 deg, a pale hueless disc exactly where the player looks. An additive hue shift cannot
 * be undone by any luminance curve, so the seam has two parts:
 *  1. re-anchor the fragment's chroma toward the pool's own warm axis at PRESERVED luma — the
 *     ground under a lantern belongs to the lantern; figures above it keep the cool light;
 *  2. a hue-preserving Reinhard shoulder on the pre-tonemap max channel (knee -> ceiling), the
 *     pool's own exposure treatment, so any over-range sum rolls off before ACES can bleach it.
 * Both scale with warm-pool coverage x darkness: zero at day, zero outside pools, zero on cool
 * pools, and the whole block is compiled out under ?nopoolgrade (byte-identical shader control).
 */
const POOL_GRADE_GLSL = `
float terrain3dGradeAmount = uTerrain3dNightPoolGradeStrength * terrain3dPoolGradeMask * uTerrain3dNightPoolDarkness;
if (terrain3dGradeAmount > 0.001) {
  vec3 terrain3dGradeLumaW = vec3(0.2126, 0.7152, 0.0722);
  float terrain3dGradeLuma = dot(outgoingLight, terrain3dGradeLumaW);
  vec3 terrain3dGradeAnchor = terrain3dPoolGradeTint
    * (terrain3dGradeLuma / max(dot(terrain3dPoolGradeTint, terrain3dGradeLumaW), 1e-4));
  vec3 terrain3dGraded = mix(outgoingLight, terrain3dGradeAnchor, terrain3dGradeAmount);
  float terrain3dGradeMax = max(terrain3dGraded.r, max(terrain3dGraded.g, terrain3dGraded.b));
  if (terrain3dGradeMax > uTerrain3dNightPoolGradeKnee) {
    float terrain3dGradeCompressed = uTerrain3dNightPoolGradeKnee
      + (terrain3dGradeMax - uTerrain3dNightPoolGradeKnee)
      / (1.0 + (terrain3dGradeMax - uTerrain3dNightPoolGradeKnee)
        / max(uTerrain3dNightPoolGradeCeiling - uTerrain3dNightPoolGradeKnee, 1e-3));
    terrain3dGraded *= terrain3dGradeCompressed / terrain3dGradeMax;
  }
  outgoingLight = terrain3dGraded;
}
`;

function hidePaintedGround(host: Host): HiddenRelief[] { return hidePaintedRelief(host); }
function featherTerrainEdge(model: THREE.Object3D, bounds: THREE.Box3, host: Host): void {
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.renderOrder = 0.1;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  const poolSources = Array.from({ length: NIGHT_POOL_SHADER_CAP }, () => new THREE.Vector4());
  const poolCount = { value: 0 };
  const poolDarkness = { value: 0 };
  const poolIntensity = { value: Balance.contracts.nightShift.terrainPoolIntensity };
  const poolFalloff = { value: Balance.contracts.nightShift.lightFalloff };
  const poolCandidates: LightSource[] = [];
  const poolGradeStrength = { value: Balance.contracts.nightShift.poolGradeStrength };
  const poolGradeKnee = { value: Balance.contracts.nightShift.poolGradeKnee };
  const poolGradeCeiling = { value: Balance.contracts.nightShift.poolGradeCeiling };
  const poolGradeEnabled = !isPoolGradeDisabled();
  let lastUpdatedFrame = -1;
  const updateNightPools = (renderer: THREE.WebGLRenderer) => {
    if (renderer.info.render.frame === lastUpdatedFrame) return;
    lastUpdatedFrame = renderer.info.render.frame;
    // Live Balance reads so the capture rig can A/B the grade in one session via setBalance.
    poolGradeStrength.value = Balance.contracts.nightShift.poolGradeStrength;
    poolGradeKnee.value = Balance.contracts.nightShift.poolGradeKnee;
    poolGradeCeiling.value = Balance.contracts.nightShift.poolGradeCeiling;
    const snapshot = host.nightLighting?.();
    poolDarkness.value = snapshot?.darkness ?? 0;
    poolCandidates.length = 0;
    for (const source of snapshot?.sources ?? []) {
      if (source.kind !== 'watch') poolCandidates.push(source);
    }
    poolCandidates.sort((a, b) => nightPoolPriority(a) - nightPoolPriority(b) || a.id.localeCompare(b.id));
    poolCount.value = Math.min(poolCandidates.length, NIGHT_POOL_SHADER_CAP);
    for (let index = 0; index < NIGHT_POOL_SHADER_CAP; index += 1) {
      const source = index < poolCount.value ? poolCandidates[index] : undefined;
      poolSources[index]!.set(source?.x ?? 0, source?.z ?? 0, source?.radius ?? 0, isWarmPool(source) ? 1 : 0);
    }
    host.canvas.dataset.terrain3dPilotNightPoolSources = String(poolCount.value);
  };
  for (const material of materials) {
    if (!(material as THREE.MeshStandardMaterial).isMeshStandardMaterial) continue;
    const compile = material.onBeforeCompile.bind(material);
    material.transparent = true;
    material.depthWrite = false;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.uTerrain3dNightPoolCount = poolCount;
      shader.uniforms.uTerrain3dNightPoolDarkness = poolDarkness;
      shader.uniforms.uTerrain3dNightPoolIntensity = poolIntensity;
      shader.uniforms.uTerrain3dNightPoolFalloff = poolFalloff;
      shader.uniforms.uTerrain3dNightPools = { value: poolSources };
      shader.uniforms.uTerrain3dNightPoolGradeStrength = poolGradeStrength;
      shader.uniforms.uTerrain3dNightPoolGradeKnee = poolGradeKnee;
      shader.uniforms.uTerrain3dNightPoolGradeCeiling = poolGradeCeiling;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTerrain3dWorld;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrain3dWorld = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\nvarying vec2 vTerrain3dWorld;\nuniform float uTerrain3dNightPoolCount;\nuniform float uTerrain3dNightPoolDarkness;\nuniform float uTerrain3dNightPoolIntensity;\nuniform float uTerrain3dNightPoolFalloff;\nuniform vec4 uTerrain3dNightPools[${NIGHT_POOL_SHADER_CAP}];`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>\nvec3 terrain3dPoolLight = vec3(0.0);\nfor (int terrain3dPoolIndex = 0; terrain3dPoolIndex < ${NIGHT_POOL_SHADER_CAP}; terrain3dPoolIndex++) {\n  if (float(terrain3dPoolIndex) >= uTerrain3dNightPoolCount) break;\n  vec4 terrain3dPool = uTerrain3dNightPools[terrain3dPoolIndex];\n  float terrain3dPoolDistance = distance(vTerrain3dWorld, terrain3dPool.xy);\n  float terrain3dPoolFalloffT = clamp((terrain3dPoolDistance - terrain3dPool.z) / uTerrain3dNightPoolFalloff, 0.0, 1.0);\n  float terrain3dPoolFalloff = pow(1.0 - terrain3dPoolFalloffT, 1.5);\n  float terrain3dPoolCore = 1.0 - smoothstep(0.0, 0.5, terrain3dPoolDistance / max(terrain3dPool.z, 0.0001));\n  vec3 terrain3dPoolWarm = mix(vec3(1.00, 0.485, 0.10), vec3(1.00, 0.62, 0.20), terrain3dPoolCore);\n  vec3 terrain3dPoolTint = mix(vec3(0.10, 0.54, 0.60), terrain3dPoolWarm, step(0.5, terrain3dPool.w));\n  terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n}\ntotalEmissiveRadiance += terrain3dPoolLight * uTerrain3dNightPoolDarkness * uTerrain3dNightPoolIntensity;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>\nfloat terrain3dEdge = max(abs(vTerrain3dWorld.x) / ${halfX.toFixed(3)}, abs(vTerrain3dWorld.y) / ${halfZ.toFixed(3)});\ndiffuseColor.a *= 1.0 - smoothstep(${((halfX - SKIRT_INSET) / halfX).toFixed(4)}, 1.0, terrain3dEdge);`,
        );
      if (poolGradeEnabled) {
        // Second-stage rewrites over the block above: track the strongest warm pool's coverage
        // and per-fragment warm tint through the existing loop, then grade outgoingLight right
        // before ACES. Under ?nopoolgrade none of these run and the shader is byte-identical.
        shader.fragmentShader = shader.fragmentShader
          .replace(
            'uniform vec4 uTerrain3dNightPools',
            'uniform float uTerrain3dNightPoolGradeStrength;\nuniform float uTerrain3dNightPoolGradeKnee;\nuniform float uTerrain3dNightPoolGradeCeiling;\nuniform vec4 uTerrain3dNightPools',
          )
          .replace(
            'vec3 terrain3dPoolLight = vec3(0.0);',
            'vec3 terrain3dPoolLight = vec3(0.0);\nfloat terrain3dPoolGradeMask = 0.0;\nvec3 terrain3dPoolGradeTint = vec3(1.00, 0.62, 0.20);',
          )
          .replace(
            'terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);',
            'terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n  float terrain3dPoolWarmCoverage = terrain3dPoolFalloff * step(0.5, terrain3dPool.w);\n  if (terrain3dPoolWarmCoverage > terrain3dPoolGradeMask) {\n    terrain3dPoolGradeMask = terrain3dPoolWarmCoverage;\n    terrain3dPoolGradeTint = terrain3dPoolWarm;\n  }',
          )
          .replace('#include <opaque_fragment>', `${POOL_GRADE_GLSL}\n#include <opaque_fragment>`);
      }
    };
    material.needsUpdate = true;
  }
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) mesh.onBeforeRender = updateNightPools;
  });
  host.canvas.dataset.terrain3dPilotNightPools = 'world-shader';
  host.canvas.dataset.terrain3dPilotNightPoolSources = '0';
}

function nightPoolPriority(source: LightSource): number {
  if (source.kind === 'hero') return 0;
  if (source.kind === 'prospector') return 1;
  if (source.kind === 'lantern' || source.kind === 'powered-lamp') return 2;
  return 3;
}

function isWarmPool(source: LightSource | undefined): boolean {
  return source?.kind !== 'hero' && source?.kind !== 'prospector';
}

/**
 * The 3D pilot hides `SpringPonds` along with every other painted ground layer, which on a map whose
 * whole story is one spring leaves the water as baked atlas paint. Contracts in
 * `LIVE_SPRING_POND_CONTRACTS` get that surface back as render-only geometry. Water uses the sim's
 * `waterSources[].radius`; the measured atlas cap only sizes the separate damp-ground cover.
 */
function createLiveSpringPonds(host: Host, heightAt: (x: number, z: number) => number): SpringPondSurface[] {
  const pool = LIVE_SPRING_POND_CONTRACTS.get(host.contractId);
  if (!pool) return [];
  return waterSources()
    .filter((source) => source.kind === 'spring_pond')
    .map((source) => createSpringPondSurface({
      x: source.x,
      z: source.z,
      radius: source.radius,
      dampBaseRadius: pool.dampBaseRadius,
      surfaceY: heightAt(source.x, source.z) + pool.surfaceY,
    }));
}

function hidePaintedRelief(host: Host): HiddenRelief[] {
  const objects = new Set<THREE.Object3D>();
  host.scene.traverse((object) => {
    if (
      object.userData.terrainRelief === true ||
      object.userData.terrainVista === true ||
      LEGACY_GROUND_SLOTS.has(String(object.userData.assetSlot)) ||
      object.name === 'SpringPonds' ||
      object.name === 'FordSteppingStones' ||
      object.name.startsWith('RiverGravelBar.')
    ) objects.add(object);
  });
  if (host.paintedGround) objects.add(host.paintedGround);
  const hidden = [...objects].map((object) => ({ object, visible: object.visible }));
  for (const { object } of hidden) object.visible = false;
  return hidden;
}

function createChannelWater(contractId: string, contract: Contract, heightAt: (x: number, z: number) => number): THREE.Group | undefined {
  const dressing = CONTRACT_CHANNEL_WATER[contractId];
  const regions = contract.maskTruth?.waterMask?.regions ?? [];
  if (!dressing || regions.length === 0) return undefined;
  // `?nochannelwater` boots the identical build with the dressing withheld. It exists because a
  // beauty claim is only worth what its A/B proves, and it also answers "is this render or sim?"
  // in one reload: every suite behaves identically with it on, because the water is decoration.
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('nochannelwater')) return undefined;
  const wade = Balance.terrainSim.wadeDepth;
  const deep = Balance.terrainSim.deepDepth;
  const group = new THREE.Group();
  group.name = 'Terrain3dChannelWater';
  group.userData.renderOnly = true;
  for (const region of regions) {
    const channel = dressing.channels[region.id];
    const points = region.points ?? [];
    if (!channel || region.kind !== 'polyline_band' || region.zone !== 'river' || points.length < 2 || !region.halfWidth) continue;
    group.add(createWaterRibbon({
      name: `Terrain3dChannelWater.${region.id}`,
      points,
      halfWidth: region.halfWidth,
      edgeBleed: dressing.edgeBleed,
      // The mask agreement measured 0 dry ground inside the mask at this plane, so a surface
      // just above it covers the cut channel and nothing else. Depth-tested, so wherever the
      // ribbon would stray onto a bank the sculpt itself occludes it.
      surfaceY: (contract.maskAgreement?.waterPlaneY ?? 0) + dressing.surfaceLift,
      // Render depth, not sim depth: it only picks a point on the shader's wade..deep colour
      // ramp, so the contract's north-deeper-than-south ORDER reads as colour and foam.
      depth: channel.depth === 'deep' ? deep : wade + (deep - wade) * 0.34,
      glints: channel.glints ?? [],
      headInset: channel.headInset,
      tailInset: channel.tailInset,
      headFade: channel.headFade,
      tailFade: channel.tailFade,
      bed: { heightAt, ...dressing.bed },
    }));
  }
  group.add(createWaterConfluence({
    name: 'Terrain3dChannelWater.confluences',
    paths: dressing.confluences.map((confluence) => confluence.points),
    surfaceY: (contract.maskAgreement?.waterPlaneY ?? 0) + dressing.surfaceLift + 0.001,
    depth: wade + (deep - wade) * 0.58,
  }));
  // THE CROSSINGS READ WET (beauty U2's affordance half). Both fords are cut below the water plane
  // across an 11 m band while only a 3.4 m ribbon crosses them, so the pans rendered as brown
  // gravel with a stripe of river through it and the pressure board showed enemies wading dry
  // ground. One sheet for both pans, from the mask's own ford rects.
  const pans = regions.filter((region) => region.kind === 'rect' && region.zone === 'ford' && region.minX !== undefined);
  if (dressing.fordDepth !== undefined && pans.length > 0) {
    const halfDepth = Math.max(...pans.map((pan) => (pan.maxZ! - pan.minZ!) / 2));
    group.add(createFordSheet({
      name: 'Terrain3dChannelWater.fords',
      pans: pans.map((pan) => ({ minX: pan.minX!, maxX: pan.maxX!, minZ: pan.minZ!, maxZ: pan.maxZ! })),
      halfDepth,
      surfaceY: (contract.maskAgreement?.waterPlaneY ?? 0) + dressing.surfaceLift,
      depth: wade + (deep - wade) * dressing.fordDepth,
    }));
  }
  if (group.children.length === 0) return undefined;
  const clock = { frame: -1, last: 0 };
  const advance = (renderer: THREE.WebGLRenderer): void => {
    if (renderer.info.render.frame === clock.frame) return;
    clock.frame = renderer.info.render.frame;
    const now = performance.now();
    const delta = clock.last === 0 ? 0 : Math.min(0.1, Math.max(0, (now - clock.last) / 1000));
    clock.last = now;
    for (const child of group.children) updateWaterMaterial(child as THREE.Mesh, delta);
  };
  for (const child of group.children) (child as THREE.Mesh).onBeforeRender = advance;
  return group;
}

function createContinuation(
  terrain: THREE.Object3D,
  panorama: THREE.Object3D,
  heightAt: (x: number, z: number) => number,
  bounds: THREE.Box3,
  contractId: string,
): THREE.Mesh | undefined {
  const source = terrain.getObjectByProperty('isMesh', true) as THREE.Mesh | undefined;
  if (!source || Array.isArray(source.material)) return undefined;
  panorama.updateMatrixWorld(true);
  const point = new THREE.Vector3();
  let outerRadius = Number.POSITIVE_INFINITY;
  let outerHeight = 0;
  let innerChebyshev = Number.POSITIVE_INFINITY;
  panorama.traverse((object) => {
    const mesh = object as THREE.Mesh;
    const position = mesh.isMesh ? mesh.geometry.getAttribute('position') : undefined;
    if (!position) return;
    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position as THREE.BufferAttribute, index);
      mesh.localToWorld(point);
      innerChebyshev = Math.min(innerChebyshev, Math.max(Math.abs(point.x), Math.abs(point.z)));
      const radius = Math.hypot(point.x, point.z);
      if (radius < outerRadius) {
        outerRadius = radius;
        outerHeight = point.y;
      }
    }
  });
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  if (!Number.isFinite(outerRadius) || innerChebyshev <= Math.max(halfX, halfZ) + 0.5) return undefined;

  const edgeSegments = 32;
  const edge: Array<[number, number]> = [];
  for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(-halfX, halfX, index / edgeSegments), -halfZ]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([halfX, THREE.MathUtils.lerp(-halfZ, halfZ, index / edgeSegments)]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(halfX, -halfX, index / edgeSegments), halfZ]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([-halfX, THREE.MathUtils.lerp(halfZ, -halfZ, index / edgeSegments)]);
  const rings = Math.max(2, Math.min(32, Math.ceil((outerRadius - Math.max(halfX, halfZ)) / 5)));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring <= rings; ring += 1) {
    const mix = ring / rings;
    const eased = mix * mix * (3 - 2 * mix);
    for (const [innerX, innerZ] of edge) {
      const innerRadius = Math.hypot(innerX, innerZ);
      const outerX = innerX / innerRadius * outerRadius;
      const outerZ = innerZ / innerRadius * outerRadius;
      const x = THREE.MathUtils.lerp(innerX, outerX, mix);
      const z = THREE.MathUtils.lerp(innerZ, outerZ, mix);
      const distance = Math.hypot(x - innerX, z - innerZ);
      const repeated = distance % (CONTINUATION_SAMPLE_DEPTH * 2);
      const sampleDepth = repeated <= CONTINUATION_SAMPLE_DEPTH ? repeated : CONTINUATION_SAMPLE_DEPTH * 2 - repeated;
      const sampleX = innerX - innerX / innerRadius * sampleDepth;
      const sampleZ = innerZ - innerZ / innerRadius * sampleDepth;
      positions.push(x, THREE.MathUtils.lerp(heightAt(innerX, innerZ), outerHeight, eased), z);
      uvs.push((sampleX - bounds.min.x) / (bounds.max.x - bounds.min.x), (bounds.max.z - sampleZ) / (bounds.max.z - bounds.min.z));
    }
  }
  for (let ring = 0; ring < rings; ring += 1) {
    for (let index = 0; index < edge.length; index += 1) {
      const next = (index + 1) % edge.length;
      const a = ring * edge.length + index;
      const b = ring * edge.length + next;
      const c = (ring + 1) * edge.length + index;
      const d = (ring + 1) * edge.length + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('uv1', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const material = source.material.clone();
  material.side = THREE.DoubleSide;
  (material as THREE.Material & { fog?: boolean }).fog = false;
  material.depthWrite = false;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.99999;',
    );
  };
  // THE ATMOSPHERICS SHIFT: this apron — not the panorama — is what a run frame's top edge
  // actually contains once the player crosses onto the far bank. Measured, per contract, in
  // src/world/HorizonApron.ts.
  const apron = horizonApronProfile(contractId);
  if (apron) paintHorizonApron(material, apron);
  const continuation = new THREE.Mesh(geometry, material);
  continuation.userData.horizonApron = apron ? 'painted' : 'plain';
  continuation.frustumCulled = false;
  continuation.renderOrder = -50;
  continuation.name = 'Terrain3dSculptContinuation';
  continuation.userData.terrain3dSkirtBlend = true;
  return continuation;
}

export function installTerrain3dClaimPilot(host: Host): () => void {
  const selected = REGISTRY[host.contractId];
  host.canvas.dataset.terrain3dPilotContract = host.contractId;
  if (performanceTierDiagnostics().tier === 'lite') {
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'lite';
    publish(host.canvas, 'lite', 'painted');
    return () => undefined;
  }
  if (!selected || selected.contract.tileId !== host.tileId) {
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'off';
    publish(host.canvas, 'failed', 'painted', undefined, undefined, undefined, 'pilot-contract-unavailable');
    return () => undefined;
  }
  let disposed = false;
  let terrain: THREE.Object3D | undefined;
  let panorama: THREE.Object3D | undefined;
  let landmarks: THREE.Group | undefined;
  let skirt: THREE.Object3D | undefined;
  let sculptWater: SculptWater | undefined;
  let sunMotes: SunMotes | undefined;
  let rushEmbers: SunMotes | undefined;
  let steamPlume: SteamPlume | undefined;
  let steamWisps: SunMotes[] = [];
  let haulSteam: HaulSteam | undefined;
  let landmarkContacts: THREE.InstancedMesh | undefined;
  let waterCollars: THREE.InstancedMesh | undefined;
  let spanShadow: THREE.Mesh | undefined;
  let crossingBreath: CrossingBreath | undefined;
  let ponds: SpringPondSurface[] = [];
  let nextPonds: SpringPondSurface[] = [];
  let channelWater: THREE.Group | undefined;
  let hiddenRelief: HiddenRelief[] = [];
  let loadedTerrain: THREE.Object3D | undefined;
  let loadedPanorama: THREE.Object3D | undefined;
  let loadFailed = false;
  let uninstallHeightSource: (() => void) | undefined;
  const onContextLost = () => reportRenderDemotion(host.canvas, 'webgl-context-lost');
  host.canvas.addEventListener('webglcontextlost', onContextLost);
  host.canvas.dataset.terrain3dPilotTerrainLoadState = 'pending';
  host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'pending';
  host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'pending';
  publish(host.canvas, 'loading', 'painted');
  const loader = trackedGltfLoader(host.canvas, 'the claim');
  const disposeLoaded = () => {
    if (loadedTerrain) {
      disposeObject3D(loadedTerrain);
      host.canvas.dataset.terrain3dPilotTerrainLoadState = 'disposed';
    }
    if (loadedPanorama) {
      disposeObject3D(loadedPanorama);
      host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'disposed';
    }
    loadedTerrain = undefined;
    loadedPanorama = undefined;
  };
  const failLoad = (error: unknown) => {
    if (loadFailed) return;
    loadFailed = true;
    disposeLoaded();
    if (!disposed) publish(host.canvas, 'failed', 'painted', undefined, undefined, undefined, `pilot-load-failed:${error instanceof Error ? error.message : 'unknown'}`);
  };
  const installLoaded = () => {
    if (!loadedTerrain || !loadedPanorama || loadFailed) return;
    const nextTerrain = loadedTerrain;
    const nextPanorama = loadedPanorama;
    const terrainMetrics = inspect(nextTerrain, true);
    const panoramaMetrics = inspect(nextPanorama, false);
    try {
      const terrainValid = validTerrain(terrainMetrics, selected.contract);
      const panoramaValid = validPanorama(panoramaMetrics, selected.panoramaContract, selected.contract.panoramaMount);
      if (!terrainValid || !panoramaValid) {
        host.canvas.dataset.terrain3dPilotFailure = `terrain:${terrainValid};panorama:${panoramaValid}`;
        throw new Error('terrain contract mismatch');
      }
      const heightAt = bakeHeightGrid(nextTerrain, terrainMetrics);
      if (disposed) throw new Error('terrain pilot disposed');
      nextPonds = createLiveSpringPonds(host, heightAt);
      nextTerrain.name = 'Terrain3dClaimPilot';
      if (host.nightMode) featherTerrainEdge(nextTerrain, terrainMetrics.bounds, host);
      else {
        host.canvas.dataset.terrain3dPilotNightPools = 'off';
        host.canvas.dataset.terrain3dPilotNightPoolSources = '0';
      }
      const mount = selected.contract.panoramaMount;
      nextPanorama.name = mount.id;
      nextPanorama.position.fromArray(mount.position);
      nextPanorama.rotation.set(...mount.rotation);
      nextPanorama.scale.fromArray(mount.scale);
      preparePanorama(nextPanorama);
      const nextSkirt = createContinuation(nextTerrain, nextPanorama, heightAt, terrainMetrics.bounds, host.contractId);
      const nextChannelWater = createChannelWater(host.contractId, selected.contract, heightAt);
      terrain = nextTerrain;
      panorama = nextPanorama;
      skirt = nextSkirt;
      channelWater = nextChannelWater;
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      uninstallHeightSource = installVisualHeightSource(heightAt);
      host.onVisualHeightSourceInstalled?.();
      host.scene.add(nextTerrain, nextPanorama);
      if (nextSkirt) host.scene.add(nextSkirt);
      ponds = nextPonds;
      nextPonds = [];
      for (const pond of ponds) host.scene.add(pond.group);
      host.canvas.dataset.terrain3dPilotSpringPonds = String(ponds.length);
      host.canvas.dataset.terrain3dPilotSpringPondWaterRadii = JSON.stringify(ponds.map((pond) => pond.waterRadius));
      host.canvas.dataset.terrain3dPilotSpringPondDampGroundRadii = JSON.stringify(ponds.map((pond) => pond.dampGroundRadius));
      if (nextChannelWater) host.scene.add(nextChannelWater);
      host.canvas.dataset.terrain3dPilotChannelWater = String(
        nextChannelWater?.children.filter((child) => child.name.includes('-channel')).length ?? 0,
      );
      host.canvas.dataset.terrain3dPilotFordWater = String(
        nextChannelWater?.children.filter((child) => child.name.endsWith('.fords')).length ?? 0,
      );
      host.canvas.dataset.terrain3dPilotChannelWaterHalfWidths = JSON.stringify(
        nextChannelWater?.children
          .filter((child) => child.name.includes('-channel'))
          .map((child) => child.userData.visualHalfWidth) ?? [],
      );
      hiddenRelief = hidePaintedGround(host);
      // A decoration must never cost the map its sculpt: if the water fails to
      // build, the terrain stays mounted and the failure is published, not silent.
      try {
        sculptWater = mountSculptWater(host, heightAt, terrainMetrics.bounds);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown';
        host.canvas.dataset.terrain3dPilotSculptWater = `failed:${message}`;
        reportRenderDemotion(host.canvas, `sculpt-water-failed:${message}`);
      }
      try {
        sunMotes = mountSunMotes(host, terrainMetrics.bounds);
      } catch (error) {
        host.canvas.dataset.terrain3dPilotMotes = `failed:${error instanceof Error ? error.message : 'unknown'}`;
      }
      try {
        crossingBreath = mountCrossingBreath(host, sculptWater?.mesh.position.y);
      } catch (error) {
        host.canvas.dataset.terrain3dPilotSteam = `failed:${error instanceof Error ? error.message : 'unknown'}`;
      }
      host.canvas.dataset.terrain3dPilotTerrainLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotHiddenRelief = String(hiddenRelief.length);
      host.canvas.dataset.terrain3dPilotHiddenGroundLayers = hiddenRelief
        .map(({ object }) => object.name || String(object.userData.assetSlot))
        .filter(Boolean)
        .join('|');
      host.canvas.dataset.terrain3dPilotContinuation = nextSkirt ? 'sculpt-edge-continuation' : 'panorama-owned-continuation';
      // THE ATMOSPHERICS SHIFT's plain-boot door: the apron is the only horizon surface a run
      // frame can reach (the panorama measured 0% at every hero position, both viewports), so
      // whether it is painted has to be readable without ?debug.
      host.canvas.dataset.terrain3dPilotHorizonApron = String(nextSkirt?.userData.horizonApron ?? 'none');
      // THE FAR GROUND SHIFT's instrument (src/world/HorizonApron.ts). Colour only, last thing
      // mounted so nothing downstream re-touches the materials it flattens. The painted-material
      // counts are published because they are the probe's positive control: a census that reads
      // 0.00% panorama means "off camera" only if the ring was provably repainted.
      const probeMode = farGroundProbeMode();
      if (probeMode === 'off') host.canvas.dataset.terrain3dPilotFarGroundProbe = 'off';
      else {
        const painted = {
          panorama: paintFarGroundProbe(nextPanorama, 'panorama'),
          apron: paintFarGroundProbe(nextSkirt, 'apron'),
          terrain: paintFarGroundProbe(nextTerrain, 'terrain'),
        };
        // solo: nothing left that could occlude the ring. If it is in the frustum, it IS the frame.
        if (probeMode === 'solo') {
          nextTerrain.visible = false;
          if (nextSkirt) nextSkirt.visible = false;
        }
        host.canvas.dataset.terrain3dPilotFarGroundProbe =
          `${probeMode}:panorama=${painted.panorama},apron=${painted.apron},terrain=${painted.terrain}`;
      }
      host.canvas.dataset.terrain3dPilotPanoramaFraming = 'world-projected-horizon';
      // Keep the original probe values until the registry contract is migrated.
      host.canvas.dataset.terrain3dPilotSkirtBlend = 'painted-underlay-alpha-rim';
      host.canvas.dataset.terrain3dPilotPanoramaFog = 'excluded';
      host.canvas.dataset.terrain3dPilotPanoramaDepth = 'screen-horizon-backdrop';
      const mounts = (selected.contract.landmarkMounts ?? []).filter((mount) => mount.asset);
      host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);
      const assets = new Map<string, Promise<THREE.Object3D | undefined>>();
      const diagnostics: string[] = [];
      const nextLandmarks = new THREE.Group();
      nextLandmarks.name = 'Terrain3dLandmarks';
      nextLandmarks.userData.renderOnly = true;
      const loadMount = async (mount: LandmarkMount): Promise<THREE.Object3D | undefined> => {
        try {
          const key = `../../assets/pilots/map-rebuild-spike/${mount.asset}`;
          const resolveUrl = LANDMARK_ASSETS[key];
          if (!resolveUrl) {
            diagnostics.push(`${mount.id}: asset unavailable`);
            return undefined;
          }
          let asset = assets.get(key);
          if (!asset) {
            asset = resolveUrl().then((url) => loader.loadAsync(url).then((gltf) => gltf.scene, () => undefined), () => undefined);
            assets.set(key, asset);
          }
          const source = await asset;
          if (!source) {
            diagnostics.push(`${mount.id}: asset invalid`);
            return undefined;
          }
          const model = source;
          model.name = mount.id;
          model.userData.landmarkAsset = key;
          model.userData.renderOnly = true;
          model.position.set(mount.position[0], heightAt(mount.position[0], mount.position[2]) + mount.position[1], mount.position[2]);
          model.rotation.set(...mount.rotation);
          model.scale.fromArray(mount.scale);
          inspect(model, false);
          if (host.contractId !== 'e1-night-shift') {
            const live = LIVE_SPRING_POND_CONTRACTS.has(host.contractId) && mount.id === 'isolated_spring';
            const contractIntensity = LANDMARK_EMISSIVE[host.contractId];
            const paint = live
              ? { intensity: DRY_GULCH_SPRING_EMISSIVE, tint: DEFAULT_LANDMARK_PAINT.tint }
              : (LANDMARK_PAINT[host.contractId]?.[mount.id]
                ?? (contractIntensity !== undefined ? { intensity: contractIntensity, tint: DEFAULT_LANDMARK_PAINT.tint } : DEFAULT_LANDMARK_PAINT));
            keepLandmarkPaintReadable(model, paint);
          }
          if (host.contractId === 'e1-baron' && BARON_SWAY_AMPLITUDE[mount.id] !== undefined) {
            installBannerSway(model, BARON_SWAY_AMPLITUDE[mount.id]!);
          }
          dressLandmark(model, host.contractId, mount.id);
          return model;
        } catch {
          diagnostics.push(`${mount.id}: asset invalid`);
          return undefined;
        }
      };
      void Promise.all(mounts.map(loadMount)).then((models) => {
        for (const model of models) if (model) nextLandmarks.add(model);
        if (disposed) {
          disposeObject3D(nextLandmarks);
          host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'disposed';
          return;
        }
        landmarks = nextLandmarks;
        host.scene.add(nextLandmarks);
        try {
          landmarkContacts = mountLandmarkContacts(
            host,
            nextLandmarks.children.map((model) => ({ id: model.name, model })),
            heightAt,
            sculptWater?.mesh.position.y,
            terrainMetrics.bounds,
          );
        } catch (error) {
          host.canvas.dataset.terrain3dPilotContactShadows = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          waterCollars = mountWaterCollars(
            host,
            nextLandmarks.children.map((model) => ({ id: model.name, model })),
            sculptWater?.mesh.position.y,
          );
        } catch (error) {
          host.canvas.dataset.terrain3dPilotWaterCollars = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          spanShadow = mountSpanShadow(
            host,
            nextLandmarks.children.map((model) => ({ id: model.name, model })),
            sculptWater?.mesh.position.y,
          );
        } catch (error) {
          host.canvas.dataset.terrain3dPilotSpanShadow = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          rushEmbers = mountRushEmbers(
            host,
            nextLandmarks.children.map((model) => ({ id: model.name, model })),
            heightAt,
          );
        } catch (error) {
          host.canvas.dataset.terrain3dPilotRushEmbers = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          steamPlume = mountSteamPlume(host, nextLandmarks.children.map((model) => ({ id: model.name, model })));
        } catch (error) {
          host.canvas.dataset.terrain3dPilotSteam = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          steamWisps = mountSteamWisps(host, nextLandmarks.children.map((model) => ({ id: model.name, model })));
        } catch (error) {
          host.canvas.dataset.terrain3dPilotSteamWisps = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        try {
          haulSteam = mountHaulSteam(
            host,
            heightAt,
            nextLandmarks.children.map((model) => ({ id: model.name, model })),
          );
        } catch (error) {
          host.canvas.dataset.terrain3dPilotHaulSteam = `failed:${error instanceof Error ? error.message : 'unknown'}`;
        }
        host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'mounted';
        host.canvas.dataset.terrain3dPilotLandmarkEmissive = String(LANDMARK_EMISSIVE[host.contractId] ?? LANDMARK_EMISSIVE_DEFAULT);
        host.canvas.dataset.terrain3dPilotLandmarks = String(nextLandmarks.children.length);
        host.canvas.dataset.terrain3dPilotLandmarkSkipped = String(diagnostics.length);
        host.canvas.dataset.terrain3dPilotLandmarkDiagnostics = diagnostics.join('; ');
        host.canvas.dataset.terrain3dPilotLandmarkMounts = JSON.stringify(nextLandmarks.children.map((model) => ({
          id: model.name,
          x: model.position.x,
          y: model.position.y,
          z: model.position.z,
        })));
        host.canvas.dataset.terrain3dPilotLandmarkMaterials = JSON.stringify(nextLandmarks.children.map((model) => {
          const materials = new Set<THREE.Material>();
          model.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
          });
          // emissiveIntensity is PUBLISHED, not inferred from the table, because the paint is
          // applied by traversal after the body loads and a later pass can silently overwrite it —
          // which is exactly the defect F-BHM-1 found here (two keepLandmarkPaintReadable calls, the
          // second one resetting every per-contract intensity back to the default). A table lookup
          // in the dataset would have kept reporting the intended number while the map rendered the
          // other one.
          const standard = [...materials].filter((material): material is THREE.MeshStandardMaterial =>
            (material as THREE.MeshStandardMaterial).isMeshStandardMaterial);
          const intensities = standard.map((material) => +material.emissiveIntensity.toFixed(3));
          return {
            id: model.name,
            total: materials.size,
            transparent: [...materials].filter((material) => material.transparent).length,
            depthWriteDisabled: [...materials].filter((material) => !material.depthWrite).length,
            emissiveIntensity: intensities.length ? [Math.min(...intensities), Math.max(...intensities)] : [],
          };
        }));
        publish(host.canvas, 'ready', 'glb', terrainMetrics, nextPanorama, panoramaMetrics);
      });
    } catch (error) {
      disposeObject3D(nextTerrain);
      disposeObject3D(nextPanorama);
      for (const pond of nextPonds) pond.dispose();
      nextPonds = [];
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      if (!disposed) publish(host.canvas, 'failed', 'painted', terrainMetrics, undefined, panoramaMetrics, `pilot-install-failed:${error instanceof Error ? error.message : 'unknown'}`);
    }
  };
  const receive = (kind: 'terrain' | 'panorama', model: THREE.Object3D) => {
    if (disposed || loadFailed) {
      disposeObject3D(model);
      host.canvas.dataset[kind === 'terrain' ? 'terrain3dPilotTerrainLoadState' : 'terrain3dPilotPanoramaLoadState'] = 'disposed';
      return;
    }
    if (kind === 'terrain') loadedTerrain = model;
    else loadedPanorama = model;
    host.canvas.dataset[kind === 'terrain' ? 'terrain3dPilotTerrainLoadState' : 'terrain3dPilotPanoramaLoadState'] = 'loaded';
    installLoaded();
  };
  void loader.loadAsync(selected.terrainUrl).then((gltf) => receive('terrain', gltf.scene), failLoad);
  void loader.loadAsync(selected.panoramaUrl).then((gltf) => receive('panorama', gltf.scene), failLoad);

  return () => {
    disposed = true;
    host.canvas.removeEventListener('webglcontextlost', onContextLost);
    disposeLoaded();
    uninstallHeightSource?.();
    uninstallHeightSource = undefined;
    for (const { object, visible } of hiddenRelief) object.visible = visible;
    hiddenRelief = [];
    if (skirt) {
      host.scene.remove(skirt);
      disposeObject3D(skirt);
      skirt = undefined;
    }
    if (sculptWater) {
      host.scene.remove(sculptWater.mesh);
      sculptWater.dispose();
      sculptWater = undefined;
      delete host.canvas.dataset.terrain3dPilotSculptWater;
      delete host.canvas.dataset.terrain3dPilotSculptWaterHalfWidth;
    }
    if (rushEmbers) {
      host.scene.remove(rushEmbers.points);
      rushEmbers.dispose();
      rushEmbers = undefined;
      delete host.canvas.dataset.terrain3dPilotRushEmbers;
    }
    if (sunMotes) {
      host.scene.remove(sunMotes.points);
      sunMotes.dispose();
      sunMotes = undefined;
      delete host.canvas.dataset.terrain3dPilotMotes;
    }
    if (steamPlume) {
      host.scene.remove(steamPlume.points);
      steamPlume.dispose();
      steamPlume = undefined;
      delete host.canvas.dataset.terrain3dPilotSteam;
      delete host.canvas.dataset.terrain3dPilotSteamAnchors;
    }
    for (const wisps of steamWisps) {
      host.scene.remove(wisps.points);
      wisps.dispose();
    }
    if (steamWisps.length) {
      steamWisps = [];
      delete host.canvas.dataset.terrain3dPilotSteamWisps;
    }
    if (haulSteam) {
      host.scene.remove(haulSteam.group);
      haulSteam.dispose();
      haulSteam = undefined;
      delete host.canvas.dataset.terrain3dPilotHaulSteam;
      delete host.canvas.dataset.terrain3dPilotHaulSteamCapacity;
      delete host.canvas.dataset.terrain3dPilotHaulSteamActive;
      delete host.canvas.dataset.terrain3dPilotHaulSteamSpawned;
      delete host.canvas.dataset.terrain3dPilotHaulSteamDetail;
    }
    if (landmarkContacts) {
      host.scene.remove(landmarkContacts);
      disposeObject3D(landmarkContacts);
      landmarkContacts = undefined;
      delete host.canvas.dataset.terrain3dPilotContactShadows;
    }
    if (waterCollars) {
      host.scene.remove(waterCollars);
      disposeObject3D(waterCollars);
      waterCollars = undefined;
      delete host.canvas.dataset.terrain3dPilotWaterCollars;
    }
    if (spanShadow) {
      host.scene.remove(spanShadow);
      disposeObject3D(spanShadow);
      spanShadow = undefined;
      delete host.canvas.dataset.terrain3dPilotSpanShadow;
    }
    if (crossingBreath) {
      crossingBreath.dispose();
      crossingBreath = undefined;
      delete host.canvas.dataset.terrain3dPilotGorgeWisps;
      delete host.canvas.dataset.terrain3dPilotSteam;
    }
    for (const pond of ponds) {
      host.scene.remove(pond.group);
      pond.dispose();
    }
    ponds = [];
    delete host.canvas.dataset.terrain3dPilotSpringPondWaterRadii;
    delete host.canvas.dataset.terrain3dPilotSpringPondDampGroundRadii;
    for (const pond of nextPonds) pond.dispose();
    nextPonds = [];
    for (const model of [terrain, panorama, landmarks, channelWater]) {
      if (!model) continue;
      host.scene.remove(model);
      disposeObject3D(model);
    }
    terrain = undefined;
    panorama = undefined;
    landmarks = undefined;
    channelWater = undefined;
    delete host.canvas.dataset.terrain3dPilotChannelWaterHalfWidths;
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'disposed';
  };
}


type LandmarkPaint = { intensity: number; tint: string };


/**
 * Per-contract landmark paint. The default — self-lit 3x off the body's own
 * albedo, tinted white — is what keeps every landmark on every map readable
 * under the day rig, and it stays the default for all of them.
 *
 * e1-baron is the one map that needs a SIDE. The finale is a duel between a warm
 * home bank and a cold company one (docs/beauty/e1-baron-brief.md U2), and the
 * fort bodies were reading as the same warm ochre timber as the player's own
 * gear. Turning their readability down and their hue toward wet iron makes the
 * far bank loom instead of blend — while the oxblood banners keep an ember lift,
 * because his brand is the one warm thing allowed on that side. The floor here
 * is deliberate: the brief's own warning is "MENACE, not invisibility", so no
 * body drops below 1.5 and the silhouette edges stay lit.
 */
const LANDMARK_PAINT: Record<string, Record<string, LandmarkPaint>> = {
  'e2-trestle': { 'south-boiler-site': { intensity: 1.45, tint: '#d6cfc4' }, 'north-boiler-site': { intensity: 1.45, tint: '#d3ccc4' }, 'mine-spur-kit': { intensity: 1.3, tint: '#e6d6bc' }, },
  'e2-pressure-garden': { 'garden-pressure-manifold': { intensity: 1.3, tint: '#efe0d2' }, 'water-band-pump-station': { intensity: 1.3, tint: '#efe0d2' }, },
  'e2-incline': { 'upper-ore-cable-house': { intensity: 1.5, tint: '#c2a48c' }, 'west-line-brake-tower': { intensity: 1.28, tint: '#b3a693' }, 'east-line-brake-tower': { intensity: 1.28, tint: '#b3a693' }, },
  'e1-baron': {
    fortified_far_bank: { intensity: 1.7, tint: '#93a0aa' },
    siege_line: { intensity: 1.9, tint: '#9ba5ab' },
    seized_headframe: { intensity: 2.1, tint: '#a9a9a6' },
    oxblood_banners: { intensity: 3.4, tint: '#ffd2b4' },
  },
  // THE ROOF THAT SHOUTS (docs/beauty/e2-hill-mine-brief.md U3). Measured at the run camera, the
  // boiler-house roof is the loudest pixel field on the map: mean rgb 139,38,15 over the roof
  // window, warmth (R-B) 124 where the whole rest of the frame lives between 10 and 97. That is the
  // baron's "circus tents" disease, and it is a paint problem, not a body problem — the pack must
  // not be rebuilt (F-BTB-1 class), so this is tuned through the per-contract paint argument.
  //
  // A colour multiply can only ever take light away, so it cannot repaint crimson as iron. What it
  // CAN do is take the red channel down harder than the other two, which is what turns a signal red
  // into an oxide: the tint's blue is above its red for the same reason the baron's fort tint is.
  // The intensity does the rest of the work — at 3 the colour map is its own light source, so the
  // roof is emitting rather than being lit, and the low sun models nothing on it.
  'e2-hill-mine': { 'boiler-house-site': { intensity: 2, tint: '#9aa6a6' }, },
};


const DEFAULT_LANDMARK_PAINT: LandmarkPaint = { intensity: 3, tint: '#ffffff' };


/**
 * U4 — banners in the wind. The Baron's claim-jumping company brand reads in the
 * HUD every time he taunts, and hung dead in the world. This is a vertex-shader
 * sway: no new draws, no new geometry, no CPU per-frame work beyond one uniform.
 *
 * The displacement is gated on the vertex's own HEIGHT, so poles stay planted in
 * the ground and only cloth moves, and its phase comes from the vertex's own X —
 * which means the six banners strung along one 29 m body each breathe on their
 * own beat without a single per-instance attribute.
 *
 * Amplitudes are per-mount: the banner line gets a real flap, the siege line gets
 * a third of it (its geometry is mostly stakes, and a swaying palisade would read
 * as a bug rather than as weather).
 */
const BARON_SWAY_AMPLITUDE: Record<string, number> = { oxblood_banners: 0.185, siege_line: 0.06 };


const BARON_SWAY_FLOOR = 2.2;


const baronSwayTime = { value: 0 };


function installBannerSway(model: THREE.Object3D, amplitude: number): void {
  model.traverse((node) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.Material>;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const material = mesh.material;
    if (material.userData.baronSwayAmplitude === amplitude) return;
    material.userData.baronSwayAmplitude = amplitude;
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.uBaronSwayTime = baronSwayTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uBaronSwayTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
float baronSwayLift = clamp((position.y - ${BARON_SWAY_FLOOR.toFixed(2)}) / 3.2, 0.0, 1.0);
baronSwayLift *= baronSwayLift;
float baronSwayPhase = position.x * 0.55;
float baronSway = sin(uBaronSwayTime * 1.7 + baronSwayPhase) * 0.72 + sin(uBaronSwayTime * 2.9 + baronSwayPhase * 1.9 + 1.3) * 0.28;
transformed.x += baronSway * baronSwayLift * ${amplitude.toFixed(3)};
transformed.z += sin(uBaronSwayTime * 1.31 + baronSwayPhase * 0.7) * baronSwayLift * ${(amplitude * 0.45).toFixed(3)};
transformed.y -= abs(baronSway) * baronSwayLift * ${(amplitude * 0.16).toFixed(3)};`,
        );
    };
    // Two banner bodies must not share one compiled program, or the second one
    // silently inherits the first one's amplitude (Water.ts:82 pattern).
    material.customProgramCacheKey = () => `baron-sway:${amplitude}`;
    material.needsUpdate = true;
    // Frustum culling stays ON: the displacement is <=0.185 on a 29 m body, far
    // inside its bounding sphere, so disabling it would only buy draws when the
    // banners are off-screen.
    mesh.onBeforeRender = () => {
      baronSwayTime.value = performance.now() * 0.001;
    };
  });
}
