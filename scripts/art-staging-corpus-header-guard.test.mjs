/**
 * F-2449-1 (s2449) — THE TWO BUCKETS THE ART-SLOT LAW MAKES A FIRE REPORT CANNOT
 * TELL A VANISHED CORPUS FROM A SAFE ONE. THE ONE THING THAT CAN IS THE HEADER,
 * AND IT WAS NAMED IN NO LAW SURFACE AND ASSERTED BY NO GUARD.
 *
 * BACKGROUND. s2218 handed forward a hedged guard-keyed empty enumeration in
 * `art-staging-audit.mjs` and s2221 recorded it as "still unmeasured". It stayed
 * unmeasured for 228 fires. s2449 measured it. BOTH such sites in that file are
 * SOUND — the §1b `existsSync(ART_ROOT) ? readdirSync(…) : []` and `walk()'s
 * `if (!existsSync(dir)) return acc;`. (s2218 cited `:373`; against its OWN tree
 * that line is a comment and the site it meant sat at `:324` — the coordinate was
 * born drifted. Cite the CODE.) The
 * mechanism is the point: this audit prints an ALWAYS-ON corpus declaration —
 * `ART STAGING AUDIT — <n> areas scanned, <m> files` — so an emptied scan set is
 * visible on stdout. That is F-2208-1's cure, already applied. NEGATIVE RESULT:
 * do not re-take that target.
 *
 * THE RESIDUE IS WHAT THIS GUARD PROTECTS. `scripts/fire.md`'s ART-SLOT LAW says
 * a fire "reports BOTH its AT RISK count and its LOCAL-ONLY count in the handoff
 * — those are the two buckets to read". Measured on a scratch repo whose ground
 * truth was ONE at-risk file, with the control asserting its own validity first
 * (F-2215-1 — the healthy arm produced 804 B and really did report AT RISK 1):
 *
 *   staging root PRESENT and genuinely clean → AT RISK 0 files, 0 KB
 *   staging root ABSENT (both guards return []) → AT RISK 0 files, 0 KB
 *
 * BYTE-IDENTICAL on both prescribed buckets, at the same rc. The headers differ
 * (`1 areas scanned, 1 files` vs `0 areas scanned, 0 files`) — so the discriminator
 * exists and the law simply never told anyone to look at it. That is this factory's
 * most-repeated finding: a cure that works, with no reader in the surface that
 * governs the moment it applies (F-2153-1 · F-2204-1 · F-2350-1 · F-2360-1 ·
 * F-2365-1 · F-2403-1 · F-2414-1 · F-2436-1).
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: LATENT. The staging
 * tree exists today (measured s2449: 6 areas, 1020 files), every `AT RISK 0` this
 * streak has reported was TRUE, and nothing is broken. What earns it a guard is
 * the DIRECTION — `worktrees/art/` is NOT a git worktree (no `.git`, absent from
 * `git worktree list`), so it is an ordinary directory that any move or sweep can
 * empty, no git operation would notice, and the ART slot is the RETENTION LAW's
 * largest live hole (F-1045-1), where the whole harm is bytes dying with the disk.
 *
 * Every red arm below was PROVEN BY MANUFACTURING THE DEFECT on scratch copies,
 * never by reading — a passing guard never executes its violation path, so its
 * green is not evidence about its red (the s1299/s1300 standard). Arms 1 and 6 are
 * REVERSE CONTROLS: they catch a cure one level too general (manufacturing an
 * alarm on a clean board, or pinning the header to a constant).
 *
 * The law arm derives its needle FROM THE SUBJECT rather than transcribing it, so
 * rewording the header makes this guard ask about the new wording in the same
 * commit (the `dry-board-advisory-prescription-guard` pattern, F-2365-1). An
 * empty needle REFUSES rather than passing vacuously — a `for` loop over nothing
 * registers no assertions and reports success (F-2217-1).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded, which git reads as a different directory.
const AUDIT = fs.realpathSync(fileURLToPath(new URL('./art-staging-audit.mjs', import.meta.url)));
const FIRE_MD = fs.realpathSync(fileURLToPath(new URL('./fire.md', import.meta.url)));

/**
 * The audit anchors REPO to its own import.meta.url, so the only way to aim it at
 * a fixture is to RELOCATE a copy into the fixture's own scripts/ dir.
 * `realpathSync` matters: macOS symlinks /tmp -> /private/tmp, and a path mismatch
 * has silently voided a control in this streak before (F-2215-1).
 */
