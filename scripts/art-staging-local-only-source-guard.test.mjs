/**
 * F-2216-1 (s2216) — THE LOCAL-ONLY BUCKET MUST DECLARE WHETHER IT WAS ASKED.
 *
 * `art-staging-audit.mjs` step 2b asks `git diff origin/main..main -- assets/`
 * for assets committed to main and never pushed. That source was added by
 * F-1184-5 to cure this audit's THIRD false zero. Its failure was swallowed by a
 * bare `catch`, justified by a comment reading "no origin, or no origin/main
 * remote-tracking ref yet ... a missing remote is already the loudest possible
 * signal." Measured s2216, both halves are false:
 *
 *   - the catch also fires when the REMOTE IS PRESENT and only the `origin/main`
 *     REF is unavailable. `offsite` is then still populated from the other
 *     remote-tracking refs (137 on this repo), so nothing is loud at all — the
 *     unpushed files simply never enter `scan` and land in no bucket;
 *   - and it fires for any other failure of that one call, which the comment
 *     never contemplated (F-2212-1's class: correct for its named cause, blind
 *     to every other one).
 *
 * On a scratch repo whose ground truth was one unpushed asset, the pre-cure
 * script reported `LOCAL-ONLY 0 files`, `--strict` rc=0 and `--json`
 * localOnlyFiles 0 — all THREE machine channels byte-identical to a genuinely
 * safe board. That is F-2208-1's shape ("could not answer" == "the answer is
 * clean") sitting inside this audit's own cure, and it is the number the
 * ART-SLOT LAW makes every dry-board fire report to the owner.
 *
 * Every red arm below was PROVEN BY MANUFACTURING THE DEFECT on a scratch copy,
 * never by reading — a passing guard never executes its violation path, so its
 * green is not evidence about its red (the s1299/s1300 standard). Arms 1, 5 and
 * 6 are REVERSE CONTROLS: they are what catch a cure that is one level too
 * general (collapsing 1 into 2, declaring only on failure, or manufacturing an
 * alarm on a clean board).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded. The subject file's own header warns
// about exactly this, and writing this guard walked straight into it.
const AUDIT = fs.realpathSync(fileURLToPath(new URL('./art-staging-audit.mjs', import.meta.url)));

/**
 * A scratch repo whose ground truth is exactly one unpushed asset.
 * `realpathSync` matters: macOS symlinks /tmp -> /private/tmp, and a path
 * mismatch has silently voided a control in this streak before (F-2215-1).
 */
function fixture({ unpushed = true } = {}) {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'art-local-only-')));
  const origin = path.join(base, 'origin.git');
  const repo = path.join(base, 'repo');
  const g = (...a) => execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8' });

  execFileSync('git', ['init', '--bare', '-b', 'main', origin], { encoding: 'utf8' });
  execFileSync('git', ['init', '-b', 'main', repo], { encoding: 'utf8' });
  g('config', 'user.email', 'guard@example.com');
  g('config', 'user.name', 'guard');
  g('remote', 'add', 'origin', origin);

  fs.mkdirSync(path.join(repo, 'assets'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'worktrees/art/assets'), { recursive: true });
  // The audit derives its REPO from its own import.meta.url, so the copy must
  // live in the fixture's scripts/ dir or it would audit the wrong tree.
  fs.copyFileSync(AUDIT, path.join(repo, 'scripts/art-staging-audit.mjs'));

  fs.writeFileSync(path.join(repo, 'assets/shipped.png'), 'SHIPPED-BYTES');
  g('add', '--', 'assets/shipped.png', 'scripts/art-staging-audit.mjs');
  g('commit', '-q', '-m', 'shipped asset');
  g('push', '-q', 'origin', 'main');
  // A second pushed branch, so origin keeps other remote-tracking refs. This is
  // the live repo's shape and it is what keeps `offsite` populated — i.e. what
  // makes the missing-origin/main case QUIET rather than loud.
  g('branch', 'save/other');
  g('push', '-q', 'origin', 'save/other');

  if (unpushed) {
    fs.writeFileSync(path.join(repo, 'assets/unpushed.png'), 'BYTES-THAT-DIE-WITH-THIS-DISK');
    g('add', '--', 'assets/unpushed.png');
    g('commit', '-q', '-m', 'committed to main, never pushed — the subject');
  }
  g('fetch', '-q', 'origin');
  return { base, repo, g, script: path.join(repo, 'scripts/art-staging-audit.mjs') };
}

