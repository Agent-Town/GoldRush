import { readFileSync } from 'node:fs';
const l = readFileSync('STATUS.md', 'utf8').split('\n')[0];
const hdr = "OWNER" + String.fromCharCode(39) + "S DESK";
const i = l.lastIndexOf(hdr);
const seg = l.slice(i);
console.log('header:', JSON.stringify(seg.slice(0, 45)));
console.log('items (triangles minus header):', (seg.match(/\u{1F53A}/gu) || []).length - 1);
