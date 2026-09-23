import { installArchiveRestoration, type ArchiveRestorationState } from './ArchiveRestoration';
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
import farSideContractText from '../../assets/pilots/map-rebuild-spike/far-side-terrain-contract.json?raw';
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
import relayRushContractText from '../../assets/pilots/map-rebuild-spike/relay-rush-terrain-contract.json?raw';
import deadBandContractText from '../../assets/pilots/map-rebuild-spike/dead-band-terrain-contract.json?raw';
import picnicContractText from '../../assets/pilots/map-rebuild-spike/picnic-terrain-contract.json?raw';
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
import { createLandmarkWalkSurfaces, type LandmarkWalkSurface } from './LandmarkWalkSurfaces';
import { createSpringPondSurface, type SpringPondSurface } from './Water';
import { createFordSheet, createWaterConfluence, createWaterRibbon, updateWaterMaterial } from './Water';
import type { ContractManifest } from '../meta/ContractFamilies';

import lastClaimContractText from '../../assets/pilots/map-rebuild-spike/last-claim-terrain-contract.json?raw';
import lastClaimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/last-claim-panorama-contract.json?raw';
import riverContractText from '../../assets/pilots/map-rebuild-spike/river-terrain-contract.json?raw';
import riverPanoramaContractText from '../../assets/pilots/map-rebuild-spike/river-panorama-contract.json?raw';

type MotorGroundTruth = Pick<ContractManifest['tileParams'], 'dimensions' | 'roadCorridors' | 'tarSeams' | 'orbitSpawn'>;
type PaintRoutePoint = { x: number; z: number };
type PaintZone = { minX: number; maxX: number; minZ: number; maxZ: number };

type Contract = {
  tileId: string;
  vertices: number;
  triangles: number;
  meshCount: number;
  materialCount: number;
  boundsMeters: { min: [number, number, number]; max: [number, number, number] };
  panoramaMount: Mount;
  landmarkMounts?: LandmarkMount[];
  maskTruth?: MotorGroundTruth & {
    canalRoute?: { points: PaintRoutePoint[] };
    inheritedCanalRoute?: { points: PaintRoutePoint[] };
    caravanRoute?: PaintRoutePoint[];
    permanentGreenWaypointZones?: PaintZone[];
    waterMask?: { id: string; regions: MaskRegion[] };
  };
  maskAgreement?: { waterPlaneY?: number };
  waterSurface?: { owner: string; includedInTerrainGLB: boolean };
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
type PanoramaContract = Pick<Contract, 'vertices' | 'triangles' | 'meshCount' | 'materialCount'> & { renderOnly: boolean; projection?: { skyRingRadiusMeters?: number } };
type Mount = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  renderOnly: boolean;
};
type LandmarkMount = Omit<Mount, 'renderOnly'> & { asset?: string; contractIds?: string[]; walkSurfaces?: LandmarkWalkSurface[] };
type Entry = { terrainUrl: string; panoramaUrl: string; contract: Contract; panoramaContract: PanoramaContract; detailTextureUrl?: string };
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
  archiveRestoration?: () => ArchiveRestorationState | null;
  onVisualHeightSourceInstalled?: () => void;
};
type Metrics = { meshes: number; triangles: number; materials: number; vertices: number; bounds: THREE.Box3 };
type HiddenRelief = { object: THREE.Object3D; visible: boolean };

const entry = (terrainUrl: string, panoramaUrl: string, contractText: string, panoramaContractText: string, dressingText?: string, detailTextureUrl?: string): Entry => {
  const contract = JSON.parse(contractText) as Contract;
  // Variant dressing supplements the base bodies; the existing mount filter and transforms apply.
  if (dressingText) contract.landmarkMounts = [...(contract.landmarkMounts ?? []), ...((JSON.parse(dressingText) as Contract).landmarkMounts ?? [])];
  return { terrainUrl, panoramaUrl, contract, panoramaContract: JSON.parse(panoramaContractText) as PanoramaContract, detailTextureUrl };
};
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
  'e10-ember-shore': entry(new URL('../../assets/pilots/map-rebuild-spike/ember-shore-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/ember-shore-panorama.glb', import.meta.url).href, emberShoreContractText, emberShorePanoramaContractText, undefined, new URL('../../assets/pilots/map-rebuild-spike/sources/ember-shore-fidelity-1/engraved-basalt.png', import.meta.url).href),
  'e2-pressure-garden': entry(new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-panorama.glb', import.meta.url).href, pressureGardenContractText, pressureGardenPanoramaContractText, undefined, new URL('../../assets/pilots/map-rebuild-spike/sources/e2-pressure-garden-fidelity-2/engraved-river-gravel.png', import.meta.url).href),
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
  // Picnic retains the Glow Mesa sculpt and collision-backed bodies, adding its nonblocking dressing.
  'e6-picnic': entry(new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb', import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText, picnicContractText),
  'e7-echo-canyon': entry(new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-panorama.glb', import.meta.url).href, echoCanyonContractText, echoCanyonPanoramaContractText),
  // Relay Valley aliases: both signal variants reuse its terrain and panorama.
  'e7-dead-band': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, deadBandContractText),
  'e7-relay-rush': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, relayRushContractText),
  // Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt.
  'e8-far-side': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText, farSideContractText),
  'e8-low-orbit': entry(new URL('../../assets/pilots/map-rebuild-spike/low-orbit-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/low-orbit-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(lowOrbitContractText), boundsMeters: { min: [-64, -64, -5.869689], max: [64, 64, 1.08] } }), lowOrbitPanoramaContractText),
  'e8-eclipse': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e9-seed-run': entry(new URL('../../assets/pilots/map-rebuild-spike/seed-run-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/seed-run-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(seedRunContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 3.715142] } }), seedRunPanoramaContractText),
  'e9-devils-alley': entry(new URL('../../assets/pilots/map-rebuild-spike/devils-alley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/devils-alley-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(devilsAlleyContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 4.567115] } }), devilsAlleyPanoramaContractText),
  'e9-old-canal': entry(new URL('../../assets/pilots/map-rebuild-spike/old-canal-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/old-canal-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(oldCanalContractText), boundsMeters: { min: [-64, -64, -1.42], max: [64, 64, 2.906317] } }), oldCanalPanoramaContractText),
  'e10-archive-world': entry(new URL('../../assets/pilots/map-rebuild-spike/archive-world-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/archive-world-panorama.glb', import.meta.url).href, archiveWorldContractText, archiveWorldPanoramaContractText, undefined, new URL('../../assets/pilots/map-rebuild-spike/sources/archive-world-fidelity-1/engraved-masonry.png', import.meta.url).href),
  'e10-last-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/last-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/last-claim-panorama.glb', import.meta.url).href, lastClaimContractText, lastClaimPanoramaContractText),
  'e10-river': entry(new URL('../../assets/pilots/map-rebuild-spike/river-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/river-panorama.glb', import.meta.url).href, riverContractText, riverPanoramaContractText),
  }),
};
const LANDMARK_ASSETS = import.meta.glob([
  '../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb',
  // Share the town variant pattern so the E1 release plugin narrows both consumers.
  '../../assets/pilots/*-3d/*.e*.glb',
], { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;

function landmarkAssetKey(asset: string): string {
  return asset.startsWith('assets/') ? `../../${asset}` : `../../assets/pilots/map-rebuild-spike/${asset}`;
}

function landmarkMountsFor(contract: Contract, contractId: string): LandmarkMount[] {
  return (contract.landmarkMounts ?? []).filter(mount => mount.asset && (!mount.contractIds || mount.contractIds.includes(contractId)));
}

export async function contractPrefetchUrls(contractId: string): Promise<string[]> {
  const selected = REGISTRY[contractId];
  if (!selected) return [];
  const landmarks = await Promise.all(
    landmarkMountsFor(selected.contract, contractId)
      .flatMap(({ asset }) => asset ? [LANDMARK_ASSETS[landmarkAssetKey(asset)]] : [])
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
    | { kind: 'below-gorge-floor'; quantile: number; drop: number }
    | { kind: 'sea-level'; y: number };
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
   * claim's sluice line); explicit lists use world X and Z offsets from the river center.
   */
  glints: 'harvest' | Array<{ x: number; z: number }>;
  rippleStrength?: number;
  rippleScale?: number;
  depthContrast?: number;
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
  // Keep the measured dark channel and ford shelf; cool water separates from the warm banks.
  // The Claim concept comparison is recorded in artifacts/map-art-repairs-20260908/claim-water-01/.
  'the-claim': {
    surface: { kind: 'channel-fill', fill: 0.42 },
    color: '#99bec7',
    emissive: '#10272c',
    opacity: 0.8,
    // The carved channel runs ~0.45m below the water line at its deepest; the last
    // ~15cm of depth is the damp margin where the surface fades into wet ground.
    fordSkim: 0.11,
    deepMeters: 0.5,
    shoreMeters: 0.15,
    glints: 'harvest',
  },
  // Night Shift's channel used only its dark bed paint. Keep the sculpt and the
  // declared ford; a restrained, sun-lit surface supplies moving water detail.
  // No emission: the unlit river must still become dark during the night phase.
  'e1-night-shift': {
    surface: { kind: 'channel-fill', fill: 0.42 }, color: '#899b9b', opacity: 0.64,
    fordSkim: 0.08, deepMeters: 0.5, shoreMeters: 0.15,
    glints: [], rippleStrength: 0.32, textureBlend: 0.06, fordTint: 0.3,
  },
  // The sculpt hides legacy water. This is the one visible surface, contained
  // by the existing bed and ford, with no extra light or simulation authority.
  'e1-baron': {
    surface: { kind: 'channel-fill', fill: 0.42 }, color: '#849da1', opacity: 0.62,
    fordSkim: 0.06, deepMeters: 0.5, shoreMeters: 0.15, visualHalfWidth: 6.25,
    glints: [], rippleStrength: 0.6, textureBlend: 0.07, fordTint: 0.35,
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
  'e2-pressure-garden': { surface: { kind: 'channel-fill', fill: 0.11 }, color: '#a2c8d9', opacity: 0.99, fordSkim: 0.11, deepMeters: 0.5, shoreMeters: 0.15, bed: false, visualHalfWidth: 6.25, glints: [{ x: -30, z: 4.45 }, { x: -12, z: 4.45 }, { x: 12, z: 4.45 }, { x: 30, z: 4.45 }], rippleStrength: 0.4, rippleScale: 1.6, depthContrast: 0.35, textureBlend: 0, fordTint: 0.25, shoreFadeMeters: 1, surfaceLift: true, overhangMeters: 10, collars: [{ mount: 'garden-pressure-manifold', radius: 2.9 }, { mount: 'water-band-pump-station', radius: 2.6 }], },
  'e2-incline': { surface: { kind: 'channel-fill', fill: 0.42 }, color: '#bb9366', opacity: 0.62, fordSkim: 0.125, deepMeters: 0.145, shoreMeters: 0.07, visualHalfWidth: 6.25, glints: [{ x: -30, z: 4.45 }, { x: 30, z: -4.45 }], rippleStrength: 0.6, textureBlend: 0.2, },
};
/** The E5 contracts reserve their sea for runtime; the sculpt supplies the visible bed. */
const DEEPWATER_SEA_DRESSING: SculptWaterDressing = {
  surface: { kind: 'sea-level', y: 0 }, color: '#99bec7', opacity: 0.56,
  fordSkim: 0, deepMeters: 8, shoreMeters: 0.5, glints: [],
  rippleStrength: 0.15, textureBlend: 0.10, fordTint: 0, shoreFadeMeters: 4, surfaceLift: false,
  emissive: '#0a2a33',
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

/**
 * The height the player's feet stand on has to be the height the player SEES. The mesh
 * draws two triangles per grid cell across one diagonal; a bilinear lerp over the cell's
 * four corners is a different, curved surface, and the two disagree by up to 0.6667 units
 * on the Mare's abrupt relief (F-ASTRA-10, its own centroid sweep of the four terrains:
 * Claim 0.0253 / Twin Banks 0.0230 / Hill Mine 0.1033 / Mare 0.6667). That gap is exactly
 * where feet float or sink.
 *
 * So the diagonal is BAKED OUT OF THE INDEX BUFFER, per cell, never assumed: whichever way
 * the exporter split a cell, the sample lands on the plane of the triangle the point falls
 * in, and the sampled height equals the drawn surface everywhere. Still O(1) per sample and
 * one extra byte per cell.
 *
 * Render-side only (CLAUDE.md §4.6): the simulation stays planar and never reads this.
 */
export function bakeHeightGrid(model: THREE.Object3D, metrics: Metrics): (x: number, z: number) => number {
  const mesh = model.getObjectByProperty('isMesh', true) as THREE.Mesh;
  const position = mesh.geometry.getAttribute('position');
  const segments = Math.round(Math.sqrt(position.count)) - 1;
  const width = segments + 1;
  const stepX = (metrics.bounds.max.x - metrics.bounds.min.x) / segments;
  const stepZ = (metrics.bounds.max.z - metrics.bounds.min.z) / segments;
  const heights = new Float32Array(width * width);
  const seen = new Uint8Array(heights.length);
  const columns = new Int32Array(position.count);
  const rows = new Int32Array(position.count);
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
    columns[index] = column;
    rows[index] = row;
  }
  if (seen.some((value) => value !== 1)) throw new Error('incomplete terrain grid');
  // 0 = the cell is split (low,low)..(high,high); 1 = split (high,low)..(low,high).
  const diagonals = new Uint8Array(Math.max(segments * segments, 1));
  const drawn = new Uint8Array(diagonals.length);
  const indices = mesh.geometry.index;
  const triangleCount = Math.floor((indices?.count ?? position.count) / 3);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const a = indices ? indices.getX(triangle * 3) : triangle * 3;
    const b = indices ? indices.getX(triangle * 3 + 1) : triangle * 3 + 1;
    const c = indices ? indices.getX(triangle * 3 + 2) : triangle * 3 + 2;
    const columnA = columns[a]!, columnB = columns[b]!, columnC = columns[c]!;
    const rowA = rows[a]!, rowB = rows[b]!, rowC = rows[c]!;
    const column = Math.min(columnA, columnB, columnC);
    const row = Math.min(rowA, rowB, rowC);
    if (Math.max(columnA, columnB, columnC) - column !== 1 || Math.max(rowA, rowB, rowC) - row !== 1) {
      throw new Error('invalid terrain topology');
    }
    // Corner bits: 1 = (low,low), 2 = (high,low), 4 = (low,high), 8 = (high,high). A half-cell
    // triangle covers exactly three of them, and the missing one names the diagonal.
    const mask = (1 << ((rowA - row) * 2 + columnA - column))
      | (1 << ((rowB - row) * 2 + columnB - column))
      | (1 << ((rowC - row) * 2 + columnC - column));
    const diagonal = mask === 0b1011 || mask === 0b1101 ? 0 : mask === 0b1110 || mask === 0b0111 ? 1 : -1;
    const cell = row * segments + column;
    if (diagonal < 0 || (drawn[cell] && diagonals[cell] !== diagonal)) throw new Error('invalid terrain topology');
    diagonals[cell] = diagonal;
    drawn[cell]! += 1;
  }
  if (segments > 0 && drawn.some((value) => value !== 2)) throw new Error('incomplete terrain topology');
  const lastCell = Math.max(segments - 1, 0);
  return (x, z) => {
    const gx = THREE.MathUtils.clamp((x - metrics.bounds.min.x) / stepX, 0, segments);
    const gz = THREE.MathUtils.clamp((z - metrics.bounds.min.z) / stepZ, 0, segments);
    const x0 = Math.min(Math.floor(gx), lastCell);
    const z0 = Math.min(Math.floor(gz), lastCell);
    const x1 = Math.min(x0 + 1, segments);
    const z1 = Math.min(z0 + 1, segments);
    const fx = gx - x0;
    const fz = gz - z0;
    const low = heights[z0 * width + x0]!;
    const east = heights[z0 * width + x1]!;
    const south = heights[z1 * width + x0]!;
    const high = heights[z1 * width + x1]!;
    // Each branch is the plane through one drawn triangle's three corners, so the sample sits
    // on the rendered surface rather than near it.
    if (diagonals[z0 * segments + x0] === 0) {
      return fz <= fx ? low + (east - low) * fx + (high - east) * fz : low + (high - south) * fx + (south - low) * fz;
    }
    return fx + fz <= 1 ? low + (east - low) * fx + (south - low) * fz : high + (high - south) * (fx - 1) + (high - east) * (fz - 1);
  };
}

/** The submerged panorama apron uses the bed's world-scale atlas and lighting. */
function routeSeaApron(terrain: THREE.Object3D, panorama: THREE.Object3D, bounds: THREE.Box3): number {
  let source: THREE.MeshStandardMaterial | undefined;
  terrain.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh && !Array.isArray(mesh.material) && (mesh.material as THREE.MeshStandardMaterial).map) {
      source = mesh.material as THREE.MeshStandardMaterial;
    }
  });
  if (!source?.map) return 0;
  let triangles = 0;
  panorama.traverse(object => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position'), uv = geometry.getAttribute('uv');
    if (!geometry.index || !position || !uv) return;
    const bed: number[] = [], sky: number[] = [], foreground: number[] = [], bedVertices = new Set<number>();
    for (let i = 0; i < geometry.index.count; i += 3) {
      const face = [geometry.index.getX(i), geometry.index.getX(i+1), geometry.index.getX(i+2)];
      // The factory's sea skirt occupies UV rows .84–.972 after the glTF V flip, wholly below sea level.
      // Sky/ridge faces retain the authored panorama material and UVs.
      const isBed = face.every(v => position.getY(v) < 0 && uv.getY(v) >= .83999 && uv.getY(v) <= .97201);
      // The factory appends wreck silhouettes after the contiguous apron faces.
      // Keep them in a later draw: opaque material sorting would otherwise draw
      // the new bed material over masts at the panorama's shared far-plane depth.
      (isBed ? bed : bed.length ? foreground : sky).push(...face);
      if (isBed) face.forEach(v => bedVertices.add(v));
    }
    if (!bed.length) return;
    const routed = geometry.clone();
    const routedUv = routed.getAttribute('uv');
    for (const v of bedVertices) routedUv.setXY(v,
      (position.getX(v)-bounds.min.x)/(bounds.max.x-bounds.min.x),
      (bounds.max.z-position.getZ(v))/(bounds.max.z-bounds.min.z));
    routedUv.needsUpdate = true;
    routed.setIndex([...sky,...bed]);
    routed.clearGroups(); routed.addGroup(0,sky.length,0); routed.addGroup(sky.length,bed.length,1);
    const material = source!.clone();
    material.map = source!.map!.clone();
    material.map.wrapS = material.map.wrapT = THREE.MirroredRepeatWrapping;
    material.map.needsUpdate = true;
    material.depthWrite = false;
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;');
    };
    material.customProgramCacheKey = () => 'sea-bed-apron-v1';
    mesh.material = [mesh.material,material];
    mesh.geometry = routed;
    if (foreground.length) {
      const foregroundGeometry = geometry.clone();
      foregroundGeometry.setIndex(foreground);
      foregroundGeometry.clearGroups();
      const silhouettes = new THREE.Mesh(foregroundGeometry, mesh.material[0]);
      silhouettes.name = 'SeaPanoramaSilhouettes';
      silhouettes.userData.seaPanoramaForeground = true;
      silhouettes.frustumCulled = false;
      silhouettes.renderOrder = mesh.renderOrder + 0.01;
      mesh.add(silhouettes);
    }
    geometry.dispose();
    triangles += bed.length/3;
  });
  return triangles;
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
/**
 * `e3-blackout-ridge` is graded ABOVE the legacy default — the only row that is — because it is a
 * night-LOCKED map whose ground gives its bodies nothing, and F-OMB-4 left it at the calibrated
 * default after the atlas rebuild cured most of Astra's "dark machinery". Measured on the reference
 * rig (`landmark-brightness.spec.ts`, desktop, focus `ridge-switch-house`, 2026-09-18), landmark
 * median luminance against its own era sibling — `e3-fairground`, the other E3 night map, whose
 * atlas already carries the lifted V2 palette: fairground 0.1057, blackout ridge 0.0882 at the
 * default (-16.6 %). The `lmemissive` sweep on this map reads 0.12 -> 0.0529, 0.20 -> 0.0642,
 * 0.30 -> 0.0732, 0.45 -> 0.0882, 0.60 -> 0.1018, so the sibling's level wants ~0.62 and the hard
 * cap is 0.6: 4 grades to exactly the ceiling and lands the pair within 3.7 %. The cap, not this
 * number, is what stops the body becoming its own light source.
 */
