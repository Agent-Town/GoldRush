import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createServer } from 'vite';
// Serve the untouched HEAD loader to the untouched existing specs. No file edits.
const original = execFileSync('git', ['show', '3dba120ec0fb1951632d03f97c095b8cb39ce5c4:src/assets/AssetLoading.ts'], { encoding: 'utf8' });
const target = path.resolve('src/assets/AssetLoading.ts');
const server = await createServer({
  server: { host: '127.0.0.1', port: 5198, strictPort: true },
  plugins: [{ name: 'native-atlas-baseline', enforce: 'pre', load(id) { if (id.split('?')[0] === target) return original; } }],
});
await server.listen();
console.log('Native HEAD AssetLoading baseline: http://127.0.0.1:5198');
