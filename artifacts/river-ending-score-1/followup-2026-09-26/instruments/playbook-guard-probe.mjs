// F-RES1-4 probe (scratch instrument, kept with the evidence). It needs ?debug: no plain boot reaches a playbook replay
// on the River, because the Tape Reel surface mounts only when the run's epoch is E7 or later (Game.ts, the
// `activeEpoch.order >= 7` gate) and a ?contract= run takes its contract's epoch (the-claim: E1). So this drives the
// replay through the dev bridge (`__GR_TEST__.playbook`), on the River the lever stages, and reads the kept reel.
// Every request to the county's origin is answered locally.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json');
const { chromium, devices } = req('playwright');
const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const [baseURL, outPath, project, label] = process.argv.slice(2);
const river = JSON.parse(readFileSync(new URL('./river-doc.json', import.meta.url), 'utf8'));
const log = { label, project, startedAt: new Date().toISOString(), requests: [], console: [], pageErrors: [], notes: [] };
const location = new URL('http://gr-sim.local/'); globalThis.location = location; globalThis.window = { location };
const ssr = await createServer({ root: '/Users/robin/Claude/Projects/wt-rvs1', appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const { validateRunTape } = await ssr.ssrLoadModule('/src/game/RunTape.ts');
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const context = await browser.newContext(project === 'mobile' ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } });
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
const entries = [['gr.profile.v2', JSON.stringify(profile)], ['gr.telemetry.devSend.v1', '1'], ...logical.flatMap(([k, v]) => [[k, v], [`gr.profile.v2.robin.${k}`, v]])];
await page.addInitScript(({ entries, templateId, document }) => {
  try { if (sessionStorage.getItem('probe.seeded')) return; } catch {}
  localStorage.clear(); for (const [k, v] of entries) localStorage.setItem(k, v);
  sessionStorage.clear();
  sessionStorage.setItem('gr.contract.launch.v1', templateId);
  sessionStorage.setItem('gr.charter.launch.v1', JSON.stringify({ templateId, document }));
  sessionStorage.setItem('probe.seeded', '1');
}, { entries, templateId: river.templateId, document: river.document });
const read = () => page.evaluate(() => {
  const d = window.__THREE_GAME_DIAGNOSTICS__;
  return { sim: d.timeAlive, gold: d.economy.gold, paused: d.paused, hero: { x: d.heroPos.x, z: d.heroPos.z }, contract: d.contract.activeId, name: d.contract.name,
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
try {
  await page.goto(`${baseURL}/?contract=the-claim&nowaves=&debug`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 90_000 });
  log.boot = await read();
  await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  for (let i = 0; i < 3 && (await read()).paused; i += 1) { await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
  log.recordStart = await page.evaluate(() => window.__GR_TEST__.playbook.startRecording());
  await steer(-1, 0, 400);
  await page.waitForTimeout(300);
  log.recordStop = await page.evaluate(() => window.__GR_TEST__.playbook.stopRecording('river-round'));
  const riverText = await page.evaluate(() => window.__GR_TEST__.playbook.getText('river-round'));
  const riverPlaybook = riverText ? JSON.parse(riverText) : null;
  log.riverPlaybook = riverPlaybook && { contractId: riverPlaybook.contractId, seed: riverPlaybook.seed, durationTicks: riverPlaybook.durationTicks, entries: riverPlaybook.entries.length };
  if (!riverPlaybook) throw new Error('the River playbook was not saved');
  const claimText = JSON.stringify({ ...riverPlaybook, name: 'claim-round', contractId: 'the-claim' });
  await page.evaluate((text) => {
    const shelf = JSON.parse(localStorage.getItem('gr.playbooks.v1') ?? '{"version":1,"playbooks":{}}');
    shelf.playbooks['claim-round'] = text;
    localStorage.setItem('gr.playbooks.v1', JSON.stringify(shelf));
  }, claimText);
  log.claimReplay = await page.evaluate(() => window.__GR_TEST__.playbook.startReplay({ name: 'claim-round' }));
  if (log.claimReplay?.ok) log.claimStop = await page.evaluate(() => window.__GR_TEST__.playbook.stopReplay());
  log.riverReplay = await page.evaluate(() => window.__GR_TEST__.playbook.startReplay({ name: 'river-round' }));
  await page.waitForTimeout(300);
  if (log.riverReplay?.ok) log.riverStop = await page.evaluate(() => window.__GR_TEST__.playbook.stopReplay());
  // The pan: walk to the nearest live seam on the hero's bank and hold until the first gold lands.
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
  await page.waitForTimeout(1500);
  const raw = await page.evaluate(() => ({ scores: localStorage.getItem('gr.profile.v2.robin.gr.scores.v2'), tapes: localStorage.getItem('gr.profile.v2.robin.gr.tapes.v1') }));
  const reels = JSON.parse(raw.tapes ?? 'null')?.tapes ?? [];
  const reel = reels.at(-1) ?? null;
  log.riverScores = JSON.parse(raw.scores ?? '[]').filter((s) => s.contractId === 'e10-river').length;
  log.reel = reel && {
    contract: reel.contract,
    playbookUses: (reel.inputLog.playbookUses ?? []).map((use) => ({ atTick: use.atTick, name: use.playbook.name, contractId: use.playbook.contractId })),
    validateRunTape: validateRunTape(reel) === null ? 'null (refused)' : 'valid',
  };
} catch (error) {
  log.notes.push(`error: ${error.message}`);
} finally {
  writeFileSync(outPath, `${JSON.stringify(log, null, 1)}\n`);
  await browser.close();
  await ssr.close();
}
