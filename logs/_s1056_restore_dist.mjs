// s1056 — restore dist/ to the all-epoch build this fire found it in.
// WHY: measuring the E1 release build rewrote dist/. Leaving it would hand the next fire an
// E1-shaped dist to measure and misattribute — the F-1054-1/F-1055-1 stale-belief shape.
// deploy.sh rebuilds anyway, but the tree is left as found rather than relying on that.
import { spawn } from 'node:child_process';
const started = Date.now();
const env = { ...process.env };
delete env.GR_RELEASE;
const child = spawn('npm', ['run', 'build'], { cwd: process.cwd(), env });
let tail = [];
const keep = (b) => { for (const l of b.toString().split('\n')) { if (l.trim()) { tail.push(l); if (tail.length > 40) tail.shift(); } } };
child.stdout.on('data', keep); child.stderr.on('data', keep);
child.on('close', (c) => {
  console.log('=== rc=' + c + ' wall=' + Math.round((Date.now() - started) / 1000) + 's');
  console.log(tail.slice(-6).join('\n'));
});
