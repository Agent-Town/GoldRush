#!/usr/bin/env node
// s1256 — CURE PROTOTYPE 2, after prototype 1 was refuted by its own arm.
//
// PROTOTYPE 1 (iterate the axis alignment) went 3/4, not 4/4, and its telemetry is the reason to
// abandon that premise rather than tune it: the loop ran to its 12-pass cap and STILL finished
// 1.21-2.15 from the target. Twelve corrective passes cannot close a 1.2-unit gap, so the target is
// not merely being overshot — it is not reachable at all. Consistent with a seam that is SOLID:
// in 13/13 observed moves across every arm, passing and failing alike, the hero never once got
// within 0.12 of a seam centre; the passing runs merely stopped inside harvest range (miss
// 0.95-1.47) and the failing ones outside it (1.78-2.15).
//
// So moveHeroTo(nearestSeam()) asks for a position the player cannot occupy, and whether the test
// passes is decided by where the hero happens to stop against the obstruction. That is the defect
// all three lane attempts were standing on, and no timeout, recorder or feed change can reach it.
//
// CANDIDATE CURE 2: stop driving when the hero is ACTUALLY HARVESTING, which is what every caller
// means by "go to the seam", instead of when it reaches an unoccupiable point. Position tolerance
// stays as the fallback. Test-helper only; zero src bytes; no assertion, timeout or beat check
// touched.
import { spawnSync, spawn } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, rmSync } from 'node:fs';
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

const OLD_MOVE = `  let current = await position();
  if (current.x > target.x + 0.12) await pressUntil('KeyA', (value) => value.x <= target.x + 0.12);
  current = await position();
  if (current.x < target.x - 0.12) await pressUntil('KeyD', (value) => value.x >= target.x - 0.12);
  current = await position();
  if (current.z > target.z + 0.12) await pressUntil('KeyW', (value) => value.z <= target.z + 0.12);
  current = await position();
  if (current.z < target.z - 0.12) await pressUntil('KeyS', (value) => value.z >= target.z - 0.12);
}`;

const NEW_MOVE = `  // s1256 CURE PROTOTYPE 2: a seam centre is not an occupiable point (13/13 moves stopped 0.95-2.15
  // short of it, on passing and failing runs alike). Drive until the hero is actually harvesting --
  // the thing every caller means -- and keep the position tolerance only as a fallback.
  const harvesting = () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false);
  const TOLERANCE = 0.35;
  const deadline = Date.now() + SIM_PROGRESS_TIMEOUT;
  let landed = await position();
  let passes = 0;
  while (
    !(await harvesting()) &&
    Math.hypot(landed.x - target.x, landed.z - target.z) > TOLERANCE &&
    Date.now() < deadline &&
    passes < 12
  ) {
    passes += 1;
    if (landed.x > target.x + 0.12) await pressUntil('KeyA', (value) => value.x <= target.x + 0.12);
    landed = await position();
    if (await harvesting()) break;
    if (landed.x < target.x - 0.12) await pressUntil('KeyD', (value) => value.x >= target.x - 0.12);
    landed = await position();
    if (await harvesting()) break;
    if (landed.z > target.z + 0.12) await pressUntil('KeyW', (value) => value.z <= target.z + 0.12);
    landed = await position();
    if (await harvesting()) break;
    if (landed.z < target.z - 0.12) await pressUntil('KeyS', (value) => value.z >= target.z - 0.12);
    landed = await position();
  }
  const miss = Math.hypot(landed.x - target.x, landed.z - target.z);
  console.log('[s1256] moveHeroTo passes=' + passes + ' miss=' + miss.toFixed(3) + ' harvesting=' + (await harvesting()));
}`;

let source = parked.replace(STALE_BLOCK, `  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);\n`);
if (source === parked) { console.error('FATAL: greenhorn block not found'); process.exit(3); }
if (!source.includes(OLD_MOVE)) { console.error('FATAL: moveHeroTo body not found verbatim'); process.exit(3); }
source = source.replace(OLD_MOVE, NEW_MOVE);

const specName = 'tmp-s1256-trail-guide-cure2.spec.ts';
const specPath = resolve(repo, 'e2e', specName);
writeFileSync(specPath, source);
log(`\n\n######## CURE-PROTOTYPE-2 ARM ${new Date().toISOString()} loadavg=${loadavg().map((n) => n.toFixed(2)).join(' ')} ########`);
log(`cure2 spec sha256=${sha(source)} bytes=${Buffer.byteLength(source)}`);

const server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: repo, stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', () => {});
server.stderr.on('data', () => {});
const cleanup = () => {
  try { if (server.exitCode === null) server.kill('SIGTERM'); } catch { /* ignore */ }
  try { rmSync(specPath, { force: true }); } catch { /* ignore */ }
};
process.on('exit', cleanup);
for (let i = 0; i < 60; i++) {
  try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) }); if (r.ok) break; } catch { /* wait */ }
  await new Promise((r) => setTimeout(r, 500));
}
log(`scratch dev server READY on ${BASE}`);

const args = ['playwright', 'test', `e2e/${specName}`, '--repeat-each=2'];
log(`$ npx ${args.join(' ')}   (canonical arm)`);
const t0 = Date.now();
const r = spawnSync('npx', args, {
  cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' },
});
const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
log(`\n===== rc=${r.status} ${((Date.now() - t0) / 1000).toFixed(1)}s loadavg_after=${loadavg().map((n) => n.toFixed(2)).join(' ')} =====`);
log(body);
for (const line of body.split('\n')) if (line.includes('[s1256]') || /passed|failed|✘|✓/.test(line)) console.log(line);
cleanup();
process.exit(r.status ?? 1);
