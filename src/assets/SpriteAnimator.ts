import * as THREE from 'three';
import characterContractText from '../../assets/layer-contracts/characters.v2.json?raw';
import { Balance } from '../game/Balance';
import { activeEpoch } from '../meta/ContractFamilies';
import { afterStartupFrame, bindWorldSpriteTint, heroPoseFrameFiles, isCriticalStartupAssetSlot, loadGeneratedTexture } from './generated';
import {
  coarseOrientationForDirection,
  idleDirectionFor,
  isMirroredRotationDirection,
  isRotationDirection,
  type RotationDirection,
} from './OrientationResolver';
import { assetSlots, type AssetSlotId } from './slots';
import {
  prospectorSkinSheetFile,
  readHeroSkin,
  readProspectorSkin,
  type HeroSkin,
  type ProspectorSkin,
} from '../game/ProspectorSkin';

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
  walk4?: {
    status?: string;
    enabled?: boolean;
    directions?: Record<string, OrientationSource>;
    mirrors?: Record<string, string>;
    aliases?: Record<string, string>;
  };
  walk8?: WalkSheetSource;
};

type OrientationSource = {
  frames?: FrameSource;
  clips?: Record<string, ClipSource>;
};

type WalkSheetSource = {
  status?: string;
  enabled?: boolean;
  frameCount?: number;
  fps?: number;
  cadenceReferenceFrames?: number;
  grid?: {
    file?: string;
    cols?: number;
    rows?: number;
    rowDirections?: string[];
  };
  aliases?: Record<string, string>;
  directions?: Record<string, WalkSheetDirectionSource>;
  mirrors?: Record<string, string>;
};

type WalkSheetDirectionSource = OrientationSource & {
  row?: number;
};

type HeroAge = 'young' | 'midlife' | 'silver' | 'elder';

type FrameSource = {
  files?: string[];
  diagnosticKeys?: string[];
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
  cadenceReferenceFrames?: number;
};

type RuntimeFrame = {
  texture: THREE.Texture;
  mirroredFrame?: RuntimeFrame;
  independentTexture?: THREE.Texture;
  key: string;
  diagnosticKey?: string;
  offsetX: number;
  offsetY: number;
  repeatX: number;
  repeatY: number;
};

type RuntimeClip = {
  frames: RuntimeFrame[];
  fps: number;
  cadenceReferenceFrames?: number;
};

type RuntimeOrientation = {
  clips: Map<string, RuntimeClip>;
};

type RuntimeSlot = {
  orientations: Map<string, RuntimeOrientation>;
  rotationDirections: Set<string>;
  rotationMirrors: Map<string, string>;
  diagnosticMirrors: Set<string>;
};

type PickedClip = {
  clip: RuntimeClip;
  direction?: RotationDirection;
  mirrored: boolean;
  diagnosticMirrored?: boolean;
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
  fadeActive?: boolean;
  fadeMsRemaining?: number;
  fadeWindow?: number;
  frameBlendActive?: boolean;
  frameBlendMsRemaining?: number;
  frameBlendWindow?: number;
  motionPhase?: number;
  bobOffset?: number;
  leanDeg?: number;
  sourceFrameKey?: string;
  walkFpsPerSpeed?: number;
  strideUnitsPerCycle?: number;
};

export type SpriteStatsSnapshot = {
  activeAnimators: number;
  textureSwapsPerFrame: number;
  fadeOverlaysActive: number;
};

export type SpriteMotionSnapshot = {
  active: boolean;
  phase: number;
  bobOffset: number;
  leanDeg: number;
  leanRad: number;
};

type OverlayKind = 'orientation' | 'frame';

