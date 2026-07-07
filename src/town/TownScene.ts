import './town.css';
import * as THREE from 'three';
import { CameraRig } from '../systems/CameraRig';
import { Hero } from '../entities/Hero';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { RenderLayers } from '../core/RenderLayers';
import { palette } from '../assets/palette';
import { Balance } from '../game/Balance';
import { disposeObject3D } from '../utils/dispose';
import { townBuildings, type TownBuilding, type TownBuildingId } from './townLayout';

const TOWN_HALF = 15;
const TOWN_BOUNDS = { minX: -TOWN_HALF, maxX: TOWN_HALF, minZ: -TOWN_HALF, maxZ: TOWN_HALF };
const HERO_START = new THREE.Vector3(0, 0.06, 0);
const APPROACH_RADIUS = 5.2;

export type TownDiagnostics = {
  frame: number;
  elapsed: number;
  player: { x: number; z: number };
  activePrompt: TownBuildingId | null;
  renderer: { calls: number; geometries: number; textures: number };
  canvas: { width: number; height: number; dpr: number };
};

type HiddenButtonState = {
  element: HTMLElement;
  hidden: HTMLElement['hidden'];
};

export class TownScene {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly hero = new Hero();
  private readonly input: InputController;
  private readonly loop = new Loop((delta) => this.update(delta), () => this.render());
  private readonly ui = document.createElement('section');
  private readonly prompt = document.createElement('div');
  private readonly hiddenButtons: HiddenButtonState[];
  private frame = 0;
  private elapsed = 0;
  private activePrompt: TownBuilding | null = null;
  private lastExitIntent = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onExit: () => void,
  ) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = 1.02;
    this.input = new InputController(this.getElement('#touch-stick'), this.getElement('#touch-knob'), this.getElement('#confirm-button'));
    this.hiddenButtons = this.hideTownActionButtons();
    this.createScene();
    this.createUi();
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    this.cameraRig.snapTo(this.hero.group.position);
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    for (const state of this.hiddenButtons) state.element.hidden = state.hidden;
    this.ui.remove();
    this.hero.dispose();
    disposeObject3D(this.scene);
    this.scene.clear();
    this.renderer.dispose();
    window.__GR_TOWN_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    this.elapsed += delta;
    resizeRenderer(this.renderer, this.camera, Balance.render.maxDpr);
    const intents = this.input.readIntents();
    const exitIntent = intents.cancel || intents.pause;
    if (exitIntent && !this.lastExitIntent) {
      this.onExit();
      return;
    }
    this.lastExitIntent = exitIntent;

    this.hero.update(delta, intents, { bounds: TOWN_BOUNDS, sample: townSample });
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.syncPrompt();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.camera);
  }

  private createScene(): void {
    this.scene.name = 'TownScene';
    this.scene.background = new THREE.Color('#e9c98d');
    this.scene.fog = new THREE.Fog('#e9c98d', 34, 76);
    this.scene.add(new THREE.HemisphereLight('#fff2cc', '#8b6c3f', 1.15));

    const sun = new THREE.DirectionalLight('#ffd28a', 2.2);
    sun.position.set(-22, 18, -18);
    sun.castShadow = true;
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(TOWN_HALF * 2, TOWN_HALF * 2),
      new THREE.MeshStandardMaterial({
        color: palette.sand,
        map: createGroundTexture(),
        roughness: 0.9,
        metalness: 0.02,
      }),
    );
    ground.name = 'TownSquareGround';
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.renderOrder = RenderLayers.terrain;
    this.scene.add(ground, createSquareEdge());

    for (const building of townBuildings) {
      this.scene.add(createShell(building));
    }

    this.hero.group.position.copy(HERO_START);
    this.scene.add(this.hero.group);
  }

  private createUi(): void {
    this.ui.className = 'town-ui';
    this.ui.dataset.testid = 'town-ui';
    this.ui.setAttribute('aria-label', 'Town square');
    this.ui.innerHTML = `
      <div class="town-ui__bar">
        <div class="town-ui__title">
          <strong>Town Square</strong>
          <span>Four doors stand ready.</span>
        </div>
        <button class="town-ui__exit" type="button" data-testid="town-exit">Exit</button>
      </div>
      <div class="town-ui__prompt-stack" data-testid="town-prompt-stack"></div>
    `;
    this.prompt.className = 'town-ui__prompt';
    this.prompt.dataset.testid = 'town-approach-prompt';
    this.prompt.setAttribute('role', 'status');
    this.prompt.setAttribute('aria-live', 'polite');
    this.prompt.hidden = true;
    this.ui.querySelector('[data-testid="town-prompt-stack"]')?.append(this.prompt);
    this.ui.querySelector('[data-testid="town-exit"]')?.addEventListener('click', this.onExitClick);
    this.getElement('#app').append(this.ui);
  }

  private readonly onExitClick = () => {
    this.onExit();
  };

  private syncPrompt(): void {
    const position = this.hero.group.position;
    let nearest: TownBuilding | null = null;
    let nearestDistanceSq = APPROACH_RADIUS * APPROACH_RADIUS;
    for (const building of townBuildings) {
      const dx = position.x - building.position.x;
      const dz = position.z - building.position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq < nearestDistanceSq) {
        nearest = building;
        nearestDistanceSq = distanceSq;
      }
    }
    this.activePrompt = nearest;
    this.prompt.hidden = nearest === null;
    if (nearest) this.prompt.textContent = `${nearest.name} ... opens soon`;
  }

  private publishDiagnostics(): void {
    const dpr = this.renderer.getPixelRatio();
    window.__GR_TOWN_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      player: {
        x: round2(this.hero.group.position.x),
        z: round2(this.hero.group.position.z),
      },
      activePrompt: this.activePrompt?.id ?? null,
      renderer: {
        calls: this.renderer.info.render.calls,
        geometries: this.renderer.info.memory.geometries,
        textures: this.renderer.info.memory.textures,
      },
      canvas: {
        width: this.canvas.width,
        height: this.canvas.height,
        dpr,
      },
    };
  }

  private hideTownActionButtons(): HiddenButtonState[] {
    const states: HiddenButtonState[] = [];
    for (const id of ['#confirm-button', '#rotate-button', '#weapon-toggle-button']) {
      const element = document.querySelector<HTMLElement>(id);
      if (!element) continue;
      states.push({ element, hidden: element.hidden });
      element.hidden = true;
    }
    return states;
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);
    return element;
  }
}

