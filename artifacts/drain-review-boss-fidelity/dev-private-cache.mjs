// Scratch dev server with a PRIVATE optimizer cache: node_modules/.vite is a symlink into the
// main repo and is shared by every concurrent vite on this host, which 504s new deps.
import { createServer } from 'vite';
const port = Number(process.argv[2] ?? 5320);
const cacheDir = process.argv[3];
const server = await createServer({ cacheDir, server: { host: '127.0.0.1', port, strictPort: true } });
await server.listen();
server.printUrls();
