import { existsSync, linkSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const SOURCE = '/opt/goldrush-ledger/ledger.db';
const BACKUP_DIR = '/opt/goldrush-ledger/backups';
const KEEP_DAYS = 14;

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
