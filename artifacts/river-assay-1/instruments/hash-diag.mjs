#!/usr/bin/env node
// river-assay-1 diagnostic (evidence only; runs in a THROWAWAY worktree whose Game.ts carries three `[rva1-diag]`
// console lines, never committed): plays the River the way the lever stages it and pans once, keeps the reel the pan
// wrote, then replays that reel through the assay's own boot, and records the event log each side hashed, so the
// two can be compared field by field. Nothing leaves the machine: every agenttown.app request is answered here.
// Usage (from the throwaway checkout's root): node hash-diag.mjs <out.json> [desktop|mobile]   (port GR_DIAG_PORT)
import { writeFile } from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { createServer } from 'vite';

const [outPath, project = 'desktop'] = process.argv.slice(2);
const port = Number(process.env.GR_DIAG_PORT ?? 5853);
const root = process.cwd();
const vite = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await vite.listen();
const base = `http://127.0.0.1:${port}`;
const load = (id) => vite.ssrLoadModule(id);
const [{ getPostCreditsCharter }, { stampCharter }, { charterLineageRootId }, families, storage, meta, tapes, research, story, telemetry] = await Promise.all([
  load('/src/charter/TheRiver.ts'), load('/src/charter/CharterStamp.ts'), load('/src/charter/CharterSchema.ts'),
  load('/src/meta/ContractFamilies.ts'), load('/src/game/ProfileStorage.ts'), load('/src/game/MetaProgress.ts'),
  load('/src/game/RunTape.ts'), load('/src/meta/ResearchTree.ts'), load('/src/story/settings.ts'), load('/src/telemetry/payload.ts'),
]);
const charter = getPostCreditsCharter();
const stamped = stampCharter(charter);
const templateId = charterLineageRootId(charter);
const leverSession = [['gr.contract.launch.v1', templateId], [families.CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })]];
const researchState = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
const logical = [
  [storage.SCOREBOARD_KEY, JSON.stringify([{ kills: 40, gold: 120, timeAlive: 240, at: 1000, waves: 8, secureWave: 8, deepestWave: 8, secured: true, contractId: 'e10-last-claim' }])],
  [meta.META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } })],
  [storage.TOWN_NAME_KEY, 'Quartz Hill'], [families.ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'], [storage.FIRST_CLAIM_DONE_KEY, '1'],
  [storage.TOWN_WELCOME_SEEN_KEY, '1'], [story.STORY_TALES_STORAGE_KEY, '0'],
  ...families.listEpochs().map((epoch) => [research.researchStateKey(epoch.id), researchState]),
];
const profile = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
const entries = [[storage.PROFILE_KEY, JSON.stringify(profile)], [telemetry.TELEMETRY_DEV_SEND_STORAGE_KEY, '1'],
  ...logical.flatMap(([key, value]) => [[key, value], [storage.profileDataKey('robin', key), value]])];
const tapesKey = storage.profileDataKey('robin', tapes.RUN_TAPES_KEY);

