import { chmodSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const PAGE_SIZE = 1_000;

export class SqliteStorage {
  constructor(filename) {
    if (!filename) throw new Error('LEDGER_DB_PATH is required');
    if (filename !== ':memory:') mkdirSync(path.dirname(path.resolve(filename)), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(filename);
    if (filename !== ':memory:') chmodSync(filename, 0o600);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL,
        expires_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS kv_expires_at ON kv(expires_at) WHERE expires_at IS NOT NULL;
    `);
    this.read = this.db.prepare('SELECT value FROM kv WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)');
    this.write = this.db.prepare(`
      INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, expires_at = excluded.expires_at
    `);
    this.remove = this.db.prepare('DELETE FROM kv WHERE key = ?');
    this.removeExpiredKey = this.db.prepare('DELETE FROM kv WHERE key = ? AND expires_at <= ?');
    this.removeExpired = this.db.prepare('DELETE FROM kv WHERE expires_at <= ?');
    this.listPage = this.db.prepare(`
      SELECT key AS name FROM kv
      WHERE substr(key, 1, ?) = ? AND key > ?
      ORDER BY key LIMIT ?
    `);
  }

  async get(key) {
    const now = Date.now();
    const row = this.read.get(key, now);
    if (!row) this.removeExpiredKey.run(key, now);
    return row?.value ?? null;
  }

  async put(key, value, options = {}) {
    const ttl = options.expirationTtl;
    if (ttl !== undefined && (!Number.isSafeInteger(ttl) || ttl < 1)) throw new Error('expirationTtl must be a positive integer');
    const now = Date.now();
    this.removeExpired.run(now);
    this.write.run(key, value, now, ttl === undefined ? null : now + ttl * 1_000);
  }

  async delete(key) {
    this.remove.run(key);
  }

  async list({ prefix = '', cursor = '' } = {}) {
    this.removeExpired.run(Date.now());
    const rows = this.listPage.all(prefix.length, prefix, cursor, PAGE_SIZE + 1);
    const keys = rows.slice(0, PAGE_SIZE);
    const list_complete = rows.length <= PAGE_SIZE;
    return { keys, list_complete, ...(list_complete ? {} : { cursor: keys.at(-1).name }) };
  }

  close() {
    this.db.close();
  }
}
