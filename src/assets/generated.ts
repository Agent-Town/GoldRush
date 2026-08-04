import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { assetSlots, type AssetSlotId } from './slots';
import characterRuntimeFrames from './character-runtime-frames.json' with { type: 'json' };

const generatedAssetUrls: Partial<Record<AssetSlotId, string>> = {
  [assetSlots.charHero]: new URL('../../assets/processed/hero-homesteader-f.png', import.meta.url).href,
  [assetSlots.charClaimJumper]: new URL('../../assets/processed/enemy-claim-jumper.png', import.meta.url).href,
  [assetSlots.charBanditBase]: new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charBanditThief]: new URL('../../assets/processed/char-bandit-thief-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE2RailTough]: new URL('../../assets/processed/char-railtough-sheet-walk4-a-r0c0.png', import.meta.url).href,
  [assetSlots.charE2SteamWrecker]: new URL('../../assets/processed/char-steamwrecker-sheet-walk4-a-r0c0.png', import.meta.url).href,
  [assetSlots.charE2CoalThief]: new URL('../../assets/processed/char-coalthief-sheet-walk4-a-r0c0.png', import.meta.url).href,
  [assetSlots.charE6FeralToaster]: new URL('../../assets/processed/char-e6-feral_toaster-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE6LawnShepherd]: new URL('../../assets/processed/char-e6-lawn_shepherd-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE6Glowjack]: new URL('../../assets/processed/char-e6-glowjack-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE7RogueAutomaton]: new URL('../../assets/processed/char-e7-rogue_automaton-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE7DataRustler]: new URL('../../assets/processed/char-e7-data_rustler-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE8ScrapCorsair]: new URL('../../assets/processed/char-e8-scrap_corsair-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE8SunGlareShambler]: new URL('../../assets/processed/char-e8-sun_glare_shambler-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE9FeralTerraformer]: new URL('../../assets/processed/char-e9-feral_terraformer-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE9ClaimJumpProspectDrone]: new URL('../../assets/processed/char-e9-claim_jump_prospect_drone-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.nodeGoldSeam]: new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href,
  [assetSlots.terrainBank]: new URL('../../assets/processed/terrain-bank-tile.png', import.meta.url).href,
  [assetSlots.terrainRiver]: new URL('../../assets/processed/terrain-river-tile.png', import.meta.url).href,
};

export const heroPoseFrameFiles = characterRuntimeFrames.heroPoseFrameFiles;
const generatedAssetUrlLoaders: Partial<Record<AssetSlotId, () => Promise<string>>> = {
  [assetSlots.charBaron]: () => import('../../assets/processed/char-baron-sheet-walk8-r0c0.png?url').then((module) => module.default),
  [assetSlots.charTownTavernkeeper]: () => import('../../assets/processed/townsfolk-tavernkeeper.png?url').then((module) => module.default),
  [assetSlots.charTownStorekeeper]: () => import('../../assets/processed/townsfolk-storekeeper.png?url').then((module) => module.default),
  [assetSlots.charTownElder]: () => import('../../assets/processed/townsfolk-elder.png?url').then((module) => module.default),
  [assetSlots.charTownPreacher]: () => import('../../assets/processed/townsfolk-preacher.png?url').then((module) => module.default),
  [assetSlots.charTownSchoolteacher]: () => import('../../assets/processed/townsfolk-schoolteacher.png?url').then((module) => module.default),
  [assetSlots.charTownAssayClerk]: () => import('../../assets/processed/townsfolk-assay-clerk.png?url').then((module) => module.default),
  [assetSlots.charTownYoungsterA]: () => import('../../assets/processed/townsfolk-youngster-a.png?url').then((module) => module.default),
  [assetSlots.charTownYoungsterB]: () => import('../../assets/processed/townsfolk-youngster-b.png?url').then((module) => module.default),
  [assetSlots.propBaronBanner]: () => import('../../assets/processed/prop-baron-banner.png?url').then((module) => module.default),
  [assetSlots.bldSentryBeacon]: () => import('../../assets/processed/bld-sentry-beacon.png?url').then((module) => module.default),
  [assetSlots.bldPortraitPalisade]: () => import('../../assets/processed/bld-palisade.png?url').then((module) => module.default),
  [assetSlots.bldPortraitSluice]: () => import('../../assets/processed/bld-sluice-works.png?url').then((module) => module.default),
  [assetSlots.bldPortraitStockpile]: () => import('../../assets/processed/bld-stockpile-yard.png?url').then((module) => module.default),
  [assetSlots.bldPortraitTurret]: () => import('../../assets/processed/bld-signal-turret.png?url').then((module) => module.default),
};
const processedCharacterUrls = import.meta.glob<string>('../../assets/processed/char-*.png', {
  query: '?url',
  import: 'default',
});
const processedCharacterTextureCache = new Map<string, Promise<THREE.Texture | null>>();
const nonCriticalGeneratedAssetSlots: readonly AssetSlotId[] = [
  assetSlots.bldSentryBeacon,
  assetSlots.bldPortraitPalisade,
  assetSlots.bldPortraitSluice,
  assetSlots.bldPortraitStockpile,
  assetSlots.bldPortraitTurret,
  assetSlots.charBaron,
  assetSlots.propBaronBanner,
  assetSlots.charTownTavernkeeper,
  assetSlots.charTownStorekeeper,
  assetSlots.charTownElder,
  assetSlots.charTownPreacher,
  assetSlots.charTownSchoolteacher,
  assetSlots.charTownAssayClerk,
  assetSlots.charTownYoungsterA,
  assetSlots.charTownYoungsterB,
];

export type GeneratedAssetStatus = 'missing' | 'pending' | 'loaded' | 'error';
export type GeneratedAssetStatusMap = Partial<Record<AssetSlotId, GeneratedAssetStatus>>;

const loader = new THREE.TextureLoader();
const textureCache = new Map<AssetSlotId, Promise<THREE.Texture | null>>();
const status: GeneratedAssetStatusMap = {};
const renderedSprites: Partial<Record<AssetSlotId, number>> = {};
const worldSpriteTint = new THREE.Color('#ffffff');
const spriteTintState = new WeakMap<THREE.SpriteMaterial, { base: THREE.Color; applied: THREE.Color }>();
let assetGeneration = 0;
let startupFramePassed = typeof requestAnimationFrame !== 'function';
let resolveStartupFrame: () => void = () => undefined;
const startupFramePromise = startupFramePassed
  ? Promise.resolve()
  : new Promise<void>((resolve) => {
      resolveStartupFrame = resolve;
    });

export function generatedAssetStatuses(): GeneratedAssetStatusMap {
  return { ...status };
}

export function generatedAssetRenderCounts(): Partial<Record<AssetSlotId, number>> {
  return { ...renderedSprites };
}

export function setWorldSpriteTint(color: THREE.ColorRepresentation): void {
  worldSpriteTint.set(color);
}

export function bindWorldSpriteTint(
  sprite: THREE.Sprite,
  scalar: () => number = () => 1,
  tint: () => THREE.Color | undefined = () => undefined,
): void {
  if (sprite.userData.worldSpriteTintBound === true) return;
  sprite.userData.worldSpriteTintBound = true;
  const beforeRender = sprite.onBeforeRender;
  sprite.onBeforeRender = function (...args): void {
    beforeRender.call(this, ...args);
    const material = this.material as THREE.SpriteMaterial;
    const state = spriteTintState.get(material) ?? {
      base: material.color.clone(),
      applied: material.color.clone(),
    };
    if (!material.color.equals(state.applied)) state.base.copy(material.color);
    material.color.copy(state.base).multiply(tint() ?? worldSpriteTint).multiplyScalar(scalar());
    state.applied.copy(material.color);
    spriteTintState.set(material, state);
  };
}

export function loadGeneratedTexture(slotId: AssetSlotId): Promise<THREE.Texture | null> {
  if (typeof document === 'undefined') {
    status[slotId] = 'missing';
    return Promise.resolve(null);
  }
  if (baronArtDisabledForDebug(slotId)) {
    status[slotId] = 'error';
    return Promise.resolve(null);
  }

  const cached = textureCache.get(slotId);
  if (cached) return cached;

  status[slotId] = 'pending';
  const generation = assetGeneration;
  const promise = waitForStartupSlot(slotId)
    .then(() => resolveGeneratedAssetUrl(slotId))
    .then((url) => {
      if (!url) {
        status[slotId] = 'missing';
        return null;
      }
      return new Promise<THREE.Texture | null>((resolve) => {
        loader.load(
          url,
          (texture) => {
            if (generation !== assetGeneration) {
              texture.dispose();
              resolve(null);
              return;
            }
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            status[slotId] = 'loaded';
            resolve(texture);
          },
          undefined,
          () => {
            if (generation === assetGeneration) status[slotId] = 'error';
            resolve(null);
          },
        );
      });
    });
  textureCache.set(slotId, promise);
  return promise;
}

export function loadProcessedCharacterTexture(file: string): Promise<THREE.Texture | null> {
  const cached = processedCharacterTextureCache.get(file);
  if (cached) return cached;
  const urlLoader = processedCharacterUrls[`../../assets/processed/${file}`];
  const promise = urlLoader
    ? urlLoader().then(
        (url) =>
          new Promise<THREE.Texture | null>((resolve) => {
            loader.load(url, (texture) => {
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.anisotropy = 4;
              resolve(texture);
            }, undefined, () => resolve(null));
          }),
      )
    : Promise.resolve(null);
  processedCharacterTextureCache.set(file, promise);
  return promise;
}

export function clearProcessedCharacterTextureCache(): void {
  processedCharacterTextureCache.clear();
}

export function prefetchNonCriticalGeneratedTextures(): Promise<void> {
  return Promise.all(nonCriticalGeneratedAssetSlots.map((slotId) => loadGeneratedTexture(slotId))).then(() => undefined);
}

export function afterStartupFrame(): Promise<void> {
  return startupFramePassed ? Promise.resolve() : startupFramePromise;
}

export function markStartupFrameReady(): void {
  if (startupFramePassed) return;
  startupFramePassed = true;
  resolveStartupFrame();
}

export function isCriticalStartupAssetSlot(slotId: AssetSlotId): boolean {
  return (
    slotId === assetSlots.charHero ||
    slotId === assetSlots.charClaimJumper ||
    slotId === assetSlots.nodeGoldSeam ||
    slotId === assetSlots.terrainBank ||
    slotId === assetSlots.terrainRiver
  );
}

export function disposeGeneratedAssets(): void {
  assetGeneration += 1;
  for (const promise of textureCache.values()) {
    void promise.then((texture) => texture?.dispose());
  }
  textureCache.clear();
  for (const promise of processedCharacterTextureCache.values()) void promise.then((texture) => texture?.dispose());
  clearProcessedCharacterTextureCache();
  for (const key of Object.keys(status) as AssetSlotId[]) delete status[key];
  for (const key of Object.keys(renderedSprites) as AssetSlotId[]) delete renderedSprites[key];
}

export function applyGeneratedMap(
  material: THREE.MeshStandardMaterial,
  slotId: AssetSlotId,
  configure?: (texture: THREE.Texture) => void,
): void {
  loadGeneratedTexture(slotId).then((texture) => {
    if (!texture) return;
    const previousMap = material.map;
    configure?.(texture);
    material.map = texture;
    material.needsUpdate = true;
    if (previousMap && previousMap !== texture) previousMap.dispose();
  });
}

export type GeneratedSprite = {
  sprite: THREE.Sprite;
  dispose: () => void;
};

export function attachGeneratedSprite(
  parent: THREE.Object3D,
  slotId: AssetSlotId,
  options: {
    name: string;
    position: THREE.Vector3Tuple;
    scale: THREE.Vector2Tuple;
    renderOrder?: number;
    onLoaded?: () => void;
  },
): GeneratedSprite {
  let disposed = false;
  const material = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.35,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = options.name;
  sprite.visible = false;
  sprite.position.set(...options.position);
  sprite.scale.set(options.scale[0], options.scale[1], 1);
  sprite.renderOrder = options.renderOrder ?? RenderLayers.gameplay;
  bindWorldSpriteTint(sprite);
  parent.add(sprite);

  loadGeneratedTexture(slotId).then((texture) => {
    if (!texture || disposed) return;
    material.map = texture;
    material.needsUpdate = true;
    sprite.visible = true;
    renderedSprites[slotId] = 1;
    options.onLoaded?.();
  });

  return {
    sprite,
    dispose: () => {
      disposed = true;
      parent.remove(sprite);
      delete renderedSprites[slotId];
      material.dispose();
    },
  };
}

// ── perf-r2: the instancing that got away ────────────────────────────────────────────────────
// A GeneratedSpriteBatch of N sprites costs N draw calls, because every THREE.Sprite is its own
// Object3D. Measured on Night Shift at 60-enemy pressure that was 60 of 139 calls -- 43% of the
// frame -- to draw 120 triangles. Round 1 instanced it, broke transparent overlap ordering, failed
// pixel equivalence and honestly reverted.
//
// Two facts make the second attempt tractable where the first failed:
//   1. the atlas frame lives on the SHARED material (SpriteAnimator drives one material per batch,
//      and syncSpriteVisuals sets one `material.rotation` per batch), so per-instance UVs are not
//      needed at all -- only a matrix and a tint vary per sprite;
//   2. instances rasterise in index order, so writing them back-to-front by view depth reproduces
//      exactly the painter's order three.js gives individually-sorted sprites.
//
// The shader is three.js's OWN sprite shader, patched at two vertex anchors to read instanceMatrix
// and one fragment anchor to apply the tint. Every other chunk -- map, alphatest, fog, tonemapping,
// colorspace -- is untouched three.js code, which is what makes pixel equivalence reachable.
const SPRITE_ANCHOR_MV = 'vec4 mvPosition = modelViewMatrix[ 3 ];';
const SPRITE_ANCHOR_SCALE = 'vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );';
const SPRITE_ANCHOR_DIFFUSE = 'vec4 diffuseColor = vec4( diffuse, opacity );';

// THE VERDICT, 2026-08-04 (perf-r2 item 1): OPT-IN, i.e. OFF in every shipped boot.
//
// Instancing works and it is -60 draw calls/map, but it collapses a batch into ONE render-list
// item, and three.js sorts render-list items -- not the sprites inside them. The census proves the
// cost is not hypothetical: at renderOrder 2 the per-Sprite arm draws 60 GeneratedClaimJumperSprites
// individually depth-sorted AGAINST EnemyPool (10 calls), GeneratedGoldSeamSprites and
// GeneratedHeroHomesteader; instanced, all 60 land at one depth and can no longer interleave with
// any of them. Sorting instances WITHIN the batch -- which uploadInstances does correctly -- cannot
// restore cross-batch interleaving, because one object can only occupy one place in the queue.
// That is round 1's failure class, surviving at reduced amplitude: it fails the pixel gate on
// mobile the-claim-pressure (1.53% of CSS pixels, mean channel delta 0.50 against a same-build
// reboot control of 0.089% / 0.019) while passing all ten desktop scenes.
//
// Kept behind `?spriteinstancing` rather than deleted: the -60 calls are real and reproducible, and
// the redesign that would make them legal is known -- give every gameplay-renderOrder sprite batch
// ONE shared atlas+material so a single instanced draw contains all of them and cross-batch
// interleaving stops being a question. Until then the shipped path is the per-Sprite path.
// The flag is also the A/B lever: this box swings 6x on background load, so on/off must be measured
// in one window, on one build.
export function spriteInstancingEnabled(): boolean {
  return new URLSearchParams(globalThis.location?.search ?? '').has('spriteinstancing');
}

function instancedSpriteGeometry(): THREE.BufferGeometry {
  // Vertex-for-vertex three.js's own Sprite quad (Sprite.js): same corner order, same UVs, same
  // winding, so front-face culling behaves identically.
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
  ], 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  return geometry;
}

