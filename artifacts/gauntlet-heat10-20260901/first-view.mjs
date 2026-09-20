// TRANSPORT SHIM: operator-authored first-view probe; no strategy and no scored ride.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const [arena, contract, seed] = process.argv.slice(2);
const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], { cwd: arena, stdio: ['pipe', 'pipe', 'ignore'] });
for await (const line of createInterface({ input: sim.stdout })) {
  process.stdout.write(`${line}\n`);
  sim.kill('SIGTERM');
  break;
}

