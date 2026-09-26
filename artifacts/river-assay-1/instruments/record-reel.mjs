#!/usr/bin/env node
// river-assay-1 evidence instrument (not a gate, not an engine input): records a fresh browser reel on the checkout it
// runs in, with the hero walking DIAGONALLY (two keys held, the case F-RVA1-1 is about), and writes the reel the game
// kept, plus what the live run saw. Nothing leaves the machine: every agenttown.app request is answered here.
//   river: the finale lever's staging (THE RIVER pressed onto its lineage root, ?nowaves, no ?debug), a walk to the
//          nearest live seam on the hero's bank, and the first pan; the reel is the one the pan kept in the ring.
//   claim: a plain ?debug run of the-claim on its live seed (no pin), a diagonal walk out and back, then the dev
//          bridge's endRunForTest; the reel is the one the run's end kept (a death reel: it can be replayed and
//          hashed, not verified, because the county assays secured standings only).
// Usage (from the checkout root): node record-reel.mjs <river|claim> <desktop|mobile> <out.json>   (port GR_DIAG_PORT)
// GR_RVA1_PAUSE=1 adds one pause and one resume (KeyP twice) at the start of the run (F-RVA1-6 evidence).
import { writeFile } from 'node:fs/promises';
import { chromium, devices } from 'playwright';
import { createServer } from 'vite';

const [kind, project, outPath] = process.argv.slice(2);
if (!['river', 'claim'].includes(kind) || !['desktop', 'mobile'].includes(project) || !outPath) throw new Error('usage: record-reel.mjs <river|claim> <desktop|mobile> <out.json>');
const port = Number(process.env.GR_DIAG_PORT ?? 5854);
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
  [storage.TOWN_NAME_KEY, 'Quartz Hill'], [families.ACTIVE_EPOCH_KEY, kind === 'river' ? 'epoch-10-deepsky' : 'epoch-1-frontier'],
  [storage.FIRST_CLAIM_DONE_KEY, '1'], [storage.TOWN_WELCOME_SEEN_KEY, '1'], [story.STORY_TALES_STORAGE_KEY, '0'],
  ...families.listEpochs().map((epoch) => [research.researchStateKey(epoch.id), researchState]),
];
const profile = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
const entries = [[storage.PROFILE_KEY, JSON.stringify(profile)], [telemetry.TELEMETRY_DEV_SEND_STORAGE_KEY, '1'],
  ...logical.flatMap(([key, value]) => [[key, value], [storage.profileDataKey('robin', key), value]])];
const session = kind === 'river'
  ? [['gr.contract.launch.v1', templateId], [families.CHARTER_LAUNCH_KEY, JSON.stringify({ templateId, document: stamped.document })]]
  : [];
