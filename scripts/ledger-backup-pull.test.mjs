import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./ledger-backup-pull.mjs', import.meta.url));

test('dry run prints a bounded plan without contacting the droplet', () => {
  const result = spawnSync(process.execPath, [script, '--dry-run'], { encoding: 'utf8', timeout: 2_000 });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /5s connect timeout/);
  assert.match(result.stdout, /would rsync/);
});

test("today's local backup makes the pull an offline no-op", (t) => {
  const destination = mkdtempSync(path.join(tmpdir(), 'gold-rush-ledger-pull-'));
  t.after(() => rmSync(destination, { recursive: true, force: true }));
  const name = `ledger-${new Date().toISOString().slice(0, 10)}.db`;
  writeFileSync(path.join(destination, name), 'already mirrored');
  const result = spawnSync(process.execPath, [script], {
    encoding: 'utf8', timeout: 2_000, env: { ...process.env, LEDGER_BACKUP_DEST: destination },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /already present for today/);
});
