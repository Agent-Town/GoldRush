// s1516 pricing probe for F-1510-3: does a USER-DECLARED playwright config.metadata
// survive into the JSON report alongside Playwright's own injected actualWorkers?
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const DIR = '/tmp/s1516-pw-probe';
const REPO = '/Users/robin/Claude/Projects/Gold Rush';

try { fs.unlinkSync(`${DIR}/node_modules`); } catch {}
fs.symlinkSync(`${REPO}/node_modules`, `${DIR}/node_modules`, 'dir');

const r = spawnSync(
  `${REPO}/node_modules/.bin/playwright`,
  ['test', '--config', `${DIR}/s1516-probe.config.ts`, '--workers=1'],
  { cwd: DIR, encoding: 'utf8' },
);
console.log('rc =', r.status);
console.log((r.stdout || '').split('\n').slice(-6).join('\n'));
if (r.stderr) console.log('STDERR:', r.stderr.split('\n').slice(-6).join('\n'));

const out = JSON.parse(fs.readFileSync(`${DIR}/out.json`, 'utf8'));
console.log('--- config.metadata as serialized by the json reporter ---');
console.log(JSON.stringify(out.config.metadata, null, 2));
console.log('configFile:', out.config.configFile);
