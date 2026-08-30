import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { computeEngineHash, ENGINE_SOURCE_INPUTS } from './assay-replay-agent.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REGISTRY = 'assets/engine-era.json';

async function readRegistry(root) {
  return JSON.parse(await readFile(path.join(root, REGISTRY), 'utf8'));
}

async function assertCurrentEra(root, previous = null) {
  const registry = await readRegistry(root);
  assert.ok(Number.isSafeInteger(registry.era) && registry.era > 0, 'engine era must be a positive integer');
  assert.ok(typeof registry.name === 'string' && registry.name.trim(), 'engine era must have a name');
  assert.ok(typeof registry.note === 'string' && registry.note.trim(), 'engine era must have a note');
  const actual = await computeEngineHash(root);
  assert.equal(actual, registry.engineHash,
    `engine hash changed from ${registry.engineHash} to ${actual}; bump era, name it, note what changed -- in the same commit`);
  if (previous && previous.engineHash !== registry.engineHash) {
    assert.equal(registry.era, previous.era + 1, `engine hash changed; bump era ${previous.era} to ${previous.era + 1}`);
    assert.notEqual(registry.name, previous.name, 'engine hash changed; name the new era');
    assert.notEqual(registry.note, previous.note, 'engine hash changed; note what changed');
  }
  return registry;
}

async function fixtureRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'engine-era-guard-'));
  for (const input of ENGINE_SOURCE_INPUTS) {
    const target = path.join(root, input);
    if (path.extname(input)) {
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, `${input}\n`);
    } else {
      await mkdir(target, { recursive: true });
      await writeFile(path.join(target, input === 'src' ? 'fixture.ts' : 'fixture.json'), '{}\n');
    }
  }
  return root;
}

test('the landed registry names the live engine and stays outside its hash corpus', async () => {
  for (const input of ENGINE_SOURCE_INPUTS) {
    assert.ok(path.relative(input, REGISTRY).startsWith('..'), `${REGISTRY} must stay outside ${input}`);
  }
  const registry = await assertCurrentEra(ROOT);
  assert.equal(registry.era, 4);

  const [grSim, replay, worker] = await Promise.all([
    readFile(path.join(ROOT, 'scripts/gr-sim.mjs'), 'utf8'),
    readFile(path.join(ROOT, 'scripts/assay-replay-agent.mjs'), 'utf8'),
    readFile(path.join(ROOT, 'scripts/assay-worker.mjs'), 'utf8'),
  ]);
  assert.match(grSim, /engineHash: await computeEngineHash\(root\), era: engineEra\.era/);
  assert.match(replay, /ssrLoadModule\('\/src\/replay\/AgentTapeReplay\.ts'\)/);
  assert.match(worker, /engine era \$\{engineEra\.era\} '\$\{engineEra\.name\}', tape from era \$\{tapeEra\}/);
});

test('an undeclared engine edit reds, then the same edit with an era bump greens stably', async (t) => {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  const registryPath = path.join(root, REGISTRY);
  await mkdir(path.dirname(registryPath), { recursive: true });
  const baseline = await computeEngineHash(root);
  const previous = { era: 2, name: 'the First Hypot', engineHash: baseline, declaredAt: '2026-08-24', note: 'fixture', history: [] };
  await writeFile(registryPath, `${JSON.stringify(previous, null, 2)}\n`);
  await assertCurrentEra(root);

  await writeFile(path.join(root, 'src/fixture.ts'), 'export const changed = true;\n');
  const changed = await computeEngineHash(root);
  await assert.rejects(assertCurrentEra(root), /bump era, name it, note what changed -- in the same commit/);

  await writeFile(registryPath, `${JSON.stringify({ ...previous, engineHash: changed }, null, 2)}\n`);
  await assert.rejects(assertCurrentEra(root, previous), /bump era 2 to 3/);

  await writeFile(registryPath, `${JSON.stringify({ era: 3, name: 'the Honest Hypot', engineHash: changed, declaredAt: '2026-08-25', note: 'fixture engine change', history: [] }, null, 2)}\n`);
  await assertCurrentEra(root, previous);
  await writeFile(registryPath, `${JSON.stringify({ era: 3, name: 'the Honest Hypot', engineHash: changed, declaredAt: '2026-08-25', note: 'registry-only edit', history: [] }, null, 2)}\n`);
  assert.equal(await computeEngineHash(root), changed, 'writing the out-of-corpus registry must not move the engine hash');
  await assertCurrentEra(root);
});
