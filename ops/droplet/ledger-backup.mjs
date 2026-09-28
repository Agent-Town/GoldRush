import { existsSync, linkSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { sweepExpiredRows } from '../../server/ledger/storage.mjs';

const SOURCE = '/opt/goldrush-ledger/ledger.db';
const BACKUP_DIR = '/opt/goldrush-ledger/backups';
const KEEP_DAYS = 14;

// kv-counters-to-ledger-1 scope 3: the daily sweep of expired ledger rows, on this job's cadence
// (goldrush-ledger-backup.timer, 02:00 UTC). Bug reports moved here from Cloudflare KV, and KV deleted
// a report ITSELF at its 90-day `expirationTtl` (SEC-7); in the ledger that TTL is the row's
// `expires_at`, and a row nobody writes near would otherwise sit on disk past it. This is that deletion:
// ONE parameterised statement over rows whose own expiry has passed (the same statement the ledger runs
// before every write, `sweepExpiredRows`), never a `find -delete` and never a file. It runs BEFORE the
// copy, so a report past its 90 days is not carried into tonight's backup either.
export function sweepExpiredLedgerRows(source, now = Date.now()) {
  if (!existsSync(source)) throw new Error(`ledger database not found: ${source}`);
  const db = new DatabaseSync(source);
  try {
    // The live ledger holds the same file open (WAL); wait for its write lock rather than fail.
    db.exec('PRAGMA busy_timeout = 5000');
    const hasKv = db.prepare("SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'kv'").get();
    return hasKv ? sweepExpiredRows(db, now) : 0;
  } finally {
    db.close();
  }
}

export function backupDatabase(source, target) {
  if (!existsSync(source)) throw new Error(`ledger database not found: ${source}`);
  if (existsSync(target)) throw new Error(`refusing to overwrite backup: ${target}`);
  mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const partial = `${target}.partial`;
  rmSync(partial, { force: true });
  const db = new DatabaseSync(source);
  try {
    db.prepare('VACUUM INTO ?').run(partial);
    linkSync(partial, target);
  } finally {
    try {
      db.close();
    } finally {
      rmSync(partial, { force: true });
    }
  }
}

export function pruneLocalBackups(directory, today = new Date()) {
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - KEEP_DAYS);
  const cutoffName = `ledger-${cutoff.toISOString().slice(0, 10)}.db`;
  for (const name of readdirSync(directory)) {
    // Retention law: only rotate dated ledger copies by explicit named-file iteration;
    // never use a broad find/delete sweep that could erase unrelated history.
    if (/^ledger-\d{4}-\d{2}-\d{2}\.db$/.test(name) && name < cutoffName) {
      rmSync(path.join(directory, name));
    }
  }
}

export function runNightlyBackup(today = new Date()) {
  // A failed sweep must not cost the night its backup: say so loudly, mark the unit failed, carry on.
  try {
    console.log(`ledger sweep removed ${sweepExpiredLedgerRows(SOURCE, today.getTime())} expired row(s)`);
  } catch (error) {
    console.error(`ledger sweep failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
  const target = path.join(BACKUP_DIR, `ledger-${today.toISOString().slice(0, 10)}.db`);
  if (existsSync(target)) {
    rmSync(`${target}.partial`, { force: true });
    pruneLocalBackups(BACKUP_DIR, today);
    console.log(`ledger backup already exists; refusing to overwrite: ${target}`);
    return;
  }
  backupDatabase(SOURCE, target);
  pruneLocalBackups(BACKUP_DIR, today);
  console.log(`ledger backup created: ${target}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runNightlyBackup();
