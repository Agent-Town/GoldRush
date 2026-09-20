// s1200 — the decisive drain check for the run-tree-invariance slice, on the REAL raw.
//
// s1199's own prototype produced output that was byte-identical across roots AND WRONG
// (zero bodies resolved). A cross-root identity check alone would certify that no-op as
// success. So this probe asserts BOTH halves: identity across two unrelated script roots,
// AND that the report still carries real measured content (percentage cells, ranked rows).
// Committed per the RETENTION LAW.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const REPO = process.cwd();
const RAW = '/tmp/s1200-raw.json';
const SUBJECT = path.join(REPO, 'scripts/suite-red-inventory.mjs');

if (!fs.existsSync(RAW)) {
  console.log('extracting the 171 MB raw from archive/suite-red-inventory-raw-171mb ...');
  const out = fs.openSync(RAW, 'w');
  execFileSync('git', ['show', 'archive/suite-red-inventory-raw-171mb:logs/suite-red-inventory-raw.json'],
    { stdio: ['ignore', out, 'inherit'], maxBuffer: 1024 * 1024 * 1024 });
  fs.closeSync(out);
}
console.log(`raw: ${fs.statSync(RAW).size} B`);

// Two unrelated roots, each holding a byte-identical copy of the MERGED subject.
const base = fs.mkdtempSync(path.join(os.tmpdir(), 's1200-roots-'));
const roots = ['alpha', path.join('beta', 'deeper')].map((name) => {
  const root = path.join(base, name);
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.copyFileSync(SUBJECT, path.join(root, 'scripts', 'suite-red-inventory.mjs'));
  fs.symlinkSync(path.join(REPO, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  return root;
});

const outputs = roots.map((root, i) => {
  const out = path.join(base, `out-${i}.md`);
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'suite-red-inventory.mjs'), RAW, out],
    { cwd: root, encoding: 'utf8', timeout: 600_000, maxBuffer: 1024 * 1024 * 256 });
  if (r.status !== 0) throw new Error(`root ${i} exited ${r.status}: ${r.stderr?.slice(0, 800)}`);
  return out;
});

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const [a, b] = outputs;
const sizeA = fs.statSync(a).size, sizeB = fs.statSync(b).size;
console.log(`\nroot A: ${sizeA} B  sha ${sha(a).slice(0, 12)}`);
console.log(`root B: ${sizeB} B  sha ${sha(b).slice(0, 12)}`);
console.log(`IDENTICAL: ${fs.readFileSync(a).equals(fs.readFileSync(b))}`);

// --- the anti-no-op half ---
const md = fs.readFileSync(a, 'utf8');
const pct = (md.match(/\(\d+\.\d+%\)/g) ?? []).length;
const unavailable = (md.match(/body unavailable/g) ?? []).length;
const absPrefix = (md.match(/worktrees\/lane-d\//g) ?? []).length;
const runTree = md.match(/^- Run tree: .*$/m)?.[0] ?? '(no Run tree line!)';
const masking = md.match(/## Masking candidates[\s\S]*?## Crashes and timeouts/)?.[0] ?? '';
const ranked = (masking.match(/^\| \d+ \| /gm) ?? []).length;
const unranked = (masking.match(/^\| — \| /gm) ?? []).length;

console.log(`\n${runTree}`);
console.log(`percentage cells: ${pct}   body-unavailable cells: ${unavailable}`);
console.log(`masking rows ranked: ${ranked}   marked unresolved: ${unranked}`);
console.log(`absolute 'worktrees/lane-d/' prefixes leaked: ${absPrefix}`);
console.log(`\nANTI-NO-OP: ${pct > 0 && ranked > 0 ? 'PASS — real measured content survives' : 'FAIL — byte-identical but empty'}`);
