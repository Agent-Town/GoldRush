// s1189: verify the row-order survey's published evidence hashes on the MERGED tree.
// The report publishes SHA-256 for three contact sheets; a drain that merges art
// evidence should prove it merged the bytes the runner measured, not similar bytes.
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const published = {
  'rowsurvey-coal-thief.png': 'ea2fb5e22a100a957c8100a2aa40fcc3176091efdbcad57f5b0d20ec22186f4d',
  'rowsurvey-rail-tough.png': '6b1b240e6ac83cf54ad09d5c92b74edc6244586bf72f6e95bbaa2ada14801c6c',
  'rowsurvey-steam-wrecker.png': '997557493a7e1c4145054d1fb1988e68510070a96c700669aa91fd4c52417d2c',
};

let allMatch = true;
for (const [name, expected] of Object.entries(published)) {
  const path = `artifacts/eight-winds-e2/${name}`;
  const bytes = fs.readFileSync(path);
  const actual = createHash('sha256').update(bytes).digest('hex');
  const ok = actual === expected;
  if (!ok) allMatch = false;
  console.log(`${ok ? 'MATCH  ' : 'MISMATCH'} ${name}  ${(bytes.length / 1024 / 1024).toFixed(2)} MB`);
  if (!ok) console.log(`         published ${expected}\n         merged    ${actual}`);
}

console.log(allMatch ? 'ALL THREE MATCH the published hashes' : 'HASH MISMATCH — do not merge');
process.exit(allMatch ? 0 : 1);
