/**
 * desk-declaration-guard.test.mjs — F-1334-2's guard, proven by MANUFACTURING the
 * violation rather than by observing a green.
 *
 * A passing guard never executes its violation path, so its PASS says nothing
 * about its FAIL (the s1299/s1300/s1301 standard). Every assertion below that
 * matters drives the guard to a specific exit code on a fixture built for it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-declaration-guard.mjs');
const REPO = path.resolve(HERE, '..');

// EVERY temp dir is registered for teardown on its own test context (F-1335-5).
// As shipped s1334 this file leaked 14 fixtures per run and turned
// scripts/fixture-teardown.test.mjs — and therefore `test:node-guards` — rc=1.
// It was invisible to s1334 because `test:ledger-guards`, the narrowed last-act
// battery, does not include the teardown guard.
// The prefix stays a LITERAL at each mkdtemp call site on purpose: the teardown
// guard's extractor is a regex over this source
// (scripts/fixture-teardown.test.mjs PREFIX), so hoisting it into a parameter
// yields "0 extractable literal prefixes" and reds the guard a second way — as
// this fire's first attempt at the fix did.
function register(t, dir) {
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function tempdir(t) {
  return register(t, fs.mkdtempSync(path.join(os.tmpdir(), 'desk-guard-')));
}

function spacedTempdir(t) {
  return register(t, fs.mkdtempSync(path.join(os.tmpdir(), 'desk guard with spaces-')));
}

function fixture(t, statusText, backlogText) {
  const dir = tempdir(t);
  fs.writeFileSync(path.join(dir, 'STATUS.md'), statusText);
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), backlogText);
  return dir;
}

function run(dir, ...extra) {
  return spawnSync(process.execPath, [GUARD, '--root', dir, ...extra], { encoding: 'utf8' });
}

const DESK = (ids) =>
  'Last updated: s1 handoff — work happened. 🔺 **OWNER DESK — one new.** ' +
  ids.map((i) => `🔺 **${i}**`).join(' · ') +
  '\n- **s0 handoff (line-1 archive):** older text\n';

test('a desk item WITH a declaring row passes', (t) => {
  const dir = fixture(t, DESK(['F-9001-1']), '- 🟡 **F-9001-1 (s1, MEASURED — a thing).** details\n');
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /PASS/);
});

test('MANUFACTURED: a desk item with NO row anywhere exits 1 and names the id', (t) => {
  const dir = fixture(t, DESK(['F-9002-1']), '- 🟡 **F-8888-1 (s1) — unrelated.** details\n');
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /F-9002-1/);
});

test('MANUFACTURED: the F-1328-3 shape — MENTIONED inside another finding row is NOT declared', (t) => {
  // The id appears, and appears EARLY, but the row belongs to a different finding.
  const dir = fixture(
    t,
    DESK(['F-9003-1']),
    '- 🟡 **F-9003-9 (s2, THIRD SIGHTING — F-9003-1 REPRODUCES EXACTLY).** details\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, 'a mention must not satisfy the guard');
  assert.match(r.stderr, /F-9003-1/);
});

test('a row whose id sits past the 90-char subject zone does NOT declare it', (t) => {
  const pad = '✅ **SHIPPED s1 at `deadbeef` — ' + 'x'.repeat(120) + '** ';
  const dir = fixture(t, DESK(['F-9004-1']), '- ' + pad + '**F-9004-1** details\n');
  assert.equal(run(dir).status, 1);
});

test('the leading GLYPH is irrelevant — F-1334-1 refuted marker equality', (t) => {
  // Same row, four different markers: all four must PASS. This guard is silent
  // about glyphs by design; a 🟡 row must not be flagged merely for not being 🔺.
  for (const glyph of ['🟡', '🔺', '🔴', '✅']) {
    const dir = fixture(t, DESK(['F-9005-1']), `- ${glyph} **F-9005-1 (s1) — a thing.** details\n`);
    assert.equal(run(dir).status, 0, `glyph ${glyph} should not affect the verdict`);
  }
});

test('the markdown list bullet is stripped: bulleted and unbulleted rows read alike', (t) => {
  for (const prefix of ['- ', '']) {
    const dir = fixture(t, DESK(['F-9006-1']), `${prefix}🟡 **F-9006-1 (s1) — a thing.** details\n`);
    assert.equal(run(dir).status, 0, `prefix "${prefix}" should declare`);
  }
});

test('REFUSES (exit 2) rather than greening when there is no OWNER DESK segment', (t) => {
  const dir = fixture(t, 'Last updated: s1 handoff — no desk here.\n', '- 🟡 **F-1-1** x\n');
  const r = run(dir);
  assert.equal(r.status, 2, 'an unread subject must refuse, never PASS');
  assert.match(r.stderr, /REFUSING/);
});

test('REFUSES (exit 2) when the desk segment holds zero keyed items', (t) => {
  // Wording widened s1535: the refusal now covers BOTH key shapes, so a desk with
  // no F-IDs but a real slug item is no longer "empty" and must NOT refuse.
  const dir = fixture(t, 's1 handoff 🔺 **OWNER DESK — nothing today.**\n', '- 🟡 **F-1-1** x\n');
  const r = run(dir);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /zero keyed items/);
});

test('REFUSES (exit 2) when BACKLOG.md is missing', (t) => {
  const dir = tempdir(t);
  fs.writeFileSync(path.join(dir, 'STATUS.md'), DESK(['F-1-1']));
  assert.equal(run(dir).status, 2);
});

test('the entrypoint actually RUNS — a space in the repo path must not no-op it', (t) => {
  // s1334: the first draft compared import.meta.url to `file://${process.argv[1]}`.
  // This repo lives under ".../Claude/Projects/Gold Rush"; import.meta.url encodes
  // that space as %20 and argv[1] does not, so main() never ran and the guard
  // EXITED 0 having read nothing. Reproduce the hazard explicitly.
  const dir = spacedTempdir(t);
  fs.writeFileSync(path.join(dir, 'STATUS.md'), DESK(['F-9007-1']));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), '- 🟡 **F-0-0** unrelated\n');
  const r = run(dir);
  assert.notEqual(r.status, 0, 'guard must not silently pass');
  assert.match(r.stdout + r.stderr, /desk-declaration-guard/, 'guard must produce output');
});

test('the live board is green under this guard (baseline is honest)', () => {
  // Green in BOTH live modes: mid-fire line-1 is an ACTIVE lock (SKIP, exit 0),
  // post-handoff it is a CLEARED line whose desk must parse and be declared.
  const r = run(REPO);
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ───────────────────────────────────────────────────────────────────────────
// F-1471-3 — THE FAIL-OPEN. Every test below manufactures the exact shape that
// let this guard report "desk F-IDs: 145 · undeclared: 0 · PASS" off a desk
// three days stale. A green here would have been indistinguishable from the bug,
// which is why each one drives a specific exit code on a fixture built for it.
// ───────────────────────────────────────────────────────────────────────────

/** A STATUS.md whose line-1 is `line1` and which carries archived handoff bullets. */
const withArchives = (line1, archiveDesk) =>
  line1 +
  '\n- **s0 handoff (line-1 archive):** Last updated: s0 handoff, lock CLEARED — ' +
  `old work. 🔺 **OWNER DESK — settled.** ${archiveDesk}\n`;

