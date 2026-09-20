#!/usr/bin/env node
// s1256 — RE-MEASURE the thrice-red parked trail-guide plain-boot proof against TODAY's main.
//
// WHY: the leaf was parked (s1206, §5 third-failure escalation) on the premise that later barks
// OVERTAKE a first-run guide beat in the single-slot hud-agent-feed. Two fires ago s1254 merged
// e3ee53d6, which gives first-run guide beats a 4 s dwell and queues later beats FIFO — i.e. a
// cure for exactly that mechanism, landed by an unrelated slice. A stopped leaf goes stale when a
// successor merges, so the question "does the parked spec still red?" is now a measurement, not a
// belief.
//
// THE ONE EDIT, AND WHY IT IS NOT A CURE: GG-04 (bd4c5c18, s1255) REMOVED the greenhorn question
// from the start menu — verified at source, `greenhorn-question` exists nowhere in src/ and three
// specs on main now assert toHaveCount(0). The parked spec asserts it VISIBLE at lines 166-168, so
// as written it reds on a control that no longer exists, for a reason that has nothing to do with
// the defect it was parked on. Those three lines are replaced with today's truth (count 0). Nothing
// else is touched — no timeout raised, no assertion weakened, no beat check relaxed. Both spec
// variants are hashed and kept.
//
// Usage: node measure-parked-spec.mjs [--repeat-each N] [--project NAME] [--as-is]
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

const argv = process.argv.slice(2);
const asIs = argv.includes('--as-is');
const repeatIdx = argv.indexOf('--repeat-each');
const repeatEach = repeatIdx >= 0 ? argv[repeatIdx + 1] : null;
const projIdx = argv.indexOf('--project');
const project = projIdx >= 0 ? argv[projIdx + 1] : null;

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const log = (s) => { console.log(s); appendFileSync(transcript, s + '\n'); };
if (!existsSync(transcript)) writeFileSync(transcript, 's1256 parked-spec re-measurement transcript (append-only)\n');
log(`\n\n######## ARM ${new Date().toISOString()} asIs=${asIs} repeatEach=${repeatEach ?? 1} project=${project ?? 'both'} loadavg=${loadavg().map((n) => n.toFixed(2)).join(' ')} ########`);

// ---- build the spec under test -------------------------------------------------
const parked = readFileSync(resolve(here, 'parked-trail-guide-plain-boot.spec.ts'), 'utf8');
log(`parked spec sha256=${sha(parked)} bytes=${Buffer.byteLength(parked)}`);

const STALE_BLOCK = `  await expect(page.getByTestId('greenhorn-question')).toContainText('First time prospecting?');
  await expect(page.getByLabel('Yes - ease me onto the trail')).toBeVisible();
  await expect(page.getByLabel('No - give me the regular trail')).toBeChecked();
`;
const GG04_BLOCK = `  // s1256 re-measurement: GG-04 (bd4c5c18) removed the greenhorn question; main asserts its
  // ABSENCE in three specs. Same assertion, today's truth. Nothing else in this file is changed.
  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);
`;

let source = parked;
if (!asIs) {
  if (!parked.includes(STALE_BLOCK)) {
    console.error('FATAL: the stale greenhorn block was not found verbatim — refusing to guess.');
    process.exit(3);
  }
  source = parked.replace(STALE_BLOCK, GG04_BLOCK);
  log(`patched spec sha256=${sha(source)} bytes=${Buffer.byteLength(source)} (greenhorn block replaced, 1 site)`);
}

const specName = `tmp-s1256-trail-guide-plain-boot${asIs ? '-asis' : ''}.spec.ts`;
const specPath = resolve(repo, 'e2e', specName);
writeFileSync(specPath, source);
log(`placed ${specName} (UNTRACKED, removed at exit)`);

// ---- scratch-port dev server (lane worktrees share 5188; a live lane run must not be touched) ----
let server = null;
const cleanup = () => {
  try { if (server && server.exitCode === null) server.kill('SIGTERM'); } catch { /* ignore */ }
  try { rmSync(specPath, { force: true }); } catch { /* ignore */ }
};
process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(130); });

server = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: repo, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });

const waitReady = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

if (!(await waitReady())) {
  log('FATAL: scratch dev server never came up on ' + BASE + '\n' + serverLog.slice(-2000));
  process.exit(4);
}
log(`scratch dev server READY on ${BASE}`);

// ---- run ----------------------------------------------------------------------
// WORKER COUNT IS THE VARIABLE, NOT LOAD. s1205's own CONTROL was `--workers=1 --repeat-each=2`
// and it passed 2/2 WHILE THE DEFECT WAS LIVE, so a green at workers=1 is uninformative here. The
// canonical arm (default workers, both projects) is the one that produced 4/4 red (s1204) and
// 3/4 red (s1205). Default = omit the flag.
const workersIdx = argv.indexOf('--workers');
const workers = workersIdx >= 0 ? argv[workersIdx + 1] : null;
const args = ['playwright', 'test', `e2e/${specName}`];
if (workers) args.push(`--workers=${workers}`);
if (repeatEach) args.push(`--repeat-each=${repeatEach}`);
if (project) args.push(`--project=${project}`);
log(`$ npx ${args.join(' ')}   (GR_CAPTURE_BASE_URL=${BASE}, external server)`);
const t0 = Date.now();
const r = spawnSync('npx', args, {
  cwd: repo,
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
  env: { ...process.env, GR_CAPTURE_BASE_URL: BASE, GR_CAPTURE_EXTERNAL_SERVER: '1' },
});
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
log(`\n===== rc=${r.status} ${secs}s loadavg_after=${loadavg().map((n) => n.toFixed(2)).join(' ')} =====`);
log(body);
console.log(`\nRESULT rc=${r.status} in ${secs}s — full output in ${transcript}`);
cleanup();
process.exit(r.status ?? 1);
