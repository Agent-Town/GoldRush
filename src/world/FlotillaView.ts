import { Group } from 'three';
import { trackedGltfLoader } from '../assets/AssetLoading';
import type { FlotillaHullSystem } from '../systems/FlotillaHullSystem';
import { disposeObject3D } from '../utils/dispose';
import bodies from '../../assets/pilots/flotilla-3d/flotilla-contract.json';

const urls = [
  new URL('../../assets/pilots/flotilla-3d/kitchen-scow.glb', import.meta.url).href,
  new URL('../../assets/pilots/flotilla-3d/turret-raft.glb', import.meta.url).href,
  new URL('../../assets/pilots/flotilla-3d/still-room-barge.glb', import.meta.url).href,
];

/** Static bodies follow the shared hull owner; they never move or damage simulation objects. */
export class FlotillaView {
  readonly group = new Group();
  private disposed = false;
  private readonly hulls = bodies.hulls.map(body => ({ body, group: new Group(), ready: false }));

  constructor(private readonly canvas: HTMLCanvasElement, private readonly owner: FlotillaHullSystem) {
    this.group.name = 'FlotillaView';
    canvas.dataset.flotillaBodies = 'loading';
    for (const [i, hull] of this.hulls.entries()) {
      hull.group.name = hull.body.id;
      this.group.add(hull.group);
      trackedGltfLoader(canvas, 'the claim').load(urls[i], ({ scene }) => {
        if (this.disposed) { disposeObject3D(scene); return; }
        hull.group.add(scene);
        hull.ready = true;
        if (this.hulls.every(h => h.ready)) canvas.dataset.flotillaBodies = 'ready';
      }, undefined, () => { if (!this.disposed) canvas.dataset.flotillaBodies = 'error'; });
    }
    this.update();
  }

  update(): void {
    for (const state of this.owner.diagnostics.hulls) {
      const hull = this.hulls.find(h => h.body.id === state.id);
      if (!hull) continue;
      hull.group.position.set(state.x, 0, state.z);
      hull.group.visible = !state.lost;
    }
  }

  deckYAt(x: number, z: number): number | undefined {
    if (this.disposed) return undefined;
    for (const hull of this.hulls) {
      if (!hull.ready || !hull.group.visible) continue;
      const localX = x - hull.group.position.x, localZ = z - hull.group.position.z;
      // Authored convex deck outlines are clockwise in game X/Z coordinates.
      const outline = hull.body.deckOutline;
      if (outline.every((a, i) => {
        const b = outline[(i + 1) % outline.length];
        return (b[0] - a[0]) * (localZ - a[1]) - (b[1] - a[1]) * (localX - a[0]) <= 1e-8;
      })) return hull.body.deckY;
    }
    return undefined;
  }

  dispose(): void {
    this.disposed = true;
    disposeObject3D(this.group);
    this.group.clear();
    this.group.removeFromParent();
    this.canvas.dataset.flotillaBodies = 'disposed';
  }
}
