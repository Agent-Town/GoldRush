#!/usr/bin/env node
/**
 * sample-header.mjs — print the 260 chars leading up to the first ROUTED-ITEM
 * run (🔺/🟡/🟥 followed by an F-ID) in line-1s that carry no desk word.
 * What word, if any, introduces the list?
 */
import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const want = new Set(['s1469', 's1464', 's1463', 's1461', 's1455', 's1450']);
const RUN = /(?:🔺|🟡|🟥|🔻|🟢)\s*\**\s*F-\d{3,4}-\d+/;

for (const [i, l] of lines.entries()) {
  const m = l.match(/^- \*\*(s\d+) handoff \(line-1 archive\):\*\*/);
  if (!m || !want.has(m[1])) continue;
  const at = l.search(RUN);
  console.log(`\n===== ${m[1]} @${i + 1} — first routed item at char ${at} of ${l.length} =====`);
  if (at === -1) { console.log('  (no routed-item run at all)'); continue; }
  console.log('  LEAD-IN: …' + l.slice(Math.max(0, at - 260), at).replace(/\s+/g, ' '));
  console.log('  ITEMS  : ' + l.slice(at, at + 160).replace(/\s+/g, ' ') + '…');
}
