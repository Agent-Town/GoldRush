// scripts/launch-video/cut/edl.mjs: the edit decision list of the launch film "What is a claim?" (task
// launch-video-cut-3). THE ONE FILE A V2 EDITS: every shot, in-point, card, cue and crop lives here, and
// cards.mjs, mix.mjs and assemble.mjs only execute it. The treatment is the script
// (docs/marketing/launch-video/treatment.md): twelve beats, 94 s, the Pan Theme end to end. Times are seconds;
// a beat's cards use beat-local seconds; take in-points are seconds of the take's own clip (its sidecar's clock).
// Owner rulings that bind the edit (2026-09-26): F-LVC2-1 STAGED frames may appear, disclosed; F-LVC2-2 the takes
// are real footage, played by the capture pilot; F-LVC2-3 the end card keeps its second line; F-VIBE-Q no Baron
// ride (the film cuts on his arrival), printed slips and no voice, county boards unnamed.

export const VERSION = 'v1';
export const FPS = 60;
export const FILM_FRAMES = 94 * FPS; // the treatment's 94 s is the ceiling (owner 2026-09-29: "it should not be too long")

// Output shapes. The master keeps the takes' own 1920x1200 (1280x800 at device scale 1.5, treatment gap 10); the
// platform landscape is a 1920x1080 crop of the same pixels; the vertical takes are 780x1688 (gap 19), whose top
// 780x1387 is the 9:16 window, scaled to 1080x1920. Page = the thin parchment border plates sit in.
export const FORMATS = {
  master: { w: 1920, h: 1200, file: 'gold-rush-launch-film-1920x1200-v1.mp4', page: { x: 48, y: 87, w: 1824, h: 1026 }, text: { rye: 74, slip: 46, maxW: 1536 } },
  landscape: { w: 1920, h: 1080, file: 'gold-rush-launch-film-1920x1080-v1.mp4', page: { x: 40, y: 40, w: 1840, h: 1000 }, text: { rye: 72, slip: 44, maxW: 1536 } },
  vertical: { w: 1080, h: 1920, file: 'gold-rush-launch-film-vertical-1080x1920-v1.mp4', page: { x: 36, y: 36, w: 1008, h: 1848 }, text: { rye: 64, slip: 42, maxW: 860 } },
};
export const WEB = { file: 'gold-rush-launch-film-web-1280x800-v1.mp4', poster: 'gold-rush-launch-film-web-1280x800-v1-poster.jpg', w: 1280, h: 800, fps: 30, videoKbps: 1450, audioKbps: 128, maxBytes: 20_000_000, posterMaxBytes: 300_000 };
export const TEASER = { file: 'gold-rush-launch-film-teaser-30s-1920x1080-v1.mp4', format: 'landscape', frames: 30 * FPS };

// Footage: the phase-2 takes (~/.goldrush/launch-video; labels are read from each sidecar at build time).
export const TAKES = {
  ns1: 'B1-B6-B7-e1-night-shift-1280x800-t1.mp4',
  ns2: 'B1-B6-B7-e1-night-shift-1280x800-t2.mp4',
  nsV: 'B1-B6-B7-e1-night-shift-390x844-t1.mp4',
  menu: 'B3-menu-1280x800-t1.mp4',
  menuV: 'B3-menu-390x844-t1.mp4',
  claim1: 'B4-B5-B9-the-claim-1280x800-t1.mp4',
  claim2: 'B4-B5-B9-the-claim-1280x800-t2.mp4',
  claimV2: 'B4-B5-B9-the-claim-390x844-t2.mp4',
  claimV3: 'B4-B5-B9-the-claim-390x844-t3.mp4',
  dg: 'B6-e1-dry-gulch-1280x800-t1.mp4',
  dgV: 'B6-e1-dry-gulch-390x844-t1.mp4',
  tb: 'B6-e1-twin-banks-1280x800-t1.mp4',
  tbV: 'B6-e1-twin-banks-390x844-t1.mp4',
  baron2: 'B6-B8-e1-baron-1280x800-t2.mp4',
  baron3: 'B6-B8-e1-baron-1280x800-t3.mp4',
  herald: 'B8-herald-1280x800-t1.mp4',
  fieldBook: 'B10-field-book-front-desk-1280x800-t1.mp4',
  invite: 'B10-ride-together-invitation-1280x800-t1.mp4',
  lantern: 'B10-lantern-show-1280x800-t1.mp4',
};

