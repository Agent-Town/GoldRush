import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sha = (value) => createHash('sha256').update(value).digest('hex');

test('bootstrap dry-run validates locally and cannot call fetch', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gr-bootstrap-dry-run-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = path.join(directory, 'accounts.json');
  const guard = path.join(directory, 'no-network.mjs');
  await writeFile(guard, "globalThis.fetch = () => { throw new Error('NETWORK_FORBIDDEN'); };\n");
  const account = { version: 1, accountId: '1'.repeat(32), email: 'fixture@example.com', emailHash: sha('fixture@example.com'), createdAt: '2026-07-01T00:00:00Z' };
  const run = async (accounts, count = accounts.length, flags = ['--dry-run']) => {
    const bytes = JSON.stringify(accounts);
    await writeFile(filename, bytes, { mode: 0o600 });
    const result = spawnSync(process.execPath, ['--import', guard, path.join(ROOT, 'scripts/bootstrap-account-registry.mjs'), filename, String(count), ...flags], {
      encoding: 'utf8', env: { ...process.env, ACCOUNT_REGISTRY_URL: 'https://never-contact.invalid', ACCOUNT_REGISTRY_MIGRATION_SECRET: '', ACCOUNT_REGISTRY_SCOPE: '' },
    });
    assert.equal(await readFile(filename, 'utf8'), bytes, 'dry-run never modifies the export');
    assert.doesNotMatch(result.stderr, /NETWORK_FORBIDDEN/);
    return result;
  };
  for (const accounts of [[], [account]]) {
    const result = await run(accounts);
    assert.equal(result.status, 0, result.stderr);
    const receipt = JSON.parse(result.stdout);
    assert.equal(receipt.dryRun, true);
    assert.equal(receipt.accounts, accounts.length);
    assert.equal(receipt.digest, sha(JSON.stringify(accounts)));
    assert.equal(receipt.ready, undefined, 'dry-run is not a readiness receipt');
    assert.doesNotMatch(result.stdout, /fixture@example/);
  }
  for (const [accounts, count] of [
    [[account], 0], [[{ ...account, emailHash: 'bad' }], 1], [[account, account], 2],
    [[account, { ...account, email: 'second@example.com', emailHash: sha('second@example.com') }], 2],
    [Array(1001).fill(account), 1001], [[{ ...account, extension: 'x'.repeat(1_048_576) }], 1],
  ]) assert.notEqual((await run(accounts, count)).status, 0, 'invalid export must fail offline');
  assert.notEqual((await run([], 0, [])).status, 0, 'live mode requires --source-quiesced');
});
