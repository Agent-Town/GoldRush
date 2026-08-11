// Closes the F-1655-1 BACKLOG gate EXACTLY as written: "a scratch re-reduce of
// logs/suite-red-inventory-compact.json over a copy of the live report still shows all ten
// non-generated headings, the literal F-1587-1, and the corrections table header."
// Runs against the REAL 2.36 MB snapshot input, in /tmp. The live report is never written.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const LIVE = path.join(REPO, 'logs/suite-red-inventory.md');
const INPUT = path.join(REPO, 'logs/suite-red-inventory-compact.json');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's1656-gate-'));
const root = path.join(dir, 'root');
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
fs.copyFileSync(path.join(REPO, 'scripts/suite-red-inventory.mjs'), path.join(root, 'scripts/suite-red-inventory.mjs'));
fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
fs.mkdirSync(path.join(root, 'e2e'));

const liveText = fs.readFileSync(LIVE, 'utf8');
const out = path.join(root, 'report.md');
fs.writeFileSync(out, liveText); // a COPY of the live report as the existing output

const res = spawnSync(process.execPath, [path.join(root, 'scripts/suite-red-inventory.mjs'), INPUT, out], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
console.log('rc =', res.status);
if (res.stdout.trim()) console.log('stdout:', res.stdout.trim());
if (res.stderr.trim()) console.log('stderr:', res.stderr.trim().split('\n').slice(0, 3).join('\n'));

const after = fs.readFileSync(out, 'utf8');

// the ten non-generated headings, derived from the live file against a fresh run
const freshOut = path.join(root, 'fresh.md');
spawnSync(process.execPath, [path.join(root, 'scripts/suite-red-inventory.mjs'), INPUT, freshOut], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const generated = new Set((fs.readFileSync(freshOut, 'utf8').match(/^## [^\r\n]*/gm) || []));
const m = [...liveText.matchAll(/^## [^\r\n]*/gm)];
const hand = m.map((x, i) => ({ heading: x[0], text: liveText.slice(x.index, m[i + 1]?.index ?? liveText.length) }))
  .filter((s) => !generated.has(s.heading));

const headingsPresent = hand.filter((s) => after.includes(s.heading));
console.log('');
console.log('GATE CLAUSE 1 — all ten non-generated headings:', `${headingsPresent.length}/${hand.length}`);
for (const s of hand) console.log(`   ${after.includes(s.heading) ? 'OK  ' : 'LOST'} ${s.heading.slice(0, 72)}`);
console.log('GATE CLAUSE 2 — literal F-1587-1 present:', after.includes('F-1587-1'), `(${after.split('F-1587-1').length - 1} occurrence(s))`);
const TABLE = '| Spec file | Test title | Measured | Finding | Correction |';
console.log('GATE CLAUSE 3 — corrections table header present:', after.includes(TABLE));
console.log('');
console.log('bonus — sections byte-for-byte identical:', hand.filter((s) => after.includes(s.text)).length + '/' + hand.length);
console.log('result size:', after.split('\n').length, 'lines (live was', liveText.split('\n').length + ')');
console.log('live report on disk UNTOUCHED:', fs.readFileSync(LIVE, 'utf8') === liveText);

const pass = res.status === 0 && headingsPresent.length === hand.length && after.includes('F-1587-1') && after.includes(TABLE);
console.log('');
console.log('GATE:', pass ? 'CLOSED — all three clauses satisfied' : 'NOT CLOSED');
process.exit(pass ? 0 : 1);
