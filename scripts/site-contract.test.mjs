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
 * ---------------------------------------------------------------------------
 * F-1234-1 / F-1234-2 (measured s1234): the sentence directly above was ITSELF
 * the next instance of the class it describes. "every local href/src" walked a
 * TAG WHITELIST, so the site's one cross-tree reference -- news.html's
 * `<div data-feed="../news/herald.json">`, a real production fetch -- was outside
 * the denominator; and resolveRef's branch for that same reference resolved it
 * to OUTSIDE THE REPOSITORY. Two mechanisms had been written for one reference
 * and neither had ever executed, each keeping the other unnoticed. Breaking the
 * live feed left tsc rc=0, build rc=0 and run-guards 8/8 rc=0.
 *
 * Both are cured below and the claim is now true as written: references are
 * enumerated by ATTRIBUTE on any element, not by a roster of tags. What it still
 * does NOT see is stated where it lives -- the `|| '../news/herald.json'` string
 * literal inside news.html's inline fetch is a second copy of the same path that
 * no assertion reads, and CSS `url()` is not parsed (site/styles.css emits none).
 *
 * These three are ONE-sided (site/ referring to itself), so the two-sided
 * argument above is not what keeps them always-on -- they ride here only because
 * the file already does and they cost ~10ms. That is not a precedent for adding
 * path-free guards in general; it is an argument about this file's cost.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');

function htmlFiles() {
  return readdirSync(SITE).filter((f) => f.endsWith('.html')).sort();
}

/**
 * The FILESYSTEM part of a URL reference: everything before the query and the
 * fragment. A reference is `path[?query][#fragment]`; only `path` names a file.
 *
 * F-2369-1 (measured s2370): this repo had no such helper, so every consumer
 * treated the raw attribute value as a filename. `eb152d4a7` added the ordinary
 * cache-busting query string to index.html's only script tag --
 * `assay-office.js?v=county-2` -- and THREE assertions in this file went red at
 * once against a file that exists and has never moved. The guard accused an
 * innocent page of shipping a broken reference, and stayed red on main for two
 * days (s2369 attributed it, correctly, as pre-existing debt).
 *
 * Strip the fragment first, then the query: per RFC 3986 the fragment is last,
 * so a `?` inside a fragment ("a.js#x?y") is part of the fragment and a `#`
 * inside a query is not reachable. Splitting in the other order would mis-handle
 * that case, which is why the order is stated rather than incidental.
 */
function refPath(raw) {
  return raw.split('#')[0].split('?')[0];
}

