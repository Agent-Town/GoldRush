import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { subjectFiles } from './lib/subject-tree.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const SUBJECTS = [{ dir: 'functions', ext: '.ts', floor: 22 }];

for (const subject of SUBJECTS) {
  test(`every ${subject.dir}/**/*${subject.ext} is type-checked`, () => {
    const files = subjectFiles(ROOT, subject).sort();
    const unchecked = files.flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      const reasons = ['@ts-nocheck', '@ts-ignore', '@ts-expect-error'].filter((directive) => source.includes(directive));
      if (file.endsWith('.d.ts')) reasons.unshift('.d.ts');
      return reasons.map((reason) => `${relative(ROOT, file)} (${reason})`);
    });
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
