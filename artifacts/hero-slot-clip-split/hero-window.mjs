// Composition of the hero's runtime slot inside the first-town cue window, by clip group.
// Reads the deploy instrument's own corpus (artifacts/asset-diet/town-transfer-<project>.json).
import { readFileSync } from 'node:fs';

const HERO_SHEETS = {
  'char-hero-sheet-work8': 'claim (pan)',
  'char-hero-sheet-attack8': 'claim (attack)',
};
const label = (base) => {
  const stem = base.replace(/-r\d+c\d+(?=[-.])/, '').replace(/-[A-Za-z0-9_-]{8}-diet-[0-9a-f]{8}\./, '.').replace(/-[A-Za-z0-9_-]{8}\./, '.');
  return stem;
};
for (const project of ['desktop-chrome', 'mobile-chrome']) {
  const file = process.argv[2] ?? `artifacts/asset-diet/town-transfer-${project}.json`;
  const path = process.argv[2] ? `${process.argv[2]}/town-transfer-${project}.json` : file;
  const { cueWindowResponses } = JSON.parse(readFileSync(path, 'utf8'));
  const rows = new Map();
  let heroBytes = 0, heroCount = 0, total = 0;
  for (const { url, bytes } of cueWindowResponses) {
    total += bytes;
    const base = url.split('?')[0].split('/').pop() ?? '';
    if (!base.startsWith('char-hero-')) continue;
    heroBytes += bytes; heroCount += 1;
    const sheet = base.replace(/-r\d+c\d+.*$/, '').replace(/-[A-Za-z0-9_-]{8}(-diet-[0-9a-f]{8})?\.\w+$/, '');
    const group = HERO_SHEETS[sheet] ?? 'town';
    const key = `${group}\t${sheet}\t${base.endsWith('.png') ? 'png' : 'js'}`;
    const row = rows.get(key) ?? { bytes: 0, count: 0 };
    row.bytes += bytes; row.count += 1;
    rows.set(key, row);
  }
  console.log(`\n== ${project}: window total ${total} B, hero slot ${heroBytes} B in ${heroCount} responses ==`);
  const byGroup = new Map();
  for (const [key, row] of [...rows.entries()].sort()) {
    const [group, sheet, kind] = key.split('\t');
    console.log(`  ${group.padEnd(16)} ${sheet.padEnd(34)} ${kind}  ${String(row.count).padStart(4)} resp  ${String(row.bytes).padStart(9)} B`);
    const g = byGroup.get(group) ?? { bytes: 0, count: 0 };
    g.bytes += row.bytes; g.count += row.count; byGroup.set(group, g);
  }
  console.log('  ---');
  for (const [group, g] of [...byGroup.entries()].sort()) console.log(`  GROUP ${group.padEnd(16)} ${String(g.count).padStart(4)} resp  ${String(g.bytes).padStart(9)} B`);
}
