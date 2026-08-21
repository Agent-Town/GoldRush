import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PLAYER = 'scripts/gr-sim-campaign.fixture-player.mjs';

test('FakeStorage threads research into the headless sim without moving the cold hash', async () => {
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  const previous = Object.fromEntries(
    ['location', 'localStorage', 'window'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  try {
    const { FakeStorage } = await vite.ssrLoadModule('/src/sim/FakeStorage.ts');
    const location = new URL('http://campaign-test.local/?debug&contract=e1-dry-gulch');
    const install = (storage) => {
      globalThis.location = location;
      globalThis.localStorage = storage;
      globalThis.window = { location, localStorage: storage };
    };
    install(new FakeStorage());
    const [{ HeadlessContractSim }, profile, research] = await Promise.all([
      vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
      vite.ssrLoadModule('/src/game/ProfileStorage.ts'),
      vite.ssrLoadModule('/src/meta/ResearchTree.ts'),
    ]);
    const run = (storage) => {
      install(storage);
      const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'bench-001' }, storage ? { storage } : {});
      let turn = sim.currentTurn();
      while (!turn.terminal) {
        assert.equal(sim.submitOrders([]).outcome.ok, true);
        turn = sim.advanceToTurn();
      }
      return sim.outcome();
    };

    const defaultOutcome = run(null);
    const emptyOutcome = run(new FakeStorage());
    assert.equal(emptyOutcome.eventLogHash, defaultOutcome.eventLogHash);

    const seeded = new FakeStorage();
    install(seeded);
    profile.activeProfile(seeded);
    const state = research.loadResearchState(seeded, seeded);
    research.saveResearchState(seeded, { ...state, taken: ['pact_ledger'] }, seeded);
    const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'research-read' }, { storage: seeded });
    assert.ok(sim.diagnostics().progression.eligibility.includes('rich_seam_pact'));
  } finally {
    await vite.close();
    restoreGlobal('location', previous.location);
    restoreGlobal('localStorage', previous.localStorage);
    restoreGlobal('window', previous.window);
  }
});

test('campaign walks E1 legally, persists each leg, and hashes deterministically', async () => {
  const first = await runCampaign();
  const second = await runCampaign();
  try {
    assert.deepEqual(first.artifact.legs.map(({ contractId }) => contractId), [
      'the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron',
    ]);
    assert.equal(first.artifact.legs[2].outcome.waves, 25);
    assert.equal(first.artifact.campaignHash, second.artifact.campaignHash);
    assert.equal(first.artifact.campaignHash, 'fnv1a32:4f363fd5');
    for (let index = 1; index < first.artifact.legs.length; index += 1) {
      assert.equal(first.artifact.legs[index].startStateHash, first.artifact.legs[index - 1].stateHash);
    }
    assert.equal(first.files.filter((name) => /^\d\d-/.test(name)).length, 5);
  } finally {
    await rm(first.dir, { recursive: true });
    await rm(second.dir, { recursive: true });
  }
});