function fixture({ staging = 'at-risk' } = {}) {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'art-corpus-')));
  const origin = path.join(base, 'origin.git');
  const repo = path.join(base, 'repo');
  const g = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' });

  // The fixture MUST have a pushed origin. Without one, every committed asset is
  // legitimately LOCAL-ONLY, and the clean control would read `1` where the live
  // board reads `0` — so the two buckets would appear to discriminate for a reason
  // that has nothing to do with the corpus. My first draft made exactly that
  // mistake and the control caught it: a fixture whose baseline differs from the
  // live board is measuring a different question.
  execFileSync('git', ['init', '--bare', '-q', '-b', 'main', origin], { encoding: 'utf8' });
  execFileSync('git', ['init', '-q', '-b', 'main', repo], { encoding: 'utf8' });
  g('config', 'user.email', 'guard@example.com');
  g('config', 'user.name', 'guard');
  g('remote', 'add', 'origin', origin);

  fs.mkdirSync(path.join(repo, 'assets/raw'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.copyFileSync(AUDIT, path.join(repo, 'scripts/art-staging-audit.mjs'));
  fs.writeFileSync(path.join(repo, '.gitignore'), 'worktrees/\n');
  fs.writeFileSync(path.join(repo, 'assets/raw/shipped.png'), 'SHIPPED-BYTES');
  g('add', '--', '.gitignore', 'assets/raw/shipped.png', 'scripts/art-staging-audit.mjs');
  g('commit', '-q', '-m', 'fixture: main tree');
  g('push', '-q', 'origin', 'main');
  g('fetch', '-q', 'origin');

  const stagingDir = path.join(repo, 'worktrees/art/assets/raw');
  if (staging !== 'absent') {
    fs.mkdirSync(stagingDir, { recursive: true });
    // 'at-risk' = bytes in NO object database. 'clean' = blob-identical to main.
    if (staging === 'at-risk') fs.writeFileSync(path.join(stagingDir, 'atrisk.png'), 'BYTES-IN-NO-OBJECT-DATABASE');
    else fs.writeFileSync(path.join(stagingDir, 'shipped.png'), 'SHIPPED-BYTES');
  }
  return { base, repo, stagingDir, script: path.join(repo, 'scripts/art-staging-audit.mjs') };
}

const run = (script, repo, args = []) => {
  const r = spawnSync(process.execPath, [script, ...args], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: repo, encoding: 'utf8', maxBuffer: 1 << 26,
  });
  return { rc: r.status, out: r.stdout ?? '' };
};

const headerOf = (out) => (out.match(/^ART STAGING AUDIT — .*$/m) ?? [null])[0];
const atRiskLineOf = (out) => (out.match(/^AT RISK \([^)]*\): .*$/m) ?? [null])[0];
const scannedFilesOf = (out) => {
  const m = out.match(/^ART STAGING AUDIT — \d+ areas scanned, (\d+) files/m);
  return m ? Number(m[1]) : null;
};

/**
 * The literal the law must tell a fire to look for, DERIVED from the audit's own
 * header template rather than transcribed. Returns the longest stable literal
 * between the template's interpolations.
 */
