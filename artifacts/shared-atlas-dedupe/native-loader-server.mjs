import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createServer } from 'vite';
// Serve the untouched HEAD loader to the untouched existing specs. No file edits.
const original = execFileSync('git', ['show', 'a16b19354e1a6a1ec431bce22801e39c8d91257d:src/assets/AssetLoading.ts'], { encoding: 'utf8' });
const target = path.resolve('src/assets/AssetLoading.ts');
const server = await createServer({
  server: { host: '127.0.0.1', port: 5198, strictPort: true },
  plugins: [{ name: 'native-atlas-baseline', enforce: 'pre', load(id) { if (id.split('?')[0] === target) return original; } }],
});
await server.listen();
console.log('Native HEAD AssetLoading baseline: http://127.0.0.1:5198');
