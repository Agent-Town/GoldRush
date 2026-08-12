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
  assert.ok(audit.rows.every((row) => ['agent-exceeds', 'agent-lacks', 'equal', 'not-offered'].includes(row.direction)));
  assert.equal(audit.rows.filter((row) => row.direction === 'not-offered').length, 15);
  assert.equal(audit.admission.measurements.length, 10);
  assert.ok(audit.admission.measurements.every((entry) => entry.booted && entry.firstView && entry.terminal && !entry.error));
});

test('same-game audit follows the door grammar through the final AP-16 verbs', () => {
  const result = run('--json');
  assert.equal(result.status, 0, result.stderr);
  const { rows } = JSON.parse(result.stdout);
  const has = (contract, surface, text, direction) => rows.some((row) =>
    row.contract === contract && row.surface === surface && row.direction === direction
      && `${row['humans-get']} ${row['agents-get']}`.includes(text));

  const reachability = new Map(rows.filter((row) => row.surface === 'verb'
    && (row['humans-get'].includes('launch the contract') || row['humans-get'].includes('unavailable contract')))
    .map((row) => [row.contract, row.direction]));
  const menuGaps = rows.filter((row) => row.surface === 'buildable'
    && row['humans-get'].startsWith('browser menu') && row.direction !== 'equal');
  const independentMenuGaps = menuGaps.filter((row) => reachability.get(row.contract) === 'equal');
  const reachabilityDerivedMenuGaps = menuGaps.filter((row) => reachability.get(row.contract) === 'agent-lacks');
  assert.equal(independentMenuGaps.length + reachabilityDerivedMenuGaps.length, menuGaps.length,
    'every menu gap must be independently attributable or downstream of contract reachability');
  assert.equal(independentMenuGaps.length, 0);
  assert.equal(rows.filter((row) => row.contract === 'the-claim' && row.surface === 'choice'
    && row.direction === 'equal' && `${row['humans-get']} ${row['agents-get']}`.includes('PICK_UPGRADE')).length, 2,
  'ap16-2b pick must be reachable without a contradictory tape row');
  assert.ok(has('the-claim', 'ability', 'BLAST_AT', 'equal'), 'eba8d15ea blast must be reachable');
  assert.ok(has('the-claim', 'ability', 'SET_WEAPON', 'equal'), 'weapon selection must reach the door as an idempotent SET');
  assert.ok(has('the-claim', 'choice', 'SECURE_CHOICE', 'equal'), 'the secure window must reach the door');
  assert.ok(has('the-claim', 'verb', 'CONTEXT_ACTION', 'equal'), 'building context actions must reach the door');
  const audit = JSON.parse(result.stdout);
  assert.deepEqual(audit.tapeExemptions.map(({ actions }) => actions), [
    'death_action', 'research_pick / research_skip', 'set_pause', 'skip_ceremony',
  ]);
  assert.ok(audit.tapeExemptions.every(({ reason, citation }) => reason.length > 20 && citation.length > 5));
});

test('same-game audit also emits a complete markdown table', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /# Same-game audit/);
  assert.match(result.stdout, /\| contract \| surface \| humans-get \| agents-get \| direction \| evidence \|/);
  assert.match(result.stdout, /## New divergence classes beyond the seed/);
  assert.match(result.stdout, /## Worst offenders/);
});
