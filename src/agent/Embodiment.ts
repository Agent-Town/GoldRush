import * as THREE from 'three';
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

  private readonly texture = createProspectorTexture();
  private readonly material = new THREE.SpriteMaterial({
    map: this.texture,
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
  });
  private readonly sprite = new THREE.Sprite(this.material);
  private readonly target = new THREE.Vector3(Balance.agent.homeX, 0, Balance.agent.homeZ);
  private moving = false;
  private workRemaining = 0;
  private nextSurveyAt: number = Balance.agent.surveyFirstSeconds;
  private receiptCount = 0;
  private lastReceiptTool: GoldRushToolName | null = null;
  private lastLine: string | null = null;

  constructor(private readonly floatText: FloatText) {
    this.group.name = 'ProspectorEmbodiment';
    this.sprite.name = 'ProspectorBillboard';
    this.sprite.scale.setScalar(Balance.agent.spriteScale);
    this.sprite.renderOrder = 2.5;
    this.group.add(this.sprite);
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
    this.material.rotation = this.moving ? Math.sin(at * 10) * 0.035 : 0;
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
    this.texture.dispose();
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

    const step = Math.min(distance, Balance.agent.moveSpeed * delta);
    this.group.position.x += (dx / distance) * step;
    this.group.position.z += (dz / distance) * step;
  }

  private say(line: string): void {
    this.lastLine = line;
    this.floatText(this.group.position, line, '#83ded7');
  }
}

function createProspectorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to create Prospector texture');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = 'rgba(46, 27, 14, 0.2)';
  ctx.beginPath();
  ctx.ellipse(128, 219, 48, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2e1b0e';
  ctx.fillStyle = '#e8d5a8';
  ctx.lineWidth = 9;
  roundRect(ctx, 91, 85, 74, 78, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8b7d3c';
  roundRect(ctx, 101, 43, 54, 48, 14);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#8b7d3c';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(78, 114);
  ctx.lineTo(49, 139);
  ctx.moveTo(178, 114);
  ctx.lineTo(207, 139);
  ctx.stroke();

  ctx.strokeStyle = '#2e1b0e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(82, 167);
  ctx.lineTo(65, 202);
  ctx.moveTo(174, 167);
  ctx.lineTo(191, 202);
  ctx.stroke();

  ctx.fillStyle = '#5b8a8a';
  ctx.strokeStyle = '#2e1b0e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(116, 67, 7, 0, Math.PI * 2);
  ctx.arc(140, 67, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 4;
  for (let y = 103; y <= 147; y += 13) {
    ctx.beginPath();
    ctx.moveTo(104, y);
    ctx.lineTo(152, y + 4);
    ctx.stroke();
  }

  ctx.strokeStyle = '#5b8a8a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 92);
  ctx.lineTo(128, 163);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
