// s1324: run test:node-guards with the file list DERIVED from package.json, never retyped.
// s1323 measured that hand-retyping silently moves the denominator (209 -> 208).
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const script = JSON.parse(readFileSync('package.json', 'utf8')).scripts['test:node-guards'];
const files = script.split('&&')[0].trim().replace(/^node --test\s*/, '').trim().split(/\s+/);
console.log(`derived ${files.length} files from package.json`);

const r = spawnSync('node', ['--test', '--test-reporter=tap', ...files], {
  encoding: 'utf8',
  maxBuffer: 128 * 1024 * 1024,
});
const out = `${r.stdout ?? ''}\n${r.stderr ?? ''}`;
const summary = out.split(/\r?\n/).filter((l) => /^# (tests|pass|fail|cancelled|skipped)/.test(l));
const fails = out.split(/\r?\n/).filter((l) => /^not ok /.test(l));
console.log(summary.join('\n'));
if (fails.length) console.log('FAILING:\n' + fails.join('\n'));
console.log(`--- exit ${r.status} ---`);
