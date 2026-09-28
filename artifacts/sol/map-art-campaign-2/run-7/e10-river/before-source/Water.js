import * as THREE from "/node_modules/.vite/deps/three.js?v=6222772d";
import { loadGeneratedTexture } from "/src/assets/generated.ts";
import { palette } from "/src/assets/palette.ts";
import { assetSlots } from "/src/assets/slots.ts";
import { RenderLayers } from "/src/core/RenderLayers.ts";
import { Balance } from "/src/game/Balance.ts";
export function createLivingWaterMaterial(config) {
	const uniforms = {
		time: { value: 0 },
		quality: { value: waterQuality() },
		repeat: { value: config.ford ? 1 : 8 },
		ford: { value: config.ford ? 1 : 0 },
		flowSpeed: { value: Balance.world.waterFlowSpeed },
		riverDepth: { value: config.riverDepth },
		fordDepth: { value: config.fordDepth },
		wadeDepth: { value: config.wadeDepth },
		deepDepth: { value: config.deepDepth }
	};
	const material = new THREE.MeshStandardMaterial({
		color: config.color ?? "#ffffff",
		transparent: true,
		opacity: config.opacity ?? (config.ford ? .74 : .92),
		depthTest: config.depthTest ?? config.ford,
		depthWrite: false,
		roughness: config.ford ? .58 : .36,
		metalness: .01,
		emissive: config.emissive ?? "#000000",
		emissiveIntensity: config.emissiveIntensity ?? 1
	});
	material.map = createWaterTexture(config.ford);
	configureWaterMap(material.map);
	material.userData.waterUniforms = uniforms;
	material.userData.waterGlints = config.anchors.length;
	// The band geometry is BAKED INTO THE SOURCE below as literals (visual/river/ford
	// half widths, the fade window, one line per glint anchor). Two materials that
	// share a cache key share a compiled program, so the key has to carry every
	// literal that can differ — otherwise a second water surface on the same map
	// silently renders with the first one's constants.
	material.customProgramCacheKey = () => [
		"living-water",
		config.openSea ? "sea" : "channel",
		config.ford ? "ford" : "river",
		config.visualHalfWidth.toFixed(3),
		config.riverHalfWidth.toFixed(3),
		config.fordHalfWidth.toFixed(3),
		(config.fordCenters ?? [0]).map((center) => center.toFixed(2)).join("|"),
		config.fadeStart.toFixed(3),
		config.lengthHalf.toFixed(3),
		config.anchors.map((anchor) => `${anchor.x.toFixed(2)},${anchor.z.toFixed(2)}`).join("_") || "noglints",
		`texture${(config.textureBlend ?? .12).toFixed(3)}`,
		`ripple${(config.rippleStrength ?? 1).toFixed(2)}`,
		...config.rippleScale === undefined ? [] : [`ripple-scale${config.rippleScale.toFixed(2)}`],
		`ford${(config.fordTint ?? .72).toFixed(3)}`,
		`shorefade${(config.shoreFadeMeters ?? .95).toFixed(3)}`,
		config.surfaceLift ?? config.bedDepth !== undefined ? "lift" : "nolift",
		config.bedDepth ? `bed${config.bedDepth.deepMeters.toFixed(3)}_${config.bedDepth.shoreMeters.toFixed(3)}` : "nobed"
	].join("-");
	material.onBeforeCompile = (shader) => {
		shader.uniforms.waterTime = uniforms.time;
		if (config.bedDepth) {
			shader.uniforms.waterBedMap = { value: config.bedDepth.map };
			shader.uniforms.waterBedDeep = { value: config.bedDepth.deepMeters };
			shader.uniforms.waterBedShore = { value: config.bedDepth.shoreMeters };
		}
		shader.uniforms.waterQuality = uniforms.quality;
		shader.uniforms.waterRepeat = uniforms.repeat;
		shader.uniforms.waterFord = uniforms.ford;
		shader.uniforms.waterFlowSpeed = uniforms.flowSpeed;
		shader.uniforms.waterRiverDepth = uniforms.riverDepth;
		shader.uniforms.waterFordDepth = uniforms.fordDepth;
		shader.uniforms.waterWadeDepth = uniforms.wadeDepth;
		shader.uniforms.waterDeepDepth = uniforms.deepDepth;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vWaterUv;\nvarying vec2 vWaterWorld;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvWaterUv = uv;\nvWaterWorld = (modelMatrix * vec4(position, 1.0)).xz;");
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
uniform float waterTime;
uniform float waterQuality;
uniform float waterRepeat;
uniform float waterFord;
uniform float waterFlowSpeed;
uniform float waterRiverDepth;
uniform float waterFordDepth;
uniform float waterWadeDepth;
uniform float waterDeepDepth;
${config.bedDepth ? "uniform sampler2D waterBedMap;\nuniform float waterBedDeep;\nuniform float waterBedShore;" : ""}
varying vec2 vWaterUv;
varying vec2 vWaterWorld;

float waterGlint(vec2 world, vec2 center, float phase) {
  vec2 delta = world - center;
  float sparkle = 1.0 - smoothstep(0.0, 1.8, dot(delta, delta));
  float pulse = smoothstep(0.72, 0.99, sin(phase + center.x * 0.37) * 0.5 + 0.5);
  float line = 1.0 - smoothstep(0.018, 0.09, abs(delta.y + sin(delta.x * 2.6 + phase) * 0.05));
  return sparkle * pulse * line;
}

float waterGoldGlints(vec2 world) {
  if (waterQuality < 0.75) return 0.0;
  float glint = 0.0;
${glintShaderLines(config.anchors)}
  return glint;
}

float waterHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float waterNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = waterHash(i);
  float b = waterHash(i + vec2(1.0, 0.0));
  float c = waterHash(i + vec2(0.0, 1.0));
  float d = waterHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`).replace("#include <map_fragment>", `
#ifdef USE_MAP
  float lengthNoise = waterNoise(vec2(vWaterWorld.x * 0.055, vWaterWorld.y * 0.16));
  float crossNoise = waterNoise(vec2(vWaterWorld.x * 0.18 + 13.0, vWaterWorld.y * 0.11 - 7.0));
  float phaseWarp = (waterNoise(vec2(vWaterWorld.x * 0.12 - waterTime * 0.18, vWaterWorld.y * 0.27)) - 0.5) * 0.58 * waterQuality;
  float localSpeed = waterFlowSpeed * mix(0.58, 1.44, lengthNoise);
  vec2 flowUv = vec2(vWaterUv.x * waterRepeat + waterTime * localSpeed + phaseWarp, vWaterUv.y);
  float slowWarp =
    sin(vWaterWorld.x * mix(0.23, 0.52, crossNoise) + vWaterWorld.y * 0.37 - waterTime * mix(0.9, 1.9, lengthNoise)) *
    mix(0.012, 0.038, crossNoise) *
    waterQuality;
  flowUv.y += slowWarp + (crossNoise - 0.5) * 0.045 * waterQuality;
${config.openSea ? "  flowUv = vWaterWorld / 20.0 + vec2(waterTime * waterFlowSpeed * 0.08, waterTime * waterFlowSpeed * 0.03);" : ""}
  vec4 baseTexel = texture2D(map, flowUv);
${config.openSea ? `  // Cross-fade two incommensurate world-space samples of the authored sea.
  // The old single 20 m repeat stamped identical white crests over the wrecks.
  vec2 seaUv = mat2(0.8, -0.6, 0.6, 0.8) * vWaterWorld / 31.7
    + vec2(0.37 - waterTime * waterFlowSpeed * 0.025, 0.19);
  baseTexel = mix(baseTexel, texture2D(map, seaUv), 0.35 + crossNoise * 0.3);` : ""}
  float riverAcross = mix((vWaterUv.y - 0.5) * ${(config.visualHalfWidth * 2).toFixed(3)}, vWaterWorld.y, waterFord);
  float visualEdgeDist = max(0.0, ${config.visualHalfWidth.toFixed(3)} - abs(riverAcross));
  float riverDist = max(0.0, ${config.riverHalfWidth.toFixed(3)} - abs(riverAcross));
  float fordBand = max(waterFord, ${config.openSea ? "0.0" : fordBandExpression(config.fordCenters ?? [0], config.fordHalfWidth)});
  float channelDepth = mix(waterWadeDepth * 0.5, waterRiverDepth, smoothstep(0.05, ${config.riverHalfWidth.toFixed(3)}, riverDist));
  float declaredDepth = mix(channelDepth, waterFordDepth, fordBand);
  float depth = smoothstep(max(0.001, waterWadeDepth), max(waterWadeDepth + 0.001, waterDeepDepth), declaredDepth);
  float bedShore = 1.0;
${config.bedDepth ? `  float bedMetres = texture2D(waterBedMap, vWaterUv).r * waterBedDeep;
  // The carved channel owns the depth read; the ford keeps the tile's DECLARED
  // depth so a crossing the sim calls water never renders as dry ground.
  depth = mix(clamp(bedMetres / waterBedDeep, 0.0, 1.0), depth, fordBand);
  bedShore = max(smoothstep(0.0, waterBedShore, bedMetres), fordBand);` : ""}
  float rippleFreq = mix(1.05, 2.45, lengthNoise);
  float rippleAmp = mix(0.06, 0.17, crossNoise) * ${(config.rippleStrength ?? 1).toFixed(2)};
  float ripple = ${config.openSea ? "(sin(vWaterWorld.x * 2.4 + vWaterWorld.y * 0.9 + sin(vWaterWorld.y * 0.32 - waterTime * 0.6) * 0.8 - waterTime * 2.0) * 0.72 + sin(vWaterWorld.x * 4.1 - vWaterWorld.y * 1.3 + phaseWarp - waterTime * 3.1) * 0.28)" : config.rippleScale !== undefined ? `(sin((vWaterWorld.x * 2.4 + vWaterWorld.y * 0.9) * ${config.rippleScale.toFixed(2)} + sin(vWaterWorld.y * 0.32 - waterTime * 0.6) * 0.8 - waterTime * 2.0) * 0.72 + sin((vWaterWorld.x * 4.1 - vWaterWorld.y * 1.3) * ${config.rippleScale.toFixed(2)} + phaseWarp - waterTime * 3.1) * 0.28)` : "sin(vWaterWorld.x * rippleFreq + vWaterWorld.y * mix(-0.46, 0.72, crossNoise) + phaseWarp * 4.0 - waterTime * mix(2.1, 4.4, lengthNoise))"} * 0.5 + 0.5;
  float fineRipple = 0.0;
  if (waterQuality > 0.7) {
    fineRipple = sin(vWaterWorld.x * mix(3.7, 6.2, crossNoise) + vWaterWorld.y * mix(0.8, 2.4, lengthNoise) - waterTime * mix(3.8, 6.7, crossNoise) + phaseWarp * 2.0) * 0.5 + 0.5;
  }
  float foamNoise = smoothstep(0.26, 0.92, waterNoise(vec2(vWaterWorld.x * 0.42 - waterTime * 0.7, vWaterWorld.y * 1.25 + lengthNoise * 3.0)));
  float bankLine = abs(abs(riverAcross) - ${config.riverHalfWidth.toFixed(3)});
  float bankFoam = (1.0 - smoothstep(0.04, 0.72, bankLine)) * foamNoise * (0.35 + waterQuality * 0.65);
  vec3 shallow = vec3(0.35, 0.51, 0.45);
  vec3 mid = vec3(0.18, 0.40, 0.40);
  vec3 deep = vec3(0.06, 0.18, 0.17);
  vec3 ford = vec3(0.70, 0.69, 0.50);
  vec3 waterColor = mix(shallow, deep, depth);
  waterColor = mix(waterColor, mid, ripple * rippleAmp * waterQuality);
  waterColor = mix(waterColor, ford, fordBand * ${(config.fordTint ?? .72).toFixed(3)});
  waterColor += vec3(0.08, 0.10, 0.08) * fineRipple * waterQuality * (1.0 - fordBand) * 0.22 * ${(config.rippleStrength ?? 1).toFixed(2)};
  waterColor = mix(waterColor, vec3(0.92, 0.84, 0.62), bankFoam * 0.58);
  waterColor += vec3(1.0, 0.72, 0.20) * waterGoldGlints(vWaterWorld) * 0.42;
  waterColor = mix(waterColor, baseTexel.rgb, ${(config.textureBlend ?? .12).toFixed(3)});
${config.openSea ? `  // Sparse moving crests keep the surface distinct from the static seabed.
  // Stillwater inherits its lower rippleStrength; channel shaders are unchanged.
  float seaCrest = smoothstep(0.88, 0.99, ripple) * smoothstep(0.38, 0.78, crossNoise);
  waterColor += vec3(0.16, 0.20, 0.19) * seaCrest * ${(config.rippleStrength ?? 1).toFixed(2)};` : ""}
${config.bedDepth ? `  // Sculpt-only. The declared band's foam line sits where the SIM says the bank is;
  // over a carved channel the real edge is wherever the bed comes up, so foam is
  // driven by measured depth.
  float shoreFoam = (1.0 - smoothstep(waterBedShore * 0.125, waterBedShore * 1.625, bedMetres)) * foamNoise * (0.45 + waterQuality * 0.55);
  waterColor = mix(waterColor, vec3(0.94, 0.88, 0.70), shoreFoam * 0.5 * (1.0 - fordBand));` : ""}
${config.surfaceLift ?? config.bedDepth !== undefined ? `  // Lift face-on ripples independently of the bed-depth path.
  waterColor += vec3(0.10, 0.11, 0.08) * pow(ripple, 2.0) * waterQuality * (1.0 - fordBand) * ${(config.rippleStrength ?? 1).toFixed(2)};` : ""}
${config.rippleScale !== undefined ? `  // Short broken flow lines give flat authored pans a readable moving surface.
  float flowLine = sin(vWaterWorld.y * ${(6.25 * config.rippleScale).toFixed(2)} + sin(vWaterWorld.x * 0.37 - waterTime * 0.7) * 1.1);
  float flowBreak = smoothstep(0.40, 0.75, waterNoise(vec2(vWaterWorld.x * 0.65 - waterTime * 0.25, vWaterWorld.y * 2.0)));
  waterColor += vec3(0.12, 0.15, 0.14) * smoothstep(0.94, 0.995, flowLine) * flowBreak;` : ""}
  float alpha = mix(0.74, 0.94, depth);
  alpha = mix(alpha, 0.58, fordBand * ${(config.fordTint ?? .72).toFixed(3)});
  alpha = mix(alpha, 0.72, bankFoam * 0.4);
  alpha *= smoothstep(0.0, ${(config.shoreFadeMeters ?? .95).toFixed(3)}, visualEdgeDist);
  alpha *= mix(1.0 - smoothstep(${config.fadeStart.toFixed(3)}, ${config.lengthHalf.toFixed(3)}, abs(vWaterWorld.x)), 1.0, waterFord);
  float fordOverlayFade = smoothstep(0.0, 0.18, vWaterUv.x) * (1.0 - smoothstep(0.82, 1.0, vWaterUv.x));
  alpha *= mix(1.0, fordOverlayFade, waterFord);
  // A sculpted shoreline is a depth-buffer intersection, i.e. a razor edge. Fading
  // the last few centimetres of depth turns it into a damp margin instead, and the
  // foam that gathers there stays visible after the water itself has faded out.
  alpha *= bedShore;
${config.bedDepth ? "  alpha = max(alpha, shoreFoam * 0.5 * smoothstep(0.0, 0.05, bedMetres));" : ""}
  vec4 sampledDiffuseColor = vec4(waterColor, alpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
	};
	if (config.openSea) {
		let disposed = false;
		material.addEventListener("dispose", () => {
			disposed = true;
		});
		void loadGeneratedTexture(assetSlots.terrainOpenSea).then((source) => {
			if (!source || disposed) return;
			// Each water surface owns its sampler/disposal; the asset cache owns the source.
			const map = source.clone();
			configureWaterMap(map);
			map.needsUpdate = true;
			material.map?.dispose();
			material.map = map;
			material.needsUpdate = true;
		});
	} else if (!config.ford) void loadGeneratedTexture(assetSlots.terrainRiver);
	return material;
}
const BED_MAP_WIDTH = 512;
const BED_MAP_HEIGHT = 64;
/**
* Bake how deep the water stands over a sculpted bed, in the water plane's own UV
* space. Red channel, 8-bit: 0 == dry, 255 == `deepMeters` or deeper. 8 bits over
* half a metre is ~2mm, far finer than the eye reads at the gameplay camera, and
* an unsigned byte texture is linearly filterable everywhere (a float one is not).
*/
function bakeBedDepth(heightAt, surfaceY, halfLength, centerZ, visualHalfWidth, deepMeters, openSea = false) {
	const mapHeight = openSea ? BED_MAP_WIDTH : BED_MAP_HEIGHT;
	const data = new Uint8Array(BED_MAP_WIDTH * mapHeight);
	let deepest = 0;
	for (let row = 0; row < mapHeight; row += 1) {
		// Plane geometry rotated -90 deg about X: world z decreases as uv.y grows.
		const z = centerZ - ((row + .5) / mapHeight - .5) * visualHalfWidth * 2;
		for (let column = 0; column < BED_MAP_WIDTH; column += 1) {
			const x = ((column + .5) / BED_MAP_WIDTH - .5) * halfLength * 2;
			const depth = Math.max(0, surfaceY - heightAt(x, z));
			if (depth > deepest) deepest = depth;
			data[row * BED_MAP_WIDTH + column] = Math.round(THREE.MathUtils.clamp(depth / deepMeters, 0, 1) * 255);
		}
	}
	const texture = new THREE.DataTexture(data, BED_MAP_WIDTH, mapHeight, THREE.RedFormat, THREE.UnsignedByteType);
	texture.name = "SculptWaterBedDepth";
	texture.magFilter = THREE.LinearFilter;
	texture.minFilter = THREE.LinearFilter;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.generateMipmaps = false;
	texture.colorSpace = THREE.NoColorSpace;
	texture.needsUpdate = true;
	return {
		texture,
		deepest
	};
}
/**
* A render-only living-water surface laid into a SCULPTED channel.
*
* The painted river is a ribbon that floats over flat ground with depth testing
* off; a sculpted map already carries the channel in its terrain mesh, so the
* water here is one flat quad at the channel's water line with depth testing ON.
* The banks then occlude it themselves and the shoreline is wherever the sculpt
* rises through the surface — no shoreline geometry, no second draw call.
*
* Rendering only: nothing here is read by the simulation.
*/
export function createSculptWater(config) {
	const bed = config.bed === false ? undefined : bakeBedDepth(config.heightAt, config.surfaceY, config.halfLength, config.centerZ, config.visualHalfWidth, config.deepMeters, config.openSea);
	const material = createLivingWaterMaterial({
		...config,
		bedDepth: bed ? {
			map: bed.texture,
			deepMeters: config.deepMeters,
			shoreMeters: config.shoreMeters
		} : undefined
	});
	const geometry = new THREE.PlaneGeometry(config.halfLength * 2, config.visualHalfWidth * 2, 1, 1);
	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = "SculptLivingWater";
	mesh.rotation.x = -Math.PI / 2;
	mesh.position.set(0, config.surfaceY, config.centerZ);
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = false;
	mesh.castShadow = false;
	mesh.frustumCulled = false;
	mesh.userData.renderOnly = true;
	mesh.userData.visualHalfWidth = config.visualHalfWidth;
	return {
		mesh,
		deepestMeters: bed?.deepest ?? 0,
		advance: (delta) => updateWaterMaterial(mesh, delta),
		dispose: () => {
			geometry.dispose();
			bed?.texture.dispose();
			material.map?.dispose();
			material.dispose();
		}
	};
}
export function createFordStones(waterY, offsetX = 0) {
	const stoneGeometry = new THREE.CylinderGeometry(.55, .68, .08, 9);
	const stoneMaterial = new THREE.MeshStandardMaterial({
		color: palette.sandDeep,
		roughness: .9,
		metalness: .01
	});
	const stones = [
		[
			-.35,
			-4.25,
			.85,
			.56,
			.1
		],
		[
			.35,
			-2.9,
			.7,
			.5,
			-.2
		],
		[
			-.18,
			-1.45,
			.78,
			.52,
			.45
		],
		[
			.32,
			-.05,
			.74,
			.5,
			-.35
		],
		[
			-.28,
			1.42,
			.82,
			.55,
			.2
		],
		[
			.34,
			2.88,
			.72,
			.5,
			-.1
		],
		[
			-.12,
			4.2,
			.86,
			.58,
			.35
		]
	];
	const mesh = new THREE.InstancedMesh(stoneGeometry, stoneMaterial, stones.length);
	mesh.name = "FordSteppingStones";
	mesh.renderOrder = RenderLayers.gameplay;
	mesh.receiveShadow = true;
	const matrix = new THREE.Matrix4();
	const rotation = new THREE.Quaternion();
	const position = new THREE.Vector3();
	const scale = new THREE.Vector3();
	for (let index = 0; index < stones.length; index += 1) {
		const [x, z, sx, sz, yaw] = stones[index];
		position.set(x + offsetX, waterY + .045, z);
		rotation.setFromEuler(new THREE.Euler(0, yaw, 0));
		scale.set(sx, 1, sz);
		matrix.compose(position, rotation, scale);
		mesh.setMatrixAt(index, matrix);
	}
	mesh.instanceMatrix.needsUpdate = true;
	return mesh;
}
export function updateWaterMaterial(mesh, delta) {
	const uniforms = waterUniforms(mesh);
	if (!uniforms) return;
	uniforms.time.value += delta;
	uniforms.quality.value = waterQuality();
	uniforms.flowSpeed.value = Balance.world.waterFlowSpeed;
	uniforms.wadeDepth.value = Balance.terrainSim.wadeDepth;
	uniforms.deepDepth.value = Balance.terrainSim.deepDepth;
}
export function waterDiagnostics(river, fords, fordStones, gravelBars = []) {
	const riverUniforms = waterUniforms(river);
	const ford = fords[0];
	const fordUniforms = ford ? waterUniforms(ford) : undefined;
	const visualHalfWidth = typeof river.userData.visualHalfWidth === "number" ? river.userData.visualHalfWidth : 0;
	return {
		material: "LivingWaterShader",
		riverPresent: true,
		fordPresent: fords.length > 0,
		riverTime: round3(riverUniforms?.time.value ?? 0),
		fordTime: round3(fordUniforms?.time.value ?? 0),
		quality: round3(riverUniforms?.quality.value ?? waterQuality()),
		mobile: isMobileWater(),
		foam: true,
		glints: river.material.userData.waterGlints ?? 0,
		fordStones: fordStones.reduce((sum, mesh) => sum + mesh.count, 0),
		gravelBars: gravelBars.length,
		visualHalfWidth: round3(visualHalfWidth),
		springPonds: 0,
		waterPhaseVariance: round3(waterPhaseVariance()),
		depth: {
			river: round3(riverUniforms?.riverDepth.value ?? 0),
			ford: round3(fordUniforms?.fordDepth.value ?? riverUniforms?.fordDepth.value ?? 0),
			wade: round3(riverUniforms?.wadeDepth.value ?? Balance.terrainSim.wadeDepth),
			deep: round3(riverUniforms?.deepDepth.value ?? Balance.terrainSim.deepDepth)
		}
	};
}
export function dryWaterDiagnostics(springPonds) {
	return {
		material: "LivingWaterShader",
		riverPresent: false,
		fordPresent: false,
		riverTime: 0,
		fordTime: 0,
		quality: round3(waterQuality()),
		mobile: isMobileWater(),
		foam: false,
		glints: 0,
		fordStones: 0,
		gravelBars: 0,
		visualHalfWidth: 0,
		springPonds,
		waterPhaseVariance: 0,
		depth: {
			river: 0,
			ford: 0,
			wade: round3(Balance.terrainSim.wadeDepth),
			deep: round3(Balance.terrainSim.deepDepth)
		}
	};
}
function waterUniforms(mesh) {
	return mesh.material.userData.waterUniforms;
}
function waterQuality() {
	const value = isMobileWater() ? Balance.world.waterMobileQuality : Balance.world.waterQuality;
	return THREE.MathUtils.clamp(value, 0, 1);
}
function isMobileWater() {
	return typeof window !== "undefined" && window.innerWidth <= 430;
}
function waterPhaseVariance() {
	return waterQuality() * .43;
}
function glintShaderLines(anchors) {
	return anchors.map((anchor, index) => {
		const phase = (index * 1.731).toFixed(3);
		return `  glint += waterGlint(world, vec2(${anchor.x.toFixed(3)}, ${anchor.z.toFixed(3)}), waterTime * 1.65 + ${phase});`;
	}).join("\n");
}
/** Fold every declared crossing into one non-additive shader band. */
function fordBandExpression(centers, halfWidth) {
	const near = halfWidth.toFixed(3);
	const far = (halfWidth + .9).toFixed(3);
	const terms = (centers.length ? centers : [0]).map((center) => {
		const across = center === 0 ? "abs(vWaterWorld.x)" : `abs(vWaterWorld.x - ${center.toFixed(3)})`;
		return `1.0 - smoothstep(${near}, ${far}, ${across})`;
	});
	return terms.length === 1 ? terms[0] : terms.map((term) => `(${term})`).reduce((left, right) => `max(${left}, ${right})`);
}
function configureWaterMap(texture) {
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.anisotropy = 4;
}
function createWaterTexture(shallow) {
	const size = 128;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not create river texture context.");
	context.fillStyle = shallow ? "#9da889" : "#416f6e";
	context.fillRect(0, 0, size, size);
	context.strokeStyle = shallow ? "rgba(245, 230, 200, 0.25)" : "rgba(245, 230, 200, 0.16)";
	context.lineWidth = 1;
	for (let y = 12; y < size; y += 22) {
		context.beginPath();
		context.moveTo(0, y);
		for (let x = 0; x <= size; x += 20) {
			context.lineTo(x, y + Math.sin(x * .07 + y) * 4);
		}
		context.stroke();
	}
	context.strokeStyle = "rgba(46, 27, 14, 0.08)";
	for (let x = -size; x < size * 2; x += 34) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x + size * .35, size);
		context.stroke();
	}
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}
function round3(value) {
	return Math.round(value * 1e3) / 1e3;
}
/**
* The shared water field: one glint, one hash, one value-noise, used by the river/ford surface and
* by the spring pond. Extracted verbatim from the river shader so the two surfaces cannot drift
* apart — a pond that ripples on different noise than the river reads as a different game's water.
*/
const WATER_FIELD_GLSL = `
float waterGlint(vec2 world, vec2 center, float phase) {
  vec2 delta = world - center;
  float sparkle = 1.0 - smoothstep(0.0, 1.8, dot(delta, delta));
  float pulse = smoothstep(0.72, 0.99, sin(phase + center.x * 0.37) * 0.5 + 0.5);
  float line = 1.0 - smoothstep(0.018, 0.09, abs(delta.y + sin(delta.x * 2.6 + phase) * 0.05));
  return sparkle * pulse * line;
}

float waterHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float waterNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = waterHash(i);
  float b = waterHash(i + vec2(1.0, 0.0));
  float c = waterHash(i + vec2(0.0, 1.0));
  float d = waterHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}`;
