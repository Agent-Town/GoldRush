// F-2352-2 — LB-01's pull was NEWEST-ONLY (`ls -1t | head -n 1`, plus an early exit
// once today's copy is present), so it was structurally incapable of ever closing a
// hole BEHIND today — precisely the hole F-2351-1's freshness probe reports. The
// detection layer named a gap the recovery layer could not act on.
//
// These arms drive the REAL script end-to-end with `ssh` and `rsync` intercepted on
// PATH, so they exercise the shipped code rather than a re-implementation of it.
// Every red below was proven by manufacturing the defect on a scratch copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, chmodSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fixture teardown (F-2383-2). These guards made temp dirs and never removed them: 50 survivors
// per run, invisible while scripts/fixture-teardown.test.mjs still failed fast on an earlier subject.
// keep() only REGISTERS the directory — the mkdtemp literal deliberately stays at its own call site,
// because that auditor extracts prefixes lexically and cannot see through a wrapper (F-2382-4).
const TMP = [];
const keep = (d) => { TMP.push(d); return d; };
process.on('exit', () => {
  for (const d of TMP) rmSync(d, { recursive: true, force: true });
});


const SCRIPT = fileURLToPath(new URL('./ledger-backup-pull.mjs', import.meta.url));

// Build a sandbox: fake remote listing + stub ssh/rsync on PATH + an empty mirror.
// `remote` is the set of basenames the box "holds"; `local` what the mirror already has.
function sandbox({ remote, local, dated = true }) {
  const root = keep(mkdtempSync(path.join(tmpdir(), 'lb01-fill-')));
  const bin = path.join(root, 'bin');
  const dest = path.join(root, 'mirror');
  const remoteDir = path.join(root, 'remote');
  mkdirSync(bin); mkdirSync(dest); mkdirSync(remoteDir);

  for (const name of remote) writeFileSync(path.join(remoteDir, name), `REMOTE:${name}`);
  for (const name of local) writeFileSync(path.join(dest, name), `LOCAL:${name}`);

  // ssh stub: ignore every option/host and just list the fake remote dir, mimicking
  // `ls -1 <dir>/ledger-*.db` by emitting absolute paths one per line.
  const log = path.join(root, 'calls.log');
  writeFileSync(path.join(bin, 'ssh'), [
    '#!/bin/sh',
    `echo "ssh $*" >> ${JSON.stringify(log)}`,
    // -t implies the caller wanted newest-first + head; emit accordingly so the
    // default (uncured) path still behaves like the real box.
    `case "$*" in *"-1t"*) ls -1t ${JSON.stringify(remoteDir)} | head -n 1 | sed "s|^|${remoteDir}/|" ;;`,
    `           *) ls -1 ${JSON.stringify(remoteDir)} | sed "s|^|${remoteDir}/|" ;; esac`,
  ].join('\n'));
  writeFileSync(path.join(bin, 'rsync'), [
    '#!/bin/sh',
    `echo "rsync $*" >> ${JSON.stringify(log)}`,
    // last two args are <host:src> <destdir>; strip a host: prefix if present
    'src=""; dst=""',
    'for a in "$@"; do case "$a" in -*) ;; *) src="$dst"; dst="$a" ;; esac; done',
    'real=$(echo "$src" | sed "s/^[^:]*://")',
    'cp "$real" "$dst"',
  ].join('\n'));
  chmodSync(path.join(bin, 'ssh'), 0o755);
  chmodSync(path.join(bin, 'rsync'), 0o755);

  return { root, bin, dest, remoteDir, log };
}

function runScript(sb, args, scriptPath = SCRIPT) {
  return spawnSync('node', [scriptPath, ...args], {
    encoding: 'utf8',
    env: { ...process.env, PATH: `${sb.bin}:${process.env.PATH}`, LEDGER_BACKUP_DEST: sb.dest },
  });
}

const calls = sb => (existsSync(sb.log) ? readFileSync(sb.log, 'utf8') : '');
const mirrored = sb => readdirSync(sb.dest).sort();

