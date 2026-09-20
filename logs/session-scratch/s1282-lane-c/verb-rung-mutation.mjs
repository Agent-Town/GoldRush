import { strict as assert } from 'node:assert';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = resolve(import.meta.dirname, '../../..');
const temp = mkdtempSync(resolve(tmpdir(), 'agent-verb-rungs-'));
const subject = 'src/agent/StandingOrders.ts';
const files = [
  subject,
  'src/agent/AgentConsent.ts',
  'src/agent/ToolSurface.ts',
  'scripts/agent-rung-conformance.test.mjs',
];

function run(name, replacement, expected) {
  for (const file of files) {
    const target = resolve(temp, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repo, file), target);
  }
  if (replacement) {
    const path = resolve(temp, subject);
    const source = readFileSync(path, 'utf8');
    const mutated = replacement(source);
    assert.notEqual(mutated, source, `${name} did not mutate the temp copy`);
    writeFileSync(path, mutated);
  }
  const result = spawnSync(process.execPath, ['--test', resolve(temp, 'scripts/agent-rung-conformance.test.mjs')], {
    cwd: temp,
    encoding: 'utf8',
  });
  console.log(`${name} rc=${result.status}`);
  if (result.status !== expected) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exitCode = 1;
  }
}

try {
  run('MUT-HARVEST-3', (source) => source.replace("order.verb === 'HARVEST') return 2", "order.verb === 'HARVEST') return 3"), 1);
  run('MUT-BUILD-2', (source) => source.replace("order.verb === 'BUILD') return 3", "order.verb === 'BUILD') return 2"), 1);
  run('MUT-HARVEST-DELETED', (source) => source.replace("  if (order.verb === 'HARVEST') return 2;\n", ''), 1);
  run('CONTROL-RESTORED', null, 0);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
