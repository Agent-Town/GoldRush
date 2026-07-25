import { LoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

type Tracker = { manager: LoadingManager; label: string; ready: number; total: number };
const trackers = new WeakMap<HTMLCanvasElement, Tracker>();

export function resetAssetLoading(canvas: HTMLCanvasElement, label: string): void {
  trackers.delete(canvas);
  publish(canvas, label, 0, 0, 'ready');
}

export function trackedGltfLoader(canvas: HTMLCanvasElement, label: string): GLTFLoader {
  let tracker = trackers.get(canvas);
  if (!tracker || tracker.label !== label) {
    const manager = new LoadingManager();
    tracker = { manager, label, ready: 0, total: 0 };
    const current = tracker;
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
    trackers.set(canvas, tracker);
  }
  return new GLTFLoader(tracker.manager).setMeshoptDecoder(MeshoptDecoder);
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
