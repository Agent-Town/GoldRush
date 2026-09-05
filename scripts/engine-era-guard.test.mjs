import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { engineEraIncludes } from '../src/replay/EngineEraLineage.mjs';
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
  assert.ok(Array.isArray(registry.pins) && registry.pins.length > 0, 'engine era must carry at least one pin');
  for (const pin of registry.pins) {
    assert.match(pin.engineHash, /^[a-f0-9]{64}$/, 'each engine pin must carry a sha256 hash');
    assert.ok(Array.isArray(pin.aliases), 'each engine pin must carry an aliases array');
    pin.aliases.forEach((alias) => assert.match(alias, /^[a-f0-9]{64}$/, 'each engine alias must carry a sha256 hash'));
    assert.equal(new Set(pin.aliases).size, pin.aliases.length, 'aliases within one engine pin must be unique');
    assert.ok(typeof pin.pinnedAt === 'string' && !Number.isNaN(Date.parse(pin.pinnedAt)), 'each engine pin must carry a timestamp');
    assert.ok(typeof pin.cause === 'string' && pin.cause.trim(), 'each engine pin must carry a cause');
  }
  assert.equal(new Set(registry.pins.map(({ engineHash }) => engineHash)).size, registry.pins.length, 'engine pins must be unique');
  assert.equal(registry.engineHash, registry.pins.at(-1).engineHash, 'top-level engineHash must equal the latest pin');
  const actual = await computeEngineHash(root);
  assert.ok(engineEraIncludes(registry, actual),
    `engine hash ${actual} is absent from era ${registry.era}; append a same-era pin with its cause, or bump the era with a fresh pins array`);
  if (previous && registry.era === previous.era) {
    assert.ok(registry.pins.length >= previous.pins.length, 'pins are append-only within an era');
    assert.deepEqual(registry.pins.slice(0, previous.pins.length), previous.pins, 'pins are append-only within an era');
  } else if (previous) {
    assert.equal(registry.era, previous.era + 1, `new era must advance ${previous.era} to ${previous.era + 1}`);
    assert.notEqual(registry.name, previous.name, 'engine hash changed; name the new era');
    assert.notEqual(registry.note, previous.note, 'engine hash changed; note what changed');
    assert.equal(registry.pins.length, 1, 'an era bump starts a fresh pins array');
  }
  return registry;
}

const pin = (engineHash, cause = 'fixture cause', aliases = []) => ({ engineHash, aliases, pinnedAt: '2026-08-24T00:00:00Z', cause });

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
  assert.equal(registry.era, 5);

  const [grSim, replay, worker, game, lanternController] = await Promise.all([
    readFile(path.join(ROOT, 'scripts/gr-sim.mjs'), 'utf8'),
    readFile(path.join(ROOT, 'scripts/assay-replay-agent.mjs'), 'utf8'),
    readFile(path.join(ROOT, 'scripts/assay-worker.mjs'), 'utf8'),
    readFile(path.join(ROOT, 'src/game/Game.ts'), 'utf8'),
    // lantern-true-world-reel-2 (2026-09-05) moved the viewer's era refusal out of Game into the
    // shared LanternController; the contract is that SOME viewer path refuses an unknown pin.
    readFile(path.join(ROOT, 'src/replay/LanternController.ts'), 'utf8'),
  ]);
  assert.match(grSim, /engineHash: await computeEngineHash\(root\), era: engineEra\.era/);
  assert.match(replay, /ssrLoadModule\('\/src\/replay\/AgentTapeReplay\.ts'\)/);
  assert.ok(
    /engineEraIncludes\(engineEra, meta\.engineHash\)/.test(game) || /engineEraIncludes\(engineEra, meta\.engineHash\)/.test(lanternController),
    'the viewer era refusal must live in Game.ts or LanternController.ts',
  );
  assert.match(worker, /engineEraIncludes\(engineEra, tapeEngineHash\)/);
  assert.match(worker, /engine era \$\{engineEra\.era\} '\$\{engineEra\.name\}', tape from era \$\{tapeEra\}/);

  for (const [file, id] of [
    ['artifacts/claude-debut-20260831/claude-opus-ride/attempt-2.tape.json', 'agent-6acf1470'],
    ['artifacts/claude-debut-20260901/claude-fable-baron/attempt-2-tape.json', 'agent-c4ab1b1a-2d1d8622'],
    ['artifacts/claude-debut-20260901/claude-opus-baron/attempt-3-tape.json', 'agent-bb7f6efb'],
  ]) {
    const tape = JSON.parse(await readFile(path.join(ROOT, file), 'utf8'));
    assert.ok(tape.id.startsWith(id), `${id} fixture must stay the intended stored reel`);
    assert.equal(tape.meta.era, registry.era);
    assert.ok(engineEraIncludes(registry, tape.meta.engineHash), `${id} must stay playable in era ${registry.era}`);
  }
});

