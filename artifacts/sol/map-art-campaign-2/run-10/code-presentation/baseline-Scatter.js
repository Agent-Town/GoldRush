import * as THREE from "/node_modules/.vite/deps/three.js?v=cbd9d258";
import { createRng, normalizeSeed } from "/src/core/Rng.ts";
import { RenderLayers } from "/src/core/RenderLayers.ts";
import { Balance } from "/src/game/Balance.ts";
import { activeContract } from "/src/meta/ContractFamilies.ts";
import { disposeObject3D } from "/src/utils/dispose.ts";
import { createOpaquePropBatch } from "/src/town/OpaquePropBatchPilot.ts";
import * as Terrain from "/src/world/Terrain.ts";
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
const TINT_JITTER = {
	rocks: {
		warm: .09,
		value: .16
	},
	stumps: {
		warm: .07,
		value: .13
	},
	dry_grass: {
		warm: .11,
		value: .22
	},
	claim_posts: {
		warm: .06,
		value: .12
	},
	cactus: {
		warm: .08,
		value: .18
	},
	reeds: {
		warm: .07,
		value: .16
	}
};
/** Classes whose bodies stand up off the ground and therefore owe it a contact shadow. */
const CONTACT_SHADOW_CLASSES = {
	rocks: {
		radius: .55,
		squash: .62
	},
	cactus: {
		radius: .42,
		squash: .74
	},
	stumps: {
		radius: .44,
		squash: .7
	},
	dry_grass: {
		radius: .3,
		squash: .66
	},
	claim_posts: {
		radius: .24,
		squash: .8
	}
};
/**
* The brief proposed ~0.14. Measured at the run camera that moved 0.2% of the frame — technically
* present, invisible in play, because the scatter is small and far at the shipped zoom. 0.19 with
* wider ellipses is the value that reads without turning the ground into a polka dot.
*/
const CONTACT_SHADOW_OPACITY = .19;
const CONTACT_SHADOW_LIFT = .016;
const BUILD_PAD_PROBE = {
	x: 0,
	z: 9
};
const FORD_PROBE = {
	x: 0,
	z: (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2
};
const ROUTING_PROBE = {
	x: 0,
	z: -14
};
const SCATTER_DESCRIPTOR = activeContract().tileParams.scatter;
export class DetailScatter {
	group = new THREE.Group();
	classes;
	seededInstances = [];
	seed = scatterSeed();
	densityTier;
	contactShadows;
	buildingClearings = [];
	clearingsSignature = "";
	constructor() {
		this.group.name = "DetailScatter";
		this.densityTier = densityTier();
		const density = detailDensity(this.densityTier);
		this.classes = createProfiles().map((profile) => this.createClass(profile, density));
		this.contactShadows = createContactShadows(this.seededInstances);
		this.group.add(this.contactShadows);
		this.batchOpaqueClasses();
		this.syncBuildingClearings([]);
	}
	syncBuildingClearings(clearings) {
		const signature = clearings.map((point) => `${point.x.toFixed(1)},${point.z.toFixed(1)},${point.radius.toFixed(1)}`).join("|");
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
	diagnostics() {
		const classes = this.classes.map((entry) => ({
			id: entry.profile.id,
			instances: entry.instances.length,
			visibleInstances: entry.instances.filter((detail) => !detail.hidden).length,
			drawCalls: 1
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
				buildingClearRadius: Balance.world.detailBuildingClearRadius
			},
			probes: {
				buildPad: probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildPadClearRadius),
				ford: probeClear(this.seededInstances, FORD_PROBE.x, FORD_PROBE.z, (Terrain.RIVER_MAX_Z - Terrain.RIVER_MIN_Z) / 2 + Terrain.SHALLOWS_WIDTH),
				routingLane: probeClear(this.seededInstances, ROUTING_PROBE.x, ROUTING_PROBE.z, Balance.world.detailRoutingLaneClearRadius),
				building: this.buildingClearings[0] ? probeClear(this.seededInstances, this.buildingClearings[0].x, this.buildingClearings[0].z, this.buildingClearings[0].radius) : probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildingClearRadius)
			},
			signature: this.seededInstances.slice(0, 12).map((detail) => `${detail.x.toFixed(2)},${detail.z.toFixed(2)}`).join("|")
		};
	}
	dispose() {
		disposeObject3D(this.group);
	}
	/** F-ASTRA-6: the census found 68–88% of the solid scatter outside the camera.
	* Flatten static instances into two compatible opaque draws, preserving each class's
	* linear tint, roughness, metalness and sidedness. Reeds retain their instanced sway;
	* ruts and every contact shadow retain their original transparent render-list item. */
	batchOpaqueClasses() {
		const cohorts = new Map();
		for (const entry of this.classes) {
			const material = entry.profile.material;
			if (!(material instanceof THREE.MeshStandardMaterial) || material.transparent || material.alphaTest > 0 || material.userData.reedTime || !entry.instances.length) continue;
			const key = `${material.side}:${material.metalness}`;
			const cohort = cohorts.get(key) ?? [];
			cohort.push(entry);
			cohorts.set(key, cohort);
		}
		for (const cohort of cohorts.values()) {
			const material = cohort[0].profile.material.clone();
			material.color.setRGB(1, 1, 1);
			material.vertexColors = true;
			material.customProgramCacheKey = () => "opaque-scatter-roughness-v1";
			material.onBeforeCompile = (shader) => {
				shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float scatterRoughness;\nvarying float vScatterRoughness;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvScatterRoughness = scatterRoughness;");
				shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vScatterRoughness;").replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = vScatterRoughness;");
			};
			const parts = [];
			const temporary = [];
			for (const entry of cohort) {
				const source = entry.profile.material;
				for (const detail of entry.instances) {
					const geometry = new THREE.BufferGeometry();
					geometry.setAttribute("position", entry.profile.geometry.getAttribute("position").clone());
					geometry.setAttribute("normal", entry.profile.geometry.getAttribute("normal").clone());
					if (entry.profile.geometry.index) geometry.setIndex(entry.profile.geometry.index.clone());
					const count = geometry.getAttribute("position").count;
					const color = new THREE.Color();
					entry.mesh.getColorAt(detail.index, color);
					color.multiply(source.color);
					const colors = new Float32Array(count * 3);
					for (let vertex = 0; vertex < count; vertex++) color.toArray(colors, vertex * 3);
					geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
					geometry.setAttribute("scatterRoughness", new THREE.BufferAttribute(new Float32Array(count).fill(source.roughness), 1));
					const matrix = new THREE.Matrix4();
					entry.mesh.getMatrixAt(detail.index, matrix);
					parts.push({
						geometry,
						matrix,
						hidden: () => detail.hidden
					});
					temporary.push(geometry);
				}
				// Keep the logical class and its seeded placement records for clearing diagnostics.
				// This source mesh is never submitted; all rendering belongs to its opaque batch.
				entry.mesh.visible = false;
			}
			const batch = createOpaquePropBatch(parts, material);
			temporary.forEach((geometry) => geometry.dispose());
			batch.name = `DetailScatter.opaque.${cohort.map((entry) => entry.profile.id).join("+")}`;
			batch.userData.opaqueSourceIds = cohort.map((entry) => entry.mesh.id);
			batch.receiveShadow = true;
			this.group.add(batch);
		}
	}
	createClass(profile, density) {
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
		const instances = [];
		for (let index = 0; index < count; index += 1) {
			const placed = placeDetail(profile, rng, instances);
			if (profile.instanceTint) mesh.setColorAt(index, profile.instanceTint(tintRng));
			if (!placed) {
				mesh.setMatrixAt(index, hiddenMatrix);
				continue;
			}
			const detail = {
				...placed,
				hidden: false,
				mesh,
				index,
				shadowIndex: CONTACT_SHADOW_CLASSES[profile.id] ? this.seededInstances.length : -1
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
		const swayTime = profile.material.userData.reedTime ?? null;
		if (swayTime) {
			let lastFrame = -1;
			let last = 0;
			mesh.onBeforeRender = (renderer) => {
				if (renderer.info.render.frame === lastFrame) return;
				lastFrame = renderer.info.render.frame;
				const now = performance.now();
				swayTime.value += last === 0 ? 0 : Math.min(.1, Math.max(0, (now - last) / 1e3));
				last = now;
			};
		}
		return {
			profile,
			mesh,
			instances
		};
	}
}
function createProfiles() {
	return [
		{
			id: "rocks",
			baseCount: profileCount("rocks", 44),
			geometry: rockGeometry(),
			material: standardMaterial("#8c7f6d", .9),
			minScale: .55,
			maxScale: 1.25,
			baseY: 0
		},
		{
			id: "stumps",
			baseCount: profileCount("stumps", 18),
			geometry: stumpGeometry(),
			material: standardMaterial("#4f331f", .86),
			minScale: .72,
			maxScale: 1.15,
			baseY: 0
		},
		{
			id: "dry_grass",
			baseCount: profileCount("dry_grass", 92),
			geometry: grassGeometry(),
			material: new THREE.MeshStandardMaterial({
				color: "#7b8050",
				roughness: 1,
				metalness: 0,
				side: THREE.DoubleSide
			}),
			minScale: .58,
			maxScale: 1.35,
			baseY: .01
		},
		{
			id: "wagon_ruts",
			baseCount: profileCount("wagon_ruts", 24),
			geometry: new THREE.PlaneGeometry(1.9, .46),
			material: rutMaterial(),
			minScale: .72,
			maxScale: 1.4,
			baseY: .018,
			groundRotationX: -Math.PI / 2
		},
		{
			id: "claim_posts",
			baseCount: profileCount("claim_posts", 12),
			geometry: claimPostGeometry(),
			material: standardMaterial("#6f5732", .78),
			minScale: .82,
			maxScale: 1.1,
			baseY: 0
		},
		{
			id: "cactus",
			baseCount: profileCount("cactus", 0),
			geometry: cactusGeometry(),
			material: standardMaterial("#4f6f4a", .92),
			minScale: .74,
			maxScale: 1.25,
			baseY: 0
		},
		{
			id: "reeds",
			baseCount: profileCount("reeds", 0),
			geometry: reedGeometry(),
			material: reedMaterial(),
			minScale: .72,
			maxScale: 1.42,
			baseY: .01,
			instanceTint: reedTint,
			// Scatter never casts a shadow (castShadow is off for every class, by budget), so a tuft
			// with no contact patch floats. Only the bigger half get one; a patch under every sprig
			// reads as mould.
			contact: {
				radius: .38,
				minScale: .98
			}
		}
	];
}
function profileCount(id, fallback) {
	return Math.max(0, Math.floor(SCATTER_DESCRIPTOR?.classCounts?.[id] ?? fallback));
}
function placeDetail(profile, rng, placedInClass) {
	const attempts = Math.max(40, profile.baseCount * 80);
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		const x = rng.range(Terrain.bounds.minX + 1, Terrain.bounds.maxX - 1);
		const z = rng.range(Terrain.bounds.minZ + 1, Terrain.bounds.maxZ - 1);
		if (Terrain.sample(x, z).zone !== "bank") continue;
		if (staticExcluded(x, z)) continue;
		if (rng.next() > detailAcceptance(profile, x, z)) continue;
		if (tooCloseToClass(x, z, placedInClass)) continue;
		const scale = rng.range(profile.minScale, profile.maxScale);
		return {
			x,
			z,
			y: Terrain.visualY(x, z, profile.baseY, .35),
			rotation: rng.range(0, Math.PI * 2),
			scale
		};
	}
	return null;
}
function staticExcluded(x, z) {
	if (Terrain.routingLaneDistance(x, z) < Balance.world.detailRoutingLaneClearRadius) return true;
	if (distanceSq(x, z, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z) < Balance.world.detailBuildPadClearRadius ** 2) return true;
	for (const anchor of Terrain.nodeAnchors) {
		if (distanceSq(x, z, anchor.x, anchor.z) < Balance.world.detailHarvestAnchorClearRadius ** 2) return true;
	}
	return false;
}
function routingLaneDistance(x, z) {
	return Terrain.routingLaneDistance(x, z);
}
function detailAcceptance(profile, x, z) {
	const feature = Terrain.terrainFeatureSample(x, z);
	const edge = Math.max(Math.abs(x) / Terrain.CLAIM_HALF, Math.abs(z) / Terrain.CLAIM_HALF);
	const lane = Math.min(1, routingLaneDistance(x, z) / 10);
	const base = .16 + edge * .74 + lane * .12;
	if (profile.id === "cactus") {
		const dryEdge = smoothstep(7, 20, Math.abs(z)) * (1 - nearWaterMask(x, z));
		return THREE.MathUtils.clamp(base * dryEdge * (.7 + feature.shelf * 1.2 + feature.bluff * .4), .04, .88);
	}
	if (profile.id === "reeds") {
		const water = nearWaterMask(x, z);
		const bias = SCATTER_DESCRIPTOR?.nearWaterBias ?? 1;
		return THREE.MathUtils.clamp((.14 + water * 1.6 * bias) * (.7 + lane * .35), .02, .96);
	}
	const bias = profile.id === "rocks" ? .42 + feature.shelf * 1.45 + feature.bluff * .55 : profile.id === "dry_grass" ? .58 + feature.pocket * 1.15 - feature.gully * .18 : .76 + feature.pocket * .18;
	return THREE.MathUtils.clamp(base * bias, .08, .98);
}
function nearWaterMask(x, z) {
	let mask = Terrain.hasRiverWater() ? 1 - smoothstep(.8, 6.5, Math.max(0, Math.abs(z - (Terrain.RIVER_MIN_Z + Terrain.RIVER_MAX_Z) / 2) - (Terrain.RIVER_MAX_Z - Terrain.RIVER_MIN_Z) / 2)) : 0;
	for (const source of Terrain.waterSources()) {
		mask = Math.max(mask, 1 - smoothstep(source.radius + .35, source.radius + 5.5, Math.hypot(x - source.x, z - source.z)));
	}
	return THREE.MathUtils.clamp(mask, 0, 1);
}
function tooCloseToClass(x, z, placed) {
	for (const detail of placed) {
		if (distanceSq(x, z, detail.x, detail.z) < .7 * .7) return true;
	}
	return false;
}
function writeInstance(mesh, index, detail, hidden) {
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
function createContactShadows(details) {
	const shadowed = details.filter((detail) => detail.shadowIndex >= 0);
	const mesh = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), new THREE.MeshBasicMaterial({
		color: "#2e1b0e",
		transparent: true,
		opacity: CONTACT_SHADOW_OPACITY,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1
	}), Math.max(1, shadowed.length));
	mesh.name = "DetailScatter.contactShadows";
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
function writeContactShadow(mesh, slot, detail, hidden) {
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
	scratchObject.position.set(detail.x, Terrain.visualY(detail.x, detail.z, 0, .35) + CONTACT_SHADOW_LIFT, detail.z);
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
function instanceTint(id, x, z) {
	const jitter = TINT_JITTER[id];
	if (!jitter) return scratchColor.setRGB(1, 1, 1);
	const warm = hash01(x * 12.9898 + z * 78.233) - .5;
	const value = hash01(x * 39.3468 - z * 11.135 + 7.31) - .5;
	const scale = 1 + value * jitter.value * 2;
	return scratchColor.setRGB(scale * (1 + warm * jitter.warm), scale, scale * (1 - warm * jitter.warm));
}
function hash01(value) {
	const scaled = Math.sin(value) * 43758.5453;
	return scaled - Math.floor(scaled);
}
function profileForMesh(mesh) {
	return mesh.userData.detailProfile;
}
function isNearAny(detail, clearings) {
	for (const clearing of clearings) {
		if (distanceSq(detail.x, detail.z, clearing.x, clearing.z) < clearing.radius * clearing.radius) return true;
	}
	return false;
}
function probeClear(details, x, z, clearRadius) {
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
		clear: nearest === null || nearest >= clearRadius
	};
}
function detailDensity(tier) {
	if (tier === "off") return 0;
	const raw = tier === "mobile-reduced" ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
	return THREE.MathUtils.clamp(raw * (SCATTER_DESCRIPTOR?.density ?? 1), 0, 1.5);
}
function densityTier() {
	const mobile = typeof window !== "undefined" && window.innerWidth <= 430;
	const density = mobile ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
	if (density <= 0) return "off";
	return mobile ? "mobile-reduced" : "desktop";
}
function scatterSeed() {
	const raw = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("seed");
	return (normalizeSeed(raw) ^ 1374772973) >>> 0;
}
function distanceSq(ax, az, bx, bz) {
	const dx = ax - bx;
	const dz = az - bz;
	return dx * dx + dz * dz;
}
function standardMaterial(color, roughness) {
	return new THREE.MeshStandardMaterial({
		color,
		roughness,
		metalness: .02
	});
}
function rockGeometry() {
	const geometry = new THREE.DodecahedronGeometry(.34, 0);
	geometry.scale(1.25, .55, .9);
	geometry.translate(0, .2, 0);
	return geometry;
}
function stumpGeometry() {
	const geometry = new THREE.CylinderGeometry(.2, .28, .44, 7);
	geometry.translate(0, .22, 0);
	return geometry;
}
function claimPostGeometry() {
	const geometry = new THREE.BoxGeometry(.16, 1.08, .16);
	geometry.translate(0, .54, 0);
	return geometry;
}
function cactusGeometry() {
	const geometry = new THREE.CylinderGeometry(.13, .18, .88, 7);
	geometry.translate(0, .44, 0);
	return geometry;
}
// A REED IS NOT A BLADE OF GRASS (docs/beauty/e1-twin-banks-brief.md U3). The reeds class used
// to be grassGeometry scaled thinner: two crossed quads of equal height, which at the run camera
// read as four identical bright matchsticks stuck in dry dirt — on a map whose briefing card
// promises "damp reeds". Three unequal tapered blades, leaning off-axis, give a tuft a silhouette
// that survives 390px; the sway, the per-instance tint and the contact patch do the rest.
const REED_BLADES = [
	{
		angle: 0,
		height: .88,
		lean: .12,
		width: .085
	},
	{
		angle: 1.09,
		height: .7,
		lean: -.16,
		width: .072
	},
	{
		angle: 2.24,
		height: 1.02,
		lean: .06,
		width: .078
	}
];
// The class it replaces, in the renderer's working (linear) space. Anything derived from a
// contract tint has to be MODULATED against this, never used as an albedo: dampTint is a
// splat multiplier around 0.5, which as a linear albedo is five times the value this
// silhouette was authored at, and the first cut of U3 bleached every reed to dead straw.
const REED_BASE = {
	r: .095,
	g: .15,
	b: .052
};
const REED_DRY = {
	r: .155,
	g: .125,
	b: .055
};
function reedGeometry() {
	const positions = [];
	const indices = [];
	for (const blade of REED_BLADES) {
		const along = {
			x: Math.cos(blade.angle),
			z: Math.sin(blade.angle)
		};
		const base = positions.length / 3;
		// Tapered quad: a wide root, a tip pulled sideways so no two blades stand parallel.
		positions.push(-along.x * blade.width, 0, -along.z * blade.width, along.x * blade.width, 0, along.z * blade.width, -along.x * blade.width * .22 + along.x * blade.lean, blade.height, -along.z * blade.width * .22 + along.z * blade.lean, along.x * blade.width * .22 + along.x * blade.lean, blade.height, along.z * blade.width * .22 + along.z * blade.lean);
		indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}
function reedMaterial() {
	const material = new THREE.MeshStandardMaterial({
		color: "#ffffff",
		roughness: 1,
		metalness: 0,
		side: THREE.DoubleSide
	});
	const time = { value: 0 };
	material.userData.reedTime = time;
	material.customProgramCacheKey = () => "reed-sway";
	material.onBeforeCompile = (shader) => {
		shader.uniforms.uReedTime = time;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uReedTime;").replace("#include <begin_vertex>", `#include <begin_vertex>
        // Phase from the instance's own world position: neighbouring tufts never bend in step,
        // and the whole field costs one uniform and no CPU work per frame.
        float reedPhase = instanceMatrix[3].x * 0.71 + instanceMatrix[3].z * 0.93;
        float reedSway = sin(uReedTime * 1.25 + reedPhase) * 0.06 + sin(uReedTime * 2.6 + reedPhase * 1.7) * 0.022;
        transformed.x += reedSway * transformed.y;
        transformed.z += reedSway * 0.42 * transformed.y;`);
	};
	return material;
}
/** Damp green-grey pulled toward the tile's own dampTint HUE, jittered per instance. */
function reedTint(rng) {
	const damp = activeContract().tileParams.palette?.dampTint ?? [
		.45,
		.53,
		.4
	];
	const mean = Math.max(.001, (damp[0] + damp[1] + damp[2]) / 3);
	const value = rng.range(.78, 1.26);
	// A minority of every reed bed is last season's dry stalk; squared so it stays a minority.
	const dry = rng.range(0, 1) ** 2 * .55;
	const channel = (base, dried, tint) => THREE.MathUtils.lerp(base * (tint / mean), dried, dry) * value;
	return new THREE.Color().setRGB(channel(REED_BASE.r, REED_DRY.r, damp[0]), channel(REED_BASE.g, REED_DRY.g, damp[1]), channel(REED_BASE.b, REED_DRY.b, damp[2]), THREE.LinearSRGBColorSpace);
}
function contactPatchMesh(details, profile) {
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
		object.position.set(detail.x, detail.y + .012, detail.z);
		object.rotation.set(-Math.PI / 2, 0, detail.rotation);
		object.scale.set(detail.scale, detail.scale * .72, 1);
		object.updateMatrix();
		mesh.setMatrixAt(index, object.matrix);
	}
	mesh.instanceMatrix.needsUpdate = true;
	return mesh;
}
function contactMaterial() {
	const size = 64;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (context) {
		const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
		gradient.addColorStop(0, "rgba(28, 22, 12, 0.62)");
		gradient.addColorStop(.55, "rgba(28, 22, 12, 0.28)");
		gradient.addColorStop(1, "rgba(28, 22, 12, 0)");
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
		polygonOffsetUnits: -1
	});
}
function grassGeometry() {
	const width = .32;
	const height = .58;
	const positions = [
		-width,
		0,
		0,
		width,
		0,
		0,
		-width,
		height,
		0,
		width,
		height * .82,
		0,
		0,
		0,
		-width,
		0,
		0,
		width,
		0,
		height * .88,
		-width,
		0,
		height,
		width
	];
	const indices = [
		0,
		1,
		2,
		2,
		1,
		3,
		4,
		5,
		6,
		6,
		5,
		7
	];
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}
function rutMaterial() {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 64;
	const context = canvas.getContext("2d");
	if (context) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = "rgba(82, 54, 31, 0.34)";
		context.lineWidth = 8;
		for (const y of [22, 42]) {
			context.beginPath();
			for (let x = 0; x <= canvas.width; x += 16) {
				const wobble = Math.sin(x * .055 + y) * 2;
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
		opacity: .68,
		depthWrite: false,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1,
		side: THREE.DoubleSide
	});
}
function smoothstep(edge0, edge1, value) {
	if (edge0 === edge1) return value < edge0 ? 0 : 1;
	const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

//# sourceMappingURL=data:application/json;base64,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QUFJLElBQUksT0FBUSxDQUFDLElBQUk7SUFDekMsSUFBSSxNQUFNLEdBQUcsUUFBUSxPQUFPLEdBQUcsSUFBSSxNQUFNO1NBQ3BDLFFBQVEsT0FBTyxHQUFHLElBQUksTUFBTTtHQUNuQztHQUNBLFFBQVEsT0FBTztFQUNqQjtDQUNGO0NBQ0EsTUFBTSxVQUFVLElBQUksTUFBTSxjQUFjLE1BQU07Q0FDOUMsUUFBUSxhQUFhLE1BQU07Q0FDM0IsUUFBUSxhQUFhO0NBQ3JCLE9BQU8sSUFBSSxNQUFNLGtCQUFrQjtFQUNqQyxLQUFLO0VBQ0wsYUFBYTtFQUNiLFNBQVM7RUFDVCxZQUFZO0VBQ1osZUFBZTtFQUNmLHFCQUFxQixDQUFDO0VBQ3RCLG9CQUFvQixDQUFDO0VBQ3JCLE1BQU0sTUFBTTtDQUNkLENBQUM7QUFDSDtBQUVBLFNBQVMsV0FBVyxPQUFlLE9BQWUsT0FBdUI7Q0FDdkUsSUFBSSxVQUFVLE9BQU8sT0FBTyxRQUFRLFFBQVEsSUFBSTtDQUNoRCxNQUFNLElBQUksS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksUUFBUSxVQUFVLFFBQVEsTUFBTSxDQUFDO0NBQ3BFLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSTtBQUMxQiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJTY2F0dGVyLnRzIl0sInZlcnNpb24iOjMsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB7IGNyZWF0ZVJuZywgbm9ybWFsaXplU2VlZCwgdHlwZSBSbmcgfSBmcm9tICcuLi9jb3JlL1JuZyc7XG5pbXBvcnQgeyBSZW5kZXJMYXllcnMgfSBmcm9tICcuLi9jb3JlL1JlbmRlckxheWVycyc7XG5pbXBvcnQgeyBCYWxhbmNlIH0gZnJvbSAnLi4vZ2FtZS9CYWxhbmNlJztcbmltcG9ydCB7IGFjdGl2ZUNvbnRyYWN0LCB0eXBlIENvbnRyYWN0RGV0YWlsQ2xhc3MgfSBmcm9tICcuLi9tZXRhL0NvbnRyYWN0RmFtaWxpZXMnO1xuaW1wb3J0IHsgZGlzcG9zZU9iamVjdDNEIH0gZnJvbSAnLi4vdXRpbHMvZGlzcG9zZSc7XG5pbXBvcnQgeyBjcmVhdGVPcGFxdWVQcm9wQmF0Y2gsIHR5cGUgT3BhcXVlUHJvcFBhcnQgfSBmcm9tICcuLi90b3duL09wYXF1ZVByb3BCYXRjaFBpbG90JztcbmltcG9ydCAqIGFzIFRlcnJhaW4gZnJvbSAnLi9UZXJyYWluJztcblxuZXhwb3J0IHR5cGUgRGV0YWlsQ2xhc3NJZCA9IENvbnRyYWN0RGV0YWlsQ2xhc3M7XG5leHBvcnQgdHlwZSBEZXRhaWxEZW5zaXR5VGllciA9ICdkZXNrdG9wJyB8ICdtb2JpbGUtcmVkdWNlZCcgfCAnb2ZmJztcblxuZXhwb3J0IHR5cGUgRGV0YWlsU2NhdHRlckNsZWFyUG9pbnQgPSB7XG4gIHg6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICByYWRpdXM6IG51bWJlcjtcbn07XG5cbmV4cG9ydCB0eXBlIERldGFpbFNjYXR0ZXJEaWFnbm9zdGljcyA9IHtcbiAgaW5zdGFuY2VDbGFzc2VzOiBudW1iZXI7XG4gIC8qKiBHcm91bmQtY29udGFjdCBlbGxpcHNlcyBkcmF3biBpbiBvbmUgY2FsbCBmb3IgZXZlcnkgc3RhbmRpbmcgc2NhdHRlciBjbGFzcy4gKi9cbiAgY29udGFjdFNoYWRvd3M6IG51bWJlcjtcbiAgdG90YWxJbnN0YW5jZXM6IG51bWJlcjtcbiAgc2VlZGVkSW5zdGFuY2VzOiBudW1iZXI7XG4gIGRlbnNpdHlUaWVyOiBEZXRhaWxEZW5zaXR5VGllcjtcbiAgc2VlZDogbnVtYmVyO1xuICBjbGFzc2VzOiBBcnJheTx7IGlkOiBEZXRhaWxDbGFzc0lkOyBpbnN0YW5jZXM6IG51bWJlcjsgdmlzaWJsZUluc3RhbmNlczogbnVtYmVyOyBkcmF3Q2FsbHM6IDEgfT47XG4gIGV4Y2x1c2lvbnM6IHtcbiAgICBidWlsZFBhZFJhZGl1czogbnVtYmVyO1xuICAgIHJvdXRpbmdMYW5lUmFkaXVzOiBudW1iZXI7XG4gICAgaGFydmVzdEFuY2hvclJhZGl1czogbnVtYmVyO1xuICAgIGJ1aWxkaW5nQ2xlYXJSYWRpdXM6IG51bWJlcjtcbiAgfTtcbiAgcHJvYmVzOiBSZWNvcmQ8J2J1aWxkUGFkJyB8ICdmb3JkJyB8ICdyb3V0aW5nTGFuZScgfCAnYnVpbGRpbmcnLCBEZXRhaWxTY2F0dGVyUHJvYmU+O1xuICBzaWduYXR1cmU6IHN0cmluZztcbn07XG5cbnR5cGUgRGV0YWlsU2NhdHRlclByb2JlID0ge1xuICB4OiBudW1iZXI7XG4gIHo6IG51bWJlcjtcbiAgY2xlYXJSYWRpdXM6IG51bWJlcjtcbiAgbmVhcmVzdDogbnVtYmVyIHwgbnVsbDtcbiAgY2xlYXI6IGJvb2xlYW47XG59O1xuXG50eXBlIERldGFpbFByb2ZpbGUgPSB7XG4gIGlkOiBEZXRhaWxDbGFzc0lkO1xuICBiYXNlQ291bnQ6IG51bWJlcjtcbiAgZ2VvbWV0cnk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5O1xuICBtYXRlcmlhbDogVEhSRUUuTWF0ZXJpYWw7XG4gIG1pblNjYWxlOiBudW1iZXI7XG4gIG1heFNjYWxlOiBudW1iZXI7XG4gIGJhc2VZOiBudW1iZXI7XG4gIGdyb3VuZFJvdGF0aW9uWD86IG51bWJlcjtcbiAgLyoqIFBlci1pbnN0YW5jZSBjb2xvdXIsIGRyYXduIGZyb20gYSBzdHJlYW0gb2YgaXRzIG93biBzbyBwbGFjZW1lbnQgc3RheXMgYnl0ZS1pZGVudGljYWwuICovXG4gIGluc3RhbmNlVGludD86IChybmc6IFJuZykgPT4gVEhSRUUuQ29sb3I7XG4gIC8qKiBSYWRpdXMgb2YgdGhlIGdyb3VuZCBjb250YWN0IHBhdGNoIHVuZGVyIGluc3RhbmNlcyBhdCBvciBhYm92ZSBgY29udGFjdFNjYWxlYC4gKi9cbiAgY29udGFjdD86IHsgcmFkaXVzOiBudW1iZXI7IG1pblNjYWxlOiBudW1iZXIgfTtcbn07XG5cbnR5cGUgRGV0YWlsSW5zdGFuY2UgPSB7XG4gIHg6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICB5OiBudW1iZXI7XG4gIHJvdGF0aW9uOiBudW1iZXI7XG4gIHNjYWxlOiBudW1iZXI7XG4gIGhpZGRlbjogYm9vbGVhbjtcbiAgbWVzaDogVEhSRUUuSW5zdGFuY2VkTWVzaDtcbiAgaW5kZXg6IG51bWJlcjtcbiAgLyoqIFNsb3QgaW4gdGhlIHNoYXJlZCBjb250YWN0LXNoYWRvdyBtZXNoLCBvciAtMSBmb3IgY2xhc3NlcyB0aGF0IGxpZSBmbGF0IG9uIHRoZSBncm91bmQuICovXG4gIHNoYWRvd0luZGV4OiBudW1iZXI7XG59O1xuXG50eXBlIERldGFpbENsYXNzID0ge1xuICBwcm9maWxlOiBEZXRhaWxQcm9maWxlO1xuICBtZXNoOiBUSFJFRS5JbnN0YW5jZWRNZXNoO1xuICBpbnN0YW5jZXM6IERldGFpbEluc3RhbmNlW107XG59O1xuXG5jb25zdCBoaWRkZW5NYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpLm1ha2VTY2FsZSgwLCAwLCAwKTtcbmNvbnN0IHNjcmF0Y2hPYmplY3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbmNvbnN0IHNjcmF0Y2hDb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuXG4vKipcbiAqIFNDUlVCIFRIQVQgU1RBTkRTIElOIFRIRSBMSUdIVCAoYnJpZWYgVTMpLlxuICpcbiAqIFR3byBkZWZlY3RzLCBvbmUgY2F1c2UuIEV2ZXJ5IGluc3RhbmNlIG9mIGEgY2xhc3Mgc2hhcmVzIG9uZSBmbGF0IGNvbG91ciwgYW5kIG5vdGhpbmcgYW55IG9mIHRoZW1cbiAqIGNhc3RzIHRvdWNoZXMgdGhlIGdyb3VuZCDigJQgc28gYSBmZXcgaHVuZHJlZCBwcm9wcyByZWFkIGFzIHNwZWNrbGUgcHJpbnRlZCBvbiB0aGUgdGVycmFpbiByYXRoZXJcbiAqIHRoYW4gb2JqZWN0cyBzdGFuZGluZyBvbiBpdCwgYW5kIHRoZSBmaWVsZCBsb29rcyBmbGF0dGVyIGluIHBsYXkgdGhhbiB0aGUgYXRsYXMgcHJvbWlzZXMuXG4gKlxuICogQm90aCBmaXhlcyBhcmUgcGVyLWluc3RhbmNlIGRhdGEgb24gdGhlIFNBTUUgbWF0ZXJpYWwsIHNvIHRoZSBkcmF3LWNhbGwgY291bnQgcGVyIGNsYXNzIHN0YXlzIDE6XG4gKiBhbiBpbnN0YW5jZS1jb2xvdXIgYXR0cmlidXRlIGZvciB0aW50LCBhbmQgb25lIHNoYXJlZCBjb250YWN0LXNoYWRvdyBtZXNoIGZvciB0aGUgY2xhc3NlcyB3aG9zZVxuICogc2lsaG91ZXR0ZXMgYXJlIHRhbGwgZW5vdWdoIHRvIG93ZSB0aGUgZ3JvdW5kIGEgc2hhZG93LlxuICpcbiAqIFRJTlQgSVMgSEFTSEVEIEZST00gUE9TSVRJT04sIE5PVCBEUkFXTiBGUk9NIFRIRSBQTEFDRU1FTlQgUk5HLiBQdWxsaW5nIGV4dHJhIG51bWJlcnMgb3V0IG9mXG4gKiBgcGxhY2VEZXRhaWxgJ3Mgc3RyZWFtIHdvdWxkIHNoaWZ0IGV2ZXJ5IHN1YnNlcXVlbnQgcG9zaXRpb24gYW5kIHNpbGVudGx5IHJlLXNjYXR0ZXIgYWxsIGZpdmVcbiAqIG1hcHMg4oCUIGEgYmVhdXR5IGNoYW5nZSBpcyBub3QgYWxsb3dlZCB0byBtb3ZlIHdoZXJlIHRoaW5ncyBhcmUuXG4gKi9cbmNvbnN0IFRJTlRfSklUVEVSOiBQYXJ0aWFsPFJlY29yZDxEZXRhaWxDbGFzc0lkLCB7IHdhcm06IG51bWJlcjsgdmFsdWU6IG51bWJlciB9Pj4gPSB7XG4gIHJvY2tzOiB7IHdhcm06IDAuMDksIHZhbHVlOiAwLjE2IH0sXG4gIHN0dW1wczogeyB3YXJtOiAwLjA3LCB2YWx1ZTogMC4xMyB9LFxuICBkcnlfZ3Jhc3M6IHsgd2FybTogMC4xMSwgdmFsdWU6IDAuMjIgfSxcbiAgY2xhaW1fcG9zdHM6IHsgd2FybTogMC4wNiwgdmFsdWU6IDAuMTIgfSxcbiAgY2FjdHVzOiB7IHdhcm06IDAuMDgsIHZhbHVlOiAwLjE4IH0sXG4gIHJlZWRzOiB7IHdhcm06IDAuMDcsIHZhbHVlOiAwLjE2IH0sXG59O1xuXG4vKiogQ2xhc3NlcyB3aG9zZSBib2RpZXMgc3RhbmQgdXAgb2ZmIHRoZSBncm91bmQgYW5kIHRoZXJlZm9yZSBvd2UgaXQgYSBjb250YWN0IHNoYWRvdy4gKi9cbmNvbnN0IENPTlRBQ1RfU0hBRE9XX0NMQVNTRVM6IFBhcnRpYWw8UmVjb3JkPERldGFpbENsYXNzSWQsIHsgcmFkaXVzOiBudW1iZXI7IHNxdWFzaDogbnVtYmVyIH0+PiA9IHtcbiAgcm9ja3M6IHsgcmFkaXVzOiAwLjU1LCBzcXVhc2g6IDAuNjIgfSxcbiAgY2FjdHVzOiB7IHJhZGl1czogMC40Miwgc3F1YXNoOiAwLjc0IH0sXG4gIHN0dW1wczogeyByYWRpdXM6IDAuNDQsIHNxdWFzaDogMC43IH0sXG4gIGRyeV9ncmFzczogeyByYWRpdXM6IDAuMzAsIHNxdWFzaDogMC42NiB9LFxuICBjbGFpbV9wb3N0czogeyByYWRpdXM6IDAuMjQsIHNxdWFzaDogMC44IH0sXG59O1xuLyoqXG4gKiBUaGUgYnJpZWYgcHJvcG9zZWQgfjAuMTQuIE1lYXN1cmVkIGF0IHRoZSBydW4gY2FtZXJhIHRoYXQgbW92ZWQgMC4yJSBvZiB0aGUgZnJhbWUg4oCUIHRlY2huaWNhbGx5XG4gKiBwcmVzZW50LCBpbnZpc2libGUgaW4gcGxheSwgYmVjYXVzZSB0aGUgc2NhdHRlciBpcyBzbWFsbCBhbmQgZmFyIGF0IHRoZSBzaGlwcGVkIHpvb20uIDAuMTkgd2l0aFxuICogd2lkZXIgZWxsaXBzZXMgaXMgdGhlIHZhbHVlIHRoYXQgcmVhZHMgd2l0aG91dCB0dXJuaW5nIHRoZSBncm91bmQgaW50byBhIHBvbGthIGRvdC5cbiAqL1xuY29uc3QgQ09OVEFDVF9TSEFET1dfT1BBQ0lUWSA9IDAuMTk7XG5jb25zdCBDT05UQUNUX1NIQURPV19MSUZUID0gMC4wMTY7XG5jb25zdCBCVUlMRF9QQURfUFJPQkUgPSB7IHg6IDAsIHo6IDkgfTtcbmNvbnN0IEZPUkRfUFJPQkUgPSB7IHg6IDAsIHo6IChUZXJyYWluLlJJVkVSX01JTl9aICsgVGVycmFpbi5SSVZFUl9NQVhfWikgLyAyIH07XG5jb25zdCBST1VUSU5HX1BST0JFID0geyB4OiAwLCB6OiAtMTQgfTtcbmNvbnN0IFNDQVRURVJfREVTQ1JJUFRPUiA9IGFjdGl2ZUNvbnRyYWN0KCkudGlsZVBhcmFtcy5zY2F0dGVyO1xuXG5leHBvcnQgY2xhc3MgRGV0YWlsU2NhdHRlciB7XG4gIHJlYWRvbmx5IGdyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjbGFzc2VzOiBEZXRhaWxDbGFzc1tdO1xuICBwcml2YXRlIHJlYWRvbmx5IHNlZWRlZEluc3RhbmNlczogRGV0YWlsSW5zdGFuY2VbXSA9IFtdO1xuICBwcml2YXRlIHJlYWRvbmx5IHNlZWQgPSBzY2F0dGVyU2VlZCgpO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlbnNpdHlUaWVyOiBEZXRhaWxEZW5zaXR5VGllcjtcbiAgcHJpdmF0ZSByZWFkb25seSBjb250YWN0U2hhZG93czogVEhSRUUuSW5zdGFuY2VkTWVzaDtcbiAgcHJpdmF0ZSBidWlsZGluZ0NsZWFyaW5nczogcmVhZG9ubHkgRGV0YWlsU2NhdHRlckNsZWFyUG9pbnRbXSA9IFtdO1xuICBwcml2YXRlIGNsZWFyaW5nc1NpZ25hdHVyZSA9ICcnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZ3JvdXAubmFtZSA9ICdEZXRhaWxTY2F0dGVyJztcbiAgICB0aGlzLmRlbnNpdHlUaWVyID0gZGVuc2l0eVRpZXIoKTtcbiAgICBjb25zdCBkZW5zaXR5ID0gZGV0YWlsRGVuc2l0eSh0aGlzLmRlbnNpdHlUaWVyKTtcbiAgICB0aGlzLmNsYXNzZXMgPSBjcmVhdGVQcm9maWxlcygpLm1hcCgocHJvZmlsZSkgPT4gdGhpcy5jcmVhdGVDbGFzcyhwcm9maWxlLCBkZW5zaXR5KSk7XG4gICAgdGhpcy5jb250YWN0U2hhZG93cyA9IGNyZWF0ZUNvbnRhY3RTaGFkb3dzKHRoaXMuc2VlZGVkSW5zdGFuY2VzKTtcbiAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmNvbnRhY3RTaGFkb3dzKTtcbiAgICB0aGlzLmJhdGNoT3BhcXVlQ2xhc3NlcygpO1xuICAgIHRoaXMuc3luY0J1aWxkaW5nQ2xlYXJpbmdzKFtdKTtcbiAgfVxuXG4gIHN5bmNCdWlsZGluZ0NsZWFyaW5ncyhjbGVhcmluZ3M6IHJlYWRvbmx5IERldGFpbFNjYXR0ZXJDbGVhclBvaW50W10pOiB2b2lkIHtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBjbGVhcmluZ3NcbiAgICAgIC5tYXAoKHBvaW50KSA9PiBgJHtwb2ludC54LnRvRml4ZWQoMSl9LCR7cG9pbnQuei50b0ZpeGVkKDEpfSwke3BvaW50LnJhZGl1cy50b0ZpeGVkKDEpfWApXG4gICAgICAuam9pbignfCcpO1xuICAgIGlmIChzaWduYXR1cmUgPT09IHRoaXMuY2xlYXJpbmdzU2lnbmF0dXJlKSByZXR1cm47XG4gICAgdGhpcy5jbGVhcmluZ3NTaWduYXR1cmUgPSBzaWduYXR1cmU7XG4gICAgdGhpcy5idWlsZGluZ0NsZWFyaW5ncyA9IGNsZWFyaW5ncztcblxuICAgIGxldCBzaGFkb3dzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgZGV0YWlsIG9mIHRoaXMuc2VlZGVkSW5zdGFuY2VzKSB7XG4gICAgICBjb25zdCBoaWRkZW4gPSBpc05lYXJBbnkoZGV0YWlsLCBjbGVhcmluZ3MpO1xuICAgICAgaWYgKGhpZGRlbiA9PT0gZGV0YWlsLmhpZGRlbikgY29udGludWU7XG4gICAgICBkZXRhaWwuaGlkZGVuID0gaGlkZGVuO1xuICAgICAgd3JpdGVJbnN0YW5jZShkZXRhaWwubWVzaCwgZGV0YWlsLmluZGV4LCBkZXRhaWwsIGhpZGRlbik7XG4gICAgICAvLyBBIGJ1aWxkaW5nIGNsZWFycyB0aGUgc2NydWIgdW5kZXIgaXQ7IGEgc2hhZG93IGxlZnQgYmVoaW5kIHdvdWxkIGJlIGEgc3RhaW4gd2l0aCBub3RoaW5nXG4gICAgICAvLyBjYXN0aW5nIGl0LCB3aGljaCBpcyB3b3JzZSB0aGFuIG5vIHNoYWRvdyBhdCBhbGwuXG4gICAgICBpZiAoZGV0YWlsLnNoYWRvd0luZGV4ID49IDAgJiYgdGhpcy5jb250YWN0U2hhZG93cykge1xuICAgICAgICB3cml0ZUNvbnRhY3RTaGFkb3codGhpcy5jb250YWN0U2hhZG93cywgZGV0YWlsLnNoYWRvd0luZGV4LCBkZXRhaWwsIGhpZGRlbik7XG4gICAgICAgIHNoYWRvd3NDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmNsYXNzZXMpIGVudHJ5Lm1lc2guaW5zdGFuY2VNYXRyaXgubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIGlmIChzaGFkb3dzQ2hhbmdlZCkgdGhpcy5jb250YWN0U2hhZG93cy5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBkaWFnbm9zdGljcygpOiBEZXRhaWxTY2F0dGVyRGlhZ25vc3RpY3Mge1xuICAgIGNvbnN0IGNsYXNzZXMgPSB0aGlzLmNsYXNzZXMubWFwKChlbnRyeSkgPT4gKHtcbiAgICAgIGlkOiBlbnRyeS5wcm9maWxlLmlkLFxuICAgICAgaW5zdGFuY2VzOiBlbnRyeS5pbnN0YW5jZXMubGVuZ3RoLFxuICAgICAgdmlzaWJsZUluc3RhbmNlczogZW50cnkuaW5zdGFuY2VzLmZpbHRlcigoZGV0YWlsKSA9PiAhZGV0YWlsLmhpZGRlbikubGVuZ3RoLFxuICAgICAgZHJhd0NhbGxzOiAxIGFzIGNvbnN0LFxuICAgIH0pKTtcbiAgICBjb25zdCB0b3RhbEluc3RhbmNlcyA9IGNsYXNzZXMucmVkdWNlKCh0b3RhbCwgZW50cnkpID0+IHRvdGFsICsgZW50cnkudmlzaWJsZUluc3RhbmNlcywgMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGluc3RhbmNlQ2xhc3NlczogY2xhc3Nlcy5maWx0ZXIoKGVudHJ5KSA9PiBlbnRyeS5pbnN0YW5jZXMgPiAwKS5sZW5ndGgsXG4gICAgICBjb250YWN0U2hhZG93czogdGhpcy5jb250YWN0U2hhZG93cy5jb3VudCxcbiAgICAgIHRvdGFsSW5zdGFuY2VzLFxuICAgICAgc2VlZGVkSW5zdGFuY2VzOiB0aGlzLnNlZWRlZEluc3RhbmNlcy5sZW5ndGgsXG4gICAgICBkZW5zaXR5VGllcjogdGhpcy5kZW5zaXR5VGllcixcbiAgICAgIHNlZWQ6IHRoaXMuc2VlZCxcbiAgICAgIGNsYXNzZXMsXG4gICAgICBleGNsdXNpb25zOiB7XG4gICAgICAgIGJ1aWxkUGFkUmFkaXVzOiBCYWxhbmNlLndvcmxkLmRldGFpbEJ1aWxkUGFkQ2xlYXJSYWRpdXMsXG4gICAgICAgIHJvdXRpbmdMYW5lUmFkaXVzOiBCYWxhbmNlLndvcmxkLmRldGFpbFJvdXRpbmdMYW5lQ2xlYXJSYWRpdXMsXG4gICAgICAgIGhhcnZlc3RBbmNob3JSYWRpdXM6IEJhbGFuY2Uud29ybGQuZGV0YWlsSGFydmVzdEFuY2hvckNsZWFyUmFkaXVzLFxuICAgICAgICBidWlsZGluZ0NsZWFyUmFkaXVzOiBCYWxhbmNlLndvcmxkLmRldGFpbEJ1aWxkaW5nQ2xlYXJSYWRpdXMsXG4gICAgICB9LFxuICAgICAgcHJvYmVzOiB7XG4gICAgICAgIGJ1aWxkUGFkOiBwcm9iZUNsZWFyKHRoaXMuc2VlZGVkSW5zdGFuY2VzLCBCVUlMRF9QQURfUFJPQkUueCwgQlVJTERfUEFEX1BST0JFLnosIEJhbGFuY2Uud29ybGQuZGV0YWlsQnVpbGRQYWRDbGVhclJhZGl1cyksXG4gICAgICAgIGZvcmQ6IHByb2JlQ2xlYXIodGhpcy5zZWVkZWRJbnN0YW5jZXMsIEZPUkRfUFJPQkUueCwgRk9SRF9QUk9CRS56LCAoVGVycmFpbi5SSVZFUl9NQVhfWiAtIFRlcnJhaW4uUklWRVJfTUlOX1opIC8gMiArIFRlcnJhaW4uU0hBTExPV1NfV0lEVEgpLFxuICAgICAgICByb3V0aW5nTGFuZTogcHJvYmVDbGVhcih0aGlzLnNlZWRlZEluc3RhbmNlcywgUk9VVElOR19QUk9CRS54LCBST1VUSU5HX1BST0JFLnosIEJhbGFuY2Uud29ybGQuZGV0YWlsUm91dGluZ0xhbmVDbGVhclJhZGl1cyksXG4gICAgICAgIGJ1aWxkaW5nOiB0aGlzLmJ1aWxkaW5nQ2xlYXJpbmdzWzBdXG4gICAgICAgICAgPyBwcm9iZUNsZWFyKFxuICAgICAgICAgICAgICB0aGlzLnNlZWRlZEluc3RhbmNlcyxcbiAgICAgICAgICAgICAgdGhpcy5idWlsZGluZ0NsZWFyaW5nc1swXS54LFxuICAgICAgICAgICAgICB0aGlzLmJ1aWxkaW5nQ2xlYXJpbmdzWzBdLnosXG4gICAgICAgICAgICAgIHRoaXMuYnVpbGRpbmdDbGVhcmluZ3NbMF0ucmFkaXVzLFxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogcHJvYmVDbGVhcih0aGlzLnNlZWRlZEluc3RhbmNlcywgQlVJTERfUEFEX1BST0JFLngsIEJVSUxEX1BBRF9QUk9CRS56LCBCYWxhbmNlLndvcmxkLmRldGFpbEJ1aWxkaW5nQ2xlYXJSYWRpdXMpLFxuICAgICAgfSxcbiAgICAgIHNpZ25hdHVyZTogdGhpcy5zZWVkZWRJbnN0YW5jZXNcbiAgICAgICAgLnNsaWNlKDAsIDEyKVxuICAgICAgICAubWFwKChkZXRhaWwpID0+IGAke2RldGFpbC54LnRvRml4ZWQoMil9LCR7ZGV0YWlsLnoudG9GaXhlZCgyKX1gKVxuICAgICAgICAuam9pbignfCcpLFxuICAgIH07XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGRpc3Bvc2VPYmplY3QzRCh0aGlzLmdyb3VwKTtcbiAgfVxuXG4gIC8qKiBGLUFTVFJBLTY6IHRoZSBjZW5zdXMgZm91bmQgNjjigJM4OCUgb2YgdGhlIHNvbGlkIHNjYXR0ZXIgb3V0c2lkZSB0aGUgY2FtZXJhLlxuICAgKiBGbGF0dGVuIHN0YXRpYyBpbnN0YW5jZXMgaW50byB0d28gY29tcGF0aWJsZSBvcGFxdWUgZHJhd3MsIHByZXNlcnZpbmcgZWFjaCBjbGFzcydzXG4gICAqIGxpbmVhciB0aW50LCByb3VnaG5lc3MsIG1ldGFsbmVzcyBhbmQgc2lkZWRuZXNzLiBSZWVkcyByZXRhaW4gdGhlaXIgaW5zdGFuY2VkIHN3YXk7XG4gICAqIHJ1dHMgYW5kIGV2ZXJ5IGNvbnRhY3Qgc2hhZG93IHJldGFpbiB0aGVpciBvcmlnaW5hbCB0cmFuc3BhcmVudCByZW5kZXItbGlzdCBpdGVtLiAqL1xuICBwcml2YXRlIGJhdGNoT3BhcXVlQ2xhc3NlcygpOiB2b2lkIHtcbiAgICBjb25zdCBjb2hvcnRzID0gbmV3IE1hcDxzdHJpbmcsIERldGFpbENsYXNzW10+KCk7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLmNsYXNzZXMpIHtcbiAgICAgIGNvbnN0IG1hdGVyaWFsID0gZW50cnkucHJvZmlsZS5tYXRlcmlhbDtcbiAgICAgIGlmICghKG1hdGVyaWFsIGluc3RhbmNlb2YgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwpIHx8IG1hdGVyaWFsLnRyYW5zcGFyZW50IHx8XG4gICAgICAgICAgbWF0ZXJpYWwuYWxwaGFUZXN0ID4gMCB8fCBtYXRlcmlhbC51c2VyRGF0YS5yZWVkVGltZSB8fCAhZW50cnkuaW5zdGFuY2VzLmxlbmd0aCkgY29udGludWU7XG4gICAgICBjb25zdCBrZXkgPSBgJHttYXRlcmlhbC5zaWRlfToke21hdGVyaWFsLm1ldGFsbmVzc31gO1xuICAgICAgY29uc3QgY29ob3J0ID0gY29ob3J0cy5nZXQoa2V5KSA/PyBbXTtcbiAgICAgIGNvaG9ydC5wdXNoKGVudHJ5KTtcbiAgICAgIGNvaG9ydHMuc2V0KGtleSwgY29ob3J0KTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjb2hvcnQgb2YgY29ob3J0cy52YWx1ZXMoKSkge1xuICAgICAgY29uc3QgbWF0ZXJpYWwgPSAoY29ob3J0WzBdIS5wcm9maWxlLm1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKS5jbG9uZSgpO1xuICAgICAgbWF0ZXJpYWwuY29sb3Iuc2V0UkdCKDEsIDEsIDEpO1xuICAgICAgbWF0ZXJpYWwudmVydGV4Q29sb3JzID0gdHJ1ZTtcbiAgICAgIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdvcGFxdWUtc2NhdHRlci1yb3VnaG5lc3MtdjEnO1xuICAgICAgbWF0ZXJpYWwub25CZWZvcmVDb21waWxlID0gKHNoYWRlcikgPT4ge1xuICAgICAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbmF0dHJpYnV0ZSBmbG9hdCBzY2F0dGVyUm91Z2huZXNzO1xcbnZhcnlpbmcgZmxvYXQgdlNjYXR0ZXJSb3VnaG5lc3M7JylcbiAgICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLCAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cXG52U2NhdHRlclJvdWdobmVzcyA9IHNjYXR0ZXJSb3VnaG5lc3M7Jyk7XG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgZmxvYXQgdlNjYXR0ZXJSb3VnaG5lc3M7JylcbiAgICAgICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPHJvdWdobmVzc21hcF9mcmFnbWVudD4nLCAnI2luY2x1ZGUgPHJvdWdobmVzc21hcF9mcmFnbWVudD5cXG5yb3VnaG5lc3NGYWN0b3IgPSB2U2NhdHRlclJvdWdobmVzczsnKTtcbiAgICAgIH07XG4gICAgICBjb25zdCBwYXJ0czogT3BhcXVlUHJvcFBhcnRbXSA9IFtdO1xuICAgICAgY29uc3QgdGVtcG9yYXJ5OiBUSFJFRS5CdWZmZXJHZW9tZXRyeVtdID0gW107XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGNvaG9ydCkge1xuICAgICAgICBjb25zdCBzb3VyY2UgPSBlbnRyeS5wcm9maWxlLm1hdGVyaWFsIGFzIFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsO1xuICAgICAgICBmb3IgKGNvbnN0IGRldGFpbCBvZiBlbnRyeS5pbnN0YW5jZXMpIHtcbiAgICAgICAgICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICAgICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBlbnRyeS5wcm9maWxlLmdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS5jbG9uZSgpKTtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ25vcm1hbCcsIGVudHJ5LnByb2ZpbGUuZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdub3JtYWwnKS5jbG9uZSgpKTtcbiAgICAgICAgICBpZiAoZW50cnkucHJvZmlsZS5nZW9tZXRyeS5pbmRleCkgZ2VvbWV0cnkuc2V0SW5kZXgoZW50cnkucHJvZmlsZS5nZW9tZXRyeS5pbmRleC5jbG9uZSgpKTtcbiAgICAgICAgICBjb25zdCBjb3VudCA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZSgncG9zaXRpb24nKS5jb3VudDtcbiAgICAgICAgICBjb25zdCBjb2xvciA9IG5ldyBUSFJFRS5Db2xvcigpO1xuICAgICAgICAgIGVudHJ5Lm1lc2guZ2V0Q29sb3JBdChkZXRhaWwuaW5kZXgsIGNvbG9yKTtcbiAgICAgICAgICBjb2xvci5tdWx0aXBseShzb3VyY2UuY29sb3IpO1xuICAgICAgICAgIGNvbnN0IGNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoY291bnQgKiAzKTtcbiAgICAgICAgICBmb3IgKGxldCB2ZXJ0ZXggPSAwOyB2ZXJ0ZXggPCBjb3VudDsgdmVydGV4KyspIGNvbG9yLnRvQXJyYXkoY29sb3JzLCB2ZXJ0ZXggKiAzKTtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ2NvbG9yJywgbmV3IFRIUkVFLkJ1ZmZlckF0dHJpYnV0ZShjb2xvcnMsIDMpKTtcbiAgICAgICAgICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3NjYXR0ZXJSb3VnaG5lc3MnLCBuZXcgVEhSRUUuQnVmZmVyQXR0cmlidXRlKG5ldyBGbG9hdDMyQXJyYXkoY291bnQpLmZpbGwoc291cmNlLnJvdWdobmVzcyksIDEpKTtcbiAgICAgICAgICBjb25zdCBtYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuICAgICAgICAgIGVudHJ5Lm1lc2guZ2V0TWF0cml4QXQoZGV0YWlsLmluZGV4LCBtYXRyaXgpO1xuICAgICAgICAgIHBhcnRzLnB1c2goeyBnZW9tZXRyeSwgbWF0cml4LCBoaWRkZW46ICgpID0+IGRldGFpbC5oaWRkZW4gfSk7XG4gICAgICAgICAgdGVtcG9yYXJ5LnB1c2goZ2VvbWV0cnkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEtlZXAgdGhlIGxvZ2ljYWwgY2xhc3MgYW5kIGl0cyBzZWVkZWQgcGxhY2VtZW50IHJlY29yZHMgZm9yIGNsZWFyaW5nIGRpYWdub3N0aWNzLlxuICAgICAgICAvLyBUaGlzIHNvdXJjZSBtZXNoIGlzIG5ldmVyIHN1Ym1pdHRlZDsgYWxsIHJlbmRlcmluZyBiZWxvbmdzIHRvIGl0cyBvcGFxdWUgYmF0Y2guXG4gICAgICAgIGVudHJ5Lm1lc2gudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgY29uc3QgYmF0Y2ggPSBjcmVhdGVPcGFxdWVQcm9wQmF0Y2gocGFydHMsIG1hdGVyaWFsKTtcbiAgICAgIHRlbXBvcmFyeS5mb3JFYWNoKGdlb21ldHJ5ID0+IGdlb21ldHJ5LmRpc3Bvc2UoKSk7XG4gICAgICBiYXRjaC5uYW1lID0gYERldGFpbFNjYXR0ZXIub3BhcXVlLiR7Y29ob3J0Lm1hcChlbnRyeSA9PiBlbnRyeS5wcm9maWxlLmlkKS5qb2luKCcrJyl9YDtcbiAgICAgIGJhdGNoLnVzZXJEYXRhLm9wYXF1ZVNvdXJjZUlkcyA9IGNvaG9ydC5tYXAoZW50cnkgPT4gZW50cnkubWVzaC5pZCk7XG4gICAgICBiYXRjaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICAgIHRoaXMuZ3JvdXAuYWRkKGJhdGNoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNsYXNzKHByb2ZpbGU6IERldGFpbFByb2ZpbGUsIGRlbnNpdHk6IG51bWJlcik6IERldGFpbENsYXNzIHtcbiAgICBjb25zdCBjb3VudCA9IE1hdGgubWF4KDAsIE1hdGguZmxvb3IocHJvZmlsZS5iYXNlQ291bnQgKiBkZW5zaXR5KSk7XG4gICAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5JbnN0YW5jZWRNZXNoKHByb2ZpbGUuZ2VvbWV0cnksIHByb2ZpbGUubWF0ZXJpYWwsIE1hdGgubWF4KDEsIGNvdW50KSk7XG4gICAgbWVzaC5uYW1lID0gYERldGFpbFNjYXR0ZXIuJHtwcm9maWxlLmlkfWA7XG4gICAgbWVzaC51c2VyRGF0YS5kZXRhaWxQcm9maWxlID0gcHJvZmlsZTtcbiAgICBtZXNoLmNvdW50ID0gY291bnQ7XG4gICAgbWVzaC5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gICAgbWVzaC5jYXN0U2hhZG93ID0gZmFsc2U7XG4gICAgbWVzaC5yZWNlaXZlU2hhZG93ID0gdHJ1ZTtcbiAgICBpZiAocHJvZmlsZS5ncm91bmRSb3RhdGlvblggIT09IHVuZGVmaW5lZCkgbWVzaC5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gICAgaWYgKGNvdW50ID09PSAwKSBtZXNoLnZpc2libGUgPSBmYWxzZTtcbiAgICB0aGlzLmdyb3VwLmFkZChtZXNoKTtcblxuICAgIGNvbnN0IHJuZyA9IGNyZWF0ZVJuZygodGhpcy5zZWVkIF4gbm9ybWFsaXplU2VlZChwcm9maWxlLmlkKSkgPj4+IDApO1xuICAgIC8vIERyZXNzaW5nIGRyYXdzIGZyb20gYSBzdHJlYW0gb2YgaXRzIG93biwgc28gYWRkaW5nIGEgdGludCBjYW5ub3Qgc2hpZnQgb25lIHBsYWNlbWVudDpcbiAgICAvLyB0aGUgc2VlZGVkIHNjYXR0ZXIgc2lnbmF0dXJlIHN0YXlzIGJ5dGUtaWRlbnRpY2FsIHRvIHRoZSBydW4gYmVmb3JlIHRoaXMgdXBncmFkZS5cbiAgICBjb25zdCB0aW50Um5nID0gY3JlYXRlUm5nKCh0aGlzLnNlZWQgXiBub3JtYWxpemVTZWVkKGAke3Byb2ZpbGUuaWR9OnRpbnRgKSkgPj4+IDApO1xuICAgIGNvbnN0IGluc3RhbmNlczogRGV0YWlsSW5zdGFuY2VbXSA9IFtdO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBjb3VudDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3QgcGxhY2VkID0gcGxhY2VEZXRhaWwocHJvZmlsZSwgcm5nLCBpbnN0YW5jZXMpO1xuICAgICAgaWYgKHByb2ZpbGUuaW5zdGFuY2VUaW50KSBtZXNoLnNldENvbG9yQXQoaW5kZXgsIHByb2ZpbGUuaW5zdGFuY2VUaW50KHRpbnRSbmcpKTtcbiAgICAgIGlmICghcGxhY2VkKSB7XG4gICAgICAgIG1lc2guc2V0TWF0cml4QXQoaW5kZXgsIGhpZGRlbk1hdHJpeCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgZGV0YWlsOiBEZXRhaWxJbnN0YW5jZSA9IHtcbiAgICAgICAgLi4ucGxhY2VkLFxuICAgICAgICBoaWRkZW46IGZhbHNlLFxuICAgICAgICBtZXNoLFxuICAgICAgICBpbmRleCxcbiAgICAgICAgc2hhZG93SW5kZXg6IENPTlRBQ1RfU0hBRE9XX0NMQVNTRVNbcHJvZmlsZS5pZF0gPyB0aGlzLnNlZWRlZEluc3RhbmNlcy5sZW5ndGggOiAtMSxcbiAgICAgIH07XG4gICAgICB3cml0ZUluc3RhbmNlKG1lc2gsIGluZGV4LCBkZXRhaWwsIGZhbHNlKTtcbiAgICAgIG1lc2guc2V0Q29sb3JBdChpbmRleCwgaW5zdGFuY2VUaW50KHByb2ZpbGUuaWQsIHBsYWNlZC54LCBwbGFjZWQueikpO1xuICAgICAgaW5zdGFuY2VzLnB1c2goZGV0YWlsKTtcbiAgICAgIHRoaXMuc2VlZGVkSW5zdGFuY2VzLnB1c2goZGV0YWlsKTtcbiAgICB9XG4gICAgbWVzaC5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgaWYgKG1lc2guaW5zdGFuY2VDb2xvcikgbWVzaC5pbnN0YW5jZUNvbG9yLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICBjb25zdCBjb250YWN0ID0gY29udGFjdFBhdGNoTWVzaChpbnN0YW5jZXMsIHByb2ZpbGUpO1xuICAgIGlmIChjb250YWN0KSB0aGlzLmdyb3VwLmFkZChjb250YWN0KTtcbiAgICBjb25zdCBzd2F5VGltZSA9IChwcm9maWxlLm1hdGVyaWFsLnVzZXJEYXRhLnJlZWRUaW1lID8/IG51bGwpIGFzIFRIUkVFLklVbmlmb3JtPG51bWJlcj4gfCBudWxsO1xuICAgIGlmIChzd2F5VGltZSkge1xuICAgICAgbGV0IGxhc3RGcmFtZSA9IC0xO1xuICAgICAgbGV0IGxhc3QgPSAwO1xuICAgICAgbWVzaC5vbkJlZm9yZVJlbmRlciA9IChyZW5kZXJlcikgPT4ge1xuICAgICAgICBpZiAocmVuZGVyZXIuaW5mby5yZW5kZXIuZnJhbWUgPT09IGxhc3RGcmFtZSkgcmV0dXJuO1xuICAgICAgICBsYXN0RnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICAgICAgY29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHN3YXlUaW1lLnZhbHVlICs9IGxhc3QgPT09IDAgPyAwIDogTWF0aC5taW4oMC4xLCBNYXRoLm1heCgwLCAobm93IC0gbGFzdCkgLyAxMDAwKSk7XG4gICAgICAgIGxhc3QgPSBub3c7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4geyBwcm9maWxlLCBtZXNoLCBpbnN0YW5jZXMgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9maWxlcygpOiBEZXRhaWxQcm9maWxlW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIGlkOiAncm9ja3MnLFxuICAgICAgYmFzZUNvdW50OiBwcm9maWxlQ291bnQoJ3JvY2tzJywgNDQpLFxuICAgICAgZ2VvbWV0cnk6IHJvY2tHZW9tZXRyeSgpLFxuICAgICAgbWF0ZXJpYWw6IHN0YW5kYXJkTWF0ZXJpYWwoJyM4YzdmNmQnLCAwLjkpLFxuICAgICAgbWluU2NhbGU6IDAuNTUsXG4gICAgICBtYXhTY2FsZTogMS4yNSxcbiAgICAgIGJhc2VZOiAwLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdzdHVtcHMnLFxuICAgICAgYmFzZUNvdW50OiBwcm9maWxlQ291bnQoJ3N0dW1wcycsIDE4KSxcbiAgICAgIGdlb21ldHJ5OiBzdHVtcEdlb21ldHJ5KCksXG4gICAgICBtYXRlcmlhbDogc3RhbmRhcmRNYXRlcmlhbCgnIzRmMzMxZicsIDAuODYpLFxuICAgICAgbWluU2NhbGU6IDAuNzIsXG4gICAgICBtYXhTY2FsZTogMS4xNSxcbiAgICAgIGJhc2VZOiAwLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdkcnlfZ3Jhc3MnLFxuICAgICAgYmFzZUNvdW50OiBwcm9maWxlQ291bnQoJ2RyeV9ncmFzcycsIDkyKSxcbiAgICAgIGdlb21ldHJ5OiBncmFzc0dlb21ldHJ5KCksXG4gICAgICBtYXRlcmlhbDogbmV3IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsKHtcbiAgICAgICAgY29sb3I6ICcjN2I4MDUwJyxcbiAgICAgICAgcm91Z2huZXNzOiAxLFxuICAgICAgICBtZXRhbG5lc3M6IDAsXG4gICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICB9KSxcbiAgICAgIG1pblNjYWxlOiAwLjU4LFxuICAgICAgbWF4U2NhbGU6IDEuMzUsXG4gICAgICBiYXNlWTogMC4wMSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnd2Fnb25fcnV0cycsXG4gICAgICBiYXNlQ291bnQ6IHByb2ZpbGVDb3VudCgnd2Fnb25fcnV0cycsIDI0KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSgxLjksIDAuNDYpLFxuICAgICAgbWF0ZXJpYWw6IHJ1dE1hdGVyaWFsKCksXG4gICAgICBtaW5TY2FsZTogMC43MixcbiAgICAgIG1heFNjYWxlOiAxLjQsXG4gICAgICBiYXNlWTogMC4wMTgsXG4gICAgICBncm91bmRSb3RhdGlvblg6IC1NYXRoLlBJIC8gMixcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY2xhaW1fcG9zdHMnLFxuICAgICAgYmFzZUNvdW50OiBwcm9maWxlQ291bnQoJ2NsYWltX3Bvc3RzJywgMTIpLFxuICAgICAgZ2VvbWV0cnk6IGNsYWltUG9zdEdlb21ldHJ5KCksXG4gICAgICBtYXRlcmlhbDogc3RhbmRhcmRNYXRlcmlhbCgnIzZmNTczMicsIDAuNzgpLFxuICAgICAgbWluU2NhbGU6IDAuODIsXG4gICAgICBtYXhTY2FsZTogMS4xLFxuICAgICAgYmFzZVk6IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NhY3R1cycsXG4gICAgICBiYXNlQ291bnQ6IHByb2ZpbGVDb3VudCgnY2FjdHVzJywgMCksXG4gICAgICBnZW9tZXRyeTogY2FjdHVzR2VvbWV0cnkoKSxcbiAgICAgIG1hdGVyaWFsOiBzdGFuZGFyZE1hdGVyaWFsKCcjNGY2ZjRhJywgMC45MiksXG4gICAgICBtaW5TY2FsZTogMC43NCxcbiAgICAgIG1heFNjYWxlOiAxLjI1LFxuICAgICAgYmFzZVk6IDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3JlZWRzJyxcbiAgICAgIGJhc2VDb3VudDogcHJvZmlsZUNvdW50KCdyZWVkcycsIDApLFxuICAgICAgZ2VvbWV0cnk6IHJlZWRHZW9tZXRyeSgpLFxuICAgICAgbWF0ZXJpYWw6IHJlZWRNYXRlcmlhbCgpLFxuICAgICAgbWluU2NhbGU6IDAuNzIsXG4gICAgICBtYXhTY2FsZTogMS40MixcbiAgICAgIGJhc2VZOiAwLjAxLFxuICAgICAgaW5zdGFuY2VUaW50OiByZWVkVGludCxcbiAgICAgIC8vIFNjYXR0ZXIgbmV2ZXIgY2FzdHMgYSBzaGFkb3cgKGNhc3RTaGFkb3cgaXMgb2ZmIGZvciBldmVyeSBjbGFzcywgYnkgYnVkZ2V0KSwgc28gYSB0dWZ0XG4gICAgICAvLyB3aXRoIG5vIGNvbnRhY3QgcGF0Y2ggZmxvYXRzLiBPbmx5IHRoZSBiaWdnZXIgaGFsZiBnZXQgb25lOyBhIHBhdGNoIHVuZGVyIGV2ZXJ5IHNwcmlnXG4gICAgICAvLyByZWFkcyBhcyBtb3VsZC5cbiAgICAgIGNvbnRhY3Q6IHsgcmFkaXVzOiAwLjM4LCBtaW5TY2FsZTogMC45OCB9LFxuICAgIH0sXG4gIF07XG59XG5cbmZ1bmN0aW9uIHByb2ZpbGVDb3VudChpZDogRGV0YWlsQ2xhc3NJZCwgZmFsbGJhY2s6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLm1heCgwLCBNYXRoLmZsb29yKFNDQVRURVJfREVTQ1JJUFRPUj8uY2xhc3NDb3VudHM/LltpZF0gPz8gZmFsbGJhY2spKTtcbn1cblxuZnVuY3Rpb24gcGxhY2VEZXRhaWwoXG4gIHByb2ZpbGU6IERldGFpbFByb2ZpbGUsXG4gIHJuZzogUm5nLFxuICBwbGFjZWRJbkNsYXNzOiByZWFkb25seSBEZXRhaWxJbnN0YW5jZVtdLFxuKTogT21pdDxEZXRhaWxJbnN0YW5jZSwgJ2hpZGRlbicgfCAnbWVzaCcgfCAnaW5kZXgnIHwgJ3NoYWRvd0luZGV4Jz4gfCBudWxsIHtcbiAgY29uc3QgYXR0ZW1wdHMgPSBNYXRoLm1heCg0MCwgcHJvZmlsZS5iYXNlQ291bnQgKiA4MCk7XG4gIGZvciAobGV0IGF0dGVtcHQgPSAwOyBhdHRlbXB0IDwgYXR0ZW1wdHM7IGF0dGVtcHQgKz0gMSkge1xuICAgIGNvbnN0IHggPSBybmcucmFuZ2UoVGVycmFpbi5ib3VuZHMubWluWCArIDEsIFRlcnJhaW4uYm91bmRzLm1heFggLSAxKTtcbiAgICBjb25zdCB6ID0gcm5nLnJhbmdlKFRlcnJhaW4uYm91bmRzLm1pblogKyAxLCBUZXJyYWluLmJvdW5kcy5tYXhaIC0gMSk7XG4gICAgaWYgKFRlcnJhaW4uc2FtcGxlKHgsIHopLnpvbmUgIT09ICdiYW5rJykgY29udGludWU7XG4gICAgaWYgKHN0YXRpY0V4Y2x1ZGVkKHgsIHopKSBjb250aW51ZTtcbiAgICBpZiAocm5nLm5leHQoKSA+IGRldGFpbEFjY2VwdGFuY2UocHJvZmlsZSwgeCwgeikpIGNvbnRpbnVlO1xuICAgIGlmICh0b29DbG9zZVRvQ2xhc3MoeCwgeiwgcGxhY2VkSW5DbGFzcykpIGNvbnRpbnVlO1xuXG4gICAgY29uc3Qgc2NhbGUgPSBybmcucmFuZ2UocHJvZmlsZS5taW5TY2FsZSwgcHJvZmlsZS5tYXhTY2FsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHgsXG4gICAgICB6LFxuICAgICAgeTogVGVycmFpbi52aXN1YWxZKHgsIHosIHByb2ZpbGUuYmFzZVksIDAuMzUpLFxuICAgICAgcm90YXRpb246IHJuZy5yYW5nZSgwLCBNYXRoLlBJICogMiksXG4gICAgICBzY2FsZSxcbiAgICB9O1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBzdGF0aWNFeGNsdWRlZCh4OiBudW1iZXIsIHo6IG51bWJlcik6IGJvb2xlYW4ge1xuICBpZiAoVGVycmFpbi5yb3V0aW5nTGFuZURpc3RhbmNlKHgsIHopIDwgQmFsYW5jZS53b3JsZC5kZXRhaWxSb3V0aW5nTGFuZUNsZWFyUmFkaXVzKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKGRpc3RhbmNlU3EoeCwgeiwgQlVJTERfUEFEX1BST0JFLngsIEJVSUxEX1BBRF9QUk9CRS56KSA8IEJhbGFuY2Uud29ybGQuZGV0YWlsQnVpbGRQYWRDbGVhclJhZGl1cyAqKiAyKSByZXR1cm4gdHJ1ZTtcbiAgZm9yIChjb25zdCBhbmNob3Igb2YgVGVycmFpbi5ub2RlQW5jaG9ycykge1xuICAgIGlmIChkaXN0YW5jZVNxKHgsIHosIGFuY2hvci54LCBhbmNob3IueikgPCBCYWxhbmNlLndvcmxkLmRldGFpbEhhcnZlc3RBbmNob3JDbGVhclJhZGl1cyAqKiAyKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHJvdXRpbmdMYW5lRGlzdGFuY2UoeDogbnVtYmVyLCB6OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gVGVycmFpbi5yb3V0aW5nTGFuZURpc3RhbmNlKHgsIHopO1xufVxuXG5mdW5jdGlvbiBkZXRhaWxBY2NlcHRhbmNlKHByb2ZpbGU6IERldGFpbFByb2ZpbGUsIHg6IG51bWJlciwgejogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgZmVhdHVyZSA9IFRlcnJhaW4udGVycmFpbkZlYXR1cmVTYW1wbGUoeCwgeik7XG4gIGNvbnN0IGVkZ2UgPSBNYXRoLm1heChNYXRoLmFicyh4KSAvIFRlcnJhaW4uQ0xBSU1fSEFMRiwgTWF0aC5hYnMoeikgLyBUZXJyYWluLkNMQUlNX0hBTEYpO1xuICBjb25zdCBsYW5lID0gTWF0aC5taW4oMSwgcm91dGluZ0xhbmVEaXN0YW5jZSh4LCB6KSAvIDEwKTtcbiAgY29uc3QgYmFzZSA9IDAuMTYgKyBlZGdlICogMC43NCArIGxhbmUgKiAwLjEyO1xuICBpZiAocHJvZmlsZS5pZCA9PT0gJ2NhY3R1cycpIHtcbiAgICBjb25zdCBkcnlFZGdlID0gc21vb3Roc3RlcCg3LCAyMCwgTWF0aC5hYnMoeikpICogKDEgLSBuZWFyV2F0ZXJNYXNrKHgsIHopKTtcbiAgICByZXR1cm4gVEhSRUUuTWF0aFV0aWxzLmNsYW1wKGJhc2UgKiBkcnlFZGdlICogKDAuNyArIGZlYXR1cmUuc2hlbGYgKiAxLjIgKyBmZWF0dXJlLmJsdWZmICogMC40KSwgMC4wNCwgMC44OCk7XG4gIH1cbiAgaWYgKHByb2ZpbGUuaWQgPT09ICdyZWVkcycpIHtcbiAgICBjb25zdCB3YXRlciA9IG5lYXJXYXRlck1hc2soeCwgeik7XG4gICAgY29uc3QgYmlhcyA9IFNDQVRURVJfREVTQ1JJUFRPUj8ubmVhcldhdGVyQmlhcyA/PyAxO1xuICAgIHJldHVybiBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoKDAuMTQgKyB3YXRlciAqIDEuNiAqIGJpYXMpICogKDAuNyArIGxhbmUgKiAwLjM1KSwgMC4wMiwgMC45Nik7XG4gIH1cbiAgY29uc3QgYmlhcyA9XG4gICAgcHJvZmlsZS5pZCA9PT0gJ3JvY2tzJ1xuICAgICAgPyAwLjQyICsgZmVhdHVyZS5zaGVsZiAqIDEuNDUgKyBmZWF0dXJlLmJsdWZmICogMC41NVxuICAgICAgOiBwcm9maWxlLmlkID09PSAnZHJ5X2dyYXNzJ1xuICAgICAgICA/IDAuNTggKyBmZWF0dXJlLnBvY2tldCAqIDEuMTUgLSBmZWF0dXJlLmd1bGx5ICogMC4xOFxuICAgICAgICA6IDAuNzYgKyBmZWF0dXJlLnBvY2tldCAqIDAuMTg7XG4gIHJldHVybiBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoYmFzZSAqIGJpYXMsIDAuMDgsIDAuOTgpO1xufVxuXG5mdW5jdGlvbiBuZWFyV2F0ZXJNYXNrKHg6IG51bWJlciwgejogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IG1hc2sgPSBUZXJyYWluLmhhc1JpdmVyV2F0ZXIoKSA/IDEgLSBzbW9vdGhzdGVwKDAuOCwgNi41LCBNYXRoLm1heCgwLCBNYXRoLmFicyh6IC0gKChUZXJyYWluLlJJVkVSX01JTl9aICsgVGVycmFpbi5SSVZFUl9NQVhfWikgLyAyKSkgLSAoKFRlcnJhaW4uUklWRVJfTUFYX1ogLSBUZXJyYWluLlJJVkVSX01JTl9aKSAvIDIpKSkgOiAwO1xuICBmb3IgKGNvbnN0IHNvdXJjZSBvZiBUZXJyYWluLndhdGVyU291cmNlcygpKSB7XG4gICAgbWFzayA9IE1hdGgubWF4KG1hc2ssIDEgLSBzbW9vdGhzdGVwKHNvdXJjZS5yYWRpdXMgKyAwLjM1LCBzb3VyY2UucmFkaXVzICsgNS41LCBNYXRoLmh5cG90KHggLSBzb3VyY2UueCwgeiAtIHNvdXJjZS56KSkpO1xuICB9XG4gIHJldHVybiBUSFJFRS5NYXRoVXRpbHMuY2xhbXAobWFzaywgMCwgMSk7XG59XG5cbmZ1bmN0aW9uIHRvb0Nsb3NlVG9DbGFzcyh4OiBudW1iZXIsIHo6IG51bWJlciwgcGxhY2VkOiByZWFkb25seSBEZXRhaWxJbnN0YW5jZVtdKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgZGV0YWlsIG9mIHBsYWNlZCkge1xuICAgIGlmIChkaXN0YW5jZVNxKHgsIHosIGRldGFpbC54LCBkZXRhaWwueikgPCAwLjcgKiAwLjcpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gd3JpdGVJbnN0YW5jZShtZXNoOiBUSFJFRS5JbnN0YW5jZWRNZXNoLCBpbmRleDogbnVtYmVyLCBkZXRhaWw6IERldGFpbEluc3RhbmNlIHwgT21pdDxEZXRhaWxJbnN0YW5jZSwgJ21lc2gnIHwgJ2luZGV4Jz4sIGhpZGRlbjogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoaGlkZGVuKSB7XG4gICAgbWVzaC5zZXRNYXRyaXhBdChpbmRleCwgaGlkZGVuTWF0cml4KTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcHJvZmlsZSA9IHByb2ZpbGVGb3JNZXNoKG1lc2gpO1xuICBzY3JhdGNoT2JqZWN0LnBvc2l0aW9uLnNldChkZXRhaWwueCwgZGV0YWlsLnksIGRldGFpbC56KTtcbiAgaWYgKHByb2ZpbGU/Lmdyb3VuZFJvdGF0aW9uWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2NyYXRjaE9iamVjdC5yb3RhdGlvbi5zZXQocHJvZmlsZS5ncm91bmRSb3RhdGlvblgsIDAsIGRldGFpbC5yb3RhdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgc2NyYXRjaE9iamVjdC5yb3RhdGlvbi5zZXQoMCwgZGV0YWlsLnJvdGF0aW9uLCAwKTtcbiAgfVxuICBzY3JhdGNoT2JqZWN0LnNjYWxlLnNldFNjYWxhcihkZXRhaWwuc2NhbGUpO1xuICBzY3JhdGNoT2JqZWN0LnVwZGF0ZU1hdHJpeCgpO1xuICBtZXNoLnNldE1hdHJpeEF0KGluZGV4LCBzY3JhdGNoT2JqZWN0Lm1hdHJpeCk7XG59XG5cbi8qKlxuICogT25lIG1lc2gsIG9uZSBtYXRlcmlhbCwgb25lIGRyYXcgY2FsbCBmb3IgZXZlcnkgY29udGFjdCBzaGFkb3cgb24gdGhlIG1hcC4gU2l6ZWQgdG8gdGhlIGV4YWN0XG4gKiBudW1iZXIgb2Ygc3RhbmRpbmcgaW5zdGFuY2VzIHJhdGhlciB0aGFuIGEgZ3Vlc3NlZCBjZWlsaW5nLlxuICovXG5mdW5jdGlvbiBjcmVhdGVDb250YWN0U2hhZG93cyhkZXRhaWxzOiByZWFkb25seSBEZXRhaWxJbnN0YW5jZVtdKTogVEhSRUUuSW5zdGFuY2VkTWVzaCB7XG4gIGNvbnN0IHNoYWRvd2VkID0gZGV0YWlscy5maWx0ZXIoKGRldGFpbCkgPT4gZGV0YWlsLnNoYWRvd0luZGV4ID49IDApO1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goXG4gICAgbmV3IFRIUkVFLkNpcmNsZUdlb21ldHJ5KDEsIDE0KSxcbiAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgICAgY29sb3I6ICcjMmUxYjBlJyxcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgb3BhY2l0eTogQ09OVEFDVF9TSEFET1dfT1BBQ0lUWSxcbiAgICAgIGRlcHRoV3JpdGU6IGZhbHNlLFxuICAgICAgcG9seWdvbk9mZnNldDogdHJ1ZSxcbiAgICAgIHBvbHlnb25PZmZzZXRGYWN0b3I6IC0xLFxuICAgICAgcG9seWdvbk9mZnNldFVuaXRzOiAtMSxcbiAgICB9KSxcbiAgICBNYXRoLm1heCgxLCBzaGFkb3dlZC5sZW5ndGgpLFxuICApO1xuICBtZXNoLm5hbWUgPSAnRGV0YWlsU2NhdHRlci5jb250YWN0U2hhZG93cyc7XG4gIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBtZXNoLmNhc3RTaGFkb3cgPSBmYWxzZTtcbiAgbWVzaC5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XG4gIG1lc2gucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kU2hhZG93cztcbiAgbWVzaC5jb3VudCA9IHNoYWRvd2VkLmxlbmd0aDtcbiAgaWYgKHNoYWRvd2VkLmxlbmd0aCA9PT0gMCkgbWVzaC52aXNpYmxlID0gZmFsc2U7XG4gIC8vIHNoYWRvd0luZGV4IGlzIGFuIGluZGV4IGludG8gYGRldGFpbHNgLCBzbyBjb21wYWN0IGl0IGRvd24gdG8gdGhlIHNoYWRvdyBtZXNoJ3Mgb3duIHNsb3RzLlxuICBzaGFkb3dlZC5mb3JFYWNoKChkZXRhaWwsIHNsb3QpID0+IHtcbiAgICBkZXRhaWwuc2hhZG93SW5kZXggPSBzbG90O1xuICAgIHdyaXRlQ29udGFjdFNoYWRvdyhtZXNoLCBzbG90LCBkZXRhaWwsIGRldGFpbC5oaWRkZW4pO1xuICB9KTtcbiAgbWVzaC5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIHJldHVybiBtZXNoO1xufVxuXG5mdW5jdGlvbiB3cml0ZUNvbnRhY3RTaGFkb3coXG4gIG1lc2g6IFRIUkVFLkluc3RhbmNlZE1lc2gsXG4gIHNsb3Q6IG51bWJlcixcbiAgZGV0YWlsOiBEZXRhaWxJbnN0YW5jZSxcbiAgaGlkZGVuOiBib29sZWFuLFxuKTogdm9pZCB7XG4gIGlmIChoaWRkZW4pIHtcbiAgICBtZXNoLnNldE1hdHJpeEF0KHNsb3QsIGhpZGRlbk1hdHJpeCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHByb2ZpbGUgPSBwcm9maWxlRm9yTWVzaChkZXRhaWwubWVzaCk7XG4gIGNvbnN0IHNoYXBlID0gcHJvZmlsZSA/IENPTlRBQ1RfU0hBRE9XX0NMQVNTRVNbcHJvZmlsZS5pZF0gOiB1bmRlZmluZWQ7XG4gIGlmICghc2hhcGUpIHtcbiAgICBtZXNoLnNldE1hdHJpeEF0KHNsb3QsIGhpZGRlbk1hdHJpeCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNjcmF0Y2hPYmplY3QucG9zaXRpb24uc2V0KGRldGFpbC54LCBUZXJyYWluLnZpc3VhbFkoZGV0YWlsLngsIGRldGFpbC56LCAwLCAwLjM1KSArIENPTlRBQ1RfU0hBRE9XX0xJRlQsIGRldGFpbC56KTtcbiAgc2NyYXRjaE9iamVjdC5yb3RhdGlvbi5zZXQoLU1hdGguUEkgLyAyLCAwLCBkZXRhaWwucm90YXRpb24pO1xuICBzY3JhdGNoT2JqZWN0LnNjYWxlLnNldChzaGFwZS5yYWRpdXMgKiBkZXRhaWwuc2NhbGUsIHNoYXBlLnJhZGl1cyAqIHNoYXBlLnNxdWFzaCAqIGRldGFpbC5zY2FsZSwgMSk7XG4gIHNjcmF0Y2hPYmplY3QudXBkYXRlTWF0cml4KCk7XG4gIG1lc2guc2V0TWF0cml4QXQoc2xvdCwgc2NyYXRjaE9iamVjdC5tYXRyaXgpO1xufVxuXG4vKipcbiAqIEEgd2FybS9jb29sIGFuZCBsaWdodC9kYXJrIG51ZGdlIHBlciBpbnN0YW5jZSwgaGFzaGVkIGZyb20gd29ybGQgcG9zaXRpb24gc28gaXQgaXMgc3RhYmxlIGFjcm9zc1xuICogYm9vdHMgYW5kIGluZGVwZW5kZW50IG9mIHRoZSBwbGFjZW1lbnQgc3RyZWFtLiBNdWx0aXBsaWVkIG9udG8gdGhlIGNsYXNzIGNvbG91ciBieSB0aHJlZSdzXG4gKiBpbnN0YW5jZS1jb2xvdXIgYXR0cmlidXRlIOKAlCBzYW1lIG1hdGVyaWFsLCBzYW1lIHNpbmdsZSBkcmF3IGNhbGwuXG4gKi9cbmZ1bmN0aW9uIGluc3RhbmNlVGludChpZDogRGV0YWlsQ2xhc3NJZCwgeDogbnVtYmVyLCB6OiBudW1iZXIpOiBUSFJFRS5Db2xvciB7XG4gIGNvbnN0IGppdHRlciA9IFRJTlRfSklUVEVSW2lkXTtcbiAgaWYgKCFqaXR0ZXIpIHJldHVybiBzY3JhdGNoQ29sb3Iuc2V0UkdCKDEsIDEsIDEpO1xuICBjb25zdCB3YXJtID0gaGFzaDAxKHggKiAxMi45ODk4ICsgeiAqIDc4LjIzMykgLSAwLjU7XG4gIGNvbnN0IHZhbHVlID0gaGFzaDAxKHggKiAzOS4zNDY4IC0geiAqIDExLjEzNSArIDcuMzEpIC0gMC41O1xuICBjb25zdCBzY2FsZSA9IDEgKyB2YWx1ZSAqIGppdHRlci52YWx1ZSAqIDI7XG4gIHJldHVybiBzY3JhdGNoQ29sb3Iuc2V0UkdCKFxuICAgIHNjYWxlICogKDEgKyB3YXJtICogaml0dGVyLndhcm0pLFxuICAgIHNjYWxlLFxuICAgIHNjYWxlICogKDEgLSB3YXJtICogaml0dGVyLndhcm0pLFxuICApO1xufVxuXG5mdW5jdGlvbiBoYXNoMDEodmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHNjYWxlZCA9IE1hdGguc2luKHZhbHVlKSAqIDQzNzU4LjU0NTM7XG4gIHJldHVybiBzY2FsZWQgLSBNYXRoLmZsb29yKHNjYWxlZCk7XG59XG5cbmZ1bmN0aW9uIHByb2ZpbGVGb3JNZXNoKG1lc2g6IFRIUkVFLkluc3RhbmNlZE1lc2gpOiBEZXRhaWxQcm9maWxlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG1lc2gudXNlckRhdGEuZGV0YWlsUHJvZmlsZSBhcyBEZXRhaWxQcm9maWxlIHwgdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBpc05lYXJBbnkoZGV0YWlsOiBEZXRhaWxJbnN0YW5jZSwgY2xlYXJpbmdzOiByZWFkb25seSBEZXRhaWxTY2F0dGVyQ2xlYXJQb2ludFtdKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgY2xlYXJpbmcgb2YgY2xlYXJpbmdzKSB7XG4gICAgaWYgKGRpc3RhbmNlU3EoZGV0YWlsLngsIGRldGFpbC56LCBjbGVhcmluZy54LCBjbGVhcmluZy56KSA8IGNsZWFyaW5nLnJhZGl1cyAqIGNsZWFyaW5nLnJhZGl1cykgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBwcm9iZUNsZWFyKFxuICBkZXRhaWxzOiByZWFkb25seSBEZXRhaWxJbnN0YW5jZVtdLFxuICB4OiBudW1iZXIsXG4gIHo6IG51bWJlcixcbiAgY2xlYXJSYWRpdXM6IG51bWJlcixcbik6IERldGFpbFNjYXR0ZXJQcm9iZSB7XG4gIGxldCBuZWFyZXN0U3EgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIGZvciAoY29uc3QgZGV0YWlsIG9mIGRldGFpbHMpIHtcbiAgICBpZiAoZGV0YWlsLmhpZGRlbikgY29udGludWU7XG4gICAgbmVhcmVzdFNxID0gTWF0aC5taW4obmVhcmVzdFNxLCBkaXN0YW5jZVNxKHgsIHosIGRldGFpbC54LCBkZXRhaWwueikpO1xuICB9XG4gIGNvbnN0IG5lYXJlc3QgPSBOdW1iZXIuaXNGaW5pdGUobmVhcmVzdFNxKSA/IE1hdGguc3FydChuZWFyZXN0U3EpIDogbnVsbDtcbiAgcmV0dXJuIHtcbiAgICB4LFxuICAgIHosXG4gICAgY2xlYXJSYWRpdXMsXG4gICAgbmVhcmVzdCxcbiAgICBjbGVhcjogbmVhcmVzdCA9PT0gbnVsbCB8fCBuZWFyZXN0ID49IGNsZWFyUmFkaXVzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBkZXRhaWxEZW5zaXR5KHRpZXI6IERldGFpbERlbnNpdHlUaWVyKTogbnVtYmVyIHtcbiAgaWYgKHRpZXIgPT09ICdvZmYnKSByZXR1cm4gMDtcbiAgY29uc3QgcmF3ID0gdGllciA9PT0gJ21vYmlsZS1yZWR1Y2VkJyA/IEJhbGFuY2Uud29ybGQuZGV0YWlsTW9iaWxlRGVuc2l0eSA6IEJhbGFuY2Uud29ybGQuZGV0YWlsRGVuc2l0eTtcbiAgcmV0dXJuIFRIUkVFLk1hdGhVdGlscy5jbGFtcChyYXcgKiAoU0NBVFRFUl9ERVNDUklQVE9SPy5kZW5zaXR5ID8/IDEpLCAwLCAxLjUpO1xufVxuXG5mdW5jdGlvbiBkZW5zaXR5VGllcigpOiBEZXRhaWxEZW5zaXR5VGllciB7XG4gIGNvbnN0IG1vYmlsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5pbm5lcldpZHRoIDw9IDQzMDtcbiAgY29uc3QgZGVuc2l0eSA9IG1vYmlsZSA/IEJhbGFuY2Uud29ybGQuZGV0YWlsTW9iaWxlRGVuc2l0eSA6IEJhbGFuY2Uud29ybGQuZGV0YWlsRGVuc2l0eTtcbiAgaWYgKGRlbnNpdHkgPD0gMCkgcmV0dXJuICdvZmYnO1xuICByZXR1cm4gbW9iaWxlID8gJ21vYmlsZS1yZWR1Y2VkJyA6ICdkZXNrdG9wJztcbn1cblxuZnVuY3Rpb24gc2NhdHRlclNlZWQoKTogbnVtYmVyIHtcbiAgY29uc3QgcmF3ID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKS5nZXQoJ3NlZWQnKTtcbiAgcmV0dXJuIChub3JtYWxpemVTZWVkKHJhdykgXiAweDUxZjE1ZWVkKSA+Pj4gMDtcbn1cblxuZnVuY3Rpb24gZGlzdGFuY2VTcShheDogbnVtYmVyLCBhejogbnVtYmVyLCBieDogbnVtYmVyLCBiejogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgZHggPSBheCAtIGJ4O1xuICBjb25zdCBkeiA9IGF6IC0gYno7XG4gIHJldHVybiBkeCAqIGR4ICsgZHogKiBkejtcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRNYXRlcmlhbChjb2xvcjogc3RyaW5nLCByb3VnaG5lc3M6IG51bWJlcik6IFRIUkVFLk1lc2hTdGFuZGFyZE1hdGVyaWFsIHtcbiAgcmV0dXJuIG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7XG4gICAgY29sb3IsXG4gICAgcm91Z2huZXNzLFxuICAgIG1ldGFsbmVzczogMC4wMixcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJvY2tHZW9tZXRyeSgpOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB7XG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkRvZGVjYWhlZHJvbkdlb21ldHJ5KDAuMzQsIDApO1xuICBnZW9tZXRyeS5zY2FsZSgxLjI1LCAwLjU1LCAwLjkpO1xuICBnZW9tZXRyeS50cmFuc2xhdGUoMCwgMC4yLCAwKTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5mdW5jdGlvbiBzdHVtcEdlb21ldHJ5KCk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLjIsIDAuMjgsIDAuNDQsIDcpO1xuICBnZW9tZXRyeS50cmFuc2xhdGUoMCwgMC4yMiwgMCk7XG4gIHJldHVybiBnZW9tZXRyeTtcbn1cblxuZnVuY3Rpb24gY2xhaW1Qb3N0R2VvbWV0cnkoKTogVEhSRUUuQnVmZmVyR2VvbWV0cnkge1xuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSgwLjE2LCAxLjA4LCAwLjE2KTtcbiAgZ2VvbWV0cnkudHJhbnNsYXRlKDAsIDAuNTQsIDApO1xuICByZXR1cm4gZ2VvbWV0cnk7XG59XG5cbmZ1bmN0aW9uIGNhY3R1c0dlb21ldHJ5KCk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQ3lsaW5kZXJHZW9tZXRyeSgwLjEzLCAwLjE4LCAwLjg4LCA3KTtcbiAgZ2VvbWV0cnkudHJhbnNsYXRlKDAsIDAuNDQsIDApO1xuICByZXR1cm4gZ2VvbWV0cnk7XG59XG5cbi8vIEEgUkVFRCBJUyBOT1QgQSBCTEFERSBPRiBHUkFTUyAoZG9jcy9iZWF1dHkvZTEtdHdpbi1iYW5rcy1icmllZi5tZCBVMykuIFRoZSByZWVkcyBjbGFzcyB1c2VkXG4vLyB0byBiZSBncmFzc0dlb21ldHJ5IHNjYWxlZCB0aGlubmVyOiB0d28gY3Jvc3NlZCBxdWFkcyBvZiBlcXVhbCBoZWlnaHQsIHdoaWNoIGF0IHRoZSBydW4gY2FtZXJhXG4vLyByZWFkIGFzIGZvdXIgaWRlbnRpY2FsIGJyaWdodCBtYXRjaHN0aWNrcyBzdHVjayBpbiBkcnkgZGlydCDigJQgb24gYSBtYXAgd2hvc2UgYnJpZWZpbmcgY2FyZFxuLy8gcHJvbWlzZXMgXCJkYW1wIHJlZWRzXCIuIFRocmVlIHVuZXF1YWwgdGFwZXJlZCBibGFkZXMsIGxlYW5pbmcgb2ZmLWF4aXMsIGdpdmUgYSB0dWZ0IGEgc2lsaG91ZXR0ZVxuLy8gdGhhdCBzdXJ2aXZlcyAzOTBweDsgdGhlIHN3YXksIHRoZSBwZXItaW5zdGFuY2UgdGludCBhbmQgdGhlIGNvbnRhY3QgcGF0Y2ggZG8gdGhlIHJlc3QuXG5jb25zdCBSRUVEX0JMQURFUyA9IFtcbiAgeyBhbmdsZTogMCwgaGVpZ2h0OiAwLjg4LCBsZWFuOiAwLjEyLCB3aWR0aDogMC4wODUgfSxcbiAgeyBhbmdsZTogMS4wOSwgaGVpZ2h0OiAwLjcsIGxlYW46IC0wLjE2LCB3aWR0aDogMC4wNzIgfSxcbiAgeyBhbmdsZTogMi4yNCwgaGVpZ2h0OiAxLjAyLCBsZWFuOiAwLjA2LCB3aWR0aDogMC4wNzggfSxcbl0gYXMgY29uc3Q7XG4vLyBUaGUgY2xhc3MgaXQgcmVwbGFjZXMsIGluIHRoZSByZW5kZXJlcidzIHdvcmtpbmcgKGxpbmVhcikgc3BhY2UuIEFueXRoaW5nIGRlcml2ZWQgZnJvbSBhXG4vLyBjb250cmFjdCB0aW50IGhhcyB0byBiZSBNT0RVTEFURUQgYWdhaW5zdCB0aGlzLCBuZXZlciB1c2VkIGFzIGFuIGFsYmVkbzogZGFtcFRpbnQgaXMgYVxuLy8gc3BsYXQgbXVsdGlwbGllciBhcm91bmQgMC41LCB3aGljaCBhcyBhIGxpbmVhciBhbGJlZG8gaXMgZml2ZSB0aW1lcyB0aGUgdmFsdWUgdGhpc1xuLy8gc2lsaG91ZXR0ZSB3YXMgYXV0aG9yZWQgYXQsIGFuZCB0aGUgZmlyc3QgY3V0IG9mIFUzIGJsZWFjaGVkIGV2ZXJ5IHJlZWQgdG8gZGVhZCBzdHJhdy5cbmNvbnN0IFJFRURfQkFTRSA9IHsgcjogMC4wOTUsIGc6IDAuMTUsIGI6IDAuMDUyIH0gYXMgY29uc3Q7XG5jb25zdCBSRUVEX0RSWSA9IHsgcjogMC4xNTUsIGc6IDAuMTI1LCBiOiAwLjA1NSB9IGFzIGNvbnN0O1xuXG5mdW5jdGlvbiByZWVkR2VvbWV0cnkoKTogVEhSRUUuQnVmZmVyR2VvbWV0cnkge1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGluZGljZXM6IG51bWJlcltdID0gW107XG4gIGZvciAoY29uc3QgYmxhZGUgb2YgUkVFRF9CTEFERVMpIHtcbiAgICBjb25zdCBhbG9uZyA9IHsgeDogTWF0aC5jb3MoYmxhZGUuYW5nbGUpLCB6OiBNYXRoLnNpbihibGFkZS5hbmdsZSkgfTtcbiAgICBjb25zdCBiYXNlID0gcG9zaXRpb25zLmxlbmd0aCAvIDM7XG4gICAgLy8gVGFwZXJlZCBxdWFkOiBhIHdpZGUgcm9vdCwgYSB0aXAgcHVsbGVkIHNpZGV3YXlzIHNvIG5vIHR3byBibGFkZXMgc3RhbmQgcGFyYWxsZWwuXG4gICAgcG9zaXRpb25zLnB1c2goXG4gICAgICAtYWxvbmcueCAqIGJsYWRlLndpZHRoLCAwLCAtYWxvbmcueiAqIGJsYWRlLndpZHRoLFxuICAgICAgYWxvbmcueCAqIGJsYWRlLndpZHRoLCAwLCBhbG9uZy56ICogYmxhZGUud2lkdGgsXG4gICAgICAtYWxvbmcueCAqIGJsYWRlLndpZHRoICogMC4yMiArIGFsb25nLnggKiBibGFkZS5sZWFuLCBibGFkZS5oZWlnaHQsIC1hbG9uZy56ICogYmxhZGUud2lkdGggKiAwLjIyICsgYWxvbmcueiAqIGJsYWRlLmxlYW4sXG4gICAgICBhbG9uZy54ICogYmxhZGUud2lkdGggKiAwLjIyICsgYWxvbmcueCAqIGJsYWRlLmxlYW4sIGJsYWRlLmhlaWdodCwgYWxvbmcueiAqIGJsYWRlLndpZHRoICogMC4yMiArIGFsb25nLnogKiBibGFkZS5sZWFuLFxuICAgICk7XG4gICAgaW5kaWNlcy5wdXNoKGJhc2UsIGJhc2UgKyAxLCBiYXNlICsgMiwgYmFzZSArIDIsIGJhc2UgKyAxLCBiYXNlICsgMyk7XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5mdW5jdGlvbiByZWVkTWF0ZXJpYWwoKTogVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwge1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7XG4gICAgY29sb3I6ICcjZmZmZmZmJywgLy8gdGhlIHRpbGUncyBvd24gZGFtcFRpbnQgYXJyaXZlcyBwZXIgaW5zdGFuY2U7IHdoaXRlIGtlZXBzIGl0IGhvbmVzdFxuICAgIHJvdWdobmVzczogMSxcbiAgICBtZXRhbG5lc3M6IDAsXG4gICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgfSk7XG4gIGNvbnN0IHRpbWUgPSB7IHZhbHVlOiAwIH07XG4gIG1hdGVyaWFsLnVzZXJEYXRhLnJlZWRUaW1lID0gdGltZTtcbiAgbWF0ZXJpYWwuY3VzdG9tUHJvZ3JhbUNhY2hlS2V5ID0gKCkgPT4gJ3JlZWQtc3dheSc7XG4gIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIpID0+IHtcbiAgICBzaGFkZXIudW5pZm9ybXMudVJlZWRUaW1lID0gdGltZTtcbiAgICBzaGFkZXIudmVydGV4U2hhZGVyID0gc2hhZGVyLnZlcnRleFNoYWRlclxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgJyNpbmNsdWRlIDxjb21tb24+XFxudW5pZm9ybSBmbG9hdCB1UmVlZFRpbWU7JylcbiAgICAgIC5yZXBsYWNlKFxuICAgICAgICAnI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD4nLFxuICAgICAgICBgI2luY2x1ZGUgPGJlZ2luX3ZlcnRleD5cbiAgICAgICAgLy8gUGhhc2UgZnJvbSB0aGUgaW5zdGFuY2UncyBvd24gd29ybGQgcG9zaXRpb246IG5laWdoYm91cmluZyB0dWZ0cyBuZXZlciBiZW5kIGluIHN0ZXAsXG4gICAgICAgIC8vIGFuZCB0aGUgd2hvbGUgZmllbGQgY29zdHMgb25lIHVuaWZvcm0gYW5kIG5vIENQVSB3b3JrIHBlciBmcmFtZS5cbiAgICAgICAgZmxvYXQgcmVlZFBoYXNlID0gaW5zdGFuY2VNYXRyaXhbM10ueCAqIDAuNzEgKyBpbnN0YW5jZU1hdHJpeFszXS56ICogMC45MztcbiAgICAgICAgZmxvYXQgcmVlZFN3YXkgPSBzaW4odVJlZWRUaW1lICogMS4yNSArIHJlZWRQaGFzZSkgKiAwLjA2ICsgc2luKHVSZWVkVGltZSAqIDIuNiArIHJlZWRQaGFzZSAqIDEuNykgKiAwLjAyMjtcbiAgICAgICAgdHJhbnNmb3JtZWQueCArPSByZWVkU3dheSAqIHRyYW5zZm9ybWVkLnk7XG4gICAgICAgIHRyYW5zZm9ybWVkLnogKz0gcmVlZFN3YXkgKiAwLjQyICogdHJhbnNmb3JtZWQueTtgLFxuICAgICAgKTtcbiAgfTtcbiAgcmV0dXJuIG1hdGVyaWFsO1xufVxuXG4vKiogRGFtcCBncmVlbi1ncmV5IHB1bGxlZCB0b3dhcmQgdGhlIHRpbGUncyBvd24gZGFtcFRpbnQgSFVFLCBqaXR0ZXJlZCBwZXIgaW5zdGFuY2UuICovXG5mdW5jdGlvbiByZWVkVGludChybmc6IFJuZyk6IFRIUkVFLkNvbG9yIHtcbiAgY29uc3QgZGFtcCA9IGFjdGl2ZUNvbnRyYWN0KCkudGlsZVBhcmFtcy5wYWxldHRlPy5kYW1wVGludCA/PyBbMC40NSwgMC41MywgMC40XTtcbiAgY29uc3QgbWVhbiA9IE1hdGgubWF4KDAuMDAxLCAoZGFtcFswXSEgKyBkYW1wWzFdISArIGRhbXBbMl0hKSAvIDMpO1xuICBjb25zdCB2YWx1ZSA9IHJuZy5yYW5nZSgwLjc4LCAxLjI2KTtcbiAgLy8gQSBtaW5vcml0eSBvZiBldmVyeSByZWVkIGJlZCBpcyBsYXN0IHNlYXNvbidzIGRyeSBzdGFsazsgc3F1YXJlZCBzbyBpdCBzdGF5cyBhIG1pbm9yaXR5LlxuICBjb25zdCBkcnkgPSBybmcucmFuZ2UoMCwgMSkgKiogMiAqIDAuNTU7XG4gIGNvbnN0IGNoYW5uZWwgPSAoYmFzZTogbnVtYmVyLCBkcmllZDogbnVtYmVyLCB0aW50OiBudW1iZXIpOiBudW1iZXIgPT5cbiAgICBUSFJFRS5NYXRoVXRpbHMubGVycChiYXNlICogKHRpbnQgLyBtZWFuKSwgZHJpZWQsIGRyeSkgKiB2YWx1ZTtcbiAgcmV0dXJuIG5ldyBUSFJFRS5Db2xvcigpLnNldFJHQihcbiAgICBjaGFubmVsKFJFRURfQkFTRS5yLCBSRUVEX0RSWS5yLCBkYW1wWzBdISksXG4gICAgY2hhbm5lbChSRUVEX0JBU0UuZywgUkVFRF9EUlkuZywgZGFtcFsxXSEpLFxuICAgIGNoYW5uZWwoUkVFRF9CQVNFLmIsIFJFRURfRFJZLmIsIGRhbXBbMl0hKSxcbiAgICBUSFJFRS5MaW5lYXJTUkdCQ29sb3JTcGFjZSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY29udGFjdFBhdGNoTWVzaChkZXRhaWxzOiByZWFkb25seSBEZXRhaWxJbnN0YW5jZVtdLCBwcm9maWxlOiBEZXRhaWxQcm9maWxlKTogVEhSRUUuSW5zdGFuY2VkTWVzaCB8IG51bGwge1xuICBjb25zdCBjb250YWN0ID0gcHJvZmlsZS5jb250YWN0O1xuICBjb25zdCB0dWZ0cyA9IGNvbnRhY3QgPyBkZXRhaWxzLmZpbHRlcigoZGV0YWlsKSA9PiBkZXRhaWwuc2NhbGUgPj0gY29udGFjdC5taW5TY2FsZSkgOiBbXTtcbiAgaWYgKCFjb250YWN0IHx8IHR1ZnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gIGNvbnN0IG1lc2ggPSBuZXcgVEhSRUUuSW5zdGFuY2VkTWVzaChuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoY29udGFjdC5yYWRpdXMsIDEyKSwgY29udGFjdE1hdGVyaWFsKCksIHR1ZnRzLmxlbmd0aCk7XG4gIG1lc2gubmFtZSA9IGBEZXRhaWxTY2F0dGVyLiR7cHJvZmlsZS5pZH0uY29udGFjdGA7XG4gIG1lc2gucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kRGVjYWxzO1xuICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgbWVzaC5jYXN0U2hhZG93ID0gZmFsc2U7XG4gIG1lc2gucmVjZWl2ZVNoYWRvdyA9IGZhbHNlO1xuICBjb25zdCBvYmplY3QgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgZm9yIChjb25zdCBbaW5kZXgsIGRldGFpbF0gb2YgdHVmdHMuZW50cmllcygpKSB7XG4gICAgb2JqZWN0LnBvc2l0aW9uLnNldChkZXRhaWwueCwgZGV0YWlsLnkgKyAwLjAxMiwgZGV0YWlsLnopO1xuICAgIG9iamVjdC5yb3RhdGlvbi5zZXQoLU1hdGguUEkgLyAyLCAwLCBkZXRhaWwucm90YXRpb24pO1xuICAgIG9iamVjdC5zY2FsZS5zZXQoZGV0YWlsLnNjYWxlLCBkZXRhaWwuc2NhbGUgKiAwLjcyLCAxKTtcbiAgICBvYmplY3QudXBkYXRlTWF0cml4KCk7XG4gICAgbWVzaC5zZXRNYXRyaXhBdChpbmRleCwgb2JqZWN0Lm1hdHJpeCk7XG4gIH1cbiAgbWVzaC5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIHJldHVybiBtZXNoO1xufVxuXG5mdW5jdGlvbiBjb250YWN0TWF0ZXJpYWwoKTogVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwge1xuICBjb25zdCBzaXplID0gNjQ7XG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSBzaXplO1xuICBjYW52YXMuaGVpZ2h0ID0gc2l6ZTtcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBpZiAoY29udGV4dCkge1xuICAgIGNvbnN0IGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudChzaXplIC8gMiwgc2l6ZSAvIDIsIDAsIHNpemUgLyAyLCBzaXplIC8gMiwgc2l6ZSAvIDIpO1xuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAncmdiYSgyOCwgMjIsIDEyLCAwLjYyKScpO1xuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjU1LCAncmdiYSgyOCwgMjIsIDEyLCAwLjI4KScpO1xuICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgyOCwgMjIsIDEyLCAwKScpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgfVxuICBjb25zdCB0ZXh0dXJlID0gbmV3IFRIUkVFLkNhbnZhc1RleHR1cmUoY2FudmFzKTtcbiAgdGV4dHVyZS5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gIHJldHVybiBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoe1xuICAgIG1hcDogdGV4dHVyZSxcbiAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICBwb2x5Z29uT2Zmc2V0OiB0cnVlLFxuICAgIHBvbHlnb25PZmZzZXRGYWN0b3I6IC0xLFxuICAgIHBvbHlnb25PZmZzZXRVbml0czogLTEsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBncmFzc0dlb21ldHJ5KCk6IFRIUkVFLkJ1ZmZlckdlb21ldHJ5IHtcbiAgY29uc3Qgd2lkdGggPSAwLjMyO1xuICBjb25zdCBoZWlnaHQgPSAwLjU4O1xuICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgLXdpZHRoLCAwLCAwLCB3aWR0aCwgMCwgMCwgLXdpZHRoLCBoZWlnaHQsIDAsIHdpZHRoLCBoZWlnaHQgKiAwLjgyLCAwLFxuICAgIDAsIDAsIC13aWR0aCwgMCwgMCwgd2lkdGgsIDAsIGhlaWdodCAqIDAuODgsIC13aWR0aCwgMCwgaGVpZ2h0LCB3aWR0aCxcbiAgXTtcbiAgY29uc3QgaW5kaWNlcyA9IFswLCAxLCAyLCAyLCAxLCAzLCA0LCA1LCA2LCA2LCA1LCA3XTtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcbiAgcmV0dXJuIGdlb21ldHJ5O1xufVxuXG5mdW5jdGlvbiBydXRNYXRlcmlhbCgpOiBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCB7XG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMud2lkdGggPSAyNTY7XG4gIGNhbnZhcy5oZWlnaHQgPSA2NDtcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBpZiAoY29udGV4dCkge1xuICAgIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdyZ2JhKDgyLCA1NCwgMzEsIDAuMzQpJztcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDg7XG4gICAgZm9yIChjb25zdCB5IG9mIFsyMiwgNDJdKSB7XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPD0gY2FudmFzLndpZHRoOyB4ICs9IDE2KSB7XG4gICAgICAgIGNvbnN0IHdvYmJsZSA9IE1hdGguc2luKHggKiAwLjA1NSArIHkpICogMjtcbiAgICAgICAgaWYgKHggPT09IDApIGNvbnRleHQubW92ZVRvKHgsIHkgKyB3b2JibGUpO1xuICAgICAgICBlbHNlIGNvbnRleHQubGluZVRvKHgsIHkgKyB3b2JibGUpO1xuICAgICAgfVxuICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgdGV4dHVyZSA9IG5ldyBUSFJFRS5DYW52YXNUZXh0dXJlKGNhbnZhcyk7XG4gIHRleHR1cmUuY29sb3JTcGFjZSA9IFRIUkVFLlNSR0JDb2xvclNwYWNlO1xuICB0ZXh0dXJlLmFuaXNvdHJvcHkgPSAyO1xuICByZXR1cm4gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHtcbiAgICBtYXA6IHRleHR1cmUsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogMC42OCxcbiAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICBwb2x5Z29uT2Zmc2V0OiB0cnVlLFxuICAgIHBvbHlnb25PZmZzZXRGYWN0b3I6IC0xLFxuICAgIHBvbHlnb25PZmZzZXRVbml0czogLTEsXG4gICAgc2lkZTogVEhSRUUuRG91YmxlU2lkZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNtb290aHN0ZXAoZWRnZTA6IG51bWJlciwgZWRnZTE6IG51bWJlciwgdmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChlZGdlMCA9PT0gZWRnZTEpIHJldHVybiB2YWx1ZSA8IGVkZ2UwID8gMCA6IDE7XG4gIGNvbnN0IHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCAodmFsdWUgLSBlZGdlMCkgLyAoZWRnZTEgLSBlZGdlMCkpKTtcbiAgcmV0dXJuIHQgKiB0ICogKDMgLSAyICogdCk7XG59XG4iXX0=