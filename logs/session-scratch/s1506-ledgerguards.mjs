import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const script = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts['test:ledger-guards'];
const segments = script.split(' && ');
let bad = 0;
for (const seg of segments) {
  const parts = seg.trim().split(' ');
  let cmd = parts[0], args = parts.slice(1);
  if (cmd === 'npm') {
    const name = args[args.length - 1];
    const inner = JSON.parse(fs.readFileSync('package.json', 'utf8')).scripts[name];
    if (!inner) { console.log('SKIP (unresolved npm script):', seg); continue; }
    const ip = inner.trim().split(' ');
    cmd = ip[0]; args = ip.slice(1);
  }
  try {
    const out = execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const tail = out.trim().split('\n').filter((l) => /^(# )?(ℹ )?(pass|fail|tests)|PASS|OK|✅|green/i.test(l)).slice(-3).join(' | ');
    console.log('rc=0  ', parts.slice(0, 3).join(' ').slice(0, 70), tail ? ' :: ' + tail.slice(0, 160) : '');
  } catch (e) {
    bad++;
    console.log('RC=' + e.status + ' ', seg.slice(0, 90));
    console.log(((e.stdout || '') + (e.stderr || '')).split('\n').slice(-25).join('\n'));
  }
}
console.log(bad === 0 ? '\n=== LEDGER GUARDS: ALL GREEN ===' : `\n=== LEDGER GUARDS: ${bad} SEGMENT(S) RED ===`);
