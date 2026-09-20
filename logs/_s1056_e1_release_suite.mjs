// s1056 retained probe (RETENTION LAW §4.10b) — does the E1-only release build actually PLAY?
// The byte count says option (2) is deployable; this asks whether it is shippable.
// npm run test:release => playwright --config playwright.release.config.ts, whose webServer
// rebuilds with GR_RELEASE=e1 and previews on 5190. Unprefixed, so a fire may invoke it.
import { spawn } from 'node:child_process';

const started = Date.now();
const child = spawn('npm', ['run', 'test:release'], { cwd: process.cwd(), env: { ...process.env } });
let tail = [];
const keep = (buf) => {
  for (const line of buf.toString().split('\n')) {
    if (!line.trim()) continue;
    tail.push(line);
    if (tail.length > 80) tail.shift();
  }
};
child.stdout.on('data', keep);
child.stderr.on('data', keep);
child.on('close', (code) => {
  console.log('=== rc=' + code + '  wall=' + Math.round((Date.now() - started) / 1000) + 's');
  console.log(tail.slice(-30).join('\n'));
});
