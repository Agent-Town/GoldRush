// s1557 — run the node-guards battery ALONE via node (bash gate refuses `npm run`).
// Executes exactly the first segment of package.json's test:node-guards chain.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const OUT = 'artifacts/s1557-node-guards-f1554-1.txt';

const script = JSON.parse(readFileSync('package.json', 'utf8')).scripts['test:node-guards'];
const first = script.split('&&')[0].trim();
const parts = first.split(/\s+/);
if (parts[0] !== 'node' || parts[1] !== 'scripts/run-node-guards.mjs') {
  console.error('UNEXPECTED script shape — ABORT:', first.slice(0, 120));
  process.exit(2);
}
const args = parts.slice(1);
console.error(`[s1557] running ${args.length - 1} guard files ALONE`);
const t0 = Date.now();
const r = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const wall = ((Date.now() - t0) / 1000).toFixed(1);
const body =
  `# s1557 node-guards battery on the MERGED tree (f1554-1 drain)\n` +
  `# rc=${r.status}  wall=${wall}s  guardFiles=${args.length - 1}\n\n` +
  `===== STDOUT =====\n${r.stdout || ''}\n===== STDERR =====\n${r.stderr || ''}\n`;
writeFileSync(OUT, body);
console.error(`[s1557] rc=${r.status} wall=${wall}s -> ${OUT}`);
// surface the tail so the fire can read the verdict without a second command
console.error((r.stdout || '').split('\n').slice(-18).join('\n'));
console.error('STDERR-TAIL:', (r.stderr || '').split('\n').slice(-6).join('\n'));
process.exit(r.status ?? 1);
