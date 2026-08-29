import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOST = 'root@<droplet>';
const REMOTE_DIR = '/opt/goldrush-ledger/backups';
const DEFAULT_DEST = fileURLToPath(new URL('../artifacts/ledger-backups/', import.meta.url));
const destination = process.env.LEDGER_BACKUP_DEST || DEFAULT_DEST;
const todayName = `ledger-${new Date().toISOString().slice(0, 10)}.db`;
const dryRun = process.argv.includes('--dry-run');
const fillGaps = process.argv.includes('--fill-gaps');

// The default path below asks for `ls -1t | head -n 1` — THE NEWEST FILE ONLY — and
// exits early once today's copy is present. That makes it structurally incapable of
// ever closing a hole BEHIND today, which is exactly what LB-01's freshness probe
// (F-2351-1) reports. `--fill-gaps` is the recovery half, and it is DELIBERATELY an
// explicit opt-in rather than automatic: a hole is a JUDGEMENT, not a backfill order
// (s2351's design intent, preserved). The droplet prunes on a 14-day window
// (ops/droplet/ledger-backup.mjs KEEP_DAYS), so a named hole is recoverable only
// until it ages out — after that the bytes are gone and no tool can help.
if (fillGaps) {
  fillRemoteGaps();
  process.exit(0);
}

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
exposureGate();

// Pull every dated backup the box still holds that this mirror lacks. The local
// series only ever grows (Retention Law: nothing here is deleted) while the remote
// keeps 14 days, so remote-minus-local is exactly the recoverable-hole set.
function fillRemoteGaps() {
  const DATED = /^ledger-\d{4}-\d{2}-\d{2}\.db$/;

  const listing = run('ssh', [
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=5',
    HOST,
    `ls -1 ${REMOTE_DIR}/ledger-*.db 2>/dev/null`,
  ], 15_000);

  const remote = listing.stdout.split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .filter(p => DATED.test(path.basename(p)));

  // Declare the corpus ALWAYS, including the happy path: "0 gaps" and "I could not
  // read the box" must never look alike (F-2208-1).
  const local = existsSync(destination)
    ? readdirSync(destination).filter(n => DATED.test(n))
    : [];
  const missing = remote.filter(p => !local.includes(path.basename(p)));

  console.log(`remote ${REMOTE_DIR}/ : ${remote.length} dated backup(s) (14-day window)`);
  console.log(`local  ${destination} : ${local.length} dated mirror(s)`);
  console.log(`recoverable gap(s)    : ${missing.length}`);

  if (missing.length === 0) {
    console.log('nothing to fill — every backup the box still holds is already mirrored.');
    return;
  }

  for (const remoteFile of missing) console.log(`  gap: ${path.basename(remoteFile)}`);

  if (dryRun) {
    console.log(`dry-run: would rsync the ${missing.length} file(s) above into ${destination}`);
    return;
  }

  mkdirSync(destination, { recursive: true });
  for (const remoteFile of missing) {
    run('rsync', ['-a', '--timeout=10', `${HOST}:${remoteFile}`, destination]);
    console.log(`filled: ${path.join(destination, path.basename(remoteFile))}`);
  }
  exposureGate();
}

/**
 * LB-01's STANDING ENCRYPTION GATE, enforced at the door instead of remembered
 * (F-2353-1). The duty that calls this script goes on to `git add` + commit +
 * PUSH the pulled file, and that door is ONE-WAY: undoing a committed account
 * row needs a force-push, which is deny-listed here.
 *
 * s2352 added a manual "read the keys first" instruction to the --fill-gaps arm
 * only; the DAILY arm — the one that actually runs every day — had neither an
 * instruction nor an instrument. This closes that, for both arms.
 *
 * SCOPE, chosen deliberately rather than maximally: this HARD-STOPS only on
 * account-class rows, which are NEVER a lawful thing to commit. A "could not
 * answer" (exit 2 — e.g. the bytes did not parse as sqlite) is reported LOUDLY
 * but does not fail the pull, because an unparseable download is a FETCH problem
 * that the next run self-heals, and failing here would red the fill-gaps guard's
 * legitimate non-sqlite stubs. The committed corpus is still covered: the same
 * tool is a leg of `test:ledger-guards`, where exit 2 DOES red — so an
 * unverifiable mirror that reaches a commit is caught at the fire's last act.
 */
function exposureGate() {
  const probe = fileURLToPath(new URL('./ledger-mirror-exposure.mjs', import.meta.url));
  const r = spawnSync(process.execPath, [probe, '--dir', destination], { encoding: 'utf8' });

  if (r.error || r.status === null) {
    console.log('⚠️  exposure gate DID NOT RUN — verify the keys by hand before committing:');
    console.log(`    node scripts/ledger-mirror-exposure.mjs`);
    return;
  }
  process.stdout.write(r.stdout);
  if (r.status === 1) {
    console.error('\n⛔ REFUSING — the pulled mirror carries ACCOUNT data. It is on disk but MUST NOT');
    console.error('   be committed or pushed. See scripts/fire.md §LB-01: the mirror must become an');
    console.error('   ENCRYPTED artifact before any further mirror is committed.');
    process.exit(1);
  }
  if (r.status !== 0) {
    console.log('⚠️  exposure gate COULD NOT ANSWER (above). The file is on disk and UNVERIFIED —');
    console.log('    do not commit it until the keys are read.');
  }
}

function run(command, args, timeout) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...(timeout ? { timeout } : {}) });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${result.stderr.trim()}`);
  return result;
}
