import { activeProfile, markHintSeen, type ProfileStorage } from '../game/ProfileStorage';

const RELEASE_E1 = typeof __GR_RELEASE_E1__ !== 'undefined' && __GR_RELEASE_E1__;

export type WorldInfoObjectClass =
  | 'gold_seam'
  | 'sentry_beacon'
  | 'palisade'
  | 'sluice'
  | 'stockpile'
  | 'boiler_house'
  | 'turret'
  | 'lantern_post'
  | 'decoy_shed'
  | 'capacitor_bank'
  | 'assay_office'
  | 'claim_stake'
  | 'spring_pond'
  | 'water_source'
  | 'open_water'
  | 'ford'
  | 'territory_ring_gap'
  | 'baron_standard'
  | 'megaproject_site'
  | 'drill_straw_man'
  | 'prospector'
  | 'town_tavern'
  | 'town_claim_office'
  | 'town_schoolhouse'
  | 'town_assay_office';

export type WorldInfoNote = {
  objectClass: WorldInfoObjectClass;
  title: string;
  lines: readonly string[];
  actionHint?: string;
  persistent?: false;
};

export type WorldInfoNoteTarget = {
  objectClass: WorldInfoObjectClass;
};

export const WORLD_INFO_NOTES: readonly WorldInfoNote[] = [
  {
    objectClass: 'gold_seam',
    title: 'Gold Seam',
    lines: ['A seam. Stand close and the pan works itself.'],
  },
  {
    objectClass: 'sentry_beacon',
    title: 'Sentry Beacon',
    lines: ['A brass lamp that throws spark bolts while you work.'],
    actionHint: 'More beacons widen the watched ground.',
  },
  {
    objectClass: 'palisade',
    title: 'Palisade',
    lines: ['A timber lane wall. Higher tier means more hit points.'],
  },
  {
    objectClass: 'sluice',
    title: 'Sluice Works',
    lines: ['Washes gold over time beside water. Higher tier means faster, richer pans.'],
  },
  {
    objectClass: 'stockpile',
    title: 'Stockpile Yard',
    lines: ['Raises the bank cap and gives thieves a place to raid instead of your pockets.'],
  },
  {
    objectClass: 'boiler_house',
    title: 'Boiler House',
    lines: ['Coal goes in; pressure climbs. Above the safe band, the valve vents with a warm puff.'],
  },
  {
    objectClass: 'turret',
    title: 'Signal Turret',
    lines: ['A frontier-tech spark tower. Higher tier means harder, faster overwatch.'],
  },
  {
    objectClass: 'lantern_post',
    title: 'Lantern Post',
    lines: ['A cheap light post for Night Shift. It keeps danger readable in the dark.'],
  },
  {
    objectClass: 'decoy_shed',
    title: 'Decoy Shed',
    lines: ['A lit sacrifice for migration week. Rebuild it when the moth tithe brings it down.'],
  },
  {
    objectClass: 'assay_office',
    title: 'Assay Office',
    lines: ["Write an order; the town's craftsmen answer."],
    actionHint: 'Enter opens the bench.',
  },
  {
    objectClass: 'claim_stake',
    title: 'Claim Stake',
    lines: ['The heart of the claim. Lose it and the run is done.'],
  },
  {
    objectClass: 'spring_pond',
    title: 'Spring Pond',
    lines: ['Dry Gulch water. Sluices work here because the river is gone.'],
  },
  {
    objectClass: 'water_source',
    title: 'Water',
    lines: ['Sluice Works need water nearby. Their placement preview shows where they can stand.'],
  },
  {
    objectClass: 'open_water',
    title: 'Open Water',
    lines: ['Workshops stand on the Claim-Boat’s numbered deck anchors.'],
  },
  {
    objectClass: 'ford',
    title: 'Ford',
    lines: ['The only crossing bandits know.'],
  },
  {
    objectClass: 'territory_ring_gap',
    title: 'Kill-Lane Gap',
    lines: ['Your kill-lanes. Enemies funnel here.'],
  },
  {
    objectClass: 'baron_standard',
    title: "The Baron's Standard",
    lines: ["The Baron's standard. He'll want it back."],
  },
  {
    objectClass: 'megaproject_site',
    title: RELEASE_E1 ? 'The Stamp Mill stands ready.' : 'Stamp Mill Site',
    lines: [RELEASE_E1 ? 'The era turns when the wider world sends word.' : 'The Steamworks door. Fund stages, hold waves, and the mill rises.'],
    actionHint: RELEASE_E1 ? undefined : 'The site signboard carries the dedicated mill readout.',
  },
  {
    objectClass: 'drill_straw_man',
    title: 'Straw men',
    lines: ["Straw men; they don't mind."],
    persistent: false,
  },
  {
    objectClass: 'capacitor_bank',
    title: 'Capacitor Bank',
    lines: ['Stores surplus current, then keeps the lights breathing through a cut trunk.'],
  },
  {
    objectClass: 'prospector',
    title: 'The Prospector',
    lines: ['Your deputy. G opens its charter. Select it, then click a seam to send it panning.'],
  },
  {
    objectClass: 'town_tavern',
    title: 'Tavern',
    lines: ['The contract board lives here. Choose the next claim from the town ledger.'],
  },
  {
    objectClass: 'town_claim_office',
    title: 'Claim Office',
    lines: ['Your civic ledger. It keeps the town name and secured-claim records.'],
  },
  {
    objectClass: 'town_schoolhouse',
    title: 'Schoolhouse',
    lines: ['Future lessons gather here. Science turns survived claims into new craft.'],
  },
  {
    objectClass: 'town_assay_office',
    title: 'Town Assay Office',
    lines: ['The town side of orders. Crafted answers come back through this ledger.'],
  },
];

