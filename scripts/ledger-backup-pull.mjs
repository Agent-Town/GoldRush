import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOST = 'root@<droplet>';
const REMOTE_DIR = '/opt/goldrush-ledger/backups';
const DEFAULT_DEST = fileURLToPath(new URL('../artifacts/ledger-backups/', import.meta.url));
const destination = process.env.LEDGER_BACKUP_DEST || DEFAULT_DEST;
const todayName = `ledger-${new Date().toISOString().slice(0, 10)}.db`;
const dryRun = process.argv.includes('--dry-run');

if (dryRun) {
  console.log(`dry-run: would ask ${HOST} for the newest ${REMOTE_DIR}/ledger-*.db (5s connect timeout)`);
  console.log(`dry-run: would rsync it into ${destination}; ${todayName} would make this run a no-op`);
  process.exit(0);
}

if (existsSync(path.join(destination, todayName))) {
  console.log(`ledger backup already present for today: ${path.join(destination, todayName)}`);
  process.exit(0);
}

const newest = run('ssh', [
  '-o', 'BatchMode=yes',
  '-o', 'ConnectTimeout=5',
  HOST,
  `ls -1t ${REMOTE_DIR}/ledger-*.db 2>/dev/null | head -n 1`,
], 15_000);
const remoteFile = newest.stdout.trim();
if (!remoteFile) throw new Error(`no ledger backups found on ${HOST}`);

const localFile = path.join(destination, path.basename(remoteFile));
if (existsSync(localFile)) {
  console.log(`newest ledger backup already present: ${localFile}`);
  process.exit(0);
}

mkdirSync(destination, { recursive: true });
run('rsync', ['-a', '--timeout=10', `${HOST}:${remoteFile}`, destination]);
console.log(`ledger backup pulled: ${localFile}`);

function run(command, args, timeout) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...(timeout ? { timeout } : {}) });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${result.stderr.trim()}`);
  return result;
}
