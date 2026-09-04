import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  analyse,
  acknowledged,
  deskItems,
  deskTail,
  isLockLine,
  previousDesk,
} from './desk-carryforward-guard.mjs';

const HEADER = "🔺 **OWNER'S DESK — n awaiting a word.**";
const handoff = (tail) => `Last updated: 2026-08-07T20:00Z s1534 handoff, lock CLEARED — ${tail}`;
const archive = (s, tail) => `- **s${s} handoff (line-1 archive):** Last updated: … lock CLEARED — ${tail}`;
const status = (line1, ...rest) => [line1, ...rest].join('\n');

// A ledger with one genuine closure row, in the bullet-led shape the `wide`
// vocabulary exists to see (measured s1291 as the commonest closure shape).
const BACKLOG = ['- ✅ **F-9001-1 CLOSED s1533 — cured by `abc1234`.**', ''].join('\n');

function runGuard(statusText, backlogText = '') {
  const root = mkdtempSync(path.join(tmpdir(), 'desk-carryforward-'));
  mkdirSync(path.join(root, 'tasks'));
  writeFileSync(path.join(root, 'STATUS.md'), statusText);
  writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), backlogText);
  try {
    return spawnSync(
      process.execPath,
      [fileURLToPath(new URL('./desk-carryforward-guard.mjs', import.meta.url)), '--root', root],
      { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const droppedStatus = (line1 = handoff(HEADER)) => status(
  line1,
  archive(1533, `${HEADER} 🔺 **F-1541-2 OPEN**`),
);

test('deskItems reproduces the counts the fires wrote in their own headers', () => {
  // s1532's real desk shape: 5 F-ID items + 4 backticked slug items = 9, which
  // is exactly the "9 awaiting a word" that fire declared.
  const tail =
    `${HEADER} 🔺 **F-1167-1 OPEN — a fork.** 🔺 **F-1499-2 OPEN (the big one).**` +
    ' 🔺 **F-1529-4 OPEN — needs a pick.** 🔺 **F-1101-1 / `calibrate-suite-workers-v2` OPEN.**' +
    ' 🔺 **F-1166-1 OPEN — (a) or (b).** 🔺 **`rf-34-hero-y-restore-roundtrip` OPEN**' +
    ' 🔺 **`e3-fairground-socket` OPEN** 🔺 **`bt-04-homestead-automation` OPEN.**' +
    ' 🔺 **`f1328-1-drill-yard-census-debt` OPEN.**';
  assert.equal(deskItems(deskTail(tail)).length, 9);
});

test('the desk is the LAST desk word on the line, so an upstream mention loses', () => {
  const line = `prose about the OWNER'S DESK earlier — ${HEADER} 🔺 **F-1000-1 OPEN**`;
  assert.deepEqual(deskItems(deskTail(line)), ['F-1000-1']);
});

test('a clean carry-forward passes', () => {
  const r = analyse(
    status(handoff(`${HEADER} 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**`),
           archive(1533, `${HEADER} 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**`)),
    BACKLOG,
  );
  assert.equal(r.kind, 'desk');
  assert.deepEqual(r.silent, []);
});

test('the newest archived desk wins even when archive rows are out of order', () => {
  const parsed = previousDesk(status(
    handoff(HEADER),
    archive(1533, `${HEADER} 🔺 **F-1000-1 OPEN**`),
    archive(1537, `${HEADER} 🔺 **F-1000-2 OPEN**`),
  ));
  assert.equal(parsed.session, 1537);
  assert.deepEqual(parsed.items, ['F-1000-2']);
});

test('MANUFACTURED DEFECT — a silently dropped item is caught', () => {
  // A passing guard never executes its violation path, so a green is not
  // evidence about the red (the s1299/s1300 standard). Drop one item, say
  // nothing, and require the guard to name exactly it.
  const r = analyse(
    status(handoff(`${HEADER} 🔺 **F-1000-1 OPEN**`),
           archive(1533, `${HEADER} 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**`)),
    BACKLOG,
  );
  assert.deepEqual(r.dropped, ['F-1000-2']);
  assert.deepEqual(r.silent, ['F-1000-2']);
});

test('GROUND TRUTH — the real s1526 -> s1527 event reds, and names ten, not thirteen', () => {
  // The event this guard exists for, with its true correspondence. The three
  // RE-KEYED items must NOT be reported: a bare id comparison calls them drops
  // (13) and is wrong by 23% on the one event with ground truth.
  const s1526 =
    `${HEADER} 🔺 **F-1522-5 restart the runner** 🔺 **F-1511-5 ceiling** 🔺 **F-1494-1 remove gate-s1455**` +
    ' 🔺 **F-1507-1 nvmrc** 🔺 **F-1499-2 rider body** 🔺 **F-1501-3 staging MB** 🔺 **F-1510-1 go-around**' +
    ' 🔺 **`f1328-1-drill-yard-census-debt`** 🔺 **F-MTS-2 capture verb** 🔺 **F-MILK-SS-3 dust flats**' +
    ' 🔺 **F-MSD-1 13 of 25 maps** 🔺 **F-MSD-2 bespoke glb** 🔺 **F-1493-3 railcar**' +
    ' 🔺 **F-1475-1 e3-fairground** 🔺 **F-1096-2 rf-34 hero-Y** 🔺 **F-1166-1 jumper** 🔺 **F-1294-1 workers-v2**';
  const s1527 =
    `${HEADER} 🔺 **F-1499-2 OPEN** 🔺 **F-1101-1 / \`calibrate-suite-workers-v2\` OPEN**` +
    ' 🔺 **F-1166-1 OPEN** 🔺 **`rf-34-hero-y-restore-roundtrip` OPEN**' +
    ' 🔺 **`e3-fairground-socket` OPEN** 🔺 **`bt-04-homestead-automation` OPEN**' +
    ' 🔺 **`f1328-1-drill-yard-census-debt` OPEN**';

  const bare = analyse(status(handoff(s1527), archive(1526, s1526)), BACKLOG);
  assert.equal(bare.prev.items.length, 17, "s1526's own header said 17");
  assert.equal(bare.live.length, 7, "s1527's own header said 7");
  // Unacknowledged, the guard reports all 14 absences — correctly, because
  // nothing in s1527's text distinguishes a re-key from a disappearance.
  assert.equal(bare.silent.length, 14);

  // With the three re-keys and the one closure declared, exactly the ten real
  // drops remain — the number a reader should have been given at the time.
  const acked =
    s1527 +
    ' DESK-DROPPED: F-1096-2 re-keyed to `rf-34-hero-y-restore-roundtrip`;' +
    ' F-1475-1 re-keyed to `e3-fairground-socket`; F-1294-1 re-keyed to F-1101-1;' +
    ' F-1494-1 closed — gate-s1455 residue cleared retention-law-first.';
  const r = analyse(status(handoff(acked), archive(1526, s1526)), BACKLOG);
  assert.equal(r.silent.length, 10);
  assert.ok(r.silent.includes('F-MSD-1'), '13 of 25 unopenable maps must still surface');
  assert.ok(r.silent.includes('F-1522-5'), 'the "cheapest win on this list" must still surface');
  assert.ok(!r.silent.includes('F-1096-2'), 'a declared re-key is not a drop');
});

test('GROUND TRUTH — the real s1529 backtick header is read, not scored as a mass drop', () => {
  // F-1542-1. s1529 (aab5dfb3) wrote "OWNER`S DESK" — a grave accent, U+0060,
  // where the apostrophe goes — over a perfectly well-formed desk of 8 items.
  // The four-spelling regex missed it, deskTail returned null, deskItems(null)
  // returned [], and the guard reported the ENTIRE inherited desk as silently
  // dropped: "this desk: 0 items · dropped: 7", rc=1. The guard built to catch
  // dropped items accused a fire of dropping all of them.
  //
  // This is the incident replayed, not a mock of it: the header below is the
  // exact byte sequence from that commit. It cannot be found by grepping the
  // live STATUS.md — s1530 normalised the character while archiving s1529.
  const BACKTICK = '🔺 **OWNER`S DESK — 8 awaiting a word.**';
  assert.equal(BACKTICK.charCodeAt(BACKTICK.indexOf('OWNER') + 5), 0x60, 'fixture must hold U+0060');

  assert.notEqual(deskTail(BACKTICK + ' 🔺 **F-1000-1 OPEN**'), null, 'the desk must be findable');

  const r = analyse(
    status(handoff(`${BACKTICK} 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**`),
           archive(1528, `${HEADER} 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**`)),
    BACKLOG,
  );
  assert.equal(r.kind, 'desk');
  assert.deepEqual(r.live, ['F-1000-1', 'F-1000-2']);
  assert.deepEqual(r.silent, [], 'a carried desk must not read as dropped over one glyph');
});

test('a BACKLOG closure row excuses a drop, in the wide vocabulary', () => {
  const r = analyse(
    status(handoff(`${HEADER} 🔺 **F-1000-1 OPEN**`),
           archive(1533, `${HEADER} 🔺 **F-1000-1 OPEN** 🔺 **F-9001-1 OPEN**`)),
    BACKLOG,
  );
  assert.deepEqual(r.dropped, ['F-9001-1']);
  assert.deepEqual(r.silent, [], 'closed in the ledger, so not silent');
});

test('acknowledgement is scoped — a DESK-DROPPED elsewhere does not cover any id', () => {
  const line = 'DESK-DROPPED: F-1000-9 closed.' + ' padding'.repeat(80) + ' F-1000-2';
  assert.equal(acknowledged(line, 'F-1000-9'), true);
  assert.equal(acknowledged(line, 'F-1000-2'), false, 'too far from the marker to be its subject');
});

test('SKIPS mid-fire on an ACTIVE lock, so drain batteries are unaffected', () => {
  assert.equal(isLockLine('ACTIVE 2026-08-07T18:27Z (s1533 fire) — working'), true);
  assert.equal(isLockLine('Last updated: … s1533 handoff, lock CLEARED — done'), false);
  const r = analyse(status('ACTIVE 2026-08-07T18:27Z (s1533 fire) — working'), BACKLOG);
  assert.equal(r.kind, 'lock');
});

test('REFUSES rather than greening over an unreadable previous desk', () => {
  // The vacuous mode: no archive bullet at all. Every comparison would pass.
  const r = analyse(status(handoff(`${HEADER} 🔺 **F-1000-1 OPEN**`)), BACKLOG);
  assert.equal(r.kind, 'no-previous');
  // ...and an archive bullet that carries no desk is not a desk either.
  assert.equal(previousDesk(['- **s1533 handoff (line-1 archive):** no desk here'].join('\n')), null);
});

test('citation-only closure cannot silently excuse a dropped desk item', () => {
  const result = runGuard(
    droppedStatus(),
    '- ✅ **F-1542-1 CLOSED — supersedes F-1541-2.**\n',
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /F-1541-2/);
});

test('subject-led closure still excuses a dropped desk item', () => {
  const result = runGuard(droppedStatus(), '- ✅ **F-1541-2 CLOSED — shipped.**\n');
  assert.equal(result.status, 0);
});

test('DESK-DROPPED remains an independent lawful exit', () => {
  const result = runGuard(droppedStatus(handoff(`${HEADER} DESK-DROPPED: F-1541-2 — re-keyed.`)));
  assert.equal(result.status, 0);
});

test('REFUSES both absent and empty previous desks at the CLI boundary', () => {
  const absent = runGuard(handoff(HEADER));
  const empty = runGuard(status(handoff(HEADER), archive(1533, HEADER)));
  assert.equal(absent.status, 2);
  assert.equal(empty.status, 2);
});

test('ACTIVE line-1 still skips mid-fire', () => {
  const result = runGuard(droppedStatus('ACTIVE 2026-08-08T18:40Z (s1566 fire) — working'));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /SKIP/);
});

test('live declared count delta 0 passes', () => {
  const desk = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**";
  assert.equal(runGuard(status(handoff(desk), archive(1584, desk))).status, 0);
});

test('s1533 protection — live declared count deltas +1 and -1 pass', () => {
  const plusOne = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-1000-1 OPEN**";
  const minusOne = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-1000-1 OPEN** 🔺 **F-1000-2 OPEN**";
  assert.equal(runGuard(status(handoff(plusOne), archive(1584, plusOne))).status, 0);
  assert.equal(runGuard(status(handoff(minusOne), archive(1584, minusOne))).status, 0);
});

test('s1585 live delta +4 refuses and names its four real unkeyed slugs', () => {
  const keyed = Array.from({ length: 20 }, (_, i) => `🔺 **F-2000-${i + 1} OPEN**`).join(' ');
  const unkeyed = [
    'rf-34-hero-y-restore-roundtrip BLOCKED owner-fork',
    'e3-fairground-socket BLOCKED owner-fork',
    'bt-04-homestead-automation BLOCKED owner-fork',
    'f1328-1-drill-yard-census-debt BLOCKED disputed',
  ];
  const live = `🔺 **OWNER'S DESK — 24 awaiting a word.** ${keyed} ` +
    unkeyed.map((item) => `🔺 **${item}**`).join(' ');
  const previous = `🔺 **OWNER'S DESK — 20 awaiting a word.** ${keyed}`;
  const result = runGuard(status(handoff(live), archive(1584, previous)));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /declares 24 item\(s\), but 20 can be keyed/);
  for (const item of unkeyed) assert.match(result.stderr, new RegExp(item));
  assert.match(result.stderr, /F-ID or a `backticked-slug` at the very front/);
});

test('s1583 dot-separated live delta +22 refuses', () => {
  const run = Array.from({ length: 23 }, (_, i) => `**F-3000-${i + 1} OPEN**`).join(' · ');
  const live = `🔺 **OWNER'S DESK — 23 awaiting a word.** 🔺 ${run}`;
  const previous = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-3000-1 OPEN**";
  const result = runGuard(status(handoff(live), archive(1584, previous)));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /declares 23 item\(s\), but 1 can be keyed/);
});

