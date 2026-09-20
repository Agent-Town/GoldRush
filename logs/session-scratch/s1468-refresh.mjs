// s1468: refresh the ACTIVE stamp after a completed drain (§2 keeps the 45-min check honest).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
lines[0] = `ACTIVE ${stamp} (s1468 fire) — f1467-1-alpha-recipe-ab MERGED 8e3c1491; board DRY, authoring next lane master`;
writeFileSync(P, lines.join('\n'));
console.log(lines[0]);
