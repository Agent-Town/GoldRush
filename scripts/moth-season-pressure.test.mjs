import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ORDERS = JSON.parse(readFileSync(new URL('./fixtures/moth-season-orders.json', import.meta.url), 'utf8'))
  .map(JSON.stringify)
  .join('\n') + '\n';

function run(policy, input) {
  const result = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e3-moth-season', '--seed', 'e3-moth-season-01', `--policy=${policy}`],
    { cwd: ROOT, encoding: 'utf8', input, timeout: 30_000 },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout.trim().split('\n').at(-1));
}

test('Moth Season rejects idle darkness while lantern, turret, and harvest play secures', () => {
  const idle = run('idle');
  const competent = run('stdin', ORDERS);

  assert.equal(idle.secured, false);
  assert.ok(idle.waves <= 10, `idle survived too long: ${JSON.stringify(idle)}`);
  assert.deepEqual(
    { secured: competent.secured, waves: competent.waves },
    { secured: true, waves: 12 },
  );
  console.log(`moth-season idle ${JSON.stringify(idle)}`);
  console.log(`moth-season competent ${JSON.stringify(competent)}`);
});