test('a killed campaign resumes from its last profile checkpoint', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'gr-campaign-resume-'));
  const checkpoint = join(dir, 'checkpoint.json');
  const child = spawn(process.execPath, [
    'scripts/gr-sim-campaign.mjs', '--player', PLAYER, '--test-fixture', '--output', join(dir, 'first'),
    '--checkpoint', checkpoint,
  ], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_ENV: 'test' } });
  let buffer = '';
  await new Promise((resolve, reject) => {
    let gotCheckpoint = false;
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      if (!gotCheckpoint && buffer.includes('\n')) {
        gotCheckpoint = true;
        child.kill('SIGTERM');
        resolve();
      }
    });
    child.on('error', reject);
    child.once('close', (code) => {
      if (!gotCheckpoint) reject(new Error(`campaign exited ${code} before its first checkpoint: ${buffer}`));
    });
  });
  await new Promise((resolve) => child.once('close', resolve));

  const saved = JSON.parse(await readFile(checkpoint, 'utf8'));
  assert.equal(saved.campaign.legs.length, 1);
  assert.equal(saved.campaign.legs[0].contractId, 'the-claim');
  assert.equal(saved.data['gr.scores.v2'][0].secured, true);
  assert.equal(saved.data['gr.research.epoch-1-frontier.v1'].taken.length, 2);

  const resumed = spawnSync(process.execPath, [
    'scripts/gr-sim-campaign.mjs', '--player', PLAYER, '--test-fixture', '--output', join(dir, 'resumed'),
    '--checkpoint', checkpoint, '--resume', checkpoint,
  ], { cwd: ROOT, encoding: 'utf8', timeout: 120_000, env: { ...process.env, NODE_ENV: 'test' } });
  assert.equal(resumed.status, 0, resumed.stderr);
  const messages = resumed.stdout.trim().split('\n').map(JSON.parse);
  assert.equal(messages[0].contractId, 'e1-dry-gulch');
  assert.equal(messages.at(-1).legs.length, 5);
  assert.equal(messages.at(-1).campaignHash, 'fnv1a32:4f363fd5');
  assert.equal(messages[0].startStateHash, saved.campaign.legs[0].stateHash);
  const { readdir } = await import('node:fs/promises');
  assert.equal((await readdir(join(dir, 'resumed'))).filter((name) => /^\d\d-/.test(name)).length, 5);
  await rm(dir, { recursive: true });
});

test('--contract selects exactly one named contract', async () => {
  const run = await runContract('the-claim');
  try {
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(await readFile(join(run.output, 'campaign.json'), 'utf8')).legs.map(({ contractId }) => contractId), ['the-claim']);
  } finally {
    await rm(run.dir, { recursive: true });
  }
});

test('--contract refuses unknown, unseeded, and locked contracts loudly', async () => {
  const cases = [
    ['not-a-contract', 'Contract "not-a-contract" is not on the board.'],
    ['e5-stillwater', 'Contract "e5-stillwater" has no pinned bench seed.'],
    ['e3-canyon-works', 'Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.'],
  ];
  for (const [contractId, message] of cases) {
    const run = await runContract(contractId);
    try {
      assert.notEqual(run.status, 0);
      assert.match(run.stderr, new RegExp(`${escapeRegExp(message)}(?:\\n|$)`));
    } finally {
      await rm(run.dir, { recursive: true });
    }
  }
});

test('--contract refuses an empty selector instead of falling back', async () => {
  const run = await runContract('');
  try {
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /--contract requires an id\./);
  } finally {
    await rm(run.dir, { recursive: true });
  }
});

async function runCampaign() {
  const dir = await mkdtemp(join(tmpdir(), 'gr-campaign-'));
  const output = join(dir, 'out');
  const run = spawnSync(process.execPath, [
    'scripts/gr-sim-campaign.mjs', '--player', PLAYER, '--test-fixture', '--output', output,
    '--checkpoint', join(dir, 'checkpoint.json'),
  ], { cwd: ROOT, encoding: 'utf8', timeout: 120_000, env: { ...process.env, NODE_ENV: 'test' } });
  assert.equal(run.status, 0, run.stderr);
  const { readdir } = await import('node:fs/promises');
  return {
    dir,
    files: await readdir(output),
    artifact: JSON.parse(await readFile(join(output, 'campaign.json'), 'utf8')),
  };
}

async function runContract(contractId) {
  const dir = await mkdtemp(join(tmpdir(), 'gr-campaign-contract-'));
  const output = join(dir, 'out');
  const run = spawnSync(process.execPath, [
    'scripts/gr-sim-campaign.mjs', '--player', PLAYER, '--test-fixture', '--contract', contractId, '--output', output,
    '--checkpoint', join(dir, 'checkpoint.json'),
  ], { cwd: ROOT, encoding: 'utf8', timeout: 120_000, env: { ...process.env, NODE_ENV: 'test' } });
  return { ...run, dir, output };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function restoreGlobal(key, value) {
  if (value === undefined) delete globalThis[key];
  else Object.defineProperty(globalThis, key, value);
}
