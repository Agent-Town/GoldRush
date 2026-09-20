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
// WHAT IT CHECKS — AND THE 74% IT DOES NOT (read this before quoting a PASS; F-1252-1, s1252)
//   The denominator is `git ls-files tasks`, and ONLY that. Measured s1252: 305 citations in
//   scope, 853 out of it, including logs/suite-red-inventory.md — the known-reds block named
//   in the WHY above — with 644 citations, 643 of them NUMBER-ONLY. A PASS here is a statement
//   about tasks/**, never about the repo, and the verdict now prints that remainder so it
//   cannot be misread again. Widening the scope is an owner ruling, not a drive-by.
//
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
const QUOTED = /`([^`\n]{12,160})`|["“”]([^"“”\n]{12,160})["“”]|['‘’]([^'‘’\n]{12,160})['‘’]/g;

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

// NOT EVERY `spec.ts:<line>` CITATION NAMES A TEST (F-1252-3, s1252).
// The guard's vocabulary assumed one, and that assumption was its only violation on the whole
// tree: tasks/ts-cov-02-*.md cites `e2e/second-rider.spec.ts:6` and quotes, verbatim, what
// actually stands at line 6 -- `// @ts-expect-error The production companion is intentionally a
// directly runnable Node module.` That is a CORRECT and fully recoverable citation; a future
// reader greps the quoted text and lands on it whatever the line number becomes. Scoring it
// NUMBER-ONLY was the guard being wrong, not the doc.
//
// So a quote that resolves to any real SOURCE LINE of the cited spec counts as carried too.
// The recoverability test is the same one the title rule applies -- does the prose carry
// something greppable? -- and a directive, an import, or a config line answers it as well as a
// title does. Titles are still tried FIRST, so nothing about the title rule is weakened.
const lineCache = new Map();
function sourceLinesOf(spec) {
  if (lineCache.has(spec)) return lineCache.get(spec);
  const p = path.join(ROOT, spec);
  let v = null;
  if (fs.existsSync(p)) {
    v = [
      ...new Set(
        fs
          .readFileSync(p, 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length >= MIN_PREFIX),
      ),
    ];
  }
  lineCache.set(spec, v);
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
    // Track the .md line as we go. CITE.exec advances monotonically, so counting
    // newlines only between successive hits keeps this O(text) for the whole file.
    let scannedTo = 0;
    let mdLine = 1;
    while ((hit = CITE.exec(text))) {
      for (let i = scannedTo; i < hit.index; i++) if (text.charCodeAt(i) === 10) mdLine++;
      scannedTo = hit.index;
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
          const t = matchesATitle((q[1] ?? q[2] ?? q[3]), titles);
          if (t) {
            verdict = 'CARRIES-TITLE';
            carried = t;
            break;
          }
        }
        // Titles first, then any real source line of the same spec (F-1252-3).
        if (verdict === 'NUMBER-ONLY') {
          const lines = sourceLinesOf(spec) || [];
          QUOTED.lastIndex = 0;
          while ((q = QUOTED.exec(win))) {
            const t = matchesATitle((q[1] ?? q[2] ?? q[3]), lines);
            if (t) {
              verdict = 'CARRIES-LINE';
              carried = t;
              break;
            }
          }
        }
      }
      // F-1299-2: the offender KEY is not the offender's LOCATION. One coordinate can
      // occur several times in a file with only some of them matching CITE (the pattern
      // requires the literal `e2e/` prefix, so a bare prose mention of the same
      // spec:line is invisible to it). s1299 annotated the prominent prose copy, re-ran,
      // and got an unchanged count — a no-op "fix" that only the re-run caught. So carry
      // the enclosing line and an excerpt: the report must name the text to edit.
      const ls = text.lastIndexOf('\n', hit.index - 1) + 1;
      let le = text.indexOf('\n', hit.index);
      if (le < 0) le = text.length;
      const lineText = text.slice(ls, le);
      const col = hit.index - ls;
      const from = Math.max(0, col - 48);
      const to = Math.min(lineText.length, col + hit[0].length + 48);
      const context =
        (from > 0 ? '…' : '') + lineText.slice(from, to).trim() + (to < lineText.length ? '…' : '');
      rows.push({ file, raw: hit[0], spec, verdict, carried, mdLine, context });
    }
  }
  return rows;
}

