#!/usr/bin/env node
// s1256 — THE F-1206-1 DISCRIMINATOR, pointed at the question the canonical arm actually raised.
//
// The canonical arm (default workers, --repeat-each=2) gave 4/4 red at THREE distinct sites:
//   :196 beat-2 poll   history = [beat-1 copy, ""]      (x2)
//   :200 economy.gold  expected >0, received 0          (x1)
//   :219 harvest.channeling expected true, received false (x1)
// The last two never touch hud-agent-feed, so a feed-overtaking premise cannot explain them.
// Common ancestor of all three: moveHeroTo(nearestSeam) -> harvest -> first nugget. If the hero
// never works the seam, beat 2 never fires and the recorder is CORRECT to hold [beat-1, ""].
//
// HYPOTHESIS UNDER TEST: moveHeroTo holds a key down while polling hero position over the wire; a
// slow round-trip under concurrency makes it OVERSHOOT and stop out of harvest range. That is a
// sampling-precision defect in the test helper, which is exactly why attempt 2 (raise every wait)
// made no difference — a longer timeout cannot re-aim a hero that already ran past the seam.
//
// This arm changes NO assertion. It only records, at each failure point, where the hero actually
// is relative to the seam it aimed at, plus channeling/gold. Then it rethrows.
import { spawnSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { loadavg } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;
const transcript = resolve(here, 'measure-transcript.txt');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const log = (s) => { console.log(s); appendFileSync(transcript, s + '\n'); };

const parked = readFileSync(resolve(here, 'parked-trail-guide-plain-boot.spec.ts'), 'utf8');

const STALE_BLOCK = `  await expect(page.getByTestId('greenhorn-question')).toContainText('First time prospecting?');
  await expect(page.getByLabel('Yes - ease me onto the trail')).toBeVisible();
  await expect(page.getByLabel('No - give me the regular trail')).toBeChecked();
`;
const GG04_BLOCK = `  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);
`;

// 1) record every moveHeroTo outcome: where it aimed, where it stopped, how far it missed.
const MOVE_TAIL = `  current = await position();
  if (current.z < target.z - 0.12) await pressUntil('KeyS', (value) => value.z >= target.z - 0.12);
}`;
const MOVE_TAIL_NEW = `  current = await position();
  if (current.z < target.z - 0.12) await pressUntil('KeyS', (value) => value.z >= target.z - 0.12);
  const landed = await position();
  const miss = Math.hypot(landed.x - target.x, landed.z - target.z);
  await page.evaluate((entry) => {
    const view = window as typeof window & { __s1256moves?: unknown[] };
    (view.__s1256moves ??= []).push(entry);
  }, { target, landed, miss });
  console.log('[s1256] moveHeroTo aimed=' + JSON.stringify(target) + ' landed=' + JSON.stringify(landed) + ' miss=' + miss.toFixed(3));
}`;

// 2) at every failure, dump hero-vs-seam truth before rethrowing.
const DIAG_FN = `
async function s1256Diag(page: Page, where: string): Promise<void> {
  const snap = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__!;
    const hero = d.heroPos;
    const nodes = d.harvest.activeNodes.filter((n) => n.active);
    const nearest = nodes
      .map((n) => ({ pos: n.position, dist: Math.hypot(n.position.x - hero.x, n.position.z - hero.z) }))
      .sort((a, b) => a.dist - b.dist)[0];
    const view = window as typeof window & { __s1256moves?: unknown[]; __trailGuideFeedHistory?: string[] };
    return {
      hero,
      nearestSeam: nearest?.pos ?? null,
      distToNearestSeam: nearest?.dist ?? null,
      activeSeams: nodes.length,
      channeling: d.harvest.channeling,
      gold: d.economy.gold,
      moves: view.__s1256moves ?? [],
      feedHistory: view.__trailGuideFeedHistory ?? [],
      feedLive: document.querySelector('[data-testid="hud-agent-feed"]')?.textContent?.trim() ?? null,
      feedNodePresent: Boolean(document.querySelector('[data-testid="hud-agent-feed"]')),
    };
  });
  console.log('[s1256] DIAG@' + where + ' ' + JSON.stringify(snap));
}

async function s1256Guard(page: Page, where: string, body: () => Promise<void>): Promise<void> {
  try {
    await body();
  } catch (error) {
    await s1256Diag(page, where);
    throw error;
  }
}
`;

const sites = [
  // beat 2 — the feed assertion that reds twice
  [`  await moveHeroTo(page, await nearestSeam(page));
  await expectGuideBeat(page, testInfo, 1);`,
    `  await moveHeroTo(page, await nearestSeam(page));
  await s1256Guard(page, 'beat2', () => expectGuideBeat(page, testInfo, 1));`],
  // first-arm gold
  [`  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThan(0);
  await expectGuideBeat(page, testInfo, 2);`,
    `  await s1256Guard(page, 'gold-arm1', async () => {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBeGreaterThan(0);
  });
  await expectGuideBeat(page, testInfo, 2);`],
  // second-arm channeling
  [`  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false)).toBe(true);`,
    `  await s1256Guard(page, 'channeling-arm2', async () => {
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false)).toBe(true);
  });`],
];

let source = parked.replace(STALE_BLOCK, GG04_BLOCK);
if (source === parked) { console.error('FATAL: greenhorn block not found'); process.exit(3); }
if (!source.includes(MOVE_TAIL)) { console.error('FATAL: moveHeroTo tail not found'); process.exit(3); }
source = source.replace(MOVE_TAIL, MOVE_TAIL_NEW);
for (const [from, to] of sites) {
  if (!source.includes(from)) { console.error('FATAL: site not found:\n' + from); process.exit(3); }
  source = source.replace(from, to);
}
// insert the helpers just before the test
source = source.replace(`test('plain fresh boot teaches`, DIAG_FN + `\ntest('plain fresh boot teaches`);

const specName = 'tmp-s1256-trail-guide-instrumented.spec.ts';
const specPath = resolve(repo, 'e2e', specName);
writeFileSync(specPath, source);
if (!existsSync(transcript)) writeFileSync(transcript, '');
log(`\n\n######## INSTRUMENTED ARM ${new Date().toISOString()} loadavg=${loadavg().map((n) => n.toFixed(2)).join(' ')} ########`);
log(`instrumented spec sha256=${sha(source)} bytes=${Buffer.byteLength(source)} (assertions unchanged; diagnostics added)`);

let server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: repo, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });
const cleanup = () => {
  try { if (server && server.exitCode === null) server.kill('SIGTERM'); } catch { /* ignore */ }
  try { rmSync(specPath, { force: true }); } catch { /* ignore */ }
};
process.on('exit', cleanup);

for (let i = 0; i < 60; i++) {
  try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) }); if (r.ok) break; } catch { /* wait */ }
  await new Promise((r) => setTimeout(r, 500));
}
log(`scratch dev server READY on ${BASE}`);

const args = ['playwright', 'test', `e2e/${specName}`, '--repeat-each=2'];
log(`$ npx ${args.join(' ')}   (default workers — the canonical arm)`);
const t0 = Date.now();
const r = spawnSync('npx', args, {
  cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' },
});
const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
log(`\n===== rc=${r.status} ${((Date.now() - t0) / 1000).toFixed(1)}s =====`);
log(body);
for (const line of body.split('\n')) if (line.includes('[s1256]')) console.log(line);
cleanup();
process.exit(r.status ?? 1);
