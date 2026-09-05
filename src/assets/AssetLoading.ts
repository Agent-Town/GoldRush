import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { SharedAtlasCache, SharedAtlasPlugin } from './SharedAtlasPlugin';

type Tracker = { manager: LoadingManager; label: string; ready: number; total: number; atlases: SharedAtlasCache };
const trackers = new WeakMap<HTMLCanvasElement, Tracker>();

export function resetAssetLoading(canvas: HTMLCanvasElement, label: string): void {
  trackers.get(canvas)?.atlases.clear();
  trackers.set(canvas, createTracker(canvas, label));
  publish(canvas, label, 0, 0, 'ready');
}

function createTracker(canvas: HTMLCanvasElement, label: string): Tracker {
  const manager = new LoadingManager();
  const current: Tracker = { manager, label, ready: 0, total: 0, atlases: new SharedAtlasCache() };
  const itemStart = manager.itemStart.bind(manager);
  const itemEnd = manager.itemEnd.bind(manager);
  manager.itemStart = (url) => {
    current.total += 1;
    if (trackers.get(canvas) === current) publish(canvas, label, current.ready, current.total, 'loading');
    itemStart(url);
  };
  manager.itemEnd = (url) => {
    current.ready += 1;
    if (trackers.get(canvas) === current) {
      publish(canvas, label, current.ready, current.total, current.ready < current.total ? 'loading' : 'ready');
    }
    itemEnd(url);
  };
  return current;
}

export function trackedGltfLoader(canvas: HTMLCanvasElement, label: string): GLTFLoader {
  let tracker = trackers.get(canvas);
  if (!tracker) {
    tracker = createTracker(canvas, label);
    trackers.set(canvas, tracker);
  } else if (tracker.label !== label) {
    // A disposed town can still retry a failed load after the run has reset.
    // Such requests must not replace the new scene's tracker or close its images.
    tracker = createTracker(canvas, label);
    tracker.atlases.clear();
  }
  const cache = tracker.atlases;
  return new GLTFLoader(tracker.manager).setMeshoptDecoder(MeshoptDecoder)
    .register((parser) => new SharedAtlasPlugin(parser, cache));
}

export function sharedAtlasCacheSize(canvas: HTMLCanvasElement): number | undefined {
  if (!new URLSearchParams(window.location.search).has('debug')) return undefined;
  return trackers.get(canvas)?.atlases.size ?? 0;
}

export function createAssetLoadingCue(): HTMLElement {
  const cue = document.createElement('p');
  cue.className = 'asset-loading-cue';
  cue.dataset.testid = 'asset-loading-cue';
  cue.setAttribute('role', 'status');
  cue.setAttribute('aria-live', 'polite');
  cue.setAttribute('aria-atomic', 'true');
  cue.hidden = true;
  return cue;
}

export function syncAssetLoadingCue(canvas: HTMLCanvasElement, cue: HTMLElement): void {
  const ready = Number(canvas.dataset.assetLoadingReady ?? 0);
  const total = Number(canvas.dataset.assetLoadingTotal ?? 0);
  const townAlreadyWarm =
    canvas.dataset.assetLoadingLabel === 'the town' && canvas.dataset.assetPrefetchTownState === 'ready';
  const visible = !townAlreadyWarm && canvas.dataset.assetLoadingState === 'loading' && total > ready;
  cue.hidden = !visible;
  if (!visible) return;
  const text = `${canvas.dataset.assetLoadingLabel ?? 'the claim'} is raising… ${ready}/${total}`;
  if (cue.textContent !== text) cue.textContent = text;
}

function publish(
  canvas: HTMLCanvasElement,
  label: string,
  ready: number,
  total: number,
  state: 'loading' | 'ready',
): void {
  canvas.dataset.assetLoadingLabel = label;
  canvas.dataset.assetLoadingReady = String(ready);
  canvas.dataset.assetLoadingTotal = String(total);
  canvas.dataset.assetLoadingProgress = `${ready}/${total}`;
  canvas.dataset.assetLoadingState = state;
}