const POND_SURFACE_LIFT = .02;
/**
* ONE LIVE POOL IN A BONE-DRY MAP (brief U1).
*
* Render-only: a disc of moving water at a spring the sim already declares, and a few reed tufts; the sculpted terrain owns its bank. Nothing here is read by the
* simulation — the spring's position, radius and zone stay exactly where `tileParams.waterSources`
* put them, and this surface only draws what that declaration already means.
*
* It is NOT the river material. The river/ford shader measures everything in world-z bands and
* fades on the ford's UV strip; on a disc those become a hard edge across the pool and an alpha
* that depends on how far the pond happens to sit from z=0. Same water language (same noise, same
* glint, same warm-shallow-to-cool-deep ramp), radial geometry.
*/
export function createSpringPondSurface(config) {
	const group = new THREE.Group();
	group.name = "SpringPondLive";
	group.userData.renderOnly = true;
	const time = { value: 0 };
	const quality = { value: waterQuality() };
	const material = new THREE.MeshStandardMaterial({
		color: "#ffffff",
		transparent: true,
		opacity: .74,
		depthWrite: false,
		depthTest: true,
		roughness: .5,
		metalness: .02
	});
	material.map = createWaterTexture(true);
	configureWaterMap(material.map);
	material.userData.waterUniforms = {
		time,
		quality
	};
	material.customProgramCacheKey = () => "living-water-spring-pond";
	material.onBeforeCompile = (shader) => {
		shader.uniforms.pondTime = time;
		shader.uniforms.pondQuality = quality;
		shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec2 vPondLocal;").replace("#include <uv_vertex>", "#include <uv_vertex>\nvPondLocal = position.xy;");
		shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
uniform float pondTime;
uniform float pondQuality;
varying vec2 vPondLocal;
${WATER_FIELD_GLSL}`).replace("#include <map_fragment>", `
#ifdef USE_MAP
  float pondDist = length(vPondLocal);
  float pondR = pondDist / ${config.radius.toFixed(3)};
  // Deep across most of the pool and thinning only at the very lip: a spring is a hole with water
  // in it, not a saucer, and a soft radial ramp is what made the baked version read as a decal.
  float pondDepth = 1.0 - smoothstep(0.88, 1.0, pondR);
  // Wind chop: two noise fields drifting across each other. This carries the motion; the ring
  // wavelets below only punctuate it, because concentric rings alone read as a target.
  float pondChop = waterNoise(vPondLocal * 1.15 + vec2(pondTime * 0.09, -pondTime * 0.05));
  float pondChopB = waterNoise(vPondLocal * 2.2 - vec2(pondTime * 0.13, pondTime * 0.08));
  float pondSurface = (pondChop * 0.62 + pondChopB * 0.38 - 0.5);
  // The spring eye is well off-centre and the ring phase is warped by the chop.
  float pondEye = length(vPondLocal - vec2(${(config.radius * .34).toFixed(3)}, ${(config.radius * -.29).toFixed(3)}));
  float pondRings = sin(pondEye * 4.6 - pondTime * 1.35 + pondSurface * 5.0) * 0.5 + 0.5;
  float pondFine = 0.0;
  if (pondQuality > 0.7) {
    pondFine = sin(pondEye * 11.5 - pondTime * 2.6 + pondChopB * 4.2) * 0.5 + 0.5;
  }
  vec4 pondTexel = texture2D(map, vPondLocal * 0.22 + vec2(pondTime * 0.010, pondChop * 0.05));
  // Green-black at depth, olive where the water thins over pale sand. Never the pool-cyan the
  // atlas bakes — a desert spring is dark, and the darkness is what makes the glints read.
  vec3 pondShallow = vec3(0.40, 0.47, 0.27);
  vec3 pondDeepColor = vec3(0.040, 0.150, 0.125);
  vec3 pondColor = mix(pondShallow, pondDeepColor, pondDepth);
  pondColor += vec3(0.11, 0.16, 0.10) * pondSurface * (0.5 + pondQuality * 0.5);
  pondColor += vec3(0.07, 0.10, 0.06) * pondRings * 0.16;
  pondColor += vec3(0.06, 0.08, 0.05) * pondFine * pondQuality * 0.20;
  // The one thing a still atlas can never do: sun moving on water.
  // Small and many, not one big streak: waterGlint draws a short specular line, so at this scale
  // each is a ~30 cm flash and the pool twinkles instead of looking scratched.
  vec2 pondGlintUv = vPondLocal * 4.2;
  float pondGlint =
    waterGlint(pondGlintUv, vec2(1.2, -0.7), pondTime * 1.15) +
    waterGlint(pondGlintUv, vec2(-1.9, 1.4), pondTime * 1.15 + 1.7) +
    waterGlint(pondGlintUv, vec2(0.4, 2.6), pondTime * 1.15 + 3.1) +
    waterGlint(pondGlintUv, vec2(-2.6, -1.9), pondTime * 1.15 + 4.4) +
    waterGlint(pondGlintUv, vec2(2.4, 1.9), pondTime * 1.15 + 5.6) +
    waterGlint(pondGlintUv, vec2(-0.3, -2.9), pondTime * 1.15 + 2.4);
  pondColor += vec3(1.0, 0.94, 0.72) * pondGlint * pondQuality * 1.5;
  pondColor = mix(pondColor, pondTexel.rgb * 0.6, 0.10);
  // Keep depth readable while softening only the water silhouette.
  float pondAlpha = mix(0.88, 0.985, pondDepth) * (1.0 - smoothstep(0.96, 1.0, pondR));
  vec4 sampledDiffuseColor = vec4(pondColor, pondAlpha);
  diffuseColor *= sampledDiffuseColor;
#endif`);
	};
	const water = new THREE.Mesh(new THREE.CircleGeometry(config.radius, 56), material);
	water.name = "SpringPondLiveSurface";
	water.rotation.x = -Math.PI / 2;
	water.position.set(config.x, config.surfaceY + POND_SURFACE_LIFT, config.z);
	water.renderOrder = RenderLayers.groundDecals;
	water.receiveShadow = false;
	water.castShadow = false;
	water.frustumCulled = false;
	group.add(water);
	// The 3D pilot has no per-frame pump and giving it one would mean editing Game.ts, which this
	// surface has no business touching. Three already calls onBeforeRender once per mesh per render;
	// the frame guard keeps a second camera pass (or a future one) from double-advancing the clock.
	const clock = new THREE.Clock();
	let lastFrame = -1;
	water.onBeforeRender = (renderer) => {
		if (renderer.info.render.frame === lastFrame) return;
		lastFrame = renderer.info.render.frame;
		// Clamped: a backgrounded tab returns seconds, and a pond that teleports forward on refocus
		// looks like a glitch rather than water.
		time.value += Math.min(clock.getDelta(), .1);
		quality.value = waterQuality();
	};
	const reeds = createPondReedTufts(config);
	group.add(reeds);
	return {
		group,
		waterRadius: config.radius,
		dispose: () => {
			material.map?.dispose();
			material.dispose();
			water.geometry.dispose();
			reeds.material.dispose();
			reeds.geometry.dispose();
		}
	};
}
/**
* Three darker reed clumps on the wet margin. Desaturated on purpose: desert law says cacti and dry
* brush, and a bright green fringe would turn the one spring into an oasis the map does not have.
*/
function createPondReedTufts(config) {
	const blades = [
		{
			angle: .62,
			distance: 1,
			scale: 1
		},
		{
			angle: .86,
			distance: 1.06,
			scale: .74
		},
		{
			angle: 2.48,
			distance: 1.03,
			scale: .92
		},
		{
			angle: 2.72,
			distance: .97,
			scale: .68
		},
		{
			angle: 4.3,
			distance: .99,
			scale: .96
		},
		{
			angle: 4.06,
			distance: 1.05,
			scale: .72
		}
	];
	const mesh = new THREE.InstancedMesh(reedTuftGeometry(), new THREE.MeshStandardMaterial({
		color: "#8d8250",
		roughness: 1,
		metalness: 0,
		side: THREE.DoubleSide
	}), blades.length);
	mesh.name = "SpringPondLiveReeds";
	mesh.castShadow = false;
	mesh.receiveShadow = true;
	mesh.frustumCulled = false;
	const anchor = new THREE.Object3D();
	blades.forEach(({ angle, distance, scale }, index) => {
		anchor.position.set(config.x + Math.cos(angle) * config.radius * distance, 0, config.z + Math.sin(angle) * config.radius * distance);
		anchor.position.y = config.heightAt(anchor.position.x, anchor.position.z);
		anchor.rotation.set(0, angle, 0);
		anchor.scale.setScalar(scale);
		anchor.updateMatrix();
		mesh.setMatrixAt(index, anchor.matrix);
	});
	mesh.instanceMatrix.needsUpdate = true;
	return mesh;
}
function reedTuftGeometry() {
	const positions = [], indices = [];
	for (let i = 0; i < 6; i++) {
		const angle = i * 2.4, c = Math.cos(angle), s = Math.sin(angle);
		const height = .68 + i % 3 * .12, width = .05;
		const x = c * .065, z = s * .065, lean = .15 + i % 2 * .08;
		const base = positions.length / 3;
		positions.push(x - width * c, 0, z - width * s, x + width * c, 0, z + width * s, x + lean * c - width * .6 * c, height * .65, z + lean * s - width * .6 * s, x + lean * c + width * .6 * c, height * .65, z + lean * s + width * .6 * s, x + lean * 1.8 * c, height, z + lean * 1.8 * s);
		indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3, base + 2, base + 3, base + 4);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}
