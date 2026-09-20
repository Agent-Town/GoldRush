import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// The droplet address lives only in .env.local (GR_DROPLET_HOST); never in the tree (owner 2026-09-20: the working repo becomes public).
const HOST = process.env.GR_DROPLET_HOST || (() => { try { const m = /^GR_DROPLET_HOST=(.+)$/m.exec(readFileSync('.env.local', 'utf8')); return m ? m[1].trim() : undefined; } catch { return undefined; } })();
if (!HOST) { console.error('ledger-backup-pull: GR_DROPLET_HOST missing from the environment and .env.local'); process.exit(2); }
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
  // F-2600-1: this exit and the `already present for today` exit above BOTH read as
  // "nothing to do", and only ONE of them is a discharge. Worse, this one is NEVER a
  // discharge -- provably, not usually: reaching here means today's mirror is absent
  // locally (the :33 guard above) while the box's NEWEST is present locally, so the
  // box's newest CANNOT be today's. So say the outstanding day out loud, at the site,
  // rather than leaving a handoff to infer a discharge from the word "present".
  //
  // WHY IT HAPPENS, measured s2600 on the box rather than inferred: the droplet names
  // its file in UTC (ops/droplet/ledger-backup.mjs) and writes it on a systemd timer,
  // `goldrush-ledger-backup.timer`. Our `todayName` is UTC too, so at 00:00 UTC the
  // mirror is instantly OWED while the supply is still hours away. That is a SUPPLY
  // window, not a fetch failure -- nothing is wrong, and nothing is owed but patience.
  //
  // F-2601-1, re-measured s2601 by reading the UNIT rather than its next firing:
  // `OnCalendar=*-*-* 02:00:00 UTC` with `RandomizedDelaySec=1h`, so the trigger is
  // drawn UNIFORMLY FROM [02:00, 03:00) UTC AND RE-ROLLED EVERY DAY. s2600 read the
  // `NEXT` column of `systemctl list-timers` (02:08:48 UTC) and banked it as a
  // threshold -- but NEXT is that day's DICE ROLL, not a schedule, so no fixed
  // "not before" time can be right. Measured over all 15 backups the box still
  // holds, the writes land 02:07:02 - 02:57:58 UTC (mean 34.5 min past 02:00):
  // the earliest is BEFORE s2600's 02:10 threshold and the latest is 48 min after it,
  // i.e. the single threshold was wrong in BOTH directions. `Persistent=true` widens
  // it further -- a box that was down at the trigger runs the job at next boot.
  //
  // THEREFORE THERE IS NO THRESHOLD TO GET RIGHT, and this exit is the cure: the pull
  // is idempotent and bounded (3.0s measured s2601), so after 02:00 UTC simply RUN IT
  // and read the verdict below rather than computing whether it is worth trying.
  console.log(`⏳ NOT DISCHARGED for today — ${todayName} does not exist on the box yet.`);
  console.log(`   The droplet writes it on goldrush-ledger-backup.timer: OnCalendar 02:00 UTC`);
  console.log(`   + RandomizedDelaySec=1h, so the trigger is UNIFORM IN [02:00, 03:00) UTC and`);
  console.log(`   RE-ROLLED DAILY (measured s2600; re-measured s2601 from the unit — 15 writes`);
  console.log(`   span 02:07–02:58 UTC, so no fixed "not before" time is right).`);
  console.log(`   Nothing is wrong. Re-run any time after 02:00 UTC; this pull costs ~3s.`);
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
  // F-2433-1: BOUNDED. A SYNC spawn of a NODE child is F-2429-1's deadlock shape --
  // the child exits, wedges in node's platform teardown, and spawnSync blocks the
  // event loop so no outer timer can ever fire. Unbounded, this hangs the LB-01
  // duty forever, in the one gate standing between a plaintext account row and a
  // ONE-WAY commit (F-2353-2).
  //
  // The bound makes an ALREADY-WRITTEN handler reachable rather than adding one:
  // a timeout yields status === null, which the arm below already treats as
  // "gate DID NOT RUN -- verify the keys by hand", the correct fail-safe.
  // 240_000 is F-2430-1's measured constant, ~240x this child's lawful runtime.
  const r = spawnSync(process.execPath, [probe, '--dir', destination],
    { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });

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
