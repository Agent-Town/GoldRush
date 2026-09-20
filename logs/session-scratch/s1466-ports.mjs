// s1466: is the gate port already held? (F: gate port 5188 is held by live lanes under strictPort —
// gating against a foreign listener measures ANOTHER TREE.) bash gate refuses lsof; node runs it.
import { execFileSync } from 'node:child_process';
for (const port of [5188, 5199, 5231, 5234]) {
  let out = '';
  try {
    out = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  } catch { out = ''; }
  const lines = out.trim().split('\n').filter(Boolean);
  console.log(`port ${port}: ${lines.length ? 'HELD' : 'free'}`);
  for (const l of lines.slice(0, 4)) console.log('   ', l);
}