// Measured signal-map body lifts use the same 0.6 ceiling; unlisted signal maps keep the default.
const LANDMARK_EMISSIVE: Record<string, number> = { 'the-claim': 1.45, 'e2-hill-mine': 1.45, 'e2-trestle': 1.5, 'e2-pressure-garden': 1.45, 'e2-incline': 1.45, 'e3-blackout-ridge': 4, 'e7-relay-valley': 4, 'e7-echo-canyon': 4 };

/**
 * F-ASTRA-9, THE CALIBRATION (2026-09-05, owner: "Ok, then lets have it fix these findings.").
 *
 * Astra measured the defect as a RELATIONSHIP, not a number: "Most daylight landmarks therefore
 * illuminate themselves while surrounding terrain responds to the sun." The numbers above are that
 * relationship written down — the atlas is routed into EMISSION, so at 3 a body emits roughly three
 * times its own albedo on top of whatever the sun gives it, and the low sun models nothing on it.
 *
 * The reference rig (`e2e/landmark-brightness.spec.ts`, "reference rig") measures the three
 * families that share this rig in one frame — terrain (no emissive, the reference), landmark, and
 * the unlit hero sprite (the ceiling). Measured on `dc74e3075`, desktop, landmark/terrain median
 * luminance:
 *
 *   Mare Claim (emissive 3)      4.72   <- the finding, quantified
 *   The Claim  (emissive 1.45)   1.04
 *   Hill Mine  (1.45 / roof 2)   0.72
 *   Night Shift (NEVER painted)  0.90   <- the control: what a body reads at when only the rig lights it
 *
 * Night Shift is the control because `loadMount` skips `keepLandmarkPaintReadable` on it entirely,
 * so its bodies have only the GLB's own emissive and answer the rig alone — and they sit slightly
 * BELOW the ground they stand on, which is what a lit body does. That is the shape this calibration
 * aims at: the whole-body emissive becomes a small INK LIFT that keeps the illustrated paint off
 * the floor, not the body's light source, with Astra's ceiling of 0.6 as a hard cap.
 *
 * THE NUMBER IS MEASURED, NOT CHOSEN — AND THE READABILITY FLOOR, NOT THE CEILING, SET IT. Sweeping
 * one forced intensity across every mount (the rig's `?lmemissive=` dial, desktop, same probes)
 * separates the two terms: the SUN's share of what the body renders at is the lit value at emissive
 * 0 over the value at the arm.
 *
 *   arm            0     0.20    0.30    0.45    0.60    legacy(3)
 *   Mare Claim   100%     63%     54%     46%     40%        18%   <- authored 3, the worst case
 *   The Claim    100%     68%     59%     52%     48%        37%
 *
 * By that measure alone 0.30 would win — the highest lift at which the sun is still the majority
 * contributor everywhere. IT WAS TRIED AND IT BROKE A READABILITY LAW. `e2e/map-census.spec.ts`
 * probes the first mount of all 43 contracts and fails under median luminance 0.06; a FULL 47-test
 * run at 0.30 dropped FOUR dark-bodied maps under it (e3-moth-season 0.044, e6-glow-mesa 0.051,
 * e6-picnic 0.054, e2-pressure-garden 0.053) while the same run on the pre-change tree was clean,
 * so the regression was this calibration's and not the board's. The bodies that break are the ones
 * whose atlas is already dark — moth season's watch gate renders 0.0445 with NO emissive at all,
 * against a 0.93 salt-flat ground — and a lift proportional to a global default gives the darkest
 * paint the least help, exactly where it is needed most.
 *
 * So the default is 0.45: a 6.7x cut from the legacy 3, under Astra's ceiling of 0.6, moving the
 * worst map from 18% sun to 46%, and keeping every daylight body under the unlit hero sprite in the
 * same frame — at emissive 3 the buildings out-shone her, which is the other way of saying a
 * painted building had stopped behaving like a lit object.
 *
 * AND FOR FOUR MAPS NO VALUE UNDER THE CEILING WORKS AT ALL. The full census at 0.45 reds the same
 * four; the rig's sweep says why — moth season's watch gate reads 0.0445 at emissive 0, 0.0512 at
 * 0.30, 0.0557 at 0.45 and 0.0588 at 0.60, so the whole legal range moves it by a hundredth and the
 * floor stays out of reach. Their paint, not their lighting, is the defect, and F-ASTRA-1 says the
 * same thing about these atlases ("large areas become nearly uniform grey or rust ... Restore
 * material and value separation"). Lighting cannot cure a dark atlas without becoming its light
 * source again, which IS the finding. So those contracts are EXEMPT and keep their authored lift
 * until their atlas is re-graded; the calibration lands on the other 39.
 *
 * THE TABLE ABOVE IS KEPT AS A RELATIVE GRADE. Three signed-off shifts tuned those numbers against
 * each other (the baron's cold fort under its warm banners, hill mine's shouting roof, the trestle
 * pair) and F-BHM-1 is the scar from silently resetting them. So the authored value is divided by
 * the legacy default to recover the grade the shift intended, and the grade is re-hung on the
 * calibrated default — the ORDER between mounts is preserved exactly, only the scale moves. The
 * TINT half of each of those shifts (`material.color.multiply(tint)`, the baron's wet iron, hill
 * mine's oxide roof) is untouched by this change and still does its work on the diffuse.
 */
const LANDMARK_EMISSIVE_WHOLE_BODY_MAX = 0.6;
/** The calibrated whole-body ink lift: what the legacy default of 3 becomes. */
const LANDMARK_EMISSIVE_CALIBRATED_DEFAULT = 0.45;
/**
 * The paint must not go to mud on a body whose shift graded it far down. Documented as a guard, not
 * as tuning: the lowest authored value in the table is 1.28, which lands at 0.192, so as of this
 * commit the floor binds on NOTHING. It exists so a future grade below ~0.8 cannot silently reach
 * zero and leave a body with no lift at all.
 */
const LANDMARK_EMISSIVE_WHOLE_BODY_MIN = 0.12;
/**
 * Emissive windows and teal systems keep their glow: those are UNLIT paint objects
 * (`dressLandmark`'s `MeshBasicMaterial` lamp quads, the night pools' shader term, the water
 * emissive), none of which route through this function — the cap below only ever touches a body
 * whose own diffuse atlas was being used as its light source.
 */
function calibratedLandmarkIntensity(authored: number): number {
  const dials = lightingDials();
  if (dials.mode === 'legacy') return authored;
  if (dials.emissive !== undefined) return dials.emissive;
  const grade = authored / LANDMARK_EMISSIVE_DEFAULT;
  const lift = LANDMARK_EMISSIVE_CALIBRATED_DEFAULT * grade;
  return +THREE.MathUtils.clamp(lift, LANDMARK_EMISSIVE_WHOLE_BODY_MIN, LANDMARK_EMISSIVE_WHOLE_BODY_MAX).toFixed(4);
}

