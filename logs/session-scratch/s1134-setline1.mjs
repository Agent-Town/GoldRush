import { readFileSync, writeFileSync } from 'node:fs';
// usage: node s1134-setline1.mjs <newline-file> [archive-label]
const statusPath = 'STATUS.md';
const newLine = readFileSync(process.argv[2], 'utf8').replace(/\n+$/, '');
const label = process.argv[3];
const raw = readFileSync(statusPath, 'utf8');
const nl = raw.indexOf('\n');
const oldLine = raw.slice(0, nl);
const rest = raw.slice(nl + 1);
const bullet = label ? `- **${label} (line-1 archive):** ${oldLine}\n` : '';
writeFileSync(statusPath, newLine + '\n' + bullet + rest);
console.log('OLD:', oldLine.slice(0, 80));
console.log('NEW:', newLine.slice(0, 80));
console.log('archived as:', label || '(none)');
