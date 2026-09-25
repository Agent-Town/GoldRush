/**
 * F-2337-1 (measured and cured s2337) — `status-archive-audit` DECLARED ITS DENOMINATOR AND
 * NOTHING READ IT.
 *
 * s2335 opened a rung — twenty fires have made instruments DECLARE their corpus and nobody has
 * asked WHO READS THEM — and s2336 sharpened it into the question that actually decides a cure:
 * IS THE EMPTY STATE LAWFUL HERE? For `ghost-ladder-row-guard` it was (a dry board lawfully
 * selects nothing), so that cure DECLARES and does not refuse. Here it is not, so this one
 * refuses. Same rung, opposite answer, and the difference is measured rather than stylistic.
 *
 * THE DEFECT. `examined` has been printed since s2224 ("across N STATUS.md commits"), and the
 * verdict branched on `drops.length` ALONE. When the walk examines NOTHING, `drops` is empty for
 * the most trivial of reasons and the tool printed an affirmative CLEAN at rc=0 — a universal
 * claim about a corpus it never read. F-2278-1 named this polarity in its OWN words 200 lines up
 * ("CLEAN over an empty corpus is not an answer") while guarding only the `--limit <= 0` typo.
 *
 * MEASURED s2337, ground truth = a scratch board carrying ONE REAL DROP, the control asserting
 * its own validity first (F-2215-1: arm A produced 460 B and read LOST rc=1, so the harness was
 * real). Three routes reached `examined === 0`, all printing CLEAN at rc=0 and all byte-length
 * identical (249 B) to a genuinely clean board:
 *   (a) STATUS.md on disk but absent from history        -> no-history
 *   (b) only a ROOT commit touches STATUS.md             -> nothing-examinable
 *   (c) THE SAME REAL-DROP REPO, `git show` failing      -> blobs-unreadable
 * Arm (c) is the inversion that earns the cure: same repo, same binary, verdict flips LOST rc=1
 * -> CLEAN rc=0 because the instrument went blind.
 *
 * ⚖️ SEVERITY STATED HONESTLY AND NOT INFLATED: LATENT in the prescribed invocation. The battery
 * leg `--limit 40 --quiet` reads examined=40 on the live board, and every CLEAN this tool has
 * printed was TRUE — verified, not assumed. The trigger is `GR_REPO`, which is the seam the
 * tool's own header exposes and which its existing guard already drives, so it is a supported
 * input rather than a contrivance.
 *
 * 🚦 WHY A REFUSAL IS SAFE HERE, checked BEFORE it was built (s2336's trap was building the
 * refusal first and having the measurement refute it): `--limit N` cannot manufacture an empty
 * corpus, because the loop breaks on `examined >= limit` and therefore walks PAST merges and
 * unreadable blobs until it has N examinable commits — measured on the live board, --limit
 * 1/2/5/40 -> examined 1/2/5/40. Arms 1–3 are the reverse controls that keep it that way.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const TOOL = fileURLToPath(new URL('./status-archive-audit.mjs', import.meta.url));
const REPO = path.dirname(path.dirname(TOOL));

const G = (root) => (...a) =>
  execFileSync('git', ['-C', root, '-c', 'user.email=a@b', '-c', 'user.name=c', ...a], { encoding: 'utf8' });
// Every fixture this file makes is removed when its tests end (F-SF1-6, 2026-09-25: 12 leaked dirs per run, 8,834 on disk;
// the template-literal prefix hid it from scripts/fixture-teardown.test.mjs until the sweep learned to read one).
const FIXTURES = [];
test.after(() => { for (const d of FIXTURES) fs.rmSync(d, { recursive: true, force: true }); });
const mk = (tag) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), `s2337-${tag}-`)); FIXTURES.push(d); return d; };

const run = (tool, args = [], env = {}) => {
  const r = spawnSync(process.execPath, [tool, ...args], {
    cwd: REPO,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 600000,
  });
  return { rc: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
};

/** A scratch board carrying exactly ONE manufactured drop. Ground truth = LOST. */
function oneDrop() {
  const root = mk('drop');
  const git = G(root);
  git('init', '-q', '-b', 'main', '.');
  const write = (l1) => fs.writeFileSync(path.join(root, 'STATUS.md'), `${l1}\n- body bullet\n`);
  write('Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — alpha priorities');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's100 handoff: alpha');
  write('Last updated: 2026-01-01T01:00Z s101 handoff, lock CLEARED — beta priorities');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's101 handoff: beta');
  return root;
}

/** The same shape, but s101 ARCHIVES s100's line. Ground truth = CLEAN. */
function properArchive() {
  const root = mk('clean');
  const git = G(root);
  git('init', '-q', '-b', 'main', '.');
  const p = path.join(root, 'STATUS.md');
  fs.writeFileSync(p, 'Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — alpha\n- body bullet\n');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's100 handoff: alpha');
  fs.writeFileSync(
    p,
    'Last updated: 2026-01-01T01:00Z s101 handoff, lock CLEARED — beta\n' +
      '- **s100 handoff (line-1 archive):** Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — alpha\n' +
      '- body bullet\n',
  );
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's101 handoff: beta');
  return root;
}

