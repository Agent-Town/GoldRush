// s1662 GZ-01 duty: one news item for the public-door change.
// public/skill.md is the BYO-agent door doc, so this IS player/agent-facing.
// Frontier speak per the 063 voice law; canon §9 — no firearms, ever.
// Deliberately does NOT repeat the over-generalisation filed as F-1662-3:
// only two of the three ran to the ceiling, so the copy says nothing about ceilings.
// Usage: node s1662-gazette.mjs <short-hash>
import { readFileSync, writeFileSync } from 'node:fs';

const short = process.argv[2];
if (!/^[0-9a-f]{8,9}$/.test(short || '')) throw new Error('need the short merge hash');

const P = 'marketing/outbox/gazette-queue.md';
const item = [
  '',
  '## The County Stopped Advertising Claims No Rider Can Win',
  '- Three railcar claims sat on the public door where any hired hand could take one up alone.',
  '- Nothing the county builds reaches an ore cart, so a rider who took one could not finish it.',
  '- They are named refused-with-cause again, and open only to a rider who declares the escort.',
  `- merge: \`${short}\` (f1660-1 door readmission repair) · review: \`reviews/f1660-1-door-readmission-repair.md\` · restores \`88530e3ef\``,
  '',
].join('\n');

const raw = readFileSync(P, 'utf8');
if (raw.includes(short)) throw new Error('hash already cited in the queue — refusing to duplicate');
writeFileSync(P, raw.replace(/\s*$/, '\n') + item);
console.log('gazette item appended for', short);
