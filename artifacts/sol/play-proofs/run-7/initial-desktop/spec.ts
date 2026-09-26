/** Run 7: observe the unchanged run-6 native journey, then the actual Book/raw route.
 * No charter staging, debug bridge, simulation writes or fabricated completion.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { SCOREBOARD_KEY, profileDataKey } from '../../src/game/ProfileStorage';
import { nativeProof } from './driver';

test.skip(process.env.GR_NATIVE_PROOF !== '1', 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
const root = path.resolve('artifacts/sol/play-proofs/run-7/e10-river');
const scoreKey = profileDataKey('robin', SCOREBOARD_KEY);
type Score = { contractId?: string; secured?: boolean; completed?: boolean; at?: number; waves?: number; gold?: number; timeAlive?: number };
type Observation = { kind: string; sim: number; gold: number; raw: string | null; river: Score[] };
let observations: Observation[];
let errors: { console: string[]; page: string[] };
let standings: string[];
let ceremony: boolean;
let panShot: Promise<unknown> | undefined;

async function scores(page: Page) {
  return page.evaluate(key => localStorage.getItem(key), scoreKey);
}

// Read-only observer survives real navigations. It never drives the hero or changes storage.
test.beforeEach(async ({ page }, info) => {
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

nativeProof('e10-river', 7);

test.afterEach(async ({ page }, info) => {
  if (info.status === 'skipped') return;
  info.setTimeout(240_000);
  const result: Record<string, unknown> = { observations, errors, standings, repull: { ok: false, detail: 'not yet measured' } };
  try {
    await panShot;
    const row = JSON.parse(await readFile(path.join(root, `row-${info.project.name}.json`), 'utf8'));
    result.nativeCells = { banks: row.banks, reload: row.reload, board: row.board, secures: row.secures };
    expect(row.banks.ok, row.banks.detail).toBe(true);
    expect(row.reload.ok, row.reload.detail).toBe(true);
    const first = observations.find(o => o.kind === 'first-gold');
    const second = observations.find(o => o.kind === 'second-gold');
    expect(observations.find(o => o.kind === 'boot')?.river).toEqual([]);
    expect(first?.river).toHaveLength(1);
    expect(first!.river[0]).toMatchObject({ secured: true, waves: 0, gold: 5 });
    expect(second?.raw, 'second pan writes nothing more').toBe(first!.raw);
    expect(await scores(page), 'native bank/reload cells retain the first pan score').toBe(first!.raw);
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
    // Return through the actual browser history to the earned Press, if retained.
    // A reconstructed Press or staged charter would not prove a human re-pull.
    const history: string[] = [];
    for (let step = 0; step < 6; step++) {
      if (!await page.goBack({ waitUntil: 'domcontentloaded' })) break;
      history.push(page.url());
      if (await page.getByTestId('e10-river-lever').isVisible().catch(() => false)) {
        await page.getByTestId('e10-river-lever').click();
        await page.waitForURL(url => url.searchParams.has('nowaves'));
        await page.getByTestId('contract-briefing-dismiss').click({ timeout: 60_000 });
        await pan(page);
        expect(await scores(page)).toBe(first!.raw);
        result.repull = { ok: true, detail: 'real earned Press retained by browser history; clicked and panned again' };
        break;
      }
    }
    result.history = history;
    if (!(result.repull as { ok: boolean }).ok) result.repull = { ok: false, detail: 'Browser history did not retain the earned Press; re-pull needs another earned Last Claim journey. No charter staged.' };
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
    expect((result.repull as { ok: boolean }).ok, 'native re-pull remains required').toBe(true);
  } finally {
    result.observations = observations; result.errors = errors;
    await writeFile(path.join(root, `ending-${info.project.name}.json`), JSON.stringify(result, null, 2) + '\n');
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
async function pan(page: Page) {
  for (let step = 0; step < 100; step++) {
    const d = await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__!;
      return { hero: d.heroPos, gold: d.economy.gold, paused: d.paused, nodes: d.harvest.activeNodes.filter(n => n.active) };
    });
    if (d.gold >= 5) return;
    if (d.paused) { await page.keyboard.press('KeyP'); continue; }
    const n = d.nodes.filter(n => Math.sign(n.position.z) === Math.sign(d.hero.z)).sort((a, b) => Math.hypot(a.position.x-d.hero.x, a.position.z-d.hero.z)-Math.hypot(b.position.x-d.hero.x,b.position.z-d.hero.z))[0];
    if (!n) throw new Error('no seam on this bank');
    const gap = Math.hypot(n.position.x-d.hero.x,n.position.z-d.hero.z);
    if (gap <= 1.1) await page.waitForTimeout(100);
    else await steer(page,n.position.x-d.hero.x,n.position.z-d.hero.z,Math.min(160,Math.max(16,gap*18)));
  }
  throw new Error('no gold landed');
}
