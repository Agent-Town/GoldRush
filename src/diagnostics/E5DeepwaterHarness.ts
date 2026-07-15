import { ClaimBoat } from '../entities/ClaimBoat';
import { Balance } from '../game/Balance';
import { StormWaveScheduler, type StormWaveEvent } from '../systems/StormWaveScheduler';
import { WaterRegionTile, type WaterTravelClass } from '../world/WaterRegion';

export type E5DeepwaterSnapshot = Readonly<{
  tile: { id: string; size: number; regions: ReturnType<WaterRegionTile['sample']>[] };
  boat: ReturnType<ClaimBoat['snapshot']>;
  storm: ReturnType<StormWaveScheduler['snapshot']>;
  log: readonly string[];
  hash: string;
}>;

export type E5DeepwaterHarness = Readonly<{
  advance: (seconds: number) => E5DeepwaterSnapshot;
  placeBuilding: (padId: string, buildingId: string) => boolean;
  reanchor: (anchorId: string) => boolean;
  reset: () => E5DeepwaterSnapshot;
  sample: (x: number, z: number, travelClass: WaterTravelClass) => ReturnType<WaterRegionTile['sample']>;
  snapshot: () => E5DeepwaterSnapshot;
}>;

export function installE5DeepwaterHarnessFromSearch(search = window.location.search): void {
  const params = new URLSearchParams(search);
  if (!params.has('debug') || !params.has('deepwater')) return;

  const tile = new WaterRegionTile(Balance.e5.waterTile);
  const log: string[] = [];
  let time = 0;
  let boat = new ClaimBoat(Balance.e5.claimBoat);
  let scheduler = createScheduler(log);
  const canvas = installCanvas();

  const snapshot = (): E5DeepwaterSnapshot => {
    const value = {
      tile: {
        id: tile.params.id,
        size: tile.params.size,
        regions: [
          tile.sample(0, 50, 'boat'),
          tile.sample(0, 30, 'swim'),
          tile.sample(20, 0, 'boat'),
          tile.sample(0, 0, 'boat'),
          tile.sample(0, -24, 'depth'),
          tile.sample(0, -56, 'depth'),
        ],
      },
      boat: boat.snapshot(),
      storm: scheduler.snapshot(),
      log: [...log],
    };
    return { ...value, hash: hashText(JSON.stringify(value)) };
  };
  const render = (): E5DeepwaterSnapshot => {
    const value = snapshot();
    draw(canvas, value);
    return value;
  };
  const api: E5DeepwaterHarness = {
    advance(seconds) {
      time += Math.max(0, Number.isFinite(seconds) ? seconds : 0);
      scheduler.advance(time);
      return render();
    },
    placeBuilding(padId, buildingId) {
      const placed = boat.placeBuilding(padId, buildingId);
      if (placed) log.push(`building:${buildingId}:${padId}`);
      render();
      return placed;
    },
    reanchor(anchorId) {
      const moved = boat.reanchor(anchorId);
      if (moved) log.push(`anchor:${anchorId}`);
      render();
      return moved;
    },
    reset() {
      time = 0;
      log.length = 0;
      boat = new ClaimBoat(Balance.e5.claimBoat);
      scheduler = createScheduler(log);
      return render();
    },
    sample: (x, z, travelClass) => tile.sample(x, z, travelClass),
    snapshot,
  };

  window.__GR_E5_DEEPWATER__ = api;
  render();
}

function createScheduler(log: string[]): StormWaveScheduler {
  return new StormWaveScheduler(
    {
      weather: { era: 5, contractId: Balance.e5.waterTile.id, ...Balance.e5.weather },
      westX: -Balance.e5.waterTile.size / 2,
      eastX: Balance.e5.waterTile.size / 2,
    },
    (event: StormWaveEvent) => log.push(`wave:${event.wave}:storm-${event.cycle}:west-to-east@${event.scheduledAt}`),
  );
}

function installCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 560;
  canvas.dataset.testid = 'e5-deepwater-harness';
  Object.assign(canvas.style, {
    position: 'fixed', left: '50%', bottom: '12px', width: 'min(94vw, 960px)', height: 'auto',
    transform: 'translateX(-50%)', border: '3px solid #8b7d3c', borderRadius: '8px', zIndex: '30', pointerEvents: 'none',
  });
  document.body.append(canvas);
  return canvas;
}

function draw(canvas: HTMLCanvasElement, snapshot: E5DeepwaterSnapshot): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const project = (x: number, z: number) => ({ x: 480 + x * 3.6, y: 280 - z * 3.6 });
  context.fillStyle = '#163d43';
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const region of Balance.e5.waterTile.regions) {
    const northWest = project(region.minX, region.maxZ);
    const southEast = project(region.maxX, region.minZ);
    context.fillStyle = depthColor(region.depth);
    context.fillRect(northWest.x, northWest.y, southEast.x - northWest.x, southEast.y - northWest.y);
  }
  context.strokeStyle = '#d5b76f';
  context.lineWidth = 2;
  context.strokeRect(249.6, 49.6, 460.8, 460.8);

  const anchor = project(snapshot.boat.anchor.x, snapshot.boat.anchor.z);
  context.save();
  context.translate(anchor.x, anchor.y);
  context.fillStyle = '#7b5637';
  context.strokeStyle = '#d5b76f';
  context.lineWidth = 4;
  context.fillRect(-42, -22, 84, 44);
  context.strokeRect(-42, -22, 84, 44);
  for (const pad of snapshot.boat.pads) {
    context.fillStyle = pad.occupied ? '#5b8a8a' : '#f5e6c8';
    context.beginPath();
    context.arc(pad.x * 7, -pad.z * 7, 8, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  if (snapshot.storm.frontX !== null) {
    const front = project(snapshot.storm.frontX, 0);
    context.strokeStyle = '#c5d8d3';
    context.lineWidth = 8;
    context.setLineDash([18, 10]);
    context.beginPath();
    context.moveTo(front.x, 50);
    context.lineTo(front.x, 510);
    context.stroke();
    context.setLineDash([]);
  }

  context.fillStyle = '#fff8e8';
  context.font = 'bold 26px serif';
  context.fillText('THE SHELF REEFS · CLAIM-BOAT DEV TILE', 24, 34);
  context.font = '19px serif';
  context.fillText(`weather ${snapshot.storm.weather.phase} · waves ${snapshot.storm.waves.length} · anchor ${snapshot.boat.anchor.id}`, 24, 548);
}

function depthColor(depth: number): string {
  if (depth <= -8) return '#08252c';
  if (depth <= -4) return '#0d343b';
  if (depth <= -2) return '#315b59';
  if (depth <= -1) return '#5b8a80';
  return '#2d6970';
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
