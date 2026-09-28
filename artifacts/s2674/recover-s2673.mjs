// My lock commit used `set`, which does NOT archive (status-line1.mjs:44-53). So s2673's handoff
// line-1 has survived this fire in git alone. Recover it and put it on the board as a bullet --
// the act status-archive-audit.mjs exists to score, and the one a fire that dies never performs.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const git = (...a) => execFileSync('git', ['-C', REPO, ...a], { encoding: 'utf8', maxBuffer: 256 << 20 });

// 7d44378d2 is THIS fire's lock commit; its parent's line 1 is s2673's handoff, by construction.
const LOCK = '7d44378d2';
const prevBlob = git('show', `${LOCK}^:STATUS.md`);
const s2673Line = prevBlob.slice(0, prevBlob.indexOf('\n'));

if (!/s2673 handoff/.test(s2673Line)) throw new Error('recovered line is not s2673 handoff -- STOP');

const lines = fs.readFileSync(`${REPO}/STATUS.md`, 'utf8').split('\n');

// VERIFY-DON'T-INHERIT: is it already archived below? (Same predicate the tool uses, :140-142.)
const already = lines.some((line, i) =>
  i > 0 && /^- \*\*.+ \(line-1 archive\):\*\*/.test(line) && line.includes(s2673Line));
console.log('s2673 line chars :', s2673Line.length);
console.log('already archived :', already);
if (already) { console.log('nothing to do'); process.exit(0); }

const bullet = `- **s2673 handoff (line-1 archive, RESTORED s2674 from \`${LOCK}^\` — this fire's lock commit used \`set\`, which does not archive):** ${s2673Line}`;
const firstArchive = lines.findIndex((line, i) => i > 0 && /^- \*\*.+ \(line-1 archive\):\*\*/.test(line));
if (firstArchive === -1) throw new Error('no existing archive bullet found -- STOP, placement unverified');
lines.splice(firstArchive, 0, bullet);
fs.writeFileSync(`${REPO}/STATUS.md`, lines.join('\n'));
console.log('inserted at line', firstArchive + 1);
