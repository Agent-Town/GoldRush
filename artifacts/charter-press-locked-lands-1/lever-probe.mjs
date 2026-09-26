#!/usr/bin/env node
// charter-press-locked-lands-1 (F-1179-4, owner ruling (a) 2026-09-26): WHAT THE LEVER OFFERS, measured in a real
// browser against a running dev server, and what pressing it opens. The same probe runs against the base commit
// (label `before`) and the branch (label `after`), so the two arms differ only in the tree the server serves.
//
// Usage: node artifacts/charter-press-locked-lands-1/lever-probe.mjs <baseURL> <label>
// Writes artifacts/charter-press-locked-lands-1/<label>/probe.json and one PNG per project x save (the Lever face)
// plus one per project for each press-through that the before/after comparison turns on.
//
// Saves: `fresh` (virgin storage), `secured-claim` (the rig's fixture: one secured Claim row, 10 waves, seeded
// once per tab exactly as `e2e/charter-press.rig.ts` seeds it) and `preview` (a fresh save with the preview-only
// "Open every claim" seam flipped by its own function after boot). Projects mirror `playwright.config.ts`.
// Also two plain boots per project with their console/page errors: the town (`/` with the default profile seeded
// the way e2e/044-start-screen.spec.ts does, then the start menu's door into town) and the press (`/?editor`, then
// the Lever opened).
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const [baseURL, label] = process.argv.slice(2);
if (!baseURL || !label) {
  process.stderr.write('usage: lever-probe.mjs <baseURL> <label>\n');
  process.exit(2);
}
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, label);
const LEVER_BOOT = '/?editor&debug&contract=the-claim&nowaves&nolevel&nokill&nopause&seed=cpl1-probe';
const PROJECTS = {
  'desktop-chrome': { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
  'mobile-chrome': { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
};
const SEEDED_KEY = 'gr.charter-press-rig.secured-claim.v1';
// The inspector's sticky header, validator and transfer sections overlap the Lever face in an element shot; these
// are the rules e2e/cp04-lever.spec.ts:92-102 (:81-91 on main) applies before its own Lever screenshots. The shot page only.
const CLEAN_SHOT_CSS = `
  .descriptor-inspector { position: absolute !important; inset: 16px 16px auto auto !important; overflow: visible !important; }
  .descriptor-inspector__fields { overflow: visible !important; }
  .descriptor-inspector__header, .contract-validator, .terrain-brush, .placement-editor,
  .descriptor-inspector__section, .descriptor-inspector__transfer, .lil-gui { display: none !important; }
`;
// The press-through each save is asked for: the decisive one is Twin Banks on a fresh save (F-1179-4's symptom).
const PRESS = { fresh: 'e1-twin-banks', 'secured-claim': 'e1-twin-banks', preview: 'e1-baron' };

function seedSecuredClaim({ seededKey }) {
  if (sessionStorage.getItem(seededKey)) return;
  localStorage.setItem('gr.profile.v2', JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  localStorage.setItem('gr.profile.v2.robin.gr.scores.v2', JSON.stringify([
    { waves: 10, kills: 0, gold: 0, timeAlive: 300, at: 1, secured: true, secureWave: 10, contractId: 'the-claim', profileName: 'Robin' },
  ]));
  sessionStorage.setItem(seededKey, '1');
}

function watch(page) {
  const errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text().slice(0, 300)));
  page.on('pageerror', (error) => errors.page.push(String(error.message).slice(0, 300)));
  return errors;
}

async function storageKeys(page) {
  return page.evaluate(() => Object.keys(localStorage).sort());
}

async function leverCards(page) {
  return page.locator('[data-lever-land]').evaluateAll((cards) => cards.map((card) => ({
    id: card.dataset.leverLand,
    pressed: card.getAttribute('aria-pressed') === 'true',
    label: card.querySelector('span')?.textContent ?? '',
    imageLoaded: (card.querySelector('img')?.naturalWidth ?? 0) > 0,
  })));
}

async function probeSave(browser, project, save) {
  const context = await browser.newContext({ ...PROJECTS[project], baseURL });
  const page = await context.newPage();
  const errors = watch(page);
  const plateRequests = [];
  page.on('request', (request) => /plate-contract-/.test(request.url()) && plateRequests.push(request.url().replace(/^.*\/(plate-contract-[a-z-]+)\.png.*$/, '$1')));
  if (save === 'secured-claim') await page.addInitScript(seedSecuredClaim, { seededKey: SEEDED_KEY });
  const row = { project, save };
  try {
    await page.goto(LEVER_BOOT);
    await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60_000 });
    await page.getByTestId('press-full-mode').waitFor({ state: 'visible', timeout: 30_000 });
    row.cardsInDomBeforeOpening = await page.locator('[data-lever-land]').count();
    if (save === 'preview') {
      row.previewSeam = await page.evaluate(async () => (await Function('return import("/src/meta/ContractUnlock.ts")')()).setPreviewUnlockAll(true));
    }
    const keysBefore = await storageKeys(page);
    row.plateRequestsBeforeOpening = [...plateRequests];
    await page.getByTestId('press-mode-lever').click();
    await page.getByTestId('press-lever-mode').waitFor({ state: 'visible' });
    row.offered = await leverCards(page);
    const keysAfter = await storageKeys(page);
    row.storageKeysWrittenByOpeningTheLever = keysAfter.filter((key) => !keysBefore.includes(key));
    row.plateRequestsAfterOpening = plateRequests.slice(row.plateRequestsBeforeOpening.length);
    const viewport = page.viewportSize();
    const style = await page.addStyleTag({ content: CLEAN_SHOT_CSS });
    await page.setViewportSize({ width: viewport.width, height: 1400 });
    await page.getByTestId('press-lever-mode').screenshot({ path: path.join(OUT, `${project}-${save}-lever.png`) });
    await style.evaluate((node) => node.remove());
    await page.setViewportSize(viewport);

    const target = PRESS[save];
    const offeredIds = row.offered.map((card) => card.id);
    row.pressAsked = target;
    row.pressed = offeredIds.includes(target) ? target : offeredIds.find((id, index) => row.offered[index].pressed) ?? null;
    if (row.pressed !== offeredIds.find((id, index) => row.offered[index].pressed)) await page.getByTestId(`lever-land-${row.pressed}`).click();
    await page.getByTestId('lever-press').click();
    row.leverStatus = await page.getByTestId('lever-status').textContent({ timeout: 2_000 }).catch(() => '(navigated before it could be read)');
    await page.waitForURL((url) => !url.searchParams.has('editor'), { timeout: 60_000 });
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60_000 });
    await page.getByTestId('contract-briefing-name').waitFor({ state: 'visible', timeout: 30_000 });
    const url = new URL(page.url());
    row.opened = {
      urlContract: url.searchParams.get('contract'),
      activeId: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId ?? null),
      fallbackReason: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason ?? null),
      stagedLaunchClear: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.stagedLaunchClear ?? null),
      briefingName: (await page.getByTestId('contract-briefing-name').textContent())?.trim() ?? null,
    };
    await page.getByTestId('contract-briefing').screenshot({ path: path.join(OUT, `${project}-${save}-press-${row.pressed}-briefing.png`) });
  } catch (error) {
    row.probeError = String(error instanceof Error ? error.message : error).split('\n')[0].slice(0, 300);
  }
  row.errors = errors;
  await context.close();
  return row;
}

