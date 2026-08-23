import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { deriveRegistry } from './frontier-registry.mjs';

function row(decisions, overrides = {}) {
  return {
    profileName: `Rider ${decisions}`,
    seed: 'e1-the-claim-01',
    submittedAt: 1_787_000_000_000 + decisions,
    assayedAt: 1_787_000_001_000 + decisions,
    assay: 'verified',
    assayHash: `fnv1a32:${String(decisions).padStart(8, '0')}`,
    inputLogHash: String(decisions).padStart(64, '0'),
    waves: 10,
    timeAlive: 300,
    gold: 20,
    baseValue: 40,
    stack: { model: 'test-mind', harness: 'test-rig' },
    tape: { inputLog: { entries: Array.from({ length: decisions }, (_, index) => ({ t: index, a: [{ kind: 'agent_orders' }] })), streams: [] } },
    ...overrides,
  };
}

const key = 'standings:s2:epoch-1-frontier:the-claim';

test('frontier derivation is deterministic and ignores unverified rows', () => {
  const boards = { [key]: [row(10), row(3, { assay: 'pending' }), row(12)] };
  const first = deriveRegistry(boards, null, 'fixture');
  const second = deriveRegistry(boards, first, 'fixture');
  assert.deepEqual(second, first);
  assert.equal(first.frontiers.length, 1);
  assert.equal(first.frontiers[0].surveyor.decisions, 10);
  assert.equal(first.frontiers[0].homesteader, null);
});

test('one leaner verified frontier emits one retained dethronement event', () => {
  const old = deriveRegistry({ [key]: [row(10)] }, null, 'fixture');
  const dethroned = deriveRegistry({ [key]: [row(10), row(8)] }, old, 'fixture');
  assert.equal(dethroned.events.length, 1);
  assert.deepEqual(dethroned.events[0].previous, { profileName: 'Rider 10', decisions: 10 });
  assert.deepEqual(dethroned.events[0].current, { profileName: 'Rider 8', decisions: 8 });
  assert.equal(deriveRegistry({ [key]: [row(10), row(8)] }, dethroned, 'fixture').events.length, 1);
});

test('--check is clean against a seeded board fixture', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gold-rush-frontiers-'));
  try {
    const boards = { [key]: [row(10)] };
    const input = path.join(directory, 'boards.json');
    const artifact = path.join(directory, 'frontiers.json');
    await writeFile(input, JSON.stringify(boards));
    await writeFile(artifact, `${JSON.stringify(deriveRegistry(boards, null, 'fixture'), null, 2)}\n`);
    const checked = spawnSync(process.execPath, [
      'scripts/frontier-registry.mjs', '--input', input, '--output', artifact, '--source-backend', 'fixture', '--check',
    ], { cwd: process.cwd(), encoding: 'utf8' });
    assert.equal(checked.status, 0, checked.stderr);
    assert.match(checked.stdout, /1 frontiers match/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
