// tabulate.mjs (worktree-vite-cache-1): the boot timings as markdown rows, read from the probe's JSON so no
// number in the report is transcribed by hand.   node tabulate.mjs <dir> [<dir> ...]
import fs from 'node:fs';
import path from 'node:path';

const rows = [];
for (const dir of process.argv.slice(2)) {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort()) {
    const r = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (!('bootMs' in r)) continue;
    const m = r.markers ?? {};
    const seconds = (ms) => (ms === null || ms === undefined ? 'n/a' : (ms / 1000).toFixed(1));
    rows.push([r.spawnedAt ?? '', `| ${r.label} | ${r.page?.ok ? 'booted' : `NO BOOT in 180 s (${(r.page?.badResponses ?? []).filter((b) => b.startsWith('504')).length} x 504)`} | ${seconds(r.bootMs)} | ${seconds(r.readyMs)} | ${r.page?.reloadsBeforeBoot ?? 'n/a'} / ${r.page?.reloadsInSettle ?? 'n/a'} | ${(m.reoptimizing ?? []).length ? 'yes' : 'no'} | ${(m.scanFailed ?? []).length ? 'FAILED' : 'ok'} | ${r.load1AtStart} / ${r.load1AtBoot} |`]);
  }
}
console.log('| boot | outcome | spawn to frame 10 (s) | spawn to HTTP 200 (s) | reloads before / after boot | cache discarded at start ("Re-optimizing" / "Forced") | dependency scan | load1 at spawn / at boot |');
console.log('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const [, row] of rows.sort((a, b) => a[0].localeCompare(b[0]))) console.log(row);
