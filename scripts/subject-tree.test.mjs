import assert from 'node:assert/strict';
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { subjectFiles, walkSubject } from './lib/subject-tree.mjs';

const SUBJECT = { dir: 'fixture', ext: '.mjs', floor: 2 };

function withFixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'gold-rush-subject-tree-'));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withUnreadableFixture(t, run) {
  const root = mkdtempSync(join(tmpdir(), 'gold-rush-subject-tree-'));
  const subjectDir = join(root, SUBJECT.dir);
  const lockedDir = join(subjectDir, 'locked');
  try {
    mkdirSync(lockedDir, { recursive: true });
    writeFileSync(join(subjectDir, 'one.mjs'), '');
    writeFileSync(join(subjectDir, 'two.mjs'), '');
    writeFileSync(join(lockedDir, 'hidden.mjs'), '');
    chmodSync(lockedDir, 0o000);
    try {
      readdirSync(lockedDir);
      t.skip('chmod 0o000 did not produce EACCES; unreadable-branch proof is unavailable on this platform');
      return;
    } catch (error) {
      if (error?.code !== 'EACCES') throw error;
    }
    run(root, lockedDir);
  } finally {
    try {
      chmodSync(lockedDir, 0o755);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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

test('ignoreReadErrors returns only readable paths', (t) => {
  withUnreadableFixture(t, (root, lockedDir) => {
    const files = subjectFiles(root, SUBJECT, { ignoreReadErrors: true });
    assert.deepEqual(
      [...files].sort(),
      [join(root, SUBJECT.dir, 'one.mjs'), join(root, SUBJECT.dir, 'two.mjs')].sort(),
    );
    assert.ok(!files.includes(join(lockedDir, 'hidden.mjs')));
  });
});

test('default walk fails closed on an unreadable subtree', (t) => {
  withUnreadableFixture(t, (root) => {
    assert.throws(
      () => walkSubject(root, SUBJECT),
      { code: 'EACCES' },
    );
  });
});

test('floor catches files hidden by an ignored read error', (t) => {
  withUnreadableFixture(t, (root) => {
    assert.throws(
      () => subjectFiles(root, { ...SUBJECT, floor: 3 }, { ignoreReadErrors: true }),
      { message: 'expected >=3 fixture/**/*.mjs, walked 2 — the walk or the tree moved' },
    );
  });
});
