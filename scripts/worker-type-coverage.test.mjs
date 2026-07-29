import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const SUBJECTS = [{ dir: 'functions', ext: '.ts', floor: 22 }];

function walk(dir, ext, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, ext, files);
    else if (entry.isFile() && entry.name.endsWith(ext)) files.push(path);
  }
  return files;
}

for (const subject of SUBJECTS) {
  test(`every ${subject.dir}/**/*${subject.ext} is type-checked`, () => {
    const files = walk(join(ROOT, subject.dir), subject.ext).sort();
    assert.ok(
      files.length >= subject.floor,
      `expected >=${subject.floor} ${subject.dir}/**/*${subject.ext}, walked ${files.length} — the walk or tree moved`,
    );
    const unchecked = files
      .filter((file) => file.endsWith('.d.ts') || readFileSync(file, 'utf8').includes('@ts-nocheck'))
      .map((file) => relative(ROOT, file));
    assert.deepEqual(unchecked, [], `worker files disabling semantic checks:\n  ${unchecked.join('\n  ')}`);

    const result = spawnSync(process.execPath, [TSC, '--noEmit', '--listFiles', '--project', join(ROOT, 'tsconfig.json')], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const checked = new Set(result.stdout.split(/\r?\n/).filter(Boolean).map((file) => resolve(file)));
    const missing = files.filter((file) => !checked.has(resolve(file))).map((file) => relative(ROOT, file));
    assert.deepEqual(missing, [], `worker files missing from tsc --listFiles:\n  ${missing.join('\n  ')}`);
  });
}
