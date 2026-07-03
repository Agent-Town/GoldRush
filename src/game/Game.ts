import * as THREE from 'three';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { Hero } from '../entities/Hero';
import { Balance } from './Balance';
import { CameraRig } from '../systems/CameraRig';
import { DebugTools, type DebugTuning } from '../systems/DebugTools';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(Balance.camera.fov, 1, 0.1, 100);
  private readonly input: InputController;
  private readonly hero = new Hero();
  private readonly timerValue = this.getElement('#timer-value');
  private terrainView?: TerrainView;
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly loop = new Loop(
    (delta) => this.update(delta),
    () => this.render(),
  );

  private readonly tuning: DebugTuning = {
    exposure: Balance.render.exposure,
    maxDpr: Balance.render.maxDpr,
  };

  private readonly debugTools: DebugTools;
  private frame = 0;
  private elapsed = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const confirmButton = this.getElement('#confirm-button');
    this.input = new InputController(stick, knob, confirmButton);

    this.debugTools = new DebugTools(this.tuning, () => {
      this.renderer.toneMappingExposure = this.tuning.exposure;
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.createScene();
    this.cameraRig.snapTo(this.hero.group.position);
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    this.debugTools.dispose();
    this.hero.dispose();
    this.renderer.dispose();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number): void {
    this.frame += 1;
    this.elapsed += delta;

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.terrainView?.update(delta);
    this.hero.update(delta, this.input.readIntents(), { bounds: Terrain.bounds, sample: Terrain.sample });
    this.cameraRig.update(delta, this.hero.group.position, this.hero.velocity);
    this.updateTimeAlive();
    this.publishDiagnostics();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private createScene(): void {
    this.scene.background = new THREE.Color('#c2e6ff');
    this.scene.fog = new THREE.Fog('#f5e6c8', 34, 70);

    const hemisphere = new THREE.HemisphereLight('#fff8e8', '#8b7d3c', 1.45);
    this.scene.add(hemisphere);

    const sun = new THREE.DirectionalLight('#ffe4a0', 2.7);
    sun.position.set(-10, 14, -8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    this.scene.add(sun);

    this.terrainView = Terrain.createTerrainView();
    this.scene.add(this.terrainView.group);
    this.hero.group.position.set(0, 0.06, 12);
    this.scene.add(this.hero.group);
  }

  private publishDiagnostics(): void {
    const info = this.renderer.info;
    const heroPos = {
      x: this.hero.group.position.x,
      y: this.hero.group.position.y,
      z: this.hero.group.position.z,
    };
    const speed = this.hero.velocity.length();
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      score: 0,
      targetScore: 0,
      complete: false,
      heroPos,
      speed,
      player: {
        position: heroPos,
        speed,
      },
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      terrain: {
        playerZone: Terrain.sample(this.hero.group.position.x, this.hero.group.position.z).zone,
        probes: {
          bank: Terrain.sample(-12, -12),
          shallows: Terrain.sample(-12, -5.5),
          river: Terrain.sample(-12, 0),
          ford: Terrain.sample(0, 0),
          northBank: Terrain.sample(12, 12),
          out: Terrain.sample(40, 0),
        },
      },
      canvas: {
        clientWidth: this.canvas.clientWidth,
        clientHeight: this.canvas.clientHeight,
        width: this.canvas.width,
        height: this.canvas.height,
        dpr: Math.min(window.devicePixelRatio || 1, this.tuning.maxDpr),
      },
    };
  }

  private updateTimeAlive(): void {
    const minutes = Math.floor(this.elapsed / 60).toString().padStart(2, '0');
    const seconds = Math.floor(this.elapsed % 60).toString().padStart(2, '0');
    this.timerValue.textContent = `${minutes}:${seconds}`;
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}