// Kept as a named function so its `toString()` is stable: three.js derives a material's program
// cache key from onBeforeCompile's source, so every instanced batch shares one compiled program
// while plain SpriteMaterials (empty onBeforeCompile) keep their own.
function patchSpriteShaderForInstancing(shader: { vertexShader: string; fragmentShader: string }): void {
  for (const [anchor, where] of [[SPRITE_ANCHOR_MV, 'vertex'], [SPRITE_ANCHOR_SCALE, 'vertex'], [SPRITE_ANCHOR_DIFFUSE, 'fragment']] as const) {
    const source = where === 'vertex' ? shader.vertexShader : shader.fragmentShader;
    // Fail loudly. A silently unpatched shader would draw every instance at the group origin,
    // and a perf change that quietly corrupts the frame is worse than no perf change.
    if (!source.includes(anchor)) throw new Error(`perf-r2 instanced sprite: three.js sprite shader anchor missing: ${anchor}`);
  }
  shader.vertexShader = shader.vertexShader
    .replace(SPRITE_ANCHOR_MV, [
      'mat4 grInstanceModel = modelMatrix * instanceMatrix;',
      'vec4 mvPosition = ( modelViewMatrix * instanceMatrix )[ 3 ];',
      'vGrTint = instanceColor;',
    ].join('\n\t'))
    .replace(SPRITE_ANCHOR_SCALE, 'vec2 scale = vec2( length( grInstanceModel[ 0 ].xyz ), length( grInstanceModel[ 1 ].xyz ) );')
    .replace('void main() {', 'varying vec3 vGrTint;\n\nvoid main() {');
  shader.fragmentShader = shader.fragmentShader
    .replace(SPRITE_ANCHOR_DIFFUSE, `${SPRITE_ANCHOR_DIFFUSE}\n\tdiffuseColor.rgb *= vGrTint;`)
    .replace('void main() {', 'varying vec3 vGrTint;\n\nvoid main() {');
}