function tally(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.verdict === 'CARRIES-TITLE' || r.verdict === 'CARRIES-LINE') continue;
    const key = `${r.file}::${r.raw}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

// WHAT THIS GUARD DOES **NOT** READ, PRINTED IN ITS OWN VERDICT (F-1252-1, s1252).
//
// The denominator above is `git ls-files tasks`. Measured at s1252: that is 305 of the
// 1158 `e2e/*.spec.ts:<line>` citations in the tracked tree. The other 853 live in .md
// files this guard never opens -- and the single largest of them is
// logs/suite-red-inventory.md with 644, of which 643 are NUMBER-ONLY.
//
// That file is the known-reds block. Read the WHY at the top of this script again: the
// harm it was written to stop is "a rotted citation in a known-reds block either excuses
// a real red or points at nothing". So the one file whose rot motivated the guard is the
// one file the guard was not pointed at, and `PASS` read as a statement about the repo.
//
// WIDENING THE DENOMINATOR IS A POLICY CHANGE AND IS NOT MADE HERE (§7.3). It would put
// ~853 citations under the ratchet and change what every future drain and fire must write;
// it sits on the owner's desk. What IS fixed here is the misreporting: a guard that says
// "clean" must say what it read. The count below is REPORTED, never gated -- if gating it
// were free the ruling would not be needed.
function unGatedCitations() {
  try {
    const all = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
      .trim()
      .split('\n')
      .filter((f) => f.endsWith('.md') && !f.startsWith('tasks/'));
    let citations = 0;
    let files = 0;
    let top = { file: null, n: 0 };
    for (const f of all) {
      let text;
      try {
        text = fs.readFileSync(path.join(ROOT, f), 'utf8');
      } catch {
        continue;
      }
      CITE.lastIndex = 0;
      let n = 0;
      while (CITE.exec(text)) n++;
      if (!n) continue;
      files++;
      citations += n;
      if (n > top.n) top = { file: f, n };
    }
    return { citations, files, top };
  } catch {
    // A probe that cannot run reports UNKNOWN, never 0 (the false-zero class:
    // F-1054-1 / F-1055-1 both shipped a reassuring 0 from a check that had not looked).
    return null;
  }
}

const taskDocs = trackedTaskDocs();
const rows = scan();
const current = tally(rows);

// REFUSE A SUBJECT NOBODY READ (F-1251-2's class, fourth instance -- s1248/s1249/s1250 in
// drain-block-check, s1251 in assert-release-build, here in s1252).
// Measured before the fix: with `tasks/` absent, empty, or holding no citation at all, this
// script printed `citations scanned : 0` followed by `PASS -- no new bare spec:line citation`
// and exited 0. A ratchet that has read nothing has proved nothing, and the realistic trigger
// is not exotic: renaming or moving tasks/, or a --root aimed one directory off, empties the
// denominator SILENTLY and turns this gate into an affirmative all-clear forever.
if (!REPORT) {
  if (taskDocs.length === 0) {
    console.error('citation-title-guard: REFUSING — `git ls-files tasks` matched no .md file.');
    console.error(
      `  root: ${ROOT}\n` +
        '  Nothing was read, so "no new bare citation" would be a claim about an empty set.\n' +
        '  Likely cause: tasks/ was moved or renamed, or --root points one directory off.',
    );
    process.exit(2);
  }
  if (rows.length === 0) {
    console.error(
      `citation-title-guard: REFUSING — ${taskDocs.length} tracked task doc(s) scanned, 0 citations found.`,
    );
    console.error(
      '  This guard exists because these citations exist. Zero of them across the whole\n' +
        '  ledger means the CITE pattern stopped matching (a path or naming convention moved),\n' +
        '  not that the debt was paid. Re-point the pattern rather than banking the silence.',
    );
    process.exit(2);
  }
}

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
  // --report is documented as never gating, so it WARNS where the gate REFUSES.
  if (rows.length === 0) {
    console.log(
      `  ⚠️  read nothing: ${taskDocs.length} tracked task doc(s), 0 citations. ` +
        'These numbers describe an empty set (the gate refuses on this input).',
    );
  }
  const un = unGatedCitations();
  if (un === null) console.log('  NOT GATED: UNKNOWN — out-of-scope probe could not run.');
  else if (un.citations > 0) {
    console.log(
      `  NOT GATED: ${un.citations} citation(s) in ${un.files} tracked .md outside tasks/ ` +
        `— largest ${un.top.file} (${un.top.n}).`,
    );
  }
  process.exit(0);
}

// A RATCHET WITHOUT ITS BASELINE IS NOT A RATCHET (F-1252-1, s1252).
// Previously a missing baseline was read as `{}` -- "nothing grandfathered". That is not a
// neutral default: it silently redefines the gate, and the sibling ratchet in this same
// battery already refuses instead (task-guard-audit.mjs: "no baseline ... run with --update
// once to create it", exit 2). Same class, same answer. `--update-baseline` still bootstraps.
let baseline = {};
if (!fs.existsSync(BASELINE)) {
  console.error(`citation-title-guard: REFUSING — no baseline at ${BASELINE}.`);
  console.error(
    '  Treating a missing baseline as "nothing grandfathered" would report every one of the\n' +
      `  ${current.size} pre-existing bare citation(s) as a new violation, or -- with an empty\n` +
      '  denominator -- would pass having compared nothing. Run --update-baseline once.',
  );
  process.exit(2);
}
try {
  baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).grandfathered || {};
} catch (error) {
  console.error(`citation-title-guard: REFUSING — baseline unreadable: ${error.message}`);
  process.exit(2);
}

const violations = [];
for (const [key, n] of current) {
  const allowed = baseline[key] || 0;
  if (n > allowed) violations.push({ key, found: n, allowed });
}

console.log('=== citation-title-guard ===');
console.log(`citations scanned : ${rows.length}  (in ${taskDocs.length} tracked tasks/**/*.md)`);
for (const [k, v] of Object.entries(summary).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}
console.log(`grandfathered keys: ${Object.keys(baseline).length}`);

const unGated = unGatedCitations();
if (unGated === null) {
  console.log('NOT GATED         : UNKNOWN — the out-of-scope probe could not run (git unavailable?).');
} else if (unGated.citations > 0) {
  console.log(
    `NOT GATED         : ${unGated.citations} citation(s) in ${unGated.files} tracked .md outside tasks/ ` +
      `— largest ${unGated.top.file} (${unGated.top.n}). Scope ruling: F-1252-1, owner's desk.`,
  );
}

if (violations.length === 0) {
  console.log(
    'PASS — no new bare `spec:line` citation among the ' +
      `${rows.length} scanned. This verdict covers tasks/** only.`,
  );
  process.exit(0);
}

console.log(`\nFAIL — ${violations.length} citation(s) cite a line with no recoverable test title:`);
for (const v of violations) {
  console.log(`  ${v.key}   (found ${v.found}, grandfathered ${v.allowed})`);
  // Name every ungated occurrence by line and surrounding text. Without this the key
  // alone can point at a coordinate that appears more than once, only one of which the
  // pattern actually matched — see F-1299-2 above the push site.
  const where = rows.filter(
    (r) => `${r.file}::${r.raw}` === v.key && r.verdict !== 'CARRIES-TITLE' && r.verdict !== 'CARRIES-LINE',
  );
  for (const r of where) console.log(`      ${r.file}:${r.mdLine}  ${r.context}`);
}
console.log(
  '\nFix: quote the test title beside the citation, e.g.\n' +
    '  `e2e/foo.spec.ts:123` ("the exact test title, or an … elided form")\n' +
    'The line number is a convenience that decays; the title is what survives.',
);
process.exit(1);
