export type ConvoyPoint = Readonly<{ x: number; z: number }>;

export type ConvoyRoute = Readonly<{
  id: string;
  points: readonly ConvoyPoint[];
}>;

export type ConvoyPathEntity = {
  id: string;
  position: { x: number; z: number };
  maxSpeed: number;
};

export type ConvoyBlockage = Readonly<{
  routeId: string;
  segment: number;
}>;

export type ConvoyReroute = (route: ConvoyRoute, blockage: ConvoyBlockage) => ConvoyRoute | null;

export type ConvoyDiagnostics = Readonly<{
  routeId: string;
  reroutes: number;
  leaderDistance: number;
  members: readonly Readonly<{ id: string; distance: number; gap: number; x: number; z: number }>[];
}>;

type RouteMeasure = Readonly<{
  route: ConvoyRoute;
  lengths: readonly number[];
  total: number;
}>;

export class ConvoyBehavior {
  private measure: RouteMeasure;
  private reroutes = 0;
  private lastBlockage = '';

  constructor(
    private readonly members: readonly ConvoyPathEntity[],
    route: ConvoyRoute,
    private readonly spacing: number,
  ) {
    if (members.length === 0 || spacing <= 0) throw new Error('A convoy needs members and positive spacing.');
    if (members.some((member) => !Number.isFinite(member.maxSpeed) || member.maxSpeed <= 0)) throw new Error('Convoy member speeds must be positive.');
    this.measure = measureRoute(route);
  }

  update(delta: number, blockage: ConvoyBlockage | null = null, reroute?: ConvoyReroute): void {
    if (blockage?.routeId === this.measure.route.id && reroute) this.tryReroute(blockage, reroute);
    const step = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    const leader = this.members[0]!;
    const leaderDistance = Math.min(this.measure.total, projectDistance(leader.position, this.measure) + step * leader.maxSpeed);
    moveTowardDistance(leader.position, this.measure, leaderDistance, step * leader.maxSpeed);
    const actualLeaderDistance = projectDistance(leader.position, this.measure);
    for (let index = 1; index < this.members.length; index += 1) {
      const member = this.members[index]!;
      const current = projectDistance(member.position, this.measure);
      const target = Math.max(0, actualLeaderDistance - index * this.spacing);
      if (target > current) {
        moveTowardDistance(member.position, this.measure, Math.min(target, current + step * member.maxSpeed), step * member.maxSpeed);
      }
    }
  }

  diagnostics(): ConvoyDiagnostics {
    const distances = this.members.map((member) => projectDistance(member.position, this.measure));
    return {
      routeId: this.measure.route.id,
      reroutes: this.reroutes,
      leaderDistance: round3(distances[0] ?? 0),
      members: this.members.map((member, index) => ({
        id: member.id,
        distance: round3(distances[index] ?? 0),
        gap: round3(index === 0 ? 0 : (distances[index - 1] ?? 0) - (distances[index] ?? 0)),
        x: round3(member.position.x),
        z: round3(member.position.z),
      })),
    };
  }

  private tryReroute(blockage: ConvoyBlockage, reroute: ConvoyReroute): void {
    const key = `${blockage.routeId}:${blockage.segment}`;
    if (key === this.lastBlockage) return;
    const next = reroute(this.measure.route, blockage);
    if (!next || next.id === this.measure.route.id) return;
    this.lastBlockage = key;
    this.measure = measureRoute(next);
    this.reroutes += 1;
  }
}

function measureRoute(route: ConvoyRoute): RouteMeasure {
  if (route.points.length < 2) throw new Error('A convoy route needs at least two points.');
  const lengths = route.points.slice(1).map((point, index) => Math.hypot(point.x - route.points[index]!.x, point.z - route.points[index]!.z));
  if (lengths.some((length) => length <= 0)) throw new Error('Convoy route segments need positive length.');
  const total = lengths.reduce((sum, length) => sum + length, 0);
  if (total <= 0) throw new Error('A convoy route needs positive length.');
  return { route, lengths, total };
}

function projectDistance(position: ConvoyPoint, measure: RouteMeasure): number {
  let bestDistanceSq = Infinity;
  let bestAlong = 0;
  let before = 0;
  for (let segment = 0; segment < measure.lengths.length; segment += 1) {
    const from = measure.route.points[segment]!;
    const to = measure.route.points[segment + 1]!;
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const lengthSq = dx * dx + dz * dz;
    const t = Math.min(1, Math.max(0, ((position.x - from.x) * dx + (position.z - from.z) * dz) / lengthSq));
    const x = from.x + dx * t;
    const z = from.z + dz * t;
    const distanceSq = (position.x - x) ** 2 + (position.z - z) ** 2;
    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestAlong = before + measure.lengths[segment]! * t;
    }
    before += measure.lengths[segment]!;
  }
  return bestAlong;
}

function setAtDistance(position: { x: number; z: number }, measure: RouteMeasure, distance: number): void {
  let remaining = Math.min(measure.total, Math.max(0, distance));
  for (let segment = 0; segment < measure.lengths.length; segment += 1) {
    const length = measure.lengths[segment]!;
    if (remaining <= length || segment === measure.lengths.length - 1) {
      const from = measure.route.points[segment]!;
      const to = measure.route.points[segment + 1]!;
      const t = length > 0 ? Math.min(1, remaining / length) : 0;
      position.x = from.x + (to.x - from.x) * t;
      position.z = from.z + (to.z - from.z) * t;
      return;
    }
    remaining -= length;
  }
}

function moveTowardDistance(position: { x: number; z: number }, measure: RouteMeasure, distance: number, maxStep: number): void {
  if (maxStep <= 0) return;
  const target = { x: 0, z: 0 };
  setAtDistance(target, measure, distance);
  const dx = target.x - position.x;
  const dz = target.z - position.z;
  const length = Math.hypot(dx, dz);
  if (length <= maxStep) {
    position.x = target.x;
    position.z = target.z;
    return;
  }
  position.x += (dx / length) * maxStep;
  position.z += (dz / length) * maxStep;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
