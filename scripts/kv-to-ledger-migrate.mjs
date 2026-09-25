#!/usr/bin/env node
// kv-to-ledger-migrate.mjs: the ONE-SHOT move of the rows the shared KV namespace still holds for the
// doors kv-counters-to-ledger-1 moved to the droplet ledger (owner ruling 2026-09-24, item 7 "(b)").
//
// WRITTEN, NOT RUN. The task that wrote it ran only its pure functions, against a throwaway in-memory
// ledger (scripts/test-accounts.mjs, "kv-to-ledger migration"). Running it for real is an ops-evening
// step, AFTER the Pages secret is bound (so no new row can land in KV behind it); the whole order is
// beside the route table in server/ledger/serve.mjs.
//
// TWO HALVES, TWO MACHINES, ONE FILE BETWEEN THEM:
//
//   1. On the Mac (wrangler and the Cloudflare token live there; the token is read by wrangler from
//      the environment and never by this script):
//        node scripts/kv-to-ledger-migrate.mjs export --out ~/.goldrush/kv-to-ledger-export.json
//      Lists and reads `bug:`, `prize:` and `telemetry:` from the TELEMETRY namespace (read-only: KV
//      reads and lists, never a write), and writes one mode-600 JSON file OUTSIDE this repository,
//      refusing to overwrite. It holds bug reports (free text, names, screenshots): personal data, so
//      it never goes into any git tree, this one being public (owner 2026-09-20).
//
//   2. On the droplet, after copying that file there (scp, mode 600):
//        LEDGER_DB_PATH=/opt/goldrush-ledger/ledger.db node scripts/kv-to-ledger-migrate.mjs import \
//          --in /root/kv-to-ledger-export.json --dry-run      # prints the plan, writes nothing
//        LEDGER_DB_PATH=/opt/goldrush-ledger/ledger.db node scripts/kv-to-ledger-migrate.mjs import \
//          --in /root/kv-to-ledger-export.json
//      One IMMEDIATE transaction: all of it lands or none of it does.
//
// WHAT IMPORT DOES WITH EACH CLASS, and why it can be re-run:
//   - bug reports and prize codes: inserted under the SAME key KV used; a key the ledger already has
//     is left alone (the ledger is the authority after the flip: a prize redeemed there since stays
//     redeemed). A report keeps KV's own expiry. A report written before SEC-7 has NONE, and that
//     stays so unless `--expire-legacy-bugs` gives it submittedAt + 90 days: SEC-7 recorded
//     re-expiring old rows as an owner decision, and this script does not take it for him.
//   - telemetry: the ledger may already have counted beacons since the flip, so counters are ADDED,
//     the wave maximum is the larger, the stamp the later. Adding twice would double the stats, so
//     the counters import exactly ONCE: a marker row records it, and a second run skips them.
//   - anything else (sessions, accounts, rate-limit hours, dedup keys, any class not named above) is
//     never imported, whatever the file says: the classifier runs again on import.
//
// Output: counts only. No key, value or credential is ever printed.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_EXPORT = path.join(homedir(), '.goldrush', 'kv-to-ledger-export.json');
const EXPORT_VERSION = 1;
const PREFIXES = ['bug:', 'prize:', 'telemetry:'];
// functions/api/_bugs.ts REPORT_TTL_SECONDS (SEC-7).
const REPORT_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const TELEMETRY_MARKER = 'migration:kv-to-ledger:telemetry';

const BUG_KEY = /^bug:\d{13}-[a-f0-9]{8}$/;
const PRIZE_KEY = /^prize:GR(?:-[A-F0-9]{6}){4}$/;
const PRIZE_VALUE = /^(?:gilded|redeemed:[0-9T:.\-Z]+\|[a-z0-9-]{1,40})$/;
const TELEMETRY_KEY = /^telemetry:[A-Za-z0-9:._-]{1,200}$/;

// Which class a KV key belongs to for this move, or null for "never import".
export function classifyKey(name) {
  if (typeof name !== 'string') return null;
  if (BUG_KEY.test(name)) return 'bug';
  if (PRIZE_KEY.test(name)) return 'prize';
  if (!TELEMETRY_KEY.test(name)) return null;
  // A rate-limit hour and a dedup marker are live, short-lived state, not history.
  if (name.startsWith('telemetry:ratelimit:') || name.startsWith('telemetry:dedup:')) return null;
  if (name === 'telemetry:updatedAt') return 'telemetry-stamp';
  if (name === 'telemetry:waves:max') return 'telemetry-max';
  if (name.startsWith('telemetry:render-demotion:latest:')) return 'telemetry-latest';
  return 'telemetry-counter';
}

