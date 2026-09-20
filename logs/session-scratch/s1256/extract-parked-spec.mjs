#!/usr/bin/env node
// s1256 — extract the parked attempt-3 spec from its archive ref into scratch, by hash, no shell redirection.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const REF = 'archive/lane-m4-trail-guide-observed-beats:e2e/trail-guide-plain-boot.spec.ts';
const r = spawnSync('git', ['show', REF], { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
const out = resolve(here, 'parked-trail-guide-plain-boot.spec.ts');
writeFileSync(out, r.stdout);
console.log(`wrote ${out}\nbytes=${Buffer.byteLength(r.stdout)} sha256=${createHash('sha256').update(r.stdout).digest('hex').slice(0, 16)}`);
