#!/usr/bin/env node
// s1205 — print the node-guards battery's REAL summary counts.
// Why this exists: s1205's first battery run reported rc=0 with an EMPTY count line,
// and "a probe that executes nothing reports zero" — an rc=0 over 0 tests is not a
// green. This dumps the last 30 lines so the 74/74 claim is read, not assumed.
import { spawnSync } from 'node:child_process';
const root = new URL('../../', import.meta.url).pathname.replace(/%20/g, ' ');
const r = spawnSync('npm', ['run', 'test:node-guards'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const all = `${r.stdout || ''}${r.stderr || ''}`;
console.log('--- last 30 lines ---');
console.log(all.trimEnd().split('\n').slice(-30).join('\n'));
console.log(`--- rc=${r.status} ---`);
