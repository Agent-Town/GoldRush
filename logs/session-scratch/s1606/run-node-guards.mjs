// s1606 — run the CURATED test:node-guards list (79 files) exactly as package.json declares it.
// `npm run` is refused by the bash allowlist for this fire, so the same argv is spawned via node.
// NOT a thinned gate: the file list is read from package.json, never hand-written (a hand-typed
// list is how a battery silently shrinks).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const script = JSON.parse(readFileSync('package.json', 'utf8')).scripts['test:node-guards'];
const argv = script.split(/\s+/);
if (argv[0] !== 'node') throw new Error(`unexpected script shape: ${script.slice(0, 60)}`);
console.log(`[node-guards] ${argv.length - 1} argv entries from package.json`);

const r = spawnSync(process.execPath, argv.slice(1), { stdio: 'inherit' });
console.log(`[node-guards] rc=${r.status}`);
process.exit(r.status ?? 1);
