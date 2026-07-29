import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

const contract = JSON.parse(readFileSync(new URL('../assets/layer-contracts/characters.v2.json', import.meta.url), 'utf8'));
const processed = new Set(readdirSync(new URL('../assets/processed/', import.meta.url)));
const directionBlocks = (slot) => Object.entries(slot).filter(([, block]) => block?.directions);
const gridFiles = (grid) => {
  if (grid.order) return grid.order;
  const base = (grid.file ?? '').replace(/\.png$/i, '');
  return Array.from({ length: Math.max(1, grid.rows ?? 1) }, (_, row) =>
    Array.from({ length: Math.max(1, grid.cols ?? 1) }, (_, col) => `${base}-r${row}c${col}.png`),
  ).flat();
};
const directionFiles = (block, direction, source) => {
  if (source.frames) return source.frames.files ?? (source.frames.grid ? gridFiles(source.frames.grid) : []);
  if (!block.grid?.file) return [];
  const row = source.row ?? (block.grid.rowDirections ?? []).findIndex((candidate) => candidate.toLowerCase() === direction);
  if (row < 0) return [];
  const base = block.grid.file.replace(/\.png$/i, '');
  return Array.from({ length: Math.max(1, block.frameCount ?? block.grid.cols ?? 1) }, (_, col) => `${base}-r${row}c${col}.png`);
};

test('contract direction files exist under assets/processed', () => {
  assert.deepEqual(directionFiles({}, 's', { frames: { grid: { file: 'atlas.png', cols: 2, rows: 1 } } }), ['atlas-r0c0.png', 'atlas-r0c1.png']);
  assert.deepEqual(directionFiles({ grid: { file: 'sheet.png', cols: 2, rowDirections: ['s'] } }, 's', {}), ['sheet-r0c0.png', 'sheet-r0c1.png']);
  for (const slot of contract.slots) {
    for (const [blockName, block] of directionBlocks(slot)) {
      for (const [direction, source] of Object.entries(block.directions)) {
        for (const file of directionFiles(block, direction, source)) {
          assert.ok(processed.has(file), `${slot.slot}.${blockName}.${direction} references missing processed cell ${file}`);
        }
      }
    }
  }
});

test('contract direction aliases do not overwrite explicit directions', () => {
  for (const slot of contract.slots) {
    for (const [blockName, block] of directionBlocks(slot)) {
      const explicit = new Set(Object.keys(block.directions).map((direction) => direction.toLowerCase()));
      const overlap = Object.keys(block.aliases ?? {}).filter((direction) =>
        explicit.has(direction.toLowerCase())
        && !(slot.slot === 'char.hero' && slot.rotations?.directions?.[direction.toLowerCase()]),
      );
      assert.deepEqual(overlap, [], `${slot.slot}.${blockName} aliases overwrite explicit directions`);
    }
  }
});
