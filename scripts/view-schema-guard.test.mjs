import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

import { computeEngineHash, ENGINE_SOURCE_INPUTS } from './assay-replay-agent.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const REGISTRY = 'assets/engine-era.json';

export function assertViewSchema(registry, actualFields, previous = null) {
  const schema = registry.viewSchema;
  assert.ok(schema && Number.isSafeInteger(schema.version) && schema.version > 0, 'view schema version must be a positive integer');
  assert.ok(Array.isArray(schema.fields) && schema.fields.every((field) => typeof field === 'string' && field), 'view schema fields must be non-empty strings');
  assert.deepEqual(schema.fields, [...new Set(schema.fields)].sort(), 'view schema fields must be sorted and unique');
  assert.deepEqual(actualFields, schema.fields, 'view fields changed: removed/renamed fields are forbidden; additions require a registry entry and version bump');

  if (!previous?.viewSchema) {
    assert.equal(schema.version, 1, 'the first view schema version must be 1');
    return;
  }

  const removed = previous.viewSchema.fields.filter((field) => !schema.fields.includes(field));
  assert.deepEqual(removed, [], `view fields are additive-only; removed or renamed: ${removed.join(', ')}`);
  const added = schema.fields.filter((field) => !previous.viewSchema.fields.includes(field));
  assert.ok(schema.version >= previous.viewSchema.version, 'view schema version must not decrease');
  if (added.length && registry.era === previous.era) {
    assert.equal(schema.version, previous.viewSchema.version + 1, `added view fields require version ${previous.viewSchema.version + 1}`);
  }
}

function fieldPaths(view) {
  const paths = [];
  const walk = (value, prefix) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    for (const key of Object.keys(value).sort()) {
      const field = `${prefix}.${key}`;
      paths.push(field);
      walk(value[key], field);
    }
  };
  for (const key of Object.keys(view).sort()) {
    paths.push(key);
    if (key === 'now' || key === 'stablePrefix') walk(view[key], key);
  }
  return paths.sort();
}

async function canonicalView() {
  globalThis.location = new URL('http://view-schema.local/?contract=the-claim&seed=view-schema-v1');
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { buildView } = await vite.ssrLoadModule('/src/agent/View.ts');
    return buildView({ diagnostics: () => ({
      contract: { activeId: 'the-claim' }, run: {}, economy: { gold: 0 }, hp: 100, maxHp: 100,
      heroPos: { x: 0, z: 12 }, build: { hp: [] }, harvest: { activeNodes: [] },
      wave: 0, timeAlive: 0, enemiesAlive: 0, nextWaveInSim: 10,
    }) });
  } finally {
    await vite.close();
  }
}

async function previousRegistry(currentText) {
  const atHead = spawnSync('git', ['show', `HEAD:${REGISTRY}`], { cwd: ROOT, encoding: 'utf8' });
  if (atHead.status === 0 && atHead.stdout !== currentText) return JSON.parse(atHead.stdout);
  const atParent = spawnSync('git', ['show', `HEAD^:${REGISTRY}`], { cwd: ROOT, encoding: 'utf8' });
  return atParent.status === 0 ? JSON.parse(atParent.stdout) : null;
}

async function engineFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'view-schema-hash-'));
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

test('the canonical rider view matches the additive versioned registry', async () => {
  const registryText = await readFile(path.join(ROOT, REGISTRY), 'utf8');
  const registry = JSON.parse(registryText);
  const view = await canonicalView();
  assert.equal(view.viewVersion, registry.viewSchema.version);
  assertViewSchema(registry, fieldPaths(view), await previousRegistry(registryText));

  const skill = await readFile(path.join(ROOT, 'public/skill.md'), 'utf8');
  assert.match(skill, new RegExp(`Current view schema version: \\*\\*${registry.viewSchema.version}\\*\\*\\.`));
}
);

test('view-schema mutation proofs: removal reds, unbumped addition reds, bumped addition greens', () => {
  const previous = { era: 5, viewSchema: { version: 1, fields: ['now', 'schema'] } };
  assert.throws(() => assertViewSchema({ era: 5, viewSchema: { version: 1, fields: ['schema'] } }, ['schema'], previous), /removed or renamed: now/);
  assert.throws(() => assertViewSchema({ era: 5, viewSchema: { version: 1, fields: ['now', 'now.gold', 'schema'] } }, ['now', 'now.gold', 'schema'], previous), /require version 2/);
  assert.doesNotThrow(() => assertViewSchema({ era: 5, viewSchema: { version: 2, fields: ['now', 'now.gold', 'schema'] } }, ['now', 'now.gold', 'schema'], previous));
});

test('editing viewSchema does not rotate computeEngineHash', async (t) => {
  const root = await engineFixture();
  t.after(() => rm(root, { recursive: true, force: true }));
  const before = await computeEngineHash(root);
  await mkdir(path.join(root, 'assets'), { recursive: true });
  await writeFile(path.join(root, REGISTRY), '{"viewSchema":{"version":1,"fields":[]}}\n');
  const after = await computeEngineHash(root);
  assert.equal(after, before);
});
