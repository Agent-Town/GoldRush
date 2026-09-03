import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const renderer = path.join(root, 'scripts/render-skillmd-contracts.mjs');
const skill = readFileSync(path.join(root, 'public/skill.md'), 'utf8');
const receipts = JSON.parse(readFileSync(path.join(root, 'assets/contracts/winnability-receipts.json'), 'utf8')).contracts;

test('skill.md contract list matches its sources', () => {
  const result = runRenderer();
  assert.equal(result.status, 0, result.stderr);
});

test('every door contract appears once with one receipt marker', () => {
  const section = /<!-- contracts:begin -->([\s\S]*?)<!-- contracts:end -->/.exec(skill)?.[1];
  assert.ok(section, 'skill.md contract fence not found');
  const ids = JSON.parse(/<!-- skillmd-guard:door-contracts:start -->\s*```json\s*([\s\S]*?)\s*```/.exec(section)?.[1] ?? 'null');
  const rows = [...section.matchAll(/^- `([^`]+)` \| bench seeds: .* \| (.+)$/gm)];
  const byId = new Map();
  for (const [, id, marker] of rows) {
    assert.ok(!byId.has(id), `${id}: duplicate marked contract line`);
    assert.match(marker, /^(?:unclaimed|first secured by .+ \(.+\) on \d{4}-\d{2}-\d{2})$/, `${id}: invalid marker`);
    byId.set(id, marker);
  }
  assert.deepEqual([...byId.keys()].sort(), [...ids].sort());

  const expected = counts(receipts);
  const actual = counts(receipts.map((receipt) => ({
    epochId: receipt.epochId,
    status: byId.get(receipt.contractId) === 'unclaimed' ? 'unclaimed' : 'claimed',
  })));
  assert.deepEqual(actual, expected);
});

test('the contract guard BITES a hand-edited marker', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'skillmd-contracts-'));
  const drifted = path.join(dir, 'skill.md');
  try {
    const changed = skill.replace('| unclaimed', '| claimed by nobody');
    assert.notEqual(changed, skill, 'no unclaimed marker available for the mutation proof');
    writeFileSync(drifted, changed);
    const result = runRenderer({ SKILLMD_PATH: drifted });
    assert.notEqual(result.status, 0, 'a hand-edited marker did not red the renderer check');
    assert.match(result.stderr, /contract list is stale/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function runRenderer(env = {}) {
  return spawnSync(process.execPath, [renderer, '--check'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function counts(rows) {
  const result = {};
  for (const { epochId, status } of rows) {
    result[epochId] ??= { claimed: 0, unclaimed: 0 };
    result[epochId][status] += 1;
  }
  return result;
}
