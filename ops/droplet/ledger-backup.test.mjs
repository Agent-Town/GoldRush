import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { backupDatabase, pruneLocalBackups } from './ledger-backup.mjs';
import { SqliteStorage } from '../../server/ledger/storage.mjs';

test('VACUUM INTO backup restores byte-identical ledger rows', async (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gold-rush-ledger-restore-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const sourcePath = path.join(directory, 'ledger.db');
  const backupPath = path.join(directory, 'ledger-2026-08-23.db');
  const expected = new Map([
    ['standing:one', JSON.stringify({ rider: 'Robin', score: 41 })],
    ['assay:two', JSON.stringify({ verdict: 'verified', hash: 'fnv1a32:8fda13d2' })],
  ]);

  const source = new SqliteStorage(sourcePath);
  for (const [key, value] of expected) await source.put(key, value);
  const sourceRows = source.db.prepare('SELECT * FROM kv ORDER BY key').all();
  source.close();

  writeFileSync(`${backupPath}.partial`, 'interrupted prior attempt');
  backupDatabase(sourcePath, backupPath);

  assert.equal(existsSync(`${backupPath}.partial`), false);
  const restored = new SqliteStorage(backupPath);
  for (const [key, value] of expected) assert.equal(await restored.get(key), value);
  assert.deepEqual(restored.db.prepare('SELECT * FROM kv ORDER BY key').all(), sourceRows);
  restored.close();
});

test('rotation deletes only dated ledger backups older than 14 days', (t) => {
  const directory = mkdtempSync(path.join(tmpdir(), 'gold-rush-ledger-prune-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const name of ['ledger-2026-08-08.db', 'ledger-2026-08-09.db', 'ledger-not-a-date.db', 'county-notes.txt']) {
    writeFileSync(path.join(directory, name), name);
  }

  pruneLocalBackups(directory, new Date('2026-08-23T12:00:00Z'));

  assert.equal(existsSync(path.join(directory, 'ledger-2026-08-08.db')), false);
  for (const name of ['ledger-2026-08-09.db', 'ledger-not-a-date.db', 'county-notes.txt']) {
    assert.equal(existsSync(path.join(directory, name)), true);
  }
});
