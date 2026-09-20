// HEAT 13 — is a WHOLESALE array refusal visible to a rider that reads only stdout?
// gr-sim.mjs:280 rejectOrders() re-prints the CURRENT view on refusal. The comment above it
// (F-MCAP-1, owner "both") says the refusal rides `now.orders[]` with status "failed". This
// measures whether that holds when the ENTIRE array is refused at tick 0, where there are no
// standing orders for a failure to ride on.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01'], { cwd: '/tmp/heat13-569a41f9', stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
sim.stderr.on('data', (d) => { stderr += d; });
const views = [];
let sent = 0;
const rl = createInterface({ input: sim.stdout });
for await (const line of rl) {
  let v; try { v = JSON.parse(line); } catch { continue; }
  if (v.schema !== 'goldrush.view.v1') break;
  views.push({ t: v.now?.t ?? null, timeAlive: v.now?.timeAlive ?? null, wave: v.now?.wave ?? null, orders: v.now?.orders ?? null, surprises: v.surprises ?? null, keys: Object.keys(v) });
  if (sent === 0) { sim.stdin.write(JSON.stringify([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 8 }, when: { goldGte: 50 } }, { verb: 'HOLD', pos: { x: -1.5, z: -6.4 } }]) + '\n'); sent += 1; continue; }
  if (sent < 4) { sim.stdin.write(JSON.stringify([{ verb: 'HOLD', pos: { x: 1, z: 1 } }]) + '\n'); sent += 1; continue; }
  break;
}
sim.kill('SIGKILL');
const out = { viewsSeen: views.length, sent, views: views.slice(0, 5), stderr: stderr.split('\n').filter((l) => /reject|seat/.test(l)).slice(0, 8) };
writeFileSync('/tmp/heat13-569a41f9/artifacts/gauntlet-heat13-569a41f9/probe/refusal-visibility.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 2).slice(0, 3000));
process.exit(0);