/**
 * THE REFERENCE-RIG DIALS (harness, not gameplay). Every dial is ABSENT by default, so a plain boot
 * takes the calibrated path and no branch below runs. They exist because a look change the owner
 * judges has to be reversible in the browser he is holding, without a rebuild:
 *
 *   ?lighting=legacy   every landmark back to its authored self-lit emissive (the pre-2026-09-05
 *                      render) and back to DoubleSide — the A/B, and the shape of the REVERT
 *   ?lmemissive=<n>    force one whole-body emissive intensity on every mount (the sweep)
 *   ?lmcull=off        keep DoubleSide on verified-closed bodies (isolates the culling from the paint)
 *
 * Read from the live search string rather than cached at module load so a harness can navigate
 * between arms; the parse is once per body install, not per frame.
 */
type LightingDials = { mode: 'calibrated' | 'legacy'; emissive: number | undefined; cull: boolean };

function lightingDials(): LightingDials {
  if (typeof window === 'undefined') return { mode: 'calibrated', emissive: undefined, cull: true };
  const params = new URLSearchParams(window.location.search);
  const emissive = Number(params.get('lmemissive'));
  return {
    mode: params.get('lighting') === 'legacy' ? 'legacy' : 'calibrated',
    emissive: params.has('lmemissive') && Number.isFinite(emissive) && emissive >= 0 ? emissive : undefined,
    cull: params.get('lmcull') !== 'off' && params.get('lighting') !== 'legacy',
  };
}

/**
 * F-ASTRA-9, THE CULLING. Astra: "All 443 material records scanned in pilot GLBs were double-sided.
 * That is justified for some sheets and panoramas, but unnecessary for many closed buildings...
 * Enable backface culling on verified closed meshes, not through a global toggle."
 *
 * VERIFIED means two conditions, both measured on the geometry that actually loaded:
 *  1. every undirected edge is shared by exactly two triangles — welded by POSITION, because a GLB
 *     splits vertices at UV and normal seams, so raw indices would call every seam an open edge and
 *     no body would ever qualify;
 *  2. the signed volume is positive, i.e. the winding really is outward. A closed shell with
 *     inverted winding would VANISH under FrontSide, which is exactly the failure mode a global
 *     toggle produces and the reason this is a per-mesh verdict.
 *
 * A material is only culled when EVERY mesh that shares it passed — GLB materials are shared
 * instances that survive a re-install, so one sheet in a pack keeps the whole material double-sided.
 * The original side is banked on the material so `?lighting=legacy` and a re-install restore it.
 */
type MeshClosure = { closed: boolean; reason: 'closed' | 'open-edges' | 'inverted-winding' | 'no-index-or-position' };

