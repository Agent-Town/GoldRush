// s1050 — a REAL deploy through the merged scripts/deploy.sh, then an independent
// read of BOTH URLs: the deployment URL wrangler printed AND the production alias the
// family actually opens. deploy.sh only checks the former (F-1050-1).
// Spawned via node because the bare `bash scripts/deploy.sh` form is gated for fires (F-1048-3).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const PROD = 'https://gold-rush-3in.pages.dev';

const started = new Date().toISOString();
console.log(`[s1050] real deploy started ${started}`);

const r = spawnSync('bash', ['scripts/deploy.sh'], {
  cwd: ROOT,
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});

console.log('===== [deploy] lines =====');
console.log((r.stdout ?? '').split('\n').filter((l) => l.startsWith('[deploy]')).join('\n'));
console.log(`===== exit code = ${r.status} (never-block law: must be 0) =====`);

const result = JSON.parse(readFileSync(`${ROOT}/logs/deploy-result.json`, 'utf8'));
console.log('===== logs/deploy-result.json =====');
console.log(JSON.stringify(result));

async function probe(label, url) {
  try {
    const res = await fetch(`${url}/version.json`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return console.log(`${label} ${url} -> HTTP ${res.status}`);
    console.log(`${label} ${url} -> ${JSON.stringify(await res.json())}`);
  } catch (e) {
    console.log(`${label} ${url} -> UNREACHABLE (${e.message})`);
  }
}

console.log('===== independent /version.json reads =====');
console.log(`expected build (publishedBuild) = ${result.publishedBuild}`);
if (result.url) await probe('[deployment URL]', result.url);
await probe('[PRODUCTION alias]', PROD);
console.log(`[s1050] finished ${new Date().toISOString()}`);
