// s1144 helper: rewrite STATUS.md line-1 (and optionally archive the prior line-1 as a bullet).
// The bash gate reads backticks in an inline `node -e` as a subshell, so this lives in a file.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , mode, payloadPath] = process.argv;
const STATUS = 'STATUS.md';
const lines = readFileSync(STATUS, 'utf8').split('\n');
const newLine1 = readFileSync(payloadPath, 'utf8').replace(/\n+$/, '');
const prev = lines[0];

if (mode === 'lock') {
  lines[0] = newLine1;
} else if (mode === 'handoff') {
  // Archive the previous line-1 as a bullet immediately after the law bullets block.
  lines[0] = newLine1;
  // find the first existing "- **s" archive bullet and insert above it
  const idx = lines.findIndex((l) => l.startsWith('- **s') && l.includes('(line-1 archive)'));
  const bullet = '- **s1143 handoff (line-1 archive):** ' + prev.replace(/^Last updated: /, '');
  if (idx === -1) lines.splice(1, 0, '', bullet);
  else lines.splice(idx, 0, bullet);
} else {
  throw new Error('mode must be lock|handoff');
}
writeFileSync(STATUS, lines.join('\n'));
console.log('STATUS line-1 updated (' + mode + '), length ' + newLine1.length);