// Plates: the art store's raw folder (store: in the treatment).
export const PLATES = {
  valley: 'kit-valley-master.png',
  hero: 'mkt-hero-16x9-f.png',
  baron: 'plate-contract-baron.png',
  arsenal: 'plate-arsenal-e1.png',
  portrait: 'codex-prospector-e1.png',
  ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`era${i + 1}`, `kit-era-${i + 1}.png`])),
};

// B2's hand cut: the near scrub and rocks of kit-valley-master (1672x941 px), traced by eye along the tops of the
// foreground bushes and boulders; everything below the line is the near layer.
export const VALLEY_NEAR_LINE = [
  [0, 522], [70, 520], [140, 528], [205, 548], [250, 575], [292, 612], [320, 650], [360, 676], [430, 690], [520, 700],
  [610, 716], [700, 732], [790, 744], [880, 764], [960, 782], [1050, 792], [1150, 800], [1260, 806], [1370, 794],
  [1440, 764], [1500, 744], [1580, 748], [1672, 742],
];

// Type. Every line sits on a parchment slip with brass rivets (teal on the Prospector's), in Wellfleet unless the
// treatment says Rye; the words are the treatment's (Shot cards and "The title cards and the end card"), no others.
export const CARDS = {
  'b1-they-dont-want': { type: 'rye', text: "THEY DON'T WANT YOUR BRAINS.", at: 'hook1', night: true },
  'b1-they-want-gold': { type: 'rye', text: 'THEY WANT YOUR GOLD.', at: 'hook2', night: true },
  'b2-claim-a': { type: 'slip', text: 'What is a claim?', ghost: ' Gold, they will tell you.', at: 'lower' },
  'b2-claim-b': { type: 'slip', text: 'What is a claim? Gold, they will tell you.', at: 'lower' },
  'b2-simple-wrong': { type: 'slip', text: 'Simple, wrong, and the reason every one of us is standing here.', at: 'lower' },
  'b3-lockup': { type: 'lockup', at: 'center' },
  'b4-stake': { type: 'rye', text: 'STAKE THE CLAIM.', at: 'upper' },
  'b4-tooltip': { type: 'slip', text: 'Stand close and the pan works itself.', at: 'lower' },
  'b4-masthead': { type: 'masthead', text: 'NEW HANDS, WELCOME.', at: 'lower' },
  'b5-weapons': { type: 'rye', text: "YOUR WEAPONS DON'T KILL.", at: 'upper' },
  'b5-cure': { type: 'rye', text: 'THEY CURE.', at: 'upper' },
  'b5-neighbours': { type: 'slip', italic: true, text: 'They were neighbours with gold dust in the creases of their faces, and they were freed, every one of them, and every one of them went home.', at: 'lower', size: { master: 42, landscape: 40, vertical: 38 } },
  'b6-dry-gulch': { type: 'slip', text: 'The Dry Gulch', at: 'lower' },
  'b6-twin-banks': { type: 'slip', text: 'Twin Banks', at: 'lower' },
  'b6-night-shift': { type: 'slip', text: 'Night Shift', at: 'lower', night: true },
  'b6-baron': { type: 'slip', text: 'The Claim-Jumper Baron', at: 'lower' },
  'b6-five': { type: 'rye', text: 'FIVE CONTRACTS. FIVE TWISTS.', at: 'upper' },
  'b7-night-rule': { type: 'slip', text: 'Beyond your light, the night owns the claim.', at: 'lower', night: true },
  'b8-banner-bill': { type: 'slip', text: 'My banner arrives before my bill.', at: 'lower' },
  'b9-titles-1': { type: 'teal', lines: ['follows and observes.', 'can gather and mend with approval.', 'does trusted chores.'], show: 1, at: 'lowerLeft' },
  'b9-titles-2': { type: 'teal', lines: ['follows and observes.', 'can gather and mend with approval.', 'does trusted chores.'], show: 2, at: 'lowerLeft' },
  'b9-titles-3': { type: 'teal', lines: ['follows and observes.', 'can gather and mend with approval.', 'does trusted chores.'], show: 3, at: 'lowerLeft' },
  'b9-steady': { type: 'teal', lines: ['I will keep the claim books steady.'], show: 1, at: 'lowerLeft' },
  'b9-claim-wins': { type: 'rye', text: 'CLAIM WINS GROW IT.', at: 'upper', atV: 'upperLow' },
  'b10-same-door': { type: 'rye', text: 'SAME MAPS. SAME DOOR.', at: 'lower' },
  'b10-replays': { type: 'slip', text: 'Every standing replays in your browser.', at: 'lower' },
  'b10-keeps': { type: 'slip', text: 'The county keeps every run.', at: 'lower' },
  'b11-frontier-open': { type: 'rye', text: 'THE FRONTIER IS OPEN.', at: 'upper' },
  'b11-survey-table': { type: 'slip', text: 'Nine more eras on the survey table.', at: 'lower' },
  'b11-fever': { type: 'slip', text: 'The world catches the Fever; the town catches the future.', at: 'lower' },
  'b12-never-gold': { type: 'slip', italic: true, text: 'The gold rush was never about the gold.', at: 'lower' },
  mark: { type: 'mark', text: 'in game', at: 'mark' },
};

