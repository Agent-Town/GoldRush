// s1606 — boot a vite DEV server on a scratch port so the rf-34 stale-check never contends with
// live lane-b for 5188 (Mistake #12; vite.config.ts pins 5188 with strictPort, and the lane runner
// sets no port of its own, so a fire on the default port can red a lane's gate).
// Dev, never `vite preview` — F-1457-1 / external-server-guard.mjs.
import { createServer } from 'vite';

const port = Number(process.argv[2] || 5199);
const server = await createServer({
  configFile: 'vite.config.ts',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();
console.log(`scratch dev server listening on http://127.0.0.1:${port}`);
