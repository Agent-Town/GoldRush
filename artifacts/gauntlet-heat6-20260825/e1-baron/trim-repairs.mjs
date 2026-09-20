import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [sourcePath, targetPath] = process.argv.slice(2);
const tape = JSON.parse(readFileSync(sourcePath, 'utf8'));
let repairs = 0;
tape.inputLog.entries = tape.inputLog.entries.filter((entry) => {
  const verbs = entry.a[0]?.orders?.map(({ verb }) => verb).join(',');
  return verbs !== 'REPAIR_UNDER,SET_WEAPON,SET_WEAPON,BLAST_AT' || ++repairs % 5 !== 0;
});
tape.id = `agent-${randomUUID()}`;
writeFileSync(targetPath, `${JSON.stringify(tape)}\n`);
console.log(JSON.stringify({ id: tape.id, entries: tape.inputLog.entries.length, bytes: JSON.stringify(tape).length }));
