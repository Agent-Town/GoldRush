import fs from 'node:fs';

const P = 'tasks/goals.json';
const lines = fs.readFileSync(P, 'utf8').split('\n');

const idx = lines.findIndex((l) => l.includes('"id": "sea-3-season1-content"'));
if (idx < 0) throw new Error('REFUSE: sea-3 leaf not found');
const statusLine = lines.findIndex((l, i) => i > idx && l.includes('"status"'));
if (statusLine < 0 || statusLine > idx + 4) throw new Error('REFUSE: status line not adjacent');
if (lines.slice(idx, idx + 6).some((l) => l.includes('authoringBlock'))) throw new Error('REFUSE: already priced');

const indent = lines[idx].match(/^\s*/)[0];
const block = {
  class: 'attended-owed',
  finding: 'F-1639-3',
  measuredBy: 's1663 2026-08-11 (re-verified at source; first raised s1639 2026-08-10)',
  reason: 'NOT fire-authorable, and the blocker is NOT the prose - it is WHERE THE PROSE LIVES. specs/seasons/seasons-v1.md:23 explicitly permits SEA-3 to be "fire-drafted-from-sources", so a fire may WRITE the content; what a fire may not do is invent the storage seam it lands in. MEASURED AT SOURCE s1663, not inherited from the s1639 finding: src/seasons/registry.ts has NO commentary or lessons field (grep for either returns 0), and src/encyclopedia/reader.ts:457-464 still hardcodes both empty states inline - a season-commentary section reading "The county\'s commentary has not yet been written." and a season-learned section reading "The lessons ledger has not yet been written." (grep "has not yet been written" -> 2). So there is nowhere to put SEA-3 that the reader would render. WHY THE STORAGE DECISION IS ATTENDED-OWED RATHER THAN A FIRE CALL: it touches the lore-wiki seam (CLAUDE.md 9b - all CONTENT facts belong in lore/, cited and dated), so choosing between a registry field, a content module and a lore/ page is a small architecture decision with a canon dimension, which is exactly the class 2E forbids a fire to invent. TWO FIRES HAVE NOW PAID FOR THIS: s1639 derived it and filed F-1639-3, and s1663 re-derived it from scratch because the leaf carried no price. NEARLY A THIRD FALSE NEGATIVE, RECORDED BECAUSE IT IS THE REUSABLE HALF: s1663 first grepped "not yet written" - a PARAPHRASE of the file\'s actual "has not yet been written" - got 0 hits, and came within one step of concluding the premise had decayed and the leaf was authorable. Grep the DOCUMENT\'S words, never your memory of them. WHAT WOULD UNPRICE THIS: an attended session ruling where season commentary lives; after that the content itself is fire-drafted-from-sources per the spec, and this leaf becomes authorable with no owner word.',
};

// The status line is the LAST property of this leaf, so it carries no trailing comma.
// Inserting after it therefore requires ADDING one there and omitting one on the new
// block — the first draft did neither and produced invalid JSON (caught by re-running
// the instrument, not by inspection).
if (lines[statusLine].trimEnd().endsWith(',')) throw new Error('REFUSE: status line already has a comma — re-read the leaf before splicing');
lines[statusLine] = `${lines[statusLine]},`;

const json = JSON.stringify(block, null, 2).split('\n').map((l, i) => (i === 0 ? `${indent}"authoringBlock": ${l}` : indent + l));

lines.splice(statusLine + 1, 0, ...json);
fs.writeFileSync(P, lines.join('\n'));
console.log(`ok: priced sea-3-season1-content with ${json.length} lines`);
