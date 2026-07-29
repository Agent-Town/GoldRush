import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { subjectFiles } from './lib/subject-tree.mjs';

const SUBJECT = { dir: 'fixture', ext: '.mjs', floor: 2 };

function withFixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'gold-rush-subject-tree-'));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('missing subject directory fires the actionable existence message', () => {
  withFixture((root) => {
    assert.throws(
      () => subjectFiles(root, SUBJECT),
      { message: 'fixture/ is missing — this guard names it as a subject; retire its row deliberately, do not let it pass by absence' },
    );
  });
});

test('subject below its floor reports expected and walked counts', () => {
  withFixture((root) => {
    mkdirSync(join(root, SUBJECT.dir));
    writeFileSync(join(root, SUBJECT.dir, 'one.mjs'), '');
    assert.throws(
      () => subjectFiles(root, SUBJECT),
      { message: 'expected >=2 fixture/**/*.mjs, walked 1 — the walk or the tree moved' },
    );
  });
});

test('subject exactly at its floor passes', () => {
  withFixture((root) => {
    mkdirSync(join(root, SUBJECT.dir, 'nested'), { recursive: true });
    writeFileSync(join(root, SUBJECT.dir, 'one.mjs'), '');
    writeFileSync(join(root, SUBJECT.dir, 'nested', 'two.mjs'), '');
    assert.equal(subjectFiles(root, SUBJECT).length, SUBJECT.floor);
  });
});

test('empty present subject fires the floor instead of passing silently', () => {
  withFixture((root) => {
    mkdirSync(join(root, SUBJECT.dir));
    assert.throws(
      () => subjectFiles(root, SUBJECT),
      { message: 'expected >=2 fixture/**/*.mjs, walked 0 — the walk or the tree moved' },
    );
  });
});
