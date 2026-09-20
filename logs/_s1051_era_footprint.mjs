// s1051 — READ-ONLY. Sizes the later-epoch (e2..e10) footprint of dist/ using the SAME
// regex scripts/assert-release-build.mjs:40 uses to REJECT such files from an E1 release.
// deploy.sh:48 runs `npm run build` (not build:release), so all of this ships today.
import { readdir, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';

const distDir = resolve('dist');
async function filesUnder(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  }))).flat();
}

const laterEra = /(?:^|[.-])e(?:[2-9]|10)(?:[.-])/;   // assert-release-build.mjs:40, verbatim
const files = await filesUnder(distDir);
const rows = await Promise.all(files.map(async (f) => ({ f, size: (await stat(f)).size })));
const total = rows.reduce((s, r) => s + r.size, 0);
const later = rows.filter((r) => laterEra.test(basename(r.f)));
const laterBytes = later.reduce((s, r) => s + r.size, 0);
const mb = (n) => (n / 1048576).toFixed(1);

console.log('=== s1051 LATER-EPOCH FOOTPRINT IN dist/ (read-only) ===');
console.log(`dist total:                 ${files.length} files, ${mb(total)} MB`);
console.log(`later-epoch (e2..e10):      ${later.length} files, ${mb(laterBytes)} MB  (${Math.round(laterBytes / total * 100)}% of the upload)`);
console.log(`  -> assert-release-build.mjs:40 FAILS an E1 release if ANY of these are present`);
console.log(`  -> deploy.sh:48 runs \`npm run build\`, so they ship today\n`);

const byExt = new Map();
for (const r of later) {
  const e = extname(r.f) || '(none)';
  const cur = byExt.get(e) ?? { n: 0, bytes: 0 };
  byExt.set(e, { n: cur.n + 1, bytes: cur.bytes + r.size });
}
console.log('--- later-epoch bytes by type ---');
for (const [e, v] of [...byExt].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`${mb(v.bytes).padStart(7)} MB  ${String(v.n).padStart(4)} files  ${e}`);
}
console.log('\n--- top 15 later-epoch files ---');
for (const r of later.sort((a, b) => b.size - a.size).slice(0, 15)) {
  console.log(`${mb(r.size).padStart(7)} MB  ${basename(r.f)}`);
}
