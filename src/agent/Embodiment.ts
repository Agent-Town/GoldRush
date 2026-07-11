import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';
import type { GoldRushToolName, ToolReceipt } from './ToolSurface';
import { agentBark, barkForReceipt } from './Voice';

export type ProspectorPoint = { x: number; z: number };

export type ProspectorEmbodimentSnapshot = {
  visible: boolean;
  moving: boolean;
  drifting: boolean;
  working: boolean;
  receiptCount: number;
  lastReceiptTool: GoldRushToolName | null;
  lastLine: string | null;
  position: ProspectorPoint & { y: number };
  target: ProspectorPoint;
  terrainY: number;
  clearance: number;
};

export type ProspectorFutureState = {
  visible: boolean;
  position: ProspectorPoint;
  target: ProspectorPoint;
  moving: boolean;
  workRemaining: number;
  nextWorkSeconds: number;
  nextSurveyIn: number;
  receiptCount: number;
};

type FloatText = (position: THREE.Vector3, text: string, color: string) => void;

export class ProspectorEmbodiment {
  readonly group = new THREE.Group();
  readonly renderPosition = new THREE.Vector3();

  private readonly visualGroup = new THREE.Group();
  private readonly material = new THREE.SpriteMaterial({
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
    opacity: 0,
  });
  private readonly sprite = new THREE.Sprite(this.material);
  private readonly animator: SpriteAnimator;
  private readonly orientationResolver = new OrientationResolver();
  private readonly target = new THREE.Vector3(Balance.agent.homeX, 0, Balance.agent.homeZ);
  private readonly idleTarget = new THREE.Vector3(Balance.agent.homeX, 0, Balance.agent.homeZ);
  private readonly previousPosition = new THREE.Vector3();
  private currentDirection: RotationDirection = 's';
  private moving = false;
  private drifting = false;
  private workRemaining = 0;
  private presentationAt = 0;
  private nextWorkSeconds: number = Balance.agent.workSeconds;
  private nextSurveyAt: number = Balance.agent.surveyFirstSeconds;
  private receiptCount = 0;
  private lastReceiptTool: GoldRushToolName | null = null;
  private lastLine: string | null = null;

  constructor(private readonly floatText: FloatText) {
    this.group.name = 'ProspectorEmbodiment';
    this.visualGroup.name = 'ProspectorInterpolation';
    this.sprite.name = 'ProspectorSprite';
    this.sprite.scale.setScalar(Balance.agent.spriteScale);
    this.sprite.renderOrder = RenderLayers.companion;
    this.visualGroup.add(this.sprite);
    this.group.add(this.visualGroup);
    this.animator = new SpriteAnimator(assetSlots.charProspectorAgent, this.material, this.sprite);
    tagPlaceholder(this.group, assetSlots.charProspectorAgent);
    this.reset();
  }

  reset(hero?: ProspectorPoint): void {
    const start = hero ? this.idlePoint(hero, 0) : { x: Balance.agent.homeX, z: Balance.agent.homeZ };
    this.group.position.set(start.x, this.floatY(start.x, start.z, 0), start.z);
    this.target.set(start.x, 0, start.z);
    this.idleTarget.set(start.x, 0, start.z);
    this.currentDirection = 's';
    this.orientationResolver.reset(this.currentDirection);
    this.animator.reset('idle');
    this.moving = false;
    this.drifting = false;
    this.workRemaining = 0;
    this.presentationAt = 0;
    this.nextWorkSeconds = Balance.agent.workSeconds;
    this.nextSurveyAt = Balance.agent.surveyFirstSeconds;
    this.snapRenderState();
  }

  assignWork(point: ProspectorPoint, workSeconds: number = Balance.agent.workSeconds): void {
    this.target.set(point.x, 0, point.z);
    this.moving = true;
    this.drifting = false;
    this.workRemaining = 0;
    this.nextWorkSeconds = Math.max(0, workSeconds);
  }

