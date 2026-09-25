// THE LIVE SEED RESOLVER (tasks/live-seed-rotation-1.md, owner ruling 2026-09-24 on
// docs/OWNER-DECISIONS-2026-09-24.md item 2, verbatim "(a)"). Runs the real module under plain node:
// src/game/liveSeed.ts imports nothing but the registry, so the rules are tested exactly as the game
// bundles them. Every instant below is an explicit UTC timestamp; nothing here reads the wall clock.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import registry from '../assets/rotations/rotation-seeds.json' with { type: 'json' };
import { LIVE_SEED_CONSTANT, liveSeedLabel, resolveLiveSeed } from '../src/game/liveSeed.ts';

const ROTATIONS = registry.rotations;
const DAY = 86_400_000;
const rotation = (id) => {
  const found = ROTATIONS.find((entry) => entry.id === id);
  assert.ok(found, `the registry keeps ${id} (history is never pruned)`);
  return found;
};
const W38 = rotation('r2026w38');
const W39 = rotation('r2026w39');
const TODAY = Date.parse('2026-09-25T12:00:00.000Z');

test('an open week resolves its own seed, for every contract it carries, across its whole window', () => {
  for (const entry of ROTATIONS) {
    const opensAt = Date.parse(entry.opensAt);
    const closesAt = Date.parse(entry.closesAt);
    for (const [contractId, seed] of Object.entries(entry.seeds)) {
      for (const now of [opensAt, opensAt + 3.5 * DAY, closesAt - 1]) {
        assert.equal(resolveLiveSeed(contractId, now), seed, `${entry.id} ${contractId} at ${new Date(now).toISOString()}`);
      }
    }
  }
  // The day this landed: r2026w39 is open for all six boards.
  assert.deepEqual(
    Object.fromEntries(Object.keys(W39.seeds).map((contractId) => [contractId, resolveLiveSeed(contractId, TODAY)])),
    W39.seeds,
  );
});

test('the week turns at Monday 00:00:00.000 UTC, half-open, whatever the local clock says', () => {
  const monday = Date.parse(W39.opensAt);
  assert.equal(W38.closesAt, W39.opensAt, 'r2026w38 hands over to r2026w39 at one instant');
  assert.equal(new Date(monday).getUTCDay(), 1, 'a rotation opens on a Monday');
  assert.equal(new Date(monday).toISOString(), '2026-09-21T00:00:00.000Z');
  assert.equal(resolveLiveSeed('the-claim', monday - 1), W38.seeds['the-claim'], 'Sunday 23:59:59.999 UTC is still last week');
  assert.equal(resolveLiveSeed('the-claim', monday), W39.seeds['the-claim'], 'Monday 00:00:00.000 UTC is the new week');
  // Sunday 21:00 in Sao Paulo IS Monday 00:00 UTC; Monday 01:59 in Berlin is still Sunday UTC.
  assert.equal(resolveLiveSeed('e1-baron', Date.parse('2026-09-20T21:00:00.000-03:00')), W39.seeds['e1-baron']);
  assert.equal(resolveLiveSeed('e1-baron', Date.parse('2026-09-21T01:59:59.999+02:00')), W38.seeds['e1-baron']);
  for (const entry of ROTATIONS) {
    const opensAt = new Date(entry.opensAt);
    assert.equal(opensAt.getUTCDay(), 1, `${entry.id} opens on a Monday`);
    assert.equal(opensAt.getTime() % DAY, 0, `${entry.id} opens at 00:00:00.000 UTC`);
    assert.equal(Date.parse(entry.closesAt) - opensAt.getTime(), 7 * DAY, `${entry.id} lasts one week`);
  }
});

test('a closed week falls back to the latest week that has opened, never to one not yet open', () => {
  const latest = [...ROTATIONS].sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt))[0];
  const closed = Date.parse(latest.closesAt);
  for (const now of [closed, closed + 1, closed + 30 * DAY]) {
    for (const [contractId, seed] of Object.entries(latest.seeds)) {
      assert.equal(resolveLiveSeed(contractId, now), seed, `after ${latest.id} closes, ${contractId} rides it`);
    }
  }
  // A missed week, with the NEXT one already minted: the closed week wins, the held-out one is not ridden.
  const held = [
    { id: 'r2030w01', opensAt: '2029-12-31T00:00:00.000Z', closesAt: '2030-01-07T00:00:00.000Z', seeds: { 'the-claim': 'claim-w01' } },
    { id: 'r2030w03', opensAt: '2030-01-14T00:00:00.000Z', closesAt: '2030-01-21T00:00:00.000Z', seeds: { 'the-claim': 'claim-w03' } },
  ];
  assert.equal(resolveLiveSeed('the-claim', Date.parse('2030-01-10T00:00:00.000Z'), held), 'claim-w01');
  assert.equal(resolveLiveSeed('the-claim', Date.parse('2030-01-14T00:00:00.000Z'), held), 'claim-w03');
  assert.equal(resolveLiveSeed('the-claim', Date.parse('2029-12-30T23:59:59.999Z'), held), LIVE_SEED_CONSTANT, 'nothing opened yet');
  // The fallback is per contract: an open week that does not carry a board leaves it on its last week.
  const dropped = [
    { id: 'r2030w01', opensAt: '2029-12-31T00:00:00.000Z', closesAt: '2030-01-07T00:00:00.000Z', seeds: { 'the-claim': 'claim-w01', 'e1-baron': 'baron-w01' } },
    { id: 'r2030w02', opensAt: '2030-01-07T00:00:00.000Z', closesAt: '2030-01-14T00:00:00.000Z', seeds: { 'the-claim': 'claim-w02' } },
  ];
  const midW02 = Date.parse('2030-01-09T00:00:00.000Z');
  assert.equal(resolveLiveSeed('the-claim', midW02, dropped), 'claim-w02');
  assert.equal(resolveLiveSeed('e1-baron', midW02, dropped), 'baron-w01');
});