const contract = JSON.parse(characterContractText) as Contract;
const slotContracts = new Map((contract.slots ?? []).map((slot) => [slot.slot, slot]));
const processedTextureUrls = import.meta.glob<string>('../../assets/processed/char-*.png', {
  query: '?url',
  import: 'default',
});
const processedTextureUrlsByFile = new Map(
  Object.entries(processedTextureUrls).map(([path, urlLoader]) => [path.split('/').pop() ?? path, urlLoader]),
);
const textureLoader = new THREE.TextureLoader();
const processedTextureCache = new Map<string, Promise<THREE.Texture | null>>();
const runtimeCache = new Map<string, Promise<RuntimeSlot | null>>();
const testClipAtlasCache = new Map<string, Promise<RuntimeClip>>();
const animationDiagnostics: Partial<Record<AssetSlotId, SpriteAnimationSnapshot>> = {};
const testClips = new Map<AssetSlotId, { frames: string[]; fps: number }>();
let testClipVersion = 0;
let spriteStatsFrame = -1;
let activeAnimators = 0;
let textureSwapsPerFrame = 0;
const nonCriticalSpriteRuntimeSlots: readonly AssetSlotId[] = [assetSlots.charProspectorAgent, assetSlots.charBaron];
const heroAgeByEpochOrder = new Map<number, HeroAge>([
  [1, 'young'],
  [2, 'young'],
  [3, 'young'],
  [4, 'midlife'],
  [5, 'midlife'],
  [6, 'midlife'],
  [7, 'midlife'],
  [8, 'silver'],
  [9, 'silver'],
  [10, 'elder'],
]);

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
  private currentDirection: RotationDirection | undefined;
  private currentMirrored = false;
  private currentFrame: RuntimeFrame | null = null;
  private readonly fadeMaterial: THREE.SpriteMaterial | null = null;
  private readonly fadeSprite: THREE.Sprite | null = null;
  private fadeElapsed = 0;
  private fadeDuration = 0;
  private fadeWindow = 0;
  private frameBlendWindow = 0;
  private overlayKind: OverlayKind | null = null;
  private overlayFrame: RuntimeFrame | null = null;
  private overlayFrameIndex = 0;
  private frameBlendHoldoff = 0;
  private lastFrameKey = '';
  private walkFrameIndex = 0;
  private walkFrameElapsed = 0;
  private walkCadenceSpeed: number | undefined;
  private walkGroundSpeed: number | undefined;

  constructor(
    private readonly slotId: AssetSlotId,
    private readonly material: THREE.SpriteMaterial,
    private readonly sprite?: THREE.Sprite,
    fadeMaterial?: THREE.SpriteMaterial,
  ) {
    if (sprite) bindWorldSpriteTint(sprite);
    animationDiagnostics[slotId] = {
      clip: 'idle',
      frame: 0,
      frameKey: 'pending',
      frameCount: 0,
      fps: 0,
      loaded: false,
    };
    if (fadeMaterial) {
      fadeMaterial.transparent = true;
      fadeMaterial.alphaTest = 0.04;
      fadeMaterial.depthWrite = false;
      fadeMaterial.opacity = 0;
      this.fadeMaterial = fadeMaterial;
    } else if (sprite?.parent) {
      this.fadeMaterial = new THREE.SpriteMaterial({
        transparent: true,
        alphaTest: 0.35,
        depthWrite: false,
        opacity: 0,
      });
      this.fadeSprite = new THREE.Sprite(this.fadeMaterial);
      this.fadeSprite.name = `${sprite.name}Fade`;
      this.fadeSprite.visible = false;
      this.fadeSprite.position.copy(sprite.position);
      this.fadeSprite.scale.copy(sprite.scale);
      this.fadeSprite.renderOrder = sprite.renderOrder + 0.01;
      bindWorldSpriteTint(this.fadeSprite);
      sprite.parent.add(this.fadeSprite);
    }
    const wait = isCriticalStartupAssetSlot(slotId) ? Promise.resolve() : afterStartupFrame();
    void wait.then(() => loadRuntimeSlot(slotId)).then((runtime) => {
      this.runtime = runtime;
      this.runtimeReady = true;
    });
  }

  get overlayActive(): boolean {
    return this.overlayKind !== null;
  }

  get motion(): SpriteMotionSnapshot {
    return this.currentMotion();
  }

  update(
    delta: number,
    requestedClip: CharacterSpriteClip,
    orientation = 'side',
    mirrored = false,
    walkCadenceSpeed?: number,
    walkGroundSpeed?: number,
  ): void {
    this.syncTestClip();
    this.walkCadenceSpeed = Number.isFinite(walkCadenceSpeed) ? Math.max(0, Number(walkCadenceSpeed)) : undefined;
    this.walkGroundSpeed = Number.isFinite(walkGroundSpeed) ? Math.max(0, Number(walkGroundSpeed)) : undefined;
    this.updateFade(delta);
    if (this.frameBlendHoldoff > 0) this.frameBlendHoldoff = Math.max(0, this.frameBlendHoldoff - delta);
    const next = this.pickClip(requestedClip, orientation);
    if (!next) return;

    const nextClip = next.clip;
    const nextMirrored = mirrored || next.mirrored;
    const previousMirrored = this.currentMirrored;
    const clipChanged = nextClip !== this.currentClip;
    const semanticClipChanged = requestedClip !== this.clipName;
    const orientationChanged = next.direction !== this.currentDirection || nextMirrored !== this.currentMirrored;
    if (clipChanged || semanticClipChanged || orientationChanged) {
      const previousFrame = this.currentFrame;
      this.restoreFrameCursor(nextClip, requestedClip, semanticClipChanged);
      const nextFrameIndex = this.frameIndex;
      const nextFrame = nextClip.frames[nextFrameIndex] ?? null;
      this.currentClip = nextClip;
      this.clipName = requestedClip;
      this.currentDirection = next.direction;
      this.currentMirrored = nextMirrored;
      this.diagnosticDirection = next.direction;
      this.diagnosticMirrored = next.direction ? (next.diagnosticMirrored ?? nextMirrored) : undefined;
      this.setSpriteScalePositive();
      // s27 (healthy-VM sweep): fade ONLY on orientation swaps -- the tasks/010
      // mandate is "crossfade between outgoing/incoming orientation cells". Pure
      // clip changes (incl. test clips) keep the pre-vp-02c hard cut; fading them
      // pinned freshly-retired clip textures in the overlay material and re-uploaded
      // disposed textures on fps-luck (memory canary +1, reviews/s27-healthy-vm-sweep.md).
      this.clearOverlay();
      const fps = this.frameBlendHoldoffFps(nextClip, requestedClip);
      const frameDuration = nextClip.frames.length > 1 && fps > 0 ? 1 / fps : 0;
      if (frameDuration > 0) {
        const holdoffFrames = semanticClipChanged ? 4 : orientationChanged ? 9 : 1;
        this.frameBlendHoldoff = Math.max(this.frameBlendHoldoff, frameDuration * holdoffFrames);
      }
      if (orientationChanged) {
        this.startOrientationFade(previousFrame, nextFrame, previousMirrored);
      }
      this.applyFrame();
      return;
    }

    this.diagnosticDirection = next.direction;
    this.diagnosticMirrored = next.direction ? (next.diagnosticMirrored ?? nextMirrored) : undefined;
    this.currentDirection = next.direction;
    this.currentMirrored = nextMirrored;
    this.setSpriteScalePositive();

    const fps = this.effectiveFps(nextClip, requestedClip);
    const frameDuration = nextClip.frames.length > 1 && fps > 0 ? 1 / fps : 0;
    if (frameDuration > 0) {
      this.frameElapsed += delta;
      const previousFrame = this.currentFrame;
      const previousFrameIndex = this.frameIndex;
      let advanced = false;
      while (this.frameElapsed >= frameDuration) {
        this.frameElapsed -= frameDuration;
        this.frameIndex = (this.frameIndex + 1) % nextClip.frames.length;
        advanced = true;
      }
      if (advanced) this.startFrameBlend(previousFrame, nextClip.frames[this.frameIndex] ?? null, previousFrameIndex);
    }
    this.applyFrame();
  }

  reset(clip: CharacterSpriteClip = 'idle'): void {
    this.clipName = '';
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.walkFrameIndex = 0;
    this.walkFrameElapsed = 0;
    this.walkCadenceSpeed = undefined;
    this.walkGroundSpeed = undefined;
    this.currentFrame = null;
    this.currentDirection = undefined;
    this.currentMirrored = false;
    this.clearOverlay();
    this.update(0, clip);
  }

  dispose(): void {
    this.fadeSprite?.parent?.remove(this.fadeSprite);
    this.fadeMaterial?.dispose();
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
    if (direction) {
      const clipDirection = requestedClip === 'idle' ? idleDirectionFor(direction) : direction;
      const hasExplicitDirection = runtime.orientations.has(clipDirection);
      const sourceDirection = hasExplicitDirection ? clipDirection : runtime.rotationMirrors.get(clipDirection) ?? clipDirection;
      const clips = runtime.orientations.get(sourceDirection)?.clips;
      const clip = clips?.get(requestedClip) ?? clips?.get('walk') ?? clips?.get('idle') ?? null;
      if (clip) {
        const diagnosticMirrored = runtime.diagnosticMirrors.has(clipDirection) || (!hasExplicitDirection && runtime.rotationMirrors.has(clipDirection));
        return {
          clip,
          direction: clipDirection,
          mirrored: !hasExplicitDirection && runtime.rotationMirrors.has(clipDirection),
          diagnosticMirrored,
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
    const resolved = this.currentMirrored ? mirroredRuntimeFrame(frame) : frame;
    const resolvedKey = this.currentMirrored ? `${frame.key}#m` : frame.key;
    const textureUserData = resolved.texture.userData as { spriteFrameKey?: string };
    if (this.lastFrameKey !== resolvedKey || this.material.map !== resolved.texture || textureUserData.spriteFrameKey !== resolvedKey) {
      applyRuntimeFrame(this.material, frame, this.currentMirrored);
      textureUserData.spriteFrameKey = resolvedKey;
      this.lastFrameKey = resolvedKey;
      textureSwapsPerFrame += 1;
    }
    this.currentFrame = frame;
    const dominantFrame = this.dominantFrame(frame, this.frameIndex);
    const motion = this.currentMotion();
    if (this.fadeMaterial) this.fadeMaterial.rotation = motion.leanRad;
    const snapshot: SpriteAnimationSnapshot = {
      clip: this.overrideClip ? 'test' : this.clipName,
      frame: dominantFrame.index,
      frameKey: dominantFrame.frame.diagnosticKey ?? dominantFrame.frame.key,
      frameCount: clip.frames.length,
      fps: this.effectiveFps(clip, this.clipName),
      loaded: true,
    };
    if (this.fadeMaterial) {
      const enumerable = this.fadeSprite !== null;
      const overlayActive = this.overlayKind !== null;
      const frameBlendActive = this.overlayKind === 'frame';
      const frameBlendEnumerable = frameBlendActive;
      addDiagnostic(snapshot, 'fadeActive', overlayActive, enumerable);
      addDiagnostic(snapshot, 'fadeMsRemaining', overlayActive ? Math.max(0, (this.fadeDuration - this.fadeElapsed) * 1000) : 0, enumerable);
      addDiagnostic(snapshot, 'fadeWindow', this.fadeWindow, enumerable);
      addDiagnostic(snapshot, 'frameBlendActive', frameBlendActive, frameBlendEnumerable);
      addDiagnostic(snapshot, 'frameBlendMsRemaining', frameBlendActive ? Math.max(0, (this.fadeDuration - this.fadeElapsed) * 1000) : 0, frameBlendEnumerable);
      addDiagnostic(snapshot, 'frameBlendWindow', this.frameBlendWindow, frameBlendEnumerable);
    }
    addDiagnostic(snapshot, 'motionPhase', motion.phase, false);
    addDiagnostic(snapshot, 'bobOffset', motion.bobOffset, false);
    addDiagnostic(snapshot, 'leanDeg', motion.leanDeg, false);
    addDiagnostic(snapshot, 'sourceFrameKey', frame.key, false);
    addDiagnostic(snapshot, 'walkFpsPerSpeed', this.walkFpsPerSpeed(), false);
    addDiagnostic(snapshot, 'strideUnitsPerCycle', this.strideUnitsPerCycle(clip), false);
    if (this.diagnosticDirection) {
      snapshot.direction = this.diagnosticDirection;
      snapshot.mirrored = this.diagnosticMirrored ?? false;
    }
    animationDiagnostics[this.slotId] = snapshot;
    this.rememberWalkCursor();
  }

  private setSpriteScalePositive(): void {
    if (!this.sprite) return;
    // THREE.Sprite billboarding derives scale from vector length, so scale.x's sign
    // is not a reliable mirror. Keep transform scale positive; UV flip below owns it.
    this.sprite.scale.x = Math.abs(this.sprite.scale.x);
  }

  private startOrientationFade(previousFrame: RuntimeFrame | null, nextFrame: RuntimeFrame | null, previousMirrored: boolean): void {
    if (!this.startOverlay('orientation', previousFrame, nextFrame, previousMirrored, Balance.sprite.orientationFadeMs, this.frameIndex)) return;
    this.fadeWindow += 1;
  }

  private startFrameBlend(previousFrame: RuntimeFrame | null, nextFrame: RuntimeFrame | null, previousFrameIndex: number): void {
    if (this.overlayKind === 'orientation') return;
    if (this.frameBlendHoldoff > 0) return;
    if (!this.startOverlay('frame', previousFrame, nextFrame, this.currentMirrored, Balance.anim.frameBlendMs, previousFrameIndex)) return;
    this.frameBlendWindow += 1;
  }

  private startOverlay(
    kind: OverlayKind,
    previousFrame: RuntimeFrame | null,
    nextFrame: RuntimeFrame | null,
    previousMirrored: boolean,
    durationMs: number,
    previousFrameIndex: number,
  ): boolean {
    if (!previousFrame || !nextFrame || !this.fadeMaterial || durationMs <= 0) return false;
    applyRuntimeFrame(this.fadeMaterial, previousFrame, previousMirrored, true);
    if (this.fadeSprite) {
      this.fadeSprite.position.copy(this.sprite?.position ?? this.fadeSprite.position);
      this.fadeSprite.scale.copy(this.sprite?.scale ?? this.fadeSprite.scale);
      this.fadeSprite.visible = true;
    }
    this.fadeElapsed = 0;
    this.fadeDuration = durationMs / 1000;
    this.overlayKind = kind;
    this.overlayFrame = previousFrame;
    this.overlayFrameIndex = previousFrameIndex;
    this.fadeMaterial.opacity = 1;
    return true;
  }

  private updateFade(delta: number): void {
    if (!this.fadeMaterial || !this.overlayKind) return;
    this.fadeElapsed += delta;
    const t = this.fadeDuration > 0 ? this.fadeElapsed / this.fadeDuration : 1;
    if (t >= 1) {
      if (this.fadeSprite) this.fadeSprite.visible = false;
      this.fadeMaterial.opacity = 0;
      // s27: release the outgoing frame's texture at fade end -- a pinned map keeps
      // retired textures re-uploadable (renderer.memory churn) and blocks GC.
      this.fadeMaterial.map = null;
      this.fadeMaterial.needsUpdate = true;
      this.overlayKind = null;
      this.overlayFrame = null;
      return;
    }
    this.fadeMaterial.opacity = 1 - t;
  }

  private clearOverlay(): void {
    if (this.fadeSprite) this.fadeSprite.visible = false;
    if (this.fadeMaterial) {
      this.fadeMaterial.opacity = 0;
      this.fadeMaterial.map = null;
      this.fadeMaterial.needsUpdate = true;
    }
    this.overlayKind = null;
    this.overlayFrame = null;
    this.frameBlendHoldoff = 0;
  }

  private dominantFrame(frame: RuntimeFrame, frameIndex: number): { frame: RuntimeFrame; index: number } {
    if (this.overlayKind === 'frame' && this.fadeMaterial && this.fadeMaterial.opacity > 0.5 && this.overlayFrame) {
      return { frame: this.overlayFrame, index: this.overlayFrameIndex };
    }
    return { frame, index: frameIndex };
  }

  private effectiveFps(clip: RuntimeClip, clipName: CharacterSpriteClip): number {
    const walkFps = Number(Balance.anim.walkFps);
    if (!this.overrideClip && this.usesGaitCadence(clipName) && walkFps > 0) {
      return this.walkFpsForSlot(walkFps, clipName) * cadenceFrameScale(clip);
    }
    return clip.fps;
  }

  private walkFpsForSlot(fallback: number, clipName: CharacterSpriteClip): number {
    const speed = this.walkSpeedForSlot();
    const fpsPerSpeed = this.walkFpsPerSpeed();
    const minimum = Number(Balance.anim.walkMinFps) || 0;
    if (speed <= 0 || fpsPerSpeed <= 0) {
      if (this.walkCadenceSpeed === undefined) return fallback;
      return clipName === 'grab' ? minimum : 0;
    }
    return Math.max(minimum, speed * fpsPerSpeed);
  }

  private frameBlendHoldoffFps(clip: RuntimeClip, clipName: CharacterSpriteClip): number {
    const fps = this.effectiveFps(clip, clipName);
    const baseWalkFps = !this.overrideClip && clipName === 'walk' ? Number(Balance.anim.walkFps) || 0 : 0;
    return Math.max(fps, baseWalkFps);
  }

  private walkFpsPerSpeed(): number {
    return Number(Balance.anim.walkFpsPerSpeed) || 0;
  }

  private usesGaitCadence(clipName: CharacterSpriteClip): boolean {
    return isGaitClip(clipName) && !(this.slotId === assetSlots.charBaron && clipName !== 'walk');
  }

  private walkSpeedForSlot(): number {
    if (this.walkCadenceSpeed !== undefined) return this.walkCadenceSpeed;
    if (this.slotId === assetSlots.charHero) return Balance.hero.speed;
    if (this.slotId === assetSlots.charClaimJumper || this.slotId === assetSlots.charBaron) return Balance.enemy.speed;
    return 0;
  }

  private strideUnitsPerCycle(clip: RuntimeClip): number {
    const speed = this.walkGroundSpeed ?? this.walkSpeedForSlot();
    const fps = this.effectiveFps(clip, this.clipName);
    return speed > 0 && fps > 0 && clip.frames.length > 0 ? speed / (fps / clip.frames.length) : 0;
  }

  private restoreFrameCursor(nextClip: RuntimeClip, requestedClip: CharacterSpriteClip, semanticClipChanged: boolean): void {
    const frameCount = nextClip.frames.length;
    if (frameCount <= 0) {
      this.frameIndex = 0;
      this.frameElapsed = 0;
      return;
    }
    if (!semanticClipChanged) {
      this.frameIndex = this.frameIndex % frameCount;
      this.frameElapsed = this.clampedFrameElapsed(nextClip, requestedClip, this.frameElapsed);
      return;
    }
    if (requestedClip === 'walk') {
      this.frameIndex = this.walkFrameIndex % frameCount;
      this.frameElapsed = this.clampedFrameElapsed(nextClip, requestedClip, this.walkFrameElapsed);
      return;
    }
    this.frameIndex = 0;
    this.frameElapsed = 0;
  }

  private clampedFrameElapsed(clip: RuntimeClip, clipName: CharacterSpriteClip, elapsed: number): number {
    const fps = this.effectiveFps(clip, clipName);
    const frameDuration = clip.frames.length > 1 && fps > 0 ? 1 / fps : 0;
    return frameDuration > 0 ? Math.min(Math.max(0, elapsed), frameDuration * 0.999) : 0;
  }

  private rememberWalkCursor(): void {
    if (this.clipName !== 'walk') return;
    this.walkFrameIndex = this.frameIndex;
    this.walkFrameElapsed = this.frameElapsed;
  }

  private currentMotion(): SpriteMotionSnapshot {
    const clip = this.currentClip;
    const fps = clip ? this.effectiveFps(clip, this.clipName) : 0;
    const frameCount = clip?.frames.length ?? 0;
    const frameDuration = frameCount > 1 && fps > 0 ? 1 / fps : 0;
    const localPhase = frameDuration > 0 ? THREE.MathUtils.clamp(this.frameElapsed / frameDuration, 0, 1) : 0;
    const phase = frameCount > 1 ? ((this.frameIndex + localPhase) % frameCount) / frameCount : 0;
    const bobAmp = Number(Balance.anim.bobAmp);
    const leanKnob = Number(Balance.anim.leanDeg);
    const active = this.clipName === 'walk' && frameCount > 1 && (bobAmp !== 0 || leanKnob !== 0);
    const bobOffset = active ? ((1 - Math.cos(phase * Math.PI * 4)) / 2) * bobAmp : 0;
    const leanDeg = active ? Math.sin(phase * Math.PI * 2) * leanKnob : 0;
    return { active, phase, bobOffset, leanDeg, leanRad: THREE.MathUtils.degToRad(leanDeg) };
  }
}

function applyRuntimeFrame(material: THREE.SpriteMaterial, frame: RuntimeFrame, mirrored = false, independent = false): void {
  const nextFrame = mirrored ? mirroredRuntimeFrame(frame) : frame;
  const texture = independent ? independentTextureFor(nextFrame) : nextFrame.texture;
  if (!independent) {
    texture.repeat.set(nextFrame.repeatX, nextFrame.repeatY);
    texture.offset.set(nextFrame.offsetX, nextFrame.offsetY);
  }
  if (material.map !== texture) {
    material.map = texture;
    material.needsUpdate = true;
  }
}

function independentTextureFor(frame: RuntimeFrame): THREE.Texture {
  if (frame.independentTexture) return frame.independentTexture;
  const texture = frame.texture.clone();
  configureTexture(texture);
  texture.repeat.set(frame.repeatX, frame.repeatY);
  texture.offset.set(frame.offsetX, frame.offsetY);
  texture.needsUpdate = true;
  frame.independentTexture = texture;
  return texture;
}

function addDiagnostic<K extends keyof SpriteAnimationSnapshot>(
  snapshot: SpriteAnimationSnapshot,
  key: K,
  value: SpriteAnimationSnapshot[K],
  enumerable: boolean,
): void {
  Object.defineProperty(snapshot, key, {
    value,
    enumerable,
    configurable: true,
    writable: true,
  });
}

function mirroredRuntimeFrame(frame: RuntimeFrame): RuntimeFrame {
  if (frame.mirroredFrame) return frame.mirroredFrame;
  const image = frame.texture.image as CanvasImageSource | undefined;
  const sourceWidth = imageWidth(image);
  const sourceHeight = imageHeight(image);
  const sx = Math.max(0, Math.round(frame.offsetX * sourceWidth));
  const sy = Math.max(0, Math.round(sourceHeight - (frame.offsetY + frame.repeatY) * sourceHeight));
  const sw = Math.max(1, Math.round(frame.repeatX * sourceWidth));
  const sh = Math.max(1, Math.round(frame.repeatY * sourceHeight));
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const context = canvas.getContext('2d');
  if (!context || !image) throw new Error('Could not create mirrored sprite frame.');
  context.translate(sw, 0);
  context.scale(-1, 1);
  context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  const texture = new THREE.CanvasTexture(canvas);
  configureTexture(texture);
  frame.mirroredFrame = {
    texture,
    key: frame.key,
    diagnosticKey: frame.diagnosticKey,
    offsetX: 0,
    offsetY: 0,
    repeatX: 1,
    repeatY: 1,
  };
  return frame.mirroredFrame;
}

function loadRuntimeSlot(slotId: AssetSlotId): Promise<RuntimeSlot | null> {
  const cacheKey = slotId === assetSlots.charHero
    ? `${slotId}:${activeHeroAge()}:${readHeroSkin()}`
    : slotId === assetSlots.charProspectorAgent
      ? `${slotId}:${readProspectorSkin()}`
      : slotId;
  const cached = runtimeCache.get(cacheKey);
  if (cached) return cached;
  const promise = createRuntimeSlot(slotId);
  runtimeCache.set(cacheKey, promise);
  return promise;
}

export function prefetchNonCriticalSpriteRuntimes(): Promise<void> {
  return afterStartupFrame()
    .then(() => Promise.all(nonCriticalSpriteRuntimeSlots.map((slotId) => loadRuntimeSlot(slotId))))
    .then(() => undefined);
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
  const diagnosticMirrors = new Set<string>();

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

  const walkSheet = await resolveWalkSheet(slotId, slot);
  if (walkSheet) {
    const walkSources = expandWalkSheetSources(walkSheet);
    for (const [name, source] of walkSources) {
      const direction = name.toLowerCase();
      if (!isRotationDirection(direction)) continue;
      const mirrorSource = slot?.rotations?.mirrors?.[direction]?.toLowerCase();
      const rotationSource = slot?.rotations?.directions?.[direction] ?? (mirrorSource ? slot?.rotations?.directions?.[mirrorSource] : undefined);
      const merged = mergeWalkSheetWithRotationIdle(source, rotationSource);
      const orientation = await createRuntimeOrientation(merged.frames, merged.clips ?? {}, fallbackClip);
      if (orientation) {
        orientations.set(direction, orientation);
        rotationDirections.add(direction);
        if (!slot?.rotations?.directions?.[direction] && mirrorSource) diagnosticMirrors.add(direction);
      }
    }

    for (const [target, source] of Object.entries(walkSheet.mirrors ?? {})) {
      const targetDirection = target.toLowerCase();
      const sourceDirection = source.toLowerCase();
      if (!isRotationDirection(targetDirection) || !isRotationDirection(sourceDirection)) continue;
      rotationDirections.add(targetDirection);
      rotationDirections.add(sourceDirection);
      rotationMirrors.set(targetDirection, sourceDirection);
    }

    for (const [target, source] of Object.entries(walkSheet.aliases ?? {})) {
      const targetDirection = target.toLowerCase();
      const sourceDirection = source.toLowerCase();
      if (!isRotationDirection(targetDirection) || !isRotationDirection(sourceDirection)) continue;
      const orientation = orientations.get(sourceDirection);
      if (!orientation) continue;
      orientations.set(targetDirection, orientation);
      rotationDirections.add(targetDirection);
      rotationDirections.add(sourceDirection);
      rotationMirrors.set(targetDirection, sourceDirection);
    }
  }

  if (slotId === assetSlots.charHero) await addHeroPoseClips(orientations);

  if (orientations.size === 0 && fallbackClip) {
    orientations.set('side', { clips: new Map([['idle', fallbackClip], ['walk', fallbackClip]]) });
  }
  return orientations.size > 0 ? { orientations, rotationDirections, rotationMirrors, diagnosticMirrors } : null;
}

async function resolveWalkSheet(slotId: AssetSlotId, slot: ContractSlot | undefined): Promise<WalkSheetSource | null> {
  const young = selectWalkSheet(slot);
  if (slotId === assetSlots.charProspectorAgent) return resolveProspectorWalkSheet(young);
  if (slotId !== assetSlots.charHero) return young;

  const age = activeHeroAge();
  const params = new URLSearchParams(globalThis.location?.search ?? '');
  const aged = age === 'young' || (params.has('debug') && params.has('noheroageart')) ? null : agedHeroWalkSheet(slot?.walk4, age);
  const resolvedAge = aged && walkSheetHasProcessedCells(aged) && (await walkSheetLoads(aged)) ? age : 'young';
  const stock = resolvedAge === age && aged ? aged : young;
  const skin = readHeroSkin();
  const skinBase = resolvedAge === 'young' && slot?.walk4 ? slot.walk4 : stock;
  const skinned = skinBase && skin !== 'stock' ? heroSkinWalkSheet(skinBase, resolvedAge, skin) : null;
  const resolved = skinned && walkSheetHasProcessedCells(skinned) && (await walkSheetLoads(skinned)) ? skinned : stock;
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  canvas?.setAttribute('data-hero-sheet', resolvedAge);
  canvas?.setAttribute('data-hero-skin', skin);
  canvas?.setAttribute('data-hero-skin-sheet', resolved === skinned ? skin : 'stock');
  return resolved;
}

async function resolveProspectorWalkSheet(stock: WalkSheetSource | null): Promise<WalkSheetSource | null> {
  const skin = readProspectorSkin();
  const skinned = stock && skin !== 'stock' ? skinWalkSheet(stock, skin) : null;
  const resolved = skinned && walkSheetHasProcessedCells(skinned) && (await walkSheetLoads(skinned)) ? skinned : stock;
  const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  canvas?.setAttribute('data-prospector-skin', skin);
  canvas?.setAttribute('data-prospector-sheet', resolved === skinned ? skin : 'stock');
  return resolved;
}

function skinWalkSheet(sheet: WalkSheetSource, skin: ProspectorSkin): WalkSheetSource {
  return {
    ...sheet,
    grid: sheet.grid?.file ? { ...sheet.grid, file: prospectorSkinSheetFile(sheet.grid.file, skin) } : sheet.grid,
    directions: Object.fromEntries(
      Object.entries(sheet.directions ?? {}).map(([direction, source]) => [
        direction,
        {
          ...source,
          frames: source.frames?.files
            ? { ...source.frames, files: source.frames.files.map((file) => prospectorSkinSheetFile(file, skin)) }
            : source.frames,
        },
      ]),
    ),
  };
}

function heroSkinWalkSheet(sheet: WalkSheetSource, age: HeroAge, skin: HeroSkin): WalkSheetSource {
  const variant = skin === 'claim-day' ? 'claimday' : skin;
  const skinFile = (file: string) => age === 'young'
    ? file.replace(/char-hero-sheet-walk4-([ab])(?:-f)?(?=-r\d+c\d+\.png$)/, `char-hero-${variant}-sheet-walk4-$1`)
    : file.replace(`char-hero-${age}-`, `char-hero-${age}-${variant}-`);
  return {
    ...sheet,
    grid: sheet.grid?.file ? { ...sheet.grid, file: skinFile(sheet.grid.file) } : sheet.grid,
    directions: Object.fromEntries(
      Object.entries(sheet.directions ?? {}).map(([direction, source]) => [
        direction,
        {
          ...source,
          frames: source.frames?.files
            ? { ...source.frames, files: source.frames.files.map(skinFile) }
            : source.frames,
        },
      ]),
    ),
  };
}

function activeHeroAge(): HeroAge {
  return heroAgeByEpochOrder.get(activeEpoch().order) ?? 'young';
}

function agedHeroWalkSheet(young: ContractSlot['walk4'], age: Exclude<HeroAge, 'young'>): WalkSheetSource | null {
  if (!young || young.status === 'RUNTIME-DORMANT' || young.enabled === false) return null;
  return {
    ...young,
    directions: Object.fromEntries(
      Object.entries(young.directions ?? {}).map(([direction, source]) => [
        direction,
        {
          ...source,
          frames: source.frames?.files
            ? {
                ...source.frames,
                files: source.frames.files.map((file) =>
                  file.replace(/char-hero-sheet-walk4-([ab])(?:-f)?(?=-r\d+c\d+\.png$)/, `char-hero-${age}-sheet-walk4-$1`),
                ),
              }
            : source.frames,
        },
      ]),
    ),
  };
}

async function walkSheetLoads(sheet: WalkSheetSource): Promise<boolean> {
  const files = [...new Set([...expandWalkSheetSources(sheet).values()].flatMap((source) => resolveFrameFiles(source.frames)))];
  return (await Promise.all(files.map(loadProcessedTexture))).every((texture) => texture !== null);
}

async function addHeroPoseClips(orientations: Map<string, RuntimeOrientation>): Promise<void> {
  for (const [clipName, directions] of Object.entries(heroPoseFrameFiles)) {
    for (const [direction, files] of Object.entries(directions)) {
      const clip = await createRuntimeOrientation(
        { files: [...files] },
        { [clipName]: { frames: files.map((_, index) => index), fps: clipName === 'attack' ? 12 : 8 } },
        null,
      );
      const runtimeClip = clip?.clips.get(clipName);
      const orientation = orientations.get(direction);
      if (runtimeClip && orientation) orientation.clips.set(clipName, runtimeClip);
    }
  }
}

function selectWalkSheet(slot: ContractSlot | undefined): WalkSheetSource | null {
  const walk8 = slot?.walk8;
  if (walkSheetEnabled(walk8) && walkSheetHasProcessedCells(walk8)) return walk8;
  const walk4 = slot?.walk4;
  return walk4 && walk4.status !== 'RUNTIME-DORMANT' && walk4.enabled !== false ? walk4 : null;
}

function walkSheetEnabled(sheet: WalkSheetSource | undefined): sheet is WalkSheetSource {
  return !!sheet && sheet.status !== 'RUNTIME-DORMANT' && sheet.enabled === true;
}

function walkSheetHasProcessedCells(sheet: WalkSheetSource): boolean {
  const files = new Set<string>();
  for (const source of expandWalkSheetSources(sheet).values()) {
    for (const file of resolveFrameFiles(source.frames)) files.add(file);
  }
  return files.size > 0 && [...files].every((file) => processedTextureUrlsByFile.has(file));
}

function expandWalkSheetSources(sheet: WalkSheetSource): Map<string, OrientationSource> {
  const sources = new Map<string, OrientationSource>();
  const explicit = sheet.directions ?? {};
  const rowDirections = sheet.grid?.rowDirections ?? [];

  for (const direction of rowDirections) {
    const normalized = direction.toLowerCase();
    const source = materializeWalkSheetDirection(sheet, explicit[normalized] ?? {}, normalized);
    if (source) sources.set(normalized, source);
  }

  for (const [name, source] of Object.entries(explicit)) {
    const normalized = name.toLowerCase();
    const materialized = materializeWalkSheetDirection(sheet, source, normalized);
    if (materialized) sources.set(normalized, materialized);
  }

  return sources;
}

function materializeWalkSheetDirection(
  sheet: WalkSheetSource,
  source: WalkSheetDirectionSource,
  direction: string,
): OrientationSource | null {
  if (source.frames) return withWalkSheetCadence(source, sheet);
  const grid = sheet.grid;
  if (!grid?.file) return null;
  const rowDirections = grid.rowDirections ?? [];
  const row = source.row ?? rowDirections.findIndex((candidate) => candidate.toLowerCase() === direction);
  if (row < 0) return null;
  const frameCount = Math.max(1, sheet.frameCount ?? grid.cols ?? 1);
  const base = grid.file.replace(/\.png$/i, '');
  const files = Array.from({ length: frameCount }, (_, col) => `${base}-r${row}c${col}.png`);
  const walkClip = source.clips?.walk ?? {};
  return withWalkSheetCadence(
    {
      frames: { files },
      clips: {
        ...source.clips,
        walk: {
          ...walkClip,
          frames: walkClip.frames ?? files.map((_, index) => index),
          fps: walkClip.fps ?? sheet.fps ?? frameCount,
        },
      },
    },
    sheet,
  );
}

function withWalkSheetCadence(source: OrientationSource, sheet: WalkSheetSource): OrientationSource {
  const cadenceReferenceFrames = sheet.cadenceReferenceFrames;
  const walk = source.clips?.walk;
  if (!cadenceReferenceFrames || !walk) return source;
  return {
    ...source,
    clips: {
      ...source.clips,
      walk: {
        ...walk,
        cadenceReferenceFrames,
      },
    },
  };
}

function mergeWalkSheetWithRotationIdle(walkSheet: OrientationSource, rotation: OrientationSource | undefined): OrientationSource {
  const walkFiles = resolveFrameFiles(walkSheet.frames);
  const rotationFiles = resolveFrameFiles(rotation?.frames);
  const rotationWalkFrames = rotation?.clips?.walk?.frames ?? [];
  const idleIndex = rotation?.clips?.idle?.frames?.[0];
  const idleFile = idleIndex === undefined ? undefined : rotationFiles[idleIndex];
  if (walkFiles.length === 0) return walkSheet;
  const diagnosticKeys = walkFiles.map((file, index) => {
    const rotationIndex = rotationWalkFrames[index % Math.max(1, rotationWalkFrames.length)];
    return rotationIndex === undefined ? file : rotationFiles[rotationIndex] ?? file;
  });
  if (!idleFile) return { ...walkSheet, frames: diagnosticKeys ? { files: walkFiles, diagnosticKeys } : { files: walkFiles } };
  return {
    frames: { files: [...walkFiles, idleFile], diagnosticKeys: [...diagnosticKeys, idleFile] },
    clips: {
      ...walkSheet.clips,
      idle: { frames: [walkFiles.length], fps: rotation?.clips?.idle?.fps ?? 1 },
    },
  };
}

function rotationDirectionFor(runtime: RuntimeSlot, orientation: string): RotationDirection | null {
  return runtime.rotationDirections.has(orientation) && isRotationDirection(orientation) ? orientation : null;
}

function cadenceFrameScale(clip: RuntimeClip): number {
  const reference = clip.cadenceReferenceFrames ?? 4;
  return reference > 0 ? clip.frames.length / reference : 1;
}

function isGaitClip(clip: CharacterSpriteClip): boolean {
  return clip === 'walk' || clip === 'grab' || clip === 'flee';
}

async function createRuntimeOrientation(
  frames: FrameSource | undefined,
  clipSources: Record<string, ClipSource>,
  fallbackClip: RuntimeClip | null,
): Promise<RuntimeOrientation | null> {
  const frameFiles = resolveFrameFiles(frames);
  const frameTextures = await Promise.all(frameFiles.map(loadProcessedTexture));
  const loadedFrames = frameTextures.map((texture, index) =>
    texture ? { texture, key: frameFiles[index] ?? `frame-${index}`, diagnosticKey: frames?.diagnosticKeys?.[index] } : null,
  );
  if (loadedFrames.every((frame) => frame === null)) {
    return fallbackClip ? { clips: new Map([['idle', fallbackClip], ['walk', fallbackClip]]) } : null;
  }

  const atlasFrames = createAtlasFrameMap(loadedFrames);
  const clips = new Map<string, RuntimeClip>();
  for (const [name, source] of Object.entries(clipSources)) {
    const indexes = source.frames ?? [0];
    const clipFrames = indexes.map((index) => atlasFrames[index]);
    if (clipFrames.every((frame): frame is RuntimeFrame => !!frame)) {
      clips.set(name, { frames: clipFrames, fps: source.fps ?? 1, cadenceReferenceFrames: source.cadenceReferenceFrames });
    }
  }
  // s15 + task 016: an orientation must always resolve idle without replacing a real walk
  // pair. Walk-only direction blocks keep cycling; idle falls back to the billboard.
  if (fallbackClip && !clips.has('idle')) clips.set('idle', fallbackClip);
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

function createAtlasFrames(frames: Array<{ texture: THREE.Texture; key: string; diagnosticKey?: string }>): RuntimeFrame[] {
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
    diagnosticKey: frame.diagnosticKey,
    offsetX: 0,
    offsetY: (frames.length - 1 - row) / frames.length,
    repeatX: 1,
    repeatY: 1 / frames.length,
  }));
}

function createAtlasFrameMap(frames: Array<{ texture: THREE.Texture; key: string; diagnosticKey?: string } | null>): Array<RuntimeFrame | null> {
  const loadedFrames = frames.filter((frame): frame is { texture: THREE.Texture; key: string; diagnosticKey?: string } => frame !== null);
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
