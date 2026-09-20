import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';

const [sourceTape, outputTape] = process.argv.slice(2);
const orders = JSON.parse(readFileSync(sourceTape, 'utf8')).inputLog.entries.map((entry) => entry.a[0].orders);
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--tape', resolve(outputTape)], {
  cwd: '/tmp/heat8-4675cfd7', stdio: ['pipe', 'pipe', 'inherit'],
});
const exit = new Promise((done) => sim.once('close', done));
let index = 0;
let outcome;
for await (const line of createInterface({ input: sim.stdout })) {
  const view = JSON.parse(line);
  if (view.schema === 'goldrush.view.v1') {
    sim.stdin.write(`${JSON.stringify(view.now?.pendingSecure ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : orders[Math.min(index++, orders.length - 1)])}\n`);
  } else outcome = view;
}
if (await exit) process.exitCode = 1;
process.stdout.write(`${JSON.stringify(outcome)}\n`);

