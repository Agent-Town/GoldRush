// Driver: spawns gr-sim, speaks the NDJSON door, delegates order-building to a policy module.
// usage: node run.mjs <policyFile> <tapePath> [outNdjson]
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [, , policyFile, tapePath, outPath] = process.argv;
const REPO = '/private/tmp/heat11-5e7a7c0b';

let policy = null;
if (policyFile && policyFile !== 'idle') {
  policy = (await import(pathToFileURL(policyFile).href)).default;
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e2-pressure-garden', '--seed', 'e2-pressure-garden-01'];
if (tapePath) args.push('--tape', tapePath);
if (!policy) args.push('--policy=idle');

const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });
let stderrBuf = '';
child.stderr.on('data', (d) => { stderrBuf += d.toString(); });

if (outPath) writeFileSync(outPath, '');
const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
const views = [];
let outcome = null;

for await (const line of rl) {
  if (outPath) appendFileSync(outPath, line + '\n');
  let msg;
  try { msg = JSON.parse(line); } catch { continue; }
  if (msg.schema === 'goldrush.view.v1') {
    views.push(msg);
    if (policy) {
      const orders = policy(msg, views);
      if (orders !== null) child.stdin.write(JSON.stringify(orders) + '\n');
    }
  } else {
    outcome = msg;
  }
}
try { child.stdin.end(); } catch {}
await new Promise((r) => child.on('close', r));

const summary = {
  outcome,
  viewCount: views.length,
  waves: views.map((v) => ({
    w: v.now.wave,
    t: Math.round((v.now.timeAliveMs ?? v.now.simTimeMs ?? 0) / 100) / 10,
    gold: v.now.gold,
    hp: v.now.hero?.hp,
    alive: v.now.threats?.alive,
    works: v.now.works?.byKind,
    offer: v.now.pendingOffer?.map((o) => o.id),
    secure: v.now.pendingSecure ? true : undefined,
    needsRider: v.now.needsRider || undefined,
  })),
};
console.log(JSON.stringify(summary, null, 1));
console.error(stderrBuf.split('\n').filter((l) => l.trim()).slice(-25).join('\n'));
