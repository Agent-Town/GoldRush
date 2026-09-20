import fs from 'node:fs';
const root = '/Users/robin/Claude/Projects/Gold Rush';
const target = root + '/gate-s1477/node_modules';
if (!fs.existsSync(target)) fs.symlinkSync(root + '/node_modules', target, 'dir');
console.log('playwright present: ' + fs.existsSync(target + '/.bin/playwright'));
