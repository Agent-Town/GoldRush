import { chmodSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const PAGE_SIZE = 1_000;

// kv-counters-to-ledger-1: the ONE statement that forgets an expired row, shared by this store's own
// opportunistic sweep and the nightly sweep in ops/droplet/ledger-backup.mjs, so the two can never
// disagree about what "expired" means. A bug report's 90-day `expirationTtl` (SEC-7) lives here as the
// row's `expires_at`; reads already treat an expired row as absent, and this is what removes it.
const SWEEP_EXPIRED_SQL = 'DELETE FROM kv WHERE expires_at IS NOT NULL AND expires_at <= ?';

export function sweepExpiredRows(db, now = Date.now()) {
  return Number(db.prepare(SWEEP_EXPIRED_SQL).run(now).changes);
}

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
      CREATE TABLE IF NOT EXISTS refusals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason TEXT NOT NULL,
        contract_id TEXT NOT NULL,
        anon_id TEXT NOT NULL,
        profile_name TEXT NOT NULL,
        refused_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS refusals_anon_time ON refusals(anon_id, refused_at DESC);
      CREATE INDEX IF NOT EXISTS refusals_profile_time ON refusals(profile_name, refused_at DESC);
    `);
    this.read = this.db.prepare('SELECT value FROM kv WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)');
    this.write = this.db.prepare(`
      INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, expires_at = excluded.expires_at
    `);
    // SEC-1 (outside review 2026-09-24, re-measured the same day): the sign-in guess counter was
    // read, awaited across a KV read plus a SHA-256 digest, then written back, so every caller in a
    // burst read the same number and the last write won. Measured on this tree before the fix: 50 of
    // 50 parallel wrong guesses were digest-compared against a budget of 5, the stored counter ended
    // at 1, and the real code was still accepted afterwards. One statement now counts the guess and
    // hands back the number it produced, so no two callers can be handed the same count: SQLite's
    // own write lock serialises them, across connections and processes as well as awaits.
    // The window is NOT re-armed on conflict (`expires_at` keeps the existing row's value): the
    // budget runs for one TTL from the first counted guess, so a flood cannot extend a victim's
    // lockout by continuing to knock.
    this.bump = this.db.prepare(`
      INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, '1', ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = CAST(MAX(CAST(kv.value AS INTEGER), 0) + 1 AS TEXT),
        updated_at = excluded.updated_at
      RETURNING value
    `);
    // kv-counters-to-ledger-1: the telemetry aggregates, moved here from the shared KV namespace, are
    // PERMANENT counters (`telemetry:runs:total` and its siblings never expire), so they take their own
    // statements instead of widening `increment`, whose refusal of a counter with no window is a SEC-1
    // property its test pins. Same shape as `bump`: one statement counts and hands back the count, so
    // two beacons in flight together cannot lose one of their increments to a last-writer-wins race.
    this.tallyStatement = this.db.prepare(`
      INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, '1', ?, NULL)
      ON CONFLICT(key) DO UPDATE SET
        value = CAST(MAX(CAST(kv.value AS INTEGER), 0) + 1 AS TEXT),
        updated_at = excluded.updated_at
      RETURNING value
    `);
    // A permanent maximum (`telemetry:waves:max`): the row only moves when the offered value is larger.
    this.raiseStatement = this.db.prepare(`
      INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, NULL)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      WHERE CAST(kv.value AS INTEGER) < CAST(excluded.value AS INTEGER)
    `);
    this.remove = this.db.prepare('DELETE FROM kv WHERE key = ?');
    this.removeExpiredKey = this.db.prepare('DELETE FROM kv WHERE key = ? AND expires_at <= ?');
    this.removeExpired = this.db.prepare(SWEEP_EXPIRED_SQL);
    this.listPage = this.db.prepare(`
      SELECT key AS name FROM kv
      WHERE substr(key, 1, ?) = ? AND key > ?
      ORDER BY key LIMIT ?
    `);
    this.insertRefusal = this.db.prepare(`
      INSERT INTO refusals (reason, contract_id, anon_id, profile_name, refused_at)
      VALUES (?, ?, ?, ?, ?)
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

  // Atomic counter: returns the count THIS call produced (1 for the first), so a caller refuses on
  // its own number and never on a number a concurrent caller might also have seen. An expired row
  // is swept first, exactly as `put` does, so a stale count never carries into a fresh window.
  async increment(key, ttlSeconds) {
    if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1) throw new Error('expirationTtl must be a positive integer');
    const now = Date.now();
    this.removeExpired.run(now);
    return Number(this.bump.get(key, now, now + ttlSeconds * 1_000).value);
  }

  // Permanent atomic counter: +1, returning the count this call produced. No window, by design (see
  // the statement above); a rate limit must use `increment`, which demands one.
  async tally(key) {
    const now = Date.now();
    this.removeExpired.run(now);
    return Number(this.tallyStatement.get(key, now).value);
  }

  // Permanent atomic maximum: keeps the larger of the stored and the offered integer.
  async raise(key, value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('raise needs a non-negative integer');
    const now = Date.now();
    this.removeExpired.run(now);
    this.raiseStatement.run(key, String(value), now);
  }

  async resolveAccount(candidate) {
    const key = `account:${candidate.emailHash}`;
    // The unique key chooses the winner across connections/processes, not a JS mutex.
    this.db.prepare('INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, NULL) ON CONFLICT(key) DO NOTHING')
      .run(key, JSON.stringify(candidate), Date.now());
    return JSON.parse(this.read.get(key, Date.now())?.value ?? 'null');
  }

  async retireAccount(emailHash, accountId) {
    return this.db.prepare("DELETE FROM kv WHERE key = ? AND json_extract(value, '$.accountId') = ?")
      .run(`account:${emailHash}`, accountId).changes === 1;
  }

  // `limit` mirrors Cloudflare KV's list option (kv-counters-to-ledger-1: the bug office pages by it);
  // absent, the page is PAGE_SIZE as before, and it never exceeds PAGE_SIZE.
  async list({ prefix = '', cursor = '', limit = PAGE_SIZE } = {}) {
    const size = Number.isSafeInteger(limit) && limit >= 1 ? Math.min(limit, PAGE_SIZE) : PAGE_SIZE;
    this.removeExpired.run(Date.now());
    const rows = this.listPage.all(prefix.length, prefix, cursor, size + 1);
    const keys = rows.slice(0, size);
    const list_complete = rows.length <= size;
    return { keys, list_complete, ...(list_complete ? {} : { cursor: keys.at(-1).name }) };
  }

  async recordRefusal(record) {
    this.insertRefusal.run(record.reason, record.contractId, record.anonId, record.profileName, record.refusedAt);
  }

  async readRefusals({ rider, profile, limit }) {
    const column = rider ? 'anon_id' : 'profile_name';
    const value = rider ?? profile;
    const counts = Object.fromEntries(this.db.prepare(`
      SELECT reason, COUNT(*) AS count FROM refusals WHERE ${column} = ? GROUP BY reason ORDER BY reason
    `).all(value).map((row) => [row.reason, Number(row.count)]));
    const recent = this.db.prepare(`
      SELECT reason, contract_id AS contractId, anon_id AS anonId, profile_name AS profileName, refused_at AS refusedAt
      FROM refusals WHERE ${column} = ? ORDER BY refused_at DESC, id DESC LIMIT ?
    `).all(value, limit);
    return { counts, recent };
  }

  close() {
    this.db.close();
  }
}
