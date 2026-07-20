import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { assetSlots, type AssetSlotId } from './slots';

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
  [assetSlots.charE8ScrapCorsair]: new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE8SunGlareShambler]: new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE9FeralTerraformer]: new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.charE9ClaimJumpProspectDrone]: new URL('../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png', import.meta.url).href,
  [assetSlots.nodeGoldSeam]: new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href,
  [assetSlots.terrainBank]: new URL('../../assets/processed/terrain-bank-tile.png', import.meta.url).href,
  [assetSlots.terrainRiver]: new URL('../../assets/processed/terrain-river-tile.png', import.meta.url).href,
};

export const heroPoseFrameFiles = {
  pan: {
    s: Array.from({ length: 8 }, (_, col) => `char-hero-sheet-work8-r0c${col}.png`),
    w: Array.from({ length: 8 }, (_, col) => `char-hero-sheet-work8-r1c${col}.png`),
    e: [0, 1, 2, 4, 5, 6].map((col) => `char-hero-sheet-work8-r2c${col}.png`),
    n: [0, 1, 2, 3, 4, 5, 7].map((col) => `char-hero-sheet-work8-r3c${col}.png`),
  },
  attack: {
    e: [0, 2, 3, 4, 6, 7].map((col) => `char-hero-sheet-attack8-r2c${col}.png`),
  },
} as const;
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

export class GeneratedSpriteBatch {
  readonly group = new THREE.Group();
  readonly material = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
  });

  private readonly sprites: THREE.Sprite[] = [];
  private readonly requestedVisible: boolean[] = [];
  private readonly tintScalars: number[] = [];
  private readonly tintColors: Array<THREE.Color | undefined> = [];
  private loaded = false;
  private loadStarted = false;
  private renderedContribution = 0;
  private disposed = false;

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
    },
  ) {
    this.group.name = options.name;
    for (let i = 0; i < capacity; i += 1) {
      const sprite = new THREE.Sprite(this.material);
      bindWorldSpriteTint(sprite, () => this.tintScalars[i] ?? 1, () => this.tintColors[i]);
      sprite.visible = false;
      sprite.scale.set(options.scale[0], options.scale[1], 1);
      sprite.renderOrder = options.renderOrder ?? RenderLayers.gameplay;
      this.sprites.push(sprite);
      this.requestedVisible.push(false);
      this.tintScalars.push(1);
      this.tintColors.push(undefined);
      this.group.add(sprite);
    }

    if (options.lazy !== true) this.ensureLoaded();
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
    this.material.dispose();
  }

  private syncVisibleSprites(): void {
    for (let i = 0; i < this.sprites.length; i += 1) {
      const sprite = this.sprites[i];
      if (sprite) this.setSpriteVisible(sprite, this.requestedVisible[i] === true);
    }
  }

  private setSpriteVisible(sprite: THREE.Sprite, visible: boolean): void {
    if (sprite.visible === visible) return;
    sprite.visible = visible;
    const delta = visible ? 1 : -1;
    this.renderedContribution = Math.max(0, this.renderedContribution + delta);
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
