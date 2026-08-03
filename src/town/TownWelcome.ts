import { TOWN_WELCOME_SEEN_KEY, type ProfileStorage } from '../game/ProfileStorage';
import { townPlazaSlot, type TownBuildingId } from './townLayout';

export type TownWelcomePhase = 'idle' | 'delivery' | 'paper' | 'walk';

export const TOWN_WELCOME_BEATS = [
  {
    id: 'tavern-board',
    buildingId: 'tavern',
    guide: 'First stop: the Tavern board. Walk with me — no rush.',
    line: 'The Tavern board posts your first claim; the separate Drill Yard is practice with nothing at stake.',
  },
  {
    id: 'the-works',
    buildingId: 'general_store',
    guide: 'Next stop: the works stake, where claim plans begin.',
    line: 'Gold raises palisades, turrets, and beacons. Build where the trouble walks.',
  },
  {
    id: 'schoolhouse-chart',
    buildingId: 'schoolhouse',
    guide: 'Last stop: the Schoolhouse chart.',
    line: 'The Schoolhouse charts science between claims. Every claim carries the town forward.',
  },
] as const satisfies readonly {
  id: string;
  buildingId: TownBuildingId;
  guide: string;
  line: string;
}[];

const ARRIVAL_RADIUS = 2.4;

export class TownWelcome {
  private phase: TownWelcomePhase = 'idle';
  private deliveryReady = false;
  private beatIndex = 0;
  private arrived = false;

  get active(): boolean {
    return this.phase !== 'idle';
  }

  get followsPlayer(): boolean {
    return this.phase === 'delivery' || this.phase === 'walk';
  }

  beginFirst(paperAlreadyRead = false, storage = browserStorage()): boolean {
    try {
      if (storage?.getItem(TOWN_WELCOME_SEEN_KEY) !== '0') return false;
      storage.setItem(TOWN_WELCOME_SEEN_KEY, '1');
    } catch {
      return false;
    }
    this.phase = paperAlreadyRead ? 'walk' : 'delivery';
    this.deliveryReady = false;
    this.beatIndex = 0;
    this.arrived = false;
    return true;
  }

  arriveWithPaper(): void {
    if (this.phase === 'delivery') this.deliveryReady = true;
  }

  takePaper(): boolean {
    if (this.phase !== 'delivery' || !this.deliveryReady) return false;
    this.phase = 'paper';
    return true;
  }

  paperClosed(): void {
    if (this.phase === 'paper') this.replayWalk();
  }

  replayWalk(): void {
    this.phase = 'walk';
    this.beatIndex = 0;
    this.arrived = false;
  }

  update(position: { x: number; z: number }): void {
    const beat = this.currentBeat();
    if (this.phase !== 'walk' || !beat || this.arrived) return;
    const anchor = townPlazaSlot(beat.buildingId).approach;
    this.arrived = Math.hypot(position.x - anchor.x, position.z - anchor.z) <= ARRIVAL_RADIUS;
  }

  advance(): void {
    if (this.phase !== 'walk' || !this.arrived) return;
    if (this.beatIndex === TOWN_WELCOME_BEATS.length - 1) {
      this.skip();
      return;
    }
    this.beatIndex += 1;
    this.arrived = false;
  }

  skip(): void {
    this.phase = 'idle';
    this.deliveryReady = false;
    this.arrived = false;
  }

  snapshot() {
    return {
      active: this.active,
      phase: this.phase,
      deliveryReady: this.deliveryReady,
      beat: this.currentBeat(),
      arrived: this.arrived,
      seenKey: TOWN_WELCOME_SEEN_KEY,
    };
  }

  private currentBeat(): (typeof TOWN_WELCOME_BEATS)[number] | undefined {
    return this.phase === 'walk' ? TOWN_WELCOME_BEATS[this.beatIndex] : undefined;
  }
}

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
