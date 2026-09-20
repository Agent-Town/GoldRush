// Gold Rush gauntlet driver — heat 11, e1-dry-gulch, claude-opus-5
// Spawns gr-sim, speaks the NDJSON standing-order transport, logs every view.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/opus/e1-dry-gulch';

export async function ride({ tape, policy, idle = false, logName, contract = 'e1-dry-gulch', seed = 'e1-dry-gulch-01' }) {
  const args = [
    `${REPO}/scripts/gr-sim.mjs`,
    '--contract', contract,
    '--seed', seed,
    '--difficulty', 'trail',
  ];
  if (idle) args.push('--policy=idle');
  if (tape) args.push('--tape', tape);

  const child = spawn('node', args, { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

  const views = [];
  let outcome = null;
  const stderrChunks = [];
  child.stderr.on('data', (d) => stderrChunks.push(d.toString()));

  let buf = '';
  let turnIndex = 0;

  await new Promise((resolveP, rejectP) => {
    child.stdout.on('data', (chunk) => {
      buf += chunk.toString();
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (!line.trim()) continue;
        let obj;
        try { obj = JSON.parse(line); } catch { continue; }
        if (obj.schema === 'goldrush.view.v1') {
          views.push(obj);
          if (!idle && !obj.terminal && obj.now && !obj.outcomeOnly) {
            let orders;
            try { orders = policy(obj, turnIndex, views); } catch (e) {
              orders = [];
              stderrChunks.push(`POLICY ERROR: ${e.stack}\n`);
            }
            turnIndex += 1;
            if (orders !== null) child.stdin.write(JSON.stringify(orders) + '\n');
          }
        } else if (obj.secured !== undefined) {
          outcome = obj;
        }
      }
    });
    child.on('error', rejectP);
    child.on('close', () => resolveP());
  });

  const stderr = stderrChunks.join('');
  if (logName) {
    const p = resolve(WS, logName);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, views.map((v) => JSON.stringify(v)).join('\n') + '\n');
    writeFileSync(p.replace(/\.jsonl$/, '.err.txt'), stderr);
  }
  return { views, outcome, stderr };
}
