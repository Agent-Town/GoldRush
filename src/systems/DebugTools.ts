import GUI from 'lil-gui';
import * as THREE from 'three';
import { Balance } from '../game/Balance';

export type DebugTuning = {
  exposure: number;
  maxDpr: number;
  cameraLag: number;
  cameraLookAhead: number;
  cameraOffsetY: number;
  cameraOffsetZ: number;
  cameraDownScreenLookOffset: number;
};

type MutableRecord = Record<string, unknown>;

const SKIP_KEYS = new Set([
  'pool',
  'poolSize',
  'motePool',
  'separationRadiusSq',
  'groundY',
  'logCapacity',
]);

// Init-captured pool/debug constants and derived values are intentionally not live-bound.
export function setBalance(path: string, value: number | boolean | string): boolean {
  const normalizedPath = path.startsWith('rig.') ? `sparkRig.${path.slice(4)}` : path;
  const keys = normalizedPath.split('.');
  let target: unknown = Balance;
  for (let i = 0; i < keys.length - 1; i += 1) {
    target = (target as MutableRecord | undefined)?.[keys[i]];
  }
  const key = keys[keys.length - 1];
  if (!key || !target) return false;
  const current = (target as MutableRecord)[key];
  if (typeof current !== typeof value || !['number', 'boolean', 'string'].includes(typeof current)) return false;
  (target as MutableRecord)[key] = value;
  recomputeDerived(normalizedPath);
  return true;
}

export class DebugTools {
  private gui: GUI | null = null;

  constructor(tuning: DebugTuning, onChange: () => void) {
    const enabled = new URLSearchParams(window.location.search).has('debug');
    if (!enabled) return;

    this.gui = new GUI({ title: 'Game tuning' });
    window.__GR_GUI__ = this.gui;
    this.gui.add({ copyJson: () => console.log(JSON.stringify(Balance)) }, 'copyJson').name('Copy JSON');
    this.gui.add(tuning, 'maxDpr', 1, 2, 0.25).onChange(onChange);
    this.gui.add(tuning, 'exposure', 0.6, 1.8, 0.01).onChange(onChange);
    const camera = this.gui.addFolder('Camera');
    camera.add(tuning, 'cameraLag', 0.02, 0.2, 0.005).onChange(onChange);
    camera.add(tuning, 'cameraLookAhead', 0, 3, 0.05).onChange(onChange);
    camera.add(tuning, 'cameraOffsetY', 12, 30, 0.1).onChange(onChange);
    camera.add(tuning, 'cameraOffsetZ', 6, 24, 0.1).onChange(onChange);
    camera.add(tuning, 'cameraDownScreenLookOffset', 0, 5, 0.05).onChange(onChange);
    this.bindFolders(onChange);
    this.gui.close();
  }

  dispose(): void {
    this.gui?.destroy();
    this.gui = null;
    window.__GR_GUI__ = undefined;
  }

  private bindFolders(onChange: () => void): void {
    if (!this.gui) return;
    const groups: Array<[string, string]> = [
      ['Hero', 'hero'],
      ['Spark Rig', 'sparkRig'],
      ['Blast Charge', 'blast'],
      ['Enemy', 'enemy'],
      ['Waves', 'waves'],
      ['Gold Seams', 'goldSeam'],
      ['Beacons', 'beacon'],
      ['Turret', 'turret'],
      ['Sluice', 'sluice'],
      ['Stockpile', 'stockpile'],
      ['Steal', 'steal'],
      ['Wreck', 'wreck'],
      ['Economy', 'economy'],
      ['XP', 'xp'],
      ['Offers', 'offers'],
      ['Terrain', 'terrain'],
      ['Terrain Sim', 'terrainSim'],
      ['World', 'world'],
      ['Sprite', 'sprite'],
      ['Charm', 'charm'],
    ];
    for (const [label, key] of groups) this.bindObject(this.gui.addFolder(label), key, Balance[key as keyof typeof Balance], onChange);
  }

  private bindObject(folder: GUI, prefix: string, value: unknown, onChange: () => void): void {
    if (!value || typeof value !== 'object') return;
    const object = value as MutableRecord;
    for (const [key, child] of Object.entries(object)) {
      const path = `${prefix}.${key}`;
      if (shouldSkip(key)) continue;
      if (child instanceof THREE.Vector3) {
        folder.add(child, 'x', -40, 40, 0.05).name(`${key}.x`).onChange(onChange);
        folder.add(child, 'y', -40, 40, 0.05).name(`${key}.y`).onChange(onChange);
        folder.add(child, 'z', -40, 40, 0.05).name(`${key}.z`).onChange(onChange);
      } else if (typeof child === 'number') {
        folder.add(object, key, numericMin(child), numericMax(child), numericStep(child)).onChange(() => {
          recomputeDerived(path);
          onChange();
        });
      } else if (typeof child === 'boolean') {
        folder.add(object, key).onChange(onChange);
      } else if (child && typeof child === 'object') {
        this.bindObject(folder.addFolder(key), path, child, onChange);
      }
    }
  }
}

function shouldSkip(key: string): boolean {
  return SKIP_KEYS.has(key) || key.startsWith('spatialHash') || key.startsWith('debugPack');
}

function recomputeDerived(path: string): void {
  if (path === 'enemy.separationRadius') {
    (Balance.enemy as MutableRecord).separationRadiusSq = Balance.enemy.separationRadius * Balance.enemy.separationRadius;
  }
}

function numericMin(value: number): number {
  return value < 0 ? value * 2 : 0;
}

function numericMax(value: number): number {
  return Math.max(1, value * 3);
}

function numericStep(value: number): number {
  return Math.abs(value) < 2 ? 0.01 : 0.1;
}
