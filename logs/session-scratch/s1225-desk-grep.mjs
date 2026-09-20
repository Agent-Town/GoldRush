// s1225 — BACKLOG lines are thousands of chars; grep -n floods. Extract a tight window
// around each match instead, so the desk item can be read as written.
import fs from 'fs';

const [, , file, ...terms] = process.argv;
const win = 320;
const lines = fs.readFileSync(file, 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  for (const t of terms) {
    let from = 0;
    for (;;) {
      const at = lines[i].indexOf(t, from);
      if (at === -1) break;
      const s = Math.max(0, at - win);
      const e = Math.min(lines[i].length, at + t.length + win);
      console.log(`\n--- ${file}:${i + 1}  [${t}] ---`);
      console.log((s ? '…' : '') + lines[i].slice(s, e) + (e < lines[i].length ? '…' : ''));
      from = at + t.length;
    }
  }
}
