/**
 * site-contract.test.mjs — the only gate that reads site/ at all.
 *
 * WHY THIS EXISTS (F-1230-1, measured s1230). s1229 proved the drain battery was
 * blind to functions/ and cured it with a path rule. The obvious next question --
 * is functions/ the ONLY such tree? -- has one more answer, and it is worse.
 *
 * site/ is deployed to players by scripts/deploy-site.sh (Pages project
 * 'agenttown') and site/index.html loads assay-office.js. Nothing checked it:
 * tsconfig include is [src, e2e, playwright.config.ts]; `vite build` builds the
 * game's index.html and never looks at site/; test:deploy-site-contract
 * fabricates its OWN site/index.html in a temp repo, so it gates deploy-site.sh's
 * honesty invariants rather than the site's content.
 *
 * PROVEN BY MUTATION, not by reading the config: a HARD SYNTAX ERROR planted in
 * site/assay-office.js left `npx tsc --noEmit` rc=0, `npm run build` rc=0 AND
 * `run-guards --changed-since HEAD` rc=0. Six greens over two planted breaks
 * (the second a realistic contract-field rename). That is worse than the
 * functions/ hole: there, guards existed and merely went unselected; here there
 * was no guard to select.
 *
 * WHY ALWAYS-ON RATHER THAN A `site/**` PATH RULE. The contract this file gates
 * is TWO-SIDED. site/assay-office.js reads a response shape produced by
 * functions/api/stats.ts, and the two share no type -- one is untypechecked
 * browser JS, the other a Worker. A rule keyed on site/ would miss the likelier
 * direction: the worker changes its vocabulary and the untouched consumer rots
 * silently. functions/ moved in four merges over 2026-07-28..29; site/ moved in
 * none. The guard costs milliseconds, so there is no cost case for gating it
 * behind a path in the first place.
 *
 * WHAT IT DOES NOT DO: it does not boot the page. Asserting rendered output
 * needs a browser and belongs in a spec, not a node guard. This checks the three
 * things that are cheap, decisive and currently unchecked -- that the scripts the
 * page loads exist, that they parse under the grammar the page loads them with,
 * and that the one cross-tree vocabulary matches its producer.
 *
 * ---------------------------------------------------------------------------
 * F-1231-1 (measured s1231): the three tests above have a DENOMINATOR NARROWER
 * THAN THE DEFECT CLASS THEY WERE BUILT FOR. They read `<script src>` only, so:
 *
 *   Arm A -- a hard syntax error planted in news.html's INLINE <script> (40 lines
 *   of real fetch/render code, the sibling of the very file F-1230-1 was written
 *   about) left tsc rc=0, `npm run build` rc=0, and the gate battery 3/3 rc=0
 *   INCLUDING THIS GUARD.
 *   Arm B -- index.html's stylesheet href repointed to a path with no file
 *   ("assets/styles.css"), i.e. the whole site ships unstyled: same three greens.
 *
 * So the cure shipped one fire earlier caught the instance and not the class.
 * The tests below close the rest of what a page can reference: inline scripts,
 * and every local href/src that must resolve to a real file or a real element.
 *
 * These three are ONE-sided (site/ referring to itself), so the two-sided
 * argument above is not what keeps them always-on -- they ride here only because
 * the file already does and they cost ~10ms. That is not a precedent for adding
 * path-free guards in general; it is an argument about this file's cost.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');

function htmlFiles() {
  return readdirSync(SITE).filter((f) => f.endsWith('.html')).sort();
}

/** Every local <script src> the site's pages load, with the grammar each tag implies. */
function scriptRefs() {
  const refs = [];
  for (const page of htmlFiles()) {
    const html = readFileSync(join(SITE, page), 'utf8');
    for (const tag of html.match(/<script\b[^>]*\bsrc=[^>]*>/gi) ?? []) {
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      if (!src || /^(https?:)?\/\//.test(src)) continue; // remote scripts are not ours to parse
      refs.push({ page, src, module: /\btype=["']module["']/i.test(tag) });
    }
  }
  return refs;
}

test('site: every local <script src> the pages load actually exists', () => {
  const refs = scriptRefs();
  // A zero-length run reports zero failures. Anchor the denominator so a broken
  // regex (or a page that stops loading its script) cannot read as a pass.
  assert.ok(refs.length > 0, 'found no local <script src> in site/*.html — parser or site changed');
  for (const ref of refs) {
    const file = join(SITE, ref.src);
    assert.ok(existsSync(file), `${ref.page} loads "${ref.src}" but site/${ref.src} does not exist`);
  }
});

test('site: each loaded script parses under the grammar its tag requests', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'gr-site-parse-'));
  for (const ref of scriptRefs()) {
    const source = readFileSync(join(SITE, ref.src), 'utf8');
    // A classic <script> is NOT parsed as a module by the browser, so checking it
    // as ESM would accept import/export that would blank the page in production.
    // Match the grammar to the tag: .cjs => classic/sloppy, .mjs => module.
    const probe = join(tmp, `probe.${ref.module ? 'mjs' : 'cjs'}`);
    writeFileSync(probe, source);
    const run = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
    assert.equal(
      run.status,
      0,
      `site/${ref.src} (loaded by ${ref.page} as ${ref.module ? 'module' : 'classic script'}) ` +
        `does not parse:\n${(run.stderr ?? '').trim()}`,
    );
  }
});

/** Every INLINE <script> body on the site's pages, with the grammar its tag implies. */
function inlineScripts() {
  const blocks = [];
  for (const page of htmlFiles()) {
    const html = readFileSync(join(SITE, page), 'utf8');
    for (const [, open, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc=/i.test(open)) continue; // external: covered by the tests above
      if (!body.trim()) continue;
      // A JSON-LD / importmap block is data, not script: node --check would reject
      // valid JSON, so only parse what the browser will actually execute.
      const type = open.match(/\btype=["']([^"']+)["']/i)?.[1];
      if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue;
      blocks.push({ page, body, module: /^module$/i.test(type ?? '') });
    }
  }
  return blocks;
}

test('site: each inline <script> parses under the grammar its tag requests', () => {
  const blocks = inlineScripts();
  // Anchor the denominator: news.html carries the site's whole news renderer
  // inline. A regex that stops matching must fail here, not report zero defects.
  assert.ok(blocks.length > 0, 'found no inline <script> in site/*.html — parser or site changed');
  const tmp = mkdtempSync(join(tmpdir(), 'gr-site-inline-'));
  blocks.forEach((block, i) => {
    const probe = join(tmp, `inline-${i}.${block.module ? 'mjs' : 'cjs'}`);
    writeFileSync(probe, block.body);
    const run = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
    assert.equal(
      run.status,
      0,
      `an inline <script> in ${block.page} (${block.module ? 'module' : 'classic script'}) ` +
        `does not parse:\n${(run.stderr ?? '').trim()}`,
    );
  });
});

/**
 * Every local href/src the pages emit, split into its path and its fragment.
 * External schemes are not ours to resolve.
 */
function localRefs() {
  const refs = [];
  const TAG = /<(link|a|img|script|source|video|audio|iframe)\b([^>]*)>/gi;
  for (const page of htmlFiles()) {
    const html = readFileSync(join(SITE, page), 'utf8');
    for (const [, tag, attrs] of html.matchAll(TAG)) {
      const raw =
        attrs.match(/\bhref=["']([^"']+)["']/i)?.[1] ??
        attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] ??
        // news.html points its feed at a file the deploy stage copies in beside
        // site/; it is a real production fetch, so it is a real reference.
        attrs.match(/\bdata-feed=["']([^"']+)["']/i)?.[1];
      if (!raw) continue;
      if (/^(https?:)?\/\/|^(mailto|tel|data|javascript):/i.test(raw)) continue;
      const [path, fragment] = raw.split('#');
      refs.push({ page, tag: tag.toLowerCase(), raw, path, fragment });
    }
  }
  return refs;
}

