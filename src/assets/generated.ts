import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { assetSlots, type AssetSlotId } from './slots';

const generatedAssetUrls: Partial<Record<AssetSlotId, string>> = {
  [assetSlots.charHero]: new URL('../../assets/processed/hero-homesteader.png', import.meta.url).href,
  [assetSlots.charClaimJumper]: new URL('../../assets/processed/enemy-claim-jumper.png', import.meta.url).href,
  [assetSlots.charBaron]: new URL('../../assets/processed/char-baron-sheet-walk4-a-r0c0.png', import.meta.url).href,
  [assetSlots.charTownTavernkeeper]: new URL('../../assets/processed/townsfolk-tavernkeeper.png', import.meta.url).href,
  [assetSlots.charTownStorekeeper]: new URL('../../assets/processed/townsfolk-storekeeper.png', import.meta.url).href,
  [assetSlots.charTownElder]: new URL('../../assets/processed/townsfolk-elder.png', import.meta.url).href,
  [assetSlots.charTownPreacher]: new URL('../../assets/processed/townsfolk-preacher.png', import.meta.url).href,
  [assetSlots.charTownSchoolteacher]: new URL('../../assets/processed/townsfolk-schoolteacher.png', import.meta.url).href,
  [assetSlots.charTownAssayClerk]: new URL('../../assets/processed/townsfolk-assay-clerk.png', import.meta.url).href,
  [assetSlots.charTownYoungsterA]: new URL('../../assets/processed/townsfolk-youngster-a.png', import.meta.url).href,
  [assetSlots.charTownYoungsterB]: new URL('../../assets/processed/townsfolk-youngster-b.png', import.meta.url).href,
  [assetSlots.nodeGoldSeam]: new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href,
  [assetSlots.propBaronBanner]: new URL('../../assets/processed/prop-baron-banner.png', import.meta.url).href,
  [assetSlots.bldSentryBeacon]: new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href,
  [assetSlots.bldPortraitPalisade]: new URL('../../assets/processed/bld-palisade.png', import.meta.url).href,
  [assetSlots.bldPortraitSluice]: new URL('../../assets/processed/bld-sluice-works.png', import.meta.url).href,
  [assetSlots.bldPortraitStockpile]: new URL('../../assets/processed/bld-stockpile-yard.png', import.meta.url).href,
  [assetSlots.bldPortraitTurret]: new URL('../../assets/processed/bld-signal-turret.png', import.meta.url).href,
  [assetSlots.terrainBank]: new URL('../../assets/processed/terrain-bank-tile.png', import.meta.url).href,
  [assetSlots.terrainRiver]: new URL('../../assets/processed/terrain-river-tile.png', import.meta.url).href,
};

export type GeneratedAssetStatus = 'missing' | 'pending' | 'loaded' | 'error';
export type GeneratedAssetStatusMap = Partial<Record<AssetSlotId, GeneratedAssetStatus>>;

const loader = new THREE.TextureLoader();
const textureCache = new Map<AssetSlotId, Promise<THREE.Texture | null>>();
const status: GeneratedAssetStatusMap = {};
const renderedSprites: Partial<Record<AssetSlotId, number>> = {};
let assetGeneration = 0;

export function generatedAssetStatuses(): GeneratedAssetStatusMap {
  return { ...status };
}

export function generatedAssetRenderCounts(): Partial<Record<AssetSlotId, number>> {
  return { ...renderedSprites };
}

export function loadGeneratedTexture(slotId: AssetSlotId): Promise<THREE.Texture | null> {
  if (baronArtDisabledForDebug(slotId)) {
    status[slotId] = 'error';
    return Promise.resolve(null);
  }

  const url = generatedAssetUrls[slotId];
  if (!url) {
    status[slotId] = 'missing';
    return Promise.resolve(null);
  }

  const cached = textureCache.get(slotId);
  if (cached) return cached;

  status[slotId] = 'pending';
  const generation = assetGeneration;
  const promise = new Promise<THREE.Texture | null>((resolve) => {
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
  textureCache.set(slotId, promise);
  return promise;
}

export function disposeGeneratedAssets(): void {
  assetGeneration += 1;
  for (const promise of textureCache.values()) {
    void promise.then((texture) => texture?.dispose());
  }
  textureCache.clear();
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
    alphaTest: 0.04,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = options.name;
  sprite.visible = false;
  sprite.position.set(...options.position);
  sprite.scale.set(options.scale[0], options.scale[1], 1);
  sprite.renderOrder = options.renderOrder ?? RenderLayers.gameplay;
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
      sprite.onBeforeRender = () => {
        this.material.color.setScalar(this.tintScalars[i] ?? 1);
      };
      sprite.visible = false;
      sprite.scale.set(options.scale[0], options.scale[1], 1);
      sprite.renderOrder = options.renderOrder ?? RenderLayers.gameplay;
      this.sprites.push(sprite);
      this.requestedVisible.push(false);
      this.tintScalars.push(1);
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
    this.tintScalars[index] = THREE.MathUtils.clamp(scalar, 0, 1);
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
