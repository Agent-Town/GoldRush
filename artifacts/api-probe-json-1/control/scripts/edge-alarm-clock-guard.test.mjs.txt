// F-2356-1 — DARK and SLOW must run on SEPARATE CLOCKS, so a dark door pages AT ONCE.
//
// F-2355-1 split the public-door alarm into two conditions (DARK = nothing came
// back / a bad code / a dead service / a full disk; SLOW = the door answered 2xx
// and then missed the transfer budget) with two branches and two messages. It
// left them sharing ONE counter, incremented BEFORE the branch is chosen. So a
// dark door inherited whatever passes the SLOW condition had already banked, and
// the `-eq 1` test that makes an outage page immediately could not fire.
//
// Both cured files carry a comment promising the opposite in so many words —
// "dark pages at once, as it always has" / "all DARK and page at once, exactly as
// before". Measured s2356 by manufacturing the sequence, that held only from a
// COLD state:
//     scripts/health-watch.sh    2 slow then dark -> 30 min silent (10 min/pass)
//     ops/droplet/edge-watch.sh  1 slow then dark -> 50 min silent ( 5 min/pass)
// The droplet is the worse one because it is the watcher that MAILS the owner.
//
// The shared counter PREDATES F-2355-1 and is not that cure's invention. What
// that cure changed is that the early passes are now DELIBERATELY silent — which
// is correct, and is the whole point of not crying wolf — so the sequence
// `load -> slow -> down`, the ordinary way a box fails, went from "pages at once,
// mislabelled DARK" to "pages nothing at all". That is the seam the cure created.
//
// Two observation channels, both real and neither a re-implementation:
//   scripts/health-watch.sh    -> ALERT lines in its own logs/health.log
//   ops/droplet/edge-watch.sh  -> send_mail with no RESEND_API_KEY prints
//                                 "alert not sent: <subject>" and returns 1, so
//                                 mail INTENT is observable and no mail is sent.
// The previous guard took a STRUCTURAL ceiling on the droplet file. That ceiling
// was honest but not necessary: with STATE_DIR rewritten on a scratch copy and
// systemctl/df/curl stubbed, that script runs here, so these arms are behavioural.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MAC = path.join(ROOT, 'scripts/health-watch.sh');
const BOX = path.join(ROOT, 'ops/droplet/edge-watch.sh');

const TMP = [];
// The prefix is spelled as a STRING LITERAL at the mkdtemp site on purpose. scripts/fixture-teardown.test.mjs
// extracts prefixes lexically and cannot see through this wrapper, so passing `tag` straight through yielded
// 0 extractable prefixes and reddened that guard on main for two days (F-2382-4). The tag is preserved as a
// nested directory, which keeps fixtures self-describing without hiding the prefix from the auditor.
function tmpdir(tag) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-edge-alarm-'));
  TMP.push(base);
  const d = path.join(base, tag);
  fs.mkdirSync(d);
  return d;
}
process.on('exit', () => {
  for (const d of TMP) fs.rmSync(d, { recursive: true, force: true });
});

// A stub PATH: curl prints a code then exits with a chosen status (the shape that
// produced the composite); the rest are neutralised so nothing escapes the fixture.
function stubBin(code, rc) {
  const bin = tmpdir('edge-bin-');
  const w = (name, body) => {
    fs.writeFileSync(path.join(bin, name), body);
    fs.chmodSync(path.join(bin, name), 0o755);
  };
  w('curl', '#!/bin/bash\nprintf ' + JSON.stringify(String(code)) + '\nexit ' + rc + '\n');
  w('osascript', '#!/bin/bash\nexit 0\n');          // no desktop notification
  w('systemctl', '#!/bin/bash\nexit 0\n');          // every service healthy
  w('df', '#!/bin/bash\necho "Use%"\necho " 10%"\n'); // disk far below the 95% gate
  return bin;
}

// ---------------------------------------------------------------- Mac watcher

function macFixture() {
  const root = tmpdir('hw-');
  fs.mkdirSync(path.join(root, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, 'scripts/runner-processes.sh'),
    path.join(root, 'scripts/runner-processes.sh'),
  );
  const src = fs.readFileSync(MAC, 'utf8');
  const patched = src.replace(/^ROOT=.*$/m, 'ROOT=' + JSON.stringify(root));
  // A fixture that silently failed to redirect ROOT would run against the live
  // repo state and read as a pass for the wrong reason.
  assert.notEqual(patched, src, 'ROOT rewrite did not match — the Mac fixture is invalid');
  const dst = path.join(root, 'scripts/health-watch.sh');
  fs.writeFileSync(dst, patched);
  fs.chmodSync(dst, 0o755);
  return { root, dst };
}

