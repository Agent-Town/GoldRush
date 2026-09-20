// F-1514-1 probe: does "pair quotes by KIND" actually make F-1501-5's gate true?
// Reconstructs the window F-1501-5 describes and runs BOTH regexes over it.

const CURRENT = /["“”'‘’`]([^"“”'‘’`\n]{12,160})["“”'‘’`]/g;

// candidate cure: pair by kind. Backtick with backtick; the double family with
// the double family; the single/apostrophe family with itself.
const BYKIND = new RegExp(
  [
    '`([^`\\n]{12,160})`',
    '["“”]([^"“”\\n]{12,160})["“”]',
    "['‘’]([^'‘’\\n]{12,160})['‘’]",
  ].join('|'),
  'g',
);

const caps = (re, s) => {
  re.lastIndex = 0;
  const out = [];
  let m;
  while ((m = re.exec(s))) out.push(m.slice(1).find((x) => x !== undefined));
  return out;
};

const OLD = 'all five E1 mechanics manifests match their byte-stable fixture';
const NEW = 'all six E1 mechanics manifests match their byte-stable fixture';

// the real shape: old title, a SHORT (8-char) backticked hash, then the new title
const win = `cites "${OLD}") (that test was RENAMED at \`8fa0133f\` and is now titled "${NEW}")`;

console.log('=== WINDOW ===');
console.log(win);
for (const [name, re] of [['CURRENT', CURRENT], ['BY-KIND', BYKIND]]) {
  const c = caps(re, win);
  console.log(`\n=== ${name} ===`);
  c.forEach((x, i) => console.log(`  [${i}] ${JSON.stringify(x)}`));
  console.log(`  sees NEW title? ${c.includes(NEW) ? 'YES' : 'NO'}`);
}

// sibling case F-1501-5 predicts: a bare apostrophe in prose between two titles
const win2 = `cites "${OLD}") (the guard's own scanner) now titled "${NEW}")`;
console.log('\n\n=== SIBLING WINDOW (apostrophe) ===');
console.log(win2);
for (const [name, re] of [['CURRENT', CURRENT], ['BY-KIND', BYKIND]]) {
  const c = caps(re, win2);
  console.log(`\n=== ${name} ===`);
  c.forEach((x, i) => console.log(`  [${i}] ${JSON.stringify(x)}`));
  console.log(`  sees NEW title? ${c.includes(NEW) ? 'YES' : 'NO'}`);
}