const noteByClass = new Map(WORLD_INFO_NOTES.map((note) => [note.objectClass, note]));
const NOTE_HINT_PREFIX = 'world-info:';
const FULL_APPROACHES = 2;

export class WorldInfoNotePrompt {
  private readonly root = document.createElement('details');
  private readonly title = document.createElement('summary');
  private readonly body = document.createElement('p');
  private readonly hint = document.createElement('span');
  private activeClass: WorldInfoObjectClass | null = null;
  private countedApproach = false;
  private readonly compactScreen = matchMedia('(pointer: coarse) and (max-height: 600px), (max-width: 760px) and (max-height: 600px)');

  constructor(parent: HTMLElement, private readonly storage: ProfileStorage | undefined = browserStorage()) {
    this.root.className = 'world-info-note';
    this.root.dataset.testid = 'world-info-note';
    this.root.setAttribute('aria-live', 'polite');
    this.root.hidden = true;
    this.root.addEventListener('toggle', () => this.syncDisclosure());
    this.title.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' || event.code === 'Space') event.stopPropagation();
    });
    this.title.className = 'world-info-note__title';
    this.title.dataset.testid = 'world-info-note-title';
    this.body.className = 'world-info-note__body';
    this.body.dataset.testid = 'world-info-note-body';
    this.hint.className = 'world-info-note__hint';
    this.hint.dataset.testid = 'world-info-note-hint';
    this.root.append(this.title, this.body, this.hint);
    parent.append(this.root);
  }

  update(target: WorldInfoNoteTarget | null): void {
    const note = target ? noteByClass.get(target.objectClass) : undefined;
    this.root.hidden = !note;
    if (!note) {
      this.activeClass = null;
      this.root.name = '';
      return;
    }

    if (this.activeClass !== note.objectClass) {
      this.activeClass = note.objectClass;
      this.countedApproach = false;
      this.root.open = !this.compactScreen.matches && (note.persistent === false || seenCount(note.objectClass, this.storage) < FULL_APPROACHES);
    }

    const groupName = this.compactScreen.matches ? 'map-context' : '';
    if (this.root.name !== groupName) this.root.name = groupName;
    this.root.dataset.objectClass = note.objectClass;
    this.syncDisclosure();
    this.title.textContent = note.title;
    this.body.textContent = note.lines.slice(0, 2).join(' ');
    this.hint.textContent = note.actionHint ?? '';
    this.hint.hidden = !note.actionHint;
  }

  private syncDisclosure(): void {
    this.root.dataset.compact = String(!this.root.open);
    this.root.classList.toggle('world-info-note--compact', !this.root.open);
    if (this.root.open && this.activeClass && !this.countedApproach) {
      if (noteByClass.get(this.activeClass)?.persistent !== false) markApproach(this.activeClass, this.storage);
      this.countedApproach = true;
    }
  }

  dispose(): void {
    this.root.remove();
  }
}

export function worldInfoNoteFor(objectClass: WorldInfoObjectClass): WorldInfoNote | undefined {
  return noteByClass.get(objectClass);
}

function seenCount(objectClass: WorldInfoObjectClass, storage: ProfileStorage | undefined): number {
  if (!storage) return 0;
  try {
    const seen = activeProfile(storage).hintsSeen;
    let count = 0;
    for (let index = 1; index <= FULL_APPROACHES; index += 1) {
      if (seen.includes(hintId(objectClass, index))) count += 1;
    }
    return count;
  } catch {
    return 0;
  }
}

function markApproach(objectClass: WorldInfoObjectClass, storage: ProfileStorage | undefined): void {
  if (!storage) return;
  const next = seenCount(objectClass, storage) + 1;
  if (next <= FULL_APPROACHES) markHintSeen(storage, hintId(objectClass, next));
}

function hintId(objectClass: WorldInfoObjectClass, index: number): string {
  return `${NOTE_HINT_PREFIX}${objectClass}:${index}`;
}

function browserStorage(): ProfileStorage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
