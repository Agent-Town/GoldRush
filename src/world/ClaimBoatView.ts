import { Group } from 'three';
import { trackedGltfLoader } from '../assets/AssetLoading';
import type { ClaimBoat } from '../entities/ClaimBoat';
import { disposeObject3D } from '../utils/dispose';
import body from '../../assets/pilots/claim-boat-3d/claim-boat-contract.json';

/** Presentation of the existing single-hull owner; Flotilla owns three separate hulls. */
export class ClaimBoatView {
  readonly group = new Group();
  private disposed = false;
  private ready = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly boat: () => ClaimBoat) {
    this.group.name = 'ClaimBoatView';
    canvas.dataset.claimBoatBody = 'loading';
    this.update();
    trackedGltfLoader(canvas, 'the claim').load(
      new URL('../../assets/pilots/claim-boat-3d/claim-boat.glb', import.meta.url).href,
      ({ scene }) => {
        if (this.disposed) { disposeObject3D(scene); return; }
        this.group.add(scene);
        this.ready = true;
        canvas.dataset.claimBoatBody = 'ready';
      },
      undefined,
      () => { if (!this.disposed) canvas.dataset.claimBoatBody = 'error'; },
    );
  }

  update(): void {
    const { anchor } = this.boat().snapshot();
    this.group.position.set(anchor.x, body.waterlineY, anchor.z);
  }

  deckYAt(x: number, z: number): number | undefined {
    if (!this.ready || this.disposed) return undefined;
    x -= this.group.position.x; z -= this.group.position.z;
    const bounds = body.deckBounds;
    return x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ
      ? body.deckY : undefined;
  }

  dispose(): void {
    this.disposed = true;
    disposeObject3D(this.group);
    this.group.clear();
    this.group.removeFromParent();
    this.canvas.dataset.claimBoatBody = 'disposed';
  }
}
