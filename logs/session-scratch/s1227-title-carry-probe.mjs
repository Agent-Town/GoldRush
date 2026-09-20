#!/usr/bin/env node
// s1227 — measure the CHEAP HALF of the known-reds citation question.
//
// s1224 (F-1224-1) measured POINTER ROT: 38/300 forward-looking `spec:line` citations no
// longer name the test they were written for. Its recommendation — and the half the owner's
// desk marks "needs no ruling" — is narrower than a schema change:
//
//     a citation that carries its test title survives its line number moving.
//
// So the thing to measure is NOT whether the line drifted. It is whether the citation is
// RECOVERABLE: does the prose around it quote a string that is an actual test title in that
// spec, as the spec stands today? If yes, a future reader can re-find the subject with grep
// no matter where the line went. If no, the citation is a bare coordinate and rot is fatal.
//
// This is deliberately a different question from s1224's, and it is the one the cure answers.
//
// Usage: node s1227-title-carry-probe.mjs <file> [file...]

import fs from 'node:fs';

const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g;
// title declarations in a playwright spec
const TITLE_DECL = /^\s*(?:test|it)(?:\.\w+)*\s*\(\s*(['"`])([\s\S]*?)\1/gm;
// any quoted run in prose: straight, typographic, or backticked
const QUOTED = /["“”'‘’`]([^"“”'‘’`\n]{12,160})["“”'‘’`]/g;

const WINDOW = 400; // chars either side of the citation
const MIN_PREFIX = 20; // a truncated quote still counts if it is a long enough prefix

function titlesOf(spec) {
  if (!fs.existsSync(spec)) return null;
  const src = fs.readFileSync(spec, 'utf8');
  const out = [];
  let m;
  TITLE_DECL.lastIndex = 0;
  while ((m = TITLE_DECL.exec(src))) out.push(m[2]);
  return out;
}

// A doc almost never quotes a title verbatim. The three real shapes, all of which a future
// reader can grep back to the subject, and all of which must therefore count:
//   1. exact / prefix        "hero stops in the shallows"
//   2. ELIDED in the MIDDLE  "hash mismatch … restores from relay snapshot"
//   3. title + trailing prose
// Shape 2 is the one that matters: it is how this repo's prose actually cites, and scoring it
// NUMBER-ONLY understates recoverability. s1224 hit this same false negative on this same
// mp-02-lockstep entry and caught it only by hand; encoding it is the fix.
function matchesATitle(quote, titles) {
  const q = quote.trim().replace(/[….]+$/, '').trim();
  if (q.length < MIN_PREFIX) return null;
  const frags = q
    .split(/\s*(?:…|\.\.\.)\s*/)
    .map((f) => f.trim())
    .filter(Boolean);
  for (const t of titles) {
    if (t === q) return t;
    if (t.startsWith(q)) return t; // doc truncated the title
    if (q.startsWith(t) && t.length >= MIN_PREFIX) return t; // doc quoted title + trailing words
    if (frags.length > 1) {
      // every fragment must appear, in order, inside one title
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

const files = process.argv.slice(2);
const specCache = new Map();
const rows = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let hit;
  CITE.lastIndex = 0;
  while ((hit = CITE.exec(text))) {
    const spec = hit[1].replace(/^.*?(e2e\/)/, '$1');
    const line = Number(hit[2]);
    if (!specCache.has(spec)) specCache.set(spec, titlesOf(spec));
    const titles = specCache.get(spec);

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
    rows.push({ file, raw: hit[0], spec, line, verdict, carried });
  }
}

const counts = {};
for (const r of rows) counts[r.verdict] = (counts[r.verdict] || 0) + 1;

console.log('=== s1227 title-carry probe ===');
console.log(`files scanned : ${files.length}`);
console.log(`citations     : ${rows.length}`);
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(15)} ${v}`);
}
console.log('\n--- NUMBER-ONLY (not recoverable if the line moves) ---');
for (const r of rows.filter((r) => r.verdict === 'NUMBER-ONLY')) {
  console.log(`  ${r.raw}   [${r.file}]`);
}
console.log('\n--- SPEC-GONE ---');
for (const r of rows.filter((r) => r.verdict === 'SPEC-GONE')) {
  console.log(`  ${r.raw}   [${r.file}]`);
}