  handleReceipt(receipt: ToolReceipt, point?: ProspectorPoint | null): void {
    this.receiptCount += 1;
    this.lastReceiptTool = receipt.tool;
    if (receipt.tool === 'et.goldrush.get_state') return;

    const line = barkForReceipt(receipt, this.receiptCount);
    if (line) this.say(line);
    if (!receipt.outcome.ok && receipt.outcome.reason !== 'NO_SYSTEM_API') return;

    const target = point ?? { x: Balance.agent.homeX, z: Balance.agent.homeZ };
    this.target.set(target.x, 0, target.z);
    this.moving = true;
    this.drifting = false;
    this.workRemaining = 0;
  }

  updateSimulation(delta: number, at: number, hero?: ProspectorPoint): void {
    if (delta > 0) {
      if (this.moving) this.stepTowardTarget(delta);
      else if (this.workRemaining > 0) this.workRemaining = Math.max(0, this.workRemaining - delta);
      else {
        if (hero) this.driftNearHero(delta, at, hero);
        if (at >= this.nextSurveyAt) {
          this.say(agentBark('survey', Math.floor(at)));
          this.nextSurveyAt = at + Balance.agent.surveyCooldownSeconds;
        }
      }
    }

    this.group.position.y = this.floatY(this.group.position.x, this.group.position.z, 0);
  }

  captureRenderState(): void {
    this.previousPosition.copy(this.group.position);
  }

  updatePresentation(delta: number, alpha: number): void {
    this.presentationAt += Math.max(0, delta);
    const amount = THREE.MathUtils.clamp(alpha, 0, 1);
    this.renderPosition.lerpVectors(this.previousPosition, this.group.position, amount);

    const idleBob = Math.sin(this.presentationAt * Math.PI * 2 * Balance.agent.idleBobHz) * Balance.agent.idleBobAmplitude;
    const workBob = this.workRemaining > 0 ? Math.sin(this.presentationAt * 18) * Balance.agent.workBobAmplitude : 0;
    this.renderPosition.y = this.floatY(this.renderPosition.x, this.renderPosition.z, idleBob + workBob);
    this.visualGroup.position.copy(this.renderPosition).sub(this.group.position);
    // The Prospector's walk4 cells are a hover loop; keep them at the agent cadence
    // even though SpriteAnimator applies the global stride FPS to generic walk clips.
    const animating = this.moving || this.drifting;
    const animationDelta =
      animating && Balance.anim.walkFps > 0 ? delta * (Balance.agent.hoverFps / Balance.anim.walkFps) : delta;
    this.animator.update(animationDelta, animating ? 'walk' : 'idle', this.currentDirection);
    if (this.material.map) this.material.opacity = 1;
  }

