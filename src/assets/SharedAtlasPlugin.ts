import * as THREE from 'three';
import type { GLTF, GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Full-byte FNV-1a 64, with exact 32-bit limbs (no BigInt allocation per byte). */
export function atlasHash(bytes: Uint8Array): string {
  let high = 0xcbf29ce4;
  let low = 0x84222325;
  for (const byte of bytes) {
    low = (low ^ byte) >>> 0;
    const product = low * 0x1b3;
    high = (high * 0x1b3 + low * 0x100 + Math.floor(product / 0x100000000)) >>> 0;
    low = product >>> 0;
  }
  return high.toString(16).padStart(8, '0') + low.toString(16).padStart(8, '0');
}

type Atlas = {
  key: string;
  promise: Promise<THREE.Texture>;
  texture?: THREE.Texture;
  views: Set<THREE.Texture>;
  pending: number;
};

/** One decode promise / Source per image identity, owned by one canvas tracker. */
export class SharedAtlasCache {
  private readonly atlases = new Map<string, Atlas>();
  private readonly sources = new WeakMap<THREE.Texture['source'], Atlas>();
  private closed = false;

  get size(): number { return this.atlases.size; }

  owns(texture: THREE.Texture): boolean { return this.sources.has(texture.source); }

  async acquire(bytes: Uint8Array, decode: () => Promise<THREE.Texture>): Promise<THREE.Texture> {
    if (this.closed) throw new Error('Shared atlas tracker disposed');
    const key = atlasHash(bytes);
    let atlas = this.atlases.get(key);
    if (!atlas) {
      atlas = { key, promise: Promise.resolve().then(decode), views: new Set(), pending: 0 };
      this.atlases.set(key, atlas);
    }
    atlas.pending++;
    try {
      const texture = await atlas.promise;
      atlas.texture = texture;
      this.sources.set(texture.source, atlas);
      if (this.closed) throw new Error('Shared atlas tracker disposed');
      return this.clone(texture)!;
    } catch (error) {
      if (this.atlases.get(key) === atlas) this.atlases.delete(key);
      throw error;
    } finally {
      atlas.pending--;
      this.releaseUnused(atlas);
    }
  }

  /** Material views isolate sampler, UV and colorSpace state; Source stays shared. */
  clone(texture: THREE.Texture): THREE.Texture | undefined {
    const atlas = this.sources.get(texture.source);
    if (!atlas) return undefined;
    const view = texture.clone();
    atlas.views.add(view);
    const dispose = () => {
      view.removeEventListener('dispose', dispose);
      atlas.views.delete(view);
      this.releaseUnused(atlas);
    };
    view.addEventListener('dispose', dispose);
    return view;
  }

  clear(): void {
    this.closed = true;
    for (const atlas of this.atlases.values()) {
      for (const texture of atlas.views) texture.dispose();
      this.releaseUnused(atlas);
    }
    this.atlases.clear();
  }

  private releaseUnused(atlas: Atlas): void {
    if (atlas.pending || atlas.views.size || !atlas.texture) return;
    if (this.atlases.get(atlas.key) === atlas) this.atlases.delete(atlas.key);
    const texture = atlas.texture;
    atlas.texture = undefined;
    this.sources.delete(texture.source);
    texture.dispose();
    // ImageBitmap owns native memory independently of the WebGL allocation.
    (texture.image as { close?: () => void } | undefined)?.close?.();
  }
}

const FILTERS = {
  9728: THREE.NearestFilter, 9729: THREE.LinearFilter,
  9984: THREE.NearestMipmapNearestFilter, 9985: THREE.LinearMipmapNearestFilter,
  9986: THREE.NearestMipmapLinearFilter, 9987: THREE.LinearMipmapLinearFilter,
} as const;
const WRAPS = { 33071: THREE.ClampToEdgeWrapping, 33648: THREE.MirroredRepeatWrapping, 10497: THREE.RepeatWrapping } as const;

export class SharedAtlasPlugin implements GLTFLoaderPlugin {
  readonly name = 'GR_shared_atlas';
  private readonly intermediates: THREE.Texture[] = [];

  constructor(private readonly parser: GLTFParser, private readonly cache: SharedAtlasCache) {
    // EXT_texture_webp/avif run before custom plugins. They converge here with
    // ordinary PNG/JPEG loads, so compressed production GLBs share the same cache.
    const loadImage = parser.loadTextureImage.bind(parser);
    parser.loadTextureImage = (index, source, loader) => this.loadTexture(index, source, loader) ?? loadImage(index, source, loader);
    const assign = parser.assignTexture.bind(parser);
    parser.assignTexture = async (params, name, definition, colorSpace) => {
      const texture = await assign({}, name, definition, colorSpace);
      if (!texture) return texture;
      const view = cache.clone(texture);
      if (view) {
        view.colorSpace = colorSpace ?? THREE.NoColorSpace;
        const association = parser.associations.get(texture);
        if (association) parser.associations.set(view, association);
      }
      params[name] = view ?? texture;
      return params[name];
    };
  }

  loadTexture(index: number, sourceIndex = this.parser.json.textures[index].source, loader: THREE.Loader = this.parser.textureLoader): Promise<THREE.Texture> | null {
    const { parser, cache } = this;
    const image = parser.json.images?.[sourceIndex];
    // Leave external images and GPU-compressed formats to their native loaders.
    if (image?.bufferView === undefined || !/^image\/(png|jpeg|webp|avif)$/.test(image.mimeType)) return null;
    return parser.getDependency('bufferView', image.bufferView).then(async (buffer: ArrayBuffer) => {
      const texture = await cache.acquire(new Uint8Array(buffer), async () => {
        const bitmapLoader = loader as THREE.ImageBitmapLoader;
        if (!bitmapLoader.isImageBitmapLoader) return parser.loadImageSource(sourceIndex, loader);
        // Embedded bytes are already resident. A second fetch of a blob URL can be
        // cancelled during navigation before the atlas has even reached the decoder.
        const bitmap = await createImageBitmap(new Blob([buffer], { type: image.mimeType }), {
          ...bitmapLoader.options, colorSpaceConversion: 'none',
        });
        const decoded = new THREE.Texture(bitmap);
        decoded.needsUpdate = true;
        return decoded;
      });
      const definition = parser.json.textures[index];
      const sampler = parser.json.samplers?.[definition.sampler] ?? {};
      texture.magFilter = FILTERS[sampler.magFilter as keyof typeof FILTERS] as THREE.MagnificationTextureFilter ?? THREE.LinearFilter;
      texture.minFilter = FILTERS[sampler.minFilter as keyof typeof FILTERS] ?? THREE.LinearMipmapLinearFilter;
      texture.wrapS = WRAPS[sampler.wrapS as keyof typeof WRAPS] ?? THREE.RepeatWrapping;
      texture.wrapT = WRAPS[sampler.wrapT as keyof typeof WRAPS] ?? THREE.RepeatWrapping;
      texture.generateMipmaps = texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter;
      texture.flipY = false;
      texture.name = definition.name || image.name || '';
      texture.userData = { ...image.extras, mimeType: image.mimeType };
      parser.associations.set(texture, { textures: index });
      this.intermediates.push(texture);
      return texture;
    });
  }

  afterRoot(result: GLTF): null {
    // Consumers can replace map slots (the terrain pilot replaces emissiveMap).
    // Material disposal must release those original views as well.
    const materials = new Set<THREE.Material>();
    for (const scene of result.scenes) scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) materials.add(material);
    });
    for (const material of materials) {
      const views = Object.values(material).filter((value): value is THREE.Texture => value?.isTexture === true && this.cache.owns(value));
      const dispose = () => {
        material.removeEventListener('dispose', dispose);
        for (const view of views) view.dispose();
      };
      material.addEventListener('dispose', dispose);
    }
    // assignTexture's final material views now own the image. The parser's
    // temporary views were never uploaded and must not keep the cache alive.
    for (const texture of this.intermediates) texture.dispose();
    this.intermediates.length = 0;
    return null;
  }
}
