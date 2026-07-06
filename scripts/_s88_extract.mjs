import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const newFiles = [
  'reviews/m6-r3a-audit.md',
  'e2e/perf-02-fullbase-bench.spec.ts',
  'src/diagnostics/fullBaseBenchmark.ts',
];
for (const f of newFiles) {
  const content = execFileSync('git', ['show', `ccd084d:${f}`], { encoding: 'utf8', maxBuffer: 20e6 });
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
  console.log('wrote', f, content.length, 'bytes');
}
