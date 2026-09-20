#!/usr/bin/env node
// s1256 — PROTOTYPE THE CURE before ordering it. §5 demands a fourth attempt carry a CHANGED
// premise; this arm is what makes the premise measured rather than argued.
//
// MEASURED DEFECT (instrumented arm, this fire): moveHeroTo aligns X to within 0.12, THEN aligns Z.
// It never re-checks X. Observed landings, 6/6, aimed {x:-9,z:6.7}:
//   miss 1.474 / 1.222 / 1.909 / 1.779 / 1.222 / 0.951  — against its own stated tolerance of 0.12.
// It never once achieved its postcondition. Runs failed at miss 1.78-1.91 (distToSeam ~1.9-2.0,
// channeling false, gold 0) and passed at miss 0.95-1.47, i.e. the test has been passing by luck
// whenever the miss happened to land inside harvest range.
//
// CANDIDATE CURE (test-helper only, zero src bytes): iterate the alignment until the hero is
// actually within tolerance of the target, instead of running each axis once. Deliberately
// conservative — no timeout raised, no assertion touched, no product code involved.
//
// FALSIFIER: if this still reds at the canonical arm, the defect is NOT the one-shot alignment and
// the fourth attempt must not be authored on this premise either.
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

const NEW_MOVE = `  // s1256 CURE PROTOTYPE: the one-shot axis sequence never re-checks X after the Z leg, so the
  // hero routinely finishes 0.95-1.91 away from a target it claims to reach within 0.12. Iterate
  // until the hero is genuinely within tolerance (or a deadline passes), then report the miss.
  const TOLERANCE = 0.35;
  const deadline = Date.now() + SIM_PROGRESS_TIMEOUT;
  let landed = await position();
  let passes = 0;
  while (Math.hypot(landed.x - target.x, landed.z - target.z) > TOLERANCE && Date.now() < deadline) {
    passes += 1;
    if (landed.x > target.x + 0.12) await pressUntil('KeyA', (value) => value.x <= target.x + 0.12);
    landed = await position();
    if (landed.x < target.x - 0.12) await pressUntil('KeyD', (value) => value.x >= target.x - 0.12);
    landed = await position();
    if (landed.z > target.z + 0.12) await pressUntil('KeyW', (value) => value.z <= target.z + 0.12);
    landed = await position();
    if (landed.z < target.z - 0.12) await pressUntil('KeyS', (value) => value.z >= target.z - 0.12);
    landed = await position();
    if (passes > 12) break;
  }
  const miss = Math.hypot(landed.x - target.x, landed.z - target.z);
  console.log('[s1256] moveHeroTo passes=' + passes + ' aimed=' + JSON.stringify(target) + ' landed=' + JSON.stringify(landed) + ' miss=' + miss.toFixed(3));
}`;

let source = parked.replace(STALE_BLOCK, `  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);\n`);
if (source === parked) { console.error('FATAL: greenhorn block not found'); process.exit(3); }
if (!source.includes(OLD_MOVE)) { console.error('FATAL: moveHeroTo body not found verbatim'); process.exit(3); }
source = source.replace(OLD_MOVE, NEW_MOVE);

const specName = 'tmp-s1256-trail-guide-cure.spec.ts';
const specPath = resolve(repo, 'e2e', specName);
writeFileSync(specPath, source);
log(`\n\n######## CURE-PROTOTYPE ARM ${new Date().toISOString()} loadavg=${loadavg().map((n) => n.toFixed(2)).join(' ')} ########`);
log(`cure spec sha256=${sha(source)} bytes=${Buffer.byteLength(source)} (moveHeroTo iterated; every assertion untouched)`);

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
log(`$ npx ${args.join(' ')}   (canonical arm: default workers, both projects)`);
const t0 = Date.now();
const r = spawnSync('npx', args, {
  cwd: repo, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' },
});
const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
log(`\n===== rc=${r.status} ${((Date.now() - t0) / 1000).toFixed(1)}s loadavg_after=${loadavg().map((n) => n.toFixed(2)).join(' ')} =====`);
log(body);
for (const line of body.split('\n')) if (line.includes('[s1256]') || /passed|failed/.test(line)) console.log(line);
cleanup();
process.exit(r.status ?? 1);
