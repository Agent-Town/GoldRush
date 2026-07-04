import * as THREE from 'three';
import { assetSlots, type AssetSlotId } from './slots';

const generatedAssetUrls: Partial<Record<AssetSlotId, string>> = {
  [assetSlots.charHero]: new URL('../../assets/processed/hero-homesteader.png', import.meta.url).href,
  [assetSlots.charClaimJumper]: new URL('../../assets/processed/enemy-claim-jumper.png', import.meta.url).href,
  [assetSlots.nodeGoldSeam]: new URL('../../assets/processed/node-gold-seam.png', import.meta.url).href,
  [assetSlots.bldSentryBeacon]: new URL('../../assets/processed/bld-sentry-beacon.png', import.meta.url).href,
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
  sprite.renderOrder = options.renderOrder ?? 1;
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
  private loaded = false;
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
    },
  ) {
    this.group.name = options.name;
    for (let i = 0; i < capacity; i += 1) {
      const sprite = new THREE.Sprite(this.material);
      sprite.visible = false;
      sprite.scale.set(options.scale[0], options.scale[1], 1);
      sprite.renderOrder = options.renderOrder ?? 1;
      this.sprites.push(sprite);
      this.requestedVisible.push(false);
      this.group.add(sprite);
    }

    loadGeneratedTexture(slotId).then((texture) => {
      if (!texture || this.disposed) return;
      this.material.map = texture;
      this.material.needsUpdate = true;
      this.loaded = true;
      this.syncVisibleSprites();
      options.onLoaded?.();
    });
  }

  get isLoaded(): boolean {
    return this.loaded;
  }

  set(index: number, position: THREE.Vector3, visible: boolean): void {
    const sprite = this.sprites[index];
    if (!sprite) return;
    sprite.position.set(position.x, this.options.y, position.z);
    this.requestedVisible[index] = visible;
    sprite.visible = visible && this.loaded;
    this.updateRenderedCount();
  }

  hide(index: number): void {
    const sprite = this.sprites[index];
    if (!sprite) return;
    this.requestedVisible[index] = false;
    sprite.visible = false;
    this.updateRenderedCount();
  }

  dispose(): void {
    this.disposed = true;
    this.group.clear();
    delete renderedSprites[this.slotId];
    this.material.dispose();
  }

  private syncVisibleSprites(): void {
    for (let i = 0; i < this.sprites.length; i += 1) {
      const sprite = this.sprites[i];
      if (sprite) sprite.visible = this.requestedVisible[i] === true;
    }
    this.updateRenderedCount();
  }

  private updateRenderedCount(): void {
    renderedSprites[this.slotId] = this.sprites.filter((sprite) => sprite.visible).length;
  }
}