test('a contract the registry does not carry rides the constant', () => {
  assert.equal(LIVE_SEED_CONSTANT, 'gold-rush');
  for (const contractId of ['e1-drill-yard', 'e5-regatta', 'not-a-contract', '']) {
    assert.equal(resolveLiveSeed(contractId, TODAY), LIVE_SEED_CONSTANT, contractId || '(empty id)');
  }
  const first = Math.min(...ROTATIONS.map((entry) => Date.parse(entry.opensAt)));
  assert.equal(resolveLiveSeed('the-claim', first - 1), LIVE_SEED_CONSTANT, 'before the first rotation ever opened');
  assert.equal(resolveLiveSeed('the-claim', Number.NaN), LIVE_SEED_CONSTANT, 'an unreadable clock never picks a week');
  assert.equal(resolveLiveSeed('the-claim', TODAY, []), LIVE_SEED_CONSTANT, 'an empty registry');
});

test('the answer does not depend on registry order, and malformed entries are skipped', () => {
  const reversed = [...ROTATIONS].reverse();
  for (const now of [TODAY, Date.parse(W38.opensAt), Date.parse(W39.closesAt) + DAY]) {
    for (const contractId of Object.keys(W39.seeds)) {
      assert.equal(resolveLiveSeed(contractId, now, reversed), resolveLiveSeed(contractId, now));
    }
  }
  const malformed = [
    { id: 'bad-date', opensAt: 'not a date', closesAt: '2030-01-07T00:00:00.000Z', seeds: { 'the-claim': 'bad' } },
    { id: 'empty-seed', opensAt: '2029-12-31T00:00:00.000Z', closesAt: '2030-01-07T00:00:00.000Z', seeds: { 'the-claim': '' } },
    { id: 'r2029w52', opensAt: '2029-12-24T00:00:00.000Z', closesAt: '2029-12-31T00:00:00.000Z', seeds: { 'the-claim': 'good' } },
  ];
  assert.equal(resolveLiveSeed('the-claim', Date.parse('2030-01-02T00:00:00.000Z'), malformed), 'good');
  // Two open windows never happen in a minted registry; if they ever did, the newer week wins in either order.
  const overlapping = [
    { id: 'r2030w01', opensAt: '2029-12-31T00:00:00.000Z', closesAt: '2030-01-14T00:00:00.000Z', seeds: { 'the-claim': 'long-w01' } },
    { id: 'r2030w02', opensAt: '2030-01-07T00:00:00.000Z', closesAt: '2030-01-14T00:00:00.000Z', seeds: { 'the-claim': 'claim-w02' } },
  ];
  const both = Date.parse('2030-01-08T00:00:00.000Z');
  assert.equal(resolveLiveSeed('the-claim', both, overlapping), 'claim-w02');
  assert.equal(resolveLiveSeed('the-claim', both, [...overlapping].reverse()), 'claim-w02');
});

test('the seed line names the week in plain words, and only for a minted seed', () => {
  assert.equal(liveSeedLabel(W39.seeds['the-claim']), 'Week 39 claim');
  assert.equal(liveSeedLabel(W38.seeds['e1-night-shift']), 'Week 38 claim');
  assert.equal(liveSeedLabel(rotation('r2026w37').seeds['e2-hill-mine']), 'Week 37 claim');
  assert.equal(liveSeedLabel(LIVE_SEED_CONSTANT), null, 'the constant has no week');
  assert.equal(liveSeedLabel(benchSeeds['the-claim'][0]), null, 'a bench seed has no week');
  assert.equal(liveSeedLabel('e1-the-claim-r2026w39-000000000000'), null, 'a look-alike that was never minted has no week');
  assert.equal(liveSeedLabel('claim-w01', [{ id: 'r2030w01', opensAt: '2029-12-31T00:00:00.000Z', closesAt: '2030-01-07T00:00:00.000Z', seeds: { 'the-claim': 'claim-w01' } }]), 'Week 1 claim');
});

test('the client and the county door read one registry file', () => {
  const client = readFileSync(new URL('../src/game/liveSeed.ts', import.meta.url), 'utf8');
  const door = readFileSync(new URL('../functions/api/standings.ts', import.meta.url), 'utf8');
  const path = "assets/rotations/rotation-seeds.json' with { type: 'json' }";
  assert.ok(client.includes(`'../../${path}`), 'src/game/liveSeed.ts imports the registry');
  assert.ok(door.includes(`'../../${path}`), 'functions/api/standings.ts imports the same registry');
});