// Turn an export document into the rows import will write, and the counts of what it will not.
export function planImport(document, { now = Date.now(), expireLegacyBugs = false } = {}) {
  if (!document || document.version !== EXPORT_VERSION || !Array.isArray(document.rows)) {
    throw new Error(`not a version-${EXPORT_VERSION} kv-to-ledger export`);
  }
  const rows = [];
  const skipped = { unclassified: 0, malformed: 0, expired: 0, duplicate: 0 };
  const seen = new Set();
  for (const row of document.rows) {
    const kind = classifyKey(row?.key);
    if (!kind) {
      skipped.unclassified += 1;
      continue;
    }
    if (seen.has(row.key)) {
      skipped.duplicate += 1;
      continue;
    }
    seen.add(row.key);
    if (typeof row.value !== 'string') {
      skipped.malformed += 1;
      continue;
    }
    const kvExpiresAt = Number.isSafeInteger(row.expiration) && row.expiration > 0 ? row.expiration * 1000 : null;
    if (kvExpiresAt !== null && kvExpiresAt <= now) {
      skipped.expired += 1; // KV would already have deleted it
      continue;
    }
    if (kind === 'bug') {
      const report = parseReport(row.value);
      if (!report || `bug:${report.id}` !== row.key) {
        skipped.malformed += 1;
        continue;
      }
      let expiresAt = kvExpiresAt;
      if (expiresAt === null && expireLegacyBugs) {
        expiresAt = Date.parse(report.submittedAt) + REPORT_TTL_MS;
        if (!Number.isFinite(expiresAt) || expiresAt <= now) {
          skipped.expired += 1;
          continue;
        }
      }
      rows.push({ kind, key: row.key, value: row.value, expiresAt });
      continue;
    }
    if (kind === 'prize' && !PRIZE_VALUE.test(row.value)) {
      skipped.malformed += 1;
      continue;
    }
    if ((kind === 'telemetry-counter' || kind === 'telemetry-max') && !/^\d{1,15}$/.test(row.value)) {
      skipped.malformed += 1;
      continue;
    }
    if (kind === 'telemetry-stamp' && !Number.isFinite(Date.parse(row.value))) {
      skipped.malformed += 1;
      continue;
    }
    rows.push({ kind, key: row.key, value: row.value, expiresAt: kvExpiresAt });
  }
  return { exportedAt: typeof document.exportedAt === 'string' ? document.exportedAt : null, rows, skipped };
}

