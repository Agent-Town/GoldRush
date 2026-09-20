import fs from 'node:fs';
const p = 'docs/bench/e5-readiness-census.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
if (!lines[124].startsWith('<<<<<<<') || !lines[146].startsWith('=======') || !lines[154].startsWith('>>>>>>>')) {
  throw new Error('hunk4 boundaries moved — refusing to write');
}
const mainSide = lines.slice(125, 146);  // E5-4 body, E5-5 socket stub, E5-6
const brSide = lines.slice(147, 154);    // E5-4 body ("Unchanged."), branch's own E5-5

// The two sides' E5-4 bodies are the same finding; main's is kept. The branch's E5-5 is a DIFFERENT
// finding that collided on the number — renumber it to E5-7 and say so in place.
const brE55 = brSide.slice(2); // heading + blank + two paragraphs
if (!brE55[0].startsWith('### F-ER01-E5-5')) throw new Error('branch E5-5 heading not where expected: ' + brE55[0]);
const renumbered = brE55.slice();
renumbered[0] = "### F-ER01-E5-7 — The Claim's levers exist on the consumer and not on the agent surface (NEW)";

const out = [
  ...mainSide,
  '',
  '> ⚠️ **F-ID COLLISION, RESOLVED AT MERGE (s1498).** `milk/deepwater-surgery` and `milk/twin-sockets` were authored in',
  '> parallel against this same census and **both minted `F-ER01-E5-5` for different findings** — the surgery pass for the',
  '> socket-shape stub above, the socket pass for the finding below. Neither branch could see the other. The stub keeps the',
  '> number (it is cited by name from two banners above and from `reviews/milk-deepwater-surgery.md`); the socket pass\'s',
  '> finding is **renumbered E5-7** here, with its text otherwise untouched. Nothing was dropped.',
  ...renumbered,
];
const merged = [...lines.slice(0, 124), ...out, ...lines.slice(155)];
fs.writeFileSync(p, merged.join('\n'));
console.log('markers left:', (merged.join('\n').match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length);