function townSample(x: number, z: number) {
  if (x < TOWN_BOUNDS.minX || x > TOWN_BOUNDS.maxX || z < TOWN_BOUNDS.minZ || z > TOWN_BOUNDS.maxZ) {
    return { walkable: false, speedMul: 0, zone: 'out' as const };
  }
  return {
    walkable: !shellAt(x, z),
    speedMul: 1,
    zone: 'bank' as const,
  };
}

function shellAt(x: number, z: number): boolean {
  const pad = Balance.hero.radius + 0.08;
  return townBuildings.some((building) => {
    const halfX = building.footprint.w / 2 + pad;
    const halfZ = building.footprint.d / 2 + pad;
    return Math.abs(x - building.position.x) <= halfX && Math.abs(z - building.position.z) <= halfZ;
  });
}

function createShell(building: TownBuilding): THREE.Group {
  const group = new THREE.Group();
  group.name = `TownShell:${building.id}`;
  group.position.set(building.position.x, 0, building.position.z);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w, 1.38, building.footprint.d),
    new THREE.MeshStandardMaterial({ color: building.color, roughness: 0.82, metalness: 0.03 }),
  );
  base.position.y = 0.69;
  base.castShadow = true;
  base.receiveShadow = true;

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w + 0.5, 0.34, building.footprint.d + 0.42),
    new THREE.MeshStandardMaterial({ color: building.roof, roughness: 0.72, metalness: 0.1 }),
  );
  roof.position.y = 1.52;
  roof.rotation.z = -0.035;
  roof.castShadow = true;

  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(building.footprint.w * 0.72, 0.12, 0.78),
    new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.8, metalness: 0.02 }),
  );
  porch.position.set(0, 0.1, building.footprint.d / 2 + 0.36);

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(Math.min(2.2, building.footprint.w * 0.5), 0.24, 0.05),
    new THREE.MeshStandardMaterial({ color: building.accent, roughness: 0.64, metalness: 0.08 }),
  );
  plaque.position.set(0, 0.88, building.footprint.d / 2 + 0.04);

  const label = createLabel(building.name);
  label.position.set(0, 2.28, building.footprint.d / 2 + 0.26);

  group.add(base, roof, porch, plaque, label);
  return group;
}

function createLabel(text: string): THREE.Sprite {
  const width = 512;
  const height = 160;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(245, 230, 200, 0.96)';
    roundRect(ctx, 18, 28, width - 36, 92, 18);
    ctx.fill();
    ctx.strokeStyle = '#2e1b0e';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#2e1b0e';
    ctx.font = '700 46px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, 74);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.name = `TownPlaque:${text}`;
  sprite.scale.set(3.5, 1.1, 1);
  sprite.renderOrder = RenderLayers.worldUi;
  return sprite;
}

function createGroundTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = palette.sand;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(139, 125, 60, 0.22)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - size * 0.3, size);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 248, 232, 0.34)';
    for (let i = 0; i <= size; i += 64) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i + size * 0.18);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function createSquareEdge(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TownSquareEdge';
  const material = new THREE.MeshStandardMaterial({ color: '#7a5132', roughness: 0.82, metalness: 0.02 });
  const long = new THREE.BoxGeometry(TOWN_HALF * 2, 0.12, 0.18);
  const short = new THREE.BoxGeometry(0.18, 0.12, TOWN_HALF * 2);
  for (const z of [-TOWN_HALF, TOWN_HALF]) {
    const rail = new THREE.Mesh(long, material);
    rail.position.set(0, 0.08, z);
    group.add(rail);
  }
  for (const x of [-TOWN_HALF, TOWN_HALF]) {
    const rail = new THREE.Mesh(short, material);
    rail.position.set(x, 0.08, 0);
    group.add(rail);
  }
  return group;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
