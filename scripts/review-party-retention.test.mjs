import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import rotationSeeds from '../assets/rotations/rotation-seeds.json' with { type: 'json' };

const KEY = 'standings:s2:epoch-1-frontier:the-claim';
const ARCHIVE_KEY = 'standings:epoch-1-frontier:the-claim';
const BOARD = '/api/standings?contract=the-claim&epoch=epoch-1-frontier';
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const originalNow = Date.now;
try {
  const { onRequest, validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
  const rotation = rotationSeeds.rotations[0];
  Date.now = () => Date.parse(rotation.opensAt) + 1;
  let serial = 0;

  function row(waves, partySize = 1, rotationRow = false) {
    const index = serial++;
    const id = `party-retention-${index}`;
    const seed = rotationRow ? rotation.seeds['the-claim'] : 'gold-rush';
    const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
    const tape = {
      version: 2, id, createdAt: 1, kept: true, contract: 'the-claim', seed, difficulty: 'trail', simVersion: 1,
      inputLog: {
        version: 1, name: id, contractId: 'the-claim', seed, difficultyPreset: 'trail', stepSeconds: 1 / 30,
        start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0,
        streams: Array.from({ length: partySize - 1 }, (_, slot) => ({ slot: slot + 1, start: { x: 0, z: 13 + slot }, entries: [] })),
      },
      eventLogHash: 'fnv1a32:1234abcd', outcome: { reason: 'secured', secured: true, waves, timeAlive: 120, gold: 40 },
      meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
      runStart: { meta, research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null } },
    };
    assert.ok(validateTape(tape, 'the-claim', seed, 'trail', true), 'fixture tape passes the production validator');
    return {
      secured: true, waves, timeAlive: 120, gold: 40, baseValue: 60,
      profileName: `Party ${partySize}`, anonId: index.toString(16).padStart(32, '0'), difficulty: 'trail',
      seed, seedMode: rotationRow ? 'bench' : 'live', seedHash: createHash('sha256').update(seed).digest('hex'),
      inputLogHash: createHash('sha256').update(JSON.stringify(tape.inputLog)).digest('hex'),
      submittedAt: index + 1, tape, assay: 'verified', assayedAt: index + 1, assayHash: tape.eventLogHash,
      ...(partySize > 1 ? { party: { riderCount: partySize, riders: Array.from({ length: partySize }, (_, i) => ({ name: `Rider ${i}` })) } } : {}),
      ...(rotationRow ? { rotationId: rotation.id } : {}),
    };
  }

  function store(rows) {
    const values = new Map([[KEY, JSON.stringify(rows)], [ARCHIVE_KEY, JSON.stringify(rows)]]);
    return {
      async get(key) { return values.get(key) ?? null; },
      async put(key, value) { values.set(key, value); },
      async delete(key) { values.delete(key); },
    };
  }

  async function call(kv, path, posted) {
    const response = await onRequest({ env: { TELEMETRY: kv }, request: new Request(`http://localhost${path}`, {
      method: posted ? 'POST' : 'GET', headers: { 'content-type': 'application/json' },
      ...(posted ? { body: JSON.stringify(posted) } : {}),
    }) });
    assert.equal(response.status, 200, `${posted ? 'POST' : 'GET'} ${path}`);
    return response.json();
  }

  async function submit(kv, candidate) {
    const { secured, waves, timeAlive, gold, baseValue, profileName, anonId, difficulty, seed, seedMode, seedHash, inputLogHash, tape, party } = candidate;
    const response = await call(kv, '/api/standings', {
      contractId: 'the-claim', epochId: 'epoch-1-frontier', score: { secured, waves, timeAlive, gold, baseValue },
      profileName, anonId, difficulty, seed, seedMode, seedHash, inputLogHash, tape, ...(party ? { party } : {}),
    });
    assert.equal(response.stored, true, 'new submission remains on the shelf');
  }

  for (const partySize of [2, 3, 4, 1]) {
    const trafficParty = partySize === 1 ? 2 : 1;
    const champion = row(1, partySize);
    const traffic = Array.from({ length: 199 }, (_, i) => row(i < 100 ? 20 : 10, trafficParty));
    const kv = store([champion, ...traffic]);
    const archive = await kv.get(ARCHIVE_KEY);
    const boardPath = `${BOARD}${partySize === 1 ? '' : `&party=${partySize}`}`;
    const before = await call(kv, boardPath);
    assert.equal(before.board.length, 1);
    assert.equal(before.board[0].rank, 1);

    // The first POST crossed the old shared 200-row bound and deleted the other party's champion.
    await submit(kv, row(10, trafficParty));
    assert.deepEqual((await call(kv, boardPath)).board, before.board, `party ${partySize} keeps its champion`);
    assert.equal((await call(kv, `${BOARD}&reel=${champion.tape.id}`)).reel.id, champion.tape.id);

    // A second POST crosses the traffic party's own bound; its oldest leftover alone is evicted.
    await submit(kv, row(10, trafficParty));
    const stored = JSON.parse(await kv.get(KEY));
    assert.equal(stored.length, 201);
    assert.equal(stored.filter((entry) => (entry.party?.riderCount ?? 1) === trafficParty).length, 200);
    assert.ok(stored.some((entry) => entry.tape.id === champion.tape.id));
    assert.ok(!stored.some((entry) => entry.tape.id === traffic[100].tape.id));
    assert.equal((await call(kv, `${BOARD}&party=${trafficParty === 1 ? 'solo' : trafficParty}`)).board.length, 100);
    assert.deepEqual((await call(kv, `${boardPath}&season=1`)).board, before.board, 'archived party board stays readable');
    assert.equal((await call(kv, `${BOARD}&reel=${champion.tape.id}&season=1`)).reel.id, champion.tape.id);
    assert.equal(await kv.get(ARCHIVE_KEY), archive, 'current-season submissions leave archive bytes unchanged');
    if (partySize === 1) {
      assert.deepEqual((await call(kv, `${BOARD}&party=solo`)).board, before.board, 'omitted legacy party metadata means solo');
    }
  }

  for (const rotationTraffic of [false, true]) {
    const champion = row(1, 1, !rotationTraffic);
    const kv = store([champion, ...Array.from({ length: 199 }, (_, i) => row(i < 100 ? 20 : 10, 1, rotationTraffic))]);
    await submit(kv, row(10, 1, rotationTraffic));
    await submit(kv, row(10, 1, rotationTraffic));
    const stored = JSON.parse(await kv.get(KEY));
    assert.equal(stored.length, 201, 'public and rotation retention remain independent');
    assert.ok(stored.some((entry) => entry.tape.id === champion.tape.id));
    assert.equal((await call(kv, `${BOARD}&reel=${champion.tape.id}`)).reel.id, champion.tape.id);
  }
  console.log('party retention checks passed (party sizes 1–4, top-100/leftover bounds, replay survival, archives, rotations)');
} finally {
  Date.now = originalNow;
  await vite.close();
}
