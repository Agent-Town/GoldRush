/**
 * F-2600-1 — the LB-01 pull's `newest ledger backup already present` exit must
 * DECLARE that today's mirror is still outstanding.
 *
 * WHY THIS ARM AND NOT A BOARD GUARD: a box that has not yet run its nightly timer
 * is a LAWFUL, routine, twice-daily state, so a red on "today's mirror is missing"
 * would fire during ordinary correct operation and be excused into uselessness
 * inside a week (F-1460-1, the `cross-engine` fate). What IS guarded here is OUR
 * OWN CODE: a one-paragraph declaration whose deletion is silent in every other
 * channel, which is F-1667-1's "an un-annotated cure can undo itself".
 *
 * The exit is reachable only with a droplet, so every arm stubs `ssh` on PATH.
 * That stub is the fixture: if it cannot be built the suite REFUSES rather than
 * passing vacuously (F-2217-1 — a skipped arm and a green arm look alike).
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./ledger-backup-pull.mjs', import.meta.url));
const REMOTE_DIR = '/opt/goldrush-ledger/backups';
const utcDay = (offsetDays = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
const todayName = `ledger-${utcDay(0)}.db`;
const yesterdayName = `ledger-${utcDay(-1)}.db`;

/**
 * Build a scratch world: a fake `ssh` on PATH that reports `remoteNewest` as the
 * box's newest backup, and a destination directory seeded with `seed` files.
 * Returns the completed run. Asserts the stub really was built and really ran,
 * because a control whose failure mode is silence cannot be told from the silence
 * it measures (F-2215-1).
 */
function runPull({ remoteNewest, seed = [], subject = script }) {
  const root = mkdtempSync(path.join(tmpdir(), 'gr-lb01-supply-'));
  const bin = path.join(root, 'bin');
  const dest = path.join(root, 'mirrors');
  spawnSync('mkdir', ['-p', bin, dest]);

  const stub = path.join(bin, 'ssh');
  writeFileSync(stub, `#!/bin/sh\necho "${REMOTE_DIR}/${remoteNewest}"\n`);
  chmodSync(stub, 0o755);
  assert.ok(existsSync(stub), 'FIXTURE REFUSED: the ssh stub was not created');

  for (const name of seed) writeFileSync(path.join(dest, name), 'mirrored bytes');

  const result = spawnSync(process.execPath, [subject], {
    encoding: 'utf8',
    timeout: 20_000,
    env: { ...process.env, LEDGER_BACKUP_DEST: dest, PATH: `${bin}:${process.env.PATH}` },
  });
  rmSync(root, { recursive: true, force: true });

  assert.notEqual(result.status, null, `FIXTURE REFUSED: the pull did not terminate — ${result.stderr}`);
  assert.ok(result.stdout.length > 0, `FIXTURE REFUSED: the pull produced no stdout — ${result.stderr}`);
  return result;
}

test('the newest-already-present exit names TODAY as still outstanding', () => {
  const r = runPull({ remoteNewest: yesterdayName, seed: [yesterdayName] });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /newest ledger backup already present/, 'the legacy line must survive');
  assert.match(r.stdout, /NOT DISCHARGED for today/, 'the exit must say it is not a discharge');
  assert.ok(
    r.stdout.includes(todayName),
    `the declaration must NAME the outstanding day (${todayName}); got:\n${r.stdout}`,
  );
});

test('the declaration names the supply window rather than blaming the fetch', () => {
  const r = runPull({ remoteNewest: yesterdayName, seed: [yesterdayName] });
  assert.match(r.stdout, /goldrush-ledger-backup\.timer/, 'name the timer that supplies the file');
  assert.match(r.stdout, /UTC/, 'the window is a UTC window — say so');
  assert.match(r.stdout, /nothing is wrong/i, 'a supply gap is not a failure; do not read as one');
});

test('the exit stays advisory — a no-op must never red the LB-01 duty', () => {
  const r = runPull({ remoteNewest: yesterdayName, seed: [yesterdayName] });
  assert.equal(r.status, 0, 'LB-01: box-side gaps are a WARN, never a red');
  assert.equal(r.stderr.trim(), '', `a no-op must not write to stderr; got: ${r.stderr}`);
});

/**
 * REVERSE CONTROL. The sibling exit — today's mirror genuinely present — IS a
 * discharge, and must NOT carry this wording. An over-general cure that prints the
 * declaration unconditionally passes every arm above while telling a fire its
 * completed duty is outstanding, which is the opposite error and just as costly.
 */
test('REVERSE CONTROL: a genuine discharge does NOT claim to be outstanding', () => {
  const r = runPull({ remoteNewest: todayName, seed: [todayName] });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /already present for today/);
  assert.doesNotMatch(
    r.stdout,
    /NOT DISCHARGED/,
    'today IS mirrored — declaring it outstanding would send a fire to re-pull forever',
  );
});

/**
 * The comment is the only place the measurement's PROVENANCE lives, and a bare
 * constant with no provenance is what rots (this file's own subject). Assert the
 * site still says where the window came from.
 */
test('the site records how the supply window was measured', () => {
  const src = readFileSync(script, 'utf8');
  assert.match(src, /F-2600-1/, 'the cure must stay attributable');
  assert.match(src, /goldrush-ledger-backup\.timer/, 'the timer is the mechanism — name it at the site');
  assert.match(src, /measured s2600/, 'a window with no provenance is a constant waiting to rot');
});

/**
 * F-2601-1. The window is NOT a threshold: the unit carries `RandomizedDelaySec=1h`,
 * so the trigger is drawn uniformly from [02:00, 03:00) UTC and RE-ROLLED DAILY.
 * s2600 banked `systemctl list-timers`' NEXT column (02:08:48 UTC) as a "not before"
 * time, and that field is THAT DAY'S DICE ROLL -- measured across 15 real writes the
 * span is 02:07-02:58 UTC, so the threshold was wrong in BOTH directions (it forbade
 * a pull that would have worked on the 02:07 day, and promised one that could not on
 * the 02:58 day). Without this arm, restoring a single threshold is silent in every
 * other channel -- F-1667-1, "an un-annotated cure can undo itself", which is the
 * same reason the provenance arm above exists.
 */
test('the site names the RANDOMIZED mechanism, so no fixed threshold can creep back', () => {
  const src = readFileSync(script, 'utf8');
  assert.match(src, /F-2601-1/, 'the re-measurement must stay attributable');
  assert.match(src, /RandomizedDelaySec/, 'the randomization IS the reason a threshold cannot work');
  assert.match(src, /re-rolled every day/i, 'a daily re-roll is what makes yesterday\'s NEXT a sample');

  const r = runPull({ remoteNewest: yesterdayName, seed: [yesterdayName] });
  assert.match(
    r.stdout,
    /\[02:00, 03:00\)/,
    'state the window as a RANGE; a single "not before" time is a sample wearing a schedule\'s clothes',
  );
});
