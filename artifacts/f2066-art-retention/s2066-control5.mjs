import { execFileSync } from 'node:child_process';
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', 'main', 'assets/'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean);
for (const pat of ['jumper', 'crawler', 'lineup', 'rotation']) {
  const hits = files.filter(f => f.toLowerCase().includes(pat));
  console.log('main assets matching "' + pat + '":', hits.length);
  for (const h of hits.slice(0, 8)) console.log('   ', h);
}
// are the 3 contact-sheet lineups in git anywhere (any ref)?
import { execSync } from 'node:child_process';
for (const p of ['assets/contact-sheets/char-hero-four-ages-lineup.png',
                 'assets/contact-sheets/char-prospector-three-coat-lineup.png',
                 'assets/contact-sheets/char-tailor-release-lineup.png']) {
  let found = '';
  try {
    found = execSync('git log --all --oneline --diff-filter=A -- ' + JSON.stringify(p) + ' | head -2', { encoding: 'utf8' }).trim();
  } catch (e) { found = 'ERR'; }
  console.log(p, '=> added in:', found || '(no ref)');
}
