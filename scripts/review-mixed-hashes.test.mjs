import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const location = new URL('http://review-mixed-hashes.test/');
globalThis.window = { location };
globalThis.location = location;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent',
  optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true, hmr: false } });
let LockstepClient;
try {
  ({ LockstepClient } = await vite.ssrLoadModule('/src/mp/LockstepClient.ts'));
} finally {
  await vite.close();
}

const browser = (playerId) => ({ playerId, name: playerId, town: 'Home', client: 'browser' });
const headless = (playerId) => ({ ...browser(playerId), client: 'headless' });
const good = 'fnv1a32:aaaaaaaa';
const bad = 'fnv1a32:bbbbbbbb';
const idle = { mx: 0, my: 0, confirm: false, upgrade: false, rotateBuild: false,
  weaponToggle: false, build: false, cancel: false, buildSlot: null, restart: false,
  pause: false, pauseTarget: null, debugSpawn: false, debugXp: false, queuedActions: [] };

function clientFor(t, roster, options = {}) {
  const client = new LockstepClient({ relayBase: 'http://fake', code: 'A'.repeat(24),
    player: { name: 'p2', town: 'Home' }, ...options });
  client.handle({ type: 'joined', playerId: 'p2', roster, reconnectToken: 'B'.repeat(32) });
  t.after(() => client.dispose());
  return client;
}

function hash(client, from, value = good, tick = 30) {
  client.handle({ type: 'hash', from, tick, hash: value });
}

function assertDesync(client, count) {
  assert.equal(client.state().desyncs, count);
  assert.equal(client.state().paused, count > 0);
}

for (const [label, roster] of [
  ['browser-only', [browser('p1'), browser('p2')]],
  ['mixed', [browser('p1'), browser('p2'), headless('p3')]],
  ['headless-only', [headless('p1'), headless('p2')]],
]) {
  for (const remoteFirst of [false, true]) {
    for (const value of [good, bad]) {
      test(`${label}: ${value === good ? 'matching' : 'mismatching'} peer, remote ${remoteFirst ? 'before' : 'after'} local`, (t) => {
        const client = clientFor(t, roster);
        if (remoteFirst) hash(client, 'p1', value);
        assertDesync(client, 0);
        client.afterSimTick(30, good, null);
        if (!remoteFirst) hash(client, 'p1', value);
        assertDesync(client, value === good ? 0 : 1);
      });
    }
  }
}

test('a thin seat, unknown ID, or self hash cannot satisfy or poison the browser quorum', (t) => {
  const client = clientFor(t, [browser('p1'), browser('p2'), browser('p3'), headless('p4')]);
  for (const from of ['p4', 'unknown', 'p2']) hash(client, from, bad);
  client.afterSimTick(30, good, null);
  hash(client, 'p1');
  assertDesync(client, 0);
  hash(client, 'p3');
  assertDesync(client, 0);
  client.afterSimTick(60, good, null);
  hash(client, 'p1', good, 60);
  hash(client, 'p3', bad, 60);
  assertDesync(client, 1);
});

test('one browser with thin seats ignores their incompatible hashes', (t) => {
  const client = clientFor(t, [browser('p2'), headless('p1'), headless('p3'), headless('p4')]);
  client.afterSimTick(30, good, null);
  for (const from of ['p1', 'p3', 'p4']) hash(client, from, bad);
  assertDesync(client, 0);
});

test('headless-only rooms require each headless peer', (t) => {
  const client = clientFor(t, [headless('p1'), headless('p2'), headless('p3')]);
  client.afterSimTick(30, good, null);
  hash(client, 'unknown', bad);
  hash(client, 'p1');
  assertDesync(client, 0);
  hash(client, 'p3', bad);
  assertDesync(client, 1);
});

test('thin seats keep hash exchange disabled', (t) => {
  const client = clientFor(t, [browser('p1'), headless('p2')], { exchangeHashes: () => false });
  assert.equal(client.shouldExchangeHash(30), false);
  client.afterSimTick(30, bad, null);
  hash(client, 'p1');
  assert.deepEqual(client.state().hashes, []);
  assertDesync(client, 0);
});

function consume(client, tick, roster) {
  client.handle({ type: 'tick-inputs', tick, roster,
    inputs: roster.map(({ playerId }) => ({ playerId, input: { mx: 0, my: 0, actions: [] } })) });
  assert.equal(client.pump(idle)?.tick, tick);
}

test('an outstanding comparison keeps the roster of its sampled tick after a peer leaves', (t) => {
  const roster = [browser('p1'), browser('p2'), browser('p3'), headless('p4')];
  const client = clientFor(t, roster);
  consume(client, 0, roster);
  client.afterSimTick(0, good, null);
  hash(client, 'p1', good, 0);
  consume(client, 1, roster.filter(({ playerId }) => playerId !== 'p3'));
  hash(client, 'p4', bad, 0);
  assertDesync(client, 0);
  hash(client, 'p3', bad, 0);
  assertDesync(client, 1);
});

test('later ticks use the smaller roster and ignore a departed peer', (t) => {
  const roster = [browser('p1'), browser('p2'), browser('p3'), headless('p4')];
  const client = clientFor(t, roster, { hashEveryTicks: 1 });
  consume(client, 0, roster);
  consume(client, 1, roster.filter(({ playerId }) => playerId !== 'p3'));
  hash(client, 'p3', bad, 1);
  client.afterSimTick(1, good, null);
  hash(client, 'p1', good, 1);
  assertDesync(client, 0);
  client.afterSimTick(2, good, null);
  hash(client, 'p1', bad, 2);
  assertDesync(client, 1);
});

test('snapshot compression keeps the sampled quorum even when the roster changes before encoding finishes', async (t) => {
  const roster = [browser('p2'), browser('p1'), browser('p3'), headless('p4')];
  const client = clientFor(t, roster);
  consume(client, 0, roster);
  client.afterSimTick(0, good, { padding: 'x'.repeat(200 * 1024) });
  assert.deepEqual(client.state().hashes, [], 'large snapshots must exercise asynchronous encoding');
  consume(client, 1, roster.filter(({ playerId }) => playerId !== 'p3'));
  hash(client, 'p1', good, 0);
  hash(client, 'p4', bad, 0);
  await client.snapshotSendQueue;
  assert.deepEqual(client.state().hashes, [{ tick: 0, hash: good }]);
  assertDesync(client, 0);
  hash(client, 'p3', bad, 0);
  assertDesync(client, 1);
});
