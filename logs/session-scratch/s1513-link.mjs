import { symlinkSync, existsSync, lstatSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const target = `${ROOT}/node_modules`;
const link = `${ROOT}/gate-s1513/node_modules`;

console.log('main node_modules exists:', existsSync(target));
if (existsSync(link) || lstatSync(link, { throwIfNoEntry: false })) {
  console.log('link already present:', lstatSync(link).isSymbolicLink() ? 'symlink' : 'REAL DIR');
} else {
  symlinkSync(target, link);
  console.log('symlinked gate-s1513/node_modules ->', target);
}