test('a live desk with no declared count still passes', () => {
  const desk = "🔺 **OWNER'S DESK.** 🔺 **F-1000-1 OPEN**";
  assert.equal(runGuard(status(handoff(desk), archive(1584, desk))).status, 0);
});

test('a live ACTIVE lock still skips before declared-count evaluation', () => {
  const result = runGuard(status(
    "ACTIVE 2026-08-09T05:37Z (s1586 fire) — OWNER'S DESK — 24 awaiting a word",
    archive(1585, "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-1000-1 OPEN**"),
  ));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /SKIP/);
});

test('a collapsed previous desk remains advisory when the live desk is clean', () => {
  const live = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-1000-1 OPEN**";
  const previous =
    "🔺 **OWNER'S DESK — 5 awaiting a word.** 🔺 **F-1000-1 OPEN**" +
    ' 🔺 **rf-34-hero-y-restore-roundtrip BLOCKED** 🔺 **e3-fairground-socket BLOCKED**' +
    ' 🔺 **bt-04-homestead-automation BLOCKED** 🔺 **f1328-1-drill-yard-census-debt BLOCKED**';
  const result = runGuard(status(handoff(live), archive(1585, previous)));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /previous desk declares 5 item\(s\) but 4 could not be keyed/);
});

// F-1588-2 (cured s1603) — the count refusal used to exit(1) before the drop
// report, so a doubly-broken desk diagnosed in two rounds. These manufacture
// the doubly-broken desk rather than asserting the merge from a green.
test('F-1588-2 — a doubly-broken desk reports BOTH defects in one run', () => {
  const live = "🔺 **OWNER'S DESK — 5 awaiting a word.** 🔺 **F-9002-2 OPEN**" +
    ' 🔺 **an unkeyed prose item** 🔺 **another unkeyed one**' +
    ' 🔺 **third unkeyed** 🔺 **fourth unkeyed**';
  const previous = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-9002-2 OPEN** 🔺 **F-8001-1 OPEN**";
  const result = runGuard(status(handoff(live), archive(1602, previous)));
  assert.equal(result.status, 1);
  // the count defect...
  assert.match(result.stderr, /declares 5 item\(s\), but 1 can be keyed/);
  // ...AND the silent drop, which before the cure surfaced only on the next run
  assert.match(result.stderr, /left the OWNER'S DESK with no reason given/);
  assert.match(result.stderr, /F-8001-1/);
  assert.match(result.stderr, /2 defects reported above/);
});

test('F-1588-2 — an unkeyed segment can FAKE a drop, so the drop list says so', () => {
  // The hazard the old ordering was accidentally hiding: deskItems() keys only
  // the first KEY_ZONE chars, so an item carried in longer prose reads as
  // dropped while plainly present on the very same desk.
  const prose = '**carried, but the key sits far into the segment because the fire wrote a' +
    ' long clause first and only then named it, which is ordinary prose** ';
  const live = "🔺 **OWNER'S DESK — 5 awaiting a word.** 🔺 **F-9002-2 OPEN** " +
    `🔺 ${prose}F-8001-1 OPEN 🔺 **x** 🔺 **y** 🔺 **z**`;
  const previous = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-9002-2 OPEN** 🔺 **F-8001-1 OPEN**";
  const result = runGuard(status(handoff(live), archive(1602, previous)));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /F-8001-1/);
  assert.match(result.stderr, /may name an item that IS carried/);
});

test('CONTROL — a real drop on a fully-keyed desk carries NO phantom caveat', () => {
  // Without this the caveat could decay into an always-on banner that signals
  // nothing (the s1602 doctrine): it must be absent when nothing is unkeyed.
  const live = "🔺 **OWNER'S DESK — 1 awaiting a word.** 🔺 **F-9002-2 OPEN**";
  const previous = "🔺 **OWNER'S DESK — 2 awaiting a word.** 🔺 **F-9002-2 OPEN** 🔺 **F-8001-1 OPEN**";
  const result = runGuard(status(handoff(live), archive(1602, previous)));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /F-8001-1/);
  assert.doesNotMatch(result.stderr, /may name an item that IS carried/);
  assert.doesNotMatch(result.stderr, /2 defects reported above/);
});
