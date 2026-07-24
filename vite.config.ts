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

export default defineConfig(() => {
  const releaseE1 = process.env.GR_RELEASE === 'e1';
  return {
  base: './',
  define: {
    __APP_BUILD__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA?.slice(0, 8) ?? 'dev'),
    __GR_RELEASE_E1__: JSON.stringify(releaseE1),
  },
  plugins: [releaseE1ContentPlugin(releaseE1), craftingQueuePlugin()],
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
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  };
});

function releaseE1ContentPlugin(enabled: boolean): Plugin {
  const virtualCeremonyScripts = '\0gold-rush-release-e1-ceremony-scripts';
  const virtualCeremonyStages = '\0gold-rush-release-e1-ceremony-stages';
  const virtualWorldDispatch = '\0gold-rush-release-e1-world-dispatch';
  const replacements = new Map([
    ['../../assets/contracts/*/manifest.json', '../../assets/contracts/epoch-1-frontier/manifest.json'],
    ['../../assets/contracts/*/families.json', '../../assets/contracts/epoch-1-frontier/families.json'],
    ['../../assets/contracts/*/caps.json', '../../assets/contracts/epoch-1-frontier/caps.json'],
    ['../../assets/contracts/*/contracts.json', '../../assets/contracts/epoch-1-frontier/contracts.json'],
    ['../../assets/raw/plate-contract-*.png', '../../assets/raw/plate-contract-{the-claim,dry-gulch,night-shift,twin-banks,baron}.png'],
    ['../../assets/processed/board-cards/*.png', '../../assets/processed/board-cards/{the-claim,e1-*}.png'],
    ['../../assets/processed/kit-era-*.png', '../../assets/processed/kit-era-1.png'],
    ['../../assets/processed/kit-*.png', '../../assets/processed/kit-era-1.png'],
    ['../../assets/raw/ceremony-stage-t*.png', '../../assets/raw/ceremony-stage-t1.png'],
    ['../../assets/pilots/plaza-props-3d/era-props.e*.json', '../../assets/pilots/plaza-props-3d/era-props.e1.json'],
    ['../../assets/pilots/*-3d/*.e*.glb', '../../assets/pilots/*-3d/*.e1.glb'],
    ['../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb', '../../assets/pilots/map-rebuild-spike/landmarks/{the-claim,dry-gulch,night-shift,twin-banks,baron}/*.glb'],
    ['../../assets/processed/char-e6-*-sheet-walk8-r*c*.png', '../../assets/processed/char-e1-release-no-match.png'],
    ['../../assets/processed/char-e7-*-sheet-walk8-r*c*.png', '../../assets/processed/char-e1-release-no-match.png'],
    ['../../assets/processed/char-e8-*-sheet-walk8-r*c*.png', '../../assets/processed/char-e1-release-no-match.png'],
    ['../../assets/processed/char-e9-*-sheet-walk8-r*c*.png', '../../assets/processed/char-e1-release-no-match.png'],
  ]);
  return {
    name: 'gold-rush-release-e1-content',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!enabled || !importer) return null;
      if ((source === './scripts' && importer.endsWith('/src/ceremony/CeremonySystem.ts')) || source === '../ceremony/scripts') {
        return virtualCeremonyScripts;
      }
      if (source === './stages' && importer.endsWith('/src/ceremony/CeremonySystem.ts')) return virtualCeremonyStages;
      if (source === '../../lore/world-dispatches.md?raw') return virtualWorldDispatch;
      return null;
    },
    async load(id) {
      if (id === virtualCeremonyScripts) return `
        export const CEREMONY_SCRIPTS = [];
        export const CEREMONY_KEPT_IMAGE_EVENT = 'gr-ceremony-kept-image';
        export const ceremonyScriptForEpoch = () => null;
        export const ceremonyKeptImageKey = (id) => \`gr.ceremony.keptImage.v1.\${id}\`;
      `;
      if (id === virtualCeremonyStages) return `
        export const ceremonyStageBackdropUrl = () => null;
        export const drawCeremonyStage = () => undefined;
      `;
      if (id === virtualWorldDispatch) {
        const source = await readFile(resolve(process.cwd(), 'lore/world-dispatches.md'), 'utf8');
        const frontier = source.match(/^## ERA 1\b[\s\S]*?(?=^## ERA 2\b)/m)?.[0];
        if (!frontier) throw new Error('Missing Era 1 world dispatches.');
        return `export default ${JSON.stringify(frontier)};`;
      }
      return null;
    },
    transform(code, id) {
      if (!enabled || !id.includes('/src/')) return null;
      let transformed = code;
      for (const [from, to] of replacements) transformed = transformed.replaceAll(from, to);
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/contracts\/epoch-(?:[2-9]|10)-[^/'"]+\/(contracts|manifest)\.json/g,
        '../../assets/contracts/epoch-1-frontier/$1.json',
      );
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/pilots\/map-rebuild-spike\/(?!baron-|dry-gulch-|night-shift-|the-claim-|twin-banks-)[^/'"]+-(terrain|panorama)-contract\.json\?raw/g,
        '../../assets/pilots/map-rebuild-spike/the-claim-$1-contract.json?raw',
      );
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/processed\/char-e(?:[2-9]|10)-[^'"?]+\.png/g,
        '../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png',
      );
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/processed\/char-(?:railtough|steamwrecker|coalthief)-[^'"?]+\.png/g,
        '../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png',
      );
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/processed\/boss-railcar-[^'"?]+\.png/g,
        '../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png',
      );
      transformed = transformed.replaceAll(
        '../../assets/processed/bld-boiler-house.png',
        '../../assets/processed/bld-palisade.png',
      );
      for (const laterModel of [
        '../../assets/pilots/railcar-3d/railcar.glb',
        '../../assets/pilots/crawler-3d/crawler.glb',
        '../../assets/pilots/salvage-claw-3d/salvage-claw.glb',
        '../../assets/pilots/dredge-queen-3d/dredge-queen.glb',
        '../../assets/pilots/old-digger-3d/old-digger.glb',
        '../../assets/pilots/homemaker-9000-3d/homemaker-9000.glb',
        '../../assets/pilots/ark-plaza-e10-3d/ark-plaza-e10.glb',
        '../../assets/pilots/ark-deck-era-dressing-e10-3d/ark-deck-era-dressing-e10.glb',
        '../../assets/pilots/dynamo-hall-3d/dynamo-hall.glb',
        '../../assets/pilots/run3d/boiler-house.glb',
      ]) transformed = transformed.replaceAll(laterModel, '../../assets/pilots/run3d/palisade.glb');
      transformed = transformed.replaceAll(
        "'../../assets/processed/char-*.png'",
        "['../../assets/processed/char-hero-sheet-*.png', '../../assets/processed/char-jumper-sheet-*.png', '../../assets/processed/char-bandit-*.png', '../../assets/processed/char-baron-sheet-*.png', '../../assets/processed/char-prospector-*.png', '../../assets/processed/char-assay-clerk-*.png', '../../assets/processed/char-preacher-*.png', '../../assets/processed/char-schoolteacher-*.png']",
      );
      transformed = transformed.replaceAll(
        "'../../assets/audio/raw/*.mp3'",
        "['../../assets/audio/raw/*.mp3', '!../../assets/audio/raw/dredge-queen-arrival-horn.mp3', '!../../assets/audio/raw/e5-deepwater-ambience-loop.mp3', '!../../assets/audio/raw/era-e2-steamworks-loop.mp3', '!../../assets/audio/raw/era-e3-voltage-loop.mp3', '!../../assets/audio/raw/homemaker-done-chime.mp3', '!../../assets/audio/raw/old-digger-tape-swap.mp3', '!../../assets/audio/raw/t4-*.mp3', '!../../assets/audio/raw/t5-*.mp3']",
      );
      transformed = transformed.replaceAll(
        "['../../assets/processed/terrain-*.png', '../../assets/processed/ter-*.png', '../../assets/processed/prop-spring-pond.png']",
        "['../../assets/processed/terrain-*.png', '../../assets/processed/prop-spring-pond.png']",
      );
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/processed\/icons-e2-r0c\d\.png/g,
        '../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png',
      );
      if (id.endsWith('/src/world/Terrain3dClaimPilot.ts')) {
        transformed = transformed.replace(/^\s*'e(?:[2-9]|10)-[^\n]+\n/gm, '');
      }
      return transformed === code ? null : { code: transformed, map: null };
    },
    renderChunk(code) {
      if (!enabled) return null;
      const transformed = code.replace(/epoch-(?:[2-9]|10)-[a-z0-9-]+/g, 'unreleased-epoch');
      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

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
