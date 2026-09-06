import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
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
  const buildVariant = process.env.GR_BUILD_VARIANT ?? (releaseE1 ? 'e1-preview' : 'dev');
  const assetDietFingerprint = createHash('sha256')
    .update(readFileSync(resolve(process.cwd(), 'scripts/asset-diet.mjs')))
    .update(readFileSync(resolve(process.cwd(), 'scripts/asset-diet.manifest.json')))
    .update(readFileSync(resolve(process.cwd(), 'package-lock.json')))
    .digest('hex')
    .slice(0, 8);
  return {
  base: releaseE1 && process.env.GR_BASE ? process.env.GR_BASE : './',
  define: {
    __APP_BUILD__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA?.slice(0, 8) ?? 'dev'),
    __APP_BUILD_VARIANT__: JSON.stringify(buildVariant),
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
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}.js`,
        chunkFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}.js`,
        assetFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}[extname]`,
      },
    },
  },
  // THE WORKER BUNDLE IS A SECOND BUILD, AND IT INHERITS NOTHING BY DEFAULT (F-CELL-5, 2026-09-07).
  // `src/replay/BrowserAgentTapeWorker.ts` is bundled by its own Rollup pass. Until this block
  // existed that pass saw neither `plugins` nor `build.rollupOptions.output`, with two measured
  // consequences on a `GR_RELEASE=e1` build:
  //   1. CONTENT. The E1 narrowing in `releaseE1ContentPlugin` never reached the worker's copy of
  //      the module graph, so its `char-*.png` glob resolved to every era's sheet cells and its
  //      contract imports kept their `epoch-2..10` ids. `npm run build:release` was RED on clean
  //      main for exactly this — "later epoch manifest id in assets/BrowserAgentTapeWorker-*.js"
  //      (scripts/assert-release-build.mjs:16). The deploy never caught it because
  //      `scripts/deploy.sh:80` runs `npm run build`, which does not call that assertion.
  //   2. SIZE. The worker's assets fell back to Vite's default `assets/[name]-[hash][extname]`, so
  //      they could not collide with (and be deduped against) the main pass's `-diet-` names:
  //      1,231 PNGs / 96,097,301 B of un-dieted duplicates, roughly doubling the deployed asset
  //      count for files no first-town request ever asks for.
  // `plugins` is written as the same two constructors in the same order as the main list so the two
  // passes cannot drift apart silently; Vite requires fresh instances per bundling, which is why it
  // is a function. `craftingQueuePlugin()` only defines dev-server hooks, so it is inert here and
  // present for that symmetry alone.
  worker: {
    plugins: () => [releaseE1ContentPlugin(releaseE1), craftingQueuePlugin()],
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}.js`,
        chunkFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}.js`,
        assetFileNames: `assets/[name]-[hash]-diet-${assetDietFingerprint}[extname]`,
      },
    },
  },
  };
});

function releaseE1ContentPlugin(enabled: boolean): Plugin {
  const virtualCeremonyScripts = '\0gold-rush-release-e1-ceremony-scripts';
  const virtualCeremonyStages = '\0gold-rush-release-e1-ceremony-stages';
  const virtualWorldDispatch = '\0gold-rush-release-e1-world-dispatch';
  const frontierCharacterImports = enabled ? releaseE1CharacterImports() : [];
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
        JSON.stringify(frontierCharacterImports),
      );
      transformed = transformed.replaceAll(
        "'../../assets/audio/raw/*.mp3'",
        "['../../assets/audio/raw/*.mp3', '!../../assets/audio/raw/dredge-queen-arrival-horn.mp3', '!../../assets/audio/raw/e5-deepwater-ambience-loop.mp3', '!../../assets/audio/raw/era-e2-steamworks-loop.mp3', '!../../assets/audio/raw/era-e3-voltage-loop.mp3', '!../../assets/audio/raw/homemaker-done-chime.mp3', '!../../assets/audio/raw/old-digger-tape-swap.mp3', '!../../assets/audio/raw/t4-*.mp3', '!../../assets/audio/raw/t5-*.mp3']",
      );
      // (The `ter-*.png` narrowing that used to live here is gone with F-CELL-4: `src/world/Terrain.ts`
      // no longer globs that pattern at all, in any variant, so the search string could never match
      // again and a dead replacement reads like a narrowing that is still happening.)
      transformed = transformed.replace(
        /\.\.\/\.\.\/assets\/processed\/icons-e2-r0c\d\.png/g,
        '../../assets/processed/char-bandit-base-sheet-walk8-r0c0.png',
      );
      if (id.endsWith('/src/world/Terrain3dClaimPilot.ts')) {
        // THE SINGLE-LINE LAW (F-RB-1, 2026-08-05): this strip removes LINES, so every
        // 'e2-'..'e10-' table entry in the pilot MUST be single-line — a multi-line entry
        // gets beheaded and the release build dies on the orphaned block (hill-mine's
        // water entry did exactly that). assert-release-build is the gate that catches it.
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

function releaseE1CharacterImports(): string[] {
  const processedRoot = resolve(process.cwd(), 'assets/processed');
  const characterContract = JSON.parse(
    readFileSync(resolve(process.cwd(), 'assets/layer-contracts/characters.v2.json'), 'utf8'),
  ) as { slots: Array<{ slot: string; [key: string]: unknown }> };
  const townSheets = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/town/town-actor-sheets.json'), 'utf8'),
  ) as Record<string, string>;
  const runtimeFrames = JSON.parse(
    readFileSync(resolve(process.cwd(), 'src/assets/character-runtime-frames.json'), 'utf8'),
  ) as unknown;
  const references = new Set<string>(Object.values(townSheets).map((sheet) => `${sheet}.png`));
  const collectPngReferences = (value: unknown): void => {
    if (typeof value === 'string' && value.startsWith('char-') && value.endsWith('.png')) references.add(value);
    else if (Array.isArray(value)) value.forEach(collectPngReferences);
    else if (value && typeof value === 'object') Object.values(value).forEach(collectPngReferences);
  };
  characterContract.slots
    .filter(({ slot }) => !/^char\.e(?:[2-9]|10)\./.test(slot))
    .forEach(collectPngReferences);
  collectPngReferences(runtimeFrames);

  const contractedFiles = readdirSync(processedRoot).filter((file) =>
    [...references].some((reference) =>
      file === reference || file.startsWith(`${reference.slice(0, -4)}-r`) && /^.+-r\d+c\d+\.png$/.test(file),
    ),
  );
  for (const sheet of Object.values(townSheets)) {
    if (!contractedFiles.some((file) => file.startsWith(`${sheet}-r`))) {
      throw new Error(`Frontier town actor sheet has no processed frames: ${sheet}`);
    }
  }
  return contractedFiles.sort().map((file) => `../../assets/processed/${file}`);
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
