import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false};import * as THREE from "/node_modules/.vite/deps/three.js?v=54c40bf9";
import terrainContractText from "/assets/layer-contracts/m1-core.layer-contract.v1.json?import&raw";
import { loadGeneratedTexture } from "/src/assets/generated.ts";
import { palette } from "/src/assets/palette.ts";
import { assetSlots, tagPlaceholder } from "/src/assets/slots.ts";
import { RenderLayers } from "/src/core/RenderLayers.ts";
import { Balance } from "/src/game/Balance.ts";
import { performanceTierDiagnostics } from "/src/game/PerformanceTier.ts";
import { activeTileDescriptor, activeWaterDescriptor, activeContract } from "/src/meta/ContractFamilies.ts";
import { hasElevationTile, isTraversable as isSimTraversable, simHeight } from "/src/sim/TileHeight.ts";
import { normalizeSeed } from "/src/core/Rng.ts";
import { disposeObject3D } from "/src/utils/dispose.ts";
import { createContinuousGroundMesh } from "/src/world/ContinuousGroundMesh.ts";
import { blockerContains, landmarkBlockersFor } from "/src/world/LandmarkCollision.ts";
import { createClaimProps } from "/src/world/props.ts";
import { createFordStones, createLivingWaterMaterial, dryWaterDiagnostics, updateWaterMaterial, waterDiagnostics } from "/src/world/Water.ts";
const ACTIVE_CONTRACT = activeContract();
const LANDMARK_BLOCKERS = landmarkBlockersFor(ACTIVE_CONTRACT.id);
const ACTIVE_TILE = activeTileDescriptor();
const TILE_WATER = activeWaterDescriptor();
export const DEFAULT_CLAIM_SIZE = 64;
export const CLAIM_SIZE = ACTIVE_CONTRACT.tileParams.size ?? DEFAULT_CLAIM_SIZE;
export const CLAIM_HALF = CLAIM_SIZE / 2;
export const CLAIM_WIDTH = ACTIVE_CONTRACT.tileParams.dimensions?.width ?? CLAIM_SIZE;
export const CLAIM_HEIGHT = ACTIVE_CONTRACT.tileParams.dimensions?.height ?? CLAIM_SIZE;
export const CLAIM_HALF_X = CLAIM_WIDTH / 2;
export const CLAIM_HALF_Z = CLAIM_HEIGHT / 2;
export const RIVER_MIN_Z = TILE_WATER?.centerZ !== undefined && TILE_WATER.halfWidth !== undefined ? TILE_WATER.centerZ - TILE_WATER.halfWidth : -5;
export const RIVER_MAX_Z = TILE_WATER?.centerZ !== undefined && TILE_WATER.halfWidth !== undefined ? TILE_WATER.centerZ + TILE_WATER.halfWidth : 5;
export const FORD_MIN_X = -3;
export const FORD_MAX_X = 3;
export const SHALLOWS_WIDTH = 1.25;
export const WATER_Y = .025;
export const VISTA_RADIUS = 90;
const ELEVATION_TILE = hasElevationTile();
const AUTHORED_TERRAIN = ACTIVE_CONTRACT.tileParams.authoredTerrain;
let editorPreviewActive = false;
let editorPreviewTerrain;
let editorPreviewContract = null;
let refreshEditorPreview = null;
let runtimeVisualHeightSource = null;
let runtimePointerSurfaces = null;
let fallbackPointerSurfaces = [];
const pointerHits = [];
const pointerFallbackPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const WATER_MASK = ACTIVE_TILE.waterMask?.regions.length ? ACTIVE_TILE.waterMask : undefined;
const SPRING_PONDS = ACTIVE_CONTRACT.tileParams.waterSources.filter((source) => source.kind === "spring_pond");
const FORD_RANGES = resolveFordRanges();
const DEFAULT_WATER_DEPTH = {
	river: 1.25,
	ford: .35,
	shallows: .2,
	springPond: .2
};
const DEFAULT_WATER_SPEED = {
	river: .55,
	ford: .85,
	shallows: .8,
	springPond: .8
};
export const bounds = {
	minX: -CLAIM_HALF_X,
	maxX: CLAIM_HALF_X,
	minZ: -CLAIM_HALF_Z,
	maxZ: CLAIM_HALF_Z
};
function defaultFordRange() {
	return {
		id: "center-ford",
		minX: FORD_MIN_X,
		maxX: FORD_MAX_X,
		centerX: (FORD_MIN_X + FORD_MAX_X) / 2,
		halfWidth: (FORD_MAX_X - FORD_MIN_X) / 2
	};
}
function resolveFordRanges() {
	if (!ACTIVE_CONTRACT.tileParams.ford) return [];
	const ranges = ACTIVE_CONTRACT.tileParams.fords ?? [];
	if (ranges.length === 0) return [defaultFordRange()];
	return ranges.map((range) => ({
		id: range.id,
		minX: range.x - range.halfWidth,
		maxX: range.x + range.halfWidth,
		centerX: range.x,
		halfWidth: range.halfWidth
	}));
}
function fordAt(x, z) {
	if (z < RIVER_MIN_Z || z > RIVER_MAX_Z) return null;
	return FORD_RANGES.find((range) => x >= range.minX && x <= range.maxX) ?? null;
}
const DEFAULT_NODE_ANCHORS = [
	{
		x: -22,
		z: -6.8
	},
	{
		x: -9,
		z: 6.7
	},
	{
		x: -1.5,
		z: -6.4
	},
	{
		x: 7.5,
		z: 6.5
	},
	{
		x: 18,
		z: -7
	},
	{
		x: 25,
		z: 6.9
	}
];
export const nodeAnchors = ACTIVE_CONTRACT.tileParams.harvestAnchors ?? DEFAULT_NODE_ANCHORS;
export function sample(x, z) {
	if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
		return {
			walkable: false,
			speedMul: 0,
			zone: "out"
		};
	}
	if (ELEVATION_TILE && !isSimTraversable(x, z)) return {
		walkable: false,
		speedMul: 0,
		zone: "out"
	};
	const landmarkBlocked = LANDMARK_BLOCKERS.some((blocker) => blockerContains(blocker, x, z, Balance.hero.radius + .08));
	const withLandmarkCollision = (terrain) => landmarkBlocked ? {
		...terrain,
		walkable: false,
		speedMul: 0
	} : terrain;
	const spring = springPondAt(x, z);
	if (spring) return withLandmarkCollision(waterSample("shallows", "springPond", "spring_pond"));
	if (WATER_MASK) {
		const region = WATER_MASK.regions.find((candidate) => distanceToWaterMaskRegion(x, z, candidate) <= 0);
		return withLandmarkCollision(region ? waterSample(region.zone, region.zone, "river") : {
			walkable: true,
			speedMul: 1,
			zone: "bank"
		});
	}
	if (!ACTIVE_CONTRACT.tileParams.river) return withLandmarkCollision({
		walkable: true,
		speedMul: 1,
		zone: "bank"
	});
	const inFord = fordAt(x, z) !== null;
	if (ACTIVE_CONTRACT.tileParams.ford && inFord) return withLandmarkCollision(waterSample("ford", "ford", "river"));
	const inRiver = z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
	if (inRiver) return withLandmarkCollision(waterSample("river", "river", "river"));
	const inShallows = z > RIVER_MAX_Z && z <= RIVER_MAX_Z + SHALLOWS_WIDTH || z < RIVER_MIN_Z && z >= RIVER_MIN_Z - SHALLOWS_WIDTH;
	if (inShallows) return withLandmarkCollision(waterSample("shallows", "shallows", "river"));
	return withLandmarkCollision({
		walkable: true,
		speedMul: 1,
		zone: "bank"
	});
}
export function landmarkBlockers() {
	return LANDMARK_BLOCKERS;
}
export function waterDepth(zone) {
	return TILE_WATER?.depths?.[zone] ?? DEFAULT_WATER_DEPTH[zone];
}
function waterSpeedMul(zone) {
	return TILE_WATER?.speedMul?.[zone] ?? DEFAULT_WATER_SPEED[zone];
}
function waterSample(zone, depthZone, waterSource) {
	const depth = waterDepth(depthZone);
	const deep = depth >= Balance.terrainSim.deepDepth;
	const walkable = depth <= Balance.terrainSim.wadeDepth || deep && TILE_WATER?.heroCanWadeDeep === true && ACTIVE_TILE.id === "frontier-river-claim";
	return {
		walkable,
		speedMul: walkable ? waterSpeedMul(depthZone) : 0,
		zone,
		waterSource,
		waterDepth: depth,
		waterClass: deep ? "deep" : "wade"
	};
}
export function spawnEdges() {
	return [
		{
			x: 0,
			z: bounds.minZ
		},
		{
			x: 0,
			z: bounds.maxZ
		},
		{
			x: bounds.maxX,
			z: 0
		},
		{
			x: bounds.minX,
			z: 0
		}
	];
}
export function isBuildable(x, z) {
	const terrain = sample(x, z);
	if (!terrain.walkable || terrain.zone !== "bank") return false;
	const zones = ACTIVE_CONTRACT.tileParams.buildZones ?? [];
	return zones.length === 0 || zones.some((zone) => x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ);
}
export function riverGeometry() {
	return {
		minX: bounds.minX,
		maxX: bounds.maxX,
		minZ: RIVER_MIN_Z,
		maxZ: RIVER_MAX_Z
	};
}
export function waterSources() {
	return SPRING_PONDS;
}
/**
* Read-only: the half width of the tile's DECLARED visual water band, the same
* number the painted river ribbon is cut to. Exported so a sculpted map can lay
* its own water surface to the identical width without duplicating the fallback
* rule. Reads sim declarations; writes nothing.
*/
export function visualWaterHalfWidth() {
	return visualWaterWidth() / 2;
}
export function waterMask() {
	return WATER_MASK;
}
export function isCrossingStructure(x, z) {
	if ((TILE_WATER?.gravelBars ?? []).some((bar) => gravelBarContains(bar, x, z))) return true;
	if (WATER_MASK) {
		return WATER_MASK.regions.some((region) => region.zone === "ford" && distanceToWaterMaskRegion(x, z, region) <= 0);
	}
	return ACTIVE_CONTRACT.tileParams.ford === true && fordAt(x, z) !== null;
}
export function gravelBarContains(bar, x, z) {
	const dx = x - bar.x;
	const dz = z - bar.z;
	const cos = Math.cos(bar.rotation);
	const sin = Math.sin(bar.rotation);
	const localX = dx * cos + dz * sin;
	const localZ = -dx * sin + dz * cos;
	return (localX / (bar.length * .5)) ** 2 + (localZ / (bar.width * .5)) ** 2 <= 1;
}
export function fordRanges() {
	return FORD_RANGES;
}
export function nearestFordRange(x) {
	let best = FORD_RANGES[0] ?? defaultFordRange();
	let bestDistance = Math.abs(x - best.centerX);
	for (const range of FORD_RANGES.slice(1)) {
		const distance = Math.abs(x - range.centerX);
		if (distance < bestDistance) {
			best = range;
			bestDistance = distance;
		}
	}
	return best;
}
export function stakeMarkers() {
	return ACTIVE_CONTRACT.tileParams.stakeMarkers ?? [];
}
export function lossStakeMarker() {
	return stakeMarkers().find((marker) => marker.heroStart) ?? null;
}
export function hasRiverWater() {
	return WATER_MASK !== undefined || ACTIVE_CONTRACT.tileParams.river;
}
export function isWaterSourceAdjacent(x, z, pad) {
	const terrain = sample(x, z);
	if (terrain.zone !== "bank" && terrain.zone !== "shallows") return false;
	if (WATER_MASK && WATER_MASK.regions.some((region) => distanceToWaterMaskRegion(x, z, region) <= pad)) return true;
	if (!WATER_MASK && ACTIVE_CONTRACT.tileParams.river) {
		const river = riverGeometry();
		if (x >= river.minX && x <= river.maxX) {
			const distance = z < river.minZ ? river.minZ - z : z > river.maxZ ? z - river.maxZ : 0;
			if (distance <= pad) return true;
		}
	}
	return SPRING_PONDS.some((source) => distanceToSpringEdge(x, z, source) <= pad);
}
function distanceToWaterMaskRegion(x, z, region) {
	if (region.kind === "rect") {
		return Math.hypot(Math.max(region.minX - x, 0, x - region.maxX), Math.max(region.minZ - z, 0, z - region.maxZ));
	}
	let distance = Number.POSITIVE_INFINITY;
	for (let index = 1; index < region.points.length; index += 1) {
		const start = region.points[index - 1];
		const end = region.points[index];
		const dx = end.x - start.x;
		const dz = end.z - start.z;
		const lengthSq = dx * dx + dz * dz;
		const t = lengthSq <= Balance.waterMask.segmentEpsilon ? 0 : THREE.MathUtils.clamp(((x - start.x) * dx + (z - start.z) * dz) / lengthSq, 0, 1);
		distance = Math.min(distance, Math.hypot(x - (start.x + dx * t), z - (start.z + dz * t)));
	}
	return distance - region.halfWidth;
}
export function sampleHeight(x, z) {
	if (runtimeVisualHeightSource) {
		return runtimeVisualHeightSource(THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX), THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ));
	}
	const base = ELEVATION_TILE ? simHeight(x, z) : sampleHeightFamily(THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX), THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ), false);
	return currentAuthoredTerrain() ? base + authoredTerrainDelta(x, z) : base;
}
export function sampleUnclampedHeight(x, z) {
	if (runtimeVisualHeightSource && x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ) {
		return runtimeVisualHeightSource(x, z);
	}
	const base = ELEVATION_TILE ? simHeight(x, z) : sampleHeightFamily(x, z, true);
	return currentAuthoredTerrain() ? base + authoredTerrainDelta(x, z) : base;
}
export function previewEditorContract(contract) {
	editorPreviewActive = true;
	editorPreviewContract = contract;
	editorPreviewTerrain = contract.tileParams.authoredTerrain;
	refreshEditorPreview?.(contract);
}
export function intersectVisualGround(raycaster, out) {
	pointerHits.length = 0;
	raycaster.intersectObjects(runtimePointerSurfaces ?? fallbackPointerSurfaces, true, pointerHits);
	const hit = pointerHits[0];
	if (hit) out.copy(hit.point);
	pointerHits.length = 0;
	return hit !== undefined || raycaster.ray.intersectPlane(pointerFallbackPlane, out) !== null;
}
export function installVisualHeightSource(source, surfaces) {
	runtimeVisualHeightSource = source;
	runtimePointerSurfaces = surfaces;
	return () => {
		if (runtimeVisualHeightSource === source) {
			runtimeVisualHeightSource = null;
			runtimePointerSurfaces = null;
		}
	};
}
function authoredTerrainDelta(x, z) {
	const layer = currentAuthoredTerrain();
	if (!layer) return 0;
	const gridX = (x - layer.originX) / layer.cellSize;
	const gridZ = (z - layer.originZ) / layer.cellSize;
	if (gridX < 0 || gridZ < 0 || gridX > layer.columns - 1 || gridZ > layer.rows - 1) return 0;
	const x0 = Math.floor(gridX);
	const z0 = Math.floor(gridZ);
	const x1 = Math.min(x0 + 1, layer.columns - 1);
	const z1 = Math.min(z0 + 1, layer.rows - 1);
	const at = (column, row) => layer.heightDeltas[row * layer.columns + column];
	const north = THREE.MathUtils.lerp(at(x0, z0), at(x1, z0), gridX - x0);
	const south = THREE.MathUtils.lerp(at(x0, z1), at(x1, z1), gridX - x0);
	return THREE.MathUtils.lerp(north, south, gridZ - z0);
}
function currentAuthoredTerrain() {
	return editorPreviewActive ? editorPreviewTerrain : AUTHORED_TERRAIN;
}
function currentContract() {
	return editorPreviewContract ?? ACTIVE_CONTRACT;
}
export function routingLaneDistance(x, z) {
	const fordApproach = Math.abs(x - nearestFordRange(x).centerX);
	const claimLane = Math.abs(x) < 18 ? Math.abs(z - 12) : Number.POSITIVE_INFINITY;
	return Math.min(fordApproach, claimLane);
}
export function terrainFeatureSample(x, z) {
	return terrainFeatures(x, z);
}
function sampleHeightFamily(x, z, vistaRise) {
	const absZ = Math.abs(z);
	const bankDistance = Math.max(0, absZ - RIVER_MAX_Z);
	const bankT = smoothstep(0, 15, bankDistance);
	const valley = THREE.MathUtils.lerp(-.16, .36, bankT);
	const southRise = z < RIVER_MIN_Z ? smoothstep(0, CLAIM_HALF - Math.abs(RIVER_MIN_Z), Math.abs(z) - Math.abs(RIVER_MIN_Z)) * .14 : 0;
	const vistaBankRise = vistaRise ? smoothstep(CLAIM_HALF, VISTA_RADIUS, absZ) * .42 : 0;
	const claimCalm = z > RIVER_MAX_Z + SHALLOWS_WIDTH && z < 23 && Math.abs(x) < 24 ? THREE.MathUtils.lerp(.42, 1, smoothstep(0, 24, Math.abs(x))) : 1;
	const riverNoiseMask = THREE.MathUtils.lerp(.28, 1, smoothstep(RIVER_MAX_Z - .5, RIVER_MAX_Z + 4, absZ));
	const noise = (valueNoise(x * .065, z * .065) - .5) * .32 + (valueNoise(x * .17 + 41.7, z * .17 - 13.2) - .5) * .16 + (valueNoise(x * .34 - 9.1, z * .34 + 27.4) - .5) * .06;
	const features = terrainFeatures(x, z);
	const legacyMaxHeight = vistaRise && absZ > CLAIM_HALF ? 1.05 : .62;
	const baseHeight = THREE.MathUtils.clamp((valley + southRise + vistaBankRise + noise * claimCalm * riverNoiseMask) * Balance.world.terrainRelief, -.18, legacyMaxHeight);
	const maxHeight = vistaRise && absZ > CLAIM_HALF ? 1.46 : 1.18;
	const minHeight = currentContract().tileParams.heightfield ? -.52 : -.38;
	return THREE.MathUtils.clamp(baseHeight + features.heightOffset + contractHeightfieldOffset(x, z), minHeight, maxHeight);
}
export function samplePaddedHeight(x, z, radius = 0) {
	if (radius <= .01) return sampleHeight(x, z);
	const r = Math.max(.25, radius * .65);
	return (sampleHeight(x, z) * 2 + sampleHeight(x - r, z) + sampleHeight(x + r, z) + sampleHeight(x, z - r) + sampleHeight(x, z + r)) / 6;
}
export function visualY(x, z, base = 0, padRadius = 0) {
	return samplePaddedHeight(x, z, padRadius) + base;
}
export function visualAnchorY(position, lift) {
	return visualY(position.x, position.z, lift);
}
export function heightDiagnostics() {
	let min = Number.POSITIVE_INFINITY;
	let max = Number.NEGATIVE_INFINITY;
	for (let z = bounds.minZ; z <= bounds.maxZ; z += 4) {
		for (let x = bounds.minX; x <= bounds.maxX; x += 4) {
			const height = sampleHeight(x, z);
			min = Math.min(min, height);
			max = Math.max(max, height);
		}
	}
	const naturalProbes = {
		gully: sampleHeight(14, -14),
		shelf: sampleHeight(23, -20),
		bluff: sampleHeight(29, 29),
		pocket: sampleHeight(-22, 20)
	};
	const fordBand = [
		-2,
		0,
		2
	].flatMap((x) => [sampleHeight(x, RIVER_MAX_Z + SHALLOWS_WIDTH), sampleHeight(x, RIVER_MIN_Z - SHALLOWS_WIDTH)]);
	const fordApproachDelta = Math.max(...fordBand) - Math.min(...fordBand);
	const laneSamples = [
		-28,
		-18,
		-8,
		8,
		18,
		28
	].map((z) => sampleHeight(0, z));
	const routingLaneDelta = Math.max(...laneSamples) - Math.min(...laneSamples);
	const routingFeatureMax = Math.max(...[
		-28,
		-18,
		-8,
		8,
		18,
		28
	].map((z) => Math.abs(terrainFeatureSample(0, z).heightOffset)));
	return {
		min,
		max,
		segments: terrainSegments(),
		waterY: WATER_Y,
		probes: {
			heroStart: sampleHeight(0, 12),
			river: sampleHeight(-12, 0),
			ford: sampleHeight(0, 0),
			nearBank: sampleHeight(12, RIVER_MAX_Z + SHALLOWS_WIDTH),
			farBank: sampleHeight(12, -18)
		},
		natural: {
			range: max - min,
			fordApproachDelta,
			routingLaneDelta,
			routingFeatureMax,
			probes: naturalProbes,
			features: {
				gully: terrainFeatureSample(14, -14),
				shelf: terrainFeatureSample(23, -20),
				bluff: terrainFeatureSample(29, 29),
				pocket: terrainFeatureSample(-22, 20)
			}
		}
	};
}
export function vistaDiagnostics() {
	const seam = vistaSeamProbePoints().map((point) => {
		const clamped = sampleHeight(point.x, point.z);
		const unclamped = sampleUnclampedHeight(point.x, point.z);
		const delta = Math.abs(clamped - unclamped);
		return {
			...point,
			clamped,
			unclamped,
			delta
		};
	});
	return {
		present: true,
		segments: vistaSegments(),
		radius: VISTA_RADIUS,
		vertices: vistaVertexCount(),
		seamMaxDelta: Math.max(...seam.map((entry) => entry.delta)),
		seam,
		river: vistaRiverDiagnostics()
	};
}
const BANK_TILE_REPEATS = 4;
const BANK_VARIANT_FILES = terrainBankVariantFiles();
// Lazy glob (NOT eager): eager would compile to static imports of every
// processed png, making each one a boot-time module dependency in dev — a
// single failed/blocked asset request would then kill the whole app instead
// of falling back to placeholders (gate finding, s11: visual-polish-assets
// fallback test). Lazy keeps asset fetches out of the module graph.
//
// F-CELL-4 (2026-09-07): `'../../assets/processed/ter-*.png'` used to sit in this list and matched
// EXACTLY the seven `ter-rail-elements-r0c0..r0c6.png` sheet cells — art-batch-010 output that no
// consumer has ever wired. Only two names are ever looked up through this map: `prop-spring-pond.png`
// (:832) and the `terrain-*` bank variants the m1-core contract names (`terrainBankVariantFiles()`,
// :1622). So the entry bought nothing and cost seven per-cell JS modules and seven PNG assets in
// every dev-variant build. The staying-lazy law above is untouched: this is a NARROWING, not an
// eagerness change. The release build never carried them either — `vite.config.ts` used to strip
// this exact entry from the array literal, and that replacement was removed in the same commit,
// because a replacement whose search string no longer exists reads like a narrowing that is not
// happening. If a rail-element consumer is ever wired, add its OWN pattern here.
const processedTextureUrls = /* #__PURE__ */ Object.assign({"../../assets/processed/terrain-bank-tile-b.png": () => import("/assets/processed/terrain-bank-tile-b.png?import&url").then(m => m["default"]),"../../assets/processed/terrain-bank-tile-c.png": () => import("/assets/processed/terrain-bank-tile-c.png?import&url").then(m => m["default"]),"../../assets/processed/terrain-bank-tile.png": () => import("/assets/processed/terrain-bank-tile.png?import&url").then(m => m["default"])


});
const processedTextureUrlsByFile = new Map(Object.entries(processedTextureUrls).map(([path, urlLoader]) => [path.split("/").pop() ?? path, urlLoader]));
const textureLoader = new THREE.TextureLoader();
const bankMaterial = new THREE.MeshStandardMaterial({
	color: palette.sand,
	roughness: .86,
	metalness: .01
});
export const createBankPlaceholder = Object.assign(() => {
	const mesh = new THREE.Mesh(createBankGeometry(), createBankMaterial());
	mesh.name = "TerrainReliefMesh";
	mesh.userData.terrainRelief = true;
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	return tagPlaceholder(mesh, assetSlots.terrainBank);
}, { slotId: assetSlots.terrainBank });
export const createRiverPlaceholder = Object.assign(() => {
	const mesh = new THREE.Mesh(createExtendedRiverGeometry(), createLivingWaterMaterial(waterMaterialConfig(false)));
	mesh.userData.visualHalfWidth = visualWaterWidth() / 2;
	mesh.rotation.x = -Math.PI / 2;
	mesh.position.y = WATER_Y;
	mesh.renderOrder = RenderLayers.terrain;
	mesh.receiveShadow = true;
	return tagPlaceholder(mesh, assetSlots.terrainRiver);
}, { slotId: assetSlots.terrainRiver });
export function createFordPlaceholder(range = defaultFordRange()) {
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(range.maxX - range.minX, visualWaterWidth(), 1, 1), createLivingWaterMaterial(waterMaterialConfig(true, range)));
	mesh.rotation.x = -Math.PI / 2;
	mesh.position.set(range.centerX, WATER_Y + .015, 0);
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = true;
	return tagPlaceholder(mesh, assetSlots.terrainFord);
}
export function createTerrainView() {
	const group = new THREE.Group();
	const bank = createGroundMesh();
	const vistaBank = createVistaBankMesh(bank.material);
	const props = createClaimProps();
	const springPonds = createSpringPonds(SPRING_PONDS);
	let renderedSpringPonds = SPRING_PONDS.length;
	for (const prop of props.children) prop.position.y = visualY(prop.position.x, prop.position.z, 0, .7);
	group.add(vistaBank, bank);
	let river = null;
	const fords = [];
	const fordStones = [];
	const gravelBars = [];
	if (ACTIVE_CONTRACT.tileParams.river) {
		river = createRiverPlaceholder();
		for (const range of FORD_RANGES) {
			const ford = createFordPlaceholder(range);
			const stones = createFordStones(WATER_Y, range.centerX);
			fords.push(ford);
			fordStones.push(stones);
		}
		gravelBars.push(...createGravelBars());
		group.add(river, ...fords, ...fordStones, ...gravelBars);
	}
	group.add(springPonds, props);
	const pointerSurfaces = [
		bank,
		springPonds,
		...river ? [river, ...fords] : []
	];
	fallbackPointerSurfaces = pointerSurfaces;
	bank.geometry.addEventListener("dispose", () => {
		if (fallbackPointerSurfaces === pointerSurfaces) fallbackPointerSurfaces = [];
	});
	refreshEditorPreview = (contract) => {
		refreshGroundGeometry(bank);
		disposeObject3D(springPonds);
		springPonds.clear();
		const nextPonds = createSpringPonds(contract.tileParams.waterSources);
		for (const pond of [...nextPonds.children]) springPonds.add(pond);
		renderedSpringPonds = contract.tileParams.waterSources.length;
	};
	return {
		group,
		update: (delta) => {
			syncBankMaterial(bank);
			if (river) updateWaterMaterial(river, delta);
			for (const ford of fords) updateWaterMaterial(ford, delta);
		},
		diagnostics: () => river ? waterDiagnostics(river, fords, fordStones, gravelBars) : dryWaterDiagnostics(renderedSpringPonds),
		groundDiagnostics: () => groundDiagnostics(bank)
	};
}
function refreshGroundGeometry(mesh) {
	const geometry = mesh.geometry;
	const positions = geometry.getAttribute("position");
	for (let index = 0; index < positions.count; index += 1) {
		positions.setZ(index, sampleHeight(positions.getX(index), -positions.getY(index)));
	}
	positions.needsUpdate = true;
	applyTerrainNormals(geometry, sampleUnclampedHeight);
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();
}
function createGroundMesh() {
	const splat = terrainSplatEnabled();
	const meshEnabled = terrainMeshEnabled() || splat;
	if (!meshEnabled) return createBankPlaceholder();
	const mesh = createContinuousGroundMesh({
		size: CLAIM_SIZE,
		width: CLAIM_WIDTH,
		height: CLAIM_HEIGHT,
		segments: terrainMeshSegments(),
		material: createBankMaterial(splat),
		heightAt: sampleHeight,
		normalHeightAt: sampleUnclampedHeight
	});
	if (splat) {
		const stats = mesh.userData.groundStats;
		if (stats) {
			stats.textureSource = "bank-atlas-splat";
			stats.textureSeams = "per-pixel splat gradients";
		}
	}
	return tagPlaceholder(mesh, assetSlots.terrainBank);
}
function createGravelBars() {
	return (TILE_WATER?.gravelBars ?? []).map(createGravelBar);
}
function createGravelBar(bar) {
	const mesh = new THREE.Mesh(new THREE.CircleGeometry(.5, 36), new THREE.MeshStandardMaterial({
		color: "#a99573",
		roughness: .94,
		metalness: .01
	}));
	mesh.name = `RiverGravelBar.${bar.id}`;
	mesh.rotation.set(-Math.PI / 2, 0, bar.rotation);
	mesh.position.set(bar.x, WATER_Y + .03, bar.z);
	mesh.scale.set(bar.length, bar.width, 1);
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = true;
	return mesh;
}
function createSpringPonds(sources) {
	const group = new THREE.Group();
	group.name = "SpringPonds";
	for (const source of sources) group.add(createSpringPond(source));
	return group;
}
function createSpringPond(source) {
	const group = new THREE.Group();
	group.name = "SpringPond";
	const waterMaterial = new THREE.MeshStandardMaterial({
		color: "#416f6e",
		transparent: true,
		opacity: .86,
		roughness: .42,
		metalness: .01
	});
	const water = new THREE.Mesh(new THREE.CircleGeometry(source.radius, 48), waterMaterial);
	water.name = "SpringPondPlaceholder";
	water.rotation.x = -Math.PI / 2;
	water.position.set(source.x, pondSurfaceY(source), source.z);
	water.renderOrder = RenderLayers.groundDecals;
	group.add(water);
	const ring = new THREE.Mesh(new THREE.RingGeometry(source.radius * .96, source.radius * 1.35, 48), new THREE.MeshBasicMaterial({
		color: "#3f4a36",
		transparent: true,
		opacity: .24,
		side: THREE.DoubleSide
	}));
	ring.name = "SpringPondDampRing";
	ring.rotation.x = -Math.PI / 2;
	ring.position.copy(water.position);
	ring.position.y -= .004;
	ring.renderOrder = RenderLayers.groundDecals;
	group.add(ring);
	const reeds = createPondReeds(source);
	group.add(reeds);
	const urlLoader = processedTextureUrlsByFile.get("prop-spring-pond.png");
	if (urlLoader) {
		void urlLoader().then((url) => {
			textureLoader.load(url, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.anisotropy = 4;
				waterMaterial.map = texture;
				waterMaterial.needsUpdate = true;
			});
		});
	}
	return group;
}
function pondSurfaceY(source) {
	let height = sampleHeight(source.x, source.z);
	for (let index = 0; index < 8; index += 1) {
		const angle = index / 8 * Math.PI * 2;
		const radius = source.radius * .72;
		height = Math.max(height, sampleHeight(source.x + Math.cos(angle) * radius, source.z + Math.sin(angle) * radius));
	}
	return height + WATER_Y + .035;
}
function createPondReeds(source) {
	const count = 14;
	const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(.025, .035, .42, 5), new THREE.MeshStandardMaterial({
		color: "#5c6742",
		roughness: .9
	}), count);
	mesh.name = "SpringPondReeds";
	mesh.renderOrder = RenderLayers.gameplay;
	const matrix = new THREE.Matrix4();
	const rotation = new THREE.Quaternion();
	const position = new THREE.Vector3();
	const scale = new THREE.Vector3();
	for (let index = 0; index < count; index += 1) {
		const angle = index * 2.399963 + .3;
		const radius = source.radius * (1.05 + index * 37 % 5 * .035);
		const x = source.x + Math.cos(angle) * radius;
		const z = source.z + Math.sin(angle) * radius;
		position.set(x, visualY(x, z, .24), z);
		rotation.setFromEuler(new THREE.Euler(.12 * Math.sin(angle), angle, .18 * Math.cos(angle)));
		scale.setScalar(.78 + index * 19 % 7 * .05);
		matrix.compose(position, rotation, scale);
		mesh.setMatrixAt(index, matrix);
	}
	mesh.instanceMatrix.needsUpdate = true;
	return mesh;
}
function springPondAt(x, z) {
	return SPRING_PONDS.find((source) => distanceToSpringCenter(x, z, source) <= source.radius) ?? null;
}
function distanceToSpringEdge(x, z, source) {
	return Math.max(0, distanceToSpringCenter(x, z, source) - source.radius);
}
function distanceToSpringCenter(x, z, source) {
	return Math.hypot(x - source.x, z - source.z);
}
function createBankMaterial(splat = false) {
	const material = bankMaterial.clone();
	const splatParams = terrainSplatParams();
	const liteAntiTile = performanceTierDiagnostics().tier === "lite";
	const uniforms = {
		repeat: { value: BANK_TILE_REPEATS },
		variantCount: { value: 1 },
		atlasRows: { value: 1 },
		featureMix: { value: Balance.terrain.featureMix },
		seed: { value: terrainSeed() },
		splat: { value: splat ? 1 : 0 },
		slopeShade: { value: terrainSlopeShade() },
		rockAmount: { value: splatParams.rockAmount },
		dampBand: { value: splatParams.dampBand },
		scrubAmount: { value: splatParams.scrubAmount },
		macroWarmth: { value: splatParams.macroWarmth },
		antiTile: { value: terrainAntiTileDisabled() ? 0 : splatParams.antiTile },
		paletteTint: { value: paletteVector(currentContract().tileParams.palette?.tint, [
			1,
			1,
			1
		]) },
		dampTint: { value: paletteVector(currentContract().tileParams.palette?.dampTint, [
			.4,
			.37,
			.29
		]) },
		dampAmount: { value: currentContract().tileParams.palette?.dampAmount ?? .28 }
	};
	material.map = createBankTexture();
	configureBankAtlas(material.map);
	material.userData.terrainUniforms = uniforms;
	material.onBeforeCompile = (shader) => {
		shader.uniforms.terrainRepeat = uniforms.repeat;
		shader.uniforms.terrainVariantCount = uniforms.variantCount;
		shader.uniforms.terrainAtlasRows = uniforms.atlasRows;
		shader.uniforms.terrainFeatureMix = uniforms.featureMix;
		shader.uniforms.terrainSeed = uniforms.seed;
		shader.uniforms.terrainSplat = uniforms.splat;
		shader.uniforms.terrainSlopeShade = uniforms.slopeShade;
		shader.uniforms.terrainRockAmount = uniforms.rockAmount;
		shader.uniforms.terrainDampBand = uniforms.dampBand;
		shader.uniforms.terrainScrubAmount = uniforms.scrubAmount;
		shader.uniforms.terrainMacroWarmth = uniforms.macroWarmth;
		shader.uniforms.terrainAntiTile = uniforms.antiTile;
		shader.uniforms.terrainPaletteTint = uniforms.paletteTint;
		shader.uniforms.terrainDampTint = uniforms.dampTint;
		shader.uniforms.terrainDampAmount = uniforms.dampAmount;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vTerrainUv;\nvarying vec2 vTerrainWorld;\nvarying float vTerrainSlope;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvTerrainUv = uv;\nvTerrainWorld = (modelMatrix * vec4(position, 1.0)).xz;\nvTerrainSlope = clamp((1.0 - abs(normal.z)) * 8.0, 0.0, 1.0);");
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
uniform float terrainRepeat;
uniform float terrainVariantCount;
uniform float terrainAtlasRows;
uniform float terrainFeatureMix;
uniform float terrainSeed;
uniform float terrainSplat;
uniform float terrainSlopeShade;
uniform float terrainRockAmount;
uniform float terrainDampBand;
uniform float terrainScrubAmount;
uniform float terrainMacroWarmth;
uniform float terrainAntiTile;
uniform vec3 terrainPaletteTint;
uniform vec3 terrainDampTint;
uniform float terrainDampAmount;
varying vec2 vTerrainUv;
varying vec2 vTerrainWorld;
varying float vTerrainSlope;

float terrainHash(vec2 p) {
  p += terrainSeed * vec2(37.2, 19.7);
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float terrainValueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = terrainHash(i);
  float b = terrainHash(i + vec2(1.0, 0.0));
  float c = terrainHash(i + vec2(0.0, 1.0));
  float d = terrainHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float terrainVistaRiverCenterZ(float worldX) {
  float side = worldX < 0.0 ? -1.0 : 1.0;
  float outside = max(0.0, abs(worldX) - ${CLAIM_HALF.toFixed(3)});
  float dx = worldX - side * ${CLAIM_HALF.toFixed(3)};
  float ramp = smoothstep(0.0, 18.0, outside);
  return ${((RIVER_MIN_Z + RIVER_MAX_Z) / 2).toFixed(3)} + ramp * (sin(dx * 0.065) * 2.6 + sin(dx * 0.137) * 0.8);
}

float terrainShoreDistance(vec2 worldPos) {
  return max(0.0, abs(worldPos.y - terrainVistaRiverCenterZ(worldPos.x)) - ${((RIVER_MAX_Z - RIVER_MIN_Z) / 2).toFixed(3)});
}

vec2 terrainOrientUv(vec2 tileUv, vec2 cell) {
  if (terrainHash(cell + vec2(11.0, 3.0)) < 0.5) tileUv.x = 1.0 - tileUv.x;
  float rotation = floor(terrainHash(cell + vec2(5.0, 17.0)) * 4.0);
  if (rotation < 0.5) return tileUv;
  if (rotation < 1.5) return vec2(tileUv.y, 1.0 - tileUv.x);
  if (rotation < 2.5) return vec2(1.0 - tileUv.x, 1.0 - tileUv.y);
  return vec2(1.0 - tileUv.y, tileUv.x);
}

float terrainVariant(vec2 cell, vec2 salt) {
  float variantCount = max(1.0, terrainVariantCount);
  return min(floor(terrainHash(cell + salt) * variantCount), variantCount - 1.0);
}

float terrainGullyMask(vec2 worldPos) {
  float bankDistance = terrainShoreDistance(worldPos);
  float bankMask = smoothstep(2.0, 8.0, bankDistance) * (1.0 - smoothstep(18.0, 30.0, bankDistance));
  float warpedX = worldPos.x + sin(worldPos.y * 0.19) * 3.0 + sin(worldPos.y * 0.061) * 6.0;
  float cell = floor((warpedX + 6.5) / 13.0);
  float center = cell * 13.0 - 6.5 + sin(bankDistance * 0.8 + cell) * 2.0;
  float channel = 1.0 - smoothstep(0.6, 2.3, abs(warpedX - center));
  float lane = smoothstep(4.6, 9.6, min(abs(worldPos.x), abs(worldPos.y - 12.0)));
  float ford = smoothstep(4.0, 9.0, length(worldPos));
  return channel * bankMask * lane * ford;
}`).replace("#include <map_pars_fragment>", `#include <map_pars_fragment>
vec4 terrainAtlasSample(vec2 tileUv, float variant) {
  float atlasRow = max(1.0, terrainAtlasRows) - 1.0 - variant;
  vec2 atlasUv = vec2(tileUv.x, (clamp(tileUv.y, 0.001, 0.999) + atlasRow) / max(1.0, terrainAtlasRows));
  return texture2D(map, atlasUv);
}

vec4 terrainLayerSample(vec2 repeatedUv, float scale, vec2 salt) {
  vec2 layerKey = floor(vec2(terrainSeed * 31.0, terrainSeed * 47.0) + salt);
  vec2 offset = vec2(terrainHash(layerKey + 17.0), terrainHash(layerKey + 53.0));
  vec2 tileUv = terrainOrientUv(fract(repeatedUv * scale + offset), layerKey);
  return terrainAtlasSample(tileUv, terrainVariant(layerKey, salt));
}`).replace("#include <map_fragment>", `
#ifdef USE_MAP
  vec2 repeatedUv = vTerrainUv * terrainRepeat;
  vec4 packedSand = terrainLayerSample(repeatedUv, 1.0, vec2(23.0, 29.0));
  vec4 dryDirt = terrainLayerSample(repeatedUv, 0.73, vec2(43.0, 61.0));
  vec4 scrub = terrainLayerSample(repeatedUv, 1.21, vec2(89.0, 31.0));
  vec4 wideSand = terrainLayerSample(repeatedUv, 0.47, vec2(7.0, 101.0));
  ${liteAntiTile ? "" : `
  vec4 wideDirt = terrainLayerSample(repeatedUv, 0.36, vec2(109.0, 5.0));`}
  float antiTileMix = clamp(terrainAntiTile, 0.0, 1.0);
  ${liteAntiTile ? `
  float antiTileNoise = smoothstep(0.18, 0.86, terrainValueNoise(vTerrainWorld * 0.105 + terrainSeed * 67.0));
  packedSand = mix(packedSand, wideSand, antiTileMix * antiTileNoise);
  dryDirt = mix(dryDirt, wideSand, antiTileMix * (1.0 - antiTileNoise) * 0.55);` : `
  packedSand = mix(packedSand, wideSand, antiTileMix * smoothstep(0.18, 0.86, terrainValueNoise(vTerrainWorld * 0.11 + terrainSeed * 67.0)));
  dryDirt = mix(dryDirt, wideDirt, antiTileMix * smoothstep(0.24, 0.82, terrainValueNoise(vTerrainWorld * 0.095 - terrainSeed * 43.0)));`}
  float dirtBlend = smoothstep(0.22, 0.78, terrainValueNoise(vTerrainWorld * 0.075 + terrainSeed * 17.0));
  float shoreDistance = terrainShoreDistance(vTerrainWorld);
  float shoreBand = 1.0 - smoothstep(1.1, 8.0, shoreDistance);
  float scrubBlend = shoreBand * smoothstep(0.42, 0.88, terrainValueNoise(vTerrainWorld * 0.22 + terrainSeed * 31.0));
  vec4 sampledDiffuseColor = mix(packedSand, dryDirt, dirtBlend * 0.48);
  sampledDiffuseColor = mix(sampledDiffuseColor, scrub, scrubBlend * 0.24);
  float rockBlend = smoothstep(0.10, 0.72, vTerrainSlope) * (0.55 + terrainValueNoise(vTerrainWorld * 0.18 + terrainSeed * 47.0) * 0.45);
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, mix(dryDirt.rgb, vec3(0.47, 0.44, 0.37), 0.46), rockBlend * terrainSlopeShade);
  float dampGully = terrainGullyMask(vTerrainWorld) * (1.0 - smoothstep(4.0, 22.0, shoreDistance));
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, terrainDampTint, dampGully * terrainDampAmount);
  float dampWeight = max(
    (1.0 - smoothstep(max(0.35, terrainDampBand * 0.38), max(0.7, terrainDampBand), shoreDistance)) * terrainDampAmount,
    dampGully * terrainDampAmount
  );
  float reliefNoise = smoothstep(0.32, 0.92, terrainValueNoise(vTerrainWorld * 0.16 + terrainSeed * 53.0));
  float rockWeight = clamp((rockBlend + dampGully * 0.55 + reliefNoise * 0.16) * terrainRockAmount, 0.0, 0.88);
  float scrubWeight = clamp((scrubBlend + shoreBand * 0.18) * terrainScrubAmount, 0.0, 0.72);
  float dirtWeight = clamp(0.22 + dirtBlend * 0.34 + rockWeight * 0.18, 0.0, 0.72);
  float sandWeight = max(0.18, 1.0 - dampWeight * 0.58 - rockWeight * 0.48 - scrubWeight * 0.28 - dirtWeight * 0.18);
  float fineGrain = terrainValueNoise(vTerrainWorld * 0.82 + terrainSeed * 131.0) * 2.0 - 1.0;
  float pebbleGrain = terrainValueNoise(vTerrainWorld * 1.75 - terrainSeed * 91.0) * 2.0 - 1.0;
  vec3 sandLayer = mix(packedSand.rgb, vec3(0.68, 0.49, 0.255), 0.42) * (1.0 + fineGrain * 0.045 + pebbleGrain * 0.022);
  vec3 dirtLayer = mix(dryDirt.rgb, vec3(0.55, 0.37, 0.185), 0.42) * (1.0 + fineGrain * 0.052 - pebbleGrain * 0.018);
  vec3 dampLayer = mix(dirtLayer, terrainDampTint, 0.72);
  vec3 rockLayer = mix(dirtLayer, vec3(0.46, 0.415, 0.34), 0.66);
  vec3 scrubLayer = mix(scrub.rgb, vec3(0.255, 0.305, 0.17), 0.32) * (1.0 + pebbleGrain * 0.026);
  vec3 atlasGrain = mix(packedSand.rgb, dryDirt.rgb, 0.48);
  atlasGrain = mix(atlasGrain, scrub.rgb, scrubWeight * 0.28);
  float atlasLuma = dot(atlasGrain, vec3(0.299, 0.587, 0.114));
  float atlasDetail = mix(1.0, clamp(atlasLuma * 1.25, 0.86, 1.14), 0.16 * clamp(terrainAntiTile, 0.0, 1.0));
  float weightTotal = max(0.001, sandWeight + dirtWeight + dampWeight + rockWeight + scrubWeight);
  vec3 splatColor = (
    sandLayer * sandWeight +
    dirtLayer * dirtWeight +
    dampLayer * dampWeight +
    rockLayer * rockWeight +
		scrubLayer * scrubWeight
	  ) / weightTotal * atlasDetail;
	  vec3 splatMood = clamp(vec3(
	    1.0 + (terrainMacroWarmth - 0.75) * 0.16 - terrainScrubAmount * 0.04,
	    1.0 - (terrainMacroWarmth - 0.75) * 0.06 + terrainScrubAmount * 0.10,
	    1.0 - (terrainMacroWarmth - 0.75) * 0.18 + (terrainDampBand - 3.0) * 0.012
	  ), vec3(0.82), vec3(1.2));
	  splatColor *= splatMood;
	  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, splatColor, terrainSplat);
  sampledDiffuseColor.rgb = mix(vec3(1.0), sampledDiffuseColor.rgb, clamp(terrainFeatureMix, 0.0, 1.0));
  float macro = terrainValueNoise(vTerrainUv * 2.15 + terrainSeed * 11.0) * 2.0 - 1.0;
  float activeMacroWarmth = mix(1.0, terrainMacroWarmth, terrainSplat);
  vec3 macroTint = vec3(
    1.0 + macro * (0.052 + terrainSplat * 0.018 * activeMacroWarmth) + max(macro, 0.0) * 0.008 * max(1.0, activeMacroWarmth),
    1.0 + macro * (0.038 + terrainSplat * 0.010 * activeMacroWarmth),
    1.0 + macro * (0.026 - terrainSplat * 0.006 * activeMacroWarmth) - max(macro, 0.0) * 0.010 * max(1.0, activeMacroWarmth)
  );
	  sampledDiffuseColor.rgb *= terrainPaletteTint * macroTint * mix(vec3(1.0), vec3(0.92, 1.0, 0.86), scrubBlend * 0.18);
	  diffuseColor *= sampledDiffuseColor;
	#endif`);
		shader.fragmentShader = shader.fragmentShader.replace("#include <normal_fragment_begin>", `#include <normal_fragment_begin>
  vec3 terrainUpNormal = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
  normal = normalize(mix(normal, terrainUpNormal, terrainSplat * 0.24));
  nonPerturbedNormal = normal;`);
	};
	void loadBankVariantAtlas().then((atlas) => {
		if (!atlas) return;
		// Do NOT resize the live map's backing canvas: three.js allocates immutable
		// texture storage at first upload, so a grown canvas dies in texSubImage2D
		// (GL_INVALID_VALUE, s12 probe) and the GPU silently keeps the old content.
		// Swap in a fresh CanvasTexture sized to the atlas instead.
		const atlasTexture = new THREE.CanvasTexture(atlas.canvas);
		configureBankAtlas(atlasTexture);
		const previous = material.map;
		material.map = atlasTexture;
		material.needsUpdate = true;
		if (previous && previous !== atlasTexture) previous.dispose();
		uniforms.variantCount.value = atlas.variantCount;
		uniforms.atlasRows.value = atlas.rows;
	});
	return material;
}
function createBankGeometry() {
	const geometry = new THREE.PlaneGeometry(CLAIM_WIDTH, CLAIM_HEIGHT, terrainSegments(), terrainSegments());
	const positions = geometry.getAttribute("position");
	for (let index = 0; index < positions.count; index += 1) {
		const x = positions.getX(index);
		const z = -positions.getY(index);
		positions.setZ(index, sampleHeight(x, z));
	}
	positions.needsUpdate = true;
	applyTerrainNormals(geometry, sampleUnclampedHeight);
	return geometry;
}
function createVistaBankMesh(material) {
	const mesh = new THREE.Mesh(createVistaRingGeometry(), material);
	mesh.name = "TerrainVistaRing";
	mesh.userData.terrainVista = true;
	mesh.rotation.x = -Math.PI / 2;
	mesh.receiveShadow = true;
	mesh.renderOrder = RenderLayers.terrainBackdrop;
	return mesh;
}
function createVistaRingGeometry() {
	const { fullAxis, innerAxis, leftAxis, rightAxis } = vistaAxes();
	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const uvs = [];
	const indices = [];
	addVistaGrid(positions, uvs, indices, fullAxis, rightAxis, sampleUnclampedHeight);
	addVistaGrid(positions, uvs, indices, fullAxis, leftAxis, sampleUnclampedHeight);
	addVistaGrid(positions, uvs, indices, rightAxis, innerAxis, sampleUnclampedHeight);
	addVistaGrid(positions, uvs, indices, leftAxis, innerAxis, sampleUnclampedHeight);
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	applyTerrainNormals(geometry, sampleUnclampedHeight);
	return geometry;
}
function createExtendedRiverGeometry() {
	const halfWidth = visualWaterWidth() / 2;
	const axis = vistaAxes().fullAxis;
	const acrossSegments = 4;
	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const uvs = [];
	const indices = [];
	for (let row = 0; row <= acrossSegments; row += 1) {
		const t = row / acrossSegments;
		const across = THREE.MathUtils.lerp(-halfWidth, halfWidth, t);
		for (const x of axis) {
			const z = vistaRiverCenterZ(x) + across;
			positions.push(x, -z, 0);
			uvs.push((x + CLAIM_HALF_X) / CLAIM_WIDTH, t);
		}
	}
	const width = axis.length;
	for (let row = 0; row < acrossSegments; row += 1) {
		for (let xi = 0; xi < width - 1; xi += 1) {
			const a = row * width + xi;
			const b = a + 1;
			const c = a + width;
			const d = c + 1;
			indices.push(a, c, b, b, c, d);
		}
	}
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}
function addVistaGrid(positions, uvs, indices, xAxis, zAxis, heightAt) {
	const base = positions.length / 3;
	for (const z of zAxis) {
		for (const x of xAxis) {
			positions.push(x, -z, heightAt(x, z));
			uvs.push((x + CLAIM_HALF_X) / CLAIM_WIDTH, (-z + CLAIM_HALF_Z) / CLAIM_HEIGHT);
		}
	}
	const width = xAxis.length;
	for (let zi = 0; zi < zAxis.length - 1; zi += 1) {
		for (let xi = 0; xi < xAxis.length - 1; xi += 1) {
			const a = base + zi * width + xi;
			const b = a + 1;
			const c = a + width;
			const d = c + 1;
			indices.push(a, c, b, b, c, d);
		}
	}
}
function terrainSegments() {
	const mobile = typeof window !== "undefined" && window.innerWidth <= 430;
	const value = mobile ? Balance.world.terrainMobileSegments : Balance.world.terrainSegments;
	return Math.max(24, Math.min(96, Math.floor(value)));
}
function terrainMeshEnabled() {
	const mode = ACTIVE_TILE.render?.terrainMesh;
	if (mode === "required") return true;
	if (mode === "off") return false;
	if (typeof window !== "undefined") {
		const value = new URLSearchParams(window.location.search).get("terrainMesh");
		if (value !== null) return value !== "0" && value !== "false";
	}
	if (import.meta.env.VITE_GR_TERRAIN_MESH === "1" || import.meta.env.VITE_GR_TERRAIN_MESH === "true") return true;
	return Balance.world.terrainMesh;
}
function terrainSplatEnabled() {
	if (ACTIVE_TILE.render?.terrainMesh === "off") return false;
	if (typeof window !== "undefined") {
		const value = new URLSearchParams(window.location.search).get("terrainSplat");
		if (value !== null) return value !== "0" && value !== "false";
	}
	if (import.meta.env.VITE_GR_TERRAIN_SPLAT === "1" || import.meta.env.VITE_GR_TERRAIN_SPLAT === "true") return true;
	return Balance.world.terrainSplat;
}
function terrainSlopeShade() {
	return ACTIVE_TILE.render?.terrainMesh === "required" ? .62 : .42;
}
function terrainMeshSegments() {
	const step = Math.max(.5, Math.min(4, Balance.world.terrainMeshVertexStep));
	return Math.max(8, Math.min(128, Math.round(CLAIM_SIZE / step)));
}
function groundDiagnostics(mesh) {
	const stats = mesh.userData.groundStats;
	if (stats) return stats;
	const vertices = mesh.geometry.getAttribute("position")?.count ?? 0;
	const segments = Math.max(1, Math.round(Math.sqrt(vertices)) - 1);
	const triangles = mesh.geometry.index ? mesh.geometry.index.count / 3 : Math.floor(vertices / 3);
	return {
		enabled: false,
		mode: "fallback",
		drawCalls: 1,
		segments,
		vertexStep: CLAIM_SIZE / segments,
		vertices,
		triangles,
		heightSource: "visual",
		textureSource: "bank-atlas",
		textureSeams: "texture seams remain until TR-02"
	};
}
function vistaSegments() {
	const mobile = typeof window !== "undefined" && window.innerWidth <= 430;
	const value = mobile ? Balance.world.vistaMobileSegments : Balance.world.vistaSegments;
	return Math.max(4, Math.min(24, Math.floor(value)));
}
function vistaAxes() {
	const edgeSegments = terrainSegments();
	const outerSegments = vistaSegments();
	const innerAxis = makeAxis(-CLAIM_HALF, CLAIM_HALF, edgeSegments);
	const leftAxis = makeVistaOuterAxis(-CLAIM_HALF, -VISTA_RADIUS, outerSegments).reverse();
	const rightAxis = makeVistaOuterAxis(CLAIM_HALF, VISTA_RADIUS, outerSegments);
	return {
		fullAxis: [
			...leftAxis.slice(0, -1),
			...innerAxis,
			...rightAxis.slice(1)
		],
		innerAxis,
		leftAxis,
		rightAxis
	};
}
function makeAxis(start, end, segments) {
	const count = Math.max(1, Math.floor(segments));
	const values = [];
	for (let index = 0; index <= count; index += 1) values.push(THREE.MathUtils.lerp(start, end, index / count));
	return values;
}
function makeVistaOuterAxis(edge, outer, segments) {
	const nearSegments = Math.max(2, Math.min(8, Math.floor(segments * .75)));
	const farSegments = Math.max(1, Math.floor(segments) - nearSegments);
	const direction = Math.sign(outer - edge) || 1;
	const transitionEnd = edge + direction * Math.min(8, Math.abs(outer - edge));
	return [...makeAxis(edge, transitionEnd, nearSegments), ...makeAxis(transitionEnd, outer, farSegments).slice(1)];
}
function applyTerrainNormals(geometry, heightAt) {
	const positions = geometry.getAttribute("position");
	const normals = [];
	for (let index = 0; index < positions.count; index += 1) {
		const x = positions.getX(index);
		const z = -positions.getY(index);
		const normal = terrainNormal(x, z, heightAt);
		normals.push(normal.x, normal.y, normal.z);
	}
	geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
}
function terrainNormal(x, z, heightAt) {
	const step = .5;
	const dx = (heightAt(x + step, z) - heightAt(x - step, z)) / (step * 2);
	const dz = (heightAt(x, z + step) - heightAt(x, z - step)) / (step * 2);
	return new THREE.Vector3(-dx, dz, 1).normalize();
}
function terrainFeatures(x, z) {
	const absZ = Math.abs(z);
	const bankDistance = Math.max(0, absZ - RIVER_MAX_Z);
	const routeMask = smoothstep(Balance.world.terrainRoutingLaneCalmRadius, Balance.world.terrainRoutingLaneCalmRadius + 5, routingLaneDistance(x, z));
	const fordMask = smoothstep(4, 9, Math.hypot(x, z));
	const calmMask = claimFeatureCalmMask(x, z) * stableProbeMask(x, z) * routeMask * fordMask;
	const bankMask = smoothstep(2, 8, bankDistance) * (1 - smoothstep(18, 30, bankDistance)) * calmMask;
	const gully = channelMask(x, z) * bankMask * (.72 + valueNoise(x * .09 + 18.5, z * .09 - 4.5) * .42);
	const shelf = Math.max(ovalMask(x, z, 23, -20, 8, 6), ovalMask(x, z, -23, -19, 9, 6), ovalMask(x, z, -8, -28, 12, 4) * .72) * calmMask * (.82 + valueNoise(x * .12 - 8.4, z * .12 + 19.1) * .34);
	const edge = Math.max(Math.abs(x), Math.abs(z));
	const bluff = smoothstep(CLAIM_HALF - 8, CLAIM_HALF, edge) * calmMask * (.76 + valueNoise(x * .05 + 2.2, z * .05 - 9.7) * .38);
	const pocket = Math.max(ovalMask(x, z, -22, 20, 7, 5), ovalMask(x, z, 24, 21, 5, 6), ovalMask(x, z, -26, -23, 6, 5), ovalMask(x, z, 26, -27, 5, 4)) * calmMask * (.82 + valueNoise(x * .16 + 7.1, z * .16 + 2.4) * .28);
	const scale = Balance.world.terrainFeatureRelief * mobileTerrainFeatureScale();
	const heightOffset = (shelf * .42 + bluff * .48 - gully * .3 - pocket * .22) * scale;
	return {
		gully,
		shelf,
		bluff,
		pocket,
		routeMask,
		calmMask,
		heightOffset
	};
}
function contractHeightfieldOffset(x, z) {
	const heightfield = currentContract().tileParams.heightfield;
	if (!heightfield || heightfield.mode !== "visual") return 0;
	let offset = 0;
	const basin = heightfield.springBasin;
	if (basin) offset -= ovalMask(x, z, basin.x, basin.z, basin.radius, basin.radius * .78) * basin.depth;
	for (const wash of heightfield.washChannels ?? []) {
		offset -= washChannelMask(x, z, wash.x, wash.z, wash.length, wash.width, wash.angle) * wash.depth;
	}
	const bankRelief = heightfield.bankRelief;
	if (bankRelief) {
		const bankDistance = Math.max(0, Math.abs(z) - RIVER_MAX_Z);
		const nearBank = smoothstep(.25, 2.4, bankDistance) * (1 - smoothstep(3.2, bankRelief.width, bankDistance));
		const ripple = .74 + valueNoise(x * .13 + 2.6, z * .13 - 11.4) * .36;
		offset += nearBank * bankRelief.amount * ripple;
	}
	return offset;
}
function washChannelMask(x, z, cx, cz, length, width, angle) {
	const dx = x - cx;
	const dz = z - cz;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const along = dx * cos + dz * sin;
	const across = -dx * sin + dz * cos;
	const lengthMask = 1 - smoothstep(length * .42, length * .5, Math.abs(along));
	const widthMask = 1 - smoothstep(width * .32, width * .5, Math.abs(across + Math.sin(along * .18) * width * .18));
	const grain = .84 + valueNoise(x * .16 + 31.2, z * .16 - 8.1) * .24;
	return THREE.MathUtils.clamp(lengthMask * widthMask * grain, 0, 1);
}
function channelMask(x, z) {
	const bankDistance = Math.max(0, Math.abs(z) - RIVER_MAX_Z);
	const warpedX = x + Math.sin(z * .19) * 3 + Math.sin(z * .061) * 6;
	const cell = Math.floor((warpedX + 6.5) / 13);
	const center = cell * 13 - 6.5 + Math.sin(bankDistance * .8 + cell) * 2;
	const main = 1 - smoothstep(.6, 2.3, Math.abs(warpedX - center));
	const branchCenter = center + Math.sign(z || 1) * (3.2 + Math.sin(bankDistance * .6 + cell * 1.9) * 2.2);
	const branch = (1 - smoothstep(.45, 1.7, Math.abs(warpedX - branchCenter))) * smoothstep(7, 14, bankDistance);
	return Math.max(main, branch * .7);
}
function ovalMask(x, z, cx, cz, rx, rz) {
	const nx = (x - cx) / rx;
	const nz = (z - cz) / rz;
	return 1 - smoothstep(.54, 1, nx * nx + nz * nz);
}
function claimFeatureCalmMask(x, z) {
	if (z <= RIVER_MAX_Z + SHALLOWS_WIDTH || z >= 23 || Math.abs(x) >= 24) return 1;
	return smoothstep(7, 22, Math.abs(x));
}
function stableProbeMask(x, z) {
	const probes = [
		[0, 12],
		[-12, 0],
		[0, 0],
		[12, RIVER_MAX_Z + SHALLOWS_WIDTH],
		[12, -18]
	];
	let mask = 1;
	for (const [px, pz] of probes) mask *= smoothstep(1.8, 4.2, Math.hypot(x - px, z - pz));
	return mask;
}
function mobileTerrainFeatureScale() {
	if (typeof window === "undefined") return 1;
	return window.innerWidth <= 430 ? Balance.world.terrainFeatureMobileScale : 1;
}
function vistaVertexCount() {
	const { fullAxis, innerAxis, leftAxis, rightAxis } = vistaAxes();
	const outer = vistaSegments() + 1;
	return fullAxis.length * outer * 2 + rightAxis.length * innerAxis.length + leftAxis.length * innerAxis.length;
}
function vistaRiverDiagnostics() {
	const axis = vistaAxes().fullAxis;
	const centers = axis.map((x) => vistaRiverCenterZ(x));
	const meanderAmplitude = centers.reduce((max, center) => Math.max(max, Math.abs(center - (RIVER_MIN_Z + RIVER_MAX_Z) / 2)), 0);
	return {
		present: ACTIVE_CONTRACT.tileParams.river,
		drawCalls: ACTIVE_CONTRACT.tileParams.river ? 1 : 0,
		radius: VISTA_RADIUS,
		vertices: riverVistaVertexCount(),
		visualHalfWidth: round3(visualWaterWidth() / 2),
		fadeStart: riverFadeStart(),
		westEdgeCenterZ: round3(vistaRiverCenterZ(bounds.minX)),
		eastEdgeCenterZ: round3(vistaRiverCenterZ(bounds.maxX)),
		westFarCenterZ: round3(vistaRiverCenterZ(-VISTA_RADIUS)),
		eastFarCenterZ: round3(vistaRiverCenterZ(VISTA_RADIUS)),
		meanderAmplitude: round3(meanderAmplitude)
	};
}
function riverVistaVertexCount() {
	return vistaAxes().fullAxis.length * 5;
}
function vistaRiverCenterZ(x) {
	const side = x < 0 ? -1 : 1;
	const outside = Math.max(0, Math.abs(x) - CLAIM_HALF);
	const dx = x - side * CLAIM_HALF;
	const ramp = smoothstep(0, 18, outside);
	return (RIVER_MIN_Z + RIVER_MAX_Z) / 2 + ramp * (Math.sin(dx * .065) * 2.6 + Math.sin(dx * .137) * .8);
}
function riverFadeStart() {
	return VISTA_RADIUS - 12;
}
function vistaSeamProbePoints() {
	return [
		{
			x: -CLAIM_HALF,
			z: -24
		},
		{
			x: CLAIM_HALF,
			z: -12
		},
		{
			x: -18,
			z: -CLAIM_HALF
		},
		{
			x: 0,
			z: CLAIM_HALF
		},
		{
			x: 18,
			z: CLAIM_HALF
		},
		{
			x: CLAIM_HALF,
			z: 4
		}
	];
}
function waterMaterialConfig(ford, range = defaultFordRange()) {
	const riverHalfWidth = (RIVER_MAX_Z - RIVER_MIN_Z) / 2;
	return {
		ford,
		riverHalfWidth,
		visualHalfWidth: visualWaterWidth() / 2,
		lengthHalf: VISTA_RADIUS,
		fadeStart: riverFadeStart(),
		fordHalfWidth: range.halfWidth,
		riverDepth: waterDepth("river"),
		fordDepth: waterDepth("ford"),
		wadeDepth: Balance.terrainSim.wadeDepth,
		deepDepth: Balance.terrainSim.deepDepth,
		anchors: nodeAnchors.map((anchor) => ({
			x: anchor.x,
			z: anchor.z < 0 ? RIVER_MIN_Z + .55 : RIVER_MAX_Z - .55
		}))
	};
}
function visualWaterWidth() {
	return (TILE_WATER?.visualHalfWidth ?? (RIVER_MAX_Z - RIVER_MIN_Z) / 2 + SHALLOWS_WIDTH) * 2;
}
function syncBankMaterial(mesh) {
	const uniforms = mesh.material.userData.terrainUniforms;
	if (!uniforms) return;
	const params = terrainSplatParams();
	const tilePalette = currentContract().tileParams.palette;
	uniforms.featureMix.value = Balance.terrain.featureMix;
	uniforms.rockAmount.value = params.rockAmount;
	uniforms.dampBand.value = params.dampBand;
	uniforms.scrubAmount.value = params.scrubAmount;
	uniforms.macroWarmth.value = params.macroWarmth;
	uniforms.antiTile.value = terrainAntiTileDisabled() ? 0 : params.antiTile;
	uniforms.paletteTint.value.copy(paletteVector(tilePalette?.tint, [
		1,
		1,
		1
	]));
	uniforms.dampTint.value.copy(paletteVector(tilePalette?.dampTint, [
		.4,
		.37,
		.29
	]));
	uniforms.dampAmount.value = tilePalette?.dampAmount ?? .28;
}
function terrainAntiTileDisabled() {
	return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("terrainSeamless") === "0";
}
function terrainSplatParams() {
	const tileParams = currentContract().tileParams;
	const declared = tileParams.palette?.splat ?? {};
	const riverDampBand = (TILE_WATER?.visualHalfWidth ?? (RIVER_MAX_Z - RIVER_MIN_Z) / 2 + SHALLOWS_WIDTH) + .9;
	const defaultRock = tileParams.heightfield?.washChannels ? .62 : tileParams.heightfield?.bankRelief ? .28 : .22;
	const defaultScrub = tileParams.scatter?.nearWaterBias ? .42 : tileParams.river ? .2 : .14;
	return {
		rockAmount: clamp01(declared.rockAmount ?? defaultRock),
		dampBand: Math.max(.5, declared.dampBand ?? (tileParams.river ? riverDampBand : tileParams.waterSources.length ? 2.8 : 1.4)),
		scrubAmount: clamp01(declared.scrubAmount ?? defaultScrub),
		macroWarmth: Math.max(0, Math.min(1.5, declared.macroWarmth ?? 1)),
		antiTile: clamp01(declared.antiTile ?? .58)
	};
}
function paletteVector(value, fallback) {
	const [r, g, b] = value ?? fallback;
	return new THREE.Vector3(r, g, b);
}
async function loadBankVariantAtlas() {
	const textures = [];
	for (const file of BANK_VARIANT_FILES) {
		const texture = await loadBankVariantTexture(file);
		if (texture) textures.push(texture);
	}
	if (textures.length === 0) return null;
	return createBankAtlas(textures);
}
function loadBankVariantTexture(file) {
	if (file === "terrain-bank-tile.png") return loadGeneratedTexture(assetSlots.terrainBank);
	const urlLoader = processedTextureUrlsByFile.get(file);
	if (!urlLoader) return Promise.resolve(null);
	return urlLoader().then((url) => new Promise((resolve) => {
		textureLoader.load(url, (texture) => {
			texture.colorSpace = THREE.SRGBColorSpace;
			texture.anisotropy = 4;
			resolve(texture);
		}, undefined, () => resolve(null));
	}), () => null);
}
function createBankAtlas(textures) {
	const firstImage = textures[0]?.image;
	const tileSize = Math.max(1, imageWidth(firstImage), imageHeight(firstImage));
	const rows = nextPowerOfTwo(textures.length);
	const canvas = document.createElement("canvas");
	canvas.width = tileSize;
	canvas.height = tileSize * rows;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not create bank atlas context.");
	for (let row = 0; row < rows; row += 1) {
		const image = textures[Math.min(row, textures.length - 1)]?.image ?? firstImage;
		if (image) context.drawImage(image, 0, row * tileSize, tileSize, tileSize);
	}
	return {
		canvas,
		variantCount: textures.length,
		rows
	};
}
function configureBankAtlas(texture) {
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 4;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
}
function terrainBankVariantFiles() {
	try {
		const contract = JSON.parse(terrainContractText);
		const slot = contract.slots?.find((entry) => entry.slot === assetSlots.terrainBank);
		const files = slot?.variants ?? (slot?.file ? [slot.file] : []);
		return [...new Set(files.filter((file) => typeof file === "string" && file.length > 0))];
	} catch {
		return ["terrain-bank-tile.png"];
	}
}
let terrainSeedCache;
function terrainSeed() {
	if (typeof window === "undefined") return 0;
	const search = window.location.search;
	if (terrainSeedCache?.[0] !== search) terrainSeedCache = [search, normalizeSeed(new URLSearchParams(search).get("seed")) / 4294967296];
	return terrainSeedCache[1];
}
function valueNoise(x, z) {
	const ix = Math.floor(x);
	const iz = Math.floor(z);
	const fx = smooth01(x - ix);
	const fz = smooth01(z - iz);
	const a = terrainHash(ix, iz);
	const b = terrainHash(ix + 1, iz);
	const c = terrainHash(ix, iz + 1);
	const d = terrainHash(ix + 1, iz + 1);
	return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, fx), THREE.MathUtils.lerp(c, d, fx), fz);
}
function terrainHash(x, z) {
	const seed = terrainSeed() * 997.31;
	return fract(Math.sin(x * 127.1 + z * 311.7 + seed) * 43758.5453123);
}
function smoothstep(edge0, edge1, value) {
	if (edge0 === edge1) return value < edge0 ? 0 : 1;
	return smooth01(THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1));
}
function smooth01(value) {
	return value * value * (3 - 2 * value);
}
function clamp01(value) {
	return THREE.MathUtils.clamp(value, 0, 1);
}
function round3(value) {
	return Math.round(value * 1e3) / 1e3;
}
function fract(value) {
	return value - Math.floor(value);
}
function imageWidth(image) {
	if (!image) return 512;
	if ("videoWidth" in image) return image.videoWidth;
	if ("displayWidth" in image) return image.displayWidth;
	if ("width" in image) return typeof image.width === "number" ? image.width : image.width.baseVal.value;
	return 512;
}
function imageHeight(image) {
	if (!image) return 512;
	if ("videoHeight" in image) return image.videoHeight;
	if ("displayHeight" in image) return image.displayHeight;
	if ("height" in image) return typeof image.height === "number" ? image.height : image.height.baseVal.value;
	return 512;
}
function nextPowerOfTwo(value) {
	let power = 1;
	while (power < value) power *= 2;
	return power;
}
function createBankTexture() {
	const size = 512;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not create bank texture context.");
	context.fillStyle = palette.sand;
	context.fillRect(0, 0, size, size);
	context.fillStyle = "rgba(196, 136, 58, 0.12)";
	for (let i = 0; i < 900; i += 1) {
		const x = i * 71 % size;
		const y = i * 149 % size;
		context.fillRect(x, y, 1, 1);
	}
	context.strokeStyle = "rgba(46, 27, 14, 0.13)";
	context.lineWidth = 1;
	for (let y = -size; y < size * 2; y += 18) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(size, y + size * .35);
		context.stroke();
	}
	context.fillStyle = "rgba(91, 122, 83, 0.16)";
	for (let i = 0; i < 32; i += 1) {
		const x = i * 113 % size;
		const y = i * 197 % size;
		context.beginPath();
		context.ellipse(x, y, 5, 1.6, i % 6 * .45, 0, Math.PI * 2);
		context.fill();
	}
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsWUFBWSxXQUFXO0FBQ3ZCLE9BQU8seUJBQXlCO0FBQ2hDLFNBQVMsNEJBQTRCO0FBQ3JDLFNBQVMsZUFBZTtBQUN4QixTQUFTLFlBQVksc0JBQStDO0FBQ3BFLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGtDQUFrQztBQUMzQyxTQUNFLHNCQUNBLHVCQUNBLHNCQVNLO0FBQ1AsU0FBUyxrQkFBa0IsaUJBQWlCLGtCQUFrQixpQkFBaUI7QUFDL0UsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxrQ0FBa0U7QUFDM0UsU0FBUyxpQkFBaUIsMkJBQWlEO0FBQzNFLFNBQVMsd0JBQXdCO0FBQ2pDLFNBQ0Usa0JBQ0EsMkJBQ0EscUJBQ0EscUJBQ0Esd0JBRUs7QUEyQ1AsTUFBTSxrQkFBa0IsZUFBZTtBQUN2QyxNQUFNLG9CQUFvQixvQkFBb0IsZ0JBQWdCLEVBQUU7QUFDaEUsTUFBTSxjQUFjLHFCQUFxQjtBQUN6QyxNQUFNLGFBQWEsc0JBQXNCO0FBQ3pDLE9BQU8sTUFBTSxxQkFBcUI7QUFDbEMsT0FBTyxNQUFNLGFBQWEsZ0JBQWdCLFdBQVcsUUFBUTtBQUM3RCxPQUFPLE1BQU0sYUFBYSxhQUFhO0FBQ3ZDLE9BQU8sTUFBTSxjQUFjLGdCQUFnQixXQUFXLFlBQVksU0FBUztBQUMzRSxPQUFPLE1BQU0sZUFBZSxnQkFBZ0IsV0FBVyxZQUFZLFVBQVU7QUFDN0UsT0FBTyxNQUFNLGVBQWUsY0FBYztBQUMxQyxPQUFPLE1BQU0sZUFBZSxlQUFlO0FBQzNDLE9BQU8sTUFBTSxjQUFjLFlBQVksWUFBWSxhQUFhLFdBQVcsY0FBYyxZQUNyRixXQUFXLFVBQVUsV0FBVyxZQUNoQyxDQUFDO0FBQ0wsT0FBTyxNQUFNLGNBQWMsWUFBWSxZQUFZLGFBQWEsV0FBVyxjQUFjLFlBQ3JGLFdBQVcsVUFBVSxXQUFXLFlBQ2hDO0FBQ0osT0FBTyxNQUFNLGFBQWEsQ0FBQztBQUMzQixPQUFPLE1BQU0sYUFBYTtBQUMxQixPQUFPLE1BQU0saUJBQWlCO0FBQzlCLE9BQU8sTUFBTSxVQUFVO0FBQ3ZCLE9BQU8sTUFBTSxlQUFlO0FBRTVCLE1BQU0saUJBQWlCLGlCQUFpQjtBQUN4QyxNQUFNLG1CQUFtQixnQkFBZ0IsV0FBVztBQUNwRCxJQUFJLHNCQUFzQjtBQUMxQixJQUFJO0FBQ0osSUFBSSx3QkFBaUQ7QUFDckQsSUFBSSx1QkFBc0U7QUFDMUUsSUFBSSw0QkFBdUU7QUFDM0UsSUFBSSx5QkFBa0Q7QUFDdEQsSUFBSSwwQkFBNEMsQ0FBQztBQUNqRCxNQUFNLGNBQW9DLENBQUM7QUFDM0MsTUFBTSx1QkFBdUIsSUFBSSxNQUFNLE1BQU0sSUFBSSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQzFFLE1BQU0sYUFBYSxZQUFZLFdBQVcsUUFBUSxTQUFTLFlBQVksWUFBWTtBQUNuRixNQUFNLGVBQWUsZ0JBQWdCLFdBQVcsYUFBYSxRQUFRLFdBQVcsT0FBTyxTQUFTLGFBQWE7QUFDN0csTUFBTSxjQUFjLGtCQUFrQjtBQUN0QyxNQUFNLHNCQUF5RDtDQUM3RCxPQUFPO0NBQ1AsTUFBTTtDQUNOLFVBQVU7Q0FDVixZQUFZO0FBQ2Q7QUFDQSxNQUFNLHNCQUF5RDtDQUM3RCxPQUFPO0NBQ1AsTUFBTTtDQUNOLFVBQVU7Q0FDVixZQUFZO0FBQ2Q7QUFFQSxPQUFPLE1BQU0sU0FBd0I7Q0FDbkMsTUFBTSxDQUFDO0NBQ1AsTUFBTTtDQUNOLE1BQU0sQ0FBQztDQUNQLE1BQU07QUFDUjtBQUVBLFNBQVMsbUJBQThCO0NBQ3JDLE9BQU87RUFDTCxJQUFJO0VBQ0osTUFBTTtFQUNOLE1BQU07RUFDTixVQUFVLGFBQWEsY0FBYztFQUNyQyxZQUFZLGFBQWEsY0FBYztDQUN6QztBQUNGO0FBRUEsU0FBUyxvQkFBaUM7Q0FDeEMsSUFBSSxDQUFDLGdCQUFnQixXQUFXLE1BQU0sT0FBTyxDQUFDO0NBQzlDLE1BQU0sU0FBUyxnQkFBZ0IsV0FBVyxTQUFTLENBQUM7Q0FDcEQsSUFBSSxPQUFPLFdBQVcsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUM7Q0FDbkQsT0FBTyxPQUFPLEtBQUssV0FBVztFQUM1QixJQUFJLE1BQU07RUFDVixNQUFNLE1BQU0sSUFBSSxNQUFNO0VBQ3RCLE1BQU0sTUFBTSxJQUFJLE1BQU07RUFDdEIsU0FBUyxNQUFNO0VBQ2YsV0FBVyxNQUFNO0NBQ25CLEVBQUU7QUFDSjtBQUVBLFNBQVMsT0FBTyxHQUFXLEdBQTZCO0NBQ3RELElBQUksSUFBSSxlQUFlLElBQUksYUFBYSxPQUFPO0NBQy9DLE9BQU8sWUFBWSxNQUFNLFVBQVUsS0FBSyxNQUFNLFFBQVEsS0FBSyxNQUFNLElBQUksS0FBSztBQUM1RTtBQUVBLE1BQU0sdUJBQStCO0NBQ25DO0VBQUUsR0FBRyxDQUFDO0VBQUksR0FBRyxDQUFDO0NBQUk7Q0FDbEI7RUFBRSxHQUFHLENBQUM7RUFBRyxHQUFHO0NBQUk7Q0FDaEI7RUFBRSxHQUFHLENBQUM7RUFBSyxHQUFHLENBQUM7Q0FBSTtDQUNuQjtFQUFFLEdBQUc7RUFBSyxHQUFHO0NBQUk7Q0FDakI7RUFBRSxHQUFHO0VBQUksR0FBRyxDQUFDO0NBQUU7Q0FDZjtFQUFFLEdBQUc7RUFBSSxHQUFHO0NBQUk7QUFDbEI7QUFDQSxPQUFPLE1BQU0sY0FBc0IsZ0JBQWdCLFdBQVcsa0JBQWtCO0FBRWhGLE9BQU8sU0FBUyxPQUFPLEdBQVcsR0FBMEI7Q0FDMUQsSUFBSSxJQUFJLE9BQU8sUUFBUSxJQUFJLE9BQU8sUUFBUSxJQUFJLE9BQU8sUUFBUSxJQUFJLE9BQU8sTUFBTTtFQUM1RSxPQUFPO0dBQUUsVUFBVTtHQUFPLFVBQVU7R0FBRyxNQUFNO0VBQU07Q0FDckQ7Q0FDQSxJQUFJLGtCQUFrQixDQUFDLGlCQUFpQixHQUFHLENBQUMsR0FBRyxPQUFPO0VBQUUsVUFBVTtFQUFPLFVBQVU7RUFBRyxNQUFNO0NBQU07Q0FDbEcsTUFBTSxrQkFBa0Isa0JBQWtCLE1BQU0sWUFBWSxnQkFBZ0IsU0FBUyxHQUFHLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBSSxDQUFDO0NBQ3RILE1BQU0seUJBQXlCLFlBQTBDLGtCQUNyRTtFQUFFLEdBQUc7RUFBUyxVQUFVO0VBQU8sVUFBVTtDQUFFLElBQzNDO0NBRUosTUFBTSxTQUFTLGFBQWEsR0FBRyxDQUFDO0NBQ2hDLElBQUksUUFBUSxPQUFPLHNCQUFzQixZQUFZLFlBQVksY0FBYyxhQUFhLENBQUM7Q0FFN0YsSUFBSSxZQUFZO0VBQ2QsTUFBTSxTQUFTLFdBQVcsUUFBUSxNQUFNLGNBQWMsMEJBQTBCLEdBQUcsR0FBRyxTQUFTLEtBQUssQ0FBQztFQUNyRyxPQUFPLHNCQUFzQixTQUFTLFlBQVksT0FBTyxNQUFNLE9BQU8sTUFBTSxPQUFPLElBQUk7R0FBRSxVQUFVO0dBQU0sVUFBVTtHQUFHLE1BQU07RUFBTyxDQUFDO0NBQ3RJO0NBRUEsSUFBSSxDQUFDLGdCQUFnQixXQUFXLE9BQU8sT0FBTyxzQkFBc0I7RUFBRSxVQUFVO0VBQU0sVUFBVTtFQUFHLE1BQU07Q0FBTyxDQUFDO0NBRWpILE1BQU0sU0FBUyxPQUFPLEdBQUcsQ0FBQyxNQUFNO0NBQ2hDLElBQUksZ0JBQWdCLFdBQVcsUUFBUSxRQUFRLE9BQU8sc0JBQXNCLFlBQVksUUFBUSxRQUFRLE9BQU8sQ0FBQztDQUVoSCxNQUFNLFVBQVUsS0FBSyxlQUFlLEtBQUs7Q0FDekMsSUFBSSxTQUFTLE9BQU8sc0JBQXNCLFlBQVksU0FBUyxTQUFTLE9BQU8sQ0FBQztDQUVoRixNQUFNLGFBQ0gsSUFBSSxlQUFlLEtBQUssY0FBYyxrQkFDdEMsSUFBSSxlQUFlLEtBQUssY0FBYztDQUN6QyxJQUFJLFlBQVksT0FBTyxzQkFBc0IsWUFBWSxZQUFZLFlBQVksT0FBTyxDQUFDO0NBRXpGLE9BQU8sc0JBQXNCO0VBQUUsVUFBVTtFQUFNLFVBQVU7RUFBRyxNQUFNO0NBQU8sQ0FBQztBQUM1RTtBQUVBLE9BQU8sU0FBUyxtQkFBK0M7Q0FDN0QsT0FBTztBQUNUO0FBRUEsT0FBTyxTQUFTLFdBQVcsTUFBaUM7Q0FDMUQsT0FBTyxZQUFZLFNBQVMsU0FBUyxvQkFBb0I7QUFDM0Q7QUFFQSxTQUFTLGNBQWMsTUFBaUM7Q0FDdEQsT0FBTyxZQUFZLFdBQVcsU0FBUyxvQkFBb0I7QUFDN0Q7QUFFQSxTQUFTLFlBQVksTUFBNEMsV0FBOEIsYUFBcUQ7Q0FDbEosTUFBTSxRQUFRLFdBQVcsU0FBUztDQUNsQyxNQUFNLE9BQU8sU0FBUyxRQUFRLFdBQVc7Q0FDekMsTUFBTSxXQUFXLFNBQVMsUUFBUSxXQUFXLGFBQWMsUUFBUSxZQUFZLG9CQUFvQixRQUFRLFlBQVksT0FBTztDQUM5SCxPQUFPO0VBQ0w7RUFDQSxVQUFVLFdBQVcsY0FBYyxTQUFTLElBQUk7RUFDaEQ7RUFDQTtFQUNBLFlBQVk7RUFDWixZQUFZLE9BQU8sU0FBUztDQUM5QjtBQUNGO0FBRUEsT0FBTyxTQUFTLGFBQXFCO0NBQ25DLE9BQU87RUFDTDtHQUFFLEdBQUc7R0FBRyxHQUFHLE9BQU87RUFBSztFQUN2QjtHQUFFLEdBQUc7R0FBRyxHQUFHLE9BQU87RUFBSztFQUN2QjtHQUFFLEdBQUcsT0FBTztHQUFNLEdBQUc7RUFBRTtFQUN2QjtHQUFFLEdBQUcsT0FBTztHQUFNLEdBQUc7RUFBRTtDQUN6QjtBQUNGO0FBRUEsT0FBTyxTQUFTLFlBQVksR0FBVyxHQUFvQjtDQUN6RCxNQUFNLFVBQVUsT0FBTyxHQUFHLENBQUM7Q0FDM0IsSUFBSSxDQUFDLFFBQVEsWUFBWSxRQUFRLFNBQVMsUUFBUSxPQUFPO0NBQ3pELE1BQU0sUUFBUSxnQkFBZ0IsV0FBVyxjQUFjLENBQUM7Q0FDeEQsT0FBTyxNQUFNLFdBQVcsS0FBSyxNQUFNLE1BQU0sU0FBUyxLQUFLLEtBQUssUUFBUSxLQUFLLEtBQUssUUFBUSxLQUFLLEtBQUssUUFBUSxLQUFLLEtBQUssSUFBSTtBQUN4SDtBQUVBLE9BQU8sU0FBUyxnQkFBNEU7Q0FDMUYsT0FBTztFQUNMLE1BQU0sT0FBTztFQUNiLE1BQU0sT0FBTztFQUNiLE1BQU07RUFDTixNQUFNO0NBQ1I7QUFDRjtBQUVBLE9BQU8sU0FBUyxlQUErQztDQUM3RCxPQUFPO0FBQ1Q7Ozs7Ozs7QUFRQSxPQUFPLFNBQVMsdUJBQStCO0NBQzdDLE9BQU8saUJBQWlCLElBQUk7QUFDOUI7QUFFQSxPQUFPLFNBQVMsWUFBMkM7Q0FDekQsT0FBTztBQUNUO0FBRUEsT0FBTyxTQUFTLG9CQUFvQixHQUFXLEdBQW9CO0NBQ2pFLEtBQUssWUFBWSxjQUFjLENBQUMsRUFBQyxDQUFFLE1BQU0sUUFBUSxrQkFBa0IsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU87Q0FDdkYsSUFBSSxZQUFZO0VBQ2QsT0FBTyxXQUFXLFFBQVEsTUFBTSxXQUFXLE9BQU8sU0FBUyxVQUFVLDBCQUEwQixHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUM7Q0FDbkg7Q0FDQSxPQUFPLGdCQUFnQixXQUFXLFNBQVMsUUFBUSxPQUFPLEdBQUcsQ0FBQyxNQUFNO0FBQ3RFO0FBRUEsT0FBTyxTQUFTLGtCQUFrQixLQUF3QixHQUFXLEdBQW9CO0NBQ3ZGLE1BQU0sS0FBSyxJQUFJLElBQUk7Q0FDbkIsTUFBTSxLQUFLLElBQUksSUFBSTtDQUNuQixNQUFNLE1BQU0sS0FBSyxJQUFJLElBQUksUUFBUTtDQUNqQyxNQUFNLE1BQU0sS0FBSyxJQUFJLElBQUksUUFBUTtDQUNqQyxNQUFNLFNBQVMsS0FBSyxNQUFNLEtBQUs7Q0FDL0IsTUFBTSxTQUFTLENBQUMsS0FBSyxNQUFNLEtBQUs7Q0FDaEMsUUFBUSxVQUFVLElBQUksU0FBUyxRQUFTLEtBQUssVUFBVSxJQUFJLFFBQVEsUUFBUyxLQUFLO0FBQ25GO0FBRUEsT0FBTyxTQUFTLGFBQW1DO0NBQ2pELE9BQU87QUFDVDtBQUVBLE9BQU8sU0FBUyxpQkFBaUIsR0FBc0I7Q0FDckQsSUFBSSxPQUFPLFlBQVksTUFBTSxpQkFBaUI7Q0FDOUMsSUFBSSxlQUFlLEtBQUssSUFBSSxJQUFJLEtBQUssT0FBTztDQUM1QyxLQUFLLE1BQU0sU0FBUyxZQUFZLE1BQU0sQ0FBQyxHQUFHO0VBQ3hDLE1BQU0sV0FBVyxLQUFLLElBQUksSUFBSSxNQUFNLE9BQU87RUFDM0MsSUFBSSxXQUFXLGNBQWM7R0FDM0IsT0FBTztHQUNQLGVBQWU7RUFDakI7Q0FDRjtDQUNBLE9BQU87QUFDVDtBQUVBLE9BQU8sU0FBUyxlQUErQztDQUM3RCxPQUFPLGdCQUFnQixXQUFXLGdCQUFnQixDQUFDO0FBQ3JEO0FBRUEsT0FBTyxTQUFTLGtCQUE4QztDQUM1RCxPQUFPLGFBQWEsQ0FBQyxDQUFDLE1BQU0sV0FBVyxPQUFPLFNBQVMsS0FBSztBQUM5RDtBQUVBLE9BQU8sU0FBUyxnQkFBeUI7Q0FDdkMsT0FBTyxlQUFlLGFBQWEsZ0JBQWdCLFdBQVc7QUFDaEU7QUFFQSxPQUFPLFNBQVMsc0JBQXNCLEdBQVcsR0FBVyxLQUFzQjtDQUNoRixNQUFNLFVBQVUsT0FBTyxHQUFHLENBQUM7Q0FDM0IsSUFBSSxRQUFRLFNBQVMsVUFBVSxRQUFRLFNBQVMsWUFBWSxPQUFPO0NBQ25FLElBQUksY0FBYyxXQUFXLFFBQVEsTUFBTSxXQUFXLDBCQUEwQixHQUFHLEdBQUcsTUFBTSxLQUFLLEdBQUcsR0FBRyxPQUFPO0NBQzlHLElBQUksQ0FBQyxjQUFjLGdCQUFnQixXQUFXLE9BQU87RUFDbkQsTUFBTSxRQUFRLGNBQWM7RUFDNUIsSUFBSSxLQUFLLE1BQU0sUUFBUSxLQUFLLE1BQU0sTUFBTTtHQUN0QyxNQUFNLFdBQVcsSUFBSSxNQUFNLE9BQU8sTUFBTSxPQUFPLElBQUksSUFBSSxNQUFNLE9BQU8sSUFBSSxNQUFNLE9BQU87R0FDckYsSUFBSSxZQUFZLEtBQUssT0FBTztFQUM5QjtDQUNGO0NBQ0EsT0FBTyxhQUFhLE1BQU0sV0FBVyxxQkFBcUIsR0FBRyxHQUFHLE1BQU0sS0FBSyxHQUFHO0FBQ2hGO0FBRUEsU0FBUywwQkFBMEIsR0FBVyxHQUFXLFFBQXlDO0NBQ2hHLElBQUksT0FBTyxTQUFTLFFBQVE7RUFDMUIsT0FBTyxLQUFLLE1BQU0sS0FBSyxJQUFJLE9BQU8sT0FBTyxHQUFHLEdBQUcsSUFBSSxPQUFPLElBQUksR0FBRyxLQUFLLElBQUksT0FBTyxPQUFPLEdBQUcsR0FBRyxJQUFJLE9BQU8sSUFBSSxDQUFDO0NBQ2hIO0NBRUEsSUFBSSxXQUFXLE9BQU87Q0FDdEIsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLE9BQU8sT0FBTyxRQUFRLFNBQVMsR0FBRztFQUM1RCxNQUFNLFFBQVEsT0FBTyxPQUFPLFFBQVE7RUFDcEMsTUFBTSxNQUFNLE9BQU8sT0FBTztFQUMxQixNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU07RUFDekIsTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNO0VBQ3pCLE1BQU0sV0FBVyxLQUFLLEtBQUssS0FBSztFQUNoQyxNQUFNLElBQUksWUFBWSxRQUFRLFVBQVUsaUJBQ3BDLElBQ0EsTUFBTSxVQUFVLFFBQVEsSUFBSSxNQUFNLEtBQUssTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLFVBQVUsR0FBRyxDQUFDO0VBQ3BGLFdBQVcsS0FBSyxJQUFJLFVBQVUsS0FBSyxNQUFNLEtBQUssTUFBTSxJQUFJLEtBQUssSUFBSSxLQUFLLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztDQUMxRjtDQUNBLE9BQU8sV0FBVyxPQUFPO0FBQzNCO0FBRUEsT0FBTyxTQUFTLGFBQWEsR0FBVyxHQUFtQjtDQUN6RCxJQUFJLDJCQUEyQjtFQUM3QixPQUFPLDBCQUEwQixNQUFNLFVBQVUsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLElBQUksR0FBRyxNQUFNLFVBQVUsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLElBQUksQ0FBQztDQUN6STtDQUNBLE1BQU0sT0FBTyxpQkFDVCxVQUFVLEdBQUcsQ0FBQyxJQUNkLG1CQUFtQixNQUFNLFVBQVUsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLElBQUksR0FBRyxNQUFNLFVBQVUsTUFBTSxHQUFHLE9BQU8sTUFBTSxPQUFPLElBQUksR0FBRyxLQUFLO0NBQ3BJLE9BQU8sdUJBQXVCLElBQUksT0FBTyxxQkFBcUIsR0FBRyxDQUFDLElBQUk7QUFDeEU7QUFFQSxPQUFPLFNBQVMsc0JBQXNCLEdBQVcsR0FBbUI7Q0FDbEUsSUFBSSw2QkFBNkIsS0FBSyxPQUFPLFFBQVEsS0FBSyxPQUFPLFFBQVEsS0FBSyxPQUFPLFFBQVEsS0FBSyxPQUFPLE1BQU07RUFDN0csT0FBTywwQkFBMEIsR0FBRyxDQUFDO0NBQ3ZDO0NBQ0EsTUFBTSxPQUFPLGlCQUFpQixVQUFVLEdBQUcsQ0FBQyxJQUFJLG1CQUFtQixHQUFHLEdBQUcsSUFBSTtDQUM3RSxPQUFPLHVCQUF1QixJQUFJLE9BQU8scUJBQXFCLEdBQUcsQ0FBQyxJQUFJO0FBQ3hFO0FBRUEsT0FBTyxTQUFTLHNCQUFzQixVQUFrQztDQUN0RSxzQkFBc0I7Q0FDdEIsd0JBQXdCO0NBQ3hCLHVCQUF1QixTQUFTLFdBQVc7Q0FDM0MsdUJBQXVCLFFBQVE7QUFDakM7QUFFQSxPQUFPLFNBQVMsc0JBQXNCLFdBQTRCLEtBQTZCO0NBQzdGLFlBQVksU0FBUztDQUNyQixVQUFVLGlCQUFpQiwwQkFBMEIseUJBQXlCLE1BQU0sV0FBVztDQUMvRixNQUFNLE1BQU0sWUFBWTtDQUN4QixJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSztDQUMzQixZQUFZLFNBQVM7Q0FDckIsT0FBTyxRQUFRLGFBQWEsVUFBVSxJQUFJLGVBQWUsc0JBQXNCLEdBQUcsTUFBTTtBQUMxRjtBQUVBLE9BQU8sU0FBUywwQkFBMEIsUUFBMEMsVUFBd0M7Q0FDMUgsNEJBQTRCO0NBQzVCLHlCQUF5QjtDQUN6QixhQUFhO0VBQ1gsSUFBSSw4QkFBOEIsUUFBUTtHQUN4Qyw0QkFBNEI7R0FDNUIseUJBQXlCO0VBQzNCO0NBQ0Y7QUFDRjtBQUVBLFNBQVMscUJBQXFCLEdBQVcsR0FBbUI7Q0FDMUQsTUFBTSxRQUFRLHVCQUF1QjtDQUNyQyxJQUFJLENBQUMsT0FBTyxPQUFPO0NBQ25CLE1BQU0sU0FBUyxJQUFJLE1BQU0sV0FBVyxNQUFNO0NBQzFDLE1BQU0sU0FBUyxJQUFJLE1BQU0sV0FBVyxNQUFNO0NBQzFDLElBQUksUUFBUSxLQUFLLFFBQVEsS0FBSyxRQUFRLE1BQU0sVUFBVSxLQUFLLFFBQVEsTUFBTSxPQUFPLEdBQUcsT0FBTztDQUUxRixNQUFNLEtBQUssS0FBSyxNQUFNLEtBQUs7Q0FDM0IsTUFBTSxLQUFLLEtBQUssTUFBTSxLQUFLO0NBQzNCLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDO0NBQzdDLE1BQU0sS0FBSyxLQUFLLElBQUksS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDO0NBQzFDLE1BQU0sTUFBTSxRQUFnQixRQUFnQixNQUFNLGFBQWEsTUFBTSxNQUFNLFVBQVU7Q0FDckYsTUFBTSxRQUFRLE1BQU0sVUFBVSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxRQUFRLEVBQUU7Q0FDckUsTUFBTSxRQUFRLE1BQU0sVUFBVSxLQUFLLEdBQUcsSUFBSSxFQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxRQUFRLEVBQUU7Q0FDckUsT0FBTyxNQUFNLFVBQVUsS0FBSyxPQUFPLE9BQU8sUUFBUSxFQUFFO0FBQ3REO0FBRUEsU0FBUyx5QkFBbUU7Q0FDMUUsT0FBTyxzQkFBc0IsdUJBQXVCO0FBQ3REO0FBRUEsU0FBUyxrQkFBb0M7Q0FDM0MsT0FBTyx5QkFBeUI7QUFDbEM7QUFFQSxPQUFPLFNBQVMsb0JBQW9CLEdBQVcsR0FBbUI7Q0FDaEUsTUFBTSxlQUFlLEtBQUssSUFBSSxJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxPQUFPO0NBQzdELE1BQU0sWUFBWSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksRUFBRSxJQUFJLE9BQU87Q0FDL0QsT0FBTyxLQUFLLElBQUksY0FBYyxTQUFTO0FBQ3pDO0FBRUEsT0FBTyxTQUFTLHFCQUFxQixHQUFXLEdBQWlDO0NBQy9FLE9BQU8sZ0JBQWdCLEdBQUcsQ0FBQztBQUM3QjtBQUVBLFNBQVMsbUJBQW1CLEdBQVcsR0FBVyxXQUE0QjtDQUM1RSxNQUFNLE9BQU8sS0FBSyxJQUFJLENBQUM7Q0FDdkIsTUFBTSxlQUFlLEtBQUssSUFBSSxHQUFHLE9BQU8sV0FBVztDQUNuRCxNQUFNLFFBQVEsV0FBVyxHQUFHLElBQUksWUFBWTtDQUM1QyxNQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUssQ0FBQyxLQUFNLEtBQU0sS0FBSztDQUN0RCxNQUFNLFlBQVksSUFBSSxjQUFjLFdBQVcsR0FBRyxhQUFhLEtBQUssSUFBSSxXQUFXLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksV0FBVyxDQUFDLElBQUksTUFBTztDQUNwSSxNQUFNLGdCQUFnQixZQUFZLFdBQVcsWUFBWSxjQUFjLElBQUksSUFBSSxNQUFPO0NBQ3RGLE1BQU0sWUFDSixJQUFJLGNBQWMsa0JBQWtCLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQ3hELE1BQU0sVUFBVSxLQUFLLEtBQU0sR0FBRyxXQUFXLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFDNUQ7Q0FDTixNQUFNLGlCQUFpQixNQUFNLFVBQVUsS0FBSyxLQUFNLEdBQUcsV0FBVyxjQUFjLElBQUssY0FBYyxHQUFHLElBQUksQ0FBQztDQUN6RyxNQUFNLFNBQ0gsV0FBVyxJQUFJLE1BQU8sSUFBSSxJQUFLLElBQUksTUFBTyxPQUMxQyxXQUFXLElBQUksTUFBTyxNQUFNLElBQUksTUFBTyxJQUFJLElBQUksTUFBTyxPQUN0RCxXQUFXLElBQUksTUFBTyxLQUFLLElBQUksTUFBTyxJQUFJLElBQUksTUFBTztDQUN4RCxNQUFNLFdBQVcsZ0JBQWdCLEdBQUcsQ0FBQztDQUNyQyxNQUFNLGtCQUFrQixhQUFhLE9BQU8sYUFBYSxPQUFPO0NBQ2hFLE1BQU0sYUFBYSxNQUFNLFVBQVUsT0FDaEMsU0FBUyxZQUFZLGdCQUFnQixRQUFRLFlBQVksa0JBQWtCLFFBQVEsTUFBTSxlQUMxRixDQUFDLEtBQ0QsZUFDRjtDQUNBLE1BQU0sWUFBWSxhQUFhLE9BQU8sYUFBYSxPQUFPO0NBQzFELE1BQU0sWUFBWSxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsY0FBYyxDQUFDLE1BQU8sQ0FBQztDQUN0RSxPQUFPLE1BQU0sVUFBVSxNQUFNLGFBQWEsU0FBUyxlQUFlLDBCQUEwQixHQUFHLENBQUMsR0FBRyxXQUFXLFNBQVM7QUFDekg7QUFFQSxPQUFPLFNBQVMsbUJBQW1CLEdBQVcsR0FBVyxTQUFTLEdBQVc7Q0FDM0UsSUFBSSxVQUFVLEtBQU0sT0FBTyxhQUFhLEdBQUcsQ0FBQztDQUM1QyxNQUFNLElBQUksS0FBSyxJQUFJLEtBQU0sU0FBUyxHQUFJO0NBQ3RDLFFBQ0UsYUFBYSxHQUFHLENBQUMsSUFBSSxJQUNyQixhQUFhLElBQUksR0FBRyxDQUFDLElBQ3JCLGFBQWEsSUFBSSxHQUFHLENBQUMsSUFDckIsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUNyQixhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQ25CO0FBQ047QUFFQSxPQUFPLFNBQVMsUUFBUSxHQUFXLEdBQVcsT0FBTyxHQUFHLFlBQVksR0FBVztDQUM3RSxPQUFPLG1CQUFtQixHQUFHLEdBQUcsU0FBUyxJQUFJO0FBQy9DO0FBRUEsT0FBTyxTQUFTLGNBQWMsVUFBZ0IsTUFBc0I7Q0FDbEUsT0FBTyxRQUFRLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSTtBQUM3QztBQUVBLE9BQU8sU0FBUyxvQkFjZDtDQUNBLElBQUksTUFBTSxPQUFPO0NBQ2pCLElBQUksTUFBTSxPQUFPO0NBQ2pCLEtBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLLE9BQU8sTUFBTSxLQUFLLEdBQUc7RUFDbEQsS0FBSyxJQUFJLElBQUksT0FBTyxNQUFNLEtBQUssT0FBTyxNQUFNLEtBQUssR0FBRztHQUNsRCxNQUFNLFNBQVMsYUFBYSxHQUFHLENBQUM7R0FDaEMsTUFBTSxLQUFLLElBQUksS0FBSyxNQUFNO0dBQzFCLE1BQU0sS0FBSyxJQUFJLEtBQUssTUFBTTtFQUM1QjtDQUNGO0NBQ0EsTUFBTSxnQkFBZ0I7RUFDcEIsT0FBTyxhQUFhLElBQUksQ0FBQyxFQUFFO0VBQzNCLE9BQU8sYUFBYSxJQUFJLENBQUMsRUFBRTtFQUMzQixPQUFPLGFBQWEsSUFBSSxFQUFFO0VBQzFCLFFBQVEsYUFBYSxDQUFDLElBQUksRUFBRTtDQUM5QjtDQUNBLE1BQU0sV0FBVztFQUFDLENBQUM7RUFBRztFQUFHO0NBQUMsQ0FBQyxDQUFDLFNBQVMsTUFBTSxDQUFDLGFBQWEsR0FBRyxjQUFjLGNBQWMsR0FBRyxhQUFhLEdBQUcsY0FBYyxjQUFjLENBQUMsQ0FBQztDQUN6SSxNQUFNLG9CQUFvQixLQUFLLElBQUksR0FBRyxRQUFRLElBQUksS0FBSyxJQUFJLEdBQUcsUUFBUTtDQUN0RSxNQUFNLGNBQWM7RUFBQyxDQUFDO0VBQUksQ0FBQztFQUFJLENBQUM7RUFBRztFQUFHO0VBQUk7Q0FBRSxDQUFDLENBQUMsS0FBSyxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUM7Q0FDM0UsTUFBTSxtQkFBbUIsS0FBSyxJQUFJLEdBQUcsV0FBVyxJQUFJLEtBQUssSUFBSSxHQUFHLFdBQVc7Q0FDM0UsTUFBTSxvQkFBb0IsS0FBSyxJQUFJLEdBQUc7RUFBQyxDQUFDO0VBQUksQ0FBQztFQUFJLENBQUM7RUFBRztFQUFHO0VBQUk7Q0FBRSxDQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssSUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUM3SCxPQUFPO0VBQ0w7RUFDQTtFQUNBLFVBQVUsZ0JBQWdCO0VBQzFCLFFBQVE7RUFDUixRQUFRO0dBQ04sV0FBVyxhQUFhLEdBQUcsRUFBRTtHQUM3QixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUM7R0FDMUIsTUFBTSxhQUFhLEdBQUcsQ0FBQztHQUN2QixVQUFVLGFBQWEsSUFBSSxjQUFjLGNBQWM7R0FDdkQsU0FBUyxhQUFhLElBQUksQ0FBQyxFQUFFO0VBQy9CO0VBQ0EsU0FBUztHQUNQLE9BQU8sTUFBTTtHQUNiO0dBQ0E7R0FDQTtHQUNBLFFBQVE7R0FDUixVQUFVO0lBQ1IsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLEVBQUU7SUFDbkMsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLEVBQUU7SUFDbkMsT0FBTyxxQkFBcUIsSUFBSSxFQUFFO0lBQ2xDLFFBQVEscUJBQXFCLENBQUMsSUFBSSxFQUFFO0dBQ3RDO0VBQ0Y7Q0FDRjtBQUNGO0FBd0JBLE9BQU8sU0FBUyxtQkFBcUM7Q0FDbkQsTUFBTSxPQUFPLHFCQUFxQixDQUFDLENBQUMsS0FBSyxVQUFVO0VBQ2pELE1BQU0sVUFBVSxhQUFhLE1BQU0sR0FBRyxNQUFNLENBQUM7RUFDN0MsTUFBTSxZQUFZLHNCQUFzQixNQUFNLEdBQUcsTUFBTSxDQUFDO0VBQ3hELE1BQU0sUUFBUSxLQUFLLElBQUksVUFBVSxTQUFTO0VBQzFDLE9BQU87R0FBRSxHQUFHO0dBQU87R0FBUztHQUFXO0VBQU07Q0FDL0MsQ0FBQztDQUNELE9BQU87RUFDTCxTQUFTO0VBQ1QsVUFBVSxjQUFjO0VBQ3hCLFFBQVE7RUFDUixVQUFVLGlCQUFpQjtFQUMzQixjQUFjLEtBQUssSUFBSSxHQUFHLEtBQUssS0FBSyxVQUFVLE1BQU0sS0FBSyxDQUFDO0VBQzFEO0VBQ0EsT0FBTyxzQkFBc0I7Q0FDL0I7QUFDRjtBQTBEQSxNQUFNLG9CQUFvQjtBQUMxQixNQUFNLHFCQUFxQix3QkFBd0I7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJuRCxNQUFNLHVCQUF1QixZQUFZLEtBQ3ZDLENBQUMsNkNBQTZDLDZDQUE2QyxHQUMzRjtDQUNFLE9BQU87Q0FDUCxRQUFRO0FBQ1YsQ0FDRjtBQUNBLE1BQU0sNkJBQTZCLElBQUksSUFDckMsT0FBTyxRQUFRLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sZUFBZSxDQUFDLEtBQUssTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxTQUFTLENBQUMsQ0FDNUc7QUFDQSxNQUFNLGdCQUFnQixJQUFJLE1BQU0sY0FBYztBQUU5QyxNQUFNLGVBQWUsSUFBSSxNQUFNLHFCQUFxQjtDQUNsRCxPQUFPLFFBQVE7Q0FDZixXQUFXO0NBQ1gsV0FBVztBQUNiLENBQUM7QUFFRCxPQUFPLE1BQU0sd0JBQXdELE9BQU8sYUFDcEU7Q0FDSixNQUFNLE9BQU8sSUFBSSxNQUFNLEtBQUssbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7Q0FDdEUsS0FBSyxPQUFPO0NBQ1osS0FBSyxTQUFTLGdCQUFnQjtDQUM5QixLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssS0FBSztDQUM3QixLQUFLLGdCQUFnQjtDQUNyQixPQUFPLGVBQWUsTUFBTSxXQUFXLFdBQVc7QUFDcEQsR0FDQSxFQUFFLFFBQVEsV0FBVyxZQUFZLENBQ25DO0FBRUEsT0FBTyxNQUFNLHlCQUF5RCxPQUFPLGFBQ3JFO0NBQ0osTUFBTSxPQUFPLElBQUksTUFBTSxLQUFLLDRCQUE0QixHQUFHLDBCQUEwQixvQkFBb0IsS0FBSyxDQUFDLENBQUM7Q0FDaEgsS0FBSyxTQUFTLGtCQUFrQixpQkFBaUIsSUFBSTtDQUNyRCxLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssS0FBSztDQUM3QixLQUFLLFNBQVMsSUFBSTtDQUNsQixLQUFLLGNBQWMsYUFBYTtDQUNoQyxLQUFLLGdCQUFnQjtDQUNyQixPQUFPLGVBQWUsTUFBTSxXQUFXLFlBQVk7QUFDckQsR0FDQSxFQUFFLFFBQVEsV0FBVyxhQUFhLENBQ3BDO0FBRUEsT0FBTyxTQUFTLHNCQUFzQixRQUFtQixpQkFBaUIsR0FBZTtDQUN2RixNQUFNLE9BQU8sSUFBSSxNQUFNLEtBQ3JCLElBQUksTUFBTSxjQUFjLE1BQU0sT0FBTyxNQUFNLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEdBQ3pFLDBCQUEwQixvQkFBb0IsTUFBTSxLQUFLLENBQUMsQ0FDNUQ7Q0FDQSxLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssS0FBSztDQUM3QixLQUFLLFNBQVMsSUFBSSxNQUFNLFNBQVMsVUFBVSxNQUFPLENBQUM7Q0FDbkQsS0FBSyxjQUFjLGFBQWE7Q0FDaEMsS0FBSyxnQkFBZ0I7Q0FDckIsT0FBTyxlQUFlLE1BQU0sV0FBVyxXQUFXO0FBQ3BEO0FBRUEsT0FBTyxTQUFTLG9CQUFpQztDQUMvQyxNQUFNLFFBQVEsSUFBSSxNQUFNLE1BQU07Q0FDOUIsTUFBTSxPQUFPLGlCQUFpQjtDQUM5QixNQUFNLFlBQVksb0JBQW9CLEtBQUssUUFBc0M7Q0FDakYsTUFBTSxRQUFRLGlCQUFpQjtDQUMvQixNQUFNLGNBQWMsa0JBQWtCLFlBQVk7Q0FDbEQsSUFBSSxzQkFBc0IsYUFBYTtDQUN2QyxLQUFLLE1BQU0sUUFBUSxNQUFNLFVBQVUsS0FBSyxTQUFTLElBQUksUUFBUSxLQUFLLFNBQVMsR0FBRyxLQUFLLFNBQVMsR0FBRyxHQUFHLEVBQUc7Q0FDckcsTUFBTSxJQUFJLFdBQVcsSUFBSTtDQUV6QixJQUFJLFFBQTJCO0NBQy9CLE1BQU0sUUFBc0IsQ0FBQztDQUM3QixNQUFNLGFBQW9DLENBQUM7Q0FDM0MsTUFBTSxhQUEyQixDQUFDO0NBQ2xDLElBQUksZ0JBQWdCLFdBQVcsT0FBTztFQUNwQyxRQUFRLHVCQUF1QjtFQUMvQixLQUFLLE1BQU0sU0FBUyxhQUFhO0dBQy9CLE1BQU0sT0FBTyxzQkFBc0IsS0FBSztHQUN4QyxNQUFNLFNBQVMsaUJBQWlCLFNBQVMsTUFBTSxPQUFPO0dBQ3RELE1BQU0sS0FBSyxJQUFJO0dBQ2YsV0FBVyxLQUFLLE1BQU07RUFDeEI7RUFDQSxXQUFXLEtBQUssR0FBRyxpQkFBaUIsQ0FBQztFQUNyQyxNQUFNLElBQUksT0FBTyxHQUFHLE9BQU8sR0FBRyxZQUFZLEdBQUcsVUFBVTtDQUN6RDtDQUVBLE1BQU0sSUFBSSxhQUFhLEtBQUs7Q0FDNUIsTUFBTSxrQkFBa0I7RUFBQztFQUFNO0VBQWEsR0FBSSxRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDO0NBQUU7Q0FDL0UsMEJBQTBCO0NBQzFCLEtBQUssU0FBUyxpQkFBaUIsaUJBQWlCO0VBQzlDLElBQUksNEJBQTRCLGlCQUFpQiwwQkFBMEIsQ0FBQztDQUM5RSxDQUFDO0NBQ0Qsd0JBQXdCLGFBQWE7RUFDbkMsc0JBQXNCLElBQUk7RUFDMUIsZ0JBQWdCLFdBQVc7RUFDM0IsWUFBWSxNQUFNO0VBQ2xCLE1BQU0sWUFBWSxrQkFBa0IsU0FBUyxXQUFXLFlBQVk7RUFDcEUsS0FBSyxNQUFNLFFBQVEsQ0FBQyxHQUFHLFVBQVUsUUFBUSxHQUFHLFlBQVksSUFBSSxJQUFJO0VBQ2hFLHNCQUFzQixTQUFTLFdBQVcsYUFBYTtDQUN6RDtDQUVBLE9BQU87RUFDTDtFQUNBLFNBQVMsVUFBa0I7R0FDekIsaUJBQWlCLElBQUk7R0FDckIsSUFBSSxPQUFPLG9CQUFvQixPQUFPLEtBQUs7R0FDM0MsS0FBSyxNQUFNLFFBQVEsT0FBTyxvQkFBb0IsTUFBTSxLQUFLO0VBQzNEO0VBQ0EsbUJBQW9CLFFBQVEsaUJBQWlCLE9BQU8sT0FBTyxZQUFZLFVBQVUsSUFBSSxvQkFBb0IsbUJBQW1CO0VBQzVILHlCQUF5QixrQkFBa0IsSUFBSTtDQUNqRDtBQUNGO0FBRUEsU0FBUyxzQkFBc0IsTUFBd0I7Q0FDckQsTUFBTSxXQUFXLEtBQUs7Q0FDdEIsTUFBTSxZQUFZLFNBQVMsYUFBYSxVQUFVO0NBQ2xELEtBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxVQUFVLE9BQU8sU0FBUyxHQUFHO0VBQ3ZELFVBQVUsS0FBSyxPQUFPLGFBQWEsVUFBVSxLQUFLLEtBQUssR0FBRyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsQ0FBQztDQUNuRjtDQUNBLFVBQVUsY0FBYztDQUN4QixvQkFBb0IsVUFBVSxxQkFBcUI7Q0FDbkQsU0FBUyxtQkFBbUI7Q0FDNUIsU0FBUyxzQkFBc0I7QUFDakM7QUFFQSxTQUFTLG1CQUErQjtDQUN0QyxNQUFNLFFBQVEsb0JBQW9CO0NBQ2xDLE1BQU0sY0FBYyxtQkFBbUIsS0FBSztDQUM1QyxJQUFJLENBQUMsYUFBYSxPQUFPLHNCQUFzQjtDQUMvQyxNQUFNLE9BQU8sMkJBQTJCO0VBQ3RDLE1BQU07RUFDTixPQUFPO0VBQ1AsUUFBUTtFQUNSLFVBQVUsb0JBQW9CO0VBQzlCLFVBQVUsbUJBQW1CLEtBQUs7RUFDbEMsVUFBVTtFQUNWLGdCQUFnQjtDQUNsQixDQUFDO0NBQ0QsSUFBSSxPQUFPO0VBQ1QsTUFBTSxRQUFRLEtBQUssU0FBUztFQUM1QixJQUFJLE9BQU87R0FDVCxNQUFNLGdCQUFnQjtHQUN0QixNQUFNLGVBQWU7RUFDdkI7Q0FDRjtDQUNBLE9BQU8sZUFBZSxNQUFNLFdBQVcsV0FBVztBQUNwRDtBQUVBLFNBQVMsbUJBQWlDO0NBQ3hDLFFBQVEsWUFBWSxjQUFjLENBQUMsRUFBQyxDQUFFLElBQUksZUFBZTtBQUMzRDtBQUVBLFNBQVMsZ0JBQWdCLEtBQW9DO0NBQzNELE1BQU0sT0FBTyxJQUFJLE1BQU0sS0FDckIsSUFBSSxNQUFNLGVBQWUsSUFBSyxFQUFFLEdBQ2hDLElBQUksTUFBTSxxQkFBcUI7RUFDN0IsT0FBTztFQUNQLFdBQVc7RUFDWCxXQUFXO0NBQ2IsQ0FBQyxDQUNIO0NBQ0EsS0FBSyxPQUFPLGtCQUFrQixJQUFJO0NBQ2xDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxLQUFLLEdBQUcsR0FBRyxJQUFJLFFBQVE7Q0FDL0MsS0FBSyxTQUFTLElBQUksSUFBSSxHQUFHLFVBQVUsS0FBTSxJQUFJLENBQUM7Q0FDOUMsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDO0NBQ3ZDLEtBQUssY0FBYyxhQUFhO0NBQ2hDLEtBQUssZ0JBQWdCO0NBQ3JCLE9BQU87QUFDVDtBQUVBLFNBQVMsa0JBQWtCLFNBQXNEO0NBQy9FLE1BQU0sUUFBUSxJQUFJLE1BQU0sTUFBTTtDQUM5QixNQUFNLE9BQU87Q0FDYixLQUFLLE1BQU0sVUFBVSxTQUFTLE1BQU0sSUFBSSxpQkFBaUIsTUFBTSxDQUFDO0NBQ2hFLE9BQU87QUFDVDtBQUVBLFNBQVMsaUJBQWlCLFFBQTBDO0NBQ2xFLE1BQU0sUUFBUSxJQUFJLE1BQU0sTUFBTTtDQUM5QixNQUFNLE9BQU87Q0FDYixNQUFNLGdCQUFnQixJQUFJLE1BQU0scUJBQXFCO0VBQ25ELE9BQU87RUFDUCxhQUFhO0VBQ2IsU0FBUztFQUNULFdBQVc7RUFDWCxXQUFXO0NBQ2IsQ0FBQztDQUNELE1BQU0sUUFBUSxJQUFJLE1BQU0sS0FBSyxJQUFJLE1BQU0sZUFBZSxPQUFPLFFBQVEsRUFBRSxHQUFHLGFBQWE7Q0FDdkYsTUFBTSxPQUFPO0NBQ2IsTUFBTSxTQUFTLElBQUksQ0FBQyxLQUFLLEtBQUs7Q0FDOUIsTUFBTSxTQUFTLElBQUksT0FBTyxHQUFHLGFBQWEsTUFBTSxHQUFHLE9BQU8sQ0FBQztDQUMzRCxNQUFNLGNBQWMsYUFBYTtDQUNqQyxNQUFNLElBQUksS0FBSztDQUVmLE1BQU0sT0FBTyxJQUFJLE1BQU0sS0FDckIsSUFBSSxNQUFNLGFBQWEsT0FBTyxTQUFTLEtBQU0sT0FBTyxTQUFTLE1BQU0sRUFBRSxHQUNyRSxJQUFJLE1BQU0sa0JBQWtCO0VBQUUsT0FBTztFQUFXLGFBQWE7RUFBTSxTQUFTO0VBQU0sTUFBTSxNQUFNO0NBQVcsQ0FBQyxDQUM1RztDQUNBLEtBQUssT0FBTztDQUNaLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxLQUFLO0NBQzdCLEtBQUssU0FBUyxLQUFLLE1BQU0sUUFBUTtDQUNqQyxLQUFLLFNBQVMsS0FBSztDQUNuQixLQUFLLGNBQWMsYUFBYTtDQUNoQyxNQUFNLElBQUksSUFBSTtDQUVkLE1BQU0sUUFBUSxnQkFBZ0IsTUFBTTtDQUNwQyxNQUFNLElBQUksS0FBSztDQUVmLE1BQU0sWUFBWSwyQkFBMkIsSUFBSSxzQkFBc0I7Q0FDdkUsSUFBSSxXQUFXO0VBQ2IsS0FBSyxVQUFVLENBQUMsQ0FBQyxNQUFNLFFBQVE7R0FDN0IsY0FBYyxLQUFLLE1BQU0sWUFBWTtJQUNuQyxRQUFRLGFBQWEsTUFBTTtJQUMzQixRQUFRLGFBQWE7SUFDckIsY0FBYyxNQUFNO0lBQ3BCLGNBQWMsY0FBYztHQUM5QixDQUFDO0VBQ0gsQ0FBQztDQUNIO0NBQ0EsT0FBTztBQUNUO0FBRUEsU0FBUyxhQUFhLFFBQXFDO0NBQ3pELElBQUksU0FBUyxhQUFhLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDNUMsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLEdBQUcsU0FBUyxHQUFHO0VBQ3pDLE1BQU0sUUFBUyxRQUFRLElBQUssS0FBSyxLQUFLO0VBQ3RDLE1BQU0sU0FBUyxPQUFPLFNBQVM7RUFDL0IsU0FBUyxLQUFLLElBQUksUUFBUSxhQUFhLE9BQU8sSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLFFBQVEsT0FBTyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxDQUFDO0NBQ2xIO0NBQ0EsT0FBTyxTQUFTLFVBQVU7QUFDNUI7QUFFQSxTQUFTLGdCQUFnQixRQUFrRDtDQUN6RSxNQUFNLFFBQVE7Q0FDZCxNQUFNLE9BQU8sSUFBSSxNQUFNLGNBQ3JCLElBQUksTUFBTSxpQkFBaUIsTUFBTyxNQUFPLEtBQU0sQ0FBQyxHQUNoRCxJQUFJLE1BQU0scUJBQXFCO0VBQUUsT0FBTztFQUFXLFdBQVc7Q0FBSSxDQUFDLEdBQ25FLEtBQ0Y7Q0FDQSxLQUFLLE9BQU87Q0FDWixLQUFLLGNBQWMsYUFBYTtDQUNoQyxNQUFNLFNBQVMsSUFBSSxNQUFNLFFBQVE7Q0FDakMsTUFBTSxXQUFXLElBQUksTUFBTSxXQUFXO0NBQ3RDLE1BQU0sV0FBVyxJQUFJLE1BQU0sUUFBUTtDQUNuQyxNQUFNLFFBQVEsSUFBSSxNQUFNLFFBQVE7Q0FDaEMsS0FBSyxJQUFJLFFBQVEsR0FBRyxRQUFRLE9BQU8sU0FBUyxHQUFHO0VBQzdDLE1BQU0sUUFBUSxRQUFRLFdBQVc7RUFDakMsTUFBTSxTQUFTLE9BQU8sVUFBVSxPQUFTLFFBQVEsS0FBTSxJQUFLO0VBQzVELE1BQU0sSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSTtFQUN2QyxNQUFNLElBQUksT0FBTyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUk7RUFDdkMsU0FBUyxJQUFJLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBSSxHQUFHLENBQUM7RUFDdEMsU0FBUyxhQUFhLElBQUksTUFBTSxNQUFNLE1BQU8sS0FBSyxJQUFJLEtBQUssR0FBRyxPQUFPLE1BQU8sS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO0VBQzVGLE1BQU0sVUFBVSxNQUFTLFFBQVEsS0FBTSxJQUFLLEdBQUk7RUFDaEQsT0FBTyxRQUFRLFVBQVUsVUFBVSxLQUFLO0VBQ3hDLEtBQUssWUFBWSxPQUFPLE1BQU07Q0FDaEM7Q0FDQSxLQUFLLGVBQWUsY0FBYztDQUNsQyxPQUFPO0FBQ1Q7QUFFQSxTQUFTLGFBQWEsR0FBVyxHQUF1QztDQUN0RSxPQUFPLGFBQWEsTUFBTSxXQUFXLHVCQUF1QixHQUFHLEdBQUcsTUFBTSxLQUFLLE9BQU8sTUFBTSxLQUFLO0FBQ2pHO0FBRUEsU0FBUyxxQkFBcUIsR0FBVyxHQUFXLFFBQXFDO0NBQ3ZGLE9BQU8sS0FBSyxJQUFJLEdBQUcsdUJBQXVCLEdBQUcsR0FBRyxNQUFNLElBQUksT0FBTyxNQUFNO0FBQ3pFO0FBRUEsU0FBUyx1QkFBdUIsR0FBVyxHQUFXLFFBQXFDO0NBQ3pGLE9BQU8sS0FBSyxNQUFNLElBQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDO0FBQzlDO0FBRUEsU0FBUyxtQkFBbUIsUUFBUSxPQUFtQztDQUNyRSxNQUFNLFdBQVcsYUFBYSxNQUFNO0NBQ3BDLE1BQU0sY0FBYyxtQkFBbUI7Q0FDdkMsTUFBTSxlQUFlLDJCQUEyQixDQUFDLENBQUMsU0FBUztDQUMzRCxNQUFNLFdBQWtDO0VBQ3RDLFFBQVEsRUFBRSxPQUFPLGtCQUFrQjtFQUNuQyxjQUFjLEVBQUUsT0FBTyxFQUFFO0VBQ3pCLFdBQVcsRUFBRSxPQUFPLEVBQUU7RUFDdEIsWUFBWSxFQUFFLE9BQU8sUUFBUSxRQUFRLFdBQVc7RUFDaEQsTUFBTSxFQUFFLE9BQU8sWUFBWSxFQUFFO0VBQzdCLE9BQU8sRUFBRSxPQUFPLFFBQVEsSUFBSSxFQUFFO0VBQzlCLFlBQVksRUFBRSxPQUFPLGtCQUFrQixFQUFFO0VBQ3pDLFlBQVksRUFBRSxPQUFPLFlBQVksV0FBVztFQUM1QyxVQUFVLEVBQUUsT0FBTyxZQUFZLFNBQVM7RUFDeEMsYUFBYSxFQUFFLE9BQU8sWUFBWSxZQUFZO0VBQzlDLGFBQWEsRUFBRSxPQUFPLFlBQVksWUFBWTtFQUM5QyxVQUFVLEVBQUUsT0FBTyx3QkFBd0IsSUFBSSxJQUFJLFlBQVksU0FBUztFQUN4RSxhQUFhLEVBQUUsT0FBTyxjQUFjLGdCQUFnQixDQUFDLENBQUMsV0FBVyxTQUFTLE1BQU07R0FBQztHQUFHO0dBQUc7RUFBQyxDQUFDLEVBQUU7RUFDM0YsVUFBVSxFQUFFLE9BQU8sY0FBYyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsU0FBUyxVQUFVO0dBQUM7R0FBSztHQUFNO0VBQUksQ0FBQyxFQUFFO0VBQ3BHLFlBQVksRUFBRSxPQUFPLGdCQUFnQixDQUFDLENBQUMsV0FBVyxTQUFTLGNBQWMsSUFBSztDQUNoRjtDQUNBLFNBQVMsTUFBTSxrQkFBa0I7Q0FDakMsbUJBQW1CLFNBQVMsR0FBRztDQUMvQixTQUFTLFNBQVMsa0JBQWtCO0NBQ3BDLFNBQVMsbUJBQW1CLFdBQVc7RUFDckMsT0FBTyxTQUFTLGdCQUFnQixTQUFTO0VBQ3pDLE9BQU8sU0FBUyxzQkFBc0IsU0FBUztFQUMvQyxPQUFPLFNBQVMsbUJBQW1CLFNBQVM7RUFDNUMsT0FBTyxTQUFTLG9CQUFvQixTQUFTO0VBQzdDLE9BQU8sU0FBUyxjQUFjLFNBQVM7RUFDdkMsT0FBTyxTQUFTLGVBQWUsU0FBUztFQUN4QyxPQUFPLFNBQVMsb0JBQW9CLFNBQVM7RUFDN0MsT0FBTyxTQUFTLG9CQUFvQixTQUFTO0VBQzdDLE9BQU8sU0FBUyxrQkFBa0IsU0FBUztFQUMzQyxPQUFPLFNBQVMscUJBQXFCLFNBQVM7RUFDOUMsT0FBTyxTQUFTLHFCQUFxQixTQUFTO0VBQzlDLE9BQU8sU0FBUyxrQkFBa0IsU0FBUztFQUMzQyxPQUFPLFNBQVMscUJBQXFCLFNBQVM7RUFDOUMsT0FBTyxTQUFTLGtCQUFrQixTQUFTO0VBQzNDLE9BQU8sU0FBUyxvQkFBb0IsU0FBUztFQUM3QyxPQUFPLGVBQWUsT0FBTyxhQUMxQixRQUFRLHFCQUFxQix3R0FBd0csQ0FBQyxDQUN0SSxRQUNDLHdCQUNBLGdLQUNGO0VBQ0YsT0FBTyxpQkFBaUIsT0FBTyxlQUM1QixRQUFRLHFCQUFxQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQ0F3Q08sV0FBVyxRQUFRLENBQUMsRUFBRTsrQkFDbEMsV0FBVyxRQUFRLENBQUMsRUFBRTs7YUFFeEMsY0FBYyxlQUFlLEVBQUMsQ0FBRSxRQUFRLENBQUMsRUFBRTs7OzsrRUFJdUIsY0FBYyxlQUFlLEVBQUMsQ0FBRSxRQUFRLENBQUMsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMkJ4SCxDQUFDLENBQ0ksUUFBUSxnQ0FBZ0M7Ozs7Ozs7Ozs7OztFQVk3QyxDQUFDLENBQ0ksUUFBUSwyQkFBMkI7Ozs7Ozs7SUFPdEMsZUFBZSxLQUFLOzJFQUNtRDs7SUFFdkUsZUFBZTs7O21GQUdnRTs7MElBRXVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQXdEbEk7RUFDSixPQUFPLGlCQUFpQixPQUFPLGVBQWUsUUFDNUMsb0NBQ0E7OzsrQkFJRjtDQUNEO0NBQ0QsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sVUFBVTtFQUMxQyxJQUFJLENBQUMsT0FBTzs7Ozs7RUFLWixNQUFNLGVBQWUsSUFBSSxNQUFNLGNBQWMsTUFBTSxNQUFNO0VBQ3pELG1CQUFtQixZQUFZO0VBQy9CLE1BQU0sV0FBVyxTQUFTO0VBQzFCLFNBQVMsTUFBTTtFQUNmLFNBQVMsY0FBYztFQUN2QixJQUFJLFlBQVksYUFBYSxjQUFjLFNBQVMsUUFBUTtFQUM1RCxTQUFTLGFBQWEsUUFBUSxNQUFNO0VBQ3BDLFNBQVMsVUFBVSxRQUFRLE1BQU07Q0FDbkMsQ0FBQztDQUNELE9BQU87QUFDVDtBQUVBLFNBQVMscUJBQTBDO0NBQ2pELE1BQU0sV0FBVyxJQUFJLE1BQU0sY0FBYyxhQUFhLGNBQWMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7Q0FDeEcsTUFBTSxZQUFZLFNBQVMsYUFBYSxVQUFVO0NBQ2xELEtBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxVQUFVLE9BQU8sU0FBUyxHQUFHO0VBQ3ZELE1BQU0sSUFBSSxVQUFVLEtBQUssS0FBSztFQUM5QixNQUFNLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSztFQUMvQixVQUFVLEtBQUssT0FBTyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0NBQzFDO0NBQ0EsVUFBVSxjQUFjO0NBQ3hCLG9CQUFvQixVQUFVLHFCQUFxQjtDQUNuRCxPQUFPO0FBQ1Q7QUFFQSxTQUFTLG9CQUFvQixVQUFrRDtDQUM3RSxNQUFNLE9BQU8sSUFBSSxNQUFNLEtBQUssd0JBQXdCLEdBQUcsUUFBUTtDQUMvRCxLQUFLLE9BQU87Q0FDWixLQUFLLFNBQVMsZUFBZTtDQUM3QixLQUFLLFNBQVMsSUFBSSxDQUFDLEtBQUssS0FBSztDQUM3QixLQUFLLGdCQUFnQjtDQUNyQixLQUFLLGNBQWMsYUFBYTtDQUNoQyxPQUFPO0FBQ1Q7QUFFQSxTQUFTLDBCQUFnRDtDQUN2RCxNQUFNLEVBQUUsVUFBVSxXQUFXLFVBQVUsY0FBYyxVQUFVO0NBQy9ELE1BQU0sV0FBVyxJQUFJLE1BQU0sZUFBZTtDQUMxQyxNQUFNLFlBQXNCLENBQUM7Q0FDN0IsTUFBTSxNQUFnQixDQUFDO0NBQ3ZCLE1BQU0sVUFBb0IsQ0FBQztDQUMzQixhQUFhLFdBQVcsS0FBSyxTQUFTLFVBQVUsV0FBVyxxQkFBcUI7Q0FDaEYsYUFBYSxXQUFXLEtBQUssU0FBUyxVQUFVLFVBQVUscUJBQXFCO0NBQy9FLGFBQWEsV0FBVyxLQUFLLFNBQVMsV0FBVyxXQUFXLHFCQUFxQjtDQUNqRixhQUFhLFdBQVcsS0FBSyxTQUFTLFVBQVUsV0FBVyxxQkFBcUI7Q0FDaEYsU0FBUyxhQUFhLFlBQVksSUFBSSxNQUFNLHVCQUF1QixXQUFXLENBQUMsQ0FBQztDQUNoRixTQUFTLGFBQWEsTUFBTSxJQUFJLE1BQU0sdUJBQXVCLEtBQUssQ0FBQyxDQUFDO0NBQ3BFLFNBQVMsU0FBUyxPQUFPO0NBQ3pCLG9CQUFvQixVQUFVLHFCQUFxQjtDQUNuRCxPQUFPO0FBQ1Q7QUFFQSxTQUFTLDhCQUFvRDtDQUMzRCxNQUFNLFlBQVksaUJBQWlCLElBQUk7Q0FDdkMsTUFBTSxPQUFPLFVBQVUsQ0FBQyxDQUFDO0NBQ3pCLE1BQU0saUJBQWlCO0NBQ3ZCLE1BQU0sV0FBVyxJQUFJLE1BQU0sZUFBZTtDQUMxQyxNQUFNLFlBQXNCLENBQUM7Q0FDN0IsTUFBTSxNQUFnQixDQUFDO0NBQ3ZCLE1BQU0sVUFBb0IsQ0FBQztDQUMzQixLQUFLLElBQUksTUFBTSxHQUFHLE9BQU8sZ0JBQWdCLE9BQU8sR0FBRztFQUNqRCxNQUFNLElBQUksTUFBTTtFQUNoQixNQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUssQ0FBQyxXQUFXLFdBQVcsQ0FBQztFQUM1RCxLQUFLLE1BQU0sS0FBSyxNQUFNO0dBQ3BCLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJO0dBQ2pDLFVBQVUsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO0dBQ3ZCLElBQUksTUFBTSxJQUFJLGdCQUFnQixhQUFhLENBQUM7RUFDOUM7Q0FDRjtDQUNBLE1BQU0sUUFBUSxLQUFLO0NBQ25CLEtBQUssSUFBSSxNQUFNLEdBQUcsTUFBTSxnQkFBZ0IsT0FBTyxHQUFHO0VBQ2hELEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxRQUFRLEdBQUcsTUFBTSxHQUFHO0dBQ3hDLE1BQU0sSUFBSSxNQUFNLFFBQVE7R0FDeEIsTUFBTSxJQUFJLElBQUk7R0FDZCxNQUFNLElBQUksSUFBSTtHQUNkLE1BQU0sSUFBSSxJQUFJO0dBQ2QsUUFBUSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO0VBQy9CO0NBQ0Y7Q0FDQSxTQUFTLGFBQWEsWUFBWSxJQUFJLE1BQU0sdUJBQXVCLFdBQVcsQ0FBQyxDQUFDO0NBQ2hGLFNBQVMsYUFBYSxNQUFNLElBQUksTUFBTSx1QkFBdUIsS0FBSyxDQUFDLENBQUM7Q0FDcEUsU0FBUyxTQUFTLE9BQU87Q0FDekIsU0FBUyxxQkFBcUI7Q0FDOUIsT0FBTztBQUNUO0FBRUEsU0FBUyxhQUNQLFdBQ0EsS0FDQSxTQUNBLE9BQ0EsT0FDQSxVQUNNO0NBQ04sTUFBTSxPQUFPLFVBQVUsU0FBUztDQUNoQyxLQUFLLE1BQU0sS0FBSyxPQUFPO0VBQ3JCLEtBQUssTUFBTSxLQUFLLE9BQU87R0FDckIsVUFBVSxLQUFLLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUM7R0FDcEMsSUFBSSxNQUFNLElBQUksZ0JBQWdCLGNBQWMsQ0FBQyxJQUFJLGdCQUFnQixZQUFZO0VBQy9FO0NBQ0Y7Q0FDQSxNQUFNLFFBQVEsTUFBTTtDQUNwQixLQUFLLElBQUksS0FBSyxHQUFHLEtBQUssTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHO0VBQy9DLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxNQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUc7R0FDL0MsTUFBTSxJQUFJLE9BQU8sS0FBSyxRQUFRO0dBQzlCLE1BQU0sSUFBSSxJQUFJO0dBQ2QsTUFBTSxJQUFJLElBQUk7R0FDZCxNQUFNLElBQUksSUFBSTtHQUNkLFFBQVEsS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUMvQjtDQUNGO0FBQ0Y7QUFFQSxTQUFTLGtCQUEwQjtDQUNqQyxNQUFNLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxjQUFjO0NBQ3JFLE1BQU0sUUFBUSxTQUFTLFFBQVEsTUFBTSx3QkFBd0IsUUFBUSxNQUFNO0NBQzNFLE9BQU8sS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksS0FBSyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3JEO0FBRUEsU0FBUyxxQkFBOEI7Q0FDckMsTUFBTSxPQUFPLFlBQVksUUFBUTtDQUNqQyxJQUFJLFNBQVMsWUFBWSxPQUFPO0NBQ2hDLElBQUksU0FBUyxPQUFPLE9BQU87Q0FDM0IsSUFBSSxPQUFPLFdBQVcsYUFBYTtFQUNqQyxNQUFNLFFBQVEsSUFBSSxnQkFBZ0IsT0FBTyxTQUFTLE1BQU0sQ0FBQyxDQUFDLElBQUksYUFBYTtFQUMzRSxJQUFJLFVBQVUsTUFBTSxPQUFPLFVBQVUsT0FBTyxVQUFVO0NBQ3hEO0NBQ0EsSUFBSSxZQUFZLElBQUkseUJBQXlCLE9BQU8sWUFBWSxJQUFJLHlCQUF5QixRQUFRLE9BQU87Q0FDNUcsT0FBTyxRQUFRLE1BQU07QUFDdkI7QUFFQSxTQUFTLHNCQUErQjtDQUN0QyxJQUFJLFlBQVksUUFBUSxnQkFBZ0IsT0FBTyxPQUFPO0NBQ3RELElBQUksT0FBTyxXQUFXLGFBQWE7RUFDakMsTUFBTSxRQUFRLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNLENBQUMsQ0FBQyxJQUFJLGNBQWM7RUFDNUUsSUFBSSxVQUFVLE1BQU0sT0FBTyxVQUFVLE9BQU8sVUFBVTtDQUN4RDtDQUNBLElBQUksWUFBWSxJQUFJLDBCQUEwQixPQUFPLFlBQVksSUFBSSwwQkFBMEIsUUFBUSxPQUFPO0NBQzlHLE9BQU8sUUFBUSxNQUFNO0FBQ3ZCO0FBRUEsU0FBUyxvQkFBNEI7Q0FDbkMsT0FBTyxZQUFZLFFBQVEsZ0JBQWdCLGFBQWEsTUFBTztBQUNqRTtBQUVBLFNBQVMsc0JBQThCO0NBQ3JDLE1BQU0sT0FBTyxLQUFLLElBQUksSUFBSyxLQUFLLElBQUksR0FBRyxRQUFRLE1BQU0scUJBQXFCLENBQUM7Q0FDM0UsT0FBTyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksS0FBSyxLQUFLLE1BQU0sYUFBYSxJQUFJLENBQUMsQ0FBQztBQUNqRTtBQUVBLFNBQVMsa0JBQWtCLE1BQTRDO0NBQ3JFLE1BQU0sUUFBUSxLQUFLLFNBQVM7Q0FDNUIsSUFBSSxPQUFPLE9BQU87Q0FDbEIsTUFBTSxXQUFZLEtBQUssU0FBUyxhQUFhLFVBQVUsQ0FBQyxFQUF3QyxTQUFTO0NBQ3pHLE1BQU0sV0FBVyxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sS0FBSyxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUM7Q0FDaEUsTUFBTSxZQUFZLEtBQUssU0FBUyxRQUFRLEtBQUssU0FBUyxNQUFNLFFBQVEsSUFBSSxLQUFLLE1BQU0sV0FBVyxDQUFDO0NBQy9GLE9BQU87RUFDTCxTQUFTO0VBQ1QsTUFBTTtFQUNOLFdBQVc7RUFDWDtFQUNBLFlBQVksYUFBYTtFQUN6QjtFQUNBO0VBQ0EsY0FBYztFQUNkLGVBQWU7RUFDZixjQUFjO0NBQ2hCO0FBQ0Y7QUFFQSxTQUFTLGdCQUF3QjtDQUMvQixNQUFNLFNBQVMsT0FBTyxXQUFXLGVBQWUsT0FBTyxjQUFjO0NBQ3JFLE1BQU0sUUFBUSxTQUFTLFFBQVEsTUFBTSxzQkFBc0IsUUFBUSxNQUFNO0NBQ3pFLE9BQU8sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksS0FBSyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3BEO0FBRUEsU0FBUyxZQUFrRztDQUN6RyxNQUFNLGVBQWUsZ0JBQWdCO0NBQ3JDLE1BQU0sZ0JBQWdCLGNBQWM7Q0FDcEMsTUFBTSxZQUFZLFNBQVMsQ0FBQyxZQUFZLFlBQVksWUFBWTtDQUNoRSxNQUFNLFdBQVcsbUJBQW1CLENBQUMsWUFBWSxDQUFDLGNBQWMsYUFBYSxDQUFDLENBQUMsUUFBUTtDQUN2RixNQUFNLFlBQVksbUJBQW1CLFlBQVksY0FBYyxhQUFhO0NBQzVFLE9BQU87RUFDTCxVQUFVO0dBQUMsR0FBRyxTQUFTLE1BQU0sR0FBRyxDQUFDLENBQUM7R0FBRyxHQUFHO0dBQVcsR0FBRyxVQUFVLE1BQU0sQ0FBQztFQUFDO0VBQ3hFO0VBQ0E7RUFDQTtDQUNGO0FBQ0Y7QUFFQSxTQUFTLFNBQVMsT0FBZSxLQUFhLFVBQTRCO0NBQ3hFLE1BQU0sUUFBUSxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sUUFBUSxDQUFDO0NBQzlDLE1BQU0sU0FBbUIsQ0FBQztDQUMxQixLQUFLLElBQUksUUFBUSxHQUFHLFNBQVMsT0FBTyxTQUFTLEdBQUcsT0FBTyxLQUFLLE1BQU0sVUFBVSxLQUFLLE9BQU8sS0FBSyxRQUFRLEtBQUssQ0FBQztDQUMzRyxPQUFPO0FBQ1Q7QUFFQSxTQUFTLG1CQUFtQixNQUFjLE9BQWUsVUFBNEI7Q0FDbkYsTUFBTSxlQUFlLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxXQUFXLEdBQUksQ0FBQyxDQUFDO0NBQ3pFLE1BQU0sY0FBYyxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sUUFBUSxJQUFJLFlBQVk7Q0FDbkUsTUFBTSxZQUFZLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSztDQUM3QyxNQUFNLGdCQUFnQixPQUFPLFlBQVksS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLFFBQVEsSUFBSSxDQUFDO0NBQzNFLE9BQU8sQ0FBQyxHQUFHLFNBQVMsTUFBTSxlQUFlLFlBQVksR0FBRyxHQUFHLFNBQVMsZUFBZSxPQUFPLFdBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pIO0FBRUEsU0FBUyxvQkFBb0IsVUFBZ0MsVUFBa0Q7Q0FDN0csTUFBTSxZQUFZLFNBQVMsYUFBYSxVQUFVO0NBQ2xELE1BQU0sVUFBb0IsQ0FBQztDQUMzQixLQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsVUFBVSxPQUFPLFNBQVMsR0FBRztFQUN2RCxNQUFNLElBQUksVUFBVSxLQUFLLEtBQUs7RUFDOUIsTUFBTSxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUs7RUFDL0IsTUFBTSxTQUFTLGNBQWMsR0FBRyxHQUFHLFFBQVE7RUFDM0MsUUFBUSxLQUFLLE9BQU8sR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQzNDO0NBQ0EsU0FBUyxhQUFhLFVBQVUsSUFBSSxNQUFNLHVCQUF1QixTQUFTLENBQUMsQ0FBQztBQUM5RTtBQUVBLFNBQVMsY0FBYyxHQUFXLEdBQVcsVUFBMkQ7Q0FDdEcsTUFBTSxPQUFPO0NBQ2IsTUFBTSxNQUFNLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxTQUFTLElBQUksTUFBTSxDQUFDLE1BQU0sT0FBTztDQUNyRSxNQUFNLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksTUFBTSxPQUFPO0NBQ3JFLE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVTtBQUNqRDtBQUVBLFNBQVMsZ0JBQWdCLEdBQVcsR0FBaUM7Q0FDbkUsTUFBTSxPQUFPLEtBQUssSUFBSSxDQUFDO0NBQ3ZCLE1BQU0sZUFBZSxLQUFLLElBQUksR0FBRyxPQUFPLFdBQVc7Q0FDbkQsTUFBTSxZQUFZLFdBQ2hCLFFBQVEsTUFBTSw4QkFDZCxRQUFRLE1BQU0sK0JBQStCLEdBQzdDLG9CQUFvQixHQUFHLENBQUMsQ0FDMUI7Q0FDQSxNQUFNLFdBQVcsV0FBVyxHQUFHLEdBQUcsS0FBSyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0NBQ2xELE1BQU0sV0FBVyxxQkFBcUIsR0FBRyxDQUFDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxJQUFJLFlBQVk7Q0FDbEYsTUFBTSxXQUFXLFdBQVcsR0FBRyxHQUFHLFlBQVksS0FBSyxJQUFJLFdBQVcsSUFBSSxJQUFJLFlBQVksS0FBSztDQUMzRixNQUFNLFFBQVEsWUFBWSxHQUFHLENBQUMsSUFBSSxZQUFZLE1BQU8sV0FBVyxJQUFJLE1BQU8sTUFBTSxJQUFJLE1BQU8sR0FBRyxJQUFJO0NBQ25HLE1BQU0sUUFDSixLQUFLLElBQUksU0FBUyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUksSUFDN0csWUFDQyxNQUFPLFdBQVcsSUFBSSxNQUFPLEtBQUssSUFBSSxNQUFPLElBQUksSUFBSTtDQUN4RCxNQUFNLE9BQU8sS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztDQUM5QyxNQUFNLFFBQVEsV0FBVyxhQUFhLEdBQUcsWUFBWSxJQUFJLElBQUksWUFBWSxNQUFPLFdBQVcsSUFBSSxNQUFPLEtBQUssSUFBSSxNQUFPLEdBQUcsSUFBSTtDQUM3SCxNQUFNLFNBQ0osS0FBSyxJQUNILFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUM1QixTQUFTLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQzNCLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQzdCLFNBQVMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUM5QixJQUNBLFlBQ0MsTUFBTyxXQUFXLElBQUksTUFBTyxLQUFLLElBQUksTUFBTyxHQUFHLElBQUk7Q0FDdkQsTUFBTSxRQUFRLFFBQVEsTUFBTSx1QkFBdUIsMEJBQTBCO0NBQzdFLE1BQU0sZ0JBQWdCLFFBQVEsTUFBTyxRQUFRLE1BQU8sUUFBUSxLQUFPLFNBQVMsT0FBUTtDQUNwRixPQUFPO0VBQUU7RUFBTztFQUFPO0VBQU87RUFBUTtFQUFXO0VBQVU7Q0FBYTtBQUMxRTtBQUVBLFNBQVMsMEJBQTBCLEdBQVcsR0FBbUI7Q0FDL0QsTUFBTSxjQUFjLGdCQUFnQixDQUFDLENBQUMsV0FBVztDQUNqRCxJQUFJLENBQUMsZUFBZSxZQUFZLFNBQVMsVUFBVSxPQUFPO0NBRTFELElBQUksU0FBUztDQUNiLE1BQU0sUUFBUSxZQUFZO0NBQzFCLElBQUksT0FBTyxVQUFVLFNBQVMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxRQUFRLE1BQU0sU0FBUyxHQUFJLElBQUksTUFBTTtDQUVqRyxLQUFLLE1BQU0sUUFBUSxZQUFZLGdCQUFnQixDQUFDLEdBQUc7RUFDakQsVUFBVSxnQkFBZ0IsR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxRQUFRLEtBQUssT0FBTyxLQUFLLEtBQUssSUFBSSxLQUFLO0NBQzlGO0NBRUEsTUFBTSxhQUFhLFlBQVk7Q0FDL0IsSUFBSSxZQUFZO0VBQ2QsTUFBTSxlQUFlLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksV0FBVztFQUMxRCxNQUFNLFdBQVcsV0FBVyxLQUFNLEtBQUssWUFBWSxLQUFLLElBQUksV0FBVyxLQUFLLFdBQVcsT0FBTyxZQUFZO0VBQzFHLE1BQU0sU0FBUyxNQUFPLFdBQVcsSUFBSSxNQUFPLEtBQUssSUFBSSxNQUFPLElBQUksSUFBSTtFQUNwRSxVQUFVLFdBQVcsV0FBVyxTQUFTO0NBQzNDO0NBRUEsT0FBTztBQUNUO0FBRUEsU0FBUyxnQkFBZ0IsR0FBVyxHQUFXLElBQVksSUFBWSxRQUFnQixPQUFlLE9BQXVCO0NBQzNILE1BQU0sS0FBSyxJQUFJO0NBQ2YsTUFBTSxLQUFLLElBQUk7Q0FDZixNQUFNLE1BQU0sS0FBSyxJQUFJLEtBQUs7Q0FDMUIsTUFBTSxNQUFNLEtBQUssSUFBSSxLQUFLO0NBQzFCLE1BQU0sUUFBUSxLQUFLLE1BQU0sS0FBSztDQUM5QixNQUFNLFNBQVMsQ0FBQyxLQUFLLE1BQU0sS0FBSztDQUNoQyxNQUFNLGFBQWEsSUFBSSxXQUFXLFNBQVMsS0FBTSxTQUFTLElBQUssS0FBSyxJQUFJLEtBQUssQ0FBQztDQUM5RSxNQUFNLFlBQVksSUFBSSxXQUFXLFFBQVEsS0FBTSxRQUFRLElBQUssS0FBSyxJQUFJLFNBQVMsS0FBSyxJQUFJLFFBQVEsR0FBSSxJQUFJLFFBQVEsR0FBSSxDQUFDO0NBQ3BILE1BQU0sUUFBUSxNQUFPLFdBQVcsSUFBSSxNQUFPLE1BQU0sSUFBSSxNQUFPLEdBQUcsSUFBSTtDQUNuRSxPQUFPLE1BQU0sVUFBVSxNQUFNLGFBQWEsWUFBWSxPQUFPLEdBQUcsQ0FBQztBQUNuRTtBQUVBLFNBQVMsWUFBWSxHQUFXLEdBQW1CO0NBQ2pELE1BQU0sZUFBZSxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLFdBQVc7Q0FDMUQsTUFBTSxVQUFVLElBQUksS0FBSyxJQUFJLElBQUksR0FBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSyxJQUFJO0NBQ25FLE1BQU0sT0FBTyxLQUFLLE9BQU8sVUFBVSxPQUFPLEVBQUU7Q0FDNUMsTUFBTSxTQUFTLE9BQU8sS0FBSyxNQUFNLEtBQUssSUFBSSxlQUFlLEtBQU0sSUFBSSxJQUFJO0NBQ3ZFLE1BQU0sT0FBTyxJQUFJLFdBQVcsSUFBSyxLQUFLLEtBQUssSUFBSSxVQUFVLE1BQU0sQ0FBQztDQUNoRSxNQUFNLGVBQWUsU0FBUyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssTUFBTSxLQUFLLElBQUksZUFBZSxLQUFNLE9BQU8sR0FBRyxJQUFJO0NBQ3JHLE1BQU0sVUFBVSxJQUFJLFdBQVcsS0FBTSxLQUFLLEtBQUssSUFBSSxVQUFVLFlBQVksQ0FBQyxLQUFLLFdBQVcsR0FBRyxJQUFJLFlBQVk7Q0FDN0csT0FBTyxLQUFLLElBQUksTUFBTSxTQUFTLEVBQUc7QUFDcEM7QUFFQSxTQUFTLFNBQVMsR0FBVyxHQUFXLElBQVksSUFBWSxJQUFZLElBQW9CO0NBQzlGLE1BQU0sTUFBTSxJQUFJLE1BQU07Q0FDdEIsTUFBTSxNQUFNLElBQUksTUFBTTtDQUN0QixPQUFPLElBQUksV0FBVyxLQUFNLEdBQUcsS0FBSyxLQUFLLEtBQUssRUFBRTtBQUNsRDtBQUVBLFNBQVMscUJBQXFCLEdBQVcsR0FBbUI7Q0FDMUQsSUFBSSxLQUFLLGNBQWMsa0JBQWtCLEtBQUssTUFBTSxLQUFLLElBQUksQ0FBQyxLQUFLLElBQUksT0FBTztDQUM5RSxPQUFPLFdBQVcsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDdEM7QUFFQSxTQUFTLGdCQUFnQixHQUFXLEdBQW1CO0NBQ3JELE1BQU0sU0FBUztFQUNiLENBQUMsR0FBRyxFQUFFO0VBQ04sQ0FBQyxDQUFDLElBQUksQ0FBQztFQUNQLENBQUMsR0FBRyxDQUFDO0VBQ0wsQ0FBQyxJQUFJLGNBQWMsY0FBYztFQUNqQyxDQUFDLElBQUksQ0FBQyxFQUFFO0NBQ1Y7Q0FDQSxJQUFJLE9BQU87Q0FDWCxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sUUFBUSxRQUFRLFdBQVcsS0FBSyxLQUFLLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7Q0FDdEYsT0FBTztBQUNUO0FBRUEsU0FBUyw0QkFBb0M7Q0FDM0MsSUFBSSxPQUFPLFdBQVcsYUFBYSxPQUFPO0NBQzFDLE9BQU8sT0FBTyxjQUFjLE1BQU0sUUFBUSxNQUFNLDRCQUE0QjtBQUM5RTtBQUVBLFNBQVMsbUJBQTJCO0NBQ2xDLE1BQU0sRUFBRSxVQUFVLFdBQVcsVUFBVSxjQUFjLFVBQVU7Q0FDL0QsTUFBTSxRQUFRLGNBQWMsSUFBSTtDQUNoQyxPQUFPLFNBQVMsU0FBUyxRQUFRLElBQUksVUFBVSxTQUFTLFVBQVUsU0FBUyxTQUFTLFNBQVMsVUFBVTtBQUN6RztBQUVBLFNBQVMsd0JBQW1EO0NBQzFELE1BQU0sT0FBTyxVQUFVLENBQUMsQ0FBQztDQUN6QixNQUFNLFVBQVUsS0FBSyxLQUFLLE1BQU0sa0JBQWtCLENBQUMsQ0FBQztDQUNwRCxNQUFNLG1CQUFtQixRQUFRLFFBQVEsS0FBSyxXQUFXLEtBQUssSUFBSSxLQUFLLEtBQUssSUFBSSxVQUFXLGNBQWMsZUFBZSxDQUFFLENBQUMsR0FBRyxDQUFDO0NBQy9ILE9BQU87RUFDTCxTQUFTLGdCQUFnQixXQUFXO0VBQ3BDLFdBQVcsZ0JBQWdCLFdBQVcsUUFBUSxJQUFJO0VBQ2xELFFBQVE7RUFDUixVQUFVLHNCQUFzQjtFQUNoQyxpQkFBaUIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDO0VBQzlDLFdBQVcsZUFBZTtFQUMxQixpQkFBaUIsT0FBTyxrQkFBa0IsT0FBTyxJQUFJLENBQUM7RUFDdEQsaUJBQWlCLE9BQU8sa0JBQWtCLE9BQU8sSUFBSSxDQUFDO0VBQ3RELGdCQUFnQixPQUFPLGtCQUFrQixDQUFDLFlBQVksQ0FBQztFQUN2RCxnQkFBZ0IsT0FBTyxrQkFBa0IsWUFBWSxDQUFDO0VBQ3RELGtCQUFrQixPQUFPLGdCQUFnQjtDQUMzQztBQUNGO0FBRUEsU0FBUyx3QkFBZ0M7Q0FDdkMsT0FBTyxVQUFVLENBQUMsQ0FBQyxTQUFTLFNBQVM7QUFDdkM7QUFFQSxTQUFTLGtCQUFrQixHQUFtQjtDQUM1QyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSTtDQUMxQixNQUFNLFVBQVUsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxVQUFVO0NBQ3BELE1BQU0sS0FBSyxJQUFJLE9BQU87Q0FDdEIsTUFBTSxPQUFPLFdBQVcsR0FBRyxJQUFJLE9BQU87Q0FDdEMsUUFBUSxjQUFjLGVBQWUsSUFBSSxRQUFRLEtBQUssSUFBSSxLQUFLLElBQUssSUFBSSxNQUFNLEtBQUssSUFBSSxLQUFLLElBQUssSUFBSTtBQUN2RztBQUVBLFNBQVMsaUJBQXlCO0NBQ2hDLE9BQU8sZUFBZTtBQUN4QjtBQUVBLFNBQVMsdUJBQXdEO0NBQy9ELE9BQU87RUFDTDtHQUFFLEdBQUcsQ0FBQztHQUFZLEdBQUcsQ0FBQztFQUFHO0VBQ3pCO0dBQUUsR0FBRztHQUFZLEdBQUcsQ0FBQztFQUFHO0VBQ3hCO0dBQUUsR0FBRyxDQUFDO0dBQUksR0FBRyxDQUFDO0VBQVc7RUFDekI7R0FBRSxHQUFHO0dBQUcsR0FBRztFQUFXO0VBQ3RCO0dBQUUsR0FBRztHQUFJLEdBQUc7RUFBVztFQUN2QjtHQUFFLEdBQUc7R0FBWSxHQUFHO0VBQUU7Q0FDeEI7QUFDRjtBQUVBLFNBQVMsb0JBQW9CLE1BQWUsUUFBbUIsaUJBQWlCLEdBQW9EO0NBQ2xJLE1BQU0sa0JBQWtCLGNBQWMsZUFBZTtDQUNyRCxPQUFPO0VBQ0w7RUFDQTtFQUNBLGlCQUFpQixpQkFBaUIsSUFBSTtFQUN0QyxZQUFZO0VBQ1osV0FBVyxlQUFlO0VBQzFCLGVBQWUsTUFBTTtFQUNyQixZQUFZLFdBQVcsT0FBTztFQUM5QixXQUFXLFdBQVcsTUFBTTtFQUM1QixXQUFXLFFBQVEsV0FBVztFQUM5QixXQUFXLFFBQVEsV0FBVztFQUM5QixTQUFTLFlBQVksS0FBSyxZQUFZO0dBQ3BDLEdBQUcsT0FBTztHQUNWLEdBQUcsT0FBTyxJQUFJLElBQUksY0FBYyxNQUFPLGNBQWM7RUFDdkQsRUFBRTtDQUNKO0FBQ0Y7QUFFQSxTQUFTLG1CQUEyQjtDQUNsQyxRQUFRLFlBQVksb0JBQW9CLGNBQWMsZUFBZSxJQUFJLGtCQUFrQjtBQUM3RjtBQUVBLFNBQVMsaUJBQWlCLE1BQXdCO0NBQ2hELE1BQU0sV0FBWSxLQUFLLFNBQXdDLFNBQVM7Q0FDeEUsSUFBSSxDQUFDLFVBQVU7Q0FDZixNQUFNLFNBQVMsbUJBQW1CO0NBQ2xDLE1BQU0sY0FBYyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVc7Q0FDakQsU0FBUyxXQUFXLFFBQVEsUUFBUSxRQUFRO0NBQzVDLFNBQVMsV0FBVyxRQUFRLE9BQU87Q0FDbkMsU0FBUyxTQUFTLFFBQVEsT0FBTztDQUNqQyxTQUFTLFlBQVksUUFBUSxPQUFPO0NBQ3BDLFNBQVMsWUFBWSxRQUFRLE9BQU87Q0FDcEMsU0FBUyxTQUFTLFFBQVEsd0JBQXdCLElBQUksSUFBSSxPQUFPO0NBQ2pFLFNBQVMsWUFBWSxNQUFNLEtBQUssY0FBYyxhQUFhLE1BQU07RUFBQztFQUFHO0VBQUc7Q0FBQyxDQUFDLENBQUM7Q0FDM0UsU0FBUyxTQUFTLE1BQU0sS0FBSyxjQUFjLGFBQWEsVUFBVTtFQUFDO0VBQUs7RUFBTTtDQUFJLENBQUMsQ0FBQztDQUNwRixTQUFTLFdBQVcsUUFBUSxhQUFhLGNBQWM7QUFDekQ7QUFFQSxTQUFTLDBCQUFtQztDQUMxQyxPQUFPLE9BQU8sV0FBVyxlQUFlLElBQUksZ0JBQWdCLE9BQU8sU0FBUyxNQUFNLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixNQUFNO0FBQ2pIO0FBRUEsU0FBUyxxQkFBeUM7Q0FDaEQsTUFBTSxhQUFhLGdCQUFnQixDQUFDLENBQUM7Q0FDckMsTUFBTSxXQUFXLFdBQVcsU0FBUyxTQUFTLENBQUM7Q0FDL0MsTUFBTSxpQkFBaUIsWUFBWSxvQkFBb0IsY0FBYyxlQUFlLElBQUksa0JBQWtCO0NBQzFHLE1BQU0sY0FBYyxXQUFXLGFBQWEsZUFBZSxNQUFPLFdBQVcsYUFBYSxhQUFhLE1BQU87Q0FDOUcsTUFBTSxlQUFlLFdBQVcsU0FBUyxnQkFBZ0IsTUFBTyxXQUFXLFFBQVEsS0FBTTtDQUN6RixPQUFPO0VBQ0wsWUFBWSxRQUFRLFNBQVMsY0FBYyxXQUFXO0VBQ3RELFVBQVUsS0FBSyxJQUFJLElBQUssU0FBUyxhQUFhLFdBQVcsUUFBUSxnQkFBZ0IsV0FBVyxhQUFhLFNBQVMsTUFBTSxJQUFJO0VBQzVILGFBQWEsUUFBUSxTQUFTLGVBQWUsWUFBWTtFQUN6RCxhQUFhLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxLQUFLLFNBQVMsZUFBZSxDQUFDLENBQUM7RUFDakUsVUFBVSxRQUFRLFNBQVMsWUFBWSxHQUFJO0NBQzdDO0FBQ0Y7QUFFQSxTQUFTLGNBQWMsT0FBNkMsVUFBbUQ7Q0FDckgsTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLFNBQVM7Q0FDM0IsT0FBTyxJQUFJLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNsQztBQUVBLGVBQWUsdUJBQTBHO0NBQ3ZILE1BQU0sV0FBNEIsQ0FBQztDQUNuQyxLQUFLLE1BQU0sUUFBUSxvQkFBb0I7RUFDckMsTUFBTSxVQUFVLE1BQU0sdUJBQXVCLElBQUk7RUFDakQsSUFBSSxTQUFTLFNBQVMsS0FBSyxPQUFPO0NBQ3BDO0NBQ0EsSUFBSSxTQUFTLFdBQVcsR0FBRyxPQUFPO0NBQ2xDLE9BQU8sZ0JBQWdCLFFBQVE7QUFDakM7QUFFQSxTQUFTLHVCQUF1QixNQUE2QztDQUMzRSxJQUFJLFNBQVMseUJBQXlCLE9BQU8scUJBQXFCLFdBQVcsV0FBVztDQUN4RixNQUFNLFlBQVksMkJBQTJCLElBQUksSUFBSTtDQUNyRCxJQUFJLENBQUMsV0FBVyxPQUFPLFFBQVEsUUFBUSxJQUFJO0NBQzNDLE9BQU8sVUFBVSxDQUFDLENBQUMsTUFDaEIsUUFDQyxJQUFJLFNBQStCLFlBQVk7RUFDN0MsY0FBYyxLQUNaLE1BQ0MsWUFBWTtHQUNYLFFBQVEsYUFBYSxNQUFNO0dBQzNCLFFBQVEsYUFBYTtHQUNyQixRQUFRLE9BQU87RUFDakIsR0FDQSxpQkFDTSxRQUFRLElBQUksQ0FDcEI7Q0FDRixDQUFDLFNBQ0csSUFDUjtBQUNGO0FBRUEsU0FBUyxnQkFBZ0IsVUFBOEY7Q0FDckgsTUFBTSxhQUFhLFNBQVMsRUFBRSxFQUFFO0NBQ2hDLE1BQU0sV0FBVyxLQUFLLElBQUksR0FBRyxXQUFXLFVBQVUsR0FBRyxZQUFZLFVBQVUsQ0FBQztDQUM1RSxNQUFNLE9BQU8sZUFBZSxTQUFTLE1BQU07Q0FDM0MsTUFBTSxTQUFTLFNBQVMsY0FBYyxRQUFRO0NBQzlDLE9BQU8sUUFBUTtDQUNmLE9BQU8sU0FBUyxXQUFXO0NBQzNCLE1BQU0sVUFBVSxPQUFPLFdBQVcsSUFBSTtDQUN0QyxJQUFJLENBQUMsU0FBUyxNQUFNLElBQUksTUFBTSxzQ0FBc0M7Q0FFcEUsS0FBSyxJQUFJLE1BQU0sR0FBRyxNQUFNLE1BQU0sT0FBTyxHQUFHO0VBQ3RDLE1BQU0sUUFBUyxTQUFTLEtBQUssSUFBSSxLQUFLLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTO0VBQ3RFLElBQUksT0FBTyxRQUFRLFVBQVUsT0FBTyxHQUFHLE1BQU0sVUFBVSxVQUFVLFFBQVE7Q0FDM0U7Q0FFQSxPQUFPO0VBQUU7RUFBUSxjQUFjLFNBQVM7RUFBUTtDQUFLO0FBQ3ZEO0FBRUEsU0FBUyxtQkFBbUIsU0FBOEI7Q0FDeEQsUUFBUSxhQUFhLE1BQU07Q0FDM0IsUUFBUSxhQUFhO0NBQ3JCLFFBQVEsUUFBUSxNQUFNO0NBQ3RCLFFBQVEsUUFBUSxNQUFNO0FBQ3hCO0FBRUEsU0FBUywwQkFBb0M7Q0FDM0MsSUFBSTtFQUNGLE1BQU0sV0FBVyxLQUFLLE1BQU0sbUJBQW1CO0VBQy9DLE1BQU0sT0FBTyxTQUFTLE9BQU8sTUFBTSxVQUFVLE1BQU0sU0FBUyxXQUFXLFdBQVc7RUFDbEYsTUFBTSxRQUFRLE1BQU0sYUFBYSxNQUFNLE9BQU8sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDO0VBQzdELE9BQU8sQ0FBQyxHQUFHLElBQUksSUFBSSxNQUFNLFFBQVEsU0FBeUIsT0FBTyxTQUFTLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO0NBQ3pHLFFBQVE7RUFDTixPQUFPLENBQUMsdUJBQXVCO0NBQ2pDO0FBQ0Y7QUFFQSxJQUFJO0FBRUosU0FBUyxjQUFzQjtDQUM3QixJQUFJLE9BQU8sV0FBVyxhQUFhLE9BQU87Q0FDMUMsTUFBTSxTQUFTLE9BQU8sU0FBUztDQUMvQixJQUFJLG1CQUFtQixPQUFPLFFBQVEsbUJBQW1CLENBQUMsUUFBUSxjQUFjLElBQUksZ0JBQWdCLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksVUFBVTtDQUNySSxPQUFPLGlCQUFpQjtBQUMxQjtBQUVBLFNBQVMsV0FBVyxHQUFXLEdBQW1CO0NBQ2hELE1BQU0sS0FBSyxLQUFLLE1BQU0sQ0FBQztDQUN2QixNQUFNLEtBQUssS0FBSyxNQUFNLENBQUM7Q0FDdkIsTUFBTSxLQUFLLFNBQVMsSUFBSSxFQUFFO0NBQzFCLE1BQU0sS0FBSyxTQUFTLElBQUksRUFBRTtDQUMxQixNQUFNLElBQUksWUFBWSxJQUFJLEVBQUU7Q0FDNUIsTUFBTSxJQUFJLFlBQVksS0FBSyxHQUFHLEVBQUU7Q0FDaEMsTUFBTSxJQUFJLFlBQVksSUFBSSxLQUFLLENBQUM7Q0FDaEMsTUFBTSxJQUFJLFlBQVksS0FBSyxHQUFHLEtBQUssQ0FBQztDQUNwQyxPQUFPLE1BQU0sVUFBVSxLQUFLLE1BQU0sVUFBVSxLQUFLLEdBQUcsR0FBRyxFQUFFLEdBQUcsTUFBTSxVQUFVLEtBQUssR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQ2hHO0FBRUEsU0FBUyxZQUFZLEdBQVcsR0FBbUI7Q0FDakQsTUFBTSxPQUFPLFlBQVksSUFBSTtDQUM3QixPQUFPLE1BQU0sS0FBSyxJQUFJLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxJQUFJLGFBQWE7QUFDckU7QUFFQSxTQUFTLFdBQVcsT0FBZSxPQUFlLE9BQXVCO0NBQ3ZFLElBQUksVUFBVSxPQUFPLE9BQU8sUUFBUSxRQUFRLElBQUk7Q0FDaEQsT0FBTyxTQUFTLE1BQU0sVUFBVSxPQUFPLFFBQVEsVUFBVSxRQUFRLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDaEY7QUFFQSxTQUFTLFNBQVMsT0FBdUI7Q0FDdkMsT0FBTyxRQUFRLFNBQVMsSUFBSSxJQUFJO0FBQ2xDO0FBRUEsU0FBUyxRQUFRLE9BQXVCO0NBQ3RDLE9BQU8sTUFBTSxVQUFVLE1BQU0sT0FBTyxHQUFHLENBQUM7QUFDMUM7QUFFQSxTQUFTLE9BQU8sT0FBdUI7Q0FDckMsT0FBTyxLQUFLLE1BQU0sUUFBUSxHQUFJLElBQUk7QUFDcEM7QUFFQSxTQUFTLE1BQU0sT0FBdUI7Q0FDcEMsT0FBTyxRQUFRLEtBQUssTUFBTSxLQUFLO0FBQ2pDO0FBRUEsU0FBUyxXQUFXLE9BQThDO0NBQ2hFLElBQUksQ0FBQyxPQUFPLE9BQU87Q0FDbkIsSUFBSSxnQkFBZ0IsT0FBTyxPQUFPLE1BQU07Q0FDeEMsSUFBSSxrQkFBa0IsT0FBTyxPQUFPLE1BQU07Q0FDMUMsSUFBSSxXQUFXLE9BQU8sT0FBTyxPQUFPLE1BQU0sVUFBVSxXQUFXLE1BQU0sUUFBUSxNQUFNLE1BQU0sUUFBUTtDQUNqRyxPQUFPO0FBQ1Q7QUFFQSxTQUFTLFlBQVksT0FBOEM7Q0FDakUsSUFBSSxDQUFDLE9BQU8sT0FBTztDQUNuQixJQUFJLGlCQUFpQixPQUFPLE9BQU8sTUFBTTtDQUN6QyxJQUFJLG1CQUFtQixPQUFPLE9BQU8sTUFBTTtDQUMzQyxJQUFJLFlBQVksT0FBTyxPQUFPLE9BQU8sTUFBTSxXQUFXLFdBQVcsTUFBTSxTQUFTLE1BQU0sT0FBTyxRQUFRO0NBQ3JHLE9BQU87QUFDVDtBQUVBLFNBQVMsZUFBZSxPQUF1QjtDQUM3QyxJQUFJLFFBQVE7Q0FDWixPQUFPLFFBQVEsT0FBTyxTQUFTO0NBQy9CLE9BQU87QUFDVDtBQUVBLFNBQVMsb0JBQXlDO0NBQ2hELE1BQU0sT0FBTztDQUNiLE1BQU0sU0FBUyxTQUFTLGNBQWMsUUFBUTtDQUM5QyxPQUFPLFFBQVE7Q0FDZixPQUFPLFNBQVM7Q0FDaEIsTUFBTSxVQUFVLE9BQU8sV0FBVyxJQUFJO0NBQ3RDLElBQUksQ0FBQyxTQUFTLE1BQU0sSUFBSSxNQUFNLHdDQUF3QztDQUV0RSxRQUFRLFlBQVksUUFBUTtDQUM1QixRQUFRLFNBQVMsR0FBRyxHQUFHLE1BQU0sSUFBSTtDQUNqQyxRQUFRLFlBQVk7Q0FDcEIsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHO0VBQy9CLE1BQU0sSUFBSyxJQUFJLEtBQU07RUFDckIsTUFBTSxJQUFLLElBQUksTUFBTztFQUN0QixRQUFRLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQztDQUM3QjtDQUNBLFFBQVEsY0FBYztDQUN0QixRQUFRLFlBQVk7Q0FDcEIsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxHQUFHLEtBQUssSUFBSTtFQUN6QyxRQUFRLFVBQVU7RUFDbEIsUUFBUSxPQUFPLEdBQUcsQ0FBQztFQUNuQixRQUFRLE9BQU8sTUFBTSxJQUFJLE9BQU8sR0FBSTtFQUNwQyxRQUFRLE9BQU87Q0FDakI7Q0FDQSxRQUFRLFlBQVk7Q0FDcEIsS0FBSyxJQUFJLElBQUksR0FBRyxJQUFJLElBQUksS0FBSyxHQUFHO0VBQzlCLE1BQU0sSUFBSyxJQUFJLE1BQU87RUFDdEIsTUFBTSxJQUFLLElBQUksTUFBTztFQUN0QixRQUFRLFVBQVU7RUFDbEIsUUFBUSxRQUFRLEdBQUcsR0FBRyxHQUFHLEtBQU0sSUFBSSxJQUFLLEtBQU0sR0FBRyxLQUFLLEtBQUssQ0FBQztFQUM1RCxRQUFRLEtBQUs7Q0FDZjtDQUVBLE1BQU0sVUFBVSxJQUFJLE1BQU0sY0FBYyxNQUFNO0NBQzlDLFFBQVEsYUFBYSxNQUFNO0NBQzNCLE9BQU87QUFDVCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJUZXJyYWluLnRzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB0ZXJyYWluQ29udHJhY3RUZXh0IGZyb20gJy4uLy4uL2Fzc2V0cy9sYXllci1jb250cmFjdHMvbTEtY29yZS5sYXllci1jb250cmFjdC52MS5qc29uP3Jhdyc7XG5pbXBvcnQgeyBsb2FkR2VuZXJhdGVkVGV4dHVyZSB9IGZyb20gJy4uL2Fzc2V0cy9nZW5lcmF0ZWQnO1xuaW1wb3J0IHsgcGFsZXR0ZSB9IGZyb20gJy4uL2Fzc2V0cy9wYWxldHRlJztcbmltcG9ydCB7IGFzc2V0U2xvdHMsIHRhZ1BsYWNlaG9sZGVyLCB0eXBlIFBsYWNlaG9sZGVyRmFjdG9yeSB9IGZyb20gJy4uL2Fzc2V0cy9zbG90cyc7XG5pbXBvcnQgeyBSZW5kZXJMYXllcnMgfSBmcm9tICcuLi9jb3JlL1JlbmRlckxheWVycyc7XG5pbXBvcnQgeyBCYWxhbmNlIH0gZnJvbSAnLi4vZ2FtZS9CYWxhbmNlJztcbmltcG9ydCB7IHBlcmZvcm1hbmNlVGllckRpYWdub3N0aWNzIH0gZnJvbSAnLi4vZ2FtZS9QZXJmb3JtYW5jZVRpZXInO1xuaW1wb3J0IHtcbiAgYWN0aXZlVGlsZURlc2NyaXB0b3IsXG4gIGFjdGl2ZVdhdGVyRGVzY3JpcHRvcixcbiAgYWN0aXZlQ29udHJhY3QsXG4gIHR5cGUgQ29udHJhY3RBdXRob3JlZFRlcnJhaW5MYXllcixcbiAgdHlwZSBDb250cmFjdEdyYXZlbEJhcixcbiAgdHlwZSBDb250cmFjdE1hbmlmZXN0LFxuICB0eXBlIENvbnRyYWN0V2F0ZXJNYXNrLFxuICB0eXBlIENvbnRyYWN0V2F0ZXJNYXNrUmVnaW9uLFxuICB0eXBlIENvbnRyYWN0V2F0ZXJab25lLFxuICB0eXBlIENvbnRyYWN0U3Rha2VNYXJrZXIsXG4gIHR5cGUgQ29udHJhY3RXYXRlclNvdXJjZSxcbn0gZnJvbSAnLi4vbWV0YS9Db250cmFjdEZhbWlsaWVzJztcbmltcG9ydCB7IGhhc0VsZXZhdGlvblRpbGUsIGlzVHJhdmVyc2FibGUgYXMgaXNTaW1UcmF2ZXJzYWJsZSwgc2ltSGVpZ2h0IH0gZnJvbSAnLi4vc2ltL1RpbGVIZWlnaHQnO1xuaW1wb3J0IHsgbm9ybWFsaXplU2VlZCB9IGZyb20gJy4uL2NvcmUvUm5nJztcbmltcG9ydCB7IGRpc3Bvc2VPYmplY3QzRCB9IGZyb20gJy4uL3V0aWxzL2Rpc3Bvc2UnO1xuaW1wb3J0IHsgY3JlYXRlQ29udGludW91c0dyb3VuZE1lc2gsIHR5cGUgQ29udGludW91c0dyb3VuZE1lc2hTdGF0cyB9IGZyb20gJy4vQ29udGludW91c0dyb3VuZE1lc2gnO1xuaW1wb3J0IHsgYmxvY2tlckNvbnRhaW5zLCBsYW5kbWFya0Jsb2NrZXJzRm9yLCB0eXBlIExhbmRtYXJrQmxvY2tlciB9IGZyb20gJy4vTGFuZG1hcmtDb2xsaXNpb24nO1xuaW1wb3J0IHsgY3JlYXRlQ2xhaW1Qcm9wcyB9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtcbiAgY3JlYXRlRm9yZFN0b25lcyxcbiAgY3JlYXRlTGl2aW5nV2F0ZXJNYXRlcmlhbCxcbiAgZHJ5V2F0ZXJEaWFnbm9zdGljcyxcbiAgdXBkYXRlV2F0ZXJNYXRlcmlhbCxcbiAgd2F0ZXJEaWFnbm9zdGljcyxcbiAgdHlwZSBXYXRlckRpYWdub3N0aWNzLFxufSBmcm9tICcuL1dhdGVyJztcblxuZXhwb3J0IHR5cGUgVGVycmFpblpvbmUgPSAnYmFuaycgfCAnc2hhbGxvd3MnIHwgJ3JpdmVyJyB8ICdmb3JkJyB8ICdvdXQnO1xuXG5leHBvcnQgdHlwZSBWZWMyID0ge1xuICB4OiBudW1iZXI7XG4gIHo6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIFRlcnJhaW5TYW1wbGUgPSB7XG4gIHdhbGthYmxlOiBib29sZWFuO1xuICBzcGVlZE11bDogbnVtYmVyO1xuICB6b25lOiBUZXJyYWluWm9uZTtcbiAgd2F0ZXJTb3VyY2U/OiAncml2ZXInIHwgJ3NwcmluZ19wb25kJztcbiAgd2F0ZXJEZXB0aD86IG51bWJlcjtcbiAgd2F0ZXJDbGFzcz86ICd3YWRlJyB8ICdkZWVwJztcbn07XG5cbmV4cG9ydCB0eXBlIFRlcnJhaW5GZWF0dXJlU2FtcGxlID0ge1xuICBndWxseTogbnVtYmVyO1xuICBzaGVsZjogbnVtYmVyO1xuICBibHVmZjogbnVtYmVyO1xuICBwb2NrZXQ6IG51bWJlcjtcbiAgcm91dGVNYXNrOiBudW1iZXI7XG4gIGNhbG1NYXNrOiBudW1iZXI7XG4gIGhlaWdodE9mZnNldDogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgVGVycmFpbkJvdW5kcyA9IHtcbiAgbWluWDogbnVtYmVyO1xuICBtYXhYOiBudW1iZXI7XG4gIG1pblo6IG51bWJlcjtcbiAgbWF4WjogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgRm9yZFJhbmdlID0ge1xuICBpZDogc3RyaW5nO1xuICBtaW5YOiBudW1iZXI7XG4gIG1heFg6IG51bWJlcjtcbiAgY2VudGVyWDogbnVtYmVyO1xuICBoYWxmV2lkdGg6IG51bWJlcjtcbn07XG5cbmNvbnN0IEFDVElWRV9DT05UUkFDVCA9IGFjdGl2ZUNvbnRyYWN0KCk7XG5jb25zdCBMQU5ETUFSS19CTE9DS0VSUyA9IGxhbmRtYXJrQmxvY2tlcnNGb3IoQUNUSVZFX0NPTlRSQUNULmlkKTtcbmNvbnN0IEFDVElWRV9USUxFID0gYWN0aXZlVGlsZURlc2NyaXB0b3IoKTtcbmNvbnN0IFRJTEVfV0FURVIgPSBhY3RpdmVXYXRlckRlc2NyaXB0b3IoKTtcbmV4cG9ydCBjb25zdCBERUZBVUxUX0NMQUlNX1NJWkUgPSA2NDtcbmV4cG9ydCBjb25zdCBDTEFJTV9TSVpFID0gQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMuc2l6ZSA/PyBERUZBVUxUX0NMQUlNX1NJWkU7XG5leHBvcnQgY29uc3QgQ0xBSU1fSEFMRiA9IENMQUlNX1NJWkUgLyAyO1xuZXhwb3J0IGNvbnN0IENMQUlNX1dJRFRIID0gQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMuZGltZW5zaW9ucz8ud2lkdGggPz8gQ0xBSU1fU0laRTtcbmV4cG9ydCBjb25zdCBDTEFJTV9IRUlHSFQgPSBBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy5kaW1lbnNpb25zPy5oZWlnaHQgPz8gQ0xBSU1fU0laRTtcbmV4cG9ydCBjb25zdCBDTEFJTV9IQUxGX1ggPSBDTEFJTV9XSURUSCAvIDI7XG5leHBvcnQgY29uc3QgQ0xBSU1fSEFMRl9aID0gQ0xBSU1fSEVJR0hUIC8gMjtcbmV4cG9ydCBjb25zdCBSSVZFUl9NSU5fWiA9IFRJTEVfV0FURVI/LmNlbnRlclogIT09IHVuZGVmaW5lZCAmJiBUSUxFX1dBVEVSLmhhbGZXaWR0aCAhPT0gdW5kZWZpbmVkXG4gID8gVElMRV9XQVRFUi5jZW50ZXJaIC0gVElMRV9XQVRFUi5oYWxmV2lkdGhcbiAgOiAtNTtcbmV4cG9ydCBjb25zdCBSSVZFUl9NQVhfWiA9IFRJTEVfV0FURVI/LmNlbnRlclogIT09IHVuZGVmaW5lZCAmJiBUSUxFX1dBVEVSLmhhbGZXaWR0aCAhPT0gdW5kZWZpbmVkXG4gID8gVElMRV9XQVRFUi5jZW50ZXJaICsgVElMRV9XQVRFUi5oYWxmV2lkdGhcbiAgOiA1O1xuZXhwb3J0IGNvbnN0IEZPUkRfTUlOX1ggPSAtMztcbmV4cG9ydCBjb25zdCBGT1JEX01BWF9YID0gMztcbmV4cG9ydCBjb25zdCBTSEFMTE9XU19XSURUSCA9IDEuMjU7XG5leHBvcnQgY29uc3QgV0FURVJfWSA9IDAuMDI1O1xuZXhwb3J0IGNvbnN0IFZJU1RBX1JBRElVUyA9IDkwO1xuXG5jb25zdCBFTEVWQVRJT05fVElMRSA9IGhhc0VsZXZhdGlvblRpbGUoKTtcbmNvbnN0IEFVVEhPUkVEX1RFUlJBSU4gPSBBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy5hdXRob3JlZFRlcnJhaW47XG5sZXQgZWRpdG9yUHJldmlld0FjdGl2ZSA9IGZhbHNlO1xubGV0IGVkaXRvclByZXZpZXdUZXJyYWluOiBDb250cmFjdEF1dGhvcmVkVGVycmFpbkxheWVyIHwgdW5kZWZpbmVkO1xubGV0IGVkaXRvclByZXZpZXdDb250cmFjdDogQ29udHJhY3RNYW5pZmVzdCB8IG51bGwgPSBudWxsO1xubGV0IHJlZnJlc2hFZGl0b3JQcmV2aWV3OiAoKGNvbnRyYWN0OiBDb250cmFjdE1hbmlmZXN0KSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xubGV0IHJ1bnRpbWVWaXN1YWxIZWlnaHRTb3VyY2U6ICgoeDogbnVtYmVyLCB6OiBudW1iZXIpID0+IG51bWJlcikgfCBudWxsID0gbnVsbDtcbmxldCBydW50aW1lUG9pbnRlclN1cmZhY2VzOiBUSFJFRS5PYmplY3QzRFtdIHwgbnVsbCA9IG51bGw7XG5sZXQgZmFsbGJhY2tQb2ludGVyU3VyZmFjZXM6IFRIUkVFLk9iamVjdDNEW10gPSBbXTtcbmNvbnN0IHBvaW50ZXJIaXRzOiBUSFJFRS5JbnRlcnNlY3Rpb25bXSA9IFtdO1xuY29uc3QgcG9pbnRlckZhbGxiYWNrUGxhbmUgPSBuZXcgVEhSRUUuUGxhbmUobmV3IFRIUkVFLlZlY3RvcjMoMCwgMSwgMCksIDApO1xuY29uc3QgV0FURVJfTUFTSyA9IEFDVElWRV9USUxFLndhdGVyTWFzaz8ucmVnaW9ucy5sZW5ndGggPyBBQ1RJVkVfVElMRS53YXRlck1hc2sgOiB1bmRlZmluZWQ7XG5jb25zdCBTUFJJTkdfUE9ORFMgPSBBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy53YXRlclNvdXJjZXMuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5raW5kID09PSAnc3ByaW5nX3BvbmQnKTtcbmNvbnN0IEZPUkRfUkFOR0VTID0gcmVzb2x2ZUZvcmRSYW5nZXMoKTtcbmNvbnN0IERFRkFVTFRfV0FURVJfREVQVEg6IFJlY29yZDxDb250cmFjdFdhdGVyWm9uZSwgbnVtYmVyPiA9IHtcbiAgcml2ZXI6IDEuMjUsXG4gIGZvcmQ6IDAuMzUsXG4gIHNoYWxsb3dzOiAwLjIsXG4gIHNwcmluZ1BvbmQ6IDAuMixcbn07XG5jb25zdCBERUZBVUxUX1dBVEVSX1NQRUVEOiBSZWNvcmQ8Q29udHJhY3RXYXRlclpvbmUsIG51bWJlcj4gPSB7XG4gIHJpdmVyOiAwLjU1LFxuICBmb3JkOiAwLjg1LFxuICBzaGFsbG93czogMC44LFxuICBzcHJpbmdQb25kOiAwLjgsXG59O1xuXG5leHBvcnQgY29uc3QgYm91bmRzOiBUZXJyYWluQm91bmRzID0ge1xuICBtaW5YOiAtQ0xBSU1fSEFMRl9YLFxuICBtYXhYOiBDTEFJTV9IQUxGX1gsXG4gIG1pblo6IC1DTEFJTV9IQUxGX1osXG4gIG1heFo6IENMQUlNX0hBTEZfWixcbn07XG5cbmZ1bmN0aW9uIGRlZmF1bHRGb3JkUmFuZ2UoKTogRm9yZFJhbmdlIHtcbiAgcmV0dXJuIHtcbiAgICBpZDogJ2NlbnRlci1mb3JkJyxcbiAgICBtaW5YOiBGT1JEX01JTl9YLFxuICAgIG1heFg6IEZPUkRfTUFYX1gsXG4gICAgY2VudGVyWDogKEZPUkRfTUlOX1ggKyBGT1JEX01BWF9YKSAvIDIsXG4gICAgaGFsZldpZHRoOiAoRk9SRF9NQVhfWCAtIEZPUkRfTUlOX1gpIC8gMixcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUZvcmRSYW5nZXMoKTogRm9yZFJhbmdlW10ge1xuICBpZiAoIUFDVElWRV9DT05UUkFDVC50aWxlUGFyYW1zLmZvcmQpIHJldHVybiBbXTtcbiAgY29uc3QgcmFuZ2VzID0gQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMuZm9yZHMgPz8gW107XG4gIGlmIChyYW5nZXMubGVuZ3RoID09PSAwKSByZXR1cm4gW2RlZmF1bHRGb3JkUmFuZ2UoKV07XG4gIHJldHVybiByYW5nZXMubWFwKChyYW5nZSkgPT4gKHtcbiAgICBpZDogcmFuZ2UuaWQsXG4gICAgbWluWDogcmFuZ2UueCAtIHJhbmdlLmhhbGZXaWR0aCxcbiAgICBtYXhYOiByYW5nZS54ICsgcmFuZ2UuaGFsZldpZHRoLFxuICAgIGNlbnRlclg6IHJhbmdlLngsXG4gICAgaGFsZldpZHRoOiByYW5nZS5oYWxmV2lkdGgsXG4gIH0pKTtcbn1cblxuZnVuY3Rpb24gZm9yZEF0KHg6IG51bWJlciwgejogbnVtYmVyKTogRm9yZFJhbmdlIHwgbnVsbCB7XG4gIGlmICh6IDwgUklWRVJfTUlOX1ogfHwgeiA+IFJJVkVSX01BWF9aKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIEZPUkRfUkFOR0VTLmZpbmQoKHJhbmdlKSA9PiB4ID49IHJhbmdlLm1pblggJiYgeCA8PSByYW5nZS5tYXhYKSA/PyBudWxsO1xufVxuXG5jb25zdCBERUZBVUxUX05PREVfQU5DSE9SUzogVmVjMltdID0gW1xuICB7IHg6IC0yMiwgejogLTYuOCB9LFxuICB7IHg6IC05LCB6OiA2LjcgfSxcbiAgeyB4OiAtMS41LCB6OiAtNi40IH0sXG4gIHsgeDogNy41LCB6OiA2LjUgfSxcbiAgeyB4OiAxOCwgejogLTcgfSxcbiAgeyB4OiAyNSwgejogNi45IH0sXG5dO1xuZXhwb3J0IGNvbnN0IG5vZGVBbmNob3JzOiBWZWMyW10gPSBBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy5oYXJ2ZXN0QW5jaG9ycyA/PyBERUZBVUxUX05PREVfQU5DSE9SUztcblxuZXhwb3J0IGZ1bmN0aW9uIHNhbXBsZSh4OiBudW1iZXIsIHo6IG51bWJlcik6IFRlcnJhaW5TYW1wbGUge1xuICBpZiAoeCA8IGJvdW5kcy5taW5YIHx8IHggPiBib3VuZHMubWF4WCB8fCB6IDwgYm91bmRzLm1pblogfHwgeiA+IGJvdW5kcy5tYXhaKSB7XG4gICAgcmV0dXJuIHsgd2Fsa2FibGU6IGZhbHNlLCBzcGVlZE11bDogMCwgem9uZTogJ291dCcgfTtcbiAgfVxuICBpZiAoRUxFVkFUSU9OX1RJTEUgJiYgIWlzU2ltVHJhdmVyc2FibGUoeCwgeikpIHJldHVybiB7IHdhbGthYmxlOiBmYWxzZSwgc3BlZWRNdWw6IDAsIHpvbmU6ICdvdXQnIH07XG4gIGNvbnN0IGxhbmRtYXJrQmxvY2tlZCA9IExBTkRNQVJLX0JMT0NLRVJTLnNvbWUoKGJsb2NrZXIpID0+IGJsb2NrZXJDb250YWlucyhibG9ja2VyLCB4LCB6LCBCYWxhbmNlLmhlcm8ucmFkaXVzICsgMC4wOCkpO1xuICBjb25zdCB3aXRoTGFuZG1hcmtDb2xsaXNpb24gPSAodGVycmFpbjogVGVycmFpblNhbXBsZSk6IFRlcnJhaW5TYW1wbGUgPT4gbGFuZG1hcmtCbG9ja2VkXG4gICAgPyB7IC4uLnRlcnJhaW4sIHdhbGthYmxlOiBmYWxzZSwgc3BlZWRNdWw6IDAgfVxuICAgIDogdGVycmFpbjtcblxuICBjb25zdCBzcHJpbmcgPSBzcHJpbmdQb25kQXQoeCwgeik7XG4gIGlmIChzcHJpbmcpIHJldHVybiB3aXRoTGFuZG1hcmtDb2xsaXNpb24od2F0ZXJTYW1wbGUoJ3NoYWxsb3dzJywgJ3NwcmluZ1BvbmQnLCAnc3ByaW5nX3BvbmQnKSk7XG5cbiAgaWYgKFdBVEVSX01BU0spIHtcbiAgICBjb25zdCByZWdpb24gPSBXQVRFUl9NQVNLLnJlZ2lvbnMuZmluZCgoY2FuZGlkYXRlKSA9PiBkaXN0YW5jZVRvV2F0ZXJNYXNrUmVnaW9uKHgsIHosIGNhbmRpZGF0ZSkgPD0gMCk7XG4gICAgcmV0dXJuIHdpdGhMYW5kbWFya0NvbGxpc2lvbihyZWdpb24gPyB3YXRlclNhbXBsZShyZWdpb24uem9uZSwgcmVnaW9uLnpvbmUsICdyaXZlcicpIDogeyB3YWxrYWJsZTogdHJ1ZSwgc3BlZWRNdWw6IDEsIHpvbmU6ICdiYW5rJyB9KTtcbiAgfVxuXG4gIGlmICghQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMucml2ZXIpIHJldHVybiB3aXRoTGFuZG1hcmtDb2xsaXNpb24oeyB3YWxrYWJsZTogdHJ1ZSwgc3BlZWRNdWw6IDEsIHpvbmU6ICdiYW5rJyB9KTtcblxuICBjb25zdCBpbkZvcmQgPSBmb3JkQXQoeCwgeikgIT09IG51bGw7XG4gIGlmIChBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy5mb3JkICYmIGluRm9yZCkgcmV0dXJuIHdpdGhMYW5kbWFya0NvbGxpc2lvbih3YXRlclNhbXBsZSgnZm9yZCcsICdmb3JkJywgJ3JpdmVyJykpO1xuXG4gIGNvbnN0IGluUml2ZXIgPSB6ID49IFJJVkVSX01JTl9aICYmIHogPD0gUklWRVJfTUFYX1o7XG4gIGlmIChpblJpdmVyKSByZXR1cm4gd2l0aExhbmRtYXJrQ29sbGlzaW9uKHdhdGVyU2FtcGxlKCdyaXZlcicsICdyaXZlcicsICdyaXZlcicpKTtcblxuICBjb25zdCBpblNoYWxsb3dzID1cbiAgICAoeiA+IFJJVkVSX01BWF9aICYmIHogPD0gUklWRVJfTUFYX1ogKyBTSEFMTE9XU19XSURUSCkgfHxcbiAgICAoeiA8IFJJVkVSX01JTl9aICYmIHogPj0gUklWRVJfTUlOX1ogLSBTSEFMTE9XU19XSURUSCk7XG4gIGlmIChpblNoYWxsb3dzKSByZXR1cm4gd2l0aExhbmRtYXJrQ29sbGlzaW9uKHdhdGVyU2FtcGxlKCdzaGFsbG93cycsICdzaGFsbG93cycsICdyaXZlcicpKTtcblxuICByZXR1cm4gd2l0aExhbmRtYXJrQ29sbGlzaW9uKHsgd2Fsa2FibGU6IHRydWUsIHNwZWVkTXVsOiAxLCB6b25lOiAnYmFuaycgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsYW5kbWFya0Jsb2NrZXJzKCk6IHJlYWRvbmx5IExhbmRtYXJrQmxvY2tlcltdIHtcbiAgcmV0dXJuIExBTkRNQVJLX0JMT0NLRVJTO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2F0ZXJEZXB0aCh6b25lOiBDb250cmFjdFdhdGVyWm9uZSk6IG51bWJlciB7XG4gIHJldHVybiBUSUxFX1dBVEVSPy5kZXB0aHM/Llt6b25lXSA/PyBERUZBVUxUX1dBVEVSX0RFUFRIW3pvbmVdO1xufVxuXG5mdW5jdGlvbiB3YXRlclNwZWVkTXVsKHpvbmU6IENvbnRyYWN0V2F0ZXJab25lKTogbnVtYmVyIHtcbiAgcmV0dXJuIFRJTEVfV0FURVI/LnNwZWVkTXVsPy5bem9uZV0gPz8gREVGQVVMVF9XQVRFUl9TUEVFRFt6b25lXTtcbn1cblxuZnVuY3Rpb24gd2F0ZXJTYW1wbGUoem9uZTogRXhjbHVkZTxUZXJyYWluWm9uZSwgJ2JhbmsnIHwgJ291dCc+LCBkZXB0aFpvbmU6IENvbnRyYWN0V2F0ZXJab25lLCB3YXRlclNvdXJjZTogJ3JpdmVyJyB8ICdzcHJpbmdfcG9uZCcpOiBUZXJyYWluU2FtcGxlIHtcbiAgY29uc3QgZGVwdGggPSB3YXRlckRlcHRoKGRlcHRoWm9uZSk7XG4gIGNvbnN0IGRlZXAgPSBkZXB0aCA+PSBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoO1xuICBjb25zdCB3YWxrYWJsZSA9IGRlcHRoIDw9IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGggfHwgKGRlZXAgJiYgVElMRV9XQVRFUj8uaGVyb0NhbldhZGVEZWVwID09PSB0cnVlICYmIEFDVElWRV9USUxFLmlkID09PSAnZnJvbnRpZXItcml2ZXItY2xhaW0nKTtcbiAgcmV0dXJuIHtcbiAgICB3YWxrYWJsZSxcbiAgICBzcGVlZE11bDogd2Fsa2FibGUgPyB3YXRlclNwZWVkTXVsKGRlcHRoWm9uZSkgOiAwLFxuICAgIHpvbmUsXG4gICAgd2F0ZXJTb3VyY2UsXG4gICAgd2F0ZXJEZXB0aDogZGVwdGgsXG4gICAgd2F0ZXJDbGFzczogZGVlcCA/ICdkZWVwJyA6ICd3YWRlJyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwYXduRWRnZXMoKTogVmVjMltdIHtcbiAgcmV0dXJuIFtcbiAgICB7IHg6IDAsIHo6IGJvdW5kcy5taW5aIH0sXG4gICAgeyB4OiAwLCB6OiBib3VuZHMubWF4WiB9LFxuICAgIHsgeDogYm91bmRzLm1heFgsIHo6IDAgfSxcbiAgICB7IHg6IGJvdW5kcy5taW5YLCB6OiAwIH0sXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1aWxkYWJsZSh4OiBudW1iZXIsIHo6IG51bWJlcik6IGJvb2xlYW4ge1xuICBjb25zdCB0ZXJyYWluID0gc2FtcGxlKHgsIHopO1xuICBpZiAoIXRlcnJhaW4ud2Fsa2FibGUgfHwgdGVycmFpbi56b25lICE9PSAnYmFuaycpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgem9uZXMgPSBBQ1RJVkVfQ09OVFJBQ1QudGlsZVBhcmFtcy5idWlsZFpvbmVzID8/IFtdO1xuICByZXR1cm4gem9uZXMubGVuZ3RoID09PSAwIHx8IHpvbmVzLnNvbWUoKHpvbmUpID0+IHggPj0gem9uZS5taW5YICYmIHggPD0gem9uZS5tYXhYICYmIHogPj0gem9uZS5taW5aICYmIHogPD0gem9uZS5tYXhaKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJpdmVyR2VvbWV0cnkoKTogeyBtaW5YOiBudW1iZXI7IG1heFg6IG51bWJlcjsgbWluWjogbnVtYmVyOyBtYXhaOiBudW1iZXIgfSB7XG4gIHJldHVybiB7XG4gICAgbWluWDogYm91bmRzLm1pblgsXG4gICAgbWF4WDogYm91bmRzLm1heFgsXG4gICAgbWluWjogUklWRVJfTUlOX1osXG4gICAgbWF4WjogUklWRVJfTUFYX1osXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXRlclNvdXJjZXMoKTogcmVhZG9ubHkgQ29udHJhY3RXYXRlclNvdXJjZVtdIHtcbiAgcmV0dXJuIFNQUklOR19QT05EUztcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHk6IHRoZSBoYWxmIHdpZHRoIG9mIHRoZSB0aWxlJ3MgREVDTEFSRUQgdmlzdWFsIHdhdGVyIGJhbmQsIHRoZSBzYW1lXG4gKiBudW1iZXIgdGhlIHBhaW50ZWQgcml2ZXIgcmliYm9uIGlzIGN1dCB0by4gRXhwb3J0ZWQgc28gYSBzY3VscHRlZCBtYXAgY2FuIGxheVxuICogaXRzIG93biB3YXRlciBzdXJmYWNlIHRvIHRoZSBpZGVudGljYWwgd2lkdGggd2l0aG91dCBkdXBsaWNhdGluZyB0aGUgZmFsbGJhY2tcbiAqIHJ1bGUuIFJlYWRzIHNpbSBkZWNsYXJhdGlvbnM7IHdyaXRlcyBub3RoaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmlzdWFsV2F0ZXJIYWxmV2lkdGgoKTogbnVtYmVyIHtcbiAgcmV0dXJuIHZpc3VhbFdhdGVyV2lkdGgoKSAvIDI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXRlck1hc2soKTogQ29udHJhY3RXYXRlck1hc2sgfCB1bmRlZmluZWQge1xuICByZXR1cm4gV0FURVJfTUFTSztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ3Jvc3NpbmdTdHJ1Y3R1cmUoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBib29sZWFuIHtcbiAgaWYgKChUSUxFX1dBVEVSPy5ncmF2ZWxCYXJzID8/IFtdKS5zb21lKChiYXIpID0+IGdyYXZlbEJhckNvbnRhaW5zKGJhciwgeCwgeikpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKFdBVEVSX01BU0spIHtcbiAgICByZXR1cm4gV0FURVJfTUFTSy5yZWdpb25zLnNvbWUoKHJlZ2lvbikgPT4gcmVnaW9uLnpvbmUgPT09ICdmb3JkJyAmJiBkaXN0YW5jZVRvV2F0ZXJNYXNrUmVnaW9uKHgsIHosIHJlZ2lvbikgPD0gMCk7XG4gIH1cbiAgcmV0dXJuIEFDVElWRV9DT05UUkFDVC50aWxlUGFyYW1zLmZvcmQgPT09IHRydWUgJiYgZm9yZEF0KHgsIHopICE9PSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JhdmVsQmFyQ29udGFpbnMoYmFyOiBDb250cmFjdEdyYXZlbEJhciwgeDogbnVtYmVyLCB6OiBudW1iZXIpOiBib29sZWFuIHtcbiAgY29uc3QgZHggPSB4IC0gYmFyLng7XG4gIGNvbnN0IGR6ID0geiAtIGJhci56O1xuICBjb25zdCBjb3MgPSBNYXRoLmNvcyhiYXIucm90YXRpb24pO1xuICBjb25zdCBzaW4gPSBNYXRoLnNpbihiYXIucm90YXRpb24pO1xuICBjb25zdCBsb2NhbFggPSBkeCAqIGNvcyArIGR6ICogc2luO1xuICBjb25zdCBsb2NhbFogPSAtZHggKiBzaW4gKyBkeiAqIGNvcztcbiAgcmV0dXJuIChsb2NhbFggLyAoYmFyLmxlbmd0aCAqIDAuNSkpICoqIDIgKyAobG9jYWxaIC8gKGJhci53aWR0aCAqIDAuNSkpICoqIDIgPD0gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcmRSYW5nZXMoKTogcmVhZG9ubHkgRm9yZFJhbmdlW10ge1xuICByZXR1cm4gRk9SRF9SQU5HRVM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuZWFyZXN0Rm9yZFJhbmdlKHg6IG51bWJlcik6IEZvcmRSYW5nZSB7XG4gIGxldCBiZXN0ID0gRk9SRF9SQU5HRVNbMF0gPz8gZGVmYXVsdEZvcmRSYW5nZSgpO1xuICBsZXQgYmVzdERpc3RhbmNlID0gTWF0aC5hYnMoeCAtIGJlc3QuY2VudGVyWCk7XG4gIGZvciAoY29uc3QgcmFuZ2Ugb2YgRk9SRF9SQU5HRVMuc2xpY2UoMSkpIHtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguYWJzKHggLSByYW5nZS5jZW50ZXJYKTtcbiAgICBpZiAoZGlzdGFuY2UgPCBiZXN0RGlzdGFuY2UpIHtcbiAgICAgIGJlc3QgPSByYW5nZTtcbiAgICAgIGJlc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYmVzdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YWtlTWFya2VycygpOiByZWFkb25seSBDb250cmFjdFN0YWtlTWFya2VyW10ge1xuICByZXR1cm4gQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMuc3Rha2VNYXJrZXJzID8/IFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9zc1N0YWtlTWFya2VyKCk6IENvbnRyYWN0U3Rha2VNYXJrZXIgfCBudWxsIHtcbiAgcmV0dXJuIHN0YWtlTWFya2VycygpLmZpbmQoKG1hcmtlcikgPT4gbWFya2VyLmhlcm9TdGFydCkgPz8gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1JpdmVyV2F0ZXIoKTogYm9vbGVhbiB7XG4gIHJldHVybiBXQVRFUl9NQVNLICE9PSB1bmRlZmluZWQgfHwgQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMucml2ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dhdGVyU291cmNlQWRqYWNlbnQoeDogbnVtYmVyLCB6OiBudW1iZXIsIHBhZDogbnVtYmVyKTogYm9vbGVhbiB7XG4gIGNvbnN0IHRlcnJhaW4gPSBzYW1wbGUoeCwgeik7XG4gIGlmICh0ZXJyYWluLnpvbmUgIT09ICdiYW5rJyAmJiB0ZXJyYWluLnpvbmUgIT09ICdzaGFsbG93cycpIHJldHVybiBmYWxzZTtcbiAgaWYgKFdBVEVSX01BU0sgJiYgV0FURVJfTUFTSy5yZWdpb25zLnNvbWUoKHJlZ2lvbikgPT4gZGlzdGFuY2VUb1dhdGVyTWFza1JlZ2lvbih4LCB6LCByZWdpb24pIDw9IHBhZCkpIHJldHVybiB0cnVlO1xuICBpZiAoIVdBVEVSX01BU0sgJiYgQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMucml2ZXIpIHtcbiAgICBjb25zdCByaXZlciA9IHJpdmVyR2VvbWV0cnkoKTtcbiAgICBpZiAoeCA+PSByaXZlci5taW5YICYmIHggPD0gcml2ZXIubWF4WCkge1xuICAgICAgY29uc3QgZGlzdGFuY2UgPSB6IDwgcml2ZXIubWluWiA/IHJpdmVyLm1pblogLSB6IDogeiA+IHJpdmVyLm1heFogPyB6IC0gcml2ZXIubWF4WiA6IDA7XG4gICAgICBpZiAoZGlzdGFuY2UgPD0gcGFkKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFNQUklOR19QT05EUy5zb21lKChzb3VyY2UpID0+IGRpc3RhbmNlVG9TcHJpbmdFZGdlKHgsIHosIHNvdXJjZSkgPD0gcGFkKTtcbn1cblxuZnVuY3Rpb24gZGlzdGFuY2VUb1dhdGVyTWFza1JlZ2lvbih4OiBudW1iZXIsIHo6IG51bWJlciwgcmVnaW9uOiBDb250cmFjdFdhdGVyTWFza1JlZ2lvbik6IG51bWJlciB7XG4gIGlmIChyZWdpb24ua2luZCA9PT0gJ3JlY3QnKSB7XG4gICAgcmV0dXJuIE1hdGguaHlwb3QoTWF0aC5tYXgocmVnaW9uLm1pblggLSB4LCAwLCB4IC0gcmVnaW9uLm1heFgpLCBNYXRoLm1heChyZWdpb24ubWluWiAtIHosIDAsIHogLSByZWdpb24ubWF4WikpO1xuICB9XG5cbiAgbGV0IGRpc3RhbmNlID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgcmVnaW9uLnBvaW50cy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBzdGFydCA9IHJlZ2lvbi5wb2ludHNbaW5kZXggLSAxXSE7XG4gICAgY29uc3QgZW5kID0gcmVnaW9uLnBvaW50c1tpbmRleF0hO1xuICAgIGNvbnN0IGR4ID0gZW5kLnggLSBzdGFydC54O1xuICAgIGNvbnN0IGR6ID0gZW5kLnogLSBzdGFydC56O1xuICAgIGNvbnN0IGxlbmd0aFNxID0gZHggKiBkeCArIGR6ICogZHo7XG4gICAgY29uc3QgdCA9IGxlbmd0aFNxIDw9IEJhbGFuY2Uud2F0ZXJNYXNrLnNlZ21lbnRFcHNpbG9uXG4gICAgICA/IDBcbiAgICAgIDogVEhSRUUuTWF0aFV0aWxzLmNsYW1wKCgoeCAtIHN0YXJ0LngpICogZHggKyAoeiAtIHN0YXJ0LnopICogZHopIC8gbGVuZ3RoU3EsIDAsIDEpO1xuICAgIGRpc3RhbmNlID0gTWF0aC5taW4oZGlzdGFuY2UsIE1hdGguaHlwb3QoeCAtIChzdGFydC54ICsgZHggKiB0KSwgeiAtIChzdGFydC56ICsgZHogKiB0KSkpO1xuICB9XG4gIHJldHVybiBkaXN0YW5jZSAtIHJlZ2lvbi5oYWxmV2lkdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGVIZWlnaHQoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAocnVudGltZVZpc3VhbEhlaWdodFNvdXJjZSkge1xuICAgIHJldHVybiBydW50aW1lVmlzdWFsSGVpZ2h0U291cmNlKFRIUkVFLk1hdGhVdGlscy5jbGFtcCh4LCBib3VuZHMubWluWCwgYm91bmRzLm1heFgpLCBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoeiwgYm91bmRzLm1pblosIGJvdW5kcy5tYXhaKSk7XG4gIH1cbiAgY29uc3QgYmFzZSA9IEVMRVZBVElPTl9USUxFXG4gICAgPyBzaW1IZWlnaHQoeCwgeilcbiAgICA6IHNhbXBsZUhlaWdodEZhbWlseShUSFJFRS5NYXRoVXRpbHMuY2xhbXAoeCwgYm91bmRzLm1pblgsIGJvdW5kcy5tYXhYKSwgVEhSRUUuTWF0aFV0aWxzLmNsYW1wKHosIGJvdW5kcy5taW5aLCBib3VuZHMubWF4WiksIGZhbHNlKTtcbiAgcmV0dXJuIGN1cnJlbnRBdXRob3JlZFRlcnJhaW4oKSA/IGJhc2UgKyBhdXRob3JlZFRlcnJhaW5EZWx0YSh4LCB6KSA6IGJhc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYW1wbGVVbmNsYW1wZWRIZWlnaHQoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAocnVudGltZVZpc3VhbEhlaWdodFNvdXJjZSAmJiB4ID49IGJvdW5kcy5taW5YICYmIHggPD0gYm91bmRzLm1heFggJiYgeiA+PSBib3VuZHMubWluWiAmJiB6IDw9IGJvdW5kcy5tYXhaKSB7XG4gICAgcmV0dXJuIHJ1bnRpbWVWaXN1YWxIZWlnaHRTb3VyY2UoeCwgeik7XG4gIH1cbiAgY29uc3QgYmFzZSA9IEVMRVZBVElPTl9USUxFID8gc2ltSGVpZ2h0KHgsIHopIDogc2FtcGxlSGVpZ2h0RmFtaWx5KHgsIHosIHRydWUpO1xuICByZXR1cm4gY3VycmVudEF1dGhvcmVkVGVycmFpbigpID8gYmFzZSArIGF1dGhvcmVkVGVycmFpbkRlbHRhKHgsIHopIDogYmFzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZpZXdFZGl0b3JDb250cmFjdChjb250cmFjdDogQ29udHJhY3RNYW5pZmVzdCk6IHZvaWQge1xuICBlZGl0b3JQcmV2aWV3QWN0aXZlID0gdHJ1ZTtcbiAgZWRpdG9yUHJldmlld0NvbnRyYWN0ID0gY29udHJhY3Q7XG4gIGVkaXRvclByZXZpZXdUZXJyYWluID0gY29udHJhY3QudGlsZVBhcmFtcy5hdXRob3JlZFRlcnJhaW47XG4gIHJlZnJlc2hFZGl0b3JQcmV2aWV3Py4oY29udHJhY3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0VmlzdWFsR3JvdW5kKHJheWNhc3RlcjogVEhSRUUuUmF5Y2FzdGVyLCBvdXQ6IFRIUkVFLlZlY3RvcjMpOiBib29sZWFuIHtcbiAgcG9pbnRlckhpdHMubGVuZ3RoID0gMDtcbiAgcmF5Y2FzdGVyLmludGVyc2VjdE9iamVjdHMocnVudGltZVBvaW50ZXJTdXJmYWNlcyA/PyBmYWxsYmFja1BvaW50ZXJTdXJmYWNlcywgdHJ1ZSwgcG9pbnRlckhpdHMpO1xuICBjb25zdCBoaXQgPSBwb2ludGVySGl0c1swXTtcbiAgaWYgKGhpdCkgb3V0LmNvcHkoaGl0LnBvaW50KTtcbiAgcG9pbnRlckhpdHMubGVuZ3RoID0gMDtcbiAgcmV0dXJuIGhpdCAhPT0gdW5kZWZpbmVkIHx8IHJheWNhc3Rlci5yYXkuaW50ZXJzZWN0UGxhbmUocG9pbnRlckZhbGxiYWNrUGxhbmUsIG91dCkgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVmlzdWFsSGVpZ2h0U291cmNlKHNvdXJjZTogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXIsIHN1cmZhY2VzOiBUSFJFRS5PYmplY3QzRFtdKTogKCkgPT4gdm9pZCB7XG4gIHJ1bnRpbWVWaXN1YWxIZWlnaHRTb3VyY2UgPSBzb3VyY2U7XG4gIHJ1bnRpbWVQb2ludGVyU3VyZmFjZXMgPSBzdXJmYWNlcztcbiAgcmV0dXJuICgpID0+IHtcbiAgICBpZiAocnVudGltZVZpc3VhbEhlaWdodFNvdXJjZSA9PT0gc291cmNlKSB7XG4gICAgICBydW50aW1lVmlzdWFsSGVpZ2h0U291cmNlID0gbnVsbDtcbiAgICAgIHJ1bnRpbWVQb2ludGVyU3VyZmFjZXMgPSBudWxsO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gYXV0aG9yZWRUZXJyYWluRGVsdGEoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBsYXllciA9IGN1cnJlbnRBdXRob3JlZFRlcnJhaW4oKTtcbiAgaWYgKCFsYXllcikgcmV0dXJuIDA7XG4gIGNvbnN0IGdyaWRYID0gKHggLSBsYXllci5vcmlnaW5YKSAvIGxheWVyLmNlbGxTaXplO1xuICBjb25zdCBncmlkWiA9ICh6IC0gbGF5ZXIub3JpZ2luWikgLyBsYXllci5jZWxsU2l6ZTtcbiAgaWYgKGdyaWRYIDwgMCB8fCBncmlkWiA8IDAgfHwgZ3JpZFggPiBsYXllci5jb2x1bW5zIC0gMSB8fCBncmlkWiA+IGxheWVyLnJvd3MgLSAxKSByZXR1cm4gMDtcblxuICBjb25zdCB4MCA9IE1hdGguZmxvb3IoZ3JpZFgpO1xuICBjb25zdCB6MCA9IE1hdGguZmxvb3IoZ3JpZFopO1xuICBjb25zdCB4MSA9IE1hdGgubWluKHgwICsgMSwgbGF5ZXIuY29sdW1ucyAtIDEpO1xuICBjb25zdCB6MSA9IE1hdGgubWluKHowICsgMSwgbGF5ZXIucm93cyAtIDEpO1xuICBjb25zdCBhdCA9IChjb2x1bW46IG51bWJlciwgcm93OiBudW1iZXIpID0+IGxheWVyLmhlaWdodERlbHRhc1tyb3cgKiBsYXllci5jb2x1bW5zICsgY29sdW1uXSE7XG4gIGNvbnN0IG5vcnRoID0gVEhSRUUuTWF0aFV0aWxzLmxlcnAoYXQoeDAsIHowKSwgYXQoeDEsIHowKSwgZ3JpZFggLSB4MCk7XG4gIGNvbnN0IHNvdXRoID0gVEhSRUUuTWF0aFV0aWxzLmxlcnAoYXQoeDAsIHoxKSwgYXQoeDEsIHoxKSwgZ3JpZFggLSB4MCk7XG4gIHJldHVybiBUSFJFRS5NYXRoVXRpbHMubGVycChub3J0aCwgc291dGgsIGdyaWRaIC0gejApO1xufVxuXG5mdW5jdGlvbiBjdXJyZW50QXV0aG9yZWRUZXJyYWluKCk6IENvbnRyYWN0QXV0aG9yZWRUZXJyYWluTGF5ZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gZWRpdG9yUHJldmlld0FjdGl2ZSA/IGVkaXRvclByZXZpZXdUZXJyYWluIDogQVVUSE9SRURfVEVSUkFJTjtcbn1cblxuZnVuY3Rpb24gY3VycmVudENvbnRyYWN0KCk6IENvbnRyYWN0TWFuaWZlc3Qge1xuICByZXR1cm4gZWRpdG9yUHJldmlld0NvbnRyYWN0ID8/IEFDVElWRV9DT05UUkFDVDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdXRpbmdMYW5lRGlzdGFuY2UoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBmb3JkQXBwcm9hY2ggPSBNYXRoLmFicyh4IC0gbmVhcmVzdEZvcmRSYW5nZSh4KS5jZW50ZXJYKTtcbiAgY29uc3QgY2xhaW1MYW5lID0gTWF0aC5hYnMoeCkgPCAxOCA/IE1hdGguYWJzKHogLSAxMikgOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIHJldHVybiBNYXRoLm1pbihmb3JkQXBwcm9hY2gsIGNsYWltTGFuZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXJyYWluRmVhdHVyZVNhbXBsZSh4OiBudW1iZXIsIHo6IG51bWJlcik6IFRlcnJhaW5GZWF0dXJlU2FtcGxlIHtcbiAgcmV0dXJuIHRlcnJhaW5GZWF0dXJlcyh4LCB6KTtcbn1cblxuZnVuY3Rpb24gc2FtcGxlSGVpZ2h0RmFtaWx5KHg6IG51bWJlciwgejogbnVtYmVyLCB2aXN0YVJpc2U6IGJvb2xlYW4pOiBudW1iZXIge1xuICBjb25zdCBhYnNaID0gTWF0aC5hYnMoeik7XG4gIGNvbnN0IGJhbmtEaXN0YW5jZSA9IE1hdGgubWF4KDAsIGFic1ogLSBSSVZFUl9NQVhfWik7XG4gIGNvbnN0IGJhbmtUID0gc21vb3Roc3RlcCgwLCAxNSwgYmFua0Rpc3RhbmNlKTtcbiAgY29uc3QgdmFsbGV5ID0gVEhSRUUuTWF0aFV0aWxzLmxlcnAoLTAuMTYsIDAuMzYsIGJhbmtUKTtcbiAgY29uc3Qgc291dGhSaXNlID0geiA8IFJJVkVSX01JTl9aID8gc21vb3Roc3RlcCgwLCBDTEFJTV9IQUxGIC0gTWF0aC5hYnMoUklWRVJfTUlOX1opLCBNYXRoLmFicyh6KSAtIE1hdGguYWJzKFJJVkVSX01JTl9aKSkgKiAwLjE0IDogMDtcbiAgY29uc3QgdmlzdGFCYW5rUmlzZSA9IHZpc3RhUmlzZSA/IHNtb290aHN0ZXAoQ0xBSU1fSEFMRiwgVklTVEFfUkFESVVTLCBhYnNaKSAqIDAuNDIgOiAwO1xuICBjb25zdCBjbGFpbUNhbG0gPVxuICAgIHogPiBSSVZFUl9NQVhfWiArIFNIQUxMT1dTX1dJRFRIICYmIHogPCAyMyAmJiBNYXRoLmFicyh4KSA8IDI0XG4gICAgICA/IFRIUkVFLk1hdGhVdGlscy5sZXJwKDAuNDIsIDEsIHNtb290aHN0ZXAoMCwgMjQsIE1hdGguYWJzKHgpKSlcbiAgICAgIDogMTtcbiAgY29uc3Qgcml2ZXJOb2lzZU1hc2sgPSBUSFJFRS5NYXRoVXRpbHMubGVycCgwLjI4LCAxLCBzbW9vdGhzdGVwKFJJVkVSX01BWF9aIC0gMC41LCBSSVZFUl9NQVhfWiArIDQsIGFic1opKTtcbiAgY29uc3Qgbm9pc2UgPVxuICAgICh2YWx1ZU5vaXNlKHggKiAwLjA2NSwgeiAqIDAuMDY1KSAtIDAuNSkgKiAwLjMyICtcbiAgICAodmFsdWVOb2lzZSh4ICogMC4xNyArIDQxLjcsIHogKiAwLjE3IC0gMTMuMikgLSAwLjUpICogMC4xNiArXG4gICAgKHZhbHVlTm9pc2UoeCAqIDAuMzQgLSA5LjEsIHogKiAwLjM0ICsgMjcuNCkgLSAwLjUpICogMC4wNjtcbiAgY29uc3QgZmVhdHVyZXMgPSB0ZXJyYWluRmVhdHVyZXMoeCwgeik7XG4gIGNvbnN0IGxlZ2FjeU1heEhlaWdodCA9IHZpc3RhUmlzZSAmJiBhYnNaID4gQ0xBSU1fSEFMRiA/IDEuMDUgOiAwLjYyO1xuICBjb25zdCBiYXNlSGVpZ2h0ID0gVEhSRUUuTWF0aFV0aWxzLmNsYW1wKFxuICAgICh2YWxsZXkgKyBzb3V0aFJpc2UgKyB2aXN0YUJhbmtSaXNlICsgbm9pc2UgKiBjbGFpbUNhbG0gKiByaXZlck5vaXNlTWFzaykgKiBCYWxhbmNlLndvcmxkLnRlcnJhaW5SZWxpZWYsXG4gICAgLTAuMTgsXG4gICAgbGVnYWN5TWF4SGVpZ2h0LFxuICApO1xuICBjb25zdCBtYXhIZWlnaHQgPSB2aXN0YVJpc2UgJiYgYWJzWiA+IENMQUlNX0hBTEYgPyAxLjQ2IDogMS4xODtcbiAgY29uc3QgbWluSGVpZ2h0ID0gY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcy5oZWlnaHRmaWVsZCA/IC0wLjUyIDogLTAuMzg7XG4gIHJldHVybiBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoYmFzZUhlaWdodCArIGZlYXR1cmVzLmhlaWdodE9mZnNldCArIGNvbnRyYWN0SGVpZ2h0ZmllbGRPZmZzZXQoeCwgeiksIG1pbkhlaWdodCwgbWF4SGVpZ2h0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbXBsZVBhZGRlZEhlaWdodCh4OiBudW1iZXIsIHo6IG51bWJlciwgcmFkaXVzID0gMCk6IG51bWJlciB7XG4gIGlmIChyYWRpdXMgPD0gMC4wMSkgcmV0dXJuIHNhbXBsZUhlaWdodCh4LCB6KTtcbiAgY29uc3QgciA9IE1hdGgubWF4KDAuMjUsIHJhZGl1cyAqIDAuNjUpO1xuICByZXR1cm4gKFxuICAgIHNhbXBsZUhlaWdodCh4LCB6KSAqIDIgK1xuICAgIHNhbXBsZUhlaWdodCh4IC0gciwgeikgK1xuICAgIHNhbXBsZUhlaWdodCh4ICsgciwgeikgK1xuICAgIHNhbXBsZUhlaWdodCh4LCB6IC0gcikgK1xuICAgIHNhbXBsZUhlaWdodCh4LCB6ICsgcilcbiAgKSAvIDY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxZKHg6IG51bWJlciwgejogbnVtYmVyLCBiYXNlID0gMCwgcGFkUmFkaXVzID0gMCk6IG51bWJlciB7XG4gIHJldHVybiBzYW1wbGVQYWRkZWRIZWlnaHQoeCwgeiwgcGFkUmFkaXVzKSArIGJhc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXN1YWxBbmNob3JZKHBvc2l0aW9uOiBWZWMyLCBsaWZ0OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdmlzdWFsWShwb3NpdGlvbi54LCBwb3NpdGlvbi56LCBsaWZ0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhlaWdodERpYWdub3N0aWNzKCk6IHtcbiAgbWluOiBudW1iZXI7XG4gIG1heDogbnVtYmVyO1xuICBzZWdtZW50czogbnVtYmVyO1xuICB3YXRlclk6IG51bWJlcjtcbiAgcHJvYmVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICBuYXR1cmFsOiB7XG4gICAgcmFuZ2U6IG51bWJlcjtcbiAgICBmb3JkQXBwcm9hY2hEZWx0YTogbnVtYmVyO1xuICAgIHJvdXRpbmdMYW5lRGVsdGE6IG51bWJlcjtcbiAgICByb3V0aW5nRmVhdHVyZU1heDogbnVtYmVyO1xuICAgIHByb2JlczogUmVjb3JkPCdndWxseScgfCAnc2hlbGYnIHwgJ2JsdWZmJyB8ICdwb2NrZXQnLCBudW1iZXI+O1xuICAgIGZlYXR1cmVzOiBSZWNvcmQ8J2d1bGx5JyB8ICdzaGVsZicgfCAnYmx1ZmYnIHwgJ3BvY2tldCcsIFRlcnJhaW5GZWF0dXJlU2FtcGxlPjtcbiAgfTtcbn0ge1xuICBsZXQgbWluID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICBsZXQgbWF4ID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICBmb3IgKGxldCB6ID0gYm91bmRzLm1pblo7IHogPD0gYm91bmRzLm1heFo7IHogKz0gNCkge1xuICAgIGZvciAobGV0IHggPSBib3VuZHMubWluWDsgeCA8PSBib3VuZHMubWF4WDsgeCArPSA0KSB7XG4gICAgICBjb25zdCBoZWlnaHQgPSBzYW1wbGVIZWlnaHQoeCwgeik7XG4gICAgICBtaW4gPSBNYXRoLm1pbihtaW4sIGhlaWdodCk7XG4gICAgICBtYXggPSBNYXRoLm1heChtYXgsIGhlaWdodCk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG5hdHVyYWxQcm9iZXMgPSB7XG4gICAgZ3VsbHk6IHNhbXBsZUhlaWdodCgxNCwgLTE0KSxcbiAgICBzaGVsZjogc2FtcGxlSGVpZ2h0KDIzLCAtMjApLFxuICAgIGJsdWZmOiBzYW1wbGVIZWlnaHQoMjksIDI5KSxcbiAgICBwb2NrZXQ6IHNhbXBsZUhlaWdodCgtMjIsIDIwKSxcbiAgfTtcbiAgY29uc3QgZm9yZEJhbmQgPSBbLTIsIDAsIDJdLmZsYXRNYXAoKHgpID0+IFtzYW1wbGVIZWlnaHQoeCwgUklWRVJfTUFYX1ogKyBTSEFMTE9XU19XSURUSCksIHNhbXBsZUhlaWdodCh4LCBSSVZFUl9NSU5fWiAtIFNIQUxMT1dTX1dJRFRIKV0pO1xuICBjb25zdCBmb3JkQXBwcm9hY2hEZWx0YSA9IE1hdGgubWF4KC4uLmZvcmRCYW5kKSAtIE1hdGgubWluKC4uLmZvcmRCYW5kKTtcbiAgY29uc3QgbGFuZVNhbXBsZXMgPSBbLTI4LCAtMTgsIC04LCA4LCAxOCwgMjhdLm1hcCgoeikgPT4gc2FtcGxlSGVpZ2h0KDAsIHopKTtcbiAgY29uc3Qgcm91dGluZ0xhbmVEZWx0YSA9IE1hdGgubWF4KC4uLmxhbmVTYW1wbGVzKSAtIE1hdGgubWluKC4uLmxhbmVTYW1wbGVzKTtcbiAgY29uc3Qgcm91dGluZ0ZlYXR1cmVNYXggPSBNYXRoLm1heCguLi5bLTI4LCAtMTgsIC04LCA4LCAxOCwgMjhdLm1hcCgoeikgPT4gTWF0aC5hYnModGVycmFpbkZlYXR1cmVTYW1wbGUoMCwgeikuaGVpZ2h0T2Zmc2V0KSkpO1xuICByZXR1cm4ge1xuICAgIG1pbixcbiAgICBtYXgsXG4gICAgc2VnbWVudHM6IHRlcnJhaW5TZWdtZW50cygpLFxuICAgIHdhdGVyWTogV0FURVJfWSxcbiAgICBwcm9iZXM6IHtcbiAgICAgIGhlcm9TdGFydDogc2FtcGxlSGVpZ2h0KDAsIDEyKSxcbiAgICAgIHJpdmVyOiBzYW1wbGVIZWlnaHQoLTEyLCAwKSxcbiAgICAgIGZvcmQ6IHNhbXBsZUhlaWdodCgwLCAwKSxcbiAgICAgIG5lYXJCYW5rOiBzYW1wbGVIZWlnaHQoMTIsIFJJVkVSX01BWF9aICsgU0hBTExPV1NfV0lEVEgpLFxuICAgICAgZmFyQmFuazogc2FtcGxlSGVpZ2h0KDEyLCAtMTgpLFxuICAgIH0sXG4gICAgbmF0dXJhbDoge1xuICAgICAgcmFuZ2U6IG1heCAtIG1pbixcbiAgICAgIGZvcmRBcHByb2FjaERlbHRhLFxuICAgICAgcm91dGluZ0xhbmVEZWx0YSxcbiAgICAgIHJvdXRpbmdGZWF0dXJlTWF4LFxuICAgICAgcHJvYmVzOiBuYXR1cmFsUHJvYmVzLFxuICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgZ3VsbHk6IHRlcnJhaW5GZWF0dXJlU2FtcGxlKDE0LCAtMTQpLFxuICAgICAgICBzaGVsZjogdGVycmFpbkZlYXR1cmVTYW1wbGUoMjMsIC0yMCksXG4gICAgICAgIGJsdWZmOiB0ZXJyYWluRmVhdHVyZVNhbXBsZSgyOSwgMjkpLFxuICAgICAgICBwb2NrZXQ6IHRlcnJhaW5GZWF0dXJlU2FtcGxlKC0yMiwgMjApLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgdHlwZSBWaXN0YURpYWdub3N0aWNzID0ge1xuICBwcmVzZW50OiBib29sZWFuO1xuICBzZWdtZW50czogbnVtYmVyO1xuICByYWRpdXM6IG51bWJlcjtcbiAgdmVydGljZXM6IG51bWJlcjtcbiAgc2VhbU1heERlbHRhOiBudW1iZXI7XG4gIHNlYW06IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXI7IGNsYW1wZWQ6IG51bWJlcjsgdW5jbGFtcGVkOiBudW1iZXI7IGRlbHRhOiBudW1iZXIgfT47XG4gIHJpdmVyOiB7XG4gICAgcHJlc2VudDogYm9vbGVhbjtcbiAgICBkcmF3Q2FsbHM6IDAgfCAxO1xuICAgIHJhZGl1czogbnVtYmVyO1xuICAgIHZlcnRpY2VzOiBudW1iZXI7XG4gICAgdmlzdWFsSGFsZldpZHRoOiBudW1iZXI7XG4gICAgZmFkZVN0YXJ0OiBudW1iZXI7XG4gICAgd2VzdEVkZ2VDZW50ZXJaOiBudW1iZXI7XG4gICAgZWFzdEVkZ2VDZW50ZXJaOiBudW1iZXI7XG4gICAgd2VzdEZhckNlbnRlclo6IG51bWJlcjtcbiAgICBlYXN0RmFyQ2VudGVyWjogbnVtYmVyO1xuICAgIG1lYW5kZXJBbXBsaXR1ZGU6IG51bWJlcjtcbiAgfTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXN0YURpYWdub3N0aWNzKCk6IFZpc3RhRGlhZ25vc3RpY3Mge1xuICBjb25zdCBzZWFtID0gdmlzdGFTZWFtUHJvYmVQb2ludHMoKS5tYXAoKHBvaW50KSA9PiB7XG4gICAgY29uc3QgY2xhbXBlZCA9IHNhbXBsZUhlaWdodChwb2ludC54LCBwb2ludC56KTtcbiAgICBjb25zdCB1bmNsYW1wZWQgPSBzYW1wbGVVbmNsYW1wZWRIZWlnaHQocG9pbnQueCwgcG9pbnQueik7XG4gICAgY29uc3QgZGVsdGEgPSBNYXRoLmFicyhjbGFtcGVkIC0gdW5jbGFtcGVkKTtcbiAgICByZXR1cm4geyAuLi5wb2ludCwgY2xhbXBlZCwgdW5jbGFtcGVkLCBkZWx0YSB9O1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBwcmVzZW50OiB0cnVlLFxuICAgIHNlZ21lbnRzOiB2aXN0YVNlZ21lbnRzKCksXG4gICAgcmFkaXVzOiBWSVNUQV9SQURJVVMsXG4gICAgdmVydGljZXM6IHZpc3RhVmVydGV4Q291bnQoKSxcbiAgICBzZWFtTWF4RGVsdGE6IE1hdGgubWF4KC4uLnNlYW0ubWFwKChlbnRyeSkgPT4gZW50cnkuZGVsdGEpKSxcbiAgICBzZWFtLFxuICAgIHJpdmVyOiB2aXN0YVJpdmVyRGlhZ25vc3RpY3MoKSxcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgVGVycmFpblZpZXcgPSB7XG4gIGdyb3VwOiBUSFJFRS5Hcm91cDtcbiAgdXBkYXRlOiAoZGVsdGE6IG51bWJlcikgPT4gdm9pZDtcbiAgZGlhZ25vc3RpY3M6ICgpID0+IFdhdGVyRGlhZ25vc3RpY3M7XG4gIGdyb3VuZERpYWdub3N0aWNzOiAoKSA9PiBUZXJyYWluR3JvdW5kRGlhZ25vc3RpY3M7XG59O1xuXG5leHBvcnQgdHlwZSBUZXJyYWluR3JvdW5kRGlhZ25vc3RpY3MgPVxuICB8IENvbnRpbnVvdXNHcm91bmRNZXNoU3RhdHNcbiAgfCB7XG4gICAgICBlbmFibGVkOiBmYWxzZTtcbiAgICAgIG1vZGU6ICdmYWxsYmFjayc7XG4gICAgICBkcmF3Q2FsbHM6IDE7XG4gICAgICBzZWdtZW50czogbnVtYmVyO1xuICAgICAgdmVydGV4U3RlcDogbnVtYmVyO1xuICAgICAgdmVydGljZXM6IG51bWJlcjtcbiAgICAgIHRyaWFuZ2xlczogbnVtYmVyO1xuICAgICAgaGVpZ2h0U291cmNlOiAndmlzdWFsJztcbiAgICAgIHRleHR1cmVTb3VyY2U6ICdiYW5rLWF0bGFzJztcbiAgICAgIHRleHR1cmVTZWFtczogJ3RleHR1cmUgc2VhbXMgcmVtYWluIHVudGlsIFRSLTAyJztcbiAgICB9O1xuXG50eXBlIExheWVyQ29udHJhY3QgPSB7XG4gIHNsb3RzPzogQXJyYXk8e1xuICAgIGZpbGU/OiBzdHJpbmc7XG4gICAgc2xvdD86IHN0cmluZztcbiAgICB2YXJpYW50cz86IHN0cmluZ1tdO1xuICB9Pjtcbn07XG5cbnR5cGUgVGVycmFpblNoYWRlclVuaWZvcm1zID0ge1xuICByZXBlYXQ6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHZhcmlhbnRDb3VudDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgYXRsYXNSb3dzOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICBmZWF0dXJlTWl4OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICBzZWVkOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICBzcGxhdDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgc2xvcGVTaGFkZTogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgcm9ja0Ftb3VudDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgZGFtcEJhbmQ6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHNjcnViQW1vdW50OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICBtYWNyb1dhcm10aDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgYW50aVRpbGU6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHBhbGV0dGVUaW50OiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5WZWN0b3IzPjtcbiAgZGFtcFRpbnQ6IFRIUkVFLklVbmlmb3JtPFRIUkVFLlZlY3RvcjM+O1xuICBkYW1wQW1vdW50OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xufTtcblxudHlwZSBUZXJyYWluU3BsYXRQYXJhbXMgPSB7XG4gIHJvY2tBbW91bnQ6IG51bWJlcjtcbiAgZGFtcEJhbmQ6IG51bWJlcjtcbiAgc2NydWJBbW91bnQ6IG51bWJlcjtcbiAgbWFjcm9XYXJtdGg6IG51bWJlcjtcbiAgYW50aVRpbGU6IG51bWJlcjtcbn07XG5cbmNvbnN0IEJBTktfVElMRV9SRVBFQVRTID0gNDtcbmNvbnN0IEJBTktfVkFSSUFOVF9GSUxFUyA9IHRlcnJhaW5CYW5rVmFyaWFudEZpbGVzKCk7XG4vLyBMYXp5IGdsb2IgKE5PVCBlYWdlcik6IGVhZ2VyIHdvdWxkIGNvbXBpbGUgdG8gc3RhdGljIGltcG9ydHMgb2YgZXZlcnlcbi8vIHByb2Nlc3NlZCBwbmcsIG1ha2luZyBlYWNoIG9uZSBhIGJvb3QtdGltZSBtb2R1bGUgZGVwZW5kZW5jeSBpbiBkZXYg4oCUIGFcbi8vIHNpbmdsZSBmYWlsZWQvYmxvY2tlZCBhc3NldCByZXF1ZXN0IHdvdWxkIHRoZW4ga2lsbCB0aGUgd2hvbGUgYXBwIGluc3RlYWRcbi8vIG9mIGZhbGxpbmcgYmFjayB0byBwbGFjZWhvbGRlcnMgKGdhdGUgZmluZGluZywgczExOiB2aXN1YWwtcG9saXNoLWFzc2V0c1xuLy8gZmFsbGJhY2sgdGVzdCkuIExhenkga2VlcHMgYXNzZXQgZmV0Y2hlcyBvdXQgb2YgdGhlIG1vZHVsZSBncmFwaC5cbi8vXG4vLyBGLUNFTEwtNCAoMjAyNi0wOS0wNyk6IGAnLi4vLi4vYXNzZXRzL3Byb2Nlc3NlZC90ZXItKi5wbmcnYCB1c2VkIHRvIHNpdCBpbiB0aGlzIGxpc3QgYW5kIG1hdGNoZWRcbi8vIEVYQUNUTFkgdGhlIHNldmVuIGB0ZXItcmFpbC1lbGVtZW50cy1yMGMwLi5yMGM2LnBuZ2Agc2hlZXQgY2VsbHMg4oCUIGFydC1iYXRjaC0wMTAgb3V0cHV0IHRoYXQgbm9cbi8vIGNvbnN1bWVyIGhhcyBldmVyIHdpcmVkLiBPbmx5IHR3byBuYW1lcyBhcmUgZXZlciBsb29rZWQgdXAgdGhyb3VnaCB0aGlzIG1hcDogYHByb3Atc3ByaW5nLXBvbmQucG5nYFxuLy8gKDo4MzIpIGFuZCB0aGUgYHRlcnJhaW4tKmAgYmFuayB2YXJpYW50cyB0aGUgbTEtY29yZSBjb250cmFjdCBuYW1lcyAoYHRlcnJhaW5CYW5rVmFyaWFudEZpbGVzKClgLFxuLy8gOjE2MjIpLiBTbyB0aGUgZW50cnkgYm91Z2h0IG5vdGhpbmcgYW5kIGNvc3Qgc2V2ZW4gcGVyLWNlbGwgSlMgbW9kdWxlcyBhbmQgc2V2ZW4gUE5HIGFzc2V0cyBpblxuLy8gZXZlcnkgZGV2LXZhcmlhbnQgYnVpbGQuIFRoZSBzdGF5aW5nLWxhenkgbGF3IGFib3ZlIGlzIHVudG91Y2hlZDogdGhpcyBpcyBhIE5BUlJPV0lORywgbm90IGFuXG4vLyBlYWdlcm5lc3MgY2hhbmdlLiBUaGUgcmVsZWFzZSBidWlsZCBuZXZlciBjYXJyaWVkIHRoZW0gZWl0aGVyIOKAlCBgdml0ZS5jb25maWcudHNgIHVzZWQgdG8gc3RyaXBcbi8vIHRoaXMgZXhhY3QgZW50cnkgZnJvbSB0aGUgYXJyYXkgbGl0ZXJhbCwgYW5kIHRoYXQgcmVwbGFjZW1lbnQgd2FzIHJlbW92ZWQgaW4gdGhlIHNhbWUgY29tbWl0LFxuLy8gYmVjYXVzZSBhIHJlcGxhY2VtZW50IHdob3NlIHNlYXJjaCBzdHJpbmcgbm8gbG9uZ2VyIGV4aXN0cyByZWFkcyBsaWtlIGEgbmFycm93aW5nIHRoYXQgaXMgbm90XG4vLyBoYXBwZW5pbmcuIElmIGEgcmFpbC1lbGVtZW50IGNvbnN1bWVyIGlzIGV2ZXIgd2lyZWQsIGFkZCBpdHMgT1dOIHBhdHRlcm4gaGVyZS5cbmNvbnN0IHByb2Nlc3NlZFRleHR1cmVVcmxzID0gaW1wb3J0Lm1ldGEuZ2xvYjxzdHJpbmc+KFxuICBbJy4uLy4uL2Fzc2V0cy9wcm9jZXNzZWQvdGVycmFpbi1iYW5rLSoucG5nJywgJy4uLy4uL2Fzc2V0cy9wcm9jZXNzZWQvcHJvcC1zcHJpbmctcG9uZC5wbmcnXSxcbiAge1xuICAgIHF1ZXJ5OiAnP3VybCcsXG4gICAgaW1wb3J0OiAnZGVmYXVsdCcsXG4gIH0sXG4pO1xuY29uc3QgcHJvY2Vzc2VkVGV4dHVyZVVybHNCeUZpbGUgPSBuZXcgTWFwKFxuICBPYmplY3QuZW50cmllcyhwcm9jZXNzZWRUZXh0dXJlVXJscykubWFwKChbcGF0aCwgdXJsTG9hZGVyXSkgPT4gW3BhdGguc3BsaXQoJy8nKS5wb3AoKSA/PyBwYXRoLCB1cmxMb2FkZXJdKSxcbik7XG5jb25zdCB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcblxuY29uc3QgYmFua01hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgY29sb3I6IHBhbGV0dGUuc2FuZCxcbiAgcm91Z2huZXNzOiAwLjg2LFxuICBtZXRhbG5lc3M6IDAuMDEsXG59KTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUJhbmtQbGFjZWhvbGRlcjogUGxhY2Vob2xkZXJGYWN0b3J5PFRIUkVFLk1lc2g+ID0gT2JqZWN0LmFzc2lnbihcbiAgKCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBuZXcgVEhSRUUuTWVzaChjcmVhdGVCYW5rR2VvbWV0cnkoKSwgY3JlYXRlQmFua01hdGVyaWFsKCkpO1xuICAgIG1lc2gubmFtZSA9ICdUZXJyYWluUmVsaWVmTWVzaCc7XG4gICAgbWVzaC51c2VyRGF0YS50ZXJyYWluUmVsaWVmID0gdHJ1ZTtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgbWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGFnUGxhY2Vob2xkZXIobWVzaCwgYXNzZXRTbG90cy50ZXJyYWluQmFuayk7XG4gIH0sXG4gIHsgc2xvdElkOiBhc3NldFNsb3RzLnRlcnJhaW5CYW5rIH0sXG4pO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlUml2ZXJQbGFjZWhvbGRlcjogUGxhY2Vob2xkZXJGYWN0b3J5PFRIUkVFLk1lc2g+ID0gT2JqZWN0LmFzc2lnbihcbiAgKCkgPT4ge1xuICAgIGNvbnN0IG1lc2ggPSBuZXcgVEhSRUUuTWVzaChjcmVhdGVFeHRlbmRlZFJpdmVyR2VvbWV0cnkoKSwgY3JlYXRlTGl2aW5nV2F0ZXJNYXRlcmlhbCh3YXRlck1hdGVyaWFsQ29uZmlnKGZhbHNlKSkpO1xuICAgIG1lc2gudXNlckRhdGEudmlzdWFsSGFsZldpZHRoID0gdmlzdWFsV2F0ZXJXaWR0aCgpIC8gMjtcbiAgICBtZXNoLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gV0FURVJfWTtcbiAgICBtZXNoLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLnRlcnJhaW47XG4gICAgbWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGFnUGxhY2Vob2xkZXIobWVzaCwgYXNzZXRTbG90cy50ZXJyYWluUml2ZXIpO1xuICB9LFxuICB7IHNsb3RJZDogYXNzZXRTbG90cy50ZXJyYWluUml2ZXIgfSxcbik7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGb3JkUGxhY2Vob2xkZXIocmFuZ2U6IEZvcmRSYW5nZSA9IGRlZmF1bHRGb3JkUmFuZ2UoKSk6IFRIUkVFLk1lc2gge1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLk1lc2goXG4gICAgbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkocmFuZ2UubWF4WCAtIHJhbmdlLm1pblgsIHZpc3VhbFdhdGVyV2lkdGgoKSwgMSwgMSksXG4gICAgY3JlYXRlTGl2aW5nV2F0ZXJNYXRlcmlhbCh3YXRlck1hdGVyaWFsQ29uZmlnKHRydWUsIHJhbmdlKSksXG4gICk7XG4gIG1lc2gucm90YXRpb24ueCA9IC1NYXRoLlBJIC8gMjtcbiAgbWVzaC5wb3NpdGlvbi5zZXQocmFuZ2UuY2VudGVyWCwgV0FURVJfWSArIDAuMDE1LCAwKTtcbiAgbWVzaC5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gIG1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gIHJldHVybiB0YWdQbGFjZWhvbGRlcihtZXNoLCBhc3NldFNsb3RzLnRlcnJhaW5Gb3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRlcnJhaW5WaWV3KCk6IFRlcnJhaW5WaWV3IHtcbiAgY29uc3QgZ3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbiAgY29uc3QgYmFuayA9IGNyZWF0ZUdyb3VuZE1lc2goKTtcbiAgY29uc3QgdmlzdGFCYW5rID0gY3JlYXRlVmlzdGFCYW5rTWVzaChiYW5rLm1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKTtcbiAgY29uc3QgcHJvcHMgPSBjcmVhdGVDbGFpbVByb3BzKCk7XG4gIGNvbnN0IHNwcmluZ1BvbmRzID0gY3JlYXRlU3ByaW5nUG9uZHMoU1BSSU5HX1BPTkRTKTtcbiAgbGV0IHJlbmRlcmVkU3ByaW5nUG9uZHMgPSBTUFJJTkdfUE9ORFMubGVuZ3RoO1xuICBmb3IgKGNvbnN0IHByb3Agb2YgcHJvcHMuY2hpbGRyZW4pIHByb3AucG9zaXRpb24ueSA9IHZpc3VhbFkocHJvcC5wb3NpdGlvbi54LCBwcm9wLnBvc2l0aW9uLnosIDAsIDAuNyk7XG4gIGdyb3VwLmFkZCh2aXN0YUJhbmssIGJhbmspO1xuXG4gIGxldCByaXZlcjogVEhSRUUuTWVzaCB8IG51bGwgPSBudWxsO1xuICBjb25zdCBmb3JkczogVEhSRUUuTWVzaFtdID0gW107XG4gIGNvbnN0IGZvcmRTdG9uZXM6IFRIUkVFLkluc3RhbmNlZE1lc2hbXSA9IFtdO1xuICBjb25zdCBncmF2ZWxCYXJzOiBUSFJFRS5NZXNoW10gPSBbXTtcbiAgaWYgKEFDVElWRV9DT05UUkFDVC50aWxlUGFyYW1zLnJpdmVyKSB7XG4gICAgcml2ZXIgPSBjcmVhdGVSaXZlclBsYWNlaG9sZGVyKCk7XG4gICAgZm9yIChjb25zdCByYW5nZSBvZiBGT1JEX1JBTkdFUykge1xuICAgICAgY29uc3QgZm9yZCA9IGNyZWF0ZUZvcmRQbGFjZWhvbGRlcihyYW5nZSk7XG4gICAgICBjb25zdCBzdG9uZXMgPSBjcmVhdGVGb3JkU3RvbmVzKFdBVEVSX1ksIHJhbmdlLmNlbnRlclgpO1xuICAgICAgZm9yZHMucHVzaChmb3JkKTtcbiAgICAgIGZvcmRTdG9uZXMucHVzaChzdG9uZXMpO1xuICAgIH1cbiAgICBncmF2ZWxCYXJzLnB1c2goLi4uY3JlYXRlR3JhdmVsQmFycygpKTtcbiAgICBncm91cC5hZGQocml2ZXIsIC4uLmZvcmRzLCAuLi5mb3JkU3RvbmVzLCAuLi5ncmF2ZWxCYXJzKTtcbiAgfVxuXG4gIGdyb3VwLmFkZChzcHJpbmdQb25kcywgcHJvcHMpO1xuICBjb25zdCBwb2ludGVyU3VyZmFjZXMgPSBbYmFuaywgc3ByaW5nUG9uZHMsIC4uLihyaXZlciA/IFtyaXZlciwgLi4uZm9yZHNdIDogW10pXTtcbiAgZmFsbGJhY2tQb2ludGVyU3VyZmFjZXMgPSBwb2ludGVyU3VyZmFjZXM7XG4gIGJhbmsuZ2VvbWV0cnkuYWRkRXZlbnRMaXN0ZW5lcignZGlzcG9zZScsICgpID0+IHtcbiAgICBpZiAoZmFsbGJhY2tQb2ludGVyU3VyZmFjZXMgPT09IHBvaW50ZXJTdXJmYWNlcykgZmFsbGJhY2tQb2ludGVyU3VyZmFjZXMgPSBbXTtcbiAgfSk7XG4gIHJlZnJlc2hFZGl0b3JQcmV2aWV3ID0gKGNvbnRyYWN0KSA9PiB7XG4gICAgcmVmcmVzaEdyb3VuZEdlb21ldHJ5KGJhbmspO1xuICAgIGRpc3Bvc2VPYmplY3QzRChzcHJpbmdQb25kcyk7XG4gICAgc3ByaW5nUG9uZHMuY2xlYXIoKTtcbiAgICBjb25zdCBuZXh0UG9uZHMgPSBjcmVhdGVTcHJpbmdQb25kcyhjb250cmFjdC50aWxlUGFyYW1zLndhdGVyU291cmNlcyk7XG4gICAgZm9yIChjb25zdCBwb25kIG9mIFsuLi5uZXh0UG9uZHMuY2hpbGRyZW5dKSBzcHJpbmdQb25kcy5hZGQocG9uZCk7XG4gICAgcmVuZGVyZWRTcHJpbmdQb25kcyA9IGNvbnRyYWN0LnRpbGVQYXJhbXMud2F0ZXJTb3VyY2VzLmxlbmd0aDtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIGdyb3VwLFxuICAgIHVwZGF0ZTogKGRlbHRhOiBudW1iZXIpID0+IHtcbiAgICAgIHN5bmNCYW5rTWF0ZXJpYWwoYmFuayk7XG4gICAgICBpZiAocml2ZXIpIHVwZGF0ZVdhdGVyTWF0ZXJpYWwocml2ZXIsIGRlbHRhKTtcbiAgICAgIGZvciAoY29uc3QgZm9yZCBvZiBmb3JkcykgdXBkYXRlV2F0ZXJNYXRlcmlhbChmb3JkLCBkZWx0YSk7XG4gICAgfSxcbiAgICBkaWFnbm9zdGljczogKCkgPT4gKHJpdmVyID8gd2F0ZXJEaWFnbm9zdGljcyhyaXZlciwgZm9yZHMsIGZvcmRTdG9uZXMsIGdyYXZlbEJhcnMpIDogZHJ5V2F0ZXJEaWFnbm9zdGljcyhyZW5kZXJlZFNwcmluZ1BvbmRzKSksXG4gICAgZ3JvdW5kRGlhZ25vc3RpY3M6ICgpID0+IGdyb3VuZERpYWdub3N0aWNzKGJhbmspLFxuICB9O1xufVxuXG5mdW5jdGlvbiByZWZyZXNoR3JvdW5kR2VvbWV0cnkobWVzaDogVEhSRUUuTWVzaCk6IHZvaWQge1xuICBjb25zdCBnZW9tZXRyeSA9IG1lc2guZ2VvbWV0cnk7XG4gIGNvbnN0IHBvc2l0aW9ucyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSBhcyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGU7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbnMuY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICBwb3NpdGlvbnMuc2V0WihpbmRleCwgc2FtcGxlSGVpZ2h0KHBvc2l0aW9ucy5nZXRYKGluZGV4KSwgLXBvc2l0aW9ucy5nZXRZKGluZGV4KSkpO1xuICB9XG4gIHBvc2l0aW9ucy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIGFwcGx5VGVycmFpbk5vcm1hbHMoZ2VvbWV0cnksIHNhbXBsZVVuY2xhbXBlZEhlaWdodCk7XG4gIGdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ0JveCgpO1xuICBnZW9tZXRyeS5jb21wdXRlQm91bmRpbmdTcGhlcmUoKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlR3JvdW5kTWVzaCgpOiBUSFJFRS5NZXNoIHtcbiAgY29uc3Qgc3BsYXQgPSB0ZXJyYWluU3BsYXRFbmFibGVkKCk7XG4gIGNvbnN0IG1lc2hFbmFibGVkID0gdGVycmFpbk1lc2hFbmFibGVkKCkgfHwgc3BsYXQ7XG4gIGlmICghbWVzaEVuYWJsZWQpIHJldHVybiBjcmVhdGVCYW5rUGxhY2Vob2xkZXIoKTtcbiAgY29uc3QgbWVzaCA9IGNyZWF0ZUNvbnRpbnVvdXNHcm91bmRNZXNoKHtcbiAgICBzaXplOiBDTEFJTV9TSVpFLFxuICAgIHdpZHRoOiBDTEFJTV9XSURUSCxcbiAgICBoZWlnaHQ6IENMQUlNX0hFSUdIVCxcbiAgICBzZWdtZW50czogdGVycmFpbk1lc2hTZWdtZW50cygpLFxuICAgIG1hdGVyaWFsOiBjcmVhdGVCYW5rTWF0ZXJpYWwoc3BsYXQpLFxuICAgIGhlaWdodEF0OiBzYW1wbGVIZWlnaHQsXG4gICAgbm9ybWFsSGVpZ2h0QXQ6IHNhbXBsZVVuY2xhbXBlZEhlaWdodCxcbiAgfSk7XG4gIGlmIChzcGxhdCkge1xuICAgIGNvbnN0IHN0YXRzID0gbWVzaC51c2VyRGF0YS5ncm91bmRTdGF0cyBhcyBDb250aW51b3VzR3JvdW5kTWVzaFN0YXRzIHwgdW5kZWZpbmVkO1xuICAgIGlmIChzdGF0cykge1xuICAgICAgc3RhdHMudGV4dHVyZVNvdXJjZSA9ICdiYW5rLWF0bGFzLXNwbGF0JztcbiAgICAgIHN0YXRzLnRleHR1cmVTZWFtcyA9ICdwZXItcGl4ZWwgc3BsYXQgZ3JhZGllbnRzJztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhZ1BsYWNlaG9sZGVyKG1lc2gsIGFzc2V0U2xvdHMudGVycmFpbkJhbmspO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVHcmF2ZWxCYXJzKCk6IFRIUkVFLk1lc2hbXSB7XG4gIHJldHVybiAoVElMRV9XQVRFUj8uZ3JhdmVsQmFycyA/PyBbXSkubWFwKGNyZWF0ZUdyYXZlbEJhcik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUdyYXZlbEJhcihiYXI6IENvbnRyYWN0R3JhdmVsQmFyKTogVEhSRUUuTWVzaCB7XG4gIGNvbnN0IG1lc2ggPSBuZXcgVEhSRUUuTWVzaChcbiAgICBuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoMC41LCAzNiksXG4gICAgbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgICAgIGNvbG9yOiAnI2E5OTU3MycsXG4gICAgICByb3VnaG5lc3M6IDAuOTQsXG4gICAgICBtZXRhbG5lc3M6IDAuMDEsXG4gICAgfSksXG4gICk7XG4gIG1lc2gubmFtZSA9IGBSaXZlckdyYXZlbEJhci4ke2Jhci5pZH1gO1xuICBtZXNoLnJvdGF0aW9uLnNldCgtTWF0aC5QSSAvIDIsIDAsIGJhci5yb3RhdGlvbik7XG4gIG1lc2gucG9zaXRpb24uc2V0KGJhci54LCBXQVRFUl9ZICsgMC4wMywgYmFyLnopO1xuICBtZXNoLnNjYWxlLnNldChiYXIubGVuZ3RoLCBiYXIud2lkdGgsIDEpO1xuICBtZXNoLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscztcbiAgbWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgcmV0dXJuIG1lc2g7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwcmluZ1BvbmRzKHNvdXJjZXM6IHJlYWRvbmx5IENvbnRyYWN0V2F0ZXJTb3VyY2VbXSk6IFRIUkVFLkdyb3VwIHtcbiAgY29uc3QgZ3JvdXAgPSBuZXcgVEhSRUUuR3JvdXAoKTtcbiAgZ3JvdXAubmFtZSA9ICdTcHJpbmdQb25kcyc7XG4gIGZvciAoY29uc3Qgc291cmNlIG9mIHNvdXJjZXMpIGdyb3VwLmFkZChjcmVhdGVTcHJpbmdQb25kKHNvdXJjZSkpO1xuICByZXR1cm4gZ3JvdXA7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNwcmluZ1BvbmQoc291cmNlOiBDb250cmFjdFdhdGVyU291cmNlKTogVEhSRUUuR3JvdXAge1xuICBjb25zdCBncm91cCA9IG5ldyBUSFJFRS5Hcm91cCgpO1xuICBncm91cC5uYW1lID0gJ1NwcmluZ1BvbmQnO1xuICBjb25zdCB3YXRlck1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgICBjb2xvcjogJyM0MTZmNmUnLFxuICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgIG9wYWNpdHk6IDAuODYsXG4gICAgcm91Z2huZXNzOiAwLjQyLFxuICAgIG1ldGFsbmVzczogMC4wMSxcbiAgfSk7XG4gIGNvbnN0IHdhdGVyID0gbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KHNvdXJjZS5yYWRpdXMsIDQ4KSwgd2F0ZXJNYXRlcmlhbCk7XG4gIHdhdGVyLm5hbWUgPSAnU3ByaW5nUG9uZFBsYWNlaG9sZGVyJztcbiAgd2F0ZXIucm90YXRpb24ueCA9IC1NYXRoLlBJIC8gMjtcbiAgd2F0ZXIucG9zaXRpb24uc2V0KHNvdXJjZS54LCBwb25kU3VyZmFjZVkoc291cmNlKSwgc291cmNlLnopO1xuICB3YXRlci5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gIGdyb3VwLmFkZCh3YXRlcik7XG5cbiAgY29uc3QgcmluZyA9IG5ldyBUSFJFRS5NZXNoKFxuICAgIG5ldyBUSFJFRS5SaW5nR2VvbWV0cnkoc291cmNlLnJhZGl1cyAqIDAuOTYsIHNvdXJjZS5yYWRpdXMgKiAxLjM1LCA0OCksXG4gICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6ICcjM2Y0YTM2JywgdHJhbnNwYXJlbnQ6IHRydWUsIG9wYWNpdHk6IDAuMjQsIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUgfSksXG4gICk7XG4gIHJpbmcubmFtZSA9ICdTcHJpbmdQb25kRGFtcFJpbmcnO1xuICByaW5nLnJvdGF0aW9uLnggPSAtTWF0aC5QSSAvIDI7XG4gIHJpbmcucG9zaXRpb24uY29weSh3YXRlci5wb3NpdGlvbik7XG4gIHJpbmcucG9zaXRpb24ueSAtPSAwLjAwNDtcbiAgcmluZy5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gIGdyb3VwLmFkZChyaW5nKTtcblxuICBjb25zdCByZWVkcyA9IGNyZWF0ZVBvbmRSZWVkcyhzb3VyY2UpO1xuICBncm91cC5hZGQocmVlZHMpO1xuXG4gIGNvbnN0IHVybExvYWRlciA9IHByb2Nlc3NlZFRleHR1cmVVcmxzQnlGaWxlLmdldCgncHJvcC1zcHJpbmctcG9uZC5wbmcnKTtcbiAgaWYgKHVybExvYWRlcikge1xuICAgIHZvaWQgdXJsTG9hZGVyKCkudGhlbigodXJsKSA9PiB7XG4gICAgICB0ZXh0dXJlTG9hZGVyLmxvYWQodXJsLCAodGV4dHVyZSkgPT4ge1xuICAgICAgICB0ZXh0dXJlLmNvbG9yU3BhY2UgPSBUSFJFRS5TUkdCQ29sb3JTcGFjZTtcbiAgICAgICAgdGV4dHVyZS5hbmlzb3Ryb3B5ID0gNDtcbiAgICAgICAgd2F0ZXJNYXRlcmlhbC5tYXAgPSB0ZXh0dXJlO1xuICAgICAgICB3YXRlck1hdGVyaWFsLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBncm91cDtcbn1cblxuZnVuY3Rpb24gcG9uZFN1cmZhY2VZKHNvdXJjZTogQ29udHJhY3RXYXRlclNvdXJjZSk6IG51bWJlciB7XG4gIGxldCBoZWlnaHQgPSBzYW1wbGVIZWlnaHQoc291cmNlLngsIHNvdXJjZS56KTtcbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IDg7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCBhbmdsZSA9IChpbmRleCAvIDgpICogTWF0aC5QSSAqIDI7XG4gICAgY29uc3QgcmFkaXVzID0gc291cmNlLnJhZGl1cyAqIDAuNzI7XG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBzYW1wbGVIZWlnaHQoc291cmNlLnggKyBNYXRoLmNvcyhhbmdsZSkgKiByYWRpdXMsIHNvdXJjZS56ICsgTWF0aC5zaW4oYW5nbGUpICogcmFkaXVzKSk7XG4gIH1cbiAgcmV0dXJuIGhlaWdodCArIFdBVEVSX1kgKyAwLjAzNTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUG9uZFJlZWRzKHNvdXJjZTogQ29udHJhY3RXYXRlclNvdXJjZSk6IFRIUkVFLkluc3RhbmNlZE1lc2gge1xuICBjb25zdCBjb3VudCA9IDE0O1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goXG4gICAgbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMC4wMjUsIDAuMDM1LCAwLjQyLCA1KSxcbiAgICBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoeyBjb2xvcjogJyM1YzY3NDInLCByb3VnaG5lc3M6IDAuOSB9KSxcbiAgICBjb3VudCxcbiAgKTtcbiAgbWVzaC5uYW1lID0gJ1NwcmluZ1BvbmRSZWVkcyc7XG4gIG1lc2gucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ2FtZXBsYXk7XG4gIGNvbnN0IG1hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG4gIGNvbnN0IHJvdGF0aW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcbiAgY29uc3QgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICBjb25zdCBzY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjb3VudDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IGFuZ2xlID0gaW5kZXggKiAyLjM5OTk2MyArIDAuMztcbiAgICBjb25zdCByYWRpdXMgPSBzb3VyY2UucmFkaXVzICogKDEuMDUgKyAoKGluZGV4ICogMzcpICUgNSkgKiAwLjAzNSk7XG4gICAgY29uc3QgeCA9IHNvdXJjZS54ICsgTWF0aC5jb3MoYW5nbGUpICogcmFkaXVzO1xuICAgIGNvbnN0IHogPSBzb3VyY2UueiArIE1hdGguc2luKGFuZ2xlKSAqIHJhZGl1cztcbiAgICBwb3NpdGlvbi5zZXQoeCwgdmlzdWFsWSh4LCB6LCAwLjI0KSwgeik7XG4gICAgcm90YXRpb24uc2V0RnJvbUV1bGVyKG5ldyBUSFJFRS5FdWxlcigwLjEyICogTWF0aC5zaW4oYW5nbGUpLCBhbmdsZSwgMC4xOCAqIE1hdGguY29zKGFuZ2xlKSkpO1xuICAgIHNjYWxlLnNldFNjYWxhcigwLjc4ICsgKChpbmRleCAqIDE5KSAlIDcpICogMC4wNSk7XG4gICAgbWF0cml4LmNvbXBvc2UocG9zaXRpb24sIHJvdGF0aW9uLCBzY2FsZSk7XG4gICAgbWVzaC5zZXRNYXRyaXhBdChpbmRleCwgbWF0cml4KTtcbiAgfVxuICBtZXNoLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgcmV0dXJuIG1lc2g7XG59XG5cbmZ1bmN0aW9uIHNwcmluZ1BvbmRBdCh4OiBudW1iZXIsIHo6IG51bWJlcik6IENvbnRyYWN0V2F0ZXJTb3VyY2UgfCBudWxsIHtcbiAgcmV0dXJuIFNQUklOR19QT05EUy5maW5kKChzb3VyY2UpID0+IGRpc3RhbmNlVG9TcHJpbmdDZW50ZXIoeCwgeiwgc291cmNlKSA8PSBzb3VyY2UucmFkaXVzKSA/PyBudWxsO1xufVxuXG5mdW5jdGlvbiBkaXN0YW5jZVRvU3ByaW5nRWRnZSh4OiBudW1iZXIsIHo6IG51bWJlciwgc291cmNlOiBDb250cmFjdFdhdGVyU291cmNlKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIGRpc3RhbmNlVG9TcHJpbmdDZW50ZXIoeCwgeiwgc291cmNlKSAtIHNvdXJjZS5yYWRpdXMpO1xufVxuXG5mdW5jdGlvbiBkaXN0YW5jZVRvU3ByaW5nQ2VudGVyKHg6IG51bWJlciwgejogbnVtYmVyLCBzb3VyY2U6IENvbnRyYWN0V2F0ZXJTb3VyY2UpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5oeXBvdCh4IC0gc291cmNlLngsIHogLSBzb3VyY2Uueik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJhbmtNYXRlcmlhbChzcGxhdCA9IGZhbHNlKTogVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICBjb25zdCBtYXRlcmlhbCA9IGJhbmtNYXRlcmlhbC5jbG9uZSgpO1xuICBjb25zdCBzcGxhdFBhcmFtcyA9IHRlcnJhaW5TcGxhdFBhcmFtcygpO1xuICBjb25zdCBsaXRlQW50aVRpbGUgPSBwZXJmb3JtYW5jZVRpZXJEaWFnbm9zdGljcygpLnRpZXIgPT09ICdsaXRlJztcbiAgY29uc3QgdW5pZm9ybXM6IFRlcnJhaW5TaGFkZXJVbmlmb3JtcyA9IHtcbiAgICByZXBlYXQ6IHsgdmFsdWU6IEJBTktfVElMRV9SRVBFQVRTIH0sXG4gICAgdmFyaWFudENvdW50OiB7IHZhbHVlOiAxIH0sXG4gICAgYXRsYXNSb3dzOiB7IHZhbHVlOiAxIH0sXG4gICAgZmVhdHVyZU1peDogeyB2YWx1ZTogQmFsYW5jZS50ZXJyYWluLmZlYXR1cmVNaXggfSxcbiAgICBzZWVkOiB7IHZhbHVlOiB0ZXJyYWluU2VlZCgpIH0sXG4gICAgc3BsYXQ6IHsgdmFsdWU6IHNwbGF0ID8gMSA6IDAgfSxcbiAgICBzbG9wZVNoYWRlOiB7IHZhbHVlOiB0ZXJyYWluU2xvcGVTaGFkZSgpIH0sXG4gICAgcm9ja0Ftb3VudDogeyB2YWx1ZTogc3BsYXRQYXJhbXMucm9ja0Ftb3VudCB9LFxuICAgIGRhbXBCYW5kOiB7IHZhbHVlOiBzcGxhdFBhcmFtcy5kYW1wQmFuZCB9LFxuICAgIHNjcnViQW1vdW50OiB7IHZhbHVlOiBzcGxhdFBhcmFtcy5zY3J1YkFtb3VudCB9LFxuICAgIG1hY3JvV2FybXRoOiB7IHZhbHVlOiBzcGxhdFBhcmFtcy5tYWNyb1dhcm10aCB9LFxuICAgIGFudGlUaWxlOiB7IHZhbHVlOiB0ZXJyYWluQW50aVRpbGVEaXNhYmxlZCgpID8gMCA6IHNwbGF0UGFyYW1zLmFudGlUaWxlIH0sXG4gICAgcGFsZXR0ZVRpbnQ6IHsgdmFsdWU6IHBhbGV0dGVWZWN0b3IoY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcy5wYWxldHRlPy50aW50LCBbMSwgMSwgMV0pIH0sXG4gICAgZGFtcFRpbnQ6IHsgdmFsdWU6IHBhbGV0dGVWZWN0b3IoY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcy5wYWxldHRlPy5kYW1wVGludCwgWzAuNCwgMC4zNywgMC4yOV0pIH0sXG4gICAgZGFtcEFtb3VudDogeyB2YWx1ZTogY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcy5wYWxldHRlPy5kYW1wQW1vdW50ID8/IDAuMjggfSxcbiAgfTtcbiAgbWF0ZXJpYWwubWFwID0gY3JlYXRlQmFua1RleHR1cmUoKTtcbiAgY29uZmlndXJlQmFua0F0bGFzKG1hdGVyaWFsLm1hcCk7XG4gIG1hdGVyaWFsLnVzZXJEYXRhLnRlcnJhaW5Vbmlmb3JtcyA9IHVuaWZvcm1zO1xuICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyKSA9PiB7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5SZXBlYXQgPSB1bmlmb3Jtcy5yZXBlYXQ7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5WYXJpYW50Q291bnQgPSB1bmlmb3Jtcy52YXJpYW50Q291bnQ7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5BdGxhc1Jvd3MgPSB1bmlmb3Jtcy5hdGxhc1Jvd3M7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5GZWF0dXJlTWl4ID0gdW5pZm9ybXMuZmVhdHVyZU1peDtcbiAgICBzaGFkZXIudW5pZm9ybXMudGVycmFpblNlZWQgPSB1bmlmb3Jtcy5zZWVkO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXJyYWluU3BsYXQgPSB1bmlmb3Jtcy5zcGxhdDtcbiAgICBzaGFkZXIudW5pZm9ybXMudGVycmFpblNsb3BlU2hhZGUgPSB1bmlmb3Jtcy5zbG9wZVNoYWRlO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXJyYWluUm9ja0Ftb3VudCA9IHVuaWZvcm1zLnJvY2tBbW91bnQ7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5EYW1wQmFuZCA9IHVuaWZvcm1zLmRhbXBCYW5kO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXJyYWluU2NydWJBbW91bnQgPSB1bmlmb3Jtcy5zY3J1YkFtb3VudDtcbiAgICBzaGFkZXIudW5pZm9ybXMudGVycmFpbk1hY3JvV2FybXRoID0gdW5pZm9ybXMubWFjcm9XYXJtdGg7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5BbnRpVGlsZSA9IHVuaWZvcm1zLmFudGlUaWxlO1xuICAgIHNoYWRlci51bmlmb3Jtcy50ZXJyYWluUGFsZXR0ZVRpbnQgPSB1bmlmb3Jtcy5wYWxldHRlVGludDtcbiAgICBzaGFkZXIudW5pZm9ybXMudGVycmFpbkRhbXBUaW50ID0gdW5pZm9ybXMuZGFtcFRpbnQ7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnRlcnJhaW5EYW1wQW1vdW50ID0gdW5pZm9ybXMuZGFtcEFtb3VudDtcbiAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudmFyeWluZyB2ZWMyIHZUZXJyYWluVXY7XFxudmFyeWluZyB2ZWMyIHZUZXJyYWluV29ybGQ7XFxudmFyeWluZyBmbG9hdCB2VGVycmFpblNsb3BlOycpXG4gICAgICAucmVwbGFjZShcbiAgICAgICAgJyNpbmNsdWRlIDx1dl92ZXJ0ZXg+JyxcbiAgICAgICAgJyNpbmNsdWRlIDx1dl92ZXJ0ZXg+XFxudlRlcnJhaW5VdiA9IHV2O1xcbnZUZXJyYWluV29ybGQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejtcXG52VGVycmFpblNsb3BlID0gY2xhbXAoKDEuMCAtIGFicyhub3JtYWwueikpICogOC4wLCAwLjAsIDEuMCk7JyxcbiAgICAgICk7XG4gICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCBgI2luY2x1ZGUgPGNvbW1vbj5cbnVuaWZvcm0gZmxvYXQgdGVycmFpblJlcGVhdDtcbnVuaWZvcm0gZmxvYXQgdGVycmFpblZhcmlhbnRDb3VudDtcbnVuaWZvcm0gZmxvYXQgdGVycmFpbkF0bGFzUm93cztcbnVuaWZvcm0gZmxvYXQgdGVycmFpbkZlYXR1cmVNaXg7XG51bmlmb3JtIGZsb2F0IHRlcnJhaW5TZWVkO1xudW5pZm9ybSBmbG9hdCB0ZXJyYWluU3BsYXQ7XG51bmlmb3JtIGZsb2F0IHRlcnJhaW5TbG9wZVNoYWRlO1xudW5pZm9ybSBmbG9hdCB0ZXJyYWluUm9ja0Ftb3VudDtcbnVuaWZvcm0gZmxvYXQgdGVycmFpbkRhbXBCYW5kO1xudW5pZm9ybSBmbG9hdCB0ZXJyYWluU2NydWJBbW91bnQ7XG51bmlmb3JtIGZsb2F0IHRlcnJhaW5NYWNyb1dhcm10aDtcbnVuaWZvcm0gZmxvYXQgdGVycmFpbkFudGlUaWxlO1xudW5pZm9ybSB2ZWMzIHRlcnJhaW5QYWxldHRlVGludDtcbnVuaWZvcm0gdmVjMyB0ZXJyYWluRGFtcFRpbnQ7XG51bmlmb3JtIGZsb2F0IHRlcnJhaW5EYW1wQW1vdW50O1xudmFyeWluZyB2ZWMyIHZUZXJyYWluVXY7XG52YXJ5aW5nIHZlYzIgdlRlcnJhaW5Xb3JsZDtcbnZhcnlpbmcgZmxvYXQgdlRlcnJhaW5TbG9wZTtcblxuZmxvYXQgdGVycmFpbkhhc2godmVjMiBwKSB7XG4gIHAgKz0gdGVycmFpblNlZWQgKiB2ZWMyKDM3LjIsIDE5LjcpO1xuICB2ZWMzIHAzID0gZnJhY3QodmVjMyhwLnh5eCkgKiAwLjEwMzEpO1xuICBwMyArPSBkb3QocDMsIHAzLnl6eCArIDMzLjMzKTtcbiAgcmV0dXJuIGZyYWN0KChwMy54ICsgcDMueSkgKiBwMy56KTtcbn1cblxuZmxvYXQgdGVycmFpblZhbHVlTm9pc2UodmVjMiBwKSB7XG4gIHZlYzIgaSA9IGZsb29yKHApO1xuICB2ZWMyIGYgPSBmcmFjdChwKTtcbiAgZiA9IGYgKiBmICogKDMuMCAtIDIuMCAqIGYpO1xuICBmbG9hdCBhID0gdGVycmFpbkhhc2goaSk7XG4gIGZsb2F0IGIgPSB0ZXJyYWluSGFzaChpICsgdmVjMigxLjAsIDAuMCkpO1xuICBmbG9hdCBjID0gdGVycmFpbkhhc2goaSArIHZlYzIoMC4wLCAxLjApKTtcbiAgZmxvYXQgZCA9IHRlcnJhaW5IYXNoKGkgKyB2ZWMyKDEuMCwgMS4wKSk7XG4gIHJldHVybiBtaXgobWl4KGEsIGIsIGYueCksIG1peChjLCBkLCBmLngpLCBmLnkpO1xufVxuXG5mbG9hdCB0ZXJyYWluVmlzdGFSaXZlckNlbnRlclooZmxvYXQgd29ybGRYKSB7XG4gIGZsb2F0IHNpZGUgPSB3b3JsZFggPCAwLjAgPyAtMS4wIDogMS4wO1xuICBmbG9hdCBvdXRzaWRlID0gbWF4KDAuMCwgYWJzKHdvcmxkWCkgLSAke0NMQUlNX0hBTEYudG9GaXhlZCgzKX0pO1xuICBmbG9hdCBkeCA9IHdvcmxkWCAtIHNpZGUgKiAke0NMQUlNX0hBTEYudG9GaXhlZCgzKX07XG4gIGZsb2F0IHJhbXAgPSBzbW9vdGhzdGVwKDAuMCwgMTguMCwgb3V0c2lkZSk7XG4gIHJldHVybiAkeygoUklWRVJfTUlOX1ogKyBSSVZFUl9NQVhfWikgLyAyKS50b0ZpeGVkKDMpfSArIHJhbXAgKiAoc2luKGR4ICogMC4wNjUpICogMi42ICsgc2luKGR4ICogMC4xMzcpICogMC44KTtcbn1cblxuZmxvYXQgdGVycmFpblNob3JlRGlzdGFuY2UodmVjMiB3b3JsZFBvcykge1xuICByZXR1cm4gbWF4KDAuMCwgYWJzKHdvcmxkUG9zLnkgLSB0ZXJyYWluVmlzdGFSaXZlckNlbnRlclood29ybGRQb3MueCkpIC0gJHsoKFJJVkVSX01BWF9aIC0gUklWRVJfTUlOX1opIC8gMikudG9GaXhlZCgzKX0pO1xufVxuXG52ZWMyIHRlcnJhaW5PcmllbnRVdih2ZWMyIHRpbGVVdiwgdmVjMiBjZWxsKSB7XG4gIGlmICh0ZXJyYWluSGFzaChjZWxsICsgdmVjMigxMS4wLCAzLjApKSA8IDAuNSkgdGlsZVV2LnggPSAxLjAgLSB0aWxlVXYueDtcbiAgZmxvYXQgcm90YXRpb24gPSBmbG9vcih0ZXJyYWluSGFzaChjZWxsICsgdmVjMig1LjAsIDE3LjApKSAqIDQuMCk7XG4gIGlmIChyb3RhdGlvbiA8IDAuNSkgcmV0dXJuIHRpbGVVdjtcbiAgaWYgKHJvdGF0aW9uIDwgMS41KSByZXR1cm4gdmVjMih0aWxlVXYueSwgMS4wIC0gdGlsZVV2LngpO1xuICBpZiAocm90YXRpb24gPCAyLjUpIHJldHVybiB2ZWMyKDEuMCAtIHRpbGVVdi54LCAxLjAgLSB0aWxlVXYueSk7XG4gIHJldHVybiB2ZWMyKDEuMCAtIHRpbGVVdi55LCB0aWxlVXYueCk7XG59XG5cbmZsb2F0IHRlcnJhaW5WYXJpYW50KHZlYzIgY2VsbCwgdmVjMiBzYWx0KSB7XG4gIGZsb2F0IHZhcmlhbnRDb3VudCA9IG1heCgxLjAsIHRlcnJhaW5WYXJpYW50Q291bnQpO1xuICByZXR1cm4gbWluKGZsb29yKHRlcnJhaW5IYXNoKGNlbGwgKyBzYWx0KSAqIHZhcmlhbnRDb3VudCksIHZhcmlhbnRDb3VudCAtIDEuMCk7XG59XG5cbmZsb2F0IHRlcnJhaW5HdWxseU1hc2sodmVjMiB3b3JsZFBvcykge1xuICBmbG9hdCBiYW5rRGlzdGFuY2UgPSB0ZXJyYWluU2hvcmVEaXN0YW5jZSh3b3JsZFBvcyk7XG4gIGZsb2F0IGJhbmtNYXNrID0gc21vb3Roc3RlcCgyLjAsIDguMCwgYmFua0Rpc3RhbmNlKSAqICgxLjAgLSBzbW9vdGhzdGVwKDE4LjAsIDMwLjAsIGJhbmtEaXN0YW5jZSkpO1xuICBmbG9hdCB3YXJwZWRYID0gd29ybGRQb3MueCArIHNpbih3b3JsZFBvcy55ICogMC4xOSkgKiAzLjAgKyBzaW4od29ybGRQb3MueSAqIDAuMDYxKSAqIDYuMDtcbiAgZmxvYXQgY2VsbCA9IGZsb29yKCh3YXJwZWRYICsgNi41KSAvIDEzLjApO1xuICBmbG9hdCBjZW50ZXIgPSBjZWxsICogMTMuMCAtIDYuNSArIHNpbihiYW5rRGlzdGFuY2UgKiAwLjggKyBjZWxsKSAqIDIuMDtcbiAgZmxvYXQgY2hhbm5lbCA9IDEuMCAtIHNtb290aHN0ZXAoMC42LCAyLjMsIGFicyh3YXJwZWRYIC0gY2VudGVyKSk7XG4gIGZsb2F0IGxhbmUgPSBzbW9vdGhzdGVwKDQuNiwgOS42LCBtaW4oYWJzKHdvcmxkUG9zLngpLCBhYnMod29ybGRQb3MueSAtIDEyLjApKSk7XG4gIGZsb2F0IGZvcmQgPSBzbW9vdGhzdGVwKDQuMCwgOS4wLCBsZW5ndGgod29ybGRQb3MpKTtcbiAgcmV0dXJuIGNoYW5uZWwgKiBiYW5rTWFzayAqIGxhbmUgKiBmb3JkO1xufWApXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9wYXJzX2ZyYWdtZW50PicsIGAjaW5jbHVkZSA8bWFwX3BhcnNfZnJhZ21lbnQ+XG52ZWM0IHRlcnJhaW5BdGxhc1NhbXBsZSh2ZWMyIHRpbGVVdiwgZmxvYXQgdmFyaWFudCkge1xuICBmbG9hdCBhdGxhc1JvdyA9IG1heCgxLjAsIHRlcnJhaW5BdGxhc1Jvd3MpIC0gMS4wIC0gdmFyaWFudDtcbiAgdmVjMiBhdGxhc1V2ID0gdmVjMih0aWxlVXYueCwgKGNsYW1wKHRpbGVVdi55LCAwLjAwMSwgMC45OTkpICsgYXRsYXNSb3cpIC8gbWF4KDEuMCwgdGVycmFpbkF0bGFzUm93cykpO1xuICByZXR1cm4gdGV4dHVyZTJEKG1hcCwgYXRsYXNVdik7XG59XG5cbnZlYzQgdGVycmFpbkxheWVyU2FtcGxlKHZlYzIgcmVwZWF0ZWRVdiwgZmxvYXQgc2NhbGUsIHZlYzIgc2FsdCkge1xuICB2ZWMyIGxheWVyS2V5ID0gZmxvb3IodmVjMih0ZXJyYWluU2VlZCAqIDMxLjAsIHRlcnJhaW5TZWVkICogNDcuMCkgKyBzYWx0KTtcbiAgdmVjMiBvZmZzZXQgPSB2ZWMyKHRlcnJhaW5IYXNoKGxheWVyS2V5ICsgMTcuMCksIHRlcnJhaW5IYXNoKGxheWVyS2V5ICsgNTMuMCkpO1xuICB2ZWMyIHRpbGVVdiA9IHRlcnJhaW5PcmllbnRVdihmcmFjdChyZXBlYXRlZFV2ICogc2NhbGUgKyBvZmZzZXQpLCBsYXllcktleSk7XG4gIHJldHVybiB0ZXJyYWluQXRsYXNTYW1wbGUodGlsZVV2LCB0ZXJyYWluVmFyaWFudChsYXllcktleSwgc2FsdCkpO1xufWApXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgXG4jaWZkZWYgVVNFX01BUFxuICB2ZWMyIHJlcGVhdGVkVXYgPSB2VGVycmFpblV2ICogdGVycmFpblJlcGVhdDtcbiAgdmVjNCBwYWNrZWRTYW5kID0gdGVycmFpbkxheWVyU2FtcGxlKHJlcGVhdGVkVXYsIDEuMCwgdmVjMigyMy4wLCAyOS4wKSk7XG4gIHZlYzQgZHJ5RGlydCA9IHRlcnJhaW5MYXllclNhbXBsZShyZXBlYXRlZFV2LCAwLjczLCB2ZWMyKDQzLjAsIDYxLjApKTtcbiAgdmVjNCBzY3J1YiA9IHRlcnJhaW5MYXllclNhbXBsZShyZXBlYXRlZFV2LCAxLjIxLCB2ZWMyKDg5LjAsIDMxLjApKTtcbiAgdmVjNCB3aWRlU2FuZCA9IHRlcnJhaW5MYXllclNhbXBsZShyZXBlYXRlZFV2LCAwLjQ3LCB2ZWMyKDcuMCwgMTAxLjApKTtcbiAgJHtsaXRlQW50aVRpbGUgPyAnJyA6IGBcbiAgdmVjNCB3aWRlRGlydCA9IHRlcnJhaW5MYXllclNhbXBsZShyZXBlYXRlZFV2LCAwLjM2LCB2ZWMyKDEwOS4wLCA1LjApKTtgfVxuICBmbG9hdCBhbnRpVGlsZU1peCA9IGNsYW1wKHRlcnJhaW5BbnRpVGlsZSwgMC4wLCAxLjApO1xuICAke2xpdGVBbnRpVGlsZSA/IGBcbiAgZmxvYXQgYW50aVRpbGVOb2lzZSA9IHNtb290aHN0ZXAoMC4xOCwgMC44NiwgdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5Xb3JsZCAqIDAuMTA1ICsgdGVycmFpblNlZWQgKiA2Ny4wKSk7XG4gIHBhY2tlZFNhbmQgPSBtaXgocGFja2VkU2FuZCwgd2lkZVNhbmQsIGFudGlUaWxlTWl4ICogYW50aVRpbGVOb2lzZSk7XG4gIGRyeURpcnQgPSBtaXgoZHJ5RGlydCwgd2lkZVNhbmQsIGFudGlUaWxlTWl4ICogKDEuMCAtIGFudGlUaWxlTm9pc2UpICogMC41NSk7YCA6IGBcbiAgcGFja2VkU2FuZCA9IG1peChwYWNrZWRTYW5kLCB3aWRlU2FuZCwgYW50aVRpbGVNaXggKiBzbW9vdGhzdGVwKDAuMTgsIDAuODYsIHRlcnJhaW5WYWx1ZU5vaXNlKHZUZXJyYWluV29ybGQgKiAwLjExICsgdGVycmFpblNlZWQgKiA2Ny4wKSkpO1xuICBkcnlEaXJ0ID0gbWl4KGRyeURpcnQsIHdpZGVEaXJ0LCBhbnRpVGlsZU1peCAqIHNtb290aHN0ZXAoMC4yNCwgMC44MiwgdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5Xb3JsZCAqIDAuMDk1IC0gdGVycmFpblNlZWQgKiA0My4wKSkpO2B9XG4gIGZsb2F0IGRpcnRCbGVuZCA9IHNtb290aHN0ZXAoMC4yMiwgMC43OCwgdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5Xb3JsZCAqIDAuMDc1ICsgdGVycmFpblNlZWQgKiAxNy4wKSk7XG4gIGZsb2F0IHNob3JlRGlzdGFuY2UgPSB0ZXJyYWluU2hvcmVEaXN0YW5jZSh2VGVycmFpbldvcmxkKTtcbiAgZmxvYXQgc2hvcmVCYW5kID0gMS4wIC0gc21vb3Roc3RlcCgxLjEsIDguMCwgc2hvcmVEaXN0YW5jZSk7XG4gIGZsb2F0IHNjcnViQmxlbmQgPSBzaG9yZUJhbmQgKiBzbW9vdGhzdGVwKDAuNDIsIDAuODgsIHRlcnJhaW5WYWx1ZU5vaXNlKHZUZXJyYWluV29ybGQgKiAwLjIyICsgdGVycmFpblNlZWQgKiAzMS4wKSk7XG4gIHZlYzQgc2FtcGxlZERpZmZ1c2VDb2xvciA9IG1peChwYWNrZWRTYW5kLCBkcnlEaXJ0LCBkaXJ0QmxlbmQgKiAwLjQ4KTtcbiAgc2FtcGxlZERpZmZ1c2VDb2xvciA9IG1peChzYW1wbGVkRGlmZnVzZUNvbG9yLCBzY3J1Yiwgc2NydWJCbGVuZCAqIDAuMjQpO1xuICBmbG9hdCByb2NrQmxlbmQgPSBzbW9vdGhzdGVwKDAuMTAsIDAuNzIsIHZUZXJyYWluU2xvcGUpICogKDAuNTUgKyB0ZXJyYWluVmFsdWVOb2lzZSh2VGVycmFpbldvcmxkICogMC4xOCArIHRlcnJhaW5TZWVkICogNDcuMCkgKiAwLjQ1KTtcbiAgc2FtcGxlZERpZmZ1c2VDb2xvci5yZ2IgPSBtaXgoc2FtcGxlZERpZmZ1c2VDb2xvci5yZ2IsIG1peChkcnlEaXJ0LnJnYiwgdmVjMygwLjQ3LCAwLjQ0LCAwLjM3KSwgMC40NiksIHJvY2tCbGVuZCAqIHRlcnJhaW5TbG9wZVNoYWRlKTtcbiAgZmxvYXQgZGFtcEd1bGx5ID0gdGVycmFpbkd1bGx5TWFzayh2VGVycmFpbldvcmxkKSAqICgxLjAgLSBzbW9vdGhzdGVwKDQuMCwgMjIuMCwgc2hvcmVEaXN0YW5jZSkpO1xuICBzYW1wbGVkRGlmZnVzZUNvbG9yLnJnYiA9IG1peChzYW1wbGVkRGlmZnVzZUNvbG9yLnJnYiwgdGVycmFpbkRhbXBUaW50LCBkYW1wR3VsbHkgKiB0ZXJyYWluRGFtcEFtb3VudCk7XG4gIGZsb2F0IGRhbXBXZWlnaHQgPSBtYXgoXG4gICAgKDEuMCAtIHNtb290aHN0ZXAobWF4KDAuMzUsIHRlcnJhaW5EYW1wQmFuZCAqIDAuMzgpLCBtYXgoMC43LCB0ZXJyYWluRGFtcEJhbmQpLCBzaG9yZURpc3RhbmNlKSkgKiB0ZXJyYWluRGFtcEFtb3VudCxcbiAgICBkYW1wR3VsbHkgKiB0ZXJyYWluRGFtcEFtb3VudFxuICApO1xuICBmbG9hdCByZWxpZWZOb2lzZSA9IHNtb290aHN0ZXAoMC4zMiwgMC45MiwgdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5Xb3JsZCAqIDAuMTYgKyB0ZXJyYWluU2VlZCAqIDUzLjApKTtcbiAgZmxvYXQgcm9ja1dlaWdodCA9IGNsYW1wKChyb2NrQmxlbmQgKyBkYW1wR3VsbHkgKiAwLjU1ICsgcmVsaWVmTm9pc2UgKiAwLjE2KSAqIHRlcnJhaW5Sb2NrQW1vdW50LCAwLjAsIDAuODgpO1xuICBmbG9hdCBzY3J1YldlaWdodCA9IGNsYW1wKChzY3J1YkJsZW5kICsgc2hvcmVCYW5kICogMC4xOCkgKiB0ZXJyYWluU2NydWJBbW91bnQsIDAuMCwgMC43Mik7XG4gIGZsb2F0IGRpcnRXZWlnaHQgPSBjbGFtcCgwLjIyICsgZGlydEJsZW5kICogMC4zNCArIHJvY2tXZWlnaHQgKiAwLjE4LCAwLjAsIDAuNzIpO1xuICBmbG9hdCBzYW5kV2VpZ2h0ID0gbWF4KDAuMTgsIDEuMCAtIGRhbXBXZWlnaHQgKiAwLjU4IC0gcm9ja1dlaWdodCAqIDAuNDggLSBzY3J1YldlaWdodCAqIDAuMjggLSBkaXJ0V2VpZ2h0ICogMC4xOCk7XG4gIGZsb2F0IGZpbmVHcmFpbiA9IHRlcnJhaW5WYWx1ZU5vaXNlKHZUZXJyYWluV29ybGQgKiAwLjgyICsgdGVycmFpblNlZWQgKiAxMzEuMCkgKiAyLjAgLSAxLjA7XG4gIGZsb2F0IHBlYmJsZUdyYWluID0gdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5Xb3JsZCAqIDEuNzUgLSB0ZXJyYWluU2VlZCAqIDkxLjApICogMi4wIC0gMS4wO1xuICB2ZWMzIHNhbmRMYXllciA9IG1peChwYWNrZWRTYW5kLnJnYiwgdmVjMygwLjY4LCAwLjQ5LCAwLjI1NSksIDAuNDIpICogKDEuMCArIGZpbmVHcmFpbiAqIDAuMDQ1ICsgcGViYmxlR3JhaW4gKiAwLjAyMik7XG4gIHZlYzMgZGlydExheWVyID0gbWl4KGRyeURpcnQucmdiLCB2ZWMzKDAuNTUsIDAuMzcsIDAuMTg1KSwgMC40MikgKiAoMS4wICsgZmluZUdyYWluICogMC4wNTIgLSBwZWJibGVHcmFpbiAqIDAuMDE4KTtcbiAgdmVjMyBkYW1wTGF5ZXIgPSBtaXgoZGlydExheWVyLCB0ZXJyYWluRGFtcFRpbnQsIDAuNzIpO1xuICB2ZWMzIHJvY2tMYXllciA9IG1peChkaXJ0TGF5ZXIsIHZlYzMoMC40NiwgMC40MTUsIDAuMzQpLCAwLjY2KTtcbiAgdmVjMyBzY3J1YkxheWVyID0gbWl4KHNjcnViLnJnYiwgdmVjMygwLjI1NSwgMC4zMDUsIDAuMTcpLCAwLjMyKSAqICgxLjAgKyBwZWJibGVHcmFpbiAqIDAuMDI2KTtcbiAgdmVjMyBhdGxhc0dyYWluID0gbWl4KHBhY2tlZFNhbmQucmdiLCBkcnlEaXJ0LnJnYiwgMC40OCk7XG4gIGF0bGFzR3JhaW4gPSBtaXgoYXRsYXNHcmFpbiwgc2NydWIucmdiLCBzY3J1YldlaWdodCAqIDAuMjgpO1xuICBmbG9hdCBhdGxhc0x1bWEgPSBkb3QoYXRsYXNHcmFpbiwgdmVjMygwLjI5OSwgMC41ODcsIDAuMTE0KSk7XG4gIGZsb2F0IGF0bGFzRGV0YWlsID0gbWl4KDEuMCwgY2xhbXAoYXRsYXNMdW1hICogMS4yNSwgMC44NiwgMS4xNCksIDAuMTYgKiBjbGFtcCh0ZXJyYWluQW50aVRpbGUsIDAuMCwgMS4wKSk7XG4gIGZsb2F0IHdlaWdodFRvdGFsID0gbWF4KDAuMDAxLCBzYW5kV2VpZ2h0ICsgZGlydFdlaWdodCArIGRhbXBXZWlnaHQgKyByb2NrV2VpZ2h0ICsgc2NydWJXZWlnaHQpO1xuICB2ZWMzIHNwbGF0Q29sb3IgPSAoXG4gICAgc2FuZExheWVyICogc2FuZFdlaWdodCArXG4gICAgZGlydExheWVyICogZGlydFdlaWdodCArXG4gICAgZGFtcExheWVyICogZGFtcFdlaWdodCArXG4gICAgcm9ja0xheWVyICogcm9ja1dlaWdodCArXG5cdFx0c2NydWJMYXllciAqIHNjcnViV2VpZ2h0XG5cdCAgKSAvIHdlaWdodFRvdGFsICogYXRsYXNEZXRhaWw7XG5cdCAgdmVjMyBzcGxhdE1vb2QgPSBjbGFtcCh2ZWMzKFxuXHQgICAgMS4wICsgKHRlcnJhaW5NYWNyb1dhcm10aCAtIDAuNzUpICogMC4xNiAtIHRlcnJhaW5TY3J1YkFtb3VudCAqIDAuMDQsXG5cdCAgICAxLjAgLSAodGVycmFpbk1hY3JvV2FybXRoIC0gMC43NSkgKiAwLjA2ICsgdGVycmFpblNjcnViQW1vdW50ICogMC4xMCxcblx0ICAgIDEuMCAtICh0ZXJyYWluTWFjcm9XYXJtdGggLSAwLjc1KSAqIDAuMTggKyAodGVycmFpbkRhbXBCYW5kIC0gMy4wKSAqIDAuMDEyXG5cdCAgKSwgdmVjMygwLjgyKSwgdmVjMygxLjIpKTtcblx0ICBzcGxhdENvbG9yICo9IHNwbGF0TW9vZDtcblx0ICBzYW1wbGVkRGlmZnVzZUNvbG9yLnJnYiA9IG1peChzYW1wbGVkRGlmZnVzZUNvbG9yLnJnYiwgc3BsYXRDb2xvciwgdGVycmFpblNwbGF0KTtcbiAgc2FtcGxlZERpZmZ1c2VDb2xvci5yZ2IgPSBtaXgodmVjMygxLjApLCBzYW1wbGVkRGlmZnVzZUNvbG9yLnJnYiwgY2xhbXAodGVycmFpbkZlYXR1cmVNaXgsIDAuMCwgMS4wKSk7XG4gIGZsb2F0IG1hY3JvID0gdGVycmFpblZhbHVlTm9pc2UodlRlcnJhaW5VdiAqIDIuMTUgKyB0ZXJyYWluU2VlZCAqIDExLjApICogMi4wIC0gMS4wO1xuICBmbG9hdCBhY3RpdmVNYWNyb1dhcm10aCA9IG1peCgxLjAsIHRlcnJhaW5NYWNyb1dhcm10aCwgdGVycmFpblNwbGF0KTtcbiAgdmVjMyBtYWNyb1RpbnQgPSB2ZWMzKFxuICAgIDEuMCArIG1hY3JvICogKDAuMDUyICsgdGVycmFpblNwbGF0ICogMC4wMTggKiBhY3RpdmVNYWNyb1dhcm10aCkgKyBtYXgobWFjcm8sIDAuMCkgKiAwLjAwOCAqIG1heCgxLjAsIGFjdGl2ZU1hY3JvV2FybXRoKSxcbiAgICAxLjAgKyBtYWNybyAqICgwLjAzOCArIHRlcnJhaW5TcGxhdCAqIDAuMDEwICogYWN0aXZlTWFjcm9XYXJtdGgpLFxuICAgIDEuMCArIG1hY3JvICogKDAuMDI2IC0gdGVycmFpblNwbGF0ICogMC4wMDYgKiBhY3RpdmVNYWNyb1dhcm10aCkgLSBtYXgobWFjcm8sIDAuMCkgKiAwLjAxMCAqIG1heCgxLjAsIGFjdGl2ZU1hY3JvV2FybXRoKVxuICApO1xuXHQgIHNhbXBsZWREaWZmdXNlQ29sb3IucmdiICo9IHRlcnJhaW5QYWxldHRlVGludCAqIG1hY3JvVGludCAqIG1peCh2ZWMzKDEuMCksIHZlYzMoMC45MiwgMS4wLCAwLjg2KSwgc2NydWJCbGVuZCAqIDAuMTgpO1xuXHQgIGRpZmZ1c2VDb2xvciAqPSBzYW1wbGVkRGlmZnVzZUNvbG9yO1xuXHQjZW5kaWZgKTtcbiAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXIucmVwbGFjZShcbiAgICAgICcjaW5jbHVkZSA8bm9ybWFsX2ZyYWdtZW50X2JlZ2luPicsXG4gICAgICBgI2luY2x1ZGUgPG5vcm1hbF9mcmFnbWVudF9iZWdpbj5cbiAgdmVjMyB0ZXJyYWluVXBOb3JtYWwgPSBub3JtYWxpemUoKHZpZXdNYXRyaXggKiB2ZWM0KDAuMCwgMS4wLCAwLjAsIDAuMCkpLnh5eik7XG4gIG5vcm1hbCA9IG5vcm1hbGl6ZShtaXgobm9ybWFsLCB0ZXJyYWluVXBOb3JtYWwsIHRlcnJhaW5TcGxhdCAqIDAuMjQpKTtcbiAgbm9uUGVydHVyYmVkTm9ybWFsID0gbm9ybWFsO2AsXG4gICAgKTtcblx0ICB9O1xuICB2b2lkIGxvYWRCYW5rVmFyaWFudEF0bGFzKCkudGhlbigoYXRsYXMpID0+IHtcbiAgICBpZiAoIWF0bGFzKSByZXR1cm47XG4gICAgLy8gRG8gTk9UIHJlc2l6ZSB0aGUgbGl2ZSBtYXAncyBiYWNraW5nIGNhbnZhczogdGhyZWUuanMgYWxsb2NhdGVzIGltbXV0YWJsZVxuICAgIC8vIHRleHR1cmUgc3RvcmFnZSBhdCBmaXJzdCB1cGxvYWQsIHNvIGEgZ3Jvd24gY2FudmFzIGRpZXMgaW4gdGV4U3ViSW1hZ2UyRFxuICAgIC8vIChHTF9JTlZBTElEX1ZBTFVFLCBzMTIgcHJvYmUpIGFuZCB0aGUgR1BVIHNpbGVudGx5IGtlZXBzIHRoZSBvbGQgY29udGVudC5cbiAgICAvLyBTd2FwIGluIGEgZnJlc2ggQ2FudmFzVGV4dHVyZSBzaXplZCB0byB0aGUgYXRsYXMgaW5zdGVhZC5cbiAgICBjb25zdCBhdGxhc1RleHR1cmUgPSBuZXcgVEhSRUUuQ2FudmFzVGV4dHVyZShhdGxhcy5jYW52YXMpO1xuICAgIGNvbmZpZ3VyZUJhbmtBdGxhcyhhdGxhc1RleHR1cmUpO1xuICAgIGNvbnN0IHByZXZpb3VzID0gbWF0ZXJpYWwubWFwO1xuICAgIG1hdGVyaWFsLm1hcCA9IGF0bGFzVGV4dHVyZTtcbiAgICBtYXRlcmlhbC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgaWYgKHByZXZpb3VzICYmIHByZXZpb3VzICE9PSBhdGxhc1RleHR1cmUpIHByZXZpb3VzLmRpc3Bvc2UoKTtcbiAgICB1bmlmb3Jtcy52YXJpYW50Q291bnQudmFsdWUgPSBhdGxhcy52YXJpYW50Q291bnQ7XG4gICAgdW5pZm9ybXMuYXRsYXNSb3dzLnZhbHVlID0gYXRsYXMucm93cztcbiAgfSk7XG4gIHJldHVybiBtYXRlcmlhbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmFua0dlb21ldHJ5KCk6IFRIUkVFLlBsYW5lR2VvbWV0cnkge1xuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5QbGFuZUdlb21ldHJ5KENMQUlNX1dJRFRILCBDTEFJTV9IRUlHSFQsIHRlcnJhaW5TZWdtZW50cygpLCB0ZXJyYWluU2VnbWVudHMoKSk7XG4gIGNvbnN0IHBvc2l0aW9ucyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSBhcyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGU7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbnMuY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB4ID0gcG9zaXRpb25zLmdldFgoaW5kZXgpO1xuICAgIGNvbnN0IHogPSAtcG9zaXRpb25zLmdldFkoaW5kZXgpO1xuICAgIHBvc2l0aW9ucy5zZXRaKGluZGV4LCBzYW1wbGVIZWlnaHQoeCwgeikpO1xuICB9XG4gIHBvc2l0aW9ucy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIGFwcGx5VGVycmFpbk5vcm1hbHMoZ2VvbWV0cnksIHNhbXBsZVVuY2xhbXBlZEhlaWdodCk7XG4gIHJldHVybiBnZW9tZXRyeTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlzdGFCYW5rTWVzaChtYXRlcmlhbDogVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpOiBUSFJFRS5NZXNoIHtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGNyZWF0ZVZpc3RhUmluZ0dlb21ldHJ5KCksIG1hdGVyaWFsKTtcbiAgbWVzaC5uYW1lID0gJ1RlcnJhaW5WaXN0YVJpbmcnO1xuICBtZXNoLnVzZXJEYXRhLnRlcnJhaW5WaXN0YSA9IHRydWU7XG4gIG1lc2gucm90YXRpb24ueCA9IC1NYXRoLlBJIC8gMjtcbiAgbWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgbWVzaC5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy50ZXJyYWluQmFja2Ryb3A7XG4gIHJldHVybiBtZXNoO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaXN0YVJpbmdHZW9tZXRyeSgpOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB7XG4gIGNvbnN0IHsgZnVsbEF4aXMsIGlubmVyQXhpcywgbGVmdEF4aXMsIHJpZ2h0QXhpcyB9ID0gdmlzdGFBeGVzKCk7XG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgdXZzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBhZGRWaXN0YUdyaWQocG9zaXRpb25zLCB1dnMsIGluZGljZXMsIGZ1bGxBeGlzLCByaWdodEF4aXMsIHNhbXBsZVVuY2xhbXBlZEhlaWdodCk7XG4gIGFkZFZpc3RhR3JpZChwb3NpdGlvbnMsIHV2cywgaW5kaWNlcywgZnVsbEF4aXMsIGxlZnRBeGlzLCBzYW1wbGVVbmNsYW1wZWRIZWlnaHQpO1xuICBhZGRWaXN0YUdyaWQocG9zaXRpb25zLCB1dnMsIGluZGljZXMsIHJpZ2h0QXhpcywgaW5uZXJBeGlzLCBzYW1wbGVVbmNsYW1wZWRIZWlnaHQpO1xuICBhZGRWaXN0YUdyaWQocG9zaXRpb25zLCB1dnMsIGluZGljZXMsIGxlZnRBeGlzLCBpbm5lckF4aXMsIHNhbXBsZVVuY2xhbXBlZEhlaWdodCk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCd1dicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHV2cywgMikpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgYXBwbHlUZXJyYWluTm9ybWFscyhnZW9tZXRyeSwgc2FtcGxlVW5jbGFtcGVkSGVpZ2h0KTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFeHRlbmRlZFJpdmVyR2VvbWV0cnkoKTogVEhSRUUuQnVmZmVyR2VvbWV0cnkge1xuICBjb25zdCBoYWxmV2lkdGggPSB2aXN1YWxXYXRlcldpZHRoKCkgLyAyO1xuICBjb25zdCBheGlzID0gdmlzdGFBeGVzKCkuZnVsbEF4aXM7XG4gIGNvbnN0IGFjcm9zc1NlZ21lbnRzID0gNDtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgY29uc3QgcG9zaXRpb25zOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCB1dnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGluZGljZXM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8PSBhY3Jvc3NTZWdtZW50czsgcm93ICs9IDEpIHtcbiAgICBjb25zdCB0ID0gcm93IC8gYWNyb3NzU2VnbWVudHM7XG4gICAgY29uc3QgYWNyb3NzID0gVEhSRUUuTWF0aFV0aWxzLmxlcnAoLWhhbGZXaWR0aCwgaGFsZldpZHRoLCB0KTtcbiAgICBmb3IgKGNvbnN0IHggb2YgYXhpcykge1xuICAgICAgY29uc3QgeiA9IHZpc3RhUml2ZXJDZW50ZXJaKHgpICsgYWNyb3NzO1xuICAgICAgcG9zaXRpb25zLnB1c2goeCwgLXosIDApO1xuICAgICAgdXZzLnB1c2goKHggKyBDTEFJTV9IQUxGX1gpIC8gQ0xBSU1fV0lEVEgsIHQpO1xuICAgIH1cbiAgfVxuICBjb25zdCB3aWR0aCA9IGF4aXMubGVuZ3RoO1xuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBhY3Jvc3NTZWdtZW50czsgcm93ICs9IDEpIHtcbiAgICBmb3IgKGxldCB4aSA9IDA7IHhpIDwgd2lkdGggLSAxOyB4aSArPSAxKSB7XG4gICAgICBjb25zdCBhID0gcm93ICogd2lkdGggKyB4aTtcbiAgICAgIGNvbnN0IGIgPSBhICsgMTtcbiAgICAgIGNvbnN0IGMgPSBhICsgd2lkdGg7XG4gICAgICBjb25zdCBkID0gYyArIDE7XG4gICAgICBpbmRpY2VzLnB1c2goYSwgYywgYiwgYiwgYywgZCk7XG4gICAgfVxuICB9XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCd1dicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHV2cywgMikpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5mdW5jdGlvbiBhZGRWaXN0YUdyaWQoXG4gIHBvc2l0aW9uczogbnVtYmVyW10sXG4gIHV2czogbnVtYmVyW10sXG4gIGluZGljZXM6IG51bWJlcltdLFxuICB4QXhpczogbnVtYmVyW10sXG4gIHpBeGlzOiBudW1iZXJbXSxcbiAgaGVpZ2h0QXQ6ICh4OiBudW1iZXIsIHo6IG51bWJlcikgPT4gbnVtYmVyLFxuKTogdm9pZCB7XG4gIGNvbnN0IGJhc2UgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcbiAgZm9yIChjb25zdCB6IG9mIHpBeGlzKSB7XG4gICAgZm9yIChjb25zdCB4IG9mIHhBeGlzKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaCh4LCAteiwgaGVpZ2h0QXQoeCwgeikpO1xuICAgICAgdXZzLnB1c2goKHggKyBDTEFJTV9IQUxGX1gpIC8gQ0xBSU1fV0lEVEgsICgteiArIENMQUlNX0hBTEZfWikgLyBDTEFJTV9IRUlHSFQpO1xuICAgIH1cbiAgfVxuICBjb25zdCB3aWR0aCA9IHhBeGlzLmxlbmd0aDtcbiAgZm9yIChsZXQgemkgPSAwOyB6aSA8IHpBeGlzLmxlbmd0aCAtIDE7IHppICs9IDEpIHtcbiAgICBmb3IgKGxldCB4aSA9IDA7IHhpIDwgeEF4aXMubGVuZ3RoIC0gMTsgeGkgKz0gMSkge1xuICAgICAgY29uc3QgYSA9IGJhc2UgKyB6aSAqIHdpZHRoICsgeGk7XG4gICAgICBjb25zdCBiID0gYSArIDE7XG4gICAgICBjb25zdCBjID0gYSArIHdpZHRoO1xuICAgICAgY29uc3QgZCA9IGMgKyAxO1xuICAgICAgaW5kaWNlcy5wdXNoKGEsIGMsIGIsIGIsIGMsIGQpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0ZXJyYWluU2VnbWVudHMoKTogbnVtYmVyIHtcbiAgY29uc3QgbW9iaWxlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmlubmVyV2lkdGggPD0gNDMwO1xuICBjb25zdCB2YWx1ZSA9IG1vYmlsZSA/IEJhbGFuY2Uud29ybGQudGVycmFpbk1vYmlsZVNlZ21lbnRzIDogQmFsYW5jZS53b3JsZC50ZXJyYWluU2VnbWVudHM7XG4gIHJldHVybiBNYXRoLm1heCgyNCwgTWF0aC5taW4oOTYsIE1hdGguZmxvb3IodmFsdWUpKSk7XG59XG5cbmZ1bmN0aW9uIHRlcnJhaW5NZXNoRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgY29uc3QgbW9kZSA9IEFDVElWRV9USUxFLnJlbmRlcj8udGVycmFpbk1lc2g7XG4gIGlmIChtb2RlID09PSAncmVxdWlyZWQnKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKG1vZGUgPT09ICdvZmYnKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RlcnJhaW5NZXNoJyk7XG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSByZXR1cm4gdmFsdWUgIT09ICcwJyAmJiB2YWx1ZSAhPT0gJ2ZhbHNlJztcbiAgfVxuICBpZiAoaW1wb3J0Lm1ldGEuZW52LlZJVEVfR1JfVEVSUkFJTl9NRVNIID09PSAnMScgfHwgaW1wb3J0Lm1ldGEuZW52LlZJVEVfR1JfVEVSUkFJTl9NRVNIID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICByZXR1cm4gQmFsYW5jZS53b3JsZC50ZXJyYWluTWVzaDtcbn1cblxuZnVuY3Rpb24gdGVycmFpblNwbGF0RW5hYmxlZCgpOiBib29sZWFuIHtcbiAgaWYgKEFDVElWRV9USUxFLnJlbmRlcj8udGVycmFpbk1lc2ggPT09ICdvZmYnKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RlcnJhaW5TcGxhdCcpO1xuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkgcmV0dXJuIHZhbHVlICE9PSAnMCcgJiYgdmFsdWUgIT09ICdmYWxzZSc7XG4gIH1cbiAgaWYgKGltcG9ydC5tZXRhLmVudi5WSVRFX0dSX1RFUlJBSU5fU1BMQVQgPT09ICcxJyB8fCBpbXBvcnQubWV0YS5lbnYuVklURV9HUl9URVJSQUlOX1NQTEFUID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xuICByZXR1cm4gQmFsYW5jZS53b3JsZC50ZXJyYWluU3BsYXQ7XG59XG5cbmZ1bmN0aW9uIHRlcnJhaW5TbG9wZVNoYWRlKCk6IG51bWJlciB7XG4gIHJldHVybiBBQ1RJVkVfVElMRS5yZW5kZXI/LnRlcnJhaW5NZXNoID09PSAncmVxdWlyZWQnID8gMC42MiA6IDAuNDI7XG59XG5cbmZ1bmN0aW9uIHRlcnJhaW5NZXNoU2VnbWVudHMoKTogbnVtYmVyIHtcbiAgY29uc3Qgc3RlcCA9IE1hdGgubWF4KDAuNSwgTWF0aC5taW4oNCwgQmFsYW5jZS53b3JsZC50ZXJyYWluTWVzaFZlcnRleFN0ZXApKTtcbiAgcmV0dXJuIE1hdGgubWF4KDgsIE1hdGgubWluKDEyOCwgTWF0aC5yb3VuZChDTEFJTV9TSVpFIC8gc3RlcCkpKTtcbn1cblxuZnVuY3Rpb24gZ3JvdW5kRGlhZ25vc3RpY3MobWVzaDogVEhSRUUuTWVzaCk6IFRlcnJhaW5Hcm91bmREaWFnbm9zdGljcyB7XG4gIGNvbnN0IHN0YXRzID0gbWVzaC51c2VyRGF0YS5ncm91bmRTdGF0cyBhcyBDb250aW51b3VzR3JvdW5kTWVzaFN0YXRzIHwgdW5kZWZpbmVkO1xuICBpZiAoc3RhdHMpIHJldHVybiBzdGF0cztcbiAgY29uc3QgdmVydGljZXMgPSAobWVzaC5nZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJykgYXMgVEhSRUUuQnVmZmVyQXR0cmlidXRlIHwgdW5kZWZpbmVkKT8uY291bnQgPz8gMDtcbiAgY29uc3Qgc2VnbWVudHMgPSBNYXRoLm1heCgxLCBNYXRoLnJvdW5kKE1hdGguc3FydCh2ZXJ0aWNlcykpIC0gMSk7XG4gIGNvbnN0IHRyaWFuZ2xlcyA9IG1lc2guZ2VvbWV0cnkuaW5kZXggPyBtZXNoLmdlb21ldHJ5LmluZGV4LmNvdW50IC8gMyA6IE1hdGguZmxvb3IodmVydGljZXMgLyAzKTtcbiAgcmV0dXJuIHtcbiAgICBlbmFibGVkOiBmYWxzZSxcbiAgICBtb2RlOiAnZmFsbGJhY2snLFxuICAgIGRyYXdDYWxsczogMSxcbiAgICBzZWdtZW50cyxcbiAgICB2ZXJ0ZXhTdGVwOiBDTEFJTV9TSVpFIC8gc2VnbWVudHMsXG4gICAgdmVydGljZXMsXG4gICAgdHJpYW5nbGVzLFxuICAgIGhlaWdodFNvdXJjZTogJ3Zpc3VhbCcsXG4gICAgdGV4dHVyZVNvdXJjZTogJ2JhbmstYXRsYXMnLFxuICAgIHRleHR1cmVTZWFtczogJ3RleHR1cmUgc2VhbXMgcmVtYWluIHVudGlsIFRSLTAyJyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlzdGFTZWdtZW50cygpOiBudW1iZXIge1xuICBjb25zdCBtb2JpbGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSA0MzA7XG4gIGNvbnN0IHZhbHVlID0gbW9iaWxlID8gQmFsYW5jZS53b3JsZC52aXN0YU1vYmlsZVNlZ21lbnRzIDogQmFsYW5jZS53b3JsZC52aXN0YVNlZ21lbnRzO1xuICByZXR1cm4gTWF0aC5tYXgoNCwgTWF0aC5taW4oMjQsIE1hdGguZmxvb3IodmFsdWUpKSk7XG59XG5cbmZ1bmN0aW9uIHZpc3RhQXhlcygpOiB7IGZ1bGxBeGlzOiBudW1iZXJbXTsgaW5uZXJBeGlzOiBudW1iZXJbXTsgbGVmdEF4aXM6IG51bWJlcltdOyByaWdodEF4aXM6IG51bWJlcltdIH0ge1xuICBjb25zdCBlZGdlU2VnbWVudHMgPSB0ZXJyYWluU2VnbWVudHMoKTtcbiAgY29uc3Qgb3V0ZXJTZWdtZW50cyA9IHZpc3RhU2VnbWVudHMoKTtcbiAgY29uc3QgaW5uZXJBeGlzID0gbWFrZUF4aXMoLUNMQUlNX0hBTEYsIENMQUlNX0hBTEYsIGVkZ2VTZWdtZW50cyk7XG4gIGNvbnN0IGxlZnRBeGlzID0gbWFrZVZpc3RhT3V0ZXJBeGlzKC1DTEFJTV9IQUxGLCAtVklTVEFfUkFESVVTLCBvdXRlclNlZ21lbnRzKS5yZXZlcnNlKCk7XG4gIGNvbnN0IHJpZ2h0QXhpcyA9IG1ha2VWaXN0YU91dGVyQXhpcyhDTEFJTV9IQUxGLCBWSVNUQV9SQURJVVMsIG91dGVyU2VnbWVudHMpO1xuICByZXR1cm4ge1xuICAgIGZ1bGxBeGlzOiBbLi4ubGVmdEF4aXMuc2xpY2UoMCwgLTEpLCAuLi5pbm5lckF4aXMsIC4uLnJpZ2h0QXhpcy5zbGljZSgxKV0sXG4gICAgaW5uZXJBeGlzLFxuICAgIGxlZnRBeGlzLFxuICAgIHJpZ2h0QXhpcyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gbWFrZUF4aXMoc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIHNlZ21lbnRzOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gIGNvbnN0IGNvdW50ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihzZWdtZW50cykpO1xuICBjb25zdCB2YWx1ZXM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPD0gY291bnQ7IGluZGV4ICs9IDEpIHZhbHVlcy5wdXNoKFRIUkVFLk1hdGhVdGlscy5sZXJwKHN0YXJ0LCBlbmQsIGluZGV4IC8gY291bnQpKTtcbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuZnVuY3Rpb24gbWFrZVZpc3RhT3V0ZXJBeGlzKGVkZ2U6IG51bWJlciwgb3V0ZXI6IG51bWJlciwgc2VnbWVudHM6IG51bWJlcik6IG51bWJlcltdIHtcbiAgY29uc3QgbmVhclNlZ21lbnRzID0gTWF0aC5tYXgoMiwgTWF0aC5taW4oOCwgTWF0aC5mbG9vcihzZWdtZW50cyAqIDAuNzUpKSk7XG4gIGNvbnN0IGZhclNlZ21lbnRzID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihzZWdtZW50cykgLSBuZWFyU2VnbWVudHMpO1xuICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoLnNpZ24ob3V0ZXIgLSBlZGdlKSB8fCAxO1xuICBjb25zdCB0cmFuc2l0aW9uRW5kID0gZWRnZSArIGRpcmVjdGlvbiAqIE1hdGgubWluKDgsIE1hdGguYWJzKG91dGVyIC0gZWRnZSkpO1xuICByZXR1cm4gWy4uLm1ha2VBeGlzKGVkZ2UsIHRyYW5zaXRpb25FbmQsIG5lYXJTZWdtZW50cyksIC4uLm1ha2VBeGlzKHRyYW5zaXRpb25FbmQsIG91dGVyLCBmYXJTZWdtZW50cykuc2xpY2UoMSldO1xufVxuXG5mdW5jdGlvbiBhcHBseVRlcnJhaW5Ob3JtYWxzKGdlb21ldHJ5OiBUSFJFRS5CdWZmZXJHZW9tZXRyeSwgaGVpZ2h0QXQ6ICh4OiBudW1iZXIsIHo6IG51bWJlcikgPT4gbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IHBvc2l0aW9ucyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKSBhcyBUSFJFRS5CdWZmZXJBdHRyaWJ1dGU7XG4gIGNvbnN0IG5vcm1hbHM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwb3NpdGlvbnMuY291bnQ7IGluZGV4ICs9IDEpIHtcbiAgICBjb25zdCB4ID0gcG9zaXRpb25zLmdldFgoaW5kZXgpO1xuICAgIGNvbnN0IHogPSAtcG9zaXRpb25zLmdldFkoaW5kZXgpO1xuICAgIGNvbnN0IG5vcm1hbCA9IHRlcnJhaW5Ob3JtYWwoeCwgeiwgaGVpZ2h0QXQpO1xuICAgIG5vcm1hbHMucHVzaChub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56KTtcbiAgfVxuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ25vcm1hbCcsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKG5vcm1hbHMsIDMpKTtcbn1cblxuZnVuY3Rpb24gdGVycmFpbk5vcm1hbCh4OiBudW1iZXIsIHo6IG51bWJlciwgaGVpZ2h0QXQ6ICh4OiBudW1iZXIsIHo6IG51bWJlcikgPT4gbnVtYmVyKTogVEhSRUUuVmVjdG9yMyB7XG4gIGNvbnN0IHN0ZXAgPSAwLjU7XG4gIGNvbnN0IGR4ID0gKGhlaWdodEF0KHggKyBzdGVwLCB6KSAtIGhlaWdodEF0KHggLSBzdGVwLCB6KSkgLyAoc3RlcCAqIDIpO1xuICBjb25zdCBkeiA9IChoZWlnaHRBdCh4LCB6ICsgc3RlcCkgLSBoZWlnaHRBdCh4LCB6IC0gc3RlcCkpIC8gKHN0ZXAgKiAyKTtcbiAgcmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKC1keCwgZHosIDEpLm5vcm1hbGl6ZSgpO1xufVxuXG5mdW5jdGlvbiB0ZXJyYWluRmVhdHVyZXMoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBUZXJyYWluRmVhdHVyZVNhbXBsZSB7XG4gIGNvbnN0IGFic1ogPSBNYXRoLmFicyh6KTtcbiAgY29uc3QgYmFua0Rpc3RhbmNlID0gTWF0aC5tYXgoMCwgYWJzWiAtIFJJVkVSX01BWF9aKTtcbiAgY29uc3Qgcm91dGVNYXNrID0gc21vb3Roc3RlcChcbiAgICBCYWxhbmNlLndvcmxkLnRlcnJhaW5Sb3V0aW5nTGFuZUNhbG1SYWRpdXMsXG4gICAgQmFsYW5jZS53b3JsZC50ZXJyYWluUm91dGluZ0xhbmVDYWxtUmFkaXVzICsgNSxcbiAgICByb3V0aW5nTGFuZURpc3RhbmNlKHgsIHopLFxuICApO1xuICBjb25zdCBmb3JkTWFzayA9IHNtb290aHN0ZXAoNCwgOSwgTWF0aC5oeXBvdCh4LCB6KSk7XG4gIGNvbnN0IGNhbG1NYXNrID0gY2xhaW1GZWF0dXJlQ2FsbU1hc2soeCwgeikgKiBzdGFibGVQcm9iZU1hc2soeCwgeikgKiByb3V0ZU1hc2sgKiBmb3JkTWFzaztcbiAgY29uc3QgYmFua01hc2sgPSBzbW9vdGhzdGVwKDIsIDgsIGJhbmtEaXN0YW5jZSkgKiAoMSAtIHNtb290aHN0ZXAoMTgsIDMwLCBiYW5rRGlzdGFuY2UpKSAqIGNhbG1NYXNrO1xuICBjb25zdCBndWxseSA9IGNoYW5uZWxNYXNrKHgsIHopICogYmFua01hc2sgKiAoMC43MiArIHZhbHVlTm9pc2UoeCAqIDAuMDkgKyAxOC41LCB6ICogMC4wOSAtIDQuNSkgKiAwLjQyKTtcbiAgY29uc3Qgc2hlbGYgPVxuICAgIE1hdGgubWF4KG92YWxNYXNrKHgsIHosIDIzLCAtMjAsIDgsIDYpLCBvdmFsTWFzayh4LCB6LCAtMjMsIC0xOSwgOSwgNiksIG92YWxNYXNrKHgsIHosIC04LCAtMjgsIDEyLCA0KSAqIDAuNzIpICpcbiAgICBjYWxtTWFzayAqXG4gICAgKDAuODIgKyB2YWx1ZU5vaXNlKHggKiAwLjEyIC0gOC40LCB6ICogMC4xMiArIDE5LjEpICogMC4zNCk7XG4gIGNvbnN0IGVkZ2UgPSBNYXRoLm1heChNYXRoLmFicyh4KSwgTWF0aC5hYnMoeikpO1xuICBjb25zdCBibHVmZiA9IHNtb290aHN0ZXAoQ0xBSU1fSEFMRiAtIDgsIENMQUlNX0hBTEYsIGVkZ2UpICogY2FsbU1hc2sgKiAoMC43NiArIHZhbHVlTm9pc2UoeCAqIDAuMDUgKyAyLjIsIHogKiAwLjA1IC0gOS43KSAqIDAuMzgpO1xuICBjb25zdCBwb2NrZXQgPVxuICAgIE1hdGgubWF4KFxuICAgICAgb3ZhbE1hc2soeCwgeiwgLTIyLCAyMCwgNywgNSksXG4gICAgICBvdmFsTWFzayh4LCB6LCAyNCwgMjEsIDUsIDYpLFxuICAgICAgb3ZhbE1hc2soeCwgeiwgLTI2LCAtMjMsIDYsIDUpLFxuICAgICAgb3ZhbE1hc2soeCwgeiwgMjYsIC0yNywgNSwgNCksXG4gICAgKSAqXG4gICAgY2FsbU1hc2sgKlxuICAgICgwLjgyICsgdmFsdWVOb2lzZSh4ICogMC4xNiArIDcuMSwgeiAqIDAuMTYgKyAyLjQpICogMC4yOCk7XG4gIGNvbnN0IHNjYWxlID0gQmFsYW5jZS53b3JsZC50ZXJyYWluRmVhdHVyZVJlbGllZiAqIG1vYmlsZVRlcnJhaW5GZWF0dXJlU2NhbGUoKTtcbiAgY29uc3QgaGVpZ2h0T2Zmc2V0ID0gKHNoZWxmICogMC40MiArIGJsdWZmICogMC40OCAtIGd1bGx5ICogMC4zMCAtIHBvY2tldCAqIDAuMjIpICogc2NhbGU7XG4gIHJldHVybiB7IGd1bGx5LCBzaGVsZiwgYmx1ZmYsIHBvY2tldCwgcm91dGVNYXNrLCBjYWxtTWFzaywgaGVpZ2h0T2Zmc2V0IH07XG59XG5cbmZ1bmN0aW9uIGNvbnRyYWN0SGVpZ2h0ZmllbGRPZmZzZXQoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBoZWlnaHRmaWVsZCA9IGN1cnJlbnRDb250cmFjdCgpLnRpbGVQYXJhbXMuaGVpZ2h0ZmllbGQ7XG4gIGlmICghaGVpZ2h0ZmllbGQgfHwgaGVpZ2h0ZmllbGQubW9kZSAhPT0gJ3Zpc3VhbCcpIHJldHVybiAwO1xuXG4gIGxldCBvZmZzZXQgPSAwO1xuICBjb25zdCBiYXNpbiA9IGhlaWdodGZpZWxkLnNwcmluZ0Jhc2luO1xuICBpZiAoYmFzaW4pIG9mZnNldCAtPSBvdmFsTWFzayh4LCB6LCBiYXNpbi54LCBiYXNpbi56LCBiYXNpbi5yYWRpdXMsIGJhc2luLnJhZGl1cyAqIDAuNzgpICogYmFzaW4uZGVwdGg7XG5cbiAgZm9yIChjb25zdCB3YXNoIG9mIGhlaWdodGZpZWxkLndhc2hDaGFubmVscyA/PyBbXSkge1xuICAgIG9mZnNldCAtPSB3YXNoQ2hhbm5lbE1hc2soeCwgeiwgd2FzaC54LCB3YXNoLnosIHdhc2gubGVuZ3RoLCB3YXNoLndpZHRoLCB3YXNoLmFuZ2xlKSAqIHdhc2guZGVwdGg7XG4gIH1cblxuICBjb25zdCBiYW5rUmVsaWVmID0gaGVpZ2h0ZmllbGQuYmFua1JlbGllZjtcbiAgaWYgKGJhbmtSZWxpZWYpIHtcbiAgICBjb25zdCBiYW5rRGlzdGFuY2UgPSBNYXRoLm1heCgwLCBNYXRoLmFicyh6KSAtIFJJVkVSX01BWF9aKTtcbiAgICBjb25zdCBuZWFyQmFuayA9IHNtb290aHN0ZXAoMC4yNSwgMi40LCBiYW5rRGlzdGFuY2UpICogKDEgLSBzbW9vdGhzdGVwKDMuMiwgYmFua1JlbGllZi53aWR0aCwgYmFua0Rpc3RhbmNlKSk7XG4gICAgY29uc3QgcmlwcGxlID0gMC43NCArIHZhbHVlTm9pc2UoeCAqIDAuMTMgKyAyLjYsIHogKiAwLjEzIC0gMTEuNCkgKiAwLjM2O1xuICAgIG9mZnNldCArPSBuZWFyQmFuayAqIGJhbmtSZWxpZWYuYW1vdW50ICogcmlwcGxlO1xuICB9XG5cbiAgcmV0dXJuIG9mZnNldDtcbn1cblxuZnVuY3Rpb24gd2FzaENoYW5uZWxNYXNrKHg6IG51bWJlciwgejogbnVtYmVyLCBjeDogbnVtYmVyLCBjejogbnVtYmVyLCBsZW5ndGg6IG51bWJlciwgd2lkdGg6IG51bWJlciwgYW5nbGU6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGR4ID0geCAtIGN4O1xuICBjb25zdCBkeiA9IHogLSBjejtcbiAgY29uc3QgY29zID0gTWF0aC5jb3MoYW5nbGUpO1xuICBjb25zdCBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG4gIGNvbnN0IGFsb25nID0gZHggKiBjb3MgKyBkeiAqIHNpbjtcbiAgY29uc3QgYWNyb3NzID0gLWR4ICogc2luICsgZHogKiBjb3M7XG4gIGNvbnN0IGxlbmd0aE1hc2sgPSAxIC0gc21vb3Roc3RlcChsZW5ndGggKiAwLjQyLCBsZW5ndGggKiAwLjUsIE1hdGguYWJzKGFsb25nKSk7XG4gIGNvbnN0IHdpZHRoTWFzayA9IDEgLSBzbW9vdGhzdGVwKHdpZHRoICogMC4zMiwgd2lkdGggKiAwLjUsIE1hdGguYWJzKGFjcm9zcyArIE1hdGguc2luKGFsb25nICogMC4xOCkgKiB3aWR0aCAqIDAuMTgpKTtcbiAgY29uc3QgZ3JhaW4gPSAwLjg0ICsgdmFsdWVOb2lzZSh4ICogMC4xNiArIDMxLjIsIHogKiAwLjE2IC0gOC4xKSAqIDAuMjQ7XG4gIHJldHVybiBUSFJFRS5NYXRoVXRpbHMuY2xhbXAobGVuZ3RoTWFzayAqIHdpZHRoTWFzayAqIGdyYWluLCAwLCAxKTtcbn1cblxuZnVuY3Rpb24gY2hhbm5lbE1hc2soeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBiYW5rRGlzdGFuY2UgPSBNYXRoLm1heCgwLCBNYXRoLmFicyh6KSAtIFJJVkVSX01BWF9aKTtcbiAgY29uc3Qgd2FycGVkWCA9IHggKyBNYXRoLnNpbih6ICogMC4xOSkgKiAzICsgTWF0aC5zaW4oeiAqIDAuMDYxKSAqIDY7XG4gIGNvbnN0IGNlbGwgPSBNYXRoLmZsb29yKCh3YXJwZWRYICsgNi41KSAvIDEzKTtcbiAgY29uc3QgY2VudGVyID0gY2VsbCAqIDEzIC0gNi41ICsgTWF0aC5zaW4oYmFua0Rpc3RhbmNlICogMC44ICsgY2VsbCkgKiAyO1xuICBjb25zdCBtYWluID0gMSAtIHNtb290aHN0ZXAoMC42LCAyLjMsIE1hdGguYWJzKHdhcnBlZFggLSBjZW50ZXIpKTtcbiAgY29uc3QgYnJhbmNoQ2VudGVyID0gY2VudGVyICsgTWF0aC5zaWduKHogfHwgMSkgKiAoMy4yICsgTWF0aC5zaW4oYmFua0Rpc3RhbmNlICogMC42ICsgY2VsbCAqIDEuOSkgKiAyLjIpO1xuICBjb25zdCBicmFuY2ggPSAoMSAtIHNtb290aHN0ZXAoMC40NSwgMS43LCBNYXRoLmFicyh3YXJwZWRYIC0gYnJhbmNoQ2VudGVyKSkpICogc21vb3Roc3RlcCg3LCAxNCwgYmFua0Rpc3RhbmNlKTtcbiAgcmV0dXJuIE1hdGgubWF4KG1haW4sIGJyYW5jaCAqIDAuNyk7XG59XG5cbmZ1bmN0aW9uIG92YWxNYXNrKHg6IG51bWJlciwgejogbnVtYmVyLCBjeDogbnVtYmVyLCBjejogbnVtYmVyLCByeDogbnVtYmVyLCByejogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgbnggPSAoeCAtIGN4KSAvIHJ4O1xuICBjb25zdCBueiA9ICh6IC0gY3opIC8gcno7XG4gIHJldHVybiAxIC0gc21vb3Roc3RlcCgwLjU0LCAxLCBueCAqIG54ICsgbnogKiBueik7XG59XG5cbmZ1bmN0aW9uIGNsYWltRmVhdHVyZUNhbG1NYXNrKHg6IG51bWJlciwgejogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKHogPD0gUklWRVJfTUFYX1ogKyBTSEFMTE9XU19XSURUSCB8fCB6ID49IDIzIHx8IE1hdGguYWJzKHgpID49IDI0KSByZXR1cm4gMTtcbiAgcmV0dXJuIHNtb290aHN0ZXAoNywgMjIsIE1hdGguYWJzKHgpKTtcbn1cblxuZnVuY3Rpb24gc3RhYmxlUHJvYmVNYXNrKHg6IG51bWJlciwgejogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgcHJvYmVzID0gW1xuICAgIFswLCAxMl0sXG4gICAgWy0xMiwgMF0sXG4gICAgWzAsIDBdLFxuICAgIFsxMiwgUklWRVJfTUFYX1ogKyBTSEFMTE9XU19XSURUSF0sXG4gICAgWzEyLCAtMThdLFxuICBdIGFzIGNvbnN0O1xuICBsZXQgbWFzayA9IDE7XG4gIGZvciAoY29uc3QgW3B4LCBwel0gb2YgcHJvYmVzKSBtYXNrICo9IHNtb290aHN0ZXAoMS44LCA0LjIsIE1hdGguaHlwb3QoeCAtIHB4LCB6IC0gcHopKTtcbiAgcmV0dXJuIG1hc2s7XG59XG5cbmZ1bmN0aW9uIG1vYmlsZVRlcnJhaW5GZWF0dXJlU2NhbGUoKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gMTtcbiAgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIDw9IDQzMCA/IEJhbGFuY2Uud29ybGQudGVycmFpbkZlYXR1cmVNb2JpbGVTY2FsZSA6IDE7XG59XG5cbmZ1bmN0aW9uIHZpc3RhVmVydGV4Q291bnQoKTogbnVtYmVyIHtcbiAgY29uc3QgeyBmdWxsQXhpcywgaW5uZXJBeGlzLCBsZWZ0QXhpcywgcmlnaHRBeGlzIH0gPSB2aXN0YUF4ZXMoKTtcbiAgY29uc3Qgb3V0ZXIgPSB2aXN0YVNlZ21lbnRzKCkgKyAxO1xuICByZXR1cm4gZnVsbEF4aXMubGVuZ3RoICogb3V0ZXIgKiAyICsgcmlnaHRBeGlzLmxlbmd0aCAqIGlubmVyQXhpcy5sZW5ndGggKyBsZWZ0QXhpcy5sZW5ndGggKiBpbm5lckF4aXMubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiB2aXN0YVJpdmVyRGlhZ25vc3RpY3MoKTogVmlzdGFEaWFnbm9zdGljc1sncml2ZXInXSB7XG4gIGNvbnN0IGF4aXMgPSB2aXN0YUF4ZXMoKS5mdWxsQXhpcztcbiAgY29uc3QgY2VudGVycyA9IGF4aXMubWFwKCh4KSA9PiB2aXN0YVJpdmVyQ2VudGVyWih4KSk7XG4gIGNvbnN0IG1lYW5kZXJBbXBsaXR1ZGUgPSBjZW50ZXJzLnJlZHVjZSgobWF4LCBjZW50ZXIpID0+IE1hdGgubWF4KG1heCwgTWF0aC5hYnMoY2VudGVyIC0gKChSSVZFUl9NSU5fWiArIFJJVkVSX01BWF9aKSAvIDIpKSksIDApO1xuICByZXR1cm4ge1xuICAgIHByZXNlbnQ6IEFDVElWRV9DT05UUkFDVC50aWxlUGFyYW1zLnJpdmVyLFxuICAgIGRyYXdDYWxsczogQUNUSVZFX0NPTlRSQUNULnRpbGVQYXJhbXMucml2ZXIgPyAxIDogMCxcbiAgICByYWRpdXM6IFZJU1RBX1JBRElVUyxcbiAgICB2ZXJ0aWNlczogcml2ZXJWaXN0YVZlcnRleENvdW50KCksXG4gICAgdmlzdWFsSGFsZldpZHRoOiByb3VuZDModmlzdWFsV2F0ZXJXaWR0aCgpIC8gMiksXG4gICAgZmFkZVN0YXJ0OiByaXZlckZhZGVTdGFydCgpLFxuICAgIHdlc3RFZGdlQ2VudGVyWjogcm91bmQzKHZpc3RhUml2ZXJDZW50ZXJaKGJvdW5kcy5taW5YKSksXG4gICAgZWFzdEVkZ2VDZW50ZXJaOiByb3VuZDModmlzdGFSaXZlckNlbnRlclooYm91bmRzLm1heFgpKSxcbiAgICB3ZXN0RmFyQ2VudGVyWjogcm91bmQzKHZpc3RhUml2ZXJDZW50ZXJaKC1WSVNUQV9SQURJVVMpKSxcbiAgICBlYXN0RmFyQ2VudGVyWjogcm91bmQzKHZpc3RhUml2ZXJDZW50ZXJaKFZJU1RBX1JBRElVUykpLFxuICAgIG1lYW5kZXJBbXBsaXR1ZGU6IHJvdW5kMyhtZWFuZGVyQW1wbGl0dWRlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gcml2ZXJWaXN0YVZlcnRleENvdW50KCk6IG51bWJlciB7XG4gIHJldHVybiB2aXN0YUF4ZXMoKS5mdWxsQXhpcy5sZW5ndGggKiA1O1xufVxuXG5mdW5jdGlvbiB2aXN0YVJpdmVyQ2VudGVyWih4OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBzaWRlID0geCA8IDAgPyAtMSA6IDE7XG4gIGNvbnN0IG91dHNpZGUgPSBNYXRoLm1heCgwLCBNYXRoLmFicyh4KSAtIENMQUlNX0hBTEYpO1xuICBjb25zdCBkeCA9IHggLSBzaWRlICogQ0xBSU1fSEFMRjtcbiAgY29uc3QgcmFtcCA9IHNtb290aHN0ZXAoMCwgMTgsIG91dHNpZGUpO1xuICByZXR1cm4gKFJJVkVSX01JTl9aICsgUklWRVJfTUFYX1opIC8gMiArIHJhbXAgKiAoTWF0aC5zaW4oZHggKiAwLjA2NSkgKiAyLjYgKyBNYXRoLnNpbihkeCAqIDAuMTM3KSAqIDAuOCk7XG59XG5cbmZ1bmN0aW9uIHJpdmVyRmFkZVN0YXJ0KCk6IG51bWJlciB7XG4gIHJldHVybiBWSVNUQV9SQURJVVMgLSAxMjtcbn1cblxuZnVuY3Rpb24gdmlzdGFTZWFtUHJvYmVQb2ludHMoKTogQXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlciB9PiB7XG4gIHJldHVybiBbXG4gICAgeyB4OiAtQ0xBSU1fSEFMRiwgejogLTI0IH0sXG4gICAgeyB4OiBDTEFJTV9IQUxGLCB6OiAtMTIgfSxcbiAgICB7IHg6IC0xOCwgejogLUNMQUlNX0hBTEYgfSxcbiAgICB7IHg6IDAsIHo6IENMQUlNX0hBTEYgfSxcbiAgICB7IHg6IDE4LCB6OiBDTEFJTV9IQUxGIH0sXG4gICAgeyB4OiBDTEFJTV9IQUxGLCB6OiA0IH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIHdhdGVyTWF0ZXJpYWxDb25maWcoZm9yZDogYm9vbGVhbiwgcmFuZ2U6IEZvcmRSYW5nZSA9IGRlZmF1bHRGb3JkUmFuZ2UoKSk6IFBhcmFtZXRlcnM8dHlwZW9mIGNyZWF0ZUxpdmluZ1dhdGVyTWF0ZXJpYWw+WzBdIHtcbiAgY29uc3Qgcml2ZXJIYWxmV2lkdGggPSAoUklWRVJfTUFYX1ogLSBSSVZFUl9NSU5fWikgLyAyO1xuICByZXR1cm4ge1xuICAgIGZvcmQsXG4gICAgcml2ZXJIYWxmV2lkdGgsXG4gICAgdmlzdWFsSGFsZldpZHRoOiB2aXN1YWxXYXRlcldpZHRoKCkgLyAyLFxuICAgIGxlbmd0aEhhbGY6IFZJU1RBX1JBRElVUyxcbiAgICBmYWRlU3RhcnQ6IHJpdmVyRmFkZVN0YXJ0KCksXG4gICAgZm9yZEhhbGZXaWR0aDogcmFuZ2UuaGFsZldpZHRoLFxuICAgIHJpdmVyRGVwdGg6IHdhdGVyRGVwdGgoJ3JpdmVyJyksXG4gICAgZm9yZERlcHRoOiB3YXRlckRlcHRoKCdmb3JkJyksXG4gICAgd2FkZURlcHRoOiBCYWxhbmNlLnRlcnJhaW5TaW0ud2FkZURlcHRoLFxuICAgIGRlZXBEZXB0aDogQmFsYW5jZS50ZXJyYWluU2ltLmRlZXBEZXB0aCxcbiAgICBhbmNob3JzOiBub2RlQW5jaG9ycy5tYXAoKGFuY2hvcikgPT4gKHtcbiAgICAgIHg6IGFuY2hvci54LFxuICAgICAgejogYW5jaG9yLnogPCAwID8gUklWRVJfTUlOX1ogKyAwLjU1IDogUklWRVJfTUFYX1ogLSAwLjU1LFxuICAgIH0pKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlzdWFsV2F0ZXJXaWR0aCgpOiBudW1iZXIge1xuICByZXR1cm4gKFRJTEVfV0FURVI/LnZpc3VhbEhhbGZXaWR0aCA/PyAoUklWRVJfTUFYX1ogLSBSSVZFUl9NSU5fWikgLyAyICsgU0hBTExPV1NfV0lEVEgpICogMjtcbn1cblxuZnVuY3Rpb24gc3luY0JhbmtNYXRlcmlhbChtZXNoOiBUSFJFRS5NZXNoKTogdm9pZCB7XG4gIGNvbnN0IHVuaWZvcm1zID0gKG1lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpLnVzZXJEYXRhLnRlcnJhaW5Vbmlmb3JtcyBhcyBUZXJyYWluU2hhZGVyVW5pZm9ybXMgfCB1bmRlZmluZWQ7XG4gIGlmICghdW5pZm9ybXMpIHJldHVybjtcbiAgY29uc3QgcGFyYW1zID0gdGVycmFpblNwbGF0UGFyYW1zKCk7XG4gIGNvbnN0IHRpbGVQYWxldHRlID0gY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcy5wYWxldHRlO1xuICB1bmlmb3Jtcy5mZWF0dXJlTWl4LnZhbHVlID0gQmFsYW5jZS50ZXJyYWluLmZlYXR1cmVNaXg7XG4gIHVuaWZvcm1zLnJvY2tBbW91bnQudmFsdWUgPSBwYXJhbXMucm9ja0Ftb3VudDtcbiAgdW5pZm9ybXMuZGFtcEJhbmQudmFsdWUgPSBwYXJhbXMuZGFtcEJhbmQ7XG4gIHVuaWZvcm1zLnNjcnViQW1vdW50LnZhbHVlID0gcGFyYW1zLnNjcnViQW1vdW50O1xuICB1bmlmb3Jtcy5tYWNyb1dhcm10aC52YWx1ZSA9IHBhcmFtcy5tYWNyb1dhcm10aDtcbiAgdW5pZm9ybXMuYW50aVRpbGUudmFsdWUgPSB0ZXJyYWluQW50aVRpbGVEaXNhYmxlZCgpID8gMCA6IHBhcmFtcy5hbnRpVGlsZTtcbiAgdW5pZm9ybXMucGFsZXR0ZVRpbnQudmFsdWUuY29weShwYWxldHRlVmVjdG9yKHRpbGVQYWxldHRlPy50aW50LCBbMSwgMSwgMV0pKTtcbiAgdW5pZm9ybXMuZGFtcFRpbnQudmFsdWUuY29weShwYWxldHRlVmVjdG9yKHRpbGVQYWxldHRlPy5kYW1wVGludCwgWzAuNCwgMC4zNywgMC4yOV0pKTtcbiAgdW5pZm9ybXMuZGFtcEFtb3VudC52YWx1ZSA9IHRpbGVQYWxldHRlPy5kYW1wQW1vdW50ID8/IDAuMjg7XG59XG5cbmZ1bmN0aW9uIHRlcnJhaW5BbnRpVGlsZURpc2FibGVkKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3RlcnJhaW5TZWFtbGVzcycpID09PSAnMCc7XG59XG5cbmZ1bmN0aW9uIHRlcnJhaW5TcGxhdFBhcmFtcygpOiBUZXJyYWluU3BsYXRQYXJhbXMge1xuICBjb25zdCB0aWxlUGFyYW1zID0gY3VycmVudENvbnRyYWN0KCkudGlsZVBhcmFtcztcbiAgY29uc3QgZGVjbGFyZWQgPSB0aWxlUGFyYW1zLnBhbGV0dGU/LnNwbGF0ID8/IHt9O1xuICBjb25zdCByaXZlckRhbXBCYW5kID0gKFRJTEVfV0FURVI/LnZpc3VhbEhhbGZXaWR0aCA/PyAoUklWRVJfTUFYX1ogLSBSSVZFUl9NSU5fWikgLyAyICsgU0hBTExPV1NfV0lEVEgpICsgMC45O1xuICBjb25zdCBkZWZhdWx0Um9jayA9IHRpbGVQYXJhbXMuaGVpZ2h0ZmllbGQ/Lndhc2hDaGFubmVscyA/IDAuNjIgOiB0aWxlUGFyYW1zLmhlaWdodGZpZWxkPy5iYW5rUmVsaWVmID8gMC4yOCA6IDAuMjI7XG4gIGNvbnN0IGRlZmF1bHRTY3J1YiA9IHRpbGVQYXJhbXMuc2NhdHRlcj8ubmVhcldhdGVyQmlhcyA/IDAuNDIgOiB0aWxlUGFyYW1zLnJpdmVyID8gMC4yIDogMC4xNDtcbiAgcmV0dXJuIHtcbiAgICByb2NrQW1vdW50OiBjbGFtcDAxKGRlY2xhcmVkLnJvY2tBbW91bnQgPz8gZGVmYXVsdFJvY2spLFxuICAgIGRhbXBCYW5kOiBNYXRoLm1heCgwLjUsIGRlY2xhcmVkLmRhbXBCYW5kID8/ICh0aWxlUGFyYW1zLnJpdmVyID8gcml2ZXJEYW1wQmFuZCA6IHRpbGVQYXJhbXMud2F0ZXJTb3VyY2VzLmxlbmd0aCA/IDIuOCA6IDEuNCkpLFxuICAgIHNjcnViQW1vdW50OiBjbGFtcDAxKGRlY2xhcmVkLnNjcnViQW1vdW50ID8/IGRlZmF1bHRTY3J1YiksXG4gICAgbWFjcm9XYXJtdGg6IE1hdGgubWF4KDAsIE1hdGgubWluKDEuNSwgZGVjbGFyZWQubWFjcm9XYXJtdGggPz8gMSkpLFxuICAgIGFudGlUaWxlOiBjbGFtcDAxKGRlY2xhcmVkLmFudGlUaWxlID8/IDAuNTgpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBwYWxldHRlVmVjdG9yKHZhbHVlOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCB1bmRlZmluZWQsIGZhbGxiYWNrOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0pOiBUSFJFRS5WZWN0b3IzIHtcbiAgY29uc3QgW3IsIGcsIGJdID0gdmFsdWUgPz8gZmFsbGJhY2s7XG4gIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMyhyLCBnLCBiKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZEJhbmtWYXJpYW50QXRsYXMoKTogUHJvbWlzZTx7IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7IHZhcmlhbnRDb3VudDogbnVtYmVyOyByb3dzOiBudW1iZXIgfSB8IG51bGw+IHtcbiAgY29uc3QgdGV4dHVyZXM6IFRIUkVFLlRleHR1cmVbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGZpbGUgb2YgQkFOS19WQVJJQU5UX0ZJTEVTKSB7XG4gICAgY29uc3QgdGV4dHVyZSA9IGF3YWl0IGxvYWRCYW5rVmFyaWFudFRleHR1cmUoZmlsZSk7XG4gICAgaWYgKHRleHR1cmUpIHRleHR1cmVzLnB1c2godGV4dHVyZSk7XG4gIH1cbiAgaWYgKHRleHR1cmVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIHJldHVybiBjcmVhdGVCYW5rQXRsYXModGV4dHVyZXMpO1xufVxuXG5mdW5jdGlvbiBsb2FkQmFua1ZhcmlhbnRUZXh0dXJlKGZpbGU6IHN0cmluZyk6IFByb21pc2U8VEhSRUUuVGV4dHVyZSB8IG51bGw+IHtcbiAgaWYgKGZpbGUgPT09ICd0ZXJyYWluLWJhbmstdGlsZS5wbmcnKSByZXR1cm4gbG9hZEdlbmVyYXRlZFRleHR1cmUoYXNzZXRTbG90cy50ZXJyYWluQmFuayk7XG4gIGNvbnN0IHVybExvYWRlciA9IHByb2Nlc3NlZFRleHR1cmVVcmxzQnlGaWxlLmdldChmaWxlKTtcbiAgaWYgKCF1cmxMb2FkZXIpIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIHJldHVybiB1cmxMb2FkZXIoKS50aGVuKFxuICAgICh1cmwpID0+XG4gICAgICBuZXcgUHJvbWlzZTxUSFJFRS5UZXh0dXJlIHwgbnVsbD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGV4dHVyZUxvYWRlci5sb2FkKFxuICAgICAgICAgIHVybCxcbiAgICAgICAgICAodGV4dHVyZSkgPT4ge1xuICAgICAgICAgICAgdGV4dHVyZS5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gICAgICAgICAgICB0ZXh0dXJlLmFuaXNvdHJvcHkgPSA0O1xuICAgICAgICAgICAgcmVzb2x2ZSh0ZXh0dXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAoKSA9PiByZXNvbHZlKG51bGwpLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgKCkgPT4gbnVsbCxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmFua0F0bGFzKHRleHR1cmVzOiBUSFJFRS5UZXh0dXJlW10pOiB7IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7IHZhcmlhbnRDb3VudDogbnVtYmVyOyByb3dzOiBudW1iZXIgfSB7XG4gIGNvbnN0IGZpcnN0SW1hZ2UgPSB0ZXh0dXJlc1swXT8uaW1hZ2UgYXMgQ2FudmFzSW1hZ2VTb3VyY2UgfCB1bmRlZmluZWQ7XG4gIGNvbnN0IHRpbGVTaXplID0gTWF0aC5tYXgoMSwgaW1hZ2VXaWR0aChmaXJzdEltYWdlKSwgaW1hZ2VIZWlnaHQoZmlyc3RJbWFnZSkpO1xuICBjb25zdCByb3dzID0gbmV4dFBvd2VyT2ZUd28odGV4dHVyZXMubGVuZ3RoKTtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy53aWR0aCA9IHRpbGVTaXplO1xuICBjYW52YXMuaGVpZ2h0ID0gdGlsZVNpemUgKiByb3dzO1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgY3JlYXRlIGJhbmsgYXRsYXMgY29udGV4dC4nKTtcblxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCByb3dzOyByb3cgKz0gMSkge1xuICAgIGNvbnN0IGltYWdlID0gKHRleHR1cmVzW01hdGgubWluKHJvdywgdGV4dHVyZXMubGVuZ3RoIC0gMSldPy5pbWFnZSA/PyBmaXJzdEltYWdlKSBhcyBDYW52YXNJbWFnZVNvdXJjZSB8IHVuZGVmaW5lZDtcbiAgICBpZiAoaW1hZ2UpIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCByb3cgKiB0aWxlU2l6ZSwgdGlsZVNpemUsIHRpbGVTaXplKTtcbiAgfVxuXG4gIHJldHVybiB7IGNhbnZhcywgdmFyaWFudENvdW50OiB0ZXh0dXJlcy5sZW5ndGgsIHJvd3MgfTtcbn1cblxuZnVuY3Rpb24gY29uZmlndXJlQmFua0F0bGFzKHRleHR1cmU6IFRIUkVFLlRleHR1cmUpOiB2b2lkIHtcbiAgdGV4dHVyZS5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gIHRleHR1cmUuYW5pc290cm9weSA9IDQ7XG4gIHRleHR1cmUud3JhcFMgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuICB0ZXh0dXJlLndyYXBUID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcbn1cblxuZnVuY3Rpb24gdGVycmFpbkJhbmtWYXJpYW50RmlsZXMoKTogc3RyaW5nW10ge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbnRyYWN0ID0gSlNPTi5wYXJzZSh0ZXJyYWluQ29udHJhY3RUZXh0KSBhcyBMYXllckNvbnRyYWN0O1xuICAgIGNvbnN0IHNsb3QgPSBjb250cmFjdC5zbG90cz8uZmluZCgoZW50cnkpID0+IGVudHJ5LnNsb3QgPT09IGFzc2V0U2xvdHMudGVycmFpbkJhbmspO1xuICAgIGNvbnN0IGZpbGVzID0gc2xvdD8udmFyaWFudHMgPz8gKHNsb3Q/LmZpbGUgPyBbc2xvdC5maWxlXSA6IFtdKTtcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQoZmlsZXMuZmlsdGVyKChmaWxlKTogZmlsZSBpcyBzdHJpbmcgPT4gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnICYmIGZpbGUubGVuZ3RoID4gMCkpXTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFsndGVycmFpbi1iYW5rLXRpbGUucG5nJ107XG4gIH1cbn1cblxubGV0IHRlcnJhaW5TZWVkQ2FjaGU6IFtzdHJpbmcsIG51bWJlcl0gfCB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHRlcnJhaW5TZWVkKCk6IG51bWJlciB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIDA7XG4gIGNvbnN0IHNlYXJjaCA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG4gIGlmICh0ZXJyYWluU2VlZENhY2hlPy5bMF0gIT09IHNlYXJjaCkgdGVycmFpblNlZWRDYWNoZSA9IFtzZWFyY2gsIG5vcm1hbGl6ZVNlZWQobmV3IFVSTFNlYXJjaFBhcmFtcyhzZWFyY2gpLmdldCgnc2VlZCcpKSAvIDQyOTQ5NjcyOTZdO1xuICByZXR1cm4gdGVycmFpblNlZWRDYWNoZVsxXTtcbn1cblxuZnVuY3Rpb24gdmFsdWVOb2lzZSh4OiBudW1iZXIsIHo6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGl4ID0gTWF0aC5mbG9vcih4KTtcbiAgY29uc3QgaXogPSBNYXRoLmZsb29yKHopO1xuICBjb25zdCBmeCA9IHNtb290aDAxKHggLSBpeCk7XG4gIGNvbnN0IGZ6ID0gc21vb3RoMDEoeiAtIGl6KTtcbiAgY29uc3QgYSA9IHRlcnJhaW5IYXNoKGl4LCBpeik7XG4gIGNvbnN0IGIgPSB0ZXJyYWluSGFzaChpeCArIDEsIGl6KTtcbiAgY29uc3QgYyA9IHRlcnJhaW5IYXNoKGl4LCBpeiArIDEpO1xuICBjb25zdCBkID0gdGVycmFpbkhhc2goaXggKyAxLCBpeiArIDEpO1xuICByZXR1cm4gVEhSRUUuTWF0aFV0aWxzLmxlcnAoVEhSRUUuTWF0aFV0aWxzLmxlcnAoYSwgYiwgZngpLCBUSFJFRS5NYXRoVXRpbHMubGVycChjLCBkLCBmeCksIGZ6KTtcbn1cblxuZnVuY3Rpb24gdGVycmFpbkhhc2goeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBzZWVkID0gdGVycmFpblNlZWQoKSAqIDk5Ny4zMTtcbiAgcmV0dXJuIGZyYWN0KE1hdGguc2luKHggKiAxMjcuMSArIHogKiAzMTEuNyArIHNlZWQpICogNDM3NTguNTQ1MzEyMyk7XG59XG5cbmZ1bmN0aW9uIHNtb290aHN0ZXAoZWRnZTA6IG51bWJlciwgZWRnZTE6IG51bWJlciwgdmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChlZGdlMCA9PT0gZWRnZTEpIHJldHVybiB2YWx1ZSA8IGVkZ2UwID8gMCA6IDE7XG4gIHJldHVybiBzbW9vdGgwMShUSFJFRS5NYXRoVXRpbHMuY2xhbXAoKHZhbHVlIC0gZWRnZTApIC8gKGVkZ2UxIC0gZWRnZTApLCAwLCAxKSk7XG59XG5cbmZ1bmN0aW9uIHNtb290aDAxKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdmFsdWUgKiB2YWx1ZSAqICgzIC0gMiAqIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gY2xhbXAwMSh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIFRIUkVFLk1hdGhVdGlscy5jbGFtcCh2YWx1ZSwgMCwgMSk7XG59XG5cbmZ1bmN0aW9uIHJvdW5kMyh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgucm91bmQodmFsdWUgKiAxMDAwKSAvIDEwMDA7XG59XG5cbmZ1bmN0aW9uIGZyYWN0KHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdmFsdWUgLSBNYXRoLmZsb29yKHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gaW1hZ2VXaWR0aChpbWFnZTogQ2FudmFzSW1hZ2VTb3VyY2UgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICBpZiAoIWltYWdlKSByZXR1cm4gNTEyO1xuICBpZiAoJ3ZpZGVvV2lkdGgnIGluIGltYWdlKSByZXR1cm4gaW1hZ2UudmlkZW9XaWR0aDtcbiAgaWYgKCdkaXNwbGF5V2lkdGgnIGluIGltYWdlKSByZXR1cm4gaW1hZ2UuZGlzcGxheVdpZHRoO1xuICBpZiAoJ3dpZHRoJyBpbiBpbWFnZSkgcmV0dXJuIHR5cGVvZiBpbWFnZS53aWR0aCA9PT0gJ251bWJlcicgPyBpbWFnZS53aWR0aCA6IGltYWdlLndpZHRoLmJhc2VWYWwudmFsdWU7XG4gIHJldHVybiA1MTI7XG59XG5cbmZ1bmN0aW9uIGltYWdlSGVpZ2h0KGltYWdlOiBDYW52YXNJbWFnZVNvdXJjZSB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICghaW1hZ2UpIHJldHVybiA1MTI7XG4gIGlmICgndmlkZW9IZWlnaHQnIGluIGltYWdlKSByZXR1cm4gaW1hZ2UudmlkZW9IZWlnaHQ7XG4gIGlmICgnZGlzcGxheUhlaWdodCcgaW4gaW1hZ2UpIHJldHVybiBpbWFnZS5kaXNwbGF5SGVpZ2h0O1xuICBpZiAoJ2hlaWdodCcgaW4gaW1hZ2UpIHJldHVybiB0eXBlb2YgaW1hZ2UuaGVpZ2h0ID09PSAnbnVtYmVyJyA/IGltYWdlLmhlaWdodCA6IGltYWdlLmhlaWdodC5iYXNlVmFsLnZhbHVlO1xuICByZXR1cm4gNTEyO1xufVxuXG5mdW5jdGlvbiBuZXh0UG93ZXJPZlR3byh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IHBvd2VyID0gMTtcbiAgd2hpbGUgKHBvd2VyIDwgdmFsdWUpIHBvd2VyICo9IDI7XG4gIHJldHVybiBwb3dlcjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQmFua1RleHR1cmUoKTogVEhSRUUuQ2FudmFzVGV4dHVyZSB7XG4gIGNvbnN0IHNpemUgPSA1MTI7XG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSBzaXplO1xuICBjYW52YXMuaGVpZ2h0ID0gc2l6ZTtcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGNyZWF0ZSBiYW5rIHRleHR1cmUgY29udGV4dC4nKTtcblxuICBjb250ZXh0LmZpbGxTdHlsZSA9IHBhbGV0dGUuc2FuZDtcbiAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgxOTYsIDEzNiwgNTgsIDAuMTIpJztcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA5MDA7IGkgKz0gMSkge1xuICAgIGNvbnN0IHggPSAoaSAqIDcxKSAlIHNpemU7XG4gICAgY29uc3QgeSA9IChpICogMTQ5KSAlIHNpemU7XG4gICAgY29udGV4dC5maWxsUmVjdCh4LCB5LCAxLCAxKTtcbiAgfVxuICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3JnYmEoNDYsIDI3LCAxNCwgMC4xMyknO1xuICBjb250ZXh0LmxpbmVXaWR0aCA9IDE7XG4gIGZvciAobGV0IHkgPSAtc2l6ZTsgeSA8IHNpemUgKiAyOyB5ICs9IDE4KSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbygwLCB5KTtcbiAgICBjb250ZXh0LmxpbmVUbyhzaXplLCB5ICsgc2l6ZSAqIDAuMzUpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH1cbiAgY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSg5MSwgMTIyLCA4MywgMC4xNiknO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpICs9IDEpIHtcbiAgICBjb25zdCB4ID0gKGkgKiAxMTMpICUgc2l6ZTtcbiAgICBjb25zdCB5ID0gKGkgKiAxOTcpICUgc2l6ZTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuZWxsaXBzZSh4LCB5LCA1LCAxLjYsIChpICUgNikgKiAwLjQ1LCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5maWxsKCk7XG4gIH1cblxuICBjb25zdCB0ZXh0dXJlID0gbmV3IFRIUkVFLkNhbnZhc1RleHR1cmUoY2FudmFzKTtcbiAgdGV4dHVyZS5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gIHJldHVybiB0ZXh0dXJlO1xufVxuIl19