function macPass(fx, code, rc) {
  const before = macAlerts(fx).length;
  const r = spawnSync('bash', [fx.dst], {
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, PATH: stubBin(code, rc) + ':' + process.env.PATH },
  });
  // F-2215-1: assert the arm REACHED the branch, not merely that it produced
  // bytes. A crash exits non-zero having alerted nothing, which would satisfy
  // every "no alert" assertion below for entirely the wrong reason.
  assert.equal(r.status, 0, 'health-watch pass exited ' + r.status + ' — the arm did not run');
  const all = macAlerts(fx);
  assert.ok(fs.existsSync(path.join(fx.root, 'logs/.health-state')), 'no state written');
  return all.slice(before);
}

function macAlerts(fx) {
  try {
    return fs
      .readFileSync(path.join(fx.root, 'logs/health.log'), 'utf8')
      .split('\n')
      .filter((l) => /ALERT:.*(PUBLIC EDGE|Public edge)/.test(l));
  } catch {
    return [];
  }
}

const SLOW_PASS = ['200', 28]; // answered 200, transfer failed -> "200-slow"
const DARK_PASS = ['521', 0];  // a real bad code
const GOOD_PASS = ['200', 0];

test('[mac] a door that goes DARK after slow passes pages AT ONCE', () => {
  const fx = macFixture();
  assert.equal(macPass(fx, ...SLOW_PASS).length, 0, 'slow pass 1 should hold its fire');
  assert.equal(macPass(fx, ...SLOW_PASS).length, 0, 'slow pass 2 should hold its fire');
  const dark = macPass(fx, ...DARK_PASS);
  assert.equal(dark.length, 1, 'the DARK page was suppressed by the slow condition\'s banked passes (F-2356-1)');
  assert.match(dark[0], /PUBLIC EDGE DARK/);
});

// Reverse control: the cure must not have bought that by paging more eagerly in
// general. A cold dark door paged at once before this change and must still.
test('[mac] a DARK door from a cold state still pages at once', () => {
  const fx = macFixture();
  const dark = macPass(fx, ...DARK_PASS);
  assert.equal(dark.length, 1);
  assert.match(dark[0], /PUBLIC EDGE DARK/);
});

// Reverse control: the SLOW hold is the entire point of F-2355-1. A cure that
// gave dark its own clock by paging on every slow pass would restore the
// wolf-crying alarm that finding removed.
test('[mac] SLOW still holds its fire for two passes and pages on the third', () => {
  const fx = macFixture();
  assert.equal(macPass(fx, ...SLOW_PASS).length, 0, 'slow must not page on pass 1');
  assert.equal(macPass(fx, ...SLOW_PASS).length, 0, 'slow must not page on pass 2');
  const third = macPass(fx, ...SLOW_PASS);
  assert.equal(third.length, 1, 'slow must page once it has persisted');
  assert.match(third[0], /PUBLIC EDGE SLOW/);
  assert.doesNotMatch(third[0], /DARK/, 'a slow door must never be reported as dark');
});

// ------------------------------------------------------------- droplet watcher

function boxFixture() {
  const root = tmpdir('ew-');
  const src = fs.readFileSync(BOX, 'utf8');
  const patched = src.replace(/^STATE_DIR=.*$/m, 'STATE_DIR=' + JSON.stringify(path.join(root, 'state')));
  assert.notEqual(patched, src, 'STATE_DIR rewrite did not match — the droplet fixture is invalid');
  const dst = path.join(root, 'edge-watch.sh');
  fs.writeFileSync(dst, patched);
  fs.chmodSync(dst, 0o755);
  return { root, dst, statePath: path.join(root, 'state', 'state') };
}

// Returns the subjects the script TRIED to mail. RESEND_API_KEY is stripped from
// the environment, so send_mail short-circuits to a printed line and no request
// is ever made — the owner cannot be paged by this guard.
function boxPass(fx, code, rc) {
  const env = { ...process.env, PATH: stubBin(code, rc) + ':' + process.env.PATH };
  delete env.RESEND_API_KEY;
  const r = spawnSync('bash', [fx.dst], { encoding: 'utf8', timeout: 60000, env });
  assert.equal(r.status, 0, 'edge-watch pass exited ' + r.status + ' — the arm did not run');
  assert.ok((r.stdout || '').trim().length > 0, 'edge-watch produced no output — the arm did not run');
  assert.doesNotMatch(r.stdout, /api\.resend\.com/, 'the fixture must never reach the mail API');
  return (r.stdout.match(/alert not sent: [^\n]*/g) || []);
}

