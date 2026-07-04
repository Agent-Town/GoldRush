export const rotationDirections = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw'] as const;

export type RotationDirection = (typeof rotationDirections)[number];
export type CoarseOrientation = 'front' | 'back' | 'side';

const sectorDegrees = 45;
const holdDegrees = 22.5 + 10;
const directionAngles: Record<RotationDirection, number> = {
  s: 0,
  se: 45,
  e: 90,
  ne: 135,
  n: 180,
  nw: 225,
  w: 270,
  sw: 315,
};
const rotationDirectionSet = new Set<string>(rotationDirections);

export class OrientationResolver {
  private direction: RotationDirection = 's';
  private hasDirection = false;

  resolve(x: number, z: number): RotationDirection {
    const angle = normalizeDegrees((Math.atan2(x, z) * 180) / Math.PI);
    if (!this.hasDirection) {
      this.direction = directionFromDegrees(angle);
      this.hasDirection = true;
      return this.direction;
    }

    if (angleDistance(angle, directionAngles[this.direction]) <= holdDegrees) return this.direction;
    this.direction = directionFromDegrees(angle);
    return this.direction;
  }

  idleDirection(): RotationDirection {
    return idleDirectionFor(this.direction);
  }

  reset(direction: RotationDirection = 's'): void {
    this.direction = direction;
    this.hasDirection = false;
  }
}

export function isRotationDirection(value: string): value is RotationDirection {
  return rotationDirectionSet.has(value);
}

export function idleDirectionFor(direction: RotationDirection): RotationDirection {
  return direction === 'n' || direction === 'ne' || direction === 'nw' ? 'n' : 's';
}

export function coarseOrientationForDirection(direction: RotationDirection): CoarseOrientation {
  if (direction === 'n') return 'back';
  if (direction === 's') return 'front';
  return 'side';
}

export function isMirroredRotationDirection(direction: RotationDirection): boolean {
  return direction === 'w' || direction === 'sw' || direction === 'nw';
}

function directionFromDegrees(degrees: number): RotationDirection {
  return rotationDirections[Math.round(degrees / sectorDegrees) & 7]!;
}

function normalizeDegrees(degrees: number): number {
  return degrees < 0 ? degrees + 360 : degrees;
}

function angleDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}
