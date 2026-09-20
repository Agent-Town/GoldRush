import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Frozen output of the runtime townPrefetchUrls/contractPrefetchUrls resolvers.
const targets = JSON.parse(await readFile(new URL('./resolved-urls.json', import.meta.url), 'utf8'));
const built = await readdir('dist/assets');
const sizes = new Map();
for (const url of new Set(targets.flatMap(({ urls }) => urls))) {
  const pathname = new URL(url, 'http://127.0.0.1:5176').pathname;
  const name = path.basename(decodeURIComponent(pathname), '.glb');
  const matches = built.filter(file => file.startsWith(`${name}-`) && file.endsWith('.glb'));
  const response = await fetch(new URL(pathname, process.argv[2] ?? 'http://127.0.0.1:5176'));
  if (!response.ok || !response.headers.get('content-type')?.includes('model/gltf-binary')) throw Error(`Invalid GLB ${url}`);
  const bytes = (await response.arrayBuffer()).byteLength;
  if (matches.length !== 1) throw Error(`Built candidates ${url}: ${matches.join(', ')}`);
  sizes.set(url, { url, bytes, contentLength: response.headers.get('content-length'), builtFile: matches[0], builtBytes: (await stat(path.join('dist/assets', matches[0]))).size });
}
const rows = targets.map(({ id, urls }) => ({ id, files: urls.length, devBytes: urls.reduce((sum, url) => sum + sizes.get(url).bytes, 0), builtBytes: urls.reduce((sum, url) => sum + sizes.get(url).builtBytes, 0), urls }));
await writeFile(new URL('./measured-sizes.json', import.meta.url), JSON.stringify({ method: 'Dev HTTP response.arrayBuffer().byteLength; dieted production file stat; runtime-resolved URL sets.', rows, assets: [...sizes.values()] }, null, 2) + '\n');
console.log('| Target | Files | Dev body bytes | Dieted build bytes |\n|---|---:|---:|---:|\n' + rows.map(r => `| ${r.id} | ${r.files} | ${r.devBytes} | ${r.builtBytes} |`).join('\n'));
