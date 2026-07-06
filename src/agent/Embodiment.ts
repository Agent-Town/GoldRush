import * as THREE from 'three';
import { OrientationResolver, type RotationDirection } from '../assets/OrientationResolver';
import { SpriteAnimator } from '../assets/SpriteAnimator';
import { assetSlots, tagPlaceholder } from '../assets/slots';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';
import type { GoldRushToolName, ToolReceipt } from './ToolSurface';
import { agentBark, barkForReceipt } from './Voice';

export type ProspectorPoint = { x: number; z: number };

export type ProspectorEmbodimentSnapshot = {
  visible: boolean;
  moving: boolean;
  working: boolean;
  receiptCount: number;
  lastReceiptTool: GoldRushToolName | null;
  lastLine: string | null;
  position: ProspectorPoint & { y: number };
  target: ProspectorPoint;
};

type FloatText = (position: THREE.Vector3, text: string, color: string) => void;

export class ProspectorEmbodiment {
  readonly group = new THREE.Group();

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
  private currentDirection: RotationDirection = 's';
  private moving = false;
  private workRemaining = 0;
  private nextSurveyAt: number = Balance.agent.surveyFirstSeconds;
  private receiptCount = 0;
  private lastReceiptTool: GoldRushToolName | null = null;
  private lastLine: string | null = null;

  constructor(private readonly floatText: FloatText) {
    this.group.name = 'ProspectorEmbodiment';
    this.sprite.name = 'ProspectorSprite';
    this.sprite.scale.setScalar(Balance.agent.spriteScale);
    this.sprite.renderOrder = 2.5;
    this.group.add(this.sprite);
    this.animator = new SpriteAnimator(assetSlots.charProspectorAgent, this.material, this.sprite);
    tagPlaceholder(this.group, assetSlots.charProspectorAgent);
    this.reset();
  }

  reset(): void {
    this.group.position.set(
      Balance.agent.homeX,
      Terrain.visualY(Balance.agent.homeX, Balance.agent.homeZ, Balance.agent.groundY),
      Balance.agent.homeZ,
    );
    this.target.set(Balance.agent.homeX, 0, Balance.agent.homeZ);
    this.currentDirection = 's';
    this.orientationResolver.reset(this.currentDirection);
    this.animator.reset('idle');
    this.moving = false;
    this.workRemaining = 0;
    this.nextSurveyAt = Balance.agent.surveyFirstSeconds;
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
    this.workRemaining = 0;
  }

  update(delta: number, at: number): void {
    if (this.moving) this.stepTowardTarget(delta);
    else if (this.workRemaining > 0) this.workRemaining = Math.max(0, this.workRemaining - delta);
    else if (at >= this.nextSurveyAt) {
      this.say(agentBark('survey', Math.floor(at)));
      this.nextSurveyAt = at + Balance.agent.surveyCooldownSeconds;
    }

    const idleBob = Math.sin(at * Math.PI * 2 * Balance.agent.idleBobHz) * Balance.agent.idleBobAmplitude;
    const workBob = this.workRemaining > 0 ? Math.sin(at * 18) * Balance.agent.workBobAmplitude : 0;
    this.group.position.y =
      Terrain.visualY(this.group.position.x, this.group.position.z, Balance.agent.groundY) + idleBob + workBob;
    // The Prospector's walk4 cells are a hover loop; keep them at the agent cadence
    // even though SpriteAnimator applies the global stride FPS to generic walk clips.
    const animationDelta =
      this.moving && Balance.anim.walkFps > 0 ? delta * (Balance.agent.hoverFps / Balance.anim.walkFps) : delta;
    this.animator.update(animationDelta, this.moving ? 'walk' : 'idle', this.currentDirection);
    if (this.material.map) this.material.opacity = 1;
  }

  get snapshot(): ProspectorEmbodimentSnapshot {
    return {
      visible: this.group.visible,
      moving: this.moving,
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
      this.workRemaining = Balance.agent.workSeconds;
      return;
    }

    this.currentDirection = this.orientationResolver.resolve(dx, dz);
    const step = Math.min(distance, Balance.agent.moveSpeed * delta);
    this.group.position.x += (dx / distance) * step;
    this.group.position.z += (dz / distance) * step;
  }

  private say(line: string): void {
    this.lastLine = line;
    this.floatText(this.group.position, line, '#83ded7');
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