test('MANUFACTURED F-1471-3: an ARCHIVED desk never satisfies the guard', (t) => {
  // The precise incident. Line-1 is a handoff with NO desk header; an archive
  // bullet below carries a fully-declared desk in the bare spelling. The old
  // selector found that archive and PASSED. Line 1 or nothing.
  const dir = fixture(
    t,
    withArchives('Last updated: s1 handoff, lock CLEARED — work happened, no desk written.', '🔺 **F-7777-1**'),
    '- 🟡 **F-7777-1 (s0) — declared long ago.** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 2, 'a headerless handoff must REFUSE, never read an archive');
  assert.match(r.stderr, /no desk header/);
});

test('MANUFACTURED F-1471-3: an archived desk must not MASK an undeclared LIVE item', (t) => {
  // The costly half. Line-1 carries a real desk in the POSSESSIVE spelling with
  // an UNDECLARED item; the archive below uses the bare spelling and is clean.
  // Old guard: matched the bare archive first, reported PASS, and the live item
  // stayed invisible. New guard: reads line-1 and names it.
  const dir = fixture(
    t,
    withArchives(
      "Last updated: s1 handoff, lock CLEARED — work. 🔺 **OWNER'S DESK — one new.** 🔺 **F-9101-1**",
      '🔺 **F-7777-1**',
    ),
    '- 🟡 **F-7777-1 (s0) — declared long ago.** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /F-9101-1/);
});

test('all four desk spellings are read — the majority form was invisible', (t) => {
  // Measured on STATUS.md s1472: bare 243 · "OWNER'S" 484 · curly "OWNER’S" 15 ·
  // "OWNERS" 9. The guard matched ONLY the bare form, i.e. missed the spelling
  // fires use most. Each variant must find the same undeclared id.
  for (const word of ['OWNER DESK', "OWNER'S DESK", 'OWNER’S DESK', 'OWNERS DESK']) {
    const dir = fixture(
      t,
      `Last updated: s1 handoff, lock CLEARED — work. 🔺 **${word} — one new.** 🔺 **F-9102-1**\n`,
      '- 🟡 **F-8888-8 (s1) — unrelated.** body\n',
    );
    const r = run(dir);
    assert.equal(r.status, 1, `spelling "${word}" must be read: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /F-9102-1/, `spelling "${word}" must surface the id`);
  }
});

test('an ACTIVE lock line SKIPs (exit 0) — the desk is written at handoff time', (t) => {
  // test:node-guards runs mid-fire, when line-1 is the fire's own ACTIVE lock.
  // Refusing there would red every drain battery in the factory. The real gate
  // is test:ledger-guards, run as the LAST act after the handoff commit.
  const dir = fixture(
    t,
    withArchives('ACTIVE 2026-01-01T00:00Z (s1 fire) — draining something.', '🔺 **F-7777-1**'),
    '- 🟡 **F-7777-1 (s0) — declared.** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /SKIP/);
});

test('a lock line that MENTIONS the desk in prose is still a lock, not a desk', (t) => {
  // s1472 wrote exactly such a lock line while curing this guard, and the old
  // bare-substring selector was hijacked by it.
  const dir = fixture(
    t,
    'ACTIVE 2026-01-01T00:00Z (s1 fire) — curing the OWNER DESK guard fail-open.\n',
    '- 🟡 **F-8888-8** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /SKIP/);
});

test('MANUFACTURED: a prose mention upstream loses to the REAL desk in the tail', (t) => {
  // The desk is the TAIL of the handoff, so the LAST occurrence wins. Were the
  // first taken, this line would parse from the narrative mention, sweep up
  // F-9103-9 (a finding merely being reported CLOSED) and demand a row for it.
  const dir = fixture(
    t,
    'Last updated: s1 handoff, lock CLEARED — I cleared the OWNER DESK item ' +
      "F-9103-9 and shipped it. 🔺 **OWNER'S DESK — one new.** 🔺 **F-9103-1**\n",
    '- 🟡 **F-8888-8 (s1) — unrelated.** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /F-9103-1/);
  assert.doesNotMatch(r.stderr, /F-9103-9/, 'the upstream prose mention must not be read as a desk item');
});

test('a handoff whose desk header has no F-IDs after it REFUSES (exit 2)', (t) => {
  const dir = fixture(
    t,
    "Last updated: s1 handoff, lock CLEARED — work. 🔺 **OWNER'S DESK — nothing today.**\n",
    '- 🟡 **F-8888-8** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /zero keyed items/);
});

// ───────────────────────────────────────────────────────────────────────────
// F-1534-2 / F-1535-1 — THE SECOND KEY SHAPE. The desk routes items under two
// shapes and this guard knew only one, so a fifth of the live desk was read
// past entirely. Every test below drives the SLUG axis specifically; the F-ID
// tests above must all keep passing unchanged, since the flat F-ID scan is
// deliberately untouched (its extra hits are the F-1193-2 feature).
// ───────────────────────────────────────────────────────────────────────────

/** A desk whose items are keyed by backticked slugs rather than F-IDs. */
const SLUG_DESK = (items) =>
  'Last updated: s1 handoff, lock CLEARED — work. 🔺 **OWNER\'S DESK — some awaiting a word.** ' +
  items.map((i) => `🔺 **\`${i}\` OPEN** — needs a ruling.`).join(' ') +
  '\n- **s0 handoff (line-1 archive):** older text\n';

test('a SLUG-keyed desk item WITH a declaring row passes', (t) => {
  const dir = fixture(t, SLUG_DESK(['rf-99-some-fork']), '🔺 **`rf-99-some-fork` (s1) — a thing.** body\n');
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /desk slugs\s*:\s*1/);
});

test('MANUFACTURED F-1534-2: a SLUG desk item with NO row exits 1 and names the slug', (t) => {
  // The precise live defect: four slug-keyed items sat undeclared and the guard
  // could not see them at all, reporting PASS while a fifth of the desk was
  // invisible. Before s1535 this fixture exited 0.
  const dir = fixture(t, SLUG_DESK(['bt-99-homestead-thing']), '🔺 **F-8888-1 (s1) — unrelated.** body\n');
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /bt-99-homestead-thing/);
});

test('the F-1328-3 shape on the SLUG axis: a slug CITED in another row is not declared', (t) => {
  const dir = fixture(
    t,
    SLUG_DESK(['e9-some-socket']),
    '🔺 **`e9-other-socket` (s1) — blocked behind `e9-some-socket`.** body\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, 'a mention inside another item\'s row must not declare');
  assert.match(r.stderr, /e9-some-socket/);
});

test('F-1535-1: a backtick in an item\'s PROSE is not a desk item (the flat-scan trap)', (t) => {
  // Reusing the SLUG *pattern* in this guard's flat tail scan — the literal
  // reading of F-1534-2's prescription — invents desk items out of ordinary
  // markup. Measured s1535 on the live desk: flat found 7 slugs, 3 spurious
  // (`e2-incline`, a MAP NAME inside F-1529-4's prose, plus two aliases of
  // F-keyed items). Each would have demanded a BACKLOG row and RED the battery.
  const line1 =
    'Last updated: s1 handoff, lock CLEARED — work. 🔺 **OWNER\'S DESK — 1 awaiting a word.** ' +
    '🔺 **F-9100-1 OPEN** — the storm trigger costs 7.75× on `e2-incline` and needs a pick.' +
    '\n- **s0 handoff (line-1 archive):** older\n';
  const dir = fixture(t, line1, '🔺 **F-9100-1 (s1) — a thing.** body\n');
  const r = run(dir);
  assert.equal(r.status, 0, `e2-incline must not be demanded as a desk item:\n${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /desk slugs\s*:\s*0/);
});

test('F-1535-1: an item keyed by an F-ID that also cites its slug is ONE F-keyed item', (t) => {
  // "🔺 **F-1101-1 / `calibrate-suite-workers-v2` OPEN**" — first-key-wins inside
  // KEY_ZONE, so this is an F-ID item, not a slug item needing its own row.
  const line1 =
    'Last updated: s1 handoff, lock CLEARED — work. 🔺 **OWNER\'S DESK — 1 awaiting a word.** ' +
    '🔺 **F-9101-1 / `calibrate-some-thing-v2` OPEN** — retire the thread.' +
    '\n- **s0 handoff (line-1 archive):** older\n';
  const dir = fixture(t, line1, '🔺 **F-9101-1 (s1) — a thing.** body\n');
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /desk slugs\s*:\s*0/);
});

test('a desk of ONLY slug items does not trip the zero-keyed-items refusal', (t) => {
  // The refusal used to be "zero F-IDs", which would have REFUSED a legitimate
  // all-slug desk the moment the guard learned to read one.
  const dir = fixture(t, SLUG_DESK(['xx-only-slug-item']), '🔺 **`xx-only-slug-item` (s1) — a thing.** body\n');
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /desk F-IDs\s*:\s*0/);
  assert.match(r.stdout, /desk slugs\s*:\s*1/);
});

test('the live desk carries BOTH shapes — the slug axis is not vacuously green', async () => {
  // A green on an axis with zero members proves nothing (the s1299 standard).
  // Assert the live board actually exercises the new path.
  const { deskIds } = await import(pathToFileURL(GUARD).href);
  const status = fs.readFileSync(path.join(REPO, 'STATUS.md'), 'utf8');
  const desk = deskIds(status);
  if (desk.kind === 'lock') return; // mid-fire: no desk written yet
  assert.equal(desk.kind, 'desk');
  assert.ok(
    (desk.slugs?.length ?? 0) > 0,
    'the live desk should carry at least one slug-keyed item; if it genuinely ' +
      'does not, this assertion is the thing to revisit — but check first that ' +
      'the parser has not silently stopped keying slugs (F-1534-2 was exactly that)',
  );
});

// THE BASELINE IS A CEILING, NOT A FLOOR (F-1335-1, s1335).
// This assertion read `listed.length >= 9` when it shipped, which made the list
// unshrinkable: s1334's own §H(3) recommended "retire grandfathered entries by
// giving those 9 findings rows", and doing exactly that turned this test RED
// while the guard itself went green and strict. A debt list that cannot be paid
// down is not a baseline, it is a floor under the debt. Measured s1335 by
// manufacturing it: with all 9 rows written and the list emptied, 'the live
// board is green' PASSED and this test was the ONLY red.
//
// The honest invariant is monotonic shrink: the list may never GROW past the
// measured s1334 baseline without a new measurement, and may reach 0 freely.
const S1334_BASELINE = 9;

// BOTH extractors below were WIDENED s1534 alongside the guard's own FINDING
// regex (F-1533-2 / F-1534-1). They were the THIRD instance of the same
// digits-only blindness: had a future fire grandfathered an alpha-coded id —
// F-ER02-5, F-MSD-1, anything in the F-BW-* family — this ceiling test and the
// no-rot test below would both have read the list as EMPTY and passed, silently
// excusing an entry neither could see. The list is empty today, so nothing
// changes on the live board; the point is that the invariant now has the same
// vocabulary as the thing it polices.

test('the grandfather list may only SHRINK — never grows past the s1334 baseline', () => {
  const src = fs.readFileSync(GUARD, 'utf8');
  const listed = [...src.matchAll(/^\s*'(F-(?:[A-Z0-9]{1,8}-)+\d+)',/gm)].map((m) => m[1]);
  assert.ok(
    listed.length <= S1334_BASELINE,
    `grandfather list grew to ${listed.length} (baseline ${S1334_BASELINE}); ` +
      'a new entry needs a measurement and a ledger row, not a quiet append',
  );
});

test('every grandfathered id is still on the desk — the list must not rot', async () => {
  // A grandfathered id that has left the desk is dead weight that hides nothing;
  // worse, it would silently absolve a future re-listing of the same finding.
  // Vacuously true at length 0, which is the CORRECT reading: nothing is excused.
  //
  // THIS TEST CARRIED THE BUG IT WAS MEANT TO POLICE (F-1471-3's second instance,
  // cured s1472). It re-implemented the selector by hand — find the first line
  // containing the bare "OWNER DESK", slice from there — so it read the same
  // 3-day-stale ARCHIVED desk as the guard did. Two copies of one broken parser,
  // and the copy lived in the file whose job is to prove the parser works. Import
  // the real one; a guard's test must not fork its subject's logic.
  const src = fs.readFileSync(GUARD, 'utf8');
  const listed = [...src.matchAll(/^\s*'(F-(?:[A-Z0-9]{1,8}-)+\d+)',/gm)].map((m) => m[1]);
  const status = fs.readFileSync(path.join(REPO, 'STATUS.md'), 'utf8');
  const { deskIds } = await import(pathToFileURL(GUARD).href);
  const desk = deskIds(status);
  const onDesk = new Set(desk.kind === 'desk' ? desk.ids : []);
  const stale = listed.filter((id) => !onDesk.has(id));
  assert.deepEqual(stale, [], `grandfathered ids no longer on the desk: ${stale.join(', ')}`);
});

test('MANUFACTURED: with the list EMPTY the guard is strict — no id is excused', (t) => {
  // The retirement's whole point. Before s1335 an undeclared desk item could be
  // silenced by a name in the list; now nothing can be, and this proves the
  // guard still reaches exit 1 rather than having been softened by the change.
  const dir = fixture(t, DESK(['F-9002-1']), '- 🟡 **F-8888-8 (s1) — some other finding.** body\n');
  const r = run(dir);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /F-9002-1/);
});
