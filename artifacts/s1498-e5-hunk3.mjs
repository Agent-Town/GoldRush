import fs from 'node:fs';
const p = 'docs/bench/e5-readiness-census.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
if (!lines[75].startsWith('<<<<<<<') || !lines[100].startsWith('=======') || !lines[114].startsWith('>>>>>>>')) {
  throw new Error('hunk3 boundaries moved — refusing to write');
}
const mainBanner1 = lines.slice(76, 82);   // E5-1 "PARTIALLY CURED" banner
const mainBody1 = lines[83];               // E5-1 superseded 2026-08-05 body
const mainE52 = lines.slice(85, 100);      // "### F-ER01-E5-2" heading + banner + body
const brBody1 = lines.slice(101, 110);     // E5-1 rewritten body (the boss cannot be constructed)

const out = [
  ...mainBanner1,
  '> ✅ **SOCKET HALF NOW CLOSED TOO (`milk/twin-sockets`, merged s1498)** — see the rewritten body directly below. The',
  '> stub this banner points at, **F-ER01-E5-5**, is DISCHARGED; the socket it specified was built.',
  '',
  ...brBody1,
  '',
  '> 🗄️ **SUPERSEDED 2026-08-05 TEXT, retained per the Retention Law** — accurate when written, before either 2026-08-06 pass:',
  '> ' + mainBody1,
  '',
  ...mainE52,
  '',
  '> ⛔ **The `milk/twin-sockets` copy of this finding opened *"Unchanged … the briefing promises six beacon gates"* and was',
  '> **STALE ON ARRIVAL** — the surgery pass had already cured it at `45f54b88`. Struck rather than merged; the banner above is',
  '> the live text. The branch\'s remaining sentences about the missing consumer, the manifest and selectability are identical',
  '> in substance to the body above and add nothing, so nothing else was lost (F-1497-1).',
];
const merged = [...lines.slice(0, 75), ...out, ...lines.slice(115)];
fs.writeFileSync(p, merged.join('\n'));
console.log('markers left:', (merged.join('\n').match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length);
console.log('brBody1[0]:', JSON.stringify(brBody1[0].slice(0, 60)));
console.log('mainE52[0]:', JSON.stringify(mainE52[0]));
