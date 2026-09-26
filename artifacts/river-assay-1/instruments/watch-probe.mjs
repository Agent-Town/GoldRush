#!/usr/bin/env node
// river-assay-1 evidence instrument (not a gate): the in-game watch path for a River reel (`src/main.ts`), end to end,
// in a plain page with no ?debug. It plays the lever's River and pans once (the reel is kept in the ring), then asks
// to watch that reel the way the shelf's WATCH does after its hand-off (the pending entry plus the reel link), from a
// link WITHOUT `nowaves`, and records: the redirect to the River's reel link (which carries `nowaves`), the world the
// replay boots (contract, seams), the Lantern Show's replayed hash against the reel's own, and, after "Back to shelf",
// the reloaded page (no `nowaves`, no staged launch). Nothing leaves the machine: every agenttown.app request is answered.
// Usage (from the checkout root): node watch-probe.mjs <out.json> [desktop|mobile]   (port GR_DIAG_PORT)
import { writeFile } from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { createServer } from 'vite';

const [outPath, project = 'desktop'] = process.argv.slice(2);
const port = Number(process.env.GR_DIAG_PORT ?? 5859);
const vite = await createServer({ root: process.cwd(), logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
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
const researchState = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
const logical = [
  [storage.SCOREBOARD_KEY, JSON.stringify([{ kills: 40, gold: 120, timeAlive: 240, at: 1000, waves: 8, secureWave: 8, deepestWave: 8, secured: true, contractId: 'e10-last-claim' }])],
  [meta.META_PROGRESS_KEY, JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } })],
  [storage.TOWN_NAME_KEY, 'Quartz Hill'], [families.ACTIVE_EPOCH_KEY, 'epoch-10-deepsky'], [storage.FIRST_CLAIM_DONE_KEY, '1'],
  [storage.TOWN_WELCOME_SEEN_KEY, '1'], [story.STORY_TALES_STORAGE_KEY, '0'],
  ...families.listEpochs().map((epoch) => [research.researchStateKey(epoch.id), researchState]),
];
const profile = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
const entries = [[storage.PROFILE_KEY, JSON.stringify(profile)], [telemetry.TELEMETRY_OPT_IN_STORAGE_KEY, '0'],
  ...logical.flatMap(([key, value]) => [[key, value], [storage.profileDataKey('robin', key), value]])];
const lever = [['gr.contract.launch.v1', templateId], [families.CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })]];
const tapesKey = storage.profileDataKey('robin', tapes.RUN_TAPES_KEY);
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const context = await browser.newContext(project === 'mobile' ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } });
const result = { project, errors: [], urls: [] };
try {
  await context.route('https://agenttown.app/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') result.errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => result.errors.push(`page: ${error.message}`));
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) result.urls.push(new URL(frame.url()).search); });
  await page.addInitScript(({ entries, session }) => {
    if (sessionStorage.getItem('rva1.seeded')) return;
    localStorage.clear();
    for (const [key, value] of entries) localStorage.setItem(key, value);
    sessionStorage.clear();
    for (const [key, value] of session) sessionStorage.setItem(key, value);
    sessionStorage.setItem('rva1.seeded', '1');
  }, { entries, session: lever });
  // 1. THE RUN: the lever's River, one pan (a straight walk south-west then west, keys held as a player holds them).
  await page.goto(`${base}/?contract=${templateId}&nowaves=`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 120_000 });
  await page.getByTestId('contract-briefing-dismiss').click();
  const view = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return { paused: d.paused, gold: d.economy.gold, hero: { x: d.heroPos.x, z: d.heroPos.z }, contract: d.contract.name,
      seams: d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ x: node.position.x, z: node.position.z })) };
  });
  for (let attempt = 0; attempt < 3 && (await view()).paused; attempt += 1) { await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
  result.liveSeams = (await view()).seams;
  const seam = [...result.liveSeams].sort((a, b) => Number(Math.sign(a.z) !== 1) - Number(Math.sign(b.z) !== 1) || Math.hypot(a.x, a.z - 12) - Math.hypot(b.x, b.z - 12))[0];
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
  result.reel = { id: reel.id, eventLogHash: reel.eventLogHash, outcome: reel.outcome, durationTicks: reel.inputLog.durationTicks };
  // 2. WATCH IT: the shelf's hand-off (the pending entry) and a reel link WITHOUT `nowaves`.
  await page.evaluate(({ tape }) => sessionStorage.setItem('gr.lantern.pending.v1', JSON.stringify({ tape, epochId: 'epoch-10-deepsky' })), { tape: reel });
  await page.goto(`${base}/?watch=${encodeURIComponent(reel.id)}&contract=e10-river&epoch=epoch-10-deepsky`);
  await page.waitForFunction(() => document.querySelector('[data-testid="lantern-show"]')?.getAttribute('data-playback') === 'complete', undefined, { timeout: 120_000 });
  result.replay = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      search: location.search,
      hash: document.querySelector('[data-testid="lantern-playback-status"]')?.getAttribute('data-hash') ?? null,
      contract: d ? { activeId: d.contract.activeId, name: d.contract.name } : null,
      seams: d ? d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ x: node.position.x, z: node.position.z, remaining: node.remaining })) : null,
      gold: d?.economy.gold ?? null,
      waves: d?.wave ?? null,
      staged: { launch: sessionStorage.getItem('gr.contract.launch.v1'), charter: sessionStorage.getItem('gr.charter.launch.v1') !== null },
    };
  });
  result.sameHash = result.replay.hash === reel.eventLogHash;
  // 3. CLOSE IT: "Back to shelf" clears the staged launch, drops `nowaves` and reloads.
  await page.getByTestId('lantern-close').click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(2500);
  result.afterClose = await page.evaluate(() => ({
    search: location.search,
    scene: history.state?.goldRushScene ?? null,
    staged: { launch: sessionStorage.getItem('gr.contract.launch.v1'), charter: sessionStorage.getItem('gr.charter.launch.v1') !== null },
  }));
} catch (error) {
  result.errors.push(`probe: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
  await vite.close();
}
process.stdout.write(`${project}: reel ${result.reel?.eventLogHash} replayed ${result.replay?.hash} sameHash ${result.sameHash} world ${JSON.stringify(result.replay?.contract)} urls ${JSON.stringify(result.urls)} afterClose ${JSON.stringify(result.afterClose)} errors ${result.errors.length}\n`);
