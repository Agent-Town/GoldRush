// scripts/launch-video/lib/town.mjs: the town and menu steps of a capture (task launch-video-capture-2).
// Every step is a player's step: typing into the name card, walking with WASD to a building's approach
// point (read from `window.__GR_TOWN_DIAGNOSTICS__`), clicking the building's own button. The testids
// are the ones the e2e suite drives (e2e/profile-first-boot.spec.ts, e2e/061-first-claim-onboarding.spec.ts,
// e2e/tape-02-lantern-show.spec.ts, e2e/mp-07c-3-invitation.spec.ts, e2e/gazette-living.spec.ts).

import { CAPTURE_NAME, CAPTURE_TOWN, log, sleep } from './capture.mjs';
import { readTown } from './pilot.mjs';

const MOVE_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];

/** The fresh-store first screen: "Who's prospecting?" (the Claim Ledger card), typed at a hand's pace. */
export async function createProfile(page, { name = CAPTURE_NAME, typeDelayMs = 150, beforeCreateMs = 700, beforeCreate = null } = {}) {
  await page.getByTestId('profile-title').waitFor({ timeout: 60_000 });
  const input = page.getByTestId('profile-name-input');
  await input.click();
  await input.pressSequentially(name, { delay: typeDelayMs });
  await sleep(beforeCreateMs);
  if (beforeCreate) await beforeCreate(page);
  await page.getByTestId('profile-create').click();
  log(`profile created: ${name}`);
}

export async function waitForTown(page, timeout = 90_000) {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout });
}

export async function nameTown(page, { town = CAPTURE_TOWN, typeDelayMs = 110 } = {}) {
  await page.getByTestId('town-name-card').waitFor({ timeout: 30_000 });
  const input = page.getByTestId('town-name-input');
  await input.click();
  await input.pressSequentially(town, { delay: typeDelayMs });
  await sleep(500);
  await page.getByTestId('town-name-submit').click();
  log(`town named: ${town}`);
}

/** A story card goes on any press (src/story/StoryRuntime.ts): the press lands on the card itself. */
export async function dismissStoryCard(page, { waitMs = 8_000 } = {}) {
  const card = page.getByTestId('story-beat-card');
  try {
    await card.waitFor({ timeout: waitMs });
  } catch {
    return null;
  }
  const id = await card.getAttribute('data-beat-id');
  await sleep(1200);
  const box = await card.boundingBox();
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await card.waitFor({ state: 'detached', timeout: 8_000 }).catch(() => {});
  log(`story card dismissed: ${id}`);
  return id;
}

/**
 * A fresh profile's town welcome (src/town/TownWelcome.ts): the newsie brings issue No. 1, then walks three
 * stops. Every building prompt stays hidden while it runs (TownScene.syncWelcomeBark), so a capture either
 * walks it or skips it; both are the player's own buttons. `onPaper(page)` runs while the paper is open.
 */
export async function handleWelcome(page, { takePaper = true, onPaper = null, skip = true, waitMs = 15_000 } = {}) {
  // The bark can carry the same buttons twice (the welcome re-renders its card), so only a visible one counts.
  const take = page.locator('[data-testid="town-welcome-take-paper"]:visible').first();
  const skipButton = page.locator('[data-testid="town-welcome-skip"]:visible').first();
  const started = Date.now();
  let paper = false;
  while (Date.now() - started < waitMs) {
    if (takePaper && !paper && (await take.isVisible().catch(() => false))) {
      await take.click();
      await page.getByTestId('claim-herald').waitFor({ timeout: 15_000 });
      paper = true;
      log('welcome: issue No. 1 taken');
      if (onPaper) await onPaper(page);
      await page.getByTestId('claim-herald-close').click();
      await page.getByTestId('claim-herald').waitFor({ state: 'detached', timeout: 10_000 }).catch(() => {});
      continue;
    }
    if (skip && (await skipButton.isVisible().catch(() => false)) && (paper || !takePaper)) {
      await skipButton.click();
      log('welcome: skipped');
      await sleep(600);
      return { paper, skipped: true };
    }
    await sleep(250);
  }
  return { paper, skipped: false };
}

