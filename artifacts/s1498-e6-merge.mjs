import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const P = 'docs/bench/e6-readiness-census.md';
const show = (ref) => execFileSync('git', ['show', `${ref}:${P}`], { encoding: 'utf8' }).split('\n');
const main = show('HEAD');
const br = show('milk/twin-sockets');

// --- slice helpers: a section runs from its "### <id>" heading to the next "### " (exclusive)
function section(lines, id) {
  const start = lines.findIndex((l) => l.startsWith(`### ${id} `));
  if (start < 0) throw new Error(`section ${id} not found`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (lines[i].startsWith('### ')) { end = i; break; }
  while (end > start && lines[end - 1].trim() === '') end--;
  return lines.slice(start, end);
}

// --- EXECUTIVE SUMMARY: branch's counts (measured with the socket live) + main's two cure bullets,
// which the branch could not see because saga-surgeon had not merged when it was authored.
const brSumStart = br.indexOf('## EXECUTIVE SUMMARY');
const brSumEnd = br.indexOf('## CENSUS');
const brBullets = br.slice(brSumStart + 1, brSumEnd).filter((l) => l.trim() !== '');
const mainBullets = main.slice(main.indexOf('## EXECUTIVE SUMMARY') + 1, main.indexOf('## CENSUS')).filter((l) => l.trim() !== '');
const cureBullet = mainBullets.find((l) => l.includes('milk/saga-surgeon'));
const denomBullet = mainBullets.find((l) => l.includes('F-MILK-SS-1'));
if (!cureBullet || !denomBullet) throw new Error('main cure bullets not found');

const summary = ['## EXECUTIVE SUMMARY', '', ...brBullets, cureBullet, denomBullet, ''];

// --- FINDINGS: branch's rewritten bodies are LIVE (they are the socket-live measurement); main's
// saga-surgeon NARROWED banners + the pre-socket originals are retained beneath each, per this
// census's own "retained verbatim, bannered, never deleted" convention.
const ids = ['F-ER01-E6-1', 'F-ER01-E6-2', 'F-ER01-E6-3', 'F-ER01-E6-4'];
const findings = ['## FINDINGS', ''];
findings.push(...section(br, 'F-ER01-E6-5'), '');
for (const id of ids) {
  findings.push(...section(br, id), '');
  const old = section(main, id);
  findings.push(
    `> 🗄️ **RETAINED — the pre-socket text of ${id}, plus \`milk/saga-surgeon\`'s declaration cure.** Both were`,
    '> written before the Atomic socket existed and are superseded as a *measurement* by the body above; the',
    '> declaration cure they record is **still live and still true** (all four Atomic contracts declare their',
    '> missing era socket). Kept because a census that deletes its own history cannot show its work.',
    '>',
    ...old.slice(1).filter((l) => l.trim() !== '').map((l) => `> ${l}`),
    '',
  );
}
findings.push(...section(main, 'F-MILK-SS-1'), '');
findings.push(...section(main, 'F-MILK-SS-2'), '');

const head = br.slice(0, brSumStart);
const census = br.slice(brSumEnd, br.indexOf('## FINDINGS'));
const out = [...head, ...summary, ...census, ...findings];
fs.writeFileSync(P, out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
const txt = fs.readFileSync(P, 'utf8');
console.log('markers left:', (txt.match(/^(<<<<<<<|=======|>>>>>>>)/gm) || []).length);
console.log('headings:', (txt.match(/^### .*/gm) || []).join('\n  '));
