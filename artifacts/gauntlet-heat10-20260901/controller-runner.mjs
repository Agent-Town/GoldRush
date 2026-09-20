// TRANSPORT SHIM: operator-authored. It executes a rig-authored default export verbatim;
// it contains no strategy, coordinates, order defaults, or controller repair.
import { appendFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [arena, controllerPath, contract, seed, tapePath, transcriptPath, outcomePath] = process.argv.slice(2);
if (!outcomePath) throw new Error('usage: controller-runner.mjs arena controller contract seed tape transcript outcome');
const controller = (await import(`${pathToFileURL(controllerPath).href}?ride=${Date.now()}`)).default;
if (typeof controller !== 'function') throw new TypeError('controller must default-export a function');
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--tape', tapePath], { cwd: arena, stdio: ['pipe', 'pipe', 'pipe'] });
const exit = new Promise((done) => sim.once('close', done));
sim.stderr.on('data', (chunk) => appendFileSync(transcriptPath, `STDERR ${chunk}`));
sim.stdin.on('error', (error) => { if (error.code !== 'EPIPE') throw error; });
let outcome;
for await (const line of createInterface({ input: sim.stdout })) {
  appendFileSync(transcriptPath, `VIEW ${line}\n`);
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') { outcome = message; continue; }
  const orders = await controller(message);
  if (!Array.isArray(orders)) throw new TypeError('controller returned a non-array');
  appendFileSync(transcriptPath, `ORDERS ${JSON.stringify(orders)}\n`);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}
const code = await exit;
if (code) throw new Error(`gr-sim exited ${code}`);
writeFileSync(outcomePath, `${JSON.stringify(outcome)}\n`);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

