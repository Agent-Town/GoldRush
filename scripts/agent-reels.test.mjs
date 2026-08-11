import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

const hold = { verb: 'HOLD', pos: { x: 0, z: 12 } };

test('agent reel validation reuses the door bounds and CLI tapes are byte deterministic', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
    const tape = fixture(Array(32).fill(hold));
    assert.ok(validateTape(tape, tape.contract, tape.seed, tape.difficulty));
    assert.equal(validateTape(fixture(Array(33).fill(hold)), tape.contract, tape.seed, tape.difficulty), null);
    assert.equal(validateTape(fixture([{ verb: 'HOLD', pos: { x: Number.NaN, z: 12 } }]), tape.contract, tape.seed, tape.difficulty), null);
    const moving = fixture([hold]);
    moving.inputLog.entries[0].mx = 1;
    assert.equal(validateTape(moving, tape.contract, tape.seed, tape.difficulty), null);
  } finally {
    await vite.close();
  }

  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-agent-reels-'));
  const first = join(directory, 'first.json');
  const second = join(directory, 'second.json');
  const input = `${JSON.stringify([hold])}\n${Array(20).fill('null').join('\n')}\n`;
  for (const [output, prefix] of [[first, `${JSON.stringify([{ verb: 'NOPE' }])}\n`], [second, '']]) {
    const run = spawnSync(process.execPath, [
      'scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--tape', output,
    ], { encoding: 'utf8', input: prefix + input, timeout: 30_000 });
    assert.equal(run.status, 0, run.stderr);
  }
  assert.equal(readFileSync(second, 'utf8'), readFileSync(first, 'utf8'));
});

function fixture(orders) {
  return {
    version: 1,
    id: 'agent-reel-test',
    createdAt: 0,
    kept: true,
    contract: 'the-claim',
    seed: 'e1-the-claim-01',
    difficulty: 'trail',
    simVersion: 1,
    inputLog: {
      version: 1,
      name: 'agent-reel-test',
      contractId: 'the-claim',
      seed: 'e1-the-claim-01',
      difficultyPreset: 'trail',
      stepSeconds: 1 / 30,
      start: { x: 0, z: 12 },
      durationTicks: 2,
      entries: [{ t: 0, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders }] }],
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash: 'fnv1a32:00000000',
    outcome: { reason: 'death', secured: false, waves: 0, timeAlive: 0, gold: 0 },
  };
}
