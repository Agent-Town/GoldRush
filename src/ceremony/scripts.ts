import type { SoundName } from '../audio/manifest';
import type { ConvoyPoint } from '../systems/ConvoyBehavior';

// ─── THE CEREMONY SCRIPT FORMAT ──────────────────────────────────────────────
// lore/STORYBOOK.md §THE INTERSTITIALS is RATIFIED LAW: "ceremonies are PLAYED,
// not watched — every one gives the player's hand something to do; cutscene-only
// transitions are forbidden." Every script there is TRIGGER · THE HAND · THE
// STAGE · SOUND · THE KEPT IMAGE; this format maps those five headings 1:1.
//
// TRIGGER is never restated here: it binds to the epoch manifest — the era's
// science ceiling (scienceThreshold, via scienceMeter) plus its megaproject
// completion (epochMegaprojectComplete) plus the manifest's successor. The
// CeremonySystem reads all three through the EXISTING functions; a script only
// names the epoch it closes.
//
// Completion arms the era through the EXISTING seam — activateEpoch() in
// ContractFamilies, the one localStorage writer — never a second path.

/** THE HAND — the framework's input primitives. A ceremony picks exactly one. */
export type CeremonyHand =
  /** Hold-to-push (T2's capstan bar is the house ancestor). */
  | { kind: 'hold'; durationMs: number; label: string }
  /** Charge, then let go inside the window (a whistle-pull, a release lever). */
  | { kind: 'timed-release'; chargeMs: number; windowMs: number; label: string }
  /**
   * Carry/drive — a held input moves a body through the world: the carry-walk
   * of T9, the convoy drive of T4. Movement happens ONLY while held.
   */
  | {
      kind: 'drive';
      route: readonly ConvoyPoint[];
      /** Trailing vehicles behind the lead ("every vehicle in the valley"). */
      followers: number;
      spacing: number;
      /** Lead speed in stage units/second while the hand is held. */
      speed: number;
      /** Fraction of the route where the hand's work is done (the crest). */
      crestAt: number;
      label: string;
    }
  /** Rhythm — timed pulls, windows opening on a fixed cadence (T5). */
  | { kind: 'rhythm'; pulls: number; intervalMs: number; windowMs: number; label: string }
  /** Typed entry — the naming hand (T8: THE RIVERWARD). */
  | { kind: 'typed-entry'; expected: string; label: string };

/** THE STAGE — phases the machine walks in order. Placeholder staging law:
 * markers and primitives now; the art dresses later. */
export type CeremonyPhase =
  /** Timed staging beat; advances by clock only AFTER the hand's phases. */
  | {
      id: string;
      kind: 'beat';
      durationMs: number;
      direction: string;
      /**
       * The played-not-watched law inside a staged pass: the rhythm keeps
       * running under this beat and it will not complete until minPulls good
       * pulls land during it (T5's homecoming pass — the hand stays involved).
       */
      rhythmContinues?: { minPulls: number };
    }
  /** The hand's phase. NEVER auto-advances: no input, no transition. */
  | { id: string; kind: 'hand'; direction: string }
  /** The kept image: automatic frame capture, tagged for the era's ledger. */
  | { id: string; kind: 'kept-image'; delayMs: number; direction: string }
  /** The arming call through the existing seam, exactly once. */
  | { id: string; kind: 'arm'; direction: string };

/** SOUND — named beats. `sound` resolves through the audio manifest; `beat` is
 * the script's own name, emitted as an event for diagnostics. */
export type CeremonySoundBeat = {
  beat: string;
  phase: string;
  atMs: number;
  sound: SoundName | null;
  /** stop-all: the staged silence (T4's held breath before the first wave). */
  silence?: boolean;
};

