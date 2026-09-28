/**
 * status-rotate-month.test.mjs — the rotation must MOVE every byte and never lose one.
 *
 * WHY EACH ARM EXISTS. This tool is the one place in the factory that removes lines from
 * STATUS.md, and the Retention Law (CLAUDE.md §4.10b, owner 2026-07-25: "our history is our
 * strength") makes a lost byte a law violation rather than a bug. So the arms below are not
 * "does it run": they manufacture the defects a weaker version would have — a header whose bytes
 * are not counted, a second apply that duplicates, a month boundary that strands the
 * carry-forward guard, an undated bullet filed under a guessed month.
 *
 * EVERY DESTRUCTIVE ARM RUNS AGAINST A `mkdtemp` FIXTURE AND `--root`. Nothing here touches the
 * repo's own STATUS.md; the branch that ships this tool never runs `--apply` on its own tree.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const TOOL = fileURLToPath(new URL('./status-rotate-month.mjs', import.meta.url));
const CORPUS = fileURLToPath(new URL('./ledger-corpus.mjs', import.meta.url));

const line1 = 'Last updated: 2026-09-25T01:05Z s2674 handoff, lock CLEARED — the board is dry.';
const bullet = (label, body) => `- **${label} (line-1 archive):** ${body}`;
const handoff = (n, stamp, extra = '') =>
  bullet(`s${n} handoff`, `Last updated: ${stamp} s${n} handoff, lock CLEARED — a fire happened.${extra}`);
const lock = (n, stamp) => bullet(`s${n} lock`, `ACTIVE ${stamp} (s${n} fire) — triage on a dry board.`);
const LAW = '- **s9au MIGRATION (2026-07-06, BINDING): fires moved to Claude Code.';

function fixture(t, lines) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'status-rotate-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), `${lines.join('\n')}\n`);
  return dir;
}

function run(root, args = [], tool = TOOL) {
  const r = spawnSync(process.execPath, [tool, '--root', root, ...args], {
    encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL',
  });
  return { rc: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
}

const statusOf = (root) => fs.readFileSync(path.join(root, 'STATUS.md'), 'utf8');
const archiveOf = (root, month) => fs.readFileSync(path.join(root, 'archive/status', `${month}.md`), 'utf8');
const archiveList = (root) => {
  try { return fs.readdirSync(path.join(root, 'archive/status')).sort(); } catch { return []; }
};

/** The board every arm below starts from: one closed month, one current month, a law bullet. */
const BOARD = [
  line1,
  '',
  handoff(2674, '2026-09-25T00:50Z'),
  lock(2674, '2026-09-25T00:40Z'),
  handoff(2100, '2026-08-15T10:00Z'),
  lock(2100, '2026-08-15T09:00Z'),
  handoff(1000, '2026-07-10T10:00Z'),
  LAW,
  '',
];

// ── 1. DRY-RUN ANSWERS AND WRITES NOTHING ──────────────────────────────────────────────────
test('--dry-run states the accounting per destination and leaves the tree untouched', (t) => {
  const root = fixture(t, BOARD);
  const before = statusOf(root);
  const r = run(root, ['--dry-run', '--window', '1']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /^BALANCE .*-> BALANCED$/m, 'the accounting is declared, not assumed');
  assert.match(r.out, /archive\/status\/2026-07\.md\s+1 bullet/, 'July is a closed month and is named');
  assert.match(r.out, /archive\/status\/2026-08\.md\s+2 bullet/, 'August too');
  assert.doesNotMatch(r.out, /archive\/status\/2026-09/, 'the CURRENT month is never rotated');
  assert.equal(statusOf(root), before, 'a dry run that writes is not a dry run');
  assert.deepEqual(archiveList(root), [], 'and it creates no archive directory');
});