function headerNeedle() {
  const src = fs.readFileSync(AUDIT, 'utf8');
  const tpl = src.match(/`(ART STAGING AUDIT[^`]*)`/);
  if (!tpl) return null;
  const parts = tpl[1].split(/\$\{[^}]*\}/);
  // Deliberately drop parts[0]: that is the banner PREFIX ("ART STAGING AUDIT —"),
  // which names the tool rather than the thing being counted. My first draft took
  // the longest literal and got exactly that, which would have made the law read
  // like a citation instead of an instruction. The INTERIOR literals are the ones
  // that sit between the counts and therefore carry the discriminator's meaning.
  const interior = parts.slice(1).map((s) => s.trim().replace(/^[,\s]+|[,\s]+$/g, '')).filter((s) => s.length > 3);
  if (!interior.length) return null;
  return interior.sort((a, b) => b.length - a.length)[0];
}

test('REVERSE CONTROL — a genuinely clean board still reports AT RISK 0 with a POPULATED header (no manufactured alarm)', () => {
  const { base, repo, script } = fixture({ staging: 'clean' });
  try {
    const { out } = run(script, repo);
    assert.ok(out.length > 0, 'the arm must PRODUCE output before anything it says is believed (F-2215-1)');
    assert.match(atRiskLineOf(out) ?? '', /: 0 files/, 'a clean board must stay clean — this guard must not invent an alarm');
    assert.ok(scannedFilesOf(out) > 0, 'and its header must show a NON-EMPTY corpus, which is the whole discriminator');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('validity — the healthy arm really does see a file whose bytes are in no object database', () => {
  const { base, repo, script } = fixture({ staging: 'at-risk' });
  try {
    const { out } = run(script, repo);
    assert.match(atRiskLineOf(out) ?? '', /: 1 files/, 'ground truth is ONE at-risk file; if this fails the fixture is broken, not the subject');
    assert.match(out, /atrisk\.png/, 'and it must NAME it — a count with no name cannot be acted on');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('THE HARM — an ABSENT staging root is byte-identical to a clean board on BOTH buckets the ART-SLOT LAW prescribes', () => {
  const absent = fixture({ staging: 'absent' });
  const clean = fixture({ staging: 'clean' });
  try {
    const a = run(absent.script, absent.repo).out;
    const c = run(clean.script, clean.repo).out;
    assert.ok(a.length > 0 && c.length > 0, 'both arms must PRODUCE output (F-2215-1)');
    // This is the finding, asserted rather than described: the prescribed reads
    // are identical, so a fire obeying the law verbatim cannot tell these apart.
    //
    // ⓘ IF THIS ARM EVER REDS, READ IT AS NEWS AND NOT AS A DEFECT. It reds when
    // someone makes an emptied corpus LOUD on one of these buckets — which is an
    // IMPROVEMENT. What it then means is that the ART-SLOT clause in
    // `scripts/fire.md` still says "the two buckets cannot discriminate", and that
    // sentence has just become stale. Move the law text in the SAME commit; do not
    // revert the improvement to make this green. (Proven reachable: manufacturing
    // exactly that change reds this arm ALONE.)
    assert.equal(atRiskLineOf(a), atRiskLineOf(c), 'AT RISK must be identical — that is why the header is load-bearing');
    const localOnly = (o) => (o.match(/^LOCAL-ONLY \([^)]*\): .*$/m) ?? [null])[0];
    assert.equal(localOnly(a), localOnly(c), 'LOCAL-ONLY too — neither prescribed bucket can discriminate');
  } finally {
    fs.rmSync(absent.base, { recursive: true, force: true });
    fs.rmSync(clean.base, { recursive: true, force: true });
  }
});

test('THE DISCRIMINATOR — the corpus header DOES separate an emptied scan set from a clean one', () => {
  const absent = fixture({ staging: 'absent' });
  const clean = fixture({ staging: 'clean' });
  try {
    const a = run(absent.script, absent.repo).out;
    const c = run(clean.script, clean.repo).out;
    assert.ok(headerOf(a), 'the header must be present even when the corpus is empty');
    assert.ok(headerOf(c), 'and on the happy path');
    assert.notEqual(headerOf(a), headerOf(c), 'if these ever match, the audit has lost its only discriminator');
    assert.equal(scannedFilesOf(a), 0, 'an absent staging root scans zero files and must SAY so');
  } finally {
    fs.rmSync(absent.base, { recursive: true, force: true });
    fs.rmSync(clean.base, { recursive: true, force: true });
  }
});

test('the declaration is printed on the HAPPY path too — one that appears only on failure re-creates the ambiguity it removes (F-2208-1)', () => {
  const { base, repo, script } = fixture({ staging: 'clean' });
  try {
    const { rc, out } = run(script, repo);
    assert.equal(rc, 0, 'the advisory default exits 0 by design');
    assert.ok(headerOf(out), 'a clean, quiet, successful run must still declare its corpus');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('REVERSE CONTROL — the header COUNTS track the real scan set; they are not a constant', () => {
  const { base, repo, stagingDir, script } = fixture({ staging: 'clean' });
  try {
    const before = scannedFilesOf(run(script, repo).out);
    fs.writeFileSync(path.join(stagingDir, 'extra.png'), 'ANOTHER-STAGED-FILE');
    const after = scannedFilesOf(run(script, repo).out);
    assert.ok(before !== null && after !== null, 'both runs must yield a parsable header');
    assert.equal(after, before + 1, 'a header pinned to a literal would pass every other arm and report nothing');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('THE LAW must tell a fire to read the discriminator, not only the two buckets that cannot (F-2449-1)', () => {
  const needle = headerNeedle();
  // F-2217-1: an empty subject set REFUSES rather than passing vacuously.
  assert.ok(needle, 'could not derive the header literal from the audit — REFUSING rather than passing on an empty needle');
  const law = fs.readFileSync(FIRE_MD, 'utf8');
  assert.ok(
    law.includes(needle),
    `scripts/fire.md must name the audit's corpus declaration (${JSON.stringify(needle)}) in its ART-SLOT duty. ` +
    'AT RISK and LOCAL-ONLY are byte-identical for an emptied corpus and a safe one; the header is the only read that separates them.',
  );
});