const tapesKey = storage.profileDataKey('robin', tapes.RUN_TAPES_KEY);
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const context = await browser.newContext(project === 'mobile' ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } });
const result = { kind, project, errors: [], held: [] };
try {
  await context.route('https://agenttown.app/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  const page = await context.newPage();
  page.on('console', (message) => { if (message.type() === 'error') result.errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => result.errors.push(`page: ${error.message}`));
  await page.addInitScript(({ entries, session }) => {
    if (sessionStorage.getItem('rva1.seeded')) return;
    localStorage.clear();
    for (const [key, value] of entries) localStorage.setItem(key, value);
    sessionStorage.clear();
    for (const [key, value] of session) sessionStorage.setItem(key, value);
    sessionStorage.setItem('rva1.seeded', '1');
  }, { entries, session });
  result.url = kind === 'river' ? `/?contract=${templateId}&nowaves=` : '/?debug&contract=the-claim';
  await page.goto(`${base}${result.url}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 120_000 });
  await page.getByTestId('contract-briefing-dismiss').click();
  const view = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    return { sim: d.timeAlive, paused: d.paused, gold: d.economy.gold, hero: { x: d.heroPos.x, z: d.heroPos.z }, contract: d.contract.name,
      seams: d.harvest.activeNodes.filter((node) => node.active).map((node) => ({ id: node.id, x: node.position.x, z: node.position.z })) };
  });
  for (let attempt = 0; attempt < 3 && (await view()).paused; attempt += 1) { await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
  const hold = async (keys, ms) => {
    result.held.push({ keys, ms });
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    for (const key of keys) await page.keyboard.up(key);
  };
  result.start = await view();
  // GR_RVA1_PAUSE=1: the player pauses once and resumes (KeyP twice), as a human does; the reel records what it records.
  if (process.env.GR_RVA1_PAUSE === "1") {
    await hold(["KeyA"], 200);
    await page.keyboard.press("KeyP");
    await page.waitForTimeout(600);
    result.pausedMid = await view();
    await page.keyboard.press("KeyP");
    await page.waitForTimeout(300);
    result.resumed = await view();
  }
  if (kind === 'river') {
    const start = result.start;
    const bank = Math.sign(start.hero.z);
    const seam = [...start.seams].sort((a, b) => Number(Math.sign(a.z) !== bank) - Number(Math.sign(b.z) !== bank)
      || Math.hypot(a.x - start.hero.x, a.z - start.hero.z) - Math.hypot(b.x - start.hero.x, b.z - start.hero.z))[0];
    result.seam = seam;
    const walkTo = async (x, z, tolerance) => {
      for (let step = 0; step < 90; step += 1) {
        const now = await view();
        const gap = Math.hypot(x - now.hero.x, z - now.hero.z);
        if (gap <= tolerance) return;
        const keys = [];
        if (Math.abs(x - now.hero.x) > 0.35) keys.push(x > now.hero.x ? 'KeyD' : 'KeyA');
        if (Math.abs(z - now.hero.z) > 0.35) keys.push(z > now.hero.z ? 'KeyS' : 'KeyW');
        await hold(keys, Math.min(160, Math.max(16, gap * 18)));
      }
      throw new Error(`the hero never reached (${x}, ${z})`);
    };
    // Over the centre ford when the seam lies across the water, as e2e/river-ending-score.spec.ts walks it.
    if (bank !== 0 && Math.sign(seam.z) !== bank) {
      await walkTo(0, bank * 7, 1.4);
      await walkTo(0, -bank * 7, 1.4);
    }
    await walkTo(seam.x, seam.z, 1.1);
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0) >= 5, undefined, { timeout: 30_000 });
    result.pan = await view();
    await page.waitForTimeout(300);
  } else {
    await hold(['KeyA', 'KeyW'], 1400);
    await hold(['KeyD', 'KeyS'], 900);
    await page.waitForTimeout(400);
    result.end = await view();
    await page.evaluate(() => window.__GR_TEST__.endRunForTest());
    await page.waitForFunction((key) => (JSON.parse(localStorage.getItem(key) ?? 'null')?.tapes?.length ?? 0) > 0, tapesKey, { timeout: 20_000 });
  }
  result.reel = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null')?.tapes?.[0] ?? null, tapesKey);
  result.diagonalEntries = (result.reel?.inputLog?.entries ?? []).filter((entry) => entry.mx !== 0 && entry.my !== 0).length;
} catch (error) {
  result.errors.push(`record: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  await writeFile(outPath, `${JSON.stringify(result.reel, null, 2)}\n`);
  await writeFile(outPath.replace(/\.json$/, '.run.json'), `${JSON.stringify({ ...result, reel: undefined }, null, 2)}\n`);
  await browser.close();
  await vite.close();
}
process.stdout.write(`${kind}/${project}: reel ${result.reel?.eventLogHash ?? 'NONE'} seed ${result.reel?.seed} ticks ${result.reel?.inputLog?.durationTicks} diagonal entries ${result.diagonalEntries} outcome ${JSON.stringify(result.reel?.outcome)} errors ${result.errors.length}\n`);
