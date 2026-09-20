import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
lines.slice(0, 2).forEach((l, i) => {
  const re = /ACTIVE 2/g;
  let m;
  while ((m = re.exec(l))) {
    console.log(`line ${i + 1} @${m.index}: ...${l.slice(Math.max(0, m.index - 90), m.index + 60)}...`);
  }
});
