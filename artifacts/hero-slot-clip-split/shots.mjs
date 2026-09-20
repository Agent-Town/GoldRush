// PLAIN-BOOT 390 px EVIDENCE for hero-slot-clip-split (Mistake #10: "where does the PLAYER see
// this, in a plain boot?"). Two shots, no `?debug` anywhere, against a `vite preview` of the
// GR_RELEASE=e1 build on 5294:
//
//  town-390.png   the town with the hero ANIMATING — the frame key is sampled until it advances
//                 twice, so the shot proves motion rather than a still sprite. `?tier=full` is the
//                 only query and it is menu-safe (src/main.ts MENU_SAFE_PARAMS), so this is the
//                 start menu -> Enter Town route a player takes.
//  claim-swing-390.png  the claim's first swing, reached the way a player reaches it: a bare `/`
//                 with a profile falls through to startWithProfiles -> startGame (src/main.ts), a
//                 real run with waves on, and the shot is taken on the first frame the hero's own
//                 diagnostics report clip `attack` with a char-hero-sheet-attack8 frame key. That
//                 key is the proof the deferred claim group actually arrived and is being drawn.
//
// __THREE_GAME_DIAGNOSTICS__ is published unconditionally (src/game/Game.ts), unlike __GR_TEST__,
// which the release build never installs — so this reads the game's own state without a debug seam.

import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.GR_TIMINGS_BASE ?? 'http://127.0.0.1:5294';
const OUT = 'artifacts/hero-slot-clip-split';
const VIEWPORT = { width: 390, height: 844 };

const storyCardGone = (page) => page
  .waitForFunction(() => !document.querySelector('[data-testid="story-beat-card"]'), null, { timeout: 45_000 })
  .catch(() => undefined);

const seedProfile = () => {
  localStorage.clear();
  sessionStorage.clear();
  const PROFILE_KEY = 'gr.profile.v2';
  const key = (logical) => `${PROFILE_KEY}.robin.${logical}`;
  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  localStorage.setItem(key('gr.town.name.v1'), 'Quartz Hill');
  localStorage.setItem(key('gr.meta.v1'), JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  localStorage.setItem(key('gr.firstClaim.done.v1'), '1');
};

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const report = {};

async function newPage() {
  const context = await browser.newContext({ viewport: VIEWPORT, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.addInitScript(seedProfile);
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  return { context, page, errors };
}

// ── the town, hero animating ───────────────────────────────────────────────────────────────────
{
  const { context, page, errors } = await newPage();
  await page.goto(`${BASE}/?tier=full`, { waitUntil: 'load' });
  await page.getByTestId('start-menu-enter-town').click({ timeout: 120_000 });
  await page.waitForFunction(
    () => document.querySelector('#game-canvas')?.dataset.assetLoadingState === 'ready'
      && Number(document.querySelector('#game-canvas')?.dataset.assetLoadingTotal ?? 0) > 0,
    null,
    { timeout: 180_000 },
  );
  // MOTION, NOT A STILL. The town publishes no sprite diagnostics (TownScene's
  // __GR_TOWN_DIAGNOSTICS__ carries the player's position, not its frame keys), so the proof is
  // the walk itself: hold a movement key, sample the hero's position, and shoot MID-STRIDE. A hero
  // that is moving is a hero playing its walk clip — that is the branch Hero.ts:192 takes.
  const groupsAtReady = await page.locator('#game-canvas').getAttribute('data-sprite-clip-groups');
  await storyCardGone(page);
  const before = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? null);
  await page.keyboard.down('KeyD');
  await page.waitForFunction(
    (start) => {
      const now = window.__GR_TOWN_DIAGNOSTICS__?.player;
      return !!now && !!start && (Math.abs(now.x - start.x) > 9 || Math.abs(now.z - start.z) > 9);
    },
    before,
    { timeout: 30_000 },
  ).catch(() => undefined);
  await storyCardGone(page);
  const after = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? null);
  await page.locator('#game-canvas').screenshot({ path: `${OUT}/town-390.png` });
  await page.keyboard.up('KeyD');
  report.town = { groupsAtReady, walkedFrom: before, walkedTo: after, groups: await page.locator('#game-canvas').getAttribute('data-sprite-clip-groups'), errors };
  await context.close();
}

// ── the claim's first swing ────────────────────────────────────────────────────────────────────
{
  const { context, page, errors } = await newPage();
  // `contract` is NOT in src/main.ts's MENU_SAFE_PARAMS, so this URL falls through to
  // startWithProfiles -> startGame: a real run of the first contract, waves on, no debug seam. (A
  // BARE `/` cannot be used: an empty search satisfies the menu-safe test vacuously and lands on
  // the start menu.) The swing that follows is the game's own — the hero fires at an enemy the wave
  // scheduler spawned, and Game.ts calls playAttackPose.
  await page.goto(`${BASE}/?contract=the-claim`, { waitUntil: 'load' });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5, null, { timeout: 180_000 });
  await storyCardGone(page);
  const swung = await page.waitForFunction(
    () => {
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.hero'];
      return hero?.clip === 'attack' && String(hero.frameKey ?? '').startsWith('char-hero-sheet-attack8-') ? hero : null;
    },
    null,
    { timeout: 180_000 },
  ).then((handle) => handle.jsonValue()).catch(() => null);
  await page.locator('#game-canvas').screenshot({ path: `${OUT}/claim-swing-390.png` });
  report.claim = { swing: swung, groups: await page.locator('#game-canvas').getAttribute('data-sprite-clip-groups'), errors };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