function classifyMeshClosure(geometry: THREE.BufferGeometry): MeshClosure {
  const cached = geometry.userData.landmarkClosure as MeshClosure | undefined;
  if (cached) return cached;
  const verdict = ((): MeshClosure => {
    const position = geometry.getAttribute('position');
    if (!position) return { closed: false, reason: 'no-index-or-position' };
    const count = geometry.index?.count ?? position.count;
    if (count < 3 || count % 3 !== 0) return { closed: false, reason: 'no-index-or-position' };
    // Weld by quantised position: 1e-4 is far below the smallest feature in these bodies (metres)
    // and far above float32 noise on a 64 m map.
    const weld = new Map<string, number>();
    const welded = new Int32Array(position.count);
    const points: number[] = [];
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const z = position.getZ(index);
      const key = `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
      let id = weld.get(key);
      if (id === undefined) {
        id = points.length / 3;
        weld.set(key, id);
        points.push(x, y, z);
      }
      welded[index] = id;
    }
    const at = (slot: number): number => welded[geometry.index ? geometry.index.getX(slot) : slot]!;
    const edges = new Map<number, number>();
    const vertexCount = points.length / 3;
    let volume = 0;
    for (let slot = 0; slot < count; slot += 3) {
      const a = at(slot);
      const b = at(slot + 1);
      const c = at(slot + 2);
      if (a === b || b === c || a === c) continue; // a degenerate triangle has no surface to face
      for (const [from, to] of [[a, b], [b, c], [c, a]] as const) {
        const key = Math.min(from, to) * vertexCount + Math.max(from, to);
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
      const ax = points[a * 3]!, ay = points[a * 3 + 1]!, az = points[a * 3 + 2]!;
      const bx = points[b * 3]!, by = points[b * 3 + 1]!, bz = points[b * 3 + 2]!;
      const cx = points[c * 3]!, cy = points[c * 3 + 1]!, cz = points[c * 3 + 2]!;
      volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    }
    for (const shared of edges.values()) if (shared !== 2) return { closed: false, reason: 'open-edges' };
    if (volume <= 0) return { closed: false, reason: 'inverted-winding' };
    return { closed: true, reason: 'closed' };
  })();
  geometry.userData.landmarkClosure = verdict;
  return verdict;
}

type ClosureCensus = { id: string; meshes: number; closed: number; open: number; culled: number; doubleSided: number; reasons: Record<string, number> };

function cullVerifiedClosedMeshes(model: THREE.Object3D, mountId: string): ClosureCensus {
  const census: ClosureCensus = { id: mountId, meshes: 0, closed: 0, open: 0, culled: 0, doubleSided: 0, reasons: {} };
  const verdictPerMaterial = new Map<THREE.Material, boolean>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.landmarkContactShadow) return;
    const closure = classifyMeshClosure(mesh.geometry);
    census.meshes += 1;
    census[closure.closed ? 'closed' : 'open'] += 1;
    census.reasons[closure.reason] = (census.reasons[closure.reason] ?? 0) + 1;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      verdictPerMaterial.set(material, (verdictPerMaterial.get(material) ?? true) && closure.closed);
    }
  });
  const cull = lightingDials().cull;
  for (const [material, closed] of verdictPerMaterial) {
    const banked = material.userData.landmarkBaseSide as THREE.Side | undefined;
    const original = banked ?? material.side;
    material.userData.landmarkBaseSide = original;
    const next = closed && cull ? THREE.FrontSide : original;
    if (material.side !== next) {
      material.side = next;
      material.needsUpdate = true;
    }
    if (next === THREE.FrontSide) census.culled += 1;
    else census.doubleSided += 1;
  }
  return census;
}

function dressLandmark(model: THREE.Object3D, contractId: string, mountId: string): void {
  if (contractId === 'e10-ember-shore' && mountId === 'last-warm-vent-altar') {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.684, 0.684, 0.96, 16), new THREE.MeshBasicMaterial({ color: 0xffb438 }));
    lamp.name = 'last-warm-vent-altar.AmberWindow';
    lamp.position.y = 1.99;
    lamp.userData.renderOnly = true;
    model.add(lamp);
  }
  if (contractId === 'e10-ember-shore' && mountId === 'west-vein-cooling-marker') {
    const slit = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 0.20), new THREE.MeshBasicMaterial({ color: 0x58a9a0 }));
    slit.name = 'west-vein-cooling-marker.GlassSlit';
    slit.position.set(0, 1.21, 0.886);
    slit.userData.renderOnly = true;
    model.add(slit);
  }
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
 * CALL THIS ONCE PER BODY. F-BHM-1 (found by this shift, 2026-08-04): between `d67095eb` — the
 * baron drain, whose merge resolution kept both the new per-contract block and the old single-line
 * call it replaced — and this commit, the pilot called it TWICE, the second time with the default
 * paint. Every per-contract intensity on main was therefore silently reset to 3: the-claim's 1.45
 * (shipped `22fd2fd7`), the baron's 1.7/1.9/2.1/3.4 AND its emissive grade, and dry gulch's
 * isolated_spring 2.1. Three signed-off upgrades were defeated and every gate stayed green, because
 * the dataset published the TABLE's number rather than the material's. It now publishes the
 * material's (see terrain3dPilotLandmarkMaterials).
 */
function keepLandmarkPaintReadable(model: THREE.Object3D, paint: LandmarkPaint = DEFAULT_LANDMARK_PAINT, contractId = ''): void {
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
    // The authored number is banked so the dataset can publish BOTH — the grade the beauty shift
    // wrote and the lit value it renders at — and so `?lighting=legacy` restores the exact
    // pre-calibration render from a material that may already have been re-installed once.
    material.userData.landmarkAuthoredEmissive = paint.intensity;
    material.emissiveIntensity = calibratedLandmarkIntensity(paint.intensity);
    if ((contractId === 'e2-pressure-garden' || contractId === 'e6-glow-mesa' || contractId === 'e6-picnic' || contractId === 'e7-dead-band' || contractId === 'e7-relay-rush' || contractId === 'e8-far-side' || contractId === 'e8-low-orbit' || contractId === 'e9-dome-basin' || contractId === 'e9-seed-run' || contractId === 'e9-devils-alley' || contractId === 'e9-old-canal' || contractId === 'e10-last-claim' || contractId === 'e10-ember-shore' || contractId === 'e10-archive-world') && !material.userData.landmarkDiffuseGrade) {
      material.userData.landmarkDiffuseGrade = true;
      // Recover the atlas's dark iron detail in its diffuse paint, so the body can
      // leave the legacy-emission exemption without turning its texture into a lamp.
      const compile = material.onBeforeCompile.bind(material);
      material.onBeforeCompile = (shader, renderer) => {
        compile(shader, renderer);
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
diffuseColor.rgb = min(vec3(0.88), pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.62)) * vec3(0.94, 0.99, 1.06) + vec3(0.014));`);
      };
      material.customProgramCacheKey = () => 'landmark-diffuse-iron-v1';
      material.needsUpdate = true;
    }
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
/** A narrow waterline taken from the visible hull's actual intersection with the sea. */
function createHullWaterline(root: THREE.Object3D, waterY: number, time: THREE.IUniform<number>): THREE.Mesh | undefined {
  root.updateWorldMatrix(true, true);
  const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.renderOnly) return;
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    if (!positions) return;
    const count = geometry.index?.count ?? positions.count;
    const vertex = (target: THREE.Vector3, slot: number) => target.fromBufferAttribute(
      positions, geometry.index ? geometry.index.getX(slot) : slot,
    ).applyMatrix4(mesh.matrixWorld);
    for (let i = 0; i < count; i += 3) {
      vertex(a, i); vertex(b, i + 1); vertex(c, i + 2);
      const cuts: THREE.Vector3[] = [];
      for (const [from, to] of [[a,b], [b,c], [c,a]]) {
        if ((from!.y <= waterY) === (to!.y <= waterY)) continue;
        cuts.push(from!.clone().lerp(to!, (waterY - from!.y) / (to!.y - from!.y)));
      }
      if (cuts.length === 2 && cuts[0]!.distanceToSquared(cuts[1]!) > 1e-8) segments.push([cuts[0]!, cuts[1]!]);
    }
  });
  if (!segments.length) return undefined;
  const bounds = new THREE.Box3();
  for (const segment of segments) for (const point of segment) bounds.expandByPoint(point);
  const center = bounds.getCenter(new THREE.Vector3());
  const positions: number[] = [], uvs: number[] = [];
  const emit = (point: THREE.Vector3, edge: number) => {
    const local = root.worldToLocal(point.clone());
    positions.push(local.x,local.y,local.z); uvs.push(0,edge);
  };
  for (const [from,to] of segments) {
    const outward = new THREE.Vector3(to.z-from.z,0,from.x-to.x).normalize();
    const mid = from.clone().add(to).multiplyScalar(.5).sub(center);
    if (outward.dot(mid) < 0) outward.negate();
    const innerA = from.clone(), innerB = to.clone();
    innerA.y = innerB.y = waterY + 0.018;
    const outerA = innerA.clone().addScaledVector(outward,.34);
    const outerB = innerB.clone().addScaledVector(outward,.34);
    emit(innerA,0); emit(outerA,1); emit(innerB,0);
    emit(innerB,0); emit(outerA,1); emit(outerB,1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  const material = new THREE.MeshBasicMaterial({color:'#b5c4bb',transparent:true,opacity:.24,depthWrite:false,side:THREE.DoubleSide});
  material.forceSinglePass = true;
  material.onBeforeCompile = shader => {
    shader.uniforms.hullWaterTime = time;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWaterline;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterline = vec3(position.x, position.z, uv.y);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWaterline;\nuniform float hullWaterTime;')
      .replace('#include <color_fragment>',`#include <color_fragment>
        float wash = sin(vWaterline.x * 0.9 + vWaterline.y * 1.4 + hullWaterTime * 0.5)
          * sin(vWaterline.y * 2.9 - hullWaterTime * 0.3);
        diffuseColor.a *= (1.0 - smoothstep(0.0, 1.0, vWaterline.z)) * smoothstep(-0.15, 0.65, wash);`);
  };
  material.customProgramCacheKey=()=> 'sea-hull-waterline-v1';
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='SeaHullWaterline';mesh.userData.renderOnly=true;
  mesh.renderOrder=RenderLayers.groundDecals+0.1;
  return mesh;
}

function mountSculptWater(host: Host, heightAt: (x: number, z: number) => number, bounds: THREE.Box3): SculptWater | undefined {
  const contract = REGISTRY[host.contractId]?.contract;
  const sea = contract?.waterSurface?.owner === 'runtime DeepwaterClaimTile'
    && contract.waterSurface.includedInTerrainGLB === false;
  const stillwater = host.contractId === 'e5-stillwater';
  const dressing = sea ? DEEPWATER_SEA_DRESSING : SCULPT_WATER_DRESSING[host.contractId];
  if (isMapBeautyDisabled() || !dressing || (!sea && !Terrain.hasRiverWater())) return undefined;
  const river = sea ? { minZ: bounds.min.z, maxZ: bounds.max.z } : Terrain.riverGeometry();
  const centerZ = (river.minZ + river.maxZ) / 2;
  const riverHalfWidth = (river.maxZ - river.minZ) / 2;
  const fords = sea ? [] : Terrain.fordRanges();
  const fordHalfWidth = fords.length ? Math.max(...fords.map((range) => range.halfWidth)) : 3;
  const fordCenters = fords.length ? fords.map((range) => range.centerX) : [0];
  const halfX = Math.min(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const surfaceY = dressing.surface.kind === 'sea-level' ? dressing.surface.y
    : dressing.surface.kind === 'channel-fill'
      ? sculptWaterSurfaceY(heightAt, halfX, centerZ, fords, dressing.surface.fill, dressing.fordSkim)
      : sculptWaterFloorY(heightAt, halfX, centerZ, dressing.surface.quantile, dressing.surface.drop);
  const seaRadius = REGISTRY[host.contractId]?.panoramaContract.projection?.skyRingRadiusMeters ?? halfX;
  const visualHalfWidth = sea ? seaRadius : dressing.visualHalfWidth ?? Terrain.visualWaterHalfWidth();
  const overhang = sea ? Math.max(0, seaRadius - halfX) : Math.max(0, dressing.overhangMeters ?? 0);
  const water = createSculptWater({
    ford: false,
    depthTest: true,
    openSea: sea,
    heightAt: sea ? (x, z) => {
      // The panorama's submerged apron is scenery, not an extension of the playable bed.
      const outside = Math.max(0, Math.abs(x) - halfX, Math.abs(z - centerZ) - riverHalfWidth);
      return THREE.MathUtils.lerp(heightAt(x, z), bounds.min.y, THREE.MathUtils.smoothstep(outside, 0, halfX));
    } : heightAt,
    bed: dressing.bed,
    deepMeters: dressing.deepMeters,
    shoreMeters: dressing.shoreMeters,
    color: stillwater ? '#a5c5d0' : dressing.color,
    opacity: stillwater ? 0.62 : dressing.opacity,
    rippleStrength: stillwater ? 0.04 : dressing.rippleStrength,
    rippleScale: dressing.rippleScale,
    depthContrast: dressing.depthContrast,
    textureBlend: stillwater ? 0.06 : dressing.textureBlend,
    fordTint: dressing.fordTint,
    shoreFadeMeters: dressing.shoreFadeMeters,
    surfaceLift: dressing.surfaceLift,
    emissive: dressing.emissive,
    centerZ,
    surfaceY,
    halfLength: halfX + overhang,
    riverHalfWidth: sea ? seaRadius : riverHalfWidth,
    visualHalfWidth,
    lengthHalf: halfX + overhang,
    fadeStart: sea ? seaRadius - SCULPT_WATER_EDGE_FADE : overhang > 0 ? halfX : Math.max(1, halfX - SCULPT_WATER_EDGE_FADE),
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
      : dressing.glints.map(({ x, z }) => ({ x, z: centerZ + z })),
  });
  let lastFrame = -1;
  let lastAt = 0;
  const hullNames = sea ? (host.contractId === 'e5-flotilla'
    ? ['kitchen-scow', 'turret-raft', 'still-room-barge'] : ['ClaimBoatView']) : [];
  const hullContacts: THREE.Mesh[] = [];
  const disposeWater = water.dispose;
  water.dispose = () => {
    for (const contact of hullContacts) {
      if (!contact.parent) continue; // The owning hull may already have disposed its children.
      contact.removeFromParent();
      disposeObject3D(contact);
    }
    delete host.canvas.dataset.terrain3dPilotHullWaterlines;
    disposeWater();
  };
  water.mesh.onBeforeRender = (renderer) => {
    const frame = renderer.info.render.frame;
    if (frame === lastFrame) return;
    const now = performance.now() / 1000;
    const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
    lastFrame = frame;
    lastAt = now;
    water.advance(delta);
    // Attach once the asynchronous visual hull arrives. The parent's existing transform and
    // visibility carry the line through reanchoring/loss; no simulation position is duplicated.
    for (let i = hullNames.length - 1; i >= 0; i--) {
      const hull = host.scene.getObjectByName(hullNames[i]!);
      if (!hull?.children.length) continue;
      const contact = createHullWaterline(hull, surfaceY,
        (water.mesh.material as THREE.Material).userData.waterUniforms.time as THREE.IUniform<number>);
      hullNames.splice(i, 1);
      if (contact) { hull.add(contact); hullContacts.push(contact); }
      host.canvas.dataset.terrain3dPilotHullWaterlines = JSON.stringify(hullContacts.map(mesh => ({
        hull: mesh.parent?.name, triangles: mesh.geometry.getAttribute('position').count / 3,
      })));
    }
  };
  host.scene.add(water.mesh);
  host.canvas.dataset.terrain3dPilotSculptWater = sea ? 'living-sea-quad' : 'living-water-quad';
  // The MOUNTED half width, not the tile's declaration — a map that narrows its quad has to say so,
  // and e2e/shore-truth.spec.ts's law is "never wider than the sim declares", which narrowing keeps.
  host.canvas.dataset.terrain3dPilotSculptWaterHalfWidth = visualHalfWidth.toFixed(3);
  host.canvas.dataset.terrain3dPilotSculptWaterSimHalfWidth = (sea ? riverHalfWidth : Terrain.visualWaterHalfWidth()).toFixed(3);
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

/** Water sits within the sculpted spring bed; its radius remains simulation-owned. */
type LiveSpringPool = { surfaceY: number };
const LIVE_SPRING_POND_CONTRACTS = new Map<string, LiveSpringPool>([
  ['e1-dry-gulch', { surfaceY: 0.19 }],
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
/** Quiet the worked bank shelves while retaining the authored wet lips and tile edge. */
function calmTwinBanksGround(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.twinBanksDryPigment = { value: new THREE.Color('#ad9c7b') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTwinBanksWorld;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTwinBanksWorld = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTwinBanksWorld;\nuniform vec3 twinBanksDryPigment;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float twinBanksSouth = 1.0 - smoothstep(0.45, 1.65, length((vTwinBanksWorld - vec2(-13.0, -14.0)) / vec2(13.0, 8.0)));
float twinBanksNorth = 1.0 - smoothstep(0.45, 1.65, length((vTwinBanksWorld - vec2(13.5, 14.2)) / vec2(13.0, 8.0)));
float twinBanksDry = smoothstep(6.0, 10.0, abs(vTwinBanksWorld.y));
float twinBanksEdge = 1.0 - smoothstep(24.0, 31.0, max(abs(vTwinBanksWorld.x), abs(vTwinBanksWorld.y)));
float twinBanksQuiet = mix(0.20, 0.48, max(twinBanksSouth, twinBanksNorth)) * twinBanksDry * twinBanksEdge;
diffuseColor.rgb = mix(diffuseColor.rgb, twinBanksDryPigment, twinBanksQuiet);`);
    };
    material.customProgramCacheKey = () => 'twin-banks-dry-bank-pigment-v1';
    material.needsUpdate = true;
  }
}

/** Lift only the deepest painted scorch pigment, retaining its edges and grit. */
function separateBaronGroundScars(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.baronWarmPigment = { value: new THREE.Color('#77614c') };
      shader.uniforms.baronColdPigment = { value: new THREE.Color('#627078') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vBaronGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBaronGround = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vBaronGround;\nuniform vec3 baronWarmPigment;\nuniform vec3 baronColdPigment;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float baronInk = 1.0 - smoothstep(0.018, 0.09, dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));
float baronDry = smoothstep(6.0, 7.5, abs(vBaronGround.y));
float baronEdge = 1.0 - smoothstep(25.0, 31.0, max(abs(vBaronGround.x), abs(vBaronGround.y)));
vec3 baronPigment = mix(baronWarmPigment, baronColdPigment, smoothstep(6.0, 10.0, -vBaronGround.y));
diffuseColor.rgb = mix(diffuseColor.rgb, baronPigment, 0.32 * baronInk * baronDry * baronEdge);`);
    };
    material.customProgramCacheKey = () => 'baron-scorch-pigment-v1';
    material.needsUpdate = true;
  }
}

/** Quiet the worked approaches without repainting the gorge or its waterline. */
function calmTrestleApproaches(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.trestleWorkedPigment = { value: new THREE.Color('#8b7256') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTrestleGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTrestleGround = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTrestleGround;\nuniform vec3 trestleWorkedPigment;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float trestleBank = smoothstep(6.25, 9.0, abs(vTrestleGround.y));
float trestleEdge = 1.0 - smoothstep(29.0, 42.0, max(abs(vTrestleGround.x), abs(vTrestleGround.y)));
diffuseColor.rgb = mix(diffuseColor.rgb, trestleWorkedPigment, 0.23 * trestleBank * trestleEdge);`);
    };
    material.customProgramCacheKey = () => 'trestle-worked-approaches-v1';
    material.needsUpdate = true;
  }
}

/** Quiet desert pigment and wheel cuts follow the published Motor masks, never new roads. */
function clarifyMotorGround(model: THREE.Object3D, truth: MotorGroundTruth, panorama = false, paintMix = 0.78): void {
  if (isMapBeautyDisabled()) return;
  const roads = truth.roadCorridors ?? [];
  const seams = truth.tarSeams ?? [];
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.motorPaintMix = { value: paintMix };
      shader.uniforms.motorEarth = { value: new THREE.Color('#9f8564') };
      shader.uniforms.motorRoad = { value: new THREE.Color('#c5a274') };
      shader.uniforms.motorRoads = { value: roads.map(r => new THREE.Vector4(r.start.x, r.start.z, r.end.x, r.end.z)) };
      shader.uniforms.motorTar = { value: seams.length ? seams.map(s => new THREE.Vector3(s.x, s.z, s.radius)) : [new THREE.Vector3()] };
      shader.uniforms.motorOrbit = { value: truth.orbitSpawn?.radius ?? 0 };
      shader.uniforms.motorHalfSize = { value: new THREE.Vector2(truth.dimensions!.width / 2, truth.dimensions!.height / 2) };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vMotorGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMotorGround = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
varying vec3 vMotorGround;
uniform vec3 motorEarth, motorRoad;
uniform vec4 motorRoads[${roads.length}];
uniform vec3 motorTar[${Math.max(1, seams.length)}];
uniform vec2 motorHalfSize;
uniform float motorOrbit, motorPaintMix;`)
        .replace('#include <map_fragment>', `#include <map_fragment>
vec2 motorP = vMotorGround.xz;
vec3 motorOriginal = diffuseColor.rgb;
float motorGrain = fract(sin(dot(floor(motorP * 18.0), vec2(12.9898,78.233))) * 43758.5453);
float motorMottle = sin(motorP.x * 0.37 + sin(motorP.y * 0.21)) * sin(motorP.y * 0.43);
diffuseColor.rgb = mix(diffuseColor.rgb, motorEarth * (0.94 + motorGrain * 0.06 + motorMottle * 0.035), motorHalfSize.x > 100.0 ? 0.95 : motorPaintMix);
float motorDistance = 10000.0;
float motorRut = 0.0;
for (int i = 0; i < ${roads.length}; i++) {
  vec2 a = motorRoads[i].xy, b = motorRoads[i].zw, ab = b - a;
  float along = dot(motorP - a, ab) / dot(ab, ab);
  float distance = length(motorP - a - ab * clamp(along, 0.0, 1.0));
  motorDistance = min(motorDistance, distance);
  motorRut = max(motorRut, (1.0 - smoothstep(0.12, 0.28 + fwidth(distance), abs(distance - 1.55))) * smoothstep(0.0, 0.06, along) * (1.0 - smoothstep(0.94, 1.0, along)));
}
if (motorOrbit > 0.0) {
  float angle = atan(motorP.y, motorP.x);
  float wobble = sin(angle * 3.0 + 0.4) * 0.62 + sin(angle * 7.0 - 0.8) * 0.28;
  float distance = abs(length(motorP) - motorOrbit - wobble);
  motorDistance = min(motorDistance, distance);
  motorRut = max(motorRut, 1.0 - smoothstep(0.12, 0.28 + fwidth(distance), abs(distance - 1.55)));
}
float motorRoadMask = 1.0 - smoothstep(2.8, 4.8, motorDistance);
diffuseColor.rgb = mix(diffuseColor.rgb, motorRoad * (0.96 + motorGrain * 0.04), motorRoadMask * 0.62);
diffuseColor.rgb *= 1.0 - motorRut * 0.16;
for (int i = 0; i < ${seams.length}; i++) {
  float radius = length(motorP - motorTar[i].xy) / motorTar[i].z;
  float tar = 1.0 - smoothstep(0.65, 1.05 + motorMottle * 0.12, radius);
  diffuseColor.rgb = mix(diffuseColor.rgb, motorEarth * 0.28, tar * 0.62);
}
float motorInterior = 1.0 - smoothstep(0.72, 1.0, max(abs(motorP.x) / motorHalfSize.x, abs(motorP.y) / motorHalfSize.y));
if (motorHalfSize.x > 100.0) motorInterior = (1.0 - smoothstep(205.0, 260.0, abs(motorP.x))) * (1.0 - smoothstep(0.72, 1.0, abs(motorP.y) / motorHalfSize.y)) * (1.0 - smoothstep(1.0, 12.0, vMotorGround.y));
diffuseColor.rgb = mix(motorOriginal, diffuseColor.rgb, motorInterior);`);
      if (panorama) shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0 - motorInterior;');
    };
    material.customProgramCacheKey = () => `motor-ground-${roads.length}-${seams.length}-${panorama}-v2`;
    material.needsUpdate = true;
  }
}

/** Fine regolith pigment replaces the reused Mare's broad paint bands, without a new surface. */
function clarifyFarSideRegolith(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.farSideDust = { value: new THREE.Color('#aaa596') };
      shader.uniforms.farSideRim = { value: new THREE.Color('#c4bba5') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vFarSideGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFarSideGround = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vFarSideGround;\nuniform vec3 farSideDust, farSideRim;')
        .replace('#include <map_fragment>', `#include <map_fragment>
vec2 farSideP = vFarSideGround.xz;
float farSideGrain = fract(sin(dot(floor(vFarSideGround * 18.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
float farSideGrainFade = 1.0 - smoothstep(0.4, 1.2, max(max(fwidth(vFarSideGround.x), fwidth(vFarSideGround.z)), fwidth(vFarSideGround.y)) * 18.0);
float farSideMottle = sin(farSideP.x * 0.73 + sin(farSideP.y * 0.41)) * sin(farSideP.y * 0.87);
vec3 farSidePigment = mix(farSideDust, farSideRim, smoothstep(0.5, 5.8, vFarSideGround.y));
farSidePigment *= 0.96 + (farSideGrain - 0.5) * 0.14 * farSideGrainFade + farSideMottle * 0.045;
float farSideInterior = 1.0 - smoothstep(54.0, 63.0, max(abs(farSideP.x), abs(farSideP.y)));
diffuseColor.rgb = mix(diffuseColor.rgb, farSidePigment, 0.92 * farSideInterior);`);
    };
    material.customProgramCacheKey = () => 'far-side-regolith-v2';
    material.needsUpdate = true;
  }
}

