#!/usr/bin/env node
// s1350 — verify the salvage actually LANDED on the remote, not just that push exited 0.
// (Big-pack pushes in this repo have reported success while the ref never appeared.)
import { execFileSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const git = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();

const BRANCH = 'save/art-staging-20260801';
const local = git(['rev-parse', BRANCH]);
const remote = git(['ls-remote', 'origin', BRANCH]);
const remoteSha = remote.split(/\s+/)[0] || '(absent)';
console.log(`local  ${BRANCH}  ${local}`);
console.log(`remote ${BRANCH}  ${remoteSha}`);
console.log(remoteSha === local ? '✓ MATCH — bytes are on the remote' : '✗ MISMATCH — push did NOT land');

// and confirm the 13 blobs are reachable from the REMOTE-TRACKING ref specifically
git(['fetch', 'origin', BRANCH, '--quiet']);
const tree = git(['ls-tree', '-r', 'FETCH_HEAD', '--name-only']);
const wanted = git(['diff', '--name-only', 'main', BRANCH]).split('\n').filter(Boolean);
const missing = wanted.filter((p) => !tree.split('\n').includes(p));
console.log(`\n${wanted.length} salvaged paths; missing from FETCH_HEAD: ${missing.length}`);
if (missing.length) console.log(missing.join('\n'));
