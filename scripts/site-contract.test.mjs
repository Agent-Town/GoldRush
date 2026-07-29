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