const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const contextOptions = project === 'mobile' ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } };
const result = { project, errors: [], live: {}, replay: {} };
const diagLines = (page, sink) => page.on('console', (message) => {
  const text = message.text();
  if (text.startsWith('[rva1-diag] ')) {
    const at = text.indexOf(' ', 12);
    sink[text.slice(12, at)] = JSON.parse(text.slice(at + 1));
  } else if (message.type() === 'error') result.errors.push(`console: ${text}`);
});
try {
  // THE LIVE RUN, staged as the lever stages it; the hero walks to the nearest seam on its own bank and holds.
  const live = await browser.newContext(contextOptions);
  await live.route('https://agenttown.app/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const page = await live.newPage();
  diagLines(page, result.live);
  page.on('pageerror', (error) => result.errors.push(`page: ${error.message}`));
  await page.addInitScript(({ entries, session }) => {
    if (sessionStorage.getItem('rva1.seeded')) return;
    localStorage.clear();
    for (const [key, value] of entries) localStorage.setItem(key, value);
    sessionStorage.clear();
    for (const [key, value] of session) sessionStorage.setItem(key, value);
    sessionStorage.setItem('rva1.seeded', '1');
  }, { entries, session: leverSession });
  await page.goto(`${base}/?contract=${templateId}&nowaves=`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 120_000 });
  await page.getByTestId('contract-briefing-dismiss').click();
  const view = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return { sim: d.timeAlive, paused: d.paused, gold: d.economy.gold, hero: { x: d.heroPos.x, z: d.heroPos.z },
      seams: d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ id: node.id, x: node.position.x, z: node.position.z })) };
  });
  for (let attempt = 0; attempt < 3 && (await view()).paused; attempt += 1) { await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
  const start = await view();
  result.live.seams = start.seams;
  const bank = Math.sign(start.hero.z);
  const seam = [...start.seams].sort((a, b) => Number(Math.sign(a.z) !== bank) - Number(Math.sign(b.z) !== bank)
    || Math.hypot(a.x - start.hero.x, a.z - start.hero.z) - Math.hypot(b.x - start.hero.x, b.z - start.hero.z))[0];
  for (let step = 0; step < 90; step += 1) {
    const now = await view();
    const gap = Math.hypot(seam.x - now.hero.x, seam.z - now.hero.z);
    if (gap <= 1.1) break;
    const keys = [];
    if (Math.abs(seam.x - now.hero.x) > 0.35) keys.push(seam.x > now.hero.x ? 'KeyD' : 'KeyA');
    if (Math.abs(seam.z - now.hero.z) > 0.35) keys.push(seam.z > now.hero.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(160, Math.max(16, gap * 18)));
    for (const key of keys) await page.keyboard.up(key);
  }
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0) >= 5, undefined, { timeout: 30_000 });
  await page.waitForTimeout(300);
  const reel = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.tapes?.[0] ?? null, tapesKey);
  result.reel = reel;
  await live.close();

  // THE REPLAY, through the assay's own boot (the instrument's River staging, one synchronous manual advance).
  const replayContext = await browser.newContext(contextOptions);
  const replay = await replayContext.newPage();
  diagLines(replay, result.replay);
  replay.on('pageerror', (error) => result.errors.push(`replay page: ${error.message}`));
  await replay.addInitScript(({ tape, session }) => {
    sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(tape));
    for (const [key, value] of session) sessionStorage.setItem(key, value);
  }, { tape: reel, session: leverSession });
  await replay.goto(`${base}/?${new URLSearchParams({ debug: '', assayReplay: '', replay: reel.id, contract: templateId, difficulty: reel.difficulty, nowaves: '' })}`);
  await replay.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: 120_000 });
  await replay.evaluate((seconds) => { window.__GR_TEST__.setManualSim(true); window.__GR_TEST__.advanceSim(seconds); }, reel.inputLog.durationTicks * reel.inputLog.stepSeconds);
  await replay.waitForFunction(() => document.querySelector('[data-testid="lantern-show"]')?.getAttribute('data-playback') === 'complete', undefined, { timeout: 120_000 });
  result.replay.statusHash = await replay.evaluate(() => document.querySelector('[data-testid="lantern-playback-status"]')?.getAttribute('data-hash'));
  await replayContext.close();
} catch (error) {
  result.errors.push(`diag: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(result, null, 1)}\n`);
  await browser.close();
  await vite.close();
}
const l = result.live['live-at-pan']?.log;
const r = result.replay['replay-end']?.log;
const p = result.replay['replay-at-pan']?.log;
process.stdout.write(`reel ${result.reel?.eventLogHash} replay ${result.replay.statusHash}\n`);
if (l && r) for (const key of new Set([...Object.keys(l), ...Object.keys(r)])) {
  process.stdout.write(`  ${key}: live==replayEnd ${JSON.stringify(l[key]) === JSON.stringify(r[key])}; live==replayAtPan ${JSON.stringify(l[key]) === JSON.stringify(p?.[key])}\n`);
}
