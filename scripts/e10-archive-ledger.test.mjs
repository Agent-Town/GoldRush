import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { readLedgerDiscovered } = await server.ssrLoadModule('/src/encyclopedia/state.ts');
  const { archiveLedgerEntries, archivePageByWing, loadArchiveLore } = await server.ssrLoadModule('/src/encyclopedia/archive.ts');
  const { TileStateStore, TILE_STATE_SCHEMA_VERSION } = await server.ssrLoadModule('/src/game/TileStateStore.ts');
  loadArchiveLore(readFileSync('lore/archive-world-pages.md', 'utf8'));
  const bytes = new Map();
  const storage = { getItem: key => bytes.get(key) ?? null, setItem: (key, value) => bytes.set(key, value), removeItem: key => bytes.delete(key) };
  const store = new TileStateStore(storage);
  const ids = Object.values(archivePageByWing);
  const visiblePages = () => ids.filter(id => readLedgerDiscovered(storage).has(id));
  assert.deepEqual(visiblePages(), []);
  const entry = wingId => ({ kind: 'sim', id: `archive-wing:${wingId}`, payload: { wingId }, schemaVersion: TILE_STATE_SCHEMA_VERSION });
  store.stageWrite('e10-archive-world', entry('west-stacks-wing'));
  assert.deepEqual(visiblePages(), [], 'uncommitted progress is not readable lore');
  store.commitAtRunEnd();
  assert.deepEqual(visiblePages(), ['archive_answered_doors']);
  assert.equal(readLedgerDiscovered(storage).has('era_deepsky'), true, 'earned page chapter must be reachable');
  store.stageWrite('e10-archive-world', entry('warning-shelf-wing'));
  store.commitAtRunEnd();
  assert.deepEqual(visiblePages(), ['archive_answered_doors'], 'a noncontiguous saved wing does not skip order');
  store.stageWrite('e10-archive-world', entry('east-stacks-wing'));
  store.commitAtRunEnd();
  assert.deepEqual(visiblePages(), ids);
  assert.equal(archiveLedgerEntries.length, 3);
  for (const page of archiveLedgerEntries) {
    assert.equal(page.hiddenUntilDiscovered, true);
    assert.ok(page.loreLine.length > 100);
    assert.ok(!page.loreLine.includes('PROPOSAL') && !page.loreLine.includes('<!--'), 'authoring metadata must stay outside player prose');
  }
  console.log('PASS: committed-only archive pages, ordered saved state, reachable chapter, authored lore text');
} finally { await server.close(); }
