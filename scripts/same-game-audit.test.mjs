import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./same-game-audit.mjs', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
}

test('same-game audit runs over every contract and keeps its row schema', () => {
  const result = run('--json');
  assert.equal(result.status, 0, result.stderr);
  const audit = JSON.parse(result.stdout);
  assert.equal(audit.schema, 'goldrush.same-game-audit.v1');
  const expectedContracts = fs.readdirSync(path.join(ROOT, 'assets/contracts')).reduce((count, epoch) => {
    const file = path.join(ROOT, 'assets/contracts', epoch, 'contracts.json');
    return count + (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).contracts.length : 0);
  }, 0);
  assert.equal(audit.contracts.length, expectedContracts);
  assert.ok(audit.rows.length > audit.contracts.length * 4);
  assert.deepEqual(Object.keys(audit.rows[0]), [
    'contract', 'surface', 'humans-get', 'agents-get', 'direction', 'evidence',
  ]);
  assert.ok(audit.rows.every((row) => ['buildable', 'ability', 'choice', 'verb', 'economy'].includes(row.surface)));
  assert.ok(audit.rows.every((row) => ['agent-exceeds', 'agent-lacks', 'equal'].includes(row.direction)));
});

test('same-game audit follows the door grammar after eba8d15ea blast and ap16-2b pick', () => {
  const result = run('--json');
  assert.equal(result.status, 0, result.stderr);
  const { rows } = JSON.parse(result.stdout);
  const has = (contract, surface, text, direction) => rows.some((row) =>
    row.contract === contract && row.surface === surface && row.direction === direction
      && `${row['humans-get']} ${row['agents-get']}`.includes(text));

  const reachable = new Set(rows.filter((row) => row.surface === 'verb'
    && row['humans-get'] === 'browser can launch the contract' && row.direction === 'equal').map((row) => row.contract));
  assert.equal(rows.filter((row) => row.surface === 'buildable' && reachable.has(row.contract)
    && row['humans-get'].startsWith('browser menu') && row.direction !== 'equal').length, 0);
  assert.equal(rows.filter((row) => row.contract === 'the-claim' && row.surface === 'choice'
    && row.direction === 'equal' && `${row['humans-get']} ${row['agents-get']}`.includes('PICK_UPGRADE')).length, 2,
  'ap16-2b pick must be reachable without a contradictory tape row');
  assert.ok(has('the-claim', 'ability', 'BLAST_AT', 'equal'), 'eba8d15ea blast must be reachable');
  assert.ok(has('the-claim', 'ability', 'weapon_toggle', 'agent-lacks'), 'unenumerated human tape agency must remain visible');
});

test('same-game audit also emits a complete markdown table', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /# Same-game audit/);
  assert.match(result.stdout, /\| contract \| surface \| humans-get \| agents-get \| direction \| evidence \|/);
  assert.match(result.stdout, /## New divergence classes beyond the seed/);
  assert.match(result.stdout, /## Worst offenders/);
});
