import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_URL = 'https://gold-rush-3in.pages.dev';
const DEFAULT_NAME = 'The Second Rider';
const PROFILE_KEY = 'gr.profile.v2';

export async function startSecondRider({ claimWord, url = DEFAULT_URL, name = DEFAULT_NAME, partySize = 2, record = false, relayUrl } = {}) {
  const cleanName = String(name).replace(/\s+/g, ' ').trim();
  if (!cleanName || cleanName.length > 24) throw new Error('Rider name must be 1-24 characters.');
  if (!Number.isInteger(partySize) || partySize < 2 || partySize > 4) throw new Error('Party size must be 2-4.');
  const rideUrl = validHttpUrl(url);
  const relayBase = validHttpUrl(relayUrl ?? rideUrl.origin).origin;
  const code = roomCode(claimWord);
  const room = await inspectRoom(relayBase, code);
  const profileId = `rider-${process.pid}-${Date.now().toString(36)}`;
  const videoDir = path.join(ROOT, 'rider-video');
  if (record) await mkdir(videoDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ...(record ? { recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } } } : {}),
  });
  const page = await context.newPage();
  const errors = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));

  await seedProfile(page, { profileId, name: cleanName, partySize, relayBase, setup: room.setup });
  try {
    await openTownBoard(page, rideUrl.href);
    await ensureRideOpen(page);
    await page.getByTestId('ride-join-input').fill(String(claimWord).trim());
    await page.getByTestId('ride-join-submit').click();
    await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 30_000 });
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible().catch(() => false)) await briefing.click();
  } catch (error) {
    await context.close();
    await browser.close();
    throw error;
  }

  let stopped = false;
  let timer;
  const pressed = new Set();
  let previousHost = null;
  let lastReloadAt = 0;

  const drive = async () => {
    if (stopped || page.isClosed()) return;
    try {
      const view = await page.evaluate(() => {
        const mp = window.__GR_MP__?.state();
        const game = window.__THREE_GAME_DIAGNOSTICS__;
        if (!mp || !game) return null;
        return {
          mp: { connected: mp.connected, reconnecting: mp.reconnecting, error: mp.error, tick: mp.tick },
          runState: game.runState,
          enemies: game.enemiesAlive,
          waveState: game.waveState,
          offer: game.progression.offer,
          nodes: game.harvest.activeNodes.filter((node) => node.active),
          actors: game.actors.filter((actor) => actor.visible),
        };
      });
      if (!view) return;
      if (!view.mp.connected && !view.mp.reconnecting && view.mp.error && Date.now() - lastReloadAt > 5_000) {
        lastReloadAt = Date.now();
        await releaseAll(page, pressed);
        await page.reload();
        await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 30_000 });
        previousHost = null;
        return;
      }

      const local = view.actors.find((actor) => actor.local);
      const hostSlot = partySize === 2 ? 0 : partySize - 1;
      const host = view.actors.find((actor) => !actor.local && actor.slot === hostSlot);
      if (!local || !host || view.runState === 'dead') return releaseAll(page, pressed);
      if (view.runState === 'levelup' && view.offer?.length) {
        await releaseAll(page, pressed);
        await page.keyboard.press('Digit1');
        return;
      }

      const pack = view.enemies >= 4;
      if ((pack && local.weapon !== 'blast') || (!pack && local.weapon !== 'rig')) await page.keyboard.press('KeyQ');

      const calm = view.enemies === 0 && view.waveState === 'quiet';
      const hostDistance = distance(local.position, host.position);
      let target = convoyTarget(local.position, host.position, previousHost, view.mp.tick, local.hp / local.maxHp);
      let pan = false;
      if (calm && hostDistance < 4.5) {
        const node = nearestNode(local.position, view.nodes);
        if (node) {
          target = node.position;
          pan = distance(local.position, node.position) < 1.35;
        }
      }
      previousHost = { x: host.position.x, z: host.position.z };
      // Leg-1 shame: a motionless companion dies before it helps; even calm fallback is a moving orbit.
      await setPressed(page, pressed, movementKeys(local.position, target, pan));
    } catch (error) {
      if (!stopped && !page.isClosed()) errors.pageErrors.push(error instanceof Error ? error.message : String(error));
    } finally {
      if (!stopped) timer = setTimeout(drive, 180);
    }
  };
  void drive();

  return {
    page,
    errors,
    async stop() {
      if (stopped) return;
      stopped = true;
      clearTimeout(timer);
      if (!page.isClosed()) await releaseAll(page, pressed);
      await context.close();
      await browser.close();
    },
  };
}