// The end card, top to bottom (treatment "The title cards and the end card"; F-LVC2-3 keeps the second line).
export const END_CARD = {
  top: 'Go on. It\'s your claim now.',
  wordmark: 'GOLD RUSH',
  tagline: 'an Agent Town tale',
  edition: 'The Frontier Edition',
  links: ['Play in your browser: agenttown.app/goldrush', 'Bring your agent: agenttown.app/goldrush/skill.md'],
};
export const LOCKUP = { wordmark: 'GOLD RUSH', tagline: 'an Agent Town tale' };

// A shot is one of: { black }, { take, in }, { plate }, { still: 'menu' } (the menu's backdrop drawn from the valley
// plate at the take's own framing, for the match-dissolve), { endcard }. len is frames. Per-format keys override:
// landscape.y (the 1920x1080 crop's top), vertical.take/in/y (a 390x844 take and its 780x1387 window's top) or
// vertical.x (no vertical take: the treatment's fallback, a 675x1200 reframed crop of the master) or vertical.panel
// (a UI panel scaled to the width on the ledger-ink ground). push: zoom path and window centre in take pixels.
export const BEATS = [
  {
    id: 'B1', key: 3.60, title: 'The hook: they want your gold', frames: [0, 300],
    shots: [
      { black: true, len: 60 },
      { take: 'ns2', in: 310.90, len: 240, grade: 'night', landscape: { y: 120 }, vertical: { x: 622 },
        why: 't2 over t1: the only window with no hurt vignette from the dark post through the relight (311.6 s) to the walkers at the rim, 310.85 to 315.6 s (measured); the 390x844 take pulses three times here (311.8, 312.65, 313.6 s), so the vertical takes the fallback, a 675x1200 reframe of this window' },
    ],
    cards: [['b1-they-dont-want', 1.60, 4.82], ['b1-they-want-gold', 2.70, 4.82]],
    marks: [1.0],
    fade: { in: [1.0, 0.5] }, // true black for the first second, then up from black (applied after the grain)
  },
  {
    id: 'B2', key: 7.60, title: 'The world: "What is a claim?"', frames: [300, 840],
    shots: [
      { plate: 'valley', len: 315, page: true, parallax: true, z: [1.0, 1.035], zNear: [1.0, 1.06], c: [[0.5, 0.5], [0.53, 0.47]], region: { vertical: 0.70 } },
      { plate: 'hero', len: 249, page: true, xfade: 30, z: [1.05, 1.05], c: [[0.44, 0.5], [0.56, 0.5]], region: { vertical: 0.30 } },
      { still: 'menu', len: 30, xfade: 24 },
    ],
    page: [0, 8.5, 0.4],
    cards: [['b2-claim-a', 0.45, 2.10, 0.30, 0], ['b2-claim-b', 1.80, 4.85], ['b2-simple-wrong', 5.35, 8.45]],
  },
  {
    id: 'B3', key: 16.95, title: 'The title', frames: [840, 1080],
    shots: [{ still: 'menu', len: 240 }],
    overlay: { take: 'menu', in: 3.95, len: 126, fadeIn: 0.5, fadeOut: 0.35, vertical: { take: 'menuV', in: 3.90, y: 0 },
      why: 'the only kept menu take per shape: the placeholder, "Wren" typed from 4.6 to 5.1 s, held to 6.05 s, then the game cuts to its loading frame (the vertical take reaches it at 6.05 s, so it starts 0.05 s earlier), so the lift is a dissolve' },
    cards: [['b3-lockup', 2.10, 4.00, 0.45, 0]],
    marks: [0.5],
  },
  {
    id: 'B4', key: 19.60, title: 'Stake the claim', frames: [1080, 1558],
    shots: [
      { take: 'claim2', in: 19.20, len: 169, vertical: { take: 'claimV3', in: 19.90, y: 280 }, why: 'the kneel at the ford seam with the Prospector at her shoulder; t2 so B5 can take t1' },
      { take: 'claim2', in: 72.60, len: 169, vertical: { take: 'claimV3', in: 73.95, y: 280 }, why: 'the sluice ghost, then the sluice down by the water (74.45 s)' },
      { take: 'claim2', in: 265.90, len: 140, vertical: { take: 'claimV3', in: 265.30, y: 280 }, why: 'the second beacon (266.48 s, wave 8): the first (77.92 s) sits 0.7 s before the HUD returns for B9' },
    ],
    cards: [['b4-stake', 0.25, 2.65], ['b4-tooltip', 0.55, 2.75], ['b4-masthead', 3.05, 7.72]],
    marks: [0.0],
  },
  {
    id: 'B5', key: 30.60, title: 'The cure', frames: [1558, 2093],
    shots: [
      { take: 'claim1', in: 19.40, len: 535, push: { from: 3.0, z: [1.0, 1.05], at: [[960, 700], [960, 690]] }, vertical: { take: 'claimV2', in: 18.60, y: 250 },
        why: 't1: all four FREED labels (20.9, 24.5, 25.9, 27.3 s) at the ford inside nine clean seconds; its damage flash starts after 28.4 s' },
    ],
    cards: [['b5-weapons', 0.25, 2.70], ['b5-cure', 2.85, 4.85], ['b5-neighbours', 3.20, 8.72]],
  },
  {
    id: 'B6', key: 40.20, title: 'Five contracts', frames: [2093, 2460],
    shots: [
      { take: 'dg', in: 10.80, len: 70, vertical: { take: 'dgV', in: 10.10, y: 150 } },
      { take: 'tb', in: 17.40, len: 70, vertical: { take: 'tbV', in: 16.70, y: 150 } },
      { take: 'ns1', in: 199.20, len: 70, grade: 'night', vertical: { take: 'nsV', in: 198.90, y: 150 } },
      { take: 'baron3', in: 9.00, len: 157, vertical: { x: 622 }, why: 'the HUD-off entry walk (8.3 to 11.7 s) past the planted banners; the Rye card rides its last 1.4 s' },
    ],
    cards: [['b6-dry-gulch', 0.05, 1.12, 0.12, 0.10], ['b6-twin-banks', 1.22, 2.28, 0.12, 0.10], ['b6-night-shift', 2.38, 3.45, 0.12, 0.10], ['b6-baron', 3.55, 4.62, 0.12, 0.10], ['b6-five', 4.72, 6.10, 0.25, 0.20]],
  },
  {
    id: 'B7', key: 48.40, title: 'Night', frames: [2460, 3000],
    shots: [
      { take: 'ns2', in: 199.60, len: 180, grade: 'night', vertical: { take: 'nsV', in: 201.00, y: 150 } },
      { take: 'ns2', in: 247.20, len: 180, grade: 'night', vertical: { take: 'nsV', in: 247.40, y: 150 } },
      { take: 'ns1', in: 322.80, len: 180, grade: 'night', landscape: { y: 120 }, vertical: { take: 'nsV', in: 322.80, y: 250 }, why: 't1 from 322.8 s: the dark with both lights, clear of the hurt vignette that fades out at 322.75 s (measured)' },
    ],
    cards: [['b7-night-rule', 0.50, 8.62]],
  },
  {
    id: 'B8', key: 54.60, title: 'The Baron', frames: [3000, 3600],
    shots: [
      { plate: 'baron', len: 96, page: true, z: [1.0, 1.03], c: [[0.5, 0.5], [0.5, 0.5]], region: { vertical: 0.24 } },
      { take: 'baron2', in: 319.70, len: 84, landscape: { y: 0 }, vertical: { x: 615 }, why: 'the wave-12 taunt card (the same words as wave 5) framed on the ford like the arrival; every taunt card in the takes is up only 1.3 to 1.5 s before the next wave callout replaces it, so the shot is 1.40 s, fully inside it' },
      { take: 'baron3', in: 532.85, len: 180, landscape: { y: 0 }, vertical: { x: 620 }, why: 't3, the only ride to reach the horn: the Assay Clerk card clears at 532.6 s and a hit tints the frame 532.4 to 532.8 s (measured); his standard comes down to the ford and his men cross; the cut lands on the arrival' },
      { take: 'herald', in: 10.60, len: 240, push: { z: [1.35, 1.35], at: [[960, 480], [960, 720]], ease: 'cos', prescale: 2 }, vertical: { panel: [392, 30, 1136, 1140] } },
    ],
    page: [0, 1.6, 0],
    cards: [['b8-banner-bill', 0.10, 1.58, 0.25, 0.15]],
    marks: [1.6],
  },
  {
    id: 'B9', key: 66.40, title: 'Her deputy', frames: [3600, 4108],
    shots: [
      { take: 'claim2', in: 78.68, len: 508, landscape: { y: 0 }, vertical: { take: 'claimV3', y: 0, segments: [{ in: 79.33, len: 240 }, { in: 85.55, len: 268 }], why: 'in the 390x844 take the charter is a full-screen sheet (up 82.70 to 85.50 s, measured), and the clean HUD-on time either side is 469 frames of the 508 needed, so the vertical shows the charter opening for 0.63 s, then cuts to the order (86.37 s) and its trip' }, why: 't2: the HUD-on window (on by 78.65 s, off at 87.17 s) with the charter, the order (83.65 s) and its trip, no Assay Clerk card; 8.47 s, so B10 opens 0.53 s early' },
    ],
    cards: [['b9-titles-1', 0.40, 2.25, 0.30, 0], ['b9-titles-2', 1.95, 3.95, 0.30, 0], ['b9-titles-3', 3.65, 5.35], ['b9-steady', 5.55, 8.45], ['b9-claim-wins', 5.45, 8.45]],
  },
  {
    id: 'B10', key: 70.20, title: 'The same door', frames: [4108, 4800],
    shots: [
      { take: 'fieldBook', in: 1.00, len: 234, push: { z: [1.0, 1.08], at: [[960, 600], [960, 560]], prescale: 2 }, vertical: { panel: [152, 123, 1616, 954] }, why: 'the real Front Desk (the fixture board stays out: made-up standings under the county heading would read as real); the take shows a blank loading page before 0.9 s and a stretched element capture after 5.8 s' },
      { take: 'invite', in: 6.47, len: 150, push: { z: [1.8, 1.8], at: [[1190, 538], [744, 538]], ease: 'cos', prescale: 2 }, vertical: { panel: [180, 222, 1560, 650] }, why: 'the STAGED invitation (fixture claim word BRASS-PAN), fully open only from 6.4 s of a 9.0 s take, framed above its shell command and below the dev-only button' },
      { take: 'lantern', in: 15.50, len: 308, panel: [16, 0, 1888, 1062], push: { z: [1.0, 1.03] }, vertical: { panel: [622, 0, 676, 1062] }, why: 'Wren\'s own kept Claim replayed from the shelf; the control bar and its local address cropped (F-LVC2-7)' },
    ],
    cards: [['b10-same-door', 0.30, 3.70], ['b10-replays', 6.65, 9.05], ['b10-keeps', 9.20, 11.35]],
  },
  {
    id: 'B11', key: 82.20, title: 'The road: ten eras', frames: [4800, 5220],
    shots: Array.from({ length: 10 }, (_, i) => ({ plate: `era${i + 1}`, len: i % 2 === 0 ? 56 : 55, page: true, xfade: i === 0 ? 0 : 15, eraPush: true, region: { vertical: i === 9 ? 0.5 : 0.62 } })),
    page: [0, 7.0, 0],
    cards: [['b11-frontier-open', 0.30, 3.35], ['b11-survey-table', 0.90, 3.40], ['b11-fever', 3.65, 6.85]],
  },
  {
    id: 'B12', key: 91.60, title: 'The close', frames: [5220, 5640],
    shots: [
      { plate: 'arsenal', len: 180, page: true, z: [1.0, 1.25], c: [[0.5, 0.5], [0.49, 0.51]], region: { vertical: 0.48 } },
      { endcard: true, len: 240 },
    ],
    page: [0, 3.0, 0],
    cards: [['b12-never-gold', 0.25, 2.85]],
    fade: { out: 0.5 }, // to true black over the last half second (applied after the grain)
  },
];

