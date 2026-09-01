/**
 * F-2265-1 (s2265) — the TIME-OF-CHECK guard for `authorable-candidates.mjs`.
 *
 * `main()` used to read `tasks/goals.json` TWICE per verdict: once through
 * `auditRoot` for the rows, and again through `unresolvedStatuses(readGoals(root))`
 * for the RESIDUE. Fires splice that file on every drain, so the two halves of one
 * report could describe two different boards — silently, at rc=0, with every
 * existing declaration in the file reading healthy.
 *
 * The cure is STRUCTURAL: read once, feed both consumers. So this guard asserts the
 * PROPERTY (one read per verdict), not a message — a declaration would be the wrong
 * shape here, because after the cure there is no divergence left to declare.
 *
 * Tested from where the CALLER stands (F-2209-1 / F-2210-1): the arms that matter
 * spawn the real CLI and read STDOUT, which is the only channel an advisory tool's
 * reader actually consults. The `--strict` exit code is asserted too, but it is the
 * half nobody uses.
 *
 * Every red arm below was PROVEN BY MANUFACTURING the defect on a scratch copy
 * (never by admiring a green), and each over-general cure is caught by exactly the
 * reverse control built for it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'authorable-candidates.mjs');
const SRC = readFileSync(SUBJECT, 'utf8');

/** The seam a concurrent splice would land in: the residue's read of the corpus. */
const RESIDUE_SEAM = '  const residue = unresolvedStatuses(goals);';

/** A board with 2 planned leaves, BOTH priced — so `--strict` must exit 0. */
const HEALTHY = {
  id: 'root',
  status: 'root',
  children: [
    { id: 'p1', status: 'planned', title: 'owner reserved this', authoringBlock: { class: 'owner-gated', finding: 'F-KJVR-3', measuredBy: 's2265', reason: 'the owner reserved this fork' } },
    { id: 'p2', status: 'planned', title: 'also reserved', authoringBlock: { class: 'owner-gated', finding: 'F-KJVR-3', measuredBy: 's2265', reason: 'likewise reserved' } },
  ],
};

const SPLICE_COMPLETES = `  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ id:'root', status:'root', children:[ { id:'newly-spliced', status:'wedged', title:'a status no instrument resolves' } ] }));`;
const SPLICE_TRUNCATES = `  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), '{"id":"root","status":"root","chi');`;

const temps = [];
/**
 * REALPATH IS LOAD-BEARING, NOT TIDINESS. macOS symlinks both /tmp and
 * /var/folders (mkdtemp's home) into /private, so `process.argv[1]` and
 * `import.meta.url` disagree and the subject's module-main guard never fires —
 * every arm then produces 0 B of stdout and passes for the wrong reason unless
 * something asserts it ran (F-2215-1). This bit three times while writing this
 * fire's harnesses; resolve the real path once, here.
 */
function scratch() {
  const d = realpathSync(mkdtempSync(path.join(tmpdir(), 's2265-single-read-')));
  temps.push(d);
  return d;
}
process.on('exit', () => {
  for (const d of temps) { try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } }
});

/**
 * Assert an edit actually MATCHED. A variant that no longer constructs is
 * indistinguishable from a guard with teeth (s2264's lesson, paid for twice).
 */
function variantOf(source, find, replace) {
  assert.ok(source.includes(find), `variant precondition: ${find.slice(0, 60)}… not found — the file moved, re-read it`);
  return source.split(find).join(replace);
}

/**
 * Run a (possibly modified) copy of the subject against a fresh fixture root.
 * `mkdtemp` resolves through /var -> /private/var on macOS, so the module-main
 * guard fires; the /tmp symlink trap (F-2215-1) would otherwise make every arm
 * VACUOUS at 0 B of stdout while looking like a pass.
 */
function run(body, { splice = null, strict = true, seam = RESIDUE_SEAM } = {}) {
  const base = scratch();
  const root = path.join(base, 'root');
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify(HEALTHY, null, 2));

  const dir = path.join(base, 'scripts');
  /**
   * F-2284-1: this used to be `cpSync(HERE, dir, { recursive: true })` — the whole
   * 503-entry scripts/ directory, on EVERY run() call, to place a file the next line
   * immediately overwrites. `authorable-candidates.mjs` imports only node builtins and
   * reads no sibling, so the copy bought nothing and cost two things:
   *   1. a RACE. cpSync enumerates the source, then copies entry by entry; any
   *      concurrent mutation of scripts/ in that window is an ENOENT — and the path it
   *      reports is the DESTINATION, so the error accuses the fixture's own temp dir
   *      while the SOURCE is what moved. F-2283-4 read exactly that message and
   *      concluded a detached gate worktree was an unreliable host; it is not. The
   *      racing writer is lawful and ordinary: F-1665-1 measured 38 fires writing
   *      one-shot splice helpers into scripts/ mid-fire.
   *   2. ~3,500 pointless file copies per execution of this file (3.2× slower).
   * PROVEN BY MANUFACTURING, both directions: with scripts/ churned concurrently the
   * pre-cure fixture reds 5/5 on that ENOENT and the cured one is 5/5 green.
   */
  mkdirSync(dir, { recursive: true });
  const finalBody = splice ? variantOf(body, seam, splice + '\n' + seam) : body;
  writeFileSync(path.join(dir, 'authorable-candidates.mjs'), finalBody);

  const args = [path.join(dir, 'authorable-candidates.mjs'), '--root', root];
  if (strict) args.push('--strict');
  const r = spawnSync(process.execPath, args, { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20 });
  const out = r.stdout ?? '';
  // F-2215-1: a control whose failure mode is silence cannot be told from the
  // silence it measures. Assert the arm RAN before believing what it says.
  assert.ok(out.length > 0, 'arm produced 0 B of stdout — VACUOUS, not a result');
  return { rc: r.status, out, err: r.stderr ?? '', residue: out.split('\n').find((l) => /RESIDUE/.test(l))?.trim() ?? '(none)' };
}