// ── 2. APPLY MOVES EXACTLY THE CLOSED MONTHS, AND KEEPS WHAT IS NAMED ───────────────────────
test('--apply moves the closed months and keeps line 1, the law bullets and the current month', (t) => {
  const root = fixture(t, BOARD);
  const before = statusOf(root);
  const r = run(root, ['--apply', '--window', '1']);
  assert.equal(r.rc, 0, r.out + r.err);

  const after = statusOf(root);
  assert.equal(after.split('\n')[0], line1, 'line 1 is the lock surface and never moves');
  assert.ok(after.includes(LAW), 'the s9<letter> law bullets are LIVE LAW and stay on the board');
  assert.ok(after.includes(handoff(2674, '2026-09-25T00:50Z')), 'the current month stays');
  assert.ok(!after.includes(handoff(1000, '2026-07-10T10:00Z')), 'the closed month left the board');

  assert.deepEqual(archiveList(root), ['2026-07.md', '2026-08.md']);
  assert.ok(archiveOf(root, '2026-07').includes(handoff(1000, '2026-07-10T10:00Z')), 'and landed VERBATIM');
  assert.match(archiveOf(root, '2026-07'), /^# STATUS line-1 archive — 2026-07$/m, 'each file names its month');

  // THE LAW, MEASURED: every byte that left STATUS.md is in an archive file.
  const moved = Buffer.byteLength(before) - Buffer.byteLength(after);
  const headers = ['2026-07', '2026-08']
    .map((m) => archiveOf(root, m).slice(0, archiveOf(root, m).indexOf('\n- ')) + '\n')
    .reduce((sum, h) => sum + Buffer.byteLength(h), 0);
  const archived = ['2026-07', '2026-08'].reduce((sum, m) => sum + Buffer.byteLength(archiveOf(root, m)), 0);
  assert.equal(archived - headers, moved, 'bytes in must equal bytes out plus the headers it adds');
});

// ── 3. IDEMPOTENCE ─────────────────────────────────────────────────────────────────────────
test('a second --apply moves nothing and changes no byte', (t) => {
  const root = fixture(t, BOARD);
  run(root, ['--apply', '--window', '1']);
  const status1 = statusOf(root);
  const july1 = archiveOf(root, '2026-07');

  const second = run(root, ['--apply', '--window', '1']);
  assert.equal(second.rc, 0, second.out + second.err);
  assert.match(second.out, /^moving\s+: 0 bullet\(s\)/m, 'a converged board has nothing to move');
  assert.equal(statusOf(root), status1, 'STATUS.md is byte-identical after the second run');
  assert.equal(archiveOf(root, '2026-07'), july1, 'and so is the archive — no duplicated bullets');
});

// ── 4. THE TRAILING WINDOW, WHICH IS WHAT KEEPS desk-carryforward-guard OFF ITS exit(2) ─────
test('the trailing window holds the newest bullets on the board whatever their month', (t) => {
  // Every bullet is in a CLOSED month, which is the month-boundary state the window exists for.
  const root = fixture(t, [
    'Last updated: 2026-09-01T00:00Z s3000 handoff, lock CLEARED — a new month opens.',
    '',
    handoff(2100, '2026-08-31T23:00Z'),
    handoff(2099, '2026-08-31T22:00Z'),
    handoff(2098, '2026-08-31T21:00Z'),
    '',
  ]);
  const r = run(root, ['--apply', '--window', '2']);
  assert.equal(r.rc, 0, r.out + r.err);
  const after = statusOf(root);
  assert.ok(after.includes(handoff(2100, '2026-08-31T23:00Z')), 'newest stays');
  assert.ok(after.includes(handoff(2099, '2026-08-31T22:00Z')), 'second newest stays');
  assert.ok(!after.includes(handoff(2098, '2026-08-31T21:00Z')), 'the third is past the window and rotates');
  assert.match(r.out, /trailing-window/, 'and the reason is stated in the accounting');

  // The point of the window, asserted rather than assumed: a `s<N> handoff (line-1 archive)`
  // bullet is still on the board, which is the shape previousDesk() refuses without.
  assert.match(after, /^- \*\*s\d+ handoff \(line-1 archive\)/m);
});

// ── 5. UNSTAMPED BULLETS ARE DATED BY NEIGHBOURS, NOT BY A GUESS ────────────────────────────
test('an unstamped bullet is filed by its session neighbours, and prose dates never decide', (t) => {
  const root = fixture(t, [
    line1,
    '',
    handoff(2674, '2026-09-25T00:50Z'),
    // No stamp in its zone at all, and its PROSE quotes a July date. Naive first-date-in-line
    // scanning files this August bullet under July.
    bullet('s2101 handoff', 'THE OWNER RULED ON 2026-07-25 THAT PRUNING STOPS; I carried it forward.'),
    handoff(2100, '2026-08-15T10:00Z'),
    '',
  ]);
  const r = run(root, ['--apply', '--window', '0']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /1 session-neighbour/, 'the route is named, so the reader can overturn it');
  assert.ok(
    archiveOf(root, '2026-08').includes('s2101 handoff'),
    's2101 sits between s2100 (August) and s2674, so August is its measured month — not the July it quotes',
  );
  assert.deepEqual(archiveList(root), ['2026-08.md'], 'and no July file was invented for a quoted date');
});

test('a bullet that cannot be placed at all STAYS ON THE BOARD', (t) => {
  const root = fixture(t, [
    'Last updated: 2026-09-25T01:05Z s2674 handoff, lock CLEARED — the board is dry.',
    '',
    bullet('attended handoff', 'no stamp, no session number, nothing to key on'),
    '',
  ]);
  const r = run(root, ['--apply', '--window', '0']);
  assert.equal(r.rc, 0, r.out + r.err);
  assert.match(r.out, /1 unplaceable/, 'the unknown is counted and named');
  assert.ok(statusOf(root).includes('no stamp, no session number'), 'an unplaceable line is never moved on a guess');
  assert.deepEqual(archiveList(root), [], 'and no month file is created for it');
});

// ── 6. THE BALANCE REFUSAL HAS TEETH (MANUFACTURED DEFECT + REVERSE CONTROL) ────────────────
/**
 * Copy the tool and its ONE import into a scratch `scripts/` directory and patch it.
 *
 * Two NAMED files, never a directory sweep: `fixture-corpus-copy-guard` forbids making the whole
 * live `scripts/` tree a fixture's source (F-2284-1's race), in both the `cpSync` and the
 * readdir-loop spellings.
 */
function variantOf(t, find, replace) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'status-rotate-variant-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(CORPUS, path.join(dir, 'scripts', 'ledger-corpus.mjs'));
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.ok(src.includes(find), `variant anchor not found — the tool moved: ${find.slice(0, 60)}`);
  const out = path.join(dir, 'scripts', 'status-rotate-month.mjs');
  fs.writeFileSync(out, src.replace(find, replace));
  return out;
}