async function inspectRoom(relayBase, code) {
  const response = await fetch(`${relayBase}/api/multiplayer/inspect?code=${code}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.setup) throw new Error("That claim's gone quiet.");
  if (body.started) throw new Error('That ride already started. Summon the rider before Start Ride.');
  return body;
}

async function seedProfile(page, { profileId, name, partySize, relayBase, setup }) {
  await page.addInitScript(({ profileId: id, riderName, riderPartySize, relay, roomSetup, profileKey }) => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setSecondRiderParty(key, value) {
      if (key === 'gr.mp.ride.v1') value = JSON.stringify({ ...JSON.parse(value), partySize: riderPartySize });
      return setItem.call(this, key, value);
    };
    const marker = 'gr.second-rider.profile';
    if (sessionStorage.getItem(marker) !== id) {
      localStorage.clear();
      sessionStorage.clear();
      const now = Date.now();
      localStorage.setItem(profileKey, JSON.stringify({
        version: 2,
        activeId: id,
        profiles: [{ id, name: riderName, createdAt: now, updatedAt: now, difficultyPreset: roomSetup.difficultyPreset, hintsSeen: [] }],
      }));
      const scoped = (key) => `${profileKey}.${id}.${key}`;
      localStorage.setItem(scoped('gr.town.name.v1'), 'Second Rider Camp');
      localStorage.setItem(scoped('gr.scores.v2'), '[]');
      localStorage.setItem(scoped('gr.meta.v1'), JSON.stringify(roomSetup.meta));
      localStorage.setItem(scoped('gr.difficultyPreset.v1'), roomSetup.difficultyPreset);
      localStorage.setItem(scoped('gr.activeEpoch.v1'), roomSetup.research?.epochId ?? 'epoch-1-frontier');
      localStorage.setItem(scoped(`gr.research.${roomSetup.research?.epochId ?? 'epoch-1-frontier'}.v1`), JSON.stringify(roomSetup.research));
      localStorage.setItem(scoped('gr.research.v1'), JSON.stringify(roomSetup.research));
      localStorage.setItem(scoped('gr.medals.v1'), JSON.stringify({
        version: 1,
        baronBeaten: roomSetup.research?.unlocks?.rocketCartCaptured === true,
        rocketCartCaptured: roomSetup.research?.unlocks?.rocketCartCaptured === true,
      }));
      sessionStorage.setItem(marker, id);
    }
    localStorage.setItem('gr.mp.relayBase.v1', relay);
  }, { profileId, riderName: name, riderPartySize: partySize, relay: relayBase, roomSetup: setup, profileKey: PROFILE_KEY });
}

async function openTownBoard(page, url) {
  const destination = new URL(url);
  await page.goto(`${destination.origin}${destination.pathname}`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 20_000 });
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  try {
    await page.waitForFunction(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt === 'tavern', undefined, { timeout: 10_000 });
  } catch {
    const town = await page.evaluate(() => {
      const state = window.__GR_TOWN_DIAGNOSTICS__;
      return state && { player: state.player, activePrompt: state.activePrompt, namingPrompt: state.namingPrompt, townName: state.townName };
    });
    throw new Error(`Could not reach the town board: ${JSON.stringify(town)}`);
  }
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-board').waitFor({ state: 'visible' });
  await page.evaluate((href) => history.replaceState(null, '', href), destination.href);
}

async function ensureRideOpen(page) {
  const card = page.getByTestId('ride-together-card');
  await card.waitFor({ state: 'visible' });
  if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();
  await page.getByTestId('ride-together-controls').waitFor({ state: 'visible' });
}

function convoyTarget(local, host, previousHost, tick, healthRatio) {
  let dx = previousHost ? host.x - previousHost.x : host.x - local.x;
  let dz = previousHost ? host.z - previousHost.z : host.z - local.z;
  const moved = Math.hypot(dx, dz);
  if (moved < 0.04) {
    const angle = tick / 75;
    dx = Math.cos(angle);
    dz = Math.sin(angle);
  } else {
    dx /= moved;
    dz /= moved;
  }
  const spacing = healthRatio < 0.4 ? 5 : 2.7;
  return { x: host.x - dx * spacing, z: host.z - dz * spacing };
}

function nearestNode(position, nodes) {
  return nodes.reduce((best, node) => !best || distance(position, node.position) < distance(position, best.position) ? node : best, null);
}

function movementKeys(position, target, settled) {
  if (settled) return [];
  const keys = [];
  const dx = target.x - position.x;
  const dz = target.z - position.z;
  if (dx < -0.45) keys.push('KeyA');
  if (dx > 0.45) keys.push('KeyD');
  if (dz < -0.45) keys.push('KeyW');
  if (dz > 0.45) keys.push('KeyS');
  return keys;
}

async function setPressed(page, pressed, desired) {
  const next = new Set(desired);
  for (const key of [...pressed]) if (!next.has(key)) {
    await page.keyboard.up(key);
    pressed.delete(key);
  }
  for (const key of next) await press(page, pressed, key);
}

async function press(page, pressed, key) {
  if (pressed.has(key)) return;
  await page.keyboard.down(key);
  pressed.add(key);
}

async function releaseAll(page, pressed) {
  for (const key of [...pressed]) await page.keyboard.up(key).catch(() => {});
  pressed.clear();
}

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function roomCode(value) {
  const raw = String(value ?? '').trim().toUpperCase();
  const direct = raw.replace(/[^A-F0-9]/g, '');
  if (/^[A-F0-9]{24}$/.test(direct)) return direct;
  const suffix = raw.replace(/\s+/g, '-').split('-').at(-1) ?? '';
  if (!/^[0-9A-V]{20}$/.test(suffix)) throw new Error('Pass the full claim word from Ride Together.');
  let code = 0n;
  for (const char of suffix) code = code * 32n + BigInt(Number.parseInt(char, 32));
  return code.toString(16).toUpperCase().padStart(24, '0');
}

function validHttpUrl(value) {
  const parsed = new URL(String(value));
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL must use http or https.');
  return parsed;
}

function parseArgs(args) {
  const options = { claimWord: '', url: DEFAULT_URL, name: DEFAULT_NAME, partySize: 2, record: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--record') options.record = true;
    else if (arg === '--url' || arg === '--name' || arg === '--party') {
      const value = args[++index];
      if (!value) throw new Error(`${arg} needs a value.`);
      if (arg === '--party') options.partySize = Number(value);
      else options[arg.slice(2)] = value;
    } else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else if (!options.claimWord) options.claimWord = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!options.claimWord) throw new Error('Usage: node scripts/second-rider.mjs <CLAIM-WORD> [--url URL] [--name NAME] [--party 2-4] [--record]');
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rider = await startSecondRider(options);
  console.log(`${options.name} is on the wire. Start the ride when your roster is ready.`);
  await new Promise((resolve) => {
    const stop = async () => {
      await rider.stop();
      resolve();
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