test('[droplet] a door that goes DARK after slow passes mails AT ONCE', () => {
  const fx = boxFixture();
  assert.equal(boxPass(fx, ...SLOW_PASS).length, 0, 'slow pass 1 should hold its fire');
  assert.equal(boxPass(fx, ...SLOW_PASS).length, 0, 'slow pass 2 should hold its fire');
  const dark = boxPass(fx, ...DARK_PASS);
  assert.equal(dark.length, 1, 'the DARK mail was suppressed by the slow condition\'s banked passes (F-2356-1)');
  assert.match(dark[0], /watch: DARK/);
});

test('[droplet] a DARK door from a cold state still mails at once, and a healthy door mails nothing', () => {
  const cold = boxFixture();
  const dark = boxPass(cold, ...DARK_PASS);
  assert.equal(dark.length, 1);
  assert.match(dark[0], /watch: DARK/);
  const healthy = boxFixture();
  assert.equal(boxPass(healthy, ...GOOD_PASS).length, 0, 'a healthy door must page nothing');
});

test('[droplet] SLOW still holds its fire for two passes and mails on the third', () => {
  const fx = boxFixture();
  assert.equal(boxPass(fx, ...SLOW_PASS).length, 0);
  assert.equal(boxPass(fx, ...SLOW_PASS).length, 0);
  const third = boxPass(fx, ...SLOW_PASS);
  assert.equal(third.length, 1);
  assert.match(third[0], /watch: SLOW/);
});

// The state file changed shape (one number -> "<dark> <slow>"). A file left by the
// previous revision must not be read as a dark tally, which would delay the very
// page this finding is about. Unparseable state resets to 0 0 — it fails toward
// paging, which is the safe direction for an outage alarm.
test('[droplet] a legacy single-number state file cannot suppress a DARK mail', () => {
  const fx = boxFixture();
  fs.mkdirSync(path.dirname(fx.statePath), { recursive: true });
  fs.writeFileSync(fx.statePath, '7\n');
  const dark = boxPass(fx, ...DARK_PASS);
  assert.equal(dark.length, 1, 'a legacy state file suppressed the DARK mail');
  assert.match(fs.readFileSync(fx.statePath, 'utf8'), /^1 0$/m, 'state was not migrated to two fields');
});

// Recovery must describe an episode the owner was actually told about. Without
// this, a one-pass slow blip that deliberately said nothing still sends an
// all-clear for an alarm that never rang.
test('[droplet] recovery announces a paged episode and stays silent after an unpaged blip', () => {
  const afterDark = boxFixture();
  assert.equal(boxPass(afterDark, ...DARK_PASS).length, 1);
  const rec = boxPass(afterDark, ...GOOD_PASS);
  assert.equal(rec.length, 1, 'a real outage must be followed by a recovery mail');
  assert.match(rec[0], /recovered/);

  const afterBlip = boxFixture();
  assert.equal(boxPass(afterBlip, ...SLOW_PASS).length, 0, 'one slow pass must not page');
  assert.equal(
    boxPass(afterBlip, ...GOOD_PASS).length,
    0,
    'an unpaged slow blip must not mail an all-clear for an alarm nobody received',
  );
});

// Structural, over BOTH files: the defect is one tally incremented before the
// branch, so pin its absence directly. This is what makes the finding hard to
// reintroduce by a refactor that keeps every behavioural arm green in isolation.
test('neither watcher increments a single shared tally before choosing its branch', () => {
  for (const f of [MAC, BOX]) {
    const live = fs
      .readFileSync(f, 'utf8')
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n');
    const base = path.basename(f);
    assert.doesNotMatch(
      live,
      /^\s*EDGEN=\$\(\(\s*\$\{OLDEDGEN/m,
      base + ' still banks DARK and SLOW on one shared counter (F-2356-1)',
    );
    assert.doesNotMatch(
      live,
      /^\s*N=\$\(\(N \+ 1\)\)\s*$/m,
      base + ' still banks DARK and SLOW on one shared counter (F-2356-1)',
    );
    assert.match(live, /DARKN/, base + ' lost its per-condition DARK clock');
    assert.match(live, /SLOWN/, base + ' lost its per-condition SLOW clock');
  }
});
