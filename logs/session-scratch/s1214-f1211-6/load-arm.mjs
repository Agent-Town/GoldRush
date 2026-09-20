// s1214 — F-1211-6 discriminator: is e2e/gazette-welcome.spec.ts's newsie-drift
// assertion a LOAD CEILING or a real regression on main?
//
// One variable: the tree, the spec, the command and the server are identical to the
// quiet arm; only the machine's load differs. Burners self-exit (no pid killing).
//
// Usage: node logs/session-scratch/s1214-f1211-6/load-arm.mjs <burners> <targetLoad> <port>
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';

const burnerCount = Number(process.argv[2] ?? 10);
const targetLoad = Number(process.argv[3] ?? 8);
const port = process.argv[4] ?? '5261';
const BURN_SECONDS = 420;

const burnerSrc = `const end = Date.now() + ${BURN_SECONDS} * 1000;
let x = 0;
while (Date.now() < end) { x = Math.sqrt(x + Math.random()) * 1.0000001; }
process.exit(0);`;

const burners = [];
for (let i = 0; i < burnerCount; i += 1) {
  burners.push(spawn(process.execPath, ['-e', burnerSrc], { stdio: 'ignore', detached: false }));
}
console.log(`spawned ${burners.length} burners (self-exit in ${BURN_SECONDS}s), cores=${os.cpus().length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let load = os.loadavg()[0];
const deadline = Date.now() + 180_000;
while (load < targetLoad && Date.now() < deadline) {
  await sleep(5_000);
  load = os.loadavg()[0];
  console.log(`  loadavg1 = ${load.toFixed(2)}`);
}
const loadAtStart = os.loadavg();
console.log(`LOAD AT RUN START: ${loadAtStart.map((n) => n.toFixed(2)).join(' / ')}`);

const started = Date.now();
const run = spawnSync('npx', [
  'playwright', 'test', 'e2e/gazette-welcome.spec.ts',
  '--project=desktop-chrome', '--workers=1', '--repeat-each=3', '--reporter=line',
], {
  env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}` },
  encoding: 'utf8',
  maxBuffer: 128 * 1024 * 1024,
});
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
const out = `${run.stdout ?? ''}${run.stderr ?? ''}`;

console.log(`EXIT ${run.status} after ${elapsed}s`);
console.log(`LOAD AT RUN END: ${os.loadavg().map((n) => n.toFixed(2)).join(' / ')}`);
console.log(out.slice(-6000));
for (const b of burners) b.kill('SIGTERM');
