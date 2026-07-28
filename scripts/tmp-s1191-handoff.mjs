import { readFileSync, writeFileSync } from 'node:fs';

const NEW = readFileSync('/tmp/s1191-line1.txt', 'utf8').replace(/\n+$/, '');
const raw = readFileSync('STATUS.md', 'utf8');
const lines = raw.split('\n');
const old = lines[0];
if (!/^ACTIVE .*s1191 fire/.test(old)) {
  console.error('REFUSING: line 1 is not my s1191 lock. Found:', old.slice(0, 120));
  process.exit(1);
}
lines[0] = NEW;
lines.splice(1, 0, `- **s1191 lock (line-1 archive):** ${old}`);
writeFileSync('STATUS.md', lines.join('\n'));
console.log('handoff written;', NEW.length, 'chars; archived s1191 lock');
