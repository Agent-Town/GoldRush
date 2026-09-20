// s1056 retained probe (RETENTION LAW §4.10b) — measure the E1-only release build.
// WHY: OWNER'S DESK option (2) of F-1051-3 ("SHIP E1-ONLY, -205.6 MB") is a PROJECTION,
// derived by applying assert-release-build.mjs's rules to the all-epoch dist listing.
// This runs the real thing and reports the real byte count, the way s1051 measured option (1).
// F-1024-4: fires are permission-denied on env-prefixed commands, so the env is set here
// and the shipped command is spawned verbatim (the F-1048-3 working invocation pattern).
import { spawn } from 'node:child_process';

const env = { ...process.env, GR_RELEASE: 'e1' };
const started = Date.now();
const child = spawn('npm', ['run', 'build:release'], { env, cwd: process.cwd() });

let tail = [];
const keep = (buf) => {
  for (const line of buf.toString().split('\n')) {
    if (!line.trim()) continue;
    tail.push(line);
    if (tail.length > 60) tail.shift();
    if (/release-build|error|Error|ERROR|diet/.test(line)) console.log('| ' + line);
  }
};
child.stdout.on('data', keep);
child.stderr.on('data', keep);
child.on('close', (code) => {
  console.log('=== rc=' + code + '  wall=' + Math.round((Date.now() - started) / 1000) + 's');
  console.log('=== tail ===');
  console.log(tail.slice(-25).join('\n'));
});
