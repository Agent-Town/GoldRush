import type { HeraldClass } from './herald';
import {
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  activeProfile,
  profileDataKey,
  rawGet,
  type ProfileStorage,
} from '../game/ProfileStorage';

// THE LIVING PAPER (specs/gazette-house/living-paper.md, owner directive 2026-08-04).
// Law 1: the paper is a FUNCTION OF THE PROFILE. Everything below is derived from facts the
// game already stores; this module reads and NEVER writes (the Runaway Generator grave).
//
// Voice laws that bind every line in this file — verify before editing copy:
//   - lore/canon-rules.md:24 THE CLOCK LAW — no year printed, no arithmetic performable on a face.
//   - lore/canon-rules.md:17 ADR-001 frontier-tech, no firearms; enemies are outlaws/companies/
//     machines/nature, never peoples; warm (empathic, never temperature), illustrated, never gory.
//   - lore/canon-rules.md:14 + lore/STORYBOOK.md:39 — the town's word for a win is FREED; the
//     Fevered are TURNED BACK. No surface ever prints killed/slain.
//   - lore/characters.md:4 — the player is THE HERO, the claim-holder. NEVER "prospector"; that
//     word belongs to the brass agent (lore/characters.md:8).
//   - lore/STORYBOOK.md:44 — the Calculating House does NOT exist yet at E1. Never name it here.
//   - src/news/herald.ts INTERNAL_HERALD_PATTERNS — no bare three-digit numbers, no CODE-1 tokens.
// New canon written for this slice lands in lore/claim-herald.md, same commit.

/** The one persistence this slice adds. Written ONLY when a player opens the reader. */
export const HERALD_LAST_READ_KEY = 'gr.herald.lastRead.v1';

/** Training, not news — the drill yard never prints (living-paper.md:20). */
export const DRILL_YARD_CONTRACT_ID = 'e1-drill-yard';
export const BARON_CONTRACT_ID = 'e1-baron';

export type EditionKind = 'arrival' | 'claim' | 'baron';

export type Edition = {
  /** Stable across renders and sessions; the archive strip keys on it. */
  id: string;
  number: number;
  kind: EditionKind;
  contractId?: string;
  eyebrow: string;
  headline: string;
  standfirst: string;
  lead: readonly string[];
  /** The deed the office posts under a secured claim; rendered as a ruled block. */
  deed?: string;
  /** Class-mapped to the existing engraving pool; null renders the reserved-plate placeholder. */
  engraving: HeraldClass | null;
};

export type LadderFacts = {
  heroName: string;
  /** null until the founding names the town; the copy falls back to "this valley". */
  townName: string | null;
  /** The player's OWN clear order. Drill yard and the Baron are excluded by construction. */
  securedContractIds: readonly string[];
  baronBeaten: boolean;
};

type CopyContext = {
  hero: string;
  town: string;
  contractName: string;
  first: boolean;
};

type ClaimCopy = {
  name: string;
  headline: string;
  standfirst: string;
  engraving: HeraldClass | null;
  lead: (context: CopyContext) => string[];
};

const HAND_COPIED_EYEBROW = 'Hand-copied at the claim office board';