  snapRenderState(): void {
    this.previousPosition.copy(this.group.position);
    this.renderPosition.copy(this.group.position);
    this.visualGroup.position.set(0, 0, 0);
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get hasActiveTask(): boolean {
    return this.moving || this.workRemaining > 0;
  }

  captureFutureState(at: number): ProspectorFutureState {
    return {
      visible: this.group.visible,
      position: { x: this.group.position.x, z: this.group.position.z },
      target: { x: this.target.x, z: this.target.z },
      moving: this.moving,
      workRemaining: this.workRemaining,
      nextWorkSeconds: this.nextWorkSeconds,
      nextSurveyIn: Math.max(0, this.nextSurveyAt - at),
      receiptCount: this.receiptCount,
    };
  }

  restoreFutureState(state: ProspectorFutureState, at: number): boolean {
    if (
      !Number.isFinite(state.position?.x) ||
      !Number.isFinite(state.position?.z) ||
      !Number.isFinite(state.target?.x) ||
      !Number.isFinite(state.target?.z) ||
      !Number.isFinite(state.workRemaining) ||
      state.workRemaining < 0 ||
      !Number.isFinite(state.nextWorkSeconds) ||
      state.nextWorkSeconds < 0 ||
      !Number.isFinite(state.nextSurveyIn) ||
      state.nextSurveyIn < 0 ||
      !Number.isInteger(state.receiptCount) ||
      state.receiptCount < 0 ||
      (state.moving && state.workRemaining > 0)
    ) {
      return false;
    }
    this.group.visible = state.visible;
    this.group.position.set(state.position.x, this.floatY(state.position.x, state.position.z, 0), state.position.z);
    this.target.set(state.target.x, 0, state.target.z);
    this.idleTarget.copy(this.target);
    this.moving = state.moving;
    this.drifting = false;
    this.workRemaining = state.workRemaining;
    this.nextWorkSeconds = state.nextWorkSeconds;
    this.nextSurveyAt = at + state.nextSurveyIn;
    this.receiptCount = state.receiptCount;
    this.orientationResolver.reset();
    this.snapRenderState();
    return true;
  }

  speak(line: string): void {
    this.say(line);
  }

  get snapshot(): ProspectorEmbodimentSnapshot {
    const terrainY = Terrain.visualY(this.group.position.x, this.group.position.z, 0);
    return {
      visible: this.group.visible,
      moving: this.moving,
      drifting: this.drifting,
      working: this.workRemaining > 0,
      receiptCount: this.receiptCount,
      lastReceiptTool: this.lastReceiptTool,
      lastLine: this.lastLine,
      position: {
        x: round3(this.group.position.x),
        y: round3(this.group.position.y),
        z: round3(this.group.position.z),
      },
      target: {
        x: round3(this.target.x),
        z: round3(this.target.z),
      },
      terrainY: round3(terrainY),
      clearance: round3(this.group.position.y - terrainY),
    };
  }

  dispose(): void {
    this.animator.dispose();
    this.material.dispose();
  }

  private stepTowardTarget(delta: number): void {
    const dx = this.target.x - this.group.position.x;
    const dz = this.target.z - this.group.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= Balance.agent.arriveRadius) {
      this.group.position.x = this.target.x;
      this.group.position.z = this.target.z;
      this.moving = false;
      this.drifting = false;
      this.workRemaining = this.nextWorkSeconds;
      this.nextWorkSeconds = Balance.agent.workSeconds;
      return;
    }

    this.currentDirection = this.orientationResolver.resolve(dx, dz);
    const step = Math.min(distance, Balance.agent.moveSpeed * delta);
    this.group.position.x += (dx / distance) * step;
    this.group.position.z += (dz / distance) * step;
  }

  private driftNearHero(delta: number, at: number, hero: ProspectorPoint): void {
    const idle = this.idlePoint(hero, at);
    this.idleTarget.set(idle.x, 0, idle.z);
    const dx = this.idleTarget.x - this.group.position.x;
    const dz = this.idleTarget.z - this.group.position.z;
    const distance = Math.hypot(dx, dz);
    this.drifting = distance > 0.06;
    if (!this.drifting) return;

    this.currentDirection = this.orientationResolver.resolve(dx, dz);
    const step = Math.min(distance, Balance.agent.moveSpeed * 0.58 * delta);
    this.group.position.x += (dx / distance) * step;
    this.group.position.z += (dz / distance) * step;
  }

  private idlePoint(hero: ProspectorPoint, at: number): ProspectorPoint {
    const point = {
      x: hero.x - 1.8 + Math.sin(at * 0.78) * 0.22,
      z: hero.z - 1.25 + Math.cos(at * 0.52) * 0.18,
    };
    if (Terrain.sample(point.x, point.z).zone !== 'river') return point;

    const bankZ =
      hero.z >= 0
        ? Terrain.RIVER_MAX_Z + Terrain.SHALLOWS_WIDTH + 0.25
        : Terrain.RIVER_MIN_Z - Terrain.SHALLOWS_WIDTH - 0.25;
    return { x: point.x, z: bankZ };
  }

  private floatY(x: number, z: number, bob: number): number {
    return Terrain.visualY(x, z, Balance.agent.groundY + Balance.agent.spriteScale * 0.5 + 0.12) + bob;
  }

  private say(line: string): void {
    this.lastLine = line;
    this.floatText(this.group.position, line, '#83ded7');
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
