import { installArchiveRestoration } from "/src/world/ArchiveRestoration.ts";
import * as THREE from "/node_modules/.vite/deps/three.js?v=54c40bf9";
import baronContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/baron-terrain-contract.json?import&raw";
import baronPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/baron-panorama-contract.json?import&raw";
import dryGulchContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-terrain-contract.json?import&raw";
import dryGulchPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-panorama-contract.json?import&raw";
import hillMineContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-terrain-contract.json?import&raw";
import hillMinePanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-panorama-contract.json?import&raw";
import nightShiftContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/night-shift-terrain-contract.json?import&raw";
import nightShiftPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/night-shift-panorama-contract.json?import&raw";
import claimContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json?import&raw";
import claimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/the-claim-panorama-contract.json?import&raw";
import twinBanksContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json?import&raw";
import twinBanksPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-panorama-contract.json?import&raw";
import trestleContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/trestle-terrain-contract.json?import&raw";
import trestlePanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/trestle-panorama-contract.json?import&raw";
import blackoutRidgeContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-terrain-contract.json?import&raw";
import blackoutRidgePanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-panorama-contract.json?import&raw";
import fairgroundContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/fairground-terrain-contract.json?import&raw";
import fairgroundPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/fairground-panorama-contract.json?import&raw";
import dustFlatsContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-terrain-contract.json?import&raw";
import dustFlatsPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-panorama-contract.json?import&raw";
import deepwaterClaimContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json?import&raw";
import deepwaterClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama-contract.json?import&raw";
import glowMesaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json?import&raw";
import glowMesaPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama-contract.json?import&raw";
import relayValleyContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain-contract.json?import&raw";
import relayValleyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama-contract.json?import&raw";
import mareClaimContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain-contract.json?import&raw";
import farSideContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/far-side-terrain-contract.json?import&raw";
import mareClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama-contract.json?import&raw";
import domeBasinContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-terrain-contract.json?import&raw";
import domeBasinPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-panorama-contract.json?import&raw";
import emberShoreContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-terrain-contract.json?import&raw";
import emberShorePanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-panorama-contract.json?import&raw";
import archiveWorldContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/archive-world-terrain-contract.json?import&raw";
import archiveWorldPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/archive-world-panorama-contract.json?import&raw";
import boneyardContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/boneyard-terrain-contract.json?import&raw";
import boneyardPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/boneyard-panorama-contract.json?import&raw";
import canyonWorksContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-terrain-contract.json?import&raw";
import canyonWorksPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-panorama-contract.json?import&raw";
import devilsAlleyContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-terrain-contract.json?import&raw";
import devilsAlleyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-panorama-contract.json?import&raw";
import echoCanyonContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-terrain-contract.json?import&raw";
import echoCanyonPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-panorama-contract.json?import&raw";
import gusherCountyContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-terrain-contract.json?import&raw";
import gusherCountyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-panorama-contract.json?import&raw";
import relayRushContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-rush-terrain-contract.json?import&raw";
import deadBandContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dead-band-terrain-contract.json?import&raw";
import picnicContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/picnic-terrain-contract.json?import&raw";
import halfLifeHollowContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json?import&raw";
import halfLifeHollowPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-panorama-contract.json?import&raw";
import inclineContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/incline-terrain-contract.json?import&raw";
import inclinePanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/incline-panorama-contract.json?import&raw";
import longRoadContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/long-road-terrain-contract.json?import&raw";
import longRoadPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/long-road-panorama-contract.json?import&raw";
import lowOrbitContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-terrain-contract.json?import&raw";
import lowOrbitPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-panorama-contract.json?import&raw";
import mothSeasonContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/moth-season-terrain-contract.json?import&raw";
import mothSeasonPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/moth-season-panorama-contract.json?import&raw";
import oldCanalContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/old-canal-terrain-contract.json?import&raw";
import oldCanalPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/old-canal-panorama-contract.json?import&raw";
import pressureGardenContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-terrain-contract.json?import&raw";
import pressureGardenPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-panorama-contract.json?import&raw";
import regattaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/regatta-terrain-contract.json?import&raw";
import regattaPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/regatta-panorama-contract.json?import&raw";
import seedRunContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/seed-run-terrain-contract.json?import&raw";
import seedRunPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/seed-run-panorama-contract.json?import&raw";
import showroomContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/showroom-terrain-contract.json?import&raw";
import showroomPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/showroom-panorama-contract.json?import&raw";
import { performanceTierDiagnostics } from "/src/game/PerformanceTier.ts";
import { reportRenderDemotion } from "/src/telemetry/runBeacon.ts";
import { isMapBeautyDisabled, isPoolGradeDisabled } from "/src/core/DebugParams.ts";
import { RenderLayers } from "/src/core/RenderLayers.ts";
import { farGroundProbeMode, horizonApronProfile, paintFarGroundProbe, paintHorizonApron } from "/src/world/HorizonApron.ts";
import { ledgerSunShadowDirection } from "/src/world/LightRig.ts";
import { Balance } from "/src/game/Balance.ts";
import { disposeObject3D } from "/src/utils/dispose.ts";
import { trackedGltfLoader } from "/src/assets/AssetLoading.ts";
import * as Terrain from "/src/world/Terrain.ts";
import { createSculptWater } from "/src/world/Water.ts";
import { createSunMotes } from "/src/world/SunMotes.ts";
import { createSteamPlume } from "/src/world/SteamPlume.ts";
import { createHaulSteam } from "/src/world/HaulSteam.ts";
import { installVisualHeightSource, waterSources } from "/src/world/Terrain.ts";
import { createLandmarkWalkSurfaces } from "/src/world/LandmarkWalkSurfaces.ts";
import { createSpringPondSurface } from "/src/world/Water.ts";
import { createFordSheet, createWaterConfluence, createWaterRibbon, updateWaterMaterial } from "/src/world/Water.ts";
import lastClaimContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/last-claim-terrain-contract.json?import&raw";
import lastClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/last-claim-panorama-contract.json?import&raw";
import riverContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/river-terrain-contract.json?import&raw";
import riverPanoramaContractText from "/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/river-panorama-contract.json?import&raw";
const entry = (terrainUrl, panoramaUrl, contractText, panoramaContractText, dressingText, detailTextureUrl) => {
	const contract = JSON.parse(contractText);
	// Variant dressing supplements the base bodies; the existing mount filter and transforms apply.
	if (dressingText) contract.landmarkMounts = [...contract.landmarkMounts ?? [], ...JSON.parse(dressingText).landmarkMounts ?? []];
	return {
		terrainUrl,
		panoramaUrl,
		contract,
		panoramaContract: JSON.parse(panoramaContractText),
		detailTextureUrl
	};
};
const REGISTRY = {
	"the-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/the-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/the-claim-panorama.glb", '' + import.meta.url).href, claimContractText, claimPanoramaContractText),
	"e1-dry-gulch": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-panorama.glb", '' + import.meta.url).href, dryGulchContractText, dryGulchPanoramaContractText),
	"e1-twin-banks": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-panorama.glb", '' + import.meta.url).href, twinBanksContractText, twinBanksPanoramaContractText),
	"e1-night-shift": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/night-shift-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/night-shift-panorama.glb", '' + import.meta.url).href, nightShiftContractText, nightShiftPanoramaContractText),
	"e1-baron": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/baron-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/baron-panorama.glb", '' + import.meta.url).href, baronContractText, baronPanoramaContractText),
	...__GR_RELEASE_E1__ ? {} : {
		"e2-hill-mine": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-panorama.glb", '' + import.meta.url).href, hillMineContractText, hillMinePanoramaContractText),
		"e2-trestle": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/trestle-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/trestle-panorama.glb", '' + import.meta.url).href, trestleContractText, trestlePanoramaContractText),
		"e3-blackout-ridge": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-panorama.glb", '' + import.meta.url).href, blackoutRidgeContractText, blackoutRidgePanoramaContractText),
		"e3-fairground": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/fairground-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/fairground-panorama.glb", '' + import.meta.url).href, fairgroundContractText, fairgroundPanoramaContractText),
		"e4-dust-flats": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-panorama.glb", '' + import.meta.url).href, dustFlatsContractText, dustFlatsPanoramaContractText),
		"e5-deepwater-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e6-glow-mesa": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb", '' + import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
		"e7-relay-valley": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
		"e8-mare-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
		"e9-dome-basin": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-panorama.glb", '' + import.meta.url).href, domeBasinContractText, domeBasinPanoramaContractText),
		"e10-ember-shore": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-panorama.glb", '' + import.meta.url).href, emberShoreContractText, emberShorePanoramaContractText, undefined, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/sources/ember-shore-fidelity-1/engraved-basalt.png", '' + import.meta.url).href),
		"e2-pressure-garden": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-panorama.glb", '' + import.meta.url).href, pressureGardenContractText, pressureGardenPanoramaContractText, undefined, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/sources/e2-pressure-garden-fidelity-2/engraved-river-gravel.png", '' + import.meta.url).href),
		"e2-incline": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/incline-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/incline-panorama.glb", '' + import.meta.url).href, inclineContractText, inclinePanoramaContractText),
		"e3-canyon-works": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-panorama.glb", '' + import.meta.url).href, canyonWorksContractText, canyonWorksPanoramaContractText),
		"e3-moth-season": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/moth-season-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/moth-season-panorama.glb", '' + import.meta.url).href, mothSeasonContractText, mothSeasonPanoramaContractText),
		"e4-long-road": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/long-road-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/long-road-panorama.glb", '' + import.meta.url).href, longRoadContractText, longRoadPanoramaContractText),
		"e4-gusher-county": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-panorama.glb", '' + import.meta.url).href, gusherCountyContractText, gusherCountyPanoramaContractText),
		"e4-boneyard": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/boneyard-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/boneyard-panorama.glb", '' + import.meta.url).href, boneyardContractText, boneyardPanoramaContractText),
		"e5-regatta": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/regatta-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/regatta-panorama.glb", '' + import.meta.url).href, regattaContractText, regattaPanoramaContractText),
		// Deepwater Claim aliases: these campaign variants intentionally reuse its terrain and panorama.
		"e5-stillwater": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e5-flotilla": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e6-showroom": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/showroom-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/showroom-panorama.glb", '' + import.meta.url).href, showroomContractText, showroomPanoramaContractText),
		"e6-half-life-hollow": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-panorama.glb", '' + import.meta.url).href, halfLifeHollowContractText, halfLifeHollowPanoramaContractText),
		// Picnic retains the Glow Mesa sculpt and collision-backed bodies, adding its nonblocking dressing.
		"e6-picnic": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb", '' + import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText, picnicContractText, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/sources/e6-picnic-fidelity-2/picnic-ground-clean.png", '' + import.meta.url).href),
		"e7-echo-canyon": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-panorama.glb", '' + import.meta.url).href, echoCanyonContractText, echoCanyonPanoramaContractText),
		// Relay Valley aliases: both signal variants reuse its terrain and panorama.
		"e7-dead-band": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, deadBandContractText),
		"e7-relay-rush": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, relayRushContractText),
		// Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt.
		"e8-far-side": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText, farSideContractText),
		"e8-low-orbit": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-panorama.glb", '' + import.meta.url).href, JSON.stringify({
			...JSON.parse(lowOrbitContractText),
			boundsMeters: {
				min: [
					-64,
					-64,
					-5.869689
				],
				max: [
					64,
					64,
					1.08
				]
			}
		}), lowOrbitPanoramaContractText),
		"e8-eclipse": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
		"e9-seed-run": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/seed-run-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/seed-run-panorama.glb", '' + import.meta.url).href, JSON.stringify({
			...JSON.parse(seedRunContractText),
			boundsMeters: {
				min: [
					-64,
					-64,
					-.14
				],
				max: [
					64,
					64,
					3.715142
				]
			}
		}), seedRunPanoramaContractText),
		"e9-devils-alley": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-panorama.glb", '' + import.meta.url).href, JSON.stringify({
			...JSON.parse(devilsAlleyContractText),
			boundsMeters: {
				min: [
					-64,
					-64,
					-.14
				],
				max: [
					64,
					64,
					4.567115
				]
			}
		}), devilsAlleyPanoramaContractText),
		"e9-old-canal": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/old-canal-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/old-canal-panorama.glb", '' + import.meta.url).href, JSON.stringify({
			...JSON.parse(oldCanalContractText),
			boundsMeters: {
				min: [
					-64,
					-64,
					-1.42
				],
				max: [
					64,
					64,
					2.906317
				]
			}
		}), oldCanalPanoramaContractText),
		"e10-archive-world": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/archive-world-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/archive-world-panorama.glb", '' + import.meta.url).href, archiveWorldContractText, archiveWorldPanoramaContractText, undefined, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/sources/archive-world-fidelity-1/engraved-masonry.png", '' + import.meta.url).href),
		"e10-last-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/last-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/last-claim-panorama.glb", '' + import.meta.url).href, lastClaimContractText, lastClaimPanoramaContractText),
		"e10-river": entry(new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/river-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/Gold%20Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/river-panorama.glb", '' + import.meta.url).href, riverContractText, riverPanoramaContractText)
	}
};
const LANDMARK_ASSETS = /* #__PURE__ */ Object.assign({"../../assets/pilots/assay-office-3d/assay-office.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/assay-office-3d/assay-office.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/catalog-warehouse-3d/catalog-warehouse.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/catalog-warehouse-3d/catalog-warehouse.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/chapel-3d/chapel.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/claim-office-3d/claim-office.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/general-store-3d/general-store.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/archive-entry-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/archive-entry-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/east-stack-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/east-stack-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/ours-unless-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/ours-unless-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/warning-shelf-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/warning-shelf-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/west-stack-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/west-stack-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/fortified_far_bank.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/fortified_far_bank.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/oxblood_banners.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/oxblood_banners.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/rocket_cart.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/rocket_cart.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/seized_headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/seized_headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/siege_line.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/siege_line.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/blackout-watch-lamp.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/blackout-watch-lamp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/breath-bank-service-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/breath-bank-service-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/off-map-current-receiver.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/off-map-current-receiver.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/ridge-switch-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/ridge-switch-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/trunk-line-breaker-shelter.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/trunk-line-breaker-shelter.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-a.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-b.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-c.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-c.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-a.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-b.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-c.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-c.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/half-buried-sleeper.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/half-buried-sleeper.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-a.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-b.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-east.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-east.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-west.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-west.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/unmarked-wagon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/unmarked-wagon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/dam-crest-gate-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/dam-crest-gate-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/downriver-tram-lamp.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/downriver-tram-lamp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/east-switchback-line-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/east-switchback-line-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/sub-hall-dynamo-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/sub-hall-dynamo-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/west-switchback-line-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/west-switchback-line-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/dead-band-yard-null-post.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/dead-band-yard-null-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/east-old-tool-cache.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/east-old-tool-cache.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/iron-shadow-warning-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/iron-shadow-warning-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/north-silence-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/north-silence-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/west-old-tool-cache.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/west-old-tool-cache.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/center-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/center-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/east-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/east-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/north-anchor-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/north-anchor-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/south-anchor-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/south-anchor-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/west-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/west-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/ark-yard-scaffold.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/ark-yard-scaffold.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/canal-gate-works.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/canal-gate-works.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/dust-devil-warning-mast.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/dust-devil-warning-mast.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/ice-quarry-hoist.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/ice-quarry-hoist.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/seed-row-weather-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/seed-row-weather-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/abandoned_farmhouse.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/abandoned_farmhouse.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/bison_skeleton.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/bison_skeleton.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/cactus_thicket.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/cactus_thicket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/isolated_spring.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/isolated_spring.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/ruined_mining_operation.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/ruined_mining_operation.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/dry-wash-recovery-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/dry-wash-recovery-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/east-horizon-fuel-reserve.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/east-horizon-fuel-reserve.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/north-railhead-storm-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/north-railhead-storm-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/south-grade-charting-post.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/south-grade-charting-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/west-road-wrecker-shed.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/west-road-wrecker-shed.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/east-echo-array.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/east-echo-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/mirror-observation-post.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/mirror-observation-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/north-return-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/north-return-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/south-broadcast-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/south-broadcast-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/west-echo-array.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/west-echo-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/east-rim-solar-witness.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/east-rim-solar-witness.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/eclipse-shadow-dial.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/eclipse-shadow-dial.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/launch-shadow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/launch-shadow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/mass-driver-eclipse-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/mass-driver-eclipse-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/west-rim-solar-witness.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/west-rim-solar-witness.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/center-vein-bridge-school.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/center-vein-bridge-school.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/cooled-titan-shelf.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/cooled-titan-shelf.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/last-warm-vent-altar.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/last-warm-vent-altar.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/shore-preserve-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/shore-preserve-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/west-vein-cooling-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/west-vein-cooling-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/east-mothglass-prize-cage.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/east-mothglass-prize-cage.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/fair-bell-battery-kiosk.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/fair-bell-battery-kiosk.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/north-crowd-counting-rostrum.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/north-crowd-counting-rostrum.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/south-midway-admission-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/south-midway-admission-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/west-current-calliope-wagon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/west-current-calliope-wagon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/east-suit-cache-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/east-suit-cache-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/far-horizon-listening-post.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/far-horizon-listening-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/far-side-landing-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/far-side-landing-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/probe-recovery-cradle.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/probe-recovery-cradle.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/west-comms-shadow-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/west-comms-shadow-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/east-herd-glow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/east-herd-glow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/isotope-cooling-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/isotope-cooling-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/mesa-starstone-derrick.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/mesa-starstone-derrick.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/six-vein-control-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/six-vein-control-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/west-herd-glow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/west-herd-glow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/county-camp-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/county-camp-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-01.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-01.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-02.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-02.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-03.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-03.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-04.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-04.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-05.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-05.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-06.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-06.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-07.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-07.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-08.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-08.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/outhouse-geyser.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/outhouse-geyser.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/east-hollow-warning-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/east-hollow-warning-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/expired-appliance-convoy.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/expired-appliance-convoy.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/north-extraction-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/north-extraction-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/south-countdown-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/south-countdown-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/west-hollow-warning-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/west-hollow-warning-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/boiler-house-site.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/boiler-house-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/flooded-gallery.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/flooded-gallery.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/mine-mouth-and-ruined-headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/mine-mouth-and-ruined-headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/switchback-rail-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/switchback-rail-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/tailings-and-scree-pack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/tailings-and-scree-pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/east-line-brake-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/east-line-brake-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/ford-service-pump.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/ford-service-pump.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/lower-yard-engine-crane.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/lower-yard-engine-crane.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/upper-ore-cable-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/upper-ore-cable-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/west-line-brake-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/west-line-brake-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/central-orrery.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/central-orrery.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-lantern.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-lantern.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-portrait.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-portrait.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-pan-theme-song.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-pan-theme-song.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/stern-memory-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/stern-memory-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/convoy-lead-hauler-start.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/convoy-lead-hauler-start.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/east-railhead.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/east-railhead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/east-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/east-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/middle-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/middle-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/west-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/west-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/claw-carcass-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/claw-carcass-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/east-scaffold-handhold-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/east-scaffold-handhold-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/north-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/north-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/south-return-beacon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/south-return-beacon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/west-scaffold-handhold-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/west-scaffold-handhold-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/earthrise-listening-array.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/earthrise-listening-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/east-rim-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/east-rim-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/lava-tube-survey-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/lava-tube-survey-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/regolith-core-yard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/regolith-core-yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/west-rim-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/west-rim-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-dome/air-pad-dome.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-dome/air-pad-dome.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/east-tithe-bell-house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/east-tithe-bell-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/mothglass-counting-cage.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/mothglass-counting-cage.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/north-migration-watch-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/north-migration-watch-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/south-quiet-road-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/south-quiet-road-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/west-lamplighter-refuge.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/west-lamplighter-refuge.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/motor-hauler/motor-hauler.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/motor-hauler/motor-hauler.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/central_ford.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/central_ford.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/dark_rock_shoulders.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/dark_rock_shoulders.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/lampworks_yard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/lampworks_yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/night_work_road.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/night_work_road.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/seven_lantern_terraces.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/seven_lantern_terraces.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-a-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-a-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-b-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-b-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-c-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-c-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/north-outflow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/north-outflow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/south-survey-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/south-survey-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/center-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/center-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/east-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/east-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/mesa-civilian-shade.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/mesa-civilian-shade.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/picnic-staging-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/picnic-staging-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/west-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/west-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/coal-seam-service-winch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/coal-seam-service-winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/east-terrace-pipe-header.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/east-terrace-pipe-header.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/garden-pressure-manifold.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/garden-pressure-manifold.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/water-band-pump-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/water-band-pump-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/west-terrace-pipe-header.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/west-terrace-pipe-header.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/finish-line-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/finish-line-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/judges-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/judges-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/midcourse-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/midcourse-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/northeast-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/northeast-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/northwest-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/northwest-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-port.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-port.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-starboard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-starboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/start-line-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/start-line-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r1-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r1-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r2-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r2-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r3-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r3-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r4-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r4-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-start-horn.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-start-horn.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/dead-gap-charting-station.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/dead-gap-charting-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/drone-recovery-beacon.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/drone-recovery-beacon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/east-ridge-dish-cluster.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/east-ridge-dish-cluster.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/valley-cable-drum-yard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/valley-cable-drum-yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/west-ridge-dish-cluster.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/west-ridge-dish-cluster.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/river/ford-wet-stones.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/river/ford-wet-stones.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/river/north-east-shore.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/river/north-east-shore.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/river/north-west-shore.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/river/north-west-shore.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/river/south-east-shore.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/river/south-east-shore.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/river/south-west-shore.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/river/south-west-shore.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/center-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/center-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/east-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/east-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/north-basin-waygate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/north-basin-waygate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/south-seed-caravan-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/south-seed-caravan-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/west-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/west-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/abandoned-catalog-office.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/abandoned-catalog-office.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/catalog-sorting-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/catalog-sorting-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/east-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/east-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/east-starburst-billboard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/east-starburst-billboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/north-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/north-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/northeast-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/northeast-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/northwest-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/northwest-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/showroom-entrance-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/showroom-entrance-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/west-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/west-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/west-starburst-billboard.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/west-starburst-billboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/active_headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/active_headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/claim_stake.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/claim_stake.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/maintained_claim_house.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/maintained_claim_house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/riparian_dressing_pack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/riparian_dressing_pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/working_camp.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/working_camp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/mine-spur-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/mine-spur-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/north-approach-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/north-approach-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/north-boiler-site.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/north-boiler-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/south-approach-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/south-approach-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/south-boiler-site.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/south-boiler-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-crossing.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-crossing.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_homestead.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_homestead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_winch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_homestead.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_homestead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_winch.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-1.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-1.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-2.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-2.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-3.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-3.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/bridge-school.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/bridge-school.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-dry.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/canal-segment-dry.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-flowing.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/canal-segment-flowing.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-wet.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/canal-segment-wet.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/charter-press.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/charter-press.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/coal-bin.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/coal-bin.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/crater-rim-set.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/crater-rim-set.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-cruise.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/engine-glow-cruise.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-idle.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/engine-glow-idle.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-ward.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/engine-glow-ward.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/filling-shed.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/filling-shed.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/fuel-rack.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/fuel-rack.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/gauge-post.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/gauge-post.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/harbor-lantern.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/harbor-lantern.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ice-blocks.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/ice-blocks.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/insulator-post.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/insulator-post.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/iron-lamp-post.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/iron-lamp-post.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/journey-flag-line.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/journey-flag-line.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/lander-legs.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/lander-legs.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/motor-roadway.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/motor-roadway.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/net-frame.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/net-frame.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/pipe-run.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/pipe-run.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/preserve-rack.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/preserve-rack.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/pressure-manifold.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/pressure-manifold.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/road-marker.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/road-marker.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/rope-buoy-rack.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/rope-buoy-rack.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/survey-cairn.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/survey-cairn.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/tide-board.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/tide-board.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/transformer-shed.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/transformer-shed.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/water_trough.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/wire-run.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/plaza-props-3d/wire-run.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets/pilots/tavern-3d/tavern.e9.glb?import&url").then(m => m["default"])


});
function landmarkAssetKey(asset) {
	return asset.startsWith("assets/") ? `../../${asset}` : `../../assets/pilots/map-rebuild-spike/${asset}`;
}
function landmarkMountsFor(contract, contractId) {
	return (contract.landmarkMounts ?? []).filter((mount) => mount.asset && (!mount.contractIds || mount.contractIds.includes(contractId)));
}
export async function contractPrefetchUrls(contractId) {
	const selected = REGISTRY[contractId];
	if (!selected) return [];
	const landmarks = await Promise.all(landmarkMountsFor(selected.contract, contractId).flatMap(({ asset }) => asset ? [LANDMARK_ASSETS[landmarkAssetKey(asset)]] : []).filter((resolveUrl) => !!resolveUrl).map((resolveUrl) => resolveUrl().catch(() => "")));
	return [...new Set([
		selected.terrainUrl,
		selected.panoramaUrl,
		...landmarks.filter(Boolean)
	])];
}
const CONTRACT_CHANNEL_WATER = { "e1-twin-banks": {
	surfaceLift: .012,
	// Geometry-only overdraw: the spline can sit 0.21 m inside the piecewise-linear cut at a
	// corner. The sculpt's depth buffer still clips the visible shoreline to the 1.5 m mask.
	edgeBleed: .45,
	bed: {
		deepMeters: .52,
		shoreMeters: .035
	},
	confluences: [{ points: [
		{
			x: -34,
			z: 0,
			halfWidth: 1.9,
			alpha: 0
		},
		{
			x: -32,
			z: 0,
			halfWidth: 1.75,
			alpha: .58
		},
		{
			x: -30.5,
			z: 0,
			halfWidth: 1.6,
			alpha: 1
		},
		{
			x: -28,
			z: 0,
			halfWidth: 1.5,
			alpha: 1
		},
		{
			x: -26.5,
			z: 0,
			halfWidth: 1.85,
			alpha: 1
		},
		{
			x: -25.2,
			z: 0,
			halfWidth: 2.25,
			alpha: .62
		},
		{
			x: -23.8,
			z: 0,
			halfWidth: 2.5,
			alpha: 0
		}
	] }, { points: [
		{
			x: 23.8,
			z: 0,
			halfWidth: 2.5,
			alpha: 0
		},
		{
			x: 25.2,
			z: 0,
			halfWidth: 2.25,
			alpha: .62
		},
		{
			x: 26.5,
			z: 0,
			halfWidth: 1.85,
			alpha: 1
		},
		{
			x: 28,
			z: 0,
			halfWidth: 1.5,
			alpha: 1
		},
		{
			x: 30.5,
			z: 0,
			halfWidth: 1.6,
			alpha: 1
		},
		{
			x: 32,
			z: 0,
			halfWidth: 1.75,
			alpha: .58
		},
		{
			x: 34,
			z: 0,
			halfWidth: 1.9,
			alpha: 0
		}
	] }],
	// Ford depth as a fraction of the wade..deep ramp: a pan a hero walks through, not a channel.
	fordDepth: .06,
	channels: {
		// North runs deep and fast — the gold rides it, and only it: an asymmetric sparkle is how
		// a player learns which channel is the dangerous one without a line of UI. Anchors sit ON
		// the mask centreline (the shader draws each glint as a thin line at the anchor's z, so an
		// anchor off the centreline lights the bank instead of the current).
		"north-channel": {
			depth: "deep",
			glints: [
				{
					x: -19.5,
					z: 2.43
				},
				{
					x: -6.2,
					z: 2.89
				},
				{
					x: 8.1,
					z: 3.16
				},
				{
					x: 19.8,
					z: 2.34
				}
			],
			headInset: 2.4,
			tailInset: 2.4,
			headFade: 2,
			tailFade: 2
		},
		"south-channel": {
			depth: "shallow",
			headInset: 2.4,
			tailInset: 2.4,
			headFade: 2,
			tailFade: 2
		}
	}
} };
const CONTRACT_LANDMARK_DRESSING = { "e1-twin-banks": {
	south_bank_homestead: {
		emissive: [
			1.14,
			.99,
			.74
		],
		lamp: {
			acrossX: .68,
			upY: .56,
			width: .82,
			height: .62
		}
	},
	south_bank_winch: { emissive: [
		1.1,
		.97,
		.8
	] },
	north_bank_homestead: { emissive: [
		.78,
		.88,
		1.02
	] },
	north_bank_winch: { emissive: [
		.8,
		.89,
		1.02
	] }
} };
// Saturated on purpose: ACES tone mapping walks a bright unlit pane toward white, and a lamp
// that reads white reads as a hole in the wall.
const LAMP_COLOUR = "#ff9c38";
const BOUNDS_EPSILON = .03;
const CONTINUATION_SAMPLE_DEPTH = 8;
const LEGACY_GROUND_SLOTS = new Set([
	"terrain.bank",
	"terrain.river",
	"terrain.ford"
]);
const NIGHT_POOL_SHADER_CAP = 32;
const SCULPT_WATER_DRESSING = {
	// Keep the measured dark channel and ford shelf; cool water separates from the warm banks.
	// The Claim concept comparison is recorded in artifacts/map-art-repairs-20260908/claim-water-01/.
	"the-claim": {
		surface: {
			kind: "channel-fill",
			fill: .42
		},
		color: "#99bec7",
		emissive: "#10272c",
		opacity: .8,
		// The carved channel runs ~0.45m below the water line at its deepest; the last
		// ~15cm of depth is the damp margin where the surface fades into wet ground.
		fordSkim: .11,
		deepMeters: .5,
		shoreMeters: .15,
		glints: "harvest"
	},
	// Night Shift's channel used only its dark bed paint. Keep the sculpt and the
	// declared ford; a restrained, sun-lit surface supplies moving water detail.
	// No emission: the unlit river must still become dark during the night phase.
	"e1-night-shift": {
		surface: {
			kind: "channel-fill",
			fill: .42
		},
		color: "#899b9b",
		opacity: .64,
		fordSkim: .08,
		deepMeters: .5,
		shoreMeters: .15,
		glints: [],
		rippleStrength: .32,
		textureBlend: .06,
		fordTint: .3
	},
	// The sculpt hides legacy water. This is the one visible surface, contained
	// by the existing bed and ford, with no extra light or simulation authority.
	"e1-baron": {
		surface: {
			kind: "channel-fill",
			fill: .42
		},
		color: "#849da1",
		opacity: .62,
		fordSkim: .06,
		deepMeters: .5,
		shoreMeters: .15,
		visualHalfWidth: 6.25,
		glints: [],
		rippleStrength: .6,
		textureBlend: .07,
		fordTint: .35
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
	"e2-hill-mine": {
		surface: {
			kind: "channel-fill",
			fill: .42
		},
		color: "#8a8177",
		opacity: .72,
		fordSkim: .11,
		deepMeters: .12,
		shoreMeters: .05,
		visualHalfWidth: 5.9,
		glints: [
			{
				x: -27,
				z: -5.1
			},
			{
				x: 13,
				z: 5.1
			},
			{
				x: 33,
				z: -5.1
			}
		],
		rippleStrength: 1.15,
		textureBlend: 0
	},
	"e2-trestle": {
		surface: {
			kind: "below-gorge-floor",
			quantile: .8,
			drop: .006
		},
		color: "#7e8480",
		opacity: .86,
		fordSkim: .11,
		deepMeters: .42,
		shoreMeters: .16,
		glints: [{
			x: -15.5,
			z: -4.3
		}, {
			x: -4.5,
			z: -4.5
		}],
		rippleStrength: .4,
		textureBlend: .05
	},
	"e2-pressure-garden": {
		surface: {
			kind: "channel-fill",
			fill: .11
		},
		color: "#a2c8d9",
		opacity: .99,
		fordSkim: .11,
		deepMeters: .5,
		shoreMeters: .15,
		bed: false,
		visualHalfWidth: 6.25,
		glints: [
			{
				x: -30,
				z: 4.45
			},
			{
				x: -12,
				z: 4.45
			},
			{
				x: 12,
				z: 4.45
			},
			{
				x: 30,
				z: 4.45
			}
		],
		rippleStrength: .4,
		rippleScale: 1.6,
		depthContrast: .35,
		textureBlend: 0,
		fordTint: .25,
		shoreFadeMeters: 1,
		surfaceLift: true,
		overhangMeters: 10,
		collars: [{
			mount: "garden-pressure-manifold",
			radius: 2.9
		}, {
			mount: "water-band-pump-station",
			radius: 2.6
		}]
	},
	"e2-incline": {
		surface: {
			kind: "channel-fill",
			fill: .42
		},
		color: "#bb9366",
		opacity: .62,
		fordSkim: .125,
		deepMeters: .145,
		shoreMeters: .07,
		visualHalfWidth: 6.25,
		glints: [{
			x: -30,
			z: 4.45
		}, {
			x: 30,
			z: -4.45
		}],
		rippleStrength: .6,
		textureBlend: .2
	}
};
/** The E5 contracts reserve their sea for runtime; the sculpt supplies the visible bed. */
const DEEPWATER_SEA_DRESSING = {
	surface: {
		kind: "sea-level",
		y: 0
	},
	color: "#99bec7",
	opacity: .56,
	fordSkim: 0,
	deepMeters: 8,
	shoreMeters: .5,
	glints: [],
	rippleStrength: .15,
	textureBlend: .1,
	fordTint: 0,
	shoreFadeMeters: 4,
	surfaceLift: false,
	emissive: "#0a2a33"
};
/** Water fades out over the last stretch before the tile edge instead of cutting. */
const SCULPT_WATER_EDGE_FADE = 7;
/** U3: contracts whose mounted landmarks get soft contact ellipses. */
const LANDMARK_CONTACT_CONTRACTS = new Set([
	"the-claim",
	"e2-hill-mine",
	"e2-trestle",
	"e2-pressure-garden",
	"e2-incline"
]);
const SPAN_SHADOW_CONTRACTS = { "e2-trestle": {
	mountId: "trestle-crossing",
	widthScale: .38,
	lengthScale: .48,
	throw: .62,
	opacity: .42,
	color: "#1d1206"
} };
const SPAN_SHADOW_ROWS = 28;
const SPAN_SHADOW_END_TAPER = .16;
const SPAN_SHADOW_LIFT = .012;
const SUN_MOTES = {
	"the-claim": {
		color: "#ffd9a2",
		halfZ: 13,
		centerZ: 4,
		minY: .4,
		maxY: 5,
		size: 2.1,
		seed: 7194
	},
	"e2-hill-mine": {
		color: "#a8794a",
		halfZ: 17,
		centerZ: 7,
		minY: .3,
		maxY: 5.6,
		size: 2.3,
		seed: 11863
	},
	"e2-trestle": {
		color: "#c39a68",
		halfZ: 14,
		centerZ: 0,
		minY: .2,
		maxY: 5.6,
		size: 2.3,
		seed: 15122
	},
	"e2-pressure-garden": {
		color: "#c9a279",
		halfZ: 15,
		centerZ: 31,
		minY: .9,
		maxY: 6.4,
		size: 2.3,
		seed: 11783
	},
	"e2-incline": {
		color: "#e0a878",
		halfZ: 30,
		centerZ: 12,
		minY: .5,
		maxY: 6.4,
		size: 2.2,
		seed: 11797,
		halfXScale: .72
	}
};
/** U5b is the CLAIM's reward note, not every mote map's: the embers need a claim stake to sit on. */
const RUSH_EMBER_CONTRACTS = new Set(["the-claim"]);
const SUN_MOTE_CAP = 200;
const STEAM_ANCHORS = { "e2-hill-mine": [{
	mount: "boiler-house-site",
	acrossX: .255,
	acrossZ: .332,
	upY: 1,
	rise: 8,
	spread: 3,
	size: 46,
	life: 5.4,
	puffs: 34,
	opacity: .5
}, {
	mount: "mine-mouth-and-ruined-headframe",
	acrossX: .5,
	acrossZ: .62,
	upY: .1,
	rise: 3.2,
	spread: 1.7,
	size: 30,
	life: 8.2,
	puffs: 14,
	opacity: .3
}] };
const CROSSING_BREATH_CONTRACTS = { "e2-trestle": {
	wisps: {
		count: 7,
		halfX: 17,
		halfZ: 4,
		lift: 3.1,
		size: 46,
		rise: .34,
		color: "#575049"
	},
	plume: {
		count: 12,
		radius: .7,
		height: 3.4,
		size: 26,
		rise: 1.15,
		color: "#efe9de"
	}
} };
const CROSSING_BREATH_POLL_FRAMES = 30;
/** Warm white, the shipped `BoilerHouse.ts` plume colour. Steam is WHITE (bundle §A1). */
const STEAM_COLOUR = "#fff8e8";
/** Embers on the claim stake while the Rush is live. */
const RUSH_EMBER_COUNT = 26;
/** Ellipse radius as a fraction of the model's footprint — a pool, not a slab. */
const LANDMARK_CONTACT_SPREAD = .46;
/** How far the pool leans away from the body, as a fraction of the body's height. */
const LANDMARK_CONTACT_THROW = .3;
const SCULPT_WATER_MAX_DELTA = .1;
function publish(canvas, state, source, metrics, panorama, panoramaMetrics, demotionReason) {
	canvas.dataset.terrain3dPilotState = state;
	canvas.dataset.terrain3dPilotRenderSource = source;
	canvas.dataset.terrain3dPilotHeightSource = source === "glb" ? "baked-grid" : "painted";
	canvas.dataset.terrain3dPilotMeshes = String(metrics?.meshes ?? 0);
	canvas.dataset.terrain3dPilotTriangles = String(metrics?.triangles ?? 0);
	canvas.dataset.terrain3dPilotMaterials = String(metrics?.materials ?? 0);
	canvas.dataset.terrain3dPilotVertices = String(metrics?.vertices ?? 0);
	canvas.dataset.terrain3dPilotPanorama = panorama?.name ?? "off";
	canvas.dataset.terrain3dPilotPanoramaMeshes = String(panoramaMetrics?.meshes ?? 0);
	canvas.dataset.terrain3dPilotPanoramaTriangles = String(panoramaMetrics?.triangles ?? 0);
	canvas.dataset.terrain3dPilotPanoramaMaterials = String(panoramaMetrics?.materials ?? 0);
	canvas.dataset.terrain3dPilotPanoramaVertices = String(panoramaMetrics?.vertices ?? 0);
	if (demotionReason) reportRenderDemotion(canvas, demotionReason);
}
function inspect(model, receiveShadow) {
	let meshes = 0;
	let triangles = 0;
	let vertices = 0;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		meshes += 1;
		const position = mesh.geometry.getAttribute("position");
		const uniqueVertices = new Set();
		for (let index = 0; index < (position?.count ?? 0); index += 1) {
			uniqueVertices.add(`${position.getX(index)},${position.getY(index)},${position.getZ(index)}`);
		}
		vertices += uniqueVertices.size;
		triangles += Math.floor((mesh.geometry.index?.count ?? position?.count ?? 0) / 3);
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
		mesh.castShadow = false;
		mesh.receiveShadow = receiveShadow;
	});
	return {
		meshes,
		triangles,
		materials: materials.size,
		vertices,
		bounds: new THREE.Box3().setFromObject(model)
	};
}
function validTerrain(metrics, contract) {
	const { min, max } = metrics.bounds;
	const [minX, minZ, minY] = contract.boundsMeters.min;
	const [maxX, maxZ, maxY] = contract.boundsMeters.max;
	return metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles && metrics.materials === contract.materialCount && metrics.vertices === contract.vertices && Math.abs(min.x - minX) <= BOUNDS_EPSILON && Math.abs(min.y - minY) <= BOUNDS_EPSILON && Math.abs(min.z - minZ) <= BOUNDS_EPSILON && Math.abs(max.x - maxX) <= BOUNDS_EPSILON && Math.abs(max.y - maxY) <= BOUNDS_EPSILON && Math.abs(max.z - maxZ) <= BOUNDS_EPSILON;
}
function validPanorama(metrics, contract, mount) {
	return contract.renderOnly && mount.renderOnly && metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles && metrics.materials === contract.materialCount && metrics.vertices === contract.vertices;
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
export function bakeHeightGrid(model, metrics) {
	const mesh = model.getObjectByProperty("isMesh", true);
	const position = mesh.geometry.getAttribute("position");
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
		point.fromBufferAttribute(position, index);
		mesh.localToWorld(point);
		const column = Math.round((point.x - metrics.bounds.min.x) / stepX);
		const row = Math.round((point.z - metrics.bounds.min.z) / stepZ);
		const cell = row * width + column;
		if (column < 0 || column > segments || row < 0 || row > segments || seen[cell]) throw new Error("invalid terrain grid");
		heights[cell] = point.y;
		seen[cell] = 1;
		columns[index] = column;
		rows[index] = row;
	}
	if (seen.some((value) => value !== 1)) throw new Error("incomplete terrain grid");
	// 0 = the cell is split (low,low)..(high,high); 1 = split (high,low)..(low,high).
	const diagonals = new Uint8Array(Math.max(segments * segments, 1));
	const drawn = new Uint8Array(diagonals.length);
	const indices = mesh.geometry.index;
	const triangleCount = Math.floor((indices?.count ?? position.count) / 3);
	for (let triangle = 0; triangle < triangleCount; triangle += 1) {
		const a = indices ? indices.getX(triangle * 3) : triangle * 3;
		const b = indices ? indices.getX(triangle * 3 + 1) : triangle * 3 + 1;
		const c = indices ? indices.getX(triangle * 3 + 2) : triangle * 3 + 2;
		const columnA = columns[a], columnB = columns[b], columnC = columns[c];
		const rowA = rows[a], rowB = rows[b], rowC = rows[c];
		const column = Math.min(columnA, columnB, columnC);
		const row = Math.min(rowA, rowB, rowC);
		if (Math.max(columnA, columnB, columnC) - column !== 1 || Math.max(rowA, rowB, rowC) - row !== 1) {
			throw new Error("invalid terrain topology");
		}
		// Corner bits: 1 = (low,low), 2 = (high,low), 4 = (low,high), 8 = (high,high). A half-cell
		// triangle covers exactly three of them, and the missing one names the diagonal.
		const mask = 1 << (rowA - row) * 2 + columnA - column | 1 << (rowB - row) * 2 + columnB - column | 1 << (rowC - row) * 2 + columnC - column;
		const diagonal = mask === 11 || mask === 13 ? 0 : mask === 14 || mask === 7 ? 1 : -1;
		const cell = row * segments + column;
		if (diagonal < 0 || drawn[cell] && diagonals[cell] !== diagonal) throw new Error("invalid terrain topology");
		diagonals[cell] = diagonal;
		drawn[cell] += 1;
	}
	if (segments > 0 && drawn.some((value) => value !== 2)) throw new Error("incomplete terrain topology");
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
		const low = heights[z0 * width + x0];
		const east = heights[z0 * width + x1];
		const south = heights[z1 * width + x0];
		const high = heights[z1 * width + x1];
		// Each branch is the plane through one drawn triangle's three corners, so the sample sits
		// on the rendered surface rather than near it.
		if (diagonals[z0 * segments + x0] === 0) {
			return fz <= fx ? low + (east - low) * fx + (high - east) * fz : low + (high - south) * fx + (south - low) * fz;
		}
		return fx + fz <= 1 ? low + (east - low) * fx + (south - low) * fz : high + (high - south) * (fx - 1) + (high - east) * (fz - 1);
	};
}
/** The submerged panorama apron uses the bed's world-scale atlas and lighting. */
function routeSeaApron(terrain, panorama, bounds) {
	let source;
	terrain.traverse((object) => {
		const mesh = object;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.map) {
			source = mesh.material;
		}
	});
	if (!source?.map) return 0;
	let triangles = 0;
	panorama.traverse((object) => {
		const mesh = object;
		if (!mesh.isMesh || Array.isArray(mesh.material)) return;
		const geometry = mesh.geometry;
		const position = geometry.getAttribute("position"), uv = geometry.getAttribute("uv");
		if (!geometry.index || !position || !uv) return;
		const bed = [], sky = [], foreground = [], bedVertices = new Set();
		for (let i = 0; i < geometry.index.count; i += 3) {
			const face = [
				geometry.index.getX(i),
				geometry.index.getX(i + 1),
				geometry.index.getX(i + 2)
			];
			// The factory's sea skirt occupies UV rows .84–.972 after the glTF V flip, wholly below sea level.
			// Sky/ridge faces retain the authored panorama material and UVs.
			const isBed = face.every((v) => position.getY(v) < 0 && uv.getY(v) >= .83999 && uv.getY(v) <= .97201);
			// The factory appends wreck silhouettes after the contiguous apron faces.
			// Keep them in a later draw: opaque material sorting would otherwise draw
			// the new bed material over masts at the panorama's shared far-plane depth.
			(isBed ? bed : bed.length ? foreground : sky).push(...face);
			if (isBed) face.forEach((v) => bedVertices.add(v));
		}
		if (!bed.length) return;
		const routed = geometry.clone();
		const routedUv = routed.getAttribute("uv");
		for (const v of bedVertices) routedUv.setXY(v, (position.getX(v) - bounds.min.x) / (bounds.max.x - bounds.min.x), (bounds.max.z - position.getZ(v)) / (bounds.max.z - bounds.min.z));
		routedUv.needsUpdate = true;
		routed.setIndex([...sky, ...bed]);
		routed.clearGroups();
		routed.addGroup(0, sky.length, 0);
		routed.addGroup(sky.length, bed.length, 1);
		const material = source.clone();
		material.map = source.map.clone();
		material.map.wrapS = material.map.wrapT = THREE.MirroredRepeatWrapping;
		material.map.needsUpdate = true;
		material.depthWrite = false;
		material.onBeforeCompile = (shader) => {
			shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;");
		};
		material.customProgramCacheKey = () => "sea-bed-apron-v1";
		mesh.material = [mesh.material, material];
		mesh.geometry = routed;
		if (foreground.length) {
			const foregroundGeometry = geometry.clone();
			foregroundGeometry.setIndex(foreground);
			foregroundGeometry.clearGroups();
			const silhouettes = new THREE.Mesh(foregroundGeometry, mesh.material[0]);
			silhouettes.name = "SeaPanoramaSilhouettes";
			silhouettes.userData.seaPanoramaForeground = true;
			silhouettes.frustumCulled = false;
			silhouettes.renderOrder = mesh.renderOrder + .01;
			mesh.add(silhouettes);
		}
		geometry.dispose();
		triangles += bed.length / 3;
	});
	return triangles;
}
function preparePanorama(model) {
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		mesh.frustumCulled = false;
		mesh.renderOrder = -100;
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
	});
	for (const material of materials) {
		const fogMaterial = material;
		const compile = material.onBeforeCompile.bind(material);
		fogMaterial.fog = false;
		material.transparent = false;
		material.depthWrite = false;
		material.depthTest = true;
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;");
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
const LANDMARK_EMISSIVE = {
	"the-claim": 1.45,
	"e2-hill-mine": 1.45,
	"e2-trestle": 1.5,
	"e2-pressure-garden": 1.45,
	"e2-incline": 1.45,
	"e3-blackout-ridge": 4,
	"e7-relay-valley": 4,
	"e7-echo-canyon": 4
};
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
const LANDMARK_EMISSIVE_WHOLE_BODY_MAX = .6;
/** The calibrated whole-body ink lift: what the legacy default of 3 becomes. */
const LANDMARK_EMISSIVE_CALIBRATED_DEFAULT = .45;
/**
* The paint must not go to mud on a body whose shift graded it far down. Documented as a guard, not
* as tuning: the lowest authored value in the table is 1.28, which lands at 0.192, so as of this
* commit the floor binds on NOTHING. It exists so a future grade below ~0.8 cannot silently reach
* zero and leave a body with no lift at all.
*/
const LANDMARK_EMISSIVE_WHOLE_BODY_MIN = .12;
/**
* Emissive windows and teal systems keep their glow: those are UNLIT paint objects
* (`dressLandmark`'s `MeshBasicMaterial` lamp quads, the night pools' shader term, the water
* emissive), none of which route through this function — the cap below only ever touches a body
* whose own diffuse atlas was being used as its light source.
*/
function calibratedLandmarkIntensity(authored) {
	const dials = lightingDials();
	if (dials.mode === "legacy") return authored;
	if (dials.emissive !== undefined) return dials.emissive;
	const grade = authored / LANDMARK_EMISSIVE_DEFAULT;
	const lift = LANDMARK_EMISSIVE_CALIBRATED_DEFAULT * grade;
	return +THREE.MathUtils.clamp(lift, LANDMARK_EMISSIVE_WHOLE_BODY_MIN, LANDMARK_EMISSIVE_WHOLE_BODY_MAX).toFixed(4);
}
function lightingDials() {
	if (typeof window === "undefined") return {
		mode: "calibrated",
		emissive: undefined,
		cull: true
	};
	const params = new URLSearchParams(window.location.search);
	const emissive = Number(params.get("lmemissive"));
	return {
		mode: params.get("lighting") === "legacy" ? "legacy" : "calibrated",
		emissive: params.has("lmemissive") && Number.isFinite(emissive) && emissive >= 0 ? emissive : undefined,
		cull: params.get("lmcull") !== "off" && params.get("lighting") !== "legacy"
	};
}
function classifyMeshClosure(geometry) {
	const cached = geometry.userData.landmarkClosure;
	if (cached) return cached;
	const verdict = (() => {
		const position = geometry.getAttribute("position");
		if (!position) return {
			closed: false,
			reason: "no-index-or-position"
		};
		const count = geometry.index?.count ?? position.count;
		if (count < 3 || count % 3 !== 0) return {
			closed: false,
			reason: "no-index-or-position"
		};
		// Weld by quantised position: 1e-4 is far below the smallest feature in these bodies (metres)
		// and far above float32 noise on a 64 m map.
		const weld = new Map();
		const welded = new Int32Array(position.count);
		const points = [];
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
		const at = (slot) => welded[geometry.index ? geometry.index.getX(slot) : slot];
		const edges = new Map();
		const vertexCount = points.length / 3;
		let volume = 0;
		for (let slot = 0; slot < count; slot += 3) {
			const a = at(slot);
			const b = at(slot + 1);
			const c = at(slot + 2);
			if (a === b || b === c || a === c) continue;
			for (const [from, to] of [
				[a, b],
				[b, c],
				[c, a]
			]) {
				const key = Math.min(from, to) * vertexCount + Math.max(from, to);
				edges.set(key, (edges.get(key) ?? 0) + 1);
			}
			const ax = points[a * 3], ay = points[a * 3 + 1], az = points[a * 3 + 2];
			const bx = points[b * 3], by = points[b * 3 + 1], bz = points[b * 3 + 2];
			const cx = points[c * 3], cy = points[c * 3 + 1], cz = points[c * 3 + 2];
			volume += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
		}
		for (const shared of edges.values()) if (shared !== 2) return {
			closed: false,
			reason: "open-edges"
		};
		if (volume <= 0) return {
			closed: false,
			reason: "inverted-winding"
		};
		return {
			closed: true,
			reason: "closed"
		};
	})();
	geometry.userData.landmarkClosure = verdict;
	return verdict;
}
function cullVerifiedClosedMeshes(model, mountId) {
	const census = {
		id: mountId,
		meshes: 0,
		closed: 0,
		open: 0,
		culled: 0,
		doubleSided: 0,
		reasons: {}
	};
	const verdictPerMaterial = new Map();
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || mesh.userData.landmarkContactShadow) return;
		const closure = classifyMeshClosure(mesh.geometry);
		census.meshes += 1;
		census[closure.closed ? "closed" : "open"] += 1;
		census.reasons[closure.reason] = (census.reasons[closure.reason] ?? 0) + 1;
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
			verdictPerMaterial.set(material, (verdictPerMaterial.get(material) ?? true) && closure.closed);
		}
	});
	const cull = lightingDials().cull;
	for (const [material, closed] of verdictPerMaterial) {
		const banked = material.userData.landmarkBaseSide;
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
function dressLandmark(model, contractId, mountId) {
	if (contractId === "e4-boneyard") model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || mesh.material.name !== "BoneyardDriftEarth") return;
		// Untextured burial soil follows the earth's light, not the machinery's paint.
		mesh.material.emissiveIntensity = 0;
	});
	if (contractId === "e10-ember-shore" && mountId === "last-warm-vent-altar") {
		const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.684, .684, .96, 16), new THREE.MeshBasicMaterial({ color: 16757816 }));
		lamp.name = "last-warm-vent-altar.AmberWindow";
		lamp.position.y = 1.99;
		lamp.userData.renderOnly = true;
		model.add(lamp);
	}
	if (contractId === "e10-ember-shore" && mountId === "west-vein-cooling-marker") {
		const slit = new THREE.Mesh(new THREE.PlaneGeometry(1.86, .2), new THREE.MeshBasicMaterial({ color: 5810592 }));
		slit.name = "west-vein-cooling-marker.GlassSlit";
		slit.position.set(0, 1.21, .886);
		slit.userData.renderOnly = true;
		model.add(slit);
	}
	const dressing = CONTRACT_LANDMARK_DRESSING[contractId]?.[mountId];
	if (!dressing) return;
	model.traverse((node) => {
		const mesh = node;
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
		new THREE.MeshBasicMaterial({ color: LAMP_COLOUR })
	);
	lamp.name = `${mountId}.Lamp`;
	lamp.position.set(THREE.MathUtils.lerp(box.min.x, box.max.x, dressing.lamp.acrossX) - model.position.x, THREE.MathUtils.lerp(box.min.y, box.max.y, dressing.lamp.upY) - model.position.y, box.max.z - model.position.z + .03);
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
function keepLandmarkPaintReadable(model, paint = DEFAULT_LANDMARK_PAINT, contractId = "") {
	// An untinted body must not even round-trip its colour through getHex/setHex —
	// that quantises to 8 bits per channel, and every map except e1-baron is
	// supposed to come out of here byte-identical to before this seam existed.
	const tint = paint.tint === DEFAULT_LANDMARK_PAINT.tint ? null : new THREE.Color(paint.tint);
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial || !mesh.material.map) return;
		const material = mesh.material;
		if (tint) {
			// GLB materials are shared instances that survive a re-install, so the
			// base colour is banked once — tinting a tinted material would compound.
			const banked = material.userData.landmarkBaseColor;
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
		if ((contractId === "e2-pressure-garden" || contractId === "e6-glow-mesa" || contractId === "e6-picnic" || contractId === "e7-dead-band" || contractId === "e7-relay-rush" || contractId === "e8-far-side" || contractId === "e8-low-orbit" || contractId === "e9-dome-basin" || contractId === "e9-seed-run" || contractId === "e9-devils-alley" || contractId === "e9-old-canal" || contractId === "e10-last-claim" || contractId === "e10-ember-shore" || contractId === "e10-archive-world") && !material.userData.landmarkDiffuseGrade) {
			material.userData.landmarkDiffuseGrade = true;
			// Recover the atlas's dark iron detail in its diffuse paint, so the body can
			// leave the legacy-emission exemption without turning its texture into a lamp.
			const compile = material.onBeforeCompile.bind(material);
			material.onBeforeCompile = (shader, renderer) => {
				compile(shader, renderer);
				shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
diffuseColor.rgb = min(vec3(0.88), pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.62)) * vec3(0.94, 0.99, 1.06) + vec3(0.014));`);
			};
			material.customProgramCacheKey = () => "landmark-diffuse-iron-v1";
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
function mountLandmarkContacts(host, mounts, heightAt, waterY, bounds) {
	if (isMapBeautyDisabled() || !LANDMARK_CONTACT_CONTRACTS.has(host.contractId) || !mounts.length) return undefined;
	const geometry = new THREE.CircleGeometry(1, 24);
	const material = new THREE.MeshBasicMaterial({
		color: "#2e1b0e",
		transparent: true,
		opacity: .17,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1
	});
	const contacts = new THREE.InstancedMesh(geometry, material, mounts.length);
	contacts.name = "Terrain3dLandmarkContacts";
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
		if (model.position.x < bounds.min.x || model.position.x > bounds.max.x || model.position.z < bounds.min.z || model.position.z > bounds.max.z || collared.has(id)) continue;
		const ground = heightAt(model.position.x, model.position.z);
		// No contact shadow on a body standing in water: the riparian pack sits in the
		// channel, and a hard ellipse under the surface reads as a hole, not a shadow.
		if (waterY !== undefined && ground < waterY) continue;
		const throwLength = size.y * LANDMARK_CONTACT_THROW;
		placer.position.set(model.position.x + lean.x * throwLength, ground + .022, model.position.z + lean.y * throwLength);
		placer.rotation.set(-Math.PI / 2, 0, -.38);
		placer.scale.set(Math.max(.7, size.x * LANDMARK_CONTACT_SPREAD), Math.max(.7, size.z * LANDMARK_CONTACT_SPREAD), 1);
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
function sculptWaterSurfaceY(heightAt, halfX, centerZ, fords, fill, fordSkim) {
	const channel = [];
	const ford = [];
	for (let x = -halfX + 2; x <= halfX - 2; x += 1) {
		const crossing = fords.some((range) => Math.abs(x - range.centerX) <= range.halfWidth);
		for (const z of [
			-3.5,
			-2,
			-1,
			0,
			1,
			2,
			3.5
		]) {
			(crossing ? ford : channel).push(heightAt(x, centerZ + z));
		}
	}
	const median = (values) => {
		const sorted = [...values].sort((a, b) => a - b);
		return sorted[Math.floor(sorted.length / 2)] ?? 0;
	};
	const channelBed = channel.length ? median(channel) : 0;
	const fordBed = ford.length ? median(ford) : channelBed;
	return Math.min(channelBed + fill, fordBed + fordSkim);
}
/** Derive a flat-floored gorge's water line from its baked centreline. */
function sculptWaterFloorY(heightAt, halfX, centerZ, quantile, drop) {
	const samples = [];
	for (let x = -halfX + 1; x <= halfX - 1; x += .5) samples.push(heightAt(x, centerZ));
	samples.sort((a, b) => a - b);
	return (samples[Math.min(samples.length - 1, Math.floor(samples.length * quantile))] ?? 0) - drop;
}
function createSpanShadowBand(halfWidth, halfLength, color, opacity) {
	const columns = [
		-1,
		-.62,
		0,
		.62,
		1
	];
	const columnAlpha = [
		0,
		1,
		1,
		1,
		0
	];
	const positions = [];
	const colors = [];
	const indices = [];
	for (let row = 0; row <= SPAN_SHADOW_ROWS; row += 1) {
		const t = row / SPAN_SHADOW_ROWS;
		const taper = Math.min(THREE.MathUtils.smoothstep(t, 0, SPAN_SHADOW_END_TAPER), THREE.MathUtils.smoothstep(1 - t, 0, SPAN_SHADOW_END_TAPER));
		for (let column = 0; column < columns.length; column += 1) {
			positions.push(columns[column] * halfWidth, 0, THREE.MathUtils.lerp(-halfLength, halfLength, t));
			colors.push(1, 1, 1, columnAlpha[column] * taper);
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
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
	geometry.setIndex(indices);
	geometry.computeBoundingSphere();
	const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
		color,
		vertexColors: true,
		transparent: true,
		opacity,
		depthWrite: false,
		side: THREE.DoubleSide
	}));
	mesh.name = "Terrain3dSpanShadow";
	mesh.userData.renderOnly = true;
	mesh.frustumCulled = false;
	mesh.renderOrder = RenderLayers.groundDecals + .05;
	return mesh;
}
function mountSpanShadow(host, mounts, waterY) {
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
	shadow.position.set((box.min.x + box.max.x) / 2 + lean.x * drop * dressing.throw, waterY + SPAN_SHADOW_LIFT, (box.min.z + box.max.z) / 2 + lean.y * drop * dressing.throw);
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
function createHullWaterline(root, waterY, time) {
	root.updateWorldMatrix(true, true);
	const segments = [];
	const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
	root.traverse((object) => {
		const mesh = object;
		if (!mesh.isMesh || mesh.userData.renderOnly) return;
		const geometry = mesh.geometry;
		const positions = geometry.getAttribute("position");
		if (!positions) return;
		const count = geometry.index?.count ?? positions.count;
		const vertex = (target, slot) => target.fromBufferAttribute(positions, geometry.index ? geometry.index.getX(slot) : slot).applyMatrix4(mesh.matrixWorld);
		for (let i = 0; i < count; i += 3) {
			vertex(a, i);
			vertex(b, i + 1);
			vertex(c, i + 2);
			const cuts = [];
			for (const [from, to] of [
				[a, b],
				[b, c],
				[c, a]
			]) {
				if (from.y <= waterY === to.y <= waterY) continue;
				cuts.push(from.clone().lerp(to, (waterY - from.y) / (to.y - from.y)));
			}
			if (cuts.length === 2 && cuts[0].distanceToSquared(cuts[1]) > 1e-8) segments.push([cuts[0], cuts[1]]);
		}
	});
	if (!segments.length) return undefined;
	const bounds = new THREE.Box3();
	for (const segment of segments) for (const point of segment) bounds.expandByPoint(point);
	const center = bounds.getCenter(new THREE.Vector3());
	const positions = [], uvs = [];
	const emit = (point, edge) => {
		const local = root.worldToLocal(point.clone());
		positions.push(local.x, local.y, local.z);
		uvs.push(0, edge);
	};
	for (const [from, to] of segments) {
		const outward = new THREE.Vector3(to.z - from.z, 0, from.x - to.x).normalize();
		const mid = from.clone().add(to).multiplyScalar(.5).sub(center);
		if (outward.dot(mid) < 0) outward.negate();
		const innerA = from.clone(), innerB = to.clone();
		innerA.y = innerB.y = waterY + .018;
		const outerA = innerA.clone().addScaledVector(outward, .34);
		const outerB = innerB.clone().addScaledVector(outward, .34);
		emit(innerA, 0);
		emit(outerA, 1);
		emit(innerB, 0);
		emit(innerB, 0);
		emit(outerA, 1);
		emit(outerB, 1);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	const material = new THREE.MeshBasicMaterial({
		color: "#b5c4bb",
		transparent: true,
		opacity: .24,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	material.forceSinglePass = true;
	material.onBeforeCompile = (shader) => {
		shader.uniforms.hullWaterTime = time;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWaterline;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvWaterline = vec3(position.x, position.z, uv.y);");
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWaterline;\nuniform float hullWaterTime;").replace("#include <color_fragment>", `#include <color_fragment>
        float wash = sin(vWaterline.x * 0.9 + vWaterline.y * 1.4 + hullWaterTime * 0.5)
          * sin(vWaterline.y * 2.9 - hullWaterTime * 0.3);
        diffuseColor.a *= (1.0 - smoothstep(0.0, 1.0, vWaterline.z)) * smoothstep(-0.15, 0.65, wash);`);
	};
	material.customProgramCacheKey = () => "sea-hull-waterline-v1";
	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = "SeaHullWaterline";
	mesh.userData.renderOnly = true;
	mesh.renderOrder = RenderLayers.groundDecals + .1;
	return mesh;
}
function mountSculptWater(host, heightAt, bounds) {
	const contract = REGISTRY[host.contractId]?.contract;
	const sea = contract?.waterSurface?.owner === "runtime DeepwaterClaimTile" && contract.waterSurface.includedInTerrainGLB === false;
	const stillwater = host.contractId === "e5-stillwater";
	const dressing = sea ? DEEPWATER_SEA_DRESSING : SCULPT_WATER_DRESSING[host.contractId];
	if (isMapBeautyDisabled() || !dressing || !sea && !Terrain.hasRiverWater()) return undefined;
	const river = sea ? {
		minZ: bounds.min.z,
		maxZ: bounds.max.z
	} : Terrain.riverGeometry();
	const centerZ = (river.minZ + river.maxZ) / 2;
	const riverHalfWidth = (river.maxZ - river.minZ) / 2;
	const fords = sea ? [] : Terrain.fordRanges();
	const fordHalfWidth = fords.length ? Math.max(...fords.map((range) => range.halfWidth)) : 3;
	const fordCenters = fords.length ? fords.map((range) => range.centerX) : [0];
	const halfX = Math.min(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
	const surfaceY = dressing.surface.kind === "sea-level" ? dressing.surface.y : dressing.surface.kind === "channel-fill" ? sculptWaterSurfaceY(heightAt, halfX, centerZ, fords, dressing.surface.fill, dressing.fordSkim) : sculptWaterFloorY(heightAt, halfX, centerZ, dressing.surface.quantile, dressing.surface.drop);
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
		color: stillwater ? "#a5c5d0" : dressing.color,
		opacity: stillwater ? .62 : dressing.opacity,
		rippleStrength: stillwater ? .04 : dressing.rippleStrength,
		rippleScale: dressing.rippleScale,
		depthContrast: dressing.depthContrast,
		textureBlend: stillwater ? .06 : dressing.textureBlend,
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
		riverDepth: Terrain.waterDepth("river"),
		fordDepth: Terrain.waterDepth("ford"),
		wadeDepth: Balance.terrainSim.wadeDepth,
		deepDepth: Balance.terrainSim.deepDepth,
		// The gold glints belong on the sluice line: each harvest anchor pushed to its
		// own bank lip, exactly as the painted river places them.
		anchors: dressing.glints === "harvest" ? Terrain.nodeAnchors.map((anchor) => ({
			x: anchor.x,
			z: anchor.z < centerZ ? river.minZ + .55 : river.maxZ - .55
		})) : dressing.glints.map(({ x, z }) => ({
			x,
			z: centerZ + z
		}))
	});
	let lastFrame = -1;
	let lastAt = 0;
	const hullNames = sea ? host.contractId === "e5-flotilla" ? [
		"kitchen-scow",
		"turret-raft",
		"still-room-barge"
	] : ["ClaimBoatView"] : [];
	const hullContacts = [];
	const disposeWater = water.dispose;
	water.dispose = () => {
		for (const contact of hullContacts) {
			if (!contact.parent) continue;
			contact.removeFromParent();
			disposeObject3D(contact);
		}
		delete host.canvas.dataset.terrain3dPilotHullWaterlines;
		disposeWater();
	};
	water.mesh.onBeforeRender = (renderer) => {
		const frame = renderer.info.render.frame;
		if (frame === lastFrame) return;
		const now = performance.now() / 1e3;
		const delta = lastFrame < 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
		lastFrame = frame;
		lastAt = now;
		water.advance(delta);
		// Attach once the asynchronous visual hull arrives. The parent's existing transform and
		// visibility carry the line through reanchoring/loss; no simulation position is duplicated.
		for (let i = hullNames.length - 1; i >= 0; i--) {
			const hull = host.scene.getObjectByName(hullNames[i]);
			if (!hull?.children.length) continue;
			const contact = createHullWaterline(hull, surfaceY, water.mesh.material.userData.waterUniforms.time);
			hullNames.splice(i, 1);
			if (contact) {
				hull.add(contact);
				hullContacts.push(contact);
			}
			host.canvas.dataset.terrain3dPilotHullWaterlines = JSON.stringify(hullContacts.map((mesh) => ({
				hull: mesh.parent?.name,
				triangles: mesh.geometry.getAttribute("position").count / 3
			})));
		}
	};
	host.scene.add(water.mesh);
	host.canvas.dataset.terrain3dPilotSculptWater = sea ? "living-sea-quad" : "living-water-quad";
	// The MOUNTED half width, not the tile's declaration — a map that narrows its quad has to say so,
	// and e2e/shore-truth.spec.ts's law is "never wider than the sim declares", which narrowing keeps.
	host.canvas.dataset.terrain3dPilotSculptWaterHalfWidth = visualHalfWidth.toFixed(3);
	host.canvas.dataset.terrain3dPilotSculptWaterSimHalfWidth = (sea ? riverHalfWidth : Terrain.visualWaterHalfWidth()).toFixed(3);
	host.canvas.dataset.terrain3dPilotSculptWaterY = surfaceY.toFixed(4);
	host.canvas.dataset.terrain3dPilotSculptWaterGlints = String(water.mesh.material instanceof THREE.Material ? water.mesh.material.userData.waterGlints ?? 0 : 0);
	host.canvas.dataset.terrain3dPilotSculptWaterDeepest = water.deepestMeters.toFixed(3);
	host.canvas.dataset.terrain3dPilotSculptWaterFords = fords.map((range) => `${range.id}@${range.centerX}`).join(",");
	return water;
}
/** Foam collars ground water-mounted landmarks without drawing a dark pool under the surface. */
function mountWaterCollars(host, mounts, waterY) {
	const collars = SCULPT_WATER_DRESSING[host.contractId]?.collars;
	if (isMapBeautyDisabled() || !collars?.length || waterY === undefined) return undefined;
	const geometry = new THREE.RingGeometry(.4, 1, 32, 1);
	const material = new THREE.MeshBasicMaterial({
		color: "#efe6cd",
		transparent: true,
		opacity: .14,
		depthWrite: false,
		side: THREE.DoubleSide,
		blending: THREE.AdditiveBlending
	});
	const ring = new THREE.InstancedMesh(geometry, material, collars.length);
	ring.name = "Terrain3dWaterCollars";
	ring.userData.renderOnly = true;
	ring.frustumCulled = false;
	ring.renderOrder = RenderLayers.groundDecals;
	const placer = new THREE.Object3D();
	let written = 0;
	for (const collar of collars) {
		const model = mounts.find(({ id }) => id === collar.mount)?.model;
		if (!model) continue;
		placer.position.set(model.position.x, waterY + .012, model.position.z);
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
function mountSunMotes(host, bounds) {
	const dressing = SUN_MOTES[host.contractId];
	if (isMapBeautyDisabled() || !dressing) return undefined;
	const mobile = typeof window !== "undefined" && window.innerWidth <= 430;
	const lean = ledgerSunShadowDirection();
	const motes = createSunMotes({
		count: mobile ? Math.round(SUN_MOTE_CAP * .45) : SUN_MOTE_CAP,
		halfX: Math.min(Math.abs(bounds.min.x), Math.abs(bounds.max.x)) * (dressing.halfXScale ?? .62),
		halfZ: dressing.halfZ,
		centerZ: dressing.centerZ,
		minY: dressing.minY,
		maxY: dressing.maxY,
		drift: new THREE.Vector2(lean.x * .55, lean.y * .55),
		color: dressing.color,
		size: dressing.size,
		seed: dressing.seed
	});
	let lastFrame = -1;
	let lastAt = 0;
	motes.points.onBeforeRender = (renderer) => {
		const frame = renderer.info.render.frame;
		if (frame === lastFrame) return;
		const now = performance.now() / 1e3;
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
function mountCrossingBreath(host, waterY) {
	const dressing = CROSSING_BREATH_CONTRACTS[host.contractId];
	if (isMapBeautyDisabled() || !dressing || waterY === undefined || performanceTierDiagnostics().tier !== "full") return undefined;
	const wisps = createSunMotes({
		count: dressing.wisps.count,
		halfX: dressing.wisps.halfX,
		halfZ: dressing.wisps.halfZ,
		centerZ: 0,
		minY: waterY + .04,
		maxY: waterY + dressing.wisps.lift,
		drift: new THREE.Vector2(0, 0),
		rise: dressing.wisps.rise,
		color: dressing.wisps.color,
		size: dressing.wisps.size,
		seed: 32337
	});
	wisps.points.name = "TrestleGorgeWisps";
	let plume;
	let cart;
	let lastFrame = -1;
	let lastAt = 0;
	const advance = (renderer) => {
		const frame = renderer.info.render.frame;
		if (frame === lastFrame) return;
		const now = performance.now() / 1e3;
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
				const found = host.scene.getObjectByName("OreCart");
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
						seed: 11271
					});
					plume.points.name = "TrestleCartSteam";
					plume.points.onBeforeRender = advance;
					cart.add(plume.points);
				}
			}
			if (plume) plume.points.visible = verdict < 2;
			host.canvas.dataset.terrain3dPilotGorgeWisps = wisps.points.visible ? String(dressing.wisps.count) : "0";
			host.canvas.dataset.terrain3dPilotSteam = plume?.points.visible ? String(dressing.plume.count) : "0";
		}
		ticks += 1;
		requestAnimationFrame(poll);
	};
	requestAnimationFrame(poll);
	host.canvas.dataset.terrain3dPilotGorgeWisps = String(dressing.wisps.count);
	host.canvas.dataset.terrain3dPilotSteam = "0";
	return { dispose: () => {
		host.scene.remove(wisps.points);
		wisps.dispose();
		plume?.points.removeFromParent();
		plume?.dispose();
		plume = undefined;
		cart = undefined;
	} };
}
const STEAM_WISP_JOINTS = [
	"garden-pressure-manifold",
	"west-terrace-pipe-header",
	"east-terrace-pipe-header"
];
const STEAM_WISP_COUNT = 8;
const STEAM_WISP_HOT_BOILERS = 2;
/** Pressure Garden steam follows the same hot-boiler count published by its HUD. */
function mountSteamWisps(host, mounts) {
	if (isMapBeautyDisabled() || host.contractId !== "e2-pressure-garden" || !host.hotBoilers) return [];
	const built = [];
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
			drift: new THREE.Vector2(.18, .05),
			rise: .42,
			color: "#f4f2ec",
			size: 3.4,
			seed: 29120 + id.length
		});
		wisps.points.name = `${id}.SteamWisps`;
		wisps.points.position.x = joint.position.x;
		wisps.points.visible = false;
		let lastFrame = -1;
		let lastAt = 0;
		wisps.points.onBeforeRender = (renderer) => {
			const frame = renderer.info.render.frame;
			if (frame === lastFrame) return;
			const now = performance.now() / 1e3;
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
		if (!built[0].points.parent) return;
		const hot = (host.hotBoilers?.() ?? 0) >= STEAM_WISP_HOT_BOILERS;
		for (const wisps of built) wisps.points.visible = hot;
		host.canvas.dataset.terrain3dPilotSteamWisps = hot ? String(built.length * STEAM_WISP_COUNT) : "0";
		requestAnimationFrame(poll);
	};
	requestAnimationFrame(poll);
	host.canvas.dataset.terrain3dPilotSteamWisps = "0";
	return built;
}
/**
* U4 — mount the contract's steam column(s).
*
* FULL tier only, and registered in the MQ-4 shed order: the field goes invisible (and therefore
* costs nothing at all, rather than fading) the moment the runtime p95 watchdog returns a verdict.
* Decoration is the first thing that should go and the last thing that should argue about it.
*/
function mountSteamPlume(host, mounts) {
	const anchors = STEAM_ANCHORS[host.contractId];
	if (isMapBeautyDisabled() || !anchors?.length) return undefined;
	if (performanceTierDiagnostics().tier !== "full") {
		host.canvas.dataset.terrain3dPilotSteam = "tier-withheld";
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
			opacity: anchor.opacity
		}];
	});
	if (!emitters.length) {
		host.canvas.dataset.terrain3dPilotSteam = "no-anchor-body";
		return undefined;
	}
	const lean = ledgerSunShadowDirection();
	const plume = createSteamPlume({
		emitters,
		wind: new THREE.Vector2(lean.x, lean.y),
		color: STEAM_COLOUR,
		seed: 22506
	});
	let lastFrame = -1;
	let lastAt = 0;
	plume.points.onBeforeRender = (renderer) => {
		const frame = renderer.info.render.frame;
		if (frame === lastFrame) return;
		const now = performance.now() / 1e3;
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
		host.canvas.dataset.terrain3dPilotSteam = shed ? "shed" : `${emitters.length}x${plume.count}`;
		requestAnimationFrame(poll);
	};
	host.scene.add(plume.points);
	requestAnimationFrame(poll);
	host.canvas.dataset.terrain3dPilotSteam = `${emitters.length}x${plume.count}`;
	host.canvas.dataset.terrain3dPilotSteamAnchors = JSON.stringify(emitters.map((emitter) => ({
		x: +emitter.x.toFixed(2),
		y: +emitter.y.toFixed(2),
		z: +emitter.z.toFixed(2)
	})));
	return plume;
}
/** Incline cart-stack and winch-end steam; capped and shed before gameplay VFX. */
function mountHaulSteam(host, heightAt, mounts) {
	if (isMapBeautyDisabled() || host.contractId !== "e2-incline") return undefined;
	const at = (id) => mounts.find((mount) => mount.id === id)?.model;
	const cableHouse = at("upper-ore-cable-house");
	const crane = at("lower-yard-engine-crane");
	const vents = [{
		id: "escort-cart",
		x: 0,
		z: 0,
		y: 2.2,
		rides: true,
		interval: .62,
		phase: 0,
		life: 2.4,
		rise: 2.1,
		radius: 2.9,
		grow: 1.6,
		drift: [-.35, -.15],
		slots: 3
	}];
	if (cableHouse) vents.push({
		id: "cable-house",
		x: cableHouse.position.x - .6,
		z: cableHouse.position.z - 1.4,
		y: 5,
		interval: 1.5,
		phase: .4,
		life: 3.2,
		rise: 1.3,
		radius: 1.45,
		grow: 1.4,
		drift: [-.4, -.2],
		slots: 3
	});
	if (crane) vents.push({
		id: "engine-crane",
		x: crane.position.x + .4,
		z: crane.position.z - 1,
		y: 3.6,
		interval: 2.1,
		phase: 1.1,
		life: 2.8,
		rise: 1.05,
		radius: 2.7,
		grow: 1.7,
		drift: [-.3, -.12],
		slots: 2
	});
	if (vents.length < 2) return undefined;
	const steam = createHaulSteam(vents, heightAt);
	let lastAt = 0;
	let shedChecked = 0;
	const poll = () => {
		if (!steam.group.parent) return;
		const now = performance.now() / 1e3;
		const delta = lastAt === 0 ? 0 : Math.min(SCULPT_WATER_MAX_DELTA, Math.max(0, now - lastAt));
		lastAt = now;
		if (now - shedChecked > .5) {
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
function mountRushEmbers(host, mounts, heightAt) {
	if (isMapBeautyDisabled() || !RUSH_EMBER_CONTRACTS.has(host.contractId) || !host.rushActive) return undefined;
	const stake = mounts.find(({ id }) => id === "claim_stake")?.model;
	if (!stake) return undefined;
	const embers = createSunMotes({
		count: RUSH_EMBER_COUNT,
		halfX: 1.15,
		halfZ: 1.15,
		centerZ: stake.position.z,
		minY: heightAt(stake.position.x, stake.position.z) + .15,
		maxY: heightAt(stake.position.x, stake.position.z) + 2.7,
		drift: new THREE.Vector2(0, 0),
		rise: .55,
		color: "#ff9a3c",
		size: 2.4,
		seed: 22293
	});
	embers.points.name = "ClaimStakeRushEmbers";
	embers.points.position.x = stake.position.x;
	embers.points.visible = false;
	let lastFrame = -1;
	let lastAt = 0;
	embers.points.onBeforeRender = (renderer) => {
		const frame = renderer.info.render.frame;
		if (frame === lastFrame) return;
		const now = performance.now() / 1e3;
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
		host.canvas.dataset.terrain3dPilotRushEmbers = embers.points.visible ? String(RUSH_EMBER_COUNT) : "0";
		requestAnimationFrame(poll);
	};
	host.scene.add(embers.points);
	requestAnimationFrame(poll);
	host.canvas.dataset.terrain3dPilotRushEmbers = "0";
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
const LIVE_SPRING_POND_CONTRACTS = new Map([["e1-dry-gulch", { surfaceY: .19 }]]);
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
function hidePaintedGround(host) {
	return hidePaintedRelief(host);
}
/** Quiet the worked bank shelves while retaining the authored wet lips and tile edge. */
function calmTwinBanksGround(model) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.twinBanksDryPigment = { value: new THREE.Color("#ad9c7b") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vTwinBanksWorld;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvTwinBanksWorld = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vTwinBanksWorld;\nuniform vec3 twinBanksDryPigment;").replace("#include <map_fragment>", `#include <map_fragment>
float twinBanksSouth = 1.0 - smoothstep(0.45, 1.65, length((vTwinBanksWorld - vec2(-13.0, -14.0)) / vec2(13.0, 8.0)));
float twinBanksNorth = 1.0 - smoothstep(0.45, 1.65, length((vTwinBanksWorld - vec2(13.5, 14.2)) / vec2(13.0, 8.0)));
float twinBanksDry = smoothstep(6.0, 10.0, abs(vTwinBanksWorld.y));
float twinBanksEdge = 1.0 - smoothstep(24.0, 31.0, max(abs(vTwinBanksWorld.x), abs(vTwinBanksWorld.y)));
float twinBanksQuiet = mix(0.20, 0.48, max(twinBanksSouth, twinBanksNorth)) * twinBanksDry * twinBanksEdge;
diffuseColor.rgb = mix(diffuseColor.rgb, twinBanksDryPigment, twinBanksQuiet);`);
		};
		material.customProgramCacheKey = () => "twin-banks-dry-bank-pigment-v1";
		material.needsUpdate = true;
	}
}
/** Lift only the deepest painted scorch pigment, retaining its edges and grit. */
function separateBaronGroundScars(model) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.baronWarmPigment = { value: new THREE.Color("#77614c") };
			shader.uniforms.baronColdPigment = { value: new THREE.Color("#627078") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vBaronGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvBaronGround = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vBaronGround;\nuniform vec3 baronWarmPigment;\nuniform vec3 baronColdPigment;").replace("#include <map_fragment>", `#include <map_fragment>
float baronInk = 1.0 - smoothstep(0.018, 0.09, dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)));
float baronDry = smoothstep(6.0, 7.5, abs(vBaronGround.y));
float baronEdge = 1.0 - smoothstep(25.0, 31.0, max(abs(vBaronGround.x), abs(vBaronGround.y)));
vec3 baronPigment = mix(baronWarmPigment, baronColdPigment, smoothstep(6.0, 10.0, -vBaronGround.y));
diffuseColor.rgb = mix(diffuseColor.rgb, baronPigment, 0.32 * baronInk * baronDry * baronEdge);`);
		};
		material.customProgramCacheKey = () => "baron-scorch-pigment-v1";
		material.needsUpdate = true;
	}
}
/** Quiet the worked approaches without repainting the gorge or its waterline. */
function calmTrestleApproaches(model) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.trestleWorkedPigment = { value: new THREE.Color("#8b7256") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vTrestleGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvTrestleGround = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vTrestleGround;\nuniform vec3 trestleWorkedPigment;").replace("#include <map_fragment>", `#include <map_fragment>
float trestleBank = smoothstep(6.25, 9.0, abs(vTrestleGround.y));
float trestleEdge = 1.0 - smoothstep(29.0, 42.0, max(abs(vTrestleGround.x), abs(vTrestleGround.y)));
diffuseColor.rgb = mix(diffuseColor.rgb, trestleWorkedPigment, 0.23 * trestleBank * trestleEdge);`);
		};
		material.customProgramCacheKey = () => "trestle-worked-approaches-v1";
		material.needsUpdate = true;
	}
}
/** Quiet desert pigment and wheel cuts follow the published Motor masks, never new roads. */
function clarifyMotorGround(model, truth, panorama = false, paintMix = .78) {
	if (isMapBeautyDisabled()) return;
	const roads = truth.roadCorridors ?? [];
	const seams = truth.tarSeams ?? [];
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.motorPaintMix = { value: paintMix };
			shader.uniforms.motorEarth = { value: new THREE.Color("#9f8564") };
			shader.uniforms.motorRoad = { value: new THREE.Color("#c5a274") };
			shader.uniforms.motorRoads = { value: roads.map((r) => new THREE.Vector4(r.start.x, r.start.z, r.end.x, r.end.z)) };
			shader.uniforms.motorTar = { value: seams.length ? seams.map((s) => new THREE.Vector3(s.x, s.z, s.radius)) : [new THREE.Vector3()] };
			shader.uniforms.motorOrbit = { value: truth.orbitSpawn?.radius ?? 0 };
			shader.uniforms.motorHalfSize = { value: new THREE.Vector2(truth.dimensions.width / 2, truth.dimensions.height / 2) };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vMotorGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvMotorGround = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vMotorGround;
uniform vec3 motorEarth, motorRoad;
uniform vec4 motorRoads[${roads.length}];
uniform vec3 motorTar[${Math.max(1, seams.length)}];
uniform vec2 motorHalfSize;
uniform float motorOrbit, motorPaintMix;`).replace("#include <map_fragment>", `#include <map_fragment>
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
diffuseColor.rgb = mix(motorOriginal, diffuseColor.rgb, motorInterior);${panorama ? "\n// Balance the differently lit Long Road apron against its adjacent earth.\ndiffuseColor.rgb *= mix(1.0, 1.12, motorInterior);" : ""}`);
			if (panorama) shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0 - motorInterior;");
		};
		material.customProgramCacheKey = () => `motor-ground-${roads.length}-${seams.length}-${panorama}-v2`;
		material.needsUpdate = true;
	}
}
/** Fine regolith pigment replaces the reused Mare's broad paint bands, without a new surface. */
function clarifyFarSideRegolith(model) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.farSideDust = { value: new THREE.Color("#aaa596") };
			shader.uniforms.farSideRim = { value: new THREE.Color("#c4bba5") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vFarSideGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvFarSideGround = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vFarSideGround;\nuniform vec3 farSideDust, farSideRim;").replace("#include <map_fragment>", `#include <map_fragment>
vec2 farSideP = vFarSideGround.xz;
float farSideGrain = fract(sin(dot(floor(vFarSideGround * 18.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
float farSideGrainFade = 1.0 - smoothstep(0.4, 1.2, max(max(fwidth(vFarSideGround.x), fwidth(vFarSideGround.z)), fwidth(vFarSideGround.y)) * 18.0);
float farSideMottle = sin(farSideP.x * 0.73 + sin(farSideP.y * 0.41)) * sin(farSideP.y * 0.87);
vec3 farSidePigment = mix(farSideDust, farSideRim, smoothstep(0.5, 5.8, vFarSideGround.y));
farSidePigment *= 0.96 + (farSideGrain - 0.5) * 0.14 * farSideGrainFade + farSideMottle * 0.045;
float farSideInterior = 1.0 - smoothstep(54.0, 63.0, max(abs(farSideP.x), abs(farSideP.y)));
diffuseColor.rgb = mix(diffuseColor.rgb, farSidePigment, 0.92 * farSideInterior);`);
		};
		material.customProgramCacheKey = () => "far-side-regolith-v2";
		material.needsUpdate = true;
	}
}
/** A circular memorial inlay stays on the complete authored square floor. */
function paintLastClaimDeck(model) {
	if (isMapBeautyDisabled()) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.memorialBrass = { value: new THREE.Color("#c4a465") };
			shader.uniforms.memorialBand = { value: new THREE.Color("#8c8270") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vMemorialDeck;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvMemorialDeck = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vMemorialDeck;\nuniform vec3 memorialBrass, memorialBand;").replace("#include <map_fragment>", `
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
diffuseColor.rgb *= mix(0.62, 1.0, smoothstep(1.28, 1.85, memorialContact));`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
// Authored light cast by the memorial instruments; no gameplay state is written.
float lanternPool = exp(-dot(vMemorialDeck - vec2(-10.0, 47.0), vMemorialDeck - vec2(-10.0, 47.0)) / 18.0);
float portraitPool = exp(-dot(vMemorialDeck - vec2(10.0, 47.0), vMemorialDeck - vec2(10.0, 47.0)) / 12.0);
float archPool = exp(-dot(vMemorialDeck - vec2(0.0, -51.0), vMemorialDeck - vec2(0.0, -51.0)) / 24.0);
totalEmissiveRadiance += vec3(0.30, 0.14, 0.045) * (lanternPool + portraitPool * 0.65 + archPool * 0.4) * smoothstep(1.30, 2.0, memorialContact);`);
		};
		material.customProgramCacheKey = () => "last-claim-memorial-inlay-v3";
		material.needsUpdate = true;
	});
}
/** The raw River keeps its run-6 water; the dedicated grid replaces bank paint. */
function paintRiverBanks(model) {
	if (isMapBeautyDisabled()) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.riverSand = { value: new THREE.Color("#b8a47c") };
			shader.uniforms.riverWet = { value: new THREE.Color("#69746b") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vRiverBank;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvRiverBank = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vRiverBank;\nuniform vec3 riverSand, riverWet;").replace("#include <map_fragment>", `#include <map_fragment>
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
function paintRiverStones(model) {
	if (isMapBeautyDisabled()) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material), key = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vRiverStone;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvRiverStone = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vRiverStone;").replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb *= mix(0.75, 1.0, smoothstep(5.6, 8.3, abs(vRiverStone.z)));").replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(0.44, roughnessFactor, smoothstep(5.6, 8.3, abs(vRiverStone.z)));");
		};
		material.customProgramCacheKey = () => `${key}|river-wet-stone-v1`;
		material.needsUpdate = true;
	});
}
/** A material-only dawn treatment for the raw River's existing painted fallback. */
function paintRiverReturn(host) {
	if (host.contractId !== "e10-river" || isMapBeautyDisabled()) return () => undefined;
	const materials = new Set();
	host.scene.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
			if (material.isMeshStandardMaterial && (material.userData.terrainUniforms || material.userData.waterUniforms)) materials.add(material);
		}
	});
	const restore = [...materials].map((material) => {
		const compile = material.onBeforeCompile, key = material.customProgramCacheKey;
		const cacheKey = key.call(material), water = !!material.userData.waterUniforms;
		material.onBeforeCompile = (shader, renderer) => {
			compile.call(material, shader, renderer);
			if (water) {
				shader.fragmentShader = shader.fragmentShader.replace("bankFoam * 0.58", "bankFoam * 0.16").replace("vec4 sampledDiffuseColor = vec4(waterColor, alpha);", `
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
				shader.uniforms.returnBankPigment = { value: new THREE.Color("#ad9c75") };
				shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 returnBankPigment;").replace("diffuseColor *= sampledDiffuseColor;", "diffuseColor *= sampledDiffuseColor;\ndiffuseColor.rgb = mix(diffuseColor.rgb, returnBankPigment, 0.25);");
			}
		};
		material.customProgramCacheKey = () => `${cacheKey}|raw-river-dawn-v2:${water ? "water" : "bank"}`;
		material.needsUpdate = true;
		return () => {
			material.onBeforeCompile = compile;
			material.customProgramCacheKey = key;
			material.needsUpdate = true;
		};
	});
	return () => {
		for (const reset of restore) reset();
	};
}
/** Quiet the archive paving; warm pools appear only for already-restored wings. */
function clarifyArchiveTerraces(model, readState, detailTextureUrl) {
	if (isMapBeautyDisabled()) return;
	const zones = readState?.()?.zones ?? [];
	const pools = { value: zones.map((zone) => new THREE.Vector4((zone.minX + zone.maxX) / 2, (zone.minZ + zone.maxZ) / 2, (zone.maxX - zone.minX) * .37, (zone.maxZ - zone.minZ) * .37)) };
	const restored = { value: new Float32Array(zones.length) };
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const beforeRender = mesh.onBeforeRender.bind(mesh);
		mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
			beforeRender(renderer, scene, camera, geometry, material, group);
			const state = readState?.();
			zones.forEach((zone, index) => {
				restored.value[index] = state?.restoredWingIds.includes(zone.id) ? 1 : 0;
			});
		};
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		let disposed = false;
		const detail = detailTextureUrl ? new THREE.TextureLoader().load(detailTextureUrl, (texture) => {
			if (disposed) texture.dispose();
		}) : undefined;
		if (detail) {
			detail.colorSpace = THREE.SRGBColorSpace;
			detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
			material.addEventListener("dispose", () => {
				disposed = true;
				detail.dispose();
			});
		}
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.archiveFloorLow = { value: new THREE.Color("#776f5e") };
			shader.uniforms.archiveFloorHigh = { value: new THREE.Color("#a8a38d") };
			if (detail) shader.uniforms.archiveMasonry = { value: detail };
			shader.uniforms.archiveFloorPools = pools;
			shader.uniforms.archiveFloorRestored = restored;
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vArchiveFloor;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvArchiveFloor = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vArchiveFloor;
uniform vec3 archiveFloorLow, archiveFloorHigh;
${detail ? "uniform sampler2D archiveMasonry;" : ""}
${zones.length ? `uniform vec4 archiveFloorPools[${zones.length}];\nuniform float archiveFloorRestored[${zones.length}];` : ""}`).replace("#include <map_fragment>", `#include <map_fragment>
float archiveTerrace = smoothstep(-0.7, 2.2, vArchiveFloor.y);
diffuseColor.rgb = mix(diffuseColor.rgb, mix(archiveFloorLow, archiveFloorHigh, archiveTerrace), 0.78);
${detail ? "float archiveEngraving = dot(texture2D(archiveMasonry, vArchiveFloor.xz / 24.0).rgb, vec3(0.2126, 0.7152, 0.0722));\ndiffuseColor.rgb *= 0.90 + archiveEngraving * 0.30;" : ""}`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
${zones.length ? `for (int i = 0; i < ${zones.length}; i++) {
  vec4 pool = archiveFloorPools[i];
  float archivePool = 1.0 - smoothstep(0.12, 1.0, length((vArchiveFloor.xz - pool.xy) / pool.zw));
  totalEmissiveRadiance += vec3(0.30, 0.14, 0.045) * archivePool * archiveFloorRestored[i];
}` : ""}`);
		};
		material.customProgramCacheKey = () => `${cacheKey}|archive-terraces-v2:${zones.length}:${!!detail}`;
		material.needsUpdate = true;
	});
}
/** Contact at the footing and earned warm facade wash; no restoration writes. */
function lightArchiveFacade(model, readState) {
	if (isMapBeautyDisabled()) return;
	const bounds = new THREE.Box3().setFromObject(model), center = bounds.getCenter(new THREE.Vector3());
	const zone = readState?.()?.zones.find((z) => center.x >= z.minX && center.x <= z.maxX && center.z >= z.minZ && center.z <= z.maxZ);
	const restored = { value: 0 };
	model.traverse((node) => {
		const mesh = node;
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
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vArchiveFacade;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvArchiveFacade = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vArchiveFacade;\nuniform float archiveFacadeBase, archiveFacadeRestored;").replace("#include <map_fragment>", `#include <map_fragment>
float archiveFacadeHeight = vArchiveFacade.y - archiveFacadeBase;
diffuseColor.rgb *= mix(0.63, 1.0, smoothstep(0.0, 0.7, archiveFacadeHeight));`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
float archiveFacadeWash = smoothstep(0.1, 0.8, archiveFacadeHeight) * (1.0 - smoothstep(2.5, 6.0, archiveFacadeHeight));
totalEmissiveRadiance += vec3(0.11, 0.055, 0.012) * archiveFacadeWash * archiveFacadeRestored;`);
		};
		material.customProgramCacheKey = () => `${key}|archive-facade-v1`;
		material.needsUpdate = true;
	});
}
/** The near library halls use real depth; distant sky and apron stay at far depth. */
function prepareArchiveLibrary(model, detailTextureUrl) {
	if (!detailTextureUrl) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !["ArchiveLibraryScenery", "ArchiveLibraryRecess"].includes(mesh.material.name)) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material), key = material.customProgramCacheKey();
		mesh.renderOrder = 0;
		material.depthWrite = true;
		material.fog = true;
		material.vertexColors = false;
		material.color.set("#b6aa8d");
		const recess = material.name === "ArchiveLibraryRecess";
		material.emissive.set(recess ? "#39362c" : "#88847a");
		material.emissiveIntensity = .18;
		let disposed = false;
		const detail = new THREE.TextureLoader().load(detailTextureUrl, (texture) => {
			if (disposed) texture.dispose();
		});
		detail.colorSpace = THREE.SRGBColorSpace;
		detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
		material.addEventListener("dispose", () => {
			disposed = true;
			detail.dispose();
		});
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.vertexShader = shader.vertexShader.replace("gl_Position.z = gl_Position.w * 0.999999;", "");
			shader.uniforms.archiveFacadeStone = { value: detail };
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D archiveFacadeStone;").replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb = texture2D(archiveFacadeStone, vMapUv).rgb * " + (recess ? "vec3(0.38, 0.36, 0.32);" : "vec3(0.70, 0.65, 0.56);"));
		};
		material.customProgramCacheKey = () => `${key}|archive-library-v4:${recess}`;
		material.needsUpdate = true;
	});
}
/** Shared basalt pigment for sculpt, continuation and authored scenery rock.
* Fractures and strata change the material only; heat still comes from the atlas. */
function clarifyEmberBasalt(model, detailTextureUrl, scenery = false) {
	if (isMapBeautyDisabled() || !detailTextureUrl) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		if (scenery && material.name !== "EmberShoreBasaltScenery") return;
		if (scenery) {
			material.fog = true;
			material.vertexColors = false;
		}
		// This material owns its native detail sampler, including late decode after
		// disposal. The GLB's original color map remains the heat-paint authority.
		let disposed = false;
		const detail = new THREE.TextureLoader().load(detailTextureUrl, (texture) => {
			if (disposed) texture.dispose();
		});
		detail.colorSpace = THREE.SRGBColorSpace;
		detail.wrapS = detail.wrapT = THREE.RepeatWrapping;
		material.addEventListener("dispose", () => {
			disposed = true;
			detail.dispose();
		});
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.emberBasaltDetail = { value: detail };
			shader.uniforms.emberBasaltLow = { value: new THREE.Color("#5d727c") };
			shader.uniforms.emberBasaltHigh = { value: new THREE.Color("#9c9e91") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vEmberBasalt;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvEmberBasalt = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vEmberBasalt;
uniform vec3 emberBasaltLow, emberBasaltHigh;
uniform sampler2D emberBasaltDetail;
float emberHeatCore(vec3 paint) { return clamp((paint.r - max(paint.g, paint.b) * 1.8) * 18.0, 0.0, 1.0); }`).replace("#include <map_fragment>", `#include <map_fragment>
float emberWarm = clamp((diffuseColor.r - max(diffuseColor.g, diffuseColor.b) * 1.8) * 18.0, 0.0, 1.0);
float emberShelf = smoothstep(-1.8, 1.8, vEmberBasalt.y);
vec3 emberSample = texture2D(emberBasaltDetail, vEmberBasalt.xz / 12.0).rgb;
float emberEtching = dot(emberSample, vec3(0.2126, 0.7152, 0.0722));
vec3 emberStone = mix(emberBasaltLow, emberBasaltHigh, emberShelf);
emberStone *= clamp(0.82 + emberEtching * 1.35, 0.76, 1.22);
diffuseColor.rgb = emberStone;
float emberPlayfield = 1.0 - smoothstep(63.8, 64.0, max(abs(vEmberBasalt.x), abs(vEmberBasalt.z)));
float emberVein = emberWarm * emberPlayfield * clamp(0.58 + emberEtching * 1.8, 0.58, 1.0);
float emberCore = ${scenery ? "0.0" : `min(min(emberHeatCore(texture2D(map, vMapUv + vec2(0.00045, 0.0)).rgb), emberHeatCore(texture2D(map, vMapUv - vec2(0.00045, 0.0)).rgb)), min(emberHeatCore(texture2D(map, vMapUv + vec2(0.0, 0.00045)).rgb), emberHeatCore(texture2D(map, vMapUv - vec2(0.0, 0.00045)).rgb)))`};
emberCore *= emberWarm * emberPlayfield;
diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.20, 0.034, 0.010), vec3(0.38, 0.075, 0.014), emberCore), emberVein * 0.82);`).replace("#include <emissivemap_fragment>", "totalEmissiveRadiance = vec3(0.055, 0.012, 0.002) * emberVein + vec3(0.36, 0.11, 0.015) * emberCore;");
		};
		material.customProgramCacheKey = () => `${cacheKey}|ember-basalt-v11:${scenery}`;
		material.needsUpdate = true;
	});
}
/** Dry canal/road pigment follows published routes. Permanent green zones are
* authored terrain paint; staged water and planted state keep their existing owners. */
function clarifyRedFieldsRoute(model, points, greenZones = [], cutBanks = false) {
	if (isMapBeautyDisabled() || points.length < 2) return;
	const segments = points.slice(1).map((end, i) => new THREE.Vector4(points[i].x, points[i].z, end.x, end.z));
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.domeCanalSegments = { value: segments };
			shader.uniforms.domeCanalEarth = { value: new THREE.Color("#af8b69") };
			shader.uniforms.domeCanalBed = { value: new THREE.Color(greenZones.length ? "#b39b74" : "#777467") };
			shader.uniforms.redFieldsGreen = { value: new THREE.Color("#82916e") };
			shader.uniforms.redFieldsZones = { value: greenZones.map((z) => new THREE.Vector4(z.minX, z.minZ, z.maxX, z.maxZ)) };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vDomeCanal;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvDomeCanal = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>\nvarying vec3 vDomeCanal;\nuniform vec4 domeCanalSegments[${segments.length}];\nuniform vec3 domeCanalEarth, domeCanalBed;${greenZones.length ? `\nuniform vec3 redFieldsGreen;\nuniform vec4 redFieldsZones[${greenZones.length}];` : ""}`).replace("#include <map_fragment>", `#include <map_fragment>
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
domeCanalPigment = mix(domeCanalPigment, redFieldsGreen, redFieldsGreenMask * 0.82);` : ""}
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalPigment * (1.0 + domeCanalGrain * 0.035), ${greenZones.length ? "0.48" : "0.58"} * domeCanalInterior);
float domeCanalBedMask = 1.0 - smoothstep(${cutBanks ? "1.4, 1.65" : "1.3, 2.1"}, domeCanalDistance);
float domeCanalShoulder = smoothstep(${cutBanks ? "1.4, 1.65" : "1.5, 2.1"}, domeCanalDistance) * (1.0 - smoothstep(${cutBanks ? "2.35, 2.8" : "2.8, 3.8"}, domeCanalDistance));
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalBed * (0.94 + domeCanalGrain * 0.04), ${greenZones.length ? "0.48" : "0.68"} * domeCanalBedMask * domeCanalInterior);
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalEarth * 1.22, ${greenZones.length ? "0.18" : "0.35"} * domeCanalShoulder * domeCanalInterior);${cutBanks ? `
// A narrow mineral lip defines the inherited cut without inventing height or water.
float oldCanalLip = smoothstep(1.25, 1.4, domeCanalDistance) * (1.0 - smoothstep(1.6, 1.8, domeCanalDistance));
diffuseColor.rgb *= 1.0 - oldCanalLip * domeCanalInterior * 0.16;` : ""}`);
		};
		material.customProgramCacheKey = () => `redfields-dry-route-v2:${segments.length}:${greenZones.length}${cutBanks ? ":cut-banks-v1" : ""}`;
		material.needsUpdate = true;
	}
}
/** Picnic owns a cleaned pigment atlas; the Mesa source and sampled geometry stay shared. */
function paintPicnicGround(model, detailTextureUrl) {
	if (!detailTextureUrl) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial || !mesh.material.map) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		let disposed = false;
		const pigment = new THREE.TextureLoader().load(detailTextureUrl, (texture) => {
			if (disposed) texture.dispose();
		});
		pigment.colorSpace = THREE.SRGBColorSpace;
		pigment.flipY = false;
		pigment.anisotropy = mesh.material.map.anisotropy;
		material.addEventListener("dispose", () => {
			disposed = true;
			pigment.dispose();
		});
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.picnicGround = { value: pigment };
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D picnicGround;").replace("#include <map_fragment>", "diffuseColor *= texture2D(picnicGround, vMapUv);");
		};
		material.customProgramCacheKey = () => `${cacheKey}|picnic-ground-v1`;
		material.needsUpdate = true;
	});
}
/** Separate existing shelves from their lower ground without moving any surface. */
function gradeTerrainByHeight(model, lowColor, highColor, lowHeight, highHeight, paintMix) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
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
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vHeightPaint;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeightPaint = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vHeightPaint;\nuniform vec3 heightPaintLow, heightPaintHigh;\nuniform vec2 heightPaintRange;\nuniform float heightPaintMix;").replace("#include <map_fragment>", `#include <map_fragment>
float heightPaintInterior = 1.0 - smoothstep(48.0, 64.0, max(abs(vHeightPaint.x), abs(vHeightPaint.z)));
float heightPaintFactor = smoothstep(heightPaintRange.x, heightPaintRange.y, vHeightPaint.y);
diffuseColor.rgb = mix(diffuseColor.rgb, mix(heightPaintLow, heightPaintHigh, heightPaintFactor), heightPaintMix * heightPaintInterior);`);
		};
		material.customProgramCacheKey = () => "terrain-height-pigment-v1";
		material.needsUpdate = true;
	}
}
/** Prepared boiler aprons and combed earth follow the existing terrace/bed coordinates. */
function clarifyPressureGardenTerraces(model, detailTextureUrl) {
	if (isMapBeautyDisabled() || !detailTextureUrl) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		let disposed = false;
		const gravel = new THREE.TextureLoader().load(detailTextureUrl, (texture) => {
			if (disposed) texture.dispose();
		});
		gravel.colorSpace = THREE.SRGBColorSpace;
		gravel.wrapS = gravel.wrapT = THREE.RepeatWrapping;
		material.addEventListener("dispose", () => {
			disposed = true;
			gravel.dispose();
		});
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.gardenGravel = { value: gravel };
			shader.uniforms.gardenWorkedPigment = { value: new THREE.Color("#957957") };
			shader.uniforms.gardenRowPigment = { value: new THREE.Color("#9d8662") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vGardenGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvGardenGround = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vGardenGround;\nuniform vec3 gardenWorkedPigment;\nuniform vec3 gardenRowPigment;\nuniform sampler2D gardenGravel;").replace("#include <map_fragment>", `#include <map_fragment>
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
		material.customProgramCacheKey = () => "pressure-garden-worked-terraces-gravel-v2";
		material.needsUpdate = true;
	}
}
/** Authored rocks use world depth even when carried by the panorama pack. */
function preparePanoramaRocks(model, ...materialNames) {
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !materialNames.includes(mesh.material.name)) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		const key = material.customProgramCacheKey();
		mesh.renderOrder = 0;
		material.depthWrite = true;
		material.fog = true;
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.vertexShader = shader.vertexShader.replace("gl_Position.z = gl_Position.w * 0.999999;", "");
		};
		material.customProgramCacheKey = () => `${key}|garden-bank-foreground`;
		material.needsUpdate = true;
	});
}
/** Worked yards and pale ballast follow the two published funicular lines and terrace tops. */
function clarifyInclineYards(model) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial && mesh.material.map) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.inclineEarth = { value: new THREE.Color("#92795c") };
			shader.uniforms.inclineBallast = { value: new THREE.Color("#aaa088") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vInclineGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvInclineGround = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vInclineGround;\nuniform vec3 inclineEarth;\nuniform vec3 inclineBallast;").replace("#include <map_fragment>", `#include <map_fragment>
float inclineX = abs(vInclineGround.x), inclineZ = vInclineGround.y;
float inclineDry = smoothstep(6.25, 9.0, abs(inclineZ));
float inclineInterior = 1.0 - smoothstep(38.0, 47.0, max(inclineX, abs(inclineZ)));
float inclineRail = 1.0 - smoothstep(0.75, 1.75, abs(inclineX - 12.0));
diffuseColor.rgb = mix(diffuseColor.rgb, inclineEarth, 0.28 * inclineDry * inclineInterior);
diffuseColor.rgb = mix(diffuseColor.rgb, inclineBallast, 0.42 * inclineRail * inclineDry * inclineInterior);
float inclineCrest = max(1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 13.0)), max(1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 28.0)), 1.0 - smoothstep(0.2, 0.9, abs(inclineZ - 42.0))));
diffuseColor.rgb = mix(diffuseColor.rgb, inclineBallast, 0.22 * inclineCrest * inclineInterior);`);
		};
		material.customProgramCacheKey = () => "incline-worked-yards-v1";
		material.needsUpdate = true;
	}
}
/** Quiet the canyon's repeated hatch and carry its earth value into the painted apron. */
function clarifyCanyonGround(model, panorama = false) {
	if (isMapBeautyDisabled()) return;
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial) materials.add(mesh.material);
	});
	for (const material of materials) {
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.canyonEarth = { value: new THREE.Color("#806a53") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vCanyonGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvCanyonGround = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vCanyonGround;\nuniform vec3 canyonEarth;");
			if (panorama && material.name !== "CanyonApronEarth") {
				// The apron belongs to the panorama mesh, not the heightfield. Preserve sky paint.
				shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
float canyonApron = (1.0 - smoothstep(66.0, 108.0, max(abs(vCanyonGround.x) * 56.0 / 48.0, abs(vCanyonGround.z)))) * (1.0 - smoothstep(1.0, 8.0, vCanyonGround.y));
totalEmissiveRadiance = mix(totalEmissiveRadiance, canyonEarth * 0.32, canyonApron * 0.65);`);
			} else {
				shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
float canyonDry = smoothstep(6.25, 9.0, abs(vCanyonGround.z));
diffuseColor.rgb = mix(diffuseColor.rgb, canyonEarth, 0.34 * canyonDry);
float canyonShelf = smoothstep(0.5, 6.0, vCanyonGround.y);
diffuseColor.rgb *= 1.0 + canyonShelf * 0.10;`);
			}
		};
		material.customProgramCacheKey = () => `canyon-ground-v2-${panorama}-${material.name}`;
		material.needsUpdate = true;
	}
}
function applyNightTerrainPools(model, host, opaqueLandmark = false) {
	// Carried pools use the rig's steel-blue family at the prior ground tint's luminance.
	const materials = new Set();
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh) return;
		if (!opaqueLandmark) mesh.renderOrder = .1;
		for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
	});
	const poolSources = Array.from({ length: NIGHT_POOL_SHADER_CAP }, () => new THREE.Vector4());
	const poolCount = { value: 0 };
	const poolDarkness = { value: 0 };
	const poolIntensity = { value: Balance.contracts.nightShift.terrainPoolIntensity };
	const poolFalloff = { value: Balance.contracts.nightShift.lightFalloff };
	const poolCandidates = [];
	const poolGradeStrength = { value: Balance.contracts.nightShift.poolGradeStrength };
	const poolGradeKnee = { value: Balance.contracts.nightShift.poolGradeKnee };
	const poolGradeCeiling = { value: Balance.contracts.nightShift.poolGradeCeiling };
	const poolGradeEnabled = !isPoolGradeDisabled();
	let lastUpdatedFrame = -1;
	const updateNightPools = (renderer) => {
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
			if (source.kind !== "watch") poolCandidates.push(source);
		}
		poolCandidates.sort((a, b) => nightPoolPriority(a) - nightPoolPriority(b) || a.id.localeCompare(b.id));
		poolCount.value = Math.min(poolCandidates.length, NIGHT_POOL_SHADER_CAP);
		for (let index = 0; index < NIGHT_POOL_SHADER_CAP; index += 1) {
			const source = index < poolCount.value ? poolCandidates[index] : undefined;
			poolSources[index].set(source?.x ?? 0, source?.z ?? 0, source?.radius ?? 0, isWarmPool(source) ? 1 : 0);
		}
		if (!opaqueLandmark) host.canvas.dataset.terrain3dPilotNightPoolSources = String(poolCount.value);
	};
	for (const material of materials) {
		if (!material.isMeshStandardMaterial) continue;
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
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vTerrain3dWorld;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvTerrain3dWorld = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>\nvarying vec2 vTerrain3dWorld;\nuniform float uTerrain3dNightPoolCount;\nuniform float uTerrain3dNightPoolDarkness;\nuniform float uTerrain3dNightPoolIntensity;\nuniform float uTerrain3dNightPoolFalloff;\nuniform vec4 uTerrain3dNightPools[${NIGHT_POOL_SHADER_CAP}];`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\nvec3 terrain3dPoolLight = vec3(0.0);\nfor (int terrain3dPoolIndex = 0; terrain3dPoolIndex < ${NIGHT_POOL_SHADER_CAP}; terrain3dPoolIndex++) {\n  if (float(terrain3dPoolIndex) >= uTerrain3dNightPoolCount) break;\n  vec4 terrain3dPool = uTerrain3dNightPools[terrain3dPoolIndex];\n  float terrain3dPoolDistance = distance(vTerrain3dWorld, terrain3dPool.xy);\n  float terrain3dPoolFalloffT = clamp((terrain3dPoolDistance - terrain3dPool.z) / uTerrain3dNightPoolFalloff, 0.0, 1.0);\n  float terrain3dPoolFalloff = pow(1.0 - terrain3dPoolFalloffT, 1.5);\n  float terrain3dPoolCore = 1.0 - smoothstep(0.0, 0.5, terrain3dPoolDistance / max(terrain3dPool.z, 0.0001));\n  vec3 terrain3dPoolWarm = mix(vec3(1.00, 0.485, 0.10), vec3(1.00, 0.62, 0.20), terrain3dPoolCore);\n  vec3 terrain3dPoolTint = mix(vec3(0.329, 0.473, 0.596), terrain3dPoolWarm, step(0.5, terrain3dPool.w));\n  terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n}\ntotalEmissiveRadiance += diffuseColor.rgb * terrain3dPoolLight * uTerrain3dNightPoolDarkness * uTerrain3dNightPoolIntensity;`);
			if (poolGradeEnabled) {
				// Second-stage rewrites over the block above: track the strongest warm pool's coverage
				// and per-fragment warm tint through the existing loop, then grade outgoingLight right
				// before ACES. Under ?nopoolgrade none of these run and the shader is byte-identical.
				shader.fragmentShader = shader.fragmentShader.replace("uniform vec4 uTerrain3dNightPools", "uniform float uTerrain3dNightPoolGradeStrength;\nuniform float uTerrain3dNightPoolGradeKnee;\nuniform float uTerrain3dNightPoolGradeCeiling;\nuniform vec4 uTerrain3dNightPools").replace("vec3 terrain3dPoolLight = vec3(0.0);", "vec3 terrain3dPoolLight = vec3(0.0);\nfloat terrain3dPoolGradeMask = 0.0;\nvec3 terrain3dPoolGradeTint = vec3(1.00, 0.62, 0.20);").replace("terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);", "terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n  float terrain3dPoolWarmCoverage = terrain3dPoolFalloff * step(0.5, terrain3dPool.w);\n  if (terrain3dPoolWarmCoverage > terrain3dPoolGradeMask) {\n    terrain3dPoolGradeMask = terrain3dPoolWarmCoverage;\n    terrain3dPoolGradeTint = terrain3dPoolWarm;\n  }").replace("#include <opaque_fragment>", `${POOL_GRADE_GLSL}\n#include <opaque_fragment>`);
			}
		};
		material.needsUpdate = true;
	}
	model.traverse((node) => {
		const mesh = node;
		if (mesh.isMesh) mesh.onBeforeRender = updateNightPools;
	});
	if (!opaqueLandmark) {
		host.canvas.dataset.terrain3dPilotNightPools = "world-shader";
		host.canvas.dataset.terrain3dPilotNightPoolSources = "0";
	}
}
function nightPoolPriority(source) {
	if (source.kind === "hero") return 0;
	if (source.kind === "prospector") return 1;
	if (source.kind === "lantern" || source.kind === "powered-lamp") return 2;
	return 3;
}
function isWarmPool(source) {
	return source?.kind !== "hero" && source?.kind !== "prospector";
}
/**
* The 3D pilot hides `SpringPonds` along with every other painted ground layer, which on a map whose
* whole story is one spring leaves the water as baked atlas paint. Contracts in
* `LIVE_SPRING_POND_CONTRACTS` get that surface back as render-only geometry. Water uses the sim's
* `waterSources[].radius`; the measured atlas cap only sizes the separate damp-ground cover.
*/
function createLiveSpringPonds(host, heightAt) {
	const pool = LIVE_SPRING_POND_CONTRACTS.get(host.contractId);
	if (!pool) return [];
	return waterSources().filter((source) => source.kind === "spring_pond").map((source) => createSpringPondSurface({
		x: source.x,
		z: source.z,
		radius: source.radius,
		surfaceY: heightAt(source.x, source.z) + pool.surfaceY,
		heightAt
	}));
}
function hidePaintedRelief(host) {
	const objects = new Set();
	host.scene.traverse((object) => {
		// F-CORR4-18 keeps the contract-owned water and its existing animation/depth.
		// Only the bank, ford paint and old stepping stones yield to the new pack.
		if (host.contractId === "e10-river" && object.userData.assetSlot === "terrain.river") return;
		if (object.userData.terrainRelief === true || object.userData.terrainVista === true || LEGACY_GROUND_SLOTS.has(String(object.userData.assetSlot)) || object.name === "SpringPonds" || object.name === "FordSteppingStones" || object.name.startsWith("RiverGravelBar.")) objects.add(object);
	});
	if (host.paintedGround) objects.add(host.paintedGround);
	const hidden = [...objects].map((object) => ({
		object,
		visible: object.visible
	}));
	for (const { object } of hidden) object.visible = false;
	return hidden;
}
function createChannelWater(contractId, contract, heightAt) {
	const dressing = CONTRACT_CHANNEL_WATER[contractId];
	const regions = contract.maskTruth?.waterMask?.regions ?? [];
	if (!dressing || regions.length === 0) return undefined;
	// `?nochannelwater` boots the identical build with the dressing withheld. It exists because a
	// beauty claim is only worth what its A/B proves, and it also answers "is this render or sim?"
	// in one reload: every suite behaves identically with it on, because the water is decoration.
	if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("nochannelwater")) return undefined;
	const wade = Balance.terrainSim.wadeDepth;
	const deep = Balance.terrainSim.deepDepth;
	const group = new THREE.Group();
	group.name = "Terrain3dChannelWater";
	group.userData.renderOnly = true;
	for (const region of regions) {
		const channel = dressing.channels[region.id];
		const points = region.points ?? [];
		if (!channel || region.kind !== "polyline_band" || region.zone !== "river" || points.length < 2 || !region.halfWidth) continue;
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
			depth: channel.depth === "deep" ? deep : wade + (deep - wade) * .34,
			glints: channel.glints ?? [],
			headInset: channel.headInset,
			tailInset: channel.tailInset,
			headFade: channel.headFade,
			tailFade: channel.tailFade,
			bed: {
				heightAt,
				...dressing.bed
			}
		}));
	}
	group.add(createWaterConfluence({
		name: "Terrain3dChannelWater.confluences",
		paths: dressing.confluences.map((confluence) => confluence.points),
		surfaceY: (contract.maskAgreement?.waterPlaneY ?? 0) + dressing.surfaceLift + .001,
		depth: wade + (deep - wade) * .58
	}));
	// THE CROSSINGS READ WET (beauty U2's affordance half). Both fords are cut below the water plane
	// across an 11 m band while only a 3.4 m ribbon crosses them, so the pans rendered as brown
	// gravel with a stripe of river through it and the pressure board showed enemies wading dry
	// ground. One sheet for both pans, from the mask's own ford rects.
	const pans = regions.filter((region) => region.kind === "rect" && region.zone === "ford" && region.minX !== undefined);
	if (dressing.fordDepth !== undefined && pans.length > 0) {
		const halfDepth = Math.max(...pans.map((pan) => (pan.maxZ - pan.minZ) / 2));
		group.add(createFordSheet({
			name: "Terrain3dChannelWater.fords",
			pans: pans.map((pan) => ({
				minX: pan.minX,
				maxX: pan.maxX,
				minZ: pan.minZ,
				maxZ: pan.maxZ
			})),
			halfDepth,
			surfaceY: (contract.maskAgreement?.waterPlaneY ?? 0) + dressing.surfaceLift,
			depth: wade + (deep - wade) * dressing.fordDepth
		}));
	}
	if (group.children.length === 0) return undefined;
	const clock = {
		frame: -1,
		last: 0
	};
	const advance = (renderer) => {
		if (renderer.info.render.frame === clock.frame) return;
		clock.frame = renderer.info.render.frame;
		const now = performance.now();
		const delta = clock.last === 0 ? 0 : Math.min(.1, Math.max(0, (now - clock.last) / 1e3));
		clock.last = now;
		for (const child of group.children) updateWaterMaterial(child, delta);
	};
	for (const child of group.children) child.onBeforeRender = advance;
	return group;
}
function createContinuation(terrain, panorama, heightAt, bounds, contractId) {
	const source = terrain.getObjectByProperty("isMesh", true);
	if (!source || Array.isArray(source.material)) return undefined;
	panorama.updateMatrixWorld(true);
	const point = new THREE.Vector3();
	let outerRadius = Number.POSITIVE_INFINITY;
	let outerHeight = 0;
	let innerChebyshev = Number.POSITIVE_INFINITY;
	panorama.traverse((object) => {
		const mesh = object;
		const position = mesh.isMesh ? mesh.geometry.getAttribute("position") : undefined;
		if (!position) return;
		for (let index = 0; index < position.count; index += 1) {
			point.fromBufferAttribute(position, index);
			mesh.localToWorld(point);
			innerChebyshev = Math.min(innerChebyshev, Math.max(Math.abs(point.x), Math.abs(point.z)));
			const radius = Math.hypot(point.x, point.z);
			if (radius < outerRadius) {
				outerRadius = radius;
				outerHeight = point.y;
			}
		}
	});
	const deepSkyGround = contractId === "e10-ember-shore" || contractId === "e10-archive-world";
	const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
	const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
	if (!Number.isFinite(outerRadius) || !deepSkyGround && innerChebyshev <= Math.max(halfX, halfZ) + .5) return undefined;
	// The panorama's near ridge starts at radius 161.5; cover the intervening ground.
	if (deepSkyGround) outerRadius = 160;
	// Keep the night ground beyond every square corner and the perimeter landmarks.
	if (contractId === "e3-moth-season") outerRadius = Math.max(outerRadius, Math.hypot(halfX, halfZ) + 12);
	const edgeSegments = 32;
	const edge = [];
	for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(-halfX, halfX, index / edgeSegments), -halfZ]);
	for (let index = 0; index < edgeSegments; index += 1) edge.push([halfX, THREE.MathUtils.lerp(-halfZ, halfZ, index / edgeSegments)]);
	for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(halfX, -halfX, index / edgeSegments), halfZ]);
	for (let index = 0; index < edgeSegments; index += 1) edge.push([-halfX, THREE.MathUtils.lerp(halfZ, -halfZ, index / edgeSegments)]);
	const rings = Math.max(2, Math.min(32, Math.ceil((outerRadius - Math.max(halfX, halfZ)) / 5)));
	const positions = [];
	const uvs = [];
	const indices = [];
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
			const uvX = contractId === "e3-moth-season" || deepSkyGround ? x : sampleX;
			const uvZ = contractId === "e3-moth-season" || deepSkyGround ? z : sampleZ;
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
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setAttribute("uv1", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	if (contractId === "e10-ember-shore") {
		// The two surfaces already meet in position. Match their lighting normals
		// at that join, then blend into the apron over its first two rings.
		const sourcePositions = source.geometry.getAttribute("position");
		const sourceNormals = source.geometry.getAttribute("normal");
		const normals = geometry.getAttribute("normal");
		const edgeNormals = new Map();
		for (let i = 0; i < sourcePositions.count; i += 1) {
			const x = sourcePositions.getX(i), z = sourcePositions.getZ(i);
			if (Math.abs(Math.abs(x) - halfX) < .001 || Math.abs(Math.abs(z) - halfZ) < .001) {
				edgeNormals.set(`${x.toFixed(3)},${z.toFixed(3)}`, new THREE.Vector3().fromBufferAttribute(sourceNormals, i));
			}
		}
		const blended = new THREE.Vector3();
		for (let ring = 0; ring < 2; ring += 1) for (let i = 0; i < edge.length; i += 1) {
			const [x, z] = edge[i];
			const normal = edgeNormals.get(`${x.toFixed(3)},${z.toFixed(3)}`);
			if (!normal) continue;
			const index = ring * edge.length + i;
			blended.fromBufferAttribute(normals, index).lerp(normal, 1 - ring * .5).normalize();
			normals.setXYZ(index, blended.x, blended.y, blended.z);
		}
		normals.needsUpdate = true;
	}
	geometry.computeBoundingSphere();
	const material = source.material.clone();
	if (contractId === "e3-moth-season" || deepSkyGround) {
		const mapped = material;
		if (mapped.map) {
			mapped.map = mapped.map.clone();
			mapped.map.wrapS = mapped.map.wrapT = THREE.MirroredRepeatWrapping;
			mapped.map.needsUpdate = true;
		}
	}
	material.side = THREE.DoubleSide;
	material.fog = deepSkyGround;
	material.depthWrite = false;
	material.onBeforeCompile = (shader) => {
		shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.99999;");
	};
	if (contractId === "e10-archive-world") {
		// The floor must occlude the buried feet of near library scenery.
		material.depthWrite = true;
		material.onBeforeCompile = () => undefined;
		material.customProgramCacheKey = () => "archive-continuation-depth-v1";
	}
	// THE ATMOSPHERICS SHIFT: this apron — not the panorama — is what a run frame's top edge
	// actually contains once the player crosses onto the far bank. Measured, per contract, in
	// src/world/HorizonApron.ts.
	const apron = horizonApronProfile(contractId);
	if (apron) paintHorizonApron(material, apron);
	const continuation = new THREE.Mesh(geometry, material);
	continuation.receiveShadow = deepSkyGround;
	continuation.userData.horizonApron = apron ? "painted" : "plain";
	continuation.frustumCulled = false;
	continuation.renderOrder = -50;
	continuation.name = "Terrain3dSculptContinuation";
	continuation.userData.terrain3dSkirtBlend = true;
	return continuation;
}
export function installTerrain3dClaimPilot(host) {
	const selected = REGISTRY[host.contractId];
	host.canvas.dataset.terrain3dPilotContract = host.contractId;
	if (performanceTierDiagnostics().tier === "lite") {
		host.canvas.dataset.terrain3dPilotLandmarkLoadState = "lite";
		publish(host.canvas, "lite", "painted");
		return () => undefined;
	}
	if (!selected || selected.contract.tileId !== host.tileId) {
		host.canvas.dataset.terrain3dPilotLandmarkLoadState = "off";
		publish(host.canvas, "failed", "painted", undefined, undefined, undefined, "pilot-contract-unavailable");
		return paintRiverReturn(host);
	}
	const restoreRiverPaint = paintRiverReturn(host);
	let disposed = false;
	let terrain;
	let panorama;
	let landmarks;
	let skirt;
	let sculptWater;
	let sunMotes;
	let rushEmbers;
	let steamPlume;
	let steamWisps = [];
	let haulSteam;
	let landmarkContacts;
	let waterCollars;
	let spanShadow;
	let crossingBreath;
	let ponds = [];
	let nextPonds = [];
	let channelWater;
	let hiddenRelief = [];
	let loadedTerrain;
	let loadedPanorama;
	let loadFailed = false;
	let uninstallHeightSource;
	let landmarkWalkSurfaces = null;
	const onContextLost = () => reportRenderDemotion(host.canvas, "webgl-context-lost");
	host.canvas.addEventListener("webglcontextlost", onContextLost);
	host.canvas.dataset.terrain3dPilotTerrainLoadState = "pending";
	host.canvas.dataset.terrain3dPilotPanoramaLoadState = "pending";
	host.canvas.dataset.terrain3dPilotLandmarkLoadState = "pending";
	publish(host.canvas, "loading", "painted");
	const loader = trackedGltfLoader(host.canvas, "the claim");
	const disposeLoaded = () => {
		if (loadedTerrain) {
			disposeObject3D(loadedTerrain);
			host.canvas.dataset.terrain3dPilotTerrainLoadState = "disposed";
		}
		if (loadedPanorama) {
			disposeObject3D(loadedPanorama);
			host.canvas.dataset.terrain3dPilotPanoramaLoadState = "disposed";
		}
		loadedTerrain = undefined;
		loadedPanorama = undefined;
	};
	const failLoad = (error) => {
		if (loadFailed) return;
		loadFailed = true;
		disposeLoaded();
		if (!disposed) publish(host.canvas, "failed", "painted", undefined, undefined, undefined, `pilot-load-failed:${error instanceof Error ? error.message : "unknown"}`);
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
				throw new Error("terrain contract mismatch");
			}
			const heightAt = bakeHeightGrid(nextTerrain, terrainMetrics);
			if (disposed) throw new Error("terrain pilot disposed");
			nextPonds = createLiveSpringPonds(host, heightAt);
			nextTerrain.name = "Terrain3dClaimPilot";
			if (host.archiveRestoration) installArchiveRestoration(nextTerrain, host.archiveRestoration);
			if (host.contractId === "e1-twin-banks") calmTwinBanksGround(nextTerrain);
			if (host.contractId === "e1-baron") separateBaronGroundScars(nextTerrain);
			if (host.contractId === "e2-trestle") calmTrestleApproaches(nextTerrain);
			if (host.contractId === "e2-pressure-garden") clarifyPressureGardenTerraces(nextTerrain, selected.detailTextureUrl);
			if (host.contractId === "e2-incline") clarifyInclineYards(nextTerrain);
			if (host.contractId === "e3-canyon-works") clarifyCanyonGround(nextTerrain);
			if (host.contractId === "e10-last-claim") paintLastClaimDeck(nextTerrain);
			if (host.contractId === "e10-river") paintRiverBanks(nextTerrain);
			if (host.contractId === "e10-ember-shore") clarifyEmberBasalt(nextTerrain, selected.detailTextureUrl);
			if (host.contractId === "e10-archive-world") clarifyArchiveTerraces(nextTerrain, host.archiveRestoration, selected.detailTextureUrl);
			if (host.contractId === "e9-devils-alley") gradeTerrainByHeight(nextTerrain, "#9f8b6e", "#bba487", -.14, 4.57, .46);
			if (host.contractId === "e8-low-orbit") gradeTerrainByHeight(nextTerrain, "#777a76", "#a5a28e", -4.8, .7, .38);
			if (host.contractId === "e8-far-side") clarifyFarSideRegolith(nextTerrain);
			if (host.contractId === "e9-dome-basin" && selected.contract.maskTruth?.canalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.canalRoute.points);
			if (host.contractId === "e9-old-canal" && selected.contract.maskTruth?.inheritedCanalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.inheritedCanalRoute.points, [], true);
			if (host.contractId === "e9-seed-run" && selected.contract.maskTruth?.caravanRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.caravanRoute, selected.contract.maskTruth.permanentGreenWaypointZones);
			if (host.contractId === "e6-glow-mesa") gradeTerrainByHeight(nextTerrain, "#9f8867", "#9b9682", 1.5, 4.6, .34);
			if (host.contractId === "e7-relay-rush") gradeTerrainByHeight(nextTerrain, "#898476", "#b2a482", .4, 4.6, .34);
			if (host.contractId === "e7-dead-band") gradeTerrainByHeight(nextTerrain, "#888474", "#b2ab92", .4, 4.6, .34);
			if (host.contractId === "e6-picnic") gradeTerrainByHeight(nextTerrain, "#9f8867", "#a1a483", 1.5, 4.6, .34);
			if (host.contractId === "e6-picnic") paintPicnicGround(nextTerrain, selected.detailTextureUrl);
			if (host.contractId === "e6-half-life-hollow") gradeTerrainByHeight(nextTerrain, "#897c68", "#b9a788", -1.9, 1.8, .32);
			if ((host.contractId === "e4-dust-flats" || host.contractId === "e4-long-road" || host.contractId === "e4-gusher-county" || host.contractId === "e4-boneyard") && selected.contract.maskTruth) clarifyMotorGround(nextTerrain, selected.contract.maskTruth, false, host.contractId === "e4-gusher-county" ? .3 : host.contractId === "e4-boneyard" ? .72 : .78);
			if (host.nightMode) applyNightTerrainPools(nextTerrain, host);
			else {
				host.canvas.dataset.terrain3dPilotNightPools = "off";
				host.canvas.dataset.terrain3dPilotNightPoolSources = "0";
			}
			const mount = selected.contract.panoramaMount;
			nextPanorama.name = mount.id;
			nextPanorama.position.fromArray(mount.position);
			nextPanorama.rotation.set(...mount.rotation);
			nextPanorama.scale.fromArray(mount.scale);
			preparePanorama(nextPanorama);
			if (host.contractId === "e2-pressure-garden") preparePanoramaRocks(nextPanorama, "GardenBankStone");
			if (host.contractId === "e3-canyon-works") preparePanoramaRocks(nextPanorama, "CanyonCliffStone", "CanyonApronEarth");
			if (host.contractId === "e10-archive-world") prepareArchiveLibrary(nextPanorama, selected.detailTextureUrl);
			if (host.contractId === "e10-ember-shore") clarifyEmberBasalt(nextPanorama, selected.detailTextureUrl, true);
			if (host.contractId === "e3-canyon-works") clarifyCanyonGround(nextPanorama, true);
			if (host.contractId === "e4-long-road" && selected.contract.maskTruth) clarifyMotorGround(nextPanorama, selected.contract.maskTruth, true);
			if (selected.contract.waterSurface?.owner === "runtime DeepwaterClaimTile") {
				host.canvas.dataset.terrain3dPilotSeaApronTriangles = String(routeSeaApron(nextTerrain, nextPanorama, terrainMetrics.bounds));
			}
			const nextSkirt = createContinuation(nextTerrain, nextPanorama, heightAt, terrainMetrics.bounds, host.contractId);
			if (host.contractId === "e10-river" && nextSkirt) paintRiverBanks(nextSkirt);
			if (host.contractId === "e10-ember-shore" && nextSkirt) clarifyEmberBasalt(nextSkirt, selected.detailTextureUrl);
			if (host.contractId === "e10-archive-world" && nextSkirt) clarifyArchiveTerraces(nextSkirt, host.archiveRestoration, selected.detailTextureUrl);
			if (host.contractId === "e3-moth-season" && host.nightMode && nextSkirt) {
				const material = nextSkirt.material;
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
			const pointerSurfaces = [nextTerrain, ...nextPonds.map((pond) => pond.group)];
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
			host.canvas.dataset.terrain3dPilotChannelWater = String(nextChannelWater?.children.filter((child) => child.name.includes("-channel")).length ?? 0);
			host.canvas.dataset.terrain3dPilotFordWater = String(nextChannelWater?.children.filter((child) => child.name.endsWith(".fords")).length ?? 0);
			host.canvas.dataset.terrain3dPilotChannelWaterHalfWidths = JSON.stringify(nextChannelWater?.children.filter((child) => child.name.includes("-channel")).map((child) => child.userData.visualHalfWidth) ?? []);
			hiddenRelief = hidePaintedGround(host);
			// A decoration must never cost the map its sculpt: if the water fails to
			// build, the terrain stays mounted and the failure is published, not silent.
			try {
				sculptWater = mountSculptWater(host, heightAt, terrainMetrics.bounds);
				if (sculptWater) pointerSurfaces.push(sculptWater.mesh);
			} catch (error) {
				const message = error instanceof Error ? error.message : "unknown";
				host.canvas.dataset.terrain3dPilotSculptWater = `failed:${message}`;
				reportRenderDemotion(host.canvas, `sculpt-water-failed:${message}`);
			}
			try {
				sunMotes = mountSunMotes(host, terrainMetrics.bounds);
			} catch (error) {
				host.canvas.dataset.terrain3dPilotMotes = `failed:${error instanceof Error ? error.message : "unknown"}`;
			}
			try {
				crossingBreath = mountCrossingBreath(host, sculptWater?.mesh.position.y);
			} catch (error) {
				host.canvas.dataset.terrain3dPilotSteam = `failed:${error instanceof Error ? error.message : "unknown"}`;
			}
			host.canvas.dataset.terrain3dPilotTerrainLoadState = "mounted";
			host.canvas.dataset.terrain3dPilotPanoramaLoadState = "mounted";
			host.canvas.dataset.terrain3dPilotHiddenRelief = String(hiddenRelief.length);
			host.canvas.dataset.terrain3dPilotHiddenGroundLayers = hiddenRelief.map(({ object }) => object.name || String(object.userData.assetSlot)).filter(Boolean).join("|");
			host.canvas.dataset.terrain3dPilotContinuation = nextSkirt ? "sculpt-edge-continuation" : "panorama-owned-continuation";
			// THE ATMOSPHERICS SHIFT's plain-boot door: the apron is the only horizon surface a run
			// frame can reach (the panorama measured 0% at every hero position, both viewports), so
			// whether it is painted has to be readable without ?debug.
			host.canvas.dataset.terrain3dPilotHorizonApron = String(nextSkirt?.userData.horizonApron ?? "none");
			// THE FAR GROUND SHIFT's instrument (src/world/HorizonApron.ts). Colour only, last thing
			// mounted so nothing downstream re-touches the materials it flattens. The painted-material
			// counts are published because they are the probe's positive control: a census that reads
			// 0.00% panorama means "off camera" only if the ring was provably repainted.
			const probeMode = farGroundProbeMode();
			if (probeMode === "off") host.canvas.dataset.terrain3dPilotFarGroundProbe = "off";
			else {
				const painted = {
					panorama: paintFarGroundProbe(nextPanorama, "panorama"),
					apron: paintFarGroundProbe(nextSkirt, "apron"),
					terrain: paintFarGroundProbe(nextTerrain, "terrain")
				};
				// solo: nothing left that could occlude the ring. If it is in the frustum, it IS the frame.
				if (probeMode === "solo") {
					nextTerrain.visible = false;
					if (nextSkirt) nextSkirt.visible = false;
				}
				host.canvas.dataset.terrain3dPilotFarGroundProbe = `${probeMode}:panorama=${painted.panorama},apron=${painted.apron},terrain=${painted.terrain}`;
			}
			host.canvas.dataset.terrain3dPilotPanoramaFraming = "world-projected-horizon";
			// Keep the original probe values until the registry contract is migrated.
			host.canvas.dataset.terrain3dPilotSkirtBlend = "opaque-sculpt-edge";
			host.canvas.dataset.terrain3dPilotPanoramaFog = "excluded";
			host.canvas.dataset.terrain3dPilotPanoramaDepth = "screen-horizon-backdrop";
			const mounts = landmarkMountsFor(selected.contract, host.contractId);
			host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);
			const closureCensus = new Map();
			const diagnostics = [];
			const nextLandmarks = new THREE.Group();
			nextLandmarks.name = "Terrain3dLandmarks";
			nextLandmarks.userData.renderOnly = true;
			const loadMount = async (mount) => {
				try {
					const key = landmarkAssetKey(mount.asset);
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
					if (host.contractId !== "e1-night-shift") {
						const live = LIVE_SPRING_POND_CONTRACTS.has(host.contractId) && mount.id === "isolated_spring";
						const contractIntensity = LANDMARK_EMISSIVE[host.contractId];
						const paint = live ? {
							intensity: DRY_GULCH_SPRING_EMISSIVE,
							tint: DEFAULT_LANDMARK_PAINT.tint
						} : LANDMARK_PAINT[host.contractId]?.[mount.id] ?? (contractIntensity !== undefined ? {
							intensity: contractIntensity,
							tint: DEFAULT_LANDMARK_PAINT.tint
						} : DEFAULT_LANDMARK_PAINT);
						keepLandmarkPaintReadable(model, paint, host.contractId);
					} else if (mount.id === "lampworks_yard") {
						// Light-reactive paint, not whole-body emission. The cold seven
						// gameplay lanterns retain their real wrecked/relit states.
						model.traverse((node) => {
							const mesh = node;
							if (mesh.isMesh && !Array.isArray(mesh.material) && mesh.material.isMeshStandardMaterial) {
								mesh.material.color.multiplyScalar(1.65);
							}
						});
						applyNightTerrainPools(model, host, true);
					}
					if (host.contractId === "e1-baron" && BARON_SWAY_AMPLITUDE[mount.id] !== undefined) {
						installBannerSway(model, BARON_SWAY_AMPLITUDE[mount.id]);
					}
					dressLandmark(model, host.contractId, mount.id);
					if (host.contractId === "e10-river") paintRiverStones(model);
					if (host.archiveRestoration) installArchiveRestoration(model, host.archiveRestoration);
					if (host.contractId === "e10-archive-world") lightArchiveFacade(model, host.archiveRestoration);
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
					host.canvas.dataset.terrain3dPilotLandmarkLoadState = "disposed";
					return;
				}
				try {
					landmarkWalkSurfaces = createLandmarkWalkSurfaces(heightAt, nextLandmarks.children.map((model) => ({
						model,
						mount: mounts.find((mount) => mount.id === model.name)
					})));
				} catch (error) {
					disposeObject3D(nextLandmarks);
					host.canvas.dataset.terrain3dPilotLandmarkLoadState = "failed";
					host.canvas.dataset.terrain3dPilotLandmarkDiagnostics = `invalid landmark walk surface: ${String(error)}`;
					publish(host.canvas, "failed", "painted", terrainMetrics, undefined, panoramaMetrics, "landmark-walk-surfaces-invalid");
					return;
				}
				if (landmarkWalkSurfaces) {
					uninstallHeightSource?.();
					uninstallHeightSource = installVisualHeightSource(landmarkWalkSurfaces.heightAt, [...pointerSurfaces, ...landmarkWalkSurfaces.pointers]);
					host.onVisualHeightSourceInstalled?.();
				}
				host.canvas.dataset.terrain3dPilotWalkSurfaces = String(landmarkWalkSurfaces?.pointers.length ?? 0);
				landmarks = nextLandmarks;
				host.scene.add(nextLandmarks);
				try {
					landmarkContacts = mountLandmarkContacts(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})), heightAt, sculptWater?.mesh.position.y, terrainMetrics.bounds);
				} catch (error) {
					host.canvas.dataset.terrain3dPilotContactShadows = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					waterCollars = mountWaterCollars(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})), sculptWater?.mesh.position.y);
				} catch (error) {
					host.canvas.dataset.terrain3dPilotWaterCollars = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					spanShadow = mountSpanShadow(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})), sculptWater?.mesh.position.y);
				} catch (error) {
					host.canvas.dataset.terrain3dPilotSpanShadow = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					rushEmbers = mountRushEmbers(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})), heightAt);
				} catch (error) {
					host.canvas.dataset.terrain3dPilotRushEmbers = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					steamPlume = mountSteamPlume(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})));
				} catch (error) {
					host.canvas.dataset.terrain3dPilotSteam = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					steamWisps = mountSteamWisps(host, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})));
				} catch (error) {
					host.canvas.dataset.terrain3dPilotSteamWisps = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				try {
					haulSteam = mountHaulSteam(host, heightAt, nextLandmarks.children.map((model) => ({
						id: model.name,
						model
					})));
				} catch (error) {
					host.canvas.dataset.terrain3dPilotHaulSteam = `failed:${error instanceof Error ? error.message : "unknown"}`;
				}
				host.canvas.dataset.terrain3dPilotLandmarkLoadState = "mounted";
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
						return [{
							...row,
							baseY: +box.min.y.toFixed(3),
							topY: +box.max.y.toFixed(3)
						}];
					});
					const total = rows.reduce((sum, row) => ({
						meshes: sum.meshes + row.meshes,
						closed: sum.closed + row.closed,
						open: sum.open + row.open,
						culled: sum.culled + row.culled,
						doubleSided: sum.doubleSided + row.doubleSided
					}), {
						meshes: 0,
						closed: 0,
						open: 0,
						culled: 0,
						doubleSided: 0
					});
					host.canvas.dataset.terrain3dPilotLandmarkSides = JSON.stringify({
						total,
						mounts: rows
					});
				}
				host.canvas.dataset.terrain3dPilotLandmarks = String(nextLandmarks.children.length);
				host.canvas.dataset.terrain3dPilotLandmarkSkipped = String(diagnostics.length);
				host.canvas.dataset.terrain3dPilotLandmarkDiagnostics = diagnostics.join("; ");
				host.canvas.dataset.terrain3dPilotLandmarkMounts = JSON.stringify(nextLandmarks.children.map((model) => ({
					id: model.name,
					x: model.position.x,
					y: model.position.y,
					z: model.position.z
				})));
				host.canvas.dataset.terrain3dPilotLandmarkMaterials = JSON.stringify(nextLandmarks.children.map((model) => {
					const materials = new Set();
					model.traverse((node) => {
						const mesh = node;
						if (mesh.isMesh) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
					});
					// emissiveIntensity is PUBLISHED, not inferred from the table, because the paint is
					// applied by traversal after the body loads and a later pass can silently overwrite it —
					// which is exactly the defect F-BHM-1 found here (two keepLandmarkPaintReadable calls, the
					// second one resetting every per-contract intensity back to the default). A table lookup
					// in the dataset would have kept reporting the intended number while the map rendered the
					// other one.
					const standard = [...materials].filter((material) => material.isMeshStandardMaterial);
					const intensities = standard.map((material) => +material.emissiveIntensity.toFixed(3));
					const authored = standard.map((material) => material.userData.landmarkAuthoredEmissive).filter((value) => typeof value === "number");
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
						metalness: standard.length ? +Math.max(...standard.map((material) => material.metalness)).toFixed(3) : null
					};
				}));
				publish(host.canvas, "ready", "glb", terrainMetrics, nextPanorama, panoramaMetrics);
			});
		} catch (error) {
			disposeObject3D(nextTerrain);
			disposeObject3D(nextPanorama);
			for (const pond of nextPonds) pond.dispose();
			nextPonds = [];
			loadedTerrain = undefined;
			loadedPanorama = undefined;
			if (!disposed) publish(host.canvas, "failed", "painted", terrainMetrics, undefined, panoramaMetrics, `pilot-install-failed:${error instanceof Error ? error.message : "unknown"}`);
		}
	};
	const receive = (kind, model) => {
		if (disposed || loadFailed) {
			disposeObject3D(model);
			host.canvas.dataset[kind === "terrain" ? "terrain3dPilotTerrainLoadState" : "terrain3dPilotPanoramaLoadState"] = "disposed";
			return;
		}
		if (kind === "terrain") loadedTerrain = model;
		else loadedPanorama = model;
		host.canvas.dataset[kind === "terrain" ? "terrain3dPilotTerrainLoadState" : "terrain3dPilotPanoramaLoadState"] = "loaded";
		installLoaded();
	};
	void loader.loadAsync(selected.terrainUrl).then((gltf) => receive("terrain", gltf.scene), failLoad);
	void loader.loadAsync(selected.panoramaUrl).then((gltf) => receive("panorama", gltf.scene), failLoad);
	return () => {
		disposed = true;
		restoreRiverPaint();
		host.canvas.removeEventListener("webglcontextlost", onContextLost);
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
		for (const model of [
			terrain,
			panorama,
			landmarks,
			channelWater
		]) {
			if (!model) continue;
			host.scene.remove(model);
			disposeObject3D(model);
		}
		terrain = undefined;
		panorama = undefined;
		landmarks = undefined;
		channelWater = undefined;
		delete host.canvas.dataset.terrain3dPilotChannelWaterHalfWidths;
		host.canvas.dataset.terrain3dPilotLandmarkLoadState = "disposed";
	};
}
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
const LANDMARK_PAINT = {
	"e2-trestle": {
		"trestle-crossing": {
			intensity: 2.6,
			tint: "#ffffff"
		},
		"south-boiler-site": {
			intensity: 2.5,
			tint: "#e4e5e7"
		},
		"north-boiler-site": {
			intensity: 2.5,
			tint: "#e4e5e7"
		},
		"mine-spur-kit": {
			intensity: 2.2,
			tint: "#efe2cc"
		},
		"south-approach-kit": {
			intensity: 2.2,
			tint: "#ffffff"
		},
		"north-approach-kit": {
			intensity: 2.2,
			tint: "#ffffff"
		}
	},
	"e2-pressure-garden": {
		"garden-pressure-manifold": {
			intensity: 3,
			tint: "#e4e5e7"
		},
		"water-band-pump-station": {
			intensity: 3,
			tint: "#e4e5e7"
		},
		"west-terrace-pipe-header": {
			intensity: 3,
			tint: "#e4e5e7"
		},
		"east-terrace-pipe-header": {
			intensity: 3,
			tint: "#e4e5e7"
		},
		"coal-seam-service-winch": {
			intensity: 3,
			tint: "#e4e5e7"
		}
	},
	"e2-incline": {
		"upper-ore-cable-house": {
			intensity: 2.5,
			tint: "#e0e3df"
		},
		"west-line-brake-tower": {
			intensity: 2.5,
			tint: "#e0e3df"
		},
		"east-line-brake-tower": {
			intensity: 2.5,
			tint: "#e0e3df"
		}
	},
	"e1-baron": {
		fortified_far_bank: {
			intensity: 2.5,
			tint: "#aab5bb"
		},
		siege_line: {
			intensity: 2.2,
			tint: "#a8b0b4"
		},
		seized_headframe: {
			intensity: 2.4,
			tint: "#b6b6b0"
		},
		oxblood_banners: {
			intensity: 3.4,
			tint: "#ffd2b4"
		}
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
	"e2-hill-mine": { "boiler-house-site": {
		intensity: 2,
		tint: "#9aa6a6"
	} }
};
const DEFAULT_LANDMARK_PAINT = {
	intensity: 3,
	tint: "#ffffff"
};
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
const BARON_SWAY_AMPLITUDE = {
	oxblood_banners: .185,
	siege_line: .06
};
const BARON_SWAY_FLOOR = 2.2;
const baronSwayTime = { value: 0 };
function installBannerSway(model, amplitude) {
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material)) return;
		const material = mesh.material;
		if (material.userData.baronSwayAmplitude === amplitude) return;
		material.userData.baronSwayAmplitude = amplitude;
		const compile = material.onBeforeCompile.bind(material);
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.uBaronSwayTime = baronSwayTime;
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uBaronSwayTime;").replace("#include <begin_vertex>", `#include <begin_vertex>
float baronSwayLift = clamp((position.y - ${BARON_SWAY_FLOOR.toFixed(2)}) / 3.2, 0.0, 1.0);
baronSwayLift *= baronSwayLift;
float baronSwayPhase = position.x * 0.55;
float baronSway = sin(uBaronSwayTime * 1.7 + baronSwayPhase) * 0.72 + sin(uBaronSwayTime * 2.9 + baronSwayPhase * 1.9 + 1.3) * 0.28;
transformed.x += baronSway * baronSwayLift * ${amplitude.toFixed(3)};
transformed.z += sin(uBaronSwayTime * 1.31 + baronSwayPhase * 0.7) * baronSwayLift * ${(amplitude * .45).toFixed(3)};
transformed.y -= abs(baronSway) * baronSwayLift * ${(amplitude * .16).toFixed(3)};`);
		};
		// Two banner bodies must not share one compiled program, or the second one
		// silently inherits the first one's amplitude (Water.ts:82 pattern).
		material.customProgramCacheKey = () => `baron-sway:${amplitude}`;
		material.needsUpdate = true;
		// Frustum culling stays ON: the displacement is <=0.185 on a 29 m body, far
		// inside its bounding sphere, so disabling it would only buy draws when the
		// banners are off-screen.
		mesh.onBeforeRender = () => {
			baronSwayTime.value = performance.now() * .001;
		};
	});
}

//# sourceMappingURL=data:application/json;base64,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UUFBUSxDQUFDLEVBQUU7cURBQ2hFLFlBQVksSUFBSSxDQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQzFFO0VBQ0o7OztFQUdBLFNBQVMsOEJBQThCLGNBQWM7RUFDckQsU0FBUyxjQUFjOzs7O0VBSXZCLEtBQUssdUJBQXVCO0dBQzFCLGNBQWMsUUFBUSxZQUFZLElBQUksSUFBSTtFQUM1QztDQUNGLENBQUM7QUFDSCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJUZXJyYWluM2RDbGFpbVBpbG90LnRzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluc3RhbGxBcmNoaXZlUmVzdG9yYXRpb24sIHR5cGUgQXJjaGl2ZVJlc3RvcmF0aW9uU3RhdGUgfSBmcm9tICcuL0FyY2hpdmVSZXN0b3JhdGlvbic7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgYmFyb25Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9iYXJvbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBiYXJvblBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYmFyb24tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRyeUd1bGNoQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHJ5LWd1bGNoLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRyeUd1bGNoUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kcnktZ3VsY2gtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGhpbGxNaW5lQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaGlsbC1taW5lLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGhpbGxNaW5lUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9oaWxsLW1pbmUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG5pZ2h0U2hpZnRDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9uaWdodC1zaGlmdC10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBuaWdodFNoaWZ0UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9uaWdodC1zaGlmdC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgY2xhaW1Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90aGUtY2xhaW0tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgY2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RoZS1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgdHdpbkJhbmtzQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdHdpbi1iYW5rcy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCB0d2luQmFua3NQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3R3aW4tYmFua3MtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHRyZXN0bGVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90cmVzdGxlLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHRyZXN0bGVQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RyZXN0bGUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGJsYWNrb3V0UmlkZ2VDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ibGFja291dC1yaWRnZS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBibGFja291dFJpZGdlUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ibGFja291dC1yaWRnZS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFpcmdyb3VuZENvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2ZhaXJncm91bmQtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFpcmdyb3VuZFBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZmFpcmdyb3VuZC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZHVzdEZsYXRzQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHVzdC1mbGF0cy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkdXN0RmxhdHNQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2R1c3QtZmxhdHMtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlZXB3YXRlckNsYWltQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlZXB3YXRlckNsYWltUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZWVwd2F0ZXItY2xhaW0tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGdsb3dNZXNhQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGdsb3dNZXNhUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9nbG93LW1lc2EtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHJlbGF5VmFsbGV5Q29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHJlbGF5VmFsbGV5UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1hcmVDbGFpbUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL21hcmUtY2xhaW0tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFyU2lkZUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Zhci1zaWRlLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1hcmVDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZG9tZUJhc2luQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZG9tZS1iYXNpbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkb21lQmFzaW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RvbWUtYmFzaW4tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGVtYmVyU2hvcmVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lbWJlci1zaG9yZS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBlbWJlclNob3JlUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lbWJlci1zaG9yZS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgYXJjaGl2ZVdvcmxkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYXJjaGl2ZS13b3JsZC10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBhcmNoaXZlV29ybGRQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2FyY2hpdmUtd29ybGQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGJvbmV5YXJkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYm9uZXlhcmQtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgYm9uZXlhcmRQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2JvbmV5YXJkLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBjYW55b25Xb3Jrc0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Nhbnlvbi13b3Jrcy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBjYW55b25Xb3Jrc1Bhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvY2FueW9uLXdvcmtzLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkZXZpbHNBbGxleUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Rldmlscy1hbGxleS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkZXZpbHNBbGxleVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGV2aWxzLWFsbGV5LXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBlY2hvQ2FueW9uQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZWNob0NhbnlvblBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGd1c2hlckNvdW50eUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2d1c2hlci1jb3VudHktdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZ3VzaGVyQ291bnR5UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ndXNoZXItY291bnR5LXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCByZWxheVJ1c2hDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS1ydXNoLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlYWRCYW5kQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVhZC1iYW5kLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHBpY25pY0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3BpY25pYy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBoYWxmTGlmZUhvbGxvd0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgaGFsZkxpZmVIb2xsb3dQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGluY2xpbmVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9pbmNsaW5lLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGluY2xpbmVQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2luY2xpbmUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvbmdSb2FkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbG9uZy1yb2FkLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvbmdSb2FkUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb25nLXJvYWQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvd09yYml0Q29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbG93LW9yYml0LXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvd09yYml0UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb3ctb3JiaXQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1vdGhTZWFzb25Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBtb3RoU2Vhc29uUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgb2xkQ2FuYWxDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9vbGQtY2FuYWwtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgb2xkQ2FuYWxQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL29sZC1jYW5hbC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcHJlc3N1cmVHYXJkZW5Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9wcmVzc3VyZS1nYXJkZW4tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcHJlc3N1cmVHYXJkZW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3ByZXNzdXJlLWdhcmRlbi1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcmVnYXR0YUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlZ2F0dGEtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcmVnYXR0YVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVnYXR0YS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgc2VlZFJ1bkNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3NlZWQtcnVuLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHNlZWRSdW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3NlZWQtcnVuLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBzaG93cm9vbUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3Nob3dyb29tLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHNob3dyb29tUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgeyBwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcyB9IGZyb20gJy4uL2dhbWUvUGVyZm9ybWFuY2VUaWVyJztcbmltcG9ydCB7IHJlcG9ydFJlbmRlckRlbW90aW9uIH0gZnJvbSAnLi4vdGVsZW1ldHJ5L3J1bkJlYWNvbic7XG5pbXBvcnQgeyBpc01hcEJlYXV0eURpc2FibGVkLCBpc1Bvb2xHcmFkZURpc2FibGVkIH0gZnJvbSAnLi4vY29yZS9EZWJ1Z1BhcmFtcyc7XG5pbXBvcnQgeyBSZW5kZXJMYXllcnMgfSBmcm9tICcuLi9jb3JlL1JlbmRlckxheWVycyc7XG5pbXBvcnQgeyBmYXJHcm91bmRQcm9iZU1vZGUsIGhvcml6b25BcHJvblByb2ZpbGUsIHBhaW50RmFyR3JvdW5kUHJvYmUsIHBhaW50SG9yaXpvbkFwcm9uIH0gZnJvbSAnLi9Ib3Jpem9uQXByb24nO1xuaW1wb3J0IHsgbGVkZ2VyU3VuU2hhZG93RGlyZWN0aW9uIH0gZnJvbSAnLi9MaWdodFJpZyc7XG5pbXBvcnQgeyBCYWxhbmNlIH0gZnJvbSAnLi4vZ2FtZS9CYWxhbmNlJztcbmltcG9ydCB0eXBlIHsgTGlnaHRGaWVsZFNuYXBzaG90LCBMaWdodFNvdXJjZSB9IGZyb20gJy4uL3N5c3RlbXMvTGlnaHRGaWVsZCc7XG5pbXBvcnQgeyBkaXNwb3NlT2JqZWN0M0QgfSBmcm9tICcuLi91dGlscy9kaXNwb3NlJztcbmltcG9ydCB7IHRyYWNrZWRHbHRmTG9hZGVyIH0gZnJvbSAnLi4vYXNzZXRzL0Fzc2V0TG9hZGluZyc7XG5pbXBvcnQgKiBhcyBUZXJyYWluIGZyb20gJy4vVGVycmFpbic7XG5pbXBvcnQgeyBjcmVhdGVTY3VscHRXYXRlciwgdHlwZSBTY3VscHRXYXRlciB9IGZyb20gJy4vV2F0ZXInO1xuaW1wb3J0IHsgY3JlYXRlU3VuTW90ZXMsIHR5cGUgU3VuTW90ZXMgfSBmcm9tICcuL1N1bk1vdGVzJztcbmltcG9ydCB7IGNyZWF0ZVN0ZWFtUGx1bWUsIHR5cGUgU3RlYW1QbHVtZSB9IGZyb20gJy4vU3RlYW1QbHVtZSc7XG5pbXBvcnQgeyBjcmVhdGVIYXVsU3RlYW0sIHR5cGUgSGF1bFN0ZWFtLCB0eXBlIEhhdWxWZW50IH0gZnJvbSAnLi9IYXVsU3RlYW0nO1xuaW1wb3J0IHsgaW5zdGFsbFZpc3VhbEhlaWdodFNvdXJjZSwgd2F0ZXJTb3VyY2VzIH0gZnJvbSAnLi9UZXJyYWluJztcbmltcG9ydCB7IGNyZWF0ZUxhbmRtYXJrV2Fsa1N1cmZhY2VzLCB0eXBlIExhbmRtYXJrV2Fsa1N1cmZhY2UgfSBmcm9tICcuL0xhbmRtYXJrV2Fsa1N1cmZhY2VzJztcbmltcG9ydCB7IGNyZWF0ZVNwcmluZ1BvbmRTdXJmYWNlLCB0eXBlIFNwcmluZ1BvbmRTdXJmYWNlIH0gZnJvbSAnLi9XYXRlcic7XG5pbXBvcnQgeyBjcmVhdGVGb3JkU2hlZXQsIGNyZWF0ZVdhdGVyQ29uZmx1ZW5jZSwgY3JlYXRlV2F0ZXJSaWJib24sIHVwZGF0ZVdhdGVyTWF0ZXJpYWwgfSBmcm9tICcuL1dhdGVyJztcbmltcG9ydCB0eXBlIHsgQ29udHJhY3RNYW5pZmVzdCB9IGZyb20gJy4uL21ldGEvQ29udHJhY3RGYW1pbGllcyc7XG5cbmltcG9ydCBsYXN0Q2xhaW1Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sYXN0LWNsYWltLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxhc3RDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbGFzdC1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcml2ZXJDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yaXZlci10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCByaXZlclBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvcml2ZXItcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuXG50eXBlIE1vdG9yR3JvdW5kVHJ1dGggPSBQaWNrPENvbnRyYWN0TWFuaWZlc3RbJ3RpbGVQYXJhbXMnXSwgJ2RpbWVuc2lvbnMnIHwgJ3JvYWRDb3JyaWRvcnMnIHwgJ3RhclNlYW1zJyB8ICdvcmJpdFNwYXduJz47XG50eXBlIFBhaW50Um91dGVQb2ludCA9IHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfTtcbnR5cGUgUGFpbnRab25lID0geyBtaW5YOiBudW1iZXI7IG1heFg6IG51bWJlcjsgbWluWjogbnVtYmVyOyBtYXhaOiBudW1iZXIgfTtcblxudHlwZSBDb250cmFjdCA9IHtcbiAgdGlsZUlkOiBzdHJpbmc7XG4gIHZlcnRpY2VzOiBudW1iZXI7XG4gIHRyaWFuZ2xlczogbnVtYmVyO1xuICBtZXNoQ291bnQ6IG51bWJlcjtcbiAgbWF0ZXJpYWxDb3VudDogbnVtYmVyO1xuICBib3VuZHNNZXRlcnM6IHsgbWluOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07IG1heDogW251bWJlciwgbnVtYmVyLCBudW1iZXJdIH07XG4gIHBhbm9yYW1hTW91bnQ6IE1vdW50O1xuICBsYW5kbWFya01vdW50cz86IExhbmRtYXJrTW91bnRbXTtcbiAgbWFza1RydXRoPzogTW90b3JHcm91bmRUcnV0aCAmIHtcbiAgICBjYW5hbFJvdXRlPzogeyBwb2ludHM6IFBhaW50Um91dGVQb2ludFtdIH07XG4gICAgaW5oZXJpdGVkQ2FuYWxSb3V0ZT86IHsgcG9pbnRzOiBQYWludFJvdXRlUG9pbnRbXSB9O1xuICAgIGNhcmF2YW5Sb3V0ZT86IFBhaW50Um91dGVQb2ludFtdO1xuICAgIHBlcm1hbmVudEdyZWVuV2F5cG9pbnRab25lcz86IFBhaW50Wm9uZVtdO1xuICAgIHdhdGVyTWFzaz86IHsgaWQ6IHN0cmluZzsgcmVnaW9uczogTWFza1JlZ2lvbltdIH07XG4gIH07XG4gIG1hc2tBZ3JlZW1lbnQ/OiB7IHdhdGVyUGxhbmVZPzogbnVtYmVyIH07XG4gIHdhdGVyU3VyZmFjZT86IHsgb3duZXI6IHN0cmluZzsgaW5jbHVkZWRJblRlcnJhaW5HTEI6IGJvb2xlYW4gfTtcbn07XG50eXBlIE1hc2tSZWdpb24gPSB7XG4gIGlkOiBzdHJpbmc7XG4gIGtpbmQ6IHN0cmluZztcbiAgem9uZTogc3RyaW5nO1xuICBoYWxmV2lkdGg/OiBudW1iZXI7XG4gIHBvaW50cz86IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfT47XG4gIG1pblg/OiBudW1iZXI7XG4gIG1heFg/OiBudW1iZXI7XG4gIG1pblo/OiBudW1iZXI7XG4gIG1heFo/OiBudW1iZXI7XG59O1xudHlwZSBQYW5vcmFtYUNvbnRyYWN0ID0gUGljazxDb250cmFjdCwgJ3ZlcnRpY2VzJyB8ICd0cmlhbmdsZXMnIHwgJ21lc2hDb3VudCcgfCAnbWF0ZXJpYWxDb3VudCc+ICYgeyByZW5kZXJPbmx5OiBib29sZWFuOyBwcm9qZWN0aW9uPzogeyBza3lSaW5nUmFkaXVzTWV0ZXJzPzogbnVtYmVyIH0gfTtcbnR5cGUgTW91bnQgPSB7XG4gIGlkOiBzdHJpbmc7XG4gIHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIHJvdGF0aW9uOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIHNjYWxlOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIHJlbmRlck9ubHk6IGJvb2xlYW47XG59O1xudHlwZSBMYW5kbWFya01vdW50ID0gT21pdDxNb3VudCwgJ3JlbmRlck9ubHknPiAmIHsgYXNzZXQ/OiBzdHJpbmc7IGNvbnRyYWN0SWRzPzogc3RyaW5nW107IHdhbGtTdXJmYWNlcz86IExhbmRtYXJrV2Fsa1N1cmZhY2VbXSB9O1xudHlwZSBFbnRyeSA9IHsgdGVycmFpblVybDogc3RyaW5nOyBwYW5vcmFtYVVybDogc3RyaW5nOyBjb250cmFjdDogQ29udHJhY3Q7IHBhbm9yYW1hQ29udHJhY3Q6IFBhbm9yYW1hQ29udHJhY3Q7IGRldGFpbFRleHR1cmVVcmw/OiBzdHJpbmcgfTtcbnR5cGUgSG9zdCA9IHtcbiAgc2NlbmU6IFRIUkVFLlNjZW5lO1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBjb250cmFjdElkOiBzdHJpbmc7XG4gIHRpbGVJZDogc3RyaW5nO1xuICBwYWludGVkR3JvdW5kPzogVEhSRUUuT2JqZWN0M0Q7XG4gIG5pZ2h0TW9kZT86IGJvb2xlYW47XG4gIG5pZ2h0TGlnaHRpbmc/OiAoKSA9PiBMaWdodEZpZWxkU25hcHNob3Q7XG4gIC8qKiBUcnVlIHdoaWxlIGEgcG9zdC1zZWN1cmUgXCJTdGF5IGZvciB0aGUgUnVzaFwiIHJ1biBpcyBsaXZlIChSdW5NYW5hZ2VyIG93bnMgaXQpLiAqL1xuICBydXNoQWN0aXZlPzogKCkgPT4gYm9vbGVhbjtcbiAgLyoqIFB1Ymxpc2hlZCBwcmVzc3VyZSBkaWFnbm9zdGljOyByZW5kZXItb25seSBjb25zdW1lcnMgbmV2ZXIgd3JpdGUgaXQuICovXG4gIGhvdEJvaWxlcnM/OiAoKSA9PiBudW1iZXI7XG4gIC8qKlxuICAgKiBUaGUgbGl2ZSBNUS00IHJ1bnRpbWUgdmVyZGljdCAoMCA9IGhlYWx0aHksIHJpc2luZyBhcyB0aGUgcDk1IHdhdGNoZG9nIGRlZ3JhZGVzKS4gUmVhZC1vbmx5LFxuICAgKiBwb2xsZWQg4oCUIHRoZSBwaWxvdCdzIGRlY29yYXRpb25zIHJlZ2lzdGVyIHRoZW1zZWx2ZXMgaW4gdGhlIHNoZWQgb3JkZXIgdGhyb3VnaCB0aGlzIGFuZCBkcm9wXG4gICAqIG91dCBmaXJzdCwgYmVmb3JlIGFueXRoaW5nIHRoZSBwbGF5ZXIgaXMgYWltaW5nIGF0LlxuICAgKi9cbiAgZGV0YWlsQnVkZ2V0PzogKCkgPT4gbnVtYmVyO1xuICAvKiogUmVhZC1vbmx5IGVzY29ydGVkLWNhcnQgdmlldyBmb3IgcmVuZGVyLXNpZGUgaGF1bCBzdGVhbS4gKi9cbiAgaGF1bENhcnQ/OiAoKSA9PiB7IHg6IG51bWJlcjsgejogbnVtYmVyOyBtb3Zpbmc6IGJvb2xlYW4gfSB8IHVuZGVmaW5lZDtcbiAgYXJjaGl2ZVJlc3RvcmF0aW9uPzogKCkgPT4gQXJjaGl2ZVJlc3RvcmF0aW9uU3RhdGUgfCBudWxsO1xuICBvblZpc3VhbEhlaWdodFNvdXJjZUluc3RhbGxlZD86ICgpID0+IHZvaWQ7XG59O1xudHlwZSBNZXRyaWNzID0geyBtZXNoZXM6IG51bWJlcjsgdHJpYW5nbGVzOiBudW1iZXI7IG1hdGVyaWFsczogbnVtYmVyOyB2ZXJ0aWNlczogbnVtYmVyOyBib3VuZHM6IFRIUkVFLkJveDMgfTtcbnR5cGUgSGlkZGVuUmVsaWVmID0geyBvYmplY3Q6IFRIUkVFLk9iamVjdDNEOyB2aXNpYmxlOiBib29sZWFuIH07XG5cbmNvbnN0IGVudHJ5ID0gKHRlcnJhaW5Vcmw6IHN0cmluZywgcGFub3JhbWFVcmw6IHN0cmluZywgY29udHJhY3RUZXh0OiBzdHJpbmcsIHBhbm9yYW1hQ29udHJhY3RUZXh0OiBzdHJpbmcsIGRyZXNzaW5nVGV4dD86IHN0cmluZywgZGV0YWlsVGV4dHVyZVVybD86IHN0cmluZyk6IEVudHJ5ID0+IHtcbiAgY29uc3QgY29udHJhY3QgPSBKU09OLnBhcnNlKGNvbnRyYWN0VGV4dCkgYXMgQ29udHJhY3Q7XG4gIC8vIFZhcmlhbnQgZHJlc3Npbmcgc3VwcGxlbWVudHMgdGhlIGJhc2UgYm9kaWVzOyB0aGUgZXhpc3RpbmcgbW91bnQgZmlsdGVyIGFuZCB0cmFuc2Zvcm1zIGFwcGx5LlxuICBpZiAoZHJlc3NpbmdUZXh0KSBjb250cmFjdC5sYW5kbWFya01vdW50cyA9IFsuLi4oY29udHJhY3QubGFuZG1hcmtNb3VudHMgPz8gW10pLCAuLi4oKEpTT04ucGFyc2UoZHJlc3NpbmdUZXh0KSBhcyBDb250cmFjdCkubGFuZG1hcmtNb3VudHMgPz8gW10pXTtcbiAgcmV0dXJuIHsgdGVycmFpblVybCwgcGFub3JhbWFVcmwsIGNvbnRyYWN0LCBwYW5vcmFtYUNvbnRyYWN0OiBKU09OLnBhcnNlKHBhbm9yYW1hQ29udHJhY3RUZXh0KSBhcyBQYW5vcmFtYUNvbnRyYWN0LCBkZXRhaWxUZXh0dXJlVXJsIH07XG59O1xuY29uc3QgUkVHSVNUUlk6IFJlY29yZDxzdHJpbmcsIEVudHJ5PiA9IHtcbiAgJ3RoZS1jbGFpbSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdGhlLWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RoZS1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGNsYWltQ29udHJhY3RUZXh0LCBjbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UxLWRyeS1ndWxjaCc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHJ5LWd1bGNoLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RyeS1ndWxjaC1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGRyeUd1bGNoQ29udHJhY3RUZXh0LCBkcnlHdWxjaFBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UxLXR3aW4tYmFua3MnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3R3aW4tYmFua3MtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdHdpbi1iYW5rcy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHR3aW5CYW5rc0NvbnRyYWN0VGV4dCwgdHdpbkJhbmtzUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEtbmlnaHQtc2hpZnQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL25pZ2h0LXNoaWZ0LXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL25pZ2h0LXNoaWZ0LXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmlnaHRTaGlmdENvbnRyYWN0VGV4dCwgbmlnaHRTaGlmdFBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UxLWJhcm9uJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9iYXJvbi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9iYXJvbi1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGJhcm9uQ29udHJhY3RUZXh0LCBiYXJvblBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgLi4uKF9fR1JfUkVMRUFTRV9FMV9fID8ge30gOiB7XG4gICdlMi1oaWxsLW1pbmUnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hpbGwtbWluZS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9oaWxsLW1pbmUtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBoaWxsTWluZUNvbnRyYWN0VGV4dCwgaGlsbE1pbmVQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlMi10cmVzdGxlJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90cmVzdGxlLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RyZXN0bGUtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCB0cmVzdGxlQ29udHJhY3RUZXh0LCB0cmVzdGxlUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTMtYmxhY2tvdXQtcmlkZ2UnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2JsYWNrb3V0LXJpZGdlLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2JsYWNrb3V0LXJpZGdlLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgYmxhY2tvdXRSaWRnZUNvbnRyYWN0VGV4dCwgYmxhY2tvdXRSaWRnZVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UzLWZhaXJncm91bmQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2ZhaXJncm91bmQtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZmFpcmdyb3VuZC1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGZhaXJncm91bmRDb250cmFjdFRleHQsIGZhaXJncm91bmRQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNC1kdXN0LWZsYXRzJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kdXN0LWZsYXRzLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2R1c3QtZmxhdHMtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBkdXN0RmxhdHNDb250cmFjdFRleHQsIGR1c3RGbGF0c1Bhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U1LWRlZXB3YXRlci1jbGFpbSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RlZXB3YXRlci1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGRlZXB3YXRlckNsYWltQ29udHJhY3RUZXh0LCBkZWVwd2F0ZXJDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U2LWdsb3ctbWVzYSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2dsb3ctbWVzYS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGdsb3dNZXNhQ29udHJhY3RUZXh0LCBnbG93TWVzYVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U3LXJlbGF5LXZhbGxleSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlbGF5LXZhbGxleS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHJlbGF5VmFsbGV5Q29udHJhY3RUZXh0LCByZWxheVZhbGxleVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U4LW1hcmUtY2xhaW0nOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL21hcmUtY2xhaW0tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG1hcmVDbGFpbUNvbnRyYWN0VGV4dCwgbWFyZUNsYWltUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTktZG9tZS1iYXNpbic6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZG9tZS1iYXNpbi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kb21lLWJhc2luLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZG9tZUJhc2luQ29udHJhY3RUZXh0LCBkb21lQmFzaW5QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlMTAtZW1iZXItc2hvcmUnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2VtYmVyLXNob3JlLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2VtYmVyLXNob3JlLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZW1iZXJTaG9yZUNvbnRyYWN0VGV4dCwgZW1iZXJTaG9yZVBhbm9yYW1hQ29udHJhY3RUZXh0LCB1bmRlZmluZWQsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvc291cmNlcy9lbWJlci1zaG9yZS1maWRlbGl0eS0xL2VuZ3JhdmVkLWJhc2FsdC5wbmcnLCBpbXBvcnQubWV0YS51cmwpLmhyZWYpLFxuICAnZTItcHJlc3N1cmUtZ2FyZGVuJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9wcmVzc3VyZS1nYXJkZW4tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcHJlc3N1cmUtZ2FyZGVuLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgcHJlc3N1cmVHYXJkZW5Db250cmFjdFRleHQsIHByZXNzdXJlR2FyZGVuUGFub3JhbWFDb250cmFjdFRleHQsIHVuZGVmaW5lZCwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zb3VyY2VzL2UyLXByZXNzdXJlLWdhcmRlbi1maWRlbGl0eS0yL2VuZ3JhdmVkLXJpdmVyLWdyYXZlbC5wbmcnLCBpbXBvcnQubWV0YS51cmwpLmhyZWYpLFxuICAnZTItaW5jbGluZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaW5jbGluZS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9pbmNsaW5lLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgaW5jbGluZUNvbnRyYWN0VGV4dCwgaW5jbGluZVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UzLWNhbnlvbi13b3Jrcyc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvY2FueW9uLXdvcmtzLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Nhbnlvbi13b3Jrcy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGNhbnlvbldvcmtzQ29udHJhY3RUZXh0LCBjYW55b25Xb3Jrc1Bhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UzLW1vdGgtc2Vhc29uJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG1vdGhTZWFzb25Db250cmFjdFRleHQsIG1vdGhTZWFzb25QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNC1sb25nLXJvYWQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2xvbmctcm9hZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb25nLXJvYWQtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBsb25nUm9hZENvbnRyYWN0VGV4dCwgbG9uZ1JvYWRQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNC1ndXNoZXItY291bnR5JzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ndXNoZXItY291bnR5LXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2d1c2hlci1jb3VudHktcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBndXNoZXJDb3VudHlDb250cmFjdFRleHQsIGd1c2hlckNvdW50eVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U0LWJvbmV5YXJkJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ib25leWFyZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ib25leWFyZC1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGJvbmV5YXJkQ29udHJhY3RUZXh0LCBib25leWFyZFBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U1LXJlZ2F0dGEnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlZ2F0dGEtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVnYXR0YS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHJlZ2F0dGFDb250cmFjdFRleHQsIHJlZ2F0dGFQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gIC8vIERlZXB3YXRlciBDbGFpbSBhbGlhc2VzOiB0aGVzZSBjYW1wYWlnbiB2YXJpYW50cyBpbnRlbnRpb25hbGx5IHJldXNlIGl0cyB0ZXJyYWluIGFuZCBwYW5vcmFtYS5cbiAgJ2U1LXN0aWxsd2F0ZXInOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RlZXB3YXRlci1jbGFpbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZWVwd2F0ZXItY2xhaW0tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBkZWVwd2F0ZXJDbGFpbUNvbnRyYWN0VGV4dCwgZGVlcHdhdGVyQ2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNS1mbG90aWxsYSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RlZXB3YXRlci1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGRlZXB3YXRlckNsYWltQ29udHJhY3RUZXh0LCBkZWVwd2F0ZXJDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U2LXNob3dyb29tJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHNob3dyb29tQ29udHJhY3RUZXh0LCBzaG93cm9vbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U2LWhhbGYtbGlmZS1ob2xsb3cnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaGFsZi1saWZlLWhvbGxvdy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGhhbGZMaWZlSG9sbG93Q29udHJhY3RUZXh0LCBoYWxmTGlmZUhvbGxvd1Bhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgLy8gUGljbmljIHJldGFpbnMgdGhlIEdsb3cgTWVzYSBzY3VscHQgYW5kIGNvbGxpc2lvbi1iYWNrZWQgYm9kaWVzLCBhZGRpbmcgaXRzIG5vbmJsb2NraW5nIGRyZXNzaW5nLlxuICAnZTYtcGljbmljJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9nbG93LW1lc2EtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZ2xvd01lc2FDb250cmFjdFRleHQsIGdsb3dNZXNhUGFub3JhbWFDb250cmFjdFRleHQsIHBpY25pY0NvbnRyYWN0VGV4dCwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zb3VyY2VzL2U2LXBpY25pYy1maWRlbGl0eS0yL3BpY25pYy1ncm91bmQtY2xlYW4ucG5nJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmKSxcbiAgJ2U3LWVjaG8tY2FueW9uJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lY2hvLWNhbnlvbi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lY2hvLWNhbnlvbi1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGVjaG9DYW55b25Db250cmFjdFRleHQsIGVjaG9DYW55b25QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gIC8vIFJlbGF5IFZhbGxleSBhbGlhc2VzOiBib3RoIHNpZ25hbCB2YXJpYW50cyByZXVzZSBpdHMgdGVycmFpbiBhbmQgcGFub3JhbWEuXG4gICdlNy1kZWFkLWJhbmQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlbGF5LXZhbGxleS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCByZWxheVZhbGxleUNvbnRyYWN0VGV4dCwgcmVsYXlWYWxsZXlQYW5vcmFtYUNvbnRyYWN0VGV4dCwgZGVhZEJhbmRDb250cmFjdFRleHQpLFxuICAnZTctcmVsYXktcnVzaCc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlbGF5LXZhbGxleS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHJlbGF5VmFsbGV5Q29udHJhY3RUZXh0LCByZWxheVZhbGxleVBhbm9yYW1hQ29udHJhY3RUZXh0LCByZWxheVJ1c2hDb250cmFjdFRleHQpLFxuICAvLyBNYXJlIENsYWltIGFsaWFzZXM6IEZhciBTaWRlIGFuZCBFY2xpcHNlIGNoYW5nZSBjYW1wYWlnbiBydWxlcyB3aXRob3V0IGNoYW5naW5nIHRoZSBzY3VscHQuXG4gICdlOC1mYXItc2lkZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tYXJlLWNsYWltLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbWFyZUNsYWltQ29udHJhY3RUZXh0LCBtYXJlQ2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCwgZmFyU2lkZUNvbnRyYWN0VGV4dCksXG4gICdlOC1sb3ctb3JiaXQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2xvdy1vcmJpdC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb3ctb3JiaXQtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBKU09OLnN0cmluZ2lmeSh7IC4uLkpTT04ucGFyc2UobG93T3JiaXRDb250cmFjdFRleHQpLCBib3VuZHNNZXRlcnM6IHsgbWluOiBbLTY0LCAtNjQsIC01Ljg2OTY4OV0sIG1heDogWzY0LCA2NCwgMS4wOF0gfSB9KSwgbG93T3JiaXRQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlOC1lY2xpcHNlJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tYXJlLWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL21hcmUtY2xhaW0tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBtYXJlQ2xhaW1Db250cmFjdFRleHQsIG1hcmVDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U5LXNlZWQtcnVuJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zZWVkLXJ1bi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zZWVkLXJ1bi1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIEpTT04uc3RyaW5naWZ5KHsgLi4uSlNPTi5wYXJzZShzZWVkUnVuQ29udHJhY3RUZXh0KSwgYm91bmRzTWV0ZXJzOiB7IG1pbjogWy02NCwgLTY0LCAtMC4xNF0sIG1heDogWzY0LCA2NCwgMy43MTUxNDJdIH0gfSksIHNlZWRSdW5QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlOS1kZXZpbHMtYWxsZXknOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Rldmlscy1hbGxleS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZXZpbHMtYWxsZXktcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBKU09OLnN0cmluZ2lmeSh7IC4uLkpTT04ucGFyc2UoZGV2aWxzQWxsZXlDb250cmFjdFRleHQpLCBib3VuZHNNZXRlcnM6IHsgbWluOiBbLTY0LCAtNjQsIC0wLjE0XSwgbWF4OiBbNjQsIDY0LCA0LjU2NzExNV0gfSB9KSwgZGV2aWxzQWxsZXlQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlOS1vbGQtY2FuYWwnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL29sZC1jYW5hbC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9vbGQtY2FuYWwtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBKU09OLnN0cmluZ2lmeSh7IC4uLkpTT04ucGFyc2Uob2xkQ2FuYWxDb250cmFjdFRleHQpLCBib3VuZHNNZXRlcnM6IHsgbWluOiBbLTY0LCAtNjQsIC0xLjQyXSwgbWF4OiBbNjQsIDY0LCAyLjkwNjMxN10gfSB9KSwgb2xkQ2FuYWxQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlMTAtYXJjaGl2ZS13b3JsZCc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYXJjaGl2ZS13b3JsZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9hcmNoaXZlLXdvcmxkLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgYXJjaGl2ZVdvcmxkQ29udHJhY3RUZXh0LCBhcmNoaXZlV29ybGRQYW5vcmFtYUNvbnRyYWN0VGV4dCwgdW5kZWZpbmVkLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3NvdXJjZXMvYXJjaGl2ZS13b3JsZC1maWRlbGl0eS0xL2VuZ3JhdmVkLW1hc29ucnkucG5nJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmKSxcbiAgJ2UxMC1sYXN0LWNsYWltJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sYXN0LWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2xhc3QtY2xhaW0tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBsYXN0Q2xhaW1Db250cmFjdFRleHQsIGxhc3RDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UxMC1yaXZlcic6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvcml2ZXItdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvcml2ZXItcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCByaXZlckNvbnRyYWN0VGV4dCwgcml2ZXJQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gIH0pLFxufTtcbmNvbnN0IExBTkRNQVJLX0FTU0VUUyA9IGltcG9ydC5tZXRhLmdsb2IoW1xuICAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sYW5kbWFya3MvKiovKi5nbGInLFxuICAvLyBTaGFyZSB0aGUgdG93biB2YXJpYW50IHBhdHRlcm4gc28gdGhlIEUxIHJlbGVhc2UgcGx1Z2luIG5hcnJvd3MgYm90aCBjb25zdW1lcnMuXG4gICcuLi8uLi9hc3NldHMvcGlsb3RzLyotM2QvKi5lKi5nbGInLFxuXSwgeyBxdWVyeTogJz91cmwnLCBpbXBvcnQ6ICdkZWZhdWx0JyB9KSBhcyBSZWNvcmQ8c3RyaW5nLCAoKSA9PiBQcm9taXNlPHN0cmluZz4+O1xuXG5mdW5jdGlvbiBsYW5kbWFya0Fzc2V0S2V5KGFzc2V0OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYXNzZXQuc3RhcnRzV2l0aCgnYXNzZXRzLycpID8gYC4uLy4uLyR7YXNzZXR9YCA6IGAuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlLyR7YXNzZXR9YDtcbn1cblxuZnVuY3Rpb24gbGFuZG1hcmtNb3VudHNGb3IoY29udHJhY3Q6IENvbnRyYWN0LCBjb250cmFjdElkOiBzdHJpbmcpOiBMYW5kbWFya01vdW50W10ge1xuICByZXR1cm4gKGNvbnRyYWN0LmxhbmRtYXJrTW91bnRzID8/IFtdKS5maWx0ZXIobW91bnQgPT4gbW91bnQuYXNzZXQgJiYgKCFtb3VudC5jb250cmFjdElkcyB8fCBtb3VudC5jb250cmFjdElkcy5pbmNsdWRlcyhjb250cmFjdElkKSkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29udHJhY3RQcmVmZXRjaFVybHMoY29udHJhY3RJZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBjb25zdCBzZWxlY3RlZCA9IFJFR0lTVFJZW2NvbnRyYWN0SWRdO1xuICBpZiAoIXNlbGVjdGVkKSByZXR1cm4gW107XG4gIGNvbnN0IGxhbmRtYXJrcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGxhbmRtYXJrTW91bnRzRm9yKHNlbGVjdGVkLmNvbnRyYWN0LCBjb250cmFjdElkKVxuICAgICAgLmZsYXRNYXAoKHsgYXNzZXQgfSkgPT4gYXNzZXQgPyBbTEFORE1BUktfQVNTRVRTW2xhbmRtYXJrQXNzZXRLZXkoYXNzZXQpXV0gOiBbXSlcbiAgICAgIC5maWx0ZXIoKHJlc29sdmVVcmwpOiByZXNvbHZlVXJsIGlzICgpID0+IFByb21pc2U8c3RyaW5nPiA9PiAhIXJlc29sdmVVcmwpXG4gICAgICAubWFwKChyZXNvbHZlVXJsKSA9PiByZXNvbHZlVXJsKCkuY2F0Y2goKCkgPT4gJycpKSxcbiAgKTtcbiAgcmV0dXJuIFsuLi5uZXcgU2V0KFtzZWxlY3RlZC50ZXJyYWluVXJsLCBzZWxlY3RlZC5wYW5vcmFtYVVybCwgLi4ubGFuZG1hcmtzLmZpbHRlcihCb29sZWFuKV0pXTtcbn1cblxuLy8gUkVOREVSLU9OTFkgTElWSU5HIFdBVEVSIE9WRVIgQSBTQ1VMUFRFRCBDSEFOTkVMIChkb2NzL2JlYXV0eS9lMS10d2luLWJhbmtzLWJyaWVmLm1kIFUxKS5cbi8vXG4vLyBUaGUgYnJhaWQncyB0d28gY2hhbm5lbHMgYXJlIGN1dCBpbnRvIHRoZSBtb3VudGVkIHNjdWxwdCBidXQgcGFpbnRlZCBuZWFyLWJsYWNrLCBiZWNhdXNlIHRoZVxuLy8gcGlsb3QgaGlkZXMgZXZlcnkgbGVnYWN5IGxpdmluZy13YXRlciBzdXJmYWNlIChMRUdBQ1lfR1JPVU5EX1NMT1RTIGJlbG93KS4gVGhpcyB0YWJsZSBuYW1lcyB0aGVcbi8vIGNvbnRyYWN0cyB3aG9zZSBzY3VscHQgY2FycmllcyBwb2x5bGluZSBjaGFubmVscyB3b3J0aCBkcmVzc2luZywgYW5kIGhvdyBlYWNoIGNoYW5uZWwgcmVhZHMuXG4vLyBUaGUgR0VPTUVUUlkgaXMgbmV2ZXIgYXV0aG9yZWQgaGVyZSDigJQgaXQgaXMgcmVhZCBmcm9tIHRoZSBjb250cmFjdCdzIG93biBtYXNrIHBvbHlsaW5lcywgdGhlXG4vLyBzYW1lIHRhYmxlIGBidWlsZF90d2luX2JhbmtzX2JyYWlkLnB5YCBjdXQgdGhlIHJlbGllZiBmcm9tLCBzbyB0aGUgd2F0ZXIgY2FuIG9ubHkgZXZlciBzaXQgd2hlcmVcbi8vIHRoZSBzY3VscHQgaXMgYWxyZWFkeSBiZWxvdyB0aGUgd2F0ZXIgcGxhbmUuIEFkb3B0aW5nIHRoYXQgbWFzayBhcyBTSU0gdHJ1dGggaXMgYSBzZXBhcmF0ZSxcbi8vIG93bmVyLWdhdGVkIGRlY2lzaW9uIChGLU9QNS0xKTogbm90aGluZyBoZXJlIHRvdWNoZXMgYmFuZCBjbGFzc2lmaWNhdGlvbiwgZm9yZHMgb3IgY3Jvc3NpbmdzLlxudHlwZSBDaGFubmVsRHJlc3NpbmcgPSB7XG4gIGRlcHRoOiAnZGVlcCcgfCAnc2hhbGxvdyc7XG4gIGdsaW50cz86IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfT47XG4gIGhlYWRJbnNldDogbnVtYmVyO1xuICB0YWlsSW5zZXQ6IG51bWJlcjtcbiAgaGVhZEZhZGU6IG51bWJlcjtcbiAgdGFpbEZhZGU6IG51bWJlcjtcbn07XG5jb25zdCBDT05UUkFDVF9DSEFOTkVMX1dBVEVSOiBSZWNvcmQ8c3RyaW5nLCB7XG4gIHN1cmZhY2VMaWZ0OiBudW1iZXI7XG4gIGVkZ2VCbGVlZDogbnVtYmVyO1xuICBiZWQ6IHsgZGVlcE1ldGVyczogbnVtYmVyOyBzaG9yZU1ldGVyczogbnVtYmVyIH07XG4gIGNvbmZsdWVuY2VzOiBBcnJheTx7IHBvaW50czogQXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlcjsgaGFsZldpZHRoOiBudW1iZXI7IGFscGhhOiBudW1iZXIgfT4gfT47XG4gIGZvcmREZXB0aD86IG51bWJlcjtcbiAgY2hhbm5lbHM6IFJlY29yZDxzdHJpbmcsIENoYW5uZWxEcmVzc2luZz47XG59PiA9IHtcbiAgJ2UxLXR3aW4tYmFua3MnOiB7XG4gICAgc3VyZmFjZUxpZnQ6IDAuMDEyLFxuICAgIC8vIEdlb21ldHJ5LW9ubHkgb3ZlcmRyYXc6IHRoZSBzcGxpbmUgY2FuIHNpdCAwLjIxIG0gaW5zaWRlIHRoZSBwaWVjZXdpc2UtbGluZWFyIGN1dCBhdCBhXG4gICAgLy8gY29ybmVyLiBUaGUgc2N1bHB0J3MgZGVwdGggYnVmZmVyIHN0aWxsIGNsaXBzIHRoZSB2aXNpYmxlIHNob3JlbGluZSB0byB0aGUgMS41IG0gbWFzay5cbiAgICBlZGdlQmxlZWQ6IDAuNDUsXG4gICAgYmVkOiB7IGRlZXBNZXRlcnM6IDAuNTIsIHNob3JlTWV0ZXJzOiAwLjAzNSB9LFxuICAgIGNvbmZsdWVuY2VzOiBbXG4gICAgICB7IHBvaW50czogW1xuICAgICAgICB7IHg6IC0zNCwgejogMCwgaGFsZldpZHRoOiAxLjksIGFscGhhOiAwIH0sXG4gICAgICAgIHsgeDogLTMyLCB6OiAwLCBoYWxmV2lkdGg6IDEuNzUsIGFscGhhOiAwLjU4IH0sXG4gICAgICAgIHsgeDogLTMwLjUsIHo6IDAsIGhhbGZXaWR0aDogMS42LCBhbHBoYTogMSB9LFxuICAgICAgICB7IHg6IC0yOCwgejogMCwgaGFsZldpZHRoOiAxLjUsIGFscGhhOiAxIH0sXG4gICAgICAgIHsgeDogLTI2LjUsIHo6IDAsIGhhbGZXaWR0aDogMS44NSwgYWxwaGE6IDEgfSxcbiAgICAgICAgeyB4OiAtMjUuMiwgejogMCwgaGFsZldpZHRoOiAyLjI1LCBhbHBoYTogMC42MiB9LFxuICAgICAgICB7IHg6IC0yMy44LCB6OiAwLCBoYWxmV2lkdGg6IDIuNSwgYWxwaGE6IDAgfSxcbiAgICAgIF0gfSxcbiAgICAgIHsgcG9pbnRzOiBbXG4gICAgICAgIHsgeDogMjMuOCwgejogMCwgaGFsZldpZHRoOiAyLjUsIGFscGhhOiAwIH0sXG4gICAgICAgIHsgeDogMjUuMiwgejogMCwgaGFsZldpZHRoOiAyLjI1LCBhbHBoYTogMC42MiB9LFxuICAgICAgICB7IHg6IDI2LjUsIHo6IDAsIGhhbGZXaWR0aDogMS44NSwgYWxwaGE6IDEgfSxcbiAgICAgICAgeyB4OiAyOCwgejogMCwgaGFsZldpZHRoOiAxLjUsIGFscGhhOiAxIH0sXG4gICAgICAgIHsgeDogMzAuNSwgejogMCwgaGFsZldpZHRoOiAxLjYsIGFscGhhOiAxIH0sXG4gICAgICAgIHsgeDogMzIsIHo6IDAsIGhhbGZXaWR0aDogMS43NSwgYWxwaGE6IDAuNTggfSxcbiAgICAgICAgeyB4OiAzNCwgejogMCwgaGFsZldpZHRoOiAxLjksIGFscGhhOiAwIH0sXG4gICAgICBdIH0sXG4gICAgXSxcbiAgICAvLyBGb3JkIGRlcHRoIGFzIGEgZnJhY3Rpb24gb2YgdGhlIHdhZGUuLmRlZXAgcmFtcDogYSBwYW4gYSBoZXJvIHdhbGtzIHRocm91Z2gsIG5vdCBhIGNoYW5uZWwuXG4gICAgZm9yZERlcHRoOiAwLjA2LFxuICAgIGNoYW5uZWxzOiB7XG4gICAgICAvLyBOb3J0aCBydW5zIGRlZXAgYW5kIGZhc3Qg4oCUIHRoZSBnb2xkIHJpZGVzIGl0LCBhbmQgb25seSBpdDogYW4gYXN5bW1ldHJpYyBzcGFya2xlIGlzIGhvd1xuICAgICAgLy8gYSBwbGF5ZXIgbGVhcm5zIHdoaWNoIGNoYW5uZWwgaXMgdGhlIGRhbmdlcm91cyBvbmUgd2l0aG91dCBhIGxpbmUgb2YgVUkuIEFuY2hvcnMgc2l0IE9OXG4gICAgICAvLyB0aGUgbWFzayBjZW50cmVsaW5lICh0aGUgc2hhZGVyIGRyYXdzIGVhY2ggZ2xpbnQgYXMgYSB0aGluIGxpbmUgYXQgdGhlIGFuY2hvcidzIHosIHNvIGFuXG4gICAgICAvLyBhbmNob3Igb2ZmIHRoZSBjZW50cmVsaW5lIGxpZ2h0cyB0aGUgYmFuayBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50KS5cbiAgICAgICdub3J0aC1jaGFubmVsJzoge1xuICAgICAgICBkZXB0aDogJ2RlZXAnLFxuICAgICAgICBnbGludHM6IFt7IHg6IC0xOS41LCB6OiAyLjQzIH0sIHsgeDogLTYuMiwgejogMi44OSB9LCB7IHg6IDguMSwgejogMy4xNiB9LCB7IHg6IDE5LjgsIHo6IDIuMzQgfV0sXG4gICAgICAgIGhlYWRJbnNldDogMi40LFxuICAgICAgICB0YWlsSW5zZXQ6IDIuNCxcbiAgICAgICAgaGVhZEZhZGU6IDIsXG4gICAgICAgIHRhaWxGYWRlOiAyLFxuICAgICAgfSxcbiAgICAgICdzb3V0aC1jaGFubmVsJzogeyBkZXB0aDogJ3NoYWxsb3cnLCBoZWFkSW5zZXQ6IDIuNCwgdGFpbEluc2V0OiAyLjQsIGhlYWRGYWRlOiAyLCB0YWlsRmFkZTogMiB9LFxuICAgIH0sXG4gIH0sXG59O1xuXG4vLyBUV08gSE9NRVNURUFEUywgVFdPIExJVkVTIOKAlCBSRU5ERVIgU0lERSAoZG9jcy9iZWF1dHkvZTEtdHdpbi1iYW5rcy1icmllZi5tZCBVNCkuXG4vLyBUaGUgbWFwJ3Mgc3RvcnkgaXMgb25lIGZhbWlseSBob2xkaW5nIGJvdGggYmFua3MsIGFuZCB0aGUgcGFpciBzaGlwcyBhcyB0aGUgc2FtZSBib2R5IHVuZGVyIGFcbi8vIDAuMDkgcmFkIHJvdGF0aW9uIGRpZmZlcmVuY2U6IGF0IHRoZSBydW4gY2FtZXJhLCBhbmQgd29yc2UgYXQgMzkwcHgsIG5vdGhpbmcgdGVsbHMgYSBwbGF5ZXJcbi8vIHdoaWNoIGJhbmsgdGhleSBhcmUgc3RhbmRpbmcgb24uIFRoZSBib2RpZXMgdGhlbXNlbHZlcyBjb3VsZCBub3QgYmUgcmUtYXV0aG9yZWQgdG9uaWdodCDigJQgdGhlXG4vLyBsYW5kbWFyayBwYWNrIG5vIGxvbmdlciByZWdlbmVyYXRlcyBmYWl0aGZ1bGx5IChzZWUgdGhlIHJldmlldydzIFU0IGVudHJ5KSDigJQgc28gdGhlIGRpZmZlcmVuY2Vcbi8vIGlzIGh1bmcgb24gdGhlIE1PVU5UIGluc3RlYWQ6IHRoZSBzb3V0aCByb29mICh0aGUgc3Rha2Ugc2lkZSwgdGhlIGxvc3MgY29uZGl0aW9uKSBpcyBncmFkZWRcbi8vIHdhcm0gYW5kIGNhcnJpZXMgYSBsYW1wbGl0IHBhbmU7IHRoZSBub3J0aCBvdXRwb3N0IGFjcm9zcyB0aGUgYnJhaWQgaXMgZ3JhZGVkIGNvb2wgYW5kIHN0YXlzXG4vLyBkYXJrLiBTYW1lIGlkcywgc2FtZSBib2RpZXMsIHNhbWUgZm9vdHByaW50cyDigJQgdGhlIHNpbSBuZXZlciBzZWVzIHRoaXMuXG50eXBlIExhbmRtYXJrRHJlc3NpbmcgPSB7IGVtaXNzaXZlOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl07IGxhbXA/OiB7IGFjcm9zc1g6IG51bWJlcjsgdXBZOiBudW1iZXI7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0gfTtcbmNvbnN0IENPTlRSQUNUX0xBTkRNQVJLX0RSRVNTSU5HOiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBMYW5kbWFya0RyZXNzaW5nPj4gPSB7XG4gICdlMS10d2luLWJhbmtzJzoge1xuICAgIHNvdXRoX2JhbmtfaG9tZXN0ZWFkOiB7IGVtaXNzaXZlOiBbMS4xNCwgMC45OSwgMC43NF0sIGxhbXA6IHsgYWNyb3NzWDogMC42OCwgdXBZOiAwLjU2LCB3aWR0aDogMC44MiwgaGVpZ2h0OiAwLjYyIH0gfSxcbiAgICBzb3V0aF9iYW5rX3dpbmNoOiB7IGVtaXNzaXZlOiBbMS4xMCwgMC45NywgMC44MF0gfSxcbiAgICBub3J0aF9iYW5rX2hvbWVzdGVhZDogeyBlbWlzc2l2ZTogWzAuNzgsIDAuODgsIDEuMDJdIH0sXG4gICAgbm9ydGhfYmFua193aW5jaDogeyBlbWlzc2l2ZTogWzAuODAsIDAuODksIDEuMDJdIH0sXG4gIH0sXG59O1xuLy8gU2F0dXJhdGVkIG9uIHB1cnBvc2U6IEFDRVMgdG9uZSBtYXBwaW5nIHdhbGtzIGEgYnJpZ2h0IHVubGl0IHBhbmUgdG93YXJkIHdoaXRlLCBhbmQgYSBsYW1wXG4vLyB0aGF0IHJlYWRzIHdoaXRlIHJlYWRzIGFzIGEgaG9sZSBpbiB0aGUgd2FsbC5cbmNvbnN0IExBTVBfQ09MT1VSID0gJyNmZjljMzgnO1xuXG5jb25zdCBCT1VORFNfRVBTSUxPTiA9IDAuMDM7XG5jb25zdCBDT05USU5VQVRJT05fU0FNUExFX0RFUFRIID0gODtcbmNvbnN0IExFR0FDWV9HUk9VTkRfU0xPVFMgPSBuZXcgU2V0KFsndGVycmFpbi5iYW5rJywgJ3RlcnJhaW4ucml2ZXInLCAndGVycmFpbi5mb3JkJ10pO1xuY29uc3QgTklHSFRfUE9PTF9TSEFERVJfQ0FQID0gMzI7XG5cbi8vIFUxLCB0aGUtY2xhaW0gYmVhdXR5IHNoaWZ0IChkb2NzL2JlYXV0eS90aGUtY2xhaW0tYnJpZWYubWQpOiB0aGUgc2N1bHB0IGNhcnZlcyBhXG4vLyBjaGFubmVsIGFuZCB0aGVuIGhpZGVzIGV2ZXJ5IHBhaW50ZWQgd2F0ZXIgc3VyZmFjZSwgc28gdGhlIG1hcCdzIG9uZSBldmVudCBoYXNcbi8vIGJlZW4gYSBzdGF0aWMgYmxhY2sgc2xvdC4gVGhlc2UgY29udHJhY3RzIGdldCBhIHJlbmRlci1vbmx5IGxpdmluZy13YXRlciBxdWFkIGxhaWRcbi8vIGludG8gdGhhdCBjaGFubmVsLiBQZXIgY29udHJhY3QgYmVjYXVzZSBlYWNoIHNjdWxwdCdzIGJlZCBzaXRzIGF0IGl0cyBvd24gZGVwdGguXG4vL1xuLy8gZTItaGlsbC1taW5lIGpvaW5zIGF0IHRoZSBFMiBiZWF1dHkgc2hpZnQgKGRvY3MvYmVhdXR5L2UyLWhpbGwtbWluZS1icmllZi5tZCBVMSk6IGl0cyBmbG9vZGVkXG4vLyBnYWxsZXJ5IGlzIHRoZSBzYW1lIGRpc2Vhc2Ugd2l0aCBhIGRpZmZlcmVudCBiZWQuIEV2ZXJ5dGhpbmcgYmVsb3cgaXMgRFJFU1NJTkcg4oCUIHRoZSBzdXJmYWNlJ3Ncbi8vIGhlaWdodCBpcyBzdGlsbCBtZWFzdXJlZCBvZmYgdGhlIGJha2VkIHNjdWxwdCBhbmQgdGhlIGZvcmQvcml2ZXIgd2lkdGhzIHN0aWxsIGNvbWUgZnJvbSB0aGVcbi8vIHNpbSdzIG93biBkZWNsYXJhdGlvbnMsIHNvIGEgcmUtc2N1bHB0IG9yIGEgcnVsZXMgY2hhbmdlIG1vdmVzIHRoZSB3YXRlciBhbmQgbm90aGluZyBoZXJlXG4vLyBhcmd1ZXMgd2l0aCBpdC5cbnR5cGUgU2N1bHB0V2F0ZXJEcmVzc2luZyA9IHtcbiAgc3VyZmFjZTpcbiAgICB8IHsga2luZDogJ2NoYW5uZWwtZmlsbCc7IGZpbGw6IG51bWJlciB9XG4gICAgfCB7IGtpbmQ6ICdiZWxvdy1nb3JnZS1mbG9vcic7IHF1YW50aWxlOiBudW1iZXI7IGRyb3A6IG51bWJlciB9XG4gICAgfCB7IGtpbmQ6ICdzZWEtbGV2ZWwnOyB5OiBudW1iZXIgfTtcbiAgLyoqXG4gICAqIE11bHRpcGxpZXMgdGhlIHNoYWRlcidzIHdhdGVyIHBhbGV0dGUgKHNoYWxsb3cvbWlkL2RlZXAvZm9yZCwgZm9hbSBhbmQgZ2xpbnRzIGFsaWtlKS4gV2hpdGVcbiAgICoga2VlcHMgdGhlIHNoaXBwZWQgbWludC4gVGhlIGNsYWltIHB1bGxzIGl0IHdhcm0gc2VwaWE7IHRoZSBoaWxsIG1pbmUgcHVsbHMgaXQgdG93YXJkIHdldCBzbGF0ZVxuICAgKiBzbyB0aGUgRTIgZmFtaWx5J3MgXCJtdXJreSB3b3JraW5nIHdhdGVyXCIgcmVhZHMgYXMgd29ya2VkLCBub3QgYXMgYSBtb3VudGFpbiBzdHJlYW0uXG4gICAqL1xuICBjb2xvcjogc3RyaW5nO1xuICBvcGFjaXR5OiBudW1iZXI7XG4gIC8qKiBIb3cgbXVjaCB3YXRlciBzdGFuZHMgb3ZlciB0aGUgZm9yZCBzaGVsZjogYW5rbGUgZGVlcCwgc3RpbGwgb2J2aW91c2x5IGEgY3Jvc3NpbmcuICovXG4gIGZvcmRTa2ltOiBudW1iZXI7XG4gIC8qKiBNZXRyZXMgb2Ygc3RhbmRpbmcgd2F0ZXIgdGhhdCByZWFkIGFzIGZ1bGx5IGRlZXAgaW4gdGhlIGJlZC1kZXB0aCBiYWtlLiAqL1xuICBkZWVwTWV0ZXJzOiBudW1iZXI7XG4gIC8qKiBNZXRyZXMgb2YgdGhlIGxhc3QsIHNoYWxsb3dlc3Qgd2F0ZXIg4oCUIHRoZSBkYW1wIG1hcmdpbiB0aGUgc3VyZmFjZSBmYWRlcyBvdXQgYWNyb3NzLiAqL1xuICBzaG9yZU1ldGVyczogbnVtYmVyO1xuICAvKipcbiAgICogSGFsZiB3aWR0aCBvZiB0aGUgd2F0ZXIgcXVhZCBpbiBaLiBEZWZhdWx0cyB0byB0aGUgdGlsZSdzIGRlY2xhcmVkIHZpc3VhbCB3YXRlciBoYWxmIHdpZHRoO1xuICAgKiBhIG1hcCB3aG9zZSBwYWludGVkIGJlZCBpcyBuYXJyb3dlciB0aGFuIHRoYXQgZGVjbGFyYXRpb24gb3ZlcnJpZGVzIGl0LCBvciB0aGUgc3VyZmFjZSBmbG9vZHNcbiAgICogZ3JvdW5kIHRoZSBhdGxhcyBwYWludHMgZHJ5LlxuICAgKi9cbiAgdmlzdWFsSGFsZldpZHRoPzogbnVtYmVyO1xuICAvKipcbiAgICogV2hlcmUgdGhlIHN1biBjYXRjaGVzIHRoZSBzdXJmYWNlLiBgaGFydmVzdGAgcHV0cyBvbmUgb24gZWFjaCBoYXJ2ZXN0IGFuY2hvcidzIG5lYXIgYmFuayAodGhlXG4gICAqIGNsYWltJ3Mgc2x1aWNlIGxpbmUpOyBleHBsaWNpdCBsaXN0cyB1c2Ugd29ybGQgWCBhbmQgWiBvZmZzZXRzIGZyb20gdGhlIHJpdmVyIGNlbnRlci5cbiAgICovXG4gIGdsaW50czogJ2hhcnZlc3QnIHwgQXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlciB9PjtcbiAgcmlwcGxlU3RyZW5ndGg/OiBudW1iZXI7XG4gIHJpcHBsZVNjYWxlPzogbnVtYmVyO1xuICBkZXB0aENvbnRyYXN0PzogbnVtYmVyO1xuICAvKiogQmxlbmQgd2VpZ2h0IGZvciB0aGUgcHJvY2VkdXJhbCBjYW52YXMgbWFwLiBTZWUgdGhlIG5vdGUgb24gdGhlIGhpbGwgbWluZSdzIGVudHJ5LiAqL1xuICB0ZXh0dXJlQmxlbmQ/OiBudW1iZXI7XG4gIC8qKiBTa2lwIHRoZSBiYWtlZCBiZWQgbWFwIHdoZW4gdGhlIGF1dGhvcmVkIGJlZCBpcyBhIGZsYXQgcGFuLiAqL1xuICBiZWQ/OiBib29sZWFuO1xuICBmb3JkVGludD86IG51bWJlcjtcbiAgc2hvcmVGYWRlTWV0ZXJzPzogbnVtYmVyO1xuICBzdXJmYWNlTGlmdD86IGJvb2xlYW47XG4gIG92ZXJoYW5nTWV0ZXJzPzogbnVtYmVyO1xuICBlbWlzc2l2ZT86IHN0cmluZztcbiAgLyoqIEZvYW0gY29sbGFycyB3aGVyZSBsYW5kbWFyayBwaWVycyBtZWV0IHRoZSBzdXJmYWNlLiAqL1xuICBjb2xsYXJzPzogUmVhZG9ubHlBcnJheTx7IG1vdW50OiBzdHJpbmc7IHJhZGl1czogbnVtYmVyIH0+O1xufTtcbmNvbnN0IFNDVUxQVF9XQVRFUl9EUkVTU0lORzogUmVjb3JkPHN0cmluZywgU2N1bHB0V2F0ZXJEcmVzc2luZz4gPSB7XG4gIC8vIEtlZXAgdGhlIG1lYXN1cmVkIGRhcmsgY2hhbm5lbCBhbmQgZm9yZCBzaGVsZjsgY29vbCB3YXRlciBzZXBhcmF0ZXMgZnJvbSB0aGUgd2FybSBiYW5rcy5cbiAgLy8gVGhlIENsYWltIGNvbmNlcHQgY29tcGFyaXNvbiBpcyByZWNvcmRlZCBpbiBhcnRpZmFjdHMvbWFwLWFydC1yZXBhaXJzLTIwMjYwOTA4L2NsYWltLXdhdGVyLTAxLy5cbiAgJ3RoZS1jbGFpbSc6IHtcbiAgICBzdXJmYWNlOiB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnLCBmaWxsOiAwLjQyIH0sXG4gICAgY29sb3I6ICcjOTliZWM3JyxcbiAgICBlbWlzc2l2ZTogJyMxMDI3MmMnLFxuICAgIG9wYWNpdHk6IDAuOCxcbiAgICAvLyBUaGUgY2FydmVkIGNoYW5uZWwgcnVucyB+MC40NW0gYmVsb3cgdGhlIHdhdGVyIGxpbmUgYXQgaXRzIGRlZXBlc3Q7IHRoZSBsYXN0XG4gICAgLy8gfjE1Y20gb2YgZGVwdGggaXMgdGhlIGRhbXAgbWFyZ2luIHdoZXJlIHRoZSBzdXJmYWNlIGZhZGVzIGludG8gd2V0IGdyb3VuZC5cbiAgICBmb3JkU2tpbTogMC4xMSxcbiAgICBkZWVwTWV0ZXJzOiAwLjUsXG4gICAgc2hvcmVNZXRlcnM6IDAuMTUsXG4gICAgZ2xpbnRzOiAnaGFydmVzdCcsXG4gIH0sXG4gIC8vIE5pZ2h0IFNoaWZ0J3MgY2hhbm5lbCB1c2VkIG9ubHkgaXRzIGRhcmsgYmVkIHBhaW50LiBLZWVwIHRoZSBzY3VscHQgYW5kIHRoZVxuICAvLyBkZWNsYXJlZCBmb3JkOyBhIHJlc3RyYWluZWQsIHN1bi1saXQgc3VyZmFjZSBzdXBwbGllcyBtb3Zpbmcgd2F0ZXIgZGV0YWlsLlxuICAvLyBObyBlbWlzc2lvbjogdGhlIHVubGl0IHJpdmVyIG11c3Qgc3RpbGwgYmVjb21lIGRhcmsgZHVyaW5nIHRoZSBuaWdodCBwaGFzZS5cbiAgJ2UxLW5pZ2h0LXNoaWZ0Jzoge1xuICAgIHN1cmZhY2U6IHsga2luZDogJ2NoYW5uZWwtZmlsbCcsIGZpbGw6IDAuNDIgfSwgY29sb3I6ICcjODk5YjliJywgb3BhY2l0eTogMC42NCxcbiAgICBmb3JkU2tpbTogMC4wOCwgZGVlcE1ldGVyczogMC41LCBzaG9yZU1ldGVyczogMC4xNSxcbiAgICBnbGludHM6IFtdLCByaXBwbGVTdHJlbmd0aDogMC4zMiwgdGV4dHVyZUJsZW5kOiAwLjA2LCBmb3JkVGludDogMC4zLFxuICB9LFxuICAvLyBUaGUgc2N1bHB0IGhpZGVzIGxlZ2FjeSB3YXRlci4gVGhpcyBpcyB0aGUgb25lIHZpc2libGUgc3VyZmFjZSwgY29udGFpbmVkXG4gIC8vIGJ5IHRoZSBleGlzdGluZyBiZWQgYW5kIGZvcmQsIHdpdGggbm8gZXh0cmEgbGlnaHQgb3Igc2ltdWxhdGlvbiBhdXRob3JpdHkuXG4gICdlMS1iYXJvbic6IHtcbiAgICBzdXJmYWNlOiB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnLCBmaWxsOiAwLjQyIH0sIGNvbG9yOiAnIzg0OWRhMScsIG9wYWNpdHk6IDAuNjIsXG4gICAgZm9yZFNraW06IDAuMDYsIGRlZXBNZXRlcnM6IDAuNSwgc2hvcmVNZXRlcnM6IDAuMTUsIHZpc3VhbEhhbGZXaWR0aDogNi4yNSxcbiAgICBnbGludHM6IFtdLCByaXBwbGVTdHJlbmd0aDogMC42LCB0ZXh0dXJlQmxlbmQ6IDAuMDcsIGZvcmRUaW50OiAwLjM1LFxuICB9LFxuICAvLyBUSEUgRkxPT0RFRCBHQUxMRVJZLiBNZWFzdXJlZCwgbm90IGd1ZXNzZWQgKGxvZ3Mvc2Vzc2lvbi1zY3JhdGNoL2UyLWhpbGwtbWluZS1iYW5kLXNjYW4ubWpzKTpcbiAgLy8gdGhlIGF0bGFzIHBhaW50cyB0aGUgYmVkIG5lYXItYmxhY2sgYWNyb3NzIEVYQUNUTFkgdGhlIHNpbSdzIGRlY2xhcmVkIHJpdmVyIGJhbmQg4oCUIGx1bWEgMTYtMjZcbiAgLy8gZm9yIHogaW4gWy01LjUsIDUuNV0gYWdhaW5zdCA0OS03NyBvbiB0aGUgb2NocmUgZWl0aGVyIHNpZGUg4oCUIG92ZXIgYSBmbG9vciB0aGF0IGlzIGRlYWQgZmxhdCBhdFxuICAvLyB5IC0wLjE4IHdpdGggbGlwcyBhdCB8enwgfiA2ICgtMC4wNjIgc291dGgsICswLjA1NyBub3J0aCkuIFRocmVlIGNvbnNlcXVlbmNlczpcbiAgLy8gICAqIHRoZSBmaWxsL3NraW0gcGFpciBsYW5kcyB0aGUgc3VyZmFjZSBhdCAtMC4wNzAsIGkuZS4gVU5ERVIgYm90aCBsaXBzLCBzbyB0aGUgd2F0ZXIgaXNcbiAgLy8gICAgIGNvbnRhaW5lZCBieSB0aGUgY3V0IGluc3RlYWQgb2Ygc3BpbGxpbmcgb250byB0aGUgbG93ZXIgc291dGggYmVuY2ggKHdoaWNoIGlzIDAuNCBtIEJFTE9XXG4gIC8vICAgICB0aGUgZ2FsbGVyeSBmbG9vciBhbmQgcGFpbnRlZCBkcnkg4oCUIGEgZmxhdCBxdWFkIHdvdWxkIGhhdmUgZmxvb2RlZCBpdCBpbnZpc2libHkpO1xuICAvLyAgICogdGhlIHF1YWQgaXMgbmFycm93ZWQgdG8gdGhlIHBhaW50ZWQgYmFuZC4gVGhlIHRpbGUgZGVjbGFyZXMgYSB2aXN1YWwgaGFsZiB3aWR0aCBvZiAxMCwgYW5kXG4gIC8vICAgICB3YXRlciBvdXQgdG8gfHp8ID0gMTAgd291bGQgc2l0IG9uIGxpdCBvY2hyZSBncm91bmQ7XG4gIC8vICAgKiB0aGUgYmVkIGlzIGZsYXQsIHNvIERFUFRIIGNhbm5vdCBjb21lIGZyb20gdGhlIGJha2UgdGhlIHdheSBpdCBkb2VzIG9uIHRoZSBjbGFpbS4gSXQgY29tZXNcbiAgLy8gICAgIGZyb20gdGhlIG5lYXItYmxhY2sgcGFpbnQgcmVhZGluZyB0aHJvdWdoIGEgc3VyZmFjZSB0aGF0IGlzIGRlbGliZXJhdGVseSBub3QgdmVyeSBvcGFxdWUg4oCUXG4gIC8vICAgICB3aGljaCBpcyB3aGF0IFwibXVya3kgd29ya2luZyB3YXRlclwiIGlzLCBhbmQgd2h5IGRlZXBNZXRlcnMgaXMgMC4xMiAodGhlIHJlYWwgc3RhbmRpbmdcbiAgLy8gICAgIGRlcHRoKSByYXRoZXIgdGhhbiB0aGUgY2xhaW0ncyAwLjUuXG4gICdlMi1oaWxsLW1pbmUnOiB7IHN1cmZhY2U6IHsga2luZDogJ2NoYW5uZWwtZmlsbCcsIGZpbGw6IDAuNDIgfSwgY29sb3I6ICcjOGE4MTc3Jywgb3BhY2l0eTogMC43MiwgZm9yZFNraW06IDAuMTEsIGRlZXBNZXRlcnM6IDAuMTIsIHNob3JlTWV0ZXJzOiAwLjA1LCB2aXN1YWxIYWxmV2lkdGg6IDUuOSwgZ2xpbnRzOiBbeyB4OiAtMjcsIHo6IC01LjEgfSwgeyB4OiAxMywgejogNS4xIH0sIHsgeDogMzMsIHo6IC01LjEgfV0sIHJpcHBsZVN0cmVuZ3RoOiAxLjE1LCB0ZXh0dXJlQmxlbmQ6IDAsIH0sXG4gICdlMi10cmVzdGxlJzogeyBzdXJmYWNlOiB7IGtpbmQ6ICdiZWxvdy1nb3JnZS1mbG9vcicsIHF1YW50aWxlOiAwLjgsIGRyb3A6IDAuMDA2IH0sIGNvbG9yOiAnIzdlODQ4MCcsIG9wYWNpdHk6IDAuODYsIGZvcmRTa2ltOiAwLjExLCBkZWVwTWV0ZXJzOiAwLjQyLCBzaG9yZU1ldGVyczogMC4xNiwgZ2xpbnRzOiBbeyB4OiAtMTUuNSwgejogLTQuMyB9LCB7IHg6IC00LjUsIHo6IC00LjUgfV0sIHJpcHBsZVN0cmVuZ3RoOiAwLjQsIHRleHR1cmVCbGVuZDogMC4wNSwgfSxcbiAgJ2UyLXByZXNzdXJlLWdhcmRlbic6IHsgc3VyZmFjZTogeyBraW5kOiAnY2hhbm5lbC1maWxsJywgZmlsbDogMC4xMSB9LCBjb2xvcjogJyNhMmM4ZDknLCBvcGFjaXR5OiAwLjk5LCBmb3JkU2tpbTogMC4xMSwgZGVlcE1ldGVyczogMC41LCBzaG9yZU1ldGVyczogMC4xNSwgYmVkOiBmYWxzZSwgdmlzdWFsSGFsZldpZHRoOiA2LjI1LCBnbGludHM6IFt7IHg6IC0zMCwgejogNC40NSB9LCB7IHg6IC0xMiwgejogNC40NSB9LCB7IHg6IDEyLCB6OiA0LjQ1IH0sIHsgeDogMzAsIHo6IDQuNDUgfV0sIHJpcHBsZVN0cmVuZ3RoOiAwLjQsIHJpcHBsZVNjYWxlOiAxLjYsIGRlcHRoQ29udHJhc3Q6IDAuMzUsIHRleHR1cmVCbGVuZDogMCwgZm9yZFRpbnQ6IDAuMjUsIHNob3JlRmFkZU1ldGVyczogMSwgc3VyZmFjZUxpZnQ6IHRydWUsIG92ZXJoYW5nTWV0ZXJzOiAxMCwgY29sbGFyczogW3sgbW91bnQ6ICdnYXJkZW4tcHJlc3N1cmUtbWFuaWZvbGQnLCByYWRpdXM6IDIuOSB9LCB7IG1vdW50OiAnd2F0ZXItYmFuZC1wdW1wLXN0YXRpb24nLCByYWRpdXM6IDIuNiB9XSwgfSxcbiAgJ2UyLWluY2xpbmUnOiB7IHN1cmZhY2U6IHsga2luZDogJ2NoYW5uZWwtZmlsbCcsIGZpbGw6IDAuNDIgfSwgY29sb3I6ICcjYmI5MzY2Jywgb3BhY2l0eTogMC42MiwgZm9yZFNraW06IDAuMTI1LCBkZWVwTWV0ZXJzOiAwLjE0NSwgc2hvcmVNZXRlcnM6IDAuMDcsIHZpc3VhbEhhbGZXaWR0aDogNi4yNSwgZ2xpbnRzOiBbeyB4OiAtMzAsIHo6IDQuNDUgfSwgeyB4OiAzMCwgejogLTQuNDUgfV0sIHJpcHBsZVN0cmVuZ3RoOiAwLjYsIHRleHR1cmVCbGVuZDogMC4yLCB9LFxufTtcbi8qKiBUaGUgRTUgY29udHJhY3RzIHJlc2VydmUgdGhlaXIgc2VhIGZvciBydW50aW1lOyB0aGUgc2N1bHB0IHN1cHBsaWVzIHRoZSB2aXNpYmxlIGJlZC4gKi9cbmNvbnN0IERFRVBXQVRFUl9TRUFfRFJFU1NJTkc6IFNjdWxwdFdhdGVyRHJlc3NpbmcgPSB7XG4gIHN1cmZhY2U6IHsga2luZDogJ3NlYS1sZXZlbCcsIHk6IDAgfSwgY29sb3I6ICcjOTliZWM3Jywgb3BhY2l0eTogMC41NixcbiAgZm9yZFNraW06IDAsIGRlZXBNZXRlcnM6IDgsIHNob3JlTWV0ZXJzOiAwLjUsIGdsaW50czogW10sXG4gIHJpcHBsZVN0cmVuZ3RoOiAwLjE1LCB0ZXh0dXJlQmxlbmQ6IDAuMTAsIGZvcmRUaW50OiAwLCBzaG9yZUZhZGVNZXRlcnM6IDQsIHN1cmZhY2VMaWZ0OiBmYWxzZSxcbiAgZW1pc3NpdmU6ICcjMGEyYTMzJyxcbn07XG4vKiogV2F0ZXIgZmFkZXMgb3V0IG92ZXIgdGhlIGxhc3Qgc3RyZXRjaCBiZWZvcmUgdGhlIHRpbGUgZWRnZSBpbnN0ZWFkIG9mIGN1dHRpbmcuICovXG5jb25zdCBTQ1VMUFRfV0FURVJfRURHRV9GQURFID0gNztcbi8qKiBVMzogY29udHJhY3RzIHdob3NlIG1vdW50ZWQgbGFuZG1hcmtzIGdldCBzb2Z0IGNvbnRhY3QgZWxsaXBzZXMuICovXG5jb25zdCBMQU5ETUFSS19DT05UQUNUX0NPTlRSQUNUUyA9IG5ldyBTZXQoWyd0aGUtY2xhaW0nLCAnZTItaGlsbC1taW5lJywgJ2UyLXRyZXN0bGUnLCAnZTItcHJlc3N1cmUtZ2FyZGVuJywgJ2UyLWluY2xpbmUnXSk7XG50eXBlIFNwYW5TaGFkb3dEcmVzc2luZyA9IHsgbW91bnRJZDogc3RyaW5nOyB3aWR0aFNjYWxlOiBudW1iZXI7IGxlbmd0aFNjYWxlOiBudW1iZXI7IHRocm93OiBudW1iZXI7IG9wYWNpdHk6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9O1xuY29uc3QgU1BBTl9TSEFET1dfQ09OVFJBQ1RTOiBSZWNvcmQ8c3RyaW5nLCBTcGFuU2hhZG93RHJlc3Npbmc+ID0ge1xuICAnZTItdHJlc3RsZSc6IHsgbW91bnRJZDogJ3RyZXN0bGUtY3Jvc3NpbmcnLCB3aWR0aFNjYWxlOiAwLjM4LCBsZW5ndGhTY2FsZTogMC40OCwgdGhyb3c6IDAuNjIsIG9wYWNpdHk6IDAuNDIsIGNvbG9yOiAnIzFkMTIwNicgfSxcbn07XG5jb25zdCBTUEFOX1NIQURPV19ST1dTID0gMjg7XG5jb25zdCBTUEFOX1NIQURPV19FTkRfVEFQRVIgPSAwLjE2O1xuY29uc3QgU1BBTl9TSEFET1dfTElGVCA9IDAuMDEyO1xuLyoqXG4gKiBVNTogY29udHJhY3RzIHRoYXQgZ2V0IHRoZSBkcmlmdGluZyBtb3RlIGZpZWxkLCBhbmQgaXRzIGhhcmQgY2FwLlxuICpcbiAqIFRJTlQsIERPTidUIENPVU5ULUNVVC4gVGhlIGNsYWltJ3Mgc2hpZnQgcmVjb3JkZWQgdGhhdCBpdHMgb3duIG1vdGVzIGZpcnN0IHJlYWQgYXMgc25vdyBvdmVyIHRoZVxuICogZGFyayB3YXRlciwgYW5kIHRoYXQgdGhlIGZpeCB3YXMgdGhlIGNvbG91ciByYXRoZXIgdGhhbiB0aGUgbnVtYmVyIOKAlCBhIHRoaW5uZXIgZmllbGQgb2YgdGhlIHdyb25nXG4gKiBjb2xvdXIgc3RpbGwgcmVhZHMgYXMgdGhlIHdyb25nIHdlYXRoZXIuIFNvIHRoZSBoaWxsIG1pbmUga2VlcHMgdGhlIGNsYWltJ3MgY2FwIGFuZCB0YWtlcyBpdHNcbiAqIGFpciBmcm9tIHRoZSBlcmEgaW5zdGVhZDogdGhpcyBpcyBjb2FsIGNvdW50cnksIGFuZCB3aGF0IGhhbmdzIGluIGl0cyBsb3cgc3VuIGlzIHVtYmVyIHNvb3QsIG5vdFxuICogZ29sZCBkdXN0LiBUaGUgYm94IGlzIHRoZSBtYXAncyBvd24gd29ya2luZyBncm91bmQgKHRoZSBnYWxsZXJ5IGFuZCB0aGUgYmFzZSBiZW5jaCksIG5vdCBhIGNvcHlcbiAqIG9mIHRoZSBjbGFpbSdzIHJpdmVyIGJveC5cbiAqL1xudHlwZSBTdW5Nb3RlRHJlc3NpbmcgPSB7IGNvbG9yOiBzdHJpbmc7IGhhbGZaOiBudW1iZXI7IGNlbnRlclo6IG51bWJlcjsgbWluWTogbnVtYmVyOyBtYXhZOiBudW1iZXI7IHNpemU6IG51bWJlcjsgc2VlZDogbnVtYmVyOyBoYWxmWFNjYWxlPzogbnVtYmVyIH07XG5jb25zdCBTVU5fTU9URVM6IFJlY29yZDxzdHJpbmcsIFN1bk1vdGVEcmVzc2luZz4gPSB7XG4gICd0aGUtY2xhaW0nOiB7IGNvbG9yOiAnI2ZmZDlhMicsIGhhbGZaOiAxMywgY2VudGVyWjogNCwgbWluWTogMC40LCBtYXhZOiA1LjAsIHNpemU6IDIuMSwgc2VlZDogMHgxYzFhIH0sXG4gICdlMi1oaWxsLW1pbmUnOiB7IGNvbG9yOiAnI2E4Nzk0YScsIGhhbGZaOiAxNywgY2VudGVyWjogNywgbWluWTogMC4zLCBtYXhZOiA1LjYsIHNpemU6IDIuMywgc2VlZDogMHgyZTU3IH0sXG4gICdlMi10cmVzdGxlJzogeyBjb2xvcjogJyNjMzlhNjgnLCBoYWxmWjogMTQsIGNlbnRlclo6IDAsIG1pblk6IDAuMiwgbWF4WTogNS42LCBzaXplOiAyLjMsIHNlZWQ6IDB4M2IxMiB9LFxuICAnZTItcHJlc3N1cmUtZ2FyZGVuJzogeyBjb2xvcjogJyNjOWEyNzknLCBoYWxmWjogMTUsIGNlbnRlclo6IDMxLCBtaW5ZOiAwLjksIG1heFk6IDYuNCwgc2l6ZTogMi4zLCBzZWVkOiAweDJlMDcgfSxcbiAgJ2UyLWluY2xpbmUnOiB7IGNvbG9yOiAnI2UwYTg3OCcsIGhhbGZaOiAzMCwgY2VudGVyWjogMTIsIG1pblk6IDAuNSwgbWF4WTogNi40LCBzaXplOiAyLjIsIHNlZWQ6IDB4MmUxNSwgaGFsZlhTY2FsZTogMC43MiB9LFxufTtcbi8qKiBVNWIgaXMgdGhlIENMQUlNJ3MgcmV3YXJkIG5vdGUsIG5vdCBldmVyeSBtb3RlIG1hcCdzOiB0aGUgZW1iZXJzIG5lZWQgYSBjbGFpbSBzdGFrZSB0byBzaXQgb24uICovXG5jb25zdCBSVVNIX0VNQkVSX0NPTlRSQUNUUyA9IG5ldyBTZXQoWyd0aGUtY2xhaW0nXSk7XG5jb25zdCBTVU5fTU9URV9DQVAgPSAyMDA7XG5cbi8qKlxuICogVTQg4oCUIFRIRSBFUkEgQlJFQVRIRVMuIFN0ZWFtIGFuY2hvcmVkIHRvIHRoZSBtYXAncyBvd24gbmFtZWQgc3RlYW0gYm9kaWVzLlxuICpcbiAqIFBsYWNlbWVudCBpcyBleHByZXNzZWQgYXMgRlJBQ1RJT05TIG9mIHRoZSBtb3VudGVkIGJvZHkncyB3b3JsZCBib3VuZGluZyBib3gsIG5ldmVyIGFzIHdvcmxkXG4gKiBjb29yZGluYXRlcywgc28gdGhlIGVtaXR0ZXIgZm9sbG93cyB0aGUgYm9keSBpZiBhIG1vdW50IGV2ZXIgbW92ZXMgb3IgYSBwYWNrIGlzIHJlLXNjYWxlZCDigJQgdGhlXG4gKiBgZHJlc3NMYW5kbWFya2AgbGFtcCBwcmVjZWRlbnQsIGFuZCB0aGUgcmVhc29uIHRoZSBkcnktZ3VsY2ggc3ByaW5nJ3MgaGFyZC1jb2RlZCBwb29sIG51bWJlcnNcbiAqIG5lZWRlZCBhIHJlLW1lYXN1cmUgbm90ZS4gVGhlIGZyYWN0aW9ucyB0aGVtc2VsdmVzIGFyZSBtZWFzdXJlZCBvZmYgdGhlIHNoaXBwZWQgR0xCc1xuICogKGBsb2dzL3Nlc3Npb24tc2NyYXRjaC9oaWxsLW1pbmUtbGFuZG1hcmstYm94ZXMubWpzYCk6IHRoZSBib2lsZXIgaG91c2UncyB0YWxsZXN0IGNvbHVtbiBpcyBpdHNcbiAqIHN0YWNrLCBhdCBsb2NhbCB4IC0yLjAgLyB6IC0xLjI1IG9mIGEgYm9keSBzcGFubmluZyDCsTQuMDkgeCDCsTMuNzMsIGkuZS4gMC4yNTUgLyAwLjMzMiBhY3Jvc3MgaXRzXG4gKiBvd24gYm94OyB0aGUgbWluZSBtb3V0aCB2ZW50cyBhdCBpdHMgZm9vdCwgbm90IGl0cyBoZWFkZnJhbWUgdG9wLlxuICovXG50eXBlIFN0ZWFtQW5jaG9yID0ge1xuICBtb3VudDogc3RyaW5nO1xuICAvKiogMC4uMSBhY3Jvc3MgdGhlIGJvZHkncyBvd24gYm91bmRpbmcgYm94LiAqL1xuICBhY3Jvc3NYOiBudW1iZXI7XG4gIGFjcm9zc1o6IG51bWJlcjtcbiAgdXBZOiBudW1iZXI7XG4gIHJpc2U6IG51bWJlcjtcbiAgc3ByZWFkOiBudW1iZXI7XG4gIHNpemU6IG51bWJlcjtcbiAgbGlmZTogbnVtYmVyO1xuICBwdWZmczogbnVtYmVyO1xuICBvcGFjaXR5OiBudW1iZXI7XG59O1xuY29uc3QgU1RFQU1fQU5DSE9SUzogUmVjb3JkPHN0cmluZywgcmVhZG9ubHkgU3RlYW1BbmNob3JbXT4gPSB7XG4gICdlMi1oaWxsLW1pbmUnOiBbIHsgbW91bnQ6ICdib2lsZXItaG91c2Utc2l0ZScsIGFjcm9zc1g6IDAuMjU1LCBhY3Jvc3NaOiAwLjMzMiwgdXBZOiAxLjAsIHJpc2U6IDguMCwgc3ByZWFkOiAzLjAsIHNpemU6IDQ2LCBsaWZlOiA1LjQsIHB1ZmZzOiAzNCwgb3BhY2l0eTogMC41IH0sIHsgbW91bnQ6ICdtaW5lLW1vdXRoLWFuZC1ydWluZWQtaGVhZGZyYW1lJywgYWNyb3NzWDogMC41LCBhY3Jvc3NaOiAwLjYyLCB1cFk6IDAuMSwgcmlzZTogMy4yLCBzcHJlYWQ6IDEuNywgc2l6ZTogMzAsIGxpZmU6IDguMiwgcHVmZnM6IDE0LCBvcGFjaXR5OiAwLjMgfSwgXSxcbn07XG50eXBlIENyb3NzaW5nQnJlYXRoRHJlc3NpbmcgPSB7XG4gIHdpc3BzOiB7IGNvdW50OiBudW1iZXI7IGhhbGZYOiBudW1iZXI7IGhhbGZaOiBudW1iZXI7IGxpZnQ6IG51bWJlcjsgc2l6ZTogbnVtYmVyOyByaXNlOiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfTtcbiAgcGx1bWU6IHsgY291bnQ6IG51bWJlcjsgcmFkaXVzOiBudW1iZXI7IGhlaWdodDogbnVtYmVyOyBzaXplOiBudW1iZXI7IHJpc2U6IG51bWJlcjsgY29sb3I6IHN0cmluZyB9O1xufTtcbmNvbnN0IENST1NTSU5HX0JSRUFUSF9DT05UUkFDVFM6IFJlY29yZDxzdHJpbmcsIENyb3NzaW5nQnJlYXRoRHJlc3Npbmc+ID0ge1xuICAnZTItdHJlc3RsZSc6IHsgd2lzcHM6IHsgY291bnQ6IDcsIGhhbGZYOiAxNywgaGFsZlo6IDQsIGxpZnQ6IDMuMSwgc2l6ZTogNDYsIHJpc2U6IDAuMzQsIGNvbG9yOiAnIzU3NTA0OScgfSwgcGx1bWU6IHsgY291bnQ6IDEyLCByYWRpdXM6IDAuNywgaGVpZ2h0OiAzLjQsIHNpemU6IDI2LCByaXNlOiAxLjE1LCBjb2xvcjogJyNlZmU5ZGUnIH0gfSxcbn07XG5jb25zdCBDUk9TU0lOR19CUkVBVEhfUE9MTF9GUkFNRVMgPSAzMDtcbnR5cGUgQ3Jvc3NpbmdCcmVhdGggPSB7IGRpc3Bvc2U6ICgpID0+IHZvaWQgfTtcbi8qKiBXYXJtIHdoaXRlLCB0aGUgc2hpcHBlZCBgQm9pbGVySG91c2UudHNgIHBsdW1lIGNvbG91ci4gU3RlYW0gaXMgV0hJVEUgKGJ1bmRsZSDCp0ExKS4gKi9cbmNvbnN0IFNURUFNX0NPTE9VUiA9ICcjZmZmOGU4Jztcbi8qKiBFbWJlcnMgb24gdGhlIGNsYWltIHN0YWtlIHdoaWxlIHRoZSBSdXNoIGlzIGxpdmUuICovXG5jb25zdCBSVVNIX0VNQkVSX0NPVU5UID0gMjY7XG4vKiogRWxsaXBzZSByYWRpdXMgYXMgYSBmcmFjdGlvbiBvZiB0aGUgbW9kZWwncyBmb290cHJpbnQg4oCUIGEgcG9vbCwgbm90IGEgc2xhYi4gKi9cbmNvbnN0IExBTkRNQVJLX0NPTlRBQ1RfU1BSRUFEID0gMC40Njtcbi8qKiBIb3cgZmFyIHRoZSBwb29sIGxlYW5zIGF3YXkgZnJvbSB0aGUgYm9keSwgYXMgYSBmcmFjdGlvbiBvZiB0aGUgYm9keSdzIGhlaWdodC4gKi9cbmNvbnN0IExBTkRNQVJLX0NPTlRBQ1RfVEhST1cgPSAwLjMwO1xuY29uc3QgU0NVTFBUX1dBVEVSX01BWF9ERUxUQSA9IDAuMTtcblxuZnVuY3Rpb24gcHVibGlzaChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCBzdGF0ZTogJ2xvYWRpbmcnIHwgJ3JlYWR5JyB8ICdsaXRlJyB8ICdmYWlsZWQnLCBzb3VyY2U6ICdwYWludGVkJyB8ICdnbGInLCBtZXRyaWNzPzogTWV0cmljcywgcGFub3JhbWE/OiBUSFJFRS5PYmplY3QzRCwgcGFub3JhbWFNZXRyaWNzPzogTWV0cmljcywgZGVtb3Rpb25SZWFzb24/OiBzdHJpbmcpOiB2b2lkIHtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGF0ZSA9IHN0YXRlO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFJlbmRlclNvdXJjZSA9IHNvdXJjZTtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIZWlnaHRTb3VyY2UgPSBzb3VyY2UgPT09ICdnbGInID8gJ2Jha2VkLWdyaWQnIDogJ3BhaW50ZWQnO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdE1lc2hlcyA9IFN0cmluZyhtZXRyaWNzPy5tZXNoZXMgPz8gMCk7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90VHJpYW5nbGVzID0gU3RyaW5nKG1ldHJpY3M/LnRyaWFuZ2xlcyA/PyAwKTtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RNYXRlcmlhbHMgPSBTdHJpbmcobWV0cmljcz8ubWF0ZXJpYWxzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFZlcnRpY2VzID0gU3RyaW5nKG1ldHJpY3M/LnZlcnRpY2VzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hID0gcGFub3JhbWE/Lm5hbWUgPz8gJ29mZic7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFNZXNoZXMgPSBTdHJpbmcocGFub3JhbWFNZXRyaWNzPy5tZXNoZXMgPz8gMCk7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFUcmlhbmdsZXMgPSBTdHJpbmcocGFub3JhbWFNZXRyaWNzPy50cmlhbmdsZXMgPz8gMCk7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFNYXRlcmlhbHMgPSBTdHJpbmcocGFub3JhbWFNZXRyaWNzPy5tYXRlcmlhbHMgPz8gMCk7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFWZXJ0aWNlcyA9IFN0cmluZyhwYW5vcmFtYU1ldHJpY3M/LnZlcnRpY2VzID8/IDApO1xuICBpZiAoZGVtb3Rpb25SZWFzb24pIHJlcG9ydFJlbmRlckRlbW90aW9uKGNhbnZhcywgZGVtb3Rpb25SZWFzb24pO1xufVxuXG5mdW5jdGlvbiBpbnNwZWN0KG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgcmVjZWl2ZVNoYWRvdzogYm9vbGVhbik6IE1ldHJpY3Mge1xuICBsZXQgbWVzaGVzID0gMDtcbiAgbGV0IHRyaWFuZ2xlcyA9IDA7XG4gIGxldCB2ZXJ0aWNlcyA9IDA7XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWF0ZXJpYWw+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoKSByZXR1cm47XG4gICAgbWVzaGVzICs9IDE7XG4gICAgY29uc3QgcG9zaXRpb24gPSBtZXNoLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKTtcbiAgICBjb25zdCB1bmlxdWVWZXJ0aWNlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCAocG9zaXRpb24/LmNvdW50ID8/IDApOyBpbmRleCArPSAxKSB7XG4gICAgICB1bmlxdWVWZXJ0aWNlcy5hZGQoYCR7cG9zaXRpb24hLmdldFgoaW5kZXgpfSwke3Bvc2l0aW9uIS5nZXRZKGluZGV4KX0sJHtwb3NpdGlvbiEuZ2V0WihpbmRleCl9YCk7XG4gICAgfVxuICAgIHZlcnRpY2VzICs9IHVuaXF1ZVZlcnRpY2VzLnNpemU7XG4gICAgdHJpYW5nbGVzICs9IE1hdGguZmxvb3IoKG1lc2guZ2VvbWV0cnkuaW5kZXg/LmNvdW50ID8/IHBvc2l0aW9uPy5jb3VudCA/PyAwKSAvIDMpO1xuICAgIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSA/IG1lc2gubWF0ZXJpYWwgOiBbbWVzaC5tYXRlcmlhbF0pIG1hdGVyaWFscy5hZGQobWF0ZXJpYWwpO1xuICAgIG1lc2guY2FzdFNoYWRvdyA9IGZhbHNlO1xuICAgIG1lc2gucmVjZWl2ZVNoYWRvdyA9IHJlY2VpdmVTaGFkb3c7XG4gIH0pO1xuICByZXR1cm4geyBtZXNoZXMsIHRyaWFuZ2xlcywgbWF0ZXJpYWxzOiBtYXRlcmlhbHMuc2l6ZSwgdmVydGljZXMsIGJvdW5kczogbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KG1vZGVsKSB9O1xufVxuXG5mdW5jdGlvbiB2YWxpZFRlcnJhaW4obWV0cmljczogTWV0cmljcywgY29udHJhY3Q6IENvbnRyYWN0KTogYm9vbGVhbiB7XG4gIGNvbnN0IHsgbWluLCBtYXggfSA9IG1ldHJpY3MuYm91bmRzO1xuICBjb25zdCBbbWluWCwgbWluWiwgbWluWV0gPSBjb250cmFjdC5ib3VuZHNNZXRlcnMubWluO1xuICBjb25zdCBbbWF4WCwgbWF4WiwgbWF4WV0gPSBjb250cmFjdC5ib3VuZHNNZXRlcnMubWF4O1xuICByZXR1cm4gbWV0cmljcy5tZXNoZXMgPT09IGNvbnRyYWN0Lm1lc2hDb3VudCAmJiBtZXRyaWNzLnRyaWFuZ2xlcyA9PT0gY29udHJhY3QudHJpYW5nbGVzICYmIG1ldHJpY3MubWF0ZXJpYWxzID09PSBjb250cmFjdC5tYXRlcmlhbENvdW50ICYmXG4gICAgbWV0cmljcy52ZXJ0aWNlcyA9PT0gY29udHJhY3QudmVydGljZXMgJiYgTWF0aC5hYnMobWluLnggLSBtaW5YKSA8PSBCT1VORFNfRVBTSUxPTiAmJiBNYXRoLmFicyhtaW4ueSAtIG1pblkpIDw9IEJPVU5EU19FUFNJTE9OICYmXG4gICAgTWF0aC5hYnMobWluLnogLSBtaW5aKSA8PSBCT1VORFNfRVBTSUxPTiAmJiBNYXRoLmFicyhtYXgueCAtIG1heFgpIDw9IEJPVU5EU19FUFNJTE9OICYmXG4gICAgTWF0aC5hYnMobWF4LnkgLSBtYXhZKSA8PSBCT1VORFNfRVBTSUxPTiAmJiBNYXRoLmFicyhtYXgueiAtIG1heFopIDw9IEJPVU5EU19FUFNJTE9OO1xufVxuXG5mdW5jdGlvbiB2YWxpZFBhbm9yYW1hKG1ldHJpY3M6IE1ldHJpY3MsIGNvbnRyYWN0OiBQYW5vcmFtYUNvbnRyYWN0LCBtb3VudDogTW91bnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvbnRyYWN0LnJlbmRlck9ubHkgJiYgbW91bnQucmVuZGVyT25seSAmJiBtZXRyaWNzLm1lc2hlcyA9PT0gY29udHJhY3QubWVzaENvdW50ICYmIG1ldHJpY3MudHJpYW5nbGVzID09PSBjb250cmFjdC50cmlhbmdsZXMgJiZcbiAgICBtZXRyaWNzLm1hdGVyaWFscyA9PT0gY29udHJhY3QubWF0ZXJpYWxDb3VudCAmJiBtZXRyaWNzLnZlcnRpY2VzID09PSBjb250cmFjdC52ZXJ0aWNlcztcbn1cblxuLyoqXG4gKiBUaGUgaGVpZ2h0IHRoZSBwbGF5ZXIncyBmZWV0IHN0YW5kIG9uIGhhcyB0byBiZSB0aGUgaGVpZ2h0IHRoZSBwbGF5ZXIgU0VFUy4gVGhlIG1lc2hcbiAqIGRyYXdzIHR3byB0cmlhbmdsZXMgcGVyIGdyaWQgY2VsbCBhY3Jvc3Mgb25lIGRpYWdvbmFsOyBhIGJpbGluZWFyIGxlcnAgb3ZlciB0aGUgY2VsbCdzXG4gKiBmb3VyIGNvcm5lcnMgaXMgYSBkaWZmZXJlbnQsIGN1cnZlZCBzdXJmYWNlLCBhbmQgdGhlIHR3byBkaXNhZ3JlZSBieSB1cCB0byAwLjY2NjcgdW5pdHNcbiAqIG9uIHRoZSBNYXJlJ3MgYWJydXB0IHJlbGllZiAoRi1BU1RSQS0xMCwgaXRzIG93biBjZW50cm9pZCBzd2VlcCBvZiB0aGUgZm91ciB0ZXJyYWluczpcbiAqIENsYWltIDAuMDI1MyAvIFR3aW4gQmFua3MgMC4wMjMwIC8gSGlsbCBNaW5lIDAuMTAzMyAvIE1hcmUgMC42NjY3KS4gVGhhdCBnYXAgaXMgZXhhY3RseVxuICogd2hlcmUgZmVldCBmbG9hdCBvciBzaW5rLlxuICpcbiAqIFNvIHRoZSBkaWFnb25hbCBpcyBCQUtFRCBPVVQgT0YgVEhFIElOREVYIEJVRkZFUiwgcGVyIGNlbGwsIG5ldmVyIGFzc3VtZWQ6IHdoaWNoZXZlciB3YXlcbiAqIHRoZSBleHBvcnRlciBzcGxpdCBhIGNlbGwsIHRoZSBzYW1wbGUgbGFuZHMgb24gdGhlIHBsYW5lIG9mIHRoZSB0cmlhbmdsZSB0aGUgcG9pbnQgZmFsbHNcbiAqIGluLCBhbmQgdGhlIHNhbXBsZWQgaGVpZ2h0IGVxdWFscyB0aGUgZHJhd24gc3VyZmFjZSBldmVyeXdoZXJlLiBTdGlsbCBPKDEpIHBlciBzYW1wbGUgYW5kXG4gKiBvbmUgZXh0cmEgYnl0ZSBwZXIgY2VsbC5cbiAqXG4gKiBSZW5kZXItc2lkZSBvbmx5IChDTEFVREUubWQgwqc0LjYpOiB0aGUgc2ltdWxhdGlvbiBzdGF5cyBwbGFuYXIgYW5kIG5ldmVyIHJlYWRzIHRoaXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiYWtlSGVpZ2h0R3JpZChtb2RlbDogVEhSRUUuT2JqZWN0M0QsIG1ldHJpY3M6IE1ldHJpY3MpOiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlciB7XG4gIGNvbnN0IG1lc2ggPSBtb2RlbC5nZXRPYmplY3RCeVByb3BlcnR5KCdpc01lc2gnLCB0cnVlKSBhcyBUSFJFRS5NZXNoO1xuICBjb25zdCBwb3NpdGlvbiA9IG1lc2guZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpO1xuICBjb25zdCBzZWdtZW50cyA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KHBvc2l0aW9uLmNvdW50KSkgLSAxO1xuICBjb25zdCB3aWR0aCA9IHNlZ21lbnRzICsgMTtcbiAgY29uc3Qgc3RlcFggPSAobWV0cmljcy5ib3VuZHMubWF4LnggLSBtZXRyaWNzLmJvdW5kcy5taW4ueCkgLyBzZWdtZW50cztcbiAgY29uc3Qgc3RlcFogPSAobWV0cmljcy5ib3VuZHMubWF4LnogLSBtZXRyaWNzLmJvdW5kcy5taW4ueikgLyBzZWdtZW50cztcbiAgY29uc3QgaGVpZ2h0cyA9IG5ldyBGbG9hdDMyQXJyYXkod2lkdGggKiB3aWR0aCk7XG4gIGNvbnN0IHNlZW4gPSBuZXcgVWludDhBcnJheShoZWlnaHRzLmxlbmd0aCk7XG4gIGNvbnN0IGNvbHVtbnMgPSBuZXcgSW50MzJBcnJheShwb3NpdGlvbi5jb3VudCk7XG4gIGNvbnN0IHJvd3MgPSBuZXcgSW50MzJBcnJheShwb3NpdGlvbi5jb3VudCk7XG4gIGNvbnN0IHBvaW50ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgbW9kZWwudXBkYXRlTWF0cml4V29ybGQodHJ1ZSk7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbi5jb3VudDsgaW5kZXggKz0gMSkge1xuICAgIHBvaW50LmZyb21CdWZmZXJBdHRyaWJ1dGUocG9zaXRpb24gYXMgVEhSRUUuQnVmZmVyQXR0cmlidXRlLCBpbmRleCk7XG4gICAgbWVzaC5sb2NhbFRvV29ybGQocG9pbnQpO1xuICAgIGNvbnN0IGNvbHVtbiA9IE1hdGgucm91bmQoKHBvaW50LnggLSBtZXRyaWNzLmJvdW5kcy5taW4ueCkgLyBzdGVwWCk7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5yb3VuZCgocG9pbnQueiAtIG1ldHJpY3MuYm91bmRzLm1pbi56KSAvIHN0ZXBaKTtcbiAgICBjb25zdCBjZWxsID0gcm93ICogd2lkdGggKyBjb2x1bW47XG4gICAgaWYgKGNvbHVtbiA8IDAgfHwgY29sdW1uID4gc2VnbWVudHMgfHwgcm93IDwgMCB8fCByb3cgPiBzZWdtZW50cyB8fCBzZWVuW2NlbGxdKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdGVycmFpbiBncmlkJyk7XG4gICAgaGVpZ2h0c1tjZWxsXSA9IHBvaW50Lnk7XG4gICAgc2VlbltjZWxsXSA9IDE7XG4gICAgY29sdW1uc1tpbmRleF0gPSBjb2x1bW47XG4gICAgcm93c1tpbmRleF0gPSByb3c7XG4gIH1cbiAgaWYgKHNlZW4uc29tZSgodmFsdWUpID0+IHZhbHVlICE9PSAxKSkgdGhyb3cgbmV3IEVycm9yKCdpbmNvbXBsZXRlIHRlcnJhaW4gZ3JpZCcpO1xuICAvLyAwID0gdGhlIGNlbGwgaXMgc3BsaXQgKGxvdyxsb3cpLi4oaGlnaCxoaWdoKTsgMSA9IHNwbGl0IChoaWdoLGxvdykuLihsb3csaGlnaCkuXG4gIGNvbnN0IGRpYWdvbmFscyA9IG5ldyBVaW50OEFycmF5KE1hdGgubWF4KHNlZ21lbnRzICogc2VnbWVudHMsIDEpKTtcbiAgY29uc3QgZHJhd24gPSBuZXcgVWludDhBcnJheShkaWFnb25hbHMubGVuZ3RoKTtcbiAgY29uc3QgaW5kaWNlcyA9IG1lc2guZ2VvbWV0cnkuaW5kZXg7XG4gIGNvbnN0IHRyaWFuZ2xlQ291bnQgPSBNYXRoLmZsb29yKChpbmRpY2VzPy5jb3VudCA/PyBwb3NpdGlvbi5jb3VudCkgLyAzKTtcbiAgZm9yIChsZXQgdHJpYW5nbGUgPSAwOyB0cmlhbmdsZSA8IHRyaWFuZ2xlQ291bnQ7IHRyaWFuZ2xlICs9IDEpIHtcbiAgICBjb25zdCBhID0gaW5kaWNlcyA/IGluZGljZXMuZ2V0WCh0cmlhbmdsZSAqIDMpIDogdHJpYW5nbGUgKiAzO1xuICAgIGNvbnN0IGIgPSBpbmRpY2VzID8gaW5kaWNlcy5nZXRYKHRyaWFuZ2xlICogMyArIDEpIDogdHJpYW5nbGUgKiAzICsgMTtcbiAgICBjb25zdCBjID0gaW5kaWNlcyA/IGluZGljZXMuZ2V0WCh0cmlhbmdsZSAqIDMgKyAyKSA6IHRyaWFuZ2xlICogMyArIDI7XG4gICAgY29uc3QgY29sdW1uQSA9IGNvbHVtbnNbYV0hLCBjb2x1bW5CID0gY29sdW1uc1tiXSEsIGNvbHVtbkMgPSBjb2x1bW5zW2NdITtcbiAgICBjb25zdCByb3dBID0gcm93c1thXSEsIHJvd0IgPSByb3dzW2JdISwgcm93QyA9IHJvd3NbY10hO1xuICAgIGNvbnN0IGNvbHVtbiA9IE1hdGgubWluKGNvbHVtbkEsIGNvbHVtbkIsIGNvbHVtbkMpO1xuICAgIGNvbnN0IHJvdyA9IE1hdGgubWluKHJvd0EsIHJvd0IsIHJvd0MpO1xuICAgIGlmIChNYXRoLm1heChjb2x1bW5BLCBjb2x1bW5CLCBjb2x1bW5DKSAtIGNvbHVtbiAhPT0gMSB8fCBNYXRoLm1heChyb3dBLCByb3dCLCByb3dDKSAtIHJvdyAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHRlcnJhaW4gdG9wb2xvZ3knKTtcbiAgICB9XG4gICAgLy8gQ29ybmVyIGJpdHM6IDEgPSAobG93LGxvdyksIDIgPSAoaGlnaCxsb3cpLCA0ID0gKGxvdyxoaWdoKSwgOCA9IChoaWdoLGhpZ2gpLiBBIGhhbGYtY2VsbFxuICAgIC8vIHRyaWFuZ2xlIGNvdmVycyBleGFjdGx5IHRocmVlIG9mIHRoZW0sIGFuZCB0aGUgbWlzc2luZyBvbmUgbmFtZXMgdGhlIGRpYWdvbmFsLlxuICAgIGNvbnN0IG1hc2sgPSAoMSA8PCAoKHJvd0EgLSByb3cpICogMiArIGNvbHVtbkEgLSBjb2x1bW4pKVxuICAgICAgfCAoMSA8PCAoKHJvd0IgLSByb3cpICogMiArIGNvbHVtbkIgLSBjb2x1bW4pKVxuICAgICAgfCAoMSA8PCAoKHJvd0MgLSByb3cpICogMiArIGNvbHVtbkMgLSBjb2x1bW4pKTtcbiAgICBjb25zdCBkaWFnb25hbCA9IG1hc2sgPT09IDBiMTAxMSB8fCBtYXNrID09PSAwYjExMDEgPyAwIDogbWFzayA9PT0gMGIxMTEwIHx8IG1hc2sgPT09IDBiMDExMSA/IDEgOiAtMTtcbiAgICBjb25zdCBjZWxsID0gcm93ICogc2VnbWVudHMgKyBjb2x1bW47XG4gICAgaWYgKGRpYWdvbmFsIDwgMCB8fCAoZHJhd25bY2VsbF0gJiYgZGlhZ29uYWxzW2NlbGxdICE9PSBkaWFnb25hbCkpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB0ZXJyYWluIHRvcG9sb2d5Jyk7XG4gICAgZGlhZ29uYWxzW2NlbGxdID0gZGlhZ29uYWw7XG4gICAgZHJhd25bY2VsbF0hICs9IDE7XG4gIH1cbiAgaWYgKHNlZ21lbnRzID4gMCAmJiBkcmF3bi5zb21lKCh2YWx1ZSkgPT4gdmFsdWUgIT09IDIpKSB0aHJvdyBuZXcgRXJyb3IoJ2luY29tcGxldGUgdGVycmFpbiB0b3BvbG9neScpO1xuICBjb25zdCBsYXN0Q2VsbCA9IE1hdGgubWF4KHNlZ21lbnRzIC0gMSwgMCk7XG4gIHJldHVybiAoeCwgeikgPT4ge1xuICAgIGNvbnN0IGd4ID0gVEhSRUUuTWF0aFV0aWxzLmNsYW1wKCh4IC0gbWV0cmljcy5ib3VuZHMubWluLngpIC8gc3RlcFgsIDAsIHNlZ21lbnRzKTtcbiAgICBjb25zdCBneiA9IFRIUkVFLk1hdGhVdGlscy5jbGFtcCgoeiAtIG1ldHJpY3MuYm91bmRzLm1pbi56KSAvIHN0ZXBaLCAwLCBzZWdtZW50cyk7XG4gICAgY29uc3QgeDAgPSBNYXRoLm1pbihNYXRoLmZsb29yKGd4KSwgbGFzdENlbGwpO1xuICAgIGNvbnN0IHowID0gTWF0aC5taW4oTWF0aC5mbG9vcihneiksIGxhc3RDZWxsKTtcbiAgICBjb25zdCB4MSA9IE1hdGgubWluKHgwICsgMSwgc2VnbWVudHMpO1xuICAgIGNvbnN0IHoxID0gTWF0aC5taW4oejAgKyAxLCBzZWdtZW50cyk7XG4gICAgY29uc3QgZnggPSBneCAtIHgwO1xuICAgIGNvbnN0IGZ6ID0gZ3ogLSB6MDtcbiAgICBjb25zdCBsb3cgPSBoZWlnaHRzW3owICogd2lkdGggKyB4MF0hO1xuICAgIGNvbnN0IGVhc3QgPSBoZWlnaHRzW3owICogd2lkdGggKyB4MV0hO1xuICAgIGNvbnN0IHNvdXRoID0gaGVpZ2h0c1t6MSAqIHdpZHRoICsgeDBdITtcbiAgICBjb25zdCBoaWdoID0gaGVpZ2h0c1t6MSAqIHdpZHRoICsgeDFdITtcbiAgICAvLyBFYWNoIGJyYW5jaCBpcyB0aGUgcGxhbmUgdGhyb3VnaCBvbmUgZHJhd24gdHJpYW5nbGUncyB0aHJlZSBjb3JuZXJzLCBzbyB0aGUgc2FtcGxlIHNpdHNcbiAgICAvLyBvbiB0aGUgcmVuZGVyZWQgc3VyZmFjZSByYXRoZXIgdGhhbiBuZWFyIGl0LlxuICAgIGlmIChkaWFnb25hbHNbejAgKiBzZWdtZW50cyArIHgwXSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZ6IDw9IGZ4ID8gbG93ICsgKGVhc3QgLSBsb3cpICogZnggKyAoaGlnaCAtIGVhc3QpICogZnogOiBsb3cgKyAoaGlnaCAtIHNvdXRoKSAqIGZ4ICsgKHNvdXRoIC0gbG93KSAqIGZ6O1xuICAgIH1cbiAgICByZXR1cm4gZnggKyBmeiA8PSAxID8gbG93ICsgKGVhc3QgLSBsb3cpICogZnggKyAoc291dGggLSBsb3cpICogZnogOiBoaWdoICsgKGhpZ2ggLSBzb3V0aCkgKiAoZnggLSAxKSArIChoaWdoIC0gZWFzdCkgKiAoZnogLSAxKTtcbiAgfTtcbn1cblxuLyoqIFRoZSBzdWJtZXJnZWQgcGFub3JhbWEgYXByb24gdXNlcyB0aGUgYmVkJ3Mgd29ybGQtc2NhbGUgYXRsYXMgYW5kIGxpZ2h0aW5nLiAqL1xuZnVuY3Rpb24gcm91dGVTZWFBcHJvbih0ZXJyYWluOiBUSFJFRS5PYmplY3QzRCwgcGFub3JhbWE6IFRIUkVFLk9iamVjdDNELCBib3VuZHM6IFRIUkVFLkJveDMpOiBudW1iZXIge1xuICBsZXQgc291cmNlOiBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCB8IHVuZGVmaW5lZDtcbiAgdGVycmFpbi50cmF2ZXJzZShvYmplY3QgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAobWVzaC5pc01lc2ggJiYgIUFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgJiYgKG1lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpLm1hcCkge1xuICAgICAgc291cmNlID0gbWVzaC5tYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbDtcbiAgICB9XG4gIH0pO1xuICBpZiAoIXNvdXJjZT8ubWFwKSByZXR1cm4gMDtcbiAgbGV0IHRyaWFuZ2xlcyA9IDA7XG4gIHBhbm9yYW1hLnRyYXZlcnNlKG9iamVjdCA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG9iamVjdCBhcyBUSFJFRS5NZXNoO1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSkgcmV0dXJuO1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gbWVzaC5nZW9tZXRyeTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSwgdXYgPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3V2Jyk7XG4gICAgaWYgKCFnZW9tZXRyeS5pbmRleCB8fCAhcG9zaXRpb24gfHwgIXV2KSByZXR1cm47XG4gICAgY29uc3QgYmVkOiBudW1iZXJbXSA9IFtdLCBza3k6IG51bWJlcltdID0gW10sIGZvcmVncm91bmQ6IG51bWJlcltdID0gW10sIGJlZFZlcnRpY2VzID0gbmV3IFNldDxudW1iZXI+KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9tZXRyeS5pbmRleC5jb3VudDsgaSArPSAzKSB7XG4gICAgICBjb25zdCBmYWNlID0gW2dlb21ldHJ5LmluZGV4LmdldFgoaSksIGdlb21ldHJ5LmluZGV4LmdldFgoaSsxKSwgZ2VvbWV0cnkuaW5kZXguZ2V0WChpKzIpXTtcbiAgICAgIC8vIFRoZSBmYWN0b3J5J3Mgc2VhIHNraXJ0IG9jY3VwaWVzIFVWIHJvd3MgLjg04oCTLjk3MiBhZnRlciB0aGUgZ2xURiBWIGZsaXAsIHdob2xseSBiZWxvdyBzZWEgbGV2ZWwuXG4gICAgICAvLyBTa3kvcmlkZ2UgZmFjZXMgcmV0YWluIHRoZSBhdXRob3JlZCBwYW5vcmFtYSBtYXRlcmlhbCBhbmQgVVZzLlxuICAgICAgY29uc3QgaXNCZWQgPSBmYWNlLmV2ZXJ5KHYgPT4gcG9zaXRpb24uZ2V0WSh2KSA8IDAgJiYgdXYuZ2V0WSh2KSA+PSAuODM5OTkgJiYgdXYuZ2V0WSh2KSA8PSAuOTcyMDEpO1xuICAgICAgLy8gVGhlIGZhY3RvcnkgYXBwZW5kcyB3cmVjayBzaWxob3VldHRlcyBhZnRlciB0aGUgY29udGlndW91cyBhcHJvbiBmYWNlcy5cbiAgICAgIC8vIEtlZXAgdGhlbSBpbiBhIGxhdGVyIGRyYXc6IG9wYXF1ZSBtYXRlcmlhbCBzb3J0aW5nIHdvdWxkIG90aGVyd2lzZSBkcmF3XG4gICAgICAvLyB0aGUgbmV3IGJlZCBtYXRlcmlhbCBvdmVyIG1hc3RzIGF0IHRoZSBwYW5vcmFtYSdzIHNoYXJlZCBmYXItcGxhbmUgZGVwdGguXG4gICAgICAoaXNCZWQgPyBiZWQgOiBiZWQubGVuZ3RoID8gZm9yZWdyb3VuZCA6IHNreSkucHVzaCguLi5mYWNlKTtcbiAgICAgIGlmIChpc0JlZCkgZmFjZS5mb3JFYWNoKHYgPT4gYmVkVmVydGljZXMuYWRkKHYpKTtcbiAgICB9XG4gICAgaWYgKCFiZWQubGVuZ3RoKSByZXR1cm47XG4gICAgY29uc3Qgcm91dGVkID0gZ2VvbWV0cnkuY2xvbmUoKTtcbiAgICBjb25zdCByb3V0ZWRVdiA9IHJvdXRlZC5nZXRBdHRyaWJ1dGUoJ3V2Jyk7XG4gICAgZm9yIChjb25zdCB2IG9mIGJlZFZlcnRpY2VzKSByb3V0ZWRVdi5zZXRYWSh2LFxuICAgICAgKHBvc2l0aW9uLmdldFgodiktYm91bmRzLm1pbi54KS8oYm91bmRzLm1heC54LWJvdW5kcy5taW4ueCksXG4gICAgICAoYm91bmRzLm1heC56LXBvc2l0aW9uLmdldFoodikpLyhib3VuZHMubWF4LnotYm91bmRzLm1pbi56KSk7XG4gICAgcm91dGVkVXYubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIHJvdXRlZC5zZXRJbmRleChbLi4uc2t5LC4uLmJlZF0pO1xuICAgIHJvdXRlZC5jbGVhckdyb3VwcygpOyByb3V0ZWQuYWRkR3JvdXAoMCxza3kubGVuZ3RoLDApOyByb3V0ZWQuYWRkR3JvdXAoc2t5Lmxlbmd0aCxiZWQubGVuZ3RoLDEpO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gc291cmNlIS5jbG9uZSgpO1xuICAgIG1hdGVyaWFsLm1hcCA9IHNvdXJjZSEubWFwIS5jbG9uZSgpO1xuICAgIG1hdGVyaWFsLm1hcC53cmFwUyA9IG1hdGVyaWFsLm1hcC53cmFwVCA9IFRIUkVFLk1pcnJvcmVkUmVwZWF0V3JhcHBpbmc7XG4gICAgbWF0ZXJpYWwubWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICBtYXRlcmlhbC5kZXB0aFdyaXRlID0gZmFsc2U7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gc2hhZGVyID0+IHtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxwcm9qZWN0X3ZlcnRleD4nLFxuICAgICAgICAnI2luY2x1ZGUgPHByb2plY3RfdmVydGV4PlxcbmdsX1Bvc2l0aW9uLnogPSBnbF9Qb3NpdGlvbi53ICogMC45OTk5OTk7Jyk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiAnc2VhLWJlZC1hcHJvbi12MSc7XG4gICAgbWVzaC5tYXRlcmlhbCA9IFttZXNoLm1hdGVyaWFsLG1hdGVyaWFsXTtcbiAgICBtZXNoLmdlb21ldHJ5ID0gcm91dGVkO1xuICAgIGlmIChmb3JlZ3JvdW5kLmxlbmd0aCkge1xuICAgICAgY29uc3QgZm9yZWdyb3VuZEdlb21ldHJ5ID0gZ2VvbWV0cnkuY2xvbmUoKTtcbiAgICAgIGZvcmVncm91bmRHZW9tZXRyeS5zZXRJbmRleChmb3JlZ3JvdW5kKTtcbiAgICAgIGZvcmVncm91bmRHZW9tZXRyeS5jbGVhckdyb3VwcygpO1xuICAgICAgY29uc3Qgc2lsaG91ZXR0ZXMgPSBuZXcgVEhSRUUuTWVzaChmb3JlZ3JvdW5kR2VvbWV0cnksIG1lc2gubWF0ZXJpYWxbMF0pO1xuICAgICAgc2lsaG91ZXR0ZXMubmFtZSA9ICdTZWFQYW5vcmFtYVNpbGhvdWV0dGVzJztcbiAgICAgIHNpbGhvdWV0dGVzLnVzZXJEYXRhLnNlYVBhbm9yYW1hRm9yZWdyb3VuZCA9IHRydWU7XG4gICAgICBzaWxob3VldHRlcy5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gICAgICBzaWxob3VldHRlcy5yZW5kZXJPcmRlciA9IG1lc2gucmVuZGVyT3JkZXIgKyAwLjAxO1xuICAgICAgbWVzaC5hZGQoc2lsaG91ZXR0ZXMpO1xuICAgIH1cbiAgICBnZW9tZXRyeS5kaXNwb3NlKCk7XG4gICAgdHJpYW5nbGVzICs9IGJlZC5sZW5ndGgvMztcbiAgfSk7XG4gIHJldHVybiB0cmlhbmdsZXM7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVQYW5vcmFtYShtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoO1xuICAgIGlmICghbWVzaC5pc01lc2gpIHJldHVybjtcbiAgICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgICBtZXNoLnJlbmRlck9yZGVyID0gLTEwMDtcbiAgICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgPyBtZXNoLm1hdGVyaWFsIDogW21lc2gubWF0ZXJpYWxdKSBtYXRlcmlhbHMuYWRkKG1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgZm9nTWF0ZXJpYWwgPSBtYXRlcmlhbCBhcyBUSFJFRS5NYXRlcmlhbCAmIHsgZm9nPzogYm9vbGVhbiB9O1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgZm9nTWF0ZXJpYWwuZm9nID0gZmFsc2U7XG4gICAgbWF0ZXJpYWwudHJhbnNwYXJlbnQgPSBmYWxzZTtcbiAgICBtYXRlcmlhbC5kZXB0aFdyaXRlID0gZmFsc2U7XG4gICAgbWF0ZXJpYWwuZGVwdGhUZXN0ID0gdHJ1ZTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoXG4gICAgICAgICcjaW5jbHVkZSA8cHJvamVjdF92ZXJ0ZXg+JyxcbiAgICAgICAgJyNpbmNsdWRlIDxwcm9qZWN0X3ZlcnRleD5cXG5nbF9Qb3NpdGlvbi56ID0gZ2xfUG9zaXRpb24udyAqIDAuOTk5OTk5OycsXG4gICAgICApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogTGFuZG1hcmsgcGFpbnQgd291bGQgZ28gZGFyayB3aXRob3V0IHRoaXMsIHNvIGl0IHN0YXlzIOKAlCBidXQgYXQgaW50ZW5zaXR5IDMgdGhlXG4gKiBjb2xvdXIgbWFwIGlzIGl0cyBvd24gbGlnaHQgc291cmNlIGFuZCB0aGUgYm9kaWVzIGZsb2F0IGluIGZsYXQgd2hpdGUgd2hpbGUgdGhlXG4gKiBsb3cgc3VuIG1vZGVscyBldmVyeXRoaW5nIGFyb3VuZCB0aGVtLiBVMyBvZiB0aGUgYmVhdXR5IHNoaWZ0IG1ha2VzIHRoZSBpbnRlbnNpdHlcbiAqIGEgcGVyLWNvbnRyYWN0IHR1bmFibGUgYW5kIGRyb3BzIHRoZSBDbGFpbSdzIHRvIHdoZXJlIHRoZSBzdW4gZG9lcyB0aGUgbW9kZWxsaW5nXG4gKiBhbmQgdGhlIGVtaXNzaXZlIG9ubHkga2VlcHMgdGhlIHBhaW50IG9mZiB0aGUgZmxvb3IuXG4gKi9cbmNvbnN0IExBTkRNQVJLX0VNSVNTSVZFX0RFRkFVTFQgPSAzO1xuLyoqXG4gKiBgZTMtYmxhY2tvdXQtcmlkZ2VgIGlzIGdyYWRlZCBBQk9WRSB0aGUgbGVnYWN5IGRlZmF1bHQg4oCUIHRoZSBvbmx5IHJvdyB0aGF0IGlzIOKAlCBiZWNhdXNlIGl0IGlzIGFcbiAqIG5pZ2h0LUxPQ0tFRCBtYXAgd2hvc2UgZ3JvdW5kIGdpdmVzIGl0cyBib2RpZXMgbm90aGluZywgYW5kIEYtT01CLTQgbGVmdCBpdCBhdCB0aGUgY2FsaWJyYXRlZFxuICogZGVmYXVsdCBhZnRlciB0aGUgYXRsYXMgcmVidWlsZCBjdXJlZCBtb3N0IG9mIEFzdHJhJ3MgXCJkYXJrIG1hY2hpbmVyeVwiLiBNZWFzdXJlZCBvbiB0aGUgcmVmZXJlbmNlXG4gKiByaWcgKGBsYW5kbWFyay1icmlnaHRuZXNzLnNwZWMudHNgLCBkZXNrdG9wLCBmb2N1cyBgcmlkZ2Utc3dpdGNoLWhvdXNlYCwgMjAyNi0wOS0xOCksIGxhbmRtYXJrXG4gKiBtZWRpYW4gbHVtaW5hbmNlIGFnYWluc3QgaXRzIG93biBlcmEgc2libGluZyDigJQgYGUzLWZhaXJncm91bmRgLCB0aGUgb3RoZXIgRTMgbmlnaHQgbWFwLCB3aG9zZVxuICogYXRsYXMgYWxyZWFkeSBjYXJyaWVzIHRoZSBsaWZ0ZWQgVjIgcGFsZXR0ZTogZmFpcmdyb3VuZCAwLjEwNTcsIGJsYWNrb3V0IHJpZGdlIDAuMDg4MiBhdCB0aGVcbiAqIGRlZmF1bHQgKC0xNi42ICUpLiBUaGUgYGxtZW1pc3NpdmVgIHN3ZWVwIG9uIHRoaXMgbWFwIHJlYWRzIDAuMTIgLT4gMC4wNTI5LCAwLjIwIC0+IDAuMDY0MixcbiAqIDAuMzAgLT4gMC4wNzMyLCAwLjQ1IC0+IDAuMDg4MiwgMC42MCAtPiAwLjEwMTgsIHNvIHRoZSBzaWJsaW5nJ3MgbGV2ZWwgd2FudHMgfjAuNjIgYW5kIHRoZSBoYXJkXG4gKiBjYXAgaXMgMC42OiA0IGdyYWRlcyB0byBleGFjdGx5IHRoZSBjZWlsaW5nIGFuZCBsYW5kcyB0aGUgcGFpciB3aXRoaW4gMy43ICUuIFRoZSBjYXAsIG5vdCB0aGlzXG4gKiBudW1iZXIsIGlzIHdoYXQgc3RvcHMgdGhlIGJvZHkgYmVjb21pbmcgaXRzIG93biBsaWdodCBzb3VyY2UuXG4gKi9cbi8vIE1lYXN1cmVkIHNpZ25hbC1tYXAgYm9keSBsaWZ0cyB1c2UgdGhlIHNhbWUgMC42IGNlaWxpbmc7IHVubGlzdGVkIHNpZ25hbCBtYXBzIGtlZXAgdGhlIGRlZmF1bHQuXG5jb25zdCBMQU5ETUFSS19FTUlTU0lWRTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHsgJ3RoZS1jbGFpbSc6IDEuNDUsICdlMi1oaWxsLW1pbmUnOiAxLjQ1LCAnZTItdHJlc3RsZSc6IDEuNSwgJ2UyLXByZXNzdXJlLWdhcmRlbic6IDEuNDUsICdlMi1pbmNsaW5lJzogMS40NSwgJ2UzLWJsYWNrb3V0LXJpZGdlJzogNCwgJ2U3LXJlbGF5LXZhbGxleSc6IDQsICdlNy1lY2hvLWNhbnlvbic6IDQgfTtcblxuLyoqXG4gKiBGLUFTVFJBLTksIFRIRSBDQUxJQlJBVElPTiAoMjAyNi0wOS0wNSwgb3duZXI6IFwiT2ssIHRoZW4gbGV0cyBoYXZlIGl0IGZpeCB0aGVzZSBmaW5kaW5ncy5cIikuXG4gKlxuICogQXN0cmEgbWVhc3VyZWQgdGhlIGRlZmVjdCBhcyBhIFJFTEFUSU9OU0hJUCwgbm90IGEgbnVtYmVyOiBcIk1vc3QgZGF5bGlnaHQgbGFuZG1hcmtzIHRoZXJlZm9yZVxuICogaWxsdW1pbmF0ZSB0aGVtc2VsdmVzIHdoaWxlIHN1cnJvdW5kaW5nIHRlcnJhaW4gcmVzcG9uZHMgdG8gdGhlIHN1bi5cIiBUaGUgbnVtYmVycyBhYm92ZSBhcmUgdGhhdFxuICogcmVsYXRpb25zaGlwIHdyaXR0ZW4gZG93biDigJQgdGhlIGF0bGFzIGlzIHJvdXRlZCBpbnRvIEVNSVNTSU9OLCBzbyBhdCAzIGEgYm9keSBlbWl0cyByb3VnaGx5IHRocmVlXG4gKiB0aW1lcyBpdHMgb3duIGFsYmVkbyBvbiB0b3Agb2Ygd2hhdGV2ZXIgdGhlIHN1biBnaXZlcyBpdCwgYW5kIHRoZSBsb3cgc3VuIG1vZGVscyBub3RoaW5nIG9uIGl0LlxuICpcbiAqIFRoZSByZWZlcmVuY2UgcmlnIChgZTJlL2xhbmRtYXJrLWJyaWdodG5lc3Muc3BlYy50c2AsIFwicmVmZXJlbmNlIHJpZ1wiKSBtZWFzdXJlcyB0aGUgdGhyZWVcbiAqIGZhbWlsaWVzIHRoYXQgc2hhcmUgdGhpcyByaWcgaW4gb25lIGZyYW1lIOKAlCB0ZXJyYWluIChubyBlbWlzc2l2ZSwgdGhlIHJlZmVyZW5jZSksIGxhbmRtYXJrLCBhbmRcbiAqIHRoZSB1bmxpdCBoZXJvIHNwcml0ZSAodGhlIGNlaWxpbmcpLiBNZWFzdXJlZCBvbiBgZGM3NGUzMDc1YCwgZGVza3RvcCwgbGFuZG1hcmsvdGVycmFpbiBtZWRpYW5cbiAqIGx1bWluYW5jZTpcbiAqXG4gKiAgIE1hcmUgQ2xhaW0gKGVtaXNzaXZlIDMpICAgICAgNC43MiAgIDwtIHRoZSBmaW5kaW5nLCBxdWFudGlmaWVkXG4gKiAgIFRoZSBDbGFpbSAgKGVtaXNzaXZlIDEuNDUpICAgMS4wNFxuICogICBIaWxsIE1pbmUgICgxLjQ1IC8gcm9vZiAyKSAgIDAuNzJcbiAqICAgTmlnaHQgU2hpZnQgKE5FVkVSIHBhaW50ZWQpICAwLjkwICAgPC0gdGhlIGNvbnRyb2w6IHdoYXQgYSBib2R5IHJlYWRzIGF0IHdoZW4gb25seSB0aGUgcmlnIGxpZ2h0cyBpdFxuICpcbiAqIE5pZ2h0IFNoaWZ0IGlzIHRoZSBjb250cm9sIGJlY2F1c2UgYGxvYWRNb3VudGAgc2tpcHMgYGtlZXBMYW5kbWFya1BhaW50UmVhZGFibGVgIG9uIGl0IGVudGlyZWx5LFxuICogc28gaXRzIGJvZGllcyBoYXZlIG9ubHkgdGhlIEdMQidzIG93biBlbWlzc2l2ZSBhbmQgYW5zd2VyIHRoZSByaWcgYWxvbmUg4oCUIGFuZCB0aGV5IHNpdCBzbGlnaHRseVxuICogQkVMT1cgdGhlIGdyb3VuZCB0aGV5IHN0YW5kIG9uLCB3aGljaCBpcyB3aGF0IGEgbGl0IGJvZHkgZG9lcy4gVGhhdCBpcyB0aGUgc2hhcGUgdGhpcyBjYWxpYnJhdGlvblxuICogYWltcyBhdDogdGhlIHdob2xlLWJvZHkgZW1pc3NpdmUgYmVjb21lcyBhIHNtYWxsIElOSyBMSUZUIHRoYXQga2VlcHMgdGhlIGlsbHVzdHJhdGVkIHBhaW50IG9mZlxuICogdGhlIGZsb29yLCBub3QgdGhlIGJvZHkncyBsaWdodCBzb3VyY2UsIHdpdGggQXN0cmEncyBjZWlsaW5nIG9mIDAuNiBhcyBhIGhhcmQgY2FwLlxuICpcbiAqIFRIRSBOVU1CRVIgSVMgTUVBU1VSRUQsIE5PVCBDSE9TRU4g4oCUIEFORCBUSEUgUkVBREFCSUxJVFkgRkxPT1IsIE5PVCBUSEUgQ0VJTElORywgU0VUIElULiBTd2VlcGluZ1xuICogb25lIGZvcmNlZCBpbnRlbnNpdHkgYWNyb3NzIGV2ZXJ5IG1vdW50ICh0aGUgcmlnJ3MgYD9sbWVtaXNzaXZlPWAgZGlhbCwgZGVza3RvcCwgc2FtZSBwcm9iZXMpXG4gKiBzZXBhcmF0ZXMgdGhlIHR3byB0ZXJtczogdGhlIFNVTidzIHNoYXJlIG9mIHdoYXQgdGhlIGJvZHkgcmVuZGVycyBhdCBpcyB0aGUgbGl0IHZhbHVlIGF0IGVtaXNzaXZlXG4gKiAwIG92ZXIgdGhlIHZhbHVlIGF0IHRoZSBhcm0uXG4gKlxuICogICBhcm0gICAgICAgICAgICAwICAgICAwLjIwICAgIDAuMzAgICAgMC40NSAgICAwLjYwICAgIGxlZ2FjeSgzKVxuICogICBNYXJlIENsYWltICAgMTAwJSAgICAgNjMlICAgICA1NCUgICAgIDQ2JSAgICAgNDAlICAgICAgICAxOCUgICA8LSBhdXRob3JlZCAzLCB0aGUgd29yc3QgY2FzZVxuICogICBUaGUgQ2xhaW0gICAgMTAwJSAgICAgNjglICAgICA1OSUgICAgIDUyJSAgICAgNDglICAgICAgICAzNyVcbiAqXG4gKiBCeSB0aGF0IG1lYXN1cmUgYWxvbmUgMC4zMCB3b3VsZCB3aW4g4oCUIHRoZSBoaWdoZXN0IGxpZnQgYXQgd2hpY2ggdGhlIHN1biBpcyBzdGlsbCB0aGUgbWFqb3JpdHlcbiAqIGNvbnRyaWJ1dG9yIGV2ZXJ5d2hlcmUuIElUIFdBUyBUUklFRCBBTkQgSVQgQlJPS0UgQSBSRUFEQUJJTElUWSBMQVcuIGBlMmUvbWFwLWNlbnN1cy5zcGVjLnRzYFxuICogcHJvYmVzIHRoZSBmaXJzdCBtb3VudCBvZiBhbGwgNDMgY29udHJhY3RzIGFuZCBmYWlscyB1bmRlciBtZWRpYW4gbHVtaW5hbmNlIDAuMDY7IGEgRlVMTCA0Ny10ZXN0XG4gKiBydW4gYXQgMC4zMCBkcm9wcGVkIEZPVVIgZGFyay1ib2RpZWQgbWFwcyB1bmRlciBpdCAoZTMtbW90aC1zZWFzb24gMC4wNDQsIGU2LWdsb3ctbWVzYSAwLjA1MSxcbiAqIGU2LXBpY25pYyAwLjA1NCwgZTItcHJlc3N1cmUtZ2FyZGVuIDAuMDUzKSB3aGlsZSB0aGUgc2FtZSBydW4gb24gdGhlIHByZS1jaGFuZ2UgdHJlZSB3YXMgY2xlYW4sXG4gKiBzbyB0aGUgcmVncmVzc2lvbiB3YXMgdGhpcyBjYWxpYnJhdGlvbidzIGFuZCBub3QgdGhlIGJvYXJkJ3MuIFRoZSBib2RpZXMgdGhhdCBicmVhayBhcmUgdGhlIG9uZXNcbiAqIHdob3NlIGF0bGFzIGlzIGFscmVhZHkgZGFyayDigJQgbW90aCBzZWFzb24ncyB3YXRjaCBnYXRlIHJlbmRlcnMgMC4wNDQ1IHdpdGggTk8gZW1pc3NpdmUgYXQgYWxsLFxuICogYWdhaW5zdCBhIDAuOTMgc2FsdC1mbGF0IGdyb3VuZCDigJQgYW5kIGEgbGlmdCBwcm9wb3J0aW9uYWwgdG8gYSBnbG9iYWwgZGVmYXVsdCBnaXZlcyB0aGUgZGFya2VzdFxuICogcGFpbnQgdGhlIGxlYXN0IGhlbHAsIGV4YWN0bHkgd2hlcmUgaXQgaXMgbmVlZGVkIG1vc3QuXG4gKlxuICogU28gdGhlIGRlZmF1bHQgaXMgMC40NTogYSA2Ljd4IGN1dCBmcm9tIHRoZSBsZWdhY3kgMywgdW5kZXIgQXN0cmEncyBjZWlsaW5nIG9mIDAuNiwgbW92aW5nIHRoZVxuICogd29yc3QgbWFwIGZyb20gMTglIHN1biB0byA0NiUsIGFuZCBrZWVwaW5nIGV2ZXJ5IGRheWxpZ2h0IGJvZHkgdW5kZXIgdGhlIHVubGl0IGhlcm8gc3ByaXRlIGluIHRoZVxuICogc2FtZSBmcmFtZSDigJQgYXQgZW1pc3NpdmUgMyB0aGUgYnVpbGRpbmdzIG91dC1zaG9uZSBoZXIsIHdoaWNoIGlzIHRoZSBvdGhlciB3YXkgb2Ygc2F5aW5nIGFcbiAqIHBhaW50ZWQgYnVpbGRpbmcgaGFkIHN0b3BwZWQgYmVoYXZpbmcgbGlrZSBhIGxpdCBvYmplY3QuXG4gKlxuICogQU5EIEZPUiBGT1VSIE1BUFMgTk8gVkFMVUUgVU5ERVIgVEhFIENFSUxJTkcgV09SS1MgQVQgQUxMLiBUaGUgZnVsbCBjZW5zdXMgYXQgMC40NSByZWRzIHRoZSBzYW1lXG4gKiBmb3VyOyB0aGUgcmlnJ3Mgc3dlZXAgc2F5cyB3aHkg4oCUIG1vdGggc2Vhc29uJ3Mgd2F0Y2ggZ2F0ZSByZWFkcyAwLjA0NDUgYXQgZW1pc3NpdmUgMCwgMC4wNTEyIGF0XG4gKiAwLjMwLCAwLjA1NTcgYXQgMC40NSBhbmQgMC4wNTg4IGF0IDAuNjAsIHNvIHRoZSB3aG9sZSBsZWdhbCByYW5nZSBtb3ZlcyBpdCBieSBhIGh1bmRyZWR0aCBhbmQgdGhlXG4gKiBmbG9vciBzdGF5cyBvdXQgb2YgcmVhY2guIFRoZWlyIHBhaW50LCBub3QgdGhlaXIgbGlnaHRpbmcsIGlzIHRoZSBkZWZlY3QsIGFuZCBGLUFTVFJBLTEgc2F5cyB0aGVcbiAqIHNhbWUgdGhpbmcgYWJvdXQgdGhlc2UgYXRsYXNlcyAoXCJsYXJnZSBhcmVhcyBiZWNvbWUgbmVhcmx5IHVuaWZvcm0gZ3JleSBvciBydXN0IC4uLiBSZXN0b3JlXG4gKiBtYXRlcmlhbCBhbmQgdmFsdWUgc2VwYXJhdGlvblwiKS4gTGlnaHRpbmcgY2Fubm90IGN1cmUgYSBkYXJrIGF0bGFzIHdpdGhvdXQgYmVjb21pbmcgaXRzIGxpZ2h0XG4gKiBzb3VyY2UgYWdhaW4sIHdoaWNoIElTIHRoZSBmaW5kaW5nLiBTbyB0aG9zZSBjb250cmFjdHMgYXJlIEVYRU1QVCBhbmQga2VlcCB0aGVpciBhdXRob3JlZCBsaWZ0XG4gKiB1bnRpbCB0aGVpciBhdGxhcyBpcyByZS1ncmFkZWQ7IHRoZSBjYWxpYnJhdGlvbiBsYW5kcyBvbiB0aGUgb3RoZXIgMzkuXG4gKlxuICogVEhFIFRBQkxFIEFCT1ZFIElTIEtFUFQgQVMgQSBSRUxBVElWRSBHUkFERS4gVGhyZWUgc2lnbmVkLW9mZiBzaGlmdHMgdHVuZWQgdGhvc2UgbnVtYmVycyBhZ2FpbnN0XG4gKiBlYWNoIG90aGVyICh0aGUgYmFyb24ncyBjb2xkIGZvcnQgdW5kZXIgaXRzIHdhcm0gYmFubmVycywgaGlsbCBtaW5lJ3Mgc2hvdXRpbmcgcm9vZiwgdGhlIHRyZXN0bGVcbiAqIHBhaXIpIGFuZCBGLUJITS0xIGlzIHRoZSBzY2FyIGZyb20gc2lsZW50bHkgcmVzZXR0aW5nIHRoZW0uIFNvIHRoZSBhdXRob3JlZCB2YWx1ZSBpcyBkaXZpZGVkIGJ5XG4gKiB0aGUgbGVnYWN5IGRlZmF1bHQgdG8gcmVjb3ZlciB0aGUgZ3JhZGUgdGhlIHNoaWZ0IGludGVuZGVkLCBhbmQgdGhlIGdyYWRlIGlzIHJlLWh1bmcgb24gdGhlXG4gKiBjYWxpYnJhdGVkIGRlZmF1bHQg4oCUIHRoZSBPUkRFUiBiZXR3ZWVuIG1vdW50cyBpcyBwcmVzZXJ2ZWQgZXhhY3RseSwgb25seSB0aGUgc2NhbGUgbW92ZXMuIFRoZVxuICogVElOVCBoYWxmIG9mIGVhY2ggb2YgdGhvc2Ugc2hpZnRzIChgbWF0ZXJpYWwuY29sb3IubXVsdGlwbHkodGludClgLCB0aGUgYmFyb24ncyB3ZXQgaXJvbiwgaGlsbFxuICogbWluZSdzIG94aWRlIHJvb2YpIGlzIHVudG91Y2hlZCBieSB0aGlzIGNoYW5nZSBhbmQgc3RpbGwgZG9lcyBpdHMgd29yayBvbiB0aGUgZGlmZnVzZS5cbiAqL1xuY29uc3QgTEFORE1BUktfRU1JU1NJVkVfV0hPTEVfQk9EWV9NQVggPSAwLjY7XG4vKiogVGhlIGNhbGlicmF0ZWQgd2hvbGUtYm9keSBpbmsgbGlmdDogd2hhdCB0aGUgbGVnYWN5IGRlZmF1bHQgb2YgMyBiZWNvbWVzLiAqL1xuY29uc3QgTEFORE1BUktfRU1JU1NJVkVfQ0FMSUJSQVRFRF9ERUZBVUxUID0gMC40NTtcbi8qKlxuICogVGhlIHBhaW50IG11c3Qgbm90IGdvIHRvIG11ZCBvbiBhIGJvZHkgd2hvc2Ugc2hpZnQgZ3JhZGVkIGl0IGZhciBkb3duLiBEb2N1bWVudGVkIGFzIGEgZ3VhcmQsIG5vdFxuICogYXMgdHVuaW5nOiB0aGUgbG93ZXN0IGF1dGhvcmVkIHZhbHVlIGluIHRoZSB0YWJsZSBpcyAxLjI4LCB3aGljaCBsYW5kcyBhdCAwLjE5Miwgc28gYXMgb2YgdGhpc1xuICogY29tbWl0IHRoZSBmbG9vciBiaW5kcyBvbiBOT1RISU5HLiBJdCBleGlzdHMgc28gYSBmdXR1cmUgZ3JhZGUgYmVsb3cgfjAuOCBjYW5ub3Qgc2lsZW50bHkgcmVhY2hcbiAqIHplcm8gYW5kIGxlYXZlIGEgYm9keSB3aXRoIG5vIGxpZnQgYXQgYWxsLlxuICovXG5jb25zdCBMQU5ETUFSS19FTUlTU0lWRV9XSE9MRV9CT0RZX01JTiA9IDAuMTI7XG4vKipcbiAqIEVtaXNzaXZlIHdpbmRvd3MgYW5kIHRlYWwgc3lzdGVtcyBrZWVwIHRoZWlyIGdsb3c6IHRob3NlIGFyZSBVTkxJVCBwYWludCBvYmplY3RzXG4gKiAoYGRyZXNzTGFuZG1hcmtgJ3MgYE1lc2hCYXNpY01hdGVyaWFsYCBsYW1wIHF1YWRzLCB0aGUgbmlnaHQgcG9vbHMnIHNoYWRlciB0ZXJtLCB0aGUgd2F0ZXJcbiAqIGVtaXNzaXZlKSwgbm9uZSBvZiB3aGljaCByb3V0ZSB0aHJvdWdoIHRoaXMgZnVuY3Rpb24g4oCUIHRoZSBjYXAgYmVsb3cgb25seSBldmVyIHRvdWNoZXMgYSBib2R5XG4gKiB3aG9zZSBvd24gZGlmZnVzZSBhdGxhcyB3YXMgYmVpbmcgdXNlZCBhcyBpdHMgbGlnaHQgc291cmNlLlxuICovXG5mdW5jdGlvbiBjYWxpYnJhdGVkTGFuZG1hcmtJbnRlbnNpdHkoYXV0aG9yZWQ6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGRpYWxzID0gbGlnaHRpbmdEaWFscygpO1xuICBpZiAoZGlhbHMubW9kZSA9PT0gJ2xlZ2FjeScpIHJldHVybiBhdXRob3JlZDtcbiAgaWYgKGRpYWxzLmVtaXNzaXZlICE9PSB1bmRlZmluZWQpIHJldHVybiBkaWFscy5lbWlzc2l2ZTtcbiAgY29uc3QgZ3JhZGUgPSBhdXRob3JlZCAvIExBTkRNQVJLX0VNSVNTSVZFX0RFRkFVTFQ7XG4gIGNvbnN0IGxpZnQgPSBMQU5ETUFSS19FTUlTU0lWRV9DQUxJQlJBVEVEX0RFRkFVTFQgKiBncmFkZTtcbiAgcmV0dXJuICtUSFJFRS5NYXRoVXRpbHMuY2xhbXAobGlmdCwgTEFORE1BUktfRU1JU1NJVkVfV0hPTEVfQk9EWV9NSU4sIExBTkRNQVJLX0VNSVNTSVZFX1dIT0xFX0JPRFlfTUFYKS50b0ZpeGVkKDQpO1xufVxuXG4vKipcbiAqIFRIRSBSRUZFUkVOQ0UtUklHIERJQUxTIChoYXJuZXNzLCBub3QgZ2FtZXBsYXkpLiBFdmVyeSBkaWFsIGlzIEFCU0VOVCBieSBkZWZhdWx0LCBzbyBhIHBsYWluIGJvb3RcbiAqIHRha2VzIHRoZSBjYWxpYnJhdGVkIHBhdGggYW5kIG5vIGJyYW5jaCBiZWxvdyBydW5zLiBUaGV5IGV4aXN0IGJlY2F1c2UgYSBsb29rIGNoYW5nZSB0aGUgb3duZXJcbiAqIGp1ZGdlcyBoYXMgdG8gYmUgcmV2ZXJzaWJsZSBpbiB0aGUgYnJvd3NlciBoZSBpcyBob2xkaW5nLCB3aXRob3V0IGEgcmVidWlsZDpcbiAqXG4gKiAgID9saWdodGluZz1sZWdhY3kgICBldmVyeSBsYW5kbWFyayBiYWNrIHRvIGl0cyBhdXRob3JlZCBzZWxmLWxpdCBlbWlzc2l2ZSAodGhlIHByZS0yMDI2LTA5LTA1XG4gKiAgICAgICAgICAgICAgICAgICAgICByZW5kZXIpIGFuZCBiYWNrIHRvIERvdWJsZVNpZGUg4oCUIHRoZSBBL0IsIGFuZCB0aGUgc2hhcGUgb2YgdGhlIFJFVkVSVFxuICogICA/bG1lbWlzc2l2ZT08bj4gICAgZm9yY2Ugb25lIHdob2xlLWJvZHkgZW1pc3NpdmUgaW50ZW5zaXR5IG9uIGV2ZXJ5IG1vdW50ICh0aGUgc3dlZXApXG4gKiAgID9sbWN1bGw9b2ZmICAgICAgICBrZWVwIERvdWJsZVNpZGUgb24gdmVyaWZpZWQtY2xvc2VkIGJvZGllcyAoaXNvbGF0ZXMgdGhlIGN1bGxpbmcgZnJvbSB0aGUgcGFpbnQpXG4gKlxuICogUmVhZCBmcm9tIHRoZSBsaXZlIHNlYXJjaCBzdHJpbmcgcmF0aGVyIHRoYW4gY2FjaGVkIGF0IG1vZHVsZSBsb2FkIHNvIGEgaGFybmVzcyBjYW4gbmF2aWdhdGVcbiAqIGJldHdlZW4gYXJtczsgdGhlIHBhcnNlIGlzIG9uY2UgcGVyIGJvZHkgaW5zdGFsbCwgbm90IHBlciBmcmFtZS5cbiAqL1xudHlwZSBMaWdodGluZ0RpYWxzID0geyBtb2RlOiAnY2FsaWJyYXRlZCcgfCAnbGVnYWN5JzsgZW1pc3NpdmU6IG51bWJlciB8IHVuZGVmaW5lZDsgY3VsbDogYm9vbGVhbiB9O1xuXG5mdW5jdGlvbiBsaWdodGluZ0RpYWxzKCk6IExpZ2h0aW5nRGlhbHMge1xuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiB7IG1vZGU6ICdjYWxpYnJhdGVkJywgZW1pc3NpdmU6IHVuZGVmaW5lZCwgY3VsbDogdHJ1ZSB9O1xuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuICBjb25zdCBlbWlzc2l2ZSA9IE51bWJlcihwYXJhbXMuZ2V0KCdsbWVtaXNzaXZlJykpO1xuICByZXR1cm4ge1xuICAgIG1vZGU6IHBhcmFtcy5nZXQoJ2xpZ2h0aW5nJykgPT09ICdsZWdhY3knID8gJ2xlZ2FjeScgOiAnY2FsaWJyYXRlZCcsXG4gICAgZW1pc3NpdmU6IHBhcmFtcy5oYXMoJ2xtZW1pc3NpdmUnKSAmJiBOdW1iZXIuaXNGaW5pdGUoZW1pc3NpdmUpICYmIGVtaXNzaXZlID49IDAgPyBlbWlzc2l2ZSA6IHVuZGVmaW5lZCxcbiAgICBjdWxsOiBwYXJhbXMuZ2V0KCdsbWN1bGwnKSAhPT0gJ29mZicgJiYgcGFyYW1zLmdldCgnbGlnaHRpbmcnKSAhPT0gJ2xlZ2FjeScsXG4gIH07XG59XG5cbi8qKlxuICogRi1BU1RSQS05LCBUSEUgQ1VMTElORy4gQXN0cmE6IFwiQWxsIDQ0MyBtYXRlcmlhbCByZWNvcmRzIHNjYW5uZWQgaW4gcGlsb3QgR0xCcyB3ZXJlIGRvdWJsZS1zaWRlZC5cbiAqIFRoYXQgaXMganVzdGlmaWVkIGZvciBzb21lIHNoZWV0cyBhbmQgcGFub3JhbWFzLCBidXQgdW5uZWNlc3NhcnkgZm9yIG1hbnkgY2xvc2VkIGJ1aWxkaW5ncy4uLlxuICogRW5hYmxlIGJhY2tmYWNlIGN1bGxpbmcgb24gdmVyaWZpZWQgY2xvc2VkIG1lc2hlcywgbm90IHRocm91Z2ggYSBnbG9iYWwgdG9nZ2xlLlwiXG4gKlxuICogVkVSSUZJRUQgbWVhbnMgdHdvIGNvbmRpdGlvbnMsIGJvdGggbWVhc3VyZWQgb24gdGhlIGdlb21ldHJ5IHRoYXQgYWN0dWFsbHkgbG9hZGVkOlxuICogIDEuIGV2ZXJ5IHVuZGlyZWN0ZWQgZWRnZSBpcyBzaGFyZWQgYnkgZXhhY3RseSB0d28gdHJpYW5nbGVzIOKAlCB3ZWxkZWQgYnkgUE9TSVRJT04sIGJlY2F1c2UgYSBHTEJcbiAqICAgICBzcGxpdHMgdmVydGljZXMgYXQgVVYgYW5kIG5vcm1hbCBzZWFtcywgc28gcmF3IGluZGljZXMgd291bGQgY2FsbCBldmVyeSBzZWFtIGFuIG9wZW4gZWRnZSBhbmRcbiAqICAgICBubyBib2R5IHdvdWxkIGV2ZXIgcXVhbGlmeTtcbiAqICAyLiB0aGUgc2lnbmVkIHZvbHVtZSBpcyBwb3NpdGl2ZSwgaS5lLiB0aGUgd2luZGluZyByZWFsbHkgaXMgb3V0d2FyZC4gQSBjbG9zZWQgc2hlbGwgd2l0aFxuICogICAgIGludmVydGVkIHdpbmRpbmcgd291bGQgVkFOSVNIIHVuZGVyIEZyb250U2lkZSwgd2hpY2ggaXMgZXhhY3RseSB0aGUgZmFpbHVyZSBtb2RlIGEgZ2xvYmFsXG4gKiAgICAgdG9nZ2xlIHByb2R1Y2VzIGFuZCB0aGUgcmVhc29uIHRoaXMgaXMgYSBwZXItbWVzaCB2ZXJkaWN0LlxuICpcbiAqIEEgbWF0ZXJpYWwgaXMgb25seSBjdWxsZWQgd2hlbiBFVkVSWSBtZXNoIHRoYXQgc2hhcmVzIGl0IHBhc3NlZCDigJQgR0xCIG1hdGVyaWFscyBhcmUgc2hhcmVkXG4gKiBpbnN0YW5jZXMgdGhhdCBzdXJ2aXZlIGEgcmUtaW5zdGFsbCwgc28gb25lIHNoZWV0IGluIGEgcGFjayBrZWVwcyB0aGUgd2hvbGUgbWF0ZXJpYWwgZG91YmxlLXNpZGVkLlxuICogVGhlIG9yaWdpbmFsIHNpZGUgaXMgYmFua2VkIG9uIHRoZSBtYXRlcmlhbCBzbyBgP2xpZ2h0aW5nPWxlZ2FjeWAgYW5kIGEgcmUtaW5zdGFsbCByZXN0b3JlIGl0LlxuICovXG50eXBlIE1lc2hDbG9zdXJlID0geyBjbG9zZWQ6IGJvb2xlYW47IHJlYXNvbjogJ2Nsb3NlZCcgfCAnb3Blbi1lZGdlcycgfCAnaW52ZXJ0ZWQtd2luZGluZycgfCAnbm8taW5kZXgtb3ItcG9zaXRpb24nIH07XG5cbmZ1bmN0aW9uIGNsYXNzaWZ5TWVzaENsb3N1cmUoZ2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KTogTWVzaENsb3N1cmUge1xuICBjb25zdCBjYWNoZWQgPSBnZW9tZXRyeS51c2VyRGF0YS5sYW5kbWFya0Nsb3N1cmUgYXMgTWVzaENsb3N1cmUgfCB1bmRlZmluZWQ7XG4gIGlmIChjYWNoZWQpIHJldHVybiBjYWNoZWQ7XG4gIGNvbnN0IHZlcmRpY3QgPSAoKCk6IE1lc2hDbG9zdXJlID0+IHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKTtcbiAgICBpZiAoIXBvc2l0aW9uKSByZXR1cm4geyBjbG9zZWQ6IGZhbHNlLCByZWFzb246ICduby1pbmRleC1vci1wb3NpdGlvbicgfTtcbiAgICBjb25zdCBjb3VudCA9IGdlb21ldHJ5LmluZGV4Py5jb3VudCA/PyBwb3NpdGlvbi5jb3VudDtcbiAgICBpZiAoY291bnQgPCAzIHx8IGNvdW50ICUgMyAhPT0gMCkgcmV0dXJuIHsgY2xvc2VkOiBmYWxzZSwgcmVhc29uOiAnbm8taW5kZXgtb3ItcG9zaXRpb24nIH07XG4gICAgLy8gV2VsZCBieSBxdWFudGlzZWQgcG9zaXRpb246IDFlLTQgaXMgZmFyIGJlbG93IHRoZSBzbWFsbGVzdCBmZWF0dXJlIGluIHRoZXNlIGJvZGllcyAobWV0cmVzKVxuICAgIC8vIGFuZCBmYXIgYWJvdmUgZmxvYXQzMiBub2lzZSBvbiBhIDY0IG0gbWFwLlxuICAgIGNvbnN0IHdlbGQgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICAgIGNvbnN0IHdlbGRlZCA9IG5ldyBJbnQzMkFycmF5KHBvc2l0aW9uLmNvdW50KTtcbiAgICBjb25zdCBwb2ludHM6IG51bWJlcltdID0gW107XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBvc2l0aW9uLmNvdW50OyBpbmRleCArPSAxKSB7XG4gICAgICBjb25zdCB4ID0gcG9zaXRpb24uZ2V0WChpbmRleCk7XG4gICAgICBjb25zdCB5ID0gcG9zaXRpb24uZ2V0WShpbmRleCk7XG4gICAgICBjb25zdCB6ID0gcG9zaXRpb24uZ2V0WihpbmRleCk7XG4gICAgICBjb25zdCBrZXkgPSBgJHtNYXRoLnJvdW5kKHggKiAxZTQpfSwke01hdGgucm91bmQoeSAqIDFlNCl9LCR7TWF0aC5yb3VuZCh6ICogMWU0KX1gO1xuICAgICAgbGV0IGlkID0gd2VsZC5nZXQoa2V5KTtcbiAgICAgIGlmIChpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlkID0gcG9pbnRzLmxlbmd0aCAvIDM7XG4gICAgICAgIHdlbGQuc2V0KGtleSwgaWQpO1xuICAgICAgICBwb2ludHMucHVzaCh4LCB5LCB6KTtcbiAgICAgIH1cbiAgICAgIHdlbGRlZFtpbmRleF0gPSBpZDtcbiAgICB9XG4gICAgY29uc3QgYXQgPSAoc2xvdDogbnVtYmVyKTogbnVtYmVyID0+IHdlbGRlZFtnZW9tZXRyeS5pbmRleCA/IGdlb21ldHJ5LmluZGV4LmdldFgoc2xvdCkgOiBzbG90XSE7XG4gICAgY29uc3QgZWRnZXMgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyPigpO1xuICAgIGNvbnN0IHZlcnRleENvdW50ID0gcG9pbnRzLmxlbmd0aCAvIDM7XG4gICAgbGV0IHZvbHVtZSA9IDA7XG4gICAgZm9yIChsZXQgc2xvdCA9IDA7IHNsb3QgPCBjb3VudDsgc2xvdCArPSAzKSB7XG4gICAgICBjb25zdCBhID0gYXQoc2xvdCk7XG4gICAgICBjb25zdCBiID0gYXQoc2xvdCArIDEpO1xuICAgICAgY29uc3QgYyA9IGF0KHNsb3QgKyAyKTtcbiAgICAgIGlmIChhID09PSBiIHx8IGIgPT09IGMgfHwgYSA9PT0gYykgY29udGludWU7IC8vIGEgZGVnZW5lcmF0ZSB0cmlhbmdsZSBoYXMgbm8gc3VyZmFjZSB0byBmYWNlXG4gICAgICBmb3IgKGNvbnN0IFtmcm9tLCB0b10gb2YgW1thLCBiXSwgW2IsIGNdLCBbYywgYV1dIGFzIGNvbnN0KSB7XG4gICAgICAgIGNvbnN0IGtleSA9IE1hdGgubWluKGZyb20sIHRvKSAqIHZlcnRleENvdW50ICsgTWF0aC5tYXgoZnJvbSwgdG8pO1xuICAgICAgICBlZGdlcy5zZXQoa2V5LCAoZWRnZXMuZ2V0KGtleSkgPz8gMCkgKyAxKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGF4ID0gcG9pbnRzW2EgKiAzXSEsIGF5ID0gcG9pbnRzW2EgKiAzICsgMV0hLCBheiA9IHBvaW50c1thICogMyArIDJdITtcbiAgICAgIGNvbnN0IGJ4ID0gcG9pbnRzW2IgKiAzXSEsIGJ5ID0gcG9pbnRzW2IgKiAzICsgMV0hLCBieiA9IHBvaW50c1tiICogMyArIDJdITtcbiAgICAgIGNvbnN0IGN4ID0gcG9pbnRzW2MgKiAzXSEsIGN5ID0gcG9pbnRzW2MgKiAzICsgMV0hLCBjeiA9IHBvaW50c1tjICogMyArIDJdITtcbiAgICAgIHZvbHVtZSArPSAoYXggKiAoYnkgKiBjeiAtIGJ6ICogY3kpIC0gYXkgKiAoYnggKiBjeiAtIGJ6ICogY3gpICsgYXogKiAoYnggKiBjeSAtIGJ5ICogY3gpKSAvIDY7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc2hhcmVkIG9mIGVkZ2VzLnZhbHVlcygpKSBpZiAoc2hhcmVkICE9PSAyKSByZXR1cm4geyBjbG9zZWQ6IGZhbHNlLCByZWFzb246ICdvcGVuLWVkZ2VzJyB9O1xuICAgIGlmICh2b2x1bWUgPD0gMCkgcmV0dXJuIHsgY2xvc2VkOiBmYWxzZSwgcmVhc29uOiAnaW52ZXJ0ZWQtd2luZGluZycgfTtcbiAgICByZXR1cm4geyBjbG9zZWQ6IHRydWUsIHJlYXNvbjogJ2Nsb3NlZCcgfTtcbiAgfSkoKTtcbiAgZ2VvbWV0cnkudXNlckRhdGEubGFuZG1hcmtDbG9zdXJlID0gdmVyZGljdDtcbiAgcmV0dXJuIHZlcmRpY3Q7XG59XG5cbnR5cGUgQ2xvc3VyZUNlbnN1cyA9IHsgaWQ6IHN0cmluZzsgbWVzaGVzOiBudW1iZXI7IGNsb3NlZDogbnVtYmVyOyBvcGVuOiBudW1iZXI7IGN1bGxlZDogbnVtYmVyOyBkb3VibGVTaWRlZDogbnVtYmVyOyByZWFzb25zOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+IH07XG5cbmZ1bmN0aW9uIGN1bGxWZXJpZmllZENsb3NlZE1lc2hlcyhtb2RlbDogVEhSRUUuT2JqZWN0M0QsIG1vdW50SWQ6IHN0cmluZyk6IENsb3N1cmVDZW5zdXMge1xuICBjb25zdCBjZW5zdXM6IENsb3N1cmVDZW5zdXMgPSB7IGlkOiBtb3VudElkLCBtZXNoZXM6IDAsIGNsb3NlZDogMCwgb3BlbjogMCwgY3VsbGVkOiAwLCBkb3VibGVTaWRlZDogMCwgcmVhc29uczoge30gfTtcbiAgY29uc3QgdmVyZGljdFBlck1hdGVyaWFsID0gbmV3IE1hcDxUSFJFRS5NYXRlcmlhbCwgYm9vbGVhbj4oKTtcbiAgbW9kZWwudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoO1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgbWVzaC51c2VyRGF0YS5sYW5kbWFya0NvbnRhY3RTaGFkb3cpIHJldHVybjtcbiAgICBjb25zdCBjbG9zdXJlID0gY2xhc3NpZnlNZXNoQ2xvc3VyZShtZXNoLmdlb21ldHJ5KTtcbiAgICBjZW5zdXMubWVzaGVzICs9IDE7XG4gICAgY2Vuc3VzW2Nsb3N1cmUuY2xvc2VkID8gJ2Nsb3NlZCcgOiAnb3BlbiddICs9IDE7XG4gICAgY2Vuc3VzLnJlYXNvbnNbY2xvc3VyZS5yZWFzb25dID0gKGNlbnN1cy5yZWFzb25zW2Nsb3N1cmUucmVhc29uXSA/PyAwKSArIDE7XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkge1xuICAgICAgdmVyZGljdFBlck1hdGVyaWFsLnNldChtYXRlcmlhbCwgKHZlcmRpY3RQZXJNYXRlcmlhbC5nZXQobWF0ZXJpYWwpID8/IHRydWUpICYmIGNsb3N1cmUuY2xvc2VkKTtcbiAgICB9XG4gIH0pO1xuICBjb25zdCBjdWxsID0gbGlnaHRpbmdEaWFscygpLmN1bGw7XG4gIGZvciAoY29uc3QgW21hdGVyaWFsLCBjbG9zZWRdIG9mIHZlcmRpY3RQZXJNYXRlcmlhbCkge1xuICAgIGNvbnN0IGJhbmtlZCA9IG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrQmFzZVNpZGUgYXMgVEhSRUUuU2lkZSB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBvcmlnaW5hbCA9IGJhbmtlZCA/PyBtYXRlcmlhbC5zaWRlO1xuICAgIG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrQmFzZVNpZGUgPSBvcmlnaW5hbDtcbiAgICBjb25zdCBuZXh0ID0gY2xvc2VkICYmIGN1bGwgPyBUSFJFRS5Gcm9udFNpZGUgOiBvcmlnaW5hbDtcbiAgICBpZiAobWF0ZXJpYWwuc2lkZSAhPT0gbmV4dCkge1xuICAgICAgbWF0ZXJpYWwuc2lkZSA9IG5leHQ7XG4gICAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBUSFJFRS5Gcm9udFNpZGUpIGNlbnN1cy5jdWxsZWQgKz0gMTtcbiAgICBlbHNlIGNlbnN1cy5kb3VibGVTaWRlZCArPSAxO1xuICB9XG4gIHJldHVybiBjZW5zdXM7XG59XG5cbmZ1bmN0aW9uIGRyZXNzTGFuZG1hcmsobW9kZWw6IFRIUkVFLk9iamVjdDNELCBjb250cmFjdElkOiBzdHJpbmcsIG1vdW50SWQ6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoY29udHJhY3RJZCA9PT0gJ2U0LWJvbmV5YXJkJykgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCBtZXNoLm1hdGVyaWFsLm5hbWUgIT09ICdCb25leWFyZERyaWZ0RWFydGgnKSByZXR1cm47XG4gICAgLy8gVW50ZXh0dXJlZCBidXJpYWwgc29pbCBmb2xsb3dzIHRoZSBlYXJ0aCdzIGxpZ2h0LCBub3QgdGhlIG1hY2hpbmVyeSdzIHBhaW50LlxuICAgIG1lc2gubWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkgPSAwO1xuICB9KTtcbiAgaWYgKGNvbnRyYWN0SWQgPT09ICdlMTAtZW1iZXItc2hvcmUnICYmIG1vdW50SWQgPT09ICdsYXN0LXdhcm0tdmVudC1hbHRhcicpIHtcbiAgICBjb25zdCBsYW1wID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMC42ODQsIDAuNjg0LCAwLjk2LCAxNiksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweGZmYjQzOCB9KSk7XG4gICAgbGFtcC5uYW1lID0gJ2xhc3Qtd2FybS12ZW50LWFsdGFyLkFtYmVyV2luZG93JztcbiAgICBsYW1wLnBvc2l0aW9uLnkgPSAxLjk5O1xuICAgIGxhbXAudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgbW9kZWwuYWRkKGxhbXApO1xuICB9XG4gIGlmIChjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyAmJiBtb3VudElkID09PSAnd2VzdC12ZWluLWNvb2xpbmctbWFya2VyJykge1xuICAgIGNvbnN0IHNsaXQgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxLjg2LCAwLjIwKSwgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4NThhOWEwIH0pKTtcbiAgICBzbGl0Lm5hbWUgPSAnd2VzdC12ZWluLWNvb2xpbmctbWFya2VyLkdsYXNzU2xpdCc7XG4gICAgc2xpdC5wb3NpdGlvbi5zZXQoMCwgMS4yMSwgMC44ODYpO1xuICAgIHNsaXQudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgbW9kZWwuYWRkKHNsaXQpO1xuICB9XG4gIGNvbnN0IGRyZXNzaW5nID0gQ09OVFJBQ1RfTEFORE1BUktfRFJFU1NJTkdbY29udHJhY3RJZF0/Llttb3VudElkXTtcbiAgaWYgKCFkcmVzc2luZykgcmV0dXJuO1xuICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgfHwgIW1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgcmV0dXJuO1xuICAgIC8vIGtlZXBMYW5kbWFya1BhaW50UmVhZGFibGUgZHJpdmVzIHRoZXNlIGJvZGllcyBhbG1vc3QgZW50aXJlbHkgb2ZmIGVtaXNzaXZlIChtYXAgKyBpbnRlbnNpdHlcbiAgICAvLyAzKSwgc28gdGhlIGVtaXNzaXZlIGNvbG91ciDigJQgbm90IHRoZSBkaWZmdXNlIOKAlCBpcyB0aGUgbGV2ZXIgdGhhdCBhY3R1YWxseSBncmFkZXMgdGhlbS5cbiAgICBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldFJHQiguLi5kcmVzc2luZy5lbWlzc2l2ZSwgVEhSRUUuTGluZWFyU1JHQkNvbG9yU3BhY2UpO1xuICAgIG1lc2gubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbiAgaWYgKCFkcmVzc2luZy5sYW1wKSByZXR1cm47XG4gIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gIGNvbnN0IGxhbXAgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShkcmVzc2luZy5sYW1wLndpZHRoLCBkcmVzc2luZy5sYW1wLmhlaWdodCksXG4gICAgLy8gT3BhcXVlIGFuZCBkZXB0aC13cml0aW5nIG9uIHB1cnBvc2U6IGUyZS9sYW5kbWFyay1icmlnaHRuZXNzLnNwZWMudHMgYW5kIHRoZSBjZW5zdXMgYm90aFxuICAgIC8vIGFzc2VydCB0aGF0IG5vIGxhbmRtYXJrIG1hdGVyaWFsIGlzIHRyYW5zcGFyZW50IG9yIHNraXBzIGRlcHRoIHdyaXRlLiBBIGxpdCB3aW5kb3cgZG9lc1xuICAgIC8vIG5vdCBuZWVkIHRvIGJlIGVpdGhlciDigJQgaXQgaXMgdW5saXQgcGFpbnQgdGhhdCBvdXRzaGluZXMgdGhlIHdhbGwgaXQgc2l0cyBvbi5cbiAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogTEFNUF9DT0xPVVIgfSksXG4gICk7XG4gIGxhbXAubmFtZSA9IGAke21vdW50SWR9LkxhbXBgO1xuICBsYW1wLnBvc2l0aW9uLnNldChcbiAgICBUSFJFRS5NYXRoVXRpbHMubGVycChib3gubWluLngsIGJveC5tYXgueCwgZHJlc3NpbmcubGFtcC5hY3Jvc3NYKSAtIG1vZGVsLnBvc2l0aW9uLngsXG4gICAgVEhSRUUuTWF0aFV0aWxzLmxlcnAoYm94Lm1pbi55LCBib3gubWF4LnksIGRyZXNzaW5nLmxhbXAudXBZKSAtIG1vZGVsLnBvc2l0aW9uLnksXG4gICAgYm94Lm1heC56IC0gbW9kZWwucG9zaXRpb24ueiArIDAuMDMsXG4gICk7XG4gIGxhbXAudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gIG1vZGVsLmFkZChsYW1wKTtcbn1cblxuLyoqXG4gKiBDQUxMIFRISVMgT05DRSBQRVIgQk9EWS4gRi1CSE0tMSAoZm91bmQgYnkgdGhpcyBzaGlmdCwgMjAyNi0wOC0wNCk6IGJldHdlZW4gYGQ2NzA5NWViYCDigJQgdGhlXG4gKiBiYXJvbiBkcmFpbiwgd2hvc2UgbWVyZ2UgcmVzb2x1dGlvbiBrZXB0IGJvdGggdGhlIG5ldyBwZXItY29udHJhY3QgYmxvY2sgYW5kIHRoZSBvbGQgc2luZ2xlLWxpbmVcbiAqIGNhbGwgaXQgcmVwbGFjZWQg4oCUIGFuZCB0aGlzIGNvbW1pdCwgdGhlIHBpbG90IGNhbGxlZCBpdCBUV0lDRSwgdGhlIHNlY29uZCB0aW1lIHdpdGggdGhlIGRlZmF1bHRcbiAqIHBhaW50LiBFdmVyeSBwZXItY29udHJhY3QgaW50ZW5zaXR5IG9uIG1haW4gd2FzIHRoZXJlZm9yZSBzaWxlbnRseSByZXNldCB0byAzOiB0aGUtY2xhaW0ncyAxLjQ1XG4gKiAoc2hpcHBlZCBgMjJmZDJmZDdgKSwgdGhlIGJhcm9uJ3MgMS43LzEuOS8yLjEvMy40IEFORCBpdHMgZW1pc3NpdmUgZ3JhZGUsIGFuZCBkcnkgZ3VsY2gnc1xuICogaXNvbGF0ZWRfc3ByaW5nIDIuMS4gVGhyZWUgc2lnbmVkLW9mZiB1cGdyYWRlcyB3ZXJlIGRlZmVhdGVkIGFuZCBldmVyeSBnYXRlIHN0YXllZCBncmVlbiwgYmVjYXVzZVxuICogdGhlIGRhdGFzZXQgcHVibGlzaGVkIHRoZSBUQUJMRSdzIG51bWJlciByYXRoZXIgdGhhbiB0aGUgbWF0ZXJpYWwncy4gSXQgbm93IHB1Ymxpc2hlcyB0aGVcbiAqIG1hdGVyaWFsJ3MgKHNlZSB0ZXJyYWluM2RQaWxvdExhbmRtYXJrTWF0ZXJpYWxzKS5cbiAqL1xuZnVuY3Rpb24ga2VlcExhbmRtYXJrUGFpbnRSZWFkYWJsZShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHBhaW50OiBMYW5kbWFya1BhaW50ID0gREVGQVVMVF9MQU5ETUFSS19QQUlOVCwgY29udHJhY3RJZCA9ICcnKTogdm9pZCB7XG4gIC8vIEFuIHVudGludGVkIGJvZHkgbXVzdCBub3QgZXZlbiByb3VuZC10cmlwIGl0cyBjb2xvdXIgdGhyb3VnaCBnZXRIZXgvc2V0SGV4IOKAlFxuICAvLyB0aGF0IHF1YW50aXNlcyB0byA4IGJpdHMgcGVyIGNoYW5uZWwsIGFuZCBldmVyeSBtYXAgZXhjZXB0IGUxLWJhcm9uIGlzXG4gIC8vIHN1cHBvc2VkIHRvIGNvbWUgb3V0IG9mIGhlcmUgYnl0ZS1pZGVudGljYWwgdG8gYmVmb3JlIHRoaXMgc2VhbSBleGlzdGVkLlxuICBjb25zdCB0aW50ID0gcGFpbnQudGludCA9PT0gREVGQVVMVF9MQU5ETUFSS19QQUlOVC50aW50ID8gbnVsbCA6IG5ldyBUSFJFRS5Db2xvcihwYWludC50aW50KTtcbiAgbW9kZWwudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgfHwgIW1lc2gubWF0ZXJpYWwubWFwKSByZXR1cm47XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsO1xuICAgIGlmICh0aW50KSB7XG4gICAgICAvLyBHTEIgbWF0ZXJpYWxzIGFyZSBzaGFyZWQgaW5zdGFuY2VzIHRoYXQgc3Vydml2ZSBhIHJlLWluc3RhbGwsIHNvIHRoZVxuICAgICAgLy8gYmFzZSBjb2xvdXIgaXMgYmFua2VkIG9uY2Ug4oCUIHRpbnRpbmcgYSB0aW50ZWQgbWF0ZXJpYWwgd291bGQgY29tcG91bmQuXG4gICAgICBjb25zdCBiYW5rZWQgPSBtYXRlcmlhbC51c2VyRGF0YS5sYW5kbWFya0Jhc2VDb2xvciBhcyBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBiYXNlID0gYmFua2VkID8/IG1hdGVyaWFsLmNvbG9yLmdldEhleCgpO1xuICAgICAgbWF0ZXJpYWwudXNlckRhdGEubGFuZG1hcmtCYXNlQ29sb3IgPSBiYXNlO1xuICAgICAgbWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGJhc2UpLm11bHRpcGx5KHRpbnQpO1xuICAgIH1cbiAgICBtYXRlcmlhbC5lbWlzc2l2ZS5zZXQocGFpbnQudGludCk7XG4gICAgbWF0ZXJpYWwuZW1pc3NpdmVNYXAgPSBtYXRlcmlhbC5tYXA7XG4gICAgLy8gVGhlIGF1dGhvcmVkIG51bWJlciBpcyBiYW5rZWQgc28gdGhlIGRhdGFzZXQgY2FuIHB1Ymxpc2ggQk9USCDigJQgdGhlIGdyYWRlIHRoZSBiZWF1dHkgc2hpZnRcbiAgICAvLyB3cm90ZSBhbmQgdGhlIGxpdCB2YWx1ZSBpdCByZW5kZXJzIGF0IOKAlCBhbmQgc28gYD9saWdodGluZz1sZWdhY3lgIHJlc3RvcmVzIHRoZSBleGFjdFxuICAgIC8vIHByZS1jYWxpYnJhdGlvbiByZW5kZXIgZnJvbSBhIG1hdGVyaWFsIHRoYXQgbWF5IGFscmVhZHkgaGF2ZSBiZWVuIHJlLWluc3RhbGxlZCBvbmNlLlxuICAgIG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrQXV0aG9yZWRFbWlzc2l2ZSA9IHBhaW50LmludGVuc2l0eTtcbiAgICBtYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IGNhbGlicmF0ZWRMYW5kbWFya0ludGVuc2l0eShwYWludC5pbnRlbnNpdHkpO1xuICAgIGlmICgoY29udHJhY3RJZCA9PT0gJ2UyLXByZXNzdXJlLWdhcmRlbicgfHwgY29udHJhY3RJZCA9PT0gJ2U2LWdsb3ctbWVzYScgfHwgY29udHJhY3RJZCA9PT0gJ2U2LXBpY25pYycgfHwgY29udHJhY3RJZCA9PT0gJ2U3LWRlYWQtYmFuZCcgfHwgY29udHJhY3RJZCA9PT0gJ2U3LXJlbGF5LXJ1c2gnIHx8IGNvbnRyYWN0SWQgPT09ICdlOC1mYXItc2lkZScgfHwgY29udHJhY3RJZCA9PT0gJ2U4LWxvdy1vcmJpdCcgfHwgY29udHJhY3RJZCA9PT0gJ2U5LWRvbWUtYmFzaW4nIHx8IGNvbnRyYWN0SWQgPT09ICdlOS1zZWVkLXJ1bicgfHwgY29udHJhY3RJZCA9PT0gJ2U5LWRldmlscy1hbGxleScgfHwgY29udHJhY3RJZCA9PT0gJ2U5LW9sZC1jYW5hbCcgfHwgY29udHJhY3RJZCA9PT0gJ2UxMC1sYXN0LWNsYWltJyB8fCBjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyB8fCBjb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnKSAmJiAhbWF0ZXJpYWwudXNlckRhdGEubGFuZG1hcmtEaWZmdXNlR3JhZGUpIHtcbiAgICAgIG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrRGlmZnVzZUdyYWRlID0gdHJ1ZTtcbiAgICAgIC8vIFJlY292ZXIgdGhlIGF0bGFzJ3MgZGFyayBpcm9uIGRldGFpbCBpbiBpdHMgZGlmZnVzZSBwYWludCwgc28gdGhlIGJvZHkgY2FuXG4gICAgICAvLyBsZWF2ZSB0aGUgbGVnYWN5LWVtaXNzaW9uIGV4ZW1wdGlvbiB3aXRob3V0IHR1cm5pbmcgaXRzIHRleHR1cmUgaW50byBhIGxhbXAuXG4gICAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5kaWZmdXNlQ29sb3IucmdiID0gbWluKHZlYzMoMC44OCksIHBvdyhtYXgoZGlmZnVzZUNvbG9yLnJnYiwgdmVjMygwLjApKSwgdmVjMygwLjYyKSkgKiB2ZWMzKDAuOTQsIDAuOTksIDEuMDYpICsgdmVjMygwLjAxNCkpO2ApO1xuICAgICAgfTtcbiAgICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdsYW5kbWFyay1kaWZmdXNlLWlyb24tdjEnO1xuICAgICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVTMg4oCUIHNvZnQgY29udGFjdCBlbGxpcHNlcyB1bmRlciB0aGUgbW91bnRlZCBsYW5kbWFya3MuXG4gKlxuICogTGFuZG1hcmtzIGFyZSBtb3VudGVkIHdpdGggY2FzdFNoYWRvdyBvZmYsIHNvIGEgbGl0IGJvZHkgaGFzIG5vdGhpbmcgdHlpbmcgaXQgdG9cbiAqIHRoZSBncm91bmQuIE9uZSBpbnN0YW5jZWQgcXVhZCBwZXIgbW91bnQsIHNpemVkIGZyb20gdGhlIG1vZGVsJ3Mgb3duIGZvb3RwcmludCxcbiAqIHVzaW5nIHRoZSBzaGlwcGVkIGJsb2Itc2hhZG93IHJlY2lwZSAoTGlnaHRSaWcgU3ByaXRlQmxvYlNoYWRvd3M6ICMyZTFiMGUgYXQgMC4xNyxcbiAqIGRlcHRoV3JpdGUgb2ZmLCBwb2x5Z29uLW9mZnNldCwgbGFpZCBmbGF0IGp1c3QgYWJvdmUgdGhlIHRlcnJhaW4pLlxuICpcbiAqIERlbGliZXJhdGVseSBOT1QgYSBjaGlsZCBvZiBUZXJyYWluM2RMYW5kbWFya3M6IHRoYXQgZ3JvdXAncyBjaGlsZHJlbiBhcmUgY291bnRlZFxuICogYXMgbGFuZG1hcmtzIGFuZCB0aGVpciBtYXRlcmlhbHMgYXJlIGF1ZGl0ZWQgZm9yIHRyYW5zcGFyZW5jeSBieSB0aGUgbWFwIGNlbnN1cyxcbiAqIHNvIGEgc2hhZG93IHBhcmVudGVkIHRoZXJlIHdvdWxkIHJlYWQgYXMgYSBzaXh0aCBsYW5kbWFyayB3aXRoIGFuIHVubGl0IG1hdGVyaWFsLlxuICovXG5mdW5jdGlvbiBtb3VudExhbmRtYXJrQ29udGFjdHMoXG4gIGhvc3Q6IEhvc3QsXG4gIG1vdW50czogQXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgd2F0ZXJZOiBudW1iZXIgfCB1bmRlZmluZWQsXG4gIGJvdW5kczogVEhSRUUuQm94Myxcbik6IFRIUkVFLkluc3RhbmNlZE1lc2ggfCB1bmRlZmluZWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFMQU5ETUFSS19DT05UQUNUX0NPTlRSQUNUUy5oYXMoaG9zdC5jb250cmFjdElkKSB8fCAhbW91bnRzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoMSwgMjQpO1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgY29sb3I6ICcjMmUxYjBlJyxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiAwLjE3LFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIHBvbHlnb25PZmZzZXQ6IHRydWUsXG4gICAgcG9seWdvbk9mZnNldEZhY3RvcjogLTEsXG4gICAgcG9seWdvbk9mZnNldFVuaXRzOiAtMSxcbiAgfSk7XG4gIGNvbnN0IGNvbnRhY3RzID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goZ2VvbWV0cnksIG1hdGVyaWFsLCBtb3VudHMubGVuZ3RoKTtcbiAgY29udGFjdHMubmFtZSA9ICdUZXJyYWluM2RMYW5kbWFya0NvbnRhY3RzJztcbiAgY29udGFjdHMudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gIGNvbnRhY3RzLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgY29udGFjdHMucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kU2hhZG93cztcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgY29uc3Qgc2l6ZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIGNvbnN0IHBsYWNlciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAvLyBMZWFuIHRoZSBwb29sIHRoZSB3YXkgdGhlIGtleSBsaWdodCB0aHJvd3MgaXQsIG9yIGEgc2hhZG93IGNlbnRyZWQgdW5kZXIgYSBzb2xpZFxuICAvLyBidWlsZGluZyBpcyBzaW1wbHkgY292ZXJlZCBieSB0aGUgYnVpbGRpbmcgYW5kIG5ldmVyIHJlYWRzLlxuICBjb25zdCBsZWFuID0gbGVkZ2VyU3VuU2hhZG93RGlyZWN0aW9uKCk7XG4gIGxldCB3cml0dGVuID0gMDtcbiAgY29uc3QgY29sbGFyZWQgPSBuZXcgU2V0KChTQ1VMUFRfV0FURVJfRFJFU1NJTkdbaG9zdC5jb250cmFjdElkXT8uY29sbGFycyA/PyBbXSkubWFwKCh7IG1vdW50IH0pID0+IG1vdW50KSk7XG4gIGZvciAoY29uc3QgeyBpZCwgbW9kZWwgfSBvZiBtb3VudHMpIHtcbiAgICBib3guc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gICAgYm94LmdldFNpemUoc2l6ZSk7XG4gICAgaWYgKFxuICAgICAgbW9kZWwucG9zaXRpb24ueCA8IGJvdW5kcy5taW4ueCB8fCBtb2RlbC5wb3NpdGlvbi54ID4gYm91bmRzLm1heC54IHx8XG4gICAgICBtb2RlbC5wb3NpdGlvbi56IDwgYm91bmRzLm1pbi56IHx8IG1vZGVsLnBvc2l0aW9uLnogPiBib3VuZHMubWF4LnogfHxcbiAgICAgIGNvbGxhcmVkLmhhcyhpZClcbiAgICApIGNvbnRpbnVlO1xuICAgIGNvbnN0IGdyb3VuZCA9IGhlaWdodEF0KG1vZGVsLnBvc2l0aW9uLngsIG1vZGVsLnBvc2l0aW9uLnopO1xuICAgIC8vIE5vIGNvbnRhY3Qgc2hhZG93IG9uIGEgYm9keSBzdGFuZGluZyBpbiB3YXRlcjogdGhlIHJpcGFyaWFuIHBhY2sgc2l0cyBpbiB0aGVcbiAgICAvLyBjaGFubmVsLCBhbmQgYSBoYXJkIGVsbGlwc2UgdW5kZXIgdGhlIHN1cmZhY2UgcmVhZHMgYXMgYSBob2xlLCBub3QgYSBzaGFkb3cuXG4gICAgaWYgKHdhdGVyWSAhPT0gdW5kZWZpbmVkICYmIGdyb3VuZCA8IHdhdGVyWSkgY29udGludWU7XG4gICAgY29uc3QgdGhyb3dMZW5ndGggPSBzaXplLnkgKiBMQU5ETUFSS19DT05UQUNUX1RIUk9XO1xuICAgIHBsYWNlci5wb3NpdGlvbi5zZXQoXG4gICAgICBtb2RlbC5wb3NpdGlvbi54ICsgbGVhbi54ICogdGhyb3dMZW5ndGgsXG4gICAgICBncm91bmQgKyAwLjAyMixcbiAgICAgIG1vZGVsLnBvc2l0aW9uLnogKyBsZWFuLnkgKiB0aHJvd0xlbmd0aCxcbiAgICApO1xuICAgIHBsYWNlci5yb3RhdGlvbi5zZXQoLU1hdGguUEkgLyAyLCAwLCAtMC4zOCk7XG4gICAgcGxhY2VyLnNjYWxlLnNldChcbiAgICAgIE1hdGgubWF4KDAuNywgc2l6ZS54ICogTEFORE1BUktfQ09OVEFDVF9TUFJFQUQpLFxuICAgICAgTWF0aC5tYXgoMC43LCBzaXplLnogKiBMQU5ETUFSS19DT05UQUNUX1NQUkVBRCksXG4gICAgICAxLFxuICAgICk7XG4gICAgcGxhY2VyLnVwZGF0ZU1hdHJpeCgpO1xuICAgIGNvbnRhY3RzLnNldE1hdHJpeEF0KHdyaXR0ZW4sIHBsYWNlci5tYXRyaXgpO1xuICAgIHdyaXR0ZW4gKz0gMTtcbiAgfVxuICBjb250YWN0cy5jb3VudCA9IHdyaXR0ZW47XG4gIGNvbnRhY3RzLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgaWYgKCF3cml0dGVuKSB7XG4gICAgZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgIG1hdGVyaWFsLmRpc3Bvc2UoKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGhvc3Quc2NlbmUuYWRkKGNvbnRhY3RzKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENvbnRhY3RTaGFkb3dzID0gU3RyaW5nKHdyaXR0ZW4pO1xuICByZXR1cm4gY29udGFjdHM7XG59XG5cbi8qKlxuICogV2hlcmUgdGhlIHdhdGVyIGxpbmUgc2l0cyBpbiBhIGJha2VkIGNoYW5uZWwuXG4gKlxuICogVHdvIHRydXRocyBjb21wZXRlOiB0aGUgY2hhbm5lbCB3YW50cyB0byBiZSBmdWxsLCBhbmQgdGhlIGZvcmQgaGFzIHRvIHN0YXkgYVxuICogY3Jvc3NpbmcuIFNvIHRoZSBzdXJmYWNlIGlzIHRoZSBMT1dFUiBvZiBcImNoYW5uZWwgYmVkICsgZmlsbFwiIGFuZCBcImZvcmQgYmVkICtcbiAqIHNraW1cIiDigJQgdGhlIGNoYW5uZWwgcmVhZHMgZGVlcCwgdGhlIGZvcmQgcmVhZHMgbGlrZSBhIHdldCBzaGVsZiB5b3UgY2FuIHdhbGsuXG4gKiBCb3RoIGJlZHMgYXJlIHJlYWQgZnJvbSB0aGUgYmFrZWQgZ3JpZCwgc28gYSByZS1zY3VscHQgbW92ZXMgdGhlIHdhdGVyIHdpdGggaXQuXG4gKi9cbmZ1bmN0aW9uIHNjdWxwdFdhdGVyU3VyZmFjZVkoXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgaGFsZlg6IG51bWJlcixcbiAgY2VudGVyWjogbnVtYmVyLFxuICBmb3JkczogUmVhZG9ubHlBcnJheTx7IGNlbnRlclg6IG51bWJlcjsgaGFsZldpZHRoOiBudW1iZXIgfT4sXG4gIGZpbGw6IG51bWJlcixcbiAgZm9yZFNraW06IG51bWJlcixcbik6IG51bWJlciB7XG4gIGNvbnN0IGNoYW5uZWw6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZvcmQ6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IHggPSAtaGFsZlggKyAyOyB4IDw9IGhhbGZYIC0gMjsgeCArPSAxKSB7XG4gICAgY29uc3QgY3Jvc3NpbmcgPSBmb3Jkcy5zb21lKChyYW5nZSkgPT4gTWF0aC5hYnMoeCAtIHJhbmdlLmNlbnRlclgpIDw9IHJhbmdlLmhhbGZXaWR0aCk7XG4gICAgZm9yIChjb25zdCB6IG9mIFstMy41LCAtMiwgLTEsIDAsIDEsIDIsIDMuNV0pIHtcbiAgICAgIChjcm9zc2luZyA/IGZvcmQgOiBjaGFubmVsKS5wdXNoKGhlaWdodEF0KHgsIGNlbnRlclogKyB6KSk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG1lZGlhbiA9ICh2YWx1ZXM6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgcmV0dXJuIHNvcnRlZFtNYXRoLmZsb29yKHNvcnRlZC5sZW5ndGggLyAyKV0gPz8gMDtcbiAgfTtcbiAgY29uc3QgY2hhbm5lbEJlZCA9IGNoYW5uZWwubGVuZ3RoID8gbWVkaWFuKGNoYW5uZWwpIDogMDtcbiAgY29uc3QgZm9yZEJlZCA9IGZvcmQubGVuZ3RoID8gbWVkaWFuKGZvcmQpIDogY2hhbm5lbEJlZDtcbiAgcmV0dXJuIE1hdGgubWluKGNoYW5uZWxCZWQgKyBmaWxsLCBmb3JkQmVkICsgZm9yZFNraW0pO1xufVxuXG4vKiogRGVyaXZlIGEgZmxhdC1mbG9vcmVkIGdvcmdlJ3Mgd2F0ZXIgbGluZSBmcm9tIGl0cyBiYWtlZCBjZW50cmVsaW5lLiAqL1xuZnVuY3Rpb24gc2N1bHB0V2F0ZXJGbG9vclkoXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgaGFsZlg6IG51bWJlcixcbiAgY2VudGVyWjogbnVtYmVyLFxuICBxdWFudGlsZTogbnVtYmVyLFxuICBkcm9wOiBudW1iZXIsXG4pOiBudW1iZXIge1xuICBjb25zdCBzYW1wbGVzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCB4ID0gLWhhbGZYICsgMTsgeCA8PSBoYWxmWCAtIDE7IHggKz0gMC41KSBzYW1wbGVzLnB1c2goaGVpZ2h0QXQoeCwgY2VudGVyWikpO1xuICBzYW1wbGVzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgcmV0dXJuIChzYW1wbGVzW01hdGgubWluKHNhbXBsZXMubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihzYW1wbGVzLmxlbmd0aCAqIHF1YW50aWxlKSldID8/IDApIC0gZHJvcDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3BhblNoYWRvd0JhbmQoaGFsZldpZHRoOiBudW1iZXIsIGhhbGZMZW5ndGg6IG51bWJlciwgY29sb3I6IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogVEhSRUUuTWVzaCB7XG4gIGNvbnN0IGNvbHVtbnMgPSBbLTEsIC0wLjYyLCAwLCAwLjYyLCAxXTtcbiAgY29uc3QgY29sdW1uQWxwaGEgPSBbMCwgMSwgMSwgMSwgMF07XG4gIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgY29sb3JzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPD0gU1BBTl9TSEFET1dfUk9XUzsgcm93ICs9IDEpIHtcbiAgICBjb25zdCB0ID0gcm93IC8gU1BBTl9TSEFET1dfUk9XUztcbiAgICBjb25zdCB0YXBlciA9IE1hdGgubWluKFxuICAgICAgVEhSRUUuTWF0aFV0aWxzLnNtb290aHN0ZXAodCwgMCwgU1BBTl9TSEFET1dfRU5EX1RBUEVSKSxcbiAgICAgIFRIUkVFLk1hdGhVdGlscy5zbW9vdGhzdGVwKDEgLSB0LCAwLCBTUEFOX1NIQURPV19FTkRfVEFQRVIpLFxuICAgICk7XG4gICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1ucy5sZW5ndGg7IGNvbHVtbiArPSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChjb2x1bW5zW2NvbHVtbl0hICogaGFsZldpZHRoLCAwLCBUSFJFRS5NYXRoVXRpbHMubGVycCgtaGFsZkxlbmd0aCwgaGFsZkxlbmd0aCwgdCkpO1xuICAgICAgY29sb3JzLnB1c2goMSwgMSwgMSwgY29sdW1uQWxwaGFbY29sdW1uXSEgKiB0YXBlcik7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IFNQQU5fU0hBRE9XX1JPV1M7IHJvdyArPSAxKSB7XG4gICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1ucy5sZW5ndGggLSAxOyBjb2x1bW4gKz0gMSkge1xuICAgICAgY29uc3QgYSA9IHJvdyAqIGNvbHVtbnMubGVuZ3RoICsgY29sdW1uO1xuICAgICAgY29uc3QgYiA9IGEgKyAxO1xuICAgICAgY29uc3QgYyA9IGEgKyBjb2x1bW5zLmxlbmd0aDtcbiAgICAgIGNvbnN0IGQgPSBjICsgMTtcbiAgICAgIGluZGljZXMucHVzaChhLCBjLCBiLCBiLCBjLCBkKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ2NvbG9yJywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUoY29sb3JzLCA0KSk7XG4gIGdlb21ldHJ5LnNldEluZGV4KGluZGljZXMpO1xuICBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yLFxuICAgIHZlcnRleENvbG9yczogdHJ1ZSxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5LFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gIH0pKTtcbiAgbWVzaC5uYW1lID0gJ1RlcnJhaW4zZFNwYW5TaGFkb3cnO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgbWVzaC5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHMgKyAwLjA1O1xuICByZXR1cm4gbWVzaDtcbn1cblxuZnVuY3Rpb24gbW91bnRTcGFuU2hhZG93KFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuICB3YXRlclk6IG51bWJlciB8IHVuZGVmaW5lZCxcbik6IFRIUkVFLk1lc2ggfCB1bmRlZmluZWQge1xuICBjb25zdCBkcmVzc2luZyA9IFNQQU5fU0hBRE9XX0NPTlRSQUNUU1tob3N0LmNvbnRyYWN0SWRdO1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFkcmVzc2luZyB8fCB3YXRlclkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgc3BhbiA9IG1vdW50cy5maW5kKCh7IGlkIH0pID0+IGlkID09PSBkcmVzc2luZy5tb3VudElkKT8ubW9kZWw7XG4gIGlmICghc3BhbikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KHNwYW4pO1xuICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gIGlmIChzaXplLnggPD0gMCB8fCBzaXplLnogPD0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgc2hhZG93ID0gY3JlYXRlU3BhblNoYWRvd0JhbmQoc2l6ZS54ICogZHJlc3Npbmcud2lkdGhTY2FsZSwgc2l6ZS56ICogZHJlc3NpbmcubGVuZ3RoU2NhbGUsIGRyZXNzaW5nLmNvbG9yLCBkcmVzc2luZy5vcGFjaXR5KTtcbiAgY29uc3QgbGVhbiA9IGxlZGdlclN1blNoYWRvd0RpcmVjdGlvbigpO1xuICBjb25zdCBkcm9wID0gTWF0aC5tYXgoMCwgYm94Lm1heC55IC0gd2F0ZXJZKTtcbiAgc2hhZG93LnBvc2l0aW9uLnNldChcbiAgICAoYm94Lm1pbi54ICsgYm94Lm1heC54KSAvIDIgKyBsZWFuLnggKiBkcm9wICogZHJlc3NpbmcudGhyb3csXG4gICAgd2F0ZXJZICsgU1BBTl9TSEFET1dfTElGVCxcbiAgICAoYm94Lm1pbi56ICsgYm94Lm1heC56KSAvIDIgKyBsZWFuLnkgKiBkcm9wICogZHJlc3NpbmcudGhyb3csXG4gICk7XG4gIGhvc3Quc2NlbmUuYWRkKHNoYWRvdyk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTcGFuU2hhZG93ID0gYCR7KHNpemUueiAqIGRyZXNzaW5nLmxlbmd0aFNjYWxlICogMikudG9GaXhlZCgyKX14JHsoc2l6ZS54ICogZHJlc3Npbmcud2lkdGhTY2FsZSAqIDIpLnRvRml4ZWQoMil9QCR7ZHJvcC50b0ZpeGVkKDIpfWA7XG4gIHJldHVybiBzaGFkb3c7XG59XG5cbi8qKlxuICogVTEg4oCUIG1vdW50IHRoZSByZW5kZXItb25seSBsaXZpbmctd2F0ZXIgc3VyZmFjZSBmb3IgYSBzY3VscHRlZCBjb250cmFjdC5cbiAqIFNpbS1zaWxlbnQ6IGV2ZXJ5IG51bWJlciBiZWxvdyBpcyByZWFkIGZyb20gdGhlIHNpbSdzIG93biBkZWNsYXJhdGlvbnMgb3IgZnJvbVxuICogdGhlIGJha2VkIGhlaWdodCBncmlkOyBub3RoaW5nIGlzIHdyaXR0ZW4gYmFjay5cbiAqL1xuLyoqIEEgbmFycm93IHdhdGVybGluZSB0YWtlbiBmcm9tIHRoZSB2aXNpYmxlIGh1bGwncyBhY3R1YWwgaW50ZXJzZWN0aW9uIHdpdGggdGhlIHNlYS4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUh1bGxXYXRlcmxpbmUocm9vdDogVEhSRUUuT2JqZWN0M0QsIHdhdGVyWTogbnVtYmVyLCB0aW1lOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+KTogVEhSRUUuTWVzaCB8IHVuZGVmaW5lZCB7XG4gIHJvb3QudXBkYXRlV29ybGRNYXRyaXgodHJ1ZSwgdHJ1ZSk7XG4gIGNvbnN0IHNlZ21lbnRzOiBBcnJheTxbVEhSRUUuVmVjdG9yMywgVEhSRUUuVmVjdG9yM10+ID0gW107XG4gIGNvbnN0IGEgPSBuZXcgVEhSRUUuVmVjdG9yMygpLCBiID0gbmV3IFRIUkVFLlZlY3RvcjMoKSwgYyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIHJvb3QudHJhdmVyc2UoKG9iamVjdCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IG1lc2gudXNlckRhdGEucmVuZGVyT25seSkgcmV0dXJuO1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gbWVzaC5nZW9tZXRyeTtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgaWYgKCFwb3NpdGlvbnMpIHJldHVybjtcbiAgICBjb25zdCBjb3VudCA9IGdlb21ldHJ5LmluZGV4Py5jb3VudCA/PyBwb3NpdGlvbnMuY291bnQ7XG4gICAgY29uc3QgdmVydGV4ID0gKHRhcmdldDogVEhSRUUuVmVjdG9yMywgc2xvdDogbnVtYmVyKSA9PiB0YXJnZXQuZnJvbUJ1ZmZlckF0dHJpYnV0ZShcbiAgICAgIHBvc2l0aW9ucywgZ2VvbWV0cnkuaW5kZXggPyBnZW9tZXRyeS5pbmRleC5nZXRYKHNsb3QpIDogc2xvdCxcbiAgICApLmFwcGx5TWF0cml4NChtZXNoLm1hdHJpeFdvcmxkKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpICs9IDMpIHtcbiAgICAgIHZlcnRleChhLCBpKTsgdmVydGV4KGIsIGkgKyAxKTsgdmVydGV4KGMsIGkgKyAyKTtcbiAgICAgIGNvbnN0IGN1dHM6IFRIUkVFLlZlY3RvcjNbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbZnJvbSwgdG9dIG9mIFtbYSxiXSwgW2IsY10sIFtjLGFdXSkge1xuICAgICAgICBpZiAoKGZyb20hLnkgPD0gd2F0ZXJZKSA9PT0gKHRvIS55IDw9IHdhdGVyWSkpIGNvbnRpbnVlO1xuICAgICAgICBjdXRzLnB1c2goZnJvbSEuY2xvbmUoKS5sZXJwKHRvISwgKHdhdGVyWSAtIGZyb20hLnkpIC8gKHRvIS55IC0gZnJvbSEueSkpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXRzLmxlbmd0aCA9PT0gMiAmJiBjdXRzWzBdIS5kaXN0YW5jZVRvU3F1YXJlZChjdXRzWzFdISkgPiAxZS04KSBzZWdtZW50cy5wdXNoKFtjdXRzWzBdISwgY3V0c1sxXSFdKTtcbiAgICB9XG4gIH0pO1xuICBpZiAoIXNlZ21lbnRzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgYm91bmRzID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSBmb3IgKGNvbnN0IHBvaW50IG9mIHNlZ21lbnQpIGJvdW5kcy5leHBhbmRCeVBvaW50KHBvaW50KTtcbiAgY29uc3QgY2VudGVyID0gYm91bmRzLmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgY29uc3QgcG9zaXRpb25zOiBudW1iZXJbXSA9IFtdLCB1dnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGVtaXQgPSAocG9pbnQ6IFRIUkVFLlZlY3RvcjMsIGVkZ2U6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGxvY2FsID0gcm9vdC53b3JsZFRvTG9jYWwocG9pbnQuY2xvbmUoKSk7XG4gICAgcG9zaXRpb25zLnB1c2gobG9jYWwueCxsb2NhbC55LGxvY2FsLnopOyB1dnMucHVzaCgwLGVkZ2UpO1xuICB9O1xuICBmb3IgKGNvbnN0IFtmcm9tLHRvXSBvZiBzZWdtZW50cykge1xuICAgIGNvbnN0IG91dHdhcmQgPSBuZXcgVEhSRUUuVmVjdG9yMyh0by56LWZyb20ueiwwLGZyb20ueC10by54KS5ub3JtYWxpemUoKTtcbiAgICBjb25zdCBtaWQgPSBmcm9tLmNsb25lKCkuYWRkKHRvKS5tdWx0aXBseVNjYWxhciguNSkuc3ViKGNlbnRlcik7XG4gICAgaWYgKG91dHdhcmQuZG90KG1pZCkgPCAwKSBvdXR3YXJkLm5lZ2F0ZSgpO1xuICAgIGNvbnN0IGlubmVyQSA9IGZyb20uY2xvbmUoKSwgaW5uZXJCID0gdG8uY2xvbmUoKTtcbiAgICBpbm5lckEueSA9IGlubmVyQi55ID0gd2F0ZXJZICsgMC4wMTg7XG4gICAgY29uc3Qgb3V0ZXJBID0gaW5uZXJBLmNsb25lKCkuYWRkU2NhbGVkVmVjdG9yKG91dHdhcmQsLjM0KTtcbiAgICBjb25zdCBvdXRlckIgPSBpbm5lckIuY2xvbmUoKS5hZGRTY2FsZWRWZWN0b3Iob3V0d2FyZCwuMzQpO1xuICAgIGVtaXQoaW5uZXJBLDApOyBlbWl0KG91dGVyQSwxKTsgZW1pdChpbm5lckIsMCk7XG4gICAgZW1pdChpbm5lckIsMCk7IGVtaXQob3V0ZXJBLDEpOyBlbWl0KG91dGVyQiwxKTtcbiAgfVxuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyxuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3V2JyxuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSh1dnMsMikpO1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6JyNiNWM0YmInLHRyYW5zcGFyZW50OnRydWUsb3BhY2l0eTouMjQsZGVwdGhXcml0ZTpmYWxzZSxzaWRlOlRIUkVFLkRvdWJsZVNpZGV9KTtcbiAgbWF0ZXJpYWwuZm9yY2VTaW5nbGVQYXNzID0gdHJ1ZTtcbiAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gc2hhZGVyID0+IHtcbiAgICBzaGFkZXIudW5pZm9ybXMuaHVsbFdhdGVyVGltZSA9IHRpbWU7XG4gICAgc2hhZGVyLnZlcnRleFNoYWRlcj1zaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdldhdGVybGluZTsnKVxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52V2F0ZXJsaW5lID0gdmVjMyhwb3NpdGlvbi54LCBwb3NpdGlvbi56LCB1di55KTsnKTtcbiAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXI9c2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdldhdGVybGluZTtcXG51bmlmb3JtIGZsb2F0IGh1bGxXYXRlclRpbWU7JylcbiAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29sb3JfZnJhZ21lbnQ+JyxgI2luY2x1ZGUgPGNvbG9yX2ZyYWdtZW50PlxuICAgICAgICBmbG9hdCB3YXNoID0gc2luKHZXYXRlcmxpbmUueCAqIDAuOSArIHZXYXRlcmxpbmUueSAqIDEuNCArIGh1bGxXYXRlclRpbWUgKiAwLjUpXG4gICAgICAgICAgKiBzaW4odldhdGVybGluZS55ICogMi45IC0gaHVsbFdhdGVyVGltZSAqIDAuMyk7XG4gICAgICAgIGRpZmZ1c2VDb2xvci5hICo9ICgxLjAgLSBzbW9vdGhzdGVwKDAuMCwgMS4wLCB2V2F0ZXJsaW5lLnopKSAqIHNtb290aHN0ZXAoLTAuMTUsIDAuNjUsIHdhc2gpO2ApO1xuICB9O1xuICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXk9KCk9PiAnc2VhLWh1bGwtd2F0ZXJsaW5lLXYxJztcbiAgY29uc3QgbWVzaD1uZXcgVEhSRUUuTWVzaChnZW9tZXRyeSxtYXRlcmlhbCk7XG4gIG1lc2gubmFtZT0nU2VhSHVsbFdhdGVybGluZSc7bWVzaC51c2VyRGF0YS5yZW5kZXJPbmx5PXRydWU7XG4gIG1lc2gucmVuZGVyT3JkZXI9UmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscyswLjE7XG4gIHJldHVybiBtZXNoO1xufVxuXG5mdW5jdGlvbiBtb3VudFNjdWxwdFdhdGVyKGhvc3Q6IEhvc3QsIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlciwgYm91bmRzOiBUSFJFRS5Cb3gzKTogU2N1bHB0V2F0ZXIgfCB1bmRlZmluZWQge1xuICBjb25zdCBjb250cmFjdCA9IFJFR0lTVFJZW2hvc3QuY29udHJhY3RJZF0/LmNvbnRyYWN0O1xuICBjb25zdCBzZWEgPSBjb250cmFjdD8ud2F0ZXJTdXJmYWNlPy5vd25lciA9PT0gJ3J1bnRpbWUgRGVlcHdhdGVyQ2xhaW1UaWxlJ1xuICAgICYmIGNvbnRyYWN0LndhdGVyU3VyZmFjZS5pbmNsdWRlZEluVGVycmFpbkdMQiA9PT0gZmFsc2U7XG4gIGNvbnN0IHN0aWxsd2F0ZXIgPSBob3N0LmNvbnRyYWN0SWQgPT09ICdlNS1zdGlsbHdhdGVyJztcbiAgY29uc3QgZHJlc3NpbmcgPSBzZWEgPyBERUVQV0FURVJfU0VBX0RSRVNTSU5HIDogU0NVTFBUX1dBVEVSX0RSRVNTSU5HW2hvc3QuY29udHJhY3RJZF07XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIWRyZXNzaW5nIHx8ICghc2VhICYmICFUZXJyYWluLmhhc1JpdmVyV2F0ZXIoKSkpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJpdmVyID0gc2VhID8geyBtaW5aOiBib3VuZHMubWluLnosIG1heFo6IGJvdW5kcy5tYXgueiB9IDogVGVycmFpbi5yaXZlckdlb21ldHJ5KCk7XG4gIGNvbnN0IGNlbnRlclogPSAocml2ZXIubWluWiArIHJpdmVyLm1heFopIC8gMjtcbiAgY29uc3Qgcml2ZXJIYWxmV2lkdGggPSAocml2ZXIubWF4WiAtIHJpdmVyLm1pblopIC8gMjtcbiAgY29uc3QgZm9yZHMgPSBzZWEgPyBbXSA6IFRlcnJhaW4uZm9yZFJhbmdlcygpO1xuICBjb25zdCBmb3JkSGFsZldpZHRoID0gZm9yZHMubGVuZ3RoID8gTWF0aC5tYXgoLi4uZm9yZHMubWFwKChyYW5nZSkgPT4gcmFuZ2UuaGFsZldpZHRoKSkgOiAzO1xuICBjb25zdCBmb3JkQ2VudGVycyA9IGZvcmRzLmxlbmd0aCA/IGZvcmRzLm1hcCgocmFuZ2UpID0+IHJhbmdlLmNlbnRlclgpIDogWzBdO1xuICBjb25zdCBoYWxmWCA9IE1hdGgubWluKE1hdGguYWJzKGJvdW5kcy5taW4ueCksIE1hdGguYWJzKGJvdW5kcy5tYXgueCkpO1xuICBjb25zdCBzdXJmYWNlWSA9IGRyZXNzaW5nLnN1cmZhY2Uua2luZCA9PT0gJ3NlYS1sZXZlbCcgPyBkcmVzc2luZy5zdXJmYWNlLnlcbiAgICA6IGRyZXNzaW5nLnN1cmZhY2Uua2luZCA9PT0gJ2NoYW5uZWwtZmlsbCdcbiAgICAgID8gc2N1bHB0V2F0ZXJTdXJmYWNlWShoZWlnaHRBdCwgaGFsZlgsIGNlbnRlclosIGZvcmRzLCBkcmVzc2luZy5zdXJmYWNlLmZpbGwsIGRyZXNzaW5nLmZvcmRTa2ltKVxuICAgICAgOiBzY3VscHRXYXRlckZsb29yWShoZWlnaHRBdCwgaGFsZlgsIGNlbnRlclosIGRyZXNzaW5nLnN1cmZhY2UucXVhbnRpbGUsIGRyZXNzaW5nLnN1cmZhY2UuZHJvcCk7XG4gIGNvbnN0IHNlYVJhZGl1cyA9IFJFR0lTVFJZW2hvc3QuY29udHJhY3RJZF0/LnBhbm9yYW1hQ29udHJhY3QucHJvamVjdGlvbj8uc2t5UmluZ1JhZGl1c01ldGVycyA/PyBoYWxmWDtcbiAgY29uc3QgdmlzdWFsSGFsZldpZHRoID0gc2VhID8gc2VhUmFkaXVzIDogZHJlc3NpbmcudmlzdWFsSGFsZldpZHRoID8/IFRlcnJhaW4udmlzdWFsV2F0ZXJIYWxmV2lkdGgoKTtcbiAgY29uc3Qgb3ZlcmhhbmcgPSBzZWEgPyBNYXRoLm1heCgwLCBzZWFSYWRpdXMgLSBoYWxmWCkgOiBNYXRoLm1heCgwLCBkcmVzc2luZy5vdmVyaGFuZ01ldGVycyA/PyAwKTtcbiAgY29uc3Qgd2F0ZXIgPSBjcmVhdGVTY3VscHRXYXRlcih7XG4gICAgZm9yZDogZmFsc2UsXG4gICAgZGVwdGhUZXN0OiB0cnVlLFxuICAgIG9wZW5TZWE6IHNlYSxcbiAgICBoZWlnaHRBdDogc2VhID8gKHgsIHopID0+IHtcbiAgICAgIC8vIFRoZSBwYW5vcmFtYSdzIHN1Ym1lcmdlZCBhcHJvbiBpcyBzY2VuZXJ5LCBub3QgYW4gZXh0ZW5zaW9uIG9mIHRoZSBwbGF5YWJsZSBiZWQuXG4gICAgICBjb25zdCBvdXRzaWRlID0gTWF0aC5tYXgoMCwgTWF0aC5hYnMoeCkgLSBoYWxmWCwgTWF0aC5hYnMoeiAtIGNlbnRlclopIC0gcml2ZXJIYWxmV2lkdGgpO1xuICAgICAgcmV0dXJuIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhlaWdodEF0KHgsIHopLCBib3VuZHMubWluLnksIFRIUkVFLk1hdGhVdGlscy5zbW9vdGhzdGVwKG91dHNpZGUsIDAsIGhhbGZYKSk7XG4gICAgfSA6IGhlaWdodEF0LFxuICAgIGJlZDogZHJlc3NpbmcuYmVkLFxuICAgIGRlZXBNZXRlcnM6IGRyZXNzaW5nLmRlZXBNZXRlcnMsXG4gICAgc2hvcmVNZXRlcnM6IGRyZXNzaW5nLnNob3JlTWV0ZXJzLFxuICAgIGNvbG9yOiBzdGlsbHdhdGVyID8gJyNhNWM1ZDAnIDogZHJlc3NpbmcuY29sb3IsXG4gICAgb3BhY2l0eTogc3RpbGx3YXRlciA/IDAuNjIgOiBkcmVzc2luZy5vcGFjaXR5LFxuICAgIHJpcHBsZVN0cmVuZ3RoOiBzdGlsbHdhdGVyID8gMC4wNCA6IGRyZXNzaW5nLnJpcHBsZVN0cmVuZ3RoLFxuICAgIHJpcHBsZVNjYWxlOiBkcmVzc2luZy5yaXBwbGVTY2FsZSxcbiAgICBkZXB0aENvbnRyYXN0OiBkcmVzc2luZy5kZXB0aENvbnRyYXN0LFxuICAgIHRleHR1cmVCbGVuZDogc3RpbGx3YXRlciA/IDAuMDYgOiBkcmVzc2luZy50ZXh0dXJlQmxlbmQsXG4gICAgZm9yZFRpbnQ6IGRyZXNzaW5nLmZvcmRUaW50LFxuICAgIHNob3JlRmFkZU1ldGVyczogZHJlc3Npbmcuc2hvcmVGYWRlTWV0ZXJzLFxuICAgIHN1cmZhY2VMaWZ0OiBkcmVzc2luZy5zdXJmYWNlTGlmdCxcbiAgICBlbWlzc2l2ZTogZHJlc3NpbmcuZW1pc3NpdmUsXG4gICAgY2VudGVyWixcbiAgICBzdXJmYWNlWSxcbiAgICBoYWxmTGVuZ3RoOiBoYWxmWCArIG92ZXJoYW5nLFxuICAgIHJpdmVySGFsZldpZHRoOiBzZWEgPyBzZWFSYWRpdXMgOiByaXZlckhhbGZXaWR0aCxcbiAgICB2aXN1YWxIYWxmV2lkdGgsXG4gICAgbGVuZ3RoSGFsZjogaGFsZlggKyBvdmVyaGFuZyxcbiAgICBmYWRlU3RhcnQ6IHNlYSA/IHNlYVJhZGl1cyAtIFNDVUxQVF9XQVRFUl9FREdFX0ZBREUgOiBvdmVyaGFuZyA+IDAgPyBoYWxmWCA6IE1hdGgubWF4KDEsIGhhbGZYIC0gU0NVTFBUX1dBVEVSX0VER0VfRkFERSksXG4gICAgZm9yZEhhbGZXaWR0aCxcbiAgICBmb3JkQ2VudGVycyxcbiAgICByaXZlckRlcHRoOiBUZXJyYWluLndhdGVyRGVwdGgoJ3JpdmVyJyksXG4gICAgZm9yZERlcHRoOiBUZXJyYWluLndhdGVyRGVwdGgoJ2ZvcmQnKSxcbiAgICB3YWRlRGVwdGg6IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGgsXG4gICAgZGVlcERlcHRoOiBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoLFxuICAgIC8vIFRoZSBnb2xkIGdsaW50cyBiZWxvbmcgb24gdGhlIHNsdWljZSBsaW5lOiBlYWNoIGhhcnZlc3QgYW5jaG9yIHB1c2hlZCB0byBpdHNcbiAgICAvLyBvd24gYmFuayBsaXAsIGV4YWN0bHkgYXMgdGhlIHBhaW50ZWQgcml2ZXIgcGxhY2VzIHRoZW0uXG4gICAgYW5jaG9yczogZHJlc3NpbmcuZ2xpbnRzID09PSAnaGFydmVzdCdcbiAgICAgID8gVGVycmFpbi5ub2RlQW5jaG9ycy5tYXAoKGFuY2hvcikgPT4gKHtcbiAgICAgICAgeDogYW5jaG9yLngsXG4gICAgICAgIHo6IGFuY2hvci56IDwgY2VudGVyWiA/IHJpdmVyLm1pblogKyAwLjU1IDogcml2ZXIubWF4WiAtIDAuNTUsXG4gICAgICB9KSlcbiAgICAgIDogZHJlc3NpbmcuZ2xpbnRzLm1hcCgoeyB4LCB6IH0pID0+ICh7IHgsIHo6IGNlbnRlclogKyB6IH0pKSxcbiAgfSk7XG4gIGxldCBsYXN0RnJhbWUgPSAtMTtcbiAgbGV0IGxhc3RBdCA9IDA7XG4gIGNvbnN0IGh1bGxOYW1lcyA9IHNlYSA/IChob3N0LmNvbnRyYWN0SWQgPT09ICdlNS1mbG90aWxsYSdcbiAgICA/IFsna2l0Y2hlbi1zY293JywgJ3R1cnJldC1yYWZ0JywgJ3N0aWxsLXJvb20tYmFyZ2UnXSA6IFsnQ2xhaW1Cb2F0VmlldyddKSA6IFtdO1xuICBjb25zdCBodWxsQ29udGFjdHM6IFRIUkVFLk1lc2hbXSA9IFtdO1xuICBjb25zdCBkaXNwb3NlV2F0ZXIgPSB3YXRlci5kaXNwb3NlO1xuICB3YXRlci5kaXNwb3NlID0gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgY29udGFjdCBvZiBodWxsQ29udGFjdHMpIHtcbiAgICAgIGlmICghY29udGFjdC5wYXJlbnQpIGNvbnRpbnVlOyAvLyBUaGUgb3duaW5nIGh1bGwgbWF5IGFscmVhZHkgaGF2ZSBkaXNwb3NlZCBpdHMgY2hpbGRyZW4uXG4gICAgICBjb250YWN0LnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChjb250YWN0KTtcbiAgICB9XG4gICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIdWxsV2F0ZXJsaW5lcztcbiAgICBkaXNwb3NlV2F0ZXIoKTtcbiAgfTtcbiAgd2F0ZXIubWVzaC5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlcikgPT4ge1xuICAgIGNvbnN0IGZyYW1lID0gcmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWU7XG4gICAgaWYgKGZyYW1lID09PSBsYXN0RnJhbWUpIHJldHVybjtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDA7XG4gICAgY29uc3QgZGVsdGEgPSBsYXN0RnJhbWUgPCAwID8gMCA6IE1hdGgubWluKFNDVUxQVF9XQVRFUl9NQVhfREVMVEEsIE1hdGgubWF4KDAsIG5vdyAtIGxhc3RBdCkpO1xuICAgIGxhc3RGcmFtZSA9IGZyYW1lO1xuICAgIGxhc3RBdCA9IG5vdztcbiAgICB3YXRlci5hZHZhbmNlKGRlbHRhKTtcbiAgICAvLyBBdHRhY2ggb25jZSB0aGUgYXN5bmNocm9ub3VzIHZpc3VhbCBodWxsIGFycml2ZXMuIFRoZSBwYXJlbnQncyBleGlzdGluZyB0cmFuc2Zvcm0gYW5kXG4gICAgLy8gdmlzaWJpbGl0eSBjYXJyeSB0aGUgbGluZSB0aHJvdWdoIHJlYW5jaG9yaW5nL2xvc3M7IG5vIHNpbXVsYXRpb24gcG9zaXRpb24gaXMgZHVwbGljYXRlZC5cbiAgICBmb3IgKGxldCBpID0gaHVsbE5hbWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBodWxsID0gaG9zdC5zY2VuZS5nZXRPYmplY3RCeU5hbWUoaHVsbE5hbWVzW2ldISk7XG4gICAgICBpZiAoIWh1bGw/LmNoaWxkcmVuLmxlbmd0aCkgY29udGludWU7XG4gICAgICBjb25zdCBjb250YWN0ID0gY3JlYXRlSHVsbFdhdGVybGluZShodWxsLCBzdXJmYWNlWSxcbiAgICAgICAgKHdhdGVyLm1lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWF0ZXJpYWwpLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMudGltZSBhcyBUSFJFRS5JVW5pZm9ybTxudW1iZXI+KTtcbiAgICAgIGh1bGxOYW1lcy5zcGxpY2UoaSwgMSk7XG4gICAgICBpZiAoY29udGFjdCkgeyBodWxsLmFkZChjb250YWN0KTsgaHVsbENvbnRhY3RzLnB1c2goY29udGFjdCk7IH1cbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIdWxsV2F0ZXJsaW5lcyA9IEpTT04uc3RyaW5naWZ5KGh1bGxDb250YWN0cy5tYXAobWVzaCA9PiAoe1xuICAgICAgICBodWxsOiBtZXNoLnBhcmVudD8ubmFtZSwgdHJpYW5nbGVzOiBtZXNoLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS5jb3VudCAvIDMsXG4gICAgICB9KSkpO1xuICAgIH1cbiAgfTtcbiAgaG9zdC5zY2VuZS5hZGQod2F0ZXIubWVzaCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTY3VscHRXYXRlciA9IHNlYSA/ICdsaXZpbmctc2VhLXF1YWQnIDogJ2xpdmluZy13YXRlci1xdWFkJztcbiAgLy8gVGhlIE1PVU5URUQgaGFsZiB3aWR0aCwgbm90IHRoZSB0aWxlJ3MgZGVjbGFyYXRpb24g4oCUIGEgbWFwIHRoYXQgbmFycm93cyBpdHMgcXVhZCBoYXMgdG8gc2F5IHNvLFxuICAvLyBhbmQgZTJlL3Nob3JlLXRydXRoLnNwZWMudHMncyBsYXcgaXMgXCJuZXZlciB3aWRlciB0aGFuIHRoZSBzaW0gZGVjbGFyZXNcIiwgd2hpY2ggbmFycm93aW5nIGtlZXBzLlxuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXJIYWxmV2lkdGggPSB2aXN1YWxIYWxmV2lkdGgudG9GaXhlZCgzKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyU2ltSGFsZldpZHRoID0gKHNlYSA/IHJpdmVySGFsZldpZHRoIDogVGVycmFpbi52aXN1YWxXYXRlckhhbGZXaWR0aCgpKS50b0ZpeGVkKDMpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXJZID0gc3VyZmFjZVkudG9GaXhlZCg0KTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyR2xpbnRzID0gU3RyaW5nKHdhdGVyLm1lc2gubWF0ZXJpYWwgaW5zdGFuY2VvZiBUSFJFRS5NYXRlcmlhbFxuICAgID8gKHdhdGVyLm1lc2gubWF0ZXJpYWwudXNlckRhdGEud2F0ZXJHbGludHMgPz8gMClcbiAgICA6IDApO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXJEZWVwZXN0ID0gd2F0ZXIuZGVlcGVzdE1ldGVycy50b0ZpeGVkKDMpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXJGb3JkcyA9IGZvcmRzLm1hcCgocmFuZ2UpID0+IGAke3JhbmdlLmlkfUAke3JhbmdlLmNlbnRlclh9YCkuam9pbignLCcpO1xuICByZXR1cm4gd2F0ZXI7XG59XG5cbi8qKiBGb2FtIGNvbGxhcnMgZ3JvdW5kIHdhdGVyLW1vdW50ZWQgbGFuZG1hcmtzIHdpdGhvdXQgZHJhd2luZyBhIGRhcmsgcG9vbCB1bmRlciB0aGUgc3VyZmFjZS4gKi9cbmZ1bmN0aW9uIG1vdW50V2F0ZXJDb2xsYXJzKFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IFJlYWRvbmx5QXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4gIHdhdGVyWTogbnVtYmVyIHwgdW5kZWZpbmVkLFxuKTogVEhSRUUuSW5zdGFuY2VkTWVzaCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGNvbGxhcnMgPSBTQ1VMUFRfV0FURVJfRFJFU1NJTkdbaG9zdC5jb250cmFjdElkXT8uY29sbGFycztcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCAhY29sbGFycz8ubGVuZ3RoIHx8IHdhdGVyWSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5SaW5nR2VvbWV0cnkoMC40LCAxLCAzMiwgMSk7XG4gIGNvbnN0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICBjb2xvcjogJyNlZmU2Y2QnLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgIG9wYWNpdHk6IDAuMTQsXG4gICAgZGVwdGhXcml0ZTogZmFsc2UsXG4gICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgICBibGVuZGluZzogVEhSRUUuQWRkaXRpdmVCbGVuZGluZyxcbiAgfSk7XG4gIGNvbnN0IHJpbmcgPSBuZXcgVEhSRUUuSW5zdGFuY2VkTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwsIGNvbGxhcnMubGVuZ3RoKTtcbiAgcmluZy5uYW1lID0gJ1RlcnJhaW4zZFdhdGVyQ29sbGFycyc7XG4gIHJpbmcudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gIHJpbmcuZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICByaW5nLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscztcbiAgY29uc3QgcGxhY2VyID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG4gIGxldCB3cml0dGVuID0gMDtcbiAgZm9yIChjb25zdCBjb2xsYXIgb2YgY29sbGFycykge1xuICAgIGNvbnN0IG1vZGVsID0gbW91bnRzLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09IGNvbGxhci5tb3VudCk/Lm1vZGVsO1xuICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuICAgIHBsYWNlci5wb3NpdGlvbi5zZXQobW9kZWwucG9zaXRpb24ueCwgd2F0ZXJZICsgMC4wMTIsIG1vZGVsLnBvc2l0aW9uLnopO1xuICAgIHBsYWNlci5yb3RhdGlvbi5zZXQoLU1hdGguUEkgLyAyLCAwLCAwKTtcbiAgICBwbGFjZXIuc2NhbGUuc2V0KGNvbGxhci5yYWRpdXMsIGNvbGxhci5yYWRpdXMsIDEpO1xuICAgIHBsYWNlci51cGRhdGVNYXRyaXgoKTtcbiAgICByaW5nLnNldE1hdHJpeEF0KHdyaXR0ZW4sIHBsYWNlci5tYXRyaXgpO1xuICAgIHdyaXR0ZW4gKz0gMTtcbiAgfVxuICByaW5nLmNvdW50ID0gd3JpdHRlbjtcbiAgcmluZy5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIGlmICghd3JpdHRlbikge1xuICAgIGdlb21ldHJ5LmRpc3Bvc2UoKTtcbiAgICBtYXRlcmlhbC5kaXNwb3NlKCk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBob3N0LnNjZW5lLmFkZChyaW5nKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhdGVyQ29sbGFycyA9IFN0cmluZyh3cml0dGVuKTtcbiAgcmV0dXJuIHJpbmc7XG59XG5cbi8qKlxuICogVTUg4oCUIGxpdmluZyBhaXIgb3ZlciB0aGUgQ2xhaW0sIHBsdXMgdGhlIFJ1c2gncyBvbmUgdmlzaWJsZSByZXdhcmQgbm90ZS5cbiAqXG4gKiBNb3RlczogYSBjYXBwZWQgYWRkaXRpdmUgcG9pbnQgZmllbGQgZHJpZnRpbmcgYWxvbmcgdGhlIGtleSBsaWdodC4gT25lIGRyYXcgY2FsbCxcbiAqIG9uZSBidWZmZXIsIGFsbCBtb3Rpb24gaW4gdGhlIHZlcnRleCBzaGFkZXIuXG4gKiBFbWJlcjogd2hpbGUgYSBwb3N0LXNlY3VyZSBSdXNoIHJ1biBpcyBsaXZlLCB0aGUgY2xhaW0tc3Rha2UgbW91bnQgZ2V0cyBhIHdhcm1cbiAqIGxpZnQg4oCUIHRoZSBtYXAgc2F5cyBvdXQgbG91ZCB0aGF0IHRoZSBwbGF5ZXIgY2hvc2UgdG8gcHJlc3MgdGhlaXIgbHVjay4gSXQgaXNcbiAqIGRyaXZlbiBmcm9tIFJ1bk1hbmFnZXIncyBvd24gcnVzaCBmbGFnIHRocm91Z2ggdGhlIGhvc3QsIG5ldmVyIGluZmVycmVkLlxuICovXG5mdW5jdGlvbiBtb3VudFN1bk1vdGVzKGhvc3Q6IEhvc3QsIGJvdW5kczogVEhSRUUuQm94Myk6IFN1bk1vdGVzIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZHJlc3NpbmcgPSBTVU5fTU9URVNbaG9zdC5jb250cmFjdElkXTtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCAhZHJlc3NpbmcpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IG1vYmlsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5pbm5lcldpZHRoIDw9IDQzMDtcbiAgY29uc3QgbGVhbiA9IGxlZGdlclN1blNoYWRvd0RpcmVjdGlvbigpO1xuICBjb25zdCBtb3RlcyA9IGNyZWF0ZVN1bk1vdGVzKHtcbiAgICBjb3VudDogbW9iaWxlID8gTWF0aC5yb3VuZChTVU5fTU9URV9DQVAgKiAwLjQ1KSA6IFNVTl9NT1RFX0NBUCxcbiAgICBoYWxmWDogTWF0aC5taW4oTWF0aC5hYnMoYm91bmRzLm1pbi54KSwgTWF0aC5hYnMoYm91bmRzLm1heC54KSkgKiAoZHJlc3NpbmcuaGFsZlhTY2FsZSA/PyAwLjYyKSxcbiAgICBoYWxmWjogZHJlc3NpbmcuaGFsZlosXG4gICAgY2VudGVyWjogZHJlc3NpbmcuY2VudGVyWixcbiAgICBtaW5ZOiBkcmVzc2luZy5taW5ZLFxuICAgIG1heFk6IGRyZXNzaW5nLm1heFksXG4gICAgZHJpZnQ6IG5ldyBUSFJFRS5WZWN0b3IyKGxlYW4ueCAqIDAuNTUsIGxlYW4ueSAqIDAuNTUpLFxuICAgIGNvbG9yOiBkcmVzc2luZy5jb2xvcixcbiAgICBzaXplOiBkcmVzc2luZy5zaXplLFxuICAgIHNlZWQ6IGRyZXNzaW5nLnNlZWQsXG4gIH0pO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBtb3Rlcy5wb2ludHMub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBmcmFtZSA9IHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lO1xuICAgIGlmIChmcmFtZSA9PT0gbGFzdEZyYW1lKSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEZyYW1lIDwgMCA/IDAgOiBNYXRoLm1pbihTQ1VMUFRfV0FURVJfTUFYX0RFTFRBLCBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpKTtcbiAgICBsYXN0RnJhbWUgPSBmcmFtZTtcbiAgICBsYXN0QXQgPSBub3c7XG4gICAgbW90ZXMuYWR2YW5jZShkZWx0YSk7XG4gIH07XG4gIGhvc3Quc2NlbmUuYWRkKG1vdGVzLnBvaW50cyk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RNb3RlcyA9IFN0cmluZyhtb3Rlcy5jb3VudCk7XG4gIHJldHVybiBtb3Rlcztcbn1cblxuLyoqIFRyZXN0bGUgZ29yZ2Ugd2lzcHMgcGx1cyBjYXJ0LWxvY2FsIHN0ZWFtLCBib3RoIHNoZWQgYmVmb3JlIGdhbWVwbGF5IFZGWC4gKi9cbmZ1bmN0aW9uIG1vdW50Q3Jvc3NpbmdCcmVhdGgoaG9zdDogSG9zdCwgd2F0ZXJZOiBudW1iZXIgfCB1bmRlZmluZWQpOiBDcm9zc2luZ0JyZWF0aCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGRyZXNzaW5nID0gQ1JPU1NJTkdfQlJFQVRIX0NPTlRSQUNUU1tob3N0LmNvbnRyYWN0SWRdO1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFkcmVzc2luZyB8fCB3YXRlclkgPT09IHVuZGVmaW5lZCB8fCBwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcygpLnRpZXIgIT09ICdmdWxsJykgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgd2lzcHMgPSBjcmVhdGVTdW5Nb3Rlcyh7XG4gICAgY291bnQ6IGRyZXNzaW5nLndpc3BzLmNvdW50LFxuICAgIGhhbGZYOiBkcmVzc2luZy53aXNwcy5oYWxmWCxcbiAgICBoYWxmWjogZHJlc3Npbmcud2lzcHMuaGFsZlosXG4gICAgY2VudGVyWjogMCxcbiAgICBtaW5ZOiB3YXRlclkgKyAwLjA0LFxuICAgIG1heFk6IHdhdGVyWSArIGRyZXNzaW5nLndpc3BzLmxpZnQsXG4gICAgZHJpZnQ6IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDApLFxuICAgIHJpc2U6IGRyZXNzaW5nLndpc3BzLnJpc2UsXG4gICAgY29sb3I6IGRyZXNzaW5nLndpc3BzLmNvbG9yLFxuICAgIHNpemU6IGRyZXNzaW5nLndpc3BzLnNpemUsXG4gICAgc2VlZDogMHg3ZTUxLFxuICB9KTtcbiAgd2lzcHMucG9pbnRzLm5hbWUgPSAnVHJlc3RsZUdvcmdlV2lzcHMnO1xuICBsZXQgcGx1bWU6IFN1bk1vdGVzIHwgdW5kZWZpbmVkO1xuICBsZXQgY2FydDogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQ7XG4gIGxldCBsYXN0RnJhbWUgPSAtMTtcbiAgbGV0IGxhc3RBdCA9IDA7XG4gIGNvbnN0IGFkdmFuY2UgPSAocmVuZGVyZXI6IFRIUkVFLldlYkdMUmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBmcmFtZSA9IHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lO1xuICAgIGlmIChmcmFtZSA9PT0gbGFzdEZyYW1lKSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEZyYW1lIDwgMCA/IDAgOiBNYXRoLm1pbihTQ1VMUFRfV0FURVJfTUFYX0RFTFRBLCBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpKTtcbiAgICBsYXN0RnJhbWUgPSBmcmFtZTtcbiAgICBsYXN0QXQgPSBub3c7XG4gICAgd2lzcHMuYWR2YW5jZShkZWx0YSk7XG4gICAgcGx1bWU/LmFkdmFuY2UoZGVsdGEpO1xuICB9O1xuICB3aXNwcy5wb2ludHMub25CZWZvcmVSZW5kZXIgPSBhZHZhbmNlO1xuICBob3N0LnNjZW5lLmFkZCh3aXNwcy5wb2ludHMpO1xuXG4gIGxldCB0aWNrcyA9IDA7XG4gIGNvbnN0IHBvbGwgPSAoKSA9PiB7XG4gICAgaWYgKCF3aXNwcy5wb2ludHMucGFyZW50KSByZXR1cm47XG4gICAgaWYgKHRpY2tzICUgQ1JPU1NJTkdfQlJFQVRIX1BPTExfRlJBTUVTID09PSAwKSB7XG4gICAgICBjb25zdCB2ZXJkaWN0ID0gaG9zdC5kZXRhaWxCdWRnZXQ/LigpID8/IDA7XG4gICAgICB3aXNwcy5wb2ludHMudmlzaWJsZSA9IHZlcmRpY3QgPCAxO1xuICAgICAgaWYgKCFjYXJ0KSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gaG9zdC5zY2VuZS5nZXRPYmplY3RCeU5hbWUoJ09yZUNhcnQnKTtcbiAgICAgICAgaWYgKGZvdW5kKSB7XG4gICAgICAgICAgY2FydCA9IGZvdW5kO1xuICAgICAgICAgIHBsdW1lID0gY3JlYXRlU3VuTW90ZXMoe1xuICAgICAgICAgICAgY291bnQ6IGRyZXNzaW5nLnBsdW1lLmNvdW50LFxuICAgICAgICAgICAgaGFsZlg6IGRyZXNzaW5nLnBsdW1lLnJhZGl1cyxcbiAgICAgICAgICAgIGhhbGZaOiBkcmVzc2luZy5wbHVtZS5yYWRpdXMsXG4gICAgICAgICAgICBjZW50ZXJaOiAwLFxuICAgICAgICAgICAgbWluWTogMS42NSxcbiAgICAgICAgICAgIG1heFk6IDEuNjUgKyBkcmVzc2luZy5wbHVtZS5oZWlnaHQsXG4gICAgICAgICAgICBkcmlmdDogbmV3IFRIUkVFLlZlY3RvcjIoMCwgMCksXG4gICAgICAgICAgICByaXNlOiBkcmVzc2luZy5wbHVtZS5yaXNlLFxuICAgICAgICAgICAgY29sb3I6IGRyZXNzaW5nLnBsdW1lLmNvbG9yLFxuICAgICAgICAgICAgc2l6ZTogZHJlc3NpbmcucGx1bWUuc2l6ZSxcbiAgICAgICAgICAgIHNlZWQ6IDB4MmMwNyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwbHVtZS5wb2ludHMubmFtZSA9ICdUcmVzdGxlQ2FydFN0ZWFtJztcbiAgICAgICAgICBwbHVtZS5wb2ludHMub25CZWZvcmVSZW5kZXIgPSBhZHZhbmNlO1xuICAgICAgICAgIGNhcnQuYWRkKHBsdW1lLnBvaW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwbHVtZSkgcGx1bWUucG9pbnRzLnZpc2libGUgPSB2ZXJkaWN0IDwgMjtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RHb3JnZVdpc3BzID0gd2lzcHMucG9pbnRzLnZpc2libGUgPyBTdHJpbmcoZHJlc3Npbmcud2lzcHMuY291bnQpIDogJzAnO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gcGx1bWU/LnBvaW50cy52aXNpYmxlID8gU3RyaW5nKGRyZXNzaW5nLnBsdW1lLmNvdW50KSA6ICcwJztcbiAgICB9XG4gICAgdGlja3MgKz0gMTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIH07XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEdvcmdlV2lzcHMgPSBTdHJpbmcoZHJlc3Npbmcud2lzcHMuY291bnQpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW0gPSAnMCc7XG4gIHJldHVybiB7XG4gICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUod2lzcHMucG9pbnRzKTtcbiAgICAgIHdpc3BzLmRpc3Bvc2UoKTtcbiAgICAgIHBsdW1lPy5wb2ludHMucmVtb3ZlRnJvbVBhcmVudCgpO1xuICAgICAgcGx1bWU/LmRpc3Bvc2UoKTtcbiAgICAgIHBsdW1lID0gdW5kZWZpbmVkO1xuICAgICAgY2FydCA9IHVuZGVmaW5lZDtcbiAgICB9LFxuICB9O1xufVxuXG5jb25zdCBTVEVBTV9XSVNQX0pPSU5UUyA9IFsnZ2FyZGVuLXByZXNzdXJlLW1hbmlmb2xkJywgJ3dlc3QtdGVycmFjZS1waXBlLWhlYWRlcicsICdlYXN0LXRlcnJhY2UtcGlwZS1oZWFkZXInXTtcbmNvbnN0IFNURUFNX1dJU1BfQ09VTlQgPSA4O1xuY29uc3QgU1RFQU1fV0lTUF9IT1RfQk9JTEVSUyA9IDI7XG5cbi8qKiBQcmVzc3VyZSBHYXJkZW4gc3RlYW0gZm9sbG93cyB0aGUgc2FtZSBob3QtYm9pbGVyIGNvdW50IHB1Ymxpc2hlZCBieSBpdHMgSFVELiAqL1xuZnVuY3Rpb24gbW91bnRTdGVhbVdpc3BzKFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IFJlYWRvbmx5QXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4pOiBTdW5Nb3Rlc1tdIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCBob3N0LmNvbnRyYWN0SWQgIT09ICdlMi1wcmVzc3VyZS1nYXJkZW4nIHx8ICFob3N0LmhvdEJvaWxlcnMpIHJldHVybiBbXTtcbiAgY29uc3QgYnVpbHQ6IFN1bk1vdGVzW10gPSBbXTtcbiAgZm9yIChjb25zdCBpZCBvZiBTVEVBTV9XSVNQX0pPSU5UUykge1xuICAgIGNvbnN0IGpvaW50ID0gbW91bnRzLmZpbmQoKG1vdW50KSA9PiBtb3VudC5pZCA9PT0gaWQpPy5tb2RlbDtcbiAgICBpZiAoIWpvaW50KSBjb250aW51ZTtcbiAgICBjb25zdCBiYXNlID0gam9pbnQucG9zaXRpb24ueTtcbiAgICBjb25zdCB3aXNwcyA9IGNyZWF0ZVN1bk1vdGVzKHtcbiAgICAgIGNvdW50OiBTVEVBTV9XSVNQX0NPVU5ULFxuICAgICAgaGFsZlg6IDEuMzUsXG4gICAgICBoYWxmWjogMSxcbiAgICAgIGNlbnRlclo6IGpvaW50LnBvc2l0aW9uLnosXG4gICAgICBtaW5ZOiBiYXNlICsgMS4xLFxuICAgICAgbWF4WTogYmFzZSArIDQuMixcbiAgICAgIGRyaWZ0OiBuZXcgVEhSRUUuVmVjdG9yMigwLjE4LCAwLjA1KSxcbiAgICAgIHJpc2U6IDAuNDIsXG4gICAgICBjb2xvcjogJyNmNGYyZWMnLFxuICAgICAgc2l6ZTogMy40LFxuICAgICAgc2VlZDogMHg3MWMwICsgaWQubGVuZ3RoLFxuICAgIH0pO1xuICAgIHdpc3BzLnBvaW50cy5uYW1lID0gYCR7aWR9LlN0ZWFtV2lzcHNgO1xuICAgIHdpc3BzLnBvaW50cy5wb3NpdGlvbi54ID0gam9pbnQucG9zaXRpb24ueDtcbiAgICB3aXNwcy5wb2ludHMudmlzaWJsZSA9IGZhbHNlO1xuICAgIGxldCBsYXN0RnJhbWUgPSAtMTtcbiAgICBsZXQgbGFzdEF0ID0gMDtcbiAgICB3aXNwcy5wb2ludHMub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbnN0IGZyYW1lID0gcmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWU7XG4gICAgICBpZiAoZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgICAgY29uc3QgZGVsdGEgPSBsYXN0RnJhbWUgPCAwID8gMCA6IE1hdGgubWluKFNDVUxQVF9XQVRFUl9NQVhfREVMVEEsIE1hdGgubWF4KDAsIG5vdyAtIGxhc3RBdCkpO1xuICAgICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgICBsYXN0QXQgPSBub3c7XG4gICAgICB3aXNwcy5hZHZhbmNlKGRlbHRhKTtcbiAgICB9O1xuICAgIGhvc3Quc2NlbmUuYWRkKHdpc3BzLnBvaW50cyk7XG4gICAgYnVpbHQucHVzaCh3aXNwcyk7XG4gIH1cbiAgaWYgKCFidWlsdC5sZW5ndGgpIHJldHVybiBidWlsdDtcbiAgY29uc3QgcG9sbCA9ICgpID0+IHtcbiAgICBpZiAoIWJ1aWx0WzBdIS5wb2ludHMucGFyZW50KSByZXR1cm47XG4gICAgY29uc3QgaG90ID0gKGhvc3QuaG90Qm9pbGVycz8uKCkgPz8gMCkgPj0gU1RFQU1fV0lTUF9IT1RfQk9JTEVSUztcbiAgICBmb3IgKGNvbnN0IHdpc3BzIG9mIGJ1aWx0KSB3aXNwcy5wb2ludHMudmlzaWJsZSA9IGhvdDtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW1XaXNwcyA9IGhvdCA/IFN0cmluZyhidWlsdC5sZW5ndGggKiBTVEVBTV9XSVNQX0NPVU5UKSA6ICcwJztcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIH07XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtV2lzcHMgPSAnMCc7XG4gIHJldHVybiBidWlsdDtcbn1cblxuLyoqXG4gKiBVNCDigJQgbW91bnQgdGhlIGNvbnRyYWN0J3Mgc3RlYW0gY29sdW1uKHMpLlxuICpcbiAqIEZVTEwgdGllciBvbmx5LCBhbmQgcmVnaXN0ZXJlZCBpbiB0aGUgTVEtNCBzaGVkIG9yZGVyOiB0aGUgZmllbGQgZ29lcyBpbnZpc2libGUgKGFuZCB0aGVyZWZvcmVcbiAqIGNvc3RzIG5vdGhpbmcgYXQgYWxsLCByYXRoZXIgdGhhbiBmYWRpbmcpIHRoZSBtb21lbnQgdGhlIHJ1bnRpbWUgcDk1IHdhdGNoZG9nIHJldHVybnMgYSB2ZXJkaWN0LlxuICogRGVjb3JhdGlvbiBpcyB0aGUgZmlyc3QgdGhpbmcgdGhhdCBzaG91bGQgZ28gYW5kIHRoZSBsYXN0IHRoaW5nIHRoYXQgc2hvdWxkIGFyZ3VlIGFib3V0IGl0LlxuICovXG5mdW5jdGlvbiBtb3VudFN0ZWFtUGx1bWUoXG4gIGhvc3Q6IEhvc3QsXG4gIG1vdW50czogQXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4pOiBTdGVhbVBsdW1lIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgYW5jaG9ycyA9IFNURUFNX0FOQ0hPUlNbaG9zdC5jb250cmFjdElkXTtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCAhYW5jaG9ycz8ubGVuZ3RoKSByZXR1cm4gdW5kZWZpbmVkO1xuICBpZiAocGVyZm9ybWFuY2VUaWVyRGlhZ25vc3RpY3MoKS50aWVyICE9PSAnZnVsbCcpIHtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW0gPSAndGllci13aXRoaGVsZCc7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpO1xuICBjb25zdCBlbWl0dGVycyA9IGFuY2hvcnMuZmxhdE1hcCgoYW5jaG9yKSA9PiB7XG4gICAgY29uc3QgbW9kZWwgPSBtb3VudHMuZmluZCgoeyBpZCB9KSA9PiBpZCA9PT0gYW5jaG9yLm1vdW50KT8ubW9kZWw7XG4gICAgaWYgKCFtb2RlbCkgcmV0dXJuIFtdO1xuICAgIGJveC5zZXRGcm9tT2JqZWN0KG1vZGVsKTtcbiAgICByZXR1cm4gW3tcbiAgICAgIHg6IFRIUkVFLk1hdGhVdGlscy5sZXJwKGJveC5taW4ueCwgYm94Lm1heC54LCBhbmNob3IuYWNyb3NzWCksXG4gICAgICB5OiBUSFJFRS5NYXRoVXRpbHMubGVycChib3gubWluLnksIGJveC5tYXgueSwgYW5jaG9yLnVwWSksXG4gICAgICB6OiBUSFJFRS5NYXRoVXRpbHMubGVycChib3gubWluLnosIGJveC5tYXgueiwgYW5jaG9yLmFjcm9zc1opLFxuICAgICAgcmlzZTogYW5jaG9yLnJpc2UsXG4gICAgICBzcHJlYWQ6IGFuY2hvci5zcHJlYWQsXG4gICAgICBzaXplOiBhbmNob3Iuc2l6ZSxcbiAgICAgIGxpZmU6IGFuY2hvci5saWZlLFxuICAgICAgcHVmZnM6IGFuY2hvci5wdWZmcyxcbiAgICAgIG9wYWNpdHk6IGFuY2hvci5vcGFjaXR5LFxuICAgIH1dO1xuICB9KTtcbiAgaWYgKCFlbWl0dGVycy5sZW5ndGgpIHtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW0gPSAnbm8tYW5jaG9yLWJvZHknO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgbGVhbiA9IGxlZGdlclN1blNoYWRvd0RpcmVjdGlvbigpO1xuICBjb25zdCBwbHVtZSA9IGNyZWF0ZVN0ZWFtUGx1bWUoeyBlbWl0dGVycywgd2luZDogbmV3IFRIUkVFLlZlY3RvcjIobGVhbi54LCBsZWFuLnkpLCBjb2xvcjogU1RFQU1fQ09MT1VSLCBzZWVkOiAweDU3ZWEgfSk7XG4gIGxldCBsYXN0RnJhbWUgPSAtMTtcbiAgbGV0IGxhc3RBdCA9IDA7XG4gIHBsdW1lLnBvaW50cy5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlcikgPT4ge1xuICAgIGNvbnN0IGZyYW1lID0gcmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWU7XG4gICAgaWYgKGZyYW1lID09PSBsYXN0RnJhbWUpIHJldHVybjtcbiAgICBjb25zdCBub3cgPSBwZXJmb3JtYW5jZS5ub3coKSAvIDEwMDA7XG4gICAgY29uc3QgZGVsdGEgPSBsYXN0RnJhbWUgPCAwID8gMCA6IE1hdGgubWluKFNDVUxQVF9XQVRFUl9NQVhfREVMVEEsIE1hdGgubWF4KDAsIG5vdyAtIGxhc3RBdCkpO1xuICAgIGxhc3RGcmFtZSA9IGZyYW1lO1xuICAgIGxhc3RBdCA9IG5vdztcbiAgICBwbHVtZS5hZHZhbmNlKGRlbHRhKTtcbiAgfTtcbiAgLy8gUG9sbGVkIG9uIHRoZSBmcmFtZSBCRUZPUkUgdGhlIGRyYXcsIGV4YWN0bHkgYXMgdGhlIFJ1c2ggZW1iZXJzIGFyZSwgc28gYSBzaGVkIGZpZWxkIHN0b3BzXG4gIC8vIGNvc3RpbmcgYW55dGhpbmcgcmF0aGVyIHRoYW4gZmFkaW5nIG91dCBvdmVyIHNlY29uZHMuXG4gIGNvbnN0IHBvbGwgPSAoKSA9PiB7XG4gICAgaWYgKCFwbHVtZS5wb2ludHMucGFyZW50KSByZXR1cm47XG4gICAgY29uc3Qgc2hlZCA9IChob3N0LmRldGFpbEJ1ZGdldD8uKCkgPz8gMCkgPj0gMTtcbiAgICBwbHVtZS5wb2ludHMudmlzaWJsZSA9ICFzaGVkO1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IHNoZWQgPyAnc2hlZCcgOiBgJHtlbWl0dGVycy5sZW5ndGh9eCR7cGx1bWUuY291bnR9YDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIH07XG4gIGhvc3Quc2NlbmUuYWRkKHBsdW1lLnBvaW50cyk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gYCR7ZW1pdHRlcnMubGVuZ3RofXgke3BsdW1lLmNvdW50fWA7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbUFuY2hvcnMgPSBKU09OLnN0cmluZ2lmeShlbWl0dGVycy5tYXAoKGVtaXR0ZXIpID0+ICh7XG4gICAgeDogK2VtaXR0ZXIueC50b0ZpeGVkKDIpLFxuICAgIHk6ICtlbWl0dGVyLnkudG9GaXhlZCgyKSxcbiAgICB6OiArZW1pdHRlci56LnRvRml4ZWQoMiksXG4gIH0pKSk7XG4gIHJldHVybiBwbHVtZTtcbn1cblxuLyoqIEluY2xpbmUgY2FydC1zdGFjayBhbmQgd2luY2gtZW5kIHN0ZWFtOyBjYXBwZWQgYW5kIHNoZWQgYmVmb3JlIGdhbWVwbGF5IFZGWC4gKi9cbmZ1bmN0aW9uIG1vdW50SGF1bFN0ZWFtKFxuICBob3N0OiBIb3N0LFxuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsXG4gIG1vdW50czogQXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4pOiBIYXVsU3RlYW0gfCB1bmRlZmluZWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8IGhvc3QuY29udHJhY3RJZCAhPT0gJ2UyLWluY2xpbmUnKSByZXR1cm4gdW5kZWZpbmVkO1xuICBjb25zdCBhdCA9IChpZDogc3RyaW5nKTogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQgPT4gbW91bnRzLmZpbmQoKG1vdW50KSA9PiBtb3VudC5pZCA9PT0gaWQpPy5tb2RlbDtcbiAgY29uc3QgY2FibGVIb3VzZSA9IGF0KCd1cHBlci1vcmUtY2FibGUtaG91c2UnKTtcbiAgY29uc3QgY3JhbmUgPSBhdCgnbG93ZXIteWFyZC1lbmdpbmUtY3JhbmUnKTtcbiAgY29uc3QgdmVudHM6IEhhdWxWZW50W10gPSBbe1xuICAgIGlkOiAnZXNjb3J0LWNhcnQnLCB4OiAwLCB6OiAwLCB5OiAyLjIsIHJpZGVzOiB0cnVlLFxuICAgIGludGVydmFsOiAwLjYyLCBwaGFzZTogMCwgbGlmZTogMi40LCByaXNlOiAyLjEsIHJhZGl1czogMi45LCBncm93OiAxLjYsXG4gICAgZHJpZnQ6IFstMC4zNSwgLTAuMTVdLCBzbG90czogMyxcbiAgfV07XG4gIGlmIChjYWJsZUhvdXNlKSB2ZW50cy5wdXNoKHtcbiAgICBpZDogJ2NhYmxlLWhvdXNlJywgeDogY2FibGVIb3VzZS5wb3NpdGlvbi54IC0gMC42LCB6OiBjYWJsZUhvdXNlLnBvc2l0aW9uLnogLSAxLjQsIHk6IDUsXG4gICAgaW50ZXJ2YWw6IDEuNSwgcGhhc2U6IDAuNCwgbGlmZTogMy4yLCByaXNlOiAxLjMsIHJhZGl1czogMS40NSwgZ3JvdzogMS40LFxuICAgIGRyaWZ0OiBbLTAuNCwgLTAuMl0sIHNsb3RzOiAzLFxuICB9KTtcbiAgaWYgKGNyYW5lKSB2ZW50cy5wdXNoKHtcbiAgICBpZDogJ2VuZ2luZS1jcmFuZScsIHg6IGNyYW5lLnBvc2l0aW9uLnggKyAwLjQsIHo6IGNyYW5lLnBvc2l0aW9uLnogLSAxLCB5OiAzLjYsXG4gICAgaW50ZXJ2YWw6IDIuMSwgcGhhc2U6IDEuMSwgbGlmZTogMi44LCByaXNlOiAxLjA1LCByYWRpdXM6IDIuNywgZ3JvdzogMS43LFxuICAgIGRyaWZ0OiBbLTAuMywgLTAuMTJdLCBzbG90czogMixcbiAgfSk7XG4gIGlmICh2ZW50cy5sZW5ndGggPCAyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHN0ZWFtID0gY3JlYXRlSGF1bFN0ZWFtKHZlbnRzLCBoZWlnaHRBdCk7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBsZXQgc2hlZENoZWNrZWQgPSAwO1xuICBjb25zdCBwb2xsID0gKCkgPT4ge1xuICAgIGlmICghc3RlYW0uZ3JvdXAucGFyZW50KSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEF0ID09PSAwID8gMCA6IE1hdGgubWluKFNDVUxQVF9XQVRFUl9NQVhfREVMVEEsIE1hdGgubWF4KDAsIG5vdyAtIGxhc3RBdCkpO1xuICAgIGxhc3RBdCA9IG5vdztcbiAgICBpZiAobm93IC0gc2hlZENoZWNrZWQgPiAwLjUpIHtcbiAgICAgIHNoZWRDaGVja2VkID0gbm93O1xuICAgICAgc3RlYW0uc2V0RGV0YWlsQnVkZ2V0KGhvc3QuZGV0YWlsQnVkZ2V0Py4oKSA/PyAwKTtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gc3RlYW0uZGlhZ25vc3RpY3MoKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1BY3RpdmUgPSBTdHJpbmcoZGlhZ25vc3RpY3MuYWN0aXZlKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1TcGF3bmVkID0gU3RyaW5nKGRpYWdub3N0aWNzLnNwYXduZWQpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhhdWxTdGVhbURldGFpbCA9IFN0cmluZyhkaWFnbm9zdGljcy5kZXRhaWwpO1xuICAgIH1cbiAgICBzdGVhbS5hZHZhbmNlKGRlbHRhLCBob3N0LmhhdWxDYXJ0Py4oKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICB9O1xuICBob3N0LnNjZW5lLmFkZChzdGVhbS5ncm91cCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhhdWxTdGVhbSA9IFN0cmluZyh2ZW50cy5sZW5ndGgpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtQ2FwYWNpdHkgPSBTdHJpbmcodmVudHMucmVkdWNlKCh0b3RhbCwgdmVudCkgPT4gdG90YWwgKyB2ZW50LnNsb3RzLCAwKSk7XG4gIHJldHVybiBzdGVhbTtcbn1cblxuLyoqXG4gKiBVNWIg4oCUIHRoZSBSdXNoJ3MgcmV3YXJkIG5vdGU6IGEgd2FybSBlbWJlciBsaWZ0IG9mZiB0aGUgY2xhaW0tc3Rha2UgcmluZywgbGl2ZVxuICogb25seSB3aGlsZSB0aGUgcGxheWVyIGhhcyBjaG9zZW4gdG8gcHJlc3MgdGhlaXIgbHVjay4gU2FtZSBwb2ludCBmaWVsZCBhcyB0aGVcbiAqIG1vdGVzLCBvbmUgZHJhdyBjYWxsLCBoaWRkZW4gKGFuZCB0aGVyZWZvcmUgbmVhci1mcmVlKSB0aGUgcmVzdCBvZiB0aGUgdGltZS5cbiAqL1xuZnVuY3Rpb24gbW91bnRSdXNoRW1iZXJzKFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsXG4pOiBTdW5Nb3RlcyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIVJVU0hfRU1CRVJfQ09OVFJBQ1RTLmhhcyhob3N0LmNvbnRyYWN0SWQpIHx8ICFob3N0LnJ1c2hBY3RpdmUpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IHN0YWtlID0gbW91bnRzLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09ICdjbGFpbV9zdGFrZScpPy5tb2RlbDtcbiAgaWYgKCFzdGFrZSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZW1iZXJzID0gY3JlYXRlU3VuTW90ZXMoe1xuICAgIGNvdW50OiBSVVNIX0VNQkVSX0NPVU5ULFxuICAgIGhhbGZYOiAxLjE1LFxuICAgIGhhbGZaOiAxLjE1LFxuICAgIGNlbnRlclo6IHN0YWtlLnBvc2l0aW9uLnosXG4gICAgbWluWTogaGVpZ2h0QXQoc3Rha2UucG9zaXRpb24ueCwgc3Rha2UucG9zaXRpb24ueikgKyAwLjE1LFxuICAgIG1heFk6IGhlaWdodEF0KHN0YWtlLnBvc2l0aW9uLngsIHN0YWtlLnBvc2l0aW9uLnopICsgMi43LFxuICAgIGRyaWZ0OiBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKSxcbiAgICByaXNlOiAwLjU1LFxuICAgIGNvbG9yOiAnI2ZmOWEzYycsXG4gICAgc2l6ZTogMi40LFxuICAgIHNlZWQ6IDB4NTcxNSxcbiAgfSk7XG4gIGVtYmVycy5wb2ludHMubmFtZSA9ICdDbGFpbVN0YWtlUnVzaEVtYmVycyc7XG4gIGVtYmVycy5wb2ludHMucG9zaXRpb24ueCA9IHN0YWtlLnBvc2l0aW9uLng7XG4gIGVtYmVycy5wb2ludHMudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBlbWJlcnMucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyKSA9PiB7XG4gICAgY29uc3QgZnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICBpZiAoZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgICBjb25zdCBkZWx0YSA9IGxhc3RGcmFtZSA8IDAgPyAwIDogTWF0aC5taW4oU0NVTFBUX1dBVEVSX01BWF9ERUxUQSwgTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KSk7XG4gICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgbGFzdEF0ID0gbm93O1xuICAgIGVtYmVycy5hZHZhbmNlKGRlbHRhKTtcbiAgfTtcbiAgLy8gdmlzaWJsZSBpcyBwb2xsZWQgb2ZmIHRoZSBydW4gc3RhdGUgb24gdGhlIGZyYW1lIEJFRk9SRSB0aGUgZHJhdywgc28gYW4gZW5kZWRcbiAgLy8gUnVzaCBzdG9wcyBjb3N0aW5nIGFueXRoaW5nIGF0IGFsbCByYXRoZXIgdGhhbiBmYWRpbmcgb3V0IG92ZXIgc2Vjb25kcy5cbiAgY29uc3QgcG9sbCA9ICgpID0+IHtcbiAgICBpZiAoIWVtYmVycy5wb2ludHMucGFyZW50KSByZXR1cm47XG4gICAgZW1iZXJzLnBvaW50cy52aXNpYmxlID0gaG9zdC5ydXNoQWN0aXZlPy4oKSA9PT0gdHJ1ZTtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UnVzaEVtYmVycyA9IGVtYmVycy5wb2ludHMudmlzaWJsZSA/IFN0cmluZyhSVVNIX0VNQkVSX0NPVU5UKSA6ICcwJztcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIH07XG4gIGhvc3Quc2NlbmUuYWRkKGVtYmVycy5wb2ludHMpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RSdXNoRW1iZXJzID0gJzAnO1xuICByZXR1cm4gZW1iZXJzO1xufVxuXG4vKipcbiAqIERyeSBHdWxjaCBtb3VudHMgYSBMSVZFIHBvb2wgb3ZlciB0aGUgaXNvbGF0ZWRfc3ByaW5nLCBzbyB0aGF0IGxhbmRtYXJrJ3MgYmFrZWQgY3lhbiB3YXRlciBtdXN0XG4gKiBzdG9wIGdsb3dpbmcgYXQgZW1pc3NpdmUgMyDigJQgYSBmdWxsLWJyaWdodCBwb29sIGJlZCBzaGluZXMgdGhyb3VnaCB0aGUgc3VyZmFjZSBhYm92ZSBpdCBhbmQgdGhlXG4gKiBtYXAga2VlcHMgaXRzIGRlYWQtcGFpbnQgc211ZGdlLiBUaGUgcGFjayBpcyBvbmUgbWVzaCBvbiBvbmUgbWF0ZXJpYWwgKHBhY2sgbGF3KSwgc28gdGhlIHBvb2xcbiAqIGNhbm5vdCBiZSBkaW1tZWQgc2VwYXJhdGVseSBmcm9tIGl0cyBzdG9uZXMsIGFuZCBkcm9wcGluZyB0aGUgd2hvbGUgYm9keSBmYXIgZW5vdWdoIHRvIGtpbGwgdGhlXG4gKiBjeWFuIGFsc28ga2lsbGVkIHRoZSBzdG9uZSByaW5nLiAyLjEgaXMgd2hlcmUgdGhlIHR3byBsYW5kIHRvZ2V0aGVyOiBtZWFzdXJlZCwgdGhlIGxpdmUgc3VyZmFjZVxuICogYWxyZWFkeSBjb3ZlcnMgdGhlIGZsYXQgY2FwIGF0IGFscGhhIDAuODgtMC45ODUsIHNvIHRoZSByZXNpZHVhbCBjeWFuIGhhcyBub3doZXJlIHRvIHNob3csIHdoaWxlXG4gKiB0aGUgc3RvbmVzIOKAlCB3aGljaCBzdGFuZCBBQk9WRSB0aGUgd2F0ZXIgcGxhbmUgYW5kIGFyZSBuZXZlciBjb3ZlcmVkIOKAlCBrZWVwIHRoZWlyIHBhbGUgcmltIHJlYWQuXG4gKi9cbmNvbnN0IERSWV9HVUxDSF9TUFJJTkdfRU1JU1NJVkUgPSAyLjE7XG5cbi8qKiBXYXRlciBzaXRzIHdpdGhpbiB0aGUgc2N1bHB0ZWQgc3ByaW5nIGJlZDsgaXRzIHJhZGl1cyByZW1haW5zIHNpbXVsYXRpb24tb3duZWQuICovXG50eXBlIExpdmVTcHJpbmdQb29sID0geyBzdXJmYWNlWTogbnVtYmVyIH07XG5jb25zdCBMSVZFX1NQUklOR19QT05EX0NPTlRSQUNUUyA9IG5ldyBNYXA8c3RyaW5nLCBMaXZlU3ByaW5nUG9vbD4oW1xuICBbJ2UxLWRyeS1ndWxjaCcsIHsgc3VyZmFjZVk6IDAuMTkgfV0sXG5dKTtcblxuLyoqXG4gKiBUSEUgUE9PTCBHUkFERSAoRi1CRUFVVFktMiwgcmV2aWV3cy9iZWF1dHktcG9vbHMubWQpIOKAlCBhIHByZS10b25lbWFwIGdyYWRlICsgZXhwb3N1cmUgc2hvdWxkZXJcbiAqIGZvciB0aGUgd2FybSBuaWdodCBwb29scywgb24gdGhlIHRlcnJhaW4gZnJhZ21lbnQgb25seSwgcmlnaHQgYmVmb3JlIEFDRVMgc2VlcyBpdC5cbiAqXG4gKiBNZWFzdXJlZCBtZWNoYW5pc20gKHRyYW5zZWN0IHJpZywgZTJlL2JlYXV0eS1wb29scy5zcGVjLnRzKTogdGhlIHdhcm0gcG9vbCBncm91bmQgaXMgYWxyZWFkeVxuICogYW1iZXIgaW4gaXNvbGF0aW9uIChzYXQgMC41Mi0wLjYzIGF0IGh1ZSB+NDAgZGVnKSwgYW5kIHdhcm0rd2FybSBvdmVybGFwIHN0YXlzIGFtYmVyIOKAlCBidXQgdGhlXG4gKiBoZXJvJ3MvcHJvc3BlY3RvcidzIGNvb2wgbGlnaHQgc3RhbmRpbmcgaW4gYSBwb29sIGNvbGxhcHNlcyB0aGUgc2FtZSBwaXhlbHMgdG8gc2F0IH4wLjIwIGF0XG4gKiBodWUgfjE0IGRlZywgYSBwYWxlIGh1ZWxlc3MgZGlzYyBleGFjdGx5IHdoZXJlIHRoZSBwbGF5ZXIgbG9va3MuIEFuIGFkZGl0aXZlIGh1ZSBzaGlmdCBjYW5ub3RcbiAqIGJlIHVuZG9uZSBieSBhbnkgbHVtaW5hbmNlIGN1cnZlLCBzbyB0aGUgc2VhbSBoYXMgdHdvIHBhcnRzOlxuICogIDEuIHJlLWFuY2hvciB0aGUgZnJhZ21lbnQncyBjaHJvbWEgdG93YXJkIHRoZSBwb29sJ3Mgb3duIHdhcm0gYXhpcyBhdCBQUkVTRVJWRUQgbHVtYSDigJQgdGhlXG4gKiAgICAgZ3JvdW5kIHVuZGVyIGEgbGFudGVybiBiZWxvbmdzIHRvIHRoZSBsYW50ZXJuOyBmaWd1cmVzIGFib3ZlIGl0IGtlZXAgdGhlIGNvb2wgbGlnaHQ7XG4gKiAgMi4gYSBodWUtcHJlc2VydmluZyBSZWluaGFyZCBzaG91bGRlciBvbiB0aGUgcHJlLXRvbmVtYXAgbWF4IGNoYW5uZWwgKGtuZWUgLT4gY2VpbGluZyksIHRoZVxuICogICAgIHBvb2wncyBvd24gZXhwb3N1cmUgdHJlYXRtZW50LCBzbyBhbnkgb3Zlci1yYW5nZSBzdW0gcm9sbHMgb2ZmIGJlZm9yZSBBQ0VTIGNhbiBibGVhY2ggaXQuXG4gKiBCb3RoIHNjYWxlIHdpdGggd2FybS1wb29sIGNvdmVyYWdlIHggZGFya25lc3M6IHplcm8gYXQgZGF5LCB6ZXJvIG91dHNpZGUgcG9vbHMsIHplcm8gb24gY29vbFxuICogcG9vbHMsIGFuZCB0aGUgd2hvbGUgYmxvY2sgaXMgY29tcGlsZWQgb3V0IHVuZGVyID9ub3Bvb2xncmFkZSAoYnl0ZS1pZGVudGljYWwgc2hhZGVyIGNvbnRyb2wpLlxuICovXG5jb25zdCBQT09MX0dSQURFX0dMU0wgPSBgXG5mbG9hdCB0ZXJyYWluM2RHcmFkZUFtb3VudCA9IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZVN0cmVuZ3RoICogdGVycmFpbjNkUG9vbEdyYWRlTWFzayAqIHVUZXJyYWluM2ROaWdodFBvb2xEYXJrbmVzcztcbmlmICh0ZXJyYWluM2RHcmFkZUFtb3VudCA+IDAuMDAxKSB7XG4gIHZlYzMgdGVycmFpbjNkR3JhZGVMdW1hVyA9IHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMik7XG4gIGZsb2F0IHRlcnJhaW4zZEdyYWRlTHVtYSA9IGRvdChvdXRnb2luZ0xpZ2h0LCB0ZXJyYWluM2RHcmFkZUx1bWFXKTtcbiAgdmVjMyB0ZXJyYWluM2RHcmFkZUFuY2hvciA9IHRlcnJhaW4zZFBvb2xHcmFkZVRpbnRcbiAgICAqICh0ZXJyYWluM2RHcmFkZUx1bWEgLyBtYXgoZG90KHRlcnJhaW4zZFBvb2xHcmFkZVRpbnQsIHRlcnJhaW4zZEdyYWRlTHVtYVcpLCAxZS00KSk7XG4gIHZlYzMgdGVycmFpbjNkR3JhZGVkID0gbWl4KG91dGdvaW5nTGlnaHQsIHRlcnJhaW4zZEdyYWRlQW5jaG9yLCB0ZXJyYWluM2RHcmFkZUFtb3VudCk7XG4gIGZsb2F0IHRlcnJhaW4zZEdyYWRlTWF4ID0gbWF4KHRlcnJhaW4zZEdyYWRlZC5yLCBtYXgodGVycmFpbjNkR3JhZGVkLmcsIHRlcnJhaW4zZEdyYWRlZC5iKSk7XG4gIGlmICh0ZXJyYWluM2RHcmFkZU1heCA+IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUpIHtcbiAgICBmbG9hdCB0ZXJyYWluM2RHcmFkZUNvbXByZXNzZWQgPSB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVLbmVlXG4gICAgICArICh0ZXJyYWluM2RHcmFkZU1heCAtIHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUpXG4gICAgICAvICgxLjAgKyAodGVycmFpbjNkR3JhZGVNYXggLSB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVLbmVlKVxuICAgICAgICAvIG1heCh1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVDZWlsaW5nIC0gdVRlcnJhaW4zZE5pZ2h0UG9vbEdyYWRlS25lZSwgMWUtMykpO1xuICAgIHRlcnJhaW4zZEdyYWRlZCAqPSB0ZXJyYWluM2RHcmFkZUNvbXByZXNzZWQgLyB0ZXJyYWluM2RHcmFkZU1heDtcbiAgfVxuICBvdXRnb2luZ0xpZ2h0ID0gdGVycmFpbjNkR3JhZGVkO1xufVxuYDtcblxuZnVuY3Rpb24gaGlkZVBhaW50ZWRHcm91bmQoaG9zdDogSG9zdCk6IEhpZGRlblJlbGllZltdIHsgcmV0dXJuIGhpZGVQYWludGVkUmVsaWVmKGhvc3QpOyB9XG4vKiogUXVpZXQgdGhlIHdvcmtlZCBiYW5rIHNoZWx2ZXMgd2hpbGUgcmV0YWluaW5nIHRoZSBhdXRob3JlZCB3ZXQgbGlwcyBhbmQgdGlsZSBlZGdlLiAqL1xuZnVuY3Rpb24gY2FsbVR3aW5CYW5rc0dyb3VuZChtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiBtZXNoLm1hdGVyaWFsLm1hcCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy50d2luQmFua3NEcnlQaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYWQ5YzdiJykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2VHdpbkJhbmtzV29ybGQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudlR3aW5CYW5rc1dvcmxkID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUd2luQmFua3NXb3JsZDtcXG51bmlmb3JtIHZlYzMgdHdpbkJhbmtzRHJ5UGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IHR3aW5CYW5rc1NvdXRoID0gMS4wIC0gc21vb3Roc3RlcCgwLjQ1LCAxLjY1LCBsZW5ndGgoKHZUd2luQmFua3NXb3JsZCAtIHZlYzIoLTEzLjAsIC0xNC4wKSkgLyB2ZWMyKDEzLjAsIDguMCkpKTtcbmZsb2F0IHR3aW5CYW5rc05vcnRoID0gMS4wIC0gc21vb3Roc3RlcCgwLjQ1LCAxLjY1LCBsZW5ndGgoKHZUd2luQmFua3NXb3JsZCAtIHZlYzIoMTMuNSwgMTQuMikpIC8gdmVjMigxMy4wLCA4LjApKSk7XG5mbG9hdCB0d2luQmFua3NEcnkgPSBzbW9vdGhzdGVwKDYuMCwgMTAuMCwgYWJzKHZUd2luQmFua3NXb3JsZC55KSk7XG5mbG9hdCB0d2luQmFua3NFZGdlID0gMS4wIC0gc21vb3Roc3RlcCgyNC4wLCAzMS4wLCBtYXgoYWJzKHZUd2luQmFua3NXb3JsZC54KSwgYWJzKHZUd2luQmFua3NXb3JsZC55KSkpO1xuZmxvYXQgdHdpbkJhbmtzUXVpZXQgPSBtaXgoMC4yMCwgMC40OCwgbWF4KHR3aW5CYW5rc1NvdXRoLCB0d2luQmFua3NOb3J0aCkpICogdHdpbkJhbmtzRHJ5ICogdHdpbkJhbmtzRWRnZTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgdHdpbkJhbmtzRHJ5UGlnbWVudCwgdHdpbkJhbmtzUXVpZXQpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ3R3aW4tYmFua3MtZHJ5LWJhbmstcGlnbWVudC12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBMaWZ0IG9ubHkgdGhlIGRlZXBlc3QgcGFpbnRlZCBzY29yY2ggcGlnbWVudCwgcmV0YWluaW5nIGl0cyBlZGdlcyBhbmQgZ3JpdC4gKi9cbmZ1bmN0aW9uIHNlcGFyYXRlQmFyb25Hcm91bmRTY2Fycyhtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiBtZXNoLm1hdGVyaWFsLm1hcCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5iYXJvbldhcm1QaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjNzc2MTRjJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5iYXJvbkNvbGRQaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjNjI3MDc4JykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2QmFyb25Hcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkJhcm9uR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZCYXJvbkdyb3VuZDtcXG51bmlmb3JtIHZlYzMgYmFyb25XYXJtUGlnbWVudDtcXG51bmlmb3JtIHZlYzMgYmFyb25Db2xkUGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGJhcm9uSW5rID0gMS4wIC0gc21vb3Roc3RlcCgwLjAxOCwgMC4wOSwgZG90KGRpZmZ1c2VDb2xvci5yZ2IsIHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMikpKTtcbmZsb2F0IGJhcm9uRHJ5ID0gc21vb3Roc3RlcCg2LjAsIDcuNSwgYWJzKHZCYXJvbkdyb3VuZC55KSk7XG5mbG9hdCBiYXJvbkVkZ2UgPSAxLjAgLSBzbW9vdGhzdGVwKDI1LjAsIDMxLjAsIG1heChhYnModkJhcm9uR3JvdW5kLngpLCBhYnModkJhcm9uR3JvdW5kLnkpKSk7XG52ZWMzIGJhcm9uUGlnbWVudCA9IG1peChiYXJvbldhcm1QaWdtZW50LCBiYXJvbkNvbGRQaWdtZW50LCBzbW9vdGhzdGVwKDYuMCwgMTAuMCwgLXZCYXJvbkdyb3VuZC55KSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGJhcm9uUGlnbWVudCwgMC4zMiAqIGJhcm9uSW5rICogYmFyb25EcnkgKiBiYXJvbkVkZ2UpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ2Jhcm9uLXNjb3JjaC1waWdtZW50LXYxJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIFF1aWV0IHRoZSB3b3JrZWQgYXBwcm9hY2hlcyB3aXRob3V0IHJlcGFpbnRpbmcgdGhlIGdvcmdlIG9yIGl0cyB3YXRlcmxpbmUuICovXG5mdW5jdGlvbiBjYWxtVHJlc3RsZUFwcHJvYWNoZXMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMudHJlc3RsZVdvcmtlZFBpZ21lbnQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM4YjcyNTYnKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUcmVzdGxlR3JvdW5kOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PlxcbnZUcmVzdGxlR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUcmVzdGxlR3JvdW5kO1xcbnVuaWZvcm0gdmVjMyB0cmVzdGxlV29ya2VkUGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IHRyZXN0bGVCYW5rID0gc21vb3Roc3RlcCg2LjI1LCA5LjAsIGFicyh2VHJlc3RsZUdyb3VuZC55KSk7XG5mbG9hdCB0cmVzdGxlRWRnZSA9IDEuMCAtIHNtb290aHN0ZXAoMjkuMCwgNDIuMCwgbWF4KGFicyh2VHJlc3RsZUdyb3VuZC54KSwgYWJzKHZUcmVzdGxlR3JvdW5kLnkpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIHRyZXN0bGVXb3JrZWRQaWdtZW50LCAwLjIzICogdHJlc3RsZUJhbmsgKiB0cmVzdGxlRWRnZSk7YCk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiAndHJlc3RsZS13b3JrZWQtYXBwcm9hY2hlcy12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBRdWlldCBkZXNlcnQgcGlnbWVudCBhbmQgd2hlZWwgY3V0cyBmb2xsb3cgdGhlIHB1Ymxpc2hlZCBNb3RvciBtYXNrcywgbmV2ZXIgbmV3IHJvYWRzLiAqL1xuZnVuY3Rpb24gY2xhcmlmeU1vdG9yR3JvdW5kKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgdHJ1dGg6IE1vdG9yR3JvdW5kVHJ1dGgsIHBhbm9yYW1hID0gZmFsc2UsIHBhaW50TWl4ID0gMC43OCk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIGNvbnN0IHJvYWRzID0gdHJ1dGgucm9hZENvcnJpZG9ycyA/PyBbXTtcbiAgY29uc3Qgc2VhbXMgPSB0cnV0aC50YXJTZWFtcyA/PyBbXTtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JQYWludE1peCA9IHsgdmFsdWU6IHBhaW50TWl4IH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JFYXJ0aCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzlmODU2NCcpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JSb2FkID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYzVhMjc0JykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3RvclJvYWRzID0geyB2YWx1ZTogcm9hZHMubWFwKHIgPT4gbmV3IFRIUkVFLlZlY3RvcjQoci5zdGFydC54LCByLnN0YXJ0LnosIHIuZW5kLngsIHIuZW5kLnopKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLm1vdG9yVGFyID0geyB2YWx1ZTogc2VhbXMubGVuZ3RoID8gc2VhbXMubWFwKHMgPT4gbmV3IFRIUkVFLlZlY3RvcjMocy54LCBzLnosIHMucmFkaXVzKSkgOiBbbmV3IFRIUkVFLlZlY3RvcjMoKV0gfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3Rvck9yYml0ID0geyB2YWx1ZTogdHJ1dGgub3JiaXRTcGF3bj8ucmFkaXVzID8/IDAgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3RvckhhbGZTaXplID0geyB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIodHJ1dGguZGltZW5zaW9ucyEud2lkdGggLyAyLCB0cnV0aC5kaW1lbnNpb25zIS5oZWlnaHQgLyAyKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZNb3Rvckdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52TW90b3JHcm91bmQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgYCNpbmNsdWRlIDxjb21tb24+XG52YXJ5aW5nIHZlYzMgdk1vdG9yR3JvdW5kO1xudW5pZm9ybSB2ZWMzIG1vdG9yRWFydGgsIG1vdG9yUm9hZDtcbnVuaWZvcm0gdmVjNCBtb3RvclJvYWRzWyR7cm9hZHMubGVuZ3RofV07XG51bmlmb3JtIHZlYzMgbW90b3JUYXJbJHtNYXRoLm1heCgxLCBzZWFtcy5sZW5ndGgpfV07XG51bmlmb3JtIHZlYzIgbW90b3JIYWxmU2l6ZTtcbnVuaWZvcm0gZmxvYXQgbW90b3JPcmJpdCwgbW90b3JQYWludE1peDtgKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbnZlYzIgbW90b3JQID0gdk1vdG9yR3JvdW5kLnh6O1xudmVjMyBtb3Rvck9yaWdpbmFsID0gZGlmZnVzZUNvbG9yLnJnYjtcbmZsb2F0IG1vdG9yR3JhaW4gPSBmcmFjdChzaW4oZG90KGZsb29yKG1vdG9yUCAqIDE4LjApLCB2ZWMyKDEyLjk4OTgsNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XG5mbG9hdCBtb3Rvck1vdHRsZSA9IHNpbihtb3RvclAueCAqIDAuMzcgKyBzaW4obW90b3JQLnkgKiAwLjIxKSkgKiBzaW4obW90b3JQLnkgKiAwLjQzKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JFYXJ0aCAqICgwLjk0ICsgbW90b3JHcmFpbiAqIDAuMDYgKyBtb3Rvck1vdHRsZSAqIDAuMDM1KSwgbW90b3JIYWxmU2l6ZS54ID4gMTAwLjAgPyAwLjk1IDogbW90b3JQYWludE1peCk7XG5mbG9hdCBtb3RvckRpc3RhbmNlID0gMTAwMDAuMDtcbmZsb2F0IG1vdG9yUnV0ID0gMC4wO1xuZm9yIChpbnQgaSA9IDA7IGkgPCAke3JvYWRzLmxlbmd0aH07IGkrKykge1xuICB2ZWMyIGEgPSBtb3RvclJvYWRzW2ldLnh5LCBiID0gbW90b3JSb2Fkc1tpXS56dywgYWIgPSBiIC0gYTtcbiAgZmxvYXQgYWxvbmcgPSBkb3QobW90b3JQIC0gYSwgYWIpIC8gZG90KGFiLCBhYik7XG4gIGZsb2F0IGRpc3RhbmNlID0gbGVuZ3RoKG1vdG9yUCAtIGEgLSBhYiAqIGNsYW1wKGFsb25nLCAwLjAsIDEuMCkpO1xuICBtb3RvckRpc3RhbmNlID0gbWluKG1vdG9yRGlzdGFuY2UsIGRpc3RhbmNlKTtcbiAgbW90b3JSdXQgPSBtYXgobW90b3JSdXQsICgxLjAgLSBzbW9vdGhzdGVwKDAuMTIsIDAuMjggKyBmd2lkdGgoZGlzdGFuY2UpLCBhYnMoZGlzdGFuY2UgLSAxLjU1KSkpICogc21vb3Roc3RlcCgwLjAsIDAuMDYsIGFsb25nKSAqICgxLjAgLSBzbW9vdGhzdGVwKDAuOTQsIDEuMCwgYWxvbmcpKSk7XG59XG5pZiAobW90b3JPcmJpdCA+IDAuMCkge1xuICBmbG9hdCBhbmdsZSA9IGF0YW4obW90b3JQLnksIG1vdG9yUC54KTtcbiAgZmxvYXQgd29iYmxlID0gc2luKGFuZ2xlICogMy4wICsgMC40KSAqIDAuNjIgKyBzaW4oYW5nbGUgKiA3LjAgLSAwLjgpICogMC4yODtcbiAgZmxvYXQgZGlzdGFuY2UgPSBhYnMobGVuZ3RoKG1vdG9yUCkgLSBtb3Rvck9yYml0IC0gd29iYmxlKTtcbiAgbW90b3JEaXN0YW5jZSA9IG1pbihtb3RvckRpc3RhbmNlLCBkaXN0YW5jZSk7XG4gIG1vdG9yUnV0ID0gbWF4KG1vdG9yUnV0LCAxLjAgLSBzbW9vdGhzdGVwKDAuMTIsIDAuMjggKyBmd2lkdGgoZGlzdGFuY2UpLCBhYnMoZGlzdGFuY2UgLSAxLjU1KSkpO1xufVxuZmxvYXQgbW90b3JSb2FkTWFzayA9IDEuMCAtIHNtb290aHN0ZXAoMi44LCA0LjgsIG1vdG9yRGlzdGFuY2UpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBtb3RvclJvYWQgKiAoMC45NiArIG1vdG9yR3JhaW4gKiAwLjA0KSwgbW90b3JSb2FkTWFzayAqIDAuNjIpO1xuZGlmZnVzZUNvbG9yLnJnYiAqPSAxLjAgLSBtb3RvclJ1dCAqIDAuMTY7XG5mb3IgKGludCBpID0gMDsgaSA8ICR7c2VhbXMubGVuZ3RofTsgaSsrKSB7XG4gIGZsb2F0IHJhZGl1cyA9IGxlbmd0aChtb3RvclAgLSBtb3RvclRhcltpXS54eSkgLyBtb3RvclRhcltpXS56O1xuICBmbG9hdCB0YXIgPSAxLjAgLSBzbW9vdGhzdGVwKDAuNjUsIDEuMDUgKyBtb3Rvck1vdHRsZSAqIDAuMTIsIHJhZGl1cyk7XG4gIGRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JFYXJ0aCAqIDAuMjgsIHRhciAqIDAuNjIpO1xufVxuZmxvYXQgbW90b3JJbnRlcmlvciA9IDEuMCAtIHNtb290aHN0ZXAoMC43MiwgMS4wLCBtYXgoYWJzKG1vdG9yUC54KSAvIG1vdG9ySGFsZlNpemUueCwgYWJzKG1vdG9yUC55KSAvIG1vdG9ySGFsZlNpemUueSkpO1xuaWYgKG1vdG9ySGFsZlNpemUueCA+IDEwMC4wKSBtb3RvckludGVyaW9yID0gKDEuMCAtIHNtb290aHN0ZXAoMjA1LjAsIDI2MC4wLCBhYnMobW90b3JQLngpKSkgKiAoMS4wIC0gc21vb3Roc3RlcCgwLjcyLCAxLjAsIGFicyhtb3RvclAueSkgLyBtb3RvckhhbGZTaXplLnkpKSAqICgxLjAgLSBzbW9vdGhzdGVwKDEuMCwgMTIuMCwgdk1vdG9yR3JvdW5kLnkpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgobW90b3JPcmlnaW5hbCwgZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JJbnRlcmlvcik7JHtwYW5vcmFtYSA/ICdcXG4vLyBCYWxhbmNlIHRoZSBkaWZmZXJlbnRseSBsaXQgTG9uZyBSb2FkIGFwcm9uIGFnYWluc3QgaXRzIGFkamFjZW50IGVhcnRoLlxcbmRpZmZ1c2VDb2xvci5yZ2IgKj0gbWl4KDEuMCwgMS4xMiwgbW90b3JJbnRlcmlvcik7JyA6ICcnfWApO1xuICAgICAgaWYgKHBhbm9yYW1hKSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZSgnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsICcjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+XFxudG90YWxFbWlzc2l2ZVJhZGlhbmNlICo9IDEuMCAtIG1vdG9ySW50ZXJpb3I7Jyk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiBgbW90b3ItZ3JvdW5kLSR7cm9hZHMubGVuZ3RofS0ke3NlYW1zLmxlbmd0aH0tJHtwYW5vcmFtYX0tdjJgO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG4vKiogRmluZSByZWdvbGl0aCBwaWdtZW50IHJlcGxhY2VzIHRoZSByZXVzZWQgTWFyZSdzIGJyb2FkIHBhaW50IGJhbmRzLCB3aXRob3V0IGEgbmV3IHN1cmZhY2UuICovXG5mdW5jdGlvbiBjbGFyaWZ5RmFyU2lkZVJlZ29saXRoKG1vZGVsOiBUSFJFRS5PYmplY3QzRCk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAobWVzaC5pc01lc2ggJiYgIUFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgJiYgbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsICYmIG1lc2gubWF0ZXJpYWwubWFwKSBtYXRlcmlhbHMuYWRkKG1lc2gubWF0ZXJpYWwpO1xuICB9KTtcbiAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBtYXRlcmlhbHMpIHtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmZhclNpZGVEdXN0ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYWFhNTk2JykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5mYXJTaWRlUmltID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYzRiYmE1JykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2RmFyU2lkZUdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52RmFyU2lkZUdyb3VuZCA9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkZhclNpZGVHcm91bmQ7XFxudW5pZm9ybSB2ZWMzIGZhclNpZGVEdXN0LCBmYXJTaWRlUmltOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxudmVjMiBmYXJTaWRlUCA9IHZGYXJTaWRlR3JvdW5kLnh6O1xuZmxvYXQgZmFyU2lkZUdyYWluID0gZnJhY3Qoc2luKGRvdChmbG9vcih2RmFyU2lkZUdyb3VuZCAqIDE4LjApLCB2ZWMzKDEyLjk4OTgsIDc4LjIzMywgMzcuNzE5KSkpICogNDM3NTguNTQ1Myk7XG5mbG9hdCBmYXJTaWRlR3JhaW5GYWRlID0gMS4wIC0gc21vb3Roc3RlcCgwLjQsIDEuMiwgbWF4KG1heChmd2lkdGgodkZhclNpZGVHcm91bmQueCksIGZ3aWR0aCh2RmFyU2lkZUdyb3VuZC56KSksIGZ3aWR0aCh2RmFyU2lkZUdyb3VuZC55KSkgKiAxOC4wKTtcbmZsb2F0IGZhclNpZGVNb3R0bGUgPSBzaW4oZmFyU2lkZVAueCAqIDAuNzMgKyBzaW4oZmFyU2lkZVAueSAqIDAuNDEpKSAqIHNpbihmYXJTaWRlUC55ICogMC44Nyk7XG52ZWMzIGZhclNpZGVQaWdtZW50ID0gbWl4KGZhclNpZGVEdXN0LCBmYXJTaWRlUmltLCBzbW9vdGhzdGVwKDAuNSwgNS44LCB2RmFyU2lkZUdyb3VuZC55KSk7XG5mYXJTaWRlUGlnbWVudCAqPSAwLjk2ICsgKGZhclNpZGVHcmFpbiAtIDAuNSkgKiAwLjE0ICogZmFyU2lkZUdyYWluRmFkZSArIGZhclNpZGVNb3R0bGUgKiAwLjA0NTtcbmZsb2F0IGZhclNpZGVJbnRlcmlvciA9IDEuMCAtIHNtb290aHN0ZXAoNTQuMCwgNjMuMCwgbWF4KGFicyhmYXJTaWRlUC54KSwgYWJzKGZhclNpZGVQLnkpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGZhclNpZGVQaWdtZW50LCAwLjkyICogZmFyU2lkZUludGVyaW9yKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdmYXItc2lkZS1yZWdvbGl0aC12Mic7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBBIGNpcmN1bGFyIG1lbW9yaWFsIGlubGF5IHN0YXlzIG9uIHRoZSBjb21wbGV0ZSBhdXRob3JlZCBzcXVhcmUgZmxvb3IuICovXG5mdW5jdGlvbiBwYWludExhc3RDbGFpbURlY2sobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCAhbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsKSByZXR1cm47XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsLCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLm1lbW9yaWFsQnJhc3MgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyNjNGE0NjUnKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLm1lbW9yaWFsQmFuZCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzhjODI3MCcpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdk1lbW9yaWFsRGVjazsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52TWVtb3JpYWxEZWNrID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZNZW1vcmlhbERlY2s7XFxudW5pZm9ybSB2ZWMzIG1lbW9yaWFsQnJhc3MsIG1lbW9yaWFsQmFuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgXG4jaWZkZWYgVVNFX01BUFxuLy8gUG9sYXIgcGFpbnQgbGl2ZXMgaW4gdGhlIHNoYWRlcjogdGhlIHNhbXBsZXIncyByZWd1bGFyIGdyaWQgaGFzIG5vIFVWIHNlYW0gZHVwbGljYXRlcy5cbnZlYzIgbWVtb3JpYWxVViA9IHZlYzIoYXRhbih2TWVtb3JpYWxEZWNrLnksIHZNZW1vcmlhbERlY2sueCkgLyA2LjI4MzE4NTMwNzE4ICogMTYuMCwgbGVuZ3RoKHZNZW1vcmlhbERlY2spIC8gMjIuMCk7XG5kaWZmdXNlQ29sb3IgKj0gdGV4dHVyZTJEKG1hcCwgbWVtb3JpYWxVVik7XG4jZW5kaWZcbmZsb2F0IG1lbW9yaWFsUmFkaXVzID0gbGVuZ3RoKHZNZW1vcmlhbERlY2spO1xuZmxvYXQgbWVtb3JpYWxJbnNpZGUgPSAxLjAgLSBzbW9vdGhzdGVwKDU1LjgsIDU3LjAsIG1lbW9yaWFsUmFkaXVzKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSAocG93KG1heChkaWZmdXNlQ29sb3IucmdiLCB2ZWMzKDAuMCkpLCB2ZWMzKDAuNjgpKSAqIDAuODQgKyB2ZWMzKDAuMDI2KSkgKiBtaXgoMC43NiwgMS4wLCBtZW1vcmlhbEluc2lkZSk7XG5mbG9hdCBtZW1vcmlhbEFubnVsdXMgPSBzbW9vdGhzdGVwKDQ0LjcsIDQ1LjAsIG1lbW9yaWFsUmFkaXVzKSAqICgxLjAgLSBzbW9vdGhzdGVwKDQ4LjMsIDQ4LjYsIG1lbW9yaWFsUmFkaXVzKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIG1lbW9yaWFsQmFuZCwgbWVtb3JpYWxBbm51bHVzICogMC4yNCk7XG5mbG9hdCBtZW1vcmlhbFJpbmdEaXN0YW5jZSA9IG1pbihtaW4oYWJzKG1lbW9yaWFsUmFkaXVzIC0gNDQuNiksIGFicyhtZW1vcmlhbFJhZGl1cyAtIDQ4LjcpKSwgbWluKGFicyhtZW1vcmlhbFJhZGl1cyAtIDU1LjIpLCBtaW4oYWJzKG1lbW9yaWFsUmFkaXVzIC0gMjAuMCksIGFicyhtZW1vcmlhbFJhZGl1cyAtIDUuMCkpKSk7XG5mbG9hdCBtZW1vcmlhbFJpbmcgPSAxLjAgLSBzbW9vdGhzdGVwKDAuMDY1LCAwLjE2LCBtZW1vcmlhbFJpbmdEaXN0YW5jZSk7XG5mbG9hdCBtZW1vcmlhbFNwb2tlRGlzdGFuY2UgPSBhYnMoc2luKGF0YW4odk1lbW9yaWFsRGVjay55LCB2TWVtb3JpYWxEZWNrLngpICogNi4wKSkgKiBtZW1vcmlhbFJhZGl1cztcbmZsb2F0IG1lbW9yaWFsU3Bva2UgPSAoMS4wIC0gc21vb3Roc3RlcCgwLjA4LCAwLjIwLCBtZW1vcmlhbFNwb2tlRGlzdGFuY2UpKSAqIHNtb290aHN0ZXAoNC41LCA1LjAsIG1lbW9yaWFsUmFkaXVzKSAqICgxLjAgLSBzbW9vdGhzdGVwKDQzLjksIDQ0LjMsIG1lbW9yaWFsUmFkaXVzKSk7XG4vLyBTbWFsbCBkaXZpc2lvbnMgd2l0aGluIHRoZSBvdXRlciBiYW5kcyByZWFkIGFzIGEgc3VydmV5ZWQgbWVtb3JpYWwgZGVjay5cbmZsb2F0IG1lbW9yaWFsQW5nbGUgPSBhdGFuKHZNZW1vcmlhbERlY2sueSwgdk1lbW9yaWFsRGVjay54KTtcbmZsb2F0IG1lbW9yaWFsVGljayA9ICgxLjAgLSBzbW9vdGhzdGVwKDAuMDQsIDAuMTEsIGFicyhzaW4obWVtb3JpYWxBbmdsZSAqIDk2LjApKSAqIG1lbW9yaWFsUmFkaXVzKSlcbiAgKiBzbW9vdGhzdGVwKDQ4LjksIDQ5LjAsIG1lbW9yaWFsUmFkaXVzKSAqICgxLjAgLSBzbW9vdGhzdGVwKDQ5LjgsIDQ5LjksIG1lbW9yaWFsUmFkaXVzKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIG1lbW9yaWFsQnJhc3MsIG1heChtYXgobWVtb3JpYWxSaW5nLCBtZW1vcmlhbFNwb2tlKSwgbWVtb3JpYWxUaWNrKSAqIDAuNjYpO1xuZmxvYXQgbWVtb3JpYWxDb250YWN0ID0gbWluKGxlbmd0aCh2TWVtb3JpYWxEZWNrIC0gdmVjMigtMTAuMCwgNDcuMCkpLCBsZW5ndGgodk1lbW9yaWFsRGVjayAtIHZlYzIoMTAuMCwgNDcuMCkpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgKj0gbWl4KDAuNjIsIDEuMCwgc21vb3Roc3RlcCgxLjI4LCAxLjg1LCBtZW1vcmlhbENvbnRhY3QpKTtgKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+XG4vLyBBdXRob3JlZCBsaWdodCBjYXN0IGJ5IHRoZSBtZW1vcmlhbCBpbnN0cnVtZW50czsgbm8gZ2FtZXBsYXkgc3RhdGUgaXMgd3JpdHRlbi5cbmZsb2F0IGxhbnRlcm5Qb29sID0gZXhwKC1kb3Qodk1lbW9yaWFsRGVjayAtIHZlYzIoLTEwLjAsIDQ3LjApLCB2TWVtb3JpYWxEZWNrIC0gdmVjMigtMTAuMCwgNDcuMCkpIC8gMTguMCk7XG5mbG9hdCBwb3J0cmFpdFBvb2wgPSBleHAoLWRvdCh2TWVtb3JpYWxEZWNrIC0gdmVjMigxMC4wLCA0Ny4wKSwgdk1lbW9yaWFsRGVjayAtIHZlYzIoMTAuMCwgNDcuMCkpIC8gMTIuMCk7XG5mbG9hdCBhcmNoUG9vbCA9IGV4cCgtZG90KHZNZW1vcmlhbERlY2sgLSB2ZWMyKDAuMCwgLTUxLjApLCB2TWVtb3JpYWxEZWNrIC0gdmVjMigwLjAsIC01MS4wKSkgLyAyNC4wKTtcbnRvdGFsRW1pc3NpdmVSYWRpYW5jZSArPSB2ZWMzKDAuMzAsIDAuMTQsIDAuMDQ1KSAqIChsYW50ZXJuUG9vbCArIHBvcnRyYWl0UG9vbCAqIDAuNjUgKyBhcmNoUG9vbCAqIDAuNCkgKiBzbW9vdGhzdGVwKDEuMzAsIDIuMCwgbWVtb3JpYWxDb250YWN0KTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdsYXN0LWNsYWltLW1lbW9yaWFsLWlubGF5LXYzJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH0pO1xufVxuXG4vKiogVGhlIHJhdyBSaXZlciBrZWVwcyBpdHMgcnVuLTYgd2F0ZXI7IHRoZSBkZWRpY2F0ZWQgZ3JpZCByZXBsYWNlcyBiYW5rIHBhaW50LiAqL1xuZnVuY3Rpb24gcGFpbnRSaXZlckJhbmtzKG1vZGVsOiBUSFJFRS5PYmplY3QzRCk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgfHwgIW1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgcmV0dXJuO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbCwgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBjb25zdCBjYWNoZUtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnJpdmVyU2FuZCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2I4YTQ3YycpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMucml2ZXJXZXQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM2OTc0NmInKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZSaXZlckJhbms7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudlJpdmVyQmFuayA9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2Uml2ZXJCYW5rO1xcbnVuaWZvcm0gdmVjMyByaXZlclNhbmQsIHJpdmVyV2V0OycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxuZmxvYXQgcml2ZXJFZGdlID0gYWJzKHZSaXZlckJhbmsueSkgKyBzaW4odlJpdmVyQmFuay54ICogMC43OSkgKiAwLjI1ICsgc2luKHZSaXZlckJhbmsueCAqIDEuOTMpICogMC4xMjtcbmZsb2F0IHJpdmVyRGFtcCA9IDEuMCAtIHNtb290aHN0ZXAoNS43LCA4LjUsIHJpdmVyRWRnZSk7XG5mbG9hdCByaXZlckZvcmQgPSAxLjAgLSBzbW9vdGhzdGVwKDIuNSwgMy4wLCBhYnModlJpdmVyQmFuay54KSk7XG52ZWMzIHJpdmVyUGlnbWVudCA9IG1peChyaXZlclNhbmQsIHJpdmVyV2V0LCByaXZlckRhbXAgKiAoMS4wIC0gMC40NSAqIHJpdmVyRm9yZCkpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCByaXZlclBpZ21lbnQsIDAuNzIpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7Y2FjaGVLZXl9fHJpdmVyLWJhbmstZGF3bi12MWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIFRoZSBvcmlnaW5hbCBzdG9uZXMgYW5kIG5ldyBncmF2ZWwgc2hhcmUgYSBjb29sIGRhbXAgbG93ZXIgZWRnZS4gKi9cbmZ1bmN0aW9uIHBhaW50Uml2ZXJTdG9uZXMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCAhbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsKSByZXR1cm47XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsLCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpLCBrZXkgPSBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkoKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZSaXZlclN0b25lOycpLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudlJpdmVyU3RvbmUgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdlJpdmVyU3RvbmU7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XFxuZGlmZnVzZUNvbG9yLnJnYiAqPSBtaXgoMC43NSwgMS4wLCBzbW9vdGhzdGVwKDUuNiwgOC4zLCBhYnModlJpdmVyU3RvbmUueikpKTsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPHJvdWdobmVzc21hcF9mcmFnbWVudD4nLCAnI2luY2x1ZGUgPHJvdWdobmVzc21hcF9mcmFnbWVudD5cXG5yb3VnaG5lc3NGYWN0b3IgPSBtaXgoMC40NCwgcm91Z2huZXNzRmFjdG9yLCBzbW9vdGhzdGVwKDUuNiwgOC4zLCBhYnModlJpdmVyU3RvbmUueikpKTsnKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGAke2tleX18cml2ZXItd2V0LXN0b25lLXYxYDtcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH0pO1xufVxuXG4vKiogQSBtYXRlcmlhbC1vbmx5IGRhd24gdHJlYXRtZW50IGZvciB0aGUgcmF3IFJpdmVyJ3MgZXhpc3RpbmcgcGFpbnRlZCBmYWxsYmFjay4gKi9cbmZ1bmN0aW9uIHBhaW50Uml2ZXJSZXR1cm4oaG9zdDogSG9zdCk6ICgpID0+IHZvaWQge1xuICBpZiAoaG9zdC5jb250cmFjdElkICE9PSAnZTEwLXJpdmVyJyB8fCBpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybiAoKSA9PiB1bmRlZmluZWQ7XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+KCk7XG4gIGhvc3Quc2NlbmUudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkge1xuICAgICAgaWYgKChtYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCkuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiAobWF0ZXJpYWwudXNlckRhdGEudGVycmFpblVuaWZvcm1zIHx8IG1hdGVyaWFsLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMpKSBtYXRlcmlhbHMuYWRkKG1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKTtcbiAgICB9XG4gIH0pO1xuICBjb25zdCByZXN0b3JlID0gWy4uLm1hdGVyaWFsc10ubWFwKG1hdGVyaWFsID0+IHtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLCBrZXkgPSBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXk7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBrZXkuY2FsbChtYXRlcmlhbCksIHdhdGVyID0gISFtYXRlcmlhbC51c2VyRGF0YS53YXRlclVuaWZvcm1zO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlLmNhbGwobWF0ZXJpYWwsIHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgaWYgKHdhdGVyKSB7XG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlci5yZXBsYWNlKCdiYW5rRm9hbSAqIDAuNTgnLCAnYmFua0ZvYW0gKiAwLjE2JykucmVwbGFjZSgndmVjNCBzYW1wbGVkRGlmZnVzZUNvbG9yID0gdmVjNCh3YXRlckNvbG9yLCBhbHBoYSk7JywgYFxudmVjMyByZXR1cm5XYXRlciA9IG1peCh2ZWMzKDAuMjYsIDAuNDAsIDAuNDApLCB2ZWMzKDAuMTYsIDAuMjksIDAuMzQpLCBkZXB0aCk7XG5yZXR1cm5XYXRlciA9IG1peChyZXR1cm5XYXRlciwgdmVjMygwLjQ4LCAwLjQ2LCAwLjM1KSwgZm9yZEJhbmQgKiAwLjU1KTtcbndhdGVyQ29sb3IgPSBtaXgod2F0ZXJDb2xvciwgcmV0dXJuV2F0ZXIsIDAuODYpO1xuLy8gQnJlYWsgb25seSB0aGUgdmlzdWFsIG91dGVyIGZhZGUgaW53YXJkOyBkZWNsYXJlZCB3aWR0aHMgYW5kIGRlcHRoIHVuaWZvcm1zIHN0YXkgZXhhY3QuXG5hbHBoYSAqPSBzbW9vdGhzdGVwKDAuMCwgMC42NSwgdmlzdWFsRWRnZURpc3QgLSB3YXRlck5vaXNlKHZXYXRlcldvcmxkICogdmVjMigwLjI0LCAwLjgpKSAqIDAuMjUpO1xuZmxvYXQgcmV0dXJuRmxvd0xpbmUgPSBzaW4odldhdGVyV29ybGQueSAqIDcuMCArIHdhdGVyTm9pc2UodldhdGVyV29ybGQgKiB2ZWMyKDEuMiwgMS44KSAtIHZlYzIod2F0ZXJUaW1lICogMC4zMiwgMC4wKSkgKiA0LjgpO1xuZmxvYXQgcmV0dXJuRmxvd0JyZWFrID0gc21vb3Roc3RlcCgwLjUwLCAwLjc4LCB3YXRlck5vaXNlKHZXYXRlcldvcmxkICogdmVjMigzLjQsIDIuMykgLSB2ZWMyKHdhdGVyVGltZSAqIDAuNCwgMC4wKSkpO1xud2F0ZXJDb2xvciArPSB2ZWMzKDAuMTIsIDAuMTEsIDAuMDc1KSAqIHNtb290aHN0ZXAoMC45NCwgMC45OTUsIHJldHVybkZsb3dMaW5lKSAqIHJldHVybkZsb3dCcmVhayAqIHdhdGVyUXVhbGl0eSAqICgxLjAgLSBmb3JkQmFuZCkgKiBzbW9vdGhzdGVwKDAuMDUsIDAuMjAsIGRlcHRoKTtcbnZlYzQgc2FtcGxlZERpZmZ1c2VDb2xvciA9IHZlYzQod2F0ZXJDb2xvciwgYWxwaGEpO2ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hhZGVyLnVuaWZvcm1zLnJldHVybkJhbmtQaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYWQ5Yzc1JykgfTtcbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudW5pZm9ybSB2ZWMzIHJldHVybkJhbmtQaWdtZW50OycpXG4gICAgICAgICAgLnJlcGxhY2UoJ2RpZmZ1c2VDb2xvciAqPSBzYW1wbGVkRGlmZnVzZUNvbG9yOycsICdkaWZmdXNlQ29sb3IgKj0gc2FtcGxlZERpZmZ1c2VDb2xvcjtcXG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIHJldHVybkJhbmtQaWdtZW50LCAwLjI1KTsnKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGAke2NhY2hlS2V5fXxyYXctcml2ZXItZGF3bi12Mjoke3dhdGVyID8gJ3dhdGVyJyA6ICdiYW5rJ31gO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICByZXR1cm4gKCkgPT4geyBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSBjb21waWxlOyBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSBrZXk7IG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTsgfTtcbiAgfSk7XG4gIHJldHVybiAoKSA9PiB7IGZvciAoY29uc3QgcmVzZXQgb2YgcmVzdG9yZSkgcmVzZXQoKTsgfTtcbn1cblxuLyoqIFF1aWV0IHRoZSBhcmNoaXZlIHBhdmluZzsgd2FybSBwb29scyBhcHBlYXIgb25seSBmb3IgYWxyZWFkeS1yZXN0b3JlZCB3aW5ncy4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlBcmNoaXZlVGVycmFjZXMobW9kZWw6IFRIUkVFLk9iamVjdDNELCByZWFkU3RhdGU/OiAoKSA9PiBBcmNoaXZlUmVzdG9yYXRpb25TdGF0ZSB8IG51bGwsIGRldGFpbFRleHR1cmVVcmw/OiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCB6b25lcyA9IHJlYWRTdGF0ZT8uKCk/LnpvbmVzID8/IFtdO1xuICBjb25zdCBwb29scyA9IHsgdmFsdWU6IHpvbmVzLm1hcCh6b25lID0+IG5ldyBUSFJFRS5WZWN0b3I0KCh6b25lLm1pblggKyB6b25lLm1heFgpIC8gMiwgKHpvbmUubWluWiArIHpvbmUubWF4WikgLyAyLCAoem9uZS5tYXhYIC0gem9uZS5taW5YKSAqIDAuMzcsICh6b25lLm1heFogLSB6b25lLm1pblopICogMC4zNykpIH07XG4gIGNvbnN0IHJlc3RvcmVkID0geyB2YWx1ZTogbmV3IEZsb2F0MzJBcnJheSh6b25lcy5sZW5ndGgpIH07XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgfHwgIW1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgcmV0dXJuO1xuICAgIGNvbnN0IGJlZm9yZVJlbmRlciA9IG1lc2gub25CZWZvcmVSZW5kZXIuYmluZChtZXNoKTtcbiAgICBtZXNoLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBnZW9tZXRyeSwgbWF0ZXJpYWwsIGdyb3VwKSA9PiB7XG4gICAgICBiZWZvcmVSZW5kZXIocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEsIGdlb21ldHJ5LCBtYXRlcmlhbCwgZ3JvdXApO1xuICAgICAgY29uc3Qgc3RhdGUgPSByZWFkU3RhdGU/LigpO1xuICAgICAgem9uZXMuZm9yRWFjaCgoem9uZSwgaW5kZXgpID0+IHsgcmVzdG9yZWQudmFsdWVbaW5kZXhdID0gc3RhdGU/LnJlc3RvcmVkV2luZ0lkcy5pbmNsdWRlcyh6b25lLmlkKSA/IDEgOiAwOyB9KTtcbiAgICB9O1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbCwgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBsZXQgZGlzcG9zZWQgPSBmYWxzZTtcbiAgICBjb25zdCBkZXRhaWwgPSBkZXRhaWxUZXh0dXJlVXJsID8gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKS5sb2FkKGRldGFpbFRleHR1cmVVcmwsIHRleHR1cmUgPT4geyBpZiAoZGlzcG9zZWQpIHRleHR1cmUuZGlzcG9zZSgpOyB9KSA6IHVuZGVmaW5lZDtcbiAgICBpZiAoZGV0YWlsKSB7XG4gICAgICBkZXRhaWwuY29sb3JTcGFjZSA9IFRIUkVFLlNSR0JDb2xvclNwYWNlO1xuICAgICAgZGV0YWlsLndyYXBTID0gZGV0YWlsLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgICBtYXRlcmlhbC5hZGRFdmVudExpc3RlbmVyKCdkaXNwb3NlJywgKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IGRldGFpbC5kaXNwb3NlKCk7IH0pO1xuICAgIH1cbiAgICBjb25zdCBjYWNoZUtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmFyY2hpdmVGbG9vckxvdyA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzc3NmY1ZScpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuYXJjaGl2ZUZsb29ySGlnaCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2E4YTM4ZCcpIH07XG4gICAgICBpZiAoZGV0YWlsKSBzaGFkZXIudW5pZm9ybXMuYXJjaGl2ZU1hc29ucnkgPSB7IHZhbHVlOiBkZXRhaWwgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5hcmNoaXZlRmxvb3JQb29scyA9IHBvb2xzO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmFyY2hpdmVGbG9vclJlc3RvcmVkID0gcmVzdG9yZWQ7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkFyY2hpdmVGbG9vcjsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52QXJjaGl2ZUZsb29yID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxudmFyeWluZyB2ZWMzIHZBcmNoaXZlRmxvb3I7XG51bmlmb3JtIHZlYzMgYXJjaGl2ZUZsb29yTG93LCBhcmNoaXZlRmxvb3JIaWdoO1xuJHtkZXRhaWwgPyAndW5pZm9ybSBzYW1wbGVyMkQgYXJjaGl2ZU1hc29ucnk7JyA6ICcnfVxuJHt6b25lcy5sZW5ndGggPyBgdW5pZm9ybSB2ZWM0IGFyY2hpdmVGbG9vclBvb2xzWyR7em9uZXMubGVuZ3RofV07XFxudW5pZm9ybSBmbG9hdCBhcmNoaXZlRmxvb3JSZXN0b3JlZFske3pvbmVzLmxlbmd0aH1dO2AgOiAnJ31gKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGFyY2hpdmVUZXJyYWNlID0gc21vb3Roc3RlcCgtMC43LCAyLjIsIHZBcmNoaXZlRmxvb3IueSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIG1peChhcmNoaXZlRmxvb3JMb3csIGFyY2hpdmVGbG9vckhpZ2gsIGFyY2hpdmVUZXJyYWNlKSwgMC43OCk7XG4ke2RldGFpbCA/ICdmbG9hdCBhcmNoaXZlRW5ncmF2aW5nID0gZG90KHRleHR1cmUyRChhcmNoaXZlTWFzb25yeSwgdkFyY2hpdmVGbG9vci54eiAvIDI0LjApLnJnYiwgdmVjMygwLjIxMjYsIDAuNzE1MiwgMC4wNzIyKSk7XFxuZGlmZnVzZUNvbG9yLnJnYiAqPSAwLjkwICsgYXJjaGl2ZUVuZ3JhdmluZyAqIDAuMzA7JyA6ICcnfWApXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cbiR7em9uZXMubGVuZ3RoID8gYGZvciAoaW50IGkgPSAwOyBpIDwgJHt6b25lcy5sZW5ndGh9OyBpKyspIHtcbiAgdmVjNCBwb29sID0gYXJjaGl2ZUZsb29yUG9vbHNbaV07XG4gIGZsb2F0IGFyY2hpdmVQb29sID0gMS4wIC0gc21vb3Roc3RlcCgwLjEyLCAxLjAsIGxlbmd0aCgodkFyY2hpdmVGbG9vci54eiAtIHBvb2wueHkpIC8gcG9vbC56dykpO1xuICB0b3RhbEVtaXNzaXZlUmFkaWFuY2UgKz0gdmVjMygwLjMwLCAwLjE0LCAwLjA0NSkgKiBhcmNoaXZlUG9vbCAqIGFyY2hpdmVGbG9vclJlc3RvcmVkW2ldO1xufWAgOiAnJ31gKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGAke2NhY2hlS2V5fXxhcmNoaXZlLXRlcnJhY2VzLXYyOiR7em9uZXMubGVuZ3RofTokeyEhZGV0YWlsfWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIENvbnRhY3QgYXQgdGhlIGZvb3RpbmcgYW5kIGVhcm5lZCB3YXJtIGZhY2FkZSB3YXNoOyBubyByZXN0b3JhdGlvbiB3cml0ZXMuICovXG5mdW5jdGlvbiBsaWdodEFyY2hpdmVGYWNhZGUobW9kZWw6IFRIUkVFLk9iamVjdDNELCByZWFkU3RhdGU/OiAoKSA9PiBBcmNoaXZlUmVzdG9yYXRpb25TdGF0ZSB8IG51bGwpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBib3VuZHMgPSBuZXcgVEhSRUUuQm94MygpLnNldEZyb21PYmplY3QobW9kZWwpLCBjZW50ZXIgPSBib3VuZHMuZ2V0Q2VudGVyKG5ldyBUSFJFRS5WZWN0b3IzKCkpO1xuICBjb25zdCB6b25lID0gcmVhZFN0YXRlPy4oKT8uem9uZXMuZmluZCh6ID0+IGNlbnRlci54ID49IHoubWluWCAmJiBjZW50ZXIueCA8PSB6Lm1heFggJiYgY2VudGVyLnogPj0gei5taW5aICYmIGNlbnRlci56IDw9IHoubWF4Wik7XG4gIGNvbnN0IHJlc3RvcmVkID0geyB2YWx1ZTogMCB9O1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHJldHVybjtcbiAgICBjb25zdCBiZWZvcmVSZW5kZXIgPSBtZXNoLm9uQmVmb3JlUmVuZGVyLmJpbmQobWVzaCk7XG4gICAgbWVzaC5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSwgZ2VvbWV0cnksIG1hdGVyaWFsLCBncm91cCkgPT4ge1xuICAgICAgYmVmb3JlUmVuZGVyKHJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhLCBnZW9tZXRyeSwgbWF0ZXJpYWwsIGdyb3VwKTtcbiAgICAgIHJlc3RvcmVkLnZhbHVlID0gem9uZSAmJiByZWFkU3RhdGU/LigpPy5yZXN0b3JlZFdpbmdJZHMuaW5jbHVkZXMoem9uZS5pZCkgPyAxIDogMDtcbiAgICB9O1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbCwgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKSwga2V5ID0gbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5KCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuYXJjaGl2ZUZhY2FkZUJhc2UgPSB7IHZhbHVlOiBib3VuZHMubWluLnkgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5hcmNoaXZlRmFjYWRlUmVzdG9yZWQgPSByZXN0b3JlZDtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZBcmNoaXZlRmFjYWRlOycpLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkFyY2hpdmVGYWNhZGUgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkFyY2hpdmVGYWNhZGU7XFxudW5pZm9ybSBmbG9hdCBhcmNoaXZlRmFjYWRlQmFzZSwgYXJjaGl2ZUZhY2FkZVJlc3RvcmVkOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxuZmxvYXQgYXJjaGl2ZUZhY2FkZUhlaWdodCA9IHZBcmNoaXZlRmFjYWRlLnkgLSBhcmNoaXZlRmFjYWRlQmFzZTtcbmRpZmZ1c2VDb2xvci5yZ2IgKj0gbWl4KDAuNjMsIDEuMCwgc21vb3Roc3RlcCgwLjAsIDAuNywgYXJjaGl2ZUZhY2FkZUhlaWdodCkpO2ApXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cbmZsb2F0IGFyY2hpdmVGYWNhZGVXYXNoID0gc21vb3Roc3RlcCgwLjEsIDAuOCwgYXJjaGl2ZUZhY2FkZUhlaWdodCkgKiAoMS4wIC0gc21vb3Roc3RlcCgyLjUsIDYuMCwgYXJjaGl2ZUZhY2FkZUhlaWdodCkpO1xudG90YWxFbWlzc2l2ZVJhZGlhbmNlICs9IHZlYzMoMC4xMSwgMC4wNTUsIDAuMDEyKSAqIGFyY2hpdmVGYWNhZGVXYXNoICogYXJjaGl2ZUZhY2FkZVJlc3RvcmVkO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7a2V5fXxhcmNoaXZlLWZhY2FkZS12MWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIFRoZSBuZWFyIGxpYnJhcnkgaGFsbHMgdXNlIHJlYWwgZGVwdGg7IGRpc3RhbnQgc2t5IGFuZCBhcHJvbiBzdGF5IGF0IGZhciBkZXB0aC4gKi9cbmZ1bmN0aW9uIHByZXBhcmVBcmNoaXZlTGlicmFyeShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIGRldGFpbFRleHR1cmVVcmw/OiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKCFkZXRhaWxUZXh0dXJlVXJsKSByZXR1cm47XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgfHwgIVsnQXJjaGl2ZUxpYnJhcnlTY2VuZXJ5JywgJ0FyY2hpdmVMaWJyYXJ5UmVjZXNzJ10uaW5jbHVkZXMobWVzaC5tYXRlcmlhbC5uYW1lKSkgcmV0dXJuO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbCwgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKSwga2V5ID0gbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5KCk7XG4gICAgbWVzaC5yZW5kZXJPcmRlciA9IDA7XG4gICAgbWF0ZXJpYWwuZGVwdGhXcml0ZSA9IHRydWU7XG4gICAgbWF0ZXJpYWwuZm9nID0gdHJ1ZTtcbiAgICBtYXRlcmlhbC52ZXJ0ZXhDb2xvcnMgPSBmYWxzZTtcbiAgICBtYXRlcmlhbC5jb2xvci5zZXQoJyNiNmFhOGQnKTtcbiAgICBjb25zdCByZWNlc3MgPSBtYXRlcmlhbC5uYW1lID09PSAnQXJjaGl2ZUxpYnJhcnlSZWNlc3MnO1xuICAgIG1hdGVyaWFsLmVtaXNzaXZlLnNldChyZWNlc3MgPyAnIzM5MzYyYycgOiAnIzg4ODQ3YScpO1xuICAgIG1hdGVyaWFsLmVtaXNzaXZlSW50ZW5zaXR5ID0gMC4xODtcbiAgICBsZXQgZGlzcG9zZWQgPSBmYWxzZTtcbiAgICBjb25zdCBkZXRhaWwgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoZGV0YWlsVGV4dHVyZVVybCwgdGV4dHVyZSA9PiB7IGlmIChkaXNwb3NlZCkgdGV4dHVyZS5kaXNwb3NlKCk7IH0pO1xuICAgIGRldGFpbC5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gICAgZGV0YWlsLndyYXBTID0gZGV0YWlsLndyYXBUID0gVEhSRUUuUmVwZWF0V3JhcHBpbmc7XG4gICAgbWF0ZXJpYWwuYWRkRXZlbnRMaXN0ZW5lcignZGlzcG9zZScsICgpID0+IHsgZGlzcG9zZWQgPSB0cnVlOyBkZXRhaWwuZGlzcG9zZSgpOyB9KTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJ2dsX1Bvc2l0aW9uLnogPSBnbF9Qb3NpdGlvbi53ICogMC45OTk5OTk7JywgJycpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmFyY2hpdmVGYWNhZGVTdG9uZSA9IHsgdmFsdWU6IGRldGFpbCB9O1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnVuaWZvcm0gc2FtcGxlcjJEIGFyY2hpdmVGYWNhZGVTdG9uZTsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCAnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cXG5kaWZmdXNlQ29sb3IucmdiID0gdGV4dHVyZTJEKGFyY2hpdmVGYWNhZGVTdG9uZSwgdk1hcFV2KS5yZ2IgKiAnICsgKHJlY2VzcyA/ICd2ZWMzKDAuMzgsIDAuMzYsIDAuMzIpOycgOiAndmVjMygwLjcwLCAwLjY1LCAwLjU2KTsnKSk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiBgJHtrZXl9fGFyY2hpdmUtbGlicmFyeS12NDoke3JlY2Vzc31gO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qKiBTaGFyZWQgYmFzYWx0IHBpZ21lbnQgZm9yIHNjdWxwdCwgY29udGludWF0aW9uIGFuZCBhdXRob3JlZCBzY2VuZXJ5IHJvY2suXG4gKiBGcmFjdHVyZXMgYW5kIHN0cmF0YSBjaGFuZ2UgdGhlIG1hdGVyaWFsIG9ubHk7IGhlYXQgc3RpbGwgY29tZXMgZnJvbSB0aGUgYXRsYXMuICovXG5mdW5jdGlvbiBjbGFyaWZ5RW1iZXJCYXNhbHQobW9kZWw6IFRIUkVFLk9iamVjdDNELCBkZXRhaWxUZXh0dXJlVXJsPzogc3RyaW5nLCBzY2VuZXJ5ID0gZmFsc2UpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCAhZGV0YWlsVGV4dHVyZVVybCkgcmV0dXJuO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHJldHVybjtcbiAgICBjb25zdCBtYXRlcmlhbCA9IG1lc2gubWF0ZXJpYWwsIGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgaWYgKHNjZW5lcnkgJiYgbWF0ZXJpYWwubmFtZSAhPT0gJ0VtYmVyU2hvcmVCYXNhbHRTY2VuZXJ5JykgcmV0dXJuO1xuICAgIGlmIChzY2VuZXJ5KSB7IG1hdGVyaWFsLmZvZyA9IHRydWU7IG1hdGVyaWFsLnZlcnRleENvbG9ycyA9IGZhbHNlOyB9XG4gICAgLy8gVGhpcyBtYXRlcmlhbCBvd25zIGl0cyBuYXRpdmUgZGV0YWlsIHNhbXBsZXIsIGluY2x1ZGluZyBsYXRlIGRlY29kZSBhZnRlclxuICAgIC8vIGRpc3Bvc2FsLiBUaGUgR0xCJ3Mgb3JpZ2luYWwgY29sb3IgbWFwIHJlbWFpbnMgdGhlIGhlYXQtcGFpbnQgYXV0aG9yaXR5LlxuICAgIGxldCBkaXNwb3NlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGRldGFpbCA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZChkZXRhaWxUZXh0dXJlVXJsLCB0ZXh0dXJlID0+IHtcbiAgICAgIGlmIChkaXNwb3NlZCkgdGV4dHVyZS5kaXNwb3NlKCk7XG4gICAgfSk7XG4gICAgZGV0YWlsLmNvbG9yU3BhY2UgPSBUSFJFRS5TUkdCQ29sb3JTcGFjZTtcbiAgICBkZXRhaWwud3JhcFMgPSBkZXRhaWwud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICBtYXRlcmlhbC5hZGRFdmVudExpc3RlbmVyKCdkaXNwb3NlJywgKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IGRldGFpbC5kaXNwb3NlKCk7IH0pO1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5KCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZW1iZXJCYXNhbHREZXRhaWwgPSB7IHZhbHVlOiBkZXRhaWwgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5lbWJlckJhc2FsdExvdyA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzVkNzI3YycpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZW1iZXJCYXNhbHRIaWdoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjOWM5ZTkxJykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2RW1iZXJCYXNhbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkVtYmVyQmFzYWx0ID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxudmFyeWluZyB2ZWMzIHZFbWJlckJhc2FsdDtcbnVuaWZvcm0gdmVjMyBlbWJlckJhc2FsdExvdywgZW1iZXJCYXNhbHRIaWdoO1xudW5pZm9ybSBzYW1wbGVyMkQgZW1iZXJCYXNhbHREZXRhaWw7XG5mbG9hdCBlbWJlckhlYXRDb3JlKHZlYzMgcGFpbnQpIHsgcmV0dXJuIGNsYW1wKChwYWludC5yIC0gbWF4KHBhaW50LmcsIHBhaW50LmIpICogMS44KSAqIDE4LjAsIDAuMCwgMS4wKTsgfWApXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxuZmxvYXQgZW1iZXJXYXJtID0gY2xhbXAoKGRpZmZ1c2VDb2xvci5yIC0gbWF4KGRpZmZ1c2VDb2xvci5nLCBkaWZmdXNlQ29sb3IuYikgKiAxLjgpICogMTguMCwgMC4wLCAxLjApO1xuZmxvYXQgZW1iZXJTaGVsZiA9IHNtb290aHN0ZXAoLTEuOCwgMS44LCB2RW1iZXJCYXNhbHQueSk7XG52ZWMzIGVtYmVyU2FtcGxlID0gdGV4dHVyZTJEKGVtYmVyQmFzYWx0RGV0YWlsLCB2RW1iZXJCYXNhbHQueHogLyAxMi4wKS5yZ2I7XG5mbG9hdCBlbWJlckV0Y2hpbmcgPSBkb3QoZW1iZXJTYW1wbGUsIHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMikpO1xudmVjMyBlbWJlclN0b25lID0gbWl4KGVtYmVyQmFzYWx0TG93LCBlbWJlckJhc2FsdEhpZ2gsIGVtYmVyU2hlbGYpO1xuZW1iZXJTdG9uZSAqPSBjbGFtcCgwLjgyICsgZW1iZXJFdGNoaW5nICogMS4zNSwgMC43NiwgMS4yMik7XG5kaWZmdXNlQ29sb3IucmdiID0gZW1iZXJTdG9uZTtcbmZsb2F0IGVtYmVyUGxheWZpZWxkID0gMS4wIC0gc21vb3Roc3RlcCg2My44LCA2NC4wLCBtYXgoYWJzKHZFbWJlckJhc2FsdC54KSwgYWJzKHZFbWJlckJhc2FsdC56KSkpO1xuZmxvYXQgZW1iZXJWZWluID0gZW1iZXJXYXJtICogZW1iZXJQbGF5ZmllbGQgKiBjbGFtcCgwLjU4ICsgZW1iZXJFdGNoaW5nICogMS44LCAwLjU4LCAxLjApO1xuZmxvYXQgZW1iZXJDb3JlID0gJHtzY2VuZXJ5ID8gJzAuMCcgOiBgbWluKG1pbihlbWJlckhlYXRDb3JlKHRleHR1cmUyRChtYXAsIHZNYXBVdiArIHZlYzIoMC4wMDA0NSwgMC4wKSkucmdiKSwgZW1iZXJIZWF0Q29yZSh0ZXh0dXJlMkQobWFwLCB2TWFwVXYgLSB2ZWMyKDAuMDAwNDUsIDAuMCkpLnJnYikpLCBtaW4oZW1iZXJIZWF0Q29yZSh0ZXh0dXJlMkQobWFwLCB2TWFwVXYgKyB2ZWMyKDAuMCwgMC4wMDA0NSkpLnJnYiksIGVtYmVySGVhdENvcmUodGV4dHVyZTJEKG1hcCwgdk1hcFV2IC0gdmVjMigwLjAsIDAuMDAwNDUpKS5yZ2IpKSlgfTtcbmVtYmVyQ29yZSAqPSBlbWJlcldhcm0gKiBlbWJlclBsYXlmaWVsZDtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbWl4KHZlYzMoMC4yMCwgMC4wMzQsIDAuMDEwKSwgdmVjMygwLjM4LCAwLjA3NSwgMC4wMTQpLCBlbWJlckNvcmUpLCBlbWJlclZlaW4gKiAwLjgyKTtgKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsICd0b3RhbEVtaXNzaXZlUmFkaWFuY2UgPSB2ZWMzKDAuMDU1LCAwLjAxMiwgMC4wMDIpICogZW1iZXJWZWluICsgdmVjMygwLjM2LCAwLjExLCAwLjAxNSkgKiBlbWJlckNvcmU7Jyk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiBgJHtjYWNoZUtleX18ZW1iZXItYmFzYWx0LXYxMToke3NjZW5lcnl9YDtcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH0pO1xufVxuXG4vKiogRHJ5IGNhbmFsL3JvYWQgcGlnbWVudCBmb2xsb3dzIHB1Ymxpc2hlZCByb3V0ZXMuIFBlcm1hbmVudCBncmVlbiB6b25lcyBhcmVcbiAqIGF1dGhvcmVkIHRlcnJhaW4gcGFpbnQ7IHN0YWdlZCB3YXRlciBhbmQgcGxhbnRlZCBzdGF0ZSBrZWVwIHRoZWlyIGV4aXN0aW5nIG93bmVycy4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlSZWRGaWVsZHNSb3V0ZShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHBvaW50czogUGFpbnRSb3V0ZVBvaW50W10sIGdyZWVuWm9uZXM6IFBhaW50Wm9uZVtdID0gW10sIGN1dEJhbmtzID0gZmFsc2UpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCBwb2ludHMubGVuZ3RoIDwgMikgcmV0dXJuO1xuICBjb25zdCBzZWdtZW50cyA9IHBvaW50cy5zbGljZSgxKS5tYXAoKGVuZCwgaSkgPT4gbmV3IFRIUkVFLlZlY3RvcjQocG9pbnRzW2ldIS54LCBwb2ludHNbaV0hLnosIGVuZC54LCBlbmQueikpO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiBtZXNoLm1hdGVyaWFsLm1hcCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5kb21lQ2FuYWxTZWdtZW50cyA9IHsgdmFsdWU6IHNlZ21lbnRzIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZG9tZUNhbmFsRWFydGggPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyNhZjhiNjknKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmRvbWVDYW5hbEJlZCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcihncmVlblpvbmVzLmxlbmd0aCA/ICcjYjM5Yjc0JyA6ICcjNzc3NDY3JykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5yZWRGaWVsZHNHcmVlbiA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzgyOTE2ZScpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMucmVkRmllbGRzWm9uZXMgPSB7IHZhbHVlOiBncmVlblpvbmVzLm1hcCh6ID0+IG5ldyBUSFJFRS5WZWN0b3I0KHoubWluWCwgei5taW5aLCB6Lm1heFgsIHoubWF4WikpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkRvbWVDYW5hbDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52RG9tZUNhbmFsID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2RG9tZUNhbmFsO1xcbnVuaWZvcm0gdmVjNCBkb21lQ2FuYWxTZWdtZW50c1ske3NlZ21lbnRzLmxlbmd0aH1dO1xcbnVuaWZvcm0gdmVjMyBkb21lQ2FuYWxFYXJ0aCwgZG9tZUNhbmFsQmVkOyR7Z3JlZW5ab25lcy5sZW5ndGggPyBgXFxudW5pZm9ybSB2ZWMzIHJlZEZpZWxkc0dyZWVuO1xcbnVuaWZvcm0gdmVjNCByZWRGaWVsZHNab25lc1ske2dyZWVuWm9uZXMubGVuZ3RofV07YCA6ICcnfWApXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxuZmxvYXQgZG9tZUNhbmFsRGlzdGFuY2UgPSAxMDAwLjA7XG5mb3IgKGludCBpID0gMDsgaSA8ICR7c2VnbWVudHMubGVuZ3RofTsgaSsrKSB7XG4gIHZlYzIgYSA9IGRvbWVDYW5hbFNlZ21lbnRzW2ldLnh5LCBhYiA9IGRvbWVDYW5hbFNlZ21lbnRzW2ldLnp3IC0gYTtcbiAgZmxvYXQgdCA9IGNsYW1wKGRvdCh2RG9tZUNhbmFsLnh6IC0gYSwgYWIpIC8gbWF4KGRvdChhYiwgYWIpLCAwLjAwMSksIDAuMCwgMS4wKTtcbiAgZG9tZUNhbmFsRGlzdGFuY2UgPSBtaW4oZG9tZUNhbmFsRGlzdGFuY2UsIGxlbmd0aCh2RG9tZUNhbmFsLnh6IC0gYSAtIGFiICogdCkpO1xufVxuZmxvYXQgZG9tZUNhbmFsSW50ZXJpb3IgPSAxLjAgLSBzbW9vdGhzdGVwKDUwLjAsIDYzLjAsIG1heChhYnModkRvbWVDYW5hbC54KSwgYWJzKHZEb21lQ2FuYWwueikpKTtcbmZsb2F0IGRvbWVDYW5hbEdyYWluID0gc2luKHZEb21lQ2FuYWwueCAqIDEuNyArIHNpbih2RG9tZUNhbmFsLnogKiAwLjgpKSAqIHNpbih2RG9tZUNhbmFsLnogKiAyLjMpO1xudmVjMyBkb21lQ2FuYWxQaWdtZW50ID0gZG9tZUNhbmFsRWFydGggKiBtaXgoMC44MiwgMS4xMywgc21vb3Roc3RlcCgtMi4wLCA0LjAsIHZEb21lQ2FuYWwueSkpO1xuJHtncmVlblpvbmVzLmxlbmd0aCA/IGBmbG9hdCByZWRGaWVsZHNHcmVlbk1hc2sgPSAwLjA7XG5mb3IgKGludCBpID0gMDsgaSA8ICR7Z3JlZW5ab25lcy5sZW5ndGh9OyBpKyspIHtcbiAgdmVjNCB6b25lID0gcmVkRmllbGRzWm9uZXNbaV07XG4gIHZlYzIgaW5zZXQgPSBtaW4odkRvbWVDYW5hbC54eiAtIHpvbmUueHksIHpvbmUuencgLSB2RG9tZUNhbmFsLnh6KTtcbiAgcmVkRmllbGRzR3JlZW5NYXNrID0gbWF4KHJlZEZpZWxkc0dyZWVuTWFzaywgc21vb3Roc3RlcCgwLjAsIDIuMCwgbWluKGluc2V0LngsIGluc2V0LnkpKSk7XG59XG5kb21lQ2FuYWxQaWdtZW50ID0gbWl4KGRvbWVDYW5hbFBpZ21lbnQsIHJlZEZpZWxkc0dyZWVuLCByZWRGaWVsZHNHcmVlbk1hc2sgKiAwLjgyKTtgIDogJyd9XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGRvbWVDYW5hbFBpZ21lbnQgKiAoMS4wICsgZG9tZUNhbmFsR3JhaW4gKiAwLjAzNSksICR7Z3JlZW5ab25lcy5sZW5ndGggPyAnMC40OCcgOiAnMC41OCd9ICogZG9tZUNhbmFsSW50ZXJpb3IpO1xuZmxvYXQgZG9tZUNhbmFsQmVkTWFzayA9IDEuMCAtIHNtb290aHN0ZXAoJHtjdXRCYW5rcyA/ICcxLjQsIDEuNjUnIDogJzEuMywgMi4xJ30sIGRvbWVDYW5hbERpc3RhbmNlKTtcbmZsb2F0IGRvbWVDYW5hbFNob3VsZGVyID0gc21vb3Roc3RlcCgke2N1dEJhbmtzID8gJzEuNCwgMS42NScgOiAnMS41LCAyLjEnfSwgZG9tZUNhbmFsRGlzdGFuY2UpICogKDEuMCAtIHNtb290aHN0ZXAoJHtjdXRCYW5rcyA/ICcyLjM1LCAyLjgnIDogJzIuOCwgMy44J30sIGRvbWVDYW5hbERpc3RhbmNlKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGRvbWVDYW5hbEJlZCAqICgwLjk0ICsgZG9tZUNhbmFsR3JhaW4gKiAwLjA0KSwgJHtncmVlblpvbmVzLmxlbmd0aCA/ICcwLjQ4JyA6ICcwLjY4J30gKiBkb21lQ2FuYWxCZWRNYXNrICogZG9tZUNhbmFsSW50ZXJpb3IpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBkb21lQ2FuYWxFYXJ0aCAqIDEuMjIsICR7Z3JlZW5ab25lcy5sZW5ndGggPyAnMC4xOCcgOiAnMC4zNSd9ICogZG9tZUNhbmFsU2hvdWxkZXIgKiBkb21lQ2FuYWxJbnRlcmlvcik7JHtjdXRCYW5rcyA/IGBcbi8vIEEgbmFycm93IG1pbmVyYWwgbGlwIGRlZmluZXMgdGhlIGluaGVyaXRlZCBjdXQgd2l0aG91dCBpbnZlbnRpbmcgaGVpZ2h0IG9yIHdhdGVyLlxuZmxvYXQgb2xkQ2FuYWxMaXAgPSBzbW9vdGhzdGVwKDEuMjUsIDEuNCwgZG9tZUNhbmFsRGlzdGFuY2UpICogKDEuMCAtIHNtb290aHN0ZXAoMS42LCAxLjgsIGRvbWVDYW5hbERpc3RhbmNlKSk7XG5kaWZmdXNlQ29sb3IucmdiICo9IDEuMCAtIG9sZENhbmFsTGlwICogZG9tZUNhbmFsSW50ZXJpb3IgKiAwLjE2O2AgOiAnJ31gKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGByZWRmaWVsZHMtZHJ5LXJvdXRlLXYyOiR7c2VnbWVudHMubGVuZ3RofToke2dyZWVuWm9uZXMubGVuZ3RofSR7Y3V0QmFua3MgPyAnOmN1dC1iYW5rcy12MScgOiAnJ31gO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG4vKiogUGljbmljIG93bnMgYSBjbGVhbmVkIHBpZ21lbnQgYXRsYXM7IHRoZSBNZXNhIHNvdXJjZSBhbmQgc2FtcGxlZCBnZW9tZXRyeSBzdGF5IHNoYXJlZC4gKi9cbmZ1bmN0aW9uIHBhaW50UGljbmljR3JvdW5kKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgZGV0YWlsVGV4dHVyZVVybD86IHN0cmluZyk6IHZvaWQge1xuICBpZiAoIWRldGFpbFRleHR1cmVVcmwpIHJldHVybjtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCAhbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsIHx8ICFtZXNoLm1hdGVyaWFsLm1hcCkgcmV0dXJuO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbCwgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBsZXQgZGlzcG9zZWQgPSBmYWxzZTtcbiAgICBjb25zdCBwaWdtZW50ID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKS5sb2FkKGRldGFpbFRleHR1cmVVcmwsIHRleHR1cmUgPT4geyBpZiAoZGlzcG9zZWQpIHRleHR1cmUuZGlzcG9zZSgpOyB9KTtcbiAgICBwaWdtZW50LmNvbG9yU3BhY2UgPSBUSFJFRS5TUkdCQ29sb3JTcGFjZTtcbiAgICBwaWdtZW50LmZsaXBZID0gZmFsc2U7IC8vIE1hdGNoIHRoZSBHTEIgbWFwJ3MgVVYgb3JpZW50YXRpb24uXG4gICAgcGlnbWVudC5hbmlzb3Ryb3B5ID0gbWVzaC5tYXRlcmlhbC5tYXAuYW5pc290cm9weTtcbiAgICBtYXRlcmlhbC5hZGRFdmVudExpc3RlbmVyKCdkaXNwb3NlJywgKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IHBpZ21lbnQuZGlzcG9zZSgpOyB9KTtcbiAgICBjb25zdCBjYWNoZUtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnBpY25pY0dyb3VuZCA9IHsgdmFsdWU6IHBpZ21lbnQgfTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG51bmlmb3JtIHNhbXBsZXIyRCBwaWNuaWNHcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgJ2RpZmZ1c2VDb2xvciAqPSB0ZXh0dXJlMkQocGljbmljR3JvdW5kLCB2TWFwVXYpOycpO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7Y2FjaGVLZXl9fHBpY25pYy1ncm91bmQtdjFgO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfSk7XG59XG5cbi8qKiBTZXBhcmF0ZSBleGlzdGluZyBzaGVsdmVzIGZyb20gdGhlaXIgbG93ZXIgZ3JvdW5kIHdpdGhvdXQgbW92aW5nIGFueSBzdXJmYWNlLiAqL1xuZnVuY3Rpb24gZ3JhZGVUZXJyYWluQnlIZWlnaHQobW9kZWw6IFRIUkVFLk9iamVjdDNELCBsb3dDb2xvcjogc3RyaW5nLCBoaWdoQ29sb3I6IHN0cmluZywgbG93SGVpZ2h0OiBudW1iZXIsIGhpZ2hIZWlnaHQ6IG51bWJlciwgcGFpbnRNaXg6IG51bWJlcik6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAobWVzaC5pc01lc2ggJiYgIUFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgJiYgbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsICYmIG1lc2gubWF0ZXJpYWwubWFwKSBtYXRlcmlhbHMuYWRkKG1lc2gubWF0ZXJpYWwpO1xuICB9KTtcbiAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBtYXRlcmlhbHMpIHtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmhlaWdodFBhaW50TG93ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKGxvd0NvbG9yKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmhlaWdodFBhaW50SGlnaCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcihoaWdoQ29sb3IpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuaGVpZ2h0UGFpbnRSYW5nZSA9IHsgdmFsdWU6IG5ldyBUSFJFRS5WZWN0b3IyKGxvd0hlaWdodCwgaGlnaEhlaWdodCkgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5oZWlnaHRQYWludE1peCA9IHsgdmFsdWU6IHBhaW50TWl4IH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkhlaWdodFBhaW50OycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PlxcbnZIZWlnaHRQYWludCA9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkhlaWdodFBhaW50O1xcbnVuaWZvcm0gdmVjMyBoZWlnaHRQYWludExvdywgaGVpZ2h0UGFpbnRIaWdoO1xcbnVuaWZvcm0gdmVjMiBoZWlnaHRQYWludFJhbmdlO1xcbnVuaWZvcm0gZmxvYXQgaGVpZ2h0UGFpbnRNaXg7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBoZWlnaHRQYWludEludGVyaW9yID0gMS4wIC0gc21vb3Roc3RlcCg0OC4wLCA2NC4wLCBtYXgoYWJzKHZIZWlnaHRQYWludC54KSwgYWJzKHZIZWlnaHRQYWludC56KSkpO1xuZmxvYXQgaGVpZ2h0UGFpbnRGYWN0b3IgPSBzbW9vdGhzdGVwKGhlaWdodFBhaW50UmFuZ2UueCwgaGVpZ2h0UGFpbnRSYW5nZS55LCB2SGVpZ2h0UGFpbnQueSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIG1peChoZWlnaHRQYWludExvdywgaGVpZ2h0UGFpbnRIaWdoLCBoZWlnaHRQYWludEZhY3RvciksIGhlaWdodFBhaW50TWl4ICogaGVpZ2h0UGFpbnRJbnRlcmlvcik7YCk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiAndGVycmFpbi1oZWlnaHQtcGlnbWVudC12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBQcmVwYXJlZCBib2lsZXIgYXByb25zIGFuZCBjb21iZWQgZWFydGggZm9sbG93IHRoZSBleGlzdGluZyB0ZXJyYWNlL2JlZCBjb29yZGluYXRlcy4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlQcmVzc3VyZUdhcmRlblRlcnJhY2VzKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgZGV0YWlsVGV4dHVyZVVybD86IHN0cmluZyk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFkZXRhaWxUZXh0dXJlVXJsKSByZXR1cm47XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKG5vZGUgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAobWVzaC5pc01lc2ggJiYgIUFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgJiYgbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsICYmIG1lc2gubWF0ZXJpYWwubWFwKSBtYXRlcmlhbHMuYWRkKG1lc2gubWF0ZXJpYWwpO1xuICB9KTtcbiAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBtYXRlcmlhbHMpIHtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIGxldCBkaXNwb3NlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGdyYXZlbCA9IG5ldyBUSFJFRS5UZXh0dXJlTG9hZGVyKCkubG9hZChkZXRhaWxUZXh0dXJlVXJsLCB0ZXh0dXJlID0+IHsgaWYgKGRpc3Bvc2VkKSB0ZXh0dXJlLmRpc3Bvc2UoKTsgfSk7XG4gICAgZ3JhdmVsLmNvbG9yU3BhY2UgPSBUSFJFRS5TUkdCQ29sb3JTcGFjZTtcbiAgICBncmF2ZWwud3JhcFMgPSBncmF2ZWwud3JhcFQgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgICBtYXRlcmlhbC5hZGRFdmVudExpc3RlbmVyKCdkaXNwb3NlJywgKCkgPT4geyBkaXNwb3NlZCA9IHRydWU7IGdyYXZlbC5kaXNwb3NlKCk7IH0pO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlKHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmdhcmRlbkdyYXZlbCA9IHsgdmFsdWU6IGdyYXZlbCB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmdhcmRlbldvcmtlZFBpZ21lbnQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM5NTc5NTcnKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmdhcmRlblJvd1BpZ21lbnQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM5ZDg2NjInKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZHYXJkZW5Hcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkdhcmRlbkdyb3VuZCA9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2R2FyZGVuR3JvdW5kO1xcbnVuaWZvcm0gdmVjMyBnYXJkZW5Xb3JrZWRQaWdtZW50O1xcbnVuaWZvcm0gdmVjMyBnYXJkZW5Sb3dQaWdtZW50O1xcbnVuaWZvcm0gc2FtcGxlcjJEIGdhcmRlbkdyYXZlbDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGdhcmRlblggPSBhYnModkdhcmRlbkdyb3VuZC54KSwgZ2FyZGVuWiA9IHZHYXJkZW5Hcm91bmQueTtcbi8vIFRoZSBicm9hZCBkYXJrIHJlY3RhbmdsZXMgYmVsb25nIHRvIHRoZSBvbGQgcGFpbnRlZCBiZWQsIG5vdCB3YXRlciBkZXB0aC5cbi8vIEtlZXAgdGhlIGNhcnZlZCBzdXJmYWNlIGFuZCBjcm9zc2luZyBpbnRhY3Q7IHJlcGxhY2Ugb25seSB0aGVpciBwaWdtZW50LlxudmVjMyBnYXJkZW5TdG9uZSA9IHRleHR1cmUyRChnYXJkZW5HcmF2ZWwsIHZHYXJkZW5Hcm91bmQgLyA1LjcpLnJnYjtcbnZlYzMgZ2FyZGVuRmluZSA9IHRleHR1cmUyRChnYXJkZW5HcmF2ZWwsIG1hdDIoMC44LCAtMC42LCAwLjYsIDAuOCkgKiB2R2FyZGVuR3JvdW5kIC8gMy4xICsgdmVjMigwLjMxLCAwLjY3KSkucmdiO1xuZ2FyZGVuU3RvbmUgPSBtaXgoZ2FyZGVuU3RvbmUsIGdhcmRlbkZpbmUsIDAuMzIpO1xuZmxvYXQgZ2FyZGVuQmFua0JyZWFrID0gc2luKHZHYXJkZW5Hcm91bmQueCAqIDAuNzMpICogMC4yNyArIHNpbih2R2FyZGVuR3JvdW5kLnggKiAxLjkxICsgZ2FyZGVuWikgKiAwLjEyO1xuZmxvYXQgZ2FyZGVuR3JhdmVsRWRnZSA9IDEuMCAtIHNtb290aHN0ZXAoNS45ICsgZ2FyZGVuQmFua0JyZWFrICogMC4yLCA2LjYgKyBnYXJkZW5CYW5rQnJlYWsgKiAwLjIsIGFicyhnYXJkZW5aKSk7XG5mbG9hdCBnYXJkZW5FbmQgPSAxLjAgLSBzbW9vdGhzdGVwKDQ0LjAsIDQ4LjAsIGdhcmRlblgpO1xuZmxvYXQgZ2FyZGVuV2V0ID0gMS4wIC0gc21vb3Roc3RlcCg1LjY1LCA2LjcsIGFicyhnYXJkZW5aKSk7XG52ZWMzIGdhcmRlbkJlZFBpZ21lbnQgPSBnYXJkZW5TdG9uZSAqIG1peCh2ZWMzKDAuOTQsIDAuODUsIDAuNjkpLCB2ZWMzKDAuNDYsIDAuNTIsIDAuNDgpLCBnYXJkZW5XZXQpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBnYXJkZW5CZWRQaWdtZW50LCBnYXJkZW5HcmF2ZWxFZGdlICogZ2FyZGVuRW5kKTtcbmZsb2F0IGdhcmRlbldpZHRoID0gMS4wIC0gc21vb3Roc3RlcCgzOC4wLCA0NC4wLCBnYXJkZW5YKTtcbmZsb2F0IGdhcmRlblNlcnZpY2UgPSBzbW9vdGhzdGVwKDYuMjUsIDkuMCwgZ2FyZGVuWikgKiAoMS4wIC0gc21vb3Roc3RlcCgxNS41LCAxOC4wLCBnYXJkZW5aKSkgKiBnYXJkZW5XaWR0aDtcbmZsb2F0IGdhcmRlbkdyb3dpbmcgPSBzbW9vdGhzdGVwKDExLjUsIDEzLjAsIGdhcmRlblgpICogKDEuMCAtIHNtb290aHN0ZXAoMzcuMCwgMzguNSwgZ2FyZGVuWCkpICogc21vb3Roc3RlcCgxOS41LCAyMS4wLCBnYXJkZW5aKSAqICgxLjAgLSBzbW9vdGhzdGVwKDI4LjAsIDI5LjUsIGdhcmRlblopKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZ2FyZGVuV29ya2VkUGlnbWVudCwgZ2FyZGVuU2VydmljZSAqIDAuMzApO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBnYXJkZW5Sb3dQaWdtZW50LCBnYXJkZW5Hcm93aW5nICogMC4yMyk7XG5mbG9hdCBnYXJkZW5Sb3dQaGFzZSA9IGFicyhzaW4odkdhcmRlbkdyb3VuZC54ICogMi44NSArIHNpbihnYXJkZW5aICogMC4xOSkgKiAwLjE4KSk7XG5mbG9hdCBnYXJkZW5Sb3dJbmsgPSAxLjAgLSBzbW9vdGhzdGVwKDAuMTAsIDAuMjAgKyBmd2lkdGgoZ2FyZGVuUm93UGhhc2UpLCBnYXJkZW5Sb3dQaGFzZSk7XG5kaWZmdXNlQ29sb3IucmdiICo9IDEuMCAtIGdhcmRlbkdyb3dpbmcgKiBnYXJkZW5Sb3dJbmsgKiAwLjE4O1xuZmxvYXQgZ2FyZGVuQmVkWCA9IGFicyh2R2FyZGVuR3JvdW5kLnggLSAxMi4wICogZmxvb3IodkdhcmRlbkdyb3VuZC54IC8gMTIuMCArIDAuNSkpO1xuZmxvYXQgZ2FyZGVuQmVkID0gbWF4KGdhcmRlbkJlZFggLyAyLjUsIGFicyhnYXJkZW5aIC0gMTIuMCkgLyAyLjApO1xuZmxvYXQgZ2FyZGVuQXByb24gPSAoMS4wIC0gc21vb3Roc3RlcCgwLjY1LCAxLjIwLCBnYXJkZW5CZWQpKSAqICgxLjAgLSBzbW9vdGhzdGVwKDE1LjAsIDE2LjAsIGdhcmRlblgpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZ2FyZGVuV29ya2VkUGlnbWVudCAqIDEuMTIsIGdhcmRlbkFwcm9uICogMC4xOCk7XG5mbG9hdCBnYXJkZW5DcmVzdCA9IG1heCgxLjAgLSBzbW9vdGhzdGVwKDAuMTUsIDAuNjUsIGFicyhnYXJkZW5aIC0gMjIuNCkpLCAxLjAgLSBzbW9vdGhzdGVwKDAuMTUsIDAuNjUsIGFicyhnYXJkZW5aIC0gMzUuNCkpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZ2FyZGVuUm93UGlnbWVudCwgZ2FyZGVuQ3Jlc3QgKiBnYXJkZW5XaWR0aCAqIDAuMjApO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ3ByZXNzdXJlLWdhcmRlbi13b3JrZWQtdGVycmFjZXMtZ3JhdmVsLXYyJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIEF1dGhvcmVkIHJvY2tzIHVzZSB3b3JsZCBkZXB0aCBldmVuIHdoZW4gY2FycmllZCBieSB0aGUgcGFub3JhbWEgcGFjay4gKi9cbmZ1bmN0aW9uIHByZXBhcmVQYW5vcmFtYVJvY2tzKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgLi4ubWF0ZXJpYWxOYW1lczogc3RyaW5nW10pOiB2b2lkIHtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCAhbWF0ZXJpYWxOYW1lcy5pbmNsdWRlcyhtZXNoLm1hdGVyaWFsLm5hbWUpKSByZXR1cm47XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsLCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIGNvbnN0IGtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgIG1lc2gucmVuZGVyT3JkZXIgPSAwO1xuICAgIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSB0cnVlO1xuICAgIG1hdGVyaWFsLmZvZyA9IHRydWU7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlci5yZXBsYWNlKCdnbF9Qb3NpdGlvbi56ID0gZ2xfUG9zaXRpb24udyAqIDAuOTk5OTk5OycsICcnKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGAke2tleX18Z2FyZGVuLWJhbmstZm9yZWdyb3VuZGA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIFdvcmtlZCB5YXJkcyBhbmQgcGFsZSBiYWxsYXN0IGZvbGxvdyB0aGUgdHdvIHB1Ymxpc2hlZCBmdW5pY3VsYXIgbGluZXMgYW5kIHRlcnJhY2UgdG9wcy4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlJbmNsaW5lWWFyZHMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuaW5jbGluZUVhcnRoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjOTI3OTVjJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5pbmNsaW5lQmFsbGFzdCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2FhYTA4OCcpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdkluY2xpbmVHcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkluY2xpbmVHcm91bmQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdkluY2xpbmVHcm91bmQ7XFxudW5pZm9ybSB2ZWMzIGluY2xpbmVFYXJ0aDtcXG51bmlmb3JtIHZlYzMgaW5jbGluZUJhbGxhc3Q7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBpbmNsaW5lWCA9IGFicyh2SW5jbGluZUdyb3VuZC54KSwgaW5jbGluZVogPSB2SW5jbGluZUdyb3VuZC55O1xuZmxvYXQgaW5jbGluZURyeSA9IHNtb290aHN0ZXAoNi4yNSwgOS4wLCBhYnMoaW5jbGluZVopKTtcbmZsb2F0IGluY2xpbmVJbnRlcmlvciA9IDEuMCAtIHNtb290aHN0ZXAoMzguMCwgNDcuMCwgbWF4KGluY2xpbmVYLCBhYnMoaW5jbGluZVopKSk7XG5mbG9hdCBpbmNsaW5lUmFpbCA9IDEuMCAtIHNtb290aHN0ZXAoMC43NSwgMS43NSwgYWJzKGluY2xpbmVYIC0gMTIuMCkpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBpbmNsaW5lRWFydGgsIDAuMjggKiBpbmNsaW5lRHJ5ICogaW5jbGluZUludGVyaW9yKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgaW5jbGluZUJhbGxhc3QsIDAuNDIgKiBpbmNsaW5lUmFpbCAqIGluY2xpbmVEcnkgKiBpbmNsaW5lSW50ZXJpb3IpO1xuZmxvYXQgaW5jbGluZUNyZXN0ID0gbWF4KDEuMCAtIHNtb290aHN0ZXAoMC4yLCAwLjksIGFicyhpbmNsaW5lWiAtIDEzLjApKSwgbWF4KDEuMCAtIHNtb290aHN0ZXAoMC4yLCAwLjksIGFicyhpbmNsaW5lWiAtIDI4LjApKSwgMS4wIC0gc21vb3Roc3RlcCgwLjIsIDAuOSwgYWJzKGluY2xpbmVaIC0gNDIuMCkpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGluY2xpbmVCYWxsYXN0LCAwLjIyICogaW5jbGluZUNyZXN0ICogaW5jbGluZUludGVyaW9yKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdpbmNsaW5lLXdvcmtlZC15YXJkcy12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBRdWlldCB0aGUgY2FueW9uJ3MgcmVwZWF0ZWQgaGF0Y2ggYW5kIGNhcnJ5IGl0cyBlYXJ0aCB2YWx1ZSBpbnRvIHRoZSBwYWludGVkIGFwcm9uLiAqL1xuZnVuY3Rpb24gY2xhcmlmeUNhbnlvbkdyb3VuZChtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHBhbm9yYW1hID0gZmFsc2UpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5jYW55b25FYXJ0aCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzgwNmE1MycpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkNhbnlvbkdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52Q2FueW9uR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2Q2FueW9uR3JvdW5kO1xcbnVuaWZvcm0gdmVjMyBjYW55b25FYXJ0aDsnKTtcbiAgICAgIGlmIChwYW5vcmFtYSAmJiBtYXRlcmlhbC5uYW1lICE9PSAnQ2FueW9uQXByb25FYXJ0aCcpIHtcbiAgICAgICAgLy8gVGhlIGFwcm9uIGJlbG9uZ3MgdG8gdGhlIHBhbm9yYW1hIG1lc2gsIG5vdCB0aGUgaGVpZ2h0ZmllbGQuIFByZXNlcnZlIHNreSBwYWludC5cbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PlxuZmxvYXQgY2FueW9uQXByb24gPSAoMS4wIC0gc21vb3Roc3RlcCg2Ni4wLCAxMDguMCwgbWF4KGFicyh2Q2FueW9uR3JvdW5kLngpICogNTYuMCAvIDQ4LjAsIGFicyh2Q2FueW9uR3JvdW5kLnopKSkpICogKDEuMCAtIHNtb290aHN0ZXAoMS4wLCA4LjAsIHZDYW55b25Hcm91bmQueSkpO1xudG90YWxFbWlzc2l2ZVJhZGlhbmNlID0gbWl4KHRvdGFsRW1pc3NpdmVSYWRpYW5jZSwgY2FueW9uRWFydGggKiAwLjMyLCBjYW55b25BcHJvbiAqIDAuNjUpO2ApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBjYW55b25EcnkgPSBzbW9vdGhzdGVwKDYuMjUsIDkuMCwgYWJzKHZDYW55b25Hcm91bmQueikpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBjYW55b25FYXJ0aCwgMC4zNCAqIGNhbnlvbkRyeSk7XG5mbG9hdCBjYW55b25TaGVsZiA9IHNtb290aHN0ZXAoMC41LCA2LjAsIHZDYW55b25Hcm91bmQueSk7XG5kaWZmdXNlQ29sb3IucmdiICo9IDEuMCArIGNhbnlvblNoZWxmICogMC4xMDtgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGBjYW55b24tZ3JvdW5kLXYyLSR7cGFub3JhbWF9LSR7bWF0ZXJpYWwubmFtZX1gO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseU5pZ2h0VGVycmFpblBvb2xzKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgaG9zdDogSG9zdCwgb3BhcXVlTGFuZG1hcmsgPSBmYWxzZSk6IHZvaWQge1xuICAvLyBDYXJyaWVkIHBvb2xzIHVzZSB0aGUgcmlnJ3Mgc3RlZWwtYmx1ZSBmYW1pbHkgYXQgdGhlIHByaW9yIGdyb3VuZCB0aW50J3MgbHVtaW5hbmNlLlxuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g7XG4gICAgaWYgKCFtZXNoLmlzTWVzaCkgcmV0dXJuO1xuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIG1lc2gucmVuZGVyT3JkZXIgPSAwLjE7XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkgbWF0ZXJpYWxzLmFkZChtYXRlcmlhbCk7XG4gIH0pO1xuICBjb25zdCBwb29sU291cmNlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IE5JR0hUX1BPT0xfU0hBREVSX0NBUCB9LCAoKSA9PiBuZXcgVEhSRUUuVmVjdG9yNCgpKTtcbiAgY29uc3QgcG9vbENvdW50ID0geyB2YWx1ZTogMCB9O1xuICBjb25zdCBwb29sRGFya25lc3MgPSB7IHZhbHVlOiAwIH07XG4gIGNvbnN0IHBvb2xJbnRlbnNpdHkgPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnRlcnJhaW5Qb29sSW50ZW5zaXR5IH07XG4gIGNvbnN0IHBvb2xGYWxsb2ZmID0geyB2YWx1ZTogQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5saWdodEZhbGxvZmYgfTtcbiAgY29uc3QgcG9vbENhbmRpZGF0ZXM6IExpZ2h0U291cmNlW10gPSBbXTtcbiAgY29uc3QgcG9vbEdyYWRlU3RyZW5ndGggPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZVN0cmVuZ3RoIH07XG4gIGNvbnN0IHBvb2xHcmFkZUtuZWUgPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZUtuZWUgfTtcbiAgY29uc3QgcG9vbEdyYWRlQ2VpbGluZyA9IHsgdmFsdWU6IEJhbGFuY2UuY29udHJhY3RzLm5pZ2h0U2hpZnQucG9vbEdyYWRlQ2VpbGluZyB9O1xuICBjb25zdCBwb29sR3JhZGVFbmFibGVkID0gIWlzUG9vbEdyYWRlRGlzYWJsZWQoKTtcbiAgbGV0IGxhc3RVcGRhdGVkRnJhbWUgPSAtMTtcbiAgY29uc3QgdXBkYXRlTmlnaHRQb29scyA9IChyZW5kZXJlcjogVEhSRUUuV2ViR0xSZW5kZXJlcikgPT4ge1xuICAgIGlmIChyZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZSA9PT0gbGFzdFVwZGF0ZWRGcmFtZSkgcmV0dXJuO1xuICAgIGxhc3RVcGRhdGVkRnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICAvLyBMaXZlIEJhbGFuY2UgcmVhZHMgc28gdGhlIGNhcHR1cmUgcmlnIGNhbiBBL0IgdGhlIGdyYWRlIGluIG9uZSBzZXNzaW9uIHZpYSBzZXRCYWxhbmNlLlxuICAgIHBvb2xHcmFkZVN0cmVuZ3RoLnZhbHVlID0gQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5wb29sR3JhZGVTdHJlbmd0aDtcbiAgICBwb29sR3JhZGVLbmVlLnZhbHVlID0gQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5wb29sR3JhZGVLbmVlO1xuICAgIHBvb2xHcmFkZUNlaWxpbmcudmFsdWUgPSBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZUNlaWxpbmc7XG4gICAgY29uc3Qgc25hcHNob3QgPSBob3N0Lm5pZ2h0TGlnaHRpbmc/LigpO1xuICAgIHBvb2xEYXJrbmVzcy52YWx1ZSA9IHNuYXBzaG90Py5kYXJrbmVzcyA/PyAwO1xuICAgIHBvb2xDYW5kaWRhdGVzLmxlbmd0aCA9IDA7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc25hcHNob3Q/LnNvdXJjZXMgPz8gW10pIHtcbiAgICAgIGlmIChzb3VyY2Uua2luZCAhPT0gJ3dhdGNoJykgcG9vbENhbmRpZGF0ZXMucHVzaChzb3VyY2UpO1xuICAgIH1cbiAgICBwb29sQ2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiBuaWdodFBvb2xQcmlvcml0eShhKSAtIG5pZ2h0UG9vbFByaW9yaXR5KGIpIHx8IGEuaWQubG9jYWxlQ29tcGFyZShiLmlkKSk7XG4gICAgcG9vbENvdW50LnZhbHVlID0gTWF0aC5taW4ocG9vbENhbmRpZGF0ZXMubGVuZ3RoLCBOSUdIVF9QT09MX1NIQURFUl9DQVApO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBOSUdIVF9QT09MX1NIQURFUl9DQVA7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IGluZGV4IDwgcG9vbENvdW50LnZhbHVlID8gcG9vbENhbmRpZGF0ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xuICAgICAgcG9vbFNvdXJjZXNbaW5kZXhdIS5zZXQoc291cmNlPy54ID8/IDAsIHNvdXJjZT8ueiA/PyAwLCBzb3VyY2U/LnJhZGl1cyA/PyAwLCBpc1dhcm1Qb29sKHNvdXJjZSkgPyAxIDogMCk7XG4gICAgfVxuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xTb3VyY2VzID0gU3RyaW5nKHBvb2xDb3VudC52YWx1ZSk7XG4gIH07XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgaWYgKCEobWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgLy8gVGhlIHNhbWUgcGh5c2ljYWwgcG9vbHMgY2FuIGlsbHVtaW5hdGUgYSB5YXJkIHN0YW5kaW5nIGluIHRoZW0sIHdpdGhvdXRcbiAgICAvLyBpbmhlcml0aW5nIHRlcnJhaW4ncyB0cmFuc3BhcmVudCBjb21wb3NpdGluZyBvciBkaXNhYmxpbmcgaXRzIGRlcHRoLlxuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIHtcbiAgICAgIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMudVRlcnJhaW4zZE5pZ2h0UG9vbENvdW50ID0gcG9vbENvdW50O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xEYXJrbmVzcyA9IHBvb2xEYXJrbmVzcztcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sSW50ZW5zaXR5ID0gcG9vbEludGVuc2l0eTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sRmFsbG9mZiA9IHBvb2xGYWxsb2ZmO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xzID0geyB2YWx1ZTogcG9vbFNvdXJjZXMgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sR3JhZGVTdHJlbmd0aCA9IHBvb2xHcmFkZVN0cmVuZ3RoO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUgPSBwb29sR3JhZGVLbmVlO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUNlaWxpbmcgPSBwb29sR3JhZGVDZWlsaW5nO1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUZXJyYWluM2RXb3JsZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52VGVycmFpbjNkV29ybGQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAnI2luY2x1ZGUgPGNvbW1vbj4nLFxuICAgICAgICAgIGAjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2VGVycmFpbjNkV29ybGQ7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sQ291bnQ7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sRGFya25lc3M7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sSW50ZW5zaXR5O1xcbnVuaWZvcm0gZmxvYXQgdVRlcnJhaW4zZE5pZ2h0UG9vbEZhbGxvZmY7XFxudW5pZm9ybSB2ZWM0IHVUZXJyYWluM2ROaWdodFBvb2xzWyR7TklHSFRfUE9PTF9TSEFERVJfQ0FQfV07YCxcbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsXG4gICAgICAgICAgYCNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cXG52ZWMzIHRlcnJhaW4zZFBvb2xMaWdodCA9IHZlYzMoMC4wKTtcXG5mb3IgKGludCB0ZXJyYWluM2RQb29sSW5kZXggPSAwOyB0ZXJyYWluM2RQb29sSW5kZXggPCAke05JR0hUX1BPT0xfU0hBREVSX0NBUH07IHRlcnJhaW4zZFBvb2xJbmRleCsrKSB7XFxuICBpZiAoZmxvYXQodGVycmFpbjNkUG9vbEluZGV4KSA+PSB1VGVycmFpbjNkTmlnaHRQb29sQ291bnQpIGJyZWFrO1xcbiAgdmVjNCB0ZXJyYWluM2RQb29sID0gdVRlcnJhaW4zZE5pZ2h0UG9vbHNbdGVycmFpbjNkUG9vbEluZGV4XTtcXG4gIGZsb2F0IHRlcnJhaW4zZFBvb2xEaXN0YW5jZSA9IGRpc3RhbmNlKHZUZXJyYWluM2RXb3JsZCwgdGVycmFpbjNkUG9vbC54eSk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sRmFsbG9mZlQgPSBjbGFtcCgodGVycmFpbjNkUG9vbERpc3RhbmNlIC0gdGVycmFpbjNkUG9vbC56KSAvIHVUZXJyYWluM2ROaWdodFBvb2xGYWxsb2ZmLCAwLjAsIDEuMCk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sRmFsbG9mZiA9IHBvdygxLjAgLSB0ZXJyYWluM2RQb29sRmFsbG9mZlQsIDEuNSk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sQ29yZSA9IDEuMCAtIHNtb290aHN0ZXAoMC4wLCAwLjUsIHRlcnJhaW4zZFBvb2xEaXN0YW5jZSAvIG1heCh0ZXJyYWluM2RQb29sLnosIDAuMDAwMSkpO1xcbiAgdmVjMyB0ZXJyYWluM2RQb29sV2FybSA9IG1peCh2ZWMzKDEuMDAsIDAuNDg1LCAwLjEwKSwgdmVjMygxLjAwLCAwLjYyLCAwLjIwKSwgdGVycmFpbjNkUG9vbENvcmUpO1xcbiAgdmVjMyB0ZXJyYWluM2RQb29sVGludCA9IG1peCh2ZWMzKDAuMzI5LCAwLjQ3MywgMC41OTYpLCB0ZXJyYWluM2RQb29sV2FybSwgc3RlcCgwLjUsIHRlcnJhaW4zZFBvb2wudykpO1xcbiAgdGVycmFpbjNkUG9vbExpZ2h0ID0gbWF4KHRlcnJhaW4zZFBvb2xMaWdodCwgdGVycmFpbjNkUG9vbFRpbnQgKiB0ZXJyYWluM2RQb29sRmFsbG9mZik7XFxufVxcbnRvdGFsRW1pc3NpdmVSYWRpYW5jZSArPSBkaWZmdXNlQ29sb3IucmdiICogdGVycmFpbjNkUG9vbExpZ2h0ICogdVRlcnJhaW4zZE5pZ2h0UG9vbERhcmtuZXNzICogdVRlcnJhaW4zZE5pZ2h0UG9vbEludGVuc2l0eTtgLFxuICAgICAgICApO1xuXG4gICAgICBpZiAocG9vbEdyYWRlRW5hYmxlZCkge1xuICAgICAgICAvLyBTZWNvbmQtc3RhZ2UgcmV3cml0ZXMgb3ZlciB0aGUgYmxvY2sgYWJvdmU6IHRyYWNrIHRoZSBzdHJvbmdlc3Qgd2FybSBwb29sJ3MgY292ZXJhZ2VcbiAgICAgICAgLy8gYW5kIHBlci1mcmFnbWVudCB3YXJtIHRpbnQgdGhyb3VnaCB0aGUgZXhpc3RpbmcgbG9vcCwgdGhlbiBncmFkZSBvdXRnb2luZ0xpZ2h0IHJpZ2h0XG4gICAgICAgIC8vIGJlZm9yZSBBQ0VTLiBVbmRlciA/bm9wb29sZ3JhZGUgbm9uZSBvZiB0aGVzZSBydW4gYW5kIHRoZSBzaGFkZXIgaXMgYnl0ZS1pZGVudGljYWwuXG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3VuaWZvcm0gdmVjNCB1VGVycmFpbjNkTmlnaHRQb29scycsXG4gICAgICAgICAgICAndW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVTdHJlbmd0aDtcXG51bmlmb3JtIGZsb2F0IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWU7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVDZWlsaW5nO1xcbnVuaWZvcm0gdmVjNCB1VGVycmFpbjNkTmlnaHRQb29scycsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3ZlYzMgdGVycmFpbjNkUG9vbExpZ2h0ID0gdmVjMygwLjApOycsXG4gICAgICAgICAgICAndmVjMyB0ZXJyYWluM2RQb29sTGlnaHQgPSB2ZWMzKDAuMCk7XFxuZmxvYXQgdGVycmFpbjNkUG9vbEdyYWRlTWFzayA9IDAuMDtcXG52ZWMzIHRlcnJhaW4zZFBvb2xHcmFkZVRpbnQgPSB2ZWMzKDEuMDAsIDAuNjIsIDAuMjApOycsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3RlcnJhaW4zZFBvb2xMaWdodCA9IG1heCh0ZXJyYWluM2RQb29sTGlnaHQsIHRlcnJhaW4zZFBvb2xUaW50ICogdGVycmFpbjNkUG9vbEZhbGxvZmYpOycsXG4gICAgICAgICAgICAndGVycmFpbjNkUG9vbExpZ2h0ID0gbWF4KHRlcnJhaW4zZFBvb2xMaWdodCwgdGVycmFpbjNkUG9vbFRpbnQgKiB0ZXJyYWluM2RQb29sRmFsbG9mZik7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sV2FybUNvdmVyYWdlID0gdGVycmFpbjNkUG9vbEZhbGxvZmYgKiBzdGVwKDAuNSwgdGVycmFpbjNkUG9vbC53KTtcXG4gIGlmICh0ZXJyYWluM2RQb29sV2FybUNvdmVyYWdlID4gdGVycmFpbjNkUG9vbEdyYWRlTWFzaykge1xcbiAgICB0ZXJyYWluM2RQb29sR3JhZGVNYXNrID0gdGVycmFpbjNkUG9vbFdhcm1Db3ZlcmFnZTtcXG4gICAgdGVycmFpbjNkUG9vbEdyYWRlVGludCA9IHRlcnJhaW4zZFBvb2xXYXJtO1xcbiAgfScsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8b3BhcXVlX2ZyYWdtZW50PicsIGAke1BPT0xfR1JBREVfR0xTTH1cXG4jaW5jbHVkZSA8b3BhcXVlX2ZyYWdtZW50PmApO1xuICAgICAgfVxuICAgIH07XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAobWVzaC5pc01lc2gpIG1lc2gub25CZWZvcmVSZW5kZXIgPSB1cGRhdGVOaWdodFBvb2xzO1xuICB9KTtcbiAgaWYgKCFvcGFxdWVMYW5kbWFyaykge1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xzID0gJ3dvcmxkLXNoYWRlcic7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdE5pZ2h0UG9vbFNvdXJjZXMgPSAnMCc7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmlnaHRQb29sUHJpb3JpdHkoc291cmNlOiBMaWdodFNvdXJjZSk6IG51bWJlciB7XG4gIGlmIChzb3VyY2Uua2luZCA9PT0gJ2hlcm8nKSByZXR1cm4gMDtcbiAgaWYgKHNvdXJjZS5raW5kID09PSAncHJvc3BlY3RvcicpIHJldHVybiAxO1xuICBpZiAoc291cmNlLmtpbmQgPT09ICdsYW50ZXJuJyB8fCBzb3VyY2Uua2luZCA9PT0gJ3Bvd2VyZWQtbGFtcCcpIHJldHVybiAyO1xuICByZXR1cm4gMztcbn1cblxuZnVuY3Rpb24gaXNXYXJtUG9vbChzb3VyY2U6IExpZ2h0U291cmNlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG4gIHJldHVybiBzb3VyY2U/LmtpbmQgIT09ICdoZXJvJyAmJiBzb3VyY2U/LmtpbmQgIT09ICdwcm9zcGVjdG9yJztcbn1cblxuLyoqXG4gKiBUaGUgM0QgcGlsb3QgaGlkZXMgYFNwcmluZ1BvbmRzYCBhbG9uZyB3aXRoIGV2ZXJ5IG90aGVyIHBhaW50ZWQgZ3JvdW5kIGxheWVyLCB3aGljaCBvbiBhIG1hcCB3aG9zZVxuICogd2hvbGUgc3RvcnkgaXMgb25lIHNwcmluZyBsZWF2ZXMgdGhlIHdhdGVyIGFzIGJha2VkIGF0bGFzIHBhaW50LiBDb250cmFjdHMgaW5cbiAqIGBMSVZFX1NQUklOR19QT05EX0NPTlRSQUNUU2AgZ2V0IHRoYXQgc3VyZmFjZSBiYWNrIGFzIHJlbmRlci1vbmx5IGdlb21ldHJ5LiBXYXRlciB1c2VzIHRoZSBzaW0nc1xuICogYHdhdGVyU291cmNlc1tdLnJhZGl1c2A7IHRoZSBtZWFzdXJlZCBhdGxhcyBjYXAgb25seSBzaXplcyB0aGUgc2VwYXJhdGUgZGFtcC1ncm91bmQgY292ZXIuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxpdmVTcHJpbmdQb25kcyhob3N0OiBIb3N0LCBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIpOiBTcHJpbmdQb25kU3VyZmFjZVtdIHtcbiAgY29uc3QgcG9vbCA9IExJVkVfU1BSSU5HX1BPTkRfQ09OVFJBQ1RTLmdldChob3N0LmNvbnRyYWN0SWQpO1xuICBpZiAoIXBvb2wpIHJldHVybiBbXTtcbiAgcmV0dXJuIHdhdGVyU291cmNlcygpXG4gICAgLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2Uua2luZCA9PT0gJ3NwcmluZ19wb25kJylcbiAgICAubWFwKChzb3VyY2UpID0+IGNyZWF0ZVNwcmluZ1BvbmRTdXJmYWNlKHtcbiAgICAgIHg6IHNvdXJjZS54LFxuICAgICAgejogc291cmNlLnosXG4gICAgICByYWRpdXM6IHNvdXJjZS5yYWRpdXMsXG4gICAgICBzdXJmYWNlWTogaGVpZ2h0QXQoc291cmNlLngsIHNvdXJjZS56KSArIHBvb2wuc3VyZmFjZVksXG4gICAgICBoZWlnaHRBdCxcbiAgICB9KSk7XG59XG5cbmZ1bmN0aW9uIGhpZGVQYWludGVkUmVsaWVmKGhvc3Q6IEhvc3QpOiBIaWRkZW5SZWxpZWZbXSB7XG4gIGNvbnN0IG9iamVjdHMgPSBuZXcgU2V0PFRIUkVFLk9iamVjdDNEPigpO1xuICBob3N0LnNjZW5lLnRyYXZlcnNlKChvYmplY3QpID0+IHtcbiAgICAvLyBGLUNPUlI0LTE4IGtlZXBzIHRoZSBjb250cmFjdC1vd25lZCB3YXRlciBhbmQgaXRzIGV4aXN0aW5nIGFuaW1hdGlvbi9kZXB0aC5cbiAgICAvLyBPbmx5IHRoZSBiYW5rLCBmb3JkIHBhaW50IGFuZCBvbGQgc3RlcHBpbmcgc3RvbmVzIHlpZWxkIHRvIHRoZSBuZXcgcGFjay5cbiAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLXJpdmVyJyAmJiBvYmplY3QudXNlckRhdGEuYXNzZXRTbG90ID09PSAndGVycmFpbi5yaXZlcicpIHJldHVybjtcbiAgICBpZiAoXG4gICAgICBvYmplY3QudXNlckRhdGEudGVycmFpblJlbGllZiA9PT0gdHJ1ZSB8fFxuICAgICAgb2JqZWN0LnVzZXJEYXRhLnRlcnJhaW5WaXN0YSA9PT0gdHJ1ZSB8fFxuICAgICAgTEVHQUNZX0dST1VORF9TTE9UUy5oYXMoU3RyaW5nKG9iamVjdC51c2VyRGF0YS5hc3NldFNsb3QpKSB8fFxuICAgICAgb2JqZWN0Lm5hbWUgPT09ICdTcHJpbmdQb25kcycgfHxcbiAgICAgIG9iamVjdC5uYW1lID09PSAnRm9yZFN0ZXBwaW5nU3RvbmVzJyB8fFxuICAgICAgb2JqZWN0Lm5hbWUuc3RhcnRzV2l0aCgnUml2ZXJHcmF2ZWxCYXIuJylcbiAgICApIG9iamVjdHMuYWRkKG9iamVjdCk7XG4gIH0pO1xuICBpZiAoaG9zdC5wYWludGVkR3JvdW5kKSBvYmplY3RzLmFkZChob3N0LnBhaW50ZWRHcm91bmQpO1xuICBjb25zdCBoaWRkZW4gPSBbLi4ub2JqZWN0c10ubWFwKChvYmplY3QpID0+ICh7IG9iamVjdCwgdmlzaWJsZTogb2JqZWN0LnZpc2libGUgfSkpO1xuICBmb3IgKGNvbnN0IHsgb2JqZWN0IH0gb2YgaGlkZGVuKSBvYmplY3QudmlzaWJsZSA9IGZhbHNlO1xuICByZXR1cm4gaGlkZGVuO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGFubmVsV2F0ZXIoY29udHJhY3RJZDogc3RyaW5nLCBjb250cmFjdDogQ29udHJhY3QsIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcik6IFRIUkVFLkdyb3VwIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZHJlc3NpbmcgPSBDT05UUkFDVF9DSEFOTkVMX1dBVEVSW2NvbnRyYWN0SWRdO1xuICBjb25zdCByZWdpb25zID0gY29udHJhY3QubWFza1RydXRoPy53YXRlck1hc2s/LnJlZ2lvbnMgPz8gW107XG4gIGlmICghZHJlc3NpbmcgfHwgcmVnaW9ucy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gIC8vIGA/bm9jaGFubmVsd2F0ZXJgIGJvb3RzIHRoZSBpZGVudGljYWwgYnVpbGQgd2l0aCB0aGUgZHJlc3Npbmcgd2l0aGhlbGQuIEl0IGV4aXN0cyBiZWNhdXNlIGFcbiAgLy8gYmVhdXR5IGNsYWltIGlzIG9ubHkgd29ydGggd2hhdCBpdHMgQS9CIHByb3ZlcywgYW5kIGl0IGFsc28gYW5zd2VycyBcImlzIHRoaXMgcmVuZGVyIG9yIHNpbT9cIlxuICAvLyBpbiBvbmUgcmVsb2FkOiBldmVyeSBzdWl0ZSBiZWhhdmVzIGlkZW50aWNhbGx5IHdpdGggaXQgb24sIGJlY2F1c2UgdGhlIHdhdGVyIGlzIGRlY29yYXRpb24uXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmhhcygnbm9jaGFubmVsd2F0ZXInKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FkZSA9IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGg7XG4gIGNvbnN0IGRlZXAgPSBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoO1xuICBjb25zdCBncm91cCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuICBncm91cC5uYW1lID0gJ1RlcnJhaW4zZENoYW5uZWxXYXRlcic7XG4gIGdyb3VwLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiByZWdpb25zKSB7XG4gICAgY29uc3QgY2hhbm5lbCA9IGRyZXNzaW5nLmNoYW5uZWxzW3JlZ2lvbi5pZF07XG4gICAgY29uc3QgcG9pbnRzID0gcmVnaW9uLnBvaW50cyA/PyBbXTtcbiAgICBpZiAoIWNoYW5uZWwgfHwgcmVnaW9uLmtpbmQgIT09ICdwb2x5bGluZV9iYW5kJyB8fCByZWdpb24uem9uZSAhPT0gJ3JpdmVyJyB8fCBwb2ludHMubGVuZ3RoIDwgMiB8fCAhcmVnaW9uLmhhbGZXaWR0aCkgY29udGludWU7XG4gICAgZ3JvdXAuYWRkKGNyZWF0ZVdhdGVyUmliYm9uKHtcbiAgICAgIG5hbWU6IGBUZXJyYWluM2RDaGFubmVsV2F0ZXIuJHtyZWdpb24uaWR9YCxcbiAgICAgIHBvaW50cyxcbiAgICAgIGhhbGZXaWR0aDogcmVnaW9uLmhhbGZXaWR0aCxcbiAgICAgIGVkZ2VCbGVlZDogZHJlc3NpbmcuZWRnZUJsZWVkLFxuICAgICAgLy8gVGhlIG1hc2sgYWdyZWVtZW50IG1lYXN1cmVkIDAgZHJ5IGdyb3VuZCBpbnNpZGUgdGhlIG1hc2sgYXQgdGhpcyBwbGFuZSwgc28gYSBzdXJmYWNlXG4gICAgICAvLyBqdXN0IGFib3ZlIGl0IGNvdmVycyB0aGUgY3V0IGNoYW5uZWwgYW5kIG5vdGhpbmcgZWxzZS4gRGVwdGgtdGVzdGVkLCBzbyB3aGVyZXZlciB0aGVcbiAgICAgIC8vIHJpYmJvbiB3b3VsZCBzdHJheSBvbnRvIGEgYmFuayB0aGUgc2N1bHB0IGl0c2VsZiBvY2NsdWRlcyBpdC5cbiAgICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCxcbiAgICAgIC8vIFJlbmRlciBkZXB0aCwgbm90IHNpbSBkZXB0aDogaXQgb25seSBwaWNrcyBhIHBvaW50IG9uIHRoZSBzaGFkZXIncyB3YWRlLi5kZWVwIGNvbG91clxuICAgICAgLy8gcmFtcCwgc28gdGhlIGNvbnRyYWN0J3Mgbm9ydGgtZGVlcGVyLXRoYW4tc291dGggT1JERVIgcmVhZHMgYXMgY29sb3VyIGFuZCBmb2FtLlxuICAgICAgZGVwdGg6IGNoYW5uZWwuZGVwdGggPT09ICdkZWVwJyA/IGRlZXAgOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIDAuMzQsXG4gICAgICBnbGludHM6IGNoYW5uZWwuZ2xpbnRzID8/IFtdLFxuICAgICAgaGVhZEluc2V0OiBjaGFubmVsLmhlYWRJbnNldCxcbiAgICAgIHRhaWxJbnNldDogY2hhbm5lbC50YWlsSW5zZXQsXG4gICAgICBoZWFkRmFkZTogY2hhbm5lbC5oZWFkRmFkZSxcbiAgICAgIHRhaWxGYWRlOiBjaGFubmVsLnRhaWxGYWRlLFxuICAgICAgYmVkOiB7IGhlaWdodEF0LCAuLi5kcmVzc2luZy5iZWQgfSxcbiAgICB9KSk7XG4gIH1cbiAgZ3JvdXAuYWRkKGNyZWF0ZVdhdGVyQ29uZmx1ZW5jZSh7XG4gICAgbmFtZTogJ1RlcnJhaW4zZENoYW5uZWxXYXRlci5jb25mbHVlbmNlcycsXG4gICAgcGF0aHM6IGRyZXNzaW5nLmNvbmZsdWVuY2VzLm1hcCgoY29uZmx1ZW5jZSkgPT4gY29uZmx1ZW5jZS5wb2ludHMpLFxuICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCArIDAuMDAxLFxuICAgIGRlcHRoOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIDAuNTgsXG4gIH0pKTtcbiAgLy8gVEhFIENST1NTSU5HUyBSRUFEIFdFVCAoYmVhdXR5IFUyJ3MgYWZmb3JkYW5jZSBoYWxmKS4gQm90aCBmb3JkcyBhcmUgY3V0IGJlbG93IHRoZSB3YXRlciBwbGFuZVxuICAvLyBhY3Jvc3MgYW4gMTEgbSBiYW5kIHdoaWxlIG9ubHkgYSAzLjQgbSByaWJib24gY3Jvc3NlcyB0aGVtLCBzbyB0aGUgcGFucyByZW5kZXJlZCBhcyBicm93blxuICAvLyBncmF2ZWwgd2l0aCBhIHN0cmlwZSBvZiByaXZlciB0aHJvdWdoIGl0IGFuZCB0aGUgcHJlc3N1cmUgYm9hcmQgc2hvd2VkIGVuZW1pZXMgd2FkaW5nIGRyeVxuICAvLyBncm91bmQuIE9uZSBzaGVldCBmb3IgYm90aCBwYW5zLCBmcm9tIHRoZSBtYXNrJ3Mgb3duIGZvcmQgcmVjdHMuXG4gIGNvbnN0IHBhbnMgPSByZWdpb25zLmZpbHRlcigocmVnaW9uKSA9PiByZWdpb24ua2luZCA9PT0gJ3JlY3QnICYmIHJlZ2lvbi56b25lID09PSAnZm9yZCcgJiYgcmVnaW9uLm1pblggIT09IHVuZGVmaW5lZCk7XG4gIGlmIChkcmVzc2luZy5mb3JkRGVwdGggIT09IHVuZGVmaW5lZCAmJiBwYW5zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBoYWxmRGVwdGggPSBNYXRoLm1heCguLi5wYW5zLm1hcCgocGFuKSA9PiAocGFuLm1heFohIC0gcGFuLm1pblohKSAvIDIpKTtcbiAgICBncm91cC5hZGQoY3JlYXRlRm9yZFNoZWV0KHtcbiAgICAgIG5hbWU6ICdUZXJyYWluM2RDaGFubmVsV2F0ZXIuZm9yZHMnLFxuICAgICAgcGFuczogcGFucy5tYXAoKHBhbikgPT4gKHsgbWluWDogcGFuLm1pblghLCBtYXhYOiBwYW4ubWF4WCEsIG1pblo6IHBhbi5taW5aISwgbWF4WjogcGFuLm1heFohIH0pKSxcbiAgICAgIGhhbGZEZXB0aCxcbiAgICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCxcbiAgICAgIGRlcHRoOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIGRyZXNzaW5nLmZvcmREZXB0aCxcbiAgICB9KSk7XG4gIH1cbiAgaWYgKGdyb3VwLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgY2xvY2sgPSB7IGZyYW1lOiAtMSwgbGFzdDogMCB9O1xuICBjb25zdCBhZHZhbmNlID0gKHJlbmRlcmVyOiBUSFJFRS5XZWJHTFJlbmRlcmVyKTogdm9pZCA9PiB7XG4gICAgaWYgKHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lID09PSBjbG9jay5mcmFtZSkgcmV0dXJuO1xuICAgIGNsb2NrLmZyYW1lID0gcmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWU7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSBjbG9jay5sYXN0ID09PSAwID8gMCA6IE1hdGgubWluKDAuMSwgTWF0aC5tYXgoMCwgKG5vdyAtIGNsb2NrLmxhc3QpIC8gMTAwMCkpO1xuICAgIGNsb2NrLmxhc3QgPSBub3c7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBncm91cC5jaGlsZHJlbikgdXBkYXRlV2F0ZXJNYXRlcmlhbChjaGlsZCBhcyBUSFJFRS5NZXNoLCBkZWx0YSk7XG4gIH07XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZ3JvdXAuY2hpbGRyZW4pIChjaGlsZCBhcyBUSFJFRS5NZXNoKS5vbkJlZm9yZVJlbmRlciA9IGFkdmFuY2U7XG4gIHJldHVybiBncm91cDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29udGludWF0aW9uKFxuICB0ZXJyYWluOiBUSFJFRS5PYmplY3QzRCxcbiAgcGFub3JhbWE6IFRIUkVFLk9iamVjdDNELFxuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsXG4gIGJvdW5kczogVEhSRUUuQm94MyxcbiAgY29udHJhY3RJZDogc3RyaW5nLFxuKTogVEhSRUUuTWVzaCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHNvdXJjZSA9IHRlcnJhaW4uZ2V0T2JqZWN0QnlQcm9wZXJ0eSgnaXNNZXNoJywgdHJ1ZSkgYXMgVEhSRUUuTWVzaCB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzb3VyY2UgfHwgQXJyYXkuaXNBcnJheShzb3VyY2UubWF0ZXJpYWwpKSByZXR1cm4gdW5kZWZpbmVkO1xuICBwYW5vcmFtYS51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcbiAgY29uc3QgcG9pbnQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICBsZXQgb3V0ZXJSYWRpdXMgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIGxldCBvdXRlckhlaWdodCA9IDA7XG4gIGxldCBpbm5lckNoZWJ5c2hldiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgcGFub3JhbWEudHJhdmVyc2UoKG9iamVjdCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IG1lc2guaXNNZXNoID8gbWVzaC5nZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFwb3NpdGlvbikgcmV0dXJuO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbi5jb3VudDsgaW5kZXggKz0gMSkge1xuICAgICAgcG9pbnQuZnJvbUJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbiBhcyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUsIGluZGV4KTtcbiAgICAgIG1lc2gubG9jYWxUb1dvcmxkKHBvaW50KTtcbiAgICAgIGlubmVyQ2hlYnlzaGV2ID0gTWF0aC5taW4oaW5uZXJDaGVieXNoZXYsIE1hdGgubWF4KE1hdGguYWJzKHBvaW50LngpLCBNYXRoLmFicyhwb2ludC56KSkpO1xuICAgICAgY29uc3QgcmFkaXVzID0gTWF0aC5oeXBvdChwb2ludC54LCBwb2ludC56KTtcbiAgICAgIGlmIChyYWRpdXMgPCBvdXRlclJhZGl1cykge1xuICAgICAgICBvdXRlclJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgb3V0ZXJIZWlnaHQgPSBwb2ludC55O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGRlZXBTa3lHcm91bmQgPSBjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyB8fCBjb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnO1xuICBjb25zdCBoYWxmWCA9IE1hdGgubWF4KE1hdGguYWJzKGJvdW5kcy5taW4ueCksIE1hdGguYWJzKGJvdW5kcy5tYXgueCkpO1xuICBjb25zdCBoYWxmWiA9IE1hdGgubWF4KE1hdGguYWJzKGJvdW5kcy5taW4ueiksIE1hdGguYWJzKGJvdW5kcy5tYXgueikpO1xuICBpZiAoIU51bWJlci5pc0Zpbml0ZShvdXRlclJhZGl1cykgfHwgKCFkZWVwU2t5R3JvdW5kICYmIGlubmVyQ2hlYnlzaGV2IDw9IE1hdGgubWF4KGhhbGZYLCBoYWxmWikgKyAwLjUpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAvLyBUaGUgcGFub3JhbWEncyBuZWFyIHJpZGdlIHN0YXJ0cyBhdCByYWRpdXMgMTYxLjU7IGNvdmVyIHRoZSBpbnRlcnZlbmluZyBncm91bmQuXG4gIGlmIChkZWVwU2t5R3JvdW5kKSBvdXRlclJhZGl1cyA9IDE2MDtcblxuICAvLyBLZWVwIHRoZSBuaWdodCBncm91bmQgYmV5b25kIGV2ZXJ5IHNxdWFyZSBjb3JuZXIgYW5kIHRoZSBwZXJpbWV0ZXIgbGFuZG1hcmtzLlxuICBpZiAoY29udHJhY3RJZCA9PT0gJ2UzLW1vdGgtc2Vhc29uJykgb3V0ZXJSYWRpdXMgPSBNYXRoLm1heChvdXRlclJhZGl1cywgTWF0aC5oeXBvdChoYWxmWCwgaGFsZlopICsgMTIpO1xuXG4gIGNvbnN0IGVkZ2VTZWdtZW50cyA9IDMyO1xuICBjb25zdCBlZGdlOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtdO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZVNlZ21lbnRzOyBpbmRleCArPSAxKSBlZGdlLnB1c2goW1RIUkVFLk1hdGhVdGlscy5sZXJwKC1oYWxmWCwgaGFsZlgsIGluZGV4IC8gZWRnZVNlZ21lbnRzKSwgLWhhbGZaXSk7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBlZGdlU2VnbWVudHM7IGluZGV4ICs9IDEpIGVkZ2UucHVzaChbaGFsZlgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKC1oYWxmWiwgaGFsZlosIGluZGV4IC8gZWRnZVNlZ21lbnRzKV0pO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZVNlZ21lbnRzOyBpbmRleCArPSAxKSBlZGdlLnB1c2goW1RIUkVFLk1hdGhVdGlscy5sZXJwKGhhbGZYLCAtaGFsZlgsIGluZGV4IC8gZWRnZVNlZ21lbnRzKSwgaGFsZlpdKTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVkZ2VTZWdtZW50czsgaW5kZXggKz0gMSkgZWRnZS5wdXNoKFstaGFsZlgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhhbGZaLCAtaGFsZlosIGluZGV4IC8gZWRnZVNlZ21lbnRzKV0pO1xuICBjb25zdCByaW5ncyA9IE1hdGgubWF4KDIsIE1hdGgubWluKDMyLCBNYXRoLmNlaWwoKG91dGVyUmFkaXVzIC0gTWF0aC5tYXgoaGFsZlgsIGhhbGZaKSkgLyA1KSkpO1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IHV2czogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgcmluZyA9IDA7IHJpbmcgPD0gcmluZ3M7IHJpbmcgKz0gMSkge1xuICAgIGNvbnN0IG1peCA9IHJpbmcgLyByaW5ncztcbiAgICBjb25zdCBlYXNlZCA9IG1peCAqIG1peCAqICgzIC0gMiAqIG1peCk7XG4gICAgZm9yIChjb25zdCBbaW5uZXJYLCBpbm5lclpdIG9mIGVkZ2UpIHtcbiAgICAgIGNvbnN0IGlubmVyUmFkaXVzID0gTWF0aC5oeXBvdChpbm5lclgsIGlubmVyWik7XG4gICAgICBjb25zdCBvdXRlclggPSBpbm5lclggLyBpbm5lclJhZGl1cyAqIG91dGVyUmFkaXVzO1xuICAgICAgY29uc3Qgb3V0ZXJaID0gaW5uZXJaIC8gaW5uZXJSYWRpdXMgKiBvdXRlclJhZGl1cztcbiAgICAgIGNvbnN0IHggPSBUSFJFRS5NYXRoVXRpbHMubGVycChpbm5lclgsIG91dGVyWCwgbWl4KTtcbiAgICAgIGNvbnN0IHogPSBUSFJFRS5NYXRoVXRpbHMubGVycChpbm5lclosIG91dGVyWiwgbWl4KTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdCh4IC0gaW5uZXJYLCB6IC0gaW5uZXJaKTtcbiAgICAgIGNvbnN0IHJlcGVhdGVkID0gZGlzdGFuY2UgJSAoQ09OVElOVUFUSU9OX1NBTVBMRV9ERVBUSCAqIDIpO1xuICAgICAgY29uc3Qgc2FtcGxlRGVwdGggPSByZXBlYXRlZCA8PSBDT05USU5VQVRJT05fU0FNUExFX0RFUFRIID8gcmVwZWF0ZWQgOiBDT05USU5VQVRJT05fU0FNUExFX0RFUFRIICogMiAtIHJlcGVhdGVkO1xuICAgICAgY29uc3Qgc2FtcGxlWCA9IGlubmVyWCAtIGlubmVyWCAvIGlubmVyUmFkaXVzICogc2FtcGxlRGVwdGg7XG4gICAgICBjb25zdCBzYW1wbGVaID0gaW5uZXJaIC0gaW5uZXJaIC8gaW5uZXJSYWRpdXMgKiBzYW1wbGVEZXB0aDtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhlaWdodEF0KGlubmVyWCwgaW5uZXJaKSwgb3V0ZXJIZWlnaHQsIGVhc2VkKSwgeik7XG4gICAgICBjb25zdCB1dlggPSAoY29udHJhY3RJZCA9PT0gJ2UzLW1vdGgtc2Vhc29uJyB8fCBkZWVwU2t5R3JvdW5kKSA/IHggOiBzYW1wbGVYO1xuICAgICAgY29uc3QgdXZaID0gKGNvbnRyYWN0SWQgPT09ICdlMy1tb3RoLXNlYXNvbicgfHwgZGVlcFNreUdyb3VuZCkgPyB6IDogc2FtcGxlWjtcbiAgICAgIHV2cy5wdXNoKCh1dlggLSBib3VuZHMubWluLngpIC8gKGJvdW5kcy5tYXgueCAtIGJvdW5kcy5taW4ueCksIChib3VuZHMubWF4LnogLSB1dlopIC8gKGJvdW5kcy5tYXgueiAtIGJvdW5kcy5taW4ueikpO1xuICAgIH1cbiAgfVxuICBmb3IgKGxldCByaW5nID0gMDsgcmluZyA8IHJpbmdzOyByaW5nICs9IDEpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZS5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IG5leHQgPSAoaW5kZXggKyAxKSAlIGVkZ2UubGVuZ3RoO1xuICAgICAgY29uc3QgYSA9IHJpbmcgKiBlZGdlLmxlbmd0aCArIGluZGV4O1xuICAgICAgY29uc3QgYiA9IHJpbmcgKiBlZGdlLmxlbmd0aCArIG5leHQ7XG4gICAgICBjb25zdCBjID0gKHJpbmcgKyAxKSAqIGVkZ2UubGVuZ3RoICsgaW5kZXg7XG4gICAgICBjb25zdCBkID0gKHJpbmcgKyAxKSAqIGVkZ2UubGVuZ3RoICsgbmV4dDtcbiAgICAgIGluZGljZXMucHVzaChhLCBiLCBjLCBiLCBkLCBjKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3V2JywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgndXYxJywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XG4gIGdlb21ldHJ5LnNldEluZGV4KGluZGljZXMpO1xuICBnZW9tZXRyeS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuICBpZiAoY29udHJhY3RJZCA9PT0gJ2UxMC1lbWJlci1zaG9yZScpIHtcbiAgICAvLyBUaGUgdHdvIHN1cmZhY2VzIGFscmVhZHkgbWVldCBpbiBwb3NpdGlvbi4gTWF0Y2ggdGhlaXIgbGlnaHRpbmcgbm9ybWFsc1xuICAgIC8vIGF0IHRoYXQgam9pbiwgdGhlbiBibGVuZCBpbnRvIHRoZSBhcHJvbiBvdmVyIGl0cyBmaXJzdCB0d28gcmluZ3MuXG4gICAgY29uc3Qgc291cmNlUG9zaXRpb25zID0gc291cmNlLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKTtcbiAgICBjb25zdCBzb3VyY2VOb3JtYWxzID0gc291cmNlLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgnbm9ybWFsJyk7XG4gICAgY29uc3Qgbm9ybWFscyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgnbm9ybWFsJyk7XG4gICAgY29uc3QgZWRnZU5vcm1hbHMgPSBuZXcgTWFwPHN0cmluZywgVEhSRUUuVmVjdG9yMz4oKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZVBvc2l0aW9ucy5jb3VudDsgaSArPSAxKSB7XG4gICAgICBjb25zdCB4ID0gc291cmNlUG9zaXRpb25zLmdldFgoaSksIHogPSBzb3VyY2VQb3NpdGlvbnMuZ2V0WihpKTtcbiAgICAgIGlmIChNYXRoLmFicyhNYXRoLmFicyh4KSAtIGhhbGZYKSA8IDAuMDAxIHx8IE1hdGguYWJzKE1hdGguYWJzKHopIC0gaGFsZlopIDwgMC4wMDEpIHtcbiAgICAgICAgZWRnZU5vcm1hbHMuc2V0KGAke3gudG9GaXhlZCgzKX0sJHt6LnRvRml4ZWQoMyl9YCwgbmV3IFRIUkVFLlZlY3RvcjMoKS5mcm9tQnVmZmVyQXR0cmlidXRlKHNvdXJjZU5vcm1hbHMsIGkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYmxlbmRlZCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgZm9yIChsZXQgcmluZyA9IDA7IHJpbmcgPCAyOyByaW5nICs9IDEpIGZvciAobGV0IGkgPSAwOyBpIDwgZWRnZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgY29uc3QgW3gsIHpdID0gZWRnZVtpXSE7XG4gICAgICBjb25zdCBub3JtYWwgPSBlZGdlTm9ybWFscy5nZXQoYCR7eC50b0ZpeGVkKDMpfSwke3oudG9GaXhlZCgzKX1gKTtcbiAgICAgIGlmICghbm9ybWFsKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IGluZGV4ID0gcmluZyAqIGVkZ2UubGVuZ3RoICsgaTtcbiAgICAgIGJsZW5kZWQuZnJvbUJ1ZmZlckF0dHJpYnV0ZShub3JtYWxzLCBpbmRleCkubGVycChub3JtYWwsIDEgLSByaW5nICogMC41KS5ub3JtYWxpemUoKTtcbiAgICAgIG5vcm1hbHMuc2V0WFlaKGluZGV4LCBibGVuZGVkLngsIGJsZW5kZWQueSwgYmxlbmRlZC56KTtcbiAgICB9XG4gICAgbm9ybWFscy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbiAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gIGNvbnN0IG1hdGVyaWFsID0gc291cmNlLm1hdGVyaWFsLmNsb25lKCk7XG4gIGlmIChjb250cmFjdElkID09PSAnZTMtbW90aC1zZWFzb24nIHx8IGRlZXBTa3lHcm91bmQpIHtcbiAgICBjb25zdCBtYXBwZWQgPSBtYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbDtcbiAgICBpZiAobWFwcGVkLm1hcCkge1xuICAgICAgbWFwcGVkLm1hcCA9IG1hcHBlZC5tYXAuY2xvbmUoKTtcbiAgICAgIG1hcHBlZC5tYXAud3JhcFMgPSBtYXBwZWQubWFwLndyYXBUID0gVEhSRUUuTWlycm9yZWRSZXBlYXRXcmFwcGluZztcbiAgICAgIG1hcHBlZC5tYXAubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgKG1hdGVyaWFsIGFzIFRIUkVFLk1hdGVyaWFsICYgeyBmb2c/OiBib29sZWFuIH0pLmZvZyA9IGRlZXBTa3lHcm91bmQ7XG4gIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlcikgPT4ge1xuICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoXG4gICAgICAnI2luY2x1ZGUgPHByb2plY3RfdmVydGV4PicsXG4gICAgICAnI2luY2x1ZGUgPHByb2plY3RfdmVydGV4PlxcbmdsX1Bvc2l0aW9uLnogPSBnbF9Qb3NpdGlvbi53ICogMC45OTk5OTsnLFxuICAgICk7XG4gIH07XG4gIGlmIChjb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnKSB7XG4gICAgLy8gVGhlIGZsb29yIG11c3Qgb2NjbHVkZSB0aGUgYnVyaWVkIGZlZXQgb2YgbmVhciBsaWJyYXJ5IHNjZW5lcnkuXG4gICAgbWF0ZXJpYWwuZGVwdGhXcml0ZSA9IHRydWU7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKCkgPT4gdW5kZWZpbmVkO1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdhcmNoaXZlLWNvbnRpbnVhdGlvbi1kZXB0aC12MSc7XG4gIH1cbiAgLy8gVEhFIEFUTU9TUEhFUklDUyBTSElGVDogdGhpcyBhcHJvbiDigJQgbm90IHRoZSBwYW5vcmFtYSDigJQgaXMgd2hhdCBhIHJ1biBmcmFtZSdzIHRvcCBlZGdlXG4gIC8vIGFjdHVhbGx5IGNvbnRhaW5zIG9uY2UgdGhlIHBsYXllciBjcm9zc2VzIG9udG8gdGhlIGZhciBiYW5rLiBNZWFzdXJlZCwgcGVyIGNvbnRyYWN0LCBpblxuICAvLyBzcmMvd29ybGQvSG9yaXpvbkFwcm9uLnRzLlxuICBjb25zdCBhcHJvbiA9IGhvcml6b25BcHJvblByb2ZpbGUoY29udHJhY3RJZCk7XG4gIGlmIChhcHJvbikgcGFpbnRIb3Jpem9uQXByb24obWF0ZXJpYWwsIGFwcm9uKTtcbiAgY29uc3QgY29udGludWF0aW9uID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgY29udGludWF0aW9uLnJlY2VpdmVTaGFkb3cgPSBkZWVwU2t5R3JvdW5kO1xuICBjb250aW51YXRpb24udXNlckRhdGEuaG9yaXpvbkFwcm9uID0gYXByb24gPyAncGFpbnRlZCcgOiAncGxhaW4nO1xuICBjb250aW51YXRpb24uZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBjb250aW51YXRpb24ucmVuZGVyT3JkZXIgPSAtNTA7XG4gIGNvbnRpbnVhdGlvbi5uYW1lID0gJ1RlcnJhaW4zZFNjdWxwdENvbnRpbnVhdGlvbic7XG4gIGNvbnRpbnVhdGlvbi51c2VyRGF0YS50ZXJyYWluM2RTa2lydEJsZW5kID0gdHJ1ZTtcbiAgcmV0dXJuIGNvbnRpbnVhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxUZXJyYWluM2RDbGFpbVBpbG90KGhvc3Q6IEhvc3QpOiAoKSA9PiB2b2lkIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBSRUdJU1RSWVtob3N0LmNvbnRyYWN0SWRdO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90Q29udHJhY3QgPSBob3N0LmNvbnRyYWN0SWQ7XG4gIGlmIChwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcygpLnRpZXIgPT09ICdsaXRlJykge1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0xvYWRTdGF0ZSA9ICdsaXRlJztcbiAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAnbGl0ZScsICdwYWludGVkJyk7XG4gICAgcmV0dXJuICgpID0+IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoIXNlbGVjdGVkIHx8IHNlbGVjdGVkLmNvbnRyYWN0LnRpbGVJZCAhPT0gaG9zdC50aWxlSWQpIHtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnb2ZmJztcbiAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAnZmFpbGVkJywgJ3BhaW50ZWQnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCAncGlsb3QtY29udHJhY3QtdW5hdmFpbGFibGUnKTtcbiAgICByZXR1cm4gcGFpbnRSaXZlclJldHVybihob3N0KTtcbiAgfVxuICBjb25zdCByZXN0b3JlUml2ZXJQYWludCA9IHBhaW50Uml2ZXJSZXR1cm4oaG9zdCk7XG4gIGxldCBkaXNwb3NlZCA9IGZhbHNlO1xuICBsZXQgdGVycmFpbjogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQ7XG4gIGxldCBwYW5vcmFtYTogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQ7XG4gIGxldCBsYW5kbWFya3M6IFRIUkVFLkdyb3VwIHwgdW5kZWZpbmVkO1xuICBsZXQgc2tpcnQ6IFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkO1xuICBsZXQgc2N1bHB0V2F0ZXI6IFNjdWxwdFdhdGVyIHwgdW5kZWZpbmVkO1xuICBsZXQgc3VuTW90ZXM6IFN1bk1vdGVzIHwgdW5kZWZpbmVkO1xuICBsZXQgcnVzaEVtYmVyczogU3VuTW90ZXMgfCB1bmRlZmluZWQ7XG4gIGxldCBzdGVhbVBsdW1lOiBTdGVhbVBsdW1lIHwgdW5kZWZpbmVkO1xuICBsZXQgc3RlYW1XaXNwczogU3VuTW90ZXNbXSA9IFtdO1xuICBsZXQgaGF1bFN0ZWFtOiBIYXVsU3RlYW0gfCB1bmRlZmluZWQ7XG4gIGxldCBsYW5kbWFya0NvbnRhY3RzOiBUSFJFRS5JbnN0YW5jZWRNZXNoIHwgdW5kZWZpbmVkO1xuICBsZXQgd2F0ZXJDb2xsYXJzOiBUSFJFRS5JbnN0YW5jZWRNZXNoIHwgdW5kZWZpbmVkO1xuICBsZXQgc3BhblNoYWRvdzogVEhSRUUuTWVzaCB8IHVuZGVmaW5lZDtcbiAgbGV0IGNyb3NzaW5nQnJlYXRoOiBDcm9zc2luZ0JyZWF0aCB8IHVuZGVmaW5lZDtcbiAgbGV0IHBvbmRzOiBTcHJpbmdQb25kU3VyZmFjZVtdID0gW107XG4gIGxldCBuZXh0UG9uZHM6IFNwcmluZ1BvbmRTdXJmYWNlW10gPSBbXTtcbiAgbGV0IGNoYW5uZWxXYXRlcjogVEhSRUUuR3JvdXAgfCB1bmRlZmluZWQ7XG4gIGxldCBoaWRkZW5SZWxpZWY6IEhpZGRlblJlbGllZltdID0gW107XG4gIGxldCBsb2FkZWRUZXJyYWluOiBUSFJFRS5PYmplY3QzRCB8IHVuZGVmaW5lZDtcbiAgbGV0IGxvYWRlZFBhbm9yYW1hOiBUSFJFRS5PYmplY3QzRCB8IHVuZGVmaW5lZDtcbiAgbGV0IGxvYWRGYWlsZWQgPSBmYWxzZTtcbiAgbGV0IHVuaW5zdGFsbEhlaWdodFNvdXJjZTogKCgpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFuZG1hcmtXYWxrU3VyZmFjZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZUxhbmRtYXJrV2Fsa1N1cmZhY2VzPiA9IG51bGw7XG4gIGNvbnN0IG9uQ29udGV4dExvc3QgPSAoKSA9PiByZXBvcnRSZW5kZXJEZW1vdGlvbihob3N0LmNhbnZhcywgJ3dlYmdsLWNvbnRleHQtbG9zdCcpO1xuICBob3N0LmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3ZWJnbGNvbnRleHRsb3N0Jywgb25Db250ZXh0TG9zdCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RUZXJyYWluTG9hZFN0YXRlID0gJ3BlbmRpbmcnO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFMb2FkU3RhdGUgPSAncGVuZGluZyc7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0xvYWRTdGF0ZSA9ICdwZW5kaW5nJztcbiAgcHVibGlzaChob3N0LmNhbnZhcywgJ2xvYWRpbmcnLCAncGFpbnRlZCcpO1xuICBjb25zdCBsb2FkZXIgPSB0cmFja2VkR2x0ZkxvYWRlcihob3N0LmNhbnZhcywgJ3RoZSBjbGFpbScpO1xuICBjb25zdCBkaXNwb3NlTG9hZGVkID0gKCkgPT4ge1xuICAgIGlmIChsb2FkZWRUZXJyYWluKSB7XG4gICAgICBkaXNwb3NlT2JqZWN0M0QobG9hZGVkVGVycmFpbik7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90VGVycmFpbkxvYWRTdGF0ZSA9ICdkaXNwb3NlZCc7XG4gICAgfVxuICAgIGlmIChsb2FkZWRQYW5vcmFtYSkge1xuICAgICAgZGlzcG9zZU9iamVjdDNEKGxvYWRlZFBhbm9yYW1hKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RQYW5vcmFtYUxvYWRTdGF0ZSA9ICdkaXNwb3NlZCc7XG4gICAgfVxuICAgIGxvYWRlZFRlcnJhaW4gPSB1bmRlZmluZWQ7XG4gICAgbG9hZGVkUGFub3JhbWEgPSB1bmRlZmluZWQ7XG4gIH07XG4gIGNvbnN0IGZhaWxMb2FkID0gKGVycm9yOiB1bmtub3duKSA9PiB7XG4gICAgaWYgKGxvYWRGYWlsZWQpIHJldHVybjtcbiAgICBsb2FkRmFpbGVkID0gdHJ1ZTtcbiAgICBkaXNwb3NlTG9hZGVkKCk7XG4gICAgaWYgKCFkaXNwb3NlZCkgcHVibGlzaChob3N0LmNhbnZhcywgJ2ZhaWxlZCcsICdwYWludGVkJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgYHBpbG90LWxvYWQtZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YCk7XG4gIH07XG4gIGNvbnN0IGluc3RhbGxMb2FkZWQgPSAoKSA9PiB7XG4gICAgaWYgKCFsb2FkZWRUZXJyYWluIHx8ICFsb2FkZWRQYW5vcmFtYSB8fCBsb2FkRmFpbGVkKSByZXR1cm47XG4gICAgY29uc3QgbmV4dFRlcnJhaW4gPSBsb2FkZWRUZXJyYWluO1xuICAgIGNvbnN0IG5leHRQYW5vcmFtYSA9IGxvYWRlZFBhbm9yYW1hO1xuICAgIGNvbnN0IHRlcnJhaW5NZXRyaWNzID0gaW5zcGVjdChuZXh0VGVycmFpbiwgdHJ1ZSk7XG4gICAgY29uc3QgcGFub3JhbWFNZXRyaWNzID0gaW5zcGVjdChuZXh0UGFub3JhbWEsIGZhbHNlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGVycmFpblZhbGlkID0gdmFsaWRUZXJyYWluKHRlcnJhaW5NZXRyaWNzLCBzZWxlY3RlZC5jb250cmFjdCk7XG4gICAgICBjb25zdCBwYW5vcmFtYVZhbGlkID0gdmFsaWRQYW5vcmFtYShwYW5vcmFtYU1ldHJpY3MsIHNlbGVjdGVkLnBhbm9yYW1hQ29udHJhY3QsIHNlbGVjdGVkLmNvbnRyYWN0LnBhbm9yYW1hTW91bnQpO1xuICAgICAgaWYgKCF0ZXJyYWluVmFsaWQgfHwgIXBhbm9yYW1hVmFsaWQpIHtcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEZhaWx1cmUgPSBgdGVycmFpbjoke3RlcnJhaW5WYWxpZH07cGFub3JhbWE6JHtwYW5vcmFtYVZhbGlkfWA7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndGVycmFpbiBjb250cmFjdCBtaXNtYXRjaCcpO1xuICAgICAgfVxuICAgICAgY29uc3QgaGVpZ2h0QXQgPSBiYWtlSGVpZ2h0R3JpZChuZXh0VGVycmFpbiwgdGVycmFpbk1ldHJpY3MpO1xuICAgICAgaWYgKGRpc3Bvc2VkKSB0aHJvdyBuZXcgRXJyb3IoJ3RlcnJhaW4gcGlsb3QgZGlzcG9zZWQnKTtcbiAgICAgIG5leHRQb25kcyA9IGNyZWF0ZUxpdmVTcHJpbmdQb25kcyhob3N0LCBoZWlnaHRBdCk7XG4gICAgICBuZXh0VGVycmFpbi5uYW1lID0gJ1RlcnJhaW4zZENsYWltUGlsb3QnO1xuICAgICAgaWYgKGhvc3QuYXJjaGl2ZVJlc3RvcmF0aW9uKSBpbnN0YWxsQXJjaGl2ZVJlc3RvcmF0aW9uKG5leHRUZXJyYWluLCBob3N0LmFyY2hpdmVSZXN0b3JhdGlvbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEtdHdpbi1iYW5rcycpIGNhbG1Ud2luQmFua3NHcm91bmQobmV4dFRlcnJhaW4pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxLWJhcm9uJykgc2VwYXJhdGVCYXJvbkdyb3VuZFNjYXJzKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMi10cmVzdGxlJykgY2FsbVRyZXN0bGVBcHByb2FjaGVzKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMi1wcmVzc3VyZS1nYXJkZW4nKSBjbGFyaWZ5UHJlc3N1cmVHYXJkZW5UZXJyYWNlcyhuZXh0VGVycmFpbiwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTItaW5jbGluZScpIGNsYXJpZnlJbmNsaW5lWWFyZHMobmV4dFRlcnJhaW4pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UzLWNhbnlvbi13b3JrcycpIGNsYXJpZnlDYW55b25Hcm91bmQobmV4dFRlcnJhaW4pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxMC1sYXN0LWNsYWltJykgcGFpbnRMYXN0Q2xhaW1EZWNrKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMTAtcml2ZXInKSBwYWludFJpdmVyQmFua3MobmV4dFRlcnJhaW4pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxMC1lbWJlci1zaG9yZScpIGNsYXJpZnlFbWJlckJhc2FsdChuZXh0VGVycmFpbiwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnKSBjbGFyaWZ5QXJjaGl2ZVRlcnJhY2VzKG5leHRUZXJyYWluLCBob3N0LmFyY2hpdmVSZXN0b3JhdGlvbiwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTktZGV2aWxzLWFsbGV5JykgZ3JhZGVUZXJyYWluQnlIZWlnaHQobmV4dFRlcnJhaW4sICcjOWY4YjZlJywgJyNiYmE0ODcnLCAtMC4xNCwgNC41NywgMC40Nik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTgtbG93LW9yYml0JykgZ3JhZGVUZXJyYWluQnlIZWlnaHQobmV4dFRlcnJhaW4sICcjNzc3YTc2JywgJyNhNWEyOGUnLCAtNC44LCAwLjcsIDAuMzgpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2U4LWZhci1zaWRlJykgY2xhcmlmeUZhclNpZGVSZWdvbGl0aChuZXh0VGVycmFpbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTktZG9tZS1iYXNpbicgJiYgc2VsZWN0ZWQuY29udHJhY3QubWFza1RydXRoPy5jYW5hbFJvdXRlKSBjbGFyaWZ5UmVkRmllbGRzUm91dGUobmV4dFRlcnJhaW4sIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aC5jYW5hbFJvdXRlLnBvaW50cyk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTktb2xkLWNhbmFsJyAmJiBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGg/LmluaGVyaXRlZENhbmFsUm91dGUpIGNsYXJpZnlSZWRGaWVsZHNSb3V0ZShuZXh0VGVycmFpbiwgc2VsZWN0ZWQuY29udHJhY3QubWFza1RydXRoLmluaGVyaXRlZENhbmFsUm91dGUucG9pbnRzLCBbXSwgdHJ1ZSk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTktc2VlZC1ydW4nICYmIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aD8uY2FyYXZhblJvdXRlKSBjbGFyaWZ5UmVkRmllbGRzUm91dGUobmV4dFRlcnJhaW4sIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aC5jYXJhdmFuUm91dGUsIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aC5wZXJtYW5lbnRHcmVlbldheXBvaW50Wm9uZXMpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2U2LWdsb3ctbWVzYScpIGdyYWRlVGVycmFpbkJ5SGVpZ2h0KG5leHRUZXJyYWluLCAnIzlmODg2NycsICcjOWI5NjgyJywgMS41LCA0LjYsIDAuMzQpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2U3LXJlbGF5LXJ1c2gnKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM4OTg0NzYnLCAnI2IyYTQ4MicsIDAuNCwgNC42LCAwLjM0KTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNy1kZWFkLWJhbmQnKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM4ODg0NzQnLCAnI2IyYWI5MicsIDAuNCwgNC42LCAwLjM0KTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNi1waWNuaWMnKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM5Zjg4NjcnLCAnI2ExYTQ4MycsIDEuNSwgNC42LCAwLjM0KTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNi1waWNuaWMnKSBwYWludFBpY25pY0dyb3VuZChuZXh0VGVycmFpbiwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTYtaGFsZi1saWZlLWhvbGxvdycpIGdyYWRlVGVycmFpbkJ5SGVpZ2h0KG5leHRUZXJyYWluLCAnIzg5N2M2OCcsICcjYjlhNzg4JywgLTEuOSwgMS44LCAwLjMyKTtcbiAgICAgIGlmICgoaG9zdC5jb250cmFjdElkID09PSAnZTQtZHVzdC1mbGF0cycgfHwgaG9zdC5jb250cmFjdElkID09PSAnZTQtbG9uZy1yb2FkJyB8fCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ndXNoZXItY291bnR5JyB8fCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ib25leWFyZCcpICYmIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aCkgY2xhcmlmeU1vdG9yR3JvdW5kKG5leHRUZXJyYWluLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGgsIGZhbHNlLCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ndXNoZXItY291bnR5JyA/IDAuMzAgOiBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ib25leWFyZCcgPyAwLjcyIDogMC43OCk7XG4gICAgICBpZiAoaG9zdC5uaWdodE1vZGUpIGFwcGx5TmlnaHRUZXJyYWluUG9vbHMobmV4dFRlcnJhaW4sIGhvc3QpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xzID0gJ29mZic7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xTb3VyY2VzID0gJzAnO1xuICAgICAgfVxuICAgICAgY29uc3QgbW91bnQgPSBzZWxlY3RlZC5jb250cmFjdC5wYW5vcmFtYU1vdW50O1xuICAgICAgbmV4dFBhbm9yYW1hLm5hbWUgPSBtb3VudC5pZDtcbiAgICAgIG5leHRQYW5vcmFtYS5wb3NpdGlvbi5mcm9tQXJyYXkobW91bnQucG9zaXRpb24pO1xuICAgICAgbmV4dFBhbm9yYW1hLnJvdGF0aW9uLnNldCguLi5tb3VudC5yb3RhdGlvbik7XG4gICAgICBuZXh0UGFub3JhbWEuc2NhbGUuZnJvbUFycmF5KG1vdW50LnNjYWxlKTtcbiAgICAgIHByZXBhcmVQYW5vcmFtYShuZXh0UGFub3JhbWEpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UyLXByZXNzdXJlLWdhcmRlbicpIHByZXBhcmVQYW5vcmFtYVJvY2tzKG5leHRQYW5vcmFtYSwgJ0dhcmRlbkJhbmtTdG9uZScpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UzLWNhbnlvbi13b3JrcycpIHByZXBhcmVQYW5vcmFtYVJvY2tzKG5leHRQYW5vcmFtYSwgJ0NhbnlvbkNsaWZmU3RvbmUnLCAnQ2FueW9uQXByb25FYXJ0aCcpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxMC1hcmNoaXZlLXdvcmxkJykgcHJlcGFyZUFyY2hpdmVMaWJyYXJ5KG5leHRQYW5vcmFtYSwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJykgY2xhcmlmeUVtYmVyQmFzYWx0KG5leHRQYW5vcmFtYSwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCwgdHJ1ZSk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTMtY2FueW9uLXdvcmtzJykgY2xhcmlmeUNhbnlvbkdyb3VuZChuZXh0UGFub3JhbWEsIHRydWUpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2U0LWxvbmctcm9hZCcgJiYgc2VsZWN0ZWQuY29udHJhY3QubWFza1RydXRoKSBjbGFyaWZ5TW90b3JHcm91bmQobmV4dFBhbm9yYW1hLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGgsIHRydWUpO1xuICAgICAgaWYgKHNlbGVjdGVkLmNvbnRyYWN0LndhdGVyU3VyZmFjZT8ub3duZXIgPT09ICdydW50aW1lIERlZXB3YXRlckNsYWltVGlsZScpIHtcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNlYUFwcm9uVHJpYW5nbGVzID0gU3RyaW5nKHJvdXRlU2VhQXByb24obmV4dFRlcnJhaW4sIG5leHRQYW5vcmFtYSwgdGVycmFpbk1ldHJpY3MuYm91bmRzKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0U2tpcnQgPSBjcmVhdGVDb250aW51YXRpb24obmV4dFRlcnJhaW4sIG5leHRQYW5vcmFtYSwgaGVpZ2h0QXQsIHRlcnJhaW5NZXRyaWNzLmJvdW5kcywgaG9zdC5jb250cmFjdElkKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMTAtcml2ZXInICYmIG5leHRTa2lydCkgcGFpbnRSaXZlckJhbmtzKG5leHRTa2lydCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyAmJiBuZXh0U2tpcnQpIGNsYXJpZnlFbWJlckJhc2FsdChuZXh0U2tpcnQsIHNlbGVjdGVkLmRldGFpbFRleHR1cmVVcmwpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxMC1hcmNoaXZlLXdvcmxkJyAmJiBuZXh0U2tpcnQpIGNsYXJpZnlBcmNoaXZlVGVycmFjZXMobmV4dFNraXJ0LCBob3N0LmFyY2hpdmVSZXN0b3JhdGlvbiwgc2VsZWN0ZWQuZGV0YWlsVGV4dHVyZVVybCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTMtbW90aC1zZWFzb24nICYmIGhvc3QubmlnaHRNb2RlICYmIG5leHRTa2lydCkge1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5leHRTa2lydC5tYXRlcmlhbCBhcyBUSFJFRS5NYXRlcmlhbDtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgICAgICBjb25zdCByZW5kZXJPcmRlciA9IG5leHRTa2lydC5yZW5kZXJPcmRlcjtcbiAgICAgICAgYXBwbHlOaWdodFRlcnJhaW5Qb29scyhuZXh0U2tpcnQsIGhvc3QpO1xuICAgICAgICBuZXh0U2tpcnQucmVuZGVyT3JkZXIgPSByZW5kZXJPcmRlcjtcbiAgICAgICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7cHJvZ3JhbUtleX18bmlnaHQtdGVycmFpbi1wb29sc2A7XG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0Q2hhbm5lbFdhdGVyID0gY3JlYXRlQ2hhbm5lbFdhdGVyKGhvc3QuY29udHJhY3RJZCwgc2VsZWN0ZWQuY29udHJhY3QsIGhlaWdodEF0KTtcbiAgICAgIHRlcnJhaW4gPSBuZXh0VGVycmFpbjtcbiAgICAgIHBhbm9yYW1hID0gbmV4dFBhbm9yYW1hO1xuICAgICAgc2tpcnQgPSBuZXh0U2tpcnQ7XG4gICAgICBjaGFubmVsV2F0ZXIgPSBuZXh0Q2hhbm5lbFdhdGVyO1xuICAgICAgbG9hZGVkVGVycmFpbiA9IHVuZGVmaW5lZDtcbiAgICAgIGxvYWRlZFBhbm9yYW1hID0gdW5kZWZpbmVkO1xuICAgICAgY29uc3QgcG9pbnRlclN1cmZhY2VzOiBUSFJFRS5PYmplY3QzRFtdID0gW25leHRUZXJyYWluLCAuLi5uZXh0UG9uZHMubWFwKHBvbmQgPT4gcG9uZC5ncm91cCldO1xuICAgICAgaWYgKG5leHRDaGFubmVsV2F0ZXIpIHBvaW50ZXJTdXJmYWNlcy5wdXNoKG5leHRDaGFubmVsV2F0ZXIpO1xuICAgICAgdW5pbnN0YWxsSGVpZ2h0U291cmNlID0gaW5zdGFsbFZpc3VhbEhlaWdodFNvdXJjZShoZWlnaHRBdCwgcG9pbnRlclN1cmZhY2VzKTtcbiAgICAgIGhvc3Qub25WaXN1YWxIZWlnaHRTb3VyY2VJbnN0YWxsZWQ/LigpO1xuICAgICAgaG9zdC5zY2VuZS5hZGQobmV4dFRlcnJhaW4sIG5leHRQYW5vcmFtYSk7XG4gICAgICBpZiAobmV4dFNraXJ0KSBob3N0LnNjZW5lLmFkZChuZXh0U2tpcnQpO1xuICAgICAgcG9uZHMgPSBuZXh0UG9uZHM7XG4gICAgICBuZXh0UG9uZHMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgcG9uZCBvZiBwb25kcykgaG9zdC5zY2VuZS5hZGQocG9uZC5ncm91cCk7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3ByaW5nUG9uZHMgPSBTdHJpbmcocG9uZHMubGVuZ3RoKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTcHJpbmdQb25kV2F0ZXJSYWRpaSA9IEpTT04uc3RyaW5naWZ5KHBvbmRzLm1hcCgocG9uZCkgPT4gcG9uZC53YXRlclJhZGl1cykpO1xuICAgICAgaWYgKG5leHRDaGFubmVsV2F0ZXIpIGhvc3Quc2NlbmUuYWRkKG5leHRDaGFubmVsV2F0ZXIpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENoYW5uZWxXYXRlciA9IFN0cmluZyhcbiAgICAgICAgbmV4dENoYW5uZWxXYXRlcj8uY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQubmFtZS5pbmNsdWRlcygnLWNoYW5uZWwnKSkubGVuZ3RoID8/IDAsXG4gICAgICApO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEZvcmRXYXRlciA9IFN0cmluZyhcbiAgICAgICAgbmV4dENoYW5uZWxXYXRlcj8uY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQubmFtZS5lbmRzV2l0aCgnLmZvcmRzJykpLmxlbmd0aCA/PyAwLFxuICAgICAgKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RDaGFubmVsV2F0ZXJIYWxmV2lkdGhzID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG5leHRDaGFubmVsV2F0ZXI/LmNoaWxkcmVuXG4gICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+IGNoaWxkLm5hbWUuaW5jbHVkZXMoJy1jaGFubmVsJykpXG4gICAgICAgICAgLm1hcCgoY2hpbGQpID0+IGNoaWxkLnVzZXJEYXRhLnZpc3VhbEhhbGZXaWR0aCkgPz8gW10sXG4gICAgICApO1xuICAgICAgaGlkZGVuUmVsaWVmID0gaGlkZVBhaW50ZWRHcm91bmQoaG9zdCk7XG4gICAgICAvLyBBIGRlY29yYXRpb24gbXVzdCBuZXZlciBjb3N0IHRoZSBtYXAgaXRzIHNjdWxwdDogaWYgdGhlIHdhdGVyIGZhaWxzIHRvXG4gICAgICAvLyBidWlsZCwgdGhlIHRlcnJhaW4gc3RheXMgbW91bnRlZCBhbmQgdGhlIGZhaWx1cmUgaXMgcHVibGlzaGVkLCBub3Qgc2lsZW50LlxuICAgICAgdHJ5IHtcbiAgICAgICAgc2N1bHB0V2F0ZXIgPSBtb3VudFNjdWxwdFdhdGVyKGhvc3QsIGhlaWdodEF0LCB0ZXJyYWluTWV0cmljcy5ib3VuZHMpO1xuICAgICAgICBpZiAoc2N1bHB0V2F0ZXIpIHBvaW50ZXJTdXJmYWNlcy5wdXNoKHNjdWxwdFdhdGVyLm1lc2gpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nO1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXIgPSBgZmFpbGVkOiR7bWVzc2FnZX1gO1xuICAgICAgICByZXBvcnRSZW5kZXJEZW1vdGlvbihob3N0LmNhbnZhcywgYHNjdWxwdC13YXRlci1mYWlsZWQ6JHttZXNzYWdlfWApO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgc3VuTW90ZXMgPSBtb3VudFN1bk1vdGVzKGhvc3QsIHRlcnJhaW5NZXRyaWNzLmJvdW5kcyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TW90ZXMgPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNyb3NzaW5nQnJlYXRoID0gbW91bnRDcm9zc2luZ0JyZWF0aChob3N0LCBzY3VscHRXYXRlcj8ubWVzaC5wb3NpdGlvbi55KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgfVxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFRlcnJhaW5Mb2FkU3RhdGUgPSAnbW91bnRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFMb2FkU3RhdGUgPSAnbW91bnRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGlkZGVuUmVsaWVmID0gU3RyaW5nKGhpZGRlblJlbGllZi5sZW5ndGgpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhpZGRlbkdyb3VuZExheWVycyA9IGhpZGRlblJlbGllZlxuICAgICAgICAubWFwKCh7IG9iamVjdCB9KSA9PiBvYmplY3QubmFtZSB8fCBTdHJpbmcob2JqZWN0LnVzZXJEYXRhLmFzc2V0U2xvdCkpXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgLmpvaW4oJ3wnKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RDb250aW51YXRpb24gPSBuZXh0U2tpcnQgPyAnc2N1bHB0LWVkZ2UtY29udGludWF0aW9uJyA6ICdwYW5vcmFtYS1vd25lZC1jb250aW51YXRpb24nO1xuICAgICAgLy8gVEhFIEFUTU9TUEhFUklDUyBTSElGVCdzIHBsYWluLWJvb3QgZG9vcjogdGhlIGFwcm9uIGlzIHRoZSBvbmx5IGhvcml6b24gc3VyZmFjZSBhIHJ1blxuICAgICAgLy8gZnJhbWUgY2FuIHJlYWNoICh0aGUgcGFub3JhbWEgbWVhc3VyZWQgMCUgYXQgZXZlcnkgaGVybyBwb3NpdGlvbiwgYm90aCB2aWV3cG9ydHMpLCBzb1xuICAgICAgLy8gd2hldGhlciBpdCBpcyBwYWludGVkIGhhcyB0byBiZSByZWFkYWJsZSB3aXRob3V0ID9kZWJ1Zy5cbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIb3Jpem9uQXByb24gPSBTdHJpbmcobmV4dFNraXJ0Py51c2VyRGF0YS5ob3Jpem9uQXByb24gPz8gJ25vbmUnKTtcbiAgICAgIC8vIFRIRSBGQVIgR1JPVU5EIFNISUZUJ3MgaW5zdHJ1bWVudCAoc3JjL3dvcmxkL0hvcml6b25BcHJvbi50cykuIENvbG91ciBvbmx5LCBsYXN0IHRoaW5nXG4gICAgICAvLyBtb3VudGVkIHNvIG5vdGhpbmcgZG93bnN0cmVhbSByZS10b3VjaGVzIHRoZSBtYXRlcmlhbHMgaXQgZmxhdHRlbnMuIFRoZSBwYWludGVkLW1hdGVyaWFsXG4gICAgICAvLyBjb3VudHMgYXJlIHB1Ymxpc2hlZCBiZWNhdXNlIHRoZXkgYXJlIHRoZSBwcm9iZSdzIHBvc2l0aXZlIGNvbnRyb2w6IGEgY2Vuc3VzIHRoYXQgcmVhZHNcbiAgICAgIC8vIDAuMDAlIHBhbm9yYW1hIG1lYW5zIFwib2ZmIGNhbWVyYVwiIG9ubHkgaWYgdGhlIHJpbmcgd2FzIHByb3ZhYmx5IHJlcGFpbnRlZC5cbiAgICAgIGNvbnN0IHByb2JlTW9kZSA9IGZhckdyb3VuZFByb2JlTW9kZSgpO1xuICAgICAgaWYgKHByb2JlTW9kZSA9PT0gJ29mZicpIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RGYXJHcm91bmRQcm9iZSA9ICdvZmYnO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBhaW50ZWQgPSB7XG4gICAgICAgICAgcGFub3JhbWE6IHBhaW50RmFyR3JvdW5kUHJvYmUobmV4dFBhbm9yYW1hLCAncGFub3JhbWEnKSxcbiAgICAgICAgICBhcHJvbjogcGFpbnRGYXJHcm91bmRQcm9iZShuZXh0U2tpcnQsICdhcHJvbicpLFxuICAgICAgICAgIHRlcnJhaW46IHBhaW50RmFyR3JvdW5kUHJvYmUobmV4dFRlcnJhaW4sICd0ZXJyYWluJyksXG4gICAgICAgIH07XG4gICAgICAgIC8vIHNvbG86IG5vdGhpbmcgbGVmdCB0aGF0IGNvdWxkIG9jY2x1ZGUgdGhlIHJpbmcuIElmIGl0IGlzIGluIHRoZSBmcnVzdHVtLCBpdCBJUyB0aGUgZnJhbWUuXG4gICAgICAgIGlmIChwcm9iZU1vZGUgPT09ICdzb2xvJykge1xuICAgICAgICAgIG5leHRUZXJyYWluLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICBpZiAobmV4dFNraXJ0KSBuZXh0U2tpcnQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RGYXJHcm91bmRQcm9iZSA9XG4gICAgICAgICAgYCR7cHJvYmVNb2RlfTpwYW5vcmFtYT0ke3BhaW50ZWQucGFub3JhbWF9LGFwcm9uPSR7cGFpbnRlZC5hcHJvbn0sdGVycmFpbj0ke3BhaW50ZWQudGVycmFpbn1gO1xuICAgICAgfVxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hRnJhbWluZyA9ICd3b3JsZC1wcm9qZWN0ZWQtaG9yaXpvbic7XG4gICAgICAvLyBLZWVwIHRoZSBvcmlnaW5hbCBwcm9iZSB2YWx1ZXMgdW50aWwgdGhlIHJlZ2lzdHJ5IGNvbnRyYWN0IGlzIG1pZ3JhdGVkLlxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNraXJ0QmxlbmQgPSAnb3BhcXVlLXNjdWxwdC1lZGdlJztcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RQYW5vcmFtYUZvZyA9ICdleGNsdWRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFEZXB0aCA9ICdzY3JlZW4taG9yaXpvbi1iYWNrZHJvcCc7XG4gICAgICBjb25zdCBtb3VudHMgPSBsYW5kbWFya01vdW50c0ZvcihzZWxlY3RlZC5jb250cmFjdCwgaG9zdC5jb250cmFjdElkKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0V4cGVjdGVkID0gU3RyaW5nKG1vdW50cy5sZW5ndGgpO1xuICAgICAgY29uc3QgY2xvc3VyZUNlbnN1cyA9IG5ldyBNYXA8c3RyaW5nLCBDbG9zdXJlQ2Vuc3VzPigpO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBuZXh0TGFuZG1hcmtzID0gbmV3IFRIUkVFLkdyb3VwKCk7XG4gICAgICBuZXh0TGFuZG1hcmtzLm5hbWUgPSAnVGVycmFpbjNkTGFuZG1hcmtzJztcbiAgICAgIG5leHRMYW5kbWFya3MudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgICBjb25zdCBsb2FkTW91bnQgPSBhc3luYyAobW91bnQ6IExhbmRtYXJrTW91bnQpOiBQcm9taXNlPFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gbGFuZG1hcmtBc3NldEtleShtb3VudC5hc3NldCEpO1xuICAgICAgICAgIGNvbnN0IHJlc29sdmVVcmwgPSBMQU5ETUFSS19BU1NFVFNba2V5XTtcbiAgICAgICAgICBpZiAoIXJlc29sdmVVcmwpIHtcbiAgICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goYCR7bW91bnQuaWR9OiBhc3NldCB1bmF2YWlsYWJsZWApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRWFjaCBwbGFjZW1lbnQgb3ducyBpdHMgc2NlbmUgYW5kIHBhaW50OyBjYWNoZWQgT2JqZWN0M0RzIHJlcGFyZW50IGVhcmxpZXIgbW91bnRzLlxuICAgICAgICAgIGNvbnN0IG1vZGVsID0gKGF3YWl0IGxvYWRlci5sb2FkQXN5bmMoYXdhaXQgcmVzb2x2ZVVybCgpKSkuc2NlbmU7XG4gICAgICAgICAgbW9kZWwubmFtZSA9IG1vdW50LmlkO1xuICAgICAgICAgIG1vZGVsLnVzZXJEYXRhLmxhbmRtYXJrQXNzZXQgPSBrZXk7XG4gICAgICAgICAgbW9kZWwudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgICAgICAgbW9kZWwucG9zaXRpb24uc2V0KG1vdW50LnBvc2l0aW9uWzBdLCBoZWlnaHRBdChtb3VudC5wb3NpdGlvblswXSwgbW91bnQucG9zaXRpb25bMl0pICsgbW91bnQucG9zaXRpb25bMV0sIG1vdW50LnBvc2l0aW9uWzJdKTtcbiAgICAgICAgICBtb2RlbC5yb3RhdGlvbi5zZXQoLi4ubW91bnQucm90YXRpb24pO1xuICAgICAgICAgIG1vZGVsLnNjYWxlLmZyb21BcnJheShtb3VudC5zY2FsZSk7XG4gICAgICAgICAgaW5zcGVjdChtb2RlbCwgZmFsc2UpO1xuICAgICAgICAgIC8vIEYtQVNUUkEtOTogdmVyaWZpZWQgYmFja2ZhY2UgY3VsbGluZyBydW5zIG9uIEVWRVJZIG1vdW50ZWQgYm9keSwgbmlnaHQgc2hpZnQgaW5jbHVkZWQg4oCUXG4gICAgICAgICAgLy8gaXQgaXMgYSBnZW9tZXRyeSB2ZXJkaWN0LCBub3QgYSBwYWludCBvbmUsIGFuZCBpdCBjaGFuZ2VzIG5vIGxpZ2h0aW5nLlxuICAgICAgICAgIGNsb3N1cmVDZW5zdXMuc2V0KG1vdW50LmlkLCBjdWxsVmVyaWZpZWRDbG9zZWRNZXNoZXMobW9kZWwsIG1vdW50LmlkKSk7XG4gICAgICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCAhPT0gJ2UxLW5pZ2h0LXNoaWZ0Jykge1xuICAgICAgICAgICAgY29uc3QgbGl2ZSA9IExJVkVfU1BSSU5HX1BPTkRfQ09OVFJBQ1RTLmhhcyhob3N0LmNvbnRyYWN0SWQpICYmIG1vdW50LmlkID09PSAnaXNvbGF0ZWRfc3ByaW5nJztcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyYWN0SW50ZW5zaXR5ID0gTEFORE1BUktfRU1JU1NJVkVbaG9zdC5jb250cmFjdElkXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaW50ID0gbGl2ZVxuICAgICAgICAgICAgICA/IHsgaW50ZW5zaXR5OiBEUllfR1VMQ0hfU1BSSU5HX0VNSVNTSVZFLCB0aW50OiBERUZBVUxUX0xBTkRNQVJLX1BBSU5ULnRpbnQgfVxuICAgICAgICAgICAgICA6IChMQU5ETUFSS19QQUlOVFtob3N0LmNvbnRyYWN0SWRdPy5bbW91bnQuaWRdXG4gICAgICAgICAgICAgICAgPz8gKGNvbnRyYWN0SW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgPyB7IGludGVuc2l0eTogY29udHJhY3RJbnRlbnNpdHksIHRpbnQ6IERFRkFVTFRfTEFORE1BUktfUEFJTlQudGludCB9IDogREVGQVVMVF9MQU5ETUFSS19QQUlOVCkpO1xuICAgICAgICAgICAga2VlcExhbmRtYXJrUGFpbnRSZWFkYWJsZShtb2RlbCwgcGFpbnQsIGhvc3QuY29udHJhY3RJZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb3VudC5pZCA9PT0gJ2xhbXB3b3Jrc195YXJkJykge1xuICAgICAgICAgICAgLy8gTGlnaHQtcmVhY3RpdmUgcGFpbnQsIG5vdCB3aG9sZS1ib2R5IGVtaXNzaW9uLiBUaGUgY29sZCBzZXZlblxuICAgICAgICAgICAgLy8gZ2FtZXBsYXkgbGFudGVybnMgcmV0YWluIHRoZWlyIHJlYWwgd3JlY2tlZC9yZWxpdCBzdGF0ZXMuXG4gICAgICAgICAgICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgICAgICAgICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHtcbiAgICAgICAgICAgICAgICBtZXNoLm1hdGVyaWFsLmNvbG9yLm11bHRpcGx5U2NhbGFyKDEuNjUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFwcGx5TmlnaHRUZXJyYWluUG9vbHMobW9kZWwsIGhvc3QsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEtYmFyb24nICYmIEJBUk9OX1NXQVlfQU1QTElUVURFW21vdW50LmlkXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpbnN0YWxsQmFubmVyU3dheShtb2RlbCwgQkFST05fU1dBWV9BTVBMSVRVREVbbW91bnQuaWRdISk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRyZXNzTGFuZG1hcmsobW9kZWwsIGhvc3QuY29udHJhY3RJZCwgbW91bnQuaWQpO1xuICAgICAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMTAtcml2ZXInKSBwYWludFJpdmVyU3RvbmVzKG1vZGVsKTtcbiAgICAgICAgICBpZiAoaG9zdC5hcmNoaXZlUmVzdG9yYXRpb24pIGluc3RhbGxBcmNoaXZlUmVzdG9yYXRpb24obW9kZWwsIGhvc3QuYXJjaGl2ZVJlc3RvcmF0aW9uKTtcbiAgICAgICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnKSBsaWdodEFyY2hpdmVGYWNhZGUobW9kZWwsIGhvc3QuYXJjaGl2ZVJlc3RvcmF0aW9uKTtcbiAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goYCR7bW91bnQuaWR9OiBhc3NldCBpbnZhbGlkYCk7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHZvaWQgUHJvbWlzZS5hbGwobW91bnRzLm1hcChsb2FkTW91bnQpKS50aGVuKChtb2RlbHMpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBtb2RlbCBvZiBtb2RlbHMpIGlmIChtb2RlbCkgbmV4dExhbmRtYXJrcy5hZGQobW9kZWwpO1xuICAgICAgICBpZiAoZGlzcG9zZWQpIHtcbiAgICAgICAgICBkaXNwb3NlT2JqZWN0M0QobmV4dExhbmRtYXJrcyk7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrTG9hZFN0YXRlID0gJ2Rpc3Bvc2VkJztcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsYW5kbWFya1dhbGtTdXJmYWNlcyA9IGNyZWF0ZUxhbmRtYXJrV2Fsa1N1cmZhY2VzKGhlaWdodEF0LFxuICAgICAgICAgICAgbmV4dExhbmRtYXJrcy5jaGlsZHJlbi5tYXAobW9kZWwgPT4gKHsgbW9kZWwsIG1vdW50OiBtb3VudHMuZmluZChtb3VudCA9PiBtb3VudC5pZCA9PT0gbW9kZWwubmFtZSkhIH0pKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgZGlzcG9zZU9iamVjdDNEKG5leHRMYW5kbWFya3MpO1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0xvYWRTdGF0ZSA9ICdmYWlsZWQnO1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0RpYWdub3N0aWNzID0gYGludmFsaWQgbGFuZG1hcmsgd2FsayBzdXJmYWNlOiAke1N0cmluZyhlcnJvcil9YDtcbiAgICAgICAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAnZmFpbGVkJywgJ3BhaW50ZWQnLCB0ZXJyYWluTWV0cmljcywgdW5kZWZpbmVkLCBwYW5vcmFtYU1ldHJpY3MsICdsYW5kbWFyay13YWxrLXN1cmZhY2VzLWludmFsaWQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhbmRtYXJrV2Fsa1N1cmZhY2VzKSB7XG4gICAgICAgICAgdW5pbnN0YWxsSGVpZ2h0U291cmNlPy4oKTtcbiAgICAgICAgICB1bmluc3RhbGxIZWlnaHRTb3VyY2UgPSBpbnN0YWxsVmlzdWFsSGVpZ2h0U291cmNlKGxhbmRtYXJrV2Fsa1N1cmZhY2VzLmhlaWdodEF0LFxuICAgICAgICAgICAgWy4uLnBvaW50ZXJTdXJmYWNlcywgLi4ubGFuZG1hcmtXYWxrU3VyZmFjZXMucG9pbnRlcnNdKTtcbiAgICAgICAgICBob3N0Lm9uVmlzdWFsSGVpZ2h0U291cmNlSW5zdGFsbGVkPy4oKTtcbiAgICAgICAgfVxuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90V2Fsa1N1cmZhY2VzID0gU3RyaW5nKGxhbmRtYXJrV2Fsa1N1cmZhY2VzPy5wb2ludGVycy5sZW5ndGggPz8gMCk7XG4gICAgICAgIGxhbmRtYXJrcyA9IG5leHRMYW5kbWFya3M7XG4gICAgICAgIGhvc3Quc2NlbmUuYWRkKG5leHRMYW5kbWFya3MpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxhbmRtYXJrQ29udGFjdHMgPSBtb3VudExhbmRtYXJrQ29udGFjdHMoXG4gICAgICAgICAgICBob3N0LFxuICAgICAgICAgICAgbmV4dExhbmRtYXJrcy5jaGlsZHJlbi5tYXAoKG1vZGVsKSA9PiAoeyBpZDogbW9kZWwubmFtZSwgbW9kZWwgfSkpLFxuICAgICAgICAgICAgaGVpZ2h0QXQsXG4gICAgICAgICAgICBzY3VscHRXYXRlcj8ubWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICAgdGVycmFpbk1ldHJpY3MuYm91bmRzLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENvbnRhY3RTaGFkb3dzID0gYGZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB3YXRlckNvbGxhcnMgPSBtb3VudFdhdGVyQ29sbGFycyhcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSksXG4gICAgICAgICAgICBzY3VscHRXYXRlcj8ubWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhdGVyQ29sbGFycyA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3BhblNoYWRvdyA9IG1vdW50U3BhblNoYWRvdyhcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSksXG4gICAgICAgICAgICBzY3VscHRXYXRlcj8ubWVzaC5wb3NpdGlvbi55LFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNwYW5TaGFkb3cgPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJ1c2hFbWJlcnMgPSBtb3VudFJ1c2hFbWJlcnMoXG4gICAgICAgICAgICBob3N0LFxuICAgICAgICAgICAgbmV4dExhbmRtYXJrcy5jaGlsZHJlbi5tYXAoKG1vZGVsKSA9PiAoeyBpZDogbW9kZWwubmFtZSwgbW9kZWwgfSkpLFxuICAgICAgICAgICAgaGVpZ2h0QXQsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UnVzaEVtYmVycyA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RlYW1QbHVtZSA9IG1vdW50U3RlYW1QbHVtZShob3N0LCBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc3RlYW1XaXNwcyA9IG1vdW50U3RlYW1XaXNwcyhob3N0LCBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbVdpc3BzID0gYGZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBoYXVsU3RlYW0gPSBtb3VudEhhdWxTdGVhbShcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBoZWlnaHRBdCxcbiAgICAgICAgICAgIG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHsgaWQ6IG1vZGVsLm5hbWUsIG1vZGVsIH0pKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW0gPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgICAgfVxuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnbW91bnRlZCc7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0VtaXNzaXZlID0gU3RyaW5nKExBTkRNQVJLX0VNSVNTSVZFW2hvc3QuY29udHJhY3RJZF0gPz8gTEFORE1BUktfRU1JU1NJVkVfREVGQVVMVCk7XG4gICAgICAgIC8vIEYtQVNUUkEtOSBjZW5zdXM6IHBlci1tb3VudCBjbG9zZWQvb3BlbiBtZXNoIGNvdW50cyBhbmQgd2hhdCB0aGUgdmVyZGljdCBkaWQgdG8gdGhlXG4gICAgICAgIC8vIG1hdGVyaWFsIHNpZGUuIFB1Ymxpc2hlZCBNRUFTVVJFRCwgZm9yIHRoZSBzYW1lIHJlYXNvbiBlbWlzc2l2ZUludGVuc2l0eSBpcyAoRi1CSE0tMSkg4oCUXG4gICAgICAgIC8vIGEgdGFibGUgbG9va3VwIHdvdWxkIGtlZXAgcmVwb3J0aW5nIHRoZSBpbnRlbnQgYWZ0ZXIgYSBsYXRlciBwYXNzIG92ZXJ3cm90ZSB0aGUgcmVuZGVyLlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgICAgICAgICBjb25zdCByb3dzID0gbmV4dExhbmRtYXJrcy5jaGlsZHJlbi5mbGF0TWFwKChtb2RlbCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gY2xvc3VyZUNlbnN1cy5nZXQobW9kZWwubmFtZSk7XG4gICAgICAgICAgICBpZiAoIXJvdykgcmV0dXJuIFtdO1xuICAgICAgICAgICAgYm94LnNldEZyb21PYmplY3QobW9kZWwpO1xuICAgICAgICAgICAgLy8gVGhlIGJvZHkncyBvd24gdmVydGljYWwgZXh0ZW50LCBzbyBhIHByb2JlIGNhbiBiZSBhaW1lZCBhdCB0aGUgV0FMTCByYXRoZXIgdGhhbiBhdFxuICAgICAgICAgICAgLy8gdGhlIGdyb3VuZCBpbiBmcm9udCBvZiBhIGxhdHRpY2UgaGVhZGZyYW1lICh0aGUgcmVmZXJlbmNlIHJpZydzIGZpcnN0IGZhbHNlIHJlYWRpbmcpLlxuICAgICAgICAgICAgcmV0dXJuIFt7IC4uLnJvdywgYmFzZVk6ICtib3gubWluLnkudG9GaXhlZCgzKSwgdG9wWTogK2JveC5tYXgueS50b0ZpeGVkKDMpIH1dO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IHRvdGFsID0gcm93cy5yZWR1Y2UoKHN1bTogeyBtZXNoZXM6IG51bWJlcjsgY2xvc2VkOiBudW1iZXI7IG9wZW46IG51bWJlcjsgY3VsbGVkOiBudW1iZXI7IGRvdWJsZVNpZGVkOiBudW1iZXIgfSwgcm93KSA9PiAoe1xuICAgICAgICAgICAgbWVzaGVzOiBzdW0ubWVzaGVzICsgcm93Lm1lc2hlcyxcbiAgICAgICAgICAgIGNsb3NlZDogc3VtLmNsb3NlZCArIHJvdy5jbG9zZWQsXG4gICAgICAgICAgICBvcGVuOiBzdW0ub3BlbiArIHJvdy5vcGVuLFxuICAgICAgICAgICAgY3VsbGVkOiBzdW0uY3VsbGVkICsgcm93LmN1bGxlZCxcbiAgICAgICAgICAgIGRvdWJsZVNpZGVkOiBzdW0uZG91YmxlU2lkZWQgKyByb3cuZG91YmxlU2lkZWQsXG4gICAgICAgICAgfSksIHsgbWVzaGVzOiAwLCBjbG9zZWQ6IDAsIG9wZW46IDAsIGN1bGxlZDogMCwgZG91YmxlU2lkZWQ6IDAgfSk7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrU2lkZXMgPSBKU09OLnN0cmluZ2lmeSh7IHRvdGFsLCBtb3VudHM6IHJvd3MgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrcyA9IFN0cmluZyhuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLmxlbmd0aCk7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya1NraXBwZWQgPSBTdHJpbmcoZGlhZ25vc3RpY3MubGVuZ3RoKTtcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5qb2luKCc7ICcpO1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtNb3VudHMgPSBKU09OLnN0cmluZ2lmeShuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7XG4gICAgICAgICAgaWQ6IG1vZGVsLm5hbWUsXG4gICAgICAgICAgeDogbW9kZWwucG9zaXRpb24ueCxcbiAgICAgICAgICB5OiBtb2RlbC5wb3NpdGlvbi55LFxuICAgICAgICAgIHo6IG1vZGVsLnBvc2l0aW9uLnosXG4gICAgICAgIH0pKSk7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya01hdGVyaWFscyA9IEpTT04uc3RyaW5naWZ5KG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWF0ZXJpYWw+KCk7XG4gICAgICAgICAgbW9kZWwudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g7XG4gICAgICAgICAgICBpZiAobWVzaC5pc01lc2gpIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSA/IG1lc2gubWF0ZXJpYWwgOiBbbWVzaC5tYXRlcmlhbF0pIG1hdGVyaWFscy5hZGQobWF0ZXJpYWwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIGVtaXNzaXZlSW50ZW5zaXR5IGlzIFBVQkxJU0hFRCwgbm90IGluZmVycmVkIGZyb20gdGhlIHRhYmxlLCBiZWNhdXNlIHRoZSBwYWludCBpc1xuICAgICAgICAgIC8vIGFwcGxpZWQgYnkgdHJhdmVyc2FsIGFmdGVyIHRoZSBib2R5IGxvYWRzIGFuZCBhIGxhdGVyIHBhc3MgY2FuIHNpbGVudGx5IG92ZXJ3cml0ZSBpdCDigJRcbiAgICAgICAgICAvLyB3aGljaCBpcyBleGFjdGx5IHRoZSBkZWZlY3QgRi1CSE0tMSBmb3VuZCBoZXJlICh0d28ga2VlcExhbmRtYXJrUGFpbnRSZWFkYWJsZSBjYWxscywgdGhlXG4gICAgICAgICAgLy8gc2Vjb25kIG9uZSByZXNldHRpbmcgZXZlcnkgcGVyLWNvbnRyYWN0IGludGVuc2l0eSBiYWNrIHRvIHRoZSBkZWZhdWx0KS4gQSB0YWJsZSBsb29rdXBcbiAgICAgICAgICAvLyBpbiB0aGUgZGF0YXNldCB3b3VsZCBoYXZlIGtlcHQgcmVwb3J0aW5nIHRoZSBpbnRlbmRlZCBudW1iZXIgd2hpbGUgdGhlIG1hcCByZW5kZXJlZCB0aGVcbiAgICAgICAgICAvLyBvdGhlciBvbmUuXG4gICAgICAgICAgY29uc3Qgc3RhbmRhcmQgPSBbLi4ubWF0ZXJpYWxzXS5maWx0ZXIoKG1hdGVyaWFsKTogbWF0ZXJpYWwgaXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwgPT5cbiAgICAgICAgICAgIChtYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCkuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCk7XG4gICAgICAgICAgY29uc3QgaW50ZW5zaXRpZXMgPSBzdGFuZGFyZC5tYXAoKG1hdGVyaWFsKSA9PiArbWF0ZXJpYWwuZW1pc3NpdmVJbnRlbnNpdHkudG9GaXhlZCgzKSk7XG4gICAgICAgICAgY29uc3QgYXV0aG9yZWQgPSBzdGFuZGFyZFxuICAgICAgICAgICAgLm1hcCgobWF0ZXJpYWwpID0+IG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrQXV0aG9yZWRFbWlzc2l2ZSBhcyBudW1iZXIgfCB1bmRlZmluZWQpXG4gICAgICAgICAgICAuZmlsdGVyKCh2YWx1ZSk6IHZhbHVlIGlzIG51bWJlciA9PiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IG1vZGVsLm5hbWUsXG4gICAgICAgICAgICB0b3RhbDogbWF0ZXJpYWxzLnNpemUsXG4gICAgICAgICAgICB0cmFuc3BhcmVudDogWy4uLm1hdGVyaWFsc10uZmlsdGVyKChtYXRlcmlhbCkgPT4gbWF0ZXJpYWwudHJhbnNwYXJlbnQpLmxlbmd0aCxcbiAgICAgICAgICAgIGRlcHRoV3JpdGVEaXNhYmxlZDogWy4uLm1hdGVyaWFsc10uZmlsdGVyKChtYXRlcmlhbCkgPT4gIW1hdGVyaWFsLmRlcHRoV3JpdGUpLmxlbmd0aCxcbiAgICAgICAgICAgIGVtaXNzaXZlSW50ZW5zaXR5OiBpbnRlbnNpdGllcy5sZW5ndGggPyBbTWF0aC5taW4oLi4uaW50ZW5zaXRpZXMpLCBNYXRoLm1heCguLi5pbnRlbnNpdGllcyldIDogW10sXG4gICAgICAgICAgICBhdXRob3JlZEVtaXNzaXZlOiBhdXRob3JlZC5sZW5ndGggPyBbTWF0aC5taW4oLi4uYXV0aG9yZWQpLCBNYXRoLm1heCguLi5hdXRob3JlZCldIDogW10sXG4gICAgICAgICAgICBmcm9udFNpZGVkOiBbLi4ubWF0ZXJpYWxzXS5maWx0ZXIoKG1hdGVyaWFsKSA9PiBtYXRlcmlhbC5zaWRlID09PSBUSFJFRS5Gcm9udFNpZGUpLmxlbmd0aCxcbiAgICAgICAgICAgIGRvdWJsZVNpZGVkOiBbLi4ubWF0ZXJpYWxzXS5maWx0ZXIoKG1hdGVyaWFsKSA9PiBtYXRlcmlhbC5zaWRlID09PSBUSFJFRS5Eb3VibGVTaWRlKS5sZW5ndGgsXG4gICAgICAgICAgICByb3VnaG5lc3M6IHN0YW5kYXJkLmxlbmd0aCA/ICtNYXRoLm1pbiguLi5zdGFuZGFyZC5tYXAoKG1hdGVyaWFsKSA9PiBtYXRlcmlhbC5yb3VnaG5lc3MpKS50b0ZpeGVkKDMpIDogbnVsbCxcbiAgICAgICAgICAgIG1ldGFsbmVzczogc3RhbmRhcmQubGVuZ3RoID8gK01hdGgubWF4KC4uLnN0YW5kYXJkLm1hcCgobWF0ZXJpYWwpID0+IG1hdGVyaWFsLm1ldGFsbmVzcykpLnRvRml4ZWQoMykgOiBudWxsLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICAgICAgcHVibGlzaChob3N0LmNhbnZhcywgJ3JlYWR5JywgJ2dsYicsIHRlcnJhaW5NZXRyaWNzLCBuZXh0UGFub3JhbWEsIHBhbm9yYW1hTWV0cmljcyk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZGlzcG9zZU9iamVjdDNEKG5leHRUZXJyYWluKTtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChuZXh0UGFub3JhbWEpO1xuICAgICAgZm9yIChjb25zdCBwb25kIG9mIG5leHRQb25kcykgcG9uZC5kaXNwb3NlKCk7XG4gICAgICBuZXh0UG9uZHMgPSBbXTtcbiAgICAgIGxvYWRlZFRlcnJhaW4gPSB1bmRlZmluZWQ7XG4gICAgICBsb2FkZWRQYW5vcmFtYSA9IHVuZGVmaW5lZDtcbiAgICAgIGlmICghZGlzcG9zZWQpIHB1Ymxpc2goaG9zdC5jYW52YXMsICdmYWlsZWQnLCAncGFpbnRlZCcsIHRlcnJhaW5NZXRyaWNzLCB1bmRlZmluZWQsIHBhbm9yYW1hTWV0cmljcywgYHBpbG90LWluc3RhbGwtZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YCk7XG4gICAgfVxuICB9O1xuICBjb25zdCByZWNlaXZlID0gKGtpbmQ6ICd0ZXJyYWluJyB8ICdwYW5vcmFtYScsIG1vZGVsOiBUSFJFRS5PYmplY3QzRCkgPT4ge1xuICAgIGlmIChkaXNwb3NlZCB8fCBsb2FkRmFpbGVkKSB7XG4gICAgICBkaXNwb3NlT2JqZWN0M0QobW9kZWwpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldFtraW5kID09PSAndGVycmFpbicgPyAndGVycmFpbjNkUGlsb3RUZXJyYWluTG9hZFN0YXRlJyA6ICd0ZXJyYWluM2RQaWxvdFBhbm9yYW1hTG9hZFN0YXRlJ10gPSAnZGlzcG9zZWQnO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoa2luZCA9PT0gJ3RlcnJhaW4nKSBsb2FkZWRUZXJyYWluID0gbW9kZWw7XG4gICAgZWxzZSBsb2FkZWRQYW5vcmFtYSA9IG1vZGVsO1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXRba2luZCA9PT0gJ3RlcnJhaW4nID8gJ3RlcnJhaW4zZFBpbG90VGVycmFpbkxvYWRTdGF0ZScgOiAndGVycmFpbjNkUGlsb3RQYW5vcmFtYUxvYWRTdGF0ZSddID0gJ2xvYWRlZCc7XG4gICAgaW5zdGFsbExvYWRlZCgpO1xuICB9O1xuICB2b2lkIGxvYWRlci5sb2FkQXN5bmMoc2VsZWN0ZWQudGVycmFpblVybCkudGhlbigoZ2x0ZikgPT4gcmVjZWl2ZSgndGVycmFpbicsIGdsdGYuc2NlbmUpLCBmYWlsTG9hZCk7XG4gIHZvaWQgbG9hZGVyLmxvYWRBc3luYyhzZWxlY3RlZC5wYW5vcmFtYVVybCkudGhlbigoZ2x0ZikgPT4gcmVjZWl2ZSgncGFub3JhbWEnLCBnbHRmLnNjZW5lKSwgZmFpbExvYWQpO1xuXG4gIHJldHVybiAoKSA9PiB7XG4gICAgZGlzcG9zZWQgPSB0cnVlO1xuICAgIHJlc3RvcmVSaXZlclBhaW50KCk7XG4gICAgaG9zdC5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0bG9zdCcsIG9uQ29udGV4dExvc3QpO1xuICAgIGRpc3Bvc2VMb2FkZWQoKTtcbiAgICB1bmluc3RhbGxIZWlnaHRTb3VyY2U/LigpO1xuICAgIHVuaW5zdGFsbEhlaWdodFNvdXJjZSA9IHVuZGVmaW5lZDtcbiAgICBsYW5kbWFya1dhbGtTdXJmYWNlcz8uZGlzcG9zZSgpO1xuICAgIGxhbmRtYXJrV2Fsa1N1cmZhY2VzID0gbnVsbDtcbiAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhbGtTdXJmYWNlcztcbiAgICBmb3IgKGNvbnN0IHsgb2JqZWN0LCB2aXNpYmxlIH0gb2YgaGlkZGVuUmVsaWVmKSBvYmplY3QudmlzaWJsZSA9IHZpc2libGU7XG4gICAgaGlkZGVuUmVsaWVmID0gW107XG4gICAgaWYgKHNraXJ0KSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShza2lydCk7XG4gICAgICBkaXNwb3NlT2JqZWN0M0Qoc2tpcnQpO1xuICAgICAgc2tpcnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChzY3VscHRXYXRlcikge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUoc2N1bHB0V2F0ZXIubWVzaCk7XG4gICAgICBzY3VscHRXYXRlci5kaXNwb3NlKCk7XG4gICAgICBzY3VscHRXYXRlciA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2VhQXByb25UcmlhbmdsZXM7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTY3VscHRXYXRlckhhbGZXaWR0aDtcbiAgICB9XG4gICAgaWYgKHJ1c2hFbWJlcnMpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHJ1c2hFbWJlcnMucG9pbnRzKTtcbiAgICAgIHJ1c2hFbWJlcnMuZGlzcG9zZSgpO1xuICAgICAgcnVzaEVtYmVycyA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UnVzaEVtYmVycztcbiAgICB9XG4gICAgaWYgKHN1bk1vdGVzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShzdW5Nb3Rlcy5wb2ludHMpO1xuICAgICAgc3VuTW90ZXMuZGlzcG9zZSgpO1xuICAgICAgc3VuTW90ZXMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdE1vdGVzO1xuICAgIH1cbiAgICBpZiAoc3RlYW1QbHVtZSkge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUoc3RlYW1QbHVtZS5wb2ludHMpO1xuICAgICAgc3RlYW1QbHVtZS5kaXNwb3NlKCk7XG4gICAgICBzdGVhbVBsdW1lID0gdW5kZWZpbmVkO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbTtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW1BbmNob3JzO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHdpc3BzIG9mIHN0ZWFtV2lzcHMpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHdpc3BzLnBvaW50cyk7XG4gICAgICB3aXNwcy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmIChzdGVhbVdpc3BzLmxlbmd0aCkge1xuICAgICAgc3RlYW1XaXNwcyA9IFtdO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbVdpc3BzO1xuICAgIH1cbiAgICBpZiAoaGF1bFN0ZWFtKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShoYXVsU3RlYW0uZ3JvdXApO1xuICAgICAgaGF1bFN0ZWFtLmRpc3Bvc2UoKTtcbiAgICAgIGhhdWxTdGVhbSA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1DYXBhY2l0eTtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtQWN0aXZlO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1TcGF3bmVkO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1EZXRhaWw7XG4gICAgfVxuICAgIGlmIChsYW5kbWFya0NvbnRhY3RzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShsYW5kbWFya0NvbnRhY3RzKTtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChsYW5kbWFya0NvbnRhY3RzKTtcbiAgICAgIGxhbmRtYXJrQ29udGFjdHMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENvbnRhY3RTaGFkb3dzO1xuICAgIH1cbiAgICBpZiAod2F0ZXJDb2xsYXJzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZSh3YXRlckNvbGxhcnMpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKHdhdGVyQ29sbGFycyk7XG4gICAgICB3YXRlckNvbGxhcnMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhdGVyQ29sbGFycztcbiAgICB9XG4gICAgaWYgKHNwYW5TaGFkb3cpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHNwYW5TaGFkb3cpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKHNwYW5TaGFkb3cpO1xuICAgICAgc3BhblNoYWRvdyA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3BhblNoYWRvdztcbiAgICB9XG4gICAgaWYgKGNyb3NzaW5nQnJlYXRoKSB7XG4gICAgICBjcm9zc2luZ0JyZWF0aC5kaXNwb3NlKCk7XG4gICAgICBjcm9zc2luZ0JyZWF0aCA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90R29yZ2VXaXNwcztcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW07XG4gICAgfVxuICAgIGZvciAoY29uc3QgcG9uZCBvZiBwb25kcykge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUocG9uZC5ncm91cCk7XG4gICAgICBwb25kLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgcG9uZHMgPSBbXTtcbiAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNwcmluZ1BvbmRXYXRlclJhZGlpO1xuICAgIGZvciAoY29uc3QgcG9uZCBvZiBuZXh0UG9uZHMpIHBvbmQuZGlzcG9zZSgpO1xuICAgIG5leHRQb25kcyA9IFtdO1xuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgW3RlcnJhaW4sIHBhbm9yYW1hLCBsYW5kbWFya3MsIGNoYW5uZWxXYXRlcl0pIHtcbiAgICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUobW9kZWwpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKG1vZGVsKTtcbiAgICB9XG4gICAgdGVycmFpbiA9IHVuZGVmaW5lZDtcbiAgICBwYW5vcmFtYSA9IHVuZGVmaW5lZDtcbiAgICBsYW5kbWFya3MgPSB1bmRlZmluZWQ7XG4gICAgY2hhbm5lbFdhdGVyID0gdW5kZWZpbmVkO1xuICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90Q2hhbm5lbFdhdGVySGFsZldpZHRocztcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnZGlzcG9zZWQnO1xuICB9O1xufVxuXG5cbnR5cGUgTGFuZG1hcmtQYWludCA9IHsgaW50ZW5zaXR5OiBudW1iZXI7IHRpbnQ6IHN0cmluZyB9O1xuXG5cbi8qKlxuICogUGVyLWNvbnRyYWN0IGxhbmRtYXJrIHBhaW50LiBUaGUgZGVmYXVsdCDigJQgc2VsZi1saXQgM3ggb2ZmIHRoZSBib2R5J3Mgb3duXG4gKiBhbGJlZG8sIHRpbnRlZCB3aGl0ZSDigJQgaXMgd2hhdCBrZWVwcyBldmVyeSBsYW5kbWFyayBvbiBldmVyeSBtYXAgcmVhZGFibGVcbiAqIHVuZGVyIHRoZSBkYXkgcmlnLCBhbmQgaXQgc3RheXMgdGhlIGRlZmF1bHQgZm9yIGFsbCBvZiB0aGVtLlxuICpcbiAqIGUxLWJhcm9uIGlzIHRoZSBvbmUgbWFwIHRoYXQgbmVlZHMgYSBTSURFLiBUaGUgZmluYWxlIGlzIGEgZHVlbCBiZXR3ZWVuIGEgd2FybVxuICogaG9tZSBiYW5rIGFuZCBhIGNvbGQgY29tcGFueSBvbmUgKGRvY3MvYmVhdXR5L2UxLWJhcm9uLWJyaWVmLm1kIFUyKSwgYW5kIHRoZVxuICogZm9ydCBib2RpZXMgd2VyZSByZWFkaW5nIGFzIHRoZSBzYW1lIHdhcm0gb2NocmUgdGltYmVyIGFzIHRoZSBwbGF5ZXIncyBvd25cbiAqIGdlYXIuIFR1cm5pbmcgdGhlaXIgcmVhZGFiaWxpdHkgZG93biBhbmQgdGhlaXIgaHVlIHRvd2FyZCB3ZXQgaXJvbiBtYWtlcyB0aGVcbiAqIGZhciBiYW5rIGxvb20gaW5zdGVhZCBvZiBibGVuZCDigJQgd2hpbGUgdGhlIG94Ymxvb2QgYmFubmVycyBrZWVwIGFuIGVtYmVyIGxpZnQsXG4gKiBiZWNhdXNlIGhpcyBicmFuZCBpcyB0aGUgb25lIHdhcm0gdGhpbmcgYWxsb3dlZCBvbiB0aGF0IHNpZGUuIFRoZSBmbG9vciBoZXJlXG4gKiBpcyBkZWxpYmVyYXRlOiB0aGUgYnJpZWYncyBvd24gd2FybmluZyBpcyBcIk1FTkFDRSwgbm90IGludmlzaWJpbGl0eVwiLCBzbyBub1xuICogYm9keSBkcm9wcyBiZWxvdyAxLjUgYW5kIHRoZSBzaWxob3VldHRlIGVkZ2VzIHN0YXkgbGl0LlxuICovXG5jb25zdCBMQU5ETUFSS19QQUlOVDogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgTGFuZG1hcmtQYWludD4+ID0ge1xuICAnZTItdHJlc3RsZSc6IHsgJ3RyZXN0bGUtY3Jvc3NpbmcnOiB7IGludGVuc2l0eTogMi42LCB0aW50OiAnI2ZmZmZmZicgfSwgJ3NvdXRoLWJvaWxlci1zaXRlJzogeyBpbnRlbnNpdHk6IDIuNSwgdGludDogJyNlNGU1ZTcnIH0sICdub3J0aC1ib2lsZXItc2l0ZSc6IHsgaW50ZW5zaXR5OiAyLjUsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnbWluZS1zcHVyLWtpdCc6IHsgaW50ZW5zaXR5OiAyLjIsIHRpbnQ6ICcjZWZlMmNjJyB9LCAnc291dGgtYXBwcm9hY2gta2l0JzogeyBpbnRlbnNpdHk6IDIuMiwgdGludDogJyNmZmZmZmYnIH0sICdub3J0aC1hcHByb2FjaC1raXQnOiB7IGludGVuc2l0eTogMi4yLCB0aW50OiAnI2ZmZmZmZicgfSwgfSxcbiAgJ2UyLXByZXNzdXJlLWdhcmRlbic6IHsgJ2dhcmRlbi1wcmVzc3VyZS1tYW5pZm9sZCc6IHsgaW50ZW5zaXR5OiAzLCB0aW50OiAnI2U0ZTVlNycgfSwgJ3dhdGVyLWJhbmQtcHVtcC1zdGF0aW9uJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnd2VzdC10ZXJyYWNlLXBpcGUtaGVhZGVyJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnZWFzdC10ZXJyYWNlLXBpcGUtaGVhZGVyJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnY29hbC1zZWFtLXNlcnZpY2Utd2luY2gnOiB7IGludGVuc2l0eTogMywgdGludDogJyNlNGU1ZTcnIH0sIH0sXG4gICdlMi1pbmNsaW5lJzogeyAndXBwZXItb3JlLWNhYmxlLWhvdXNlJzogeyBpbnRlbnNpdHk6IDIuNSwgdGludDogJyNlMGUzZGYnIH0sICd3ZXN0LWxpbmUtYnJha2UtdG93ZXInOiB7IGludGVuc2l0eTogMi41LCB0aW50OiAnI2UwZTNkZicgfSwgJ2Vhc3QtbGluZS1icmFrZS10b3dlcic6IHsgaW50ZW5zaXR5OiAyLjUsIHRpbnQ6ICcjZTBlM2RmJyB9LCB9LFxuICAnZTEtYmFyb24nOiB7XG4gICAgZm9ydGlmaWVkX2Zhcl9iYW5rOiB7IGludGVuc2l0eTogMi41LCB0aW50OiAnI2FhYjViYicgfSxcbiAgICBzaWVnZV9saW5lOiB7IGludGVuc2l0eTogMi4yLCB0aW50OiAnI2E4YjBiNCcgfSxcbiAgICBzZWl6ZWRfaGVhZGZyYW1lOiB7IGludGVuc2l0eTogMi40LCB0aW50OiAnI2I2YjZiMCcgfSxcbiAgICBveGJsb29kX2Jhbm5lcnM6IHsgaW50ZW5zaXR5OiAzLjQsIHRpbnQ6ICcjZmZkMmI0JyB9LFxuICB9LFxuICAvLyBUSEUgUk9PRiBUSEFUIFNIT1VUUyAoZG9jcy9iZWF1dHkvZTItaGlsbC1taW5lLWJyaWVmLm1kIFUzKS4gTWVhc3VyZWQgYXQgdGhlIHJ1biBjYW1lcmEsIHRoZVxuICAvLyBib2lsZXItaG91c2Ugcm9vZiBpcyB0aGUgbG91ZGVzdCBwaXhlbCBmaWVsZCBvbiB0aGUgbWFwOiBtZWFuIHJnYiAxMzksMzgsMTUgb3ZlciB0aGUgcm9vZlxuICAvLyB3aW5kb3csIHdhcm10aCAoUi1CKSAxMjQgd2hlcmUgdGhlIHdob2xlIHJlc3Qgb2YgdGhlIGZyYW1lIGxpdmVzIGJldHdlZW4gMTAgYW5kIDk3LiBUaGF0IGlzIHRoZVxuICAvLyBiYXJvbidzIFwiY2lyY3VzIHRlbnRzXCIgZGlzZWFzZSwgYW5kIGl0IGlzIGEgcGFpbnQgcHJvYmxlbSwgbm90IGEgYm9keSBwcm9ibGVtIOKAlCB0aGUgcGFjayBtdXN0XG4gIC8vIG5vdCBiZSByZWJ1aWx0IChGLUJUQi0xIGNsYXNzKSwgc28gdGhpcyBpcyB0dW5lZCB0aHJvdWdoIHRoZSBwZXItY29udHJhY3QgcGFpbnQgYXJndW1lbnQuXG4gIC8vXG4gIC8vIEEgY29sb3VyIG11bHRpcGx5IGNhbiBvbmx5IGV2ZXIgdGFrZSBsaWdodCBhd2F5LCBzbyBpdCBjYW5ub3QgcmVwYWludCBjcmltc29uIGFzIGlyb24uIFdoYXQgaXRcbiAgLy8gQ0FOIGRvIGlzIHRha2UgdGhlIHJlZCBjaGFubmVsIGRvd24gaGFyZGVyIHRoYW4gdGhlIG90aGVyIHR3bywgd2hpY2ggaXMgd2hhdCB0dXJucyBhIHNpZ25hbCByZWRcbiAgLy8gaW50byBhbiBveGlkZTogdGhlIHRpbnQncyBibHVlIGlzIGFib3ZlIGl0cyByZWQgZm9yIHRoZSBzYW1lIHJlYXNvbiB0aGUgYmFyb24ncyBmb3J0IHRpbnQgaXMuXG4gIC8vIFRoZSBpbnRlbnNpdHkgZG9lcyB0aGUgcmVzdCBvZiB0aGUgd29yayDigJQgYXQgMyB0aGUgY29sb3VyIG1hcCBpcyBpdHMgb3duIGxpZ2h0IHNvdXJjZSwgc28gdGhlXG4gIC8vIHJvb2YgaXMgZW1pdHRpbmcgcmF0aGVyIHRoYW4gYmVpbmcgbGl0LCBhbmQgdGhlIGxvdyBzdW4gbW9kZWxzIG5vdGhpbmcgb24gaXQuXG4gICdlMi1oaWxsLW1pbmUnOiB7ICdib2lsZXItaG91c2Utc2l0ZSc6IHsgaW50ZW5zaXR5OiAyLCB0aW50OiAnIzlhYTZhNicgfSwgfSxcbn07XG5cblxuY29uc3QgREVGQVVMVF9MQU5ETUFSS19QQUlOVDogTGFuZG1hcmtQYWludCA9IHsgaW50ZW5zaXR5OiAzLCB0aW50OiAnI2ZmZmZmZicgfTtcblxuXG4vKipcbiAqIFU0IOKAlCBiYW5uZXJzIGluIHRoZSB3aW5kLiBUaGUgQmFyb24ncyBjbGFpbS1qdW1waW5nIGNvbXBhbnkgYnJhbmQgcmVhZHMgaW4gdGhlXG4gKiBIVUQgZXZlcnkgdGltZSBoZSB0YXVudHMsIGFuZCBodW5nIGRlYWQgaW4gdGhlIHdvcmxkLiBUaGlzIGlzIGEgdmVydGV4LXNoYWRlclxuICogc3dheTogbm8gbmV3IGRyYXdzLCBubyBuZXcgZ2VvbWV0cnksIG5vIENQVSBwZXItZnJhbWUgd29yayBiZXlvbmQgb25lIHVuaWZvcm0uXG4gKlxuICogVGhlIGRpc3BsYWNlbWVudCBpcyBnYXRlZCBvbiB0aGUgdmVydGV4J3Mgb3duIEhFSUdIVCwgc28gcG9sZXMgc3RheSBwbGFudGVkIGluXG4gKiB0aGUgZ3JvdW5kIGFuZCBvbmx5IGNsb3RoIG1vdmVzLCBhbmQgaXRzIHBoYXNlIGNvbWVzIGZyb20gdGhlIHZlcnRleCdzIG93biBYIOKAlFxuICogd2hpY2ggbWVhbnMgdGhlIHNpeCBiYW5uZXJzIHN0cnVuZyBhbG9uZyBvbmUgMjkgbSBib2R5IGVhY2ggYnJlYXRoZSBvbiB0aGVpclxuICogb3duIGJlYXQgd2l0aG91dCBhIHNpbmdsZSBwZXItaW5zdGFuY2UgYXR0cmlidXRlLlxuICpcbiAqIEFtcGxpdHVkZXMgYXJlIHBlci1tb3VudDogdGhlIGJhbm5lciBsaW5lIGdldHMgYSByZWFsIGZsYXAsIHRoZSBzaWVnZSBsaW5lIGdldHNcbiAqIGEgdGhpcmQgb2YgaXQgKGl0cyBnZW9tZXRyeSBpcyBtb3N0bHkgc3Rha2VzLCBhbmQgYSBzd2F5aW5nIHBhbGlzYWRlIHdvdWxkIHJlYWRcbiAqIGFzIGEgYnVnIHJhdGhlciB0aGFuIGFzIHdlYXRoZXIpLlxuICovXG5jb25zdCBCQVJPTl9TV0FZX0FNUExJVFVERTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHsgb3hibG9vZF9iYW5uZXJzOiAwLjE4NSwgc2llZ2VfbGluZTogMC4wNiB9O1xuXG5cbmNvbnN0IEJBUk9OX1NXQVlfRkxPT1IgPSAyLjI7XG5cblxuY29uc3QgYmFyb25Td2F5VGltZSA9IHsgdmFsdWU6IDAgfTtcblxuXG5mdW5jdGlvbiBpbnN0YWxsQmFubmVyU3dheShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIGFtcGxpdHVkZTogbnVtYmVyKTogdm9pZCB7XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSkgcmV0dXJuO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbDtcbiAgICBpZiAobWF0ZXJpYWwudXNlckRhdGEuYmFyb25Td2F5QW1wbGl0dWRlID09PSBhbXBsaXR1ZGUpIHJldHVybjtcbiAgICBtYXRlcmlhbC51c2VyRGF0YS5iYXJvblN3YXlBbXBsaXR1ZGUgPSBhbXBsaXR1ZGU7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51QmFyb25Td2F5VGltZSA9IGJhcm9uU3dheVRpbWU7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG51bmlmb3JtIGZsb2F0IHVCYXJvblN3YXlUaW1lOycpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsXG4gICAgICAgICAgYCNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XG5mbG9hdCBiYXJvblN3YXlMaWZ0ID0gY2xhbXAoKHBvc2l0aW9uLnkgLSAke0JBUk9OX1NXQVlfRkxPT1IudG9GaXhlZCgyKX0pIC8gMy4yLCAwLjAsIDEuMCk7XG5iYXJvblN3YXlMaWZ0ICo9IGJhcm9uU3dheUxpZnQ7XG5mbG9hdCBiYXJvblN3YXlQaGFzZSA9IHBvc2l0aW9uLnggKiAwLjU1O1xuZmxvYXQgYmFyb25Td2F5ID0gc2luKHVCYXJvblN3YXlUaW1lICogMS43ICsgYmFyb25Td2F5UGhhc2UpICogMC43MiArIHNpbih1QmFyb25Td2F5VGltZSAqIDIuOSArIGJhcm9uU3dheVBoYXNlICogMS45ICsgMS4zKSAqIDAuMjg7XG50cmFuc2Zvcm1lZC54ICs9IGJhcm9uU3dheSAqIGJhcm9uU3dheUxpZnQgKiAke2FtcGxpdHVkZS50b0ZpeGVkKDMpfTtcbnRyYW5zZm9ybWVkLnogKz0gc2luKHVCYXJvblN3YXlUaW1lICogMS4zMSArIGJhcm9uU3dheVBoYXNlICogMC43KSAqIGJhcm9uU3dheUxpZnQgKiAkeyhhbXBsaXR1ZGUgKiAwLjQ1KS50b0ZpeGVkKDMpfTtcbnRyYW5zZm9ybWVkLnkgLT0gYWJzKGJhcm9uU3dheSkgKiBiYXJvblN3YXlMaWZ0ICogJHsoYW1wbGl0dWRlICogMC4xNikudG9GaXhlZCgzKX07YCxcbiAgICAgICAgKTtcbiAgICB9O1xuICAgIC8vIFR3byBiYW5uZXIgYm9kaWVzIG11c3Qgbm90IHNoYXJlIG9uZSBjb21waWxlZCBwcm9ncmFtLCBvciB0aGUgc2Vjb25kIG9uZVxuICAgIC8vIHNpbGVudGx5IGluaGVyaXRzIHRoZSBmaXJzdCBvbmUncyBhbXBsaXR1ZGUgKFdhdGVyLnRzOjgyIHBhdHRlcm4pLlxuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGBiYXJvbi1zd2F5OiR7YW1wbGl0dWRlfWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIC8vIEZydXN0dW0gY3VsbGluZyBzdGF5cyBPTjogdGhlIGRpc3BsYWNlbWVudCBpcyA8PTAuMTg1IG9uIGEgMjkgbSBib2R5LCBmYXJcbiAgICAvLyBpbnNpZGUgaXRzIGJvdW5kaW5nIHNwaGVyZSwgc28gZGlzYWJsaW5nIGl0IHdvdWxkIG9ubHkgYnV5IGRyYXdzIHdoZW4gdGhlXG4gICAgLy8gYmFubmVycyBhcmUgb2ZmLXNjcmVlbi5cbiAgICBtZXNoLm9uQmVmb3JlUmVuZGVyID0gKCkgPT4ge1xuICAgICAgYmFyb25Td2F5VGltZS52YWx1ZSA9IHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDE7XG4gICAgfTtcbiAgfSk7XG59XG4iXX0=