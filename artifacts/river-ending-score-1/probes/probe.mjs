// Exploration probe (scratch, not committed): boots the River the way the lever stages it, pans, and
// measures the swing / first gold / writes. Never reaches agenttown.app: every request there is fulfilled locally.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
const req = createRequire('/Users/robin/Claude/Projects/wt-rvs1/package.json');
const { chromium, devices } = req('playwright');
const [baseURL, outPath, project, scenario] = process.argv.slice(2);
const river = JSON.parse(readFileSync(new URL('./river-doc.json', import.meta.url), 'utf8'));
const log = { project, scenario, startedAt: new Date().toISOString(), samples: [], events: [], requests: [], console: [], pageErrors: [], notes: [] };
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const ctxOptions = project === 'mobile' ? { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } } : { viewport: { width: 1280, height: 800 } };
const context = await browser.newContext(ctxOptions);
await context.route('https://agenttown.app/**', async (route) => {
  const request = route.request();
  log.requests.push({ url: request.url(), method: request.method(), body: request.postData()?.slice(0, 20000) ?? null });
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, stored: false }) });
});
const page = await context.newPage();
page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text()); });
page.on('pageerror', (e) => log.pageErrors.push(e.message));
const profile = { version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] };
const scores = [{ kills: 40, gold: 120, timeAlive: 240, at: 1000, waves: 8, secured: true, contractId: 'e10-last-claim', profileName: 'Robin' }];
const logical = [
  ['gr.scores.v2', JSON.stringify(scores)],
  ['gr.meta.v1', JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } })],
  ['gr.town.name.v1', 'Quartz Hill'], ['gr.firstClaim.done.v1', '1'], ['gr.townWelcome.seen.v1', '1'], ['gr.story.tales.v1', '0'],
  ...(process.env.PROBE_SEED_E10 === '1' ? [['gr.activeEpoch.v1', 'epoch-10-deepsky'], ...['epoch-1-frontier','epoch-2-steamworks','epoch-3-voltage','epoch-4-motor','epoch-5-deepwater','epoch-6-atomic','epoch-7-signal','epoch-8-orbital','epoch-9-redfields','epoch-10-deepsky'].map((id) => [`gr.research.${id}.v1`, JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 })])] : []),
];
const entries = [['gr.profile.v2', JSON.stringify(profile)], ['gr.telemetry.devSend.v1', '1'], ...logical.flatMap(([k, v]) => [[k, v], [`gr.profile.v2.robin.${k}`, v]])];
const session = scenario === 'lever-river'
  ? [['gr.contract.launch.v1', river.templateId], ['gr.charter.launch.v1', JSON.stringify({ templateId: river.templateId, document: river.document })]]
  : scenario === 'raw-river' ? [['gr.contract.launch.v1', 'e10-river']] : [];