// A remote holding a hole behind today: 08-27 missing from the mirror.
const HOLE = {
  remote: ['ledger-2026-08-26.db', 'ledger-2026-08-27.db', 'ledger-2026-08-28.db'],
  local: ['ledger-2026-08-26.db', 'ledger-2026-08-28.db'],
};

test('--fill-gaps pulls exactly the missing dated backup, and nothing else', () => {
  const sb = sandbox(HOLE);
  const r = runScript(sb, ['--fill-gaps']);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.length > 0, 'control: the arm produced output, it really ran');
  assert.deepEqual(mirrored(sb), [
    'ledger-2026-08-26.db', 'ledger-2026-08-27.db', 'ledger-2026-08-28.db',
  ]);
  // exactly one rsync — it must not re-pull files already mirrored
  assert.equal((calls(sb).match(/^rsync /gm) || []).length, 1);
  assert.match(r.stdout, /filled:.*ledger-2026-08-27\.db/);
});

test('the recovered file is the REMOTE bytes, not a placeholder', () => {
  const sb = sandbox(HOLE);
  runScript(sb, ['--fill-gaps']);
  assert.equal(
    readFileSync(path.join(sb.dest, 'ledger-2026-08-27.db'), 'utf8'),
    'REMOTE:ledger-2026-08-27.db',
  );
});

test('--fill-gaps --dry-run names the gap and rsyncs NOTHING', () => {
  const sb = sandbox(HOLE);
  const r = runScript(sb, ['--fill-gaps', '--dry-run']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /gap: ledger-2026-08-27\.db/);
  assert.match(r.stdout, /dry-run: would rsync/);
  assert.equal((calls(sb).match(/^rsync /gm) || []).length, 0, 'dry-run must not mutate');
  assert.deepEqual(mirrored(sb), ['ledger-2026-08-26.db', 'ledger-2026-08-28.db']);
});

test('the corpus is declared even on the happy path — "0 gaps" must not look like "I could not read the box" (F-2208-1)', () => {
  const sb = sandbox({ remote: ['ledger-2026-08-28.db'], local: ['ledger-2026-08-28.db'] });
  const r = runScript(sb, ['--fill-gaps']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /remote .*: 1 dated backup/);
  assert.match(r.stdout, /local .*: 1 dated mirror/);
  assert.match(r.stdout, /recoverable gap\(s\) *: 0/);
  assert.match(r.stdout, /nothing to fill/);
});

test('THE DEFECT ARM: the default path leaves the hole behind today untouched', () => {
  // This is what the tool did in every mode before the cure — kept here as the
  // standing proof that the default path is newest-only by design, so the gap
  // capability cannot silently regress into it (or out of it).
  const sb = sandbox(HOLE);
  const r = runScript(sb, []);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!mirrored(sb).includes('ledger-2026-08-27.db'),
    'default path must not fill gaps — that is what --fill-gaps is for');
});

test('non-dated debris on the box is never pulled', () => {
  const sb = sandbox({
    remote: ['ledger-2026-08-27.db', 'ledger-backup.db', 'ledger-2026-08-27.db.partial'],
    local: [],
  });
  const r = runScript(sb, ['--fill-gaps']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(mirrored(sb), ['ledger-2026-08-27.db']);
});

test('a mirror directory that does not exist yet is created, not crashed on', () => {
  const sb = sandbox({ remote: ['ledger-2026-08-27.db'], local: [] });
  const r = runScript(sb, ['--fill-gaps']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(mirrored(sb), ['ledger-2026-08-27.db']);
});

test('an unreachable box fails LOUD — it must never report a clean series', () => {
  const sb = sandbox(HOLE);
  // replace the ssh stub with one that fails the way BatchMode does with no key
  writeFileSync(path.join(sb.bin, 'ssh'), '#!/bin/sh\necho "Permission denied" >&2\nexit 255\n');
  chmodSync(path.join(sb.bin, 'ssh'), 0o755);
  const r = runScript(sb, ['--fill-gaps']);
  assert.notEqual(r.status, 0, 'an unreadable box must not exit 0');
  assert.doesNotMatch(r.stdout, /nothing to fill/,
    'a failed listing must never print the all-clear');
});