// One entry per E1 contract that prints. The ids are guarded against the shipped manifest by
// e2e/gazette-living.spec.ts so a renamed contract can never silently fall through to the
// generic column. lore/characters.md:54 — until the press arrives, Chen Wei hand-copies.
const CLAIM_COPY: Readonly<Record<string, ClaimCopy>> = {
  'the-claim': {
    name: 'The Claim',
    // assets/contracts/epoch-1-frontier/contracts.json:33-41 — name, river, ford, wave ten.
    headline: 'THE RIVER CLAIM HOLDS',
    standfirst: 'The classic river claim, split around one center ford, stood through every posted wave.',
    engraving: 'river',
    lead: ({ hero, town }) => [
      `The river ground at ${town} — the old claim, split around its one center ford — is held, and it is held with ${hero} standing on it.`,
      // lore/STORYBOOK.md:39 + contracts.json:25-31 — turned-back register; four edges; tenth horn.
      'Pressure came from all four edges until the tenth horn sealed the ground. The ford held. The works held. The claim office has entered it secured.',
    ],
  },
  'e1-dry-gulch': {
    name: 'The Dry Gulch',
    // assets/contracts/epoch-1-frontier/contracts.json:153-166 — mesa, washes, spring, sluice.
    headline: 'THE DRY GULCH ANSWERS',
    standfirst: 'Mesa country, where every wash falls to one sunken spring — and a sluice works nowhere else.',
    engraving: 'trail',
    lead: ({ hero, town }) => [
      `Mesa country gave up its washes to ${hero} this season: the dry gulch above ${town}, where the ground falls every direction toward one sunken spring and a sluice will work nowhere else on the map.`,
      // contracts.json:143-166 + lore/STORYBOOK.md:39 — every edge, spring economy, held ground.
      'No river to lean on and every edge open. The spring kept washing all the while the trouble came, and the gulch is held.',
    ],
  },
  'e1-night-shift': {
    name: 'Night Shift',
    // assets/contracts/epoch-1-frontier/contracts.json:232-245 — darkness, cold lanterns, dawn.
    headline: 'THE CLAIM KEEPS ITS LIGHT',
    standfirst: 'Beyond the lamplight the night owned the claim. The posts stayed lit until dawn.',
    engraving: null,
    lead: ({ hero, town }) => [
      `${hero} worked the claim at ${town} through a night that owned everything past the lamplight, relighting cold lanterns as they went, and did not put the work down until dawn.`,
      // lore/STORYBOOK.md:39 — Fevered are turned back and walk home; contracts.json:238-245.
      'Beyond the light there was nothing to see and plenty to meet. The posts stayed lit. The fevered who came out of the dark were turned back, and in the morning they walked home.',
    ],
  },
  'e1-twin-banks': {
    name: 'Twin Banks',
    // assets/contracts/epoch-1-frontier/contracts.json:311-324 — braided river, twin fords, reeds.
    headline: 'BOTH BANKS HELD',
    standfirst: 'A braided river, twin fords, and two ways across for anyone with an appetite.',
    engraving: 'river',
    lead: ({ hero, town }) => [
      `The braided ground above ${town} is held on both sides of the water. ${hero} built on either bank and watched both fords, which is two claims' work counted by the office as one.`,
      // contracts.json:264-301,317-324 — paired markers, gravel bars, reeds, two crossings.
      'Gravel bars, damp reeds, and two crossings to keep. The stake on the south bank and the marker across the braid are both still standing.',
    ],
  },
};

export function editionLadder(facts: LadderFacts): Edition[] {
  const hero = cleanFact(facts.heroName) || 'the new hand';
  const town = cleanFact(facts.townName ?? '') || 'this valley';
  const editions: Edition[] = [arrivalEdition(hero, town)];

  for (const contractId of facts.securedContractIds) {
    editions.push(claimEdition(contractId, hero, town, editions.length + 1, editions.length === 1));
  }
  if (facts.baronBeaten) editions.push(baronEdition(hero, town, editions.length + 1));
  return editions;
}

/**
 * Reads the ladder's facts. Pure reads only — no migration, no repair, no writes: opening a
 * newspaper is not an event the save file should notice.
 */
export function readLadderFacts(storage: ProfileStorage | undefined): LadderFacts {
  if (!storage) return { heroName: '', townName: null, securedContractIds: [], baronBeaten: false };
  try {
    const profile = activeProfile(storage);
    const secured = securedClaims(storage, profile.id);
    return {
      heroName: profile.name,
      townName: readTownNameFact(storage, profile.id),
      securedContractIds: secured.filter((id) => id !== BARON_CONTRACT_ID && id !== DRILL_YARD_CONTRACT_ID),
      baronBeaten: secured.includes(BARON_CONTRACT_ID),
    };
  } catch {
    return { heroName: '', townName: null, securedContractIds: [], baronBeaten: false };
  }
}