/** STATUS.md present on disk, absent from history entirely. */
function untrackedStatus() {
  const root = mk('untracked');
  const git = G(root);
  git('init', '-q', '-b', 'main', '.');
  fs.writeFileSync(path.join(root, 'other.txt'), 'x\n');
  git('add', 'other.txt');
  git('commit', '-q', '-m', 'seed');
  fs.writeFileSync(path.join(root, 'STATUS.md'), 'Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — a\n- b\n');
  return root;
}

/** Only a ROOT commit touches STATUS.md — no unambiguous line-1 transition exists. */
function rootOnly() {
  const root = mk('rootonly');
  const git = G(root);
  git('init', '-q', '-b', 'main', '.');
  fs.writeFileSync(path.join(root, 'STATUS.md'), 'Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — a\n- b\n');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 'root');
  return root;
}

/**
 * A PATH shim whose `git` forwards everything EXCEPT `show`, which fails. This simulates the
 * transient git failure that `blobOf`'s bare catch turns into a null — the route that makes the
 * verdict INVERT on a board carrying a real drop.
 */
function sabotageShow() {
  const bin = mk('shim');
  const real = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
  const p = path.join(bin, 'git');
  fs.writeFileSync(
    p,
    `#!/bin/sh\nfor a in "$@"; do if [ "$a" = "show" ]; then echo "fatal: simulated transient failure" >&2; exit 128; fi; done\nexec ${real} "$@"\n`,
  );
  fs.chmodSync(p, 0o755);
  return `${bin}:${process.env.PATH}`;
}

/**
 * Manufacture a variant on a scratch copy. This tool has ZERO relative imports and no
 * module-main guard (verified s2337), so /tmp is safe here — unlike the sibling guards, whose
 * subjects resolve relative imports. ASSERTS THE EDIT MATCHED: a variant that silently changed
 * nothing goes green having tested nothing.
 */
function variantOf(find, replace, body) {
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.ok(src.includes(find), `variant anchor not found — the tool moved: ${find.slice(0, 60)}`);
  const file = path.join(os.tmpdir(), `s2337-variant-${process.pid}-${Math.abs(find.length * 31 + replace.length)}.mjs`);
  fs.writeFileSync(file, src.replace(find, replace));
  try {
    return body(file);
  } finally {
    fs.rmSync(file, { force: true });
  }
}

const examinedOf = (out) => {
  const m = out.match(/across (\d+) STATUS\.md commits/);
  return m ? Number(m[1]) : null;
};

// ------------------------------------------------------- REVERSE CONTROLS (must stay green)

test('1. REVERSE CONTROL — the live battery leg still answers and still examines commits', () => {
  const r = run(TOOL, ['--limit', '40', '--quiet']);
  assert.ok(r.rc === 0 || r.rc === 1, `the battery leg must ANSWER, not refuse (rc=${r.rc})`);
  assert.match(r.out, /^(CLEAN|LOST):/m, 'the verdict line always prints, however quiet the caller asked');
  assert.ok(examinedOf(r.out) > 0, 'a live board examines commits — this arm is what keeps the refusal honest');
  assert.doesNotMatch(r.out, /CANNOT VERIFY/, 'the prescribed invocation must never refuse');
});

test('2. REVERSE CONTROL — a genuinely CLEAN board still reads CLEAN at rc=0', () => {
  const r = run(TOOL, [], { GR_REPO: properArchive() });
  assert.equal(r.rc, 0, 'refusing on a real clean board is the over-general cure this arm exists to catch');
  assert.match(r.out, /^CLEAN:/m, 'a genuinely clean board must still get its all-clear');
  assert.equal(examinedOf(r.out), 1, 'and it must have actually examined something');
});

test('3. REVERSE CONTROL — a board with a REAL drop still reads LOST at rc=1', () => {
  const r = run(TOOL, [], { GR_REPO: oneDrop() });
  assert.equal(r.rc, 1, '1 = answered, and the answer refuses — distinct from 2 = could not answer');
  assert.match(r.out, /^LOST:/m, 'the finding must survive the cure');
  assert.match(r.out, /DROPPED /, 'and must still name the offending commit');
});

// ------------------------------------------------------------------------------- TEETH

test('4. TEETH — no STATUS.md history at all REFUSES rather than printing CLEAN', () => {
  const r = run(TOOL, [], { GR_REPO: untrackedStatus() });
  assert.equal(r.rc, 2, '2 = could not answer');
  assert.doesNotMatch(r.out, /^CLEAN:/m, 'a refusal must not also render an affirmative verdict');
  assert.match(r.out, /CANNOT VERIFY \(no-history\)/, 'the route names the owed act: check GR_REPO');
});

