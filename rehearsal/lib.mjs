// THE SAGA REHEARSAL driver — one persistent browser profile, per-segment video.
// Solo-writer rig (TASK.md 2026-07-22). Videos stay local; screenshots + ledger commit.
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, renameSync, statSync, appendFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const BASE = 'http://127.0.0.1:5231';
const PROFILE_DIR = path.join(ROOT, 'rehearsal-profile');
const VIDEO_DIR = path.join(ROOT, 'rehearsal-video');
const VIDEO_TMP = path.join(VIDEO_DIR, '.tmp');
export const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-rehearsal');
const VIDEO_LOG = path.join(ROOT, 'rehearsal-video', 'segments.jsonl');

export async function openSegment(name, { url = '/' } = {}) {
  mkdirSync(VIDEO_TMP, { recursive: true });
  mkdirSync(SHOT_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VIDEO_TMP, size: { width: 1280, height: 720 } },
  });
  const page = context.pages()[0] ?? (await context.newPage());
  page.on('dialog', (d) => d.accept().catch(() => {})); // never let a native confirm() stall a run
  const errors = { console: [], page: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' && !t.includes('ws://127.0.0.1:5231') && t !== 'Failed to load resource: net::ERR_CONNECTION_REFUSED')
      errors.console.push(t);
  });
  page.on('pageerror', (e) => errors.page.push(e.message));
  const startedAt = Date.now();
  await page.goto(BASE + url);
  const finish = async (note = '') => {
    const video = page.video();
    await context.close();
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    let file = null;
    if (video) {
      const raw = await video.path();
      file = path.join(VIDEO_DIR, `${name}.webm`);
      renameSync(raw, file);
    }
    appendFileSync(VIDEO_LOG, JSON.stringify({ segment: name, seconds, file: file ? path.basename(file) : null, note, at: new Date().toISOString() }) + '\n');
    console.log(`[segment ${name}] ${seconds}s errors: console=${errors.console.length} page=${errors.page.length}`);
    if (errors.console.length) console.log('  console errors:', JSON.stringify(errors.console.slice(0, 8), null, 1));
    if (errors.page.length) console.log('  page errors:', JSON.stringify(errors.page.slice(0, 8), null, 1));
    return { seconds, errors };
  };
  return { context, page, errors, finish };
}

export async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file });
  console.log(`  shot: ${name}.png`);
}

export async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

export async function poll(fn, { timeout = 10_000, interval = 150, label = 'poll' } = {}) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    last = await fn();
    if (last) return last;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(`${label}: timeout (${timeout}ms); last=${JSON.stringify(last)}`);
}

export async function townReady(page) {
  await poll(() => page.evaluate(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10), { label: 'town frames' });
}

export async function gameReady(page) {
  await poll(() => page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10), { timeout: 30_000, label: 'game frames' });
}

export async function walkToPrompt(page, moves, expected) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    for (const [key, ms] of moves) await hold(page, key, ms);
    try {
      await poll(async () => (await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === expected, {
        timeout: 6_000,
        label: `prompt ${expected}`,
      });
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}

export async function openSchoolhouse(page) {
  await walkToPrompt(page, [['KeyA', 900], ['KeyS', 500]], 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
}

export async function openBoard(page) {
  await walkToPrompt(page, [['KeyA', 850], ['KeyW', 850]], 'tavern');
  await page.getByTestId('town-open-board').click();
  await poll(() => page.getByTestId('contract-board').isVisible(), { label: 'board visible' });
}

export function log(...args) {
  console.log(...args);
}

export function ceremonyDiag(page) {
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.ceremony ?? null);
}

/** Seed the meta science track to `steps` (the cited grinding shortcut: one
 * science per secured run). Runs on the start menu, then reloads. */
export async function seedScience(page, steps) {
  await page.evaluate((n) => {
    const key = 'gr.profile.v2.rehearsal.gr.meta.v1';
    const meta = JSON.parse(localStorage.getItem(key) ?? '{"version":1,"tracks":{"territory":0,"science":0,"hero":0,"agent":0}}');
    meta.tracks.science = Math.max(meta.tracks.science, n);
    localStorage.setItem(key, JSON.stringify(meta));
  }, steps);
  await page.reload();
  await poll(() => page.getByTestId('start-menu-enter-town').isVisible(), { label: 'start menu after seed' });
}

/** Raise the era's one-shot megaproject (E3+) then walk the framework ceremony:
 * begin → play the hand (hold or rhythm) → done → successor armed. */
export async function frameworkCeremony(page, { shotPrefix, hand }) {
  const mpDoor = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="epoch-megaproject-door"]');
    return el ? { id: el.getAttribute('data-megaproject-id'), state: el.getAttribute('data-door-state') } : null;
  });
  console.log('megaproject door:', JSON.stringify(mpDoor));
  if (mpDoor?.state === 'ready') {
    await page.getByTestId('raise-epoch-megaproject').click();
    console.log('megaproject raised (one-shot manifest purchase)');
  }
  const door = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="ceremony-epoch-door"]');
    return el ? { id: el.getAttribute('data-ceremony-id'), state: el.getAttribute('data-door-state'), text: el.textContent.replace(/\s+/g, ' ').slice(0, 200) } : null;
  });
  console.log('ceremony door:', JSON.stringify(door));
  await shot(page, `${shotPrefix}-door`);
  await page.getByTestId('begin-ceremony').click();
  await poll(async () => (await ceremonyDiag(page))?.phase, { label: 'ceremony open' });
  console.log('ceremony phase:', (await ceremonyDiag(page))?.phase);
  await shot(page, `${shotPrefix}-open`);

  const handEl = page.getByTestId('ceremony-hand-input');
  if (hand === 'hold') {
    await handEl.dispatchEvent('pointerdown');
    await poll(async () => {
      const c = await ceremonyDiag(page);
      return c && c.phase !== 'open-valve' && c.phase !== 'haul';
    }, { timeout: 25_000, label: 'hand crest' });
    await handEl.dispatchEvent('pointerup');
  } else if (hand === 'rhythm') {
    for (let safety = 0; safety < 300; safety += 1) {
      const c = await ceremonyDiag(page);
      if (!c) throw new Error('ceremony diagnostics missing');
      if (c.phase === 'done') break;
      if (c.hand?.windowOpen) {
        await handEl.dispatchEvent('pointerdown');
        await handEl.dispatchEvent('pointerup');
        await page.waitForTimeout(120);
      } else await page.waitForTimeout(70);
    }
  }
  await shot(page, `${shotPrefix}-mid`);
  await poll(async () => (await ceremonyDiag(page))?.phase === 'done', { timeout: 30_000, label: 'ceremony done' });
  const done = await ceremonyDiag(page);
  console.log('ceremony done:', JSON.stringify({ beats: done?.beats, armCount: done?.armCount, armed: done?.armedEpochId, kept: done?.keptImage, armFailure: done?.armFailure }));
  await shot(page, `${shotPrefix}-done`);
  await page.getByTestId('ceremony-return').click().catch(() => {});
  return done;
}
