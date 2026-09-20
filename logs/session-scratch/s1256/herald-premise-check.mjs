#!/usr/bin/env node
// s1256 — AUDIT THE PREMISE OF THE MASTER THAT JUST RAN. s1255 authored GG-03e on a stated
// MEASURED fact: "it globs assets/processed/herald-engraving-*.webp and NO such file exists".
// The command it published as proof was `ls assets/processed/ | grep gazette` — a grep for the
// WRONG STRING. This re-runs both the published command and the question it was meant to answer.
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const git = (...a) => spawnSync('git', a, { cwd: repo, encoding: 'utf8' }).stdout;

console.log('=== s1255\'s published command, replayed verbatim ===');
console.log('$ ls assets/processed/ | grep gazette');
const all = readdirSync(resolve(repo, 'assets/processed'));
console.log(all.filter((f) => f.includes('gazette')).join('\n') || '(no match)');

console.log('\n=== the question that command was meant to answer ===');
console.log('$ ls assets/processed/herald-engraving-*');
const herald = all.filter((f) => f.startsWith('herald-engraving-')).sort();
for (const f of herald) {
  const s = statSync(resolve(repo, 'assets/processed', f));
  console.log(`  ${f}  ${s.size} B  mtime=${s.mtime.toISOString()}`);
}
console.log(`  -> ${herald.length} file(s) on disk`);

console.log('\n=== tracked on main? (working tree can lie; the tree object cannot) ===');
const tracked = git('ls-tree', '--name-only', 'main', 'assets/processed/')
  .split('\n').filter((l) => l.includes('herald-engraving-'));
for (const t of tracked) console.log('  ' + t);
console.log(`  -> ${tracked.length} tracked on main`);

console.log('\n=== which commit put them there ===');
if (tracked.length) {
  const first = tracked[0].trim();
  console.log(git('log', '--oneline', '-3', '--', first).trim());
}

console.log('\n=== the consumer, read rather than assumed ===');
const reader = spawnSync('sed', ['-n', '10,26p', resolve(repo, 'src/news/heraldReader.ts')], { encoding: 'utf8' });
console.log(reader.stdout);