test('5. TEETH — a history with no unambiguous transition REFUSES', () => {
  const r = run(TOOL, [], { GR_REPO: rootOnly() });
  assert.equal(r.rc, 2, 'a root-only board cannot answer the archiving question');
  assert.doesNotMatch(r.out, /^CLEAN:/m, 'no affirmative verdict over an unwalked corpus');
  assert.match(r.out, /CANNOT VERIFY \(nothing-examinable\)/, 'distinct route: the board is too young, not misconfigured');
});

test('6. TEETH — THE INVERSION: a real drop + unreadable blobs refuses instead of flipping to CLEAN', () => {
  const root = oneDrop();
  const healthy = run(TOOL, [], { GR_REPO: root });
  assert.equal(healthy.rc, 1, 'control first (F-2215-1): this repo really does carry a drop');

  const blind = run(TOOL, [], { GR_REPO: root, PATH: sabotageShow() });
  assert.equal(blind.rc, 2, 'pre-cure this was rc=0 CLEAN — the same repo, the opposite verdict');
  assert.doesNotMatch(blind.out, /^CLEAN:/m, 'instrument blindness must never wear the shape of good news');
  assert.match(blind.out, /CANNOT VERIFY \(blobs-unreadable\)/, 'and must be named as instrument failure, not a clean board');
});

test('7. TEETH — the refusal reaches STDOUT even under --quiet (F-2211-1)', () => {
  const r = run(TOOL, ['--quiet'], { GR_REPO: untrackedStatus() });
  assert.equal(r.rc, 2, '--quiet must not soften the refusal');
  assert.match(r.out, /CANNOT VERIFY/, 'a caller that classifies stdout reads an empty string as silence');
  assert.match(r.err, /CANNOT VERIFY/, 'and the human channel gets it too');
});

test('8. TEETH — the three routes are DISCRIMINATED, because they name different owed acts', () => {
  const seen = new Set(
    [untrackedStatus(), rootOnly()].map((root) => run(TOOL, [], { GR_REPO: root }).out.match(/CANNOT VERIFY \(([a-z-]+)\)/)?.[1]),
  );
  seen.add(run(TOOL, [], { GR_REPO: oneDrop(), PATH: sabotageShow() }).out.match(/CANNOT VERIFY \(([a-z-]+)\)/)?.[1]);
  assert.equal(seen.size, 3, `collapsing the routes into one label loses the diagnosis: saw ${[...seen].join(', ')}`);
  assert.ok(!seen.has(undefined), 'every refusal must carry a route label');
});

// ------------------------------------- the over-general cure this file exists to forbid

/**
 * A board where STATUS.md is BORN in a non-root commit, so the parent of its first commit has no
 * such blob and `blobOf` legitimately returns null. Ground truth = LOST with blobFailures >= 1:
 * a healthy audit that nonetheless has a failed blob read in it.
 *
 * This fixture exists because arm 9's FIRST writing was wrong and the reverse control said so:
 * on a two-commit board `blobFailures` is 0 (a root commit has no parent, so `blobOf` is never
 * called for a missing blob), and the over-general variant therefore behaved identically to the
 * cure. The prediction was refuted by measurement, not by review.
 */
function dropWithLawfulBlobMiss() {
  const root = mk('blobmiss');
  const git = G(root);
  git('init', '-q', '-b', 'main', '.');
  fs.writeFileSync(path.join(root, 'other.txt'), 'x\n');
  git('add', 'other.txt');
  git('commit', '-q', '-m', 'seed — no STATUS.md yet');
  const p = path.join(root, 'STATUS.md');
  fs.writeFileSync(p, 'Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — alpha priorities\n- body bullet\n');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's100 handoff: alpha');
  fs.writeFileSync(p, 'Last updated: 2026-01-01T01:00Z s101 handoff, lock CLEARED — beta priorities\n- body bullet\n');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's101 handoff: beta');
  return root;
}

test('9. REVERSE CONTROL — a LAWFUL failed blob read must not be mistaken for an empty corpus', () => {
  // The parent of the commit that CREATED STATUS.md has no such blob, so `blobOf` returns null as
  // designed. The cure keys on an EMPTY RESULT, not on the swallow count — and this arm is what
  // forbids the tempting collapse of those two ideas.
  const root = dropWithLawfulBlobMiss();

  const cured = run(TOOL, [], { GR_REPO: root });
  assert.ok(cured.out.length > 0, 'control validity: the cured arm really ran');
  assert.equal(cured.rc, 1, 'a failed blob read is routine here; the audit must still ANSWER');
  assert.match(cured.out, /^LOST:/m, 'and must still find the real drop');

  variantOf('if (examined === 0) {', 'if (examined === 0 || blobFailures > 0) {', (v) => {
    const over = run(v, [], { GR_REPO: root });
    assert.ok(over.out.length > 0, 'control validity: the variant really ran');
    assert.equal(over.rc, 2, 'the over-general cure refuses here — which is why the cure keys on the RESULT');
    assert.notEqual(over.rc, cured.rc, 'the two must be distinguishable, or this arm proves nothing');
  });
});
