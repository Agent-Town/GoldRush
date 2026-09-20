#!/usr/bin/env node
/**
 * sample-nodesk.mjs — 632 line-1s have no desk word. Do they route owner items
 * under a DIFFERENT vocabulary, or do they genuinely carry no desk?
 *
 * If it is the former, requiring a desk header would fail closed on half the
 * corpus and the cure is worse than the bug.
 */
import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const WORD = /OWNER(?:'S|’S|S)? DESK/;
const want = new Set(['s1469', 's1468', 's1466', 's1465', 's1464', 's1463', 's1462', 's1461']);

for (const [i, l] of lines.entries()) {
  const m = l.match(/^- \*\*(s\d+) handoff \(line-1 archive\):\*\*/);
  if (!m || !want.has(m[1])) continue;
  const body = l;
  console.log(`\n===== ${m[1]} @${i + 1}  (desk word: ${WORD.test(body) ? 'YES' : 'no'}) =====`);
  // Print every span mentioning OWNER, DESK, or the routing glyph 🔺.
  const hits = [
    ...body.matchAll(/.{0,70}(OWNER|DESK|🔺)/g),
  ].slice(0, 6);
  for (const h of hits) console.log('  …' + h[0].replace(/\s+/g, ' ').slice(-90));
  if (!hits.length) console.log('  (no OWNER / DESK / 🔺 anywhere)');
}