/** A `git` earlier on PATH that fails ONLY on the origin/main..main diff. */
function brokenGitPath(base) {
  const dir = path.join(base, 'shim');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'git'),
    `#!/bin/sh\nfor a in "$@"; do\n  case "$a" in\n    origin/main..main) echo "fatal: cannot fork" >&2; exit 128;;\n  esac\ndone\nexec ${execFileSync('which', ['git'], { encoding: 'utf8' }).trim()} "$@"\n`,
  );
  fs.chmodSync(path.join(dir, 'git'), 0o755);
  return `${dir}:${process.env.PATH}`;
}

const run = (script, repo, args = [], env = {}) => {
  const r = spawnSync(process.execPath, [script, ...args], {
    timeout: 240_000, killSignal: 'SIGKILL',
    cwd: repo, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 1 << 26,
  });
  return { rc: r.status, out: r.stdout ?? '' };
};

const localOnlyCount = (out) => {
  const m = out.match(/^LOCAL-ONLY \([^)]*\): (\d+) files/m);
  return m ? Number(m[1]) : null;
};

test('REVERSE CONTROL — real unpushed content refuses with 1, not 2 (a cure that collapses the two codes is caught here)', () => {
  const { base, repo, script } = fixture();
  try {
    const advisory = run(script, repo);
    assert.equal(localOnlyCount(advisory.out), 1, 'the healthy path must still see the unpushed asset');
    assert.match(advisory.out, /unpushed\.png/, 'and must NAME it — a count with no name cannot be acted on');
    assert.equal(run(script, repo, ['--strict']).rc, 1, '1 = answered, and the answer refuses');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('origin/main ref unavailable while the remote and its other refs are present — --strict refuses with 2, never 0', () => {
  const { base, repo, g, script } = fixture();
  try {
    g('update-ref', '-d', 'refs/remotes/origin/main');
    g('update-ref', '-d', 'refs/remotes/origin/HEAD');
    const advisory = run(script, repo);
    assert.equal(localOnlyCount(advisory.out), 0, 'precondition: the bucket really does go blind here');
    assert.match(advisory.out, /UNDER-REPORTED/, 'the blindness must be declared on stdout, the channel a caller reads');
    assert.match(advisory.out, /FLOOR, not a verdict/, 'and must say what the number now means');
    assert.equal(run(script, repo, ['--strict']).rc, 2, '2 = could not answer. Pre-cure this was 0.');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('a transient failure of that one call, origin/main present — declared distinctly, --strict refuses with 2', () => {
  const { base, repo, script } = fixture();
  try {
    const env = { PATH: brokenGitPath(base) };
    const advisory = run(script, repo, [], env);
    assert.equal(localOnlyCount(advisory.out), 0);
    assert.match(advisory.out, /CANNOT VERIFY/, 'a crash with the ref PRESENT is a different owed act from a missing ref');
    assert.doesNotMatch(advisory.out, /UNDER-REPORTED/, 'the two causes must not be conflated');
    assert.equal(run(script, repo, ['--strict'], env).rc, 2);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('the advisory default still exits 0 even when the source did not run — a routine audit must never block a drain', () => {
  const { base, repo, script } = fixture();
  try {
    const env = { PATH: brokenGitPath(base) };
    assert.equal(run(script, repo, [], env).rc, 0, 'only --strict may refuse (the file\'s own standing intent)');
    assert.equal(run(script, repo, ['--json'], env).rc, 0);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('REVERSE CONTROL — the declaration is printed on the HAPPY path too, so "asked and empty" is distinguishable from "never asked"', () => {
  const { base, repo, script } = fixture({ unpushed: false });
  try {
    const advisory = run(script, repo);
    assert.equal(localOnlyCount(advisory.out), 0);
    assert.match(
      advisory.out,
      /committed-but-unpushed source: ran/,
      'a declaration that appears ONLY on failure re-creates the ambiguity it was built to remove (F-2208-1; the §4 desk-header precedent)',
    );
    const json = JSON.parse(run(script, repo, ['--json']).out);
    assert.equal(json.mainTreeSource, 'ok', '--json must carry it too — F-2196-1 set that precedent in this same file');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('REVERSE CONTROL — a genuinely clean board stays quiet in both modes (a cure that manufactures an alarm is caught here)', () => {
  const { base, repo, script } = fixture({ unpushed: false });
  try {
    assert.equal(run(script, repo).rc, 0);
    assert.equal(run(script, repo, ['--strict']).rc, 0, 'clean + source ran = 0. Nothing is owed and nothing may be invented.');
    assert.doesNotMatch(run(script, repo).out, /⛔/, 'no refusal banner on a board that is actually safe');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});
