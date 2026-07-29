import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function assertSubjectExists(root, subject) {
  let exists = true;
  try {
    statSync(join(root, subject.dir));
  } catch {
    exists = false;
  }
  assert.ok(exists, `${subject.dir}/ is missing — this guard names it as a subject; retire its row deliberately, do not let it pass by absence`);
}

export function walkSubject(root, subject, { ignoreReadErrors = false } = {}) {
  const files = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      if (!ignoreReadErrors) throw error;
      // ponytail: legacy script-tree behavior; remove this option if that guard
      // may change its unreadable-subtree verdict.
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') walk(full);
      } else if (entry.isFile() && entry.name.endsWith(subject.ext)) {
        files.push(full);
      }
    }
  }
  walk(join(root, subject.dir));
  return files;
}

export function assertSubjectFloor(files, subject) {
  assert.ok(
    files.length >= subject.floor,
    `expected >=${subject.floor} ${subject.dir}/**/*${subject.ext}, walked ${files.length} — the walk or the tree moved`,
  );
}

export function subjectFiles(root, subject, options) {
  assertSubjectExists(root, subject);
  const files = walkSubject(root, subject, options);
  assertSubjectFloor(files, subject);
  return files;
}
