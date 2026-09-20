// s1200 — independent mutation control for the run-tree-invariance slice.
// Mutates the SUBJECT (never the guard), asserts the new guards go red, restores, re-hashes.
// Committed per the RETENTION LAW.
import fs from 'node:fs';
import crypto from 'node:crypto';

const SUBJECT = 'scripts/suite-red-inventory.mjs';
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const mode = process.argv[2];
const pristine = '/tmp/s1200-subject-pristine.mjs';

if (mode === 'save') {
  fs.copyFileSync(SUBJECT, pristine);
  console.log(`pristine sha256 ${sha(SUBJECT)}`);
} else if (mode === 'restore') {
  fs.copyFileSync(pristine, SUBJECT);
  console.log(`restored sha256 ${sha(SUBJECT)}`);
} else if (mode === 'mutate') {
  // m-own-1: revert relative()'s cure — resolve absolute paths against the SCRIPT's root
  // again instead of the raw's recorded tree. This is precisely the F-1198-2 defect.
  const src = fs.readFileSync(pristine, 'utf8');
  const from = 'if (path.isAbsolute(file)) return path.relative(runRoot, file).replaceAll(path.sep, \'/\');';
  const to = 'if (path.isAbsolute(file)) return path.relative(ROOT, file).replaceAll(path.sep, \'/\');';
  if (!src.includes(from)) throw new Error('mutation anchor not found — subject moved');
  fs.writeFileSync(SUBJECT, src.replace(from, to));
  console.log(`mutated sha256 ${sha(SUBJECT)}`);
} else if (mode === 'mutate2') {
  // m-own-2: revert the ranking cure — unresolved rows fall back to the ?? 100 default,
  // which is the "could-not-measure wearing the costume of measured-lowest-risk" defect.
  const src = fs.readFileSync(pristine, 'utf8');
  const from = 'const measured = ratios.flatMap(({ body }) => body?.percent === undefined ? [] : [body.percent]);\n  masking.push({ values, ratios, risk: measured.length ? Math.min(...measured) : undefined });';
  const to = 'masking.push({ values, ratios, risk: Math.min(...ratios.map(({ body }) => body?.percent ?? 100)) });';
  if (!src.includes(from)) throw new Error('mutation2 anchor not found — subject moved');
  fs.writeFileSync(SUBJECT, src.replace(from, to));
  console.log(`mutated2 sha256 ${sha(SUBJECT)}`);
} else {
  console.log(`sha256 ${sha(SUBJECT)}`);
}
