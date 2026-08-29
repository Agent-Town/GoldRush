// F-2355-1 — the public-door probe must never CONCATENATE a code with its fallback.
//
// `curl -so /dev/null -m N -w '%{http_code}' URL || echo 000` reads like a
// substitution and is not one: -w has already written the code to stdout by the
// time curl's exit status is known, so a request that receives a status and THEN
// fails mid-transfer captures BOTH and yields `200000`. Measured s2355 against the
// live door (a 200 that misses the budget prints exactly that) and reproduced here
// with a stubbed curl. Both consumers classified the composite as "not 200":
//   - scripts/health-watch.sh   -> the edge line §2.0c makes every fire read
//   - ops/droplet/edge-watch.sh -> a 5-min systemd timer that MAILS the owner DARK
// Neither direction was a false green (both fail toward alarm), but an outage
// alarm that cries wolf on ordinary transient slowness is one nobody reads by the
// time it matters (F-1460-1) — and this is the only watch over the public door.
//
// Two assertion classes, and the split is deliberate rather than lazy:
//   BEHAVIOURAL for health-watch.sh, which is executable here under a stub curl.
//   STRUCTURAL for edge-watch.sh, which cannot run on this machine (it hardcodes
//   /var/lib state, calls systemctl, and mails through Resend). A structural
//   assertion is the honest ceiling for that file, not a shortcut — the two
//   scripts are deliberately SELF-CONTAINED (a shared helper would have to be
//   resolvable from /opt/goldrush on the droplet too), so the duplicated logic
//   is guarded by asserting the cure is present in both rather than by importing.
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

// A stub curl that prints a code on stdout and then exits with a chosen status —
// which is precisely the shape that produced the composite.
function edgeLineFor(code, rc) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-stub-'));
  try {
    fs.writeFileSync(path.join(dir, 'curl'), `#!/bin/bash\nprintf '${code}'\nexit ${rc}\n`);
    fs.chmodSync(path.join(dir, 'curl'), 0o755);
    const r = spawnSync('bash', [MAC, 'status'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${dir}:${process.env.PATH}` },
    });
    const line = (r.stdout || '').split('\n').find((l) => l.startsWith('edge'));
    // F-2215-1: assert the arm actually RAN before believing what it says. A
    // control whose failure mode is silence cannot be told from the silence it
    // measures, and an empty stdout here would satisfy every "does not contain"
    // assertion below for entirely the wrong reason.
    assert.ok(r.status === 0, `health-watch status exited ${r.status}`);
    assert.ok(line, 'no edge line produced — the arm did not run');
    // Return the READINGS only. The legend that follows them documents the slow
    // state and therefore contains the word "slow" on every healthy run — asserting
    // against the whole line tests the legend, not the probe. (Caught by this
    // guard's own reverse controls on first run, which is what they are for.)
    const readings = line.match(/landing=\S+\s+game=\S+\s+api=\S+/);
    assert.ok(readings, `edge line carried no readings: ${line}`);
    return readings[0];
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('a code followed by a failed transfer reads as slow, never as a composite', () => {
  const line = edgeLineFor('200', 28);
  assert.match(line, /landing=200-slow/);
  assert.doesNotMatch(line, /200000/, 'the fallback concatenated instead of substituting');
});

test('a request that never answered reads as 000, not 000000, and is not "slow"', () => {
  const line = edgeLineFor('000', 28);
  // \s not \b: `-` is a word boundary, so /landing=000\b/ is satisfied by
  // `landing=000-slow` — which let an over-general "every failure is slow" cure
  // through this guard entirely. Found by the reverse-control sweep, not by review.
  assert.match(line, /landing=000\s/);
  assert.doesNotMatch(line, /000000/);
  // A door that never answered is DARK. Calling it slow would demote a real
  // outage into the condition that deliberately does not page at once.
  assert.doesNotMatch(line, /slow/);
});

// Reverse control: the cure must not move good news. If this reds, the fix has
// started reporting healthy doors as degraded, which is worse than the defect.
test('a healthy door still reads exactly 200', () => {
  const line = edgeLineFor('200', 0);
  assert.match(line, /landing=200\s/);
  assert.doesNotMatch(line, /slow/);
});

// Reverse control: a genuinely dark door must still read dark, at its own code.
// A cure that swallowed 521 into "slow" would retire the F-OUT-0829 alarm.
test('a real non-200 still reads as its own code', () => {
  const line = edgeLineFor('521', 0);
  assert.match(line, /landing=521/);
  assert.doesNotMatch(line, /slow/);
});

test('neither probe carries the concatenating fallback', () => {
  for (const f of [MAC, BOX]) {
    const src = fs.readFileSync(f, 'utf8');
    const live = src
      .split('\n')
      .filter((l) => !l.trim().startsWith('#'))
      .join('\n');
    assert.doesNotMatch(
      live,
      /%\{http_code\}'[^\n]*\|\|\s*echo/,
      `${path.basename(f)} still pipes a -w code into a || echo fallback (F-2355-1)`,
    );
  }
});

test('the droplet watcher classifies slow apart from dark', () => {
  const src = fs.readFileSync(BOX, 'utf8');
  assert.match(src, /\*-slow\)\s*SLOW=1/, 'edge-watch.sh no longer buckets a slow door apart');
  assert.match(src, /watch: SLOW/, 'edge-watch.sh no longer has a distinct SLOW mail');
  assert.match(src, /watch: DARK/, 'edge-watch.sh lost its DARK mail');
});

// The composite was unreadable partly because the legend promised only two
// states. A third state that the line can print but the legend cannot explain
// is how the next fire mis-reads it.
test('the dashboard legend names the slow state it can print', () => {
  const src = fs.readFileSync(MAC, 'utf8');
  assert.match(src, /edge\s+:.*slow/, 'the edge legend does not mention the slow state');
});
