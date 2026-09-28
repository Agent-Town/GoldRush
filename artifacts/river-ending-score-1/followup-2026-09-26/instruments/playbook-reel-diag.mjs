// F-RES1-7 diagnostic (scratch instrument, kept with the evidence): a playbook replay that is started and then stopped
// mid-run, then the run's reel is taken, and the reel's input-slot bookkeeping is dumped and judged piece by piece with
// the client's own validateRunTape. Mode `river`: the lever's River (?debug for the dev bridge), reel taken by the pan.
// Mode `claim`: a plain Claim run (?debug&nowaves&seed=...), reel taken at run end (endRunForTest).
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json');
const { chromium } = req('playwright');
const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const [baseURL, outPath, mode] = process.argv.slice(2);
const river = JSON.parse(readFileSync(new URL('./river-doc.json', import.meta.url), 'utf8'));
const log = { mode, startedAt: new Date().toISOString(), console: [], pageErrors: [], notes: [], requests: [] };
const location = new URL('http://gr-sim.local/'); globalThis.location = location; globalThis.window = { location };
const ssr = await createServer({ root: '/Users/robin/Claude/Projects/wt-rvs1', appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const { validateRunTape } = await ssr.ssrLoadModule('/src/game/RunTape.ts');
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.route('https://agenttown.app/**', async (route) => {
  log.requests.push(`${route.request().method()} ${new URL(route.request().url()).pathname}`);
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, stored: false }) });
});
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text()); });
page.on('pageerror', (e) => log.pageErrors.push(e.message));
const profile = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
const logical = [
  ['gr.scores.v2', JSON.stringify([{ kills: 40, gold: 120, timeAlive: 240, at: 1000, waves: 8, secured: true, contractId: 'e10-last-claim', profileName: 'Robin' }])],
  ['gr.meta.v1', JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } })],
  ['gr.town.name.v1', 'Quartz Hill'], ['gr.firstClaim.done.v1', '1'], ['gr.townWelcome.seen.v1', '1'], ['gr.story.tales.v1', '0'],
];
const entries = [['gr.profile.v2', JSON.stringify(profile)], ...logical.flatMap(([k, v]) => [[k, v], [`gr.profile.v2.robin.${k}`, v]])];
await page.addInitScript(({ entries, templateId, document, stage }) => {
  try { if (sessionStorage.getItem('probe.seeded')) return; } catch {}
  localStorage.clear(); for (const [k, v] of entries) localStorage.setItem(k, v);
  sessionStorage.clear();
  if (stage) {
    sessionStorage.setItem('gr.contract.launch.v1', templateId);
    sessionStorage.setItem('gr.charter.launch.v1', JSON.stringify({ templateId, document }));
  }
  sessionStorage.setItem('probe.seeded', '1');
}, { entries, templateId: river.templateId, document: river.document, stage: mode === 'river' });
const read = () => page.evaluate(() => {
  const d = window.__THREE_GAME_DIAGNOSTICS__;
  return { sim: d.timeAlive, gold: d.economy.gold, paused: d.paused, hero: { x: d.heroPos.x, z: d.heroPos.z }, name: d.contract.name,
    seams: d.harvest.activeNodes.filter((n) => n.active).map((n) => ({ x: n.position.x, z: n.position.z })) };
});
async function steer(dx, dz, ms) {
  const keys = [];
  if (Math.abs(dx) > 0.35) keys.push(dx > 0 ? 'KeyD' : 'KeyA');
  if (Math.abs(dz) > 0.35) keys.push(dz > 0 ? 'KeyS' : 'KeyW');
  if (!keys.length) return page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  for (const k of keys) await page.keyboard.up(k);
}
function judge(reel) {
  if (!reel) return null;
  const input = reel.inputLog;
  const withoutStreams = { ...reel, inputLog: { ...input, streams: [] } };
  const withoutUses = { ...reel, inputLog: { ...input, playbookUses: [] } };
  return {
    contract: reel.contract,
    primarySlot: input.primarySlot,
    streamSlots: input.streams.map((s) => s.slot),
    streamEntries: input.streams.map((s) => s.entries.length),
    streamSlotEqualsPrimary: input.streams.some((s) => s.slot === input.primarySlot),
    playbookUses: (input.playbookUses ?? []).map((u) => ({ atTick: u.atTick, contractId: u.playbook.contractId })),
    validateRunTape: validateRunTape(reel) === null ? 'null (refused)' : 'valid',
    validateRunTapeWithoutStreams: validateRunTape(withoutStreams) === null ? 'null (refused)' : 'valid',
    validateRunTapeWithoutPlaybookUses: validateRunTape(withoutUses) === null ? 'null (refused)' : 'valid',
  };
}
try {
  const url = mode === 'river' ? `${baseURL}/?contract=the-claim&nowaves=&debug` : `${baseURL}/?debug&contract=the-claim&nowaves&nolevel&seed=f-res1-7-claim`;
  await page.goto(url);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 90_000 });
  log.boot = await read();
  await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  for (let i = 0; i < 3 && (await read()).paused; i += 1) { await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
  log.recordStart = await page.evaluate(() => window.__GR_TEST__.playbook.startRecording());
  await steer(-1, 0, 400);
  await page.waitForTimeout(300);
  log.recordStop = await page.evaluate(() => { const r = window.__GR_TEST__.playbook.stopRecording('round'); return { ok: r.ok, saved: r.saved }; });
  log.replay = await page.evaluate(() => window.__GR_TEST__.playbook.startReplay({ name: 'round' }));
  await page.waitForTimeout(300);
  log.replayStop = await page.evaluate(() => window.__GR_TEST__.playbook.stopReplay());
  if (mode === 'river') {
    const start = await read();
    const bank = Math.sign(start.hero.z);
    const seam = [...start.seams].sort((a, b) => Number(Math.sign(a.z) !== bank) - Number(Math.sign(b.z) !== bank)
      || Math.hypot(a.x - start.hero.x, a.z - start.hero.z) - Math.hypot(b.x - start.hero.x, b.z - start.hero.z))[0];
    for (let i = 0; i < 90; i += 1) {
      const now = await read();
      const gap = Math.hypot(seam.x - now.hero.x, seam.z - now.hero.z);
      if (gap <= 1.1) break;
      await steer(seam.x - now.hero.x, seam.z - now.hero.z, Math.min(160, Math.max(16, gap * 18)));
    }
    const until = Date.now() + 15_000;
    while (Date.now() < until && (await read()).gold <= start.gold) await page.waitForTimeout(40);
    log.panned = await read();
  } else {
    await page.waitForTimeout(500);
    log.ended = await page.evaluate(() => window.__GR_TEST__.endRunForTest());
  }
  await page.waitForTimeout(1500);
  const raw = await page.evaluate(() => localStorage.getItem('gr.profile.v2.robin.gr.tapes.v1'));
  const reels = JSON.parse(raw ?? 'null')?.tapes ?? [];
  log.reelCount = reels.length;
  log.reel = judge(reels.at(-1) ?? null);
} catch (error) {
  log.notes.push(`error: ${error.message}`);
} finally {
  writeFileSync(outPath, `${JSON.stringify(log, null, 1)}\n`);
  await browser.close();
  await ssr.close();
}
