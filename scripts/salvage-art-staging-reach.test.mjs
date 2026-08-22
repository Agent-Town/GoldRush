#!/usr/bin/env node
/**
 * salvage-art-staging-reach — does the prescribed cure REACH the exposure?
 *
 * WHY (F-1658-1, s1658): `art-staging-audit.mjs` raises the alarm and
 * `salvage-art-staging.mjs` is the cure named in the alarm's own remedy text
 * (`scripts/health-watch.sh:139`) and in the owner's 530 MB desk question
 * (F-1640-1, "salvage to a branch"). The audit was widened three times
 * (F-1054-1 name->blob, F-1055-1 remote refs, F-1120-2 one-dir->recursive
 * enumeration); the salvage script was never revisited. Measured live at s1658:
 * the audit found AT RISK 582 files / 527.89 MB, ALL of them nested under
 * `motion-pilot/`, and the salvage script's --dry-run offered 3 files from
 * `raw/`, none at risk. Reach: 0 of 582. It would have written a save/* branch,
 * printed a success line, and ended no exposure at all.
 *
 * A green here proves nothing on its own — a passing guard never executes its
 * own violation path. So the two tests that matter MANUFACTURE the historical
 * defect (a mutated copy of the real script) and assert the mutant UNDER-REACHES
 * the same fixture the real script clears. If a future edit makes a mutation
 * inapplicable, the test FAILS LOUDLY rather than silently skipping.
 *
 * Every test runs against a scratch repo built in tmp, so nothing here depends
 * on the live board's state and nothing here can touch it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./salvage-art-staging.mjs', import.meta.url));
const SOURCE = readFileSync(SCRIPT, 'utf8');

const git = (repo, ...args) =>
  execFileSync('git', ['-C', repo, '-c', 'user.email=f@g.r', '-c', 'user.name=fire', ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  }).trim();

/** A scratch repo with a `main` branch, a tracked assets/ tree, and an art staging dir. */
const makeRepo = () => {
  const repo = mkdtempSync(join(tmpdir(), 'gr-salvage-test-'));
  git(repo, 'init', '--quiet');
  git(repo, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  mkdirSync(join(repo, 'assets/raw'), { recursive: true });
  writeFileSync(join(repo, 'assets/raw/shipped.png'), 'SHIPPED-BYTES');
  git(repo, 'add', '--', 'assets/raw/shipped.png');
  git(repo, 'commit', '--quiet', '-m', 'base');
  return repo;
};

/** Put a file into the ART staging tree at `worktrees/art/assets/<rel>`. */
const stage = (repo, rel, contents) => {
  const p = join(repo, 'worktrees/art/assets', rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, contents);
  return p;
};

/** Install the real script, or a mutated variant of it, and run it. */
const run = (repo, args, source = SOURCE) => {
  writeFileSync(join(repo, 'scripts/salvage-art-staging.mjs'), source);
  try {
    return { rc: 0, out: execFileSync('node', [join(repo, 'scripts/salvage-art-staging.mjs'), ...args], {
      encoding: 'utf8', maxBuffer: 1 << 26,
    }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
};

/** Textual mutation that must actually apply — a no-op mutation would fake a pass. */
const mutate = (from, to) => {
  assert.ok(SOURCE.includes(from), `mutation target absent from the script — this guard has rotted: ${from}`);
  const out = SOURCE.replace(from, to);
  assert.notEqual(out, SOURCE, 'mutation did not change the source');
  return out;
};

const atRiskCount = (out) => {
  const m = out.match(/AT RISK \(in NO object database\): (\d+) file/);
  return m ? Number(m[1]) : null;
};

/**
 * A mutant can under-reach in two shapes, and both are the defect: it can report
 * `AT RISK 0`, or it can miss the staging area entirely and bail at the earlier
 * "nothing under ..." exit without printing a count at all. The historical
 * one-dir reader does the second — it never even looked at motion-pilot.
 */
const assertUnderReached = (out, needle) => {
  const n = atRiskCount(out);
  assert.ok(n === 0 || n === null, `the mutant should have under-reached, but reported:\n${out}`);
  assert.ok(!out.includes(needle), `the mutant unexpectedly reached ${needle}:\n${out}`);
};

test('reaches a NESTED staging file — the F-1120-2 class', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
    assert.match(out, /assets\/motion-pilot\/pose-library\/hero\/frames\/hero-01\.png/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: the historical one-dir, non-recursive reader finds NONE of it', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    // The s1045 shape: only `raw`, and only its top level.
    const old = mutate(
      'for (const file of walk(STAGING_ROOT)) {',
      "const RAW = join(STAGING_ROOT, 'raw');\n" +
        'for (const file of (existsSync(RAW)\n' +
        '  ? readdirSync(RAW).map((n) => join(RAW, n)).filter((p) => statSync(p).isFile())\n' +
        '  : [])) {',
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assertUnderReached(out, 'hero-01.png');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('reaches a file sitting LOOSE at the staging root — the F-1658-3 class', () => {
  const repo = makeRepo();
  try {
    // No subdirectory at all. The directories-only enumeration both this script
    // and art-staging-audit.mjs used could never see this file; the live
    // casualty was the ART slot's own LEDGER.md, 62,822 bytes in no object db.
    stage(repo, 'LEDGER.md', 'ART LEDGER — UNIQUE BYTES, IN NO OBJECT DATABASE');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
    assert.match(out, /staging\/\(root\)/);
    assert.match(out, /assets\/LEDGER\.md/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: a directories-only enumeration finds none of the root file', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'LEDGER.md', 'ART LEDGER — UNIQUE BYTES, IN NO OBJECT DATABASE');
    stage(repo, 'raw/other.png', 'SO THE SCAN IS NOT EMPTY'); // isolates the root case
    const old = mutate(
      'for (const file of walk(STAGING_ROOT)) {',
      'for (const file of readdirSync(STAGING_ROOT, { withFileTypes: true })\n' +
        '  .filter((e) => e.isDirectory() && !e.name.startsWith(\'.\'))\n' +
        '  .flatMap((e) => walk(join(STAGING_ROOT, e.name)))) {',
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assert.ok(!out.includes('assets/LEDGER.md'), `the mutant unexpectedly reached the root file:\n${out}`);
    assert.equal(atRiskCount(out), 1, `expected only the subdir file to be found:\n${out}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('reaches a DOT-PREFIXED staging file — the F-2174-1 class', () => {
  const repo = makeRepo();
  try {
    // The live casualty (s2174): 36 `.hero-<pose>-<dir>-take[123].png` pose-library
    // takes, 12.43 MB, every one in NO object database, while the audit printed
    // `AT RISK 0` and this tool's own 2026-08-22 salvage run walked straight past
    // them. A leading dot is not a signal that a file is disposable.
    stage(repo, 'motion-pilot/pose-library/hero/contact-sheets/.hero-idle-up-take1.png', 'DOT-PREFIXED-AT-RISK');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
    assert.match(out, /\.hero-idle-up-take1\.png/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: the historical startsWith(".") skip finds none of it', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/contact-sheets/.hero-idle-up-take1.png', 'DOT-PREFIXED-AT-RISK');
    const old = mutate(
      'if (SKIP_NAMES.has(e.name)) continue;',
      "if (e.name.startsWith('.')) continue;",
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assertUnderReached(out, '.hero-idle-up-take1.png');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('still skips VCS and OS noise by name', () => {
  const repo = makeRepo();
  try {
    // The dot-skip existed for a reason; widening the walk must not start
    // salvaging .DS_Store. Name the noise explicitly instead of guessing by prefix.
    stage(repo, 'raw/.DS_Store', 'FINDER NOISE');
    stage(repo, 'raw/keep-me.png', 'REAL ART IN NO OBJECT DATABASE');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, `only the real file should be at risk:\n${out}`);
    assert.ok(!out.includes('.DS_Store'), `OS noise leaked into the salvage set:\n${out}`);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('the audit and the salvage tool share ONE skip rule — they must not drift', () => {
  // F-2174-1's root cause was not the rule itself but that BOTH halves of the
  // loop carried it: the tool that SAVES and the tool that VERIFIES the save were
  // blind identically, so the audit certified an incomplete salvage as clean.
  // Curing one and not the other would restore exactly that failure.
  const auditSrc = readFileSync(
    fileURLToPath(new URL('./art-staging-audit.mjs', import.meta.url)),
    'utf8',
  );
  const rule = /const SKIP_NAMES = new Set\(\[[^\]]*\]\);/;
  const inSalvage = SOURCE.match(rule);
  const inAudit = auditSrc.match(rule);
  assert.ok(inSalvage, 'salvage-art-staging.mjs no longer declares SKIP_NAMES');
  assert.ok(inAudit, 'art-staging-audit.mjs no longer declares SKIP_NAMES');
  assert.equal(
    inSalvage[0],
    inAudit[0],
    'the salvage tool and the audit have drifted apart on which names they skip',
  );
  assert.ok(
    !/if \(e\.name\.startsWith\('\.'\)\) continue;/.test(auditSrc),
    'art-staging-audit.mjs has regressed to the blanket dot-prefix skip (F-2174-1)',
  );
});

test('the ALARM asks the same question as the audit — all THREE sites, not two', () => {
  // F-2175-1 (s2175). The test above binds the audit and the salvage tool. It was
  // written the same fire as their cure, so its denominator is the two files that
  // fire happened to edit -- and `scripts/health-watch.sh` is a THIRD
  // implementation of the identical question, in another language, which sat
  // outside it and stayed blind. Measured s2175 on the live board: the audit and
  // the salvage tool both saw 36 at-risk files while `art_untracked()` reported 0,
  // because `find ... -not -path '*/.*'` dropped every dot-prefixed path before
  // the blob check ran.
  //
  // This is the alarm, so its blindness is worse than the audit's: health-watch
  // edge-triggers on the count and prescribes the salvage command in its own alert
  // text, and the function's OWN comment states that an alert edge-triggered on a
  // count that never leaves 0 can never fire.
  //
  // Asserted by RULE rather than by byte-equality with the JS literal: shell and
  // JS cannot share a declaration, so the binding is "excludes each SKIP_NAME, and
  // does not exclude by leading dot".
  const watchSrc = readFileSync(
    fileURLToPath(new URL('./health-watch.sh', import.meta.url)),
    'utf8',
  );
  const auditSrc = readFileSync(
    fileURLToPath(new URL('./art-staging-audit.mjs', import.meta.url)),
    'utf8',
  );
  const fn = watchSrc.match(/art_untracked\(\)\s*\{[\s\S]*?\n\}/);
  assert.ok(fn, 'health-watch.sh no longer defines art_untracked()');
  const body = fn[0];

  assert.ok(
    !/-not\s+-path\s+'\*\/\.\*'/.test(body),
    'health-watch.sh art_untracked() has regressed to the blanket dot-prefix skip (F-2175-1)',
  );

  // The names it DOES skip must be exactly the audit's SKIP_NAMES, so a future
  // widening of one cannot silently leave the alarm behind.
  const names = [...inAuditNames(auditSrc)];
  for (const n of names) {
    assert.ok(
      body.includes(`'${n}'`),
      `health-watch.sh art_untracked() does not skip ${n}, but the audit does — the two have drifted`,
    );
  }
  // And it must still exclude git's own object store, which is not art.
  assert.ok(/-not\s+-path\s+'\*\/\.git\/\*'/.test(body), 'health-watch.sh no longer excludes .git/');
});

// Pull the skip names out of the audit's SKIP_NAMES literal so the assertion above
// tracks that set rather than a second hardcoded copy of it (a hardcoded list of
// what another file already declares is a defect awaiting a rename).
function inAuditNames(auditSrc) {
  const m = auditSrc.match(/const SKIP_NAMES = new Set\(\[([^\]]*)\]\);/);
  assert.ok(m, 'art-staging-audit.mjs no longer declares SKIP_NAMES');
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

test('selects by BLOB, not name: regenerated bytes under a tracked name are AT RISK', () => {
  const repo = makeRepo();
  try {
    // Same path as main's tracked file, different bytes, in no object database.
    stage(repo, 'raw/shipped.png', 'REGENERATED-DIFFERENT-BYTES');
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 1, out);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('RED PATH PROVEN: name-based selection skips those same bytes — the F-1054-1 class', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'raw/shipped.png', 'REGENERATED-DIFFERENT-BYTES');
    const old = mutate(
      '  .filter((s) => !present.has(s.sha))',
      '  .filter((s) => !present.has(s.sha) && !new Set(\n' +
        "    git(['ls-tree', '-r', '--name-only', 'main', '--', 'assets/']).split('\\n').filter(Boolean),\n" +
        '  ).has(s.mainPath))',
    );
    const { out } = run(repo, ['save/x', '--dry-run'], old);
    assertUnderReached(out, 'assets/raw/shipped.png');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('bytes already in git are NOT at risk (no pointless re-salvage)', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'raw/shipped.png', 'SHIPPED-BYTES'); // blob-identical to main's
    const { rc, out } = run(repo, ['save/x', '--dry-run']);
    assert.equal(rc, 0, out);
    assert.equal(atRiskCount(out), 0, out);
    assert.match(out, /nothing at risk/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('--dry-run writes no object and no ref', () => {
  const repo = makeRepo();
  try {
    const p = stage(repo, 'motion-pilot/a/b/deep.png', 'DRY-RUN-MUST-NOT-WRITE');
    const sha = execFileSync('git', ['-C', repo, 'hash-object', '--', p], { encoding: 'utf8' }).trim();
    run(repo, ['save/x', '--dry-run']);
    assert.throws(() => git(repo, 'cat-file', '-e', sha), 'dry-run wrote the blob into the object database');
    assert.equal(existsSync(join(repo, '.git/refs/heads/save')), false, 'dry-run wrote a ref');
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('a real run salvages the nested bytes onto save/*, leaving main untouched', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/pose-library/hero/frames/hero-01.png', 'NESTED-AT-RISK');
    const before = git(repo, 'rev-parse', 'main');
    const { rc, out } = run(repo, ['save/art-test']);
    assert.equal(rc, 0, out);
    assert.equal(git(repo, 'rev-parse', 'main'), before, 'main moved');
    const listed = git(repo, 'ls-tree', '-r', '--name-only', 'save/art-test');
    assert.match(listed, /assets\/motion-pilot\/pose-library\/hero\/frames\/hero-01\.png/);
    // and the salvaged bytes are really retrievable, not just named in a tree
    assert.equal(
      git(repo, 'show', 'save/art-test:assets/motion-pilot/pose-library/hero/frames/hero-01.png'),
      'NESTED-AT-RISK',
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('refuses to clobber an existing ref', () => {
  const repo = makeRepo();
  try {
    stage(repo, 'motion-pilot/a/deep.png', 'AT-RISK');
    assert.equal(run(repo, ['save/dupe']).rc, 0);
    const second = run(repo, ['save/dupe']);
    assert.equal(second.rc, 1, second.out);
    assert.match(second.out, /REFUSING/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