/** A circular memorial inlay stays on the complete authored square floor. */
function paintLastClaimDeck(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.memorialBrass = { value: new THREE.Color('#c4a465') };
      shader.uniforms.memorialBand = { value: new THREE.Color('#8c8270') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMemorialDeck;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMemorialDeck = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vMemorialDeck;\nuniform vec3 memorialBrass, memorialBand;')
        .replace('#include <map_fragment>', `
#ifdef USE_MAP
// Polar paint lives in the shader: the sampler's regular grid has no UV seam duplicates.
vec2 memorialUV = vec2(atan(vMemorialDeck.y, vMemorialDeck.x) / 6.28318530718 * 16.0, length(vMemorialDeck) / 22.0);
diffuseColor *= texture2D(map, memorialUV);
#endif
float memorialRadius = length(vMemorialDeck);
float memorialInside = 1.0 - smoothstep(55.8, 57.0, memorialRadius);
diffuseColor.rgb = (pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.68)) * 0.84 + vec3(0.026)) * mix(0.76, 1.0, memorialInside);
float memorialAnnulus = smoothstep(44.7, 45.0, memorialRadius) * (1.0 - smoothstep(48.3, 48.6, memorialRadius));
diffuseColor.rgb = mix(diffuseColor.rgb, memorialBand, memorialAnnulus * 0.24);
float memorialRingDistance = min(min(abs(memorialRadius - 44.6), abs(memorialRadius - 48.7)), min(abs(memorialRadius - 55.2), min(abs(memorialRadius - 20.0), abs(memorialRadius - 5.0))));
float memorialRing = 1.0 - smoothstep(0.065, 0.16, memorialRingDistance);
float memorialSpokeDistance = abs(sin(atan(vMemorialDeck.y, vMemorialDeck.x) * 6.0)) * memorialRadius;
float memorialSpoke = (1.0 - smoothstep(0.08, 0.20, memorialSpokeDistance)) * smoothstep(4.5, 5.0, memorialRadius) * (1.0 - smoothstep(43.9, 44.3, memorialRadius));
// Small divisions within the outer bands read as a surveyed memorial deck.
float memorialAngle = atan(vMemorialDeck.y, vMemorialDeck.x);
float memorialTick = (1.0 - smoothstep(0.04, 0.11, abs(sin(memorialAngle * 96.0)) * memorialRadius))
  * smoothstep(48.9, 49.0, memorialRadius) * (1.0 - smoothstep(49.8, 49.9, memorialRadius));
diffuseColor.rgb = mix(diffuseColor.rgb, memorialBrass, max(max(memorialRing, memorialSpoke), memorialTick) * 0.66);
float memorialContact = min(length(vMemorialDeck - vec2(-10.0, 47.0)), length(vMemorialDeck - vec2(10.0, 47.0)));
diffuseColor.rgb *= mix(0.62, 1.0, smoothstep(1.28, 1.85, memorialContact));`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
// Authored light cast by the memorial instruments; no gameplay state is written.
float lanternPool = exp(-dot(vMemorialDeck - vec2(-10.0, 47.0), vMemorialDeck - vec2(-10.0, 47.0)) / 18.0);
float portraitPool = exp(-dot(vMemorialDeck - vec2(10.0, 47.0), vMemorialDeck - vec2(10.0, 47.0)) / 12.0);
float archPool = exp(-dot(vMemorialDeck - vec2(0.0, -51.0), vMemorialDeck - vec2(0.0, -51.0)) / 24.0);
totalEmissiveRadiance += vec3(0.30, 0.14, 0.045) * (lanternPool + portraitPool * 0.65 + archPool * 0.4) * smoothstep(1.30, 2.0, memorialContact);`);
    };
    material.customProgramCacheKey = () => 'last-claim-memorial-inlay-v3';
    material.needsUpdate = true;
  });
}

/** The raw River keeps its run-6 water; the dedicated grid replaces bank paint. */
function paintRiverBanks(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material);
    const cacheKey = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.riverSand = { value: new THREE.Color('#b8a47c') };
      shader.uniforms.riverWet = { value: new THREE.Color('#69746b') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vRiverBank;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRiverBank = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vRiverBank;\nuniform vec3 riverSand, riverWet;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float riverEdge = abs(vRiverBank.y) + sin(vRiverBank.x * 0.79) * 0.25 + sin(vRiverBank.x * 1.93) * 0.12;
float riverDamp = 1.0 - smoothstep(5.7, 8.5, riverEdge);
float riverFord = 1.0 - smoothstep(2.5, 3.0, abs(vRiverBank.x));
vec3 riverPigment = mix(riverSand, riverWet, riverDamp * (1.0 - 0.45 * riverFord));
diffuseColor.rgb = mix(diffuseColor.rgb, riverPigment, 0.72);`);
    };
    material.customProgramCacheKey = () => `${cacheKey}|river-bank-dawn-v1`;
    material.needsUpdate = true;
  });
}

/** The original stones and new gravel share a cool damp lower edge. */
function paintRiverStones(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material), key = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vRiverStone;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRiverStone = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vRiverStone;')
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= mix(0.75, 1.0, smoothstep(5.6, 8.3, abs(vRiverStone.z)));')
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.44, roughnessFactor, smoothstep(5.6, 8.3, abs(vRiverStone.z)));');
    };
    material.customProgramCacheKey = () => `${key}|river-wet-stone-v1`;
    material.needsUpdate = true;
  });
}

/** A material-only dawn treatment for the raw River's existing painted fallback. */
function paintRiverReturn(host: Host): () => void {
  if (host.contractId !== 'e10-river' || isMapBeautyDisabled()) return () => undefined;
  const materials = new Set<THREE.MeshStandardMaterial>();
  host.scene.traverse(node => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if ((material as THREE.MeshStandardMaterial).isMeshStandardMaterial && (material.userData.terrainUniforms || material.userData.waterUniforms)) materials.add(material as THREE.MeshStandardMaterial);
    }
  });
  const restore = [...materials].map(material => {
    const compile = material.onBeforeCompile, key = material.customProgramCacheKey;
    const cacheKey = key.call(material), water = !!material.userData.waterUniforms;
    material.onBeforeCompile = (shader, renderer) => {
      compile.call(material, shader, renderer);
      if (water) {
        shader.fragmentShader = shader.fragmentShader.replace('bankFoam * 0.58', 'bankFoam * 0.16').replace('vec4 sampledDiffuseColor = vec4(waterColor, alpha);', `
vec3 returnWater = mix(vec3(0.26, 0.40, 0.40), vec3(0.16, 0.29, 0.34), depth);
returnWater = mix(returnWater, vec3(0.48, 0.46, 0.35), fordBand * 0.55);
waterColor = mix(waterColor, returnWater, 0.86);
// Break only the visual outer fade inward; declared widths and depth uniforms stay exact.
alpha *= smoothstep(0.0, 0.65, visualEdgeDist - waterNoise(vWaterWorld * vec2(0.24, 0.8)) * 0.25);
float returnFlowLine = sin(vWaterWorld.y * 7.0 + waterNoise(vWaterWorld * vec2(1.2, 1.8) - vec2(waterTime * 0.32, 0.0)) * 4.8);
float returnFlowBreak = smoothstep(0.50, 0.78, waterNoise(vWaterWorld * vec2(3.4, 2.3) - vec2(waterTime * 0.4, 0.0)));
waterColor += vec3(0.12, 0.11, 0.075) * smoothstep(0.94, 0.995, returnFlowLine) * returnFlowBreak * waterQuality * (1.0 - fordBand) * smoothstep(0.05, 0.20, depth);
vec4 sampledDiffuseColor = vec4(waterColor, alpha);`);
      } else {
        shader.uniforms.returnBankPigment = { value: new THREE.Color('#ad9c75') };
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec3 returnBankPigment;')
          .replace('diffuseColor *= sampledDiffuseColor;', 'diffuseColor *= sampledDiffuseColor;\ndiffuseColor.rgb = mix(diffuseColor.rgb, returnBankPigment, 0.25);');
      }
    };
    material.customProgramCacheKey = () => `${cacheKey}|raw-river-dawn-v2:${water ? 'water' : 'bank'}`;
    material.needsUpdate = true;
    return () => { material.onBeforeCompile = compile; material.customProgramCacheKey = key; material.needsUpdate = true; };
  });
  return () => { for (const reset of restore) reset(); };
}

/** Quiet the archive paving; warm pools appear only for already-restored wings. */
function clarifyArchiveTerraces(model: THREE.Object3D, readState?: () => ArchiveRestorationState | null, detailTextureUrl?: string): void {
  if (isMapBeautyDisabled()) return;
  const zones = readState?.()?.zones ?? [];
  const pools = { value: zones.map(zone => new THREE.Vector4((zone.minX + zone.maxX) / 2, (zone.minZ + zone.maxZ) / 2, (zone.maxX - zone.minX) * 0.37, (zone.maxZ - zone.minZ) * 0.37)) };
  const restored = { value: new Float32Array(zones.length) };
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const beforeRender = mesh.onBeforeRender.bind(mesh);
    mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      beforeRender(renderer, scene, camera, geometry, material, group);
      const state = readState?.();
      zones.forEach((zone, index) => { restored.value[index] = state?.restoredWingIds.includes(zone.id) ? 1 : 0; });
    };
    const material = mesh.material, compile = material.onBeforeCompile.bind(material);
    let disposed = false;
    const detail = detailTextureUrl ? new THREE.TextureLoader().load(detailTextureUrl, texture => { if (disposed) texture.dispose(); }) : undefined;
    if (detail) {
      detail.colorSpace = THREE.SRGBColorSpace;
      detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
      material.addEventListener('dispose', () => { disposed = true; detail.dispose(); });
    }
    const cacheKey = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.archiveFloorLow = { value: new THREE.Color('#776f5e') };
      shader.uniforms.archiveFloorHigh = { value: new THREE.Color('#a8a38d') };
      if (detail) shader.uniforms.archiveMasonry = { value: detail };
      shader.uniforms.archiveFloorPools = pools;
      shader.uniforms.archiveFloorRestored = restored;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vArchiveFloor;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvArchiveFloor = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
varying vec3 vArchiveFloor;
uniform vec3 archiveFloorLow, archiveFloorHigh;
${detail ? 'uniform sampler2D archiveMasonry;' : ''}
${zones.length ? `uniform vec4 archiveFloorPools[${zones.length}];\nuniform float archiveFloorRestored[${zones.length}];` : ''}`)
        .replace('#include <map_fragment>', `#include <map_fragment>
float archiveTerrace = smoothstep(-0.7, 2.2, vArchiveFloor.y);
diffuseColor.rgb = mix(diffuseColor.rgb, mix(archiveFloorLow, archiveFloorHigh, archiveTerrace), 0.78);
${detail ? 'float archiveEngraving = dot(texture2D(archiveMasonry, vArchiveFloor.xz / 24.0).rgb, vec3(0.2126, 0.7152, 0.0722));\ndiffuseColor.rgb *= 0.90 + archiveEngraving * 0.30;' : ''}`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
${zones.length ? `for (int i = 0; i < ${zones.length}; i++) {
  vec4 pool = archiveFloorPools[i];
  float archivePool = 1.0 - smoothstep(0.12, 1.0, length((vArchiveFloor.xz - pool.xy) / pool.zw));
  totalEmissiveRadiance += vec3(0.30, 0.14, 0.045) * archivePool * archiveFloorRestored[i];
}` : ''}`);
    };
    material.customProgramCacheKey = () => `${cacheKey}|archive-terraces-v2:${zones.length}:${!!detail}`;
    material.needsUpdate = true;
  });
}

/** Contact at the footing and earned warm facade wash; no restoration writes. */
function lightArchiveFacade(model: THREE.Object3D, readState?: () => ArchiveRestorationState | null): void {
  if (isMapBeautyDisabled()) return;
  const bounds = new THREE.Box3().setFromObject(model), center = bounds.getCenter(new THREE.Vector3());
  const zone = readState?.()?.zones.find(z => center.x >= z.minX && center.x <= z.maxX && center.z >= z.minZ && center.z <= z.maxZ);
  const restored = { value: 0 };
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const beforeRender = mesh.onBeforeRender.bind(mesh);
    mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      beforeRender(renderer, scene, camera, geometry, material, group);
      restored.value = zone && readState?.()?.restoredWingIds.includes(zone.id) ? 1 : 0;
    };
    const material = mesh.material, compile = material.onBeforeCompile.bind(material), key = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.archiveFacadeBase = { value: bounds.min.y };
      shader.uniforms.archiveFacadeRestored = restored;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vArchiveFacade;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvArchiveFacade = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vArchiveFacade;\nuniform float archiveFacadeBase, archiveFacadeRestored;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float archiveFacadeHeight = vArchiveFacade.y - archiveFacadeBase;
