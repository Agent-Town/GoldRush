import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { bindWorldSpriteTint } from '../assets/generated';
import { visualAnchorY } from '../world/Terrain';

type FloatingText = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  texture: THREE.CanvasTexture;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  elapsed: number;
  duration: number;
  active: boolean;
  start: THREE.Vector3;
};

const FLOAT_HEIGHT = 1.2;
const FLOAT_DURATION = 0.8;

export class Vfx {
  readonly group = new THREE.Group();

  private readonly pool: FloatingText[] = [];
  private cursor = 0;
  private lastFloat: { text: string; x: number; z: number; y: number; terrainY: number } | null = null;

  constructor() {
    this.group.name = 'Vfx';
    for (let index = 0; index < floatTextPoolSize(); index += 1) {
      const textTexture = createTextTexture('', '#c4883a');
      const material = new THREE.SpriteMaterial({
        map: textTexture.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.renderOrder = RenderLayers.impactVfx;
      sprite.scale.set(1.6, 0.8, 1);
      bindWorldSpriteTint(sprite);
      this.group.add(sprite);
      this.pool.push({
        sprite,
        material,
        texture: textTexture.texture,
        canvas: textTexture.canvas,
        context: textTexture.context,
        elapsed: 0,
        duration: FLOAT_DURATION,
        active: false,
        start: new THREE.Vector3(),
      });
    }
  }

  floatText(position: THREE.Vector3, text: string, colorHex: string | number, terrainLift?: number): void {
    const item = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % this.pool.length;

    drawTextTexture(item.canvas, item.context, text, toCssColor(colorHex));
    item.texture.needsUpdate = true;
    item.material.opacity = 1;
    item.elapsed = 0;
    item.duration = FLOAT_DURATION;
    item.active = true;
    const terrainY = visualAnchorY(position, 0);
    const lift = terrainLift ?? position.y - terrainY + 1.7;
    item.start.set(position.x, visualAnchorY(position, lift), position.z);
    this.lastFloat = { text, x: position.x, z: position.z, y: item.start.y, terrainY };
    item.sprite.position.copy(item.start);
    item.sprite.visible = true;
  }

  get activeFloatTexts(): number {
    return this.pool.reduce((count, item) => count + (item.active ? 1 : 0), 0);
  }

  get capacity(): number {
    return this.pool.length;
  }

  get lastFloatText(): typeof this.lastFloat {
    return this.lastFloat;
  }

  /**
   * Cycle every pool slot once so the shared sprite geometry and per-slot canvas
   * textures upload eagerly for one frame. Steady-state floatText is then
   * dispose/create net-zero for renderer memory counts (used by e2e leak
   * baselines via ?debug) without leaving warmup sprites in the combat window.
   */
  warm(position: THREE.Vector3): Promise<void> {
    for (let index = 0; index < this.pool.length; index += 1) {
      this.floatText(position, '+0', '#83ded7');
    }
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        for (const item of this.pool) {
          item.active = false;
          item.sprite.visible = false;
          item.material.opacity = 0;
        }
        resolve();
      });
    });
  }

  update(delta: number): void {
    for (const item of this.pool) {
      if (!item.active) continue;

      item.elapsed += delta;
      const t = Math.min(1, item.elapsed / item.duration);
      item.sprite.position.copy(item.start);
      item.sprite.position.y += FLOAT_HEIGHT * easeOutCubic(t);
      item.material.opacity = 1 - t;

      if (t >= 1) {
        item.active = false;
        item.sprite.visible = false;
        item.material.opacity = 0;
      }
    }
  }

  dispose(): void {
    for (const item of this.pool) {
      item.texture.dispose();
      item.material.dispose();
    }
  }
}

function createTextTexture(
  text: string,
  color: string,
): { texture: THREE.CanvasTexture; canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create floating text canvas');
  drawTextTexture(canvas, context, text, color);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return { texture, canvas, context };
}

function drawTextTexture(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, text: string, color: string): void {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '700 64px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.strokeStyle = '#2e1b0e';
  context.lineWidth = 10;
  context.strokeText(text, canvas.width / 2, canvas.height / 2);
  context.fillStyle = color;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
}

function toCssColor(colorHex: string | number): string {
  if (typeof colorHex === 'string') return colorHex.startsWith('#') ? colorHex : `#${colorHex}`;
  return `#${colorHex.toString(16).padStart(6, '0')}`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function floatTextPoolSize(): number {
  return Math.max(1, Math.floor(Balance.render.floatTextPool));
}