/** The pre-cure shape, restored verbatim: two reads, the residue re-reading the corpus. */
const PRE_CURE_SEAM = '  const residue = unresolvedStatuses(readGoals(root));';
function preCure() {
  let body = variantOf(SRC, RESIDUE_SEAM, PRE_CURE_SEAM);
  body = variantOf(body, '  const goals = readGoals(root);\n  const rows = auditGoals(goals);', '  const rows = auditRoot(root);');
  return body;
}

test('the corpus is read exactly ONCE per verdict (the property, not a message)', () => {
  // main() must not re-read: `readGoals` appears once in main's body.
  const main = SRC.slice(SRC.indexOf('function main()'));
  const reads = (main.match(/readGoals\(/g) ?? []).length;
  assert.equal(reads, 1, `main() calls readGoals ${reads}× — F-2265-1 requires exactly 1`);
});

test('the residue consumes the SAME parsed object the rows came from', () => {
  const main = SRC.slice(SRC.indexOf('function main()'));
  assert.match(main, /const residue = unresolvedStatuses\(goals\);/,
    'the residue must consume the already-read `goals`, never a fresh read');
  assert.match(main, /const goals = readGoals\(root\);\s*\n\s*const rows = auditGoals\(goals\);/,
    'rows and residue must be fed from one read');
});

test('DEFECT ARM: a splice that COMPLETES cannot move the residue', () => {
  const control = run(SRC);
  const spliced = run(SRC, { splice: SPLICE_COMPLETES });
  assert.equal(spliced.residue, control.residue,
    'a concurrent splice moved the residue — the two halves describe different boards');
  assert.equal(spliced.rc, control.rc);
});

test('DEFECT ARM: a splice that TRUNCATES cannot vanish the residue', () => {
  const control = run(SRC);
  const spliced = run(SRC, { splice: SPLICE_TRUNCATES });
  assert.equal(spliced.residue, control.residue,
    'a mid-splice corpus silently dropped the residue while stdout kept a complete headline');
  assert.equal(spliced.rc, control.rc);
});

test('PRE-CURE restored verbatim: the completing splice DIVERGES (proves these arms have teeth)', () => {
  const control = run(preCure());
  const spliced = run(preCure(), { splice: SPLICE_COMPLETES, seam: PRE_CURE_SEAM });
  assert.notEqual(spliced.residue, control.residue,
    'the pre-cure file must diverge here — if it does not, this guard is decoration');
});

test('PRE-CURE restored verbatim: the truncating splice loses the residue at a COMPLETE headline', () => {
  const spliced = run(preCure(), { splice: SPLICE_TRUNCATES, seam: PRE_CURE_SEAM });
  assert.equal(spliced.residue, '(none)', 'pre-cure must drop the residue entirely');
  // The headline is TRUE and complete while the corpus read failed — the whole harm.
  assert.match(spliced.out, /0 unpriced/, 'pre-cure keeps a complete-looking verdict on stdout');
  assert.notEqual(spliced.rc, 0, 'pre-cure dies after printing a complete verdict');
});

test('REVERSE CONTROL: a genuinely healthy board is unchanged — verdict, counts and rc', () => {
  const r = run(SRC);
  assert.equal(r.rc, 0, '--strict must exit 0 when every planned leaf is priced');
  assert.match(r.out, /2 planned leaf\/leaves — 2 priced, 0 unpriced/);
  assert.match(r.residue, /RESIDUE: 1 leaf\/leaves in 1 status\(es\)/);
});

test('REVERSE CONTROL: reading once must not silence UNPRICED — the verdict still reds', () => {
  // An over-general "cure" that dropped a consumer would take the verdict with it.
  const base = scratch();
  const root = path.join(base, 'root');
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({
    id: 'root', status: 'root',
    children: [{ id: 'u1', status: 'planned', title: 'nothing on record' }],
  }, null, 2));
  const r = spawnSync(process.execPath, [SUBJECT, '--root', root, '--strict'], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20 });
  assert.ok((r.stdout ?? '').length > 0, 'arm produced 0 B — VACUOUS');
  assert.equal(r.status, 1, '--strict must still exit 1 on an unpriced leaf');
  assert.match(r.stdout, /no refusal on record/);
});

test('REVERSE CONTROL: auditRoot keeps its signature and behaviour for the legacy suite', async () => {
  const mod = await import(path.toNamespaceURL ? SUBJECT : `file://${SUBJECT}`);
  const base = scratch();
  const root = path.join(base, 'root');
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify(HEALTHY, null, 2));
  const viaRoot = mod.auditRoot(root);
  const viaGoals = mod.auditGoals(mod.readGoals(root));
  assert.deepEqual(viaRoot, viaGoals, 'auditRoot must remain auditGoals(readGoals(root))');
  assert.equal(viaRoot.length, 2);
});
