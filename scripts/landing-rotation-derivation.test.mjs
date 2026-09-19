/**
 * F-2568-2 -- THE LANDING PAGE USED TO RESTATE THE OPEN ROTATION ID BY HAND, EVERY WEEK, FOREVER.
 *
 * OWNER RULING 2026-09-19, verbatim: "I agree with all your recommendations on the decisions - good
 * work", taken on `docs/OWNER-DESK-2026-09-19.md`, where the item reads: "The door derives the
 * current rotation from shipped data; only the landing page restates it by hand. Recommendation --
 * RULED 2026-09-19. Derive it and abolish the weekly edit."
 *
 * The constant `CURRENT_ROTATION_ID` is gone from `site/`, the weekly RT-01 step that moved it is
 * retired in `scripts/fire.md`, and `scripts/skillmd-guard.test.mjs` no longer pins its text. This
 * guard is what stops it coming back, and it does three things a grep could not:
 *
 *   1. it refuses ANY hand-written rotation id in the shipped landing sources -- the class, not the
 *      one constant, because the next hand-edit will not be spelled the same way;
 *   2. it EVALUATES the page's derivation block against the registry the door itself reads
 *      (`assets/rotations/rotation-seeds.json`), so "derives the same answer as the door" is
 *      measured over real data rather than asserted in a comment;
 *   3. it drives the block's fallback with a stubbed door, so the week-not-minted walk-back and the
 *      door-is-down stop are both exercised: the first is `currentOrLatestRotation`'s "latest that
 *      has opened", the second is what keeps a resting door from being asked twelve times.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import registry from '../assets/rotations/rotation-seeds.json' with { type: 'json' };

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LANDING = 'site/assay-office.js';
const ROTATION_ID = /\br\d{4}w\d{2}\b/;
const FENCE_START = '// rotation-derivation:start';
const FENCE_END = '// rotation-derivation:end';
const WEEK_MS = 7 * 86400000;

/** Every tracked text file the landing page ships: the corpus, asked of git so it cannot go stale. */
function trackedLandingSources() {
  return execFileSync('git', ['ls-files', '-z', '--', 'site'], { cwd: ROOT, maxBuffer: 16 << 20 })
    .toString().split('\0').filter(Boolean)
    .filter((file) => /\.(?:js|ts|html|css)$/.test(file));
}

function landingSource() {
  return readFileSync(new URL(`../${LANDING}`, import.meta.url), 'utf8');
}

/** The derivation block, lifted out of the page and evaluated with an injected `fetch`. */
function derivation(fetchStub) {
  const source = landingSource();
  const start = source.indexOf(FENCE_START);
  const end = source.indexOf(FENCE_END);
  assert.ok(start !== -1 && end > start,
    `${LANDING} must keep the ${FENCE_START} / ${FENCE_END} fence -- without it this guard scans nothing and reports success`);
  const body = source.slice(start, end);
  assert.match(body, /function isoWeekRotationId/, 'the fence must contain the derivation it claims to');
  // eslint-disable-next-line no-new-func -- the subject IS this source text; importing the page
  // would run its DOMContentLoaded wiring against a DOM that does not exist here.
  return new Function('fetch', `${body}\nreturn { ROTATION_LOOKBACK_WEEKS, isoWeekRotationId, rotationUrl, fetchOpenRotation };`)(fetchStub);
}

test('the landing page holds no hand-written rotation id', () => {
  const corpus = trackedLandingSources();
  assert.ok(corpus.length > 0, 'ZERO tracked landing sources -- the selector or the root is wrong, never a clean tree');
  const offences = [];
  for (const file of corpus) {
    const lines = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split('\n');
    lines.forEach((line, index) => { if (ROTATION_ID.test(line)) offences.push(`${file}:${index + 1}: ${line.trim()}`); });
  }
  assert.deepEqual(offences, [],
    `F-2568-2 (owner ruling 2026-09-19): the landing page derives the open rotation, it never restates one. ${corpus.length} tracked landing sources scanned.`);
});

