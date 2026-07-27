import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { appendShowcase, consumeNextShowcase, readShowcaseQueue, showcaseQueueStatus } from './stream-showcase-queue.mjs';

test('append is hash-idempotent and keeps one JSON line per entry', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'showcase-queue-'));
  t.after(() => rm(dir, { recursive:true, force:true }));
  const queuePath = path.join(dir, 'queue.json');
  const gazettePath = path.join(dir, 'gazette.md');
  await writeFile(gazettePath, '## The Trestle Opens\n- A new crossing.\n- merge: `aaaaaaa` (trestle)\n');
  const entry = { slice:'trestle', hash:'aaaaaaa', spec:'e2-trestle.spec.ts', mergedAt:'2026-07-14T00:00:00.000Z' };
  assert.equal(await appendShowcase(entry, { queuePath, gazettePath }), true);
  assert.equal(await appendShowcase(entry, { queuePath, gazettePath }), false);
  assert.deepEqual((await readShowcaseQueue(queuePath)).entries[0], {
    ...entry, gazetteLine:'The Trestle Opens', shown:false, shownAt:null,
  });
  assert.equal((await readFile(queuePath, 'utf8')).split('\n').filter((line) => line.includes('"slice"')).length, 1);
});

test('downtime accumulates and catch-up shows oldest first without double-show', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'showcase-catchup-'));
  t.after(() => rm(dir, { recursive:true, force:true }));
  const queuePath = path.join(dir, 'queue.json');
  for (const [slice, hash, hour] of [['first','1111111','00'], ['second','2222222','01'], ['third','3333333','02']]) {
    await appendShowcase({ slice, hash, spec:`${slice}.spec.ts`, mergedAt:`2026-07-14T${hour}:00:00.000Z`, gazetteLine:slice }, { queuePath });
  }
  assert.deepEqual(await showcaseQueueStatus({ queuePath, now:Date.parse('2026-07-14T03:00:00.000Z') }), { depth:3, oldestAgeMs:10_800_000 });

  const shown = [];
  assert.equal(await consumeNextShowcase(async (entry) => { shown.push(entry.slice); return true; }, { queuePath, shownAt:'2026-07-14T03:01:00.000Z' }), true);
  assert.equal(await consumeNextShowcase(async (entry) => { shown.push(entry.slice); return false; }, { queuePath }), false);
  assert.equal(await consumeNextShowcase(async (entry) => { shown.push(entry.slice); return true; }, { queuePath, shownAt:'2026-07-14T03:02:00.000Z' }), true);
  assert.equal(await consumeNextShowcase(async (entry) => { shown.push(entry.slice); return true; }, { queuePath, shownAt:'2026-07-14T03:03:00.000Z' }), true);
  assert.equal(await consumeNextShowcase(async (entry) => { shown.push(entry.slice); return true; }, { queuePath }), false);
  assert.deepEqual(shown, ['first', 'second', 'second', 'third']);
  assert.equal((await showcaseQueueStatus({ queuePath })).depth, 0);
});

test('concurrent appenders preserve every entry and concurrent consumers show once', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'showcase-concurrency-'));
  t.after(() => rm(dir, { recursive:true, force:true }));
  const queuePath = path.join(dir, 'queue.json');
  await Promise.all(Array.from({ length:10 }, (_, index) => appendShowcase({
    slice:`slice-${index}`, hash:(index + 1).toString(16).padStart(7, '0'), spec:`slice-${index}.spec.ts`, gazetteLine:`slice ${index}`,
  }, { queuePath })));
  assert.equal((await readShowcaseQueue(queuePath)).entries.length, 10);

  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const show = async () => { calls++; await gate; return true; };
  const first = consumeNextShowcase(show, { queuePath });
  const second = consumeNextShowcase(show, { queuePath });
  release();
  // Exactly one consumer wins; WHICH one is a race this test does not control.
  // consumeNextShowcase takes the lock with timeoutMs:0, so the winner is decided by which
  // mkdir(2) lands first in the libuv threadpool — [false,true] is as correct as [true,false].
  // Pinning the order made this a contention flake (F-1154-5: 0/8 in isolation, 1 in 4 under
  // a full battery). The invariant worth asserting is show-once, which is what these two lines say.
  const outcomes = await Promise.all([first, second]);
  assert.deepEqual([...outcomes].sort(), [false, true], `exactly one consumer should win, got ${JSON.stringify(outcomes)}`);
  assert.equal(calls, 1);
});
