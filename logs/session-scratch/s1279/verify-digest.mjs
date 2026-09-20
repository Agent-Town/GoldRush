// s1279: verify the 07-30 digest against the tree.
// (1) every cited hash resolves, is an ancestor of main, and its committer date is inside
//     the coverage day 2026-07-30 local (+07);
// (2) every bullet micro-headline is <=140 chars (TK-01 law), measured on the headline text
//     with the hash refs stripped.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const git = (a) => execFileSync('git', a, { maxBuffer: 1e9 }).toString().trim();
const file = 'marketing/outbox/ticker-digest-2026-07-30.md';
const text = readFileSync(file, 'utf8');

const hashes = [...new Set([...text.matchAll(/`([0-9a-f]{8})`/g)].map((m) => m[1]))];
let bad = 0;
for (const h of hashes) {
  let full, when, subj, anc;
  try {
    full = git(['rev-parse', h]);
    when = git(['log', '-1', '--format=%cI', full]);
    subj = git(['log', '-1', '--format=%s', full]);
    anc = execFileSync('git', ['merge-base', '--is-ancestor', full, 'main'],
      { stdio: 'pipe' }) !== undefined;
  } catch (e) {
    console.log('UNRESOLVED', h, e.message.split('\n')[0]);
    bad++;
    continue;
  }
  const day = when.slice(0, 10);
  const inDay = day === '2026-07-30';
  if (!inDay) { console.log('OUT-OF-DAY', h, when, subj.slice(0, 60)); bad++; }
  else console.log('OK', h, when.slice(11, 16), 'ancestor-of-main', subj.slice(0, 55));
}
console.log('\nHASHES:', hashes.length, 'BAD:', bad);

// headline length law
const bullets = text.split('\n').filter((l) => /^- /.test(l));
let over = 0;
for (const b of bullets) {
  const headline = b.replace(/^- /, '').replace(/\s*`[0-9a-f]{8}`/g, '').trim();
  if (headline.length > 140) { console.log('OVER', headline.length, headline.slice(0, 80)); over++; }
}
console.log('BULLETS:', bullets.length, 'OVER-140:', over);
console.log(bad === 0 && over === 0 ? 'DIGEST VERIFY: PASS' : 'DIGEST VERIFY: FAIL');
process.exit(bad === 0 && over === 0 ? 0 : 1);
