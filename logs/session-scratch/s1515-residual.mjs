// Is the union a CURE or a BACKSTOP? Both scanners still consume delimiters greedily
// via a global lastIndex. Hypothesis: an ODD number of same-kind delimiters before the
// title defeats BOTH arms, so the union does not cover it.
// Probe the real regexes from the merged guard, no stubs.
const QUOTED = /["“”'‘’`]([^"“”'‘’`\n]{12,160})["“”'‘’`]/g;
const QUOTED_BY_KIND = /"([^"\n]{12,160})"|“([^”\n]{12,160})”|'([^'\n]{12,160})'|‘([^’\n]{12,160})’|`([^`\n]{12,160})`/g;

const TITLE = 'hash mismatch pauses, shows the wire card, and restores from relay snapshot';

const cases = [
  ['CURED (the slice own case): short code span between two titles',
   `Previously titled "a retired title that is definitely long enough", then \`old\` and is now titled "${TITLE}".`],
  ['CURED: bare apostrophe before the title',
   `Previously titled "a retired title that is definitely long enough"; the scanner's own record now calls it "${TITLE}".`],
  ['RESIDUAL?: ODD count of same-kind quotes before the title',
   `he said "foo and then some prose "${TITLE}".`],
];

function captures(win, pattern) {
  pattern.lastIndex = 0;
  const out = [];
  let m;
  while ((m = pattern.exec(win))) out.push(m.slice(1).find((c) => c !== undefined));
  return out;
}

for (const [label, win] of cases) {
  const loose = captures(win, QUOTED);
  const byKind = captures(win, QUOTED_BY_KIND);
  const union = [...loose, ...byKind];
  const found = union.includes(TITLE);
  console.log(`\n--- ${label}`);
  console.log('  loose  :', JSON.stringify(loose));
  console.log('  by-kind:', JSON.stringify(byKind));
  console.log('  TITLE RECOVERED BY UNION:', found ? 'YES' : 'NO  <-- residual');
}
