/**
 * F-2246-1 — nul-audit's SUBJECT TEST must cover the CLAIM its banner makes.
 *
 * The banner is universal ("no raw NUL bytes in tracked text sources") while the subject
 * test was a 14-extension ALLOW-LIST, so ~1,109 tracked text files — py, log, jsonl, rc,
 * toml, tsv, xml, conf, `public/_headers`, the SHA256SUMS integrity files — were never
 * subjects, and F-2220-1's corpus declaration could not say so because it counts
 * POST-FILTER subjects only.
 *
 * WHY THESE ARMS. Arm 1 is the defect itself and is the only one that proves the widening;
 * arms 4 and 5 are REVERSE CONTROLS for the two over-general cures (refusing on an
 * unclassified suffix, and inverting to a pure deny-list so that new binary assets red the
 * gate). Arm 7 exists because the --quiet neutrality check compares two SILENCES, which
 * s2224 proved is the one result that must never be counted as agreement: it asserts the
 * quiet path still REACHES the verdict. Arm 8 pins F-2220-1's cure so this one cannot
 * regress it.
 *
 * Every red path below was proven by MANUFACTURING the defect on a scratch copy, not by
 * reading a green.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AUDIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'nul-audit.mjs');
const NUL = String.fromCharCode(0);
const roots = [];

/**
 * A tracked-file fixture. `files` maps a relative path to its bytes; anything containing
 * NUL is written raw so the audit meets a genuine binary-shaped file, not an escape.
 */
function fixture(files) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'nul-scope-')));
  roots.push(root);
  execFileSync('git', ['init', '-q'], { cwd: root });
  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  }
  execFileSync('git', ['add', '-A'], { cwd: root });
  return root;
}

function run(root, args = [], script = AUDIT) {
  const r = spawnSync('node', [script, ...args], { cwd: root, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

process.on('exit', () => {
  for (const r of roots) { try { rmSync(r, { recursive: true, force: true }); } catch {} }
});

test('1. a NUL in a tracked .py is FOUND — the defect arm', () => {
  const root = fixture({
    'src/app.py': `x = 1${NUL}\n`,
    'readme.md': 'clean\n',
  });
  const cured = run(root);
  assert.equal(cured.rc, 1, 'a NUL-bearing tracked text source must red');
  assert.match(cured.out, /carry raw NUL bytes/);
  assert.match(cured.out, /src\/app\.py/, 'the file must be NAMED, not merely counted');
});

test('2. the corpus declaration reports BOTH sides of the denominator, always', () => {
  const root = fixture({ 'readme.md': 'clean\n', 'logo.png': `\x89PNG${NUL}` });
  const { rc, out } = run(root);
  assert.equal(rc, 0);
  assert.match(out, /CLEAN/);
  assert.match(out, /corpus \d+ text subject\(s\)/, 'kept side');
  assert.match(out, /excluded \d+ known-binary, \d+ UNCLASSIFIED of \d+ tracked file\(s\)/,
    'discarded side — printed on the HAPPY path too (F-2208-1)');
});

test('3. an UNLISTED suffix is named rather than vanishing', () => {
  const root = fixture({ 'readme.md': 'clean\n', 'notes.wibble': 'text\n' });
  const { out } = run(root);
  assert.match(out, /1 UNCLASSIFIED/);
  assert.match(out, /\.wibble×1/, 'the new suffix announces itself by name');
});

test('4. REVERSE CONTROL — an unclassified suffix DECLARES and does NOT refuse', () => {
  const root = fixture({ 'readme.md': 'clean\n', 'notes.wibble': 'text\n' });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'an unlisted suffix is a lawful state; refusing here is the F-1460-1 fate');
  assert.match(out, /CLEAN/);
});

test('5. REVERSE CONTROL — NULs in known-binary do NOT red the gate', () => {
  const root = fixture({
    'readme.md': 'clean\n',
    'art/sheet.png': `\x89PNG\r\n${NUL}${NUL}IHDR${NUL}`,
    'audio/theme.mp3': `ID3${NUL}${NUL}`,
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'binary carrying NUL is the file working correctly — reding here would be excused away');
  assert.match(out, /CLEAN/);
});

test('6. the three buckets PARTITION the tracked set — nothing falls out unaccounted', () => {
  const root = fixture({
    'a.md': 'x\n', 'b.py': 'y\n', 'c.jsonl': '{}\n',
    'd.png': `${NUL}`, 'e.wibble': 'z\n',
  });
  const { out } = run(root);
  const subjects = Number(out.match(/corpus (\d+) text subject/)[1]);
  const binary = Number(out.match(/excluded (\d+) known-binary/)[1]);
  const unclassified = Number(out.match(/, (\d+) UNCLASSIFIED/)[1]);
  const total = Number(out.match(/of (\d+) tracked file\(s\)/)[1]);
  assert.equal(subjects + binary + unclassified, total,
    'every tracked file must land in exactly one named bucket');
  assert.equal(total, 5);
});

test('7. --quiet still REACHES the verdict (an agreeing silence is not agreement)', () => {
  const dirty = fixture({ 'src/app.py': `x${NUL}\n` });
  const clean = fixture({ 'src/app.py': 'x\n' });
  const d = run(dirty, ['--quiet']);
  const c = run(clean, ['--quiet']);
  assert.equal(d.out, '', 'quiet suppresses the report');
  assert.equal(c.out, '', 'quiet suppresses the report');
  assert.equal(d.rc, 1, 'silence must not mean the verdict was skipped (s2224)');
  assert.equal(c.rc, 0);
});

test('8. F-2220-1 is NOT regressed — a narrowed scan still refuses on stdout', () => {
  const root = fixture({ 'scripts/keep.md': 'x\n', 'readme.md': 'y\n' });
  const { rc, out } = run(path.join(root, 'scripts'));
  assert.equal(rc, 2, '2 = could not answer');
  assert.match(out, /CANNOT VERIFY/, 'the refusal must reach STDOUT, not just stderr');
});
