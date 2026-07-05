import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { resolve, sep } from 'node:path';
import {
  CRAFTING_QUEUE_PENDING_DIR,
  pendingQueuePath,
  sanitizePendingQueueRequest,
} from './src/crafting/CraftingQueueContract';

export default defineConfig({
  base: './',
  plugins: [craftingQueuePlugin()],
  server: {
    host: '127.0.0.1',
    port: 5188,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4188,
    strictPort: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 900,
  },
});

function craftingQueuePlugin(): Plugin {
  return {
    name: 'gold-rush-crafting-queue',
    configureServer(server) {
      server.middlewares.use('/__goldrush/crafting-queue/pending', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        let payload: unknown;
        try {
          payload = JSON.parse(await readBody(req));
        } catch {
          res.statusCode = 400;
          res.end('Invalid pending order');
          return;
        }

        const request = sanitizePendingQueueRequest(payload);
        if (!request) {
          res.statusCode = 400;
          res.end('Invalid pending order');
          return;
        }

        const root = resolve(process.cwd(), CRAFTING_QUEUE_PENDING_DIR);
        const relativePath = pendingQueuePath(request.id);
        const filePath = resolve(process.cwd(), relativePath);
        if (!filePath.startsWith(root + sep)) {
          res.statusCode = 400;
          res.end('Invalid pending path');
          return;
        }

        try {
          await mkdir(root, { recursive: true });
          await writeFile(filePath, `${JSON.stringify(request, null, 2)}\n`, 'utf8');
        } catch {
          res.statusCode = 500;
          res.end('Could not save pending order');
          return;
        }

        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ ok: true, path: relativePath }));
      });
    },
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolveBody, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 4096) reject(new Error('Body too large'));
    });
    req.on('end', () => resolveBody(body));
    req.on('error', reject);
  });
}
