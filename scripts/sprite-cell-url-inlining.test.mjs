// THE SPRITE CELLS' URLS ARE A BUILD-TIME TABLE, NEVER A QUEUE OF ROUND TRIPS.
//
// WHY THIS EXISTS. The owner, 2026-09-06 evening: "now it loads veerrry slowly". The bisect
// (reviews/first-town-transfer-bisect.md) measured the shape of it: 241 JavaScript requests
// carrying 27,557 bytes inside the first-town window — one tiny `?url` module PER SPRITE CELL,
// emitted because `src/assets/SpriteAnimator.ts` and `src/assets/generated.ts` read their cells
// through a LAZY `import.meta.glob(..., { query: '?url', import: 'default' })`. Vite gives each
// matched file its own ~116-byte module (786 of them in the e1 release build), and every
// `loadProcessedTexture()` call spends a whole round trip learning a string. At 100 ms round trips
// that queue IS the slow load; the bytes were never the problem.
//
// The cure is `eager: true` on both globs: the same hashed, immutable URLs are resolved at build
// time and inlined into the importing chunk. Measured on the e1 release build: 786 per-cell
// modules -> 0, in-window JS requests 205/206 -> 32, and the entry chunk got SMALLER
// (1,143,893 -> 1,135,986 B). There is no separate manifest file to keep in sync, because the glob
// IS the manifest — which is the property this guard pins.
//
// WHAT IT PROVES, and how each half can red:
//   1. SOURCE — both cell globs still carry `eager: true`. Dropping it silently restores 786
//      modules and the slow load, with no test anywhere else noticing.
//   2. BUILD (real Vite build of a fixture, no repo build required) — an eager `?url` glob emits
//      ZERO per-cell chunks and inlines one URL per file on disk; the same fixture built LAZILY
//      emits one chunk per cell, so the predicate is proven to bite rather than to be vacuous.
//   3. FILE SET — add a cell to the fixture's asset directory and it appears in the table and is
//      emitted; delete one and both vanish. The table cannot drift from the directory, and it
//      cannot carry a URL for a file the build did not emit (a silent 404).
//
// The fixture is a four-file Vite project in a temp dir built through Vite's Node API, so this
// guard needs neither `dist/` nor a browser and cannot be fooled by a stale build.

import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Every source that reads sprite cells through the `char-*.png` `?url` glob. */
const CELL_GLOB_SOURCES = ['src/assets/SpriteAnimator.ts', 'src/assets/generated.ts'];
const CELL_GLOB_PATTERN = "'../../assets/processed/char-*.png'";

/** A one-pixel PNG; content differs per cell so the build cannot dedupe them into one asset. */
function cellPng(seed) {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  // Trailing bytes after IEND are ignored by decoders but change the content hash.
  return Buffer.concat([png, Buffer.from(`\n<!-- ${seed} -->\n`)]);
}

const CELLS = ['char-fixture-sheet-walk8-r0c0', 'char-fixture-sheet-walk8-r0c1', 'char-fixture-sheet-walk8-r1c0'];

