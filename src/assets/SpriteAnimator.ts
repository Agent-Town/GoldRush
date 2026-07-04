import * as THREE from 'three';
import characterContractText from '../../assets/layer-contracts/characters.v2.json?raw';
import { loadGeneratedTexture } from './generated';
import {
  coarseOrientationForDirection,
  idleDirectionFor,
  isMirroredRotationDirection,
  isRotationDirection,
  type RotationDirection,
} from './OrientationResolver';
import { type AssetSlotId } from './slots';

export type CharacterSpriteClip = 'idle' | 'walk' | 'hit' | 'pan' | 'flee' | string;

type Contract = {
  slots?: ContractSlot[];
};

type ContractSlot = {
  slot?: string;
  fallback?: { file?: string };
  frames?: FrameSource;
  clips?: Record<string, ClipSource>;
  orientations?: Record<string, OrientationSource>;
  rotations?: {
    directions?: Record<string, OrientationSource>;
    mirrors?: Record<string, string>;
  };
};

type OrientationSource = {
  frames?: FrameSource;
  clips?: Record<string, ClipSource>;
};

type FrameSource = {
  files?: string[];
  grid?: {
    file?: string;
    cols?: number;
    rows?: number;
    order?: string[];
  };
};

type ClipSource = {
  frames?: number[];
  fps?: number;
};

type RuntimeFrame = {
  texture: THREE.Texture;
  key: string;
  offsetX: number;
  offsetY: number;
  repeatX: number;
  repeatY: number;
};

type RuntimeClip = {
  frames: RuntimeFrame[];
  fps: number;
};

type RuntimeOrientation = {
  clips: Map<string, RuntimeClip>;
};

type RuntimeSlot = {
  orientations: Map<string, RuntimeOrientation>;
  rotationDirections: Set<string>;
  rotationMirrors: Map<string, string>;
};

type PickedClip = {
  clip: RuntimeClip;
  direction?: RotationDirection;
  mirrored: boolean;
};

export type SpriteAnimationSnapshot = {
  clip: string;
  frame: number;
  frameKey: string;
  frameCount: number;
  fps: number;
  loaded: boolean;
  direction?: string;
  mirrored?: boolean;
};

export type SpriteStatsSnapshot = {
  activeAnimators: number;
  textureSwapsPerFrame: number;
  fadeOverlaysActive: number;
};

const contract = JSON.parse(characterContractText) as Contract;
const slotContracts = new Map((contract.slots ?? []).map((slot) => [slot.slot, slot]));
const processedTextureUrls = import.meta.glob<string>('../../assets/processed/*.png', {
  query: '?url',
  import: 'default',
});
const processedTextureUrlsByFile = new Map(
  Object.entries(processedTextureUrls).map(([path, urlLoader]) => [path.split('/').pop() ?? path, urlLoader]),
);
const textureLoader = new THREE.TextureLoader();
const processedTextureCache = new Map<string, Promise<THREE.Texture | null>>();
const runtimeCache = new Map<AssetSlotId, Promise<RuntimeSlot | null>>();
const testClipAtlasCache = new Map<string, Promise<RuntimeClip>>();
const animationDiagnostics: Partial<Record<AssetSlotId, SpriteAnimationSnapshot>> = {};
const testClips = new Map<AssetSlotId, { frames: string[]; fps: number }>();
let testClipVersion = 0;
let spriteStatsFrame = -1;
let activeAnimators = 0;
let textureSwapsPerFrame = 0;

export function beginSpriteStatsFrame(frame: number): void {
  if (spriteStatsFrame === frame) return;
  spriteStatsFrame = frame;
  activeAnimators = 0;
  textureSwapsPerFrame = 0;
}

export function spriteAnimationDiagnostics(): Partial<Record<AssetSlotId, SpriteAnimationSnapshot>> {
  return { ...animationDiagnostics };
}

