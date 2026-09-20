#!/usr/bin/env node
/** s1586 — WHICH segments of s1585's desk fail to key, and why. */
import fs from 'node:fs';
import { deskTail, deskItems } from '../../../scripts/desk-carryforward-guard.mjs';

const text = fs.readFileSync('STATUS.md', 'utf8');
const line = text.split('\n').find((l) => l.startsWith('- **s1585 handoff (line-1 archive):**'));
const tail = deskTail(line);
const KEY_ZONE = 120;
const FINDING = /F-(?:[A-Z0-9]{1,8}-)+\d+/;
const SLUG = /`([a-z0-9][a-z0-9-]{6,})`/;

console.log('declared:', tail.match(/DESK\s*[—–-]\s*(\d+)\s+awaiting/)[1]);
console.log('parsed  :', deskItems(tail).length);
console.log('segments:', tail.split('🔺').slice(1).length);
console.log('');
tail.split('🔺').slice(1).forEach((seg, i) => {
  const head = seg.slice(0, KEY_ZONE);
  const f = head.match(FINDING);
  const s = head.match(SLUG);
  const key = f && (!s || f.index <= s.index) ? f[0] : s ? s[1] : null;
  if (!key) console.log(`UNKEYED seg#${i + 1}: ${JSON.stringify(head.slice(0, 90))}`);
});