const HEADER_ACCOUNTING = 'headerBytes: existing === null ? bytes(`${parsed.header}\\n`) : 0,';

test('MANUFACTURED DEFECT — a header whose bytes go uncounted REFUSES and writes nothing', (t) => {
  const root = fixture(t, BOARD);
  const before = statusOf(root);
  const broken = variantOf(t, HEADER_ACCOUNTING, 'headerBytes: 0,');
  const r = run(root, ['--apply', '--window', '1'], broken);
  assert.equal(r.rc, 2, `an unbalanced plan must refuse, not write (rc=${r.rc})\n${r.out}${r.err}`);
  assert.match(r.out, /OFF BY \d+ B/, 'and it must say by how much');
  assert.equal(statusOf(root), before, 'the refusal happens BEFORE any write — a half-rotation is unrecoverable');
  assert.deepEqual(archiveList(root), [], 'and no archive file was left behind');
});

test('REVERSE CONTROL — the unpatched tool on the same fixture balances and applies', (t) => {
  const root = fixture(t, BOARD);
  const r = run(root, ['--apply', '--window', '1']);
  assert.equal(r.rc, 0, 'without the patch the same input is lawful, so the arm above proves the PATCH');
  assert.match(r.out, /BALANCED/);
});

// ── 7. MISUSE IS A REFUSAL, NOT A DEFAULT ──────────────────────────────────────────────────
test('neither/both of --dry-run and --apply refuses on both channels', (t) => {
  const root = fixture(t, BOARD);
  for (const args of [[], ['--dry-run', '--apply']]) {
    const r = run(root, args);
    assert.equal(r.rc, 2, `args ${JSON.stringify(args)} must refuse as misuse`);
    assert.match(r.out, /REFUSING/, 'a caller classifying stdout reads an empty string as silence (F-2211-1)');
    assert.match(r.err, /REFUSING/, 'and the human channel gets it too');
  }
  assert.equal(run(root, ['--dry-run', '--windwo', '3']).rc, 2, 'a typo must not silently take the default');
});
