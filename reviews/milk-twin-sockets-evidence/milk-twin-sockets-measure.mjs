// Measurement run (milk/twin-sockets): with both era sockets wired, what does each E6 contract
// ACTUALLY do headlessly? Two seeds, each run twice. Admission is decided by this table, not by
// what the socket was hoped to unblock.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const contracts = process.argv.slice(2);

const run = (contract, seed) => {
  const result = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 600_000, maxBuffer: 1 << 28 },
  );
  if (result.status !== 0) {
    return { error: (result.stderr || result.error?.message || 'unknown').split('\n').filter(Boolean).slice(-2).join(' | ') };
  }
  const lines = result.stdout.trim().split('\n');
  const outcome = JSON.parse(lines.at(-1));
  const lastView = JSON.parse(lines.at(-2));
  const wrangle = lastView?.stablePrefix?.mechanics ? undefined : undefined;
  return { outcome, turns: lines.length - 1, wrangle };
};

for (const contract of contracts) {
  for (const seed of [`${contract}-01`, `${contract}-02`]) {
    const first = run(contract, seed);
    if (first.error) {
      process.stdout.write(`${contract} ${seed}  THROW  ${first.error}\n`);
      continue;
    }
    const second = run(contract, seed);
    const o = first.outcome;
    process.stdout.write(
      `${contract} ${seed}  secured=${o.secured} waves=${o.waves} timeMs=${o.timeMs} gold=${o.gold} kills=${o.kills} `
      + `hash=${o.eventLogHash} repeat=${second.outcome?.eventLogHash === o.eventLogHash ? 'IDENTICAL' : 'DIVERGED'} turns=${first.turns}\n`,
    );
  }
}