/** Marta Vale's first-claim greeting in town goes on Shift (e2e/061-first-claim-onboarding.spec.ts:77). */
export async function dismissGreeting(page) {
  const guide = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide ?? null);
  if (!guide?.greetingVisible) return false;
  await page.keyboard.press('ShiftLeft');
  await sleep(400);
  return true;
}

async function holdKeys(page, held, keys) {
  for (const key of held) if (!keys.includes(key)) await page.keyboard.up(key);
  for (const key of keys) await page.keyboard.down(key);
  return new Set(keys);
}

export async function walkTown(page, target, { tolerance = 0.8, timeoutMs = 20_000, prompt = null } = {}) {
  const started = Date.now();
  let held = new Set();
  while (Date.now() - started < timeoutMs) {
    const town = await readTown(page);
    if (!town) { await sleep(100); continue; }
    if (prompt && town.activePrompt === prompt) break;
    const dx = target.x - town.player.x;
    const dz = target.z - town.player.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= tolerance) break;
    const keys = [];
    if (dx / distance > 0.38) keys.push('KeyD'); else if (dx / distance < -0.38) keys.push('KeyA');
    if (dz / distance > 0.38) keys.push('KeyS'); else if (dz / distance < -0.38) keys.push('KeyW');
    held = await holdKeys(page, held, keys);
    await sleep(distance < 1.5 ? 50 : 80);
    if (distance < 1.5) held = await holdKeys(page, held, []);
  }
  for (const key of MOVE_KEYS) await page.keyboard.up(key);
  const town = await readTown(page);
  return town;
}

export async function walkToBuilding(page, id, { prompt = id, timeoutMs = 25_000 } = {}) {
  const town = await readTown(page);
  const building = town?.buildings.find((entry) => entry.id === id);
  if (!building) throw new Error(`no town building ${id}`);
  const arrived = await walkTown(page, building.approach, { prompt, timeoutMs });
  if (arrived?.activePrompt !== prompt) {
    // The prompt ring is a little wider than the approach mark; one more step onto the mark.
    await walkTown(page, building.approach, { tolerance: 0.3, timeoutMs: 4_000 });
  }
  const final = await readTown(page);
  log(`walked to ${id}: prompt=${final?.activePrompt}`);
  return final;
}

export async function openBoard(page) {
  // A running welcome hides every building prompt; the player's own "Skip welcome" ends it.
  const skip = page.locator('[data-testid="town-welcome-skip"]:visible').first();
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
    await sleep(600);
  }
  await walkToBuilding(page, 'tavern');
  await page.locator('[data-testid="town-open-board"]:visible').first().click({ timeout: 15_000 });
  await page.getByTestId('contract-board').waitFor({ timeout: 15_000 });
}

/** A board click stages the launch and reloads into the run (src/main.ts launchContract). */
export async function launchFromBoard(page, contractId) {
  const button = page.getByTestId(`contract-launch-${contractId}`);
  await button.waitFor({ timeout: 15_000 });
  await button.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 120_000 });
  log(`launched ${contractId} from the board`);
}

/**
 * A fresh store's whole arrival, in the game's own order: the name card on the menu, the town's name, the
 * elder's founding card, Marta Vale's first-claim greeting (Shift), then the newsie's issue No. 1 and the
 * welcome's own Skip. `onPaper` runs while issue No. 1 is open (the real "NEW HANDS, WELCOME" front page).
 */
export async function onboard(page, { typeDelayMs = 150, onNameTyped = null, onPaper = null } = {}) {
  await createProfile(page, { typeDelayMs, beforeCreate: onNameTyped });
  await waitForTown(page);
  await nameTown(page);
  const beat = await dismissStoryCard(page);
  await sleep(900);
  let greeted = false;
  for (let attempt = 0; attempt < 10 && !greeted; attempt += 1) {
    greeted = await dismissGreeting(page);
    if (!greeted) await sleep(400);
  }
  const welcome = await handleWelcome(page, { onPaper, waitMs: 20_000 });
  return { beat, greeted, welcome };
}
