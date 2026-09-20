import fs from 'node:fs';
import crypto from 'node:crypto';

const P = 'gate-s1506/src/agent/MechanicsManifest.ts';
const NEW = `    ...manifest.interactables.map(({ id, count }) => count === 1
      ? humanize(id)
      : IRREGULAR_PLURALS[id] ?? \`\${humanize(id)}s\`),`;
const OLD = '    ...manifest.interactables.map(({ id, count }) => `${humanize(id)}${count === 1 ? \'\' : \'s\'}`),';

const mode = process.argv[2];
const src = fs.readFileSync(P, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

if (mode === 'hash') {
  console.log('sha256:' + sha(src));
  console.log('has NEW block:', src.includes(NEW));
  console.log('has OLD line :', src.includes(OLD));
} else if (mode === 'break') {
  if (!src.includes(NEW)) throw new Error('NEW block not found — refusing');
  fs.writeFileSync(P, src.replace(NEW, OLD));
  console.log('REVERTED to pre-cure renderer; sha256:' + sha(fs.readFileSync(P, 'utf8')));
} else if (mode === 'restore') {
  if (!src.includes(OLD)) throw new Error('OLD line not found — refusing');
  fs.writeFileSync(P, src.replace(OLD, NEW));
  console.log('RESTORED; sha256:' + sha(fs.readFileSync(P, 'utf8')));
}
