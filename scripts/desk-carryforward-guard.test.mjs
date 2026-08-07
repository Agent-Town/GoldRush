import test from 'node:test';
import assert from 'node:assert/strict';
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
