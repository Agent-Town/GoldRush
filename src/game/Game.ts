import * as THREE from 'three';
import { InputController } from '../core/InputController';
import { Loop } from '../core/Loop';
import { createRenderer, resizeRenderer } from '../core/Renderer';
import { Pickup } from '../entities/Pickup';
import { Player } from '../entities/Player';
import { AudioSystem } from '../systems/AudioSystem';
import { CameraRig } from '../systems/CameraRig';
import { CollisionSystem } from '../systems/CollisionSystem';
import { DebugTools, type DebugTuning } from '../systems/DebugTools';
import { Hud } from '../systems/Hud';
import * as Terrain from '../world/Terrain';
import type { TerrainView } from '../world/Terrain';

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  private readonly input: InputController;
  private readonly player = new Player();
  private terrainView?: TerrainView;
  private readonly pickups: Pickup[] = [];
  private readonly collision = new CollisionSystem();
  private readonly audio = new AudioSystem();
  private readonly hud = new Hud();
  private readonly cameraRig = new CameraRig(this.camera);
  private readonly loop = new Loop(
    (delta, elapsed) => this.update(delta, elapsed),
    () => this.render(),
  );

  private readonly tuning: DebugTuning = {
    speed: 5.8,
    dashMultiplier: 1.75,
    acceleration: 13,
    cameraLag: 0.16,
    exposure: 1.05,
    maxDpr: 2,
  };

  private readonly debugTools: DebugTools;
  private frame = 0;
  private score = 0;
  private elapsed = 0;
  private complete = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = createRenderer(canvas);
    this.renderer.toneMappingExposure = this.tuning.exposure;

    const stick = this.getElement('#touch-stick');
    const knob = this.getElement('#touch-knob');
    const dashButton = this.getElement('#dash-button');
    this.input = new InputController(stick, knob, dashButton);

    this.debugTools = new DebugTools(this.tuning, () => {
      this.renderer.toneMappingExposure = this.tuning.exposure;
      resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    });

    this.createScene();
    this.hud.setTarget(this.pickups.length);
    this.cameraRig.snapTo(this.player.group.position);
    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.publishDiagnostics();
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.loop.stop();
    this.input.dispose();
    this.audio.dispose();
    this.debugTools.dispose();
    for (const pickup of this.pickups) pickup.dispose();
    this.player.dispose();
    this.renderer.dispose();
    window.__THREE_GAME_DIAGNOSTICS__ = undefined;
  }

  private update(delta: number, elapsed: number): void {
    this.frame += 1;
    if (!this.complete) this.elapsed += delta;

    resizeRenderer(this.renderer, this.camera, this.tuning.maxDpr);
    this.terrainView?.update(delta);
    this.player.update(delta, elapsed, this.input, this.tuning, Terrain.bounds, Terrain.sample);

    for (const pickup of this.pickups) {
      pickup.update(delta, elapsed);
    }

    const collected = this.collision.collectPickups(this.player.group.position, this.pickups, 0.55);
    for (const pickup of collected) {
      this.score += 1;
      this.audio.pickup(pickup.index);
      this.hud.flashPickup();
    }

    if (this.score >= this.pickups.length) {
      this.complete = true;
    }

    this.cameraRig.update(delta, this.player.group.position, this.tuning.cameraLag);
    this.hud.update(this.score, this.pickups.length, this.elapsed, this.complete);
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
    this.player.group.position.set(0, 0.06, 12);
    this.scene.add(this.player.group);
    this.createPickups();
  }

  private createPickups(): void {
    const positions = [
      [-18, -8],
      [-10, -11],
      [-2, -8.5],
      [8, -10],
      [18, -8],
      [-15, 8],
      [-5, 10.5],
      [6, 8.5],
      [15, 11],
    ];

    positions.forEach(([x, z], index) => {
      if (!Terrain.sample(x, z).walkable) return;
      const pickup = new Pickup(index, new THREE.Vector3(x, 0.8, z));
      this.pickups.push(pickup);
      this.scene.add(pickup.group);
    });
  }

  private publishDiagnostics(): void {
    const info = this.renderer.info;
    window.__THREE_GAME_DIAGNOSTICS__ = {
      frame: this.frame,
      elapsed: this.elapsed,
      score: this.score,
      targetScore: this.pickups.length,
      complete: this.complete,
      player: {
        position: {
          x: this.player.group.position.x,
          y: this.player.group.position.y,
          z: this.player.group.position.z,
        },
        speed: this.player.velocity.length(),
      },
      renderer: {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      },
      terrain: {
        playerZone: Terrain.sample(this.player.group.position.x, this.player.group.position.z).zone,
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

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Missing element: ${selector}`);
    return element;
  }
}