/** Every local <script src> the site's pages load, with the grammar each tag implies. */
function scriptRefs() {
  const refs = [];
  for (const page of htmlFiles()) {
    const html = readFileSync(join(SITE, page), 'utf8');
    for (const tag of html.match(/<script\b[^>]*\bsrc=[^>]*>/gi) ?? []) {
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      if (!src || /^(https?:)?\/\//.test(src)) continue; // remote scripts are not ours to parse
      // `src` stays RAW so failure messages quote what the page actually wrote;
      // `path` is what the filesystem is asked about. Keeping both is what stops
      // a future reader "simplifying" one into the other.
      refs.push({ page, src, path: refPath(src), module: /\btype=["']module["']/i.test(tag) });
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
    const file = join(SITE, ref.path);
    assert.ok(existsSync(file), `${ref.page} loads "${ref.src}" but site/${ref.path} does not exist`);
  }
});

test('site: each loaded script parses under the grammar its tag requests', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'gr-site-parse-'));
  try {
    for (const ref of scriptRefs()) {
      const source = readFileSync(join(SITE, ref.path), 'utf8');
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
  } finally {
    rmSync(tmp, { recursive: true, force: true });
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
  try {
    blocks.forEach((block, i) => {
      const probe = join(tmp, `inline-${i}.${block.module ? 'mjs' : 'cjs'}`);
      writeFileSync(probe, block.body);
      const run = spawnSync(process.execPath, ['--check', probe], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
      assert.equal(
        run.status,
        0,
        `an inline <script> in ${block.page} (${block.module ? 'module' : 'classic script'}) ` +
          `does not parse:\n${(run.stderr ?? '').trim()}`,
      );
    });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

/**
 * Every local href/src the pages emit, split into its path and its fragment.
 * External schemes are not ours to resolve.
 *
 * F-1234-1 (measured s1234): this used to walk a TAG WHITELIST
 * (link|a|img|script|source|video|audio|iframe). The `data-feed` arm of the
 * attribute chain below was added for news.html's production feed -- and the
 * only element that carries data-feed is a <div>, which the whitelist excluded.
 * So that arm matched 0 references out of 22 and had never executed once.
 * Measured: repointing the feed at a file that does not exist left tsc rc=0,
 * `npm run build` rc=0 and `run-guards` 8/8 rc=0; the identical break moved onto
 * an <iframe> failed this file's own "resolves to a file that exists" assertion.
 * Same attribute, same missing target, same page -- only the carrier tag differed.
 *
 * The fix is to stop keeping a tag roster: any element may carry a reference, so
 * the ATTRIBUTE is the thing worth enumerating, not the tag. Script and style
 * bodies are stripped first so a `<` inside JS/CSS cannot forge a tag.
 */
function localRefs() {
  const refs = [];
  const TAG = /<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g;
  for (const page of htmlFiles()) {
    // Blank the BODIES only -- the opening <script src> tag is itself a reference
    // and must stay in the denominator.
    const html = readFileSync(join(SITE, page), 'utf8').replace(
      /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
      (_m, open, _tag, body, close) => open + body.replace(/[^\n]/g, ' ') + close,
    );
    for (const [, tag, attrs] of html.matchAll(TAG)) {
      const raw =
        attrs.match(/\bhref=["']([^"']+)["']/i)?.[1] ??
        attrs.match(/\bsrc=["']([^"']+)["']/i)?.[1] ??
        // news.html points its feed at a file the deploy stage copies in beside
        // site/; it is a real production fetch, so it is a real reference.
        attrs.match(/\bdata-feed=["']([^"']+)["']/i)?.[1];
      if (!raw) continue;
      if (/^(https?:)?\/\/|^(mailto|tel|data|javascript):/i.test(raw)) continue;
      const fragment = raw.split('#')[1];
      refs.push({ page, tag: tag.toLowerCase(), raw, path: refPath(raw), fragment });
    }
  }
  return refs;
}

/**
 * Where a reference lands once deployed. deploy-site.sh:31-36 stages `site/.` at
 * the root and copies `news/` in beside it, so a leading `../` from a site page
 * lands in the repo root -- that is the production layout, not a guess.
 *
 * F-1234-2 (measured s1234): the former escape branch was
 * `inSite.startsWith(SITE) ? inSite : resolve(ROOT, path)`, which re-applied the
 * SAME `../` a second time and sent "../news/herald.json" to
 * <repo-parent>/news/herald.json -- outside the repository entirely -- while
 * discarding the correct answer `inSite` had already computed. It was written
 * for the one escaping reference on the site and was never reached, because the
 * tag whitelist removed by F-1234-1 hid that reference from this function: two
 * mechanisms for one reference, neither of which had ever executed.
 *
 * resolve(SITE, path) is therefore the whole rule. KNOWN LIMIT, stated rather
 * than coded for: a root-absolute href ("/news/x.json") would resolve to the
 * filesystem root and read as missing. The site emits none today, and writing an
 * untested branch for a case that does not exist is the exact defect above.
 */
function resolveRef(path) {
  return resolve(SITE, path);
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

/**
 * The anti-rot assertion for F-1234-1/-2. Both defects were INVISIBLE rather than
 * wrong-answered: a reference simply fell out of the denominator, and a guard that
 * checks nothing reports no failures. Counting is therefore not enough -- the two
 * properties that were silently lost have to be asserted by name.
 */
test('site: the denominator still contains a data-* reference, an escaping path and a query string', () => {
  const refs = localRefs().filter((r) => r.path);

  // (1) A reference carried by a non-whitelisted element. This is what the old
  // tag roster dropped; if a roster is ever reintroduced, this fails.
  const dataAttr = refs.filter((r) => !['link', 'a', 'img', 'script', 'source', 'video', 'audio', 'iframe'].includes(r.tag));
  assert.ok(
    dataAttr.length > 0,
    'no reference on a non-whitelisted element is being checked — the tag roster removed in F-1234-1 has come back',
  );

  // (2) A reference that escapes site/, i.e. the cross-tree feed. This is the one
  // input that exercises resolveRef's escaping case at all.
  const escaping = refs.filter((r) => !resolve(SITE, r.path).startsWith(SITE + '/'));
  assert.ok(
    escaping.length > 0,
    'no reference escapes site/ — the cross-tree feed has left the denominator (F-1234-2 branch is unexercised again)',
  );

  // (4) A reference carrying a QUERY STRING, and it must still resolve. This is
  // the F-2369-1 anti-rot arm, and it exists to catch the CHEAPER cure rather
  // than the defect: skipping query-bearing refs (`if (raw.includes('?'))
  // continue`) turns all three red assertions green while silently dropping the
  // site's ONLY script from the denominator -- F-1234-1's failure shape exactly,
  // where a reference falls out and a guard that checks nothing reports no
  // failures. Asserting existence here is what makes the arm a check and not a
  // census: a denominator entry nobody resolves is decoration.
  const queried = refs.filter((r) => r.raw.includes('?'));
  assert.ok(
    queried.length > 0,
    'no reference carries a query string — the cache-busting ref that exposed F-2369-1 ' +
      'has left the denominator, so refPath() is no longer exercised by any real input',
  );
  for (const ref of queried) {
    assert.ok(
      existsSync(resolveRef(ref.path)),
      `${ref.page} <${ref.tag}> points at "${ref.raw}" but its path part does not resolve ` +
        `(resolved: ${resolveRef(ref.path)}) — refPath() is not stripping the query`,
    );
  }

  // (3) …and it must resolve INSIDE the repo. The old branch sent it to the
  // repo's PARENT, which existsSync would have reported as simply missing.
  for (const ref of escaping) {
    const landed = resolveRef(ref.path);
    assert.ok(
      landed.startsWith(ROOT + '/'),
      `${ref.page} <${ref.tag}> "${ref.raw}" resolves to ${landed}, outside the repository`,
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