const RIBBON_EDGE_FADE_METRES = .18;
const CONFLUENCE_EDGE_FADE_METRES = .45;
const RIBBON_FOAM_INSET_METRES = .16;
const RIBBON_TINT = {
	r: .74,
	g: 1,
	b: 1.18
};
const RIBBON_SEGMENT_METRES = .45;
const RIBBON_BED_MAP_WIDTH = 256;
const RIBBON_BED_MAP_HEIGHT = 16;
/**
* A render-only living-water strip that follows a sculpted channel's own centreline.
*
* The mesh is a mitre-joined band of the SAME half-width the sculpt was cut from, laid at
* the mask's water plane, so it can never cover ground the mask calls dry. Nothing here is
* simulation: band classification, fords and crossings stay engine truth.
*/
export function createWaterRibbon(config) {
	const samples = ribbonSamples(config);
	const geometry = ribbonGeometry(config, samples);
	const bedMap = config.bed ? bakeRibbonBedDepth(samples, config, config.bed) : undefined;
	const shaderUnitsPerMetre = .95 / RIBBON_EDGE_FADE_METRES;
	const material = createLivingWaterMaterial({
		ford: false,
		// Foam rides the mask's own bank line; the fade rides the bled mesh edge.
		riverHalfWidth: (config.halfWidth - RIBBON_FOAM_INSET_METRES) * shaderUnitsPerMetre,
		visualHalfWidth: (config.halfWidth + config.edgeBleed) * shaderUnitsPerMetre,
		// The ends are shaped by vertex alpha (each channel meets the tile differently), so the
		// shader's symmetric |x| length fade is pushed off the tile instead of fighting it.
		lengthHalf: 512,
		fadeStart: 511,
		// A braid's fords are pans at |x|=16, not a band at x=0: the shared ford tint stays off.
		fordHalfWidth: -1,
		riverDepth: config.depth,
		fordDepth: config.depth,
		wadeDepth: Balance.terrainSim.wadeDepth,
		deepDepth: Balance.terrainSim.deepDepth,
		anchors: [...config.glints],
		opacity: 1,
		textureBlend: 0,
		rippleStrength: .34,
		bedDepth: bedMap && config.bed ? {
			map: bedMap,
			deepMeters: config.bed.deepMeters,
			shoreMeters: config.bed.shoreMeters
		} : undefined
	});
	// Ribbons ride ON a sculpt: the dry plait between the channels has to occlude the far one.
	// That same depth test is the water's safety law — a ribbon may over-reach its mask band and
	// the sculpt clips it at the exact contour where the bed crosses the water plane, so the
	// waterline is the sculpt's own and water can never be painted onto ground the mask calls dry.
	material.depthTest = true;
	material.depthWrite = false;
	material.vertexColors = true;
	material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
	material.roughness = .5;
	// The shared river tiles its flow map 8x along a 64 m band; a 58 m braid channel needs the
	// same ~2.5 m tile or the current smears into one flat sheet. Uniform, not shader source.
	const uniforms = material.userData.waterUniforms;
	uniforms.repeat.value = Math.max(4, Math.round(samples[samples.length - 1].distance / 2.5));
	if (bedMap) material.addEventListener("dispose", () => bedMap.dispose());
	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = config.name;
	mesh.userData.renderOnly = true;
	mesh.userData.visualHalfWidth = config.halfWidth;
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = false;
	mesh.castShadow = false;
	mesh.frustumCulled = false;
	return mesh;
}
/** One shared surface where the two braid branches rejoin and leave the tile. */
export function createWaterConfluence(config) {
	const geometry = confluenceGeometry(config);
	const maxWidth = Math.max(...config.paths.flatMap((path) => path.map((point) => point.halfWidth)));
	const shaderUnitsPerMetre = .95 / CONFLUENCE_EDGE_FADE_METRES;
	const material = createLivingWaterMaterial({
		ford: false,
		riverHalfWidth: (maxWidth - RIBBON_FOAM_INSET_METRES) * shaderUnitsPerMetre,
		visualHalfWidth: maxWidth * shaderUnitsPerMetre,
		lengthHalf: 512,
		fadeStart: 511,
		fordHalfWidth: -1,
		riverDepth: config.depth,
		fordDepth: config.depth,
		wadeDepth: Balance.terrainSim.wadeDepth,
		deepDepth: Balance.terrainSim.deepDepth,
		anchors: [],
		depthTest: false,
		opacity: 1,
		textureBlend: 0,
		rippleStrength: .26
	});
	material.vertexColors = true;
	material.depthWrite = false;
	material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
	material.roughness = .46;
	const uniforms = material.userData.waterUniforms;
	uniforms.repeat.value = Math.max(4, Math.round(Math.max(...config.paths.map(centrelineLength)) / 2.5));
	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = config.name;
	mesh.userData.renderOnly = true;
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = false;
	mesh.castShadow = false;
	mesh.frustumCulled = false;
	return mesh;
}
/**
* The shallow sheet over a mask's ford rects — the crossing a player reads before stepping.
*
* One mesh for every pan on the tile, carrying the shipped ford water config, so a braid's
* crossings read wet-but-passable instead of brown gravel with a stripe of river through them.
* Depth-tested like the channel ribbons: the sculpt cuts the waterline, not this geometry.
*/
export function createFordSheet(config) {
	const positions = [];
	const uvs = [];
	const indices = [];
	for (const pan of config.pans) {
		const base = positions.length / 3;
		for (const [x, z] of [
			[pan.minX, pan.minZ],
			[pan.maxX, pan.minZ],
			[pan.minX, pan.maxZ],
			[pan.maxX, pan.maxZ]
		]) {
			positions.push(x, config.surfaceY, z);
			uvs.push((x - pan.minX) / Math.max(.001, pan.maxX - pan.minX), (z - pan.minZ) / Math.max(.001, pan.maxZ - pan.minZ));
		}
		indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	geometry.computeBoundingSphere();
	// The ford branch of the shared shader already does what a pan needs: it reads across in WORLD
	// z (so visualHalfWidth is the pan's own half-depth) and fades the sheet at both ends of its uv
	// span, which is how the shipped centre ford stops dead against dry gravel.
	const material = createLivingWaterMaterial({
		ford: true,
		riverHalfWidth: config.halfDepth * .72,
		visualHalfWidth: config.halfDepth,
		lengthHalf: 512,
		fadeStart: 511,
		fordHalfWidth: config.halfDepth,
		riverDepth: config.depth,
		fordDepth: config.depth,
		wadeDepth: Balance.terrainSim.wadeDepth,
		deepDepth: Balance.terrainSim.deepDepth,
		anchors: []
	});
	material.color.setRGB(RIBBON_TINT.r, RIBBON_TINT.g, RIBBON_TINT.b, THREE.LinearSRGBColorSpace);
	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = config.name;
	mesh.userData.renderOnly = true;
	mesh.renderOrder = RenderLayers.groundDecals;
	mesh.receiveShadow = false;
	mesh.castShadow = false;
	mesh.frustumCulled = false;
	return mesh;
}
function ribbonSamples(config) {
	const controls = config.points.map((point) => ({ ...point }));
	const divisions = Math.max(2, Math.ceil(centrelineLength(controls) / RIBBON_SEGMENT_METRES));
	const points = controls.length === 2 ? Array.from({ length: divisions + 1 }, (_, index) => ({
		x: lerp(controls[0].x, controls[1].x, index / divisions),
		z: lerp(controls[0].z, controls[1].z, index / divisions)
	})) : new THREE.CatmullRomCurve3(controls.map((point) => new THREE.Vector3(point.x, 0, point.z)), false, "centripetal").getSpacedPoints(divisions).map((point) => ({
		x: point.x,
		z: point.z
	}));
	let distance = 0;
	const samples = points.map((point, index) => {
		if (index > 0) distance += Math.hypot(point.x - points[index - 1].x, point.z - points[index - 1].z);
		const before = points[Math.max(0, index - 1)];
		const after = points[Math.min(points.length - 1, index + 1)];
		const length = Math.hypot(after.x - before.x, after.z - before.z) || 1;
		return {
			x: point.x,
			z: point.z,
			nx: -(after.z - before.z) / length,
			nz: (after.x - before.x) / length,
			distance
		};
	});
	const end = samples[samples.length - 1].distance - (config.tailInset ?? 0);
	const trimmed = samples.filter((sample) => sample.distance >= (config.headInset ?? 0) && sample.distance <= end);
	const start = trimmed[0]?.distance ?? 0;
	return trimmed.map((sample) => ({
		...sample,
		distance: sample.distance - start
	}));
}
function ribbonGeometry(config, samples) {
	const total = samples[samples.length - 1].distance || 1;
	const positions = [];
	const uvs = [];
	const colors = [];
	const indices = [];
	for (const sample of samples) {
		const alpha = Math.min(config.headFade > 0 ? smoothstep(0, config.headFade, sample.distance) : 1, config.tailFade > 0 ? smoothstep(0, config.tailFade, total - sample.distance) : 1);
		for (const side of [1, -1]) {
			const reach = (config.halfWidth + config.edgeBleed) * side;
			positions.push(sample.x + sample.nx * reach, config.surfaceY, sample.z + sample.nz * reach);
			uvs.push(sample.distance / total, side > 0 ? 0 : 1);
			colors.push(1, 1, 1, alpha);
		}
	}
	// Wound so the face normal is +Y: each row is [+offset, -offset] and the material is single-sided.
	for (let row = 0; row < samples.length - 1; row += 1) {
		const a = row * 2;
		indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	geometry.computeBoundingSphere();
	return geometry;
}
function confluenceGeometry(config) {
	const positions = [];
	const uvs = [];
	const colors = [];
	const indices = [];
	for (const path of config.paths) {
		const base = positions.length / 3;
		const distances = path.map((point, index) => index === 0 ? 0 : Math.hypot(point.x - path[index - 1].x, point.z - path[index - 1].z));
		for (let index = 1; index < distances.length; index += 1) distances[index] += distances[index - 1];
		const total = distances[distances.length - 1] || 1;
		for (let index = 0; index < path.length; index += 1) {
			const point = path[index];
			const before = path[Math.max(0, index - 1)];
			const after = path[Math.min(path.length - 1, index + 1)];
			const length = Math.hypot(after.x - before.x, after.z - before.z) || 1;
			const nx = -(after.z - before.z) / length;
			const nz = (after.x - before.x) / length;
			for (const side of [1, -1]) {
				positions.push(point.x + nx * point.halfWidth * side, config.surfaceY, point.z + nz * point.halfWidth * side);
				uvs.push(distances[index] / total, side > 0 ? 0 : 1);
				colors.push(1, 1, 1, point.alpha);
			}
		}
		for (let row = 0; row < path.length - 1; row += 1) {
			const a = base + row * 2;
			indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
		}
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	geometry.computeBoundingSphere();
	return geometry;
}
function bakeRibbonBedDepth(samples, config, bed) {
	const data = new Uint8Array(RIBBON_BED_MAP_WIDTH * RIBBON_BED_MAP_HEIGHT);
	const reach = config.halfWidth + config.edgeBleed;
	for (let column = 0; column < RIBBON_BED_MAP_WIDTH; column += 1) {
		const sampleIndex = (column + .5) / RIBBON_BED_MAP_WIDTH * (samples.length - 1);
		const before = samples[Math.floor(sampleIndex)];
		const after = samples[Math.min(samples.length - 1, Math.ceil(sampleIndex))];
		const mix = sampleIndex - Math.floor(sampleIndex);
		const x = lerp(before.x, after.x, mix);
		const z = lerp(before.z, after.z, mix);
		const nx = lerp(before.nx, after.nx, mix);
		const nz = lerp(before.nz, after.nz, mix);
		const normalLength = Math.hypot(nx, nz) || 1;
		for (let row = 0; row < RIBBON_BED_MAP_HEIGHT; row += 1) {
			const side = 1 - (row + .5) / RIBBON_BED_MAP_HEIGHT * 2;
			const depth = Math.max(0, config.surfaceY - bed.heightAt(x + nx / normalLength * reach * side, z + nz / normalLength * reach * side));
			data[row * RIBBON_BED_MAP_WIDTH + column] = Math.round(THREE.MathUtils.clamp(depth / bed.deepMeters, 0, 1) * 255);
		}
	}
	const texture = new THREE.DataTexture(data, RIBBON_BED_MAP_WIDTH, RIBBON_BED_MAP_HEIGHT, THREE.RedFormat, THREE.UnsignedByteType);
	texture.name = `${config.name}.BedDepth`;
	texture.magFilter = THREE.LinearFilter;
	texture.minFilter = THREE.LinearFilter;
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.generateMipmaps = false;
	texture.colorSpace = THREE.NoColorSpace;
	texture.needsUpdate = true;
	return texture;
}
function centrelineLength(points) {
	return points.reduce((total, point, index) => index === 0 ? 0 : total + Math.hypot(point.x - points[index - 1].x, point.z - points[index - 1].z), 0);
}
function lerp(from, to, mix) {
	return from + (to - from) * mix;
}
function smoothstep(edge0, edge1, value) {
	const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
	return t * t * (3 - 2 * t);
}

//# sourceMappingURL=data:application/json;base64,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T0FBTyxPQUFPLFFBQVEsT0FBTyxPQUFPLFVBQVcsVUFBVSxJQUFJLElBQUksUUFBUSxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sUUFBUSxFQUFFLENBQUUsR0FBRyxNQUFNLElBQUksT0FBTyxRQUFRLEVBQUUsQ0FBRSxDQUFDLEdBQUksQ0FBQztBQUN6SjtBQUdBLFNBQVMsS0FBSyxNQUFjLElBQVksS0FBcUI7Q0FDM0QsT0FBTyxRQUFRLEtBQUssUUFBUTtBQUM5QjtBQUdBLFNBQVMsV0FBVyxPQUFlLE9BQWUsT0FBdUI7Q0FDdkUsTUFBTSxJQUFJLE1BQU0sVUFBVSxPQUFPLFFBQVEsVUFBVSxRQUFRLFFBQVEsR0FBRyxDQUFDO0NBQ3ZFLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSTtBQUMxQiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJXYXRlci50cyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgeyBsb2FkR2VuZXJhdGVkVGV4dHVyZSB9IGZyb20gJy4uL2Fzc2V0cy9nZW5lcmF0ZWQnO1xuaW1wb3J0IHsgcGFsZXR0ZSB9IGZyb20gJy4uL2Fzc2V0cy9wYWxldHRlJztcbmltcG9ydCB7IGFzc2V0U2xvdHMgfSBmcm9tICcuLi9hc3NldHMvc2xvdHMnO1xuaW1wb3J0IHsgUmVuZGVyTGF5ZXJzIH0gZnJvbSAnLi4vY29yZS9SZW5kZXJMYXllcnMnO1xuaW1wb3J0IHsgQmFsYW5jZSB9IGZyb20gJy4uL2dhbWUvQmFsYW5jZSc7XG5cbmV4cG9ydCB0eXBlIFdhdGVyRGlhZ25vc3RpY3MgPSB7XG4gIG1hdGVyaWFsOiAnTGl2aW5nV2F0ZXJTaGFkZXInO1xuICByaXZlclByZXNlbnQ6IGJvb2xlYW47XG4gIGZvcmRQcmVzZW50OiBib29sZWFuO1xuICByaXZlclRpbWU6IG51bWJlcjtcbiAgZm9yZFRpbWU6IG51bWJlcjtcbiAgcXVhbGl0eTogbnVtYmVyO1xuICBtb2JpbGU6IGJvb2xlYW47XG4gIGZvYW06IGJvb2xlYW47XG4gIGdsaW50czogbnVtYmVyO1xuICBmb3JkU3RvbmVzOiBudW1iZXI7XG4gIGdyYXZlbEJhcnM6IG51bWJlcjtcbiAgdmlzdWFsSGFsZldpZHRoOiBudW1iZXI7XG4gIHNwcmluZ1BvbmRzOiBudW1iZXI7XG4gIHdhdGVyUGhhc2VWYXJpYW5jZTogbnVtYmVyO1xuICBkZXB0aDoge1xuICAgIHJpdmVyOiBudW1iZXI7XG4gICAgZm9yZDogbnVtYmVyO1xuICAgIHdhZGU6IG51bWJlcjtcbiAgICBkZWVwOiBudW1iZXI7XG4gIH07XG59O1xuXG50eXBlIFdhdGVyVW5pZm9ybXMgPSB7XG4gIHRpbWU6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHF1YWxpdHk6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHJlcGVhdDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgZm9yZDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgZmxvd1NwZWVkOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICByaXZlckRlcHRoOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICBmb3JkRGVwdGg6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIHdhZGVEZXB0aDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgZGVlcERlcHRoOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xufTtcblxudHlwZSBXYXRlck1hdGVyaWFsQ29uZmlnID0ge1xuICBmb3JkOiBib29sZWFuO1xuICAvKiogT3BlbiBzZWEgaGFzIG5vIHJpdmVyIGNyb3NzaW5nIGJhbmQgYW5kIHVzZXMgd2luZC1hbGlnbmVkIHN1cmZhY2UgY3Jlc3RzLiAqL1xuICBvcGVuU2VhPzogYm9vbGVhbjtcbiAgcml2ZXJIYWxmV2lkdGg6IG51bWJlcjtcbiAgdmlzdWFsSGFsZldpZHRoOiBudW1iZXI7XG4gIGxlbmd0aEhhbGY6IG51bWJlcjtcbiAgZmFkZVN0YXJ0OiBudW1iZXI7XG4gIGZvcmRIYWxmV2lkdGg6IG51bWJlcjtcbiAgcml2ZXJEZXB0aDogbnVtYmVyO1xuICBmb3JkRGVwdGg6IG51bWJlcjtcbiAgd2FkZURlcHRoOiBudW1iZXI7XG4gIGRlZXBEZXB0aDogbnVtYmVyO1xuICBhbmNob3JzOiBBcnJheTx7IHg6IG51bWJlcjsgejogbnVtYmVyIH0+O1xuICAvKiogV29ybGQtWCBjZW50cmVzIG9mIGV2ZXJ5IGRlY2xhcmVkIGZvcmQuIE9taXR0ZWQgcHJlc2VydmVzIHRoZSBzaGlwcGVkIG9yaWdpbiBjcm9zc2luZy4gKi9cbiAgZm9yZENlbnRlcnM/OiByZWFkb25seSBudW1iZXJbXTtcbiAgLyoqXG4gICAqIFRoZSBwYWludGVkIHJpdmVyIGZsb2F0cyBvdmVyIGZsYXQgZ3JvdW5kLCBzbyBpdCBzaGlwcyB3aXRoIGRlcHRoIHRlc3RpbmcgT0ZGLlxuICAgKiBBIHN1cmZhY2UgbGFpZCBpbnRvIGEgc2N1bHB0ZWQgY2hhbm5lbCBuZWVkcyBpdCBPTiBvciBpdCBwYWludHMgc3RyYWlnaHQgb3ZlclxuICAgKiB0aGUgYmFua3MgaW4gZnJvbnQgb2YgaXQuXG4gICAqL1xuICBkZXB0aFRlc3Q/OiBib29sZWFuO1xuICAvKipcbiAgICogTXVsdGlwbGllcyB0aGUgc2hhZGVyJ3Mgd2F0ZXIgcGFsZXR0ZS4gV2hpdGUga2VlcHMgdGhlIHNoaXBwZWQgbWludDsgYSB3YXJtXG4gICAqIHNlcGlhIHB1bGxzIHRoZSBzYW1lIHdhdGVyIGludG8gYSBGcm9udGllciBMZWRnZXIgbWFwJ3MgdG9uZSB3aXRob3V0IHRvdWNoaW5nXG4gICAqIHRoZSBzaGFkZXIuIEZvYW0gYW5kIGdvbGQgZ2xpbnRzIHJpZGUgdGhlIHNhbWUgbXVsdGlwbHksIHNvIHRoZXkgc3RheSB3YXJtLlxuICAgKi9cbiAgY29sb3I/OiBzdHJpbmc7XG4gIC8qKiBTdXJmYWNlIG9wYWNpdHkuIExvd2VyIGxldHMgYSBzY3VscHRlZCBiZWQncyBvd24gZGFya25lc3MgZ3JvdW5kIHRoZSB3YXRlci4gKi9cbiAgb3BhY2l0eT86IG51bWJlcjtcbiAgLyoqIExpZ2h0LWluZGVwZW5kZW50IGNocm9tYSBmb3Igd2F0ZXIgdW5kZXIgdGhlIHdhcm0gTGVkZ2VyIGtleSBsaWdodC4gKi9cbiAgZW1pc3NpdmU/OiBzdHJpbmc7XG4gIGVtaXNzaXZlSW50ZW5zaXR5PzogbnVtYmVyO1xuICAvKiogQmxlbmQgd2VpZ2h0IGZvciB0aGUgc3VyZmFjZSBtYXAuIE5hcnJvdyByaWJib25zIHNldCB0aGlzIHRvIHplcm86IGl0cyBzaXggZml4ZWRcbiAgICogaG9yaXpvbnRhbCBzdHJva2VzIGJlY29tZSBtZXRyZS13aWRlIGJhbmRzIHdoZW4gc3F1ZWV6ZWQgYWNyb3NzIGEgdGhyZWUtbWV0cmUgY2hhbm5lbC4gKi9cbiAgdGV4dHVyZUJsZW5kPzogbnVtYmVyO1xuICAvKiogTXVsdGlwbGllcyB0aGUgc2luZS1yaXBwbGUgY29udHJpYnV0aW9uIHdpdGhvdXQgY2hhbmdpbmcgZmxvdyBzcGVlZC4gKi9cbiAgcmlwcGxlU3RyZW5ndGg/OiBudW1iZXI7XG4gIC8qKiBGcmVxdWVuY3kgb2YgY3Jvc3NlZCByaXBwbGUgZnJvbnRzOyBvbWl0dGVkIHByZXNlcnZlcyB0aGUgb3JpZ2luYWwgY2hhbm5lbCB3YXZlcy4gKi9cbiAgcmlwcGxlU2NhbGU/OiBudW1iZXI7XG4gIC8qKiBTdHJlbmd0aCBvZiB0aGUgcGFsZSBmb3JkIHdhc2guICovXG4gIGZvcmRUaW50PzogbnVtYmVyO1xuICAvKiogTWV0cmVzIG9mIGFscGhhIHJhbXAgYXQgdGhlIGJhbmQncyBvdXRlciBlZGdlLiAqL1xuICBzaG9yZUZhZGVNZXRlcnM/OiBudW1iZXI7XG4gIC8qKiBGYWNlLW9uIHJpcHBsZSBsaWZ0OyBkZWZhdWx0cyB0byBvbiB3aGVuIGEgYmVkIG1hcCBpcyBwcmVzZW50LiAqL1xuICBzdXJmYWNlTGlmdD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBPcHRpb25hbCBiYWtlZCBiZWQtZGVwdGggbWFwIChyZWQgY2hhbm5lbCwgMC4uMSA9PSAwLi5kZWVwTWV0ZXJzIGJlbG93IHRoZVxuICAgKiBzdXJmYWNlKS4gUHJlc2VudCBvbmx5IGZvciBzY3VscHRlZCBjaGFubmVsczogdGhlIHBhaW50ZWQgcml2ZXIgZmxvYXRzIG92ZXJcbiAgICogZmxhdCBncm91bmQgYW5kIGhhcyBubyBiZWQgdG8gcmVhZC4gV2hlbiBwcmVzZW50IHRoZSB3YXRlciBzdG9wcyBndWVzc2luZyBpdHNcbiAgICogZGVwdGggZnJvbSB0aGUgdGlsZSdzIGRlY2xhcmVkIGJhbmQgYW5kIHJlYWRzIHRoZSByZWFsIGNhcnZlZCBjaGFubmVsLCBzbyB0aGVcbiAgICogc2N1bHB0ZWQgbWVhbmRlciBzaG93cyBhcyBkYXJrIHdhdGVyIGFuZCB0aGUgbWFyZ2lucyBnbyBzaGFsbG93IGFuZCBkYW1wLlxuICAgKi9cbiAgYmVkRGVwdGg/OiB7IG1hcDogVEhSRUUuVGV4dHVyZTsgZGVlcE1ldGVyczogbnVtYmVyOyBzaG9yZU1ldGVyczogbnVtYmVyIH07XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTGl2aW5nV2F0ZXJNYXRlcmlhbChjb25maWc6IFdhdGVyTWF0ZXJpYWxDb25maWcpOiBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCB7XG4gIGNvbnN0IHVuaWZvcm1zOiBXYXRlclVuaWZvcm1zID0ge1xuICAgIHRpbWU6IHsgdmFsdWU6IDAgfSxcbiAgICBxdWFsaXR5OiB7IHZhbHVlOiB3YXRlclF1YWxpdHkoKSB9LFxuICAgIHJlcGVhdDogeyB2YWx1ZTogY29uZmlnLmZvcmQgPyAxIDogOCB9LFxuICAgIGZvcmQ6IHsgdmFsdWU6IGNvbmZpZy5mb3JkID8gMSA6IDAgfSxcbiAgICBmbG93U3BlZWQ6IHsgdmFsdWU6IEJhbGFuY2Uud29ybGQud2F0ZXJGbG93U3BlZWQgfSxcbiAgICByaXZlckRlcHRoOiB7IHZhbHVlOiBjb25maWcucml2ZXJEZXB0aCB9LFxuICAgIGZvcmREZXB0aDogeyB2YWx1ZTogY29uZmlnLmZvcmREZXB0aCB9LFxuICAgIHdhZGVEZXB0aDogeyB2YWx1ZTogY29uZmlnLndhZGVEZXB0aCB9LFxuICAgIGRlZXBEZXB0aDogeyB2YWx1ZTogY29uZmlnLmRlZXBEZXB0aCB9LFxuICB9O1xuICBjb25zdCBtYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7XG4gICAgY29sb3I6IGNvbmZpZy5jb2xvciA/PyAnI2ZmZmZmZicsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogY29uZmlnLm9wYWNpdHkgPz8gKGNvbmZpZy5mb3JkID8gMC43NCA6IDAuOTIpLFxuICAgIGRlcHRoVGVzdDogY29uZmlnLmRlcHRoVGVzdCA/PyBjb25maWcuZm9yZCxcbiAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICByb3VnaG5lc3M6IGNvbmZpZy5mb3JkID8gMC41OCA6IDAuMzYsXG4gICAgbWV0YWxuZXNzOiAwLjAxLFxuICAgIGVtaXNzaXZlOiBjb25maWcuZW1pc3NpdmUgPz8gJyMwMDAwMDAnLFxuICAgIGVtaXNzaXZlSW50ZW5zaXR5OiBjb25maWcuZW1pc3NpdmVJbnRlbnNpdHkgPz8gMSxcbiAgfSk7XG4gIG1hdGVyaWFsLm1hcCA9IGNyZWF0ZVdhdGVyVGV4dHVyZShjb25maWcuZm9yZCk7XG4gIGNvbmZpZ3VyZVdhdGVyTWFwKG1hdGVyaWFsLm1hcCk7XG4gIG1hdGVyaWFsLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMgPSB1bmlmb3JtcztcbiAgbWF0ZXJpYWwudXNlckRhdGEud2F0ZXJHbGludHMgPSBjb25maWcuYW5jaG9ycy5sZW5ndGg7XG4gIC8vIFRoZSBiYW5kIGdlb21ldHJ5IGlzIEJBS0VEIElOVE8gVEhFIFNPVVJDRSBiZWxvdyBhcyBsaXRlcmFscyAodmlzdWFsL3JpdmVyL2ZvcmRcbiAgLy8gaGFsZiB3aWR0aHMsIHRoZSBmYWRlIHdpbmRvdywgb25lIGxpbmUgcGVyIGdsaW50IGFuY2hvcikuIFR3byBtYXRlcmlhbHMgdGhhdFxuICAvLyBzaGFyZSBhIGNhY2hlIGtleSBzaGFyZSBhIGNvbXBpbGVkIHByb2dyYW0sIHNvIHRoZSBrZXkgaGFzIHRvIGNhcnJ5IGV2ZXJ5XG4gIC8vIGxpdGVyYWwgdGhhdCBjYW4gZGlmZmVyIOKAlCBvdGhlcndpc2UgYSBzZWNvbmQgd2F0ZXIgc3VyZmFjZSBvbiB0aGUgc2FtZSBtYXBcbiAgLy8gc2lsZW50bHkgcmVuZGVycyB3aXRoIHRoZSBmaXJzdCBvbmUncyBjb25zdGFudHMuXG4gIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+IFtcbiAgICAnbGl2aW5nLXdhdGVyJyxcbiAgICBjb25maWcub3BlblNlYSA/ICdzZWEnIDogJ2NoYW5uZWwnLFxuICAgIGNvbmZpZy5mb3JkID8gJ2ZvcmQnIDogJ3JpdmVyJyxcbiAgICBjb25maWcudmlzdWFsSGFsZldpZHRoLnRvRml4ZWQoMyksXG4gICAgY29uZmlnLnJpdmVySGFsZldpZHRoLnRvRml4ZWQoMyksXG4gICAgY29uZmlnLmZvcmRIYWxmV2lkdGgudG9GaXhlZCgzKSxcbiAgICAoY29uZmlnLmZvcmRDZW50ZXJzID8/IFswXSkubWFwKChjZW50ZXIpID0+IGNlbnRlci50b0ZpeGVkKDIpKS5qb2luKCd8JyksXG4gICAgY29uZmlnLmZhZGVTdGFydC50b0ZpeGVkKDMpLFxuICAgIGNvbmZpZy5sZW5ndGhIYWxmLnRvRml4ZWQoMyksXG4gICAgY29uZmlnLmFuY2hvcnMubWFwKChhbmNob3IpID0+IGAke2FuY2hvci54LnRvRml4ZWQoMil9LCR7YW5jaG9yLnoudG9GaXhlZCgyKX1gKS5qb2luKCdfJykgfHwgJ25vZ2xpbnRzJyxcbiAgICBgdGV4dHVyZSR7KGNvbmZpZy50ZXh0dXJlQmxlbmQgPz8gMC4xMikudG9GaXhlZCgzKX1gLFxuICAgIGByaXBwbGUkeyhjb25maWcucmlwcGxlU3RyZW5ndGggPz8gMSkudG9GaXhlZCgyKX1gLFxuICAgIC4uLihjb25maWcucmlwcGxlU2NhbGUgPT09IHVuZGVmaW5lZCA/IFtdIDogW2ByaXBwbGUtc2NhbGUke2NvbmZpZy5yaXBwbGVTY2FsZS50b0ZpeGVkKDIpfWBdKSxcbiAgICBgZm9yZCR7KGNvbmZpZy5mb3JkVGludCA/PyAwLjcyKS50b0ZpeGVkKDMpfWAsXG4gICAgYHNob3JlZmFkZSR7KGNvbmZpZy5zaG9yZUZhZGVNZXRlcnMgPz8gMC45NSkudG9GaXhlZCgzKX1gLFxuICAgIChjb25maWcuc3VyZmFjZUxpZnQgPz8gY29uZmlnLmJlZERlcHRoICE9PSB1bmRlZmluZWQpID8gJ2xpZnQnIDogJ25vbGlmdCcsXG4gICAgY29uZmlnLmJlZERlcHRoID8gYGJlZCR7Y29uZmlnLmJlZERlcHRoLmRlZXBNZXRlcnMudG9GaXhlZCgzKX1fJHtjb25maWcuYmVkRGVwdGguc2hvcmVNZXRlcnMudG9GaXhlZCgzKX1gIDogJ25vYmVkJyxcbiAgXS5qb2luKCctJyk7XG4gIG1hdGVyaWFsLm9uQmVmb3JlQ29tcGlsZSA9IChzaGFkZXIpID0+IHtcbiAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJUaW1lID0gdW5pZm9ybXMudGltZTtcbiAgICBpZiAoY29uZmlnLmJlZERlcHRoKSB7XG4gICAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJCZWRNYXAgPSB7IHZhbHVlOiBjb25maWcuYmVkRGVwdGgubWFwIH07XG4gICAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJCZWREZWVwID0geyB2YWx1ZTogY29uZmlnLmJlZERlcHRoLmRlZXBNZXRlcnMgfTtcbiAgICAgIHNoYWRlci51bmlmb3Jtcy53YXRlckJlZFNob3JlID0geyB2YWx1ZTogY29uZmlnLmJlZERlcHRoLnNob3JlTWV0ZXJzIH07XG4gICAgfVxuICAgIHNoYWRlci51bmlmb3Jtcy53YXRlclF1YWxpdHkgPSB1bmlmb3Jtcy5xdWFsaXR5O1xuICAgIHNoYWRlci51bmlmb3Jtcy53YXRlclJlcGVhdCA9IHVuaWZvcm1zLnJlcGVhdDtcbiAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJGb3JkID0gdW5pZm9ybXMuZm9yZDtcbiAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJGbG93U3BlZWQgPSB1bmlmb3Jtcy5mbG93U3BlZWQ7XG4gICAgc2hhZGVyLnVuaWZvcm1zLndhdGVyUml2ZXJEZXB0aCA9IHVuaWZvcm1zLnJpdmVyRGVwdGg7XG4gICAgc2hhZGVyLnVuaWZvcm1zLndhdGVyRm9yZERlcHRoID0gdW5pZm9ybXMuZm9yZERlcHRoO1xuICAgIHNoYWRlci51bmlmb3Jtcy53YXRlcldhZGVEZXB0aCA9IHVuaWZvcm1zLndhZGVEZXB0aDtcbiAgICBzaGFkZXIudW5pZm9ybXMud2F0ZXJEZWVwRGVwdGggPSB1bmlmb3Jtcy5kZWVwRGVwdGg7XG4gICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IHNoYWRlci52ZXJ0ZXhTaGFkZXJcbiAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsICcjaW5jbHVkZSA8Y29tbW9uPlxcbnZhcnlpbmcgdmVjMiB2V2F0ZXJVdjtcXG52YXJ5aW5nIHZlYzIgdldhdGVyV29ybGQ7JylcbiAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8dXZfdmVydGV4PicsICcjaW5jbHVkZSA8dXZfdmVydGV4PlxcbnZXYXRlclV2ID0gdXY7XFxudldhdGVyV29ybGQgPSAobW9kZWxNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApKS54ejsnKTtcbiAgICBzaGFkZXIuZnJhZ21lbnRTaGFkZXIgPSBzaGFkZXIuZnJhZ21lbnRTaGFkZXJcbiAgICAgIC5yZXBsYWNlKCcjaW5jbHVkZSA8Y29tbW9uPicsIGAjaW5jbHVkZSA8Y29tbW9uPlxudW5pZm9ybSBmbG9hdCB3YXRlclRpbWU7XG51bmlmb3JtIGZsb2F0IHdhdGVyUXVhbGl0eTtcbnVuaWZvcm0gZmxvYXQgd2F0ZXJSZXBlYXQ7XG51bmlmb3JtIGZsb2F0IHdhdGVyRm9yZDtcbnVuaWZvcm0gZmxvYXQgd2F0ZXJGbG93U3BlZWQ7XG51bmlmb3JtIGZsb2F0IHdhdGVyUml2ZXJEZXB0aDtcbnVuaWZvcm0gZmxvYXQgd2F0ZXJGb3JkRGVwdGg7XG51bmlmb3JtIGZsb2F0IHdhdGVyV2FkZURlcHRoO1xudW5pZm9ybSBmbG9hdCB3YXRlckRlZXBEZXB0aDtcbiR7Y29uZmlnLmJlZERlcHRoID8gJ3VuaWZvcm0gc2FtcGxlcjJEIHdhdGVyQmVkTWFwO1xcbnVuaWZvcm0gZmxvYXQgd2F0ZXJCZWREZWVwO1xcbnVuaWZvcm0gZmxvYXQgd2F0ZXJCZWRTaG9yZTsnIDogJyd9XG52YXJ5aW5nIHZlYzIgdldhdGVyVXY7XG52YXJ5aW5nIHZlYzIgdldhdGVyV29ybGQ7XG5cbmZsb2F0IHdhdGVyR2xpbnQodmVjMiB3b3JsZCwgdmVjMiBjZW50ZXIsIGZsb2F0IHBoYXNlKSB7XG4gIHZlYzIgZGVsdGEgPSB3b3JsZCAtIGNlbnRlcjtcbiAgZmxvYXQgc3BhcmtsZSA9IDEuMCAtIHNtb290aHN0ZXAoMC4wLCAxLjgsIGRvdChkZWx0YSwgZGVsdGEpKTtcbiAgZmxvYXQgcHVsc2UgPSBzbW9vdGhzdGVwKDAuNzIsIDAuOTksIHNpbihwaGFzZSArIGNlbnRlci54ICogMC4zNykgKiAwLjUgKyAwLjUpO1xuICBmbG9hdCBsaW5lID0gMS4wIC0gc21vb3Roc3RlcCgwLjAxOCwgMC4wOSwgYWJzKGRlbHRhLnkgKyBzaW4oZGVsdGEueCAqIDIuNiArIHBoYXNlKSAqIDAuMDUpKTtcbiAgcmV0dXJuIHNwYXJrbGUgKiBwdWxzZSAqIGxpbmU7XG59XG5cbmZsb2F0IHdhdGVyR29sZEdsaW50cyh2ZWMyIHdvcmxkKSB7XG4gIGlmICh3YXRlclF1YWxpdHkgPCAwLjc1KSByZXR1cm4gMC4wO1xuICBmbG9hdCBnbGludCA9IDAuMDtcbiR7Z2xpbnRTaGFkZXJMaW5lcyhjb25maWcuYW5jaG9ycyl9XG4gIHJldHVybiBnbGludDtcbn1cblxuZmxvYXQgd2F0ZXJIYXNoKHZlYzIgcCkge1xuICB2ZWMzIHAzID0gZnJhY3QodmVjMyhwLnh5eCkgKiAwLjEwMzEpO1xuICBwMyArPSBkb3QocDMsIHAzLnl6eCArIDMzLjMzKTtcbiAgcmV0dXJuIGZyYWN0KChwMy54ICsgcDMueSkgKiBwMy56KTtcbn1cblxuZmxvYXQgd2F0ZXJOb2lzZSh2ZWMyIHApIHtcbiAgdmVjMiBpID0gZmxvb3IocCk7XG4gIHZlYzIgZiA9IGZyYWN0KHApO1xuICBmID0gZiAqIGYgKiAoMy4wIC0gMi4wICogZik7XG4gIGZsb2F0IGEgPSB3YXRlckhhc2goaSk7XG4gIGZsb2F0IGIgPSB3YXRlckhhc2goaSArIHZlYzIoMS4wLCAwLjApKTtcbiAgZmxvYXQgYyA9IHdhdGVySGFzaChpICsgdmVjMigwLjAsIDEuMCkpO1xuICBmbG9hdCBkID0gd2F0ZXJIYXNoKGkgKyB2ZWMyKDEuMCwgMS4wKSk7XG4gIHJldHVybiBtaXgobWl4KGEsIGIsIGYueCksIG1peChjLCBkLCBmLngpLCBmLnkpO1xufWApXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgXG4jaWZkZWYgVVNFX01BUFxuICBmbG9hdCBsZW5ndGhOb2lzZSA9IHdhdGVyTm9pc2UodmVjMih2V2F0ZXJXb3JsZC54ICogMC4wNTUsIHZXYXRlcldvcmxkLnkgKiAwLjE2KSk7XG4gIGZsb2F0IGNyb3NzTm9pc2UgPSB3YXRlck5vaXNlKHZlYzIodldhdGVyV29ybGQueCAqIDAuMTggKyAxMy4wLCB2V2F0ZXJXb3JsZC55ICogMC4xMSAtIDcuMCkpO1xuICBmbG9hdCBwaGFzZVdhcnAgPSAod2F0ZXJOb2lzZSh2ZWMyKHZXYXRlcldvcmxkLnggKiAwLjEyIC0gd2F0ZXJUaW1lICogMC4xOCwgdldhdGVyV29ybGQueSAqIDAuMjcpKSAtIDAuNSkgKiAwLjU4ICogd2F0ZXJRdWFsaXR5O1xuICBmbG9hdCBsb2NhbFNwZWVkID0gd2F0ZXJGbG93U3BlZWQgKiBtaXgoMC41OCwgMS40NCwgbGVuZ3RoTm9pc2UpO1xuICB2ZWMyIGZsb3dVdiA9IHZlYzIodldhdGVyVXYueCAqIHdhdGVyUmVwZWF0ICsgd2F0ZXJUaW1lICogbG9jYWxTcGVlZCArIHBoYXNlV2FycCwgdldhdGVyVXYueSk7XG4gIGZsb2F0IHNsb3dXYXJwID1cbiAgICBzaW4odldhdGVyV29ybGQueCAqIG1peCgwLjIzLCAwLjUyLCBjcm9zc05vaXNlKSArIHZXYXRlcldvcmxkLnkgKiAwLjM3IC0gd2F0ZXJUaW1lICogbWl4KDAuOSwgMS45LCBsZW5ndGhOb2lzZSkpICpcbiAgICBtaXgoMC4wMTIsIDAuMDM4LCBjcm9zc05vaXNlKSAqXG4gICAgd2F0ZXJRdWFsaXR5O1xuICBmbG93VXYueSArPSBzbG93V2FycCArIChjcm9zc05vaXNlIC0gMC41KSAqIDAuMDQ1ICogd2F0ZXJRdWFsaXR5O1xuJHtjb25maWcub3BlblNlYSA/ICcgIGZsb3dVdiA9IHZXYXRlcldvcmxkIC8gMjAuMCArIHZlYzIod2F0ZXJUaW1lICogd2F0ZXJGbG93U3BlZWQgKiAwLjA4LCB3YXRlclRpbWUgKiB3YXRlckZsb3dTcGVlZCAqIDAuMDMpOycgOiAnJ31cbiAgdmVjNCBiYXNlVGV4ZWwgPSB0ZXh0dXJlMkQobWFwLCBmbG93VXYpO1xuJHtjb25maWcub3BlblNlYSA/IGAgIC8vIENyb3NzLWZhZGUgdHdvIGluY29tbWVuc3VyYXRlIHdvcmxkLXNwYWNlIHNhbXBsZXMgb2YgdGhlIGF1dGhvcmVkIHNlYS5cbiAgLy8gVGhlIG9sZCBzaW5nbGUgMjAgbSByZXBlYXQgc3RhbXBlZCBpZGVudGljYWwgd2hpdGUgY3Jlc3RzIG92ZXIgdGhlIHdyZWNrcy5cbiAgdmVjMiBzZWFVdiA9IG1hdDIoMC44LCAtMC42LCAwLjYsIDAuOCkgKiB2V2F0ZXJXb3JsZCAvIDMxLjdcbiAgICArIHZlYzIoMC4zNyAtIHdhdGVyVGltZSAqIHdhdGVyRmxvd1NwZWVkICogMC4wMjUsIDAuMTkpO1xuICBiYXNlVGV4ZWwgPSBtaXgoYmFzZVRleGVsLCB0ZXh0dXJlMkQobWFwLCBzZWFVdiksIDAuMzUgKyBjcm9zc05vaXNlICogMC4zKTtgIDogJyd9XG4gIGZsb2F0IHJpdmVyQWNyb3NzID0gbWl4KCh2V2F0ZXJVdi55IC0gMC41KSAqICR7KGNvbmZpZy52aXN1YWxIYWxmV2lkdGggKiAyKS50b0ZpeGVkKDMpfSwgdldhdGVyV29ybGQueSwgd2F0ZXJGb3JkKTtcbiAgZmxvYXQgdmlzdWFsRWRnZURpc3QgPSBtYXgoMC4wLCAke2NvbmZpZy52aXN1YWxIYWxmV2lkdGgudG9GaXhlZCgzKX0gLSBhYnMocml2ZXJBY3Jvc3MpKTtcbiAgZmxvYXQgcml2ZXJEaXN0ID0gbWF4KDAuMCwgJHtjb25maWcucml2ZXJIYWxmV2lkdGgudG9GaXhlZCgzKX0gLSBhYnMocml2ZXJBY3Jvc3MpKTtcbiAgZmxvYXQgZm9yZEJhbmQgPSBtYXgod2F0ZXJGb3JkLCAke2NvbmZpZy5vcGVuU2VhID8gJzAuMCcgOiBmb3JkQmFuZEV4cHJlc3Npb24oY29uZmlnLmZvcmRDZW50ZXJzID8/IFswXSwgY29uZmlnLmZvcmRIYWxmV2lkdGgpfSk7XG4gIGZsb2F0IGNoYW5uZWxEZXB0aCA9IG1peCh3YXRlcldhZGVEZXB0aCAqIDAuNSwgd2F0ZXJSaXZlckRlcHRoLCBzbW9vdGhzdGVwKDAuMDUsICR7Y29uZmlnLnJpdmVySGFsZldpZHRoLnRvRml4ZWQoMyl9LCByaXZlckRpc3QpKTtcbiAgZmxvYXQgZGVjbGFyZWREZXB0aCA9IG1peChjaGFubmVsRGVwdGgsIHdhdGVyRm9yZERlcHRoLCBmb3JkQmFuZCk7XG4gIGZsb2F0IGRlcHRoID0gc21vb3Roc3RlcChtYXgoMC4wMDEsIHdhdGVyV2FkZURlcHRoKSwgbWF4KHdhdGVyV2FkZURlcHRoICsgMC4wMDEsIHdhdGVyRGVlcERlcHRoKSwgZGVjbGFyZWREZXB0aCk7XG4gIGZsb2F0IGJlZFNob3JlID0gMS4wO1xuJHtjb25maWcuYmVkRGVwdGggPyBgICBmbG9hdCBiZWRNZXRyZXMgPSB0ZXh0dXJlMkQod2F0ZXJCZWRNYXAsIHZXYXRlclV2KS5yICogd2F0ZXJCZWREZWVwO1xuICAvLyBUaGUgY2FydmVkIGNoYW5uZWwgb3ducyB0aGUgZGVwdGggcmVhZDsgdGhlIGZvcmQga2VlcHMgdGhlIHRpbGUncyBERUNMQVJFRFxuICAvLyBkZXB0aCBzbyBhIGNyb3NzaW5nIHRoZSBzaW0gY2FsbHMgd2F0ZXIgbmV2ZXIgcmVuZGVycyBhcyBkcnkgZ3JvdW5kLlxuICBkZXB0aCA9IG1peChjbGFtcChiZWRNZXRyZXMgLyB3YXRlckJlZERlZXAsIDAuMCwgMS4wKSwgZGVwdGgsIGZvcmRCYW5kKTtcbiAgYmVkU2hvcmUgPSBtYXgoc21vb3Roc3RlcCgwLjAsIHdhdGVyQmVkU2hvcmUsIGJlZE1ldHJlcyksIGZvcmRCYW5kKTtgIDogJyd9XG4gIGZsb2F0IHJpcHBsZUZyZXEgPSBtaXgoMS4wNSwgMi40NSwgbGVuZ3RoTm9pc2UpO1xuICBmbG9hdCByaXBwbGVBbXAgPSBtaXgoMC4wNiwgMC4xNywgY3Jvc3NOb2lzZSkgKiAkeyhjb25maWcucmlwcGxlU3RyZW5ndGggPz8gMSkudG9GaXhlZCgyKX07XG4gIGZsb2F0IHJpcHBsZSA9ICR7Y29uZmlnLm9wZW5TZWFcbiAgICA/ICcoc2luKHZXYXRlcldvcmxkLnggKiAyLjQgKyB2V2F0ZXJXb3JsZC55ICogMC45ICsgc2luKHZXYXRlcldvcmxkLnkgKiAwLjMyIC0gd2F0ZXJUaW1lICogMC42KSAqIDAuOCAtIHdhdGVyVGltZSAqIDIuMCkgKiAwLjcyICsgc2luKHZXYXRlcldvcmxkLnggKiA0LjEgLSB2V2F0ZXJXb3JsZC55ICogMS4zICsgcGhhc2VXYXJwIC0gd2F0ZXJUaW1lICogMy4xKSAqIDAuMjgpJ1xuICAgIDogY29uZmlnLnJpcHBsZVNjYWxlICE9PSB1bmRlZmluZWRcbiAgICAgID8gYChzaW4oKHZXYXRlcldvcmxkLnggKiAyLjQgKyB2V2F0ZXJXb3JsZC55ICogMC45KSAqICR7Y29uZmlnLnJpcHBsZVNjYWxlLnRvRml4ZWQoMil9ICsgc2luKHZXYXRlcldvcmxkLnkgKiAwLjMyIC0gd2F0ZXJUaW1lICogMC42KSAqIDAuOCAtIHdhdGVyVGltZSAqIDIuMCkgKiAwLjcyICsgc2luKCh2V2F0ZXJXb3JsZC54ICogNC4xIC0gdldhdGVyV29ybGQueSAqIDEuMykgKiAke2NvbmZpZy5yaXBwbGVTY2FsZS50b0ZpeGVkKDIpfSArIHBoYXNlV2FycCAtIHdhdGVyVGltZSAqIDMuMSkgKiAwLjI4KWBcbiAgICAgIDogJ3Npbih2V2F0ZXJXb3JsZC54ICogcmlwcGxlRnJlcSArIHZXYXRlcldvcmxkLnkgKiBtaXgoLTAuNDYsIDAuNzIsIGNyb3NzTm9pc2UpICsgcGhhc2VXYXJwICogNC4wIC0gd2F0ZXJUaW1lICogbWl4KDIuMSwgNC40LCBsZW5ndGhOb2lzZSkpJ30gKiAwLjUgKyAwLjU7XG4gIGZsb2F0IGZpbmVSaXBwbGUgPSAwLjA7XG4gIGlmICh3YXRlclF1YWxpdHkgPiAwLjcpIHtcbiAgICBmaW5lUmlwcGxlID0gc2luKHZXYXRlcldvcmxkLnggKiBtaXgoMy43LCA2LjIsIGNyb3NzTm9pc2UpICsgdldhdGVyV29ybGQueSAqIG1peCgwLjgsIDIuNCwgbGVuZ3RoTm9pc2UpIC0gd2F0ZXJUaW1lICogbWl4KDMuOCwgNi43LCBjcm9zc05vaXNlKSArIHBoYXNlV2FycCAqIDIuMCkgKiAwLjUgKyAwLjU7XG4gIH1cbiAgZmxvYXQgZm9hbU5vaXNlID0gc21vb3Roc3RlcCgwLjI2LCAwLjkyLCB3YXRlck5vaXNlKHZlYzIodldhdGVyV29ybGQueCAqIDAuNDIgLSB3YXRlclRpbWUgKiAwLjcsIHZXYXRlcldvcmxkLnkgKiAxLjI1ICsgbGVuZ3RoTm9pc2UgKiAzLjApKSk7XG4gIGZsb2F0IGJhbmtMaW5lID0gYWJzKGFicyhyaXZlckFjcm9zcykgLSAke2NvbmZpZy5yaXZlckhhbGZXaWR0aC50b0ZpeGVkKDMpfSk7XG4gIGZsb2F0IGJhbmtGb2FtID0gKDEuMCAtIHNtb290aHN0ZXAoMC4wNCwgMC43MiwgYmFua0xpbmUpKSAqIGZvYW1Ob2lzZSAqICgwLjM1ICsgd2F0ZXJRdWFsaXR5ICogMC42NSk7XG4gIHZlYzMgc2hhbGxvdyA9IHZlYzMoMC4zNSwgMC41MSwgMC40NSk7XG4gIHZlYzMgbWlkID0gdmVjMygwLjE4LCAwLjQwLCAwLjQwKTtcbiAgdmVjMyBkZWVwID0gdmVjMygwLjA2LCAwLjE4LCAwLjE3KTtcbiAgdmVjMyBmb3JkID0gdmVjMygwLjcwLCAwLjY5LCAwLjUwKTtcbiAgdmVjMyB3YXRlckNvbG9yID0gbWl4KHNoYWxsb3csIGRlZXAsIGRlcHRoKTtcbiAgd2F0ZXJDb2xvciA9IG1peCh3YXRlckNvbG9yLCBtaWQsIHJpcHBsZSAqIHJpcHBsZUFtcCAqIHdhdGVyUXVhbGl0eSk7XG4gIHdhdGVyQ29sb3IgPSBtaXgod2F0ZXJDb2xvciwgZm9yZCwgZm9yZEJhbmQgKiAkeyhjb25maWcuZm9yZFRpbnQgPz8gMC43MikudG9GaXhlZCgzKX0pO1xuICB3YXRlckNvbG9yICs9IHZlYzMoMC4wOCwgMC4xMCwgMC4wOCkgKiBmaW5lUmlwcGxlICogd2F0ZXJRdWFsaXR5ICogKDEuMCAtIGZvcmRCYW5kKSAqIDAuMjIgKiAkeyhjb25maWcucmlwcGxlU3RyZW5ndGggPz8gMSkudG9GaXhlZCgyKX07XG4gIHdhdGVyQ29sb3IgPSBtaXgod2F0ZXJDb2xvciwgdmVjMygwLjkyLCAwLjg0LCAwLjYyKSwgYmFua0ZvYW0gKiAwLjU4KTtcbiAgd2F0ZXJDb2xvciArPSB2ZWMzKDEuMCwgMC43MiwgMC4yMCkgKiB3YXRlckdvbGRHbGludHModldhdGVyV29ybGQpICogMC40MjtcbiAgd2F0ZXJDb2xvciA9IG1peCh3YXRlckNvbG9yLCBiYXNlVGV4ZWwucmdiLCAkeyhjb25maWcudGV4dHVyZUJsZW5kID8/IDAuMTIpLnRvRml4ZWQoMyl9KTtcbiR7Y29uZmlnLm9wZW5TZWEgPyBgICAvLyBTcGFyc2UgbW92aW5nIGNyZXN0cyBrZWVwIHRoZSBzdXJmYWNlIGRpc3RpbmN0IGZyb20gdGhlIHN0YXRpYyBzZWFiZWQuXG4gIC8vIFN0aWxsd2F0ZXIgaW5oZXJpdHMgaXRzIGxvd2VyIHJpcHBsZVN0cmVuZ3RoOyBjaGFubmVsIHNoYWRlcnMgYXJlIHVuY2hhbmdlZC5cbiAgZmxvYXQgc2VhQ3Jlc3QgPSBzbW9vdGhzdGVwKDAuODgsIDAuOTksIHJpcHBsZSkgKiBzbW9vdGhzdGVwKDAuMzgsIDAuNzgsIGNyb3NzTm9pc2UpO1xuICB3YXRlckNvbG9yICs9IHZlYzMoMC4xNiwgMC4yMCwgMC4xOSkgKiBzZWFDcmVzdCAqICR7KGNvbmZpZy5yaXBwbGVTdHJlbmd0aCA/PyAxKS50b0ZpeGVkKDIpfTtgIDogJyd9XG4ke2NvbmZpZy5iZWREZXB0aCA/IGAgIC8vIFNjdWxwdC1vbmx5LiBUaGUgZGVjbGFyZWQgYmFuZCdzIGZvYW0gbGluZSBzaXRzIHdoZXJlIHRoZSBTSU0gc2F5cyB0aGUgYmFuayBpcztcbiAgLy8gb3ZlciBhIGNhcnZlZCBjaGFubmVsIHRoZSByZWFsIGVkZ2UgaXMgd2hlcmV2ZXIgdGhlIGJlZCBjb21lcyB1cCwgc28gZm9hbSBpc1xuICAvLyBkcml2ZW4gYnkgbWVhc3VyZWQgZGVwdGguXG4gIGZsb2F0IHNob3JlRm9hbSA9ICgxLjAgLSBzbW9vdGhzdGVwKHdhdGVyQmVkU2hvcmUgKiAwLjEyNSwgd2F0ZXJCZWRTaG9yZSAqIDEuNjI1LCBiZWRNZXRyZXMpKSAqIGZvYW1Ob2lzZSAqICgwLjQ1ICsgd2F0ZXJRdWFsaXR5ICogMC41NSk7XG4gIHdhdGVyQ29sb3IgPSBtaXgod2F0ZXJDb2xvciwgdmVjMygwLjk0LCAwLjg4LCAwLjcwKSwgc2hvcmVGb2FtICogMC41ICogKDEuMCAtIGZvcmRCYW5kKSk7YCA6ICcnfVxuJHsoY29uZmlnLnN1cmZhY2VMaWZ0ID8/IGNvbmZpZy5iZWREZXB0aCAhPT0gdW5kZWZpbmVkKSA/IGAgIC8vIExpZnQgZmFjZS1vbiByaXBwbGVzIGluZGVwZW5kZW50bHkgb2YgdGhlIGJlZC1kZXB0aCBwYXRoLlxuICB3YXRlckNvbG9yICs9IHZlYzMoMC4xMCwgMC4xMSwgMC4wOCkgKiBwb3cocmlwcGxlLCAyLjApICogd2F0ZXJRdWFsaXR5ICogKDEuMCAtIGZvcmRCYW5kKSAqICR7KGNvbmZpZy5yaXBwbGVTdHJlbmd0aCA/PyAxKS50b0ZpeGVkKDIpfTtgIDogJyd9XG4ke2NvbmZpZy5yaXBwbGVTY2FsZSAhPT0gdW5kZWZpbmVkID8gYCAgLy8gU2hvcnQgYnJva2VuIGZsb3cgbGluZXMgZ2l2ZSBmbGF0IGF1dGhvcmVkIHBhbnMgYSByZWFkYWJsZSBtb3Zpbmcgc3VyZmFjZS5cbiAgZmxvYXQgZmxvd0xpbmUgPSBzaW4odldhdGVyV29ybGQueSAqICR7KDYuMjUgKiBjb25maWcucmlwcGxlU2NhbGUpLnRvRml4ZWQoMil9ICsgc2luKHZXYXRlcldvcmxkLnggKiAwLjM3IC0gd2F0ZXJUaW1lICogMC43KSAqIDEuMSk7XG4gIGZsb2F0IGZsb3dCcmVhayA9IHNtb290aHN0ZXAoMC40MCwgMC43NSwgd2F0ZXJOb2lzZSh2ZWMyKHZXYXRlcldvcmxkLnggKiAwLjY1IC0gd2F0ZXJUaW1lICogMC4yNSwgdldhdGVyV29ybGQueSAqIDIuMCkpKTtcbiAgd2F0ZXJDb2xvciArPSB2ZWMzKDAuMTIsIDAuMTUsIDAuMTQpICogc21vb3Roc3RlcCgwLjk0LCAwLjk5NSwgZmxvd0xpbmUpICogZmxvd0JyZWFrO2AgOiAnJ31cbiAgZmxvYXQgYWxwaGEgPSBtaXgoMC43NCwgMC45NCwgZGVwdGgpO1xuICBhbHBoYSA9IG1peChhbHBoYSwgMC41OCwgZm9yZEJhbmQgKiAkeyhjb25maWcuZm9yZFRpbnQgPz8gMC43MikudG9GaXhlZCgzKX0pO1xuICBhbHBoYSA9IG1peChhbHBoYSwgMC43MiwgYmFua0ZvYW0gKiAwLjQpO1xuICBhbHBoYSAqPSBzbW9vdGhzdGVwKDAuMCwgJHsoY29uZmlnLnNob3JlRmFkZU1ldGVycyA/PyAwLjk1KS50b0ZpeGVkKDMpfSwgdmlzdWFsRWRnZURpc3QpO1xuICBhbHBoYSAqPSBtaXgoMS4wIC0gc21vb3Roc3RlcCgke2NvbmZpZy5mYWRlU3RhcnQudG9GaXhlZCgzKX0sICR7Y29uZmlnLmxlbmd0aEhhbGYudG9GaXhlZCgzKX0sIGFicyh2V2F0ZXJXb3JsZC54KSksIDEuMCwgd2F0ZXJGb3JkKTtcbiAgZmxvYXQgZm9yZE92ZXJsYXlGYWRlID0gc21vb3Roc3RlcCgwLjAsIDAuMTgsIHZXYXRlclV2LngpICogKDEuMCAtIHNtb290aHN0ZXAoMC44MiwgMS4wLCB2V2F0ZXJVdi54KSk7XG4gIGFscGhhICo9IG1peCgxLjAsIGZvcmRPdmVybGF5RmFkZSwgd2F0ZXJGb3JkKTtcbiAgLy8gQSBzY3VscHRlZCBzaG9yZWxpbmUgaXMgYSBkZXB0aC1idWZmZXIgaW50ZXJzZWN0aW9uLCBpLmUuIGEgcmF6b3IgZWRnZS4gRmFkaW5nXG4gIC8vIHRoZSBsYXN0IGZldyBjZW50aW1ldHJlcyBvZiBkZXB0aCB0dXJucyBpdCBpbnRvIGEgZGFtcCBtYXJnaW4gaW5zdGVhZCwgYW5kIHRoZVxuICAvLyBmb2FtIHRoYXQgZ2F0aGVycyB0aGVyZSBzdGF5cyB2aXNpYmxlIGFmdGVyIHRoZSB3YXRlciBpdHNlbGYgaGFzIGZhZGVkIG91dC5cbiAgYWxwaGEgKj0gYmVkU2hvcmU7XG4ke2NvbmZpZy5iZWREZXB0aCA/ICcgIGFscGhhID0gbWF4KGFscGhhLCBzaG9yZUZvYW0gKiAwLjUgKiBzbW9vdGhzdGVwKDAuMCwgMC4wNSwgYmVkTWV0cmVzKSk7JyA6ICcnfVxuICB2ZWM0IHNhbXBsZWREaWZmdXNlQ29sb3IgPSB2ZWM0KHdhdGVyQ29sb3IsIGFscGhhKTtcbiAgZGlmZnVzZUNvbG9yICo9IHNhbXBsZWREaWZmdXNlQ29sb3I7XG4jZW5kaWZgKTtcbiAgfTtcbiAgaWYgKGNvbmZpZy5vcGVuU2VhKSB7XG4gICAgbGV0IGRpc3Bvc2VkID0gZmFsc2U7XG4gICAgbWF0ZXJpYWwuYWRkRXZlbnRMaXN0ZW5lcignZGlzcG9zZScsICgpID0+IHsgZGlzcG9zZWQgPSB0cnVlOyB9KTtcbiAgICB2b2lkIGxvYWRHZW5lcmF0ZWRUZXh0dXJlKGFzc2V0U2xvdHMudGVycmFpbk9wZW5TZWEpLnRoZW4oKHNvdXJjZSkgPT4ge1xuICAgICAgaWYgKCFzb3VyY2UgfHwgZGlzcG9zZWQpIHJldHVybjtcbiAgICAgIC8vIEVhY2ggd2F0ZXIgc3VyZmFjZSBvd25zIGl0cyBzYW1wbGVyL2Rpc3Bvc2FsOyB0aGUgYXNzZXQgY2FjaGUgb3ducyB0aGUgc291cmNlLlxuICAgICAgY29uc3QgbWFwID0gc291cmNlLmNsb25lKCk7XG4gICAgICBjb25maWd1cmVXYXRlck1hcChtYXApO1xuICAgICAgbWFwLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIG1hdGVyaWFsLm1hcD8uZGlzcG9zZSgpO1xuICAgICAgbWF0ZXJpYWwubWFwID0gbWFwO1xuICAgICAgbWF0ZXJpYWwubmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCFjb25maWcuZm9yZCkgdm9pZCBsb2FkR2VuZXJhdGVkVGV4dHVyZShhc3NldFNsb3RzLnRlcnJhaW5SaXZlcik7XG4gIHJldHVybiBtYXRlcmlhbDtcbn1cblxuZXhwb3J0IHR5cGUgU2N1bHB0V2F0ZXJDb25maWcgPSBXYXRlck1hdGVyaWFsQ29uZmlnICYge1xuICAvKiogV29ybGQgWSBvZiB0aGUgd2F0ZXIgc3VyZmFjZSDigJQgc2V0IGZyb20gdGhlIGJha2VkIHNjdWxwdCBiZWQsIG5vdCBmcm9tIFdBVEVSX1kuICovXG4gIHN1cmZhY2VZOiBudW1iZXI7XG4gIC8qKiBXb3JsZCBaIG9mIHRoZSBiYW5kIGNlbnRyZSAodGhlIHNpbSdzIGRlY2xhcmVkIHJpdmVyIGNlbnRyZSkuICovXG4gIGNlbnRlclo6IG51bWJlcjtcbiAgLyoqIEhhbGYgbGVuZ3RoIGFsb25nIFguIFRoZSBwbGFuZSBpcyBhIHNpbmdsZSBxdWFkOyB0aGUgc2hhZGVyIG93bnMgdGhlIHNob3JlbGluZS4gKi9cbiAgaGFsZkxlbmd0aDogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgU2N1bHB0V2F0ZXIgPSB7XG4gIG1lc2g6IFRIUkVFLk1lc2g7XG4gIGFkdmFuY2U6IChkZWx0YTogbnVtYmVyKSA9PiB2b2lkO1xuICBkaXNwb3NlOiAoKSA9PiB2b2lkO1xuICAvKiogRGVlcGVzdCBtZXRyZSByZWFkaW5nIGJha2VkIGludG8gdGhlIGJlZCBtYXAg4oCUIGV2aWRlbmNlIGZvciB0aGUgcmV2aWV3IGJvYXJkLiAqL1xuICBkZWVwZXN0TWV0ZXJzOiBudW1iZXI7XG59O1xuXG5jb25zdCBCRURfTUFQX1dJRFRIID0gNTEyO1xuY29uc3QgQkVEX01BUF9IRUlHSFQgPSA2NDtcblxuLyoqXG4gKiBCYWtlIGhvdyBkZWVwIHRoZSB3YXRlciBzdGFuZHMgb3ZlciBhIHNjdWxwdGVkIGJlZCwgaW4gdGhlIHdhdGVyIHBsYW5lJ3Mgb3duIFVWXG4gKiBzcGFjZS4gUmVkIGNoYW5uZWwsIDgtYml0OiAwID09IGRyeSwgMjU1ID09IGBkZWVwTWV0ZXJzYCBvciBkZWVwZXIuIDggYml0cyBvdmVyXG4gKiBoYWxmIGEgbWV0cmUgaXMgfjJtbSwgZmFyIGZpbmVyIHRoYW4gdGhlIGV5ZSByZWFkcyBhdCB0aGUgZ2FtZXBsYXkgY2FtZXJhLCBhbmRcbiAqIGFuIHVuc2lnbmVkIGJ5dGUgdGV4dHVyZSBpcyBsaW5lYXJseSBmaWx0ZXJhYmxlIGV2ZXJ5d2hlcmUgKGEgZmxvYXQgb25lIGlzIG5vdCkuXG4gKi9cbmZ1bmN0aW9uIGJha2VCZWREZXB0aChcbiAgaGVpZ2h0QXQ6ICh4OiBudW1iZXIsIHo6IG51bWJlcikgPT4gbnVtYmVyLFxuICBzdXJmYWNlWTogbnVtYmVyLFxuICBoYWxmTGVuZ3RoOiBudW1iZXIsXG4gIGNlbnRlclo6IG51bWJlcixcbiAgdmlzdWFsSGFsZldpZHRoOiBudW1iZXIsXG4gIGRlZXBNZXRlcnM6IG51bWJlcixcbiAgb3BlblNlYSA9IGZhbHNlLFxuKTogeyB0ZXh0dXJlOiBUSFJFRS5EYXRhVGV4dHVyZTsgZGVlcGVzdDogbnVtYmVyIH0ge1xuICBjb25zdCBtYXBIZWlnaHQgPSBvcGVuU2VhID8gQkVEX01BUF9XSURUSCA6IEJFRF9NQVBfSEVJR0hUO1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoQkVEX01BUF9XSURUSCAqIG1hcEhlaWdodCk7XG4gIGxldCBkZWVwZXN0ID0gMDtcbiAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgbWFwSGVpZ2h0OyByb3cgKz0gMSkge1xuICAgIC8vIFBsYW5lIGdlb21ldHJ5IHJvdGF0ZWQgLTkwIGRlZyBhYm91dCBYOiB3b3JsZCB6IGRlY3JlYXNlcyBhcyB1di55IGdyb3dzLlxuICAgIGNvbnN0IHogPSBjZW50ZXJaIC0gKCgocm93ICsgMC41KSAvIG1hcEhlaWdodCkgLSAwLjUpICogdmlzdWFsSGFsZldpZHRoICogMjtcbiAgICBmb3IgKGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBCRURfTUFQX1dJRFRIOyBjb2x1bW4gKz0gMSkge1xuICAgICAgY29uc3QgeCA9ICgoKGNvbHVtbiArIDAuNSkgLyBCRURfTUFQX1dJRFRIKSAtIDAuNSkgKiBoYWxmTGVuZ3RoICogMjtcbiAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgc3VyZmFjZVkgLSBoZWlnaHRBdCh4LCB6KSk7XG4gICAgICBpZiAoZGVwdGggPiBkZWVwZXN0KSBkZWVwZXN0ID0gZGVwdGg7XG4gICAgICBkYXRhW3JvdyAqIEJFRF9NQVBfV0lEVEggKyBjb2x1bW5dID0gTWF0aC5yb3VuZChUSFJFRS5NYXRoVXRpbHMuY2xhbXAoZGVwdGggLyBkZWVwTWV0ZXJzLCAwLCAxKSAqIDI1NSk7XG4gICAgfVxuICB9XG4gIGNvbnN0IHRleHR1cmUgPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUoZGF0YSwgQkVEX01BUF9XSURUSCwgbWFwSGVpZ2h0LCBUSFJFRS5SZWRGb3JtYXQsIFRIUkVFLlVuc2lnbmVkQnl0ZVR5cGUpO1xuICB0ZXh0dXJlLm5hbWUgPSAnU2N1bHB0V2F0ZXJCZWREZXB0aCc7XG4gIHRleHR1cmUubWFnRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICB0ZXh0dXJlLm1pbkZpbHRlciA9IFRIUkVFLkxpbmVhckZpbHRlcjtcbiAgdGV4dHVyZS53cmFwUyA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG4gIHRleHR1cmUud3JhcFQgPSBUSFJFRS5DbGFtcFRvRWRnZVdyYXBwaW5nO1xuICB0ZXh0dXJlLmdlbmVyYXRlTWlwbWFwcyA9IGZhbHNlO1xuICB0ZXh0dXJlLmNvbG9yU3BhY2UgPSBUSFJFRS5Ob0NvbG9yU3BhY2U7XG4gIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xuICByZXR1cm4geyB0ZXh0dXJlLCBkZWVwZXN0IH07XG59XG5cbi8qKlxuICogQSByZW5kZXItb25seSBsaXZpbmctd2F0ZXIgc3VyZmFjZSBsYWlkIGludG8gYSBTQ1VMUFRFRCBjaGFubmVsLlxuICpcbiAqIFRoZSBwYWludGVkIHJpdmVyIGlzIGEgcmliYm9uIHRoYXQgZmxvYXRzIG92ZXIgZmxhdCBncm91bmQgd2l0aCBkZXB0aCB0ZXN0aW5nXG4gKiBvZmY7IGEgc2N1bHB0ZWQgbWFwIGFscmVhZHkgY2FycmllcyB0aGUgY2hhbm5lbCBpbiBpdHMgdGVycmFpbiBtZXNoLCBzbyB0aGVcbiAqIHdhdGVyIGhlcmUgaXMgb25lIGZsYXQgcXVhZCBhdCB0aGUgY2hhbm5lbCdzIHdhdGVyIGxpbmUgd2l0aCBkZXB0aCB0ZXN0aW5nIE9OLlxuICogVGhlIGJhbmtzIHRoZW4gb2NjbHVkZSBpdCB0aGVtc2VsdmVzIGFuZCB0aGUgc2hvcmVsaW5lIGlzIHdoZXJldmVyIHRoZSBzY3VscHRcbiAqIHJpc2VzIHRocm91Z2ggdGhlIHN1cmZhY2Ug4oCUIG5vIHNob3JlbGluZSBnZW9tZXRyeSwgbm8gc2Vjb25kIGRyYXcgY2FsbC5cbiAqXG4gKiBSZW5kZXJpbmcgb25seTogbm90aGluZyBoZXJlIGlzIHJlYWQgYnkgdGhlIHNpbXVsYXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTY3VscHRXYXRlcihjb25maWc6IFNjdWxwdFdhdGVyQ29uZmlnICYge1xuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXI7XG4gIGRlZXBNZXRlcnM6IG51bWJlcjtcbiAgc2hvcmVNZXRlcnM6IG51bWJlcjtcbiAgLyoqIEZhbHNlIGZvciBhIGZsYXQgcGFuIHRoYXQgbXVzdCB1c2UgdGhlIGRlY2xhcmVkIGJhbmQgZ2VvbWV0cnkgZm9yIGRlcHRoLiAqL1xuICBiZWQ/OiBib29sZWFuO1xufSk6IFNjdWxwdFdhdGVyIHtcbiAgY29uc3QgYmVkID0gY29uZmlnLmJlZCA9PT0gZmFsc2UgPyB1bmRlZmluZWQgOiBiYWtlQmVkRGVwdGgoXG4gICAgY29uZmlnLmhlaWdodEF0LFxuICAgIGNvbmZpZy5zdXJmYWNlWSxcbiAgICBjb25maWcuaGFsZkxlbmd0aCxcbiAgICBjb25maWcuY2VudGVyWixcbiAgICBjb25maWcudmlzdWFsSGFsZldpZHRoLFxuICAgIGNvbmZpZy5kZWVwTWV0ZXJzLFxuICAgIGNvbmZpZy5vcGVuU2VhLFxuICApO1xuICBjb25zdCBtYXRlcmlhbCA9IGNyZWF0ZUxpdmluZ1dhdGVyTWF0ZXJpYWwoe1xuICAgIC4uLmNvbmZpZyxcbiAgICBiZWREZXB0aDogYmVkID8geyBtYXA6IGJlZC50ZXh0dXJlLCBkZWVwTWV0ZXJzOiBjb25maWcuZGVlcE1ldGVycywgc2hvcmVNZXRlcnM6IGNvbmZpZy5zaG9yZU1ldGVycyB9IDogdW5kZWZpbmVkLFxuICB9KTtcbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeShjb25maWcuaGFsZkxlbmd0aCAqIDIsIGNvbmZpZy52aXN1YWxIYWxmV2lkdGggKiAyLCAxLCAxKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gIG1lc2gubmFtZSA9ICdTY3VscHRMaXZpbmdXYXRlcic7XG4gIG1lc2gucm90YXRpb24ueCA9IC1NYXRoLlBJIC8gMjtcbiAgbWVzaC5wb3NpdGlvbi5zZXQoMCwgY29uZmlnLnN1cmZhY2VZLCBjb25maWcuY2VudGVyWik7XG4gIG1lc2gucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kRGVjYWxzO1xuICBtZXNoLnJlY2VpdmVTaGFkb3cgPSBmYWxzZTtcbiAgbWVzaC5jYXN0U2hhZG93ID0gZmFsc2U7XG4gIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLnVzZXJEYXRhLnZpc3VhbEhhbGZXaWR0aCA9IGNvbmZpZy52aXN1YWxIYWxmV2lkdGg7XG4gIHJldHVybiB7XG4gICAgbWVzaCxcbiAgICBkZWVwZXN0TWV0ZXJzOiBiZWQ/LmRlZXBlc3QgPz8gMCxcbiAgICBhZHZhbmNlOiAoZGVsdGE6IG51bWJlcikgPT4gdXBkYXRlV2F0ZXJNYXRlcmlhbChtZXNoLCBkZWx0YSksXG4gICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgYmVkPy50ZXh0dXJlLmRpc3Bvc2UoKTtcbiAgICAgIG1hdGVyaWFsLm1hcD8uZGlzcG9zZSgpO1xuICAgICAgbWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGb3JkU3RvbmVzKHdhdGVyWTogbnVtYmVyLCBvZmZzZXRYID0gMCk6IFRIUkVFLkluc3RhbmNlZE1lc2gge1xuICBjb25zdCBzdG9uZUdlb21ldHJ5ID0gbmV3IFRIUkVFLkN5bGluZGVyR2VvbWV0cnkoMC41NSwgMC42OCwgMC4wOCwgOSk7XG4gIGNvbnN0IHN0b25lTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiBwYWxldHRlLnNhbmREZWVwLFxuICAgIHJvdWdobmVzczogMC45LFxuICAgIG1ldGFsbmVzczogMC4wMSxcbiAgfSk7XG4gIGNvbnN0IHN0b25lcyA9IFtcbiAgICBbLTAuMzUsIC00LjI1LCAwLjg1LCAwLjU2LCAwLjFdLFxuICAgIFswLjM1LCAtMi45LCAwLjcsIDAuNSwgLTAuMl0sXG4gICAgWy0wLjE4LCAtMS40NSwgMC43OCwgMC41MiwgMC40NV0sXG4gICAgWzAuMzIsIC0wLjA1LCAwLjc0LCAwLjUsIC0wLjM1XSxcbiAgICBbLTAuMjgsIDEuNDIsIDAuODIsIDAuNTUsIDAuMl0sXG4gICAgWzAuMzQsIDIuODgsIDAuNzIsIDAuNSwgLTAuMV0sXG4gICAgWy0wLjEyLCA0LjIsIDAuODYsIDAuNTgsIDAuMzVdLFxuICBdIGFzIGNvbnN0O1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goc3RvbmVHZW9tZXRyeSwgc3RvbmVNYXRlcmlhbCwgc3RvbmVzLmxlbmd0aCk7XG4gIG1lc2gubmFtZSA9ICdGb3JkU3RlcHBpbmdTdG9uZXMnO1xuICBtZXNoLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLmdhbWVwbGF5O1xuICBtZXNoLnJlY2VpdmVTaGFkb3cgPSB0cnVlO1xuICBjb25zdCBtYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuICBjb25zdCByb3RhdGlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG4gIGNvbnN0IHBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgY29uc3Qgc2NhbGUgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc3RvbmVzLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIGNvbnN0IFt4LCB6LCBzeCwgc3osIHlhd10gPSBzdG9uZXNbaW5kZXhdO1xuICAgIHBvc2l0aW9uLnNldCh4ICsgb2Zmc2V0WCwgd2F0ZXJZICsgMC4wNDUsIHopO1xuICAgIHJvdGF0aW9uLnNldEZyb21FdWxlcihuZXcgVEhSRUUuRXVsZXIoMCwgeWF3LCAwKSk7XG4gICAgc2NhbGUuc2V0KHN4LCAxLCBzeik7XG4gICAgbWF0cml4LmNvbXBvc2UocG9zaXRpb24sIHJvdGF0aW9uLCBzY2FsZSk7XG4gICAgbWVzaC5zZXRNYXRyaXhBdChpbmRleCwgbWF0cml4KTtcbiAgfVxuICBtZXNoLmluc3RhbmNlTWF0cml4Lm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgcmV0dXJuIG1lc2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVXYXRlck1hdGVyaWFsKG1lc2g6IFRIUkVFLk1lc2gsIGRlbHRhOiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgdW5pZm9ybXMgPSB3YXRlclVuaWZvcm1zKG1lc2gpO1xuICBpZiAoIXVuaWZvcm1zKSByZXR1cm47XG4gIHVuaWZvcm1zLnRpbWUudmFsdWUgKz0gZGVsdGE7XG4gIHVuaWZvcm1zLnF1YWxpdHkudmFsdWUgPSB3YXRlclF1YWxpdHkoKTtcbiAgdW5pZm9ybXMuZmxvd1NwZWVkLnZhbHVlID0gQmFsYW5jZS53b3JsZC53YXRlckZsb3dTcGVlZDtcbiAgdW5pZm9ybXMud2FkZURlcHRoLnZhbHVlID0gQmFsYW5jZS50ZXJyYWluU2ltLndhZGVEZXB0aDtcbiAgdW5pZm9ybXMuZGVlcERlcHRoLnZhbHVlID0gQmFsYW5jZS50ZXJyYWluU2ltLmRlZXBEZXB0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhdGVyRGlhZ25vc3RpY3MoXG4gIHJpdmVyOiBUSFJFRS5NZXNoLFxuICBmb3JkczogcmVhZG9ubHkgVEhSRUUuTWVzaFtdLFxuICBmb3JkU3RvbmVzOiByZWFkb25seSBUSFJFRS5JbnN0YW5jZWRNZXNoW10sXG4gIGdyYXZlbEJhcnM6IHJlYWRvbmx5IFRIUkVFLk1lc2hbXSA9IFtdLFxuKTogV2F0ZXJEaWFnbm9zdGljcyB7XG4gIGNvbnN0IHJpdmVyVW5pZm9ybXMgPSB3YXRlclVuaWZvcm1zKHJpdmVyKTtcbiAgY29uc3QgZm9yZCA9IGZvcmRzWzBdO1xuICBjb25zdCBmb3JkVW5pZm9ybXMgPSBmb3JkID8gd2F0ZXJVbmlmb3Jtcyhmb3JkKSA6IHVuZGVmaW5lZDtcbiAgY29uc3QgdmlzdWFsSGFsZldpZHRoID0gdHlwZW9mIHJpdmVyLnVzZXJEYXRhLnZpc3VhbEhhbGZXaWR0aCA9PT0gJ251bWJlcicgPyByaXZlci51c2VyRGF0YS52aXN1YWxIYWxmV2lkdGggOiAwO1xuICByZXR1cm4ge1xuICAgIG1hdGVyaWFsOiAnTGl2aW5nV2F0ZXJTaGFkZXInLFxuICAgIHJpdmVyUHJlc2VudDogdHJ1ZSxcbiAgICBmb3JkUHJlc2VudDogZm9yZHMubGVuZ3RoID4gMCxcbiAgICByaXZlclRpbWU6IHJvdW5kMyhyaXZlclVuaWZvcm1zPy50aW1lLnZhbHVlID8/IDApLFxuICAgIGZvcmRUaW1lOiByb3VuZDMoZm9yZFVuaWZvcm1zPy50aW1lLnZhbHVlID8/IDApLFxuICAgIHF1YWxpdHk6IHJvdW5kMyhyaXZlclVuaWZvcm1zPy5xdWFsaXR5LnZhbHVlID8/IHdhdGVyUXVhbGl0eSgpKSxcbiAgICBtb2JpbGU6IGlzTW9iaWxlV2F0ZXIoKSxcbiAgICBmb2FtOiB0cnVlLFxuICAgIGdsaW50czogKHJpdmVyLm1hdGVyaWFsIGFzIFRIUkVFLk1hdGVyaWFsKS51c2VyRGF0YS53YXRlckdsaW50cyA/PyAwLFxuICAgIGZvcmRTdG9uZXM6IGZvcmRTdG9uZXMucmVkdWNlKChzdW0sIG1lc2gpID0+IHN1bSArIG1lc2guY291bnQsIDApLFxuICAgIGdyYXZlbEJhcnM6IGdyYXZlbEJhcnMubGVuZ3RoLFxuICAgIHZpc3VhbEhhbGZXaWR0aDogcm91bmQzKHZpc3VhbEhhbGZXaWR0aCksXG4gICAgc3ByaW5nUG9uZHM6IDAsXG4gICAgd2F0ZXJQaGFzZVZhcmlhbmNlOiByb3VuZDMod2F0ZXJQaGFzZVZhcmlhbmNlKCkpLFxuICAgIGRlcHRoOiB7XG4gICAgICByaXZlcjogcm91bmQzKHJpdmVyVW5pZm9ybXM/LnJpdmVyRGVwdGgudmFsdWUgPz8gMCksXG4gICAgICBmb3JkOiByb3VuZDMoZm9yZFVuaWZvcm1zPy5mb3JkRGVwdGgudmFsdWUgPz8gcml2ZXJVbmlmb3Jtcz8uZm9yZERlcHRoLnZhbHVlID8/IDApLFxuICAgICAgd2FkZTogcm91bmQzKHJpdmVyVW5pZm9ybXM/LndhZGVEZXB0aC52YWx1ZSA/PyBCYWxhbmNlLnRlcnJhaW5TaW0ud2FkZURlcHRoKSxcbiAgICAgIGRlZXA6IHJvdW5kMyhyaXZlclVuaWZvcm1zPy5kZWVwRGVwdGgudmFsdWUgPz8gQmFsYW5jZS50ZXJyYWluU2ltLmRlZXBEZXB0aCksXG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRyeVdhdGVyRGlhZ25vc3RpY3Moc3ByaW5nUG9uZHM6IG51bWJlcik6IFdhdGVyRGlhZ25vc3RpY3Mge1xuICByZXR1cm4ge1xuICAgIG1hdGVyaWFsOiAnTGl2aW5nV2F0ZXJTaGFkZXInLFxuICAgIHJpdmVyUHJlc2VudDogZmFsc2UsXG4gICAgZm9yZFByZXNlbnQ6IGZhbHNlLFxuICAgIHJpdmVyVGltZTogMCxcbiAgICBmb3JkVGltZTogMCxcbiAgICBxdWFsaXR5OiByb3VuZDMod2F0ZXJRdWFsaXR5KCkpLFxuICAgIG1vYmlsZTogaXNNb2JpbGVXYXRlcigpLFxuICAgIGZvYW06IGZhbHNlLFxuICAgIGdsaW50czogMCxcbiAgICBmb3JkU3RvbmVzOiAwLFxuICAgIGdyYXZlbEJhcnM6IDAsXG4gICAgdmlzdWFsSGFsZldpZHRoOiAwLFxuICAgIHNwcmluZ1BvbmRzLFxuICAgIHdhdGVyUGhhc2VWYXJpYW5jZTogMCxcbiAgICBkZXB0aDoge1xuICAgICAgcml2ZXI6IDAsXG4gICAgICBmb3JkOiAwLFxuICAgICAgd2FkZTogcm91bmQzKEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGgpLFxuICAgICAgZGVlcDogcm91bmQzKEJhbGFuY2UudGVycmFpblNpbS5kZWVwRGVwdGgpLFxuICAgIH0sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHdhdGVyVW5pZm9ybXMobWVzaDogVEhSRUUuTWVzaCk6IFdhdGVyVW5pZm9ybXMgfCB1bmRlZmluZWQge1xuICByZXR1cm4gKG1lc2gubWF0ZXJpYWwgYXMgVEhSRUUuTWF0ZXJpYWwpLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMgYXMgV2F0ZXJVbmlmb3JtcyB8IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gd2F0ZXJRdWFsaXR5KCk6IG51bWJlciB7XG4gIGNvbnN0IHZhbHVlID0gaXNNb2JpbGVXYXRlcigpID8gQmFsYW5jZS53b3JsZC53YXRlck1vYmlsZVF1YWxpdHkgOiBCYWxhbmNlLndvcmxkLndhdGVyUXVhbGl0eTtcbiAgcmV0dXJuIFRIUkVFLk1hdGhVdGlscy5jbGFtcCh2YWx1ZSwgMCwgMSk7XG59XG5cbmZ1bmN0aW9uIGlzTW9iaWxlV2F0ZXIoKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSA0MzA7XG59XG5cbmZ1bmN0aW9uIHdhdGVyUGhhc2VWYXJpYW5jZSgpOiBudW1iZXIge1xuICByZXR1cm4gd2F0ZXJRdWFsaXR5KCkgKiAwLjQzO1xufVxuXG5mdW5jdGlvbiBnbGludFNoYWRlckxpbmVzKGFuY2hvcnM6IEFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfT4pOiBzdHJpbmcge1xuICByZXR1cm4gYW5jaG9yc1xuICAgIC5tYXAoKGFuY2hvciwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBoYXNlID0gKGluZGV4ICogMS43MzEpLnRvRml4ZWQoMyk7XG4gICAgICByZXR1cm4gYCAgZ2xpbnQgKz0gd2F0ZXJHbGludCh3b3JsZCwgdmVjMigke2FuY2hvci54LnRvRml4ZWQoMyl9LCAke2FuY2hvci56LnRvRml4ZWQoMyl9KSwgd2F0ZXJUaW1lICogMS42NSArICR7cGhhc2V9KTtgO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuXG4vKiogRm9sZCBldmVyeSBkZWNsYXJlZCBjcm9zc2luZyBpbnRvIG9uZSBub24tYWRkaXRpdmUgc2hhZGVyIGJhbmQuICovXG5mdW5jdGlvbiBmb3JkQmFuZEV4cHJlc3Npb24oY2VudGVyczogcmVhZG9ubHkgbnVtYmVyW10sIGhhbGZXaWR0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3QgbmVhciA9IGhhbGZXaWR0aC50b0ZpeGVkKDMpO1xuICBjb25zdCBmYXIgPSAoaGFsZldpZHRoICsgMC45KS50b0ZpeGVkKDMpO1xuICBjb25zdCB0ZXJtcyA9IChjZW50ZXJzLmxlbmd0aCA/IGNlbnRlcnMgOiBbMF0pLm1hcCgoY2VudGVyKSA9PiB7XG4gICAgY29uc3QgYWNyb3NzID0gY2VudGVyID09PSAwID8gJ2Ficyh2V2F0ZXJXb3JsZC54KScgOiBgYWJzKHZXYXRlcldvcmxkLnggLSAke2NlbnRlci50b0ZpeGVkKDMpfSlgO1xuICAgIHJldHVybiBgMS4wIC0gc21vb3Roc3RlcCgke25lYXJ9LCAke2Zhcn0sICR7YWNyb3NzfSlgO1xuICB9KTtcbiAgcmV0dXJuIHRlcm1zLmxlbmd0aCA9PT0gMSA/IHRlcm1zWzBdISA6IHRlcm1zLm1hcCgodGVybSkgPT4gYCgke3Rlcm19KWApLnJlZHVjZSgobGVmdCwgcmlnaHQpID0+IGBtYXgoJHtsZWZ0fSwgJHtyaWdodH0pYCk7XG59XG5cbmZ1bmN0aW9uIGNvbmZpZ3VyZVdhdGVyTWFwKHRleHR1cmU6IFRIUkVFLlRleHR1cmUpOiB2b2lkIHtcbiAgdGV4dHVyZS5jb2xvclNwYWNlID0gVEhSRUUuU1JHQkNvbG9yU3BhY2U7XG4gIHRleHR1cmUud3JhcFMgPSBUSFJFRS5SZXBlYXRXcmFwcGluZztcbiAgdGV4dHVyZS53cmFwVCA9IFRIUkVFLlJlcGVhdFdyYXBwaW5nO1xuICB0ZXh0dXJlLmFuaXNvdHJvcHkgPSA0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVXYXRlclRleHR1cmUoc2hhbGxvdzogYm9vbGVhbik6IFRIUkVFLkNhbnZhc1RleHR1cmUge1xuICBjb25zdCBzaXplID0gMTI4O1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLndpZHRoID0gc2l6ZTtcbiAgY2FudmFzLmhlaWdodCA9IHNpemU7XG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBjcmVhdGUgcml2ZXIgdGV4dHVyZSBjb250ZXh0LicpO1xuXG4gIGNvbnRleHQuZmlsbFN0eWxlID0gc2hhbGxvdyA/ICcjOWRhODg5JyA6ICcjNDE2ZjZlJztcbiAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgY29udGV4dC5zdHJva2VTdHlsZSA9IHNoYWxsb3cgPyAncmdiYSgyNDUsIDIzMCwgMjAwLCAwLjI1KScgOiAncmdiYSgyNDUsIDIzMCwgMjAwLCAwLjE2KSc7XG4gIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgZm9yIChsZXQgeSA9IDEyOyB5IDwgc2l6ZTsgeSArPSAyMikge1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oMCwgeSk7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPD0gc2l6ZTsgeCArPSAyMCkge1xuICAgICAgY29udGV4dC5saW5lVG8oeCwgeSArIE1hdGguc2luKHggKiAwLjA3ICsgeSkgKiA0KTtcbiAgICB9XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfVxuICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3JnYmEoNDYsIDI3LCAxNCwgMC4wOCknO1xuICBmb3IgKGxldCB4ID0gLXNpemU7IHggPCBzaXplICogMjsgeCArPSAzNCkge1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oeCwgMCk7XG4gICAgY29udGV4dC5saW5lVG8oeCArIHNpemUgKiAwLjM1LCBzaXplKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9XG5cbiAgY29uc3QgdGV4dHVyZSA9IG5ldyBUSFJFRS5DYW52YXNUZXh0dXJlKGNhbnZhcyk7XG4gIHRleHR1cmUuY29sb3JTcGFjZSA9IFRIUkVFLlNSR0JDb2xvclNwYWNlO1xuICByZXR1cm4gdGV4dHVyZTtcbn1cblxuZnVuY3Rpb24gcm91bmQzKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMDApIC8gMTAwMDtcbn1cblxuXG5cbi8qKlxuICogVGhlIHNoYXJlZCB3YXRlciBmaWVsZDogb25lIGdsaW50LCBvbmUgaGFzaCwgb25lIHZhbHVlLW5vaXNlLCB1c2VkIGJ5IHRoZSByaXZlci9mb3JkIHN1cmZhY2UgYW5kXG4gKiBieSB0aGUgc3ByaW5nIHBvbmQuIEV4dHJhY3RlZCB2ZXJiYXRpbSBmcm9tIHRoZSByaXZlciBzaGFkZXIgc28gdGhlIHR3byBzdXJmYWNlcyBjYW5ub3QgZHJpZnRcbiAqIGFwYXJ0IOKAlCBhIHBvbmQgdGhhdCByaXBwbGVzIG9uIGRpZmZlcmVudCBub2lzZSB0aGFuIHRoZSByaXZlciByZWFkcyBhcyBhIGRpZmZlcmVudCBnYW1lJ3Mgd2F0ZXIuXG4gKi9cbmNvbnN0IFdBVEVSX0ZJRUxEX0dMU0wgPSBgXG5mbG9hdCB3YXRlckdsaW50KHZlYzIgd29ybGQsIHZlYzIgY2VudGVyLCBmbG9hdCBwaGFzZSkge1xuICB2ZWMyIGRlbHRhID0gd29ybGQgLSBjZW50ZXI7XG4gIGZsb2F0IHNwYXJrbGUgPSAxLjAgLSBzbW9vdGhzdGVwKDAuMCwgMS44LCBkb3QoZGVsdGEsIGRlbHRhKSk7XG4gIGZsb2F0IHB1bHNlID0gc21vb3Roc3RlcCgwLjcyLCAwLjk5LCBzaW4ocGhhc2UgKyBjZW50ZXIueCAqIDAuMzcpICogMC41ICsgMC41KTtcbiAgZmxvYXQgbGluZSA9IDEuMCAtIHNtb290aHN0ZXAoMC4wMTgsIDAuMDksIGFicyhkZWx0YS55ICsgc2luKGRlbHRhLnggKiAyLjYgKyBwaGFzZSkgKiAwLjA1KSk7XG4gIHJldHVybiBzcGFya2xlICogcHVsc2UgKiBsaW5lO1xufVxuXG5mbG9hdCB3YXRlckhhc2godmVjMiBwKSB7XG4gIHZlYzMgcDMgPSBmcmFjdCh2ZWMzKHAueHl4KSAqIDAuMTAzMSk7XG4gIHAzICs9IGRvdChwMywgcDMueXp4ICsgMzMuMzMpO1xuICByZXR1cm4gZnJhY3QoKHAzLnggKyBwMy55KSAqIHAzLnopO1xufVxuXG5mbG9hdCB3YXRlck5vaXNlKHZlYzIgcCkge1xuICB2ZWMyIGkgPSBmbG9vcihwKTtcbiAgdmVjMiBmID0gZnJhY3QocCk7XG4gIGYgPSBmICogZiAqICgzLjAgLSAyLjAgKiBmKTtcbiAgZmxvYXQgYSA9IHdhdGVySGFzaChpKTtcbiAgZmxvYXQgYiA9IHdhdGVySGFzaChpICsgdmVjMigxLjAsIDAuMCkpO1xuICBmbG9hdCBjID0gd2F0ZXJIYXNoKGkgKyB2ZWMyKDAuMCwgMS4wKSk7XG4gIGZsb2F0IGQgPSB3YXRlckhhc2goaSArIHZlYzIoMS4wLCAxLjApKTtcbiAgcmV0dXJuIG1peChtaXgoYSwgYiwgZi54KSwgbWl4KGMsIGQsIGYueCksIGYueSk7XG59YDtcblxuXG5leHBvcnQgdHlwZSBTcHJpbmdQb25kU3VyZmFjZSA9IHtcbiAgZ3JvdXA6IFRIUkVFLkdyb3VwO1xuICB3YXRlclJhZGl1czogbnVtYmVyO1xuICBkaXNwb3NlOiAoKSA9PiB2b2lkO1xufTtcblxuXG50eXBlIFNwcmluZ1BvbmRDb25maWcgPSB7XG4gIHg6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICAvKiogV2F0ZXItbGluZSByYWRpdXMgaW4gbWV0cmVzIOKAlCBpZGVudGljYWwgdG8gdGhlIHNpbSdzIHNwcmluZyByYWRpdXMuICovXG4gIHJhZGl1czogbnVtYmVyO1xuICAvKiogV29ybGQgaGVpZ2h0IG9mIHRoZSB3YXRlciBwbGFuZTsgdGhlIHNjdWxwdCBvd25zIHRoZSBiYW5rIGFuZCByZWVkIHJvb3RzLiAqL1xuICBzdXJmYWNlWTogbnVtYmVyO1xuICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXI7XG59O1xuXG5cbmNvbnN0IFBPTkRfU1VSRkFDRV9MSUZUID0gMC4wMjtcblxuXG4vKipcbiAqIE9ORSBMSVZFIFBPT0wgSU4gQSBCT05FLURSWSBNQVAgKGJyaWVmIFUxKS5cbiAqXG4gKiBSZW5kZXItb25seTogYSBkaXNjIG9mIG1vdmluZyB3YXRlciBhdCBhIHNwcmluZyB0aGUgc2ltIGFscmVhZHkgZGVjbGFyZXMsIGFuZCBhIGZldyByZWVkIHR1ZnRzOyB0aGUgc2N1bHB0ZWQgdGVycmFpbiBvd25zIGl0cyBiYW5rLiBOb3RoaW5nIGhlcmUgaXMgcmVhZCBieSB0aGVcbiAqIHNpbXVsYXRpb24g4oCUIHRoZSBzcHJpbmcncyBwb3NpdGlvbiwgcmFkaXVzIGFuZCB6b25lIHN0YXkgZXhhY3RseSB3aGVyZSBgdGlsZVBhcmFtcy53YXRlclNvdXJjZXNgXG4gKiBwdXQgdGhlbSwgYW5kIHRoaXMgc3VyZmFjZSBvbmx5IGRyYXdzIHdoYXQgdGhhdCBkZWNsYXJhdGlvbiBhbHJlYWR5IG1lYW5zLlxuICpcbiAqIEl0IGlzIE5PVCB0aGUgcml2ZXIgbWF0ZXJpYWwuIFRoZSByaXZlci9mb3JkIHNoYWRlciBtZWFzdXJlcyBldmVyeXRoaW5nIGluIHdvcmxkLXogYmFuZHMgYW5kXG4gKiBmYWRlcyBvbiB0aGUgZm9yZCdzIFVWIHN0cmlwOyBvbiBhIGRpc2MgdGhvc2UgYmVjb21lIGEgaGFyZCBlZGdlIGFjcm9zcyB0aGUgcG9vbCBhbmQgYW4gYWxwaGFcbiAqIHRoYXQgZGVwZW5kcyBvbiBob3cgZmFyIHRoZSBwb25kIGhhcHBlbnMgdG8gc2l0IGZyb20gej0wLiBTYW1lIHdhdGVyIGxhbmd1YWdlIChzYW1lIG5vaXNlLCBzYW1lXG4gKiBnbGludCwgc2FtZSB3YXJtLXNoYWxsb3ctdG8tY29vbC1kZWVwIHJhbXApLCByYWRpYWwgZ2VvbWV0cnkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpbmdQb25kU3VyZmFjZShjb25maWc6IFNwcmluZ1BvbmRDb25maWcpOiBTcHJpbmdQb25kU3VyZmFjZSB7XG4gIGNvbnN0IGdyb3VwID0gbmV3IFRIUkVFLkdyb3VwKCk7XG4gIGdyb3VwLm5hbWUgPSAnU3ByaW5nUG9uZExpdmUnO1xuICBncm91cC51c2VyRGF0YS5yZW5kZXJPbmx5ID0gdHJ1ZTtcblxuICBjb25zdCB0aW1lID0geyB2YWx1ZTogMCB9O1xuICBjb25zdCBxdWFsaXR5ID0geyB2YWx1ZTogd2F0ZXJRdWFsaXR5KCkgfTtcbiAgY29uc3QgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgb3BhY2l0eTogMC43NCxcbiAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICBkZXB0aFRlc3Q6IHRydWUsXG4gICAgcm91Z2huZXNzOiAwLjUsXG4gICAgbWV0YWxuZXNzOiAwLjAyLFxuICB9KTtcbiAgbWF0ZXJpYWwubWFwID0gY3JlYXRlV2F0ZXJUZXh0dXJlKHRydWUpO1xuICBjb25maWd1cmVXYXRlck1hcChtYXRlcmlhbC5tYXApO1xuICBtYXRlcmlhbC51c2VyRGF0YS53YXRlclVuaWZvcm1zID0geyB0aW1lLCBxdWFsaXR5IH07XG4gIG1hdGVyaWFsLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+ICdsaXZpbmctd2F0ZXItc3ByaW5nLXBvbmQnO1xuICBtYXRlcmlhbC5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyKSA9PiB7XG4gICAgc2hhZGVyLnVuaWZvcm1zLnBvbmRUaW1lID0gdGltZTtcbiAgICBzaGFkZXIudW5pZm9ybXMucG9uZFF1YWxpdHkgPSBxdWFsaXR5O1xuICAgIHNoYWRlci52ZXJ0ZXhTaGFkZXIgPSBzaGFkZXIudmVydGV4U2hhZGVyXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPGNvbW1vbj4nLCAnI2luY2x1ZGUgPGNvbW1vbj5cXG52YXJ5aW5nIHZlYzIgdlBvbmRMb2NhbDsnKVxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDx1dl92ZXJ0ZXg+JywgJyNpbmNsdWRlIDx1dl92ZXJ0ZXg+XFxudlBvbmRMb2NhbCA9IHBvc2l0aW9uLnh5OycpO1xuICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlclxuICAgICAgLnJlcGxhY2UoJyNpbmNsdWRlIDxjb21tb24+JywgYCNpbmNsdWRlIDxjb21tb24+XG51bmlmb3JtIGZsb2F0IHBvbmRUaW1lO1xudW5pZm9ybSBmbG9hdCBwb25kUXVhbGl0eTtcbnZhcnlpbmcgdmVjMiB2UG9uZExvY2FsO1xuJHtXQVRFUl9GSUVMRF9HTFNMfWApXG4gICAgICAucmVwbGFjZSgnI2luY2x1ZGUgPG1hcF9mcmFnbWVudD4nLCBgXG4jaWZkZWYgVVNFX01BUFxuICBmbG9hdCBwb25kRGlzdCA9IGxlbmd0aCh2UG9uZExvY2FsKTtcbiAgZmxvYXQgcG9uZFIgPSBwb25kRGlzdCAvICR7Y29uZmlnLnJhZGl1cy50b0ZpeGVkKDMpfTtcbiAgLy8gRGVlcCBhY3Jvc3MgbW9zdCBvZiB0aGUgcG9vbCBhbmQgdGhpbm5pbmcgb25seSBhdCB0aGUgdmVyeSBsaXA6IGEgc3ByaW5nIGlzIGEgaG9sZSB3aXRoIHdhdGVyXG4gIC8vIGluIGl0LCBub3QgYSBzYXVjZXIsIGFuZCBhIHNvZnQgcmFkaWFsIHJhbXAgaXMgd2hhdCBtYWRlIHRoZSBiYWtlZCB2ZXJzaW9uIHJlYWQgYXMgYSBkZWNhbC5cbiAgZmxvYXQgcG9uZERlcHRoID0gMS4wIC0gc21vb3Roc3RlcCgwLjg4LCAxLjAsIHBvbmRSKTtcbiAgLy8gV2luZCBjaG9wOiB0d28gbm9pc2UgZmllbGRzIGRyaWZ0aW5nIGFjcm9zcyBlYWNoIG90aGVyLiBUaGlzIGNhcnJpZXMgdGhlIG1vdGlvbjsgdGhlIHJpbmdcbiAgLy8gd2F2ZWxldHMgYmVsb3cgb25seSBwdW5jdHVhdGUgaXQsIGJlY2F1c2UgY29uY2VudHJpYyByaW5ncyBhbG9uZSByZWFkIGFzIGEgdGFyZ2V0LlxuICBmbG9hdCBwb25kQ2hvcCA9IHdhdGVyTm9pc2UodlBvbmRMb2NhbCAqIDEuMTUgKyB2ZWMyKHBvbmRUaW1lICogMC4wOSwgLXBvbmRUaW1lICogMC4wNSkpO1xuICBmbG9hdCBwb25kQ2hvcEIgPSB3YXRlck5vaXNlKHZQb25kTG9jYWwgKiAyLjIgLSB2ZWMyKHBvbmRUaW1lICogMC4xMywgcG9uZFRpbWUgKiAwLjA4KSk7XG4gIGZsb2F0IHBvbmRTdXJmYWNlID0gKHBvbmRDaG9wICogMC42MiArIHBvbmRDaG9wQiAqIDAuMzggLSAwLjUpO1xuICAvLyBUaGUgc3ByaW5nIGV5ZSBpcyB3ZWxsIG9mZi1jZW50cmUgYW5kIHRoZSByaW5nIHBoYXNlIGlzIHdhcnBlZCBieSB0aGUgY2hvcC5cbiAgZmxvYXQgcG9uZEV5ZSA9IGxlbmd0aCh2UG9uZExvY2FsIC0gdmVjMigkeyhjb25maWcucmFkaXVzICogMC4zNCkudG9GaXhlZCgzKX0sICR7KGNvbmZpZy5yYWRpdXMgKiAtMC4yOSkudG9GaXhlZCgzKX0pKTtcbiAgZmxvYXQgcG9uZFJpbmdzID0gc2luKHBvbmRFeWUgKiA0LjYgLSBwb25kVGltZSAqIDEuMzUgKyBwb25kU3VyZmFjZSAqIDUuMCkgKiAwLjUgKyAwLjU7XG4gIGZsb2F0IHBvbmRGaW5lID0gMC4wO1xuICBpZiAocG9uZFF1YWxpdHkgPiAwLjcpIHtcbiAgICBwb25kRmluZSA9IHNpbihwb25kRXllICogMTEuNSAtIHBvbmRUaW1lICogMi42ICsgcG9uZENob3BCICogNC4yKSAqIDAuNSArIDAuNTtcbiAgfVxuICB2ZWM0IHBvbmRUZXhlbCA9IHRleHR1cmUyRChtYXAsIHZQb25kTG9jYWwgKiAwLjIyICsgdmVjMihwb25kVGltZSAqIDAuMDEwLCBwb25kQ2hvcCAqIDAuMDUpKTtcbiAgLy8gR3JlZW4tYmxhY2sgYXQgZGVwdGgsIG9saXZlIHdoZXJlIHRoZSB3YXRlciB0aGlucyBvdmVyIHBhbGUgc2FuZC4gTmV2ZXIgdGhlIHBvb2wtY3lhbiB0aGVcbiAgLy8gYXRsYXMgYmFrZXMg4oCUIGEgZGVzZXJ0IHNwcmluZyBpcyBkYXJrLCBhbmQgdGhlIGRhcmtuZXNzIGlzIHdoYXQgbWFrZXMgdGhlIGdsaW50cyByZWFkLlxuICB2ZWMzIHBvbmRTaGFsbG93ID0gdmVjMygwLjQwLCAwLjQ3LCAwLjI3KTtcbiAgdmVjMyBwb25kRGVlcENvbG9yID0gdmVjMygwLjA0MCwgMC4xNTAsIDAuMTI1KTtcbiAgdmVjMyBwb25kQ29sb3IgPSBtaXgocG9uZFNoYWxsb3csIHBvbmREZWVwQ29sb3IsIHBvbmREZXB0aCk7XG4gIHBvbmRDb2xvciArPSB2ZWMzKDAuMTEsIDAuMTYsIDAuMTApICogcG9uZFN1cmZhY2UgKiAoMC41ICsgcG9uZFF1YWxpdHkgKiAwLjUpO1xuICBwb25kQ29sb3IgKz0gdmVjMygwLjA3LCAwLjEwLCAwLjA2KSAqIHBvbmRSaW5ncyAqIDAuMTY7XG4gIHBvbmRDb2xvciArPSB2ZWMzKDAuMDYsIDAuMDgsIDAuMDUpICogcG9uZEZpbmUgKiBwb25kUXVhbGl0eSAqIDAuMjA7XG4gIC8vIFRoZSBvbmUgdGhpbmcgYSBzdGlsbCBhdGxhcyBjYW4gbmV2ZXIgZG86IHN1biBtb3Zpbmcgb24gd2F0ZXIuXG4gIC8vIFNtYWxsIGFuZCBtYW55LCBub3Qgb25lIGJpZyBzdHJlYWs6IHdhdGVyR2xpbnQgZHJhd3MgYSBzaG9ydCBzcGVjdWxhciBsaW5lLCBzbyBhdCB0aGlzIHNjYWxlXG4gIC8vIGVhY2ggaXMgYSB+MzAgY20gZmxhc2ggYW5kIHRoZSBwb29sIHR3aW5rbGVzIGluc3RlYWQgb2YgbG9va2luZyBzY3JhdGNoZWQuXG4gIHZlYzIgcG9uZEdsaW50VXYgPSB2UG9uZExvY2FsICogNC4yO1xuICBmbG9hdCBwb25kR2xpbnQgPVxuICAgIHdhdGVyR2xpbnQocG9uZEdsaW50VXYsIHZlYzIoMS4yLCAtMC43KSwgcG9uZFRpbWUgKiAxLjE1KSArXG4gICAgd2F0ZXJHbGludChwb25kR2xpbnRVdiwgdmVjMigtMS45LCAxLjQpLCBwb25kVGltZSAqIDEuMTUgKyAxLjcpICtcbiAgICB3YXRlckdsaW50KHBvbmRHbGludFV2LCB2ZWMyKDAuNCwgMi42KSwgcG9uZFRpbWUgKiAxLjE1ICsgMy4xKSArXG4gICAgd2F0ZXJHbGludChwb25kR2xpbnRVdiwgdmVjMigtMi42LCAtMS45KSwgcG9uZFRpbWUgKiAxLjE1ICsgNC40KSArXG4gICAgd2F0ZXJHbGludChwb25kR2xpbnRVdiwgdmVjMigyLjQsIDEuOSksIHBvbmRUaW1lICogMS4xNSArIDUuNikgK1xuICAgIHdhdGVyR2xpbnQocG9uZEdsaW50VXYsIHZlYzIoLTAuMywgLTIuOSksIHBvbmRUaW1lICogMS4xNSArIDIuNCk7XG4gIHBvbmRDb2xvciArPSB2ZWMzKDEuMCwgMC45NCwgMC43MikgKiBwb25kR2xpbnQgKiBwb25kUXVhbGl0eSAqIDEuNTtcbiAgcG9uZENvbG9yID0gbWl4KHBvbmRDb2xvciwgcG9uZFRleGVsLnJnYiAqIDAuNiwgMC4xMCk7XG4gIC8vIEtlZXAgZGVwdGggcmVhZGFibGUgd2hpbGUgc29mdGVuaW5nIG9ubHkgdGhlIHdhdGVyIHNpbGhvdWV0dGUuXG4gIGZsb2F0IHBvbmRBbHBoYSA9IG1peCgwLjg4LCAwLjk4NSwgcG9uZERlcHRoKSAqICgxLjAgLSBzbW9vdGhzdGVwKDAuOTYsIDEuMCwgcG9uZFIpKTtcbiAgdmVjNCBzYW1wbGVkRGlmZnVzZUNvbG9yID0gdmVjNChwb25kQ29sb3IsIHBvbmRBbHBoYSk7XG4gIGRpZmZ1c2VDb2xvciAqPSBzYW1wbGVkRGlmZnVzZUNvbG9yO1xuI2VuZGlmYCk7XG4gIH07XG5cbiAgY29uc3Qgd2F0ZXIgPSBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQ2lyY2xlR2VvbWV0cnkoY29uZmlnLnJhZGl1cywgNTYpLCBtYXRlcmlhbCk7XG4gIHdhdGVyLm5hbWUgPSAnU3ByaW5nUG9uZExpdmVTdXJmYWNlJztcbiAgd2F0ZXIucm90YXRpb24ueCA9IC1NYXRoLlBJIC8gMjtcbiAgd2F0ZXIucG9zaXRpb24uc2V0KGNvbmZpZy54LCBjb25maWcuc3VyZmFjZVkgKyBQT05EX1NVUkZBQ0VfTElGVCwgY29uZmlnLnopO1xuICB3YXRlci5yZW5kZXJPcmRlciA9IFJlbmRlckxheWVycy5ncm91bmREZWNhbHM7XG4gIHdhdGVyLnJlY2VpdmVTaGFkb3cgPSBmYWxzZTtcbiAgd2F0ZXIuY2FzdFNoYWRvdyA9IGZhbHNlO1xuICB3YXRlci5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gIGdyb3VwLmFkZCh3YXRlcik7XG5cbiAgLy8gVGhlIDNEIHBpbG90IGhhcyBubyBwZXItZnJhbWUgcHVtcCBhbmQgZ2l2aW5nIGl0IG9uZSB3b3VsZCBtZWFuIGVkaXRpbmcgR2FtZS50cywgd2hpY2ggdGhpc1xuICAvLyBzdXJmYWNlIGhhcyBubyBidXNpbmVzcyB0b3VjaGluZy4gVGhyZWUgYWxyZWFkeSBjYWxscyBvbkJlZm9yZVJlbmRlciBvbmNlIHBlciBtZXNoIHBlciByZW5kZXI7XG4gIC8vIHRoZSBmcmFtZSBndWFyZCBrZWVwcyBhIHNlY29uZCBjYW1lcmEgcGFzcyAob3IgYSBmdXR1cmUgb25lKSBmcm9tIGRvdWJsZS1hZHZhbmNpbmcgdGhlIGNsb2NrLlxuICBjb25zdCBjbG9jayA9IG5ldyBUSFJFRS5DbG9jaygpO1xuICBsZXQgbGFzdEZyYW1lID0gLTE7XG4gIHdhdGVyLm9uQmVmb3JlUmVuZGVyID0gKHJlbmRlcmVyKSA9PiB7XG4gICAgaWYgKHJlbmRlcmVyLmluZm8ucmVuZGVyLmZyYW1lID09PSBsYXN0RnJhbWUpIHJldHVybjtcbiAgICBsYXN0RnJhbWUgPSByZW5kZXJlci5pbmZvLnJlbmRlci5mcmFtZTtcbiAgICAvLyBDbGFtcGVkOiBhIGJhY2tncm91bmRlZCB0YWIgcmV0dXJucyBzZWNvbmRzLCBhbmQgYSBwb25kIHRoYXQgdGVsZXBvcnRzIGZvcndhcmQgb24gcmVmb2N1c1xuICAgIC8vIGxvb2tzIGxpa2UgYSBnbGl0Y2ggcmF0aGVyIHRoYW4gd2F0ZXIuXG4gICAgdGltZS52YWx1ZSArPSBNYXRoLm1pbihjbG9jay5nZXREZWx0YSgpLCAwLjEpO1xuICAgIHF1YWxpdHkudmFsdWUgPSB3YXRlclF1YWxpdHkoKTtcbiAgfTtcblxuICBjb25zdCByZWVkcyA9IGNyZWF0ZVBvbmRSZWVkVHVmdHMoY29uZmlnKTtcbiAgZ3JvdXAuYWRkKHJlZWRzKTtcblxuICByZXR1cm4ge1xuICAgIGdyb3VwLFxuICAgIHdhdGVyUmFkaXVzOiBjb25maWcucmFkaXVzLFxuICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgIG1hdGVyaWFsLm1hcD8uZGlzcG9zZSgpO1xuICAgICAgbWF0ZXJpYWwuZGlzcG9zZSgpO1xuICAgICAgd2F0ZXIuZ2VvbWV0cnkuZGlzcG9zZSgpO1xuICAgICAgKHJlZWRzLm1hdGVyaWFsIGFzIFRIUkVFLk1hdGVyaWFsKS5kaXNwb3NlKCk7XG4gICAgICByZWVkcy5nZW9tZXRyeS5kaXNwb3NlKCk7XG4gICAgfSxcbiAgfTtcbn1cblxuXG4vKipcbiAqIFRocmVlIGRhcmtlciByZWVkIGNsdW1wcyBvbiB0aGUgd2V0IG1hcmdpbi4gRGVzYXR1cmF0ZWQgb24gcHVycG9zZTogZGVzZXJ0IGxhdyBzYXlzIGNhY3RpIGFuZCBkcnlcbiAqIGJydXNoLCBhbmQgYSBicmlnaHQgZ3JlZW4gZnJpbmdlIHdvdWxkIHR1cm4gdGhlIG9uZSBzcHJpbmcgaW50byBhbiBvYXNpcyB0aGUgbWFwIGRvZXMgbm90IGhhdmUuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBvbmRSZWVkVHVmdHMoY29uZmlnOiBTcHJpbmdQb25kQ29uZmlnKTogVEhSRUUuSW5zdGFuY2VkTWVzaCB7XG4gIGNvbnN0IGJsYWRlcyA9IFtcbiAgICB7IGFuZ2xlOiAwLjYyLCBkaXN0YW5jZTogMS4wMCwgc2NhbGU6IDEuMCB9LFxuICAgIHsgYW5nbGU6IDAuODYsIGRpc3RhbmNlOiAxLjA2LCBzY2FsZTogMC43NCB9LFxuICAgIHsgYW5nbGU6IDIuNDgsIGRpc3RhbmNlOiAxLjAzLCBzY2FsZTogMC45MiB9LFxuICAgIHsgYW5nbGU6IDIuNzIsIGRpc3RhbmNlOiAwLjk3LCBzY2FsZTogMC42OCB9LFxuICAgIHsgYW5nbGU6IDQuMzAsIGRpc3RhbmNlOiAwLjk5LCBzY2FsZTogMC45NiB9LFxuICAgIHsgYW5nbGU6IDQuMDYsIGRpc3RhbmNlOiAxLjA1LCBzY2FsZTogMC43MiB9LFxuICBdO1xuICBjb25zdCBtZXNoID0gbmV3IFRIUkVFLkluc3RhbmNlZE1lc2goXG4gICAgcmVlZFR1ZnRHZW9tZXRyeSgpLFxuICAgIG5ldyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbCh7IGNvbG9yOiAnIzhkODI1MCcsIHJvdWdobmVzczogMSwgbWV0YWxuZXNzOiAwLCBzaWRlOiBUSFJFRS5Eb3VibGVTaWRlIH0pLFxuICAgIGJsYWRlcy5sZW5ndGgsXG4gICk7XG4gIG1lc2gubmFtZSA9ICdTcHJpbmdQb25kTGl2ZVJlZWRzJztcbiAgbWVzaC5jYXN0U2hhZG93ID0gZmFsc2U7XG4gIG1lc2gucmVjZWl2ZVNoYWRvdyA9IHRydWU7XG4gIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBjb25zdCBhbmNob3IgPSBuZXcgVEhSRUUuT2JqZWN0M0QoKTtcbiAgYmxhZGVzLmZvckVhY2goKHsgYW5nbGUsIGRpc3RhbmNlLCBzY2FsZSB9LCBpbmRleCkgPT4ge1xuICAgIGFuY2hvci5wb3NpdGlvbi5zZXQoXG4gICAgICBjb25maWcueCArIE1hdGguY29zKGFuZ2xlKSAqIGNvbmZpZy5yYWRpdXMgKiBkaXN0YW5jZSxcbiAgICAgIDAsXG4gICAgICBjb25maWcueiArIE1hdGguc2luKGFuZ2xlKSAqIGNvbmZpZy5yYWRpdXMgKiBkaXN0YW5jZSxcbiAgICApO1xuICAgIGFuY2hvci5wb3NpdGlvbi55ID0gY29uZmlnLmhlaWdodEF0KGFuY2hvci5wb3NpdGlvbi54LCBhbmNob3IucG9zaXRpb24ueik7XG4gICAgYW5jaG9yLnJvdGF0aW9uLnNldCgwLCBhbmdsZSwgMCk7XG4gICAgYW5jaG9yLnNjYWxlLnNldFNjYWxhcihzY2FsZSk7XG4gICAgYW5jaG9yLnVwZGF0ZU1hdHJpeCgpO1xuICAgIG1lc2guc2V0TWF0cml4QXQoaW5kZXgsIGFuY2hvci5tYXRyaXgpO1xuICB9KTtcbiAgbWVzaC5pbnN0YW5jZU1hdHJpeC5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIHJldHVybiBtZXNoO1xufVxuXG5cbmZ1bmN0aW9uIHJlZWRUdWZ0R2VvbWV0cnkoKTogVEhSRUUuQnVmZmVyR2VvbWV0cnkge1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW10sIGluZGljZXM6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgY29uc3QgYW5nbGUgPSBpICogMi40LCBjID0gTWF0aC5jb3MoYW5nbGUpLCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgIGNvbnN0IGhlaWdodCA9IDAuNjggKyAoaSAlIDMpICogMC4xMiwgd2lkdGggPSAwLjA1O1xuICAgIGNvbnN0IHggPSBjICogMC4wNjUsIHogPSBzICogMC4wNjUsIGxlYW4gPSAwLjE1ICsgKGkgJSAyKSAqIDAuMDg7XG4gICAgY29uc3QgYmFzZSA9IHBvc2l0aW9ucy5sZW5ndGggLyAzO1xuICAgIHBvc2l0aW9ucy5wdXNoKHgtd2lkdGgqYywwLHotd2lkdGgqcyx4K3dpZHRoKmMsMCx6K3dpZHRoKnMsXG4gICAgICB4K2xlYW4qYy13aWR0aCowLjYqYyxoZWlnaHQqMC42NSx6K2xlYW4qcy13aWR0aCowLjYqcyxcbiAgICAgIHgrbGVhbipjK3dpZHRoKjAuNipjLGhlaWdodCowLjY1LHorbGVhbipzK3dpZHRoKjAuNipzLFxuICAgICAgeCtsZWFuKjEuOCpjLGhlaWdodCx6K2xlYW4qMS44KnMpO1xuICAgIGluZGljZXMucHVzaChiYXNlLGJhc2UrMSxiYXNlKzIsYmFzZSsyLGJhc2UrMSxiYXNlKzMsYmFzZSsyLGJhc2UrMyxiYXNlKzQpO1xuICB9XG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcbiAgZ2VvbWV0cnkuc2V0SW5kZXgoaW5kaWNlcyk7XG4gIGdlb21ldHJ5LmNvbXB1dGVWZXJ0ZXhOb3JtYWxzKCk7XG4gIHJldHVybiBnZW9tZXRyeTtcbn1cblxuXG5leHBvcnQgdHlwZSBXYXRlclJpYmJvbkNvbmZpZyA9IHtcbiAgLyoqIENlbnRyZWxpbmUgaW4gd29ybGQgWC9aLCByZWFkIGZyb20gdGhlIHNjdWxwdCBjb250cmFjdCdzIG93biBtYXNrIHBvbHlsaW5lLiAqL1xuICBwb2ludHM6IFJlYWRvbmx5QXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlciB9PjtcbiAgaGFsZldpZHRoOiBudW1iZXI7XG4gIC8qKiBNZXRyZXMgdGhlIHNoZWV0IG92ZXItcmVhY2hlcyBpdHMgbWFzayBiYW5kIHNvIHRoZSBzY3VscHQsIG5vdCB0aGUgbWVzaCwgY3V0cyB0aGUgd2F0ZXJsaW5lLiAqL1xuICBlZGdlQmxlZWQ6IG51bWJlcjtcbiAgc3VyZmFjZVk6IG51bWJlcjtcbiAgLyoqIERlY2xhcmVkIGRlcHRoIGZlZCB0byB0aGUgc2hhZGVyJ3Mgd2FkZS4uZGVlcCBjb2xvdXIgcmFtcC4gUmVuZGVyLW9ubHkuICovXG4gIGRlcHRoOiBudW1iZXI7XG4gIGdsaW50czogUmVhZG9ubHlBcnJheTx7IHg6IG51bWJlcjsgejogbnVtYmVyIH0+O1xuICAvKiogTWV0cmVzIHlpZWxkZWQgdG8gYSBzaGFyZWQgY29uZmx1ZW5jZSBzdXJmYWNlIGF0IGVpdGhlciBlbmRwb2ludC4gKi9cbiAgaGVhZEluc2V0PzogbnVtYmVyO1xuICB0YWlsSW5zZXQ/OiBudW1iZXI7XG4gIGhlYWRGYWRlOiBudW1iZXI7XG4gIHRhaWxGYWRlOiBudW1iZXI7XG4gIC8qKiBUaGUgc2N1bHB0J3Mgc2FtcGxlZCBiZWQsIG1hdGNoaW5nIHRoZSBkZXB0aCB0cmVhdG1lbnQgdXNlZCBieSB0aGUgQ2xhaW0gcml2ZXIuICovXG4gIGJlZD86IHtcbiAgICBoZWlnaHRBdDogKHg6IG51bWJlciwgejogbnVtYmVyKSA9PiBudW1iZXI7XG4gICAgZGVlcE1ldGVyczogbnVtYmVyO1xuICAgIHNob3JlTWV0ZXJzOiBudW1iZXI7XG4gIH07XG4gIG5hbWU6IHN0cmluZztcbn07XG5cblxuZXhwb3J0IHR5cGUgV2F0ZXJGb3JkQ29uZmlnID0ge1xuICBwYW5zOiBSZWFkb25seUFycmF5PHsgbWluWDogbnVtYmVyOyBtYXhYOiBudW1iZXI7IG1pblo6IG51bWJlcjsgbWF4WjogbnVtYmVyIH0+O1xuICBoYWxmRGVwdGg6IG51bWJlcjtcbiAgc3VyZmFjZVk6IG51bWJlcjtcbiAgZGVwdGg6IG51bWJlcjtcbiAgbmFtZTogc3RyaW5nO1xufTtcblxuXG5leHBvcnQgdHlwZSBXYXRlckNvbmZsdWVuY2VDb25maWcgPSB7XG4gIHBhdGhzOiBSZWFkb25seUFycmF5PFJlYWRvbmx5QXJyYXk8eyB4OiBudW1iZXI7IHo6IG51bWJlcjsgaGFsZldpZHRoOiBudW1iZXI7IGFscGhhOiBudW1iZXIgfT4+O1xuICBzdXJmYWNlWTogbnVtYmVyO1xuICBkZXB0aDogbnVtYmVyO1xuICBuYW1lOiBzdHJpbmc7XG59O1xuXG5cbmNvbnN0IFJJQkJPTl9FREdFX0ZBREVfTUVUUkVTID0gMC4xODtcblxuXG5jb25zdCBDT05GTFVFTkNFX0VER0VfRkFERV9NRVRSRVMgPSAwLjQ1O1xuXG5cbmNvbnN0IFJJQkJPTl9GT0FNX0lOU0VUX01FVFJFUyA9IDAuMTY7XG5cblxuY29uc3QgUklCQk9OX1RJTlQgPSB7IHI6IDAuNzQsIGc6IDEuMCwgYjogMS4xOCB9O1xuXG5cbmNvbnN0IFJJQkJPTl9TRUdNRU5UX01FVFJFUyA9IDAuNDU7XG5cblxuY29uc3QgUklCQk9OX0JFRF9NQVBfV0lEVEggPSAyNTY7XG5cblxuY29uc3QgUklCQk9OX0JFRF9NQVBfSEVJR0hUID0gMTY7XG5cblxuLyoqXG4gKiBBIHJlbmRlci1vbmx5IGxpdmluZy13YXRlciBzdHJpcCB0aGF0IGZvbGxvd3MgYSBzY3VscHRlZCBjaGFubmVsJ3Mgb3duIGNlbnRyZWxpbmUuXG4gKlxuICogVGhlIG1lc2ggaXMgYSBtaXRyZS1qb2luZWQgYmFuZCBvZiB0aGUgU0FNRSBoYWxmLXdpZHRoIHRoZSBzY3VscHQgd2FzIGN1dCBmcm9tLCBsYWlkIGF0XG4gKiB0aGUgbWFzaydzIHdhdGVyIHBsYW5lLCBzbyBpdCBjYW4gbmV2ZXIgY292ZXIgZ3JvdW5kIHRoZSBtYXNrIGNhbGxzIGRyeS4gTm90aGluZyBoZXJlIGlzXG4gKiBzaW11bGF0aW9uOiBiYW5kIGNsYXNzaWZpY2F0aW9uLCBmb3JkcyBhbmQgY3Jvc3NpbmdzIHN0YXkgZW5naW5lIHRydXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2F0ZXJSaWJib24oY29uZmlnOiBXYXRlclJpYmJvbkNvbmZpZyk6IFRIUkVFLk1lc2gge1xuICBjb25zdCBzYW1wbGVzID0gcmliYm9uU2FtcGxlcyhjb25maWcpO1xuICBjb25zdCBnZW9tZXRyeSA9IHJpYmJvbkdlb21ldHJ5KGNvbmZpZywgc2FtcGxlcyk7XG4gIGNvbnN0IGJlZE1hcCA9IGNvbmZpZy5iZWQgPyBiYWtlUmliYm9uQmVkRGVwdGgoc2FtcGxlcywgY29uZmlnLCBjb25maWcuYmVkKSA6IHVuZGVmaW5lZDtcbiAgY29uc3Qgc2hhZGVyVW5pdHNQZXJNZXRyZSA9IDAuOTUgLyBSSUJCT05fRURHRV9GQURFX01FVFJFUztcbiAgY29uc3QgbWF0ZXJpYWwgPSBjcmVhdGVMaXZpbmdXYXRlck1hdGVyaWFsKHtcbiAgICBmb3JkOiBmYWxzZSxcbiAgICAvLyBGb2FtIHJpZGVzIHRoZSBtYXNrJ3Mgb3duIGJhbmsgbGluZTsgdGhlIGZhZGUgcmlkZXMgdGhlIGJsZWQgbWVzaCBlZGdlLlxuICAgIHJpdmVySGFsZldpZHRoOiAoY29uZmlnLmhhbGZXaWR0aCAtIFJJQkJPTl9GT0FNX0lOU0VUX01FVFJFUykgKiBzaGFkZXJVbml0c1Blck1ldHJlLFxuICAgIHZpc3VhbEhhbGZXaWR0aDogKGNvbmZpZy5oYWxmV2lkdGggKyBjb25maWcuZWRnZUJsZWVkKSAqIHNoYWRlclVuaXRzUGVyTWV0cmUsXG4gICAgLy8gVGhlIGVuZHMgYXJlIHNoYXBlZCBieSB2ZXJ0ZXggYWxwaGEgKGVhY2ggY2hhbm5lbCBtZWV0cyB0aGUgdGlsZSBkaWZmZXJlbnRseSksIHNvIHRoZVxuICAgIC8vIHNoYWRlcidzIHN5bW1ldHJpYyB8eHwgbGVuZ3RoIGZhZGUgaXMgcHVzaGVkIG9mZiB0aGUgdGlsZSBpbnN0ZWFkIG9mIGZpZ2h0aW5nIGl0LlxuICAgIGxlbmd0aEhhbGY6IDUxMixcbiAgICBmYWRlU3RhcnQ6IDUxMSxcbiAgICAvLyBBIGJyYWlkJ3MgZm9yZHMgYXJlIHBhbnMgYXQgfHh8PTE2LCBub3QgYSBiYW5kIGF0IHg9MDogdGhlIHNoYXJlZCBmb3JkIHRpbnQgc3RheXMgb2ZmLlxuICAgIGZvcmRIYWxmV2lkdGg6IC0xLFxuICAgIHJpdmVyRGVwdGg6IGNvbmZpZy5kZXB0aCxcbiAgICBmb3JkRGVwdGg6IGNvbmZpZy5kZXB0aCxcbiAgICB3YWRlRGVwdGg6IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGgsXG4gICAgZGVlcERlcHRoOiBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoLFxuICAgIGFuY2hvcnM6IFsuLi5jb25maWcuZ2xpbnRzXSxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHRleHR1cmVCbGVuZDogMCxcbiAgICByaXBwbGVTdHJlbmd0aDogMC4zNCxcbiAgICBiZWREZXB0aDogYmVkTWFwICYmIGNvbmZpZy5iZWQgPyB7XG4gICAgICBtYXA6IGJlZE1hcCxcbiAgICAgIGRlZXBNZXRlcnM6IGNvbmZpZy5iZWQuZGVlcE1ldGVycyxcbiAgICAgIHNob3JlTWV0ZXJzOiBjb25maWcuYmVkLnNob3JlTWV0ZXJzLFxuICAgIH0gOiB1bmRlZmluZWQsXG4gIH0pO1xuICAvLyBSaWJib25zIHJpZGUgT04gYSBzY3VscHQ6IHRoZSBkcnkgcGxhaXQgYmV0d2VlbiB0aGUgY2hhbm5lbHMgaGFzIHRvIG9jY2x1ZGUgdGhlIGZhciBvbmUuXG4gIC8vIFRoYXQgc2FtZSBkZXB0aCB0ZXN0IGlzIHRoZSB3YXRlcidzIHNhZmV0eSBsYXcg4oCUIGEgcmliYm9uIG1heSBvdmVyLXJlYWNoIGl0cyBtYXNrIGJhbmQgYW5kXG4gIC8vIHRoZSBzY3VscHQgY2xpcHMgaXQgYXQgdGhlIGV4YWN0IGNvbnRvdXIgd2hlcmUgdGhlIGJlZCBjcm9zc2VzIHRoZSB3YXRlciBwbGFuZSwgc28gdGhlXG4gIC8vIHdhdGVybGluZSBpcyB0aGUgc2N1bHB0J3Mgb3duIGFuZCB3YXRlciBjYW4gbmV2ZXIgYmUgcGFpbnRlZCBvbnRvIGdyb3VuZCB0aGUgbWFzayBjYWxscyBkcnkuXG4gIG1hdGVyaWFsLmRlcHRoVGVzdCA9IHRydWU7XG4gIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgbWF0ZXJpYWwudmVydGV4Q29sb3JzID0gdHJ1ZTtcbiAgbWF0ZXJpYWwuY29sb3Iuc2V0UkdCKFJJQkJPTl9USU5ULnIsIFJJQkJPTl9USU5ULmcsIFJJQkJPTl9USU5ULmIsIFRIUkVFLkxpbmVhclNSR0JDb2xvclNwYWNlKTtcbiAgbWF0ZXJpYWwucm91Z2huZXNzID0gMC41O1xuICAvLyBUaGUgc2hhcmVkIHJpdmVyIHRpbGVzIGl0cyBmbG93IG1hcCA4eCBhbG9uZyBhIDY0IG0gYmFuZDsgYSA1OCBtIGJyYWlkIGNoYW5uZWwgbmVlZHMgdGhlXG4gIC8vIHNhbWUgfjIuNSBtIHRpbGUgb3IgdGhlIGN1cnJlbnQgc21lYXJzIGludG8gb25lIGZsYXQgc2hlZXQuIFVuaWZvcm0sIG5vdCBzaGFkZXIgc291cmNlLlxuICBjb25zdCB1bmlmb3JtcyA9IG1hdGVyaWFsLnVzZXJEYXRhLndhdGVyVW5pZm9ybXMgYXMgeyByZXBlYXQ6IFRIUkVFLklVbmlmb3JtPG51bWJlcj4gfTtcbiAgdW5pZm9ybXMucmVwZWF0LnZhbHVlID0gTWF0aC5tYXgoNCwgTWF0aC5yb3VuZChzYW1wbGVzW3NhbXBsZXMubGVuZ3RoIC0gMV0hLmRpc3RhbmNlIC8gMi41KSk7XG4gIGlmIChiZWRNYXApIG1hdGVyaWFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Rpc3Bvc2UnLCAoKSA9PiBiZWRNYXAuZGlzcG9zZSgpKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gIG1lc2gubmFtZSA9IGNvbmZpZy5uYW1lO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLnVzZXJEYXRhLnZpc3VhbEhhbGZXaWR0aCA9IGNvbmZpZy5oYWxmV2lkdGg7XG4gIG1lc2gucmVuZGVyT3JkZXIgPSBSZW5kZXJMYXllcnMuZ3JvdW5kRGVjYWxzO1xuICBtZXNoLnJlY2VpdmVTaGFkb3cgPSBmYWxzZTtcbiAgbWVzaC5jYXN0U2hhZG93ID0gZmFsc2U7XG4gIG1lc2guZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICByZXR1cm4gbWVzaDtcbn1cblxuXG4vKiogT25lIHNoYXJlZCBzdXJmYWNlIHdoZXJlIHRoZSB0d28gYnJhaWQgYnJhbmNoZXMgcmVqb2luIGFuZCBsZWF2ZSB0aGUgdGlsZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXYXRlckNvbmZsdWVuY2UoY29uZmlnOiBXYXRlckNvbmZsdWVuY2VDb25maWcpOiBUSFJFRS5NZXNoIHtcbiAgY29uc3QgZ2VvbWV0cnkgPSBjb25mbHVlbmNlR2VvbWV0cnkoY29uZmlnKTtcbiAgY29uc3QgbWF4V2lkdGggPSBNYXRoLm1heCguLi5jb25maWcucGF0aHMuZmxhdE1hcCgocGF0aCkgPT4gcGF0aC5tYXAoKHBvaW50KSA9PiBwb2ludC5oYWxmV2lkdGgpKSk7XG4gIGNvbnN0IHNoYWRlclVuaXRzUGVyTWV0cmUgPSAwLjk1IC8gQ09ORkxVRU5DRV9FREdFX0ZBREVfTUVUUkVTO1xuICBjb25zdCBtYXRlcmlhbCA9IGNyZWF0ZUxpdmluZ1dhdGVyTWF0ZXJpYWwoe1xuICAgIGZvcmQ6IGZhbHNlLFxuICAgIHJpdmVySGFsZldpZHRoOiAobWF4V2lkdGggLSBSSUJCT05fRk9BTV9JTlNFVF9NRVRSRVMpICogc2hhZGVyVW5pdHNQZXJNZXRyZSxcbiAgICB2aXN1YWxIYWxmV2lkdGg6IG1heFdpZHRoICogc2hhZGVyVW5pdHNQZXJNZXRyZSxcbiAgICBsZW5ndGhIYWxmOiA1MTIsXG4gICAgZmFkZVN0YXJ0OiA1MTEsXG4gICAgZm9yZEhhbGZXaWR0aDogLTEsXG4gICAgcml2ZXJEZXB0aDogY29uZmlnLmRlcHRoLFxuICAgIGZvcmREZXB0aDogY29uZmlnLmRlcHRoLFxuICAgIHdhZGVEZXB0aDogQmFsYW5jZS50ZXJyYWluU2ltLndhZGVEZXB0aCxcbiAgICBkZWVwRGVwdGg6IEJhbGFuY2UudGVycmFpblNpbS5kZWVwRGVwdGgsXG4gICAgYW5jaG9yczogW10sXG4gICAgZGVwdGhUZXN0OiBmYWxzZSxcbiAgICBvcGFjaXR5OiAxLFxuICAgIHRleHR1cmVCbGVuZDogMCxcbiAgICByaXBwbGVTdHJlbmd0aDogMC4yNixcbiAgfSk7XG4gIG1hdGVyaWFsLnZlcnRleENvbG9ycyA9IHRydWU7XG4gIG1hdGVyaWFsLmRlcHRoV3JpdGUgPSBmYWxzZTtcbiAgbWF0ZXJpYWwuY29sb3Iuc2V0UkdCKFJJQkJPTl9USU5ULnIsIFJJQkJPTl9USU5ULmcsIFJJQkJPTl9USU5ULmIsIFRIUkVFLkxpbmVhclNSR0JDb2xvclNwYWNlKTtcbiAgbWF0ZXJpYWwucm91Z2huZXNzID0gMC40NjtcbiAgY29uc3QgdW5pZm9ybXMgPSBtYXRlcmlhbC51c2VyRGF0YS53YXRlclVuaWZvcm1zIGFzIHsgcmVwZWF0OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+IH07XG4gIHVuaWZvcm1zLnJlcGVhdC52YWx1ZSA9IE1hdGgubWF4KDQsIE1hdGgucm91bmQoTWF0aC5tYXgoLi4uY29uZmlnLnBhdGhzLm1hcChjZW50cmVsaW5lTGVuZ3RoKSkgLyAyLjUpKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gIG1lc2gubmFtZSA9IGNvbmZpZy5uYW1lO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscztcbiAgbWVzaC5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XG4gIG1lc2guY2FzdFNoYWRvdyA9IGZhbHNlO1xuICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIG1lc2g7XG59XG5cblxuLyoqXG4gKiBUaGUgc2hhbGxvdyBzaGVldCBvdmVyIGEgbWFzaydzIGZvcmQgcmVjdHMg4oCUIHRoZSBjcm9zc2luZyBhIHBsYXllciByZWFkcyBiZWZvcmUgc3RlcHBpbmcuXG4gKlxuICogT25lIG1lc2ggZm9yIGV2ZXJ5IHBhbiBvbiB0aGUgdGlsZSwgY2FycnlpbmcgdGhlIHNoaXBwZWQgZm9yZCB3YXRlciBjb25maWcsIHNvIGEgYnJhaWQnc1xuICogY3Jvc3NpbmdzIHJlYWQgd2V0LWJ1dC1wYXNzYWJsZSBpbnN0ZWFkIG9mIGJyb3duIGdyYXZlbCB3aXRoIGEgc3RyaXBlIG9mIHJpdmVyIHRocm91Z2ggdGhlbS5cbiAqIERlcHRoLXRlc3RlZCBsaWtlIHRoZSBjaGFubmVsIHJpYmJvbnM6IHRoZSBzY3VscHQgY3V0cyB0aGUgd2F0ZXJsaW5lLCBub3QgdGhpcyBnZW9tZXRyeS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZvcmRTaGVldChjb25maWc6IFdhdGVyRm9yZENvbmZpZyk6IFRIUkVFLk1lc2gge1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IHV2czogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChjb25zdCBwYW4gb2YgY29uZmlnLnBhbnMpIHtcbiAgICBjb25zdCBiYXNlID0gcG9zaXRpb25zLmxlbmd0aCAvIDM7XG4gICAgZm9yIChjb25zdCBbeCwgel0gb2YgW1twYW4ubWluWCwgcGFuLm1pblpdLCBbcGFuLm1heFgsIHBhbi5taW5aXSwgW3Bhbi5taW5YLCBwYW4ubWF4Wl0sIFtwYW4ubWF4WCwgcGFuLm1heFpdXSBhcyBjb25zdCkge1xuICAgICAgcG9zaXRpb25zLnB1c2goeCwgY29uZmlnLnN1cmZhY2VZLCB6KTtcbiAgICAgIHV2cy5wdXNoKCh4IC0gcGFuLm1pblgpIC8gTWF0aC5tYXgoMC4wMDEsIHBhbi5tYXhYIC0gcGFuLm1pblgpLCAoeiAtIHBhbi5taW5aKSAvIE1hdGgubWF4KDAuMDAxLCBwYW4ubWF4WiAtIHBhbi5taW5aKSk7XG4gICAgfVxuICAgIGluZGljZXMucHVzaChiYXNlLCBiYXNlICsgMiwgYmFzZSArIDEsIGJhc2UgKyAxLCBiYXNlICsgMiwgYmFzZSArIDMpO1xuICB9XG4gIGNvbnN0IGdlb21ldHJ5ID0gbmV3IFRIUkVFLkJ1ZmZlckdlb21ldHJ5KCk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShwb3NpdGlvbnMsIDMpKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCd1dicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHV2cywgMikpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gIC8vIFRoZSBmb3JkIGJyYW5jaCBvZiB0aGUgc2hhcmVkIHNoYWRlciBhbHJlYWR5IGRvZXMgd2hhdCBhIHBhbiBuZWVkczogaXQgcmVhZHMgYWNyb3NzIGluIFdPUkxEXG4gIC8vIHogKHNvIHZpc3VhbEhhbGZXaWR0aCBpcyB0aGUgcGFuJ3Mgb3duIGhhbGYtZGVwdGgpIGFuZCBmYWRlcyB0aGUgc2hlZXQgYXQgYm90aCBlbmRzIG9mIGl0cyB1dlxuICAvLyBzcGFuLCB3aGljaCBpcyBob3cgdGhlIHNoaXBwZWQgY2VudHJlIGZvcmQgc3RvcHMgZGVhZCBhZ2FpbnN0IGRyeSBncmF2ZWwuXG4gIGNvbnN0IG1hdGVyaWFsID0gY3JlYXRlTGl2aW5nV2F0ZXJNYXRlcmlhbCh7XG4gICAgZm9yZDogdHJ1ZSxcbiAgICByaXZlckhhbGZXaWR0aDogY29uZmlnLmhhbGZEZXB0aCAqIDAuNzIsXG4gICAgdmlzdWFsSGFsZldpZHRoOiBjb25maWcuaGFsZkRlcHRoLFxuICAgIGxlbmd0aEhhbGY6IDUxMixcbiAgICBmYWRlU3RhcnQ6IDUxMSxcbiAgICBmb3JkSGFsZldpZHRoOiBjb25maWcuaGFsZkRlcHRoLFxuICAgIHJpdmVyRGVwdGg6IGNvbmZpZy5kZXB0aCxcbiAgICBmb3JkRGVwdGg6IGNvbmZpZy5kZXB0aCxcbiAgICB3YWRlRGVwdGg6IEJhbGFuY2UudGVycmFpblNpbS53YWRlRGVwdGgsXG4gICAgZGVlcERlcHRoOiBCYWxhbmNlLnRlcnJhaW5TaW0uZGVlcERlcHRoLFxuICAgIGFuY2hvcnM6IFtdLFxuICB9KTtcbiAgbWF0ZXJpYWwuY29sb3Iuc2V0UkdCKFJJQkJPTl9USU5ULnIsIFJJQkJPTl9USU5ULmcsIFJJQkJPTl9USU5ULmIsIFRIUkVFLkxpbmVhclNSR0JDb2xvclNwYWNlKTtcbiAgY29uc3QgbWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdlb21ldHJ5LCBtYXRlcmlhbCk7XG4gIG1lc2gubmFtZSA9IGNvbmZpZy5uYW1lO1xuICBtZXNoLnVzZXJEYXRhLnJlbmRlck9ubHkgPSB0cnVlO1xuICBtZXNoLnJlbmRlck9yZGVyID0gUmVuZGVyTGF5ZXJzLmdyb3VuZERlY2FscztcbiAgbWVzaC5yZWNlaXZlU2hhZG93ID0gZmFsc2U7XG4gIG1lc2guY2FzdFNoYWRvdyA9IGZhbHNlO1xuICBtZXNoLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIG1lc2g7XG59XG5cblxudHlwZSBSaWJib25TYW1wbGUgPSB7IHg6IG51bWJlcjsgejogbnVtYmVyOyBueDogbnVtYmVyOyBuejogbnVtYmVyOyBkaXN0YW5jZTogbnVtYmVyIH07XG5cblxuZnVuY3Rpb24gcmliYm9uU2FtcGxlcyhjb25maWc6IFdhdGVyUmliYm9uQ29uZmlnKTogUmliYm9uU2FtcGxlW10ge1xuICBjb25zdCBjb250cm9scyA9IGNvbmZpZy5wb2ludHMubWFwKChwb2ludCkgPT4gKHsgLi4ucG9pbnQgfSkpO1xuICBjb25zdCBkaXZpc2lvbnMgPSBNYXRoLm1heCgyLCBNYXRoLmNlaWwoY2VudHJlbGluZUxlbmd0aChjb250cm9scykgLyBSSUJCT05fU0VHTUVOVF9NRVRSRVMpKTtcbiAgY29uc3QgcG9pbnRzID0gY29udHJvbHMubGVuZ3RoID09PSAyXG4gICAgPyBBcnJheS5mcm9tKHsgbGVuZ3RoOiBkaXZpc2lvbnMgKyAxIH0sIChfLCBpbmRleCkgPT4gKHtcbiAgICAgICAgeDogbGVycChjb250cm9sc1swXSEueCwgY29udHJvbHNbMV0hLngsIGluZGV4IC8gZGl2aXNpb25zKSxcbiAgICAgICAgejogbGVycChjb250cm9sc1swXSEueiwgY29udHJvbHNbMV0hLnosIGluZGV4IC8gZGl2aXNpb25zKSxcbiAgICAgIH0pKVxuICAgIDogbmV3IFRIUkVFLkNhdG11bGxSb21DdXJ2ZTMoXG4gICAgICAgIGNvbnRyb2xzLm1hcCgocG9pbnQpID0+IG5ldyBUSFJFRS5WZWN0b3IzKHBvaW50LngsIDAsIHBvaW50LnopKSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgICdjZW50cmlwZXRhbCcsXG4gICAgICApLmdldFNwYWNlZFBvaW50cyhkaXZpc2lvbnMpLm1hcCgocG9pbnQpID0+ICh7IHg6IHBvaW50LngsIHo6IHBvaW50LnogfSkpO1xuICBsZXQgZGlzdGFuY2UgPSAwO1xuICBjb25zdCBzYW1wbGVzID0gcG9pbnRzLm1hcCgocG9pbnQsIGluZGV4KSA9PiB7XG4gICAgaWYgKGluZGV4ID4gMCkgZGlzdGFuY2UgKz0gTWF0aC5oeXBvdChwb2ludC54IC0gcG9pbnRzW2luZGV4IC0gMV0hLngsIHBvaW50LnogLSBwb2ludHNbaW5kZXggLSAxXSEueik7XG4gICAgY29uc3QgYmVmb3JlID0gcG9pbnRzW01hdGgubWF4KDAsIGluZGV4IC0gMSldITtcbiAgICBjb25zdCBhZnRlciA9IHBvaW50c1tNYXRoLm1pbihwb2ludHMubGVuZ3RoIC0gMSwgaW5kZXggKyAxKV0hO1xuICAgIGNvbnN0IGxlbmd0aCA9IE1hdGguaHlwb3QoYWZ0ZXIueCAtIGJlZm9yZS54LCBhZnRlci56IC0gYmVmb3JlLnopIHx8IDE7XG4gICAgcmV0dXJuIHsgeDogcG9pbnQueCwgejogcG9pbnQueiwgbng6IC0oYWZ0ZXIueiAtIGJlZm9yZS56KSAvIGxlbmd0aCwgbno6IChhZnRlci54IC0gYmVmb3JlLngpIC8gbGVuZ3RoLCBkaXN0YW5jZSB9O1xuICB9KTtcbiAgY29uc3QgZW5kID0gc2FtcGxlc1tzYW1wbGVzLmxlbmd0aCAtIDFdIS5kaXN0YW5jZSAtIChjb25maWcudGFpbEluc2V0ID8/IDApO1xuICBjb25zdCB0cmltbWVkID0gc2FtcGxlcy5maWx0ZXIoKHNhbXBsZSkgPT4gc2FtcGxlLmRpc3RhbmNlID49IChjb25maWcuaGVhZEluc2V0ID8/IDApICYmIHNhbXBsZS5kaXN0YW5jZSA8PSBlbmQpO1xuICBjb25zdCBzdGFydCA9IHRyaW1tZWRbMF0/LmRpc3RhbmNlID8/IDA7XG4gIHJldHVybiB0cmltbWVkLm1hcCgoc2FtcGxlKSA9PiAoeyAuLi5zYW1wbGUsIGRpc3RhbmNlOiBzYW1wbGUuZGlzdGFuY2UgLSBzdGFydCB9KSk7XG59XG5cblxuZnVuY3Rpb24gcmliYm9uR2VvbWV0cnkoY29uZmlnOiBXYXRlclJpYmJvbkNvbmZpZywgc2FtcGxlczogcmVhZG9ubHkgUmliYm9uU2FtcGxlW10pOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB7XG4gIGNvbnN0IHRvdGFsID0gc2FtcGxlc1tzYW1wbGVzLmxlbmd0aCAtIDFdIS5kaXN0YW5jZSB8fCAxO1xuICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IHV2czogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgY29sb3JzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHNhbXBsZSBvZiBzYW1wbGVzKSB7XG4gICAgY29uc3QgYWxwaGEgPSBNYXRoLm1pbihcbiAgICAgIGNvbmZpZy5oZWFkRmFkZSA+IDAgPyBzbW9vdGhzdGVwKDAsIGNvbmZpZy5oZWFkRmFkZSwgc2FtcGxlLmRpc3RhbmNlKSA6IDEsXG4gICAgICBjb25maWcudGFpbEZhZGUgPiAwID8gc21vb3Roc3RlcCgwLCBjb25maWcudGFpbEZhZGUsIHRvdGFsIC0gc2FtcGxlLmRpc3RhbmNlKSA6IDEsXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IHNpZGUgb2YgWzEsIC0xXSkge1xuICAgICAgY29uc3QgcmVhY2ggPSAoY29uZmlnLmhhbGZXaWR0aCArIGNvbmZpZy5lZGdlQmxlZWQpICogc2lkZTtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHNhbXBsZS54ICsgc2FtcGxlLm54ICogcmVhY2gsIGNvbmZpZy5zdXJmYWNlWSwgc2FtcGxlLnogKyBzYW1wbGUubnogKiByZWFjaCk7XG4gICAgICB1dnMucHVzaChzYW1wbGUuZGlzdGFuY2UgLyB0b3RhbCwgc2lkZSA+IDAgPyAwIDogMSk7XG4gICAgICBjb2xvcnMucHVzaCgxLCAxLCAxLCBhbHBoYSk7XG4gICAgfVxuICB9XG4gIC8vIFdvdW5kIHNvIHRoZSBmYWNlIG5vcm1hbCBpcyArWTogZWFjaCByb3cgaXMgWytvZmZzZXQsIC1vZmZzZXRdIGFuZCB0aGUgbWF0ZXJpYWwgaXMgc2luZ2xlLXNpZGVkLlxuICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBzYW1wbGVzLmxlbmd0aCAtIDE7IHJvdyArPSAxKSB7XG4gICAgY29uc3QgYSA9IHJvdyAqIDI7XG4gICAgaW5kaWNlcy5wdXNoKGEsIGEgKyAyLCBhICsgMSwgYSArIDEsIGEgKyAyLCBhICsgMyk7XG4gIH1cblxuICBjb25zdCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUocG9zaXRpb25zLCAzKSk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgndXYnLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSh1dnMsIDIpKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdjb2xvcicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKGNvbG9ycywgNCkpO1xuICBnZW9tZXRyeS5zZXRJbmRleChpbmRpY2VzKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZVZlcnRleE5vcm1hbHMoKTtcbiAgZ2VvbWV0cnkuY29tcHV0ZUJvdW5kaW5nU3BoZXJlKCk7XG4gIHJldHVybiBnZW9tZXRyeTtcbn1cblxuXG5mdW5jdGlvbiBjb25mbHVlbmNlR2VvbWV0cnkoY29uZmlnOiBXYXRlckNvbmZsdWVuY2VDb25maWcpOiBUSFJFRS5CdWZmZXJHZW9tZXRyeSB7XG4gIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgdXZzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBjb2xvcnM6IG51bWJlcltdID0gW107XG4gIGNvbnN0IGluZGljZXM6IG51bWJlcltdID0gW107XG4gIGZvciAoY29uc3QgcGF0aCBvZiBjb25maWcucGF0aHMpIHtcbiAgICBjb25zdCBiYXNlID0gcG9zaXRpb25zLmxlbmd0aCAvIDM7XG4gICAgY29uc3QgZGlzdGFuY2VzID0gcGF0aC5tYXAoKHBvaW50LCBpbmRleCkgPT4gaW5kZXggPT09IDAgPyAwIDogTWF0aC5oeXBvdChwb2ludC54IC0gcGF0aFtpbmRleCAtIDFdIS54LCBwb2ludC56IC0gcGF0aFtpbmRleCAtIDFdIS56KSk7XG4gICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGRpc3RhbmNlcy5sZW5ndGg7IGluZGV4ICs9IDEpIGRpc3RhbmNlc1tpbmRleF0gKz0gZGlzdGFuY2VzW2luZGV4IC0gMV0hO1xuICAgIGNvbnN0IHRvdGFsID0gZGlzdGFuY2VzW2Rpc3RhbmNlcy5sZW5ndGggLSAxXSB8fCAxO1xuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBwYXRoLmxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBwYXRoW2luZGV4XSE7XG4gICAgICBjb25zdCBiZWZvcmUgPSBwYXRoW01hdGgubWF4KDAsIGluZGV4IC0gMSldITtcbiAgICAgIGNvbnN0IGFmdGVyID0gcGF0aFtNYXRoLm1pbihwYXRoLmxlbmd0aCAtIDEsIGluZGV4ICsgMSldITtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IE1hdGguaHlwb3QoYWZ0ZXIueCAtIGJlZm9yZS54LCBhZnRlci56IC0gYmVmb3JlLnopIHx8IDE7XG4gICAgICBjb25zdCBueCA9IC0oYWZ0ZXIueiAtIGJlZm9yZS56KSAvIGxlbmd0aDtcbiAgICAgIGNvbnN0IG56ID0gKGFmdGVyLnggLSBiZWZvcmUueCkgLyBsZW5ndGg7XG4gICAgICBmb3IgKGNvbnN0IHNpZGUgb2YgWzEsIC0xXSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChwb2ludC54ICsgbnggKiBwb2ludC5oYWxmV2lkdGggKiBzaWRlLCBjb25maWcuc3VyZmFjZVksIHBvaW50LnogKyBueiAqIHBvaW50LmhhbGZXaWR0aCAqIHNpZGUpO1xuICAgICAgICB1dnMucHVzaChkaXN0YW5jZXNbaW5kZXhdISAvIHRvdGFsLCBzaWRlID4gMCA/IDAgOiAxKTtcbiAgICAgICAgY29sb3JzLnB1c2goMSwgMSwgMSwgcG9pbnQuYWxwaGEpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBwYXRoLmxlbmd0aCAtIDE7IHJvdyArPSAxKSB7XG4gICAgICBjb25zdCBhID0gYmFzZSArIHJvdyAqIDI7XG4gICAgICBpbmRpY2VzLnB1c2goYSwgYSArIDIsIGEgKyAxLCBhICsgMSwgYSArIDIsIGEgKyAzKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQnVmZmVyR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkuc2V0QXR0cmlidXRlKCdwb3NpdGlvbicsIG5ldyBUSFJFRS5GbG9hdDMyQnVmZmVyQXR0cmlidXRlKHBvc2l0aW9ucywgMykpO1xuICBnZW9tZXRyeS5zZXRBdHRyaWJ1dGUoJ3V2JywgbmV3IFRIUkVFLkZsb2F0MzJCdWZmZXJBdHRyaWJ1dGUodXZzLCAyKSk7XG4gIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgnY29sb3InLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZShjb2xvcnMsIDQpKTtcbiAgZ2VvbWV0cnkuc2V0SW5kZXgoaW5kaWNlcyk7XG4gIGdlb21ldHJ5LmNvbXB1dGVWZXJ0ZXhOb3JtYWxzKCk7XG4gIGdlb21ldHJ5LmNvbXB1dGVCb3VuZGluZ1NwaGVyZSgpO1xuICByZXR1cm4gZ2VvbWV0cnk7XG59XG5cblxuZnVuY3Rpb24gYmFrZVJpYmJvbkJlZERlcHRoKFxuICBzYW1wbGVzOiByZWFkb25seSBSaWJib25TYW1wbGVbXSxcbiAgY29uZmlnOiBXYXRlclJpYmJvbkNvbmZpZyxcbiAgYmVkOiBOb25OdWxsYWJsZTxXYXRlclJpYmJvbkNvbmZpZ1snYmVkJ10+LFxuKTogVEhSRUUuRGF0YVRleHR1cmUge1xuICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoUklCQk9OX0JFRF9NQVBfV0lEVEggKiBSSUJCT05fQkVEX01BUF9IRUlHSFQpO1xuICBjb25zdCByZWFjaCA9IGNvbmZpZy5oYWxmV2lkdGggKyBjb25maWcuZWRnZUJsZWVkO1xuICBmb3IgKGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBSSUJCT05fQkVEX01BUF9XSURUSDsgY29sdW1uICs9IDEpIHtcbiAgICBjb25zdCBzYW1wbGVJbmRleCA9ICgoY29sdW1uICsgMC41KSAvIFJJQkJPTl9CRURfTUFQX1dJRFRIKSAqIChzYW1wbGVzLmxlbmd0aCAtIDEpO1xuICAgIGNvbnN0IGJlZm9yZSA9IHNhbXBsZXNbTWF0aC5mbG9vcihzYW1wbGVJbmRleCldITtcbiAgICBjb25zdCBhZnRlciA9IHNhbXBsZXNbTWF0aC5taW4oc2FtcGxlcy5sZW5ndGggLSAxLCBNYXRoLmNlaWwoc2FtcGxlSW5kZXgpKV0hO1xuICAgIGNvbnN0IG1peCA9IHNhbXBsZUluZGV4IC0gTWF0aC5mbG9vcihzYW1wbGVJbmRleCk7XG4gICAgY29uc3QgeCA9IGxlcnAoYmVmb3JlLngsIGFmdGVyLngsIG1peCk7XG4gICAgY29uc3QgeiA9IGxlcnAoYmVmb3JlLnosIGFmdGVyLnosIG1peCk7XG4gICAgY29uc3QgbnggPSBsZXJwKGJlZm9yZS5ueCwgYWZ0ZXIubngsIG1peCk7XG4gICAgY29uc3QgbnogPSBsZXJwKGJlZm9yZS5ueiwgYWZ0ZXIubnosIG1peCk7XG4gICAgY29uc3Qgbm9ybWFsTGVuZ3RoID0gTWF0aC5oeXBvdChueCwgbnopIHx8IDE7XG4gICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgUklCQk9OX0JFRF9NQVBfSEVJR0hUOyByb3cgKz0gMSkge1xuICAgICAgY29uc3Qgc2lkZSA9IDEgLSAoKHJvdyArIDAuNSkgLyBSSUJCT05fQkVEX01BUF9IRUlHSFQpICogMjtcbiAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgY29uZmlnLnN1cmZhY2VZIC0gYmVkLmhlaWdodEF0KHggKyAobnggLyBub3JtYWxMZW5ndGgpICogcmVhY2ggKiBzaWRlLCB6ICsgKG56IC8gbm9ybWFsTGVuZ3RoKSAqIHJlYWNoICogc2lkZSkpO1xuICAgICAgZGF0YVtyb3cgKiBSSUJCT05fQkVEX01BUF9XSURUSCArIGNvbHVtbl0gPSBNYXRoLnJvdW5kKFRIUkVFLk1hdGhVdGlscy5jbGFtcChkZXB0aCAvIGJlZC5kZWVwTWV0ZXJzLCAwLCAxKSAqIDI1NSk7XG4gICAgfVxuICB9XG4gIGNvbnN0IHRleHR1cmUgPSBuZXcgVEhSRUUuRGF0YVRleHR1cmUoZGF0YSwgUklCQk9OX0JFRF9NQVBfV0lEVEgsIFJJQkJPTl9CRURfTUFQX0hFSUdIVCwgVEhSRUUuUmVkRm9ybWF0LCBUSFJFRS5VbnNpZ25lZEJ5dGVUeXBlKTtcbiAgdGV4dHVyZS5uYW1lID0gYCR7Y29uZmlnLm5hbWV9LkJlZERlcHRoYDtcbiAgdGV4dHVyZS5tYWdGaWx0ZXIgPSBUSFJFRS5MaW5lYXJGaWx0ZXI7XG4gIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICB0ZXh0dXJlLndyYXBTID0gVEhSRUUuQ2xhbXBUb0VkZ2VXcmFwcGluZztcbiAgdGV4dHVyZS53cmFwVCA9IFRIUkVFLkNsYW1wVG9FZGdlV3JhcHBpbmc7XG4gIHRleHR1cmUuZ2VuZXJhdGVNaXBtYXBzID0gZmFsc2U7XG4gIHRleHR1cmUuY29sb3JTcGFjZSA9IFRIUkVFLk5vQ29sb3JTcGFjZTtcbiAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIHJldHVybiB0ZXh0dXJlO1xufVxuXG5cbmZ1bmN0aW9uIGNlbnRyZWxpbmVMZW5ndGgocG9pbnRzOiBSZWFkb25seUFycmF5PHsgeDogbnVtYmVyOyB6OiBudW1iZXIgfT4pOiBudW1iZXIge1xuICByZXR1cm4gcG9pbnRzLnJlZHVjZSgodG90YWwsIHBvaW50LCBpbmRleCkgPT4gKGluZGV4ID09PSAwID8gMCA6IHRvdGFsICsgTWF0aC5oeXBvdChwb2ludC54IC0gcG9pbnRzW2luZGV4IC0gMV0hLngsIHBvaW50LnogLSBwb2ludHNbaW5kZXggLSAxXSEueikpLCAwKTtcbn1cblxuXG5mdW5jdGlvbiBsZXJwKGZyb206IG51bWJlciwgdG86IG51bWJlciwgbWl4OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gZnJvbSArICh0byAtIGZyb20pICogbWl4O1xufVxuXG5cbmZ1bmN0aW9uIHNtb290aHN0ZXAoZWRnZTA6IG51bWJlciwgZWRnZTE6IG51bWJlciwgdmFsdWU6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IHQgPSBUSFJFRS5NYXRoVXRpbHMuY2xhbXAoKHZhbHVlIC0gZWRnZTApIC8gKGVkZ2UxIC0gZWRnZTApLCAwLCAxKTtcbiAgcmV0dXJuIHQgKiB0ICogKDMgLSAyICogdCk7XG59XG4iXX0=