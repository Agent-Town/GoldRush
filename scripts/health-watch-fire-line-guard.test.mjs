// F-2640-1 (s2640) — the `fire :` row of `health-watch.sh status` must never claim
// "between-fires" to the fire that is reading it.
//
// WHY THIS GUARD EXISTS. §2.0c makes `bash scripts/health-watch.sh status` a BINDING
// triage read on every fire, and §2.0d routes it through node — so the fire is always an
// ANCESTOR of the pgrep that `fire_proc` spawns. MEASURED s2640, with the control
// asserting its own validity first: `pgrep -f .` returned 1062 pids and ZERO of the
// caller's four ancestors, while two NON-ancestor controls of the same comm (/bin/zsh,
// bash) were visible. The variables were separated rather than assumed — a non-ancestor
// child carrying a 900,094-byte argv was matched at BOTH the start and the very END of
// it, so neither argv SIZE nor match POSITION explains the miss (the fire's own argv is
// 973,203 B), while a 72-byte ancestor (fire-runner.sh) is invisible, so ANCESTRY ALONE
// is sufficient. `fire_proc` is therefore structurally incapable of seeing its own
// caller, and the row read "between-fires" on every fire, forever, while one was live.
//
// The cure DECLARES and does not refuse: exit codes are untouched. The guard is
// EXTRACTION-based, the house pattern for this file family (main-lock-gate-guard
// evaluates its predicate by extraction against one shared fixture set), because running
// the real dashboard() would fire three curl edge probes at up to 10 s each.
//
// SCOPE NOTE, measured: the launchd `watch` path is unaffected — a fire is not that
// agent's ancestor, and that path never calls dashboard() (health-watch.sh :191 runs it
// for `status` only, then exits). Check 3's dead-lock alert is sound and its 89 entries
// in logs/health.log are NOT false positives from this cause.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Anchored to the script's own directory, never to cwd: a relocated copy must still be
// correct, and a cwd-rooted corpus is the F-2220-1 silent-narrowing trap.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUBJECT = join(ROOT, 'scripts', 'health-watch.sh');

const source = () => readFileSync(SUBJECT, 'utf8');

/** Extract the fire-row branch block. REFUSES rather than returning empty (F-2217-1). */
function fireBlock(src = source()) {
  const lines = src.split('\n');
  const start = lines.findIndex((l) => /^\s*if\s+fire_proc;\s*then\s*$/.test(l));
  assert.ok(
    start >= 0,
    'REFUSING: no `if fire_proc; then` block in health-watch.sh — the subject this guard ' +
      'measures is gone, and an empty extraction must fail LOUD rather than pass vacuously.',
  );
  const indent = (lines[start].match(/^\s*/) || [''])[0];
  const end = lines.findIndex((l, i) => i > start && l === `${indent}fi`);
  assert.ok(end > start, 'REFUSING: unterminated fire_proc block — cannot extract the subject.');
  const block = lines.slice(start, end + 1).join('\n');
  assert.ok(block.length > 0, 'REFUSING: extracted an empty block.');
  return block;
}

/**
 * Evaluate the extracted block with `fire_proc` stubbed and the fire-shell discriminator
 * controlled. Asserts the arm actually RAN before its output is believed (F-2215-1): a
 * control whose failure mode is silence cannot be told from the silence it measures.
 */
function evaluate({ fireProcTrue, configDir }) {
  const stub = `fire_proc() { return ${fireProcTrue ? 0 : 1}; }\n`;
  const env = { ...process.env };
  if (configDir === undefined) delete env.CLAUDE_CONFIG_DIR;
  else env.CLAUDE_CONFIG_DIR = configDir;

  const r = spawnSync('bash', ['-c', stub + fireBlock()], {
    encoding: 'utf8',
    env,
    timeout: 240_000,
    killSignal: 'SIGKILL',
  });
  assert.equal(r.status, 0, `the arm did not run cleanly: rc=${r.status} stderr=${r.stderr}`);
  const out = (r.stdout || '').trim();
  assert.ok(out.length > 0, 'the arm produced NO output — it did not really run (F-2215-1)');
  return out;
}

test('1. a live fire reading its own panel is told so, and the row names the finding', () => {
  const out = evaluate({ fireProcTrue: false, configDir: '/Users/robin/.claude-fires' });
  assert.match(out, /^fire\s+:/, 'the row must keep its `fire   :` shape');
  assert.doesNotMatch(
    out,
    /between-fires/,
    'a fire reading its own panel must NEVER be told "between-fires" — that is the whole defect',
  );
  assert.match(out, /RUNNING/, 'the row must say a fire is running');
  assert.match(out, /F-2640-1/, 'the row must cite the finding so the claim is auditable at the site');
});

test('2. the row explains WHY the probe could not count it — the reusable half', () => {
  const out = evaluate({ fireProcTrue: false, configDir: '/Users/robin/.claude-fires' });
  assert.match(
    out,
    /ancestor/i,
    'a reader must be told the mechanism (pgrep cannot see its own ancestors), not merely the verdict',
  );
});

test('3. REVERSE CONTROL — a genuinely idle board still reads "between-fires"', () => {
  const out = evaluate({ fireProcTrue: false, configDir: undefined });
  assert.match(out, /between-fires/, 'a non-fire caller with no fire process must read between-fires');
  assert.doesNotMatch(
    out,
    /F-2640-1/,
    'the declaration must NOT be always-on: an unconditional line is how a declaration ' +
      'decays into a formality (F-2208-1 applied in the restraining direction)',
  );
});

test('4. REVERSE CONTROL — a visible fire process still reads a plain RUNNING', () => {
  const out = evaluate({ fireProcTrue: true, configDir: undefined });
  assert.match(out, /RUNNING/);
  assert.doesNotMatch(out, /between-fires/);
  assert.doesNotMatch(
    out,
    /F-2640-1/,
    'when pgrep CAN see the fire there is no blind spot to declare',
  );
});

test('5. an EMPTY discriminator is not a present one', () => {
  // `-n` semantics: CLAUDE_CONFIG_DIR="" must not be read as "a fire is calling".
  const out = evaluate({ fireProcTrue: false, configDir: '' });
  assert.match(out, /between-fires/, 'an empty CLAUDE_CONFIG_DIR must fall to the idle branch');
});

test('6. the cure carries its provenance at the site (F-1667-1)', () => {
  const src = source();
  assert.match(
    src,
    /F-2640-1/,
    'an un-annotated cure can be undone by a later tidy with no channel saying so',
  );
  assert.match(src, /900,094-byte argv/, 'the measurement that separated the variables must survive');
  assert.match(src, /CLAUDE_CONFIG_DIR/, 'the discriminator must be named where it is used');
});

test('7. the cure cannot leak into the launchd watch path', () => {
  const src = source();
  // dashboard() is reached ONLY by the `status` dispatch, which then exits. If that ever
  // stops being true, this cure's scope argument stops being true with it.
  assert.match(
    src,
    /if \[ "\$\{1:-\}" = "status" \]; then dashboard; exit \$\?; fi/,
    'dashboard() must remain reachable only from the `status` dispatch — the launchd agent ' +
      'runs with no argument and must never print this row',
  );
});
