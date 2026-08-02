import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PROBE = fileURLToPath(new URL('./twin-banks-hash-probe.mjs', import.meta.url));
const interpreters = [
  '/opt/homebrew/bin/node',
  join(homedir(), '.nvm/versions/node/v23.11.1/bin/node'),
].filter(existsSync);

test('the Claim hash is identical across installed Node engines', {
  skip: interpreters.length < 2 ? 'a second Node interpreter is not installed' : false,
  timeout: 60_000,
}, () => {
  const hashes = interpreters.map((node) => {
    const run = spawnSync(node, [PROBE, '--contract', 'the-claim', '--seed', 'e1-the-claim-01'], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30_000,
    });
    assert.equal(run.status, 0, `${node}: ${run.stderr}`);
    const hash = run.stdout.match(/^HASH\s+:\s+(fnv1a32:[0-9a-f]+)$/m)?.[1];
    assert.ok(hash, `${node}: hash missing from probe output`);
    return hash;
  });
  assert.equal(new Set(hashes).size, 1, hashes.join(' !== '));
});
