import type { RunTape } from '../game/RunTape';
import { applyStoredPerformanceTier } from '../game/PerformanceTier';
import { stageReplayContract } from '../meta/ContractFamilies';
import { markStartupFrameReady } from '../assets/generated';
import { LanternController } from './LanternController';

/** One contract per page: stage BEFORE dynamically evaluating Terrain/TileHeight, as the worker does. */
export async function bootLantern(parent: HTMLElement, tape: RunTape, options: {
  shareUrl: string;
  close: () => void;
  tactical: boolean;
}): Promise<{ dispose: () => void }> {
  stageReplayContract(tape.contract);
  const tier = applyStoredPerformanceTier(tape.contract).tier;
  const { LanternWorldStage, lanternHeightAt } = await import('../world/LanternWorldStage');
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  const hasWebGL = gl !== null;
  gl?.getExtension('WEBGL_lose_context')?.loseContext();
  const world = hasWebGL ? new LanternWorldStage() : undefined;
  const tactical = options.tactical || tier === 'lite' || !world;
  // Lite still constructs the same painted ground; the explicitly labelled SVG is its current presentation.
  if (world && tactical) world.canvas.hidden = true;
  const controller = new LanternController(parent, tape, {
    ...options, tactical, world, heightAt: lanternHeightAt,
    pan: (dx, dz) => world?.pan(dx, dz),
    render: (frame, snapshot, paused, speed) => {
      world?.update(snapshot);
      world?.render(frame.deltaSeconds, paused, speed);
    },
  });
  const show = parent.querySelector<HTMLElement>('[data-testid="lantern-show"]');
  if (show) {
    show.dataset.boot = 'independent';
    show.dataset.tier = tier;
    show.dataset.worldSource = world ? world.canvas.dataset.terrain3dPilotRenderSource ?? 'painted' : 'unavailable';
    show.dataset.fallback = !hasWebGL ? 'no-webgl' : tier === 'lite' ? 'lite' : options.tactical ? 'requested' : '';
  }
  markStartupFrameReady();
  return { dispose: () => { controller.dispose(); world?.dispose(); } };
}