diffuseColor.rgb *= mix(0.63, 1.0, smoothstep(0.0, 0.7, archiveFacadeHeight));`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float archiveFacadeWash = smoothstep(0.1, 0.8, archiveFacadeHeight) * (1.0 - smoothstep(2.5, 6.0, archiveFacadeHeight));
totalEmissiveRadiance += vec3(0.11, 0.055, 0.012) * archiveFacadeWash * archiveFacadeRestored;`);
    };
    material.customProgramCacheKey = () => `${key}|archive-facade-v1`;
    material.needsUpdate = true;
  });
}

/** The near library halls use real depth; distant sky and apron stay at far depth. */
function prepareArchiveLibrary(model: THREE.Object3D, detailTextureUrl?: string): void {
  if (!detailTextureUrl) return;
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !['ArchiveLibraryScenery', 'ArchiveLibraryRecess'].includes(mesh.material.name)) return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material), key = material.customProgramCacheKey();
    mesh.renderOrder = 0;
    material.depthWrite = true;
    material.fog = true;
    material.vertexColors = false;
    material.color.set('#b6aa8d');
    const recess = material.name === 'ArchiveLibraryRecess';
    material.emissive.set(recess ? '#39362c' : '#88847a');
    material.emissiveIntensity = 0.18;
    let disposed = false;
    const detail = new THREE.TextureLoader().load(detailTextureUrl, texture => { if (disposed) texture.dispose(); });
    detail.colorSpace = THREE.SRGBColorSpace;
    detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
    material.addEventListener('dispose', () => { disposed = true; detail.dispose(); });
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader.replace('gl_Position.z = gl_Position.w * 0.999999;', '');
      shader.uniforms.archiveFacadeStone = { value: detail };
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D archiveFacadeStone;')
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb = texture2D(archiveFacadeStone, vMapUv).rgb * ' + (recess ? 'vec3(0.38, 0.36, 0.32);' : 'vec3(0.70, 0.65, 0.56);'));
    };
    material.customProgramCacheKey = () => `${key}|archive-library-v4:${recess}`;
    material.needsUpdate = true;
  });
}

/** Shared basalt pigment for sculpt, continuation and authored scenery rock.
 * Fractures and strata change the material only; heat still comes from the atlas. */
function clarifyEmberBasalt(model: THREE.Object3D, detailTextureUrl?: string, scenery = false): void {
  if (isMapBeautyDisabled() || !detailTextureUrl) return;
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material);
    if (scenery && material.name !== 'EmberShoreBasaltScenery') return;
    if (scenery) { material.fog = true; material.vertexColors = false; }
    // This material owns its native detail sampler, including late decode after
    // disposal. The GLB's original color map remains the heat-paint authority.
    let disposed = false;
    const detail = new THREE.TextureLoader().load(detailTextureUrl, texture => {
      if (disposed) texture.dispose();
    });
    detail.colorSpace = THREE.SRGBColorSpace;
    detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
    material.addEventListener('dispose', () => { disposed = true; detail.dispose(); });
    const cacheKey = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.emberBasaltDetail = { value: detail };
      shader.uniforms.emberBasaltLow = { value: new THREE.Color('#5d727c') };
      shader.uniforms.emberBasaltHigh = { value: new THREE.Color('#9c9e91') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vEmberBasalt;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEmberBasalt = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
varying vec3 vEmberBasalt;
uniform vec3 emberBasaltLow, emberBasaltHigh;
uniform sampler2D emberBasaltDetail;
float emberHeatCore(vec3 paint) { return clamp((paint.r - max(paint.g, paint.b) * 1.8) * 18.0, 0.0, 1.0); }`)
        .replace('#include <map_fragment>', `#include <map_fragment>
float emberWarm = clamp((diffuseColor.r - max(diffuseColor.g, diffuseColor.b) * 1.8) * 18.0, 0.0, 1.0);
float emberShelf = smoothstep(-1.8, 1.8, vEmberBasalt.y);
vec3 emberSample = texture2D(emberBasaltDetail, vEmberBasalt.xz / 12.0).rgb;
float emberEtching = dot(emberSample, vec3(0.2126, 0.7152, 0.0722));
vec3 emberStone = mix(emberBasaltLow, emberBasaltHigh, emberShelf);
emberStone *= clamp(0.82 + emberEtching * 1.35, 0.76, 1.22);
diffuseColor.rgb = emberStone;
float emberPlayfield = 1.0 - smoothstep(63.8, 64.0, max(abs(vEmberBasalt.x), abs(vEmberBasalt.z)));
float emberVein = emberWarm * emberPlayfield * clamp(0.58 + emberEtching * 1.8, 0.58, 1.0);
float emberCore = ${scenery ? '0.0' : `min(min(emberHeatCore(texture2D(map, vMapUv + vec2(0.00045, 0.0)).rgb), emberHeatCore(texture2D(map, vMapUv - vec2(0.00045, 0.0)).rgb)), min(emberHeatCore(texture2D(map, vMapUv + vec2(0.0, 0.00045)).rgb), emberHeatCore(texture2D(map, vMapUv - vec2(0.0, 0.00045)).rgb)))`};
emberCore *= emberWarm * emberPlayfield;
diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.20, 0.034, 0.010), vec3(0.38, 0.075, 0.014), emberCore), emberVein * 0.82);`)
        .replace('#include <emissivemap_fragment>', 'totalEmissiveRadiance = vec3(0.055, 0.012, 0.002) * emberVein + vec3(0.36, 0.11, 0.015) * emberCore;');
    };
    material.customProgramCacheKey = () => `${cacheKey}|ember-basalt-v11:${scenery}`;
    material.needsUpdate = true;
  });
}

/** Dry canal/road pigment follows published routes. Permanent green zones are
 * authored terrain paint; staged water and planted state keep their existing owners. */
function clarifyRedFieldsRoute(model: THREE.Object3D, points: PaintRoutePoint[], greenZones: PaintZone[] = []): void {
  if (isMapBeautyDisabled() || points.length < 2) return;
  const segments = points.slice(1).map((end, i) => new THREE.Vector4(points[i]!.x, points[i]!.z, end.x, end.z));
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.domeCanalSegments = { value: segments };
      shader.uniforms.domeCanalEarth = { value: new THREE.Color('#af8b69') };
      shader.uniforms.domeCanalBed = { value: new THREE.Color(greenZones.length ? '#b39b74' : '#777467') };
      shader.uniforms.redFieldsGreen = { value: new THREE.Color('#82916e') };
      shader.uniforms.redFieldsZones = { value: greenZones.map(z => new THREE.Vector4(z.minX, z.minZ, z.maxX, z.maxZ)) };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vDomeCanal;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDomeCanal = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nvarying vec3 vDomeCanal;\nuniform vec4 domeCanalSegments[${segments.length}];\nuniform vec3 domeCanalEarth, domeCanalBed;${greenZones.length ? `\nuniform vec3 redFieldsGreen;\nuniform vec4 redFieldsZones[${greenZones.length}];` : ''}`)
        .replace('#include <map_fragment>', `#include <map_fragment>
float domeCanalDistance = 1000.0;
for (int i = 0; i < ${segments.length}; i++) {
  vec2 a = domeCanalSegments[i].xy, ab = domeCanalSegments[i].zw - a;
  float t = clamp(dot(vDomeCanal.xz - a, ab) / max(dot(ab, ab), 0.001), 0.0, 1.0);
  domeCanalDistance = min(domeCanalDistance, length(vDomeCanal.xz - a - ab * t));
}
float domeCanalInterior = 1.0 - smoothstep(50.0, 63.0, max(abs(vDomeCanal.x), abs(vDomeCanal.z)));
float domeCanalGrain = sin(vDomeCanal.x * 1.7 + sin(vDomeCanal.z * 0.8)) * sin(vDomeCanal.z * 2.3);
vec3 domeCanalPigment = domeCanalEarth * mix(0.82, 1.13, smoothstep(-2.0, 4.0, vDomeCanal.y));
${greenZones.length ? `float redFieldsGreenMask = 0.0;
for (int i = 0; i < ${greenZones.length}; i++) {
  vec4 zone = redFieldsZones[i];
  vec2 inset = min(vDomeCanal.xz - zone.xy, zone.zw - vDomeCanal.xz);
  redFieldsGreenMask = max(redFieldsGreenMask, smoothstep(0.0, 2.0, min(inset.x, inset.y)));
}
domeCanalPigment = mix(domeCanalPigment, redFieldsGreen, redFieldsGreenMask * 0.82);` : ''}
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalPigment * (1.0 + domeCanalGrain * 0.035), ${greenZones.length ? '0.48' : '0.58'} * domeCanalInterior);
float domeCanalBedMask = 1.0 - smoothstep(1.3, 2.1, domeCanalDistance);
float domeCanalShoulder = smoothstep(1.5, 2.1, domeCanalDistance) * (1.0 - smoothstep(2.8, 3.8, domeCanalDistance));
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalBed * (0.94 + domeCanalGrain * 0.04), ${greenZones.length ? '0.48' : '0.68'} * domeCanalBedMask * domeCanalInterior);
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalEarth * 1.22, ${greenZones.length ? '0.18' : '0.35'} * domeCanalShoulder * domeCanalInterior);`);
    };
    material.customProgramCacheKey = () => `redfields-dry-route-v2:${segments.length}:${greenZones.length}`;
    material.needsUpdate = true;
  }
}

/** Separate existing shelves from their lower ground without moving any surface. */
function gradeTerrainByHeight(model: THREE.Object3D, lowColor: string, highColor: string, lowHeight: number, highHeight: number, paintMix: number): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.heightPaintLow = { value: new THREE.Color(lowColor) };
      shader.uniforms.heightPaintHigh = { value: new THREE.Color(highColor) };
      shader.uniforms.heightPaintRange = { value: new THREE.Vector2(lowHeight, highHeight) };
      shader.uniforms.heightPaintMix = { value: paintMix };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vHeightPaint;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHeightPaint = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vHeightPaint;\nuniform vec3 heightPaintLow, heightPaintHigh;\nuniform vec2 heightPaintRange;\nuniform float heightPaintMix;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float heightPaintInterior = 1.0 - smoothstep(48.0, 64.0, max(abs(vHeightPaint.x), abs(vHeightPaint.z)));
float heightPaintFactor = smoothstep(heightPaintRange.x, heightPaintRange.y, vHeightPaint.y);
diffuseColor.rgb = mix(diffuseColor.rgb, mix(heightPaintLow, heightPaintHigh, heightPaintFactor), heightPaintMix * heightPaintInterior);`);
    };
    material.customProgramCacheKey = () => 'terrain-height-pigment-v1';
    material.needsUpdate = true;
  }
}

/** Prepared boiler aprons and combed earth follow the existing terrace/bed coordinates. */
function clarifyPressureGardenTerraces(model: THREE.Object3D, detailTextureUrl?: string): void {
  if (isMapBeautyDisabled() || !detailTextureUrl) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    let disposed = false;
    const gravel = new THREE.TextureLoader().load(detailTextureUrl, texture => { if (disposed) texture.dispose(); });
    gravel.colorSpace = THREE.SRGBColorSpace;
    gravel.wrapS = gravel.wrapT = THREE.RepeatWrapping;
    material.addEventListener('dispose', () => { disposed = true; gravel.dispose(); });
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.gardenGravel = { value: gravel };
      shader.uniforms.gardenWorkedPigment = { value: new THREE.Color('#957957') };
      shader.uniforms.gardenRowPigment = { value: new THREE.Color('#9d8662') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGardenGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGardenGround = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vGardenGround;\nuniform vec3 gardenWorkedPigment;\nuniform vec3 gardenRowPigment;\nuniform sampler2D gardenGravel;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float gardenX = abs(vGardenGround.x), gardenZ = vGardenGround.y;
// The broad dark rectangles belong to the old painted bed, not water depth.
// Keep the carved surface and crossing intact; replace only their pigment.
vec3 gardenStone = texture2D(gardenGravel, vGardenGround / 5.7).rgb;
vec3 gardenFine = texture2D(gardenGravel, mat2(0.8, -0.6, 0.6, 0.8) * vGardenGround / 3.1 + vec2(0.31, 0.67)).rgb;
gardenStone = mix(gardenStone, gardenFine, 0.32);
float gardenBankBreak = sin(vGardenGround.x * 0.73) * 0.27 + sin(vGardenGround.x * 1.91 + gardenZ) * 0.12;
float gardenGravelEdge = 1.0 - smoothstep(5.9 + gardenBankBreak * 0.2, 6.6 + gardenBankBreak * 0.2, abs(gardenZ));
float gardenEnd = 1.0 - smoothstep(44.0, 48.0, gardenX);
float gardenWet = 1.0 - smoothstep(5.65, 6.7, abs(gardenZ));
vec3 gardenBedPigment = gardenStone * mix(vec3(0.94, 0.85, 0.69), vec3(0.46, 0.52, 0.48), gardenWet);
diffuseColor.rgb = mix(diffuseColor.rgb, gardenBedPigment, gardenGravelEdge * gardenEnd);
float gardenWidth = 1.0 - smoothstep(38.0, 44.0, gardenX);
float gardenService = smoothstep(6.25, 9.0, gardenZ) * (1.0 - smoothstep(15.5, 18.0, gardenZ)) * gardenWidth;
float gardenGrowing = smoothstep(11.5, 13.0, gardenX) * (1.0 - smoothstep(37.0, 38.5, gardenX)) * smoothstep(19.5, 21.0, gardenZ) * (1.0 - smoothstep(28.0, 29.5, gardenZ));
diffuseColor.rgb = mix(diffuseColor.rgb, gardenWorkedPigment, gardenService * 0.30);
diffuseColor.rgb = mix(diffuseColor.rgb, gardenRowPigment, gardenGrowing * 0.23);
float gardenRowPhase = abs(sin(vGardenGround.x * 2.85 + sin(gardenZ * 0.19) * 0.18));
float gardenRowInk = 1.0 - smoothstep(0.10, 0.20 + fwidth(gardenRowPhase), gardenRowPhase);
diffuseColor.rgb *= 1.0 - gardenGrowing * gardenRowInk * 0.18;
float gardenBedX = abs(vGardenGround.x - 12.0 * floor(vGardenGround.x / 12.0 + 0.5));
float gardenBed = max(gardenBedX / 2.5, abs(gardenZ - 12.0) / 2.0);
float gardenApron = (1.0 - smoothstep(0.65, 1.20, gardenBed)) * (1.0 - smoothstep(15.0, 16.0, gardenX));
diffuseColor.rgb = mix(diffuseColor.rgb, gardenWorkedPigment * 1.12, gardenApron * 0.18);
float gardenCrest = max(1.0 - smoothstep(0.15, 0.65, abs(gardenZ - 22.4)), 1.0 - smoothstep(0.15, 0.65, abs(gardenZ - 35.4)));
diffuseColor.rgb = mix(diffuseColor.rgb, gardenRowPigment, gardenCrest * gardenWidth * 0.20);`);
    };
    material.customProgramCacheKey = () => 'pressure-garden-worked-terraces-gravel-v2';
    material.needsUpdate = true;
  }
}