export function currentEdition(ladder: readonly Edition[]): Edition | undefined {
  return ladder.at(-1);
}

/** The highest edition number this profile has opened; 0 when the paper has never been read. */
export function readLastReadEdition(storage: ProfileStorage | undefined): number {
  if (!storage) return 0;
  try {
    const raw = rawGet(storage, lastReadKey(storage));
    const value = Number.parseInt(raw ?? '', 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

/**
 * The slice's ONLY write, and only ever from a player opening the reader. Dupe-guarded and
 * monotonic, so a re-read of an archived edition can never un-read a newer one.
 */
export function markEditionRead(storage: ProfileStorage | undefined, editionNumber: number): void {
  if (!storage || !Number.isFinite(editionNumber) || editionNumber <= 0) return;
  try {
    const next = Math.floor(editionNumber);
    if (readLastReadEdition(storage) >= next) return;
    storage.setItem(lastReadKey(storage), String(next));
  } catch {
    // The paper still reads this session; the marker is best-effort.
  }
}

function lastReadKey(storage: ProfileStorage): string {
  // The profile-scope poison class: TownNaming.ts:42 proves the pattern — build the fully
  // scoped key by hand rather than trusting the storage shim to scope a key it never heard of.
  return profileDataKey(activeProfile(storage).id, HERALD_LAST_READ_KEY);
}

function arrivalEdition(hero: string, town: string): Edition {
  return {
    id: 'arrival',
    number: 1,
    kind: 'arrival',
    eyebrow: `Issue No. 1 · ${HAND_COPIED_EYEBROW}`,
    // lore/STORYBOOK.md:406, canon: "the Gazette prints their trade under NEW HANDS, WELCOME".
    headline: 'NEW HANDS, WELCOME',
    standfirst: `A name is entered in the claim book at ${town}, which is rarer here than a good season.`,
    engraving: 'ledger',
    lead: [
      `${hero} has come to ${town}, and the clerk has written the name into the claim book.`,
      // The rarity engine, fully canon at E1 — lore/STORYBOOK.md:33 (THE SPARING).
      'That book does not fill often, and everyone here knows why. The Baron panned this creek before the first roof went up, found the color thin, and wrote the valley spent on his own survey maps — and the money of the wider world reads those maps like scripture. The road brings us wagons that do not stop. A hand who stops is an event.',
      // lore/agent-town-heritage.md:8 — the clerk's ledger is the future citizen registry.
      // lore/STORYBOOK.md:35 + :406 — a plate at the fire, no questions on it.
      `So the board carries the name, hand-copied, until the day this town owns a press of its own. Nobody at the wagon ring will ask ${hero} what they left behind. There is a plate at that fire, and there always has been.`,
      'Below: the rest of the welcome — what a claim is, what the works cost, and whose side the fevered are really on.',
    ],
  };
}

function claimEdition(contractId: string, hero: string, town: string, number: number, first: boolean): Edition {
  const copy = CLAIM_COPY[contractId];
  const contractName = copy?.name ?? fallbackContractName(contractId);
  const context: CopyContext = { hero, town, contractName, first };
  const lead = copy ? copy.lead(context) : fallbackLead(context);
  return {
    id: `claim-${contractId}`,
    number,
    kind: 'claim',
    contractId,
    eyebrow: `Issue No. ${number} · ${HAND_COPIED_EYEBROW}`,
    headline: first ? 'THE FIRST CLAIM HOLDS' : (copy?.headline ?? fallbackHeadline(contractName)),
    standfirst: copy?.standfirst ?? `The ground called ${contractName} is held.`,
    engraving: copy ? copy.engraving : 'board',
    lead: first ? [firstClaimOpener(hero), ...lead] : lead,
    deed: `Be it known — the ground called ${contractName}, at ${town}, was held through every posted wave and stands entered as secured in the clerk's book, under the hand of ${hero}.`,
  };
}

function firstClaimOpener(hero: string): string {
  return `The new hand is a new hand no longer. ${hero}, whose name this paper entered not so long ago, has secured a claim outright — the first of them — and the office has posted the deed for anyone who cares to read it.`;
}

function baronEdition(hero: string, town: string, number: number): Edition {
  return {
    id: 'baron',
    number,
    kind: 'baron',
    eyebrow: `Issue No. ${number} · ${HAND_COPIED_EYEBROW}`,
    headline: 'THE BARON IS TURNED BACK',
    standfirst: 'The oxblood banner came up the valley at the twentieth horn. It did not go back up it.',
    engraving: 'boss',
    lead: [
      // lore/characters.md:23 + the e1-baron manifest's own defeatBeat, verbatim.
      'Dragged off by his own men, swearing revenge.',
      `The banner arrived before the bill, the way it always does, and the Rocket Cart that came with it is captured and standing at ${town} where anyone may walk up and look at it.`,
      // lore/characters.md:20 — his armies are victims; turned back, never slain.
      'Say the next part plainly, because this paper prints nothing it cannot prove: the outfit he sent was no outfit at all. They were neighbours with gold dust in the creases of their faces, and they were freed — every one of them — and every one of them went home.',
      // lore/STORYBOOK.md:33 + lore/characters.md:22 — the pride-wound: he returns to be RIGHT.
      `He was in this valley first. He called the ground here spent, in his own hand, on his own maps, and he has spent every season since trying to make that paper true. ${town} is the standing correction. ${hero} is the hand that wrote this line of it.`,
    ],
    // lore/world-dispatches.md:35, VERBATIM — that file is the single source for dispatch text
    // and its law is "never invent lines". Ratification question 2, default YES: one paragraph,
    // no mechanics named.
    deed: "The first stamp's iron drop carries down the valley, past the bend, out over the flats. Somewhere past the hills, something lifts its head — and acquires a taste for steam.",
  };
}

function fallbackContractName(contractId: string): string {
  const words = contractId.replace(/^e\d+-/, '').split('-').filter(Boolean);
  if (words.length === 0) return 'the claim';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function fallbackHeadline(contractName: string): string {
  return `${contractName.toUpperCase()} IS HELD`;
}

function fallbackLead({ hero, town, contractName }: CopyContext): string[] {
  return [
    `The ground the office calls ${contractName} stood through every posted wave, and it stood with ${hero} on it.`,
    `Another page of the claim book at ${town} is spoken for. The town is that much harder to write off.`,
  ];
}

/**
 * The player's own clear order, earliest first. The scoreboard is the fact store: a run that
 * secured a contract carries `secured: true` and the contract's id (src/game/Scoreboard.ts:16).
 * Read raw from BOTH the profile-scoped and the flat key — the storage shim scopes one and the
 * start-menu activation path leaves the other behind (the F-BT-4 duality).
 */
function securedClaims(storage: ProfileStorage, profileId: string): string[] {
  const earliest = new Map<string, number>();
  for (const key of [profileDataKey(profileId, SCOREBOARD_KEY), SCOREBOARD_KEY]) {
    for (const record of parseScores(rawGet(storage, key))) {
      if (record.secured !== true) continue;
      const contractId = typeof record.contractId === 'string' ? record.contractId.trim() : '';
      if (!contractId) continue;
      const at = typeof record.at === 'number' && Number.isFinite(record.at) ? record.at : Number.MAX_SAFE_INTEGER;
      const known = earliest.get(contractId);
      if (known === undefined || at < known) earliest.set(contractId, at);
    }
  }
  // Ties break on the id so two runs stamped in the same millisecond still order identically
  // on every render — law 1's determinism clause reaches all the way down here.
  return [...earliest.entries()]
    .sort((a, b) => (a[1] === b[1] ? a[0].localeCompare(b[0]) : a[1] - b[1]))
    .map(([contractId]) => contractId);
}

function parseScores(raw: string | null): Record<string, unknown>[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

function readTownNameFact(storage: ProfileStorage, profileId: string): string | null {
  const raw = rawGet(storage, profileDataKey(profileId, TOWN_NAME_KEY));
  const value = cleanFact(raw ?? '');
  return value ? value : null;
}

function cleanFact(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