// Apply a plan to an open ledger database (node:sqlite DatabaseSync; SqliteStorage exposes it as `.db`).
export function applyImport(db, plan, { now = Date.now(), dryRun = false } = {}) {
  const counts = {
    bugsInserted: 0, bugsAlreadyInLedger: 0,
    prizesInserted: 0, prizesAlreadyInLedger: 0,
    telemetryRowsImported: 0, telemetryRowsSkippedAlreadyImported: 0,
    skipped: { ...plan.skipped },
    dryRun,
  };
  const insertIfAbsent = db.prepare('INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO NOTHING');
  const addCounter = db.prepare(`
    INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, NULL)
    ON CONFLICT(key) DO UPDATE SET
      value = CAST(MAX(CAST(kv.value AS INTEGER), 0) + CAST(excluded.value AS INTEGER) AS TEXT),
      updated_at = excluded.updated_at
  `);
  const keepLarger = db.prepare(`
    INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, NULL)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    WHERE CAST(kv.value AS INTEGER) < CAST(excluded.value AS INTEGER)
  `);
  const keepLater = db.prepare(`
    INSERT INTO kv (key, value, updated_at, expires_at) VALUES (?, ?, ?, NULL)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    WHERE kv.value < excluded.value
  `);
  db.exec('BEGIN IMMEDIATE');
  try {
    const telemetryDone = db.prepare('SELECT 1 AS present FROM kv WHERE key = ?').get(TELEMETRY_MARKER) !== undefined;
    let telemetryWritten = 0;
    for (const row of plan.rows) {
      if (row.kind === 'bug' || row.kind === 'prize') {
        const inserted = Number(insertIfAbsent.run(row.key, row.value, now, row.expiresAt).changes) === 1;
        const noun = row.kind === 'bug' ? 'bugs' : 'prizes';
        counts[inserted ? `${noun}Inserted` : `${noun}AlreadyInLedger`] += 1;
        continue;
      }
      if (telemetryDone) {
        counts.telemetryRowsSkippedAlreadyImported += 1;
        continue;
      }
      if (row.kind === 'telemetry-counter') addCounter.run(row.key, row.value, now);
      else if (row.kind === 'telemetry-max') keepLarger.run(row.key, row.value, now);
      else if (row.kind === 'telemetry-stamp') keepLater.run(row.key, row.value, now);
      else insertIfAbsent.run(row.key, row.value, now, row.expiresAt);
      telemetryWritten += 1;
    }
    counts.telemetryRowsImported = telemetryWritten;
    if (!telemetryDone && telemetryWritten > 0) {
      insertIfAbsent.run(TELEMETRY_MARKER, JSON.stringify({ importedAt: new Date(now).toISOString(), exportedAt: plan.exportedAt, rows: telemetryWritten }), now, null);
    }
    db.exec(dryRun ? 'ROLLBACK' : 'COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return counts;
}

function parseReport(value) {
  try {
    const report = JSON.parse(value);
    return report && typeof report === 'object' && typeof report.id === 'string' && typeof report.description === 'string'
      && typeof report.submittedAt === 'string' ? report : null;
  } catch {
    return null;
  }
}

// --- the Mac half ----------------------------------------------------------------------------------

function namespaceIdFromWranglerToml() {
  const toml = readFileSync(path.join(ROOT, 'wrangler.toml'), 'utf8');
  const block = /\[\[kv_namespaces\]\]\s*\nbinding\s*=\s*"TELEMETRY"\s*\nid\s*=\s*"([a-f0-9]{32})"/.exec(toml);
  if (!block) throw new Error('could not find the TELEMETRY kv_namespaces binding in wrangler.toml; pass --namespace-id');
  return block[1];
}

function wrangler(args) {
  // wrangler reads CLOUDFLARE_API_TOKEN from the environment; this script never reads or prints it.
  return execFileSync('wrangler', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 64 * 1024 * 1024 });
}

function insideRepo(file) {
  const relative = path.relative(ROOT, path.resolve(file));
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}

function exportKv({ out, namespaceId, dryRun }) {
  if (insideRepo(out)) throw new Error('refusing to write the export inside this repository (it holds bug reports: personal data)');
  if (existsSync(out)) throw new Error(`refusing to overwrite an existing export: ${out}`);
  const rows = [];
  const counts = {};
  for (const prefix of PREFIXES) {
    const keys = JSON.parse(wrangler(['kv', 'key', 'list', '--remote', '--namespace-id', namespaceId, '--prefix', prefix]));
    if (!Array.isArray(keys)) throw new Error(`wrangler kv key list did not return a list for ${prefix}`);
    for (const key of keys) {
      const kind = classifyKey(key?.name);
      if (!kind) continue;
      counts[kind] = (counts[kind] ?? 0) + 1;
      if (dryRun) continue;
      const value = wrangler(['kv', 'key', 'get', key.name, '--text', '--remote', '--namespace-id', namespaceId]);
      rows.push({ key: key.name, value, expiration: Number.isSafeInteger(key.expiration) ? key.expiration : null });
    }
  }
  if (!dryRun) {
    mkdirSync(path.dirname(out), { recursive: true, mode: 0o700 });
    writeFileSync(out, `${JSON.stringify({ version: EXPORT_VERSION, exportedAt: new Date().toISOString(), namespaceId, rows })}\n`, { mode: 0o600, flag: 'wx' });
  }
  return { counts, rows: rows.length, out: dryRun ? null : out, dryRun };
}

// --- the droplet half -------------------------------------------------------------------------------

async function importExport({ inFile, dbPath, dryRun, expireLegacyBugs }) {
  if (!dbPath) throw new Error('LEDGER_DB_PATH is required');
  const { SqliteStorage } = await import('../server/ledger/storage.mjs');
  const plan = planImport(JSON.parse(readFileSync(inFile, 'utf8')), { expireLegacyBugs });
  const storage = new SqliteStorage(dbPath); // the ledger's own adapter: same schema, same busy timeout
  try {
    return applyImport(storage.db, plan, { dryRun });
  } finally {
    storage.close();
  }
}

function option(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} needs a value`);
  return value;
}

async function main(args) {
  const [command] = args;
  const dryRun = args.includes('--dry-run');
  if (command === 'export') {
    const out = path.resolve(option(args, '--out') ?? DEFAULT_EXPORT);
    const result = exportKv({ out, namespaceId: option(args, '--namespace-id') ?? namespaceIdFromWranglerToml(), dryRun });
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }
  if (command === 'import') {
    const inFile = option(args, '--in');
    if (!inFile) throw new Error('import needs --in <export file>');
    const result = await importExport({ inFile, dbPath: process.env.LEDGER_DB_PATH, dryRun, expireLegacyBugs: args.includes('--expire-legacy-bugs') });
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }
  console.log('usage: kv-to-ledger-migrate.mjs export [--out FILE] [--namespace-id ID] [--dry-run]');
  console.log('       LEDGER_DB_PATH=... kv-to-ledger-migrate.mjs import --in FILE [--dry-run] [--expire-legacy-bugs]');
  return 2;
}

function invokedDirectly() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
