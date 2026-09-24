#!/usr/bin/env node
// s2677 — F-2676-1 repro/control, re-derived rather than inherited.
//
// Runs s2676's EXACT refused line against BOTH tools: the pre-cure source (taken from git,
// not from memory) and the cured working-tree source. The point of the pair is that a
// repro alone proves nothing about a cure, and a green cure alone proves nothing about the
// defect having been real.
//
// Usage: node artifacts/s2677/repro.mjs   (writes its transcript to stdout)

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PRIOR = 'Last updated: 2026-09-24T22:22Z s2676 handoff, lock CLEARED — the prior line.';
// s2676's sentence, verbatim in shape: the line's OWN stamp is a lawful {STAMP}; the future
// date is merely CITED, after the em-dash.
const LINE = 'ACTIVE {STAMP} (s2677 fire) — the next RT-01 mint is due after 2031-09-27T00:00Z.';

function stand(source, label) {
  const dir = mkdtempSync(join(tmpdir(), 's2677-repro-'));
  mkdirSync(join(dir, 'scripts'));
  const tool = join(dir, 'scripts', 'status-line1.mjs');
  writeFileSync(tool, source, 'utf8');
  const status = join(dir, 'STATUS.md');
  writeFileSync(status, [PRIOR, '', '- **s2675 handoff (line-1 archive):** old.', ''].join('\n'), 'utf8');
  const f = join(dir, 'new.txt');
  writeFileSync(f, LINE, 'utf8');

  const before = readFileSync(status, 'utf8');
  const r = spawnSync('node', [tool, 'set', f], { encoding: 'utf8', cwd: dir });
  const after = readFileSync(status, 'utf8');

  console.log(`--- ${label} ---`);
  console.log(`rc              : ${r.status}`);
  console.log(`stderr          : ${(r.stderr || '').trim() || '(none)'}`);
  console.log(`STATUS unchanged: ${before === after}`);
  console.log(`line 1 after    : ${after.split('\n')[0].slice(0, 120)}`);
  console.log();
  return r.status;
}

// PINNED, not HEAD. The first draft read HEAD:scripts/status-line1.mjs, which was pre-cure
// only until the cure was committed — after that this script would have compared the cured
// tool with itself and printed a green pair proving nothing. 2e653b003 is s2677's lock
// commit, the last one before the cure, and stays pre-cure forever.
const PRE_CURE_REF = '2e653b003:scripts/status-line1.mjs';
const preCure = execFileSync('git', ['show', PRE_CURE_REF], { encoding: 'utf8' });
const cured = readFileSync(new URL('../../scripts/status-line1.mjs', import.meta.url), 'utf8');

console.log('F-2676-1 — the defect and its cure, measured side by side');
console.log(`line under test : ${LINE}`);
console.log(`measured at     : ${execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim()}`);
console.log();

const rcPre = stand(preCure, `PRE-CURE (git show ${PRE_CURE_REF})`);
const rcPost = stand(cured, 'CURED (working tree)');

console.log(`VERDICT: pre-cure rc=${rcPre} (expected 1, the defect), cured rc=${rcPost} (expected 0).`);
if (rcPre !== 1 || rcPost !== 0) {
  console.log('UNEXPECTED — this transcript does not show the defect-and-cure pair it claims.');
  process.exit(1);
}
