// L3 proof rider: replays the round-2 prover's order batches through the public door,
// producing a FRESH tape at the current build (meta.buildId stamped by gr-sim itself).
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
const [tapePath, outTape] = process.argv.slice(2);
const src = JSON.parse(readFileSync(tapePath, 'utf8'));
const tape = src.reel ?? src;
const batches = tape.inputLog.entries.map((e) => (e.a ?? []).filter((a) => a.kind === 'agent_orders').flatMap((a) => a.orders));
const sim = spawn('node', ['scripts/gr-sim.mjs', '--contract', tape.contract, '--seed', tape.seed, '--tape', outTape], { stdio: ['pipe', 'pipe', 'inherit'] });
let i = 0;
const rl = createInterface({ input: sim.stdout });
rl.on('line', (line) => {
  if (!line.trim().startsWith('{')) return;
  sim.stdin.write((i < batches.length && batches[i].length ? JSON.stringify(batches[i]) + "\n" : "") + "\n");
  i += 1;
});
sim.on('exit', (code) => { console.error(`rider: ${i} views answered, gr-sim exit ${code}`); process.exit(code ?? 1); });
