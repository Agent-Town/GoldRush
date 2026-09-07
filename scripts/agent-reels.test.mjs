import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

// ADR-005 stage 3: was a HOLD. Every assertion below is about TAPE VALIDATION bounds — order
// count, a non-finite coordinate, a moved body — so it needs a verb the door accepts and a
// two-key point shape, which MOVE_HERO is and HOLD no longer exists to be.
const park = { verb: 'MOVE_HERO', pos: { x: 0, z: 12 } };

test('agent reel validation reuses the door bounds and CLI tape content stays deterministic under unique ids', async () => {
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { onRequest, validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
    const tape = fixture(Array(32).fill(park));
    assert.ok(validateTape(tape, tape.contract, tape.seed, tape.difficulty));
    const v2 = { ...tape, version: 2, runStart: runStart() };
    assert.ok(validateTape(v2, v2.contract, v2.seed, v2.difficulty));
    const eraTape = {
      ...v2,
      meta: { buildId: 'abcdef12', engineHash: 'a'.repeat(64), era: 3 },
      outcome: { reason: 'secured', secured: true, waves: 0, timeAlive: 0, gold: 0 },
    };
    assert.ok(validateTape(eraTape, eraTape.contract, eraTape.seed, eraTape.difficulty));
    assert.equal(validateTape({ ...eraTape, meta: { ...eraTape.meta, surprise: true } }, eraTape.contract, eraTape.seed, eraTape.difficulty), null);
    assert.equal(validateTape({ ...tape, runStart: runStart() }, tape.contract, tape.seed, tape.difficulty), null);
    assert.equal(validateTape({ ...v2, runStart: { ...v2.runStart, meta: {} } }, v2.contract, v2.seed, v2.difficulty), null);
    assert.equal(validateTape({ ...v2, runStart: { ...v2.runStart, research: { ...v2.runStart.research, version: 2 } } }, v2.contract, v2.seed, v2.difficulty), null);
    assert.equal(validateTape({ ...v2, runStart: undefined }, v2.contract, v2.seed, v2.difficulty), null);
    assert.equal(validateTape(fixture(Array(33).fill(park)), tape.contract, tape.seed, tape.difficulty), null);
    assert.equal(validateTape(fixture([{ verb: 'MOVE_HERO', pos: { x: Number.NaN, z: 12 } }]), tape.contract, tape.seed, tape.difficulty), null);
    const moving = fixture([park]);
    moving.inputLog.entries[0].mx = 1;
    assert.equal(validateTape(moving, tape.contract, tape.seed, tape.difficulty), null);

    const row = {
      secured: true, waves: 0, timeAlive: 0, gold: 0, baseValue: 0,
      profileName: 'Era Test', anonId: 'a'.repeat(32), difficulty: 'trail', seed: eraTape.seed, seedMode: 'live',
      seedHash: 'b'.repeat(64), inputLogHash: 'c'.repeat(64), submittedAt: 1, tape: eraTape, assay: 'pending',
    };
    const kv = { get: async (key) => key === 'standings:s2:epoch-1-frontier:the-claim' ? JSON.stringify([row]) : null, put: async () => undefined };
    const response = await onRequest({
      request: new Request(`http://localhost/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=${eraTape.id}`),
      env: { TELEMETRY: kv },
    });
    // F-2308-1 (s2308) is RETIRED here by EH-3/EH-3b — recorded, not erased. That veto stripped
    // `engineHash`/`era` from this projection because `validateTapeMeta` in `src/game/RunTape.ts`
    // is an exact-key allowlist over ['buildId'] and was reached DIRECTLY by the browser reader:
    // a projected `era` made `validateRunTape` return null and every node-produced WATCH reel
    // unplayable. EH-3 (s2374) interposed `validateAgentRunTape`, which pre-strips meta to
    // { buildId } before that allowlist and re-attaches the era identity afterwards — so the
    // measured harm is gone and the veto's own named follow-up (`engine-era-browser-stamp`) is
    // satisfied. The stored tape still keeps era (see the row above); the projection now carries
    // the PUBLIC era identity only.
    // This is a CONTRACT, not a mirror: it asserts the projection against the REAL browser reader
    // instead of restating the projection's own shape, so it reds if EITHER side moves alone —
    // which is precisely the failure the veto was protecting against.
    // Keep this projection contract paired with scripts/test-standings.mjs.
    const publicMeta = { buildId: 'abcdef12', engineHash: 'a'.repeat(64), era: 3 };
    const body = await response.json();
    assert.deepEqual(body.reel.meta, publicMeta);
    const { validateAgentRunTape } = await vite.ssrLoadModule('/src/ui/LanternShow.ts');
    const read = validateAgentRunTape(body.reel);
    assert.ok(read, 'the browser reader accepts the public WATCH projection');
    assert.deepEqual(read.meta, publicMeta, 'and it preserves the era identity the show checks');
    const bareMeta = { buildId: 'abcdef12' };
    assert.deepEqual(validateAgentRunTape({ ...body.reel, meta: { ...bareMeta, engineHash: 'a'.repeat(64) } })?.meta, bareMeta, 'browser reader keeps a half-stamped reel honestly unstamped');
    assert.deepEqual(validateAgentRunTape({ ...body.reel, meta: bareMeta })?.meta, bareMeta, 'browser reader accepts buildId-only reels');
  } finally {
    await vite.close();
  }

  // finally, not a trailing rmSync: a failed assertion below must still take the fixture with it.
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-agent-reels-'));
  try {
    const first = join(directory, 'first.json');
    const second = join(directory, 'second.json');
    const input = `${JSON.stringify([park])}\n${Array(20).fill('null').join('\n')}\n`;
    for (const [output, prefix] of [[first, `${JSON.stringify([{ verb: 'NOPE' }])}\n`], [second, '']]) {
      const run = spawnSync(process.execPath, [
        'scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--tape', output,
      ], { encoding: 'utf8', input: prefix + input, timeout: 30_000 });
      assert.equal(run.status, 0, run.stderr);
    }
    const firstTape = JSON.parse(readFileSync(first, 'utf8'));
    const secondTape = JSON.parse(readFileSync(second, 'utf8'));
    assert.notEqual(secondTape.id, firstTape.id);
    assert.match(firstTape.id, /^agent-[a-f0-9]{8}-[a-f0-9-]{36}$/);
    assert.equal(secondTape.inputLog.name, firstTape.inputLog.name);
    delete firstTape.id;
    delete secondTape.id;
    assert.deepEqual(secondTape, firstTape);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function runStart() {
  const meta = { version: 1, tracks: { territory: 1, science: 0, hero: 0, agent: 0 } };
  return {
    meta,
    research: {
      version: 1,
      epochId: 'epoch-1-frontier',
      metaScienceCursor: 0,
      progress: meta,
      taken: [],
      proposalSalt: 0,
      pinnedTarget: null,
      unlocks: {},
    },
  };
}

function fixture(orders) {
  return {
    version: 1,
    id: 'agent-reel-test',
    createdAt: 0,
    kept: true,
    contract: 'the-claim',
    seed: 'e1-the-claim-01',
    difficulty: 'trail',
    simVersion: 1,
    inputLog: {
      version: 1,
      name: 'agent-reel-test',
      contractId: 'the-claim',
      seed: 'e1-the-claim-01',
      difficultyPreset: 'trail',
      stepSeconds: 1 / 30,
      start: { x: 0, z: 12 },
      durationTicks: 2,
      entries: [{ t: 0, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders }] }],
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash: 'fnv1a32:00000000',
    outcome: { reason: 'death', secured: false, waves: 0, timeAlive: 0, gold: 0 },
  };
}