export function spriteStatsDiagnostics(fadeOverlaysActive: number): SpriteStatsSnapshot {
  return {
    activeAnimators,
    textureSwapsPerFrame,
    fadeOverlaysActive,
  };
}

export function setSpriteTestClip(slotId: AssetSlotId, frames: readonly string[], fps: number): void {
  testClips.set(slotId, { frames: [...frames], fps });
  testClipVersion += 1;
}

export class SpriteAnimator {
  private runtime: RuntimeSlot | null = null;
  private runtimeReady = false;
  private clipName = '';
  private frameIndex = 0;
  private frameElapsed = 0;
  private currentClip: RuntimeClip | null = null;
  private seenTestClipVersion = -1;
  private overrideClip: RuntimeClip | null = null;
  private diagnosticDirection: RotationDirection | undefined;
  private diagnosticMirrored: boolean | undefined;
  private lastFrameKey = '';

  constructor(
    private readonly slotId: AssetSlotId,
    private readonly material: THREE.SpriteMaterial,
    private readonly sprite?: THREE.Sprite,
  ) {
    animationDiagnostics[slotId] = {
      clip: 'idle',
      frame: 0,
      frameKey: 'pending',
      frameCount: 0,
      fps: 0,
      loaded: false,
    };
    void loadRuntimeSlot(slotId).then((runtime) => {
      this.runtime = runtime;
      this.runtimeReady = true;
    });
  }

  update(delta: number, requestedClip: CharacterSpriteClip, orientation = 'side', mirrored = false): void {
    this.syncTestClip();
    if (this.sprite) this.sprite.scale.x = Math.abs(this.sprite.scale.x) * (mirrored ? -1 : 1);
    const next = this.pickClip(requestedClip, orientation);
    if (!next) return;

    const nextClip = next.clip;
    const nextMirrored = mirrored || next.mirrored;
    this.diagnosticDirection = next.direction;
    this.diagnosticMirrored = next.direction ? nextMirrored : undefined;
    if (this.sprite) this.sprite.scale.x = Math.abs(this.sprite.scale.x) * (nextMirrored ? -1 : 1);

    if (nextClip !== this.currentClip || requestedClip !== this.clipName) {
      this.currentClip = nextClip;
      this.clipName = requestedClip;
      this.frameIndex = 0;
      this.frameElapsed = 0;
      this.applyFrame();
      return;
    }

    const frameDuration = nextClip.frames.length > 1 && nextClip.fps > 0 ? 1 / nextClip.fps : 0;
    if (frameDuration > 0) {
      this.frameElapsed += delta;
      while (this.frameElapsed >= frameDuration) {
        this.frameElapsed -= frameDuration;
        this.frameIndex = (this.frameIndex + 1) % nextClip.frames.length;
      }
    }
    this.applyFrame();
  }

  reset(clip: CharacterSpriteClip = 'idle'): void {
    this.clipName = '';
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.update(0, clip);
  }

  dispose(): void {
    delete animationDiagnostics[this.slotId];
  }

  private syncTestClip(): void {
    if (this.seenTestClipVersion === testClipVersion) return;
    this.seenTestClipVersion = testClipVersion;
    const testClip = testClips.get(this.slotId);
    this.overrideClip = null;
    this.currentClip = null;
    if (!testClip) return;
    const version = testClipVersion;
    void createTestClip(this.slotId, testClip.frames, testClip.fps).then((clip) => {
      if (this.seenTestClipVersion !== version) return;
      this.overrideClip = clip;
      this.currentClip = null;
    });
  }