test('the landing page declares no CURRENT_ROTATION_ID constant', () => {
  // The name may still be NAMED in prose (the fence's own comment explains what it replaced); what
  // is refused is a declaration or assignment. The arm above is the one that catches the value.
  const offences = trackedLandingSources()
    .filter((file) => /CURRENT_ROTATION_ID\s*=/.test(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')));
  assert.deepEqual(offences, [], 'the hand-edited constant was abolished by the ruling of 2026-09-19; derive it');
});

test('the page derives the id the registry minted, for every rotation the county ships', () => {
  const { isoWeekRotationId } = derivation(async () => { throw new Error('no door in this arm'); });
  assert.ok(registry.rotations.length > 0, 'ZERO rotations in the registry -- refusing to certify an empty corpus');
  for (const rotation of registry.rotations) {
    const opensAt = Date.parse(rotation.opensAt);
    const closesAt = Date.parse(rotation.closesAt);
    assert.equal(isoWeekRotationId(opensAt), rotation.id, `${rotation.id}: the instant it opens`);
    assert.equal(isoWeekRotationId(opensAt + WEEK_MS / 2), rotation.id, `${rotation.id}: mid-window`);
    assert.equal(isoWeekRotationId(closesAt - 1), rotation.id, `${rotation.id}: the last millisecond before it closes`);
  }
});

test('the page and the door pick the same rotation at every instant the registry covers', () => {
  const { isoWeekRotationId } = derivation(async () => { throw new Error('no door in this arm'); });
  // `currentOrLatestRotation` (functions/api/standings.ts): the latest rotation whose opensAt <= now.
  const doorPick = (now) => [...registry.rotations].filter((r) => Date.parse(r.opensAt) <= now)
    .sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt))[0] ?? null;
  for (const rotation of registry.rotations) {
    for (const offset of [0, 3 * 86400000, WEEK_MS - 1]) {
      const now = Date.parse(rotation.opensAt) + offset;
      assert.equal(isoWeekRotationId(now), doorPick(now).id, `at ${new Date(now).toISOString()} the page must ask for the door's answer`);
    }
  }
});

test('a week that was never minted walks back to the latest rotation that did open', async () => {
  const asked = [];
  const open = registry.rotations[0];
  const { fetchOpenRotation, ROTATION_LOOKBACK_WEEKS } = derivation(async (url) => {
    asked.push(url);
    return new URL(url).searchParams.get('rotation') === open.id
      ? { ok: true, status: 200, json: async () => ({ ok: true, board: 'transfer', rotation: open, standings: [] }) }
      : { ok: false, status: 400, json: async () => ({ ok: false, error: 'bad_rotation' }) };
  });
  // Stand four weeks past that rotation's open, with nothing minted since: the door refuses every
  // week between, and the page must land on the one that opened rather than showing a quiet line.
  const clock = Date.now;
  Date.now = () => Date.parse(open.opensAt) + 4 * WEEK_MS;
  try {
    const payload = await fetchOpenRotation();
    assert.equal(payload.rotation.id, open.id);
    assert.equal(asked.length, 5, 'one ask per week walked back, no more');
    assert.ok(asked.length <= ROTATION_LOOKBACK_WEEKS, 'the walk-back is bounded');
    assert.ok(asked.every((url) => url.startsWith('https://agenttown.app/api/standings?board=transfer&rotation=')));
  } finally {
    Date.now = clock;
  }
});

test('a resting door is asked once, not twelve times', async () => {
  let asks = 0;
  const { fetchOpenRotation } = derivation(async () => {
    asks += 1;
    return { ok: false, status: 503, json: async () => ({ ok: false, error: 'ledger_resting' }) };
  });
  await assert.rejects(fetchOpenRotation(), /rotation unavailable/);
  assert.equal(asks, 1, 'a 503 is about the door, not about the week: stop, do not storm it');
});