export class GeneratedSpriteBatch {
  readonly group = new THREE.Group();
  readonly material = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
  });

  private readonly sprites: THREE.Object3D[] = [];
  private readonly requestedVisible: boolean[] = [];
  private readonly tintScalars: number[] = [];
  private readonly tintColors: Array<THREE.Color | undefined> = [];
  private loaded = false;
  private loadStarted = false;
  private renderedContribution = 0;
  private disposed = false;
  // Non-null only on the instanced path. The proxies in `sprites` stay the public per-index handles
  // (callers reach them through `group.children[i]` to bob and scale them); this mesh is what draws.
  private readonly instancedMesh: THREE.InstancedMesh | null = null;
  private readonly instanceOrder: number[] = [];
  private readonly instanceDepths: number[] = [];

  constructor(
    private readonly slotId: AssetSlotId,
    capacity: number,
    private readonly options: {
      name: string;
      y: number;
      scale: THREE.Vector2Tuple;
      renderOrder?: number;
      onLoaded?: () => void;
      lazy?: boolean;
      // perf-r2: collapse this batch to one draw call. Only legal when nothing varies per sprite
      // except position, scale and tint -- a batch that pushes per-sprite material state (opacity
      // or rotation, as FreedWalkerVfx does) MUST stay on the per-Sprite path.
      instanced?: boolean;
    },
  ) {
    this.group.name = options.name;
    const renderOrder = options.renderOrder ?? RenderLayers.gameplay;
    const instanced = options.instanced === true && spriteInstancingEnabled();
    for (let i = 0; i < capacity; i += 1) {
      const sprite = instanced ? new THREE.Object3D() : new THREE.Sprite(this.material);
      if (sprite instanceof THREE.Sprite) bindWorldSpriteTint(sprite, () => this.tintScalars[i] ?? 1, () => this.tintColors[i]);
      sprite.visible = false;
      sprite.scale.set(options.scale[0], options.scale[1], 1);
      sprite.renderOrder = renderOrder;
      this.sprites.push(sprite);
      this.requestedVisible.push(false);
      this.tintScalars.push(1);
      this.tintColors.push(undefined);
      this.group.add(sprite);
    }

    if (instanced) {
      this.material.onBeforeCompile = patchSpriteShaderForInstancing;
      const mesh = new THREE.InstancedMesh(instancedSpriteGeometry(), this.material, Math.max(1, capacity));
      mesh.name = options.name;
      mesh.renderOrder = renderOrder;
      mesh.count = 0;
      // WebGLRenderer.js:2752 pushes `object.center` into the sprite shader's `center` uniform for
      // ANY SpriteMaterial, but `center` is a property of THREE.Sprite, not of Mesh. Without this
      // the uniform is undefined and the first frame throws. 0.5/0.5 is Sprite's own default.
      Object.assign(mesh, { center: new THREE.Vector2(0.5, 0.5) });
      // Each instance sits at its own world position, so the mesh's own bounds mean nothing.
      mesh.frustumCulled = false;
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, capacity) * 3).fill(1), 3);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      // One callback per frame, not one per sprite: the render pass hands us the camera, which is
      // exactly what the painter's sort needs.
      mesh.onBeforeRender = (_renderer, _scene, camera) => this.uploadInstances(camera);
      this.group.add(mesh);
      this.instancedMesh = mesh;
    }

    if (options.lazy !== true) this.ensureLoaded();
  }

  // Compose, depth-sort and upload every visible instance. Instances rasterise in index order, so
  // writing farthest-first reproduces the back-to-front order three.js gives separate transparent
  // sprites -- the ordering round 1 lost.
  private uploadInstances(camera: THREE.Camera): void {
    const mesh = this.instancedMesh;
    if (!mesh) return;
    const view = camera.matrixWorldInverse.elements;
    this.instanceOrder.length = 0;
    for (let i = 0; i < this.sprites.length; i += 1) {
      const proxy = this.sprites[i]!;
      if (!proxy.visible) continue;
      const world = proxy.matrixWorld.elements;
      // View-space z of the instance origin. The camera looks down -z, so ascending z is
      // farthest-first. This is the same ordering three.js's reversePainterSortStable produces.
      this.instanceDepths[i] = view[2]! * world[12]! + view[6]! * world[13]! + view[10]! * world[14]! + view[14]!;
      this.instanceOrder.push(i);
    }
    this.instanceOrder.sort((a, b) => this.instanceDepths[a]! - this.instanceDepths[b]!);

    const colors = mesh.instanceColor!;
    // Upload only the prefix actually written. With no update range three.js bufferSubData's the
    // WHOLE attribute (BufferAttribute capacity is Balance.enemy.poolSize = 96, so 96*16 floats of
    // matrix per batch per frame), and most batches carry a handful of live enemies at most.
    mesh.instanceMatrix.clearUpdateRanges();
    mesh.instanceMatrix.addUpdateRange(0, this.instanceOrder.length * 16);
    colors.clearUpdateRanges();
    colors.addUpdateRange(0, this.instanceOrder.length * 3);
    for (let slot = 0; slot < this.instanceOrder.length; slot += 1) {
      const index = this.instanceOrder[slot]!;
      // LOCAL matrix: the shader reads `modelMatrix * instanceMatrix`, and modelMatrix is already
      // the group's world matrix. Passing matrixWorld here would apply the group transform twice.
      mesh.setMatrixAt(slot, this.sprites[index]!.matrix);
      // The per-Sprite path multiplied the shared material colour by tint*scalar just before each
      // draw; instanced, that product becomes the per-instance tint and `diffuse` stays the base.
      const tint = this.tintColors[index] ?? worldSpriteTint;
      const scalar = this.tintScalars[index] ?? 1;
      const offset = slot * 3;
      colors.array[offset] = tint.r * scalar;
      colors.array[offset + 1] = tint.g * scalar;
      colors.array[offset + 2] = tint.b * scalar;
    }
    mesh.count = this.instanceOrder.length;
    mesh.instanceMatrix.needsUpdate = true;
    colors.needsUpdate = true;
  }

  ensureLoaded(): void {
    if (this.loadStarted) return;
    this.loadStarted = true;
    loadGeneratedTexture(this.slotId).then((texture) => {
      if (!texture || this.disposed) return;
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.loaded = true;
      this.syncVisibleSprites();
      this.options.onLoaded?.();
    });
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  set(index: number, position: THREE.Vector3, visible: boolean): void {
    const sprite = this.sprites[index];
    if (!sprite) return;
    sprite.position.set(position.x, position.y + this.options.y, position.z);
    this.requestedVisible[index] = visible;
    this.setSpriteVisible(sprite, visible && this.loaded);
  }

  hide(index: number): void {
    const sprite = this.sprites[index];
    if (!sprite) return;
    this.requestedVisible[index] = false;
    this.setSpriteVisible(sprite, false);
  }

  setTintScalar(index: number, scalar: number): void {
    if (index < 0 || index >= this.tintScalars.length) return;
    this.tintScalars[index] = THREE.MathUtils.clamp(scalar, 0, 12);
  }

  setTintColor(index: number, color: THREE.ColorRepresentation | undefined): void {
    if (index < 0 || index >= this.tintColors.length) return;
    if (color === undefined) this.tintColors[index] = undefined;
    else (this.tintColors[index] ??= new THREE.Color()).set(color);
  }

  dispose(): void {
    this.disposed = true;
    this.group.clear();
    // s23 (m2-04 gate fix): subtract only this batch's contribution — two batches share a slot now.
    const remaining = Math.max(0, (renderedSprites[this.slotId] ?? 0) - this.renderedContribution);
    if (remaining === 0) delete renderedSprites[this.slotId];
    else renderedSprites[this.slotId] = remaining;
    this.renderedContribution = 0;
    this.instancedMesh?.geometry.dispose();
    this.material.dispose();
  }

  private syncVisibleSprites(): void {
    for (let i = 0; i < this.sprites.length; i += 1) {
      const sprite = this.sprites[i];
      if (sprite) this.setSpriteVisible(sprite, this.requestedVisible[i] === true);
    }
  }

  private setSpriteVisible(sprite: THREE.Object3D, visible: boolean): void {
    if (sprite.visible === visible) return;
    sprite.visible = visible;
    const delta = visible ? 1 : -1;
    this.renderedContribution = Math.max(0, this.renderedContribution + delta);
    // An InstancedMesh with count 0 issues no draw call, but three.js still walks it into the
    // render list and runs a full setProgram before discovering there is nothing to draw. Most of
    // these batches (one per enemy variant) are empty on any given map, so hiding the empty ones
    // is worth more than it looks: the E1 census counted 29 such phantom batches per frame.
    if (this.instancedMesh) this.instancedMesh.visible = this.renderedContribution > 0;
    const count = Math.max(0, (renderedSprites[this.slotId] ?? 0) + delta);
    if (count === 0) delete renderedSprites[this.slotId];
    else renderedSprites[this.slotId] = count;
  }
}

function baronArtDisabledForDebug(slotId: AssetSlotId): boolean {
  if (slotId !== assetSlots.charBaron && slotId !== assetSlots.propBaronBanner) return false;
  return new URLSearchParams(globalThis.location?.search ?? '').has('nobaronart');
}

function waitForStartupSlot(slotId: AssetSlotId): Promise<void> {
  return isCriticalStartupAssetSlot(slotId) ? Promise.resolve() : afterStartupFrame();
}

function resolveGeneratedAssetUrl(slotId: AssetSlotId): Promise<string | null> {
  const url = generatedAssetUrls[slotId];
  if (url) return Promise.resolve(url);
  const loader = generatedAssetUrlLoaders[slotId];
  return loader ? loader().catch(() => null) : Promise.resolve(null);
}