/**
 * Where a reference lands once deployed. deploy-site.sh:31-36 stages `site/.` at
 * the root and copies `news/` in beside it, so a path that escapes site/ is
 * resolved against the repo root -- that is the production layout, not a guess.
 */
function resolveRef(path) {
  const inSite = resolve(SITE, path);
  return inSite.startsWith(SITE) ? inSite : resolve(ROOT, path);
}

test('site: every local href/src resolves to a file that exists', () => {
  const refs = localRefs().filter((r) => r.path);
  assert.ok(refs.length > 0, 'found no local href/src in site/*.html — parser or site changed');
  for (const ref of refs) {
    assert.ok(
      existsSync(resolveRef(ref.path)),
      `${ref.page} <${ref.tag}> points at "${ref.raw}" but nothing exists there ` +
        `(resolved: ${resolveRef(ref.path)})`,
    );
  }
});

test('site: every in-page anchor targets an element that exists', () => {
  const refs = localRefs().filter((r) => r.fragment);
  assert.ok(refs.length > 0, 'found no #fragment links in site/*.html — parser or site changed');
  const ids = new Map();
  for (const page of htmlFiles()) {
    const html = readFileSync(join(SITE, page), 'utf8');
    ids.set(page, new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1])));
  }
  for (const ref of refs) {
    // '#x' means this page; 'other.html#x' means that one.
    const target = ref.path ? ref.path.replace(/^\.?\//, '') : ref.page;
    const known = ids.get(target);
    assert.ok(known, `${ref.page} links to "${ref.raw}" but ${target} is not a site page`);
    assert.ok(
      known.has(ref.fragment),
      `${ref.page} links to "${ref.raw}" but ${target} has no element with id="${ref.fragment}"`,
    );
  }
});

test('site: assay-office duration vocabulary matches functions/api/stats.ts', () => {
  // The one cross-tree contract with no shared type: the worker emits
  // medianDurationBucket, the page keys a label map on it. A value the page has
  // no label for renders "still tallying" forever, on production, silently.
  const worker = readFileSync(join(ROOT, 'functions/api/stats.ts'), 'utf8');
  const consumer = readFileSync(join(SITE, 'assay-office.js'), 'utf8');

  const workerList = worker.match(/const DURATION_BUCKETS = \[([^\]]+)\]/)?.[1];
  assert.ok(workerList, 'DURATION_BUCKETS not found in functions/api/stats.ts — producer changed shape');
  const produced = [...workerList.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);

  const consumerBlock = consumer.match(/const DURATION_LABELS = \{([\s\S]*?)\n\};/)?.[1];
  assert.ok(consumerBlock, 'DURATION_LABELS not found in site/assay-office.js — consumer changed shape');
  const labelled = [...consumerBlock.matchAll(/^\s*'?([A-Za-z0-9_-]+)'?\s*:/gm)].map((m) => m[1]);

  assert.ok(produced.length > 0 && labelled.length > 0, 'one side enumerated to nothing');
  assert.deepEqual(
    [...labelled].sort(),
    [...produced].sort(),
    'the assay page has no label for a bucket the worker can emit (or labels one it cannot)',
  );
});
