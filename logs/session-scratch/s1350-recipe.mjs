#!/usr/bin/env node
// s1350 — inside the 557 MB the owner is asked to rule on, how much is IRREPLACEABLE
// recipe (json manifests / mjs generators / md run notes) versus regenerable output
// (png sheets / mp4 clips)? And how much of the recipe is genuinely at risk?
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const BASE = join(ROOT, 'worktrees/art/assets/motion-pilot');
const git = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const RECIPE = new Set(['.json', '.mjs', '.md', '.txt', '.yml', '.yaml']);

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
};

const known = new Set();
for (const ref of git(['for-each-ref', '--format=%(objectname)']).split('\n')) {
  try {
    for (const line of git(['ls-tree', '-r', ref]).split('\n')) {
      const m = /^\d+ blob ([0-9a-f]{40})\t/.exec(line);
      if (m) known.add(m[1]);
    }
  } catch { /* skip */ }
}

const recipe = [], output = [];
for (const abs of walk(BASE)) {
  const rel = abs.slice(BASE.length + 1);
  const size = statSync(abs).size;
  const atRisk = !known.has(git(['hash-object', abs]));
  (RECIPE.has(extname(abs)) ? recipe : output).push({ rel, size, atRisk });
}

const sum = (a) => a.reduce((s, r) => s + r.size, 0);
const mb = (n) => (n / 1048576).toFixed(3);
const rRisk = recipe.filter((r) => r.atRisk), oRisk = output.filter((r) => r.atRisk);

console.log(`RECIPE (json/mjs/md — cannot be regenerated from anything on disk)`);
console.log(`  total   ${recipe.length} files / ${mb(sum(recipe))} MB`);
console.log(`  AT RISK ${rRisk.length} files / ${mb(sum(rRisk))} MB`);
console.log(`\nOUTPUT (png/mp4 — regenerable from the recipe + the generator)`);
console.log(`  total   ${output.length} files / ${mb(sum(output))} MB`);
console.log(`  AT RISK ${oRisk.length} files / ${mb(sum(oRisk))} MB`);
console.log(`\nrecipe share of the at-risk hole, by bytes: ${(100 * sum(rRisk) / (sum(rRisk) + sum(oRisk))).toFixed(3)}%`);
console.log(`recipe share of the at-risk hole, by files: ${(100 * rRisk.length / (rRisk.length + oRisk.length)).toFixed(1)}%`);

console.log(`\nAT-RISK RECIPE FILES (first 25 of ${rRisk.length}):`);
for (const r of rRisk.slice(0, 25)) console.log(`  ${String(r.size).padStart(7)}  ${r.rel}`);
