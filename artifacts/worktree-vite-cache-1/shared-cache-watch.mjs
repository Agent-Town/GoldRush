// shared-cache-watch.mjs (worktree-vite-cache-1): READ-ONLY sampler of a vite dependency cache.
// Every 2 s it reads `<cacheDir>/deps/_metadata.json` and prints a line whenever the metadata's
// identity changes (configHash differs per checkout root, because vite hashes `config.root`), so a run
// shows how often, and by how many different roots, one shared cache is rewritten. Nothing is written
// into the cache.
//   node shared-cache-watch.mjs <cacheDir> <seconds>
import fs from 'node:fs';
import path from 'node:path';

const [cacheDir, seconds = '600'] = process.argv.slice(2);
const deadline = Date.now() + Number(seconds) * 1000;
const read = () => {
  try {
    const file = path.join(cacheDir, 'deps', '_metadata.json');
    const m = JSON.parse(fs.readFileSync(file, 'utf8'));
    const mtime = fs.statSync(file).mtime.toISOString();
    return `configHash ${m.configHash} hash ${m.hash} optimized ${Object.keys(m.optimized ?? {}).length} mtime ${mtime}`;
  } catch {
    return 'no deps/_metadata.json';
  }
};
const temps = () => { try { return fs.readdirSync(cacheDir).filter((name) => name.includes('_temp_')).length; } catch { return 0; } };
let last = null;
const hashes = new Set();
let changes = 0;
console.log(`# watching ${cacheDir} from ${new Date().toISOString()} for ${seconds} s; temp dirs ${temps()}`);
while (Date.now() < deadline) {
  const now = read();
  if (now !== last) {
    if (last !== null) changes += 1;
    const hash = /configHash (\S+)/.exec(now)?.[1];
    if (hash) hashes.add(hash);
    console.log(`${new Date().toISOString()} ${now}`);
    last = now;
  }
  await new Promise((resolve) => setTimeout(resolve, 2_000));
}
console.log(`# end ${new Date().toISOString()}: ${changes} rewrites, ${hashes.size} distinct configHash values (${[...hashes].join(', ')}); temp dirs ${temps()}`);