async function plainBoot(browser, project, kind) {
  const context = await browser.newContext({ ...PROJECTS[project], baseURL });
  const page = await context.newPage();
  const errors = watch(page);
  const row = { project, kind };
  try {
    if (kind === 'town') {
      await page.addInitScript(() => {
        if (sessionStorage.getItem('cpl1-probe-town')) return;
        localStorage.setItem('gr.profile.v2', JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }));
        sessionStorage.setItem('cpl1-probe-town', '1');
      });
      await page.goto('/');
      await page.getByTestId('start-menu-wordmark').waitFor({ state: 'visible', timeout: 60_000 });
      await page.getByTestId('start-menu-enter-town').click();
      await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60_000 });
      row.reached = 'town frame > 10';
    } else {
      await page.goto('/?editor');
      await page.getByTestId('charter-press-panel').waitFor({ state: 'visible', timeout: 60_000 });
      await page.getByTestId('press-mode-lever').click();
      await page.getByTestId('press-lever-mode').waitFor({ state: 'visible' });
      row.offered = (await leverCards(page)).map((card) => card.id);
      row.reached = 'press panel, Lever open';
    }
    await page.waitForTimeout(3_000);
  } catch (error) {
    row.probeError = String(error instanceof Error ? error.message : error).split('\n')[0].slice(0, 300);
  }
  row.errors = errors;
  await context.close();
  return row;
}

await mkdir(OUT, { recursive: true });
const startedAt = new Date().toISOString();
const browser = await chromium.launch({ channel: 'chromium' });
const saves = [];
const boots = [];
for (const project of Object.keys(PROJECTS)) {
  for (const save of ['fresh', 'secured-claim', 'preview']) saves.push(await probeSave(browser, project, save));
  for (const kind of ['town', 'press']) boots.push(await plainBoot(browser, project, kind));
}
await browser.close();
let head = 'unknown';
try {
  head = execFileSync('git', ['-C', process.cwd(), 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {}
const result = { label, baseURL, cwd: process.cwd(), head, startedAt, finishedAt: new Date().toISOString(), loadavg: os.loadavg(), saves, boots };
await writeFile(path.join(OUT, 'probe.json'), `${JSON.stringify(result, null, 2)}\n`);
for (const row of saves) {
  process.stdout.write(`${label} ${row.project} ${row.save}: offered [${(row.offered ?? []).map((card) => `${card.id}${card.pressed ? '*' : ''}`).join(', ')}] pressed ${row.pressed} -> contract=${row.opened?.urlContract} briefing "${row.opened?.briefingName}" clear=${JSON.stringify(row.opened?.stagedLaunchClear ?? null)} errors ${row.errors.console.length}/${row.errors.page.length}${row.probeError ? ` PROBE-ERROR ${row.probeError}` : ''}\n`);
}
for (const row of boots) {
  process.stdout.write(`${label} ${row.project} plain ${row.kind}: ${row.reached ?? 'NOT REACHED'} errors ${row.errors.console.length}/${row.errors.page.length}${row.offered ? ` offered [${row.offered.join(', ')}]` : ''}${row.probeError ? ` PROBE-ERROR ${row.probeError}` : ''}\n`);
}