export type CeremonyScript = {
  id: string;
  /** T1..T10 — the interstitial this script stages. */
  interstitial: string;
  /** The era this ceremony CLOSES (its manifest carries threshold/megaproject/successor). */
  epochId: string;
  title: string;
  /** The schoolhouse door's line when the ceremony stands ready. */
  doorLine: string;
  hand: CeremonyHand;
  phases: readonly CeremonyPhase[];
  sound: readonly CeremonySoundBeat[];
  keptImage: { caption: string };
};

export const T3_THE_REFINERY: CeremonyScript = {
  id: 't3-the-refinery',
  interstitial: 'T3',
  epochId: 'epoch-3-voltage',
  title: 'The Refinery',
  doorLine: 'The crack-tower valve is waiting. The whole town has come to see what runs.',
  hand: { kind: 'hold', durationMs: 1_400, label: 'Hold to open the crack-tower valve' },
  phases: [
    { id: 'night-refinery', kind: 'beat', durationMs: 1_200, direction: 'Built at night, lit like the Voltage Age taught.' },
    { id: 'open-valve', kind: 'hand', direction: 'Open the crack-tower valve.' },
    { id: 'valve-release', kind: 'beat', durationMs: 650, direction: 'Release. The valve seats; the twin spigots answer.' },
    { id: 'twin-spigots', kind: 'beat', durationMs: 1_300, direction: 'Gold fuel and black tar find their liquid rhythm.' },
    { id: 'first-engine', kind: 'beat', durationMs: 1_500, direction: 'An engine coughs. Twice. Then catches.' },
    { id: 'dawn-tram', kind: 'beat', durationMs: 1_300, direction: 'At dawn, the whole town rides the tram to the rim.' },
    { id: 'rim', kind: 'beat', durationMs: 1_400, direction: 'The flats shimmer south to the horizon. Too big to walk.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: 'The town on the rim, backs to camera.' },
    { id: 'arm', kind: 'arm', direction: 'The Motor Frontier opens.' },
  ],
  sound: [
    { beat: 't3-valve-squeal', phase: 'open-valve', atMs: 0, sound: 'tier-up' },
    { beat: 't3-liquid-rhythm', phase: 'twin-spigots', atMs: 0, sound: 'sluice-water-loop' },
    { beat: 't3-liquid-falls-silent', phase: 'first-engine', atMs: 0, sound: null, silence: true },
    { beat: 't3-first-cough', phase: 'first-engine', atMs: 0, sound: 'prospector-hover-loop' },
    { beat: 't3-engine-catches', phase: 'dawn-tram', atMs: 0, sound: null, silence: true },
  ],
  keptImage: { caption: 'The town on the rim, backs to camera.' },
};

// ─── T4 · E4→E5 — THE BOAT ───────────────────────────────────────────────────
// STORYBOOK (verbatim): "Trigger: sci-12 + hull complete. THE HAND: the player
// drives the lead Flivver of the overland haul (a short, absurd, sacred convoy
// level: one ship, every vehicle in the valley, dust like a parade). STAGE: the
// Boat crests the last dune; THE SEA. The town goes silent; the toy-boat kid
// stands at the bow. SOUND: engines → wind → nothing → the first wave anyone
// here has ever heard. KEPT IMAGE: the hull's shadow falling off the dune onto
// wet sand."
export const T4_THE_BOAT: CeremonyScript = {
  id: 't4-the-boat',
  interstitial: 'T4',
  epochId: 'epoch-4-motor',
  title: 'The Boat',
  doorLine: 'One ship, every vehicle in the valley. The overland haul wants a driver.',
  hand: {
    kind: 'drive',
    // The dune road: west staging yard, two rises, the last dune at the east.
    route: [
      { x: -14, z: 0 },
      { x: -8, z: -1.2 },
      { x: -2, z: 0.6 },
      { x: 4, z: -0.8 },
      { x: 10, z: 0 },
      { x: 14, z: 0 },
    ],
    followers: 7,
    spacing: 1.5,
    speed: 8.5,
    crestAt: 0.82,
    label: 'Hold to drive the lead Flivver',
  },
  phases: [
    { id: 'muster', kind: 'beat', durationMs: 1_400, direction: 'The haul musters — one ship, every vehicle in the valley.' },
    { id: 'haul', kind: 'hand', direction: 'Dust like a parade. Drive.' },
    { id: 'crest', kind: 'beat', durationMs: 1_000, direction: 'The Boat crests the last dune.' },
    { id: 'the-sea', kind: 'beat', durationMs: 1_400, direction: 'THE SEA. The town goes silent; the toy-boat kid stands at the bow.' },
    { id: 'first-wave', kind: 'beat', durationMs: 1_600, direction: 'The first wave anyone here has ever heard.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: "The hull's shadow falls off the dune onto wet sand." },
    { id: 'arm', kind: 'arm', direction: 'The Deepwater Claim opens.' },
  ],
  sound: [
    { beat: 't4-engines', phase: 'muster', atMs: 0, sound: 't4-engines-loop' },
    { beat: 't4-wind', phase: 'crest', atMs: 0, sound: 't4-wind' },
    { beat: 't4-nothing', phase: 'the-sea', atMs: 0, sound: null, silence: true },
    { beat: 't4-first-wave', phase: 'first-wave', atMs: 200, sound: 't4-first-wave' },
  ],
  keptImage: { caption: "The hull's shadow falling off the dune onto wet sand." },
};

// ─── T5 · E5→E6 — THE DEEP REACTOR ───────────────────────────────────────────
// STORYBOOK (verbatim): "Trigger: sci-14 + the raise. THE HAND: the player
// times the flotilla winch-pulls (all hulls, one line, rhythm input in the
// year's flattest calm). STAGE: what surfaces glows teal, warm, patient; the
// homecoming barge crosses the new inland water, and beneath the keel every
// prior claim passes in green glass — flats, canyon, hill, river bend — the
// town waving DOWN at its own history. SOUND: rope and water → the hum (lower
// than the Dynamo's, older) → each era's ambient layer joining, muffled and
// lovely, as the barge passes over its tile. KEPT IMAGE: the reactor's glow
// laid across the drowned claims at dusk — the water lit from above, for once."
export const T5_THE_DEEP_REACTOR: CeremonyScript = {
  id: 't5-the-deep-reactor',
  interstitial: 'T5',
  epochId: 'epoch-5-deepwater',
  title: 'The Deep Reactor',
  doorLine: "All hulls, one line, in the year's flattest calm. The raise wants a rhythm.",
  hand: {
    kind: 'rhythm',
    pulls: 6,
    intervalMs: 900,
    windowMs: 420,
    label: 'Pull with the flotilla',
  },
  phases: [
    { id: 'flattest-calm', kind: 'beat', durationMs: 1_200, direction: "All hulls, one line, in the year's flattest calm." },
    { id: 'the-raise', kind: 'hand', direction: 'Time the winch-pulls. All hulls, one line.' },
    { id: 'surfacing', kind: 'beat', durationMs: 1_500, direction: 'What surfaces glows teal, warm, patient.' },
    {
      id: 'homecoming-pass',
      kind: 'beat',
      durationMs: 4_200,
      direction: 'The homecoming barge crosses the new inland water — every prior claim passes in green glass below.',
      // The hand stays involved: the rhythm continues under the pass.
      rhythmContinues: { minPulls: 3 },
    },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: "The reactor's glow laid across the drowned claims at dusk." },
    { id: 'arm', kind: 'arm', direction: 'The Atomic Homestead opens.' },
  ],
  sound: [
    { beat: 't5-rope-and-water', phase: 'the-raise', atMs: 0, sound: 't5-winch-rhythm' },
    { beat: 't5-the-hum', phase: 'surfacing', atMs: 200, sound: 't5-deep-hum-loop' },
    { beat: 't5-era-layer-flats', phase: 'homecoming-pass', atMs: 400, sound: 't5-surfacing' },
    { beat: 't5-era-layer-canyon', phase: 'homecoming-pass', atMs: 1_400, sound: 't5-surfacing' },
    { beat: 't5-era-layer-hill', phase: 'homecoming-pass', atMs: 2_400, sound: 't5-surfacing' },
    { beat: 't5-era-layer-river-bend', phase: 'homecoming-pass', atMs: 3_400, sound: 't5-surfacing' },
  ],
  keptImage: { caption: "The reactor's glow laid across the drowned claims at dusk." },
};

// ─── T6 · E6→E7 — THE CALCULATING HOUSE ───────────────────────────────────
// STORYBOOK: the player's held placement mounts the Prospector's little plate
// above the door; the dial answers in its boot rhythm, the House listens, and
// one telegraph click becomes a chord before it prints MORE VOICES.
export const T6_THE_CALCULATING_HOUSE: CeremonyScript = {
  id: 't6-the-calculating-house',
  interstitial: 'T6',
  epochId: 'epoch-6-atomic',
  title: 'The Calculating House',
  doorLine: "The Prospector's little plate is ready for its place above the door.",
  hand: { kind: 'hold', durationMs: 1_600, label: 'Hold to mount the plate' },
  phases: [
    { id: 'house-gathers', kind: 'beat', durationMs: 1_200, direction: 'The town gathers at the new House.' },
    { id: 'mount-plate', kind: 'hand', direction: "Mount the Prospector's little plate above the door." },
    { id: 'teal-dial', kind: 'beat', durationMs: 1_400, direction: "The teal dial blinks the Prospector's own boot rhythm." },
    { id: 'house-listens', kind: 'beat', durationMs: 1_800, direction: "The House listens to the world's faint voices." },
    { id: 'more-voices', kind: 'beat', durationMs: 1_400, direction: 'The paper answers: MORE VOICES.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: "The plate above the door, the dial's light on the crowd — the Prospector front row." },
    { id: 'arm', kind: 'arm', direction: 'The Signal Era opens.' },
  ],
  sound: [
    { beat: 't6-boot-rhythm', phase: 'teal-dial', atMs: 0, sound: 'prospector-hover-loop' },
    { beat: 't6-telegraph-click', phase: 'house-listens', atMs: 0, sound: 'old-digger-tape-swap' },
    { beat: 't6-click-chord', phase: 'house-listens', atMs: 900, sound: 'tier-up' },
    { beat: 't6-more-voices', phase: 'more-voices', atMs: 0, sound: null, silence: true },
  ],
  keptImage: { caption: "The plate above the door, the dial's light on the crowd — the Prospector front row." },
};

// ─── T7 · E7→E8 — THE STARSHIP ───────────────────────────────────────────
export const T7_THE_STARSHIP: CeremonyScript = {
  id: 't7-the-starship',
  interstitial: 'T7',
  epochId: 'epoch-7-signal',
  title: 'The Starship',
  doorLine: 'The last jack is patched. Every relay tower is waiting on the switchboard chief.',
  hand: {
    kind: 'timed-release',
    chargeMs: 900,
    windowMs: 700,
    label: 'Hold, then release the final umbilical',
  },
  phases: [
    { id: 'pad-quiet', kind: 'beat', durationMs: 900, direction: 'The Starship stands on the pad. The river holds the last of the light.' },
    { id: 'made-crew-boards', kind: 'beat', durationMs: 1_400, direction: 'The crew of made agents boards — the Prospector at a porthole, Chalk beside it.' },
    { id: 'release-umbilical', kind: 'hand', direction: 'Throw the final umbilical release.' },
    { id: 'relay-towers', kind: 'beat', durationMs: 800, direction: 'Every relay tower carries the count.' },
    { id: 'countdown', kind: 'beat', durationMs: 2_200, direction: 'The switchboard chief counts the ground to the sky: five, four, three, two…' },
    { id: 'engines-on-one', kind: 'beat', durationMs: 1_400, direction: 'ONE. Engines lit. The whole valley looks up.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: 'Brass firstborn at the porthole, the river below getting smaller.' },
    { id: 'arm', kind: 'arm', direction: 'The Orbital Frontier opens.' },
  ],
  sound: [
    { beat: 't7-pad-silence', phase: 'pad-quiet', atMs: 0, sound: null, silence: true },
    { beat: 't7-umbilical-release', phase: 'release-umbilical', atMs: 0, sound: 'build-place' },
    { beat: 't7-chief-five', phase: 'countdown', atMs: 0, sound: 'chirp-acknowledge' },
    { beat: 't7-chief-four', phase: 'countdown', atMs: 500, sound: 'chirp-acknowledge' },
    { beat: 't7-chief-three', phase: 'countdown', atMs: 1_000, sound: 'chirp-acknowledge' },
    { beat: 't7-chief-two', phase: 'countdown', atMs: 1_500, sound: 'chirp-acknowledge' },
    { beat: 't7-engines-on-one', phase: 'engines-on-one', atMs: 0, sound: 't4-engines-loop' },
  ],
  keptImage: { caption: 'Brass firstborn at the porthole, the river below getting smaller.' },
};

// ─── T8 · E8→E9 — THE COLONY SEED ───────────────────────────────────
// STORYBOOK: "THE HAND: the player enters the name — the vote is staged, but
// the typing is theirs: THE RIVERWARD. STAGE: no countdown; radio silence; a
// long burn toward the red dot; the town watches it not-visibly-move, then
// goes back to work. SOUND: the quietest transition — suit-breath, one
// flare-code whistle from a far dome, the burn like a struck match held.
// KEPT IMAGE: the red dot above the dome cluster; below it, everyone already
// working."
export const T8_THE_COLONY_SEED: CeremonyScript = {
  id: 't8-the-colony-seed',
  interstitial: 'T8',
  epochId: 'epoch-8-orbital',
  title: 'The Colony Seed',
  doorLine: 'The Seed stands finished in the yard the Claw became. The naming vote waits for your hand.',
  hand: { kind: 'typed-entry', expected: 'THE RIVERWARD', label: 'Name the Colony Seed' },
  phases: [
    { id: 'the-vote', kind: 'beat', durationMs: 1_000, direction: "The moon-born child's entry waits in the naming vote." },
    { id: 'name-the-seed', kind: 'hand', direction: 'Enter the promise this hull will carry: THE RIVERWARD.' },
    { id: 'no-countdown', kind: 'beat', durationMs: 800, direction: 'No countdown this time. Some departures whisper.' },
    { id: 'radio-silence', kind: 'beat', durationMs: 1_000, direction: 'Radio silence. One flare-code whistle answers from a far dome.' },
    { id: 'long-burn', kind: 'beat', durationMs: 1_600, direction: 'The burn holds like a struck match, aimed at the red dot.' },
    { id: 'not-visibly-moving', kind: 'beat', durationMs: 1_200, direction: 'The whole town watches the red dot not-visibly-move.' },
    { id: 'back-to-work', kind: 'beat', durationMs: 1_200, direction: 'Then everyone goes back to work under the promise.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: 'The red dot above the dome cluster; below it, everyone already working.' },
    { id: 'arm', kind: 'arm', direction: 'The Red Fields open.' },
  ],
  sound: [
    { beat: 't8-suit-breath', phase: 'the-vote', atMs: 0, sound: 'prospector-hover-loop' },
    { beat: 't8-radio-silence', phase: 'radio-silence', atMs: 0, sound: null, silence: true },
    { beat: 't8-flare-code-whistle', phase: 'radio-silence', atMs: 400, sound: 'chirp-acknowledge' },
    { beat: 't8-long-burn', phase: 'long-burn', atMs: 0, sound: 'spark-bolt-fire' },
  ],
  keptImage: { caption: 'The red dot above the dome cluster; below it, everyone already working.' },
};

// ─── T9 · E9→E10 — THE GENERATION ARK ─────────────────────────
// STORYBOOK: the player's held walk carries the Elder's Tree seed-tin through
// the whole boarding line and up the ramp. The town boards entire; the heirs'
// fleet crests the horizon; the ramps close on the green world.
export const T9_THE_GENERATION_ARK: CeremonyScript = {
  id: 't9-the-generation-ark',
  interstitial: 'T9',
  epochId: 'epoch-9-redfields',
  title: 'The Generation Ark',
  doorLine: "The whole town is in the boarding line. The Elder's Tree seed-tin waits for your hand.",
  hand: {
    kind: 'drive',
    route: [
      { x: -12, z: 4 },
      { x: -7, z: 3 },
      { x: -2, z: 1.5 },
      { x: 3, z: 0 },
      { x: 8, z: -2 },
      { x: 12, z: -4 },
    ],
    followers: 0,
    spacing: 1,
    speed: 8,
    crestAt: 0.92,
    label: "Hold to carry the Elder's Tree seed-tin",
  },
  phases: [
    { id: 'boarding-line', kind: 'beat', durationMs: 1_200, direction: 'Every surviving portrait waits in the boarding line — aged, named, touchable.' },
    { id: 'carry-tree-seed', kind: 'hand', direction: "Carry the Elder's Tree seed-tin through the line and up the ramp." },
    { id: 'town-boards-entire', kind: 'beat', durationMs: 1_200, direction: 'The town boards entire: every generation, the Long Table, the seed in its greenkeeper tin.' },
    { id: 'heirs-fleet', kind: 'beat', durationMs: 1_400, direction: "The heirs' fleet crests the horizon, crossed pickaxes on every sail. They have come asking." },
    { id: 'departure-horn', kind: 'beat', durationMs: 1_000, direction: "The departure horn sounds the Railcar's old whistle note — leaving-music now." },
    { id: 'ramps-close', kind: 'beat', durationMs: 1_400, direction: 'The ramps close on a green world. Under the horn, the canals keep running.' },
    { id: 'kept-image', kind: 'kept-image', delayMs: 350, direction: 'From the ramp: the basin green, the Digger working, one old man waving with a stopped watch.' },
    { id: 'arm', kind: 'arm', direction: 'The Deep Sky opens.' },
  ],
  sound: [
    { beat: 't9-canals-running', phase: 'boarding-line', atMs: 0, sound: 'sluice-water-loop' },
    { beat: 't9-departure-horn', phase: 'departure-horn', atMs: 0, sound: 'wave-start-horn' },
    { beat: 't9-ramps-close', phase: 'ramps-close', atMs: 0, sound: 'build-place' },
  ],
  keptImage: { caption: 'From the ramp: the basin green, the Digger working, one old man waving with a stopped watch in his other hand.' },
};

/** The registry: every framework-staged ceremony, keyed by the era it closes.
 * T1 (stamp mill click) and T2 (dynamo crank) predate the framework and stay
 * on their own doors — wrap, don't rewrite; migration is a named follow-up. */
export const CEREMONY_SCRIPTS: readonly CeremonyScript[] = [T3_THE_REFINERY, T4_THE_BOAT, T5_THE_DEEP_REACTOR, T6_THE_CALCULATING_HOUSE, T7_THE_STARSHIP, T8_THE_COLONY_SEED, T9_THE_GENERATION_ARK];

export function ceremonyScriptForEpoch(epochId: string): CeremonyScript | null {
  return CEREMONY_SCRIPTS.find((script) => script.epochId === epochId) ?? null;
}

/** The kept image's window event and its ledger-page storage key. They live in
 * this css-free module so node-side tooling (e2e) can import them. */
export const CEREMONY_KEPT_IMAGE_EVENT = 'gr-ceremony-kept-image';

export function ceremonyKeptImageKey(ceremonyId: string): string {
  return `gr.ceremony.keptImage.v1.${ceremonyId}`;
}
