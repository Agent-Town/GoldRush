import { Balance } from '../game/Balance';
import { OrbitSpawner } from '../systems/OrbitSpawner';
import { RoadNetwork, type FriendlyRoadState } from '../systems/RoadSegment';

export type E4OrbitRoadSnapshot = Readonly<{
  time: number;
  orbit: ReturnType<OrbitSpawner['snapshot']>;
  roads: ReturnType<RoadNetwork['diagnostics']>;
  friendly: Readonly<{
    road: FriendlyRoadState;
    dirt: FriendlyRoadState;
    speedRatio: number;
    fuelRatio: number;
  }>;
  enemyRoute: ReturnType<RoadNetwork['chooseEnemyRoute']>;
  hash: string;
}>;

export type E4OrbitRoadHarness = Readonly<{
  advance: (seconds: number) => E4OrbitRoadSnapshot;
  reset: () => E4OrbitRoadSnapshot;
  snapshot: () => E4OrbitRoadSnapshot;
}>;

const STEP = 1 / 30;

export function installE4OrbitRoadHarnessFromSearch(search = window.location.search): void {
  const params = new URLSearchParams(search);
  if (!params.has('debug') || !params.has('e4orbit')) return;

  const canvas = installCanvas();
  const roads = new RoadNetwork();
  roads.build('east-west-grade', { x: -60, z: 0 }, { x: 60, z: 0 });
  const orbit = new OrbitSpawner({
    contractId: 'dust-flats-dev',
    enabled: true,
    center: { x: 0, z: 0 },
    peelPoints: [{ id: 'east-cut', angle: 0 }, { id: 'north-cut', angle: Math.PI / 2 }],
    ...Balance.e4Orbit,
  });
  let time = 0;
  let roadVehicle = freshVehicle(0);
  let dirtVehicle = freshVehicle(8);

  const snapshot = (): E4OrbitRoadSnapshot => {
    const enemyRoute = roads.chooseEnemyRoute([
      { id: 'dirt-shortcut', points: [{ x: -10, z: 8 }, { x: 10, z: 8 }] },
      { id: 'graded-road', points: [{ x: -12, z: 0 }, { x: 12, z: 0 }] },
    ]);
    const value = {
      time: round3(time),
      orbit: orbit.snapshot(time),
      roads: roads.diagnostics(),
      friendly: {
        road: roundedVehicle(roadVehicle),
        dirt: roundedVehicle(dirtVehicle),
        speedRatio: round3(roadVehicle.distance / Math.max(0.001, dirtVehicle.distance)),
        fuelRatio: round3((30 - roadVehicle.fuel) / Math.max(0.001, 30 - dirtVehicle.fuel)),
      },
      enemyRoute,
    };
    return { ...value, hash: hashText(JSON.stringify(value)) };
  };
  const render = (): E4OrbitRoadSnapshot => {
    const value = snapshot();
    draw(canvas, value);
    return value;
  };
  const reset = (): E4OrbitRoadSnapshot => {
    time = 0;
    roadVehicle = freshVehicle(0);
    dirtVehicle = freshVehicle(8);
    orbit.reset();
    orbit.spawnWave(1, 3, 0);
    return render();
  };
  const advance = (seconds: number): E4OrbitRoadSnapshot => {
    let remaining = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    while (remaining > 0) {
      const delta = Math.min(STEP, remaining);
      time += delta;
      roadVehicle = roads.moveFriendly(roadVehicle, { x: 1, z: 0 }, delta);
      dirtVehicle = roads.moveFriendly(dirtVehicle, { x: 1, z: 0 }, delta);
      remaining -= delta;
    }
    return render();
  };

  window.__GR_E4_ORBIT_ROAD__ = { advance, reset, snapshot };
  reset();
}

function freshVehicle(z: number): FriendlyRoadState {
  return { x: -40, z, fuel: 30, distance: 0 };
}

function roundedVehicle(vehicle: FriendlyRoadState): FriendlyRoadState {
  return { x: round3(vehicle.x), z: round3(vehicle.z), fuel: round3(vehicle.fuel), distance: round3(vehicle.distance) };
}

function installCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 480;
  canvas.dataset.testid = 'e4-orbit-road-harness';
  canvas.getContext('2d', { willReadFrequently: true });
  Object.assign(canvas.style, {
    position: 'fixed', left: '50%', bottom: '12px', width: 'min(92vw, 960px)', height: 'auto',
    transform: 'translateX(-50%)', border: '3px solid #5d3d24', borderRadius: '8px', zIndex: '30', pointerEvents: 'none',
  });
  document.body.append(canvas);
  return canvas;
}

function draw(canvas: HTMLCanvasElement, snapshot: E4OrbitRoadSnapshot): void {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const map = (value: number) => canvas.width / 2 + value * 8;
  context.fillStyle = '#e8c27f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#9b6a36';
  context.lineWidth = 24;
  context.beginPath();
  context.moveTo(map(-60), canvas.height / 2);
  context.lineTo(map(60), canvas.height / 2);
  context.stroke();
  context.strokeStyle = '#75502d';
  context.lineWidth = 5;
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, snapshot.orbit.radius * 8, 0, Math.PI * 2);
  context.stroke();
  for (const member of snapshot.orbit.members) {
    context.fillStyle = member.state === 'peeled' ? '#c75b32' : member.telegraphed ? '#f0b94b' : '#5f756f';
    context.beginPath();
    context.arc(map(member.x), canvas.height / 2 + member.z * 8, 10, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = '#4d3323';
  context.font = 'bold 25px serif';
  context.fillText(`ORBIT ROAD · ${snapshot.time.toFixed(1)}s · ${snapshot.enemyRoute.routeId}`, 24, 38);
  context.font = '19px serif';
  context.fillText(`road speed ×${snapshot.friendly.speedRatio} · fuel ×${snapshot.friendly.fuelRatio} · peel warnings ${snapshot.orbit.members.filter((member) => member.telegraphed).length}`, 24, 68);
}

function hashText(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