/** Bank stones are foreground scenery, not the panorama's depthless sky. */
function preparePressureGardenBanks(model: THREE.Object3D): void {
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || mesh.material.name !== 'GardenBankStone') return;
    const material = mesh.material, compile = material.onBeforeCompile.bind(material);
    const key = material.customProgramCacheKey();
    mesh.renderOrder = 0;
    material.depthWrite = true;
    material.fog = true;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader.replace('gl_Position.z = gl_Position.w * 0.999999;', '');
    };
    material.customProgramCacheKey = () => `${key}|garden-bank-foreground`;
    material.needsUpdate = true;
  });
}

/** Worked yards and pale ballast follow the two published funicular lines and terrace tops. */
function clarifyInclineYards(model: THREE.Object3D): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.inclineEarth = { value: new THREE.Color('#92795c') };
      shader.uniforms.inclineBallast = { value: new THREE.Color('#aaa088') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vInclineGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInclineGround = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vInclineGround;\nuniform vec3 inclineEarth;\nuniform vec3 inclineBallast;')
        .replace('#include <map_fragment>', `#include <map_fragment>
float inclineX = abs(vInclineGround.x), inclineZ = vInclineGround.y;
float inclineDry = smoothstep(6.25, 9.0, abs(inclineZ));
float inclineInterior = 1.0 - smoothstep(38.0, 47.0, max(inclineX, abs(inclineZ)));
float inclineRail = 1.0 - smoothstep(0.75, 1.75, abs(inclineX - 12.0));
diffuseColor.rgb = mix(diffuseColor.rgb, inclineEarth, 0.28 * inclineDry * inclineInterior);
diffuseColor.rgb = mix(diffuseColor.rgb, inclineBallast, 0.42 * inclineRail * inclineDry * inclineInterior);
float inclineCrest = max(1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 13.0)), max(1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 28.0)), 1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 42.0))));
diffuseColor.rgb = mix(diffuseColor.rgb, inclineBallast, 0.22 * inclineCrest * inclineInterior);`);
    };
    material.customProgramCacheKey = () => 'incline-worked-yards-v1';
    material.needsUpdate = true;
  }
}

/** Quiet the canyon's repeated hatch and carry its earth value into the painted apron. */
function clarifyCanyonGround(model: THREE.Object3D, panorama = false): void {
  if (isMapBeautyDisabled()) return;
  const materials = new Set<THREE.MeshStandardMaterial>();
  model.traverse(node => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial) materials.add(mesh.material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.canyonEarth = { value: new THREE.Color('#806a53') };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCanyonGround;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvCanyonGround = (modelMatrix * vec4(position, 1.0)).xyz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vCanyonGround;\nuniform vec3 canyonEarth;');
      if (panorama) {
        // The apron belongs to the panorama mesh, not the heightfield. Preserve sky paint.
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float canyonApron = (1.0 - smoothstep(66.0, 108.0, max(abs(vCanyonGround.x) * 56.0 / 48.0, abs(vCanyonGround.z)))) * (1.0 - smoothstep(1.0, 8.0, vCanyonGround.y));
totalEmissiveRadiance = mix(totalEmissiveRadiance, canyonEarth * 0.32, canyonApron * 0.65);`);
      } else {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
float canyonDry = smoothstep(6.25, 9.0, abs(vCanyonGround.z));
diffuseColor.rgb = mix(diffuseColor.rgb, canyonEarth, 0.34 * canyonDry);
float canyonShelf = smoothstep(0.5, 6.0, vCanyonGround.y);
diffuseColor.rgb *= 1.0 + canyonShelf * 0.10;`);
      }
    };
    material.customProgramCacheKey = () => `canyon-ground-v1-${panorama}`;
    material.needsUpdate = true;
  }
}

function applyNightTerrainPools(model: THREE.Object3D, host: Host, opaqueLandmark = false): void {
  // Carried pools use the rig's steel-blue family at the prior ground tint's luminance.
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!opaqueLandmark) mesh.renderOrder = 0.1;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
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
    if (!opaqueLandmark) host.canvas.dataset.terrain3dPilotNightPoolSources = String(poolCount.value);
  };
  for (const material of materials) {
    if (!(material as THREE.MeshStandardMaterial).isMeshStandardMaterial) continue;
    const compile = material.onBeforeCompile.bind(material);
    // The same physical pools can illuminate a yard standing in them, without
    // inheriting terrain's transparent compositing or disabling its depth.
    if (!opaqueLandmark) {
      material.transparent = true;
      material.depthWrite = false;
    }
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
          `#include <emissivemap_fragment>\nvec3 terrain3dPoolLight = vec3(0.0);\nfor (int terrain3dPoolIndex = 0; terrain3dPoolIndex < ${NIGHT_POOL_SHADER_CAP}; terrain3dPoolIndex++) {\n  if (float(terrain3dPoolIndex) >= uTerrain3dNightPoolCount) break;\n  vec4 terrain3dPool = uTerrain3dNightPools[terrain3dPoolIndex];\n  float terrain3dPoolDistance = distance(vTerrain3dWorld, terrain3dPool.xy);\n  float terrain3dPoolFalloffT = clamp((terrain3dPoolDistance - terrain3dPool.z) / uTerrain3dNightPoolFalloff, 0.0, 1.0);\n  float terrain3dPoolFalloff = pow(1.0 - terrain3dPoolFalloffT, 1.5);\n  float terrain3dPoolCore = 1.0 - smoothstep(0.0, 0.5, terrain3dPoolDistance / max(terrain3dPool.z, 0.0001));\n  vec3 terrain3dPoolWarm = mix(vec3(1.00, 0.485, 0.10), vec3(1.00, 0.62, 0.20), terrain3dPoolCore);\n  vec3 terrain3dPoolTint = mix(vec3(0.329, 0.473, 0.596), terrain3dPoolWarm, step(0.5, terrain3dPool.w));\n  terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n}\ntotalEmissiveRadiance += diffuseColor.rgb * terrain3dPoolLight * uTerrain3dNightPoolDarkness * uTerrain3dNightPoolIntensity;`,
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
  if (!opaqueLandmark) {
    host.canvas.dataset.terrain3dPilotNightPools = 'world-shader';
    host.canvas.dataset.terrain3dPilotNightPoolSources = '0';
  }
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
      surfaceY: heightAt(source.x, source.z) + pool.surfaceY,
      heightAt,
    }));
}