  private pickClip(requestedClip: CharacterSpriteClip, orientation: string): PickedClip | null {
    if (this.overrideClip) return { clip: this.overrideClip, mirrored: false };
    if (!this.runtimeReady) return null;
    const runtime = this.runtime;
    if (!runtime) return null;

    const direction = rotationDirectionFor(runtime, orientation);
    if (direction && isLocomotionClip(requestedClip)) {
      const clipDirection = requestedClip === 'idle' ? idleDirectionFor(direction) : direction;
      const sourceDirection = runtime.rotationMirrors.get(clipDirection) ?? clipDirection;
      const clips = runtime.orientations.get(sourceDirection)?.clips;
      const clip = clips?.get(requestedClip) ?? clips?.get('walk') ?? clips?.get('idle') ?? null;
      if (clip) {
        return {
          clip,
          direction: clipDirection,
          mirrored: runtime.rotationMirrors.has(clipDirection),
        };
      }
    }

    const coarseOrientation = direction ? coarseOrientationForDirection(direction) : orientation;
    const clips =
      runtime.orientations.get(coarseOrientation)?.clips ??
      runtime.orientations.get('side')?.clips ??
      runtime.orientations.values().next().value?.clips;
    const clip = clips?.get(requestedClip) ?? clips?.get('walk') ?? clips?.get('idle') ?? null;
    if (!clip) return null;
    return {
      clip,
      direction: direction ?? undefined,
      mirrored: direction ? isMirroredRotationDirection(direction) : false,
    };
  }

  private applyFrame(): void {
    const clip = this.currentClip;
    const frame = clip?.frames[this.frameIndex];
    if (!clip || !frame) return;

    activeAnimators += 1;
    const textureUserData = frame.texture.userData as { spriteFrameKey?: string };
    if (this.lastFrameKey !== frame.key || this.material.map !== frame.texture || textureUserData.spriteFrameKey !== frame.key) {
      frame.texture.repeat.set(frame.repeatX, frame.repeatY);
      frame.texture.offset.set(frame.offsetX, frame.offsetY);
      this.material.map = frame.texture;
      this.material.needsUpdate = true;
      textureUserData.spriteFrameKey = frame.key;
      this.lastFrameKey = frame.key;
      textureSwapsPerFrame += 1;
    }
    const snapshot: SpriteAnimationSnapshot = {
      clip: this.overrideClip ? 'test' : this.clipName,
      frame: this.frameIndex,
      frameKey: frame.key,
      frameCount: clip.frames.length,
      fps: clip.fps,
      loaded: true,
    };
    if (this.diagnosticDirection) {
      snapshot.direction = this.diagnosticDirection;
      snapshot.mirrored = this.diagnosticMirrored ?? false;
    }
    animationDiagnostics[this.slotId] = snapshot;
  }
}

function loadRuntimeSlot(slotId: AssetSlotId): Promise<RuntimeSlot | null> {
  const cached = runtimeCache.get(slotId);
  if (cached) return cached;
  const promise = createRuntimeSlot(slotId);
  runtimeCache.set(slotId, promise);
  return promise;
}

async function createRuntimeSlot(slotId: AssetSlotId): Promise<RuntimeSlot | null> {
  const slot = slotContracts.get(slotId);
  const fallbackTexture = await loadGeneratedTexture(slotId);
  const fallbackClip = fallbackTexture
    ? {
        frames: [singleFrame(fallbackTexture, slot?.fallback?.file ?? slotId)],
        fps: 1,
      }
    : null;
  const orientationSources = slot?.orientations
    ? Object.entries(slot.orientations)
    : [['side', { frames: slot?.frames, clips: slot?.clips }] as const];
  const orientations = new Map<string, RuntimeOrientation>();
  const rotationDirections = new Set<string>();
  const rotationMirrors = new Map<string, string>();

  for (const [name, source] of orientationSources) {
    const orientation = await createRuntimeOrientation(source.frames, source.clips ?? {}, fallbackClip);
    if (orientation) orientations.set(name, orientation);
  }

  for (const [name, source] of Object.entries(slot?.rotations?.directions ?? {})) {
    const direction = name.toLowerCase();
    const orientation = await createRuntimeOrientation(source.frames, source.clips ?? {}, fallbackClip);
    if (orientation) {
      orientations.set(direction, orientation);
      rotationDirections.add(direction);
    }
  }

  for (const [target, source] of Object.entries(slot?.rotations?.mirrors ?? {})) {
    const targetDirection = target.toLowerCase();
    const sourceDirection = source.toLowerCase();
    if (!isRotationDirection(targetDirection) || !isRotationDirection(sourceDirection)) continue;
    rotationDirections.add(targetDirection);
    rotationDirections.add(sourceDirection);
    rotationMirrors.set(targetDirection, sourceDirection);
  }

  if (orientations.size === 0 && fallbackClip) {
    orientations.set('side', { clips: new Map([['idle', fallbackClip], ['walk', fallbackClip]]) });
  }
  return orientations.size > 0 ? { orientations, rotationDirections, rotationMirrors } : null;
}

