#!/usr/bin/env node
// citation-title-guard — keep `spec:line` citations recoverable.
//
// WHY (owner's desk, "the cheap half needs no ruling"; F-1223-1 → F-1224-1 → s1227):
//   s1223 found a known-red that survived a cleanup sweep because the sweep grepped the LINE
//   NUMBER one copy used (:121) while the source keyed the same subject on another (:80).
//   s1224 then MEASURED the class: 39 of 303 forward-looking `e2e/*.spec.ts:<line>` citations
//   in tracked task files no longer name the test they were written for. A rotted citation in
//   a known-reds block is not cosmetic — it either excuses a real red or points at nothing.
//
//   The owner's desk splits that question in two. The SHAPE half (should the red map key on
//   spec+title?) is a schema ruling and is NOT decided here. The CHEAP half needs no ruling
//   at all, because it is not a schema:
//
//       a citation that carries its test title survives its line number moving.
//
//   This guard enforces only the cheap half, and only going forward.
//
// WHAT IT CHECKS
//   Every `e2e/<name>.spec.ts:<line>` citation in tracked `tasks/**/*.md` must have, within
//   ~400 characters, a quoted string that resolves to a real `test(...)` title in that spec AS
//   IT STANDS TODAY. Resolution accepts the three shapes this repo's prose actually uses:
//   exact/prefix, title-plus-trailing-words, and mid-quote elision ("hash mismatch … restores
//   from relay snapshot"). The elided shape is the common one here, and scoring it NUMBER-ONLY
//   understates recoverability — s1224 hit exactly that false negative by hand.
//
// WHY A RATCHET, NOT A SWEEP
//   303 citations carry a large pre-existing debt. Failing on all of it would ship a guard red
//   at birth, and rewriting ~300 historical lines would churn the factory's most-read ledger
//   for citations that mostly point at settled work. So the debt is GRANDFATHERED EXPLICITLY in
//   citation-title-baseline.json — written down, not hidden — and the guard fails only when a
//   NEW bare coordinate appears, or an existing one multiplies. Pay the debt down by deleting
//   baseline entries; never by widening them silently.
//
// USAGE
//   node scripts/citation-title-guard.mjs                 # gate (exit 1 on a new bare citation)
//   node scripts/citation-title-guard.mjs --report        # full split, always exit 0
//   node scripts/citation-title-guard.mjs --update-baseline
//   node scripts/citation-title-guard.mjs --root <dir>    # for tests / detached worktrees

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, '..');

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : null;
}
const ROOT = path.resolve(arg('--root') || DEFAULT_ROOT);
const BASELINE = arg('--baseline') || path.join(ROOT, 'scripts', 'citation-title-baseline.json');
const REPORT = process.argv.includes('--report');
const UPDATE = process.argv.includes('--update-baseline');

const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g;
const TITLE_DECL = /^\s*(?:test|it)(?:\.\w+)*\s*\(\s*(['"`])([\s\S]*?)\1/gm;
const QUOTED = /["“”'‘’`]([^"“”'‘’`\n]{12,160})["“”'‘’`]/g;

const WINDOW = 400;
const MIN_PREFIX = 20;

function trackedTaskDocs() {
  const out = execFileSync('git', ['ls-files', 'tasks'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
  });
  return out
    .trim()
    .split('\n')
    .filter((f) => f.endsWith('.md'));
}

const titleCache = new Map();
function titlesOf(spec) {
  if (titleCache.has(spec)) return titleCache.get(spec);
  const p = path.join(ROOT, spec);
  let v = null;
  if (fs.existsSync(p)) {
    const src = fs.readFileSync(p, 'utf8');
    v = [];
    let m;
    TITLE_DECL.lastIndex = 0;
    while ((m = TITLE_DECL.exec(src))) v.push(m[2]);
  }
  titleCache.set(spec, v);
  return v;
}

// A doc almost never quotes a title verbatim. All three shapes below let a future reader grep
// back to the subject, so all three count as carried.
function matchesATitle(quote, titles) {
  const q = quote.trim().replace(/[….]+$/, '').trim();
  if (q.length < MIN_PREFIX) return null;
  const frags = q
    .split(/\s*(?:…|\.\.\.)\s*/)
    .map((f) => f.trim())
    .filter(Boolean);
  for (const t of titles) {
    if (t === q) return t;
    if (t.startsWith(q)) return t;
    if (q.startsWith(t) && t.length >= MIN_PREFIX) return t;
    if (frags.length > 1) {
      let at = 0;
      let ok = true;
      for (const f of frags) {
        const idx = t.indexOf(f, at);
        if (idx < 0) {
          ok = false;
          break;
        }
        at = idx + f.length;
      }
      if (ok) return t;
    }
  }
  return null;
}

export function scan(root = ROOT) {
  const rows = [];
  for (const file of trackedTaskDocs()) {
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) continue;
    const text = fs.readFileSync(abs, 'utf8');
    let hit;
    CITE.lastIndex = 0;
    while ((hit = CITE.exec(text))) {
      const spec = hit[1].replace(/^.*?(e2e\/)/, '$1');
      const titles = titlesOf(spec);
      const start = Math.max(0, hit.index - WINDOW);
      const end = Math.min(text.length, hit.index + hit[0].length + WINDOW);
      const win = text.slice(start, end);

      let verdict = 'NUMBER-ONLY';
      let carried = null;
      if (titles === null) {
        verdict = 'SPEC-GONE';
      } else {
        let q;
        QUOTED.lastIndex = 0;
        while ((q = QUOTED.exec(win))) {
          const t = matchesATitle(q[1], titles);
          if (t) {
            verdict = 'CARRIES-TITLE';
            carried = t;
            break;
          }
        }
      }
      rows.push({ file, raw: hit[0], spec, verdict, carried });
    }
  }
  return rows;
}

function tally(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.verdict === 'CARRIES-TITLE') continue;
    const key = `${r.file}::${r.raw}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

const rows = scan();
const current = tally(rows);

if (UPDATE) {
  const obj = Object.fromEntries([...current.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  fs.writeFileSync(BASELINE, JSON.stringify({ grandfathered: obj }, null, 2) + '\n');
  console.log(`citation-title-guard: baseline written — ${current.size} grandfathered citations`);
  process.exit(0);
}

const summary = {};
for (const r of rows) summary[r.verdict] = (summary[r.verdict] || 0) + 1;

if (REPORT) {
  console.log('=== citation-title-guard (report) ===');
  console.log(`citations: ${rows.length}`);
  for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(15)} ${v}`);
  }
  process.exit(0);
}

let baseline = {};
if (fs.existsSync(BASELINE)) {
  baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).grandfathered || {};
}

const violations = [];
for (const [key, n] of current) {
  const allowed = baseline[key] || 0;
  if (n > allowed) violations.push({ key, found: n, allowed });
}

console.log('=== citation-title-guard ===');
console.log(`citations scanned : ${rows.length}`);
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}
console.log(`grandfathered keys: ${Object.keys(baseline).length}`);

if (violations.length === 0) {
  console.log('PASS — no new bare `spec:line` citation.');
  process.exit(0);
}

console.log(`\nFAIL — ${violations.length} citation(s) cite a line with no recoverable test title:`);
for (const v of violations) {
  console.log(`  ${v.key}   (found ${v.found}, grandfathered ${v.allowed})`);
}
console.log(
  '\nFix: quote the test title beside the citation, e.g.\n' +
    '  `e2e/foo.spec.ts:123` ("the exact test title, or an … elided form")\n' +
    'The line number is a convenience that decays; the title is what survives.',
);
process.exit(1);