// The menu's framing in each shape, shared by the live menu (B3's overlay) and its drawn backdrop (the match).
export const MENU_FRAMING = { landscape: { y: 60 }, vertical: { take: 'menuV', y: 0 } };
// The ledger-ink ground behind UI panels in the vertical and the Lantern Show's letterbox (its own surround measures
// #2e1a0d at all four corners of the take).
export const INK = '0x2e1b0e';

// B11's one continuous push: 8 percent over the beat, shared by all ten plates.
export const ERA_PUSH = { z0: 1.0, z1: 1.08, seconds: 7.0 };

// The soundtrack (treatment "Music and sound", the cue sheet). The Pan Theme is exactly 120.00 BPM, first downbeat
// 0.479 s, bars every 2 s; the E1 loop is exactly 128.00 BPM, beat 0 at 0.444 s, 4-bar phrases every 7.5 s from
// 0.444 s (measured by onset autocorrelation, recorded in the report). Every music edit lands on a downbeat.
export const THEME = 'title-theme.mp3';
export const E1_LOOP = 'era-e1-frontier-loop.mp3';
export const CUES = [
  { what: 'pan tap (the Pan Theme\'s own first sound)', src: THEME, from: 0.0, to: 0.40, at: 1.0, gain: 0, fadeOut: 0.15 },
  { what: 'held breath: river water', src: 'river-ambience-loop.mp3', loop: true, at: 2.0, to: 5.8, gain: 10, fadeIn: 0.8, fadeOut: 0.8 },
  { what: 'held breath: the low drone', src: 'desert-dusk-loop.mp3', loop: true, at: 2.0, to: 5.8, gain: 24, fadeIn: 0.8, fadeOut: 0.8 },
  { what: 'Pan Theme from its top', src: THEME, from: 0.0, to: 13.10, at: 5.0, gain: 0, fadeOut: 0.2 },
  { what: 'E1 loop takes over (the drive, phrase downbeat 15.444 s on the B4 cut)', src: E1_LOOP, from: 15.414, to: 38.444, at: 17.970, gain: -1, fadeIn: 0.03, fadeOut: 0.5 },
  { what: 'the band drops out into held breath: river water', src: 'river-ambience-loop.mp3', loop: true, at: 40.4, to: 53.2, gain: 10, fadeIn: 0.8, fadeOut: 0.6 },
  { what: 'held breath: the low drone', src: 'desert-dusk-loop.mp3', loop: true, at: 40.4, to: 53.2, gain: 24, fadeIn: 0.8, fadeOut: 0.6 },
  { what: 'baron-arrival-sting on the banner', src: 'baron-arrival-sting.mp3', from: 0, to: 2.48, at: 50.0, gain: -2 },
  { what: 'the E1 loop re-enters hard (phrase downbeat 45.444 s)', src: E1_LOOP, from: 45.424, to: 52.744, at: 52.980, gain: -1, fadeIn: 0.02, fadeOut: 0.4 },
  { what: 'baron-defeat-fanfare under the Herald', src: 'baron-defeat-fanfare.mp3', from: 0, to: 4.0, at: 58.0, gain: -5 },
  { what: 'the Pan Theme\'s middle to its resolution (bar downbeat 28.479 s on the B9 cut)', src: THEME, from: 28.449, to: 59.976, at: 59.970, gain: 0, fadeIn: 0.03 },
  { what: 'agent chime: the Prospector at her shoulder', src: 'agent-works.mp3', from: 0, to: 0.8, at: 60.40, gain: -9 },
  { what: 'agent chime: the order sends it panning', src: 'agent-works.mp3', from: 0, to: 0.8, at: 65.00, gain: -8 },
  { what: 'the paper sound on the ledger', src: 'ledger-open.mp3', from: 0, to: 0.8, at: 68.65, gain: -8 },
  { what: 'one last pan tap, then silence on the card', src: THEME, from: 0.0, to: 0.40, at: 93.0, gain: -2, fadeOut: 0.15 },
];