function rotationDirectionFor(runtime: RuntimeSlot, orientation: string): RotationDirection | null {
  return runtime.rotationDirections.has(orientation) && isRotationDirection(orientation) ? orientation : null;
}

function isLocomotionClip(clip: CharacterSpriteClip): boolean {
  return clip === 'walk' || clip === 'idle';
}

async function createRuntimeOrientation(
  frames: FrameSource | undefined,
  clipSources: Record<string, ClipSource>,
  fallbackClip: RuntimeClip | null,
): Promise<RuntimeOrientation | null> {
  const frameFiles = resolveFrameFiles(frames);
  const frameTextures = await Promise.all(frameFiles.map(loadProcessedTexture));
  const loadedFrames = frameTextures.map((texture, index) => (texture ? { texture, key: frameFiles[index] ?? `frame-${index}` } : null));
  if (loadedFrames.every((frame) => frame === null)) {
    return fallbackClip ? { clips: new Map([['idle', fallbackClip], ['walk', fallbackClip]]) } : null;
  }

  const atlasFrames = createAtlasFrameMap(loadedFrames);
  const clips = new Map<string, RuntimeClip>();
  for (const [name, source] of Object.entries(clipSources)) {
    const indexes = source.frames ?? [0];
    const clipFrames = indexes.map((index) => atlasFrames[index]);
    if (clipFrames.every((frame): frame is RuntimeFrame => !!frame)) clips.set(name, { frames: clipFrames, fps: source.fps ?? 1 });
  }
  // s15 gate fix: an orientation must always resolve idle-or-walk. With mixed-source
  // frame lists (side + side-actions cells) a partial load can drop idle/walk while
  // action clips survive — without this, pickClip() returns null and the sprite
  // freezes on whatever map it had instead of the one-frame billboard fallback.
  if (fallbackClip && !clips.has('idle') && !clips.has('walk')) clips.set('idle', fallbackClip);
  if (clips.size === 0 && atlasFrames[0]) clips.set('idle', { frames: [atlasFrames[0]], fps: 1 });
  return clips.size > 0 ? { clips } : null;
}

function resolveFrameFiles(frames: FrameSource | undefined): string[] {
  if (!frames) return [];
  if (frames.files) return frames.files;
  const grid = frames.grid;
  if (!grid) return [];
  if (grid.order) return grid.order;
  const base = (grid.file ?? '').replace(/\.png$/i, '');
  const cols = Math.max(1, grid.cols ?? 1);
  const rows = Math.max(1, grid.rows ?? 1);
  const files: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) files.push(`${base}-r${row}c${col}.png`);
  }
  return files;
}

function loadProcessedTexture(file: string): Promise<THREE.Texture | null> {
  const cached = processedTextureCache.get(file);
  if (cached) return cached;
  const urlLoader = processedTextureUrlsByFile.get(file);
  if (!urlLoader) return Promise.resolve(null);
  const promise = urlLoader().then(
    (url) =>
      new Promise<THREE.Texture | null>((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            configureTexture(texture);
            resolve(texture);
          },
          undefined,
          () => resolve(null),
        );
      }),
    () => null,
  );
  processedTextureCache.set(file, promise);
  return promise;
}

