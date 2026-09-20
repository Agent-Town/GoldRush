// s1588: extract the desk I INHERITED (s1587's archived line-1) into a temp file so
// desk-state-audit can classify it. The tool correctly SKIPs a live ACTIVE lock line
// (F-1566-1), and a lock line is what STATUS.md line 1 holds for a fire's whole life —
// so the question it can actually answer is "what did I inherit, and is any of it closed?"
import fs from 'node:fs';

const status = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const archive = status.find((l) => l.startsWith('- **s1587 handoff (line-1 archive):**'));
if (!archive) { console.error('no s1587 archive bullet'); process.exit(2); }
const line = archive.replace(/^- \*\*s1587 handoff \(line-1 archive\):\*\* /, '');
fs.writeFileSync('artifacts/s1588-inherited-line1.txt', `${line}\n`);
console.log(`wrote artifacts/s1588-inherited-line1.txt (${line.length} chars)`);
