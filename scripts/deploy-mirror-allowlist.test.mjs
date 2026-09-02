import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { glob, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { ENGINE_SOURCE_INPUTS } from './assay-replay-agent.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const deployPath = path.join(root, 'scripts/deploy.sh');

async function mirrorFilters() {
  const source = await readFile(deployPath, 'utf8');
  const block = source.match(/# MIRROR_FILTERS_BEGIN[\s\S]*?MIRROR_FILTERS=\(\n([\s\S]*?)\n\s*\)\n\s*# MIRROR_FILTERS_END/)?.[1];
  assert.ok(block, 'deploy mirror filter block is parseable');
  return [...block.matchAll(/^\s*"([^"]+)"\s*$/gm)].map((match) => match[1]);
}

async function filesUnder(relative, extensions) {
  const absolute = path.join(root, relative);
  if (path.extname(relative)) return [relative];
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile() && extensions.test(entry.name)) files.push(path.relative(root, child));
    }
  }
  await visit(absolute);
  return files;
}

function localSpecifiers(source) {
  const values = new Set();
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
    /ssrLoadModule\(\s*['"]([^'"]+)['"]\s*\)/g,
    /new URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g,
  ];
  for (const pattern of patterns) for (const match of source.matchAll(pattern)) values.add(match[1]);
  return values;
}

function resolveLocal(importer, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return undefined;
  const clean = specifier.replace(/[?#].*$/, '');
  const base = specifier.startsWith('/') ? path.join(root, clean.slice(1)) : path.resolve(path.dirname(importer), clean);
  const candidates = [base, ...['.ts', '.mjs', '.js', '.json', '.css'].map((extension) => `${base}${extension}`),
    ...['index.ts', 'index.mjs', 'index.js'].map((name) => path.join(base, name))];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

async function importClosure(entries) {
  const queue = entries.map((entry) => path.join(root, entry));
  const files = new Set();
  while (queue.length) {
    const file = queue.pop();
    const relative = path.relative(root, file).split(path.sep).join('/');
    if (files.has(relative)) continue;
    files.add(relative);
    if (!/\.(?:[cm]?[jt]s|css)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    for (const specifier of localSpecifiers(source)) {
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
      const resolved = resolveLocal(file, specifier);
      assert.ok(resolved, `${relative} resolves ${specifier}`);
      queue.push(resolved);
    }
    for (const match of source.matchAll(/import\.meta\.glob(?:<[^>]+>)?\(\s*['"]([^'"]+)['"]/g)) {
      for await (const found of glob(match[1], { cwd: path.dirname(file) })) queue.push(path.resolve(path.dirname(file), found));
    }
  }
  return files;
}

async function put(base, relative, bytes = 'runtime') {
  const target = path.join(base, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
}

function dryRun(filters, source, destination) {
  return execFileSync('rsync', ['-ani', '--delete', ...filters, `${source}/`, `${destination}/`], { encoding: 'utf8' });
}

test('droplet mirror ships the runtime closure and deletes only unprotected spillover', async () => {
  const filters = await mirrorFilters();
  assert.equal(filters.at(-1), '--filter=-s *', 'allowlist ends closed on the sender without disabling receiver protection');
  assert.ok(filters.includes('--filter=P /node_modules/***'), 'box-installed dependencies are protected');

  const ledger = await importClosure(['server/ledger/serve.mjs']);
  const assay = await importClosure(['scripts/assay-worker.mjs', 'scripts/assay-replay.mjs', 'src/main.ts', 'vite.config.ts']);
  const engine = new Set((await Promise.all(ENGINE_SOURCE_INPUTS.map((entry) => filesUnder(entry, /\.(?:json|mjs|ts)$/)))).flat());
  const runtime = new Set([
    ...ledger,
    ...assay,
    ...engine,
    'index.html',
    'scripts/asset-diet.mjs',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'assets/engine-era.json',
  ]);

  const fixture = await mkdtemp(path.join(os.tmpdir(), 'goldrush-mirror-'));
  try {
    const source = path.join(fixture, 'source');
    const destination = path.join(fixture, 'destination');
    await Promise.all([...runtime].map((relative) => put(source, relative)));
    await put(source, 'e9-review-video/clip.mp4');
    await put(source, 'gate-t99/worktree.txt');
    await put(source, 'assets/raw/x.png');
    await put(source, 'junk.bin', Buffer.alloc(3 * 1024 * 1024));
    await mkdir(destination, { recursive: true });

    const shipped = dryRun(filters, source, destination);
    const missing = [...runtime].filter((relative) => !new RegExp(` ${relative.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(shipped));
    assert.deepEqual(missing, [], 'every derived runtime file ships');
    for (const decoy of ['e9-review-video', 'gate-t99', 'assets/raw/x.png', 'junk.bin']) assert.doesNotMatch(shipped, new RegExp(decoy), `does not ship ${decoy}`);

    await put(destination, 'node_modules/box-install/package.json');
    await put(destination, 'e9-review-video/old.mp4');
    await put(destination, 'gate-t99/old.txt');
    await put(destination, 'assets/raw/x.png');
    await put(destination, 'junk.bin');
    const ledgerDb = path.join(fixture, 'goldrush-ledger/ledger.db');
    const uploads = path.join(fixture, 'site-uploads/keep.txt');
    await put(fixture, 'goldrush-ledger/ledger.db');
    await put(fixture, 'site-uploads/keep.txt');

    const deletion = dryRun(filters, source, destination);
    assert.doesNotMatch(deletion, /\*deleting .*node_modules/, 'protected node_modules survives receiver deletion');
    for (const decoy of ['e9-review-video', 'gate-t99', 'assets/raw/x.png', 'junk.bin']) assert.match(deletion, new RegExp(`\\*deleting .*${decoy}`), `delete-excluded removes ${decoy}`);
    for (const outside of [ledgerDb, uploads]) {
      assert.ok(path.relative(destination, outside).startsWith('..'), `${outside} is outside the mirror root`);
      assert.ok(existsSync(outside), `${outside} survives mirror dry-run`);
    }

    console.log(`mirror closure: ledger ${ledger.size} files; assay ${assay.size} files; engine ${engine.size} files; total ${runtime.size}`);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
