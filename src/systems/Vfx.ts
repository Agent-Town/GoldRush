import * as THREE from 'three';

type FloatingText = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  texture: THREE.CanvasTexture;
  elapsed: number;
  duration: number;
  active: boolean;
  start: THREE.Vector3;
};

const POOL_SIZE = 12;
const FLOAT_HEIGHT = 1.2;
const FLOAT_DURATION = 0.8;

export class Vfx {
  readonly group = new THREE.Group();

  private readonly pool: FloatingText[] = [];
  private cursor = 0;

  constructor() {
    this.group.name = 'Vfx';
    for (let index = 0; index < POOL_SIZE; index += 1) {
      const texture = createTextTexture('', '#c4883a');
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      sprite.scale.set(1.6, 0.8, 1);
      this.group.add(sprite);
      this.pool.push({
        sprite,
        material,
        texture,
        elapsed: 0,
        duration: FLOAT_DURATION,
        active: false,
        start: new THREE.Vector3(),
      });
    }
  }

  floatText(position: THREE.Vector3, text: string, colorHex: string | number): void {
    const item = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % this.pool.length;

    item.texture.dispose();
    item.texture = createTextTexture(text, toCssColor(colorHex));
    item.material.map = item.texture;
    item.material.opacity = 1;
    item.material.needsUpdate = true;
    item.elapsed = 0;
    item.duration = FLOAT_DURATION;
    item.active = true;
    item.start.copy(position);
    item.start.y += 1.7;
    item.sprite.position.copy(item.start);
    item.sprite.visible = true;
  }

  get activeFloatTexts(): number {
    return this.pool.reduce((count, item) => count + (item.active ? 1 : 0), 0);
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

function createTextTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create floating text canvas');

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

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function toCssColor(colorHex: string | number): string {
  if (typeof colorHex === 'string') return colorHex.startsWith('#') ? colorHex : `#${colorHex}`;
  return `#${colorHex.toString(16).padStart(6, '0')}`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
