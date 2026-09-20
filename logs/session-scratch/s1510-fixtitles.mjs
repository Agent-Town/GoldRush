import { readFileSync, writeFileSync } from 'node:fs';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const TITLE = 'Night Shift enemies always make goal progress around object footprints';

const edits = [
  ['tasks/BACKLOG.md',
    '`e2e/never-trap.spec.ts:88` *"the fuzz invariant"* was proven by manufactured defect in the s1445 drain.',
    `\`e2e/never-trap.spec.ts:88\` *"${TITLE}"* was proven by manufactured defect in the s1445 drain. ` +
    '⚠️ **Note the name:** the s1445 review calls it *"the fuzz invariant"*, which is its PARAPHRASE, not its title — ' +
    'a reader grepping for the review\'s phrase finds nothing in the spec.'],
  ['reviews/f1507-2-landmark-routing-bisect.md',
    'zero. That is an engineering fix with a checkable gate (both `never-trap:88` and',
    'zero. That is an engineering fix with a checkable gate (both `e2e/never-trap.spec.ts:88`\n' +
    `("${TITLE}") and`],
  ['tasks/lane-f1510-1-blocker-slide-deadband.md',
    'that re-opens F-BW-10 and `never-trap:88`. The goal is to satisfy **both**.',
    `that re-opens F-BW-10 and \`e2e/never-trap.spec.ts:88\` ("${TITLE}"). The goal is to satisfy **both**.`],
];

for (const [rel, from, to] of edits) {
  const p = `${ROOT}/${rel}`;
  const t = readFileSync(p, 'utf8');
  if (!t.includes(from)) { console.log('MISS', rel); continue; }
  writeFileSync(p, t.replace(from, to));
  console.log('fixed', rel);
}
