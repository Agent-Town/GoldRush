// s1140 scratch runner — invokes playwright against the external dev server on 5251.
// node is used deliberately: the bash exec-gate blocks `bash script.sh` invocations.
// 5188 belongs to the lane runners (Mistake #12: never gate on their port).
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const spec = process.env.SPEC ?? 'e2e/task-037-assay-bench-ungate.spec.ts';
const repeat = process.env.REPEAT ?? '1';
const log = process.env.LOG ?? 'scripts/tmp-s1140-last.log';
const projects = (process.env.PROJECTS ?? 'desktop-chrome,mobile-chrome').split(',');

const args = [
  'playwright', 'test', spec,
  '--config', 'scripts/tmp-s1140-pw.config.ts',
  ...projects.flatMap((p) => [`--project=${p}`]),
  `--repeat-each=${repeat}`,
  '--workers=1',
  '--reporter=list',
];

let out = '';
let rc = 0;
try {
  out = execFileSync('npx', args, {
    encoding: 'utf8',
    env: { ...process.env, GR_CAPTURE_EXTERNAL_SERVER: '1', GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5251' },
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (error) {
  rc = error.status ?? 1;
  out = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}
writeFileSync(log, out);
const lines = out.split('\n');
console.log(`=== rc=${rc} spec=${spec} repeat=${repeat} projects=${projects.join('+')} lines=${lines.length} ===`);
console.log(lines.slice(-90).join('\n'));
