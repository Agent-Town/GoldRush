import { installArchiveRestoration } from "/src/world/ArchiveRestoration.ts";
import * as THREE from "/node_modules/.vite/deps/three.js?v=6222772d";
import baronContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/baron-terrain-contract.json?import&raw";
import baronPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/baron-panorama-contract.json?import&raw";
import dryGulchContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-terrain-contract.json?import&raw";
import dryGulchPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-panorama-contract.json?import&raw";
import hillMineContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-terrain-contract.json?import&raw";
import hillMinePanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-panorama-contract.json?import&raw";
import nightShiftContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/night-shift-terrain-contract.json?import&raw";
import nightShiftPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/night-shift-panorama-contract.json?import&raw";
import claimContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json?import&raw";
import claimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/the-claim-panorama-contract.json?import&raw";
import twinBanksContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json?import&raw";
import twinBanksPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-panorama-contract.json?import&raw";
import trestleContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/trestle-terrain-contract.json?import&raw";
import trestlePanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/trestle-panorama-contract.json?import&raw";
import blackoutRidgeContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-terrain-contract.json?import&raw";
import blackoutRidgePanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-panorama-contract.json?import&raw";
import fairgroundContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/fairground-terrain-contract.json?import&raw";
import fairgroundPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/fairground-panorama-contract.json?import&raw";
import dustFlatsContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-terrain-contract.json?import&raw";
import dustFlatsPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-panorama-contract.json?import&raw";
import deepwaterClaimContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json?import&raw";
import deepwaterClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama-contract.json?import&raw";
import glowMesaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json?import&raw";
import glowMesaPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama-contract.json?import&raw";
import relayValleyContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain-contract.json?import&raw";
import relayValleyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama-contract.json?import&raw";
import mareClaimContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain-contract.json?import&raw";
import farSideContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/far-side-terrain-contract.json?import&raw";
import mareClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama-contract.json?import&raw";
import domeBasinContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-terrain-contract.json?import&raw";
import domeBasinPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-panorama-contract.json?import&raw";
import emberShoreContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-terrain-contract.json?import&raw";
import emberShorePanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-panorama-contract.json?import&raw";
import archiveWorldContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/archive-world-terrain-contract.json?import&raw";
import archiveWorldPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/archive-world-panorama-contract.json?import&raw";
import boneyardContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/boneyard-terrain-contract.json?import&raw";
import boneyardPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/boneyard-panorama-contract.json?import&raw";
import canyonWorksContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-terrain-contract.json?import&raw";
import canyonWorksPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-panorama-contract.json?import&raw";
import devilsAlleyContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-terrain-contract.json?import&raw";
import devilsAlleyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-panorama-contract.json?import&raw";
import echoCanyonContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-terrain-contract.json?import&raw";
import echoCanyonPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-panorama-contract.json?import&raw";
import gusherCountyContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-terrain-contract.json?import&raw";
import gusherCountyPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-panorama-contract.json?import&raw";
import relayRushContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-rush-terrain-contract.json?import&raw";
import deadBandContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dead-band-terrain-contract.json?import&raw";
import picnicContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/picnic-terrain-contract.json?import&raw";
import halfLifeHollowContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json?import&raw";
import halfLifeHollowPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-panorama-contract.json?import&raw";
import inclineContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/incline-terrain-contract.json?import&raw";
import inclinePanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/incline-panorama-contract.json?import&raw";
import longRoadContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/long-road-terrain-contract.json?import&raw";
import longRoadPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/long-road-panorama-contract.json?import&raw";
import lowOrbitContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-terrain-contract.json?import&raw";
import lowOrbitPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-panorama-contract.json?import&raw";
import mothSeasonContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/moth-season-terrain-contract.json?import&raw";
import mothSeasonPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/moth-season-panorama-contract.json?import&raw";
import oldCanalContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/old-canal-terrain-contract.json?import&raw";
import oldCanalPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/old-canal-panorama-contract.json?import&raw";
import pressureGardenContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-terrain-contract.json?import&raw";
import pressureGardenPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-panorama-contract.json?import&raw";
import regattaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/regatta-terrain-contract.json?import&raw";
import regattaPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/regatta-panorama-contract.json?import&raw";
import seedRunContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/seed-run-terrain-contract.json?import&raw";
import seedRunPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/seed-run-panorama-contract.json?import&raw";
import showroomContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/showroom-terrain-contract.json?import&raw";
import showroomPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/showroom-panorama-contract.json?import&raw";
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
import lastClaimContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/last-claim-terrain-contract.json?import&raw";
import lastClaimPanoramaContractText from "/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/last-claim-panorama-contract.json?import&raw";
const entry = (terrainUrl, panoramaUrl, contractText, panoramaContractText, dressingText) => {
	const contract = JSON.parse(contractText);
	// Variant dressing supplements the base bodies; the existing mount filter and transforms apply.
	if (dressingText) contract.landmarkMounts = [...contract.landmarkMounts ?? [], ...JSON.parse(dressingText).landmarkMounts ?? []];
	return {
		terrainUrl,
		panoramaUrl,
		contract,
		panoramaContract: JSON.parse(panoramaContractText)
	};
};
const REGISTRY = {
	"the-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/the-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/the-claim-panorama.glb", '' + import.meta.url).href, claimContractText, claimPanoramaContractText),
	"e1-dry-gulch": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dry-gulch-panorama.glb", '' + import.meta.url).href, dryGulchContractText, dryGulchPanoramaContractText),
	"e1-twin-banks": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/twin-banks-panorama.glb", '' + import.meta.url).href, twinBanksContractText, twinBanksPanoramaContractText),
	"e1-night-shift": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/night-shift-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/night-shift-panorama.glb", '' + import.meta.url).href, nightShiftContractText, nightShiftPanoramaContractText),
	"e1-baron": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/baron-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/baron-panorama.glb", '' + import.meta.url).href, baronContractText, baronPanoramaContractText),
	...__GR_RELEASE_E1__ ? {} : {
		"e2-hill-mine": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/hill-mine-panorama.glb", '' + import.meta.url).href, hillMineContractText, hillMinePanoramaContractText),
		"e2-trestle": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/trestle-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/trestle-panorama.glb", '' + import.meta.url).href, trestleContractText, trestlePanoramaContractText),
		"e3-blackout-ridge": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/blackout-ridge-panorama.glb", '' + import.meta.url).href, blackoutRidgeContractText, blackoutRidgePanoramaContractText),
		"e3-fairground": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/fairground-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/fairground-panorama.glb", '' + import.meta.url).href, fairgroundContractText, fairgroundPanoramaContractText),
		"e4-dust-flats": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dust-flats-panorama.glb", '' + import.meta.url).href, dustFlatsContractText, dustFlatsPanoramaContractText),
		"e5-deepwater-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e6-glow-mesa": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb", '' + import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
		"e7-relay-valley": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
		"e8-mare-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
		"e9-dome-basin": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/dome-basin-panorama.glb", '' + import.meta.url).href, domeBasinContractText, domeBasinPanoramaContractText),
		"e10-ember-shore": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/ember-shore-panorama.glb", '' + import.meta.url).href, emberShoreContractText, emberShorePanoramaContractText),
		"e2-pressure-garden": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/pressure-garden-panorama.glb", '' + import.meta.url).href, pressureGardenContractText, pressureGardenPanoramaContractText),
		"e2-incline": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/incline-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/incline-panorama.glb", '' + import.meta.url).href, inclineContractText, inclinePanoramaContractText),
		"e3-canyon-works": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/canyon-works-panorama.glb", '' + import.meta.url).href, canyonWorksContractText, canyonWorksPanoramaContractText),
		"e3-moth-season": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/moth-season-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/moth-season-panorama.glb", '' + import.meta.url).href, mothSeasonContractText, mothSeasonPanoramaContractText),
		"e4-long-road": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/long-road-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/long-road-panorama.glb", '' + import.meta.url).href, longRoadContractText, longRoadPanoramaContractText),
		"e4-gusher-county": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/gusher-county-panorama.glb", '' + import.meta.url).href, gusherCountyContractText, gusherCountyPanoramaContractText),
		"e4-boneyard": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/boneyard-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/boneyard-panorama.glb", '' + import.meta.url).href, boneyardContractText, boneyardPanoramaContractText),
		"e5-regatta": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/regatta-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/regatta-panorama.glb", '' + import.meta.url).href, regattaContractText, regattaPanoramaContractText),
		// Deepwater Claim aliases: these campaign variants intentionally reuse its terrain and panorama.
		"e5-stillwater": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e5-flotilla": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb", '' + import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
		"e6-showroom": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/showroom-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/showroom-panorama.glb", '' + import.meta.url).href, showroomContractText, showroomPanoramaContractText),
		"e6-half-life-hollow": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/half-life-hollow-panorama.glb", '' + import.meta.url).href, halfLifeHollowContractText, halfLifeHollowPanoramaContractText),
		// Picnic retains the Glow Mesa sculpt and collision-backed bodies, adding its nonblocking dressing.
		"e6-picnic": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb", '' + import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText, picnicContractText),
		"e7-echo-canyon": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/echo-canyon-panorama.glb", '' + import.meta.url).href, echoCanyonContractText, echoCanyonPanoramaContractText),
		// Relay Valley aliases: both signal variants reuse its terrain and panorama.
		"e7-dead-band": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, deadBandContractText),
		"e7-relay-rush": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/relay-valley-panorama.glb", '' + import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText, relayRushContractText),
		// Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt.
		"e8-far-side": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText, farSideContractText),
		"e8-low-orbit": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/low-orbit-panorama.glb", '' + import.meta.url).href, JSON.stringify({
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
		"e8-eclipse": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/mare-claim-panorama.glb", '' + import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
		"e9-seed-run": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/seed-run-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/seed-run-panorama.glb", '' + import.meta.url).href, JSON.stringify({
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
		"e9-devils-alley": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/devils-alley-panorama.glb", '' + import.meta.url).href, JSON.stringify({
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
		"e9-old-canal": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/old-canal-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/old-canal-panorama.glb", '' + import.meta.url).href, JSON.stringify({
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
		"e10-archive-world": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/archive-world-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/archive-world-panorama.glb", '' + import.meta.url).href, archiveWorldContractText, archiveWorldPanoramaContractText),
		"e10-last-claim": entry(new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/last-claim-terrain.glb", '' + import.meta.url).href, new URL("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/last-claim-panorama.glb", '' + import.meta.url).href, lastClaimContractText, lastClaimPanoramaContractText)
	}
};
const LANDMARK_ASSETS = /* #__PURE__ */ Object.assign({"../../assets/pilots/assay-office-3d/assay-office.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/assay-office-3d/assay-office.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/assay-office-3d/assay-office.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/catalog-warehouse-3d/catalog-warehouse.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/catalog-warehouse-3d/catalog-warehouse.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/chapel-3d/chapel.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/chapel-3d/chapel.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/claim-office-3d/claim-office.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/claim-office-3d/claim-office.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/dynamo-hall-3d/dynamo-hall.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/dynamo-hall-3d/dynamo-hall.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/general-store-3d/general-store.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/general-store-3d/general-store.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/archive-entry-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/archive-entry-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/east-stack-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/east-stack-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/ours-unless-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/ours-unless-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/warning-shelf-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/warning-shelf-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/archive-world/west-stack-ruin.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/archive-world/west-stack-ruin.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/fortified_far_bank.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/fortified_far_bank.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/oxblood_banners.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/oxblood_banners.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/rocket_cart.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/rocket_cart.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/seized_headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/seized_headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/baron/siege_line.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/baron/siege_line.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/blackout-watch-lamp.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/blackout-watch-lamp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/breath-bank-service-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/breath-bank-service-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/off-map-current-receiver.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/off-map-current-receiver.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/ridge-switch-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/ridge-switch-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/trunk-line-breaker-shelter.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/blackout-ridge/trunk-line-breaker-shelter.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-a.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-b.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-c.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-east-c.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-a.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-b.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-c.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/flivver-row-west-c.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/half-buried-sleeper.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/half-buried-sleeper.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-a.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-a.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-b.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/hauler-bed-north-b.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-east.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-east.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-west.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/spent-boiler-west.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/boneyard/unmarked-wagon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/boneyard/unmarked-wagon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/dam-crest-gate-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/dam-crest-gate-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/downriver-tram-lamp.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/downriver-tram-lamp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/east-switchback-line-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/east-switchback-line-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/sub-hall-dynamo-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/sub-hall-dynamo-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/canyon-works/west-switchback-line-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/canyon-works/west-switchback-line-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/dead-band-yard-null-post.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/dead-band-yard-null-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/east-old-tool-cache.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/east-old-tool-cache.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/iron-shadow-warning-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/iron-shadow-warning-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/north-silence-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/north-silence-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dead-band/west-old-tool-cache.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dead-band/west-old-tool-cache.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/center-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/center-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/east-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/east-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/north-anchor-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/north-anchor-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/south-anchor-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/south-anchor-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/devils-alley/west-wind-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/devils-alley/west-wind-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/ark-yard-scaffold.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/ark-yard-scaffold.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/canal-gate-works.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/canal-gate-works.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/dust-devil-warning-mast.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/dust-devil-warning-mast.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/ice-quarry-hoist.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/ice-quarry-hoist.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dome-basin/seed-row-weather-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dome-basin/seed-row-weather-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/abandoned_farmhouse.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/abandoned_farmhouse.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/bison_skeleton.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/bison_skeleton.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/cactus_thicket.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/cactus_thicket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/isolated_spring.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/isolated_spring.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dry-gulch/ruined_mining_operation.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dry-gulch/ruined_mining_operation.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/dry-wash-recovery-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/dry-wash-recovery-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/east-horizon-fuel-reserve.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/east-horizon-fuel-reserve.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/north-railhead-storm-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/north-railhead-storm-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/south-grade-charting-post.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/south-grade-charting-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/dust-flats/west-road-wrecker-shed.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/dust-flats/west-road-wrecker-shed.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/east-echo-array.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/east-echo-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/mirror-observation-post.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/mirror-observation-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/north-return-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/north-return-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/south-broadcast-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/south-broadcast-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/echo-canyon/west-echo-array.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/echo-canyon/west-echo-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/east-rim-solar-witness.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/east-rim-solar-witness.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/eclipse-shadow-dial.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/eclipse-shadow-dial.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/launch-shadow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/launch-shadow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/mass-driver-eclipse-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/mass-driver-eclipse-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/eclipse/west-rim-solar-witness.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/eclipse/west-rim-solar-witness.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/center-vein-bridge-school.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/center-vein-bridge-school.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/cooled-titan-shelf.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/cooled-titan-shelf.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/last-warm-vent-altar.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/last-warm-vent-altar.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/shore-preserve-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/shore-preserve-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/ember-shore/west-vein-cooling-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/ember-shore/west-vein-cooling-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/east-mothglass-prize-cage.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/east-mothglass-prize-cage.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/fair-bell-battery-kiosk.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/fair-bell-battery-kiosk.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/north-crowd-counting-rostrum.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/north-crowd-counting-rostrum.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/south-midway-admission-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/south-midway-admission-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/fairground/west-current-calliope-wagon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/fairground/west-current-calliope-wagon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/east-suit-cache-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/east-suit-cache-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/far-horizon-listening-post.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/far-horizon-listening-post.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/far-side-landing-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/far-side-landing-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/probe-recovery-cradle.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/probe-recovery-cradle.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/far-side/west-comms-shadow-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/far-side/west-comms-shadow-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/east-herd-glow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/east-herd-glow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/isotope-cooling-rack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/isotope-cooling-rack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/mesa-starstone-derrick.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/mesa-starstone-derrick.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/six-vein-control-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/six-vein-control-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/glow-mesa/west-herd-glow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/glow-mesa/west-herd-glow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/county-camp-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/county-camp-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-01.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-01.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-02.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-02.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-03.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-03.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-04.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-04.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-05.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-05.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-06.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-06.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-07.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-07.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-08.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/derrick-08.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/gusher-county/outhouse-geyser.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/gusher-county/outhouse-geyser.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/east-hollow-warning-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/east-hollow-warning-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/expired-appliance-convoy.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/expired-appliance-convoy.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/north-extraction-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/north-extraction-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/south-countdown-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/south-countdown-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/west-hollow-warning-pylon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/half-life-hollow/west-hollow-warning-pylon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/boiler-house-site.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/boiler-house-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/flooded-gallery.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/flooded-gallery.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/mine-mouth-and-ruined-headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/mine-mouth-and-ruined-headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/switchback-rail-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/switchback-rail-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/hill-mine/tailings-and-scree-pack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/hill-mine/tailings-and-scree-pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/east-line-brake-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/east-line-brake-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/ford-service-pump.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/ford-service-pump.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/lower-yard-engine-crane.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/lower-yard-engine-crane.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/upper-ore-cable-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/upper-ore-cable-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/incline/west-line-brake-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/incline/west-line-brake-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/central-orrery.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/central-orrery.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-lantern.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-lantern.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-portrait.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-last-portrait.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-pan-theme-song.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/preserve-pan-theme-song.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/last-claim/stern-memory-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/last-claim/stern-memory-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/convoy-lead-hauler-start.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/convoy-lead-hauler-start.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/east-railhead.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/east-railhead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/east-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/east-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/middle-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/middle-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/long-road/west-way-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/long-road/west-way-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/claw-carcass-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/claw-carcass-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/east-scaffold-handhold-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/east-scaffold-handhold-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/north-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/north-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/south-return-beacon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/south-return-beacon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/low-orbit/west-scaffold-handhold-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/low-orbit/west-scaffold-handhold-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/earthrise-listening-array.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/earthrise-listening-array.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/east-rim-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/east-rim-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/lava-tube-survey-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/lava-tube-survey-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/regolith-core-yard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/regolith-core-yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-claim/west-rim-debris-catcher.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-claim/west-rim-debris-catcher.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/mare-dome/air-pad-dome.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/mare-dome/air-pad-dome.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/east-tithe-bell-house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/east-tithe-bell-house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/mothglass-counting-cage.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/mothglass-counting-cage.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/north-migration-watch-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/north-migration-watch-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/south-quiet-road-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/south-quiet-road-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/moth-season/west-lamplighter-refuge.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/moth-season/west-lamplighter-refuge.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/central_ford.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/central_ford.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/dark_rock_shoulders.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/dark_rock_shoulders.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/lampworks_yard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/lampworks_yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/night_work_road.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/night_work_road.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/night-shift/seven_lantern_terraces.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/night-shift/seven_lantern_terraces.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-a-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-a-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-b-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-b-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-c-marker.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/canal-segment-c-marker.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/north-outflow-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/north-outflow-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/old-canal/south-survey-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/old-canal/south-survey-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/center-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/center-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/east-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/east-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/mesa-civilian-shade.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/mesa-civilian-shade.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/picnic-staging-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/picnic-staging-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/picnic/west-picnic-blanket.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/picnic/west-picnic-blanket.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/coal-seam-service-winch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/coal-seam-service-winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/east-terrace-pipe-header.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/east-terrace-pipe-header.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/garden-pressure-manifold.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/garden-pressure-manifold.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/water-band-pump-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/water-band-pump-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/pressure-garden/west-terrace-pipe-header.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/pressure-garden/west-terrace-pipe-header.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/finish-line-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/finish-line-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/judges-tower.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/judges-tower.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/midcourse-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/midcourse-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/northeast-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/northeast-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/northwest-buoy-line-anchor.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/northwest-buoy-line-anchor.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-port.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-port.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-starboard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/spectator-raft-starboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/regatta/start-line-rig.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/regatta/start-line-rig.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r1-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r1-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r2-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r2-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r3-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r3-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r4-frame.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-relay-r4-frame.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-start-horn.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-rush/rush-start-horn.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/dead-gap-charting-station.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/dead-gap-charting-station.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/drone-recovery-beacon.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/drone-recovery-beacon.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/east-ridge-dish-cluster.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/east-ridge-dish-cluster.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/valley-cable-drum-yard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/valley-cable-drum-yard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/relay-valley/west-ridge-dish-cluster.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/relay-valley/west-ridge-dish-cluster.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/center-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/center-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/east-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/east-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/north-basin-waygate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/north-basin-waygate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/south-seed-caravan-gate.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/south-seed-caravan-gate.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/seed-run/west-seed-vault.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/seed-run/west-seed-vault.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/abandoned-catalog-office.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/abandoned-catalog-office.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/catalog-sorting-gantry.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/catalog-sorting-gantry.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/east-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/east-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/east-starburst-billboard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/east-starburst-billboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/north-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/north-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/northeast-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/northeast-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/northwest-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/northwest-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/showroom-entrance-arch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/showroom-entrance-arch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/west-display-home.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/west-display-home.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/showroom/west-starburst-billboard.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/showroom/west-starburst-billboard.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/active_headframe.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/active_headframe.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/claim_stake.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/claim_stake.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/maintained_claim_house.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/maintained_claim_house.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/riparian_dressing_pack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/riparian_dressing_pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/the-claim/working_camp.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/the-claim/working_camp.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/mine-spur-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/mine-spur-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/north-approach-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/north-approach-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/north-boiler-site.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/north-boiler-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/south-approach-kit.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/south-approach-kit.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/south-boiler-site.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/south-boiler-site.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-crossing.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/trestle/trestle-crossing.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/floodplain_dressing_pack.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_homestead.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_homestead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_winch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/north_bank_winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_homestead.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_homestead.glb?import&url").then(m => m["default"]),"../../assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_winch.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/map-rebuild-spike/landmarks/twin-banks/south_bank_winch.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-1.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-1.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-2.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-2.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ark-scaffold-stage-3.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/ark-scaffold-stage-3.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/bridge-school.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/bridge-school.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-dry.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/canal-segment-dry.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-flowing.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/canal-segment-flowing.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/canal-segment-wet.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/canal-segment-wet.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/charter-press.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/charter-press.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/coal-bin.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/coal-bin.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/covered_wagon.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/covered_wagon.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/crater-rim-set.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/crater-rim-set.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-cruise.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/engine-glow-cruise.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-idle.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/engine-glow-idle.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/engine-glow-ward.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/engine-glow-ward.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/filling-shed.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/filling-shed.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/fuel-rack.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/fuel-rack.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/gauge-post.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/gauge-post.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/harbor-lantern.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/harbor-lantern.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/ice-blocks.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/ice-blocks.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/insulator-post.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/insulator-post.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/iron-lamp-post.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/iron-lamp-post.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/journey-flag-line.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/journey-flag-line.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/lander-legs.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/lander-legs.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/motor-roadway.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/motor-roadway.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/net-frame.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/net-frame.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/pipe-run.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/pipe-run.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/preserve-rack.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/preserve-rack.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/pressure-manifold.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/pressure-manifold.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/road-marker.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/road-marker.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/rope-buoy-rack.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/rope-buoy-rack.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/survey-cairn.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/survey-cairn.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/tide-board.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/tide-board.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/transformer-shed.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/transformer-shed.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/water_trough.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/water_trough.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/plaza-props-3d/wire-run.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/plaza-props-3d/wire-run.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/schoolhouse-3d/schoolhouse.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/schoolhouse-3d/schoolhouse.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/stamp-mill-3d/stamp-mill.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/stamp-mill-3d/stamp-mill.e9.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e10.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e10.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e2.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e2.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e3.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e3.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e4.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e4.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e5.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e5.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e6.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e6.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e7.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e7.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e8.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e8.glb?import&url").then(m => m["default"]),"../../assets/pilots/tavern-3d/tavern.e9.glb": () => import("/@fs/Users/robin/Claude/Projects/GoldRush-assets/pilots/tavern-3d/tavern.e9.glb?import&url").then(m => m["default"])


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
		color: "#cbdde2",
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
		radius: 3.6,
		grow: 1.9,
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
diffuseColor.rgb = mix(motorOriginal, diffuseColor.rgb, motorInterior);`);
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
			shader.uniforms.memorialBand = { value: new THREE.Color("#8c928b") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vMemorialDeck;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvMemorialDeck = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vMemorialDeck;\nuniform vec3 memorialBrass, memorialBand;").replace("#include <map_fragment>", `#include <map_fragment>
float memorialRadius = length(vMemorialDeck);
float memorialInside = 1.0 - smoothstep(55.8, 57.0, memorialRadius);
diffuseColor.rgb = (pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.68)) * 0.84 + vec3(0.026)) * mix(0.58, 1.0, memorialInside);
float memorialAnnulus = smoothstep(44.7, 45.0, memorialRadius) * (1.0 - smoothstep(48.3, 48.6, memorialRadius));
diffuseColor.rgb = mix(diffuseColor.rgb, memorialBand, memorialAnnulus * 0.24);
float memorialRingDistance = min(min(abs(memorialRadius - 44.6), abs(memorialRadius - 48.7)), min(abs(memorialRadius - 55.2), min(abs(memorialRadius - 20.0), abs(memorialRadius - 5.0))));
float memorialRing = 1.0 - smoothstep(0.065, 0.16, memorialRingDistance);
float memorialSpokeDistance = abs(sin(atan(vMemorialDeck.y, vMemorialDeck.x) * 6.0)) * memorialRadius;
float memorialSpoke = (1.0 - smoothstep(0.08, 0.20, memorialSpokeDistance)) * smoothstep(4.5, 5.0, memorialRadius) * (1.0 - smoothstep(43.9, 44.3, memorialRadius));
diffuseColor.rgb = mix(diffuseColor.rgb, memorialBrass, max(memorialRing, memorialSpoke) * 0.82);`);
		};
		material.customProgramCacheKey = () => "last-claim-memorial-inlay-v1";
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
				shader.fragmentShader = shader.fragmentShader.replace("vec4 sampledDiffuseColor = vec4(waterColor, alpha);", `
vec3 returnWater = mix(vec3(0.33, 0.39, 0.38), vec3(0.10, 0.19, 0.23), depth);
returnWater = mix(returnWater, vec3(0.48, 0.46, 0.35), fordBand * 0.55);
waterColor = mix(waterColor, returnWater, 0.65);
float returnFlowLine = sin(vWaterWorld.y * 7.0 + waterNoise(vWaterWorld * vec2(1.2, 1.8) - vec2(waterTime * 0.32, 0.0)) * 4.8);
float returnFlowBreak = smoothstep(0.50, 0.78, waterNoise(vWaterWorld * vec2(3.4, 2.3) - vec2(waterTime * 0.4, 0.0)));
waterColor += vec3(0.12, 0.11, 0.075) * smoothstep(0.94, 0.995, returnFlowLine) * returnFlowBreak * waterQuality * (1.0 - fordBand) * smoothstep(0.05, 0.20, depth);
vec4 sampledDiffuseColor = vec4(waterColor, alpha);`);
			} else {
				shader.uniforms.returnBankPigment = { value: new THREE.Color("#ad9c75") };
				shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec3 returnBankPigment;").replace("diffuseColor *= sampledDiffuseColor;", "diffuseColor *= sampledDiffuseColor;\ndiffuseColor.rgb = mix(diffuseColor.rgb, returnBankPigment, 0.25);");
			}
		};
		material.customProgramCacheKey = () => `${cacheKey}|raw-river-dawn-v1:${water ? "water" : "bank"}`;
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
function clarifyArchiveTerraces(model, readState) {
	if (isMapBeautyDisabled()) return;
	const zones = readState?.()?.zones ?? [];
	const pools = { value: zones.map((zone) => new THREE.Vector4((zone.minX + zone.maxX) / 2, (zone.minZ + zone.maxZ) / 2, (zone.maxX - zone.minX) * .3, (zone.maxZ - zone.minZ) * .3)) };
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
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.archiveFloorLow = { value: new THREE.Color("#776f5e") };
			shader.uniforms.archiveFloorHigh = { value: new THREE.Color("#a8a38d") };
			shader.uniforms.archiveFloorPools = pools;
			shader.uniforms.archiveFloorRestored = restored;
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vArchiveFloor;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvArchiveFloor = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vArchiveFloor;
uniform vec3 archiveFloorLow, archiveFloorHigh;
${zones.length ? `uniform vec4 archiveFloorPools[${zones.length}];\nuniform float archiveFloorRestored[${zones.length}];` : ""}`).replace("#include <map_fragment>", `#include <map_fragment>
float archiveTerrace = smoothstep(-0.7, 2.2, vArchiveFloor.y);
diffuseColor.rgb = mix(diffuseColor.rgb, mix(archiveFloorLow, archiveFloorHigh, archiveTerrace), 0.50);`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
${zones.length ? `for (int i = 0; i < ${zones.length}; i++) {
  vec4 pool = archiveFloorPools[i];
  float archivePool = 1.0 - smoothstep(0.12, 1.0, length((vArchiveFloor.xz - pool.xy) / pool.zw));
  totalEmissiveRadiance += vec3(0.24, 0.095, 0.025) * archivePool * archiveFloorRestored[i];
}` : ""}`);
		};
		material.customProgramCacheKey = () => `${cacheKey}|archive-terraces-v1:${zones.length}`;
		material.needsUpdate = true;
	});
}
/** One world-space basalt treatment crosses the sculpt/continuation join. */
function clarifyEmberBasalt(model) {
	if (isMapBeautyDisabled()) return;
	model.traverse((node) => {
		const mesh = node;
		if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial) return;
		const material = mesh.material, compile = material.onBeforeCompile.bind(material);
		const cacheKey = material.customProgramCacheKey();
		material.onBeforeCompile = (shader, renderer) => {
			compile(shader, renderer);
			shader.uniforms.emberBasaltLow = { value: new THREE.Color("#5d727c") };
			shader.uniforms.emberBasaltHigh = { value: new THREE.Color("#9c9e91") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vEmberBasalt;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvEmberBasalt = (modelMatrix * vec4(position, 1.0)).xyz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vEmberBasalt;
uniform vec3 emberBasaltLow, emberBasaltHigh;
vec2 emberStoneHash(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}`).replace("#include <map_fragment>", `#include <map_fragment>
float emberWarm = clamp((diffuseColor.r - max(diffuseColor.g, diffuseColor.b) * 1.8) * 18.0, 0.0, 1.0);
float emberShelf = smoothstep(-1.8, 1.8, vEmberBasalt.y);
vec2 emberCell = vEmberBasalt.xz * 1.45;
vec2 emberCellId = floor(emberCell), emberCellPoint = fract(emberCell);
float emberNear = 8.0, emberNext = 8.0, emberCellShade = 0.5;
for (int emberY = -1; emberY <= 1; emberY++) for (int emberX = -1; emberX <= 1; emberX++) {
  vec2 emberNeighbour = vec2(float(emberX), float(emberY));
  vec2 emberSeed = emberStoneHash(emberCellId + emberNeighbour);
  float emberDistance = length(emberNeighbour + 0.18 + emberSeed * 0.64 - emberCellPoint);
  if (emberDistance < emberNear) { emberNext = emberNear; emberNear = emberDistance; emberCellShade = emberSeed.x; }
  else emberNext = min(emberNext, emberDistance);
}
float emberJoint = smoothstep(0.006, 0.030, emberNext - emberNear);
float emberGrain = fract(sin(dot(floor(vEmberBasalt * 18.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
float emberGrainFade = 1.0 - smoothstep(0.4, 1.2, max(max(fwidth(vEmberBasalt.x), fwidth(vEmberBasalt.z)), fwidth(vEmberBasalt.y)) * 18.0);
vec3 emberStone = mix(emberBasaltLow, emberBasaltHigh, emberShelf);
emberStone *= (0.94 + emberCellShade * 0.08 + (emberGrain - 0.5) * 0.20 * emberGrainFade) * mix(0.93, 1.0, emberJoint);
diffuseColor.rgb = mix(diffuseColor.rgb, emberStone, 0.88);
float emberPlayfield = 1.0 - smoothstep(63.8, 64.0, max(abs(vEmberBasalt.x), abs(vEmberBasalt.z)));
float emberVein = emberWarm * emberPlayfield * (0.70 + 0.30 * emberGrain);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.28, 0.055, 0.012), emberVein * 0.82);`).replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.07, 0.012, 0.002) * emberVein;");
		};
		material.customProgramCacheKey = () => `${cacheKey}|ember-basalt-v4`;
		material.needsUpdate = true;
	});
}
/** Dry canal/road pigment follows published routes. Permanent green zones are
* authored terrain paint; staged water and planted state keep their existing owners. */
function clarifyRedFieldsRoute(model, points, greenZones = []) {
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
float domeCanalBedMask = 1.0 - smoothstep(1.3, 2.1, domeCanalDistance);
float domeCanalShoulder = smoothstep(1.5, 2.1, domeCanalDistance) * (1.0 - smoothstep(2.8, 3.8, domeCanalDistance));
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalBed * (0.94 + domeCanalGrain * 0.04), ${greenZones.length ? "0.48" : "0.68"} * domeCanalBedMask * domeCanalInterior);
diffuseColor.rgb = mix(diffuseColor.rgb, domeCanalEarth * 1.22, ${greenZones.length ? "0.18" : "0.35"} * domeCanalShoulder * domeCanalInterior);`);
		};
		material.customProgramCacheKey = () => `redfields-dry-route-v2:${segments.length}:${greenZones.length}`;
		material.needsUpdate = true;
	}
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
function clarifyPressureGardenTerraces(model) {
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
			shader.uniforms.gardenWorkedPigment = { value: new THREE.Color("#957957") };
			shader.uniforms.gardenRowPigment = { value: new THREE.Color("#9d8662") };
			shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vGardenGround;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvGardenGround = (modelMatrix * vec4(position, 1.0)).xz;");
			shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vGardenGround;\nuniform vec3 gardenWorkedPigment;\nuniform vec3 gardenRowPigment;").replace("#include <map_fragment>", `#include <map_fragment>
float gardenX = abs(vGardenGround.x), gardenZ = vGardenGround.y;
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
		material.customProgramCacheKey = () => "pressure-garden-worked-terraces-v1";
		material.needsUpdate = true;
	}
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
			if (panorama) {
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
		material.customProgramCacheKey = () => `canyon-ground-v1-${panorama}`;
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
			if (host.contractId === "e2-pressure-garden") clarifyPressureGardenTerraces(nextTerrain);
			if (host.contractId === "e2-incline") clarifyInclineYards(nextTerrain);
			if (host.contractId === "e3-canyon-works") clarifyCanyonGround(nextTerrain);
			if (host.contractId === "e10-last-claim") paintLastClaimDeck(nextTerrain);
			if (host.contractId === "e10-ember-shore") clarifyEmberBasalt(nextTerrain);
			if (host.contractId === "e10-archive-world") clarifyArchiveTerraces(nextTerrain, host.archiveRestoration);
			if (host.contractId === "e9-devils-alley") gradeTerrainByHeight(nextTerrain, "#9f8b6e", "#bba487", -.14, 4.57, .46);
			if (host.contractId === "e8-low-orbit") gradeTerrainByHeight(nextTerrain, "#777a76", "#a5a28e", -4.8, .7, .38);
			if (host.contractId === "e8-far-side") clarifyFarSideRegolith(nextTerrain);
			if (host.contractId === "e9-dome-basin" && selected.contract.maskTruth?.canalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.canalRoute.points);
			if (host.contractId === "e9-old-canal" && selected.contract.maskTruth?.inheritedCanalRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.inheritedCanalRoute.points);
			if (host.contractId === "e9-seed-run" && selected.contract.maskTruth?.caravanRoute) clarifyRedFieldsRoute(nextTerrain, selected.contract.maskTruth.caravanRoute, selected.contract.maskTruth.permanentGreenWaypointZones);
			if (host.contractId === "e6-glow-mesa") gradeTerrainByHeight(nextTerrain, "#9f8867", "#9b9682", 1.5, 4.6, .34);
			if (host.contractId === "e7-relay-rush") gradeTerrainByHeight(nextTerrain, "#898476", "#b2a482", .4, 4.6, .34);
			if (host.contractId === "e7-dead-band") gradeTerrainByHeight(nextTerrain, "#888474", "#b2ab92", .4, 4.6, .34);
			if (host.contractId === "e6-picnic") gradeTerrainByHeight(nextTerrain, "#9f8867", "#a1a483", 1.5, 4.6, .34);
			if (host.contractId === "e6-half-life-hollow") gradeTerrainByHeight(nextTerrain, "#897c68", "#b9a788", -1.9, 1.8, .32);
			if ((host.contractId === "e4-dust-flats" || host.contractId === "e4-long-road" || host.contractId === "e4-gusher-county" || host.contractId === "e4-boneyard") && selected.contract.maskTruth) clarifyMotorGround(nextTerrain, selected.contract.maskTruth, false, host.contractId === "e4-gusher-county" ? .3 : host.contractId === "e4-boneyard" ? .55 : .78);
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
			if (host.contractId === "e3-canyon-works") clarifyCanyonGround(nextPanorama, true);
			if (host.contractId === "e4-long-road" && selected.contract.maskTruth) clarifyMotorGround(nextPanorama, selected.contract.maskTruth, true);
			if (selected.contract.waterSurface?.owner === "runtime DeepwaterClaimTile") {
				host.canvas.dataset.terrain3dPilotSeaApronTriangles = String(routeSeaApron(nextTerrain, nextPanorama, terrainMetrics.bounds));
			}
			const nextSkirt = createContinuation(nextTerrain, nextPanorama, heightAt, terrainMetrics.bounds, host.contractId);
			if (host.contractId === "e10-ember-shore" && nextSkirt) clarifyEmberBasalt(nextSkirt);
			if (host.contractId === "e10-archive-world" && nextSkirt) clarifyArchiveTerraces(nextSkirt, host.archiveRestoration);
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
					if (host.archiveRestoration) installArchiveRestoration(model, host.archiveRestoration);
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

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsU0FBUyxpQ0FBK0Q7QUFDeEUsWUFBWSxXQUFXO0FBQ3ZCLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8sK0JBQStCO0FBQ3RDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sNEJBQTRCO0FBQ25DLE9BQU8sb0NBQW9DO0FBQzNDLE9BQU8sdUJBQXVCO0FBQzlCLE9BQU8sK0JBQStCO0FBQ3RDLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sbUNBQW1DO0FBQzFDLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8saUNBQWlDO0FBQ3hDLE9BQU8sK0JBQStCO0FBQ3RDLE9BQU8sdUNBQXVDO0FBQzlDLE9BQU8sNEJBQTRCO0FBQ25DLE9BQU8sb0NBQW9DO0FBQzNDLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sbUNBQW1DO0FBQzFDLE9BQU8sZ0NBQWdDO0FBQ3ZDLE9BQU8sd0NBQXdDO0FBQy9DLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sNkJBQTZCO0FBQ3BDLE9BQU8scUNBQXFDO0FBQzVDLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8sbUNBQW1DO0FBQzFDLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sbUNBQW1DO0FBQzFDLE9BQU8sNEJBQTRCO0FBQ25DLE9BQU8sb0NBQW9DO0FBQzNDLE9BQU8sOEJBQThCO0FBQ3JDLE9BQU8sc0NBQXNDO0FBQzdDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sNkJBQTZCO0FBQ3BDLE9BQU8scUNBQXFDO0FBQzVDLE9BQU8sNkJBQTZCO0FBQ3BDLE9BQU8scUNBQXFDO0FBQzVDLE9BQU8sNEJBQTRCO0FBQ25DLE9BQU8sb0NBQW9DO0FBQzNDLE9BQU8sOEJBQThCO0FBQ3JDLE9BQU8sc0NBQXNDO0FBQzdDLE9BQU8sMkJBQTJCO0FBQ2xDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sd0JBQXdCO0FBQy9CLE9BQU8sZ0NBQWdDO0FBQ3ZDLE9BQU8sd0NBQXdDO0FBQy9DLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8saUNBQWlDO0FBQ3hDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sNEJBQTRCO0FBQ25DLE9BQU8sb0NBQW9DO0FBQzNDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLE9BQU8sZ0NBQWdDO0FBQ3ZDLE9BQU8sd0NBQXdDO0FBQy9DLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8saUNBQWlDO0FBQ3hDLE9BQU8seUJBQXlCO0FBQ2hDLE9BQU8saUNBQWlDO0FBQ3hDLE9BQU8sMEJBQTBCO0FBQ2pDLE9BQU8sa0NBQWtDO0FBQ3pDLFNBQVMsa0NBQWtDO0FBQzNDLFNBQVMsNEJBQTRCO0FBQ3JDLFNBQVMscUJBQXFCLDJCQUEyQjtBQUN6RCxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLG9CQUFvQixxQkFBcUIscUJBQXFCLHlCQUF5QjtBQUNoRyxTQUFTLGdDQUFnQztBQUN6QyxTQUFTLGVBQWU7QUFFeEIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyx5QkFBeUI7QUFDbEMsWUFBWSxhQUFhO0FBQ3pCLFNBQVMseUJBQTJDO0FBQ3BELFNBQVMsc0JBQXFDO0FBQzlDLFNBQVMsd0JBQXlDO0FBQ2xELFNBQVMsdUJBQXNEO0FBQy9ELFNBQVMsMkJBQTJCLG9CQUFvQjtBQUN4RCxTQUFTLGtDQUE0RDtBQUNyRSxTQUFTLCtCQUF1RDtBQUNoRSxTQUFTLGlCQUFpQix1QkFBdUIsbUJBQW1CLDJCQUEyQjtBQUcvRixPQUFPLDJCQUEyQjtBQUNsQyxPQUFPLG1DQUFtQztBQXdFMUMsTUFBTSxTQUFTLFlBQW9CLGFBQXFCLGNBQXNCLHNCQUE4QixpQkFBaUM7Q0FDM0ksTUFBTSxXQUFXLEtBQUssTUFBTSxZQUFZOztDQUV4QyxJQUFJLGNBQWMsU0FBUyxpQkFBaUIsQ0FBQyxHQUFJLFNBQVMsa0JBQWtCLENBQUMsR0FBSSxHQUFLLEtBQUssTUFBTSxZQUFZLENBQUMsQ0FBYyxrQkFBa0IsQ0FBQyxDQUFFO0NBQ2pKLE9BQU87RUFBRTtFQUFZO0VBQWE7RUFBVSxrQkFBa0IsS0FBSyxNQUFNLG9CQUFvQjtDQUFzQjtBQUNySDtBQUNBLE1BQU0sV0FBa0M7Q0FDdEMsYUFBYSxNQUFNLElBQUksSUFBSSwrREFBK0QsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLG1CQUFtQix5QkFBeUI7Q0FDNVAsZ0JBQWdCLE1BQU0sSUFBSSxJQUFJLCtEQUErRCxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLGdFQUFnRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sc0JBQXNCLDRCQUE0QjtDQUNyUSxpQkFBaUIsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksaUVBQWlFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx1QkFBdUIsNkJBQTZCO0NBQzFRLGtCQUFrQixNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxrRUFBa0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHdCQUF3Qiw4QkFBOEI7Q0FDL1EsWUFBWSxNQUFNLElBQUksSUFBSSwyREFBMkQsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSw0REFBNEQsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLG1CQUFtQix5QkFBeUI7Q0FDblAsR0FBSSxvQkFBb0IsQ0FBQyxJQUFJO0VBQzdCLGdCQUFnQixNQUFNLElBQUksSUFBSSwrREFBK0QsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHNCQUFzQiw0QkFBNEI7RUFDclEsY0FBYyxNQUFNLElBQUksSUFBSSw2REFBNkQsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSw4REFBOEQsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHFCQUFxQiwyQkFBMkI7RUFDN1AscUJBQXFCLE1BQU0sSUFBSSxJQUFJLG9FQUFvRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLHFFQUFxRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sMkJBQTJCLGlDQUFpQztFQUM5UixpQkFBaUIsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksaUVBQWlFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx3QkFBd0IsOEJBQThCO0VBQzVRLGlCQUFpQixNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHVCQUF1Qiw2QkFBNkI7RUFDMVEsc0JBQXNCLE1BQU0sSUFBSSxJQUFJLHFFQUFxRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLHNFQUFzRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sNEJBQTRCLGtDQUFrQztFQUNuUyxnQkFBZ0IsTUFBTSxJQUFJLElBQUksK0RBQStELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxzQkFBc0IsNEJBQTRCO0VBQ3JRLG1CQUFtQixNQUFNLElBQUksSUFBSSxrRUFBa0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxtRUFBbUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHlCQUF5QiwrQkFBK0I7RUFDcFIsaUJBQWlCLE1BQU0sSUFBSSxJQUFJLGdFQUFnRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLGlFQUFpRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sdUJBQXVCLDZCQUE2QjtFQUMxUSxpQkFBaUIsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksaUVBQWlFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx1QkFBdUIsNkJBQTZCO0VBQzFRLG1CQUFtQixNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxrRUFBa0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHdCQUF3Qiw4QkFBOEI7RUFDaFIsc0JBQXNCLE1BQU0sSUFBSSxJQUFJLHFFQUFxRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLHNFQUFzRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sNEJBQTRCLGtDQUFrQztFQUNuUyxjQUFjLE1BQU0sSUFBSSxJQUFJLDZEQUE2RCxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLDhEQUE4RCxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0scUJBQXFCLDJCQUEyQjtFQUM3UCxtQkFBbUIsTUFBTSxJQUFJLElBQUksa0VBQWtFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksbUVBQW1FLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx5QkFBeUIsK0JBQStCO0VBQ3BSLGtCQUFrQixNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxrRUFBa0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHdCQUF3Qiw4QkFBOEI7RUFDL1EsZ0JBQWdCLE1BQU0sSUFBSSxJQUFJLCtEQUErRCxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLGdFQUFnRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sc0JBQXNCLDRCQUE0QjtFQUNyUSxvQkFBb0IsTUFBTSxJQUFJLElBQUksbUVBQW1FLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksb0VBQW9FLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSwwQkFBMEIsZ0NBQWdDO0VBQ3pSLGVBQWUsTUFBTSxJQUFJLElBQUksOERBQThELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksK0RBQStELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxzQkFBc0IsNEJBQTRCO0VBQ2xRLGNBQWMsTUFBTSxJQUFJLElBQUksNkRBQTZELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksOERBQThELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxxQkFBcUIsMkJBQTJCOztFQUU3UCxpQkFBaUIsTUFBTSxJQUFJLElBQUkscUVBQXFFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksc0VBQXNFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSw0QkFBNEIsa0NBQWtDO0VBQzlSLGVBQWUsTUFBTSxJQUFJLElBQUkscUVBQXFFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksc0VBQXNFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSw0QkFBNEIsa0NBQWtDO0VBQzVSLGVBQWUsTUFBTSxJQUFJLElBQUksOERBQThELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksK0RBQStELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxzQkFBc0IsNEJBQTRCO0VBQ2xRLHVCQUF1QixNQUFNLElBQUksSUFBSSxzRUFBc0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSx1RUFBdUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLDRCQUE0QixrQ0FBa0M7O0VBRXRTLGFBQWEsTUFBTSxJQUFJLElBQUksK0RBQStELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxzQkFBc0IsOEJBQThCLGtCQUFrQjtFQUN0UixrQkFBa0IsTUFBTSxJQUFJLElBQUksaUVBQWlFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksa0VBQWtFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx3QkFBd0IsOEJBQThCOztFQUUvUSxnQkFBZ0IsTUFBTSxJQUFJLElBQUksa0VBQWtFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksbUVBQW1FLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx5QkFBeUIsaUNBQWlDLG9CQUFvQjtFQUN2UyxpQkFBaUIsTUFBTSxJQUFJLElBQUksa0VBQWtFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksbUVBQW1FLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSx5QkFBeUIsaUNBQWlDLHFCQUFxQjs7RUFFelMsZUFBZSxNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHVCQUF1QiwrQkFBK0IsbUJBQW1CO0VBQzdSLGdCQUFnQixNQUFNLElBQUksSUFBSSwrREFBK0QsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssVUFBVTtHQUFFLEdBQUcsS0FBSyxNQUFNLG9CQUFvQjtHQUFHLGNBQWM7SUFBRSxLQUFLO0tBQUMsQ0FBQztLQUFJLENBQUM7S0FBSSxDQUFDO0lBQVE7SUFBRyxLQUFLO0tBQUM7S0FBSTtLQUFJO0lBQUk7R0FBRTtFQUFFLENBQUMsR0FBRyw0QkFBNEI7RUFDM1csY0FBYyxNQUFNLElBQUksSUFBSSxnRUFBZ0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxpRUFBaUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLHVCQUF1Qiw2QkFBNkI7RUFDdlEsZUFBZSxNQUFNLElBQUksSUFBSSw4REFBOEQsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSwrREFBK0QsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssVUFBVTtHQUFFLEdBQUcsS0FBSyxNQUFNLG1CQUFtQjtHQUFHLGNBQWM7SUFBRSxLQUFLO0tBQUMsQ0FBQztLQUFJLENBQUM7S0FBSSxDQUFDO0lBQUk7SUFBRyxLQUFLO0tBQUM7S0FBSTtLQUFJO0lBQVE7R0FBRTtFQUFFLENBQUMsR0FBRywyQkFBMkI7RUFDdFcsbUJBQW1CLE1BQU0sSUFBSSxJQUFJLGtFQUFrRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLG1FQUFtRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxVQUFVO0dBQUUsR0FBRyxLQUFLLE1BQU0sdUJBQXVCO0dBQUcsY0FBYztJQUFFLEtBQUs7S0FBQyxDQUFDO0tBQUksQ0FBQztLQUFJLENBQUM7SUFBSTtJQUFHLEtBQUs7S0FBQztLQUFJO0tBQUk7SUFBUTtHQUFFO0VBQUUsQ0FBQyxHQUFHLCtCQUErQjtFQUMxWCxnQkFBZ0IsTUFBTSxJQUFJLElBQUksK0RBQStELFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksZ0VBQWdFLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLFVBQVU7R0FBRSxHQUFHLEtBQUssTUFBTSxvQkFBb0I7R0FBRyxjQUFjO0lBQUUsS0FBSztLQUFDLENBQUM7S0FBSSxDQUFDO0tBQUksQ0FBQztJQUFJO0lBQUcsS0FBSztLQUFDO0tBQUk7S0FBSTtJQUFRO0dBQUU7RUFBRSxDQUFDLEdBQUcsNEJBQTRCO0VBQzNXLHFCQUFxQixNQUFNLElBQUksSUFBSSxtRUFBbUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxvRUFBb0UsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLDBCQUEwQixnQ0FBZ0M7RUFDMVIsa0JBQWtCLE1BQU0sSUFBSSxJQUFJLGdFQUFnRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLGlFQUFpRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sdUJBQXVCLDZCQUE2QjtDQUMzUTtBQUNGO0FBQ0EsTUFBTSxrQkFBa0IsWUFBWSxLQUFLLENBQ3ZDLDREQUVBLG1DQUNGLEdBQUc7Q0FBRSxPQUFPO0NBQVEsUUFBUTtBQUFVLENBQUM7QUFFdkMsU0FBUyxpQkFBaUIsT0FBdUI7Q0FDL0MsT0FBTyxNQUFNLFdBQVcsU0FBUyxJQUFJLFNBQVMsVUFBVSx5Q0FBeUM7QUFDbkc7QUFFQSxTQUFTLGtCQUFrQixVQUFvQixZQUFxQztDQUNsRixRQUFRLFNBQVMsa0JBQWtCLENBQUMsRUFBQyxDQUFFLFFBQU8sVUFBUyxNQUFNLFVBQVUsQ0FBQyxNQUFNLGVBQWUsTUFBTSxZQUFZLFNBQVMsVUFBVSxFQUFFO0FBQ3RJO0FBRUEsT0FBTyxlQUFlLHFCQUFxQixZQUF1QztDQUNoRixNQUFNLFdBQVcsU0FBUztDQUMxQixJQUFJLENBQUMsVUFBVSxPQUFPLENBQUM7Q0FDdkIsTUFBTSxZQUFZLE1BQU0sUUFBUSxJQUM5QixrQkFBa0IsU0FBUyxVQUFVLFVBQVUsQ0FBQyxDQUM3QyxTQUFTLEVBQUUsWUFBWSxRQUFRLENBQUMsZ0JBQWdCLGlCQUFpQixLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvRSxRQUFRLGVBQW9ELENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FDekUsS0FBSyxlQUFlLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQ3JEO0NBQ0EsT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJO0VBQUMsU0FBUztFQUFZLFNBQVM7RUFBYSxHQUFHLFVBQVUsT0FBTyxPQUFPO0NBQUMsQ0FBQyxDQUFDO0FBQy9GO0FBbUJBLE1BQU0seUJBT0QsRUFDSCxpQkFBaUI7Q0FDZixhQUFhOzs7Q0FHYixXQUFXO0NBQ1gsS0FBSztFQUFFLFlBQVk7RUFBTSxhQUFhO0NBQU07Q0FDNUMsYUFBYSxDQUNYLEVBQUUsUUFBUTtFQUNSO0dBQUUsR0FBRyxDQUFDO0dBQUksR0FBRztHQUFHLFdBQVc7R0FBSyxPQUFPO0VBQUU7RUFDekM7R0FBRSxHQUFHLENBQUM7R0FBSSxHQUFHO0dBQUcsV0FBVztHQUFNLE9BQU87RUFBSztFQUM3QztHQUFFLEdBQUcsQ0FBQztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQUssT0FBTztFQUFFO0VBQzNDO0dBQUUsR0FBRyxDQUFDO0dBQUksR0FBRztHQUFHLFdBQVc7R0FBSyxPQUFPO0VBQUU7RUFDekM7R0FBRSxHQUFHLENBQUM7R0FBTSxHQUFHO0dBQUcsV0FBVztHQUFNLE9BQU87RUFBRTtFQUM1QztHQUFFLEdBQUcsQ0FBQztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQU0sT0FBTztFQUFLO0VBQy9DO0dBQUUsR0FBRyxDQUFDO0dBQU0sR0FBRztHQUFHLFdBQVc7R0FBSyxPQUFPO0VBQUU7Q0FDN0MsRUFBRSxHQUNGLEVBQUUsUUFBUTtFQUNSO0dBQUUsR0FBRztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQUssT0FBTztFQUFFO0VBQzFDO0dBQUUsR0FBRztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQU0sT0FBTztFQUFLO0VBQzlDO0dBQUUsR0FBRztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQU0sT0FBTztFQUFFO0VBQzNDO0dBQUUsR0FBRztHQUFJLEdBQUc7R0FBRyxXQUFXO0dBQUssT0FBTztFQUFFO0VBQ3hDO0dBQUUsR0FBRztHQUFNLEdBQUc7R0FBRyxXQUFXO0dBQUssT0FBTztFQUFFO0VBQzFDO0dBQUUsR0FBRztHQUFJLEdBQUc7R0FBRyxXQUFXO0dBQU0sT0FBTztFQUFLO0VBQzVDO0dBQUUsR0FBRztHQUFJLEdBQUc7R0FBRyxXQUFXO0dBQUssT0FBTztFQUFFO0NBQzFDLEVBQUUsQ0FDSjs7Q0FFQSxXQUFXO0NBQ1gsVUFBVTs7Ozs7RUFLUixpQkFBaUI7R0FDZixPQUFPO0dBQ1AsUUFBUTtJQUFDO0tBQUUsR0FBRyxDQUFDO0tBQU0sR0FBRztJQUFLO0lBQUc7S0FBRSxHQUFHLENBQUM7S0FBSyxHQUFHO0lBQUs7SUFBRztLQUFFLEdBQUc7S0FBSyxHQUFHO0lBQUs7SUFBRztLQUFFLEdBQUc7S0FBTSxHQUFHO0lBQUs7R0FBQztHQUMvRixXQUFXO0dBQ1gsV0FBVztHQUNYLFVBQVU7R0FDVixVQUFVO0VBQ1o7RUFDQSxpQkFBaUI7R0FBRSxPQUFPO0dBQVcsV0FBVztHQUFLLFdBQVc7R0FBSyxVQUFVO0dBQUcsVUFBVTtFQUFFO0NBQ2hHO0FBQ0YsRUFDRjtBQVdBLE1BQU0sNkJBQStFLEVBQ25GLGlCQUFpQjtDQUNmLHNCQUFzQjtFQUFFLFVBQVU7R0FBQztHQUFNO0dBQU07RUFBSTtFQUFHLE1BQU07R0FBRSxTQUFTO0dBQU0sS0FBSztHQUFNLE9BQU87R0FBTSxRQUFRO0VBQUs7Q0FBRTtDQUNwSCxrQkFBa0IsRUFBRSxVQUFVO0VBQUM7RUFBTTtFQUFNO0NBQUksRUFBRTtDQUNqRCxzQkFBc0IsRUFBRSxVQUFVO0VBQUM7RUFBTTtFQUFNO0NBQUksRUFBRTtDQUNyRCxrQkFBa0IsRUFBRSxVQUFVO0VBQUM7RUFBTTtFQUFNO0NBQUksRUFBRTtBQUNuRCxFQUNGOzs7QUFHQSxNQUFNLGNBQWM7QUFFcEIsTUFBTSxpQkFBaUI7QUFDdkIsTUFBTSw0QkFBNEI7QUFDbEMsTUFBTSxzQkFBc0IsSUFBSSxJQUFJO0NBQUM7Q0FBZ0I7Q0FBaUI7QUFBYyxDQUFDO0FBQ3JGLE1BQU0sd0JBQXdCO0FBdUQ5QixNQUFNLHdCQUE2RDs7O0NBR2pFLGFBQWE7RUFDWCxTQUFTO0dBQUUsTUFBTTtHQUFnQixNQUFNO0VBQUs7RUFDNUMsT0FBTztFQUNQLFVBQVU7RUFDVixTQUFTOzs7RUFHVCxVQUFVO0VBQ1YsWUFBWTtFQUNaLGFBQWE7RUFDYixRQUFRO0NBQ1Y7Ozs7Q0FJQSxrQkFBa0I7RUFDaEIsU0FBUztHQUFFLE1BQU07R0FBZ0IsTUFBTTtFQUFLO0VBQUcsT0FBTztFQUFXLFNBQVM7RUFDMUUsVUFBVTtFQUFNLFlBQVk7RUFBSyxhQUFhO0VBQzlDLFFBQVEsQ0FBQztFQUFHLGdCQUFnQjtFQUFNLGNBQWM7RUFBTSxVQUFVO0NBQ2xFOzs7Q0FHQSxZQUFZO0VBQ1YsU0FBUztHQUFFLE1BQU07R0FBZ0IsTUFBTTtFQUFLO0VBQUcsT0FBTztFQUFXLFNBQVM7RUFDMUUsVUFBVTtFQUFNLFlBQVk7RUFBSyxhQUFhO0VBQU0saUJBQWlCO0VBQ3JFLFFBQVEsQ0FBQztFQUFHLGdCQUFnQjtFQUFLLGNBQWM7RUFBTSxVQUFVO0NBQ2pFOzs7Ozs7Ozs7Ozs7OztDQWNBLGdCQUFnQjtFQUFFLFNBQVM7R0FBRSxNQUFNO0dBQWdCLE1BQU07RUFBSztFQUFHLE9BQU87RUFBVyxTQUFTO0VBQU0sVUFBVTtFQUFNLFlBQVk7RUFBTSxhQUFhO0VBQU0saUJBQWlCO0VBQUssUUFBUTtHQUFDO0lBQUUsR0FBRyxDQUFDO0lBQUksR0FBRyxDQUFDO0dBQUk7R0FBRztJQUFFLEdBQUc7SUFBSSxHQUFHO0dBQUk7R0FBRztJQUFFLEdBQUc7SUFBSSxHQUFHLENBQUM7R0FBSTtFQUFDO0VBQUcsZ0JBQWdCO0VBQU0sY0FBYztDQUFHO0NBQzFSLGNBQWM7RUFBRSxTQUFTO0dBQUUsTUFBTTtHQUFxQixVQUFVO0dBQUssTUFBTTtFQUFNO0VBQUcsT0FBTztFQUFXLFNBQVM7RUFBTSxVQUFVO0VBQU0sWUFBWTtFQUFNLGFBQWE7RUFBTSxRQUFRLENBQUM7R0FBRSxHQUFHLENBQUM7R0FBTSxHQUFHLENBQUM7RUFBSSxHQUFHO0dBQUUsR0FBRyxDQUFDO0dBQUssR0FBRyxDQUFDO0VBQUksQ0FBQztFQUFHLGdCQUFnQjtFQUFLLGNBQWM7Q0FBTTtDQUMxUSxzQkFBc0I7RUFBRSxTQUFTO0dBQUUsTUFBTTtHQUFnQixNQUFNO0VBQUs7RUFBRyxPQUFPO0VBQVcsU0FBUztFQUFNLFVBQVU7RUFBTSxZQUFZO0VBQUssYUFBYTtFQUFNLEtBQUs7RUFBTyxpQkFBaUI7RUFBTSxRQUFRO0dBQUM7SUFBRSxHQUFHLENBQUM7SUFBSSxHQUFHO0dBQUs7R0FBRztJQUFFLEdBQUcsQ0FBQztJQUFJLEdBQUc7R0FBSztHQUFHO0lBQUUsR0FBRztJQUFJLEdBQUc7R0FBSztHQUFHO0lBQUUsR0FBRztJQUFJLEdBQUc7R0FBSztFQUFDO0VBQUcsZ0JBQWdCO0VBQUssYUFBYTtFQUFLLGNBQWM7RUFBRyxVQUFVO0VBQU0saUJBQWlCO0VBQUcsYUFBYTtFQUFNLGdCQUFnQjtFQUFJLFNBQVMsQ0FBQztHQUFFLE9BQU87R0FBNEIsUUFBUTtFQUFJLEdBQUc7R0FBRSxPQUFPO0dBQTJCLFFBQVE7RUFBSSxDQUFDO0NBQUc7Q0FDaGhCLGNBQWM7RUFBRSxTQUFTO0dBQUUsTUFBTTtHQUFnQixNQUFNO0VBQUs7RUFBRyxPQUFPO0VBQVcsU0FBUztFQUFNLFVBQVU7RUFBTyxZQUFZO0VBQU8sYUFBYTtFQUFNLGlCQUFpQjtFQUFNLFFBQVEsQ0FBQztHQUFFLEdBQUcsQ0FBQztHQUFJLEdBQUc7RUFBSyxHQUFHO0dBQUUsR0FBRztHQUFJLEdBQUcsQ0FBQztFQUFLLENBQUM7RUFBRyxnQkFBZ0I7RUFBSyxjQUFjO0NBQUs7QUFDNVE7O0FBRUEsTUFBTSx5QkFBOEM7Q0FDbEQsU0FBUztFQUFFLE1BQU07RUFBYSxHQUFHO0NBQUU7Q0FBRyxPQUFPO0NBQVcsU0FBUztDQUNqRSxVQUFVO0NBQUcsWUFBWTtDQUFHLGFBQWE7Q0FBSyxRQUFRLENBQUM7Q0FDdkQsZ0JBQWdCO0NBQU0sY0FBYztDQUFNLFVBQVU7Q0FBRyxpQkFBaUI7Q0FBRyxhQUFhO0NBQ3hGLFVBQVU7QUFDWjs7QUFFQSxNQUFNLHlCQUF5Qjs7QUFFL0IsTUFBTSw2QkFBNkIsSUFBSSxJQUFJO0NBQUM7Q0FBYTtDQUFnQjtDQUFjO0NBQXNCO0FBQVksQ0FBQztBQUUxSCxNQUFNLHdCQUE0RCxFQUNoRSxjQUFjO0NBQUUsU0FBUztDQUFvQixZQUFZO0NBQU0sYUFBYTtDQUFNLE9BQU87Q0FBTSxTQUFTO0NBQU0sT0FBTztBQUFVLEVBQ2pJO0FBQ0EsTUFBTSxtQkFBbUI7QUFDekIsTUFBTSx3QkFBd0I7QUFDOUIsTUFBTSxtQkFBbUI7QUFZekIsTUFBTSxZQUE2QztDQUNqRCxhQUFhO0VBQUUsT0FBTztFQUFXLE9BQU87RUFBSSxTQUFTO0VBQUcsTUFBTTtFQUFLLE1BQU07RUFBSyxNQUFNO0VBQUssTUFBTTtDQUFPO0NBQ3RHLGdCQUFnQjtFQUFFLE9BQU87RUFBVyxPQUFPO0VBQUksU0FBUztFQUFHLE1BQU07RUFBSyxNQUFNO0VBQUssTUFBTTtFQUFLLE1BQU07Q0FBTztDQUN6RyxjQUFjO0VBQUUsT0FBTztFQUFXLE9BQU87RUFBSSxTQUFTO0VBQUcsTUFBTTtFQUFLLE1BQU07RUFBSyxNQUFNO0VBQUssTUFBTTtDQUFPO0NBQ3ZHLHNCQUFzQjtFQUFFLE9BQU87RUFBVyxPQUFPO0VBQUksU0FBUztFQUFJLE1BQU07RUFBSyxNQUFNO0VBQUssTUFBTTtFQUFLLE1BQU07Q0FBTztDQUNoSCxjQUFjO0VBQUUsT0FBTztFQUFXLE9BQU87RUFBSSxTQUFTO0VBQUksTUFBTTtFQUFLLE1BQU07RUFBSyxNQUFNO0VBQUssTUFBTTtFQUFRLFlBQVk7Q0FBSztBQUM1SDs7QUFFQSxNQUFNLHVCQUF1QixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDbEQsTUFBTSxlQUFlO0FBMEJyQixNQUFNLGdCQUF3RCxFQUM1RCxnQkFBZ0IsQ0FBRTtDQUFFLE9BQU87Q0FBcUIsU0FBUztDQUFPLFNBQVM7Q0FBTyxLQUFLO0NBQUssTUFBTTtDQUFLLFFBQVE7Q0FBSyxNQUFNO0NBQUksTUFBTTtDQUFLLE9BQU87Q0FBSSxTQUFTO0FBQUksR0FBRztDQUFFLE9BQU87Q0FBbUMsU0FBUztDQUFLLFNBQVM7Q0FBTSxLQUFLO0NBQUssTUFBTTtDQUFLLFFBQVE7Q0FBSyxNQUFNO0NBQUksTUFBTTtDQUFLLE9BQU87Q0FBSSxTQUFTO0FBQUksQ0FBRyxFQUMvVDtBQUtBLE1BQU0sNEJBQW9FLEVBQ3hFLGNBQWM7Q0FBRSxPQUFPO0VBQUUsT0FBTztFQUFHLE9BQU87RUFBSSxPQUFPO0VBQUcsTUFBTTtFQUFLLE1BQU07RUFBSSxNQUFNO0VBQU0sT0FBTztDQUFVO0NBQUcsT0FBTztFQUFFLE9BQU87RUFBSSxRQUFRO0VBQUssUUFBUTtFQUFLLE1BQU07RUFBSSxNQUFNO0VBQU0sT0FBTztDQUFVO0FBQUUsRUFDdE07QUFDQSxNQUFNLDhCQUE4Qjs7QUFHcEMsTUFBTSxlQUFlOztBQUVyQixNQUFNLG1CQUFtQjs7QUFFekIsTUFBTSwwQkFBMEI7O0FBRWhDLE1BQU0seUJBQXlCO0FBQy9CLE1BQU0seUJBQXlCO0FBRS9CLFNBQVMsUUFBUSxRQUEyQixPQUFnRCxRQUEyQixTQUFtQixVQUEyQixpQkFBMkIsZ0JBQStCO0NBQzdOLE9BQU8sUUFBUSxzQkFBc0I7Q0FDckMsT0FBTyxRQUFRLDZCQUE2QjtDQUM1QyxPQUFPLFFBQVEsNkJBQTZCLFdBQVcsUUFBUSxlQUFlO0NBQzlFLE9BQU8sUUFBUSx1QkFBdUIsT0FBTyxTQUFTLFVBQVUsQ0FBQztDQUNqRSxPQUFPLFFBQVEsMEJBQTBCLE9BQU8sU0FBUyxhQUFhLENBQUM7Q0FDdkUsT0FBTyxRQUFRLDBCQUEwQixPQUFPLFNBQVMsYUFBYSxDQUFDO0NBQ3ZFLE9BQU8sUUFBUSx5QkFBeUIsT0FBTyxTQUFTLFlBQVksQ0FBQztDQUNyRSxPQUFPLFFBQVEseUJBQXlCLFVBQVUsUUFBUTtDQUMxRCxPQUFPLFFBQVEsK0JBQStCLE9BQU8saUJBQWlCLFVBQVUsQ0FBQztDQUNqRixPQUFPLFFBQVEsa0NBQWtDLE9BQU8saUJBQWlCLGFBQWEsQ0FBQztDQUN2RixPQUFPLFFBQVEsa0NBQWtDLE9BQU8saUJBQWlCLGFBQWEsQ0FBQztDQUN2RixPQUFPLFFBQVEsaUNBQWlDLE9BQU8saUJBQWlCLFlBQVksQ0FBQztDQUNyRixJQUFJLGdCQUFnQixxQkFBcUIsUUFBUSxjQUFjO0FBQ2pFO0FBRUEsU0FBUyxRQUFRLE9BQXVCLGVBQWlDO0NBQ3ZFLElBQUksU0FBUztDQUNiLElBQUksWUFBWTtDQUNoQixJQUFJLFdBQVc7Q0FDZixNQUFNLFlBQVksSUFBSSxJQUFvQjtDQUMxQyxNQUFNLFVBQVUsU0FBUztFQUN2QixNQUFNLE9BQU87RUFDYixJQUFJLENBQUMsS0FBSyxRQUFRO0VBQ2xCLFVBQVU7RUFDVixNQUFNLFdBQVcsS0FBSyxTQUFTLGFBQWEsVUFBVTtFQUN0RCxNQUFNLGlCQUFpQixJQUFJLElBQVk7RUFDdkMsS0FBSyxJQUFJLFFBQVEsR0FBRyxTQUFTLFVBQVUsU0FBUyxJQUFJLFNBQVMsR0FBRztHQUM5RCxlQUFlLElBQUksR0FBRyxTQUFVLEtBQUssS0FBSyxFQUFFLEdBQUcsU0FBVSxLQUFLLEtBQUssRUFBRSxHQUFHLFNBQVUsS0FBSyxLQUFLLEdBQUc7RUFDakc7RUFDQSxZQUFZLGVBQWU7RUFDM0IsYUFBYSxLQUFLLE9BQU8sS0FBSyxTQUFTLE9BQU8sU0FBUyxVQUFVLFNBQVMsS0FBSyxDQUFDO0VBQ2hGLEtBQUssTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsSUFBSSxLQUFLLFdBQVcsQ0FBQyxLQUFLLFFBQVEsR0FBRyxVQUFVLElBQUksUUFBUTtFQUM3RyxLQUFLLGFBQWE7RUFDbEIsS0FBSyxnQkFBZ0I7Q0FDdkIsQ0FBQztDQUNELE9BQU87RUFBRTtFQUFRO0VBQVcsV0FBVyxVQUFVO0VBQU07RUFBVSxRQUFRLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxjQUFjLEtBQUs7Q0FBRTtBQUNqSDtBQUVBLFNBQVMsYUFBYSxTQUFrQixVQUE2QjtDQUNuRSxNQUFNLEVBQUUsS0FBSyxRQUFRLFFBQVE7Q0FDN0IsTUFBTSxDQUFDLE1BQU0sTUFBTSxRQUFRLFNBQVMsYUFBYTtDQUNqRCxNQUFNLENBQUMsTUFBTSxNQUFNLFFBQVEsU0FBUyxhQUFhO0NBQ2pELE9BQU8sUUFBUSxXQUFXLFNBQVMsYUFBYSxRQUFRLGNBQWMsU0FBUyxhQUFhLFFBQVEsY0FBYyxTQUFTLGlCQUN6SCxRQUFRLGFBQWEsU0FBUyxZQUFZLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLGtCQUFrQixLQUFLLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxrQkFDaEgsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssa0JBQWtCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLGtCQUN0RSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxrQkFBa0IsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUs7QUFDMUU7QUFFQSxTQUFTLGNBQWMsU0FBa0IsVUFBNEIsT0FBdUI7Q0FDMUYsT0FBTyxTQUFTLGNBQWMsTUFBTSxjQUFjLFFBQVEsV0FBVyxTQUFTLGFBQWEsUUFBUSxjQUFjLFNBQVMsYUFDeEgsUUFBUSxjQUFjLFNBQVMsaUJBQWlCLFFBQVEsYUFBYSxTQUFTO0FBQ2xGOzs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLE9BQU8sU0FBUyxlQUFlLE9BQXVCLFNBQW9EO0NBQ3hHLE1BQU0sT0FBTyxNQUFNLG9CQUFvQixVQUFVLElBQUk7Q0FDckQsTUFBTSxXQUFXLEtBQUssU0FBUyxhQUFhLFVBQVU7Q0FDdEQsTUFBTSxXQUFXLEtBQUssTUFBTSxLQUFLLEtBQUssU0FBUyxLQUFLLENBQUMsSUFBSTtDQUN6RCxNQUFNLFFBQVEsV0FBVztDQUN6QixNQUFNLFNBQVMsUUFBUSxPQUFPLElBQUksSUFBSSxRQUFRLE9BQU8sSUFBSSxLQUFLO0NBQzlELE1BQU0sU0FBUyxRQUFRLE9BQU8sSUFBSSxJQUFJLFFBQVEsT0FBTyxJQUFJLEtBQUs7Q0FDOUQsTUFBTSxVQUFVLElBQUksYUFBYSxRQUFRLEtBQUs7Q0FDOUMsTUFBTSxPQUFPLElBQUksV0FBVyxRQUFRLE1BQU07Q0FDMUMsTUFBTSxVQUFVLElBQUksV0FBVyxTQUFTLEtBQUs7Q0FDN0MsTUFBTSxPQUFPLElBQUksV0FBVyxTQUFTLEtBQUs7Q0FDMUMsTUFBTSxRQUFRLElBQUksTUFBTSxRQUFRO0NBQ2hDLE1BQU0sa0JBQWtCLElBQUk7Q0FDNUIsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLFNBQVMsT0FBTyxTQUFTLEdBQUc7RUFDdEQsTUFBTSxvQkFBb0IsVUFBbUMsS0FBSztFQUNsRSxLQUFLLGFBQWEsS0FBSztFQUN2QixNQUFNLFNBQVMsS0FBSyxPQUFPLE1BQU0sSUFBSSxRQUFRLE9BQU8sSUFBSSxLQUFLLEtBQUs7RUFDbEUsTUFBTSxNQUFNLEtBQUssT0FBTyxNQUFNLElBQUksUUFBUSxPQUFPLElBQUksS0FBSyxLQUFLO0VBQy9ELE1BQU0sT0FBTyxNQUFNLFFBQVE7RUFDM0IsSUFBSSxTQUFTLEtBQUssU0FBUyxZQUFZLE1BQU0sS0FBSyxNQUFNLFlBQVksS0FBSyxPQUFPLE1BQU0sSUFBSSxNQUFNLHNCQUFzQjtFQUN0SCxRQUFRLFFBQVEsTUFBTTtFQUN0QixLQUFLLFFBQVE7RUFDYixRQUFRLFNBQVM7RUFDakIsS0FBSyxTQUFTO0NBQ2hCO0NBQ0EsSUFBSSxLQUFLLE1BQU0sVUFBVSxVQUFVLENBQUMsR0FBRyxNQUFNLElBQUksTUFBTSx5QkFBeUI7O0NBRWhGLE1BQU0sWUFBWSxJQUFJLFdBQVcsS0FBSyxJQUFJLFdBQVcsVUFBVSxDQUFDLENBQUM7Q0FDakUsTUFBTSxRQUFRLElBQUksV0FBVyxVQUFVLE1BQU07Q0FDN0MsTUFBTSxVQUFVLEtBQUssU0FBUztDQUM5QixNQUFNLGdCQUFnQixLQUFLLE9BQU8sU0FBUyxTQUFTLFNBQVMsU0FBUyxDQUFDO0NBQ3ZFLEtBQUssSUFBSSxXQUFXLEdBQUcsV0FBVyxlQUFlLFlBQVksR0FBRztFQUM5RCxNQUFNLElBQUksVUFBVSxRQUFRLEtBQUssV0FBVyxDQUFDLElBQUksV0FBVztFQUM1RCxNQUFNLElBQUksVUFBVSxRQUFRLEtBQUssV0FBVyxJQUFJLENBQUMsSUFBSSxXQUFXLElBQUk7RUFDcEUsTUFBTSxJQUFJLFVBQVUsUUFBUSxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksV0FBVyxJQUFJO0VBQ3BFLE1BQU0sVUFBVSxRQUFRLElBQUssVUFBVSxRQUFRLElBQUssVUFBVSxRQUFRO0VBQ3RFLE1BQU0sT0FBTyxLQUFLLElBQUssT0FBTyxLQUFLLElBQUssT0FBTyxLQUFLO0VBQ3BELE1BQU0sU0FBUyxLQUFLLElBQUksU0FBUyxTQUFTLE9BQU87RUFDakQsTUFBTSxNQUFNLEtBQUssSUFBSSxNQUFNLE1BQU0sSUFBSTtFQUNyQyxJQUFJLEtBQUssSUFBSSxTQUFTLFNBQVMsT0FBTyxJQUFJLFdBQVcsS0FBSyxLQUFLLElBQUksTUFBTSxNQUFNLElBQUksSUFBSSxRQUFRLEdBQUc7R0FDaEcsTUFBTSxJQUFJLE1BQU0sMEJBQTBCO0VBQzVDOzs7RUFHQSxNQUFNLE9BQVEsTUFBTyxPQUFPLE9BQU8sSUFBSSxVQUFVLFNBQzVDLE1BQU8sT0FBTyxPQUFPLElBQUksVUFBVSxTQUNuQyxNQUFPLE9BQU8sT0FBTyxJQUFJLFVBQVU7RUFDeEMsTUFBTSxXQUFXLFNBQVMsTUFBVSxTQUFTLEtBQVMsSUFBSSxTQUFTLE1BQVUsU0FBUyxJQUFTLElBQUksQ0FBQztFQUNwRyxNQUFNLE9BQU8sTUFBTSxXQUFXO0VBQzlCLElBQUksV0FBVyxLQUFNLE1BQU0sU0FBUyxVQUFVLFVBQVUsVUFBVyxNQUFNLElBQUksTUFBTSwwQkFBMEI7RUFDN0csVUFBVSxRQUFRO0VBQ2xCLE1BQU0sU0FBVTtDQUNsQjtDQUNBLElBQUksV0FBVyxLQUFLLE1BQU0sTUFBTSxVQUFVLFVBQVUsQ0FBQyxHQUFHLE1BQU0sSUFBSSxNQUFNLDZCQUE2QjtDQUNyRyxNQUFNLFdBQVcsS0FBSyxJQUFJLFdBQVcsR0FBRyxDQUFDO0NBQ3pDLFFBQVEsR0FBRyxNQUFNO0VBQ2YsTUFBTSxLQUFLLE1BQU0sVUFBVSxPQUFPLElBQUksUUFBUSxPQUFPLElBQUksS0FBSyxPQUFPLEdBQUcsUUFBUTtFQUNoRixNQUFNLEtBQUssTUFBTSxVQUFVLE9BQU8sSUFBSSxRQUFRLE9BQU8sSUFBSSxLQUFLLE9BQU8sR0FBRyxRQUFRO0VBQ2hGLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxNQUFNLEVBQUUsR0FBRyxRQUFRO0VBQzVDLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxNQUFNLEVBQUUsR0FBRyxRQUFRO0VBQzVDLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxHQUFHLFFBQVE7RUFDcEMsTUFBTSxLQUFLLEtBQUssSUFBSSxLQUFLLEdBQUcsUUFBUTtFQUNwQyxNQUFNLEtBQUssS0FBSztFQUNoQixNQUFNLEtBQUssS0FBSztFQUNoQixNQUFNLE1BQU0sUUFBUSxLQUFLLFFBQVE7RUFDakMsTUFBTSxPQUFPLFFBQVEsS0FBSyxRQUFRO0VBQ2xDLE1BQU0sUUFBUSxRQUFRLEtBQUssUUFBUTtFQUNuQyxNQUFNLE9BQU8sUUFBUSxLQUFLLFFBQVE7OztFQUdsQyxJQUFJLFVBQVUsS0FBSyxXQUFXLFFBQVEsR0FBRztHQUN2QyxPQUFPLE1BQU0sS0FBSyxPQUFPLE9BQU8sT0FBTyxNQUFNLE9BQU8sUUFBUSxLQUFLLE9BQU8sT0FBTyxTQUFTLE1BQU0sUUFBUSxPQUFPO0VBQy9HO0VBQ0EsT0FBTyxLQUFLLE1BQU0sSUFBSSxPQUFPLE9BQU8sT0FBTyxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsT0FBTyxVQUFVLEtBQUssTUFBTSxPQUFPLFNBQVMsS0FBSztDQUNoSTtBQUNGOztBQUdBLFNBQVMsY0FBYyxTQUF5QixVQUEwQixRQUE0QjtDQUNwRyxJQUFJO0NBQ0osUUFBUSxVQUFTLFdBQVU7RUFDekIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLFFBQVEsS0FBSyxRQUFRLEtBQU0sS0FBSyxTQUF3QyxLQUFLO0dBQ3JHLFNBQVMsS0FBSztFQUNoQjtDQUNGLENBQUM7Q0FDRCxJQUFJLENBQUMsUUFBUSxLQUFLLE9BQU87Q0FDekIsSUFBSSxZQUFZO0NBQ2hCLFNBQVMsVUFBUyxXQUFVO0VBQzFCLE1BQU0sT0FBTztFQUNiLElBQUksQ0FBQyxLQUFLLFVBQVUsTUFBTSxRQUFRLEtBQUssUUFBUSxHQUFHO0VBQ2xELE1BQU0sV0FBVyxLQUFLO0VBQ3RCLE1BQU0sV0FBVyxTQUFTLGFBQWEsVUFBVSxHQUFHLEtBQUssU0FBUyxhQUFhLElBQUk7RUFDbkYsSUFBSSxDQUFDLFNBQVMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJO0VBQ3pDLE1BQU0sTUFBZ0IsQ0FBQyxHQUFHLE1BQWdCLENBQUMsR0FBRyxhQUF1QixDQUFDLEdBQUcsY0FBYyxJQUFJLElBQVk7RUFDdkcsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLFNBQVMsTUFBTSxPQUFPLEtBQUssR0FBRztHQUNoRCxNQUFNLE9BQU87SUFBQyxTQUFTLE1BQU0sS0FBSyxDQUFDO0lBQUcsU0FBUyxNQUFNLEtBQUssSUFBRSxDQUFDO0lBQUcsU0FBUyxNQUFNLEtBQUssSUFBRSxDQUFDO0dBQUM7OztHQUd4RixNQUFNLFFBQVEsS0FBSyxPQUFNLE1BQUssU0FBUyxLQUFLLENBQUMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLE1BQU07Ozs7R0FJbEcsQ0FBQyxRQUFRLE1BQU0sSUFBSSxTQUFTLGFBQWEsSUFBRyxDQUFFLEtBQUssR0FBRyxJQUFJO0dBQzFELElBQUksT0FBTyxLQUFLLFNBQVEsTUFBSyxZQUFZLElBQUksQ0FBQyxDQUFDO0VBQ2pEO0VBQ0EsSUFBSSxDQUFDLElBQUksUUFBUTtFQUNqQixNQUFNLFNBQVMsU0FBUyxNQUFNO0VBQzlCLE1BQU0sV0FBVyxPQUFPLGFBQWEsSUFBSTtFQUN6QyxLQUFLLE1BQU0sS0FBSyxhQUFhLFNBQVMsTUFBTSxJQUN6QyxTQUFTLEtBQUssQ0FBQyxJQUFFLE9BQU8sSUFBSSxNQUFJLE9BQU8sSUFBSSxJQUFFLE9BQU8sSUFBSSxLQUN4RCxPQUFPLElBQUksSUFBRSxTQUFTLEtBQUssQ0FBQyxNQUFJLE9BQU8sSUFBSSxJQUFFLE9BQU8sSUFBSSxFQUFFO0VBQzdELFNBQVMsY0FBYztFQUN2QixPQUFPLFNBQVMsQ0FBQyxHQUFHLEtBQUksR0FBRyxHQUFHLENBQUM7RUFDL0IsT0FBTyxZQUFZO0VBQUcsT0FBTyxTQUFTLEdBQUUsSUFBSSxRQUFPLENBQUM7RUFBRyxPQUFPLFNBQVMsSUFBSSxRQUFPLElBQUksUUFBTyxDQUFDO0VBQzlGLE1BQU0sV0FBVyxPQUFRLE1BQU07RUFDL0IsU0FBUyxNQUFNLE9BQVEsSUFBSyxNQUFNO0VBQ2xDLFNBQVMsSUFBSSxRQUFRLFNBQVMsSUFBSSxRQUFRLE1BQU07RUFDaEQsU0FBUyxJQUFJLGNBQWM7RUFDM0IsU0FBUyxhQUFhO0VBQ3RCLFNBQVMsbUJBQWtCLFdBQVU7R0FDbkMsT0FBTyxlQUFlLE9BQU8sYUFBYSxRQUFRLDZCQUNoRCxzRUFBc0U7RUFDMUU7RUFDQSxTQUFTLDhCQUE4QjtFQUN2QyxLQUFLLFdBQVcsQ0FBQyxLQUFLLFVBQVMsUUFBUTtFQUN2QyxLQUFLLFdBQVc7RUFDaEIsSUFBSSxXQUFXLFFBQVE7R0FDckIsTUFBTSxxQkFBcUIsU0FBUyxNQUFNO0dBQzFDLG1CQUFtQixTQUFTLFVBQVU7R0FDdEMsbUJBQW1CLFlBQVk7R0FDL0IsTUFBTSxjQUFjLElBQUksTUFBTSxLQUFLLG9CQUFvQixLQUFLLFNBQVMsRUFBRTtHQUN2RSxZQUFZLE9BQU87R0FDbkIsWUFBWSxTQUFTLHdCQUF3QjtHQUM3QyxZQUFZLGdCQUFnQjtHQUM1QixZQUFZLGNBQWMsS0FBSyxjQUFjO0dBQzdDLEtBQUssSUFBSSxXQUFXO0VBQ3RCO0VBQ0EsU0FBUyxRQUFRO0VBQ2pCLGFBQWEsSUFBSSxTQUFPO0NBQzFCLENBQUM7Q0FDRCxPQUFPO0FBQ1Q7QUFFQSxTQUFTLGdCQUFnQixPQUE2QjtDQUNwRCxNQUFNLFlBQVksSUFBSSxJQUFvQjtDQUMxQyxNQUFNLFVBQVUsU0FBUztFQUN2QixNQUFNLE9BQU87RUFDYixJQUFJLENBQUMsS0FBSyxRQUFRO0VBQ2xCLEtBQUssZ0JBQWdCO0VBQ3JCLEtBQUssY0FBYyxDQUFDO0VBQ3BCLEtBQUssTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsSUFBSSxLQUFLLFdBQVcsQ0FBQyxLQUFLLFFBQVEsR0FBRyxVQUFVLElBQUksUUFBUTtDQUMvRyxDQUFDO0NBQ0QsS0FBSyxNQUFNLFlBQVksV0FBVztFQUNoQyxNQUFNLGNBQWM7RUFDcEIsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxZQUFZLE1BQU07RUFDbEIsU0FBUyxjQUFjO0VBQ3ZCLFNBQVMsYUFBYTtFQUN0QixTQUFTLFlBQVk7RUFDckIsU0FBUyxtQkFBbUIsUUFBUSxhQUFhO0dBQy9DLFFBQVEsUUFBUSxRQUFRO0dBQ3hCLE9BQU8sZUFBZSxPQUFPLGFBQWEsUUFDeEMsNkJBQ0Esc0VBQ0Y7RUFDRjtFQUNBLFNBQVMsY0FBYztDQUN6QjtBQUNGOzs7Ozs7OztBQVNBLE1BQU0sNEJBQTRCOzs7Ozs7Ozs7Ozs7OztBQWNsQyxNQUFNLG9CQUE0QztDQUFFLGFBQWE7Q0FBTSxnQkFBZ0I7Q0FBTSxjQUFjO0NBQUssc0JBQXNCO0NBQU0sY0FBYztDQUFNLHFCQUFxQjtDQUFHLG1CQUFtQjtDQUFHLGtCQUFrQjtBQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtRWxPLE1BQU0sbUNBQW1DOztBQUV6QyxNQUFNLHVDQUF1Qzs7Ozs7OztBQU83QyxNQUFNLG1DQUFtQzs7Ozs7OztBQU96QyxTQUFTLDRCQUE0QixVQUEwQjtDQUM3RCxNQUFNLFFBQVEsY0FBYztDQUM1QixJQUFJLE1BQU0sU0FBUyxVQUFVLE9BQU87Q0FDcEMsSUFBSSxNQUFNLGFBQWEsV0FBVyxPQUFPLE1BQU07Q0FDL0MsTUFBTSxRQUFRLFdBQVc7Q0FDekIsTUFBTSxPQUFPLHVDQUF1QztDQUNwRCxPQUFPLENBQUMsTUFBTSxVQUFVLE1BQU0sTUFBTSxrQ0FBa0MsZ0NBQWdDLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDbkg7QUFpQkEsU0FBUyxnQkFBK0I7Q0FDdEMsSUFBSSxPQUFPLFdBQVcsYUFBYSxPQUFPO0VBQUUsTUFBTTtFQUFjLFVBQVU7RUFBVyxNQUFNO0NBQUs7Q0FDaEcsTUFBTSxTQUFTLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNO0NBQ3pELE1BQU0sV0FBVyxPQUFPLE9BQU8sSUFBSSxZQUFZLENBQUM7Q0FDaEQsT0FBTztFQUNMLE1BQU0sT0FBTyxJQUFJLFVBQVUsTUFBTSxXQUFXLFdBQVc7RUFDdkQsVUFBVSxPQUFPLElBQUksWUFBWSxLQUFLLE9BQU8sU0FBUyxRQUFRLEtBQUssWUFBWSxJQUFJLFdBQVc7RUFDOUYsTUFBTSxPQUFPLElBQUksUUFBUSxNQUFNLFNBQVMsT0FBTyxJQUFJLFVBQVUsTUFBTTtDQUNyRTtBQUNGO0FBcUJBLFNBQVMsb0JBQW9CLFVBQTZDO0NBQ3hFLE1BQU0sU0FBUyxTQUFTLFNBQVM7Q0FDakMsSUFBSSxRQUFRLE9BQU87Q0FDbkIsTUFBTSxpQkFBOEI7RUFDbEMsTUFBTSxXQUFXLFNBQVMsYUFBYSxVQUFVO0VBQ2pELElBQUksQ0FBQyxVQUFVLE9BQU87R0FBRSxRQUFRO0dBQU8sUUFBUTtFQUF1QjtFQUN0RSxNQUFNLFFBQVEsU0FBUyxPQUFPLFNBQVMsU0FBUztFQUNoRCxJQUFJLFFBQVEsS0FBSyxRQUFRLE1BQU0sR0FBRyxPQUFPO0dBQUUsUUFBUTtHQUFPLFFBQVE7RUFBdUI7OztFQUd6RixNQUFNLE9BQU8sSUFBSSxJQUFvQjtFQUNyQyxNQUFNLFNBQVMsSUFBSSxXQUFXLFNBQVMsS0FBSztFQUM1QyxNQUFNLFNBQW1CLENBQUM7RUFDMUIsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLFNBQVMsT0FBTyxTQUFTLEdBQUc7R0FDdEQsTUFBTSxJQUFJLFNBQVMsS0FBSyxLQUFLO0dBQzdCLE1BQU0sSUFBSSxTQUFTLEtBQUssS0FBSztHQUM3QixNQUFNLElBQUksU0FBUyxLQUFLLEtBQUs7R0FDN0IsTUFBTSxNQUFNLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRztHQUMvRSxJQUFJLEtBQUssS0FBSyxJQUFJLEdBQUc7R0FDckIsSUFBSSxPQUFPLFdBQVc7SUFDcEIsS0FBSyxPQUFPLFNBQVM7SUFDckIsS0FBSyxJQUFJLEtBQUssRUFBRTtJQUNoQixPQUFPLEtBQUssR0FBRyxHQUFHLENBQUM7R0FDckI7R0FDQSxPQUFPLFNBQVM7RUFDbEI7RUFDQSxNQUFNLE1BQU0sU0FBeUIsT0FBTyxTQUFTLFFBQVEsU0FBUyxNQUFNLEtBQUssSUFBSSxJQUFJO0VBQ3pGLE1BQU0sUUFBUSxJQUFJLElBQW9CO0VBQ3RDLE1BQU0sY0FBYyxPQUFPLFNBQVM7RUFDcEMsSUFBSSxTQUFTO0VBQ2IsS0FBSyxJQUFJLE9BQU8sR0FBRyxPQUFPLE9BQU8sUUFBUSxHQUFHO0dBQzFDLE1BQU0sSUFBSSxHQUFHLElBQUk7R0FDakIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDO0dBQ3JCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQztHQUNyQixJQUFJLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxHQUFHO0dBQ25DLEtBQUssTUFBTSxDQUFDLE1BQU0sT0FBTztJQUFDLENBQUMsR0FBRyxDQUFDO0lBQUcsQ0FBQyxHQUFHLENBQUM7SUFBRyxDQUFDLEdBQUcsQ0FBQztHQUFDLEdBQVk7SUFDMUQsTUFBTSxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsSUFBSSxjQUFjLEtBQUssSUFBSSxNQUFNLEVBQUU7SUFDaEUsTUFBTSxJQUFJLE1BQU0sTUFBTSxJQUFJLEdBQUcsS0FBSyxLQUFLLENBQUM7R0FDMUM7R0FDQSxNQUFNLEtBQUssT0FBTyxJQUFJLElBQUssS0FBSyxPQUFPLElBQUksSUFBSSxJQUFLLEtBQUssT0FBTyxJQUFJLElBQUk7R0FDeEUsTUFBTSxLQUFLLE9BQU8sSUFBSSxJQUFLLEtBQUssT0FBTyxJQUFJLElBQUksSUFBSyxLQUFLLE9BQU8sSUFBSSxJQUFJO0dBQ3hFLE1BQU0sS0FBSyxPQUFPLElBQUksSUFBSyxLQUFLLE9BQU8sSUFBSSxJQUFJLElBQUssS0FBSyxPQUFPLElBQUksSUFBSTtHQUN4RSxXQUFXLE1BQU0sS0FBSyxLQUFLLEtBQUssTUFBTSxNQUFNLEtBQUssS0FBSyxLQUFLLE1BQU0sTUFBTSxLQUFLLEtBQUssS0FBSyxPQUFPO0VBQy9GO0VBQ0EsS0FBSyxNQUFNLFVBQVUsTUFBTSxPQUFPLEdBQUcsSUFBSSxXQUFXLEdBQUcsT0FBTztHQUFFLFFBQVE7R0FBTyxRQUFRO0VBQWE7RUFDcEcsSUFBSSxVQUFVLEdBQUcsT0FBTztHQUFFLFFBQVE7R0FBTyxRQUFRO0VBQW1CO0VBQ3BFLE9BQU87R0FBRSxRQUFRO0dBQU0sUUFBUTtFQUFTO0NBQzFDLEVBQUMsQ0FBRTtDQUNILFNBQVMsU0FBUyxrQkFBa0I7Q0FDcEMsT0FBTztBQUNUO0FBSUEsU0FBUyx5QkFBeUIsT0FBdUIsU0FBZ0M7Q0FDdkYsTUFBTSxTQUF3QjtFQUFFLElBQUk7RUFBUyxRQUFRO0VBQUcsUUFBUTtFQUFHLE1BQU07RUFBRyxRQUFRO0VBQUcsYUFBYTtFQUFHLFNBQVMsQ0FBQztDQUFFO0NBQ25ILE1BQU0scUJBQXFCLElBQUksSUFBNkI7Q0FDNUQsTUFBTSxVQUFVLFNBQVM7RUFDdkIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxDQUFDLEtBQUssVUFBVSxLQUFLLFNBQVMsdUJBQXVCO0VBQ3pELE1BQU0sVUFBVSxvQkFBb0IsS0FBSyxRQUFRO0VBQ2pELE9BQU8sVUFBVTtFQUNqQixPQUFPLFFBQVEsU0FBUyxXQUFXLFdBQVc7RUFDOUMsT0FBTyxRQUFRLFFBQVEsV0FBVyxPQUFPLFFBQVEsUUFBUSxXQUFXLEtBQUs7RUFDekUsS0FBSyxNQUFNLFlBQVksTUFBTSxRQUFRLEtBQUssUUFBUSxJQUFJLEtBQUssV0FBVyxDQUFDLEtBQUssUUFBUSxHQUFHO0dBQ3JGLG1CQUFtQixJQUFJLFdBQVcsbUJBQW1CLElBQUksUUFBUSxLQUFLLFNBQVMsUUFBUSxNQUFNO0VBQy9GO0NBQ0YsQ0FBQztDQUNELE1BQU0sT0FBTyxjQUFjLENBQUMsQ0FBQztDQUM3QixLQUFLLE1BQU0sQ0FBQyxVQUFVLFdBQVcsb0JBQW9CO0VBQ25ELE1BQU0sU0FBUyxTQUFTLFNBQVM7RUFDakMsTUFBTSxXQUFXLFVBQVUsU0FBUztFQUNwQyxTQUFTLFNBQVMsbUJBQW1CO0VBQ3JDLE1BQU0sT0FBTyxVQUFVLE9BQU8sTUFBTSxZQUFZO0VBQ2hELElBQUksU0FBUyxTQUFTLE1BQU07R0FDMUIsU0FBUyxPQUFPO0dBQ2hCLFNBQVMsY0FBYztFQUN6QjtFQUNBLElBQUksU0FBUyxNQUFNLFdBQVcsT0FBTyxVQUFVO09BQzFDLE9BQU8sZUFBZTtDQUM3QjtDQUNBLE9BQU87QUFDVDtBQUVBLFNBQVMsY0FBYyxPQUF1QixZQUFvQixTQUF1QjtDQUN2RixJQUFJLGVBQWUscUJBQXFCLFlBQVksd0JBQXdCO0VBQzFFLE1BQU0sT0FBTyxJQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0saUJBQWlCLE1BQU8sTUFBTyxLQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sa0JBQWtCLEVBQUUsT0FBTyxTQUFTLENBQUMsQ0FBQztFQUNoSSxLQUFLLE9BQU87RUFDWixLQUFLLFNBQVMsSUFBSTtFQUNsQixLQUFLLFNBQVMsYUFBYTtFQUMzQixNQUFNLElBQUksSUFBSTtDQUNoQjtDQUNBLElBQUksZUFBZSxxQkFBcUIsWUFBWSw0QkFBNEI7RUFDOUUsTUFBTSxPQUFPLElBQUksTUFBTSxLQUFLLElBQUksTUFBTSxjQUFjLE1BQU0sRUFBSSxHQUFHLElBQUksTUFBTSxrQkFBa0IsRUFBRSxPQUFPLFFBQVMsQ0FBQyxDQUFDO0VBQ2pILEtBQUssT0FBTztFQUNaLEtBQUssU0FBUyxJQUFJLEdBQUcsTUFBTSxJQUFLO0VBQ2hDLEtBQUssU0FBUyxhQUFhO0VBQzNCLE1BQU0sSUFBSSxJQUFJO0NBQ2hCO0NBQ0EsTUFBTSxXQUFXLDJCQUEyQixXQUFXLEdBQUc7Q0FDMUQsSUFBSSxDQUFDLFVBQVU7Q0FDZixNQUFNLFVBQVUsU0FBUztFQUN2QixNQUFNLE9BQU87RUFDYixJQUFJLENBQUMsS0FBSyxVQUFVLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxDQUFDLEtBQUssU0FBUyx3QkFBd0I7OztFQUczRixLQUFLLFNBQVMsU0FBUyxPQUFPLEdBQUcsU0FBUyxVQUFVLE1BQU0sb0JBQW9CO0VBQzlFLEtBQUssU0FBUyxjQUFjO0NBQzlCLENBQUM7Q0FDRCxJQUFJLENBQUMsU0FBUyxNQUFNO0NBQ3BCLE1BQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsY0FBYyxLQUFLO0NBQ2hELE1BQU0sT0FBTyxJQUFJLE1BQU07RUFDckIsSUFBSSxNQUFNLGNBQWMsU0FBUyxLQUFLLE9BQU8sU0FBUyxLQUFLLE1BQU07Ozs7RUFJakUsSUFBSSxNQUFNLGtCQUFrQixFQUFFLE9BQU8sWUFBWSxDQUFDO0NBQ3BEO0NBQ0EsS0FBSyxPQUFPLEdBQUcsUUFBUTtDQUN2QixLQUFLLFNBQVMsSUFDWixNQUFNLFVBQVUsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksR0FBRyxTQUFTLEtBQUssT0FBTyxJQUFJLE1BQU0sU0FBUyxHQUNuRixNQUFNLFVBQVUsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksR0FBRyxTQUFTLEtBQUssR0FBRyxJQUFJLE1BQU0sU0FBUyxHQUMvRSxJQUFJLElBQUksSUFBSSxNQUFNLFNBQVMsSUFBSSxHQUNqQztDQUNBLEtBQUssU0FBUyxhQUFhO0NBQzNCLE1BQU0sSUFBSSxJQUFJO0FBQ2hCOzs7Ozs7Ozs7OztBQVlBLFNBQVMsMEJBQTBCLE9BQXVCLFFBQXVCLHdCQUF3QixhQUFhLElBQVU7Ozs7Q0FJOUgsTUFBTSxPQUFPLE1BQU0sU0FBUyx1QkFBdUIsT0FBTyxPQUFPLElBQUksTUFBTSxNQUFNLE1BQU0sSUFBSTtDQUMzRixNQUFNLFVBQVUsU0FBUztFQUN2QixNQUFNLE9BQU87RUFDYixJQUFJLENBQUMsS0FBSyxVQUFVLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxDQUFDLEtBQUssU0FBUywwQkFBMEIsQ0FBQyxLQUFLLFNBQVMsS0FBSztFQUNqSCxNQUFNLFdBQVcsS0FBSztFQUN0QixJQUFJLE1BQU07OztHQUdSLE1BQU0sU0FBUyxTQUFTLFNBQVM7R0FDakMsTUFBTSxPQUFPLFVBQVUsU0FBUyxNQUFNLE9BQU87R0FDN0MsU0FBUyxTQUFTLG9CQUFvQjtHQUN0QyxTQUFTLE1BQU0sT0FBTyxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUk7RUFDM0M7RUFDQSxTQUFTLFNBQVMsSUFBSSxNQUFNLElBQUk7RUFDaEMsU0FBUyxjQUFjLFNBQVM7Ozs7RUFJaEMsU0FBUyxTQUFTLDJCQUEyQixNQUFNO0VBQ25ELFNBQVMsb0JBQW9CLDRCQUE0QixNQUFNLFNBQVM7RUFDeEUsS0FBSyxlQUFlLHdCQUF3QixlQUFlLGtCQUFrQixlQUFlLGVBQWUsZUFBZSxrQkFBa0IsZUFBZSxtQkFBbUIsZUFBZSxpQkFBaUIsZUFBZSxrQkFBa0IsZUFBZSxtQkFBbUIsZUFBZSxpQkFBaUIsZUFBZSxxQkFBcUIsZUFBZSxrQkFBa0IsZUFBZSxvQkFBb0IsZUFBZSxxQkFBcUIsZUFBZSx3QkFBd0IsQ0FBQyxTQUFTLFNBQVMsc0JBQXNCO0dBQzNnQixTQUFTLFNBQVMsdUJBQXVCOzs7R0FHekMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtHQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7SUFDL0MsUUFBUSxRQUFRLFFBQVE7SUFDeEIsT0FBTyxpQkFBaUIsT0FBTyxlQUFlLFFBQVEsMkJBQTJCOzhIQUNxQztHQUN4SDtHQUNBLFNBQVMsOEJBQThCO0dBQ3ZDLFNBQVMsY0FBYztFQUN6QjtDQUNGLENBQUM7QUFDSDs7Ozs7Ozs7Ozs7OztBQWNBLFNBQVMsc0JBQ1AsTUFDQSxRQUNBLFVBQ0EsUUFDQSxRQUNpQztDQUNqQyxJQUFJLG9CQUFvQixLQUFLLENBQUMsMkJBQTJCLElBQUksS0FBSyxVQUFVLEtBQUssQ0FBQyxPQUFPLFFBQVEsT0FBTztDQUN4RyxNQUFNLFdBQVcsSUFBSSxNQUFNLGVBQWUsR0FBRyxFQUFFO0NBQy9DLE1BQU0sV0FBVyxJQUFJLE1BQU0sa0JBQWtCO0VBQzNDLE9BQU87RUFDUCxhQUFhO0VBQ2IsU0FBUztFQUNULFlBQVk7RUFDWixlQUFlO0VBQ2YscUJBQXFCLENBQUM7RUFDdEIsb0JBQW9CLENBQUM7Q0FDdkIsQ0FBQztDQUNELE1BQU0sV0FBVyxJQUFJLE1BQU0sY0FBYyxVQUFVLFVBQVUsT0FBTyxNQUFNO0NBQzFFLFNBQVMsT0FBTztDQUNoQixTQUFTLFNBQVMsYUFBYTtDQUMvQixTQUFTLGdCQUFnQjtDQUN6QixTQUFTLGNBQWMsYUFBYTtDQUNwQyxNQUFNLE1BQU0sSUFBSSxNQUFNLEtBQUs7Q0FDM0IsTUFBTSxPQUFPLElBQUksTUFBTSxRQUFRO0NBQy9CLE1BQU0sU0FBUyxJQUFJLE1BQU0sU0FBUzs7O0NBR2xDLE1BQU0sT0FBTyx5QkFBeUI7Q0FDdEMsSUFBSSxVQUFVO0NBQ2QsTUFBTSxXQUFXLElBQUksS0FBSyxzQkFBc0IsS0FBSyxXQUFXLEVBQUUsV0FBVyxDQUFDLEVBQUMsQ0FBRSxLQUFLLEVBQUUsWUFBWSxLQUFLLENBQUM7Q0FDMUcsS0FBSyxNQUFNLEVBQUUsSUFBSSxXQUFXLFFBQVE7RUFDbEMsSUFBSSxjQUFjLEtBQUs7RUFDdkIsSUFBSSxRQUFRLElBQUk7RUFDaEIsSUFDRSxNQUFNLFNBQVMsSUFBSSxPQUFPLElBQUksS0FBSyxNQUFNLFNBQVMsSUFBSSxPQUFPLElBQUksS0FDakUsTUFBTSxTQUFTLElBQUksT0FBTyxJQUFJLEtBQUssTUFBTSxTQUFTLElBQUksT0FBTyxJQUFJLEtBQ2pFLFNBQVMsSUFBSSxFQUFFLEdBQ2Y7RUFDRixNQUFNLFNBQVMsU0FBUyxNQUFNLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQzs7O0VBRzFELElBQUksV0FBVyxhQUFhLFNBQVMsUUFBUTtFQUM3QyxNQUFNLGNBQWMsS0FBSyxJQUFJO0VBQzdCLE9BQU8sU0FBUyxJQUNkLE1BQU0sU0FBUyxJQUFJLEtBQUssSUFBSSxhQUM1QixTQUFTLE1BQ1QsTUFBTSxTQUFTLElBQUksS0FBSyxJQUFJLFdBQzlCO0VBQ0EsT0FBTyxTQUFTLElBQUksQ0FBQyxLQUFLLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBSTtFQUMxQyxPQUFPLE1BQU0sSUFDWCxLQUFLLElBQUksSUFBSyxLQUFLLElBQUksdUJBQXVCLEdBQzlDLEtBQUssSUFBSSxJQUFLLEtBQUssSUFBSSx1QkFBdUIsR0FDOUMsQ0FDRjtFQUNBLE9BQU8sYUFBYTtFQUNwQixTQUFTLFlBQVksU0FBUyxPQUFPLE1BQU07RUFDM0MsV0FBVztDQUNiO0NBQ0EsU0FBUyxRQUFRO0NBQ2pCLFNBQVMsZUFBZSxjQUFjO0NBQ3RDLElBQUksQ0FBQyxTQUFTO0VBQ1osU0FBUyxRQUFRO0VBQ2pCLFNBQVMsUUFBUTtFQUNqQixPQUFPO0NBQ1Q7Q0FDQSxLQUFLLE1BQU0sSUFBSSxRQUFRO0NBQ3ZCLEtBQUssT0FBTyxRQUFRLCtCQUErQixPQUFPLE9BQU87Q0FDakUsT0FBTztBQUNUOzs7Ozs7Ozs7QUFVQSxTQUFTLG9CQUNQLFVBQ0EsT0FDQSxTQUNBLE9BQ0EsTUFDQSxVQUNRO0NBQ1IsTUFBTSxVQUFvQixDQUFDO0NBQzNCLE1BQU0sT0FBaUIsQ0FBQztDQUN4QixLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLFFBQVEsR0FBRyxLQUFLLEdBQUc7RUFDL0MsTUFBTSxXQUFXLE1BQU0sTUFBTSxVQUFVLEtBQUssSUFBSSxJQUFJLE1BQU0sT0FBTyxLQUFLLE1BQU0sU0FBUztFQUNyRixLQUFLLE1BQU0sS0FBSztHQUFDLENBQUM7R0FBSyxDQUFDO0dBQUcsQ0FBQztHQUFHO0dBQUc7R0FBRztHQUFHO0VBQUcsR0FBRztHQUM1QyxDQUFDLFdBQVcsT0FBTyxRQUFPLENBQUUsS0FBSyxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUM7RUFDM0Q7Q0FDRjtDQUNBLE1BQU0sVUFBVSxXQUE2QjtFQUMzQyxNQUFNLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQztFQUMvQyxPQUFPLE9BQU8sS0FBSyxNQUFNLE9BQU8sU0FBUyxDQUFDLE1BQU07Q0FDbEQ7Q0FDQSxNQUFNLGFBQWEsUUFBUSxTQUFTLE9BQU8sT0FBTyxJQUFJO0NBQ3RELE1BQU0sVUFBVSxLQUFLLFNBQVMsT0FBTyxJQUFJLElBQUk7Q0FDN0MsT0FBTyxLQUFLLElBQUksYUFBYSxNQUFNLFVBQVUsUUFBUTtBQUN2RDs7QUFHQSxTQUFTLGtCQUNQLFVBQ0EsT0FDQSxTQUNBLFVBQ0EsTUFDUTtDQUNSLE1BQU0sVUFBb0IsQ0FBQztDQUMzQixLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLFFBQVEsR0FBRyxLQUFLLElBQUssUUFBUSxLQUFLLFNBQVMsR0FBRyxPQUFPLENBQUM7Q0FDcEYsUUFBUSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUM7Q0FDNUIsUUFBUSxRQUFRLEtBQUssSUFBSSxRQUFRLFNBQVMsR0FBRyxLQUFLLE1BQU0sUUFBUSxTQUFTLFFBQVEsQ0FBQyxNQUFNLEtBQUs7QUFDL0Y7QUFFQSxTQUFTLHFCQUFxQixXQUFtQixZQUFvQixPQUFlLFNBQTZCO0NBQy9HLE1BQU0sVUFBVTtFQUFDLENBQUM7RUFBRyxDQUFDO0VBQU07RUFBRztFQUFNO0NBQUM7Q0FDdEMsTUFBTSxjQUFjO0VBQUM7RUFBRztFQUFHO0VBQUc7RUFBRztDQUFDO0NBQ2xDLE1BQU0sWUFBc0IsQ0FBQztDQUM3QixNQUFNLFNBQW1CLENBQUM7Q0FDMUIsTUFBTSxVQUFvQixDQUFDO0NBQzNCLEtBQUssSUFBSSxNQUFNLEdBQUcsT0FBTyxrQkFBa0IsT0FBTyxHQUFHO0VBQ25ELE1BQU0sSUFBSSxNQUFNO0VBQ2hCLE1BQU0sUUFBUSxLQUFLLElBQ2pCLE1BQU0sVUFBVSxXQUFXLEdBQUcsR0FBRyxxQkFBcUIsR0FDdEQsTUFBTSxVQUFVLFdBQVcsSUFBSSxHQUFHLEdBQUcscUJBQXFCLENBQzVEO0VBQ0EsS0FBSyxJQUFJLFNBQVMsR0FBRyxTQUFTLFFBQVEsUUFBUSxVQUFVLEdBQUc7R0FDekQsVUFBVSxLQUFLLFFBQVEsVUFBVyxXQUFXLEdBQUcsTUFBTSxVQUFVLEtBQUssQ0FBQyxZQUFZLFlBQVksQ0FBQyxDQUFDO0dBQ2hHLE9BQU8sS0FBSyxHQUFHLEdBQUcsR0FBRyxZQUFZLFVBQVcsS0FBSztFQUNuRDtDQUNGO0NBQ0EsS0FBSyxJQUFJLE1BQU0sR0FBRyxNQUFNLGtCQUFrQixPQUFPLEdBQUc7RUFDbEQsS0FBSyxJQUFJLFNBQVMsR0FBRyxTQUFTLFFBQVEsU0FBUyxHQUFHLFVBQVUsR0FBRztHQUM3RCxNQUFNLElBQUksTUFBTSxRQUFRLFNBQVM7R0FDakMsTUFBTSxJQUFJLElBQUk7R0FDZCxNQUFNLElBQUksSUFBSSxRQUFRO0dBQ3RCLE1BQU0sSUFBSSxJQUFJO0dBQ2QsUUFBUSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQy9CO0NBQ0Y7Q0FDQSxNQUFNLFdBQVcsSUFBSSxNQUFNLGVBQWU7Q0FDMUMsU0FBUyxhQUFhLFlBQVksSUFBSSxNQUFNLHVCQUF1QixXQUFXLENBQUMsQ0FBQztDQUNoRixTQUFTLGFBQWEsU0FBUyxJQUFJLE1BQU0sdUJBQXVCLFFBQVEsQ0FBQyxDQUFDO0NBQzFFLFNBQVMsU0FBUyxPQUFPO0NBQ3pCLFNBQVMsc0JBQXNCO0NBQy9CLE1BQU0sT0FBTyxJQUFJLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxrQkFBa0I7RUFDaEU7RUFDQSxjQUFjO0VBQ2QsYUFBYTtFQUNiO0VBQ0EsWUFBWTtFQUNaLE1BQU0sTUFBTTtDQUNkLENBQUMsQ0FBQztDQUNGLEtBQUssT0FBTztDQUNaLEtBQUssU0FBUyxhQUFhO0NBQzNCLEtBQUssZ0JBQWdCO0NBQ3JCLEtBQUssY0FBYyxhQUFhLGVBQWU7Q0FDL0MsT0FBTztBQUNUO0FBRUEsU0FBUyxnQkFDUCxNQUNBLFFBQ0EsUUFDd0I7Q0FDeEIsTUFBTSxXQUFXLHNCQUFzQixLQUFLO0NBQzVDLElBQUksb0JBQW9CLEtBQUssQ0FBQyxZQUFZLFdBQVcsV0FBVyxPQUFPO0NBQ3ZFLE1BQU0sT0FBTyxPQUFPLE1BQU0sRUFBRSxTQUFTLE9BQU8sU0FBUyxPQUFPLENBQUMsRUFBRTtDQUMvRCxJQUFJLENBQUMsTUFBTSxPQUFPO0NBQ2xCLE1BQU0sTUFBTSxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsY0FBYyxJQUFJO0NBQy9DLE1BQU0sT0FBTyxJQUFJLFFBQVEsSUFBSSxNQUFNLFFBQVEsQ0FBQztDQUM1QyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLE9BQU87Q0FDdkMsTUFBTSxTQUFTLHFCQUFxQixLQUFLLElBQUksU0FBUyxZQUFZLEtBQUssSUFBSSxTQUFTLGFBQWEsU0FBUyxPQUFPLFNBQVMsT0FBTztDQUNqSSxNQUFNLE9BQU8seUJBQXlCO0NBQ3RDLE1BQU0sT0FBTyxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxNQUFNO0NBQzNDLE9BQU8sU0FBUyxLQUNiLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sU0FBUyxPQUN2RCxTQUFTLG1CQUNSLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLE9BQU8sU0FBUyxLQUN6RDtDQUNBLEtBQUssTUFBTSxJQUFJLE1BQU07Q0FDckIsS0FBSyxPQUFPLFFBQVEsMkJBQTJCLElBQUksS0FBSyxJQUFJLFNBQVMsY0FBYyxFQUFDLENBQUUsUUFBUSxDQUFDLEVBQUUsSUFBSSxLQUFLLElBQUksU0FBUyxhQUFhLEVBQUMsQ0FBRSxRQUFRLENBQUMsRUFBRSxHQUFHLEtBQUssUUFBUSxDQUFDO0NBQ25LLE9BQU87QUFDVDs7Ozs7OztBQVFBLFNBQVMsb0JBQW9CLE1BQXNCLFFBQWdCLE1BQXNEO0NBQ3ZILEtBQUssa0JBQWtCLE1BQU0sSUFBSTtDQUNqQyxNQUFNLFdBQWtELENBQUM7Q0FDekQsTUFBTSxJQUFJLElBQUksTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxNQUFNLFFBQVE7Q0FDOUUsS0FBSyxVQUFVLFdBQVc7RUFDeEIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxDQUFDLEtBQUssVUFBVSxLQUFLLFNBQVMsWUFBWTtFQUM5QyxNQUFNLFdBQVcsS0FBSztFQUN0QixNQUFNLFlBQVksU0FBUyxhQUFhLFVBQVU7RUFDbEQsSUFBSSxDQUFDLFdBQVc7RUFDaEIsTUFBTSxRQUFRLFNBQVMsT0FBTyxTQUFTLFVBQVU7RUFDakQsTUFBTSxVQUFVLFFBQXVCLFNBQWlCLE9BQU8sb0JBQzdELFdBQVcsU0FBUyxRQUFRLFNBQVMsTUFBTSxLQUFLLElBQUksSUFBSSxJQUMxRCxDQUFDLENBQUMsYUFBYSxLQUFLLFdBQVc7RUFDL0IsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sS0FBSyxHQUFHO0dBQ2pDLE9BQU8sR0FBRyxDQUFDO0dBQUcsT0FBTyxHQUFHLElBQUksQ0FBQztHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUM7R0FDL0MsTUFBTSxPQUF3QixDQUFDO0dBQy9CLEtBQUssTUFBTSxDQUFDLE1BQU0sT0FBTztJQUFDLENBQUMsR0FBRSxDQUFDO0lBQUcsQ0FBQyxHQUFFLENBQUM7SUFBRyxDQUFDLEdBQUUsQ0FBQztHQUFDLEdBQUc7SUFDOUMsSUFBSyxLQUFNLEtBQUssV0FBYSxHQUFJLEtBQUssUUFBUztJQUMvQyxLQUFLLEtBQUssS0FBTSxNQUFNLENBQUMsQ0FBQyxLQUFLLEtBQU0sU0FBUyxLQUFNLE1BQU0sR0FBSSxJQUFJLEtBQU0sRUFBRSxDQUFDO0dBQzNFO0dBQ0EsSUFBSSxLQUFLLFdBQVcsS0FBSyxLQUFLLEVBQUUsQ0FBRSxrQkFBa0IsS0FBSyxFQUFHLElBQUksTUFBTSxTQUFTLEtBQUssQ0FBQyxLQUFLLElBQUssS0FBSyxFQUFHLENBQUM7RUFDMUc7Q0FDRixDQUFDO0NBQ0QsSUFBSSxDQUFDLFNBQVMsUUFBUSxPQUFPO0NBQzdCLE1BQU0sU0FBUyxJQUFJLE1BQU0sS0FBSztDQUM5QixLQUFLLE1BQU0sV0FBVyxVQUFVLEtBQUssTUFBTSxTQUFTLFNBQVMsT0FBTyxjQUFjLEtBQUs7Q0FDdkYsTUFBTSxTQUFTLE9BQU8sVUFBVSxJQUFJLE1BQU0sUUFBUSxDQUFDO0NBQ25ELE1BQU0sWUFBc0IsQ0FBQyxHQUFHLE1BQWdCLENBQUM7Q0FDakQsTUFBTSxRQUFRLE9BQXNCLFNBQWlCO0VBQ25ELE1BQU0sUUFBUSxLQUFLLGFBQWEsTUFBTSxNQUFNLENBQUM7RUFDN0MsVUFBVSxLQUFLLE1BQU0sR0FBRSxNQUFNLEdBQUUsTUFBTSxDQUFDO0VBQUcsSUFBSSxLQUFLLEdBQUUsSUFBSTtDQUMxRDtDQUNBLEtBQUssTUFBTSxDQUFDLE1BQUssT0FBTyxVQUFVO0VBQ2hDLE1BQU0sVUFBVSxJQUFJLE1BQU0sUUFBUSxHQUFHLElBQUUsS0FBSyxHQUFFLEdBQUUsS0FBSyxJQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVTtFQUN2RSxNQUFNLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFBSSxNQUFNO0VBQzlELElBQUksUUFBUSxJQUFJLEdBQUcsSUFBSSxHQUFHLFFBQVEsT0FBTztFQUN6QyxNQUFNLFNBQVMsS0FBSyxNQUFNLEdBQUcsU0FBUyxHQUFHLE1BQU07RUFDL0MsT0FBTyxJQUFJLE9BQU8sSUFBSSxTQUFTO0VBQy9CLE1BQU0sU0FBUyxPQUFPLE1BQU0sQ0FBQyxDQUFDLGdCQUFnQixTQUFRLEdBQUc7RUFDekQsTUFBTSxTQUFTLE9BQU8sTUFBTSxDQUFDLENBQUMsZ0JBQWdCLFNBQVEsR0FBRztFQUN6RCxLQUFLLFFBQU8sQ0FBQztFQUFHLEtBQUssUUFBTyxDQUFDO0VBQUcsS0FBSyxRQUFPLENBQUM7RUFDN0MsS0FBSyxRQUFPLENBQUM7RUFBRyxLQUFLLFFBQU8sQ0FBQztFQUFHLEtBQUssUUFBTyxDQUFDO0NBQy9DO0NBQ0EsTUFBTSxXQUFXLElBQUksTUFBTSxlQUFlO0NBQzFDLFNBQVMsYUFBYSxZQUFXLElBQUksTUFBTSx1QkFBdUIsV0FBVSxDQUFDLENBQUM7Q0FDOUUsU0FBUyxhQUFhLE1BQUssSUFBSSxNQUFNLHVCQUF1QixLQUFJLENBQUMsQ0FBQztDQUNsRSxNQUFNLFdBQVcsSUFBSSxNQUFNLGtCQUFrQjtFQUFDLE9BQU07RUFBVSxhQUFZO0VBQUssU0FBUTtFQUFJLFlBQVc7RUFBTSxNQUFLLE1BQU07Q0FBVSxDQUFDO0NBQ2xJLFNBQVMsa0JBQWtCO0NBQzNCLFNBQVMsbUJBQWtCLFdBQVU7RUFDbkMsT0FBTyxTQUFTLGdCQUFnQjtFQUNoQyxPQUFPLGVBQWEsT0FBTyxhQUFhLFFBQVEscUJBQW9CLDZDQUE2QyxDQUFDLENBQy9HLFFBQVEsMkJBQTBCLDJFQUEyRTtFQUNoSCxPQUFPLGlCQUFlLE9BQU8sZUFBZSxRQUFRLHFCQUFvQiwyRUFBMkUsQ0FBQyxDQUNqSixRQUFRLDZCQUE0Qjs7O3NHQUcyRDtDQUNwRztDQUNBLFNBQVMsOEJBQTJCO0NBQ3BDLE1BQU0sT0FBSyxJQUFJLE1BQU0sS0FBSyxVQUFTLFFBQVE7Q0FDM0MsS0FBSyxPQUFLO0NBQW1CLEtBQUssU0FBUyxhQUFXO0NBQ3RELEtBQUssY0FBWSxhQUFhLGVBQWE7Q0FDM0MsT0FBTztBQUNUO0FBRUEsU0FBUyxpQkFBaUIsTUFBWSxVQUE0QyxRQUE2QztDQUM3SCxNQUFNLFdBQVcsU0FBUyxLQUFLLFdBQVcsRUFBRTtDQUM1QyxNQUFNLE1BQU0sVUFBVSxjQUFjLFVBQVUsZ0NBQ3pDLFNBQVMsYUFBYSx5QkFBeUI7Q0FDcEQsTUFBTSxhQUFhLEtBQUssZUFBZTtDQUN2QyxNQUFNLFdBQVcsTUFBTSx5QkFBeUIsc0JBQXNCLEtBQUs7Q0FDM0UsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLFlBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxjQUFjLEdBQUksT0FBTztDQUNyRixNQUFNLFFBQVEsTUFBTTtFQUFFLE1BQU0sT0FBTyxJQUFJO0VBQUcsTUFBTSxPQUFPLElBQUk7Q0FBRSxJQUFJLFFBQVEsY0FBYztDQUN2RixNQUFNLFdBQVcsTUFBTSxPQUFPLE1BQU0sUUFBUTtDQUM1QyxNQUFNLGtCQUFrQixNQUFNLE9BQU8sTUFBTSxRQUFRO0NBQ25ELE1BQU0sUUFBUSxNQUFNLENBQUMsSUFBSSxRQUFRLFdBQVc7Q0FDNUMsTUFBTSxnQkFBZ0IsTUFBTSxTQUFTLEtBQUssSUFBSSxHQUFHLE1BQU0sS0FBSyxVQUFVLE1BQU0sU0FBUyxDQUFDLElBQUk7Q0FDMUYsTUFBTSxjQUFjLE1BQU0sU0FBUyxNQUFNLEtBQUssVUFBVSxNQUFNLE9BQU8sSUFBSSxDQUFDLENBQUM7Q0FDM0UsTUFBTSxRQUFRLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQztDQUNyRSxNQUFNLFdBQVcsU0FBUyxRQUFRLFNBQVMsY0FBYyxTQUFTLFFBQVEsSUFDdEUsU0FBUyxRQUFRLFNBQVMsaUJBQ3hCLG9CQUFvQixVQUFVLE9BQU8sU0FBUyxPQUFPLFNBQVMsUUFBUSxNQUFNLFNBQVMsUUFBUSxJQUM3RixrQkFBa0IsVUFBVSxPQUFPLFNBQVMsU0FBUyxRQUFRLFVBQVUsU0FBUyxRQUFRLElBQUk7Q0FDbEcsTUFBTSxZQUFZLFNBQVMsS0FBSyxXQUFXLEVBQUUsaUJBQWlCLFlBQVksdUJBQXVCO0NBQ2pHLE1BQU0sa0JBQWtCLE1BQU0sWUFBWSxTQUFTLG1CQUFtQixRQUFRLHFCQUFxQjtDQUNuRyxNQUFNLFdBQVcsTUFBTSxLQUFLLElBQUksR0FBRyxZQUFZLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRyxTQUFTLGtCQUFrQixDQUFDO0NBQ2hHLE1BQU0sUUFBUSxrQkFBa0I7RUFDOUIsTUFBTTtFQUNOLFdBQVc7RUFDWCxTQUFTO0VBQ1QsVUFBVSxPQUFPLEdBQUcsTUFBTTs7R0FFeEIsTUFBTSxVQUFVLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksY0FBYztHQUN2RixPQUFPLE1BQU0sVUFBVSxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsT0FBTyxJQUFJLEdBQUcsTUFBTSxVQUFVLFdBQVcsU0FBUyxHQUFHLEtBQUssQ0FBQztFQUN6RyxJQUFJO0VBQ0osS0FBSyxTQUFTO0VBQ2QsWUFBWSxTQUFTO0VBQ3JCLGFBQWEsU0FBUztFQUN0QixPQUFPLGFBQWEsWUFBWSxTQUFTO0VBQ3pDLFNBQVMsYUFBYSxNQUFPLFNBQVM7RUFDdEMsZ0JBQWdCLGFBQWEsTUFBTyxTQUFTO0VBQzdDLGFBQWEsU0FBUztFQUN0QixjQUFjLGFBQWEsTUFBTyxTQUFTO0VBQzNDLFVBQVUsU0FBUztFQUNuQixpQkFBaUIsU0FBUztFQUMxQixhQUFhLFNBQVM7RUFDdEIsVUFBVSxTQUFTO0VBQ25CO0VBQ0E7RUFDQSxZQUFZLFFBQVE7RUFDcEIsZ0JBQWdCLE1BQU0sWUFBWTtFQUNsQztFQUNBLFlBQVksUUFBUTtFQUNwQixXQUFXLE1BQU0sWUFBWSx5QkFBeUIsV0FBVyxJQUFJLFFBQVEsS0FBSyxJQUFJLEdBQUcsUUFBUSxzQkFBc0I7RUFDdkg7RUFDQTtFQUNBLFlBQVksUUFBUSxXQUFXLE9BQU87RUFDdEMsV0FBVyxRQUFRLFdBQVcsTUFBTTtFQUNwQyxXQUFXLFFBQVEsV0FBVztFQUM5QixXQUFXLFFBQVEsV0FBVzs7O0VBRzlCLFNBQVMsU0FBUyxXQUFXLFlBQ3pCLFFBQVEsWUFBWSxLQUFLLFlBQVk7R0FDckMsR0FBRyxPQUFPO0dBQ1YsR0FBRyxPQUFPLElBQUksVUFBVSxNQUFNLE9BQU8sTUFBTyxNQUFNLE9BQU87RUFDM0QsRUFBRSxJQUNBLFNBQVMsT0FBTyxLQUFLLEVBQUUsR0FBRyxTQUFTO0dBQUU7R0FBRyxHQUFHLFVBQVU7RUFBRSxFQUFFO0NBQy9ELENBQUM7Q0FDRCxJQUFJLFlBQVksQ0FBQztDQUNqQixJQUFJLFNBQVM7Q0FDYixNQUFNLFlBQVksTUFBTyxLQUFLLGVBQWUsZ0JBQ3pDO0VBQUM7RUFBZ0I7RUFBZTtDQUFrQixJQUFJLENBQUMsZUFBZSxJQUFLLENBQUM7Q0FDaEYsTUFBTSxlQUE2QixDQUFDO0NBQ3BDLE1BQU0sZUFBZSxNQUFNO0NBQzNCLE1BQU0sZ0JBQWdCO0VBQ3BCLEtBQUssTUFBTSxXQUFXLGNBQWM7R0FDbEMsSUFBSSxDQUFDLFFBQVEsUUFBUTtHQUNyQixRQUFRLGlCQUFpQjtHQUN6QixnQkFBZ0IsT0FBTztFQUN6QjtFQUNBLE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDM0IsYUFBYTtDQUNmO0NBQ0EsTUFBTSxLQUFLLGtCQUFrQixhQUFhO0VBQ3hDLE1BQU0sUUFBUSxTQUFTLEtBQUssT0FBTztFQUNuQyxJQUFJLFVBQVUsV0FBVztFQUN6QixNQUFNLE1BQU0sWUFBWSxJQUFJLElBQUk7RUFDaEMsTUFBTSxRQUFRLFlBQVksSUFBSSxJQUFJLEtBQUssSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7RUFDNUYsWUFBWTtFQUNaLFNBQVM7RUFDVCxNQUFNLFFBQVEsS0FBSzs7O0VBR25CLEtBQUssSUFBSSxJQUFJLFVBQVUsU0FBUyxHQUFHLEtBQUssR0FBRyxLQUFLO0dBQzlDLE1BQU0sT0FBTyxLQUFLLE1BQU0sZ0JBQWdCLFVBQVUsRUFBRztHQUNyRCxJQUFJLENBQUMsTUFBTSxTQUFTLFFBQVE7R0FDNUIsTUFBTSxVQUFVLG9CQUFvQixNQUFNLFVBQ3ZDLE1BQU0sS0FBSyxTQUE0QixTQUFTLGNBQWMsSUFBOEI7R0FDL0YsVUFBVSxPQUFPLEdBQUcsQ0FBQztHQUNyQixJQUFJLFNBQVM7SUFBRSxLQUFLLElBQUksT0FBTztJQUFHLGFBQWEsS0FBSyxPQUFPO0dBQUc7R0FDOUQsS0FBSyxPQUFPLFFBQVEsK0JBQStCLEtBQUssVUFBVSxhQUFhLEtBQUksVUFBUztJQUMxRixNQUFNLEtBQUssUUFBUTtJQUFNLFdBQVcsS0FBSyxTQUFTLGFBQWEsVUFBVSxDQUFDLENBQUMsUUFBUTtHQUNyRixFQUFFLENBQUM7RUFDTDtDQUNGO0NBQ0EsS0FBSyxNQUFNLElBQUksTUFBTSxJQUFJO0NBQ3pCLEtBQUssT0FBTyxRQUFRLDRCQUE0QixNQUFNLG9CQUFvQjs7O0NBRzFFLEtBQUssT0FBTyxRQUFRLHFDQUFxQyxnQkFBZ0IsUUFBUSxDQUFDO0NBQ2xGLEtBQUssT0FBTyxRQUFRLHlDQUF5QyxNQUFNLGlCQUFpQixRQUFRLHFCQUFxQixFQUFDLENBQUUsUUFBUSxDQUFDO0NBQzdILEtBQUssT0FBTyxRQUFRLDZCQUE2QixTQUFTLFFBQVEsQ0FBQztDQUNuRSxLQUFLLE9BQU8sUUFBUSxrQ0FBa0MsT0FBTyxNQUFNLEtBQUssb0JBQW9CLE1BQU0sV0FDN0YsTUFBTSxLQUFLLFNBQVMsU0FBUyxlQUFlLElBQzdDLENBQUM7Q0FDTCxLQUFLLE9BQU8sUUFBUSxtQ0FBbUMsTUFBTSxjQUFjLFFBQVEsQ0FBQztDQUNwRixLQUFLLE9BQU8sUUFBUSxpQ0FBaUMsTUFBTSxLQUFLLFVBQVUsR0FBRyxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxDQUFDLEtBQUssR0FBRztDQUNsSCxPQUFPO0FBQ1Q7O0FBR0EsU0FBUyxrQkFDUCxNQUNBLFFBQ0EsUUFDaUM7Q0FDakMsTUFBTSxVQUFVLHNCQUFzQixLQUFLLFdBQVcsRUFBRTtDQUN4RCxJQUFJLG9CQUFvQixLQUFLLENBQUMsU0FBUyxVQUFVLFdBQVcsV0FBVyxPQUFPO0NBQzlFLE1BQU0sV0FBVyxJQUFJLE1BQU0sYUFBYSxJQUFLLEdBQUcsSUFBSSxDQUFDO0NBQ3JELE1BQU0sV0FBVyxJQUFJLE1BQU0sa0JBQWtCO0VBQzNDLE9BQU87RUFDUCxhQUFhO0VBQ2IsU0FBUztFQUNULFlBQVk7RUFDWixNQUFNLE1BQU07RUFDWixVQUFVLE1BQU07Q0FDbEIsQ0FBQztDQUNELE1BQU0sT0FBTyxJQUFJLE1BQU0sY0FBYyxVQUFVLFVBQVUsUUFBUSxNQUFNO0NBQ3ZFLEtBQUssT0FBTztDQUNaLEtBQUssU0FBUyxhQUFhO0NBQzNCLEtBQUssZ0JBQWdCO0NBQ3JCLEtBQUssY0FBYyxhQUFhO0NBQ2hDLE1BQU0sU0FBUyxJQUFJLE1BQU0sU0FBUztDQUNsQyxJQUFJLFVBQVU7Q0FDZCxLQUFLLE1BQU0sVUFBVSxTQUFTO0VBQzVCLE1BQU0sUUFBUSxPQUFPLE1BQU0sRUFBRSxTQUFTLE9BQU8sT0FBTyxLQUFLLENBQUMsRUFBRTtFQUM1RCxJQUFJLENBQUMsT0FBTztFQUNaLE9BQU8sU0FBUyxJQUFJLE1BQU0sU0FBUyxHQUFHLFNBQVMsTUFBTyxNQUFNLFNBQVMsQ0FBQztFQUN0RSxPQUFPLFNBQVMsSUFBSSxDQUFDLEtBQUssS0FBSyxHQUFHLEdBQUcsQ0FBQztFQUN0QyxPQUFPLE1BQU0sSUFBSSxPQUFPLFFBQVEsT0FBTyxRQUFRLENBQUM7RUFDaEQsT0FBTyxhQUFhO0VBQ3BCLEtBQUssWUFBWSxTQUFTLE9BQU8sTUFBTTtFQUN2QyxXQUFXO0NBQ2I7Q0FDQSxLQUFLLFFBQVE7Q0FDYixLQUFLLGVBQWUsY0FBYztDQUNsQyxJQUFJLENBQUMsU0FBUztFQUNaLFNBQVMsUUFBUTtFQUNqQixTQUFTLFFBQVE7RUFDakIsT0FBTztDQUNUO0NBQ0EsS0FBSyxNQUFNLElBQUksSUFBSTtDQUNuQixLQUFLLE9BQU8sUUFBUSw2QkFBNkIsT0FBTyxPQUFPO0NBQy9ELE9BQU87QUFDVDs7Ozs7Ozs7OztBQVdBLFNBQVMsY0FBYyxNQUFZLFFBQTBDO0NBQzNFLE1BQU0sV0FBVyxVQUFVLEtBQUs7Q0FDaEMsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLFVBQVUsT0FBTztDQUMvQyxNQUFNLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxjQUFjO0NBQ3JFLE1BQU0sT0FBTyx5QkFBeUI7Q0FDdEMsTUFBTSxRQUFRLGVBQWU7RUFDM0IsT0FBTyxTQUFTLEtBQUssTUFBTSxlQUFlLEdBQUksSUFBSTtFQUNsRCxPQUFPLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLFNBQVMsY0FBYztFQUMxRixPQUFPLFNBQVM7RUFDaEIsU0FBUyxTQUFTO0VBQ2xCLE1BQU0sU0FBUztFQUNmLE1BQU0sU0FBUztFQUNmLE9BQU8sSUFBSSxNQUFNLFFBQVEsS0FBSyxJQUFJLEtBQU0sS0FBSyxJQUFJLEdBQUk7RUFDckQsT0FBTyxTQUFTO0VBQ2hCLE1BQU0sU0FBUztFQUNmLE1BQU0sU0FBUztDQUNqQixDQUFDO0NBQ0QsSUFBSSxZQUFZLENBQUM7Q0FDakIsSUFBSSxTQUFTO0NBQ2IsTUFBTSxPQUFPLGtCQUFrQixhQUFhO0VBQzFDLE1BQU0sUUFBUSxTQUFTLEtBQUssT0FBTztFQUNuQyxJQUFJLFVBQVUsV0FBVztFQUN6QixNQUFNLE1BQU0sWUFBWSxJQUFJLElBQUk7RUFDaEMsTUFBTSxRQUFRLFlBQVksSUFBSSxJQUFJLEtBQUssSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7RUFDNUYsWUFBWTtFQUNaLFNBQVM7RUFDVCxNQUFNLFFBQVEsS0FBSztDQUNyQjtDQUNBLEtBQUssTUFBTSxJQUFJLE1BQU0sTUFBTTtDQUMzQixLQUFLLE9BQU8sUUFBUSxzQkFBc0IsT0FBTyxNQUFNLEtBQUs7Q0FDNUQsT0FBTztBQUNUOztBQUdBLFNBQVMsb0JBQW9CLE1BQVksUUFBd0Q7Q0FDL0YsTUFBTSxXQUFXLDBCQUEwQixLQUFLO0NBQ2hELElBQUksb0JBQW9CLEtBQUssQ0FBQyxZQUFZLFdBQVcsYUFBYSwyQkFBMkIsQ0FBQyxDQUFDLFNBQVMsUUFBUSxPQUFPO0NBQ3ZILE1BQU0sUUFBUSxlQUFlO0VBQzNCLE9BQU8sU0FBUyxNQUFNO0VBQ3RCLE9BQU8sU0FBUyxNQUFNO0VBQ3RCLE9BQU8sU0FBUyxNQUFNO0VBQ3RCLFNBQVM7RUFDVCxNQUFNLFNBQVM7RUFDZixNQUFNLFNBQVMsU0FBUyxNQUFNO0VBQzlCLE9BQU8sSUFBSSxNQUFNLFFBQVEsR0FBRyxDQUFDO0VBQzdCLE1BQU0sU0FBUyxNQUFNO0VBQ3JCLE9BQU8sU0FBUyxNQUFNO0VBQ3RCLE1BQU0sU0FBUyxNQUFNO0VBQ3JCLE1BQU07Q0FDUixDQUFDO0NBQ0QsTUFBTSxPQUFPLE9BQU87Q0FDcEIsSUFBSTtDQUNKLElBQUk7Q0FDSixJQUFJLFlBQVksQ0FBQztDQUNqQixJQUFJLFNBQVM7Q0FDYixNQUFNLFdBQVcsYUFBa0M7RUFDakQsTUFBTSxRQUFRLFNBQVMsS0FBSyxPQUFPO0VBQ25DLElBQUksVUFBVSxXQUFXO0VBQ3pCLE1BQU0sTUFBTSxZQUFZLElBQUksSUFBSTtFQUNoQyxNQUFNLFFBQVEsWUFBWSxJQUFJLElBQUksS0FBSyxJQUFJLHdCQUF3QixLQUFLLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztFQUM1RixZQUFZO0VBQ1osU0FBUztFQUNULE1BQU0sUUFBUSxLQUFLO0VBQ25CLE9BQU8sUUFBUSxLQUFLO0NBQ3RCO0NBQ0EsTUFBTSxPQUFPLGlCQUFpQjtDQUM5QixLQUFLLE1BQU0sSUFBSSxNQUFNLE1BQU07Q0FFM0IsSUFBSSxRQUFRO0NBQ1osTUFBTSxhQUFhO0VBQ2pCLElBQUksQ0FBQyxNQUFNLE9BQU8sUUFBUTtFQUMxQixJQUFJLFFBQVEsZ0NBQWdDLEdBQUc7R0FDN0MsTUFBTSxVQUFVLEtBQUssZUFBZSxLQUFLO0dBQ3pDLE1BQU0sT0FBTyxVQUFVLFVBQVU7R0FDakMsSUFBSSxDQUFDLE1BQU07SUFDVCxNQUFNLFFBQVEsS0FBSyxNQUFNLGdCQUFnQixTQUFTO0lBQ2xELElBQUksT0FBTztLQUNULE9BQU87S0FDUCxRQUFRLGVBQWU7TUFDckIsT0FBTyxTQUFTLE1BQU07TUFDdEIsT0FBTyxTQUFTLE1BQU07TUFDdEIsT0FBTyxTQUFTLE1BQU07TUFDdEIsU0FBUztNQUNULE1BQU07TUFDTixNQUFNLE9BQU8sU0FBUyxNQUFNO01BQzVCLE9BQU8sSUFBSSxNQUFNLFFBQVEsR0FBRyxDQUFDO01BQzdCLE1BQU0sU0FBUyxNQUFNO01BQ3JCLE9BQU8sU0FBUyxNQUFNO01BQ3RCLE1BQU0sU0FBUyxNQUFNO01BQ3JCLE1BQU07S0FDUixDQUFDO0tBQ0QsTUFBTSxPQUFPLE9BQU87S0FDcEIsTUFBTSxPQUFPLGlCQUFpQjtLQUM5QixLQUFLLElBQUksTUFBTSxNQUFNO0lBQ3ZCO0dBQ0Y7R0FDQSxJQUFJLE9BQU8sTUFBTSxPQUFPLFVBQVUsVUFBVTtHQUM1QyxLQUFLLE9BQU8sUUFBUSwyQkFBMkIsTUFBTSxPQUFPLFVBQVUsT0FBTyxTQUFTLE1BQU0sS0FBSyxJQUFJO0dBQ3JHLEtBQUssT0FBTyxRQUFRLHNCQUFzQixPQUFPLE9BQU8sVUFBVSxPQUFPLFNBQVMsTUFBTSxLQUFLLElBQUk7RUFDbkc7RUFDQSxTQUFTO0VBQ1Qsc0JBQXNCLElBQUk7Q0FDNUI7Q0FDQSxzQkFBc0IsSUFBSTtDQUMxQixLQUFLLE9BQU8sUUFBUSwyQkFBMkIsT0FBTyxTQUFTLE1BQU0sS0FBSztDQUMxRSxLQUFLLE9BQU8sUUFBUSxzQkFBc0I7Q0FDMUMsT0FBTyxFQUNMLGVBQWU7RUFDYixLQUFLLE1BQU0sT0FBTyxNQUFNLE1BQU07RUFDOUIsTUFBTSxRQUFRO0VBQ2QsT0FBTyxPQUFPLGlCQUFpQjtFQUMvQixPQUFPLFFBQVE7RUFDZixRQUFRO0VBQ1IsT0FBTztDQUNULEVBQ0Y7QUFDRjtBQUVBLE1BQU0sb0JBQW9CO0NBQUM7Q0FBNEI7Q0FBNEI7QUFBMEI7QUFDN0csTUFBTSxtQkFBbUI7QUFDekIsTUFBTSx5QkFBeUI7O0FBRy9CLFNBQVMsZ0JBQ1AsTUFDQSxRQUNZO0NBQ1osSUFBSSxvQkFBb0IsS0FBSyxLQUFLLGVBQWUsd0JBQXdCLENBQUMsS0FBSyxZQUFZLE9BQU8sQ0FBQztDQUNuRyxNQUFNLFFBQW9CLENBQUM7Q0FDM0IsS0FBSyxNQUFNLE1BQU0sbUJBQW1CO0VBQ2xDLE1BQU0sUUFBUSxPQUFPLE1BQU0sVUFBVSxNQUFNLE9BQU8sRUFBRSxDQUFDLEVBQUU7RUFDdkQsSUFBSSxDQUFDLE9BQU87RUFDWixNQUFNLE9BQU8sTUFBTSxTQUFTO0VBQzVCLE1BQU0sUUFBUSxlQUFlO0dBQzNCLE9BQU87R0FDUCxPQUFPO0dBQ1AsT0FBTztHQUNQLFNBQVMsTUFBTSxTQUFTO0dBQ3hCLE1BQU0sT0FBTztHQUNiLE1BQU0sT0FBTztHQUNiLE9BQU8sSUFBSSxNQUFNLFFBQVEsS0FBTSxHQUFJO0dBQ25DLE1BQU07R0FDTixPQUFPO0dBQ1AsTUFBTTtHQUNOLE1BQU0sUUFBUyxHQUFHO0VBQ3BCLENBQUM7RUFDRCxNQUFNLE9BQU8sT0FBTyxHQUFHLEdBQUc7RUFDMUIsTUFBTSxPQUFPLFNBQVMsSUFBSSxNQUFNLFNBQVM7RUFDekMsTUFBTSxPQUFPLFVBQVU7RUFDdkIsSUFBSSxZQUFZLENBQUM7RUFDakIsSUFBSSxTQUFTO0VBQ2IsTUFBTSxPQUFPLGtCQUFrQixhQUFhO0dBQzFDLE1BQU0sUUFBUSxTQUFTLEtBQUssT0FBTztHQUNuQyxJQUFJLFVBQVUsV0FBVztHQUN6QixNQUFNLE1BQU0sWUFBWSxJQUFJLElBQUk7R0FDaEMsTUFBTSxRQUFRLFlBQVksSUFBSSxJQUFJLEtBQUssSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7R0FDNUYsWUFBWTtHQUNaLFNBQVM7R0FDVCxNQUFNLFFBQVEsS0FBSztFQUNyQjtFQUNBLEtBQUssTUFBTSxJQUFJLE1BQU0sTUFBTTtFQUMzQixNQUFNLEtBQUssS0FBSztDQUNsQjtDQUNBLElBQUksQ0FBQyxNQUFNLFFBQVEsT0FBTztDQUMxQixNQUFNLGFBQWE7RUFDakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFFLE9BQU8sUUFBUTtFQUM5QixNQUFNLE9BQU8sS0FBSyxhQUFhLEtBQUssTUFBTTtFQUMxQyxLQUFLLE1BQU0sU0FBUyxPQUFPLE1BQU0sT0FBTyxVQUFVO0VBQ2xELEtBQUssT0FBTyxRQUFRLDJCQUEyQixNQUFNLE9BQU8sTUFBTSxTQUFTLGdCQUFnQixJQUFJO0VBQy9GLHNCQUFzQixJQUFJO0NBQzVCO0NBQ0Esc0JBQXNCLElBQUk7Q0FDMUIsS0FBSyxPQUFPLFFBQVEsMkJBQTJCO0NBQy9DLE9BQU87QUFDVDs7Ozs7Ozs7QUFTQSxTQUFTLGdCQUNQLE1BQ0EsUUFDd0I7Q0FDeEIsTUFBTSxVQUFVLGNBQWMsS0FBSztDQUNuQyxJQUFJLG9CQUFvQixLQUFLLENBQUMsU0FBUyxRQUFRLE9BQU87Q0FDdEQsSUFBSSwyQkFBMkIsQ0FBQyxDQUFDLFNBQVMsUUFBUTtFQUNoRCxLQUFLLE9BQU8sUUFBUSxzQkFBc0I7RUFDMUMsT0FBTztDQUNUO0NBQ0EsTUFBTSxNQUFNLElBQUksTUFBTSxLQUFLO0NBQzNCLE1BQU0sV0FBVyxRQUFRLFNBQVMsV0FBVztFQUMzQyxNQUFNLFFBQVEsT0FBTyxNQUFNLEVBQUUsU0FBUyxPQUFPLE9BQU8sS0FBSyxDQUFDLEVBQUU7RUFDNUQsSUFBSSxDQUFDLE9BQU8sT0FBTyxDQUFDO0VBQ3BCLElBQUksY0FBYyxLQUFLO0VBQ3ZCLE9BQU8sQ0FBQztHQUNOLEdBQUcsTUFBTSxVQUFVLEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsT0FBTyxPQUFPO0dBQzVELEdBQUcsTUFBTSxVQUFVLEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHO0dBQ3hELEdBQUcsTUFBTSxVQUFVLEtBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEdBQUcsT0FBTyxPQUFPO0dBQzVELE1BQU0sT0FBTztHQUNiLFFBQVEsT0FBTztHQUNmLE1BQU0sT0FBTztHQUNiLE1BQU0sT0FBTztHQUNiLE9BQU8sT0FBTztHQUNkLFNBQVMsT0FBTztFQUNsQixDQUFDO0NBQ0gsQ0FBQztDQUNELElBQUksQ0FBQyxTQUFTLFFBQVE7RUFDcEIsS0FBSyxPQUFPLFFBQVEsc0JBQXNCO0VBQzFDLE9BQU87Q0FDVDtDQUNBLE1BQU0sT0FBTyx5QkFBeUI7Q0FDdEMsTUFBTSxRQUFRLGlCQUFpQjtFQUFFO0VBQVUsTUFBTSxJQUFJLE1BQU0sUUFBUSxLQUFLLEdBQUcsS0FBSyxDQUFDO0VBQUcsT0FBTztFQUFjLE1BQU07Q0FBTyxDQUFDO0NBQ3ZILElBQUksWUFBWSxDQUFDO0NBQ2pCLElBQUksU0FBUztDQUNiLE1BQU0sT0FBTyxrQkFBa0IsYUFBYTtFQUMxQyxNQUFNLFFBQVEsU0FBUyxLQUFLLE9BQU87RUFDbkMsSUFBSSxVQUFVLFdBQVc7RUFDekIsTUFBTSxNQUFNLFlBQVksSUFBSSxJQUFJO0VBQ2hDLE1BQU0sUUFBUSxZQUFZLElBQUksSUFBSSxLQUFLLElBQUksd0JBQXdCLEtBQUssSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDO0VBQzVGLFlBQVk7RUFDWixTQUFTO0VBQ1QsTUFBTSxRQUFRLEtBQUs7Q0FDckI7OztDQUdBLE1BQU0sYUFBYTtFQUNqQixJQUFJLENBQUMsTUFBTSxPQUFPLFFBQVE7RUFDMUIsTUFBTSxRQUFRLEtBQUssZUFBZSxLQUFLLE1BQU07RUFDN0MsTUFBTSxPQUFPLFVBQVUsQ0FBQztFQUN4QixLQUFLLE9BQU8sUUFBUSxzQkFBc0IsT0FBTyxTQUFTLEdBQUcsU0FBUyxPQUFPLEdBQUcsTUFBTTtFQUN0RixzQkFBc0IsSUFBSTtDQUM1QjtDQUNBLEtBQUssTUFBTSxJQUFJLE1BQU0sTUFBTTtDQUMzQixzQkFBc0IsSUFBSTtDQUMxQixLQUFLLE9BQU8sUUFBUSxzQkFBc0IsR0FBRyxTQUFTLE9BQU8sR0FBRyxNQUFNO0NBQ3RFLEtBQUssT0FBTyxRQUFRLDZCQUE2QixLQUFLLFVBQVUsU0FBUyxLQUFLLGFBQWE7RUFDekYsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7RUFDdkIsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7RUFDdkIsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7Q0FDekIsRUFBRSxDQUFDO0NBQ0gsT0FBTztBQUNUOztBQUdBLFNBQVMsZUFDUCxNQUNBLFVBQ0EsUUFDdUI7Q0FDdkIsSUFBSSxvQkFBb0IsS0FBSyxLQUFLLGVBQWUsY0FBYyxPQUFPO0NBQ3RFLE1BQU0sTUFBTSxPQUEyQyxPQUFPLE1BQU0sVUFBVSxNQUFNLE9BQU8sRUFBRSxDQUFDLEVBQUU7Q0FDaEcsTUFBTSxhQUFhLEdBQUcsdUJBQXVCO0NBQzdDLE1BQU0sUUFBUSxHQUFHLHlCQUF5QjtDQUMxQyxNQUFNLFFBQW9CLENBQUM7RUFDekIsSUFBSTtFQUFlLEdBQUc7RUFBRyxHQUFHO0VBQUcsR0FBRztFQUFLLE9BQU87RUFDOUMsVUFBVTtFQUFNLE9BQU87RUFBRyxNQUFNO0VBQUssTUFBTTtFQUFLLFFBQVE7RUFBSyxNQUFNO0VBQ25FLE9BQU8sQ0FBQyxDQUFDLEtBQU0sQ0FBQyxHQUFJO0VBQUcsT0FBTztDQUNoQyxDQUFDO0NBQ0QsSUFBSSxZQUFZLE1BQU0sS0FBSztFQUN6QixJQUFJO0VBQWUsR0FBRyxXQUFXLFNBQVMsSUFBSTtFQUFLLEdBQUcsV0FBVyxTQUFTLElBQUk7RUFBSyxHQUFHO0VBQ3RGLFVBQVU7RUFBSyxPQUFPO0VBQUssTUFBTTtFQUFLLE1BQU07RUFBSyxRQUFRO0VBQUssTUFBTTtFQUNwRSxPQUFPLENBQUMsQ0FBQyxJQUFLLENBQUMsRUFBRztFQUFHLE9BQU87Q0FDOUIsQ0FBQztDQUNELElBQUksT0FBTyxNQUFNLEtBQUs7RUFDcEIsSUFBSTtFQUFnQixHQUFHLE1BQU0sU0FBUyxJQUFJO0VBQUssR0FBRyxNQUFNLFNBQVMsSUFBSTtFQUFHLEdBQUc7RUFDM0UsVUFBVTtFQUFLLE9BQU87RUFBSyxNQUFNO0VBQUssTUFBTTtFQUFNLFFBQVE7RUFBSyxNQUFNO0VBQ3JFLE9BQU8sQ0FBQyxDQUFDLElBQUssQ0FBQyxHQUFJO0VBQUcsT0FBTztDQUMvQixDQUFDO0NBQ0QsSUFBSSxNQUFNLFNBQVMsR0FBRyxPQUFPO0NBRTdCLE1BQU0sUUFBUSxnQkFBZ0IsT0FBTyxRQUFRO0NBQzdDLElBQUksU0FBUztDQUNiLElBQUksY0FBYztDQUNsQixNQUFNLGFBQWE7RUFDakIsSUFBSSxDQUFDLE1BQU0sTUFBTSxRQUFRO0VBQ3pCLE1BQU0sTUFBTSxZQUFZLElBQUksSUFBSTtFQUNoQyxNQUFNLFFBQVEsV0FBVyxJQUFJLElBQUksS0FBSyxJQUFJLHdCQUF3QixLQUFLLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztFQUMzRixTQUFTO0VBQ1QsSUFBSSxNQUFNLGNBQWMsSUFBSztHQUMzQixjQUFjO0dBQ2QsTUFBTSxnQkFBZ0IsS0FBSyxlQUFlLEtBQUssQ0FBQztHQUNoRCxNQUFNLGNBQWMsTUFBTSxZQUFZO0dBQ3RDLEtBQUssT0FBTyxRQUFRLGdDQUFnQyxPQUFPLFlBQVksTUFBTTtHQUM3RSxLQUFLLE9BQU8sUUFBUSxpQ0FBaUMsT0FBTyxZQUFZLE9BQU87R0FDL0UsS0FBSyxPQUFPLFFBQVEsZ0NBQWdDLE9BQU8sWUFBWSxNQUFNO0VBQy9FO0VBQ0EsTUFBTSxRQUFRLE9BQU8sS0FBSyxXQUFXLENBQUM7RUFDdEMsc0JBQXNCLElBQUk7Q0FDNUI7Q0FDQSxLQUFLLE1BQU0sSUFBSSxNQUFNLEtBQUs7Q0FDMUIsc0JBQXNCLElBQUk7Q0FDMUIsS0FBSyxPQUFPLFFBQVEsMEJBQTBCLE9BQU8sTUFBTSxNQUFNO0NBQ2pFLEtBQUssT0FBTyxRQUFRLGtDQUFrQyxPQUFPLE1BQU0sUUFBUSxPQUFPLFNBQVMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDO0NBQ2pILE9BQU87QUFDVDs7Ozs7O0FBT0EsU0FBUyxnQkFDUCxNQUNBLFFBQ0EsVUFDc0I7Q0FDdEIsSUFBSSxvQkFBb0IsS0FBSyxDQUFDLHFCQUFxQixJQUFJLEtBQUssVUFBVSxLQUFLLENBQUMsS0FBSyxZQUFZLE9BQU87Q0FDcEcsTUFBTSxRQUFRLE9BQU8sTUFBTSxFQUFFLFNBQVMsT0FBTyxhQUFhLENBQUMsRUFBRTtDQUM3RCxJQUFJLENBQUMsT0FBTyxPQUFPO0NBQ25CLE1BQU0sU0FBUyxlQUFlO0VBQzVCLE9BQU87RUFDUCxPQUFPO0VBQ1AsT0FBTztFQUNQLFNBQVMsTUFBTSxTQUFTO0VBQ3hCLE1BQU0sU0FBUyxNQUFNLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJO0VBQ3JELE1BQU0sU0FBUyxNQUFNLFNBQVMsR0FBRyxNQUFNLFNBQVMsQ0FBQyxJQUFJO0VBQ3JELE9BQU8sSUFBSSxNQUFNLFFBQVEsR0FBRyxDQUFDO0VBQzdCLE1BQU07RUFDTixPQUFPO0VBQ1AsTUFBTTtFQUNOLE1BQU07Q0FDUixDQUFDO0NBQ0QsT0FBTyxPQUFPLE9BQU87Q0FDckIsT0FBTyxPQUFPLFNBQVMsSUFBSSxNQUFNLFNBQVM7Q0FDMUMsT0FBTyxPQUFPLFVBQVU7Q0FDeEIsSUFBSSxZQUFZLENBQUM7Q0FDakIsSUFBSSxTQUFTO0NBQ2IsT0FBTyxPQUFPLGtCQUFrQixhQUFhO0VBQzNDLE1BQU0sUUFBUSxTQUFTLEtBQUssT0FBTztFQUNuQyxJQUFJLFVBQVUsV0FBVztFQUN6QixNQUFNLE1BQU0sWUFBWSxJQUFJLElBQUk7RUFDaEMsTUFBTSxRQUFRLFlBQVksSUFBSSxJQUFJLEtBQUssSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7RUFDNUYsWUFBWTtFQUNaLFNBQVM7RUFDVCxPQUFPLFFBQVEsS0FBSztDQUN0Qjs7O0NBR0EsTUFBTSxhQUFhO0VBQ2pCLElBQUksQ0FBQyxPQUFPLE9BQU8sUUFBUTtFQUMzQixPQUFPLE9BQU8sVUFBVSxLQUFLLGFBQWEsTUFBTTtFQUNoRCxLQUFLLE9BQU8sUUFBUSwyQkFBMkIsT0FBTyxPQUFPLFVBQVUsT0FBTyxnQkFBZ0IsSUFBSTtFQUNsRyxzQkFBc0IsSUFBSTtDQUM1QjtDQUNBLEtBQUssTUFBTSxJQUFJLE9BQU8sTUFBTTtDQUM1QixzQkFBc0IsSUFBSTtDQUMxQixLQUFLLE9BQU8sUUFBUSwyQkFBMkI7Q0FDL0MsT0FBTztBQUNUOzs7Ozs7Ozs7O0FBV0EsTUFBTSw0QkFBNEI7QUFJbEMsTUFBTSw2QkFBNkIsSUFBSSxJQUE0QixDQUNqRSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsSUFBSyxDQUFDLENBQ3JDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JELE1BQU0sa0JBQWtCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0J4QixTQUFTLGtCQUFrQixNQUE0QjtDQUFFLE9BQU8sa0JBQWtCLElBQUk7QUFBRzs7QUFFekYsU0FBUyxvQkFBb0IsT0FBNkI7Q0FDeEQsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLHNCQUFzQixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQzFFLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGtEQUFrRCxDQUFDLENBQ2hGLFFBQVEsMkJBQTJCLG9GQUFvRjtHQUMxSCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLHFGQUFxRixDQUFDLENBQ25ILFFBQVEsMkJBQTJCOzs7Ozs7K0VBTW1DO0VBQzNFO0VBQ0EsU0FBUyw4QkFBOEI7RUFDdkMsU0FBUyxjQUFjO0NBQ3pCO0FBQ0Y7O0FBR0EsU0FBUyx5QkFBeUIsT0FBNkI7Q0FDN0QsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLG1CQUFtQixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQ3ZFLE9BQU8sU0FBUyxtQkFBbUIsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUN2RSxPQUFPLGVBQWUsT0FBTyxhQUMxQixRQUFRLHFCQUFxQiwrQ0FBK0MsQ0FBQyxDQUM3RSxRQUFRLDJCQUEyQixpRkFBaUY7R0FDdkgsT0FBTyxpQkFBaUIsT0FBTyxlQUM1QixRQUFRLHFCQUFxQiwrR0FBK0csQ0FBQyxDQUM3SSxRQUFRLDJCQUEyQjs7Ozs7Z0dBS29EO0VBQzVGO0VBQ0EsU0FBUyw4QkFBOEI7RUFDdkMsU0FBUyxjQUFjO0NBQ3pCO0FBQ0Y7O0FBR0EsU0FBUyxzQkFBc0IsT0FBNkI7Q0FDMUQsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLHVCQUF1QixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQzNFLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGlEQUFpRCxDQUFDLENBQy9FLFFBQVEsMkJBQTJCLG1GQUFtRjtHQUN6SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLHFGQUFxRixDQUFDLENBQ25ILFFBQVEsMkJBQTJCOzs7a0dBR3NEO0VBQzlGO0VBQ0EsU0FBUyw4QkFBOEI7RUFDdkMsU0FBUyxjQUFjO0NBQ3pCO0FBQ0Y7O0FBR0EsU0FBUyxtQkFBbUIsT0FBdUIsT0FBeUIsV0FBVyxPQUFPLFdBQVcsS0FBWTtDQUNuSCxJQUFJLG9CQUFvQixHQUFHO0NBQzNCLE1BQU0sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0NBQ3RDLE1BQU0sUUFBUSxNQUFNLFlBQVksQ0FBQztDQUNqQyxNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLGdCQUFnQixFQUFFLE9BQU8sU0FBUztHQUNsRCxPQUFPLFNBQVMsYUFBYSxFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQ2pFLE9BQU8sU0FBUyxZQUFZLEVBQUUsT0FBTyxJQUFJLE1BQU0sTUFBTSxTQUFTLEVBQUU7R0FDaEUsT0FBTyxTQUFTLGFBQWEsRUFBRSxPQUFPLE1BQU0sS0FBSSxNQUFLLElBQUksTUFBTSxRQUFRLEVBQUUsTUFBTSxHQUFHLEVBQUUsTUFBTSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUNoSCxPQUFPLFNBQVMsV0FBVyxFQUFFLE9BQU8sTUFBTSxTQUFTLE1BQU0sS0FBSSxNQUFLLElBQUksTUFBTSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxRQUFRLENBQUMsRUFBRTtHQUNqSSxPQUFPLFNBQVMsYUFBYSxFQUFFLE9BQU8sTUFBTSxZQUFZLFVBQVUsRUFBRTtHQUNwRSxPQUFPLFNBQVMsZ0JBQWdCLEVBQUUsT0FBTyxJQUFJLE1BQU0sUUFBUSxNQUFNLFdBQVksUUFBUSxHQUFHLE1BQU0sV0FBWSxTQUFTLENBQUMsRUFBRTtHQUN0SCxPQUFPLGVBQWUsT0FBTyxhQUMxQixRQUFRLHFCQUFxQiwrQ0FBK0MsQ0FBQyxDQUM3RSxRQUFRLDJCQUEyQixrRkFBa0Y7R0FDeEgsT0FBTyxpQkFBaUIsT0FBTyxlQUM1QixRQUFRLHFCQUFxQjs7OzBCQUdaLE1BQU0sT0FBTzt3QkFDZixLQUFLLElBQUksR0FBRyxNQUFNLE1BQU0sRUFBRTs7eUNBRVQsQ0FBQyxDQUNqQyxRQUFRLDJCQUEyQjs7Ozs7Ozs7c0JBUXRCLE1BQU0sT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBaUJiLE1BQU0sT0FBTzs7Ozs7Ozt3RUFPcUM7R0FDbEUsSUFBSSxVQUFVLE9BQU8saUJBQWlCLE9BQU8sZUFBZSxRQUFRLG1DQUFtQyxnRkFBZ0Y7RUFDekw7RUFDQSxTQUFTLDhCQUE4QixnQkFBZ0IsTUFBTSxPQUFPLEdBQUcsTUFBTSxPQUFPLEdBQUcsU0FBUztFQUNoRyxTQUFTLGNBQWM7Q0FDekI7QUFDRjs7QUFHQSxTQUFTLHVCQUF1QixPQUE2QjtDQUMzRCxJQUFJLG9CQUFvQixHQUFHO0NBQzNCLE1BQU0sWUFBWSxJQUFJLElBQWdDO0NBQ3RELE1BQU0sVUFBUyxTQUFRO0VBQ3JCLE1BQU0sT0FBTztFQUNiLElBQUksS0FBSyxVQUFVLENBQUMsTUFBTSxRQUFRLEtBQUssUUFBUSxLQUFLLEtBQUssU0FBUywwQkFBMEIsS0FBSyxTQUFTLEtBQUssVUFBVSxJQUFJLEtBQUssUUFBUTtDQUM1SSxDQUFDO0NBQ0QsS0FBSyxNQUFNLFlBQVksV0FBVztFQUNoQyxNQUFNLFVBQVUsU0FBUyxnQkFBZ0IsS0FBSyxRQUFRO0VBQ3RELFNBQVMsbUJBQW1CLFFBQVEsYUFBYTtHQUMvQyxRQUFRLFFBQVEsUUFBUTtHQUN4QixPQUFPLFNBQVMsY0FBYyxFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQ2xFLE9BQU8sU0FBUyxhQUFhLEVBQUUsT0FBTyxJQUFJLE1BQU0sTUFBTSxTQUFTLEVBQUU7R0FDakUsT0FBTyxlQUFlLE9BQU8sYUFDMUIsUUFBUSxxQkFBcUIsaURBQWlELENBQUMsQ0FDL0UsUUFBUSwyQkFBMkIsb0ZBQW9GO0dBQzFILE9BQU8saUJBQWlCLE9BQU8sZUFDNUIsUUFBUSxxQkFBcUIsd0ZBQXdGLENBQUMsQ0FDdEgsUUFBUSwyQkFBMkI7Ozs7Ozs7O2tGQVFzQztFQUM5RTtFQUNBLFNBQVMsOEJBQThCO0VBQ3ZDLFNBQVMsY0FBYztDQUN6QjtBQUNGOztBQUdBLFNBQVMsbUJBQW1CLE9BQTZCO0NBQ3ZELElBQUksb0JBQW9CLEdBQUc7Q0FDM0IsTUFBTSxVQUFTLFNBQVE7RUFDckIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxDQUFDLEtBQUssVUFBVSxNQUFNLFFBQVEsS0FBSyxRQUFRLEtBQUssQ0FBQyxLQUFLLFNBQVMsd0JBQXdCO0VBQzNGLE1BQU0sV0FBVyxLQUFLLFVBQVUsVUFBVSxTQUFTLGdCQUFnQixLQUFLLFFBQVE7RUFDaEYsU0FBUyxtQkFBbUIsUUFBUSxhQUFhO0dBQy9DLFFBQVEsUUFBUSxRQUFRO0dBQ3hCLE9BQU8sU0FBUyxnQkFBZ0IsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUNwRSxPQUFPLFNBQVMsZUFBZSxFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQ25FLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGdEQUFnRCxDQUFDLENBQzlFLFFBQVEsMkJBQTJCLGtGQUFrRjtHQUN4SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLDJGQUEyRixDQUFDLENBQ3pILFFBQVEsMkJBQTJCOzs7Ozs7Ozs7O2tHQVVzRDtFQUM5RjtFQUNBLFNBQVMsOEJBQThCO0VBQ3ZDLFNBQVMsY0FBYztDQUN6QixDQUFDO0FBQ0g7O0FBR0EsU0FBUyxpQkFBaUIsTUFBd0I7Q0FDaEQsSUFBSSxLQUFLLGVBQWUsZUFBZSxvQkFBb0IsR0FBRyxhQUFhO0NBQzNFLE1BQU0sWUFBWSxJQUFJLElBQWdDO0NBQ3RELEtBQUssTUFBTSxVQUFTLFNBQVE7RUFDMUIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxDQUFDLEtBQUssUUFBUTtFQUNsQixLQUFLLE1BQU0sWUFBWSxNQUFNLFFBQVEsS0FBSyxRQUFRLElBQUksS0FBSyxXQUFXLENBQUMsS0FBSyxRQUFRLEdBQUc7R0FDckYsSUFBSyxTQUF3QywyQkFBMkIsU0FBUyxTQUFTLG1CQUFtQixTQUFTLFNBQVMsZ0JBQWdCLFVBQVUsSUFBSSxRQUFzQztFQUNyTTtDQUNGLENBQUM7Q0FDRCxNQUFNLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEtBQUksYUFBWTtFQUM3QyxNQUFNLFVBQVUsU0FBUyxpQkFBaUIsTUFBTSxTQUFTO0VBQ3pELE1BQU0sV0FBVyxJQUFJLEtBQUssUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLFNBQVMsU0FBUztFQUNqRSxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxLQUFLLFVBQVUsUUFBUSxRQUFRO0dBQ3ZDLElBQUksT0FBTztJQUNULE9BQU8saUJBQWlCLE9BQU8sZUFBZSxRQUFRLHVEQUF1RDs7Ozs7OztvREFPakU7R0FDOUMsT0FBTztJQUNMLE9BQU8sU0FBUyxvQkFBb0IsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtJQUN4RSxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLG9EQUFvRCxDQUFDLENBQ2xGLFFBQVEsd0NBQXdDLDBHQUEwRztHQUMvSjtFQUNGO0VBQ0EsU0FBUyw4QkFBOEIsR0FBRyxTQUFTLHFCQUFxQixRQUFRLFVBQVU7RUFDMUYsU0FBUyxjQUFjO0VBQ3ZCLGFBQWE7R0FBRSxTQUFTLGtCQUFrQjtHQUFTLFNBQVMsd0JBQXdCO0dBQUssU0FBUyxjQUFjO0VBQU07Q0FDeEgsQ0FBQztDQUNELGFBQWE7RUFBRSxLQUFLLE1BQU0sU0FBUyxTQUFTLE1BQU07Q0FBRztBQUN2RDs7QUFHQSxTQUFTLHVCQUF1QixPQUF1QixXQUF3RDtDQUM3RyxJQUFJLG9CQUFvQixHQUFHO0NBQzNCLE1BQU0sUUFBUSxZQUFZLENBQUMsRUFBRSxTQUFTLENBQUM7Q0FDdkMsTUFBTSxRQUFRLEVBQUUsT0FBTyxNQUFNLEtBQUksU0FBUSxJQUFJLE1BQU0sU0FBUyxLQUFLLE9BQU8sS0FBSyxRQUFRLElBQUksS0FBSyxPQUFPLEtBQUssUUFBUSxJQUFJLEtBQUssT0FBTyxLQUFLLFFBQVEsS0FBTyxLQUFLLE9BQU8sS0FBSyxRQUFRLEVBQUksQ0FBQyxFQUFFO0NBQ3RMLE1BQU0sV0FBVyxFQUFFLE9BQU8sSUFBSSxhQUFhLE1BQU0sTUFBTSxFQUFFO0NBQ3pELE1BQU0sVUFBUyxTQUFRO0VBQ3JCLE1BQU0sT0FBTztFQUNiLElBQUksQ0FBQyxLQUFLLFVBQVUsTUFBTSxRQUFRLEtBQUssUUFBUSxLQUFLLENBQUMsS0FBSyxTQUFTLHdCQUF3QjtFQUMzRixNQUFNLGVBQWUsS0FBSyxlQUFlLEtBQUssSUFBSTtFQUNsRCxLQUFLLGtCQUFrQixVQUFVLE9BQU8sUUFBUSxVQUFVLFVBQVUsVUFBVTtHQUM1RSxhQUFhLFVBQVUsT0FBTyxRQUFRLFVBQVUsVUFBVSxLQUFLO0dBQy9ELE1BQU0sUUFBUSxZQUFZO0dBQzFCLE1BQU0sU0FBUyxNQUFNLFVBQVU7SUFBRSxTQUFTLE1BQU0sU0FBUyxPQUFPLGdCQUFnQixTQUFTLEtBQUssRUFBRSxJQUFJLElBQUk7R0FBRyxDQUFDO0VBQzlHO0VBQ0EsTUFBTSxXQUFXLEtBQUssVUFBVSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUNoRixNQUFNLFdBQVcsU0FBUyxzQkFBc0I7RUFDaEQsU0FBUyxtQkFBbUIsUUFBUSxhQUFhO0dBQy9DLFFBQVEsUUFBUSxRQUFRO0dBQ3hCLE9BQU8sU0FBUyxrQkFBa0IsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUN0RSxPQUFPLFNBQVMsbUJBQW1CLEVBQUUsT0FBTyxJQUFJLE1BQU0sTUFBTSxTQUFTLEVBQUU7R0FDdkUsT0FBTyxTQUFTLG9CQUFvQjtHQUNwQyxPQUFPLFNBQVMsdUJBQXVCO0dBQ3ZDLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGdEQUFnRCxDQUFDLENBQzlFLFFBQVEsMkJBQTJCLG1GQUFtRjtHQUN6SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCOzs7RUFHcEMsTUFBTSxTQUFTLGtDQUFrQyxNQUFNLE9BQU8seUNBQXlDLE1BQU0sT0FBTyxNQUFNLElBQUksQ0FBQyxDQUN4SCxRQUFRLDJCQUEyQjs7d0dBRTRELENBQUMsQ0FDaEcsUUFBUSxtQ0FBbUM7RUFDbEQsTUFBTSxTQUFTLHVCQUF1QixNQUFNLE9BQU87Ozs7S0FJaEQsSUFBSTtFQUNMO0VBQ0EsU0FBUyw4QkFBOEIsR0FBRyxTQUFTLHVCQUF1QixNQUFNO0VBQ2hGLFNBQVMsY0FBYztDQUN6QixDQUFDO0FBQ0g7O0FBR0EsU0FBUyxtQkFBbUIsT0FBNkI7Q0FDdkQsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLENBQUMsS0FBSyxVQUFVLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxDQUFDLEtBQUssU0FBUyx3QkFBd0I7RUFDM0YsTUFBTSxXQUFXLEtBQUssVUFBVSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUNoRixNQUFNLFdBQVcsU0FBUyxzQkFBc0I7RUFDaEQsU0FBUyxtQkFBbUIsUUFBUSxhQUFhO0dBQy9DLFFBQVEsUUFBUSxRQUFRO0dBQ3hCLE9BQU8sU0FBUyxpQkFBaUIsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUNyRSxPQUFPLFNBQVMsa0JBQWtCLEVBQUUsT0FBTyxJQUFJLE1BQU0sTUFBTSxTQUFTLEVBQUU7R0FDdEUsT0FBTyxlQUFlLE9BQU8sYUFDMUIsUUFBUSxxQkFBcUIsK0NBQStDLENBQUMsQ0FDN0UsUUFBUSwyQkFBMkIsa0ZBQWtGO0dBQ3hILE9BQU8saUJBQWlCLE9BQU8sZUFDNUIsUUFBUSxxQkFBcUI7Ozs7O0VBS3BDLENBQUMsQ0FDTSxRQUFRLDJCQUEyQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NGQXFCMEMsQ0FBQyxDQUM5RSxRQUFRLG1DQUFtQyxpR0FBaUc7RUFDako7RUFDQSxTQUFTLDhCQUE4QixHQUFHLFNBQVM7RUFDbkQsU0FBUyxjQUFjO0NBQ3pCLENBQUM7QUFDSDs7O0FBSUEsU0FBUyxzQkFBc0IsT0FBdUIsUUFBMkIsYUFBMEIsQ0FBQyxHQUFTO0NBQ25ILElBQUksb0JBQW9CLEtBQUssT0FBTyxTQUFTLEdBQUc7Q0FDaEQsTUFBTSxXQUFXLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssTUFBTSxJQUFJLE1BQU0sUUFBUSxPQUFPLEVBQUUsQ0FBRSxHQUFHLE9BQU8sRUFBRSxDQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDO0NBQzVHLE1BQU0sWUFBWSxJQUFJLElBQWdDO0NBQ3RELE1BQU0sVUFBUyxTQUFRO0VBQ3JCLE1BQU0sT0FBTztFQUNiLElBQUksS0FBSyxVQUFVLENBQUMsTUFBTSxRQUFRLEtBQUssUUFBUSxLQUFLLEtBQUssU0FBUywwQkFBMEIsS0FBSyxTQUFTLEtBQUssVUFBVSxJQUFJLEtBQUssUUFBUTtDQUM1SSxDQUFDO0NBQ0QsS0FBSyxNQUFNLFlBQVksV0FBVztFQUNoQyxNQUFNLFVBQVUsU0FBUyxnQkFBZ0IsS0FBSyxRQUFRO0VBQ3RELFNBQVMsbUJBQW1CLFFBQVEsYUFBYTtHQUMvQyxRQUFRLFFBQVEsUUFBUTtHQUN4QixPQUFPLFNBQVMsb0JBQW9CLEVBQUUsT0FBTyxTQUFTO0dBQ3RELE9BQU8sU0FBUyxpQkFBaUIsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUNyRSxPQUFPLFNBQVMsZUFBZSxFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sV0FBVyxTQUFTLFlBQVksU0FBUyxFQUFFO0dBQ25HLE9BQU8sU0FBUyxpQkFBaUIsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUNyRSxPQUFPLFNBQVMsaUJBQWlCLEVBQUUsT0FBTyxXQUFXLEtBQUksTUFBSyxJQUFJLE1BQU0sUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO0dBQ2pILE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLDZDQUE2QyxDQUFDLENBQzNFLFFBQVEsMkJBQTJCLGdGQUFnRjtHQUN0SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLCtFQUErRSxTQUFTLE9BQU8sZ0RBQWdELFdBQVcsU0FBUywrREFBK0QsV0FBVyxPQUFPLE1BQU0sSUFBSSxDQUFDLENBQzVSLFFBQVEsMkJBQTJCOztzQkFFdEIsU0FBUyxPQUFPOzs7Ozs7OztFQVFwQyxXQUFXLFNBQVM7c0JBQ0EsV0FBVyxPQUFPOzs7Ozt3RkFLZ0QsR0FBRzs4RkFDRyxXQUFXLFNBQVMsU0FBUyxPQUFPOzs7MEZBR3hDLFdBQVcsU0FBUyxTQUFTLE9BQU87a0VBQzVELFdBQVcsU0FBUyxTQUFTLE9BQU8sMkNBQTJDO0VBQzdJO0VBQ0EsU0FBUyw4QkFBOEIsMEJBQTBCLFNBQVMsT0FBTyxHQUFHLFdBQVc7RUFDL0YsU0FBUyxjQUFjO0NBQ3pCO0FBQ0Y7O0FBR0EsU0FBUyxxQkFBcUIsT0FBdUIsVUFBa0IsV0FBbUIsV0FBbUIsWUFBb0IsVUFBd0I7Q0FDdkosSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLGlCQUFpQixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sUUFBUSxFQUFFO0dBQ3BFLE9BQU8sU0FBUyxrQkFBa0IsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUN0RSxPQUFPLFNBQVMsbUJBQW1CLEVBQUUsT0FBTyxJQUFJLE1BQU0sUUFBUSxXQUFXLFVBQVUsRUFBRTtHQUNyRixPQUFPLFNBQVMsaUJBQWlCLEVBQUUsT0FBTyxTQUFTO0dBQ25ELE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLCtDQUErQyxDQUFDLENBQzdFLFFBQVEsMkJBQTJCLGtGQUFrRjtHQUN4SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLDZKQUE2SixDQUFDLENBQzNMLFFBQVEsMkJBQTJCOzs7eUlBRzZGO0VBQ3JJO0VBQ0EsU0FBUyw4QkFBOEI7RUFDdkMsU0FBUyxjQUFjO0NBQ3pCO0FBQ0Y7O0FBR0EsU0FBUyw4QkFBOEIsT0FBNkI7Q0FDbEUsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsMEJBQTBCLEtBQUssU0FBUyxLQUFLLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDNUksQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLHNCQUFzQixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQzFFLE9BQU8sU0FBUyxtQkFBbUIsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUN2RSxPQUFPLGVBQWUsT0FBTyxhQUMxQixRQUFRLHFCQUFxQixnREFBZ0QsQ0FBQyxDQUM5RSxRQUFRLDJCQUEyQixrRkFBa0Y7R0FDeEgsT0FBTyxpQkFBaUIsT0FBTyxlQUM1QixRQUFRLHFCQUFxQixtSEFBbUgsQ0FBQyxDQUNqSixRQUFRLDJCQUEyQjs7Ozs7Ozs7Ozs7Ozs7OzhGQWVrRDtFQUMxRjtFQUNBLFNBQVMsOEJBQThCO0VBQ3ZDLFNBQVMsY0FBYztDQUN6QjtBQUNGOztBQUdBLFNBQVMsb0JBQW9CLE9BQTZCO0NBQ3hELElBQUksb0JBQW9CLEdBQUc7Q0FDM0IsTUFBTSxZQUFZLElBQUksSUFBZ0M7Q0FDdEQsTUFBTSxVQUFTLFNBQVE7RUFDckIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLFFBQVEsS0FBSyxRQUFRLEtBQUssS0FBSyxTQUFTLDBCQUEwQixLQUFLLFNBQVMsS0FBSyxVQUFVLElBQUksS0FBSyxRQUFRO0NBQzVJLENBQUM7Q0FDRCxLQUFLLE1BQU0sWUFBWSxXQUFXO0VBQ2hDLE1BQU0sVUFBVSxTQUFTLGdCQUFnQixLQUFLLFFBQVE7RUFDdEQsU0FBUyxtQkFBbUIsUUFBUSxhQUFhO0dBQy9DLFFBQVEsUUFBUSxRQUFRO0dBQ3hCLE9BQU8sU0FBUyxlQUFlLEVBQUUsT0FBTyxJQUFJLE1BQU0sTUFBTSxTQUFTLEVBQUU7R0FDbkUsT0FBTyxTQUFTLGlCQUFpQixFQUFFLE9BQU8sSUFBSSxNQUFNLE1BQU0sU0FBUyxFQUFFO0dBQ3JFLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGlEQUFpRCxDQUFDLENBQy9FLFFBQVEsMkJBQTJCLG1GQUFtRjtHQUN6SCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQVEscUJBQXFCLDJHQUEyRyxDQUFDLENBQ3pJLFFBQVEsMkJBQTJCOzs7Ozs7OztpR0FRcUQ7RUFDN0Y7RUFDQSxTQUFTLDhCQUE4QjtFQUN2QyxTQUFTLGNBQWM7Q0FDekI7QUFDRjs7QUFHQSxTQUFTLG9CQUFvQixPQUF1QixXQUFXLE9BQWE7Q0FDMUUsSUFBSSxvQkFBb0IsR0FBRztDQUMzQixNQUFNLFlBQVksSUFBSSxJQUFnQztDQUN0RCxNQUFNLFVBQVMsU0FBUTtFQUNyQixNQUFNLE9BQU87RUFDYixJQUFJLEtBQUssVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLFFBQVEsS0FBSyxLQUFLLFNBQVMsd0JBQXdCLFVBQVUsSUFBSSxLQUFLLFFBQVE7Q0FDdkgsQ0FBQztDQUNELEtBQUssTUFBTSxZQUFZLFdBQVc7RUFDaEMsTUFBTSxVQUFVLFNBQVMsZ0JBQWdCLEtBQUssUUFBUTtFQUN0RCxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLGNBQWMsRUFBRSxPQUFPLElBQUksTUFBTSxNQUFNLFNBQVMsRUFBRTtHQUNsRSxPQUFPLGVBQWUsT0FBTyxhQUMxQixRQUFRLHFCQUFxQixnREFBZ0QsQ0FBQyxDQUM5RSxRQUFRLDJCQUEyQixtRkFBbUY7R0FDekgsT0FBTyxpQkFBaUIsT0FBTyxlQUM1QixRQUFRLHFCQUFxQiwyRUFBMkU7R0FDM0csSUFBSSxVQUFVOztJQUVaLE9BQU8saUJBQWlCLE9BQU8sZUFBZSxRQUFRLG1DQUFtQzs7NEZBRUw7R0FDdEYsT0FBTztJQUNMLE9BQU8saUJBQWlCLE9BQU8sZUFBZSxRQUFRLDJCQUEyQjs7Ozs4Q0FJM0M7R0FDeEM7RUFDRjtFQUNBLFNBQVMsOEJBQThCLG9CQUFvQjtFQUMzRCxTQUFTLGNBQWM7Q0FDekI7QUFDRjtBQUVBLFNBQVMsdUJBQXVCLE9BQXVCLE1BQVksaUJBQWlCLE9BQWE7O0NBRS9GLE1BQU0sWUFBWSxJQUFJLElBQW9CO0NBQzFDLE1BQU0sVUFBVSxTQUFTO0VBQ3ZCLE1BQU0sT0FBTztFQUNiLElBQUksQ0FBQyxLQUFLLFFBQVE7RUFDbEIsSUFBSSxDQUFDLGdCQUFnQixLQUFLLGNBQWM7RUFDeEMsS0FBSyxNQUFNLFlBQVksTUFBTSxRQUFRLEtBQUssUUFBUSxJQUFJLEtBQUssV0FBVyxDQUFDLEtBQUssUUFBUSxHQUFHLFVBQVUsSUFBSSxRQUFRO0NBQy9HLENBQUM7Q0FDRCxNQUFNLGNBQWMsTUFBTSxLQUFLLEVBQUUsUUFBUSxzQkFBc0IsU0FBUyxJQUFJLE1BQU0sUUFBUSxDQUFDO0NBQzNGLE1BQU0sWUFBWSxFQUFFLE9BQU8sRUFBRTtDQUM3QixNQUFNLGVBQWUsRUFBRSxPQUFPLEVBQUU7Q0FDaEMsTUFBTSxnQkFBZ0IsRUFBRSxPQUFPLFFBQVEsVUFBVSxXQUFXLHFCQUFxQjtDQUNqRixNQUFNLGNBQWMsRUFBRSxPQUFPLFFBQVEsVUFBVSxXQUFXLGFBQWE7Q0FDdkUsTUFBTSxpQkFBZ0MsQ0FBQztDQUN2QyxNQUFNLG9CQUFvQixFQUFFLE9BQU8sUUFBUSxVQUFVLFdBQVcsa0JBQWtCO0NBQ2xGLE1BQU0sZ0JBQWdCLEVBQUUsT0FBTyxRQUFRLFVBQVUsV0FBVyxjQUFjO0NBQzFFLE1BQU0sbUJBQW1CLEVBQUUsT0FBTyxRQUFRLFVBQVUsV0FBVyxpQkFBaUI7Q0FDaEYsTUFBTSxtQkFBbUIsQ0FBQyxvQkFBb0I7Q0FDOUMsSUFBSSxtQkFBbUIsQ0FBQztDQUN4QixNQUFNLG9CQUFvQixhQUFrQztFQUMxRCxJQUFJLFNBQVMsS0FBSyxPQUFPLFVBQVUsa0JBQWtCO0VBQ3JELG1CQUFtQixTQUFTLEtBQUssT0FBTzs7RUFFeEMsa0JBQWtCLFFBQVEsUUFBUSxVQUFVLFdBQVc7RUFDdkQsY0FBYyxRQUFRLFFBQVEsVUFBVSxXQUFXO0VBQ25ELGlCQUFpQixRQUFRLFFBQVEsVUFBVSxXQUFXO0VBQ3RELE1BQU0sV0FBVyxLQUFLLGdCQUFnQjtFQUN0QyxhQUFhLFFBQVEsVUFBVSxZQUFZO0VBQzNDLGVBQWUsU0FBUztFQUN4QixLQUFLLE1BQU0sVUFBVSxVQUFVLFdBQVcsQ0FBQyxHQUFHO0dBQzVDLElBQUksT0FBTyxTQUFTLFNBQVMsZUFBZSxLQUFLLE1BQU07RUFDekQ7RUFDQSxlQUFlLE1BQU0sR0FBRyxNQUFNLGtCQUFrQixDQUFDLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFLEdBQUcsY0FBYyxFQUFFLEVBQUUsQ0FBQztFQUNyRyxVQUFVLFFBQVEsS0FBSyxJQUFJLGVBQWUsUUFBUSxxQkFBcUI7RUFDdkUsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLHVCQUF1QixTQUFTLEdBQUc7R0FDN0QsTUFBTSxTQUFTLFFBQVEsVUFBVSxRQUFRLGVBQWUsU0FBUztHQUNqRSxZQUFZLE1BQU0sQ0FBRSxJQUFJLFFBQVEsS0FBSyxHQUFHLFFBQVEsS0FBSyxHQUFHLFFBQVEsVUFBVSxHQUFHLFdBQVcsTUFBTSxJQUFJLElBQUksQ0FBQztFQUN6RztFQUNBLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPLFFBQVEsaUNBQWlDLE9BQU8sVUFBVSxLQUFLO0NBQ2xHO0NBQ0EsS0FBSyxNQUFNLFlBQVksV0FBVztFQUNoQyxJQUFJLENBQUUsU0FBd0Msd0JBQXdCO0VBQ3RFLE1BQU0sVUFBVSxTQUFTLGdCQUFnQixLQUFLLFFBQVE7OztFQUd0RCxJQUFJLENBQUMsZ0JBQWdCO0dBQ25CLFNBQVMsY0FBYztHQUN2QixTQUFTLGFBQWE7RUFDeEI7RUFDQSxTQUFTLG1CQUFtQixRQUFRLGFBQWE7R0FDL0MsUUFBUSxRQUFRLFFBQVE7R0FDeEIsT0FBTyxTQUFTLDJCQUEyQjtHQUMzQyxPQUFPLFNBQVMsOEJBQThCO0dBQzlDLE9BQU8sU0FBUywrQkFBK0I7R0FDL0MsT0FBTyxTQUFTLDZCQUE2QjtHQUM3QyxPQUFPLFNBQVMsdUJBQXVCLEVBQUUsT0FBTyxZQUFZO0dBQzVELE9BQU8sU0FBUyxtQ0FBbUM7R0FDbkQsT0FBTyxTQUFTLCtCQUErQjtHQUMvQyxPQUFPLFNBQVMsa0NBQWtDO0dBQ2xELE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGtEQUFrRCxDQUFDLENBQ2hGLFFBQVEsMkJBQTJCLG9GQUFvRjtHQUMxSCxPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQ0MscUJBQ0Esb1FBQW9RLHNCQUFzQixHQUM1UixDQUFDLENBQ0EsUUFDQyxtQ0FDQSxnSUFBZ0ksc0JBQXNCLDI4QkFDeEo7R0FFRixJQUFJLGtCQUFrQjs7OztJQUlwQixPQUFPLGlCQUFpQixPQUFPLGVBQzVCLFFBQ0MscUNBQ0EsaUxBQ0YsQ0FBQyxDQUNBLFFBQ0Msd0NBQ0Esa0lBQ0YsQ0FBQyxDQUNBLFFBQ0MsMkZBQ0EsNlZBQ0YsQ0FBQyxDQUNBLFFBQVEsOEJBQThCLEdBQUcsZ0JBQWdCLDZCQUE2QjtHQUMzRjtFQUNGO0VBQ0EsU0FBUyxjQUFjO0NBQ3pCO0NBQ0EsTUFBTSxVQUFVLFNBQVM7RUFDdkIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxLQUFLLFFBQVEsS0FBSyxpQkFBaUI7Q0FDekMsQ0FBQztDQUNELElBQUksQ0FBQyxnQkFBZ0I7RUFDbkIsS0FBSyxPQUFPLFFBQVEsMkJBQTJCO0VBQy9DLEtBQUssT0FBTyxRQUFRLGlDQUFpQztDQUN2RDtBQUNGO0FBRUEsU0FBUyxrQkFBa0IsUUFBNkI7Q0FDdEQsSUFBSSxPQUFPLFNBQVMsUUFBUSxPQUFPO0NBQ25DLElBQUksT0FBTyxTQUFTLGNBQWMsT0FBTztDQUN6QyxJQUFJLE9BQU8sU0FBUyxhQUFhLE9BQU8sU0FBUyxnQkFBZ0IsT0FBTztDQUN4RSxPQUFPO0FBQ1Q7QUFFQSxTQUFTLFdBQVcsUUFBMEM7Q0FDNUQsT0FBTyxRQUFRLFNBQVMsVUFBVSxRQUFRLFNBQVM7QUFDckQ7Ozs7Ozs7QUFRQSxTQUFTLHNCQUFzQixNQUFZLFVBQWlFO0NBQzFHLE1BQU0sT0FBTywyQkFBMkIsSUFBSSxLQUFLLFVBQVU7Q0FDM0QsSUFBSSxDQUFDLE1BQU0sT0FBTyxDQUFDO0NBQ25CLE9BQU8sYUFBYSxDQUFDLENBQ2xCLFFBQVEsV0FBVyxPQUFPLFNBQVMsYUFBYSxDQUFDLENBQ2pELEtBQUssV0FBVyx3QkFBd0I7RUFDdkMsR0FBRyxPQUFPO0VBQ1YsR0FBRyxPQUFPO0VBQ1YsUUFBUSxPQUFPO0VBQ2YsVUFBVSxTQUFTLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxLQUFLO0VBQzlDO0NBQ0YsQ0FBQyxDQUFDO0FBQ047QUFFQSxTQUFTLGtCQUFrQixNQUE0QjtDQUNyRCxNQUFNLFVBQVUsSUFBSSxJQUFvQjtDQUN4QyxLQUFLLE1BQU0sVUFBVSxXQUFXO0VBQzlCLElBQ0UsT0FBTyxTQUFTLGtCQUFrQixRQUNsQyxPQUFPLFNBQVMsaUJBQWlCLFFBQ2pDLG9CQUFvQixJQUFJLE9BQU8sT0FBTyxTQUFTLFNBQVMsQ0FBQyxLQUN6RCxPQUFPLFNBQVMsaUJBQ2hCLE9BQU8sU0FBUyx3QkFDaEIsT0FBTyxLQUFLLFdBQVcsaUJBQWlCLEdBQ3hDLFFBQVEsSUFBSSxNQUFNO0NBQ3RCLENBQUM7Q0FDRCxJQUFJLEtBQUssZUFBZSxRQUFRLElBQUksS0FBSyxhQUFhO0NBQ3RELE1BQU0sU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsS0FBSyxZQUFZO0VBQUU7RUFBUSxTQUFTLE9BQU87Q0FBUSxFQUFFO0NBQ2pGLEtBQUssTUFBTSxFQUFFLFlBQVksUUFBUSxPQUFPLFVBQVU7Q0FDbEQsT0FBTztBQUNUO0FBRUEsU0FBUyxtQkFBbUIsWUFBb0IsVUFBb0IsVUFBcUU7Q0FDdkksTUFBTSxXQUFXLHVCQUF1QjtDQUN4QyxNQUFNLFVBQVUsU0FBUyxXQUFXLFdBQVcsV0FBVyxDQUFDO0NBQzNELElBQUksQ0FBQyxZQUFZLFFBQVEsV0FBVyxHQUFHLE9BQU87Ozs7Q0FJOUMsSUFBSSxPQUFPLFdBQVcsZUFBZSxJQUFJLGdCQUFnQixPQUFPLFNBQVMsTUFBTSxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsR0FBRyxPQUFPO0NBQy9HLE1BQU0sT0FBTyxRQUFRLFdBQVc7Q0FDaEMsTUFBTSxPQUFPLFFBQVEsV0FBVztDQUNoQyxNQUFNLFFBQVEsSUFBSSxNQUFNLE1BQU07Q0FDOUIsTUFBTSxPQUFPO0NBQ2IsTUFBTSxTQUFTLGFBQWE7Q0FDNUIsS0FBSyxNQUFNLFVBQVUsU0FBUztFQUM1QixNQUFNLFVBQVUsU0FBUyxTQUFTLE9BQU87RUFDekMsTUFBTSxTQUFTLE9BQU8sVUFBVSxDQUFDO0VBQ2pDLElBQUksQ0FBQyxXQUFXLE9BQU8sU0FBUyxtQkFBbUIsT0FBTyxTQUFTLFdBQVcsT0FBTyxTQUFTLEtBQUssQ0FBQyxPQUFPLFdBQVc7RUFDdEgsTUFBTSxJQUFJLGtCQUFrQjtHQUMxQixNQUFNLHlCQUF5QixPQUFPO0dBQ3RDO0dBQ0EsV0FBVyxPQUFPO0dBQ2xCLFdBQVcsU0FBUzs7OztHQUlwQixXQUFXLFNBQVMsZUFBZSxlQUFlLEtBQUssU0FBUzs7O0dBR2hFLE9BQU8sUUFBUSxVQUFVLFNBQVMsT0FBTyxRQUFRLE9BQU8sUUFBUTtHQUNoRSxRQUFRLFFBQVEsVUFBVSxDQUFDO0dBQzNCLFdBQVcsUUFBUTtHQUNuQixXQUFXLFFBQVE7R0FDbkIsVUFBVSxRQUFRO0dBQ2xCLFVBQVUsUUFBUTtHQUNsQixLQUFLO0lBQUU7SUFBVSxHQUFHLFNBQVM7R0FBSTtFQUNuQyxDQUFDLENBQUM7Q0FDSjtDQUNBLE1BQU0sSUFBSSxzQkFBc0I7RUFDOUIsTUFBTTtFQUNOLE9BQU8sU0FBUyxZQUFZLEtBQUssZUFBZSxXQUFXLE1BQU07RUFDakUsV0FBVyxTQUFTLGVBQWUsZUFBZSxLQUFLLFNBQVMsY0FBYztFQUM5RSxPQUFPLFFBQVEsT0FBTyxRQUFRO0NBQ2hDLENBQUMsQ0FBQzs7Ozs7Q0FLRixNQUFNLE9BQU8sUUFBUSxRQUFRLFdBQVcsT0FBTyxTQUFTLFVBQVUsT0FBTyxTQUFTLFVBQVUsT0FBTyxTQUFTLFNBQVM7Q0FDckgsSUFBSSxTQUFTLGNBQWMsYUFBYSxLQUFLLFNBQVMsR0FBRztFQUN2RCxNQUFNLFlBQVksS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLFNBQVMsSUFBSSxPQUFRLElBQUksUUFBUyxDQUFDLENBQUM7RUFDNUUsTUFBTSxJQUFJLGdCQUFnQjtHQUN4QixNQUFNO0dBQ04sTUFBTSxLQUFLLEtBQUssU0FBUztJQUFFLE1BQU0sSUFBSTtJQUFPLE1BQU0sSUFBSTtJQUFPLE1BQU0sSUFBSTtJQUFPLE1BQU0sSUFBSTtHQUFNLEVBQUU7R0FDaEc7R0FDQSxXQUFXLFNBQVMsZUFBZSxlQUFlLEtBQUssU0FBUztHQUNoRSxPQUFPLFFBQVEsT0FBTyxRQUFRLFNBQVM7RUFDekMsQ0FBQyxDQUFDO0NBQ0o7Q0FDQSxJQUFJLE1BQU0sU0FBUyxXQUFXLEdBQUcsT0FBTztDQUN4QyxNQUFNLFFBQVE7RUFBRSxPQUFPLENBQUM7RUFBRyxNQUFNO0NBQUU7Q0FDbkMsTUFBTSxXQUFXLGFBQXdDO0VBQ3ZELElBQUksU0FBUyxLQUFLLE9BQU8sVUFBVSxNQUFNLE9BQU87RUFDaEQsTUFBTSxRQUFRLFNBQVMsS0FBSyxPQUFPO0VBQ25DLE1BQU0sTUFBTSxZQUFZLElBQUk7RUFDNUIsTUFBTSxRQUFRLE1BQU0sU0FBUyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUssS0FBSyxJQUFJLElBQUksTUFBTSxNQUFNLFFBQVEsR0FBSSxDQUFDO0VBQ3pGLE1BQU0sT0FBTztFQUNiLEtBQUssTUFBTSxTQUFTLE1BQU0sVUFBVSxvQkFBb0IsT0FBcUIsS0FBSztDQUNwRjtDQUNBLEtBQUssTUFBTSxTQUFTLE1BQU0sVUFBVSxBQUFDLE1BQXFCLGlCQUFpQjtDQUMzRSxPQUFPO0FBQ1Q7QUFFQSxTQUFTLG1CQUNQLFNBQ0EsVUFDQSxVQUNBLFFBQ0EsWUFDd0I7Q0FDeEIsTUFBTSxTQUFTLFFBQVEsb0JBQW9CLFVBQVUsSUFBSTtDQUN6RCxJQUFJLENBQUMsVUFBVSxNQUFNLFFBQVEsT0FBTyxRQUFRLEdBQUcsT0FBTztDQUN0RCxTQUFTLGtCQUFrQixJQUFJO0NBQy9CLE1BQU0sUUFBUSxJQUFJLE1BQU0sUUFBUTtDQUNoQyxJQUFJLGNBQWMsT0FBTztDQUN6QixJQUFJLGNBQWM7Q0FDbEIsSUFBSSxpQkFBaUIsT0FBTztDQUM1QixTQUFTLFVBQVUsV0FBVztFQUM1QixNQUFNLE9BQU87RUFDYixNQUFNLFdBQVcsS0FBSyxTQUFTLEtBQUssU0FBUyxhQUFhLFVBQVUsSUFBSTtFQUN4RSxJQUFJLENBQUMsVUFBVTtFQUNmLEtBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxTQUFTLE9BQU8sU0FBUyxHQUFHO0dBQ3RELE1BQU0sb0JBQW9CLFVBQW1DLEtBQUs7R0FDbEUsS0FBSyxhQUFhLEtBQUs7R0FDdkIsaUJBQWlCLEtBQUssSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztHQUN4RixNQUFNLFNBQVMsS0FBSyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUM7R0FDMUMsSUFBSSxTQUFTLGFBQWE7SUFDeEIsY0FBYztJQUNkLGNBQWMsTUFBTTtHQUN0QjtFQUNGO0NBQ0YsQ0FBQztDQUNELE1BQU0sZ0JBQWdCLGVBQWUscUJBQXFCLGVBQWU7Q0FDekUsTUFBTSxRQUFRLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQztDQUNyRSxNQUFNLFFBQVEsS0FBSyxJQUFJLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDO0NBQ3JFLElBQUksQ0FBQyxPQUFPLFNBQVMsV0FBVyxLQUFNLENBQUMsaUJBQWlCLGtCQUFrQixLQUFLLElBQUksT0FBTyxLQUFLLElBQUksSUFBTSxPQUFPOztDQUVoSCxJQUFJLGVBQWUsY0FBYzs7Q0FHakMsSUFBSSxlQUFlLGtCQUFrQixjQUFjLEtBQUssSUFBSSxhQUFhLEtBQUssTUFBTSxPQUFPLEtBQUssSUFBSSxFQUFFO0NBRXRHLE1BQU0sZUFBZTtDQUNyQixNQUFNLE9BQWdDLENBQUM7Q0FDdkMsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLGNBQWMsU0FBUyxHQUFHLEtBQUssS0FBSyxDQUFDLE1BQU0sVUFBVSxLQUFLLENBQUMsT0FBTyxPQUFPLFFBQVEsWUFBWSxHQUFHLENBQUMsS0FBSyxDQUFDO0NBQ25JLEtBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxjQUFjLFNBQVMsR0FBRyxLQUFLLEtBQUssQ0FBQyxPQUFPLE1BQU0sVUFBVSxLQUFLLENBQUMsT0FBTyxPQUFPLFFBQVEsWUFBWSxDQUFDLENBQUM7Q0FDbEksS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLGNBQWMsU0FBUyxHQUFHLEtBQUssS0FBSyxDQUFDLE1BQU0sVUFBVSxLQUFLLE9BQU8sQ0FBQyxPQUFPLFFBQVEsWUFBWSxHQUFHLEtBQUssQ0FBQztDQUNsSSxLQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsY0FBYyxTQUFTLEdBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxPQUFPLE1BQU0sVUFBVSxLQUFLLE9BQU8sQ0FBQyxPQUFPLFFBQVEsWUFBWSxDQUFDLENBQUM7Q0FDbkksTUFBTSxRQUFRLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEtBQUssTUFBTSxjQUFjLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztDQUM3RixNQUFNLFlBQXNCLENBQUM7Q0FDN0IsTUFBTSxNQUFnQixDQUFDO0NBQ3ZCLE1BQU0sVUFBb0IsQ0FBQztDQUMzQixLQUFLLElBQUksT0FBTyxHQUFHLFFBQVEsT0FBTyxRQUFRLEdBQUc7RUFDM0MsTUFBTSxNQUFNLE9BQU87RUFDbkIsTUFBTSxRQUFRLE1BQU0sT0FBTyxJQUFJLElBQUk7RUFDbkMsS0FBSyxNQUFNLENBQUMsUUFBUSxXQUFXLE1BQU07R0FDbkMsTUFBTSxjQUFjLEtBQUssTUFBTSxRQUFRLE1BQU07R0FDN0MsTUFBTSxTQUFTLFNBQVMsY0FBYztHQUN0QyxNQUFNLFNBQVMsU0FBUyxjQUFjO0dBQ3RDLE1BQU0sSUFBSSxNQUFNLFVBQVUsS0FBSyxRQUFRLFFBQVEsR0FBRztHQUNsRCxNQUFNLElBQUksTUFBTSxVQUFVLEtBQUssUUFBUSxRQUFRLEdBQUc7R0FDbEQsTUFBTSxXQUFXLEtBQUssTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNO0dBQ2xELE1BQU0sV0FBVyxZQUFZLDRCQUE0QjtHQUN6RCxNQUFNLGNBQWMsWUFBWSw0QkFBNEIsV0FBVyw0QkFBNEIsSUFBSTtHQUN2RyxNQUFNLFVBQVUsU0FBUyxTQUFTLGNBQWM7R0FDaEQsTUFBTSxVQUFVLFNBQVMsU0FBUyxjQUFjO0dBQ2hELFVBQVUsS0FBSyxHQUFHLE1BQU0sVUFBVSxLQUFLLFNBQVMsUUFBUSxNQUFNLEdBQUcsYUFBYSxLQUFLLEdBQUcsQ0FBQztHQUN2RixNQUFNLE1BQU8sZUFBZSxvQkFBb0IsZ0JBQWlCLElBQUk7R0FDckUsTUFBTSxNQUFPLGVBQWUsb0JBQW9CLGdCQUFpQixJQUFJO0dBQ3JFLElBQUksTUFBTSxNQUFNLE9BQU8sSUFBSSxNQUFNLE9BQU8sSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLFFBQVEsT0FBTyxJQUFJLElBQUksT0FBTyxJQUFJLEVBQUU7RUFDckg7Q0FDRjtDQUNBLEtBQUssSUFBSSxPQUFPLEdBQUcsT0FBTyxPQUFPLFFBQVEsR0FBRztFQUMxQyxLQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsS0FBSyxRQUFRLFNBQVMsR0FBRztHQUNuRCxNQUFNLFFBQVEsUUFBUSxLQUFLLEtBQUs7R0FDaEMsTUFBTSxJQUFJLE9BQU8sS0FBSyxTQUFTO0dBQy9CLE1BQU0sSUFBSSxPQUFPLEtBQUssU0FBUztHQUMvQixNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssU0FBUztHQUNyQyxNQUFNLEtBQUssT0FBTyxLQUFLLEtBQUssU0FBUztHQUNyQyxRQUFRLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDL0I7Q0FDRjtDQUNBLE1BQU0sV0FBVyxJQUFJLE1BQU0sZUFBZTtDQUMxQyxTQUFTLGFBQWEsWUFBWSxJQUFJLE1BQU0sdUJBQXVCLFdBQVcsQ0FBQyxDQUFDO0NBQ2hGLFNBQVMsYUFBYSxNQUFNLElBQUksTUFBTSx1QkFBdUIsS0FBSyxDQUFDLENBQUM7Q0FDcEUsU0FBUyxhQUFhLE9BQU8sSUFBSSxNQUFNLHVCQUF1QixLQUFLLENBQUMsQ0FBQztDQUNyRSxTQUFTLFNBQVMsT0FBTztDQUN6QixTQUFTLHFCQUFxQjtDQUM5QixTQUFTLHNCQUFzQjtDQUMvQixNQUFNLFdBQVcsT0FBTyxTQUFTLE1BQU07Q0FDdkMsSUFBSSxlQUFlLG9CQUFvQixlQUFlO0VBQ3BELE1BQU0sU0FBUztFQUNmLElBQUksT0FBTyxLQUFLO0dBQ2QsT0FBTyxNQUFNLE9BQU8sSUFBSSxNQUFNO0dBQzlCLE9BQU8sSUFBSSxRQUFRLE9BQU8sSUFBSSxRQUFRLE1BQU07R0FDNUMsT0FBTyxJQUFJLGNBQWM7RUFDM0I7Q0FDRjtDQUNBLFNBQVMsT0FBTyxNQUFNO0NBQ3RCLEFBQUMsU0FBZ0QsTUFBTTtDQUN2RCxTQUFTLGFBQWE7Q0FDdEIsU0FBUyxtQkFBbUIsV0FBVztFQUNyQyxPQUFPLGVBQWUsT0FBTyxhQUFhLFFBQ3hDLDZCQUNBLHFFQUNGO0NBQ0Y7Ozs7Q0FJQSxNQUFNLFFBQVEsb0JBQW9CLFVBQVU7Q0FDNUMsSUFBSSxPQUFPLGtCQUFrQixVQUFVLEtBQUs7Q0FDNUMsTUFBTSxlQUFlLElBQUksTUFBTSxLQUFLLFVBQVUsUUFBUTtDQUN0RCxhQUFhLGdCQUFnQjtDQUM3QixhQUFhLFNBQVMsZUFBZSxRQUFRLFlBQVk7Q0FDekQsYUFBYSxnQkFBZ0I7Q0FDN0IsYUFBYSxjQUFjLENBQUM7Q0FDNUIsYUFBYSxPQUFPO0NBQ3BCLGFBQWEsU0FBUyxzQkFBc0I7Q0FDNUMsT0FBTztBQUNUO0FBRUEsT0FBTyxTQUFTLDJCQUEyQixNQUF3QjtDQUNqRSxNQUFNLFdBQVcsU0FBUyxLQUFLO0NBQy9CLEtBQUssT0FBTyxRQUFRLHlCQUF5QixLQUFLO0NBQ2xELElBQUksMkJBQTJCLENBQUMsQ0FBQyxTQUFTLFFBQVE7RUFDaEQsS0FBSyxPQUFPLFFBQVEsa0NBQWtDO0VBQ3RELFFBQVEsS0FBSyxRQUFRLFFBQVEsU0FBUztFQUN0QyxhQUFhO0NBQ2Y7Q0FDQSxJQUFJLENBQUMsWUFBWSxTQUFTLFNBQVMsV0FBVyxLQUFLLFFBQVE7RUFDekQsS0FBSyxPQUFPLFFBQVEsa0NBQWtDO0VBQ3RELFFBQVEsS0FBSyxRQUFRLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyw0QkFBNEI7RUFDdkcsT0FBTyxpQkFBaUIsSUFBSTtDQUM5QjtDQUNBLElBQUksV0FBVztDQUNmLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSTtDQUNKLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSTtDQUNKLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSSxhQUF5QixDQUFDO0NBQzlCLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSTtDQUNKLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSSxRQUE2QixDQUFDO0NBQ2xDLElBQUksWUFBaUMsQ0FBQztDQUN0QyxJQUFJO0NBQ0osSUFBSSxlQUErQixDQUFDO0NBQ3BDLElBQUk7Q0FDSixJQUFJO0NBQ0osSUFBSSxhQUFhO0NBQ2pCLElBQUk7Q0FDSixJQUFJLHVCQUFzRTtDQUMxRSxNQUFNLHNCQUFzQixxQkFBcUIsS0FBSyxRQUFRLG9CQUFvQjtDQUNsRixLQUFLLE9BQU8saUJBQWlCLG9CQUFvQixhQUFhO0NBQzlELEtBQUssT0FBTyxRQUFRLGlDQUFpQztDQUNyRCxLQUFLLE9BQU8sUUFBUSxrQ0FBa0M7Q0FDdEQsS0FBSyxPQUFPLFFBQVEsa0NBQWtDO0NBQ3RELFFBQVEsS0FBSyxRQUFRLFdBQVcsU0FBUztDQUN6QyxNQUFNLFNBQVMsa0JBQWtCLEtBQUssUUFBUSxXQUFXO0NBQ3pELE1BQU0sc0JBQXNCO0VBQzFCLElBQUksZUFBZTtHQUNqQixnQkFBZ0IsYUFBYTtHQUM3QixLQUFLLE9BQU8sUUFBUSxpQ0FBaUM7RUFDdkQ7RUFDQSxJQUFJLGdCQUFnQjtHQUNsQixnQkFBZ0IsY0FBYztHQUM5QixLQUFLLE9BQU8sUUFBUSxrQ0FBa0M7RUFDeEQ7RUFDQSxnQkFBZ0I7RUFDaEIsaUJBQWlCO0NBQ25CO0NBQ0EsTUFBTSxZQUFZLFVBQW1CO0VBQ25DLElBQUksWUFBWTtFQUNoQixhQUFhO0VBQ2IsY0FBYztFQUNkLElBQUksQ0FBQyxVQUFVLFFBQVEsS0FBSyxRQUFRLFVBQVUsV0FBVyxXQUFXLFdBQVcsV0FBVyxxQkFBcUIsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLFdBQVc7Q0FDcks7Q0FDQSxNQUFNLHNCQUFzQjtFQUMxQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLFlBQVk7RUFDckQsTUFBTSxjQUFjO0VBQ3BCLE1BQU0sZUFBZTtFQUNyQixNQUFNLGlCQUFpQixRQUFRLGFBQWEsSUFBSTtFQUNoRCxNQUFNLGtCQUFrQixRQUFRLGNBQWMsS0FBSztFQUNuRCxJQUFJO0dBQ0YsTUFBTSxlQUFlLGFBQWEsZ0JBQWdCLFNBQVMsUUFBUTtHQUNuRSxNQUFNLGdCQUFnQixjQUFjLGlCQUFpQixTQUFTLGtCQUFrQixTQUFTLFNBQVMsYUFBYTtHQUMvRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZTtJQUNuQyxLQUFLLE9BQU8sUUFBUSx3QkFBd0IsV0FBVyxhQUFhLFlBQVk7SUFDaEYsTUFBTSxJQUFJLE1BQU0sMkJBQTJCO0dBQzdDO0dBQ0EsTUFBTSxXQUFXLGVBQWUsYUFBYSxjQUFjO0dBQzNELElBQUksVUFBVSxNQUFNLElBQUksTUFBTSx3QkFBd0I7R0FDdEQsWUFBWSxzQkFBc0IsTUFBTSxRQUFRO0dBQ2hELFlBQVksT0FBTztHQUNuQixJQUFJLEtBQUssb0JBQW9CLDBCQUEwQixhQUFhLEtBQUssa0JBQWtCO0dBQzNGLElBQUksS0FBSyxlQUFlLGlCQUFpQixvQkFBb0IsV0FBVztHQUN4RSxJQUFJLEtBQUssZUFBZSxZQUFZLHlCQUF5QixXQUFXO0dBQ3hFLElBQUksS0FBSyxlQUFlLGNBQWMsc0JBQXNCLFdBQVc7R0FDdkUsSUFBSSxLQUFLLGVBQWUsc0JBQXNCLDhCQUE4QixXQUFXO0dBQ3ZGLElBQUksS0FBSyxlQUFlLGNBQWMsb0JBQW9CLFdBQVc7R0FDckUsSUFBSSxLQUFLLGVBQWUsbUJBQW1CLG9CQUFvQixXQUFXO0dBQzFFLElBQUksS0FBSyxlQUFlLGtCQUFrQixtQkFBbUIsV0FBVztHQUN4RSxJQUFJLEtBQUssZUFBZSxtQkFBbUIsbUJBQW1CLFdBQVc7R0FDekUsSUFBSSxLQUFLLGVBQWUscUJBQXFCLHVCQUF1QixhQUFhLEtBQUssa0JBQWtCO0dBQ3hHLElBQUksS0FBSyxlQUFlLG1CQUFtQixxQkFBcUIsYUFBYSxXQUFXLFdBQVcsQ0FBQyxLQUFNLE1BQU0sR0FBSTtHQUNwSCxJQUFJLEtBQUssZUFBZSxnQkFBZ0IscUJBQXFCLGFBQWEsV0FBVyxXQUFXLENBQUMsS0FBSyxJQUFLLEdBQUk7R0FDL0csSUFBSSxLQUFLLGVBQWUsZUFBZSx1QkFBdUIsV0FBVztHQUN6RSxJQUFJLEtBQUssZUFBZSxtQkFBbUIsU0FBUyxTQUFTLFdBQVcsWUFBWSxzQkFBc0IsYUFBYSxTQUFTLFNBQVMsVUFBVSxXQUFXLE1BQU07R0FDcEssSUFBSSxLQUFLLGVBQWUsa0JBQWtCLFNBQVMsU0FBUyxXQUFXLHFCQUFxQixzQkFBc0IsYUFBYSxTQUFTLFNBQVMsVUFBVSxvQkFBb0IsTUFBTTtHQUNyTCxJQUFJLEtBQUssZUFBZSxpQkFBaUIsU0FBUyxTQUFTLFdBQVcsY0FBYyxzQkFBc0IsYUFBYSxTQUFTLFNBQVMsVUFBVSxjQUFjLFNBQVMsU0FBUyxVQUFVLDJCQUEyQjtHQUN4TixJQUFJLEtBQUssZUFBZSxnQkFBZ0IscUJBQXFCLGFBQWEsV0FBVyxXQUFXLEtBQUssS0FBSyxHQUFJO0dBQzlHLElBQUksS0FBSyxlQUFlLGlCQUFpQixxQkFBcUIsYUFBYSxXQUFXLFdBQVcsSUFBSyxLQUFLLEdBQUk7R0FDL0csSUFBSSxLQUFLLGVBQWUsZ0JBQWdCLHFCQUFxQixhQUFhLFdBQVcsV0FBVyxJQUFLLEtBQUssR0FBSTtHQUM5RyxJQUFJLEtBQUssZUFBZSxhQUFhLHFCQUFxQixhQUFhLFdBQVcsV0FBVyxLQUFLLEtBQUssR0FBSTtHQUMzRyxJQUFJLEtBQUssZUFBZSx1QkFBdUIscUJBQXFCLGFBQWEsV0FBVyxXQUFXLENBQUMsS0FBSyxLQUFLLEdBQUk7R0FDdEgsS0FBSyxLQUFLLGVBQWUsbUJBQW1CLEtBQUssZUFBZSxrQkFBa0IsS0FBSyxlQUFlLHNCQUFzQixLQUFLLGVBQWUsa0JBQWtCLFNBQVMsU0FBUyxXQUFXLG1CQUFtQixhQUFhLFNBQVMsU0FBUyxXQUFXLE9BQU8sS0FBSyxlQUFlLHFCQUFxQixLQUFPLEtBQUssZUFBZSxnQkFBZ0IsTUFBTyxHQUFJO0dBQ2xXLElBQUksS0FBSyxXQUFXLHVCQUF1QixhQUFhLElBQUk7UUFDdkQ7SUFDSCxLQUFLLE9BQU8sUUFBUSwyQkFBMkI7SUFDL0MsS0FBSyxPQUFPLFFBQVEsaUNBQWlDO0dBQ3ZEO0dBQ0EsTUFBTSxRQUFRLFNBQVMsU0FBUztHQUNoQyxhQUFhLE9BQU8sTUFBTTtHQUMxQixhQUFhLFNBQVMsVUFBVSxNQUFNLFFBQVE7R0FDOUMsYUFBYSxTQUFTLElBQUksR0FBRyxNQUFNLFFBQVE7R0FDM0MsYUFBYSxNQUFNLFVBQVUsTUFBTSxLQUFLO0dBQ3hDLGdCQUFnQixZQUFZO0dBQzVCLElBQUksS0FBSyxlQUFlLG1CQUFtQixvQkFBb0IsY0FBYyxJQUFJO0dBQ2pGLElBQUksS0FBSyxlQUFlLGtCQUFrQixTQUFTLFNBQVMsV0FBVyxtQkFBbUIsY0FBYyxTQUFTLFNBQVMsV0FBVyxJQUFJO0dBQ3pJLElBQUksU0FBUyxTQUFTLGNBQWMsVUFBVSw4QkFBOEI7SUFDMUUsS0FBSyxPQUFPLFFBQVEsa0NBQWtDLE9BQU8sY0FBYyxhQUFhLGNBQWMsZUFBZSxNQUFNLENBQUM7R0FDOUg7R0FDQSxNQUFNLFlBQVksbUJBQW1CLGFBQWEsY0FBYyxVQUFVLGVBQWUsUUFBUSxLQUFLLFVBQVU7R0FDaEgsSUFBSSxLQUFLLGVBQWUscUJBQXFCLFdBQVcsbUJBQW1CLFNBQVM7R0FDcEYsSUFBSSxLQUFLLGVBQWUsdUJBQXVCLFdBQVcsdUJBQXVCLFdBQVcsS0FBSyxrQkFBa0I7R0FDbkgsSUFBSSxLQUFLLGVBQWUsb0JBQW9CLEtBQUssYUFBYSxXQUFXO0lBQ3ZFLE1BQU0sV0FBVyxVQUFVO0lBQzNCLE1BQU0sYUFBYSxTQUFTLHNCQUFzQjtJQUNsRCxNQUFNLGNBQWMsVUFBVTtJQUM5Qix1QkFBdUIsV0FBVyxJQUFJO0lBQ3RDLFVBQVUsY0FBYztJQUN4QixTQUFTLDhCQUE4QixHQUFHLFdBQVc7R0FDdkQ7R0FDQSxNQUFNLG1CQUFtQixtQkFBbUIsS0FBSyxZQUFZLFNBQVMsVUFBVSxRQUFRO0dBQ3hGLFVBQVU7R0FDVixXQUFXO0dBQ1gsUUFBUTtHQUNSLGVBQWU7R0FDZixnQkFBZ0I7R0FDaEIsaUJBQWlCO0dBQ2pCLE1BQU0sa0JBQW9DLENBQUMsYUFBYSxHQUFHLFVBQVUsS0FBSSxTQUFRLEtBQUssS0FBSyxDQUFDO0dBQzVGLElBQUksa0JBQWtCLGdCQUFnQixLQUFLLGdCQUFnQjtHQUMzRCx3QkFBd0IsMEJBQTBCLFVBQVUsZUFBZTtHQUMzRSxLQUFLLGdDQUFnQztHQUNyQyxLQUFLLE1BQU0sSUFBSSxhQUFhLFlBQVk7R0FDeEMsSUFBSSxXQUFXLEtBQUssTUFBTSxJQUFJLFNBQVM7R0FDdkMsUUFBUTtHQUNSLFlBQVksQ0FBQztHQUNiLEtBQUssTUFBTSxRQUFRLE9BQU8sS0FBSyxNQUFNLElBQUksS0FBSyxLQUFLO0dBQ25ELEtBQUssT0FBTyxRQUFRLDRCQUE0QixPQUFPLE1BQU0sTUFBTTtHQUNuRSxLQUFLLE9BQU8sUUFBUSxxQ0FBcUMsS0FBSyxVQUFVLE1BQU0sS0FBSyxTQUFTLEtBQUssV0FBVyxDQUFDO0dBQzdHLElBQUksa0JBQWtCLEtBQUssTUFBTSxJQUFJLGdCQUFnQjtHQUNyRCxLQUFLLE9BQU8sUUFBUSw2QkFBNkIsT0FDL0Msa0JBQWtCLFNBQVMsUUFBUSxVQUFVLE1BQU0sS0FBSyxTQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUMxRjtHQUNBLEtBQUssT0FBTyxRQUFRLDBCQUEwQixPQUM1QyxrQkFBa0IsU0FBUyxRQUFRLFVBQVUsTUFBTSxLQUFLLFNBQVMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQ3hGO0dBQ0EsS0FBSyxPQUFPLFFBQVEsdUNBQXVDLEtBQUssVUFDOUQsa0JBQWtCLFNBQ2YsUUFBUSxVQUFVLE1BQU0sS0FBSyxTQUFTLFVBQVUsQ0FBQyxDQUFDLENBQ2xELEtBQUssVUFBVSxNQUFNLFNBQVMsZUFBZSxLQUFLLENBQUMsQ0FDeEQ7R0FDQSxlQUFlLGtCQUFrQixJQUFJOzs7R0FHckMsSUFBSTtJQUNGLGNBQWMsaUJBQWlCLE1BQU0sVUFBVSxlQUFlLE1BQU07SUFDcEUsSUFBSSxhQUFhLGdCQUFnQixLQUFLLFlBQVksSUFBSTtHQUN4RCxTQUFTLE9BQU87SUFDZCxNQUFNLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0lBQ3pELEtBQUssT0FBTyxRQUFRLDRCQUE0QixVQUFVO0lBQzFELHFCQUFxQixLQUFLLFFBQVEsdUJBQXVCLFNBQVM7R0FDcEU7R0FDQSxJQUFJO0lBQ0YsV0FBVyxjQUFjLE1BQU0sZUFBZSxNQUFNO0dBQ3RELFNBQVMsT0FBTztJQUNkLEtBQUssT0FBTyxRQUFRLHNCQUFzQixVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtHQUMvRjtHQUNBLElBQUk7SUFDRixpQkFBaUIsb0JBQW9CLE1BQU0sYUFBYSxLQUFLLFNBQVMsQ0FBQztHQUN6RSxTQUFTLE9BQU87SUFDZCxLQUFLLE9BQU8sUUFBUSxzQkFBc0IsVUFBVSxpQkFBaUIsUUFBUSxNQUFNLFVBQVU7R0FDL0Y7R0FDQSxLQUFLLE9BQU8sUUFBUSxpQ0FBaUM7R0FDckQsS0FBSyxPQUFPLFFBQVEsa0NBQWtDO0dBQ3RELEtBQUssT0FBTyxRQUFRLDZCQUE2QixPQUFPLGFBQWEsTUFBTTtHQUMzRSxLQUFLLE9BQU8sUUFBUSxtQ0FBbUMsYUFDcEQsS0FBSyxFQUFFLGFBQWEsT0FBTyxRQUFRLE9BQU8sT0FBTyxTQUFTLFNBQVMsQ0FBQyxDQUFDLENBQ3JFLE9BQU8sT0FBTyxDQUFDLENBQ2YsS0FBSyxHQUFHO0dBQ1gsS0FBSyxPQUFPLFFBQVEsNkJBQTZCLFlBQVksNkJBQTZCOzs7O0dBSTFGLEtBQUssT0FBTyxRQUFRLDZCQUE2QixPQUFPLFdBQVcsU0FBUyxnQkFBZ0IsTUFBTTs7Ozs7R0FLbEcsTUFBTSxZQUFZLG1CQUFtQjtHQUNyQyxJQUFJLGNBQWMsT0FBTyxLQUFLLE9BQU8sUUFBUSwrQkFBK0I7UUFDdkU7SUFDSCxNQUFNLFVBQVU7S0FDZCxVQUFVLG9CQUFvQixjQUFjLFVBQVU7S0FDdEQsT0FBTyxvQkFBb0IsV0FBVyxPQUFPO0tBQzdDLFNBQVMsb0JBQW9CLGFBQWEsU0FBUztJQUNyRDs7SUFFQSxJQUFJLGNBQWMsUUFBUTtLQUN4QixZQUFZLFVBQVU7S0FDdEIsSUFBSSxXQUFXLFVBQVUsVUFBVTtJQUNyQztJQUNBLEtBQUssT0FBTyxRQUFRLCtCQUNsQixHQUFHLFVBQVUsWUFBWSxRQUFRLFNBQVMsU0FBUyxRQUFRLE1BQU0sV0FBVyxRQUFRO0dBQ3hGO0dBQ0EsS0FBSyxPQUFPLFFBQVEsZ0NBQWdDOztHQUVwRCxLQUFLLE9BQU8sUUFBUSwyQkFBMkI7R0FDL0MsS0FBSyxPQUFPLFFBQVEsNEJBQTRCO0dBQ2hELEtBQUssT0FBTyxRQUFRLDhCQUE4QjtHQUNsRCxNQUFNLFNBQVMsa0JBQWtCLFNBQVMsVUFBVSxLQUFLLFVBQVU7R0FDbkUsS0FBSyxPQUFPLFFBQVEsaUNBQWlDLE9BQU8sT0FBTyxNQUFNO0dBQ3pFLE1BQU0sZ0JBQWdCLElBQUksSUFBMkI7R0FDckQsTUFBTSxjQUF3QixDQUFDO0dBQy9CLE1BQU0sZ0JBQWdCLElBQUksTUFBTSxNQUFNO0dBQ3RDLGNBQWMsT0FBTztHQUNyQixjQUFjLFNBQVMsYUFBYTtHQUNwQyxNQUFNLFlBQVksT0FBTyxVQUE4RDtJQUNyRixJQUFJO0tBQ0YsTUFBTSxNQUFNLGlCQUFpQixNQUFNLEtBQU07S0FDekMsTUFBTSxhQUFhLGdCQUFnQjtLQUNuQyxJQUFJLENBQUMsWUFBWTtNQUNmLFlBQVksS0FBSyxHQUFHLE1BQU0sR0FBRyxvQkFBb0I7TUFDakQsT0FBTztLQUNUOztLQUVBLE1BQU0sU0FBUyxNQUFNLE9BQU8sVUFBVSxNQUFNLFdBQVcsQ0FBQyxFQUFDLENBQUU7S0FDM0QsTUFBTSxPQUFPLE1BQU07S0FDbkIsTUFBTSxTQUFTLGdCQUFnQjtLQUMvQixNQUFNLFNBQVMsYUFBYTtLQUM1QixNQUFNLFNBQVMsSUFBSSxNQUFNLFNBQVMsSUFBSSxTQUFTLE1BQU0sU0FBUyxJQUFJLE1BQU0sU0FBUyxFQUFFLElBQUksTUFBTSxTQUFTLElBQUksTUFBTSxTQUFTLEVBQUU7S0FDM0gsTUFBTSxTQUFTLElBQUksR0FBRyxNQUFNLFFBQVE7S0FDcEMsTUFBTSxNQUFNLFVBQVUsTUFBTSxLQUFLO0tBQ2pDLFFBQVEsT0FBTyxLQUFLOzs7S0FHcEIsY0FBYyxJQUFJLE1BQU0sSUFBSSx5QkFBeUIsT0FBTyxNQUFNLEVBQUUsQ0FBQztLQUNyRSxJQUFJLEtBQUssZUFBZSxrQkFBa0I7TUFDeEMsTUFBTSxPQUFPLDJCQUEyQixJQUFJLEtBQUssVUFBVSxLQUFLLE1BQU0sT0FBTztNQUM3RSxNQUFNLG9CQUFvQixrQkFBa0IsS0FBSztNQUNqRCxNQUFNLFFBQVEsT0FDVjtPQUFFLFdBQVc7T0FBMkIsTUFBTSx1QkFBdUI7TUFBSyxJQUN6RSxlQUFlLEtBQUssV0FBVyxHQUFHLE1BQU0sUUFDckMsc0JBQXNCLFlBQVk7T0FBRSxXQUFXO09BQW1CLE1BQU0sdUJBQXVCO01BQUssSUFBSTtNQUNoSCwwQkFBMEIsT0FBTyxPQUFPLEtBQUssVUFBVTtLQUN6RCxPQUFPLElBQUksTUFBTSxPQUFPLGtCQUFrQjs7O01BR3hDLE1BQU0sVUFBVSxTQUFTO09BQ3ZCLE1BQU0sT0FBTztPQUNiLElBQUksS0FBSyxVQUFVLENBQUMsTUFBTSxRQUFRLEtBQUssUUFBUSxLQUFLLEtBQUssU0FBUyx3QkFBd0I7UUFDeEYsS0FBSyxTQUFTLE1BQU0sZUFBZSxJQUFJO09BQ3pDO01BQ0YsQ0FBQztNQUNELHVCQUF1QixPQUFPLE1BQU0sSUFBSTtLQUMxQztLQUNBLElBQUksS0FBSyxlQUFlLGNBQWMscUJBQXFCLE1BQU0sUUFBUSxXQUFXO01BQ2xGLGtCQUFrQixPQUFPLHFCQUFxQixNQUFNLEdBQUk7S0FDMUQ7S0FDQSxjQUFjLE9BQU8sS0FBSyxZQUFZLE1BQU0sRUFBRTtLQUM5QyxJQUFJLEtBQUssb0JBQW9CLDBCQUEwQixPQUFPLEtBQUssa0JBQWtCO0tBQ3JGLE9BQU87SUFDVCxRQUFRO0tBQ04sWUFBWSxLQUFLLEdBQUcsTUFBTSxHQUFHLGdCQUFnQjtLQUM3QyxPQUFPO0lBQ1Q7R0FDRjtHQUNBLEtBQUssUUFBUSxJQUFJLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sV0FBVztJQUN2RCxLQUFLLE1BQU0sU0FBUyxRQUFRLElBQUksT0FBTyxjQUFjLElBQUksS0FBSztJQUM5RCxJQUFJLFVBQVU7S0FDWixnQkFBZ0IsYUFBYTtLQUM3QixLQUFLLE9BQU8sUUFBUSxrQ0FBa0M7S0FDdEQ7SUFDRjtJQUNBLElBQUk7S0FDRix1QkFBdUIsMkJBQTJCLFVBQ2hELGNBQWMsU0FBUyxLQUFJLFdBQVU7TUFBRTtNQUFPLE9BQU8sT0FBTyxNQUFLLFVBQVMsTUFBTSxPQUFPLE1BQU0sSUFBSTtLQUFHLEVBQUUsQ0FBQztJQUMzRyxTQUFTLE9BQU87S0FDZCxnQkFBZ0IsYUFBYTtLQUM3QixLQUFLLE9BQU8sUUFBUSxrQ0FBa0M7S0FDdEQsS0FBSyxPQUFPLFFBQVEsb0NBQW9DLGtDQUFrQyxPQUFPLEtBQUs7S0FDdEcsUUFBUSxLQUFLLFFBQVEsVUFBVSxXQUFXLGdCQUFnQixXQUFXLGlCQUFpQixnQ0FBZ0M7S0FDdEg7SUFDRjtJQUNBLElBQUksc0JBQXNCO0tBQ3hCLHdCQUF3QjtLQUN4Qix3QkFBd0IsMEJBQTBCLHFCQUFxQixVQUNyRSxDQUFDLEdBQUcsaUJBQWlCLEdBQUcscUJBQXFCLFFBQVEsQ0FBQztLQUN4RCxLQUFLLGdDQUFnQztJQUN2QztJQUNBLEtBQUssT0FBTyxRQUFRLDZCQUE2QixPQUFPLHNCQUFzQixTQUFTLFVBQVUsQ0FBQztJQUNsRyxZQUFZO0lBQ1osS0FBSyxNQUFNLElBQUksYUFBYTtJQUM1QixJQUFJO0tBQ0YsbUJBQW1CLHNCQUNqQixNQUNBLGNBQWMsU0FBUyxLQUFLLFdBQVc7TUFBRSxJQUFJLE1BQU07TUFBTTtLQUFNLEVBQUUsR0FDakUsVUFDQSxhQUFhLEtBQUssU0FBUyxHQUMzQixlQUFlLE1BQ2pCO0lBQ0YsU0FBUyxPQUFPO0tBQ2QsS0FBSyxPQUFPLFFBQVEsK0JBQStCLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0lBQ3hHO0lBQ0EsSUFBSTtLQUNGLGVBQWUsa0JBQ2IsTUFDQSxjQUFjLFNBQVMsS0FBSyxXQUFXO01BQUUsSUFBSSxNQUFNO01BQU07S0FBTSxFQUFFLEdBQ2pFLGFBQWEsS0FBSyxTQUFTLENBQzdCO0lBQ0YsU0FBUyxPQUFPO0tBQ2QsS0FBSyxPQUFPLFFBQVEsNkJBQTZCLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0lBQ3RHO0lBQ0EsSUFBSTtLQUNGLGFBQWEsZ0JBQ1gsTUFDQSxjQUFjLFNBQVMsS0FBSyxXQUFXO01BQUUsSUFBSSxNQUFNO01BQU07S0FBTSxFQUFFLEdBQ2pFLGFBQWEsS0FBSyxTQUFTLENBQzdCO0lBQ0YsU0FBUyxPQUFPO0tBQ2QsS0FBSyxPQUFPLFFBQVEsMkJBQTJCLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0lBQ3BHO0lBQ0EsSUFBSTtLQUNGLGFBQWEsZ0JBQ1gsTUFDQSxjQUFjLFNBQVMsS0FBSyxXQUFXO01BQUUsSUFBSSxNQUFNO01BQU07S0FBTSxFQUFFLEdBQ2pFLFFBQ0Y7SUFDRixTQUFTLE9BQU87S0FDZCxLQUFLLE9BQU8sUUFBUSwyQkFBMkIsVUFBVSxpQkFBaUIsUUFBUSxNQUFNLFVBQVU7SUFDcEc7SUFDQSxJQUFJO0tBQ0YsYUFBYSxnQkFBZ0IsTUFBTSxjQUFjLFNBQVMsS0FBSyxXQUFXO01BQUUsSUFBSSxNQUFNO01BQU07S0FBTSxFQUFFLENBQUM7SUFDdkcsU0FBUyxPQUFPO0tBQ2QsS0FBSyxPQUFPLFFBQVEsc0JBQXNCLFVBQVUsaUJBQWlCLFFBQVEsTUFBTSxVQUFVO0lBQy9GO0lBQ0EsSUFBSTtLQUNGLGFBQWEsZ0JBQWdCLE1BQU0sY0FBYyxTQUFTLEtBQUssV0FBVztNQUFFLElBQUksTUFBTTtNQUFNO0tBQU0sRUFBRSxDQUFDO0lBQ3ZHLFNBQVMsT0FBTztLQUNkLEtBQUssT0FBTyxRQUFRLDJCQUEyQixVQUFVLGlCQUFpQixRQUFRLE1BQU0sVUFBVTtJQUNwRztJQUNBLElBQUk7S0FDRixZQUFZLGVBQ1YsTUFDQSxVQUNBLGNBQWMsU0FBUyxLQUFLLFdBQVc7TUFBRSxJQUFJLE1BQU07TUFBTTtLQUFNLEVBQUUsQ0FDbkU7SUFDRixTQUFTLE9BQU87S0FDZCxLQUFLLE9BQU8sUUFBUSwwQkFBMEIsVUFBVSxpQkFBaUIsUUFBUSxNQUFNLFVBQVU7SUFDbkc7SUFDQSxLQUFLLE9BQU8sUUFBUSxrQ0FBa0M7SUFDdEQsS0FBSyxPQUFPLFFBQVEsaUNBQWlDLE9BQU8sa0JBQWtCLEtBQUssZUFBZSx5QkFBeUI7Ozs7SUFJM0g7S0FDRSxNQUFNLE1BQU0sSUFBSSxNQUFNLEtBQUs7S0FDM0IsTUFBTSxPQUFPLGNBQWMsU0FBUyxTQUFTLFVBQVU7TUFDckQsTUFBTSxNQUFNLGNBQWMsSUFBSSxNQUFNLElBQUk7TUFDeEMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDO01BQ2xCLElBQUksY0FBYyxLQUFLOzs7TUFHdkIsT0FBTyxDQUFDO09BQUUsR0FBRztPQUFLLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxRQUFRLENBQUM7T0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsUUFBUSxDQUFDO01BQUUsQ0FBQztLQUMvRSxDQUFDO0tBQ0QsTUFBTSxRQUFRLEtBQUssUUFBUSxLQUE0RixTQUFTO01BQzlILFFBQVEsSUFBSSxTQUFTLElBQUk7TUFDekIsUUFBUSxJQUFJLFNBQVMsSUFBSTtNQUN6QixNQUFNLElBQUksT0FBTyxJQUFJO01BQ3JCLFFBQVEsSUFBSSxTQUFTLElBQUk7TUFDekIsYUFBYSxJQUFJLGNBQWMsSUFBSTtLQUNyQyxJQUFJO01BQUUsUUFBUTtNQUFHLFFBQVE7TUFBRyxNQUFNO01BQUcsUUFBUTtNQUFHLGFBQWE7S0FBRSxDQUFDO0tBQ2hFLEtBQUssT0FBTyxRQUFRLDhCQUE4QixLQUFLLFVBQVU7TUFBRTtNQUFPLFFBQVE7S0FBSyxDQUFDO0lBQzFGO0lBQ0EsS0FBSyxPQUFPLFFBQVEsMEJBQTBCLE9BQU8sY0FBYyxTQUFTLE1BQU07SUFDbEYsS0FBSyxPQUFPLFFBQVEsZ0NBQWdDLE9BQU8sWUFBWSxNQUFNO0lBQzdFLEtBQUssT0FBTyxRQUFRLG9DQUFvQyxZQUFZLEtBQUssSUFBSTtJQUM3RSxLQUFLLE9BQU8sUUFBUSwrQkFBK0IsS0FBSyxVQUFVLGNBQWMsU0FBUyxLQUFLLFdBQVc7S0FDdkcsSUFBSSxNQUFNO0tBQ1YsR0FBRyxNQUFNLFNBQVM7S0FDbEIsR0FBRyxNQUFNLFNBQVM7S0FDbEIsR0FBRyxNQUFNLFNBQVM7SUFDcEIsRUFBRSxDQUFDO0lBQ0gsS0FBSyxPQUFPLFFBQVEsa0NBQWtDLEtBQUssVUFBVSxjQUFjLFNBQVMsS0FBSyxVQUFVO0tBQ3pHLE1BQU0sWUFBWSxJQUFJLElBQW9CO0tBQzFDLE1BQU0sVUFBVSxTQUFTO01BQ3ZCLE1BQU0sT0FBTztNQUNiLElBQUksS0FBSyxRQUFRLEtBQUssTUFBTSxZQUFZLE1BQU0sUUFBUSxLQUFLLFFBQVEsSUFBSSxLQUFLLFdBQVcsQ0FBQyxLQUFLLFFBQVEsR0FBRyxVQUFVLElBQUksUUFBUTtLQUNoSSxDQUFDOzs7Ozs7O0tBT0QsTUFBTSxXQUFXLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLGFBQ3JDLFNBQXdDLHNCQUFzQjtLQUNqRSxNQUFNLGNBQWMsU0FBUyxLQUFLLGFBQWEsQ0FBQyxTQUFTLGtCQUFrQixRQUFRLENBQUMsQ0FBQztLQUNyRixNQUFNLFdBQVcsU0FDZCxLQUFLLGFBQWEsU0FBUyxTQUFTLHdCQUE4QyxDQUFDLENBQ25GLFFBQVEsVUFBMkIsT0FBTyxVQUFVLFFBQVE7S0FDL0QsT0FBTztNQUNMLElBQUksTUFBTTtNQUNWLE9BQU8sVUFBVTtNQUNqQixhQUFhLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLGFBQWEsU0FBUyxXQUFXLENBQUMsQ0FBQztNQUN2RSxvQkFBb0IsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLFFBQVEsYUFBYSxDQUFDLFNBQVMsVUFBVSxDQUFDLENBQUM7TUFDOUUsbUJBQW1CLFlBQVksU0FBUyxDQUFDLEtBQUssSUFBSSxHQUFHLFdBQVcsR0FBRyxLQUFLLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO01BQ2hHLGtCQUFrQixTQUFTLFNBQVMsQ0FBQyxLQUFLLElBQUksR0FBRyxRQUFRLEdBQUcsS0FBSyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztNQUN0RixZQUFZLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLGFBQWEsU0FBUyxTQUFTLE1BQU0sU0FBUyxDQUFDLENBQUM7TUFDbkYsYUFBYSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsUUFBUSxhQUFhLFNBQVMsU0FBUyxNQUFNLFVBQVUsQ0FBQyxDQUFDO01BQ3JGLFdBQVcsU0FBUyxTQUFTLENBQUMsS0FBSyxJQUFJLEdBQUcsU0FBUyxLQUFLLGFBQWEsU0FBUyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJO01BQ3ZHLFdBQVcsU0FBUyxTQUFTLENBQUMsS0FBSyxJQUFJLEdBQUcsU0FBUyxLQUFLLGFBQWEsU0FBUyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJO0tBQ3pHO0lBQ0YsQ0FBQyxDQUFDO0lBQ0YsUUFBUSxLQUFLLFFBQVEsU0FBUyxPQUFPLGdCQUFnQixjQUFjLGVBQWU7R0FDcEYsQ0FBQztFQUNILFNBQVMsT0FBTztHQUNkLGdCQUFnQixXQUFXO0dBQzNCLGdCQUFnQixZQUFZO0dBQzVCLEtBQUssTUFBTSxRQUFRLFdBQVcsS0FBSyxRQUFRO0dBQzNDLFlBQVksQ0FBQztHQUNiLGdCQUFnQjtHQUNoQixpQkFBaUI7R0FDakIsSUFBSSxDQUFDLFVBQVUsUUFBUSxLQUFLLFFBQVEsVUFBVSxXQUFXLGdCQUFnQixXQUFXLGlCQUFpQix3QkFBd0IsaUJBQWlCLFFBQVEsTUFBTSxVQUFVLFdBQVc7RUFDbkw7Q0FDRjtDQUNBLE1BQU0sV0FBVyxNQUE4QixVQUEwQjtFQUN2RSxJQUFJLFlBQVksWUFBWTtHQUMxQixnQkFBZ0IsS0FBSztHQUNyQixLQUFLLE9BQU8sUUFBUSxTQUFTLFlBQVksbUNBQW1DLHFDQUFxQztHQUNqSDtFQUNGO0VBQ0EsSUFBSSxTQUFTLFdBQVcsZ0JBQWdCO09BQ25DLGlCQUFpQjtFQUN0QixLQUFLLE9BQU8sUUFBUSxTQUFTLFlBQVksbUNBQW1DLHFDQUFxQztFQUNqSCxjQUFjO0NBQ2hCO0NBQ0EsS0FBSyxPQUFPLFVBQVUsU0FBUyxVQUFVLENBQUMsQ0FBQyxNQUFNLFNBQVMsUUFBUSxXQUFXLEtBQUssS0FBSyxHQUFHLFFBQVE7Q0FDbEcsS0FBSyxPQUFPLFVBQVUsU0FBUyxXQUFXLENBQUMsQ0FBQyxNQUFNLFNBQVMsUUFBUSxZQUFZLEtBQUssS0FBSyxHQUFHLFFBQVE7Q0FFcEcsYUFBYTtFQUNYLFdBQVc7RUFDWCxLQUFLLE9BQU8sb0JBQW9CLG9CQUFvQixhQUFhO0VBQ2pFLGNBQWM7RUFDZCx3QkFBd0I7RUFDeEIsd0JBQXdCO0VBQ3hCLHNCQUFzQixRQUFRO0VBQzlCLHVCQUF1QjtFQUN2QixPQUFPLEtBQUssT0FBTyxRQUFRO0VBQzNCLEtBQUssTUFBTSxFQUFFLFFBQVEsYUFBYSxjQUFjLE9BQU8sVUFBVTtFQUNqRSxlQUFlLENBQUM7RUFDaEIsSUFBSSxPQUFPO0dBQ1QsS0FBSyxNQUFNLE9BQU8sS0FBSztHQUN2QixnQkFBZ0IsS0FBSztHQUNyQixRQUFRO0VBQ1Y7RUFDQSxJQUFJLGFBQWE7R0FDZixLQUFLLE1BQU0sT0FBTyxZQUFZLElBQUk7R0FDbEMsWUFBWSxRQUFRO0dBQ3BCLGNBQWM7R0FDZCxPQUFPLEtBQUssT0FBTyxRQUFRO0dBQzNCLE9BQU8sS0FBSyxPQUFPLFFBQVE7R0FDM0IsT0FBTyxLQUFLLE9BQU8sUUFBUTtFQUM3QjtFQUNBLElBQUksWUFBWTtHQUNkLEtBQUssTUFBTSxPQUFPLFdBQVcsTUFBTTtHQUNuQyxXQUFXLFFBQVE7R0FDbkIsYUFBYTtHQUNiLE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDN0I7RUFDQSxJQUFJLFVBQVU7R0FDWixLQUFLLE1BQU0sT0FBTyxTQUFTLE1BQU07R0FDakMsU0FBUyxRQUFRO0dBQ2pCLFdBQVc7R0FDWCxPQUFPLEtBQUssT0FBTyxRQUFRO0VBQzdCO0VBQ0EsSUFBSSxZQUFZO0dBQ2QsS0FBSyxNQUFNLE9BQU8sV0FBVyxNQUFNO0dBQ25DLFdBQVcsUUFBUTtHQUNuQixhQUFhO0dBQ2IsT0FBTyxLQUFLLE9BQU8sUUFBUTtHQUMzQixPQUFPLEtBQUssT0FBTyxRQUFRO0VBQzdCO0VBQ0EsS0FBSyxNQUFNLFNBQVMsWUFBWTtHQUM5QixLQUFLLE1BQU0sT0FBTyxNQUFNLE1BQU07R0FDOUIsTUFBTSxRQUFRO0VBQ2hCO0VBQ0EsSUFBSSxXQUFXLFFBQVE7R0FDckIsYUFBYSxDQUFDO0dBQ2QsT0FBTyxLQUFLLE9BQU8sUUFBUTtFQUM3QjtFQUNBLElBQUksV0FBVztHQUNiLEtBQUssTUFBTSxPQUFPLFVBQVUsS0FBSztHQUNqQyxVQUFVLFFBQVE7R0FDbEIsWUFBWTtHQUNaLE9BQU8sS0FBSyxPQUFPLFFBQVE7R0FDM0IsT0FBTyxLQUFLLE9BQU8sUUFBUTtHQUMzQixPQUFPLEtBQUssT0FBTyxRQUFRO0dBQzNCLE9BQU8sS0FBSyxPQUFPLFFBQVE7R0FDM0IsT0FBTyxLQUFLLE9BQU8sUUFBUTtFQUM3QjtFQUNBLElBQUksa0JBQWtCO0dBQ3BCLEtBQUssTUFBTSxPQUFPLGdCQUFnQjtHQUNsQyxnQkFBZ0IsZ0JBQWdCO0dBQ2hDLG1CQUFtQjtHQUNuQixPQUFPLEtBQUssT0FBTyxRQUFRO0VBQzdCO0VBQ0EsSUFBSSxjQUFjO0dBQ2hCLEtBQUssTUFBTSxPQUFPLFlBQVk7R0FDOUIsZ0JBQWdCLFlBQVk7R0FDNUIsZUFBZTtHQUNmLE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDN0I7RUFDQSxJQUFJLFlBQVk7R0FDZCxLQUFLLE1BQU0sT0FBTyxVQUFVO0dBQzVCLGdCQUFnQixVQUFVO0dBQzFCLGFBQWE7R0FDYixPQUFPLEtBQUssT0FBTyxRQUFRO0VBQzdCO0VBQ0EsSUFBSSxnQkFBZ0I7R0FDbEIsZUFBZSxRQUFRO0dBQ3ZCLGlCQUFpQjtHQUNqQixPQUFPLEtBQUssT0FBTyxRQUFRO0dBQzNCLE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDN0I7RUFDQSxLQUFLLE1BQU0sUUFBUSxPQUFPO0dBQ3hCLEtBQUssTUFBTSxPQUFPLEtBQUssS0FBSztHQUM1QixLQUFLLFFBQVE7RUFDZjtFQUNBLFFBQVEsQ0FBQztFQUNULE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDM0IsS0FBSyxNQUFNLFFBQVEsV0FBVyxLQUFLLFFBQVE7RUFDM0MsWUFBWSxDQUFDO0VBQ2IsS0FBSyxNQUFNLFNBQVM7R0FBQztHQUFTO0dBQVU7R0FBVztFQUFZLEdBQUc7R0FDaEUsSUFBSSxDQUFDLE9BQU87R0FDWixLQUFLLE1BQU0sT0FBTyxLQUFLO0dBQ3ZCLGdCQUFnQixLQUFLO0VBQ3ZCO0VBQ0EsVUFBVTtFQUNWLFdBQVc7RUFDWCxZQUFZO0VBQ1osZUFBZTtFQUNmLE9BQU8sS0FBSyxPQUFPLFFBQVE7RUFDM0IsS0FBSyxPQUFPLFFBQVEsa0NBQWtDO0NBQ3hEO0FBQ0Y7Ozs7Ozs7Ozs7Ozs7OztBQW9CQSxNQUFNLGlCQUFnRTtDQUNwRSxjQUFjO0VBQUUsb0JBQW9CO0dBQUUsV0FBVztHQUFLLE1BQU07RUFBVTtFQUFHLHFCQUFxQjtHQUFFLFdBQVc7R0FBSyxNQUFNO0VBQVU7RUFBRyxxQkFBcUI7R0FBRSxXQUFXO0dBQUssTUFBTTtFQUFVO0VBQUcsaUJBQWlCO0dBQUUsV0FBVztHQUFLLE1BQU07RUFBVTtFQUFHLHNCQUFzQjtHQUFFLFdBQVc7R0FBSyxNQUFNO0VBQVU7RUFBRyxzQkFBc0I7R0FBRSxXQUFXO0dBQUssTUFBTTtFQUFVO0NBQUc7Q0FDelcsc0JBQXNCO0VBQUUsNEJBQTRCO0dBQUUsV0FBVztHQUFHLE1BQU07RUFBVTtFQUFHLDJCQUEyQjtHQUFFLFdBQVc7R0FBRyxNQUFNO0VBQVU7RUFBRyw0QkFBNEI7R0FBRSxXQUFXO0dBQUcsTUFBTTtFQUFVO0VBQUcsNEJBQTRCO0dBQUUsV0FBVztHQUFHLE1BQU07RUFBVTtFQUFHLDJCQUEyQjtHQUFFLFdBQVc7R0FBRyxNQUFNO0VBQVU7Q0FBRztDQUNqVixjQUFjO0VBQUUseUJBQXlCO0dBQUUsV0FBVztHQUFLLE1BQU07RUFBVTtFQUFHLHlCQUF5QjtHQUFFLFdBQVc7R0FBSyxNQUFNO0VBQVU7RUFBRyx5QkFBeUI7R0FBRSxXQUFXO0dBQUssTUFBTTtFQUFVO0NBQUc7Q0FDMU0sWUFBWTtFQUNWLG9CQUFvQjtHQUFFLFdBQVc7R0FBSyxNQUFNO0VBQVU7RUFDdEQsWUFBWTtHQUFFLFdBQVc7R0FBSyxNQUFNO0VBQVU7RUFDOUMsa0JBQWtCO0dBQUUsV0FBVztHQUFLLE1BQU07RUFBVTtFQUNwRCxpQkFBaUI7R0FBRSxXQUFXO0dBQUssTUFBTTtFQUFVO0NBQ3JEOzs7Ozs7Ozs7Ozs7Q0FZQSxnQkFBZ0IsRUFBRSxxQkFBcUI7RUFBRSxXQUFXO0VBQUcsTUFBTTtDQUFVLEVBQUc7QUFDNUU7QUFHQSxNQUFNLHlCQUF3QztDQUFFLFdBQVc7Q0FBRyxNQUFNO0FBQVU7Ozs7Ozs7Ozs7Ozs7OztBQWlCOUUsTUFBTSx1QkFBK0M7Q0FBRSxpQkFBaUI7Q0FBTyxZQUFZO0FBQUs7QUFHaEcsTUFBTSxtQkFBbUI7QUFHekIsTUFBTSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUU7QUFHakMsU0FBUyxrQkFBa0IsT0FBdUIsV0FBeUI7Q0FDekUsTUFBTSxVQUFVLFNBQVM7RUFDdkIsTUFBTSxPQUFPO0VBQ2IsSUFBSSxDQUFDLEtBQUssVUFBVSxNQUFNLFFBQVEsS0FBSyxRQUFRLEdBQUc7RUFDbEQsTUFBTSxXQUFXLEtBQUs7RUFDdEIsSUFBSSxTQUFTLFNBQVMsdUJBQXVCLFdBQVc7RUFDeEQsU0FBUyxTQUFTLHFCQUFxQjtFQUN2QyxNQUFNLFVBQVUsU0FBUyxnQkFBZ0IsS0FBSyxRQUFRO0VBQ3RELFNBQVMsbUJBQW1CLFFBQVEsYUFBYTtHQUMvQyxRQUFRLFFBQVEsUUFBUTtHQUN4QixPQUFPLFNBQVMsaUJBQWlCO0dBQ2pDLE9BQU8sZUFBZSxPQUFPLGFBQzFCLFFBQVEscUJBQXFCLGtEQUFrRCxDQUFDLENBQ2hGLFFBQ0MsMkJBQ0E7NENBQ2tDLGlCQUFpQixRQUFRLENBQUMsRUFBRTs7OzsrQ0FJekIsVUFBVSxRQUFRLENBQUMsRUFBRTt3RkFDb0IsWUFBWSxJQUFJLENBQUUsUUFBUSxDQUFDLEVBQUU7cURBQ2hFLFlBQVksSUFBSSxDQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQzFFO0VBQ0o7OztFQUdBLFNBQVMsOEJBQThCLGNBQWM7RUFDckQsU0FBUyxjQUFjOzs7O0VBSXZCLEtBQUssdUJBQXVCO0dBQzFCLGNBQWMsUUFBUSxZQUFZLElBQUksSUFBSTtFQUM1QztDQUNGLENBQUM7QUFDSCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJUZXJyYWluM2RDbGFpbVBpbG90LnRzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGluc3RhbGxBcmNoaXZlUmVzdG9yYXRpb24sIHR5cGUgQXJjaGl2ZVJlc3RvcmF0aW9uU3RhdGUgfSBmcm9tICcuL0FyY2hpdmVSZXN0b3JhdGlvbic7XG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgYmFyb25Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9iYXJvbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBiYXJvblBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYmFyb24tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRyeUd1bGNoQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHJ5LWd1bGNoLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRyeUd1bGNoUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kcnktZ3VsY2gtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGhpbGxNaW5lQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaGlsbC1taW5lLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGhpbGxNaW5lUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9oaWxsLW1pbmUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG5pZ2h0U2hpZnRDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9uaWdodC1zaGlmdC10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBuaWdodFNoaWZ0UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9uaWdodC1zaGlmdC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgY2xhaW1Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90aGUtY2xhaW0tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgY2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RoZS1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgdHdpbkJhbmtzQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdHdpbi1iYW5rcy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCB0d2luQmFua3NQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3R3aW4tYmFua3MtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHRyZXN0bGVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90cmVzdGxlLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHRyZXN0bGVQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RyZXN0bGUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGJsYWNrb3V0UmlkZ2VDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ibGFja291dC1yaWRnZS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBibGFja291dFJpZGdlUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ibGFja291dC1yaWRnZS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFpcmdyb3VuZENvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2ZhaXJncm91bmQtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFpcmdyb3VuZFBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZmFpcmdyb3VuZC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZHVzdEZsYXRzQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHVzdC1mbGF0cy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkdXN0RmxhdHNQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2R1c3QtZmxhdHMtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlZXB3YXRlckNsYWltQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlZXB3YXRlckNsYWltUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZWVwd2F0ZXItY2xhaW0tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGdsb3dNZXNhQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGdsb3dNZXNhUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9nbG93LW1lc2EtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHJlbGF5VmFsbGV5Q29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHJlbGF5VmFsbGV5UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1hcmVDbGFpbUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL21hcmUtY2xhaW0tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZmFyU2lkZUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Zhci1zaWRlLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1hcmVDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZG9tZUJhc2luQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZG9tZS1iYXNpbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkb21lQmFzaW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RvbWUtYmFzaW4tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGVtYmVyU2hvcmVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lbWJlci1zaG9yZS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBlbWJlclNob3JlUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9lbWJlci1zaG9yZS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgYXJjaGl2ZVdvcmxkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYXJjaGl2ZS13b3JsZC10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBhcmNoaXZlV29ybGRQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2FyY2hpdmUtd29ybGQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGJvbmV5YXJkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYm9uZXlhcmQtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgYm9uZXlhcmRQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2JvbmV5YXJkLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBjYW55b25Xb3Jrc0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Nhbnlvbi13b3Jrcy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBjYW55b25Xb3Jrc1Bhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvY2FueW9uLXdvcmtzLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkZXZpbHNBbGxleUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Rldmlscy1hbGxleS10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBkZXZpbHNBbGxleVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGV2aWxzLWFsbGV5LXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBlY2hvQ2FueW9uQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZWNob0NhbnlvblBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGd1c2hlckNvdW50eUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2d1c2hlci1jb3VudHktdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgZ3VzaGVyQ291bnR5UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ndXNoZXItY291bnR5LXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCByZWxheVJ1c2hDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS1ydXNoLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGRlYWRCYW5kQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVhZC1iYW5kLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHBpY25pY0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3BpY25pYy10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBoYWxmTGlmZUhvbGxvd0NvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgaGFsZkxpZmVIb2xsb3dQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGluY2xpbmVDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9pbmNsaW5lLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGluY2xpbmVQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2luY2xpbmUtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvbmdSb2FkQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbG9uZy1yb2FkLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvbmdSb2FkUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb25nLXJvYWQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvd09yYml0Q29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbG93LW9yYml0LXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxvd09yYml0UGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb3ctb3JiaXQtcGFub3JhbWEtY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IG1vdGhTZWFzb25Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi10ZXJyYWluLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBtb3RoU2Vhc29uUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgb2xkQ2FuYWxDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9vbGQtY2FuYWwtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgb2xkQ2FuYWxQYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL29sZC1jYW5hbC1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcHJlc3N1cmVHYXJkZW5Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9wcmVzc3VyZS1nYXJkZW4tdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcHJlc3N1cmVHYXJkZW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3ByZXNzdXJlLWdhcmRlbi1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcmVnYXR0YUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlZ2F0dGEtdGVycmFpbi1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgcmVnYXR0YVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVnYXR0YS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgc2VlZFJ1bkNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3NlZWQtcnVuLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHNlZWRSdW5QYW5vcmFtYUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3NlZWQtcnVuLXBhbm9yYW1hLWNvbnRyYWN0Lmpzb24/cmF3JztcbmltcG9ydCBzaG93cm9vbUNvbnRyYWN0VGV4dCBmcm9tICcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3Nob3dyb29tLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IHNob3dyb29tUGFub3JhbWFDb250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5pbXBvcnQgeyBwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcyB9IGZyb20gJy4uL2dhbWUvUGVyZm9ybWFuY2VUaWVyJztcbmltcG9ydCB7IHJlcG9ydFJlbmRlckRlbW90aW9uIH0gZnJvbSAnLi4vdGVsZW1ldHJ5L3J1bkJlYWNvbic7XG5pbXBvcnQgeyBpc01hcEJlYXV0eURpc2FibGVkLCBpc1Bvb2xHcmFkZURpc2FibGVkIH0gZnJvbSAnLi4vY29yZS9EZWJ1Z1BhcmFtcyc7XG5pbXBvcnQgeyBSZW5kZXJMYXllcnMgfSBmcm9tICcuLi9jb3JlL1JlbmRlckxheWVycyc7XG5pbXBvcnQgeyBmYXJHcm91bmRQcm9iZU1vZGUsIGhvcml6b25BcHJvblByb2ZpbGUsIHBhaW50RmFyR3JvdW5kUHJvYmUsIHBhaW50SG9yaXpvbkFwcm9uIH0gZnJvbSAnLi9Ib3Jpem9uQXByb24nO1xuaW1wb3J0IHsgbGVkZ2VyU3VuU2hhZG93RGlyZWN0aW9uIH0gZnJvbSAnLi9MaWdodFJpZyc7XG5pbXBvcnQgeyBCYWxhbmNlIH0gZnJvbSAnLi4vZ2FtZS9CYWxhbmNlJztcbmltcG9ydCB0eXBlIHsgTGlnaHRGaWVsZFNuYXBzaG90LCBMaWdodFNvdXJjZSB9IGZyb20gJy4uL3N5c3RlbXMvTGlnaHRGaWVsZCc7XG5pbXBvcnQgeyBkaXNwb3NlT2JqZWN0M0QgfSBmcm9tICcuLi91dGlscy9kaXNwb3NlJztcbmltcG9ydCB7IHRyYWNrZWRHbHRmTG9hZGVyIH0gZnJvbSAnLi4vYXNzZXRzL0Fzc2V0TG9hZGluZyc7XG5pbXBvcnQgKiBhcyBUZXJyYWluIGZyb20gJy4vVGVycmFpbic7XG5pbXBvcnQgeyBjcmVhdGVTY3VscHRXYXRlciwgdHlwZSBTY3VscHRXYXRlciB9IGZyb20gJy4vV2F0ZXInO1xuaW1wb3J0IHsgY3JlYXRlU3VuTW90ZXMsIHR5cGUgU3VuTW90ZXMgfSBmcm9tICcuL1N1bk1vdGVzJztcbmltcG9ydCB7IGNyZWF0ZVN0ZWFtUGx1bWUsIHR5cGUgU3RlYW1QbHVtZSB9IGZyb20gJy4vU3RlYW1QbHVtZSc7XG5pbXBvcnQgeyBjcmVhdGVIYXVsU3RlYW0sIHR5cGUgSGF1bFN0ZWFtLCB0eXBlIEhhdWxWZW50IH0gZnJvbSAnLi9IYXVsU3RlYW0nO1xuaW1wb3J0IHsgaW5zdGFsbFZpc3VhbEhlaWdodFNvdXJjZSwgd2F0ZXJTb3VyY2VzIH0gZnJvbSAnLi9UZXJyYWluJztcbmltcG9ydCB7IGNyZWF0ZUxhbmRtYXJrV2Fsa1N1cmZhY2VzLCB0eXBlIExhbmRtYXJrV2Fsa1N1cmZhY2UgfSBmcm9tICcuL0xhbmRtYXJrV2Fsa1N1cmZhY2VzJztcbmltcG9ydCB7IGNyZWF0ZVNwcmluZ1BvbmRTdXJmYWNlLCB0eXBlIFNwcmluZ1BvbmRTdXJmYWNlIH0gZnJvbSAnLi9XYXRlcic7XG5pbXBvcnQgeyBjcmVhdGVGb3JkU2hlZXQsIGNyZWF0ZVdhdGVyQ29uZmx1ZW5jZSwgY3JlYXRlV2F0ZXJSaWJib24sIHVwZGF0ZVdhdGVyTWF0ZXJpYWwgfSBmcm9tICcuL1dhdGVyJztcbmltcG9ydCB0eXBlIHsgQ29udHJhY3RNYW5pZmVzdCB9IGZyb20gJy4uL21ldGEvQ29udHJhY3RGYW1pbGllcyc7XG5cbmltcG9ydCBsYXN0Q2xhaW1Db250cmFjdFRleHQgZnJvbSAnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sYXN0LWNsYWltLXRlcnJhaW4tY29udHJhY3QuanNvbj9yYXcnO1xuaW1wb3J0IGxhc3RDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbGFzdC1jbGFpbS1wYW5vcmFtYS1jb250cmFjdC5qc29uP3Jhdyc7XG5cbnR5cGUgTW90b3JHcm91bmRUcnV0aCA9IFBpY2s8Q29udHJhY3RNYW5pZmVzdFsndGlsZVBhcmFtcyddLCAnZGltZW5zaW9ucycgfCAncm9hZENvcnJpZG9ycycgfCAndGFyU2VhbXMnIHwgJ29yYml0U3Bhd24nPjtcbnR5cGUgUGFpbnRSb3V0ZVBvaW50ID0geyB4OiBudW1iZXI7IHo6IG51bWJlciB9O1xudHlwZSBQYWludFpvbmUgPSB7IG1pblg6IG51bWJlcjsgbWF4WDogbnVtYmVyOyBtaW5aOiBudW1iZXI7IG1heFo6IG51bWJlciB9O1xuXG50eXBlIENvbnRyYWN0ID0ge1xuICB0aWxlSWQ6IHN0cmluZztcbiAgdmVydGljZXM6IG51bWJlcjtcbiAgdHJpYW5nbGVzOiBudW1iZXI7XG4gIG1lc2hDb3VudDogbnVtYmVyO1xuICBtYXRlcmlhbENvdW50OiBudW1iZXI7XG4gIGJvdW5kc01ldGVyczogeyBtaW46IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXTsgbWF4OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfTtcbiAgcGFub3JhbWFNb3VudDogTW91bnQ7XG4gIGxhbmRtYXJrTW91bnRzPzogTGFuZG1hcmtNb3VudFtdO1xuICBtYXNrVHJ1dGg/OiBNb3Rvckdyb3VuZFRydXRoICYge1xuICAgIGNhbmFsUm91dGU/OiB7IHBvaW50czogUGFpbnRSb3V0ZVBvaW50W10gfTtcbiAgICBpbmhlcml0ZWRDYW5hbFJvdXRlPzogeyBwb2ludHM6IFBhaW50Um91dGVQb2ludFtdIH07XG4gICAgY2FyYXZhblJvdXRlPzogUGFpbnRSb3V0ZVBvaW50W107XG4gICAgcGVybWFuZW50R3JlZW5XYXlwb2ludFpvbmVzPzogUGFpbnRab25lW107XG4gICAgd2F0ZXJNYXNrPzogeyBpZDogc3RyaW5nOyByZWdpb25zOiBNYXNrUmVnaW9uW10gfTtcbiAgfTtcbiAgbWFza0FncmVlbWVudD86IHsgd2F0ZXJQbGFuZVk/OiBudW1iZXIgfTtcbiAgd2F0ZXJTdXJmYWNlPzogeyBvd25lcjogc3RyaW5nOyBpbmNsdWRlZEluVGVycmFpbkdMQjogYm9vbGVhbiB9O1xufTtcbnR5cGUgTWFza1JlZ2lvbiA9IHtcbiAgaWQ6IHN0cmluZztcbiAga2luZDogc3RyaW5nO1xuICB6b25lOiBzdHJpbmc7XG4gIGhhbGZXaWR0aD86IG51bWJlcjtcbiAgcG9pbnRzPzogQXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlciB9PjtcbiAgbWluWD86IG51bWJlcjtcbiAgbWF4WD86IG51bWJlcjtcbiAgbWluWj86IG51bWJlcjtcbiAgbWF4Wj86IG51bWJlcjtcbn07XG50eXBlIFBhbm9yYW1hQ29udHJhY3QgPSBQaWNrPENvbnRyYWN0LCAndmVydGljZXMnIHwgJ3RyaWFuZ2xlcycgfCAnbWVzaENvdW50JyB8ICdtYXRlcmlhbENvdW50Jz4gJiB7IHJlbmRlck9ubHk6IGJvb2xlYW47IHByb2plY3Rpb24/OiB7IHNreVJpbmdSYWRpdXNNZXRlcnM/OiBudW1iZXIgfSB9O1xudHlwZSBNb3VudCA9IHtcbiAgaWQ6IHN0cmluZztcbiAgcG9zaXRpb246IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgcm90YXRpb246IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgc2NhbGU6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgcmVuZGVyT25seTogYm9vbGVhbjtcbn07XG50eXBlIExhbmRtYXJrTW91bnQgPSBPbWl0PE1vdW50LCAncmVuZGVyT25seSc+ICYgeyBhc3NldD86IHN0cmluZzsgY29udHJhY3RJZHM/OiBzdHJpbmdbXTsgd2Fsa1N1cmZhY2VzPzogTGFuZG1hcmtXYWxrU3VyZmFjZVtdIH07XG50eXBlIEVudHJ5ID0geyB0ZXJyYWluVXJsOiBzdHJpbmc7IHBhbm9yYW1hVXJsOiBzdHJpbmc7IGNvbnRyYWN0OiBDb250cmFjdDsgcGFub3JhbWFDb250cmFjdDogUGFub3JhbWFDb250cmFjdCB9O1xudHlwZSBIb3N0ID0ge1xuICBzY2VuZTogVEhSRUUuU2NlbmU7XG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIGNvbnRyYWN0SWQ6IHN0cmluZztcbiAgdGlsZUlkOiBzdHJpbmc7XG4gIHBhaW50ZWRHcm91bmQ/OiBUSFJFRS5PYmplY3QzRDtcbiAgbmlnaHRNb2RlPzogYm9vbGVhbjtcbiAgbmlnaHRMaWdodGluZz86ICgpID0+IExpZ2h0RmllbGRTbmFwc2hvdDtcbiAgLyoqIFRydWUgd2hpbGUgYSBwb3N0LXNlY3VyZSBcIlN0YXkgZm9yIHRoZSBSdXNoXCIgcnVuIGlzIGxpdmUgKFJ1bk1hbmFnZXIgb3ducyBpdCkuICovXG4gIHJ1c2hBY3RpdmU/OiAoKSA9PiBib29sZWFuO1xuICAvKiogUHVibGlzaGVkIHByZXNzdXJlIGRpYWdub3N0aWM7IHJlbmRlci1vbmx5IGNvbnN1bWVycyBuZXZlciB3cml0ZSBpdC4gKi9cbiAgaG90Qm9pbGVycz86ICgpID0+IG51bWJlcjtcbiAgLyoqXG4gICAqIFRoZSBsaXZlIE1RLTQgcnVudGltZSB2ZXJkaWN0ICgwID0gaGVhbHRoeSwgcmlzaW5nIGFzIHRoZSBwOTUgd2F0Y2hkb2cgZGVncmFkZXMpLiBSZWFkLW9ubHksXG4gICAqIHBvbGxlZCDigJQgdGhlIHBpbG90J3MgZGVjb3JhdGlvbnMgcmVnaXN0ZXIgdGhlbXNlbHZlcyBpbiB0aGUgc2hlZCBvcmRlciB0aHJvdWdoIHRoaXMgYW5kIGRyb3BcbiAgICogb3V0IGZpcnN0LCBiZWZvcmUgYW55dGhpbmcgdGhlIHBsYXllciBpcyBhaW1pbmcgYXQuXG4gICAqL1xuICBkZXRhaWxCdWRnZXQ/OiAoKSA9PiBudW1iZXI7XG4gIC8qKiBSZWFkLW9ubHkgZXNjb3J0ZWQtY2FydCB2aWV3IGZvciByZW5kZXItc2lkZSBoYXVsIHN0ZWFtLiAqL1xuICBoYXVsQ2FydD86ICgpID0+IHsgeDogbnVtYmVyOyB6OiBudW1iZXI7IG1vdmluZzogYm9vbGVhbiB9IHwgdW5kZWZpbmVkO1xuICBhcmNoaXZlUmVzdG9yYXRpb24/OiAoKSA9PiBBcmNoaXZlUmVzdG9yYXRpb25TdGF0ZSB8IG51bGw7XG4gIG9uVmlzdWFsSGVpZ2h0U291cmNlSW5zdGFsbGVkPzogKCkgPT4gdm9pZDtcbn07XG50eXBlIE1ldHJpY3MgPSB7IG1lc2hlczogbnVtYmVyOyB0cmlhbmdsZXM6IG51bWJlcjsgbWF0ZXJpYWxzOiBudW1iZXI7IHZlcnRpY2VzOiBudW1iZXI7IGJvdW5kczogVEhSRUUuQm94MyB9O1xudHlwZSBIaWRkZW5SZWxpZWYgPSB7IG9iamVjdDogVEhSRUUuT2JqZWN0M0Q7IHZpc2libGU6IGJvb2xlYW4gfTtcblxuY29uc3QgZW50cnkgPSAodGVycmFpblVybDogc3RyaW5nLCBwYW5vcmFtYVVybDogc3RyaW5nLCBjb250cmFjdFRleHQ6IHN0cmluZywgcGFub3JhbWFDb250cmFjdFRleHQ6IHN0cmluZywgZHJlc3NpbmdUZXh0Pzogc3RyaW5nKTogRW50cnkgPT4ge1xuICBjb25zdCBjb250cmFjdCA9IEpTT04ucGFyc2UoY29udHJhY3RUZXh0KSBhcyBDb250cmFjdDtcbiAgLy8gVmFyaWFudCBkcmVzc2luZyBzdXBwbGVtZW50cyB0aGUgYmFzZSBib2RpZXM7IHRoZSBleGlzdGluZyBtb3VudCBmaWx0ZXIgYW5kIHRyYW5zZm9ybXMgYXBwbHkuXG4gIGlmIChkcmVzc2luZ1RleHQpIGNvbnRyYWN0LmxhbmRtYXJrTW91bnRzID0gWy4uLihjb250cmFjdC5sYW5kbWFya01vdW50cyA/PyBbXSksIC4uLigoSlNPTi5wYXJzZShkcmVzc2luZ1RleHQpIGFzIENvbnRyYWN0KS5sYW5kbWFya01vdW50cyA/PyBbXSldO1xuICByZXR1cm4geyB0ZXJyYWluVXJsLCBwYW5vcmFtYVVybCwgY29udHJhY3QsIHBhbm9yYW1hQ29udHJhY3Q6IEpTT04ucGFyc2UocGFub3JhbWFDb250cmFjdFRleHQpIGFzIFBhbm9yYW1hQ29udHJhY3QgfTtcbn07XG5jb25zdCBSRUdJU1RSWTogUmVjb3JkPHN0cmluZywgRW50cnk+ID0ge1xuICAndGhlLWNsYWltJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90aGUtY2xhaW0tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdGhlLWNsYWltLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgY2xhaW1Db250cmFjdFRleHQsIGNsYWltUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEtZHJ5LWd1bGNoJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kcnktZ3VsY2gtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHJ5LWd1bGNoLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZHJ5R3VsY2hDb250cmFjdFRleHQsIGRyeUd1bGNoUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEtdHdpbi1iYW5rcyc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdHdpbi1iYW5rcy10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS90d2luLWJhbmtzLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgdHdpbkJhbmtzQ29udHJhY3RUZXh0LCB0d2luQmFua3NQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlMS1uaWdodC1zaGlmdCc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbmlnaHQtc2hpZnQtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbmlnaHQtc2hpZnQtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuaWdodFNoaWZ0Q29udHJhY3RUZXh0LCBuaWdodFNoaWZ0UGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEtYmFyb24nOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Jhcm9uLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Jhcm9uLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgYmFyb25Db250cmFjdFRleHQsIGJhcm9uUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAuLi4oX19HUl9SRUxFQVNFX0UxX18gPyB7fSA6IHtcbiAgJ2UyLWhpbGwtbWluZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaGlsbC1taW5lLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hpbGwtbWluZS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGhpbGxNaW5lQ29udHJhY3RUZXh0LCBoaWxsTWluZVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UyLXRyZXN0bGUnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3RyZXN0bGUtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvdHJlc3RsZS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHRyZXN0bGVDb250cmFjdFRleHQsIHRyZXN0bGVQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlMy1ibGFja291dC1yaWRnZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYmxhY2tvdXQtcmlkZ2UtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYmxhY2tvdXQtcmlkZ2UtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBibGFja291dFJpZGdlQ29udHJhY3RUZXh0LCBibGFja291dFJpZGdlUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTMtZmFpcmdyb3VuZCc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZmFpcmdyb3VuZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9mYWlyZ3JvdW5kLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZmFpcmdyb3VuZENvbnRyYWN0VGV4dCwgZmFpcmdyb3VuZFBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U0LWR1c3QtZmxhdHMnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2R1c3QtZmxhdHMtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZHVzdC1mbGF0cy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGR1c3RGbGF0c0NvbnRyYWN0VGV4dCwgZHVzdEZsYXRzUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTUtZGVlcHdhdGVyLWNsYWltJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZWVwd2F0ZXItY2xhaW0tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZGVlcHdhdGVyQ2xhaW1Db250cmFjdFRleHQsIGRlZXB3YXRlckNsYWltUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTYtZ2xvdy1tZXNhJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9nbG93LW1lc2EtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZ2xvd01lc2FDb250cmFjdFRleHQsIGdsb3dNZXNhUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTctcmVsYXktdmFsbGV5JzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgcmVsYXlWYWxsZXlDb250cmFjdFRleHQsIHJlbGF5VmFsbGV5UGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTgtbWFyZS1jbGFpbSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tYXJlLWNsYWltLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbWFyZUNsYWltQ29udHJhY3RUZXh0LCBtYXJlQ2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlOS1kb21lLWJhc2luJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kb21lLWJhc2luLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RvbWUtYmFzaW4tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBkb21lQmFzaW5Db250cmFjdFRleHQsIGRvbWVCYXNpblBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UxMC1lbWJlci1zaG9yZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZW1iZXItc2hvcmUtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZW1iZXItc2hvcmUtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBlbWJlclNob3JlQ29udHJhY3RUZXh0LCBlbWJlclNob3JlUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTItcHJlc3N1cmUtZ2FyZGVuJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9wcmVzc3VyZS1nYXJkZW4tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcHJlc3N1cmUtZ2FyZGVuLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgcHJlc3N1cmVHYXJkZW5Db250cmFjdFRleHQsIHByZXNzdXJlR2FyZGVuUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTItaW5jbGluZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaW5jbGluZS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9pbmNsaW5lLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgaW5jbGluZUNvbnRyYWN0VGV4dCwgaW5jbGluZVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UzLWNhbnlvbi13b3Jrcyc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvY2FueW9uLXdvcmtzLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2Nhbnlvbi13b3Jrcy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGNhbnlvbldvcmtzQ29udHJhY3RUZXh0LCBjYW55b25Xb3Jrc1Bhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2UzLW1vdGgtc2Vhc29uJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tb3RoLXNlYXNvbi1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG1vdGhTZWFzb25Db250cmFjdFRleHQsIG1vdGhTZWFzb25QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNC1sb25nLXJvYWQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2xvbmctcm9hZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb25nLXJvYWQtcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBsb25nUm9hZENvbnRyYWN0VGV4dCwgbG9uZ1JvYWRQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNC1ndXNoZXItY291bnR5JzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ndXNoZXItY291bnR5LXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2d1c2hlci1jb3VudHktcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBndXNoZXJDb3VudHlDb250cmFjdFRleHQsIGd1c2hlckNvdW50eVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U0LWJvbmV5YXJkJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ib25leWFyZC10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9ib25leWFyZC1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGJvbmV5YXJkQ29udHJhY3RUZXh0LCBib25leWFyZFBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U1LXJlZ2F0dGEnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlZ2F0dGEtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVnYXR0YS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHJlZ2F0dGFDb250cmFjdFRleHQsIHJlZ2F0dGFQYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gIC8vIERlZXB3YXRlciBDbGFpbSBhbGlhc2VzOiB0aGVzZSBjYW1wYWlnbiB2YXJpYW50cyBpbnRlbnRpb25hbGx5IHJldXNlIGl0cyB0ZXJyYWluIGFuZCBwYW5vcmFtYS5cbiAgJ2U1LXN0aWxsd2F0ZXInOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RlZXB3YXRlci1jbGFpbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZWVwd2F0ZXItY2xhaW0tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBkZWVwd2F0ZXJDbGFpbUNvbnRyYWN0VGV4dCwgZGVlcHdhdGVyQ2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlNS1mbG90aWxsYSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGVlcHdhdGVyLWNsYWltLXRlcnJhaW4uZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2RlZXB3YXRlci1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGRlZXB3YXRlckNsYWltQ29udHJhY3RUZXh0LCBkZWVwd2F0ZXJDbGFpbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U2LXNob3dyb29tJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9zaG93cm9vbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIHNob3dyb29tQ29udHJhY3RUZXh0LCBzaG93cm9vbVBhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgJ2U2LWhhbGYtbGlmZS1ob2xsb3cnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2hhbGYtbGlmZS1ob2xsb3ctdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvaGFsZi1saWZlLWhvbGxvdy1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGhhbGZMaWZlSG9sbG93Q29udHJhY3RUZXh0LCBoYWxmTGlmZUhvbGxvd1Bhbm9yYW1hQ29udHJhY3RUZXh0KSxcbiAgLy8gUGljbmljIHJldGFpbnMgdGhlIEdsb3cgTWVzYSBzY3VscHQgYW5kIGNvbGxpc2lvbi1iYWNrZWQgYm9kaWVzLCBhZGRpbmcgaXRzIG5vbmJsb2NraW5nIGRyZXNzaW5nLlxuICAnZTYtcGljbmljJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9nbG93LW1lc2EtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZ2xvdy1tZXNhLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgZ2xvd01lc2FDb250cmFjdFRleHQsIGdsb3dNZXNhUGFub3JhbWFDb250cmFjdFRleHQsIHBpY25pY0NvbnRyYWN0VGV4dCksXG4gICdlNy1lY2hvLWNhbnlvbic6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZWNoby1jYW55b24tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBlY2hvQ2FueW9uQ29udHJhY3RUZXh0LCBlY2hvQ2FueW9uUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAvLyBSZWxheSBWYWxsZXkgYWxpYXNlczogYm90aCBzaWduYWwgdmFyaWFudHMgcmV1c2UgaXRzIHRlcnJhaW4gYW5kIHBhbm9yYW1hLlxuICAnZTctZGVhZC1iYW5kJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvcmVsYXktdmFsbGV5LXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgcmVsYXlWYWxsZXlDb250cmFjdFRleHQsIHJlbGF5VmFsbGV5UGFub3JhbWFDb250cmFjdFRleHQsIGRlYWRCYW5kQ29udHJhY3RUZXh0KSxcbiAgJ2U3LXJlbGF5LXJ1c2gnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL3JlbGF5LXZhbGxleS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9yZWxheS12YWxsZXktcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCByZWxheVZhbGxleUNvbnRyYWN0VGV4dCwgcmVsYXlWYWxsZXlQYW5vcmFtYUNvbnRyYWN0VGV4dCwgcmVsYXlSdXNoQ29udHJhY3RUZXh0KSxcbiAgLy8gTWFyZSBDbGFpbSBhbGlhc2VzOiBGYXIgU2lkZSBhbmQgRWNsaXBzZSBjaGFuZ2UgY2FtcGFpZ24gcnVsZXMgd2l0aG91dCBjaGFuZ2luZyB0aGUgc2N1bHB0LlxuICAnZTgtZmFyLXNpZGUnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL21hcmUtY2xhaW0tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG1hcmVDbGFpbUNvbnRyYWN0VGV4dCwgbWFyZUNsYWltUGFub3JhbWFDb250cmFjdFRleHQsIGZhclNpZGVDb250cmFjdFRleHQpLFxuICAnZTgtbG93LW9yYml0JzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9sb3ctb3JiaXQtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbG93LW9yYml0LXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgSlNPTi5zdHJpbmdpZnkoeyAuLi5KU09OLnBhcnNlKGxvd09yYml0Q29udHJhY3RUZXh0KSwgYm91bmRzTWV0ZXJzOiB7IG1pbjogWy02NCwgLTY0LCAtNS44Njk2ODldLCBtYXg6IFs2NCwgNjQsIDEuMDhdIH0gfSksIGxvd09yYml0UGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTgtZWNsaXBzZSc6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbWFyZS1jbGFpbS10ZXJyYWluLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9tYXJlLWNsYWltLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgbWFyZUNsYWltQ29udHJhY3RUZXh0LCBtYXJlQ2xhaW1QYW5vcmFtYUNvbnRyYWN0VGV4dCksXG4gICdlOS1zZWVkLXJ1bic6IGVudHJ5KG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvc2VlZC1ydW4tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvc2VlZC1ydW4tcGFub3JhbWEuZ2xiJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmLCBKU09OLnN0cmluZ2lmeSh7IC4uLkpTT04ucGFyc2Uoc2VlZFJ1bkNvbnRyYWN0VGV4dCksIGJvdW5kc01ldGVyczogeyBtaW46IFstNjQsIC02NCwgLTAuMTRdLCBtYXg6IFs2NCwgNjQsIDMuNzE1MTQyXSB9IH0pLCBzZWVkUnVuUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTktZGV2aWxzLWFsbGV5JzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9kZXZpbHMtYWxsZXktdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvZGV2aWxzLWFsbGV5LXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgSlNPTi5zdHJpbmdpZnkoeyAuLi5KU09OLnBhcnNlKGRldmlsc0FsbGV5Q29udHJhY3RUZXh0KSwgYm91bmRzTWV0ZXJzOiB7IG1pbjogWy02NCwgLTY0LCAtMC4xNF0sIG1heDogWzY0LCA2NCwgNC41NjcxMTVdIH0gfSksIGRldmlsc0FsbGV5UGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTktb2xkLWNhbmFsJzogZW50cnkobmV3IFVSTCgnLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS9vbGQtY2FuYWwtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2Uvb2xkLWNhbmFsLXBhbm9yYW1hLmdsYicsIGltcG9ydC5tZXRhLnVybCkuaHJlZiwgSlNPTi5zdHJpbmdpZnkoeyAuLi5KU09OLnBhcnNlKG9sZENhbmFsQ29udHJhY3RUZXh0KSwgYm91bmRzTWV0ZXJzOiB7IG1pbjogWy02NCwgLTY0LCAtMS40Ml0sIG1heDogWzY0LCA2NCwgMi45MDYzMTddIH0gfSksIG9sZENhbmFsUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEwLWFyY2hpdmUtd29ybGQnOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2FyY2hpdmUtd29ybGQtdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvYXJjaGl2ZS13b3JsZC1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGFyY2hpdmVXb3JsZENvbnRyYWN0VGV4dCwgYXJjaGl2ZVdvcmxkUGFub3JhbWFDb250cmFjdFRleHQpLFxuICAnZTEwLWxhc3QtY2xhaW0nOiBlbnRyeShuZXcgVVJMKCcuLi8uLi9hc3NldHMvcGlsb3RzL21hcC1yZWJ1aWxkLXNwaWtlL2xhc3QtY2xhaW0tdGVycmFpbi5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIG5ldyBVUkwoJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbGFzdC1jbGFpbS1wYW5vcmFtYS5nbGInLCBpbXBvcnQubWV0YS51cmwpLmhyZWYsIGxhc3RDbGFpbUNvbnRyYWN0VGV4dCwgbGFzdENsYWltUGFub3JhbWFDb250cmFjdFRleHQpLFxuICB9KSxcbn07XG5jb25zdCBMQU5ETUFSS19BU1NFVFMgPSBpbXBvcnQubWV0YS5nbG9iKFtcbiAgJy4uLy4uL2Fzc2V0cy9waWxvdHMvbWFwLXJlYnVpbGQtc3Bpa2UvbGFuZG1hcmtzLyoqLyouZ2xiJyxcbiAgLy8gU2hhcmUgdGhlIHRvd24gdmFyaWFudCBwYXR0ZXJuIHNvIHRoZSBFMSByZWxlYXNlIHBsdWdpbiBuYXJyb3dzIGJvdGggY29uc3VtZXJzLlxuICAnLi4vLi4vYXNzZXRzL3BpbG90cy8qLTNkLyouZSouZ2xiJyxcbl0sIHsgcXVlcnk6ICc/dXJsJywgaW1wb3J0OiAnZGVmYXVsdCcgfSkgYXMgUmVjb3JkPHN0cmluZywgKCkgPT4gUHJvbWlzZTxzdHJpbmc+PjtcblxuZnVuY3Rpb24gbGFuZG1hcmtBc3NldEtleShhc3NldDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGFzc2V0LnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IGAuLi8uLi8ke2Fzc2V0fWAgOiBgLi4vLi4vYXNzZXRzL3BpbG90cy9tYXAtcmVidWlsZC1zcGlrZS8ke2Fzc2V0fWA7XG59XG5cbmZ1bmN0aW9uIGxhbmRtYXJrTW91bnRzRm9yKGNvbnRyYWN0OiBDb250cmFjdCwgY29udHJhY3RJZDogc3RyaW5nKTogTGFuZG1hcmtNb3VudFtdIHtcbiAgcmV0dXJuIChjb250cmFjdC5sYW5kbWFya01vdW50cyA/PyBbXSkuZmlsdGVyKG1vdW50ID0+IG1vdW50LmFzc2V0ICYmICghbW91bnQuY29udHJhY3RJZHMgfHwgbW91bnQuY29udHJhY3RJZHMuaW5jbHVkZXMoY29udHJhY3RJZCkpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbnRyYWN0UHJlZmV0Y2hVcmxzKGNvbnRyYWN0SWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBSRUdJU1RSWVtjb250cmFjdElkXTtcbiAgaWYgKCFzZWxlY3RlZCkgcmV0dXJuIFtdO1xuICBjb25zdCBsYW5kbWFya3MgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBsYW5kbWFya01vdW50c0ZvcihzZWxlY3RlZC5jb250cmFjdCwgY29udHJhY3RJZClcbiAgICAgIC5mbGF0TWFwKCh7IGFzc2V0IH0pID0+IGFzc2V0ID8gW0xBTkRNQVJLX0FTU0VUU1tsYW5kbWFya0Fzc2V0S2V5KGFzc2V0KV1dIDogW10pXG4gICAgICAuZmlsdGVyKChyZXNvbHZlVXJsKTogcmVzb2x2ZVVybCBpcyAoKSA9PiBQcm9taXNlPHN0cmluZz4gPT4gISFyZXNvbHZlVXJsKVxuICAgICAgLm1hcCgocmVzb2x2ZVVybCkgPT4gcmVzb2x2ZVVybCgpLmNhdGNoKCgpID0+ICcnKSksXG4gICk7XG4gIHJldHVybiBbLi4ubmV3IFNldChbc2VsZWN0ZWQudGVycmFpblVybCwgc2VsZWN0ZWQucGFub3JhbWFVcmwsIC4uLmxhbmRtYXJrcy5maWx0ZXIoQm9vbGVhbildKV07XG59XG5cbi8vIFJFTkRFUi1PTkxZIExJVklORyBXQVRFUiBPVkVSIEEgU0NVTFBURUQgQ0hBTk5FTCAoZG9jcy9iZWF1dHkvZTEtdHdpbi1iYW5rcy1icmllZi5tZCBVMSkuXG4vL1xuLy8gVGhlIGJyYWlkJ3MgdHdvIGNoYW5uZWxzIGFyZSBjdXQgaW50byB0aGUgbW91bnRlZCBzY3VscHQgYnV0IHBhaW50ZWQgbmVhci1ibGFjaywgYmVjYXVzZSB0aGVcbi8vIHBpbG90IGhpZGVzIGV2ZXJ5IGxlZ2FjeSBsaXZpbmctd2F0ZXIgc3VyZmFjZSAoTEVHQUNZX0dST1VORF9TTE9UUyBiZWxvdykuIFRoaXMgdGFibGUgbmFtZXMgdGhlXG4vLyBjb250cmFjdHMgd2hvc2Ugc2N1bHB0IGNhcnJpZXMgcG9seWxpbmUgY2hhbm5lbHMgd29ydGggZHJlc3NpbmcsIGFuZCBob3cgZWFjaCBjaGFubmVsIHJlYWRzLlxuLy8gVGhlIEdFT01FVFJZIGlzIG5ldmVyIGF1dGhvcmVkIGhlcmUg4oCUIGl0IGlzIHJlYWQgZnJvbSB0aGUgY29udHJhY3QncyBvd24gbWFzayBwb2x5bGluZXMsIHRoZVxuLy8gc2FtZSB0YWJsZSBgYnVpbGRfdHdpbl9iYW5rc19icmFpZC5weWAgY3V0IHRoZSByZWxpZWYgZnJvbSwgc28gdGhlIHdhdGVyIGNhbiBvbmx5IGV2ZXIgc2l0IHdoZXJlXG4vLyB0aGUgc2N1bHB0IGlzIGFscmVhZHkgYmVsb3cgdGhlIHdhdGVyIHBsYW5lLiBBZG9wdGluZyB0aGF0IG1hc2sgYXMgU0lNIHRydXRoIGlzIGEgc2VwYXJhdGUsXG4vLyBvd25lci1nYXRlZCBkZWNpc2lvbiAoRi1PUDUtMSk6IG5vdGhpbmcgaGVyZSB0b3VjaGVzIGJhbmQgY2xhc3NpZmljYXRpb24sIGZvcmRzIG9yIGNyb3NzaW5ncy5cbnR5cGUgQ2hhbm5lbERyZXNzaW5nID0ge1xuICBkZXB0aDogJ2RlZXAnIHwgJ3NoYWxsb3cnO1xuICBnbGludHM/OiBBcnJheTx7IHg6IG51bWJlcjsgejogbnVtYmVyIH0+O1xuICBoZWFkSW5zZXQ6IG51bWJlcjtcbiAgdGFpbEluc2V0OiBudW1iZXI7XG4gIGhlYWRGYWRlOiBudW1iZXI7XG4gIHRhaWxGYWRlOiBudW1iZXI7XG59O1xuY29uc3QgQ09OVFJBQ1RfQ0hBTk5FTF9XQVRFUjogUmVjb3JkPHN0cmluZywge1xuICBzdXJmYWNlTGlmdDogbnVtYmVyO1xuICBlZGdlQmxlZWQ6IG51bWJlcjtcbiAgYmVkOiB7IGRlZXBNZXRlcnM6IG51bWJlcjsgc2hvcmVNZXRlcnM6IG51bWJlciB9O1xuICBjb25mbHVlbmNlczogQXJyYXk8eyBwb2ludHM6IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXI7IGhhbGZXaWR0aDogbnVtYmVyOyBhbHBoYTogbnVtYmVyIH0+IH0+O1xuICBmb3JkRGVwdGg/OiBudW1iZXI7XG4gIGNoYW5uZWxzOiBSZWNvcmQ8c3RyaW5nLCBDaGFubmVsRHJlc3Npbmc+O1xufT4gPSB7XG4gICdlMS10d2luLWJhbmtzJzoge1xuICAgIHN1cmZhY2VMaWZ0OiAwLjAxMixcbiAgICAvLyBHZW9tZXRyeS1vbmx5IG92ZXJkcmF3OiB0aGUgc3BsaW5lIGNhbiBzaXQgMC4yMSBtIGluc2lkZSB0aGUgcGllY2V3aXNlLWxpbmVhciBjdXQgYXQgYVxuICAgIC8vIGNvcm5lci4gVGhlIHNjdWxwdCdzIGRlcHRoIGJ1ZmZlciBzdGlsbCBjbGlwcyB0aGUgdmlzaWJsZSBzaG9yZWxpbmUgdG8gdGhlIDEuNSBtIG1hc2suXG4gICAgZWRnZUJsZWVkOiAwLjQ1LFxuICAgIGJlZDogeyBkZWVwTWV0ZXJzOiAwLjUyLCBzaG9yZU1ldGVyczogMC4wMzUgfSxcbiAgICBjb25mbHVlbmNlczogW1xuICAgICAgeyBwb2ludHM6IFtcbiAgICAgICAgeyB4OiAtMzQsIHo6IDAsIGhhbGZXaWR0aDogMS45LCBhbHBoYTogMCB9LFxuICAgICAgICB7IHg6IC0zMiwgejogMCwgaGFsZldpZHRoOiAxLjc1LCBhbHBoYTogMC41OCB9LFxuICAgICAgICB7IHg6IC0zMC41LCB6OiAwLCBoYWxmV2lkdGg6IDEuNiwgYWxwaGE6IDEgfSxcbiAgICAgICAgeyB4OiAtMjgsIHo6IDAsIGhhbGZXaWR0aDogMS41LCBhbHBoYTogMSB9LFxuICAgICAgICB7IHg6IC0yNi41LCB6OiAwLCBoYWxmV2lkdGg6IDEuODUsIGFscGhhOiAxIH0sXG4gICAgICAgIHsgeDogLTI1LjIsIHo6IDAsIGhhbGZXaWR0aDogMi4yNSwgYWxwaGE6IDAuNjIgfSxcbiAgICAgICAgeyB4OiAtMjMuOCwgejogMCwgaGFsZldpZHRoOiAyLjUsIGFscGhhOiAwIH0sXG4gICAgICBdIH0sXG4gICAgICB7IHBvaW50czogW1xuICAgICAgICB7IHg6IDIzLjgsIHo6IDAsIGhhbGZXaWR0aDogMi41LCBhbHBoYTogMCB9LFxuICAgICAgICB7IHg6IDI1LjIsIHo6IDAsIGhhbGZXaWR0aDogMi4yNSwgYWxwaGE6IDAuNjIgfSxcbiAgICAgICAgeyB4OiAyNi41LCB6OiAwLCBoYWxmV2lkdGg6IDEuODUsIGFscGhhOiAxIH0sXG4gICAgICAgIHsgeDogMjgsIHo6IDAsIGhhbGZXaWR0aDogMS41LCBhbHBoYTogMSB9LFxuICAgICAgICB7IHg6IDMwLjUsIHo6IDAsIGhhbGZXaWR0aDogMS42LCBhbHBoYTogMSB9LFxuICAgICAgICB7IHg6IDMyLCB6OiAwLCBoYWxmV2lkdGg6IDEuNzUsIGFscGhhOiAwLjU4IH0sXG4gICAgICAgIHsgeDogMzQsIHo6IDAsIGhhbGZXaWR0aDogMS45LCBhbHBoYTogMCB9LFxuICAgICAgXSB9LFxuICAgIF0sXG4gICAgLy8gRm9yZCBkZXB0aCBhcyBhIGZyYWN0aW9uIG9mIHRoZSB3YWRlLi5kZWVwIHJhbXA6IGEgcGFuIGEgaGVybyB3YWxrcyB0aHJvdWdoLCBub3QgYSBjaGFubmVsLlxuICAgIGZvcmREZXB0aDogMC4wNixcbiAgICBjaGFubmVsczoge1xuICAgICAgLy8gTm9ydGggcnVucyBkZWVwIGFuZCBmYXN0IOKAlCB0aGUgZ29sZCByaWRlcyBpdCwgYW5kIG9ubHkgaXQ6IGFuIGFzeW1tZXRyaWMgc3BhcmtsZSBpcyBob3dcbiAgICAgIC8vIGEgcGxheWVyIGxlYXJucyB3aGljaCBjaGFubmVsIGlzIHRoZSBkYW5nZXJvdXMgb25lIHdpdGhvdXQgYSBsaW5lIG9mIFVJLiBBbmNob3JzIHNpdCBPTlxuICAgICAgLy8gdGhlIG1hc2sgY2VudHJlbGluZSAodGhlIHNoYWRlciBkcmF3cyBlYWNoIGdsaW50IGFzIGEgdGhpbiBsaW5lIGF0IHRoZSBhbmNob3IncyB6LCBzbyBhblxuICAgICAgLy8gYW5jaG9yIG9mZiB0aGUgY2VudHJlbGluZSBsaWdodHMgdGhlIGJhbmsgaW5zdGVhZCBvZiB0aGUgY3VycmVudCkuXG4gICAgICAnbm9ydGgtY2hhbm5lbCc6IHtcbiAgICAgICAgZGVwdGg6ICdkZWVwJyxcbiAgICAgICAgZ2xpbnRzOiBbeyB4OiAtMTkuNSwgejogMi40MyB9LCB7IHg6IC02LjIsIHo6IDIuODkgfSwgeyB4OiA4LjEsIHo6IDMuMTYgfSwgeyB4OiAxOS44LCB6OiAyLjM0IH1dLFxuICAgICAgICBoZWFkSW5zZXQ6IDIuNCxcbiAgICAgICAgdGFpbEluc2V0OiAyLjQsXG4gICAgICAgIGhlYWRGYWRlOiAyLFxuICAgICAgICB0YWlsRmFkZTogMixcbiAgICAgIH0sXG4gICAgICAnc291dGgtY2hhbm5lbCc6IHsgZGVwdGg6ICdzaGFsbG93JywgaGVhZEluc2V0OiAyLjQsIHRhaWxJbnNldDogMi40LCBoZWFkRmFkZTogMiwgdGFpbEZhZGU6IDIgfSxcbiAgICB9LFxuICB9LFxufTtcblxuLy8gVFdPIEhPTUVTVEVBRFMsIFRXTyBMSVZFUyDigJQgUkVOREVSIFNJREUgKGRvY3MvYmVhdXR5L2UxLXR3aW4tYmFua3MtYnJpZWYubWQgVTQpLlxuLy8gVGhlIG1hcCdzIHN0b3J5IGlzIG9uZSBmYW1pbHkgaG9sZGluZyBib3RoIGJhbmtzLCBhbmQgdGhlIHBhaXIgc2hpcHMgYXMgdGhlIHNhbWUgYm9keSB1bmRlciBhXG4vLyAwLjA5IHJhZCByb3RhdGlvbiBkaWZmZXJlbmNlOiBhdCB0aGUgcnVuIGNhbWVyYSwgYW5kIHdvcnNlIGF0IDM5MHB4LCBub3RoaW5nIHRlbGxzIGEgcGxheWVyXG4vLyB3aGljaCBiYW5rIHRoZXkgYXJlIHN0YW5kaW5nIG9uLiBUaGUgYm9kaWVzIHRoZW1zZWx2ZXMgY291bGQgbm90IGJlIHJlLWF1dGhvcmVkIHRvbmlnaHQg4oCUIHRoZVxuLy8gbGFuZG1hcmsgcGFjayBubyBsb25nZXIgcmVnZW5lcmF0ZXMgZmFpdGhmdWxseSAoc2VlIHRoZSByZXZpZXcncyBVNCBlbnRyeSkg4oCUIHNvIHRoZSBkaWZmZXJlbmNlXG4vLyBpcyBodW5nIG9uIHRoZSBNT1VOVCBpbnN0ZWFkOiB0aGUgc291dGggcm9vZiAodGhlIHN0YWtlIHNpZGUsIHRoZSBsb3NzIGNvbmRpdGlvbikgaXMgZ3JhZGVkXG4vLyB3YXJtIGFuZCBjYXJyaWVzIGEgbGFtcGxpdCBwYW5lOyB0aGUgbm9ydGggb3V0cG9zdCBhY3Jvc3MgdGhlIGJyYWlkIGlzIGdyYWRlZCBjb29sIGFuZCBzdGF5c1xuLy8gZGFyay4gU2FtZSBpZHMsIHNhbWUgYm9kaWVzLCBzYW1lIGZvb3RwcmludHMg4oCUIHRoZSBzaW0gbmV2ZXIgc2VlcyB0aGlzLlxudHlwZSBMYW5kbWFya0RyZXNzaW5nID0geyBlbWlzc2l2ZTogW251bWJlciwgbnVtYmVyLCBudW1iZXJdOyBsYW1wPzogeyBhY3Jvc3NYOiBudW1iZXI7IHVwWTogbnVtYmVyOyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9IH07XG5jb25zdCBDT05UUkFDVF9MQU5ETUFSS19EUkVTU0lORzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgTGFuZG1hcmtEcmVzc2luZz4+ID0ge1xuICAnZTEtdHdpbi1iYW5rcyc6IHtcbiAgICBzb3V0aF9iYW5rX2hvbWVzdGVhZDogeyBlbWlzc2l2ZTogWzEuMTQsIDAuOTksIDAuNzRdLCBsYW1wOiB7IGFjcm9zc1g6IDAuNjgsIHVwWTogMC41Niwgd2lkdGg6IDAuODIsIGhlaWdodDogMC42MiB9IH0sXG4gICAgc291dGhfYmFua193aW5jaDogeyBlbWlzc2l2ZTogWzEuMTAsIDAuOTcsIDAuODBdIH0sXG4gICAgbm9ydGhfYmFua19ob21lc3RlYWQ6IHsgZW1pc3NpdmU6IFswLjc4LCAwLjg4LCAxLjAyXSB9LFxuICAgIG5vcnRoX2Jhbmtfd2luY2g6IHsgZW1pc3NpdmU6IFswLjgwLCAwLjg5LCAxLjAyXSB9LFxuICB9LFxufTtcbi8vIFNhdHVyYXRlZCBvbiBwdXJwb3NlOiBBQ0VTIHRvbmUgbWFwcGluZyB3YWxrcyBhIGJyaWdodCB1bmxpdCBwYW5lIHRvd2FyZCB3aGl0ZSwgYW5kIGEgbGFtcFxuLy8gdGhhdCByZWFkcyB3aGl0ZSByZWFkcyBhcyBhIGhvbGUgaW4gdGhlIHdhbGwuXG5jb25zdCBMQU1QX0NPTE9VUiA9ICcjZmY5YzM4JztcblxuY29uc3QgQk9VTkRTX0VQU0lMT04gPSAwLjAzO1xuY29uc3QgQ09OVElOVUFUSU9OX1NBTVBMRV9ERVBUSCA9IDg7XG5jb25zdCBMRUdBQ1lfR1JPVU5EX1NMT1RTID0gbmV3IFNldChbJ3RlcnJhaW4uYmFuaycsICd0ZXJyYWluLnJpdmVyJywgJ3RlcnJhaW4uZm9yZCddKTtcbmNvbnN0IE5JR0hUX1BPT0xfU0hBREVSX0NBUCA9IDMyO1xuXG4vLyBVMSwgdGhlLWNsYWltIGJlYXV0eSBzaGlmdCAoZG9jcy9iZWF1dHkvdGhlLWNsYWltLWJyaWVmLm1kKTogdGhlIHNjdWxwdCBjYXJ2ZXMgYVxuLy8gY2hhbm5lbCBhbmQgdGhlbiBoaWRlcyBldmVyeSBwYWludGVkIHdhdGVyIHN1cmZhY2UsIHNvIHRoZSBtYXAncyBvbmUgZXZlbnQgaGFzXG4vLyBiZWVuIGEgc3RhdGljIGJsYWNrIHNsb3QuIFRoZXNlIGNvbnRyYWN0cyBnZXQgYSByZW5kZXItb25seSBsaXZpbmctd2F0ZXIgcXVhZCBsYWlkXG4vLyBpbnRvIHRoYXQgY2hhbm5lbC4gUGVyIGNvbnRyYWN0IGJlY2F1c2UgZWFjaCBzY3VscHQncyBiZWQgc2l0cyBhdCBpdHMgb3duIGRlcHRoLlxuLy9cbi8vIGUyLWhpbGwtbWluZSBqb2lucyBhdCB0aGUgRTIgYmVhdXR5IHNoaWZ0IChkb2NzL2JlYXV0eS9lMi1oaWxsLW1pbmUtYnJpZWYubWQgVTEpOiBpdHMgZmxvb2RlZFxuLy8gZ2FsbGVyeSBpcyB0aGUgc2FtZSBkaXNlYXNlIHdpdGggYSBkaWZmZXJlbnQgYmVkLiBFdmVyeXRoaW5nIGJlbG93IGlzIERSRVNTSU5HIOKAlCB0aGUgc3VyZmFjZSdzXG4vLyBoZWlnaHQgaXMgc3RpbGwgbWVhc3VyZWQgb2ZmIHRoZSBiYWtlZCBzY3VscHQgYW5kIHRoZSBmb3JkL3JpdmVyIHdpZHRocyBzdGlsbCBjb21lIGZyb20gdGhlXG4vLyBzaW0ncyBvd24gZGVjbGFyYXRpb25zLCBzbyBhIHJlLXNjdWxwdCBvciBhIHJ1bGVzIGNoYW5nZSBtb3ZlcyB0aGUgd2F0ZXIgYW5kIG5vdGhpbmcgaGVyZVxuLy8gYXJndWVzIHdpdGggaXQuXG50eXBlIFNjdWxwdFdhdGVyRHJlc3NpbmcgPSB7XG4gIHN1cmZhY2U6XG4gICAgfCB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnOyBmaWxsOiBudW1iZXIgfVxuICAgIHwgeyBraW5kOiAnYmVsb3ctZ29yZ2UtZmxvb3InOyBxdWFudGlsZTogbnVtYmVyOyBkcm9wOiBudW1iZXIgfVxuICAgIHwgeyBraW5kOiAnc2VhLWxldmVsJzsgeTogbnVtYmVyIH07XG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHRoZSBzaGFkZXIncyB3YXRlciBwYWxldHRlIChzaGFsbG93L21pZC9kZWVwL2ZvcmQsIGZvYW0gYW5kIGdsaW50cyBhbGlrZSkuIFdoaXRlXG4gICAqIGtlZXBzIHRoZSBzaGlwcGVkIG1pbnQuIFRoZSBjbGFpbSBwdWxscyBpdCB3YXJtIHNlcGlhOyB0aGUgaGlsbCBtaW5lIHB1bGxzIGl0IHRvd2FyZCB3ZXQgc2xhdGVcbiAgICogc28gdGhlIEUyIGZhbWlseSdzIFwibXVya3kgd29ya2luZyB3YXRlclwiIHJlYWRzIGFzIHdvcmtlZCwgbm90IGFzIGEgbW91bnRhaW4gc3RyZWFtLlxuICAgKi9cbiAgY29sb3I6IHN0cmluZztcbiAgb3BhY2l0eTogbnVtYmVyO1xuICAvKiogSG93IG11Y2ggd2F0ZXIgc3RhbmRzIG92ZXIgdGhlIGZvcmQgc2hlbGY6IGFua2xlIGRlZXAsIHN0aWxsIG9idmlvdXNseSBhIGNyb3NzaW5nLiAqL1xuICBmb3JkU2tpbTogbnVtYmVyO1xuICAvKiogTWV0cmVzIG9mIHN0YW5kaW5nIHdhdGVyIHRoYXQgcmVhZCBhcyBmdWxseSBkZWVwIGluIHRoZSBiZWQtZGVwdGggYmFrZS4gKi9cbiAgZGVlcE1ldGVyczogbnVtYmVyO1xuICAvKiogTWV0cmVzIG9mIHRoZSBsYXN0LCBzaGFsbG93ZXN0IHdhdGVyIOKAlCB0aGUgZGFtcCBtYXJnaW4gdGhlIHN1cmZhY2UgZmFkZXMgb3V0IGFjcm9zcy4gKi9cbiAgc2hvcmVNZXRlcnM6IG51bWJlcjtcbiAgLyoqXG4gICAqIEhhbGYgd2lkdGggb2YgdGhlIHdhdGVyIHF1YWQgaW4gWi4gRGVmYXVsdHMgdG8gdGhlIHRpbGUncyBkZWNsYXJlZCB2aXN1YWwgd2F0ZXIgaGFsZiB3aWR0aDtcbiAgICogYSBtYXAgd2hvc2UgcGFpbnRlZCBiZWQgaXMgbmFycm93ZXIgdGhhbiB0aGF0IGRlY2xhcmF0aW9uIG92ZXJyaWRlcyBpdCwgb3IgdGhlIHN1cmZhY2UgZmxvb2RzXG4gICAqIGdyb3VuZCB0aGUgYXRsYXMgcGFpbnRzIGRyeS5cbiAgICovXG4gIHZpc3VhbEhhbGZXaWR0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIFdoZXJlIHRoZSBzdW4gY2F0Y2hlcyB0aGUgc3VyZmFjZS4gYGhhcnZlc3RgIHB1dHMgb25lIG9uIGVhY2ggaGFydmVzdCBhbmNob3IncyBuZWFyIGJhbmsgKHRoZVxuICAgKiBjbGFpbSdzIHNsdWljZSBsaW5lKTsgZXhwbGljaXQgbGlzdHMgdXNlIHdvcmxkIFggYW5kIFogb2Zmc2V0cyBmcm9tIHRoZSByaXZlciBjZW50ZXIuXG4gICAqL1xuICBnbGludHM6ICdoYXJ2ZXN0JyB8IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfT47XG4gIHJpcHBsZVN0cmVuZ3RoPzogbnVtYmVyO1xuICByaXBwbGVTY2FsZT86IG51bWJlcjtcbiAgLyoqIEJsZW5kIHdlaWdodCBmb3IgdGhlIHByb2NlZHVyYWwgY2FudmFzIG1hcC4gU2VlIHRoZSBub3RlIG9uIHRoZSBoaWxsIG1pbmUncyBlbnRyeS4gKi9cbiAgdGV4dHVyZUJsZW5kPzogbnVtYmVyO1xuICAvKiogU2tpcCB0aGUgYmFrZWQgYmVkIG1hcCB3aGVuIHRoZSBhdXRob3JlZCBiZWQgaXMgYSBmbGF0IHBhbi4gKi9cbiAgYmVkPzogYm9vbGVhbjtcbiAgZm9yZFRpbnQ/OiBudW1iZXI7XG4gIHNob3JlRmFkZU1ldGVycz86IG51bWJlcjtcbiAgc3VyZmFjZUxpZnQ/OiBib29sZWFuO1xuICBvdmVyaGFuZ01ldGVycz86IG51bWJlcjtcbiAgZW1pc3NpdmU/OiBzdHJpbmc7XG4gIC8qKiBGb2FtIGNvbGxhcnMgd2hlcmUgbGFuZG1hcmsgcGllcnMgbWVldCB0aGUgc3VyZmFjZS4gKi9cbiAgY29sbGFycz86IFJlYWRvbmx5QXJyYXk8eyBtb3VudDogc3RyaW5nOyByYWRpdXM6IG51bWJlciB9Pjtcbn07XG5jb25zdCBTQ1VMUFRfV0FURVJfRFJFU1NJTkc6IFJlY29yZDxzdHJpbmcsIFNjdWxwdFdhdGVyRHJlc3Npbmc+ID0ge1xuICAvLyBLZWVwIHRoZSBtZWFzdXJlZCBkYXJrIGNoYW5uZWwgYW5kIGZvcmQgc2hlbGY7IGNvb2wgd2F0ZXIgc2VwYXJhdGVzIGZyb20gdGhlIHdhcm0gYmFua3MuXG4gIC8vIFRoZSBDbGFpbSBjb25jZXB0IGNvbXBhcmlzb24gaXMgcmVjb3JkZWQgaW4gYXJ0aWZhY3RzL21hcC1hcnQtcmVwYWlycy0yMDI2MDkwOC9jbGFpbS13YXRlci0wMS8uXG4gICd0aGUtY2xhaW0nOiB7XG4gICAgc3VyZmFjZTogeyBraW5kOiAnY2hhbm5lbC1maWxsJywgZmlsbDogMC40MiB9LFxuICAgIGNvbG9yOiAnIzk5YmVjNycsXG4gICAgZW1pc3NpdmU6ICcjMTAyNzJjJyxcbiAgICBvcGFjaXR5OiAwLjgsXG4gICAgLy8gVGhlIGNhcnZlZCBjaGFubmVsIHJ1bnMgfjAuNDVtIGJlbG93IHRoZSB3YXRlciBsaW5lIGF0IGl0cyBkZWVwZXN0OyB0aGUgbGFzdFxuICAgIC8vIH4xNWNtIG9mIGRlcHRoIGlzIHRoZSBkYW1wIG1hcmdpbiB3aGVyZSB0aGUgc3VyZmFjZSBmYWRlcyBpbnRvIHdldCBncm91bmQuXG4gICAgZm9yZFNraW06IDAuMTEsXG4gICAgZGVlcE1ldGVyczogMC41LFxuICAgIHNob3JlTWV0ZXJzOiAwLjE1LFxuICAgIGdsaW50czogJ2hhcnZlc3QnLFxuICB9LFxuICAvLyBOaWdodCBTaGlmdCdzIGNoYW5uZWwgdXNlZCBvbmx5IGl0cyBkYXJrIGJlZCBwYWludC4gS2VlcCB0aGUgc2N1bHB0IGFuZCB0aGVcbiAgLy8gZGVjbGFyZWQgZm9yZDsgYSByZXN0cmFpbmVkLCBzdW4tbGl0IHN1cmZhY2Ugc3VwcGxpZXMgbW92aW5nIHdhdGVyIGRldGFpbC5cbiAgLy8gTm8gZW1pc3Npb246IHRoZSB1bmxpdCByaXZlciBtdXN0IHN0aWxsIGJlY29tZSBkYXJrIGR1cmluZyB0aGUgbmlnaHQgcGhhc2UuXG4gICdlMS1uaWdodC1zaGlmdCc6IHtcbiAgICBzdXJmYWNlOiB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnLCBmaWxsOiAwLjQyIH0sIGNvbG9yOiAnIzg5OWI5YicsIG9wYWNpdHk6IDAuNjQsXG4gICAgZm9yZFNraW06IDAuMDgsIGRlZXBNZXRlcnM6IDAuNSwgc2hvcmVNZXRlcnM6IDAuMTUsXG4gICAgZ2xpbnRzOiBbXSwgcmlwcGxlU3RyZW5ndGg6IDAuMzIsIHRleHR1cmVCbGVuZDogMC4wNiwgZm9yZFRpbnQ6IDAuMyxcbiAgfSxcbiAgLy8gVGhlIHNjdWxwdCBoaWRlcyBsZWdhY3kgd2F0ZXIuIFRoaXMgaXMgdGhlIG9uZSB2aXNpYmxlIHN1cmZhY2UsIGNvbnRhaW5lZFxuICAvLyBieSB0aGUgZXhpc3RpbmcgYmVkIGFuZCBmb3JkLCB3aXRoIG5vIGV4dHJhIGxpZ2h0IG9yIHNpbXVsYXRpb24gYXV0aG9yaXR5LlxuICAnZTEtYmFyb24nOiB7XG4gICAgc3VyZmFjZTogeyBraW5kOiAnY2hhbm5lbC1maWxsJywgZmlsbDogMC40MiB9LCBjb2xvcjogJyM4NDlkYTEnLCBvcGFjaXR5OiAwLjYyLFxuICAgIGZvcmRTa2ltOiAwLjA2LCBkZWVwTWV0ZXJzOiAwLjUsIHNob3JlTWV0ZXJzOiAwLjE1LCB2aXN1YWxIYWxmV2lkdGg6IDYuMjUsXG4gICAgZ2xpbnRzOiBbXSwgcmlwcGxlU3RyZW5ndGg6IDAuNiwgdGV4dHVyZUJsZW5kOiAwLjA3LCBmb3JkVGludDogMC4zNSxcbiAgfSxcbiAgLy8gVEhFIEZMT09ERUQgR0FMTEVSWS4gTWVhc3VyZWQsIG5vdCBndWVzc2VkIChsb2dzL3Nlc3Npb24tc2NyYXRjaC9lMi1oaWxsLW1pbmUtYmFuZC1zY2FuLm1qcyk6XG4gIC8vIHRoZSBhdGxhcyBwYWludHMgdGhlIGJlZCBuZWFyLWJsYWNrIGFjcm9zcyBFWEFDVExZIHRoZSBzaW0ncyBkZWNsYXJlZCByaXZlciBiYW5kIOKAlCBsdW1hIDE2LTI2XG4gIC8vIGZvciB6IGluIFstNS41LCA1LjVdIGFnYWluc3QgNDktNzcgb24gdGhlIG9jaHJlIGVpdGhlciBzaWRlIOKAlCBvdmVyIGEgZmxvb3IgdGhhdCBpcyBkZWFkIGZsYXQgYXRcbiAgLy8geSAtMC4xOCB3aXRoIGxpcHMgYXQgfHp8IH4gNiAoLTAuMDYyIHNvdXRoLCArMC4wNTcgbm9ydGgpLiBUaHJlZSBjb25zZXF1ZW5jZXM6XG4gIC8vICAgKiB0aGUgZmlsbC9za2ltIHBhaXIgbGFuZHMgdGhlIHN1cmZhY2UgYXQgLTAuMDcwLCBpLmUuIFVOREVSIGJvdGggbGlwcywgc28gdGhlIHdhdGVyIGlzXG4gIC8vICAgICBjb250YWluZWQgYnkgdGhlIGN1dCBpbnN0ZWFkIG9mIHNwaWxsaW5nIG9udG8gdGhlIGxvd2VyIHNvdXRoIGJlbmNoICh3aGljaCBpcyAwLjQgbSBCRUxPV1xuICAvLyAgICAgdGhlIGdhbGxlcnkgZmxvb3IgYW5kIHBhaW50ZWQgZHJ5IOKAlCBhIGZsYXQgcXVhZCB3b3VsZCBoYXZlIGZsb29kZWQgaXQgaW52aXNpYmx5KTtcbiAgLy8gICAqIHRoZSBxdWFkIGlzIG5hcnJvd2VkIHRvIHRoZSBwYWludGVkIGJhbmQuIFRoZSB0aWxlIGRlY2xhcmVzIGEgdmlzdWFsIGhhbGYgd2lkdGggb2YgMTAsIGFuZFxuICAvLyAgICAgd2F0ZXIgb3V0IHRvIHx6fCA9IDEwIHdvdWxkIHNpdCBvbiBsaXQgb2NocmUgZ3JvdW5kO1xuICAvLyAgICogdGhlIGJlZCBpcyBmbGF0LCBzbyBERVBUSCBjYW5ub3QgY29tZSBmcm9tIHRoZSBiYWtlIHRoZSB3YXkgaXQgZG9lcyBvbiB0aGUgY2xhaW0uIEl0IGNvbWVzXG4gIC8vICAgICBmcm9tIHRoZSBuZWFyLWJsYWNrIHBhaW50IHJlYWRpbmcgdGhyb3VnaCBhIHN1cmZhY2UgdGhhdCBpcyBkZWxpYmVyYXRlbHkgbm90IHZlcnkgb3BhcXVlIOKAlFxuICAvLyAgICAgd2hpY2ggaXMgd2hhdCBcIm11cmt5IHdvcmtpbmcgd2F0ZXJcIiBpcywgYW5kIHdoeSBkZWVwTWV0ZXJzIGlzIDAuMTIgKHRoZSByZWFsIHN0YW5kaW5nXG4gIC8vICAgICBkZXB0aCkgcmF0aGVyIHRoYW4gdGhlIGNsYWltJ3MgMC41LlxuICAnZTItaGlsbC1taW5lJzogeyBzdXJmYWNlOiB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnLCBmaWxsOiAwLjQyIH0sIGNvbG9yOiAnIzhhODE3NycsIG9wYWNpdHk6IDAuNzIsIGZvcmRTa2ltOiAwLjExLCBkZWVwTWV0ZXJzOiAwLjEyLCBzaG9yZU1ldGVyczogMC4wNSwgdmlzdWFsSGFsZldpZHRoOiA1LjksIGdsaW50czogW3sgeDogLTI3LCB6OiAtNS4xIH0sIHsgeDogMTMsIHo6IDUuMSB9LCB7IHg6IDMzLCB6OiAtNS4xIH1dLCByaXBwbGVTdHJlbmd0aDogMS4xNSwgdGV4dHVyZUJsZW5kOiAwLCB9LFxuICAnZTItdHJlc3RsZSc6IHsgc3VyZmFjZTogeyBraW5kOiAnYmVsb3ctZ29yZ2UtZmxvb3InLCBxdWFudGlsZTogMC44LCBkcm9wOiAwLjAwNiB9LCBjb2xvcjogJyM3ZTg0ODAnLCBvcGFjaXR5OiAwLjg2LCBmb3JkU2tpbTogMC4xMSwgZGVlcE1ldGVyczogMC40Miwgc2hvcmVNZXRlcnM6IDAuMTYsIGdsaW50czogW3sgeDogLTE1LjUsIHo6IC00LjMgfSwgeyB4OiAtNC41LCB6OiAtNC41IH1dLCByaXBwbGVTdHJlbmd0aDogMC40LCB0ZXh0dXJlQmxlbmQ6IDAuMDUsIH0sXG4gICdlMi1wcmVzc3VyZS1nYXJkZW4nOiB7IHN1cmZhY2U6IHsga2luZDogJ2NoYW5uZWwtZmlsbCcsIGZpbGw6IDAuMTEgfSwgY29sb3I6ICcjY2JkZGUyJywgb3BhY2l0eTogMC45OSwgZm9yZFNraW06IDAuMTEsIGRlZXBNZXRlcnM6IDAuNSwgc2hvcmVNZXRlcnM6IDAuMTUsIGJlZDogZmFsc2UsIHZpc3VhbEhhbGZXaWR0aDogNi4yNSwgZ2xpbnRzOiBbeyB4OiAtMzAsIHo6IDQuNDUgfSwgeyB4OiAtMTIsIHo6IDQuNDUgfSwgeyB4OiAxMiwgejogNC40NSB9LCB7IHg6IDMwLCB6OiA0LjQ1IH1dLCByaXBwbGVTdHJlbmd0aDogMC40LCByaXBwbGVTY2FsZTogMS42LCB0ZXh0dXJlQmxlbmQ6IDAsIGZvcmRUaW50OiAwLjI1LCBzaG9yZUZhZGVNZXRlcnM6IDEsIHN1cmZhY2VMaWZ0OiB0cnVlLCBvdmVyaGFuZ01ldGVyczogMTAsIGNvbGxhcnM6IFt7IG1vdW50OiAnZ2FyZGVuLXByZXNzdXJlLW1hbmlmb2xkJywgcmFkaXVzOiAyLjkgfSwgeyBtb3VudDogJ3dhdGVyLWJhbmQtcHVtcC1zdGF0aW9uJywgcmFkaXVzOiAyLjYgfV0sIH0sXG4gICdlMi1pbmNsaW5lJzogeyBzdXJmYWNlOiB7IGtpbmQ6ICdjaGFubmVsLWZpbGwnLCBmaWxsOiAwLjQyIH0sIGNvbG9yOiAnI2JiOTM2NicsIG9wYWNpdHk6IDAuNjIsIGZvcmRTa2ltOiAwLjEyNSwgZGVlcE1ldGVyczogMC4xNDUsIHNob3JlTWV0ZXJzOiAwLjA3LCB2aXN1YWxIYWxmV2lkdGg6IDYuMjUsIGdsaW50czogW3sgeDogLTMwLCB6OiA0LjQ1IH0sIHsgeDogMzAsIHo6IC00LjQ1IH1dLCByaXBwbGVTdHJlbmd0aDogMC42LCB0ZXh0dXJlQmxlbmQ6IDAuMiwgfSxcbn07XG4vKiogVGhlIEU1IGNvbnRyYWN0cyByZXNlcnZlIHRoZWlyIHNlYSBmb3IgcnVudGltZTsgdGhlIHNjdWxwdCBzdXBwbGllcyB0aGUgdmlzaWJsZSBiZWQuICovXG5jb25zdCBERUVQV0FURVJfU0VBX0RSRVNTSU5HOiBTY3VscHRXYXRlckRyZXNzaW5nID0ge1xuICBzdXJmYWNlOiB7IGtpbmQ6ICdzZWEtbGV2ZWwnLCB5OiAwIH0sIGNvbG9yOiAnIzk5YmVjNycsIG9wYWNpdHk6IDAuNTYsXG4gIGZvcmRTa2ltOiAwLCBkZWVwTWV0ZXJzOiA4LCBzaG9yZU1ldGVyczogMC41LCBnbGludHM6IFtdLFxuICByaXBwbGVTdHJlbmd0aDogMC4xNSwgdGV4dHVyZUJsZW5kOiAwLjEwLCBmb3JkVGludDogMCwgc2hvcmVGYWRlTWV0ZXJzOiA0LCBzdXJmYWNlTGlmdDogZmFsc2UsXG4gIGVtaXNzaXZlOiAnIzBhMmEzMycsXG59O1xuLyoqIFdhdGVyIGZhZGVzIG91dCBvdmVyIHRoZSBsYXN0IHN0cmV0Y2ggYmVmb3JlIHRoZSB0aWxlIGVkZ2UgaW5zdGVhZCBvZiBjdXR0aW5nLiAqL1xuY29uc3QgU0NVTFBUX1dBVEVSX0VER0VfRkFERSA9IDc7XG4vKiogVTM6IGNvbnRyYWN0cyB3aG9zZSBtb3VudGVkIGxhbmRtYXJrcyBnZXQgc29mdCBjb250YWN0IGVsbGlwc2VzLiAqL1xuY29uc3QgTEFORE1BUktfQ09OVEFDVF9DT05UUkFDVFMgPSBuZXcgU2V0KFsndGhlLWNsYWltJywgJ2UyLWhpbGwtbWluZScsICdlMi10cmVzdGxlJywgJ2UyLXByZXNzdXJlLWdhcmRlbicsICdlMi1pbmNsaW5lJ10pO1xudHlwZSBTcGFuU2hhZG93RHJlc3NpbmcgPSB7IG1vdW50SWQ6IHN0cmluZzsgd2lkdGhTY2FsZTogbnVtYmVyOyBsZW5ndGhTY2FsZTogbnVtYmVyOyB0aHJvdzogbnVtYmVyOyBvcGFjaXR5OiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfTtcbmNvbnN0IFNQQU5fU0hBRE9XX0NPTlRSQUNUUzogUmVjb3JkPHN0cmluZywgU3BhblNoYWRvd0RyZXNzaW5nPiA9IHtcbiAgJ2UyLXRyZXN0bGUnOiB7IG1vdW50SWQ6ICd0cmVzdGxlLWNyb3NzaW5nJywgd2lkdGhTY2FsZTogMC4zOCwgbGVuZ3RoU2NhbGU6IDAuNDgsIHRocm93OiAwLjYyLCBvcGFjaXR5OiAwLjQyLCBjb2xvcjogJyMxZDEyMDYnIH0sXG59O1xuY29uc3QgU1BBTl9TSEFET1dfUk9XUyA9IDI4O1xuY29uc3QgU1BBTl9TSEFET1dfRU5EX1RBUEVSID0gMC4xNjtcbmNvbnN0IFNQQU5fU0hBRE9XX0xJRlQgPSAwLjAxMjtcbi8qKlxuICogVTU6IGNvbnRyYWN0cyB0aGF0IGdldCB0aGUgZHJpZnRpbmcgbW90ZSBmaWVsZCwgYW5kIGl0cyBoYXJkIGNhcC5cbiAqXG4gKiBUSU5ULCBET04nVCBDT1VOVC1DVVQuIFRoZSBjbGFpbSdzIHNoaWZ0IHJlY29yZGVkIHRoYXQgaXRzIG93biBtb3RlcyBmaXJzdCByZWFkIGFzIHNub3cgb3ZlciB0aGVcbiAqIGRhcmsgd2F0ZXIsIGFuZCB0aGF0IHRoZSBmaXggd2FzIHRoZSBjb2xvdXIgcmF0aGVyIHRoYW4gdGhlIG51bWJlciDigJQgYSB0aGlubmVyIGZpZWxkIG9mIHRoZSB3cm9uZ1xuICogY29sb3VyIHN0aWxsIHJlYWRzIGFzIHRoZSB3cm9uZyB3ZWF0aGVyLiBTbyB0aGUgaGlsbCBtaW5lIGtlZXBzIHRoZSBjbGFpbSdzIGNhcCBhbmQgdGFrZXMgaXRzXG4gKiBhaXIgZnJvbSB0aGUgZXJhIGluc3RlYWQ6IHRoaXMgaXMgY29hbCBjb3VudHJ5LCBhbmQgd2hhdCBoYW5ncyBpbiBpdHMgbG93IHN1biBpcyB1bWJlciBzb290LCBub3RcbiAqIGdvbGQgZHVzdC4gVGhlIGJveCBpcyB0aGUgbWFwJ3Mgb3duIHdvcmtpbmcgZ3JvdW5kICh0aGUgZ2FsbGVyeSBhbmQgdGhlIGJhc2UgYmVuY2gpLCBub3QgYSBjb3B5XG4gKiBvZiB0aGUgY2xhaW0ncyByaXZlciBib3guXG4gKi9cbnR5cGUgU3VuTW90ZURyZXNzaW5nID0geyBjb2xvcjogc3RyaW5nOyBoYWxmWjogbnVtYmVyOyBjZW50ZXJaOiBudW1iZXI7IG1pblk6IG51bWJlcjsgbWF4WTogbnVtYmVyOyBzaXplOiBudW1iZXI7IHNlZWQ6IG51bWJlcjsgaGFsZlhTY2FsZT86IG51bWJlciB9O1xuY29uc3QgU1VOX01PVEVTOiBSZWNvcmQ8c3RyaW5nLCBTdW5Nb3RlRHJlc3Npbmc+ID0ge1xuICAndGhlLWNsYWltJzogeyBjb2xvcjogJyNmZmQ5YTInLCBoYWxmWjogMTMsIGNlbnRlclo6IDQsIG1pblk6IDAuNCwgbWF4WTogNS4wLCBzaXplOiAyLjEsIHNlZWQ6IDB4MWMxYSB9LFxuICAnZTItaGlsbC1taW5lJzogeyBjb2xvcjogJyNhODc5NGEnLCBoYWxmWjogMTcsIGNlbnRlclo6IDcsIG1pblk6IDAuMywgbWF4WTogNS42LCBzaXplOiAyLjMsIHNlZWQ6IDB4MmU1NyB9LFxuICAnZTItdHJlc3RsZSc6IHsgY29sb3I6ICcjYzM5YTY4JywgaGFsZlo6IDE0LCBjZW50ZXJaOiAwLCBtaW5ZOiAwLjIsIG1heFk6IDUuNiwgc2l6ZTogMi4zLCBzZWVkOiAweDNiMTIgfSxcbiAgJ2UyLXByZXNzdXJlLWdhcmRlbic6IHsgY29sb3I6ICcjYzlhMjc5JywgaGFsZlo6IDE1LCBjZW50ZXJaOiAzMSwgbWluWTogMC45LCBtYXhZOiA2LjQsIHNpemU6IDIuMywgc2VlZDogMHgyZTA3IH0sXG4gICdlMi1pbmNsaW5lJzogeyBjb2xvcjogJyNlMGE4NzgnLCBoYWxmWjogMzAsIGNlbnRlclo6IDEyLCBtaW5ZOiAwLjUsIG1heFk6IDYuNCwgc2l6ZTogMi4yLCBzZWVkOiAweDJlMTUsIGhhbGZYU2NhbGU6IDAuNzIgfSxcbn07XG4vKiogVTViIGlzIHRoZSBDTEFJTSdzIHJld2FyZCBub3RlLCBub3QgZXZlcnkgbW90ZSBtYXAnczogdGhlIGVtYmVycyBuZWVkIGEgY2xhaW0gc3Rha2UgdG8gc2l0IG9uLiAqL1xuY29uc3QgUlVTSF9FTUJFUl9DT05UUkFDVFMgPSBuZXcgU2V0KFsndGhlLWNsYWltJ10pO1xuY29uc3QgU1VOX01PVEVfQ0FQID0gMjAwO1xuXG4vKipcbiAqIFU0IOKAlCBUSEUgRVJBIEJSRUFUSEVTLiBTdGVhbSBhbmNob3JlZCB0byB0aGUgbWFwJ3Mgb3duIG5hbWVkIHN0ZWFtIGJvZGllcy5cbiAqXG4gKiBQbGFjZW1lbnQgaXMgZXhwcmVzc2VkIGFzIEZSQUNUSU9OUyBvZiB0aGUgbW91bnRlZCBib2R5J3Mgd29ybGQgYm91bmRpbmcgYm94LCBuZXZlciBhcyB3b3JsZFxuICogY29vcmRpbmF0ZXMsIHNvIHRoZSBlbWl0dGVyIGZvbGxvd3MgdGhlIGJvZHkgaWYgYSBtb3VudCBldmVyIG1vdmVzIG9yIGEgcGFjayBpcyByZS1zY2FsZWQg4oCUIHRoZVxuICogYGRyZXNzTGFuZG1hcmtgIGxhbXAgcHJlY2VkZW50LCBhbmQgdGhlIHJlYXNvbiB0aGUgZHJ5LWd1bGNoIHNwcmluZydzIGhhcmQtY29kZWQgcG9vbCBudW1iZXJzXG4gKiBuZWVkZWQgYSByZS1tZWFzdXJlIG5vdGUuIFRoZSBmcmFjdGlvbnMgdGhlbXNlbHZlcyBhcmUgbWVhc3VyZWQgb2ZmIHRoZSBzaGlwcGVkIEdMQnNcbiAqIChgbG9ncy9zZXNzaW9uLXNjcmF0Y2gvaGlsbC1taW5lLWxhbmRtYXJrLWJveGVzLm1qc2ApOiB0aGUgYm9pbGVyIGhvdXNlJ3MgdGFsbGVzdCBjb2x1bW4gaXMgaXRzXG4gKiBzdGFjaywgYXQgbG9jYWwgeCAtMi4wIC8geiAtMS4yNSBvZiBhIGJvZHkgc3Bhbm5pbmcgwrE0LjA5IHggwrEzLjczLCBpLmUuIDAuMjU1IC8gMC4zMzIgYWNyb3NzIGl0c1xuICogb3duIGJveDsgdGhlIG1pbmUgbW91dGggdmVudHMgYXQgaXRzIGZvb3QsIG5vdCBpdHMgaGVhZGZyYW1lIHRvcC5cbiAqL1xudHlwZSBTdGVhbUFuY2hvciA9IHtcbiAgbW91bnQ6IHN0cmluZztcbiAgLyoqIDAuLjEgYWNyb3NzIHRoZSBib2R5J3Mgb3duIGJvdW5kaW5nIGJveC4gKi9cbiAgYWNyb3NzWDogbnVtYmVyO1xuICBhY3Jvc3NaOiBudW1iZXI7XG4gIHVwWTogbnVtYmVyO1xuICByaXNlOiBudW1iZXI7XG4gIHNwcmVhZDogbnVtYmVyO1xuICBzaXplOiBudW1iZXI7XG4gIGxpZmU6IG51bWJlcjtcbiAgcHVmZnM6IG51bWJlcjtcbiAgb3BhY2l0eTogbnVtYmVyO1xufTtcbmNvbnN0IFNURUFNX0FOQ0hPUlM6IFJlY29yZDxzdHJpbmcsIHJlYWRvbmx5IFN0ZWFtQW5jaG9yW10+ID0ge1xuICAnZTItaGlsbC1taW5lJzogWyB7IG1vdW50OiAnYm9pbGVyLWhvdXNlLXNpdGUnLCBhY3Jvc3NYOiAwLjI1NSwgYWNyb3NzWjogMC4zMzIsIHVwWTogMS4wLCByaXNlOiA4LjAsIHNwcmVhZDogMy4wLCBzaXplOiA0NiwgbGlmZTogNS40LCBwdWZmczogMzQsIG9wYWNpdHk6IDAuNSB9LCB7IG1vdW50OiAnbWluZS1tb3V0aC1hbmQtcnVpbmVkLWhlYWRmcmFtZScsIGFjcm9zc1g6IDAuNSwgYWNyb3NzWjogMC42MiwgdXBZOiAwLjEsIHJpc2U6IDMuMiwgc3ByZWFkOiAxLjcsIHNpemU6IDMwLCBsaWZlOiA4LjIsIHB1ZmZzOiAxNCwgb3BhY2l0eTogMC4zIH0sIF0sXG59O1xudHlwZSBDcm9zc2luZ0JyZWF0aERyZXNzaW5nID0ge1xuICB3aXNwczogeyBjb3VudDogbnVtYmVyOyBoYWxmWDogbnVtYmVyOyBoYWxmWjogbnVtYmVyOyBsaWZ0OiBudW1iZXI7IHNpemU6IG51bWJlcjsgcmlzZTogbnVtYmVyOyBjb2xvcjogc3RyaW5nIH07XG4gIHBsdW1lOiB7IGNvdW50OiBudW1iZXI7IHJhZGl1czogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcjsgc2l6ZTogbnVtYmVyOyByaXNlOiBudW1iZXI7IGNvbG9yOiBzdHJpbmcgfTtcbn07XG5jb25zdCBDUk9TU0lOR19CUkVBVEhfQ09OVFJBQ1RTOiBSZWNvcmQ8c3RyaW5nLCBDcm9zc2luZ0JyZWF0aERyZXNzaW5nPiA9IHtcbiAgJ2UyLXRyZXN0bGUnOiB7IHdpc3BzOiB7IGNvdW50OiA3LCBoYWxmWDogMTcsIGhhbGZaOiA0LCBsaWZ0OiAzLjEsIHNpemU6IDQ2LCByaXNlOiAwLjM0LCBjb2xvcjogJyM1NzUwNDknIH0sIHBsdW1lOiB7IGNvdW50OiAxMiwgcmFkaXVzOiAwLjcsIGhlaWdodDogMy40LCBzaXplOiAyNiwgcmlzZTogMS4xNSwgY29sb3I6ICcjZWZlOWRlJyB9IH0sXG59O1xuY29uc3QgQ1JPU1NJTkdfQlJFQVRIX1BPTExfRlJBTUVTID0gMzA7XG50eXBlIENyb3NzaW5nQnJlYXRoID0geyBkaXNwb3NlOiAoKSA9PiB2b2lkIH07XG4vKiogV2FybSB3aGl0ZSwgdGhlIHNoaXBwZWQgYEJvaWxlckhvdXNlLnRzYCBwbHVtZSBjb2xvdXIuIFN0ZWFtIGlzIFdISVRFIChidW5kbGUgwqdBMSkuICovXG5jb25zdCBTVEVBTV9DT0xPVVIgPSAnI2ZmZjhlOCc7XG4vKiogRW1iZXJzIG9uIHRoZSBjbGFpbSBzdGFrZSB3aGlsZSB0aGUgUnVzaCBpcyBsaXZlLiAqL1xuY29uc3QgUlVTSF9FTUJFUl9DT1VOVCA9IDI2O1xuLyoqIEVsbGlwc2UgcmFkaXVzIGFzIGEgZnJhY3Rpb24gb2YgdGhlIG1vZGVsJ3MgZm9vdHByaW50IOKAlCBhIHBvb2wsIG5vdCBhIHNsYWIuICovXG5jb25zdCBMQU5ETUFSS19DT05UQUNUX1NQUkVBRCA9IDAuNDY7XG4vKiogSG93IGZhciB0aGUgcG9vbCBsZWFucyBhd2F5IGZyb20gdGhlIGJvZHksIGFzIGEgZnJhY3Rpb24gb2YgdGhlIGJvZHkncyBoZWlnaHQuICovXG5jb25zdCBMQU5ETUFSS19DT05UQUNUX1RIUk9XID0gMC4zMDtcbmNvbnN0IFNDVUxQVF9XQVRFUl9NQVhfREVMVEEgPSAwLjE7XG5cbmZ1bmN0aW9uIHB1Ymxpc2goY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgc3RhdGU6ICdsb2FkaW5nJyB8ICdyZWFkeScgfCAnbGl0ZScgfCAnZmFpbGVkJywgc291cmNlOiAncGFpbnRlZCcgfCAnZ2xiJywgbWV0cmljcz86IE1ldHJpY3MsIHBhbm9yYW1hPzogVEhSRUUuT2JqZWN0M0QsIHBhbm9yYW1hTWV0cmljcz86IE1ldHJpY3MsIGRlbW90aW9uUmVhc29uPzogc3RyaW5nKTogdm9pZCB7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RhdGUgPSBzdGF0ZTtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RSZW5kZXJTb3VyY2UgPSBzb3VyY2U7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGVpZ2h0U291cmNlID0gc291cmNlID09PSAnZ2xiJyA/ICdiYWtlZC1ncmlkJyA6ICdwYWludGVkJztcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RNZXNoZXMgPSBTdHJpbmcobWV0cmljcz8ubWVzaGVzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFRyaWFuZ2xlcyA9IFN0cmluZyhtZXRyaWNzPy50cmlhbmdsZXMgPz8gMCk7XG4gIGNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TWF0ZXJpYWxzID0gU3RyaW5nKG1ldHJpY3M/Lm1hdGVyaWFscyA/PyAwKTtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RWZXJ0aWNlcyA9IFN0cmluZyhtZXRyaWNzPy52ZXJ0aWNlcyA/PyAwKTtcbiAgY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RQYW5vcmFtYSA9IHBhbm9yYW1hPy5uYW1lID8/ICdvZmYnO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hTWVzaGVzID0gU3RyaW5nKHBhbm9yYW1hTWV0cmljcz8ubWVzaGVzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hVHJpYW5nbGVzID0gU3RyaW5nKHBhbm9yYW1hTWV0cmljcz8udHJpYW5nbGVzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hTWF0ZXJpYWxzID0gU3RyaW5nKHBhbm9yYW1hTWV0cmljcz8ubWF0ZXJpYWxzID8/IDApO1xuICBjYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hVmVydGljZXMgPSBTdHJpbmcocGFub3JhbWFNZXRyaWNzPy52ZXJ0aWNlcyA/PyAwKTtcbiAgaWYgKGRlbW90aW9uUmVhc29uKSByZXBvcnRSZW5kZXJEZW1vdGlvbihjYW52YXMsIGRlbW90aW9uUmVhc29uKTtcbn1cblxuZnVuY3Rpb24gaW5zcGVjdChtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHJlY2VpdmVTaGFkb3c6IGJvb2xlYW4pOiBNZXRyaWNzIHtcbiAgbGV0IG1lc2hlcyA9IDA7XG4gIGxldCB0cmlhbmdsZXMgPSAwO1xuICBsZXQgdmVydGljZXMgPSAwO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g7XG4gICAgaWYgKCFtZXNoLmlzTWVzaCkgcmV0dXJuO1xuICAgIG1lc2hlcyArPSAxO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gbWVzaC5nZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgY29uc3QgdW5pcXVlVmVydGljZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgKHBvc2l0aW9uPy5jb3VudCA/PyAwKTsgaW5kZXggKz0gMSkge1xuICAgICAgdW5pcXVlVmVydGljZXMuYWRkKGAke3Bvc2l0aW9uIS5nZXRYKGluZGV4KX0sJHtwb3NpdGlvbiEuZ2V0WShpbmRleCl9LCR7cG9zaXRpb24hLmdldFooaW5kZXgpfWApO1xuICAgIH1cbiAgICB2ZXJ0aWNlcyArPSB1bmlxdWVWZXJ0aWNlcy5zaXplO1xuICAgIHRyaWFuZ2xlcyArPSBNYXRoLmZsb29yKChtZXNoLmdlb21ldHJ5LmluZGV4Py5jb3VudCA/PyBwb3NpdGlvbj8uY291bnQgPz8gMCkgLyAzKTtcbiAgICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgPyBtZXNoLm1hdGVyaWFsIDogW21lc2gubWF0ZXJpYWxdKSBtYXRlcmlhbHMuYWRkKG1hdGVyaWFsKTtcbiAgICBtZXNoLmNhc3RTaGFkb3cgPSBmYWxzZTtcbiAgICBtZXNoLnJlY2VpdmVTaGFkb3cgPSByZWNlaXZlU2hhZG93O1xuICB9KTtcbiAgcmV0dXJuIHsgbWVzaGVzLCB0cmlhbmdsZXMsIG1hdGVyaWFsczogbWF0ZXJpYWxzLnNpemUsIHZlcnRpY2VzLCBib3VuZHM6IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChtb2RlbCkgfTtcbn1cblxuZnVuY3Rpb24gdmFsaWRUZXJyYWluKG1ldHJpY3M6IE1ldHJpY3MsIGNvbnRyYWN0OiBDb250cmFjdCk6IGJvb2xlYW4ge1xuICBjb25zdCB7IG1pbiwgbWF4IH0gPSBtZXRyaWNzLmJvdW5kcztcbiAgY29uc3QgW21pblgsIG1pblosIG1pblldID0gY29udHJhY3QuYm91bmRzTWV0ZXJzLm1pbjtcbiAgY29uc3QgW21heFgsIG1heFosIG1heFldID0gY29udHJhY3QuYm91bmRzTWV0ZXJzLm1heDtcbiAgcmV0dXJuIG1ldHJpY3MubWVzaGVzID09PSBjb250cmFjdC5tZXNoQ291bnQgJiYgbWV0cmljcy50cmlhbmdsZXMgPT09IGNvbnRyYWN0LnRyaWFuZ2xlcyAmJiBtZXRyaWNzLm1hdGVyaWFscyA9PT0gY29udHJhY3QubWF0ZXJpYWxDb3VudCAmJlxuICAgIG1ldHJpY3MudmVydGljZXMgPT09IGNvbnRyYWN0LnZlcnRpY2VzICYmIE1hdGguYWJzKG1pbi54IC0gbWluWCkgPD0gQk9VTkRTX0VQU0lMT04gJiYgTWF0aC5hYnMobWluLnkgLSBtaW5ZKSA8PSBCT1VORFNfRVBTSUxPTiAmJlxuICAgIE1hdGguYWJzKG1pbi56IC0gbWluWikgPD0gQk9VTkRTX0VQU0lMT04gJiYgTWF0aC5hYnMobWF4LnggLSBtYXhYKSA8PSBCT1VORFNfRVBTSUxPTiAmJlxuICAgIE1hdGguYWJzKG1heC55IC0gbWF4WSkgPD0gQk9VTkRTX0VQU0lMT04gJiYgTWF0aC5hYnMobWF4LnogLSBtYXhaKSA8PSBCT1VORFNfRVBTSUxPTjtcbn1cblxuZnVuY3Rpb24gdmFsaWRQYW5vcmFtYShtZXRyaWNzOiBNZXRyaWNzLCBjb250cmFjdDogUGFub3JhbWFDb250cmFjdCwgbW91bnQ6IE1vdW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBjb250cmFjdC5yZW5kZXJPbmx5ICYmIG1vdW50LnJlbmRlck9ubHkgJiYgbWV0cmljcy5tZXNoZXMgPT09IGNvbnRyYWN0Lm1lc2hDb3VudCAmJiBtZXRyaWNzLnRyaWFuZ2xlcyA9PT0gY29udHJhY3QudHJpYW5nbGVzICYmXG4gICAgbWV0cmljcy5tYXRlcmlhbHMgPT09IGNvbnRyYWN0Lm1hdGVyaWFsQ291bnQgJiYgbWV0cmljcy52ZXJ0aWNlcyA9PT0gY29udHJhY3QudmVydGljZXM7XG59XG5cbi8qKlxuICogVGhlIGhlaWdodCB0aGUgcGxheWVyJ3MgZmVldCBzdGFuZCBvbiBoYXMgdG8gYmUgdGhlIGhlaWdodCB0aGUgcGxheWVyIFNFRVMuIFRoZSBtZXNoXG4gKiBkcmF3cyB0d28gdHJpYW5nbGVzIHBlciBncmlkIGNlbGwgYWNyb3NzIG9uZSBkaWFnb25hbDsgYSBiaWxpbmVhciBsZXJwIG92ZXIgdGhlIGNlbGwnc1xuICogZm91ciBjb3JuZXJzIGlzIGEgZGlmZmVyZW50LCBjdXJ2ZWQgc3VyZmFjZSwgYW5kIHRoZSB0d28gZGlzYWdyZWUgYnkgdXAgdG8gMC42NjY3IHVuaXRzXG4gKiBvbiB0aGUgTWFyZSdzIGFicnVwdCByZWxpZWYgKEYtQVNUUkEtMTAsIGl0cyBvd24gY2VudHJvaWQgc3dlZXAgb2YgdGhlIGZvdXIgdGVycmFpbnM6XG4gKiBDbGFpbSAwLjAyNTMgLyBUd2luIEJhbmtzIDAuMDIzMCAvIEhpbGwgTWluZSAwLjEwMzMgLyBNYXJlIDAuNjY2NykuIFRoYXQgZ2FwIGlzIGV4YWN0bHlcbiAqIHdoZXJlIGZlZXQgZmxvYXQgb3Igc2luay5cbiAqXG4gKiBTbyB0aGUgZGlhZ29uYWwgaXMgQkFLRUQgT1VUIE9GIFRIRSBJTkRFWCBCVUZGRVIsIHBlciBjZWxsLCBuZXZlciBhc3N1bWVkOiB3aGljaGV2ZXIgd2F5XG4gKiB0aGUgZXhwb3J0ZXIgc3BsaXQgYSBjZWxsLCB0aGUgc2FtcGxlIGxhbmRzIG9uIHRoZSBwbGFuZSBvZiB0aGUgdHJpYW5nbGUgdGhlIHBvaW50IGZhbGxzXG4gKiBpbiwgYW5kIHRoZSBzYW1wbGVkIGhlaWdodCBlcXVhbHMgdGhlIGRyYXduIHN1cmZhY2UgZXZlcnl3aGVyZS4gU3RpbGwgTygxKSBwZXIgc2FtcGxlIGFuZFxuICogb25lIGV4dHJhIGJ5dGUgcGVyIGNlbGwuXG4gKlxuICogUmVuZGVyLXNpZGUgb25seSAoQ0xBVURFLm1kIMKnNC42KTogdGhlIHNpbXVsYXRpb24gc3RheXMgcGxhbmFyIGFuZCBuZXZlciByZWFkcyB0aGlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmFrZUhlaWdodEdyaWQobW9kZWw6IFRIUkVFLk9iamVjdDNELCBtZXRyaWNzOiBNZXRyaWNzKTogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIge1xuICBjb25zdCBtZXNoID0gbW9kZWwuZ2V0T2JqZWN0QnlQcm9wZXJ0eSgnaXNNZXNoJywgdHJ1ZSkgYXMgVEhSRUUuTWVzaDtcbiAgY29uc3QgcG9zaXRpb24gPSBtZXNoLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKTtcbiAgY29uc3Qgc2VnbWVudHMgPSBNYXRoLnJvdW5kKE1hdGguc3FydChwb3NpdGlvbi5jb3VudCkpIC0gMTtcbiAgY29uc3Qgd2lkdGggPSBzZWdtZW50cyArIDE7XG4gIGNvbnN0IHN0ZXBYID0gKG1ldHJpY3MuYm91bmRzLm1heC54IC0gbWV0cmljcy5ib3VuZHMubWluLngpIC8gc2VnbWVudHM7XG4gIGNvbnN0IHN0ZXBaID0gKG1ldHJpY3MuYm91bmRzLm1heC56IC0gbWV0cmljcy5ib3VuZHMubWluLnopIC8gc2VnbWVudHM7XG4gIGNvbnN0IGhlaWdodHMgPSBuZXcgRmxvYXQzMkFycmF5KHdpZHRoICogd2lkdGgpO1xuICBjb25zdCBzZWVuID0gbmV3IFVpbnQ4QXJyYXkoaGVpZ2h0cy5sZW5ndGgpO1xuICBjb25zdCBjb2x1bW5zID0gbmV3IEludDMyQXJyYXkocG9zaXRpb24uY291bnQpO1xuICBjb25zdCByb3dzID0gbmV3IEludDMyQXJyYXkocG9zaXRpb24uY291bnQpO1xuICBjb25zdCBwb2ludCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIG1vZGVsLnVwZGF0ZU1hdHJpeFdvcmxkKHRydWUpO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcG9zaXRpb24uY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICBwb2ludC5mcm9tQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9uIGFzIFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZSwgaW5kZXgpO1xuICAgIG1lc2gubG9jYWxUb1dvcmxkKHBvaW50KTtcbiAgICBjb25zdCBjb2x1bW4gPSBNYXRoLnJvdW5kKChwb2ludC54IC0gbWV0cmljcy5ib3VuZHMubWluLngpIC8gc3RlcFgpO1xuICAgIGNvbnN0IHJvdyA9IE1hdGgucm91bmQoKHBvaW50LnogLSBtZXRyaWNzLmJvdW5kcy5taW4ueikgLyBzdGVwWik7XG4gICAgY29uc3QgY2VsbCA9IHJvdyAqIHdpZHRoICsgY29sdW1uO1xuICAgIGlmIChjb2x1bW4gPCAwIHx8IGNvbHVtbiA+IHNlZ21lbnRzIHx8IHJvdyA8IDAgfHwgcm93ID4gc2VnbWVudHMgfHwgc2VlbltjZWxsXSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHRlcnJhaW4gZ3JpZCcpO1xuICAgIGhlaWdodHNbY2VsbF0gPSBwb2ludC55O1xuICAgIHNlZW5bY2VsbF0gPSAxO1xuICAgIGNvbHVtbnNbaW5kZXhdID0gY29sdW1uO1xuICAgIHJvd3NbaW5kZXhdID0gcm93O1xuICB9XG4gIGlmIChzZWVuLnNvbWUoKHZhbHVlKSA9PiB2YWx1ZSAhPT0gMSkpIHRocm93IG5ldyBFcnJvcignaW5jb21wbGV0ZSB0ZXJyYWluIGdyaWQnKTtcbiAgLy8gMCA9IHRoZSBjZWxsIGlzIHNwbGl0IChsb3csbG93KS4uKGhpZ2gsaGlnaCk7IDEgPSBzcGxpdCAoaGlnaCxsb3cpLi4obG93LGhpZ2gpLlxuICBjb25zdCBkaWFnb25hbHMgPSBuZXcgVWludDhBcnJheShNYXRoLm1heChzZWdtZW50cyAqIHNlZ21lbnRzLCAxKSk7XG4gIGNvbnN0IGRyYXduID0gbmV3IFVpbnQ4QXJyYXkoZGlhZ29uYWxzLmxlbmd0aCk7XG4gIGNvbnN0IGluZGljZXMgPSBtZXNoLmdlb21ldHJ5LmluZGV4O1xuICBjb25zdCB0cmlhbmdsZUNvdW50ID0gTWF0aC5mbG9vcigoaW5kaWNlcz8uY291bnQgPz8gcG9zaXRpb24uY291bnQpIC8gMyk7XG4gIGZvciAobGV0IHRyaWFuZ2xlID0gMDsgdHJpYW5nbGUgPCB0cmlhbmdsZUNvdW50OyB0cmlhbmdsZSArPSAxKSB7XG4gICAgY29uc3QgYSA9IGluZGljZXMgPyBpbmRpY2VzLmdldFgodHJpYW5nbGUgKiAzKSA6IHRyaWFuZ2xlICogMztcbiAgICBjb25zdCBiID0gaW5kaWNlcyA/IGluZGljZXMuZ2V0WCh0cmlhbmdsZSAqIDMgKyAxKSA6IHRyaWFuZ2xlICogMyArIDE7XG4gICAgY29uc3QgYyA9IGluZGljZXMgPyBpbmRpY2VzLmdldFgodHJpYW5nbGUgKiAzICsgMikgOiB0cmlhbmdsZSAqIDMgKyAyO1xuICAgIGNvbnN0IGNvbHVtbkEgPSBjb2x1bW5zW2FdISwgY29sdW1uQiA9IGNvbHVtbnNbYl0hLCBjb2x1bW5DID0gY29sdW1uc1tjXSE7XG4gICAgY29uc3Qgcm93QSA9IHJvd3NbYV0hLCByb3dCID0gcm93c1tiXSEsIHJvd0MgPSByb3dzW2NdITtcbiAgICBjb25zdCBjb2x1bW4gPSBNYXRoLm1pbihjb2x1bW5BLCBjb2x1bW5CLCBjb2x1bW5DKTtcbiAgICBjb25zdCByb3cgPSBNYXRoLm1pbihyb3dBLCByb3dCLCByb3dDKTtcbiAgICBpZiAoTWF0aC5tYXgoY29sdW1uQSwgY29sdW1uQiwgY29sdW1uQykgLSBjb2x1bW4gIT09IDEgfHwgTWF0aC5tYXgocm93QSwgcm93Qiwgcm93QykgLSByb3cgIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCB0ZXJyYWluIHRvcG9sb2d5Jyk7XG4gICAgfVxuICAgIC8vIENvcm5lciBiaXRzOiAxID0gKGxvdyxsb3cpLCAyID0gKGhpZ2gsbG93KSwgNCA9IChsb3csaGlnaCksIDggPSAoaGlnaCxoaWdoKS4gQSBoYWxmLWNlbGxcbiAgICAvLyB0cmlhbmdsZSBjb3ZlcnMgZXhhY3RseSB0aHJlZSBvZiB0aGVtLCBhbmQgdGhlIG1pc3Npbmcgb25lIG5hbWVzIHRoZSBkaWFnb25hbC5cbiAgICBjb25zdCBtYXNrID0gKDEgPDwgKChyb3dBIC0gcm93KSAqIDIgKyBjb2x1bW5BIC0gY29sdW1uKSlcbiAgICAgIHwgKDEgPDwgKChyb3dCIC0gcm93KSAqIDIgKyBjb2x1bW5CIC0gY29sdW1uKSlcbiAgICAgIHwgKDEgPDwgKChyb3dDIC0gcm93KSAqIDIgKyBjb2x1bW5DIC0gY29sdW1uKSk7XG4gICAgY29uc3QgZGlhZ29uYWwgPSBtYXNrID09PSAwYjEwMTEgfHwgbWFzayA9PT0gMGIxMTAxID8gMCA6IG1hc2sgPT09IDBiMTExMCB8fCBtYXNrID09PSAwYjAxMTEgPyAxIDogLTE7XG4gICAgY29uc3QgY2VsbCA9IHJvdyAqIHNlZ21lbnRzICsgY29sdW1uO1xuICAgIGlmIChkaWFnb25hbCA8IDAgfHwgKGRyYXduW2NlbGxdICYmIGRpYWdvbmFsc1tjZWxsXSAhPT0gZGlhZ29uYWwpKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgdGVycmFpbiB0b3BvbG9neScpO1xuICAgIGRpYWdvbmFsc1tjZWxsXSA9IGRpYWdvbmFsO1xuICAgIGRyYXduW2NlbGxdISArPSAxO1xuICB9XG4gIGlmIChzZWdtZW50cyA+IDAgJiYgZHJhd24uc29tZSgodmFsdWUpID0+IHZhbHVlICE9PSAyKSkgdGhyb3cgbmV3IEVycm9yKCdpbmNvbXBsZXRlIHRlcnJhaW4gdG9wb2xvZ3knKTtcbiAgY29uc3QgbGFzdENlbGwgPSBNYXRoLm1heChzZWdtZW50cyAtIDEsIDApO1xuICByZXR1cm4gKHgsIHopID0+IHtcbiAgICBjb25zdCBneCA9IFRIUkVFLk1hdGhVdGlscy5jbGFtcCgoeCAtIG1ldHJpY3MuYm91bmRzLm1pbi54KSAvIHN0ZXBYLCAwLCBzZWdtZW50cyk7XG4gICAgY29uc3QgZ3ogPSBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoKHogLSBtZXRyaWNzLmJvdW5kcy5taW4ueikgLyBzdGVwWiwgMCwgc2VnbWVudHMpO1xuICAgIGNvbnN0IHgwID0gTWF0aC5taW4oTWF0aC5mbG9vcihneCksIGxhc3RDZWxsKTtcbiAgICBjb25zdCB6MCA9IE1hdGgubWluKE1hdGguZmxvb3IoZ3opLCBsYXN0Q2VsbCk7XG4gICAgY29uc3QgeDEgPSBNYXRoLm1pbih4MCArIDEsIHNlZ21lbnRzKTtcbiAgICBjb25zdCB6MSA9IE1hdGgubWluKHowICsgMSwgc2VnbWVudHMpO1xuICAgIGNvbnN0IGZ4ID0gZ3ggLSB4MDtcbiAgICBjb25zdCBmeiA9IGd6IC0gejA7XG4gICAgY29uc3QgbG93ID0gaGVpZ2h0c1t6MCAqIHdpZHRoICsgeDBdITtcbiAgICBjb25zdCBlYXN0ID0gaGVpZ2h0c1t6MCAqIHdpZHRoICsgeDFdITtcbiAgICBjb25zdCBzb3V0aCA9IGhlaWdodHNbejEgKiB3aWR0aCArIHgwXSE7XG4gICAgY29uc3QgaGlnaCA9IGhlaWdodHNbejEgKiB3aWR0aCArIHgxXSE7XG4gICAgLy8gRWFjaCBicmFuY2ggaXMgdGhlIHBsYW5lIHRocm91Z2ggb25lIGRyYXduIHRyaWFuZ2xlJ3MgdGhyZWUgY29ybmVycywgc28gdGhlIHNhbXBsZSBzaXRzXG4gICAgLy8gb24gdGhlIHJlbmRlcmVkIHN1cmZhY2UgcmF0aGVyIHRoYW4gbmVhciBpdC5cbiAgICBpZiAoZGlhZ29uYWxzW3owICogc2VnbWVudHMgKyB4MF0gPT09IDApIHtcbiAgICAgIHJldHVybiBmeiA8PSBmeCA/IGxvdyArIChlYXN0IC0gbG93KSAqIGZ4ICsgKGhpZ2ggLSBlYXN0KSAqIGZ6IDogbG93ICsgKGhpZ2ggLSBzb3V0aCkgKiBmeCArIChzb3V0aCAtIGxvdykgKiBmejtcbiAgICB9XG4gICAgcmV0dXJuIGZ4ICsgZnogPD0gMSA/IGxvdyArIChlYXN0IC0gbG93KSAqIGZ4ICsgKHNvdXRoIC0gbG93KSAqIGZ6IDogaGlnaCArIChoaWdoIC0gc291dGgpICogKGZ4IC0gMSkgKyAoaGlnaCAtIGVhc3QpICogKGZ6IC0gMSk7XG4gIH07XG59XG5cbi8qKiBUaGUgc3VibWVyZ2VkIHBhbm9yYW1hIGFwcm9uIHVzZXMgdGhlIGJlZCdzIHdvcmxkLXNjYWxlIGF0bGFzIGFuZCBsaWdodGluZy4gKi9cbmZ1bmN0aW9uIHJvdXRlU2VhQXByb24odGVycmFpbjogVEhSRUUuT2JqZWN0M0QsIHBhbm9yYW1hOiBUSFJFRS5PYmplY3QzRCwgYm91bmRzOiBUSFJFRS5Cb3gzKTogbnVtYmVyIHtcbiAgbGV0IHNvdXJjZTogVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwgfCB1bmRlZmluZWQ7XG4gIHRlcnJhaW4udHJhdmVyc2Uob2JqZWN0ID0+IHtcbiAgICBjb25zdCBtZXNoID0gb2JqZWN0IGFzIFRIUkVFLk1lc2g7XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIChtZXNoLm1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKS5tYXApIHtcbiAgICAgIHNvdXJjZSA9IG1lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw7XG4gICAgfVxuICB9KTtcbiAgaWYgKCFzb3VyY2U/Lm1hcCkgcmV0dXJuIDA7XG4gIGxldCB0cmlhbmdsZXMgPSAwO1xuICBwYW5vcmFtYS50cmF2ZXJzZShvYmplY3QgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkpIHJldHVybjtcbiAgICBjb25zdCBnZW9tZXRyeSA9IG1lc2guZ2VvbWV0cnk7XG4gICAgY29uc3QgcG9zaXRpb24gPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyksIHV2ID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCd1dicpO1xuICAgIGlmICghZ2VvbWV0cnkuaW5kZXggfHwgIXBvc2l0aW9uIHx8ICF1dikgcmV0dXJuO1xuICAgIGNvbnN0IGJlZDogbnVtYmVyW10gPSBbXSwgc2t5OiBudW1iZXJbXSA9IFtdLCBmb3JlZ3JvdW5kOiBudW1iZXJbXSA9IFtdLCBiZWRWZXJ0aWNlcyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2VvbWV0cnkuaW5kZXguY291bnQ7IGkgKz0gMykge1xuICAgICAgY29uc3QgZmFjZSA9IFtnZW9tZXRyeS5pbmRleC5nZXRYKGkpLCBnZW9tZXRyeS5pbmRleC5nZXRYKGkrMSksIGdlb21ldHJ5LmluZGV4LmdldFgoaSsyKV07XG4gICAgICAvLyBUaGUgZmFjdG9yeSdzIHNlYSBza2lydCBvY2N1cGllcyBVViByb3dzIC44NOKAky45NzIgYWZ0ZXIgdGhlIGdsVEYgViBmbGlwLCB3aG9sbHkgYmVsb3cgc2VhIGxldmVsLlxuICAgICAgLy8gU2t5L3JpZGdlIGZhY2VzIHJldGFpbiB0aGUgYXV0aG9yZWQgcGFub3JhbWEgbWF0ZXJpYWwgYW5kIFVWcy5cbiAgICAgIGNvbnN0IGlzQmVkID0gZmFjZS5ldmVyeSh2ID0+IHBvc2l0aW9uLmdldFkodikgPCAwICYmIHV2LmdldFkodikgPj0gLjgzOTk5ICYmIHV2LmdldFkodikgPD0gLjk3MjAxKTtcbiAgICAgIC8vIFRoZSBmYWN0b3J5IGFwcGVuZHMgd3JlY2sgc2lsaG91ZXR0ZXMgYWZ0ZXIgdGhlIGNvbnRpZ3VvdXMgYXByb24gZmFjZXMuXG4gICAgICAvLyBLZWVwIHRoZW0gaW4gYSBsYXRlciBkcmF3OiBvcGFxdWUgbWF0ZXJpYWwgc29ydGluZyB3b3VsZCBvdGhlcndpc2UgZHJhd1xuICAgICAgLy8gdGhlIG5ldyBiZWQgbWF0ZXJpYWwgb3ZlciBtYXN0cyBhdCB0aGUgcGFub3JhbWEncyBzaGFyZWQgZmFyLXBsYW5lIGRlcHRoLlxuICAgICAgKGlzQmVkID8gYmVkIDogYmVkLmxlbmd0aCA/IGZvcmVncm91bmQgOiBza3kpLnB1c2goLi4uZmFjZSk7XG4gICAgICBpZiAoaXNCZWQpIGZhY2UuZm9yRWFjaCh2ID0+IGJlZFZlcnRpY2VzLmFkZCh2KSk7XG4gICAgfVxuICAgIGlmICghYmVkLmxlbmd0aCkgcmV0dXJuO1xuICAgIGNvbnN0IHJvdXRlZCA9IGdlb21ldHJ5LmNsb25lKCk7XG4gICAgY29uc3Qgcm91dGVkVXYgPSByb3V0ZWQuZ2V0QXR0cmlidXRlKCd1dicpO1xuICAgIGZvciAoY29uc3QgdiBvZiBiZWRWZXJ0aWNlcykgcm91dGVkVXYuc2V0WFkodixcbiAgICAgIChwb3NpdGlvbi5nZXRYKHYpLWJvdW5kcy5taW4ueCkvKGJvdW5kcy5tYXgueC1ib3VuZHMubWluLngpLFxuICAgICAgKGJvdW5kcy5tYXguei1wb3NpdGlvbi5nZXRaKHYpKS8oYm91bmRzLm1heC56LWJvdW5kcy5taW4ueikpO1xuICAgIHJvdXRlZFV2Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICByb3V0ZWQuc2V0SW5kZXgoWy4uLnNreSwuLi5iZWRdKTtcbiAgICByb3V0ZWQuY2xlYXJHcm91cHMoKTsgcm91dGVkLmFkZEdyb3VwKDAsc2t5Lmxlbmd0aCwwKTsgcm91dGVkLmFkZEdyb3VwKHNreS5sZW5ndGgsYmVkLmxlbmd0aCwxKTtcbiAgICBjb25zdCBtYXRlcmlhbCA9IHNvdXJjZSEuY2xvbmUoKTtcbiAgICBtYXRlcmlhbC5tYXAgPSBzb3VyY2UhLm1hcCEuY2xvbmUoKTtcbiAgICBtYXRlcmlhbC5tYXAud3JhcFMgPSBtYXRlcmlhbC5tYXAud3JhcFQgPSBUSFJFRS5NaXJyb3JlZFJlcGVhdFdyYXBwaW5nO1xuICAgIG1hdGVyaWFsLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgbWF0ZXJpYWwuZGVwdGhXcml0ZSA9IGZhbHNlO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IHNoYWRlciA9PiB7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlci5yZXBsYWNlKCcjaW5jbHVkZSA8cHJvamVjdF92ZXJ0ZXg+JyxcbiAgICAgICAgJyNpbmNsdWRlIDxwcm9qZWN0X3ZlcnRleD5cXG5nbF9Qb3NpdGlvbi56ID0gZ2xfUG9zaXRpb24udyAqIDAuOTk5OTk5OycpO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ3NlYS1iZWQtYXByb24tdjEnO1xuICAgIG1lc2gubWF0ZXJpYWwgPSBbbWVzaC5tYXRlcmlhbCxtYXRlcmlhbF07XG4gICAgbWVzaC5nZW9tZXRyeSA9IHJvdXRlZDtcbiAgICBpZiAoZm9yZWdyb3VuZC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGZvcmVncm91bmRHZW9tZXRyeSA9IGdlb21ldHJ5LmNsb25lKCk7XG4gICAgICBmb3JlZ3JvdW5kR2VvbWV0cnkuc2V0SW5kZXgoZm9yZWdyb3VuZCk7XG4gICAgICBmb3JlZ3JvdW5kR2VvbWV0cnkuY2xlYXJHcm91cHMoKTtcbiAgICAgIGNvbnN0IHNpbGhvdWV0dGVzID0gbmV3IFRIUkVFLk1lc2goZm9yZWdyb3VuZEdlb21ldHJ5LCBtZXNoLm1hdGVyaWFsWzBdKTtcbiAgICAgIHNpbGhvdWV0dGVzLm5hbWUgPSAnU2VhUGFub3JhbWFTaWxob3VldHRlcyc7XG4gICAgICBzaWxob3VldHRlcy51c2VyRGF0YS5zZWFQYW5vcmFtYUZvcmVncm91bmQgPSB0cnVlO1xuICAgICAgc2lsaG91ZXR0ZXMuZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICAgICAgc2lsaG91ZXR0ZXMucmVuZGVyT3JkZXIgPSBtZXNoLnJlbmRlck9yZGVyICsgMC4wMTtcbiAgICAgIG1lc2guYWRkKHNpbGhvdWV0dGVzKTtcbiAgICB9XG4gICAgZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgIHRyaWFuZ2xlcyArPSBiZWQubGVuZ3RoLzM7XG4gIH0pO1xuICByZXR1cm4gdHJpYW5nbGVzO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlUGFub3JhbWEobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWF0ZXJpYWw+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoKSByZXR1cm47XG4gICAgbWVzaC5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gICAgbWVzaC5yZW5kZXJPcmRlciA9IC0xMDA7XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkgbWF0ZXJpYWxzLmFkZChtYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGZvZ01hdGVyaWFsID0gbWF0ZXJpYWwgYXMgVEhSRUUuTWF0ZXJpYWwgJiB7IGZvZz86IGJvb2xlYW4gfTtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIGZvZ01hdGVyaWFsLmZvZyA9IGZhbHNlO1xuICAgIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgbWF0ZXJpYWwuZGVwdGhXcml0ZSA9IGZhbHNlO1xuICAgIG1hdGVyaWFsLmRlcHRoVGVzdCA9IHRydWU7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlci5yZXBsYWNlKFxuICAgICAgICAnI2luY2x1ZGUgPHByb2plY3RfdmVydGV4PicsXG4gICAgICAgICcjaW5jbHVkZSA8cHJvamVjdF92ZXJ0ZXg+XFxuZ2xfUG9zaXRpb24ueiA9IGdsX1Bvc2l0aW9uLncgKiAwLjk5OTk5OTsnLFxuICAgICAgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIExhbmRtYXJrIHBhaW50IHdvdWxkIGdvIGRhcmsgd2l0aG91dCB0aGlzLCBzbyBpdCBzdGF5cyDigJQgYnV0IGF0IGludGVuc2l0eSAzIHRoZVxuICogY29sb3VyIG1hcCBpcyBpdHMgb3duIGxpZ2h0IHNvdXJjZSBhbmQgdGhlIGJvZGllcyBmbG9hdCBpbiBmbGF0IHdoaXRlIHdoaWxlIHRoZVxuICogbG93IHN1biBtb2RlbHMgZXZlcnl0aGluZyBhcm91bmQgdGhlbS4gVTMgb2YgdGhlIGJlYXV0eSBzaGlmdCBtYWtlcyB0aGUgaW50ZW5zaXR5XG4gKiBhIHBlci1jb250cmFjdCB0dW5hYmxlIGFuZCBkcm9wcyB0aGUgQ2xhaW0ncyB0byB3aGVyZSB0aGUgc3VuIGRvZXMgdGhlIG1vZGVsbGluZ1xuICogYW5kIHRoZSBlbWlzc2l2ZSBvbmx5IGtlZXBzIHRoZSBwYWludCBvZmYgdGhlIGZsb29yLlxuICovXG5jb25zdCBMQU5ETUFSS19FTUlTU0lWRV9ERUZBVUxUID0gMztcbi8qKlxuICogYGUzLWJsYWNrb3V0LXJpZGdlYCBpcyBncmFkZWQgQUJPVkUgdGhlIGxlZ2FjeSBkZWZhdWx0IOKAlCB0aGUgb25seSByb3cgdGhhdCBpcyDigJQgYmVjYXVzZSBpdCBpcyBhXG4gKiBuaWdodC1MT0NLRUQgbWFwIHdob3NlIGdyb3VuZCBnaXZlcyBpdHMgYm9kaWVzIG5vdGhpbmcsIGFuZCBGLU9NQi00IGxlZnQgaXQgYXQgdGhlIGNhbGlicmF0ZWRcbiAqIGRlZmF1bHQgYWZ0ZXIgdGhlIGF0bGFzIHJlYnVpbGQgY3VyZWQgbW9zdCBvZiBBc3RyYSdzIFwiZGFyayBtYWNoaW5lcnlcIi4gTWVhc3VyZWQgb24gdGhlIHJlZmVyZW5jZVxuICogcmlnIChgbGFuZG1hcmstYnJpZ2h0bmVzcy5zcGVjLnRzYCwgZGVza3RvcCwgZm9jdXMgYHJpZGdlLXN3aXRjaC1ob3VzZWAsIDIwMjYtMDktMTgpLCBsYW5kbWFya1xuICogbWVkaWFuIGx1bWluYW5jZSBhZ2FpbnN0IGl0cyBvd24gZXJhIHNpYmxpbmcg4oCUIGBlMy1mYWlyZ3JvdW5kYCwgdGhlIG90aGVyIEUzIG5pZ2h0IG1hcCwgd2hvc2VcbiAqIGF0bGFzIGFscmVhZHkgY2FycmllcyB0aGUgbGlmdGVkIFYyIHBhbGV0dGU6IGZhaXJncm91bmQgMC4xMDU3LCBibGFja291dCByaWRnZSAwLjA4ODIgYXQgdGhlXG4gKiBkZWZhdWx0ICgtMTYuNiAlKS4gVGhlIGBsbWVtaXNzaXZlYCBzd2VlcCBvbiB0aGlzIG1hcCByZWFkcyAwLjEyIC0+IDAuMDUyOSwgMC4yMCAtPiAwLjA2NDIsXG4gKiAwLjMwIC0+IDAuMDczMiwgMC40NSAtPiAwLjA4ODIsIDAuNjAgLT4gMC4xMDE4LCBzbyB0aGUgc2libGluZydzIGxldmVsIHdhbnRzIH4wLjYyIGFuZCB0aGUgaGFyZFxuICogY2FwIGlzIDAuNjogNCBncmFkZXMgdG8gZXhhY3RseSB0aGUgY2VpbGluZyBhbmQgbGFuZHMgdGhlIHBhaXIgd2l0aGluIDMuNyAlLiBUaGUgY2FwLCBub3QgdGhpc1xuICogbnVtYmVyLCBpcyB3aGF0IHN0b3BzIHRoZSBib2R5IGJlY29taW5nIGl0cyBvd24gbGlnaHQgc291cmNlLlxuICovXG4vLyBNZWFzdXJlZCBzaWduYWwtbWFwIGJvZHkgbGlmdHMgdXNlIHRoZSBzYW1lIDAuNiBjZWlsaW5nOyB1bmxpc3RlZCBzaWduYWwgbWFwcyBrZWVwIHRoZSBkZWZhdWx0LlxuY29uc3QgTEFORE1BUktfRU1JU1NJVkU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7ICd0aGUtY2xhaW0nOiAxLjQ1LCAnZTItaGlsbC1taW5lJzogMS40NSwgJ2UyLXRyZXN0bGUnOiAxLjUsICdlMi1wcmVzc3VyZS1nYXJkZW4nOiAxLjQ1LCAnZTItaW5jbGluZSc6IDEuNDUsICdlMy1ibGFja291dC1yaWRnZSc6IDQsICdlNy1yZWxheS12YWxsZXknOiA0LCAnZTctZWNoby1jYW55b24nOiA0IH07XG5cbi8qKlxuICogRi1BU1RSQS05LCBUSEUgQ0FMSUJSQVRJT04gKDIwMjYtMDktMDUsIG93bmVyOiBcIk9rLCB0aGVuIGxldHMgaGF2ZSBpdCBmaXggdGhlc2UgZmluZGluZ3MuXCIpLlxuICpcbiAqIEFzdHJhIG1lYXN1cmVkIHRoZSBkZWZlY3QgYXMgYSBSRUxBVElPTlNISVAsIG5vdCBhIG51bWJlcjogXCJNb3N0IGRheWxpZ2h0IGxhbmRtYXJrcyB0aGVyZWZvcmVcbiAqIGlsbHVtaW5hdGUgdGhlbXNlbHZlcyB3aGlsZSBzdXJyb3VuZGluZyB0ZXJyYWluIHJlc3BvbmRzIHRvIHRoZSBzdW4uXCIgVGhlIG51bWJlcnMgYWJvdmUgYXJlIHRoYXRcbiAqIHJlbGF0aW9uc2hpcCB3cml0dGVuIGRvd24g4oCUIHRoZSBhdGxhcyBpcyByb3V0ZWQgaW50byBFTUlTU0lPTiwgc28gYXQgMyBhIGJvZHkgZW1pdHMgcm91Z2hseSB0aHJlZVxuICogdGltZXMgaXRzIG93biBhbGJlZG8gb24gdG9wIG9mIHdoYXRldmVyIHRoZSBzdW4gZ2l2ZXMgaXQsIGFuZCB0aGUgbG93IHN1biBtb2RlbHMgbm90aGluZyBvbiBpdC5cbiAqXG4gKiBUaGUgcmVmZXJlbmNlIHJpZyAoYGUyZS9sYW5kbWFyay1icmlnaHRuZXNzLnNwZWMudHNgLCBcInJlZmVyZW5jZSByaWdcIikgbWVhc3VyZXMgdGhlIHRocmVlXG4gKiBmYW1pbGllcyB0aGF0IHNoYXJlIHRoaXMgcmlnIGluIG9uZSBmcmFtZSDigJQgdGVycmFpbiAobm8gZW1pc3NpdmUsIHRoZSByZWZlcmVuY2UpLCBsYW5kbWFyaywgYW5kXG4gKiB0aGUgdW5saXQgaGVybyBzcHJpdGUgKHRoZSBjZWlsaW5nKS4gTWVhc3VyZWQgb24gYGRjNzRlMzA3NWAsIGRlc2t0b3AsIGxhbmRtYXJrL3RlcnJhaW4gbWVkaWFuXG4gKiBsdW1pbmFuY2U6XG4gKlxuICogICBNYXJlIENsYWltIChlbWlzc2l2ZSAzKSAgICAgIDQuNzIgICA8LSB0aGUgZmluZGluZywgcXVhbnRpZmllZFxuICogICBUaGUgQ2xhaW0gIChlbWlzc2l2ZSAxLjQ1KSAgIDEuMDRcbiAqICAgSGlsbCBNaW5lICAoMS40NSAvIHJvb2YgMikgICAwLjcyXG4gKiAgIE5pZ2h0IFNoaWZ0IChORVZFUiBwYWludGVkKSAgMC45MCAgIDwtIHRoZSBjb250cm9sOiB3aGF0IGEgYm9keSByZWFkcyBhdCB3aGVuIG9ubHkgdGhlIHJpZyBsaWdodHMgaXRcbiAqXG4gKiBOaWdodCBTaGlmdCBpcyB0aGUgY29udHJvbCBiZWNhdXNlIGBsb2FkTW91bnRgIHNraXBzIGBrZWVwTGFuZG1hcmtQYWludFJlYWRhYmxlYCBvbiBpdCBlbnRpcmVseSxcbiAqIHNvIGl0cyBib2RpZXMgaGF2ZSBvbmx5IHRoZSBHTEIncyBvd24gZW1pc3NpdmUgYW5kIGFuc3dlciB0aGUgcmlnIGFsb25lIOKAlCBhbmQgdGhleSBzaXQgc2xpZ2h0bHlcbiAqIEJFTE9XIHRoZSBncm91bmQgdGhleSBzdGFuZCBvbiwgd2hpY2ggaXMgd2hhdCBhIGxpdCBib2R5IGRvZXMuIFRoYXQgaXMgdGhlIHNoYXBlIHRoaXMgY2FsaWJyYXRpb25cbiAqIGFpbXMgYXQ6IHRoZSB3aG9sZS1ib2R5IGVtaXNzaXZlIGJlY29tZXMgYSBzbWFsbCBJTksgTElGVCB0aGF0IGtlZXBzIHRoZSBpbGx1c3RyYXRlZCBwYWludCBvZmZcbiAqIHRoZSBmbG9vciwgbm90IHRoZSBib2R5J3MgbGlnaHQgc291cmNlLCB3aXRoIEFzdHJhJ3MgY2VpbGluZyBvZiAwLjYgYXMgYSBoYXJkIGNhcC5cbiAqXG4gKiBUSEUgTlVNQkVSIElTIE1FQVNVUkVELCBOT1QgQ0hPU0VOIOKAlCBBTkQgVEhFIFJFQURBQklMSVRZIEZMT09SLCBOT1QgVEhFIENFSUxJTkcsIFNFVCBJVC4gU3dlZXBpbmdcbiAqIG9uZSBmb3JjZWQgaW50ZW5zaXR5IGFjcm9zcyBldmVyeSBtb3VudCAodGhlIHJpZydzIGA/bG1lbWlzc2l2ZT1gIGRpYWwsIGRlc2t0b3AsIHNhbWUgcHJvYmVzKVxuICogc2VwYXJhdGVzIHRoZSB0d28gdGVybXM6IHRoZSBTVU4ncyBzaGFyZSBvZiB3aGF0IHRoZSBib2R5IHJlbmRlcnMgYXQgaXMgdGhlIGxpdCB2YWx1ZSBhdCBlbWlzc2l2ZVxuICogMCBvdmVyIHRoZSB2YWx1ZSBhdCB0aGUgYXJtLlxuICpcbiAqICAgYXJtICAgICAgICAgICAgMCAgICAgMC4yMCAgICAwLjMwICAgIDAuNDUgICAgMC42MCAgICBsZWdhY3koMylcbiAqICAgTWFyZSBDbGFpbSAgIDEwMCUgICAgIDYzJSAgICAgNTQlICAgICA0NiUgICAgIDQwJSAgICAgICAgMTglICAgPC0gYXV0aG9yZWQgMywgdGhlIHdvcnN0IGNhc2VcbiAqICAgVGhlIENsYWltICAgIDEwMCUgICAgIDY4JSAgICAgNTklICAgICA1MiUgICAgIDQ4JSAgICAgICAgMzclXG4gKlxuICogQnkgdGhhdCBtZWFzdXJlIGFsb25lIDAuMzAgd291bGQgd2luIOKAlCB0aGUgaGlnaGVzdCBsaWZ0IGF0IHdoaWNoIHRoZSBzdW4gaXMgc3RpbGwgdGhlIG1ham9yaXR5XG4gKiBjb250cmlidXRvciBldmVyeXdoZXJlLiBJVCBXQVMgVFJJRUQgQU5EIElUIEJST0tFIEEgUkVBREFCSUxJVFkgTEFXLiBgZTJlL21hcC1jZW5zdXMuc3BlYy50c2BcbiAqIHByb2JlcyB0aGUgZmlyc3QgbW91bnQgb2YgYWxsIDQzIGNvbnRyYWN0cyBhbmQgZmFpbHMgdW5kZXIgbWVkaWFuIGx1bWluYW5jZSAwLjA2OyBhIEZVTEwgNDctdGVzdFxuICogcnVuIGF0IDAuMzAgZHJvcHBlZCBGT1VSIGRhcmstYm9kaWVkIG1hcHMgdW5kZXIgaXQgKGUzLW1vdGgtc2Vhc29uIDAuMDQ0LCBlNi1nbG93LW1lc2EgMC4wNTEsXG4gKiBlNi1waWNuaWMgMC4wNTQsIGUyLXByZXNzdXJlLWdhcmRlbiAwLjA1Mykgd2hpbGUgdGhlIHNhbWUgcnVuIG9uIHRoZSBwcmUtY2hhbmdlIHRyZWUgd2FzIGNsZWFuLFxuICogc28gdGhlIHJlZ3Jlc3Npb24gd2FzIHRoaXMgY2FsaWJyYXRpb24ncyBhbmQgbm90IHRoZSBib2FyZCdzLiBUaGUgYm9kaWVzIHRoYXQgYnJlYWsgYXJlIHRoZSBvbmVzXG4gKiB3aG9zZSBhdGxhcyBpcyBhbHJlYWR5IGRhcmsg4oCUIG1vdGggc2Vhc29uJ3Mgd2F0Y2ggZ2F0ZSByZW5kZXJzIDAuMDQ0NSB3aXRoIE5PIGVtaXNzaXZlIGF0IGFsbCxcbiAqIGFnYWluc3QgYSAwLjkzIHNhbHQtZmxhdCBncm91bmQg4oCUIGFuZCBhIGxpZnQgcHJvcG9ydGlvbmFsIHRvIGEgZ2xvYmFsIGRlZmF1bHQgZ2l2ZXMgdGhlIGRhcmtlc3RcbiAqIHBhaW50IHRoZSBsZWFzdCBoZWxwLCBleGFjdGx5IHdoZXJlIGl0IGlzIG5lZWRlZCBtb3N0LlxuICpcbiAqIFNvIHRoZSBkZWZhdWx0IGlzIDAuNDU6IGEgNi43eCBjdXQgZnJvbSB0aGUgbGVnYWN5IDMsIHVuZGVyIEFzdHJhJ3MgY2VpbGluZyBvZiAwLjYsIG1vdmluZyB0aGVcbiAqIHdvcnN0IG1hcCBmcm9tIDE4JSBzdW4gdG8gNDYlLCBhbmQga2VlcGluZyBldmVyeSBkYXlsaWdodCBib2R5IHVuZGVyIHRoZSB1bmxpdCBoZXJvIHNwcml0ZSBpbiB0aGVcbiAqIHNhbWUgZnJhbWUg4oCUIGF0IGVtaXNzaXZlIDMgdGhlIGJ1aWxkaW5ncyBvdXQtc2hvbmUgaGVyLCB3aGljaCBpcyB0aGUgb3RoZXIgd2F5IG9mIHNheWluZyBhXG4gKiBwYWludGVkIGJ1aWxkaW5nIGhhZCBzdG9wcGVkIGJlaGF2aW5nIGxpa2UgYSBsaXQgb2JqZWN0LlxuICpcbiAqIEFORCBGT1IgRk9VUiBNQVBTIE5PIFZBTFVFIFVOREVSIFRIRSBDRUlMSU5HIFdPUktTIEFUIEFMTC4gVGhlIGZ1bGwgY2Vuc3VzIGF0IDAuNDUgcmVkcyB0aGUgc2FtZVxuICogZm91cjsgdGhlIHJpZydzIHN3ZWVwIHNheXMgd2h5IOKAlCBtb3RoIHNlYXNvbidzIHdhdGNoIGdhdGUgcmVhZHMgMC4wNDQ1IGF0IGVtaXNzaXZlIDAsIDAuMDUxMiBhdFxuICogMC4zMCwgMC4wNTU3IGF0IDAuNDUgYW5kIDAuMDU4OCBhdCAwLjYwLCBzbyB0aGUgd2hvbGUgbGVnYWwgcmFuZ2UgbW92ZXMgaXQgYnkgYSBodW5kcmVkdGggYW5kIHRoZVxuICogZmxvb3Igc3RheXMgb3V0IG9mIHJlYWNoLiBUaGVpciBwYWludCwgbm90IHRoZWlyIGxpZ2h0aW5nLCBpcyB0aGUgZGVmZWN0LCBhbmQgRi1BU1RSQS0xIHNheXMgdGhlXG4gKiBzYW1lIHRoaW5nIGFib3V0IHRoZXNlIGF0bGFzZXMgKFwibGFyZ2UgYXJlYXMgYmVjb21lIG5lYXJseSB1bmlmb3JtIGdyZXkgb3IgcnVzdCAuLi4gUmVzdG9yZVxuICogbWF0ZXJpYWwgYW5kIHZhbHVlIHNlcGFyYXRpb25cIikuIExpZ2h0aW5nIGNhbm5vdCBjdXJlIGEgZGFyayBhdGxhcyB3aXRob3V0IGJlY29taW5nIGl0cyBsaWdodFxuICogc291cmNlIGFnYWluLCB3aGljaCBJUyB0aGUgZmluZGluZy4gU28gdGhvc2UgY29udHJhY3RzIGFyZSBFWEVNUFQgYW5kIGtlZXAgdGhlaXIgYXV0aG9yZWQgbGlmdFxuICogdW50aWwgdGhlaXIgYXRsYXMgaXMgcmUtZ3JhZGVkOyB0aGUgY2FsaWJyYXRpb24gbGFuZHMgb24gdGhlIG90aGVyIDM5LlxuICpcbiAqIFRIRSBUQUJMRSBBQk9WRSBJUyBLRVBUIEFTIEEgUkVMQVRJVkUgR1JBREUuIFRocmVlIHNpZ25lZC1vZmYgc2hpZnRzIHR1bmVkIHRob3NlIG51bWJlcnMgYWdhaW5zdFxuICogZWFjaCBvdGhlciAodGhlIGJhcm9uJ3MgY29sZCBmb3J0IHVuZGVyIGl0cyB3YXJtIGJhbm5lcnMsIGhpbGwgbWluZSdzIHNob3V0aW5nIHJvb2YsIHRoZSB0cmVzdGxlXG4gKiBwYWlyKSBhbmQgRi1CSE0tMSBpcyB0aGUgc2NhciBmcm9tIHNpbGVudGx5IHJlc2V0dGluZyB0aGVtLiBTbyB0aGUgYXV0aG9yZWQgdmFsdWUgaXMgZGl2aWRlZCBieVxuICogdGhlIGxlZ2FjeSBkZWZhdWx0IHRvIHJlY292ZXIgdGhlIGdyYWRlIHRoZSBzaGlmdCBpbnRlbmRlZCwgYW5kIHRoZSBncmFkZSBpcyByZS1odW5nIG9uIHRoZVxuICogY2FsaWJyYXRlZCBkZWZhdWx0IOKAlCB0aGUgT1JERVIgYmV0d2VlbiBtb3VudHMgaXMgcHJlc2VydmVkIGV4YWN0bHksIG9ubHkgdGhlIHNjYWxlIG1vdmVzLiBUaGVcbiAqIFRJTlQgaGFsZiBvZiBlYWNoIG9mIHRob3NlIHNoaWZ0cyAoYG1hdGVyaWFsLmNvbG9yLm11bHRpcGx5KHRpbnQpYCwgdGhlIGJhcm9uJ3Mgd2V0IGlyb24sIGhpbGxcbiAqIG1pbmUncyBveGlkZSByb29mKSBpcyB1bnRvdWNoZWQgYnkgdGhpcyBjaGFuZ2UgYW5kIHN0aWxsIGRvZXMgaXRzIHdvcmsgb24gdGhlIGRpZmZ1c2UuXG4gKi9cbmNvbnN0IExBTkRNQVJLX0VNSVNTSVZFX1dIT0xFX0JPRFlfTUFYID0gMC42O1xuLyoqIFRoZSBjYWxpYnJhdGVkIHdob2xlLWJvZHkgaW5rIGxpZnQ6IHdoYXQgdGhlIGxlZ2FjeSBkZWZhdWx0IG9mIDMgYmVjb21lcy4gKi9cbmNvbnN0IExBTkRNQVJLX0VNSVNTSVZFX0NBTElCUkFURURfREVGQVVMVCA9IDAuNDU7XG4vKipcbiAqIFRoZSBwYWludCBtdXN0IG5vdCBnbyB0byBtdWQgb24gYSBib2R5IHdob3NlIHNoaWZ0IGdyYWRlZCBpdCBmYXIgZG93bi4gRG9jdW1lbnRlZCBhcyBhIGd1YXJkLCBub3RcbiAqIGFzIHR1bmluZzogdGhlIGxvd2VzdCBhdXRob3JlZCB2YWx1ZSBpbiB0aGUgdGFibGUgaXMgMS4yOCwgd2hpY2ggbGFuZHMgYXQgMC4xOTIsIHNvIGFzIG9mIHRoaXNcbiAqIGNvbW1pdCB0aGUgZmxvb3IgYmluZHMgb24gTk9USElORy4gSXQgZXhpc3RzIHNvIGEgZnV0dXJlIGdyYWRlIGJlbG93IH4wLjggY2Fubm90IHNpbGVudGx5IHJlYWNoXG4gKiB6ZXJvIGFuZCBsZWF2ZSBhIGJvZHkgd2l0aCBubyBsaWZ0IGF0IGFsbC5cbiAqL1xuY29uc3QgTEFORE1BUktfRU1JU1NJVkVfV0hPTEVfQk9EWV9NSU4gPSAwLjEyO1xuLyoqXG4gKiBFbWlzc2l2ZSB3aW5kb3dzIGFuZCB0ZWFsIHN5c3RlbXMga2VlcCB0aGVpciBnbG93OiB0aG9zZSBhcmUgVU5MSVQgcGFpbnQgb2JqZWN0c1xuICogKGBkcmVzc0xhbmRtYXJrYCdzIGBNZXNoQmFzaWNNYXRlcmlhbGAgbGFtcCBxdWFkcywgdGhlIG5pZ2h0IHBvb2xzJyBzaGFkZXIgdGVybSwgdGhlIHdhdGVyXG4gKiBlbWlzc2l2ZSksIG5vbmUgb2Ygd2hpY2ggcm91dGUgdGhyb3VnaCB0aGlzIGZ1bmN0aW9uIOKAlCB0aGUgY2FwIGJlbG93IG9ubHkgZXZlciB0b3VjaGVzIGEgYm9keVxuICogd2hvc2Ugb3duIGRpZmZ1c2UgYXRsYXMgd2FzIGJlaW5nIHVzZWQgYXMgaXRzIGxpZ2h0IHNvdXJjZS5cbiAqL1xuZnVuY3Rpb24gY2FsaWJyYXRlZExhbmRtYXJrSW50ZW5zaXR5KGF1dGhvcmVkOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBkaWFscyA9IGxpZ2h0aW5nRGlhbHMoKTtcbiAgaWYgKGRpYWxzLm1vZGUgPT09ICdsZWdhY3knKSByZXR1cm4gYXV0aG9yZWQ7XG4gIGlmIChkaWFscy5lbWlzc2l2ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gZGlhbHMuZW1pc3NpdmU7XG4gIGNvbnN0IGdyYWRlID0gYXV0aG9yZWQgLyBMQU5ETUFSS19FTUlTU0lWRV9ERUZBVUxUO1xuICBjb25zdCBsaWZ0ID0gTEFORE1BUktfRU1JU1NJVkVfQ0FMSUJSQVRFRF9ERUZBVUxUICogZ3JhZGU7XG4gIHJldHVybiArVEhSRUUuTWF0aFV0aWxzLmNsYW1wKGxpZnQsIExBTkRNQVJLX0VNSVNTSVZFX1dIT0xFX0JPRFlfTUlOLCBMQU5ETUFSS19FTUlTU0lWRV9XSE9MRV9CT0RZX01BWCkudG9GaXhlZCg0KTtcbn1cblxuLyoqXG4gKiBUSEUgUkVGRVJFTkNFLVJJRyBESUFMUyAoaGFybmVzcywgbm90IGdhbWVwbGF5KS4gRXZlcnkgZGlhbCBpcyBBQlNFTlQgYnkgZGVmYXVsdCwgc28gYSBwbGFpbiBib290XG4gKiB0YWtlcyB0aGUgY2FsaWJyYXRlZCBwYXRoIGFuZCBubyBicmFuY2ggYmVsb3cgcnVucy4gVGhleSBleGlzdCBiZWNhdXNlIGEgbG9vayBjaGFuZ2UgdGhlIG93bmVyXG4gKiBqdWRnZXMgaGFzIHRvIGJlIHJldmVyc2libGUgaW4gdGhlIGJyb3dzZXIgaGUgaXMgaG9sZGluZywgd2l0aG91dCBhIHJlYnVpbGQ6XG4gKlxuICogICA/bGlnaHRpbmc9bGVnYWN5ICAgZXZlcnkgbGFuZG1hcmsgYmFjayB0byBpdHMgYXV0aG9yZWQgc2VsZi1saXQgZW1pc3NpdmUgKHRoZSBwcmUtMjAyNi0wOS0wNVxuICogICAgICAgICAgICAgICAgICAgICAgcmVuZGVyKSBhbmQgYmFjayB0byBEb3VibGVTaWRlIOKAlCB0aGUgQS9CLCBhbmQgdGhlIHNoYXBlIG9mIHRoZSBSRVZFUlRcbiAqICAgP2xtZW1pc3NpdmU9PG4+ICAgIGZvcmNlIG9uZSB3aG9sZS1ib2R5IGVtaXNzaXZlIGludGVuc2l0eSBvbiBldmVyeSBtb3VudCAodGhlIHN3ZWVwKVxuICogICA/bG1jdWxsPW9mZiAgICAgICAga2VlcCBEb3VibGVTaWRlIG9uIHZlcmlmaWVkLWNsb3NlZCBib2RpZXMgKGlzb2xhdGVzIHRoZSBjdWxsaW5nIGZyb20gdGhlIHBhaW50KVxuICpcbiAqIFJlYWQgZnJvbSB0aGUgbGl2ZSBzZWFyY2ggc3RyaW5nIHJhdGhlciB0aGFuIGNhY2hlZCBhdCBtb2R1bGUgbG9hZCBzbyBhIGhhcm5lc3MgY2FuIG5hdmlnYXRlXG4gKiBiZXR3ZWVuIGFybXM7IHRoZSBwYXJzZSBpcyBvbmNlIHBlciBib2R5IGluc3RhbGwsIG5vdCBwZXIgZnJhbWUuXG4gKi9cbnR5cGUgTGlnaHRpbmdEaWFscyA9IHsgbW9kZTogJ2NhbGlicmF0ZWQnIHwgJ2xlZ2FjeSc7IGVtaXNzaXZlOiBudW1iZXIgfCB1bmRlZmluZWQ7IGN1bGw6IGJvb2xlYW4gfTtcblxuZnVuY3Rpb24gbGlnaHRpbmdEaWFscygpOiBMaWdodGluZ0RpYWxzIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4geyBtb2RlOiAnY2FsaWJyYXRlZCcsIGVtaXNzaXZlOiB1bmRlZmluZWQsIGN1bGw6IHRydWUgfTtcbiAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgY29uc3QgZW1pc3NpdmUgPSBOdW1iZXIocGFyYW1zLmdldCgnbG1lbWlzc2l2ZScpKTtcbiAgcmV0dXJuIHtcbiAgICBtb2RlOiBwYXJhbXMuZ2V0KCdsaWdodGluZycpID09PSAnbGVnYWN5JyA/ICdsZWdhY3knIDogJ2NhbGlicmF0ZWQnLFxuICAgIGVtaXNzaXZlOiBwYXJhbXMuaGFzKCdsbWVtaXNzaXZlJykgJiYgTnVtYmVyLmlzRmluaXRlKGVtaXNzaXZlKSAmJiBlbWlzc2l2ZSA+PSAwID8gZW1pc3NpdmUgOiB1bmRlZmluZWQsXG4gICAgY3VsbDogcGFyYW1zLmdldCgnbG1jdWxsJykgIT09ICdvZmYnICYmIHBhcmFtcy5nZXQoJ2xpZ2h0aW5nJykgIT09ICdsZWdhY3knLFxuICB9O1xufVxuXG4vKipcbiAqIEYtQVNUUkEtOSwgVEhFIENVTExJTkcuIEFzdHJhOiBcIkFsbCA0NDMgbWF0ZXJpYWwgcmVjb3JkcyBzY2FubmVkIGluIHBpbG90IEdMQnMgd2VyZSBkb3VibGUtc2lkZWQuXG4gKiBUaGF0IGlzIGp1c3RpZmllZCBmb3Igc29tZSBzaGVldHMgYW5kIHBhbm9yYW1hcywgYnV0IHVubmVjZXNzYXJ5IGZvciBtYW55IGNsb3NlZCBidWlsZGluZ3MuLi5cbiAqIEVuYWJsZSBiYWNrZmFjZSBjdWxsaW5nIG9uIHZlcmlmaWVkIGNsb3NlZCBtZXNoZXMsIG5vdCB0aHJvdWdoIGEgZ2xvYmFsIHRvZ2dsZS5cIlxuICpcbiAqIFZFUklGSUVEIG1lYW5zIHR3byBjb25kaXRpb25zLCBib3RoIG1lYXN1cmVkIG9uIHRoZSBnZW9tZXRyeSB0aGF0IGFjdHVhbGx5IGxvYWRlZDpcbiAqICAxLiBldmVyeSB1bmRpcmVjdGVkIGVkZ2UgaXMgc2hhcmVkIGJ5IGV4YWN0bHkgdHdvIHRyaWFuZ2xlcyDigJQgd2VsZGVkIGJ5IFBPU0lUSU9OLCBiZWNhdXNlIGEgR0xCXG4gKiAgICAgc3BsaXRzIHZlcnRpY2VzIGF0IFVWIGFuZCBub3JtYWwgc2VhbXMsIHNvIHJhdyBpbmRpY2VzIHdvdWxkIGNhbGwgZXZlcnkgc2VhbSBhbiBvcGVuIGVkZ2UgYW5kXG4gKiAgICAgbm8gYm9keSB3b3VsZCBldmVyIHF1YWxpZnk7XG4gKiAgMi4gdGhlIHNpZ25lZCB2b2x1bWUgaXMgcG9zaXRpdmUsIGkuZS4gdGhlIHdpbmRpbmcgcmVhbGx5IGlzIG91dHdhcmQuIEEgY2xvc2VkIHNoZWxsIHdpdGhcbiAqICAgICBpbnZlcnRlZCB3aW5kaW5nIHdvdWxkIFZBTklTSCB1bmRlciBGcm9udFNpZGUsIHdoaWNoIGlzIGV4YWN0bHkgdGhlIGZhaWx1cmUgbW9kZSBhIGdsb2JhbFxuICogICAgIHRvZ2dsZSBwcm9kdWNlcyBhbmQgdGhlIHJlYXNvbiB0aGlzIGlzIGEgcGVyLW1lc2ggdmVyZGljdC5cbiAqXG4gKiBBIG1hdGVyaWFsIGlzIG9ubHkgY3VsbGVkIHdoZW4gRVZFUlkgbWVzaCB0aGF0IHNoYXJlcyBpdCBwYXNzZWQg4oCUIEdMQiBtYXRlcmlhbHMgYXJlIHNoYXJlZFxuICogaW5zdGFuY2VzIHRoYXQgc3Vydml2ZSBhIHJlLWluc3RhbGwsIHNvIG9uZSBzaGVldCBpbiBhIHBhY2sga2VlcHMgdGhlIHdob2xlIG1hdGVyaWFsIGRvdWJsZS1zaWRlZC5cbiAqIFRoZSBvcmlnaW5hbCBzaWRlIGlzIGJhbmtlZCBvbiB0aGUgbWF0ZXJpYWwgc28gYD9saWdodGluZz1sZWdhY3lgIGFuZCBhIHJlLWluc3RhbGwgcmVzdG9yZSBpdC5cbiAqL1xudHlwZSBNZXNoQ2xvc3VyZSA9IHsgY2xvc2VkOiBib29sZWFuOyByZWFzb246ICdjbG9zZWQnIHwgJ29wZW4tZWRnZXMnIHwgJ2ludmVydGVkLXdpbmRpbmcnIHwgJ25vLWluZGV4LW9yLXBvc2l0aW9uJyB9O1xuXG5mdW5jdGlvbiBjbGFzc2lmeU1lc2hDbG9zdXJlKGdlb21ldHJ5OiBUSFJFRS5CdWZmZXJHZW9tZXRyeSk6IE1lc2hDbG9zdXJlIHtcbiAgY29uc3QgY2FjaGVkID0gZ2VvbWV0cnkudXNlckRhdGEubGFuZG1hcmtDbG9zdXJlIGFzIE1lc2hDbG9zdXJlIHwgdW5kZWZpbmVkO1xuICBpZiAoY2FjaGVkKSByZXR1cm4gY2FjaGVkO1xuICBjb25zdCB2ZXJkaWN0ID0gKCgpOiBNZXNoQ2xvc3VyZSA9PiB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgaWYgKCFwb3NpdGlvbikgcmV0dXJuIHsgY2xvc2VkOiBmYWxzZSwgcmVhc29uOiAnbm8taW5kZXgtb3ItcG9zaXRpb24nIH07XG4gICAgY29uc3QgY291bnQgPSBnZW9tZXRyeS5pbmRleD8uY291bnQgPz8gcG9zaXRpb24uY291bnQ7XG4gICAgaWYgKGNvdW50IDwgMyB8fCBjb3VudCAlIDMgIT09IDApIHJldHVybiB7IGNsb3NlZDogZmFsc2UsIHJlYXNvbjogJ25vLWluZGV4LW9yLXBvc2l0aW9uJyB9O1xuICAgIC8vIFdlbGQgYnkgcXVhbnRpc2VkIHBvc2l0aW9uOiAxZS00IGlzIGZhciBiZWxvdyB0aGUgc21hbGxlc3QgZmVhdHVyZSBpbiB0aGVzZSBib2RpZXMgKG1ldHJlcylcbiAgICAvLyBhbmQgZmFyIGFib3ZlIGZsb2F0MzIgbm9pc2Ugb24gYSA2NCBtIG1hcC5cbiAgICBjb25zdCB3ZWxkID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgICBjb25zdCB3ZWxkZWQgPSBuZXcgSW50MzJBcnJheShwb3NpdGlvbi5jb3VudCk7XG4gICAgY29uc3QgcG9pbnRzOiBudW1iZXJbXSA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbi5jb3VudDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3QgeCA9IHBvc2l0aW9uLmdldFgoaW5kZXgpO1xuICAgICAgY29uc3QgeSA9IHBvc2l0aW9uLmdldFkoaW5kZXgpO1xuICAgICAgY29uc3QgeiA9IHBvc2l0aW9uLmdldFooaW5kZXgpO1xuICAgICAgY29uc3Qga2V5ID0gYCR7TWF0aC5yb3VuZCh4ICogMWU0KX0sJHtNYXRoLnJvdW5kKHkgKiAxZTQpfSwke01hdGgucm91bmQoeiAqIDFlNCl9YDtcbiAgICAgIGxldCBpZCA9IHdlbGQuZ2V0KGtleSk7XG4gICAgICBpZiAoaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZCA9IHBvaW50cy5sZW5ndGggLyAzO1xuICAgICAgICB3ZWxkLnNldChrZXksIGlkKTtcbiAgICAgICAgcG9pbnRzLnB1c2goeCwgeSwgeik7XG4gICAgICB9XG4gICAgICB3ZWxkZWRbaW5kZXhdID0gaWQ7XG4gICAgfVxuICAgIGNvbnN0IGF0ID0gKHNsb3Q6IG51bWJlcik6IG51bWJlciA9PiB3ZWxkZWRbZ2VvbWV0cnkuaW5kZXggPyBnZW9tZXRyeS5pbmRleC5nZXRYKHNsb3QpIDogc2xvdF0hO1xuICAgIGNvbnN0IGVkZ2VzID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcj4oKTtcbiAgICBjb25zdCB2ZXJ0ZXhDb3VudCA9IHBvaW50cy5sZW5ndGggLyAzO1xuICAgIGxldCB2b2x1bWUgPSAwO1xuICAgIGZvciAobGV0IHNsb3QgPSAwOyBzbG90IDwgY291bnQ7IHNsb3QgKz0gMykge1xuICAgICAgY29uc3QgYSA9IGF0KHNsb3QpO1xuICAgICAgY29uc3QgYiA9IGF0KHNsb3QgKyAxKTtcbiAgICAgIGNvbnN0IGMgPSBhdChzbG90ICsgMik7XG4gICAgICBpZiAoYSA9PT0gYiB8fCBiID09PSBjIHx8IGEgPT09IGMpIGNvbnRpbnVlOyAvLyBhIGRlZ2VuZXJhdGUgdHJpYW5nbGUgaGFzIG5vIHN1cmZhY2UgdG8gZmFjZVxuICAgICAgZm9yIChjb25zdCBbZnJvbSwgdG9dIG9mIFtbYSwgYl0sIFtiLCBjXSwgW2MsIGFdXSBhcyBjb25zdCkge1xuICAgICAgICBjb25zdCBrZXkgPSBNYXRoLm1pbihmcm9tLCB0bykgKiB2ZXJ0ZXhDb3VudCArIE1hdGgubWF4KGZyb20sIHRvKTtcbiAgICAgICAgZWRnZXMuc2V0KGtleSwgKGVkZ2VzLmdldChrZXkpID8/IDApICsgMSk7XG4gICAgICB9XG4gICAgICBjb25zdCBheCA9IHBvaW50c1thICogM10hLCBheSA9IHBvaW50c1thICogMyArIDFdISwgYXogPSBwb2ludHNbYSAqIDMgKyAyXSE7XG4gICAgICBjb25zdCBieCA9IHBvaW50c1tiICogM10hLCBieSA9IHBvaW50c1tiICogMyArIDFdISwgYnogPSBwb2ludHNbYiAqIDMgKyAyXSE7XG4gICAgICBjb25zdCBjeCA9IHBvaW50c1tjICogM10hLCBjeSA9IHBvaW50c1tjICogMyArIDFdISwgY3ogPSBwb2ludHNbYyAqIDMgKyAyXSE7XG4gICAgICB2b2x1bWUgKz0gKGF4ICogKGJ5ICogY3ogLSBieiAqIGN5KSAtIGF5ICogKGJ4ICogY3ogLSBieiAqIGN4KSArIGF6ICogKGJ4ICogY3kgLSBieSAqIGN4KSkgLyA2O1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHNoYXJlZCBvZiBlZGdlcy52YWx1ZXMoKSkgaWYgKHNoYXJlZCAhPT0gMikgcmV0dXJuIHsgY2xvc2VkOiBmYWxzZSwgcmVhc29uOiAnb3Blbi1lZGdlcycgfTtcbiAgICBpZiAodm9sdW1lIDw9IDApIHJldHVybiB7IGNsb3NlZDogZmFsc2UsIHJlYXNvbjogJ2ludmVydGVkLXdpbmRpbmcnIH07XG4gICAgcmV0dXJuIHsgY2xvc2VkOiB0cnVlLCByZWFzb246ICdjbG9zZWQnIH07XG4gIH0pKCk7XG4gIGdlb21ldHJ5LnVzZXJEYXRhLmxhbmRtYXJrQ2xvc3VyZSA9IHZlcmRpY3Q7XG4gIHJldHVybiB2ZXJkaWN0O1xufVxuXG50eXBlIENsb3N1cmVDZW5zdXMgPSB7IGlkOiBzdHJpbmc7IG1lc2hlczogbnVtYmVyOyBjbG9zZWQ6IG51bWJlcjsgb3BlbjogbnVtYmVyOyBjdWxsZWQ6IG51bWJlcjsgZG91YmxlU2lkZWQ6IG51bWJlcjsgcmVhc29uczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiB9O1xuXG5mdW5jdGlvbiBjdWxsVmVyaWZpZWRDbG9zZWRNZXNoZXMobW9kZWw6IFRIUkVFLk9iamVjdDNELCBtb3VudElkOiBzdHJpbmcpOiBDbG9zdXJlQ2Vuc3VzIHtcbiAgY29uc3QgY2Vuc3VzOiBDbG9zdXJlQ2Vuc3VzID0geyBpZDogbW91bnRJZCwgbWVzaGVzOiAwLCBjbG9zZWQ6IDAsIG9wZW46IDAsIGN1bGxlZDogMCwgZG91YmxlU2lkZWQ6IDAsIHJlYXNvbnM6IHt9IH07XG4gIGNvbnN0IHZlcmRpY3RQZXJNYXRlcmlhbCA9IG5ldyBNYXA8VEhSRUUuTWF0ZXJpYWwsIGJvb2xlYW4+KCk7XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IG1lc2gudXNlckRhdGEubGFuZG1hcmtDb250YWN0U2hhZG93KSByZXR1cm47XG4gICAgY29uc3QgY2xvc3VyZSA9IGNsYXNzaWZ5TWVzaENsb3N1cmUobWVzaC5nZW9tZXRyeSk7XG4gICAgY2Vuc3VzLm1lc2hlcyArPSAxO1xuICAgIGNlbnN1c1tjbG9zdXJlLmNsb3NlZCA/ICdjbG9zZWQnIDogJ29wZW4nXSArPSAxO1xuICAgIGNlbnN1cy5yZWFzb25zW2Nsb3N1cmUucmVhc29uXSA9IChjZW5zdXMucmVhc29uc1tjbG9zdXJlLnJlYXNvbl0gPz8gMCkgKyAxO1xuICAgIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSA/IG1lc2gubWF0ZXJpYWwgOiBbbWVzaC5tYXRlcmlhbF0pIHtcbiAgICAgIHZlcmRpY3RQZXJNYXRlcmlhbC5zZXQobWF0ZXJpYWwsICh2ZXJkaWN0UGVyTWF0ZXJpYWwuZ2V0KG1hdGVyaWFsKSA/PyB0cnVlKSAmJiBjbG9zdXJlLmNsb3NlZCk7XG4gICAgfVxuICB9KTtcbiAgY29uc3QgY3VsbCA9IGxpZ2h0aW5nRGlhbHMoKS5jdWxsO1xuICBmb3IgKGNvbnN0IFttYXRlcmlhbCwgY2xvc2VkXSBvZiB2ZXJkaWN0UGVyTWF0ZXJpYWwpIHtcbiAgICBjb25zdCBiYW5rZWQgPSBtYXRlcmlhbC51c2VyRGF0YS5sYW5kbWFya0Jhc2VTaWRlIGFzIFRIUkVFLlNpZGUgfCB1bmRlZmluZWQ7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSBiYW5rZWQgPz8gbWF0ZXJpYWwuc2lkZTtcbiAgICBtYXRlcmlhbC51c2VyRGF0YS5sYW5kbWFya0Jhc2VTaWRlID0gb3JpZ2luYWw7XG4gICAgY29uc3QgbmV4dCA9IGNsb3NlZCAmJiBjdWxsID8gVEhSRUUuRnJvbnRTaWRlIDogb3JpZ2luYWw7XG4gICAgaWYgKG1hdGVyaWFsLnNpZGUgIT09IG5leHQpIHtcbiAgICAgIG1hdGVyaWFsLnNpZGUgPSBuZXh0O1xuICAgICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gVEhSRUUuRnJvbnRTaWRlKSBjZW5zdXMuY3VsbGVkICs9IDE7XG4gICAgZWxzZSBjZW5zdXMuZG91YmxlU2lkZWQgKz0gMTtcbiAgfVxuICByZXR1cm4gY2Vuc3VzO1xufVxuXG5mdW5jdGlvbiBkcmVzc0xhbmRtYXJrKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgY29udHJhY3RJZDogc3RyaW5nLCBtb3VudElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKGNvbnRyYWN0SWQgPT09ICdlMTAtZW1iZXItc2hvcmUnICYmIG1vdW50SWQgPT09ICdsYXN0LXdhcm0tdmVudC1hbHRhcicpIHtcbiAgICBjb25zdCBsYW1wID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMC42ODQsIDAuNjg0LCAwLjk2LCAxNiksIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7IGNvbG9yOiAweGZmYjQzOCB9KSk7XG4gICAgbGFtcC5uYW1lID0gJ2xhc3Qtd2FybS12ZW50LWFsdGFyLkFtYmVyV2luZG93JztcbiAgICBsYW1wLnBvc2l0aW9uLnkgPSAxLjk5O1xuICAgIGxhbXAudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgbW9kZWwuYWRkKGxhbXApO1xuICB9XG4gIGlmIChjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyAmJiBtb3VudElkID09PSAnd2VzdC12ZWluLWNvb2xpbmctbWFya2VyJykge1xuICAgIGNvbnN0IHNsaXQgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxLjg2LCAwLjIwKSwgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4NThhOWEwIH0pKTtcbiAgICBzbGl0Lm5hbWUgPSAnd2VzdC12ZWluLWNvb2xpbmctbWFya2VyLkdsYXNzU2xpdCc7XG4gICAgc2xpdC5wb3NpdGlvbi5zZXQoMCwgMS4yMSwgMC44ODYpO1xuICAgIHNsaXQudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgbW9kZWwuYWRkKHNsaXQpO1xuICB9XG4gIGNvbnN0IGRyZXNzaW5nID0gQ09OVFJBQ1RfTEFORE1BUktfRFJFU1NJTkdbY29udHJhY3RJZF0/Llttb3VudElkXTtcbiAgaWYgKCFkcmVzc2luZykgcmV0dXJuO1xuICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g8VEhSRUUuQnVmZmVyR2VvbWV0cnksIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPjtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IEFycmF5LmlzQXJyYXkobWVzaC5tYXRlcmlhbCkgfHwgIW1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgcmV0dXJuO1xuICAgIC8vIGtlZXBMYW5kbWFya1BhaW50UmVhZGFibGUgZHJpdmVzIHRoZXNlIGJvZGllcyBhbG1vc3QgZW50aXJlbHkgb2ZmIGVtaXNzaXZlIChtYXAgKyBpbnRlbnNpdHlcbiAgICAvLyAzKSwgc28gdGhlIGVtaXNzaXZlIGNvbG91ciDigJQgbm90IHRoZSBkaWZmdXNlIOKAlCBpcyB0aGUgbGV2ZXIgdGhhdCBhY3R1YWxseSBncmFkZXMgdGhlbS5cbiAgICBtZXNoLm1hdGVyaWFsLmVtaXNzaXZlLnNldFJHQiguLi5kcmVzc2luZy5lbWlzc2l2ZSwgVEhSRUUuTGluZWFyU1JHQkNvbG9yU3BhY2UpO1xuICAgIG1lc2gubWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbiAgaWYgKCFkcmVzc2luZy5sYW1wKSByZXR1cm47XG4gIGNvbnN0IGJveCA9IG5ldyBUSFJFRS5Cb3gzKCkuc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gIGNvbnN0IGxhbXAgPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShkcmVzc2luZy5sYW1wLndpZHRoLCBkcmVzc2luZy5sYW1wLmhlaWdodCksXG4gICAgLy8gT3BhcXVlIGFuZCBkZXB0aC13cml0aW5nIG9uIHB1cnBvc2U6IGUyZS9sYW5kbWFyay1icmlnaHRuZXNzLnNwZWMudHMgYW5kIHRoZSBjZW5zdXMgYm90aFxuICAgIC8vIGFzc2VydCB0aGF0IG5vIGxhbmRtYXJrIG1hdGVyaWFsIGlzIHRyYW5zcGFyZW50IG9yIHNraXBzIGRlcHRoIHdyaXRlLiBBIGxpdCB3aW5kb3cgZG9lc1xuICAgIC8vIG5vdCBuZWVkIHRvIGJlIGVpdGhlciDigJQgaXQgaXMgdW5saXQgcGFpbnQgdGhhdCBvdXRzaGluZXMgdGhlIHdhbGwgaXQgc2l0cyBvbi5cbiAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogTEFNUF9DT0xPVVIgfSksXG4gICk7XG4gIGxhbXAubmFtZSA9IGAke21vdW50SWR9LkxhbXBgO1xuICBsYW1wLnBvc2l0aW9uLnNldChcbiAgICBUSFJFRS5NYXRoVXRpbHMubGVycChib3gubWluLngsIGJveC5tYXgueCwgZHJlc3NpbmcubGFtcC5hY3Jvc3NYKSAtIG1vZGVsLnBvc2l0aW9uLngsXG4gICAgVEhSRUUuTWF0aFV0aWxzLmxlcnAoYm94Lm1pbi55LCBib3gubWF4LnksIGRyZXNzaW5nLmxhbXAudXBZKSAtIG1vZGVsLnBvc2l0aW9uLnksXG4gICAgYm94Lm1heC56IC0gbW9kZWwucG9zaXRpb24ueiArIDAuMDMsXG4gICk7XG4gIGxhbXAudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gIG1vZGVsLmFkZChsYW1wKTtcbn1cblxuLyoqXG4gKiBDQUxMIFRISVMgT05DRSBQRVIgQk9EWS4gRi1CSE0tMSAoZm91bmQgYnkgdGhpcyBzaGlmdCwgMjAyNi0wOC0wNCk6IGJldHdlZW4gYGQ2NzA5NWViYCDigJQgdGhlXG4gKiBiYXJvbiBkcmFpbiwgd2hvc2UgbWVyZ2UgcmVzb2x1dGlvbiBrZXB0IGJvdGggdGhlIG5ldyBwZXItY29udHJhY3QgYmxvY2sgYW5kIHRoZSBvbGQgc2luZ2xlLWxpbmVcbiAqIGNhbGwgaXQgcmVwbGFjZWQg4oCUIGFuZCB0aGlzIGNvbW1pdCwgdGhlIHBpbG90IGNhbGxlZCBpdCBUV0lDRSwgdGhlIHNlY29uZCB0aW1lIHdpdGggdGhlIGRlZmF1bHRcbiAqIHBhaW50LiBFdmVyeSBwZXItY29udHJhY3QgaW50ZW5zaXR5IG9uIG1haW4gd2FzIHRoZXJlZm9yZSBzaWxlbnRseSByZXNldCB0byAzOiB0aGUtY2xhaW0ncyAxLjQ1XG4gKiAoc2hpcHBlZCBgMjJmZDJmZDdgKSwgdGhlIGJhcm9uJ3MgMS43LzEuOS8yLjEvMy40IEFORCBpdHMgZW1pc3NpdmUgZ3JhZGUsIGFuZCBkcnkgZ3VsY2gnc1xuICogaXNvbGF0ZWRfc3ByaW5nIDIuMS4gVGhyZWUgc2lnbmVkLW9mZiB1cGdyYWRlcyB3ZXJlIGRlZmVhdGVkIGFuZCBldmVyeSBnYXRlIHN0YXllZCBncmVlbiwgYmVjYXVzZVxuICogdGhlIGRhdGFzZXQgcHVibGlzaGVkIHRoZSBUQUJMRSdzIG51bWJlciByYXRoZXIgdGhhbiB0aGUgbWF0ZXJpYWwncy4gSXQgbm93IHB1Ymxpc2hlcyB0aGVcbiAqIG1hdGVyaWFsJ3MgKHNlZSB0ZXJyYWluM2RQaWxvdExhbmRtYXJrTWF0ZXJpYWxzKS5cbiAqL1xuZnVuY3Rpb24ga2VlcExhbmRtYXJrUGFpbnRSZWFkYWJsZShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHBhaW50OiBMYW5kbWFya1BhaW50ID0gREVGQVVMVF9MQU5ETUFSS19QQUlOVCwgY29udHJhY3RJZCA9ICcnKTogdm9pZCB7XG4gIC8vIEFuIHVudGludGVkIGJvZHkgbXVzdCBub3QgZXZlbiByb3VuZC10cmlwIGl0cyBjb2xvdXIgdGhyb3VnaCBnZXRIZXgvc2V0SGV4IOKAlFxuICAvLyB0aGF0IHF1YW50aXNlcyB0byA4IGJpdHMgcGVyIGNoYW5uZWwsIGFuZCBldmVyeSBtYXAgZXhjZXB0IGUxLWJhcm9uIGlzXG4gIC8vIHN1cHBvc2VkIHRvIGNvbWUgb3V0IG9mIGhlcmUgYnl0ZS1pZGVudGljYWwgdG8gYmVmb3JlIHRoaXMgc2VhbSBleGlzdGVkLlxuICBjb25zdCB0aW50ID0gcGFpbnQudGludCA9PT0gREVGQVVMVF9MQU5ETUFSS19QQUlOVC50aW50ID8gbnVsbCA6IG5ldyBUSFJFRS5Db2xvcihwYWludC50aW50KTtcbiAgbW9kZWwudHJhdmVyc2UoKG5vZGUpID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgfHwgIW1lc2gubWF0ZXJpYWwubWFwKSByZXR1cm47XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsO1xuICAgIGlmICh0aW50KSB7XG4gICAgICAvLyBHTEIgbWF0ZXJpYWxzIGFyZSBzaGFyZWQgaW5zdGFuY2VzIHRoYXQgc3Vydml2ZSBhIHJlLWluc3RhbGwsIHNvIHRoZVxuICAgICAgLy8gYmFzZSBjb2xvdXIgaXMgYmFua2VkIG9uY2Ug4oCUIHRpbnRpbmcgYSB0aW50ZWQgbWF0ZXJpYWwgd291bGQgY29tcG91bmQuXG4gICAgICBjb25zdCBiYW5rZWQgPSBtYXRlcmlhbC51c2VyRGF0YS5sYW5kbWFya0Jhc2VDb2xvciBhcyBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCBiYXNlID0gYmFua2VkID8/IG1hdGVyaWFsLmNvbG9yLmdldEhleCgpO1xuICAgICAgbWF0ZXJpYWwudXNlckRhdGEubGFuZG1hcmtCYXNlQ29sb3IgPSBiYXNlO1xuICAgICAgbWF0ZXJpYWwuY29sb3Iuc2V0SGV4KGJhc2UpLm11bHRpcGx5KHRpbnQpO1xuICAgIH1cbiAgICBtYXRlcmlhbC5lbWlzc2l2ZS5zZXQocGFpbnQudGludCk7XG4gICAgbWF0ZXJpYWwuZW1pc3NpdmVNYXAgPSBtYXRlcmlhbC5tYXA7XG4gICAgLy8gVGhlIGF1dGhvcmVkIG51bWJlciBpcyBiYW5rZWQgc28gdGhlIGRhdGFzZXQgY2FuIHB1Ymxpc2ggQk9USCDigJQgdGhlIGdyYWRlIHRoZSBiZWF1dHkgc2hpZnRcbiAgICAvLyB3cm90ZSBhbmQgdGhlIGxpdCB2YWx1ZSBpdCByZW5kZXJzIGF0IOKAlCBhbmQgc28gYD9saWdodGluZz1sZWdhY3lgIHJlc3RvcmVzIHRoZSBleGFjdFxuICAgIC8vIHByZS1jYWxpYnJhdGlvbiByZW5kZXIgZnJvbSBhIG1hdGVyaWFsIHRoYXQgbWF5IGFscmVhZHkgaGF2ZSBiZWVuIHJlLWluc3RhbGxlZCBvbmNlLlxuICAgIG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrQXV0aG9yZWRFbWlzc2l2ZSA9IHBhaW50LmludGVuc2l0eTtcbiAgICBtYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eSA9IGNhbGlicmF0ZWRMYW5kbWFya0ludGVuc2l0eShwYWludC5pbnRlbnNpdHkpO1xuICAgIGlmICgoY29udHJhY3RJZCA9PT0gJ2UyLXByZXNzdXJlLWdhcmRlbicgfHwgY29udHJhY3RJZCA9PT0gJ2U2LWdsb3ctbWVzYScgfHwgY29udHJhY3RJZCA9PT0gJ2U2LXBpY25pYycgfHwgY29udHJhY3RJZCA9PT0gJ2U3LWRlYWQtYmFuZCcgfHwgY29udHJhY3RJZCA9PT0gJ2U3LXJlbGF5LXJ1c2gnIHx8IGNvbnRyYWN0SWQgPT09ICdlOC1mYXItc2lkZScgfHwgY29udHJhY3RJZCA9PT0gJ2U4LWxvdy1vcmJpdCcgfHwgY29udHJhY3RJZCA9PT0gJ2U5LWRvbWUtYmFzaW4nIHx8IGNvbnRyYWN0SWQgPT09ICdlOS1zZWVkLXJ1bicgfHwgY29udHJhY3RJZCA9PT0gJ2U5LWRldmlscy1hbGxleScgfHwgY29udHJhY3RJZCA9PT0gJ2U5LW9sZC1jYW5hbCcgfHwgY29udHJhY3RJZCA9PT0gJ2UxMC1sYXN0LWNsYWltJyB8fCBjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyB8fCBjb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnKSAmJiAhbWF0ZXJpYWwudXNlckRhdGEubGFuZG1hcmtEaWZmdXNlR3JhZGUpIHtcbiAgICAgIG1hdGVyaWFsLnVzZXJEYXRhLmxhbmRtYXJrRGlmZnVzZUdyYWRlID0gdHJ1ZTtcbiAgICAgIC8vIFJlY292ZXIgdGhlIGF0bGFzJ3MgZGFyayBpcm9uIGRldGFpbCBpbiBpdHMgZGlmZnVzZSBwYWludCwgc28gdGhlIGJvZHkgY2FuXG4gICAgICAvLyBsZWF2ZSB0aGUgbGVnYWN5LWVtaXNzaW9uIGV4ZW1wdGlvbiB3aXRob3V0IHR1cm5pbmcgaXRzIHRleHR1cmUgaW50byBhIGxhbXAuXG4gICAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5kaWZmdXNlQ29sb3IucmdiID0gbWluKHZlYzMoMC44OCksIHBvdyhtYXgoZGlmZnVzZUNvbG9yLnJnYiwgdmVjMygwLjApKSwgdmVjMygwLjYyKSkgKiB2ZWMzKDAuOTQsIDAuOTksIDEuMDYpICsgdmVjMygwLjAxNCkpO2ApO1xuICAgICAgfTtcbiAgICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdsYW5kbWFyay1kaWZmdXNlLWlyb24tdjEnO1xuICAgICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVTMg4oCUIHNvZnQgY29udGFjdCBlbGxpcHNlcyB1bmRlciB0aGUgbW91bnRlZCBsYW5kbWFya3MuXG4gKlxuICogTGFuZG1hcmtzIGFyZSBtb3VudGVkIHdpdGggY2FzdFNoYWRvdyBvZmYsIHNvIGEgbGl0IGJvZHkgaGFzIG5vdGhpbmcgdHlpbmcgaXQgdG9cbiAqIHRoZSBncm91bmQuIE9uZSBpbnN0YW5jZWQgcXVhZCBwZXIgbW91bnQsIHNpemVkIGZyb20gdGhlIG1vZGVsJ3Mgb3duIGZvb3RwcmludCxcbiAqIHVzaW5nIHRoZSBzaGlwcGVkIGJsb2Itc2hhZG93IHJlY2lwZSAoTGlnaHRSaWcgU3ByaXRlQmxvYlNoYWRvd3M6ICMyZTFiMGUgYXQgMC4xNyxcbiAqIGRlcHRoV3JpdGUgb2ZmLCBwb2x5Z29uLW9mZnNldCwgbGFpZCBmbGF0IGp1c3QgYWJvdmUgdGhlIHRlcnJhaW4pLlxuICpcbiAqIERlbGliZXJhdGVseSBOT1QgYSBjaGlsZCBvZiBUZXJyYWluM2RMYW5kbWFya3M6IHRoYXQgZ3JvdXAncyBjaGlsZHJlbiBhcmUgY291bnRlZFxuICogYXMgbGFuZG1hcmtzIGFuZCB0aGVpciBtYXRlcmlhbHMgYXJlIGF1ZGl0ZWQgZm9yIHRyYW5zcGFyZW5jeSBieSB0aGUgbWFwIGNlbnN1cyxcbiAqIHNvIGEgc2hhZG93IHBhcmVudGVkIHRoZXJlIHdvdWxkIHJlYWQgYXMgYSBzaXh0aCBsYW5kbWFyayB3aXRoIGFuIHVubGl0IG1hdGVyaWFsLlxuICovXG5mdW5jdGlvbiBtb3VudExhbmRtYXJrQ29udGFjdHMoXG4gIGhvc3Q6IEhvc3QsXG4gIG1vdW50czogQXJyYXk8eyBpZDogc3RyaW5nOyBtb2RlbDogVEhSRUUuT2JqZWN0M0QgfT4sXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgd2F0ZXJZOiBudW1iZXIgfCB1bmRlZmluZWQsXG4gIGJvdW5kczogVEhSRUUuQm94Myxcbik6IFRIUkVFLkluc3RhbmNlZE1lc2ggfCB1bmRlZmluZWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFMQU5ETUFSS19DT05UQUNUX0NPTlRSQUNUUy5oYXMoaG9zdC5jb250cmFjdElkKSB8fCAhbW91bnRzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoMSwgMjQpO1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgY29sb3I6ICcjMmUxYjBlJyxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiAwLjE3LFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIHBvbHlnb25PZmZzZXQ6IHRydWUsXG4gICAgcG9seWdvbk9mZnNldEZhY3RvcjogLTEsXG4gICAgcG9seWdvbk9mZnNldFVuaXRzOiAtMSxcbiAgfSk7XG4gIGNvbnN0IGNvbnRhY3RzID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goZ2VvbWV0cnksIG1hdGVyaWFsLCBtb3VudHMubGVuZ3RoKTtcbiAgY29udGFjdHMubmFtZSA9ICdUZXJyYWluM2RMYW5kbWFya0NvbnRhY3RzJztcbiAgY29udGFjdHMudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gIGNvbnRhY3RzLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgY29udGFjdHMucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kU2hhZG93cztcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgY29uc3Qgc2l6ZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIGNvbnN0IHBsYWNlciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICAvLyBMZWFuIHRoZSBwb29sIHRoZSB3YXkgdGhlIGtleSBsaWdodCB0aHJvd3MgaXQsIG9yIGEgc2hhZG93IGNlbnRyZWQgdW5kZXIgYSBzb2xpZFxuICAvLyBidWlsZGluZyBpcyBzaW1wbHkgY292ZXJlZCBieSB0aGUgYnVpbGRpbmcgYW5kIG5ldmVyIHJlYWRzLlxuICBjb25zdCBsZWFuID0gbGVkZ2VyU3VuU2hhZG93RGlyZWN0aW9uKCk7XG4gIGxldCB3cml0dGVuID0gMDtcbiAgY29uc3QgY29sbGFyZWQgPSBuZXcgU2V0KChTQ1VMUFRfV0FURVJfRFJFU1NJTkdbaG9zdC5jb250cmFjdElkXT8uY29sbGFycyA/PyBbXSkubWFwKCh7IG1vdW50IH0pID0+IG1vdW50KSk7XG4gIGZvciAoY29uc3QgeyBpZCwgbW9kZWwgfSBvZiBtb3VudHMpIHtcbiAgICBib3guc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gICAgYm94LmdldFNpemUoc2l6ZSk7XG4gICAgaWYgKFxuICAgICAgbW9kZWwucG9zaXRpb24ueCA8IGJvdW5kcy5taW4ueCB8fCBtb2RlbC5wb3NpdGlvbi54ID4gYm91bmRzLm1heC54IHx8XG4gICAgICBtb2RlbC5wb3NpdGlvbi56IDwgYm91bmRzLm1pbi56IHx8IG1vZGVsLnBvc2l0aW9uLnogPiBib3VuZHMubWF4LnogfHxcbiAgICAgIGNvbGxhcmVkLmhhcyhpZClcbiAgICApIGNvbnRpbnVlO1xuICAgIGNvbnN0IGdyb3VuZCA9IGhlaWdodEF0KG1vZGVsLnBvc2l0aW9uLngsIG1vZGVsLnBvc2l0aW9uLnopO1xuICAgIC8vIE5vIGNvbnRhY3Qgc2hhZG93IG9uIGEgYm9keSBzdGFuZGluZyBpbiB3YXRlcjogdGhlIHJpcGFyaWFuIHBhY2sgc2l0cyBpbiB0aGVcbiAgICAvLyBjaGFubmVsLCBhbmQgYSBoYXJkIGVsbGlwc2UgdW5kZXIgdGhlIHN1cmZhY2UgcmVhZHMgYXMgYSBob2xlLCBub3QgYSBzaGFkb3cuXG4gICAgaWYgKHdhdGVyWSAhPT0gdW5kZWZpbmVkICYmIGdyb3VuZCA8IHdhdGVyWSkgY29udGludWU7XG4gICAgY29uc3QgdGhyb3dMZW5ndGggPSBzaXplLnkgKiBMQU5ETUFSS19DT05UQUNUX1RIUk9XO1xuICAgIHBsYWNlci5wb3NpdGlvbi5zZXQoXG4gICAgICBtb2RlbC5wb3NpdGlvbi54ICsgbGVhbi54ICogdGhyb3dMZW5ndGgsXG4gICAgICBncm91bmQgKyAwLjAyMixcbiAgICAgIG1vZGVsLnBvc2l0aW9uLnogKyBsZWFuLnkgKiB0aHJvd0xlbmd0aCxcbiAgICApO1xuICAgIHBsYWNlci5yb3RhdGlvbi5zZXQoLU1hdGguUEkgLyAyLCAwLCAtMC4zOCk7XG4gICAgcGxhY2VyLnNjYWxlLnNldChcbiAgICAgIE1hdGgubWF4KDAuNywgc2l6ZS54ICogTEFORE1BUktfQ09OVEFDVF9TUFJFQUQpLFxuICAgICAgTWF0aC5tYXgoMC43LCBzaXplLnogKiBMQU5ETUFSS19DT05UQUNUX1NQUkVBRCksXG4gICAgICAxLFxuICAgICk7XG4gICAgcGxhY2VyLnVwZGF0ZU1hdHJpeCgpO1xuICAgIGNvbnRhY3RzLnNldE1hdHJpeEF0KHdyaXR0ZW4sIHBsYWNlci5tYXRyaXgpO1xuICAgIHdyaXR0ZW4gKz0gMTtcbiAgfVxuICBjb250YWN0cy5jb3VudCA9IHdyaXR0ZW47XG4gIGNvbnRhY3RzLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgaWYgKCF3cml0dGVuKSB7XG4gICAgZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgIG1hdGVyaWFsLmRpc3Bvc2UoKTtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGhvc3Quc2NlbmUuYWRkKGNvbnRhY3RzKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENvbnRhY3RTaGFkb3dzID0gU3RyaW5nKHdyaXR0ZW4pO1xuICByZXR1cm4gY29udGFjdHM7XG59XG5cbi8qKlxuICogV2hlcmUgdGhlIHdhdGVyIGxpbmUgc2l0cyBpbiBhIGJha2VkIGNoYW5uZWwuXG4gKlxuICogVHdvIHRydXRocyBjb21wZXRlOiB0aGUgY2hhbm5lbCB3YW50cyB0byBiZSBmdWxsLCBhbmQgdGhlIGZvcmQgaGFzIHRvIHN0YXkgYVxuICogY3Jvc3NpbmcuIFNvIHRoZSBzdXJmYWNlIGlzIHRoZSBMT1dFUiBvZiBcImNoYW5uZWwgYmVkICsgZmlsbFwiIGFuZCBcImZvcmQgYmVkICtcbiAqIHNraW1cIiDigJQgdGhlIGNoYW5uZWwgcmVhZHMgZGVlcCwgdGhlIGZvcmQgcmVhZHMgbGlrZSBhIHdldCBzaGVsZiB5b3UgY2FuIHdhbGsuXG4gKiBCb3RoIGJlZHMgYXJlIHJlYWQgZnJvbSB0aGUgYmFrZWQgZ3JpZCwgc28gYSByZS1zY3VscHQgbW92ZXMgdGhlIHdhdGVyIHdpdGggaXQuXG4gKi9cbmZ1bmN0aW9uIHNjdWxwdFdhdGVyU3VyZmFjZVkoXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgaGFsZlg6IG51bWJlcixcbiAgY2VudGVyWjogbnVtYmVyLFxuICBmb3JkczogUmVhZG9ubHlBcnJheTx7IGNlbnRlclg6IG51bWJlcjsgaGFsZldpZHRoOiBudW1iZXIgfT4sXG4gIGZpbGw6IG51bWJlcixcbiAgZm9yZFNraW06IG51bWJlcixcbik6IG51bWJlciB7XG4gIGNvbnN0IGNoYW5uZWw6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGZvcmQ6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IHggPSAtaGFsZlggKyAyOyB4IDw9IGhhbGZYIC0gMjsgeCArPSAxKSB7XG4gICAgY29uc3QgY3Jvc3NpbmcgPSBmb3Jkcy5zb21lKChyYW5nZSkgPT4gTWF0aC5hYnMoeCAtIHJhbmdlLmNlbnRlclgpIDw9IHJhbmdlLmhhbGZXaWR0aCk7XG4gICAgZm9yIChjb25zdCB6IG9mIFstMy41LCAtMiwgLTEsIDAsIDEsIDIsIDMuNV0pIHtcbiAgICAgIChjcm9zc2luZyA/IGZvcmQgOiBjaGFubmVsKS5wdXNoKGhlaWdodEF0KHgsIGNlbnRlclogKyB6KSk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG1lZGlhbiA9ICh2YWx1ZXM6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgcmV0dXJuIHNvcnRlZFtNYXRoLmZsb29yKHNvcnRlZC5sZW5ndGggLyAyKV0gPz8gMDtcbiAgfTtcbiAgY29uc3QgY2hhbm5lbEJlZCA9IGNoYW5uZWwubGVuZ3RoID8gbWVkaWFuKGNoYW5uZWwpIDogMDtcbiAgY29uc3QgZm9yZEJlZCA9IGZvcmQubGVuZ3RoID8gbWVkaWFuKGZvcmQpIDogY2hhbm5lbEJlZDtcbiAgcmV0dXJuIE1hdGgubWluKGNoYW5uZWxCZWQgKyBmaWxsLCBmb3JkQmVkICsgZm9yZFNraW0pO1xufVxuXG4vKiogRGVyaXZlIGEgZmxhdC1mbG9vcmVkIGdvcmdlJ3Mgd2F0ZXIgbGluZSBmcm9tIGl0cyBiYWtlZCBjZW50cmVsaW5lLiAqL1xuZnVuY3Rpb24gc2N1bHB0V2F0ZXJGbG9vclkoXG4gIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcixcbiAgaGFsZlg6IG51bWJlcixcbiAgY2VudGVyWjogbnVtYmVyLFxuICBxdWFudGlsZTogbnVtYmVyLFxuICBkcm9wOiBudW1iZXIsXG4pOiBudW1iZXIge1xuICBjb25zdCBzYW1wbGVzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCB4ID0gLWhhbGZYICsgMTsgeCA8PSBoYWxmWCAtIDE7IHggKz0gMC41KSBzYW1wbGVzLnB1c2goaGVpZ2h0QXQoeCwgY2VudGVyWikpO1xuICBzYW1wbGVzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgcmV0dXJuIChzYW1wbGVzW01hdGgubWluKHNhbXBsZXMubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihzYW1wbGVzLmxlbmd0aCAqIHF1YW50aWxlKSldID8/IDApIC0gZHJvcDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3BhblNoYWRvd0JhbmQoaGFsZldpZHRoOiBudW1iZXIsIGhhbGZMZW5ndGg6IG51bWJlciwgY29sb3I6IHN0cmluZywgb3BhY2l0eTogbnVtYmVyKTogVEhSRUUuTWVzaCB7XG4gIGNvbnN0IGNvbHVtbnMgPSBbLTEsIC0wLjYyLCAwLCAwLjYyLCAxXTtcbiAgY29uc3QgY29sdW1uQWxwaGEgPSBbMCwgMSwgMSwgMSwgMF07XG4gIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgY29sb3JzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPD0gU1BBTl9TSEFET1dfUk9XUzsgcm93ICs9IDEpIHtcbiAgICBjb25zdCB0ID0gcm93IC8gU1BBTl9TSEFET1dfUk9XUztcbiAgICBjb25zdCB0YXBlciA9IE1hdGgubWluKFxuICAgICAgVEhSRUUuTWF0aFV0aWxzLnNtb290aHN0ZXAodCwgMCwgU1BBTl9TSEFET1dfRU5EX1RBUEVSKSxcbiAgICAgIFRIUkVFLk1hdGhVdGlscy5zbW9vdGhzdGVwKDEgLSB0LCAwLCBTUEFOX1NIQURPV19FTkRfVEFQRVIpLFxuICAgICk7XG4gICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1ucy5sZW5ndGg7IGNvbHVtbiArPSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChjb2x1bW5zW2NvbHVtbl0hICogaGFsZldpZHRoLCAwLCBUSFJFRS5NYXRoVXRpbHMubGVycCgtaGFsZkxlbmd0aCwgaGFsZkxlbmd0aCwgdCkpO1xuICAgICAgY29sb3JzLnB1c2goMSwgMSwgMSwgY29sdW1uQWxwaGFbY29sdW1uXSEgKiB0YXBlcik7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IFNQQU5fU0hBRE9XX1JPV1M7IHJvdyArPSAxKSB7XG4gICAgZm9yIChsZXQgY29sdW1uID0gMDsgY29sdW1uIDwgY29sdW1ucy5sZW5ndGggLSAxOyBjb2x1bW4gKz0gMSkge1xuICAgICAgY29uc3QgYSA9IHJvdyAqIGNvbHVtbnMubGVuZ3RoICsgY29sdW1uO1xuICAgICAgY29uc3QgYiA9IGEgKyAxO1xuICAgICAgY29uc3QgYyA9IGEgKyBjb2x1bW5zLmxlbmd0aDtcbiAgICAgIGNvbnN0IGQgPSBjICsgMTtcbiAgICAgIGluZGljZXMucHVzaChhLCBjLCBiLCBiLCBjLCBkKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ2NvbG9yJywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUoY29sb3JzLCA0KSk7XG4gIGdlb21ldHJ5LnNldEluZGV4KGluZGljZXMpO1xuICBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yLFxuICAgIHZlcnRleENvbG9yczogdHJ1ZSxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5LFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gIH0pKTtcbiAgbWVzaC5uYW1lID0gJ1RlcnJhaW4zZFNwYW5TaGFkb3cnO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgbWVzaC5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHMgKyAwLjA1O1xuICByZXR1cm4gbWVzaDtcbn1cblxuZnVuY3Rpb24gbW91bnRTcGFuU2hhZG93KFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuICB3YXRlclk6IG51bWJlciB8IHVuZGVmaW5lZCxcbik6IFRIUkVFLk1lc2ggfCB1bmRlZmluZWQge1xuICBjb25zdCBkcmVzc2luZyA9IFNQQU5fU0hBRE9XX0NPTlRSQUNUU1tob3N0LmNvbnRyYWN0SWRdO1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpIHx8ICFkcmVzc2luZyB8fCB3YXRlclkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgc3BhbiA9IG1vdW50cy5maW5kKCh7IGlkIH0pID0+IGlkID09PSBkcmVzc2luZy5tb3VudElkKT8ubW9kZWw7XG4gIGlmICghc3BhbikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKS5zZXRGcm9tT2JqZWN0KHNwYW4pO1xuICBjb25zdCBzaXplID0gYm94LmdldFNpemUobmV3IFRIUkVFLlZlY3RvcjMoKSk7XG4gIGlmIChzaXplLnggPD0gMCB8fCBzaXplLnogPD0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgc2hhZG93ID0gY3JlYXRlU3BhblNoYWRvd0JhbmQoc2l6ZS54ICogZHJlc3Npbmcud2lkdGhTY2FsZSwgc2l6ZS56ICogZHJlc3NpbmcubGVuZ3RoU2NhbGUsIGRyZXNzaW5nLmNvbG9yLCBkcmVzc2luZy5vcGFjaXR5KTtcbiAgY29uc3QgbGVhbiA9IGxlZGdlclN1blNoYWRvd0RpcmVjdGlvbigpO1xuICBjb25zdCBkcm9wID0gTWF0aC5tYXgoMCwgYm94Lm1heC55IC0gd2F0ZXJZKTtcbiAgc2hhZG93LnBvc2l0aW9uLnNldChcbiAgICAoYm94Lm1pbi54ICsgYm94Lm1heC54KSAvIDIgKyBsZWFuLnggKiBkcm9wICogZHJlc3NpbmcudGhyb3csXG4gICAgd2F0ZXJZICsgU1BBTl9TSEFET1dfTElGVCxcbiAgICAoYm94Lm1pbi56ICsgYm94Lm1heC56KSAvIDIgKyBsZWFuLnkgKiBkcm9wICogZHJlc3NpbmcudGhyb3csXG4gICk7XG4gIGhvc3Quc2NlbmUuYWRkKHNoYWRvdyk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTcGFuU2hhZG93ID0gYCR7KHNpemUueiAqIGRyZXNzaW5nLmxlbmd0aFNjYWxlICogMikudG9GaXhlZCgyKX14JHsoc2l6ZS54ICogZHJlc3Npbmcud2lkdGhTY2FsZSAqIDIpLnRvRml4ZWQoMil9QCR7ZHJvcC50b0ZpeGVkKDIpfWA7XG4gIHJldHVybiBzaGFkb3c7XG59XG5cbi8qKlxuICogVTEg4oCUIG1vdW50IHRoZSByZW5kZXItb25seSBsaXZpbmctd2F0ZXIgc3VyZmFjZSBmb3IgYSBzY3VscHRlZCBjb250cmFjdC5cbiAqIFNpbS1zaWxlbnQ6IGV2ZXJ5IG51bWJlciBiZWxvdyBpcyByZWFkIGZyb20gdGhlIHNpbSdzIG93biBkZWNsYXJhdGlvbnMgb3IgZnJvbVxuICogdGhlIGJha2VkIGhlaWdodCBncmlkOyBub3RoaW5nIGlzIHdyaXR0ZW4gYmFjay5cbiAqL1xuLyoqIEEgbmFycm93IHdhdGVybGluZSB0YWtlbiBmcm9tIHRoZSB2aXNpYmxlIGh1bGwncyBhY3R1YWwgaW50ZXJzZWN0aW9uIHdpdGggdGhlIHNlYS4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUh1bGxXYXRlcmxpbmUocm9vdDogVEhSRUUuT2JqZWN0M0QsIHdhdGVyWTogbnVtYmVyLCB0aW1lOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+KTogVEhSRUUuTWVzaCB8IHVuZGVmaW5lZCB7XG4gIHJvb3QudXBkYXRlV29ybGRNYXRyaXgodHJ1ZSwgdHJ1ZSk7XG4gIGNvbnN0IHNlZ21lbnRzOiBBcnJheTxbVEhSRUUuVmVjdG9yMywgVEhSRUUuVmVjdG9yM10+ID0gW107XG4gIGNvbnN0IGEgPSBuZXcgVEhSRUUuVmVjdG9yMygpLCBiID0gbmV3IFRIUkVFLlZlY3RvcjMoKSwgYyA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIHJvb3QudHJhdmVyc2UoKG9iamVjdCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoIHx8IG1lc2gudXNlckRhdGEucmVuZGVyT25seSkgcmV0dXJuO1xuICAgIGNvbnN0IGdlb21ldHJ5ID0gbWVzaC5nZW9tZXRyeTtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgaWYgKCFwb3NpdGlvbnMpIHJldHVybjtcbiAgICBjb25zdCBjb3VudCA9IGdlb21ldHJ5LmluZGV4Py5jb3VudCA/PyBwb3NpdGlvbnMuY291bnQ7XG4gICAgY29uc3QgdmVydGV4ID0gKHRhcmdldDogVEhSRUUuVmVjdG9yMywgc2xvdDogbnVtYmVyKSA9PiB0YXJnZXQuZnJvbUJ1ZmZlckF0dHJpYnV0ZShcbiAgICAgIHBvc2l0aW9ucywgZ2VvbWV0cnkuaW5kZXggPyBnZW9tZXRyeS5pbmRleC5nZXRYKHNsb3QpIDogc2xvdCxcbiAgICApLmFwcGx5TWF0cml4NChtZXNoLm1hdHJpeFdvcmxkKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpICs9IDMpIHtcbiAgICAgIHZlcnRleChhLCBpKTsgdmVydGV4KGIsIGkgKyAxKTsgdmVydGV4KGMsIGkgKyAyKTtcbiAgICAgIGNvbnN0IGN1dHM6IFRIUkVFLlZlY3RvcjNbXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbZnJvbSwgdG9dIG9mIFtbYSxiXSwgW2IsY10sIFtjLGFdXSkge1xuICAgICAgICBpZiAoKGZyb20hLnkgPD0gd2F0ZXJZKSA9PT0gKHRvIS55IDw9IHdhdGVyWSkpIGNvbnRpbnVlO1xuICAgICAgICBjdXRzLnB1c2goZnJvbSEuY2xvbmUoKS5sZXJwKHRvISwgKHdhdGVyWSAtIGZyb20hLnkpIC8gKHRvIS55IC0gZnJvbSEueSkpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjdXRzLmxlbmd0aCA9PT0gMiAmJiBjdXRzWzBdIS5kaXN0YW5jZVRvU3F1YXJlZChjdXRzWzFdISkgPiAxZS04KSBzZWdtZW50cy5wdXNoKFtjdXRzWzBdISwgY3V0c1sxXSFdKTtcbiAgICB9XG4gIH0pO1xuICBpZiAoIXNlZ21lbnRzLmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgYm91bmRzID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSBmb3IgKGNvbnN0IHBvaW50IG9mIHNlZ21lbnQpIGJvdW5kcy5leHBhbmRCeVBvaW50KHBvaW50KTtcbiAgY29uc3QgY2VudGVyID0gYm91bmRzLmdldENlbnRlcihuZXcgVEhSRUUuVmVjdG9yMygpKTtcbiAgY29uc3QgcG9zaXRpb25zOiBudW1iZXJbXSA9IFtdLCB1dnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGVtaXQgPSAocG9pbnQ6IFRIUkVFLlZlY3RvcjMsIGVkZ2U6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGxvY2FsID0gcm9vdC53b3JsZFRvTG9jYWwocG9pbnQuY2xvbmUoKSk7XG4gICAgcG9zaXRpb25zLnB1c2gobG9jYWwueCxsb2NhbC55LGxvY2FsLnopOyB1dnMucHVzaCgwLGVkZ2UpO1xuICB9O1xuICBmb3IgKGNvbnN0IFtmcm9tLHRvXSBvZiBzZWdtZW50cykge1xuICAgIGNvbnN0IG91dHdhcmQgPSBuZXcgVEhSRUUuVmVjdG9yMyh0by56LWZyb20ueiwwLGZyb20ueC10by54KS5ub3JtYWxpemUoKTtcbiAgICBjb25zdCBtaWQgPSBmcm9tLmNsb25lKCkuYWRkKHRvKS5tdWx0aXBseVNjYWxhciguNSkuc3ViKGNlbnRlcik7XG4gICAgaWYgKG91dHdhcmQuZG90KG1pZCkgPCAwKSBvdXR3YXJkLm5lZ2F0ZSgpO1xuICAgIGNvbnN0IGlubmVyQSA9IGZyb20uY2xvbmUoKSwgaW5uZXJCID0gdG8uY2xvbmUoKTtcbiAgICBpbm5lckEueSA9IGlubmVyQi55ID0gd2F0ZXJZICsgMC4wMTg7XG4gICAgY29uc3Qgb3V0ZXJBID0gaW5uZXJBLmNsb25lKCkuYWRkU2NhbGVkVmVjdG9yKG91dHdhcmQsLjM0KTtcbiAgICBjb25zdCBvdXRlckIgPSBpbm5lckIuY2xvbmUoKS5hZGRTY2FsZWRWZWN0b3Iob3V0d2FyZCwuMzQpO1xuICAgIGVtaXQoaW5uZXJBLDApOyBlbWl0KG91dGVyQSwxKTsgZW1pdChpbm5lckIsMCk7XG4gICAgZW1pdChpbm5lckIsMCk7IGVtaXQob3V0ZXJBLDEpOyBlbWl0KG91dGVyQiwxKTtcbiAgfVxuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyxuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3V2JyxuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSh1dnMsMikpO1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7Y29sb3I6JyNiNWM0YmInLHRyYW5zcGFyZW50OnRydWUsb3BhY2l0eTouMjQsZGVwdGhXcml0ZTpmYWxzZSxzaWRlOlRIUkVFLkRvdWJsZVNpZGV9KTtcbiAgbWF0ZXJpYWwuZm9yY2VTaW5nbGVQYXNzID0gdHJ1ZTtcbiAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gc2hhZGVyID0+IHtcbiAgICBzaGFkZXIudW5pZm9ybXMuaHVsbFdhdGVyVGltZSA9IHRpbWU7XG4gICAgc2hhZGVyLnZlcnRleFNoYWRlcj1zaGFkZXIudmVydGV4U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdldhdGVybGluZTsnKVxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52V2F0ZXJsaW5lID0gdmVjMyhwb3NpdGlvbi54LCBwb3NpdGlvbi56LCB1di55KTsnKTtcbiAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXI9c2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdldhdGVybGluZTtcXG51bmlmb3JtIGZsb2F0IGh1bGxXYXRlclRpbWU7JylcbiAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29sb3JfZnJhZ21lbnQ+JyxgI2luY2x1ZGUgPGNvbG9yX2ZyYWdtZW50PlxuICAgICAgICBmbG9hdCB3YXNoID0gc2luKHZXYXRlcmxpbmUueCAqIDAuOSArIHZXYXRlcmxpbmUueSAqIDEuNCArIGh1bGxXYXRlclRpbWUgKiAwLjUpXG4gICAgICAgICAgKiBzaW4odldhdGVybGluZS55ICogMi45IC0gaHVsbFdhdGVyVGltZSAqIDAuMyk7XG4gICAgICAgIGRpZmZ1c2VDb2xvci5hICo9ICgxLjAgLSBzbW9vdGhzdGVwKDAuMCwgMS4wLCB2V2F0ZXJsaW5lLnopKSAqIHNtb290aHN0ZXAoLTAuMTUsIDAuNjUsIHdhc2gpO2ApO1xuICB9O1xuICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXk9KCk9PiAnc2VhLWh1bGwtd2F0ZXJsaW5lLXYxJztcbiAgY29uc3QgbWVzaD1uZXcgVEhSRUUuTWVzaChnZW9tZXRyeSxtYXRlcmlhbCk7XG4gIG1lc2gubmFtZT0nU2VhSHVsbFdhdGVybGluZSc7bWVzaC51c2VyRGF0YS5yZW5kZXJPbmx5PXRydWU7XG4gIG1lc2gucmVuZGVyT3JkZXI9UmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscyswLjE7XG4gIHJldHVybiBtZXNoO1xufVxuXG5mdW5jdGlvbiBtb3VudFNjdWxwdFdhdGVyKGhvc3Q6IEhvc3QsIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlciwgYm91bmRzOiBUSFJFRS5Cb3gzKTogU2N1bHB0V2F0ZXIgfCB1bmRlZmluZWQge1xuICBjb25zdCBjb250cmFjdCA9IFJFR0lTVFJZW2hvc3QuY29udHJhY3RJZF0/LmNvbnRyYWN0O1xuICBjb25zdCBzZWEgPSBjb250cmFjdD8ud2F0ZXJTdXJmYWNlPy5vd25lciA9PT0gJ3J1bnRpbWUgRGVlcHdhdGVyQ2xhaW1UaWxlJ1xuICAgICYmIGNvbnRyYWN0LndhdGVyU3VyZmFjZS5pbmNsdWRlZEluVGVycmFpbkdMQiA9PT0gZmFsc2U7XG4gIGNvbnN0IHN0aWxsd2F0ZXIgPSBob3N0LmNvbnRyYWN0SWQgPT09ICdlNS1zdGlsbHdhdGVyJztcbiAgY29uc3QgZHJlc3NpbmcgPSBzZWEgPyBERUVQV0FURVJfU0VBX0RSRVNTSU5HIDogU0NVTFBUX1dBVEVSX0RSRVNTSU5HW2hvc3QuY29udHJhY3RJZF07XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIWRyZXNzaW5nIHx8ICghc2VhICYmICFUZXJyYWluLmhhc1JpdmVyV2F0ZXIoKSkpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IHJpdmVyID0gc2VhID8geyBtaW5aOiBib3VuZHMubWluLnosIG1heFo6IGJvdW5kcy5tYXgueiB9IDogVGVycmFpbi5yaXZlckdlb21ldHJ5KCk7XG4gIGNvbnN0IGNlbnRlclogPSAocml2ZXIubWluWiArIHJpdmVyLm1heFopIC8gMjtcbiAgY29uc3Qgcml2ZXJIYWxmV2lkdGggPSAocml2ZXIubWF4WiAtIHJpdmVyLm1pblopIC8gMjtcbiAgY29uc3QgZm9yZHMgPSBzZWEgPyBbXSA6IFRlcnJhaW4uZm9yZFJhbmdlcygpO1xuICBjb25zdCBmb3JkSGFsZldpZHRoID0gZm9yZHMubGVuZ3RoID8gTWF0aC5tYXgoLi4uZm9yZHMubWFwKChyYW5nZSkgPT4gcmFuZ2UuaGFsZldpZHRoKSkgOiAzO1xuICBjb25zdCBmb3JkQ2VudGVycyA9IGZvcmRzLmxlbmd0aCA/IGZvcmRzLm1hcCgocmFuZ2UpID0+IHJhbmdlLmNlbnRlclgpIDogWzBdO1xuICBjb25zdCBoYWxmWCA9IE1hdGgubWluKE1hdGguYWJzKGJvdW5kcy5taW4ueCksIE1hdGguYWJzKGJvdW5kcy5tYXgueCkpO1xuICBjb25zdCBzdXJmYWNlWSA9IGRyZXNzaW5nLnN1cmZhY2Uua2luZCA9PT0gJ3NlYS1sZXZlbCcgPyBkcmVzc2luZy5zdXJmYWNlLnlcbiAgICA6IGRyZXNzaW5nLnN1cmZhY2Uua2luZCA9PT0gJ2NoYW5uZWwtZmlsbCdcbiAgICAgID8gc2N1bHB0V2F0ZXJTdXJmYWNlWShoZWlnaHRBdCwgaGFsZlgsIGNlbnRlclosIGZvcmRzLCBkcmVzc2luZy5zdXJmYWNlLmZpbGwsIGRyZXNzaW5nLmZvcmRTa2ltKVxuICAgICAgOiBzY3VscHRXYXRlckZsb29yWShoZWlnaHRBdCwgaGFsZlgsIGNlbnRlclosIGRyZXNzaW5nLnN1cmZhY2UucXVhbnRpbGUsIGRyZXNzaW5nLnN1cmZhY2UuZHJvcCk7XG4gIGNvbnN0IHNlYVJhZGl1cyA9IFJFR0lTVFJZW2hvc3QuY29udHJhY3RJZF0/LnBhbm9yYW1hQ29udHJhY3QucHJvamVjdGlvbj8uc2t5UmluZ1JhZGl1c01ldGVycyA/PyBoYWxmWDtcbiAgY29uc3QgdmlzdWFsSGFsZldpZHRoID0gc2VhID8gc2VhUmFkaXVzIDogZHJlc3NpbmcudmlzdWFsSGFsZldpZHRoID8/IFRlcnJhaW4udmlzdWFsV2F0ZXJIYWxmV2lkdGgoKTtcbiAgY29uc3Qgb3ZlcmhhbmcgPSBzZWEgPyBNYXRoLm1heCgwLCBzZWFSYWRpdXMgLSBoYWxmWCkgOiBNYXRoLm1heCgwLCBkcmVzc2luZy5vdmVyaGFuZ01ldGVycyA/PyAwKTtcbiAgY29uc3Qgd2F0ZXIgPSBjcmVhdGVTY3VscHRXYXRlcih7XG4gICAgZm9yZDogZmFsc2UsXG4gICAgZGVwdGhUZXN0OiB0cnVlLFxuICAgIG9wZW5TZWE6IHNlYSxcbiAgICBoZWlnaHRBdDogc2VhID8gKHgsIHopID0+IHtcbiAgICAgIC8vIFRoZSBwYW5vcmFtYSdzIHN1Ym1lcmdlZCBhcHJvbiBpcyBzY2VuZXJ5LCBub3QgYW4gZXh0ZW5zaW9uIG9mIHRoZSBwbGF5YWJsZSBiZWQuXG4gICAgICBjb25zdCBvdXRzaWRlID0gTWF0aC5tYXgoMCwgTWF0aC5hYnMoeCkgLSBoYWxmWCwgTWF0aC5hYnMoeiAtIGNlbnRlclopIC0gcml2ZXJIYWxmV2lkdGgpO1xuICAgICAgcmV0dXJuIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhlaWdodEF0KHgsIHopLCBib3VuZHMubWluLnksIFRIUkVFLk1hdGhVdGlscy5zbW9vdGhzdGVwKG91dHNpZGUsIDAsIGhhbGZYKSk7XG4gICAgfSA6IGhlaWdodEF0LFxuICAgIGJlZDogZHJlc3NpbmcuYmVkLFxuICAgIGRlZXBNZXRlcnM6IGRyZXNzaW5nLmRlZXBNZXRlcnMsXG4gICAgc2hvcmVNZXRlcnM6IGRyZXNzaW5nLnNob3JlTWV0ZXJzLFxuICAgIGNvbG9yOiBzdGlsbHdhdGVyID8gJyNhNWM1ZDAnIDogZHJlc3NpbmcuY29sb3IsXG4gICAgb3BhY2l0eTogc3RpbGx3YXRlciA/IDAuNjIgOiBkcmVzc2luZy5vcGFjaXR5LFxuICAgIHJpcHBsZVN0cmVuZ3RoOiBzdGlsbHdhdGVyID8gMC4wNCA6IGRyZXNzaW5nLnJpcHBsZVN0cmVuZ3RoLFxuICAgIHJpcHBsZVNjYWxlOiBkcmVzc2luZy5yaXBwbGVTY2FsZSxcbiAgICB0ZXh0dXJlQmxlbmQ6IHN0aWxsd2F0ZXIgPyAwLjA2IDogZHJlc3NpbmcudGV4dHVyZUJsZW5kLFxuICAgIGZvcmRUaW50OiBkcmVzc2luZy5mb3JkVGludCxcbiAgICBzaG9yZUZhZGVNZXRlcnM6IGRyZXNzaW5nLnNob3JlRmFkZU1ldGVycyxcbiAgICBzdXJmYWNlTGlmdDogZHJlc3Npbmcuc3VyZmFjZUxpZnQsXG4gICAgZW1pc3NpdmU6IGRyZXNzaW5nLmVtaXNzaXZlLFxuICAgIGNlbnRlclosXG4gICAgc3VyZmFjZVksXG4gICAgaGFsZkxlbmd0aDogaGFsZlggKyBvdmVyaGFuZyxcbiAgICByaXZlckhhbGZXaWR0aDogc2VhID8gc2VhUmFkaXVzIDogcml2ZXJIYWxmV2lkdGgsXG4gICAgdmlzdWFsSGFsZldpZHRoLFxuICAgIGxlbmd0aEhhbGY6IGhhbGZYICsgb3ZlcmhhbmcsXG4gICAgZmFkZVN0YXJ0OiBzZWEgPyBzZWFSYWRpdXMgLSBTQ1VMUFRfV0FURVJfRURHRV9GQURFIDogb3ZlcmhhbmcgPiAwID8gaGFsZlggOiBNYXRoLm1heCgxLCBoYWxmWCAtIFNDVUxQVF9XQVRFUl9FREdFX0ZBREUpLFxuICAgIGZvcmRIYWxmV2lkdGgsXG4gICAgZm9yZENlbnRlcnMsXG4gICAgcml2ZXJEZXB0aDogVGVycmFpbi53YXRlckRlcHRoKCdyaXZlcicpLFxuICAgIGZvcmREZXB0aDogVGVycmFpbi53YXRlckRlcHRoKCdmb3JkJyksXG4gICAgd2FkZURlcHRoOiBCYWxhbmNlLnRlcnJhaW5TaW0ud2FkZURlcHRoLFxuICAgIGRlZXBEZXB0aDogQmFsYW5jZS50ZXJyYWluU2ltLmRlZXBEZXB0aCxcbiAgICAvLyBUaGUgZ29sZCBnbGludHMgYmVsb25nIG9uIHRoZSBzbHVpY2UgbGluZTogZWFjaCBoYXJ2ZXN0IGFuY2hvciBwdXNoZWQgdG8gaXRzXG4gICAgLy8gb3duIGJhbmsgbGlwLCBleGFjdGx5IGFzIHRoZSBwYWludGVkIHJpdmVyIHBsYWNlcyB0aGVtLlxuICAgIGFuY2hvcnM6IGRyZXNzaW5nLmdsaW50cyA9PT0gJ2hhcnZlc3QnXG4gICAgICA/IFRlcnJhaW4ubm9kZUFuY2hvcnMubWFwKChhbmNob3IpID0+ICh7XG4gICAgICAgIHg6IGFuY2hvci54LFxuICAgICAgICB6OiBhbmNob3IueiA8IGNlbnRlclogPyByaXZlci5taW5aICsgMC41NSA6IHJpdmVyLm1heFogLSAwLjU1LFxuICAgICAgfSkpXG4gICAgICA6IGRyZXNzaW5nLmdsaW50cy5tYXAoKHsgeCwgeiB9KSA9PiAoeyB4LCB6OiBjZW50ZXJaICsgeiB9KSksXG4gIH0pO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBjb25zdCBodWxsTmFtZXMgPSBzZWEgPyAoaG9zdC5jb250cmFjdElkID09PSAnZTUtZmxvdGlsbGEnXG4gICAgPyBbJ2tpdGNoZW4tc2NvdycsICd0dXJyZXQtcmFmdCcsICdzdGlsbC1yb29tLWJhcmdlJ10gOiBbJ0NsYWltQm9hdFZpZXcnXSkgOiBbXTtcbiAgY29uc3QgaHVsbENvbnRhY3RzOiBUSFJFRS5NZXNoW10gPSBbXTtcbiAgY29uc3QgZGlzcG9zZVdhdGVyID0gd2F0ZXIuZGlzcG9zZTtcbiAgd2F0ZXIuZGlzcG9zZSA9ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGNvbnRhY3Qgb2YgaHVsbENvbnRhY3RzKSB7XG4gICAgICBpZiAoIWNvbnRhY3QucGFyZW50KSBjb250aW51ZTsgLy8gVGhlIG93bmluZyBodWxsIG1heSBhbHJlYWR5IGhhdmUgZGlzcG9zZWQgaXRzIGNoaWxkcmVuLlxuICAgICAgY29udGFjdC5yZW1vdmVGcm9tUGFyZW50KCk7XG4gICAgICBkaXNwb3NlT2JqZWN0M0QoY29udGFjdCk7XG4gICAgfVxuICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SHVsbFdhdGVybGluZXM7XG4gICAgZGlzcG9zZVdhdGVyKCk7XG4gIH07XG4gIHdhdGVyLm1lc2gub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBmcmFtZSA9IHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lO1xuICAgIGlmIChmcmFtZSA9PT0gbGFzdEZyYW1lKSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEZyYW1lIDwgMCA/IDAgOiBNYXRoLm1pbihTQ1VMUFRfV0FURVJfTUFYX0RFTFRBLCBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpKTtcbiAgICBsYXN0RnJhbWUgPSBmcmFtZTtcbiAgICBsYXN0QXQgPSBub3c7XG4gICAgd2F0ZXIuYWR2YW5jZShkZWx0YSk7XG4gICAgLy8gQXR0YWNoIG9uY2UgdGhlIGFzeW5jaHJvbm91cyB2aXN1YWwgaHVsbCBhcnJpdmVzLiBUaGUgcGFyZW50J3MgZXhpc3RpbmcgdHJhbnNmb3JtIGFuZFxuICAgIC8vIHZpc2liaWxpdHkgY2FycnkgdGhlIGxpbmUgdGhyb3VnaCByZWFuY2hvcmluZy9sb3NzOyBubyBzaW11bGF0aW9uIHBvc2l0aW9uIGlzIGR1cGxpY2F0ZWQuXG4gICAgZm9yIChsZXQgaSA9IGh1bGxOYW1lcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3QgaHVsbCA9IGhvc3Quc2NlbmUuZ2V0T2JqZWN0QnlOYW1lKGh1bGxOYW1lc1tpXSEpO1xuICAgICAgaWYgKCFodWxsPy5jaGlsZHJlbi5sZW5ndGgpIGNvbnRpbnVlO1xuICAgICAgY29uc3QgY29udGFjdCA9IGNyZWF0ZUh1bGxXYXRlcmxpbmUoaHVsbCwgc3VyZmFjZVksXG4gICAgICAgICh3YXRlci5tZXNoLm1hdGVyaWFsIGFzIFRIUkVFLk1hdGVyaWFsKS51c2VyRGF0YS53YXRlclVuaWZvcm1zLnRpbWUgYXMgVEhSRUUuSVVuaWZvcm08bnVtYmVyPik7XG4gICAgICBodWxsTmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgaWYgKGNvbnRhY3QpIHsgaHVsbC5hZGQoY29udGFjdCk7IGh1bGxDb250YWN0cy5wdXNoKGNvbnRhY3QpOyB9XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SHVsbFdhdGVybGluZXMgPSBKU09OLnN0cmluZ2lmeShodWxsQ29udGFjdHMubWFwKG1lc2ggPT4gKHtcbiAgICAgICAgaHVsbDogbWVzaC5wYXJlbnQ/Lm5hbWUsIHRyaWFuZ2xlczogbWVzaC5nZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykuY291bnQgLyAzLFxuICAgICAgfSkpKTtcbiAgICB9XG4gIH07XG4gIGhvc3Quc2NlbmUuYWRkKHdhdGVyLm1lc2gpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXIgPSBzZWEgPyAnbGl2aW5nLXNlYS1xdWFkJyA6ICdsaXZpbmctd2F0ZXItcXVhZCc7XG4gIC8vIFRoZSBNT1VOVEVEIGhhbGYgd2lkdGgsIG5vdCB0aGUgdGlsZSdzIGRlY2xhcmF0aW9uIOKAlCBhIG1hcCB0aGF0IG5hcnJvd3MgaXRzIHF1YWQgaGFzIHRvIHNheSBzbyxcbiAgLy8gYW5kIGUyZS9zaG9yZS10cnV0aC5zcGVjLnRzJ3MgbGF3IGlzIFwibmV2ZXIgd2lkZXIgdGhhbiB0aGUgc2ltIGRlY2xhcmVzXCIsIHdoaWNoIG5hcnJvd2luZyBrZWVwcy5cbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVySGFsZldpZHRoID0gdmlzdWFsSGFsZldpZHRoLnRvRml4ZWQoMyk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTY3VscHRXYXRlclNpbUhhbGZXaWR0aCA9IChzZWEgPyByaXZlckhhbGZXaWR0aCA6IFRlcnJhaW4udmlzdWFsV2F0ZXJIYWxmV2lkdGgoKSkudG9GaXhlZCgzKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyWSA9IHN1cmZhY2VZLnRvRml4ZWQoNCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTY3VscHRXYXRlckdsaW50cyA9IFN0cmluZyh3YXRlci5tZXNoLm1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTWF0ZXJpYWxcbiAgICA/ICh3YXRlci5tZXNoLm1hdGVyaWFsLnVzZXJEYXRhLndhdGVyR2xpbnRzID8/IDApXG4gICAgOiAwKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyRGVlcGVzdCA9IHdhdGVyLmRlZXBlc3RNZXRlcnMudG9GaXhlZCgzKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyRm9yZHMgPSBmb3Jkcy5tYXAoKHJhbmdlKSA9PiBgJHtyYW5nZS5pZH1AJHtyYW5nZS5jZW50ZXJYfWApLmpvaW4oJywnKTtcbiAgcmV0dXJuIHdhdGVyO1xufVxuXG4vKiogRm9hbSBjb2xsYXJzIGdyb3VuZCB3YXRlci1tb3VudGVkIGxhbmRtYXJrcyB3aXRob3V0IGRyYXdpbmcgYSBkYXJrIHBvb2wgdW5kZXIgdGhlIHN1cmZhY2UuICovXG5mdW5jdGlvbiBtb3VudFdhdGVyQ29sbGFycyhcbiAgaG9zdDogSG9zdCxcbiAgbW91bnRzOiBSZWFkb25seUFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuICB3YXRlclk6IG51bWJlciB8IHVuZGVmaW5lZCxcbik6IFRIUkVFLkluc3RhbmNlZE1lc2ggfCB1bmRlZmluZWQge1xuICBjb25zdCBjb2xsYXJzID0gU0NVTFBUX1dBVEVSX0RSRVNTSU5HW2hvc3QuY29udHJhY3RJZF0/LmNvbGxhcnM7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIWNvbGxhcnM/Lmxlbmd0aCB8fCB3YXRlclkgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUmluZ0dlb21ldHJ5KDAuNCwgMSwgMzIsIDEpO1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCh7XG4gICAgY29sb3I6ICcjZWZlNmNkJyxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBvcGFjaXR5OiAwLjE0LFxuICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gIH0pO1xuICBjb25zdCByaW5nID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goZ2VvbWV0cnksIG1hdGVyaWFsLCBjb2xsYXJzLmxlbmd0aCk7XG4gIHJpbmcubmFtZSA9ICdUZXJyYWluM2RXYXRlckNvbGxhcnMnO1xuICByaW5nLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICByaW5nLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgcmluZy5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gIGNvbnN0IHBsYWNlciA9IG5ldyBUSFJFRS5PYmplY3QzRCgpO1xuICBsZXQgd3JpdHRlbiA9IDA7XG4gIGZvciAoY29uc3QgY29sbGFyIG9mIGNvbGxhcnMpIHtcbiAgICBjb25zdCBtb2RlbCA9IG1vdW50cy5maW5kKCh7IGlkIH0pID0+IGlkID09PSBjb2xsYXIubW91bnQpPy5tb2RlbDtcbiAgICBpZiAoIW1vZGVsKSBjb250aW51ZTtcbiAgICBwbGFjZXIucG9zaXRpb24uc2V0KG1vZGVsLnBvc2l0aW9uLngsIHdhdGVyWSArIDAuMDEyLCBtb2RlbC5wb3NpdGlvbi56KTtcbiAgICBwbGFjZXIucm90YXRpb24uc2V0KC1NYXRoLlBJIC8gMiwgMCwgMCk7XG4gICAgcGxhY2VyLnNjYWxlLnNldChjb2xsYXIucmFkaXVzLCBjb2xsYXIucmFkaXVzLCAxKTtcbiAgICBwbGFjZXIudXBkYXRlTWF0cml4KCk7XG4gICAgcmluZy5zZXRNYXRyaXhBdCh3cml0dGVuLCBwbGFjZXIubWF0cml4KTtcbiAgICB3cml0dGVuICs9IDE7XG4gIH1cbiAgcmluZy5jb3VudCA9IHdyaXR0ZW47XG4gIHJpbmcuaW5zdGFuY2VNYXRyaXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuICBpZiAoIXdyaXR0ZW4pIHtcbiAgICBnZW9tZXRyeS5kaXNwb3NlKCk7XG4gICAgbWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgaG9zdC5zY2VuZS5hZGQocmluZyk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RXYXRlckNvbGxhcnMgPSBTdHJpbmcod3JpdHRlbik7XG4gIHJldHVybiByaW5nO1xufVxuXG4vKipcbiAqIFU1IOKAlCBsaXZpbmcgYWlyIG92ZXIgdGhlIENsYWltLCBwbHVzIHRoZSBSdXNoJ3Mgb25lIHZpc2libGUgcmV3YXJkIG5vdGUuXG4gKlxuICogTW90ZXM6IGEgY2FwcGVkIGFkZGl0aXZlIHBvaW50IGZpZWxkIGRyaWZ0aW5nIGFsb25nIHRoZSBrZXkgbGlnaHQuIE9uZSBkcmF3IGNhbGwsXG4gKiBvbmUgYnVmZmVyLCBhbGwgbW90aW9uIGluIHRoZSB2ZXJ0ZXggc2hhZGVyLlxuICogRW1iZXI6IHdoaWxlIGEgcG9zdC1zZWN1cmUgUnVzaCBydW4gaXMgbGl2ZSwgdGhlIGNsYWltLXN0YWtlIG1vdW50IGdldHMgYSB3YXJtXG4gKiBsaWZ0IOKAlCB0aGUgbWFwIHNheXMgb3V0IGxvdWQgdGhhdCB0aGUgcGxheWVyIGNob3NlIHRvIHByZXNzIHRoZWlyIGx1Y2suIEl0IGlzXG4gKiBkcml2ZW4gZnJvbSBSdW5NYW5hZ2VyJ3Mgb3duIHJ1c2ggZmxhZyB0aHJvdWdoIHRoZSBob3N0LCBuZXZlciBpbmZlcnJlZC5cbiAqL1xuZnVuY3Rpb24gbW91bnRTdW5Nb3Rlcyhob3N0OiBIb3N0LCBib3VuZHM6IFRIUkVFLkJveDMpOiBTdW5Nb3RlcyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGRyZXNzaW5nID0gU1VOX01PVEVTW2hvc3QuY29udHJhY3RJZF07XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIWRyZXNzaW5nKSByZXR1cm4gdW5kZWZpbmVkO1xuICBjb25zdCBtb2JpbGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSA0MzA7XG4gIGNvbnN0IGxlYW4gPSBsZWRnZXJTdW5TaGFkb3dEaXJlY3Rpb24oKTtcbiAgY29uc3QgbW90ZXMgPSBjcmVhdGVTdW5Nb3Rlcyh7XG4gICAgY291bnQ6IG1vYmlsZSA/IE1hdGgucm91bmQoU1VOX01PVEVfQ0FQICogMC40NSkgOiBTVU5fTU9URV9DQVAsXG4gICAgaGFsZlg6IE1hdGgubWluKE1hdGguYWJzKGJvdW5kcy5taW4ueCksIE1hdGguYWJzKGJvdW5kcy5tYXgueCkpICogKGRyZXNzaW5nLmhhbGZYU2NhbGUgPz8gMC42MiksXG4gICAgaGFsZlo6IGRyZXNzaW5nLmhhbGZaLFxuICAgIGNlbnRlclo6IGRyZXNzaW5nLmNlbnRlclosXG4gICAgbWluWTogZHJlc3NpbmcubWluWSxcbiAgICBtYXhZOiBkcmVzc2luZy5tYXhZLFxuICAgIGRyaWZ0OiBuZXcgVEhSRUUuVmVjdG9yMihsZWFuLnggKiAwLjU1LCBsZWFuLnkgKiAwLjU1KSxcbiAgICBjb2xvcjogZHJlc3NpbmcuY29sb3IsXG4gICAgc2l6ZTogZHJlc3Npbmcuc2l6ZSxcbiAgICBzZWVkOiBkcmVzc2luZy5zZWVkLFxuICB9KTtcbiAgbGV0IGxhc3RGcmFtZSA9IC0xO1xuICBsZXQgbGFzdEF0ID0gMDtcbiAgbW90ZXMucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyKSA9PiB7XG4gICAgY29uc3QgZnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICBpZiAoZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgICBjb25zdCBkZWx0YSA9IGxhc3RGcmFtZSA8IDAgPyAwIDogTWF0aC5taW4oU0NVTFBUX1dBVEVSX01BWF9ERUxUQSwgTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KSk7XG4gICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgbGFzdEF0ID0gbm93O1xuICAgIG1vdGVzLmFkdmFuY2UoZGVsdGEpO1xuICB9O1xuICBob3N0LnNjZW5lLmFkZChtb3Rlcy5wb2ludHMpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TW90ZXMgPSBTdHJpbmcobW90ZXMuY291bnQpO1xuICByZXR1cm4gbW90ZXM7XG59XG5cbi8qKiBUcmVzdGxlIGdvcmdlIHdpc3BzIHBsdXMgY2FydC1sb2NhbCBzdGVhbSwgYm90aCBzaGVkIGJlZm9yZSBnYW1lcGxheSBWRlguICovXG5mdW5jdGlvbiBtb3VudENyb3NzaW5nQnJlYXRoKGhvc3Q6IEhvc3QsIHdhdGVyWTogbnVtYmVyIHwgdW5kZWZpbmVkKTogQ3Jvc3NpbmdCcmVhdGggfCB1bmRlZmluZWQge1xuICBjb25zdCBkcmVzc2luZyA9IENST1NTSU5HX0JSRUFUSF9DT05UUkFDVFNbaG9zdC5jb250cmFjdElkXTtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCAhZHJlc3NpbmcgfHwgd2F0ZXJZID09PSB1bmRlZmluZWQgfHwgcGVyZm9ybWFuY2VUaWVyRGlhZ25vc3RpY3MoKS50aWVyICE9PSAnZnVsbCcpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IHdpc3BzID0gY3JlYXRlU3VuTW90ZXMoe1xuICAgIGNvdW50OiBkcmVzc2luZy53aXNwcy5jb3VudCxcbiAgICBoYWxmWDogZHJlc3Npbmcud2lzcHMuaGFsZlgsXG4gICAgaGFsZlo6IGRyZXNzaW5nLndpc3BzLmhhbGZaLFxuICAgIGNlbnRlclo6IDAsXG4gICAgbWluWTogd2F0ZXJZICsgMC4wNCxcbiAgICBtYXhZOiB3YXRlclkgKyBkcmVzc2luZy53aXNwcy5saWZ0LFxuICAgIGRyaWZ0OiBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKSxcbiAgICByaXNlOiBkcmVzc2luZy53aXNwcy5yaXNlLFxuICAgIGNvbG9yOiBkcmVzc2luZy53aXNwcy5jb2xvcixcbiAgICBzaXplOiBkcmVzc2luZy53aXNwcy5zaXplLFxuICAgIHNlZWQ6IDB4N2U1MSxcbiAgfSk7XG4gIHdpc3BzLnBvaW50cy5uYW1lID0gJ1RyZXN0bGVHb3JnZVdpc3BzJztcbiAgbGV0IHBsdW1lOiBTdW5Nb3RlcyB8IHVuZGVmaW5lZDtcbiAgbGV0IGNhcnQ6IFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBjb25zdCBhZHZhbmNlID0gKHJlbmRlcmVyOiBUSFJFRS5XZWJHTFJlbmRlcmVyKSA9PiB7XG4gICAgY29uc3QgZnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICBpZiAoZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgICBjb25zdCBkZWx0YSA9IGxhc3RGcmFtZSA8IDAgPyAwIDogTWF0aC5taW4oU0NVTFBUX1dBVEVSX01BWF9ERUxUQSwgTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KSk7XG4gICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgbGFzdEF0ID0gbm93O1xuICAgIHdpc3BzLmFkdmFuY2UoZGVsdGEpO1xuICAgIHBsdW1lPy5hZHZhbmNlKGRlbHRhKTtcbiAgfTtcbiAgd2lzcHMucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gYWR2YW5jZTtcbiAgaG9zdC5zY2VuZS5hZGQod2lzcHMucG9pbnRzKTtcblxuICBsZXQgdGlja3MgPSAwO1xuICBjb25zdCBwb2xsID0gKCkgPT4ge1xuICAgIGlmICghd2lzcHMucG9pbnRzLnBhcmVudCkgcmV0dXJuO1xuICAgIGlmICh0aWNrcyAlIENST1NTSU5HX0JSRUFUSF9QT0xMX0ZSQU1FUyA9PT0gMCkge1xuICAgICAgY29uc3QgdmVyZGljdCA9IGhvc3QuZGV0YWlsQnVkZ2V0Py4oKSA/PyAwO1xuICAgICAgd2lzcHMucG9pbnRzLnZpc2libGUgPSB2ZXJkaWN0IDwgMTtcbiAgICAgIGlmICghY2FydCkge1xuICAgICAgICBjb25zdCBmb3VuZCA9IGhvc3Quc2NlbmUuZ2V0T2JqZWN0QnlOYW1lKCdPcmVDYXJ0Jyk7XG4gICAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICAgIGNhcnQgPSBmb3VuZDtcbiAgICAgICAgICBwbHVtZSA9IGNyZWF0ZVN1bk1vdGVzKHtcbiAgICAgICAgICAgIGNvdW50OiBkcmVzc2luZy5wbHVtZS5jb3VudCxcbiAgICAgICAgICAgIGhhbGZYOiBkcmVzc2luZy5wbHVtZS5yYWRpdXMsXG4gICAgICAgICAgICBoYWxmWjogZHJlc3NpbmcucGx1bWUucmFkaXVzLFxuICAgICAgICAgICAgY2VudGVyWjogMCxcbiAgICAgICAgICAgIG1pblk6IDEuNjUsXG4gICAgICAgICAgICBtYXhZOiAxLjY1ICsgZHJlc3NpbmcucGx1bWUuaGVpZ2h0LFxuICAgICAgICAgICAgZHJpZnQ6IG5ldyBUSFJFRS5WZWN0b3IyKDAsIDApLFxuICAgICAgICAgICAgcmlzZTogZHJlc3NpbmcucGx1bWUucmlzZSxcbiAgICAgICAgICAgIGNvbG9yOiBkcmVzc2luZy5wbHVtZS5jb2xvcixcbiAgICAgICAgICAgIHNpemU6IGRyZXNzaW5nLnBsdW1lLnNpemUsXG4gICAgICAgICAgICBzZWVkOiAweDJjMDcsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcGx1bWUucG9pbnRzLm5hbWUgPSAnVHJlc3RsZUNhcnRTdGVhbSc7XG4gICAgICAgICAgcGx1bWUucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gYWR2YW5jZTtcbiAgICAgICAgICBjYXJ0LmFkZChwbHVtZS5wb2ludHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocGx1bWUpIHBsdW1lLnBvaW50cy52aXNpYmxlID0gdmVyZGljdCA8IDI7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90R29yZ2VXaXNwcyA9IHdpc3BzLnBvaW50cy52aXNpYmxlID8gU3RyaW5nKGRyZXNzaW5nLndpc3BzLmNvdW50KSA6ICcwJztcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IHBsdW1lPy5wb2ludHMudmlzaWJsZSA/IFN0cmluZyhkcmVzc2luZy5wbHVtZS5jb3VudCkgOiAnMCc7XG4gICAgfVxuICAgIHRpY2tzICs9IDE7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICB9O1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RHb3JnZVdpc3BzID0gU3RyaW5nKGRyZXNzaW5nLndpc3BzLmNvdW50KTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gJzAnO1xuICByZXR1cm4ge1xuICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHdpc3BzLnBvaW50cyk7XG4gICAgICB3aXNwcy5kaXNwb3NlKCk7XG4gICAgICBwbHVtZT8ucG9pbnRzLnJlbW92ZUZyb21QYXJlbnQoKTtcbiAgICAgIHBsdW1lPy5kaXNwb3NlKCk7XG4gICAgICBwbHVtZSA9IHVuZGVmaW5lZDtcbiAgICAgIGNhcnQgPSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgfTtcbn1cblxuY29uc3QgU1RFQU1fV0lTUF9KT0lOVFMgPSBbJ2dhcmRlbi1wcmVzc3VyZS1tYW5pZm9sZCcsICd3ZXN0LXRlcnJhY2UtcGlwZS1oZWFkZXInLCAnZWFzdC10ZXJyYWNlLXBpcGUtaGVhZGVyJ107XG5jb25zdCBTVEVBTV9XSVNQX0NPVU5UID0gODtcbmNvbnN0IFNURUFNX1dJU1BfSE9UX0JPSUxFUlMgPSAyO1xuXG4vKiogUHJlc3N1cmUgR2FyZGVuIHN0ZWFtIGZvbGxvd3MgdGhlIHNhbWUgaG90LWJvaWxlciBjb3VudCBwdWJsaXNoZWQgYnkgaXRzIEhVRC4gKi9cbmZ1bmN0aW9uIG1vdW50U3RlYW1XaXNwcyhcbiAgaG9zdDogSG9zdCxcbiAgbW91bnRzOiBSZWFkb25seUFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuKTogU3VuTW90ZXNbXSB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgaG9zdC5jb250cmFjdElkICE9PSAnZTItcHJlc3N1cmUtZ2FyZGVuJyB8fCAhaG9zdC5ob3RCb2lsZXJzKSByZXR1cm4gW107XG4gIGNvbnN0IGJ1aWx0OiBTdW5Nb3Rlc1tdID0gW107XG4gIGZvciAoY29uc3QgaWQgb2YgU1RFQU1fV0lTUF9KT0lOVFMpIHtcbiAgICBjb25zdCBqb2ludCA9IG1vdW50cy5maW5kKChtb3VudCkgPT4gbW91bnQuaWQgPT09IGlkKT8ubW9kZWw7XG4gICAgaWYgKCFqb2ludCkgY29udGludWU7XG4gICAgY29uc3QgYmFzZSA9IGpvaW50LnBvc2l0aW9uLnk7XG4gICAgY29uc3Qgd2lzcHMgPSBjcmVhdGVTdW5Nb3Rlcyh7XG4gICAgICBjb3VudDogU1RFQU1fV0lTUF9DT1VOVCxcbiAgICAgIGhhbGZYOiAxLjM1LFxuICAgICAgaGFsZlo6IDEsXG4gICAgICBjZW50ZXJaOiBqb2ludC5wb3NpdGlvbi56LFxuICAgICAgbWluWTogYmFzZSArIDEuMSxcbiAgICAgIG1heFk6IGJhc2UgKyA0LjIsXG4gICAgICBkcmlmdDogbmV3IFRIUkVFLlZlY3RvcjIoMC4xOCwgMC4wNSksXG4gICAgICByaXNlOiAwLjQyLFxuICAgICAgY29sb3I6ICcjZjRmMmVjJyxcbiAgICAgIHNpemU6IDMuNCxcbiAgICAgIHNlZWQ6IDB4NzFjMCArIGlkLmxlbmd0aCxcbiAgICB9KTtcbiAgICB3aXNwcy5wb2ludHMubmFtZSA9IGAke2lkfS5TdGVhbVdpc3BzYDtcbiAgICB3aXNwcy5wb2ludHMucG9zaXRpb24ueCA9IGpvaW50LnBvc2l0aW9uLng7XG4gICAgd2lzcHMucG9pbnRzLnZpc2libGUgPSBmYWxzZTtcbiAgICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gICAgbGV0IGxhc3RBdCA9IDA7XG4gICAgd2lzcHMucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb25zdCBmcmFtZSA9IHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lO1xuICAgICAgaWYgKGZyYW1lID09PSBsYXN0RnJhbWUpIHJldHVybjtcbiAgICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgICAgIGNvbnN0IGRlbHRhID0gbGFzdEZyYW1lIDwgMCA/IDAgOiBNYXRoLm1pbihTQ1VMUFRfV0FURVJfTUFYX0RFTFRBLCBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpKTtcbiAgICAgIGxhc3RGcmFtZSA9IGZyYW1lO1xuICAgICAgbGFzdEF0ID0gbm93O1xuICAgICAgd2lzcHMuYWR2YW5jZShkZWx0YSk7XG4gICAgfTtcbiAgICBob3N0LnNjZW5lLmFkZCh3aXNwcy5wb2ludHMpO1xuICAgIGJ1aWx0LnB1c2god2lzcHMpO1xuICB9XG4gIGlmICghYnVpbHQubGVuZ3RoKSByZXR1cm4gYnVpbHQ7XG4gIGNvbnN0IHBvbGwgPSAoKSA9PiB7XG4gICAgaWYgKCFidWlsdFswXSEucG9pbnRzLnBhcmVudCkgcmV0dXJuO1xuICAgIGNvbnN0IGhvdCA9IChob3N0LmhvdEJvaWxlcnM/LigpID8/IDApID49IFNURUFNX1dJU1BfSE9UX0JPSUxFUlM7XG4gICAgZm9yIChjb25zdCB3aXNwcyBvZiBidWlsdCkgd2lzcHMucG9pbnRzLnZpc2libGUgPSBob3Q7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtV2lzcHMgPSBob3QgPyBTdHJpbmcoYnVpbHQubGVuZ3RoICogU1RFQU1fV0lTUF9DT1VOVCkgOiAnMCc7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICB9O1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbVdpc3BzID0gJzAnO1xuICByZXR1cm4gYnVpbHQ7XG59XG5cbi8qKlxuICogVTQg4oCUIG1vdW50IHRoZSBjb250cmFjdCdzIHN0ZWFtIGNvbHVtbihzKS5cbiAqXG4gKiBGVUxMIHRpZXIgb25seSwgYW5kIHJlZ2lzdGVyZWQgaW4gdGhlIE1RLTQgc2hlZCBvcmRlcjogdGhlIGZpZWxkIGdvZXMgaW52aXNpYmxlIChhbmQgdGhlcmVmb3JlXG4gKiBjb3N0cyBub3RoaW5nIGF0IGFsbCwgcmF0aGVyIHRoYW4gZmFkaW5nKSB0aGUgbW9tZW50IHRoZSBydW50aW1lIHA5NSB3YXRjaGRvZyByZXR1cm5zIGEgdmVyZGljdC5cbiAqIERlY29yYXRpb24gaXMgdGhlIGZpcnN0IHRoaW5nIHRoYXQgc2hvdWxkIGdvIGFuZCB0aGUgbGFzdCB0aGluZyB0aGF0IHNob3VsZCBhcmd1ZSBhYm91dCBpdC5cbiAqL1xuZnVuY3Rpb24gbW91bnRTdGVhbVBsdW1lKFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuKTogU3RlYW1QbHVtZSB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGFuY2hvcnMgPSBTVEVBTV9BTkNIT1JTW2hvc3QuY29udHJhY3RJZF07XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIWFuY2hvcnM/Lmxlbmd0aCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgaWYgKHBlcmZvcm1hbmNlVGllckRpYWdub3N0aWNzKCkudGllciAhPT0gJ2Z1bGwnKSB7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gJ3RpZXItd2l0aGhlbGQnO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgYm94ID0gbmV3IFRIUkVFLkJveDMoKTtcbiAgY29uc3QgZW1pdHRlcnMgPSBhbmNob3JzLmZsYXRNYXAoKGFuY2hvcikgPT4ge1xuICAgIGNvbnN0IG1vZGVsID0gbW91bnRzLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09IGFuY2hvci5tb3VudCk/Lm1vZGVsO1xuICAgIGlmICghbW9kZWwpIHJldHVybiBbXTtcbiAgICBib3guc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gICAgcmV0dXJuIFt7XG4gICAgICB4OiBUSFJFRS5NYXRoVXRpbHMubGVycChib3gubWluLngsIGJveC5tYXgueCwgYW5jaG9yLmFjcm9zc1gpLFxuICAgICAgeTogVEhSRUUuTWF0aFV0aWxzLmxlcnAoYm94Lm1pbi55LCBib3gubWF4LnksIGFuY2hvci51cFkpLFxuICAgICAgejogVEhSRUUuTWF0aFV0aWxzLmxlcnAoYm94Lm1pbi56LCBib3gubWF4LnosIGFuY2hvci5hY3Jvc3NaKSxcbiAgICAgIHJpc2U6IGFuY2hvci5yaXNlLFxuICAgICAgc3ByZWFkOiBhbmNob3Iuc3ByZWFkLFxuICAgICAgc2l6ZTogYW5jaG9yLnNpemUsXG4gICAgICBsaWZlOiBhbmNob3IubGlmZSxcbiAgICAgIHB1ZmZzOiBhbmNob3IucHVmZnMsXG4gICAgICBvcGFjaXR5OiBhbmNob3Iub3BhY2l0eSxcbiAgICB9XTtcbiAgfSk7XG4gIGlmICghZW1pdHRlcnMubGVuZ3RoKSB7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gJ25vLWFuY2hvci1ib2R5JztcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGNvbnN0IGxlYW4gPSBsZWRnZXJTdW5TaGFkb3dEaXJlY3Rpb24oKTtcbiAgY29uc3QgcGx1bWUgPSBjcmVhdGVTdGVhbVBsdW1lKHsgZW1pdHRlcnMsIHdpbmQ6IG5ldyBUSFJFRS5WZWN0b3IyKGxlYW4ueCwgbGVhbi55KSwgY29sb3I6IFNURUFNX0NPTE9VUiwgc2VlZDogMHg1N2VhIH0pO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBwbHVtZS5wb2ludHMub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIpID0+IHtcbiAgICBjb25zdCBmcmFtZSA9IHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lO1xuICAgIGlmIChmcmFtZSA9PT0gbGFzdEZyYW1lKSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEZyYW1lIDwgMCA/IDAgOiBNYXRoLm1pbihTQ1VMUFRfV0FURVJfTUFYX0RFTFRBLCBNYXRoLm1heCgwLCBub3cgLSBsYXN0QXQpKTtcbiAgICBsYXN0RnJhbWUgPSBmcmFtZTtcbiAgICBsYXN0QXQgPSBub3c7XG4gICAgcGx1bWUuYWR2YW5jZShkZWx0YSk7XG4gIH07XG4gIC8vIFBvbGxlZCBvbiB0aGUgZnJhbWUgQkVGT1JFIHRoZSBkcmF3LCBleGFjdGx5IGFzIHRoZSBSdXNoIGVtYmVycyBhcmUsIHNvIGEgc2hlZCBmaWVsZCBzdG9wc1xuICAvLyBjb3N0aW5nIGFueXRoaW5nIHJhdGhlciB0aGFuIGZhZGluZyBvdXQgb3ZlciBzZWNvbmRzLlxuICBjb25zdCBwb2xsID0gKCkgPT4ge1xuICAgIGlmICghcGx1bWUucG9pbnRzLnBhcmVudCkgcmV0dXJuO1xuICAgIGNvbnN0IHNoZWQgPSAoaG9zdC5kZXRhaWxCdWRnZXQ/LigpID8/IDApID49IDE7XG4gICAgcGx1bWUucG9pbnRzLnZpc2libGUgPSAhc2hlZDtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW0gPSBzaGVkID8gJ3NoZWQnIDogYCR7ZW1pdHRlcnMubGVuZ3RofXgke3BsdW1lLmNvdW50fWA7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICB9O1xuICBob3N0LnNjZW5lLmFkZChwbHVtZS5wb2ludHMpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IGAke2VtaXR0ZXJzLmxlbmd0aH14JHtwbHVtZS5jb3VudH1gO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW1BbmNob3JzID0gSlNPTi5zdHJpbmdpZnkoZW1pdHRlcnMubWFwKChlbWl0dGVyKSA9PiAoe1xuICAgIHg6ICtlbWl0dGVyLngudG9GaXhlZCgyKSxcbiAgICB5OiArZW1pdHRlci55LnRvRml4ZWQoMiksXG4gICAgejogK2VtaXR0ZXIuei50b0ZpeGVkKDIpLFxuICB9KSkpO1xuICByZXR1cm4gcGx1bWU7XG59XG5cbi8qKiBJbmNsaW5lIGNhcnQtc3RhY2sgYW5kIHdpbmNoLWVuZCBzdGVhbTsgY2FwcGVkIGFuZCBzaGVkIGJlZm9yZSBnYW1lcGxheSBWRlguICovXG5mdW5jdGlvbiBtb3VudEhhdWxTdGVhbShcbiAgaG9zdDogSG9zdCxcbiAgaGVpZ2h0QXQ6ICh4OiBudW1iZXIsIHo6IG51bWJlcikgPT4gbnVtYmVyLFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuKTogSGF1bFN0ZWFtIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSB8fCBob3N0LmNvbnRyYWN0SWQgIT09ICdlMi1pbmNsaW5lJykgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgYXQgPSAoaWQ6IHN0cmluZyk6IFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkID0+IG1vdW50cy5maW5kKChtb3VudCkgPT4gbW91bnQuaWQgPT09IGlkKT8ubW9kZWw7XG4gIGNvbnN0IGNhYmxlSG91c2UgPSBhdCgndXBwZXItb3JlLWNhYmxlLWhvdXNlJyk7XG4gIGNvbnN0IGNyYW5lID0gYXQoJ2xvd2VyLXlhcmQtZW5naW5lLWNyYW5lJyk7XG4gIGNvbnN0IHZlbnRzOiBIYXVsVmVudFtdID0gW3tcbiAgICBpZDogJ2VzY29ydC1jYXJ0JywgeDogMCwgejogMCwgeTogMi4yLCByaWRlczogdHJ1ZSxcbiAgICBpbnRlcnZhbDogMC42MiwgcGhhc2U6IDAsIGxpZmU6IDIuNCwgcmlzZTogMi4xLCByYWRpdXM6IDIuOSwgZ3JvdzogMS42LFxuICAgIGRyaWZ0OiBbLTAuMzUsIC0wLjE1XSwgc2xvdHM6IDMsXG4gIH1dO1xuICBpZiAoY2FibGVIb3VzZSkgdmVudHMucHVzaCh7XG4gICAgaWQ6ICdjYWJsZS1ob3VzZScsIHg6IGNhYmxlSG91c2UucG9zaXRpb24ueCAtIDAuNiwgejogY2FibGVIb3VzZS5wb3NpdGlvbi56IC0gMS40LCB5OiA1LFxuICAgIGludGVydmFsOiAxLjUsIHBoYXNlOiAwLjQsIGxpZmU6IDMuMiwgcmlzZTogMS4zLCByYWRpdXM6IDMuNiwgZ3JvdzogMS45LFxuICAgIGRyaWZ0OiBbLTAuNCwgLTAuMl0sIHNsb3RzOiAzLFxuICB9KTtcbiAgaWYgKGNyYW5lKSB2ZW50cy5wdXNoKHtcbiAgICBpZDogJ2VuZ2luZS1jcmFuZScsIHg6IGNyYW5lLnBvc2l0aW9uLnggKyAwLjQsIHo6IGNyYW5lLnBvc2l0aW9uLnogLSAxLCB5OiAzLjYsXG4gICAgaW50ZXJ2YWw6IDIuMSwgcGhhc2U6IDEuMSwgbGlmZTogMi44LCByaXNlOiAxLjA1LCByYWRpdXM6IDIuNywgZ3JvdzogMS43LFxuICAgIGRyaWZ0OiBbLTAuMywgLTAuMTJdLCBzbG90czogMixcbiAgfSk7XG4gIGlmICh2ZW50cy5sZW5ndGggPCAyKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IHN0ZWFtID0gY3JlYXRlSGF1bFN0ZWFtKHZlbnRzLCBoZWlnaHRBdCk7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBsZXQgc2hlZENoZWNrZWQgPSAwO1xuICBjb25zdCBwb2xsID0gKCkgPT4ge1xuICAgIGlmICghc3RlYW0uZ3JvdXAucGFyZW50KSByZXR1cm47XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICAgIGNvbnN0IGRlbHRhID0gbGFzdEF0ID09PSAwID8gMCA6IE1hdGgubWluKFNDVUxQVF9XQVRFUl9NQVhfREVMVEEsIE1hdGgubWF4KDAsIG5vdyAtIGxhc3RBdCkpO1xuICAgIGxhc3RBdCA9IG5vdztcbiAgICBpZiAobm93IC0gc2hlZENoZWNrZWQgPiAwLjUpIHtcbiAgICAgIHNoZWRDaGVja2VkID0gbm93O1xuICAgICAgc3RlYW0uc2V0RGV0YWlsQnVkZ2V0KGhvc3QuZGV0YWlsQnVkZ2V0Py4oKSA/PyAwKTtcbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzID0gc3RlYW0uZGlhZ25vc3RpY3MoKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1BY3RpdmUgPSBTdHJpbmcoZGlhZ25vc3RpY3MuYWN0aXZlKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1TcGF3bmVkID0gU3RyaW5nKGRpYWdub3N0aWNzLnNwYXduZWQpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhhdWxTdGVhbURldGFpbCA9IFN0cmluZyhkaWFnbm9zdGljcy5kZXRhaWwpO1xuICAgIH1cbiAgICBzdGVhbS5hZHZhbmNlKGRlbHRhLCBob3N0LmhhdWxDYXJ0Py4oKSk7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBvbGwpO1xuICB9O1xuICBob3N0LnNjZW5lLmFkZChzdGVhbS5ncm91cCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShwb2xsKTtcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhhdWxTdGVhbSA9IFN0cmluZyh2ZW50cy5sZW5ndGgpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtQ2FwYWNpdHkgPSBTdHJpbmcodmVudHMucmVkdWNlKCh0b3RhbCwgdmVudCkgPT4gdG90YWwgKyB2ZW50LnNsb3RzLCAwKSk7XG4gIHJldHVybiBzdGVhbTtcbn1cblxuLyoqXG4gKiBVNWIg4oCUIHRoZSBSdXNoJ3MgcmV3YXJkIG5vdGU6IGEgd2FybSBlbWJlciBsaWZ0IG9mZiB0aGUgY2xhaW0tc3Rha2UgcmluZywgbGl2ZVxuICogb25seSB3aGlsZSB0aGUgcGxheWVyIGhhcyBjaG9zZW4gdG8gcHJlc3MgdGhlaXIgbHVjay4gU2FtZSBwb2ludCBmaWVsZCBhcyB0aGVcbiAqIG1vdGVzLCBvbmUgZHJhdyBjYWxsLCBoaWRkZW4gKGFuZCB0aGVyZWZvcmUgbmVhci1mcmVlKSB0aGUgcmVzdCBvZiB0aGUgdGltZS5cbiAqL1xuZnVuY3Rpb24gbW91bnRSdXNoRW1iZXJzKFxuICBob3N0OiBIb3N0LFxuICBtb3VudHM6IEFycmF5PHsgaWQ6IHN0cmluZzsgbW9kZWw6IFRIUkVFLk9iamVjdDNEIH0+LFxuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsXG4pOiBTdW5Nb3RlcyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgIVJVU0hfRU1CRVJfQ09OVFJBQ1RTLmhhcyhob3N0LmNvbnRyYWN0SWQpIHx8ICFob3N0LnJ1c2hBY3RpdmUpIHJldHVybiB1bmRlZmluZWQ7XG4gIGNvbnN0IHN0YWtlID0gbW91bnRzLmZpbmQoKHsgaWQgfSkgPT4gaWQgPT09ICdjbGFpbV9zdGFrZScpPy5tb2RlbDtcbiAgaWYgKCFzdGFrZSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgZW1iZXJzID0gY3JlYXRlU3VuTW90ZXMoe1xuICAgIGNvdW50OiBSVVNIX0VNQkVSX0NPVU5ULFxuICAgIGhhbGZYOiAxLjE1LFxuICAgIGhhbGZaOiAxLjE1LFxuICAgIGNlbnRlclo6IHN0YWtlLnBvc2l0aW9uLnosXG4gICAgbWluWTogaGVpZ2h0QXQoc3Rha2UucG9zaXRpb24ueCwgc3Rha2UucG9zaXRpb24ueikgKyAwLjE1LFxuICAgIG1heFk6IGhlaWdodEF0KHN0YWtlLnBvc2l0aW9uLngsIHN0YWtlLnBvc2l0aW9uLnopICsgMi43LFxuICAgIGRyaWZ0OiBuZXcgVEhSRUUuVmVjdG9yMigwLCAwKSxcbiAgICByaXNlOiAwLjU1LFxuICAgIGNvbG9yOiAnI2ZmOWEzYycsXG4gICAgc2l6ZTogMi40LFxuICAgIHNlZWQ6IDB4NTcxNSxcbiAgfSk7XG4gIGVtYmVycy5wb2ludHMubmFtZSA9ICdDbGFpbVN0YWtlUnVzaEVtYmVycyc7XG4gIGVtYmVycy5wb2ludHMucG9zaXRpb24ueCA9IHN0YWtlLnBvc2l0aW9uLng7XG4gIGVtYmVycy5wb2ludHMudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIGxldCBsYXN0QXQgPSAwO1xuICBlbWJlcnMucG9pbnRzLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyKSA9PiB7XG4gICAgY29uc3QgZnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICBpZiAoZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAgICBjb25zdCBkZWx0YSA9IGxhc3RGcmFtZSA8IDAgPyAwIDogTWF0aC5taW4oU0NVTFBUX1dBVEVSX01BWF9ERUxUQSwgTWF0aC5tYXgoMCwgbm93IC0gbGFzdEF0KSk7XG4gICAgbGFzdEZyYW1lID0gZnJhbWU7XG4gICAgbGFzdEF0ID0gbm93O1xuICAgIGVtYmVycy5hZHZhbmNlKGRlbHRhKTtcbiAgfTtcbiAgLy8gdmlzaWJsZSBpcyBwb2xsZWQgb2ZmIHRoZSBydW4gc3RhdGUgb24gdGhlIGZyYW1lIEJFRk9SRSB0aGUgZHJhdywgc28gYW4gZW5kZWRcbiAgLy8gUnVzaCBzdG9wcyBjb3N0aW5nIGFueXRoaW5nIGF0IGFsbCByYXRoZXIgdGhhbiBmYWRpbmcgb3V0IG92ZXIgc2Vjb25kcy5cbiAgY29uc3QgcG9sbCA9ICgpID0+IHtcbiAgICBpZiAoIWVtYmVycy5wb2ludHMucGFyZW50KSByZXR1cm47XG4gICAgZW1iZXJzLnBvaW50cy52aXNpYmxlID0gaG9zdC5ydXNoQWN0aXZlPy4oKSA9PT0gdHJ1ZTtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UnVzaEVtYmVycyA9IGVtYmVycy5wb2ludHMudmlzaWJsZSA/IFN0cmluZyhSVVNIX0VNQkVSX0NPVU5UKSA6ICcwJztcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIH07XG4gIGhvc3Quc2NlbmUuYWRkKGVtYmVycy5wb2ludHMpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocG9sbCk7XG4gIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RSdXNoRW1iZXJzID0gJzAnO1xuICByZXR1cm4gZW1iZXJzO1xufVxuXG4vKipcbiAqIERyeSBHdWxjaCBtb3VudHMgYSBMSVZFIHBvb2wgb3ZlciB0aGUgaXNvbGF0ZWRfc3ByaW5nLCBzbyB0aGF0IGxhbmRtYXJrJ3MgYmFrZWQgY3lhbiB3YXRlciBtdXN0XG4gKiBzdG9wIGdsb3dpbmcgYXQgZW1pc3NpdmUgMyDigJQgYSBmdWxsLWJyaWdodCBwb29sIGJlZCBzaGluZXMgdGhyb3VnaCB0aGUgc3VyZmFjZSBhYm92ZSBpdCBhbmQgdGhlXG4gKiBtYXAga2VlcHMgaXRzIGRlYWQtcGFpbnQgc211ZGdlLiBUaGUgcGFjayBpcyBvbmUgbWVzaCBvbiBvbmUgbWF0ZXJpYWwgKHBhY2sgbGF3KSwgc28gdGhlIHBvb2xcbiAqIGNhbm5vdCBiZSBkaW1tZWQgc2VwYXJhdGVseSBmcm9tIGl0cyBzdG9uZXMsIGFuZCBkcm9wcGluZyB0aGUgd2hvbGUgYm9keSBmYXIgZW5vdWdoIHRvIGtpbGwgdGhlXG4gKiBjeWFuIGFsc28ga2lsbGVkIHRoZSBzdG9uZSByaW5nLiAyLjEgaXMgd2hlcmUgdGhlIHR3byBsYW5kIHRvZ2V0aGVyOiBtZWFzdXJlZCwgdGhlIGxpdmUgc3VyZmFjZVxuICogYWxyZWFkeSBjb3ZlcnMgdGhlIGZsYXQgY2FwIGF0IGFscGhhIDAuODgtMC45ODUsIHNvIHRoZSByZXNpZHVhbCBjeWFuIGhhcyBub3doZXJlIHRvIHNob3csIHdoaWxlXG4gKiB0aGUgc3RvbmVzIOKAlCB3aGljaCBzdGFuZCBBQk9WRSB0aGUgd2F0ZXIgcGxhbmUgYW5kIGFyZSBuZXZlciBjb3ZlcmVkIOKAlCBrZWVwIHRoZWlyIHBhbGUgcmltIHJlYWQuXG4gKi9cbmNvbnN0IERSWV9HVUxDSF9TUFJJTkdfRU1JU1NJVkUgPSAyLjE7XG5cbi8qKiBXYXRlciBzaXRzIHdpdGhpbiB0aGUgc2N1bHB0ZWQgc3ByaW5nIGJlZDsgaXRzIHJhZGl1cyByZW1haW5zIHNpbXVsYXRpb24tb3duZWQuICovXG50eXBlIExpdmVTcHJpbmdQb29sID0geyBzdXJmYWNlWTogbnVtYmVyIH07XG5jb25zdCBMSVZFX1NQUklOR19QT05EX0NPTlRSQUNUUyA9IG5ldyBNYXA8c3RyaW5nLCBMaXZlU3ByaW5nUG9vbD4oW1xuICBbJ2UxLWRyeS1ndWxjaCcsIHsgc3VyZmFjZVk6IDAuMTkgfV0sXG5dKTtcblxuLyoqXG4gKiBUSEUgUE9PTCBHUkFERSAoRi1CRUFVVFktMiwgcmV2aWV3cy9iZWF1dHktcG9vbHMubWQpIOKAlCBhIHByZS10b25lbWFwIGdyYWRlICsgZXhwb3N1cmUgc2hvdWxkZXJcbiAqIGZvciB0aGUgd2FybSBuaWdodCBwb29scywgb24gdGhlIHRlcnJhaW4gZnJhZ21lbnQgb25seSwgcmlnaHQgYmVmb3JlIEFDRVMgc2VlcyBpdC5cbiAqXG4gKiBNZWFzdXJlZCBtZWNoYW5pc20gKHRyYW5zZWN0IHJpZywgZTJlL2JlYXV0eS1wb29scy5zcGVjLnRzKTogdGhlIHdhcm0gcG9vbCBncm91bmQgaXMgYWxyZWFkeVxuICogYW1iZXIgaW4gaXNvbGF0aW9uIChzYXQgMC41Mi0wLjYzIGF0IGh1ZSB+NDAgZGVnKSwgYW5kIHdhcm0rd2FybSBvdmVybGFwIHN0YXlzIGFtYmVyIOKAlCBidXQgdGhlXG4gKiBoZXJvJ3MvcHJvc3BlY3RvcidzIGNvb2wgbGlnaHQgc3RhbmRpbmcgaW4gYSBwb29sIGNvbGxhcHNlcyB0aGUgc2FtZSBwaXhlbHMgdG8gc2F0IH4wLjIwIGF0XG4gKiBodWUgfjE0IGRlZywgYSBwYWxlIGh1ZWxlc3MgZGlzYyBleGFjdGx5IHdoZXJlIHRoZSBwbGF5ZXIgbG9va3MuIEFuIGFkZGl0aXZlIGh1ZSBzaGlmdCBjYW5ub3RcbiAqIGJlIHVuZG9uZSBieSBhbnkgbHVtaW5hbmNlIGN1cnZlLCBzbyB0aGUgc2VhbSBoYXMgdHdvIHBhcnRzOlxuICogIDEuIHJlLWFuY2hvciB0aGUgZnJhZ21lbnQncyBjaHJvbWEgdG93YXJkIHRoZSBwb29sJ3Mgb3duIHdhcm0gYXhpcyBhdCBQUkVTRVJWRUQgbHVtYSDigJQgdGhlXG4gKiAgICAgZ3JvdW5kIHVuZGVyIGEgbGFudGVybiBiZWxvbmdzIHRvIHRoZSBsYW50ZXJuOyBmaWd1cmVzIGFib3ZlIGl0IGtlZXAgdGhlIGNvb2wgbGlnaHQ7XG4gKiAgMi4gYSBodWUtcHJlc2VydmluZyBSZWluaGFyZCBzaG91bGRlciBvbiB0aGUgcHJlLXRvbmVtYXAgbWF4IGNoYW5uZWwgKGtuZWUgLT4gY2VpbGluZyksIHRoZVxuICogICAgIHBvb2wncyBvd24gZXhwb3N1cmUgdHJlYXRtZW50LCBzbyBhbnkgb3Zlci1yYW5nZSBzdW0gcm9sbHMgb2ZmIGJlZm9yZSBBQ0VTIGNhbiBibGVhY2ggaXQuXG4gKiBCb3RoIHNjYWxlIHdpdGggd2FybS1wb29sIGNvdmVyYWdlIHggZGFya25lc3M6IHplcm8gYXQgZGF5LCB6ZXJvIG91dHNpZGUgcG9vbHMsIHplcm8gb24gY29vbFxuICogcG9vbHMsIGFuZCB0aGUgd2hvbGUgYmxvY2sgaXMgY29tcGlsZWQgb3V0IHVuZGVyID9ub3Bvb2xncmFkZSAoYnl0ZS1pZGVudGljYWwgc2hhZGVyIGNvbnRyb2wpLlxuICovXG5jb25zdCBQT09MX0dSQURFX0dMU0wgPSBgXG5mbG9hdCB0ZXJyYWluM2RHcmFkZUFtb3VudCA9IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZVN0cmVuZ3RoICogdGVycmFpbjNkUG9vbEdyYWRlTWFzayAqIHVUZXJyYWluM2ROaWdodFBvb2xEYXJrbmVzcztcbmlmICh0ZXJyYWluM2RHcmFkZUFtb3VudCA+IDAuMDAxKSB7XG4gIHZlYzMgdGVycmFpbjNkR3JhZGVMdW1hVyA9IHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMik7XG4gIGZsb2F0IHRlcnJhaW4zZEdyYWRlTHVtYSA9IGRvdChvdXRnb2luZ0xpZ2h0LCB0ZXJyYWluM2RHcmFkZUx1bWFXKTtcbiAgdmVjMyB0ZXJyYWluM2RHcmFkZUFuY2hvciA9IHRlcnJhaW4zZFBvb2xHcmFkZVRpbnRcbiAgICAqICh0ZXJyYWluM2RHcmFkZUx1bWEgLyBtYXgoZG90KHRlcnJhaW4zZFBvb2xHcmFkZVRpbnQsIHRlcnJhaW4zZEdyYWRlTHVtYVcpLCAxZS00KSk7XG4gIHZlYzMgdGVycmFpbjNkR3JhZGVkID0gbWl4KG91dGdvaW5nTGlnaHQsIHRlcnJhaW4zZEdyYWRlQW5jaG9yLCB0ZXJyYWluM2RHcmFkZUFtb3VudCk7XG4gIGZsb2F0IHRlcnJhaW4zZEdyYWRlTWF4ID0gbWF4KHRlcnJhaW4zZEdyYWRlZC5yLCBtYXgodGVycmFpbjNkR3JhZGVkLmcsIHRlcnJhaW4zZEdyYWRlZC5iKSk7XG4gIGlmICh0ZXJyYWluM2RHcmFkZU1heCA+IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUpIHtcbiAgICBmbG9hdCB0ZXJyYWluM2RHcmFkZUNvbXByZXNzZWQgPSB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVLbmVlXG4gICAgICArICh0ZXJyYWluM2RHcmFkZU1heCAtIHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUpXG4gICAgICAvICgxLjAgKyAodGVycmFpbjNkR3JhZGVNYXggLSB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVLbmVlKVxuICAgICAgICAvIG1heCh1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVDZWlsaW5nIC0gdVRlcnJhaW4zZE5pZ2h0UG9vbEdyYWRlS25lZSwgMWUtMykpO1xuICAgIHRlcnJhaW4zZEdyYWRlZCAqPSB0ZXJyYWluM2RHcmFkZUNvbXByZXNzZWQgLyB0ZXJyYWluM2RHcmFkZU1heDtcbiAgfVxuICBvdXRnb2luZ0xpZ2h0ID0gdGVycmFpbjNkR3JhZGVkO1xufVxuYDtcblxuZnVuY3Rpb24gaGlkZVBhaW50ZWRHcm91bmQoaG9zdDogSG9zdCk6IEhpZGRlblJlbGllZltdIHsgcmV0dXJuIGhpZGVQYWludGVkUmVsaWVmKGhvc3QpOyB9XG4vKiogUXVpZXQgdGhlIHdvcmtlZCBiYW5rIHNoZWx2ZXMgd2hpbGUgcmV0YWluaW5nIHRoZSBhdXRob3JlZCB3ZXQgbGlwcyBhbmQgdGlsZSBlZGdlLiAqL1xuZnVuY3Rpb24gY2FsbVR3aW5CYW5rc0dyb3VuZChtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiBtZXNoLm1hdGVyaWFsLm1hcCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy50d2luQmFua3NEcnlQaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYWQ5YzdiJykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2VHdpbkJhbmtzV29ybGQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudlR3aW5CYW5rc1dvcmxkID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUd2luQmFua3NXb3JsZDtcXG51bmlmb3JtIHZlYzMgdHdpbkJhbmtzRHJ5UGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IHR3aW5CYW5rc1NvdXRoID0gMS4wIC0gc21vb3Roc3RlcCgwLjQ1LCAxLjY1LCBsZW5ndGgoKHZUd2luQmFua3NXb3JsZCAtIHZlYzIoLTEzLjAsIC0xNC4wKSkgLyB2ZWMyKDEzLjAsIDguMCkpKTtcbmZsb2F0IHR3aW5CYW5rc05vcnRoID0gMS4wIC0gc21vb3Roc3RlcCgwLjQ1LCAxLjY1LCBsZW5ndGgoKHZUd2luQmFua3NXb3JsZCAtIHZlYzIoMTMuNSwgMTQuMikpIC8gdmVjMigxMy4wLCA4LjApKSk7XG5mbG9hdCB0d2luQmFua3NEcnkgPSBzbW9vdGhzdGVwKDYuMCwgMTAuMCwgYWJzKHZUd2luQmFua3NXb3JsZC55KSk7XG5mbG9hdCB0d2luQmFua3NFZGdlID0gMS4wIC0gc21vb3Roc3RlcCgyNC4wLCAzMS4wLCBtYXgoYWJzKHZUd2luQmFua3NXb3JsZC54KSwgYWJzKHZUd2luQmFua3NXb3JsZC55KSkpO1xuZmxvYXQgdHdpbkJhbmtzUXVpZXQgPSBtaXgoMC4yMCwgMC40OCwgbWF4KHR3aW5CYW5rc1NvdXRoLCB0d2luQmFua3NOb3J0aCkpICogdHdpbkJhbmtzRHJ5ICogdHdpbkJhbmtzRWRnZTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgdHdpbkJhbmtzRHJ5UGlnbWVudCwgdHdpbkJhbmtzUXVpZXQpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ3R3aW4tYmFua3MtZHJ5LWJhbmstcGlnbWVudC12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBMaWZ0IG9ubHkgdGhlIGRlZXBlc3QgcGFpbnRlZCBzY29yY2ggcGlnbWVudCwgcmV0YWluaW5nIGl0cyBlZGdlcyBhbmQgZ3JpdC4gKi9cbmZ1bmN0aW9uIHNlcGFyYXRlQmFyb25Hcm91bmRTY2Fycyhtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiBtZXNoLm1hdGVyaWFsLm1hcCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5iYXJvbldhcm1QaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjNzc2MTRjJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5iYXJvbkNvbGRQaWdtZW50ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjNjI3MDc4JykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2QmFyb25Hcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkJhcm9uR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZCYXJvbkdyb3VuZDtcXG51bmlmb3JtIHZlYzMgYmFyb25XYXJtUGlnbWVudDtcXG51bmlmb3JtIHZlYzMgYmFyb25Db2xkUGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGJhcm9uSW5rID0gMS4wIC0gc21vb3Roc3RlcCgwLjAxOCwgMC4wOSwgZG90KGRpZmZ1c2VDb2xvci5yZ2IsIHZlYzMoMC4yMTI2LCAwLjcxNTIsIDAuMDcyMikpKTtcbmZsb2F0IGJhcm9uRHJ5ID0gc21vb3Roc3RlcCg2LjAsIDcuNSwgYWJzKHZCYXJvbkdyb3VuZC55KSk7XG5mbG9hdCBiYXJvbkVkZ2UgPSAxLjAgLSBzbW9vdGhzdGVwKDI1LjAsIDMxLjAsIG1heChhYnModkJhcm9uR3JvdW5kLngpLCBhYnModkJhcm9uR3JvdW5kLnkpKSk7XG52ZWMzIGJhcm9uUGlnbWVudCA9IG1peChiYXJvbldhcm1QaWdtZW50LCBiYXJvbkNvbGRQaWdtZW50LCBzbW9vdGhzdGVwKDYuMCwgMTAuMCwgLXZCYXJvbkdyb3VuZC55KSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGJhcm9uUGlnbWVudCwgMC4zMiAqIGJhcm9uSW5rICogYmFyb25EcnkgKiBiYXJvbkVkZ2UpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ2Jhcm9uLXNjb3JjaC1waWdtZW50LXYxJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIFF1aWV0IHRoZSB3b3JrZWQgYXBwcm9hY2hlcyB3aXRob3V0IHJlcGFpbnRpbmcgdGhlIGdvcmdlIG9yIGl0cyB3YXRlcmxpbmUuICovXG5mdW5jdGlvbiBjYWxtVHJlc3RsZUFwcHJvYWNoZXMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMudHJlc3RsZVdvcmtlZFBpZ21lbnQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM4YjcyNTYnKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUcmVzdGxlR3JvdW5kOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PlxcbnZUcmVzdGxlR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUcmVzdGxlR3JvdW5kO1xcbnVuaWZvcm0gdmVjMyB0cmVzdGxlV29ya2VkUGlnbWVudDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IHRyZXN0bGVCYW5rID0gc21vb3Roc3RlcCg2LjI1LCA5LjAsIGFicyh2VHJlc3RsZUdyb3VuZC55KSk7XG5mbG9hdCB0cmVzdGxlRWRnZSA9IDEuMCAtIHNtb290aHN0ZXAoMjkuMCwgNDIuMCwgbWF4KGFicyh2VHJlc3RsZUdyb3VuZC54KSwgYWJzKHZUcmVzdGxlR3JvdW5kLnkpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIHRyZXN0bGVXb3JrZWRQaWdtZW50LCAwLjIzICogdHJlc3RsZUJhbmsgKiB0cmVzdGxlRWRnZSk7YCk7XG4gICAgfTtcbiAgICBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkgPSAoKSA9PiAndHJlc3RsZS13b3JrZWQtYXBwcm9hY2hlcy12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBRdWlldCBkZXNlcnQgcGlnbWVudCBhbmQgd2hlZWwgY3V0cyBmb2xsb3cgdGhlIHB1Ymxpc2hlZCBNb3RvciBtYXNrcywgbmV2ZXIgbmV3IHJvYWRzLiAqL1xuZnVuY3Rpb24gY2xhcmlmeU1vdG9yR3JvdW5kKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgdHJ1dGg6IE1vdG9yR3JvdW5kVHJ1dGgsIHBhbm9yYW1hID0gZmFsc2UsIHBhaW50TWl4ID0gMC43OCk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIGNvbnN0IHJvYWRzID0gdHJ1dGgucm9hZENvcnJpZG9ycyA/PyBbXTtcbiAgY29uc3Qgc2VhbXMgPSB0cnV0aC50YXJTZWFtcyA/PyBbXTtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JQYWludE1peCA9IHsgdmFsdWU6IHBhaW50TWl4IH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JFYXJ0aCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzlmODU2NCcpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMubW90b3JSb2FkID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYzVhMjc0JykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3RvclJvYWRzID0geyB2YWx1ZTogcm9hZHMubWFwKHIgPT4gbmV3IFRIUkVFLlZlY3RvcjQoci5zdGFydC54LCByLnN0YXJ0LnosIHIuZW5kLngsIHIuZW5kLnopKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLm1vdG9yVGFyID0geyB2YWx1ZTogc2VhbXMubGVuZ3RoID8gc2VhbXMubWFwKHMgPT4gbmV3IFRIUkVFLlZlY3RvcjMocy54LCBzLnosIHMucmFkaXVzKSkgOiBbbmV3IFRIUkVFLlZlY3RvcjMoKV0gfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3Rvck9yYml0ID0geyB2YWx1ZTogdHJ1dGgub3JiaXRTcGF3bj8ucmFkaXVzID8/IDAgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5tb3RvckhhbGZTaXplID0geyB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIodHJ1dGguZGltZW5zaW9ucyEud2lkdGggLyAyLCB0cnV0aC5kaW1lbnNpb25zIS5oZWlnaHQgLyAyKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZNb3Rvckdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52TW90b3JHcm91bmQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54eXo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgYCNpbmNsdWRlIDxjb21tb24+XG52YXJ5aW5nIHZlYzMgdk1vdG9yR3JvdW5kO1xudW5pZm9ybSB2ZWMzIG1vdG9yRWFydGgsIG1vdG9yUm9hZDtcbnVuaWZvcm0gdmVjNCBtb3RvclJvYWRzWyR7cm9hZHMubGVuZ3RofV07XG51bmlmb3JtIHZlYzMgbW90b3JUYXJbJHtNYXRoLm1heCgxLCBzZWFtcy5sZW5ndGgpfV07XG51bmlmb3JtIHZlYzIgbW90b3JIYWxmU2l6ZTtcbnVuaWZvcm0gZmxvYXQgbW90b3JPcmJpdCwgbW90b3JQYWludE1peDtgKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbnZlYzIgbW90b3JQID0gdk1vdG9yR3JvdW5kLnh6O1xudmVjMyBtb3Rvck9yaWdpbmFsID0gZGlmZnVzZUNvbG9yLnJnYjtcbmZsb2F0IG1vdG9yR3JhaW4gPSBmcmFjdChzaW4oZG90KGZsb29yKG1vdG9yUCAqIDE4LjApLCB2ZWMyKDEyLjk4OTgsNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XG5mbG9hdCBtb3Rvck1vdHRsZSA9IHNpbihtb3RvclAueCAqIDAuMzcgKyBzaW4obW90b3JQLnkgKiAwLjIxKSkgKiBzaW4obW90b3JQLnkgKiAwLjQzKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JFYXJ0aCAqICgwLjk0ICsgbW90b3JHcmFpbiAqIDAuMDYgKyBtb3Rvck1vdHRsZSAqIDAuMDM1KSwgbW90b3JIYWxmU2l6ZS54ID4gMTAwLjAgPyAwLjk1IDogbW90b3JQYWludE1peCk7XG5mbG9hdCBtb3RvckRpc3RhbmNlID0gMTAwMDAuMDtcbmZsb2F0IG1vdG9yUnV0ID0gMC4wO1xuZm9yIChpbnQgaSA9IDA7IGkgPCAke3JvYWRzLmxlbmd0aH07IGkrKykge1xuICB2ZWMyIGEgPSBtb3RvclJvYWRzW2ldLnh5LCBiID0gbW90b3JSb2Fkc1tpXS56dywgYWIgPSBiIC0gYTtcbiAgZmxvYXQgYWxvbmcgPSBkb3QobW90b3JQIC0gYSwgYWIpIC8gZG90KGFiLCBhYik7XG4gIGZsb2F0IGRpc3RhbmNlID0gbGVuZ3RoKG1vdG9yUCAtIGEgLSBhYiAqIGNsYW1wKGFsb25nLCAwLjAsIDEuMCkpO1xuICBtb3RvckRpc3RhbmNlID0gbWluKG1vdG9yRGlzdGFuY2UsIGRpc3RhbmNlKTtcbiAgbW90b3JSdXQgPSBtYXgobW90b3JSdXQsICgxLjAgLSBzbW9vdGhzdGVwKDAuMTIsIDAuMjggKyBmd2lkdGgoZGlzdGFuY2UpLCBhYnMoZGlzdGFuY2UgLSAxLjU1KSkpICogc21vb3Roc3RlcCgwLjAsIDAuMDYsIGFsb25nKSAqICgxLjAgLSBzbW9vdGhzdGVwKDAuOTQsIDEuMCwgYWxvbmcpKSk7XG59XG5pZiAobW90b3JPcmJpdCA+IDAuMCkge1xuICBmbG9hdCBhbmdsZSA9IGF0YW4obW90b3JQLnksIG1vdG9yUC54KTtcbiAgZmxvYXQgd29iYmxlID0gc2luKGFuZ2xlICogMy4wICsgMC40KSAqIDAuNjIgKyBzaW4oYW5nbGUgKiA3LjAgLSAwLjgpICogMC4yODtcbiAgZmxvYXQgZGlzdGFuY2UgPSBhYnMobGVuZ3RoKG1vdG9yUCkgLSBtb3Rvck9yYml0IC0gd29iYmxlKTtcbiAgbW90b3JEaXN0YW5jZSA9IG1pbihtb3RvckRpc3RhbmNlLCBkaXN0YW5jZSk7XG4gIG1vdG9yUnV0ID0gbWF4KG1vdG9yUnV0LCAxLjAgLSBzbW9vdGhzdGVwKDAuMTIsIDAuMjggKyBmd2lkdGgoZGlzdGFuY2UpLCBhYnMoZGlzdGFuY2UgLSAxLjU1KSkpO1xufVxuZmxvYXQgbW90b3JSb2FkTWFzayA9IDEuMCAtIHNtb290aHN0ZXAoMi44LCA0LjgsIG1vdG9yRGlzdGFuY2UpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBtb3RvclJvYWQgKiAoMC45NiArIG1vdG9yR3JhaW4gKiAwLjA0KSwgbW90b3JSb2FkTWFzayAqIDAuNjIpO1xuZGlmZnVzZUNvbG9yLnJnYiAqPSAxLjAgLSBtb3RvclJ1dCAqIDAuMTY7XG5mb3IgKGludCBpID0gMDsgaSA8ICR7c2VhbXMubGVuZ3RofTsgaSsrKSB7XG4gIGZsb2F0IHJhZGl1cyA9IGxlbmd0aChtb3RvclAgLSBtb3RvclRhcltpXS54eSkgLyBtb3RvclRhcltpXS56O1xuICBmbG9hdCB0YXIgPSAxLjAgLSBzbW9vdGhzdGVwKDAuNjUsIDEuMDUgKyBtb3Rvck1vdHRsZSAqIDAuMTIsIHJhZGl1cyk7XG4gIGRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JFYXJ0aCAqIDAuMjgsIHRhciAqIDAuNjIpO1xufVxuZmxvYXQgbW90b3JJbnRlcmlvciA9IDEuMCAtIHNtb290aHN0ZXAoMC43MiwgMS4wLCBtYXgoYWJzKG1vdG9yUC54KSAvIG1vdG9ySGFsZlNpemUueCwgYWJzKG1vdG9yUC55KSAvIG1vdG9ySGFsZlNpemUueSkpO1xuaWYgKG1vdG9ySGFsZlNpemUueCA+IDEwMC4wKSBtb3RvckludGVyaW9yID0gKDEuMCAtIHNtb290aHN0ZXAoMjA1LjAsIDI2MC4wLCBhYnMobW90b3JQLngpKSkgKiAoMS4wIC0gc21vb3Roc3RlcCgwLjcyLCAxLjAsIGFicyhtb3RvclAueSkgLyBtb3RvckhhbGZTaXplLnkpKSAqICgxLjAgLSBzbW9vdGhzdGVwKDEuMCwgMTIuMCwgdk1vdG9yR3JvdW5kLnkpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgobW90b3JPcmlnaW5hbCwgZGlmZnVzZUNvbG9yLnJnYiwgbW90b3JJbnRlcmlvcik7YCk7XG4gICAgICBpZiAocGFub3JhbWEpIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlci5yZXBsYWNlKCcjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+JywgJyNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cXG50b3RhbEVtaXNzaXZlUmFkaWFuY2UgKj0gMS4wIC0gbW90b3JJbnRlcmlvcjsnKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGBtb3Rvci1ncm91bmQtJHtyb2Fkcy5sZW5ndGh9LSR7c2VhbXMubGVuZ3RofS0ke3Bhbm9yYW1hfS12MmA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBGaW5lIHJlZ29saXRoIHBpZ21lbnQgcmVwbGFjZXMgdGhlIHJldXNlZCBNYXJlJ3MgYnJvYWQgcGFpbnQgYmFuZHMsIHdpdGhvdXQgYSBuZXcgc3VyZmFjZS4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlGYXJTaWRlUmVnb2xpdGgobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZmFyU2lkZUR1c3QgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyNhYWE1OTYnKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmZhclNpZGVSaW0gPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyNjNGJiYTUnKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZGYXJTaWRlR3JvdW5kOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PlxcbnZGYXJTaWRlR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2RmFyU2lkZUdyb3VuZDtcXG51bmlmb3JtIHZlYzMgZmFyU2lkZUR1c3QsIGZhclNpZGVSaW07JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG52ZWMyIGZhclNpZGVQID0gdkZhclNpZGVHcm91bmQueHo7XG5mbG9hdCBmYXJTaWRlR3JhaW4gPSBmcmFjdChzaW4oZG90KGZsb29yKHZGYXJTaWRlR3JvdW5kICogMTguMCksIHZlYzMoMTIuOTg5OCwgNzguMjMzLCAzNy43MTkpKSkgKiA0Mzc1OC41NDUzKTtcbmZsb2F0IGZhclNpZGVHcmFpbkZhZGUgPSAxLjAgLSBzbW9vdGhzdGVwKDAuNCwgMS4yLCBtYXgobWF4KGZ3aWR0aCh2RmFyU2lkZUdyb3VuZC54KSwgZndpZHRoKHZGYXJTaWRlR3JvdW5kLnopKSwgZndpZHRoKHZGYXJTaWRlR3JvdW5kLnkpKSAqIDE4LjApO1xuZmxvYXQgZmFyU2lkZU1vdHRsZSA9IHNpbihmYXJTaWRlUC54ICogMC43MyArIHNpbihmYXJTaWRlUC55ICogMC40MSkpICogc2luKGZhclNpZGVQLnkgKiAwLjg3KTtcbnZlYzMgZmFyU2lkZVBpZ21lbnQgPSBtaXgoZmFyU2lkZUR1c3QsIGZhclNpZGVSaW0sIHNtb290aHN0ZXAoMC41LCA1LjgsIHZGYXJTaWRlR3JvdW5kLnkpKTtcbmZhclNpZGVQaWdtZW50ICo9IDAuOTYgKyAoZmFyU2lkZUdyYWluIC0gMC41KSAqIDAuMTQgKiBmYXJTaWRlR3JhaW5GYWRlICsgZmFyU2lkZU1vdHRsZSAqIDAuMDQ1O1xuZmxvYXQgZmFyU2lkZUludGVyaW9yID0gMS4wIC0gc21vb3Roc3RlcCg1NC4wLCA2My4wLCBtYXgoYWJzKGZhclNpZGVQLngpLCBhYnMoZmFyU2lkZVAueSkpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZmFyU2lkZVBpZ21lbnQsIDAuOTIgKiBmYXJTaWRlSW50ZXJpb3IpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ2Zhci1zaWRlLXJlZ29saXRoLXYyJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIEEgY2lyY3VsYXIgbWVtb3JpYWwgaW5sYXkgc3RheXMgb24gdGhlIGNvbXBsZXRlIGF1dGhvcmVkIHNxdWFyZSBmbG9vci4gKi9cbmZ1bmN0aW9uIHBhaW50TGFzdENsYWltRGVjayhtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHJldHVybjtcbiAgICBjb25zdCBtYXRlcmlhbCA9IG1lc2gubWF0ZXJpYWwsIGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMubWVtb3JpYWxCcmFzcyA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2M0YTQ2NScpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMubWVtb3JpYWxCYW5kID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjOGM5MjhiJykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2TWVtb3JpYWxEZWNrOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PlxcbnZNZW1vcmlhbERlY2sgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdk1lbW9yaWFsRGVjaztcXG51bmlmb3JtIHZlYzMgbWVtb3JpYWxCcmFzcywgbWVtb3JpYWxCYW5kOycpXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX2ZyYWdtZW50PlxuZmxvYXQgbWVtb3JpYWxSYWRpdXMgPSBsZW5ndGgodk1lbW9yaWFsRGVjayk7XG5mbG9hdCBtZW1vcmlhbEluc2lkZSA9IDEuMCAtIHNtb290aHN0ZXAoNTUuOCwgNTcuMCwgbWVtb3JpYWxSYWRpdXMpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IChwb3cobWF4KGRpZmZ1c2VDb2xvci5yZ2IsIHZlYzMoMC4wKSksIHZlYzMoMC42OCkpICogMC44NCArIHZlYzMoMC4wMjYpKSAqIG1peCgwLjU4LCAxLjAsIG1lbW9yaWFsSW5zaWRlKTtcbmZsb2F0IG1lbW9yaWFsQW5udWx1cyA9IHNtb290aHN0ZXAoNDQuNywgNDUuMCwgbWVtb3JpYWxSYWRpdXMpICogKDEuMCAtIHNtb290aHN0ZXAoNDguMywgNDguNiwgbWVtb3JpYWxSYWRpdXMpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbWVtb3JpYWxCYW5kLCBtZW1vcmlhbEFubnVsdXMgKiAwLjI0KTtcbmZsb2F0IG1lbW9yaWFsUmluZ0Rpc3RhbmNlID0gbWluKG1pbihhYnMobWVtb3JpYWxSYWRpdXMgLSA0NC42KSwgYWJzKG1lbW9yaWFsUmFkaXVzIC0gNDguNykpLCBtaW4oYWJzKG1lbW9yaWFsUmFkaXVzIC0gNTUuMiksIG1pbihhYnMobWVtb3JpYWxSYWRpdXMgLSAyMC4wKSwgYWJzKG1lbW9yaWFsUmFkaXVzIC0gNS4wKSkpKTtcbmZsb2F0IG1lbW9yaWFsUmluZyA9IDEuMCAtIHNtb290aHN0ZXAoMC4wNjUsIDAuMTYsIG1lbW9yaWFsUmluZ0Rpc3RhbmNlKTtcbmZsb2F0IG1lbW9yaWFsU3Bva2VEaXN0YW5jZSA9IGFicyhzaW4oYXRhbih2TWVtb3JpYWxEZWNrLnksIHZNZW1vcmlhbERlY2sueCkgKiA2LjApKSAqIG1lbW9yaWFsUmFkaXVzO1xuZmxvYXQgbWVtb3JpYWxTcG9rZSA9ICgxLjAgLSBzbW9vdGhzdGVwKDAuMDgsIDAuMjAsIG1lbW9yaWFsU3Bva2VEaXN0YW5jZSkpICogc21vb3Roc3RlcCg0LjUsIDUuMCwgbWVtb3JpYWxSYWRpdXMpICogKDEuMCAtIHNtb290aHN0ZXAoNDMuOSwgNDQuMywgbWVtb3JpYWxSYWRpdXMpKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbWVtb3JpYWxCcmFzcywgbWF4KG1lbW9yaWFsUmluZywgbWVtb3JpYWxTcG9rZSkgKiAwLjgyKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdsYXN0LWNsYWltLW1lbW9yaWFsLWlubGF5LXYxJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH0pO1xufVxuXG4vKiogQSBtYXRlcmlhbC1vbmx5IGRhd24gdHJlYXRtZW50IGZvciB0aGUgcmF3IFJpdmVyJ3MgZXhpc3RpbmcgcGFpbnRlZCBmYWxsYmFjay4gKi9cbmZ1bmN0aW9uIHBhaW50Uml2ZXJSZXR1cm4oaG9zdDogSG9zdCk6ICgpID0+IHZvaWQge1xuICBpZiAoaG9zdC5jb250cmFjdElkICE9PSAnZTEwLXJpdmVyJyB8fCBpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybiAoKSA9PiB1bmRlZmluZWQ7XG4gIGNvbnN0IG1hdGVyaWFscyA9IG5ldyBTZXQ8VEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+KCk7XG4gIGhvc3Quc2NlbmUudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAoIW1lc2guaXNNZXNoKSByZXR1cm47XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkge1xuICAgICAgaWYgKChtYXRlcmlhbCBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCkuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCAmJiAobWF0ZXJpYWwudXNlckRhdGEudGVycmFpblVuaWZvcm1zIHx8IG1hdGVyaWFsLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMpKSBtYXRlcmlhbHMuYWRkKG1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKTtcbiAgICB9XG4gIH0pO1xuICBjb25zdCByZXN0b3JlID0gWy4uLm1hdGVyaWFsc10ubWFwKG1hdGVyaWFsID0+IHtcbiAgICBjb25zdCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLCBrZXkgPSBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXk7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBrZXkuY2FsbChtYXRlcmlhbCksIHdhdGVyID0gISFtYXRlcmlhbC51c2VyRGF0YS53YXRlclVuaWZvcm1zO1xuICAgIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIsIHJlbmRlcmVyKSA9PiB7XG4gICAgICBjb21waWxlLmNhbGwobWF0ZXJpYWwsIHNoYWRlciwgcmVuZGVyZXIpO1xuICAgICAgaWYgKHdhdGVyKSB7XG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlci5yZXBsYWNlKCd2ZWM0IHNhbXBsZWREaWZmdXNlQ29sb3IgPSB2ZWM0KHdhdGVyQ29sb3IsIGFscGhhKTsnLCBgXG52ZWMzIHJldHVybldhdGVyID0gbWl4KHZlYzMoMC4zMywgMC4zOSwgMC4zOCksIHZlYzMoMC4xMCwgMC4xOSwgMC4yMyksIGRlcHRoKTtcbnJldHVybldhdGVyID0gbWl4KHJldHVybldhdGVyLCB2ZWMzKDAuNDgsIDAuNDYsIDAuMzUpLCBmb3JkQmFuZCAqIDAuNTUpO1xud2F0ZXJDb2xvciA9IG1peCh3YXRlckNvbG9yLCByZXR1cm5XYXRlciwgMC42NSk7XG5mbG9hdCByZXR1cm5GbG93TGluZSA9IHNpbih2V2F0ZXJXb3JsZC55ICogNy4wICsgd2F0ZXJOb2lzZSh2V2F0ZXJXb3JsZCAqIHZlYzIoMS4yLCAxLjgpIC0gdmVjMih3YXRlclRpbWUgKiAwLjMyLCAwLjApKSAqIDQuOCk7XG5mbG9hdCByZXR1cm5GbG93QnJlYWsgPSBzbW9vdGhzdGVwKDAuNTAsIDAuNzgsIHdhdGVyTm9pc2UodldhdGVyV29ybGQgKiB2ZWMyKDMuNCwgMi4zKSAtIHZlYzIod2F0ZXJUaW1lICogMC40LCAwLjApKSk7XG53YXRlckNvbG9yICs9IHZlYzMoMC4xMiwgMC4xMSwgMC4wNzUpICogc21vb3Roc3RlcCgwLjk0LCAwLjk5NSwgcmV0dXJuRmxvd0xpbmUpICogcmV0dXJuRmxvd0JyZWFrICogd2F0ZXJRdWFsaXR5ICogKDEuMCAtIGZvcmRCYW5kKSAqIHNtb290aHN0ZXAoMC4wNSwgMC4yMCwgZGVwdGgpO1xudmVjNCBzYW1wbGVkRGlmZnVzZUNvbG9yID0gdmVjNCh3YXRlckNvbG9yLCBhbHBoYSk7YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGFkZXIudW5pZm9ybXMucmV0dXJuQmFua1BpZ21lbnQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyNhZDljNzUnKSB9O1xuICAgICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG51bmlmb3JtIHZlYzMgcmV0dXJuQmFua1BpZ21lbnQ7JylcbiAgICAgICAgICAucmVwbGFjZSgnZGlmZnVzZUNvbG9yICo9IHNhbXBsZWREaWZmdXNlQ29sb3I7JywgJ2RpZmZ1c2VDb2xvciAqPSBzYW1wbGVkRGlmZnVzZUNvbG9yO1xcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgcmV0dXJuQmFua1BpZ21lbnQsIDAuMjUpOycpO1xuICAgICAgfVxuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7Y2FjaGVLZXl9fHJhdy1yaXZlci1kYXduLXYxOiR7d2F0ZXIgPyAnd2F0ZXInIDogJ2JhbmsnfWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIHJldHVybiAoKSA9PiB7IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IGNvbXBpbGU7IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9IGtleTsgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlOyB9O1xuICB9KTtcbiAgcmV0dXJuICgpID0+IHsgZm9yIChjb25zdCByZXNldCBvZiByZXN0b3JlKSByZXNldCgpOyB9O1xufVxuXG4vKiogUXVpZXQgdGhlIGFyY2hpdmUgcGF2aW5nOyB3YXJtIHBvb2xzIGFwcGVhciBvbmx5IGZvciBhbHJlYWR5LXJlc3RvcmVkIHdpbmdzLiAqL1xuZnVuY3Rpb24gY2xhcmlmeUFyY2hpdmVUZXJyYWNlcyhtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHJlYWRTdGF0ZT86ICgpID0+IEFyY2hpdmVSZXN0b3JhdGlvblN0YXRlIHwgbnVsbCk6IHZvaWQge1xuICBpZiAoaXNNYXBCZWF1dHlEaXNhYmxlZCgpKSByZXR1cm47XG4gIGNvbnN0IHpvbmVzID0gcmVhZFN0YXRlPy4oKT8uem9uZXMgPz8gW107XG4gIGNvbnN0IHBvb2xzID0geyB2YWx1ZTogem9uZXMubWFwKHpvbmUgPT4gbmV3IFRIUkVFLlZlY3RvcjQoKHpvbmUubWluWCArIHpvbmUubWF4WCkgLyAyLCAoem9uZS5taW5aICsgem9uZS5tYXhaKSAvIDIsICh6b25lLm1heFggLSB6b25lLm1pblgpICogMC4zMCwgKHpvbmUubWF4WiAtIHpvbmUubWluWikgKiAwLjMwKSkgfTtcbiAgY29uc3QgcmVzdG9yZWQgPSB7IHZhbHVlOiBuZXcgRmxvYXQzMkFycmF5KHpvbmVzLmxlbmd0aCkgfTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSB8fCAhbWVzaC5tYXRlcmlhbC5pc01lc2hTdGFuZGFyZE1hdGVyaWFsKSByZXR1cm47XG4gICAgY29uc3QgYmVmb3JlUmVuZGVyID0gbWVzaC5vbkJlZm9yZVJlbmRlci5iaW5kKG1lc2gpO1xuICAgIG1lc2gub25CZWZvcmVSZW5kZXIgPSAocmVuZGVyZXIsIHNjZW5lLCBjYW1lcmEsIGdlb21ldHJ5LCBtYXRlcmlhbCwgZ3JvdXApID0+IHtcbiAgICAgIGJlZm9yZVJlbmRlcihyZW5kZXJlciwgc2NlbmUsIGNhbWVyYSwgZ2VvbWV0cnksIG1hdGVyaWFsLCBncm91cCk7XG4gICAgICBjb25zdCBzdGF0ZSA9IHJlYWRTdGF0ZT8uKCk7XG4gICAgICB6b25lcy5mb3JFYWNoKCh6b25lLCBpbmRleCkgPT4geyByZXN0b3JlZC52YWx1ZVtpbmRleF0gPSBzdGF0ZT8ucmVzdG9yZWRXaW5nSWRzLmluY2x1ZGVzKHpvbmUuaWQpID8gMSA6IDA7IH0pO1xuICAgIH07XG4gICAgY29uc3QgbWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsLCBjb21waWxlID0gbWF0ZXJpYWwub25CZWZvcmVDb21waWxlLmJpbmQobWF0ZXJpYWwpO1xuICAgIGNvbnN0IGNhY2hlS2V5ID0gbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5KCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuYXJjaGl2ZUZsb29yTG93ID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjNzc2ZjVlJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5hcmNoaXZlRmxvb3JIaWdoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYThhMzhkJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5hcmNoaXZlRmxvb3JQb29scyA9IHBvb2xzO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmFyY2hpdmVGbG9vclJlc3RvcmVkID0gcmVzdG9yZWQ7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkFyY2hpdmVGbG9vcjsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52QXJjaGl2ZUZsb29yID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxudmFyeWluZyB2ZWMzIHZBcmNoaXZlRmxvb3I7XG51bmlmb3JtIHZlYzMgYXJjaGl2ZUZsb29yTG93LCBhcmNoaXZlRmxvb3JIaWdoO1xuJHt6b25lcy5sZW5ndGggPyBgdW5pZm9ybSB2ZWM0IGFyY2hpdmVGbG9vclBvb2xzWyR7em9uZXMubGVuZ3RofV07XFxudW5pZm9ybSBmbG9hdCBhcmNoaXZlRmxvb3JSZXN0b3JlZFske3pvbmVzLmxlbmd0aH1dO2AgOiAnJ31gKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGFyY2hpdmVUZXJyYWNlID0gc21vb3Roc3RlcCgtMC43LCAyLjIsIHZBcmNoaXZlRmxvb3IueSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIG1peChhcmNoaXZlRmxvb3JMb3csIGFyY2hpdmVGbG9vckhpZ2gsIGFyY2hpdmVUZXJyYWNlKSwgMC41MCk7YClcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PlxuJHt6b25lcy5sZW5ndGggPyBgZm9yIChpbnQgaSA9IDA7IGkgPCAke3pvbmVzLmxlbmd0aH07IGkrKykge1xuICB2ZWM0IHBvb2wgPSBhcmNoaXZlRmxvb3JQb29sc1tpXTtcbiAgZmxvYXQgYXJjaGl2ZVBvb2wgPSAxLjAgLSBzbW9vdGhzdGVwKDAuMTIsIDEuMCwgbGVuZ3RoKCh2QXJjaGl2ZUZsb29yLnh6IC0gcG9vbC54eSkgLyBwb29sLnp3KSk7XG4gIHRvdGFsRW1pc3NpdmVSYWRpYW5jZSArPSB2ZWMzKDAuMjQsIDAuMDk1LCAwLjAyNSkgKiBhcmNoaXZlUG9vbCAqIGFyY2hpdmVGbG9vclJlc3RvcmVkW2ldO1xufWAgOiAnJ31gKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGAke2NhY2hlS2V5fXxhcmNoaXZlLXRlcnJhY2VzLXYxOiR7em9uZXMubGVuZ3RofWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIE9uZSB3b3JsZC1zcGFjZSBiYXNhbHQgdHJlYXRtZW50IGNyb3NzZXMgdGhlIHNjdWxwdC9jb250aW51YXRpb24gam9pbi4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlFbWJlckJhc2FsdChtb2RlbDogVEhSRUUuT2JqZWN0M0QpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKCFtZXNoLmlzTWVzaCB8fCBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpIHx8ICFtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHJldHVybjtcbiAgICBjb25zdCBtYXRlcmlhbCA9IG1lc2gubWF0ZXJpYWwsIGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBtYXRlcmlhbC5jdXN0b21Qcm9ncmFtQ2FjaGVLZXkoKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5lbWJlckJhc2FsdExvdyA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzVkNzI3YycpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZW1iZXJCYXNhbHRIaWdoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjOWM5ZTkxJykgfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2RW1iZXJCYXNhbHQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkVtYmVyQmFzYWx0ID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxudmFyeWluZyB2ZWMzIHZFbWJlckJhc2FsdDtcbnVuaWZvcm0gdmVjMyBlbWJlckJhc2FsdExvdywgZW1iZXJCYXNhbHRIaWdoO1xudmVjMiBlbWJlclN0b25lSGFzaCh2ZWMyIHApIHtcbiAgcmV0dXJuIGZyYWN0KHNpbih2ZWMyKGRvdChwLCB2ZWMyKDEyNy4xLCAzMTEuNykpLCBkb3QocCwgdmVjMigyNjkuNSwgMTgzLjMpKSkpICogNDM3NTguNTQ1Myk7XG59YClcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBlbWJlcldhcm0gPSBjbGFtcCgoZGlmZnVzZUNvbG9yLnIgLSBtYXgoZGlmZnVzZUNvbG9yLmcsIGRpZmZ1c2VDb2xvci5iKSAqIDEuOCkgKiAxOC4wLCAwLjAsIDEuMCk7XG5mbG9hdCBlbWJlclNoZWxmID0gc21vb3Roc3RlcCgtMS44LCAxLjgsIHZFbWJlckJhc2FsdC55KTtcbnZlYzIgZW1iZXJDZWxsID0gdkVtYmVyQmFzYWx0Lnh6ICogMS40NTtcbnZlYzIgZW1iZXJDZWxsSWQgPSBmbG9vcihlbWJlckNlbGwpLCBlbWJlckNlbGxQb2ludCA9IGZyYWN0KGVtYmVyQ2VsbCk7XG5mbG9hdCBlbWJlck5lYXIgPSA4LjAsIGVtYmVyTmV4dCA9IDguMCwgZW1iZXJDZWxsU2hhZGUgPSAwLjU7XG5mb3IgKGludCBlbWJlclkgPSAtMTsgZW1iZXJZIDw9IDE7IGVtYmVyWSsrKSBmb3IgKGludCBlbWJlclggPSAtMTsgZW1iZXJYIDw9IDE7IGVtYmVyWCsrKSB7XG4gIHZlYzIgZW1iZXJOZWlnaGJvdXIgPSB2ZWMyKGZsb2F0KGVtYmVyWCksIGZsb2F0KGVtYmVyWSkpO1xuICB2ZWMyIGVtYmVyU2VlZCA9IGVtYmVyU3RvbmVIYXNoKGVtYmVyQ2VsbElkICsgZW1iZXJOZWlnaGJvdXIpO1xuICBmbG9hdCBlbWJlckRpc3RhbmNlID0gbGVuZ3RoKGVtYmVyTmVpZ2hib3VyICsgMC4xOCArIGVtYmVyU2VlZCAqIDAuNjQgLSBlbWJlckNlbGxQb2ludCk7XG4gIGlmIChlbWJlckRpc3RhbmNlIDwgZW1iZXJOZWFyKSB7IGVtYmVyTmV4dCA9IGVtYmVyTmVhcjsgZW1iZXJOZWFyID0gZW1iZXJEaXN0YW5jZTsgZW1iZXJDZWxsU2hhZGUgPSBlbWJlclNlZWQueDsgfVxuICBlbHNlIGVtYmVyTmV4dCA9IG1pbihlbWJlck5leHQsIGVtYmVyRGlzdGFuY2UpO1xufVxuZmxvYXQgZW1iZXJKb2ludCA9IHNtb290aHN0ZXAoMC4wMDYsIDAuMDMwLCBlbWJlck5leHQgLSBlbWJlck5lYXIpO1xuZmxvYXQgZW1iZXJHcmFpbiA9IGZyYWN0KHNpbihkb3QoZmxvb3IodkVtYmVyQmFzYWx0ICogMTguMCksIHZlYzMoMTIuOTg5OCwgNzguMjMzLCAzNy43MTkpKSkgKiA0Mzc1OC41NDUzKTtcbmZsb2F0IGVtYmVyR3JhaW5GYWRlID0gMS4wIC0gc21vb3Roc3RlcCgwLjQsIDEuMiwgbWF4KG1heChmd2lkdGgodkVtYmVyQmFzYWx0LngpLCBmd2lkdGgodkVtYmVyQmFzYWx0LnopKSwgZndpZHRoKHZFbWJlckJhc2FsdC55KSkgKiAxOC4wKTtcbnZlYzMgZW1iZXJTdG9uZSA9IG1peChlbWJlckJhc2FsdExvdywgZW1iZXJCYXNhbHRIaWdoLCBlbWJlclNoZWxmKTtcbmVtYmVyU3RvbmUgKj0gKDAuOTQgKyBlbWJlckNlbGxTaGFkZSAqIDAuMDggKyAoZW1iZXJHcmFpbiAtIDAuNSkgKiAwLjIwICogZW1iZXJHcmFpbkZhZGUpICogbWl4KDAuOTMsIDEuMCwgZW1iZXJKb2ludCk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGVtYmVyU3RvbmUsIDAuODgpO1xuZmxvYXQgZW1iZXJQbGF5ZmllbGQgPSAxLjAgLSBzbW9vdGhzdGVwKDYzLjgsIDY0LjAsIG1heChhYnModkVtYmVyQmFzYWx0LngpLCBhYnModkVtYmVyQmFzYWx0LnopKSk7XG5mbG9hdCBlbWJlclZlaW4gPSBlbWJlcldhcm0gKiBlbWJlclBsYXlmaWVsZCAqICgwLjcwICsgMC4zMCAqIGVtYmVyR3JhaW4pO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCB2ZWMzKDAuMjgsIDAuMDU1LCAwLjAxMiksIGVtYmVyVmVpbiAqIDAuODIpO2ApXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+JywgJyNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cXG50b3RhbEVtaXNzaXZlUmFkaWFuY2UgKz0gdmVjMygwLjA3LCAwLjAxMiwgMC4wMDIpICogZW1iZXJWZWluOycpO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7Y2FjaGVLZXl9fGVtYmVyLWJhc2FsdC12NGA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9KTtcbn1cblxuLyoqIERyeSBjYW5hbC9yb2FkIHBpZ21lbnQgZm9sbG93cyBwdWJsaXNoZWQgcm91dGVzLiBQZXJtYW5lbnQgZ3JlZW4gem9uZXMgYXJlXG4gKiBhdXRob3JlZCB0ZXJyYWluIHBhaW50OyBzdGFnZWQgd2F0ZXIgYW5kIHBsYW50ZWQgc3RhdGUga2VlcCB0aGVpciBleGlzdGluZyBvd25lcnMuICovXG5mdW5jdGlvbiBjbGFyaWZ5UmVkRmllbGRzUm91dGUobW9kZWw6IFRIUkVFLk9iamVjdDNELCBwb2ludHM6IFBhaW50Um91dGVQb2ludFtdLCBncmVlblpvbmVzOiBQYWludFpvbmVbXSA9IFtdKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkgfHwgcG9pbnRzLmxlbmd0aCA8IDIpIHJldHVybjtcbiAgY29uc3Qgc2VnbWVudHMgPSBwb2ludHMuc2xpY2UoMSkubWFwKChlbmQsIGkpID0+IG5ldyBUSFJFRS5WZWN0b3I0KHBvaW50c1tpXSEueCwgcG9pbnRzW2ldIS56LCBlbmQueCwgZW5kLnopKTtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZG9tZUNhbmFsU2VnbWVudHMgPSB7IHZhbHVlOiBzZWdtZW50cyB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmRvbWVDYW5hbEVhcnRoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjYWY4YjY5JykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5kb21lQ2FuYWxCZWQgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoZ3JlZW5ab25lcy5sZW5ndGggPyAnI2IzOWI3NCcgOiAnIzc3NzQ2NycpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMucmVkRmllbGRzR3JlZW4gPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoJyM4MjkxNmUnKSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnJlZEZpZWxkc1pvbmVzID0geyB2YWx1ZTogZ3JlZW5ab25lcy5tYXAoeiA9PiBuZXcgVEhSRUUuVmVjdG9yNCh6Lm1pblgsIHoubWluWiwgei5tYXhYLCB6Lm1heFopKSB9O1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMzIHZEb21lQ2FuYWw7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkRvbWVDYW5hbCA9IChtb2RlbE1hdHJpeCAqIHZlYzQocG9zaXRpb24sIDEuMCkpLnh5ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCBgI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkRvbWVDYW5hbDtcXG51bmlmb3JtIHZlYzQgZG9tZUNhbmFsU2VnbWVudHNbJHtzZWdtZW50cy5sZW5ndGh9XTtcXG51bmlmb3JtIHZlYzMgZG9tZUNhbmFsRWFydGgsIGRvbWVDYW5hbEJlZDske2dyZWVuWm9uZXMubGVuZ3RoID8gYFxcbnVuaWZvcm0gdmVjMyByZWRGaWVsZHNHcmVlbjtcXG51bmlmb3JtIHZlYzQgcmVkRmllbGRzWm9uZXNbJHtncmVlblpvbmVzLmxlbmd0aH1dO2AgOiAnJ31gKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGRvbWVDYW5hbERpc3RhbmNlID0gMTAwMC4wO1xuZm9yIChpbnQgaSA9IDA7IGkgPCAke3NlZ21lbnRzLmxlbmd0aH07IGkrKykge1xuICB2ZWMyIGEgPSBkb21lQ2FuYWxTZWdtZW50c1tpXS54eSwgYWIgPSBkb21lQ2FuYWxTZWdtZW50c1tpXS56dyAtIGE7XG4gIGZsb2F0IHQgPSBjbGFtcChkb3QodkRvbWVDYW5hbC54eiAtIGEsIGFiKSAvIG1heChkb3QoYWIsIGFiKSwgMC4wMDEpLCAwLjAsIDEuMCk7XG4gIGRvbWVDYW5hbERpc3RhbmNlID0gbWluKGRvbWVDYW5hbERpc3RhbmNlLCBsZW5ndGgodkRvbWVDYW5hbC54eiAtIGEgLSBhYiAqIHQpKTtcbn1cbmZsb2F0IGRvbWVDYW5hbEludGVyaW9yID0gMS4wIC0gc21vb3Roc3RlcCg1MC4wLCA2My4wLCBtYXgoYWJzKHZEb21lQ2FuYWwueCksIGFicyh2RG9tZUNhbmFsLnopKSk7XG5mbG9hdCBkb21lQ2FuYWxHcmFpbiA9IHNpbih2RG9tZUNhbmFsLnggKiAxLjcgKyBzaW4odkRvbWVDYW5hbC56ICogMC44KSkgKiBzaW4odkRvbWVDYW5hbC56ICogMi4zKTtcbnZlYzMgZG9tZUNhbmFsUGlnbWVudCA9IGRvbWVDYW5hbEVhcnRoICogbWl4KDAuODIsIDEuMTMsIHNtb290aHN0ZXAoLTIuMCwgNC4wLCB2RG9tZUNhbmFsLnkpKTtcbiR7Z3JlZW5ab25lcy5sZW5ndGggPyBgZmxvYXQgcmVkRmllbGRzR3JlZW5NYXNrID0gMC4wO1xuZm9yIChpbnQgaSA9IDA7IGkgPCAke2dyZWVuWm9uZXMubGVuZ3RofTsgaSsrKSB7XG4gIHZlYzQgem9uZSA9IHJlZEZpZWxkc1pvbmVzW2ldO1xuICB2ZWMyIGluc2V0ID0gbWluKHZEb21lQ2FuYWwueHogLSB6b25lLnh5LCB6b25lLnp3IC0gdkRvbWVDYW5hbC54eik7XG4gIHJlZEZpZWxkc0dyZWVuTWFzayA9IG1heChyZWRGaWVsZHNHcmVlbk1hc2ssIHNtb290aHN0ZXAoMC4wLCAyLjAsIG1pbihpbnNldC54LCBpbnNldC55KSkpO1xufVxuZG9tZUNhbmFsUGlnbWVudCA9IG1peChkb21lQ2FuYWxQaWdtZW50LCByZWRGaWVsZHNHcmVlbiwgcmVkRmllbGRzR3JlZW5NYXNrICogMC44Mik7YCA6ICcnfVxuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBkb21lQ2FuYWxQaWdtZW50ICogKDEuMCArIGRvbWVDYW5hbEdyYWluICogMC4wMzUpLCAke2dyZWVuWm9uZXMubGVuZ3RoID8gJzAuNDgnIDogJzAuNTgnfSAqIGRvbWVDYW5hbEludGVyaW9yKTtcbmZsb2F0IGRvbWVDYW5hbEJlZE1hc2sgPSAxLjAgLSBzbW9vdGhzdGVwKDEuMywgMi4xLCBkb21lQ2FuYWxEaXN0YW5jZSk7XG5mbG9hdCBkb21lQ2FuYWxTaG91bGRlciA9IHNtb290aHN0ZXAoMS41LCAyLjEsIGRvbWVDYW5hbERpc3RhbmNlKSAqICgxLjAgLSBzbW9vdGhzdGVwKDIuOCwgMy44LCBkb21lQ2FuYWxEaXN0YW5jZSkpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBkb21lQ2FuYWxCZWQgKiAoMC45NCArIGRvbWVDYW5hbEdyYWluICogMC4wNCksICR7Z3JlZW5ab25lcy5sZW5ndGggPyAnMC40OCcgOiAnMC42OCd9ICogZG9tZUNhbmFsQmVkTWFzayAqIGRvbWVDYW5hbEludGVyaW9yKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZG9tZUNhbmFsRWFydGggKiAxLjIyLCAke2dyZWVuWm9uZXMubGVuZ3RoID8gJzAuMTgnIDogJzAuMzUnfSAqIGRvbWVDYW5hbFNob3VsZGVyICogZG9tZUNhbmFsSW50ZXJpb3IpO2ApO1xuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYHJlZGZpZWxkcy1kcnktcm91dGUtdjI6JHtzZWdtZW50cy5sZW5ndGh9OiR7Z3JlZW5ab25lcy5sZW5ndGh9YDtcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIFNlcGFyYXRlIGV4aXN0aW5nIHNoZWx2ZXMgZnJvbSB0aGVpciBsb3dlciBncm91bmQgd2l0aG91dCBtb3ZpbmcgYW55IHN1cmZhY2UuICovXG5mdW5jdGlvbiBncmFkZVRlcnJhaW5CeUhlaWdodChtb2RlbDogVEhSRUUuT2JqZWN0M0QsIGxvd0NvbG9yOiBzdHJpbmcsIGhpZ2hDb2xvcjogc3RyaW5nLCBsb3dIZWlnaHQ6IG51bWJlciwgaGlnaEhlaWdodDogbnVtYmVyLCBwYWludE1peDogbnVtYmVyKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuaGVpZ2h0UGFpbnRMb3cgPSB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IobG93Q29sb3IpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuaGVpZ2h0UGFpbnRIaWdoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKGhpZ2hDb2xvcikgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5oZWlnaHRQYWludFJhbmdlID0geyB2YWx1ZTogbmV3IFRIUkVFLlZlY3RvcjIobG93SGVpZ2h0LCBoaWdoSGVpZ2h0KSB9O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLmhlaWdodFBhaW50TWl4ID0geyB2YWx1ZTogcGFpbnRNaXggfTtcbiAgICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2SGVpZ2h0UGFpbnQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkhlaWdodFBhaW50ID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2SGVpZ2h0UGFpbnQ7XFxudW5pZm9ybSB2ZWMzIGhlaWdodFBhaW50TG93LCBoZWlnaHRQYWludEhpZ2g7XFxudW5pZm9ybSB2ZWMyIGhlaWdodFBhaW50UmFuZ2U7XFxudW5pZm9ybSBmbG9hdCBoZWlnaHRQYWludE1peDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGhlaWdodFBhaW50SW50ZXJpb3IgPSAxLjAgLSBzbW9vdGhzdGVwKDQ4LjAsIDY0LjAsIG1heChhYnModkhlaWdodFBhaW50LngpLCBhYnModkhlaWdodFBhaW50LnopKSk7XG5mbG9hdCBoZWlnaHRQYWludEZhY3RvciA9IHNtb290aHN0ZXAoaGVpZ2h0UGFpbnRSYW5nZS54LCBoZWlnaHRQYWludFJhbmdlLnksIHZIZWlnaHRQYWludC55KTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgbWl4KGhlaWdodFBhaW50TG93LCBoZWlnaHRQYWludEhpZ2gsIGhlaWdodFBhaW50RmFjdG9yKSwgaGVpZ2h0UGFpbnRNaXggKiBoZWlnaHRQYWludEludGVyaW9yKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICd0ZXJyYWluLWhlaWdodC1waWdtZW50LXYxJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIFByZXBhcmVkIGJvaWxlciBhcHJvbnMgYW5kIGNvbWJlZCBlYXJ0aCBmb2xsb3cgdGhlIGV4aXN0aW5nIHRlcnJhY2UvYmVkIGNvb3JkaW5hdGVzLiAqL1xuZnVuY3Rpb24gY2xhcmlmeVByZXNzdXJlR2FyZGVuVGVycmFjZXMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZ2FyZGVuV29ya2VkUGlnbWVudCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzk1Nzk1NycpIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMuZ2FyZGVuUm93UGlnbWVudCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzlkODY2MicpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdkdhcmRlbkdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52R2FyZGVuR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHo7Jyk7XG4gICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZHYXJkZW5Hcm91bmQ7XFxudW5pZm9ybSB2ZWMzIGdhcmRlbldvcmtlZFBpZ21lbnQ7XFxudW5pZm9ybSB2ZWMzIGdhcmRlblJvd1BpZ21lbnQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBnYXJkZW5YID0gYWJzKHZHYXJkZW5Hcm91bmQueCksIGdhcmRlblogPSB2R2FyZGVuR3JvdW5kLnk7XG5mbG9hdCBnYXJkZW5XaWR0aCA9IDEuMCAtIHNtb290aHN0ZXAoMzguMCwgNDQuMCwgZ2FyZGVuWCk7XG5mbG9hdCBnYXJkZW5TZXJ2aWNlID0gc21vb3Roc3RlcCg2LjI1LCA5LjAsIGdhcmRlblopICogKDEuMCAtIHNtb290aHN0ZXAoMTUuNSwgMTguMCwgZ2FyZGVuWikpICogZ2FyZGVuV2lkdGg7XG5mbG9hdCBnYXJkZW5Hcm93aW5nID0gc21vb3Roc3RlcCgxMS41LCAxMy4wLCBnYXJkZW5YKSAqICgxLjAgLSBzbW9vdGhzdGVwKDM3LjAsIDM4LjUsIGdhcmRlblgpKSAqIHNtb290aHN0ZXAoMTkuNSwgMjEuMCwgZ2FyZGVuWikgKiAoMS4wIC0gc21vb3Roc3RlcCgyOC4wLCAyOS41LCBnYXJkZW5aKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGdhcmRlbldvcmtlZFBpZ21lbnQsIGdhcmRlblNlcnZpY2UgKiAwLjMwKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgZ2FyZGVuUm93UGlnbWVudCwgZ2FyZGVuR3Jvd2luZyAqIDAuMjMpO1xuZmxvYXQgZ2FyZGVuUm93UGhhc2UgPSBhYnMoc2luKHZHYXJkZW5Hcm91bmQueCAqIDIuODUgKyBzaW4oZ2FyZGVuWiAqIDAuMTkpICogMC4xOCkpO1xuZmxvYXQgZ2FyZGVuUm93SW5rID0gMS4wIC0gc21vb3Roc3RlcCgwLjEwLCAwLjIwICsgZndpZHRoKGdhcmRlblJvd1BoYXNlKSwgZ2FyZGVuUm93UGhhc2UpO1xuZGlmZnVzZUNvbG9yLnJnYiAqPSAxLjAgLSBnYXJkZW5Hcm93aW5nICogZ2FyZGVuUm93SW5rICogMC4xODtcbmZsb2F0IGdhcmRlbkJlZFggPSBhYnModkdhcmRlbkdyb3VuZC54IC0gMTIuMCAqIGZsb29yKHZHYXJkZW5Hcm91bmQueCAvIDEyLjAgKyAwLjUpKTtcbmZsb2F0IGdhcmRlbkJlZCA9IG1heChnYXJkZW5CZWRYIC8gMi41LCBhYnMoZ2FyZGVuWiAtIDEyLjApIC8gMi4wKTtcbmZsb2F0IGdhcmRlbkFwcm9uID0gKDEuMCAtIHNtb290aHN0ZXAoMC42NSwgMS4yMCwgZ2FyZGVuQmVkKSkgKiAoMS4wIC0gc21vb3Roc3RlcCgxNS4wLCAxNi4wLCBnYXJkZW5YKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGdhcmRlbldvcmtlZFBpZ21lbnQgKiAxLjEyLCBnYXJkZW5BcHJvbiAqIDAuMTgpO1xuZmxvYXQgZ2FyZGVuQ3Jlc3QgPSBtYXgoMS4wIC0gc21vb3Roc3RlcCgwLjE1LCAwLjY1LCBhYnMoZ2FyZGVuWiAtIDIyLjQpKSwgMS4wIC0gc21vb3Roc3RlcCgwLjE1LCAwLjY1LCBhYnMoZ2FyZGVuWiAtIDM1LjQpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGdhcmRlblJvd1BpZ21lbnQsIGdhcmRlbkNyZXN0ICogZ2FyZGVuV2lkdGggKiAwLjIwKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdwcmVzc3VyZS1nYXJkZW4td29ya2VkLXRlcnJhY2VzLXYxJztcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqIFdvcmtlZCB5YXJkcyBhbmQgcGFsZSBiYWxsYXN0IGZvbGxvdyB0aGUgdHdvIHB1Ymxpc2hlZCBmdW5pY3VsYXIgbGluZXMgYW5kIHRlcnJhY2UgdG9wcy4gKi9cbmZ1bmN0aW9uIGNsYXJpZnlJbmNsaW5lWWFyZHMobW9kZWw6IFRIUkVFLk9iamVjdDNEKTogdm9pZCB7XG4gIGlmIChpc01hcEJlYXV0eURpc2FibGVkKCkpIHJldHVybjtcbiAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD4oKTtcbiAgbW9kZWwudHJhdmVyc2Uobm9kZSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWw+O1xuICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwgJiYgbWVzaC5tYXRlcmlhbC5tYXApIG1hdGVyaWFscy5hZGQobWVzaC5tYXRlcmlhbCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIG1hdGVyaWFscykge1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMuaW5jbGluZUVhcnRoID0geyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKCcjOTI3OTVjJykgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5pbmNsaW5lQmFsbGFzdCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignI2FhYTA4OCcpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdkluY2xpbmVHcm91bmQ7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XFxudkluY2xpbmVHcm91bmQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdkluY2xpbmVHcm91bmQ7XFxudW5pZm9ybSB2ZWMzIGluY2xpbmVFYXJ0aDtcXG51bmlmb3JtIHZlYzMgaW5jbGluZUJhbGxhc3Q7JylcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+JywgYCNpbmNsdWRlIDxtYXBfZnJhZ21lbnQ+XG5mbG9hdCBpbmNsaW5lWCA9IGFicyh2SW5jbGluZUdyb3VuZC54KSwgaW5jbGluZVogPSB2SW5jbGluZUdyb3VuZC55O1xuZmxvYXQgaW5jbGluZURyeSA9IHNtb290aHN0ZXAoNi4yNSwgOS4wLCBhYnMoaW5jbGluZVopKTtcbmZsb2F0IGluY2xpbmVJbnRlcmlvciA9IDEuMCAtIHNtb290aHN0ZXAoMzguMCwgNDcuMCwgbWF4KGluY2xpbmVYLCBhYnMoaW5jbGluZVopKSk7XG5mbG9hdCBpbmNsaW5lUmFpbCA9IDEuMCAtIHNtb290aHN0ZXAoMC43NSwgMS43NSwgYWJzKGluY2xpbmVYIC0gMTIuMCkpO1xuZGlmZnVzZUNvbG9yLnJnYiA9IG1peChkaWZmdXNlQ29sb3IucmdiLCBpbmNsaW5lRWFydGgsIDAuMjggKiBpbmNsaW5lRHJ5ICogaW5jbGluZUludGVyaW9yKTtcbmRpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoZGlmZnVzZUNvbG9yLnJnYiwgaW5jbGluZUJhbGxhc3QsIDAuNDIgKiBpbmNsaW5lUmFpbCAqIGluY2xpbmVEcnkgKiBpbmNsaW5lSW50ZXJpb3IpO1xuZmxvYXQgaW5jbGluZUNyZXN0ID0gbWF4KDEuMCAtIHNtb290aHN0ZXAoMC4yLCAwLjksIGFicyhpbmNsaW5lWiAtIDEzLjApKSwgbWF4KDEuMCAtIHNtb290aHN0ZXAoMC4yLCAwLjksIGFicyhpbmNsaW5lWiAtIDI4LjApKSwgMS4wIC0gc21vb3Roc3RlcCgwLjIsIDAuOSwgYWJzKGluY2xpbmVaIC0gNDIuMCkpKSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGluY2xpbmVCYWxsYXN0LCAwLjIyICogaW5jbGluZUNyZXN0ICogaW5jbGluZUludGVyaW9yKTtgKTtcbiAgICB9O1xuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdpbmNsaW5lLXdvcmtlZC15YXJkcy12MSc7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKiBRdWlldCB0aGUgY2FueW9uJ3MgcmVwZWF0ZWQgaGF0Y2ggYW5kIGNhcnJ5IGl0cyBlYXJ0aCB2YWx1ZSBpbnRvIHRoZSBwYWludGVkIGFwcm9uLiAqL1xuZnVuY3Rpb24gY2xhcmlmeUNhbnlvbkdyb3VuZChtb2RlbDogVEhSRUUuT2JqZWN0M0QsIHBhbm9yYW1hID0gZmFsc2UpOiB2b2lkIHtcbiAgaWYgKGlzTWFwQmVhdXR5RGlzYWJsZWQoKSkgcmV0dXJuO1xuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZShub2RlID0+IHtcbiAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgaWYgKG1lc2guaXNNZXNoICYmICFBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpICYmIG1lc2gubWF0ZXJpYWwuaXNNZXNoU3RhbmRhcmRNYXRlcmlhbCkgbWF0ZXJpYWxzLmFkZChtZXNoLm1hdGVyaWFsKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy5jYW55b25FYXJ0aCA9IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcignIzgwNmE1MycpIH07XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzMgdkNhbnlvbkdyb3VuZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52Q2FueW9uR3JvdW5kID0gKG1vZGVsTWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKSkueHl6OycpO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMyB2Q2FueW9uR3JvdW5kO1xcbnVuaWZvcm0gdmVjMyBjYW55b25FYXJ0aDsnKTtcbiAgICAgIGlmIChwYW5vcmFtYSkge1xuICAgICAgICAvLyBUaGUgYXByb24gYmVsb25ncyB0byB0aGUgcGFub3JhbWEgbWVzaCwgbm90IHRoZSBoZWlnaHRmaWVsZC4gUHJlc2VydmUgc2t5IHBhaW50LlxuICAgICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZSgnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8ZW1pc3NpdmVtYXBfZnJhZ21lbnQ+XG5mbG9hdCBjYW55b25BcHJvbiA9ICgxLjAgLSBzbW9vdGhzdGVwKDY2LjAsIDEwOC4wLCBtYXgoYWJzKHZDYW55b25Hcm91bmQueCkgKiA1Ni4wIC8gNDguMCwgYWJzKHZDYW55b25Hcm91bmQueikpKSkgKiAoMS4wIC0gc21vb3Roc3RlcCgxLjAsIDguMCwgdkNhbnlvbkdyb3VuZC55KSk7XG50b3RhbEVtaXNzaXZlUmFkaWFuY2UgPSBtaXgodG90YWxFbWlzc2l2ZVJhZGlhbmNlLCBjYW55b25FYXJ0aCAqIDAuMzIsIGNhbnlvbkFwcm9uICogMC42NSk7YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgI2luY2x1ZGUgPG1hcF9mcmFnbWVudD5cbmZsb2F0IGNhbnlvbkRyeSA9IHNtb290aHN0ZXAoNi4yNSwgOS4wLCBhYnModkNhbnlvbkdyb3VuZC56KSk7XG5kaWZmdXNlQ29sb3IucmdiID0gbWl4KGRpZmZ1c2VDb2xvci5yZ2IsIGNhbnlvbkVhcnRoLCAwLjM0ICogY2FueW9uRHJ5KTtcbmZsb2F0IGNhbnlvblNoZWxmID0gc21vb3Roc3RlcCgwLjUsIDYuMCwgdkNhbnlvbkdyb3VuZC55KTtcbmRpZmZ1c2VDb2xvci5yZ2IgKj0gMS4wICsgY2FueW9uU2hlbGYgKiAwLjEwO2ApO1xuICAgICAgfVxuICAgIH07XG4gICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYGNhbnlvbi1ncm91bmQtdjEtJHtwYW5vcmFtYX1gO1xuICAgIG1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseU5pZ2h0VGVycmFpblBvb2xzKG1vZGVsOiBUSFJFRS5PYmplY3QzRCwgaG9zdDogSG9zdCwgb3BhcXVlTGFuZG1hcmsgPSBmYWxzZSk6IHZvaWQge1xuICAvLyBDYXJyaWVkIHBvb2xzIHVzZSB0aGUgcmlnJ3Mgc3RlZWwtYmx1ZSBmYW1pbHkgYXQgdGhlIHByaW9yIGdyb3VuZCB0aW50J3MgbHVtaW5hbmNlLlxuICBjb25zdCBtYXRlcmlhbHMgPSBuZXcgU2V0PFRIUkVFLk1hdGVyaWFsPigpO1xuICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBub2RlIGFzIFRIUkVFLk1lc2g7XG4gICAgaWYgKCFtZXNoLmlzTWVzaCkgcmV0dXJuO1xuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIG1lc2gucmVuZGVyT3JkZXIgPSAwLjE7XG4gICAgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkgbWF0ZXJpYWxzLmFkZChtYXRlcmlhbCk7XG4gIH0pO1xuICBjb25zdCBwb29sU291cmNlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IE5JR0hUX1BPT0xfU0hBREVSX0NBUCB9LCAoKSA9PiBuZXcgVEhSRUUuVmVjdG9yNCgpKTtcbiAgY29uc3QgcG9vbENvdW50ID0geyB2YWx1ZTogMCB9O1xuICBjb25zdCBwb29sRGFya25lc3MgPSB7IHZhbHVlOiAwIH07XG4gIGNvbnN0IHBvb2xJbnRlbnNpdHkgPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnRlcnJhaW5Qb29sSW50ZW5zaXR5IH07XG4gIGNvbnN0IHBvb2xGYWxsb2ZmID0geyB2YWx1ZTogQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5saWdodEZhbGxvZmYgfTtcbiAgY29uc3QgcG9vbENhbmRpZGF0ZXM6IExpZ2h0U291cmNlW10gPSBbXTtcbiAgY29uc3QgcG9vbEdyYWRlU3RyZW5ndGggPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZVN0cmVuZ3RoIH07XG4gIGNvbnN0IHBvb2xHcmFkZUtuZWUgPSB7IHZhbHVlOiBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZUtuZWUgfTtcbiAgY29uc3QgcG9vbEdyYWRlQ2VpbGluZyA9IHsgdmFsdWU6IEJhbGFuY2UuY29udHJhY3RzLm5pZ2h0U2hpZnQucG9vbEdyYWRlQ2VpbGluZyB9O1xuICBjb25zdCBwb29sR3JhZGVFbmFibGVkID0gIWlzUG9vbEdyYWRlRGlzYWJsZWQoKTtcbiAgbGV0IGxhc3RVcGRhdGVkRnJhbWUgPSAtMTtcbiAgY29uc3QgdXBkYXRlTmlnaHRQb29scyA9IChyZW5kZXJlcjogVEhSRUUuV2ViR0xSZW5kZXJlcikgPT4ge1xuICAgIGlmIChyZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZSA9PT0gbGFzdFVwZGF0ZWRGcmFtZSkgcmV0dXJuO1xuICAgIGxhc3RVcGRhdGVkRnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICAvLyBMaXZlIEJhbGFuY2UgcmVhZHMgc28gdGhlIGNhcHR1cmUgcmlnIGNhbiBBL0IgdGhlIGdyYWRlIGluIG9uZSBzZXNzaW9uIHZpYSBzZXRCYWxhbmNlLlxuICAgIHBvb2xHcmFkZVN0cmVuZ3RoLnZhbHVlID0gQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5wb29sR3JhZGVTdHJlbmd0aDtcbiAgICBwb29sR3JhZGVLbmVlLnZhbHVlID0gQmFsYW5jZS5jb250cmFjdHMubmlnaHRTaGlmdC5wb29sR3JhZGVLbmVlO1xuICAgIHBvb2xHcmFkZUNlaWxpbmcudmFsdWUgPSBCYWxhbmNlLmNvbnRyYWN0cy5uaWdodFNoaWZ0LnBvb2xHcmFkZUNlaWxpbmc7XG4gICAgY29uc3Qgc25hcHNob3QgPSBob3N0Lm5pZ2h0TGlnaHRpbmc/LigpO1xuICAgIHBvb2xEYXJrbmVzcy52YWx1ZSA9IHNuYXBzaG90Py5kYXJrbmVzcyA/PyAwO1xuICAgIHBvb2xDYW5kaWRhdGVzLmxlbmd0aCA9IDA7XG4gICAgZm9yIChjb25zdCBzb3VyY2Ugb2Ygc25hcHNob3Q/LnNvdXJjZXMgPz8gW10pIHtcbiAgICAgIGlmIChzb3VyY2Uua2luZCAhPT0gJ3dhdGNoJykgcG9vbENhbmRpZGF0ZXMucHVzaChzb3VyY2UpO1xuICAgIH1cbiAgICBwb29sQ2FuZGlkYXRlcy5zb3J0KChhLCBiKSA9PiBuaWdodFBvb2xQcmlvcml0eShhKSAtIG5pZ2h0UG9vbFByaW9yaXR5KGIpIHx8IGEuaWQubG9jYWxlQ29tcGFyZShiLmlkKSk7XG4gICAgcG9vbENvdW50LnZhbHVlID0gTWF0aC5taW4ocG9vbENhbmRpZGF0ZXMubGVuZ3RoLCBOSUdIVF9QT09MX1NIQURFUl9DQVApO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBOSUdIVF9QT09MX1NIQURFUl9DQVA7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZSA9IGluZGV4IDwgcG9vbENvdW50LnZhbHVlID8gcG9vbENhbmRpZGF0ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xuICAgICAgcG9vbFNvdXJjZXNbaW5kZXhdIS5zZXQoc291cmNlPy54ID8/IDAsIHNvdXJjZT8ueiA/PyAwLCBzb3VyY2U/LnJhZGl1cyA/PyAwLCBpc1dhcm1Qb29sKHNvdXJjZSkgPyAxIDogMCk7XG4gICAgfVxuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xTb3VyY2VzID0gU3RyaW5nKHBvb2xDb3VudC52YWx1ZSk7XG4gIH07XG4gIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxzKSB7XG4gICAgaWYgKCEobWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGNvbXBpbGUgPSBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUuYmluZChtYXRlcmlhbCk7XG4gICAgLy8gVGhlIHNhbWUgcGh5c2ljYWwgcG9vbHMgY2FuIGlsbHVtaW5hdGUgYSB5YXJkIHN0YW5kaW5nIGluIHRoZW0sIHdpdGhvdXRcbiAgICAvLyBpbmhlcml0aW5nIHRlcnJhaW4ncyB0cmFuc3BhcmVudCBjb21wb3NpdGluZyBvciBkaXNhYmxpbmcgaXRzIGRlcHRoLlxuICAgIGlmICghb3BhcXVlTGFuZG1hcmspIHtcbiAgICAgIG1hdGVyaWFsLnRyYW5zcGFyZW50ID0gdHJ1ZTtcbiAgICAgIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgICB9XG4gICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlciwgcmVuZGVyZXIpID0+IHtcbiAgICAgIGNvbXBpbGUoc2hhZGVyLCByZW5kZXJlcik7XG4gICAgICBzaGFkZXIudW5pZm9ybXMudVRlcnJhaW4zZE5pZ2h0UG9vbENvdW50ID0gcG9vbENvdW50O1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xEYXJrbmVzcyA9IHBvb2xEYXJrbmVzcztcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sSW50ZW5zaXR5ID0gcG9vbEludGVuc2l0eTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sRmFsbG9mZiA9IHBvb2xGYWxsb2ZmO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xzID0geyB2YWx1ZTogcG9vbFNvdXJjZXMgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51VGVycmFpbjNkTmlnaHRQb29sR3JhZGVTdHJlbmd0aCA9IHBvb2xHcmFkZVN0cmVuZ3RoO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWUgPSBwb29sR3JhZGVLbmVlO1xuICAgICAgc2hhZGVyLnVuaWZvcm1zLnVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUNlaWxpbmcgPSBwb29sR3JhZGVDZWlsaW5nO1xuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUZXJyYWluM2RXb3JsZDsnKVxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52VGVycmFpbjNkV29ybGQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAnI2luY2x1ZGUgPGNvbW1vbj4nLFxuICAgICAgICAgIGAjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2VGVycmFpbjNkV29ybGQ7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sQ291bnQ7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sRGFya25lc3M7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sSW50ZW5zaXR5O1xcbnVuaWZvcm0gZmxvYXQgdVRlcnJhaW4zZE5pZ2h0UG9vbEZhbGxvZmY7XFxudW5pZm9ybSB2ZWM0IHVUZXJyYWluM2ROaWdodFBvb2xzWyR7TklHSFRfUE9PTF9TSEFERVJfQ0FQfV07YCxcbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAnI2luY2x1ZGUgPGVtaXNzaXZlbWFwX2ZyYWdtZW50PicsXG4gICAgICAgICAgYCNpbmNsdWRlIDxlbWlzc2l2ZW1hcF9mcmFnbWVudD5cXG52ZWMzIHRlcnJhaW4zZFBvb2xMaWdodCA9IHZlYzMoMC4wKTtcXG5mb3IgKGludCB0ZXJyYWluM2RQb29sSW5kZXggPSAwOyB0ZXJyYWluM2RQb29sSW5kZXggPCAke05JR0hUX1BPT0xfU0hBREVSX0NBUH07IHRlcnJhaW4zZFBvb2xJbmRleCsrKSB7XFxuICBpZiAoZmxvYXQodGVycmFpbjNkUG9vbEluZGV4KSA+PSB1VGVycmFpbjNkTmlnaHRQb29sQ291bnQpIGJyZWFrO1xcbiAgdmVjNCB0ZXJyYWluM2RQb29sID0gdVRlcnJhaW4zZE5pZ2h0UG9vbHNbdGVycmFpbjNkUG9vbEluZGV4XTtcXG4gIGZsb2F0IHRlcnJhaW4zZFBvb2xEaXN0YW5jZSA9IGRpc3RhbmNlKHZUZXJyYWluM2RXb3JsZCwgdGVycmFpbjNkUG9vbC54eSk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sRmFsbG9mZlQgPSBjbGFtcCgodGVycmFpbjNkUG9vbERpc3RhbmNlIC0gdGVycmFpbjNkUG9vbC56KSAvIHVUZXJyYWluM2ROaWdodFBvb2xGYWxsb2ZmLCAwLjAsIDEuMCk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sRmFsbG9mZiA9IHBvdygxLjAgLSB0ZXJyYWluM2RQb29sRmFsbG9mZlQsIDEuNSk7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sQ29yZSA9IDEuMCAtIHNtb290aHN0ZXAoMC4wLCAwLjUsIHRlcnJhaW4zZFBvb2xEaXN0YW5jZSAvIG1heCh0ZXJyYWluM2RQb29sLnosIDAuMDAwMSkpO1xcbiAgdmVjMyB0ZXJyYWluM2RQb29sV2FybSA9IG1peCh2ZWMzKDEuMDAsIDAuNDg1LCAwLjEwKSwgdmVjMygxLjAwLCAwLjYyLCAwLjIwKSwgdGVycmFpbjNkUG9vbENvcmUpO1xcbiAgdmVjMyB0ZXJyYWluM2RQb29sVGludCA9IG1peCh2ZWMzKDAuMzI5LCAwLjQ3MywgMC41OTYpLCB0ZXJyYWluM2RQb29sV2FybSwgc3RlcCgwLjUsIHRlcnJhaW4zZFBvb2wudykpO1xcbiAgdGVycmFpbjNkUG9vbExpZ2h0ID0gbWF4KHRlcnJhaW4zZFBvb2xMaWdodCwgdGVycmFpbjNkUG9vbFRpbnQgKiB0ZXJyYWluM2RQb29sRmFsbG9mZik7XFxufVxcbnRvdGFsRW1pc3NpdmVSYWRpYW5jZSArPSBkaWZmdXNlQ29sb3IucmdiICogdGVycmFpbjNkUG9vbExpZ2h0ICogdVRlcnJhaW4zZE5pZ2h0UG9vbERhcmtuZXNzICogdVRlcnJhaW4zZE5pZ2h0UG9vbEludGVuc2l0eTtgLFxuICAgICAgICApO1xuXG4gICAgICBpZiAocG9vbEdyYWRlRW5hYmxlZCkge1xuICAgICAgICAvLyBTZWNvbmQtc3RhZ2UgcmV3cml0ZXMgb3ZlciB0aGUgYmxvY2sgYWJvdmU6IHRyYWNrIHRoZSBzdHJvbmdlc3Qgd2FybSBwb29sJ3MgY292ZXJhZ2VcbiAgICAgICAgLy8gYW5kIHBlci1mcmFnbWVudCB3YXJtIHRpbnQgdGhyb3VnaCB0aGUgZXhpc3RpbmcgbG9vcCwgdGhlbiBncmFkZSBvdXRnb2luZ0xpZ2h0IHJpZ2h0XG4gICAgICAgIC8vIGJlZm9yZSBBQ0VTLiBVbmRlciA/bm9wb29sZ3JhZGUgbm9uZSBvZiB0aGVzZSBydW4gYW5kIHRoZSBzaGFkZXIgaXMgYnl0ZS1pZGVudGljYWwuXG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3VuaWZvcm0gdmVjNCB1VGVycmFpbjNkTmlnaHRQb29scycsXG4gICAgICAgICAgICAndW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVTdHJlbmd0aDtcXG51bmlmb3JtIGZsb2F0IHVUZXJyYWluM2ROaWdodFBvb2xHcmFkZUtuZWU7XFxudW5pZm9ybSBmbG9hdCB1VGVycmFpbjNkTmlnaHRQb29sR3JhZGVDZWlsaW5nO1xcbnVuaWZvcm0gdmVjNCB1VGVycmFpbjNkTmlnaHRQb29scycsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3ZlYzMgdGVycmFpbjNkUG9vbExpZ2h0ID0gdmVjMygwLjApOycsXG4gICAgICAgICAgICAndmVjMyB0ZXJyYWluM2RQb29sTGlnaHQgPSB2ZWMzKDAuMCk7XFxuZmxvYXQgdGVycmFpbjNkUG9vbEdyYWRlTWFzayA9IDAuMDtcXG52ZWMzIHRlcnJhaW4zZFBvb2xHcmFkZVRpbnQgPSB2ZWMzKDEuMDAsIDAuNjIsIDAuMjApOycsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgJ3RlcnJhaW4zZFBvb2xMaWdodCA9IG1heCh0ZXJyYWluM2RQb29sTGlnaHQsIHRlcnJhaW4zZFBvb2xUaW50ICogdGVycmFpbjNkUG9vbEZhbGxvZmYpOycsXG4gICAgICAgICAgICAndGVycmFpbjNkUG9vbExpZ2h0ID0gbWF4KHRlcnJhaW4zZFBvb2xMaWdodCwgdGVycmFpbjNkUG9vbFRpbnQgKiB0ZXJyYWluM2RQb29sRmFsbG9mZik7XFxuICBmbG9hdCB0ZXJyYWluM2RQb29sV2FybUNvdmVyYWdlID0gdGVycmFpbjNkUG9vbEZhbGxvZmYgKiBzdGVwKDAuNSwgdGVycmFpbjNkUG9vbC53KTtcXG4gIGlmICh0ZXJyYWluM2RQb29sV2FybUNvdmVyYWdlID4gdGVycmFpbjNkUG9vbEdyYWRlTWFzaykge1xcbiAgICB0ZXJyYWluM2RQb29sR3JhZGVNYXNrID0gdGVycmFpbjNkUG9vbFdhcm1Db3ZlcmFnZTtcXG4gICAgdGVycmFpbjNkUG9vbEdyYWRlVGludCA9IHRlcnJhaW4zZFBvb2xXYXJtO1xcbiAgfScsXG4gICAgICAgICAgKVxuICAgICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8b3BhcXVlX2ZyYWdtZW50PicsIGAke1BPT0xfR1JBREVfR0xTTH1cXG4jaW5jbHVkZSA8b3BhcXVlX2ZyYWdtZW50PmApO1xuICAgICAgfVxuICAgIH07XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICBpZiAobWVzaC5pc01lc2gpIG1lc2gub25CZWZvcmVSZW5kZXIgPSB1cGRhdGVOaWdodFBvb2xzO1xuICB9KTtcbiAgaWYgKCFvcGFxdWVMYW5kbWFyaykge1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xzID0gJ3dvcmxkLXNoYWRlcic7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdE5pZ2h0UG9vbFNvdXJjZXMgPSAnMCc7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmlnaHRQb29sUHJpb3JpdHkoc291cmNlOiBMaWdodFNvdXJjZSk6IG51bWJlciB7XG4gIGlmIChzb3VyY2Uua2luZCA9PT0gJ2hlcm8nKSByZXR1cm4gMDtcbiAgaWYgKHNvdXJjZS5raW5kID09PSAncHJvc3BlY3RvcicpIHJldHVybiAxO1xuICBpZiAoc291cmNlLmtpbmQgPT09ICdsYW50ZXJuJyB8fCBzb3VyY2Uua2luZCA9PT0gJ3Bvd2VyZWQtbGFtcCcpIHJldHVybiAyO1xuICByZXR1cm4gMztcbn1cblxuZnVuY3Rpb24gaXNXYXJtUG9vbChzb3VyY2U6IExpZ2h0U291cmNlIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG4gIHJldHVybiBzb3VyY2U/LmtpbmQgIT09ICdoZXJvJyAmJiBzb3VyY2U/LmtpbmQgIT09ICdwcm9zcGVjdG9yJztcbn1cblxuLyoqXG4gKiBUaGUgM0QgcGlsb3QgaGlkZXMgYFNwcmluZ1BvbmRzYCBhbG9uZyB3aXRoIGV2ZXJ5IG90aGVyIHBhaW50ZWQgZ3JvdW5kIGxheWVyLCB3aGljaCBvbiBhIG1hcCB3aG9zZVxuICogd2hvbGUgc3RvcnkgaXMgb25lIHNwcmluZyBsZWF2ZXMgdGhlIHdhdGVyIGFzIGJha2VkIGF0bGFzIHBhaW50LiBDb250cmFjdHMgaW5cbiAqIGBMSVZFX1NQUklOR19QT05EX0NPTlRSQUNUU2AgZ2V0IHRoYXQgc3VyZmFjZSBiYWNrIGFzIHJlbmRlci1vbmx5IGdlb21ldHJ5LiBXYXRlciB1c2VzIHRoZSBzaW0nc1xuICogYHdhdGVyU291cmNlc1tdLnJhZGl1c2A7IHRoZSBtZWFzdXJlZCBhdGxhcyBjYXAgb25seSBzaXplcyB0aGUgc2VwYXJhdGUgZGFtcC1ncm91bmQgY292ZXIuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxpdmVTcHJpbmdQb25kcyhob3N0OiBIb3N0LCBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIpOiBTcHJpbmdQb25kU3VyZmFjZVtdIHtcbiAgY29uc3QgcG9vbCA9IExJVkVfU1BSSU5HX1BPTkRfQ09OVFJBQ1RTLmdldChob3N0LmNvbnRyYWN0SWQpO1xuICBpZiAoIXBvb2wpIHJldHVybiBbXTtcbiAgcmV0dXJuIHdhdGVyU291cmNlcygpXG4gICAgLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2Uua2luZCA9PT0gJ3NwcmluZ19wb25kJylcbiAgICAubWFwKChzb3VyY2UpID0+IGNyZWF0ZVNwcmluZ1BvbmRTdXJmYWNlKHtcbiAgICAgIHg6IHNvdXJjZS54LFxuICAgICAgejogc291cmNlLnosXG4gICAgICByYWRpdXM6IHNvdXJjZS5yYWRpdXMsXG4gICAgICBzdXJmYWNlWTogaGVpZ2h0QXQoc291cmNlLngsIHNvdXJjZS56KSArIHBvb2wuc3VyZmFjZVksXG4gICAgICBoZWlnaHRBdCxcbiAgICB9KSk7XG59XG5cbmZ1bmN0aW9uIGhpZGVQYWludGVkUmVsaWVmKGhvc3Q6IEhvc3QpOiBIaWRkZW5SZWxpZWZbXSB7XG4gIGNvbnN0IG9iamVjdHMgPSBuZXcgU2V0PFRIUkVFLk9iamVjdDNEPigpO1xuICBob3N0LnNjZW5lLnRyYXZlcnNlKChvYmplY3QpID0+IHtcbiAgICBpZiAoXG4gICAgICBvYmplY3QudXNlckRhdGEudGVycmFpblJlbGllZiA9PT0gdHJ1ZSB8fFxuICAgICAgb2JqZWN0LnVzZXJEYXRhLnRlcnJhaW5WaXN0YSA9PT0gdHJ1ZSB8fFxuICAgICAgTEVHQUNZX0dST1VORF9TTE9UUy5oYXMoU3RyaW5nKG9iamVjdC51c2VyRGF0YS5hc3NldFNsb3QpKSB8fFxuICAgICAgb2JqZWN0Lm5hbWUgPT09ICdTcHJpbmdQb25kcycgfHxcbiAgICAgIG9iamVjdC5uYW1lID09PSAnRm9yZFN0ZXBwaW5nU3RvbmVzJyB8fFxuICAgICAgb2JqZWN0Lm5hbWUuc3RhcnRzV2l0aCgnUml2ZXJHcmF2ZWxCYXIuJylcbiAgICApIG9iamVjdHMuYWRkKG9iamVjdCk7XG4gIH0pO1xuICBpZiAoaG9zdC5wYWludGVkR3JvdW5kKSBvYmplY3RzLmFkZChob3N0LnBhaW50ZWRHcm91bmQpO1xuICBjb25zdCBoaWRkZW4gPSBbLi4ub2JqZWN0c10ubWFwKChvYmplY3QpID0+ICh7IG9iamVjdCwgdmlzaWJsZTogb2JqZWN0LnZpc2libGUgfSkpO1xuICBmb3IgKGNvbnN0IHsgb2JqZWN0IH0gb2YgaGlkZGVuKSBvYmplY3QudmlzaWJsZSA9IGZhbHNlO1xuICByZXR1cm4gaGlkZGVuO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGFubmVsV2F0ZXIoY29udHJhY3RJZDogc3RyaW5nLCBjb250cmFjdDogQ29udHJhY3QsIGhlaWdodEF0OiAoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcik6IFRIUkVFLkdyb3VwIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZHJlc3NpbmcgPSBDT05UUkFDVF9DSEFOTkVMX1dBVEVSW2NvbnRyYWN0SWRdO1xuICBjb25zdCByZWdpb25zID0gY29udHJhY3QubWFza1RydXRoPy53YXRlck1hc2s/LnJlZ2lvbnMgPz8gW107XG4gIGlmICghZHJlc3NpbmcgfHwgcmVnaW9ucy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWQ7XG4gIC8vIGA/bm9jaGFubmVsd2F0ZXJgIGJvb3RzIHRoZSBpZGVudGljYWwgYnVpbGQgd2l0aCB0aGUgZHJlc3Npbmcgd2l0aGhlbGQuIEl0IGV4aXN0cyBiZWNhdXNlIGFcbiAgLy8gYmVhdXR5IGNsYWltIGlzIG9ubHkgd29ydGggd2hhdCBpdHMgQS9CIHByb3ZlcywgYW5kIGl0IGFsc28gYW5zd2VycyBcImlzIHRoaXMgcmVuZGVyIG9yIHNpbT9cIlxuICAvLyBpbiBvbmUgcmVsb2FkOiBldmVyeSBzdWl0ZSBiZWhhdmVzIGlkZW50aWNhbGx5IHdpdGggaXQgb24sIGJlY2F1c2UgdGhlIHdhdGVyIGlzIGRlY29yYXRpb24uXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmhhcygnbm9jaGFubmVsd2F0ZXInKSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3Qgd2FkZSA9IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGg7XG4gIGNvbnN0IGRlZXAgPSBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoO1xuICBjb25zdCBncm91cCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuICBncm91cC5uYW1lID0gJ1RlcnJhaW4zZENoYW5uZWxXYXRlcic7XG4gIGdyb3VwLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBmb3IgKGNvbnN0IHJlZ2lvbiBvZiByZWdpb25zKSB7XG4gICAgY29uc3QgY2hhbm5lbCA9IGRyZXNzaW5nLmNoYW5uZWxzW3JlZ2lvbi5pZF07XG4gICAgY29uc3QgcG9pbnRzID0gcmVnaW9uLnBvaW50cyA/PyBbXTtcbiAgICBpZiAoIWNoYW5uZWwgfHwgcmVnaW9uLmtpbmQgIT09ICdwb2x5bGluZV9iYW5kJyB8fCByZWdpb24uem9uZSAhPT0gJ3JpdmVyJyB8fCBwb2ludHMubGVuZ3RoIDwgMiB8fCAhcmVnaW9uLmhhbGZXaWR0aCkgY29udGludWU7XG4gICAgZ3JvdXAuYWRkKGNyZWF0ZVdhdGVyUmliYm9uKHtcbiAgICAgIG5hbWU6IGBUZXJyYWluM2RDaGFubmVsV2F0ZXIuJHtyZWdpb24uaWR9YCxcbiAgICAgIHBvaW50cyxcbiAgICAgIGhhbGZXaWR0aDogcmVnaW9uLmhhbGZXaWR0aCxcbiAgICAgIGVkZ2VCbGVlZDogZHJlc3NpbmcuZWRnZUJsZWVkLFxuICAgICAgLy8gVGhlIG1hc2sgYWdyZWVtZW50IG1lYXN1cmVkIDAgZHJ5IGdyb3VuZCBpbnNpZGUgdGhlIG1hc2sgYXQgdGhpcyBwbGFuZSwgc28gYSBzdXJmYWNlXG4gICAgICAvLyBqdXN0IGFib3ZlIGl0IGNvdmVycyB0aGUgY3V0IGNoYW5uZWwgYW5kIG5vdGhpbmcgZWxzZS4gRGVwdGgtdGVzdGVkLCBzbyB3aGVyZXZlciB0aGVcbiAgICAgIC8vIHJpYmJvbiB3b3VsZCBzdHJheSBvbnRvIGEgYmFuayB0aGUgc2N1bHB0IGl0c2VsZiBvY2NsdWRlcyBpdC5cbiAgICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCxcbiAgICAgIC8vIFJlbmRlciBkZXB0aCwgbm90IHNpbSBkZXB0aDogaXQgb25seSBwaWNrcyBhIHBvaW50IG9uIHRoZSBzaGFkZXIncyB3YWRlLi5kZWVwIGNvbG91clxuICAgICAgLy8gcmFtcCwgc28gdGhlIGNvbnRyYWN0J3Mgbm9ydGgtZGVlcGVyLXRoYW4tc291dGggT1JERVIgcmVhZHMgYXMgY29sb3VyIGFuZCBmb2FtLlxuICAgICAgZGVwdGg6IGNoYW5uZWwuZGVwdGggPT09ICdkZWVwJyA/IGRlZXAgOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIDAuMzQsXG4gICAgICBnbGludHM6IGNoYW5uZWwuZ2xpbnRzID8/IFtdLFxuICAgICAgaGVhZEluc2V0OiBjaGFubmVsLmhlYWRJbnNldCxcbiAgICAgIHRhaWxJbnNldDogY2hhbm5lbC50YWlsSW5zZXQsXG4gICAgICBoZWFkRmFkZTogY2hhbm5lbC5oZWFkRmFkZSxcbiAgICAgIHRhaWxGYWRlOiBjaGFubmVsLnRhaWxGYWRlLFxuICAgICAgYmVkOiB7IGhlaWdodEF0LCAuLi5kcmVzc2luZy5iZWQgfSxcbiAgICB9KSk7XG4gIH1cbiAgZ3JvdXAuYWRkKGNyZWF0ZVdhdGVyQ29uZmx1ZW5jZSh7XG4gICAgbmFtZTogJ1RlcnJhaW4zZENoYW5uZWxXYXRlci5jb25mbHVlbmNlcycsXG4gICAgcGF0aHM6IGRyZXNzaW5nLmNvbmZsdWVuY2VzLm1hcCgoY29uZmx1ZW5jZSkgPT4gY29uZmx1ZW5jZS5wb2ludHMpLFxuICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCArIDAuMDAxLFxuICAgIGRlcHRoOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIDAuNTgsXG4gIH0pKTtcbiAgLy8gVEhFIENST1NTSU5HUyBSRUFEIFdFVCAoYmVhdXR5IFUyJ3MgYWZmb3JkYW5jZSBoYWxmKS4gQm90aCBmb3JkcyBhcmUgY3V0IGJlbG93IHRoZSB3YXRlciBwbGFuZVxuICAvLyBhY3Jvc3MgYW4gMTEgbSBiYW5kIHdoaWxlIG9ubHkgYSAzLjQgbSByaWJib24gY3Jvc3NlcyB0aGVtLCBzbyB0aGUgcGFucyByZW5kZXJlZCBhcyBicm93blxuICAvLyBncmF2ZWwgd2l0aCBhIHN0cmlwZSBvZiByaXZlciB0aHJvdWdoIGl0IGFuZCB0aGUgcHJlc3N1cmUgYm9hcmQgc2hvd2VkIGVuZW1pZXMgd2FkaW5nIGRyeVxuICAvLyBncm91bmQuIE9uZSBzaGVldCBmb3IgYm90aCBwYW5zLCBmcm9tIHRoZSBtYXNrJ3Mgb3duIGZvcmQgcmVjdHMuXG4gIGNvbnN0IHBhbnMgPSByZWdpb25zLmZpbHRlcigocmVnaW9uKSA9PiByZWdpb24ua2luZCA9PT0gJ3JlY3QnICYmIHJlZ2lvbi56b25lID09PSAnZm9yZCcgJiYgcmVnaW9uLm1pblggIT09IHVuZGVmaW5lZCk7XG4gIGlmIChkcmVzc2luZy5mb3JkRGVwdGggIT09IHVuZGVmaW5lZCAmJiBwYW5zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBoYWxmRGVwdGggPSBNYXRoLm1heCguLi5wYW5zLm1hcCgocGFuKSA9PiAocGFuLm1heFohIC0gcGFuLm1pblohKSAvIDIpKTtcbiAgICBncm91cC5hZGQoY3JlYXRlRm9yZFNoZWV0KHtcbiAgICAgIG5hbWU6ICdUZXJyYWluM2RDaGFubmVsV2F0ZXIuZm9yZHMnLFxuICAgICAgcGFuczogcGFucy5tYXAoKHBhbikgPT4gKHsgbWluWDogcGFuLm1pblghLCBtYXhYOiBwYW4ubWF4WCEsIG1pblo6IHBhbi5taW5aISwgbWF4WjogcGFuLm1heFohIH0pKSxcbiAgICAgIGhhbGZEZXB0aCxcbiAgICAgIHN1cmZhY2VZOiAoY29udHJhY3QubWFza0FncmVlbWVudD8ud2F0ZXJQbGFuZVkgPz8gMCkgKyBkcmVzc2luZy5zdXJmYWNlTGlmdCxcbiAgICAgIGRlcHRoOiB3YWRlICsgKGRlZXAgLSB3YWRlKSAqIGRyZXNzaW5nLmZvcmREZXB0aCxcbiAgICB9KSk7XG4gIH1cbiAgaWYgKGdyb3VwLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgY29uc3QgY2xvY2sgPSB7IGZyYW1lOiAtMSwgbGFzdDogMCB9O1xuICBjb25zdCBhZHZhbmNlID0gKHJlbmRlcmVyOiBUSFJFRS5XZWJHTFJlbmRlcmVyKTogdm9pZCA9PiB7XG4gICAgaWYgKHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lID09PSBjbG9jay5mcmFtZSkgcmV0dXJuO1xuICAgIGNsb2NrLmZyYW1lID0gcmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWU7XG4gICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZGVsdGEgPSBjbG9jay5sYXN0ID09PSAwID8gMCA6IE1hdGgubWluKDAuMSwgTWF0aC5tYXgoMCwgKG5vdyAtIGNsb2NrLmxhc3QpIC8gMTAwMCkpO1xuICAgIGNsb2NrLmxhc3QgPSBub3c7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBncm91cC5jaGlsZHJlbikgdXBkYXRlV2F0ZXJNYXRlcmlhbChjaGlsZCBhcyBUSFJFRS5NZXNoLCBkZWx0YSk7XG4gIH07XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgZ3JvdXAuY2hpbGRyZW4pIChjaGlsZCBhcyBUSFJFRS5NZXNoKS5vbkJlZm9yZVJlbmRlciA9IGFkdmFuY2U7XG4gIHJldHVybiBncm91cDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29udGludWF0aW9uKFxuICB0ZXJyYWluOiBUSFJFRS5PYmplY3QzRCxcbiAgcGFub3JhbWE6IFRIUkVFLk9iamVjdDNELFxuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsXG4gIGJvdW5kczogVEhSRUUuQm94MyxcbiAgY29udHJhY3RJZDogc3RyaW5nLFxuKTogVEhSRUUuTWVzaCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHNvdXJjZSA9IHRlcnJhaW4uZ2V0T2JqZWN0QnlQcm9wZXJ0eSgnaXNNZXNoJywgdHJ1ZSkgYXMgVEhSRUUuTWVzaCB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzb3VyY2UgfHwgQXJyYXkuaXNBcnJheShzb3VyY2UubWF0ZXJpYWwpKSByZXR1cm4gdW5kZWZpbmVkO1xuICBwYW5vcmFtYS51cGRhdGVNYXRyaXhXb3JsZCh0cnVlKTtcbiAgY29uc3QgcG9pbnQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICBsZXQgb3V0ZXJSYWRpdXMgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIGxldCBvdXRlckhlaWdodCA9IDA7XG4gIGxldCBpbm5lckNoZWJ5c2hldiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgcGFub3JhbWEudHJhdmVyc2UoKG9iamVjdCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBvYmplY3QgYXMgVEhSRUUuTWVzaDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IG1lc2guaXNNZXNoID8gbWVzaC5nZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKCFwb3NpdGlvbikgcmV0dXJuO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbi5jb3VudDsgaW5kZXggKz0gMSkge1xuICAgICAgcG9pbnQuZnJvbUJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbiBhcyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGUsIGluZGV4KTtcbiAgICAgIG1lc2gubG9jYWxUb1dvcmxkKHBvaW50KTtcbiAgICAgIGlubmVyQ2hlYnlzaGV2ID0gTWF0aC5taW4oaW5uZXJDaGVieXNoZXYsIE1hdGgubWF4KE1hdGguYWJzKHBvaW50LngpLCBNYXRoLmFicyhwb2ludC56KSkpO1xuICAgICAgY29uc3QgcmFkaXVzID0gTWF0aC5oeXBvdChwb2ludC54LCBwb2ludC56KTtcbiAgICAgIGlmIChyYWRpdXMgPCBvdXRlclJhZGl1cykge1xuICAgICAgICBvdXRlclJhZGl1cyA9IHJhZGl1cztcbiAgICAgICAgb3V0ZXJIZWlnaHQgPSBwb2ludC55O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGRlZXBTa3lHcm91bmQgPSBjb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyB8fCBjb250cmFjdElkID09PSAnZTEwLWFyY2hpdmUtd29ybGQnO1xuICBjb25zdCBoYWxmWCA9IE1hdGgubWF4KE1hdGguYWJzKGJvdW5kcy5taW4ueCksIE1hdGguYWJzKGJvdW5kcy5tYXgueCkpO1xuICBjb25zdCBoYWxmWiA9IE1hdGgubWF4KE1hdGguYWJzKGJvdW5kcy5taW4ueiksIE1hdGguYWJzKGJvdW5kcy5tYXgueikpO1xuICBpZiAoIU51bWJlci5pc0Zpbml0ZShvdXRlclJhZGl1cykgfHwgKCFkZWVwU2t5R3JvdW5kICYmIGlubmVyQ2hlYnlzaGV2IDw9IE1hdGgubWF4KGhhbGZYLCBoYWxmWikgKyAwLjUpKSByZXR1cm4gdW5kZWZpbmVkO1xuICAvLyBUaGUgcGFub3JhbWEncyBuZWFyIHJpZGdlIHN0YXJ0cyBhdCByYWRpdXMgMTYxLjU7IGNvdmVyIHRoZSBpbnRlcnZlbmluZyBncm91bmQuXG4gIGlmIChkZWVwU2t5R3JvdW5kKSBvdXRlclJhZGl1cyA9IDE2MDtcblxuICAvLyBLZWVwIHRoZSBuaWdodCBncm91bmQgYmV5b25kIGV2ZXJ5IHNxdWFyZSBjb3JuZXIgYW5kIHRoZSBwZXJpbWV0ZXIgbGFuZG1hcmtzLlxuICBpZiAoY29udHJhY3RJZCA9PT0gJ2UzLW1vdGgtc2Vhc29uJykgb3V0ZXJSYWRpdXMgPSBNYXRoLm1heChvdXRlclJhZGl1cywgTWF0aC5oeXBvdChoYWxmWCwgaGFsZlopICsgMTIpO1xuXG4gIGNvbnN0IGVkZ2VTZWdtZW50cyA9IDMyO1xuICBjb25zdCBlZGdlOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtdO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZVNlZ21lbnRzOyBpbmRleCArPSAxKSBlZGdlLnB1c2goW1RIUkVFLk1hdGhVdGlscy5sZXJwKC1oYWxmWCwgaGFsZlgsIGluZGV4IC8gZWRnZVNlZ21lbnRzKSwgLWhhbGZaXSk7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBlZGdlU2VnbWVudHM7IGluZGV4ICs9IDEpIGVkZ2UucHVzaChbaGFsZlgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKC1oYWxmWiwgaGFsZlosIGluZGV4IC8gZWRnZVNlZ21lbnRzKV0pO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZVNlZ21lbnRzOyBpbmRleCArPSAxKSBlZGdlLnB1c2goW1RIUkVFLk1hdGhVdGlscy5sZXJwKGhhbGZYLCAtaGFsZlgsIGluZGV4IC8gZWRnZVNlZ21lbnRzKSwgaGFsZlpdKTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGVkZ2VTZWdtZW50czsgaW5kZXggKz0gMSkgZWRnZS5wdXNoKFstaGFsZlgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhhbGZaLCAtaGFsZlosIGluZGV4IC8gZWRnZVNlZ21lbnRzKV0pO1xuICBjb25zdCByaW5ncyA9IE1hdGgubWF4KDIsIE1hdGgubWluKDMyLCBNYXRoLmNlaWwoKG91dGVyUmFkaXVzIC0gTWF0aC5tYXgoaGFsZlgsIGhhbGZaKSkgLyA1KSkpO1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IHV2czogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgcmluZyA9IDA7IHJpbmcgPD0gcmluZ3M7IHJpbmcgKz0gMSkge1xuICAgIGNvbnN0IG1peCA9IHJpbmcgLyByaW5ncztcbiAgICBjb25zdCBlYXNlZCA9IG1peCAqIG1peCAqICgzIC0gMiAqIG1peCk7XG4gICAgZm9yIChjb25zdCBbaW5uZXJYLCBpbm5lclpdIG9mIGVkZ2UpIHtcbiAgICAgIGNvbnN0IGlubmVyUmFkaXVzID0gTWF0aC5oeXBvdChpbm5lclgsIGlubmVyWik7XG4gICAgICBjb25zdCBvdXRlclggPSBpbm5lclggLyBpbm5lclJhZGl1cyAqIG91dGVyUmFkaXVzO1xuICAgICAgY29uc3Qgb3V0ZXJaID0gaW5uZXJaIC8gaW5uZXJSYWRpdXMgKiBvdXRlclJhZGl1cztcbiAgICAgIGNvbnN0IHggPSBUSFJFRS5NYXRoVXRpbHMubGVycChpbm5lclgsIG91dGVyWCwgbWl4KTtcbiAgICAgIGNvbnN0IHogPSBUSFJFRS5NYXRoVXRpbHMubGVycChpbm5lclosIG91dGVyWiwgbWl4KTtcbiAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5oeXBvdCh4IC0gaW5uZXJYLCB6IC0gaW5uZXJaKTtcbiAgICAgIGNvbnN0IHJlcGVhdGVkID0gZGlzdGFuY2UgJSAoQ09OVElOVUFUSU9OX1NBTVBMRV9ERVBUSCAqIDIpO1xuICAgICAgY29uc3Qgc2FtcGxlRGVwdGggPSByZXBlYXRlZCA8PSBDT05USU5VQVRJT05fU0FNUExFX0RFUFRIID8gcmVwZWF0ZWQgOiBDT05USU5VQVRJT05fU0FNUExFX0RFUFRIICogMiAtIHJlcGVhdGVkO1xuICAgICAgY29uc3Qgc2FtcGxlWCA9IGlubmVyWCAtIGlubmVyWCAvIGlubmVyUmFkaXVzICogc2FtcGxlRGVwdGg7XG4gICAgICBjb25zdCBzYW1wbGVaID0gaW5uZXJaIC0gaW5uZXJaIC8gaW5uZXJSYWRpdXMgKiBzYW1wbGVEZXB0aDtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHgsIFRIUkVFLk1hdGhVdGlscy5sZXJwKGhlaWdodEF0KGlubmVyWCwgaW5uZXJaKSwgb3V0ZXJIZWlnaHQsIGVhc2VkKSwgeik7XG4gICAgICBjb25zdCB1dlggPSAoY29udHJhY3RJZCA9PT0gJ2UzLW1vdGgtc2Vhc29uJyB8fCBkZWVwU2t5R3JvdW5kKSA/IHggOiBzYW1wbGVYO1xuICAgICAgY29uc3QgdXZaID0gKGNvbnRyYWN0SWQgPT09ICdlMy1tb3RoLXNlYXNvbicgfHwgZGVlcFNreUdyb3VuZCkgPyB6IDogc2FtcGxlWjtcbiAgICAgIHV2cy5wdXNoKCh1dlggLSBib3VuZHMubWluLngpIC8gKGJvdW5kcy5tYXgueCAtIGJvdW5kcy5taW4ueCksIChib3VuZHMubWF4LnogLSB1dlopIC8gKGJvdW5kcy5tYXgueiAtIGJvdW5kcy5taW4ueikpO1xuICAgIH1cbiAgfVxuICBmb3IgKGxldCByaW5nID0gMDsgcmluZyA8IHJpbmdzOyByaW5nICs9IDEpIHtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgZWRnZS5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICAgIGNvbnN0IG5leHQgPSAoaW5kZXggKyAxKSAlIGVkZ2UubGVuZ3RoO1xuICAgICAgY29uc3QgYSA9IHJpbmcgKiBlZGdlLmxlbmd0aCArIGluZGV4O1xuICAgICAgY29uc3QgYiA9IHJpbmcgKiBlZGdlLmxlbmd0aCArIG5leHQ7XG4gICAgICBjb25zdCBjID0gKHJpbmcgKyAxKSAqIGVkZ2UubGVuZ3RoICsgaW5kZXg7XG4gICAgICBjb25zdCBkID0gKHJpbmcgKyAxKSAqIGVkZ2UubGVuZ3RoICsgbmV4dDtcbiAgICAgIGluZGljZXMucHVzaChhLCBiLCBjLCBiLCBkLCBjKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3V2JywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgndXYxJywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XG4gIGdlb21ldHJ5LnNldEluZGV4KGluZGljZXMpO1xuICBnZW9tZXRyeS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuICBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbiAgY29uc3QgbWF0ZXJpYWwgPSBzb3VyY2UubWF0ZXJpYWwuY2xvbmUoKTtcbiAgaWYgKGNvbnRyYWN0SWQgPT09ICdlMy1tb3RoLXNlYXNvbicgfHwgZGVlcFNreUdyb3VuZCkge1xuICAgIGNvbnN0IG1hcHBlZCA9IG1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsO1xuICAgIGlmIChtYXBwZWQubWFwKSB7XG4gICAgICBtYXBwZWQubWFwID0gbWFwcGVkLm1hcC5jbG9uZSgpO1xuICAgICAgbWFwcGVkLm1hcC53cmFwUyA9IG1hcHBlZC5tYXAud3JhcFQgPSBUSFJFRS5NaXJyb3JlZFJlcGVhdFdyYXBwaW5nO1xuICAgICAgbWFwcGVkLm1hcC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICB9XG4gIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Eb3VibGVTaWRlO1xuICAobWF0ZXJpYWwgYXMgVEhSRUUuTWF0ZXJpYWwgJiB7IGZvZz86IGJvb2xlYW4gfSkuZm9nID0gZGVlcFNreUdyb3VuZDtcbiAgbWF0ZXJpYWwuZGVwdGhXcml0ZSA9IGZhbHNlO1xuICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyKSA9PiB7XG4gICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXIucmVwbGFjZShcbiAgICAgICcjaW5jbHVkZSA8cHJvamVjdF92ZXJ0ZXg+JyxcbiAgICAgICcjaW5jbHVkZSA8cHJvamVjdF92ZXJ0ZXg+XFxuZ2xfUG9zaXRpb24ueiA9IGdsX1Bvc2l0aW9uLncgKiAwLjk5OTk5OycsXG4gICAgKTtcbiAgfTtcbiAgLy8gVEhFIEFUTU9TUEhFUklDUyBTSElGVDogdGhpcyBhcHJvbiDigJQgbm90IHRoZSBwYW5vcmFtYSDigJQgaXMgd2hhdCBhIHJ1biBmcmFtZSdzIHRvcCBlZGdlXG4gIC8vIGFjdHVhbGx5IGNvbnRhaW5zIG9uY2UgdGhlIHBsYXllciBjcm9zc2VzIG9udG8gdGhlIGZhciBiYW5rLiBNZWFzdXJlZCwgcGVyIGNvbnRyYWN0LCBpblxuICAvLyBzcmMvd29ybGQvSG9yaXpvbkFwcm9uLnRzLlxuICBjb25zdCBhcHJvbiA9IGhvcml6b25BcHJvblByb2ZpbGUoY29udHJhY3RJZCk7XG4gIGlmIChhcHJvbikgcGFpbnRIb3Jpem9uQXByb24obWF0ZXJpYWwsIGFwcm9uKTtcbiAgY29uc3QgY29udGludWF0aW9uID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcbiAgY29udGludWF0aW9uLnJlY2VpdmVTaGFkb3cgPSBkZWVwU2t5R3JvdW5kO1xuICBjb250aW51YXRpb24udXNlckRhdGEuaG9yaXpvbkFwcm9uID0gYXByb24gPyAncGFpbnRlZCcgOiAncGxhaW4nO1xuICBjb250aW51YXRpb24uZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBjb250aW51YXRpb24ucmVuZGVyT3JkZXIgPSAtNTA7XG4gIGNvbnRpbnVhdGlvbi5uYW1lID0gJ1RlcnJhaW4zZFNjdWxwdENvbnRpbnVhdGlvbic7XG4gIGNvbnRpbnVhdGlvbi51c2VyRGF0YS50ZXJyYWluM2RTa2lydEJsZW5kID0gdHJ1ZTtcbiAgcmV0dXJuIGNvbnRpbnVhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGxUZXJyYWluM2RDbGFpbVBpbG90KGhvc3Q6IEhvc3QpOiAoKSA9PiB2b2lkIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBSRUdJU1RSWVtob3N0LmNvbnRyYWN0SWRdO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90Q29udHJhY3QgPSBob3N0LmNvbnRyYWN0SWQ7XG4gIGlmIChwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcygpLnRpZXIgPT09ICdsaXRlJykge1xuICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0xvYWRTdGF0ZSA9ICdsaXRlJztcbiAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAnbGl0ZScsICdwYWludGVkJyk7XG4gICAgcmV0dXJuICgpID0+IHVuZGVmaW5lZDtcbiAgfVxuICBpZiAoIXNlbGVjdGVkIHx8IHNlbGVjdGVkLmNvbnRyYWN0LnRpbGVJZCAhPT0gaG9zdC50aWxlSWQpIHtcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnb2ZmJztcbiAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAnZmFpbGVkJywgJ3BhaW50ZWQnLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCAncGlsb3QtY29udHJhY3QtdW5hdmFpbGFibGUnKTtcbiAgICByZXR1cm4gcGFpbnRSaXZlclJldHVybihob3N0KTtcbiAgfVxuICBsZXQgZGlzcG9zZWQgPSBmYWxzZTtcbiAgbGV0IHRlcnJhaW46IFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkO1xuICBsZXQgcGFub3JhbWE6IFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFuZG1hcmtzOiBUSFJFRS5Hcm91cCB8IHVuZGVmaW5lZDtcbiAgbGV0IHNraXJ0OiBUSFJFRS5PYmplY3QzRCB8IHVuZGVmaW5lZDtcbiAgbGV0IHNjdWxwdFdhdGVyOiBTY3VscHRXYXRlciB8IHVuZGVmaW5lZDtcbiAgbGV0IHN1bk1vdGVzOiBTdW5Nb3RlcyB8IHVuZGVmaW5lZDtcbiAgbGV0IHJ1c2hFbWJlcnM6IFN1bk1vdGVzIHwgdW5kZWZpbmVkO1xuICBsZXQgc3RlYW1QbHVtZTogU3RlYW1QbHVtZSB8IHVuZGVmaW5lZDtcbiAgbGV0IHN0ZWFtV2lzcHM6IFN1bk1vdGVzW10gPSBbXTtcbiAgbGV0IGhhdWxTdGVhbTogSGF1bFN0ZWFtIHwgdW5kZWZpbmVkO1xuICBsZXQgbGFuZG1hcmtDb250YWN0czogVEhSRUUuSW5zdGFuY2VkTWVzaCB8IHVuZGVmaW5lZDtcbiAgbGV0IHdhdGVyQ29sbGFyczogVEhSRUUuSW5zdGFuY2VkTWVzaCB8IHVuZGVmaW5lZDtcbiAgbGV0IHNwYW5TaGFkb3c6IFRIUkVFLk1lc2ggfCB1bmRlZmluZWQ7XG4gIGxldCBjcm9zc2luZ0JyZWF0aDogQ3Jvc3NpbmdCcmVhdGggfCB1bmRlZmluZWQ7XG4gIGxldCBwb25kczogU3ByaW5nUG9uZFN1cmZhY2VbXSA9IFtdO1xuICBsZXQgbmV4dFBvbmRzOiBTcHJpbmdQb25kU3VyZmFjZVtdID0gW107XG4gIGxldCBjaGFubmVsV2F0ZXI6IFRIUkVFLkdyb3VwIHwgdW5kZWZpbmVkO1xuICBsZXQgaGlkZGVuUmVsaWVmOiBIaWRkZW5SZWxpZWZbXSA9IFtdO1xuICBsZXQgbG9hZGVkVGVycmFpbjogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQ7XG4gIGxldCBsb2FkZWRQYW5vcmFtYTogVEhSRUUuT2JqZWN0M0QgfCB1bmRlZmluZWQ7XG4gIGxldCBsb2FkRmFpbGVkID0gZmFsc2U7XG4gIGxldCB1bmluc3RhbGxIZWlnaHRTb3VyY2U6ICgoKSA9PiB2b2lkKSB8IHVuZGVmaW5lZDtcbiAgbGV0IGxhbmRtYXJrV2Fsa1N1cmZhY2VzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVMYW5kbWFya1dhbGtTdXJmYWNlcz4gPSBudWxsO1xuICBjb25zdCBvbkNvbnRleHRMb3N0ID0gKCkgPT4gcmVwb3J0UmVuZGVyRGVtb3Rpb24oaG9zdC5jYW52YXMsICd3ZWJnbC1jb250ZXh0LWxvc3QnKTtcbiAgaG9zdC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0bG9zdCcsIG9uQ29udGV4dExvc3QpO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90VGVycmFpbkxvYWRTdGF0ZSA9ICdwZW5kaW5nJztcbiAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hTG9hZFN0YXRlID0gJ3BlbmRpbmcnO1xuICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAncGVuZGluZyc7XG4gIHB1Ymxpc2goaG9zdC5jYW52YXMsICdsb2FkaW5nJywgJ3BhaW50ZWQnKTtcbiAgY29uc3QgbG9hZGVyID0gdHJhY2tlZEdsdGZMb2FkZXIoaG9zdC5jYW52YXMsICd0aGUgY2xhaW0nKTtcbiAgY29uc3QgZGlzcG9zZUxvYWRlZCA9ICgpID0+IHtcbiAgICBpZiAobG9hZGVkVGVycmFpbikge1xuICAgICAgZGlzcG9zZU9iamVjdDNEKGxvYWRlZFRlcnJhaW4pO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFRlcnJhaW5Mb2FkU3RhdGUgPSAnZGlzcG9zZWQnO1xuICAgIH1cbiAgICBpZiAobG9hZGVkUGFub3JhbWEpIHtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChsb2FkZWRQYW5vcmFtYSk7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFMb2FkU3RhdGUgPSAnZGlzcG9zZWQnO1xuICAgIH1cbiAgICBsb2FkZWRUZXJyYWluID0gdW5kZWZpbmVkO1xuICAgIGxvYWRlZFBhbm9yYW1hID0gdW5kZWZpbmVkO1xuICB9O1xuICBjb25zdCBmYWlsTG9hZCA9IChlcnJvcjogdW5rbm93bikgPT4ge1xuICAgIGlmIChsb2FkRmFpbGVkKSByZXR1cm47XG4gICAgbG9hZEZhaWxlZCA9IHRydWU7XG4gICAgZGlzcG9zZUxvYWRlZCgpO1xuICAgIGlmICghZGlzcG9zZWQpIHB1Ymxpc2goaG9zdC5jYW52YXMsICdmYWlsZWQnLCAncGFpbnRlZCcsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGBwaWxvdC1sb2FkLWZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWApO1xuICB9O1xuICBjb25zdCBpbnN0YWxsTG9hZGVkID0gKCkgPT4ge1xuICAgIGlmICghbG9hZGVkVGVycmFpbiB8fCAhbG9hZGVkUGFub3JhbWEgfHwgbG9hZEZhaWxlZCkgcmV0dXJuO1xuICAgIGNvbnN0IG5leHRUZXJyYWluID0gbG9hZGVkVGVycmFpbjtcbiAgICBjb25zdCBuZXh0UGFub3JhbWEgPSBsb2FkZWRQYW5vcmFtYTtcbiAgICBjb25zdCB0ZXJyYWluTWV0cmljcyA9IGluc3BlY3QobmV4dFRlcnJhaW4sIHRydWUpO1xuICAgIGNvbnN0IHBhbm9yYW1hTWV0cmljcyA9IGluc3BlY3QobmV4dFBhbm9yYW1hLCBmYWxzZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHRlcnJhaW5WYWxpZCA9IHZhbGlkVGVycmFpbih0ZXJyYWluTWV0cmljcywgc2VsZWN0ZWQuY29udHJhY3QpO1xuICAgICAgY29uc3QgcGFub3JhbWFWYWxpZCA9IHZhbGlkUGFub3JhbWEocGFub3JhbWFNZXRyaWNzLCBzZWxlY3RlZC5wYW5vcmFtYUNvbnRyYWN0LCBzZWxlY3RlZC5jb250cmFjdC5wYW5vcmFtYU1vdW50KTtcbiAgICAgIGlmICghdGVycmFpblZhbGlkIHx8ICFwYW5vcmFtYVZhbGlkKSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RGYWlsdXJlID0gYHRlcnJhaW46JHt0ZXJyYWluVmFsaWR9O3Bhbm9yYW1hOiR7cGFub3JhbWFWYWxpZH1gO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3RlcnJhaW4gY29udHJhY3QgbWlzbWF0Y2gnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGhlaWdodEF0ID0gYmFrZUhlaWdodEdyaWQobmV4dFRlcnJhaW4sIHRlcnJhaW5NZXRyaWNzKTtcbiAgICAgIGlmIChkaXNwb3NlZCkgdGhyb3cgbmV3IEVycm9yKCd0ZXJyYWluIHBpbG90IGRpc3Bvc2VkJyk7XG4gICAgICBuZXh0UG9uZHMgPSBjcmVhdGVMaXZlU3ByaW5nUG9uZHMoaG9zdCwgaGVpZ2h0QXQpO1xuICAgICAgbmV4dFRlcnJhaW4ubmFtZSA9ICdUZXJyYWluM2RDbGFpbVBpbG90JztcbiAgICAgIGlmIChob3N0LmFyY2hpdmVSZXN0b3JhdGlvbikgaW5zdGFsbEFyY2hpdmVSZXN0b3JhdGlvbihuZXh0VGVycmFpbiwgaG9zdC5hcmNoaXZlUmVzdG9yYXRpb24pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxLXR3aW4tYmFua3MnKSBjYWxtVHdpbkJhbmtzR3JvdW5kKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMS1iYXJvbicpIHNlcGFyYXRlQmFyb25Hcm91bmRTY2FycyhuZXh0VGVycmFpbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTItdHJlc3RsZScpIGNhbG1UcmVzdGxlQXBwcm9hY2hlcyhuZXh0VGVycmFpbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTItcHJlc3N1cmUtZ2FyZGVuJykgY2xhcmlmeVByZXNzdXJlR2FyZGVuVGVycmFjZXMobmV4dFRlcnJhaW4pO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UyLWluY2xpbmUnKSBjbGFyaWZ5SW5jbGluZVlhcmRzKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMy1jYW55b24td29ya3MnKSBjbGFyaWZ5Q2FueW9uR3JvdW5kKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMTAtbGFzdC1jbGFpbScpIHBhaW50TGFzdENsYWltRGVjayhuZXh0VGVycmFpbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJykgY2xhcmlmeUVtYmVyQmFzYWx0KG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlMTAtYXJjaGl2ZS13b3JsZCcpIGNsYXJpZnlBcmNoaXZlVGVycmFjZXMobmV4dFRlcnJhaW4sIGhvc3QuYXJjaGl2ZVJlc3RvcmF0aW9uKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlOS1kZXZpbHMtYWxsZXknKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM5ZjhiNmUnLCAnI2JiYTQ4NycsIC0wLjE0LCA0LjU3LCAwLjQ2KTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlOC1sb3ctb3JiaXQnKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM3NzdhNzYnLCAnI2E1YTI4ZScsIC00LjgsIDAuNywgMC4zOCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTgtZmFyLXNpZGUnKSBjbGFyaWZ5RmFyU2lkZVJlZ29saXRoKG5leHRUZXJyYWluKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlOS1kb21lLWJhc2luJyAmJiBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGg/LmNhbmFsUm91dGUpIGNsYXJpZnlSZWRGaWVsZHNSb3V0ZShuZXh0VGVycmFpbiwgc2VsZWN0ZWQuY29udHJhY3QubWFza1RydXRoLmNhbmFsUm91dGUucG9pbnRzKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlOS1vbGQtY2FuYWwnICYmIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aD8uaW5oZXJpdGVkQ2FuYWxSb3V0ZSkgY2xhcmlmeVJlZEZpZWxkc1JvdXRlKG5leHRUZXJyYWluLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGguaW5oZXJpdGVkQ2FuYWxSb3V0ZS5wb2ludHMpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2U5LXNlZWQtcnVuJyAmJiBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGg/LmNhcmF2YW5Sb3V0ZSkgY2xhcmlmeVJlZEZpZWxkc1JvdXRlKG5leHRUZXJyYWluLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGguY2FyYXZhblJvdXRlLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGgucGVybWFuZW50R3JlZW5XYXlwb2ludFpvbmVzKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNi1nbG93LW1lc2EnKSBncmFkZVRlcnJhaW5CeUhlaWdodChuZXh0VGVycmFpbiwgJyM5Zjg4NjcnLCAnIzliOTY4MicsIDEuNSwgNC42LCAwLjM0KTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNy1yZWxheS1ydXNoJykgZ3JhZGVUZXJyYWluQnlIZWlnaHQobmV4dFRlcnJhaW4sICcjODk4NDc2JywgJyNiMmE0ODInLCAwLjQsIDQuNiwgMC4zNCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTctZGVhZC1iYW5kJykgZ3JhZGVUZXJyYWluQnlIZWlnaHQobmV4dFRlcnJhaW4sICcjODg4NDc0JywgJyNiMmFiOTInLCAwLjQsIDQuNiwgMC4zNCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTYtcGljbmljJykgZ3JhZGVUZXJyYWluQnlIZWlnaHQobmV4dFRlcnJhaW4sICcjOWY4ODY3JywgJyNhMWE0ODMnLCAxLjUsIDQuNiwgMC4zNCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTYtaGFsZi1saWZlLWhvbGxvdycpIGdyYWRlVGVycmFpbkJ5SGVpZ2h0KG5leHRUZXJyYWluLCAnIzg5N2M2OCcsICcjYjlhNzg4JywgLTEuOSwgMS44LCAwLjMyKTtcbiAgICAgIGlmICgoaG9zdC5jb250cmFjdElkID09PSAnZTQtZHVzdC1mbGF0cycgfHwgaG9zdC5jb250cmFjdElkID09PSAnZTQtbG9uZy1yb2FkJyB8fCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ndXNoZXItY291bnR5JyB8fCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ib25leWFyZCcpICYmIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aCkgY2xhcmlmeU1vdG9yR3JvdW5kKG5leHRUZXJyYWluLCBzZWxlY3RlZC5jb250cmFjdC5tYXNrVHJ1dGgsIGZhbHNlLCBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ndXNoZXItY291bnR5JyA/IDAuMzAgOiBob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1ib25leWFyZCcgPyAwLjU1IDogMC43OCk7XG4gICAgICBpZiAoaG9zdC5uaWdodE1vZGUpIGFwcGx5TmlnaHRUZXJyYWluUG9vbHMobmV4dFRlcnJhaW4sIGhvc3QpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xzID0gJ29mZic7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3ROaWdodFBvb2xTb3VyY2VzID0gJzAnO1xuICAgICAgfVxuICAgICAgY29uc3QgbW91bnQgPSBzZWxlY3RlZC5jb250cmFjdC5wYW5vcmFtYU1vdW50O1xuICAgICAgbmV4dFBhbm9yYW1hLm5hbWUgPSBtb3VudC5pZDtcbiAgICAgIG5leHRQYW5vcmFtYS5wb3NpdGlvbi5mcm9tQXJyYXkobW91bnQucG9zaXRpb24pO1xuICAgICAgbmV4dFBhbm9yYW1hLnJvdGF0aW9uLnNldCguLi5tb3VudC5yb3RhdGlvbik7XG4gICAgICBuZXh0UGFub3JhbWEuc2NhbGUuZnJvbUFycmF5KG1vdW50LnNjYWxlKTtcbiAgICAgIHByZXBhcmVQYW5vcmFtYShuZXh0UGFub3JhbWEpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UzLWNhbnlvbi13b3JrcycpIGNsYXJpZnlDYW55b25Hcm91bmQobmV4dFBhbm9yYW1hLCB0cnVlKTtcbiAgICAgIGlmIChob3N0LmNvbnRyYWN0SWQgPT09ICdlNC1sb25nLXJvYWQnICYmIHNlbGVjdGVkLmNvbnRyYWN0Lm1hc2tUcnV0aCkgY2xhcmlmeU1vdG9yR3JvdW5kKG5leHRQYW5vcmFtYSwgc2VsZWN0ZWQuY29udHJhY3QubWFza1RydXRoLCB0cnVlKTtcbiAgICAgIGlmIChzZWxlY3RlZC5jb250cmFjdC53YXRlclN1cmZhY2U/Lm93bmVyID09PSAncnVudGltZSBEZWVwd2F0ZXJDbGFpbVRpbGUnKSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTZWFBcHJvblRyaWFuZ2xlcyA9IFN0cmluZyhyb3V0ZVNlYUFwcm9uKG5leHRUZXJyYWluLCBuZXh0UGFub3JhbWEsIHRlcnJhaW5NZXRyaWNzLmJvdW5kcykpO1xuICAgICAgfVxuICAgICAgY29uc3QgbmV4dFNraXJ0ID0gY3JlYXRlQ29udGludWF0aW9uKG5leHRUZXJyYWluLCBuZXh0UGFub3JhbWEsIGhlaWdodEF0LCB0ZXJyYWluTWV0cmljcy5ib3VuZHMsIGhvc3QuY29udHJhY3RJZCk7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEwLWVtYmVyLXNob3JlJyAmJiBuZXh0U2tpcnQpIGNsYXJpZnlFbWJlckJhc2FsdChuZXh0U2tpcnQpO1xuICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCA9PT0gJ2UxMC1hcmNoaXZlLXdvcmxkJyAmJiBuZXh0U2tpcnQpIGNsYXJpZnlBcmNoaXZlVGVycmFjZXMobmV4dFNraXJ0LCBob3N0LmFyY2hpdmVSZXN0b3JhdGlvbik7XG4gICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTMtbW90aC1zZWFzb24nICYmIGhvc3QubmlnaHRNb2RlICYmIG5leHRTa2lydCkge1xuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG5leHRTa2lydC5tYXRlcmlhbCBhcyBUSFJFRS5NYXRlcmlhbDtcbiAgICAgICAgY29uc3QgcHJvZ3JhbUtleSA9IG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSgpO1xuICAgICAgICBjb25zdCByZW5kZXJPcmRlciA9IG5leHRTa2lydC5yZW5kZXJPcmRlcjtcbiAgICAgICAgYXBwbHlOaWdodFRlcnJhaW5Qb29scyhuZXh0U2tpcnQsIGhvc3QpO1xuICAgICAgICBuZXh0U2tpcnQucmVuZGVyT3JkZXIgPSByZW5kZXJPcmRlcjtcbiAgICAgICAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gYCR7cHJvZ3JhbUtleX18bmlnaHQtdGVycmFpbi1wb29sc2A7XG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0Q2hhbm5lbFdhdGVyID0gY3JlYXRlQ2hhbm5lbFdhdGVyKGhvc3QuY29udHJhY3RJZCwgc2VsZWN0ZWQuY29udHJhY3QsIGhlaWdodEF0KTtcbiAgICAgIHRlcnJhaW4gPSBuZXh0VGVycmFpbjtcbiAgICAgIHBhbm9yYW1hID0gbmV4dFBhbm9yYW1hO1xuICAgICAgc2tpcnQgPSBuZXh0U2tpcnQ7XG4gICAgICBjaGFubmVsV2F0ZXIgPSBuZXh0Q2hhbm5lbFdhdGVyO1xuICAgICAgbG9hZGVkVGVycmFpbiA9IHVuZGVmaW5lZDtcbiAgICAgIGxvYWRlZFBhbm9yYW1hID0gdW5kZWZpbmVkO1xuICAgICAgY29uc3QgcG9pbnRlclN1cmZhY2VzOiBUSFJFRS5PYmplY3QzRFtdID0gW25leHRUZXJyYWluLCAuLi5uZXh0UG9uZHMubWFwKHBvbmQgPT4gcG9uZC5ncm91cCldO1xuICAgICAgaWYgKG5leHRDaGFubmVsV2F0ZXIpIHBvaW50ZXJTdXJmYWNlcy5wdXNoKG5leHRDaGFubmVsV2F0ZXIpO1xuICAgICAgdW5pbnN0YWxsSGVpZ2h0U291cmNlID0gaW5zdGFsbFZpc3VhbEhlaWdodFNvdXJjZShoZWlnaHRBdCwgcG9pbnRlclN1cmZhY2VzKTtcbiAgICAgIGhvc3Qub25WaXN1YWxIZWlnaHRTb3VyY2VJbnN0YWxsZWQ/LigpO1xuICAgICAgaG9zdC5zY2VuZS5hZGQobmV4dFRlcnJhaW4sIG5leHRQYW5vcmFtYSk7XG4gICAgICBpZiAobmV4dFNraXJ0KSBob3N0LnNjZW5lLmFkZChuZXh0U2tpcnQpO1xuICAgICAgcG9uZHMgPSBuZXh0UG9uZHM7XG4gICAgICBuZXh0UG9uZHMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgcG9uZCBvZiBwb25kcykgaG9zdC5zY2VuZS5hZGQocG9uZC5ncm91cCk7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3ByaW5nUG9uZHMgPSBTdHJpbmcocG9uZHMubGVuZ3RoKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTcHJpbmdQb25kV2F0ZXJSYWRpaSA9IEpTT04uc3RyaW5naWZ5KHBvbmRzLm1hcCgocG9uZCkgPT4gcG9uZC53YXRlclJhZGl1cykpO1xuICAgICAgaWYgKG5leHRDaGFubmVsV2F0ZXIpIGhvc3Quc2NlbmUuYWRkKG5leHRDaGFubmVsV2F0ZXIpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENoYW5uZWxXYXRlciA9IFN0cmluZyhcbiAgICAgICAgbmV4dENoYW5uZWxXYXRlcj8uY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQubmFtZS5pbmNsdWRlcygnLWNoYW5uZWwnKSkubGVuZ3RoID8/IDAsXG4gICAgICApO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEZvcmRXYXRlciA9IFN0cmluZyhcbiAgICAgICAgbmV4dENoYW5uZWxXYXRlcj8uY2hpbGRyZW4uZmlsdGVyKChjaGlsZCkgPT4gY2hpbGQubmFtZS5lbmRzV2l0aCgnLmZvcmRzJykpLmxlbmd0aCA/PyAwLFxuICAgICAgKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RDaGFubmVsV2F0ZXJIYWxmV2lkdGhzID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIG5leHRDaGFubmVsV2F0ZXI/LmNoaWxkcmVuXG4gICAgICAgICAgLmZpbHRlcigoY2hpbGQpID0+IGNoaWxkLm5hbWUuaW5jbHVkZXMoJy1jaGFubmVsJykpXG4gICAgICAgICAgLm1hcCgoY2hpbGQpID0+IGNoaWxkLnVzZXJEYXRhLnZpc3VhbEhhbGZXaWR0aCkgPz8gW10sXG4gICAgICApO1xuICAgICAgaGlkZGVuUmVsaWVmID0gaGlkZVBhaW50ZWRHcm91bmQoaG9zdCk7XG4gICAgICAvLyBBIGRlY29yYXRpb24gbXVzdCBuZXZlciBjb3N0IHRoZSBtYXAgaXRzIHNjdWxwdDogaWYgdGhlIHdhdGVyIGZhaWxzIHRvXG4gICAgICAvLyBidWlsZCwgdGhlIHRlcnJhaW4gc3RheXMgbW91bnRlZCBhbmQgdGhlIGZhaWx1cmUgaXMgcHVibGlzaGVkLCBub3Qgc2lsZW50LlxuICAgICAgdHJ5IHtcbiAgICAgICAgc2N1bHB0V2F0ZXIgPSBtb3VudFNjdWxwdFdhdGVyKGhvc3QsIGhlaWdodEF0LCB0ZXJyYWluTWV0cmljcy5ib3VuZHMpO1xuICAgICAgICBpZiAoc2N1bHB0V2F0ZXIpIHBvaW50ZXJTdXJmYWNlcy5wdXNoKHNjdWxwdFdhdGVyLm1lc2gpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nO1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2N1bHB0V2F0ZXIgPSBgZmFpbGVkOiR7bWVzc2FnZX1gO1xuICAgICAgICByZXBvcnRSZW5kZXJEZW1vdGlvbihob3N0LmNhbnZhcywgYHNjdWxwdC13YXRlci1mYWlsZWQ6JHttZXNzYWdlfWApO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgc3VuTW90ZXMgPSBtb3VudFN1bk1vdGVzKGhvc3QsIHRlcnJhaW5NZXRyaWNzLmJvdW5kcyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TW90ZXMgPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNyb3NzaW5nQnJlYXRoID0gbW91bnRDcm9zc2luZ0JyZWF0aChob3N0LCBzY3VscHRXYXRlcj8ubWVzaC5wb3NpdGlvbi55KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbSA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgfVxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFRlcnJhaW5Mb2FkU3RhdGUgPSAnbW91bnRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFMb2FkU3RhdGUgPSAnbW91bnRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGlkZGVuUmVsaWVmID0gU3RyaW5nKGhpZGRlblJlbGllZi5sZW5ndGgpO1xuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhpZGRlbkdyb3VuZExheWVycyA9IGhpZGRlblJlbGllZlxuICAgICAgICAubWFwKCh7IG9iamVjdCB9KSA9PiBvYmplY3QubmFtZSB8fCBTdHJpbmcob2JqZWN0LnVzZXJEYXRhLmFzc2V0U2xvdCkpXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgLmpvaW4oJ3wnKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RDb250aW51YXRpb24gPSBuZXh0U2tpcnQgPyAnc2N1bHB0LWVkZ2UtY29udGludWF0aW9uJyA6ICdwYW5vcmFtYS1vd25lZC1jb250aW51YXRpb24nO1xuICAgICAgLy8gVEhFIEFUTU9TUEhFUklDUyBTSElGVCdzIHBsYWluLWJvb3QgZG9vcjogdGhlIGFwcm9uIGlzIHRoZSBvbmx5IGhvcml6b24gc3VyZmFjZSBhIHJ1blxuICAgICAgLy8gZnJhbWUgY2FuIHJlYWNoICh0aGUgcGFub3JhbWEgbWVhc3VyZWQgMCUgYXQgZXZlcnkgaGVybyBwb3NpdGlvbiwgYm90aCB2aWV3cG9ydHMpLCBzb1xuICAgICAgLy8gd2hldGhlciBpdCBpcyBwYWludGVkIGhhcyB0byBiZSByZWFkYWJsZSB3aXRob3V0ID9kZWJ1Zy5cbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIb3Jpem9uQXByb24gPSBTdHJpbmcobmV4dFNraXJ0Py51c2VyRGF0YS5ob3Jpem9uQXByb24gPz8gJ25vbmUnKTtcbiAgICAgIC8vIFRIRSBGQVIgR1JPVU5EIFNISUZUJ3MgaW5zdHJ1bWVudCAoc3JjL3dvcmxkL0hvcml6b25BcHJvbi50cykuIENvbG91ciBvbmx5LCBsYXN0IHRoaW5nXG4gICAgICAvLyBtb3VudGVkIHNvIG5vdGhpbmcgZG93bnN0cmVhbSByZS10b3VjaGVzIHRoZSBtYXRlcmlhbHMgaXQgZmxhdHRlbnMuIFRoZSBwYWludGVkLW1hdGVyaWFsXG4gICAgICAvLyBjb3VudHMgYXJlIHB1Ymxpc2hlZCBiZWNhdXNlIHRoZXkgYXJlIHRoZSBwcm9iZSdzIHBvc2l0aXZlIGNvbnRyb2w6IGEgY2Vuc3VzIHRoYXQgcmVhZHNcbiAgICAgIC8vIDAuMDAlIHBhbm9yYW1hIG1lYW5zIFwib2ZmIGNhbWVyYVwiIG9ubHkgaWYgdGhlIHJpbmcgd2FzIHByb3ZhYmx5IHJlcGFpbnRlZC5cbiAgICAgIGNvbnN0IHByb2JlTW9kZSA9IGZhckdyb3VuZFByb2JlTW9kZSgpO1xuICAgICAgaWYgKHByb2JlTW9kZSA9PT0gJ29mZicpIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RGYXJHcm91bmRQcm9iZSA9ICdvZmYnO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHBhaW50ZWQgPSB7XG4gICAgICAgICAgcGFub3JhbWE6IHBhaW50RmFyR3JvdW5kUHJvYmUobmV4dFBhbm9yYW1hLCAncGFub3JhbWEnKSxcbiAgICAgICAgICBhcHJvbjogcGFpbnRGYXJHcm91bmRQcm9iZShuZXh0U2tpcnQsICdhcHJvbicpLFxuICAgICAgICAgIHRlcnJhaW46IHBhaW50RmFyR3JvdW5kUHJvYmUobmV4dFRlcnJhaW4sICd0ZXJyYWluJyksXG4gICAgICAgIH07XG4gICAgICAgIC8vIHNvbG86IG5vdGhpbmcgbGVmdCB0aGF0IGNvdWxkIG9jY2x1ZGUgdGhlIHJpbmcuIElmIGl0IGlzIGluIHRoZSBmcnVzdHVtLCBpdCBJUyB0aGUgZnJhbWUuXG4gICAgICAgIGlmIChwcm9iZU1vZGUgPT09ICdzb2xvJykge1xuICAgICAgICAgIG5leHRUZXJyYWluLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICBpZiAobmV4dFNraXJ0KSBuZXh0U2tpcnQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RGYXJHcm91bmRQcm9iZSA9XG4gICAgICAgICAgYCR7cHJvYmVNb2RlfTpwYW5vcmFtYT0ke3BhaW50ZWQucGFub3JhbWF9LGFwcm9uPSR7cGFpbnRlZC5hcHJvbn0sdGVycmFpbj0ke3BhaW50ZWQudGVycmFpbn1gO1xuICAgICAgfVxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFBhbm9yYW1hRnJhbWluZyA9ICd3b3JsZC1wcm9qZWN0ZWQtaG9yaXpvbic7XG4gICAgICAvLyBLZWVwIHRoZSBvcmlnaW5hbCBwcm9iZSB2YWx1ZXMgdW50aWwgdGhlIHJlZ2lzdHJ5IGNvbnRyYWN0IGlzIG1pZ3JhdGVkLlxuICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNraXJ0QmxlbmQgPSAnb3BhcXVlLXNjdWxwdC1lZGdlJztcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RQYW5vcmFtYUZvZyA9ICdleGNsdWRlZCc7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UGFub3JhbWFEZXB0aCA9ICdzY3JlZW4taG9yaXpvbi1iYWNrZHJvcCc7XG4gICAgICBjb25zdCBtb3VudHMgPSBsYW5kbWFya01vdW50c0ZvcihzZWxlY3RlZC5jb250cmFjdCwgaG9zdC5jb250cmFjdElkKTtcbiAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0V4cGVjdGVkID0gU3RyaW5nKG1vdW50cy5sZW5ndGgpO1xuICAgICAgY29uc3QgY2xvc3VyZUNlbnN1cyA9IG5ldyBNYXA8c3RyaW5nLCBDbG9zdXJlQ2Vuc3VzPigpO1xuICAgICAgY29uc3QgZGlhZ25vc3RpY3M6IHN0cmluZ1tdID0gW107XG4gICAgICBjb25zdCBuZXh0TGFuZG1hcmtzID0gbmV3IFRIUkVFLkdyb3VwKCk7XG4gICAgICBuZXh0TGFuZG1hcmtzLm5hbWUgPSAnVGVycmFpbjNkTGFuZG1hcmtzJztcbiAgICAgIG5leHRMYW5kbWFya3MudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgICBjb25zdCBsb2FkTW91bnQgPSBhc3luYyAobW91bnQ6IExhbmRtYXJrTW91bnQpOiBQcm9taXNlPFRIUkVFLk9iamVjdDNEIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0gbGFuZG1hcmtBc3NldEtleShtb3VudC5hc3NldCEpO1xuICAgICAgICAgIGNvbnN0IHJlc29sdmVVcmwgPSBMQU5ETUFSS19BU1NFVFNba2V5XTtcbiAgICAgICAgICBpZiAoIXJlc29sdmVVcmwpIHtcbiAgICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goYCR7bW91bnQuaWR9OiBhc3NldCB1bmF2YWlsYWJsZWApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gRWFjaCBwbGFjZW1lbnQgb3ducyBpdHMgc2NlbmUgYW5kIHBhaW50OyBjYWNoZWQgT2JqZWN0M0RzIHJlcGFyZW50IGVhcmxpZXIgbW91bnRzLlxuICAgICAgICAgIGNvbnN0IG1vZGVsID0gKGF3YWl0IGxvYWRlci5sb2FkQXN5bmMoYXdhaXQgcmVzb2x2ZVVybCgpKSkuc2NlbmU7XG4gICAgICAgICAgbW9kZWwubmFtZSA9IG1vdW50LmlkO1xuICAgICAgICAgIG1vZGVsLnVzZXJEYXRhLmxhbmRtYXJrQXNzZXQgPSBrZXk7XG4gICAgICAgICAgbW9kZWwudXNlckRhdGEucmVuZGVyT25seSA9IHRydWU7XG4gICAgICAgICAgbW9kZWwucG9zaXRpb24uc2V0KG1vdW50LnBvc2l0aW9uWzBdLCBoZWlnaHRBdChtb3VudC5wb3NpdGlvblswXSwgbW91bnQucG9zaXRpb25bMl0pICsgbW91bnQucG9zaXRpb25bMV0sIG1vdW50LnBvc2l0aW9uWzJdKTtcbiAgICAgICAgICBtb2RlbC5yb3RhdGlvbi5zZXQoLi4ubW91bnQucm90YXRpb24pO1xuICAgICAgICAgIG1vZGVsLnNjYWxlLmZyb21BcnJheShtb3VudC5zY2FsZSk7XG4gICAgICAgICAgaW5zcGVjdChtb2RlbCwgZmFsc2UpO1xuICAgICAgICAgIC8vIEYtQVNUUkEtOTogdmVyaWZpZWQgYmFja2ZhY2UgY3VsbGluZyBydW5zIG9uIEVWRVJZIG1vdW50ZWQgYm9keSwgbmlnaHQgc2hpZnQgaW5jbHVkZWQg4oCUXG4gICAgICAgICAgLy8gaXQgaXMgYSBnZW9tZXRyeSB2ZXJkaWN0LCBub3QgYSBwYWludCBvbmUsIGFuZCBpdCBjaGFuZ2VzIG5vIGxpZ2h0aW5nLlxuICAgICAgICAgIGNsb3N1cmVDZW5zdXMuc2V0KG1vdW50LmlkLCBjdWxsVmVyaWZpZWRDbG9zZWRNZXNoZXMobW9kZWwsIG1vdW50LmlkKSk7XG4gICAgICAgICAgaWYgKGhvc3QuY29udHJhY3RJZCAhPT0gJ2UxLW5pZ2h0LXNoaWZ0Jykge1xuICAgICAgICAgICAgY29uc3QgbGl2ZSA9IExJVkVfU1BSSU5HX1BPTkRfQ09OVFJBQ1RTLmhhcyhob3N0LmNvbnRyYWN0SWQpICYmIG1vdW50LmlkID09PSAnaXNvbGF0ZWRfc3ByaW5nJztcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyYWN0SW50ZW5zaXR5ID0gTEFORE1BUktfRU1JU1NJVkVbaG9zdC5jb250cmFjdElkXTtcbiAgICAgICAgICAgIGNvbnN0IHBhaW50ID0gbGl2ZVxuICAgICAgICAgICAgICA/IHsgaW50ZW5zaXR5OiBEUllfR1VMQ0hfU1BSSU5HX0VNSVNTSVZFLCB0aW50OiBERUZBVUxUX0xBTkRNQVJLX1BBSU5ULnRpbnQgfVxuICAgICAgICAgICAgICA6IChMQU5ETUFSS19QQUlOVFtob3N0LmNvbnRyYWN0SWRdPy5bbW91bnQuaWRdXG4gICAgICAgICAgICAgICAgPz8gKGNvbnRyYWN0SW50ZW5zaXR5ICE9PSB1bmRlZmluZWQgPyB7IGludGVuc2l0eTogY29udHJhY3RJbnRlbnNpdHksIHRpbnQ6IERFRkFVTFRfTEFORE1BUktfUEFJTlQudGludCB9IDogREVGQVVMVF9MQU5ETUFSS19QQUlOVCkpO1xuICAgICAgICAgICAga2VlcExhbmRtYXJrUGFpbnRSZWFkYWJsZShtb2RlbCwgcGFpbnQsIGhvc3QuY29udHJhY3RJZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChtb3VudC5pZCA9PT0gJ2xhbXB3b3Jrc195YXJkJykge1xuICAgICAgICAgICAgLy8gTGlnaHQtcmVhY3RpdmUgcGFpbnQsIG5vdCB3aG9sZS1ib2R5IGVtaXNzaW9uLiBUaGUgY29sZCBzZXZlblxuICAgICAgICAgICAgLy8gZ2FtZXBsYXkgbGFudGVybnMgcmV0YWluIHRoZWlyIHJlYWwgd3JlY2tlZC9yZWxpdCBzdGF0ZXMuXG4gICAgICAgICAgICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBtZXNoID0gbm9kZSBhcyBUSFJFRS5NZXNoPFRIUkVFLkJ1ZmZlckdlb21ldHJ5LCBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbD47XG4gICAgICAgICAgICAgIGlmIChtZXNoLmlzTWVzaCAmJiAhQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSAmJiBtZXNoLm1hdGVyaWFsLmlzTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHtcbiAgICAgICAgICAgICAgICBtZXNoLm1hdGVyaWFsLmNvbG9yLm11bHRpcGx5U2NhbGFyKDEuNjUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFwcGx5TmlnaHRUZXJyYWluUG9vbHMobW9kZWwsIGhvc3QsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaG9zdC5jb250cmFjdElkID09PSAnZTEtYmFyb24nICYmIEJBUk9OX1NXQVlfQU1QTElUVURFW21vdW50LmlkXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpbnN0YWxsQmFubmVyU3dheShtb2RlbCwgQkFST05fU1dBWV9BTVBMSVRVREVbbW91bnQuaWRdISk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRyZXNzTGFuZG1hcmsobW9kZWwsIGhvc3QuY29udHJhY3RJZCwgbW91bnQuaWQpO1xuICAgICAgICAgIGlmIChob3N0LmFyY2hpdmVSZXN0b3JhdGlvbikgaW5zdGFsbEFyY2hpdmVSZXN0b3JhdGlvbihtb2RlbCwgaG9zdC5hcmNoaXZlUmVzdG9yYXRpb24pO1xuICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgZGlhZ25vc3RpY3MucHVzaChgJHttb3VudC5pZH06IGFzc2V0IGludmFsaWRgKTtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdm9pZCBQcm9taXNlLmFsbChtb3VudHMubWFwKGxvYWRNb3VudCkpLnRoZW4oKG1vZGVscykgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIG1vZGVscykgaWYgKG1vZGVsKSBuZXh0TGFuZG1hcmtzLmFkZChtb2RlbCk7XG4gICAgICAgIGlmIChkaXNwb3NlZCkge1xuICAgICAgICAgIGRpc3Bvc2VPYmplY3QzRChuZXh0TGFuZG1hcmtzKTtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnZGlzcG9zZWQnO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGxhbmRtYXJrV2Fsa1N1cmZhY2VzID0gY3JlYXRlTGFuZG1hcmtXYWxrU3VyZmFjZXMoaGVpZ2h0QXQsXG4gICAgICAgICAgICBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcChtb2RlbCA9PiAoeyBtb2RlbCwgbW91bnQ6IG1vdW50cy5maW5kKG1vdW50ID0+IG1vdW50LmlkID09PSBtb2RlbC5uYW1lKSEgfSkpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBkaXNwb3NlT2JqZWN0M0QobmV4dExhbmRtYXJrcyk7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrTG9hZFN0YXRlID0gJ2ZhaWxlZCc7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrRGlhZ25vc3RpY3MgPSBgaW52YWxpZCBsYW5kbWFyayB3YWxrIHN1cmZhY2U6ICR7U3RyaW5nKGVycm9yKX1gO1xuICAgICAgICAgIHB1Ymxpc2goaG9zdC5jYW52YXMsICdmYWlsZWQnLCAncGFpbnRlZCcsIHRlcnJhaW5NZXRyaWNzLCB1bmRlZmluZWQsIHBhbm9yYW1hTWV0cmljcywgJ2xhbmRtYXJrLXdhbGstc3VyZmFjZXMtaW52YWxpZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGFuZG1hcmtXYWxrU3VyZmFjZXMpIHtcbiAgICAgICAgICB1bmluc3RhbGxIZWlnaHRTb3VyY2U/LigpO1xuICAgICAgICAgIHVuaW5zdGFsbEhlaWdodFNvdXJjZSA9IGluc3RhbGxWaXN1YWxIZWlnaHRTb3VyY2UobGFuZG1hcmtXYWxrU3VyZmFjZXMuaGVpZ2h0QXQsXG4gICAgICAgICAgICBbLi4ucG9pbnRlclN1cmZhY2VzLCAuLi5sYW5kbWFya1dhbGtTdXJmYWNlcy5wb2ludGVyc10pO1xuICAgICAgICAgIGhvc3Qub25WaXN1YWxIZWlnaHRTb3VyY2VJbnN0YWxsZWQ/LigpO1xuICAgICAgICB9XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RXYWxrU3VyZmFjZXMgPSBTdHJpbmcobGFuZG1hcmtXYWxrU3VyZmFjZXM/LnBvaW50ZXJzLmxlbmd0aCA/PyAwKTtcbiAgICAgICAgbGFuZG1hcmtzID0gbmV4dExhbmRtYXJrcztcbiAgICAgICAgaG9zdC5zY2VuZS5hZGQobmV4dExhbmRtYXJrcyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGFuZG1hcmtDb250YWN0cyA9IG1vdW50TGFuZG1hcmtDb250YWN0cyhcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSksXG4gICAgICAgICAgICBoZWlnaHRBdCxcbiAgICAgICAgICAgIHNjdWxwdFdhdGVyPy5tZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgICB0ZXJyYWluTWV0cmljcy5ib3VuZHMsXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90Q29udGFjdFNoYWRvd3MgPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHdhdGVyQ29sbGFycyA9IG1vdW50V2F0ZXJDb2xsYXJzKFxuICAgICAgICAgICAgaG9zdCxcbiAgICAgICAgICAgIG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHsgaWQ6IG1vZGVsLm5hbWUsIG1vZGVsIH0pKSxcbiAgICAgICAgICAgIHNjdWxwdFdhdGVyPy5tZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90V2F0ZXJDb2xsYXJzID0gYGZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzcGFuU2hhZG93ID0gbW91bnRTcGFuU2hhZG93KFxuICAgICAgICAgICAgaG9zdCxcbiAgICAgICAgICAgIG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHsgaWQ6IG1vZGVsLm5hbWUsIG1vZGVsIH0pKSxcbiAgICAgICAgICAgIHNjdWxwdFdhdGVyPy5tZXNoLnBvc2l0aW9uLnksXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3BhblNoYWRvdyA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcnVzaEVtYmVycyA9IG1vdW50UnVzaEVtYmVycyhcbiAgICAgICAgICAgIGhvc3QsXG4gICAgICAgICAgICBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLm1hcCgobW9kZWwpID0+ICh7IGlkOiBtb2RlbC5uYW1lLCBtb2RlbCB9KSksXG4gICAgICAgICAgICBoZWlnaHRBdCxcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RSdXNoRW1iZXJzID0gYGZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGVhbVBsdW1lID0gbW91bnRTdGVhbVBsdW1lKGhvc3QsIG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHsgaWQ6IG1vZGVsLm5hbWUsIG1vZGVsIH0pKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtID0gYGZhaWxlZDoke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ3Vua25vd24nfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBzdGVhbVdpc3BzID0gbW91bnRTdGVhbVdpc3BzKGhvc3QsIG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHsgaWQ6IG1vZGVsLm5hbWUsIG1vZGVsIH0pKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFN0ZWFtV2lzcHMgPSBgZmFpbGVkOiR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAndW5rbm93bid9YDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIGhhdWxTdGVhbSA9IG1vdW50SGF1bFN0ZWFtKFxuICAgICAgICAgICAgaG9zdCxcbiAgICAgICAgICAgIGhlaWdodEF0LFxuICAgICAgICAgICAgbmV4dExhbmRtYXJrcy5jaGlsZHJlbi5tYXAoKG1vZGVsKSA9PiAoeyBpZDogbW9kZWwubmFtZSwgbW9kZWwgfSkpLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdEhhdWxTdGVhbSA9IGBmYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gO1xuICAgICAgICB9XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya0xvYWRTdGF0ZSA9ICdtb3VudGVkJztcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrRW1pc3NpdmUgPSBTdHJpbmcoTEFORE1BUktfRU1JU1NJVkVbaG9zdC5jb250cmFjdElkXSA/PyBMQU5ETUFSS19FTUlTU0lWRV9ERUZBVUxUKTtcbiAgICAgICAgLy8gRi1BU1RSQS05IGNlbnN1czogcGVyLW1vdW50IGNsb3NlZC9vcGVuIG1lc2ggY291bnRzIGFuZCB3aGF0IHRoZSB2ZXJkaWN0IGRpZCB0byB0aGVcbiAgICAgICAgLy8gbWF0ZXJpYWwgc2lkZS4gUHVibGlzaGVkIE1FQVNVUkVELCBmb3IgdGhlIHNhbWUgcmVhc29uIGVtaXNzaXZlSW50ZW5zaXR5IGlzIChGLUJITS0xKSDigJRcbiAgICAgICAgLy8gYSB0YWJsZSBsb29rdXAgd291bGQga2VlcCByZXBvcnRpbmcgdGhlIGludGVudCBhZnRlciBhIGxhdGVyIHBhc3Mgb3Zlcndyb3RlIHRoZSByZW5kZXIuXG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCBib3ggPSBuZXcgVEhSRUUuQm94MygpO1xuICAgICAgICAgIGNvbnN0IHJvd3MgPSBuZXh0TGFuZG1hcmtzLmNoaWxkcmVuLmZsYXRNYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSBjbG9zdXJlQ2Vuc3VzLmdldChtb2RlbC5uYW1lKTtcbiAgICAgICAgICAgIGlmICghcm93KSByZXR1cm4gW107XG4gICAgICAgICAgICBib3guc2V0RnJvbU9iamVjdChtb2RlbCk7XG4gICAgICAgICAgICAvLyBUaGUgYm9keSdzIG93biB2ZXJ0aWNhbCBleHRlbnQsIHNvIGEgcHJvYmUgY2FuIGJlIGFpbWVkIGF0IHRoZSBXQUxMIHJhdGhlciB0aGFuIGF0XG4gICAgICAgICAgICAvLyB0aGUgZ3JvdW5kIGluIGZyb250IG9mIGEgbGF0dGljZSBoZWFkZnJhbWUgKHRoZSByZWZlcmVuY2UgcmlnJ3MgZmlyc3QgZmFsc2UgcmVhZGluZykuXG4gICAgICAgICAgICByZXR1cm4gW3sgLi4ucm93LCBiYXNlWTogK2JveC5taW4ueS50b0ZpeGVkKDMpLCB0b3BZOiArYm94Lm1heC55LnRvRml4ZWQoMykgfV07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgdG90YWwgPSByb3dzLnJlZHVjZSgoc3VtOiB7IG1lc2hlczogbnVtYmVyOyBjbG9zZWQ6IG51bWJlcjsgb3BlbjogbnVtYmVyOyBjdWxsZWQ6IG51bWJlcjsgZG91YmxlU2lkZWQ6IG51bWJlciB9LCByb3cpID0+ICh7XG4gICAgICAgICAgICBtZXNoZXM6IHN1bS5tZXNoZXMgKyByb3cubWVzaGVzLFxuICAgICAgICAgICAgY2xvc2VkOiBzdW0uY2xvc2VkICsgcm93LmNsb3NlZCxcbiAgICAgICAgICAgIG9wZW46IHN1bS5vcGVuICsgcm93Lm9wZW4sXG4gICAgICAgICAgICBjdWxsZWQ6IHN1bS5jdWxsZWQgKyByb3cuY3VsbGVkLFxuICAgICAgICAgICAgZG91YmxlU2lkZWQ6IHN1bS5kb3VibGVTaWRlZCArIHJvdy5kb3VibGVTaWRlZCxcbiAgICAgICAgICB9KSwgeyBtZXNoZXM6IDAsIGNsb3NlZDogMCwgb3BlbjogMCwgY3VsbGVkOiAwLCBkb3VibGVTaWRlZDogMCB9KTtcbiAgICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtTaWRlcyA9IEpTT04uc3RyaW5naWZ5KHsgdG90YWwsIG1vdW50czogcm93cyB9KTtcbiAgICAgICAgfVxuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtzID0gU3RyaW5nKG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubGVuZ3RoKTtcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrU2tpcHBlZCA9IFN0cmluZyhkaWFnbm9zdGljcy5sZW5ndGgpO1xuICAgICAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLmpvaW4oJzsgJyk7XG4gICAgICAgIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RMYW5kbWFya01vdW50cyA9IEpTT04uc3RyaW5naWZ5KG5leHRMYW5kbWFya3MuY2hpbGRyZW4ubWFwKChtb2RlbCkgPT4gKHtcbiAgICAgICAgICBpZDogbW9kZWwubmFtZSxcbiAgICAgICAgICB4OiBtb2RlbC5wb3NpdGlvbi54LFxuICAgICAgICAgIHk6IG1vZGVsLnBvc2l0aW9uLnksXG4gICAgICAgICAgejogbW9kZWwucG9zaXRpb24ueixcbiAgICAgICAgfSkpKTtcbiAgICAgICAgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdExhbmRtYXJrTWF0ZXJpYWxzID0gSlNPTi5zdHJpbmdpZnkobmV4dExhbmRtYXJrcy5jaGlsZHJlbi5tYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgICAgY29uc3QgbWF0ZXJpYWxzID0gbmV3IFNldDxUSFJFRS5NYXRlcmlhbD4oKTtcbiAgICAgICAgICBtb2RlbC50cmF2ZXJzZSgobm9kZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDtcbiAgICAgICAgICAgIGlmIChtZXNoLmlzTWVzaCkgZm9yIChjb25zdCBtYXRlcmlhbCBvZiBBcnJheS5pc0FycmF5KG1lc2gubWF0ZXJpYWwpID8gbWVzaC5tYXRlcmlhbCA6IFttZXNoLm1hdGVyaWFsXSkgbWF0ZXJpYWxzLmFkZChtYXRlcmlhbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gZW1pc3NpdmVJbnRlbnNpdHkgaXMgUFVCTElTSEVELCBub3QgaW5mZXJyZWQgZnJvbSB0aGUgdGFibGUsIGJlY2F1c2UgdGhlIHBhaW50IGlzXG4gICAgICAgICAgLy8gYXBwbGllZCBieSB0cmF2ZXJzYWwgYWZ0ZXIgdGhlIGJvZHkgbG9hZHMgYW5kIGEgbGF0ZXIgcGFzcyBjYW4gc2lsZW50bHkgb3ZlcndyaXRlIGl0IOKAlFxuICAgICAgICAgIC8vIHdoaWNoIGlzIGV4YWN0bHkgdGhlIGRlZmVjdCBGLUJITS0xIGZvdW5kIGhlcmUgKHR3byBrZWVwTGFuZG1hcmtQYWludFJlYWRhYmxlIGNhbGxzLCB0aGVcbiAgICAgICAgICAvLyBzZWNvbmQgb25lIHJlc2V0dGluZyBldmVyeSBwZXItY29udHJhY3QgaW50ZW5zaXR5IGJhY2sgdG8gdGhlIGRlZmF1bHQpLiBBIHRhYmxlIGxvb2t1cFxuICAgICAgICAgIC8vIGluIHRoZSBkYXRhc2V0IHdvdWxkIGhhdmUga2VwdCByZXBvcnRpbmcgdGhlIGludGVuZGVkIG51bWJlciB3aGlsZSB0aGUgbWFwIHJlbmRlcmVkIHRoZVxuICAgICAgICAgIC8vIG90aGVyIG9uZS5cbiAgICAgICAgICBjb25zdCBzdGFuZGFyZCA9IFsuLi5tYXRlcmlhbHNdLmZpbHRlcigobWF0ZXJpYWwpOiBtYXRlcmlhbCBpcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCA9PlxuICAgICAgICAgICAgKG1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKS5pc01lc2hTdGFuZGFyZE1hdGVyaWFsKTtcbiAgICAgICAgICBjb25zdCBpbnRlbnNpdGllcyA9IHN0YW5kYXJkLm1hcCgobWF0ZXJpYWwpID0+ICttYXRlcmlhbC5lbWlzc2l2ZUludGVuc2l0eS50b0ZpeGVkKDMpKTtcbiAgICAgICAgICBjb25zdCBhdXRob3JlZCA9IHN0YW5kYXJkXG4gICAgICAgICAgICAubWFwKChtYXRlcmlhbCkgPT4gbWF0ZXJpYWwudXNlckRhdGEubGFuZG1hcmtBdXRob3JlZEVtaXNzaXZlIGFzIG51bWJlciB8IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC5maWx0ZXIoKHZhbHVlKTogdmFsdWUgaXMgbnVtYmVyID0+IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogbW9kZWwubmFtZSxcbiAgICAgICAgICAgIHRvdGFsOiBtYXRlcmlhbHMuc2l6ZSxcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBbLi4ubWF0ZXJpYWxzXS5maWx0ZXIoKG1hdGVyaWFsKSA9PiBtYXRlcmlhbC50cmFuc3BhcmVudCkubGVuZ3RoLFxuICAgICAgICAgICAgZGVwdGhXcml0ZURpc2FibGVkOiBbLi4ubWF0ZXJpYWxzXS5maWx0ZXIoKG1hdGVyaWFsKSA9PiAhbWF0ZXJpYWwuZGVwdGhXcml0ZSkubGVuZ3RoLFxuICAgICAgICAgICAgZW1pc3NpdmVJbnRlbnNpdHk6IGludGVuc2l0aWVzLmxlbmd0aCA/IFtNYXRoLm1pbiguLi5pbnRlbnNpdGllcyksIE1hdGgubWF4KC4uLmludGVuc2l0aWVzKV0gOiBbXSxcbiAgICAgICAgICAgIGF1dGhvcmVkRW1pc3NpdmU6IGF1dGhvcmVkLmxlbmd0aCA/IFtNYXRoLm1pbiguLi5hdXRob3JlZCksIE1hdGgubWF4KC4uLmF1dGhvcmVkKV0gOiBbXSxcbiAgICAgICAgICAgIGZyb250U2lkZWQ6IFsuLi5tYXRlcmlhbHNdLmZpbHRlcigobWF0ZXJpYWwpID0+IG1hdGVyaWFsLnNpZGUgPT09IFRIUkVFLkZyb250U2lkZSkubGVuZ3RoLFxuICAgICAgICAgICAgZG91YmxlU2lkZWQ6IFsuLi5tYXRlcmlhbHNdLmZpbHRlcigobWF0ZXJpYWwpID0+IG1hdGVyaWFsLnNpZGUgPT09IFRIUkVFLkRvdWJsZVNpZGUpLmxlbmd0aCxcbiAgICAgICAgICAgIHJvdWdobmVzczogc3RhbmRhcmQubGVuZ3RoID8gK01hdGgubWluKC4uLnN0YW5kYXJkLm1hcCgobWF0ZXJpYWwpID0+IG1hdGVyaWFsLnJvdWdobmVzcykpLnRvRml4ZWQoMykgOiBudWxsLFxuICAgICAgICAgICAgbWV0YWxuZXNzOiBzdGFuZGFyZC5sZW5ndGggPyArTWF0aC5tYXgoLi4uc3RhbmRhcmQubWFwKChtYXRlcmlhbCkgPT4gbWF0ZXJpYWwubWV0YWxuZXNzKSkudG9GaXhlZCgzKSA6IG51bGwsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSkpO1xuICAgICAgICBwdWJsaXNoKGhvc3QuY2FudmFzLCAncmVhZHknLCAnZ2xiJywgdGVycmFpbk1ldHJpY3MsIG5leHRQYW5vcmFtYSwgcGFub3JhbWFNZXRyaWNzKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBkaXNwb3NlT2JqZWN0M0QobmV4dFRlcnJhaW4pO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKG5leHRQYW5vcmFtYSk7XG4gICAgICBmb3IgKGNvbnN0IHBvbmQgb2YgbmV4dFBvbmRzKSBwb25kLmRpc3Bvc2UoKTtcbiAgICAgIG5leHRQb25kcyA9IFtdO1xuICAgICAgbG9hZGVkVGVycmFpbiA9IHVuZGVmaW5lZDtcbiAgICAgIGxvYWRlZFBhbm9yYW1hID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKCFkaXNwb3NlZCkgcHVibGlzaChob3N0LmNhbnZhcywgJ2ZhaWxlZCcsICdwYWludGVkJywgdGVycmFpbk1ldHJpY3MsIHVuZGVmaW5lZCwgcGFub3JhbWFNZXRyaWNzLCBgcGlsb3QtaW5zdGFsbC1mYWlsZWQ6JHtlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICd1bmtub3duJ31gKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHJlY2VpdmUgPSAoa2luZDogJ3RlcnJhaW4nIHwgJ3Bhbm9yYW1hJywgbW9kZWw6IFRIUkVFLk9iamVjdDNEKSA9PiB7XG4gICAgaWYgKGRpc3Bvc2VkIHx8IGxvYWRGYWlsZWQpIHtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChtb2RlbCk7XG4gICAgICBob3N0LmNhbnZhcy5kYXRhc2V0W2tpbmQgPT09ICd0ZXJyYWluJyA/ICd0ZXJyYWluM2RQaWxvdFRlcnJhaW5Mb2FkU3RhdGUnIDogJ3RlcnJhaW4zZFBpbG90UGFub3JhbWFMb2FkU3RhdGUnXSA9ICdkaXNwb3NlZCc7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChraW5kID09PSAndGVycmFpbicpIGxvYWRlZFRlcnJhaW4gPSBtb2RlbDtcbiAgICBlbHNlIGxvYWRlZFBhbm9yYW1hID0gbW9kZWw7XG4gICAgaG9zdC5jYW52YXMuZGF0YXNldFtraW5kID09PSAndGVycmFpbicgPyAndGVycmFpbjNkUGlsb3RUZXJyYWluTG9hZFN0YXRlJyA6ICd0ZXJyYWluM2RQaWxvdFBhbm9yYW1hTG9hZFN0YXRlJ10gPSAnbG9hZGVkJztcbiAgICBpbnN0YWxsTG9hZGVkKCk7XG4gIH07XG4gIHZvaWQgbG9hZGVyLmxvYWRBc3luYyhzZWxlY3RlZC50ZXJyYWluVXJsKS50aGVuKChnbHRmKSA9PiByZWNlaXZlKCd0ZXJyYWluJywgZ2x0Zi5zY2VuZSksIGZhaWxMb2FkKTtcbiAgdm9pZCBsb2FkZXIubG9hZEFzeW5jKHNlbGVjdGVkLnBhbm9yYW1hVXJsKS50aGVuKChnbHRmKSA9PiByZWNlaXZlKCdwYW5vcmFtYScsIGdsdGYuc2NlbmUpLCBmYWlsTG9hZCk7XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICBkaXNwb3NlZCA9IHRydWU7XG4gICAgaG9zdC5jYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2ViZ2xjb250ZXh0bG9zdCcsIG9uQ29udGV4dExvc3QpO1xuICAgIGRpc3Bvc2VMb2FkZWQoKTtcbiAgICB1bmluc3RhbGxIZWlnaHRTb3VyY2U/LigpO1xuICAgIHVuaW5zdGFsbEhlaWdodFNvdXJjZSA9IHVuZGVmaW5lZDtcbiAgICBsYW5kbWFya1dhbGtTdXJmYWNlcz8uZGlzcG9zZSgpO1xuICAgIGxhbmRtYXJrV2Fsa1N1cmZhY2VzID0gbnVsbDtcbiAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhbGtTdXJmYWNlcztcbiAgICBmb3IgKGNvbnN0IHsgb2JqZWN0LCB2aXNpYmxlIH0gb2YgaGlkZGVuUmVsaWVmKSBvYmplY3QudmlzaWJsZSA9IHZpc2libGU7XG4gICAgaGlkZGVuUmVsaWVmID0gW107XG4gICAgaWYgKHNraXJ0KSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShza2lydCk7XG4gICAgICBkaXNwb3NlT2JqZWN0M0Qoc2tpcnQpO1xuICAgICAgc2tpcnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChzY3VscHRXYXRlcikge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUoc2N1bHB0V2F0ZXIubWVzaCk7XG4gICAgICBzY3VscHRXYXRlci5kaXNwb3NlKCk7XG4gICAgICBzY3VscHRXYXRlciA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U2VhQXByb25UcmlhbmdsZXM7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNjdWxwdFdhdGVyO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTY3VscHRXYXRlckhhbGZXaWR0aDtcbiAgICB9XG4gICAgaWYgKHJ1c2hFbWJlcnMpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHJ1c2hFbWJlcnMucG9pbnRzKTtcbiAgICAgIHJ1c2hFbWJlcnMuZGlzcG9zZSgpO1xuICAgICAgcnVzaEVtYmVycyA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90UnVzaEVtYmVycztcbiAgICB9XG4gICAgaWYgKHN1bk1vdGVzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShzdW5Nb3Rlcy5wb2ludHMpO1xuICAgICAgc3VuTW90ZXMuZGlzcG9zZSgpO1xuICAgICAgc3VuTW90ZXMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdE1vdGVzO1xuICAgIH1cbiAgICBpZiAoc3RlYW1QbHVtZSkge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUoc3RlYW1QbHVtZS5wb2ludHMpO1xuICAgICAgc3RlYW1QbHVtZS5kaXNwb3NlKCk7XG4gICAgICBzdGVhbVBsdW1lID0gdW5kZWZpbmVkO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbTtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW1BbmNob3JzO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHdpc3BzIG9mIHN0ZWFtV2lzcHMpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHdpc3BzLnBvaW50cyk7XG4gICAgICB3aXNwcy5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGlmIChzdGVhbVdpc3BzLmxlbmd0aCkge1xuICAgICAgc3RlYW1XaXNwcyA9IFtdO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RTdGVhbVdpc3BzO1xuICAgIH1cbiAgICBpZiAoaGF1bFN0ZWFtKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShoYXVsU3RlYW0uZ3JvdXApO1xuICAgICAgaGF1bFN0ZWFtLmRpc3Bvc2UoKTtcbiAgICAgIGhhdWxTdGVhbSA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1DYXBhY2l0eTtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90SGF1bFN0ZWFtQWN0aXZlO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1TcGF3bmVkO1xuICAgICAgZGVsZXRlIGhvc3QuY2FudmFzLmRhdGFzZXQudGVycmFpbjNkUGlsb3RIYXVsU3RlYW1EZXRhaWw7XG4gICAgfVxuICAgIGlmIChsYW5kbWFya0NvbnRhY3RzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZShsYW5kbWFya0NvbnRhY3RzKTtcbiAgICAgIGRpc3Bvc2VPYmplY3QzRChsYW5kbWFya0NvbnRhY3RzKTtcbiAgICAgIGxhbmRtYXJrQ29udGFjdHMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdENvbnRhY3RTaGFkb3dzO1xuICAgIH1cbiAgICBpZiAod2F0ZXJDb2xsYXJzKSB7XG4gICAgICBob3N0LnNjZW5lLnJlbW92ZSh3YXRlckNvbGxhcnMpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKHdhdGVyQ29sbGFycyk7XG4gICAgICB3YXRlckNvbGxhcnMgPSB1bmRlZmluZWQ7XG4gICAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFdhdGVyQ29sbGFycztcbiAgICB9XG4gICAgaWYgKHNwYW5TaGFkb3cpIHtcbiAgICAgIGhvc3Quc2NlbmUucmVtb3ZlKHNwYW5TaGFkb3cpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKHNwYW5TaGFkb3cpO1xuICAgICAgc3BhblNoYWRvdyA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3BhblNoYWRvdztcbiAgICB9XG4gICAgaWYgKGNyb3NzaW5nQnJlYXRoKSB7XG4gICAgICBjcm9zc2luZ0JyZWF0aC5kaXNwb3NlKCk7XG4gICAgICBjcm9zc2luZ0JyZWF0aCA9IHVuZGVmaW5lZDtcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90R29yZ2VXaXNwcztcbiAgICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90U3RlYW07XG4gICAgfVxuICAgIGZvciAoY29uc3QgcG9uZCBvZiBwb25kcykge1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUocG9uZC5ncm91cCk7XG4gICAgICBwb25kLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgcG9uZHMgPSBbXTtcbiAgICBkZWxldGUgaG9zdC5jYW52YXMuZGF0YXNldC50ZXJyYWluM2RQaWxvdFNwcmluZ1BvbmRXYXRlclJhZGlpO1xuICAgIGZvciAoY29uc3QgcG9uZCBvZiBuZXh0UG9uZHMpIHBvbmQuZGlzcG9zZSgpO1xuICAgIG5leHRQb25kcyA9IFtdO1xuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgW3RlcnJhaW4sIHBhbm9yYW1hLCBsYW5kbWFya3MsIGNoYW5uZWxXYXRlcl0pIHtcbiAgICAgIGlmICghbW9kZWwpIGNvbnRpbnVlO1xuICAgICAgaG9zdC5zY2VuZS5yZW1vdmUobW9kZWwpO1xuICAgICAgZGlzcG9zZU9iamVjdDNEKG1vZGVsKTtcbiAgICB9XG4gICAgdGVycmFpbiA9IHVuZGVmaW5lZDtcbiAgICBwYW5vcmFtYSA9IHVuZGVmaW5lZDtcbiAgICBsYW5kbWFya3MgPSB1bmRlZmluZWQ7XG4gICAgY2hhbm5lbFdhdGVyID0gdW5kZWZpbmVkO1xuICAgIGRlbGV0ZSBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90Q2hhbm5lbFdhdGVySGFsZldpZHRocztcbiAgICBob3N0LmNhbnZhcy5kYXRhc2V0LnRlcnJhaW4zZFBpbG90TGFuZG1hcmtMb2FkU3RhdGUgPSAnZGlzcG9zZWQnO1xuICB9O1xufVxuXG5cbnR5cGUgTGFuZG1hcmtQYWludCA9IHsgaW50ZW5zaXR5OiBudW1iZXI7IHRpbnQ6IHN0cmluZyB9O1xuXG5cbi8qKlxuICogUGVyLWNvbnRyYWN0IGxhbmRtYXJrIHBhaW50LiBUaGUgZGVmYXVsdCDigJQgc2VsZi1saXQgM3ggb2ZmIHRoZSBib2R5J3Mgb3duXG4gKiBhbGJlZG8sIHRpbnRlZCB3aGl0ZSDigJQgaXMgd2hhdCBrZWVwcyBldmVyeSBsYW5kbWFyayBvbiBldmVyeSBtYXAgcmVhZGFibGVcbiAqIHVuZGVyIHRoZSBkYXkgcmlnLCBhbmQgaXQgc3RheXMgdGhlIGRlZmF1bHQgZm9yIGFsbCBvZiB0aGVtLlxuICpcbiAqIGUxLWJhcm9uIGlzIHRoZSBvbmUgbWFwIHRoYXQgbmVlZHMgYSBTSURFLiBUaGUgZmluYWxlIGlzIGEgZHVlbCBiZXR3ZWVuIGEgd2FybVxuICogaG9tZSBiYW5rIGFuZCBhIGNvbGQgY29tcGFueSBvbmUgKGRvY3MvYmVhdXR5L2UxLWJhcm9uLWJyaWVmLm1kIFUyKSwgYW5kIHRoZVxuICogZm9ydCBib2RpZXMgd2VyZSByZWFkaW5nIGFzIHRoZSBzYW1lIHdhcm0gb2NocmUgdGltYmVyIGFzIHRoZSBwbGF5ZXIncyBvd25cbiAqIGdlYXIuIFR1cm5pbmcgdGhlaXIgcmVhZGFiaWxpdHkgZG93biBhbmQgdGhlaXIgaHVlIHRvd2FyZCB3ZXQgaXJvbiBtYWtlcyB0aGVcbiAqIGZhciBiYW5rIGxvb20gaW5zdGVhZCBvZiBibGVuZCDigJQgd2hpbGUgdGhlIG94Ymxvb2QgYmFubmVycyBrZWVwIGFuIGVtYmVyIGxpZnQsXG4gKiBiZWNhdXNlIGhpcyBicmFuZCBpcyB0aGUgb25lIHdhcm0gdGhpbmcgYWxsb3dlZCBvbiB0aGF0IHNpZGUuIFRoZSBmbG9vciBoZXJlXG4gKiBpcyBkZWxpYmVyYXRlOiB0aGUgYnJpZWYncyBvd24gd2FybmluZyBpcyBcIk1FTkFDRSwgbm90IGludmlzaWJpbGl0eVwiLCBzbyBub1xuICogYm9keSBkcm9wcyBiZWxvdyAxLjUgYW5kIHRoZSBzaWxob3VldHRlIGVkZ2VzIHN0YXkgbGl0LlxuICovXG5jb25zdCBMQU5ETUFSS19QQUlOVDogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgTGFuZG1hcmtQYWludD4+ID0ge1xuICAnZTItdHJlc3RsZSc6IHsgJ3RyZXN0bGUtY3Jvc3NpbmcnOiB7IGludGVuc2l0eTogMi42LCB0aW50OiAnI2ZmZmZmZicgfSwgJ3NvdXRoLWJvaWxlci1zaXRlJzogeyBpbnRlbnNpdHk6IDIuNSwgdGludDogJyNlNGU1ZTcnIH0sICdub3J0aC1ib2lsZXItc2l0ZSc6IHsgaW50ZW5zaXR5OiAyLjUsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnbWluZS1zcHVyLWtpdCc6IHsgaW50ZW5zaXR5OiAyLjIsIHRpbnQ6ICcjZWZlMmNjJyB9LCAnc291dGgtYXBwcm9hY2gta2l0JzogeyBpbnRlbnNpdHk6IDIuMiwgdGludDogJyNmZmZmZmYnIH0sICdub3J0aC1hcHByb2FjaC1raXQnOiB7IGludGVuc2l0eTogMi4yLCB0aW50OiAnI2ZmZmZmZicgfSwgfSxcbiAgJ2UyLXByZXNzdXJlLWdhcmRlbic6IHsgJ2dhcmRlbi1wcmVzc3VyZS1tYW5pZm9sZCc6IHsgaW50ZW5zaXR5OiAzLCB0aW50OiAnI2U0ZTVlNycgfSwgJ3dhdGVyLWJhbmQtcHVtcC1zdGF0aW9uJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnd2VzdC10ZXJyYWNlLXBpcGUtaGVhZGVyJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnZWFzdC10ZXJyYWNlLXBpcGUtaGVhZGVyJzogeyBpbnRlbnNpdHk6IDMsIHRpbnQ6ICcjZTRlNWU3JyB9LCAnY29hbC1zZWFtLXNlcnZpY2Utd2luY2gnOiB7IGludGVuc2l0eTogMywgdGludDogJyNlNGU1ZTcnIH0sIH0sXG4gICdlMi1pbmNsaW5lJzogeyAndXBwZXItb3JlLWNhYmxlLWhvdXNlJzogeyBpbnRlbnNpdHk6IDIuNSwgdGludDogJyNlMGUzZGYnIH0sICd3ZXN0LWxpbmUtYnJha2UtdG93ZXInOiB7IGludGVuc2l0eTogMi41LCB0aW50OiAnI2UwZTNkZicgfSwgJ2Vhc3QtbGluZS1icmFrZS10b3dlcic6IHsgaW50ZW5zaXR5OiAyLjUsIHRpbnQ6ICcjZTBlM2RmJyB9LCB9LFxuICAnZTEtYmFyb24nOiB7XG4gICAgZm9ydGlmaWVkX2Zhcl9iYW5rOiB7IGludGVuc2l0eTogMi41LCB0aW50OiAnI2FhYjViYicgfSxcbiAgICBzaWVnZV9saW5lOiB7IGludGVuc2l0eTogMi4yLCB0aW50OiAnI2E4YjBiNCcgfSxcbiAgICBzZWl6ZWRfaGVhZGZyYW1lOiB7IGludGVuc2l0eTogMi40LCB0aW50OiAnI2I2YjZiMCcgfSxcbiAgICBveGJsb29kX2Jhbm5lcnM6IHsgaW50ZW5zaXR5OiAzLjQsIHRpbnQ6ICcjZmZkMmI0JyB9LFxuICB9LFxuICAvLyBUSEUgUk9PRiBUSEFUIFNIT1VUUyAoZG9jcy9iZWF1dHkvZTItaGlsbC1taW5lLWJyaWVmLm1kIFUzKS4gTWVhc3VyZWQgYXQgdGhlIHJ1biBjYW1lcmEsIHRoZVxuICAvLyBib2lsZXItaG91c2Ugcm9vZiBpcyB0aGUgbG91ZGVzdCBwaXhlbCBmaWVsZCBvbiB0aGUgbWFwOiBtZWFuIHJnYiAxMzksMzgsMTUgb3ZlciB0aGUgcm9vZlxuICAvLyB3aW5kb3csIHdhcm10aCAoUi1CKSAxMjQgd2hlcmUgdGhlIHdob2xlIHJlc3Qgb2YgdGhlIGZyYW1lIGxpdmVzIGJldHdlZW4gMTAgYW5kIDk3LiBUaGF0IGlzIHRoZVxuICAvLyBiYXJvbidzIFwiY2lyY3VzIHRlbnRzXCIgZGlzZWFzZSwgYW5kIGl0IGlzIGEgcGFpbnQgcHJvYmxlbSwgbm90IGEgYm9keSBwcm9ibGVtIOKAlCB0aGUgcGFjayBtdXN0XG4gIC8vIG5vdCBiZSByZWJ1aWx0IChGLUJUQi0xIGNsYXNzKSwgc28gdGhpcyBpcyB0dW5lZCB0aHJvdWdoIHRoZSBwZXItY29udHJhY3QgcGFpbnQgYXJndW1lbnQuXG4gIC8vXG4gIC8vIEEgY29sb3VyIG11bHRpcGx5IGNhbiBvbmx5IGV2ZXIgdGFrZSBsaWdodCBhd2F5LCBzbyBpdCBjYW5ub3QgcmVwYWludCBjcmltc29uIGFzIGlyb24uIFdoYXQgaXRcbiAgLy8gQ0FOIGRvIGlzIHRha2UgdGhlIHJlZCBjaGFubmVsIGRvd24gaGFyZGVyIHRoYW4gdGhlIG90aGVyIHR3bywgd2hpY2ggaXMgd2hhdCB0dXJucyBhIHNpZ25hbCByZWRcbiAgLy8gaW50byBhbiBveGlkZTogdGhlIHRpbnQncyBibHVlIGlzIGFib3ZlIGl0cyByZWQgZm9yIHRoZSBzYW1lIHJlYXNvbiB0aGUgYmFyb24ncyBmb3J0IHRpbnQgaXMuXG4gIC8vIFRoZSBpbnRlbnNpdHkgZG9lcyB0aGUgcmVzdCBvZiB0aGUgd29yayDigJQgYXQgMyB0aGUgY29sb3VyIG1hcCBpcyBpdHMgb3duIGxpZ2h0IHNvdXJjZSwgc28gdGhlXG4gIC8vIHJvb2YgaXMgZW1pdHRpbmcgcmF0aGVyIHRoYW4gYmVpbmcgbGl0LCBhbmQgdGhlIGxvdyBzdW4gbW9kZWxzIG5vdGhpbmcgb24gaXQuXG4gICdlMi1oaWxsLW1pbmUnOiB7ICdib2lsZXItaG91c2Utc2l0ZSc6IHsgaW50ZW5zaXR5OiAyLCB0aW50OiAnIzlhYTZhNicgfSwgfSxcbn07XG5cblxuY29uc3QgREVGQVVMVF9MQU5ETUFSS19QQUlOVDogTGFuZG1hcmtQYWludCA9IHsgaW50ZW5zaXR5OiAzLCB0aW50OiAnI2ZmZmZmZicgfTtcblxuXG4vKipcbiAqIFU0IOKAlCBiYW5uZXJzIGluIHRoZSB3aW5kLiBUaGUgQmFyb24ncyBjbGFpbS1qdW1waW5nIGNvbXBhbnkgYnJhbmQgcmVhZHMgaW4gdGhlXG4gKiBIVUQgZXZlcnkgdGltZSBoZSB0YXVudHMsIGFuZCBodW5nIGRlYWQgaW4gdGhlIHdvcmxkLiBUaGlzIGlzIGEgdmVydGV4LXNoYWRlclxuICogc3dheTogbm8gbmV3IGRyYXdzLCBubyBuZXcgZ2VvbWV0cnksIG5vIENQVSBwZXItZnJhbWUgd29yayBiZXlvbmQgb25lIHVuaWZvcm0uXG4gKlxuICogVGhlIGRpc3BsYWNlbWVudCBpcyBnYXRlZCBvbiB0aGUgdmVydGV4J3Mgb3duIEhFSUdIVCwgc28gcG9sZXMgc3RheSBwbGFudGVkIGluXG4gKiB0aGUgZ3JvdW5kIGFuZCBvbmx5IGNsb3RoIG1vdmVzLCBhbmQgaXRzIHBoYXNlIGNvbWVzIGZyb20gdGhlIHZlcnRleCdzIG93biBYIOKAlFxuICogd2hpY2ggbWVhbnMgdGhlIHNpeCBiYW5uZXJzIHN0cnVuZyBhbG9uZyBvbmUgMjkgbSBib2R5IGVhY2ggYnJlYXRoZSBvbiB0aGVpclxuICogb3duIGJlYXQgd2l0aG91dCBhIHNpbmdsZSBwZXItaW5zdGFuY2UgYXR0cmlidXRlLlxuICpcbiAqIEFtcGxpdHVkZXMgYXJlIHBlci1tb3VudDogdGhlIGJhbm5lciBsaW5lIGdldHMgYSByZWFsIGZsYXAsIHRoZSBzaWVnZSBsaW5lIGdldHNcbiAqIGEgdGhpcmQgb2YgaXQgKGl0cyBnZW9tZXRyeSBpcyBtb3N0bHkgc3Rha2VzLCBhbmQgYSBzd2F5aW5nIHBhbGlzYWRlIHdvdWxkIHJlYWRcbiAqIGFzIGEgYnVnIHJhdGhlciB0aGFuIGFzIHdlYXRoZXIpLlxuICovXG5jb25zdCBCQVJPTl9TV0FZX0FNUExJVFVERTogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHsgb3hibG9vZF9iYW5uZXJzOiAwLjE4NSwgc2llZ2VfbGluZTogMC4wNiB9O1xuXG5cbmNvbnN0IEJBUk9OX1NXQVlfRkxPT1IgPSAyLjI7XG5cblxuY29uc3QgYmFyb25Td2F5VGltZSA9IHsgdmFsdWU6IDAgfTtcblxuXG5mdW5jdGlvbiBpbnN0YWxsQmFubmVyU3dheShtb2RlbDogVEhSRUUuT2JqZWN0M0QsIGFtcGxpdHVkZTogbnVtYmVyKTogdm9pZCB7XG4gIG1vZGVsLnRyYXZlcnNlKChub2RlKSA9PiB7XG4gICAgY29uc3QgbWVzaCA9IG5vZGUgYXMgVEhSRUUuTWVzaDxUSFJFRS5CdWZmZXJHZW9tZXRyeSwgVEhSRUUuTWF0ZXJpYWw+O1xuICAgIGlmICghbWVzaC5pc01lc2ggfHwgQXJyYXkuaXNBcnJheShtZXNoLm1hdGVyaWFsKSkgcmV0dXJuO1xuICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbDtcbiAgICBpZiAobWF0ZXJpYWwudXNlckRhdGEuYmFyb25Td2F5QW1wbGl0dWRlID09PSBhbXBsaXR1ZGUpIHJldHVybjtcbiAgICBtYXRlcmlhbC51c2VyRGF0YS5iYXJvblN3YXlBbXBsaXR1ZGUgPSBhbXBsaXR1ZGU7XG4gICAgY29uc3QgY29tcGlsZSA9IG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZS5iaW5kKG1hdGVyaWFsKTtcbiAgICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgY29tcGlsZShzaGFkZXIsIHJlbmRlcmVyKTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy51QmFyb25Td2F5VGltZSA9IGJhcm9uU3dheVRpbWU7XG4gICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG51bmlmb3JtIGZsb2F0IHVCYXJvblN3YXlUaW1lOycpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICcjaW5jbHVkZSA8YmVnaW5fdmVydGV4PicsXG4gICAgICAgICAgYCNpbmNsdWRlIDxiZWdpbl92ZXJ0ZXg+XG5mbG9hdCBiYXJvblN3YXlMaWZ0ID0gY2xhbXAoKHBvc2l0aW9uLnkgLSAke0JBUk9OX1NXQVlfRkxPT1IudG9GaXhlZCgyKX0pIC8gMy4yLCAwLjAsIDEuMCk7XG5iYXJvblN3YXlMaWZ0ICo9IGJhcm9uU3dheUxpZnQ7XG5mbG9hdCBiYXJvblN3YXlQaGFzZSA9IHBvc2l0aW9uLnggKiAwLjU1O1xuZmxvYXQgYmFyb25Td2F5ID0gc2luKHVCYXJvblN3YXlUaW1lICogMS43ICsgYmFyb25Td2F5UGhhc2UpICogMC43MiArIHNpbih1QmFyb25Td2F5VGltZSAqIDIuOSArIGJhcm9uU3dheVBoYXNlICogMS45ICsgMS4zKSAqIDAuMjg7XG50cmFuc2Zvcm1lZC54ICs9IGJhcm9uU3dheSAqIGJhcm9uU3dheUxpZnQgKiAke2FtcGxpdHVkZS50b0ZpeGVkKDMpfTtcbnRyYW5zZm9ybWVkLnogKz0gc2luKHVCYXJvblN3YXlUaW1lICogMS4zMSArIGJhcm9uU3dheVBoYXNlICogMC43KSAqIGJhcm9uU3dheUxpZnQgKiAkeyhhbXBsaXR1ZGUgKiAwLjQ1KS50b0ZpeGVkKDMpfTtcbnRyYW5zZm9ybWVkLnkgLT0gYWJzKGJhcm9uU3dheSkgKiBiYXJvblN3YXlMaWZ0ICogJHsoYW1wbGl0dWRlICogMC4xNikudG9GaXhlZCgzKX07YCxcbiAgICAgICAgKTtcbiAgICB9O1xuICAgIC8vIFR3byBiYW5uZXIgYm9kaWVzIG11c3Qgbm90IHNoYXJlIG9uZSBjb21waWxlZCBwcm9ncmFtLCBvciB0aGUgc2Vjb25kIG9uZVxuICAgIC8vIHNpbGVudGx5IGluaGVyaXRzIHRoZSBmaXJzdCBvbmUncyBhbXBsaXR1ZGUgKFdhdGVyLnRzOjgyIHBhdHRlcm4pLlxuICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IGBiYXJvbi1zd2F5OiR7YW1wbGl0dWRlfWA7XG4gICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIC8vIEZydXN0dW0gY3VsbGluZyBzdGF5cyBPTjogdGhlIGRpc3BsYWNlbWVudCBpcyA8PTAuMTg1IG9uIGEgMjkgbSBib2R5LCBmYXJcbiAgICAvLyBpbnNpZGUgaXRzIGJvdW5kaW5nIHNwaGVyZSwgc28gZGlzYWJsaW5nIGl0IHdvdWxkIG9ubHkgYnV5IGRyYXdzIHdoZW4gdGhlXG4gICAgLy8gYmFubmVycyBhcmUgb2ZmLXNjcmVlbi5cbiAgICBtZXNoLm9uQmVmb3JlUmVuZGVyID0gKCkgPT4ge1xuICAgICAgYmFyb25Td2F5VGltZS52YWx1ZSA9IHBlcmZvcm1hbmNlLm5vdygpICogMC4wMDE7XG4gICAgfTtcbiAgfSk7XG59XG4iXX0=