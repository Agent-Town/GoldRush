#!/usr/bin/env node
// s1224 — measure the CLASS s1223 diagnosed but never counted.
//
// s1223 (F-1223-1) found that "ap-standing-orders.spec.ts:25% mobile-only" survived a
// sweep because the sweep grepped for the LINE NUMBER the copies used (:121) while the
// source inventory keyed the same subject on a different line (:80). Its conclusion:
// "known-reds blocks cite reds by LINE NUMBER, which drifts ... no sweep by line can
// find them all". It fixed FIVE documents for ONE subject and left the class unmeasured.
//
// This script measures it. For every `<spec>.spec.ts:<line>` citation in tasks/**:
//   1. find the commit that INTRODUCED that exact citation string into that master
//   2. resolve the enclosing test title at that line, in the spec AS IT WAS at that commit
//   3. resolve the enclosing test title at that same line, in the spec on today's main
//   4. differ => the citation has DRIFTED: it now names a different test than it was written for
//
// A drifted citation is not cosmetic. In a known-reds block it tells the next runner to
// expect a failure at a coordinate that now belongs to some other test — so it either
// excuses a real red or points at nothing at all.
//
// Output: JSON to --out, human summary to stdout.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = process.cwd();
const OUT = (() => {
  const i = process.argv.indexOf('--out');
  return i > -1 ? process.argv[i + 1] : null;
})();

function git(args) {
  try {
    return execFileSync('git', args, { cwd: REPO, maxBuffer: 1 << 28, encoding: 'utf8' });
  } catch {
    return null;
  }
}

// ---- 1. collect citations -------------------------------------------------
const masters = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|\.git/.test(p)) walk(p);
    } else if (e.name.endsWith('.md')) masters.push(p);
  }
})('tasks');

const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g;
const KNOWN_RED = /known[ -]reds?/i;

const citations = [];
for (const m of masters) {
  const text = fs.readFileSync(m, 'utf8');
  let hit;
  while ((hit = CITE.exec(text))) {
    const raw = hit[0];
    const spec = hit[1].replace(/^.*?(e2e\/)/, '$1'); // normalise to repo-relative e2e/...
    const line = Number(hit[2]);
    // known-red context = the mention appears within 500 chars either side
    const window = text.slice(Math.max(0, hit.index - 500), hit.index + 500);
    citations.push({
      master: m,
      raw,
      spec,
      line,
      knownRedContext: KNOWN_RED.test(window),
    });
  }
}

// ---- 2. enclosing test title at a given line ------------------------------
const TEST_DECL = /^\s*(test|it)(\.\w+)*\s*\(\s*(['"`])([\s\S]*?)\3/;
const DESC_DECL = /^\s*(test\.describe|describe)(\.\w+)*\s*\(\s*(['"`])([\s\S]*?)\3/;

function enclosingTitle(content, line) {
  if (content == null) return { status: 'no-file' };
  const lines = content.split('\n');
  if (line > lines.length) return { status: 'past-eof', eof: lines.length };
  let test = null;
  let desc = null;
  for (let i = 0; i < line && i < lines.length; i++) {
    const t = lines[i].match(TEST_DECL);
    if (t) test = t[4];
    const d = lines[i].match(DESC_DECL);
    if (d) desc = d[4];
  }
  return { status: 'ok', test, desc, text: (lines[line - 1] || '').trim().slice(0, 140) };
}

// ---- 3. introducing commit for each citation ------------------------------
const introCache = new Map();
function introCommit(master, raw) {
  const key = master + '\u0000' + raw;
  if (introCache.has(key)) return introCache.get(key);
  // last commit that CHANGED the occurrence count of this string in this file.
  // For an added-and-never-removed citation that is the commit that added it.
  const out = git(['log', '-S', raw, '--format=%H', '--', master]);
  const commits = out ? out.trim().split('\n').filter(Boolean) : [];
  const v = commits.length ? commits[commits.length - 1] : null; // oldest = introduction
  introCache.set(key, v);
  return v;
}

const blobCache = new Map();
function fileAt(rev, file) {
  const key = rev + ':' + file;
  if (blobCache.has(key)) return blobCache.get(key);
  const v = git(['show', `${rev}:${file}`]);
  blobCache.set(key, v);
  return v;
}

// ---- 4. classify ----------------------------------------------------------
const head = git(['rev-parse', 'HEAD']).trim();
const results = [];
let n = 0;
for (const c of citations) {
  n++;
  if (n % 25 === 0) process.stderr.write(`  ...${n}/${citations.length}\n`);
  const intro = introCommit(c.master, c.raw);
  const now = enclosingTitle(fileAt(head, c.spec), c.line);
  const then = intro ? enclosingTitle(fileAt(intro, c.spec), c.line) : { status: 'no-intro' };

  let verdict;
  if (now.status === 'no-file') verdict = 'SPEC-GONE';
  else if (now.status === 'past-eof') verdict = 'PAST-EOF';
  else if (then.status !== 'ok') verdict = 'UNRESOLVED-BASELINE';
  else if ((then.test || null) !== (now.test || null)) verdict = 'DRIFTED';
  else verdict = 'STABLE';

  results.push({ ...c, intro, then, now, verdict });
}

// ---- 5. report ------------------------------------------------------------
const by = {};
for (const r of results) by[r.verdict] = (by[r.verdict] || 0) + 1;

const REPORT = (() => {
  const i = process.argv.indexOf('--report');
  return i > -1 ? process.argv[i + 1] : null;
})();
const _lines = [];
const _origLog = console.log.bind(console);
console.log = (...a) => {
  _lines.push(a.join(' '));
  _origLog(...a);
};
process.on('exit', () => {
  if (REPORT) fs.writeFileSync(REPORT, _lines.join('\n') + '\n');
});

console.log('\n=== s1224 citation-drift audit ===');
console.log(`main HEAD           : ${head}`);
console.log(`master files scanned: ${masters.length}`);
console.log(`citations found     : ${citations.length}`);
console.log(`  of which in a known-reds context: ${citations.filter((c) => c.knownRedContext).length}`);
console.log('\nverdicts:');
for (const [k, v] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(22)} ${v}`);

const bad = results.filter((r) => r.verdict !== 'STABLE');
console.log(`\n--- ${bad.length} non-stable citations ---`);
for (const r of bad.sort((a, b) => Number(b.knownRedContext) - Number(a.knownRedContext))) {
  console.log(
    `\n[${r.verdict}]${r.knownRedContext ? ' [KNOWN-RED CONTEXT]' : ''} ${r.raw}\n` +
      `   master: ${r.master}\n` +
      `   intro : ${r.intro ? r.intro.slice(0, 12) : '(not found)'}\n` +
      `   then  : ${r.then.status === 'ok' ? JSON.stringify(r.then.test) : r.then.status}\n` +
      `   now   : ${r.now.status === 'ok' ? JSON.stringify(r.now.test) : r.now.status + (r.now.eof ? ' (eof ' + r.now.eof + ')' : '')}`,
  );
}

if (OUT) {
  fs.writeFileSync(OUT, JSON.stringify({ head, counts: by, results }, null, 2));
  console.log(`\nwrote ${OUT}`);
}