// The teaser: B1 hook, B3 title, one Claim beat (B5), the Baron's arrival (B8's plate, taunt and arrival), the end
// card; the Pan Theme only (its top under the hook and title, its full statement and resolution under the rest).
export const TEASER_CUT = [
  { beat: 'B1', from: 0, len: 300 },
  { beat: 'B3', from: 0, len: 240 },
  { beat: 'B5', from: 0, len: 535, mark: true },
  { beat: 'B8', from: 0, len: 360 },
  { endcard: true, len: 365, fadeOut: 0.5 }, // fadeOut: the beat-level fade to true black
];
export const TEASER_CUES = [
  { what: 'pan tap (the Pan Theme\'s own first sound), then silence over the hook', src: THEME, from: 0.0, to: 0.40, at: 1.0, gain: 0, fadeOut: 0.15 },
  { what: 'Pan Theme from its top: the guitar enters on the B3 dissolve (bar downbeats at 5.479 + 2k s)', src: THEME, from: 0.0, to: 12.509, at: 5.0, gain: 0, fadeOut: 0.06 },
  { what: 'the full band statement to the resolution, spliced on the bar downbeat 17.479 s (theme 48.479 s), 0.44 s before the Baron cut', src: THEME, from: 48.449, to: 59.976, at: 17.449, gain: 0, fadeIn: 0.06 }, // a complementary 60 ms crossfade centred on the downbeat
  { what: 'one last pan tap, then silence on the card', src: THEME, from: 0.0, to: 0.40, at: 29.3, gain: -2, fadeOut: 0.15 },
];
