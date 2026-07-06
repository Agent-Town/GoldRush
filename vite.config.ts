import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import { resolve, sep } from 'node:path';
import {
  CRAFTING_QUEUE_PENDING_DIR,
  normalizeQueueProfile,
  parseApprovedQueueEntry,
  parseRejectedQueueEntry,
  pendingQueuePath,
  sanitizePendingQueueRequest,
  type CraftingQueueApproved,
  type CraftingQueueRejected,
  type CraftingQueueRequest,
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
    handleHotUpdate(ctx) {
      const queueRoot = resolve(process.cwd(), 'assets/crafting-queue') + sep;
      if (ctx.file.startsWith(queueRoot)) return [];
    },
    configureServer(server) {
      server.middlewares.use('/__goldrush/crafting-queue/state', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        const url = new URL(req.url ?? '/', 'http://goldrush.local');
        const profile = normalizeQueueProfile(url.searchParams.get('profile'));
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify(await readQueueState(profile)));
      });

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

        const existingPath = await existingQueuePath(request.id);
        if (existingPath) {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: false, reason: 'duplicate', message: 'already at the works', path: existingPath }));
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

async function readQueueState(profile: string): Promise<{
  pending: CraftingQueueRequest[];
  approved: CraftingQueueApproved[];
  rejected: CraftingQueueRejected[];
}> {
  const approved = (await readQueueDir('assets/crafting-queue/approved', parseApprovedQueueEntry)).filter(
    (entry) => entry.request.profile === profile,
  );
  const rejected = (await readQueueDir('assets/crafting-queue/rejected', parseRejectedQueueEntry)).filter(
    (entry) => entry.request.profile === profile,
  );
  const verdictIds = new Set([...approved, ...rejected].map((entry) => entry.id));
  const pending = (await readQueueDir(CRAFTING_QUEUE_PENDING_DIR, sanitizePendingQueueRequest)).filter(
    (entry) => entry.profile === profile && !verdictIds.has(entry.id),
  );
  return { pending, approved, rejected };
}

async function readQueueDir<T>(relativeDir: string, parse: (value: unknown) => T | null): Promise<T[]> {
  const dir = resolve(process.cwd(), relativeDir);
  const files = await readdir(dir).catch(() => []);
  const entries = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map(async (file) => {
        try {
          return parse(JSON.parse(await readFile(resolve(dir, file), 'utf8')));
        } catch {
          return null;
        }
      }),
  );
  return entries.filter((entry): entry is T => Boolean(entry));
}

async function existingQueuePath(id: string): Promise<string | undefined> {
  for (const state of ['pending', 'approved', 'rejected'] as const) {
    const relativePath =
      state === 'pending' ? pendingQueuePath(id) : `assets/crafting-queue/${state}/${id}.json`;
    if (await fileExists(relativePath)) return relativePath;
  }
}

async function fileExists(relativePath: string): Promise<boolean> {
  try {
    await access(resolve(process.cwd(), relativePath));
    return true;
  } catch {
    return false;
  }
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