function hidePaintedRelief(host: Host): HiddenRelief[] {
  const objects = new Set<THREE.Object3D>();
  host.scene.traverse((object) => {
    // F-CORR4-18 keeps the contract-owned water and its existing animation/depth.
    // Only the bank, ford paint and old stepping stones yield to the new pack.
    if (host.contractId === 'e10-river' && object.userData.assetSlot === 'terrain.river') return;
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
  const deepSkyGround = contractId === 'e10-ember-shore' || contractId === 'e10-archive-world';
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  if (!Number.isFinite(outerRadius) || (!deepSkyGround && innerChebyshev <= Math.max(halfX, halfZ) + 0.5)) return undefined;
  // The panorama's near ridge starts at radius 161.5; cover the intervening ground.
  if (deepSkyGround) outerRadius = 160;

  // Keep the night ground beyond every square corner and the perimeter landmarks.
  if (contractId === 'e3-moth-season') outerRadius = Math.max(outerRadius, Math.hypot(halfX, halfZ) + 12);

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
      const uvX = (contractId === 'e3-moth-season' || deepSkyGround) ? x : sampleX;
      const uvZ = (contractId === 'e3-moth-season' || deepSkyGround) ? z : sampleZ;
      uvs.push((uvX - bounds.min.x) / (bounds.max.x - bounds.min.x), (bounds.max.z - uvZ) / (bounds.max.z - bounds.min.z));
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
  if (contractId === 'e10-ember-shore') {
    // The two surfaces already meet in position. Match their lighting normals
    // at that join, then blend into the apron over its first two rings.
    const sourcePositions = source.geometry.getAttribute('position');
    const sourceNormals = source.geometry.getAttribute('normal');
    const normals = geometry.getAttribute('normal');
    const edgeNormals = new Map<string, THREE.Vector3>();
    for (let i = 0; i < sourcePositions.count; i += 1) {
      const x = sourcePositions.getX(i), z = sourcePositions.getZ(i);
      if (Math.abs(Math.abs(x) - halfX) < 0.001 || Math.abs(Math.abs(z) - halfZ) < 0.001) {
        edgeNormals.set(`${x.toFixed(3)},${z.toFixed(3)}`, new THREE.Vector3().fromBufferAttribute(sourceNormals, i));
      }
    }
    const blended = new THREE.Vector3();
    for (let ring = 0; ring < 2; ring += 1) for (let i = 0; i < edge.length; i += 1) {
      const [x, z] = edge[i]!;
      const normal = edgeNormals.get(`${x.toFixed(3)},${z.toFixed(3)}`);
      if (!normal) continue;
      const index = ring * edge.length + i;
      blended.fromBufferAttribute(normals, index).lerp(normal, 1 - ring * 0.5).normalize();
      normals.setXYZ(index, blended.x, blended.y, blended.z);
    }
    normals.needsUpdate = true;
  }
  geometry.computeBoundingSphere();
  const material = source.material.clone();
  if (contractId === 'e3-moth-season' || deepSkyGround) {
    const mapped = material as THREE.MeshStandardMaterial;
    if (mapped.map) {
      mapped.map = mapped.map.clone();
      mapped.map.wrapS = mapped.map.wrapT = THREE.MirroredRepeatWrapping;
      mapped.map.needsUpdate = true;
    }
  }
  material.side = THREE.DoubleSide;
  (material as THREE.Material & { fog?: boolean }).fog = deepSkyGround;
  material.depthWrite = false;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.99999;',
    );
  };
  if (contractId === 'e10-archive-world') {
    // The floor must occlude the buried feet of near library scenery.
    material.depthWrite = true;
    material.onBeforeCompile = () => undefined;
    material.customProgramCacheKey = () => 'archive-continuation-depth-v1';
  }
  // THE ATMOSPHERICS SHIFT: this apron — not the panorama — is what a run frame's top edge
  // actually contains once the player crosses onto the far bank. Measured, per contract, in
  // src/world/HorizonApron.ts.
  const apron = horizonApronProfile(contractId);
  if (apron) paintHorizonApron(material, apron);
  const continuation = new THREE.Mesh(geometry, material);
  continuation.receiveShadow = deepSkyGround;
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
    return paintRiverReturn(host);
  }
  const restoreRiverPaint = paintRiverReturn(host);
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
  let landmarkWalkSurfaces: ReturnType<typeof createLandmarkWalkSurfaces> = null;
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
      if (host.archiveRestoration) installArchiveRestoration(nextTerrain, host.archiveRestoration);
      if (host.contractId === 'e1-twin-banks') calmTwinBanksGround(nextTerrain);
      if (host.contractId === 'e1-baron') separateBaronGroundScars(nextTerrain);
      if (host.contractId === 'e2-trestle') calmTrestleApproaches(nextTerrain);
      if (host.contractId === 'e2-pressure-garden') clarifyPressureGardenTerraces(nextTerrain, selected.detailTextureUrl);
      if (host.contractId === 'e2-incline') clarifyInclineYards(nextTerrain);
      if (host.contractId === 'e3-canyon-works') clarifyCanyonGround(nextTerrain);
      if (host.contractId === 'e10-last-claim') paintLastClaimDeck(nextTerrain);
      if (host.contractId === 'e10-river') paintRiverBanks(nextTerrain);
      if (host.contractId === 'e10-ember-shore') clarifyEmberBasalt(nextTerrain, selected.detailTextureUrl);
      if (host.contractId === 'e10-archive-world') clarifyArchiveTerraces(nextTerrain, host.archiveRestoration, selected.detailTextureUrl);
      if (host.contractId === 'e9-devils-alley') gradeTerrainByHeight(nextTerrain, '#9f8b6e', '#bba487', -0.14, 4.57, 0.46);
      if (host.contractId === 'e8-low-orbit') gradeTerrainByHeight(nextTerrain, '#777a76', '#a5a28e', -4.8, 0.7, 0.38);
      if (host.contractId === 'e8-far-side') clarifyFarSideRegolith(nextTerrain);
      if (host.contractId === 'e9-dome-basin' && selected.contract.maskTruth?.canalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.canalRoute.points);
      if (host.contractId === 'e9-old-canal' && selected.contract.maskTruth?.inheritedCanalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.inheritedCanalRoute.points);
      if (host.contractId === 'e9-seed-run' && selected.contract.maskTruth?.caravanRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.caravanRoute, selected.contract.maskTruth.permanentGreenWaypointZones);
      if (host.contractId === 'e6-glow-mesa') gradeTerrainByHeight(nextTerrain, '#9f8867', '#9b9682', 1.5, 4.6, 0.34);
      if (host.contractId === 'e7-relay-rush') gradeTerrainByHeight(nextTerrain, '#898476', '#b2a482', 0.4, 4.6, 0.34);
      if (host.contractId === 'e7-dead-band') gradeTerrainByHeight(nextTerrain, '#888474', '#b2ab92', 0.4, 4.6, 0.34);
      if (host.contractId === 'e6-picnic') gradeTerrainByHeight(nextTerrain, '#9f8867', '#a1a483', 1.5, 4.6, 0.34);
      if (host.contractId === 'e6-half-life-hollow') gradeTerrainByHeight(nextTerrain, '#897c68', '#b9a788', -1.9, 1.8, 0.32);
      if ((host.contractId === 'e4-dust-flats' || host.contractId === 'e4-long-road' || host.contractId === 'e4-gusher-county' || host.contractId === 'e4-boneyard') && selected.contract.maskTruth) clarifyMotorGround(nextTerrain, selected.contract.maskTruth, false, host.contractId === 'e4-gusher-county' ? 0.30 : host.contractId === 'e4-boneyard' ? 0.55 : 0.78);
      if (host.nightMode) applyNightTerrainPools(nextTerrain, host);
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
      if (host.contractId === 'e2-pressure-garden') preparePressureGardenBanks(nextPanorama);
      if (host.contractId === 'e10-archive-world') prepareArchiveLibrary(nextPanorama, selected.detailTextureUrl);
      if (host.contractId === 'e10-ember-shore') clarifyEmberBasalt(nextPanorama, selected.detailTextureUrl, true);
      if (host.contractId === 'e3-canyon-works') clarifyCanyonGround(nextPanorama, true);
      if (host.contractId === 'e4-long-road' && selected.contract.maskTruth) clarifyMotorGround(nextPanorama, selected.contract.maskTruth, true);
      if (selected.contract.waterSurface?.owner === 'runtime DeepwaterClaimTile') {
        host.canvas.dataset.terrain3dPilotSeaApronTriangles = String(routeSeaApron(nextTerrain, nextPanorama, terrainMetrics.bounds));
      }
      const nextSkirt = createContinuation(nextTerrain, nextPanorama, heightAt, terrainMetrics.bounds, host.contractId);
      if (host.contractId === 'e10-river' && nextSkirt) paintRiverBanks(nextSkirt);
      if (host.contractId === 'e10-ember-shore' && nextSkirt) clarifyEmberBasalt(nextSkirt, selected.detailTextureUrl);
      if (host.contractId === 'e10-archive-world' && nextSkirt) clarifyArchiveTerraces(nextSkirt, host.archiveRestoration, selected.detailTextureUrl);
      if (host.contractId === 'e3-moth-season' && host.nightMode && nextSkirt) {
        const material = nextSkirt.material as THREE.Material;
        const programKey = material.customProgramCacheKey();
        const renderOrder = nextSkirt.renderOrder;
        applyNightTerrainPools(nextSkirt, host);
        nextSkirt.renderOrder = renderOrder;
        material.customProgramCacheKey = () => `${programKey}|night-terrain-pools`;
      }
      const nextChannelWater = createChannelWater(host.contractId, selected.contract, heightAt);
      terrain = nextTerrain;
      panorama = nextPanorama;
      skirt = nextSkirt;
      channelWater = nextChannelWater;
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      const pointerSurfaces: THREE.Object3D[] = [nextTerrain, ...nextPonds.map(pond => pond.group)];
      if (nextChannelWater) pointerSurfaces.push(nextChannelWater);
      uninstallHeightSource = installVisualHeightSource(heightAt, pointerSurfaces);
      host.onVisualHeightSourceInstalled?.();
      host.scene.add(nextTerrain, nextPanorama);
      if (nextSkirt) host.scene.add(nextSkirt);
      ponds = nextPonds;
      nextPonds = [];
      for (const pond of ponds) host.scene.add(pond.group);
      host.canvas.dataset.terrain3dPilotSpringPonds = String(ponds.length);
      host.canvas.dataset.terrain3dPilotSpringPondWaterRadii = JSON.stringify(ponds.map((pond) => pond.waterRadius));
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
        if (sculptWater) pointerSurfaces.push(sculptWater.mesh);
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
      host.canvas.dataset.terrain3dPilotSkirtBlend = 'opaque-sculpt-edge';
      host.canvas.dataset.terrain3dPilotPanoramaFog = 'excluded';
      host.canvas.dataset.terrain3dPilotPanoramaDepth = 'screen-horizon-backdrop';
      const mounts = landmarkMountsFor(selected.contract, host.contractId);
      host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);
      const closureCensus = new Map<string, ClosureCensus>();
      const diagnostics: string[] = [];
      const nextLandmarks = new THREE.Group();
      nextLandmarks.name = 'Terrain3dLandmarks';
      nextLandmarks.userData.renderOnly = true;
      const loadMount = async (mount: LandmarkMount): Promise<THREE.Object3D | undefined> => {
        try {
          const key = landmarkAssetKey(mount.asset!);
          const resolveUrl = LANDMARK_ASSETS[key];
          if (!resolveUrl) {
            diagnostics.push(`${mount.id}: asset unavailable`);
            return undefined;
          }
          // Each placement owns its scene and paint; cached Object3Ds reparent earlier mounts.
          const model = (await loader.loadAsync(await resolveUrl())).scene;
          model.name = mount.id;
          model.userData.landmarkAsset = key;
          model.userData.renderOnly = true;
          model.position.set(mount.position[0], heightAt(mount.position[0], mount.position[2]) + mount.position[1], mount.position[2]);
          model.rotation.set(...mount.rotation);
          model.scale.fromArray(mount.scale);
          inspect(model, false);
          // F-ASTRA-9: verified backface culling runs on EVERY mounted body, night shift included —
          // it is a geometry verdict, not a paint one, and it changes no lighting.
          closureCensus.set(mount.id, cullVerifiedClosedMeshes(model, mount.id));
          if (host.contractId !== 'e1-night-shift') {
            const live = LIVE_SPRING_POND_CONTRACTS.has(host.contractId) && mount.id === 'isolated_spring';
            const contractIntensity = LANDMARK_EMISSIVE[host.contractId];
            const paint = live
              ? { intensity: DRY_GULCH_SPRING_EMISSIVE, tint: DEFAULT_LANDMARK_PAINT.tint }
              : (LANDMARK_PAINT[host.contractId]?.[mount.id]
                ?? (contractIntensity !== undefined ? { intensity: contractIntensity, tint: DEFAULT_LANDMARK_PAINT.tint } : DEFAULT_LANDMARK_PAINT));
            keepLandmarkPaintReadable(model, paint, host.contractId);
          } else if (mount.id === 'lampworks_yard') {
            // Light-reactive paint, not whole-body emission. The cold seven
            // gameplay lanterns retain their real wrecked/relit states.
            model.traverse((node) => {
              const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
              if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial) {
                mesh.material.color.multiplyScalar(1.65);
              }
            });
            applyNightTerrainPools(model, host, true);
          }
          if (host.contractId === 'e1-baron' && BARON_SWAY_AMPLITUDE[mount.id] !== undefined) {
            installBannerSway(model, BARON_SWAY_AMPLITUDE[mount.id]!);
          }
          dressLandmark(model, host.contractId, mount.id);
          if (host.contractId === 'e10-river') paintRiverStones(model);
          if (host.archiveRestoration) installArchiveRestoration(model, host.archiveRestoration);
          if (host.contractId === 'e10-archive-world') lightArchiveFacade(model, host.archiveRestoration);
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
        try {
          landmarkWalkSurfaces = createLandmarkWalkSurfaces(heightAt,
            nextLandmarks.children.map(model => ({ model, mount: mounts.find(mount => mount.id === model.name)! })));
        } catch (error) {
          disposeObject3D(nextLandmarks);
          host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'failed';
          host.canvas.dataset.terrain3dPilotLandmarkDiagnostics = `invalid landmark walk surface: ${String(error)}`;
          publish(host.canvas, 'failed', 'painted', terrainMetrics, undefined, panoramaMetrics, 'landmark-walk-surfaces-invalid');
          return;
        }
        if (landmarkWalkSurfaces) {
          uninstallHeightSource?.();
          uninstallHeightSource = installVisualHeightSource(landmarkWalkSurfaces.heightAt,
            [...pointerSurfaces, ...landmarkWalkSurfaces.pointers]);
          host.onVisualHeightSourceInstalled?.();
        }
        host.canvas.dataset.terrain3dPilotWalkSurfaces = String(landmarkWalkSurfaces?.pointers.length ?? 0);
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
        // F-ASTRA-9 census: per-mount closed/open mesh counts and what the verdict did to the
        // material side. Published MEASURED, for the same reason emissiveIntensity is (F-BHM-1) —
        // a table lookup would keep reporting the intent after a later pass overwrote the render.
        {
          const box = new THREE.Box3();
          const rows = nextLandmarks.children.flatMap((model) => {
            const row = closureCensus.get(model.name);
            if (!row) return [];
            box.setFromObject(model);
            // The body's own vertical extent, so a probe can be aimed at the WALL rather than at
            // the ground in front of a lattice headframe (the reference rig's first false reading).
            return [{ ...row, baseY: +box.min.y.toFixed(3), topY: +box.max.y.toFixed(3) }];
          });
          const total = rows.reduce((sum: { meshes: number; closed: number; open: number; culled: number; doubleSided: number }, row) => ({
            meshes: sum.meshes + row.meshes,
            closed: sum.closed + row.closed,
            open: sum.open + row.open,
            culled: sum.culled + row.culled,
            doubleSided: sum.doubleSided + row.doubleSided,
          }), { meshes: 0, closed: 0, open: 0, culled: 0, doubleSided: 0 });
          host.canvas.dataset.terrain3dPilotLandmarkSides = JSON.stringify({ total, mounts: rows });
        }
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
          const authored = standard
            .map((material) => material.userData.landmarkAuthoredEmissive as number | undefined)
            .filter((value): value is number => typeof value === 'number');
          return {
            id: model.name,
            total: materials.size,
            transparent: [...materials].filter((material) => material.transparent).length,
            depthWriteDisabled: [...materials].filter((material) => !material.depthWrite).length,
            emissiveIntensity: intensities.length ? [Math.min(...intensities), Math.max(...intensities)] : [],
            authoredEmissive: authored.length ? [Math.min(...authored), Math.max(...authored)] : [],
            frontSided: [...materials].filter((material) => material.side === THREE.FrontSide).length,
            doubleSided: [...materials].filter((material) => material.side === THREE.DoubleSide).length,
            roughness: standard.length ? +Math.min(...standard.map((material) => material.roughness)).toFixed(3) : null,
            metalness: standard.length ? +Math.max(...standard.map((material) => material.metalness)).toFixed(3) : null,
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
    restoreRiverPaint();
    host.canvas.removeEventListener('webglcontextlost', onContextLost);
    disposeLoaded();
    uninstallHeightSource?.();
    uninstallHeightSource = undefined;
    landmarkWalkSurfaces?.dispose();
    landmarkWalkSurfaces = null;
    delete host.canvas.dataset.terrain3dPilotWalkSurfaces;
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
      delete host.canvas.dataset.terrain3dPilotSeaApronTriangles;
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
  'e2-trestle': { 'trestle-crossing': { intensity: 2.6, tint: '#ffffff' }, 'south-boiler-site': { intensity: 2.5, tint: '#e4e5e7' }, 'north-boiler-site': { intensity: 2.5, tint: '#e4e5e7' }, 'mine-spur-kit': { intensity: 2.2, tint: '#efe2cc' }, 'south-approach-kit': { intensity: 2.2, tint: '#ffffff' }, 'north-approach-kit': { intensity: 2.2, tint: '#ffffff' }, },
  'e2-pressure-garden': { 'garden-pressure-manifold': { intensity: 3, tint: '#e4e5e7' }, 'water-band-pump-station': { intensity: 3, tint: '#e4e5e7' }, 'west-terrace-pipe-header': { intensity: 3, tint: '#e4e5e7' }, 'east-terrace-pipe-header': { intensity: 3, tint: '#e4e5e7' }, 'coal-seam-service-winch': { intensity: 3, tint: '#e4e5e7' }, },
  'e2-incline': { 'upper-ore-cable-house': { intensity: 2.5, tint: '#e0e3df' }, 'west-line-brake-tower': { intensity: 2.5, tint: '#e0e3df' }, 'east-line-brake-tower': { intensity: 2.5, tint: '#e0e3df' }, },
  'e1-baron': {
    fortified_far_bank: { intensity: 2.5, tint: '#aab5bb' },
    siege_line: { intensity: 2.2, tint: '#a8b0b4' },
    seized_headframe: { intensity: 2.4, tint: '#b6b6b0' },
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
