/**
 * F-2424-1 — F-2240-1's cure promises a CLASS and its detector matches an INSTANCE,
 * so every OTHER refusal wording is certified clean by the guard that names the bug.
 *
 * `dry-board-sibling-refusal-guard.test.mjs` closes with the class in its own words:
 * "IS THIS TEXT A VERDICT AT ALL? A refusal is not a verdict, and a consumer that
 * cannot say so has no way to fail safe." The detector it guards is one literal:
 *
 *     if (cap.status === 2 && CANNOT_VERIFY.test(stdout))     // /⛔ CANNOT VERIFY/
 *
 * and every fixture in that guard reproduces that ONE banner verbatim. So a sibling
 * refusal worded any other way falls past the refusal arm into `VERDICT_MARKER.test`
 * — which ⛔ satisfies — is classified like an ordinary verdict, and buckets `closed`.
 * That is F-2240-1 itself, resurrected for every wording but the one under test.
 *
 * MEASURED s2424 against the real CLI, ground truth = ONE REAL DRAIN in every arm,
 * sibling stubbed at its real exit code (the control asserted its own validity first
 * — F-2215-1 — by reaching the classify branch):
 *   CONTROL healthy sibling  (rc=0) -> drains=1 closed=0 -> "⛔ NOT DRY"           rc=1
 *   refusal, MATCHED banner  (rc=2) -> drains=1 closed=0 -> "⛔ CANNOT VERIFY"     rc=2
 *   refusal, UNMATCHED banner(rc=2) -> drains=0 closed=1 -> "✅ DRY ... earned"    rc=0
 * The last arm is the s1061 banner, in the permissive direction, in the tool §2F
 * names as the first command of every fire.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: LATENT, ZERO live
 * offenders, and the SUBJECT IS CORRECT TODAY. All four unconditional rc=2 sites in
 * drain-block-check.mjs are safe — :509 and :557 print the matched banner, :562 and
 * :596 print to STDERR only and so fall to the crash arm, i.e. the LOUD bucket. Every
 * DRY this streak declared was TRUE; verified, not assumed. Nothing here changes
 * production behaviour: this is a guard widening, not a cure for a live defect.
 *
 * What earns it a guard is that the sibling HAS ALREADY GROWN A NEW rc=2 REFUSAL
 * since the consumer's guard was written — F-2333-1 added the detached-HEAD refusal
 * at s2333, 93 fires later — and it was safe only because its author happened to
 * reuse the banner. The protection was a convention no mechanism enforced, which is
 * exactly how `fire-runner.sh`'s pointer rotted at s1456.
 *
 * THE CURE IS TO DERIVE, NOT TO WIDEN THE REGEX. Widening guesses at future wording,
 * and F-2240-1's own reverse control shows keying on ⛔ alone reclassifies all 8 live
 * genuinely-CLOSED subjects as unverifiable. Instead this guard READS the sibling and
 * asserts each rc=2 site is fail-safe, so a refusal worded differently reds in the
 * SAME COMMIT that introduces it and its author reuses the banner or widens the regex
 * deliberately. Mechanical, self-extending, and it retires itself if the arm is ever
 * reworked to key on the exit code alone.
 *
 * DECLARED BOUNDARY (an unclaimed measurement, per F-2196-1): only UNCONDITIONAL
 * `process.exit(2)` is a subject. `exit(strict ? 2 : 0)` is excluded BY CONSTRUCTION —
 * this consumer never passes --strict to the child, so that branch exits 0 with a
 * legitimate "? UNKNOWN" verdict, which is classified correctly. Arm 6 asserts the
 * exclusion rather than leaving it to a reader's trust.
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SIBLING = path.join(HERE, 'drain-block-check.mjs');
const CONSUMER = path.join(HERE, 'dry-board-probe.mjs');

const VERDICT_MARKER = /⛔|✅ CLEAR|\? UNKNOWN/;
const CANNOT_VERIFY = /⛔ CANNOT VERIFY/;

/** Strip string/template bodies so brace counting is not confused by `${...}`. */
const bare = (l) =>
  l.replace(/`(?:\\.|[^`\\])*`/g, '``').replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');

/**
 * Every unconditional `process.exit(2)`, with the stdout banners of its OWN enclosing
 * block. Scoped by BRACE MATCHING, not by a line window — and that is measured, not
 * stylistic: my first draft used a 25-line backward window and MISSED an injected
 * refusal, because a NEIGHBOURING block's matched banner exonerated the unsafe site.
 * A window fails in the PERMISSIVE direction here. Arm 7 is the control for it.
 */
function rc2Sites(source) {
  const lines = source.split('\n');
  const sites = [];
  lines.forEach((line, i) => {
    if (!/process\.exit\(2\)/.test(line)) return;
    const banners = [];
    let depth = 0;
    for (let j = i - 1; j >= 0; j--) {
      const b = bare(lines[j]);
      depth += (b.match(/\}/g) ?? []).length - (b.match(/\{/g) ?? []).length;
      if (depth < 0) break;                             // the enclosing block's opener
      if (depth !== 0) continue;                        // inside a nested sibling block
      if (!/console\.log\(/.test(lines[j])) continue;   // stdout only; console.error is stderr
      if (VERDICT_MARKER.test(lines[j])) banners.push(lines[j].trim());
    }
    // SAFE two ways: a matched refusal banner (-> the refusal arm), or NO verdict
    // marker on stdout at all (-> the crash arm -> the LOUD bucket, by construction).
    sites.push({ line: i + 1, banners, safe: banners.length === 0 || banners.some((x) => CANNOT_VERIFY.test(x)) });
  });
  return sites;
}

const SOURCE = fs.readFileSync(SIBLING, 'utf8');

/* ---- the end-to-end harness, borrowed from the guard this one extends ---- */

function board(stub) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2424-'));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-20260725-000000-seed.md'), 'x');
  fs.writeFileSync(path.join(root, 'tasks', 'done', '20260726-010101-subject.md'), 'x');
  fs.writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'), stub);
  return root;
}
const stubFor = (text, code) =>
  `process.stdout.write(${JSON.stringify(text + '\n')});\nprocess.exit(${code});\n`;

function cli(stub, mode = []) {
  const root = board(stub);
  try {
    const r = spawnSync('node', [CONSUMER, ...mode], { cwd: root, encoding: 'utf8' });
    const out = r.stdout ?? '';
    assert.ok(/REAL DRAINS/.test(out), 'the CLI arm must reach the classify branch'); // s2227
    return { out, rc: r.status };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

/** A refusal worded ANY other way. rc=2 is the sibling's own "could not answer". */
const UNMATCHED_REFUSAL = [
  '',
  '  ⛔ CANNOT READ THE BOARD — DO NOT DRAIN off this run',
  '    corpus tree     : UNREADABLE — the board could not be enumerated',
].join('\n');
const GENUINE_CLOSED = [
  '',
  '  ⛔ CLOSED — DO NOT DRAIN: fix-e2-railcar-arsenal-floor.md [e2-railcar-arsenal-floor]',
  '    refusal arm     : status="superseded" (terminal-closed)',
].join('\n');

/** The edit a future fire makes when it adds a corpus discriminator (cf. F-2333-1). */
function injectUnmatchedRefusal(source) {
  const anchor = '  if (!existsSync(GOALS)) {';
  const injected = [
    '  if (someNewCorpus === "unreadable") {',
    '    console.log(`\\n  ⛔ CANNOT READ THE BOARD — DO NOT DRAIN off this run`);',
    '    process.exit(2);',
    '  }',
  ].join('\n');
  const out = source.replace(anchor, injected + '\n' + anchor);
  assert.notEqual(out, source, 'the injection matched nothing — this arm would prove nothing');
  return out;
}

/* -------------------------------- the arms -------------------------------- */

test('1. the subject set is DERIVED from the sibling and REFUSES if empty', () => {
  const sites = rc2Sites(SOURCE);
  // F-2217-1: a loop over nothing registers no assertions and reports success. An
  // empty set here means the derivation stopped matching, not that the sibling
  // stopped refusing — so it must fail LOUD rather than pass vacuously.
  assert.ok(
    sites.length > 0,
    'derived ZERO rc=2 sites from drain-block-check.mjs — the derivation has rotted, ' +
      'not the sibling. Do not trust a green from this file until it selects again.',
  );
});

test('2. LIVE: every unconditional rc=2 site in the sibling is fail-safe', () => {
  const unsafe = rc2Sites(SOURCE).filter((s) => !s.safe);
  assert.deepEqual(
    unsafe.map((s) => `:${s.line} ${s.banners[0]}`),
    [],
    'these rc=2 refusals print a ⛔ banner on STDOUT that dry-board-probe does NOT ' +
      'recognise as a refusal, so it classifies them as verdicts and buckets them ' +
      '`closed` — "✅ DRY, the word is earned" on a board it could not read (F-2240-1). ' +
      'Either lead the banner with "⛔ CANNOT VERIFY", or widen CANNOT_VERIFY in ' +
      'dry-board-probe.mjs deliberately and update its reverse controls.',
  );
});

test('3. TEETH: a differently-worded rc=2 refusal is DETECTED', () => {
  const unsafe = rc2Sites(injectUnmatchedRefusal(SOURCE)).filter((s) => !s.safe);
  assert.equal(unsafe.length, 1, 'the injected refusal must be the one unsafe site');
  assert.match(unsafe[0].banners[0], /CANNOT READ THE BOARD/);
});

test('4. and the defect it detects is LOAD-BEARING — measured, not asserted', () => {
  // Why this arm exists: arms 2 and 3 assert a property of the sibling's SOURCE. This
  // one proves that property is the thing standing between the factory and a false
  // DRY, by running the real consumer against the real defect (F-2209-1's rule —
  // test from where the caller stands).
  const { out, rc } = cli(stubFor(UNMATCHED_REFUSAL, 2), ['--strict']);
  assert.match(out, /The word is earned/, 'the unmatched refusal really does earn the word');
  assert.doesNotMatch(out, /SIBLING REFUSED/, 'and it is not named as a refusal');
  assert.equal(rc, 0, 'byte-identical in rc to a genuinely clean board');
});

test('5. REVERSE CONTROL: a GENUINE closure (rc=1) must still be `closed`', () => {
  // The over-general cure — keying on ⛔ alone, or treating every rc=2 as a refusal —
  // reds here and nowhere else: it converts all 8 of the live board's genuinely-closed
  // subjects into refusals and reds the mandated battery on a correct board.
  const { out, rc } = cli(stubFor(GENUINE_CLOSED, 1));
  assert.match(out, /The word is earned/, 'a real closure must still earn the word');
  assert.doesNotMatch(out, /SIBLING REFUSED/);
  assert.equal(rc, 0);
});

test('6. DECLARED BOUNDARY: `exit(strict ? 2 : 0)` is excluded by construction', () => {
  // Asserted rather than trusted. That branch prints "? UNKNOWN", a legitimate
  // verdict; this consumer never passes --strict, so it exits 0 and is classified
  // correctly. Requiring a CANNOT VERIFY banner there would red a correct file.
  assert.match(SOURCE, /process\.exit\(strict \? 2 : 0\)/, 'the conditional exit still exists');
  const lines = rc2Sites(SOURCE).map((s) => s.line);
  const conditional = SOURCE.split('\n')
    .map((l, i) => (/process\.exit\(strict \? 2 : 0\)/.test(l) ? i + 1 : 0))
    .filter(Boolean);
  for (const n of conditional) assert.ok(!lines.includes(n), `:${n} must not be a subject`);
});

test('7. CONTROL for the derivation itself: a neighbour must not exonerate a site', () => {
  // Measured, not predicted. A 25-line backward window — my first draft — calls the
  // injected site SAFE, because the detached-HEAD block's matched banner sits within
  // the window. A window fails PERMISSIVE here, which is why the scope is brace-matched.
  const variant = injectUnmatchedRefusal(SOURCE);
  const lines = variant.split('\n');
  const windowed = lines
    .map((l, i) => (/process\.exit\(2\)/.test(l) ? i : -1))
    .filter((i) => i >= 0)
    .map((i) => {
      const banners = lines.slice(Math.max(0, i - 25), i)
        .filter((l) => /console\.log\(/.test(l) && VERDICT_MARKER.test(l));
      return banners.length === 0 || banners.some((x) => CANNOT_VERIFY.test(x));
    });
  assert.ok(windowed.every(Boolean), 'the window really is blind here — the control is valid');
  assert.equal(rc2Sites(variant).filter((s) => !s.safe).length, 1, 'brace-matching sees it');
});
