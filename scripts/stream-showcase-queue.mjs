import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rmdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
export const SHOWCASE_QUEUE = path.join(root, 'assets/stream/showcase-queue.json');
const GAZETTE_QUEUE = path.join(root, 'marketing/outbox/gazette-queue.md');

const emptyQueue = () => ({
  $schema: 'gold-rush/showcase-queue/v1',
  description: 'Entries stay in merge order; append new entries and only change shown/shownAt after a successful replay.',
  entries: [],
});

function formatQueue(queue) {
  const entries = queue.entries.map((entry) => `    ${JSON.stringify(entry)}`).join(',\n');
  return `{\n  "$schema": ${JSON.stringify(queue.$schema)},\n  "description": ${JSON.stringify(queue.description)},\n  "entries": [\n${entries}\n  ]\n}\n`;
}

async function atomicWrite(queue, queuePath) {
  await mkdir(path.dirname(queuePath), { recursive:true });
  const temporary = `${queuePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, formatQueue(queue));
  await rename(temporary, queuePath);
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withLock(lockPath, action, { timeoutMs = 5_000, staleMs = 30_000 } = {}) {
  const started = Date.now();
  while (true) {
    try {
      await mkdir(lockPath);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - (await stat(lockPath)).mtimeMs > staleMs) await rmdir(lockPath);
      } catch (lockError) {
        if (!['ENOENT', 'ENOTEMPTY'].includes(lockError.code)) throw lockError;
      }
      if (Date.now() - started >= timeoutMs) return false;
      await pause(25);
    }
  }
  try { return await action(); }
  finally { try { await rmdir(lockPath); } catch {} }
}

export async function readShowcaseQueue(queuePath = SHOWCASE_QUEUE) {
  try {
    const queue = JSON.parse(await readFile(queuePath, 'utf8'));
    if (queue.$schema !== 'gold-rush/showcase-queue/v1' || !Array.isArray(queue.entries)) throw new Error('Unsupported showcase queue schema.');
    return queue;
  } catch (error) {
    if (error.code === 'ENOENT') return emptyQueue();
    throw error;
  }
}

async function gazetteLineForHash(hash, gazettePath) {
  try {
    const blocks = (await readFile(gazettePath, 'utf8')).split(/\n(?=## )/);
    const block = blocks.find((value) => {
      const gazetteHash = value.match(/merge: `([0-9a-f]{7,40})`/i)?.[1]?.toLowerCase();
      return gazetteHash && (gazetteHash.startsWith(hash.toLowerCase()) || hash.toLowerCase().startsWith(gazetteHash));
    });
    return block?.match(/^## (.+)$/m)?.[1] || '';
  } catch (error) {
    if (error.code === 'ENOENT') return '';
    throw error;
  }
}

export async function appendShowcase({ slice, hash, spec, mergedAt = new Date().toISOString(), gazetteLine }, {
  queuePath = SHOWCASE_QUEUE,
  gazettePath = GAZETTE_QUEUE,
} = {}) {
  if (!slice?.trim() || !spec?.trim() || !/^[0-9a-f]{7,40}$/i.test(hash || '') || Number.isNaN(Date.parse(mergedAt))) {
    throw new Error('Expected: <slice> <7-40 character merge hash> <spec>');
  }
  const line = gazetteLine ?? await gazetteLineForHash(hash, gazettePath);
  if (!line.trim()) throw new Error(`No gazette line found for ${hash}. Write the gazette item first.`);
  return withLock(`${queuePath}.write-lock`, async () => {
    const queue = await readShowcaseQueue(queuePath);
    if (queue.entries.some((entry) => entry.hash.toLowerCase().startsWith(hash.toLowerCase()) || hash.toLowerCase().startsWith(entry.hash.toLowerCase()))) return false;
    queue.entries.push({
      slice: slice.trim(),
      hash: hash.toLowerCase(),
      spec: spec.trim(),
      gazetteLine: line.trim(),
      mergedAt,
      shown: false,
      shownAt: null,
    });
    await atomicWrite(queue, queuePath);
    return true;
  });
}

export async function markShowcaseShown(hash, { queuePath = SHOWCASE_QUEUE, shownAt = new Date().toISOString() } = {}) {
  return withLock(`${queuePath}.write-lock`, async () => {
    const queue = await readShowcaseQueue(queuePath);
    const entry = queue.entries.find((candidate) => candidate.hash.toLowerCase() === hash.toLowerCase());
    if (!entry || entry.shown) return false;
    entry.shown = true;
    entry.shownAt = shownAt;
    await atomicWrite(queue, queuePath);
    return true;
  });
}

export async function consumeNextShowcase(show, { queuePath = SHOWCASE_QUEUE, shownAt } = {}) {
  return withLock(`${queuePath}.consume-lock`, async () => {
    const entry = (await readShowcaseQueue(queuePath)).entries.find((candidate) => !candidate.shown);
    if (!entry || !await show(entry)) return false;
    return markShowcaseShown(entry.hash, { queuePath, shownAt });
  }, { timeoutMs:0, staleMs:15 * 60_000 });
}

export async function showcaseQueueStatus({ queuePath = SHOWCASE_QUEUE, now = Date.now() } = {}) {
  const pending = (await readShowcaseQueue(queuePath)).entries.filter((entry) => !entry.shown);
  return { depth:pending.length, oldestAgeMs:pending.length ? Math.max(0, now - Date.parse(pending[0].mergedAt)) : 0 };
}
