/** Run 7: observe the unchanged run-6 native journey, then the actual Book/raw route.
 * No charter staging, debug bridge, simulation writes or fabricated completion.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type BrowserContext, devices } from '@playwright/test';
import { SCOREBOARD_KEY, profileDataKey } from '../../src/game/ProfileStorage';
import { nativeProof } from './driver';

test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
// Keep the player's actual page and storage through both earned finales.
let journeyPage: Page;
let journeyContext: BrowserContext;
test.describe.configure({ mode: 'serial' });
test.beforeAll(async ({ browser }, info) => {
  const phone = info.project.name === 'mobile-chrome';
  journeyContext = await browser.newContext({
    ...(phone ? devices['Pixel 5'] : devices['Desktop Chrome']),
    viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 800 },
    baseURL: info.project.use.baseURL,
  });
  journeyPage = await journeyContext.newPage();
});
test.afterAll(async () => { await journeyContext?.close(); });
test.use({ trace: 'off', page: async ({}, use) => { await use(journeyPage); } });
const root = path.resolve('artifacts/sol/play-proofs/run-7/e10-river');
const scoreKey = profileDataKey('robin', SCOREBOARD_KEY);
type Score = { contractId?: string; secured?: boolean; completed?: boolean; at?: number; waves?: number; gold?: number; timeAlive?: number };
type Observation = { kind: string; sim: number; gold: number; raw: string | null; river: Score[] };
let observations: Observation[];
let errors: { console: string[]; page: string[] };
let standings: string[];
let ceremony: boolean;
let panShot: Promise<unknown> | undefined;
let firstRiver: string;
let repull = false;

async function scores(page: Page) {
  return page.evaluate(key => localStorage.getItem(key), scoreKey);
}

// Read-only observer survives real navigations. It never drives the hero or changes storage.
test.beforeEach(async ({ page }, info) => {
  repull = info.titlePath.includes('real lever re-pull');
  if (repull) {
    ceremony = false;
    // The first proof ended in the raw route. Return normally, select Last Claim
    // in the Book, and let the SAME driver earn wave 8 again on this profile.
    await page.getByTestId('hud-pause').click();
    await page.getByTestId('pause-back-to-town').click();
    await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await tavern(page);
    await page.getByTestId('town-open-board').click();
    await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
    await page.getByTestId('contract-launch-e10-last-claim').click();
    return;
  }
  await mkdir(root, { recursive: true });
  observations = []; errors = { console: [], page: [] }; standings = []; ceremony = false; panShot = undefined;
  page.on('console', m => { if (m.type() === 'error') errors.console.push(m.text()); });
  page.on('pageerror', e => errors.page.push(e.message));
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame() && new URL(frame.url()).searchParams.has('nowaves')) ceremony = true;
  });
  page.on('request', request => {
    if (ceremony && new URL(request.url()).pathname === '/api/standings') standings.push(`${request.method()} ${request.url()}`);
  });
  // Count real requests, but never let this test publish county data.
  await page.route('https://agenttown.app/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.exposeFunction('recordRiverObservation', (observation: Observation) => {
    observations.push(observation);
    if (observation.kind === 'first-gold' && !panShot) {
      panShot = page.screenshot({ path: path.join(root, `pan-${info.project.name}.png`) });
    }
  });
  await page.addInitScript(({ key }) => {
    let boot = false, first = false, second = false;
    const timer = setInterval(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      if (!d || !location.search.includes('nowaves') || d.frame < 13) return;
      const raw = localStorage.getItem(key);
      const river = (JSON.parse(raw ?? '[]') as Score[]).filter(s => s.contractId === 'e10-river');
      let kind = '';
      if (!boot) { boot = true; kind = 'boot'; }
      else if (!first && d.economy.gold >= 5) { first = true; kind = 'first-gold'; }
      else if (!second && d.economy.gold >= 10) { second = true; kind = 'second-gold'; clearInterval(timer); }
      if (kind) void (window as unknown as { recordRiverObservation: (o: Observation) => Promise<void> }).recordRiverObservation({ kind, sim: d.timeAlive, gold: d.economy.gold, raw, river });
    }, 16);
  }, { key: scoreKey });
});

test.describe('first ending', () => { nativeProof('e10-river', 7); });
test.describe('real lever re-pull', () => { nativeProof('e10-river', 7); });

test.afterEach(async ({ page }, info) => {
  if (info.status === 'skipped') return;
  info.setTimeout(240_000);
  const result: Record<string, unknown> = { observations, errors, standings, repull: { ok: false, detail: 'not yet measured' } };
  try {
    await panShot;
    const rowFile = path.join(root, `row-${info.project.name}.json`);
    const row = JSON.parse(await readFile(rowFile, 'utf8'));
    result.nativeCells = { banks: row.banks, reload: row.reload, board: row.board, secures: row.secures };
    if (repull) {
      const pans = observations.filter(o => o.kind === 'first-gold');
      const again = pans.at(-1)!;
      expect(pans, 'two actual lever-launched runs').toHaveLength(2);
      expect(JSON.stringify(again.river), 'the second earned lever preserves the original River score').toBe(firstRiver);
      expect(await scores(page), 'second ceremony writes no additional score').toBe(again.raw);
      expect(observations.filter(o => o.kind === 'second-gold').at(-1)?.raw).toBe(again.raw);
      expect(row.objective.prelude.secures.ok, 'second wave-8 prelude really secured').toBe(true);
      expect(row.boots.ok).toBe(true);
      expect(row.secures.ok).toBe(true);
      expect(row.board.ok).toBe(true);
      expect(standings).toEqual([]);
      expect(errors).toEqual({ console: [], page: [] });
      // The unchanged run-6 driver requires a NEW River row on every journey.
      // On this intentionally repeated ending only that exact assertion MUST fail.
      expect(info.errors).toHaveLength(1);
      expect(info.errors[0].message).toContain('banks: no new secured/completed score for e10-river');
      await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
      await expect(page.getByTestId('contract-best-e10-river')).toHaveText('Secured: wave 0, 5 gold');
      await page.screenshot({ path: path.join(root, `repull-book-${info.project.name}.png`) });
      result.repull = { ok: true, detail: 'Second Last Claim earned wave 8 on the same page/profile; real lever clicked, panned twice, original River bytes retained.' };
      result.ceremonyStandings = [...standings];
      await writeFile(path.join(root, `repull-row-${info.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
      await writeFile(rowFile, await readFile(path.join(root, `first-row-${info.project.name}.json`)));
      test.fail(true, 'The unchanged driver must refuse a NEW River score on the idempotent second ending; all re-pull assertions above pass.');
      return;
    }
    expect(row.banks.ok, row.banks.detail).toBe(true);
    expect(row.reload.ok, row.reload.detail).toBe(true);
    await writeFile(path.join(root, `first-row-${info.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
    const first = observations.find(o => o.kind === 'first-gold');
    const second = observations.find(o => o.kind === 'second-gold');
    expect(observations.find(o => o.kind === 'boot')?.river).toEqual([]);
    expect(first?.river).toHaveLength(1);
    expect(first!.river[0]).toMatchObject({ secured: true, waves: 0, gold: 5 });
    expect(second?.raw, 'second pan writes nothing more').toBe(first!.raw);
    expect(await scores(page), 'native bank/reload cells retain the first pan score').toBe(first!.raw);
    firstRiver = JSON.stringify(first!.river);
    result.firstGoldTime = first!.river[0].timeAlive;
    result.firstGold = first!.river[0].gold;
    await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
    const best = page.getByTestId('contract-best-e10-river');
    await best.scrollIntoViewIfNeeded();
    await expect(best).toHaveText('Secured: wave 0, 5 gold');
    await page.screenshot({ path: path.join(root, `book-${info.project.name}.png`) });
    await best.screenshot({ path: path.join(root, `bank-cell-${info.project.name}.png`) });
    await page.reload();
    expect(await scores(page), 'a literal plain reload preserves score bytes').toBe(first!.raw);
    result.literalReload = true;
    result.repull = { ok: false, detail: 'Measured by the following same-profile native journey.' };
    result.ceremonyStandings = [...standings];
    expect(standings, 'zero standings requests during the ceremony').toEqual([]);
    ceremony = false;
    // Measure the raw route using the real Book button, without constructing its URL.
    await page.goto('/');
    await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await tavern(page);
    await page.getByTestId('town-open-board').click();
    await page.getByTestId('contract-chapter-tab-epoch-10-deepsky').click();
    await page.getByTestId('contract-launch-e10-river').click();
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 60_000 });
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e10-river');
    await page.getByTestId('contract-briefing-dismiss').click();
    if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)) await page.keyboard.press('KeyP');
    const rawSamples = [];
    for (const target of [11.5, 26.5, 30]) {
      await page.waitForFunction(t => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= t, target, { polling: 16, timeout: 45_000 });
      rawSamples.push(await page.evaluate(target => {
        const d = window.__THREE_GAME_DIAGNOSTICS__!;
        return { target, sim: d.timeAlive, alive: d.enemiesAlive, wave: d.wave, gold: d.economy.gold };
      }, target));
    }
    result.rawRoute = rawSamples;
    await page.screenshot({ path: path.join(root, `raw-${info.project.name}.png`) });
    expect(errors).toEqual({ console: [], page: [] });

  } finally {
    result.observations = observations; result.errors = errors;
    await writeFile(path.join(root, `${repull ? 'repull' : 'ending'}-${info.project.name}.json`), JSON.stringify(result, null, 2) + '\n');
  }
});

async function steer(page: Page, dx: number, dz: number, ms: number) {
  const keys = [Math.abs(dx) > .35 ? dx > 0 ? 'KeyD' : 'KeyA' : '', Math.abs(dz) > .35 ? dz > 0 ? 'KeyS' : 'KeyW' : ''].filter(Boolean);
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}
async function tavern(page: Page) {
  for (let step = 0; step < 70; step++) {
    const t = await page.evaluate(() => {
      const d = window.__GR_TOWN_DIAGNOSTICS__!;
      return { prompt: d.activePrompt, hero: d.player, target: d.buildings.find(b => b.id === 'tavern')?.approach };
    });
    if (t.prompt === 'tavern') return;
    if (!t.target) throw new Error('no tavern approach');
    await steer(page, t.target.x - t.hero.x, t.target.z - t.hero.z, 170);
  }
  throw new Error('tavern not reached');
}