await page.addInitScript(({ entries, session }) => {
  try { if (sessionStorage.getItem('probe.seeded')) return; } catch {}
  try { localStorage.clear(); for (const [k, v] of entries) localStorage.setItem(k, v); } catch {}
  try { sessionStorage.clear(); for (const [k, v] of session) sessionStorage.setItem(k, v); sessionStorage.setItem('probe.seeded', '1'); } catch {}
}, { entries, session });
const url = scenario === 'lever-river' ? '/?contract=the-claim&nowaves=' : '/?contract=e10-river';
const raw = () => page.evaluate(() => ({
  scores: localStorage.getItem('gr.profile.v2.robin.gr.scores.v2'),
  tapes: localStorage.getItem('gr.profile.v2.robin.gr.tapes.v1'),
  history: localStorage.getItem('gr.profile.v2.robin.gr.history.v1'),
  keys: Object.keys(localStorage).sort(),
}));
const read = () => page.evaluate(() => {
  const d = window.__THREE_GAME_DIAGNOSTICS__;
  if (!d) return null;
  return {
    frame: d.frame, sim: d.timeAlive, wave: d.wave, paused: d.paused, runState: d.runState, gold: d.economy?.gold ?? 0,
    hero: { x: d.heroPos?.x ?? 0, z: d.heroPos?.z ?? 0 }, enemies: d.enemiesAlive,
    channeling: d.harvest?.channeling === true, channels: d.harvest?.channels ?? [],
    nodes: (d.harvest?.activeNodes ?? []).filter((n) => n.active).map((n) => ({ id: n.id, x: n.position.x, z: n.position.z, remaining: n.remaining })),
    contract: { activeId: d.contract?.activeId, fallbackReason: d.contract?.fallbackReason, name: d.contract?.name },
    secured: d.run?.secured === true,
  };
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
async function walkTo(x, z, tol, steps = 80) {
  for (let i = 0; i < steps; i += 1) {
    const now = await read();
    if (!now) return false;
    const dx = x - now.hero.x, dz = z - now.hero.z, gap = Math.hypot(dx, dz);
    if (gap <= tol) return true;
    await steer(dx, dz, Math.min(160, Math.max(16, gap * 18)));
  }
  return false;
}
try {
  const t0 = Date.now();
  await page.goto(`${baseURL}${url}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: 90_000 }).catch((e) => log.notes.push(`boot wait: ${e.message.split('\n')[0]}`));
  log.bootMs = Date.now() - t0;
  log.url = page.url();
  log.atBoot = await read();
  log.rawAtBoot = await raw();
  const briefing = await page.getByTestId('contract-briefing-name').textContent({ timeout: 5000 }).catch(() => null);
  log.briefing = briefing;
  if (scenario === 'idle' || scenario === 'raw-river' || process.env.PROBE_IDLE === '1') {
    await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 }).catch(() => log.notes.push('no briefing dismiss'));
    for (let i = 0; i < 3; i += 1) { const now = await read(); if (!now?.paused) break; await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
    const idleUntil = Date.now() + Number(process.env.PROBE_IDLE_MS ?? 12000);
    while (Date.now() < idleUntil) { const s = await read(); if (s) log.samples.push({ sim: +s.sim.toFixed(1), wave: s.wave, enemies: s.enemies, gold: s.gold }); await page.waitForTimeout(5000); }
    log.afterIdle = await read();
    log.rawAfterIdle = await raw();
  } else {
    await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
    for (let i = 0; i < 3; i += 1) { const now = await read(); if (!now?.paused) break; await page.keyboard.press('KeyP'); await page.waitForTimeout(250); }
    const start = await read();
    log.start = start;
    const bank = Math.sign(start.hero.z);
    const pool = start.nodes.filter((n) => bank === 0 || Math.sign(n.z) === bank);
    const target = (pool.length ? pool : start.nodes).sort((a, b) => Math.hypot(a.x - start.hero.x, a.z - start.hero.z) - Math.hypot(b.x - start.hero.x, b.z - start.hero.z))[0];
    log.target = target;
    const arrived = await walkTo(target.x, target.z, 1.1);
    log.arrived = arrived;
    log.arrivedAt = await read();
    let swing = null, firstGold = null, lastGold = log.arrivedAt.gold;
    const until = Date.now() + 20_000;
    while (Date.now() < until) {
      const s = await read();
      log.samples.push({ sim: s.sim, ch: s.channeling, gold: s.gold, x: +s.hero.x.toFixed(2), z: +s.hero.z.toFixed(2) });
      if (!swing && s.channeling) { swing = { sim: s.sim, gold: s.gold, wall: Date.now() - t0 }; log.events.push({ event: 'swing', ...swing }); }
      if (!firstGold && s.gold > lastGold) { firstGold = { sim: s.sim, gold: s.gold, wall: Date.now() - t0 }; log.events.push({ event: 'first-gold', ...firstGold }); }
      if (firstGold && s.sim > firstGold.sim + 4) break;
      await page.waitForTimeout(25);
    }
    log.end = await read();
    log.rawAfterPan = await raw();
    await page.screenshot({ path: outPath.replace(/\.json$/, '.png') });
  }
} catch (error) {
  log.notes.push(`error: ${error.message}`);
} finally {
  writeFileSync(outPath, JSON.stringify(log, null, 1));
  await browser.close();
}