test('same-era re-pins append, and removing an earlier pin reds', async (t) => {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  const registryPath = path.join(root, REGISTRY);
  await mkdir(path.dirname(registryPath), { recursive: true });
  const baseline = await computeEngineHash(root);
  const previous = { era: 2, name: 'the First Hypot', engineHash: baseline, declaredAt: '2026-08-24', note: 'fixture', pins: [pin(baseline)], history: [] };
  await writeFile(registryPath, `${JSON.stringify(previous, null, 2)}\n`);
  await assertCurrentEra(root);

  await writeFile(path.join(root, 'src/fixture.ts'), 'export const changed = true;\n');
  const changed = await computeEngineHash(root);
  await assert.rejects(assertCurrentEra(root), /absent from era/);

  const repinned = { ...previous, engineHash: changed, pins: [...previous.pins, pin(changed, 'non-behavioural fixture edit')] };
  await writeFile(registryPath, `${JSON.stringify(repinned, null, 2)}\n`);
  await assertCurrentEra(root, previous);

  await writeFile(registryPath, `${JSON.stringify({ ...repinned, pins: [repinned.pins.at(-1)] }, null, 2)}\n`);
  await assert.rejects(assertCurrentEra(root, previous), /pins are append-only within an era/);
});

test('tooling edits stay outside the engine identity while src edits rotate it', async (t) => {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  const baseline = await computeEngineHash(root);
  await writeFile(path.join(root, 'package.json'), '{"probe":true}\n');
  await writeFile(path.join(root, 'package-lock.json'), '{"probe":true}\n');
  await writeFile(path.join(root, 'tsconfig.json'), '{"compilerOptions":{}}\n');
  await writeFile(path.join(root, 'vite.config.ts'), 'export default {}\n');
  assert.equal(await computeEngineHash(root), baseline);
  await writeFile(path.join(root, 'src/fixture.ts'), 'export const changed = true;\n');
  assert.notEqual(await computeEngineHash(root), baseline);
});

test('a new-basis alias keeps its old-basis pin in the current era', async (t) => {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  const registryPath = path.join(root, REGISTRY);
  await mkdir(path.dirname(registryPath), { recursive: true });
  const actual = await computeEngineHash(root);
  const oldBasis = 'f'.repeat(64);
  await writeFile(registryPath, `${JSON.stringify({
    era: 2, name: 'the Dual Basis', engineHash: oldBasis, declaredAt: '2026-08-24', note: 'fixture',
    pins: [pin(oldBasis, 'old basis fixture', [actual])], history: [],
  }, null, 2)}\n`);
  await assertCurrentEra(root);
});

test('an era bump starts a fresh lineage', async (t) => {
  const root = await fixtureRoot();
  t.after(() => rm(root, { recursive: true, force: true }));
  const registryPath = path.join(root, REGISTRY);
  await mkdir(path.dirname(registryPath), { recursive: true });
  const baseline = await computeEngineHash(root);
  const previous = { era: 2, name: 'the First Hypot', engineHash: baseline, declaredAt: '2026-08-24', note: 'fixture', pins: [pin(baseline)], history: [] };
  await writeFile(path.join(root, 'src/fixture.ts'), 'export const changed = true;\n');
  const changed = await computeEngineHash(root);
  const bumped = { era: 3, name: 'the Honest Hypot', engineHash: changed, declaredAt: '2026-08-25', note: 'fixture engine change', pins: [pin(changed)], history: [] };

  await writeFile(registryPath, `${JSON.stringify({ ...bumped, pins: [...previous.pins, ...bumped.pins] }, null, 2)}\n`);
  await assert.rejects(assertCurrentEra(root, previous), /era bump starts a fresh pins array/);
  await writeFile(registryPath, `${JSON.stringify(bumped, null, 2)}\n`);
  await assertCurrentEra(root, previous);
  assert.equal(await computeEngineHash(root), changed, 'writing the out-of-corpus registry must not move the engine hash');
});
