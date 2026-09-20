import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const REPO = '/private/tmp/heat11-5e7a7c0b';
const p = spawn('node', [`${REPO}/scripts/gr-sim.mjs`,
  '--contract', 'e3-blackout-ridge', '--seed', 'e3-blackout-ridge-01',
  '--difficulty', 'trail', '--policy=idle',
  '--tape', `${REPO}/artifacts/heat11/opus/e3-blackout-ridge/probe-idle.json`], { cwd: REPO });

let out = '', err = '';
p.stdout.on('data', d => { out += d; });
p.stderr.on('data', d => { err += d; });
p.on('close', (code) => {
  const dir = `${REPO}/artifacts/heat11/opus/e3-blackout-ridge`;
  writeFileSync(`${dir}/probe-idle.out`, out);
  writeFileSync(`${dir}/probe-idle.err`, err);
  const lines = out.trim().split('\n');
  console.log('rc', code, 'lines', lines.length);
  console.log('OUTCOME:', lines[lines.length - 1].slice(0, 900));
  // first view: dump structure
  try {
    const v = JSON.parse(lines[0]);
    console.log('NOW KEYS:', Object.keys(v.now).join(' '));
    console.log('STABLE KEYS:', Object.keys(v.stablePrefix).join(' '));
    writeFileSync(`${dir}/first-view.json`, JSON.stringify(v, null, 1));
  } catch (e) { console.log('view parse fail', e.message); }
});
