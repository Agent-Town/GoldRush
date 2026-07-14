import { Balance } from '../game/Balance';
import { ConvoyBehavior, type ConvoyPathEntity, type ConvoyRoute } from '../systems/ConvoyBehavior';
import { WeatherSystem } from '../systems/WeatherSystem';

export type E4ConvoyWeatherSnapshot = Readonly<{
  time: number;
  convoy: ReturnType<ConvoyBehavior['diagnostics']>;
  weather: ReturnType<WeatherSystem['sample']>;
  fog: Readonly<{ color: string; near: number; far: number }>;
  hash: string;
}>;

export type E4ConvoyWeatherHarness = Readonly<{
  advance: (seconds: number) => E4ConvoyWeatherSnapshot;
  movementProbe: () => Readonly<{ tooCloseFollower: number; lateReroute: readonly number[]; maxSteps: readonly number[] }>;
  reset: () => E4ConvoyWeatherSnapshot;
  snapshot: () => E4ConvoyWeatherSnapshot;
}>;

const STEP = 1 / 30;
const MAIN_ROUTE: ConvoyRoute = Object.freeze({
  id: 'dust-road-main',
  points: Object.freeze([{ x: 0, z: 0 }, { x: 10, z: 0 }, { x: 20, z: 0 }]),
});
const DETOUR_ROUTE: ConvoyRoute = Object.freeze({
  id: 'dust-road-detour',
  points: Object.freeze([{ x: 0, z: 0 }, { x: 7, z: 0 }, { x: 7, z: 6 }, { x: 13, z: 6 }, { x: 13, z: 0 }, { x: 20, z: 0 }]),
});

export function installE4ConvoyWeatherHarnessFromSearch(search = window.location.search): void {
  const params = new URLSearchParams(search);
  if (!params.has('debug') || !params.has('e4convoyweather')) return;

  let time = 0;
  let members = createMembers();
  let convoy = createConvoy(members);
  const weather = new WeatherSystem({ era: 4, contractId: 'dust-flats-dev', ...Balance.weather });
  const canvas = installCanvas();

  const snapshot = (): E4ConvoyWeatherSnapshot => {
    const weatherSnapshot = weather.sample(time);
    const value = {
      time: round3(time),
      convoy: convoy.diagnostics(),
      weather: weatherSnapshot,
      fog: {
        color: weatherSnapshot.hazeStrength > 0 ? weatherSnapshot.hazeColor : '#ead2a3',
        near: round3(Balance.world.fogNear * weatherSnapshot.visibilityMultiplier),
        far: round3(Balance.world.fogFar * weatherSnapshot.visibilityMultiplier),
      },
    };
    return { ...value, hash: hashText(JSON.stringify(value)) };
  };
  const render = (): E4ConvoyWeatherSnapshot => {
    const value = snapshot();
    draw(canvas, value);
    return value;
  };
  const reset = (): E4ConvoyWeatherSnapshot => {
    time = 0;
    members = createMembers();
    convoy = createConvoy(members);
    return render();
  };
  const advance = (seconds: number): E4ConvoyWeatherSnapshot => {
    let remaining = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    while (remaining > 0) {
      const delta = Math.min(STEP, remaining);
      time += delta;
      convoy.update(delta * weather.sample(time).movementMultiplier, { routeId: MAIN_ROUTE.id, segment: 1 }, () => DETOUR_ROUTE);
      remaining -= delta;
    }
    return render();
  };

  window.__GR_E4_CONVOY_WEATHER__ = { advance, movementProbe, reset, snapshot };
  render();
}

function movementProbe(): Readonly<{ tooCloseFollower: number; lateReroute: readonly number[]; maxSteps: readonly number[] }> {
  const delta = STEP;
  const tooClose = [
    { id: 'leader', position: { x: 6, z: 0 }, maxSpeed: 6 },
    { id: 'follower', position: { x: 5, z: 0 }, maxSpeed: 7.5 },
  ];
  const tooCloseStart = { ...tooClose[1]!.position };
  new ConvoyBehavior(tooClose, MAIN_ROUTE, 3).update(delta);

  const rerouting = [
    { id: 'leader', position: { x: 10, z: 0 }, maxSpeed: 6 },
    { id: 'follower', position: { x: 7, z: 0 }, maxSpeed: 7.5 },
  ];
  const rerouteStarts = rerouting.map((member) => ({ ...member.position }));
  new ConvoyBehavior(rerouting, MAIN_ROUTE, 3).update(delta, { routeId: MAIN_ROUTE.id, segment: 1 }, () => DETOUR_ROUTE);

  return {
    tooCloseFollower: distance(tooClose[1]!.position, tooCloseStart),
    lateReroute: rerouting.map((member, index) => distance(member.position, rerouteStarts[index]!)),
    maxSteps: rerouting.map((member) => delta * member.maxSpeed),
  };
}

function createMembers(): ConvoyPathEntity[] {
  return [
    { id: 'tram-leader', position: { x: 6, z: 0 }, maxSpeed: 1 },
    { id: 'hauler-two', position: { x: 3, z: 0 }, maxSpeed: Balance.convoy.catchupMultiplier },
    { id: 'hauler-three', position: { x: 0, z: 0 }, maxSpeed: Balance.convoy.catchupMultiplier },
  ];
}

function createConvoy(members: readonly ConvoyPathEntity[]): ConvoyBehavior {
  return new ConvoyBehavior(members, MAIN_ROUTE, Balance.convoy.spacing);
}

function installCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 320;
  canvas.dataset.testid = 'e4-convoy-weather-harness';
  Object.assign(canvas.style, {
    position: 'fixed', left: '50%', bottom: '16px', width: 'min(92vw, 960px)', height: 'auto',
    transform: 'translateX(-50%)', border: '3px solid #5d3d24', borderRadius: '8px', zIndex: '30', pointerEvents: 'none',
  });
  document.body.append(canvas);
  return canvas;
}

function draw(canvas: HTMLCanvasElement, snapshot: E4ConvoyWeatherSnapshot): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#e8c27f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#79502e';
  context.lineWidth = 18;
  context.lineCap = 'round';
  context.beginPath();
  DETOUR_ROUTE.points.forEach((point, index) => {
    const x = 90 + point.x * 38;
    const y = 235 - point.z * 25;
    if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
  });
  context.stroke();
  snapshot.convoy.members.forEach((member, index) => {
    context.fillStyle = index === 0 ? '#23747b' : '#c79a42';
    context.beginPath();
    context.arc(90 + member.x * 38, 235 - member.z * 25, 18, 0, Math.PI * 2);
    context.fill();
  });
  context.fillStyle = '#4d3323';
  context.font = 'bold 26px serif';
  context.fillText(`CONVOY · ${snapshot.convoy.routeId} · ${snapshot.weather.phase.toUpperCase()}`, 28, 42);
  context.font = '20px serif';
  context.fillText(`spacing ${Balance.convoy.spacing} · movement ×${snapshot.weather.movementMultiplier} · visibility ×${snapshot.weather.visibilityMultiplier}`, 28, 76);
  if (snapshot.weather.hazeStrength > 0) {
    context.globalAlpha = snapshot.weather.hazeStrength;
    context.fillStyle = snapshot.weather.hazeColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
  }
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

function distance(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return round3(Math.hypot(a.x - b.x, a.z - b.z));
}