function fixture(t, { eager }) {
  // realpath: on macOS the temp dir is a symlink, and Vite's html plugin refuses an entry
  // whose resolved path escapes `root`.
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'gold-rush-cell-inlining-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'assets/processed'), { recursive: true });
  mkdirSync(join(root, 'src/assets'), { recursive: true });
  for (const cell of CELLS) writeFileSync(join(root, 'assets/processed', `${cell}.png`), cellPng(cell));
  // Same call shape as the real sources, including the `?url` query and default import.
  writeFileSync(join(root, 'src/assets/cells.ts'), `
const cellUrls = import.meta.glob<string>(${CELL_GLOB_PATTERN}, {
${eager ? '  eager: true,\n' : ''}  query: '?url',
  import: 'default',
});
export const cellCount = Object.keys(cellUrls).length;
(globalThis as Record<string, unknown>).__cells = cellUrls;
`);
  writeFileSync(join(root, 'index.html'), '<!doctype html><script type="module" src="/src/assets/cells.ts"></script>');
  return {
    root,
    addCell(name) {
      writeFileSync(join(root, 'assets/processed', `${name}.png`), cellPng(name));
    },
    removeCell(name) {
      rmSync(join(root, 'assets/processed', `${name}.png`));
    },
    async build(options = {}, base) {
      const { build } = await import('vite');
      rmSync(join(root, 'dist'), { recursive: true, force: true });
      await build({
        root,
        base,
        logLevel: 'silent',
        configFile: false,
        // assetsInlineLimit 0: the real cells are tens of kilobytes and always emitted as
        // files; without this the fixture's 1-pixel PNGs would be inlined as data URIs and the
        // URL assertions below would pass on a build that emitted no asset at all.
        build: { outDir: 'dist', emptyOutDir: true, sourcemap: false, assetsInlineLimit: 0, ...options },
      });
      const assets = join(root, 'dist/assets');
      const files = readdirSync(assets);
      const code = files
        .filter((file) => file.endsWith('.js'))
        .map((file) => readFileSync(join(assets, file), 'utf8'))
        .join('\n');
      return {
        files,
        // A cell chunk is a JS module named after the cell it exists only to name.
        cellChunks: files.filter((file) => /^char-fixture-sheet-walk8-r\d+c\d+-/.test(file) && file.endsWith('.js')),
        emittedCellAssets: files.filter((file) => /^char-fixture-sheet-walk8-r\d+c\d+-/.test(file) && file.endsWith('.png')),
        // Keys of the glob record: the source paths, kept verbatim in the built code.
        // The minifier re-quotes strings with backticks, so accept every quote form.
        tableKeys: [...new Set([...code.matchAll(/["'`](?:\.\.\/)*assets\/processed\/(char-fixture-[^"'`]+\.png)["'`]/g)].map((m) => m[1]))].sort(),
        // Values of the glob record: the emitted, hashed URLs.
        tableUrls: [...new Set([...code.matchAll(/["'`]([^"'`]*char-fixture-sheet-walk8-r\d+c\d+-[A-Za-z0-9_-]+\.png)["'`]/g)].map((m) => m[1].split('/').pop()))].sort(),
      };
    },
  };
}

test('both sprite-cell globs are eager, so no per-cell module is ever emitted', () => {
  for (const relativePath of CELL_GLOB_SOURCES) {
    const source = readFileSync(join(ROOT, relativePath), 'utf8');
    const call = source.match(
      new RegExp(String.raw`import\.meta\.glob<string>\(${CELL_GLOB_PATTERN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},\s*\{([^}]*)\}`),
    );
    assert.ok(call, `${relativePath}: no \`import.meta.glob<string>(${CELL_GLOB_PATTERN}, {...})\` call found — if the cell lookup moved, move this guard with it`);
    assert.match(
      call[1],
      /\beager:\s*true\b/,
      `${relativePath}: the char-cell \`?url\` glob lost \`eager: true\`. That silently restores one JS module and one round trip PER SPRITE CELL (786 modules, 241 requests in the first-town window before the cure) — the owner's "now it loads veerrry slowly". Restore it, or replace it with a design measured to issue no more requests and say so here.`,
    );
  }
});

test('an eager ?url glob inlines every cell URL and emits no cell module; a lazy one emits one per cell', async (t) => {
  const eager = await fixture(t, { eager: true }).build();
  assert.deepEqual(eager.cellChunks, [], 'an eager glob must not emit a per-cell JS module');
  assert.equal(eager.tableKeys.length, CELLS.length, 'every cell on disk must be a key of the inlined table');
  assert.equal(eager.tableUrls.length, CELLS.length, 'every cell on disk must have its hashed URL inlined');
  assert.equal(eager.emittedCellAssets.length, CELLS.length, 'every cell on disk must still be emitted as an asset');

  // THE CONTROL. Without this the assertion above could pass on a build that emits nothing at all.
  const lazy = await fixture(t, { eager: false }).build();
  assert.equal(lazy.cellChunks.length, CELLS.length,
    'the lazy control must emit one JS module per cell — if it no longer does, Vite changed and the eager assertion above has stopped meaning anything');
});

test('the inlined table is the file set: a cell added appears, a cell removed disappears, and no URL is a 404', async (t) => {
  const project = fixture(t, { eager: true });

  const added = 'char-fixture-sheet-walk8-r1c1';
  project.addCell(added);
  const grown = await project.build();
  assert.ok(grown.tableKeys.includes(`${added}.png`), 'a cell added to the asset directory must appear in the inlined table');
  assert.equal(grown.tableKeys.length, CELLS.length + 1);
  assert.equal(grown.emittedCellAssets.length, CELLS.length + 1);
  // NEVER A SILENT 404: every URL the table hands the texture loader must be a file the build emitted.
  for (const url of grown.tableUrls) {
    assert.ok(grown.files.includes(url), `the inlined table points at ${url}, which the build did not emit`);
  }
  assert.deepEqual(grown.tableUrls.length, grown.emittedCellAssets.length, 'every emitted cell must be reachable through the table');

  project.removeCell(added);
  const shrunk = await project.build();
  assert.ok(!shrunk.tableKeys.includes(`${added}.png`), 'a cell removed from the asset directory must leave the inlined table');
  assert.equal(shrunk.tableKeys.length, CELLS.length);
  assert.equal(shrunk.emittedCellAssets.length, CELLS.length);
  for (const url of shrunk.tableUrls) {
    assert.ok(shrunk.files.includes(url), `the inlined table points at ${url}, which the build did not emit`);
  }
});

// A delayed consumer may share its image with the eager entry table. Execute the
// real loader expressions after splitting them into a second chunk: checking the
// emitted filenames alone misses a namespace/default-export mismatch.
test('delayed HUD, building and generated-art loaders resolve images shared with the entry chunk', async (t) => {
  const sources = ['src/ui/Hud.ts', 'src/assets/generated.ts', 'src/systems/BuildSystem.ts'];
  const loaders = sources.flatMap((source) => readFileSync(join(ROOT, source), 'utf8').split('\n')
    .filter((line) => /UrlLoader =|^\s+\[assetSlots\./.test(line) && line.includes('=>') && line.includes('assets/processed/'))
    .map((line) => {
      const expression = line.match(/(?:=|:)\s*((?:async )?\(\) => .+)[,;]$/)?.[1];
      assert.ok(expression, `${source}: unrecognized image loader`);
      const asset = expression.match(/'([^']+\.png)(?:\?url)?'/)?.[1];
      assert.ok(asset, `${source}: missing image path`);
      assert.ok(readFileSync(resolve(ROOT, 'src/assets', asset)).length, `${source}: missing source image`);
      return { source, name: basename(asset), expression: expression.replaceAll('../../assets/processed/', './') };
    }));
  // 19 -> 20 on 2026-09-15 (sprite-animator-runtime-land): the town cast gained the newsie, so
  // src/assets/generated.ts carries one more delayed loader (assetSlots.charTownNewsie). The estate
  // changed by exactly the one row; the guard's own message asks for this census to follow it.
  assert.equal(loaders.length, 20, 'update this census when the delayed loader estate changes');
  const f = fixture(t, { eager: true });
  writeFileSync(join(f.root, 'package.json'), '{"type":"module"}');
  for (const { name } of loaders) writeFileSync(join(f.root, 'assets/processed', name), cellPng(name));
  writeFileSync(join(f.root, 'assets/processed/late.js'), `export const loaders=[${loaders.map(({ expression }) => expression).join(',\n')}];`);
  writeFileSync(join(f.root, 'src/assets/cells.ts'), `
const urls=import.meta.glob('../../assets/processed/*.png',{eager:true,query:'?url',import:'default'});
globalThis.__sharedArtUrls=urls;
globalThis.__openArtLoaders=()=>import('../../assets/processed/late.js');
`);
  t.after(() => { delete globalThis.__sharedArtUrls; delete globalThis.__openArtLoaders; });
  // No DOM is needed to resolve URLs; dependency preloading is exercised by the
  // production browser check. The real Vite chunk/export transform still runs.
  for (const base of ['./', '/goldrush/']) {
    const built = await f.build({ modulePreload: { polyfill: false, resolveDependencies: () => [] } }, base);
    const entry = built.files.find((name) => /^index-.*\.js$/.test(name));
    assert.ok(entry);
    await import(pathToFileURL(join(f.root, 'dist/assets', entry)).href);
    const late = await globalThis.__openArtLoaders();
    for (const [index, { source, name }] of loaders.entries()) {
      const expected = new URL(globalThis.__sharedArtUrls[`../../assets/processed/${name}`], pathToFileURL(join(f.root, 'dist/assets', entry))).href;
      assert.equal(await late.loaders[index](), expected, `${source}: ${name} at ${base}`);
    }
  }
});