function createAtlasFrames(frames: Array<{ texture: THREE.Texture; key: string }>): RuntimeFrame[] {
  const firstImage = frames[0]?.texture.image as CanvasImageSource | undefined;
  const width = imageWidth(firstImage);
  const height = imageHeight(firstImage);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height * frames.length;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create sprite atlas context.');

  for (let row = 0; row < frames.length; row += 1) {
    const image = frames[row]?.texture.image as CanvasImageSource | undefined;
    if (image) context.drawImage(image, 0, row * height, width, height);
  }

  const atlas = new THREE.CanvasTexture(canvas);
  configureTexture(atlas);
  return frames.map((frame, row) => ({
    texture: atlas,
    key: frame.key,
    offsetX: 0,
    offsetY: (frames.length - 1 - row) / frames.length,
    repeatX: 1,
    repeatY: 1 / frames.length,
  }));
}

function createAtlasFrameMap(frames: Array<{ texture: THREE.Texture; key: string } | null>): Array<RuntimeFrame | null> {
  const loadedFrames = frames.filter((frame): frame is { texture: THREE.Texture; key: string } => frame !== null);
  const atlasFrames = createAtlasFrames(loadedFrames);
  let atlasIndex = 0;
  return frames.map((frame) => (frame ? atlasFrames[atlasIndex++] ?? null : null));
}

function createTestClip(slotId: AssetSlotId, frameKeys: string[], fps: number): Promise<RuntimeClip> {
  const cacheKey = `${slotId}:${fps}:${frameKeys.join('|')}`;
  const cached = testClipAtlasCache.get(cacheKey);
  if (cached) return cached;

  const promise = createTestClipUncached(frameKeys, fps);
  testClipAtlasCache.set(cacheKey, promise);
  return promise;
}

async function createTestClipUncached(frameKeys: string[], fps: number): Promise<RuntimeClip> {
  const textures = await Promise.all(
    frameKeys.map(async (key) => {
      if (!key.endsWith('.png')) return null;
      const texture = await loadProcessedTexture(key);
      return texture ? { texture, key } : null;
    }),
  );
  const loadedTextures = textures.filter((texture): texture is { texture: THREE.Texture; key: string } => texture !== null);
  if (loadedTextures.length === frameKeys.length && loadedTextures.length > 0) {
    return {
      frames: loadedTextures.length === 1 ? [singleFrame(loadedTextures[0]!.texture, loadedTextures[0]!.key)] : createAtlasFrames(loadedTextures),
      fps,
    };
  }

  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size * Math.max(1, frameKeys.length);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create test sprite atlas context.');
  frameKeys.forEach((color, row) => {
    context.fillStyle = color;
    context.fillRect(0, row * size, size, size);
  });
  const texture = new THREE.CanvasTexture(canvas);
  configureTexture(texture);
  return {
    frames: frameKeys.map((key, row) => ({
      texture,
      key,
      offsetX: 0,
      offsetY: (frameKeys.length - 1 - row) / frameKeys.length,
      repeatX: 1,
      repeatY: 1 / frameKeys.length,
    })),
    fps,
  };
}

function singleFrame(texture: THREE.Texture, key: string): RuntimeFrame {
  configureTexture(texture);
  return {
    texture,
    key,
    offsetX: 0,
    offsetY: 0,
    repeatX: 1,
    repeatY: 1,
  };
}

function configureTexture(texture: THREE.Texture): void {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function imageWidth(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoWidth' in image) return image.videoWidth;
  if ('displayWidth' in image) return image.displayWidth;
  if ('width' in image) return typeof image.width === 'number' ? image.width : image.width.baseVal.value;
  return 512;
}

function imageHeight(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoHeight' in image) return image.videoHeight;
  if ('displayHeight' in image) return image.displayHeight;
  if ('height' in image) return typeof image.height === 'number' ? image.height : image.height.baseVal.value;
  return 512;
}
