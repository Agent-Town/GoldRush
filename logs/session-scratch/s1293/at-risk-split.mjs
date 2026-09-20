// Split the art-staging AT RISK bucket into "high-value, small" vs "bulk intermediate".
// The RETENTION LAW forbids deleting untracked factory history, but 566 MB of regenerable
// intermediate frames is an owner-scale cost decision. The two are not the same duty.
import { execFileSync } from 'node:child_process';

const raw = execFileSync('node', ['scripts/art-staging-audit.mjs', '--json'], {
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});

const data = JSON.parse(raw);

// Locate the AT RISK file list whatever the key is called.
function findList(obj, depth = 0) {
  if (depth > 4 || !obj || typeof obj !== 'object') return null;
  for (const [k, v] of Object.entries(obj)) {
    if (/atrisk|at_risk/i.test(k) && Array.isArray(v)) return v;
    if (Array.isArray(v) && v.length && typeof v[0] === 'object' && /atrisk|at_risk/i.test(JSON.stringify(Object.keys(v[0])))) return v;
    const nested = findList(v, depth + 1);
    if (nested) return nested;
  }
  return null;
}

let list = findList(data);
if (!list) {
  console.log('TOP-LEVEL KEYS:', Object.keys(data));
  console.log(JSON.stringify(data).slice(0, 800));
  process.exit(2);
}

const pathOf = (e) => (typeof e === 'string' ? e : e.path || e.file || e.name);
const sizeOf = (e) => (typeof e === 'string' ? 0 : e.bytes ?? e.size ?? 0);

// High-value = human-authored or deliverable: scripts, notes, finished sheets, contact sheets.
const isScript = (p) => /\.(mjs|js|ts|json|md|txt)$/i.test(p);
const isSheet = (p) => /-sheet-|contact-sheets\//i.test(p);
const isFrame = (p) => /\/frames\//i.test(p) || /\/logs\//i.test(p);

const buckets = { script: [], sheet: [], frame: [], other: [] };
for (const e of list) {
  const p = pathOf(e);
  if (!p) continue;
  const b = isScript(p) ? 'script' : isFrame(p) ? 'frame' : isSheet(p) ? 'sheet' : 'other';
  buckets[b].push({ p, bytes: sizeOf(e) });
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
const sum = (a) => a.reduce((t, x) => t + x.bytes, 0);

console.log(`AT RISK total: ${list.length} files, ${mb(sum(Object.values(buckets).flat()))}`);
for (const [k, v] of Object.entries(buckets)) {
  console.log(`\n### ${k.toUpperCase()} — ${v.length} files, ${mb(sum(v))}`);
  for (const f of v.slice(0, 12)) console.log(`   ${mb(f.bytes).padStart(10)}  ${f.p}`);
  if (v.length > 12) console.log(`   … and ${v.length - 12} more`);
}
